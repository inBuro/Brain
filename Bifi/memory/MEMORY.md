# UX/UI Designer Memory — Brain (Beefy work)

> 📋 **Открытые вопросы и технический долг — [questions.md](questions.md)** (единое место, перед началом любой задачи прогоняй через него).


Обновлено: 2026-05-15
Источник истины: https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System?node-id=5015-6337

## Продукт

(уточнить) — что за продукт, аудитория, JTBD пользователя, primary device, tone.

## Дизайн-система — где живёт

- Figma-файл: **v2.4 Beefy Design System**
- Ссылка: https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System?node-id=5015-6337
- Library опубликована (виден через MCP search), но collection `Density` помечена `hiddenFromPublishing` — это file-internal примитивы.
- Связанные библиотеки в файле: `v2.4 Beefy Design System` (основная), `Product`, `Pablo's team library`.
- Структура файла (canvas pages, MCP видит): `Accordion`, `Icons`. Остальные страницы — (уточнить, видимо приватные / не shared).
- Документация рядом: (уточнить)
- Frame-размеры: desktop (уточнить), mobile (уточнить)
- Naming-конвенции токенов:
  - **Density**: имя = `{step}` (без префикса), значение = `step × 4` px. Пример: `4` → 16px, `0,5` → 2px, `999` → 9999px (sentinel). Запятая — десятичный разделитель. См. `tokens/density.md`.
  - Для остальных коллекций — (уточнить).

## Variables collections (известные)

| Collection | Vars | Статус | Примечание |
|---|---|---|---|
| Primitives | ~130 | **full** → `tokens/primitives.md` (после удаления `vaultTints-backup` 2026-05-15: 160 → 130) | raw color ramps; families: gold/green/orange/red/darkBlue/white/chartTints/graphTints/vaultTints; hidden from publishing |
| Colors | 121 | **full** → `tokens/colors.md` | semantic слой над primitives, 8 групп. 2026-05-15: миграция vaultColors → vaultTints (25 правок + фикс pool/txtHover), удалён vaultTints-backup, добавлен vaultColors/Paused/cardBg, исправлены 15 опечаток (tertiarry/defailt/sellected/forth/chatB/grpaphs). Долг: cta/fifth и chartC. |
| Breakpoints | 3 | **full** → `tokens/breakpoints.md` | Mobile 360, Tablet 960, Desktop 1260. 2026-05-15: `Desktop S` (1128) удалён, `Desktop` обновлён 1272→1260. Проверено по реальному сайту. |
| Density | 27 | **full** → `tokens/density.md` | примитивная нумерическая шкала, base 4px, hidden from publishing. `5,5`=22px добавлен 2026-05-15 (TODO в Figma UI: пометить hiddenFromPublishing — Plugin API setter падает). |
| Typography | 32 | **full** → `tokens/typography.md` | 1 fontFamily, 3 fontWeight, 12 fontSizes, 12 lineHeight, 4 letterSpacing; raw значения без aliases на Density (architectural gap); 4 значения требуют расширения Density (см. предложения в `tokens/density.md`) |

## Карта памяти

Подгружай через Read под задачу. Болванки созданы, наполняются по мере того, как пользователь скармливает артборды (spacing, цвета, кнопки, типографика и т.д.).

| Задача | Что читать | Статус |
|---|---|---|
| Цвета (raw primitives) | tokens/primitives.md | full (~130 значимых + ~30 backup) |
| Цвета (семантика) | tokens/colors.md | full (~120 vars в 8 группах: txt, cta, backgrounds, strokes, notifications, vaultColors, charts, grpaphs) |
| Типографика | tokens/typography.md | full (32 vars; 24 привязаны к Density через aliases 2026-05-15; lineHeight `accent` переименованы с дефисом; descriptions проставлены 28 vars с фиксом copy-paste bug). **Text Styles не используются** — биндим переменные напрямую. |
| Отступы | tokens/spacing.md | pointer → density |
| Радиусы, тени, бордеры, иконы | tokens/foundations.md | пусто |
| Анимация | tokens/motion.md | пусто |
| Breakpoints | tokens/breakpoints.md | full (3 vars) |
| Общий инвентарь компонентов | components/inventory.md | пусто |
| Конкретный компонент | components/&lt;имя&gt;.md | создаются по мере документирования |
| Паттерны (формы, навигация, состояния) | patterns/&lt;имя&gt;.md | создаются по мере документирования |
| Tone, копирайт | product/tone-of-voice.md | пусто |
| Глоссарий | product/glossary.md | пусто |
| Почему так решили | decisions/&lt;имя&gt;.md | создаются по мере принятия |

## Горячие токены

Пока пусто. Заполняется по мере получения артбордов из Beefy DS.

### Spacing
(уточнить — пользователь пришлёт артборд)

### Типографика
(уточнить — пользователь пришлёт артборд)

### Цвета
(уточнить — пользователь пришлёт артборд)

### Радиусы
(уточнить)

### Breakpoints
(уточнить)

## Жёсткие правила

(уточнить)

## Компонент-инвентарь

(уточнить — пользователь пришлёт артборды по компонентам)

### Чего НЕТ в системе

(уточнить)

## Анти-паттерны (отвергнуто)

(уточнить)

## Открытые вопросы

- Уточнить продукт, аудиторию, JTBD, primary device, tone of voice
- Уточнить структуру Figma-файла (какие страницы / разделы)
- Уточнить frame-размеры desktop / mobile
- Уточнить naming-конвенции токенов
- Получить от пользователя артборды: spacing, цвета, типографика, кнопки → заполнить `tokens/` и `components/`
