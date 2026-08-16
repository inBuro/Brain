#!/usr/bin/env python3
"""Translate Counter DJ's _locales/en/messages.json into a target language via
the Gemini API — same approach as fadercraft/tools/subtitle-pipeline/translate.py
(keyed batch, structured JSON output, locked terms preserved verbatim).
Switched from the Anthropic API to Gemini (2026-08-05, direct request — the
Anthropic key's account was out of credit; user has a paid Gemini subscription).

Some keys are never sent to the API at all: they're jargon/gesture labels the
Russian locale deliberately left in English (gain/high/mid/low, Knobs,
Crossfader, Tempo, Deck, Both keys/again, Drag / scroll/swipe, Always on, the
bare A/B deck letters) — copied verbatim into every locale instead, matching
that established convention exactly rather than asking the model to guess at
"is this a synonym-less universal term" per language.

Usage: translate_locale.py <lang_code> <lang_name> [--all]
  <lang_code> <lang_name>   translate just one locale, e.g. es Spanish
  --all                     translate every locale in LANGUAGES below
"""
import json, os, re, sys, urllib.request

GEMINI_KEY_FILE = os.path.expanduser("~/.config/google/env")
MODEL = "gemini-2.5-flash"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

ROOT = os.path.expanduser("~/Brain/fadercraft/groove mix/_locales")
EN_PATH = os.path.join(ROOT, "en", "messages.json")

# Copied verbatim into every locale, never sent to the API — see module
# docstring. Matches _locales/ru/messages.json's existing convention exactly.
LOCKED_KEYS = [
    "hintDeckA", "hintDeckLabel", "hintDeckB",
    "hintGain", "hintHigh", "hintMid", "hintLow", "hintFx",
    "hintKnobsTitle", "hintBothKeys", "hintBothAgain",
    "hintDragScroll", "hintCrossfaderTitle", "hintDragSwipe",
    "hintTempoTitle", "hintAlwaysOn",
]

# Substrings inside the STILL-translated strings that must survive literally
# (product name, gesture jargon embedded mid-sentence, the raw A/B deck
# letters, key names) — same role as translate.py's LOCK_TERMS.
LOCK_TERMS = [
    "Counter DJ", "BPM", "A/B", "play/pause", "Tab", "Option", "Alt", "▶",
]

# Chrome's official _locales code for Hebrew is the legacy "iw", not "he" —
# using "he" would silently fail to auto-match the browser's UI language.
LANGUAGES = [
    ("es", "Spanish"), ("pt_BR", "Brazilian Portuguese"), ("fr", "French"),
    ("de", "German"), ("it", "Italian"), ("ja", "Japanese"), ("ko", "Korean"),
    ("zh_CN", "Simplified Chinese"), ("zh_TW", "Traditional Chinese"),
    ("ar", "Arabic"), ("hi", "Hindi"), ("tr", "Turkish"), ("pl", "Polish"),
    ("nl", "Dutch"), ("sv", "Swedish"), ("id", "Indonesian"),
    ("vi", "Vietnamese"), ("th", "Thai"), ("uk", "Ukrainian"),
    ("cs", "Czech"), ("el", "Greek"), ("iw", "Hebrew"), ("ro", "Romanian"),
]


def get_api_key():
    with open(GEMINI_KEY_FILE) as f:
        content = f.read()
    m = re.search(r"GEMINI_API_KEY=(\S+)", content)
    return m.group(1)


def translate(en_messages, lang_code, lang_name):
    translatable = {k: v["message"] for k, v in en_messages.items() if k not in LOCKED_KEYS}
    terms = ", ".join(LOCK_TERMS)

    system = (
        "You are localizing the UI copy of a browser-extension DJ mixer "
        f"(Counter DJ) into natural, idiomatic {lang_name} — the register of "
        "a confident, terse product UI, not stiff literal machine "
        "translation. Some strings are short button/hint labels, others are "
        "full sentences explaining a control; match the register to which "
        "one you're given. "
        f"Keep these terms EXACTLY as written, untranslated, wherever they "
        f"appear inside a string: {terms}. "
        "The key hintCrossNudgeDesc's English text ends with an unclosed "
        "'(' on purpose — the matching ')' is separate literal HTML that "
        "comes after two <kbd> tags this string doesn't include. Keep your "
        "translation of that ONE key ending on an unclosed '(' too, do NOT "
        "add a closing ')' to it, and use the plain ASCII '(' character even "
        "if a full-width bracket would normally read as more idiomatic here "
        "— it has to visually match the plain ASCII ')' the HTML appends "
        "later. Every other key is a normal complete string. "
        "You are given a JSON object mapping string keys to their English "
        "text. Translate EVERY value. Return ONLY a JSON object with the "
        "EXACT SAME keys, translated values, same count, no keys added or "
        "removed, no commentary, no markdown code fences."
    )

    body = json.dumps({
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{
            "role": "user",
            "parts": [{"text": json.dumps(translatable, ensure_ascii=False, indent=2)}],
        }],
        "generationConfig": {"responseMimeType": "application/json"},
    }).encode()

    req = urllib.request.Request(API_URL, data=body, headers={
        "x-goog-api-key": get_api_key(),
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        resp = json.load(r)

    try:
        text = resp["candidates"][0]["content"]["parts"][0]["text"]
        translated = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise RuntimeError(f"Unexpected response shape ({e}): {resp}")

    if set(translated.keys()) != set(translatable.keys()):
        missing = set(translatable) - set(translated)
        extra = set(translated) - set(translatable)
        raise RuntimeError(f"Key mismatch — missing: {missing}, extra: {extra}")

    out = {}
    for key in en_messages:
        if key in LOCKED_KEYS:
            out[key] = {"message": en_messages[key]["message"]}
        else:
            out[key] = {"message": translated[key]}
    return out


def run_one(lang_code, lang_name, en_messages):
    print(f"-> {lang_code} ({lang_name})", file=sys.stderr)
    out = translate(en_messages, lang_code, lang_name)
    out_dir = os.path.join(ROOT, lang_code)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "messages.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"   wrote {out_path}", file=sys.stderr)


if __name__ == "__main__":
    with open(EN_PATH, encoding="utf-8") as f:
        en_messages = json.load(f)

    if len(sys.argv) == 2 and sys.argv[1] == "--all":
        for lang_code, lang_name in LANGUAGES:
            run_one(lang_code, lang_name, en_messages)
    elif len(sys.argv) == 3:
        run_one(sys.argv[1], sys.argv[2], en_messages)
    else:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
