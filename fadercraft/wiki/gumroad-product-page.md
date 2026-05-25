---
type: product-page-draft
project: Fadercraft
product: Control XL
created: 2026-05-25
updated: 2026-05-25
source_of_truth: this file (until paste into Gumroad UI)
gumroad_url: https://fadercraft.gumroad.com/l/control-xl
slug: control-xl
---

# Gumroad product page — Fadercraft Control XL

**Summary**: Draft текстового контента для страницы продукта на Gumroad. Сюда пишем; на Gumroad — копи-пастим. После публикации Gumroad-страница становится source of truth для конечного покупателя; этот файл остаётся версионированным черновиком и архивом ревизий.

**Voice**: следует [[tone-of-voice]] — mechanic-first, two-beat rhythm, numbers explicit, no vague amplifiers.

**Related**: [[site-copy]] (landing copy), [[roadmap]] (Gumroad onboarding tracker), [[novation-xl]] (product hub).

---

## 1. Title

`Fadercraft Control XL`

## 2. URL

- **Public**: https://fadercraft.gumroad.com/l/control-xl
- **Slug**: `control-xl` (заменил legacy `xl-performance` до publish)

## 3. Tagline (≤140 chars)

> M4L device for the Launch Control XL MK3. Play your whole rig like a single instrument — one button switches instruments and mixer.

## 4. Long description

```
Play your whole rig like a single instrument.
M4L device for Novation Launch Control XL MK3.

────────────────────────────────────────────

WHAT IT DOES

Modes 1–10 control your instruments. Modes 11–14 become a dedicated mixer.
One hotkey jumps between both sides, returning you to the exact page you left.

Two encoder banks per channel give you 6 controls instead of 3 — without
breaking muscle memory.

Hold a button to preview the next layer. Turn the encoder to stay there.

Switch modes without reaching for the controller.

────────────────────────────────────────────

WHO IT'S FOR

Live performer — peek into another layer, or switch permanently when needed.
Momentary and toggle switching make transitions fast and predictable.

Studio producer — move between writing, sound design and mixing with a
single button, without breaking the session flow.

New LCXL owner — open a ready-to-play Live Set with preconfigured
mappings and an interactive walkthrough.

────────────────────────────────────────────

WHAT'S IN THE BUNDLE

• Control XL.amxd — the Max for Live device
• 14 preconfigured Custom Modes for the LCXL MK3 (mixer + instruments)
• XL_Performance_starter.als — Live Set with mappings and content
• Quickstart guide (PDF + Markdown)
• Free updates for life via Gumroad

────────────────────────────────────────────

REQUIREMENTS

• Ableton Live 11 or 12 — Suite, or Standard with the M4L add-on
• Max for Live 8.5 or newer
• Novation Launch Control XL MK3
• Novation Components (browser app) for mode loading
• macOS or Windows — wherever Live 11 or 12 runs

Not compatible with LCXL MK1 or MK2 — they use a different mode-switching
architecture.

────────────────────────────────────────────

LICENSING

One license key. Up to 3 activations across your machines.
Files are watermarked with your email at download.

────────────────────────────────────────────

UPDATES & SUPPORT

Gumroad emails a download link whenever a new version ships. No subscription.
Bug reports and questions: report@fadercraft.com — response within 48 hours
on working days.
```

## 5. Price

- **$39 USD** one-time, no subscription
- Возможные варианты по skill-mix:
  - `$29` early-bird (первые N покупок или до релиза 1.1)
  - `$49` стандарт (без купона) — если хочешь оставить $39 с купоном

## 6. Categories & tags (для Gumroad discovery)

- **Category**: `Music & Audio` → `Ableton Live` или `Plugins & Software` (выбрать)
- **Tags**: `Ableton Live`, `Max for Live`, `M4L`, `Novation`, `Launch Control XL`, `LCXL`, `MIDI controller`, `live performance`, `mixer`, `mapping`

## 7. Cover image brief

1280×720 PNG. Композиция: LCXL MK3 в кадре + наложение Ableton mixer/devices UI; акценты `mixer` (mint), `instrument` (lavender), `accent-warm` (orange) — те же токены, что в [[site-copy]]. На обложке H1: «Play your whole rig like a single instrument» + Fadercraft mark. Спецификацию обложки делает T3 Brand identity.

## 8. Featured video

Hero loop video (8 sec, T9 — `web/assets/hero-loop.mp4`) + полный demo на YouTube `@Fadercraft` — оба можно подключить как Featured video после T9.

## 9. Receipt-email override

Кастомный receipt должен содержать:
- License key
- Download link
- Ссылку на Quickstart (`fadercraft.com/quickstart`)
- Ссылку на support: `report@fadercraft.com`
- Newsletter opt-in (когда T11 Buttondown готов)

## 10. Refund policy

Gumroad default — 30-day money-back. Наш текст в `web/refund.html` (~310 слов) — проверить консистентность с настройкой Gumroad перед publish.

---

## Open questions / blockers

1. **Категория Gumroad**: `Ableton Live` vs `Plugins & Software` — выбрать.
2. **`report@fadercraft.com`** не настроен в CF Email Routing (есть `hello@`, `support@`, `noreply@`, catch-all). Либо добавить route, либо в копи заменить на `support@`.
3. **«3 activations»** в копи — реально проверяется в `verify-license.js`? Если нет — либо реализовать enforcement, либо снять обещание из копи.
4. **Cover image** ждёт T3 Brand identity (logo + palette + social tiles).
5. **Featured video / Hero loop** ждут T9 Demo video production.
6. **Bundle zip upload** ждёт T12 Bundle assembly (Custom Modes JSON + .als starter + dist/ + zip).

## Revisions

- 2026-05-25 — initial draft based on [[site-copy]] (Performance Flow + Who it's for + FAQ + Requirements sections) and [[tone-of-voice]].
