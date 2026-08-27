---
name: dev-toolchain
description: Роутер группы инженерного тулчейна (1 свой подскилл + индекс вендорского пака gstack, 55 скиллов). Применять при задачах на браузер-автоматизацию/скрейпинг, iOS-разработку, ревью плана/PR, деплой, документацию, безопасные правки, QA, GBrain-семантику, canary-мониторинг — а также CMS-контент (Directus). Не про UI/визуальный дизайн — за этим в группу design.
---

# Dev-toolchain — роутер группы

## Свой подскилл

| Задача | Подскилл |
|---|---|
| Вынести контент продукта в CMS без кода (Directus, MCP) | subskills/directus-cms |

## Индекс: gstack (глобальный вендорский пак, `~/.claude/skills/gstack/` + 53 символлинк-обёртки, свой корневой роутер `_gstack-command`)

Вызываются по своему имени напрямую — не физически перенесены (вендорский пак с собственной внутренней маршрутизацией и compiled-бинарником, трогать нельзя).

| Категория | Скиллы |
|---|---|
| Браузер / скрейпинг | browse, connect-chrome, open-gstack-browser, pair-agent, scrape, setup-browser-cookies, skillify |
| iOS-разработка | ios-clean, ios-design-review, ios-fix, ios-qa, ios-sync |
| Дизайн-ревью самого gstack (см. дедуп-вахту — пересекается с группой design) | design-consultation, design-html, design-review, design-shotgun |
| Планирование / ревью | autoplan, codex, cso, devex-review, office-hours, plan-ceo-review, plan-design-review, plan-devex-review, plan-eng-review, review, spec |
| Деплой | land-and-deploy, landing-report, setup-deploy, ship |
| Документация | document-generate, document-release, make-pdf |
| Безопасность / скоуп правок | careful, freeze, guard, unfreeze |
| Сессия / прочий мета | context-restore, context-save, gstack-upgrade, health, investigate, learn, plan-tune, retro |
| GBrain / AI | benchmark-models, setup-gbrain, sync-gbrain |
| QA | benchmark, canary, qa, qa-only |

## Дедуп-вахта

- **connect-chrome = open-gstack-browser**: точный дубль (одинаковое имя во фронтматтере), connect-chrome — legacy-алиас. Не трогать внутри (вендор), просто знать, что это одно и то же.
- **careful / freeze / guard**: `guard` = `careful` + `freeze` объединённо — оставлены раздельно намеренно, для точечного выбора.
- **qa / qa-only**: `qa-only` — `qa` без шага фиксов (только отчёт).
- **gstack design-review vs group design (design-anti-slop)**: одна и та же проблема (AI-слоп в UI) двумя методами — `design-review` визуально через headless-рендер живой страницы, `design-anti-slop` (группа `design`) по каталогу через код. Держать оба, не сливать — разные группы, разный вендор.
