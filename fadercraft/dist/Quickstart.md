# Fadercraft Control XL — Quickstart

Thanks for getting **Control XL** — a Max for Live device that turns your Novation Launch Control XL MK3 into a performance instrument: switchable Mixer and Instrument layers, one-touch cross-mode jumps, and automatic Solo Follow.

## What's in this bundle

- `XL_Performance.amxd` — the Max for Live device. Everything it needs is bundled inside, so there are no extra files to keep next to it.
- `custom-modes/` — 14 Custom Modes for your controller (1–10 = instruments, 11–14 = mixer).
- `XL_Performance_starter.als` — a ready Live Set to start from.
- This Quickstart.

## Requirements

- Ableton Live 11 or later, **with Max for Live**.
- Novation Launch Control XL **MK3**.

## Setup (about 5 minutes)

**1. Load the Custom Modes onto your LCXL MK3.**
Open Novation **Components**, connect the controller, and import every file in `custom-modes/` (one mode per file): slots **1–10** for the instrument pages and **11–14** for the mixer pages.

**2. Add the device to a MIDI track.**
Open `XL_Performance_starter.als`, or drag `XL_Performance.amxd` onto a MIDI track in your own set.

**3. Set the track's MIDI routing — this is the step most people miss.**
On the track that holds the device, set:

- **MIDI From** → *Launch Control XL MK3 (DAW)*
- **MIDI To** → *Launch Control XL MK3 (DAW)*
- **Channel** → *All*
- **Monitor** → *In*

Without this routing the device receives no MIDI and the controller will not respond.

**4. Turn it on.**
Enable **Active** on the device. Solo Follower starts working: this track stays soloed alongside any track you solo, and focus follows the track you soloed last.

## Using it

- The on-screen controls (`Daw`, `Prelisten`, `Page`, `Bank fx`, `Hold`, and the `11–14` tabs) mirror the hardware, so you can drive modes from the screen as well.
- Switch freely between instrument and mixer modes. The one-touch cross-mode jump takes you to the other layer and back to exactly where you were.

## Updates

When a newer version is available, a mint **"New Version"** label appears at the top of the device. Click it to open the download page and grab the update.

## Troubleshooting

**The controller doesn't respond, or modes don't switch.** Almost always this is the MIDI routing from step 3. Re-check that **MIDI From** and **MIDI To** are both set to *Launch Control XL MK3 (DAW)*, **Channel** is *All*, and the track **Monitor** is *In*.

---

Questions or trouble? Email **support@fadercraft.com**.
