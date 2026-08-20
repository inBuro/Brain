# Roadmap

## Phase 0 — working tool (7/7, 100%)

> Menu-bar app in Objective-C, builds with `./build.sh`, no Xcode
> Two size modes: Full-size screenshots / AI-optimized screenshots
> Window shadow switch, off by default
> Global hotkey, re-recordable from the menu (currently ⇧⌘4)
> Open at login via SMAppService
> Single instance enforced
> Menu wording settled: both modes named in parallel, hyphenated before the noun

## Phase 1 — next candidates

Nothing here is committed; pick when it actually gets in the way.

- **Delayed capture.** The standing question is whether a dropdown can be photographed at
  all now that the hotkey fires immediately. If menus still collapse when the crosshair
  appears, a timed capture is the standard answer: press, get a few seconds to open the
  menu, then the shot fires.
- **Retire the shell ancestors.** `~/bin/screenshot.sh`, `screenshot-process.py`,
  `screenshot-mode`, `screenshot-small.sh`, `screenshot-full.sh` and the Shortcuts Quick
  Action still exist. The Quick Action can shadow the app's hotkey — worth removing once
  the app has proven itself.
- **Icon.** Currently the SF Symbol `camera.viewfinder`.

## Not doing

- **Rewrite in Swift** — impossible on this machine, see [internals.md](internals.md).
- **iOS version** — the platform forbids the whole premise.
- **Mac App Store** — sandboxing rules out capturing other apps.
