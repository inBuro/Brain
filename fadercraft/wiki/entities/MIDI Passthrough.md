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

`ctlin → [sel 30 31] → gate → ctlout`. Конструкция режет **CC30 и CC31** — это **два разных сообщения ch7** (уточнено монитором 2026-06-02):

- **CC30 ch7 = SELECT (команда).** Плагин сам шлёт CC30 ch7 со значением целевого мода (инструменты 6..15, микшер 24..27 — см. [[Mode Encoding]]), чтобы переключить LCXL. Режется на passthrough, **чтобы исходящий select не вернулся обратно через MIDI From и не образовал петлю**. Функционально плагину нужен только этот CC30.
- **CC31 ch7 = REPORT (нативный репорт девайса).** При смене мода LCXL сам отдаёт CC31 ch7 на DAW-порт. Generic-дока Novation называет CC30, но **реальный девайс шлёт CC31** — доверяем девайсу (зафиксировано в памяти `reference_lcxl3_remote_script`: «trust the device's actual CC31 values»). Плагин этот репорт **прочитать не может**: DAW-порт принадлежит Ableton Control Surface, а M4L видит только вход трека. Поэтому на CC31 плагин не реагирует; passthrough режет его, **чтобы репорт девайса не просачивался в Live**.

Все остальные CC проходят без изменений — в том числе CC47, CC49, CC28, которыми пользуется патч сам, потому что их обработка делается **до** passthrough.

## Где править

Если нужно резать дополнительные CC — добавить в `[sel 30 31]`.

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[Custom Modes Model]]
- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
