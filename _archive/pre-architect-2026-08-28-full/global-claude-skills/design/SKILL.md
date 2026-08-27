---
name: design
description: Роутер группы UX/UI-дизайна (7 подскиллов) - accessibility, цвет, layout, типографика, UI-polish, копирайт интерфейса, кросс-дисциплинарное ревью, Figma MCP, Mobbin-референсы, React↔Figma parity, извлечение дизайн-систем, лендинги. Применять при любой задаче про интерфейс, экран, компонент, дизайн-систему, ревью UI, доступность, цвет, типографику, лендинг, референсы UI/UX — для ЛЮБОГО проекта, не только Fadercraft. Для сборки/правки реального фронтенд-кода (HTML/CSS/React) — группа `frontend`, не эта. Глобальная группа: продукты (Fadercraft, Bifi, Dynamic Focus, GrooveMix, портфолио и др.) потребляют её, а не заводят свои копии.
---

# Design — роутер группы

Подскиллы лежат в `subskills/<имя>/SKILL.md` — прочитай нужный и работай по нему.

| Задача | Подскилл |
|---|---|
| Фокус-кольца, клавиатурная навигация, ARIA, формы, скринридеры | better-skills → better-accessibility |
| OKLCH, палитры, контраст, семантические цвет-токены | better-skills → better-colors |
| Группировка, spacing, breakpoints, reading order | better-skills → better-layout |
| Шрифты, type scale, line-height, wrapping | better-skills → better-typography |
| Border-radius, тени, анимации, иконки, полировка | better-skills → better-ui |
| UX-копирайт интерфейса (кнопки, ошибки, пустые состояния) | better-skills → better-writing |
| Кросс-дисциплинарное ревью экрана/флоу целиком (quick/full) | better-skills → better-interface — сам решает quick/full, дальше не маршрутизировать |
| Ревью только изменённого (diff/branch/PR) | better-skills → interface-review |
| Подключить Figma MCP или работать через get_design_context/use_figma/generate_diagram | figma-mcp |
| Найти референс UI/UX (флоу, экран, секция сайта) | mobbin |
| Проверить совпадение React-компонентов и токенов с Figma | parity-check |
| Собрать/раскритиковать/отполировать код фронтенда, почистить его от ИИ-слопа | группа `frontend` (`~/.claude/skills/frontend/SKILL.md`) — персона `frontend-designer` |
| Вытащить дизайн-систему из публичного сайта (URL) | extract-design-system |
| Вытащить дизайн-систему из скриншота/мокапа (картинка) | image-to-design-system |
| Оптимизировать лендинг под конверсию (hero, CTA, соцдоказательства) | landing-page-design |

## Аудит

Отдельного субагента-аудитора для этой группы нет — эту роль закрывает существующий агент **ux-researcher** (`~/.claude/agents/ux-researcher.md`), read-only по природе. Он опирается на эту группу за конкретными UI-проверками (better-interface/interface-review/better-accessibility/mobbin), на группу **`frontend`** (`~/.claude/skills/frontend/SKILL.md`) за кодовой проверкой (design-anti-slop) и на отдельную группу **`ux-research`** (`~/.claude/skills/ux-research/SKILL.md`) за стратегическими фреймворками (какой метод/рамкой думать) — методология и краft разведены по разным группам намеренно. Заводить дублирующего `design-auditor` избыточно.

## Дедуп-вахта

- **extract-design-system vs image-to-design-system**: не дубли — разный вход (URL сайта vs скриншот/мокап), оба валидны.
- **better-skills** (better-accessibility/better-colors/better-interface/better-layout/better-typography/better-ui/better-writing/interface-review) — вендорский пак «interfaces» (MIT, Jakub Krehel), внутренности не трогать, обвязка — этот роутер.
