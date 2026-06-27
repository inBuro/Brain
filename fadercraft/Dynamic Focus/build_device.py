#!/usr/bin/env python3
"""
build_device.py — generate the Dynamic Focus Max for Live device.

Outputs (next to this script, in the "Dynamic Focus" folder):
  - Dynamic Focus.maxpat   the editable patcher (open directly in Max)
  - Dynamic Focus.amxd     wrapped device for drag-and-drop into Ableton Live

The .amxd container is:
    ampf  | LE u32 size=4  | "mmmm"
    meta  | LE u32 size=4  | LE u32 = 7
    ptch  | LE u32 size=N  | <ptch content>
  ptch content:
    "mx@c" | BE u32 size=16 | BE u32 = 0 | BE u32 = json_len
    <json bytes>
    \\x00
    <trailing window/version/checksum chunks reused from a real device>

The trailing block (sz32/of32/vers/flag/mdat) is window geometry plus a
checksum that Max normally writes on save. We reuse a real device's block so
the structure is intact. If Ableton ever rejects the binary, just open
"Dynamic Focus.maxpat" in Max and Save As "Dynamic Focus.amxd" — Max rewrites
the metadata itself. The .maxpat + dynamic_focus.js are the source of truth.
"""

import json
import os
import struct

HERE = os.path.dirname(os.path.abspath(__file__))
JS_FILENAME = "dynamic_focus.js"

# --- box helpers -------------------------------------------------------------

def newobj(bid, text, rect, nin, nout, outlettype=None, extra=None):
    box = {
        "id": bid,
        "maxclass": "newobj",
        "numinlets": nin,
        "numoutlets": nout,
        "patching_rect": rect,
        "text": text,
    }
    if outlettype is not None:
        box["outlettype"] = outlettype
    if extra:
        box.update(extra)
    return {"box": box}


def simple(bid, maxclass, rect, nin, nout, outlettype=None, extra=None):
    box = {
        "id": bid,
        "maxclass": maxclass,
        "numinlets": nin,
        "numoutlets": nout,
        "patching_rect": rect,
    }
    if outlettype is not None:
        box["outlettype"] = outlettype
    if extra:
        box.update(extra)
    return {"box": box}


def comment(bid, text, rect, width=None):
    box = {
        "id": bid,
        "maxclass": "comment",
        "numinlets": 1,
        "numoutlets": 0,
        "patching_rect": rect,
        "text": text,
    }
    return {"box": box}


def line(src, sout, dst, din):
    return {"patchline": {"source": [src, sout], "destination": [dst, din]}}


# --- patcher -----------------------------------------------------------------

def build_patcher():
    boxes = [
        comment("obj_title", "Dynamic Focus — Track-Focus PoC",
                [16.0, 12.0, 240.0, 20.0]),
        comment("obj_sub",
                "Active only while THIS track is selected. No central manager.",
                [16.0, 32.0, 360.0, 20.0]),

        # --- enable toggle (auto-on via loadbang) ---
        simple("obj_enable", "toggle", [16.0, 64.0, 24.0, 24.0], 1, 1, ["int"]),
        comment("obj_enable_lbl", "Enable", [48.0, 68.0, 60.0, 18.0]),

        newobj("obj_loadbang", "loadbang", [120.0, 64.0, 64.0, 22.0], 1, 1,
               ["bang"]),
        {"box": {"id": "obj_one", "maxclass": "message", "numinlets": 2,
                 "numoutlets": 1, "outlettype": [""],
                 "patching_rect": [120.0, 96.0, 32.0, 22.0], "text": "1"}},

        # --- the brain ---
        {"box": {"id": "obj_js", "maxclass": "newobj", "numinlets": 1,
                 "numoutlets": 1, "outlettype": [""],
                 "patching_rect": [16.0, 132.0, 150.0, 22.0],
                 "saved_object_attributes": {"filename": JS_FILENAME,
                                             "parameter_enable": 0},
                 "text": "js " + JS_FILENAME}},

        # --- active LED indicator ---
        simple("obj_led", "toggle", [16.0, 180.0, 32.0, 32.0], 1, 1, ["int"]),
        comment("obj_led_lbl", "ACTIVE (host track is selected)",
                [56.0, 188.0, 220.0, 18.0]),

        # --- MIDI passthrough, gated by active state ---
        newobj("obj_midiin", "midiin", [16.0, 240.0, 48.0, 22.0], 1, 1,
               ["int"]),
        newobj("obj_gate", "gate", [16.0, 280.0, 60.0, 22.0], 2, 1, [""]),
        newobj("obj_midiout", "midiout", [16.0, 320.0, 56.0, 22.0], 1, 0),
        comment("obj_gate_lbl", "MIDI passes only while ACTIVE",
                [88.0, 284.0, 220.0, 18.0]),
    ]

    lines = [
        line("obj_loadbang", 0, "obj_one", 0),
        line("obj_one", 0, "obj_js", 0),       # auto-enable + init on load
        line("obj_enable", 0, "obj_js", 0),    # manual enable/disable
        line("obj_js", 0, "obj_gate", 0),      # active -> gate control inlet
        line("obj_js", 0, "obj_led", 0),       # active -> LED
        line("obj_midiin", 0, "obj_gate", 1),  # midi -> gate data inlet
        line("obj_gate", 0, "obj_midiout", 0), # gated midi out
    ]

    patcher = {
        "patcher": {
            "fileversion": 1,
            "appversion": {"major": 9, "minor": 1, "revision": 4,
                           "architecture": "x64", "modernui": 1},
            "classnamespace": "box",
            "rect": [80.0, 105.0, 420.0, 380.0],
            "openrect": [0.0, 0.0, 320.0, 240.0],
            "openinpresentation": 0,
            "default_fontsize": 12.0,
            "default_fontname": "Arial",
            "gridonopen": 1,
            "gridsize": [8.0, 8.0],
            "boxes": boxes,
            "lines": lines,
            "parameters": {},
            "dependency_cache": [
                {"name": JS_FILENAME, "bootpath": "~", "type": "TEXT",
                 "implicit": 1}
            ],
            "autosave": 0,
            "is_mpe": 0,
            "minimum_live_version": "11.0",
            "minimum_max_version": "8.5.0",
            "platform_compatibility": 3,
        }
    }
    return patcher


# --- .amxd container ----------------------------------------------------------

def le_chunk(cid, payload):
    return cid + struct.pack("<I", len(payload)) + payload


def build_amxd(json_bytes, trailing):
    # mx@c: small chunk carrying [0, json_len] as big-endian u32s; size counts
    # the 8-byte chunk header + 8 bytes of data = 16.
    mxc = b"mx@c" + struct.pack(">I", 16) + struct.pack(">I", 0) \
        + struct.pack(">I", len(json_bytes))
    ptch_content = mxc + json_bytes + b"\x00" + trailing
    out = le_chunk(b"ampf", b"mmmm")
    out += le_chunk(b"meta", struct.pack("<I", 7))
    out += b"ptch" + struct.pack("<I", len(ptch_content)) + ptch_content
    return out


def get_trailing_template():
    """Reuse the sz32/of32/vers/flag/mdat block from a shipped device so the
    container's window/version/checksum chunks are structurally present."""
    candidates = [
        os.path.join(HERE, "..", "raw", "Demo-set Project", "Max Devices",
                     "XL_Performance.amxd"),
        os.path.join(HERE, "..", "dist", "Control XL Starter Project",
                     "Max Devices", "Control XL.amxd"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            data = open(path, "rb").read()
            idx = data.rfind(b"sz32")
            if idx != -1:
                return data[idx:]
    # Fallback: minimal zeroed chunks.
    out = b""
    for cid in (b"sz32", b"of32", b"vers", b"flag", b"mdat"):
        out += cid + struct.pack(">I", 12) + struct.pack(">I", 0)
    return out


def main():
    patcher = build_patcher()
    json_text = json.dumps(patcher, indent=1, ensure_ascii=True)
    json_bytes = json_text.encode("utf-8")

    maxpat_path = os.path.join(HERE, "Dynamic Focus.maxpat")
    with open(maxpat_path, "wb") as fh:
        fh.write(json_bytes)
    print("wrote", maxpat_path, len(json_bytes), "bytes")

    trailing = get_trailing_template()
    amxd = build_amxd(json_bytes, trailing)
    amxd_path = os.path.join(HERE, "Dynamic Focus.amxd")
    with open(amxd_path, "wb") as fh:
        fh.write(amxd)
    print("wrote", amxd_path, len(amxd), "bytes")


if __name__ == "__main__":
    main()
