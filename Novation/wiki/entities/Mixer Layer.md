---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, lcxl, mixer]
---

# Mixer Layer

**Summary**: Секция патча `XL_Performance.amxd`, отвечающая за 4 микшерных страницы LCXL (custom-modes 11–14): хранение состояния `mixer_bank/page/hold`, формула выбора режима, UI на front panel.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

Секция патча, маркированная комментарием:

```
================  MIXER LAYER  (custom modes 11, 12, 13, 14)  ================
```

Отвечает за 4 микшерных страницы LCXL: **DAW / Prelisten × Page / Bank** (source: XL_Performance.README.md).

## Состояние

Хранится в трёх value-объектах Max (source: XL_Performance.README.md):

| Value | Тип | Управляется по | UI на front panel |
|---|---|---|---|
| `v mixer_bank` | 1/2 | **CC47** (momentary: 1 → toggle, 2 → restore) | `live.toggle` — `mix_obj-ui-bank` («Page») |
| `v mixer_page` | 0/1 | **CC49** (momentary) | `live.toggle` — `mix_obj-ui-page` («Bank fx») |
| `v mixer_hold` | 0/1 | **CC28** | `live.toggle` — `mix_obj-ui-hold` («Hold») |

Дополнительные UI-объекты (source: XL_Performance.README.md):
- `Daw` / `Prelisten` — `live.toggle` (`mix_obj-hotkey-daw`, `mix_obj-hotkey-pre`).
- `mix_obj-mode11-btn` … `mix_obj-mode14-btn` — `live.text`-индикаторы текущего mixer-mode (Mode 11..14 в Live).

> Названия параметров `mix_obj-ui-bank`/`-page` визуально перепутаны с надписями «Page»/«Bank fx» в UI — это следствие истории правок, не баг.

## Восстановление (momentary)

CC47/CC49 сохраняют предыдущее состояние в `v mixer_bank_restore`, `v mixer_page_restore`. Значение **1** на CC47/CC49 — переключение, **2** — возврат к сохранённому (source: XL_Performance.README.md).

## Расчёт активного режима

См. [[Mode Encoding]] — формула `mode_value = 23 + bank + 2 * ((page + hold) % 2)`. Результат уходит на LCXL как **CC30/ch7 value 24..27** → custom-mode 11..14.

## Связи с другими слоями

- Стартовое значение (mode 11 на загрузке) задаётся в [[XL_Performance — как это работает]].
- При CC47 cross-transit сохраняется не mixer, а instruments: см. [[CC47 Cross-Mode Transit]].

## Related pages

- [[Mode Encoding]]
- [[CC47 Cross-Mode Transit]]
- [[Instruments Layer]]
- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
