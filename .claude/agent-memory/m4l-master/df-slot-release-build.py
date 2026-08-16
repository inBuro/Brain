#!/usr/bin/env python3
"""
Dynamic Focus Slot — release build script.

USAGE:
    python3 df-slot-release-build.py [VERSION]

    VERSION: version string (default "1.2")
    Example: python3 df-slot-release-build.py 1.3

WHAT IT DOES:
1. Takes the most recent frozen base AMXD (dist/archive/Dynamic Focus Slot v1.2-clean.amxd
   or whichever is passed as BASE_AMXD at the top of this script).
2. Strips dev-only diagnostic post() calls from the current midi_learn_slot.js.
3. Updates DEVICE_VERSION in df_version_check.js to VERSION.
4. Replaces the three embedded files (JS, MapButtonTint.maxpat, df_version_check.js)
   in the frozen AMXD using Path B (dlst patching).
5. Validates the result (ptch invariant, JSON parse, embedded file counts).
6. Writes the release AMXD to dist/archive/Dynamic Focus Slot vVERSION.amxd.
7. Builds the zip bundle at dist/Fadercraft Dynamic Focus vVERSION.zip.

PREREQUISITES:
- AMXD base, JS, MapButtonTint, df_version_check all at the paths below.
- DF Input AMXD at User Library/Max Devices/Dynamic Focus Input.amxd.
- Quickstart.pdf at dist/Quickstart.pdf.
- All dependencies frozen inside base AMXD (midi_learn_slot.js, MapButtonTint, etc.)

DIAGNOSTIC POSTS REMOVED (patterns to grep for when updating this list):
    - "S7-DEV-"                 → version marker, replaced with "S7-PROD-vVERSION"
    - "checkParentMove: host moved"
    - "drag repaint sync:"
    - "drag repaint 300ms:"
    - "[COLOR-OBS] onTrackColor FIRED"
    - "[COLOR-RAW] STALE hostTrack!"   (keep the guard logic, remove the post)
    - "[COLOR-RAW] trkId="
    - "[UMV-DRAG]"
    - "[DF v61] mm-resync"
    - "TGT-DBG:"                → all TGT-DBG posts (bindToId, resetAllMappings, doRebind, unmap, X-click)
    - "ADV-DBG:"                → all ADV-DBG posts (_scheduleAdvRestore)

POSTS KEPT (cold functional logs from v1.2-clean):
    - "S7-PROD-vVERSION LOADED"
    - "_buildLabelPids ERROR"
    - "WARNING: only N/6"
    - "Cmd+D: byname resolved"
    - "stale TgtId:"
    - "_findPanelBnParams ERR"
    - "panel bn capture:"
    - "_captureSlotBn ERR"
    - "panel slot N: byname resolved"
    - "byname capture:"
    - "_captureByNameFromId ERR"
"""

import json
import struct
import hashlib
import os
import sys
import shutil

# ── Config ───────────────────────────────────────────────────────────────────

VERSION = sys.argv[1] if len(sys.argv) > 1 else "1.2"

DF_BASE       = "/Users/Kirill/Brain/fadercraft/Dynamic Focus"
UL_MAX        = "/Users/Kirill/Music/Ableton/User Library/Max Devices"

BASE_AMXD     = f"{DF_BASE}/dist/archive/Dynamic Focus Slot v1.2-clean.amxd"
JS_SRC        = f"{UL_MAX}/midi_learn_slot.js"
MBT_SRC       = f"{UL_MAX}/MapButtonTint.maxpat"
VCH_SRC       = f"{UL_MAX}/df_version_check.js"
DF_INPUT_SRC  = f"{UL_MAX}/Dynamic Focus Input.amxd"
QUICKSTART    = f"{DF_BASE}/dist/Quickstart.pdf"

OUT_AMXD      = f"{DF_BASE}/dist/archive/Dynamic Focus Slot v{VERSION}.amxd"
OUT_ZIP       = f"{DF_BASE}/dist/Fadercraft Dynamic Focus v{VERSION}.zip"

# ── Diagnostic post() lines to REMOVE from JS (0-indexed line numbers) ───────
# Run: grep -n 'post(' midi_learn_slot.js | grep -v '//' to verify line numbers
# after each DEV session. Then update this list.
#
# Format: integer = remove that 0-indexed line
#         dict entry = replace line with the given string
#
# Current list is for JS v66-COLOR-RAW (2026-08-11 state). Update for future versions.
LINES_TO_REMOVE = {
    987,   # post("[DF Slot] checkParentMove: host moved
    999,   # var _htId = ... (diagnostic variable only)
    1000,  # var _diagTc = ... (diagnostic variable only)
    1001,  # post("[DF Slot] drag repaint sync:
    1004,  # var _dHtId = ... (diagnostic variable only)
    1005,  # var _dTc = ... (diagnostic variable only)
    1006,  # post("[DF Slot] drag repaint 300ms:
    1025,  # post("[DF Slot] [COLOR-OBS] onTrackColor FIRED
    1121,  # post("[DF Slot] [COLOR-RAW] STALE hostTrack!   ← keep guard, remove post
    1127,  # post("[DF Slot] [COLOR-RAW] trkId=
    1251,  # post("[DF Slot] [UMV-DRAG]
    1527,  # post("[DF v61] mm-resync @1s: page1=... (line 1 of 2)
    1528,  # "  page2=...                               (line 2 of 2)
    1538,  # post("[DF v61] mm-resync: corrected
    1656,  # post("TGT-DBG: _doRebind STALE
    1673,  # post("TGT-DBG: _doRebind stale id=
    1677,  # post("TGT-DBG: _doRebind byname ok
    1697,  # post("TGT-DBG: _doRebind byname fail
    2361,  # post("TGT-DBG: _bindToId
    2511,  # post("TGT-DBG: _resetAllMappings tgtIdParam.set
    2521,  # post("TGT-DBG: _resetAllMappings outlet(12)
    2646,  # post("ADV-DBG: _scheduleAdvRestore skip:
    2658,  # post("ADV-DBG: _scheduleAdvRestore attempt=
    2664,  # post("ADV-DBG: _scheduleAdvRestore triggering
    2675,  # post("ADV-DBG: _scheduleAdvRestore rebind already
    2685,  # post("ADV-DBG: _scheduleAdvRestore exhausted.
    2741,  # post("TGT-DBG: unmap() called
    2807,  # post("TGT-DBG: unmap tgtIdParam.set
    2816,  # post("TGT-DBG: unmap lnb_tgt.set
    2819,  # post("TGT-DBG: unmap lnb_tgt NOT FOUND
    3093,  # post("TGT-DBG: inlet11[X-click]
    3103,  # post("TGT-DBG: X-button[inlet11]
}

LINES_TO_REPLACE = {
    # ADV-DBG catch block — remove post from inside catch
    2656: "            } catch(e) { }\n",
}

VERSION_LINE_IDX = 379  # 0-indexed; line with "S7-DEV-..." version marker

# ─────────────────────────────────────────────────────────────────────────────

def md5f(path):
    return hashlib.md5(open(path, 'rb').read()).hexdigest()

print(f"=== Dynamic Focus Slot v{VERSION} Release Build ===")
print(f"Base AMXD: {BASE_AMXD}")
print(f"Output AMXD: {OUT_AMXD}")
print(f"Output ZIP: {OUT_ZIP}")
print()

# ── Step 1: clean JS ─────────────────────────────────────────────────────────
print("Step 1: cleaning midi_learn_slot.js")
with open(JS_SRC, 'r', encoding='utf-8') as f:
    js_lines = f.readlines()
print(f"  Input: {len(js_lines)} lines")

clean_lines = []
for i, line in enumerate(js_lines):
    if i == VERSION_LINE_IDX:
        clean_lines.append(f'post(">>> S7-PROD-v{VERSION} LOADED <<<\\n");\n')
        print(f"  Changed version marker at L{i+1}")
    elif i in LINES_TO_REMOVE:
        print(f"  Removed L{i+1}: {line.rstrip()[:70]}")
        continue
    elif i in LINES_TO_REPLACE:
        clean_lines.append(LINES_TO_REPLACE[i])
        print(f"  Replaced L{i+1}")
    else:
        clean_lines.append(line)

clean_js_bytes = ''.join(clean_lines).encode('utf-8')
post_count = sum(1 for l in clean_lines if 'post(' in l and not l.strip().startswith('//'))
print(f"  Output: {len(clean_lines)} lines, {len(clean_js_bytes)} bytes, {post_count} post() calls")
assert post_count <= 15, f"Too many post() calls in cleaned JS: {post_count}"

# ── Step 2: updated df_version_check.js ─────────────────────────────────────
print("\nStep 2: updating df_version_check.js")
vc_str = open(VCH_SRC, 'rb').read().decode('utf-8')
# Replace DEVICE_VERSION (handles '1.1', '1.2', etc.)
import re
vc_str_new = re.sub(r"const DEVICE_VERSION = '[^']*';",
                    f"const DEVICE_VERSION = '{VERSION}';", vc_str)
vc_bytes_new = vc_str_new.encode('utf-8')
dv_match = re.search(r"const DEVICE_VERSION = '[^']*';", vc_str_new)
print(f"  {dv_match.group() if dv_match else 'NOT FOUND'}")

# ── Step 3: MapButtonTint v47 ─────────────────────────────────────────────
print("\nStep 3: reading MapButtonTint.maxpat")
mbt_bytes = open(MBT_SRC, 'rb').read()
mbt_obj = json.loads(mbt_bytes.decode('utf-8'))
n_boxes = len(mbt_obj['patcher']['boxes'])
n_lines = len(mbt_obj['patcher']['lines'])
print(f"  {n_boxes} boxes / {n_lines} lines, {len(mbt_bytes)} bytes")

# ── Step 4: load base AMXD + parse dlst ─────────────────────────────────────
print("\nStep 4: loading base AMXD")
data = bytearray(open(BASE_AMXD, 'rb').read())
orig_size = len(data)
assert data[0x20:0x24] == b'mx@c', "Base AMXD must be frozen (mx@c)"
ptch_orig = struct.unpack_from('<I', data, 0x1c)[0]
assert ptch_orig == orig_size - 0x20
json_end = data.index(b'\x00', 0x30)
dlst_pos = data.find(b'dlst', 0x30)
print(f"  Size: {orig_size}, JSON: {json_end-0x30} bytes, dlst: 0x{dlst_pos:x}")

class DireEntry:
    def __init__(self, name, sz32, of32, sz32_pos, of32_pos):
        self.name=name; self.sz32=sz32; self.of32=of32
        self.sz32_pos=sz32_pos; self.of32_pos=of32_pos
    def abs_start(self): return 0x20 + self.of32
    def abs_end(self): return self.abs_start() + self.sz32

entries = []
pos = dlst_pos
while pos < len(data) - 4:
    tag = data[pos:pos+4]
    if tag == b'dire':
        dlen = struct.unpack_from('>I', data, pos+4)[0]
        ds = pos+8; d = data[ds:ds+dlen-8]
        fnam_r = bytes(d).find(b'fnam')
        flen = struct.unpack_from('>I', d, fnam_r+4)[0]
        fname = bytes(d[fnam_r+8:fnam_r+flen]).decode('utf-8','replace').rstrip('\x00')
        sz_r = bytes(d).find(b'sz32')
        of_r = bytes(d).find(b'of32')
        entries.append(DireEntry(
            fname,
            struct.unpack_from('>I', d, sz_r+8)[0],
            struct.unpack_from('>I', d, of_r+8)[0],
            ds+sz_r+8, ds+of_r+8))
        pos += dlen
    elif tag == b'dlst':
        dlen = struct.unpack_from('>I', data, pos+4)[0]; pos += 8
    else: break
print(f"  Parsed {len(entries)} dlst entries")

# ── Step 5: build new payload ─────────────────────────────────────────────
print("\nStep 5: building new payload")
REPLACEMENTS = {
    'df_version_check.js':  vc_bytes_new,
    'MapButtonTint.maxpat': mbt_bytes,
    'midi_learn_slot.js':   clean_js_bytes,
}
sorted_entries = sorted(entries, key=lambda e: e.of32)
new_sizes   = {e.name: (len(REPLACEMENTS[e.name]) if e.name in REPLACEMENTS else e.sz32)
               for e in sorted_entries}
new_offsets = {}
cur_of32 = 16
for e in sorted_entries:
    new_offsets[e.name] = cur_of32
    cur_of32 += new_sizes[e.name]

# ── Step 6: rebuild binary ─────────────────────────────────────────────────
print("\nStep 6: rebuilding binary")
new_data = bytearray(data[:0x30])
for e in sorted_entries:
    if e.name in REPLACEMENTS:
        new_data.extend(REPLACEMENTS[e.name])
    else:
        new_data.extend(bytes(data[e.abs_start():e.abs_end()]))
dlst_end = len(data)
new_dlst_start = len(new_data)
new_data.extend(bytes(data[dlst_pos:dlst_end]))

# Patch dlst
pos = new_dlst_start
while pos < len(new_data) - 4:
    tag = bytes(new_data[pos:pos+4])
    if tag == b'dire':
        dlen = struct.unpack_from('>I', new_data, pos+4)[0]
        ds = pos+8; d = bytes(new_data[ds:ds+dlen-8])
        fnam_r = d.find(b'fnam'); flen = struct.unpack_from('>I', d, fnam_r+4)[0]
        fname = d[fnam_r+8:fnam_r+flen].decode('utf-8','replace').rstrip('\x00')
        sz_r = d.find(b'sz32'); of_r = d.find(b'of32')
        struct.pack_into('>I', new_data, ds+sz_r+8, new_sizes[fname])
        struct.pack_into('>I', new_data, ds+of_r+8, new_offsets[fname])
        pos += dlen
    elif tag == b'dlst':
        dlen = struct.unpack_from('>I', new_data, pos+4)[0]; pos += 8
    else: break

new_size = len(new_data)
struct.pack_into('<I', new_data, 0x1c, new_size - 0x20)
struct.pack_into('>I', new_data, 0x2c, new_dlst_start - 0x20)
print(f"  New size: {new_size} (was {orig_size}, Δ={new_size-orig_size:+d})")

# ── Step 7: validate ─────────────────────────────────────────────────────────
print("\nStep 7: validating")
assert struct.unpack_from('<I', new_data, 0x1c)[0] == len(new_data) - 0x20, "ptch invariant"
assert bytes(new_data[0x20:0x24]) == b'mx@c'
json_end_new = new_data.index(b'\x00', 0x30)
patcher_obj = json.loads(bytes(new_data[0x30:json_end_new]).decode('utf-8'))
print(f"  ptch invariant: OK")
print(f"  Patcher JSON: {len(patcher_obj['patcher']['boxes'])} boxes / {len(patcher_obj['patcher']['lines'])} lines")
# Verify embedded JS marker and post count
js_of = new_offsets['midi_learn_slot.js']; js_sz = new_sizes['midi_learn_slot.js']
emb_js = bytes(new_data[0x20+js_of:0x20+js_of+js_sz]).decode('utf-8')
emb_posts = sum(1 for l in emb_js.split('\n') if 'post(' in l and not l.strip().startswith('//'))
emb_marker = [l for l in emb_js.split('\n') if 'LOADED' in l]
print(f"  Embedded JS: {emb_posts} post() calls, marker={emb_marker}")
# Verify DEVICE_VERSION
vc_of = new_offsets['df_version_check.js']; vc_sz = new_sizes['df_version_check.js']
emb_vc = bytes(new_data[0x20+vc_of:0x20+vc_of+vc_sz]).decode('utf-8')
dv_line = [l for l in emb_vc.split('\n') if 'DEVICE_VERSION' in l and 'const' in l]
print(f"  Embedded DEVICE_VERSION: {dv_line}")
assert f"'{VERSION}'" in dv_line[0]
# Verify MapButtonTint
mbt_of = new_offsets['MapButtonTint.maxpat']; mbt_sz = new_sizes['MapButtonTint.maxpat']
emb_mbt = json.loads(bytes(new_data[0x20+mbt_of:0x20+mbt_of+mbt_sz]).decode('utf-8'))
print(f"  Embedded MapButtonTint: {len(emb_mbt['patcher']['boxes'])} boxes / {len(emb_mbt['patcher']['lines'])} lines")
print("  All checks passed.")

# ── Step 8: write AMXD ───────────────────────────────────────────────────────
print(f"\nStep 8: writing AMXD")
with open(OUT_AMXD, 'wb') as f:
    f.write(bytes(new_data))
print(f"  {OUT_AMXD}")
print(f"  MD5: {hashlib.md5(bytes(new_data)).hexdigest()}")
print(f"  Size: {len(new_data)} bytes")

# ── Step 9: build zip bundle ─────────────────────────────────────────────────
print(f"\nStep 9: building zip bundle")
import tempfile, zipfile
with zipfile.ZipFile(OUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write(OUT_AMXD,        f"Dynamic Focus/Dynamic Focus Slot.amxd")
    zf.write(DF_INPUT_SRC,    f"Dynamic Focus/Dynamic Focus Input.amxd")
    zf.write(QUICKSTART,      f"Dynamic Focus/Quickstart.pdf")

print(f"  {OUT_ZIP}")
print(f"  MD5: {md5f(OUT_ZIP)}")
zip_size = os.path.getsize(OUT_ZIP)
print(f"  Size: {zip_size} bytes")

print(f"\n=== Done: Dynamic Focus Slot v{VERSION} ===")
