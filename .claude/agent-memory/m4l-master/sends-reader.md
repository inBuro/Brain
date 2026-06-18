---
name: sends-reader
description: SendsReader.amxd — fork of Sends Follower with inverted semantics (reads ONE send of own ordinary track). Paths, object map, JS contract, unfrozen state. Read before any SendsReader edit.
metadata:
  type: project
---

# Sends Reader — device facts (m4l-master)

Standalone product, **fork of [[sends-follower]] with INVERTED semantics**. Created 2026-06-18.
SF reads "how much the whole set sends INTO this return" (sits on a return). Sends Reader sits on an
ORDINARY audio/MIDI/group track and reads ONE send knob of ITS OWN track (the amount this track sends
to a chosen return) → uses that 0..1 as a modulation source for the same 8-slot mapper.

SF device + SF JS were left **byte-identical** (not touched) when forking — verify SF md5
`ac1dc6f4dfb03c9e89cb1927543df8f2` and `sends_follower.js` `53bdbfbd…` unchanged after any SR work.

## Paths
- Device (edit in place): `~/Music/Ableton/User Library/Max Devices/SendsReader.amxd`
- External JS (next to device, REQUIRED while unfrozen): `sends_reader.js`, `sr_version_check.js`
- Archive (dated pre-edit backup, never overwrite): `~/Brain/Sends Reader/raw/archive/SendsReader.YYYY-MM-DD[-…].amxd`
- raw mirror: `~/Brain/Sends Reader/raw/` (SendsReader.amxd + both JS)
- Project wiki (docs English, Vale; lowercase-hyphen page names): `~/Brain/Sends Reader/wiki/`
  (`entities/sends-reader-device.md`, `index.md`, `log.md`). Hub `~/Brain/Sends Reader/Sends Reader.md`.

## Container layout
- **UNFROZEN Path A**: `ampf` header → JSON from offset 48 → tail `\n}\x00`. NO `dlst`, NO `mx@c`
  chunk, NO embedded resources. `ptch`(LE@0x1C)=filesize−0x20. JSON end = brace-match from 48
  (NOT first-null; first null is at EOF). To edit: extract via brace-counter, edit, rebuild
  `prefix(d[:48]) + new_json + b'\n}\x00'`, fix ptch. (This is how the base SF on-disk file was too —
  Live re-saves devices UNFROZEN with this layout.)
- **For distribution MUST FREEZE** (embed both JS via Path B; filename ≤19 chars — `sr_version_check.js`
  =19 fits). Until then recipients get `js: can't find file`. Freeze recipe = amxd-format.md Path B.

## Built by forking SF on-disk patcher (190/193) → SendsReader (183/190)
Result md5 `2f78a8d03ce2fa692ba447f929930a9a`, 108511 B, **183 box / 190 line**, openrect
`[0,0,328,169]` (fits 169px shelf, max y+h=166).

### Reused UNCHANGED from SF
8-slot native-`live.map` mapper (8× `live.map @strict 1`→remote~, Min/Max scale via `/100`+scale,
`_persistence 1`), dial value meter (obj-3), `---max_send` bus + ALL downstream of it, version-check
branch, `live.thisdevice`/`loadbang`/`deferlow` init (obj-21/22/23), 33ms bang poller (obj-34 msg "1"
→ obj-35 qmetro 33 → js), `route max` (obj-47) → `send ---max_send` (obj-50).

### Changed for reader semantics
- **obj-46 js**: `sends_follower.js`→`sends_reader.js`, numoutlets 1→**3** (0=`max`val, 1=persist,
  2=menu/status/warn).
- **version_node**: `sr_version_check.js`, manifest `https://fadercraft.com/api/sends-reader.json`,
  DEVICE_VERSION `1.0`.
- **follow_mode live.tab (Peak/Total) → `umenu` `send_menu`** (id renamed `follow_mode`→`send_menu`).
  ⚠️ Chose **umenu NOT live.menu**: live.menu can't be runtime-populated reliably; umenu supports
  clear/append. pres_rect `[5,134,116,16]`. outlet0=int idx → `prepend selectsend`(was mode_prepend)→js.
- **mode_label comment "Mode"→"Send"**.
- Added **`status_label`** comment (pres `[5,151,118,15]`, orange) for host N/A + feedback warning.
- Added **`pattr sr_sel @parameter_enable 1 @autorestore 1`** (selection persist); js out1 `store …`
  → `route store`(sr_strrt)→pattr; pattr out0 → `prepend restoresel`(sr_restprep)→js.
- Added js-out2 routing: **`route menu select status warn`**(sr_route2): out0 `menu …`→send_menu;
  out1 `select i`→`prepend set`(sr_menuset)→send_menu (no re-fire); out2 status→`route ok na wait`
  (sr_statrt)→label setters; out3 warn→`sel 1 0`→loop-warn msg / clear → status_label.
- Added `init` trigger: obj-23 deferlow → `delay 250`(sr_initdel)→ msg `init`(sr_init)→js; also
  obj-23→obj-34 (start poller on load).
- **REMOVED** SF return-index detect-to-`build` chain (obj-24..27, 29..33, 36..45) + the redundant
  `mode_loadbang→mode_delay→menu` bang leg. Reader JS does its own detection via observers.
- Inherited **LFO leg** (obj-9..11 `devices 1 parameters 5`) kept but INERT unless a rack LFO exists
  (no-op). SR's primary output = the mapper. Candidate for removal on cleanup.

## JS contract (`sends_reader.js`, 15731 B, node --check clean)
inlets=1, outlets=3. Inputs: `init`, `bang`, `selectsend <i>`, `refreshmenu`, `restoresel <id> <name…>`.
- **detectHost()**: `this_device canonical_parent`.unquotedpath → `tracks N`=NORMAL(work),
  `return_tracks N`=RETURN(N/A), `master_track`=MASTER(N/A). devPathObs(`name`) re-detects on move.
- **read**: NORMAL → `<trackPath> mixer_device sends <M> value` (M from chosen return) → `outlet(0,"max",v)`.
  RETURN/MASTER → `outlet(0,"max",0)` + `status na <text>`.
- **menu**: rebuildReturnList() on init + returnsObs(`live_set` `return_tracks`) → `menu clear`+`append`
  per return; resolveSelection() re-finds index by saved **return id** (fallback name, then first) →
  `select <idx>`. Selection stored by IDENTITY not index (self-healing on add/del/reorder).
- **persist**: persistSelection() → out1 `store <id> <name…>` → pattr. restoresel() from pattr on load.
- **anti-feedback**: selParamObs(`live_set view` `selected_parameter`) → if selected param path starts
  with `<ownTrack> mixer_device sends ` → out2 `warn 1` (warning only; native live.map can't be blocked).
- Verified by mocked-LiveAPI run: read follows selected send (0.77→0.42 on switch), self-heals by id,
  host guards force 0+N/A on return/master, warn 1 on own-send select.

## v1.1 (2026-06-18) — letters menu + Sum/Max All-aggregate
Founder feedback after test. Two changes, both keep all v1.0 invariants (host-detect, N/A, observer
self-heal, 8-slot mapper, pattr persist, anti-feedback warn, 169px ceiling).
- **Menu = letters + All.** umenu now shows `A B C … All` (one LETTER per return, by ordinal, NOT
  return name; `All` appended last). Internal selection still by id/name (self-heal intact). JS-only:
  `rebuildReturnList` appends `idxToLetter(k)` (A=65, wraps AA after Z) + literal `"All"`; helper
  `allMenuIndex()=returnIds.length`.
- **Sum/Max switch RETURNED as separate live.tab** (v1.0 had dropped it when forking SF's Peak/Total).
  New box `agg_mode` (live.tab, enum `["Sum","Max"]`, parameter_longname "Aggregate", `parameter_initial [0]`
  =Sum, `parameter_initial_enable 1` → native persist), pres `[79,134,44,16]`. To make room, **send_menu
  shrunk `[5,134,116,16]`→`[5,134,70,16]`** (letters are short) — both on same row y134, no overlap.
  Wiring: `agg_mode`[0]→`agg_prepend`(`prepend aggmode`)→js obj-46[0]; `agg_loadbang`(loadbang)→
  `agg_delay`(`delay 300`)→`agg_mode`[0] (re-emits saved index on load, mirror of SF mode_loadbang/delay).
  **+4 box / +4 line** (agg_mode, agg_prepend, agg_loadbang, agg_delay). new ids = non-obj-N names.
- **Aggregation semantics:** single LETTER selected → reads exactly that one send (Sum/Max IGNORED in
  logic — not visually disabled). `All` selected → `bang()` calls `readAllSends()` over `<track>
  mixer_device sends 0..count`: AGG_SUM=sum (then global clamp ≤1.0 in bang), AGG_MAX=max. Verified by mock.
- **JS additions:** sentinel `SEL_ALL=-2` for the All selection (distinct from -1 "nothing"); `aggMode`
  (AGG_SUM=0/AGG_MAX=1) + `function aggmode(m)`; `function readAllSends()`; `selectsend(i)` treats
  `i==allMenuIndex()` as All; `resolveSelection`/`persistSelection`/`restoresel` handle SEL_ALL
  (persist token `"all"`, restore `"all"`→SEL_ALL); empty-returns fallback now → All (always present).
- **State:** v1.1 UNFROZEN, device md5 `4145a620167ae558a88becf35ee0ad8d`, 118476 B, **187/190→187/194**
  (187 box / 194 line). `sends_reader.js` md5 `840340c49d552e2fdc078e0727945414` 20953 B (node --check clean).
  `sr_version_check.js` DEVICE_VERSION bumped `1.0`→`1.1` (md5 `e0e13294…`, 3102 B). Archive
  `raw/archive/SendsReader.2026-06-18-v1.1.amxd` (+ both JS dated). Pre-edit v1.0 archived
  `…-160000-v1.0-preedit.amxd`.

## v1.2 (2026-06-18) — remove "All", move Send to top-left, Sum/Max styled like SF
Founder feedback after test. Pure UI/cleanup (NO box/line count change: 187/194 unchanged — all 3
JSON edits are presentation_rect/text only). All v1.0/v1.1 invariants preserved (host-detect, N/A,
observer self-heal, 8-slot mapper, pattr persist, anti-feedback warn, 169px ceiling, version-check).
- **TASK 1 — removed "All" from menu (JS only).** `rebuildReturnList` no longer appends `"All"` —
  menu = ONLY letters `A B C…`. Device ALWAYS reads exactly ONE selected send. Cut: sentinel `SEL_ALL`,
  helper `allMenuIndex()`, `readAllSends()`, and all SEL_ALL branches in `selectsend/resolveSelection/
  persistSelection/restoresel/bang`. persist token "all" gone (only id+name / "none"). selectsend now
  no-ops on out-of-range (old All index). Self-heal by return id/name INTACT. Mock-verified: menu=`A B C`
  only, switching letters follows the chosen send (0.77→0.42→0.10), old idx 3 no-op, aggmode idle.
- **TASK 2 — send_menu → TOP-LEFT.** umenu pres `[5,134,70,16]`→**`[5,2,46,14]`** (compact, single
  letters). y2..16 = no dial overlap (dial y16); x5..51 = no "New Version" overlap (version_link x54..124).
- **TASK 3 — Sum/Max (`agg_mode` live.tab) styled/placed exactly like SF `follow_mode` (Peak/Total).**
  agg_mode pres `[79,134,44,16]`→**`[5,134,116,16]`** (full-width left col, IDENTICAL to SF follow_mode
  geometry). `mode_label` comment text "Send"→**"Mode"**, pres stays `[5,118,60,17]` (= SF mode_label).
  agg_mode's live.tab attrs (Sum/Max enum, type 2, unitstyle 9, initial [0], initial_enable 1) were
  ALREADY = SF's — only rect/label changed. Labels kept Sum/Max (per ask, not Peak/Total).
  ⚠️ SF reference read live (on-disk SF, Live re-saving it; frozen, JSON@48). SF dial/label/tab geometry:
  dial `[5,16,116,116]`, mode_label `[5,118,60,17]`, follow_mode `[5,134,116,16]` — Sends Reader now 1:1.
- ⚠️ **Sum/Max is FUNCTIONALLY IDLE in v1.2** (founder informed): after "All" removed, device reads ONE
  value → no aggregate → Sum==Max==that value. `aggmode()` still stores the index (for future "All"
  revival) but `bang()` ignores it. Kept VISIBLE per founder (wants SF look). To make it real again:
  re-add "All" menu item + `readAllSends()`.
- **State:** v1.2 UNFROZEN, device md5 `74a7d1e6edae4ba1dab888b84063bfe0`, 118474 B, **187 box / 194
  line**. `sends_reader.js` md5 `acaeed47b318352442869fe8be0b3c94` 18640 B (node --check clean).
  `sr_version_check.js` DEVICE_VERSION 1.1→1.2 (md5 `4362747a3ea62626e3e1ed6274cc22d2`, 3102 B). Archive
  `raw/archive/SendsReader.2026-06-18-v1.2.amxd` (+ both JS dated). Pre-edit v1.1 archived
  `…-165500-v1.1-preedit.amxd`.

## State (one slice)
- **v1.2 UNFROZEN** (CURRENT), device md5 `74a7d1e6edae4ba1dab888b84063bfe0`, 118474 B, **187 box /
  194 line**, openrect `[0,0,328,169]` (MAX y+h=166, MAX x+w=320). External JS: `sends_reader.js`
  `acaeed47…` 18640B, `sr_version_check.js` `4362747a…` 3102B (DEVICE_VERSION 1.2). Archive
  `raw/archive/SendsReader.2026-06-18-v1.2.amxd`. Left col now: send_menu `[5,2,46,14]` / dial
  `[5,16,116,116]` / mode_label "Mode" `[5,118,60,17]` / agg_mode Sum/Max `[5,134,116,16]` /
  status_label `[5,151,118,15]`. Menu = letters only (no All); Sum/Max idle (single send).
- Prior **v1.1 UNFROZEN**, device md5 `4145a620167ae558a88becf35ee0ad8d`, 118476 B, 187/194. External JS:
  `sends_reader.js` `840340c4…` 20953B, `sr_version_check.js` `e0e13294…` 3102B (DEVICE_VERSION 1.1).
  Archive `raw/archive/SendsReader.2026-06-18-v1.1.amxd`. Menu = `A B C … All`, Sum/Max real for All.
- Prior **v1.0 UNFROZEN**, md5 `2f78a8d03ce2fa692ba447f929930a9a`, 108511 B, 183/190. Archive
  `raw/archive/SendsReader.2026-06-18-v1.0.amxd`. JS `sends_reader.js` 15731B, `sr_version_check.js` 3102B.
- **Open items**: (1) FREEZE before distribution; (2) hardware test in Live not done (mock only);
  (3) consider removing inert LFO leg; (4) deploy manifest `…/api/sends-reader.json` with `latest:"1.2"`;
  (5) decide whether to remove the now-idle Sum/Max switch OR re-add real "All" aggregate.
- ⚠️ Repack = UNFROZEN Path: `prefix=d[:0x20]` (32B, ends with ptch LE) + new JSON (from 0x20) + single
  `b'\x00'` at EOF; fix `ptch`(LE@0x1C)=fs−0x20. NO mx@c subheader, NO dlst (those appear only after freeze).
