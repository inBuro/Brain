# Fadercraft Dynamic Focus — Quickstart

Thanks for getting Dynamic Focus — two Max for Live devices that put your controller's knobs on
Live's screen as full-size controls with live values, and keep them mapped to whatever track
you're working on.

## What's in this bundle

- `Dynamic Focus Input.amxd` — the input layer. One per Set.
- `Dynamic Focus Slot.amxd` — the control layer. One per mapped knob (or several per track).
- This Quickstart guide.

Both devices are self-contained — everything they need is built in, with no extra files to
install.

## Requirements

- Ableton Live 11 or 12 — Suite, or Standard with the Max for Live add-on.
- macOS or Windows.

## Install

1. In Live's browser, open **Places → User Library**.
2. Drag both `.amxd` files into a folder there (for example **User Library → Presets → MIDI
   Effects** / **Audio Effects**), so they show up in your browser.
3. From there, drop each device onto a track as described below.

## Set it up

1. Drop **Dynamic Focus Input** on the MIDI track your controller sends into — the same track your
   controller's MIDI already lands on. It's a MIDI effect and passes MIDI straight through. The
   first time you drop it, it automatically switches that track's Monitor to **In** — no need to
   touch the mixer yourself.
2. Drop **Dynamic Focus Slot** on any track you want to control — one per knob, or several on the
   same track for a full row of controls.
3. On a Slot, click **Map**, then turn a knob on your controller. The knob's CC is now linked to
   that Slot.
4. Click **Map Parameter**, then click any parameter in Live. That's what the knob controls now,
   with its name, value, and range always visible on the display.

## Select vs Follow

Each Slot has two modes:

- **Select** — the classic mode. The Slot only responds while its own track is the selected track
  in Live. Move to another track, and the Slot goes quiet until you select its track again.
- **Follow** — the Slot always responds, no matter which track is selected. Turning its knob
  auto-selects the Slot's own track in Live, so you can jump around your Set from the controller
  itself.

Pick per Slot — mix Select and Follow across your Set as you like.

## Two skins

Switch between the default display and one that tints itself to the color of the track it's on, so
a glance tells you exactly where you are. You can also bring the instrument name front and center,
for clearer reading from across the stage.

## Mapping and persistence

Save up to nine parameters per Slot instance. Mappings are recalled when you reopen the same
project, and they travel with the device — drag a Slot to another track, duplicate the track, or
move it into another project, and Dynamic Focus re-finds the same parameter by name.

## Notes

- Both devices pass audio/MIDI through untouched — they only watch and drive, they never change
  what you hear.
- A small **New Version** label appears at the top of the device when an update is available.
  Updates are free for life — no subscription.

## Support

Questions or something not working? Email **support@fadercraft.com** and we'll reply within 48
hours on working days.

Thanks for supporting Fadercraft.
