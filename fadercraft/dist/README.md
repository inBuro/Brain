# Fadercraft Control XL

A Max for Live device that turns your Novation Launch Control XL MK3 into a performance instrument — switchable Mixer and Instrument layers, two encoder banks per channel, and instant cross-mode switching.

**New here? Open `Quickstart.pdf` first.** It walks you through setup in about five minutes. This README is the short version plus a reference card you can come back to.

## What's in this bundle

- `Control XL.amxd` — the Max for Live device. Self-contained; no extra files required.
- `15 Custom Modes/` — the Custom Modes for your LCXL MK3 (1–10 Instrument, 11–14 Mixer, 15 Cue).
- An Ableton project — **Demo** (a ready-to-explore set with sample content) or **Starter** (an empty set with the device and routing already wired), depending on which download you chose.
- `Quickstart.pdf` — the setup and usage guide.

## Setup in three steps

Full details with screenshots are in `Quickstart.pdf`. In short:

1. **Upload the Custom Modes** — open Novation Components, connect your LCXL MK3, and upload the modes from `15 Custom Modes/`.
2. **Open the included Ableton project** — the device and all MIDI routing are already set up. Drag the track into your own set, or build from the project.
3. **Play** — switch modes on the controller and the on-screen display follows the active mode.

> **Keep the device last in the chain.** Place Control XL as the only device on its track, with nothing after it. Another device after it can block the controller's feedback, so the hardware stops reflecting the active mode.

## Controls reference

| Control | What it does |
|---|---|
| `CC47` — Cross-mode jump | Toggle between your Instrument layer (1–10) and the Mixer (11–14). Press once to cross over, again to return — it remembers exactly where you were. |
| Page / Bank | Press and release to switch and stay, or hold to glance at the other page or bank and snap back on release. |
| Encoder banks A / B | Bank A → encoders 1–3, Bank B → encoders 4–6 — six encoder assignments per channel. |
| Prelisten (Cue, Mode 15) | Jump to the Cue layout and back to your previous mode. Maps a fader to prelisten volume, plus scroll. |
| `CC45` / `CC46` | Undo / Redo. |
| On-screen controls | Daw, Prelisten, Page, Bank, and Mixer tabs 11–14 mirror the hardware. |

## Custom modes map

| Modes | Layer | Required? |
|---|---|---|
| 1–10 | Instrument | Optional — use the included layouts or your own (only `CC47` jump, `CC45` undo, `CC46` redo are needed). |
| 11–14 | Mixer | Required — the device uses these for mixer operation. |
| 15 | Cue | Optional — load it for the Prelisten shortcut. |

## MIDI routing (manual setup)

If you're not using the included project, set this on the device's track:

- **MIDI From** → All Ins · All Channels
- **MIDI To** → Launch Control XL MK3 (DAW) · Ch. 7
- **Monitor** → In

If these are wrong, the device won't receive MIDI from the controller — this is the most common reason for "nothing happens."

## Updates

When a newer version is available, a **New Version** label appears at the top of the device — click it to download and install. Gumroad also emails an updated link whenever a new release ships. Updates are free for life, no subscription.

## License

One license key, good for up to 3 activations across your machines. Your download is watermarked with your email.

## Need help?

Email **support@fadercraft.com** — we reply within 48 hours on working days.
