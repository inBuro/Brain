---
type: hub
project: Sends Reader
created: 2026-06-18
updated: 2026-06-18
---

# Sends Reader

Project hub for **Sends Reader** — a standalone Max for Live audio-effect device, a **fork of
[[../Sends Follower/Sends Follower|Sends Follower]] with inverted semantics**.

- **Sends Follower** sits on a **return track** and reads how much the *whole set* sends *into* that
  return (an aggregate of every track's send).
- **Sends Reader** sits on an **ordinary audio / MIDI / group track** and reads a *single* send knob
  of *its own track* — the amount this track sends to a chosen return — and uses that value as a
  modulation source feeding the same 8-slot mapper.

It is a **separate product** from Sends Follower (own device file, own JS, own version manifest); the
two only share machinery (host-detection pattern, observer self-healing, the 8-slot native-`live.map`
mapper, the version-check notifier).

- **Device:** `~/Music/Ableton/User Library/Max Devices/SendsReader.amxd` (working copy edited in
  place); analyzed/canon mirror in `raw/SendsReader.amxd`.
- **External JS (next to the device):** `sends_reader.js` (read path + menu + host detect +
  anti-feedback), `sr_version_check.js` (update notifier).
- **Wiki:** [[wiki/index|technical reference TOC]].

## Status

**v1.0, working (unfrozen).** Built 2026-06-18 by forking the current on-disk Sends Follower patcher
(183 boxes / 190 lines, md5 `2f78a8d03ce2fa692ba447f929930a9a`, 108511 bytes). The device is
**unfrozen**: it relies on `sends_reader.js` and `sr_version_check.js` sitting next to it in
`Max Devices/`. For distribution it must be **frozen** so both scripts are embedded (otherwise the
recipient gets `js: can't find file`). See [[wiki/entities/sends-reader-device]] for the full
breakdown and open items.
