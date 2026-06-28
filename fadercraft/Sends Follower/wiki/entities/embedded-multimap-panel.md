# Embedded multi-map panel (LFO Plus `multimap.maxpat`)

The shipping `SendsFollower.amxd` no longer uses a self-made mapping frame. As of 2026-06-19 the right
half of the device is the **proven multi-map panel lifted whole from the free LFO Plus device**
(`raw/References/LFO Plus.amxd`, used with permission), driven by Sends Follower's own follow signal.
This replaced the earlier in-house frame (8× `livemap_N`/`remote_N`/`scale_N`/`map_btn_N` + a custom
blink/state cluster) that was unreliable.

## Status

| Aspect | Status | Notes |
|---|---|---|
| Panel renders in the device shelf | ⚠️ Needs one Live load-test | One `bpatcher` (`multimap_panel`, `name multimap.maxpat`) in presentation at `[128, 0, 204, 163]`; 7 mapping rows + Parameter / Min / Max headers |
| Map a parameter (click Map → blink → pick) | ⚠️ Needs Live test | Handled entirely inside `MapButton.maxpat` (`p mapping` + `live.map`); the proven LFO Plus blink/state machine, not our rebuild |
| Follow value drives the mapped target | ⚠️ Needs Live test | Source = `receive ---max_send` (0–1) → `sig~` (`mm_sig`) → bpatcher inlet → fans to 7× `MapButton` → each `clip~ 0. 1.` → Min/Max → `live.remote~` |
| Per-slot Min/Max range | ⚠️ Needs Live test | `live.numbox` inside `MapButton` (`p RangeAndName`), 0…100 %, appearance from LFO Plus |
| Unmap (X) | ⚠️ Needs Live test | `MapButton` X glyph, `multimap-unmap.svg`, visible only when mapped |
| Self-contained / shippable (frozen) | ✅ Embedded in freeze | All 5 files in the dlst (see Runtime files); no external `.maxpat`/SVG needed by the buyer |
| Slot count | ⚠️ 7 (was 8) | LFO Plus's `multimap.maxpat` ships **7** `MapButton` bpatchers. Our old frame had 8. Accepted per the "take the node whole" decision; do not hand-add an 8th without re-testing |
| Tracking engine untouched | ✅ Verified | `sends_follower.js` md5 `53bdbfbd` byte-identical; left half (dial, Peak/Total, version-check) untouched |

## Object wiring (root patcher)

- `obj-7` (`receive ---max_send`, float 0–1) — the existing engine bus tap. **Branched, not cut**: it
  still feeds `obj-11_scale` (`* 127.` → encoder dial display). A new branch was added:
- `obj-7[0]` → `mm_sig` (`sig~`, float→signal) → `multimap_panel[0]` (bpatcher inlet 0).
- `multimap_panel` outlet 0 is the panel's "active-slot count" indicator (internal to `multimap.maxpat`);
  left unconnected at the root — harmless.

`MapButton` expects a **signal** 0..1 on its inlet (`clip~ 0. 1.`). Our follow value is already 0..1,
so `sig~` is the only conversion needed.

## Component internals (read-only, imported verbatim)

- `multimap.maxpat` (md5 `657fa074`, 63213 B): 1 signal inlet fans to **7× bpatcher `MapButton.maxpat`**
  + a `panel` themed from `live.colors`+`live.thisdevice` (`route lcd_bg` → `bgfillcolor`). Inline
  subpatcher `p colorlogic`. 1 outlet (active-count). No `live.remote~`/`live.map` at this level.
- `MapButton.maxpat` (md5 `50975cdc`, 156897 B): the self-contained slot. Inlet → `clip~ 0. 1.` →
  `patcher RangeAndName` (Min/Max scale + name) → `live.remote~`. UI: `live.text` (Map label + arm
  button), `live.toggle`, Min/Max `live.numbox`, X (`live.text`). Inline subpatchers `p colors`,
  `p setButtonColor` (the blink), `p mapping` (holds `live.map`, with `p exclusiveArm` /
  `p dontMapToSelf`), `p setText`. All subpatchers are inline (no external `.maxpat`).

Self-sufficiency was verified before embedding: the only external references are
`multimap.maxpat → {MapButton.maxpat, multimap-closed-off.svg, multimap-open-off.svg}` and
`MapButton.maxpat → multimap-unmap.svg`. No reference to any LFO Plus internals
(`M4L.api.ObserveTransport.maxpat`, `lfo-*-icon.svg`, `close.svg` were **not** imported).

## Runtime files (freeze / dlst)

All embedded in the device freeze (buyer needs nothing extra):

| File | md5 | Source |
|---|---|---|
| `multimap.maxpat` | `657fa074` | LFO Plus |
| `MapButton.maxpat` | `50975cdc` | LFO Plus |
| `multimap-closed-off.svg` | `d1c2fffd` | LFO Plus |
| `multimap-open-off.svg` | `a7f47192` | LFO Plus |
| `multimap-unmap.svg` | `1a31f546` | already present in SF (shared with old frame) |

Canonical copies of the imported `.maxpat`/SVG live in the LFO Plus reference under
`raw/References/LFO Plus.amxd` (read-only); they are reproduced byte-identically inside the device
freeze. Editing only root patcher objects does **not** require re-freezing.

## Removed in this integration

The whole self-made right frame: per slot `livemap_N`/`remote_N`/`scale_N`/`sig_N`/`map_btn_N`/
`map_unmap_N`/`slot_min_N`/`slot_max_N` plus `mapprep_N`/`namesub_N`/`namesym_N`/`namemsg_N`/
`unmapmsg_N`/`xcmp_N`/`xhide_N`/`div_min_N`/`div_max_N`/`tmin_N`/`tmax_N`, the blink cluster `bk_*_N`,
the shared `followf`, panel `lcd_panel` and headers `hdr_min`/`hdr_max`/`hdr_param`. 253 boxes removed,
16 orphaned `parameters` entries (`slot_min_N`/`slot_max_N`) pruned. The now-superseded in-house design
is documented in [[../concepts/map-button|Mapper]], [[../concepts/stock-multimap-visual-spec|Stock
multi-map visual spec]], and [[../concepts/lfoplus-mapbutton-recipe|LFO Plus Map-button recipe]].

See the device entity [[sends-follower-device|Sends Follower device]] and the 2026-06-19 log entry.
