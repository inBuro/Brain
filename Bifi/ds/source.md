# DS Source

**Источник:** Community-библиотека (Beefy Finance Design System v2.4)
**Figma-файл:** https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System
**Примечание:** скан выполнен 2026-06-19 через копию `maagSNZFPmmWBdtdR17pBS`; копия удалена, дальнейшая работа с оригиналом
**Дата сканирования:** 2026-06-19
**Локаль продукта:** en

## Структура файла

Два pages, оба в копии:
- `Accordion` (`5015:6337`) — 2 component set'а
- `Icons` (`3810:5039`) — 110 компонентов (иконки всех видов + form controls)

Variables: 2 коллекции в том же файле:
- `Primitives` (mode: Dark) — сырые hex-значения
- `Semantic` (mode: Mode 1) — смысловые алиасы на Primitives

## Замечания

- Компоненты не сгруппированы по страницам типа «Components» — весь UI-кит в двух страницах
- Все описания компонентов в Figma пустые (`description: ""`) — назначение выведено по именам
- Дублированных имён: два `fold-arrow` (`5609:2059` и `5609:2077`) — разные направления
- Variables полностью покрывают цвета; типографика и отступы через CSS Variables, не Figma Variables
