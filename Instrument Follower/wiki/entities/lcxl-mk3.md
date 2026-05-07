---
type: entity
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Launch Control XL MK3

**Summary**: MIDI-контроллер Novation, выбран как первый поддерживаемый железный target для [[instrument-follower-device]] — 16 RGB encoder'ов с feedback через [[sysex-rgb-protocol|SysEx]], 16 fader-buttons под фейдерами и встроенный OLED.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Зачем именно MK3

- 16 RGB encoder'ов — позволяют отражать [[rack-color-knobs|цвет Rack'а]] и [[value-feedback|значение macro]] прямо на железе (source: rack-controller-bridge-discussion.md).
- 16 fader-buttons под фейдерами — естественное место под numbered [[macro-variations]] (store / recall / randomize).
- OLED — даёт возможность v2 показывать имя параметра + значение.

## Manufacturer / product IDs

- Manufacturer Novation: `00 20 29`.
- Product LCXL3: `02 15`.
- Set LED colour: `01 53` (см. [[sysex-rgb-protocol]]).

## DAW mode

Если SysEx feedback не работает в Custom Mode, нужно переключение в DAW mode через Note On `9F 0B 7F` (source: rack-controller-bridge-discussion.md). Это enable feature controls; полный DAW mode — отдельная команда из Programmer's Reference. В DAW mode на OLED показывается имя параметра и значение (используется для v2).

## Открытые вопросы

- Точные encoder indices — не зафиксированы, проверяются методом проб через [[lcxl-mk3-rgb-test-patch]] (start at idx=0, fallback idx=13..20).
- Работает ли color SysEx в Custom Mode или строго требует DAW mode — также проверяет test patch.

## Related pages

- [[instrument-follower-device]]
- [[lcxl-mk3-rgb-test-patch]]
- [[sysex-rgb-protocol]]
- [[macro-variations]]
- [[rack-controller-bridge-discussion]]
