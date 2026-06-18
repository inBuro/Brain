# Map button (direct parameter mapping)

The **Map** button on the device face maps Sends Follower's own follow signal straight onto any Live
parameter you click, **bypassing the LFO**. It is an *additive* output path: the existing
`live.remote~` leg that drives the stock LFO's Offset (`obj-11`) is untouched, and a **second**
`live.remote~` (`map_remote`) drives the user-chosen target in parallel.

Added and frozen 2026-06-18 (device md5 `6f156eab…`, 68498 bytes, 82 boxes / 85 lines).

## Status

| Aspect | Status | Notes |
|---|---|---|
| Arm map mode from the face | Works | `map_button` (`live.text` toggle) sends `arm 1` to the JS; the button text turns orange while armed |
| Capture the next clicked parameter | Works | JS observes `live_set view selected_parameter`; while armed it grabs the next selection's canonical path, then disarms |
| Drive the target with SF's signal | Works | The bipolar −100…+100 follow signal (`obj-16`) is tapped into a second `live.remote~` (`map_remote`) whose right inlet is the captured parameter's id |
| Show the captured target name | Works | A `comment` label (`map_label`) shows the target's `name` (or a short path) next to the button |
| Persist the target across reloads | Works | The path is stored as a token list in `pattr` (`map_target`, `@parameter_enable 1 @autorestore 1`) and re-resolved on load with a defer/retry ladder |
| Unmap / clear the target | Works | The "X" icon (`map_unmap`) sends `unmap`; the JS clears the path, clears `pattr`, and sends `id 0` to the second `live.remote~` so Live re-enables the parameter |
| Mapping icon matches the stock LFO look | Works (real stock asset for the X; recreated styling for the toggle) | See [Icon provenance](#icon-provenance) |

## What it does (plain terms)

The LFO leg modulates one fixed thing: the next device's Offset. The Map button lets you point the
**same** follow signal at **any** parameter in the set without wiring it through the LFO. Click
**Map** (it turns orange), then click a knob/slider/parameter anywhere in Live; Sends Follower captures
it and starts driving it with its bipolar follow value. Click the **X** to release it.

Because it taps the existing `scale 0. 1. -100. 100.` signal (`obj-16`), the mapped target gets the
exact same **signed offset** character as the LFO leg: the follow value pushes the target up and down
around its base value (0 → −100, 0.5 → 0, 1 → +100). See
[[live-remote-modulation-chain|live.remote~ chain]] for the offset semantics.

## Objects (patcher)

Sixteen boxes were added (object ids; `obj-46` is the existing `js sends_follower.js`):

| Object | id | Role |
|---|---|---|
| `live.text` "Map" toggle | `map_button` | Arm/disarm; click → `arm $1` → JS |
| `live.text` "X" (svg) | `map_unmap` | Unmap; click → `t b` → message `unmap` → JS |
| `comment` "—" | `map_label` | Shows the captured target name (`set <name>`) |
| `route armstate target_path targetname store release` | `map_route` | Demultiplexes the JS map-control outlet |
| `prepend set` | `map_arm_set` | Sets the Map button value silently (no output → no feedback loop) |
| `prepend path` | `map_pathprep` | Rebuilds `path <tokens>` for `live.path` |
| `live.path` | `map_path` | Resolves the captured path → `id n` |
| `prepend set` | `map_lblset` | Sets the label comment text |
| `message id 0` | `map_id0` | Releases the second remote's target on unmap |
| `live.remote~` | `map_remote` | **Second remote** — drives the user target |
| `sig~` | `map_sig` | Taps the bipolar signal from `obj-16` |
| `pattr map_target @parameter_enable 1 @autorestore 1` | `map_pattr` | Persists the target path with the device/preset |
| `prepend restorepath` | `map_restoreprep` | Feeds the restored path back to the JS on load |
| `prepend arm` | `map_arm_send` | Button value → `arm 0/1` to the JS |
| `t b` | `map_unmap_tb` | Converts the unmap click to a bang |
| `message unmap` | `map_unmap_msg` | Sends the `unmap` symbol to the JS |

The existing `js sends_follower.js` box (`obj-46`) was changed from one outlet to **two**: outlet 0 is
unchanged (the `max <value>` follow output), outlet 1 is the new map-control outlet.

## Wiring

```
obj-16 (scale -100..100) ──▶ map_sig (sig~) ──▶ map_remote inlet 0   (signal; LFO leg obj-11 untouched)

obj-46 (js) outlet 1 ──▶ map_route
   ├ armstate    ──▶ prepend set ──▶ map_button        (silent set, no feedback)
   ├ target_path ──▶ prepend path ──▶ live.path ──▶ map_remote inlet 1  (id n)
   ├ targetname  ──▶ prepend set ──▶ map_label
   ├ store       ──▶ map_pattr
   └ release     ──▶ message id 0 ──▶ map_remote inlet 1   (id 0 = unmap)

map_button click ──▶ prepend arm ──▶ obj-46 inlet 0   (arm 0/1)
map_unmap  click ──▶ t b ──▶ message unmap ──▶ obj-46 inlet 0
map_pattr  (autorestore on load) ──▶ prepend restorepath ──▶ obj-46 inlet 0
```

`live.remote~` takes its target as `id n` on the right inlet (from `live.path`); sending `id 0` there
releases the parameter back to Live. The left inlet is the audio-rate `sig~` value.

## JS behavior (`sends_follower.js`)

The embedded script gained `outlets = 2` and a map subsystem; the follow-value path (outlet 0,
`outlet(0, "max", result)`) is unchanged.

- **`arm 0|1`** — sets `mapArmed`; installs the `selected_parameter` observer on first arm.
- **`selected_parameter` observer** — installed on `live_set view`. It captures **only while armed**:
  when the user clicks a parameter, the observer reads `live_set view selected_parameter`, takes its
  `unquotedpath`, disarms, persists the path, emits the target name, and resolves/connects it. Clicks
  outside arm are ignored.
- **`restorepath <tokens…>`** — called on load by `pattr` autorestore. The path is stored and restored
  as a **token list**, not a single symbol, so it does not depend on how Max quotes spaces. A single
  `none` token means "no target."
- **Resolve with retry** — `resolveAndConnect()` emits the path for `live.path`; `retryResolve()`
  re-attempts every 150 ms (up to ~20 tries) until the path resolves, the same cold-load anti-race the
  device uses for the [[self-healing-return-index|return index]] (`Task.schedule`).
- **`unmap`** — clears the path, clears `pattr`, sends `release` (→ `id 0`), and resets the button and
  label.

The `selected_parameter` path is the documented Song View property for the parameter currently selected
in Live.

## Persistence

The captured path lives in `pattr map_target` (`@parameter_enable 1` so it saves with the set and with
device presets; `@autorestore 1` so it emits on load). Because parameter ids are session-specific, only
the **canonical path** is stored; on load `pattr` emits it → `restorepath` → the JS re-resolves the id
through `live.path` (with the retry ladder, since the Live API may not be ready immediately).

## Icon provenance

- **Unmap "X" — real stock asset.** `map_unmap` is a `live.text` with `usepicture 1`,
  `pictures ["multimap-unmap.svg", "multimap-unmap.svg"]`, `usesvgviewbox 1`, `remapsvgcolors 1`. The
  SVG is the built-in Cycling '74 asset
  `…/C74/packages/Max for Live/media/multimap-unmap.svg`, the same file the stock M4L mapping
  abstraction (`liveui.map.maxpat`) references. It ships inside the "Max for Live" Max package on every
  Live install and resolves by filename on the Max search path, so it is **not embedded** in the device
  and will not cause a missing-file error for buyers.
- **Map toggle — recreated stock styling.** Live's single "Map" arm button is not a shareable image
  asset; it is a `live.text` toggle. `map_button` recreates the stock look exactly, using the colors
  read from the stock `liveui.map.maxpat` (`obj-48`): idle background `[0.157, 0.157, 0.157, 1]` with
  grey text `[0.549, 0.549, 0.549, 1]`; when armed, the text turns the Ableton orange
  `[1.0, 0.7098, 0.1961, 1]` with an orange border. `appearance 2`, `mode 1` (toggle). This is a
  faithful recreation rather than a shared asset because no standalone "Map" image exists to reuse.

## Layout

The presentation view grew to make room: the device's `openrect` height went from **169 to 196**
(+27). The Map row sits at presentation `y = 172`, below the Mode switch (which ends at `y = 167`).
Row contents: `map_button` `[7, 172, 50, 17]`, `map_unmap` `[60, 172, 15, 15]`, `map_label`
`[80, 173, 40, 14]`. Nothing overlaps the dial, the Mode switch, or the "New Version" button.

## Relationship to the LFO leg

This is a **parallel** output, not a replacement. Sends Follower now has two simultaneous modulation
destinations:

1. The fixed LFO leg — `obj-11` → the next device's Offset (`devices 1 parameters 5`). Always active.
2. The Map leg — `map_remote` → whatever parameter you mapped. Active only when a target is set.

Both are driven by the same bipolar follow signal (`obj-16`). The Map leg does **not** route the LFO's
audio or control the LFO's own mapping (the stock LFO is encrypted and its map UI is not addressable —
see [[live-remote-modulation-chain|live.remote~ chain]]); it drives SF's own signal directly.
