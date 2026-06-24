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

## Mapping the output onto a send that feeds the watched bus = un-breakable feedback loop

**Configuration.** Sends Follower – Return sits on Return A and its follow output is mapped (via the
right-hand multi-map panel) onto a **send that feeds Return A** — i.e. the device drives one of its
own inputs. On the smallest input the output runs away to the extreme and latches (bistable
max/min). This applies in both Peak and Total.

**Why the device cannot auto-break it.** The engine (`sends_follower.js`) reads every track's send
into the watched return and aggregates them. To break the loop it would need to *exclude* the send
it is driving. It cannot, because **the mapper captures its target natively and never tells the
engine**: the right panel is `multimap.maxpat` → eight `MapButton.maxpat`, each using a native
`live.map` → `live.remote~`. The captured target id/path lives inside `live.remote~` and is **not
exposed to an outlet** of the bpatcher; the `js` object's mapper-control outlet is unconnected, so
the engine's capture path (`captureTarget`/`slotPath`) is never called and stays empty. The engine
therefore has no way to know which send it is driving, so it cannot remove that send from the
aggregate. (Verified by EXCLDIAG instrumentation: `slotPath` is always empty, `selfDriven` always
all-zero.)

Adding the exposure would require **rewiring the shared mapper** (`multimap.maxpat` +
`MapButton.maxpat`), which is also used by Sends Follower – Track and Sends Reader — too much blast
radius for this edge case. So auto-exclude is **deliberately not implemented**.

**Recommendation.** **Do not map the Sends Follower – Return output onto a send that feeds the return
it is watching.** If you must drive a bus-feeding send, keep the slot **Max <= 0.99** (Total
1.0-clamp headroom, see above) — but the feedback toward maximum still applies; this only softens it,
it does not remove the loop.
