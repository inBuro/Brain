# Архитектура пайплайна

Техническая документация файловой системы и автоматизации Telegram-майнинга вакансий. Живой пайплайн, не Notion-контент — здесь фиксируется, где что лежит и как запускается, чтобы не переоткрывать это каждый раз заново.

## Расположение

Всё лежит плоскими JSON-файлами (без SQLite/Postgres) прямо в этой папке:

```
~/Brain/agents/hiring-manager/tools/telegram-vacancy-bot/
```

Читается напрямую через `python3 -c "import json; ..."` или `jq`, без дополнительных инструментов.

## Файлы и их роль

| Файл | Записей (на 2026-08-14) | Роль |
|---|---|---|
| `classified.json` | 1199 | Главное кумулятивное хранилище — каждое когда-либо классифицированное сообщение |
| `seen_store.json` | 1199 ключей | Индекс дедупликации (message ID → boolean) |
| `raw_messages.json` | 1031 | Последняя выгрузка из Telegram (rolling fetch) |
| `new_messages.json` | переменное | Новые сообщения, ещё не классифицированные, ждут следующего запуска |
| `new_classified.json` | переменное | Результат последнего завершённого прогона классификации |
| `notion_rows.json` | 116 | Все записи, отправленные в Notion (база «Вакансии» рядом) |
| `chunk_0–5.json` • `verdicts/chunk_0–5.json` | ~150 каждый | Промежуточные чанки классификации и их вердикты |
| `channels.json` | 32 канала | Список мониторящихся Telegram-каналов (преимущественно русскоязычные IT/дизайн job-борды) |

## Схема записи

**`classified.json` (мастер-хранилище):**
`channel_id`, `channel_name`, `message_id`, `date` (ISO-8601 UTC), `text`, `verdict` (MATCH/MAYBE/REJECT), `reason`

**`notion_rows.json` (то, что уходит в Notion):**
`title`, `status`, `channel`, `date`, `reason`, `text`, `link` (t.me deep link)

В саму базу «Вакансии» пушатся только MATCH + MAYBE (116 из 1199) — REJECT остаётся только в локальном JSON, в Notion не попадает.

## Критерии отбора

Product/UI Designer, Mid/Sr, remote, full-time, от $4500/мес USD (или эквивалент).

## Автоматизация

launchd-сервис `com.hiring-manager.telegram-vacancy-scan` (`~/Library/LaunchAgents/com.hiring-manager.telegram-vacancy-scan.plist`) запускает `daily_run.sh` ежедневно в **18:00** по местному времени. Логи — `daily_run.log`. Сервис активен (проверяется через `launchctl list`).

## Состояние на 2026-08-14

Выгрузка от 13 августа 18:01 дала 99 новых сообщений в `new_messages.json`, ещё не классифицированных — обработает их следующий плановый запуск в 18:00.

За всё время: 2 жёстких MATCH, 120 MAYBE, 1077 REJECT (из 1199 просмотренных сообщений).
