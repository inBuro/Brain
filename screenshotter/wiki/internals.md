# Internals

How the thing actually works, and every trap already paid for. Written so the next round
reads instead of re-investigating.

## Capture pipeline

1. `screencapture -i -t png` into a temp directory, `-o` prepended unless **Add window
   shadow** is on. Lossless and native size always — the mode only decides what happens
   afterwards.
2. No file on disk means the user pressed Esc. Silent exit, not an error.
3. Shadow halo trim (only when shadows are off): the alpha channel is thresholded at 240,
   and the image is cropped to the bounding box of what is left. Rounded window corners are
   partly transparent too, but they sit inside that box, so they survive.
4. Size mode:
   - **Full size (Retina)** — untouched pixels, PNG. Over 5 MB it is re-encoded as JPEG
     q92 at the *same* dimensions; the cap must never cost resolution.
   - **Optimized for AI size** — halved to undo Retina, long side clamped to 2000 px,
     JPEG q90. Never enlarges.
5. Encoded data goes on the pasteboard on the main thread; a notification reports mode and
   dimensions.

The whole thing is ImageIO/CoreGraphics — no dependency on homebrew Python, unlike the
shell-script ancestors.

## Icon assets

`Resources/full-size.svg` and `ai-optimized.svg` come from the Figma file `App`
(`4g32jWwsoHqygaPSVAvhln`, frames `2` and `1`), exported via the plugin API — the REST
token in `~/.config/figma/env` is expired. They load straight into `NSImage`, which reads
SVG natively, and run in template mode so macOS inverts them for a light menu bar.

**Take the `viewBox` as exported. Never trim it.** Frame padding is part of the design: cut
it, and the icon stretches to fill its box no matter what the designer does in Figma, so
their size edits appear to do nothing. Scale belongs in `icon.size`, not in the artwork.

## Traps, all paid for once

**Swift does not build here.** CLT 26.2 on macOS 15.7: SDKs on disk are built with
swiftlang 6.2.3.3.2 (26.2) and 6.1 (15.4), the compiler is 6.2.3.3.21, and every
`import AppKit` dies with "this SDK is not supported by the compiler". Every SDK on the
machine was tried. Fixing it means installing full Xcode (~10 GB). clang/Objective-C is
unaffected and builds in under a second.

**`NSWindow` kills the app under ARC.** A programmatically created window has
`releasedWhenClosed = YES`, so closing it releases the window that ARC also releases. The
crash lands later, in `objc_autoreleasePoolPop`, which makes it look unrelated to the
window. Symptom: the tray icon simply vanishes. Always set `releasedWhenClosed = NO`.

**Hotkeys must not hop through the main queue.** While a menu is open AppKit runs its own
loop in `NSEventTrackingRunLoopMode`, which does not serve the main dispatch queue. A
Carbon hotkey callback that does `dispatch_async(dispatch_get_main_queue(), …)` therefore
piles presses up and fires them all at once when the menu closes — and the crosshair never
appears while the menu is up. Carbon already delivers on the main thread: call straight
through, and keep the capture itself async via `NSTask.terminationHandler` so nothing
blocks whatever run loop mode is current. A launched `NSTask` stays alive on its own until
it exits (verified), so the handler still runs after the launching method returned.

**Screen Recording is granted per *responsible* process.** macOS blames whoever caused the
launch. A script fired from a Shortcuts service is attributed to the app the hotkey was
pressed from — hence a fresh prompt for every app. Going through a real .app makes the app
itself responsible: one grant, works everywhere.

**Antigravity has no content protection.** An earlier session concluded its window is
black in screenshots because the app blocks capture. Wrong. `kCGWindowSharingState` on its
window is ReadOnly (not None), and `screencapture -l <id>` returns the full readable
window. The black frames were only ever a missing TCC grant.

**Command-click never reaches a status item.** macOS reserves it for dragging menu-bar
items and consumes the event first — measured: a synthetic Command-click on the icon changes
nothing, while a plain click opens the menu. Option-click is free and is what the mode
toggle uses. Also note a status item with a permanently attached `menu` swallows clicks
entirely; the menu has to be attached for the duration of the click and cleared after.

**`-o` only affects window capture.** Measured on the same window: with shadow
1654×2110 with 668 718 semi-transparent pixels; with `-o` 1430×1886 with 160 (the rounded
corners). Same rectangle captured by drag with and without `-o`: identical, zero pixels
below alpha 240. So the shadow switch does nothing for rectangle drags, and a shadow that
lands inside a dragged rectangle cannot be removed afterwards — under it are real desktop
pixels, not transparency.

**`mktemp -t name` leaks.** It creates a stub file; appending an extension to that name
leaves the stub behind on every run. 99 of them had accumulated from the script era. Use
`mktemp -d` plus a `trap`.

**Two icons in the tray.** Nothing stops a second instance by default.
`LSMultipleInstancesProhibited` covers LaunchServices launches; an `NSRunningApplication`
check by bundle id covers direct execution of the binary.

**`open` fails with `-600` after a rebuild** until the bundle is re-registered:
`…/LaunchServices.framework/Support/lsregister -f ~/Applications/Screenshot.app`.

**`SMAppService` works with an ad-hoc signature** — verified: register gives status 1,
unregister returns 0. The worry that login items need a real Developer ID did not hold.

## Distribution, if it ever leaves this machine

- For personal use: nothing needed. Ad-hoc signing works indefinitely on the machine that
  built it.
- To hand to anyone else: Apple Developer Program, $99/year, for notarisation — otherwise
  Gatekeeper blocks it.
- Mac App Store is out: it demands sandboxing, and capturing other apps' windows is not
  allowed there.
- iOS is impossible, not merely hard: no access to other apps' screens, no global hotkeys,
  no background life.
