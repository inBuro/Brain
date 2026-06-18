# Change log

Append-only. Newest first.

## 2026-06-18 — 8-slot mapper (replaces the single Map button)

Replaced the single Map-button experiment with a full **8-slot mapper** on the device face, mirroring
the stock LFO's mapping list (Parameter / Mode / Range). Each slot maps Sends Follower's own follow
value onto any clicked Live parameter, **bypassing the LFO**, with its own Min/Max range. The LFO leg
(`obj-11` → the next device's Offset) is untouched; eight independent `live.remote~` objects drive the
user targets in parallel. Re-frozen via Path B (both the patcher JSON and the embedded
`sends_follower.js` grew).

Action taken (via m4l-master, Live running but the device file not held open — `lsof` empty):

- **Base** was the on-disk User Library device (md5 `c5b736c5…`, 67606 bytes, 82/84), which carried the
  founder's hand-edits (single Map row moved to the top, `openrect` height back to 169, his own
  `map_target` object). The 8-slot list is his explicit request that **supersedes** the single Map
  experiment, so the single-Map objects were folded into the mapper; the dial, Mode switch/label,
  version-check, the LFO `live.remote~` leg, the `route max` label, and the observer logic were kept.
  The on-disk device was archived first as
  `raw/archive/SendsFollower.2026-06-18-134954-preedit-8slot-ondisk.amxd`.
- Note: that on-disk file had been re-frozen by Live with a **stale** embedded `sends_follower.js`
  (`29ff530b…`, 5808 bytes, no observers, no map subsystem) even though the canon `sends_follower.js`
  next to it was current. The new freeze re-embeds the current (now 8-slot) JS, so the device and its
  canon JS are back in sync.
- **Patcher:** removed 16 single-Map boxes, added the 8-slot table → **256 boxes / 274 lines** (from
  82/84). Per slot (×8): `live.text` Map toggle (`mode 1`), `live.text` X (stock svg), `comment` target
  label, static "Remote" Mode label, two `live.numbox` Min/Max (`parameter_enable 1`), a per-slot
  `route path name arm store release`, `live.path` + `prepend path`, `prepend set` (name/arm),
  `prepend store` + `pattr slot_N_path`, `prepend restorepath N`, `message id 0`, `live.remote~`,
  `scale 0. 1. 0. 1.` + `sig~`, `/ 100.` ×2 for Min/Max, `prepend arm N`, `t b` + `message unmap N`.
  Shared: `route 0 1 2 3 4 5 6 7` (demultiplexes the JS map outlet by slot index), header/sub-label
  comments. `obj-46` (the `js` box) kept two outlets.
- **JS (`sends_follower.js`):** slot-indexed the map subsystem (`NSLOTS = 8`): `arm <slot> 0/1`
  (single-arm — arming one disarms the previous), `unmap <slot>`, `restorepath <slot> <tokens…>`,
  per-slot `slotPath[]` / `slotRetry[]`, `captureTarget(slot, path)`, `resolveAndConnect(slot)`,
  `retryResolve(slot)` (defer/retry ladder, same anti-race as the return index), `emitTargetName(slot)`,
  `persistPath(slot)`. Outlet-1 messages now lead with the slot index (`<slot> path|name|arm|store|
  release …`). The follow-value path (`outlet(0, "max", result)`), Peak/Total mode, and observer-based
  return-index detection are unchanged. `node --check` clean (md5 `53bdbfbd…`, 24242 bytes).
- **Signal source change:** each slot taps the **raw** follow value 0…1 (`obj-7 receive ---max_send`),
  not the bipolar −100…100 leg the old single Map used, and scales it into `[Min/100 … Max/100]` so
  Min/Max behave exactly like a stock LFO map row.
- **Layout:** `openrect` `[…,169]` → `[0, 0, 340, 385]` (wider + taller, like a stock LFO map list —
  expected and agreed for the full 8-row list). Top controls (dial, Mode, "New Version") unchanged;
  the table sits below. Visually close, not pixel-identical to Ableton's mapping list.
- **Container (Path B):** JSON 57668 → 147778 bytes (sz32 147779); embedded order JSON → svg → version
  check → `sends_follower.js`; the `sends_follower.js` body grew 5808 → 24242 bytes; `sf_version_check.js` (`a5d905fc…`,
  3106 bytes) and `multimap-unmap.svg` (`1a31f546…`, 535 bytes) unchanged. `dlst total` = 440 (4
  resources), `0x30 + mxc − dlst = 16`, `ptch = filesize − 0x20`. Result device md5 **`194ff283…`,
  176150 bytes, 256 boxes / 274 lines**, self-contained. Frozen archive
  `raw/archive/SendsFollower.2026-06-18-135002-8slot-mapper-frozen.amxd`.
- **Validation:** JSON re-parse (Python + `jq`), brace/bracket balance 0; no duplicate ids, no dangling
  lines, no out-of-bounds inlet/outlet; 8× `live.remote~` / Map toggle / `pattr` / Min / Max / `scale`
  present and wired; preserved features verified (`route max`, `obj-9` LFO path, `obj-11` LFO remote,
  `obj-16` bipolar, `follow_mode` live.tab, "Mode" label, `version_link`, `version_node`); embedded
  `sends_follower.js` `node --check` clean; all container invariants hold.

**Reload note:** remove the device from the track and drag it back in (or reload the M4L device) so Live
drops its cached copy. If the device is open in the Max editor, close it **without saving** so the
in-memory version does not overwrite this freeze.

## 2026-06-18 — Map button (direct parameter mapping, second live.remote~)

Added a front-panel **Map** button to the frozen User Library device. It maps Sends Follower's own
bipolar follow signal directly onto any Live parameter the user clicks, **bypassing the LFO**. The
existing LFO leg (`obj-11` → the next device's Offset) is untouched; a **second** `live.remote~`
(`map_remote`) drives the user target in parallel. Re-frozen via Path B (both the patcher JSON and the
embedded `sends_follower.js` grew, so the embedded resource offsets and the size fields were
recomputed).

Action taken (via m4l-master, Live closed):

- **Base** was the clean frozen build `raw/archive/SendsFollower.2026-06-18-113530-frozen.amxd` (md5
  `5a8ba853…`, 49134 bytes, 66/65), not the on-disk file (Live had unfrozen it on save). The on-disk
  device was archived first as `raw/archive/SendsFollower.2026-06-18-120211-predmap-ondisk.amxd` (md5
  `55726d24…`).
- **Patcher:** +16 boxes / +20 lines (66/65 → 82/85). New objects: `map_button` (`live.text` Map
  toggle), `map_unmap` (`live.text` "X", stock `multimap-unmap.svg`), `map_label` (target-name
  comment), `map_route`, `map_arm_set`, `map_pathprep`, `map_path` (`live.path`), `map_lblset`,
  `map_id0` (`id 0`), `map_remote` (second `live.remote~`), `map_sig` (`sig~` tap from `obj-16`),
  `map_pattr` (`pattr map_target @parameter_enable 1 @autorestore 1`), `map_restoreprep`,
  `map_arm_send`, `map_unmap_tb`, `map_unmap_msg`. The `js` box (`obj-46`) was bumped from one outlet
  to two (outlet 1 = map control).
- **Embedded JS:** `sends_follower.js` extended with `outlets = 2`, an `arm`/`unmap`/`restorepath`
  message set, a `live_set view selected_parameter` observer that captures the next clicked parameter
  only while armed, a defer/retry resolve ladder for cold-load, and `pattr`-backed persistence. The
  follow-value output (`outlet(0, "max", result)`) and the return-index observers are unchanged. New
  md5 `c63475322970c9f8ea02d01620806551`, 22368 bytes, `node --check` clean.
- **Icon:** the unmap "X" uses the real stock Cycling '74 asset `multimap-unmap.svg` from the built-in
  "Max for Live" Max package, referenced by filename (on the Max search path on every Live install), so
  it is **not** embedded and will not cause a missing-file error for buyers. The Map toggle recreates
  the stock LFO Map look (colors read from `liveui.map.maxpat` `obj-48`: grey idle, orange when armed)
  because Live's Map button is a `live.text` toggle, not a shareable image.
- **Layout:** `openrect` height grew 169 → 196 (+27) to add the Map row at presentation `y = 172`,
  below the Mode switch. No overlaps with the dial, the Mode switch, or the "New Version" button.
- **Container (Path B):** JSON of32 = 16 / sz32 = 42632; `sends_follower.js` of32 = 42648 /
  sz32 = 22368; `sf_version_check.js` of32 = 65016 / sz32 = 3106 (md5 `a5d905fc…`, unchanged). dlst
  still 3 resources (total field 332); invariants held: `0x30 + mx@c − dlst = 16`,
  `ptch = filesize − 0x20`. Path-B note: the prefix copied into the new container must include the
  `mx@c` sub-header at `0x20`–`0x30`, i.e. the first **48** bytes (the JSON starts at `0x20 + 16 = 48`).
- **Result:** device md5 `6f156eab973ecec0d9793f794c75cfce`, 68498 bytes, 82 boxes / 85 lines,
  self-contained. Frozen archive `raw/archive/SendsFollower.2026-06-18-121509-frozen.amxd`.
- **Validation:** JSON re-parsed (Python `json.loads` + `jq -e`), brace/bracket balance 0, first `{`
  last `}`; all 16 new objects present and all patchlines in range (0 bad); both `live.remote~` objects
  present (`obj-11` + `map_remote`); all prior features intact (LFO leg, `route max`, Mode switch,
  return-index observers, version notifier, `outlet(0,"max",…)` label); embedded JS bytes match the
  on-disk canon. See [[concepts/map-button|Map button]].

## 2026-06-18 — cosmetic relabel: Mode switch (Peak / Total) + "Mode" label

Cosmetic patcher pass on the frozen User Library device. Three patcher-only edits (the embedded JS was
not touched). Re-frozen via Path B (the patcher JSON grew by 549 bytes, so the embedded resource
offsets and the size fields were recomputed; both JS bodies were re-embedded byte-for-byte).

Action taken (via m4l-master):

- **Pre-edit state** already archived (byte-identical to the on-disk device) as
  `raw/archive/SendsFollower.2026-06-18-110402-frozen.amxd` (md5 `bd21b848…`, 48585 B); not
  re-archived.
- **Edit 1 — switch labels:** the `follow_mode` `live.tab` enum was renamed from `["Max","Sum"]` to
  `["Peak","Total"]`. The index-to-behavior mapping is unchanged: Peak = index 0 = old Max (running
  maximum, default), Total = index 1 = old Sum (clamped sum). The JS `mode 0/1` handler is unchanged.
- **Edit 2 — parameter name:** the parameter long name and short name were renamed from "Follow Mode"
  to **"Mode"**. The `varname` stays `follow_mode` so the existing patch cords (by object id) are not
  broken; no saved preset existed, so the long-name change is safe.
- **Edit 3 — label:** a `comment` reading **"Mode"** (`mode_label`, Arial Bold 9, grey) was added in
  the presentation view directly above the switch. The device had no existing comment idiom, so a
  Live-theme grey comment was used. To open room above the switch, the `live.tab` moved down from
  presentation rect `[7,134,116,17]` to `[7,150,116,17]`; the label sits at `[7,134,60,14]`. No
  overlap with the dial, switch, or "New Version" button (presentation height 169).
- **Result device:** md5 `5a8ba853a3c31d80cb84870e977a13f4`, 49134 bytes, **66 boxes / 65 lines**
  (+1 box for the label; lines unchanged). Frozen, self-contained. Both embedded JS resources are
  byte-for-byte identical to before (`sends_follower.js` md5 `3bc5ab8e…`, 12303 B, with the
  return-index observers; `sf_version_check.js` md5 `a5d905fc…`, 3106 B). The output `"max"` label,
  the `route max` path, and the Follow Mode wiring (`mode_prepend` / `mode_loadbang` / `mode_delay`)
  are intact.
- **Frozen result archived** immediately as
  `raw/archive/SendsFollower.2026-06-18-113530-frozen.amxd`.
- **Validation:** JSON re-parsed (Python + `jq -e`), brace/bracket balance 0; enum `["Peak","Total"]`
  with default index 0; parameter long name "Mode", `varname` `follow_mode`, `parameter_enable` 1;
  label present without a colon and not overlapping neighbours; both JS bodies byte-for-byte equal to
  the previous build (`node --check` clean on `sends_follower.js`); container invariants
  (`ptch == filesize − 0x20`, `dlst` total 332, `0x30 + mx@c − dlst == 16`, tail `mdat` preserved).

Reminder: do not open this device in the Max editor and save from there; Live caches the loaded
device, so reload it (remove and re-add to the track, or reload the M4L device).

## 2026-06-18 — re-freeze: self-healing return-index fix embedded

The return-index freeze bug (the device kept following the first return's sends after the index was
resolved once — see [[concepts/self-healing-return-index]]) was fixed in the external canon
`sends_follower.js` by moving detection into the script and keeping it live with LiveAPI property
observers (device-move, `return_tracks`, `tracks`). With Live closed, that script was embedded into
the frozen device (Path B) in place of the old body.

Action taken (via m4l-master):

- **Pre-edit state** already archived (byte-identical to the on-disk device) as
  `raw/archive/SendsFollower.2026-06-18-002423-frozen.amxd` (md5 `7ca595b4…`, 42090 B); not
  re-archived.
- **Embedded resource swap only** — the patcher (65 boxes / 65 lines, Follow Mode intact) was not
  touched. The embedded `sends_follower.js` went from the old body (md5 `29ff530b…`, 5808 B, no
  observers) to the new canon (md5 `3bc5ab8e…`, 12303 B, observers). `sf_version_check.js`
  (md5 `a5d905fc…`, 3106 B) kept as-is. ΔL = +6495 B.
- **Container patched (Path B):** `sends_follower.js` `sz32` 5808 → 12303 (`of32` unchanged 32800);
  `sf_version_check.js` `of32` 38608 → 45103 (`sz32` unchanged); JSON resource unchanged
  (`of32` 16, `sz32` 32784); `ptch` and `mx@c` each += 6495; `dlst total` 332,
  `0x30 + mx@c − dlst = 16`, `ptch = filesize − 0x20` all held. Resource order JSON →
  `sends_follower.js` → `sf_version_check.js` preserved.
- **Validated before install:** JSON re-parsed (`json.loads` + `jq -e`), brace/bracket balance 0,
  65 / 65 boxes / lines, three `dire` records in `dlst`, both embedded scripts byte-for-byte against
  canon and `node --check` clean, Follow Mode objects (`follow_mode`, `mode_prepend`, `mode_loadbang`,
  `mode_delay`) and the `route max` / `---max_send` output labels present.
- **Result:** md5 `bd21b848…`, 48585 B, self-contained (both JS embedded — no external `.js` needed).
  Installed to the User Library device and archived immediately as
  `raw/archive/SendsFollower.2026-06-18-110402-frozen.amxd`.

Rack `.adg`, the version manifest, and Gumroad were not touched.

## 2026-06-18 — frozen build rebuilt after Live overwrote the lost freeze

The Follow Mode frozen build from 2026-06-17 (md5 `725a06ea…`, 41504 B) was lost: Live was open when
the device was saved and it re-froze the device in place, overwriting that build **before it reached the
archive**. The file Live left on disk (md5 `3f31990a…`, 52813 B) was inspected and, despite being
labelled "unfrozen", was in fact **already a valid self-contained freeze**: three `dire` records in the
`dlst`, both JS embedded byte-for-byte against the canon copies, and every container invariant passing.
It was simply bloated (verbose float serialization grew the patcher JSON to 43518 B) and not archived.

Action taken (via m4l-master):

- **Pre-edit backup** of the on-disk source: `raw/archive/SendsFollower.2026-06-18-002025.amxd`
  (md5 `3f31990a…`, 52813 B) — this preserves the lost-link patcher that carries the feature.
- **Patcher verified clean** (no Live-injected garbage): 65 boxes / 65 lines, all feature objects present
  (`follow_mode`, `mode_prepend`, `mode_loadbang`, `mode_delay`, `js sends_follower.js`,
  `node.script sf_version_check.js`), wiring and the `follow_mode` parameter registration intact. No
  boxes were added, removed, or moved — the rebuilt patcher is **semantically identical** to the
  source (only JSON whitespace differs).
- **Rebuilt lean via Path B** from a compact `json.dumps(indent=1)` serialization: patcher JSON 32783 B
  (`of32` 16, `sz32` 32784), embedded `sends_follower.js` 5808 B (`of32` 32800, flag 0), embedded
  `sf_version_check.js` 3106 B (`of32` 38608, flag 8); resource order JSON → `sends_follower.js` →
  `sf_version_check.js`. `dlst` total 332, `0x30 + mx@c − dlst = 16`, `ptch = filesize − 0x20`.
- **New frozen build:** md5 `7ca595b44db993c8bf91269fbeb7d97a`, **42090 B**, 65 boxes / 65 lines. This is
  ≈ the 41504 B target (the ~586 B difference is `indent=1` whitespace versus Max's exact spacing).
- **Validation passed:** Python `json.loads` and `jq -e .` on the extracted patcher, brace/bracket
  balance 0, both embedded JS match the canon files byte-for-byte (`sends_follower.js` `29ff530b…`,
  `sf_version_check.js` `a5d905fc…`), `node --check` clean on the embedded `sends_follower.js`, all
  container invariants hold.
- **Self-contained confirmed:** the patcher plus both `.js` are embedded; no external `.js` is required
  to run the device.
- **Frozen result archived immediately** (the lesson from the incident):
  `raw/archive/SendsFollower.2026-06-18-002423-frozen.amxd` (byte-for-byte identical to the deployed
  device). The `raw/SendsFollower.amxd` mirror (older `6b85d12d…`) is left untouched per the
  immutable-inputs rule.

**Operator note:** on the next load in Live, do **not** open the device in the Max editor and save from
there — that re-freezes/overwrites the file. Normal loading and use does not break the freeze.

## 2026-06-17 — Follow Mode (Max / Sum) switch added

Added a saved, preset-aware UI switch that selects the follow algorithm: **Max** (per-return maximum of
all sends, the original behavior, default) or **Sum** (sum of all sends to the return, clamped to 1.0).

- **New control:** `live.tab` (object id `follow_mode`, parameter name `Follow Mode`, enum `Max` / `Sum`,
  `parameter_type` Enum, `parameter_initial` index 0 = Max). It is parameter-enabled, so it saves with
  the set and with device presets. Placed in presentation under the dial at `[7, 150, 116, 17]`.
- **Wiring:** `follow_mode` outlet 0 (selected index) → `prepend mode` (`mode_prepend`) →
  `js sends_follower.js` (obj-46) inlet 0, delivering `mode 0` / `mode 1`. The initial/saved value is
  pushed to the JS on load via `loadbang` → `delay 300` → `follow_mode` (banging the tab makes it
  re-emit its current index). The JS also initializes `followMode = 0` (Max), so even a late bang leaves
  the default behavior intact.
- **JS (`sends_follower.js`):** new `var followMode` state and a `mode(m)` handler; `bang()` now
  accumulates a sum when in Sum mode and clamps `if (result > 1.0) result = 1.0`, otherwise takes the
  max as before. The output label `"max"` is **unchanged** (`outlet(0, "max", result)`) because the
  downstream routing (`route max`, `---max_send` bus, percent monitor) keys on that word — only the
  computed value differs.
- **Percent at Sum stays ≤ 100%:** the 1.0 clamp keeps the value in the 0..1 range the downstream
  `scale 0. 1. ...` expects, so the percent monitor (`scale 0. 1. 0. 100.`) never exceeds 100.
- **Device:** rebuilt and re-frozen via Path B (both the JSON length and the embedded
  `sends_follower.js` body changed; dlst `of32`/`sz32` recomputed, `ptch`/`mx@c` patched, dlst total
  stays 332). New md5 `725a06ea762716e96f13a9b63cb3e3f9`, 41504 B, 65 boxes / 65 lines (was
  `b5286b33…`, 37444 B, 61 / 61). Embedded `sends_follower.js` = 5808 B; `sf_version_check.js` unchanged
  byte-for-byte. Pre-edit backup: `raw/archive/SendsFollower.2026-06-17-231811.amxd`.

## 2026-06-17 — embed-in-rack investigation: not possible via XML; rack stays referenced

Investigated making `SendsFollowerRack.adg` a self-contained single file with the `.amxd` device
**embedded (frozen-in)** so it loads on a machine that has no `SendsFollower.amxd` in its User
Library. **Conclusion: an `.adg` cannot embed a Max for Live device; it references the device by `FileRef`.**

- **Proven from the file:** decompressed the current rack to 88286 B XML and searched it. Zero `.amxd`
  container bytes inside — `ampf`/`mx@c`/`ptch` = 0 occurrences. Both `MxDBlob` slots are empty
  (`<Blob />`, `HasData=true` is a state-blob slot, not the device container). The device is pulled by
  `PatchSlot` → `MxPatchRef` → `FileRef RelativePath="Max Devices/SendsFollower.amxd"`,
  `RelativePathType=6` (= RelativeToUserLibrary). So on a recipient's machine the rack resolves the
  device **relative to their User Library**; with no `SendsFollower.amxd` there, the device slot loads
  empty. This is the architectural reason a lone `.adg` is not self-contained.
- **Freeze is an `.amxd`-level operation, not an `.adg`-level one.** Our device is already frozen and
  self-contained (md5 `b5286b33…`, JS embedded). Live offers no XML field to bundle the `.amxd` bytes
  into the `.adg`. The supported single-deliverable routes are a **Pack (`.alp`)** (File > Manage
  Files > Manage Project > Create Pack — installs the `.amxd` into the User Library, then the rack
  finds it by FileRef) or shipping `.amxd` + `.adg` together with a "drop the `.amxd` into
  `Max Devices/`" step. `.alp` is proprietary (gzip + manifest) and **cannot be built safely without
  Live** — it needs an in-Live export.
- **Name unification — already clean on disk.** The mockup/landing copy said `MaxSendsFollower.adg`;
  the canonical name is now **`SendsFollowerRack.adg`** (file on disk + group `UserName`). The current
  on-disk rack already carries `SendsFollowerRack` in every `LastPresetRef`/`PresetRef` — the stale
  `MaxSendsFollower` string from earlier saves is gone. Nothing to change there.
- **Broken `send_follower.adv` ref:** still present, but only inside `PresetRef`/`LastPresetRef`
  metadata (3 spots), never on the device load path — harmless, does not block loading. Left
  structurally untouched (removing nodes is unverifiable without a Live re-save and risks the schema).
- **File on disk NOT replaced** — nothing to change would improve self-containment or loading. Current
  rack: md5 `66896a8b2fce2ff050feae0d09d24468`, gzip 6371 B → 88286 B XML, two `MxDeviceAudioEffect`
  (Sends Follower + stock LFO), both referenced. Dated archive made before inspection:
  `raw/archive/SendsFollowerRack.2026-06-17-224744.adg` (byte-identical to disk).

## 2026-06-17 — bipolar modulation confirmed as design-intent (doc-only)

Founder confirmed that the `live.remote~` (`obj-11`) modulation is meant to apply a **signed
(bipolar) offset** to its target — the device modulates both the amount and the direction of the
follow value, pushing the parameter up or down around its base value and into the negative region.
This resolves the long-standing needs-verification flag on the bipolar `scale 0. 1. -100. 100.`
mapping (`obj-16`): it is **intentional**, not a unipolar 0…100 mistake.

- `entities/sends-follower-device.md`: Status row "Writes follow value … via modulation" moved from
  Needs verification to Works (signed offset, founder-confirmed), with the only remaining live-only
  unknown scoped to *which* parameter `devices 1 parameters 5` is. Limitations section: the bipolar
  mapping point is now a confirmed design-intent item; positional-target point kept and re-scoped to
  the exact-parameter live-verify only.
- `concepts/live-remote-modulation-chain.md`: intro and signal-feed section now state the signed
  offset and the intentional bipolar mapping.
- **Still open (live-verify only):** the exact LFO parameter that `devices 1 parameters 5` resolves
  to. The `.adg` stores the parameter list alphabetically, not in LiveAPI index order, so it is
  resolvable only at runtime in Live. Not closed.
- Doc-only: device, `.adg`, and site untouched; no backup needed.

## 2026-06-17 — rack re-verification closed (read-only)

Re-checked the current `SendsFollowerRack.adg` (gzip 6406 B → 88296 B XML, md5 of the `.adg`
`7c875964319ee6352698ed2c093b1e81`) and closed the re-verification flag in
`concepts/adg-rack-wrapper.md`. Findings:

- **Chain unchanged:** single-chain `AudioEffectGroupDevice` → one branch → exactly two devices in
  order (1) Sends Follower (`MxDeviceAudioEffect`, `UserName=send_follower`, FileRef
  `Max Devices/SendsFollower.amxd`, path type 6), (2) stock LFO (FileRef
  `Devices/Audio Effects/LFO/Ableton Folder Info/LFO.amxd`, path type 7). No third device, no reorder.
- **FileRef pulls the frozen device:** relative + absolute paths point at the current User Library
  `SendsFollower.amxd` (md5 `b5286b33d9adc12e023981ab1a117859`, 37444 B). Name/path unchanged → freeze
  loads. The missing `send_follower.adv` is only in `LastPresetRef` metadata, not the load path
  (harmless). `<OriginalFileSize>` values (21673 / 542384) are stale FileRef metadata.
- **Macros/mapping still clean after the re-save:** 16 default unnamed macros (`Macro 1…16`), no
  `MacroMappings`/`ControllerTargets`/`MapModeMin/Max`. The 26 `ModulationTarget` blocks are empty
  automation stubs (`<LockEnvelope Value="0" />` only), not routings. No envelopes. The rack adds no
  wiring of its own.
- **`devices 1 parameters 5`:** message box in the device unchanged; `devices 1` = the LFO; LFO has
  >>6 parameters so index 5 is in range. Exact LFO parameter still unconfirmed — the `.adg` stores the
  parameter list alphabetically, which is not the LiveAPI index order, so it can only be read live.
- **Size growth 52194 → 88296 explained:** rack re-saved in Live 12.4.2; the LFO device block
  (62989 B, ~71% of the file) now serializes the LFO's full ~91-entry `ParameterList`. No embedded
  samples/audio/blobs, still exactly two devices. The delta is purely the LFO's expanded parameter
  state from the newer Live version.

Updated: `concepts/adg-rack-wrapper.md` (re-verification block replaced with confirmed facts),
`concepts/live-remote-modulation-chain.md` and `entities/sends-follower-device.md`
(`devices 1 parameters 5` status). Read-only analysis — no `.adg` or device edit, no backup needed.
Not deployed; site/Gumroad untouched.

## 2026-06-17 — doc fix: rack preset filename + entity source header

- Corrected the rack preset **filename** across current-state docs from `MaxSendsFollower.adg` to the
  actual file on disk, `SendsFollowerRack.adg` (entity pairing line, `index.md`,
  `concepts/adg-rack-wrapper.md`). `MaxSendsFollower` remains the rack's **internal** saved name. Old
  log entries left unchanged (append-only history).
- Cleaned the stale source header in `entities/sends-follower-device.md`: it claimed
  `raw/SendsFollower.amxd` was 21673 bytes / unfrozen, but the shipped device is the frozen build (see
  the 2026-06-17 update-notifier entry). Reworded to scope the object-level analysis to the core patcher.
- **Flagged for re-verification:** `SendsFollowerRack.adg` decompresses to 88296 bytes, not the 52194
  recorded in the original pass — the rack was re-saved since analysis, so the macro/mapping details in
  `concepts/adg-rack-wrapper.md` need an m4l-master re-check.

## 2026-06-17 — update notifier added, device made fully self-contained

- Added a Control XL-style **version check** to the User Library device
  (`~/Music/Ableton/User Library/Max Devices/SendsFollower.amxd`). Dated pre-edit backup:
  `raw/archive/SendsFollower.2026-06-17.amxd` (md5 `6b85d12dcff2e412f15ae75897505f20`, the prior
  frozen build).
- New JavaScript `sf_version_check.js` (Node for Max): mirror of Control XL `version_check.js` with
  two constants changed — `DEVICE_VERSION = '1.0'`, `URL = 'https://fadercraft.com/api/sends-follower.json'`.
  Log-smoke verified offline with a mock manifest: `latest > 1.0` → `dot 1` + `url`; `latest == 1.0`
  → `dot 0`; `2.3.1 > 1.0` → `dot 1`. `node --check` clean.
- Added 11 patcher boxes / 10 lines (`version_node`, `vlink_route`, `vdot_sel`, `version_link`
  textbutton "New Version", `vlink_show/hide`, `vlink_thispatcher`, `vlink_fallback`,
  `vlink_prepend`, `vlink_store`, `vlink_open`). Control XL's `hdr_show/hide` pair was dropped (no
  header object in this device). 50 → 61 boxes, 51 → 61 lines.
- **Froze** the new JS into the container (Path B rebuild): `dlst` now carries three resources —
  the patcher, `sends_follower.js` (already embedded, kept byte-identical), and `sf_version_check.js`
  (TEXT, `of32 = 33974`, `sz32 = 3106`). The device needs **no external `.js`** to run.
- Rebuilt device: 37444 bytes, md5 `b5286b33d9adc12e023981ab1a117859`. Validated: JSON re-parses
  (python + jq, brace depth 0), embedded files byte-identical by `of32`, embedded JS `node --check`
  OK, size invariants hold (`ptch == filesize − 0x20`; `0x30 + mx@c − dlst = 16`; `dlst total = 332`).
- Round-trip: `SendsFollowerRack.adg` loads the device via `FileRef` →
  `Max Devices/SendsFollower.amxd` (file name/path unchanged), so the frozen device loads correctly.
- **LFO status:** the rack's second device is the **stock Ableton LFO**
  (`/Applications/Ableton Live 12 Suite.app/.../Builtin/Devices/Audio Effects/LFO/.../LFO.amxd`),
  wrapped by a `LFO.adv` preset. It ships with Live Suite — **not custom, no need to bundle it**.
- Note (pre-existing, not touched): `send_follower.adv` referenced by the rack is missing, but it
  appears only in `<LastPresetRef>` metadata, not in the device load path — the device still loads
  from the `.amxd` `FileRef`.
- New wiki page `concepts/version-check.md`; entity status table + index updated.
- Not deployed: the manifest `https://fadercraft.com/api/sends-follower.json` and Gumroad were left
  untouched, per task scope.

## 2026-06-16 — JS embedded via freeze, verified

- The user pulled `sends_follower.js` into the device object and **froze** it in the Max editor.
- Verified on the User Library device (now 36211 bytes, was 21673): the embedded JS is **byte-identical**
  to `Archive/sends_follower.js` (113 lines, `function buildRefs` / `sendRefs` / `outlet(0, "max", …)`
  all present). The patcher JSON parses, still 50 boxes / 51 lines, the `js sends_follower.js` box and
  `live.remote~` are intact. The earlier `js: can't find file` error is **resolved** — device is functional.
- Refreshed `raw/SendsFollower.amxd` to the frozen working copy (md5 `6b85d12dcff2e412f15ae75897505f20`).
- Still needs-verification (unchanged by the freeze): what `devices 1 parameters 5` resolves to on the
  downstream LFO, and whether the bipolar `scale 0. 1. -100. 100.` modulation mapping is intended.

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

## 2026-06-18 — SendsFollower LFO (experimental spin-off device, v1)
- New device `SendsFollower LFO.amxd` (User Library): SendsFollower's full 8-slot mapper (reused
  verbatim) fed by a NATIVE portable LFO generator. Replaces the dead-end of embedding the stock
  Ableton LFO multimap (`liveui.multimap`), which crashed Live with `error -1 making directory`.
- LFO: `phasor~` → 6 waveforms (Sine/Triangle/Saw Up/Saw Down/Square/Random S&H) → `selector~` →
  `snapshot~` (50 Hz) → Depth → `send ---max_send` (the mapper's source bus). Rate = Sync (tempo-locked,
  1/1…1/32 via `transport` BPM) or Free (0.01–20 Hz). All portable MSP objects — no stock internal-UI,
  no bpatcher, no embed → distributable, frozen, self-contained.
- Shipping `SendsFollower.amxd` UNTOUCHED. md5 `7ae739b3`, 493 box / 655 line.
- Status: built + structurally validated; pending hardware load-test in Live. Not yet wikied as a full
  product (experimental); device facts in m4l-master memory `sends-follower-lfo.md`.
