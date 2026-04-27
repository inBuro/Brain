---
type: entity
tags: [mixer, layer, custom-modes, cc-mapping]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# Mixer Layer

Секция патча XL_Performance, управляющая custom modes **11-14** контроллера LCXL MK3.

## Состояние

Хранится в трех value-объектах:

| Value | Функция | Управление |
|-------|---------|------------|
| `v mixer_bank` | Банк (1 / 2) | [[CC47 Cross-Mode Transit|CC47]] (momentary) |
| `v mixer_page` | Страница (0 / 1) | CC49 (momentary) |
| `v mixer_hold` | Hold-флаг | CC28 |

## Формула активного режима

```
mode = 23 + bank + 2 * ((page + hold) % 2)
```

Результат → CC30 ch7, значения 24..27 → custom modes 11..14.

| Custom Mode | CC30 value | bank | page | hold |
|-------------|-----------|------|------|------|
| 11 | 24 | 1 | 0 | 0 |
| 12 | 25 | 2 | 0 | 0 |
| 13 | 26 | 1 | 1 | 0 |
| 14 | 27 | 2 | 1 | 0 |

## Momentary-логика (CC47 / CC49)

На значение `1` → переключение (toggle bank/page).
На значение `2` → возврат к сохраненному состоянию (`v mixer_bank_restore`, `v mixer_page_restore`).

## UI-элементы

- `Daw` / `Prelisten` — `live.toggle` (varname `mix_obj-hotkey-daw` / `-pre`)
- `Page` / `Bank fx` / `Hold` — `live.toggle`
- `11 / 12 / 13 / 14` — `live.text` индикаторы текущего режима

## Связанные страницы
- [[Instruments Layer]] — второй слой контроллера
- [[CC47 Cross-Mode Transit]] — механизм перехода между слоями
- [[Custom Modes Model]] — общая модель режимов
