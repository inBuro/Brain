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
- Embedded JS on-disk canon copies: `Max Devices/sends_follower.js` (4021 B), `Max Devices/sf_version_check.js` (3106 B).

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

## Current state (one slice)
- **md5 `b5286b33d9adc12e023981ab1a117859`, 37444 B, 61 box / 61 line** (2026-06-17, version-check added + frozen).
- Self-contained: patcher + `sends_follower.js` + `sf_version_check.js` all embedded; no external `.js` needed.
- Prior frozen build (JS-embedded, no version-check): md5 `6b85d12dcff2e412f15ae75897505f20`, 36211 B, 50/51 → backup `raw/archive/SendsFollower.2026-06-17.amxd`.

## Rack round-trip + LFO status (re-verified 2026-06-17)
- `SendsFollowerRack.adg` (file md5 `7c875964319ee6352698ed2c093b1e81`, gzip 6406 B → **88296 B** XML, Live 12.4.2). Internal `UserName` of group dev = `SendsFollowerRack`; `MaxSendsFollower` survives only inside rack's own `LastPresetRef`/`PresetRef` metadata, NOT the file name.
- **Structure:** single-chain `AudioEffectGroupDevice` → 1 `BranchPresets` → 1 `AudioEffectBranchPreset` → 1 `DevicePresets` → exactly **2** `MxDeviceAudioEffect`: (1) Sends Follower (`UserName=send_follower`, FileRef `Max Devices/SendsFollower.amxd`, path type 6), (2) stock LFO (FileRef `Devices/Audio Effects/LFO/Ableton Folder Info/LFO.amxd`, path type 7). No 3rd device, no reorder.
- **FileRef pulls frozen device** (md5 `b5286b33…`): rel + abs path → current User Library `.amxd`, name/path unchanged → loads fine.
- **LFO = STOCK Ableton device**, ships with Live Suite → NOT custom, do NOT bundle.
- ⚠️ Pre-existing: `send_follower.adv` referenced by rack is MISSING, but only in `<LastPresetRef>` metadata, not load path → device still loads from `.amxd` FileRef. `LFO.adv` exists on disk (also only LastPresetRef metadata).
- **Macros/mapping clean after re-save:** 16 default unnamed macros, NO `MacroMappings`/`ControllerTargets`/`MapModeMin/Max`. 26 `ModulationTarget` blocks = empty automation stubs (`LockEnvelope=0` only), not routings. No envelopes. Rack adds zero wiring.
- **`devices 1 parameters 5`** (in the `.amxd` patcher, `path this_device canonical_parent devices 1 parameters 5` → live.path → live.remote~): `devices 1`=LFO; LFO has >>6 params so idx5 in range. **Exact LFO param at idx5 unconfirmed** — `.adg` stores ParameterList ALPHABETICALLY (Depth, Freq Rate, Hold, Jitter, Map1…) which is NOT LiveAPI index order → resolvable only live. Don't trust `.adg` order for LiveAPI index. STILL the only open live-verify item on the write path.
- **Bipolar modulation = CONFIRMED design-intent (founder, 2026-06-17).** `scale 0. 1. -100. 100.` (`obj-16`) → bipolar -100..+100; `live.remote~` (`obj-11`) applies a **signed offset** to the target (offsets around base value, doesn't overwrite). Intentional: modulates amount AND direction (follow value pushes target up/down + into negative). Prior needs-verification flag CLOSED in wiki. NOTE: this is about the *character* of the modulation (signed offset, semantics of `live.remote~` + the −100..100 scale) — NOT a claim that the LFO target param is literally named "Offset". Param identity stays unresolved (see line above). If asked again whether `parameters 5` == LFO's "Offset" param: can't tell from `.adg`/patch (alpha order ≠ LiveAPI idx), ask user / read live.
- **Size growth 52194→88296 EXPLAINED:** re-save in Live 12.4.2; LFO device block = 62989 B (~71% of file) now serializes LFO's full ~91-entry ParameterList. SF block only ~4699 B. NO embedded samples/audio/blobs (`OriginalFileSize` 21673/542384 = stale FileRef metadata, not embedded data). Delta = pure LFO param-state bloat from newer Live.

## Distribution note
Manifest `https://fadercraft.com/api/sends-follower.json` + Gumroad NOT touched by me (out of scope) — deploy is a separate explicit step. Device works offline (fallback URL = library.gumroad.com) until manifest is live.
