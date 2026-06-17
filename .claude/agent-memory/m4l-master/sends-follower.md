---
name: sends-follower
description: SendsFollower.amxd standalone device — paths, container layout, embedded JS, version-check feature, rack round-trip, LFO status. Read before any SendsFollower edit.
metadata:
  type: project
---

# Sends Follower — device facts (m4l-master)

Standalone project, separate from / unrelated to Control XL & Instrument Follower. Project wiki =
`~/Brain/Sends Follower/wiki/` (entities/concepts/index/log; docs in English, run Vale after edits).
Wiki has the functional model (LiveAPI send-gather → max → live.remote~ + buses); don't duplicate.

## Paths
- Device (edit in place): `~/Music/Ableton/User Library/Max Devices/SendsFollower.amxd`
- Archive (dated pre-edit backup, never overwrite): `~/Brain/Sends Follower/raw/archive/SendsFollower.YYYY-MM-DD[-HHMMSS].amxd`
- raw mirror (immutable, read-only): `~/Brain/Sends Follower/raw/SendsFollower.amxd`
- Rack wrapper: `~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack/SendsFollowerRack.adg`
  (chain = Sends Follower → stock LFO). Note older wiki text says `MaxSendsFollower.adg` — actual file is `SendsFollowerRack.adg`.
- Embedded JS on-disk canon copies: `Max Devices/sends_follower.js` (5808 B, since Follow Mode 2026-06-17), `Max Devices/sf_version_check.js` (3106 B).

## Container layout (frozen, mx@c, like Control XL)
- `ampf` header → JSON @48 (BASE 0x20, of32=16) → embedded files → `dlst` dir + `mdat`.
- Resources in dlst (3 after 2026-06-17): patcher (JSON), `sends_follower.js` (TEXT), `sf_version_check.js` (TEXT).
- Invariants: `ptch`(LE@0x1C)=filesize−0x20; `0x30 + mx@c`(BE@0x2C) − dlst_pos = **16**; `dlst total` field = **N_dire×108 + 8** (2→224, 3→332).

## ⚠️ dlst dire record structure (CONFIRMED — reusable craft, see also amxd-format.md Path B)
Each field = `tag(4) + len(4 BE) + value(len−8)`. dire record = `dire + 108(BE) + 100B payload`.
Payload (fixed 100 B): `type`(ln12,4B 'JSON'/'TEXT') + `fnam`(ln28, **20B value null-padded → filename ≤19 chars + null**) + `sz32`(ln12,4B BE) + `of32`(ln12,4B BE, rel to BASE 0x20) + `vers`(ln12) + `flag`(ln12; JSON=17, TEXT=0/8) + `mdat`(ln12, checksum — Live ignores; new file can use 0).
**dires are FLAT (top-level), not nested.** Parse by walking TLV from `dlst+8` to EOF, not by trusting declared dire-len. `dlst total` field is NOT the byte length of payload (it's N×108+8); ignore it when parsing, recompute when writing.
**Filename ≤19 chars** (fnam value 20B incl. null) — `sends_version_check.js` (22) didn't fit → renamed `sf_version_check.js` (19). Check name length when adding a resource.
To add an embedded file (Path B): append body after last existing embedded file; new of32 = prev_end−BASE; rebuild whole dlst with all 3 dire (patch JSON sz32=L1+1, shift trailing-file of32 by ΔL_json, add new dire); patch ptch + mx@c; keep `0x30+mxc−dlst=16`.

## Version-check feature (added 2026-06-17) ✅
Mirror of Control XL update-check, **minus** `hdr_show`/`hdr_hide` (no header object here).
- 11 boxes / 10 lines added: `version_node`(`node.script sf_version_check.js @autostart 1`), `vlink_route`(`route dot url`), `vdot_sel`(`sel 0 1`), `version_link`(textbutton **"New Version"**, mint `[0.235,0.847,0.659,1.0]`, hidden:1, presentation_rect `[46,2,70,16]`), `vlink_show/hide`(`script show/hide version_link`), `vlink_thispatcher`, `vlink_fallback`(`loadmess https://library.gumroad.com`), `vlink_prepend`(`prepend set`), `vlink_store`(message, silent-store), `vlink_open`(`;\rmax launchbrowser $1`).
- Click path = Control XL silent-store v2: url → prepend set → store(message left inlet) → bang on click → vlink_open `$1` from left inlet. Don't use bare `v` (re-emits on receipt → opens browser unprompted).
- JS `sf_version_check.js` = Control XL `version_check.js` byte-for-byte EXCEPT header comment + 2 consts: `DEVICE_VERSION='1.0'`, `URL='https://fadercraft.com/api/sends-follower.json'`. Emits `dot 1/0` + `url <link>` on outlet 0, single `maxApi.post` diag, re-check 30 min.
- Release coupling: bump `DEVICE_VERSION` + manifest `latest` together; button lights when `latest > DEVICE_VERSION`.

## Follow Mode (Max ↔ Sum) feature (added 2026-06-17) ✅
- Mode switch for the follow algorithm: **Max** (per-return maximum of all sends, original behavior, default) ↔ **Sum** (sum of all sends to the return, **clamped to 1.0** so downstream `scale 0. 1.` stays in range and percent monitor ≤ 100%).
- 4 boxes / 4 lines added: `follow_mode` (**live.tab**, presentation_rect `[7,150,116,17]`, parameter_enable=1, enum `["Max","Sum"]`, `parameter_type` 2 / longname "Follow Mode", `parameter_initial` [0] → saved with set + preset, default Max); `mode_prepend` (`prepend mode`); `mode_loadbang` (`loadbang`); `mode_delay` (`delay 300`).
- Wiring: `follow_mode` outlet0 (index) → `prepend mode` → `js` (obj-46) inlet0. Initial value reaches JS on load via `loadbang → delay 300 → follow_mode` (bang makes live.tab re-emit its current/saved index). JS `followMode` also inits to 0 (Max), so even if the bang were late the default is correct.
- JS (`sends_follower.js`): added `var followMode=0`, new `function mode(m)` (parses "mode 0/1"), `bang()` now accumulates sum when followMode==1 with `if(result>1.0)result=1.0`, else max as before. **Output label `"max"` PRESERVED** (`outlet(0,"max",result)`) — downstream `route max`/`---max_send`/percent monitor depend on it; only the computed value changes.
- Percent at Sum ≤ 100% confirmed: clamp to 1.0 → `scale 0. 1. 0. 100.` → ≤ 100.

## Current state (one slice)
- **md5 `7ca595b44db993c8bf91269fbeb7d97a`, 42090 B, 65 box / 65 line** (2026-06-18, Follow Mode Max↔Sum, frozen, REBUILT). Path-B layout: JSON of32=16 sz32=32784; embedded `sends_follower.js` 5808 B of32=32800 flag=0; `sf_version_check.js` 3106 B of32=38608 flag=8 (order: JSON → sends_follower → version_check). dlst total=332, `0x30+mxc−dlst=16`, ptch=filesize−0x20. Both embedded JS = canon byte-for-byte (`29ff530b`/`a5d905fc`), `node --check` clean. Patcher semantically identical to prior on-disk (only whitespace differs — verified sort_keys compact diff). Backup of pre-edit source: `raw/archive/SendsFollower.2026-06-18-002025.amxd` (unfrozen-with-feature source, md5 `3f31990a`, 52813 B); frozen result archived SAME RUN: `raw/archive/SendsFollower.2026-06-18-002423-frozen.amxd`.
- ⚠️ **INCIDENT 2026-06-17→18:** prior frozen `725a06ea` (41504 B) was overwritten/re-frozen by Live on save BEFORE it hit the archive → lost. The on-disk file Live left (`3f31990a`, 52813 B) was, despite "unfrozen" label, ALREADY a valid self-contained freeze (3 dire, both JS embedded = canon, all invariants passed) — just bloated (verbose float serialization, JSON 43518) and unarchived. Rebuilt lean equivalent via Path B from compact `json.dumps(indent=1)` → `7ca595b4`, 42090 B (≈41504 target; ~586 B over = indent-1 vs Max exact whitespace + ordering). LESSON ENFORCED: dated archive of frozen result IMMEDIATELY after freeze, before any Live open.
- Self-contained: patcher + `sends_follower.js` + `sf_version_check.js` all embedded; no external `.js` needed.
- Lost frozen build (Follow Mode, pre-incident): md5 `725a06ea762716e96f13a9b63cb3e3f9`, 41504 B, 65/65 — overwritten by Live, never archived (see incident above). Reproduced by `7ca595b4`.
- Prior frozen build (version-check, no Follow Mode): md5 `b5286b33d9adc12e023981ab1a117859`, 37444 B, 61/61.
- Earlier frozen build (JS-embedded, no version-check): md5 `6b85d12dcff2e412f15ae75897505f20`, 36211 B, 50/51 → backup `raw/archive/SendsFollower.2026-06-17.amxd`.

## Rack round-trip + LFO status (re-verified 2026-06-17)
- `SendsFollowerRack.adg` (file md5 `7c875964319ee6352698ed2c093b1e81`, gzip 6406 B → **88296 B** XML, Live 12.4.2). Internal `UserName` of group dev = `SendsFollowerRack`; `MaxSendsFollower` survives only inside rack's own `LastPresetRef`/`PresetRef` metadata, NOT the file name.
- **Structure:** single-chain `AudioEffectGroupDevice` → 1 `BranchPresets` → 1 `AudioEffectBranchPreset` → 1 `DevicePresets` → exactly **2** `MxDeviceAudioEffect`: (1) Sends Follower (`UserName=send_follower`, FileRef `Max Devices/SendsFollower.amxd`, path type 6), (2) stock LFO (FileRef `Devices/Audio Effects/LFO/Ableton Folder Info/LFO.amxd`, path type 7). No 3rd device, no reorder.
- **FileRef pulls frozen device** (md5 `b5286b33…`): rel + abs path → current User Library `.amxd`, name/path unchanged → loads fine.
- **LFO = STOCK Ableton device**, ships with Live Suite → NOT custom, do NOT bundle.
- ⚠️ Pre-existing: `send_follower.adv` referenced by rack is MISSING, but only in `<LastPresetRef>` metadata, not load path → device still loads from `.amxd` FileRef. `LFO.adv` exists on disk (also only LastPresetRef metadata).
- **Macros/mapping clean after re-save:** 16 default unnamed macros, NO `MacroMappings`/`ControllerTargets`/`MapModeMin/Max`. 26 `ModulationTarget` blocks = empty automation stubs (`LockEnvelope=0` only), not routings. No envelopes. Rack adds zero wiring.
- **`devices 1 parameters 5`** (in the `.amxd` patcher, `path this_device canonical_parent devices 1 parameters 5` → live.path → live.remote~): `devices 1`=LFO; `parameters 5` = the LFO's **Offset** parameter — **founder-confirmed 2026-06-17** (he built it; SF drives the LFO's Offset and nothing else). **CLOSED** in wiki — no more open needs-verification on the modulation write path. NOTE: `.adg` alone can't prove the name (it stores ParameterList ALPHABETICALLY — Depth, Freq Rate, Hold, Jitter, Map1… — NOT LiveAPI index order); don't re-open from `.adg`. Positional addressing is now a **usage caveat** (not a verify item): swap/reorder the 2nd device → target moves off Offset.
- **Bipolar modulation = CONFIRMED design-intent (founder, 2026-06-17).** `scale 0. 1. -100. 100.` (`obj-16`) → bipolar -100..+100; `live.remote~` (`obj-11`) applies a **signed offset** to the target (offsets around base value, doesn't overwrite). Intentional: modulates amount AND direction (follow value pushes target up/down + into negative). Prior needs-verification flag CLOSED in wiki. This is the *character* of the modulation (signed offset, semantics of `live.remote~` + the −100..100 scale). Param identity ALSO now closed: `parameters 5` == LFO's **Offset** (founder-confirmed 2026-06-17, see line above). No open needs-verification left on the modulation path.
- **Size growth 52194→88296 EXPLAINED:** re-save in Live 12.4.2; LFO device block = 62989 B (~71% of file) now serializes LFO's full ~91-entry ParameterList. SF block only ~4699 B. NO embedded samples/audio/blobs (`OriginalFileSize` 21673/542384 = stale FileRef metadata, not embedded data). Delta = pure LFO param-state bloat from newer Live.

## Rack self-containment — `.adg` CANNOT embed the `.amxd` (verified 2026-06-17)
- An `.adg` rack references its M4L device by `FileRef` (`PatchSlot`→`MxPatchRef`→`FileRef RelativePath="Max Devices/SendsFollower.amxd"`, `RelativePathType=6`=RelativeToUserLibrary), **never embeds it**. Proven: 88286 B decompressed XML has **0** `ampf`/`mx@c`/`ptch` bytes; both `MxDBlob` slots empty (`<Blob />`). So a lone `.adg` is NOT device-self-contained — recipient still needs `SendsFollower.amxd` in their User Library `Max Devices/`. There is NO XML field to fold `.amxd` bytes into `.adg`; don't try to fabricate one (would make a broken file). Freeze is an `.amxd`-level op only (our device already frozen, b5286b33). The `<Blob>`/`HasData` slot = Max parameter-state blob, not the device container.
- Single-deliverable routes: **Pack `.alp`** (File>Manage Files>Manage Project>Create Pack — installs `.amxd` into User Library, then rack finds it; `.alp` proprietary gzip+manifest, must export from inside Live, NOT buildable by us) OR ship `.amxd`+`.adg` with a "drop `.amxd` into Max Devices/" step (Control XL model).
- **`.adg` round-trip recipe:** `.adg` = gzip(-9) of XML. `gunzip -c rack.adg > x.xml`; edit; `gzip -c -9 x.xml > new.adg`; validate `xmllint --noout`, gzip magic `1f8b`, round-trip `gunzip(new.adg)==edited xml`. ⚠️ The on-disk `.adg` can change between sessions (re-saved in Live) — always re-`gunzip` the CURRENT disk file right before editing, don't trust an XML extracted earlier in the session.
- **Canonical rack name = `SendsFollowerRack`** (file + group `UserName`). Stale `MaxSendsFollower` is GONE from the current on-disk file (was only in old LastPresetRef metadata). Current `.adg`: md5 `66896a8b2fce2ff050feae0d09d24468`, gzip 6371 B → 88286 B XML. Broken `send_follower.adv` ref persists only in PresetRef/LastPresetRef metadata — harmless, not on load path; leave untouched.

## Distribution note
Manifest `https://fadercraft.com/api/sends-follower.json` + Gumroad NOT touched by me (out of scope) — deploy is a separate explicit step. Device works offline (fallback URL = library.gumroad.com) until manifest is live.
