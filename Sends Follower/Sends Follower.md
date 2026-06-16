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

## Known issue (top action item)

The device references `js sends_follower.js`, but the container is **unfrozen and the script is not
embedded** and not on disk next to the device. As shipped it errors (`js: can't find file
sends_follower.js`) and produces no follow value. The only surviving copy is the older
`~/Music/Ableton/User Library/Max Devices/Archive/sends_follower.js`. Restore or freeze the script
before relying on the device. See [[wiki/entities/sends-follower-device]] → Limitations.
