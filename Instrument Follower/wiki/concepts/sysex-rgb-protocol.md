---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# SysEx RGB protocol (LCXL MK3)

**Summary**: Команда покраски одного encoder'а на [[lcxl-mk3|Launch Control XL MK3]] — fixed-length SysEx-сообщение с manufacturer / product / command байтами, индексом encoder'а и тремя байтами R/G/B по 0–127.

**Sources**: `raw/rack-controller-bridge-discussion.md`, `raw/lcxl_mk3_rgb_test.maxpat`.

**Last updated**: 2026-05-07.

---

## Сообщение

```
F0 00 20 29 02 15 01 53 <idx> <R> <G> <B> F7
```

| Байт(ы) | Значение |
|---|---|
| `F0` | Start SysEx |
| `00 20 29` | Manufacturer Novation |
| `02 15` | Product LCXL3 |
| `01 53` | Command «set LED colour» |
| `<idx>` | Encoder index (точные значения проверяются через [[lcxl-mk3-rgb-test-patch]]) |
| `<R> <G> <B>` | Цвет, каждая компонента 0–127 |
| `F7` | End SysEx |

Источник — таблица в `raw/rack-controller-bridge-discussion.md` (source: rack-controller-bridge-discussion.md).

## DAW mode

Если color SysEx не работает в Custom Mode, LCXL MK3 переключается в DAW mode командой Note On `9F 0B 7F` (source: rack-controller-bridge-discussion.md). Это enable feature controls; полный DAW mode — отдельная команда из Programmer's Reference. См. [[lcxl-mk3]].

## Открытые вопросы

- Точные encoder indices — методом проб через [[lcxl-mk3-rgb-test-patch]].
- Работает ли color SysEx в Custom Mode или строго требует DAW mode — также проверяется test-патчем.

## OLED — отдельной итерацией

Текстовый display content в DAW mode шлётся отдельным SysEx; точный формат смотреть в Programmer's Reference перед реализацией v2 [[phasing-roadmap]]. Архитектурно «SysEx-говорилка» вынесется в отдельный модуль, чтобы RGB и display content шли через единый bus.

## Related pages

- [[lcxl-mk3]]
- [[lcxl-mk3-rgb-test-patch]]
- [[rack-color-knobs]]
- [[value-feedback]]
- [[core-driver-architecture]]
- [[phasing-roadmap]]
- [[rack-controller-bridge-discussion]]
