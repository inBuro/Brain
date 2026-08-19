# Карта скиллов

**Правило:** скиллы живут как 8 групп-мультискиллов, и над ними — `skills-architect`, инструмент, которым эта архитектура собрана и пересобирается. Триггерятся только роутеры групп (верхний уровень `.claude/skills/`); подскилл роутер читает как файл `<группа>/subskills/<имя>/SKILL.md` — вложенные SKILL.md системой не обнаруживаются, это фича архитектуры, не баг. Новый скилл вводится только через протокол онбординга (`meta/subskills/skill-onboarding/SKILL.md`). Исключения (не трогать): `Trading/` — отдельная память/репозиторий; вендорские паки (gstack, резюме-бандл, better-skills, awesome-ux-skills, MAX-MSP_CC_Framework в `Agents/m4l-master/skills/`) — внутренности не переписываются, только обвязка роутером. Официальные Anthropic-плагины (`frontend-design`, `code-review`, `code-simplifier`, `figma`, `superpowers` — `~/.claude/plugins/`) — отдельный, ещё более внешний слой: обновляются сами, не живут в `.claude/skills/`, группы лишь ссылаются на них по plugin-имени.

**Две площадки.** Часть групп живёт **глобально** (`~/.claude/skills/`, видны из любого репозитория на машине), часть — **проектно** внутри `~/Brain` (`~/Brain/.claude/skills/`, видны только при работе внутри Brain). Широкие/переиспользуемые группы (не завязанные на конкретный продукт) — глобальные; продукт-специфичные — проектные.

## Skills-architect — над группами, не одна из них

`~/Brain/.claude/skills/skills-architect/` — top-level, физически ничему не вложен и не будет: это инструмент, который проектирует и пересобирает саму групповую архитектуру (включая эту карту), поэтому он не может быть подскиллом группы, которую сам же может распустить или переставить. Вызывать напрямую («наведи порядок в скиллах», «скиллы дублируют друг друга», «пересобери среду»), не через роутер `meta` — `meta` на него только ссылается для обнаружимости, не владеет им.

## 8 операционных групп

**`design`** (глобальная, `~/.claude/skills/design/`) — 7 подскиллов: better-skills (вендор-пак «interfaces», 8 вложенных: accessibility/colors/interface/layout/typography/ui/writing + change-scoped review), figma-mcp (Figma MCP setup+справочник), mobbin (Mobbin MCP UI-референсы), parity-check (React↔Figma read-only аудит, обобщён под любой проект), extract-design-system (дизайн-система из URL), image-to-design-system (дизайн-система из скриншота), landing-page-design (конверсия лендингов). UX/UI-решения, Figma, дизайн-системы как спецификация — не код. Широкая кросс-проектная — fadercraft/bifi/Dynamic Focus/GrooveMix и другие потребляют её, не дублируют. Исполняет `ux-ui-designer`.

**`frontend`** (глобальная, `~/.claude/skills/frontend/`) — 2 подскилла + 1 официальный Anthropic-плагин: impeccable (тяжёлый фронтенд-тулчейн, 20+ команд, Apache 2.0, «Based on Anthropic's frontend-design skill»), design-anti-slop (чистка AI-слопа по коду HTML/CSS/Tailwind/React + визуальный режим по скриншоту), плюс прямой вызов плагина `frontend-design:frontend-design` (`~/.claude/plugins/`, лёгкий вход в production-grade фронтенд, обновляется сам). Выделена 2026-08-15 из `design` — реальный код, а не дизайн-решение. Исполняет `frontend-designer`.

**`ux-research`** (глобальная, `~/.claude/skills/ux-research/`) — 1 подскилл-ось (frameworks): 18 канонических UX-фреймворков (вендор-пак awesome-ux-skills — research methods, personas, journey/empathy mapping, Double Diamond, Nielsen-эвристики, WCAG, cognitive load, persuasion, feature prioritization, AI-продукт-паттерны). Стратегия/методология/критика, не исполнение — пара к `design`+`frontend`, разведена намеренно. Все три группы вместе покрывает агент `ux-researcher` (read-only по природе — закрывает роль аудитора, отдельных `-auditor` субагентов нет); `design` дополнительно исполняет `ux-ui-designer`, `frontend` — `frontend-designer`.

**`seo`** (глобальная, `~/.claude/skills/seo/`) — 2 подскилла: seo-audit (технический SEO), ai-seo (AI-цитируемость/AEO). Общие для любого продукта, сейчас использует только Fadercraft.

**`fadercraft`** (проектная, `~/Brain/.claude/skills/fadercraft/`) — 1 подскилл: fadercraft-youtube-outreach (майнинг+ответы на YouTube, `disable-model-invocation`). SEO и дизайн потребляет из глобальных групп, своих копий не держит.

**`portfolio`** (проектная, `~/Brain/.claude/skills/portfolio/`) — 2 своих подскилла (telegram-vacancy-mining, portfolio-writer) + индекс 22 глобальных резюме/job-search скиллов (не перенесены, вендорский бандл без общей структуры).

**`dev-toolchain`** (проектная, `~/Brain/.claude/skills/dev-toolchain/`) — 1 свой подскилл (directus-cms, CMS через официальный MCP) + индекс вендорского пака gstack (55 скиллов: браузер/iOS/планирование/деплой/документация/безопасность/сессия/GBrain/QA — не перенесён, свой корневой роутер `_gstack-command`).

**`meta`** (проектная, `~/Brain/.claude/skills/meta/`) — 2 подскилла: release-environment (сборка среды с нуля из директив/истории), skill-onboarding (протокол внедрения нового скилла).

## Вне периметра (не трогать)

- **M4L/Ableton** — не отдельная группа: уже цельная вендорская система `Agents/m4l-master/skills/MAX-MSP_CC_Framework/.claude/skills/` со своим роутером `max-router`, плюс агенты m4l-master/ableton-producer поверх неё.
- **Trading/** — отдельная память/репозиторий, полностью вне периметра.

## Счётчики (на 2026-08-15)

- Глобальный верхний уровень `~/.claude/skills/`: 81 запись = `design` + `frontend` + `ux-research` + `seo` (роутеры) + 55 gstack-related + 22 резюме-бандл.
- Проектный верхний уровень `~/Brain/.claude/skills/`: 5 записей = `skills-architect` (над группами) + `fadercraft`, `portfolio`, `dev-toolchain`, `meta` (4 из 8 операционных групп; design/frontend/ux-research/seo — глобальные).
- Удалено: `market-news-analyst` (глобальный симлинк на Trading-скилл, не нужен).
- Перенесено из `directives/` в скиллы: `directus-cms` (был сиротой, не отмечен в архиве).
- Перенесено из agent-memory в скиллы: 18 UX-фреймворков `ux-researcher` (`.claude/agent-memory/ux-researcher/skills/` → `ux-research/subskills/frameworks/rules/awesome-ux-skills/`) — методология, не накопленные факты, один канон в группе, не в памяти агента.
- 2026-08-15: группа `design` (10 подскиллов) разведена на `design` (7, UX/UI-решения) + `frontend` (2 + плагин, код). Локальная копия `frontend-design` (дублировала официальный плагин `frontend-design@claude-plugins-official`) ушла на пенсию в `~/.claude/skills/_archive/skills-retired-2026-08-15/`. Новая персона `frontend-designer` (`~/Brain/agents/frontend-designer/`) — держатель группы `frontend`.
