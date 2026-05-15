# Brain — workspace conventions

## Memory storage rules

- **Role memory** (project-agnostic): `.claude/agent-memory/<role>/MEMORY.md`
  Методология, инструменты, naming conventions, указатели на проекты. Не содержит проектной специфики.

- **Project memory** (project-specific): `<Project>/CLAUDE.md` + `<Project>/memory/`
  - `<Project>/CLAUDE.md` — короткий entry-point (≤40 строк): что за проект, source of truth, какие роли используются, project-specific правила, карта `memory/`.
  - `<Project>/memory/MEMORY.md` — карта проектной памяти со статусами.
  - `<Project>/memory/questions.md` — открытые вопросы и техдолг.
  - `<Project>/memory/{components,decisions,patterns,tokens,product}/` — подпапки по областям.

## Запреты

- ❌ Не класть проектную специфику (Figma URL, имена коллекций, версии DS, конкретные decisions, project-tone-of-voice) в role memory.
- ❌ Не дублировать контент между уровнями — ссылаемся, не копируем.
- ❌ Role memory ссылается на проекты только через раздел «Where to find project context» — указатели на `<Project>/CLAUDE.md`, не инлайн-факты.

## Новый проект

1. Создать `<Project>/CLAUDE.md` — entry-point.
2. Создать `<Project>/memory/` со структурой подпапок по областям.
3. Добавить указатель на проект в соответствующие role-memory файлы (раздел «Where to find project context»).
4. Если у проекта есть специфика, которая нарушает глобальные правила (например, DS не использует Text Styles при глобальном «text-style required») — явно указать в `<Project>/CLAUDE.md` как override.

## Auto-memory (универсальная)

`~/.claude/projects/-Users-Kirill-Brain/memory/` — кросс-проектная пользовательская память (user/feedback/project/reference). Управляется правилами в системном промпте. Сюда — только то, что универсально для всех проектов в `~/Brain/`. Project-specific memories живут в `<Project>/memory/`.
