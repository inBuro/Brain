# Sends Reader device

Source analyzed: the Sends Reader device patcher (object IDs in parentheses are patcher box IDs) and
the external `sends_reader.js`. The device is a fork of Sends Follower; only the differences are
detailed here. For the reused machinery (8-slot mapper, version check, observer self-healing pattern)
see the [[../../../Sends Follower/wiki/index|Sends Follower wiki]].

- **Device file:** `~/Music/Ableton/User Library/Max Devices/SendsReader.amxd`
  (v1.3; md5 `9c0386abc1fb3b1bd597a6d695c33322`, 118474 bytes, 182 boxes / 190 lines, openrect
  `[0,0,328,169]`).
- **External scripts (must be next to the device while unfrozen):** `sends_reader.js`,
  `sr_version_check.js` (`DEVICE_VERSION = 1.3`).

## Status

| Aspect | Status | Notes |
|---|---|---|
| Reads one send of its own track | Works | `sends_reader.js` (`obj-46`) resolves `this_device canonical_parent` → own track → `mixer_device sends <M> value`, emits `outlet(0,"max",value)` → `route max` (`obj-47`) → `send ---max_send` |
| Host-type auto-detect | Works | Normal / group track → working; return track or master → N/A (value forced to 0, status message shown). See "Host detection" |
| Send chosen via a dropdown (letters) | Works | `umenu` (`send_menu`) populated at runtime with **letters only** `A, B, C…` (one per return, by ordinal, regardless of return name). Sits in the top-left corner (presentation_rect `[5,2,46,14]`). Selection → `prepend selectsend` → JS |
| Selection stored by return identity, not index | Works | JS stores the selected return's LiveAPI id + name; re-resolves the index on add / remove / reorder of returns (observer on `live_set return_tracks`) |
| Selection persists across reload | Works | `pattr sr_sel @autorestore 1` stores `id + name` (or the `none` token); on load → `prepend restoresel` → JS, then re-resolved when the menu rebuilds |
| 8-slot mapper (native `live.map`) | Works (inherited) | 8× `live.map @strict 1` → `live.remote~`, each with Min/Max scaling; taps the raw `---max_send` value (0..1). Unchanged from Sends Follower |
| Anti-feedback guard | Partial (warning only) | If the user selects this track's *own* send while mapping, JS emits `warn 1` and the status label shows "Avoid mapping your own send (loop)". A hard block is not possible (`live.map` grab is native) — the user is warned, not prevented |
| Dial value meter | Works (inherited) | `obj-3` dial displays the read send value (driven by `---max_send`), `parameter_enable: 0` (passive meter) |
| Update notifier ("New Version") | Works | `node.script sr_version_check.js` pings `https://fadercraft.com/api/sends-reader.json`; mint button shows when an update exists |
| Embedded JS (frozen) | No — **unfrozen** | Ships referencing external `sends_reader.js` + `sr_version_check.js`. Must be frozen before distribution, else recipients get `js: can't find file` |
| LFO modulation leg | Present but inert by default | The inherited `live.remote~` leg (`obj-9..11`) still targets `this_device canonical_parent devices 1 parameters 5` (a stock LFO's Offset, only if paired in a rack). With no such LFO it is a harmless no-op. Sends Reader's primary output is the 8-slot mapper |

## What it does (plain terms)

Sends Reader sits on an ordinary track (audio, MIDI, or a group). It reads **one** of that track's
send knobs — how much this track is sending to a return you pick from the **Send** dropdown (returns
are listed as letters `A, B, C…`, top-left corner) — and turns that 0..1 value into a modulation
source. You then map that source onto up to eight Live parameters with the 8-slot mapper.

This is the **mirror** of Sends Follower: instead of "how much does the whole set push into this
return" (read on the return), it is "how much does *this track* push into a chosen return" (read on
the track), used as a modulator.

## Where / when to use it

- **Placement:** on an ordinary **audio / MIDI / group track** (not a return, not the master).
- On a **return track or the master**, the device shows an N/A status and outputs 0 — there are no
  per-track sends to read there.

## Host detection (`detectHost` in `sends_reader.js`)

`new LiveAPI("this_device canonical_parent").unquotedpath` is matched:

- `live_set tracks N`         → `TYPE_NORMAL` (working). `trackPath` stored for the read path.
- `live_set return_tracks N`  → `TYPE_RETURN` → status "On a return track — no sends to read", value 0.
- `live_set master_track`     → `TYPE_MASTER` → status "On the master track — no sends to read", value 0.

A property observer on the device path (`property name`) re-detects when the device is dragged to a
different track. A `resync()` on every bang (throttled to 500 ms) closes the cold-load race where
observers / the path are not resolved yet.

## The Send dropdown (`send_menu`, a `umenu`)

The follow `live.tab` (Peak/Total) from Sends Follower was repurposed into a `umenu` (chosen over
`live.menu` because `live.menu` cannot be reliably populated at runtime — `umenu` supports
`clear`/`append`). On load and on any change to `live_set return_tracks`, the JS rebuilds the menu:
`menu clear`, then one **letter** per return (`A`, `B`, `C…` from `idxToLetter(k)` — by ordinal, not
by the return's name). The menu has **no `All` item** — it is letters only, and the device always
reads exactly one send. The JS then re-selects the saved return (`select <idx>`, applied via
`prepend set` so it does not re-fire `selectsend`). A user click outputs the index →
`prepend selectsend` → JS, which binds the send reference and persists the choice.

The dropdown sits in the **top-left corner** (presentation_rect `[5,2,46,14]`, compact because the
labels are single letters); it sits to the left of the "New Version" button (`x54`) and above the
dial (`y16`), so there is no overlap.

## Selection persistence and self-healing

The selected return is stored by **identity**, not index: JS keeps `selReturnId` (LiveAPI id) and
`selReturnNm` (name). `persistSelection()` writes `store <id> <name…>` → `route store` →
`pattr sr_sel` (a cleared selection is stored as `store none`). On reload, `pattr` emits →
`prepend restoresel` → JS `restoresel` (which understands `none` / `<id> <name…>`), and the next menu
rebuild re-resolves the index from the saved id (falling back to name, then to the first return).
This mirrors the return-index self-healing in Sends Follower.

## Read path (object chain)

`sends_reader.js` (`obj-46`):
- inlet 0 receives `init`, `bang` (33 ms poller), `selectsend <i>`, `refreshmenu`, `restoresel …`.
- outlet 0 = `max <value>` → `route max` (`obj-47`) → … → `send ---max_send` (`obj-50`). Downstream
  (dial, percent, 8-slot mapper) is inherited unchanged.
- outlet 1 = persistence: `store …` → `route store` (`sr_strrt`) → `pattr sr_sel`.
- outlet 2 = menu / status / warning: `route menu select status warn` (`sr_route2`) →
  - `menu …` → `send_menu`
  - `select <i>` → `prepend set` (`sr_menuset`) → `send_menu`
  - `status ok|na|wait <text>` → `route ok na wait` (`sr_statrt`) → status label setters
  - `warn 1|0` → `sel 1 0` → status label (loop warning / clear)

## Anti-feedback

A property observer on `live_set view selected_parameter` (active always) checks, when a parameter is
selected, whether its path starts with `<own track> mixer_device sends `. If so it emits `warn 1`
(the status label shows the loop warning); otherwise `warn 0`. Mapping the read send (or any send of
the same track) onto itself would create a loop (read value → modulate it → change it → read again).
The native `live.map` grab cannot be hard-blocked, so the user is warned.

## I/O summary

- **Input:** none (audio passes through `plugin~`/`plugout~`, inherited; the read is via LiveAPI).
- **Output:** modulation via the 8-slot mapper (`live.remote~` per slot); internal buses
  `---max_send` (raw 0..1) and `---max_send_percent` (0..100).

## Container layout

Unfrozen container: `ampf` header → 32-byte prefix (ending with the `ptch` length field) → JSON
patcher **from offset 0x20** → a single trailing `\x00` at EOF. No `dlst` directory, no `mx@c`
sub-header, no embedded resources — the JS lives in external files next to the device. `ptch`
(LE @0x1C) = filesize − 0x20. Repack = `d[:0x20]` + new JSON + `b'\x00'`, then fix `ptch`. To freeze
(embed both scripts) use the Path B recipe in the m4l-master `amxd-format.md` memory (note the
filename ≤19 chars rule — `sr_version_check.js` = 19 chars, fits).

## Limitations and open items

- **Unfrozen** — must be frozen for distribution (embed `sends_reader.js` + `sr_version_check.js`).
- **Anti-feedback is a warning, not a block** — by design (native `live.map`).
- **Inherited LFO leg** (`obj-9..11`) is positional (`devices 1 parameters 5`); inert unless an LFO
  is the next device in a rack. Consider removing it on a later cleanup pass since Sends Reader's
  primary output is the mapper, not a rack-paired LFO.
- **Hardware not yet tested** — verified by JSON validation + a mocked-LiveAPI logic run only. Needs a
  pass in Live (see the project log for the test plan).
- **Distribution manifest** `https://fadercraft.com/api/sends-reader.json` is not deployed yet; the
  notifier falls back to a hardcoded URL until it is live.
