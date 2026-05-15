# Colors — semantic tokens

Источник: Figma → Variables → коллекция **Colors** (Mode 1) в `v2.4 Beefy Design System`
Статус: full — **121 семантический токен** (+1 `vaultColors/Paused/cardBg` добавлен 2026-05-15), все через aliasData связаны с primitives. Опечатки в именах (`tertiarry`, `defailt`, `sellected`, `forth`, `chatB`, `grpaphs`) исправлены 2026-05-15.
Обновлено: 2026-05-15

## Что это

Семантический слой над `Primitives`. **Это то, чем дизайнер реально пользуется** в макетах. Каждый токен здесь — alias на конкретный primitive (или, в редких случаях, на другой semantic token).

См. [tokens/primitives.md](primitives.md) для значений primitives.

## Naming convention

Иерархия: `{category}/{subgroup}/{name-or-state}` или `{category}/{name}`.

**8 категорий:**
1. `txt` — цвета текста
2. `cta` — фон/состояния кнопок
3. `backgrounds` — заливки поверхностей
4. `strokes` — бордеры/линии/дивайдеры
5. `notifications` — алерты, состояния (info/error/confirmation/attention/teaser)
6. `vaultColors` — domain-specific под тип vault
7. `charts` — палитра баров диаграмм с литературными именами
8. `graphs` — линии line-charts (бывший `grpaphs`, переименован 2026-05-15)

**Опечатки исправлены 2026-05-15:** `tertiarry → tertiary` (×4), `dark-defailt → dark-default`, `tabbar__sellected → tabbar__selected`, `forth - minor → fourth - minor`, `chatB → chartB`, group `grpaphs → graphs` (7 vars).

## Особенности связей

- **Большинство** alias-ят напрямую в `Primitives` (см. колонку «→ Primitive»).
- **2 токена 3-уровневые** (semantic → semantic → primitive):
  - `graphs/graphBlue` → `{notifications.info-fg}` → `chartTints/20-64w`
  - `graphs/graphGreen` → `{notifications.confirmation-fg}` → `green/30`
- **vaultColors** все ссылаются на `vaultTints/*` после миграции 2026-05-15. `vaultTints-backup` удалён.

---

## txt — текст (15 vars)

| Token | Hex | α | → Primitive |
|---|---|---|---|
| `txt/primary/primary - default` | `#F5F5FF` | 1 | `white/100` |
| `txt/primary/primary - hover or current` | `#F5F5FF` | 1 | `white/100` |
| `txt/primary/primary - placeholder` | `#F5F5FF` | 0.64 | `white/100-64a` |
| `txt/primary/primary - disabled` | `#F5F5FF` | 0.20 | `white/100-24a` |
| `txt/secondary/secondary - default` | `#DADCE8` | 1 | `white/90` |
| `txt/secondary/secondary - hover or current` | `#DADCE8` | 1 | `white/90` |
| `txt/secondary/secondary - placeholder` | `#DADCE8` | 0.64 | `white/90-64a` |
| `txt/secondary/secondary - disabled` | `#DADCE8` | 0.20 | `white/90-24a` |
| `txt/tertiary/tertiary - default` *(sic)* | `#999CB3` | 1 | `white/70` |
| `txt/tertiary/tertiary - hover or current` | `#F5F5FF` | 1 | `white/100` *(подъём до primary при hover)* |
| `txt/tertiary/tertiary - placeholder` | `#999CB3` | 0.64 | `white/70-64a` |
| `txt/tertiary/tertiary - disabled` | `#999CB3` | 0.24 | `white/70-24a` |
| `txt/fourth/fourth - default` | `#111321` | 1 | `darkBlue/90` *(тёмный текст на светлом фоне)* |
| `txt/fourth/fourth - hover or current` | `#1C1E32` | 1 | `darkBlue/80` |
| `txt/fourth/fourth - disabled` | `#111321` | 0.56 | `darkBlue/90-56a` |

**Заметка:** `fourth` — обратная иерархия (тёмный текст). Используется когда фон светлый (например, теги, акцентные плашки).

---

## cta — кнопки (17 vars)

| Token | Hex | α | → Primitive | Note |
|---|---|---|---|---|
| `cta/primary - default` | `#72D286` | 1 | `green/40` | основной зелёный CTA |
| `cta/primary - hover` | `#BAF0CA` | 1 | `green/20` | светлеет при hover |
| `cta/primary - disabled` | `#354D56` | 1 | `green/40-12` | тёмный pre-baked |
| `cta/secondary - default` | `#ECCC7D` | 1 | `gold/50` | золотой |
| `cta/secondary - hover` | `#F8DFA9` | 1 | `gold/30` | |
| `cta/secondary - disabled` | `#4F4956` | 1 | `gold/70-20` | |
| `cta/tertiary - default` | `#363B63` | 1 | `darkBlue/50` | нейтральный (← узел 5935:760 был именно тут) |
| `cta/tertiary - hover` | `#3F4574` | 1 | `darkBlue/40` | |
| `cta/tertiary - disabled` | `#3F4574` | 0.32 | `darkBlue/40-32a` | |
| `cta/fourth - default` | `#1C1E32` | 1 | `darkBlue/80` | тёмный subtle CTA |
| `cta/fourth - minor` *(sic)* | `#1C1E32` | 0.64 | `darkBlue/80-64a` | |
| `cta/fourth - hover` | `#242842` | 1 | `darkBlue/70` | |
| `cta/fourth - disabled` | `#242842` | 0.32 | `darkBlue/70-32a` | |
| `cta/fifth - default` | `#111321` | 1 | `darkBlue/90` | самый тёмный CTA |
| `cta/fifth - hover` | `#111321` | 1 | `darkBlue/90` | (одинаковый с default — нет визуального hover effect) |
| `cta/fifth - disabled` | `#111321` | 1 | `darkBlue/90` | (тоже одинаковый) |
| `cta/disabled` | `#F5F5FF` | 0.04 | `white/100-4a` | глобальный disabled (поверх любого фона) |

**Заметки:**
- `fifth` имеет одинаковые hex для default/hover/disabled — стоит спросить, не bug ли (нет визуальной разницы между состояниями).
- `fourth - minor` — отдельный токен, не путать с состояниями `fourth`.

---

## backgrounds — поверхности (12 vars)

| Token | Hex | α | → Primitive | Note |
|---|---|---|---|---|
| `backgrounds/cardHead` | `#1C1E32` | 1 | `darkBlue/80` | шапка карточки |
| `backgrounds/cardBody` | `#242842` | 1 | `darkBlue/70` | тело карточки |
| `backgrounds/cardBody__disabled` | `#242842` | 0.40 | `darkBlue/70-40a` | |
| `backgrounds/cardContent` | `#2D3153` | 1 | `darkBlue/60` | контентный блок внутри карточки |
| `backgrounds/cardContent__disabled` | `#2D3153` | 0.40 | `darkBlue/60-40a` | |
| `backgrounds/cardContentOnCard` | `#363B63` | 1 | `darkBlue/50` | вложенный контент (карточка-в-карточке) |
| `backgrounds/sitebg` | `#111321` | 1 | `darkBlue/90` | фон страницы |
| `backgrounds/siteHeader&Footer` | `#020203` | 1 | `darkBlue/100` | шапка/подвал сайта (самый тёмный) |
| `backgrounds/Input-dropdown/NestedList` | `#111321` | 0.80 | `darkBlue/90-80a` | вложенный list внутри dropdown |
| `backgrounds/Input-dropdown/inputfield-dark__default` | `#111321` | 0.80 | `darkBlue/90-80a` | dark input |
| `backgrounds/Input-dropdown/inputfield-dark__disabled` | `#111321` | 0.56 | `darkBlue/90-56a` | |
| `backgrounds/Input-dropdown/inputfield-light__default` | `#1C1E32` | 1 | `darkBlue/80` | light input (на тёмной карточке) |

**Иерархия глубины** (от поверхности к фону): `siteHeader&Footer` (100) → `sitebg` (90) → `cardHead` (80) → `cardBody` (70) → `cardContent` (60) → `cardContentOnCard` (50). Полный спектр darkBlue 50-100.

---

## strokes — бордеры и линии (15 vars)

| Token | Hex | α | → Primitive | Note |
|---|---|---|---|---|
| `strokes/light-default` | `#242842` | 1 | `darkBlue/70` | бордер на светлом фоне |
| `strokes/light-focussed` | `#2D3153` | 1 | `darkBlue/60` | |
| `strokes/light-disabled` | `#2D3153` | 0.40 | `darkBlue/60-40a` | |
| `strokes/dark-default` *(sic)* | `#1C1E32` | 1 | `darkBlue/80` | бордер на тёмном фоне |
| `strokes/dark-focussed` | `#242842` | 1 | `darkBlue/70` | |
| `strokes/dark-hover` | `#242842` | 1 | `darkBlue/70` | (одинаков с focussed) |
| `strokes/dark-disabled` | `#2D3153` | 1 | `darkBlue/60` | |
| `strokes/divider_ondark` | `#242842` | 1 | `darkBlue/70` | дивайдер на тёмном |
| `strokes/divider_onlight` | `#363B63` | 1 | `darkBlue/50` | дивайдер на светлом |
| `strokes/tabbar__default` | `#242842` | 1 | `darkBlue/70` | неактивный таб |
| `strokes/tabbar__selected` *(sic)* | `#363B63` | 1 | `darkBlue/50` | активный таб |
| `strokes/error` | `#EA4E28` | 0.40 | `red/90-40` | бордер при ошибке |
| `strokes/confirmation` | `#354D56` | 1 | `green/40-12` | подтверждение |
| `strokes/attention` | `#3F3C4E` | 1 | `orange/40-12` | внимание |
| `strokes/anyBG-stroke` | `#F5F5FF` | 0.04 | `white/100-4a` | универсальный hairline |

---

## notifications — алерты и состояния (12 vars)

Каждое состояние имеет пару `-fg` / `-bg` (foreground/background), плюс `-minor` для приглушённых вариантов.

| Token | Hex | α | → Primitive | State |
|---|---|---|---|---|
| `notifications/info-fg` | `#9CAEFF` | 1 | `chartTints/20-64w` | info text |
| `notifications/info-bg` | `#313965` | 1 | `chartTints/20-24` | info bg |
| `notifications/alert-error-fg` | `#FFAD9E` | 1 | `red/40` | error text |
| `notifications/alert-error-bg` | `#3F384D` | 1 | `red/40-12a` | error bg |
| `notifications/confirmation-fg` | `#95E2A8` | 1 | `green/30` | success text |
| `notifications/confirmation-bg` | `#274846` | 1 | `green/80-40` | success bg |
| `notifications/confirmation-bg-minor` | `#274846` | 0.64 | `green/80-40-64a` | success bg (приглушённый) |
| `notifications/attention-fg` | `#FFD1A3` | 1 | `orange/40` | warning text |
| `notifications/attention-bg` | `#3F3C4E` | 1 | `orange/40-12` | warning bg |
| `notifications/teaser-fg` | `#F8DFA9` | 1 | `gold/30` | teaser/promo text |
| `notifications/teaser-fg__hover` | `#F7E9CA` | 1 | `gold/20` | |
| `notifications/teaser-bg` | `#514444` | 1 | `gold/80-32` | teaser/promo bg |

**Семантика:**
- `info` (синий) — нейтральная информация
- `alert-error` (красный) — критические ошибки
- `confirmation` (зелёный) — успех
- `attention` (оранжевый) — предупреждение
- `teaser` (золотой) — рекламные баннеры/промо

---

## vaultColors — domain-specific (30 vars)

5 типов vault: `default`, `clm`, `pool`, `ultimate`, `retired`. Для каждого — 6 ролей: `ctaDefault`, `cardBg`, `strokeDefault+ctaHover`, `tagDefault`, `txtDefault`, `txtHover`.

**Миграция выполнена 2026-05-15** (через MCP `use_figma`):
- Все 30 семантических ссылок переведены с `vaultTints-backup/*` на `vaultTints/*` (current)
- Фикс аномалии: `vaultColors/pool/txtHover` теперь корректно указывает на `vaultTints/pool/20` (`#D2C7FF`), а не на `vaultTints-backup/retired/20` (`#D3C9FF`) — визуальный сдвиг оттенка
- `vaultTints-backup/*` (30 primitives) теперь unreferenced — кандидат на удаление (требует отдельного подтверждения, см. примечания ниже)

Все ссылки идут на `vaultTints/*` (current). Hex-значения те же, что были (за исключением `pool/txtHover` — см. выше).

### vaultColors/default (6)

| Token | Hex | → Primitive |
|---|---|---|
| `vaultColors/default/ctaDefault` | `#242842` | `vaultTints/default/90` |
| `vaultColors/default/cardBg` | `#202236` | `vaultTints/default/100` |
| `vaultColors/default/strokeDefault+ctaHover` | `#323758` | `vaultTints/default/80` |
| `vaultColors/default/tagDefault` | `#3C4484` | `vaultTints/default/70` |
| `vaultColors/default/txtDefault` | `#838DCE` | `vaultTints/default/50` |
| `vaultColors/default/txtHover` | `#C4CCFF` | `vaultTints/default/20` |

### vaultColors/clm (6)

| Token | Hex | → Primitive |
|---|---|---|
| `vaultColors/clm/ctaDefault` | `#1C2A52` | `vaultTints/clm/90` |
| `vaultColors/clm/cardBg` | `#162447` | `vaultTints/clm/100` |
| `vaultColors/clm/strokeDefault+ctaHover` | `#213B70` | `vaultTints/clm/80` |
| `vaultColors/clm/tagDefault` | `#0054D4` | `vaultTints/clm/70` |
| `vaultColors/clm/txtDefault` | `#6199ED` | `vaultTints/clm/50` |
| `vaultColors/clm/txtHover` | `#B2D1FF` | `vaultTints/clm/20` |

### vaultColors/pool (6) — аномалия `pool/txtHover` исправлена

| Token | Hex | → Primitive | Note |
|---|---|---|---|
| `vaultColors/pool/ctaDefault` | `#2B1E54` | `vaultTints/pool/90` | |
| `vaultColors/pool/cardBg` | `#241D46` | `vaultTints/pool/100` | |
| `vaultColors/pool/strokeDefault+ctaHover` | `#3D2A7B` | `vaultTints/pool/80` | |
| `vaultColors/pool/tagDefault` | `#4C2CDE` | `vaultTints/pool/70` | |
| `vaultColors/pool/txtDefault` | `#957AFF` | `vaultTints/pool/50` | |
| `vaultColors/pool/txtHover` | `#D2C7FF` | `vaultTints/pool/20` | **fixed 2026-05-15** — ранее указывал на `vaultTints-backup/retired/20` (`#D3C9FF`); теперь `pool/20` (`#D2C7FF`). Hex слегка изменился. |

### vaultColors/ultimate (6)

| Token | Hex | → Primitive |
|---|---|---|
| `vaultColors/ultimate/ctaDefault` | `#173236` | `vaultTints/ultimate/90` |
| `vaultColors/ultimate/cardBg` | `#1A262D` | `vaultTints/ultimate/100` |
| `vaultColors/ultimate/strokeDefault+ctaHover` | `#19464D` | `vaultTints/ultimate/80` |
| `vaultColors/ultimate/tagDefault` | `#145E6A` | `vaultTints/ultimate/70` |
| `vaultColors/ultimate/txtDefault` | `#6CA0A8` | `vaultTints/ultimate/50` |
| `vaultColors/ultimate/txtHover` | `#A7E2EB` | `vaultTints/ultimate/20` |

### vaultColors/retired (6)

| Token | Hex | → Primitive |
|---|---|---|
| `vaultColors/retired/ctaDefault` | `#2A263B` | `vaultTints/retired/90` |
| `vaultColors/retired/cardBg` | `#232031` | `vaultTints/retired/100` |
| `vaultColors/retired/strokeDefault+ctaHover` | `#3A3357` | `vaultTints/retired/80` |
| `vaultColors/retired/tagDefault` | `#4B4469` | `vaultTints/retired/70` |
| `vaultColors/retired/txtDefault` | `#9486CF` | `vaultTints/retired/50` |
| `vaultColors/retired/txtHover` | `#D3C9FF` | `vaultTints/retired/20` |

### vaultColors/Paused (1) — single fill, добавлено 2026-05-15

| Token | Hex | → Primitive |
|---|---|---|
| `vaultColors/Paused/cardBg` | `#534B47` | `vaultTints/Paused/100` (scope: `SHAPE_FILL`) |

В отличие от других 5 vault-типов, у `Paused` только один semantic токен (cardBg), потому что в Primitives есть только одна Paused-переменная — `vaultTints/Paused/100` со scope `SHAPE_FILL`. Если в будущем понадобится полная гамма ролей (cta/text/stroke/tag) — сначала расширить Primitives, потом добавить semantics.

**Чего нет:** `vaultColors/Paused` — отсутствует, хотя primitive `vaultTints/Paused/100` существует. Используется ли он напрямую в макетах? Открытый вопрос.

---

## charts — palette баров диаграмм (12 vars)

Литературные имена. 9 «авторских» цветов идут от `joyceBlue` до `camusSun` — это, видимо, порядок в legend.

| Token | Hex | α | → Primitive |
|---|---|---|---|
| `charts/joyceBlue` | `#3D5CF5` | 1 | `chartTints/10` |
| `charts/woolfViolet` | `#5C70D6` | 1 | `chartTints/20` |
| `charts/proustPeriwinkle` | `#5C99D6` | 1 | `chartTints/30` |
| `charts/hesseCyan` | `#5CC2D6` | 1 | `chartTints/40` |
| `charts/cocteauMint` | `#5CD6AD` | 1 | `chartTints/50` |
| `charts/voltaireGreen` | `#70D65C` | 1 | `chartTints/70` |
| `charts/goetheGrove` | `#8FD65C` | 1 | `chartTints/80` |
| `charts/mannMeadow` | `#B0D65C` | 1 | `chartTints/90` |
| `charts/camusSun` | `#D6D65C` | 1 | `chartTints/100` |
| `charts/chartA` | `#D9E7F2` | 1 | `graphTints/00` |
| `charts/chartB` *(sic, → chartB)* | `#ABCBE3` | 1 | `graphTints/20` |
| `charts/chartC` | `#ABCBE3` | 1 | `graphTints/20` (дубликат hex с chartB) |

**Заметка:** `chartA/chartB/chartC` — отдельная подгруппа, видимо для других типов диаграмм. `chartB` и `chartC` указывают на один primitive — возможно намеренно, возможно не доделано.

---

## graphs *(sic, → graphs)* — линии line-charts (7 vars)

| Token | Hex | α | → Source |
|---|---|---|---|
| `graphs/graphWhite` | `#D9E7F2` | 1 | `graphTints/00` |
| `graphs/graphCyan` | `#ABCBE3` | 1 | `graphTints/20` |
| `graphs/graphBlue` | (наследуется) | — | **`{notifications.info-fg}`** → `chartTints/20-64w` |
| `graphs/graphGreen` | (наследуется) | — | **`{notifications.confirmation-fg}`** → `green/30` |
| `graphs/graphGrey-32a` | `#6A71AE` | 0.32 | `graphTints/60-32a` |
| `graphs/graphGrey` | `#6F75A3` | 1 | `graphTints/60` |
| `graphs/graphDarkGrey` | `#393E62` | 1 | `graphTints/80` |

**Особенность:** `graphBlue` и `graphGreen` — единственные семантические токены, которые ссылаются на **другой semantic**, а не напрямую на primitive. 3-уровневая цепочка. Если меняется `notifications.info-fg`, автоматически меняется `graphs.graphBlue`.

---

## Жёсткие правила

- **В дизайне используй ТОЛЬКО semantic tokens из этого файла.** Primitives — это implementation detail, дизайнер не должен думать «какой именно green/30».
- **Не путать `tertiary` ↔ `tertiary`, `defailt` ↔ `default`, `sellected` ↔ `selected`** — в Beefy это РАЗНЫЕ имена. Опечатки сохранены.
- **`vaultColors/pool/txtHover` ссылается на `retired/20`** — вероятно баг. Если используешь — знай, что hex другой, чем у остальных pool-токенов.
- **`cta/fifth` все три состояния одинаковые** — нет визуального изменения при hover/disabled. Возможно баг или намерение (для situations где hover не показывается).

## Открытые вопросы

Вынесены в [questions.md](../questions.md) (категория Colors). Сейчас в долге: `cta/fifth` идентичные state, `chartC` дублирует `chartB`. История закрытых решений по colors там же.
