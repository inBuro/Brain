# Novation — XL_Performance

Wiki проекта **Max for Live MIDI-устройства `XL_Performance.amxd`** для Novation Launch Control XL MK3. Превращает контроллер в перформанс-инструмент с переключаемыми слоями, кросс-режимными переходами и Solo Follower'ом.

См. главную сборку: [[XL_Performance — как это работает]].

---

## Sources

| Страница | Описание |
|---|---|
| [[wiki/sources/XL_Performance README]] | Авторская техническая README устройства (v1.5) |

Файл патча: [[raw/XL_Performance.amxd]]. Оригинал README: [[raw/XL_Performance.README]].

## Entities

| Страница | Что это |
|---|---|
| [[wiki/entities/Mixer Layer]] | Слой микшера, custom-modes 11–14 |
| [[wiki/entities/Instruments Layer]] | Слой инструментов, custom-modes 1–10 через overlay CC |
| [[wiki/entities/CC47 Cross-Mode Transit]] | Кросс-переход «инструмент ↔ микшер» по CC47 |
| [[wiki/entities/Solo Follower]] | JS внутри патча: автосоло своего трека + фокус |
| [[wiki/entities/MIDI Passthrough]] | Сквозной MIDI с фильтрацией CC30/CC31 |

## Concepts

| Страница | Что это |
|---|---|
| [[wiki/concepts/Custom Modes Model]] | Как Launch Control XL MK3 выбирает custom-mode по CC30 |
| [[wiki/concepts/Mode Encoding]] | Маппинг номера режима 1..14 → значения CC30 |

## Meta

- [[log]] — хронология ingests/правок.
