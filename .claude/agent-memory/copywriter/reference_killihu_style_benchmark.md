---
name: killihu-style-benchmark
description: Tone of voice, vocabulary, and copy length norms derived from 58 killihu.vstskins.com product pages — M4L/VST utilities for Ableton, same vertical as Fadercraft; add-on reference alongside approved Steinkamp voice
metadata:
  type: reference
---

# killihu Style Benchmark

Source corpus: 58 product pages, killihu.vstskins.com (scraped 2026-06-18).
Related: [[fadercraft-audience-voice]] [[fadercraft-copy-antipatterns]]

**Integration rule:** killihu is a SECOND reference, not a replacement for the approved Steinkamp voice. Take structure, brevity norms, and missing terminology from killihu. Where the two conflict, see "Conflicts with Steinkamp voice" section below.

---

## Tone of Voice

### 1. Register: plain maker-to-maker, low affect

killihu writes like a solo developer explaining to another developer what a tool does and why it exists. No superlatives, no hype adjectives, no mission statements. The opener names the device and states its job in one sentence:

> "ALFIL Max is a Max for Live device designed to speed up the workflow in Ableton Live."
> "Chord Demix is a set of plugins that separate notes from chords."
> "Clip Cloner is an approach to using ghost clips in Ableton Live."

Every intro sentence: Device Name + verb phrase (what it does). This is a reliable structural pattern.

### 2. Benefit framing: problem-first, not promise-first

killihu leads with the friction being removed, not with a value promise:

> "…avoiding having to navigate through browser folders."
> "…without taking exclusive control of them."
> "…without having to open the clip detail view."

The payoff is implicit: you do not have to do the annoying thing anymore. This is quieter than a "benefit-first headline" — it is friction-elimination framing. Compatible with Steinkamp, slightly different angle.

### 3. Comparison construction: "Unlike X, this does Y"

killihu uses "Unlike…" as a standard differentiation opener:

> "Unlike other similar plugins, Chord Demix sends notes without the need to set send/receive IDs."
> "Unlike other systems, such as encapsulating VST plugins within Max for Live devices, EPC devices offer several improvements."
> "Unlike the free version, it is displayed in a floating window."

This construction is efficient and honest. Safe to borrow for Fadercraft when distinguishing from stock Ableton behavior or competitors.

### 4. Honesty about limitations — "To consider" section

killihu dedicates a named section to caveats with no apology:

> "To consider:"
> "Asian languages only supported in Live 12."
> "It only works with the Live window maximized."
> "In multi-monitor configurations, it is only displayed on the monitor defined as main."

No softening language ("unfortunately," "please note that"). Just a short label and a plain statement. This maps exactly onto what our audience (DAW purists) demands: honest disclosure of constraints without spin.

### 5. Technical depth: mechanism explained, not abstracted

killihu explains HOW a device works when the mechanism is non-obvious:

> "The device controls an instance of EQ Eight so that each EQ Eight filter is positioned at a different octave."
> "Master Pitch is an audio effect so you can load it into the master track. It does not process audio, it only sends the transposition signal to all Track Pitch plugins."

This is Steinkamp-compatible: show the mechanism, trust the reader to understand it. No dumbing down, no hand-holding metaphors.

### 6. Free-tier / upgrade distinction: handled surgically

When a free version exists, killihu names the delta in one clause:

> "Unlike the free version, it is displayed in a floating window."
> "This plugin is free. Consider making a contribution if it is useful for you."

The CTA for free products is identical on every free page — it has become a formula the audience knows and accepts. Not aggressive upsell.

### 7. CTA pattern: present tense + value + future updates

Paid product CTA is formulaic and appears on every paid page without variation:

> "Buy [Product Name] now and get the latest version. Then later, all future updates free."

Two sentences. First: act + immediate value. Second: long-term value. Zero adjectives. This formula is replicable and testable for Fadercraft.

### 8. ESL note — extract structure, not surface grammar

killihu is not a native English speaker (likely Spanish). Several constructions are grammatically non-native:
- "Check the manual before buy" (missing "you")
- "Allows you to load any Live browser element" (missing subject in some contexts)

**Rule for Fadercraft:** borrow the structural patterns (opener format, "Unlike X," "To consider," CTA formula). Write grammatically clean English — our copy voice is technically correct.

---

## Page Structure Template (killihu canonical)

```
[Intro paragraph]   — Device name + what it does, 1–2 sentences
                      Optional: "Unlike X" differentiation
[Second paragraph]  — How it works OR key scenario (~1–2 sentences)
[Optional context]  — Use-case elaboration or caveat setup

Main features:      — lead-in (short line with colon)
* [bullet]          — 5–8 items, action/noun format

How to use it:      — lead-in (when steps are needed)
* [step bullet]

To consider:        — lead-in (when limitations exist)
* [limitation]      — plain statement, no apology

[Manual CTA]        — "Check the manual before buy: [Product] PDF Manual"
[Buy CTA]           — "Buy [Product] now and get the latest version. Then later, all future updates free."
[$PRICE]
```

Not every section appears on every page. Simpler free tools skip features/steps entirely.

---

## Length Norms (killihu benchmark — 58 pages)

Apply as: "aim for median, ceiling = p75."

| Unit | Median | p75 (ceiling) | Notes |
|------|--------|----------------|-------|
| Full description (all prose) | 542 chars | 1 120 chars | ~80–160 words total for the page |
| Paragraphs per page | 4 | 7 | Simple free tools: 1–2 paras only |
| Paragraph length | 138 chars | 220 chars | ~20–30 words; single idea per para |
| Bullet count (when used) | 6 | 9 | Lists on only 34 % of pages; don't force them |
| Bullet length | 63 chars | 86 chars | ~9–12 words; noun phrase or short verb clause |
| Caption / label | 9 chars | 13 chars | 1–3 words; names what is shown, no period |

**Fadercraft application:**
- A Control XL feature block should aim for 400–600 chars of prose (≈ 60–90 words), ceiling 1 000 chars.
- Each feature paragraph: 1 idea, ≤ 30 words.
- Bullet list: use only when you have ≥ 3 parallel items; 6–8 bullets ideal, 9 max.
- Image captions: label only — "Session view," "Routing," "Dark mode" — no sentence, no period.
- A landing page hero section (headline + sub + 1 para) should be under 200 chars of body text.

---

## Vocabulary: Ableton / M4L terms found in killihu corpus

Terms already present in [[fadercraft-audience-voice]] are marked (existing). New terms to add to Fadercraft copy vocabulary are marked **(new)**.

### Core device / session architecture
| Term | killihu usage |
|------|---------------|
| effects chain | "inserted at the end of the track's effects chain" **(new)** |
| effects rack / Instrument Rack | "encapsulating VST plugins within … effects rack" (existing: rack) |
| chain | "the first chain," "each of the chains" **(new: as component noun)** |
| master track | "load it into the master track" (existing context) |
| return track | "routed to the master track" — implied; used explicitly in `capture-audio` **(new: return track as named concept)** |
| session clip / Session View clip | "Captured audio can be inserted as a Session Clip" **(new)** |
| arrangement / Arrangement | "directly into the Arrangement," "arrangement start cursor position" (existing) |
| floating window | "displayed in a floating window" — killihu's standard UI pattern **(new as design term)** |
| key mapping / key map | "opened via key mapping," "mapped to a keyboard shortcut" **(new: key mapping)** |
| mappable | "Button to show the floating window is mappable" **(new)** |
| MIDI CC / CC | "sending of 8 different MIDI CC," "CC number" **(new: MIDI CC as standalone noun)** |
| MIDI note | "Each time a MIDI note is received" (existing: MIDI notes) |
| transport | "every time the transport is started" **(new: transport as standalone noun)** |
| Warp Mode | "the Warp Mode of the percussion track clips is in Beats" **(new)** |
| groove | "groove selection" **(new)** |
| locator | "Locator Manager shows the locators of the project" **(new)** |
| DrumRack / Drum Rack | "Auto-rename tracks based on Live Drum Rack names" **(new)** |
| undo history | "Does not interfere with Live's undo history" **(new)** |
| Info View | "description … is displayed in Live's Info View" **(new)** |
| macro / Macro Control | "controlled from a Macro Control on an effects rack" (existing: macro) |
| sidechain / sidechain input | "audio sidechain input of the Live compressor" **(new: sidechain input)** |
| EQ Eight | "The device controls an instance of EQ Eight" **(new: EQ Eight as proper noun)** |
| Simpler | "loading samples into the Simpler instrument" **(new: Simpler as device name)** |
| DrumPad | "rename the DrumRack's DrumPads" **(new)** |

### Operating patterns
| Term | Usage |
|------|-------|
| drag and drop | "via a single click or drag and drop" **(new as copy verb)** |
| single click | "items can be inserted via a single click" — standard economy claim **(new)** |
| key mapping (assigned to open/close) | maps a key to toggle floating window **(new)** |
| preset | "save up to 16 presets for A/B style comparisons" (existing) |
| Live color theme | "matches Live's color theme," "Ableton Live themes" **(new: Live color theme)** |
| Min / Max (mapping range) | "The Min and Max parameters set the range" — standard M4L param names **(new: Min/Max as UI param names)** |
| Depth (bipolar range) | "Depth adjusts the range of values sent" **(new: Depth as M4L param name)** |
| Bipolar mode | "Bipolar mode for controls whose default position is the center" **(new)** |
| Capture MIDI | "Mimics the behavior of Live's Capture MIDI feature" **(new)** |

### Structural copy phrases (reusable killihu constructions)
- "speed up the workflow in Ableton Live" — economy claim
- "without having to [do annoying thing]" — friction elimination
- "Unlike [alternative], [this product] [advantage]" — differentiation frame
- "It works on Windows and Mac" — platform statement
- "Does not interfere with [X]" — non-interference claim
- "Multiple instances of [device] can be used at the same time" — scalability
- "available in a floating window" — UI affordance
- "can be mapped" / "is mappable" — MIDI control claim

---

## Conflicts with Steinkamp voice

Steinkamp (approved primary voice) is maker-honest, dry, mechanism-forward. killihu is compatible in register, but two structural differences exist:

| Dimension | Steinkamp | killihu | Resolution |
|-----------|-----------|---------|------------|
| Intro sentence | Typically starts with a scenario or verb ("Map your sends…") | Typically starts with device name + definition ("ALFIL Max is a Max for Live device that…") | Both valid; use killihu's definition opener for long-form product pages, Steinkamp's scenario opener for hero/ad copy |
| CTA formula | No fixed formula established | Fixed two-sentence formula ("Buy X now… all future updates free.") | Adopt killihu formula for Gumroad product page CTAs; Fadercraft landing CTA stays as designed |
| Limitations disclosure | Not explicitly structured | Named "To consider:" section | Adopt killihu's pattern for product pages and docs; adds maker-honest credibility |
| List use | No explicit rule | Lists on only 34 % of pages; not default | Steinkamp is also copy-lean; reinforce — don't default to bullets |

**No hard conflicts.** killihu fills structural gaps that Steinkamp does not address (product page skeleton, length norms, limitation disclosure pattern). They are additive, not contradictory.
