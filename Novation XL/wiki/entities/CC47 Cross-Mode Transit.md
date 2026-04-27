---
type: entity
tags: [cross-mode, transit, cc47, momentary]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# CC47 Cross-Mode Transit

Механизм быстрого переключения между [[Instruments Layer]] и [[Mixer Layer]] одной кнопкой.

## Логика

Работает поверх обоих слоев. CC47 имеет двойное назначение:
- В Mixer Layer — momentary переключение bank
- В Cross-Mode Transit — переход между слоями

### Instrument → Mixer (CC47 = 10, 20, ..., 100)

1. Запоминает текущий instruments-mode (1..10) в `v instruments_mode`
2. Переключает LCXL на последний используемый Mixer-mode
3. Шлет CC30 ch7, value 24..27 → custom modes 11..14

### Mixer → Instrument (CC47 = 127)

1. Восстанавливает сохраненный instruments-mode
2. Шлет LCXL обратно на инструмент-страницу (CC30 ch7, value 6..23)

## Назначение

Быстрая «отбивка» в микшер с любого инструмента и возврат туда же. Одна кнопка — переключение контекста без потери позиции.

## Связанные страницы
- [[Mixer Layer]] — целевой слой при transit
- [[Instruments Layer]] — исходный слой при transit
- [[Custom Modes Model]] — маппинг mode → CC30 value
