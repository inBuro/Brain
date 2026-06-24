# Foundation (scan)

**Источник:** v2.4 Beefy Design System (`vBAfvod9AWpHeyJi2yu2Eh`)
**Дата сканирования:** 2026-06-19

Два слоя токенов. Слой 1 (`Primitives`) — числа и hex. Слой 2 (`Semantic`) — смысловые имена со ссылками на Primitives. На экранах используется **только Semantic**. Прибитые hex в компонентах запрещены.

Типографика и отступы — через CSS-переменные (`--category/name`), а **не** через Figma Variables. **Figma Text Styles не используются** — на каждый текстовый узел 5 CSS-переменных напрямую (family / weight / size / line-height / letter-spacing).

---

## Слой 1 — Primitives

### Палитра — darkBlue (основные поверхности)

Тёмная синевато-фиолетовая шкала. Основа всех фонов и обводок.

| Токен | Hex |
|---|---|
| `darkBlue/40` | `#A6ABCF` |
| `darkBlue/50` | `#363B63` |
| `darkBlue/60` | `#2D3153` |
| `darkBlue/70` | `#242842` |
| `darkBlue/80` | `#1C1E32` |
| `darkBlue/90` | `#111321` |
| `darkBlue/100` | `#020203` |

С альфой (используются для disabled/overlay):

| Токен | Base | Alpha |
|---|---|---|
| `darkBlue/40-32a` | darkBlue/40 | 32% |
| `darkBlue/60-40a` | darkBlue/60 | 40% |
| `darkBlue/70-32a` | darkBlue/70 | 32% |
| `darkBlue/70-40a` | darkBlue/70 | 40% |
| `darkBlue/80-64a` | darkBlue/80 | 64% |
| `darkBlue/90-56a` | darkBlue/90 | 56% |
| `darkBlue/90-80a` | darkBlue/90 | 80% |
| `darkBlue/100-64a` | darkBlue/100 | 64% |

### Палитра — white (текст и иконки)

Слегка голубоватый off-white — не чистый белый.

| Токен | Hex |
|---|---|
| `white/70` | `#999CB3` |
| `white/80` | `#BCBECE` |
| `white/90` | `#DADCE8` |
| `white/100` | `#F5F5FF` |

С альфой:

| Токен | Alpha |
|---|---|
| `white/70-24a` | 24% |
| `white/70-64a` | 64% |
| `white/90-24a` | 24% |
| `white/90-64a` | 64% |
| `white/100-4a` | 4% |
| `white/100-24a` | 24% |
| `white/100-64a` | 64% |

### Палитра — green (primary CTA, confirmations)

| Токен | Hex |
|---|---|
| `green/20` | `#BAF0CA` |
| `green/30` | `#95E2A8` |
| `green/40` | `#72D286` |
| `green/50` | `#53BE64` |
| `green/80` | `#2A784C` |

С альфой: `green/40-12`, `green/80-40`, `green/80-40-64a`

### Палитра — gold (secondary CTA, teasers)

| Токен | Hex |
|---|---|
| `gold/20` | `#F7E9CA` |
| `gold/30` | `#F8DFA9` |
| `gold/50` | `#ECCC7D` |
| `gold/70` | `#D7A861` |
| `gold/80` | `#B17F49` |

С альфой: `gold/40-12a`, `gold/70-20`, `gold/80-32`

### Палитра — red (ошибки, алерты)

| Токен | Hex |
|---|---|
| `red/40` | `#FFAD9E` |
| `red/90` | `#EA4E28` |

С альфой: `red/40-12a`, `red/80-32`, `red/90-40`

### Палитра — chartTints (графики)

Синевато-зелёная прогрессия от холодного синего до тёплого жёлтого.

| Токен | Hex |
|---|---|
| `chartTints/10` | `#3D5CF5` |
| `chartTints/20` | `#5C70D6` |
| `chartTints/30` | `#5C99D6` |
| `chartTints/40` | `#5CC2D6` |
| `chartTints/50` | `#5CD6AD` |
| `chartTints/70` | `#70D65C` |
| `chartTints/80` | `#8FD65C` |
| `chartTints/90` | `#B0D65C` |
| `chartTints/100` | `#D6D65C` |

С модификаторами: `chartTints/20-24`, `chartTints/20-64w`

---

## Слой 2 — Semantic токены

Все значения — VARIABLE_ALIAS на Primitives. Прибитые hex запрещены.

### CTA (кнопки действий)

| Токен | → Primitive | Использование |
|---|---|---|
| `cta/primary - default` | `green/40` | Основной CTA (зелёный) |
| `cta/primary - hover` | `green/20` | Hover primary |
| `cta/primary - disabled` | `green/40-12` | Disabled primary |
| `cta/secondary - default` | `gold/50` | Вторичный CTA (золотой) |
| `cta/secondary - hover` | `gold/30` | Hover secondary |
| `cta/secondary - disabled` | `gold/70-20` | Disabled secondary |
| `cta/tertiary - default` | `darkBlue/50` | Третичный CTA |
| `cta/tertiary - hover` | `darkBlue/40` | Hover tertiary |
| `cta/tertiary - disabled` | `darkBlue/40-32a` | Disabled tertiary |
| `cta/fourth - default` | `darkBlue/80` | Четвёртый CTA |
| `cta/fourth - hover` | `darkBlue/70` | Hover fourth |
| `cta/fourth - minor` | `darkBlue/80-64a` | Minor fourth |
| `cta/fourth - disabled` | `darkBlue/70-32a` | Disabled fourth |
| `cta/fifth - default` | `darkBlue/90` | Пятый CTA (тёмный) |
| `cta/fifth - hover` | `darkBlue/90` | Hover fifth |
| `cta/fifth - disabled` | `darkBlue/90` | Disabled fifth |
| `cta/disabled` | `white/100-4a` | Общий disabled-оверлей |

### Текст

| Токен | → Primitive | Использование |
|---|---|---|
| `txt/primary/primary - default` | `white/100` | Основной текст |
| `txt/primary/primary - hover or current` | `white/100` | Primary hover/active |
| `txt/primary/primary - disabled` | `white/100-24a` | Disabled primary |
| `txt/primary/primary - placeholder` | `white/100-64a` | Плейсхолдер |
| `txt/secondary/secondary - default` | `white/90` | Вторичный текст |
| `txt/secondary/secondary - hover or current` | `white/90` | Secondary hover/active |
| `txt/secondary/secondary - disabled` | `white/90-24a` | Disabled secondary |
| `txt/secondary/secondary - placeholder` | `white/90-64a` | Secondary placeholder |
| `txt/tertiary/tertiary - default` | `white/70` | Третичный текст (подписи, метки) |
| `txt/tertiary/tertiary - hover or current` | `white/100` | Tertiary hover/active |
| `txt/tertiary/tertiary - disabled` | `white/70-24a` | Disabled tertiary |
| `txt/tertiary/tertiary - placeholder` | `white/70-64a` | Tertiary placeholder |
| `txt/fourth/fourth - default` | `darkBlue/90` | Текст на светлом фоне |
| `txt/fourth/fourth - hover or current` | `darkBlue/80` | Fourth hover/active |
| `txt/fourth/fourth - disabled` | `darkBlue/90-56a` | Disabled fourth |

### Фоны

| Токен | → Primitive | Использование |
|---|---|---|
| `backgrounds/sitebg` | `darkBlue/90` | Фон всего сайта |
| `backgrounds/siteHeader&Footer` | `darkBlue/100` | Хедер и футер |
| `backgrounds/cardHead` | `darkBlue/80` | Шапка карточки |
| `backgrounds/cardBody` | `darkBlue/70` | Тело карточки |
| `backgrounds/cardContent` | `darkBlue/60` | Контент внутри карточки |
| `backgrounds/cardContentOnCard` | `darkBlue/50` | Контент поверх карточки |
| `backgrounds/cardContent__disabled` | `darkBlue/60-40a` | Disabled контент |
| `backgrounds/cardBody__disabled` | `darkBlue/70-40a` | Disabled тело |
| `backgrounds/Input-dropdown/inputfield-dark__default` | `darkBlue/90-80a` | Тёмный инпут |
| `backgrounds/Input-dropdown/inputfield-light__default` | `darkBlue/80` | Светлый инпут |
| `backgrounds/Input-dropdown/inputfield-dark__disabled` | `darkBlue/90-56a` | Disabled инпут |
| `backgrounds/Input-dropdown/NestedList` | `darkBlue/90-80a` | Вложенный список |

### Обводки

| Токен | → Primitive | Использование |
|---|---|---|
| `strokes/light-default` | `darkBlue/70` | Обводка на тёмном фоне (default) |
| `strokes/light-focussed` | `darkBlue/60` | Focus на тёмном фоне |
| `strokes/light-disabled` | `darkBlue/60-40a` | Disabled на тёмном |
| `strokes/dark-default` | `darkBlue/80` | Обводка на более светлом |
| `strokes/dark-focussed` | `darkBlue/70` | Focus dark |
| `strokes/dark-hover` | `darkBlue/70` | Hover dark |
| `strokes/dark-disabled` | `darkBlue/60` | Disabled dark |
| `strokes/divider_ondark` | `darkBlue/70` | Разделитель на тёмном |
| `strokes/divider_onlight` | `darkBlue/50` | Разделитель на светлом |
| `strokes/tabbar__default` | `darkBlue/70` | Таббар default |
| `strokes/tabbar__selected` | `darkBlue/50` | Таббар selected |
| `strokes/anyBG-stroke` | `white/100-4a` | Универсальная обводка |
| `strokes/error` | `red/90-40` | Ошибка |
| `strokes/confirmation` | `green/40-12` | Подтверждение |
| `strokes/attention` | `orange/40-12` | Внимание |

### Уведомления

| Токен | → Primitive | Использование |
|---|---|---|
| `notifications/confirmation-fg` | `green/30` | Текст/иконка подтверждения |
| `notifications/confirmation-bg` | `green/80-40` | Фон подтверждения |
| `notifications/confirmation-bg-minor` | `green/80-40-64a` | Второстепенный фон |
| `notifications/alert-error-fg` | `red/40` | Текст ошибки |
| `notifications/alert-error-bg` | `red/40-12a` | Фон ошибки |
| `notifications/teaser-fg` | `gold/30` | Текст тизера |
| `notifications/teaser-fg__hover` | `gold/20` | Тизер hover |
| `notifications/teaser-bg` | `gold/80-32` | Фон тизера |
| `notifications/attention-fg` | `mocha/40` | Текст attention |
| `notifications/attention-bg` | `orange/40-12` | Фон attention |
| `notifications/info-fg` | `chartTints/20-64w` | Текст info |
| `notifications/info-bg` | `chartTints/20-24` | Фон info |

### Графики

| Токен | → Primitive |
|---|---|
| `charts/joyceBlue` | `chartTints/10` |
| `charts/woolfViolet` | `chartTints/20` |
| `charts/proustPeriwinkle` | `chartTints/30` |
| `charts/hesseCyan` | `chartTints/40` |
| `charts/cocteauMint` | `chartTints/50` |
| `charts/voltaireGreen` | `chartTints/70` |
| `charts/goetheGrove` | `chartTints/80` |
| `charts/mannMeadow` | `chartTints/90` |
| `charts/camusSun` | `chartTints/100` |
| `charts/chartA / chartB / chartC` | `graphTints/00, 20, 20` |
| `graphs/graphWhite` | `graphTints/00` |
| `graphs/graphBlue` | → `notifications/info-fg` |
| `graphs/graphCyan` | `graphTints/20` |
| `graphs/graphGreen` | → `notifications/confirmation-fg` |
| `graphs/graphGrey` | `graphTints/60` |
| `graphs/graphGrey-32a` | `graphTints/60-32a` |
| `graphs/graphDarkGrey` | `graphTints/80` |

### Vault-цвета (по типу vault)

Каждый vault-тип имеет 6 токенов: `cardBg / ctaDefault / strokeDefault+ctaHover / tagDefault / txtDefault / txtHover`.

| Тип vault | Primitive-группа |
|---|---|
| `default` | `vaultTints/Default` |
| `clm` | `vaultTints/CLM` |
| `pool` | `vaultTints/CLM vault` |
| `retired` | `vaultTints/Retired` |
| `ultimate` | `vaultTints/Ultimate` |
| `Paused` | `vaultTints/paused` |
| `lightBlue` | `lightBlue` |
| `navy` | `navy` |

---

## Типографика

Шрифт: **DM Sans** (variable font, `opsz` axis).

Типографика задаётся через **5 CSS-переменных** на ноду, без Figma Text Styles:

| Переменная | Пример |
|---|---|
| `--fontfamily/fontfamily-dm-sans` | DM Sans |
| `--fontweight/fontweight-medium` | 500 |
| `--fontweight/fontweight-regular` | 400 |
| `--fontsizes/h4-accent` | ~20px |
| `--fontsizes/fontsize-body` | 16px |
| `--fontsizes/fontsize-md` | 14px |
| `--lineheight/lineheight-h4-accent` | 28px |
| `--lineheight/lineheight-h4` | 24px |
| `--lineheight/lineheight-body` | 24px |
| `--lineheight/lineheight-m` | 22px |
| `--letterspacing/letterspacing-0` | 0px |

Подтверждённые text-стили (из дизайн-контекста):

| Стиль | Family | Weight | Size | LH |
|---|---|---|---|---|
| `h/h4-accent` | DM Sans Medium | 500 | `h4-accent` | 28px |
| `h/h4` | DM Sans Medium | 500 | `fontsize-body` (16px) | 24px |
| `p/body/regular` | DM Sans 9pt Regular | 400 | `fontsize-body` (16px) | 24px |
| `p/md/regular` | DM Sans 9pt Regular | 400 | `fontsize-md` (14px) | 22px |

---

## Замечания после сканирования

- [x] Привязки Semantic → Primitive: сделаны (все Semantic — алиасы, прибитых hex нет)
- [ ] Кириллица в шрифте: DM Sans поддерживает кириллицу, но Beefy — английский продукт
- [ ] vaultTints / graphTints / lightBlue / navy / mocha / orange — primitive-группы в файле, значения не попали в урезанный вывод; при необходимости добавить отдельным `use_figma`-скриптом
- [ ] `setTextStyleIdAsync` — **не применять**, Beefy DS работает без Figma Text Styles
