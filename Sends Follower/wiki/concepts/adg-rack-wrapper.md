# Audio Effect Rack wrapper

`SendsFollowerRack.adg` is an Ableton Audio Effect Rack preset that bundles Sends Follower with a
stock device. It shows the intended usage and keeps the positional modulation target stable.

Source analyzed: `~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack/
SendsFollowerRack.adg` (gzipped Live preset). Re-verified 2026-06-17 against the current on-disk file:
gzip of 6406 bytes, **decompressing to 88296 bytes** of XML. The rack's internal saved name
(`UserName` on the group device) is `SendsFollowerRack`; the string `MaxSendsFollower` survives only
inside the rack's own `LastPresetRef`/`PresetRef` metadata (the preset's previous saved name), not as
the file name or the displayed name.

## What is inside

The rack is a single-chain `AudioEffectGroupDevice`: one `BranchPresets` → one
`AudioEffectBranchPreset` → one `DevicePresets` holding **exactly two devices, in this order**:

1. **Sends Follower** — `MxDeviceAudioEffect`, `UserName = send_follower`, loaded via
   `<FileRef> RelativePath "Max Devices/SendsFollower.amxd"` (`RelativePathType` 6 = User Library).
2. **Stock Ableton LFO** — `MxDeviceAudioEffect`, loaded via `<FileRef> RelativePath
   "Devices/Audio Effects/LFO/Ableton Folder Info/LFO.amxd"` (`RelativePathType` 7 = Live app
   factory content).

No third device, no reorder. This order is the point: Sends Follower's `live.remote~` modulates
`devices 1 parameters 5` — the second device in the chain — which is exactly this LFO. See
[[live-remote-modulation-chain|live.remote~ chain]].

## FileRef status (does it pull the frozen device?)

Yes. The Sends Follower device is referenced by relative path `Max Devices/SendsFollower.amxd` plus an
absolute path to the same User Library location, so the rack loads **the current on-disk device**,
which is the frozen build (md5 `b5286b33d9adc12e023981ab1a117859`, 37444 bytes). The file name and
path are unchanged, so the freeze loads fine. Notes:

- The Sends Follower branch also carries a `<LastPresetRef>` pointing at
  `Presets/Audio Effects/Max Audio Effect/send_follower.adv`. That `.adv` is **missing on disk**, but
  it lives only in `LastPresetRef` (last-loaded-preset metadata), not in the load path. The device
  still loads from the `.amxd` FileRef, so the missing `.adv` is harmless.
- The LFO branch references the factory `LFO.amxd` inside the Live app bundle (path type 7), so it
  resolves from any Live Suite install. Its `LastPresetRef` points at a User Library `LFO.adv`, which
  does exist on disk but is again only metadata.
- The `<OriginalFileSize>` values stored in the FileRefs (21673 for Sends Follower, 542384 for the
  LFO) are stale FileRef metadata, not the current sizes; Live does not validate against them.

## Macros and mapping (re-confirmed after the re-save)

- All 16 rack macros are **default and unnamed** (`MacroDisplayNames.0…15` = `Macro 1` … `Macro 16`);
  none are renamed.
- The preset still saves **no macro-to-parameter mapping**: `MacroMappings` and `ControllerTargets`
  are absent, and there are no `MapModeMin`/`MapModeMax` entries. The `ModulationTarget` blocks in the
  file (26 of them) are empty automation-target stubs (each just `<LockEnvelope Value="0" />`) that
  every Live parameter carries — 16 of them are the per-macro stubs, the rest belong to device
  parameters. They are not actual modulation routings, and the file holds no automation envelopes.

So the rack adds **no extra wiring** of its own. It is a packaging convenience: it pins the two
devices together in the right order so the positional `live.remote~` target lands on the LFO, and
saves you from assembling the chain by hand. Any custom macro mapping (e.g. exposing an LFO depth or
rate on a rack macro) would need to be added by the user.

## Why the file grew (52194 → 88296 bytes)

The rack was re-saved in **Ableton Live 12.4.2** (`Creator="Ableton Live 12.4.2"`). The growth is the
LFO device block, which now stores the LFO's **fully expanded `ParameterList`** — about 91 parameters,
including all the internal Map/Mod/Target/mode and `obj-…` Max parameters. That single block is
**62989 bytes (about 71% of the file)**. The Sends Follower device block is only ~4699 bytes. The
file holds **no embedded samples, audio data, base64 blobs, or extra devices** (no `SampleRef`, no `Data`/
`Buffer`, still exactly two `MxDeviceAudioEffect`). The delta is purely the LFO's serialized parameter
state written out in full by the newer Live version, not new content.

## Implication

If you load the bare `SendsFollower.amxd` outside this rack, you must reproduce the layout yourself:
put another device (with at least 6 parameters) immediately after Sends Follower, or the
`live.remote~` modulation has nothing valid to target. Alternatively, read the value off the
`---max_send` / `---max_send_percent` buses instead — see [[internal-buses|Internal buses]].
