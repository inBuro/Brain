# Dynamic Focus — System Architecture

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
| `DF Input` + global bus + audio-effect Slot | ⬜ to validate next |
| Map → target parameter (LFO-style) | ⬜ next phase |
| Multi-slot bpatcher abstraction | ⬜ after bus proven |
| Custom UI | ⬜ last (out of current scope) |
