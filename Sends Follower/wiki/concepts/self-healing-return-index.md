# Self-healing return-index detection

Sends Follower must learn **which return track it sits on** before it can gather that return's sends.
The return index appears in the LiveAPI path `live_set tracks i mixer_device sends <returnIdx>`, so
getting `returnIdx` right is the whole game. The device resolves it two ways, with anti-race timing.

Since the 2026-06-18 frozen build (md5 `bd21b848…`), the **script** owns the resolution and keeps it
live with LiveAPI property observers; the patch's `build <index>` is now only a startup hint. See
[[#Script-side detection (current — observer-based)]] for the authoritative path. The earlier
patch-only behavior is kept below for reference.

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

## Script-side detection (current — observer-based)

The bug this fixes: the patch resolves the index **once** at load (`change -1` suppresses repeats,
and a hit stops the resolve pump), and the old script only auto-detected while `sendRefs` was empty.
So after the first success nothing recomputed the index. Dragging the device to a neighboring return,
adding or removing returns, or adding tracks left the device pointing at the original return — it kept
following the first return's sends and ignored the change. A reload revived it (loadbang fired
again and `sendRefs` was zeroed) but a move-without-reload did not.

The fix moved the source of truth into `sends_follower.js` and made it self-correcting through LiveAPI
property observers rather than periodic probing (observers fire only on a real change — cheaper and
idiomatic versus building LiveAPI objects every few hundred ms forever):

- **`detectReturnIndex()`** queries `LiveAPI("this_device canonical_parent")`, reads its path, and
  matches `return_tracks (\d+)`. On a non-return track (ordinary or master) it returns `-1`, so the
  device quietly holds an empty `sendRefs` with no console spam.
- **Three observers**, re-armed each rebuild via `new LiveAPI(onLiveChange, …)`:
  - device path — `this_device canonical_parent`, property `name`: catches the device being **moved**
    to another track (`canonical_parent` resolves to a different object, firing the callback).
  - `live_set` property `return_tracks`: catches return **add / delete / reorder** (which shifts the
    return index).
  - `live_set` property `tracks`: catches ordinary-track **add / delete** (which changes the set of
    sends to rebuild).
- **`resync(force)`** recomputes the index via `detectReturnIndex()` and the track count, and rebuilds
  `sendRefs` only when the index or the count actually changed. A `rebuilding` re-entrancy flag guards
  against overlapping observer callbacks.
- **Anti-race `bang()`**: besides producing the output value, `bang()` cheaply re-syncs at most
  every `RESYNC_MS` (500 ms) — one `detectReturnIndex` plus one `getcount`, no track walk — so a cold
  load where the observers or path have not yet resolved still self-heals.

The patch's `build <index>` message is now a **hint only**; the script's own detection is authoritative.
This resolves the prior needs-verification note. See
[[send-gathering-via-liveapi|Send gathering via LiveAPI]].
