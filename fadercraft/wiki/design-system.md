# Design System — Fadercraft / Control XL

**Summary**: Полный аудит дизайн-системы проекта Fadercraft (продукт Control XL; Figma-файл «Novation XL» — текущее имя файла, подлежит переименованию в «Control XL», file key `OdPRdjodGO3WiR6tgSP7AA`). Описание токенов, компонентов, страниц демо и состояния code-parity.

**Sources**: `raw/Light.tokens.json` (W3C DTCG export, источник истины для токенов), Figma MCP metadata nodeId `63:3`, `artifacts/figma-mirror.json` (back-sync артефакт, компонентный инвентарь), `app/src/tokens/tokens.css`, `app/src/tokens/typography.ts`, `app/src/pages/ProductPage.tsx`.

**Last updated**: 2026-05-15

---

## 1. Обзор дизайн-системы

### Продукт и назначение

DS обслуживает лендинг `fadercraft.com` для **Fadercraft Control XL** — Max for Live-утилиты под Novation Launch Control XL MK3 (физический контроллер). Лендинг — единственная целевая страница; 4 breakpoint-демо зафиксированы в Figma.

> Терминология: **Fadercraft** — бренд/проект. **Control XL** — название продукта (M4L-устройство). Старые имена «XL_Performance» / «Novation XL» (как наш проект) устарели и не используются. «Novation Launch Control XL MK3» — это физический контроллер от Novation, его имя не меняем.

### Страницы Figma-файла

> **Disclaimer**: Figma MCP не дал прямого доступа к страницам `01 — Tokens`, `02 — Atoms/Molecules/Organisms`, `03 — Demo`. Страница `04 — Organisms` (nodeId `63:3`) доступна через MCP; остальные — закрыты (файл не опубликован как library). Данные по компонентам ниже получены из `figma-mirror.json` (back-sync артефакт).

| ID | Название | Содержимое |
|---|---|---|
| `0:1` | 01 — Tokens | Таблица-референс токенов (swatches цветов, spacing, radius) |
| `25:2` | 02 — Atoms | Атомарные компоненты: Button, Badge, Avatar, Icon, Input, TagChip |
| `63:2` | 02 — Molecules | Молекулы: ProductCard, StatBlock, PullQuote, VideoCard, NewsletterSignup |
| `63:3` | 04 — Organisms | Организмы: Header, HeroProduct, OneActionBetweenThem, FeatureSlider, WhyChooseNovation, FeatureSplit, VideoSection, ICPColumns, CatalogSection, RequirementsSection, FAQSection, NewsletterSection, Footer |
| `25:3` | 03 — Demo | 4 breakpoint-сборки: 1440 / 960 / 640 / 360 |
| `23:55` | Images | Фото продукта (7 изображений 1280×1280 png; сохранены как Image fills) |

### Коллекции переменных Figma

Источник истины — `raw/Light.tokens.json` (W3C DTCG export). Файл содержит два корневых объекта: `Semantic` и `Primitives`.

| Коллекция | Статус | Примечание |
|---|---|---|
| Primitives (Colors) | Полная | Hue (12 цветов × 3 alpha), Lavender, Mint, Neutral, Red, Amber — все ступени с hex |
| Semantic (Colors) | Полная | Bg, Border, Action, Surface, Icon, State, Text — с маппингом на Primitives |
| Spacing | Из CSS | В JSON нет; данные из `tokens.css` / `figma-mirror.json` |
| Radius | Из CSS | В JSON нет; данные из `tokens.css` |
| Typography | **Отсутствует в Variables** | В Figma используются Text Styles (не переменные); JSON содержит только цвета |

---

## 2. Tokens

### 2.1 Colors — Primitives

Все значения из `raw/Light.tokens.json`.

#### Neutral (hue ~232°, cool grey — 12 ступеней + alpha)

| Токен | Hex | Назначение |
|---|---|---|
| `Neutral.00` | `#FFFFFF` | Белый (Text.OnDark.Primary, Bg белый) |
| `Neutral.50` | `#F9FAFA` | Светлый surface alt |
| `Neutral.100` | `#F1F1F4` | Surface / bg-surface |
| `Neutral.200` | `#DFE0E7` | Разделители, state-selected-text |
| `Neutral.300` | `#C6C8D2` | Placeholder, Text.OnDark.Secondary |
| `Neutral.400` | `#989BAE` | Text.OnDark.Tertiary |
| `Neutral.500` | `#70748F` | Text.OnLight.Tertiary |
| `Neutral.500-40` | `rgba(112,116,143,0.4)` | Overlay |
| `Neutral.600` | `#595C73` | — |
| `Neutral.700` | `#414458` | Text.OnLight.Secondary |
| `Neutral.800` | `#2A2C3C` | Border.Default, Surface.Service |
| `Neutral.900` | `#1B1C28` | — |
| `Neutral.1000` | `#0F1017` | Text.OnLight.Primary; Bg.Dark; Action.Dark; State.Selected.Background; Icon.Primary |

#### Mint (hue ~163°, brand accent — 9 ступеней + alpha-варианты)

| Токен | Hex |
|---|---|
| `Mint.50` | `#F6FEFC` |
| `Mint.100` | `#E8FCF7` |
| `Mint.100-44` | `rgba(173,255,214,0.44)` |
| `Mint.100-88` | `rgba(173,255,214,0.68)` |
| `Mint.200` | `#CCFAED` — **Action.Primary** (CTA fill) |
| `Mint.300` | `#A1F7DF` — Surface.Mixer |
| `Mint.400` | `#63F2CA` |
| `Mint.400-40` | `rgba(99,242,202,0.4)` |
| `Mint.500` | `#1AE5AC` |
| `Mint.500-40` | `rgba(26,229,172,0.4)` |
| `Mint.600` | `#16B688` |
| `Mint.700` | `#138665` |
| `Mint.800` | `#0E5843` |
| `Mint.900` | `#0A382B` |

#### Lavender (hue ~217°, blue — 9 ступеней + 500-40)

| Токен | Hex |
|---|---|
| `Lavender.50` | `#F6F9FE` |
| `Lavender.100` | `#E8F0FC` |
| `Lavender.200` | `#CCDEFA` — **Action.Secondary**, Surface.Instrument |
| `Lavender.300` | `#A1C2F7` — Surface.Instrument |
| `Lavender.400` | `#639AF2` |
| `Lavender.500` | `#1A68E5` |
| `Lavender.500-40` | `rgba(26,104,229,0.4)` |
| `Lavender.600` | `#1653B6` |
| `Lavender.700` | `#133F86` |
| `Lavender.800` | `#0E2A58` |
| `Lavender.900` | `#0A1C38` |

#### Red (hue 0° — 9 ступеней + 500-40)

| Токен | Hex |
|---|---|
| `Red.50` | `#FEF6F6` |
| `Red.100` | `#FCE8E8` |
| `Red.200` | `#FACCCC` |
| `Red.300` | `#F7A1A1` |
| `Red.400` | `#F26363` |
| `Red.500` | `#E51A1A` — accent/danger |
| `Red.500-40` | `rgba(229,26,26,0.4)` |
| `Red.600` | `#B61616` |
| `Red.700` | `#861313` |
| `Red.800` | `#580E0E` |
| `Red.900` | `#380A0A` |

#### Amber (hue ~30°, warm orange — 9 ступеней + 500-40 + root)

| Токен | Hex |
|---|---|
| `Amber.50` | `#FEFAF6` |
| `Amber.100` | `#FCF3E8` |
| `Amber.200` | `#FAE4CC` |
| `Amber.300` | `#F7CDA1` |
| `Amber.400` | `#FFAD56` — **Action.Tertiary**, Surface.Mute |
| `Amber.500` | `#E5831A` |
| `Amber.500-40` | `rgba(229,131,26,0.4)` |
| `Amber.600` | `#B66916` |
| `Amber.700` | `#864E13` |
| `Amber.800` | `#58340E` |
| `Amber.900` | `#38220A` |
| `Amber.$root` | `#FFAD56` — дублирует Amber.400 (legacy alias) |

#### Hue-palette (динамические цвета LCXL — 12 слотов × 3 alpha-варианта)

Используются для визуализации Custom Modes в PluginMockup. Не являются семантическими токенами DS.

| Слот | Hex base | Назначение |
|---|---|---|
| `Hue.01` | `#D86A07` | orange |
| `Hue.02` | `#8B8D1A` | olive |
| `Hue.03` | `#24BE30` | green |
| `Hue.04` | `#1FA9A9` | teal |
| `Hue.05` | `#945CFF` | purple |
| `Hue.06` | `#24BE30` | green (дубль 03) |
| `Hue.07` | `#FF3A96` | hot pink |
| `Hue.08` | `#F22DFF` | magenta |
| `Hue.09` | `#199BFF` | blue |
| `Hue.10` | `#808080` | placeholder grey |
| `Hue.11` | `#808080` | placeholder grey |
| `Hue.12` | `#FF3B90` | pink (≈ 07, чуть другой оттенок) |

Каждый слот имеет варианты `-40` (40% opacity) и `-70` (70% opacity). Hue.09 также имеет `09-40 X` (55% opacity — нестандартный шаг).

---

### 2.2 Colors — Semantic

Источник истины — `raw/Light.tokens.json`, раздел `Semantic`. Единственный мод: Light.

#### Bg

| Semantic токен | → Primitive | Hex | CSS var |
|---|---|---|---|
| `Bg.Default` | `Neutral.300` | `#C6C8D2` | `var(--color-semantic-bg-default)` |
| `Bg.Surface` | `Neutral.400` | `#989BAE` | `var(--color-semantic-bg-surface)` |
| `Bg.Dark` | `Neutral.1000` | `#0F1017` | `var(--color-semantic-bg-dark)` |

> Замечание: `Bg.Default → Neutral.300` (#C6C8D2) и `Bg.Surface → Neutral.400` (#989BAE) — это значительно тёмные тона для «светлого фона». Возможно, это переменные для тёмного режима UI-компонентов (тёмный surface в рамках Light mode), либо именование «Default/Surface» относится к другому контексту (например, input backgrounds на тёмном фоне). Требует проверки в визуальном контексте.

#### Border

| Semantic токен | → Primitive | Hex | CSS var |
|---|---|---|---|
| `Border.Default` | `Neutral.800` | `#2A2C3C` | `var(--color-semantic-border-default)` |

#### Action

| Semantic токен | → Primitive | Hex | CSS var |
|---|---|---|---|
| `Action.Primary` | `Mint.200` | `#CCFAED` | `var(--color-semantic-action-primary)` |
| `Action.Secondary` | `Lavender.200` | `#CCDEFA` | `var(--color-semantic-action-secondary)` |
| `Action.Tertiary` | `Amber.400` | `#FFAD56` | — (нет CSS var в JSON) |
| `Action.Dark` | `Neutral.1000` | `#0F1017` | `var(--color-semantic-action-dark)` |
| `Action.Dark.Text` | `Neutral.200` | `#DFE0E7` | `var(--color-semantic-action-dark-text)` |

> Важная правка по сравнению с предыдущей версией: `Action.Primary = Mint.200` (#CCFAED), а **не** Mint.400 (#63F2CA). Предыдущие записи в wiki и figma-mirror.json ошибочно указывали Mint.400 как CTA fill.

#### Surface (accent zones)

| Semantic токен | → Primitive | Hex | Назначение |
|---|---|---|---|
| `Surface.Service` | `Neutral.800` | `#2A2C3C` | Сервисные блоки (тёмный) |
| `Surface.Instrument` | `Lavender.300` | `#A1C2F7` | Зона инструментов LCXL |
| `Surface.Mixer` | `Mint.300` | `#A1F7DF` | Зона миксера LCXL |
| `Surface.Mute` | `Amber.400` | `#FFAD56` | Состояние mute |

#### Icon

| Semantic токен | → Primitive | Hex |
|---|---|---|
| `Icon.Primary` | `Neutral.1000` | `#0F1017` |

#### State

| Semantic токен | → Primitive | Hex |
|---|---|---|
| `State.Selected.Background` | `Neutral.1000` | `#0F1017` |
| `State.Selected.Text` | `Neutral.200` | `#DFE0E7` |

#### Text

| Semantic токен | → Primitive | Hex | Когда |
|---|---|---|---|
| `Text.OnLight.Primary` | `Neutral.1000` | `#0F1017` | Основной текст на светлом |
| `Text.OnLight.Secondary` | `Neutral.700` | `#414458` | Вторичный на светлом |
| `Text.OnLight.Tertiary` | `Neutral.600` | `#595C73` | Подписи, placeholder |
| `Text.OnDark.Primary` | `Neutral.00` | `#FFFFFF` | Основной текст на тёмном |
| `Text.OnDark.Secondary` | `Neutral.300` | `#C6C8D2` | Вторичный на тёмном |
| `Text.OnDark.Tertiary` | `Neutral.400` | `#989BAE` | Подписи на тёмном |

#### Темы / моды

Dark mode **не реализован**. Единственный мод — Light. Это сознательное решение, не упущение.

---

### 2.3 Typography

**В Figma Variables (JSON) типографики нет** — `raw/Light.tokens.json` содержит только цветовые токены. Типографика оформлена через **Figma Text Styles** (не прямой биндинг переменных).

**Шрифтовое семейство**: DM Sans (Google Fonts). История: Plus Jakarta Sans → Inter → Manrope → DM Sans (финальный). Стек: `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`.

**Веса**: 400 Regular / 500 Medium / 600 SemiBold / 700 Bold.

#### Text Styles в Figma (11 зарегистрированных)

| Figma Style | Size | Line-height | Weight |
|---|---|---|---|
| Heading/Hero | 48px | 56px | 700 |
| Heading/Product | 36px | 42px | 700 |
| Heading/Section | 40px | 50px | 700 |
| Heading/Title | 20px | 30px | 700 |
| Body/Regular | 18px | 28px | 400 |
| Price | 24px | 30px | 700 |
| Caption | 14px | 20px | 400 |
| Label/xs | 12px | 16px | 600 |
| Label/sm | 14px | 20px | 600 |
| Label/md | 18px | 24px | 500 |
| Label/lg | 20px | 28px | 600 |

#### Дополнительные стили — только в коде (нет в Figma)

| Code Style | Size | Line-height | Weight | Примечание |
|---|---|---|---|---|
| heading/display | 64px | 72px | 700, ls=-0.02em | Самый крупный — hero на широких брейкпоинтах |
| heading/compact | 28px | 34px | 700, ls=-0.01em | Промежуточный размер |
| heading/subtitle | 20px | 30px | 500 | Отличается от heading/title весом |
| body/large | 20px | 30px | 400 | — |
| body/medium | 18px | 28px | 500 | — |
| body/compact | 16px | 24px | 400 | — |
| eyebrow | 14px | 20px | 700, ls=+4px, uppercase | Лейбл-акцент секций |
| eyebrow/sm | 12px | 16px | 700, ls=+3px, uppercase | Мелкий eyebrow |

> Gap: 8 из 19 code-стилей отсутствуют в Figma. Дизайн в коде опередил Figma. Типографика в JSON не хранится — расширение до Variables требует отдельного решения.

#### Letter Spacing

| Стиль | Letter-spacing |
|---|---|
| heading/display | -0.02em |
| heading/hero | -0.02em |
| heading/section | -0.01em |
| heading/product | -0.01em |
| heading/compact | -0.01em |
| eyebrow | +4px (≈ 0.286em) |
| eyebrow/sm | +3px |

---

### 2.4 Spacing

В `raw/Light.tokens.json` spacing отсутствует. Данные из `tokens.css` / `figma-mirror.json`.

Шкала на базе 4px, 11 ступеней. В коде — две параллельные системы: `--space-*` (legacy) и `--d-*` (density, более гранулярная).

#### Основная шкала (`--space-*`)

| Токен | px |
|---|---|
| `--space-0` | 0 |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-7` | 32px |
| `--space-8` | 40px |
| `--space-9` | 60px |
| `--space-10` | 80px |

#### Расширенная Density-шкала (`--d-*`)

| Токен | px | Применение |
|---|---|---|
| `--d-025` | 1px | hairline border |
| `--d-05` | 2px | micro gap |
| `--d-1` | 4px | базовый шаг |
| `--d-2` | 8px | inner padding sm |
| `--d-3` | 12px | inner padding md |
| `--d-4` | 16px | inner padding lg |
| `--d-6` | 24px | outer-pad (= `--page-pad`) |
| `--d-8` | 32px | секционный gap |
| `--d-10` | 40px | крупный gap |
| `--d-12` | 48px | hero padding |
| `--d-pill` | 9999px | border-radius pill |

#### Layout-токены

| Токен | Значение |
|---|---|
| `--page-max` | 1200px |
| `--page-pad` | 24px (`--d-6`) |

---

### 2.5 Radius

В `raw/Light.tokens.json` radius отсутствует. Данные из `tokens.css`.

| Название | CSS var | px |
|---|---|---|
| None | `--radius-none` | 0 |
| SM | `--radius-sm` | 4px |
| MD | `--radius-md` | 8px |
| LG | `--radius-lg` | 12px |
| XL | `--radius-xl` | 16px |
| 2XL | `--radius-2xl` | 24px |
| Full / Pill | `--radius-pill` | 9999px |

---

### 2.6 Shadows (Effect Styles)

В JSON отсутствует. Данные из `tokens.css` / `figma-mirror.json`.

| Figma Style | CSS var | Значение |
|---|---|---|
| Shadow/Card | `--shadow-card` | `0 4px 6px -1px rgba(15,16,23,.10), 0 2px 4px -1px rgba(15,16,23,.06)` |
| Shadow/Modal | `--shadow-modal` | `0 10px 15px -3px rgba(15,16,23,.10), 0 4px 6px -2px rgba(15,16,23,.05)` |
| Shadow/Focus | `--shadow-focus` | `0 0 0 3px rgba(98,242,202,.5)` — Mint.400 focus ring |

---

## 3. Components

> **Disclaimer**: Данные по компонентам ниже — из `figma-mirror.json` (back-sync артефакт), поскольку Figma MCP не дал прямого доступа к страницам Atoms/Molecules. Для организмов страница `04 — Organisms` (nodeId `63:3`) подтверждена через MCP metadata.

### 3.1 Атомы

#### Button

**Figma**: ComponentSet `33:20` + outlined extension `83:2/4/6`.

| Variant | Size | Figma node |
|---|---|---|
| primary | sm / md / lg | 33:2 / 33:4 / 33:6 |
| secondary | sm / md / lg | 33:8 / 33:10 / 33:12 |
| dark | sm / md / lg | 33:14 / 33:16 / 33:18 |
| outlined | sm / md / lg | 83:2 / 83:4 / 83:6 |

**Состояния**: default задокументированы в Figma; hover / active / disabled — в React через CSS, не явные Figma-variants.

**Ключевые токены**:
- primary: fill `Action.Primary` (Mint.200 #CCFAED), text `Action.Dark` (Neutral.1000 #0F1017)
- secondary: fill `Action.Secondary` (Lavender.200 #CCDEFA), text `Action.Dark`
- dark: fill `Action.Dark` (#0F1017), text `Action.Dark.Text` (Neutral.200 #DFE0E7)
- outlined: прозрачный, border `Neutral.400`, text `Text.OnLight.Primary`

**Известный gap**: outlined на тёмном фоне (hero) требует instance-override — нет отдельного variant `outlined/onDark`.

---

#### Badge

**Figma**: ComponentSet `35:12`, 5 вариантов.

| Variant | Назначение |
|---|---|
| neutral | Нейтральный статус |
| success | Позитивный |
| danger | Ошибка |
| warning | Предупреждение |
| info | Информационный |

**Gap**: `Badge.module.css` ссылался на `--color-neutral-900`, которого нет в tokens.css (fix: смапили на Neutral.1000 #0F1017).

---

#### Avatar

ComponentSet `36:8`, 3 размера: sm / md / lg. Детали не задокументированы в mirror.

---

#### Icon

ComponentSet `84:140`, **37 иконок** (36 из adam_* Novation sprite + 1 arrow-right). Все через `currentColor`.

`account | add | arrow-down | arrow-left | arrow-right | arrow-up | calendar | call | check | close | delete | delivery | edit | error | favorite | grid-view | language | list-alt | lock | logout | mail | menu | pdf | remove | schedule | search | shopping-basket | socials-facebook | socials-instagram | socials-linkedin | socials-tiktok | socials-x | socials-youtube | splitscreen | tune | warning | warranty`

---

#### Input

Компонент `38:2`. Варианты (placeholder, filled, error, disabled) в mirror не задокументированы.

---

#### TagChip

ComponentSet `53:25`, 2 state: `State=default` (`53:21`) и `State=active` (`53:23`). Используется для фильтра в CatalogSection.

---

### 3.2 Молекулы

| Компонент | Node | Назначение |
|---|---|---|
| ProductCard | `39:2` | Карточка продукта: фото + заголовок + описание + цена + CTA |
| StatBlock | `54:21` | Цифровая метрика + подпись |
| PullQuote | `55:21` | Цитата / выделенный тезис |
| VideoCard | `56:21` | Превью видео с мета-информацией |
| NewsletterSignup | `105:13` | `Layout=inline` (57:21) — desktop; `Layout=stacked` (105:5) — mobile |

---

### 3.3 Организмы

Подтверждены через MCP metadata страницы `04 — Organisms` (nodeId `63:3`).

#### Header

ComponentSet `102:49`:
- `Layout=desktop` (`40:3`) — 1200px, полная навигация
- `Layout=tablet` (`102:25`) — 864px, сжатая горизонтальная
- `Layout=mobile` (`102:38`) — 640px, hamburger + cart

#### HeroProduct

ComponentSet `103:48`:
- `Layout=horizontal` (`48:3`) — 1200px, изображение сбоку
- `Layout=stacked-mobile` (`124:2`) — 360px, изображение под текстом
- `Layout=stacked` (`103:37`) — 640px, вертикальный
- `Layout=horizontal-compact` (`123:2`) — 1440px, компактный горизонтальный

#### OneActionBetweenThem

ComponentSet `838:7653` с 5 вариантами (`Property 1=0/11/12/13/14`). Интерактивная секция «как это работает» с ModeGrid.

#### FeatureSlider

Компонент `50:5`, `153:44` (stacked), `153:69` (grid), вариант `50:5` (horizontal). В React ProductPage **не используется** (gap).

#### FeatureSplit

ComponentSet `58:43`:
- `Direction=imageLeft` (`58:23`)
- `Direction=imageRight` (`58:33`)
- `Direction=stacked` (`152:43`)

В React ProductPage **не используется** (gap).

#### VideoSection

Компонент `397:467` — 1440px. Секция видео.

#### ICPColumns

Компонент `365:461` — 1440px. 3-колоночный ICP. В Figma ранее называлась `WhyChooseNovation` (`51:5`) — переименована.

#### CatalogSection

Компонент `244:1159` — 1920px. Каталог продуктов с TagChip-фильтром.

#### RequirementsSection

Компонент `355:2899` — 1920px. Технические требования.

#### FAQSection

Компонент `355:3014` — 1920px. FAQ с аккордеоном.

#### NewsletterSection

Компонент `233:1133` — 1440px. Форма подписки.

#### Footer

- ComponentSet `106:52` (старый): `Layout=full` (`59:25`), `Layout=compact` (`106:39`)
- Frame `1016:1632` (новый): `Theme=dark` (`1007:3977`) — 1456px

---

### 3.4 Компоненты только в коде (не подтверждены в Figma)

| React-компонент | Назначение |
|---|---|
| `Hero` | Упрощённый HeroProduct или отдельная версия |
| `PluginMockup` | Анимированный UI-виджет, scroll-driven через GSAP |
| `ModeGrid` | Сетка 16 режимов LCXL |
| `MechanismDiagram` | Схема механизма (только в DemoPage) |
| `ModeButton` | Кнопка переключения режима |
| `SpecRow` | Строка спецификации |
| `Section` | Обёртка-секция с max-width |

---

## 4. Demo — страницы `03 — Demo`

> **Disclaimer**: Figma MCP не дал прямого доступа к странице `03 — Demo`. Данные ниже — из `figma-mirror.json`.

### Figma: 4 breakpoint-сборки

| Frame | Ширина | Node ID | Описание |
|---|---|---|---|
| ProductPage · 1440 | 1440px | `93:64` | Header + HeroProduct + Stats + FeatureSlider + FeatureSplit + VideoCard + WhyChooseNovation + PullQuote + ProductGallery + CatalogSection + NewsletterSignup + Footer |
| ProductPage · 960 | 960px | `94:231` | Tablet: Stats 2×2, 2-col catalog, 3-col footer |
| ProductPage · 640 | 640px | `95:270` | Small tablet: stacked hero, Stats 2×2, 2-col catalog |
| ProductPage · 360 | 360px | `96:309` | Mobile: hamburger, full-width CTA, 1-col catalog, newsletter stacked |

### React ProductPage — секции в порядке рендера

1. Header
2. OneActionBetweenThem («HOW IT WORKS»)
3. Hero («Your LCXL has 16 modes.»)
4. PluginMockup (floating, scroll-driven GSAP)
5. VideoSection («IN ACTION»)
6. ICPColumns («FOR YOU, SPECIFICALLY»)
7. CatalogSection («Everything you need. Nothing else to buy.»)
8. RequirementsSection («TECH REQUIREMENTS»)
9. FAQSection («Last questions before you buy.»)
10. NewsletterSection («Ready to play all 16?»)
11. FooterFull

### Расхождения Figma ↔ React

| Статус | Секция | Примечание |
|---|---|---|
| В Figma, нет в коде | FeatureSlider | — |
| В Figma, нет в коде | FeatureSplit (imageLeft) | — |
| В Figma, нет в коде | Stats ribbon (StatBlock) | — |
| В Figma, нет в коде | PullQuote | — |
| В Figma, нет в коде | ProductGallery | Есть в DemoPage |
| В коде, нет в Figma-демо | OneActionBetweenThem + PluginMockup | Центральная интерактивная механика, добавлена после фиксации демо |
| В коде, нет в Figma-демо | RequirementsSection | — |
| В коде, нет в Figma-демо | FAQSection | — |

---

## 5. Резюме и наблюдения

### Что выглядит зрелым

- **Color system**: полный двухуровневый стек — 5 primitive ramps (Neutral 12 ступеней, Mint 9, Lavender 9, Red 9, Amber 9) + Hue-palette 12 слотов + семантический слой с чёткими scope'ами. W3C DTCG формат — инструментальная интеграция готова.
- **Semantic coverage**: Bg, Border, Action, Surface (4 zone-токена для LCXL UI), Icon, State, Text (6 вариантов) — покрывает все типичные сценарии лендинга.
- **Button**: 4 варианта × 3 размера, хорошо покрывают лендинг.
- **Responsive strategy**: 4 breakpoint-варианта компонентов + Layout= prop.
- **Icon set**: 37 иконок с currentColor, готов к использованию.

### Дыры и несогласованности

1. **Typography gap**: 8 из 19 code-стилей отсутствуют в Figma Text Styles (eyebrow, eyebrow/sm, heading/display, heading/compact, heading/subtitle, body/large, body/medium, body/compact).

2. **Typography не в Variables**: JSON содержит только цвета. Типографика — только Text Styles, не variables. Ограничивает масштабирование токен-системы.

3. **Bg.Default → Neutral.300 (#C6C8D2)**: тёмный цвет для токена «Default background». Требует верификации — либо это фон тёмного UI-компонента в Light mode, либо опечатка при экспорте.

4. **Action.Primary = Mint.200 (#CCFAED)**: очень светлый цвет для primary CTA fill. В старой wiki ошибочно указан Mint.400. Нужна визуальная проверка в контексте кнопки.

5. **Spacing и Radius в JSON отсутствуют**: не экспортированы или живут в отдельном файле. Данные по ним — только из CSS-артефактов.

6. **Две параллельные spacing-системы**: `--space-*` (legacy) и `--d-*`. Нужна миграция на единую систему.

7. **outlined/onDark variant отсутствует**: instance-override без master variant.

8. **Рассинхрон ProductPage ↔ Figma 1440-демо**: 5 секций из Figma нет в коде, 3 секции в коде нет в Figma.

9. **Hue.10/11 = #808080 (placeholder)**: два слота из 12 не заполнены реальными цветами режимов.

10. **Dark mode не реализован**: сознательное решение, зафиксировано.

### TODO для production-ready

| Приоритет | Задача |
|---|---|
| P0 | Добавить в Figma 8 недостающих Text Styles (eyebrow, eyebrow/sm, heading/display, heading/compact, heading/subtitle, body/large, body/medium, body/compact) |
| P0 | Верифицировать `Bg.Default → Neutral.300` (#C6C8D2) — убедиться, что семантика верна, не ошибка экспорта |
| P0 | **Переименовать Figma-файл `Novation XL` → `Control XL`** (и обновить `project` в `figma.config.json` если есть) |
| P1 | Задокументировать Hero, PluginMockup, ModeGrid, MechanismDiagram как явно «code-only» или добавить в Figma |
| P1 | Добавить Button variant `outlined/onDark` в Figma |
| P1 | Привести ProductPage в соответствие с Figma-демо (или наоборот) |
| P1 | Экспортировать Spacing и Radius в отдельный DTCG-файл рядом с Light.tokens.json |
| P1 | Убрать из figma.config.json несуществующую коллекцию `Typography` или создать её |
| P2 | Мигрировать компоненты с `--space-*` на `--d-*` |
| P2 | Заполнить Hue.10 и Hue.11 реальными цветами режимов или явно пометить как reserved |
| P3 | Добавить hover/active/disabled как Figma-variants к Button |
| P3 | Рассмотреть перенос Typography в Figma Variables (для полного DTCG-стека) |

---

## Related pages

- [[landing-narrative]]
- [[roadmap]]
