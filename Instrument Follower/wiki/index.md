---
type: index
project: Instrument Follower
created: 2026-05-06
updated: 2026-05-07
---

# Wiki Index

**Summary**: Альтернативный плоский TOC вики проекта **Instrument Follower**. Корневой хаб: [[Instrument Follower]].

**Sources**: `raw/rack-controller-bridge-discussion.md`, `raw/lcxl_mk3_rgb_test.maxpat`.

**Last updated**: 2026-05-07.

---

## Synthesis

_(пока единственный источник — see [[rack-controller-bridge-discussion]]; synthesis-страница появится при ingest второго источника)._

## Sources

- [[rack-controller-bridge-discussion]] — финальная архитектура устройства, drivers, phasing, открытые вопросы.

## Concepts

- [[core-driver-architecture]] — controller-agnostic core + опциональный display driver.
- [[knobbler-style-mapping]] — twist-to-map flow без режима маппинга.
- [[auto-fill]] — quick-start кнопка распределения macros по encoder'ам.
- [[rack-color-knobs]] — цвет RGB-ноба = `rack.color`.
- [[value-feedback]] — LED показывает текущее значение macro, +30–50 мс анти-петля.
- [[sysex-rgb-protocol]] — SysEx-команда покраски encoder'а на LCXL MK3.
- [[macro-variations]] — Live 12 variations через 16 fader-buttons (v3).
- [[phasing-roadmap]] — MVP / v2 / v3 / v4+.

## Entities

- [[instrument-follower-device]] — собственно M4L устройство.
- [[lcxl-mk3]] — Launch Control XL MK3.
- [[lcxl-mk3-rgb-test-patch]] — Max patch для де-риска RGB SysEx.
- [[knobbler]] — референсный iPad/мобильный сёрфейс Steinkamp'а.
