# Архитектура — hiring-manager

Структура агента-персоны hiring-manager: что где лежит и как компоненты связаны друг с другом.

## Компоненты

| Путь | Роль |
|---|---|
| `CLAUDE.md` | Канон персоны — роль, зона ответственности, стиль работы |
| `agent-memory/` | Память персоны между сессиями |
| `tools/telegram-vacancy-bot/` | Подсистема мониторинга вакансий в Telegram — см. [её собственную архитектуру](tools/telegram-vacancy-bot/ARCHITECTURE.md) |

## Telegram vacancy bot (майнер вакансий)

Отдельная подсистема внутри `tools/` — MTProto-клиент, который мониторит Telegram-каналы, классифицирует сообщения по критериям (Product/UI Designer, Mid/Sr, remote, от $4500/мес) и пушит совпадения в Notion-базу «Вакансии». Работает автономно через launchd, не требует ручного запуска.

Полное описание файловой системы, схемы записей, критериев отбора и текущего состояния — в [`tools/telegram-vacancy-bot/ARCHITECTURE.md`](tools/telegram-vacancy-bot/ARCHITECTURE.md).
