# Cloud

Личный wiki-vault для ведения нескольких проектов по паттерну [[Projects Structure Pattern]].

## Как это устроено

- **[[index]]** — глобальный каталог всех проектов и общих сущностей. Точка входа для LLM и для тебя.
- **[[log]]** — единая хронология: ingests, обработки, решения. Append-only.
- **[[raw]]** — инбокс. Сюда падают входящие данные «как есть» до сортировки в проект.
- **`_templates/`** — шаблоны страниц (entity, concept, source, analysis, project).
- **`_shared/`** — сущности и концепты, используемые более чем одним проектом.
- **`<Project Name>/`** — отдельный проект со своей структурой `raw/` + `wiki/`.

## Жизненный цикл данных

```
входящее → raw.md → распределение → <Project>/raw/  (сырое)
                                  → <Project>/wiki/ (обработанное, со ссылками)
```

## Правила именования

- Папки проектов — `Title Case` (например, `Novation XL`).
- Файлы внутри `wiki/` — `kebab-case.md`.
- Все страницы в `wiki/` имеют YAML frontmatter (`type`, `project`, `created`, `updated`, `tags`, `status`).

## Поток работы с новым проектом

1. Скопировать `_templates/project.md` → `<New Project>/README.md`.
2. Создать `<New Project>/index.md`, `<New Project>/log.md`, `<New Project>/raw/assets/`, `<New Project>/wiki/{entities,concepts,sources,analysis}/`.
3. Добавить запись в глобальный `index.md`.
4. Записать создание в глобальный `log.md`.

См. [[Projects Structure Pattern]] для философии паттерна.
