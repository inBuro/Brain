# Tokens — Colors

Обновлено: 2026-05-25
Источник истины: **живые переменные Figma** (`OdPRdjodGO3WiR6tgSP7AA`, mode **Light**), читать через `get_variable_defs` на ноде `112:473` (палитра DS).

Экспорт `raw/Light.tokens.json` (датирован 2026-05-15) — теперь служит снимком, **может расходиться с live**. Расхождения, известные на момент последней синхронизации:

- `Semantic.Action.Primary` — live = Mint.400 (#63F2CA), JSON = Mint.200 (#CCFAED)
- `Semantic.Action.Secondary` — live = Lavender.400 (#639AF2), JSON = Lavender.200 (#CCDEFA)
- `Semantic.Surface.Mixer` — live = Mint.400 (#63F2CA), JSON = Mint.300 (#A1F7DF)

Код (`app/src/tokens/tokens.css`) приведён к **live**-значениям 2026-05-25.

Mode **Dark** на момент бутстрапа отсутствует — в Figma зарегистрирован только Light. Признаков парного файла или коллекции для Dark нет.

---

## Primitives

### Neutral (13 ступеней)

| Token | Hex | Прим. |
|---|---|---|
| `Neutral.00` | `#FFFFFF` | белый |
| `Neutral.50` | `#F9FAFA` | |
| `Neutral.100` | `#F1F1F4` | |
| `Neutral.200` | `#DFE0E7` | |
| `Neutral.300` | `#C6C8D2` | bg default (см. open question) |
| `Neutral.400` | `#989BAE` | bg surface |
| `Neutral.500` | `#70748F` | |
| `Neutral.500-40` | `#70748F` alpha 0.4 | |
| `Neutral.600` | `#595C73` | text tertiary onLight |
| `Neutral.700` | `#414458` | text secondary onLight |
| `Neutral.800` | `#2A2C3C` | border default, surface service |
| `Neutral.900` | `#1B1C28` | |
| `Neutral.1000` | `#0F1017` | bg dark, text primary onLight, action dark |

### Mint (фирменный акцент, основная CTA-палитра)

| Token | Hex |
|---|---|
| `Mint.50` | `#F6FEFC` |
| `Mint.100` | `#E8FCF7` |
| `Mint.100-44` | `#ADFFD6` |
| `Mint.100-88` | `#ADFFD6` |
| `Mint.200` | `#CCFAED` |
| `Mint.300` | `#A1F7DF` |
| `Mint.400` | `#63F2CA` ← `semantic.action.primary`, `semantic.surface.mixer` |
| `Mint.400-40` | `#63F2CA` alpha 0.4 |
| `Mint.500` | `#1AE5AC` |
| `Mint.500-40` | `#1AE5AC` alpha 0.4 |
| `Mint.600` | `#16B688` |
| `Mint.700` | `#138665` |
| `Mint.800` | `#0E5843` |
| `Mint.900` | `#0A382B` |

### Lavender (secondary акцент)

| Token | Hex |
|---|---|
| `Lavender.50` | `#F6F9FE` |
| `Lavender.100` | `#E8F0FC` |
| `Lavender.200` | `#CCDEFA` |
| `Lavender.300` | `#A1C2F7` ← `semantic.surface.instrument` |
| `Lavender.400` | `#639AF2` ← `semantic.action.secondary` |
| `Lavender.500` | `#1A68E5` |
| `Lavender.500-40` | `#1A68E5` alpha 0.4 |
| `Lavender.600` | `#1653B6` |
| `Lavender.700` | `#133F86` |
| `Lavender.800` | `#0E2A58` |
| `Lavender.900` | `#0A1C38` |

### Amber (третичный акцент, mute)

| Token | Hex |
|---|---|
| `Amber.50` | `#FEFAF6` |
| `Amber.100` | `#FCF3E8` |
| `Amber.200` | `#FAE4CC` |
| `Amber.300` | `#F7CDA1` |
| `Amber.400` | `#FFAD56` ← `semantic.action.tertiary`, `semantic.surface.mute` |
| `Amber.500` | `#E5831A` |
| `Amber.500-40` | `#E5831A` alpha 0.4 |
| `Amber.600` | `#B66916` |
| `Amber.700` | `#864E13` |
| `Amber.800` | `#58340E` |
| `Amber.900` | `#38220A` |
| `Amber.$root` | `#FFAD56` | legacy alias = Amber.400 |

### Red (destructive)

| Token | Hex |
|---|---|
| `Red.50` | `#FEF6F6` |
| `Red.100` | `#FCE8E8` |
| `Red.200` | `#FACCCC` |
| `Red.300` | `#F7A1A1` |
| `Red.400` | `#F26363` |
| `Red.500` | `#E51A1A` |
| `Red.500-40` | `#E51A1A` alpha 0.4 |
| `Red.600` | `#B61616` |
| `Red.700` | `#861313` |
| `Red.800` | `#580E0E` |
| `Red.900` | `#380A0A` |

> Семантической привязки `semantic.danger.*` к Red в JSON **нет** — палитра присутствует, но не используется через семантический слой. Кандидат на добавление.

### Hue (LCXL MK3 pad-палитра)

12 слотов с alpha-вариантами `-40`, `-70`, `-88` — это пэд-цвета физического контроллера, маппятся 1:1 на световые состояния hardware.

| Slot | Hex | Назначение |
|---|---|---|
| `Hue.01` | `#D86A07` | оранжевый pad |
| `Hue.02` | `#8B8D1A` | оливковый |
| ~~`Hue.03`~~ | removed | слит в Hue.06 (2026-05-22) — variable не существует |
| `Hue.04` | `#1FA9A9` | бирюза |
| `Hue.05` | `#945CFF` | фиолетовый |
| `Hue.06` | `#24BE30` | зелёный (canonical) |
| `Hue.07` | `#FF3A96` | розовый |
| `Hue.08` | `#F22DFF` | пурпурный |
| `Hue.09` | `#199BFF` | голубой |
| `Hue.10` | `#808080` | **placeholder** — не настроен |
| `Hue.11` | `#808080` | **placeholder** — не настроен |
| `Hue.12` | `#FF3B90` | malina |

Каждый Hue имеет alpha-варианты `-40` (0.4) и `-70` (0.7); у Hue.09 есть `09-40 X` — артефакт переименования, проверить. Hue.03 / Hue.03-40 / Hue.03-70 удалены (2026-05-22) — слиты в Hue.06; во всех файлах кода и нодах Figma используется только Hue.06.

---

## Semantic

Семантический слой связан с Primitives через ссылки `{Primitives.X.Y}`. Web codeSyntax — `var(--color-semantic-*)`.

### Bg

| Token | → | Hex | CSS var |
|---|---|---|---|
| `Semantic.Bg.Default` | Neutral.00 | `#FFFFFF` | `--bg-default` |
| `Semantic.Bg.Surface` | Neutral.100 | `#F1F1F4` | `--bg-surface` |
| `Semantic.Bg.Dark` | Neutral.1000 | `#0F1017` | `--bg-dark` |

> **Note:** В Light.tokens.json (экспорт 2026-05-15) Bg.Default → Neutral.300 (#C6C8D2), Bg.Surface → Neutral.400 (#989BAE). В коде (`tokens.css`, last sync 2026-05-19) значения пересмотрены до более светлых: Default = white, Surface = near-white. Код актуальнее JSON-экспорта — JSON устарел. Figma-переменные при следующей синхронизации нужно проверить на расхождение.

### Border

| Token | → | Hex |
|---|---|---|
| `Semantic.Border.Default` | Neutral.800 | `#2A2C3C` |

> Только один токен border. Если в дизайне нужны subtle/strong варианты — это пробел.

### Action

| Token | → | Hex |
|---|---|---|
| `Semantic.Action.Primary` | Mint.400 | `#63F2CA` |
| `Semantic.Action.Secondary` | Lavender.400 | `#639AF2` |
| `Semantic.Action.Tertiary` | Amber.400 | `#FFAD56` |
| `Semantic.Action.Dark` (root) | Neutral.1000 | `#0F1017` |
| `Semantic.Action.Dark.Text` | Neutral.200 | `#DFE0E7` |

### Surface (продуктовые контекстные поверхности)

| Token | → | Hex | Контекст |
|---|---|---|---|
| `Semantic.Surface.Service` | Neutral.800 | `#2A2C3C` | служебные блоки |
| `Semantic.Surface.Instrument` | Lavender.300 | `#A1C2F7` | Instruments Layer |
| `Semantic.Surface.Mixer` | Mint.400 | `#63F2CA` | Mixer Layer |
| `Semantic.Surface.Mute` | Amber.400 | `#FFAD56` | Mute-режим |

### Icon

| Token | → | Hex |
|---|---|---|
| `Semantic.Icon.Primary` | Neutral.1000 | `#0F1017` |

### State

| Token | → | Hex |
|---|---|---|
| `Semantic.State.Selected.Background` | Neutral.1000 | `#0F1017` |
| `Semantic.State.Selected.Text` | Neutral.200 | `#DFE0E7` |

### Text

| Token | → | Hex |
|---|---|---|
| `Semantic.Text.OnLight.Primary` | Neutral.1000 | `#0F1017` |
| `Semantic.Text.OnLight.Secondary` | Neutral.700 | `#414458` |
| `Semantic.Text.OnLight.Tertiary` | Neutral.500 | `#70748F` | `--text-onlight-tertiary` |
| `Semantic.Text.OnDark.Primary` | Neutral.00 | `#FFFFFF` |
| `Semantic.Text.OnDark.Secondary` | Neutral.300 | `#C6C8D2` |
| `Semantic.Text.OnDark.Tertiary` | Neutral.400 | `#989BAE` |

---

## Известные пробелы и кандидаты на добавление

1. **`semantic.danger.*`** — Red палитра есть, семантический слой отсутствует.
2. **`semantic.success.*`** — не выделен (Mint используется и как brand, и как success — конфликт).
3. **`semantic.warning.*`** — Amber используется как tertiary action и как mute; warning не выделен.
4. **`semantic.border.subtle` / `strong`** — единственный border-токен сейчас.
5. **`semantic.bg.elevated`** — не выделен.
6. **Hue.10 / Hue.11** — placeholder `#808080`, требуют значений или удаления.
7. **Dark mode** — целиком отсутствует.

## Связанные файлы

- `MEMORY.md` — горячие семантические токены
- `../wiki/design-system.md` — широкий аудит DS (включая код-back-sync)
- `../../raw/Light.tokens.json` — исходник
