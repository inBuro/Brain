---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, lcxl, instruments]
---

# Instruments Layer

**Summary**: Секция патча, отвечающая за переключение 10 инструментальных страниц LCXL (custom-modes 1..10) через единую overlay listen CC.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

Секция патча, маркированная:

```
===========  INSTRUMENTS LAYER  (custom modes 1..10 via overlay CC)  ===========
```

Отвечает за переключение 10 инструментальных страниц LCXL (custom-modes 1..10) (source: XL_Performance.README.md).

## Принцип

В отличие от [[Mixer Layer]], инструмент-режимы выбираются **не CC30**, а одной общей **overlay listen CC** (по умолчанию **CC49**, выставляется `loadmess 49`). Это сделано, чтобы внешний контроллер/секвенсор/Push мог переключать инструмент одним сообщением, не зная внутреннего маппинга в CC30 (source: XL_Performance.README.md).

Значения overlay CC интерпретируются так:

| Значение | Смысл |
|---|---|
| 10, 20, 30, …, 100 | режимы 1..10 (значение = `10 · N`) |
| 0, 127 | «возврат» / отпускание (фильтруются как мусор) |
| Любое другое | фильтруется (`non_return`, `ignored_zero`) |

(source: XL_Performance.README.md)

Маппинг номера режима в CC30: см. [[Mode Encoding]].

## Параметры роутера

Все настраиваются через `loadmess` в патче (source: XL_Performance.README.md):

| Параметр | Default | Назначение |
|---|---|---|
| Listen CC | 49 | входная overlay-CC |
| Overlay Route | 11 | базовый custom-mode оверлея |
| Mode Select CC | 30 | CC, которой LCXL принимает смену режима |
| Mode Select Ch | 7 | MIDI-канал для Mode Select |

## Состояние

- `v instruments_active` — оверлей включён/выключен (`live.toggle` на UI).
- `v instruments_mode` — текущий выбранный режим 1..10. Используется также как save-point при cross-mode transit ([[CC47 Cross-Mode Transit]]) — отдельной save-переменной нет.

## Телеметрия

В патче оставлены `print` объекты с префиксами `selected_in`, `non_return`, `ignored_zero`, `enter_route`, `back_hit`, `route_mode` — это рабочая телеметрия (комментарий в патче: `Debug kept intact`). Видна в Max Console (source: XL_Performance.README.md).

## Внутренний тег

Router помечен как **«LCXL Overlay Router v18 (single Listen CC + mode by value)»** — в README v1.5 (source: XL_Performance.README.md).

## Related pages

- [[Mode Encoding]]
- [[Mixer Layer]]
- [[CC47 Cross-Mode Transit]]
- [[XL_Performance README]]
