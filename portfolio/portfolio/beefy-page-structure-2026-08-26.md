# Beefy case — page structure & CSS/JS map

Resumption doc for working on the live Beefy case page. Code lives in
`~/Projects/Projects/portfolio/` (repo `kirill-bush-portfolio` / in-buro.com),
not in this workspace — this file is the map back into it.

> Naming note: the site's own asset is `assets/bifi-cmc-1y.webp` — BIFI is
> Beefy's token ticker, not the unrelated `bifi/` Figma project in `~/Brain`.
> "Бифи"/"Bifi" said about this portfolio means this case.

See `~/Projects/Projects/portfolio/ARCHITECTURE.md` for site-wide gotchas
(cascade order, dev server, deploy) — this file only covers what's specific
to the Beefy case.

## Files

| File | Scope |
|---|---|
| `works/beefy/index.html` | This case only — content, section structure |
| `works/beefy/assets/` | Images/video for this case only |
| `works/case.css` | **Shared** across every case (`marketguard`, `finchtrade-next`, `beefy`, …) — layout, typography, tables, `.case-figure` zoom target styling |
| `works/case.js` | **Shared** — chapter rail, table drag-to-pan, caption line-balancing, gallery carousel, scroll-swap, image zoom (vendored `medium-zoom.js`) |
| `ARCHITECTURE.md` | Site-wide: Webflow export gotchas, cascade order, dev server (`live-server`, not `vite`), deploy command |

(All paths above relative to `~/Projects/Projects/portfolio/`.)

A fix in `case.css`/`case.js` lands on every case page at once — check the
other cases aren't relying on old behavior before changing shared rules.

## Page structure (`<section class="case-section" id="...">`)

1. `#context` — Контекст
2. `#role` — End-to-end дизайн продукта (includes the hero stats row: 202
   components, 12k MAU, 43 features)
3. `#boosts` — Бусты
4. `#filters` — Фильтры, сортировка и поиск (Точка отсчёта / Результаты split)
5. `#zap` — Кросс-чейн ZAP и продуктовая модель
6. `#market` — Продукт под давлением рынка

The chapter rail (`.case-toc`, built by `case.js`) auto-derives its entries
from these `<h2>`/`<h3>` headings — no separate nav list to maintain.

## `.case-figure` variants used on this page

`case.js`'s image zoom only binds to `.case-figure img` — anything NOT
wrapped in `.case-figure` stays un-zoomable on click. Variants seen here:

- `.case-figure field` — plain screenshot, standard case-image treatment
- `.case-figure field is-rounded` — extra corner radius
- `.case-figure gallery field is-dark` / `is-light` — carousel (`case.js`
  turns `.gallery-slide` children into a swipeable set)
- `.case-figure gallery field hero-gallery is-dark` — the hero's carousel variant

## Beefy-only CSS: `.flow-diagram-test` (case.css ~line 1293)

The ZAP six-step flow screenshot (`assets/zap-flow-diagram-test.webp`) is
**deliberately not** `.case-figure` — kept out of the zoom binding on purpose
(it's a wide diagram, not a single screenshot worth zooming).

The image's own artwork bakes in extra canvas around the connector arrows,
so it needs manual oversizing to make the card content fill the same visual
width as sibling screenshots:

```css
.flow-diagram-test { margin: 32px 0 40px; overflow: visible; }
.flow-diagram-test img {
  display: block;
  width: 104.5%;       /* scales past the container so the empty canvas
                           strip Figma left around the arrows exits the
                           viewport, while card content stays flush */
  max-width: none;      /* MUST override the vendor Webflow reset —
                           `img { max-width: 100% }` at line ~240 of
                           portfolio-*.webflow.shared.*.css loads before
                           case.css and silently caps width otherwise.
                           `!important` on `width` would NOT fix this —
                           max-width always wins over width regardless of
                           specificity; the override has to target
                           max-width itself. */
  height: auto;
  border-radius: 8px;
  margin-left: -12px;   /* shifts the crop so the left edge stays flush too */
}
@media screen and (max-width: 767px) {
  .flow-diagram-test img { width: 100%; margin-left: 0; }  /* full image, no crop, on mobile */
}
```

Cache-busting: `case.css` is linked from this page as `case.css?v=2` (not
just `case.css`) — it had no version query param at all before, so a CSS
change could sit invisibly stale in a browser tab. Asset images use the
same pattern (`zap-flow-diagram-test.webp?v=7`, bump the number on any
re-export). Bump `?v=N` on `case.css` too if a future shared-file change
needs to force a refetch.

Source image lives in Figma file **"Beefy – Portfolio"**
(`gQyoGCwxV0caGmfLM8lM9f`), node `111:29380` — re-export via the REST
`images` endpoint (`scale=2`, `format=png`), convert to webp
(`cwebp -q 90`), overwrite the asset, bump `?v=N`.

## Copy source of truth

Full-text mirror lives in Notion, page **"🐄 Beefy.finance"** under
"📋 Копирайт сайта". Direction is one-way per task, never assumed:

- "подтяни изменения из Notion в вёрстку" → Notion is read-only, site gets
  written. Copy text **exactly** as it stands in Notion, typos included —
  flag typos in chat, never silently auto-correct during a pull.
- Any other "actualize" phrasing → ask which side is source of truth before
  touching either one.

Review/audit findings for this case live in a separate Notion page,
**"🔍 Beefy Case — Review (Product / Hiring / Copy)"**.

## Open items as of 2026-08-26

- The ZAP six-step paragraph (`#zap`, first `<p>` after the h2) still reads
  the old "перевести активы через бридж" wording. A corrected version was
  drafted with the user (understand target vault's network → understand
  where your own asset is → pay gas and exit the vault → start a new
  deposit → pay gas again) but never confirmed as applied to Notion or the
  site — needs "куда вносить?" answered before touching either.
- The Notion "🐄 Beefy.finance" mirror is stale relative to the live site
  (doesn't yet reflect the `.flow-diagram-test` sizing work or the pending
  six-step rewrite above).
