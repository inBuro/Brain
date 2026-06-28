---
name: sends-follower-lfo
description: SendsFollower LFO.amxd — experimental device = SendsFollower 8-slot mapper fed by a NATIVE portable LFO (replaces stock-LFO embed which crashed with error -1). Read before editing this device.
metadata:
  type: project
---

# SendsFollower LFO — device facts (m4l-master)

Experimental SPIN-OFF of SendsFollower. Born because embedding the STOCK Ableton LFO multimap
(`liveui.multimap.maxpat`) into a custom device crashes Live (`error -1 making directory` →
`CreateDevice error 6: Device file broken`) — that path is CLOSED (see sends-follower.md "MM Test"
sections). Founder decision: build the goal ("LFO modulation drives the mapping") NATIVELY in a
separate device, leave shipping `SendsFollower.amxd` untouched.

## What it is
**SendsFollower's full working 8-slot mapper (taken byte-faithful) + a self-built portable LFO generator
feeding the mapper's source bus.** No stock internal-UI component, no bpatcher, no embed:1 — fully
portable/distributable, frozen, self-contained.

## Paths
- Device (edit in place): `~/Music/Ableton/User Library/Max Devices/SendsFollower LFO.amxd`
- Archive: `~/Brain/Fadercraft/Sends Follower/raw/archive/SendsFollower LFO.YYYY-MM-DD[-HHMMSS]-*.amxd`
- Built FROM (read-only base): `SendsFollower.amxd` (`7ebe7d15`, 444/594) — its mapper section reused verbatim.

## v1 initial build — 2026-06-18 (CURRENT)
- **md5 `7ae739b3229883e23133cf684f30ca28`, 366919 B, 493 box / 655 line.** Frozen, self-contained.
- Archive `raw/archive/SendsFollower LFO.2026-06-18-213200-v1-initial.amxd`.
- Container Path B, 4 resources (same as SendsFollower): JSON of32=16 sz32=338548; `multimap-unmap.svg`
  535B of32=338564 (`1a31f546`); `sf_version_check.js` 3106B of32=339099 (`a5d905fc`);
  `sends_follower.js` 24242B of32=342205 (`53bdbfbd`) — all 3 embedded byte-identical to SendsFollower.
  dlst total=440, `0x30+mxc−dlst=16`, ptch=fs−0x20, NO trailing mdat.
- ⚠️ **dlst patcher-resource fnam = `SF LFO.amxd`** (NOT the on-disk name `SendsFollower LFO.amxd`):
  fnam field is 20 bytes (filename ≤19 chars); the 22-char on-disk name does NOT fit. On-disk filename
  and internal fnam are independent — Live loads JSON regardless of fnam. Keep internal fnam ≤19.

## Reused VERBATIM from SendsFollower (do NOT redesign)
- 8× `live.map @strict 1 _persistence 1` (native param grab) + 9× `live.remote~` + 8× `live.modulate~`.
- Per-slot Remote leg: `scale_N 0. 1. 0. 1.` → `sig_N` → `remote_N`; Min/Max via `div_min/max_N /100`
  → scale_N outlow/outhigh. Mod leg: `modscale_N 0. 1. -1. 1.` → `modmul_N * 0.` → `modsig_N` → `mod_N`.
- `followf` (`f`) instant-recompute store + 32× `t b l` triggers (bound/depth/± apply at static source).
- Mode=Remote↔Mod toggle, ±/depth conditional Range, name-in-Map via comment overlay, lcd_panel, X-vis,
  idtrig engage-fix, mapcom, version_link, `_persistence`.
- `obj-46 js sends_follower.js` STILL in patcher (its follow leg now dead — see below — but JS must stay
  embedded or `can't find file`). `obj-7/obj-12 receive ---max_send` (the mapper's source bus).

## SOURCE-BUS REWIRE (the core change)
- The mapper reads its source at **message rate** from `receive ---max_send` (obj-7): obj-7 fans to all
  `scale_N`/`modscale_N` LEFT inlets + `followf` right inlet. Source is a **float 0..1** (sig_N converts
  to signal downstream). So the LFO must emit a message-rate 0..1 float.
- **CUT** `obj-48 (change 0.) → obj-50 (send ---max_send)` — the follow/JS chain no longer drives the bus.
  `obj-50` is now dead (no input) — harmless. The LFO's own `lfo_send (send ---max_send)` drives the bus
  (send/receive match by NAME → reaches obj-7/obj-12 → whole mapper).
- **REMOVED follow-mode UI** (meaningless for an LFO): `follow_mode` live.tab, `mode_label` comment,
  + patch `mode_prepend`/`mode_loadbang`/`mode_delay`. Their left-column presentation space reused by LFO.

## LFO GENERATOR (54 `lfo_*` objects, all portable MSP — no externals beyond stock m4l)
Signal-rate phasor → 6 waveforms → `selector~ 6` → `snapshot~` (50Hz via `metro 20`) → depth → clip → send.
- **Rate**: `lfo_syncfree` (live.tab Sync/Free, enum, param "Rate Mode", default Sync=0).
  - Sync: tempo from `transport` outlet 4 (BPM, banged by `lfo_tmetro metro 200`, held in `lfo_tempo f`).
    `lfo_syncdiv` (live.menu 1/1…1/32, default idx2=1/4) → `sel 0 1 2 3 4 5` → per-div message
    beats-per-cycle (`4 2 1 0.5 0.25 0.125`) → `lfo_bpcf f`. Hz = `(BPM/60)/bpc`
    (`lfo_bpm60 /60.` → `lfo_synchz /1.`[right inlet=bpc]). Recomputed each 200ms poll.
  - Free: `lfo_freehz` (live.numbox 0.01..20 Hz, default 1.0).
  - Mode select via two `gate` (no-arg, 1ctrl/1data/1out): `lfo_issync (== 0)`→syncgate ctrl,
    `lfo_isfree (== 1)`→freegate ctrl; both gates → `lfo_hzout f` → `lfo_phasor` freq. (Two independent
    gates, NOT one `gate 2 1` — synchz streams continuously and would leak through a shared-data gate.)
- **Waveform**: `lfo_wave` (live.menu Sine/Triangle/Saw Up/Saw Down/Square/Random, default Sine=0) →
  `+ 1` → `selector~ 6` control. selector sig inlets 1..6:
  - Sine: `cycle~ 0.` PHASE-driven (phasor→inlet **1**, freq 0) → `*~0.5`→`+~0.5` (−1..1→0..1).
  - Triangle: `*~2.`→`-~1.`→`abs~`→`!-~1.` (1−|2ph−1|, /\ shape 0..1).
  - Saw Up: phasor direct (0..1).
  - Saw Down: `!-~1.` (1−phasor).
  - Square: `<~0.5` (1/0).
  - Random S&H: `phasor→delta~→<~0.` (1-pulse at cycle wrap) controls `sah~ 0.5`[inlet1];
    sampled signal = `noise~→*~0.5→+~0.5`[inlet0].
- **Depth**: `lfo_depth` (live.numbox 0..100 %, default 100) `/100.` → right inlet of `lfo_depmul * 1.`;
  snapshot value → left inlet → `clip 0. 1.` → `send ---max_send`. Output range 0..depth%.
- **Sync/Free show-hide**: `lfo_syncfree[0]`→`sel 0 1`→ msgs `script show/hide lfo_syncdiv/lfo_freehz`
  →`thispatcher`. Sync shows Div menu, Free shows Hz numbox (overlap same pres rect [5,114,80,15]).
- Metros started by `live.thisdevice` outlet0 (bang on load) AND `loadbang` (bang starts metro — confirmed).

## Presentation (left column = LFO panel; table unchanged at x≥128)
- openrect UNCHANGED `[0,0,332,169]`. MAX(y+h)=166 ≤167, MAX(x+w)=324.
- Left col x5..85: "LFO" label [5,2], Sync/Free [5,97], Div menu / Free Hz (overlap, show-hide) [5,114],
  Waveform [5,131], Depth [5,148]. version_link "New Version" [54,4] kept. (dial obj-3 still present as
  monitor — fed by obj-7→obj-11_scale; shows LFO value 0..1 ×127.) 8-slot table x128..324 untouched.
- New patch objects placed off-screen (x≥1820), NO presentation → device face = left LFO panel + table.

## Validation (v1, all passed before promote)
- python `json.loads` + `jq -e .` valid; first `{`/last `}`; brace+bracket balance 0.
- **HARD CONSTRAINT MET:** ZERO `liveui.multimap`/`liveui.map`/`LiveUI.Map`/`Abl.*`/`multimap.maxpat`
  strings; ZERO bpatcher boxes; ZERO embed:1 boxes → `error -1 making directory` cause structurally absent.
- ptch=fs−0x20; mx@c−dlst=16; 3 embedded resources byte-identical to source canon.
- 21 connectivity checks pass (phasor freq fed, selector 6 sig + ctrl fed, full chain to send, gates,
  tempo poll, S&H, cycle phase inlet1, no dangling signal objects).

## OPEN / TODO
- **Hardware verification in Live** (cannot drive loader from agent env): drop on Audio/MIDI track →
  expect NO "Device file broken", LFO panel + 8-slot table render. Map a slot → wiggle should modulate.
- Was NOT re-opened in Max after freeze (avoid Live re-save reverting embedded JS to stale 5808B copy —
  the recurring SendsFollower hazard). If opened in Max, re-check embedded `sends_follower.js` md5.
- Naming: founder may rename file. Wiki/version-check manifest NOT wired for this experimental device
  (it inherits SendsFollower's `sf_version_check.js` pointing at the SF manifest — cosmetic, harmless).

## Reusable craft learned
- Tempo-sync LFO without externals: `transport` outlet4 = BPM on bang (M4L follows Live global tempo);
  Hz = (BPM/60)/beats-per-cycle, beats-per-cycle = 4/denom for "1/denom".
- Sine from phasor = `cycle~ 0.` with phasor into the PHASE (right) inlet, freq 0.
- Mode-select two streams where one streams continuously: use TWO independent `gate` (open/close per mode),
  NOT a single `gate 2 1` shared-data (the continuous stream leaks to the wrong outlet).
- snapshot~ + metro converts signal LFO → message-rate float for a message-rate mapper.
- dlst fnam field = 20B → on-disk filename can exceed 19 chars but the internal patcher fnam can't; keep
  them independent.
