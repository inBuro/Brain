---
type: narrative
project: Fadercraft
created: 2026-05-06
updated: 2026-05-06
---

# Landing Narrative — Fadercraft XL Performance

**Summary**: The 10-beat psychological arc that drives the `fadercraft.com` landing page. Each beat maps to a section, each section maps to one or more components. Living document — re-open any beat as the launch evolves.

**Sources**: derived from `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` (sections 5–6) plus 2026-05-06 narrative review.

**Last updated**: 2026-05-06

---

## The 10-beat arc

Each beat is the exact thought we want in the reader's head at that moment.

| # | Beat | Goal | Reader's reaction |
|---|---|---|---|
| 1 | **Hook** — "Your LCXL has 16 modes" | Establish relevance | "Yes, I have one" |
| 2 | **Pain** — "Most people use 3" | Recognition | "Damn, me too" |
| 3 | **Stakes** — "You bought a pro instrument, you're using a basic mixer" | Emotional lever | "I want more" |
| 4 | **Promise** — "Fadercraft gives you all 16. Out of the box. In 5 minutes" | Solution | "Show me how" |
| 5 | **Mechanism** — Layered architecture + CC47 transit + Solo Follower | Trust the solution | "OK, this actually works" |
| 6 | **Proof** — 5-min demo video in a real Live session | Counter "you're probably oversimplifying" | "It really works" |
| 7 | **Fit** — 3 ICPs (newbie / studio / live) | Self-identification | "This is for me" |
| 8 | **Value stack** — what's in the bundle ($39 of material value) | Justify the price | "$39 isn't much for all this" |
| 9 | **Trust** — tech requirements + FAQ + refund | Final objections | "Safe to buy" |
| 10 | **Action** — Buy + newsletter | Convert | Click |

## Beat → section mapping

| Beat | Section | Existing in Figma? | Notes |
|---|---|---|---|
| 1 + 2 | **Hero** (Hook + Pain in one screen) | 🟢 `HeroProduct` SET | Pain is one line under headline. Use `ModeGrid` `lost` variant on the visual side instead of product image. |
| 3 + 4 (in two screens) | **The 13 Lost Modes** + **All 16, in your hand** | 🔴 New | Two consecutive sections built around `ModeGrid` (`lost` then `full`). Two-punch effect to drive the same theme home. |
| 5 | **How it works** | 🔴 **New section** (not in original spec) | Mechanism explainer — diagram of layered architecture, CC47 cross-mode transit, Solo Follower. V1: static. V2: animation post-launch. |
| 6 | **Watch it work** | 🟢 `VideoCard` SET | YouTube embed. |
| 7 | **For you, specifically** | 🟡 `WhyChooseNovation` → 3 columns | Adapt: 3 ICP columns instead of 4. |
| 8 | **What's in the kit** | 🟢 `CatalogSection` + `ProductCard` | 4–5 cards: M4L device, Custom Modes, Live Set, docs, video. **Moved from spec position #4 to #8** (after fit, before trust). |
| 9 | **Tech + FAQ** | 🔴 Both new | `RequirementsList` + `FAQAccordion`. Can be merged into one collapsible-style section or split. |
| 10 | **Final CTA** | 🟢 `NewsletterSection` | Add Buy button before the newsletter form. |

## Changes from the original spec

**Added beat 5 — "How it works"**: not in the original 9-section spec (the 3 mechanism bullets were tucked inside "All 16"). Treating as **critical**: readers skip videos, but a text + visual mechanism walkthrough removes the "what aren't they telling me" anxiety before the demo.

**Reordered "What's in the kit"**: from spec position #4 (right after promise) to position #8 (after fit, before trust). Reasoning: bundle cards justify price, which lands hardest **after** the reader has already decided "this is for me." Shipping bundle visuals before fit is premature.

**Pain placement**: pain stays both in the Hero (one short line under the headline) and as its own section ("13 Lost Modes"). Two-punch — quick recognition, then visual confirmation.

**Mechanism medium**: V1 = static diagram + text. V2 (post-launch) = animation showing layer transit and Solo Follower in motion. Cheap iteration from V1.

## Components needed (priority order)

1. ✅ **`ModeGrid`** — built. Used in Hero + Sections 2 + 3.
2. 🔴 **`MechanismDiagram`** — new organism. Visual of layered architecture (Mixer Layer 11–14, Instruments Layer 1–10), CC47 transit arrow, Solo Follower indicator.
3. 🔴 **`FAQAccordion`** — new atom (`AccordionItem`) + organism wrapper.
4. 🔴 **`RequirementsList`** — likely just composition of existing atoms (Text + horizontal rule), no new component required.
5. 🟡 **`ICPColumns`** — adapt `WhyChooseNovation` from 4 columns to 3 ICP columns.

## Related pages

- [[XL_Performance — как это работает]] — source of mechanism details for beat 5
- [[Mixer Layer]] / [[Instruments Layer]] / [[CC47 Cross-Mode Transit]] / [[Solo Follower]] — entity pages, source for the diagram
- [[roadmap]] — broader project progress
