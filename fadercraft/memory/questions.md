# Open Questions & Tech Debt — Fadercraft

> Single source for unresolved decisions and items needing verification. Run any task through this list before starting.

Updated: 2026-05-22

---

## Design — new sections (2026-05-22)

- **"One rig, one instrument" + "Three players, one kit" — позиционирование в artboard (2026-05-22)** — Две новые секции созданы как standalone frames на странице `Images` (x=4590, вне artboard `1434:6869`). Нужно принять решение: (1) вставить их в artboard `1434:6869` на нужное место в нарративном порядке, (2) заменить ли черновик `06 Audience — DRAFT` (node `1434:6928`) на новую `Three players, one kit` или оставить оба. Текущий черновик `06 Audience` содержит иной copy (New LCXL owner / Studio producer / Live performer) vs новый (Live performer / Producer rehearsing live / DJ-style improviser). Требует выбора пользователя.
- **"One rig, one instrument" — иллюстрация (2026-05-22)** — Node `1725:9`, placeholder `2A2C3C` 480×400px. При наличии реальной иллюстрации — заменить fill на image.
- **"Three players, one kit" — иконки колонок (2026-05-22)** — Node `1727:19`, три icon-placeholder 40×40 `#414458`. Нужны реальные иконки или pictograms под каждый ICP тип.

## Landing copy — pending decisions

- **Hero section — missing on ProductPage** (2026-05-20) — Hero `Your LCXL has 16 modes.` удалён со страницы по решению пользователя. Нужно: найти какую-то существующую секцию (или сверстать новую), которая возьмёт на себя роль Hero. До этого ProductPage стартует прямо с `OneActionBetweenThem` без hero-якоря над ней. **Частично закрыто 2026-05-22** — `LandingPage (?p=landing)` использует `HeroProduct` на первой позиции. Promotion на `/` ожидает одобрения.
- **ExplainerSection illustrations — placeholder (2026-05-22)** — Beat 2.1 (State Memory) и Beat 2.2 (Page A/Page B) имеют `neutral-800` placeholder вместо реальных иллюстраций. Нужно: создать иллюстрации в Figma → перенести в React через `illustration` prop.
- **LandingPage → ProductPage promotion (2026-05-22)** — `LandingPage` (`?p=landing`) — preview-роут с новой сборкой (13 секций, два новых ExplainerSection блока, CatalogSection добавлен). Когда пользователь одобрит — заменить `ProductPage` или переключить роут по умолчанию.
- **ExplainerSection Figma master — migrate to ComponentSet (2026-05-22)** — два фрейма `1716:66` / `1716:73` на странице `07 — Illustrations`, не ComponentSet. При финализации — объединить в ComponentSet с пропом `Flip=false|true`.
- **Section order: OneActionBetweenThem before Hero (2026-05-22)** — В `LandingPage` и `SkeletonPage` механика (OneAction) стоит до Hero — нарративный выбор. Требует подтверждения пользователя.
- **PerformanceFlow illustrations — polish pass** (2026-05-20) — секция (`organisms/PerformanceFlow`) подверстана по Figma `1541:4720` (mobile с per-beat иллюстрациями): beat-1 — зелёный Mode 11; beat-2 — 6 энкодеров 3×2; beat-3 — большой фиолетовый knob + фиолетовый Mode 11; beat-4 — 5 клавиш `O P {[ }] |`. Всё HTML/CSS, без растровых картинок. Открытые вопросы по визуальному соответствию Figma: (1) knob — сейчас простой SVG (круг + tick), Figma использует более стилизованную картинку — нужен ли pixel-parity или текущий вариант ок; (2) клавиатурные клавиши — упрощённый стиль (gradient + shadow), Figma даёт сложный набор radial-gradient'ов и soft-light blendов; (3) для beat-3 расположение knob/mode в Figma — knob top-right, mode bottom-left внутри 259×высота фрейма — текущий лейаут совпадает структурно, но без pixel-perfect позиционирования. Если нужна точность — углубить в pixel-parity.
- **Hero headline (Beat 1)** — flagged for full rewrite (user 2026-05-07: «мне он сейчас не нравится»). Current `Your LCXL has 16 modes.` is placeholder; full reframe expected, bigger than 14-vs-16 wording.
- **Beat 5 (Value stack)** — REWRITE PENDING in `landing-narrative.md`. 5 cards: M4L device, Custom Modes, Live Set, Quickstart, Demo video. Tone not yet aligned with new ToV.
- **Beat 8 (Action / CTA)** — REWRITE PENDING. Current `Ready to play all 16?` is placeholder; needs final closing CTA.

## Landing copy — verification needed

- **"5 minutes" install claim (Beat 1 body)** — is this measurable? Lock in a real install time or soften to «under 10 minutes».
- **FAQ #6 SLA («Response within 48 hours on working days»)** — provisional, accepted by user with «потом заменим, если что». Verify actual response capacity before launch.
- **FAQ #4 «watermark»** — confirmed by user as wording. Open: visible or hidden watermark? Email embedded in file metadata, in `.amxd` patcher, or in Live Set comments? Implementation TBD.
- **FAQ #2 modes 15–16** — answer says «left untouched». Confirm against actual device behaviour before publish.

## Product / pricing

- **Value stack price tags** — should each kit card show «$15 value» to total $75 → reframe $39 as a steal? Or this reads as bazaar?
- **«Why $39?» FAQ** — explain pricing? Risk: opens a can of worms. Currently kept out of top-6.

## Design system

- **Figma file rename** — `Novation XL` → `Control XL`. Not yet executed. Affects URL.
- ~~**Typography Figma-side sync**~~ — CLOSED 2026-05-22. All TEXT nodes in master components now bound to Text Styles via `setTextStyleIdAsync`. See Figma sync report below.
- ~~**Duplicate `Body/Regular` Text Style (2026-05-22)**~~ — CLOSED 2026-05-22. API audit confirmed: only 1 `Body/Regular` style exists. Previous report was incorrect.
- **`Price` style name capitalisation (2026-05-22)** — Figma style is named `Price` (capital P); code canonical name is `price`. Harmless mismatch but breaks lookup if case-sensitive. Rename Figma style to `price` to match code convention.
- **Primary device for landing** — desktop-first with mandatory mobile is assumed but not confirmed. Affects breakpoint priority.
- ~~**`Body/Medium` (18px/26px) — вернуть в канон или мигрировать? (2026-05-22)**~~ — CLOSED 2026-05-22. Option A: добавлен `body/medium` (var(--4-5)/var(--6-5)/400) в `typography.ts`, применён в `FooterFull.tagline` + `NewsletterSection.body`. Поузловая синка показала: FAQ.a и Newsletter.input реально 17/25 (новый `body/sm`), Newsletter.submit — 17/24 (`label/md`), не Body/Medium.
- ~~**`beatTitle` 25px/30px — нет в шкале (2026-05-22)**~~ — CLOSED 2026-05-22. Migrated to `heading/compact` (`var(--7)/var(--8-5)` = 28/34px, letter-spacing -0.01em) по эталонному artboard 1540:6358. CSS-файл `PerformanceFlow.module.css` обновлён.
- **`Body/Regular-Semibold` — статус уточнён (2026-05-22)** — Text Style присутствует в Figma (20/28/SemiBold). Применяется как **семантический концепт** на inline-акцентах `<strong>` в `PerformanceFlow` (`.instrumentsAccent` / `.mixerAccent` — выделения «1-10 hold your instruments», «11-14 – your mixer»). В коде реализован через weight-only override (наследует body/regular size+line + добавляет `font-weight: 600`). Сам Figma Text Style формально не назначен на эти ноды (binding отсутствует), но является эталонной ссылкой. **Open:** сделать ли явное palette-entry `body/regular-strong` (20/30/600) для совместимости с архитектурой palette-only, или оставить как weight-only override (документированное исключение).
- ~~**`body/regular` и `eyebrow` / heading letterSpacing — typography.ts sync (2026-05-22)**~~ — CLOSED 2026-05-22. Synced in `typography.ts`: `body/regular` 17/25 → 20/30px; `eyebrow` ls 4px → 3.6px; `heading/hero` -0.02em → -0.9px; `heading/section` -0.01em → -1px; `heading/compact` -0.01em → -1px.
- ~~**Inline typography drift in .module.css**~~ — FULL CLOSE 2026-05-22. Палитра-only архитектура внедрена: ~75 текстовых узлов в 19 компонентах переведены на `getTypographyStyle()`. Удалено 307 строк raw CSS. Все `font-*` / `line-height` / `letter-spacing` / `text-transform` вынесены из `.module.css` в палитру. Исключения (документированы): fluid `clamp()` и inline weight-only overrides на семантических акцентах. См. [tokens/typography.md](tokens/typography.md) раздел «Архитектура: palette-only».
- **`heading/product` letterSpacing — нет Figma Text Style данных (2026-05-22)** — В `typography.ts` оставлен `-0.01em` как fallback. Нет узла с привязанным TS `Heading/Product` в доступных мастер-компонентах. При появлении компонента с этим стилем — проверить через variable_defs и исправить на px.

## Process / infra

- **TODO — register `report@fadercraft.com` mailbox** (committed in FAQ #6). Pre-publish blocker: set up CF Email Routing alias `report@fadercraft.com` → `hellokbbureau@gmail.com` (same infra as T2 in roadmap.md). Verify deliverability before site goes live.
- **License key + 3 activations** — committed in FAQ #4. Implementation (Gumroad licensing API or external) not yet chosen.
- **Email watermark mechanism** — committed in FAQ #4. Build process for embedding buyer email into delivered files not yet defined.

## Design — PerformanceFlow Expanded variant

- **Beat-1 illustration scale vs text (2026-05-21)** — Иллюстрация `1556:8905` (зелёный Mode 11 pad, 286×122px) заметно короче текстовой колонки в beat-1. Три варианта: (1) принять как есть — маленький pad концептуально и по смыслу, (2) увеличить pad через scale override инстанса, (3) добавить декоративный контекст вокруг pad. Требует продуктового решения пользователя.
- **PerformanceFlow — компонент FeatureBeat не использован (2026-05-21)** — В DS есть компонент `FeatureBeat` (node `1534:314`). В expanded variant текст создан вручную через raw text nodes. При финализации — переключить на инстансы FeatureBeat для синхронизации с DS. Пока разумное решение для черновика.
- **Expanded variant не в ComponentSet (2026-05-21)** — Оригинал `1540:6358` живёт внутри ComponentSet `PerformanceFlow` (variants по breakpoints). Expanded variant создан как standalone frame вне ComponentSet, на той же странице `07 — Illustrations`. Если этот вариант выиграет — встроить в ComponentSet как новый variant или вынести в отдельный organism.

## Design — PerformanceFlow: 4 альтернативных варианта (2026-05-21)

Созданы на странице **Images**, правее Expanded variant. Ожидают выбора пользователя.

| Вариант | node-id | Концепция |
|---|---|---|
| Variant A: 2×2 Grid | `1648:102` | 4 равноправные карточки, 2 колонки |
| Variant B: Numbered Story | `1650:185` | 4 строки с номерами 01–04, разделители |
| Variant C: Hero-first | `1651:268` | beat-1 доминирует полной шириной, 2–4 компактом |
| Variant D: Spec-sheet | `1652:351` | 4 горизонтальных колонки, таблица |

- **Pending: выбор победителя (2026-05-21)** — После выбора пользователем: финализировать через FeatureBeat-компонент и встроить в ComponentSet. Оставшиеся 3 варианта — удалить или перевести в архивный фрейм.
- **Вертикальные разделители в Variant D** — не связываются с auto-layout `counterAxisSizingMode` корректно без `layoutGrow = 1` на самом col и fixed height на divider. При финализации — проверить pixel-perfect вручную.

## Resolved (kept for reference)

- ~~CC47 disclosure level~~ — 2026-05-07. CC47 not in first read; lives in expandable/tech section.
- ~~Knob doubling 6 vs 3~~ — 2026-05-07. Headline reads «Six controls per channel, not three.»
- ~~Tooltips on grey 15–16 pads~~ — 2026-05-07. No tooltip. Grey reads as «unused», any label would falsely imply hardware role.
- ~~Beat 2.3 Mid-set duplication~~ — 2026-05-20. Block dropped, unique ideas absorbed into Beat 4 Live performer column.
- ~~Tone of Voice~~ — 2026-05-20. Locked from Performance Flow section. See `memory/product/tone-of-voice.md`.
