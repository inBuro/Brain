# Novation XL

Wiki проекта **Max for Live MIDI-устройства `XL_Performance.amxd`** для Novation Launch Control XL MK3. Превращает контроллер в перформанс-инструмент с переключаемыми слоями, кросс-режимными переходами и неотъемлемым [[Solo Follower]]'ом.

См. главную сборку: [[XL_Performance — как это работает]].

---

## Sources

| Страница | Описание |
|---|---|
| [[XL_Performance README]] | Авторская техническая README устройства (v1.5) |

Файл патча: [[raw/XL_Performance.amxd]]. Оригинал README: [[raw/XL_Performance.README]]. JS-скрипт фолловера: [[solo_follower.js]].

## Entities

| Страница | Что это |
|---|---|
| [[Mixer Layer]] | Слой микшера, custom-modes 11–14 |
| [[Instruments Layer]] | Слой инструментов, custom-modes 1–10 через overlay CC |
| [[CC47 Cross-Mode Transit]] | Кросс-переход «инструмент ↔ микшер» по CC47 |
| [[Solo Follower]] | JS внутри патча: автосоло своего трека + фокус |
| [[MIDI Passthrough]] | Сквозной MIDI с фильтрацией CC30/CC31 |

## Concepts

| Страница | Что это |
|---|---|
| [[Custom Modes Model]] | Как Launch Control XL MK3 выбирает custom-mode по CC30 (14 слотов) |
| [[Mode Encoding]] | Маппинг номера режима 1..14 → значения CC30 |

## Operations / Launch

| Страница | Что это |
|---|---|
| [[Paddle Merchant Verification]] | **⚠️ Активный launch-блокер.** Paddle KYC frozen после отказа Stripe. Ждёт документ из визита в DLT 2026-05-06. |

## Meta

- [[Novation/log|Project log]] — хронология ingests на уровне проекта.
- [[wiki/log|Wiki log]] — журнал операций над wiki.
- [[wiki/index|Wiki TOC]] — альтернативный плоский список всех страниц.
