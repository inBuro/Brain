#!/usr/bin/env python3
"""Reconstruct clean, non-overlapping subtitle cues from ElevenLabs Scribe
word-level timestamps. Drops audio_event entries (background music etc.) —
those are not dialogue and must not become subtitle text.

Usage: cues.py <scribe_response.json> > cues.json
"""
import json, sys

MAX_CHARS = 84       # ~2 lines at ~42 chars
MAX_DURATION = 6.5    # seconds, soft cap before forcing a split
MIN_DURATION = 0.8    # avoid flash cues


def build_cues(words):
    """words: ElevenLabs 'words' array (word/spacing/audio_event entries)."""
    tokens = [w for w in words if w["type"] in ("word", "spacing")]

    # Group into sentences first (split after . ! ? that end a 'word' token)
    sentences = []
    current = []
    for w in tokens:
        current.append(w)
        if w["type"] == "word" and w["text"].strip()[-1:] in ".!?":
            sentences.append(current)
            current = []
    if current:
        sentences.append(current)

    cues = []
    for sentence in sentences:
        cues.extend(_split_sentence(sentence))
    return [c for c in cues if c["text"].strip()]


def _sentence_text(tok_group):
    return "".join(w["text"] for w in tok_group).strip()


def _split_sentence(tok_group):
    """Split one sentence's tokens into one or more cues honoring MAX_CHARS/MAX_DURATION.
    Split points are only at 'spacing' tokens (word boundaries)."""
    text = _sentence_text(tok_group)
    start = tok_group[0]["start"]
    end = tok_group[-1]["end"]
    duration = end - start

    if len(text) <= MAX_CHARS and duration <= MAX_DURATION:
        return [{"start": start, "end": end, "text": text}]

    # Find candidate break points: spacing tokens, preferring ones after a comma/
    # conjunction-ish word, roughly at the midpoint of the token list.
    mid = len(tok_group) // 2
    best_idx = None
    best_dist = None
    for i, w in enumerate(tok_group):
        if w["type"] != "spacing":
            continue
        prev_word = tok_group[i - 1]["text"] if i > 0 else ""
        dist = abs(i - mid)
        score = dist - (2 if prev_word.rstrip().endswith(",") else 0)
        if best_dist is None or score < best_dist:
            best_dist = score
            best_idx = i
    if best_idx is None:
        return [{"start": start, "end": end, "text": text}]

    left = tok_group[:best_idx]
    right = tok_group[best_idx + 1:]
    if not left or not right:
        return [{"start": start, "end": end, "text": text}]

    return _split_sentence(left) + _split_sentence(right)


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)
    cues = build_cues(data["words"])
    json.dump(cues, sys.stdout, ensure_ascii=False, indent=2)
