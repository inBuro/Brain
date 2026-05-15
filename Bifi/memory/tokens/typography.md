# Typography — числовые типографические токены

Источник: Figma → Variables → коллекция **Typography** (Mode 1) в `v2.4 Beefy Design System`
Статус: full (32/32 vars: 1 fontFamily + 3 fontWeight + 12 fontSizes + 12 lineHeight + 4 letterSpacing). 24 vars (12 fontSizes + 12 lineHeight) **привязаны к Density через aliases** (2026-05-15).
Обновлено: 2026-05-15

## Что это

Числовые primitives для типографики: family, weight, size, line-height, letter-spacing. Используются в Text Styles Figma для сборки реальных стилей (h1, body, и т.д.).

## ⚠ Beefy не использует Figma Text Styles

В Beefy DS **нет сущности «Text Style»** (Figma feature). Стилизация текста — это композиция из 5 переменных, которые биндятся на text-узлы напрямую:

```
text node
├── fontFamily   ← fontFamily-DM Sans
├── fontWeight   ← fontWeight-{regular|medium|semibold}
├── fontSize     ← fontSizes/{h1|h2|...|fontSize-body|...}
├── lineHeight   ← lineHeight/{lineHeight-h1|...|lineHeight-body|...}
└── letterSpacing ← letterSpacing/{letterSpacing-0|sm|md|2xl}
```

Группы `h1`/`h2`/`body`/`h{N}-accent` существуют **только как именная конвенция в Typography-переменных** (`fontSizes/h1` + `lineHeight/lineHeight-h1`). В Figma нет объединённого «h1 Text Style». Конвенция держится дисциплиной дизайнеров.

**Глобальное правило пользователя** «Text Style required для каждого TEXT node» (memory `feedback_text_style_required.md`) **здесь не применяется** — в Beefy нет Text Styles по дизайн-решению. Для Beefy-задач биндим переменные напрямую.

## Изменения 2026-05-15

Применено через MCP `use_figma`:
1. **Typography → Density biding** (24 vars). См. секцию ниже.
2. **Naming fix:** 4 lineHeight `h{N}accent` переименованы в `h{N}-accent` (Variant A).
3. **Descriptions** для 28 переменных (12 fontSizes + 12 lineHeight + 4 letterSpacing) проставлены в Figma. lineHeight'у заодно починили copy-paste bug — все 12 имели описание «fontWeight variable for regular», теперь корректное «Line-height for hN, N px (→ Density X)».

Что осталось вручную в Figma (известное ограничение plugin API):
- Поставить `hiddenFromPublishing = true` на новой переменной `Density/5,5` (сиблинги все hidden, новый должен быть таким же; Plugin API setter падает «Node not found» — щёлкнуть в UI).

## Архитектура: Typography ↔ Density (применено 2026-05-15)

Раньше переменные Typography имели raw численные значения, без связи с Density. Теперь **24 из 32 vars привязаны к Density через aliases** (выполнено через MCP `use_figma`):
- 12 fontSizes — все привязаны к существующим Density-ступеням
- 12 lineHeight — 11 к существующим, `lineHeight-md` к новой ступени `5,5` (добавлена в той же сессии)

**Не привязано (остаётся raw, осознанно):**
- `fontFamily-DM Sans` — string, нет числового primitive
- `fontWeight/regular/medium/semibold` (×3) — Density не содержит scope `FONT_WEIGHT`
- `letterSpacing-sm/md/2xl` (×3) — sub-pixel; решено не вводить sub-pixel в Density (Density = px-grid)
- `letterSpacing-0` (= 0) — формально мог бы биндиться на Density `0`, оставлен raw для симметрии с остальными letter-spacing

**Результат:**
- Изменение Density-шкалы теперь автоматически распространяется на Typography.
- 8 действительно raw значений (1 family + 3 weight + 4 letter-spacing) — это нормальный typography-минимум.

---

## fontFamily (1 var)

| Token | Value |
|---|---|
| `fontFamily-DM Sans` | `DM Sans` |

## fontWeight (3 vars)

| Token | Value | Note |
|---|---|---|
| `fontWeight-regular` | 400 | |
| `fontWeight-medium` | 500 | |
| `fontWeight-semibold` | 600 | |

Density не содержит scope `FONT_WEIGHT` — fontWeight не может ссылаться на Density в принципе. Стандартные CSS значения, остаются здесь.

---

## fontSizes (12 vars) — все 12 совпадают с Density

| Token | Value (px) | Density step | Match |
|---|---|---|---|
| `fontSize-xs` | 10 | `2,5` | ✓ |
| `fontSize-sm` | 12 | `3` | ✓ |
| `fontSize-md` | 14 | `3,5` | ✓ |
| `fontSize-body` | 16 | `4` | ✓ |
| `h4` | 16 | `4` | ✓ |
| `h4-accent` | 20 | `5` | ✓ |
| `h3` | 20 | `5` | ✓ |
| `h3-accent` | 24 | `6` | ✓ |
| `h2` | 24 | `6` | ✓ |
| `h2-accent` | 32 | `8` | ✓ |
| `h1` | 32 | `8` | ✓ |
| `h1-accent` | 40 | `10` | ✓ |

**Заметки:**
- Шкала идёт `10 → 12 → 14 → 16 → 20 → 24 → 32 → 40` — кратная 4 кроме `10`/`14`. Сжатая, без 18 и 28. Major sub-jump 24→32 (минуя 28).
- `h4` и `fontSize-body` имеют одинаковое значение 16 — синонимы.
- `h{N}-accent` всегда крупнее своего `h{N}` на 1 ступень. То есть `h2-accent` = `h1`, `h3-accent` = `h2`, и т.д. Это «accent» = «увеличенная версия для эмфазы».

---

## lineHeight (12 vars) — 11 совпадают с Density, 1 нет

| Token | Value (px) | Density step | Match |
|---|---|---|---|
| `lineHeight-xs` | 16 | `4` | ✓ |
| `lineHeight-sm` | 20 | `5` | ✓ |
| **`lineHeight-md`** | **22** | **—** | **⚠ нет ступени** |
| `lineHeight-h4` | 24 | `6` | ✓ |
| `lineHeight-body` | 24 | `6` | ✓ |
| `lineHeight-h4-accent` | 28 | `7` | ✓ |
| `lineHeight-h3` | 28 | `7` | ✓ |
| `lineHeight-h3-accent` | 32 | `8` | ✓ |
| `lineHeight-h2` | 32 | `8` | ✓ |
| `lineHeight-h2-accent` | 40 | `10` | ✓ |
| `lineHeight-h1` | 40 | `10` | ✓ |
| `lineHeight-h1-accent` | 48 | `12` | ✓ |

**Outlier:** `lineHeight-md = 22` — единственное значение, которого нет в Density. Между `5` (20) и `6` (24) пропущена ступень `5,5` (22). Прецедент для half-steps есть (`4,5`, `6,5`, `7,5`, и т.д.).

**Naming heads-up:** ключи `accent` пишутся **без дефиса** (`lineHeight-h1-accent`, не `lineHeight-h1-accent`), хотя в `fontSizes` они **с дефисом** (`h1-accent`). Несовместимая конвенция между двумя группами одной коллекции — потенциальный bug.

---

## letterSpacing (4 vars) — все sub-pixel

| Token | Value | Density step | Match |
|---|---|---|---|
| `letterSpacing-0` | 0 | `0` | ✓ |
| `letterSpacing-sm` | 0.4 | — | ⚠ sub-pixel |
| `letterSpacing-md` | 0.8 | — | ⚠ sub-pixel |
| `letterSpacing-2xl` | 1.2 | — | ⚠ sub-pixel |

Letter-spacing в типографике обычно sub-pixel — это норма CSS. Density сейчас имеет минимальный шаг `0,25` = 1 px, sub-pixel значений нет.

Чтобы вписать в Density по существующей конвенции (`step × 4 = value`):
- 0.4 → `0,1`
- 0.8 → `0,2`
- 1.2 → `0,3`

Это введёт sub-pixel ступени в Density — концептуально может конфликтовать с принципом «Density = px-grid». См. секцию ниже.

---

## Pairings (предположительные)

По названиям видны ожидаемые пары fontSize ↔ lineHeight, но реальные комбинации заданы в Text Styles (нет в Variables JSON). Гипотеза:

| Probable Style | fontSize | lineHeight | Соотношение |
|---|---|---|---|
| h1-accent | 40 | 48 | 1.20 |
| h1 / h2-accent | 32 | 40 | 1.25 |
| h2 / h3-accent | 24 | 32 | 1.33 |
| h3 / h4-accent | 20 | 28 | 1.40 |
| h4 / body | 16 | 24 | 1.50 |
| md | 14 | 22 | 1.57 |
| sm | 12 | 20 | 1.67 |
| xs | 10 | 16 | 1.60 |

Соотношения растут от ~1.20 (большие заголовки, плотно) до ~1.67 (мелкий текст, воздушно) — стандартный typography-rhythm.

---

## Жёсткие правила

- **Не менять fontSize/lineHeight значения в макете напрямую** — только через эти токены.
- **Не путать `h{N}-accent` (в fontSizes) и `h{N}accent` (в lineHeight)** — несогласованный naming, легко ошибиться.

## Binding plan (что куда привязать в Figma)

После добавления `5,5` в Density — пройти по всем 24 fontSize+lineHeight переменным и привязать через Variables → Edit → Bind value:

### fontSizes (12 биндингов)

| Token | Bind to (Density) |
|---|---|
| `fontSize-xs` | `2,5` |
| `fontSize-sm` | `3` |
| `fontSize-md` | `3,5` |
| `fontSize-body` | `4` |
| `h4` | `4` |
| `h4-accent` | `5` |
| `h3` | `5` |
| `h3-accent` | `6` |
| `h2` | `6` |
| `h2-accent` | `8` |
| `h1` | `8` |
| `h1-accent` | `10` |

### lineHeight (12 биндингов)

| Token | Bind to (Density) |
|---|---|
| `lineHeight-xs` | `4` |
| `lineHeight-sm` | `5` |
| **`lineHeight-md`** | **`5,5`** *(после добавления)* |
| `lineHeight-h4` | `6` |
| `lineHeight-body` | `6` |
| `lineHeight-h4-accent` | `7` |
| `lineHeight-h3` | `7` |
| `lineHeight-h3-accent` | `8` |
| `lineHeight-h2` | `8` |
| `lineHeight-h2-accent` | `10` |
| `lineHeight-h1` | `10` |
| `lineHeight-h1-accent` | `12` |

После выполнения — повторно экспортировать Typography JSON, появятся `aliasData` блоки. Обновить этот файл.

---

## Naming-bug fix: `h1-accent` vs `h1accent`

**Проблема:** в одной коллекции, в двух смежных группах, `accent` пишется по-разному:
- `fontSizes/h1-accent`, `h2-accent`, `h3-accent`, `h4-accent` (с дефисом)
- `lineHeight/lineHeight-h1accent`, `h2accent`, `h3accent`, `h4accent` (БЕЗ дефиса)

Внутри каждой группы консистентно, между группами — нет. Легко ошибиться при ручном вводе.

### Варианты исправления

#### Вариант A — Стандартизировать на дефис (рекомендую)

Переименовать 4 переменные lineHeight: `lineHeight-h{N}accent` → `lineHeight-h{N}-accent`.

**Pros:**
- Дефис — доминирующий разделитель в Beefy DS (везде в `fontSizes`, в `letterSpacing-2xl` и т.д.)
- `h1-accent` читается естественнее: «h1 + accent modifier»
- Меняем 4 переменные

**Cons:**
- Любые ссылки на старые имена в макетах/коде потребуют ремапа Figma (обычно автоматический при rename, но требует проверки)

#### Вариант B — Стандартизировать на склейку (без дефиса)

Переименовать 4 переменные fontSizes: `h{N}-accent` → `h{N}accent`.

**Pros:**
- Тоже 4 изменения

**Cons:**
- `h1accent` читается хуже
- Ломает паттерн всего DS (везде дефисы)
- Наименее предпочтительный

#### Вариант C — Перестроить как nested variant

Превратить плоскую структуру в иерархическую: `h{N}/default` и `h{N}/accent`. Тогда:
- `fontSizes/h1` → `fontSizes/h1/default`
- `fontSizes/h1-accent` → `fontSizes/h1/accent`
- То же для lineHeight

**Pros:**
- Чище концептуально: «у h1 есть варианты»
- Масштабируется: завтра можно добавить `h1/italic`, `h1/condensed` без новых имён
- Соответствует pattern уже используемому в Colors: `txt/primary/primary - default` и т.д.

**Cons:**
- Большой рефакторинг: меняются все 16 переменных (8 fontSizes + 8 lineHeight)
- Ломает все существующие ссылки
- Нужна миграция Text Styles, которые ссылаются на эти variables

#### Вариант D — Удалить `accent` совсем

Заметка из таблицы выше: `h{N}-accent` всегда равен `h{N-1}` (`h2-accent = 32 = h1`, `h3-accent = 24 = h2`, `h4-accent = 20 = h3`). Accent-варианты математически дублируют следующий heading-уровень.

Можно убрать accent-токены и в Text Styles, где они используются, ссылаться напрямую на `h{N-1}`.

**Pros:**
- Минус 8 переменных (4 fontSizes + 4 lineHeight)
- Меньше путаницы — одна цифра на размер

**Cons:**
- Теряется семантический сигнал «это акцент h2, не просто бóльший заголовок» (важен для иерархии в design intent)
- Если завтра захотим, чтобы `h2-accent` стал не равен `h1` (например, 28 px между ними) — придётся откатывать
- Нужно мигрировать все Text Styles, которые сейчас используют accent-варианты

### Моя рекомендация

**Вариант A** на ближайший срок (минимальный риск, фиксит непосредственный bug naming-консистентности).

**Вариант C** — на следующий major refactor design system (когда захочется добавить новые modifiers — italic, weight, и т.д.).

**Вариант D** не рекомендую: семантическая роль accent ценнее, чем экономия 8 переменных.

---

## Открытые вопросы

Вынесены в [questions.md](../questions.md) (категория Typography / Process). Активно: реальные Text Styles (сборки fontFamily+weight+size+lh+ls в готовые `h1`/`body`/...) не видны из Variables, нужен отдельный экспорт.
