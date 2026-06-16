# Change log

Append-only. Newest first.

## 2026-06-16 — initial wiki created (read-only analysis)

- Source analyzed: `raw/SendsFollower.amxd` (21673 bytes, unfrozen `ampf` container; JSON patcher
  bytes 32–21671; 50 boxes / 51 lines). No device edits made — read-only documentation pass.
- Cross-checked the older standalone `~/Music/Ableton/User Library/Max Devices/Archive/
  sends_follower.js` (the embedded JS is referenced but NOT embedded in the current device and NOT on
  disk next to it; the Archive copy is the only surviving source).
- Inspected the rack preset `~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack/
  MaxSendsFollower.adg` (Sends Follower → stock LFO, no custom macro mapping).
- Created:
  - `wiki/index.md` — table of contents.
  - `wiki/entities/sends-follower-device.md` — main technical reference (purpose, placement, I/O,
    parameters, signal flow, limitations, unrelated-to-Instrument-Follower confirmation).
  - `wiki/concepts/send-gathering-via-liveapi.md`
  - `wiki/concepts/self-healing-return-index.md`
  - `wiki/concepts/live-remote-modulation-chain.md`
  - `wiki/concepts/internal-buses.md`
  - `wiki/concepts/adg-rack-wrapper.md`
- Open items flagged needs-verification: the missing `sends_follower.js` (device will error until
  recovered/embedded); what `devices 1 parameters 5` resolves to on the LFO; whether the bipolar
  `scale 0. 1. -100. 100.` modulation mapping is intended.
