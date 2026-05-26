# Fadercraft Custom Modes for Launch Control XL MK3

14 Custom Modes ready to import into Novation Components for the Launch Control XL MK3.

## What's in the folder

| File | Contents |
|---|---|
| `1.syx`–`10.syx` | **Instruments Layer** — 10 instrument pages. Each mode emits a unique value on overlay CC 47 (10, 20, 30 … 100) so an external host can identify which page is active. |
| `11.syx`–`14.syx` | **Mixer Layer** — 4 mixer pages (`mode = 23 + bank + 2 · ((page + hold) % 2)`). Bank 1 / Bank 2 × Page 0 / Page 1. |
| `lcxl-mk3-modes-bundle.syx` | All 14 modes concatenated. Drag-and-drop once to import every slot in one shot. |

Every mode keeps **UNDO** on button 8 (`Cmd-Z`) and **REDO** on button 9 (`Cmd-Y`).

## How to import

1. Open [Novation Components](https://components.novationmusic.com/) and connect your Launch Control XL MK3 (USB).
2. Pick the device, switch to the **Custom Modes** view.
3. Drag `lcxl-mk3-modes-bundle.syx` onto the Components window — all 14 slots are written at once. Or drag individual `N.syx` files into specific slots.
4. **Send** the slots to the controller from Components (button at the top right of each slot).
5. On the controller, press one of the side buttons to switch modes.

Modes 1–10 (Instruments) and 11–14 (Mixer) are addressable directly from the controller's side buttons; no extra software needed for basic playback.

## What's actually useful without the paid bundle

These modes by themselves are just 14 standard Launch Control XL layouts — flip them with the hardware buttons, send the CCs you've mapped, done. Same as any custom mode you'd craft in Components.

**The interesting parts live in the paid bundle:**

- **Programmatic mode-switching** — pick a mode from a MIDI sequence, Push, another controller, or directly from Live's session view, without touching the LCXL.
- **Cross-mode transit with memory** — jump from Mixer Page 2, Bank 2 to Instrument 7, then snap back to exactly where you were (bank, page, hold state).
- **Solo Follower** — the track holding the device stays in solo together with whatever else you solo, so the device's own MIDI never gets silenced.
- **Pre-mapped Ableton Live Set** — instrument tracks, return tracks, parameters wired so the layouts mean something the moment you press a button.
- **Quickstart PDF and demo video.**

→ **[Fadercraft XL Performance — $39](https://fadercraft.gumroad.com/l/xl-performance)**

## License

Free to use, modify, and redistribute. Attribution appreciated but not required.
