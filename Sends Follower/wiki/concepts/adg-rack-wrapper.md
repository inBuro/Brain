# Audio Effect Rack wrapper

`MaxSendsFollower.adg` is an Ableton Audio Effect Rack preset that bundles Sends Follower with a
stock device. It shows the intended usage and keeps the positional modulation target stable.

Source analyzed: `~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack/
MaxSendsFollower.adg` (gzipped Live preset, 52194 bytes decompressed, Live 12.3.7).

## What is inside

The rack's device chain holds **two devices in order**:

1. **Sends Follower** — referenced as `Max Devices/SendsFollower.amxd` (the device's saved
   `UserName` inside is `send_follower`, loaded from a `send_follower.adv` preset ref).
2. **Stock Ableton LFO** — referenced as `Devices/Audio Effects/LFO/.../LFO.amxd` (the built-in Max
   LFO that ships with Live Suite).

This order is the point: Sends Follower's `live.remote~` modulates `devices 1 parameters 5` — the
second device in the chain — which is exactly this LFO. See
[[live-remote-modulation-chain|live.remote~ chain]].

## Macros and mapping

- All 16 rack macros are **default and unnamed** (`Macro 1` … `Macro 16`); none are renamed.
- The preset saves **no macro-to-parameter mapping** (`MacroMappings` absent; no `ControllerTargets`,
  no `MapModeMin/Max`). The 52 `ModulationTarget` entries in the file are the per-parameter
  automation-target stubs every Live parameter carries, not actual modulation routings.

So the rack adds **no extra wiring** of its own. It is a packaging convenience: it pins the two
devices together in the right order so the positional `live.remote~` target lands on the LFO, and
saves you from assembling the chain by hand. Any custom macro mapping (e.g. exposing an LFO depth or
rate on a rack macro) would need to be added by the user.

## Implication

If you load the bare `SendsFollower.amxd` outside this rack, you must reproduce the layout yourself:
put another device (with at least 6 parameters) immediately after Sends Follower, or the
`live.remote~` modulation has nothing valid to target. Alternatively, read the value off the
`---max_send` / `---max_send_percent` buses instead — see [[internal-buses|Internal buses]].
