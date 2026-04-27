---
type: entity
tags: [instruments, layer, custom-modes, overlay]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# Instruments Layer

Секция патча XL_Performance, управляющая custom modes **1-10** — десять инструментальных страниц.

## Механизм

LCXL шлет не CC30 напрямую, а общую **Listen CC** (по умолчанию CC49). Значения **10, 20, 30, ..., 100** трактуются как режимы **1..10** соответственно. Все остальные значения (включая 0 и 127) фильтруются.

## Параметры по умолчанию (loadmess)

| Параметр | Значение | Смысл |
|----------|----------|-------|
| Listen CC | 49 | Входная CC для смены инструмент-режима |
| Overlay Route | 11 | Базовый custom-mode оверлея |
| Mode Select CC | 30 | CC, которой LCXL принимает смену режима |
| Mode Select Ch | 7 | MIDI-канал для Mode Select |

## Маппинг mode → CC30 value

| Instrument Mode | CC30 value | Custom Mode LCXL |
|-----------------|-----------|------------------|
| 1 | 6 | 1 |
| 2 | 7 | 2 |
| 3 | 8 | 3 |
| 4 | 9 | 4 |
| 5 | 18 | 5 |
| 6 | 19 | 6 |
| 7 | 20 | 7 |
| 8 | 21 | 8 |
| 9 | 22 | 9 |
| 10 | 23 | 10 |

Смещение 5/14 сделано чтобы оставить «дыру» под зарезервированные [[Mixer Layer|mixer-modes 11-14]].

## Состояние

- `v instruments_active` — активность оверлея (`live.toggle` на UI)
- `v instruments_mode` — текущий выбранный режим (1..10)

## Debug-телеметрия

Множество `print` объектов: `selected_in`, `non_return`, `ignored_zero`, `enter_route`, `back_hit`, `route_mode`. Оставлены намеренно — открыть Max Console для просмотра.

## Связанные страницы
- [[Mixer Layer]] — второй слой контроллера
- [[CC47 Cross-Mode Transit]] — быстрый переход mixer ↔ instruments
- [[Custom Modes Model]] — общая модель режимов
