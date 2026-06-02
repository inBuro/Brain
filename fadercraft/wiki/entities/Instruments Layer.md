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

В отличие от [[Mixer Layer]], инструмент-режимы выбираются **не CC30**, а одной общей **overlay listen CC = 47** (подтверждено байтами, см. callout). Это сделано, чтобы внешний контроллер/секвенсор/Push мог переключать инструмент одним сообщением, не зная внутреннего маппинга в CC30 (source: XL_Performance.README.md).

> ✅ **Listen CC = 47 — подтверждено (2026-06-02).** В `.syx`-экспортах модов 1..10 descriptor с CC=`0x2F` (=47) хранит static mode value `10 × N`: в `1.syx` байты `2F 0A` (CC47, value 10), в `2.syx` `2F 14` (CC47, value 20). README v1.5 `loadmess 49` — **устаревший дефолт**, в Fadercraft-конфиге переопределён на 47. CC49 в инструмент-модах тоже присутствует, но как **обычная маппнутая кнопка**, не как listen. См. [[Custom Mode SysEx Layout]].

> **CC47 — один CC, разные слои (не три семантики).** Тот же CC47 в инструмент-слое несёт mode-report `N×10` (плагин читает значение → знает активный инструмент-мод), и на этом же потоке работает [[CC47 Cross-Mode Transit]] (value `10·N` → прыжок в микшер, `127` → возврат). «Instrument-listen» и «cross-transit» — **не два CC, а один CC47, читаемый по значению**. В [[Mixer Layer]] тот же CC47 — это уже маппнутая momentary-кнопка `mixer_bank` (значения 1/2). Конфликта нет: контроллер всегда ровно в одном слое.

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

- [[Novation XL]] — корневой хаб проекта
- [[XL_Performance — как это работает]]
- [[Mode Encoding]]
- [[Mixer Layer]]
- [[CC47 Cross-Mode Transit]]
- [[XL_Performance README]]
