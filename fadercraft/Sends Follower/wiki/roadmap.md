# Sends Follower — Roadmap

**Summary**: Active development plan and backlog for the Sends Follower device pair (SF-Return + SF-Track).

**Last updated**: 2026-07-02

---

## Released — v1.0

- SF-Return: follow Peak/Total send level across all tracks to the host return
- SF-Track: follow own track's send to a selected return; Manual mode (MIDI-mappable dial)
- 8-slot direct parameter mapper (Min/Max per slot, swap button, map-all)
- SF-Track on return channel: follow earlier returns' sends to the host return
- Swap button (MapButton): exchange Min% ↔ Max% on every click
- Update notifier (sf_version_check.js)
- Feedback-loop warning

---

## Backlog

### Remove qmetro — full push model
Value output is already push (`onAnySendChange`). `bang()` only does structural resync every 500 ms as a safety net. Replace qmetro entirely:
- Cold-load anti-race → one-shot `Task` (+500 ms) in `init()`/`loadbang()`
- Manual-mode output (SF-Track) → emit directly in `userval()`
- Structural changes already covered by `devPathObs` / `returnsObs` / `tracksObs`

Requires unfreezing both devices and removing the `qmetro` Max object from each `.amxd`.
Expected result: drops ~30 Hz idle polling to zero → lower CPU floor.

### Random button (top-right corner)
Randomise the Max% influence of all 8 mapper slots in one click.

- **Location**: top-right corner of the device — same area as update notifier and feedback-loop warning.
- **Visibility rule**: visible only when *both* `update == 0` AND `feedbackloop == 0`; hidden otherwise (yields to notifications).
- **Action**: for each of 8 slots, set Max% to a random multiple of 5 in the range 5–100. Min% is left unchanged.
- **Formula**: `Math.floor(Math.random() * 20) * 5 + 5`
- **Applies to**: SF-Return (primary); SF-Track TBD.
