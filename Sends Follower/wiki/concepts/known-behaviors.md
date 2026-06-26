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

## Orphaned map slot returns to outline when its target device is deleted (fixed 2026-06-26)

**Old behavior (bug).** A filled (mapped) map-button kept its solid "mapped" look after the device
holding its target parameter was deleted from the set. The slot looked mapped but pointed at nothing.

**Why it happened.** The filled/outline decision lives in `MapButton.maxpat → p RangeAndName`:
`obj-31 (sel 0)` on the resolved target id drives the outline path (id == 0) or the filled path
(id != 0, via `p setButtonColor`). The id was queried (`getid` on the held `live.object obj-130`)
only on capture, on load, and on a `live.observer property id` event — and that observer does not
reliably fire when the *containing device* is removed, so the color machine was never told the target
was gone.

**Fix (additive, inside `p RangeAndName`).** A low-priority self-poll re-validates the slot's id while
a target is set. New objects (`poll_*`): an `int` (`poll_id`) latches the last resolved id from
`obj-133` (`route … id`); a `sel 0` (`poll_dec`) starts a `qmetro 400` (`poll_metro`) when a target is
present and stops it when empty. Each tick re-binds a dedicated `live.object` (`poll_obj`) from the
stored id (`prepend id` → `id N`) and re-`getid`s it — Live returns id 0 for a destroyed object.
`route id` → `sel 0` (`poll_chk`): **only on loss (id == 0)** does it emit a `0` into the existing
`obj-31` color decision (→ outline) and into `ran_idout` (→ the engine's `targetmap`, which also
clears the "Feedback loop" warning), then stops the poll for that dead slot. A still-alive target is a
no-op (no min/max/name re-fetch). Colors use the existing theme-token path — no hex, no new colors.

**Scope.** The fix is entirely inside the shared `MapButton.maxpat` (purely additive: +12 boxes,
+18 lines; every other box and all top-level wiring byte-identical). It therefore applies to all three
consumers — Sends Follower – Return, Sends Follower – Track, and Sends Reader — with no edits to the
devices or to `multimap.maxpat`.

**Needs-verification (live).** Confirmed by static trace; the runtime assumption that re-binding a
`live.object` by a destroyed id reports id 0 still needs a hardware/Live check (delete a mapped target
device → the slot should drop to outline within ~0.5 s).
