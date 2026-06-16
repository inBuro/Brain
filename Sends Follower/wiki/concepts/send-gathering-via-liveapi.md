# Send gathering via LiveAPI

How Sends Follower turns "the send knobs of every track that feed this return" into one number.

## Source of truth

The current device delegates this to an embedded JavaScript box, `js sends_follower.js` (`obj-46`).
That script is **not present** in the analyzed device (see
[[../entities/sends-follower-device|the device page]] limitations). The behavior documented here is
read from the only surviving copy, the older standalone
`~/Music/Ableton/User Library/Max Devices/Archive/sends_follower.js`. Where the current patch
differs from that archived script, it is noted; treat the exact current-script behavior as
**needs-verification** until the matching `sends_follower.js` is recovered or re-derived.

## What the script does

The script keeps an array of LiveAPI references, one per track send that targets this return:

```
live_set tracks <i> mixer_device sends <returnIdx>
```

It builds that array on the `build <N>` message and reads it on every `bang`.

- **`build <N>`** (`buildRefs` in the archived script): clears the old references, then loops over
  `live_set` track count and, for each track `i`, creates a `LiveAPI("live_set tracks i mixer_device
  sends N")`. Only references whose `.id != 0` are kept (a valid send exists). `N` is the return
  index for the return this device sits on.
- **`bang`** (the poll, ~30 Hz from `qmetro 33`, `obj-35`): iterates the kept references, calls
  `ref.get("value")` on each, and tracks the running **maximum**. It outputs `max <maxVal>` on
  outlet 0. The patch routes that with `route max` (`obj-47`).

So the published number is the **largest single send amount** among all tracks feeding the return —
not a sum, not an average. Send values are LiveAPI mixer values in the normalized 0.–1. range.

## Why a maximum

A maximum answers "is anything pushing hard into this return right now?" with a single envelope that
tracks the loudest contributor. It is monotonic and bounded 0.–1., which is exactly what the
downstream `scale` objects and `live.remote~` expect (see
[[live-remote-modulation-chain|live.remote~ chain]]).

## Self-heal note

If `bang` arrives, but the reference array is empty (e.g. the `build` message lost the startup race),
the archived script tries to recover its own return index before giving up — documented in
[[self-healing-return-index|Self-healing return-index detection]].

## Current-device difference (needs verification)

The current patch already does return-index discovery natively (the `live.path` → `live.object` →
`route return_tracks` → `unpack` chain, `obj-30`–`obj-43`) and feeds the JS only `build <index>` and
`bang`. The archived script also contained its own `autoDetect()` fallback. It is unconfirmed whether
the current (missing) `sends_follower.js` still carries that fallback or was slimmed down to just
`build`/`bang` now that the patch resolves the index. Recover the matching script to confirm.
