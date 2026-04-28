---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, midi]
---

# MIDI Passthrough

**Summary**: Хвостовая секция патча — пропускает большинство MIDI verbatim, но режет CC30/CC31, чтобы не образовалась петля смены custom-mode с LCXL.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

Хвостовая секция патча. Пропускает большинство MIDI verbatim, но режет mode-change CC, чтобы не образовалась петля с LCXL (source: XL_Performance.README.md).

## Что пропускается verbatim

- `notein` / `noteout`
- `bendin` / `bendout`
- `touchin` / `touchout` (channel pressure)
- `polyin` / `polyout` (poly aftertouch)
- `pgmin` / `pgmout`

(source: XL_Performance.README.md)

## Что фильтруется

`ctlin → [sel 30 31] → gate → ctlout`. Конструкция режет **CC30 и CC31** (source: XL_Performance.README.md):

- **CC30** — это команда смены режима LCXL (см. [[Custom Modes Model]]). Если её пропустить наружу, то исходящий mode-change сам же вернётся обратно через MIDI From и образует петлю.
- **CC31** — резерв (подсветка / служебный канал у LCXL); режется по тем же соображениям.

Все остальные CC проходят без изменений — в том числе CC47, CC49, CC28, которыми пользуется патч сам, потому что их обработка делается **до** passthrough.

## Где править

Если нужно резать дополнительные CC — добавить в `[sel 30 31]`.

## Related pages

- [[Custom Modes Model]]
- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
