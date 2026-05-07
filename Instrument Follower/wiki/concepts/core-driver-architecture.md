---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Core + Display Driver architecture

**Summary**: Двухслойная архитектура [[instrument-follower-device]]: controller-agnostic **Core** держит маппинги и пишет в LiveAPI, опциональный **Display Driver** под конкретный контроллер отвечает за visual feedback (RGB, OLED, value LED).

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Core (controller-agnostic)

- Принимает CC от любого MIDI input port'а (source: rack-controller-bridge-discussion.md).
- Держит таблицу маппингов вида `slot N → macro M of Rack R`.
- Шлёт `LiveAPI.set("value", v)` на параметры Rack'ов.
- Сохраняет маппинги вместе с Live set.

## Display Driver (controller-specific, опциональный)

- Для [[lcxl-mk3]] — RGB через [[sysex-rgb-protocol|SysEx]].
- Для контроллеров без RGB — value через CC обратно.
- Для контроллеров без feedback — ничего.
- Driver выбирается в device parameters.

## Зачем такой раздел

- Поддержка любых MIDI-контроллеров без переписывания core (LCXL MK3, MIDI Fighter Twister, BCR2000, Akai MIDIMix).
- Driver за пределами MVP откладывается на v4+ (см. [[phasing-roadmap]]).

## Связанные решения

- Source — всегда [[rack-color-knobs|Rack]], не произвольный параметр.
- [[knobbler-style-mapping|Mapping flow]] не зависит от драйвера, живёт в core.

## Related pages

- [[instrument-follower-device]]
- [[lcxl-mk3]]
- [[sysex-rgb-protocol]]
- [[knobbler-style-mapping]]
- [[phasing-roadmap]]
- [[rack-controller-bridge-discussion]]
