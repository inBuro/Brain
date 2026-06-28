# Stock Multimap — Visual Spec (pixel-accurate)

Extracted read-only from Ableton Live 12 Suite stock M4L abstractions on 2026-06-18.
Goal: build a native 1:1 replica of the stock "black-frame" multi-mapping browser.

Source files:
- Container: `…/Max for Live/patchers/liveui.multimap.maxpat`
- One slot: `…/Max for Live/patchers/liveui.map.maxpat` (embedded as bpatcher name `LiveUI.Map.maxpat`)
- Media: `…/Max for Live/media/multimap-unmap.svg`, `multimap-closed-off.svg`, `multimap-open-off.svg`

## TL;DR — the v1 mistake

The stock multimap has **NO horizontal range bar / slider / multislider / dial — anywhere.**
Verified programmatically: zero `*slider*`/`*dial*`/`*multi*` maxclasses in either patcher.

A slot row = **3 columns**: `Parameter` (target name) | `Min` (live.numbox) | `Max` (live.numbox),
plus a clickable `X` unmap glyph over the name, plus a `Map` arming live.text under the name.

So the native look is **target-name + two Min/Max numberboxes** — which is structurally what
SendsFollower already had. The v1 `MM Native` did not miss a slider; it missed the exact
**colors, geometry, fonts, theme bindings, and the unmap-X + arming-Map overlay** of the stock row.
See "Deltas to reproduce" at the bottom.

---

## 1. Container frame layout (`liveui.multimap.maxpat`)

8 slot rows stacked vertically as `bpatcher`s, a background `panel`, a 3-column header,
and one show/hide toggle. All presentation coordinates below are in the container's
presentation space (origin top-left).

### Background panel — `obj-131` (`panel`, varname `displaybg`)
- `presentation_rect` = `[0, 0, 4, 4]` — placeholder size; the panel is auto/stretched
  (it is the FIRST drawn element so it sits behind everything).
- `bgcolor` = `[0.156863, 0.156863, 0.156863, 1]` = **#282828** (the "black" LCD frame)
- `saved_attribute_attributes.bgfillcolor.expression` = **`themecolor.live_lcd_bg`**
  (resolves to #282828 in default dark theme)
- `bordercolor` = `[1,1,1,0]` = white at alpha 0 (effectively no visible border)
- `border` = 1, `rounded` = 7 (7 px corner radius), `mode` = 0
- `proportion` = 0.39, `angle` = 270 (gradient params, but bgcolor is flat)

### Header row (column titles) — y = 145, height 18
All three are plain Max `comment` (NOT live.comment), font **Ableton Sans Medium 9.5**,
textcolor `[1,1,1,0.46]` = **white @ 46% alpha** (#FFFFFF, a=0.46):
| id | text | presentation_rect |
|----|------|-------------------|
| obj-138 | `Parameter` | `[0, 145, 63, 18]` |
| obj-11  | `Min`       | `[92, 145, 29, 18]` |
| obj-12  | `Max`       | `[125, 145, 29, 18]` |

Note: header y=145 sits BELOW the 8 stacked slots (slots occupy y 0..143). In the live
device the header appears above; the container's presentation_rects place the header band
after the rows — Live renders the whole 164-wide column with the header label band.
Column x-origins (0 / 92 / 125) **exactly match** the per-slot numbox x-origins below.

### Slot rows — 8× `bpatcher`, name `LiveUI.Map.maxpat`
Each slot: `presentation_rect` = `[0, Y, 164, 21]` — **164 px wide, 21 px tall**.
`embed` = 1, `border` = 0, `bgmode` = 0, `offset` = `[0,0]`, `viewvisibility` = 1.

Y-origins (top to bottom), **18 px row pitch**:
| slot | id | presentation_rect |
|------|----|-------------------|
| 1 (header-aligned dup) | obj-16 | `[0, 0, 164, 21]` |
| 2 | obj-1 | `[0, 18, 164, 21]` |
| 3 | obj-3 | `[0, 36, 164, 21]` |
| 4 | obj-4 | `[0, 54, 164, 21]` |
| 5 | obj-5 | `[0, 72, 164, 21]` |
| 6 | obj-6 | `[0, 90, 164, 21]` |
| 7 | obj-8 | `[0, 108, 164, 21]` |
| 8 | obj-9 | `[0, 126, 164, 21]` |

Geometry facts:
- Row pitch = **18 px** (next Y − current Y), even though each bpatcher view is 21 px tall
  (rows overlap 3 px — the slot's own content bbox is only 15 px tall, see §2).
- Slot inner content bbox (union of presentation rects inside one slot) = `[1, 1] → [159, 16]`,
  i.e. content is **15 px tall** inside a 21-px bpatcher, with a 1 px left/top inset.
- Slot draws **no background of its own** (no panel inside `liveui.map.maxpat`); the dark
  #282828 comes solely from the container `displaybg` panel behind all rows.

### Show/Hide toggle — `obj-23` (`live.text`, varname `live.text[3]`)
- `presentation_rect` = `[167, 1, 15, 15]` (15×15, to the right of the 164-wide column)
- `usepicture` = 1, `pictures` = `['multimap-closed-off.svg', 'multimap-open-off.svg']`,
  `remapsvgcolors` = 1, `usesvgviewbox` = 1
- enum `automation`=`Hide` / `automationon`=`Show`, text `Off` / texton `On`
- Colors all bound to themecolors: bg/bgon = `live_lcd_bg` (#282828),
  active text = `live_lcd_control_fg` (#FFB532 orange), border = `live_lcd_control_fg`,
  textcolor/textoffcolor = `live_lcd_control_fg_zombie` (#8C8C8C grey).
  (This is the device-header "open the multimap browser" button — likely NOT needed in our
  replica unless we also want a collapsible browser.)

---

## 2. One slot row — composition (`liveui.map.maxpat`)

Presentation-visible widgets in a single slot (5 boxes), all within a 164×15 content area:

| varname | maxclass | presentation_rect | role |
|---------|----------|-------------------|------|
| `border[2]` (obj-34) | live.text | `[1, 1, 74, 15]` | invisible frame/backing behind the name (ignoreclick) |
| `live.text` (obj-48) | live.text | `[1, 1, 74, 15]` | **target name display + Map arm toggle** (text "Map") |
| `live.text[2]` (obj-47) | live.text | `[76, 1, 15, 15]` | **unmap X** (SVG glyph, `hidden`=1 until mapped) |
| `TargetMin[1]` (obj-46) | live.numbox | `[92, 1, 34, 15]` | **Min** value (−100..100, %, init 0) |
| `TargetMax[1]` (obj-45) | live.numbox | `[125, 1, 34, 15]` | **Max** value (−100..100, %, init 100) |

Column x-map within the 164-wide slot:
- Name / Map block:  x **1 → 75** (width 74)
- Unmap X:           x **76 → 91** (width 15)
- Min numbox:        x **92 → 126** (width 34)
- Max numbox:        x **125 → 159** (width 34)  ← overlaps Min by 1 px (stock value)

### 2a. Target-name + Map arm — `obj-48` (live.text, varname `live.text`)
This single live.text does double duty: shows the mapped parameter's name AND is the
"Map" arm button (`appearance`=2 = button/text mode).
- text/texton = `Map` (default label before mapping; replaced by target name when mapped)
- `parameter_enable`=1, enum type (`parameter_type`:2), `parameter_longname`=`Map[1]`
- Colors (all bound to themecolor expressions):
  - bgcolor / bgoncolor / activebgcolor / activebgoncolor = `live_lcd_bg` → **#282828**
  - bordercolor / activetextcolor / activetextoncolor = `live_lcd_control_fg` → **#FFB532**
  - textcolor / textoffcolor = `live_lcd_control_fg_zombie` → **#8C8C8C** (grey when idle/"Map")
- Static fallback values stored: bg #282828 a1, border #FFB532, text #8C8C8C.
- Behavior: when armed/mapped, text turns orange (active*=#FFB532) and shows the param name;
  when idle it shows grey "Map".

### 2b. Unmap X — `obj-47` (live.text, varname `live.text[2]`)
- `usepicture`=1, `pictures`=`['multimap-unmap.svg','multimap-unmap.svg']`,
  `remapsvgcolors`=1, `usesvgviewbox`=1, `fontsize`=6, `appearance`=2
- `hidden`=1 by default → the X only appears once a parameter is mapped
  (in the container it's shown via the slot's own mapping logic; in `liveui.map` the X is
  driven by `zl compare <none>` → `hidden $1`).
- text `X` / texton `x`. SVG renders an orange (#FFB532) cross, viewBox 0 0 11 11.

### 2c. Min / Max numberboxes — `obj-46` / `obj-45` (live.numbox)
Both identical except value/longname:
- `appearance`=4 (number box w/ triangle/slider-tick decoration style)
- `prototypename`=`amount`
- Range `parameter_mmin`=−100, `parameter_mmax`=100, `parameter_unitstyle`=5 (**percent "%"**)
- `parameter_type`=1 (float), `parameter_linknames`=1
- Min init = **0**, Max init = **100** (`parameter_initial`)
- textcolor = `[1, 0.709804, 0.196078, 1]` = **#FFB532 orange**
- activebgcolor = `[0.94902, 0.376471, 0, 0]` = #F26000 at **alpha 0** (transparent fill)
- activeslidercolor / activetricolor2 / focusbordercolor = `[1, 0.709804, 0.196078, 1]` = #FFB532
- `textjustification`=0 (left)
- All color saved_attribute expressions are EMPTY strings → these are literal orange values,
  NOT theme-bound (so they stay orange regardless of theme).

---

## 3. Fonts

| element | fontname | fontsize | face |
|---------|----------|----------|------|
| Column headers (`Parameter`/`Min`/`Max`) | **Ableton Sans Medium** | **9.5** | default |
| Min/Max numbox text | (default live.numbox font) | default | — |
| Target name / "Map" live.text | (default live.text font) | default | — |
| Unmap X live.text | default | **6** | — |

(Only the header comments carry an explicit fontname/fontsize. The live.* widgets use the
default Live UI font and their box-height-derived size.)

---

## 4. SVG / media assets

All three are tiny single-color #FFB532 SVGs, viewBox `0 0 11 11`, `remapsvgcolors`=1
(so the fill is recolored by the widget's color attrs at runtime):
- `multimap-unmap.svg` — an X (cross polygon). Used by the per-slot unmap button.
- `multimap-closed-off.svg` — 4 horizontal bars (a "list/rows" icon = collapsed browser).
- `multimap-open-off.svg` — 1 horizontal bar (expanded browser icon).

For a 1:1 replica we need to bundle **`multimap-unmap.svg`** per slot. The two browser
toggle icons are only needed if we also build the collapsible-browser header button.
(`multimap-unmap.svg` is already vendored in SendsFollower as `multimap-unmap.svg`.)

---

## 5. Resolved theme colors (default dark theme)

| themecolor token | RGBA | hex |
|------------------|------|-----|
| `live_lcd_bg` | `[0.156863, 0.156863, 0.156863, 1]` | **#282828** |
| `live_lcd_control_fg` | `[1, 0.709804, 0.196078, 1]` | **#FFB532** (orange) |
| `live_lcd_control_fg_zombie` | `[0.549020, 0.549020, 0.549020, 1]` | **#8C8C8C** (grey) |

Other literal colors found:
- header text = #FFFFFF @ alpha 0.46
- numbox active fill = #F26000 @ alpha 0 (transparent)
- map button mapped border (obj-34 `border[2]`) = #FFB100 @ alpha 1

(Bind via `saved_attribute_attributes.<attr>.expression = "themecolor.…"` so the replica
follows the user's Live theme exactly, like the stock device does. The literal hex above are
the default-theme fallbacks Max stores.)

---

## 6. Deltas to reproduce — what v1 (`MM Native`) got wrong vs stock

The stock row is name + Min/Max numberboxes (NOT a slider) — so v1's choice of numberboxes
was structurally right. The miss was style/geometry fidelity:

1. **Row geometry**: stock slot = **164 px wide × 21 px bpatcher (18 px pitch)**, content
   only 15 px tall with 1 px inset. Column x-origins **0 / 92 / 125** (Parameter / Min / Max).
   Reproduce exact widths: name 74, X 15, Min 34, Max 34.
2. **Background**: a SINGLE container `panel` #282828 (`themecolor.live_lcd_bg`,
   rounded 7) behind ALL rows — slots themselves have NO background. v1 should use one
   shared LCD panel, not per-row fills.
3. **Three-column header band**: plain `comment` "Parameter"/"Min"/"Max",
   **Ableton Sans Medium 9.5**, white @46% alpha, x-aligned to the numbox columns.
4. **Map/name widget**: one `live.text` (appearance 2) that is BOTH the arming button and
   the name display; grey #8C8C8C "Map" when idle, orange #FFB532 name when mapped; colors
   theme-bound (`live_lcd_bg`/`live_lcd_control_fg`/`…_zombie`). v1 used a separate orange
   Map button + comment overlay; stock collapses both into one theme-bound live.text.
5. **Unmap X**: dedicated 15×15 `live.text` with `multimap-unmap.svg` (`usepicture`,
   `remapsvgcolors`, `usesvgviewbox`), `hidden`=1 until mapped, positioned at x76. v1's X was
   a `zl compare`-driven hidden toggle — keep that logic but use the SVG glyph at exact rect.
6. **Min/Max numbox styling**: `appearance`=4, `prototypename`=`amount`,
   range −100..100, `parameter_unitstyle`=5 (%), Min init 0 / Max init 100, text #FFB532,
   transparent active fill (#F26000 a0), slider/tri/focus colors #FFB532. Literal (not
   theme-bound) so they stay orange. v1 numboxes lacked the appearance/unitstyle/init fidelity.
7. **No slider/range-bar anywhere** — do NOT add `live.slider`/`multislider`/`rangeslider`.
   The "range" in stock is purely the two numberbox values; the visual is a clean
   3-column table, not a fader. This was the conceptual error in the brief.

## Summary

Native stock multimap = a compact dark **#282828 LCD table**: one background panel + a
3-column header (`Parameter | Min | Max`, Ableton Sans Medium 9.5, white@46%) + 8 stacked
164×21 rows. Each row = a theme-bound `live.text` showing the target name (grey "Map" →
orange name) doubling as the Map-arm toggle, a 15×15 SVG **unmap X** (hidden until mapped),
and two orange `live.numbox` Min/Max columns (−100..100 %, init 0/100). There is no slider
of any kind. v1 was right to use numberboxes but missed the exact geometry, the single shared
LCD panel, the theme-bound name/Map live.text, the SVG unmap-X glyph, and the numbox styling.
