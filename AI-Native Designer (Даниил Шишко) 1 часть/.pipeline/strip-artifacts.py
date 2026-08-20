#!/usr/bin/env python3
"""Remove whisper hallucinations that appear over trailing silence.

Whisper fills the silent tail of a video with stock subtitle phrases
("Продолжение следует...", "Редактор субтитров ..."). They are not in the audio,
so they must not end up in the knowledge base.

Usage: .pipeline/strip-artifacts.py transcripts/*.vtt
"""
import pathlib, re, sys

ARTIFACTS = (
    "Продолжение следует",
    "Редактор субтитров",
    "Субтитры сделал",
    "Субтитры создавал",
    "Корректор ",
    "ПОДПИШИСЬ",
)

def is_artifact(text):
    return any(a in text for a in ARTIFACTS)

def strip_vtt(path):
    blocks = pathlib.Path(path).read_text().split("\n\n")
    kept = [b for b in blocks if not (" --> " in b and is_artifact(b))]
    if len(kept) != len(blocks):
        pathlib.Path(path).write_text("\n\n".join(kept))
    return len(blocks) - len(kept)

def strip_txt(path):
    p = pathlib.Path(path)
    if not p.exists():
        return 0
    lines = p.read_text().splitlines()
    kept = [l for l in lines if not is_artifact(l)]
    if len(kept) != len(lines):
        p.write_text("\n".join(kept) + "\n")
    return len(lines) - len(kept)

for arg in sys.argv[1:]:
    vtt = pathlib.Path(arg)
    n = strip_vtt(vtt) + strip_txt(vtt.with_suffix(".txt"))
    if n:
        print(f"{vtt.stem}: removed {n}")
