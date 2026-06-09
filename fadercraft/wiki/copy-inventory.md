---
type: copy-inventory
project: Fadercraft
created: 2026-06-10
updated: 2026-06-10
---

# Copy Inventory — all text surfaces

**Summary**: Single hub for analysing Fadercraft Control XL copy across every surface. The **landing strings below are a snapshot** pulled from the React code (the code stays the source of truth — re-snapshot after edits). Everything else links out to its own doc rather than duplicating it.

**Last updated**: 2026-06-10

---

## Surfaces that own their own doc (links, not copies)

- [[demo-video-script]] — VO / shooting script (canonical spoken copy + on-screen titles)
- [[youtube-video-description]] — YouTube description draft
- [[gumroad-description]] — Gumroad listing, receipt note, and bundle copy
- [[landing-narrative]] — landing psychological arc + beat→section mapping
- Spoken VO takes (verbatim, fed to TTS): `raw/demo-vo/1.txt … 6.txt`
- Rendered preview of takes + titles: `demo-video-titles.html` (repo root of Fadercraft Brain)

## VO takes (mirror of `raw/demo-vo/*.txt`, 2026-06-10)

1. This is a Live set powered by Fadercraft Control. Fourteen channels. Six controls each. Instant access throughout your project.
2. The whole set sits on two pages. Hold to peek at the other page and release to return. Turn the encoder to switch and stay.
3. The same interaction pattern carries across every channel. Each channel gives you six controls across two encoder banks. Hold to peek at the other bank and release to return. Turn the encoder to switch and stay. Every track and control stays within reach.
4. You've been mixing. Now play. One button drops you into the last instrument you touched — right where you left it. Press the button again, and you're back to the mixer on the exact page you were working on. Your workflow stays uninterrupted.
5. DAW Mixer and DAW Control are always within reach. Switch between native modes with a single hotkey — or any key you assign. The same mapping concept carries across pages, banks, and instrument jumps. You define how navigation works once, and it stays consistent under your fingers. Everything adapts to your workflow.
6. 14 channels. Six controls per channel. Designed for muscle memory. One workflow for production, mixing, and live performance. This is Fadercraft Control XL. Stay in the music.

---

## LIVE LANDING COPY — snapshot from `~/Projects/Claude/Fadercraft/app/src`

> Source of truth = the code. This is a read-only snapshot for analysis; re-pull after landing edits.

### Hero — `HeroProduct.tsx` (defaults)
- Eyebrow: **M4L DEVICE FOR LCXL MK3**
- Heading: **Play 14-channel rig like a single instrument**
- Body: *Mix, navigate, and perform from a single, consistent control surface*

### Mixer construction — `OneActionBetweenThem.tsx` (in-mockup labels)
- Mode labels: *DAW Mixer*, *DAW Control* (appear elsewhere mis-cased as "Daw"), *Custom Mode N*, *Custom Mode 1-10*, *Custom Mode 15 – Cue mode*
- Section labels: *Unmapped Controls*, *Instruments Layers*, *Cue Volume*, *Undo*, *Redo*, *To previous instrument*

### Performance flow — `PerformanceFlow.tsx`
- *Move between instruments and mixer instantly* — "11-14 – your mixer."
- *Two encoder layers per channel* — "Two encoder banks per channel give you 6 controls instead of 2 — without breaking muscle memory."
- *Momentary or toggle switching* — "Hold for temporary access. Turn to stay on the layer."
- *Run the whole rig from the keyboard* — "Map your keyboard to jump between instruments, mixer pages, and utilities without touching the mouse or your controller."

### Video section — `ProductPage.tsx` → `VideoSection`
- Eyebrow: **See the workflow** · Title: **In action** · (YouTube embed: UsJxPBdf568)

### ICP columns — `ProductPage.tsx`
- Eyebrow: **FOR YOU, SPECIFICALLY** · Title: **One workflow across performance and production**
- *Live performer*: "Quickly peek into another layer, or switch to it permanently when needed. Momentary and toggle switching make transitions fast and predictable."
- *Studio producer*: "Move between writing, sound design and mixing with a single button — without breaking the flow of the session."
- *New LCXL owner*: "Open a ready-to-play Live Set with preconfigured mappings and an interactive walkthrough of the full system."

### What's included — `ProductPage.tsx` → TheKitSection
- Eyebrow: **WHATS INCLUDED** *(missing apostrophe)* · Title: **Everything ready. Start immediately.**
- *M4L device*: "Drop into a track and start instantly."
- *15 Custom Modes*: "Instrument, mixer, and cue mappings for Launch Control XL."
- *Quickstart guide*: "Install and first-session walkthrough."
- *Starter Live set*: "Explore the workflow in a real Ableton project."

### FAQ — `ProductPage.tsx`
- Eyebrow: **FAQ** · Title: **Everything else you may want to know.**
- Q: Does this work with the LCXL MK1 or MK2? — A: No — MK3 only. Earlier models use a different architecture.
- Q: Will this work with my existing Live Sets…? — A: Drop XL_Performance.amxd into any existing Live Set — it reads your track layout immediately. The starter set demonstrates the workflow — not replace your project.
- Q: Will this overwrite my current Custom Modes…? — A: Modes 1–10 stay yours … Modes 11–14 are overwritten with the mixer layout, and mode 15 holds the cue layout for Prelisten.
- Q: Does this need Max for Live? — A: Yes — it ships as an .amxd device. If your Live edition includes M4L, you're set.
- Q: Licensing? — A: One key, three activations. Files are watermarked with your email at download.
- Q: How do I get updates after purchase? — A: The device shows a "New Version" label when an update is out, and Gumroad emails you a fresh download link…
- Q: Where do I report a bug…? — A: Email support@fadercraft.com. Response within 48 hours on working days.

### Tech requirements — `ProductPage.tsx`
- Eyebrow: **TECH REQUIREMENTS** · Title: **Will it run for you?**
- Ableton: Live 11+ — Suite, or Standard + M4L add-on · Max for Live: 8.5 or newer · Hardware: Novation Launch Control XL MK3 · Mode loading: Novation Components · OS: macOS or Windows — wherever Live 11 or 12 runs

### Newsletter — `NewsletterSection.tsx` (defaults)
- CTA: **Buy on Gumroad • $39** · Title: *Subscribe for curated updates* · Placeholder: *join@updates.com* · Submit: *Join updates*

### Footer — `FooterFull.tsx`
- Wordmark: **Control XL** · Products list still says **XL Performance**
- Community: Discord (discord.gg/EBsdgst3jU) · YouTube (@fadercraft) · Instagram (@fadercraft_) · Contact (support@fadercraft.com)

## Related pages

- [[demo-video-script]] / [[youtube-video-description]] / [[landing-narrative]]
- [[roadmap]]
