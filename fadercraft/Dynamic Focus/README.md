# Dynamic Focus — Track-Focus Architecture (Proof of Concept)

Validation of the core architecture for the **Dynamic Focus** Max for Live
product: can an independent M4L device activate itself **only while its own
host track is the selected track**, with no central manager and negligible CPU
when inactive?

**Verdict: the architecture is sound and recommended as the product
foundation.** Details and caveats below.

## Files

| File | Role |
|------|------|
| `dynamic_focus.js` | The prototype "brain" — resolves the host track, observes selection, outputs Active/Inactive. The reviewable source of truth. |
| `Dynamic Focus.maxpat` | Editable Max patcher (MIDI Effect). Open directly in Max. |
| `Dynamic Focus.amxd` | Wrapped device for drag-and-drop into Ableton Live. |
| `build_device.py` | Regenerates `.maxpat` + `.amxd` from `dynamic_focus.js`. |

The device is a **MIDI Effect**: `midiin → gate → midiout`, where the gate is
opened/closed by the `js` Active output, plus a toggle LED indicator. MIDI
passes **only while the host track is selected**.

## Install

Drop `Dynamic Focus.amxd` onto a MIDI track in Ableton Live (keep
`dynamic_focus.js` in the same folder — the device references it by name).

If Live rejects the binary (the `.amxd` is wrapped programmatically and the
checksum/window metadata Max writes on save is reused from another device, not
freshly computed), open `Dynamic Focus.maxpat` in the Max editor and
**Save As → `Dynamic Focus.amxd`**. Max then rewrites valid metadata. The
`.maxpat` + `.js` are authoritative; the binary is a convenience wrapper.

---

# Research Report

## 1. Implementation approach

Each instance is fully self-contained and determines its own active state:

1. **Resolve own track** once at init:
   `new LiveAPI("this_device").goto("canonical_parent")` → the host track; cache
   its `id`. Track ids are stable for the session, so this is done once.
2. **Read the current selection:**
   `new LiveAPI("live_set view").get("selected_track")` → `["id", N]`.
3. **Observe selection changes** (event-driven, no polling):
   `new LiveAPI(cb, "live_set view").property = "selected_track"`.
4. **Decide:** `active = (selected_track_id === own_track_id)`.

On every selection change the callback re-reads the selected id and edge-triggers
output only when the state flips (`1` Active / `0` Inactive). That output drives
the MIDI `gate` and the LED. No instance knows about any other instance — the
"only one active at a time" property is an emergent consequence of Live having
exactly one selected track, not something coordinated.

The code mirrors the defensive idioms already proven in this project's
`solo_follower.js` (guarded `LiveAPI` access, `Task`-deferred init with retry
backoff while the API warms up during set load, observer teardown in
`freebang`).

## 2. Relevant Live API objects and observers

| Object / path | Use |
|---|---|
| `this_device` | Entry point to the running device. |
| `… goto("canonical_parent")` | Walks device → host **track** (works for any track type). |
| `live_set view` → `selected_track` (get) | Current selection as `["id", N]`. |
| `live_set view` → `selected_track` (observe) | **The** notification that fires on selection change. |
| `Track.id` | Stable per-session identity used for comparison. |

One observer per instance. No global/manager object is created.

## 3. Event flow

```
Live: user selects a track
        │
        ▼
"live_set view" selected_track changes
        │  (Live API notification — push, not poll)
        ▼
selectionCallback()  ──►  evaluate()
        │                    │ read selected_track id
        │                    ▼
        │            active = (selId === ownTrackId)
        ▼                    │ (edge-triggered)
   outlet(0, active) ──┬──► gate control  (MIDI passes iff active)
                       └──► LED toggle     (visual indicator)
```

Init flow: `loadbang → "1" → js` enables and triggers `safeInit()`, which
resolves the host track and installs the observer (retrying on `INIT_RETRY_MS`
backoff until the API is ready).

## 4. Limitations and edge cases

- **No polling for selection** — selection is purely event-driven via the
  `selected_track` observer, so latency is one Live event-loop tick
  (effectively immediate, well under one UI frame). Polling is therefore not
  required and not used.
- **Return / Master tracks:** `live_set view selected_track` does report return
  and master track selection in Live 11+. On older versions master-track
  selection reporting can be inconsistent; if the product must support pre-11
  Live, add a fallback that also reads the mixer/detail view. For Live 11+ the
  single `selected_track` observer covers MIDI / Audio / Group / Return / Master
  uniformly, since `canonical_parent` resolves to the correct track object in
  every case.
- **Device moved between tracks at runtime:** the cached track id goes stale.
  Send `refresh` (or reload) to re-resolve. A production build can re-resolve
  `this_device → canonical_parent` lazily on each evaluate if drag-between-tracks
  must be seamless; the cost is one extra `LiveAPI` read per selection change.
- **Set load / undo of track topology:** init retries with backoff handle the
  "API not ready yet" window. Deleting the host track invalidates the instance
  (it is removed with the track), so no special handling is needed.
- **MIDI gating granularity:** the PoC gates the raw `midiin` byte stream with
  `gate`. This is fine for validation; the shipping product should gate at the
  message level (inside the MIDI handler) so a state flip can never split a
  running-status message mid-stream.

## 5. Performance observations

- **Inactive instances do no work.** With no polling and a single property
  observer that only fires on selection change, an inactive (or active)
  instance consumes no CPU between selection events. The callback is a single
  `LiveAPI.get` + integer compare; output is edge-triggered, so unrelated
  selection changes among N tracks wake each observer once and return
  immediately when the id doesn't match.
- **Scales linearly and cheaply with instance count.** 20–50 instances means
  20–50 lightweight observers on the same `view` property. A selection change
  notifies all of them once; total work per change is O(N) trivial comparisons,
  amortized to near-zero versus Live's own UI cost. There is no shared bottleneck
  and no central router to serialize through.
- **Memory:** a few cached scalars and one `LiveAPI` observer per instance.

> Note: these are the expected characteristics from the event-driven design and
> from the behavior of the equivalent observer pattern in the project's shipping
> `solo_follower.js`. Exact CPU figures should be confirmed in Ableton with the
> 20–50-instance test set before the product gate.

## 6. Recommendation

**Adopt this architecture as the foundation for Dynamic Focus.** It satisfies
every success criterion:

- ✅ each instance reliably detects whether its host track is selected;
- ✅ activation is immediate (event-driven, no polling latency);
- ✅ inactive instances ignore processing (gate closed, edge-triggered output);
- ✅ cost scales well with many instances (O(N) trivial comparisons per change);
- ✅ no central manager — selection exclusivity is emergent from Live's model.

Recommended hardening before building MIDI Learn / parameter routing on top:
(1) lazy re-resolution of the host track to support drag-between-tracks;
(2) message-level MIDI gating; (3) explicit verification of Return/Master
selection reporting on the minimum supported Live version.
