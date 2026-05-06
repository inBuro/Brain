---
type: concept
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [lcxl, midi, mapping]
---

# Mode Encoding

**Summary**: Как номера логических режимов 1..14 в `XL_Performance` отображаются на значения CC30/ch7, которые принимает LCXL для смены custom-mode.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

## Mixer (modes 11–14)

Состояние трёх флагов (source: XL_Performance.README.md):
- `mixer_bank ∈ {1, 2}` — управляется CC47 (momentary).
- `mixer_page ∈ {0, 1}` — управляется CC49 (momentary).
- `mixer_hold ∈ {0, 1}` — управляется CC28.

Активный mixer-mode вычисляется как:

```
mode_value = 23 + bank + 2 * ((page + hold) % 2)
```

(source: XL_Performance.README.md)

| bank | page | hold | mode_value (CC30) | custom-mode |
|---|---|---|---|---|
| 1 | 0 | 0 | 24 | 11 |
| 2 | 0 | 0 | 25 | 12 |
| 1 | 1 | 0 | 26 | 13 |
| 2 | 1 | 0 | 27 | 14 |

Hold = 1 инвертирует page, что даёт «удержание» альтернативной страницы пока кнопка нажата.

## Instruments (modes 1–10)

Маппинг номера режима N в значение CC30 — табличный, со «дырой» под mixer:

```
1..10  →  6, 7, 8, 9, 18, 19, 20, 21, 22, 23
```

(source: XL_Performance.README.md)

Дыра 10..17 нужна, чтобы зарезервировать диапазон 24..27 под mixer (выше) и не ломать поток при cross-mode transit. См. [[CC47 Cross-Mode Transit]].

Входной overlay CC (по умолчанию 49) принимает значения **10·N** для N=1..10 (т.е. 10, 20, …, 100). Значения 0 и 127, а также любые «не-кратные 10» — фильтруются как мусор (source: XL_Performance.README.md).

## Почему так

Чтобы:
1. Один и тот же `[sel 30 31]` фильтр в passthrough резал ВСЕ исходящие mode-changes одинаково.
2. `mixer_bank/page/hold` можно было хранить в `live.toggle` (булевы) и складывать арифметикой без ветвлений.
3. CC47 cross-transit мог однозначно различить «команда инструмента» (значение = 10·N, N≤10) и «возврат» (значение = 127).

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[XL_Performance — как это работает]]
- [[Custom Modes Model]]
- [[Mixer Layer]]
- [[Instruments Layer]]
- [[CC47 Cross-Mode Transit]]
- [[XL_Performance README]]
