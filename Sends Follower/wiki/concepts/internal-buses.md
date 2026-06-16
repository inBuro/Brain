# Internal send/receive buses

Sends Follower carries the follow value over two Max named buses. These are global within the patch
(and within the Max instance namespace), letting separated subgraphs share the value without
patch-cords.

## `---max_send` — raw follow value (0.–1.)

- **Writer:** `send ---max_send` (`obj-50`), fed by `js sends_follower.js` → `route max` →
  `change 0.` (`obj-46` → `obj-47` → `obj-48`). So this bus carries the JS-computed maximum send
  value, de-duplicated by `change 0.`.
- **Readers:**
  - `receive ---max_send` (`obj-12`) → the modulation/percent chain (`change 0.` → `speedlim 30` →
    `t f f` → …). See [[live-remote-modulation-chain|live.remote~ chain]].
  - `receive ---max_send` (`obj-7`) → `* 127.` (`obj-11_scale`) → `prepend set` (`obj-11_set`) →
    `dial` (`obj-3`). This drives the front-panel meter dial: the 0.–1. value is scaled to 0–127 and
    `set` into the dial silently (no re-output).

The triple-dash `---` prefix is a Max convention for a bus scoped to the patcher hierarchy, keeping
it from colliding with buses in other devices in the set.

## `---max_send_percent` — follow value as 0–100

- **Writer:** `send ---max_send_percent` (`obj-20`), fed by `scale 0. 1. 0. 100.` (`obj-18`) off
  `t f f` outlet 1.
- **Readers:** none inside this device. It is a published convenience bus — a consumer patch in the
  same set can `receive ---max_send_percent` to read the follow value as a human-friendly 0–100
  number. The parallel `flonum` (`obj-19`) is a monitor read-out of the same value.

## Summary

| Bus | Range | Produced from | Consumed by |
|---|---|---|---|
| `---max_send` | 0.–1. | JS max of sends | modulation chain + meter dial |
| `---max_send_percent` | 0–100 | scaled follow value | external consumers (none internal) |

Both buses ultimately carry the same underlying follow value computed by
[[send-gathering-via-liveapi|the send-gathering JS]], differing only in scaling.
