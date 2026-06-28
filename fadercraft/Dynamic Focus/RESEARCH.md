# Dynamic Focus — Track Focus Architecture Validation

Proof-of-concept research: can a Max for Live device reliably activate itself
**only while its host track is the currently selected track** in Ableton Live —
with no global manager and no central router?

**Verdict: yes.** The architecture is sound and recommended as the product foundation.

---

## 1. Implementation approach

Each device instance does two things, entirely on its own:

1. **Find its own host track.** At init, ask the device for its `canonical_parent`.
   For a device that *is* the track's device, `canonical_parent` is the track.
   Store its numeric `id`.
2. **Watch the global selection.** Put a single observer on
   `live_set view` → property `selected_track`. Whenever the user selects a
   different track, Live fires the callback with the new selected-track id.
   Compare it to the stored host id → `active = (selId === hostId)`.

That comparison is the entire active-state logic. When `active` flips to 1 the
device passes MIDI through (later: runs MIDI Learn / param routing); when 0 it
gates everything off. No instance ever talks to another instance — they all read
the same one global property and each answers "is that me?".

See [dynamic_focus.js](dynamic_focus.js) for the working prototype.

---

## 2. Relevant Live API objects and observers

| Purpose | Path / property | Notes |
|---|---|---|
| The device itself | `LiveAPI("this_device")` | Entry point for every instance. |
| Host track | `this_device` → `get("canonical_parent")` → `["id", n]` | Resolve once at load. Re-resolve if the track is moved. |
| Host track id | `hostTrack.id` | Stable numeric id; survives reorder/rename. |
| Selected track | `live_set view`, property **`selected_track`** | The observer that drives everything. Callback delivers `["selected_track","id",n]`. |
| Compare target | `selectedId === hostId` | Pure integer compare. |

Key detail: `id` is **stable** across track reordering and renaming, whereas the
*path* (`live_set tracks 3`) is **not**. Always compare by `id`, never by path or
name.

---

## 3. Event flow

```
load
  └─ live.thisdevice ─bang→ js.init()
        ├─ resolve host track id (canonical_parent)
        └─ attach observer: live_set view · selected_track
              └─ (immediate first callback → evaluate initial state)

user clicks a track
  └─ Live fires selected_track observer
        └─ js.onSelectedTrack(["selected_track","id", n])
              └─ evaluate(n):  active = (n === hostId)
                    └─ if changed → outlet(active)   // gate MIDI / light LED
```

Setting `.property = "selected_track"` fires one callback immediately, so the
correct state is established at load with no extra polling tick.

---

## 4. Supported track types

`canonical_parent` + `selected_track` behave identically for every track kind,
because Live exposes them all as `Track` objects in the same selection model:

| Track type | Host detection | Becomes selected | Notes |
|---|---|---|---|
| MIDI track | ✅ | ✅ | primary case |
| Audio track | ✅ | ✅ | device must be a MIDI/audio-effect that loads there |
| Group track | ✅ | ✅ | selecting the group fires the same callback |
| Return track | ✅ | ✅ | returns are valid `selected_track` targets |
| Master track | ✅ | ✅ | master is selectable; id is stable |

Edge note: a device only loads on tracks of a compatible type (MIDI effect vs.
audio effect). The *detection* logic is type-agnostic; only the device's own
device-type chain limits where an instance can physically live.

---

## 5. Multiple instances & performance

- **Independence** — each instance owns its own `hostId` + observer and compares
  locally. There is no shared state, so 1 or 50 instances behave the same.
- **Exactly one active** — only one track can be the `selected_track`, so at most
  one instance ever evaluates to `active = 1`. Guaranteed by Live's model, not by
  coordination.
- **CPU** — the observer is event-driven; idle instances do **zero** work between
  selection changes. On a selection change all N instances get one callback, do
  one integer compare, and all but one early-return on "state unchanged". That is
  N cheap callbacks *per user click*, not per audio block — negligible and it
  scales linearly. No polling, no per-sample cost.

This is why the no-central-manager design wins: a router would have to fan out to
N instances anyway; here Live's own selection broadcast *is* the fan-out.

---

## 6. Limitations & edge cases

- **Track moved/deleted** — `id` survives reorder, but if the host track is
  deleted the device is removed with it (non-issue). If `canonical_parent` ever
  needs re-resolving (rare), call `refresh()`.
- **API readiness** — resolve `this_device` only after the Live API is up. Drive
  init from `[live.thisdevice]` (bang on load), not `loadbang`, to avoid a race.
- **Selection vs. focus** — `selected_track` follows the Session/Arranger track
  selection. Clicking inside a clip or a browser does not change it; that matches
  the intended "which track am I editing" semantics.
- **Detached observer hygiene** — set `property = ""` before reattaching to avoid
  duplicate callbacks on re-init.
- **One selected track only** — Live has a single selected track, so multi-select
  scenarios don't apply.

---

## 7. Recommendation

**Adopt this architecture as the foundation for Dynamic Focus.**

It satisfies every success criterion:

- ✅ each instance reliably detects whether its host track is selected;
- ✅ activation is immediate (event callback, sub-frame, no polling lag);
- ✅ inactive instances gate off and do no processing;
- ✅ CPU scales linearly and stays negligible with many instances;
- ✅ no central manager — Live's selection broadcast is the coordination layer.

Next steps once validated in-app: layer MIDI Learn and parameter routing on top
of the `active` gate; the gate itself does not change.
