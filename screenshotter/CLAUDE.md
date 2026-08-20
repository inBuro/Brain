# Screenshotter

Menu-bar app that takes screenshots ready to paste into a chat with a model: one global
hotkey, two size modes, window shadows removed rather than baked in.

- **Code**: `~/Projects/Projects/screenshot-mode/` (Objective-C, `./build.sh`)
- **Installed**: `~/Applications/Screenshot.app`, bundle id `com.inburo.screenshot`
- **Planning**: this folder

## Read first

- [wiki/internals.md](wiki/internals.md) — how the capture pipeline works and every trap
  already paid for. Read before touching capture, hotkeys, or permissions.
- [wiki/roadmap.md](wiki/roadmap.md) — what is done and what is next
- [wiki/log.md](wiki/log.md) — what happened, in order

## Rules

- Read `wiki/internals.md` before touching capture, hotkeys, or permissions — the traps below are only a summary
- A trap paid for once goes into `wiki/internals.md` the same day, or the next session pays for it again
- Intermediates (build logs, scratch captures) go to `.tmp/`, never next to the source

## Hard facts

- **Swift cannot build on this Mac.** CLT 26.2 landed on macOS 15.7 and its compiler
  (swiftlang 6.2.3.3.21) rejects every SDK on disk. The app is Objective-C for that reason
  — do not "modernise" it to Swift without a full Xcode install first.
- The Screen Recording grant belongs to the .app, so it is given once. A shell script
  fired from a Shortcuts service gets one prompt per calling app instead.
- Rebuilding changes the ad-hoc signature, which can make macOS re-ask for permission and
  can make `open` fail with `-600` until `lsregister -f` runs.
