# Fadercraft brand brief

Living direction for tone, audience, and visual language. Not a contract — re-open any section when reality forces it.

Source of inputs: chat 2026-05-26, [[../wiki/roadmap]] T3.
Related: [[colors]], [[email-setup]].

---

## Who we're making it for

**Primary archetype: the live performer on Ableton.**

Plays sets live — clubs, festivals, streams, weekly nights. Owns a Launch Control XL MK3 because they wanted tactile control across a Live session, and they need transitions between parts of the set to be a single physical gesture, not a mouse-cursor hunt.

What they care about:
- One-button mode switching mid-set without breaking flow
- Predictable, instant feedback from the controller (LED, fader pickup, no MIDI conflicts)
- Tools that survive a 90-minute set without surprise

What they don't care about:
- Generic studio-workflow productivity claims
- AI-generated stems / "creativity unlocks"
- Crossover marketing to producers who never leave their bedroom

**Secondary (don't write for them first, but they buy):** studio producer adding hardware control; M4L enthusiast browsing maxforlive.com.

---

## Voice

**Two attributes, in this order: technical / precise, then pragmatic / no-bullshit.**

The first attribute sets the *grammar*: we name things by their actual MIDI mechanics, mode IDs, CC numbers, channel routing. The second sets the *posture*: we promise only what the device does, and we say it once.

How that reads:

> ✅ "Modes 11–14 turn the surface into a dedicated mixer. One button jumps between sides, returning to the exact page you left."
>
> ✅ "Two encoder banks per channel give 6 controls instead of 2 — without breaking muscle memory."
>
> ✅ "I built this because Live's track-arm behavior fires MIDI conflicts when you're already in Mode 9. That's the problem it solves."
>
> ❌ "Unlock your live performance potential with the next-generation MIDI surface that transforms how you play."
>
> ❌ "Take control of your sound like never before."
>
> ❌ "XL_Performance transforms how you think about live sets." (Hype claim. State what it does, not what it transforms.)

Concrete rules:
- **Numbers over adjectives.** "Modes 11–14" beats "several mixer modes." "Up to 3 machines" beats "use it anywhere."
- **Mechanism, then benefit.** Lead with the physical action or routing: "Hold a button to preview the next layer." The benefit ("switch modes without reaching for the controller") follows, or the reader infers it.
- **No second-person hype.** Don't say "you'll love this" or "transform your sets." Show the mechanism; let the reader infer the value.
- **One sentence per idea.** Two short sentences beat one long one with a comma splice.
- **Plain hardware/DAW names.** "Launch Control XL MK3," "Ableton Live 11 Suite," "Max for Live." Not "the LCXL" on first mention. Not "Live 11+" without saying Suite.
- **State the origin problem plainly.** When explaining why a feature exists, name the specific friction it removes — not the aspiration it serves. "I built Mode 9 because track-arm MIDI conflicts mid-set are unrecoverable" is good. "Designed for seamless live performance" is not.
- **Genuine enthusiasm is allowed, if it's about the mechanism.** A parenthetical like "(the endless-knob behavior is the fun part)" or "this turns out to be surprisingly useful mid-set" is fine — it records an honest reaction to the device's behavior, not a sales claim. Keep it brief. Don't manufacture it.
- **Changelog entries are copy too.** Write them as plain lab notes: what changed, why, who caught the bug. "Fix MIDI conflict on mode exit — thanks [username] for the report" is the right register. Polish is wrong here; honesty is right.

When in doubt: read the line aloud. If it sounds like a product launch press release, rewrite it as a docs line.

---

## Visual language

**Lean: technical drawing / schematic.**

The brand mark is already a schematic glyph (a fader cap viewed from the side) — the rest of the visual system follows.

What this looks like:
- **Layout**: signal-flow diagrams over hero shots. Show what connects to what. Arrows, labels, port names. Mode-state diagrams beat lifestyle photography.
- **Typography**: Inter for body and headings (already in DS). A monospace face — JetBrains Mono or similar — for CCs, mode IDs, code, MIDI channels.
- **Line work**: thin strokes (1–1.5px), solid, no shadows. Geometric, axis-aligned where possible. Schematic-grade precision.
- **Color**: neutrals carry most of the page. The three action colors (Primary mint, Secondary lavender, Tertiary amber — see [[colors]]) appear only where they carry semantic meaning: a current mode, an active state, a destination port. Never decorative gradients.
- **Photography**: only when it documents the hardware in real use — top-down or three-quarter angle, neutral background, controller + Live screen in one frame. No artist portraits. No mood photography.
- **Iconography**: line icons, 1.5px stroke, the same family across the product. The fader-cap mark is the only filled glyph.

Reference touchpoints (study these, don't copy):
- Mutable Instruments product pages (schematic + sparse)
- Bitwig user manual diagrams
- Eurorack module faceplates
- Ableton's own user-manual figures (not the marketing site)

The product is a precision tool. The visual says so before the copy does.

---

## Anti-patterns — what Fadercraft never does

### Visual

- **No AI-slop SaaS aesthetic.** No abstract gradient backgrounds, no "sound wave" abstractions, no generic 3D-rendered chrome shapes. Anything that looks like a Midjourney "tech startup hero" prompt is out.
- **No stock photography of musicians.** No DJ-with-arms-up, no headphones-on-a-white-desk, no eyes-closed-in-the-studio. If a human appears, they're operating real hardware in a real context.
- **No EDM-bro / crypto-web3 visual cues.** No neon gradients, no glitch effects, no cyber-dystopian fonts, no "built different" energy.
- **No decorative motion.** Animation only where it explains a mechanism (a fader moving, a mode switching). No parallax for parallax's sake, no auto-cycling carousels.
- **No glass-morphism, no skeumorphic knobs.** The brand is schematic, not a faux-hardware UI.

### Verbal

- **No hype copy.** Banned phrases: "revolutionize," "unleash," "next-level," "game-changer," "take control like never before," "elevate your sound." If a sentence could appear on any audio plugin's homepage, rewrite.
- **No vague benefits.** "Better workflow" → which workflow, measured how? Replace with the mechanism.
- **No emoji decoration.** Emoji in product copy reads as compensating for unclear writing. (Internal docs and chat are fine.)
- **No "story of the founder" warmth.** The brand isn't a hand-made-by-one-person narrative. It's a precision tool that happens to be made by one person.

---

## Litmus test

Before shipping any brand surface — landing copy, product page, IG tile, demo video frame — ask:

1. Could this line appear on **any** audio plugin's homepage? → Rewrite until it can't.
2. Is the visual carrying **information** (signal flow, state, mechanism) or **mood**? → Cut the mood.
3. Would the audience archetype — a live performer mid-set-prep — actually read this and learn what the thing does? → If not, rewrite.

When in doubt, lean drier and more technical, not warmer.
