---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Phasing roadmap

**Summary**: Roadmap [[instrument-follower-device]] разбит на четыре фазы: MVP (Core + LCXL MK3 driver), v2 (OLED display), v3 ([[macro-variations]]), v4+ (драйверы для других контроллеров).

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## MVP

- [[core-driver-architecture|Core]] (controller-agnostic).
- [[lcxl-mk3]] driver: RGB feedback через [[sysex-rgb-protocol]] + [[value-feedback]].
- Mapping flow — [[knobbler-style-mapping]].
- [[auto-fill]] из Rack macros.
- [[rack-color-knobs|rack.color]] как цвет ноба.

Условие выхода MVP — [[lcxl-mk3-rgb-test-patch]] подтверждает, что RGB SysEx доходит и красит encoder (source: rack-controller-bridge-discussion.md).

## v2

- OLED display content на [[lcxl-mk3]]: имя параметра + значение.
- Архитектурно — единый «SysEx-говорилка» bus, через который идут и RGB, и display content.

## v3

- [[macro-variations|Variations support]] через 16 fader-buttons LCXL MK3.
- Точное распределение store / recall / randomize — будет уточнено.

## v4+

- Драйверы под другие контроллеры:
  - MIDI Fighter Twister
  - BCR2000
  - Akai MIDIMix
- Новые драйверы вписываются в [[core-driver-architecture|существующий core]] без переписывания.

## Что нарочно НЕ в roadmap

- Knob states (automation recorded / overridden / controlled-by-other-device) — пока не считаем нужным, см. [[value-feedback]].
- Маппинг не-Rack параметров — open question.
- Несколько `Instrument Follower` на одном треке — documented unsupported.

## Related pages

- [[instrument-follower-device]]
- [[core-driver-architecture]]
- [[lcxl-mk3]]
- [[sysex-rgb-protocol]]
- [[value-feedback]]
- [[macro-variations]]
- [[lcxl-mk3-rgb-test-patch]]
- [[rack-controller-bridge-discussion]]
