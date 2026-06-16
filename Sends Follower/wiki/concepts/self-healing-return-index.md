# Self-healing return-index detection

Sends Follower must learn **which return track it sits on** before it can gather that return's sends.
The return index appears in the LiveAPI path `live_set tracks i mixer_device sends <returnIdx>`, so
getting `returnIdx` right is the whole game. The device resolves it two ways, with anti-race timing.

## Why it is hard

At cold set load, the Live object model is not fully built when the device's `loadbang` fires.
Querying the device path too early returns an empty or unresolved path, which would yield a wrong or
missing return index. So both the patch and the script defer and retry rather than read once.

## Patch-side discovery (current device)

Startup trigger: `live.thisdevice` (`obj-21`) + `loadbang` (`obj-22`) → `deferlow` (`obj-23`). The
`deferlow` moves work off the high-priority thread (LiveAPI must not run there). It then fans out to
a staged ladder of delays, so the path is queried repeatedly as Live finishes loading:

- `delay 50` (`obj-24`) → message `path this_device` (`obj-27`) → `live.path` (`obj-30`).
- `delay 150` (`obj-25`) → message `getpath` (`obj-29`) → `live.object` (`obj-31`).
- `delay 300` (`obj-26`) → message `1` (`obj-32`) → `qmetro 500` (`obj-33`) → re-fires `getpath`
  every 500 ms as a retry pump until the index resolves.

Parsing the path string:

```
live.object → route path → zl.slice 1 → route return_tracks → unpack i s i → int → change -1 → prepend build
   obj-31      obj-36       obj-37        obj-38                obj-39       obj-40  obj-41      obj-42
```

`route return_tracks` only passes when the device path contains `return_tracks <n>` — i.e. the device
is on a return track. `unpack i s i` plus `int` pull out the numeric index; `change -1` suppresses
repeats (initialized to -1, so the first real index always passes).

Once an index is found, `prepend build` → `t l b b` (`obj-43`) does three things, right to left:

1. outlet 2 → message `0` → `qmetro 500` (`obj-33`): **stop** the resolve pump (index found).
2. outlet 1 → message `1` → `qmetro 33` (`obj-35`): **start** the 30 Hz value poll.
3. outlet 0 (`l`) → `js sends_follower.js` (`obj-46`): deliver `build <index>` so the JS builds its
   send references.

This is the "self-healing" loop: it keeps probing on a 500 ms metro until the path resolves, then
latches and switches to polling.

## Script-side fallback (archived behavior)

The archived `sends_follower.js` carried a second safety net (`autoDetect()`): on a `bang` with an
empty reference array, no more often than every 400 ms, it queries
`LiveAPI("this_device canonical_parent")`, reads `.unquotedpath`, and matches `return_tracks (\d+)`
to recover the index itself, then calls `buildRefs`. This protects against the case where the patch's
`build` message never arrived.

It is **needs-verification** whether the current (missing) `sends_follower.js` still includes this
fallback, since the current patch already does the discovery natively. See
[[send-gathering-via-liveapi|Send gathering via LiveAPI]].
