# Change log

Append-only. Newest first.

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
