# Tokens — Typography

Обновлено: 2026-05-22
Источник: `/Users/Kirill/Projects/Claude/Fadercraft/app/src/tokens/typography.ts`

## Семейства

| Family | Stack |
|---|---|
| `--font-display` | `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif` |
| `--font-body` | `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif` |

Обе переменные указывают на DM Sans. Разделение display/body намеренно сохранено как семантика.

## 19 канонических стилей (кодовая + Figma сторона)

Все значения size/line выражены через density-переменные (не raw px).
letterSpacing — абсолютные px (из Figma variable_defs), кроме `heading/product` (нет данных, em).

| Style | size | line | weight | extra | size→density | line→density |
|---|---|---|---|---|---|---|
| `heading/hero` | 48 | 62 | 700 | letter-spacing **-0.9px** | `var(--12)` | `var(--15-5)` |
| `heading/section` | 40 | 50 | 700 | letter-spacing **-1px** | `var(--10)` | `var(--12-5)` |
| `heading/product` | 36 | 42 | 700 | letter-spacing -0.01em (нет Figma TS данных) | `var(--9)` | `var(--10-5)` |
| `heading/compact` | 28 | 34 | 700 | letter-spacing **-1px** | `var(--7)` | `var(--8-5)` |
| `heading/title` | 20 | 30 | 700 | — | `var(--5)` | `var(--7-5)` |
| `body/regular` | **20** | **30** | 400 | — | `var(--5)` | `var(--7-5)` |
| `body/medium` | 18 | 26 | 400 | — | `var(--4-5)` | `var(--6-5)` |
| `body/sm` | 17 | 25 | 400 | code-side only (no named Figma TS) | `var(--4-25)` | `var(--6-25)` |
| `body/compact` | 16 | 24 | 400 | — | `var(--4)` | `var(--6)` |
| `price` | 24 | 30 | 700 | — | `var(--6)` | `var(--7-5)` |
| `caption` | 14 | 20 | 400 | letter-spacing 2px | `var(--3-5)` | `var(--5)` |
| `eyebrow` | 14 | 20 | 700 | letter-spacing **3.6px**, uppercase | `var(--3-5)` | `var(--5)` |
| `eyebrow/sm` | 12 | 16 | 700 | letter-spacing 3px, uppercase | `var(--3)` | `var(--4)` |
| `label/lg` | 20 | 28 | 600 | — | `var(--5)` | `var(--7)` |
| `label/md` | 17 | 24 | 600 | — | `var(--4-25)` | `var(--6)` |
| `label/md-strong` | 17 | 24 | 700 | code-side only (inline bold on label/md in Figma) | `var(--4-25)` | `var(--6)` |
| `label/sm` | 14 | 20 | 600 | — | `var(--3-5)` | `var(--5)` |
| `label/xs` | 12 | 16 | 600 | — | `var(--3)` | `var(--4)` |
| `brand/logo-model` | 20 | 20 | 400 | line-height 1 (tight); brand namespace | `var(--5)` | `var(--5)` |

## Удалённые из кода (дропнуты 2026-05-15) — оставлены в Figma на чёрный день

Следующие 3 стиля были удалены из `typography.ts`, но **оставлены в Figma** (решение пользователя 2026-05-15: keep как маркетинговые/визуальные резервы).
NB: `Body/Medium` был возвращён в код 2026-05-22 как `body/medium` (применяется в Header/Footer).

| Style в Figma | состояние |
|---|---|
| `Heading/Display` (64/AUTO/Bold) | в коде нет, в Figma keep |
| `Heading/Subtitle` (20/AUTO/Regular) | в коде нет, в Figma keep |
| `Body/Large` (20/AUTO/Regular) | в коде нет, в Figma keep |

> Если кто-то из них начнёт использоваться в Figma в реальных секциях — возвращать в код. До этого момента — это «спящие» стили.

## Внеканонные стили в Figma (обнаружены 2026-05-22)

| Style | параметры | статус |
|---|---|---|
| `Body/Regular-Semibold` | 20/28/SemiBold | **мёртвый** — нигде не используется; кандидат на удаление |

`Body/Regular-Semibold` не входит в канон 15 стилей, не применяется ни в одной ноде. При желании — удалить. Пока не трогаем (нет явного решения пользователя).

## Hero.tsx — fluid font-size (не мигрируется)

В `/components/organisms/Hero/Hero.tsx` три inline `fontSize` как `clamp()`. Это намеренно — fluid typography для главного Hero не выражается через density-токены. Оставлены как есть.

## Figma-сторона — статус (2026-05-22)

Text Style bindings применены во всех мастер-компонентах через `setTextStyleIdAsync`.

### Canonical Figma Text Style параметры (из variable_defs, 2026-05-22)

| Style | size | lineHeight | weight | letterSpacing | source node |
|---|---|---|---|---|---|
| `Heading/Hero` | 5→48px? wait: `var(--12)`=48 | `var(--15-5)`=62 | 700 | -0.9px | 1434:6869, 1602:7278 |
| `Heading/Section` | `var(--10)`=40 | `var(--12-5)`=50 | 700 | -1px | 1540:6358 |
| `Heading/Compact` | `var(--7)`=28 | `var(--8-5)`=34 | 700 | -1px | 1540:6358 |
| `Heading/Title` | `var(--5)`=20 | `var(--7-5)`=30 | 700 | 0 | 329:4 |
| `Body/Regular` | `var(--5)`=20 | `var(--7-5)`=30 | 400 | 0 | 1666:8232 |
| `Body/Medium` | `var(--4-5)`=18 | `var(--6-5)`=26 | **500** | 0 | 484:860 |
| `Label/lg` | `var(--5)`=20 | `var(--7)`=28 | 600 | 0 | 33:7 |
| `Label/md` | `var(--4-25)`=17 | `var(--6)`=24 | 600 | 0 | 337:8 |
| `Label/sm` | `var(--3-5)`=14 | `var(--5)`=20 | 600 | 0 | 33:3 |
| `Label/xs` | `var(--3)`=12 | `var(--4)`=16 | 600 | 0 | 35:3 |
| `Caption` | `var(--3-5)`=14 | `var(--5)`=20 | 400 | 2px (`var(--0-5)`) | 53:22 |
| `Eyebrow` | `var(--3-5)`=14 | `var(--5)`=20 | 700 | 3.6px | 1523:4633 |

Не проверены из Figma (нет мастер-компонентов с TS binding): `Heading/Product`, `Body/Compact`, `Price`, `Eyebrow/sm`.

Text Style bindings применены во всех мастер-компонентах через `setTextStyleIdAsync`:

| Компонент/страница | Результат |
|---|---|
| Button (все 12 вариантов) | OK — Label/sm, Label/md, Label/lg |
| AccordionItem (closed + open) | OK — Heading/Title, Body/Regular |
| SpecRow | OK — Body/Regular, Label/md |
| Input | OK — Body/Regular |
| Badge (все 5 вариантов) | OK — Label/xs |
| TagChip | уже было — Caption |
| ModeButton | уже было — Heading/Title, Label/md |
| ICPColumns | уже было — Eyebrow, Heading/Section, Heading/Title, Body/Regular |
| FAQSection | уже было — Eyebrow, Heading/Product, Heading/Title, Body/Regular |
| NewsletterSection | уже было — Label/lg, Heading/Title, Body/Regular, Label/md |
| CatalogSection | уже было — Heading/Section, Heading/Title, Body/Regular, Label/sm |
| RequirementsSection | уже было — Eyebrow, Heading/Product, Body/Regular, Label/md |
| FAQAccordion | уже было — Heading/Title, Body/Regular |
| NewsletterSignup (inline + stacked) | уже было — Heading/Title, Body/Regular, Label/md |
| HeroProduct (все 4 варианта) | уже было — все нужные стили |
| PerformanceFlow desktop | body привязана к Body/Regular; иллюстративные ноды — не трогались |
| PerformanceFlow mobile | уже было; иллюстративные ноды — не трогались |
| FeatureBeat | body привязана к Body/Regular; иллюстративные ноды — не трогались |
| Header | уже было |
| Hero (05 — Product) | уже было |

Иллюстративные ноды (ModeGrid: `Control XL`, `MIXER`, `11`-`14`, `Mixer page`, `Encoder bank`, `Daw`, `Prelisten`; plugin tooltips с fractional px) — не трогались согласно условиям задачи.

### Исправления 2026-05-22 (по эталонному artboard 1540:6358)

- **`Body/Regular` Text Style lineHeight**: исправлен 28px → 26px (canonical `--6-5`). Каскадно обновил все ноды, привязанные к этому стилю.
- **PerformanceFlow.module.css `beatTitle`**: было raw 25px/30px → стало `var(--7)/var(--8-5)` = 28px/34px (Heading/Compact).
- **PerformanceFlow.module.css `beatBody`**: было raw 16px/23px → стало `var(--5)/var(--6-5)` = 20px/26px (Body/Regular).

### Исправления 2026-05-22 (CSS drift pass — module.css файлы)

10 правок в 7 файлах. Figma = source of truth.

| Файл | Класс | Было | Стало | Figma source |
|---|---|---|---|---|
| `AccordionItem.module.css` | `.answer` | `var(--4-25)/var(--6-25)` = 17/25px | `var(--5)/var(--7-5)` = 20/30px | Body/Regular, 1666:8232 |
| `SpecRow.module.css` | `.label` / `.value` | `var(--4-25)/var(--6-25)` = 17/25px | `var(--4-25)/var(--6)` = 17/24px | Label/md, 337:8 |
| `HeroProduct.module.css` | `.body` | `var(--4-25)/var(--6-25)` = 17/25px | `var(--5)/var(--7-5)` = 20/30px | Body/Regular, 1666:8232 |
| `ICPColumns.module.css` | `.eyebrow` | `letter-spacing: 4px` | `letter-spacing: 3.6px` | Eyebrow, 1523:4633 |
| `ICPColumns.module.css` | `.title` | `letter-spacing: -0.4px` | `letter-spacing: -1px` | Heading/Section, 1540:6358 |
| `PerformanceFlowTuned.module.css` | `.beatTitle` | `25px/30px` raw | `var(--7)/var(--8-5)` = 28/34px, `-1px` | Heading/Compact, 1540:6358 |
| `PerformanceFlowTuned.module.css` | `.beatBody` | `16px/23px` raw | `var(--5)/var(--7-5)` = 20/30px | Body/Regular, 1540:6358 |
| `ProductCard.molecules.module.css` | `.price` | `var(--5-75)` = 23px (нет в шкале) | `var(--6)/var(--7-5)` = 24/30px | `price` canonical style |
| `RequirementsSection.module.css` | `.cellLabel/.cellValue` | stale raw 18/26px (inline style= перебивал) | CSS очищен, inline style= primary | inline getTypographyStyle() |
| `CatalogSection.module.css` | `.cardBody p` | stale raw 18/26px | CSS очищен, inline style= primary | inline getTypographyStyle() |

~~Pending (Body/Medium resolution required)~~ — CLOSED 2026-05-22: Option A — добавлен `body/medium` в палитру, применён в `FooterFull.tagline` + `NewsletterSection`. Полная миграция CSS → палитра выполнена.

## Архитектура: palette-only (2026-05-22)

**Жёсткое правило:** типографика в коде применяется **только** через палитру `getTypographyStyle()`. В `.module.css` запрещены `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing`, `text-transform` на текстовых классах. Только color/margin/padding/background/layout.

- В TSX: `<p style={getTypographyStyle('body/regular')} className={styles.foo}>`
- Density vars (`var(--5)` etc.) живут **только внутри `typography.ts`**, не в компонентах.
- Если Figma applied Text Style отсутствует в палитре → сначала добавить в `typography.ts`, потом ссылаться. Никаких inline values в CSS.

**Исключения (документированы):**
- `clamp()` для fluid typography — остаётся в CSS как override над палитрой (Hero, HeroProduct, OneActionBetweenThem.title, RequirementsSection.title, FAQSection.title).
- Inline weight override на семантических `<strong>`-акцентах (`.instrumentsAccent`, `.mixerAccent`, `.bottomHeaderLabel`, etc.) — допустим как single-property override с комментарием `/* weight-only override on inline accent */`.

**Миграция 2026-05-22:** ~75 текстовых узлов в 19 компонентах переведены на палитру. Удалено 307 строк raw CSS (305 — orphan classes в `OneActionBetweenThem.module.css`, 2 — мёртвые классы в `PerformanceFlow.module.css`).

**Стоимость Figma-sync теперь:** одна правка в `typography.ts` → автоматический fanout. Никаких многофайловых патчей в CSS.

## Жёсткие правила (старые)

- В `typography.ts` — только density-переменные (`var(--X)`), никаких raw px.
- Тексты на сайте — только English.
- Figma TEXT-ноды → Text Style binding (не raw fontName + fontSize).

## Связанные файлы

- `tokens/density.md` — шкала с новыми ступенями `--8-5` и `--14`
- `MEMORY.md` — раздел «Горячие токены > Типографика»
