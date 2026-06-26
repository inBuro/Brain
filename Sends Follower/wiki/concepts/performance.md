# Performance — CPU profiling findings (2026-06-26)

A profiling pass triggered by a report of Live sitting near 100% CPU "because of" the Sends Follower
devices. Conclusion up front: **the devices are not the CPU bottleneck.** Recorded here so the
experiment is not repeated from scratch.

## Method

- Live runs the Max for Live engine **in-process**, so device CPU shows under the `Live` process, not
  the separate `Max` editor process.
- `sample <Live-pid> 5` for call-tree/thread attribution; a 1 Hz `top -l 2 -pid <pid> -stats cpu`
  loop for a CPU time series correlated with manual add/remove of devices.
- macOS `%CPU`: 100% = one core; this machine has 8 logical cores (max 800%).

## Findings

**Idle floor ~25% of one core, highly variable (7–50%).** Removing devices one group at a time:

| State | CPU avg (1 core) |
|---|---|
| Baseline (3× Return + Track loaded, idle) | ~28% |
| − all 3× `Sends Follower – Return` | ~26% |
| − `Sends Follower – Track` too (zero of our devices) | ~25% |

Removing **all** Sends Follower devices dropped CPU only 28% → 25% — within the noise band. So the
devices are **not** the dominant consumer. The earlier 92–100% readings were **transient** (set load
after a crash, indexing, UI interaction, or the profiler itself), not steady state.

**The ~25% floor is Live's own GUI rendering.** With zero of our devices loaded, the hottest thread is
still `com.apple.main-thread`, and its hot leaves are `objc_msgSend`, `_block_invoke (in FramePacing)`,
`__CFRunLoopRun`, `_block_invoke (in AppKit)` — i.e. interface redraw paced to the display refresh, not
audio DSP (the `AudioCalc` threads are cold).

**The devices do run a real JS poll loop, but it is minor.** With devices loaded the profile showed
`MainThreadEventHandler::invoke → sched_dequeue → real_outlet_bang → js_messagehandler (in js) →
defer`, plus heavy `gensym`. Root: both engines' `bang()` (driven by `qmetro 20`, 50 Hz) called
`outlet(0, "max", result)` **unconditionally** every 20 ms — re-sending the value and interning the
`"max"` symbol each tick even when nothing changed. This loop is present with the devices and gone
(0 `js_messagehandler`) when all are removed, confirming it is ours — but gating it barely moves total
CPU because the floor is Live's UI.

## Fix applied (change-gating, like the Control XL polling→event rework)

Both engines now compare against the last sent value and emit only on real change:
`sends_follower.js` `566db5ba → f0eb7d86`, `sends_follower_track.js` `b1bd009d → d3136f2f`
(`RESULT_EPS = 5e-4`; `lastResult` reset in `buildRefs()`/`buildRef()` so a target change always
passes the gate). Pre-edit archives under `raw/archive/…-200939-preedit-change-gate.js`.

**Caveat on the metric.** The gate removes the **downstream** churn (`outlet("max") → defer → gensym →
change → send`); it does **not** zero out `js_messagehandler`, because `qmetro 20` still bangs `js`
50×/s to sample state (required to detect change). So verify by watching `defer`/`gensym`/
`real_outlet_bang`, not `js_messagehandler`. Further cuts would require lowering the `qmetro` rate
(less responsive metering) — not worth it given the device is not the bottleneck.

**Live caches JS by path.** Activating the new JS needs a full device reload (remove + re-drag) or a
Live restart; a same-session re-add can still run the cached pre-gate JS. (Confirmed in practice: a
same-session re-add kept the old loop running; only a full Live quit/reopen loaded the gated JS.)

**Verified (post-restart, idle).** With the gated JS actually loaded, the idle profile's `"max"`
churn collapsed: `gensym` 28 → 3, `real_outlet_bang` 7 → 4, `object_method_typed` 21 → 16. The device
no longer emits `"max"` 50×/s. Total CPU was ~33% (cached) → ~30% (gated) of one core — within noise,
confirming again that the device is not what holds the idle floor (Live's GUI is). The residual is the
inherent 50 Hz `js` bang for sampling plus Live's own UI redraw.

## Levers that actually reduce the idle floor (Live-side, not the device)

- Lower the display refresh (ProMotion/120 Hz doubles `FramePacing` work vs 60 Hz).
- Fewer simultaneously visible animated meters; collapse tracks/device chains.
- Collapse the device (its animated dial/meter stops redrawing and stops contributing to FramePacing).
- Close Max editor windows.
