---
type: narrative
project: Fadercraft
created: 2026-05-06
updated: 2026-05-07
version: 3
---

# Landing Narrative — Fadercraft XL Performance

**Summary**: The 8-beat psychological arc for the `fadercraft.com` landing page. Each beat = one section, one component instance, one source of truth. Living document — re-open any beat as the launch evolves.

**Sources**: `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` (sections 5–6) + 2026-05-06 narrative review v1 + 2026-05-06 v2 consolidation (merged "Lost Modes" + "All 16" + "How it works" → single beat, dropped before/after framing).

**Figma prototype**: page **Prototype** in file [`OdPRdjodGO3WiR6tgSP7AA`](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=373-3).

**Last updated**: 2026-05-07

---

## The 8-beat arc (v2)

Each beat = one thought we want in the reader's head at that moment.

| # | Beat | Goal | Reader's reaction |
|---|---|---|---|
| 1 | **Hook + Pain** — "Your LCXL has 16 modes. Most use 3." | Establish relevance + recognition in one screen | "Yes I have one — and yes I use 3" |
| 2 | **How it works** — Two layers, one button between them, Solo Follower | Show the device transformed; explain the mechanism via the visual | "OK now I see what it actually does" |
| 3 | **Proof** — full demo video in a real Live session | Counter "you're probably oversimplifying" | "It really works" |
| 4 | **Fit** — 3 ICPs (just unboxed / studio producer / live performer) | Self-identification | "This is for me" |
| 5 | **Value stack** — what's in the bundle ($39 of material value) | Justify the price *after* fit lands | "$39 isn't much for all this" |
| 6 | **FAQ** — 6 questions covering MK1/MK2 compat, Suite, updates, customisation, refund, Live versions | Soft objections | "Most concerns resolved" |
| 7 | **Tech requirements** | Final hard checkpoint before CTA: disqualify incompatible buyers cleanly | "Yes my setup matches" |
| 8 | **Action** — Buy + newsletter | Convert | Click |

## Beat → section mapping (v2)

| Beat | Section component | Notes |
|---|---|---|
| 1 | `HeroProduct` (Layout=horizontal) | Eyebrow + 16-modes headline + pain line + CTA + video loop |
| 2 | `All16Section` (renamed: "How your LCXL works") | ModeGrid (rectangular pads, all 16 lit) — visual carries the mechanism story; copy explains layers + CC47 + Solo Follower |
| 3 | `VideoCard` (Layout=1440 desktop) | YouTube embed; **must be 16:9 aspect, capped at content max-width (1200px)** |
| 4 | `ICPColumns` | 3 columns; adapted from WhyChooseNovation 4-col |
| 5 | `CatalogSection` (rewrite needed) | 5 cards: M4L device, Custom Modes, Live Set, Quickstart, Demo video |
| 6 | `FAQSection` | FAQAccordion with 6 default items |
| 7 | `RequirementsSection` | RequirementsList composed of SpecRow atoms |
| 8 | `NewsletterSection` (rewrite needed) | Add Buy CTA above email form; headline "Ready to play all 16?" |

## Changes from v1 (2026-05-06)

**Dropped beats 2 + 3 + 5 (Lost Modes / All 16 split / Mechanism)** — collapsed into a single beat 2 ("How it works") that uses a single ModeGrid (all 16 lit, rectangular pads matching LCXL MK3 bottom-row proportions) AS the mechanism explainer. Reasoning: showing "before / after" with two ModeGrid variants wasted screen real estate; the same visual + richer copy carries both the "promise" and the "how" simultaneously.

**Stakes beat dropped**: the original v1 had a separate "stakes" beat ("you bought a pro instrument…"). It overlapped with pain. Pain line in Hero is enough.

**Net beat count: 10 → 8**.

## Design decisions (v2)

- **ModeButton shape**: 120×72 rectangles (~1.67:1), matching LCXL MK3 bottom-row track-select button proportions. Was 80×80 squares.
- **Single ModeGrid variant in use**: only `Layout=full` (all 16 lit). The `Layout=lost` variant exists in the SET but is unused on the landing.
- **Video aspect ratio**: 16:9, never breaks out of `max-width: 1200px` content wrapper.
- **Section structure**: every section is an organism component (5 masters, instances per breakpoint). No inline section duplicates. See feedback memory `feedback_repeated_layouts_components.md`.
- **Width constraints**: outer section padding 24px (mobile breathing room only); inner content wrapper `maxWidth: 1200px`, centered. See feedback memory `feedback_max_width_not_padding.md`.

## Copy by beat (current Figma state)

### Beat 1 — Hero (Hook + Pain)
- Eyebrow: `FADERCRAFT · XL PERFORMANCE`
- Headline: `Your LCXL has 16 modes.`
- Body: `Most people figure out 3. Fadercraft XL Performance is the kit that lets you play all 16 — out of the box, in 5 minutes.`
- Primary CTA: `Buy on Gumroad • $39`
- Secondary CTA: `Watch the demo`

### Beat 2 — How it works
- Eyebrow: `HOW YOUR LCXL WORKS`
- Headline: `Two layers. One button between them.`
- Body: `Modes 1–10 hold your instruments. Modes 11–14 hold your mixer. One button jumps you between them, and brings you back on the next press.`
- Visual: ModeGrid (4×4 grid; pads 1–10 lit as Instruments, 11–14 lit as Mixer, 15–16 dim as visual placeholders — no tooltip)
- Tech detail (deferred to expandable / tech-section, not first read): the jump button sends `CC47` and Solo Follower listens to your selected track.

#### Beat 2.1 — State memory (supporting block, after the grid)
- Eyebrow: `STATE MEMORY`
- Headline: `You don't lose your place.`
- Body: `Press the jump button from instrument page 7 — you're in the mixer. Press it again — you're back on page 7. Not page 1, not the mixer's idea of "home." Page 7. Your hands keep their muscle memory across the whole set.`

#### Beat 2.2 — Knob doubling (supporting block, after state memory)
- Eyebrow: `PAGE A / PAGE B`
- Headline: `Six controls per channel, not three.`
- Body: `Page A and Page B layer two mappings onto the same encoders. Volume + send on Page A, EQ on Page B — no menu-diving, no remapping mid-set. Hands stay put; the controls multiply.`

#### Beat 2.3 — Mid-set controls (supporting block, after knob doubling)

> **DEPRECATED — 2026-05-20.** This block shared three ideas with Beat 2.1 (state memory) and Beat 4 (ICP columns). Replaced by the reframe below. See "Structure reframe v3" for the resolution.

~~- Eyebrow: `MID-SET`~~
~~- Headline option A: `Controls that work the same at bar 1 and bar 200.`~~
~~- Card 1 — Reach mute and solo from any page~~
~~- Card 2 — The panel shows the active mode~~
~~- Card 3 — Switch modes from the keyboard~~

### Beat 3 — Proof (Watch it work)
- Eyebrow: `IN ACTION`
- Headline: `See it in your workflow`
- Visual: VideoCard (YouTube embed, 16:9, ≤1200px wide)
- *(label below video to be rewritten from "Launch Control XL MK3 — Deep Dive" → "Fadercraft XL Performance — full demo")*

### Beat 4 — Fit (For you)

> **Updated 2026-05-20** — personas rewritten to eliminate cross-beat duplication and give each column a distinct moment, not a feature summary. See "Structure reframe v3."

- Eyebrow: `WHO PICKS IT UP`
- Headline: `Three players. One kit.`
- Column 1 — New LCXL owner: `You open a Live Set with all 16 modes configured, routing wired end to end, and a one-page guide on the side. Plug in. Play.`
- Column 2 — Studio producer: `Your sessions live in your instrument pages. The mixer is one button away — and when you're done with it, you're back exactly where you were, not at page 1.`
- Column 3 — Live performer: `Nothing moves without you touching it. The mode panel shows where you are. Mute and solo sit at the same physical position in every mode. The set holds its shape at bar 200.`

### Beat 5 — Value stack (What's in the kit) — REWRITE PENDING
- Eyebrow: `WHAT'S IN THE KIT`
- Headline: `Everything you need. Nothing else to buy.`
- Cards (5):
  1. `XL_Performance.amxd` — The Max for Live device that does the heavy lifting. Drop into a track, done.
  2. `Custom Modes (×16)` — Pre-mapped configurations for Components — you import once.
  3. `XL_Performance_starter.als` — Live Set with all routings, racks, and Solo Follower wired up.
  4. `Quickstart guide` — One-page install + first-track walkthrough.
  5. `Demo video` — The same one you just watched, included offline.

### Beat 6 — FAQ

> **Updated 2026-05-20** — full rewrite. Old set (MK1/MK2 compat, Live Suite requirement, free updates, customisation, refund, Live versions tested) replaced with the set below. MK1/MK2 already covered by Beat 7 hardware spec; "free updates" expanded into delivery mechanism; "customisation" deferred to docs.
>
> **Reordered 2026-05-21** — FAQ moved to beat 6 (was 7), Tech requirements moved to beat 7 (was 6). Rationale: tech requirements work better as the final hard checkpoint immediately before the CTA, after FAQ has cleared softer concerns.

- Eyebrow: `FAQ`
- Headline: `Last questions before you buy.`
- Items (6):
  1. **Q:** `Will this work with my existing Live Sets, or only the included starter set?`
     **A:** `Drop XL_Performance.amxd into any existing Live Set — it reads your track layout immediately. The starter set is there to show the mapping logic, not to replace your project.`
  2. **Q:** `Will this overwrite my current Custom Modes on the controller?`
     **A:** `Modes 1–10 keep your mappings — only the layer-jump button (CC47) gets rewritten. Modes 11–14 are overwritten with the mixer layout. Modes 15–16 are left untouched. Back up modes 11–14 in Components if you want them.`
  3. **Q:** `Does this need Max for Live?`
     **A:** `Yes — it ships as an .amxd device. If your Live edition includes M4L, you're set.`
  4. **Q:** `Licensing?`
     **A:** `One key, three activations. Files watermarked with your email at download.`
  5. **Q:** `How do I get updates after purchase?`
     **A:** `Gumroad sends a download link to your email whenever a new version is released. No subscription, no separate app.`
  6. **Q:** `Where do I report a bug or ask a question?`
     **A:** `Email report@fadercraft.com. Response within 48 hours on working days.`

**Backlog (docs / on request):** MK1/MK2 compat, Push 2/3 parallel use, Solo Follower workflow, LED feedback, Logic/Bitwig support, CPU cost, custom CC remap, refund window.

### Beat 7 — Tech requirements
- Eyebrow: `TECH REQUIREMENTS`
- Headline: `Will it run for you?`
- Specs (order matches Figma `1434:6981`):
  - Ableton Live: Live 12 — Suite, or Standard + M4L add-on
  - Max for Live: Bundled with Live 12 Suite
  - Hardware: Novation Launch Control XL MK3
  - Mode loading: Novation Components
  - Operating system: macOS or Windows — wherever Live 12 runs

### Beat 8 — Action — REWRITE PENDING
- Headline: `Ready to play all 16?`
- Sub: `Start in the next 5 minutes. Or join the list and we'll ping you when v1.1 lands.`
- Primary CTA: `Buy on Gumroad • $39` (above newsletter form)
- Secondary: email field + `Subscribe`

## Sections to remove from existing 1920 ProductPage (legacy Novation content)

The 1920 / 1440 / 960 / 640 / 360 ProductPage breakpoints inherited 11 sections from the original Novation product page. After narrative consolidation, these need pruning:

- **DROP**: `FeatureSlider` (Explore the hardware), `FeatureSplit` (Built for flow), `WorkflowSection` (See it in your workflow), `Frame` (unnamed slider), `PullQuoteSection` (no real testimonials yet) — all duplicate or redundant
- **KEEP & REWRITE**: `CatalogSection` (becomes "What's in the kit"), `NewsletterSection` (becomes "Final CTA"), Header/Footer (already rebranded)

## Open questions (still to resolve)

1. **Hero headline** — flagged for full rewrite (user 2026-05-07: "мне он сейчас не нравится"). Existing "Your LCXL has 16 modes." is a placeholder pending a stronger angle. Pending decision is bigger than 14-vs-16 wording — full reframe expected.
2. **"5 minutes" honesty**: is this measurable? Lock in a real install time or soften ("under 10 minutes")?
3. **Value stack price tags**: should each kit card show "$15 value" to total $75 → reframe $39 as a steal? Or this reads as bazaar?
4. **FAQ additions**: "Why $39?" — explain pricing? Risk: opens a can of worms.
5. **CC47 disclosure level**: ~~keep "CC47" in beat 2 body~~ — resolved 2026-05-07. CC47 is dropped from the first read; lives in an expandable / tech-section only. Body uses "the jump button" / "one button" framing.
6. **Knob doubling — "vs two" or "vs three"?**: ~~user to confirm~~ — resolved 2026-05-07 to **6 vs 3** (one Page = 3 encoder rows × 8 channels; Page A + B = 6 mappings per channel). Headline reads "Six controls per channel, not three."
7. **Tooltips on grey 15–16 pads**: resolved 2026-05-07 — no tooltip. Grey reads universally as "unused/unavailable" and any label ("service channels," "reserved," "factory preset") would falsely imply a hardware role. The greys exist for visual symmetry with the 4×4 grid, nothing more.

## Structure reframe v3 (2026-05-20)

### Diagnosis

Beat 2.3 (Mid-set) was a free-floating block with no distinct job. Its three cards — mute/solo reachability, state memory, keyboard switching — repeated ideas already covered in Beat 2.1 (state memory, dedicated block) and Beat 4 (ICP columns repeating the same claims in different words). The result: the reader sees the same three facts twice, in weaker form each time, with no new information in between.

Beat 4 had a different problem. The ICP columns were written as mini feature-lists per persona, which meant they recycled Beat 2 vocabulary ("one button," "mute & solo," "keyboard") instead of doing the only thing a persona column can do: put the reader in a specific moment.

### Resolution

**Beat 2.3 (Mid-set) is dropped.** Its two ideas that were genuinely not covered elsewhere — mute/solo positional invariance, keyboard mode switching — are absorbed into Beat 4's Live performer column, where they belong contextually. The `MID-SET` eyebrow section has no landing page role that isn't already served by Beat 2's sub-blocks (2.1 State memory, 2.2 Knob doubling).

**Beat 4 (ICP columns) is rewritten** around moments, not features:

| Persona | Old angle | New angle |
|---|---|---|
| Just unboxed | Mentions 16 modes (already in Hero) | Day-one zero-friction: configured, wired, guiding doc included — no decisions |
| Studio producer | "one button" + "state memory" (both in Beat 2) | The specific situation: session mode → mixer → back to exact session page |
| Live performer | "transit in one stroke" + Solo Follower (Beat 2 vocab) | The set holds structural shape: nothing moves unexpectedly, mute/solo always where hands expect them |

### Revised beat arc (beats 2–4 only)

| Beat | Role | What the reader learns |
|---|---|---|
| 2 — How it works | Mechanism | The two-layer model, the jump button, state memory, knob doubling — capability map |
| ~~2.3 — Mid-set~~ | ~~Dropped~~ | ~~Duplicated 2.1 + 4~~ |
| 4 — Fit | Self-identification | Which of the three moments is mine — not what the device does, but what it solves for me |

The arc is now: *understand the mechanism* → *watch it work* → *recognise yourself in it* → *decide to buy.*

### What is not resolved by this reframe

- Hero headline is still flagged for full rewrite (open question #1 above).
- Beat 4 column format is still `ICPColumns` (3 columns). If the columns get longer narrative copy, evaluate whether a stacked format reads better than columns on mobile.

## Related pages

- [[xl-performance-how-it-works]] — source of mechanism details for beat 2
- [[mixer-layer]] / [[instruments-layer]] / [[cc47-cross-mode-transit]] / [[solo-follower]] — entity pages
- [[roadmap]] — broader Phase 0 progress
