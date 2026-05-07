---
type: entity
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# LCXL MK3 RGB test patch

**Summary**: `raw/lcxl_mk3_rgb_test.maxpat` — изолированный Max-патч (не M4L), который шлёт RGB [[sysex-rgb-protocol|SysEx]] на [[lcxl-mk3|Launch Control XL MK3]] и используется для де-риска: убедиться, что протокол доходит до железа и encoder реально меняет цвет до начала разработки самого [[instrument-follower-device|устройства]].

**Sources**: `raw/lcxl_mk3_rgb_test.maxpat`, `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Что в патче

- Полностью отвязан от Live — открывается прямо в Max'е (source: rack-controller-bridge-discussion.md).
- UI: number-боксы для encoder index, R, G, B (0–127).
- Кнопка Send → формирует SysEx и отправляет через `[midiout "Launch Control XL 3"]`.
- Кнопка Enable DAW mode (Note On `9F 0B 7F`) — на случай, если color SysEx не работает в Custom Mode.

## Цели проверки

1. Color SysEx доходит до железа.
2. Encoder реально меняет цвет.
3. Знаем правильный диапазон encoder indices.

## Алгоритм проб

1. `idx=0, R=127, G=0, B=0, Send` → проверить top-row encoder 1.
2. Если не реагирует — пробовать `idx=13..20` (top row в DAW mode).
3. Если ничего — нажать Enable DAW mode, повторить.
4. Если ничего — проверить имя порта через `[midiinfo]` и поправить в `midiout`.

После прохождения теста архитектура [[instrument-follower-device|устройства]] разморожена.

## Related pages

- [[instrument-follower-device]]
- [[lcxl-mk3]]
- [[sysex-rgb-protocol]]
- [[rack-controller-bridge-discussion]]
