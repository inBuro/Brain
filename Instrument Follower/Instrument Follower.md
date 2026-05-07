---
type: hub
project: Instrument Follower
created: 2026-05-06
updated: 2026-05-07
---

# Instrument Follower

Wiki проекта **Instrument Follower** — Max for Live устройство, связывающее macros Rack'ов на треке Ableton с физическим MIDI-контроллером (RGB feedback, value LED, controller-agnostic core). Корневой хаб: TOC по источникам, сущностям и концептам. Структура и правила ведения — см. [[Claude]].

См. [[wiki/index|плоский TOC]] для альтернативного индекса.

---

## Sources

| Страница | Описание |
|---|---|
| [[rack-controller-bridge-discussion]] | Финальная архитектура устройства (2026-05-07): core + display driver, mapping flow, LCXL MK3 driver, phasing, открытые вопросы. |

## Entities

| Страница | Что это |
|---|---|
| [[instrument-follower-device]] | Сам M4L device — что делает, как используется, ограничения. |
| [[lcxl-mk3]] | Launch Control XL MK3, первый поддерживаемый контроллер. |
| [[lcxl-mk3-rgb-test-patch]] | Изолированный Max-патч для де-риска SysEx RGB feedback. |
| [[knobbler]] | iPad-сёрфейс от Zack Steinkamp — референс UX-паттернов. |

## Concepts

| Страница | Что это |
|---|---|
| [[core-driver-architecture]] | Controller-agnostic core + опциональный display driver. |
| [[knobbler-style-mapping]] | Twist-to-map flow без отдельного режима маппинга. |
| [[auto-fill]] | Quick-start кнопка раскладки macros по encoder'ам. |
| [[rack-color-knobs]] | Цвет RGB-ноба = `rack.color`. |
| [[value-feedback]] | LED показывает текущее значение macro + анти-петля 30–50 мс. |
| [[sysex-rgb-protocol]] | SysEx-команда покраски encoder'а на LCXL MK3. |
| [[macro-variations]] | Live 12 variations через 16 fader-buttons (v3). |
| [[phasing-roadmap]] | MVP / v2 / v3 / v4+ — что и когда. |

## Meta

- [[log|Project log]] — хронология ingests на уровне проекта.
- [[wiki/log|Wiki log]] — журнал операций над wiki.
- [[wiki/index|Wiki TOC]] — альтернативный плоский список всех страниц.
