# Traktor Reference — Figma «02 — Components»

Отдельно от `components.md` (атомы, уже живущие в `sidepanel.html`). Здесь — компоненты, собранные напрямую со скриншота Traktor Pro 4 (тот же референс, с которого сняты токены в `foundation.md`), а не с существующего экрана GrooveMix. Это словарь визуального языка на будущее — Storybook/код не трогают, пока не понадобится конкретный экран.

Файл `Wshgc3wZzs7e8uJydaZJIx`, страница **«02 — Components»**. Иконки — прозрачные плейсхолдеры (точка/квадрат), не настоящие SVG Traktor — сама директива это не требует.

| Компонент | Variant-ось | Токены | Источник в скриншоте |
|---|---|---|---|
| **IconButton** | `State=Default\|Active` | `Semantic/Bg/Panel Hover`, `Radius/Md`, `Semantic/Text/Tertiary\|Primary` | иконки тулбара (CPU, view-toggles) |
| **TitleBar** | — | `Neutral/400`, `Type/md` | верхняя строка окна с traffic lights |
| **Toolbar** | — (композиция из `IconButton`) | `Neutral/250`, `Space/8`, `Type/sm`, `Radius/Sm` | вторая строка: иконки + часы `22:30` + дропдаун `Parallel` |
| **SidebarItem** | `State=Default\|Selected` | `Semantic/Selection/Bg` (новый токен, см. `foundation.md`), `Semantic/Text/Secondary\|Primary` | строка дерева слева (Track Collection/Playlists/…) |
| **Sidebar** | — (композиция из `SidebarItem` × 7) | `Neutral/100` | вся левая панель браузера |
| **Tab** | `State=Default\|Selected` | `Semantic/Selection/Bg` | Preparation / Track Collection над таблицей |
| **KeyBadge** | `Deck=A\|B` | `Brand/Deck A`, `Brand/Deck B` | оранжевая/синяя буква A/B у трека в списке |
| **RatingStars** | — (5 звёзд, `figma.createStar`) | `Semantic/Text/Tertiary` | колонка RATING |
| **TrackRow** | `State=Default\|Alt\|Selected` | `Neutral/300` (Alt), `Semantic/Selection/Bg` (Selected), `Radius/Sm` (cover) — композиция из `KeyBadge`+`RatingStars` | строка таблицы треков, чередующиеся оттенки + подсветка выбранной |
| **TrackTable** | — (шапка + 7× `TrackRow`) | `Neutral/100` | вся таблица Track Collection |

## Channel & Transport (страница «03 — Channel & Transport»)

Второй заход — по двум крупным скриншотам канал-стрипа микшера и транспорт/cue-бара, которые заинтересовали больше, чем браузер треков.

| Компонент | Variant-ось | Токены | Источник в скриншоте |
|---|---|---|---|
| **Knob** | `State=Rest\|Boosted` | `Neutral/150` (корпус), `Shadow/Knob Rest`, `Brand/Deck A` (дуга) | базовая ручка EQ/gain — раньше существовала только в коде (GrooveMix), в Figma не была собрана |
| **LineFader** | — | `Neutral/0` (трек), `Brand/Deck A` (заливка уровня), `Neutral/550`+`Shadow/Fader Thumb` (грип) | вертикальный канальный фейдер между колонками ручек |
| **FXButton** | `State=Default\|Active` | `Neutral/250\|450`, `Radius/Md` | квадратные кнопки «1»/«2» под FX |
| **ChannelStrip** | — (композиция: колонка GAIN/FLTR/FX/KEY + `LineFader` + колонка HI/MID/LO) | `Neutral/100` | весь канал-стрип одной деки |
| **TransportButton** | `Kind=Play\|CUE\|CUP\|FLX\|REV` | `Neutral/850` (Play — заливка), `Semantic/Text/Primary` (текстовые) | нижняя транспортная строка слева |
| **SegmentButton** | `State=Default\|Active` | `Neutral/250\|450` | кнопки битовой сетки `1/4 1/2 1 2 4 8 16 32` |
| **BeatDivisionSelector** | — (композиция: `NavButton` + 8× `SegmentButton`, «4» активна) | — | весь селектор деления такта с шевронами по краям |
| **NavButton** | `Dir=Prev\|Next` | `Neutral/250`, `Semantic/Border/Default` | `◀\|` / `\|▶` — и как самостоятельная пара (скип трека), и как шевроны `BeatDivisionSelector` |
| **CueSegment** | `State=Default\|Active` | `Semantic/Cue/Segment`, `Semantic/Cue/Active` (новые токены) | пронумerованный сегмент бит-сетки |
| **CueSegmentBar** | — (композиция: 8× `CueSegment`, сегмент 7 активен) | — | вся полоса cue-сегментов над таймлайном |
| **BeatJumpLabel** | — | `Neutral/200`, `Semantic/Text/Primary\|Tertiary` | «BeatJump ⌄» слева от бара |
| **BeatJumpBar** | — (композиция: `BeatJumpLabel` + `NavButton` + 12× `SegmentButton`: FINE, 1/16…32, LOOP) | `Neutral/200` | полоса Beat Jump / деления такта — **референс из другого софта** (не Traktor), прислан отдельным скриншотом |

**Правка задним числом:** `SegmentButton` `State=Active` перекрашен с серой (`Neutral/450`, моё первоначальное предположение без референса) на `Semantic/Cue/Segment` (синий) с тёмным текстом — так активный сегмент выглядит на реальном скриншоте BeatJump-бара. Меняет и старый `BeatDivisionSelector` (тот же компонент переиспользован) — это правильно, синий там тоже уместнее серого.

### Новые токены (Cue/Segment)

`Semantic/Cue/Segment` (`#3d6fe5`, `var(--color-cue-segment)`) и `Semantic/Cue/Active` (`#c3e05a`, `var(--color-cue-active)`) — **визуальная оценка на глаз**, не пиксель-сэмплинг: источник этих двух — скриншот, вставленный прямо в чат, а не файл, который можно было прогнать через `curl`+`PIL` (как исходный Traktor-скриншот для `foundation.md`). Если точность важна — пересэмплировать при следующей возможности прогнать файл через тот же pixel-sampling пайплайн.

## Новый токен (Selection)

`Semantic/Selection/Bg` (`#243a5b`, code syntax `var(--color-selection-bg)`) — сэмплирован с самой подсвеченной вкладки `Track Collection` на скриншоте. Существующей `--color-accent-deckA` не подошёл: тот — светло-голубой акцент под ручки/леды, а это тёмно-синяя заливка выбранной строки/вкладки, отдельная роль. Добавлен и в Figma (`Color` collection), и в `tokens.json`/`tokens.css`.

## Известное ограничение скриншот-рендерера

Скриншот-рендерер этого Figma MCP не всегда рисует текстовые слои — на отдельных изолированных компонентах («02 — Components») текст не появился в превью, но структурно корректен (шрифт/стиль/цвет проверены через `get_metadata`). На полном скриншоте страницы «03 — Channel & Transport» текст неожиданно отрисовался нормально — похоже, это нестабильность рендера, а не системный запрет. В самом Figma текст в любом случае на месте.
