# Components — GrooveMix

Каталог атомов, уже реализованных в `sidepanel.html` (единый файл, без React) — здесь только зафиксировано, какие токены стоят за каждым состоянием. Компоненты не выносились в отдельные файлы в самом расширении: экран один, второго использования там пока нет.

CSS вынесен в общий `../styles.css`, который читают и `sidepanel.html`, и Storybook — правки стилей делаются один раз, в одном файле.

| Компонент | Селектор | Токены | Варианты/состояния |
|---|---|---|---|
| **Knob** (ручка EQ/gain) | `.knob` + `.knobPointer` + `.knobArc/.knobArcFill` + `.knobLed` | `--color-450/150/50` (градиент), `--shadow-knob-rest/-hover`, `--color-accent-deckA/B` | rest / hover (кольцо) / active (grabbing) / per-deck tint (pointer, arc, LED) / LED lit |
| **Crossfader** | `.crossTrack` + `.crossThumb` | `--color-0` (линия), `--color-550→350` (градиент thumb), `--shadow-fader-thumb`, `--radius-sm` | drag (позиция через `left`, transition 60ms) |
| **PlayButton** | `.playBtn` | `--color-200` bg, `--color-500` border, `--color-text-primary`, `--radius-md` | rest / active / `isPlaying` (`--color-success-glow`) |
| **DeckPanel** | `.deck` + `.deckThumb` | `--color-border-default`, `--radius-lg`, `--space-6` | пусто (нет `src`, thumb `hidden`) / с обложкой трека |
| **Select** (выбор вкладки) | `select` | `--color-bg-panel`, `--color-text-primary`, `--color-border-default`, `--color-success` (focus) | rest / focus |
| **ConnectButton** | `#connect` | `--color-success` / `--color-success-active`, `--color-bg-panel` (swap-режим) | primary (Connect) / active / `.swapMode` (secondary look — уже подключено, кнопка = «поменять A/B») |
| **ZoomButton** | `.zoomBtns button` | `--color-bg-panel`, `--color-800`, `--color-border-default`, `--radius-md` | rest / active |
| **ClusterLabel** (буква A/B) | `.clusterLabel` | `--color-accent-deckA/B` | статичный, per-deck |
| **TempoReadout** | `.tempoA` / `.tempoB` | `--color-accent-deckA/B` | скрыт (`hidden`) до Connect |

## Правило

Новый UI-элемент на этом экране — цвет/радиус/тень только через токены из `ds/tokens.css` (`var(--color-...)`, `var(--radius-...)`, `var(--shadow-...)`). Точечные размеры (диаметр, высота, ширина конкретного узла) — это не токены, задаются напрямую, как и раньше.

## Storybook

Вживую каждый атом смотреть в `../storybook/` (vanilla JS/HTML — без React, по решению пользователя): `npm install && npm run storybook` → `http://localhost:6006`. Один сторис на компонент из таблицы выше, Knob/Crossfader — с настоящим pointer-drag (та же математика, что в `sidepanel.js`: `tieredAngle`, `PX_PER_DB`/`PX_PER_GAIN`, `setKnobArc`), а не статичной картинкой. Общий хелпер — `storybook/stories/lib/knob.js`. Стили и токены подключены из `../ds/tokens.css` и `../styles.css` — тот же файл, что видит реальное расширение, второй копии CSS нет.

Это отдельная витрина для сверки дизайна, не рабочий код расширения — `sidepanel.html`/`sidepanel.js` она не заменяет и от неё не зависит.
