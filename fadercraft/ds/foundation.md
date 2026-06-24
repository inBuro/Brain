# Foundation (scan)

**Источник:** https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Fadercraft
**Дата сканирования:** 2026-06-19

3 коллекции Variables. На экранах используется **только Semantic**. Primitives — внутренняя реализация.

---

## Слой 1 — Primitives

### Палитра Neutral (основная, нейтральная)

Холодно-синеватая серая шкала. Фундамент всех фонов, текстов, обводок.

| Токен | Hex |
|---|---|
| `Primitives/Neutral/00` | `#FFFFFF` |
| `Primitives/Neutral/50` | `#F9F9FB` |
| `Primitives/Neutral/100` | `#F1F1F4` |
| `Primitives/Neutral/200` | `#E0E1E7` |
| `Primitives/Neutral/300` | `#C6C7D2` |
| `Primitives/Neutral/400` | `#989BAE` |
| `Primitives/Neutral/500` | `#70748F` |
| `Primitives/Neutral/600` | `#595C73` |
| `Primitives/Neutral/700` | `#414457` |
| `Primitives/Neutral/800` | `#292C3C` |
| `Primitives/Neutral/900` | `#1A1C28` |
| `Primitives/Neutral/1000` | `#0F1017` |

С альфой: `Neutral/500-40`

### Палитра Mint (primary action)

Бирюзово-зелёный акцент. CTA-кнопки, состояние Mixer.

| Токен | Hex |
|---|---|
| `Primitives/Mint/50` | `#F6FEF9` |
| `Primitives/Mint/100` | `#E8FCF7` |
| `Primitives/Mint/100-44` | — @44% |
| `Primitives/Mint/100-88` | — @68% |
| `Primitives/Mint/200` | `#CCFACE` (approx) |
| `Primitives/Mint/300` | `#A1F7DF` |
| `Primitives/Mint/400` | `#63F2CA` |
| `Primitives/Mint/500` | `#1AE6AC` |
| `Primitives/Mint/600` | `#15B589` |
| `Primitives/Mint/700` | `#138665` |
| `Primitives/Mint/800` | `#0E5742` |
| `Primitives/Mint/900` | `#0A3829` |

С альфой: `Mint/400-40`, `Mint/500-40`

### Палитра Lavender (instrument accent)

Голубо-лавандовый. Поверхность Instrument-слоя.

| Токен | Hex |
|---|---|
| `Primitives/Lavender/50` | `#F6F9FE` |
| `Primitives/Lavender/100` | `#E8F0FC` |
| `Primitives/Lavender/200` | `#CCDEFA` |
| `Primitives/Lavender/300` | `#A1C2F7` |
| `Primitives/Lavender/400` | `#639AF2` |
| `Primitives/Lavender/500` | `#1A68E6` |
| `Primitives/Lavender/600` | `#1653B5` |
| `Primitives/Lavender/700` | `#133F86` |
| `Primitives/Lavender/800` | `#0E2A57` |
| `Primitives/Lavender/900` | `#0A1C38` |

С альфой: `Lavender/500-40`

### Палитра Amber (secondary action, mute)

Янтарно-оранжевый. Secondary CTA и состояние Mute.

| Токен | Hex |
|---|---|
| `Primitives/Amber/50` | `#FEF9F6` |
| `Primitives/Amber/400` | `#FFAD56` |
| `Primitives/Amber/500` | `#E6831A` |
| `Primitives/Amber/600–900` | (тёмнее) |

С альфой: `Amber/500-40`

### Палитра Red (destructive, danger)

| Токен | Hex |
|---|---|
| `Primitives/Red/400` | `#F26363` |
| `Primitives/Red/500` | `#E61A1A` |

С альфой: `Red/500-40`

### Палитра Citron (highlight)

Жёлто-лаймовый акцент.

| Токен | Hex |
|---|---|
| `Primitives/Citron/400` | `#FAFF07` |
| `Primitives/Citron/400-70` | — @70% |
| `Primitives/Citron/400-40` | — @40% |
| `Primitives/Citron/500` | `#D3D700` |

С альфой: `Citron/500-40`

### Палитра Hue (цвета режимов LCXL)

12 слотов — цвета Custom Modes на контроллере. Каждый в трёх насыщенностях: 100% / 70% / 40%.

| Токен | Hex | Роль |
|---|---|---|
| `Primitives/Hue/01` | `#D86A07` | Orange |
| `Primitives/Hue/02` | `#8B8E1A` | Olive |
| `Primitives/Hue/03` | — | *отсутствует в коллекции* |
| `Primitives/Hue/04` | `#1FA9A9` | Teal |
| `Primitives/Hue/05` | `#945CFF` | Purple |
| `Primitives/Hue/06` | `#23BE2F` | Green |
| `Primitives/Hue/07` | `#FF3A96` | Pink |
| `Primitives/Hue/08` | `#F22CFF` | Magenta |
| `Primitives/Hue/09` | `#199BFF` | Blue |
| `Primitives/Hue/09-40 X` | — @55% | особый вариант |
| `Primitives/Hue/10` | `#808080` | *заглушка (не назначен)* |
| `Primitives/Hue/11` | `#808080` | *заглушка (не назначен)* |
| `Primitives/Hue/12` | `#FF3B90` | Coral Pink |

---

## Слой 2 — Semantic токены

Все значения — VARIABLE_ALIAS на Primitives. Прибитые hex запрещены.

### Фоны

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Bg/Default` | `Neutral/300` | Основной фон страницы |
| `Semantic/Bg/Surface` | `Neutral/400` | Поверхность / карточка |
| `Semantic/Bg/Dark` | `Neutral/1000` | Тёмный фон |

### Обводки

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Border/Default` | `Neutral/800` | Стандартная обводка |

### Действия (CTA)

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Action/Primary` | `Mint/400` | Primary CTA (бирюзовый) |
| `Semantic/Action/Secondary` | `Amber/400` | Secondary CTA (янтарный) |
| `Semantic/Action/Dark` | `Neutral/1000` | Dark-кнопка |
| `Semantic/Action/Dark/Text` | `Neutral/200` | Текст на Dark-кнопке |

### Поверхности (слои устройства)

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Surface/Service` | `Neutral/800` | Service-фейдеры |
| `Semantic/Surface/Instrument` | `Lavender/400` | Instrument-слой |
| `Semantic/Surface/Mixer` | `Mint/400` | Mixer-слой |
| `Semantic/Surface/Mute` | `Amber/400` | Mute-состояние |

### Текст

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Text/OnLight/Primary` | `Neutral/1000` | Основной текст на светлом |
| `Semantic/Text/OnLight/Secondary` | `Neutral/700` | Вторичный текст на светлом |
| `Semantic/Text/OnLight/Tertiary` | `Neutral/600` | Третичный текст на светлом |
| `Semantic/Text/OnDark/Primary` | `Neutral/00` | Основной текст на тёмном |
| `Semantic/Text/OnDark/Secondary` | `Neutral/300` | Вторичный текст на тёмном |
| `Semantic/Text/OnDark/Tertiary` | `Neutral/400` | Третичный текст на тёмном |
| `Semantic/Text/OnDark/Badge` | `Neutral/400` | Текст бейджа |

### Иконки и состояния

| Токен | → Primitive | Использование |
|---|---|---|
| `Semantic/Icon/Primary` | `Neutral/1000` | Основной цвет иконок |
| `Semantic/State/Selected/Background` | `Neutral/1000` | Фон выбранного элемента |
| `Semantic/State/Selected/Text` | `Neutral/200` | Текст выбранного элемента |

---

## Слой 3 — Typography и Density

### Typography (веса шрифта)

Коллекция `Typography`, 5 STRING-переменных:

| Переменная | Значение |
|---|---|
| `Weight/Regular` | `Regular` |
| `Weight/Medium` | `Medium` |
| `Weight/SemiBold` | `SemiBold` |
| `Weight/Bold` | `Bold` |

Шрифт продукта — Inter (предположительно; уточнить при первой работе с текстом).

### Density (отступы и размеры)

Коллекция `Density`, 34 FLOAT-переменных. Система: **4px grid**, имена = rem-единицы (×4 = px).

| Имя | px | | Имя | px |
|---|---|---|---|---|
| `0` | 0 | | `6` | 24 |
| `0,25` | 1 | | `6,25` | 25 |
| `0,5` | 2 | | `6,5` | 26 |
| `0,75` | 3 | | `7` | 28 |
| `1` | 4 | | `7,5` | 30 |
| `1,25` | 5 | | `8` | 32 |
| `1,5` | 6 | | `8,5` | 34 |
| `2` | 8 | | `9` | 36 |
| `2,5` | 10 | | `10` | 40 |
| `3` | 12 | | `10,5` | 42 |
| `3,5` | 14 | | `12` | 48 |
| `4` | 16 | | `12,5` | 50 |
| `4,25` | 17 | | `15,5` | 62 |
| `4,5` | 18 | | `999` | 9999 |
| `5` | 20 | | | |

Негативные: `-0,5`→−2px, `-1`→−4px, `-2`→−8px, `-3`→−12px, `-4`→−16px

---

## Замечания после сканирования

- [x] Semantic → Primitive: привязки сделаны (все Semantic — алиасы)
- [ ] Шрифт: Inter (предположительно) — уточнить при работе с текстовыми нодами
- [ ] Hue/03 отсутствует — пропущен слот; при добавлении 3-го режима нужно добавить
- [ ] Hue/10, Hue/11 = #808080 (заглушки); режимы не назначены
- [ ] Одна тема (Light) — тёмной темы нет (в отличие от Beefy)
- [ ] `Semantic/Surface/Service` → `Neutral/800` и `Semantic/Border/Default` → `Neutral/800` — один и тот же примитив; при рефакторинге учитывать
