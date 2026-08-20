# Log

## 2026-08-20 — from shell scripts to an app, in one session

Started as "I want a second hotkey that screenshots without resizing" and ended as a
menu-bar app.

**What existed before.** `~/bin/screenshot-small.sh` on ⇧⌘3 via a Shortcuts Quick Action:
halves Retina, caps at 2000 px, JPEG to the clipboard. Built in earlier sessions, along
with an unused `screenshot-half.sh`.

**Step 1 — a second script.** `screenshot-full.sh`: native size, `-o` at capture, PIL trim
of the leftover halo, PNG to the clipboard with a same-size JPEG fallback above 5 MB.
Found and fixed a leak inherited from the older script: `mktemp -t` had left 99 empty stubs
in `/var/folders`.

**Step 2 — one hotkey, modes switched by asking.** Merged both into `screenshot.sh` with
the mode in `~/.config/screenshot/mode` and a `screenshot-mode cloud|full|toggle` CLI, so
switching never means rebinding a hotkey.

**Step 3 — killed a myth.** The claim that Antigravity's window screenshots black because
of content protection turned out to be false: its `kCGWindowSharingState` is ReadOnly and a
direct window capture is fully readable. It was a missing TCC grant all along.

**Step 4 — the app.** Requirements: lives in the tray, hotkey assignable, shadow toggle,
size toggle. Swift refused to build at all (SDK/compiler mismatch in CLT 26.2), so after
two failed builds the approach switched to Objective-C, which compiled instantly.

**Then the bugs, in the order they surfaced:**

- Recording a new shortcut killed the app → `NSWindow.releasedWhenClosed` under ARC.
- Hotkey presses piled up and fired after the menu closed, and no crosshair appeared while
  a menu was open → `dispatch_async` in the Carbon callback, invisible in
  `NSEventTrackingRunLoopMode`. Capture became fully async as part of the fix.
- Two icons in the tray → no single-instance guard.

**Menu, as settled:** Full-size screenshots / AI-optimized screenshots / Add window
shadow, then Shortcut and Open at login, then Quit — capture settings in one block, ways of
invoking the app in the next. The shadow switch was reworded from "Remove" to "Add" and its
logic inverted to match; the subtitle under the AI mode was tried and then dropped. Both
mode names ended up parallel and hyphenated, since a compound adjective before a noun takes
a hyphen — `fullsized` is not a spelling in any dictionary.

**Measured, not assumed:** `-o` changes a window capture from 1654×2110 (668 718
semi-transparent pixels) to 1430×1886 (160, the corners), and changes nothing at all about
a rectangle drag.
