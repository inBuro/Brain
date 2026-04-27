---
type: synthesis
project: Novation
created: 2026-04-27
updated: 2026-04-27
status: draft
tags: [m4l, lcxl, performance]
---

# XL_Performance — как это работает

Синтез поверх [[wiki/sources/XL_Performance README]]. Если что-то здесь устарело — README первичен.

---

## Идея в одном абзаце

Launch Control XL MK3 хранит до **16 custom-modes** во внутренней памяти. Стандартно режимы выбираются руками. `XL_Performance.amxd` превращает контроллер в **режимный сервер**: режимы выбираются программно через CC30/ch7, между ними организованы переходы с памятью предыдущего состояния, а собственный трек устройства всегда «слышен» вместе с любым соло. Custom-modes 1–10 отданы под инструменты, 11–14 — под микшер. См. [[wiki/concepts/Custom Modes Model]].

## Слои и роли

| Слой | Custom-modes | Управляющая CC | Где лежит логика |
|---|---|---|---|
| **Mixer** | 11–14 | CC30/ch7, value 24..27 | [[wiki/entities/Mixer Layer]] |
| **Instruments** | 1–10 | overlay CC (по умолчанию CC49) | [[wiki/entities/Instruments Layer]] |
| **Cross-mode transit** | — | CC47 | [[wiki/entities/CC47 Cross-Mode Transit]] |
| **Solo Follower** | — | JS, LiveAPI | [[wiki/entities/Solo Follower]] |
| **MIDI passthrough** | — | всё кроме CC30/CC31 | [[wiki/entities/MIDI Passthrough]] |

## Поток событий

1. **Загрузка** — `live.thisdevice` → через `del 50` шлёт CC30 ch7 = 24 → LCXL встаёт в **mode 11** (mixer, bank=1, page=0, hold=0). Параллельно через `del 300` инициализируется overlay-router инструментов.
2. **Микшерный пользовательский ввод** — кнопки CC47/CC49/CC28 на LCXL переключают `mixer_bank`/`mixer_page`/`mixer_hold`. Активный mixer-mode пересчитывается формулой `mode = 23 + bank + 2 * ((page + hold) % 2)` (см. [[wiki/concepts/Mode Encoding]]) и улетает обратно на LCXL как CC30/ch7.
3. **Инструментальный ввод** — на ту же overlay CC (49) приходит значение **10·N** для режима N=1..10. Router фильтрует мусор, мапит N → CC30 value по таблице 1..10 → 6,7,8,9,18,19,20,21,22,23 и шлёт LCXL.
4. **Кросс-переход** — CC47 со значением 10·N запоминает текущий instruments-mode, бросает LCXL в последний mixer-mode. CC47=127 — возврат на сохранённый instruments-mode. Деталь: [[wiki/entities/CC47 Cross-Mode Transit]].
5. **Solo Follower** в фоне через LiveAPI наблюдает `solo` всех треков/возвратов; держит свой трек заSOLOенным, пока заSOLOен любой внешний; фокусирует последний заSOLOенный. Деталь: [[wiki/entities/Solo Follower]].
6. **Passthrough** — нот/бенд/афтертач/программа идут verbatim. CC режутся `[sel 30 31] → gate`, чтобы исходящая смена режима LCXL не возвращалась обратно петлёй: [[wiki/entities/MIDI Passthrough]].

## Видимые из Live параметры

`sf_active`, `mix_obj-hotkey-daw/-pre`, `mix_obj-mode11-btn..mode14-btn`, `mix_obj-ui-bank/-page/-hold` — всё автоматизируется и сохраняется с сетом.

## Куда смотреть для правок

- Сменить overlay listen CC — `loadmess 49` в секции «Listen CC» патча.
- Сменить Mode Select CC/Ch — `loadmess 30` / `loadmess 7`.
- Сменить формулу mixer-mode — `expr 23 + $i1 + (2*(($i2 + $i3) % 2))`.
- Тюнинг JS — константы `TOPOLOGY_CHECK_MS`, `INIT_RETRY_MS`, `INIT_MAX_RETRIES` и debounce `Task.schedule(1)`.
- Дополнительные CC в фильтр passthrough — добавить в `[sel 30 31]`.
