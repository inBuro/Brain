# Fadercraft Sends Follower — Quickstart

Thanks for getting Sends Follower — a pair of Max for Live devices that turn how hard a send is being
driven into a control value, and let you map that value onto any parameter in your set.

## What's in this bundle

- `Sends Follower – Return.amxd` — watches **every** track's send into the return it sits on.
- `Sends Follower – Track.amxd` — watches **one** send of the track it sits on.
- This Quickstart guide.

Both devices are self-contained — everything they need is built in, with no extra files to install.

## Requirements

- Ableton Live 11 or later — Suite, or Standard with the Max for Live add-on.
- Max for Live 8.5 or newer.
- macOS or Windows.

## Install

1. In Live's browser, open **Places → User Library**.
2. Drag the two `.amxd` files into a folder there (for example **User Library → Presets → Audio
   Effects**), so they show up in your browser.
3. From there, drop a device onto a track as described below.

Both devices are **audio effects** and pass audio straight through — they only watch and modulate, so
they never change the sound of the track they sit on.

## The two devices

### Sends Follower – Return

Put it on a **return track** (A, B, C, …). It watches the send knobs of **every track that feeds that
return** and turns them into one number:

- **Peak** mode — the value follows the single largest send into the return.
- **Total** mode — the value follows the sum of all sends into the return (capped at 100%).

The dial shows the current follow level. Switch Peak / Total with the **Mode** control. The idea: the
more the rest of your set pushes into this return, the higher the value rises.

### Sends Follower – Track

Put it on any **regular track**. It watches **one** of that track's own sends — pick which one from
the **send selector** dropdown. The dial shows that send's current level as the follow value.

Use this when you want one specific send (say, the reverb send on your lead) to drive something,
rather than the whole return.

Set the selector to **Manual** when you want the device to stop following — it then drives nothing and
leaves your sends and mapped parameters alone, without having to remove it from the track.

## Map the follow value to anything

Both devices have the same mapping panel on the right — eight slots:

1. Click **Map** on a free slot. The button starts blinking.
2. Click any parameter on any device in your set. Its name appears in the slot.
3. The follow value now drives that parameter, scaled into the slot's **Min** and **Max** range
   (in %). Set Min/Max to taste — including Min above Max to invert.
4. Click the **X** to unmap a slot.

Map one slot or all eight — each can drive a different parameter with its own range.

## Notes

- The follow level is read about 30 times a second, so it tracks send moves smoothly but is meant for
  control, not sample-accurate audio.
- Place either device anywhere in the chain — it passes audio through untouched.
- A small **New Version** label appears at the top of the device when an update is available. Updates
  are free for life — no subscription.

## Support

Questions or something not working? Email **support@fadercraft.com** and we'll reply within 48 hours
on working days.

Thanks for supporting Fadercraft.
