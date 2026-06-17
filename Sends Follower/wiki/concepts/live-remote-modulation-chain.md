# live.remote~ modulation chain

This is the native (non-JS) output path: it turns the follow value into a modulation signal and
applies it as a **signed (bipolar) offset** to the **Offset** parameter of the **next device** in the
return's chain — the stock LFO (founder-confirmed 2026-06-17). `live.remote~` offsets the target
around its base value rather than overwriting it, so the follow value can push the parameter both up
and down — this two-directional behavior is intentional.

## The mapping target

The target is set by a message box (`obj-9`):

```
path this_device canonical_parent devices 1 parameters 5
```

fed into `live.path` (`obj-10`), whose output goes to inlet 1 of `live.remote~` (`obj-11`). Reading
the path right to left:

- `this_device canonical_parent` — the track (chain) that holds Sends Follower.
- `devices 1` — the device at index 1 of that chain. Indices are 0-based, so `devices 1` is the
  **second** device, i.e. whatever sits immediately after Sends Follower. In the shipped
  [[adg-rack-wrapper|Audio Effect Rack]] that is the stock Ableton **LFO**.
- `parameters 5` — the parameter at index 5 (the 6th parameter) of that device.

So `live.remote~` modulates "parameter #5 of the device right after me."

**Re-verified 2026-06-17.** After the rack re-save, the message box still reads exactly
`path this_device canonical_parent devices 1 parameters 5` (one occurrence in the patcher), and
`devices 1` in the shipped rack is still the stock LFO (confirmed via the rack chain, see
[[adg-rack-wrapper|Audio Effect Rack wrapper]]). The LFO exposes far more than six parameters, so
index 5 is in range and the target does not fall off the end.

The **exact LFO parameter** that index 5 resolves to is still **not confirmed**. It cannot be read
reliably from the `.adg`: Live stores a device's `ParameterList` in the `.adg`/`.als`
**alphabetically by name** (Depth, Freq Rate, Hold, Jitter, Map 1, …), which is *not* the order Live's
`device.parameters[N]` returns at runtime. The LiveAPI index order is fixed by the device itself and
only resolvable live. Confirm index 5 with `path live_set ... devices 1` → `getinfo` / `get name` on
`parameters 5` in Live (likely candidates given the LFO's exposed controls are Depth/Rate/Offset, but
this is unverified).

## The signal feeding it

```
receive ---max_send → change 0. → speedlim 30 → t f f → scale 0. 1. -100. 100. → sig~ → live.remote~ (inlet 0)
   obj-12             obj-13       obj-14         obj-15   obj-16                   obj-17   obj-11
```

- `change 0.` drops unchanged repeats.
- `speedlim 30` rate-limits to ~33 ms so modulation does not flood.
- `t f f` (`obj-15`) splits the value: outlet 0 feeds the modulation scale, outlet 1 feeds the
  percent monitor / bus (see [[internal-buses|Internal buses]]).
- `scale 0. 1. -100. 100.` maps the 0.–1. follow value to a bipolar **-100…+100** modulation range.
  `live.remote~` does not overwrite the parameter; it applies a **signed (bipolar) offset** to the
  target's current value, so -100…+100 is the full two-directional offset swing. A follow value of 0
  maps to -100 (full negative offset), 0.5 to 0 (no offset), 1 to +100 (full positive offset).
  **This bipolar mapping is intentional — founder-confirmed 2026-06-17.** The device is meant to
  modulate both the *amount* and the *direction*: the follow value can drive the target up or down
  from its base value and into the negative region. It is not a unipolar 0…100 mistake; the signed
  offset is the design intent.
- `sig~` converts the float to an audio-rate signal because `live.remote~` takes a signal in inlet 0.

## Timing

The mapping side is gated by its own startup chain: `live.thisdevice` (`obj-4`) → `deferlow`
(`obj-5`) → `delay 300` (`obj-6`) → the path message (`obj-9`). The 300 ms delay lets the device
chain finish building before resolving `devices 1`, so the second device exists by the time the path
is read. This mirrors the read-side anti-race ladder in
[[self-healing-return-index|Self-healing return-index detection]].

## Fragility

Because the target is **positional** (`devices 1`, `parameters 5`), it breaks silently if the next
device is swapped, removed, or reordered, or if a device with fewer than 6 parameters is placed
there. The shipped rack pins the layout (Sends Follower then LFO) precisely to keep this mapping
stable — see [[adg-rack-wrapper|Audio Effect Rack wrapper]].
