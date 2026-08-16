# Environments Registry

Единый каталог агентов. Каждый — отдельная папка-workspace под `~/Brain/agents/`: открывай её напрямую, внутри уже CLAUDE.md с полным брифом и (где есть постоянная память) симлинк `agent-memory/` на живую память в `~/Brain` — правки видны сразу в обе стороны, без дублирования.

Эта таблица — источник данных для роутера `~/Brain/agents/CLAUDE.md` (Routing pattern: открыл корень `~/Brain/agents/` без выбора конкретной папки → роутер сопоставляет запрос с Доменом/Триггерами ниже и передаёт управление подходящей персоне). Добавляя/переименовывая агента — обновляй запись здесь, иначе роутер его не найдёт.

Поле **Директивы** — именованные повторяющиеся процедуры внутри домена агента (не файлы, а разделы/паттерны, уже описанные в его CLAUDE.md — см. путь выше). Используй их как быстрый указатель «что этот агент умеет конкретно», не как отдельный слой инфраструктуры для вызова.

## Служебные папки `~/Brain/agents/`

- `meta/` — этот файл, `budget.md` (модель-роутинг), `workflows/` (документированные многоагентные последовательности).
- `_archive/` — сюда переносятся выведенные из строя персоны/версии реестра вместо удаления.
- `.claude/` — директория-скоупнутые настройки/скиллы, применяющиеся только внутри `~/Brain/agents/`.
- `.tmp/` — скретч-файлы этой рабочей области, вне гита (`.gitignore` → `Agents/.tmp/`).

## Активные среды

### `m4l-master`
- **Путь:** `~/Brain/agents/m4l-master/`
- **ID:** `m4l-master`
- **Домен:** Max for Live устройства (`.amxd`) — бинарная правка на месте. Флагман XL_Performance (LCXL MK3), также Sends Follower, Dynamic Focus Slot/Input, Mapping Deck, Control XL custom-моды.
- **Триггеры:** `.amxd`, Max for Live, m4l, патч, девайс, XL_Performance, Sends Follower, Dynamic Focus, maxpat, custom mode, `.syx`.
- **Директивы:** `amxd_repack` (archive→extract JSON→edit→repack→validate→replace), `syx_edit` (побайтовая правка кастом-мода), `feature_wiki_doc` (entity-страница + лог фичи в wiki), `xl_performance_maintenance` (флагман: Mode Encoding, CC47, Mixer/Instruments Layer).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/m4l-master/`.
- **API:** —

### `ableton-producer`
- **Путь:** `~/Brain/agents/ableton-producer/`
- **ID:** `ableton-producer`
- **Домен:** Ableton Live session controller через AbletonMCP socket API — параметры девайсов, пробинг треков.
- **Триггеры:** Live сессия, параметры девайса, MapAll, AbletonMCP.
- **Директивы:** `device_probe` (скан треков по числу параметров, без хардкода индексов), `sf_slot_mapping` (`write_ret_slots`/`write_trk_slots`), `mapall_trigger` (обязательный сброс 0→1), `slot_verify` (`verify_slots` — сверка readback с реально резолвленным Live-параметром), `param_debug` (Max Console чекпоинты).
- **Память:** нет (без сохранённой памяти, читает live-состояние через сокет `127.0.0.1:9877`).
- **API:** AbletonMCP socket `127.0.0.1:9877`.

### `analyst`
- **Путь:** `~/Brain/agents/analyst/`
- **ID:** `analyst`
- **Домен:** продуктовая веб-аналитика Fadercraft — PostHog (проект 458316): конверсия, воронки, цели (Actions), инсайты, дашборды, session replay, A/B-эксперименты.
- **Триггеры:** визиты, трафик, конверсия, воронка, PostHog, сессии, replay, A/B-тест, цель/Action, дашборд аналитики.
- **Директивы:** `posthog_query` (search→info→schema→call, обязательный порядок), `trend_query` (`query-trends`), `funnel_build` (`query-funnel`), `retention_query` (`query-retention`/`query-stickiness`/`query-paths`), `session_replay` (`query-session-recordings-list`), `goal_create` (`action-create`), `insight_dashboard` (`insight-create`/`dashboard-create`), `ab_experiment` (feature flag + конверсионная цель).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/analyst/`.
- **API:** PostHog MCP (`mcp__posthog__exec`).

### `accountant`
- **Путь:** `~/Brain/agents/accountant/`
- **ID:** `accountant`
- **Домен:** личный бухгалтер-аналитик — банковские выписки (флагман Bangkok Bank, THB), категоризация, бюджет, дашборды трат.
- **Триггеры:** выписка, бюджет, дашборд трат, куда уходят деньги, категоризация, сверка, THB, Bangkok Bank.
- **Директивы:** `statement_parse` (venv+pdfplumber, парс по колонке «Баланс»), `balance_reconciliation` (сверка с контрольными итогами банка, ноль расхождений), `transaction_categorize` (метка операции → категория), `spending_dashboard` (самодостаточный `index.html`+Chart.js+headless-проверка).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/accountant/` (методика/правила only — реальные суммы туда НИКОГДА не пишутся, живут вне `~/Brain`).
- **API:** —

### `copywriter`
- **Путь:** `~/Brain/agents/copywriter/`
- **ID:** `copywriter`
- **Домен:** копирайтинг на русском и техническом английском — лендинг-копи, имейлы, реклама, документация, UX-микротекст; держит корпус реальных комментариев/тредов (Reddit, YouTube) как источник голоса аудитории.
- **Триггеры:** копирайт, текст лендинга, имейл, реклама, документация, UX-микротекст, заголовки, типографика, голос аудитории, комментарии/треды.
- **Директивы:** `voice_corpus_maintain` (подтяжка и датированный лог тредов Reddit/YouTube в `research/voice/voice-guide.md`), `product_copy` (value props, in-app, микротекст), `marketing_copy` (заголовки, CTA, реклама, лендинг, имейл, соцсети), `landing_page_copy` (killihu-скелет: Intro/How it works/Main features/To consider/CTA), `copy_review` (прогон черновика против антипаттернов + голоса бренда перед сдачей).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/copywriter/`.
- **API:** —

### `project-manager`
- **Путь:** `~/Brain/agents/project-manager/`
- **ID:** `project-manager`
- **Домен:** менеджер продукта Fadercraft — журнал запусков и маркетинговых экспериментов (Reddit, YouTube, лендинг, Gumroad), roadmap/log, приоритизация.
- **Триггеры:** результаты поста/запуска, что делаем дальше, следующий эксперимент, обнови roadmap, ретроспектива, приоритизация бэклога, go/no-go.
- **Директивы:** `launch_journal_log` (запись What/Numbers/Qualitative/Read/Decision в `launch-journal.md`), `roadmap_sync` (правка `wiki/roadmap.md` сразу при смене плана), `retro_synthesis` (перечитать журнал целиком, синтез трендов, 1–3 приоритета), `launch_planning` (план запуска чек-листом с чекпоинтами до старта).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/project-manager/`.
- **API:** —

### `ux-researcher`
- **Путь:** `~/Brain/agents/ux-researcher/`
- **ID:** `ux-researcher`
- **Домен:** UX-исследователь и стратег — выбор метода исследования, персоны/empathy/journey-карты, эвристический и accessibility-аудит, cognitive load, приоритизация фич, дизайн AI-фич.
- **Триггеры:** метод исследования, персоны, empathy/journey map, эвристический аудит, accessibility, cognitive load, приоритизация бэклога, AI-фичи (доверие/контроль/онбординг).
- **Директивы:** `framework_select` (выбор 1–3 фреймворков из библиотеки `skills/` по карте в MEMORY.md), `heuristic_audit` (Nielsen + accessibility, макет vs. проверено-в-коде), `persona_journey_mapping`, `ai_feature_design` (governors/identifiers/inputs/trust-builders/tuners/wayfinders), `backlog_prioritization`.
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/ux-researcher/` (+ `skills/` — 18 канонических UX-фреймворков).
- **API:** Figma MCP (read-only: design context, screenshot, metadata, variables, library search).

### `ux-ui-designer`
- **Путь:** `~/Brain/agents/ux-ui-designer/`
- **ID:** `ux-ui-designer`
- **Домен:** UX/UI дизайнер — экраны, фичи, флоу, компоненты, редизайн, информационная архитектура; источник истины — дизайн-система в Figma.
- **Триггеры:** экран, фича, флоу, компонент, редизайн, информационная архитектура, иерархия, состояния, Figma.
- **Директивы:** `design_spec` (текстовый wireframe + токены/компоненты ДС), `design_system_reuse` (сверка перед созданием нового), `state_design` (default/hover/active/focus/disabled/loading/empty/error), `anti_slop_audit` (skill `design-anti-slop` перед сдачей), `memory_bootstrap` (интервью + инициализация `agent-memory/MEMORY.md` при пустой памяти проекта).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/ux-ui-designer/`.
- **API:** Figma MCP (read+write: design context, use_figma, upload_assets).

### `frontend-designer`
- **Путь:** `~/Brain/agents/frontend-designer/`
- **ID:** `frontend-designer`
- **Домен:** старший фронтенд-разработчик — сборка/правка реального кода (HTML/CSS/Tailwind/React), исполняет спецификацию `ux-ui-designer` или прямой бриф; не изобретает продуктовые решения.
- **Триггеры:** сверстай/свёрстай, макет(ы), верстка/вёрстка, компонент, страница, лендинг-код, дашборд, React, HTML/CSS, собери фронтенд. Эти слова по умолчанию значат «код», не «дизайн-решение» — маршрутизируй сюда, не в `ux-ui-designer`, даже без явного упоминания HTML/React.
- **Директивы:** `code_build` (сборка по спецификации ux-ui-designer или брифу, инструмент по весу задачи — плагин `frontend-design` для лёгкого входа, `impeccable` для тяжёлой итерации), `anti_slop_pass` (обязательный `design-anti-slop` audit/fix перед сдачей на средних/крупных задачах), `parity_verify` (после сборки — `parity-check` против Figma-спеки), `stack_probe` (ARCHITECTURE.md/существующие конвенции перед правкой в незнакомом проекте).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/frontend-designer/` (пока пустая — заполняется по ходу задач).
- **API:** Figma MCP (read-only: design context, screenshot, metadata, variables, library search — для parity-check, не для записи в Figma).

### `hiring-manager`
- **Путь:** `~/Brain/agents/hiring-manager/`
- **ID:** `hiring-manager`
- **Домен:** личный хайринг-менеджер на стороне кандидата — мониторинг/майнинг вакансий, отклики и cover letters, актуальность и вычитка резюме, юзкейсы и портфолио-описания проделанной работы, консистентность комплекта заявки.
- **Триггеры:** вакансия, резюме, CV, отклик, cover letter, юзкейс, портфолио, поиск работы, заявка на позицию, LinkedIn Open to Work.
- **Директивы:** `vacancy_mining` (поиск вакансий под профиль, лог в `career/research/`), `application_draft` (отклик/cover letter под конкретную вакансию в `career/applications/<slug>/`), `resume_maintain` (мастер-версия `career/resume/resume.md`, обновляется по новым результатам), `resume_proofread` (обязательная вычитка перед сдачей), `case_study_write` (Задача→Действие→Результат в `career/portfolio/`), `portfolio_entry` (сырой факт → портфолио-формулировка, источник — реальная история в `~/Brain`), `consistency_audit` (сверка тайтлов/цифр/tone перед сдачей комплекта).
- **Память:** `agent-memory/` → `~/Brain/.claude/agent-memory/hiring-manager/` (пока пустая — bootstrap при первой задаче).
- **API:** —

## Примечание

Все агенты выше остаются также доступны как саб-агенты через Task tool внутри `~/Brain` (определения — `~/.claude/agents/<name>.md`, кроме `ableton-producer`, чьё определение лежит в `~/Brain/.claude/agents/`). Папки под `~/Brain/agents/` — альтернативный способ вызова: открыть агента как отдельный workspace вместо делегирования из главной сессии.
