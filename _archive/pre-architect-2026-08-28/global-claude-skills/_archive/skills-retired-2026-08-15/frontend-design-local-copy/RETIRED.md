# Retired 2026-08-15

Локальная копия скилла `frontend-design`, ранее жившая как `design/subskills/frontend-design/`. Оказалась дублем: тот же контент уже поставляется официальным Anthropic-плагином `frontend-design@claude-plugins-official`, установленным в `~/.claude/plugins/cache/claude-plugins-official/frontend-design/` и обновляющимся автоматически (последнее обновление на дату архивации — сегодня же).

Роль забрал: прямой вызов плагина `frontend-design:frontend-design` (Skill tool) — не нужен локальный путь через группу `design`/`frontend`, плагин глобально доступен вне зависимости от роутеров. Персона `frontend-designer` (`~/Brain/agents/frontend-designer/`) использует его как один из инструментов своей группы.
