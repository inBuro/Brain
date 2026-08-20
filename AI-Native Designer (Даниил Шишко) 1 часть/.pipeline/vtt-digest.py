#!/usr/bin/env python3
"""Collapse a .vtt transcript into compact "[M:SS] text" blocks for reading/quoting.

Usage: .pipeline/vtt-digest.py transcripts/<slug>.vtt [block_seconds]
"""
import re, sys, pathlib

def collapse(path, block=30):
    out, cur, buf = [], None, []
    for line in pathlib.Path(path).read_text().splitlines():
        m = re.match(r'(\d\d):(\d\d):(\d\d)\.\d+ --> ', line)
        if m:
            t = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3))
            if cur is None or t - cur >= block:
                if buf:
                    out.append(f"[{cur // 60}:{cur % 60:02d}] " + " ".join(buf))
                cur, buf = t, []
        elif line.strip() and line != "WEBVTT":
            buf.append(line.strip())
    if buf:
        out.append(f"[{cur // 60}:{cur % 60:02d}] " + " ".join(buf))
    return "\n".join(out)

if __name__ == "__main__":
    print(collapse(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 30))
