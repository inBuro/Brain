---
type: discussion-log
project: Novation
date: 2026-05-07
status: design-discussion
---

# Rack-Controller Bridge — design discussion

Обсуждение нового Max for Live устройства, отдельного от `XL_Performance.amxd`. Концептуальная эволюция через несколько итераций — записано как single source для последующего ingest'a в wiki.

Test patch для де-риска SysEx RGB feedback на LCXL MK3: `lcxl_mk3_rgb_test.maxpat` (отдельный файл, не M4L).

---

## Финальная архитектура

**Назначение.** Связывает macros Rack'ов на треке Ableton с физическим MIDI-контроллером. Пользователь крутит encoder на железе → меняется macro в Live. Опционально: визуальный feedback (RGB-подсветка, OLED-дисплей) с актуальным цветом и значением.

**Source = всегда Rack.** Source для всех маппингов — macros Rack'ов на треке (или треках) Live. Не произвольные параметры произвольных девайсов. «Главное чтобы это был Rack.»

**Controller-agnostic.** Должно работать с любым MIDI-контроллером: LCXL MK3, MIDI Fighter Twister, BCR2000, Akai MIDIMix, и т.д. Архитектурно делится на два слоя:

1. **Core** (controller-agnostic). Принимает CC от любого MIDI input port'a, держит таблицу маппингов «slot N → macro M of Rack R», шлёт `LiveAPI.set("value", v)` на параметры. Save mappings with set.
2. **Display driver** (controller-specific, опциональный). Для LCXL MK3 — RGB через SysEx. Для контроллеров без RGB — value через CC обратно. Для контроллеров без feedback — ничего. Driver выбирается в device parameters.

**Mapping flow — Knobbler-style.** Пользователь кликает на macro Rack'a в Live, потом крутит любой encoder на физическом контроллере, и unmapped encoder привязывается к этому macro. Никакого режима маппинга вход/выход — состояние всегда живое. Маппинги сохраняются с Live set.

**Auto-fill — опциональный quick start.** Кнопка в device UI, которая распределяет macros всех Rack'ов трека по unmapped encoder'ам в порядке. Каждый Rack занимает столько подряд идущих encoder'ов, сколько у него macros. Можно пользоваться, можно ремапить вручную поверх.

**Цвет ноба — `rack.color`.** При маппинге берём цвет Rack'а, в котором живёт macro (через `parameter.canonical_parent.color` или эквивалент). Если параметр вне Rack'а — цвет трека. Палитра становится свойством сета, юзер сам красит Rack'и через стандартный workflow Ableton (правый клик → Edit Info Text / Color), мы просто читаем.

**Value feedback на LED.** Encoder LED отображает текущее значение macro, нормализованное в 0–127 для соответствующего MIDI-протокола. Observer на параметре держит LED в синхроне с автоматизацией, мышью, другим контроллером. Защита от feedback-петли — окно ~30–50 мс после ctlin от того же encoder'а блокирует отправку обратно.

---

## LCXL MK3 driver — детали

**RGB через SysEx.** Команда покраски одного encoder:

```
F0 00 20 29 02 15 01 53 <idx> <R> <G> <B> F7
```

Manufacturer Novation `00 20 29`, product LCXL3 `02 15`, command «set LED colour» `01 53`. R/G/B по 0–127. Index encoder'а — точные значения проверяются через test patch.

**DAW mode.** Если SysEx feedback не работает в Custom Mode, переключение в DAW mode через Note On `9F 0B 7F`. Это enable feature controls; для full DAW mode — отдельная команда (есть в Programmer's Reference).

**OLED display — отложено.** У LCXL MK3 есть встроенный OLED, в DAW mode на нём показывается имя параметра и значение. Реализуется отдельной итерацией: вынести «SysEx-говорилку» в отдельный модуль, чтобы RGB и display content шли через единый bus, но display content добавляется позже.

**Knob states — пропущены.** Knobbler показывает индикаторы automation recorded / overridden / controlled-by-other-device. Решено не делать — value feedback через интенсивность LED как достаточный сигнал. Можно вернуться позже, если в перформансе будет нехватать.

**Variations — v3.** Live 12 поддерживает Macro Variations в Rack'ах (store / recall / randomize macro states). У LCXL MK3 16 fader buttons под фейдерами — естественное место под numbered variations + store + randomize. Пока не реализуем, но архитектурно держим в голове, чтобы не занять кнопки чем-то другим.

---

## Phasing

- **MVP.** Core + LCXL MK3 driver (RGB feedback, value feedback). Mapping flow — Knobbler-style. Auto-fill из Rack macros. `rack.color` как цвет ноба.
- **v2.** OLED display content (имя параметра + значение).
- **v3.** Variations support через 16 fader buttons.
- **v4+.** Drivers для других контроллеров (MIDI Fighter Twister, BCR2000, MIDIMix).

---

## Решённые архитектурные развилки (для протокола)

| Вопрос | Решение |
|---|---|
| Где живёт устройство — на отдельном треке, наблюдает selected_track, или живёт в группе с инструмент-треками? | Ни то, ни другое. Знает только текущий трек где сидит само (через `this_device → canonical_parent`), управляет Rack'ами на этом же треке. |
| Что считать «слотом» — первые N девайсов / первые N инструментов / Rack'и? | Только Rack'и (любого типа: Instrument / Audio FX / Drum / MIDI). Длина слота = число macros в Rack'е. |
| Как пользователь задаёт связь «трек → mode номер»? | Никак, связь не нужна. Один зарезервированный custom mode на LCXL для всего устройства; различение per-Rack идёт через цвет ноба. |
| Mapping ручной или автоматический? | Основной — Knobbler-style ручной (select macro + twist encoder). Auto-fill из Rack macros — опциональная кнопка для quick start. |
| Цвет ноба — палитра 4–5 цветов циклически или ещё что-то? | `rack.color` напрямую. Юзер сам красит Rack'и через Ableton UI. |
| Гибкие раскладки 8+8+8 / 16+8 / 4+20? | Естественно следуют из Knobbler-style маппинга — юзер мапит сколько хочет на сколько хочет. |
| Что если на треке нет Rack'ов? | Auto-fill ничего не делает. Пользователь может сам мапить любые параметры (если разрешим) или encoder'ы остаются неактивными. |
| Несколько таких устройств на одном треке? | Documented as unsupported, программно не ловим. |

---

## Открытые вопросы

1. **Точные encoder indices для LCXL MK3.** Должны быть в Programmer's Reference — проверить через test patch методом проб.
2. **Работает ли color SysEx в Custom Mode** или требуется DAW mode. Test patch это проверяет.
3. **Mapping non-Rack параметров** — разрешить как escape hatch или строго требовать Rack? Склоняемся к строгому Rack-only ради простоты UX, но edge cases возможны.
4. **OLED protocol.** Текстовый display content в DAW mode — отдельный SysEx, точный формат смотреть в reference перед реализацией v2.
5. **Save format mappings.** JSON в pattr с ключами вида `{slot: int, rack_path: str, macro_idx: int}` — переживёт reorder Rack'ов на треке (через path), но не reorder самого трека. Привязка к id Rack'а живёт только в одной сессии. Решить когда дойдём до реализации.

---

## Knobbler как референс

Knobbler (Zack Steinkamp, plugins.steinkamp.us) — iPad/iPhone/Android multitouch surface для Ableton через OSC. Не работает с физическими MIDI-контроллерами, но три паттерна оттуда применимы напрямую:

- **Auto-coloring** — слайдеры подхватывают цвет трека из Live в реальном времени. У нас аналогично, но из `rack.color`.
- **Tap-to-map (у нас twist-to-map)** — выбираешь параметр в Live, активируешь свободный slot на контроллере, mapping готов без режима. Минимизирует ручную работу.
- **Bluhand page** — следует за selected device, показывает все его параметры с банками. У нас Bluhand-режима нет, но идея «пользователь выделил Rack — устройство автоматически знает что мапить» лежит в основе Auto-fill.

Что НЕ берём: ручной tap-to-map workflow (у нас twist-to-map естественнее для encoder'ов), OSC-транспорт (у нас MIDI/SysEx), iPad UI.

---

## Тест-план для де-риска

Test patch `lcxl_mk3_rgb_test.maxpat` отвязан от Live полностью — открывается прямо в Max'е, шлёт SysEx через `[midiout "Launch Control XL 3"]`. Цель — убедиться, что:

1. Color SysEx доходит до железа.
2. Encoder реально меняет цвет.
3. Знаем правильный диапазон encoder indices.

Алгоритм проб:

1. idx=0, R=127, G=0, B=0, Send → проверить top-row encoder 1.
2. Если не реагирует — проверить idx=13..20 (top row в DAW mode).
3. Если ничего — нажать Enable DAW mode, повторить.
4. Если ничего — проверить имя порта через `[midiinfo]`, поправить в midiout.

После прохождения теста архитектура разморожена, можно писать само устройство.
