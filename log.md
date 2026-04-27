# Log

Глобальная хронология vault-а. Append-only. Каждая запись — новая строка с префиксом `## [YYYY-MM-DD]`.

Парсится grep-ом: `grep "^## \[" log.md | tail -10`.

Формат:
```
## [YYYY-MM-DD] <project|global> | <action> | <subject>
<опционально 1-3 строки контекста>
```

Действия: `init`, `ingest`, `process`, `refactor`, `query`, `lint`, `decision`, `note`.

---

## [2026-04-27] global | init | vault structure
Создан корневой каркас: `README.md`, `index.md`, `log.md`, `raw.md`, `_templates/`, `_shared/`. Существующий проект `Novation XL` приведён к паттерну (добавлены `README.md`, `log.md`).
