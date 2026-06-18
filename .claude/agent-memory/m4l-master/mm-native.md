---
name: mm-native
description: MM Native.amxd — Path A native black-frame multi-mapping panel (test device). live.dial Source → 8× live.map→live.remote~ with Min/Max. Replaces stock-multimap-embed (closed — crashes). Read before editing.
metadata:
  type: project
---

# MM Native — device facts (m4l-master)

Test/standalone device born from the **PATH A decision (2026-06-18)**: a NATIVE replica of the stock
"black frame" multi-mapping panel, built from scratch. The stock `liveui.multimap.maxpat` is CLOSED for
custom devices BOTH ways: embed crashes Live (`error -1 making directory` → `CreateDevice error 6:
Device file broken`), AND the reference-by-name path failed even with a known-valid device skeleton
(founder ran `MM Ref Test.amxd` md5 `5a3b7de1`, same `Device file broken`). Don't reopen the stock theme.

## Goal of the feature (final)
- An **encoder** device (separate, "on the left") feeds data from a sender. Its behavior is an AXIOM —
  NOT touched. (In current product terms = SendsFollower's source bus value, 0..1.)
- The encoder needs a **black frame**: native multi-map panel to map the encoder (as source) onto ANY
  parameter of ANY device, with per-slot Min/Max range.
- NO LFO/oscillation (the stock LFO was only a reference for the multimap MECHANISM).
- The frame must be VISIBLE (founder cares about the look — pointed at the stock black frame).

## Part-1 reconnaissance findings (2026-06-18, read-only, verified on disk)
- **Encoder fed by sender = SendsFollower.amxd** (md5 `7ebe7d15`, 444/594). The "sender/reader" is its
  LiveAPI send-gather JS (`sends_follower.js`, obj-46) → emits a float 0..1 on bus `---max_send`
  (`obj-50 send ---max_send`); the "follower/encoder" is the same device's 8-slot mapper reading
  `obj-7 receive ---max_send`. So sender→bus→mapper all live in ONE device; the bus name `---max_send` is
  the seam. (SendsReader.amxd is an inverted fork; ClearSends.amxd = unrelated utility, no map/bus;
  SendsFollowerRack.adg = SF chained with a stock LFO.)
- **SF's existing 8-slot mapper already maps ANY param via NATIVE `live.map`** (NOT sends-only): 8×
  `live.map @strict 1` + `_persistence 1` (out1=id→remote right inlet, out2=name, out3=state), 9×
  `live.remote~` (8 slots + 1 LFO leg obj-11), 8× `live.modulate~` (Mod legs). Per slot has Min/Max
  (`slot_min/max_N` live.numbox → `/100.` → `scale_N` outlow/outhigh) AND ±/depth (Mod mode). UI =
  black `lcd_panel` (`themecolor.live_lcd_bg`) + name-in-Map via `comment` overlay (`ignoreclick 1`) + X
  unmap (`zl compare <none>`→`hidden $1`). It loads fine, founder-tested → device-VALID reference.
- **Gap for "encoder → black frame → any param":** functionally NOTHING is missing in SF's mapper — it
  already grabs any param with Min/Max via live.map. The ask is really about **packaging**: a clean
  panel whose SOURCE is a plain encoder value (not the sends JS) and without the LFO/Mod/sends baggage.
  MM Native is that clean repackaging.

## What MM Native is (Part-2 v1)
**Clean from-scratch device** (NOT a fork-and-strip of SF — lower risk). Reuses SF's PROVEN idioms only:
`live.map @strict 1 _persistence 1` → `live.remote~`, Min/Max via `/100.`+`scale`, black `panel` LCD,
name-comment overlay, X-unmap. **Source = `live.dial` "Source" 0..1** (stands in for the encoder).
**NO JS, NO node.script, NO embedded files** → no freeze/dlst complexity, no `can't find file`.

## Paths
- Device (edit in place): `~/Music/Ableton/User Library/Max Devices/MM Native.amxd`
- Archive: `~/Brain/Sends Follower/raw/archive/MM Native.YYYY-MM-DD-HHMMSS-*.amxd`
- Built from (read-only ref): `SendsFollower.amxd` (`7ebe7d15`) mapper idioms; container header copied
  from `SendsReader.amxd` (simplest valid container).

## v3 name-fix + idle-border — 2026-06-18 (CURRENT)
- **md5 `c4e3b3893b0713607ac9fd2d0002137e`, 122928 B, 144 box / 170 line (+8 line).** Two fixes; no box
  added/removed; container = simple form, JSON GREW (no Path A — Live-resave v2 JSON was tighter, compact
  edit was +1200 over L0 → repack via simple-container: `prefix d[:0x20] + JSON + \x00`, ptch=len(JSON)+1
  @0x1C; NO dlst/mx@c/mdat to patch). Archive `…233828-v2-ondisk-preedit.amxd` (fa8779d7).
- **ROOT CAUSE of "name stays Map when mapped" (definitive):** `substitute <none> Map` has TWO outlets —
  outlet 0 = "Newly Substituted Message" (fires ONLY on match, i.e. unmapped name `<none>`→`Map`), outlet 1
  = "Message That Was Left Intact" (fires on NO match, i.e. a REAL param name). v2 wired ONLY `namesub_N[0]`
  → namesym → namemsg → map_btn. So unmapped showed "Map" (outlet 0), but MAPPED real names exited outlet 1
  and were DROPPED → button stuck on "Map". Stock `liveui.map` p SetName wires BOTH substitute outlets into
  p TruncateText for exactly this reason. **FIX:** added `namesub_N[1]→namesym_N[0]` for all 8 slots (+8
  line). The rest of the proven chain (livemap[2]→namesub→namesym(tosymbol)→namemsg(`text $1, texton $1`)
  →map_btn[0], plus livemap[3] state→map_btn[0]) was CORRECT — outlet routing (live.map 1=id/2=name/3=state)
  verified against stock obj-3. ⚠️ REUSABLE CRAFT: `substitute a b` is NOT a passthrough — the unmatched
  message leaves outlet 1, the substituted one leaves outlet 0; if you need BOTH cases downstream, wire BOTH
  outlets (this is why stock does). Don't assume outlet 0 carries everything.
- **Idle-border fix (cosmetic, founder ask):** v2 `map_btn_N bordercolor` was orange (`live_lcd_control_fg`,
  #FFB532) → visible orange frame in idle (looked like a button). Founder wants stock look = grey "Map", no
  bright frame. Set bordercolor → LCD bg #282828 (theme-bound `live_lcd_bg`) for all 8 → frame invisible;
  idle text stays grey (textcolor/textoffcolor = `live_lcd_control_fg_zombie` #8C8C8C), mapped name orange
  (activetextcolor/activetextoncolor = #FFB532). NOTE: stock obj-48 actually keeps bordercolor=orange-bound,
  but founder explicitly wants no idle frame → diverged intentionally. Everything else (theme bindings,
  appearance 2, parameter_enum) byte-equal to stock obj-48 (mine just lacks stock's `parameter_invisible 2`).
- name display chain is sound (matches stock idiom); `text $1, texton $1` into enum-param live.text DOES
  work — verified stock obj-48 uses the identical message into the same inlet. The dead-end was the dropped
  substitute outlet, NOT the live.text-label mechanism. (Contrast SendsFollower's earlier comment-overlay
  workaround — there the live.text-label genuinely misbehaved; here it's fine once fed correctly.)
- **OPEN:** still needs hardware verification in Live (map → name appears in button → Source moves target
  within Min/Max → unmap restores "Map"; confirm no orange idle frame). Not frozen / no version-check (test
  device). Source dial = encoder stand-in (integration into real encoder bus still TODO, see below).

## v2 stock-look — 2026-06-18 (superseded by v3)
- **md5 `fa8779d7312551c562278903a3aea19e`, 121728 B, 144 box / 162 line.** openrect `[0,0,304,169]`,
  pres bbox max x+w=296, y+h=161 (fits 169px shelf). Self-contained (no embedded files; SVG by name).
- **WHY v2:** founder rejected v1 look (looked like SF mapper — fat orange Map-button frames + separate
  comment overlay). v2 = pixel replica of stock "black frame" multimap per
  `~/Brain/Sends Follower/wiki/concepts/stock-multimap-visual-spec.md` (extracted from
  `liveui.map.maxpat` / `liveui.multimap.maxpat`). FUNCTION unchanged (source dial → 8× live.map →
  live.remote~ + Min/Max), ONLY presentation layer rebuilt.
- **UI deltas applied (vs v1):** (1) ONE shared `panel` #282828 `themecolor.live_lcd_bg` rounded-7
  behind table (`lcd_panel` prect `[128,0,168,~163]`); slots have NO per-row fills. (2) Row geometry per
  spec: name x131 w74 / X x206 w15 / Min x222 w34 / Max x255 w34; header band y2, rows from y18 pitch 18,
  content h15. Table left origin TX=130; source dial stays left `[14,40,90,48]`. (3) Headers = plain
  `comment` «Parameter/Min/Max» Ableton Sans Medium 9.5 white@46% (`hdr_map`→"Parameter"). (4) Name+Map =
  ONE `live.text` (`map_btn_N`, appearance 2) doubling as arm-toggle + name display — grey #8C8C8C "Map"
  idle → orange #FFB532 name mapped, colors theme-bound (live_lcd_bg / live_lcd_control_fg /
  …_fg_zombie). **Comment overlay DROPPED** (8× `mapcom_N` removed). (5) Unmap X = `map_unmap_N` live.text
  w/ `multimap-unmap.svg` (usepicture/remapsvgcolors/usesvgviewbox, fontsize6), `hidden 1` until mapped,
  x206; NOT letter "X". (6) Min/Max numbox = appearance 4, prototypename `amount`, range −100..100,
  unitstyle 5 (%), init Min0/Max100, literal orange text/slider/tri/focus + transparent active fill
  (#F26000 a0), parameter_type 1.
- **Name routing rewired** (stock mechanism, not comment): `livemap_N out2 (name)` → `namesub_N`
  (`substitute <none> Map`) → `namesym_N` (`tosymbol`, repurposed from old `nameset_N prepend set`) →
  `namemsg_N` (`message text $1, texton $1`, NEW) → `map_btn_N[0]`. `map_btn_N[0]` also fed by
  `livemap_N out3` (state toggle) — both into inlet 0 = exactly stock obj-48 behavior. `tosymbol`
  collapses multi-word names to 1 symbol so `$1` works. (Stock uses `p SetName`/`p TruncateText`; I use
  the simpler proven SF idiom `substitute→tosymbol→text $1,texton $1`.) ±8 line net: −8 (nameset→mapcom)
  +16 (namesym→namemsg→map_btn); box net 0 (−8 mapcom, +8 namemsg).
- **Signal/map plumbing UNTOUCHED from v1** (the part founder didn't criticize): source[0]→8× scale_N[0]
  →sig_N→remote_N[0]; livemap_N out1(id)→remote_N[1]; slot_min/max→/100.→scale_N[3/4]; X→unmapmsg
  →livemap[0]; livemap out2→xcmp(zl compare <none>)→xhide(hidden $1)→map_unmap (conditional show).
- **⚠️ FILE WENT MISSING from User Library between archive (22:38) and edit (~22:43)** — Live or user
  removed the on-disk `MM Native.amxd`. Built v2 from archive `…223830-v1-ondisk-preedit.amxd` (md5
  `9027be6a`, Live re-saved v1: grew to 142780 B, params dict moved under `patcher.parameters`, JSON still
  @0x20 simple container) and re-placed at User Library path. v1-initial md5 was `9a14e4e3` (90781 B);
  the 9027be6a re-save is the true v1-on-disk.
- Archives: `…221911-v1-initial.amxd` (9a14e4e3), `…223830-v1-ondisk-preedit.amxd` (9027be6a, Live
  re-save = build source), `…224519-v2-stock-look.amxd` (fa8779d7, = CURRENT).

## Container (SIMPLEST valid form — no mx@c, no dlst, no embedded files)
- `ampf`+u32(4) · `aaaa` (audio-effect chunk) · `meta`+size · `ptch`+**size(LE@0x1C)** · JSON@**0x20** ·
  `\x00` at EOF. **JSON starts at 0x20** (right after ptch+size — NO mx@c subheader because no embedded
  resources). Invariant: `ptch == filesize − 0x20`. Repack = `prefix(d[:0x20]) + JSON + b'\x00'`,
  `struct.pack_into('<I', prefix, 0x1c, len(JSON)+1)`. This matches UNFROZEN SendsReader layout, NOT the
  frozen JSON@48/mx@c layout. (If you ever embed JS here → must switch to frozen Path B + dlst.)
- ⚠️ **amxdtype `1633771873` = `0x61616161` = `"aaaa"` = AUDIO effect** (SendsFollower/SendsReader/
  ClearSends all use this and load fine). Control XL uses `1835887981` (MIDI). Header `aaaa` chunk +
  matching `project.amxdtype` = what makes Live accept it as an audio device. Device-VALID ≠ container-
  valid: also needs `plugin~`/`plugout~` (present, off-canvas, audio passthrough) + `parameters` dict.

## Structure
- **Source:** `live.dial` "Source" (varname `source`, param 0..1, presentation `[14,40,90,90]`), label
  comment "Source" above it. outlet0 fans to all 8 `scale_N` left inlets (message-rate float).
- **Audio skeleton:** `plugin~`→`plugout~` (off-canvas, passthrough) so Live wraps it as audio effect.
- **LCD panel:** `lcd_panel` (`maxclass panel`, rounded 7, `themecolor.live_lcd_bg`), presentation
  `[128,2,196,164]`, inserted as FIRST box (paints behind table). Headers Map/Min/Max comments.
- **8 slots** (table x≥128, rows y20 step 17.5, h15), each:
  `map_btn_N`(live.text toggle, frame-only, orange border/text) + `mapcom_N`(comment overlay, name,
  `ignoreclick 1` → click passes to button) + `map_unmap_N`(live.text X, hidden until mapped) +
  `slot_min_N`/`slot_max_N`(live.numbox 0..100, `parameter_unitstyle 5`="%", param, self-persist,
  transparent + orange digits). Plumbing (off-canvas, no presentation): `livemap_N`(live.map @strict 1
  _persistence 1, numoutlets 5) → `mapprep_N`(prepend mapping); `remote_N`(live.remote~); `scale_N`
  (scale 0. 1. 0. 1., **numinlets 6**) → `sig_N`(sig~); `div_min_N`/`div_max_N`(/ 100.); `xcmp_N`
  (zl compare <none>) → `xhide_N`(message hidden $1); `unmapmsg_N`(message unmap); `namesub_N`
  (substitute <none> Map) → `nameset_N`(prepend set).
- **Wiring/slot:** map_btn→mapprep→livemap[0]; X→unmapmsg→livemap[0]; livemap out1(id)→remote[1];
  out3(state)→map_btn[0]; out2(name)→namesub→nameset→mapcom[0] AND out2→xcmp→xhide→map_unmap[0];
  source[0]→scale[0]→sig→remote[0]; slot_min→/100→scale[3](outlow); slot_max→/100→scale[4](outhigh).

## Validation passed (v2, before placing)
- python `json.loads` + `jq -e .` valid on JSON re-extracted from container; first `{` / last `}`; ptch
  invariant (`ptch==fs−0x20`) holds.
- 0 orphan/bad line endpoints (all 162 lines reference existing boxes & valid inlet/outlet idx).
- Name routing chain complete for all 8 slots (livemap[2]→namesub→namesym→namemsg→map_btn[0]); 0 mapcom
  boxes remain; namesym/namemsg ×8 present.
- **ZERO crash-cause strings:** `liveui.multimap`/`liveui.map`/`multimap.maxpat`/`bpatcher`/`embed:1`
  all 0 → `Device file broken` cause structurally absent.
- amxdtype=aaaa, plugin~/plugout~ present, parameters dict (33 params: source + 8×map_btn + 8×map_unmap +
  8×slot_min + 8×slot_max). multimap-unmap.svg ×16 refs, SVG resolves by name (C74 packages media path +
  SendsFollower Project media). Comments = exactly 4 (Source + Parameter/Min/Max).

## OPEN / TODO
- **Hardware verification in Live** (cannot drive loader from agent env): drop on Audio track → expect
  NO "Device file broken"; black LCD panel + 8 rows render; map a slot → click any param of any device →
  turning Source moves the target within Min/Max. (Source dial = encoder stand-in.) **v2 specifically:**
  confirm the stock look — single dark panel (no per-row buttons), grey "Map" → orange target name in the
  live.text, orange SVG unmap-X appearing only when mapped, orange %-numboxes.
- **Integration into the REAL encoder device:** to wire MM Native's panel onto SendsFollower's encoder
  value instead of the test dial, replace the `live.dial source` source with `receive ---max_send`
  (the existing SF bus) — OR build the panel directly into a device that exposes the encoder value on a
  named bus. Open question for founder: should MM Native stay a standalone "frame" device (driven by a
  bus/sender) or be merged into SendsFollower? (SF already HAS this mapper — MM Native's value is the
  CLEAN standalone packaging without sends/LFO/Mod.)
- Mode column / Mod (live.modulate~) / ±/depth NOT included in v1 (Remote-only, per "no LFO/osc").
- NOT frozen / no version-check (test device). If distributing → no embedded files needed (no JS).

## Reusable craft learned
- **Simplest valid M4L audio device container** = no mx@c/dlst/embedded files: `ampf+aaaa+meta+ptch`
  header, JSON@0x20, `\x00` EOF, `ptch=fs−0x20`. Copy a working unfrozen device's `d[:0x20]` prefix,
  swap ptch size. amxdtype must be `aaaa`(audio)/correct type; needs plugin~/plugout~ + parameters dict.
- Build a fresh patcher programmatically: keep ALL plumbing off-canvas (x≥1600, no `presentation` key)
  so device face = only the presentation-flagged boxes; put the `panel` FIRST in boxes[] for back paint.
- scale with 4 args (`scale a b c d`) = **6 inlets** (val/inlow/inhigh/outlow/outhigh/exp); outlow=inlet3,
  outhigh=inlet4. live.numbox = 2 outlets (`["","float"]`). live.text toggle = 2 outlets.
