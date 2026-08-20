# Директивы

Жанр живой. Директива — разовая процедура, которую вызывают по имени, когда она понадобилась: «выполни директиву `directive_recursive_briefing`». Она не висит в постоянном инструментарии и не подхватывается сама.

**Чем отличается от скилла.** Скилл — постоянный инструмент: лежит в `~/.claude/skills/` (глобально) или `~/Brain/.claude/skills/` (проектно), агент сам решает, что он уместен, и подтягивает его без спроса. Директива — наоборот: пошаговый сценарий под конкретный разовый заход, который включают вручную. Если процедура нужна регулярно и должна срабатывать сама — это скилл, её место не здесь.

**Как вызвать.** Назвать файл по имени. Директива читается целиком и исполняется как инструкция на этот заход, поверх обычных правил проекта.

Когда за какой тянуться, одной строкой — [_catalog.md](_catalog.md).

## Что лежит

| Директива | О чём |
|---|---|
| `directive_builder.md` | Собрать новую директиву: интервью по всем блокам канона жанра → готовый файл + строка в этой таблице |
| `directive_recursive_briefing.md` | Собрать полный бриф на новый интерфейс из минимальных вводных PM/заказчика. Роль Senior UX Lead, адаптируется под тип проекта |
| `directive_dashboard.md` | Сборка дашборда под юзер-тесты прототипа |
| `directive_youtube_outreach.md` | Growth-пайплайн Fadercraft в YouTube. Также живёт как скилл `fadercraft-youtube-outreach` |
| `directive_release_environment.md` | Мета-инструмент сборки рабочей среды под релиз. Также живёт как скилл `release-environment` |
| `parity_check.md` | Инженерный аудит соответствия код↔Figma. Также живёт как подскилл `design/parity-check` |
| `figma_mcp_setup.md` | Разовое подключение Figma MCP |
| `build_tokens.md` | Figma-переменные → токены |
| `build_react_ds.md` | Сборка React-дизайн-системы из токенов |
| `directive_react_base.md` | Базовый React-каркас под ДС |
| `directive_storybook.md` | Storybook поверх собранной ДС |
| `demo_app.md` | Демо-приложение на собранной ДС |
| `sync_to_figma.md` | Обратная синхронизация код → Figma батчами |

Первые шесть — общего назначения. Остальные восемь — курсовой пайплайн «Figma → React ДС» (модуль курса, учебный демо-продукт CryptoVPS): пройден один раз, для повседневной работы не нужен, но пригоден как готовый сценарий, если поднимать продукт с нуля через Figma.

## Курсовой пайплайн AI-Native Designer (модули 1–4)

Скопированы из папок уроков 2026-08-20; источник истины — сам курс, здесь рабочие копии.
У каждой есть воркфлоу-обёртка в [`../workflows/`](../workflows/README.md), вызов слэш-командой.

| Директива | Модуль | О чём |
|---|---|---|
| `directive_quick_research.md` | 1 | быстрый конкурентный ресёрч из брифа |
| `directive_deep_research_prompt.md` | 1 | промпт для Gemini Deep Research |
| `directive_competitive_analysis.md` | 1 | SWOT, фичи, UX-паттерны конкурентов |
| `directive_ux_audit.md` | 1 | AI-аудит существующего продукта по скриншотам |
| `directive_personas.md` | 1 | синтетические персоны |
| `directive_simulated_interview.md` | 1 | симуляция интервью с персонами |
| `directive_scope_prioritization.md` | 1 | scope, приоритизация, MVP |
| `directive_prd_notion.md` | 1 | PRD + страница в Notion |
| `connect_notion_mcp.md` | 1 | подключение Notion MCP |
| `directive_prd_to_sitemap.md` | 2 | PRD → sitemap → user flow на FigJam |
| `directive_wireframes.md` | 2 | вайрфреймы экранов через Figma MCP |
| `directive_component_variants.md` | 2 | матрица variants × states × sizes |
| `directive_final_screens.md` | 2 | финальные экраны из instance |
| `directive_screens_audit.md` | 2 | read-only аудит консистентности экранов |
| `directive_brand_visual_direction.md` | 3 | визуальный манифест продукта |
| `directive_video_storyboard.md` | 3 | раскадровка ролика + image-to-video |
| `directive_handoff.md` | 4 | заливка на GitHub и передача в разработку |
| `directive_screens.md` | 4 | экран из фрейма Figma + реестр |
| `directive_wire.md` | 4 | оживление прототипа |
| `directive_deploy.md` | 4 | публикация прототипа |
| `directive_figma_mcp.md` | 2 | подключение Figma MCP (курсовая версия; Bifi-вариант — в `bifi/directives/`) |

Три Bifi-специфичные директивы живут отдельно, в [bifi/directives/](../bifi/directives/): `directive_ds_scan.md`, `directive_ds_rebind.md`, `directive_figma_mcp.md`.

## История жанра

Директивы были заархивированы 2026-08-12 при переезде на навыки Claude Code — часть превратилась в скиллы, остальное убрали в `_archive/`, чтобы курсовые шаги не маячили в списке при обычной работе. Что во что перешло:

| Директива | Куда ушла при миграции |
|---|---|
| `directive_figma_mcp.md` | → подскилл `design/figma-mcp` (справочник Figma MCP, нужен в любой работе с Figma) |
| `parity_check.md` | → подскилл `design/parity-check` (инженерный аудит код↔Figma) |
| `directive_youtube_outreach.md` | → скилл `fadercraft-youtube-outreach` (реальный growth-пайплайн, не курсовой) |
| `directive_release_environment.md` | → скилл `meta/release-environment` (мета-инструмент сборки среды) |
| остальные | остались документами, живого скилла нет — сознательно |

**Найдено при пересборке скиллов 2026-08-13 (skills-architect):** `directus-cms/` лежал прямо в `directives/` — готовый универсальный навык (Directus CMS через официальный MCP), созданный уже после ретирки жанра, но не доперенесённый и никак не отмеченный. Не курсовой шаг, живой на будущее: «лежит, чтобы однажды им воспользоваться» (формулировка владельца). Перенесён в `.claude/skills/dev-toolchain/subskills/directus-cms/`.

**Ретирка отменена 2026-08-16.** Жанр восстановлен по решению владельца: скилл и директива решают разные задачи, и второе не заменяется первым. Файлы подняты из `_archive/` в корень `directives/`. Отдельно: 2026-08-16 массовое переименование папок Brain в lowercase на case-insensitive APFS снесло всё содержимое `directives/`, `career/` (ныне `portfolio/`) и `.claude/skills/` — восстановлено из коммита `401289c^` в тот же день.

Превратить директиву в скилл по-прежнему тривиально: скопировать текст в `SKILL.md`, добавить frontmatter `name` + `description`.
