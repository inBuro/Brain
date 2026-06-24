# Components (scan)

**Источник:** https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Fadercraft
**Дата сканирования:** 2026-06-19
**Страницы:** Atoms, Icons, Molecules, Organisms (Logo — пустая)

---

## Атомы (Atoms)

### Button
- **Назначение:** основная кнопка действий — primary, secondary, outlined, link
- **Варианты:** Variant: primary | secondary | outlined | link; Size: sm | md | lg; show-ic (bool)
- **Node ID:** `33:20`

### Badge
- **Назначение:** статусный бейдж — нейтральный, успех, ошибка, предупреждение, инфо
- **Варианты:** Variant: neutral | success | danger | warning | info
- **Node ID:** `35:12`

### TagChip
- **Назначение:** кликабельный тег-чип, два состояния
- **Варианты:** State: default | active
- **Node ID:** `53:25`

### Avatar
- **Назначение:** аватар пользователя, три размера
- **Варианты:** Size: sm | md | lg
- **Node ID:** `36:8`

### Input
- **Назначение:** текстовое поле ввода (одиночный компонент без вариантов)
- **Node ID:** `38:2`

### ModeButton
- **Назначение:** кнопка режима LCXL на сетке (ключевой компонент); отображает цвет, номер, тип слоя (Instrument/Mixer)
- **Варианты:** Direction: top | bottom; Hover: off | on | on2; Type: Instrument | Mixer | disable inteumnet | Disabled; Show Light / Show Number / Show text / Show tooltip (bool)
- **Node ID:** `320:6`

### AccordionItem
- **Назначение:** строка аккордеона (FAQ), два состояния
- **Варианты:** State: closed | open
- **Node ID:** `329:16`

### Tooltip
- **Назначение:** всплывающая подсказка, позиционируется сверху/снизу
- **Варианты:** Direction: top | bottom; State: visible | hidden; text (bool)
- **Node ID:** `510:8`

### SpecRow
- **Назначение:** строка технических спецификаций (лейбл + значение)
- **Node ID:** `337:6`

### Tip
- **Назначение:** информационная подсказка-плашка
- **Node ID:** `870:10333`

### fader
- **Назначение:** иллюстративный фейдер (визуальный элемент, не интерактивный)
- **Node ID:** `628:3572`

### led
- **Назначение:** LED-индикатор (точка состояния)
- **Node ID:** `628:3593`

---

## Иконки (Icons)

### Icon
- **Назначение:** системная иконка UI, 35 вариантов
- **Варианты:** Name: account | add | arrow-down | arrow-up | calendar | call | check | close | delete | delivery | edit | error | favorite | grid-view | language | list-alt | lock | logout | mail | menu | pdf | remove | schedule | search | shopping-basket | socials-facebook | socials-instagram | socials-linkedin | socials-tiktok | socials-x | socials-youtube | splitscreen | tune | warning | warranty
- **Node ID:** `84:140`

### KitIcon/M4L
- **Назначение:** иконка Max for Live плагина (для Kit-секции)
- **Node ID:** `2128:4998`

### KitIcon/Modes
- **Назначение:** иконка режимов LCXL (для Kit-секции)
- **Node ID:** `2128:5008`

### KitIcon/Guide
- **Назначение:** иконка гайда/документации (для Kit-секции)
- **Node ID:** `2128:5025`

### KitIcon/Starter
- **Назначение:** иконка стартового проекта (для Kit-секции)
- **Node ID:** `2128:5029`

### logo + product
- **Назначение:** логотип Fadercraft + название продукта вместе
- **Node ID:** `1117:5219`

### logo-craft + product
- **Назначение:** вариант логотипа с «craft» акцентом + продукт
- **Node ID:** `1868:7106`

### logo
- **Назначение:** чистый логотип без продукта
- **Node ID:** `2325:16438`

---

## Молекулы (Molecules)

### ModeGrid
- **Назначение:** сетка режимов LCXL; показывает 16 ячеек контроллера в разных раскладках
- **Варианты:** Layout: channels | modeX | Modes | Layout4 | Custom Modes 1-10
- **Node ID:** `322:255`

### PluginMockup
- **Назначение:** мокап плагина XL_Performance в конкретном режиме (11–14, cold)
- **Варианты:** State: 11 | 12 | 13 | 14 | cold
- **Node ID:** `1958:5290`

### ProductCard
- **Назначение:** карточка продукта в каталоге, hover-состояние
- **Варианты:** State: Default | hover
- **Node ID:** `1007:4443`

### VideoCard
- **Назначение:** карточка с превью видео, три ширины
- **Варианты:** Layout: 1440 | 640 | 360
- **Node ID:** `191:139`

### NewsletterSignup
- **Назначение:** форма подписки на рассылку, два лейаута
- **Варианты:** Layout: stacked | inline
- **Node ID:** `105:13`

### FAQAccordion
- **Назначение:** список FAQ, строится из AccordionItem
- **Node ID:** `334:213`

### ProductGallery
- **Назначение:** галерея изображений продукта
- **Node ID:** `41:3`

### PullQuote
- **Назначение:** блок с цитатой (pull quote)
- **Node ID:** `55:21`

### StatBlock
- **Назначение:** блок с ключевой цифрой/статистикой
- **Node ID:** `54:21`

### RequirementsList
- **Назначение:** список системных требований
- **Node ID:** `337:252`

### FeatureBeat
- **Назначение:** двухстрочный блок фичи: жирный заголовок + параграф. Используется в тёмных информационных секциях.
- **Node ID:** `1534:314`

### SliderCard
- **Назначение:** карточка слайдера (для FeatureSlider)
- **Node ID:** `162:55`

### Tile
- **Назначение:** тайл-иконка с текстом (для сетки фич)
- **Node ID:** `953:138`

---

## Организмы (Organisms)

### Header
- **Назначение:** шапка сайта, адаптивная (desktop/tablet/mobile), 4 булевых пропа для скрытия секций
- **Варианты:** Layout: desktop | tablet | mobile; 1 / 2 / 3 / 4 (bool)
- **Node ID:** `102:49`

### HeroProduct
- **Назначение:** hero-секция страницы продукта, 4 варианта компоновки
- **Варианты:** Layout: horizontal | stacked | stacked-mobile | horizontal-compact
- **Node ID:** `103:48`

### OneActionBetweenThem
- **Назначение:** интерактивная hero-секция с переключением режимов LCXL (режимы 11–14, 0, custom 1-10)
- **Варианты:** Property 1: 11 | 12 | 13 | 14 | 0 | custom-modes 1-10; Show Channel / Show fader tip 1 / Show knobTip 3 / Hero txt (bool)
- **Node ID:** `838:7653`

### FeatureSplit
- **Назначение:** секция фичи: изображение + текст, три направления
- **Варианты:** Direction: imageRight | Below | ImageLeft
- **Node ID:** `58:43`

### FeatureSlider
- **Назначение:** секция с слайдером фич, три варианта лейаута
- **Варианты:** Layout: horizontal | stacked | grid
- **Node ID:** `153:94`

### PerformanceFlow
- **Назначение:** секция флоу перформанса (как работает продукт), desktop/mobile
- **Варианты:** Layout: desktop | mobile
- **Node ID:** `1550:2989`

### Footer (light)
- **Назначение:** футер, светлая тема, два варианта компактности
- **Варианты:** Layout: compact | Layout2
- **Node ID:** `106:52`

### Footer (dark)
- **Назначение:** футер, тёмная тема
- **Варианты:** Theme: dark
- **Node ID:** `1016:1632`

### XL_Performance.amxd
- **Назначение:** мокап устройства XL_Performance.amxd в Ableton, desktop/mobile
- **Варианты:** Property 1: Mobile | Desktop
- **Node ID:** `2146:9764`

### VideoSection
- **Назначение:** секция с демо-видео
- **Node ID:** `397:467`

### ICPColumns
- **Назначение:** секция с колонками ICP (для кого продукт)
- **Node ID:** `365:461`

### CatalogSection
- **Назначение:** секция каталога продуктов
- **Node ID:** `244:1159`

### RequirementsSection
- **Назначение:** секция системных требований
- **Node ID:** `355:2899`

### FAQSection
- **Назначение:** секция FAQ, строится из FAQAccordion
- **Node ID:** `355:3014`

### NewsletterSection
- **Назначение:** секция с формой подписки
- **Node ID:** `233:1133`

### WorkflowSection
- **Назначение:** секция «как это работает» / воркфлоу
- **Node ID:** `193:1071`

### TheKitSection
- **Назначение:** секция «что входит в кит» (перечень компонентов продукта)
- **Node ID:** `2051:7013`

### PullQuoteSection
- **Назначение:** секция с pull quote
- **Node ID:** `195:1094`

---

## Замечания после сканирования

- [x] FeatureBeat — единственный компонент с описанием в Figma
- [ ] `WhyChooseNovation` (`51:5`) — устаревшее имя (Novation), переименовать при рефакторинге; по смыслу = WhyFadercraft / WhyChoose
- [ ] `OneActionBetweenThem/Component 1` (`628:3574`) на Molecules — служебный субкомпонент; не инстанцировать напрямую
- [ ] `Frame 8` (`2145:7333`) на Icons — unnamed component, служебный; не использовать
- [ ] `image 4` (`899:7486`) на Organisms — unnamed, служебный; не использовать
- [ ] `Icon (Organisms)` (`2146:7694`) — отдельный компонент-иконка, служебный для Organisms
- [ ] `ModeButton.Type = "disable inteumnet"` — опечатка в Figma (должно быть «disable instrument»)
- [ ] Два компонента `Footer` на Organisms (light `106:52` и dark `1016:1632`) — разные темы; при инстанцировании брать по Node ID
