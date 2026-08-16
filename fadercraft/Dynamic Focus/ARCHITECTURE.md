  созданные персоны на недавнем шаге, персоны агентов, которые лежат. Я, честно сказать, не знаю, где они лежат. Я вижу только Эйблтон продюсера должны быть файлики для каждого из агентов. Нужно положить также в папку мета.в которой лежит этот файл.нс в папку Брэйн.# Dynamic Focus — System Architecture

How the pieces fit together. Not UI — the system: device types, responsibilities,
data flow, state. Builds on the two validated layers: [Track Focus](RESEARCH.md)
and [MIDI Learn / parameters](RESEARCH-midi-learn.md).

---

## The one constraint that shapes everything

Ableton hard limits:
- A **MIDI Effect** can only live on **MIDI tracks**.
- An **audio track has no MIDI input** — no device on it can receive a controller's
  CC through the track, ever.

So "one device per track, each grabs its own MIDI" works **only on MIDI tracks**.
To support **any** track type we must separate *receiving MIDI* from *reacting to
the selected track*. That separation is the whole architecture.

---

## Two device types

### 1. `DF Input` — the MIDI ingest (place ONE)
- **Type:** MIDI Effect, lives on one MIDI track (a dedicated "control" track, or any
  MIDI track the controller feeds). Monitor = In on this track only.
- **Job:**
  - `midiin → midiout` — **passthrough**, so the host track's instrument still plays.
  - `midiin →` parse CC `→ send` onto a **global bus** (`send fc_df_cc`).
- **It is the only device that touches raw MIDI.** Tiny, almost no UI.

### 2. `DF Slot` — the per-track control (place MANY, on ANY track)
- **Type:** Audio Effect → lives on audio **and** MIDI tracks alike.
- **Job (per slot):**
  - `receive fc_df_cc` — gets CC from the bus, not from its track.
  - **Track Focus** — knows if its host track is the selected one (Live API).
  - **MIDI Learn** — capture a CC while armed.
  - **Model** — `live.dial` (hidden automatable parameter) holds the value.
  - **Map** (next phase) — drive a target parameter on this track via the LFO-style
    Map pattern.
  - **Persistence** — `pattr` for the learned CC; Live stores the dial value.

Each `DF Slot` is independent: no slot talks to another. The only shared thing is the
CC bus. **Per-track intelligence stays per-track** — exactly the model we validated.

---

## Data flow (the full journey)

```
   Hardware controller
        │ MIDI (CC)
        ▼
 ┌──────────────────────────────────────────────┐
 │ DF Input  (MIDI Effect, 1× on a MIDI track)   │
 │   midiin ─────────────► midiout   (passthru)  │
 │   midiin ─► parse CC ─► send "fc_df_cc"        │
 └───────────────────────┬───────────────────────┘
                         │  global bus (within the Live set)
        ┌────────────────┼────────────────┬───────────────┐
        ▼                ▼                ▼               ▼
 ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   (any track type)
 │ DF Slot  A  │  │ DF Slot  B  │  │ DF Slot  C  │
 │ receive bus │  │ receive bus │  │ receive bus │
 │     │       │  │             │  │             │
 │  Track Focus│  │ Track Focus │  │ Track Focus │  ← "am I the selected track?"
 │   selected? │  │  selected?  │  │  selected?  │
 │   no → drop │  │  yes → ACT  │  │   no → drop │  ← only ONE acts: signal separated
 │     │       │  │      │      │  │             │
 │  learn/route│  │ learn/route │  │             │
 │     ▼       │  │      ▼      │  │             │
 │  live.dial  │  │  live.dial  │  │  live.dial  │  ← each holds its OWN value
 │     ▼       │  │      ▼      │  │             │
 │ (Map→target │  │ (Map→target │  │             │  ← next phase
 │  param on A)│  │  param on B)│  │             │
 └─────────────┘  └─────────────┘  └─────────────┘
```

**Read it as:** every Slot hears the same CC; only the Slot on the **selected** track
acts; that Slot moves its own parameter; that parameter (next phase) drives a real
target on its own track. Switch tracks → the active Slot changes → the same physical
knob now controls a different track. Each Slot remembers its own value.

---

## Why this satisfies the three goals

| Goal | How |
|---|---|
| **Works on any track type** | Slots are Audio Effects fed by the bus, not by track MIDI. Audio tracks included. |
| **MIDI passes through** | Only `DF Input` touches MIDI, and it does `midiin → midiout` straight through. |
| **"Turn IN off everywhere"** (your instinct) | Monitor = In sits on the single `DF Input` track only. Slots need no monitoring. |
| **Signal separated by focus** | All slots receive the bus; the Track Focus gate lets only the selected one act. |
| **No central *logic* manager** | The shared piece is a dumb CC rebroadcaster. All decisions stay per-slot. |

---

## State & persistence

| State | Lives in | Survives save/load |
|---|---|---|
| Learned CC (+channel) | `pattr` in each Slot | ✅ (validated) |
| Parameter value | `live.dial` (Live parameter) | ✅ per instance |
| Map target (next phase) | stored parameter id in Slot | ✅ planned |
| Bus name | constant (`fc_df_cc`) | n/a |

---

## The bus

- Max `send fc_df_cc` / `receive fc_df_cc` — a **plain global** name, so it reaches
  every device in the Live set (the `---` prefix would scope it per-device, which we
  do *not* want here).
- Payload: `[cc, value, channel]`.
- Distinctive prefix (`fc_`) avoids collisions with other M4L devices.

---

## Scaling 1 / 4 / 8 / 16 slots

- A slot = one `bpatcher` abstraction with a `#1` instance arg → unique parameter
  names (`Slot 1…16`), no duplicated code.
- One `DF Slot` device pre-allocates the max count and shows a chosen subset
  (parameters can't be created at runtime — §0 of the MIDI-Learn doc).

---

## Setup flow (what the user does — non-visual)

1. Drop **one `DF Input`** on a MIDI track; set that track's MIDI From = controller,
   Monitor = In. (Everything else stays IN-off.)
2. Drop **`DF Slot`** on any tracks you want to control (audio or MIDI).
3. On a Slot: click **Learn**, twist an encoder → captured.
4. (Next phase) click **Map**, click a target parameter → bound.
5. **Select a track** → its Slot goes active → the encoder controls that track.
   Switch tracks → same knob, different target. Each remembers its value.

---

## Status

| Piece | State |
|---|---|
| Track Focus gate | ✅ validated |
| MIDI Learn + live.dial param + pattr persistence | ✅ validated (single device) |
| Focus-gated routing (only selected acts) | ✅ in `midi_learn_slot.js` |
| `DF Input` + global bus + audio-effect Slot | ✅ shipped (v1.1) |
| Map → target parameter (LFO-style) | ✅ shipped (v1.1) — see Multimap Panel below |
| Multi-slot bpatcher abstraction | ✅ shipped — `multimapDF.maxpat`, 8 slots |
| Main↔Slot8 map linking | ✅ shipped, self-restore bug found and fixed 2026-08-09 — see below |
| Custom UI | ⬜ last (out of current scope) |

---

## Multimap Panel — what actually shipped (post-MVP)

The single-slot MVP above became an 8-slot **panel** per `DF Slot`, plus the
device-face **main Map button** (`df_mapparam`). Both the main button and each
of the 8 panel rows are separate instances of the shared bpatcher
**`MapButtonTint.maxpat`** — a themed clone of Live's native LFO-style map
button, one component reused 9× per device (main + `bpslot0..bpslot7`).

Key files (all live in `~/Music/Ableton/User Library/Max Devices/`, and are
**shadow-copied** in the Max Project folder — see "JS caching gotcha" below):
- `Dynamic Focus Slot.amxd` — the shipped device (main button + 8-slot panel bpatcher)
- `MapButtonTint.maxpat` — **shared** map-button component (main + all 8 slots use the same file)
- `multimapDF.maxpat` — the 8-slot panel container (DF-specific fork of Live's stock multimap)
- `midi_learn_slot.js` — the device's JS brain (CC learn, byname persistence, main↔slot8 sync)

### MapButtonTint state machine (per-instance)

Each `MapButtonTint` instance tracks its own map state via two key objects:
- **`it_mflag`** — "is this bound to a real parameter" flag, normally driven by
  `RangeAndName` which only fires when the instance has a genuine `live.remote~`
  bind (real click-to-map via the UI).
- **`it_mapstore`** — feeds the color/paint state machine. `state = 0` (grey,
  unmapped) / `1` (armed, mid-map) / `2` (amber, mapped).
- Color repaint fans out through **`it_refbang → obj-39`** (the state-machine
  path, drives blink during arm) and, separately, a **direct path
  `obj-14 → obj-39`** fed by Live's global `live.path live_set view
  selected_parameter` watcher (this is what caused the "neighbor's active
  mapping darkens my button" bug below — it fires on EVERY parameter click
  anywhere in the panel, not just once).
- **`exclusiveArm`**: when any slot is armed, Live broadcasts `s ---mapOff` to
  all slots via `r ---mapOff`. This routes into each instance's
  `RangeAndName inlet 3 → it_mflag`, momentarily forcing mflag to 0. A real
  bind self-corrects instantly (its own `live.remote~` re-fires a valid id
  faster than one render frame). An instance with **no real bind** (see
  Scenario B) has nothing to re-fire it, so the dark state sticks.

### The hard Ableton constraint: one parameter, one controller

**Live will not let two `live.remote~` objects bind to the same parameter at
once** — the native error is exactly `"Mapping unsuccessful: A parameter
cannot be controlled by more than one controlling device"`. This is not a bug
in our code; it's a platform limit. It means: **only one of (main button,
panel slot 8) can ever hold a real bind on the same target parameter.**

This defines two scenarios for the main↔slot8 linking feature:

- **Scenario A — real bind via panel (slot8 → main):** user clicks Map
  directly in the panel row (bpslot7) and picks a parameter. This is a
  genuine `live.remote~` bind on that instance — RangeAndName fires natively,
  name/color/range all populate for free. JS just reads the resulting id
  (`mm_tgt_7`) and mirrors it to the main button (visual only, no second
  bind on the main button's own `live.remote~`... actually main button's own
  `df_mapparam` DOES get a real bind here too, since nothing stops binding
  the main button's live.remote~ separately — it's the same parameter,
  bound twice on two DIFFERENT MapButtonTint instances only works because
  the main button in this direction is driven the normal way, not
  programmatically).
- **Scenario B — visual mirror via main (main → slot8):** user maps via the
  main button. Slot 8 in the panel CANNOT get a second real `live.remote~`
  bind on the same parameter (Live forbids it). So slot 8 can only ever be a
  **JS-driven visual mirror**: amber color + parameter name (fetched via
  `LiveAPI.get("name")` by id, no bind needed) pushed directly via
  `message()` calls to the `live.text` object. It has no `it_mflag=1` from a
  real bind, so **no unmap "✕" button appears on it in this direction** —
  that's an inherent limit, not a bug to keep chasing.

### Known trap: `maxclass: "change"` vs `"newobj"`

Inline objects created programmatically inside a `.maxpat` JSON must use
`"maxclass": "newobj"` with `"text": "change"` (or whatever object name) —
**not** `"maxclass": "change"` directly. The latter isn't a real maxclass;
Max silently fails to instantiate the box and deletes both patchcords
touching it on load, logging `patchcord destination/source not found:
deleting patchcord` in the console. Cost us a full debug cycle before we
compared against a working sibling object (`it_ltchg`) and spotted the
mismatch.

### JS/patch file caching gotcha (cost hours)

Max resolves `.js`/`.maxpat` filenames via its **search path**, and a Max
Project folder can **shadow** the User Library copy silently. We had
`~/Documents/Max 9/Max for Live Devices/Dynamic Focus Slot Project/code/
midi_learn_slot.js` taking priority over
`~/Music/Ableton/User Library/Max Devices/midi_learn_slot.js` — every edit to
the "real" file was loading into nothing, because Live was running the stale
Project-folder copy the whole time. Confirmed via a unique load-time
`post()` marker string that only appeared once all copies were synced.
**Lesson: when a JS edit "does nothing" despite a confirmed-correct diff and
a device reload, suspect a shadow copy before suspecting the logic.** Also:
Max caches the compiled `js` object in memory per session — removing/re-adding
the device on a track is *not* always enough to force a reload; a full Live
restart (or closing the file in the Max editor unsaved, then reload) is the
reliable way.

### Frozen vs unfrozen devices — why edits are safe mid-release

A **frozen** `.amxd` (the shipped/released state, e.g. the file on Gumroad)
embeds a full JSON snapshot of the patcher **inside itself** at freeze time.
It does **not** read external `.maxpat`/`.js` files at runtime. So editing
`MapButtonTint.maxpat` or `midi_learn_slot.js` on disk, post-freeze, **cannot
retroactively affect an already-frozen, already-shipped device** — safe to
iterate on a separate `*.DEV.amxd` (unfrozen, references external files)
without risk to production. Verify safety by comparing the frozen file's
mtime/md5 against the timestamp of the risky edit, not by assumption.

### MapButtonTint blink mechanism — how it actually works

**Two independent blink paths, one per mode:**

**STANDARD mode** (`colorMode=0` in the JS, mode inlet=1 into MapButtonTint):
- `p setButtonColor` (obj-39) is the blink engine. It has a `qmetro 200` that fires every 200 ms → `toggle` flips 0/1 → alternates between `lcdcolor R G B 0.5` (dim) and `lcdcolor R G B 1.0` (bright), where R/G/B come from the Live theme `lcd_control_fg` color.
- The qmetro starts when `p setButtonColor` inlet 0 receives `1` (arm signal) and stops when it receives `0` (idle) **or** when inlet 4 fires (parameter mapped, id≠0).
- After the first mapping, the internal `switch` inside `p setButtonColor` stays at position 2 (the "mapped" channel); qmetro output is the same alternating lcdcolor regardless of switch position.
- The blink reaches `live.text` via: `p setButtonColor → it_dg (gate) → it_rt (route lcdcolor) → nb_pp (prepend) → nb_g (gate) → deferlow → obj-14`. `nb_g` is OPEN only in STANDARD mode (controlled by `it_isstd`).

**FOLLOW mode** (`colorMode=1`, mode inlet=0):
- The blink comes from the **state machine**, not from `p setButtonColor`. `arm_metro (200 ms) → it_phase (counter 0 1) → it_phtrig → it_state` — the phase counter alternates 0/1 which changes the state expression result between 1 (armed colors = dark bg) and 2 (mapped colors = amber bg) every 200 ms.
- `nb_g` is CLOSED in FOLLOW mode, so the `p setButtonColor` qmetro path is irrelevant.
- No `it_dg` gating involved — state machine writes colors directly to `obj-14`.

**Two `live.text 'Map'` objects:**
- `obj-9` (`varname: border`, `ignoreclick: 1`) — purely visual frame, receives only `bordercolor` attribute messages. Has no outlet connections. Not clickable.
- `obj-14` (`varname: live.text`, clickable) — the real button: all color state changes go here, and its outlet 0 drives everything (arm_mg, state machine, p mapping, lt_c2, etc.).

### Root cause: second-arm blink failure in STANDARD mode (fixed 2026-08-08, v14)

`it_dgc = expr ($i1==0)&&!($i2&&$i3)` where `$i1`=state, `$i2`=it_isstd (STANDARD mode flag), `$i3`=it_mflag (mapped flag). After the first mapping, `it_mflag=1` persists. In STANDARD mode: state is always 0 (because `$i4=it_isf=0` in STANDARD collapses the state expression to 0). So `it_dgc = (0==0)&&!(1&&1) = 0` — gate permanently CLOSED after first mapping. `p setButtonColor` qmetro restarts correctly on the second arm (arm signal to inlet 0) but its output is blocked by `it_dg`.

**Bad fix (reverted):** changing `it_dgc` expr to include `$i4` (live.text value) also opened `it_zg` (the amber lcdcolor gate) during arm/unarm transitions, causing spurious amber flashes on all panel slots. Reverted immediately.

**Correct fix (v14, MapButtonTint `b74b54be`, 132 boxes/227 lines):** added a new `it_dgc2 = expr ($i1)||($i2)` object. `it_dgc` remains unchanged (controls `it_zctl` and `it_ctctl`). `it_dg` gate is now driven by `it_dgc2` instead of `it_dgc` directly. Wiring: `it_dgc[0] → it_dgc2[0]` ($i1), `obj-14[0] → it_dgc2[1]` ($i2 = live.text arm value). When armed (live.text=1): $i2=1 → `it_dgc2=1` → `it_dg` OPEN → blink flows. When idle (live.text=0): `it_dgc2 = it_dgc` → original behavior. `it_zg` and `it_ctctl` paths are untouched.

### X button on panel slot 8 (bpslot7) — wired 2026-08-08, v14

Signal path for the X button click (unmap from panel):
`obj-28 (X btn, MapButtonTint) outlet 0 → xt_out (new outlet 2) → bpslot7[2] (multimapDF) → xt_mm_out (new outlet 3) → mm_panel[3] (DEV amxd) → obj-4 inlet 11 → JS inlet 11 handler`.

JS inlet 11: resets main `live.text` (MapButtonTint) to 0, sends `outlet(12, 0)` (unbinds `live.remote~`), calls `unmap()`. `_updateMapBtnVisibility()` shows/hides the X button (`live.text[1]`, varname in MapButtonTint) based on `mm_tgt_7 > 0`.

### Keep-alive arm-state masking bug (fixed 2026-08-08, v16)

**Symptom:** after mapping bpslot7 via Page B (or any already-mapped panel slot), clicking the Map button to re-arm appears to do nothing — the slot immediately "restores" the amber/mapped appearance without letting the user pick a new parameter.

**Root cause — two separate paint paths ignore armed state:**

1. **`_s7kaFn` (FOLLOW mode, bpslot7 only):** keep-alive Task fires every 100 ms and writes amber `lcdbgcolor/bordercolor/lcdcolor` directly to bpslot7's `live.text` object. It did not check `live.text.getvalueof()` (the arm flag). When the user clicks Map (live.text → 1, blink starts at 200 ms interval), the keep-alive fires within 100 ms and overrides the blink with amber. From the user's perspective: click Map → amber holds → looks like "mapping restored itself." 100 ms >> 0 so the keep-alive wins every blink cycle.

2. **`_updateMapBtnVisibility()` — STANDARD mode and FOLLOW/si=7 amber paint blocks:** these blocks iterate all panel slots (and main slot) and write amber whenever `mm_tgt_N > 0` (slot is mapped). They did not check whether the slot was currently armed. If any external event triggered `_updateMapBtnVisibility()` while a slot was armed (e.g., a concurrent slot mapping), the arm-blink would be overridden with amber.

**Fix (v16) — arm-state guard before every amber paint:** added `Math.round(btn.getvalueof()) !== 1` check to four places:
- `_s7kaFn`: `if (Math.round(kaBtn.getvalueof()) === 1) return;` — skip entire paint cycle while bpslot7 is armed
- `_updateMapBtnVisibility` — STANDARD mode main slot: `if (mainBtn && Math.round(mainBtn.getvalueof()) !== 1)`
- `_updateMapBtnVisibility` — STANDARD mode panel loop (all si): `if (slotBtn && Math.round(slotBtn.getvalueof()) !== 1)`
- `_updateMapBtnVisibility` — FOLLOW mode si=7: `if (slotBtn7 && Math.round(slotBtn7.getvalueof()) !== 1)`

**Invariant maintained:** when `live.text = 0` (idle or mapped-not-armed), all paint paths behave exactly as before. When `live.text = 1` (armed): amber paint is suppressed, the MapButtonTint state machine runs normally (FOLLOW: arm_metro 200 ms blink; STANDARD: it_dgc2 fix from v14 keeps it_dg open). After the user picks a new parameter, `live.text` resets to 0 (native multimap clears arm state on bind), the guard passes, and amber resumes on the next paint trigger.

**JS v16 md5:** `aba7f8a1ec1ae0b8ba165c8b872ce652` (all 4 copies synced). Archive: `_device-backups/midi_learn_slot.2026-08-08-205850.js` (v15, `ab8ffbc033c29e511106854d164446f2`).

### Version-check URL — lives on the server, not in the device

The in-device update checker (`node.script`, logs `version check: device=X
latest=Y (ok) url=...`) does **not** have the changelog URL hardcoded in the
`.amxd`. It hits a static JSON file hosted on the site:
- Control XL (older/singular scheme): `fadercraft.com/api/version.json` → `{latest, url, changelog, min_compatible}`
- Dynamic Focus / Sends Follower (newer/plural scheme): `fadercraft.com/api/versions.json` → keyed by `DEVICE_KEY` (`dynamic_focus`, `sends_follower_track`, etc.), same shape per key.
Renaming the changelog page on the site only requires updating the `url`
field in these JSON files — **no device re-release needed**, existing
installs pick up the new link on their next periodic ping (~30 min).

---

## Autonomous rebind cycle — diagnostic findings (2026-08-08)

### Observed behaviour
After mapping a parameter (page A, main slot), a second identical rebind cycle fires autonomously at ~218 seconds: `_doRebind() enter → outlet(12) → onTargetId tgtIdParam.set`. Immediately before: `byname capture: dev=0` + multiple `'CcControlDevice' object has no attribute 'canonical_parent'` errors.

### Confirmed (JS analysis)

- `byname capture` is printed by `_captureByNameFromId` (line ~1430), called exclusively from `onTargetId` when `id > 0 AND id !== _lastWrittenTgtId`.
- The CcControlDevice errors are **non-fatal Live API warnings** (not JS exceptions) produced by `dd.get("name")` on a CcControlDevice object in `trackApi.get("devices")`. Live internally tries to access `canonical_parent` on CcControlDevice, which doesn't exist, prints the warning, and returns `0`.
- `devName = "0"` (CcControlDevice "name") → `_captureByNameFromId` was calling `_pushByNameData("0", ...)` — **corrupting the stored byname data**. Fixed in v18.
- `_captureByNameFromId` does NOT directly cause `_doRebind` / `outlet(12)` / TgtId write. These come from the `tgtIdObserver` triggered by `onTargetId`'s `tgtIdParam.set` call.
- The 218-second interval is **NOT a hardcoded JS timer**. No `schedule(218000)` or `interval` of that value exists in the JS.

### Unresolved: trigger source
What calls `onTargetId(X)` with `X !== _lastWrittenTgtId` after 218 seconds is unknown from JS alone. Candidates:
1. Inlet 9 receives an id from the patcher (obj-46 or something connected to it fires spontaneously)
2. `panelmap()` fires when `mm_tgt_7` numbox gets a value (from Live's internal pattr restore or autosave) that differs from `_panelPrevTgts[7]`
3. Live's pattr/snapshot mechanism re-broadcasts DeviceParameter values after some internal interval

**Next step to confirm:** unpack DEV amxd, inspect what is wired to JS inlet 9 and what can fire `panelmap` message to JS without user interaction.

### Fix applied (v18, 2026-08-08, md5 `2ec3d650`)
- `_captureByNameFromId`: abort if `devName === "0"` or empty (prevents byname corruption)
- `_captureByNameFromId` loop: per-iteration try-catch on `dd.get("name")` (CcControlDevice safe)
- `_captureSlotBn`: same guard + try-catch
- `_resolveByNameOnHostTrack` loop: per-iteration try-catch
- `_resolvePanelSlotsOnHostTrack` loop: per-iteration try-catch
- v17 TGT-DBG markers retained (10 total) for continued tracing

---

## Root cause: stale tgtIdObserver notification (confirmed 2026-08-08)

Three independent diagnostics converged on one mechanism.

### The race condition

`tgtIdObserver` is the **sole path** that schedules `_doRebind()` in response to a TgtId parameter value change. Its callback does:

```
id = round(parse(args[1]))          // value from Live notification
_pendingRebindId = id
t = new Task(_doRebind)
t.schedule(0)                       // runs in next event cycle
```

`unmap()` cancels `_rebindTask` and clears `_pendingRebindId`. This works correctly when the Task is **already in the queue** at the time `unmap()` runs. It **fails** when:

1. User calls `unmap()` (writes TgtId=0, cancels any queued Task, clears `_pendingRebindId`).
2. Live's notification queue holds a **stale delivery of the old id** (TgtId=previous value).  
   Live can buffer parameter notifications internally; delivery delay is variable — milliseconds to several minutes.
3. The stale notification arrives **after** `unmap()` has returned.
4. `tgtIdObserver` callback fires with `args[1] = old_id > 0`.
5. Callback sets `_pendingRebindId = old_id` and creates a new Task.
6. `unmap()`'s cancellation already ran and cannot reach this newly created Task.
7. `_doRebind()` fires `outlet(12, old_id)` — the mapping returns autonomously.

The ~218-second timing observed in the wild is consistent with Live's internal pattr / autosave interval broadcasting stored parameter values back through the notification system.

### Why earlier guards did not catch it

- `_pendingRebindId = 0` in `unmap()`: cleared, but the stale callback **overwrites it** to the old id.
- `_rebindTask.cancel()` in `unmap()`: only cancels tasks that **exist at that moment**.
- `_lastWrittenTgtId` guard in `onTargetId()`: only prevents writing the same id twice via `tgtIdParam.set`, does not affect the observer path.
- v18 CcControlDevice guard: prevents byname data corruption, does not address the rebind trigger.

### Fix applied (v19, 2026-08-08, md5 `1852efe0`)

Added a current-value verification at the start of `_doRebind()`, immediately after the `rid <= 0` early-exit:

```javascript
if (tgtIdParam) {
    try {
        var _curTgt = Math.round(parseFloat(tgtIdParam.get("value")));
        if (_curTgt !== rid) {
            post("TGT-DBG: _doRebind STALE rid=" + rid + " curTgt=" + _curTgt + " ABORTED ...\n");
            _pendingRebindId = 0;
            return;
        }
    } catch(e) {}
}
```

Reads TgtId parameter live at execution time. If the value has changed since the Task was created (e.g., `unmap()` wrote 0), `_curTgt !== rid` and the rebind is aborted. **Fail-open:** if `tgtIdParam` is null (first-map during init before `_findOwnParams()` runs), the check is skipped and the rebind proceeds normally.

TGT-DBG console markers remain active for post-fix tracing. The stale-abort path is logged as `_doRebind STALE`.

### Test protocol

1. Load DEV amxd on a track. Reload device (remove + re-add, or trigger `live.thisdevice`).
2. Map a parameter via the main Map button (page A).
3. Open the panel (page B). Unmap via the X button or the Map button on the slot.
4. Wait 2-3 minutes without interaction.
5. Expected: mapping does NOT return. Console shows `_doRebind STALE rid=<id> curTgt=0 ABORTED` if the late notification arrives.
6. If mapping returns: check console for `_doRebind outlet(12)` — if present, a new code path delivers the trigger (not the tgtIdObserver). Inspect inlet 9 wiring in the amxd patcher.

---

## Patcher-level fix: live.observer detach on unmap (2026-08-08)

### The problem inside RangeAndName (MapButtonTint.maxpat obj-16)

Inside the inline sub-patcher `patcher RangeAndName` (obj-16) in MapButtonTint.maxpat, `live.observer` (obj-5) is subscribed to the "id" property of the currently mapped parameter. The subscription path is set when a valid id arrives at inlet obj-51:

```
obj-51 → obj-18 (t l b):
  outlet 1 (b) → obj-25 "property id" → live.observer inlet 0  [sets property]
  outlet 0 (N) → live.observer inlet 1                          [sets path to object N]
```

When unmap (id=0) arrives at obj-51, the same chain fires with N=0. However, sending the raw number `0` to live.observer inlet 1 does **not** properly disconnect the observer from the previously-subscribed parameter. Live.observer retains the old subscription, and when Live's notification system delivers a deferred update for that parameter (timing: milliseconds to several minutes, ~218 s observed), the observer fires autonomously. The output propagates through:

```
obj-5[0] → substitute 0 (obj-24) → deferlow (obj-28) → t b (obj-15) → getid (obj-37)
  → live.object (obj-130) → route id (obj-133) outlet 3
  → sel 0 (obj-31) outlet 1 (id > 0)
  → ran_idout → JS inlet 9 → onTargetId → _doRebind → outlet(12, old_id)
```

This is the patcher-side trigger of the autonomous rebind cycle.

### Fix applied (2026-08-08, MapButtonTint.maxpat `8b0f1968`)

Added object `ran_obs_clr` (message box, text=`id 0`) inside RangeAndName, wired as:

```
obj-31[0] (sel 0, id===0 branch) → ran_obs_clr → obj-5[1] (live.observer inlet 1)
```

When unmap arrives: `sel 0` fires outlet 0 (existing) → additionally, `ran_obs_clr` bangs → outputs message `id 0` → live.observer receives `id 0` on its path inlet → observer disconnects from the old parameter.

The `id 0` message format (selector "id", argument 0) is the canonical Live API disconnect command: object id=0 is "null/no object" in the LOM. This properly terminates the subscription.

**Invariants after fix:**
- Top-level MapButtonTint.maxpat: 132 boxes / 227 lines (unchanged)
- RangeAndName sub-patcher: 67 boxes / 60 lines (was 66/58)
- Archive: `MapButtonTint.2026-08-08-223855.pre-observer-clr.maxpat` md5=`b74b54be`
- New file md5: `8b0f1968` (599225B)

**Relation to v19 JS guard:** The JS guard (`_doRebind STALE`) catches cases where the stale notification arrives despite the patcher fix. Both layers coexist: patcher fix prevents the observer from firing; JS guard aborts if something still slips through.

### Updated test protocol

1. Load DEV amxd. Map a parameter via main Map button.
2. Open the panel. Unmap via X button or Map button on a slot.
3. Wait 3-4 minutes (the observed ~218 s delay is the worst case).
4. Expected: mapping does NOT return. No `_doRebind outlet(12)` in console.
5. If mapping does return: check if console shows `_doRebind STALE` (JS guard caught it) or `outlet(12)` without STALE (new trigger source exists). If the latter, inspect what is wired to JS inlet 9 beyond ran_idout.

## lnb_tgt stale stored-value hypothesis + fix (2026-08-08, v20)

**Status: FIX APPLIED, effect unconfirmed (needs hardware test)**

### Background

After v19 + ran_obs_clr did not eliminate the bug, a new hypothesis was investigated:
- `lnb_tgt` (live.numbox, parameter_shortname="TgtId", parameter_enable=1, varname was "live.numbox[2]")
- After mapping: `ps_tgt` sends "set X" to `lnb_tgt` → stored value = X
- After unmap(): only `tgtIdParam.set("value", 0)` is called (LiveAPI) — does NOT update `lnb_tgt` stored value (per preset-recall bug finding)
- Result: `lnb_tgt` stored value = X (stale), TgtId DevParam = 0

### Three questions investigated

**Q1 — write-through: does "set N" to lnb_tgt also write to TgtId DevParam in the current session?**
- Official Max docs: "set" sets value "without causing any output" — no outlet fire
- Docs are silent on whether "set" also writes to the bound Live parameter for parameter_enable=1 objects
- M4L model: live.numbox IS the parameter's source of truth; stored value and LOM value are normally in sync
- VERDICT: **plausible but not confirmed from docs/static analysis alone**

**Q2 — stale stored value: does unmap() sync lnb_tgt?**
- unmap() does NOT call `ps_tgt.message(0)` or `lnb_tgt.message("set", 0)`
- The preset-recall fix blocks `mb_idout` (MapButtonTint outlet 1) from firing for id=0 — so ps_tgt never gets 0
- VERDICT: **CONFIRMED — lnb_tgt stored value remains X after unmap**

**Q3 — autonomous push-back: can stale stored value write TgtId=X without user action?**
- AbletonMCP test: `tgtIdParam.set("value", 0)` via API → waited 60 s → no restoration
- VERDICT: **Live does NOT autonomously reconcile parameters** — pure idle timer mechanism ruled out
- BUT: UI-event-triggered push-back (page switch, focus change) is a different mechanism, not tested

### Console pattern that motivated the hypothesis

`_doRebind() enter rid=<X>` fires WITHOUT a preceding `onTargetId tgtIdParam.set id=X` log.
This means TgtId was set to X **outside JS** (no onTargetId was called).

Only mechanism where lnb_tgt could silently set TgtId=X without triggering onTargetId:
- "set X" via ps_tgt → lnb_tgt (no outlet fire → onTargetId not called)
- If write-through exists: TgtId = X → tgtIdObserver → _doRebind [logged first]
- Then _doRebind → outlet(12, X) → MapButtonTint → mb_idout → onTargetId(X) [logged after]

This matches the observed ordering: `_doRebind entry` before `onTargetId`.

BUT: mb_idout (MapButtonTint outlet 1) simultaneously fires both ps_tgt AND obj-4[9] (onTargetId).
So if ps_tgt fires "set X", onTargetId should also be triggered from the same event. This creates a paradox
if we assume a single mb_idout event — write-through from lnb_tgt AND direct onTargetId from patchline,
which should produce the onTargetId log BEFORE _doRebind. The exact ordering depends on M4L async delivery
of parameter change notifications vs synchronous patchline execution.

### Fix applied (v20, 2026-08-08)

1. **AMXD edit**: `lnb_tgt` varname changed from `live.numbox[2]` (auto-generated) to `lnb_tgt`
   — makes the box accessible via `patcher.getnamed("lnb_tgt")` from JS
   — no pattr objects reference the old varname; no functional side effects
   — DEV.amxd new md5: `ca6fbf20`

2. **JS edit (unmap() in midi_learn_slot.js v20)**: after `tgtIdParam.set("value", 0)`, added:
   ```javascript
   var _lnbt20 = this.patcher.getnamed("lnb_tgt");
   if (_lnbt20) { _lnbt20.message("set", 0); }
   ```
   — clears lnb_tgt stored value to 0
   — logged: `TGT-DBG: unmap lnb_tgt.set(0) t=...`
   — if lnb_tgt not found: logged as `lnb_tgt NOT FOUND (varname missing?)`

3. **Persistence side-effect fixed**: even if write-through is NOT real-time, having lnb_tgt stored=X
   after unmap would cause TgtId to restore to X on next .als load. The fix eliminates this persistence bug.

### What this fix does NOT address

- If the write-through is NOT the cause: the bug may persist. Check console for `lnb_tgt.set(0)` log
  (confirming fix runs) AND `_doRebind entry` still appearing without preceding `onTargetId` log.
- RangeAndName deferlow cascade: analyzed, appears to terminate safely (live.object reset to "id 0"
  before deferlow fires getid). Cannot confirm without hardware test.

### Test protocol for v20

1. Load DEV amxd. Confirm `S7-DEV-v20-LNBT-SYNC LOADED` in Max console.
2. Map a parameter via main Map button.
3. Open panel (slot 8). Click X button.
4. Check console: must see `TGT-DBG: unmap lnb_tgt.set(0) t=...` (fix ran).
5. Wait 30–60 seconds.
6. If mapping does NOT return: hypothesis partially confirmed (write-through + stale was the cause).
7. If mapping returns: check if `_doRebind outlet(12)` appears. If yes, another trigger exists.
   — The fix eliminated the stale persistence bug regardless; a new investigation path is needed.

---

## Byname-as-restore-trigger hypothesis — analysis (2026-08-09)

**Hypothesis under test:** The byname persistence mechanism mistakes "mapping was just manually unmapped" for "mapping is missing, restore it" — i.e., after `unmap()`, byname resolve fires again in the same session and re-applies the old mapping.

**Verdict: NOT CONFIRMED for in-session cycles. Edge case applies to cross-session reload only.**

### Q1: When do `_resolveByNameOnHostTrack` / `_resolvePanelSlotsOnHostTrack` fire?

**Strictly once, inside the `bang()` Task (scheduled at 200ms).** Never in-session.

Two and only two entry points (both in `bang()` Task, lines ~461 and ~513):

- `_isDuplicate() === true` → `_resolveByNameOnHostTrack()` (Cmd+D path)
- `storedTgtId > 0 AND idExists === false` → `_resolveByNameOnHostTrack()` (cross-session stale path)

`_resolvePanelSlotsOnHostTrack()` fires from the same Task in three sub-branches (Cmd+D, stale-no-match, panel-stale).

Neither function is called from `onSelectedTrack`, `selObserver`, `panelmap`, `onTargetId`, or any other in-session event handler. Page A/B switch, track selection change, periodic timer — none of these trigger byname resolve.

### Q2: What happens on successful resolve?

Neither function calls `onTargetId()` directly. The chain is:

```
_resolveByNameOnHostTrack() → id > 0
  → _bindToId(id)
    → tgtIdParam.set("value", id)   [LiveAPI write to TgtId DeviceParameter]
    → tgtIdObserver fires (LiveAPI observer on TgtId value)
    → Task(0) → _doRebind()
      → outlet(12, id) → MapButtonTint → mb_idout → JS inlet 9
        → onTargetId(id)
          → Task(0) → _captureByNameFromId(id)   ← this prints "byname capture" in console
```

**Consequence:** "byname capture: dev=Phaser-Flanger" appearing in console logs is a SIDE EFFECT of `onTargetId(id > 0)`, which is called every time a successful rebind completes — including the autonomous cycles triggered by stale tgtIdObserver notifications. The capture log does NOT indicate that byname resolve was the initiating event.

### Q3: Does `unmap()` clean byname data?

| What | How | Result |
|------|-----|--------|
| JS vars `_tgtDevName`, `_tgtParamIdx`, `_tgtDevOcc` | Synchronous assignment (line 1920) | Cleared immediately |
| LOM values DevNm0..6 + TgtPI | `LiveAPI.set("value", 0)` (lines 1921–1927) | LOM cleared |
| Stored values DevNm0..6 + TgtPI | LiveAPI.set only | **Likely NOT cleared** (same issue as v20 with lnb_tgt) |
| `lnb_tgt` stored value | `patcher.getnamed("lnb_tgt").message("set", 0)` (v20 fix) | Cleared via patcher API |

The critical distinction: `LiveAPI.set("value", 0)` on a `parameter_enable=1` Stored Only live.numbox updates the LOM DeviceParameter value but does NOT update the numbox's stored value (established fact from v20 investigation). The same applies to DevNm0..6 and TgtPI numboxes — `unmap()` leaves their stored values intact.

**Why this does NOT cause in-session cycles:**
- JS var `_tgtDevName = null` is set synchronously at line 1920
- `_resolveByNameOnHostTrack()` checks `if (!_tgtDevName || _tgtParamIdx < 0) return -1` immediately
- Even if stored values in DevNm numboxes are non-zero (stale in LOM after unmap via LiveAPI), the JS var is cleared → any hypothetical re-call of resolve would short-circuit at the null check
- And as established in Q1: resolve functions are not re-called in-session at all

### Q4: Cross-session edge case (confirmed, low risk)

This is the only scenario where byname data could cause a false restore:

1. User maps a parameter → `_captureByNameFromId` stores devName in DevNm0..6 (stored values)
2. User calls `unmap()` → `lnb_tgt.message("set", 0)` clears lnb_tgt stored value ✅
   BUT `LiveAPI.set(DevNm0..6, 0)` does NOT clear DevNm stored values
3. User saves .als; DevNm stored values still contain old devName
4. User reloads .als → Live restores DevNm stored values → LOM = old devName
5. `_restoreByNameData()` reads LOM → `_tgtDevName = "Phaser-Flanger"`

At this point, the byname restore depends entirely on `storedTgtId`:
- **If `lnb_tgt` stored value = 0** (v20 fix worked): `storedTgtId = 0` → bang()-Task takes the `else` branch → `_resolveByNameOnHostTrack()` is NOT called → no false restore. DevNm stale data is irrelevant.
- **If `lnb_tgt` stored value = stale X** (v20 fix did not run, e.g. varname not found): `storedTgtId = stale X` → `idExists = false` → `_resolveByNameOnHostTrack()` IS called with `_tgtDevName = "Phaser-Flanger"` → finds device → restores mapping. **This is a genuine false-restore bug.**

The v20 fix (clearing lnb_tgt stored value via patcher API) acts as the primary protection. As long as `patcher.getnamed("lnb_tgt")` succeeds (varname must be set in AMXD), the cross-session false-restore is prevented.

**Defence-in-depth option:** also clear DevNm0..6 and TgtPI stored values via patcher API in `unmap()`. Requires varnames on those objects in the AMXD (currently absent; only pids are cached). Without varnames, patcher.getnamed() cannot reach them. This would be an AMXD change (add varnames) + JS change (patcher.message("set", 0) calls). Low priority: v20 provides adequate protection; risk is eliminated at the lnb_tgt checkpoint.

### Summary

| Question | Answer |
|----------|--------|
| When are resolve functions called? | Once, at bang()-Task init. Never in-session. |
| Do they call `onTargetId` directly? | No — via `_bindToId` → `tgtIdParam.set` → `tgtIdObserver` → `_doRebind` → `outlet(12)` → `onTargetId` |
| Does "byname capture" in logs mean resolve fired? | No — it's a side effect of any `onTargetId(id > 0)` call |
| Does `unmap()` clear byname data? | JS vars: yes (immediate). LOM: yes (LiveAPI). DevNm stored values: probably not. lnb_tgt stored: yes (patcher API, v20). |
| Is byname the cause of in-session cycles? | No. Cycles are caused by stale tgtIdObserver notifications (patcher fix + v19 guard). |
| Is there a cross-session false-restore risk? | Yes, but blocked by v20 fix (lnb_tgt stored = 0). Edge case: if v20 fix fails (varname missing), DevNm stale + lnb_tgt stale together cause false restore. |

---

## ACTUAL root cause found and fixed (v23, 2026-08-09): X-button sends `bang`, not int/float

Everything above (v19 stale guard, patcher live.observer detach, v20 lnb_tgt sync, byname-resolve analysis) was real, valid, and worth keeping — but none of it was the actual cause of the day-long "mapping restores itself when unmapped via panel slot 8" bug. The `unmap()` function was **never being called at all** when clicking the X button.

**Diagnosis path:** added a raw `print DF-X-CLICK` object directly on the X button's (`obj-28` in `MapButtonTint.maxpat`) outlet, bypassing all downstream logic. Confirmed the button does fire on click — but the console showed `DF-X-CLICK: bang`, not a number. The X button (`live.text`, mode=0) outputs a **bang**, not int/float.

**The bug:** `midi_learn_slot.js`'s `bang()` function only special-cased `inlet === 1` (toggleLearn) and had no `return` for any other inlet — so a bang arriving on inlet 11 (the X-button's target inlet) fell through into the device's **entire re-initialization block** (`_initialized = true`, `_lastWrittenTgtId = -1`, `setupFocus()`, observer rebuild, etc. — the same code that runs when the device is freshly loaded). Since the real LOM `TgtId` parameter was never actually touched (the intended `_handleXClick11()`/`unmap()` path was never reached), this re-init legitimately rediscovered the still-mapped parameter and rebound it — indistinguishable from a genuine "device just loaded with a saved mapping" restore. This is why `unmap()`'s own log line never appeared in any console capture, and why every fix targeting `_doRebind`/`tgtIdObserver`/`live.observer`/`lnb_tgt` staleness had no effect: none of that code path was ever entered.

**Fix (`midi_learn_slot.js`, v23, all 4 copies synced):**
```javascript
function bang() {
    if (inlet === 1) { toggleLearn(); return; }
    if (inlet === 11) { _handleXClick11(); return; }
    ... (existing re-init logic, now unreachable from inlet 11)
```

**Lesson:** Max's `js` object dispatches by message type, not just inlet — `int`/`float`/`bang`/`list` each go to a different handler (`msg_int`, `msg_float`, `bang`, `msg_list`), and a per-inlet `switch`-style check inside only ONE of those handlers silently drops any other message type on that same inlet. When wiring a new inlet handler, check what message type the actual upstream object sends (message box vs bang button vs number box) — don't assume int just because that's what the rest of the inlet's logic expects.

---

## Механизм unmap/rebind: как это работает сейчас (v23+, эталонное описание)

Этот раздел — не диагностический нарратив, а чистая модель для нового разработчика. Все
исторические фиксы уже в коде; здесь описано итоговое поведение.

### Сигнальный путь: клик X на панели slot 8 → полное снятие маппинга

**Шаг 1 — физический клик.** Пользователь кликает X-кнопку на bpslot7 в мультимап-панели.

**Шаг 2 — тип сигнала из кнопки.** X-кнопка — `obj-28` в `MapButtonTint.maxpat`, это
`live.text` с `mode=0`. При клике выдаёт **bang** (не int и не float). Именно это
исторически ломало путь: старый `bang()` не перехватывал `inlet===11` и уходил в
полный перезапуск девайса. Фикс v23 добавил ранний return в `bang()`.

**Шаг 3 — пересылка по патчеру.** `bang` выходит из MapButtonTint через **outlet 2**
(`xt_out`), попадает в bpslot7 (multimapDF.maxpat, outlet 3 = `xt_mm_out`), затем в
главный патчер девайса → JS **inlet 11**.

**Шаг 4 — dispatch в JS.** `bang()` проверяет `inlet` первым:
```javascript
function bang() {
    if (inlet === 1) { toggleLearn(); return; }
    if (inlet === 11) { _handleXClick11(); return; }
    // re-init block (inlet 0 = live.thisdevice) follows here
}
```
Для inlet 11 вызывается `_handleXClick11()` и немедленный `return` — блок
переинициализации недостижим для X-кнопки.

**Шаг 5 — `_handleXClick11()`.** Три подшага:

- **5A — гард:** `if (_s7mirrorId <= 0) return` — нет активного зеркала, нечего снимать.

- **5B — сброс main MapButtonTint live.text.** Через patcher API:
  `df_mapparam → subpatcher → getnamed("live.text") → message(0)`.
  Значение 0 уходит в MapButtonTint state machine: blink-metro останавливается,
  state → 0, кнопка принимает grey-цвета.

- **5C — отвязка `live.remote~`.** `outlet(12, 0)` → AMXD → main MapButtonTint
  inlet (`mb_ididin`). Внутри MapButtonTint `mb_ididin` форматирует `"id 0"` и
  рассылает по двум адресам:
  - `live.remote~` — немедленно отвязывается от целевого параметра.
  - sub-patcher `RangeAndName` (obj-16) — через `obj-18 (t l b)` и `obj-31 (sel 0)`:
    `obj-31[0]` (sel 0 outlet при value=0) → **`ran_obs_clr`** (message box `"id 0"`) →
    `live.observer` (obj-5) inlet 1. Сообщение `"id 0"` с форматом `selector=id, arg=0`
    — каноническая команда Live API на отписку: observer отвязывается от старого
    параметра. Без этого observer оставался подписан и через ~218с мог прислать
    устаревшее уведомление, которое прошло бы по цепочке `obj-5 → obj-24 → obj-28 →
    obj-15 → obj-37 → live.object → route id → sel 0 → ran_idout → JS inlet 9 →
    onTargetId(X) → _doRebind → outlet(12, X)`.

**Шаг 6 — `unmap()`.** Вызывается из `_handleXClick11()` после `outlet(12, 0)`:

- **Race guard (v15):** `_rebindTask.cancel(); _pendingRebindId = 0`. Отменяет любую
  задачу `_doRebind`, уже стоящую в очереди на момент unmap.
- **Сброс JS-состояния:** `learnedCC=-1`, `learnedChannel=-1`, `arming=false`,
  `engaged=false`, `targetParamId=-1`. Outlet-сигналы: cc-дисплей, ch-дисплей,
  arming-индикатор сбрасываются.
- **`_lastWrittenTgtId = 0`** — чтобы guard в `onTargetId()` не перепутал намеренную
  запись 0 с дублированием.
- **Keep-alive синхронно:** `_s7mirrorId = 0; _s7kaStop()`. 100ms-таск, который держал
  amber на bpslot7 в FOLLOW-режиме, останавливается немедленно — до любых async-задач.
- **Task(0) — визуальный сброс bpslot7:** `live.text.message(0)` → останавливает metro
  + arm state; `"text"/"texton" = "Map"`; явный сброс `lcdbgcolor` (тёмный дефолт) и
  `lcdcolor` (тёплый светлый дефолт) — нужен потому что state machine в MapButtonTint
  сбрасывает только `lcdcolor`, но не `lcdbgcolor`; `it_mapstore.message(0)`;
  `X button hidden = 1`. Вызов `_updateMapBtnVisibility()`.
- **Запись TgtId=0 в Live:** `tgtIdParam.set("value", 0)`. Триггерит `tgtIdObserver`,
  но при `id=0` его ветка `else` только вызывает `clearTargetTrack()/applyColor()/
  updateBullet()` — никакого `_doRebind` не планируется.
- **v20 — сброс stored value `lnb_tgt`:** `lnb_tgt.message("set", 0)`. `lnb_tgt` — это
  `parameter_enable=1` live.numbox, чьё stored value было выставлено в X при маппинге
  через `ps_tgt`. `tgtIdParam.set("value", 0)` через LiveAPI обновляет только LOM (параметр
  девайса), но не stored value самого numbox. Без явного `"set" 0` через patcher API
  stored value остаётся = X: при любой следующей Live-реконсиляции он мог бы дописать
  TgtId=X обратно → тихий триггер `tgtIdObserver` → автономный `_doRebind`.
- **Сброс byname-данных:** JS-переменные (`_tgtDevName=null`, etc.) + LOM (DevNm0..6,
  TgtPI через LiveAPI.set).
- `updateLabel()`, `_updateMapBtnVisibility()`.

**Результат:** main Map button — серый/немаппированный. bpslot7 — текст "Map", без amber,
X-кнопка скрыта. `live.remote~` отвязана. `live.observer` в RangeAndName отписан.
TgtId LOM = 0. lnb_tgt stored = 0. Byname-данные очищены.

---

### Что происходит, если Live всё равно доставляет устаревшее уведомление

Live может буферизировать уведомления об изменениях параметров и доставлять их с задержкой
(наблюдаемый интервал ~218с, но бывает быстрее). После `unmap()` может прийти уведомление
со старым значением TgtId=X. Слои защиты:

| Слой | Механизм | Что ловит |
|---|---|---|
| v15 race guard | `_rebindTask.cancel()` в `unmap()` | Задачи, стоявшие в очереди **на момент** unmap |
| `ran_obs_clr` | `live.observer "id 0"` в RangeAndName | Уведомления из пatcher-side observer (MapButtonTint) |
| v19 stale guard | `tgtIdParam.get("value")` в начале `_doRebind()` | Любая новая задача, созданная **после** `unmap()` из любого источника |

Работа v19 guard пошагово: если `tgtIdObserver` всё же получает устаревшее X после
unmap → планирует Task `_doRebind(rid=X)`. При исполнении `_doRebind()` читает текущее
живое значение TgtId из LOM: `tgtIdParam.get("value")` → возвращает 0 (unmap уже записал).
`_curTgt=0 ≠ rid=X` → `_pendingRebindId=0; return`. Маппинг не восстанавливается.

---

### Почему `_doRebind()` вызывается через Task(0), а не напрямую

`live.remote~` не может получить новый `id` внутри notification callback Live API. Max
выдаст ошибку. `tgtIdObserver` срабатывает именно в notification context. Task(0)
перекладывает выполнение в следующий Max event cycle, где Live API разрешает операцию.
`_pendingRebindId` — глобальная переменная (не closure) для безопасного захвата id через
границу контекста в ES3.

---

### Прямой путь: маппинг (для полноты)

1. Пользователь кликает Map → MapButtonTint вооружается (arm_metro → blink).
2. Выбирает параметр → `RangeAndName` в MapButtonTint получает свежий id X и выдаёт его
   через `mb_idout` (outlet 1 MapButtonTint) → JS inlet 9 → `onTargetId(X)`.
3. `onTargetId`: если `X > 0` и `X ≠ _lastWrittenTgtId` → пишет `tgtIdParam.set("value", X)`,
   обновляет `_lastWrittenTgtId=X`.
4. `tgtIdObserver` срабатывает → Task(0) → `_doRebind(rid=X)`.
5. v19 guard: `tgtIdParam.get("value") = X = rid` → проходит. `outlet(12, X)` →
   MapButtonTint `mb_ididin "id X"` → `live.remote~` привязывается к параметру X →
   визуальный state → amber/mapped.
6. Параллельно Task(0) синхронизирует bpslot7: `mm_tgt_7 = X`, сбрасывает arm на
   bpslot7 live.text, вставляет имя параметра (≤12 символов), запускает keep-alive
   (`_s7kaTask` 100ms в FOLLOW-режиме).

---

## Release candidate: v1.2-clean transplant (2026-08-09)

All nine confirmed fixes from 2026-08-08/09 (blink `it_dgc2`, X-button wiring, `unmap()` rebindTask race v15, amber-guard v16, CcControlDevice byname-guard v18, stale-notification guard v19, `live.observer` detach `ran_obs_clr`, `lnb_tgt` sync v20, and the actual root cause — `bang()` inlet-11 fix v23) were re-applied cleanly onto the last **released** frozen build (v1.1, md5 `f2858303`, from `dist/Fadercraft Dynamic Focus v1.1.zip`) instead of continuing to build on top of the DEV file, which carries the full history of today's reverted attempts and diagnostic instrumentation.

- **Base:** v1.1 frozen `.amxd`, md5 `f2858303` (pre-fix archive: `_device-backups/Dynamic Focus/Dynamic Focus Slot.2026-08-09-121328.pre-v12-clean-base.amxd`)
- **Result:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/Dynamic Focus Slot.amxd`, md5 `b3801e5c`, FROZEN. Backup copy: `~/Brain/fadercraft/Dynamic Focus/dist/archive/Dynamic Focus Slot v1.2-clean.amxd`
- **Excluded on purpose:** all `TGT-DBG`/`S7-DBG`/`DF-X-CLICK` diagnostic `post()` lines, the debug `print` probe object in `MapButtonTint.maxpat`, and every reverted intermediate attempt (e.g. the original `it_dgc` approach before `it_dgc2`). Load marker changed from `S7-DEV-v23-BANG-INLET11` to `S7-PROD-v1.2`.
- **Confirmed working** on hardware 2026-08-09: full map → unmap-via-panel → wait cycle, no self-restore, on both the DEV device and this clean v1.2 build.
- **Before actual release:** `DEVICE_VERSION` inside the device still reads `'1.1'` (needs bump to `'1.2'` so the update-checker isn't confused) — not yet published to Gumroad or `versions.json`, both pending user go-ahead.
