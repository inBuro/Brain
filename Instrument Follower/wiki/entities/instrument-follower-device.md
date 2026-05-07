---
type: entity
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Instrument Follower (M4L device)

**Summary**: Max for Live устройство, связывающее macros Rack'ов на треке Ableton с физическим MIDI-контроллером — пользователь крутит encoder, меняется macro в Live; опционально RGB-подсветка отражает [[rack-color-knobs|цвет Rack'а]] и [[value-feedback|текущее значение]].

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Что это

Отдельное от `XL_Performance.amxd` M4L устройство (source: rack-controller-bridge-discussion.md). Кладётся на трек, видит сам себя через `this_device → canonical_parent`, управляет [[core-driver-architecture|только Rack'ами на том же треке]]. Не наблюдает `selected_track`, не живёт в групповых треках, не знает о других треках.

## Как пользуется

1. Кладёшь устройство на трек, где есть Rack'и.
2. Подключаешь поддерживаемый MIDI-контроллер (для MVP — [[lcxl-mk3]]).
3. Нажимаешь [[auto-fill]] для быстрой раскладки или мапишь вручную через [[knobbler-style-mapping]].
4. Крутишь encoder → macro в Live меняется. LED показывает [[value-feedback|текущее значение]] и [[rack-color-knobs|цвет Rack'а]].
5. Маппинги сохраняются вместе с Live set.

## Что считается слотом

Только Rack'и любого типа (Instrument / Audio FX / Drum / MIDI). Длина слота равна числу macros в Rack'е (source: rack-controller-bridge-discussion.md). Произвольные параметры произвольных девайсов — пока не поддерживаются (open question).

## Архитектурные ограничения

- Один Rack — один или несколько подряд идущих encoder'ов на железе; разрывы возможны при ручном маппинге.
- Несколько `Instrument Follower` на одном треке — documented as unsupported, программно не ловим.
- Если на треке нет Rack'ов — auto-fill ничего не делает.

## Phasing

См. [[phasing-roadmap]]. MVP закрывает Core + LCXL MK3 driver; v2 добавляет OLED; v3 — [[macro-variations]]; v4+ — драйверы для других контроллеров.

## Test patch

[[lcxl-mk3-rgb-test-patch]] — отвязанный от Live `.maxpat`, который проверяет, что [[sysex-rgb-protocol|RGB SysEx]] доходит до LCXL MK3 и реально красит encoder.

## Related pages

- [[rack-controller-bridge-discussion]]
- [[lcxl-mk3]]
- [[core-driver-architecture]]
- [[knobbler-style-mapping]]
- [[auto-fill]]
- [[rack-color-knobs]]
- [[value-feedback]]
- [[phasing-roadmap]]
