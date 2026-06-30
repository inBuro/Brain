---
type: marketing-copy
project: Fadercraft
surface: gumroad
created: 2026-06-26
updated: 2026-06-27
store: https://fadercraft.com (Gumroad)
---

# Gumroad — Sends Follower: Product Description, Receipt & Bundle Copy

**Summary**: Copy for the Gumroad listing of Fadercraft **Sends Follower** ($14, Utility tier) — product page, post-purchase receipt note, and the bundle "What's included" summary. Modeled on the [[gumroad-description]] (Control XL) structure. Body copy mirrored from the locked site page (`app/src/pages/SendsFollowerPage.tsx`, Figma `SendsFollower` 2505:17290) and the [[project_sends_follower_bundle_doc|bundle helper doc]].

> **Status (2026-06-27):** copy locked against the [[sends-follower-vo-script|VO script]] and re-aligned to the voice guide. Decisions in: licensing = one key / 3 activations (mirrors Control XL, unenforced); bundle = two devices + Quick Start Guide, **no demo .als** (Kirill will flag if that changes); WHO IT'S FOR section **cut**; bundled doc renamed Readme → **Quick Start Guide** (setup only — no effects-mapping promise in the listing). Remaining gate before publish: SF demo video + a final Vale/LanguageTool pass.

> **VERIFIED LIVE 2026-06-30** (Kirill's paste + browse scrape of the published listing): §1 was confirmed to match the live listing verbatim, so this section is the canon for cross-surface consistency (VO ↔ site ↔ Gumroad). **Two pending live edits — the doc is now ahead of the live listing:**
> 1. **Behavior line updated to new canon** (`Instead of increasing the send level, you're shaping the effect's behavior.`) — the **live listing still shows the old line** (`adding more effect… shaping its behavior`); re-edit on Gumroad. Matches site + VO.
> 2. **REFUNDS** is NOT in the description body by design — it lives in **Gumroad's separate refund-policy section** (Kirill, 2026-06-30). The block below is kept here as the canonical refund copy for that section. Resolved, no longer a delta.

**Last updated**: 2026-06-30

---

## 1. Product page description

Sends Follower turns send levels into modulation sources · Max for Live
· The louder a track sends, the more it moves
· One source can control up to 8 parameters, each with its own range and polarity
· Two devices: follow one track's send, or an entire return bus
· Drop it on a track or a return, map it, and play
· Max for Live — works in any Live 11 or 12 project

────────────────────────────
**WHAT IT DOES**

Instead of increasing the send level, you're shaping the effect's behavior. Sends Follower turns send levels into modulation sources. One source can control up to 8 parameters, each with its own range and polarity.

Two devices, two ways to work:

**Track** — follows the send amount of a single track. Choose Send A, B, C, or D. Or switch to Manual for mouse or MIDI control.

**Return** — follows the activity of an entire return bus. Peak mode follows the highest send. Total mode follows the combined activity of every track sending to that bus.

────────────────────────────
**WHAT'S IN THE BUNDLE**

• Sends Follower – Track — follows one track's send (Send A/B/C/D, or Manual)
• Sends Follower – Return — follows an entire return bus (Peak or Total)
• Quick Start Guide — setup instructions
• Free v1.x updates via Gumroad

────────────────────────────
**REQUIREMENTS**

• Ableton Live 11 or 12 — Suite, or Standard with the Max for Live add-on
• Max for Live 8.5 or newer
• No controller required — works with any send fader; Manual mode takes any MIDI source
• macOS or Windows — wherever Live 11 or 12 runs

────────────────────────────
**LICENSING**

One license key. Up to 3 activations across your machines.

────────────────────────────
**UPDATES & SUPPORT**

Gumroad emails a new download link whenever a new version ships. No subscription. The device includes a built-in update checker.

Stuck, or found a bug? support@fadercraft.com — replies within 48 hours.

────────────────────────────
**REFUNDS** *(lives in Gumroad's separate refund-policy section, not the description body — canonical copy for that field.)*

Refunds within 14 days if it doesn't work as described. Email support@fadercraft.com with your license key and what went wrong. Full policy: https://fadercraft.com/refund.

---

## 2. Post-purchase receipt ("Plain Text" content note)

> **Note:** Gumroad's "Custom message" field is hard-limited (~500 chars) — this is the minimal version that fits. Full WHAT'S INSIDE / UPDATES / SUPPORT detail lives in the bundled Quick Start Guide and the product description, not here.

Welcome to Fadercraft Sends Follower.

QUICKSTART
1. Drop Sends Follower – Return onto a return track (or – Track onto a regular track).
2. Add the effects you want to move — reverb, filter, delay.
3. Map the device to those parameters — up to 8, each with its own range and polarity.
4. Play. As tracks send, the parameters move with the mix.

Full guide is in the Quick Start Guide. Support: support@fadercraft.com

---

## 3. Bundle "What's included" (short)

WHAT'S INCLUDED
• Sends Follower – Track — follows one track's send (Send A/B/C/D, or Manual)
• Sends Follower – Return — follows an entire return bus (Peak or Total)
• Quick Start Guide — 1-minute setup

Open the Quick Start Guide first — drop the device on a return, map it, and play.

More at fadercraft.com · discord.gg/EBsdgst3jU

---

## Open / TBD

- Demo `.als` — not shipping for now (Kirill, 2026-06-26). Revisit if added; it would mirror the Control XL Demo set and de-risk the "buyers don't find the mapping" onboarding gap.
- No SF demo video yet — site `VideoSection` renders a placeholder; Gumroad listing can ship without it but a 30–60s demo would carry this device.
- Run Vale + LanguageTool on the final English before publishing.
- Site `signals → sources` term swap applied locally (`SendsFollowerPage.tsx` + `seo-meta.mjs`), 2026-06-27 — not yet deployed.

## Related pages

- [[gumroad-description]] — Control XL listing this is modeled on
- [[project_sends_follower_bundle_doc]] — the bundle helper doc (source for effects list)
- [[copy-inventory]] — copy analysis hub
- [[reference_fadercraft_discord]] — existing server reused for SF support
