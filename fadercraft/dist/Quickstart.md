# Fadercraft Control XL — Quickstart

Thanks for getting **Control XL** — a Max for Live device that turns your Novation Launch Control XL MK3 into a performance instrument: switchable Mixer and Instrument layers, two encoder banks per channel, and one-touch cross-mode jumps.

## What's in this bundle

- `XL_Performance.amxd` — the Max for Live device. Everything it needs is bundled inside, so there are no extra files to keep next to it.
- `custom-modes/` — 15 Custom Modes for your controller (1–10 instruments, 11–14 mixer, 15 cue).
- `Router.als` — a track with the device and MIDI routing already set up; drop it into your own project.
- `XL_Performance_starter.als` — a ready Live Set to explore the full workflow.
- This Quickstart.

## Requirements

- Ableton **Live 11 or later** — Suite, or Standard with the Max for Live add-on.
- **Max for Live 8.5** or newer.
- Novation Launch Control XL **MK3**.
- **macOS or Windows** — wherever Live 11 or 12 runs.

## Setup (about 5 minutes)

**1. Load the Custom Modes onto your LCXL MK3.**
Open Novation **Components**, connect the controller, and send the modes from `custom-modes/`:

- **Modes 11–14** (mixer) — load these as-is. The device relies on them.
- **Modes 1–10** (instruments) — optional. Load ours as a starting point, or keep your own layouts: the device only needs the cross-mode jump on **CC47** and Undo/Redo on **CC45–CC46** present in each instrument mode.
- **Mode 15** (cue) — optional. Load it if you want the Prelisten jump to land on the bundled cue layout.

**2. Add the routed track.**
Open `Router.als` — it already has the device on a track with MIDI routing configured. Drag that track into your own set, or open `XL_Performance_starter.als` for the full demo.

**3. Routing reference (only if you wire it up yourself).**
On the track that holds the device, set:

- **MIDI From** → *All Ins · All Channels*
- **MIDI To** → *Launch Control XL MK3 (DAW)* · **Ch. 7**
- **Monitor** → *In*

Without this routing the device receives no MIDI and the controller will not respond.

**4. Play.**
Switch a mode on the controller — the on-screen display follows the active mode, and the cross-mode jump takes you between the instrument and mixer layers.

## Using it

- **Cross-mode jump.** One hotkey (**CC47**) jumps between the instrument layer (modes 1–10) and the mixer layer (modes 11–14), returning you to the exact page you left.
- **Momentary or toggle.** **Hold** a switch for temporary access to the other layer, then release to snap back; **press** it to stay there. The same hold-or-press logic drives the page and bank switches.
- **Two encoder banks per channel.** Each channel exposes two encoder banks — Encoders 1–3 and 4–6 — so you get 6 controls instead of 2 without breaking muscle memory. `Bank` flips between the banks; `Page` moves between mixer pages.
- **Prelisten.** Toggles to the cue layout (mode 15) and back to your previous mode.
- **Undo / Redo.** Mapped to **CC45** and **CC46**.
- The on-screen controls (`Daw`, `Prelisten`, `Page`, `Bank`, and the `11–14` Mixer tabs) mirror the hardware, so you can drive modes from the screen as well.

## Updates

When a newer version is available, a mint **"New Version"** label appears at the top of the device. Click it to open the download page and grab the update. Gumroad also emails you a fresh download link with every release.

## Troubleshooting

**The controller doesn't respond, or modes don't switch.** Almost always this is the MIDI routing. The included `Router.als` already has it set; if you wired it up yourself, re-check that **MIDI From** is *All Ins · All Channels*, **MIDI To** is *Launch Control XL MK3 (DAW) · Ch. 7*, and the track **Monitor** is *In*.

---

Questions or trouble? Email **support@fadercraft.com** — we reply within 48 hours on working days.
