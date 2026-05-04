# Fadercraft XL Performance — Quickstart

Welcome, and thanks for picking up XL Performance. This page gets you from a fresh download to playing the kit in about five minutes. You'll need Ableton Live Suite (Max for Live is required) and a Novation Launch Control XL MK3 connected over USB.

If anything below doesn't match what you see on screen, double-check that Live's preferences show **Launch Control XL MK3** under **MIDI Ports** with **Track**, **Sync**, and **Remote** all switched on for both the input and the output.

---

## 1. Place files in Live's User Library

Unzip the bundle, then move its contents into your Ableton **User Library** so Live can find them. The User Library lives at:

- macOS: `~/Music/Ableton/User Library/`
- Windows: `Documents\Ableton\User Library\`

Drop the files like this:

- `XL_Performance.amxd` and `solo_follower.js` → `User Library/Presets/MIDI Effects/Max MIDI Effect/`
- `XL_Performance_starter.als` → `User Library/`
- `custom-modes/lcxl-mk3-modes.json` → anywhere convenient (you'll load it from Novation Components)

Keep `solo_follower.js` in the same folder as the `.amxd` — the device looks for it there.

![Screenshot: User Library folder with files in place](screenshots/01-user-library.png)

---

## 2. Drop `XL_Performance.amxd` on a MIDI track

Open any Live set, create an empty MIDI track (Cmd/Ctrl+T), then drag `XL_Performance.amxd` from the Browser onto the track. The device shows up in the Device chain at the bottom of the screen.

![Screenshot: device dropped on a MIDI track](screenshots/02-device-on-track.png)

---

## 3. Set MIDI From and MIDI To

In the track's **In/Out** panel:

- **MIDI From:** `Launch Control XL MK3` — choose the **DAW** port (sometimes shown as `LCXL MK3 DAW`)
- **MIDI To:** `Launch Control XL MK3` — same **DAW** port
- **Monitor:** **In**

Both directions matter: the device listens for mode changes on the input and sends mode-select messages back on the output. If you only wire one direction, the LEDs won't follow the layers.

![Screenshot: MIDI From and MIDI To set to LCXL MK3 DAW port](screenshots/03-midi-routing.png)

---

## 4. Toggle the device's "Active" switch on

On the device's front panel, flip **Active** on. The Solo Follower starts watching your tracks, and the controller jumps to mode 11 — the first page of the Mixer Layer. You should see the row of mode buttons on the controller light up.

If nothing lights up, recheck the MIDI routing in step 3, then hit **Active** off and on again to re-trigger the startup sequence.

![Screenshot: Active toggle highlighted on the device front panel](screenshots/04-active-toggle.png)

---

## 5. Open `XL_Performance_starter.als` to see all mappings live

Close the empty set and open `XL_Performance_starter.als` from your User Library. It comes pre-wired with ten instrument tracks (one per Instruments Layer page), four Mixer Layer pages, and a couple of return tracks, so the Solo Follower has something to chase.

Push any of the **Mode 11–14** buttons on the controller to move between Mixer pages. Push a button in the Instruments row (modes 1–10) to jump onto an instrument and start playing. The CC47 button bounces you back to the Mixer Layer with one tap and returns to the same instrument with a second tap — that's the cross-mode transit.

![Screenshot: starter Live set loaded with mode indicators](screenshots/05-starter-set.png)

That's it. You're playing.

---

## Need help?

Email **hello@fadercraft.com** with a screenshot of what you're seeing and which step it failed on. Replies usually land within a day.

## Stay in the loop

One short email per release, the occasional note on what's coming next, no spam. Sign up at <https://buttondown.email/fadercraft>.

---

*Fadercraft XL Performance v1.0 · Quickstart · 2026-05-04*
