---
type: site-copy
project: Fadercraft
created: 2026-05-25
updated: 2026-05-25
source_of_truth: Figma (file OdPRdjodGO3WiR6tgSP7AA)
---

# Site copy — Fadercraft landing

**Summary**: Backup of all textual content from the `fadercraft.com` landing page, captured per Figma section. Figma remains the canonical source — this file is a snapshot for offline review, content audits, and language-tooling (Vale, LanguageTool). When Figma and this file disagree, **Figma wins** — re-snapshot here.

**Conventions**:
- One section = one `##` heading. Sub-blocks under `###` (header, beats, captions).
- Each section block carries its Figma `node-id` and a deep link.
- Inline colour accents are marked with `{instrument}` (lavender/blue), `{mixer}` (mint), or `{accent-warm}` (orange) tags so the palette mapping survives the copy-paste.
- Tooltips, button labels, and visual captions live in a separate sub-block per beat.

**Last synced**: 2026-05-25

---

## Section — Hero

- **Figma node**: `1602:7278` (master) — [open](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=1602-7278)
- **Page**: Product (05 — Product)
- **Section role**: 8-beat arc — Beat 1 "Hook + relevance".

### Header

- **Eyebrow** (`1666:8241`, two-tone):
  > `M4L DEVICE`{accent-warm}` FOR LCXL MK3`{/accent-warm}
- **H1** (`1602:7259`, two-tone):
  > Play your whole rig {mixer}**like a single instrument**{/mixer}
- **Subtitle** (`1666:8232`):
  > One action switches between instrument and mixer layers

---

## Section — Performance flow

- **Figma node**: `1745:7956` — [open](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=1745-7956)
- **Page**: Product (05 — Product)
- **Section role**: 8-beat arc — Beat 2 "How it works".

### Header

- **Eyebrow**: `ONE ECOSYSTEM`
- **H2**: `Performance flow`

### Beat 1 — Move between instruments and mixer

- **Figma node**: `1747:10564`
- **H3**: `Move between instruments and mixer instantly`
- **Body**:
  > Modes {instrument}**1-10 control your instruments**{/instrument}, {mixer}**11-14 – your mixer.**{/mixer} One hotkey jumps between both sides instantly, returning you to the exact page you left.
- **Visual caption**: `To previous instrument`

### Beat 2 — Two encoder layers per channel

- **Figma node**: `1747:10608`
- **H3**: `Two encoder layers per channel`
- **Body**:
  > Two encoder banks per channel give you 6 controls instead of 3 — without breaking muscle memory.

### Beat 3 — Momentary or toggle switching

- **Figma node**: `1747:10929`
- **H3**: `Momentary or toggle switching`
- **Body** (two lines):
  > Hold for temporary access.
  >
  > Turn to stay on the layer.
- **Visual tooltip**: `Works on Hold`

### Beat 4 — Run the whole rig from the keyboard

- **Figma node**: `1747:11079`
- **H3**: `Run the whole rig from the keyboard`
- **Body**:
  > Switch modes without leaving the keyboard.

---

## Section — Who it's for

- **Figma node**: `1745:7950` — [open](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=1745-7950)
- **Page**: Product (05 — Product)
- **Section role**: 8-beat arc — Beat 4 "Fit / ICP self-identification".

### Header

- **Eyebrow**: `FOR YOU, SPECIFICALLY`
- **H2**: `One workflow across performance and production`

### Article 1 — Live performer

- **Figma node**: `1745:7936`
- **H3**: `Live performer`
- **Body**:
  > Quickly peek into another layer, or switch to it permanently when needed. Momentary and toggle switching make transitions fast and predictable.

### Article 2 — Studio producer

- **Figma node**: `1745:7943`
- **H3**: `Studio producer`
- **Body**:
  > Move between writing, sound design and mixing with a single button — without breaking the flow of the session.

### Article 3 — New LCXL owner

- **Figma node**: `1745:7949`
- **H3**: `New LCXL owner`
- **Body**:
  > Open a ready-to-play Live Set with preconfigured mappings and an interactive walkthrough of the full system.

---

## Section — FAQ

- **Figma node**: `355:3014` (FAQSection, expanded state) — [open](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=355-3014)
- **Page**: Product (05 — Product)
- **Section role**: 8-beat arc — Beat 6 "Soft objections".

### Header

- **Eyebrow**: `FAQ`
- **H2**: `Last questions before you buy.`

### Items

1. **Q** (`334:214`): `Does this work with the LCXL MK1 or MK2?`
   **A**:
   > No — MK3 only. Earlier models use a different mode-switching architecture; the kit relies on CC30/ch7 control, which the MK3 introduced.

2. **Q** (`334:224`): `Will this work with my existing Live Sets, or only the included starter set?`
   **A**:
   > Drop XL_Performance.amxd into any existing Live Set — it reads your track layout immediately. The starter set demonstrates the workflow — not replace your project.

3. **Q** (`334:232`): `Will this overwrite my current Custom Modes on the controller?`
   **A**:
   > Modes 1–10 keep your mappings — only the layer-jump button (CC47) gets rewritten. Modes 11–14 are overwritten with the mixer layout. Modes 15–16 are left untouched. Back up modes 11–14 in Components if you want them.

4. **Q** (`334:238`): `Does this need Max for Live?`
   **A**:
   > Yes — it ships as an .amxd device. If your Live edition includes M4L, you're set.

5. **Q** (`334:244`): `Licensing?`
   **A**:
   > One key, three activations. Files are watermarked with your email at download.

6. **Q** (`334:250`): `How do I get updates after purchase?`
   **A**:
   > Gumroad sends a download link to your email whenever a new version is released. No subscription, no separate app.

7. **Q** (`1548:351`): `Where do I report a bug or ask a question?`
   **A**:
   > Email [report@fadercraft.com](mailto:report@fadercraft.com). Response within 48 hours on working days.

---

## Section — Requirements

- **Figma node**: `355:2899` (RequirementsSection) — [open](https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL?node-id=355-2900)
- **Page**: Product (05 — Product)
- **Section role**: 8-beat arc — Beat 7 "Final hard checkpoint".

### Header

- **Eyebrow**: `TECH REQUIREMENTS`
- **H2**: `Will it run for you?`

### Spec rows

| Label | Value | Figma node |
|---|---|---|
| Ableton | `Live 11+ — Suite, or Standard + M4L add-on` | `337:253` |
| Max for Live | `8.5 or newer` | `337:256` |
| Hardware | `Novation Launch Control XL MK3` | `337:262` |
| Mode loading | `Novation Components` | `337:265` |
| Operating system | `macOS or Windows — wherever Live 11 or 12 runs` | `337:259` |
