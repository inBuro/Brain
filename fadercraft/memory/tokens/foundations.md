# Tokens — Foundations (Radius / Shadow / Icon / Motion)

Обновлено: 2026-05-15
Статус: **частично — большая часть требует верификации в Figma `01 — Tokens`**.

## Radius

В Figma коллекция `Radius` зарегистрирована (по `figma.config.json`), но в `raw/Light.tokens.json` не экспортирована (там только цвета). MCP к странице Tokens доступа не имеет.

**TODO:** достать полную шкалу (none / sm / md / lg / pill / full). Маппинг token → use-case.

## Shadow / Elevation

**Не найдены ни в JSON, ни в figma.config.json.** Кандидат: либо elevation как часть Figma Effects styles (не Variables), либо вообще отсутствует. Проверить на странице Tokens.

Если elevation нет — зафиксировать как сознательное «flat-only» решение или добавить шкалу.

## Icon

В Semantic есть **только один** токен:
- `Semantic.Icon.Primary = Neutral.1000` (#0F1017)

Маловато для системы. Кандидаты: `icon.secondary`, `icon.disabled`, `icon.onDark.*`, `icon.action`, `icon.danger`.

Иконографика (набор иконок, размеры, stroke-weight, библиотека) — `(уточнить)`.

## Motion

**Не найдены в JSON.** Если используется — описать кривые и длительности (например, `motion.duration.fast/base/slow`, `motion.easing.standard/emphasized`). Иначе зафиксировать «motion-tokens нет, используем системные дефолты».

## Breakpoints

`(уточнить)` — точные брейкпойнты desktop/tablet/mobile не зафиксированы. По правилу из памяти Brain: «прецедент одной responsive instance над per-breakpoint вариантами Layout=desktop/tablet/mobile».

## Связанные файлы

- `MEMORY.md` — разделы «Радиусы», «Breakpoints» (placeholder)
- `../wiki/design-system.md` — релевантные секции
