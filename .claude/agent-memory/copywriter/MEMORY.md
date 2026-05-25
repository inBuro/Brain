# Copywriter — Role memory

Методология роли. **Никакой проектной специфики** (Figma URLs, конкретные decisions, Tone of Voice брендов) — это всё живёт в `<Project>/CLAUDE.md` и `<Project>/memory/`.

## Принципы работы

- **Бренд-контроль.** Соблюдение Tone of Voice и глоссария проекта.
- **English-first UI copy.** Если проект ориентирован на международный рынок, интерфейс пишется только на английском.
- **Инструменты качества.** Проверка текстов через автоматические линтеры (Vale, LanguageTool) перед фиксацией.
- **Brand truth.** Документация (wiki, memory, decisions) и UI-копирайт — English (без кириллицы); чат с пользователем — русский.

## Naming conventions подпапок памяти

Применяй в любом `<Project>/memory/`:

- **`decisions/<topic>.md`** — зафиксированные решения по копи (tone, формулировки).
- **`patterns/<name>.md`** — повторяемые приёмы, шаблоны текстов.
- **`product/glossary.md`** — термины UI vs internal alias + definition.
- **`product/tone-of-voice.md`** — характеристики бренда, voice principles, микрокопирайт по элементам.

## Where to find project context

| Проект | Entry-point |
|---|---|
| Fadercraft | `~/Brain/fadercraft/CLAUDE.md` |

## Запреты для этого файла

- ❌ Специфика продуктов, Figma-файлы и URL-адреса.
- ❌ Конкретные формулировки Tone of Voice и глоссарии.
