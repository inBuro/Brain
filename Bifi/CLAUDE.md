# Bifi — Beefy Design System project

UX/UI работа над **Beefy.finance** через дизайн-систему **v2.4 Beefy Design System**.

**Source of truth (Figma):**
https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System?node-id=5015-6337

## Роль

Используй роль `ux-ui-designer` (см. `~/Brain/.claude/agent-memory/ux-ui-designer/MEMORY.md` для общей методологии).

## Структура памяти

- `memory/MEMORY.md` — карта: collections, статусы файлов, горячие токены, decisions index.
- `memory/questions.md` — техдолг и открытые вопросы (Active / Closed). **Прогоняй задачу через активные вопросы перед началом работы.**
- `memory/tokens/` — primitives, colors, density, typography, breakpoints, spacing, foundations, motion.
- `memory/components/` — per-component документация (variants, sizes, состояния, токены, edge cases).
- `memory/decisions/` — почему приняты решения (контекст + альтернативы).
- `memory/patterns/` — переиспользуемые рецепты (формы, навигация, состояния).
- `memory/product/` — glossary, tone-of-voice.
- `memory/wiki-workflow.md` — шаблон для ingest knowledge-base wiki (не активен; задел на будущее).

## Project-specific правила

- **Text Styles не использовать.** Beefy DS не имеет сущности Text Style — стилизация текста через биндинг 5 Typography-переменных (fontFamily / fontWeight / fontSize / lineHeight / letterSpacing) напрямую на text-узлы. Глобальное правило «Text Style required» здесь отменено.
- **Density** скрыт от публикации (hidden) — в дизайне ссылаемся через семантические алиасы (Colors, Typography), не напрямую.
- **Naming-конвенция Density**: имя = `{step}` без префикса, значение = `step × 4` px; десятичный разделитель — запятая (`5,5` = 22px).
- **Breakpoints**: Mobile 360 / Tablet 960 / Desktop 1260. Header-only transition ~1041px не отражён в Figma — обрабатывается внутри desktop-фрейма.
- **Max-content cap в коде** = 1296 px; Figma `Desktop` = 1260; разница 36 px — padding/safe zone.
- **Decisions and patterns are living direction**, не контракты — любая секция переоткрываема в имплементации.
