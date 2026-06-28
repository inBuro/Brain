# Dynamic Focus — MIDI Learn & Parameter Architecture Validation

Design + validation of the layer that sits **on top of** the already-validated
Track Focus gate (see [RESEARCH.md](RESEARCH.md)): a configurable number of
virtual continuous controls that learn arbitrary MIDI CC, expose themselves as
automatable Live parameters, and are driven by a custom UI.

**Verdict: the architecture is viable and recommended.** One hard constraint
(Live parameters cannot be created at runtime) shapes the design but does not
block any planned feature. Details below.

---

## 0. The one constraint that drives everything

In Max for Live **automatable Live parameters can only be real `live.*` UI
objects that physically exist in the (frozen) patch.** You cannot spawn a new
automatable parameter at runtime from JS. Everything else follows from this:

- A "slot" must own a concrete `live.*` object → slots are **pre-allocated**, not
  created on demand.
- "Dynamic slot creation" (a future goal) is therefore implemented as
  *pre-allocate the maximum (e.g. 16), reveal/activate a subset* — not literal
  runtime creation.
- Custom JSUI is **not** a parameter; it is a view over the hidden `live.*` model.

Everything below is built around this fact.

---

## 1. Recommended internal architecture

Three decoupled layers per slot, plus one shared input bus:

```
                 ┌─────────────────────────────────────────────┐
  [midiin]──────►│  SHARED MIDI BUS  ([midiparse]/[ctlin])      │
                 │  + Track Focus gate (active=1 → pass)        │
                 └───────┬───────────────┬───────────────┬──────┘
                         │ (cc,val,ch)   │               │
            ┌────────────▼──────┐  ┌──────▼─────┐   ┌─────▼──────┐
            │      SLOT 1        │  │   SLOT 2   │ … │   SLOT N   │
            │ ┌───────────────┐  │  │            │   │            │
            │ │ Learn + Route │  │  │            │   │            │
            │ │   ([js])      │  │  │            │   │            │
            │ └──┬─────────▲──┘  │  │            │   │            │
            │    │ set     │ out │  │            │   │            │
            │ ┌──▼─────────┴──┐  │  │            │   │            │
            │ │  live.dial    │  │  │  MODEL = the Live parameter │
            │ │ (hidden param)│  │  │  (automatable, stored)      │
            │ └──┬─────────▲──┘  │  │            │   │            │
            │    │         │     │  │            │   │            │
            │ ┌──▼─────────┴──┐  │  │            │   │            │
            │ │   jsui (UI)   │  │  │  VIEW = custom mgraphics    │
            │ └───────────────┘  │  │            │   │            │
            │ ┌───────────────┐  │  │            │   │            │
            │ │ pattr (cc/ch)  │ │  │  PERSIST learned mapping    │
            │ └───────────────┘  │  │            │   │            │
            └────────────────────┘  └────────────┘   └────────────┘
```

**Per slot, three roles:**

| Role | Object | Why |
|---|---|---|
| **Model** (the parameter) | `live.dial` (parameter_enable = 1, *not* in Presentation) | The only thing Live automates/stores/maps. Hidden from the UI. |
| **View** (the UX) | `jsui` (mgraphics) | Draws name + value; the parameter does not define the look. |
| **Controller** (learn + route) | `[js]` | Arms Learn, captures CC, routes matching MIDI → the dial. |
| **Persistence** (mapping) | `pattr` | Stores learned CC# + channel across save/load. |

**One slot = one self-contained abstraction** (a `bpatcher`/`.maxpat` taking a
`#1` instance argument). Instantiate it 1/4/8/16 times. The shared MIDI bus fans
out to all instances; each instance filters for its own learned CC. A single
"who is arming Learn" arbiter prevents two slots learning the same incoming CC.

This is **MVC**: model (`live.dial`) ⟂ view (`jsui`) ⟂ controller (`[js]`). The
Live parameter is an implementation detail, exactly as required.

---

## 2. Recommended `live.*` parameter object

**Use `live.dial`** as the hidden backing parameter.

| Candidate | Automatable | Stored | Configure / Rack Macro | Footprint | Verdict |
|---|---|---|---|---|---|
| **`live.dial`** | ✅ | ✅ | ✅ | zero if kept out of Presentation | **Recommended** |
| `live.slider` | ✅ | ✅ | ✅ | same | Fine; identical capabilities, just slider art. Pick on taste. |
| `live.numbox` | ✅ | ✅ | ✅ | smallest native art | Good alt if you ever want it *visible* and compact. |
| `live.box` | — | — | — | — | Not a parameter object (no such automatable control). Reject. |
| `pattr` alone | ❌ | ✅ | ❌ | n/a | Persists but is **invisible to automation/Configure**. Cannot be the parameter. |

Why `live.dial`:

- It is a first-class **Live parameter** → shows up in **Configure**, is
  **automatable**, is **stored** with the set, and is **mappable to a Rack
  Macro** via the Rack's Map button — all for free.
- It has a clean numeric model (Float/Int, min/max/steps/unit) that the router
  writes to and the JSUI reads from.
- "Minimal visual footprint" is achieved by simply **not adding it to the
  Presentation view**: the parameter exists and automates, but the user never
  sees it — they see the `jsui`.

Range recommendation: **Float, 0.–1. normalized**, with steps configurable
(continuous by default). The router scales incoming CC (0–127) → 0–1; the JSUI
displays whatever unit/label the product wants. Normalized internal range keeps
the math identical for absolute CC, relative encoders, and 14-bit later.

> Key point: you **must** have one `live.*` object per parameter. There is no way
> to expose an automatable parameter without one. `pattr`/`dict` can store data
> but Live's automation and Configure only see `live.*` parameter objects.

---

## 3. MIDI Learn implementation approach

Per slot, owned by the slot's `[js]`:

**Capture**
1. User clicks the slot's Learn control (a `live.button` styled by JSUI, or a
   message) → js sets `arming = true` and tells the arbiter "slot N is arming"
   so other slots ignore the next CC.
2. Incoming CC arrives on the shared bus as `(ccNumber, value, channel)` (from
   `[midiparse]` or `[ctlin]`).
3. While `arming`, the **first** CC seen is captured: store `learnedCC`,
   `learnedChannel`; clear `arming`; notify arbiter.

**Route (steady state)**
1. Every incoming CC is matched against `learnedCC`/`learnedChannel`.
2. On match, **and only while the Track Focus gate `active = 1`**, scale
   `value 0–127 → 0.–1.` and `set` the slot's `live.dial`.
3. Use `set $1` semantics into the dial so the value updates and outputs for
   automation **without** creating a feedback loop with the JSUI (see §4).

**Notes**
- Capture uses `[ctlin]` (CC-only) for the PoC; broaden to `[midiparse]` if
  notes/pitchbend are wanted later — does not change the architecture.
- "Only one slot arms at a time" is enforced by the arbiter, so a single twist of
  a knob can't get learned by two slots.
- Learn does **not** depend on Track Focus (you can map while the track is
  selected); routing **does** respect the gate.

---

## 4. Custom UI synchronization approach

**Yes — a `jsui`/mgraphics control can fully stand in for the native UI.** It can
display the value and name, drive the hidden parameter, receive automation
updates, and stay synchronized. Pattern:

```
   user drags jsui ──(value)──► [js route] ──set──► live.dial ──┐
                                                                 │ (parameter
   live.dial ──(automation/route output)──► jsui.redraw ◄───────┘  moves)
```

- **jsui → dial (user interaction):** the JSUI's `onclick`/drag handler computes
  a normalized value and sends it to the `live.dial` via `set`. This updates the
  parameter and records automation.
- **dial → jsui (automation / MIDI / preset recall):** the `live.dial` outlet
  feeds the JSUI a value that **only redraws** (calls `mgraphics` repaint), it
  does **not** re-emit to the dial. Because the JSUI is fully scripted, you simply
  don't echo incoming values back out → no feedback loop, no `swap`/gate hacks
  needed.
- **Name + value display:** JSUI draws both from script state (name is a slot
  attribute; value is the latest normalized value).
- **Sync guarantee:** the `live.dial` is the single source of truth. Anything that
  moves it (user, automation, MIDI route, preset load) flows out its one outlet to
  the JSUI, so the view can never drift from the model.

This is exactly the decoupling the task asks for: the parameter is the model, the
JSUI is the only thing the user experiences, large custom UI is unconstrained.

---

## 5. Multiple-slot architecture (1 / 4 / 8 / 16)

**One slot = one `bpatcher` abstraction with a `#1` instance argument.** No code
duplication: the slot patch is authored once; N copies are instantiated.

- The `#1` arg gives each instance a **unique parameter Long/Short Name**
  (`Slot #1` → `Slot 1`, `Slot 2`, …). Distinct names are required or Live treats
  them as the same parameter.
- The slot's JSUI, `live.dial`, `[js]`, and `pattr` all live inside the
  abstraction → adding slots = adding `bpatcher` instances, nothing else.
- **Shared MIDI bus** fans out to every instance; each filters its own CC. (A
  central router that holds a CC→slot table is an alternative, but per-slot
  filtering is simpler and 16 integer comparisons per message is free.)
- **Learn arbiter** is one shared object (a `[js]` or `value`/`pv`) that holds
  "which slot is currently arming."

Scaling table:

| Slots | Cost |
|---|---|
| 1 | trivial |
| 4 | 4 bpatchers |
| 8 | 8 bpatchers |
| 16 | 16 bpatchers; 16 parameters in Configure (manageable) |

**Pre-allocation strategy for "dynamic" counts:** build the device at the max
slot count (e.g. 16), and show/enable only the first *k* in the UI. Because params
can't be created at runtime, this is the idiomatic way to offer "1/4/8/16" — one
device, configurable visible count, unused slots dormant (their gate closed, JSUI
hidden).

---

## 6. State persistence strategy

| State | Mechanism | Survives save/load |
|---|---|---|
| **Parameter value** (the control's position) | `live.dial` is a Live parameter | ✅ automatic — Live stores/restores parameter values with the set |
| **Learned CC# + channel** | `pattr` (one per slot, or one `pattr` holding a dict of all mappings) | ✅ — `pattr` values are saved inside the device's state in the Live set |
| **UI state** | none needed | ✅ derived — JSUI redraws from the restored parameter value + restored mapping |

Strategy:

1. **Values** come for free from the `live.dial` parameter mechanism. Set
   `parameter_enable = 1` and an initial-value/enable so the value is part of the
   stored parameter.
2. **Mappings** (`learnedCC`, `learnedChannel`, later: mode/pickup) are *not*
   parameters → persist them with **`pattr`**. On device load, each slot's `[js]`
   reads its `pattr` back and re-arms the route. A single `pattr` holding a
   dict/list scales cleanly to 16 slots and keeps all mapping state in one place.
3. **Fallback if `pattr` proves flaky in M4L:** piggyback persistence on the
   parameter system — store the learned CC# in a *hidden* `live.numbox`
   (parameter_enable = 1, kept out of Presentation). It then persists for free
   like any parameter. Costs one extra entry in the parameter list per slot, so
   `pattr` is preferred; this is the safety net.

> **To verify empirically** (this is the riskiest persistence claim): that a
> `pattr`-stored CC mapping reliably round-trips through Live Set save → close →
> reopen. The PoC validates exactly this.

---

## 7. Future compatibility (verify, do not implement)

| Future feature | Blocked? | Where it lives |
|---|---|---|
| **Pickup mode** | No | Router `[js]`: compare incoming value to current param, only "grab" on cross. Pure routing logic; model/view unchanged. |
| **Relative encoders** | No | Router detects relative format (e.g. 1/127, 64±), accumulates into the normalized value. Param unchanged. |
| **Absolute encoders** | No | The default path (scale 0–127 → 0–1). Already supported. |
| **Dynamic slot creation** | Not blocked, but constrained | Can't create params at runtime → pre-allocate max, reveal subset (§5). The only design compromise, and it's invisible to the user. |
| **Large custom UI** | No | JSUI is decoupled from the parameter; it can grow arbitrarily without touching model/persistence. |

All five are additive changes inside the **router `[js]`** or the **JSUI**, never
in the parameter/persistence contract. The architecture does not block them.

---

## 8. Risks & limitations

1. **No runtime parameter creation** (the §0 constraint). Mitigation:
   pre-allocate max slots. Real but fully manageable.
2. **`pattr` persistence gotchas in M4L** — must be correctly scoped to the device
   and stored. Highest-risk item → validated first in the PoC; hidden-`live.numbox`
   fallback documented.
3. **JSUI ↔ dial feedback loops** if the JSUI naively echoes incoming values.
   Mitigation: incoming values only redraw, never re-emit (§4).
4. **Configure clutter** at high slot counts (16 params, +1 each if using the
   numbox-persistence fallback). Cosmetic; name them clearly (`Slot 1…16`).
5. **Unique parameter naming** via the `#1` bpatcher arg — if names collide, Live
   merges parameters. Must verify each instance gets a distinct Long Name.
6. **Learn arbitration** — without a central "who's arming" guard, one knob twist
   could be learned by multiple armed slots. Mitigation: single-arm arbiter.
7. **Freezing** — when packaging for release, all JS/JSUI scripts and the slot
   abstraction must freeze cleanly. (Note from prior PoC: build/test **unfrozen**;
   freeze only as a verified release step.)

---

## 9. Recommended implementation order

Each step is independently testable in Live; stop and verify before the next.

1. **Backing parameter.** One `live.dial`, parameter_enable = 1, kept out of
   Presentation. Verify it is **automatable**, **stored**, appears in
   **Configure**, and is **mappable to a Rack Macro**. (Smallest possible proof.)
2. **MIDI Learn (1 slot).** `[ctlin]` capture → store CC/ch in `[js]` → route
   matching CC → `set` the dial. Verify a learned knob drives the parameter.
3. **Persistence.** Add `pattr` for the mapping. Save the set, reopen, confirm the
   learned CC still drives the dial and the value restored. (Riskiest claim.)
4. **Custom UI.** Add a minimal `jsui` (name + value bar) bound bidirectionally to
   the dial. Verify automation moves the UI and the UI moves the parameter, no
   feedback.
5. **Abstraction.** Wrap slot = `bpatcher` with `#1` arg. Verify a single instance
   still works and gets a unique parameter name.
6. **Scale.** Instantiate 4 → 8 → 16. Add shared MIDI fan-out + learn arbiter.
   Verify independent slots, distinct params, negligible CPU.
7. **Future-proofing check.** Confirm pickup/relative/large-UI hooks have a clear
   home in the router/JSUI without touching the parameter contract.

---

## 10. Summary recommendation

Build the slot as **MVC**: `live.dial` (hidden model) + `jsui` (view) + `[js]`
(learn/route controller) + `pattr` (mapping persistence), packaged as a **`#1`
bpatcher abstraction** and pre-allocated to the max slot count. This satisfies
every functional requirement, persists correctly, keeps the parameter as a pure
implementation detail, and leaves every listed future feature open. Validate in
the order above; the `pattr` round-trip is the one claim worth proving with a
running PoC before committing.
