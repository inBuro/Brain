---
name: telegram-vacancy-mining
description: Daily scan of ~30 Telegram job channels for Product/UI Designer vacancies fitting the candidate's criteria (Middle/Senior, remote, full-time, $4500+/mo not RUB), classified via Agent-tool subagents, deduplicated, and pushed to the Notion tracking pool. Use when the user asks to run/launch "the miner" (майнер) in the hiring-manager context, or to re-run/catch up the Telegram vacancy scan.
disable-model-invocation: true
---

# Telegram vacancy mining (hiring-manager)

## Задача
Найти в ~30 телеграм-каналах вакансии Product/UI Designer, подходящие кандидату, и довести их до пула в Notion — без ручного разбора всей ленты.

## Когда применять
Пользователь (или scheduled launchd job `com.hiring-manager.telegram-vacancy-scan`, 18:00 ежедневно) просит запустить/перезапустить/доделать телеграм-майнер вакансий. Не путать с `job-description-analyzer` (тот разбирает ОДНУ конкретную уже найденную вакансию, не сканирует каналы).

## Расположение инструментов
Все скрипты и данные — `~/Brain/agents/hiring-manager/tools/telegram-vacancy-bot/`. Виртуальное окружение уже настроено: `./.venv/bin/python`.

## Пайплайн
1. `./.venv/bin/python fetch_messages.py` — тянет последние ~35 сообщений/канал в `raw_messages.json`.
2. `./.venv/bin/python filter_new.py` — сверяет с `seen_store.json`, пишет неувиденные сообщения в `new_messages.json`. Печатает счётчик — если 0, дальше не идти.
3. **Классификация `new_messages.json` — ТОЛЬКО через Agent-tool сабагентов**, чанками ~85-150 сообщений на агента, параллельно (несколько вызовов Agent в одном сообщении). Промпт агенту — конкретные индексы среза + критерии ниже + просьба вернуть финальным текстом ЧИСТЫЙ JSON-массив `{"channel_id", "message_id", "verdict", "reason"}` без файловых записей (агент не пишет файлы, просто возвращает данные — так безопаснее, чем просить агента писать в общие файлы напрямую).

   Критерии (см. также [[project_hiring_telegram_vacancy_bot]]):
   - Роль: Product Designer / UI Designer (или близкий синоним UX/UI Designer). Не: чистый UX-исследователь, иллюстратор, graphic/brand/motion-дизайнер, разработчик, маркетолог, PM.
   - Грейд: Middle или Senior. Не: Junior, Intern. Lead/Head — ок, если руками в дизайне.
   - Занятость: только full-time. Не: фриланс/проектная/парт-тайм.
   - Локация: полностью удалённо, без релокации. Не: офис/гибрид/релокация обязательна.
   - Зарплата: от $4500/мес, лучше в USD/USDT/EUR. Если явно ниже — REJECT. Если явно в рублях — REJECT вне зависимости от суммы. Если зарплата вообще не указана — не REJECT по этой причине одной, ставь MAYBE.
   - Вердикты: MATCH (подходит по всем критериям) / MAYBE (подходит, но что-то неясно/не указано) / REJECT (не подходит или не вакансия вовсе — резюме кандидата, реклама курса, фриланс-гиг).

4. Слить вердикты с исходными сообщениями по ключу `(channel_id, message_id)` — сам (плоский Python-скрипт или инлайн), не через агента. Дописать результат в `classified.json` (append, не перезаписывать) и в `seen_store.json` (append ключей `channel_id:message_id` для ВСЕХ обработанных сообщений, не только MATCH/MAYBE — иначе REJECT-сообщения будут сканироваться заново каждый день).
5. `./.venv/bin/python dedupe.py` — гоняет по ВСЕМ MATCH/MAYBE строкам в `classified.json` (старым + новым), печатает кластеры дублей (KEEP/DROP) через fuzzy-match текста. Дубликат — не обязательно из сегодняшнего батча; если сегодняшняя строка задублировала уже запушенную старую, её нельзя пушить повторно.
6. Из сегодняшних новых MATCH/MAYBE строк убрать те, что попали в DROP по дедупу, оставшееся записать в `to_push.json`, затем `./.venv/bin/python push_to_notion.py` — прямой REST-пуш в Notion (интеграция «Claude», токен в `~/.config/notion/env`), без браузера. Data source `8ebe034a-c806-490e-98f8-e2482fa89858` (Инбюро → Аутрич → Телеграм майнинг).
7. Почистить временные файлы (`to_push.json` вернуть в `[]`), обновить `daily_run.log` кратким саммари прогона.
8. Отчитаться пользователю: сколько новых сообщений просканировано, сколько новых MATCH/MAYBE, сколько дублей отсеяно, текущий размер пула в Notion.

## Учётные данные
- Telegram: `~/.config/telegram/hiring-bot/env` (api_id/api_hash) + `session.session` — вне `~/Brain`, никогда не коммитить.
- Notion: `~/.config/notion/env` (`NOTION_TOKEN`) — вне `~/Brain`.

## Грабли (учтено)
- **Не используй `classify.py`** (прямой вызов `anthropic.Anthropic()` по ключу из `~/.config/anthropic/env`) для повседневного инкрементального прогона — этот скрипт остался от разового bulk-разбора истории каналов (`chunk_0..5.json` + `merge.py`) и требует Anthropic API-кредитов, которые могут быть исчерпаны/малы. Инкрементальная классификация всегда идёт через Agent-tool сабагентов (шаг 3) — это часть подписки Claude Code, не тратит API-баланс.
- **`ANTHROPIC_API_KEY` в окружении меняет способ биллинга.** Если переменная присутствует в env, `claude` CLI может аутентифицироваться по API-ключу (платные кредиты) вместо подписки. С 2026-08-12 `~/.bash_profile` больше не подгружает её автоматически в каждую сессию — только вручную (`. ~/.config/anthropic/env`) или через dotenv внутри конкретных скриптов, которым ключ реально нужен (`classify.py`, `translate.py`). Не возвращай безусловный source обратно.
- **Launchd не читает `.bash_profile`.** Плист `com.hiring-manager.telegram-vacancy-scan.plist` вызывает `daily_run.sh` напрямую через `/bin/bash` — окружение чистое, никаких API-ключей там нет по умолчанию, это ок и ожидаемо.
- **Прерванный прогон.** Если `fetch_messages.py`/`filter_new.py` уже отработали (есть свежий `new_messages.json`), а `classified.json`/`seen_store.json` не обновились под ту же дату — прогон прервался на классификации. Не перезапускай с шага 1 (это перезатрёт `raw_messages.json` и может съесть уже собранный `new_messages.json` не по делу) — продолжи с шага 3 на уже имеющемся `new_messages.json`.
- **`seen_store.json` должен расти на КАЖДОЕ обработанное сообщение**, включая REJECT — иначе одно и то же нерелевантное сообщение классифицируется заново каждый день.
- **Дедуп — по всему пулу, не только по сегодняшнему батчу.** Кластеры могут связывать сегодняшнюю новую строку со старой, уже давно запушенной в Notion.

## Автозапуск
`~/Library/LaunchAgents/com.hiring-manager.telegram-vacancy-scan.plist` — каждый день в 18:00, вызывает `daily_run.sh`, который headless-инстансом Claude Code (`claude -p ... --permission-mode dontAsk`) выполняет этот же пайплайн.
