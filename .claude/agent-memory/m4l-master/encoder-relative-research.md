---
name: encoder-relative-research
description: Research into LCXL3 encoder relative mode in Custom Mode — hardware hypothesis, test artifacts, validation protocol
metadata:
  type: project
---

# LCXL3 Encoder Relative Mode — Research State

**Status: commands CONFIRMED as real (decompiled Live 12 remote script, 2026-07-13) — but their effect in Custom Mode still needs the hardware test**

**Why:** Custom Mode encoders are absolute (0-127), causing dead zones at 0/127 edges. CC69/72/73 ch7 val=127 are the per-row relative toggles Ableton's own script sends in DAW mode; whether firmware honors them while in Custom Mode is the open question.

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

**Origin of specific CC numbers (69/72/73) — CONFIRMED 2026-07-13:**
Extracted from decompiled Live 12 remote script `Launch_Control_XL_3/midi.py`
(github.com/gluon/AbletonLive12_MIDIRemoteScripts):

```python
SYSEX_HEADER = (0xF0, 0, 32, 41, 2, 21)                # F0 00 20 29 02 15
SET_RELATIVE_ENCODER_MODES = ((182, 69, 127), (182, 72, 127), (182, 73, 127))
# 182 = 0xB6 = CC status, MIDI channel 7 (1-based) → exactly CC69/72/73 ch7 val=127
def make_connection_message(connect=True):             # DAW-mode handshake
    return SYSEX_HEADER + (2, 127 if connect else 0, 0xF7)   # F0 00 20 29 02 15 02 7F F7
def make_enable_touch_output_message():
    return (182, 71, 127)                              # CC71 ch7 = enable encoder TOUCH output
```

So the CCs are the genuine official toggles, not a guess. Caveat: the script sends them
AFTER the connection SysEx (device already in DAW mode), to the DAW In port. Unknown:
does firmware apply them (a) when received in Custom Mode, (b) globally vs DAW-engine-only.
Bonus fact: encoders are touch-sensitive; CC71 ch7 127 enables touch messages (DAW mode).

---

## Artifacts built (2026-06-23)

### EncoderRelativeMonitor.amxd
- **Path:** `~/Brain/fadercraft/Control XL/raw/EncoderRelativeMonitor.amxd`
- **md5:** `1094455eeb9d8a28d20d30ad1fa3fc1d`
- **Size:** 9227 B, 20 boxes / 11 lines, unfrozen MIDI Effect (mmmm)
- **Function:** validation tool for hardware test (Step 0)
  - Three buttons: Row1/Row2/Row3 → send CC69/72/73 ch7 val=127 to DAW Out port
  - ctlin 0 7 → `print MON_VAL` + `print MON_CC` in Max Console (monitor all ch7 CC)
  - Editable port message box (default "port LCXL3 1 (DAW Out)")
- **Use:** Drop on MIDI track → open Max editor → click Row N button → twist encoder → check Console

### EncoderRelativeTest.amxd
- **Path:** `~/Brain/fadercraft/Control XL/raw/EncoderRelativeTest.amxd`
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

## Path C (untested, added 2026-07-13): software relative emulation via CC feedback recenter

SysEx recenter is impossible in Custom Mode, but **plain CC feedback might not be**: if firmware
accepts an incoming CC on the Custom port and updates the encoder's internal position (as needed
for LED-ring/screen sync), then endless is achievable purely in software:

1. M4L reads absolute CC, computes delta vs last value, applies delta to own accumulator
2. When encoder idle ~150ms, send CC val=64 back to the Custom port → internal position recenters
3. Encoder never reaches 0/127 → no dead zones. Ring stays near center (fine — position is meaningless for endless)

**5-min hardware test:** send CC (e.g. val=64) to the Custom port for a mapped encoder CC#,
then twist that encoder. If output continues FROM 64 → Path C works. If output continues from
old position → firmware ignores feedback for position, Path C dead. Filter echo to avoid loops.
This is the classic BCF2000/X-Touch endless-emulation trick.

## Path 2 (fallback if Outcome B and Path C fail)

If Outcome B, the remaining paths are:
1. Wait for Novation to implement relative mode in Custom Mode firmware
   (firmware v1.1, Jan 2026: added encoder acceleration curves, HUI, fader pickup — relative
   in Custom Mode still NOT implemented)
2. Switch to DAW mode integration (different architecture, but ALL bytes now known:
   don't add LCXL3 as Control Surface in Live prefs → DAW port stays free → M4L midiin/midiout
   bind to DAW port → send connect SysEx `F0 00 20 29 02 15 02 7F F7` → send the three
   SET_RELATIVE_ENCODER_MODES CCs → consume pivot-64 deltas)
3. HUI mode (new in firmware v1.1): HUI V-pots are inherently relative; M4L could decode the
   HUI port directly. Wilder architecture, unexplored.
4. Accept absolute encoder limitation and add visual feedback of value position

---

## Container format notes (for future rebuild)

Both files: unfrozen `mmmm` (MIDI Effect), no `mx@c`, no `dlst`.
Header layout: `ampf[4] mmmm meta[4][00000000] ptch[ptch_size_LE] {JSON}\x00`
JSON starts at 0x20, file ends with single `\x00`.
`ptch = fs - 0x20`. `meta` data = `\x00\x00\x00\x00` for MIDI Effect (vs `\x01\x00\x00\x00` for Audio).
classnamespace = "dsp.midi".
