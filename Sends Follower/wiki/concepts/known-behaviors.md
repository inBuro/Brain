# Known behaviors (by design)

Behaviors that are intentional or inherent to the design, not defects. Listed here so they are not
re-reported as bugs.

## Total mode latches at 1.0 when the output feeds its own watched bus

**Configuration (loop case).** Sends Follower – Return in **Total** mode, with its follow output
mapped onto a **send that feeds the same return bus the device watches**. The device drives one of
its own inputs.

**Behavior.** With the slot's **Max = 1.0**, the Total hard clamp (`if result > 1.0 then result =
1.0` in `sends_follower.js`) creates a flat dead zone at the ceiling: while the sum of the *other*
sends is at or above 1.0, the follow value stays pinned at 1.0, so the mapped parameter holds at its
maximum and does not come back down. Any headroom (**Max <= 0.99**) keeps the operating point on the
sloped part of the clamp, so lowering the other sends immediately lowers the follow value and the
mapped send tracks it down.

**Why it is inherent.**
- The clamp to 1.0 is **intentional**: downstream consumers (the percent monitor and the on-screen
  dial) expect a 0..1 range. Removing the clamp would let the percent exceed 100% and push the dial
  past full scale.
- **Peak** mode does not show the *clamp* latch: it takes the maximum of current values, so it only
  reaches 1.0 when an actual send is at 1.0 — there is no accumulation past the ceiling.

**Recommendation.** For this self-feeding configuration in Total, keep the slot's **Max <= 0.99**.
This is the user-accepted resolution; no code change is made. Note this only adds headroom — the
underlying feedback (next section) still drives the value toward maximum.

## Mapping the output onto a send that feeds the watched bus = feedback loop (now warned)

**Configuration.** Sends Follower – Return sits on Return A and its follow output is mapped (via the
right-hand multi-map panel) onto a **send that feeds Return A** — i.e. the device drives one of its
own inputs. On the smallest input the output runs away to the extreme and latches (bistable
max/min). This applies in both Peak and Total.

**The device cannot auto-break the loop**, but it now **detects and warns** about it. Breaking the
loop would require excluding the driven send from the aggregate, and the aggregation engine cannot
silently drop one send without changing the metering semantics. So instead the device lights a
**"Feedback loop"** warning (red, in the version_link slot) whenever the output is mapped onto a
send that feeds the watched return.

**How the warning works (real-target detection).** The mapper captures its target natively (each
`MapButton.maxpat` uses `live.map` → `live.remote~`, with `p RangeAndName` resolving the target id
via `live.observer property id`). That id is now **exposed out of the shared bpatchers additively**:
`MapButton.maxpat` gained a last outlet carrying the target id; `multimap.maxpat` tags each slot's id
with its slot index and exposes them on a last outlet; the Return patch routes that into the engine
as `targetmap <slot> <id>`. The engine (`sends_follower.js`) keeps `mapTargetIds[8]` and runs
`recomputeWarn()` — **warn = 1 if any slot's target id is a member of `sendRefs`** (a send feeding
the watched return), recomputed both on target change and on `sendRefs` rebuild (track add/del). The
new outlets are last-index only, so Sends Follower – Track and Sends Reader (which share these
bpatchers) are unaffected.

**Recommendation.** When the **"Feedback loop"** warning lights, you have mapped the output onto a
send that feeds the return being watched — **undo that mapping**. If you intentionally drive a
bus-feeding send anyway, keep the slot **Max <= 0.99** (Total 1.0-clamp headroom, see above) — but
the feedback toward maximum still applies; the warning is informational, it does not break the loop.

## Orphaned map slot stays filled when its target device is deleted (PARKED — not fixed, 2026-06-26)

**Behavior (cosmetic, accepted).** A filled (mapped) map-button keeps its solid "mapped" look after
the device holding its target parameter is deleted from the set. The slot looks mapped but points at
nothing. It is **purely visual** — audio, mapping, and the "X"/unmap button all work normally; a dead
slot drives nothing. The user accepted leaving this as-is ("very minor, can let it go").

**Where the look is decided.** In `MapButton.maxpat → p RangeAndName`: `obj-31 (sel 0)` on the
resolved target id drives the outline path (id == 0) or the filled path (id != 0, via
`p setButtonColor`). The id is resolved on capture, on load, and on a `live.observer property id`
event. That observer does not fire when the *containing device* is removed, so the color machine is
never told the target is gone.

**Four detection approaches were tried — all failed. Do not re-attempt these:**

1. **`getid` self-poll** (qmetro re-binds a `live.object` by the stored id and re-`getid`s it,
   expecting id 0 for a destroyed object) — Live returns the **cached id even for a deleted object**,
   so loss is never detected. Confirmed broken even after a full Live restart.
2. **`live.path` re-resolve** (re-resolve the target path, expecting it to fail) — hits the same Live
   cache; no deletion signal.
3. **`live.observer property id` → fire on `id 0`** (the stock-Ableton MapButton trick) — does **not**
   fire on container-device deletion here, and it **does** emit a spurious `id 0` during the
   mapping handshake, which **killed the Map-button blink** (a regression).
4. **Dedicated argument-less `live.observer` fed the resolved id** (the canonical pattern copied from
   the stock LFO `Abl.Map.maxpat`, ~lines 3494–3589, where an argument-less `live.observer` natively
   emits `id 0` when its object is destroyed) — caused a **stack overflow** ("outlets are disabled
   until this message is cleared"): our reset-on-`id 0` re-touched the `live.object`/`live.remote~`,
   which re-fired the observer → feedback loop. The device degraded (encoders stopped obeying
   mapping, button stuck blinking).

**Root cause of the failures.** The stock LFO breaks that observer feedback loop indirectly: it
updates the UI through a separate `mapped` boolean and deliberately does **not** send `id 0` back into
`live.remote`/`live.modulate` when the target disappears (see the in-patch comments in `Abl.Map.maxpat`
at obj-7/obj-16 ~lines 3347, 3433 — "no need to send out id 0 … only send id 0 when the mapping is
reset by the user"). Replicating that cleanly would mean porting the whole `Abl.Map.maxpat` mapping
engine (~4000 lines) with its mapped-bool path and undo guards — not a point edit, and disproportionate
for a cosmetic glitch.

**Status.** Parked at the pristine `MapButton.maxpat` (md5 `3e937392`). No fix in place; no regression.
If ever revisited, the only viable route is "port the stock `Abl.Map` engine wholesale", filed as a
separate task — not another point patch into the current `p RangeAndName`.

**Operational note.** A crash from approach 4 latched Max's "outlets are disabled" state; a device
re-drag did not clear it. Recover with a **full Live restart** (the stale compiled patch + latched
error state need clearing), after which the pristine file's Map-button blink returns.
