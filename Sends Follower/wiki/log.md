# Change log

Append-only. Newest first.

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
