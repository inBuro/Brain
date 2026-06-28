---
name: midilearn-poc-device
description: MIDI Learn PoC.amxd — MVC MIDI Learn slot PoC. pattr persist, jsui, live.dial backing param.
metadata:
  type: project
---

# MIDI Learn PoC.amxd

**Status:** PoC, UNFROZEN, built 2026-06-28. No archive (first build).
Path: `/Users/Kirill/Brain/fadercraft/Dynamic Focus/`

## Files

| File | Role |
|------|------|
| `MIDI Learn PoC.amxd` | Max MIDI Effect device (unfrozen) |
| `midi_learn_slot.js` | Controller: learn + route, 5 inlets / 4 outlets |
| `slot_ui.js` | JSUI view: name + value bar, drag interaction |

All JS files are external (unfrozen). Must be in same folder as `.amxd`.

## Architecture (MVC, one slot)

| Layer | Object | Notes |
|-------|--------|-------|
| Model | `live.dial` (obj-3) | parameter_enable=1, NOT in presentation, Float 0–1, longname "Slot 1" |
| View | `jsui slot_ui.js` (obj-4) | in presentation, draws name+bar, drag→outlet |
| Controller | `js midi_learn_slot.js` (obj-2) | arm/learn/route logic |
| Persistence | `pattr learnedCC` (obj-10) + `pattr learnedChannel` (obj-11) | survive save/load |

## Box map

| ID    | Object                  | Inlets | Outlets | Presentation |
|-------|-------------------------|--------|---------|--------------|
| obj-1 | live.thisdevice         | 0      | 2       | no           |
| obj-2 | js midi_learn_slot.js   | 5      | 4       | no           |
| obj-3 | live.dial "Slot 1"      | 1      | 2       | NO (hidden param) |
| obj-4 | jsui slot_ui.js         | 2      | 1       | yes (8,8,200,80) |
| obj-5 | live.button (Learn)     | 1      | 1       | yes (216,8,55,30) |
| obj-6 | ctlin                   | 0      | 3       | no           |
| obj-7 | pack i i i              | 3      | 1       | no           |
| obj-8 | prepend set (MIDI→dial) | 1      | 1       | no           |
| obj-9 | prepend set (jsui→dial) | 1      | 1       | no           |
| obj-10| pattr learnedCC         | 1      | 1       | no           |
| obj-11| pattr learnedChannel    | 1      | 1       | no           |
| obj-12| message (debug display) | 2      | 1       | yes (8,96,264,20) |
| obj-13| prepend set (debug)     | 1      | 1       | no           |
| obj-14| comment "Learn"         | 1      | 0       | yes          |
| obj-15| comment "MIDI Learn PoC"| 1      | 0       | yes          |

## Signal flow

```
live.thisdevice[0] → js[0]          init bang

live.button[0] → js[1]              arm (1=start learning)

ctlin[0] → pack[0]                  CC value
ctlin[1] → pack[1]                  CC number
ctlin[2] → pack[2]                  CC channel
pack[0] → js[2]                     list [val,cc,ch] to learn/route

pattr learnedCC[0] → js[3]          restore CC on load
pattr learnedChannel[0] → js[4]     restore channel on load

js[0] → prepend-set(8)[0] → live.dial[0]   MIDI route: norm val → "set val"
js[1] → pattr learnedCC[0]          save learnedCC
js[2] → pattr learnedChannel[0]     save learnedCh
js[3] → prepend-set(13)[0] → message[0]    debug string

live.dial[0] → jsui[0]              value update → redraw only (no re-emit)

jsui[0] → prepend-set(9)[0] → live.dial[0] drag val → "set val" → dial
```

## pattr persistence

`pattr learnedCC` and `pattr learnedChannel` store integers in the device's state.
On Live set save: values written. On load: output their stored values → js inlets 3/4.
JS `msg_int` on inlet 3 sets `learnedCC`, inlet 4 sets `learnedChannel`.
This is the primary PoC validation point.

## JSUI sync (no feedback loop)

- `live.dial[outlet0]` → `jsui[inlet0]`: only updates `currentValue` + redraws. No re-emit.
- `jsui` drag → `outlet(0, val)` → `prepend set` → `live.dial[inlet0]`: sets dial silently.
- Zero feedback loop by design: JSUI never echoes incoming values.

## ctlin + pack wiring note

`ctlin` fires three separate ints sequentially (value, CC, channel) from outlets 0,1,2.
`pack i i i` collects them into a list. Max `pack` outputs when LEFT inlet (0=value) triggers.
The ctlin outputs fire right-to-left in Max convention, so channel→CC→value order means
value (outlet 0) fires last → pack outputs once all three are received. Correct.

## What to test in Live

1. Drag onto a MIDI track. Console should show "init: slot ready, learnedCC=-1 ch=-1"
2. Click Learn button → Console: "ARMING — twist the CC you want to map…"
3. Twist any CC knob → Console: "learned CC=N ch=M" + first routed value
4. Twisting learned knob moves live.dial (hidden) + jsui bar
5. Open Configure → "Slot 1" parameter visible, automatable, mappable to Rack Macro
6. Save set, close Live, reopen → learnedCC still routes (pattr round-trip)
7. Drag jsui bar → live.dial moves → automation recorded if in record

## File stats

- `MIDI Learn PoC.amxd`: 8887 bytes, unfrozen (0x14=01)
- `midi_learn_slot.js`: 2987 bytes
- `slot_ui.js`: 3508 bytes
