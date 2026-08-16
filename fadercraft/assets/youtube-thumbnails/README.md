# YouTube thumbnails — one house style

Custom thumbnails (bright, big readable hook, single style) instead of raw dark
video frames. Keep every future video on this template so the channel reads as
one brand.

## Style (the constant — don't change per video)
- 1280×720, exported JPG (~260 KB, well under YouTube's 2 MB).
- Left navy scrim (`#042B4A`) over the photo → hook text always legible.
- Hook: 2 lines, DM Sans Black ~104px. Line 1 white, line 2 mint (`#63F2CA`).
- Mint accent bar + eyebrow (`Control XL · LCXL MK3`) + `Fadercraft` chip mark.
- Photo auto-brightened in-render: `brightness 1.30 / contrast 1.05 / saturate 1.20`
  (makes the LCXL RGB pads pop). No need to pre-edit the source photo.

## Make a new one
```
./make-thumb.sh <photo.jpg> "Line one." "Line two." "EYEBROW" "sub line" out.jpg
```
Example (v1):
```
./make-thumb.sh "../../Control XL/raw/IMG_8046.jpg" \
  "14 channels" "One surface" "Control XL · LCXL MK3" \
  "One Max for Live device. Your whole mixer under your hands" \
  control-xl-14ch-one-surface-v1.jpg
```
Only the photo + the two hook lines change between videos. Everything else stays.
The hook auto-fits: each line always stays on one line (font shrinks if needed).

## Deps
- DM Sans (Black + Bold) in `~/Library/Fonts` — installed.
- Playwright's cached `chrome-headless-shell` (path hard-coded in the script).

## Files
- `control-xl-14ch-one-surface-v1.jpg` — upload-ready (current video `UsJxPBdf568`).
- `make-thumb.sh` — generator.

## Copy note
- No "mouse" in the hook — the videos never mention a mouse; the story is the
  controller / control surface. Keep hooks controller-centric.
- No period at the end of a heading/hook line or at the end of the sub paragraph
  (house rule). Mid-paragraph periods stay.
