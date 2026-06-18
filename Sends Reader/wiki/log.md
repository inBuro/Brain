# Sends Reader — change log

Append-only record of operations on the Sends Reader device.

## 2026-06-18 — v1.0 created (fork of Sends Follower)

Forked the Sends Reader device from the current on-disk Sends Follower patcher (SF md5
`ac1dc6f4dfb03c9e89cb1927543df8f2`, 190/193). Sends Follower and its JS were left byte-identical
(not touched). New device: `SendsReader.amxd`, md5 `2f78a8d03ce2fa692ba447f929930a9a`, 108511 bytes,
**183 boxes / 190 lines**, openrect `[0,0,328,169]` (fits the 169 px shelf, max y+h = 166).

Reused from Sends Follower (unchanged): the 8-slot native-`live.map` mapper (8× `live.map @strict 1`
→ `live.remote~`, Min/Max scale, `_persistence 1`), the dial value meter, the `---max_send` value bus
and everything downstream of it, the `live.thisdevice` / `loadbang` / `deferlow` init, the 33 ms bang
poller, the version-check notifier branch.

Changed for the inverted (reader) semantics:

- New JS `sends_reader.js` (15731 bytes) replaces `sends_follower.js`. It detects the host track type,
  resolves the device's own track, observes one chosen send's value, and emits it as
  `outlet(0,"max",value)` → `route max` → `send ---max_send` (same downstream contract). It also
  populates the Send dropdown, persists the selection by return id/name, and warns on a feedback loop.
- Repurposed the Peak/Total `live.tab` (`follow_mode`) into a runtime-populated **`umenu`**
  (`send_menu`) for choosing which return's send to read; relabelled the "Mode" comment to "Send".
- Added a `status_label` comment (host-type N/A / feedback warning), `pattr sr_sel` for selection
  persistence, an `init` trigger, and the JS-outlet routing (`route menu select status warn`,
  `route store`, `prepend restoresel`).
- Removed the Sends-Follower return-index detect-to-`build` chain (obj-24..27, 29..33, 36..45) — the
  reader JS does its own detection via observers.
- `node.script` renamed `sf_version_check.js` → `sr_version_check.js`; manifest URL
  `https://fadercraft.com/api/sends-reader.json`, DEVICE_VERSION `1.0`.

Validation: JSON re-parsed (python + jq), 183/190 boxes/lines, zero dangling patchlines, ptch
invariant holds, tail `\n}\x00` preserved, presentation fits 169 px. JS logic verified with a mocked
LiveAPI: read value follows the selected send, selection self-heals by return id across reorder,
host-type guards force value 0 and an N/A status on return/master, anti-feedback emits `warn 1` when
the user selects this track's own send.

State: **unfrozen** (external `sends_reader.js` + `sr_version_check.js` next to the device). Freeze
required before distribution. Archive: `raw/archive/SendsReader.2026-06-18-v1.0.amxd`.

## 2026-06-18 — v1.1 (founder feedback: letter menu + Sum/Max All-aggregate)

Two changes from a post-test feedback round. All v1.0 behaviour kept (host auto-detect, N/A on
return/master, observer self-healing, 8-slot mapper, `pattr` persistence, anti-feedback warning,
169 px height ceiling). New device: md5 `4145a620167ae558a88becf35ee0ad8d`, 118476 bytes,
**187 boxes / 194 lines** (+4 / +4), openrect unchanged `[0,0,328,169]` (max y+h = 166).

**1. Send dropdown now shows letters + `All`.** The `umenu` (`send_menu`) is rebuilt as one letter
per return (`A`, `B`, `C…` by ordinal, regardless of the return's name) followed by a final `All`
item. Internal selection is still stored by return id/name (self-healing unchanged); the `All` item
uses the sentinel `SEL_ALL = -2`, persisted as the token `all`. JS only: `idxToLetter()`,
`allMenuIndex()`, and the `All` branches in `selectsend` / `resolveSelection` / `persistSelection` /
`restoresel`.

**2. Sum / Max switch returned as a separate, visible control.** v1.0 had dropped it when forking
the Sends-Follower Peak/Total tab into the `umenu`. Re-added as a `live.tab` (`agg_mode`, enum
`["Sum","Max"]`, `parameter_longname "Aggregate"`, `parameter_initial [0]` = Sum). To make room it
shares the dropdown's row: `send_menu` narrowed `[5,134,116,16]` → `[5,134,70,16]`, `agg_mode` at
`[79,134,44,16]`. Wiring: `agg_mode` → `prepend aggmode` → JS (`obj-46`); `loadbang` → `delay 300` →
`agg_mode` re-emits the saved value on load. Net +4 boxes (`agg_mode`, `agg_prepend`, `agg_loadbang`,
`agg_delay`) / +4 lines.

**Behaviour:** a single letter → reads exactly that one send (the Sum / Max switch is ignored in the
logic, not greyed out). `All` → `bang()` calls `readAllSends()` over `<own track> mixer_device sends
0..count`: `Sum` adds all knobs (then clamps the total to 1.0), `Max` takes the largest.

`sr_version_check.js` `DEVICE_VERSION` bumped `1.0` → `1.1` (manifest should publish `latest: "1.1"`).

Validation: JSON re-parsed (python + jq) from the installed file, 187/194 boxes/lines, new objects and
all four new patchlines present, `ptch` invariant holds, single trailing `\x00`, presentation fits
169 px. JS logic verified with a mocked LiveAPI: menu builds `A B C All`; a single letter reads that
send; `All` + `Sum` = clamped total (1.0 in the test), `All` + `Max` = the max (0.5); over-1 totals
clamp to 1.0; persistence round-trips (`store all` / `store <id> <name>`); selection self-heals by id
after removing a return. `node --check` clean on both scripts.

State: **unfrozen** (external scripts next to the device). Freeze still required before distribution.
Archive: `raw/archive/SendsReader.2026-06-18-v1.1.amxd` (pre-edit v1.0 archived
`raw/archive/SendsReader.2026-06-18-160000-v1.0-preedit.amxd`).

## 2026-06-18 — v1.2 (founder feedback: drop "All", move Send dropdown, Sum/Max like Sends Follower)

Pure UI / cleanup pass, no change to the patcher object count (still **187 boxes / 194 lines** — all
three JSON edits are `presentation_rect` / `text` only). All other behaviour kept (host auto-detect,
N/A on return/master, observer self-healing, 8-slot mapper, `pattr` persistence, anti-feedback
warning, version-check, 169 px ceiling). New device: md5 `74a7d1e6edae4ba1dab888b84063bfe0`,
118474 bytes, openrect unchanged `[0,0,328,169]` (max y+h = 166, max x+w = 320).

**1. Removed the `All` menu item (JS only).** `rebuildReturnList()` no longer appends `"All"` — the
Send dropdown is **letters only** (`A`, `B`, `C…`). The device now always reads exactly one selected
send. Removed from `sends_reader.js`: the `SEL_ALL` sentinel, the `allMenuIndex()` helper, the
`readAllSends()` walk, and all `SEL_ALL` branches in `selectsend` / `resolveSelection` /
`persistSelection` / `restoresel` / `bang`. The persistence `all` token is gone (only `<id> <name…>`
/ `none`); `selectsend` now no-ops on an out-of-range index (the former `All` slot). Selection
self-healing by return id/name is unchanged.

**2. Moved the Send dropdown to the top-left corner.** `send_menu` presentation_rect
`[5,134,70,16]` → `[5,2,46,14]` (compact, single-letter labels). It sits left of the "New Version"
button (`x54`) and above the dial (`y16`) — no overlap.

**3. Sum / Max switch placed and styled like Sends Follower's Peak/Total switch.** Read the current
on-disk `SendsFollower.amxd` purely as a visual reference (not modified). Took its `follow_mode`
`live.tab` geometry (`[5,134,116,16]`, full-width left column) and its `mode_label` comment
(`[5,118,60,17]`, text "Mode") and applied them to our `agg_mode` and `mode_label`: `agg_mode`
`[79,134,44,16]` → `[5,134,116,16]`; `mode_label` text "Send" → "Mode" (position unchanged). Labels
kept as Sum / Max (only placement / look matched, not the wording). The `live.tab` attributes were
already identical to Sends Follower's (enum, `parameter_type 2`, `parameter_unitstyle 9`,
`parameter_initial [0]`, `parameter_initial_enable 1`).

**Note — Sum / Max is now functionally idle.** With the `All` item gone the device always reads one
value, so there is no aggregate; `Sum == Max == that value`. The switch is kept visible by request
(matches Sends Follower); `aggmode()` still stores its index for a possible future "All" revival, but
`bang()` ignores it. Founder to decide later whether to remove the switch or re-add a real aggregate.

`sr_version_check.js` `DEVICE_VERSION` bumped `1.1` → `1.2` (manifest should publish `latest: "1.2"`).

Validation: JSON re-parsed (python + jq) from the installed file, 187/194 boxes/lines (unchanged),
the three edits confirmed, `ptch` invariant holds, single trailing `\x00`, presentation fits 169 px
(left column: `send_menu [5,2]` / dial `[5,16]` / `mode_label "Mode" [5,118]` / `agg_mode [5,134]` /
`status_label [5,151]`). JS logic verified with a mocked LiveAPI: the menu builds `A B C` only;
switching letters follows the chosen send (0.77 → 0.42 → 0.10); the former `All` index is a harmless
no-op; `aggmode(1)` (Max) leaves a single-send read unchanged. `node --check` clean on both scripts
(`sends_reader.js` 18640 bytes, md5 `acaeed47b318352442869fe8be0b3c94`).

State: **unfrozen** (external scripts next to the device). Freeze still required before distribution.
Archive: `raw/archive/SendsReader.2026-06-18-v1.2.amxd` (pre-edit v1.1 archived
`raw/archive/SendsReader.2026-06-18-165500-v1.1-preedit.amxd`).

## 2026-06-18 — v1.3 (founder feedback: remove the Sum / Max switch entirely)

Founder decision: the Sum / Max switch had been functionally idle since v1.2 (the device reads a
single send, so there is nothing to aggregate), so remove it for good — not a new fork, an iteration
of the same device. Clean removal only; nothing else was repositioned or resized. All other behaviour
kept (host auto-detect, N/A on return/master, observer self-healing, 8-slot mapper, `pattr`
persistence, anti-feedback warning, version-check, letters-only Send dropdown, 169 px ceiling). New
device: md5 `9c0386abc1fb3b1bd597a6d695c33322`, 118474 bytes (size unchanged — length-preserving
repack), openrect unchanged `[0,0,328,169]` (max y+h = 166, max x+w = 320).

**Patcher: removed 5 boxes + 4 lines** (now **182 boxes / 190 lines**). Boxes: `agg_mode` (the
`live.tab` Sum / Max), `agg_prepend` (`prepend aggmode`), `agg_loadbang` (`loadbang`), `agg_delay`
(`delay 300` — the one feeding the tab, not the unrelated Sends-Follower-inherited `obj-6 delay 300`,
which was left intact), and `mode_label` (the "Mode" comment that labelled the switch). Lines:
`agg_mode → agg_prepend`, `agg_prepend → obj-46[0]`, `agg_loadbang → agg_delay`,
`agg_delay → agg_mode`. The JS box `obj-46` keeps four live feeds on inlet 0 (`mode_prepend`,
`obj-35`, `sr_restprep`, `sr_init`), so no inlet was orphaned; zero dangling line endpoints remain.

**JS (`sends_reader.js`): removed all Sum / Max remnants.** Cut the `AGG_SUM` / `AGG_MAX` constants,
the `aggMode` variable, the `function aggmode(m)` handler, the aggregation-mode doc comment block, the
`aggmode <0|1>` line in the inlet-0 message list, and the v1.2 "Sum/Max idle" inline comment in
`bang()`. The single-send read in `bang()`, persistence/restore (`<id> <name…>` / `none` — no `all`
token, already gone in v1.2), and the observers were not touched. `node --check` clean. 18640 →
16993 bytes, md5 `0716dff3808e6d9cd619c6394352a288`.

**Left column after removal:** `send_menu [5,2,46,14]` → `version_link "New Version" [54,4,70,14]` →
dial `[5,16,116,116]` (ends y132) → `status_label [5,151,118,15]`. The y132–151 band where the "Mode"
label and the Sum / Max tab used to sit is left empty by request — nothing was moved or stretched.

`sr_version_check.js` `DEVICE_VERSION` bumped `1.2` → `1.3` (manifest should publish `latest: "1.3"`).

Validation: JSON re-parsed (python + jq) from the installed file, 182/190 boxes/lines, the five boxes
and four lines confirmed gone, no remaining line references a removed id, `ptch` invariant holds
(118442 = filesize − 0x20), prefix and trailing `\x00` byte-identical to the pre-edit file.

State: **unfrozen** (external scripts next to the device). Freeze still required before distribution.
Archive: `raw/archive/SendsReader.2026-06-18-v1.3.amxd` (pre-edit v1.2 archived
`raw/archive/SendsReader.2026-06-18-193718-v1.2-preedit.amxd`).
