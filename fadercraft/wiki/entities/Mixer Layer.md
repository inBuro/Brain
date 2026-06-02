---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, lcxl, mixer]
---

# Mixer Layer

**Summary**: Секция патча `Control XL.amxd`, отвечающая за 4 микшерных страницы LCXL (custom-modes 11–14): хранение состояния `mixer_bank/page/hold`, формула выбора режима, UI на front panel.

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
| `v mixer_page` | 0/1 | **CC49** (momentary) | `live.toggle` — `mix_obj-ui-page` («Bank», ранее «Bank fx») |
| `v mixer_hold` | 0/1 | **CC28** | `live.toggle` — `mix_obj-ui-hold` («Hold») |

Дополнительные UI-объекты (source: XL_Performance.README.md):
- `Daw` / `Prelisten` — `live.toggle` (`mix_obj-hotkey-daw`, `mix_obj-hotkey-pre`).
- `mix_obj-mode11-btn` … `mix_obj-mode14-btn` (varname `mode_11`..`mode_14`) — `live.text`-индикаторы текущего mixer-mode. Внутренняя «кабельная» логика: outlet 0 → `mix_obj-modeN-sel`; зажигаются/гасятся через inlet 0 от `mix_obj-m24..m27-on/off` и `mode_all_off_msg`. **Закрыты для маппинга:** `parameter_invisible = 2` (Hidden) — не показываются в MIDI-mapping / automation / Live param list (с 2026-06-02). `parameter_enable` оставлен `1`, чтобы выходы/значение работали; Hidden убирает только пользовательский маппинг, не функцию.

> **Почему «Visible for mapping = off» в инспекторе не закрывало маппинг.** Эта галка пишет атрибут `parameter_invisible`. У этих 4 объектов атрибут вообще отсутствовал в `saved_attribute_attributes.valueof` (дефолт = 0 = Automated & Stored = виден для маппинга). Снятие галки в инспекторе на frozen-девайсе в файл не сохранялось, поэтому при перезагрузке значение возвращалось к дефолту и кнопки снова были мапабельны. Правка вшита прямо в `.amxd`: `parameter_invisible: 2`.

> Названия параметров `mix_obj-ui-bank`/`-page` визуально перепутаны с надписями «Page»/«Bank» в UI — это следствие истории правок, не баг.
>
> **2026-06-03:** видимый лейбл укорочён «Bank fx» → «Bank» во всех трёх деливераблах (raw `XL_Performance.amxd` + Demo/Starter `Control XL.amxd`). Затронуты 5 строк на объект `mix_obj-ui-page`: `comment.text` (id `mix_obj-page-label`), `parameter_longname`, `parameter_shortname` в `saved_attribute_attributes.valueof`, и пара `[longname, shortname]` в реестре `patcher.parameters["mix_obj-ui-page"]`. Scripting `id`/`varname` (`ui_page_toggle`) и связи не тронуты. Бинарная пересборка: для frozen-девайсов пересчитаны `ptch`-size, `mx@c` header trailer-offset и `dlst` sz32/of32 эмбедов — встроенные `version_check.js`/`solo_follower.js` байт-в-байт идентичны.

## Восстановление (momentary)

CC47/CC49 сохраняют предыдущее состояние в `v mixer_bank_restore`, `v mixer_page_restore`. Значение **1** на CC47/CC49 — переключение, **2** — возврат к сохранённому (source: XL_Performance.README.md).

## Расчёт активного режима

См. [[Mode Encoding]] — формула `mode_value = 23 + bank + 2 * ((page + hold) % 2)`. Результат уходит на LCXL как **CC30/ch7 value 24..27** → custom-mode 11..14.

## Связи с другими слоями

- Стартовое значение (mode 11 на загрузке) задаётся в [[XL_Performance — как это работает]].
- При CC47 cross-transit сохраняется не mixer, а instruments: см. [[CC47 Cross-Mode Transit]].

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[Mode Encoding]]
- [[CC47 Cross-Mode Transit]]
- [[Instruments Layer]]
- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
