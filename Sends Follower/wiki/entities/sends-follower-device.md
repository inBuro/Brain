# Sends Follower device

Source analyzed: `raw/SendsFollower.amxd` (21673 bytes, unfrozen `ampf` container, JSON patcher
spans bytes 32–21671, 50 boxes / 51 lines). Every claim below is grounded in objects read from that
patcher; the object IDs in parentheses are the patcher box IDs.

## Status

| Aspect | Status | Notes |
|---|---|---|
| Reads max send level toward its return | Works | Computed by the embedded JS (`obj-46`), see [[../concepts/send-gathering-via-liveapi\|Send gathering]] |
| Self-detects which return it sits on | Works | Patch path chain and a JS fallback, see [[../concepts/self-healing-return-index\|Self-healing]] |
| Writes follow value to a downstream parameter via modulation | Needs verification | `live.remote~` maps to `devices 1 parameters 5` — see Limitations |
| Exposes follow value on internal buses | Works | `---max_send` and `---max_send_percent`, see [[../concepts/internal-buses\|Internal buses]] |
| Embedded JavaScript shipped inside the device | Yes (frozen 2026-06-16) | `sends_follower.js` is now embedded in the frozen container, byte-identical to the Archive copy — see Limitations |
| Front-panel parameter exposed to Live | No | The dial (`obj-3`) has `parameter_enable: 0`; no Live-automatable parameter is published |

## What it does (plain terms)

Sends Follower is meant to sit on a **return track**. It watches the send knobs of every track that
routes to that return, takes the **maximum** of those send amounts, and turns that single number into
a control value. The intent is "the more signal the rest of the set is pushing into this return, the
more this value rises" — a one-number summary of how hard the return is being driven.

That follow value is then made available three ways:

1. As a normalized 0.–1. control fed into a native `live.remote~` modulation output that targets a
   parameter on the **next device in this return's chain** (`devices 1 parameters 5`).
2. On a Max named bus `---max_send` (raw 0.–1. value).
3. On a Max named bus `---max_send_percent` (the value scaled to 0–100).

> Note: the device computes a single follow value. The "what should this drive" question is answered
> by the `live.remote~` target and/or by patching from the `receive ---max_send` buses. See
> Limitations for the open question about the modulation target.

## Where / when to use it

- **Placement:** on a **return track** (A, B, C, …). The whole concept is "watch the sends that feed
  this return," which only makes sense when the device is on the return those sends point at.
- **Device type:** audio effect (`plugin~`/`plugout~` pass audio straight through, `obj-1` → `obj-2`,
  so the device is audio-transparent and just observes/modulates).
- **Intended pairing:** the shipped [[../concepts/adg-rack-wrapper\|Audio Effect Rack preset]]
  `MaxSendsFollower.adg` places Sends Follower first, then a stock Ableton **LFO** device after it,
  so the follow value can drive the LFO (or whatever device you drop in slot 2 — that is what
  `devices 1 parameters 5` points at).

## I/O

| Port | Object | Direction | Purpose |
|---|---|---|---|
| Audio in/out L+R | `plugin~` (`obj-1`) → `plugout~` (`obj-2`) | pass-through | Audio is untouched; device is a transparent insert |
| LiveAPI read | `js sends_follower.js` (`obj-46`) | in | Reads `value` of each track's send to this return |
| LiveAPI write | `live.remote~` (`obj-11`) | out | Modulates `devices 1 parameters 5` on the return chain |
| Named bus out | `send ---max_send` (`obj-50`) | out | Raw follow value (0.–1.) |
| Named bus out | `send ---max_send_percent` (`obj-20`) | out | Follow value as 0–100 |
| Named bus in | `receive ---max_send` (`obj-7`, `obj-12`) | in | Internal consumers of the raw value |

## Parameters

The device exposes **no Live-automatable parameter**. The only UI object is a `dial` (`obj-3`) with
`parameter_enable: 0`, so it is a passive meter, not a mapped parameter. It is driven for display
only: `receive ---max_send` (`obj-7`) → `* 127.` (`obj-11_scale`) → `prepend set` (`obj-11_set`) →
`dial`. The `prepend set` means the dial is updated **silently** (set, not output), so it shows the
current follow level without re-emitting it.

Two `flonum` boxes (`obj-19`, `obj-49`) are bench/monitor read-outs (one shows the 0–100 percent
value, the other shows the raw 0.–1. value).

## Signal / data flow

Two cooperating subgraphs run in parallel.

### A. Read path — compute the follow value (the JS side)

1. Startup gating: `live.thisdevice` (`obj-21`) and `loadbang` (`obj-22`) → `deferlow` (`obj-23`)
   fans out to three staged delays `delay 50 / 150 / 300` (`obj-24/25/26`). This is the anti-race
   ladder — see [[../concepts/self-healing-return-index\|Self-healing]].
2. The 50 ms branch (`obj-24`) → message `path this_device` (`obj-27`) → `live.path` (`obj-30`).
   The 150 ms branch (`obj-25`) → message `getpath` (`obj-29`) → `live.object` (`obj-31`).
   The 300 ms branch (`obj-26`) → message `1` (`obj-32`) → `qmetro 500` (`obj-33`) → re-issues
   `getpath` periodically (a retry pump while the path is still resolving).
3. `live.object` (`obj-31`) → `route path` (`obj-36`) → `zl.slice 1` (`obj-37`) →
   `route return_tracks` (`obj-38`) → `unpack i s i` (`obj-39`) → `int` (`obj-40`) →
   `change -1` (`obj-41`) → `prepend build` (`obj-42`). This parses the device's own path string and
   extracts the **return-track index**, then sends `build <index>` to the JS.
4. `prepend build` → `t l b b` (`obj-43`). Right-to-left: outlet 2 (`bang`) → message `0` (`obj-45`)
   → `qmetro 500` (`obj-33`) **stops** the resolve pump; outlet 1 (`bang`) → message `1` (`obj-44`)
   → `qmetro 33` (`obj-35`) **starts** the 33 ms poll; outlet 0 (`l`) → the JS (`obj-46`) delivers
   `build <index>`. So once the index is known, the patch stops searching and starts polling.
5. Poll: `qmetro 33` (`obj-35`) bangs `js sends_follower.js` (`obj-46`) ~30×/s. On each bang the JS
   reads every gathered send and outputs `max <value>` — see
   [[../concepts/send-gathering-via-liveapi\|Send gathering via LiveAPI]].
6. JS out → `route max` (`obj-47`) → `change 0.` (`obj-48`) (drops repeats) → both
   `send ---max_send` (`obj-50`) and the monitor `flonum` (`obj-49`).

### B. Write path — turn the follow value into modulation/percent

1. `receive ---max_send` (`obj-12`) → `change 0.` (`obj-13`) → `speedlim 30` (`obj-14`) (rate-limit
   to ~33 ms) → `t f f` (`obj-15`).
2. `t f f` outlet 0 → `scale 0. 1. -100. 100.` (`obj-16`) → `sig~` (`obj-17`) → `live.remote~`
   inlet 0 (`obj-11`). This is the signal that is modulated onto the mapped parameter.
3. `t f f` outlet 1 → `scale 0. 1. 0. 100.` (`obj-18`) → `flonum` (`obj-19`) and
   `send ---max_send_percent` (`obj-20`).
4. The mapping target itself: `delay 300` (`obj-6`, fed by its own `live.thisdevice` `obj-4` →
   `deferlow` `obj-5`) → message `path this_device canonical_parent devices 1 parameters 5`
   (`obj-9`) → `live.path` (`obj-10`) → `live.remote~` inlet 1 (`obj-11`). This binds `live.remote~`
   to that parameter. See [[../concepts/live-remote-modulation-chain\|live.remote~ chain]].

## Limitations / open questions

- **The embedded JavaScript — resolved 2026-06-16.** The device was previously unfrozen and the
  `js sends_follower.js` script was neither embedded nor on disk next to it, so it failed with
  `js: can't find file sends_follower.js` and produced no follow value. The script has now been
  pulled into the device object and **frozen**: the JS text is embedded in the container (verified
  byte-identical to the `Archive/sends_follower.js` source, 113 lines) and the device loads and runs.
  See [[../concepts/send-gathering-via-liveapi\|Send gathering]] for the script's behavior.
- **`devices 1 parameters 5` is positional and fragile.** `live.remote~` modulates "the parameter at
  index 5 of the device at index 1 of this return's device chain." `devices 1` is the **second**
  device in the chain (0-based), i.e. whatever sits right after Sends Follower — in the shipped rack
  that is the stock LFO. `parameters 5` is the 6th parameter of that device. If the next device is
  changed, removed, or reordered, the modulation either lands on the wrong parameter or fails
  silently. The exact parameter that index 5 of the LFO resolves to was not verified in this pass.
  **Needs verification on hardware/in Live.**
- **No mapped Live parameter.** Nothing is exposed for Live automation or controller mapping; the
  device communicates only through `live.remote~` modulation and the two Max named buses. A consumer
  patch must either be the modulation target or `receive ---max_send` / `---max_send_percent`.
- **Aggregation is a plain maximum, not a sum.** Per the archived JS, the output is the single
  largest send value among all tracks routing to the return, not their sum or average.
- **Polling, not observing.** The value is refreshed by a `qmetro 33` poll (~30 Hz) rather than
  LiveAPI property observers, so it is CPU-cheap but not sample-accurate and has up to ~33 ms latency
  plus the `change`/`speedlim 30` de-duplication.

## Unrelated to Instrument Follower

Sends Follower is a **different, unrelated device** from Instrument Follower. Sends Follower is a
return-track audio effect that reads send levels via LiveAPI and outputs a follow value (max of
sends) into a local modulation/bus. Instrument Follower is a separate device that bridges Live Rack
macros to a Novation Launch Control XL MK3 controller with RGB feedback. They share neither code,
buses, nor purpose; the only thing in common is the word "Follower." This is confirmed by the patcher
contents: Sends Follower contains no controller I/O (`ctlin`/`ctlout`/`midiout`), no SysEx, no RGB or
LCXL references — only audio pass-through, LiveAPI send-reading, `live.remote~`, and two internal
buses.
