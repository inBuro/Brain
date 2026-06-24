---
name: encoder-relative-research
description: Research into LCXL3 encoder relative mode in Custom Mode — hardware hypothesis, test artifacts, validation protocol
metadata:
  type: project
---

# LCXL3 Encoder Relative Mode — Research State

**Status: unconfirmed hypothesis, hardware test required**

**Why:** Custom Mode encoders are absolute (0-127), causing dead zones at 0/127 edges. Proposal: undocumented firmware command (CC69/72/73 ch7 val=127) may toggle per-row relative mode even in Custom Mode.

**How to apply:** Do not build production logic until hardware validates Outcome A below.

---

## Documented fact (from wiki + memory)

Relative-mode encoders on LCXL3 exist **only in DAW mode**, not Custom Mode.
- Confirmed by Novation tech support (KVR forum) and official programmer's DAW mode docs.
- Custom mode SysEx descriptor has no absolute/relative flag — byte-diff found none.
- Registered Novation feature-request, not yet implemented (as of 2026-06).

## Hypothesis

Firmware may respond to per-row relative toggle commands even in Custom Mode via:
- **Row 1:** CC69, ch7, value=127
- **Row 2:** CC72, ch7, value=127
- **Row 3:** CC73, ch7, value=127

Source: user's own discovery — NOT confirmed in Novation docs, NOT confirmed by monitoring.
These CC numbers correspond to Novation's DAW-mode per-row relative toggle mechanism (CC30/ch7 family).

**Origin of specific CC numbers (69/72/73):**
These were provided by the user as a hypothesis. The official DAW-mode docs mention CC30/ch7
for mode-select but do not publish per-row relative toggle CC numbers openly
(programmer's reference pages return 403/404 on machine reads).

---

## Artifacts built (2026-06-23)

### EncoderRelativeMonitor.amxd
- **Path:** `~/Brain/Fadercraft/raw/EncoderRelativeMonitor.amxd`
- **md5:** `1094455eeb9d8a28d20d30ad1fa3fc1d`
- **Size:** 9227 B, 20 boxes / 11 lines, unfrozen MIDI Effect (mmmm)
- **Function:** validation tool for hardware test (Step 0)
  - Three buttons: Row1/Row2/Row3 → send CC69/72/73 ch7 val=127 to DAW Out port
  - ctlin 0 7 → `print MON_VAL` + `print MON_CC` in Max Console (monitor all ch7 CC)
  - Editable port message box (default "port LCXL3 1 (DAW Out)")
- **Use:** Drop on MIDI track → open Max editor → click Row N button → twist encoder → check Console

### EncoderRelativeTest.amxd
- **Path:** `~/Brain/Fadercraft/raw/EncoderRelativeTest.amxd`
- **md5:** `1db34bd6dfa3e85b55697fd6a39b57a5`
- **Size:** 11961 B, 25 boxes / 21 lines, unfrozen MIDI Effect (mmmm)
- **Function:** prototype decoder for Outcome A (relative mode confirmed)
  - On load (`live.thisdevice` → 100ms delay): sends CC69/72/73 ch7 127 to init toggle
  - Encoder CC# selector (live.numbox, default 21)
  - ctlin 0 7 → filter by CC# (== + gate) → skip val=0/64 → delta = val - 64 (pivot-64 scheme)
  - Accumulator: current + delta → clip 0..127 → live.numbox display + live.dial display
  - `print DELTA` in Max Console
- **Use ONLY after Outcome A confirmed** in monitor test

---

## Validation protocol (Step 0)

1. Load EncoderRelativeMonitor.amxd on a MIDI track in Live
2. Set MIDI input to LCXL3 Custom Port (where encoders send), MIDI output to DAW Out
3. Click "Row 1 Toggle (CC69 ch7 val=127)"
4. Slowly twist an encoder in Row 1
5. Read Max Console:
   - **Outcome A (success):** MON_VAL shows values near 64 (e.g. 64, 65, 63, 66, 62...) or near 0 (1, 2, 127, 126...) → relative mode activated → proceed to EncoderRelativeTest
   - **Outcome B (firmware hypothesis wrong):** MON_VAL shows absolute 0-127, edges hit → relative not available in Custom Mode firmware toggle path

6. At edge: does encoder still send 0/127 continuously while held, or goes silent? (Determines if software recenter is even possible)

---

## Decode scheme (for Outcome A)

Two possible protocols:
- **Pivot-64 (DAW mode standard):** center=64, CW > 64, CCW < 64. delta = val - 64. Range: -63..+63.
- **Two's complement (pivot-0):** 1..63 = positive, 65..127 = negative (val - 128). Center implied = 0 or 128.

Current prototype implements **pivot-64** (matches documented DAW mode per `lcxl3-daw-protocol.md`).
If hardware produces two's complement, swap decoder in EncoderRelativeTest.

---

## Path 2 (fallback if Outcome B)

Recenter via SysEx is **not possible in Custom Mode** — SysEx works only in DAW mode on LCXL3.
If Outcome B, the only paths are:
1. Wait for Novation to implement relative mode in Custom Mode firmware
2. Switch to DAW mode integration (completely different architecture)
3. Accept absolute encoder limitation and add visual feedback of value position

---

## Container format notes (for future rebuild)

Both files: unfrozen `mmmm` (MIDI Effect), no `mx@c`, no `dlst`.
Header layout: `ampf[4] mmmm meta[4][00000000] ptch[ptch_size_LE] {JSON}\x00`
JSON starts at 0x20, file ends with single `\x00`.
`ptch = fs - 0x20`. `meta` data = `\x00\x00\x00\x00` for MIDI Effect (vs `\x01\x00\x00\x00` for Audio).
classnamespace = "dsp.midi".
