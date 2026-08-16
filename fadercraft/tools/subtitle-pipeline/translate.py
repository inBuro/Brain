#!/usr/bin/env python3
"""Translate a reconstructed cue list into a target language via the Anthropic
Messages API, preserving Fadercraft/Ableton terminology and cue count.

Usage: translate.py <cues.json> <lang_code> <lang_name> > <lang_code>.cues.json
"""
import json, os, re, sys, urllib.request

ANTHROPIC_KEY_FILE = os.path.expanduser("~/.config/anthropic/env")
MODEL = "claude-sonnet-5"
API_URL = "https://api.anthropic.com/v1/messages"

LOCK_TERMS = [
    "Ableton Live", "Max for Live", "Launch Control XL", "Control XL",
    "Dynamic Focus", "Sends Follower", "Fadercraft", "MIDI", "CC",
    "VST", "LFO", "Session View", "Arrangement View", "Return Track",
    "Gumroad",
]


def get_api_key():
    with open(ANTHROPIC_KEY_FILE) as f:
        content = f.read()
    m = re.search(r"ANTHROPIC_API_KEY=(\S+)", content)
    return m.group(1)


def translate(cues, lang_code, lang_name):
    numbered = "\n".join(f"{i+1}. {c['text']}" for i, c in enumerate(cues))
    terms = ", ".join(LOCK_TERMS)

    system = (
        "You are localizing subtitles for short product-demo videos about "
        "music production, Ableton Live, and MIDI controllers. Translate "
        f"into natural, idiomatic {lang_name} — the register of a casual, "
        "confident product-demo voiceover, not stiff literal machine "
        "translation. "
        f"Keep these terms EXACTLY as written, untranslated, in every "
        f"language: {terms}. "
        "You are given a numbered list of subtitle cues from one continuous "
        "script. Translate the FULL meaning naturally across the whole "
        "script, then return exactly one translated line per input cue "
        "number, in order. You may redistribute wording across adjacent "
        "cues if needed for natural grammar, but the OUTPUT ARRAY LENGTH "
        "MUST EXACTLY MATCH the input cue count. Do not add commentary, "
        "explanations, or notes — only the translated cue text."
    )

    tool = {
        "name": "submit_translation",
        "description": "Submit the translated subtitle cues.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cues": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Translated cue text, same order and count as input.",
                }
            },
            "required": ["cues"],
        },
    }

    body = json.dumps({
        "model": MODEL,
        "max_tokens": 4096,
        "system": system,
        "tools": [tool],
        "tool_choice": {"type": "tool", "name": "submit_translation"},
        "messages": [{
            "role": "user",
            "content": f"Input cues ({len(cues)} total):\n{numbered}",
        }],
    }).encode()

    req = urllib.request.Request(API_URL, data=body, headers={
        "x-api-key": get_api_key(),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        resp = json.load(r)

    for block in resp["content"]:
        if block.get("type") == "tool_use" and block["name"] == "submit_translation":
            translated = block["input"]["cues"]
            break
    else:
        raise RuntimeError(f"No tool_use block in response: {resp}")

    if len(translated) != len(cues):
        raise RuntimeError(
            f"Cue count mismatch: got {len(translated)}, expected {len(cues)}"
        )

    return [
        {"start": c["start"], "end": c["end"], "text": t}
        for c, t in zip(cues, translated)
    ]


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        cues = json.load(f)
    lang_code, lang_name = sys.argv[2], sys.argv[3]
    out = translate(cues, lang_code, lang_name)
    json.dump(out, sys.stdout, ensure_ascii=False, indent=2)
