# Primitives — raw color palette

Источник: Figma → Variables → коллекция **Primitives** в `v2.4 Beefy Design System`
Статус: **full** — все актуальные primitives задокументированы. Коллекция уменьшилась со 160 до **~130** после удаления `vaultTints-backup/*` 2026-05-15.
Обновлено: 2026-05-15

## Что это

Primitives — raw color ramps (tints/shades) для всех brand и functional цветов. Это «ground truth» hex-значения, на которые ссылается семантический слой в коллекции Colors (122 vars).

Коллекция помечена `hiddenFromPublishing: true` — это file-internal палитра. Дизайнеры обычно не используют её напрямую, а через семантические алиасы из коллекции `Colors`.

## Naming convention

Имя переменной — `{family}/{step}`:
- `family` — название группы (gold, green, orange, red, darkBlue, white, chartTints, graphTints, vaultTints, vaultTints-backup)
- `step` — позиция на шкале, обычно 10 (lightest) → 100 (darkest), шагом 10. Не у всех семейств заполнены все ступени.

**Суффиксы:**
- `-{N}a` = **alpha-вариант**. `40-12a` = `40` с непрозрачностью 12%.
- `-{N}w` = **white-blended вариант**. `20-64w` = `20` с подмесом белого 64%.
- `-{N}` без `a`/`w` (например `70-20`, `80-32`, `40-12`) = **pre-baked blend** на тёмной поверхности — сохранённый сплошным hex для производительности. Использовать можно, но это не alpha-вариант (alpha=1, hex другой).

**Иерархическая группа:** `vaultTints` и `vaultTints-backup` имеют под-семейства (`default`, `clm`, `pool`, `ultimate`, `retired`, `Paused`).

## Families

### gold (13 vars) — основной brand accent (тёплый)

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `gold/10` | `#F7F3E3` | 1 | lightest |
| `gold/20` | `#F7E9CA` | 1 | |
| `gold/30` | `#F8DFA9` | 1 | |
| `gold/40` | `#F3D894` | 1 | |
| `gold/50` | `#ECCC7D` | 1 | |
| `gold/60` | `#E3BD63` | 1 | |
| `gold/70` | `#D7A861` | 1 | |
| `gold/80` | `#B17F49` | 1 | |
| `gold/90` | `#865C3B` | 1 | |
| `gold/100` | `#5F412E` | 1 | darkest |
| `gold/40-12a` | `#F3D894` | 0.12 | alpha вариант |
| `gold/70-20` | `#4F4956` | 1 | pre-baked blend (на тёмной surface) |
| `gold/80-32` | `#514444` | 1 | pre-baked blend |

### green (14 vars) — success / положительные метрики

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `green/10` | `#E3FAEB` | 1 | |
| `green/20` | `#BAF0CA` | 1 | |
| `green/30` | `#95E2A8` | 1 | |
| `green/40` | `#72D286` | 1 | |
| `green/50` | `#53BE64` | 1 | |
| `green/60` | `#449A4D` | 1 | |
| `green/70` | `#368A4D` | 1 | |
| `green/80` | `#2A784C` | 1 | |
| `green/90` | `#1F6549` | 1 | |
| `green/100` | `#155042` | 1 | |
| `green/40-12` | `#354D56` | 1 | pre-baked blend |
| `green/50-20a` | `#53BE64` | 0.20 | alpha вариант |
| `green/80-40` | `#274846` | 1 | pre-baked blend |
| `green/80-40-64a` | `#274846` | 0.64 | alpha поверх blend |

### orange (13 vars) — warning / акцент

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `orange/10` | `#FFF3E7` | 1 | |
| `orange/20` | `#FFEAD6` | 1 | |
| `orange/30` | `#FFDEBD` | 1 | |
| `orange/40` | `#FFD1A3` | 1 | |
| `orange/50` | `#FFC386` | 1 | |
| `orange/60` | `#FFAD5A` | 1 | |
| `orange/70` | `#FFA245` | 1 | |
| `orange/80` | `#FF973D` | 1 | |
| `orange/90` | `#FF8D29` | 1 | |
| `orange/100` | `#FF8317` | 1 | |
| `orange/40-12` | `#3F3C4E` | 1 | pre-baked blend |
| `orange/50-20a` | `#FFC386` | 0.20 | alpha вариант |
| `orange/80-40` | `#7C5440` | 1 | pre-baked blend |

### red (13 vars) — danger / negative

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `red/10` | `#FFE9E3` | 1 | |
| `red/20` | `#FFDAD2` | 1 | |
| `red/30` | `#FFC4B8` | 1 | |
| `red/40` | `#FFAD9E` | 1 | |
| `red/50` | `#FF9073` | 1 | |
| `red/60` | `#FC6D48` | 1 | |
| `red/70` | `#F5623D` | 1 | |
| `red/80` | `#F05832` | 1 | |
| `red/90` | `#EA4E28` | 1 | |
| `red/100` | `#E93D14` | 1 | |
| `red/40-12a` | `#3F384D` | 1 | pre-baked blend (название с `a`, но alpha=1 — возможно legacy) |
| `red/80-32` | `#65373D` | 1 | pre-baked blend |
| `red/90-40` | `#EA4E28` | 0.40 | alpha вариант |

### darkBlue (16 vars) — основной background / surface family

Шкала начинается с `40` (нет 10/20/30) — это семейство глубоких поверхностей.

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `darkBlue/40` | `#3F4574` | 1 | lightest в группе |
| `darkBlue/50` | `#363B63` | 1 | (использован в node 5935:760, см. примеры) |
| `darkBlue/60` | `#2D3153` | 1 | |
| `darkBlue/70` | `#242842` | 1 | |
| `darkBlue/80` | `#1C1E32` | 1 | |
| `darkBlue/90` | `#111321` | 1 | |
| `darkBlue/100` | `#020203` | 1 | почти чёрный |
| `darkBlue/100-64a` | `#020203` | 0.64 | |
| `darkBlue/90-80a` | `#111321` | 0.80 | |
| `darkBlue/90-56a` | `#111321` | 0.56 | |
| `darkBlue/80-64a` | `#1C1E32` | 0.64 | |
| `darkBlue/80-56a` | `#1C1E32` | 0.56 | |
| `darkBlue/70-32a` | `#242842` | 0.32 | |
| `darkBlue/70-40a` | `#242842` | 0.40 | |
| `darkBlue/60-40a` | `#2D3153` | 0.40 | |
| `darkBlue/40-32a` | `#3F4574` | 0.32 | |

### white (14 vars) — текст / нейтральные на тёмной поверхности

Несмотря на имя `white`, шкала идёт от тёмного (`20` = #3C3A47) к светлому (`100` = #F5F5FF). Это «семейство шрифтов на тёмном фоне», а не белый сам по себе.

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `white/20` | `#3C3A47` | 1 | tone-on-tone darkest |
| `white/70` | `#999CB3` | 1 | secondary text |
| `white/80` | `#BCBECD` | 1 | |
| `white/90` | `#DADCE8` | 1 | primary text muted |
| `white/100` | `#F5F5FF` | 1 | primary text |
| `white/100-64a` | `#F5F5FF` | 0.64 | |
| `white/100-24a` | `#F5F5FF` | 0.24 | |
| `white/100-4a` | `#F5F5FF` | 0.04 | |
| `white/90-64a` | `#DADCE8` | 0.64 | |
| `white/90-24a` | `#DADCE8` | 0.24 | |
| `white/90-4a` | `#DADCE8` | 0.04 | |
| `white/70-64a` | `#999CB3` | 0.64 | |
| `white/70-24a` | `#999CB3` | 0.24 | |
| `white/70-4a` | `#999CB3` | 0.04 | |

### chartTints (11 vars) — палитра для charts/data viz

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `chartTints/10` | `#3D5CF5` | 1 | насыщенный синий |
| `chartTints/20` | `#5C70D6` | 1 | |
| `chartTints/30` | `#5C99D6` | 1 | |
| `chartTints/40` | `#5CC2D6` | 1 | |
| `chartTints/50` | `#5CD6AD` | 1 | (60 пропущен) |
| `chartTints/70` | `#70D65C` | 1 | |
| `chartTints/80` | `#8FD65C` | 1 | |
| `chartTints/90` | `#B0D65C` | 1 | |
| `chartTints/100` | `#D6D65C` | 1 | |
| `chartTints/20-64w` | `#9CAEFF` | 1 | white-blended вариант 20 |
| `chartTints/20-24` | `#313965` | 1 | pre-baked blend |

### graphTints (5 vars) — палитра для линейных графиков

| Token | Hex | Alpha | Note |
|---|---|---|---|
| `graphTints/00` | `#D9E7F2` | 1 | (нумерация с `00`, не `10`) |
| `graphTints/20` | `#ABCBE3` | 1 | |
| `graphTints/60` | `#6F75A3` | 1 | |
| `graphTints/80` | `#393E62` | 1 | |
| `graphTints/60-32a` | `#6A71AE` | 0.32 | (hex отличается от 60 — особый pre-baked) |

### vaultTints (31 vars) — domain-specific цвета по типам vault

Каждый sub-family имеет ramp `20 / 50 / 70 / 80 / 90 / 100` (6 шагов).

#### vaultTints/default (6) — стандартный vault

| Token | Hex |
|---|---|
| `vaultTints/default/20` | `#C4CCFF` |
| `vaultTints/default/50` | `#838DCE` |
| `vaultTints/default/70` | `#3C4484` |
| `vaultTints/default/80` | `#323758` |
| `vaultTints/default/90` | `#242842` |
| `vaultTints/default/100` | `#202236` |

#### vaultTints/clm (6) — Concentrated Liquidity Manager

| Token | Hex |
|---|---|
| `vaultTints/clm/20` | `#B2D1FF` |
| `vaultTints/clm/50` | `#6199ED` |
| `vaultTints/clm/70` | `#0054D4` |
| `vaultTints/clm/80` | `#213B70` |
| `vaultTints/clm/90` | `#1C2A52` |
| `vaultTints/clm/100` | `#162447` |

#### vaultTints/pool (6) — pool-based vaults

| Token | Hex |
|---|---|
| `vaultTints/pool/20` | `#D2C7FF` |
| `vaultTints/pool/50` | `#957AFF` |
| `vaultTints/pool/70` | `#4C2CDE` |
| `vaultTints/pool/80` | `#3D2A7B` |
| `vaultTints/pool/90` | `#2B1E54` |
| `vaultTints/pool/100` | `#241D46` |

#### vaultTints/ultimate (6)

| Token | Hex |
|---|---|
| `vaultTints/ultimate/20` | `#A7E2EB` |
| `vaultTints/ultimate/50` | `#6CA0A8` |
| `vaultTints/ultimate/70` | `#145E6A` |
| `vaultTints/ultimate/80` | `#19464D` |
| `vaultTints/ultimate/90` | `#173236` |
| `vaultTints/ultimate/100` | `#1A262D` |

#### vaultTints/retired (6)

| Token | Hex |
|---|---|
| `vaultTints/retired/20` | `#D3C9FF` |
| `vaultTints/retired/50` | `#9486CF` |
| `vaultTints/retired/70` | `#4B4469` |
| `vaultTints/retired/80` | `#3A3357` |
| `vaultTints/retired/90` | `#2A263B` |
| `vaultTints/retired/100` | `#232031` |

#### vaultTints/Paused (1) — особый scope

| Token | Hex | Note |
|---|---|---|
| `vaultTints/Paused/100` | `#534B47` | scope ограничен `SHAPE_FILL` (единственный с restricted scope) |

### vaultTints-backup — **удалена 2026-05-15**

Группа из 30 переменных (`default/*`, `clm/*`, `pool/*`, `ultimate/*`, `retired/*` по 6 шагов каждая) удалена из Primitives после миграции всех ссылок `vaultColors/*` на `vaultTints/*`. Значения идентично дублировали `vaultTints`.

Структура коллекции теперь чище: один источник истины для domain-specific цветов (`vaultTints`), без legacy-параллели.

## Жёсткие правила

- **Не использовать primitives напрямую в дизайне.** Только через семантические алиасы из коллекции Colors.
- **Не путать суффиксы:** `-Na` ≠ `-N` без `a`. Первое — alpha, второе — pre-baked blend (alpha=1).
- **`vaultTints/Paused/100`** имеет ограниченный scope (`SHAPE_FILL` only). Для других целей не использовать.

## Открытые вопросы

Вынесены в [questions.md](../questions.md) (категория Primitives).

## Что дальше

После того как соберём полный список primitives — заполнить `tokens/colors.md`: 122 семантических токена, каждый со ссылкой на конкретный primitive.
