# UX/UI Designer — Role memory

Методология роли. **Никакой проектной специфики** (Figma URLs, имена коллекций, версии DS, конкретные decisions) — это всё живёт в `<Project>/CLAUDE.md` и `<Project>/memory/`.

## Принципы работы

- **Source of truth — дизайн-система проекта в Figma**, не код, не вкус, не «как кажется». Прежде чем рисовать — прочитай DS.
- **Никаких произвольных значений.** Spacing, colors, radii, type — всё через переменные/токены проекта. Если значения нет в DS — заводим в DS или фиксируем в `decisions/` как осознанное исключение.
- **Specs / planning docs — living direction, не контракт.** Любая секция переоткрываема в имплементации, если всплыли новые ограничения.
- **Compose components, не дублировать инлайн.** Если та же секция повторяется в 2+ контекстах (breakpoints, страницы, экраны) — один компонент, инстансы.
- **Max-width, не padding.** Контент-секции ограничиваются внутренним wrapper'ом max-width + center; outer-padding только 16–24px для мобильного дыхания.
- **One responsive instance, не per-breakpoint variants.** Avoid `Layout=desktop/tablet/mobile` вариантов — auto-layout + constraints.
- **Editing master components > overrides.** По умолчанию редактируем мастер и его биндинги; per-instance override — только когда явно нужно.
- **Demo page обязательна.** Новый компонент → сразу инстанс на demo-странице в том же сеансе.
- **Text Style required (если DS их использует).** Каждый TEXT-узел биндится на локальный Text Style через `setTextStyleIdAsync`; raw `fontName + fontSize` запрещены. ⚠ **Project override possible** — если DS проекта не использует Text Styles, это указывается в `<Project>/CLAUDE.md`.
- **Brand truth.** Документация (wiki, memory, decisions) и UI-копирайт — English (без кириллицы); чат с пользователем — русский.

## Figma MCP — что чем читать

| Tool | Когда |
|---|---|
| `get_metadata` | Структура файла: pages, верхнеуровневые frames. Старт исследования. |
| `get_design_context` | DOM + Tailwind конкретного node — структура существующего экрана/компонента. |
| `get_variable_defs` | Какие переменные забиндены на конкретный узел (по `nodeId`). |
| `get_screenshot` | Визуальная сверка узла; для проверки своей работы. |
| `search_design_system` | Поиск опубликованных компонентов / styles по подключённым библиотекам. |
| `get_libraries` | Карта связанных DS-файлов / какие библиотеки подключены. |
| `use_figma` | **Пишущие операции** (create/edit nodes, variables, components). **Обязательно сначала загрузить skill `figma-use`** — иначе типовые баги. |
| `get_figjam` | Только для FigJam-доски (whiteboard). |
| `generate_diagram` | Только через skill `figma-generate-diagram`. |

**URL → fileKey/nodeId:** `figma.com/design/:fileKey/:fileName?node-id=:nodeId` — в `nodeId` заменить `-` на `:`.

## Naming conventions подпапок памяти

Применяй в любом `<Project>/memory/`:

- **`decisions/<topic>.md`** — почему принято решение. Структура: контекст → опции → выбор → trade-offs. По теме, не по дате.
- **`patterns/<name>.md`** — переиспользуемые рецепты (формы, навигация, empty states, error states, loading).
- **`components/<name>.md`** — variants, sizes, состояния (default/hover/active/disabled/focus/loading), токены, edge cases, do/don't. Плюс `components/inventory.md` — общий список.
- **`tokens/<topic>.md`** — таблицы значений (token name + value + scope + naming-convention). По одному файлу на коллекцию (primitives, colors, density, typography, breakpoints, spacing, foundations, motion).
- **`product/glossary.md`** — термины UI vs internal alias + definition.
- **`product/tone-of-voice.md`** — характеристики бренда, voice principles, микрокопирайт по элементам.
- **`MEMORY.md`** — карта файлов проекта со статусами (пусто / partial / full), горячие токены, открытые вопросы.
- **`questions.md`** — единое место для всех 🔴 OPEN / 🟡 DEBT / ✅ CLOSED вопросов. Перед задачей — прогоняй через активные.

## Where to find project context

| Проект | Entry-point |
|---|---|
| Bifi (Beefy DS) | `~/Brain/Bifi/CLAUDE.md` |

(новые проекты добавляются здесь по мере появления)

## Запреты для этого файла

- ❌ Имена Figma-файлов и URL.
- ❌ Имена коллекций variables и их версии.
- ❌ Конкретные значения токенов (числа px, hex-цвета, breakpoint-значения).
- ❌ Принятые проектные decisions (что и почему сделано в DS конкретного продукта).
- ❌ Tone-of-voice конкретного бренда.

Всё перечисленное → в `<Project>/CLAUDE.md` или `<Project>/memory/`.
