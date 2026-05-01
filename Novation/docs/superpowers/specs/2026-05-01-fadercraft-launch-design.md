# Fadercraft launch — content & landing design

**Date:** 2026-05-01
**Status:** Draft for review
**Project:** Fadercraft (umbrella brand) — flagship product `XL_Performance` for Novation Launch Control XL MK3
**Author:** Kirill (with brainstorming assistance)

---

## 0. How to read this document

This spec is a **living direction**, not a contract. Every decision below is a starting point — sections may be re-opened, revised, or replaced when new context appears during implementation. Treat the document as a map: useful for orientation, not a rulebook that overrides better information learned later.

If a planned step turns out to be wrong, surface the conflict and revise the spec rather than powering through because "the spec said so".

---

## 1. Executive summary

This document captures the launch design for **Fadercraft** — an umbrella brand under which Max for Live / Ableton performance utilities will ship. The flagship is `XL_Performance`, a starter kit for Novation Launch Control XL MK3. The launch comprises a single paid SKU on Gumroad ($39), a long-scroll landing page at `fadercraft.com`, a YouTube-anchored content strategy, and an in-device update-notification mechanism that lets shipped copies announce new versions without depending on email reach.

This is a single-product spec scoped to v1.0 launch. Future products in the line are out of scope; the brand and infrastructure are designed to extend to them.

## 2. Product

### 2.1 Bundle composition

A single SKU includes:

- `XL_Performance.amxd` — Max for Live MIDI device (existing v1.5+, modified for update-check)
- `solo_follower.js` — required JS dependency, ships alongside `.amxd` (not promoted as a separate device)
- `update_check.js` — new in v1.0 release; handles version polling
- 14 Custom Modes for LCXL MK3 (Components-exportable file or `.syx`)
- Pre-mapped Ableton Live Set (`.als`) — instrument tracks, return tracks, and controller mappings ready to play
- Documentation: PDF Quickstart (5-step install) + extended reference
- Demo / tutorial video (also published on YouTube)
- Optional: starter content pack (drum samples, synth presets) — pending decision based on production effort

### 2.2 Pricing

**$39 fixed.** Positioned mid-range for Max for Live starter kits. Justified by bundle scope: device + Custom Modes + Live Set + content + docs + video. No launch discount on v1.0 to preserve brand positioning.

Re-evaluate price after 3–6 months of conversion data.

### 2.3 Key product detail for marketing

LCXL MK3 has 16 user-visible custom mode buttons. Internally, mode 16 is locked and mode 15 has no command, so 14 are functional. **Marketing copy uses "16" — that is what the user sees on their device.** The "14 functional" detail belongs in technical FAQ only.

## 3. Brand

### 3.1 Decision

**Fadercraft** as umbrella brand. Decided after a verification pass against alternatives:

| Candidate | Outcome |
|---|---|
| XL Performance (as brand) | Rejected — phonetic collision with "Excel"; constrains future devices to LCXL family |
| Setforge / Modeforge / Stageforge | Rejected — "forge" not in user's natural lexicon |
| Backline | Disqualified — `backline.com` is BACKLINE Musician Services Inc. (Canada, since 1995) |
| Patchcraft | Disqualified — `gumroad.com/patchcraft` already taken |
| Faderwork | Disqualified — `faderwork.com` registered 2026-04-12 (active fresh competitor signal) + Instagram `@faderwork` exists |
| Setcraft | Rejected — `.com` parked since 2006, would require expensive acquisition |
| **Fadercraft** | **Selected** — `.com` free, Gumroad handle free, Instagram handle taken by dormant non-brand account (use alt `@fadercraft.studio` / `.audio` / `.dev`) |

### 3.2 Naming convention for products

`Fadercraft <ProductName>`. Flagship: `Fadercraft XL Performance`. Future: `Fadercraft <next utility>`.

### 3.3 Trade-off accepted

The "fader" prefix carries semantic weight toward fader-specific tooling. Future utilities that touch other controls (clip launcher, chord scaler, generic routing) will read slightly off-brand. User accepted this trade-off for the brand name's clarity and tactile resonance.

## 4. Ideal customer profile

Three concentric ICPs, ranked by priority:

1. **Newbie LCXL MK3 owner** — recently bought the controller, looking for "what to do with it". Buys for low-friction starting kit (Live Set + Custom Modes + device).
2. **Studio producer** — uses LCXL daily, has manually configured a few custom modes, frustrated with the manual-tap mode-switching. Buys for one-handed workflow that frees the other hand for a keyboard / synth.
3. **Live performer** — plays Ableton sets on stage. Buys for fast Mixer ↔ Instruments transit and the Solo Follower's automatic focus management.

Tier-2 ICP (sound designers, content creators, educators) is welcome but not the marketing target.

### 4.1 Core pain addressed

Users have 16 custom mode slots and typically use 2–3. The remaining capacity is locked behind manual configuration in Components and clumsy mid-set mode switching. `XL_Performance` unlocks all of them with layered architecture (Mixer Layer 11–14, Instruments Layer 1–10), one-button cross-mode transit with state memory, and automatic Solo Follower.

## 5. Narrative

### 5.1 Position

Hybrid of "unlock the full potential of your gear" + "out of the box, in 5 minutes". Single narrative thread reaches all three ICPs without forking the message.

### 5.2 Hero copy

```
Your Launch Control XL has 16 modes.
Most people figure out 3.

Fadercraft XL Performance is the kit
that lets you play all 16 — out of the box, in 5 minutes.

[ Get it on Gumroad — $39 ]
```

Below CTA: an 8-second autoplay/muted/looping clip showing one-button mode transit between Mixer and Instruments layers. Goal: hold attention past 5 seconds.

## 6. Landing page

URL: `fadercraft.com/xl-performance` (or root `fadercraft.com` while it is the only product).

Single long-scroll, no multi-page navigation. Section order:

| # | Section | Content | Goal |
|---|---|---|---|
| 1 | Hero | Headline, subline, CTA, 8-sec loop demo | Hook in 5 seconds |
| 2 | The 13 Lost Modes | 16-button grid, 3 lit / 13 dim, body explaining why users plateau at 2–3 modes | Pain recognition |
| 3 | All 16, in your hand | Same grid all lit, transit arrows; 3 bullets — layered architecture, one-button transit with memory, Solo Follower | Promise |
| 4 | What's in the kit | Cards with screenshots: device, Custom Modes, Live Set, docs, video | Show $39 of material value |
| 5 | For you, specifically | Three columns by ICP — newbie / studio producer / live performer | Each ICP recognises themselves |
| 6 | Watch it work | Full 5-minute demo video (embedded YouTube) | Remove residual doubt |
| 7 | Tech requirements | Ableton Live Suite (M4L), LCXL MK3, macOS/Windows, Live version compat | Disqualify incompatible buyers cleanly |
| 8 | FAQ | 6–8 questions: MK1/MK2 compat, Suite requirement, updates, customisation, refund | Last-mile objections |
| 9 | Final CTA | Buy button + newsletter signup | Conversion |

FAQ and tech-spec sections collapsible.

### 6.1 Conversion bottleneck

The decisive moment is between Decision (sections 4–6) and Action (Gumroad). Bundle cards and demo video carry the conversion. Investment in their quality has the highest ROI of any landing element.

## 7. User journey

| Stage | Touchpoint | User question | What they need |
|---|---|---|---|
| 1. Awareness | YouTube / Reddit / `maxforlive.com` listing / referral | "What is this?" | Hero + 5 sec of video |
| 2. Interest | Landing sections 2–3 | "Is this for me?" | Pain + promise |
| 3. Decision | Sections 4–6 | "Worth $39?" | Bundle + ICP + full demo |
| 4. Action | Gumroad checkout | "Safe to pay?" | Gumroad's reputation handles this |
| 5. Onboarding | Email with download + Quickstart PDF + first-launch video | "How do I install?" | 5-step quickstart with screenshots |
| 6. Retention | Newsletter + in-device update notification | "What's new?" | Email on release + indicator inside the device |

## 8. Distribution channels

### 8.1 Channel mix

- **YouTube** — primary content channel. One promo/demo video at launch, then ~1 short video per month. Same video repurposed: full version for landing, alt edit for YouTube, 30-sec cuts for IG/TikTok/Reels (one-piece-of-content → three-channel reach).
- **Communities** — Reddit (`r/ableton`, `r/abletonlive`), Discord servers (Ableton Producers, Max for Live community, Novation user groups), Facebook groups (LCXL Users, Ableton Live Users Worldwide). Posting style: useful-content first, soft mention of the product.
- **maxforlive.com** — directory listing with link to landing.
- **Instagram** — brand visiting card, tile-format updates and short clips. Learning curve accepted as part of launch effort.
- **Affiliate / blogger outreach** — *deferred* until product is fully polished. Once landing is live with strong demo video, the user is open to reactive engagement (responding to bloggers who reach out) but not active outreach in v1.0.

### 8.2 SEO targets

`launch control xl mk3 max for live`, `lcxl mk3 ableton mapping`, `launch control xl mode switching`, `lcxl performance setup`.

## 9. In-device update mechanism (non-negotiable)

User explicitly flagged this as a must-have for Phase 0. Implication: shipped copies of v1.0 must have the update-check infrastructure, otherwise reaching early customers depends entirely on email reach.

### 9.1 Server side

- Static JSON endpoint at `fadercraft.com/api/version.json`:
  ```json
  { "latest": "1.6", "url": "https://fadercraft.com/update", "changelog": "Bug fixes and CC44 added to passthrough." }
  ```
- Page `fadercraft.com/update` — user enters Gumroad license key, server verifies via Gumroad License API, returns latest `.amxd` for download.

### 9.2 In-device side

Inside `XL_Performance.amxd`:

- `live.text` displaying current version in UI corner.
- "Check for update" button → `[js update_check.js]` issues `GET /api/version.json`.
- On detection of newer version: indicator dot next to button, tooltip "Update v1.6 available", "Open in browser" link to `fadercraft.com/update`.
- Optional opt-in anonymous heartbeat — weekly ping to `/api/version.json` with no PII, used for install-base counter.

### 9.3 Newsletter signup inside the device

Collapsible "📬 Release notes" element with single email field. Submit → POST to Buttondown/ConvertKit. Single field, no spam, no second step.

### 9.4 Newsletter stack

- **Gumroad built-in updates** — free, sends to all past customers. Used for "v1.X is live" releases.
- **Buttondown / ConvertKit / Substack** — for broader content (tips, community use cases, "coming soon"). Basic plan ~$9/mo.

### 9.5 Email cadence

- 1 email per release (4–8 week cadence)
- 1 monthly digest (tips, community use cases, work-in-progress)
- 1 launch email per new product in the line

## 10. Content production plan

### 10.1 Phase 0 — pre-launch (must-have)

**Brand & infrastructure**
- Logo + wordmark + 2 primary colors
- Register `fadercraft.com`, set up DNS, deploy static landing host (Vercel / Netlify)
- Set up Gumroad storefront `gumroad.com/fadercraft`
- Reserve Instagram handle (alt: `@fadercraft.studio` / `.audio` / `.dev`)

**Update-check infrastructure**
- Server: `fadercraft.com/api/version.json` published with v1.0 metadata
- Server: `fadercraft.com/update` page with Gumroad license verification
- Device: integrate `update_check.js` inside `XL_Performance.amxd`; add UI elements (version display, check button, indicator dot, browser-open link)
- Device: optional opt-in heartbeat
- Device: in-device newsletter signup field

**Product bundle**
- `XL_Performance.amxd` v1.0 with update-check integrated
- `solo_follower.js`
- `update_check.js`
- 14 Custom Modes for LCXL MK3 (Components export)
- Pre-mapped Live Set
- Documentation (PDF Quickstart + extended reference)

**Marketing assets**
- Landing page (single page, 9 sections per section 6 of this doc)
- 1 promo/demo video, 5 minutes (landing + YouTube)
- 5 short clips (30 sec each) for IG / TikTok / Reels
- 1 Quickstart PDF
- Posting copy drafts: Reddit, Discord, Facebook

**Newsletter pipeline**
- Newsletter provider account, embedded form on landing
- Double opt-in configured
- Welcome email written

### 10.2 Phase 1 — launch week

- YouTube channel created, demo video published
- Reddit posts (r/ableton, r/abletonlive)
- Discord posts in 3–5 servers
- Facebook group posts
- Newsletter goes live
- `maxforlive.com` listing submitted

### 10.3 Phase 2 — sustaining (months 1–3)

- 1 short YouTube video per month
- IG / TikTok cuts from main video (one-in-three approach)
- Active replies in comments and community threads
- Bug-fix / quality-of-life updates → release email + Gumroad update
- Collect feedback for v1.X

### 10.4 Phase 3 — after first update release

- Validate `update_check.js` against real-world install base
- Reactive bug fixing if heartbeat reveals environment issues
- Read install-base metrics (if heartbeat opted-in by enough users) to size the customer base for product-line decisions

## 11. Out of scope for v1.0

- Free / Lite tier (single SKU only)
- Non-LCXL controller support
- Affiliate program / blogger outreach (deferred)
- Multi-language documentation
- iOS / mobile companion
- Trial period or refund automation beyond Gumroad's defaults
- Future Fadercraft products (each gets its own spec → plan → implementation cycle)

## 12. Open questions

- Final decision on starter content pack inclusion (drum samples / synth presets) — resolves once production effort is scoped.
- Newsletter provider — Buttondown vs ConvertKit vs Substack. Decision on cost / DX trade-off pending.
- Instagram handle preference — `.studio` / `.audio` / `.dev` — resolved during Phase 0 by checking which is available and reads cleanest.
- Whether the demo video is screen-record + voice-over only, or includes the user on camera. User open to learning, not yet committed.

## 13. Next step

After user review of this spec:

1. Apply any requested edits.
2. Transition to `writing-plans` skill for an implementation plan that breaks Phase 0 into concrete, ordered tasks.
