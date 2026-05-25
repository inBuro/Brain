# Components — Inventory

Обновлено: 2026-05-22
Источник: back-sync артефакты `figma-mirror.json` + код-репо `/Users/Kirill/Projects/Claude/Fadercraft/app/`. **Прямой аудит Figma `02 — Components` пока недоступен через MCP** — файл не опубликован как библиотека.

## Список компонентов

Атомы:
- **Button** — variants по back-sync известны: primary/secondary/tertiary; нужен дополнительный `outlined/onDark` (сейчас живёт через instance-override, кандидат на отдельный variant).
- (другие атомы — `(уточнить через прямой аудит Figma)`)

Молекулы и организмы (страничные секции лендинга):
- **Hero** — главный экран; в figma-mirror как компонент не зарегистрирован (code-only?).
- **OneActionBetweenThem** — центральная интерактивная механика лендинга. **Отсутствует** в figma-mirror.json как компонент. Кандидат на формализацию.
- **PluginMockup** — визуализация плагина; тоже отсутствует в figma-mirror.
- **FeatureSlider** — есть в Figma, нет в React ProductPage.
- **FeatureSplit** — есть в Figma, нет в React.
- **StatBlock** — есть в Figma, нет в React.
- **PullQuote** — есть в Figma, нет в React.
- **ProductGallery** — есть в Figma, нет в React.
- **VideoSection** — есть в Figma.
- **ICPColumns** — есть в Figma (page `04 — Organisms`).
- **RequirementsSection** — есть в React, нет в Figma.
- **FAQSection** — есть в React, нет в Figma.
- **ExplainerSection** — новый мастер-компонент (2026-05-22). Figma: nodes `1716:66` (Flip=false) и `1716:73` (Flip=true) на странице `07 — Illustrations`. React: `organisms/ExplainerSection`. Два экземпляра: Beat 2.1 "State Memory" (flip=false) и Beat 2.2 "Page A / Page B" (flip=true). Illustration slot — placeholder, illustrations TBD.
- **OneRigOneInstrument** — новый черновик секции (2026-05-22). Figma: node `1725:9` на странице `Images`, x=4590 y=0. Split layout: text col (eyebrow + Heading/Section + Body/Regular) left 560px + illustration placeholder right 480×400px (neutral-800 `#2A2C3C`). Standalone frame, не компонент.
- **ThreePlayersOneKit** — новый черновик секции (2026-05-22). Figma: node `1727:19` на странице `Images`, x=4590 y=632. Eyebrow + Heading/Section header, три ICP-тайла (icon placeholder 40×40 `#414458` + Heading/Title + Body/Regular), columns row 40px gap. Standalone frame, не компонент.

## Дельта Figma ↔ React

| Сторона | Имеет, но другая сторона — нет |
|---|---|
| Figma → React | FeatureSlider, FeatureSplit, StatBlock, PullQuote, ProductGallery |
| React → Figma | OneActionBetweenThem, RequirementsSection, FAQSection, CatalogSection |
| Both sides | ExplainerSection (created 2026-05-22 — Figma + React) |

Порядок секций на ProductPage в коде и в `03 — Demo` в Figma — **разный**.

## Что делать

1. **Решить direction of truth** для каждой расхождения: или Figma догоняет код, или код догоняет Figma. По-секционно.
2. **Зарегистрировать OneActionBetweenThem / Hero / PluginMockup как Figma-компоненты** (или явно пометить как «code-only, design-only-in-page-demo» — но это анти-паттерн для DS).
3. **Привести порядок секций ProductPage** в соответствие с Figma `03 — Demo`.
4. **Добавить Button variant `outlined/onDark`** в Figma вместо override.

## Связанные файлы

- `MEMORY.md` — раздел «Компонент-инвентарь»
- `../wiki/design-system.md` — раздел Components
- `../patterns/` — паттерны (формы, навигация, состояния), пока пусто
