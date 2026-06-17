# Send gathering via LiveAPI

How Sends Follower turns "the send knobs of every track that feed this return" into one number.

## Source of truth

The device delegates this to an embedded JavaScript box, `js sends_follower.js` (`obj-46`). The script
is **embedded (frozen) inside the device** and a byte-identical canon copy lives at
`~/Music/Ableton/User Library/Max Devices/sends_follower.js`. The behavior documented here is read
from that current script.

## What the script does

The script keeps an array of LiveAPI references, one per track send that targets this return:

```
live_set tracks <i> mixer_device sends <returnIdx>
```

It builds that array on the `build <N>` message, selects the algorithm on `mode <0|1>`, and reads it
on every `bang`.

- **`build <N>`** (`buildRefs`): clears the old references, then loops over `live_set` track count
  and, for each track `i`, creates a `LiveAPI("live_set tracks i mixer_device sends N")`. Only
  references whose `.id != 0` are kept (a valid send exists). `N` is the return index for the return
  this device sits on.
- **`mode <0|1>`** (`mode`): sets the follow algorithm — `0` = Max (default), `1` = Sum. Driven by the
  Follow Mode `live.tab` in the patch (see [[../entities/sends-follower-device|the device page]]).
- **`bang`** (the poll, ~30 Hz from `qmetro 33`, `obj-35`): iterates the kept references and calls
  `ref.get("value")` on each. In **Max** mode it tracks the running maximum; in **Sum** mode it
  accumulates the total and clamps it to `1.0`. Either way it outputs `max <value>` on outlet 0 — the
  `"max"` label is fixed so the patch's `route max` (`obj-47`) keeps working in both modes; only the
  computed value changes.

So the published number is either the **largest single send amount** (Max) or the **clamped sum** of
all send amounts (Sum) among the tracks feeding the return — never an average. Send values are LiveAPI
mixer values in the normalized 0.–1. range.

## Why these two algorithms

**Max** answers "is anything pushing hard into this return right now?" with an envelope that tracks the
loudest contributor. **Sum** answers "how much total send energy is hitting this return?" — useful when
several quieter sources should add up. Both are monotonic and bounded 0.–1. (Sum via the 1.0 clamp),
which is exactly what the downstream `scale` objects and `live.remote~` expect (see
[[live-remote-modulation-chain|live.remote~ chain]]). The clamp also keeps the percent monitor at or
below 100%.

## Self-heal note

If `bang` arrives, but the reference array is empty (e.g. the `build` message lost the startup race),
the script tries to recover its own return index before giving up — documented in
[[self-healing-return-index|Self-healing return-index detection]].

## Patch / script division of labor

The patch does return-index discovery natively (the `live.path` → `live.object` →
`route return_tracks` → `unpack` chain, `obj-30`–`obj-43`) and feeds the JS `build <index>`, `bang`,
and `mode <0|1>`. The embedded script **also** carries its own `autoDetect()` fallback (LiveAPI
`this_device canonical_parent` → parse `return_tracks N`), used only when a poll arrives with no
references built — a belt-and-braces recovery on top of the patch's discovery.
