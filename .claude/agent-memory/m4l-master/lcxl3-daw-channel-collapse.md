---
name: lcxl3-daw-channel-collapse
description: LCXL3 firmware collapses MIDI channel to 1 for all Custom Mode CCs when DAW is connected — confirmed exhaustively 2026-07-27. Channel filtering is unreliable; use CC number for mode discrimination instead.
metadata:
  type: reference
---

# LCXL3: Custom Mode CC Channel Collapse When DAW Connected

## Факт (ПОДТВЕРЖДЕНО исчерпывающе, 2026-07-27)

Launch Control XL MK3 схлопывает MIDI-канал для Custom Mode CC в значение `1` при обнаружении, что его слушает DAW. Это происходит на уровне ниже Ableton — вероятно firmware/USB-driver реагирует на сам факт DAW-подключения к DAW-порту, независимо от настроек в Ableton Preferences.

## Доказательная база

- **CoreMIDI-сниф** напрямую с порта "LCXL3 1 MIDI Out" (в обход Ableton): показывает НАСТОЯЩИЕ разные каналы для разных Custom Mode (CM11→ch11, CM12→ch12, другие моды → однозначные каналы 2,3,5,6,7,8,9).
- **Тот же сигнал через Ableton**: ВСЕГДА channel=1 — воспроизведено многократно.
- **Не зависит от**: настройки "MIDI From" (All Channels vs конкретный), выбора порта (LCXL3 1 MIDI Out vs All Ins), галочки Remote (на обоих портах), Control Surface assignment (None vs assigned), галочки MPE (включение MPE вообще ломает CC-маппинг — MPE для нотного per-channel expression, не generic CC).
- Воспроизведено после ПОЛНОГО рестарта Ableton + физического переподключения USB.

## Практические следствия

**Канал НЕНАДЁЖЕН как идентификатор активного Custom Mode в DAW-контексте.**

Единственные надёжные различители:
1. **CC-номер** — хранится в `.syx`, полностью под контролем разработчика. Два Custom Mode с разными CC-номерами на одном физическом контроле → надёжно различимы даже при channel=1 у обоих.
2. **Explicit mode announce** — контрол внутри Custom Mode, посылающий уникальное значение при активации (как CC30/ch7 в XL_Performance).

## Для DF Slot

`routeCC()` фильтрует по learnedChannel. Поскольку channel всегда=1 при работе с DAW:
- Фильтр `learnedChannel == 1` всегда проходит → не вредит
- Различение Custom Mode 11 vs 12 обеспечивается пользователем через РАЗНЫЕ CC-номера в Novation Components
- Никаких правок в коде DF не требуется

## Связанные файлы памяти

- [[lcxl3-daw-protocol]] — DAW-mode протокол, CC30/CC31, relative-энкодеры
- [[encoder-relative-research]] — гипотеза firmware relative-toggle (НЕ подтверждена)
