---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-27
status: stable
tags: [m4l, lcxl, mixer]
---

# Mixer Layer

Секция патча `XL_Performance.amxd`, маркированная комментарием:

```
================  MIXER LAYER  (custom modes 11, 12, 13, 14)  ================
```

Отвечает за 4 микшерных страницы LCXL: **DAW / Prelisten × Page / Bank**.

## Состояние

Хранится в трёх value-объектах Max:

| Value | Тип | Управляется по | UI на front panel |
|---|---|---|---|
| `v mixer_bank` | 1/2 | **CC47** (momentary: 1 → toggle, 2 → restore) | `live.toggle` — `mix_obj-ui-bank` («Page») |
| `v mixer_page` | 0/1 | **CC49** (momentary) | `live.toggle` — `mix_obj-ui-page` («Bank fx») |
| `v mixer_hold` | 0/1 | **CC28** | `live.toggle` — `mix_obj-ui-hold` («Hold») |

Дополнительные UI-объекты:
- `Daw` / `Prelisten` — `live.toggle` (`mix_obj-hotkey-daw`, `mix_obj-hotkey-pre`).
- `11 / 12 / 13 / 14` — `live.text`-индикаторы текущего mixer-mode.

> Названия параметров `mix_obj-ui-bank`/`-page` визуально перепутаны с надписями «Page»/«Bank fx» в UI — это следствие истории правок, не баг.

## Восстановление (momentary)

CC47/CC49 сохраняют предыдущее состояние в `v mixer_bank_restore`, `v mixer_page_restore`. Значение **1** на CC47/CC49 — переключение, **2** — возврат к сохранённому.

## Расчёт активного режима

См. [[../concepts/Mode Encoding]] — формула `mode_value = 23 + bank + 2 * ((page + hold) % 2)`. Результат уходит на LCXL как **CC30/ch7 value 24..27** → custom-mode 11..14.

## Связи

- Стартовое значение задаётся в [[../../XL_Performance — как это работает]] (mode 11 на загрузке).
- При CC47 cross-transit сохраняется не mixer, а instruments: см. [[CC47 Cross-Mode Transit]].
