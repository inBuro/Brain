---
type: source
project: Instrument Follower
source-file: rack-controller-bridge-discussion.md
created: 2026-05-07
updated: 2026-05-07
---

# Rack-Controller Bridge — design discussion

**Summary**: Лог проектной дискуссии (2026-05-07), на которой зафиксирована финальная архитектура Max for Live устройства [[instrument-follower-device]] — controller-agnostic моста между macros Rack'ов в Ableton и физическими MIDI-контроллерами с RGB feedback.

**Sources**: `raw/rack-controller-bridge-discussion.md`, `raw/lcxl_mk3_rgb_test.maxpat`.

**Last updated**: 2026-05-07.

---

Документ — single source, в котором собраны: финальная архитектура устройства, специфика драйвера для [[lcxl-mk3]], phasing (MVP → v4), решённые архитектурные развилки и открытые вопросы. Сопровождается test-патчем [[lcxl-mk3-rgb-test-patch]] для де-риска SysEx RGB feedback.

## Ключевые тезисы

- Устройство отдельное от `XL_Performance.amxd`; источник всех маппингов — macros Rack'ов на текущем треке (source: rack-controller-bridge-discussion.md).
- Архитектура двухслойная: controller-agnostic [[core-driver-architecture|core]] + опциональный [[core-driver-architecture|display driver]] под конкретный контроллер.
- Mapping flow — [[knobbler-style-mapping|Knobbler-style]] (выделил macro в Live → крутанул encoder → готово), плюс кнопка [[auto-fill]] для quick start.
- Цвет ноба — [[rack-color-knobs|rack.color]]; юзер красит Rack'и стандартным workflow Ableton.
- LED отображает [[value-feedback|текущее значение macro]] с защитой от feedback-петли (~30–50 мс).
- Драйвер LCXL MK3 шлёт RGB через [[sysex-rgb-protocol|SysEx]]; OLED — отложен на v2.
- 16 fader-buttons зарезервированы под [[macro-variations|Macro Variations]] из Live 12 (v3).
- См. [[phasing-roadmap|phasing]] и список открытых вопросов в конце документа.

## Что зафиксировано как «не делаем»

- Knob states (automation recorded / overridden / controlled-by-other-device) — value feedback через интенсивность LED считается достаточным сигналом (source: rack-controller-bridge-discussion.md).
- Несколько таких устройств на одном треке — documented as unsupported, программно не ловим.
- Маппинг произвольных параметров вне Rack'ов — склоняемся к строгому Rack-only (открытый вопрос).

## Related pages

- [[instrument-follower-device]]
- [[lcxl-mk3]]
- [[lcxl-mk3-rgb-test-patch]]
- [[knobbler]]
- [[core-driver-architecture]]
- [[knobbler-style-mapping]]
- [[auto-fill]]
- [[rack-color-knobs]]
- [[value-feedback]]
- [[sysex-rgb-protocol]]
- [[macro-variations]]
- [[phasing-roadmap]]
