# Fadercraft Control XL — Quickstart

Thanks for getting Control XL — a Max for Live device that turns your Novation Launch Control XL MK3 into a performance instrument, with switchable Mixer and Instrument layers, dual encoder banks per channel, and instant cross-mode switching.

## What's in this bundle

- `Control XL.amxd` — the Max for Live device. Everything it needs is self-contained, with no additional files required.
- `custom-modes/` — 15 Custom Modes for your controller (1–10 Instrument, 11–14 Mixer, 15 Cue).
- An Ableton project — either **Demo** (a ready-to-explore set with sample content) or **Starter** (an empty set with the device and MIDI routing already set up), depending on which download you chose.
- This Quickstart guide.

## Requirements

- Ableton Live 11 or later — Suite, or Standard with the Max for Live add-on.
- Max for Live 8.5 or newer.
- Novation Launch Control XL MK3.
- macOS or Windows.

## Setup (about 5 minutes)

### 1. Upload the Custom Modes to your LCXL MK3

Open Novation Components, connect your controller, and upload the modes from `custom-modes/`.

- Modes 11–14 (Mixer) — required. The device uses these layouts for mixer operation.
- Modes 1–10 (Instrument) — optional. You can use the included layouts or your own. The only requirements are:
  - Cross-mode jump on `CC47`
  - Undo on `CC45`
  - Redo on `CC46`
- Mode 15 (Cue) — optional. Load it if you'd like the Prelisten shortcut to open the included cue layout.

### 2. Add the routed track

Open the included Ableton project (`Control XL Demo` or `Control XL Starter`). It already contains the device and all required MIDI routing.

Drag the track into your own set, or build directly from the project.

**Keep the device last in the chain.** Place Control XL as the only device on its track, with nothing after it — in particular, no audio effect directly following it. Another device after it can block the device's feedback to the controller, so the hardware stops reflecting the active mode.

### 3. Routing reference (if configuring manually)

On the track that contains the device:

- MIDI From → All Ins · All Channels
- MIDI To → Launch Control XL MK3 (DAW) · Ch. 7
- Monitor → In

If these settings are incorrect, the device will not receive MIDI from the controller.

### 4. Play

Switch modes on the controller and the device display will automatically follow the active mode. Cross-mode switching lets you move between Instrument and Mixer layers instantly.

## Using it

### Cross-mode jump

Press `CC47` to move between your Instrument layout (modes 1–10) and the Mixer (modes 11–14). It works as a toggle: press once to cross over, press again to return. The device remembers the instrument you were playing and the mixer page you were on, and sends you back to exactly that spot.

### Page and Bank: momentary or toggle

When you switch Page or Bank, you have two options: press and release to switch and stay, or hold to glance at the other page or bank, then release to snap straight back.

The cross-mode jump above is toggle-only — there is no hold-to-peek between Instrument and Mixer.

### Two encoder banks per channel

Each channel provides two encoder banks:

- Bank A → Encoders 1–3
- Bank B → Encoders 4–6

This effectively gives each channel six encoder assignments while keeping the layout easy to remember.

### Prelisten

Jump to the Cue layout (Mode 15) and back to your previous mode. For now the cue layout maps one fader to the prelisten track volume, plus scroll up and down — this mode will gain more features over time.

### Undo / Redo

Mapped to:

- `CC45` → Undo
- `CC46` → Redo

### On-screen controls

The on-screen controls (Daw, Prelisten, Page, Bank, and Mixer tabs 11–14) mirror the hardware controls, allowing you to switch modes directly from the device interface.

## Updates

When a newer version is available, a New Version label appears at the top of the device.

Click it to open the download page and install the latest release. Gumroad also sends an updated download link by email whenever a new version is published. Updates are free for life — no subscription.

## Troubleshooting

### The controller doesn't respond, or modes don't switch

In most cases, the MIDI routing is incorrect.

If you're using the included project, everything is already configured. Otherwise, verify that:

- MIDI From → All Ins · All Channels
- MIDI To → Launch Control XL MK3 (DAW) · Ch. 7
- Monitor → In

### The on-screen controls work, but the hardware doesn't update

The screen reflects the active mode, but the controller's lights and mode don't follow.

Make sure Control XL is the last device on its track, with nothing after it — an audio effect placed directly after it can block the device's feedback to the controller. Move it to the end of the chain, or give it its own track.

## License

One license key, good for up to 3 activations across your machines. Your download is watermarked with your email.

## Need help?

Questions or issues?

Email support@fadercraft.com and we'll reply within 48 hours on working days.
