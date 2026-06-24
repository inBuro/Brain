# LFO Plus Map button — extracted recipe (read-only reverse-engineering)

Source: `raw/References/LFO Plus.amxd` (read-only reference). LFO Plus builds its multi-mapping
panel from its own `multimap.maxpat` (container) + `MapButton.maxpat` (one slot), NOT from the stock
`liveui.multimap`/`liveui.map` abstractions (which is why it does not crash). It uses the same stock
SVG assets by filename (`multimap-unmap.svg`).

This page documents the **blinking + state logic** of the Map button — the part we kept failing to
reproduce. Everything below is read from the extracted patcher JSON; object ids are LFO Plus's own.

## File identity (from the freeze)

| Extracted block | = file | Role |
|---|---|---|
| `block_22b_3` (22 boxes) | `multimap.maxpat` | Container: 8× `MapButton.maxpat` bpatchers, header comments, `displaybg` panel |
| `block_25b_63216` (25 boxes) | `MapButton.maxpat` | One slot: Map live.text + numboxes + `live.remote~` + the blink/state sub-patchers |
| `block_17b_221775` (17 boxes) | (transport observer) | Not relevant to mapping |

Container `displaybg` panel: `bgcolor [0.1569,0.1569,0.1569,1]` = **#282828**, `rounded 7`,
pres_rect `[0,0,204,163]`. Slots are bpatchers `[0, Y, 203, 21]`, **16 px pitch** (Y = 16,32,48,…112).
The slots have no background of their own; the dark frame is the one container panel.

## The Map widget itself (`obj-14`, `live.text`, `appearance 2`)

One `live.text` does double duty: shows the target name AND is the arm toggle. Key facts:

- `appearance 2` (button/text mode), `parameter_enable 1`, enum `parameter_type 2` (longname `Map[…]`).
- Its **static** color attrs are all literal orange `[1, 0.7098, 0.196, …]`:
  `textcolor`/`textoffcolor`/`bordercolor`/`activetextcolor` = orange a1; `bgcolor`/`activebgcolor` =
  orange **a0** (transparent fill); `bgoncolor`/`activebgoncolor` = orange a1.
  These literals are mostly overridden at runtime — see below.
- **The blink does NOT touch bg/border.** The blink and all state coloring are driven by sending
  **`lcdcolor` / `lcdbgcolor` / `inactivelcdcolor` / `focusbordercolor` messages INTO the live.text.**
  `live.text` in `appearance 2` renders its LCD using these message-settable colors, so the panel can
  recolor the button at runtime without changing its saved color attributes. This is the trick we
  missed: **you recolor by messaging `lcdcolor`, you do not flash `bgcolor`.**

## Theme colors (read live, not hard-coded)

`MapButton` pulls the actual theme RGB at runtime via `live.colors` + `live.thisdevice`:

| token | default RGBA | hex | used for |
|---|---|---|---|
| `lcd_control_fg` | `[1, 0.7098, 0.196, 1]` | #FFB532 orange | armed/mapped text |
| `lcd_control_fg_zombie` | `[0.549, 0.549, 0.549, 1]` | #8C8C8C grey | idle "Map" text |
| `lcd_bg` | `[0.1569, 0.1569, 0.1569, 1]` | #282828 | button background |

So the colors follow the user's Live theme. (A literal-color reimplementation that just hard-codes
#FFB532 / #8C8C8C / #282828 is visually identical in the default dark theme — acceptable for our
device, which already does this.)

## THE BLINK MACHINE — `p setButtonColor` (this is the part that matters)

Inlets:
- **inlet 0** (`obj-60`) — the **arm state** 0/1 (wired from the Map live.text's own outlet:
  `obj-14 → p setButtonColor`). 1 = armed (waiting for a parameter), 0 = not armed.
- **inlet 1** (`obj-10`) and **inlet 2** (`obj-18`) — the **mapped state** flags (wired from
  `RangeAndName` outlets 4 & 5): they choose which *static* color set is shown when NOT blinking
  (mapped → orange name; empty → grey "Map"). They push index 1 or 2 messages into the `switch`.

Outlet 0 (`obj-61`) → back into the Map `live.text` (`obj-39 → obj-14`): a stream of `lcdcolor …`
messages that recolor the button.

### Blink start/stop (the core)
```
inlet0 (arm 0/1) → sel 1 (obj-13)
   arm == 1 → [t 1] (obj-5) → bang qmetro 200 (obj-16)      ← START blinking
   arm == 0 → [t 0 b] (obj-3):
        0 → qmetro 200  (STOP the metro)
        b → restore message "lcd_control_fg, lcd_bg, lcd_control_fg_zombie" (obj-22)
            → re-emit the correct STATIC color (state-aware, see below)
```
- **The metro is `qmetro 200`** → period **200 ms** (~2.5 Hz blink). `qmetro` (low-priority) is used,
  not `metro`, so the UI repaint never blocks audio.
- `qmetro 200 → toggle (obj-11) → t b i (obj-40)`: the toggle flips 0/1/0/1 each tick.
  - The `i` (int) leg → `+ 1` → `gate 2` (obj-51): on toggle value it routes to **either**
    `lcdcolor $1 $2 $3 1.` (full-alpha orange) **or** `lcdcolor $1 $2 $3 0.5` (half-alpha orange).
  - So **the blink = the LCD text color (orange) alternating alpha 1.0 ↔ 0.5 every 200 ms.**
    The background and geometry never change — only the text brightness pulses.

### Stop = state-aware restore
When arm goes to 0, `t 0 b` (obj-3) stops the metro and bangs the restore message
`lcd_control_fg, lcd_bg, lcd_control_fg_zombie` (obj-22). That feeds `live.colors` and, gated by the
**mapped flags on inlets 1/2**, emits the correct static `lcdcolor`:
- **mapped** → `lcdcolor` = `lcd_control_fg` (full orange) → the target name stays orange.
- **empty** → `lcdcolor` = `lcd_control_fg_zombie` (grey) → back to grey "Map".

This is the piece we kept getting wrong: **the stop path is not "set grey" — it re-reads the
mapped/empty state and restores grey OR orange accordingly.**

## TEXT — `p setText`

The captured target's name (a list of ascii codes from the Live API) is turned into text:
`atoi → t l zlclear → zl slice 12` (**truncate to 12 chars**) → `zl join → itoa →`
`text $1, texton $1` into the live.text. On unmap, the X path sends a fresh `setText` that restores
the literal `Map`. So the visible label is owned by `setText`, the *color* by `setButtonColor` — two
independent paths into the same live.text.

## ARM / capture — `p mapping`

- The Map live.text outlet (0/1) → `p mapping` → `toggle` → `gate` fed by
  `live.path live_set view selected_parameter`. While armed, the next selected Live parameter passes
  the gate; `deferlow` defers it; `p dontMapToSelf` blocks mapping the device to its own params;
  `p exclusiveArm` disarms the other slots (single-arm). When a parameter is successfully captured the
  `t 0` (obj-12) turns the Map button **off** (comment in patch: "Turn off the map button when
  parameter was successfully mapped") — which, via `setButtonColor` inlet 0 going to 0, stops the
  blink and restores the now-mapped orange name. **Capture auto-disarms; you don't click again.**

## UNMAP — the X (`obj-28`, `live.text`, SVG)

- `live.text[1]`: `text "X"`, `usepicture 1`, `pictures ["multimap-unmap.svg","multimap-unmap.svg"]`,
  `remapsvgcolors 1`, `usesvgviewbox 1`, `appearance 2`, **`hidden 1` by default** (the X only shows
  once something is mapped — driven by `hidden $1` from the mapped flag, `obj-19`/`obj-31` → `hidden $1`).
- Click → `message id 0` (obj-20): sends `id 0` to `live.remote~` right inlet (releases the parameter
  back to Live) AND to `RangeAndName` (clears the stored target). Click also → `p setText` to restore
  the literal `Map`. The mapped flag then flips to empty, so `setButtonColor` restores grey.

## Min / Max numberboxes (`TargetMin[N]` / `TargetMax[N]`)

- `live.numbox`, `appearance 4`, `parameter_enable 1`, `parameter_unitstyle 5` (**percent "%"**),
  `parameter_type 1` (float), `parameter_linknames 1`.
- **`parameter_mmax 100.0`**, and crucially there is **no `parameter_mmin` set → min defaults to 0**.
  So the LFO Plus Min/Max range is **0…100**, init Min = **0**, init Max = **100**
  (`parameter_initial 0` / `100`, `parameter_initial_enable 1`).
- They feed `RangeAndName`'s `/ 100.` (×2) → the `scale`/signal math that drives `live.remote~`.

## The signal leg (for completeness)

`inlet (signal) → clip~ 0. 1. → RangeAndName`: inside, `scale 0. 1. min/100 max/100` produces the
scaled value; `live.remote~` (left inlet = signal, right inlet = `id n` from the resolved path) drives
the target. Right inlet `id 0` = release. This matches what our device already does via
`live.map → live.remote~`; only the **button visuals** are what we're importing.

## What was the missing key (summary)

1. **Recolor via `lcdcolor` messages into the live.text**, not by flashing `bgcolor`/`bordercolor`.
   The button bg/border never change; only the LCD text color is messaged.
2. **Blink = `qmetro 200` → toggle → alternate `lcdcolor … 1.` / `lcdcolor … 0.5`** (orange alpha
   pulsing 1.0↔0.5, ~2.5 Hz). `qmetro` (low-priority), not `metro`.
3. **Stop is state-aware**: arm→0 stops the metro AND restores grey (empty) or orange-name (mapped)
   by re-reading the mapped flag — never a blind "set grey".
4. **Capture auto-disarms** (the mapping sub-patch turns the button off on success), which naturally
   transitions blink → static orange name.
5. **One live.text** is both the name display and the arm button; **`setText` owns the label**,
   **`setButtonColor` owns the color** — two independent inputs.
6. Min/Max range is **0…100** (no negative), `%` unit, init 0/100.
