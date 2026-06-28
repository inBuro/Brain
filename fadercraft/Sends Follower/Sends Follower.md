---
type: hub
project: Sends Follower
created: 2026-06-16
updated: 2026-06-16
---

# Sends Follower

Project hub for **Sends Follower** — a standalone Max for Live audio-effect device that sits on a
return track, watches the sends of every track feeding that return, and turns the **maximum** send
amount into a follow value (delivered as a `live.remote~` modulation plus two internal Max buses).

This is a **separate device, unrelated to [[Instrument Follower]]** — they only share the word
"Follower." See the wiki for the full technical breakdown.

- **Device:** `raw/SendsFollower.amxd` (analyzed copy; the live original lives in the Ableton User
  Library under `Max Devices/`).
- **Wiki:** [[wiki/index|technical reference TOC]] — entity page + concept pages on the read path,
  return-index detection, the modulation chain, internal buses, and the `.adg` rack wrapper.

## Status

Working. The `sends_follower.js` script was pulled into the device and **frozen on 2026-06-16**, so
it now ships embedded in the `.amxd` (verified byte-identical to the source) and the device loads
without the old `js: can't find file` error. `raw/SendsFollower.amxd` holds the frozen copy.

One pre-existing item is still needs-verification (unaffected by the freeze): the `live.remote~`
target `devices 1 parameters 5` is positional and fragile — it modulates parameter index 5 of
whatever device sits right after Sends Follower in the return chain. See
[[wiki/entities/sends-follower-device]] → Limitations.
