# Foundation — GrooveMix

**Источник:** референс-скриншот Traktor Pro 4 (Figma, файл `Untitled`, node `1:6`) — профессиональный тёмный DJ-микшер: почти чёрный фон, панели на тон светлее, единый синий системный акцент (выделение в браузере треков, заливка индикатора на ручке).
**Метод:** палитра снята с самого скриншота (сэмплинг пикселей) и сверена с уже вживую оттестированной вёрсткой `sidepanel.html` — числа не менялись, только сведены в токены.
**Дата:** 2026-08-02

Токены лежат в `tokens.json` (источник истины) и генерируются в `tokens.css` (CSS custom properties, подключены в `sidepanel.html` через `<link rel="stylesheet" href="ds/tokens.css">`).

---

## Color — Neutral (шкала фонов/текста/обводок)

Почти чёрная, без синего оттенка — как в Traktor, а не нейтрально-серая a-ля macOS.

| Токен | Hex | Где используется |
|---|---|---|
| `--color-0` | `#000000` | обводка ручки/фейдера, линия трека кроссфейдера |
| `--color-50` | `#101010` | дно радиального градиента ручки |
| `--color-100` | `#1a1a1a` | `--color-bg-app` — фон всего окна |
| `--color-150` | `#1e1e1e` | середина градиента ручки |
| `--color-200` | `#222222` | фон play-кнопки |
| `--color-250` | `#242424` | `--color-bg-panel` — select, zoom-кнопки, Connect в swap-режиме |
| `--color-300` | `#262626` | `--color-bg-panel-hover` — active-состояние тех же элементов |
| `--color-350` | `#2c2c2c` | `--color-bg-elevated` — верх градиента фейдера, active play-кнопки |
| `--color-400` | `#333333` | `--color-border-default` — базовая обводка панелей/полей |
| `--color-450` | `#3c3c3c` | верх градиента ручки |
| `--color-500` | `#444444` | обводка play-кнопки |
| `--color-550` | `#4a4a4a` | верх градиента фейдера |
| `--color-600` | `#666666` | `--color-text-muted` — hint, deckTitle |
| `--color-650` | `#888888` | `--color-text-tertiary` — status, knobLabel |
| `--color-700` | `#999999` | `--color-text-secondary` — hint `<b>`, нейтральная стрелка/дуга ручки |
| `--color-800` | `#cccccc` | текст zoom/swap-кнопок |
| `--color-850` | `#eeeeee` | `--color-text-primary` — основной текст |
| `--color-900` | `#ffffff` | `--color-text-heading` — заголовок, Connect |

## Color — Brand (акцент по деке)

В самом Traktor цвет деки — не системный токен, а per-track арт/оверлей; но собственный синий акцент интерфейса (выделение `Track Collection`, заливка progress-ручек) — прямое совпадение с уже выбранным для деки A. Дека B держит тёплый контраст, как второй канал на любом физическом миксере.

| Токен | Hex |
|---|---|
| `--color-accent-deckA` | `#99ccff` |
| `--color-accent-deckB` | `#ffcc99` |

## Color — Semantic

| Токен | Значение | Где |
|---|---|---|
| `--color-success` | `#22aa55` | Connect (активная фаза), фокус-обводка select/mixer |
| `--color-success-active` | `#119944` | Connect `:active` |
| `--color-success-glow` | `#66cc66` | play-кнопка в состоянии `isPlaying` |
| `--color-selection-bg` | `#243a5b` | сэмплировано с выделенной вкладки `Track Collection` в самом скриншоте Traktor — фон выбранной строки в Sidebar/Tab (компоненты «02 — Components», в текущем экране GrooveMix не используется) |

## Space

Не 4/8pt-сетка — значения 1:1 из уже отлаженной вручную вёрстки (плотный экран сайдпанели, каждый gap подбирался на глаз).

| Токен | px |
|---|---|
| `--space-4` | 4 |
| `--space-5` | 5 |
| `--space-6` | 6 |
| `--space-8` | 8 |
| `--space-10` | 10 |
| `--space-12` | 12 |
| `--space-20` | 20 |
| `--space-40` | 40 |

Компонентные размеры (диаметр ручки 1.9rem, высота deckThumb 2.75rem, кроссфейдер-thumb 0.9375×1.875rem и т.п.) токенами не покрыты — это не переиспользуемый ритм, а размер конкретного компонента; см. `components.md`.

## Radius

| Токен | px | Где |
|---|---|---|
| `--radius-sm` | 3 | кроссфейдер-thumb |
| `--radius-md` | 4 | кнопки, select, deckThumb |
| `--radius-lg` | 6 | deck-панель, `#mixer` |
| `--radius-full` | 50% | ручки, LED |

## Shadow

Инсет-тени ручки/фейдера и цветные glow — собраны через `color-mix(in srgb, var(--color-X) N%, transparent)` вместо захардкоженных `rgba()`, чтобы прозрачность считалась от того же токена, а не дублировала его значение отдельной строкой.

| Токен | Назначение |
|---|---|
| `--shadow-knob-rest` | базовый объём ручки (inset highlight + inset shade + drop) |
| `--shadow-knob-hover` | + белое кольцо на 12% при наведении |
| `--shadow-fader-thumb` | объём thumb'а кроссфейдера |
| `--shadow-glow-deckA` / `-strong` | свечение указателя/LED деки A (70% / 80%) |
| `--shadow-glow-deckB` / `-strong` | свечение указателя/LED деки B (70% / 80%) |

## Typography

Один семейный стек: `-apple-system, system-ui, sans-serif` — как у Traktor (нативный системный шрифт, не кастомный).

| Токен | rem | px |
|---|---|---|
| `--text-2xs` | 0.5625 | 9 |
| `--text-xs` | 0.625 | 10 |
| `--text-sm` | 0.6875 | 11 |
| `--text-base` | 0.75 | 12 |
| `--text-md` | 0.8125 | 13 |
| `--text-lg` | 0.875 | 14 |

`font-weight` токенами не покрыт — используется точечно (400 обычный текст, 600–800 заголовки/лейблы/A-B), это не масштаб, а бинарный акцент на конкретных узлах.

## Figma mirror

Токены зеркалированы в тот же файл (`Wshgc3wZzs7e8uJydaZJIx`), страница **«01 — Tokens»** — Variable Collections `Color` (Neutral/Brand/Semantic, 35 переменных), `Space` (8), `Radius` (3), плюс 6 Text Styles (`Type/2xs…lg`, SF Pro) и 7 Effect Styles (`Shadow/Knob Rest|Hover`, `Shadow/Fader Thumb`, `Shadow/Glow Deck A|B` ± Strong). Каждая переменная несёт `codeSyntax.WEB` = точное имя CSS-токена — `get_variable_defs` на этой странице возвращает `tokens.css` 1:1.

Компонентов (Батч 7+ `sync_to_figma.md`) там нет — на этом экране нет React, только вёрстка в `sidepanel.html`.

Известное ограничение: превью-скриншот через Figma MCP в этой сессии не рендерит текстовые слои (проверено на 3 разных сценариях/шрифтах) — сами Text Style и текстовые лейблы на «01 — Tokens» в файле корректны, просто не видны в MCP-скриншоте.
