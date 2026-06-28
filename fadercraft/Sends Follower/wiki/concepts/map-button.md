# Mapper (8-slot direct parameter mapping)

The device face carries an **8-slot mapper** that mirrors the stock LFO's mapping list
(Parameter / Mode / Range) directly on Sends Follower. Each slot maps Sends Follower's own follow
signal onto any Live parameter you click, **bypassing the LFO**, with its own Min/Max range. It is an
*additive* output path: the existing `live.remote~` leg that drives the stock LFO's Offset (`obj-11`)
is untouched, and **eight** independent `live.remote~` objects drive the user-chosen targets in
parallel.

Added and frozen 2026-06-18 (device md5 `194ff283…`, 176150 bytes, 256 boxes / 274 lines). It
**replaces** the earlier single Map-button experiment (one `live.remote~`, one row), which was an
explicit precursor to this full list.

> The current shipping device (2026-06-19, md5 `79be0d3a`) is the **Remote-only** build:
> each slot maps via `live.map @strict 1 → live.remote~` (not the JS-observer mechanism described in
> the lower sections, which documented an earlier architecture). The Map-button blink/state machine
> below is the live, verified one.

## Map-button blink & state machine (2026-06-19, verified rebuild)

Rebuilt from scratch on the LFO Plus technique (see
[[concepts/lfoplus-mapbutton-recipe|LFO Plus Map-button recipe]]). Device md5 `79be0d3a`,
246297 bytes, 314 boxes / 412 lines. Per slot the cluster is `bk_*_N` (off-screen in patching view;
not in presentation, so the panel layout is unchanged).

| Aspect | Status | Notes |
|---|---|---|
| Empty slot shows grey "Map" | ✅ Works | `map_btn_N` idle `textcolor #8C8C8C`, bg `#282828`; never an orange fill |
| Arm → button blinks | ✅ Works | `live.map` out3 (armed 0/1) → `bk_arm_N (sel 1)` → `bk_start_N (t b)` → `bk_metro_N (qmetro 200)` → `bk_tgl_N` toggles → `bk_phsel_N` alternates `bk_phA_N` (orange α1.0) / `bk_phB_N` (orange α0.5). The blink pulses the **text alpha** 1.0↔0.5 at ~2.5 Hz; bg/border never change |
| Capture → solid orange name | ✅ Works | On capture, `live.map` disarms (out3→0); `bk_stop_N (t b 0)` stops the metro and bangs the state-aware restore, which lands on the orange branch because the slot is now mapped |
| Disarm on a mapped slot keeps orange name | ✅ Works | State-aware restore: `xcmp_N (zl compare <none>)` feeds `bk_flag_N (int)` (0=mapped, 1=empty); disarm bangs it → `bk_rsel_N (sel 0)` → mapped→`bk_rmap_N` (orange) / empty→`bk_ridle_N` (grey) |
| Unmap (X) → grey "Map" | ✅ Works | `map_unmap_N` → `unmap` → `live.map` releases; name returns to `<none>` → `substitute <none> Map` restores the label; `xcmp_N` flips the flag to empty → next restore is grey |
| Empty arm then cancel → grey "Map" | ✅ Works | Same state-aware restore: flag is still empty (1) so the disarm restores grey |
| Color only on text, bg stays `#282828` | ✅ Works | Every blink/restore message sets only `textcolor`/`textoffcolor`/`activetextcolor`/`activetextoncolor`; no `bgcolor`/`bordercolor` is ever messaged |
| Min range starts at 0 | ✅ Works | `slot_min_N.parameter_mmin` changed `-100 → 0`; range now 0…100, init 0, unit `%` |
| Font Ableton Sans Medium 9.5 | ✅ Works | Unchanged by this edit |

### What was the missing key (vs the earlier broken attempts)

1. **The metro was never stopped on disarm.** The old cluster started `qmetro` on arm but only
   selected a restore message on disarm — the metro kept ticking. The fix is LFO Plus's `t b 0`
   (`bk_stop_N`): the `0` outlet stops `qmetro`, then the bang outlet triggers the restore.
2. **Restore is state-aware**, not a blind "set grey": `bk_flag_N` always holds the mapped state
   (from `xcmp_N`), and the disarm bang emits it through `sel 0` so a mapped slot restores to the
   orange name and an empty slot to grey "Map".
3. **Blink = text-alpha pulse 1.0↔0.5 of the orange**, not a grey↔orange flash and never a bg flash.

### Objects (per slot N)

`bk_arm_N` (`sel 1`), `bk_start_N` (`t b`), `bk_stop_N` (`t b 0`), `bk_metro_N` (`qmetro 200`),
`bk_tgl_N` (toggle), `bk_phsel_N` (`sel 1`), `bk_phA_N` (orange α1.0 msg), `bk_phB_N` (orange α0.5 msg),
`bk_flag_N` (`int`), `bk_rsel_N` (`sel 0`), `bk_rmap_N` (orange α1.0 msg), `bk_ridle_N` (grey msg).
Driven by `live.map @strict 1` out3 (armed) and `xcmp_N` (mapped flag); all outputs land on
`map_btn_N` inlet 0.

## Status (earlier JS-observer architecture — historical)

| Aspect | Status | Notes |
|---|---|---|
| Eight independent slots | Works | 8× `live.remote~`, 8× path store (`pattr`), 8× Min/Max, 8× Map/X row |
| Arm one slot at a time | Works | Clicking a slot's **Map** toggle arms that slot; the JS disarms any previously armed slot (only `armedSlot` captures) |
| Capture the next clicked parameter | Works | JS observes `live_set view selected_parameter`; while a slot is armed it grabs the next selection's canonical path, assigns it to that slot, then disarms |
| Drive each target with SF's signal, scaled to Min…Max | Works | Per slot: raw follow value 0…1 → `scale 0. 1. min/100 max/100` → `sig~` → that slot's `live.remote~` |
| Min / Max range per slot | Works | Two `live.numbox` per slot (0…100, `parameter_enable 1` → persist themselves); divided by 100 and fed to the slot's `scale` out-low / out-high inlets |
| Show each captured target name | Works | A `comment` label per slot shows the target's `name` (or a short path) |
| Persist targets across reloads | Works | Each slot's path is stored as a token list in its own `pattr slot_N_path` (`@parameter_enable 1 @autorestore 1`) and re-resolved on load with a defer/retry ladder |
| Unmap / clear a slot | Works | The slot's "X" icon sends `unmap N`; the JS clears the path, clears that `pattr`, and sends `id 0` to the slot's `live.remote~` so Live re-enables the parameter |
| Mode column | Static label | Each row shows a non-interactive "Remote" comment (the stock LFO shows the modulation source mode here); Sends Follower has one mode, so it is static |
| Mapping icon matches the stock LFO look | Works (real stock asset for the X; recreated styling for the toggle) | See [Icon provenance](#icon-provenance) |

## What it does (plain terms)

The LFO leg modulates one fixed thing: the next device's Offset. The mapper lets you point the **same**
follow signal at **up to eight** parameters anywhere in the set without wiring them through the LFO,
each with its own range. Click a slot's **Map** (it turns orange), then click a knob/slider/parameter
anywhere in Live; Sends Follower captures it into that slot and starts driving it with the follow value
scaled into that slot's Min…Max. Click the slot's **X** to release it.

Each slot's signal is the **raw** follow value 0…1 (from `obj-7 receive ---max_send`), scaled into
`[Min/100 … Max/100]` of the parameter's normalized range — exactly like Min/Max on a stock LFO map
row. (This differs from the older single Map button, which tapped the bipolar −100…100 leg; the
8-slot version uses the raw 0…1 value so Min/Max behave like the stock LFO.)

## Objects (patcher)

The 16 single-Map objects were removed and replaced with per-slot blocks. Per slot `N` (0…7), 23 boxes:

| Object | id | Role |
|---|---|---|
| `live.text` "Map" toggle (`mode 1`) | `map_btn_N` | Arm/disarm slot `N`; click → `prepend arm N` → JS |
| `live.text` "X" (svg) | `map_unmap_N` | Unmap slot; click → `t b` → `unmap N` → JS |
| `comment` "—" | `map_lbl_N` | Captured target name (`set <name>`) |
| `comment` "Remote" | `map_mode_N` | Static Mode-column label |
| `live.numbox` Min (0…100) | `slot_min_N` | Range low; `parameter_enable 1` (persists) |
| `live.numbox` Max (0…100) | `slot_max_N` | Range high; `parameter_enable 1` (persists) |
| `route path name arm store release` | `sr_N` | Demultiplexes this slot's control from the JS |
| `prepend path` | `sp_path_N` | Rebuilds `path <tokens>` for `live.path` |
| `live.path` | `sl_path_N` | Resolves captured path → `id n` |
| `prepend set` | `sp_name_N` | Sets the label comment |
| `prepend set` | `sp_arm_N` | Sets the Map toggle silently (no feedback loop) |
| `prepend store` | `sp_store_N` | Persists the path into the slot `pattr` |
| `pattr slot_N_path @parameter_enable 1 @autorestore 1` | `pattr_slot_N` | Persists the slot's target path |
| `prepend restorepath N` | `sp_restore_N` | Feeds the restored path (with slot index) back to JS |
| `message id 0` | `sp_rel_N` | Releases the slot's remote target on unmap |
| `live.remote~` | `remote_N` | This slot's remote — drives the user target |
| `scale 0. 1. 0. 1.` | `scale_N` | Scales follow 0…1 into Min/100…Max/100 |
| `sig~` | `sig_N` | Signal-rate value into the remote's left inlet |
| `/ 100.` ×2 | `div_min_N`, `div_max_N` | Min/Max % → 0…1 → scale out-low/out-high |
| `prepend arm N` | `arm_msg_N` | Map toggle value → `arm N 0/1` to JS |
| `t b` | `unmap_tb_N` | Converts the X click to a bang |
| `message unmap N` | `unmap_msg_N` | Sends `unmap N` to JS |

Top-level / shared: `route 0 1 2 3 4 5 6 7` (`slot_route`, demultiplexes the JS map outlet by slot
index);
header comments `hdr_param` / `hdr_mode` / `hdr_range` and sub-labels `sub_min` / `sub_max`. The
existing `js sends_follower.js` box (`obj-46`) keeps **two** outlets: outlet 0 unchanged (the
`max <value>` follow output), outlet 1 the map-control outlet.

## Wiring

```
obj-7 (receive ---max_send, raw 0..1) ──▶ scale_N inlet 0 ──▶ sig_N (sig~) ──▶ remote_N inlet 0
slot_min_N ──▶ div_min_N (/100) ──▶ scale_N inlet 3 (out-low)
slot_max_N ──▶ div_max_N (/100) ──▶ scale_N inlet 4 (out-high)

obj-46 (js) outlet 1 ──▶ slot_route (route 0..7) ──▶ sr_N (per slot)
   ├ path    ──▶ prepend path ──▶ live.path ──▶ remote_N inlet 1   (id n)
   ├ name    ──▶ prepend set  ──▶ map_lbl_N
   ├ arm     ──▶ prepend set  ──▶ map_btn_N            (silent set, no feedback)
   ├ store   ──▶ prepend store ──▶ pattr_slot_N
   └ release ──▶ message id 0 ──▶ remote_N inlet 1     (id 0 = unmap)

map_btn_N  click ──▶ prepend arm N ──▶ obj-46 inlet 0   (arm N 0/1)
map_unmap_N click ──▶ t b ──▶ message unmap N ──▶ obj-46 inlet 0
pattr_slot_N (autorestore on load) ──▶ prepend restorepath N ──▶ obj-46 inlet 0
```

`live.remote~` takes its target as `id n` on the right inlet (from `live.path`); sending `id 0` there
releases the parameter back to Live. The left inlet is the audio-rate `sig~` value.

## JS behavior (`sends_follower.js`)

The embedded script keeps `outlets = 2`; the follow-value path (outlet 0, `outlet(0, "max", result)`)
is unchanged. The map subsystem is now slot-indexed (`NSLOTS = 8`):

- **`arm <slot> 0|1`** — sets `armedSlot`; arming a new slot disarms the previous one (single-arm);
  installs the `selected_parameter` observer on first arm.
- **`selected_parameter` observer** — installed on `live_set view`. It captures **only while a slot is
  armed**: when the user clicks a parameter, the observer reads `live_set view selected_parameter`,
  takes its `unquotedpath`, assigns it to `armedSlot`, disarms, persists the path, emits the target
  name, and resolves/connects it. Clicks outside arm are ignored.
- **`restorepath <slot> <tokens…>`** — called on load by each slot's `pattr` autorestore. The path is
  stored and restored as a **token list**, not a single symbol, so it does not depend on how Max quotes
  spaces. A single `none` token means "no target."
- **Resolve with retry** — `resolveAndConnect(slot)` emits the path for that slot's `live.path`;
  `retryResolve(slot)` re-attempts every 150 ms (up to ~20 tries) until the path resolves, the same
  cold-load anti-race the device uses for the [[self-healing-return-index|return index]]
  (`Task.schedule`).
- **`unmap <slot>`** — clears that slot's path, clears its `pattr`, sends `release` (→ `id 0`), and
  resets the slot's button and label.

The `selected_parameter` path is the documented Song View property for the parameter currently selected
in Live.

## Persistence

Each captured path lives in its own `pattr slot_N_path` (`@parameter_enable 1` so it saves with the set
and with device presets; `@autorestore 1` so it emits on load). Because parameter ids are
session-specific, only the **canonical path** is stored; on load each `pattr` emits it → `restorepath N`
→ the JS re-resolves the id through `live.path` (with the retry ladder, since the Live API may not be
ready immediately). Min/Max are `live.numbox` with `parameter_enable 1`, so they persist on their own.

## Icon provenance

- **Unmap "X" — real stock asset.** Each `map_unmap_N` is a `live.text` with `usepicture 1`,
  `pictures ["multimap-unmap.svg", "multimap-unmap.svg"]`, `usesvgviewbox 1`, `remapsvgcolors 1`. The
  SVG is the built-in Cycling '74 asset `…/C74/packages/Max for Live/media/multimap-unmap.svg`, the same
  file the stock M4L mapping abstraction (`liveui.map.maxpat`) references. It ships inside the "Max for
  Live" Max package on every Live install and resolves by filename on the Max search path. In this
  device it is **also embedded** (one `multimap-unmap.svg` resource in the `dlst`), so it renders even
  if a host lacks the package on its search path; either way there is no missing-file error for buyers.
- **Map toggle — recreated stock styling.** Live's single "Map" arm button is not a shareable image
  asset; it is a `live.text` toggle. Each `map_btn_N` recreates the stock look, using the colors read
  from the stock `liveui.map.maxpat` (`obj-48`): idle background `[0.157, 0.157, 0.157, 1]` with grey
  text `[0.549, 0.549, 0.549, 1]`; when armed, the text turns the Ableton orange
  `[1.0, 0.7098, 0.1961, 1]` with an orange border. `appearance 2`, `mode 1` (toggle).

## Layout

The presentation view grew to fit the table: the device's `openrect` went from `[…, 169]` to
`[0, 0, 340, 385]` (much wider and taller, like a stock LFO map list — this is expected and agreed for
the full list). Above the table the existing top controls are unchanged: the dial, the Mode switch, and
the "New Version" button. The table sits below:

- Header row at `y = 200`: "Parameter" (x 4), "Mode" (x 284), "Range" (over the Min/Max columns), with
  "Min %" / "Max %" sub-labels at `y = 213`.
- Eight data rows from `y = 227`, step `18`. Columns: Parameter label (x 4, w 118), X unmap (x 126),
  Map toggle (x 144, w 44), Min `live.numbox` (x 192), Max `live.numbox` (x 238), static "Remote" Mode
  label (x 284).

This is **visually close, not pixel-identical** to Ableton's mapping list — Live's renderer is
proprietary. The columns, headers, orange-on-arm Map toggle, and stock X icon match as closely as the
`live.*` objects allow.

## Relationship to the LFO leg

This is a **parallel** output, not a replacement. Sends Follower can now drive, simultaneously:

1. The fixed LFO leg — `obj-11` → the next device's Offset (`devices 1 parameters 5`). Always active,
   driven by the bipolar −100…100 signal (`obj-16`).
2. Up to eight Map slots — each `remote_N` → whatever parameter you mapped, driven by the raw follow
   value scaled into that slot's Min…Max.

The Map slots do **not** route the LFO's audio or control the LFO's own mapping (the stock LFO is
encrypted and its map UI is not addressable — see [[live-remote-modulation-chain|live.remote~ chain]]);
they drive SF's own signal directly.
