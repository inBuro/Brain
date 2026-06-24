# DS Contract — правила работы с дизайн-системой Fadercraft

**Источник ДС:** своя (встроена в файл продукта)
**Figma-файл:** https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Fadercraft
**Дата сканирования:** 2026-06-19

---

## Правила цвета

1. **Только Semantic — никогда Primitives.** В компонентах и экранах использовать только токены из группы `Semantic/`. Primitive-токены (`Neutral/800`, `Mint/400` и т.д.) — внутренняя реализация, не для экранов.

2. **Никаких прибитых hex.** Цвет всегда через Variable. Если нужного Semantic-токена нет — сначала добавь его в коллекцию `Colors` с алиасом на Primitive.

3. **Одна тема (Light).** Тёмной темы в коллекции нет. `Semantic/Bg/Dark` (`Neutral/1000`) — это тёмный блок внутри светлого лендинга, не переключатель тем.

4. **Цвета режимов LCXL — через `Hue`.** ModeButton и ModeGrid раскрашиваются через `Primitives/Hue/01–12`. Hue/10 и Hue/11 — незаполненные слоты (серый). Hue/03 отсутствует.

---

## Правила отступов и размеров

5. **Только Density-токены.** Все padding, gap, width, height — через переменные коллекции `Density`. Система 4px grid, имена в rem-единицах (`4` = 16px, `6` = 24px, `8` = 32px и т.д.).

6. **Добавить токен, если нужного нет.** Если значение отсутствует в шкале — добавь его в коллекцию `Density` как кратное 4px. Не прибивать raw px.

---

## Правила типографики

7. **Веса только из `Typography`.** Для font-weight использовать переменные коллекции `Typography` (`Weight/Regular`, `Weight/Medium`, `Weight/SemiBold`, `Weight/Bold`). Прибивать строковые значения запрещено.

8. **Шрифт продукта — Inter** (предположительно, уточнять при первой работе с текстовыми нодами).

---

## Шпаргалка: ключевые токены

| Ситуация | Токен |
|---|---|
| Основной фон страницы | `Semantic/Bg/Default` → `Neutral/300` |
| Карточка / поверхность | `Semantic/Bg/Surface` → `Neutral/400` |
| Тёмный блок (hero/footer) | `Semantic/Bg/Dark` → `Neutral/1000` |
| Обводка | `Semantic/Border/Default` → `Neutral/800` |
| Primary CTA (бирюзовый) | `Semantic/Action/Primary` → `Mint/400` |
| Secondary CTA (янтарный) | `Semantic/Action/Secondary` → `Amber/400` |
| Тёмная кнопка | `Semantic/Action/Dark` → `Neutral/1000` |
| Instrument layer | `Semantic/Surface/Instrument` → `Lavender/400` |
| Mixer layer | `Semantic/Surface/Mixer` → `Mint/400` |
| Mute state | `Semantic/Surface/Mute` → `Amber/400` |
| Текст на светлом (primary) | `Semantic/Text/OnLight/Primary` → `Neutral/1000` |
| Текст на светлом (secondary) | `Semantic/Text/OnLight/Secondary` → `Neutral/700` |
| Текст на тёмном (primary) | `Semantic/Text/OnDark/Primary` → `Neutral/00` |
| Текст на тёмном (secondary) | `Semantic/Text/OnDark/Secondary` → `Neutral/300` |

---

## Компоненты

9. **Только из каталога.** Использовать компоненты из `ds/components.md`. Не рисовать ad-hoc фреймы там, где есть компонент.

10. **Инстансы, не мастера.** На экранах — всегда инстансы компонентов, никогда не копировать мастер в отдельный мастер.

11. **Служебные компоненты — не использовать.** Следующие узлы служебные (не инстанцировать напрямую):
    - `OneActionBetweenThem/Component 1` (`628:3574`)
    - `Frame 8` (`2145:7333`, Icons)
    - `image 4` (`899:7486`, Organisms)
    - `Icon (Organisms)` (`2146:7694`)

12. **`WhyChooseNovation` (`51:5`)** — устаревшее имя компонента (Novation → Fadercraft); смысл = WhyChoose. При необходимости переименовать в Figma.

13. **`ModeButton.Type = "disable inteumnet"`** — опечатка в Figma (должно быть «disable instrument»). Не исправлять без явной договорённости.

14. **Два Footer-а.** Light: `106:52`, Dark: `1016:1632`. При добавлении брать нужный по Node ID.

---

## Что делать, если компонент или токен не найден

- Нет компонента → сначала проверить все страницы (Atoms/Molecules/Organisms/Icons). Если действительно нет — поднять вопрос, не рисовать ad-hoc.
- Нет Semantic-токена → добавить его в коллекцию `Colors` как алиас на существующий Primitive. Не прибивать hex.
- Нет Density-значения → добавить кратное 4px в коллекцию `Density`. Не прибивать raw px.
