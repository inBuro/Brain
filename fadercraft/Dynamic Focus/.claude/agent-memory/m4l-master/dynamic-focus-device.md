---
name: dynamic-focus-device
description: Dynamic Focus.amxd — structure, box IDs, wiring, build notes. PoC for track-focus architecture.
metadata:
  type: project
---

# Dynamic Focus.amxd

**Status:** PoC, UNFROZEN, UI-fixed, current 2026-06-28.
Archive (pre-UI-fix): `Dynamic Focus.amxd.backup-2026-06-28-105340` (same folder).

FREEZE LESSON: manual frozen-container build broke the file (CreateDevice error 6).
DO NOT hand-assemble frozen .amxd for this device. Keep unfrozen.
If freeze ever needed: do it inside the Max editor only.

## Files

| File | Role |
|------|------|
| `Dynamic Focus.amxd` | Max MIDI Effect device (UNFROZEN — js is external) |
| `dynamic_focus.js` | Core IP — external js, MUST be in same folder as .amxd |
| `RESEARCH.md` | Architecture rationale |

Path: `/Users/Kirill/Brain/fadercraft/Dynamic Focus/`

No User Library copy yet (PoC stage). When ready to use in Live, copy `.amxd` to `~/Music/Ableton/User Library/Max Devices/`. JS is frozen-in, no external file needed.

## Device type

- classnamespace: `"box"` (verified from real M4L devices — NOT "dsp.midi")
- FROZEN: byte 0x14 = 0x07, mx@c wrapper at 0x20, JSON at 0x30
- MIDI Effect: uses `midiin` / `midiout` pair
- File: 10076 bytes; ptch_size: 10044; mxc_field: 9812

## Box map

| ID    | Object              | Inlets | Outlets | Presentation |
|-------|---------------------|--------|---------|--------------|
| obj-1 | live.thisdevice     | 0      | 2       | no           |
| obj-2 | js dynamic_focus.js | 1      | 2       | no           |
| obj-3 | gate                | 2      | 1       | no           |
| obj-4 | midiin              | 0      | 1       | no           |
| obj-5 | midiout             | 1      | 0       | no           |
| obj-6 | live.toggle         | 1      | 1       | yes (168,55,40,40) — parameter_enable=1 |
| obj-7 | comment "ACTIVE"    | 1      | 0       | yes          |
| obj-8 | comment "Dynamic Focus — PoC" | 1 | 0 | yes     |
| obj-9 | message (debug)     | 2      | 1       | yes (8,30,200,22) |
| obj-10 | prepend set        | 1      | 1       | no           |

## Wiring

```
obj-1[out0] → obj-2[in0]    live.thisdevice bang → js init()
obj-2[out0] → obj-3[in0]    active flag → gate control (left inlet)
obj-2[out0] → obj-6[in0]    active flag → live.toggle visual (parameter_enable=1)
obj-2[out1] → obj-10[in0]   debug symbol → prepend set
obj-10[out0] → obj-9[in0]   "set <str>" → message (updates displayed text)
obj-4[out0] → obj-3[in1]    midiin → gate data (right inlet)
obj-3[out0] → obj-5[in0]    gated MIDI → midiout
```

## UI fix rationale (2026-06-28)

**Problem 1 — live.toggle not updating:** with `parameter_enable=0`, live.* objects in presentation
mode may not redraw from programmatic int input. Fix: `parameter_enable=1` guarantees redraw.

**Problem 2 — message box not updating:** JS `outlet(1, "some string")` sends a Max symbol.
`[message]` doesn't update its displayed text when receiving a raw symbol — it outputs it.
Fix: route outlet 1 through `[prepend set]` → `[message]`. `[prepend set]` turns symbol "foo"
into the list "set foo"; message box receiving "set foo" updates its content AND display.

## JS embedding (frozen)

`dynamic_focus.js` is embedded via dlst:
- dlst entry: type=TEXT, fnam="dynamic_focus.js", of32=5760 (abs=0x16a0), sz32=4052
- JS injected with early debug: `outlet(1, "init: resolving host")` at top of `init()`
  so message box shows activity immediately when live.thisdevice bang arrives.

## Gate semantics (Max `gate` object)

- Left inlet (0) = control: 0 = closed, 1 = open
- Right inlet (1) = data (passes through when open)
- Output: gated data stream

## Testing in Live

1. Drag `Dynamic Focus.amxd` onto a MIDI track
2. Remove and re-drag if device was already loaded (Live caches by path)
3. Message box should immediately change from "initializing…" to "init: resolving host"
   (early debug outlet fires before LiveAPI calls)
4. Select the track → live.toggle lights up, message shows "host=X sel=X active=1"
5. Select a different track → toggle off, "host=X sel=Y active=0"
6. MIDI passes through only while own track is selected
