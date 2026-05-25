# Project Memory Map — Fadercraft

> 📋 **Открытые вопросы и технический долг — [questions.md](questions.md)** (единое место, перед началом любой задачи прогоняй через него).

Обновлено: 2026-05-22
Источник истины (Figma): https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL (текущее имя файла — `Novation XL`; подлежит переименованию в `Control XL`)

## Продукт

**Fadercraft** — зонтичный бренд утилит Max for Live / Ableton Live для перформативной работы с MIDI-контроллерами. Флагман — **Control XL**, M4L-устройство для Novation Launch Control XL MK3 (legacy-имя `XL_Performance.amxd`). Аудитория — Ableton-перформеры и продюсеры, использующие LCXL MK3 как универсальный мост между микшером и инструментами.

Primary device: `(уточнить)` — лендинг fadercraft.com предположительно desktop-first с обязательным mobile, но не подтверждено.

## Дизайн-система — где живёт

- **Figma-файл:** `Novation XL` (подлежит переименованию в `Control XL`). URL: https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Novation-XL. fileKey: `OdPRdjodGO3WiR6tgSP7AA`. <!-- gitleaks:allow public Figma fileKey, not a secret -->
- **Структура файла (по `figma.config.json`):**
  - `01 — Tokens` — переменные (Colors, Spacing, Radius; Typography — отдельная история, см. ниже)
  - `02 — Components` — компонентная библиотека
  - `03 — Demo` — собранные секции/страницы лендинга
  - `04 — Organisms` (не в config, но реально существует)
  - `Images` — фотографии продукта
- **Документация рядом:** wiki проекта в `wiki/` — особенно `design-system.md` (детальный аудит), `landing-narrative.md` (10-битная психологическая дуга лендинга), `roadmap.md`.
- **Code workspace:** `/Users/Kirill/Projects/Claude/Fadercraft/` (React + Vite, отдельно от планирования/вики).

## Карта памяти

| Задача | Что читать | Статус |
|---|---|---|
| Цвета | [tokens/colors.md](tokens/colors.md) | full |
| Типографика | [tokens/typography.md](tokens/typography.md) | full — palette-only архитектура внедрена 2026-05-22 (19 стилей; CSS migration complete) |
| Density (отступы, размеры) | [tokens/density.md](tokens/density.md) | full |
| Радиусы, тени, иконы | [tokens/foundations.md](tokens/foundations.md) | partial |
| Общий инвентарь компонентов | [components/inventory.md](components/inventory.md) | partial (React/Figma parity) |
| Глоссарий проекта | [product/glossary.md](product/glossary.md) | draft |
| Tone, копирайт | [product/tone-of-voice.md](product/tone-of-voice.md) | active — derived from "Performance Flow" 2026-05-20 |
| Naming Density-токенов | [decisions/density-naming.md](decisions/density-naming.md) | full |
| Wiki- workflow & linting | [wiki-workflow.md](wiki-workflow.md) | full |

## Горячие токены

### Цвета (Semantic, источник: raw/Light.tokens.json)

| Token | Primitive | Hex | Назначение |
|---|---|---|---|
| `semantic.bg.default` | Neutral.300 | `#C6C8D2` | основной фон страницы (светлая тема) |
| `semantic.bg.surface` | Neutral.400 | `#989BAE` | приподнятая поверхность |
| `semantic.bg.dark` | Neutral.1000 | `#0F1017` | тёмные секции |
| `semantic.border.default` | Neutral.800 | `#2A2C3C` | границы по умолчанию |
| `semantic.action.primary` | Mint.200 | `#CCFAED` | основная CTA |
| `semantic.action.secondary` | Lavender.200 | `#CCDEFA` | вторичная CTA |
| `semantic.action.tertiary` | Amber.400 | `#FFAD56` | третичный акцент |
| `semantic.action.dark` (root) | Neutral.1000 | `#0F1017` | dark-CTA |
| `semantic.action.dark.text` | Neutral.200 | `#DFE0E7` | текст на dark-CTA |
| `semantic.text.onLight.primary` | Neutral.1000 | `#0F1017` | основной текст на светлом |
| `semantic.text.onLight.secondary` | Neutral.700 | `#414458` | вторичный |
| `semantic.text.onLight.tertiary` | Neutral.600 | `#595C73` | подписи |
| `semantic.text.onDark.primary` | Neutral.00 | `#FFFFFF` | основной текст на тёмном |
| `semantic.text.onDark.secondary` | Neutral.300 | `#C6C8D2` | вторичный |
| `semantic.text.onDark.tertiary` | Neutral.400 | `#989BAE` | подписи |
| `semantic.surface.service` | Neutral.800 | `#2A2C3C` | служебные блоки |
| `semantic.surface.instrument` | Lavender.300 | `#A1C2F7` | секция Instruments |
| `semantic.surface.mixer` | Mint.300 | `#A1F7DF` | секция Mixer |
| `semantic.surface.mute` | Amber.400 | `#FFAD56` | секция Mute |
| `semantic.icon.primary` | Neutral.1000 | `#0F1017` | основная иконка |
| `semantic.state.selected.background` | Neutral.1000 | `#0F1017` | выбранный элемент, фон |
| `semantic.state.selected.text` | Neutral.200 | `#DFE0E7` | выбранный элемент, текст |

### Типографика (19 канонических стилей, palette-only архитектура 2026-05-22)

Код (`typography.ts`) — единственный источник для всех текстовых узлов: применяется через `getTypographyStyle('<name>')` в TSX. В `.module.css` запрещены `font-*` / `line-height` / `letter-spacing` / `text-transform` на текстовых классах. Density-переменные живут только внутри палитры.

| Style | size/line/weight | density | letterSpacing |
|---|---|---|---|
| `heading/hero` | 48/62/700 | `--12`/`--15-5` | -0.9px |
| `heading/section` | 40/50/700 | `--10`/`--12-5` | -1px |
| `heading/product` | 36/42/700 | `--9`/`--10-5` | -0.01em |
| `heading/compact` | 28/34/700 | `--7`/`--8-5` | -1px |
| `heading/title` | 20/30/700 | `--5`/`--7-5` | — |
| `body/regular` | **20/30**/400 | `--5`/`--7-5` | — |
| `body/medium` | 18/26/400 | `--4-5`/`--6-5` | — |
| `body/sm` | 17/25/400 (code-only) | `--4-25`/`--6-25` | — |
| `body/compact` | 16/24/400 | `--4`/`--6` | — |
| `price` | 24/30/700 | `--6`/`--7-5` | — |
| `caption` | 14/20/400 | `--3-5`/`--5` | 2px |
| `eyebrow` | 14/20/700 uppercase | `--3-5`/`--5` | **3.6px** |
| `eyebrow/sm` | 12/16/700 uppercase | `--3`/`--4` | 3px |
| `label/lg` | 20/28/600 | `--5`/`--7` | — |
| `label/md` | 17/24/600 | `--4-25`/`--6` | — |
| `label/md-strong` | 17/24/700 (code-only) | `--4-25`/`--6` | — |
| `label/sm` | 14/20/600 | `--3-5`/`--5` | — |
| `label/xs` | 12/16/600 | `--3`/`--4` | — |
| `brand/logo-model` | 20/20/400 (lh=1) | `--5`/`--5` | — |

Исключения palette-only: fluid `clamp()` font-size в Hero / HeroProduct / OneActionBetweenThem.title / RequirementsSection.title / FAQSection.title; inline weight-only override на семантических `<strong>`-акцентах.

### Density (отступы и размеры)

Шкала 32 ступени (`--0`…`--24`), 1 unit = 4 px, имя CSS = просто число. Добавлен `--8-5` (34px) 2026-05-15; `--24` (96px) 2026-05-22. Подробно — в `tokens/density.md`.

## Жёсткие правила

- **Текст на сайте, в мокапах и документации — только English.** Никакой кириллицы в UI-копи. Чат с пользователем — на русском.
- **Бренд:** Fadercraft (бренд/проект), Control XL (продукт). Старое имя `XL_Performance` — legacy, в новой коммуникации не использовать.
- **Железо:** Novation Launch Control XL MK3 (LCXL MK3) — чужой бренд, имя не меняем.
- **Density-naming** (универсальное правило): имя в Figma — число с **запятой** в дроби (`0,25`, `12,5`); имя CSS — то же число с дефисом (`--0-25`, `--12-5`). Без префиксов, без `space`-слоя.
- **Качество копирайта**: После правки английского документа — прогнать Vale + LanguageTool.
