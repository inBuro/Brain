---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-27
status: stable
tags: [m4l, midi]
---

# MIDI Passthrough

Хвостовая секция патча. Пропускает большинство MIDI verbatim, но режет mode-change CC, чтобы не образовалась петля с LCXL.

## Что пропускается verbatim

- `notein` / `noteout`
- `bendin` / `bendout`
- `touchin` / `touchout` (channel pressure)
- `polyin` / `polyout` (poly aftertouch)
- `pgmin` / `pgmout`

## Что фильтруется

`ctlin → [sel 30 31] → gate → ctlout`. Конструкция режет **CC30 и CC31**:

- **CC30** — это команда смены режима LCXL (см. [[../concepts/Custom Modes Model]]). Если её пропустить наружу, то исходящий mode-change сам же вернётся обратно через MIDI From и образует петлю.
- **CC31** — резерв (подсветка / служебный канал у LCXL); режется по тем же соображениям.

Все остальные CC проходят без изменений — в том числе CC47, CC49, CC28, которыми пользуется патч сам, потому что их обработка делается **до** passthrough.

## Где править

Если нужно резать дополнительные CC — добавить в `[sel 30 31]`.
