---
type: concept
tags: [custom-modes, architecture, mapping]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# Custom Modes Model

Novation LCXL MK3 поддерживает **14 Custom Modes** в собственной памяти. XL_Performance распределяет их между двумя слоями.

## Распределение

| Диапазон | Слой | Количество |
|----------|------|------------|
| 1..10 | [[Instruments Layer]] | 10 инструментальных страниц |
| 11..14 | [[Mixer Layer]] | 4 страницы микшера |

## Полная таблица CC30 маппинга

Custom Mode выбирается отправкой CC30 на канале 7. Value = 23 + N для modes > 10 (mixer), и специальный маппинг для modes 1-10 (instruments).

| Custom Mode | CC30 value | Слой | Детали |
|-------------|-----------|------|--------|
| 1 | 6 | Instruments | page 1 |
| 2 | 7 | Instruments | page 2 |
| 3 | 8 | Instruments | page 3 |
| 4 | 9 | Instruments | page 4 |
| 5 | 18 | Instruments | page 5 |
| 6 | 19 | Instruments | page 6 |
| 7 | 20 | Instruments | page 7 |
| 8 | 21 | Instruments | page 8 |
| 9 | 22 | Instruments | page 9 |
| 10 | 23 | Instruments | page 10 |
| 11 | 24 | Mixer | DAW, page A |
| 12 | 25 | Mixer | DAW, page B |
| 13 | 26 | Mixer | Prelisten, page A |
| 14 | 27 | Mixer | Prelisten, page B |

## Зачем смещение в instruments

CC30 values для instruments (6-9, 18-23) имеют «дыру» между 9 и 18. Это намеренно — values 10-17 зарезервированы, чтобы не пересекаться с mixer values (24-27) и оставить пространство для будущих расширений.

## Переключение между слоями

- Внутри слоя: CC49 (instruments), CC49/CC47/CC28 (mixer)
- Между слоями: [[CC47 Cross-Mode Transit]] — CC47 с сохранением/восстановлением позиции

## Связанные страницы
- [[Mixer Layer]] — mixer modes 11-14
- [[Instruments Layer]] — instrument modes 1-10
- [[CC47 Cross-Mode Transit]] — переход между слоями
- [[MIDI Passthrough]] — фильтрация CC30 для защиты от петель
