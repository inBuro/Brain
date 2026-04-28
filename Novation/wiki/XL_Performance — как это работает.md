---
type: synthesis
project: Novation
created: 2026-04-28
updated: 2026-04-28
status: stable
tags: [m4l, lcxl, performance]
---

# XL_Performance — как это работает

**Summary**: Сквозной обзор устройства `XL_Performance.amxd` — как Launch Control XL MK3 превращается в программно-управляемый «режимный сервер»: слои, поток событий, точки расширения.

**Sources**: `raw/XL_Performance.README.md` (synthesis-черновик `raw/XL_Performance — как это работает.md` свёрнут в эту страницу при ingest и удалён из `raw/`)

**Last updated**: 2026-04-28

---

## Идея в одном абзаце

Launch Control XL MK3 хранит до **14 custom-modes** во внутренней памяти (README v1.5 ошибочно говорит «16» — фактическая ёмкость 14, см. [[Custom Modes Model]]); стандартно режимы выбираются руками. `XL_Performance.amxd` превращает контроллер в **режимный сервер**: режимы выбираются программно через CC30/ch7, между ними организованы переходы с памятью предыдущего состояния, а собственный трек устройства всегда «слышен» вместе с любым внешним соло (source: XL_Performance.README.md). Custom-modes 1–10 отданы под инструменты, 11–14 — под микшер; вся ёмкость занята.

## Слои и роли

| Слой | Custom-modes | Управляющая CC | Где лежит логика |
|---|---|---|---|
| **Mixer** | 11–14 | CC30/ch7, value 24..27 | [[Mixer Layer]] |
| **Instruments** | 1–10 | overlay CC (по умолчанию CC49) | [[Instruments Layer]] |
| **Cross-mode transit** | — | CC47 | [[CC47 Cross-Mode Transit]] |
| **Solo Follower** | — | JS, LiveAPI | [[Solo Follower]] |
| **MIDI passthrough** | — | всё кроме CC30/CC31 | [[MIDI Passthrough]] |

(source: XL_Performance.README.md)

## Поток событий

1. **Загрузка** — `live.thisdevice` → через `del 50` шлёт CC30 ch7 = 24 → LCXL встаёт в **mode 11** (mixer, bank=1, page=0, hold=0). Параллельно через `del 300` инициализируется overlay-router инструментов (source: XL_Performance.README.md).
2. **Микшерный пользовательский ввод** — кнопки CC47/CC49/CC28 на LCXL переключают `mixer_bank`/`mixer_page`/`mixer_hold`. Активный mixer-mode пересчитывается формулой `mode = 23 + bank + 2 * ((page + hold) % 2)` (см. [[Mode Encoding]]) и улетает обратно на LCXL как CC30/ch7.
3. **Инструментальный ввод** — на ту же overlay CC (49) приходит значение **10·N** для режима N=1..10. Router фильтрует мусор, мапит N → CC30 value по таблице `1..10 → 6,7,8,9,18,19,20,21,22,23` и шлёт LCXL.
4. **Кросс-переход** — CC47 со значением `10·N` запоминает текущий instruments-mode и бросает LCXL в последний mixer-mode. CC47=127 — возврат на сохранённый instruments-mode. Деталь: [[CC47 Cross-Mode Transit]].
5. **Solo Follower** в фоне через LiveAPI наблюдает `solo` всех треков/возвратов, держит свой трек заSOLOенным, пока заSOLOен любой внешний, и фокусирует последний заSOLOенный. Деталь: [[Solo Follower]].
6. **Passthrough** — ноты/бенд/афтертач/program-change идут verbatim. CC режутся через `[sel 30 31] → gate`, чтобы исходящая смена режима LCXL не возвращалась обратно петлёй: [[MIDI Passthrough]].

(source: XL_Performance.README.md)

## Видимые из Live параметры

`sf_active`, `mix_obj-hotkey-daw/-pre`, `mix_obj-mode11-btn..mode14-btn`, `mix_obj-ui-bank/-page/-hold` — всё автоматизируется и сохраняется с сетом (source: XL_Performance.README.md).

## Куда смотреть для правок

- Сменить overlay listen CC — `loadmess 49` в секции «Listen CC» патча.
- Сменить Mode Select CC/Ch — `loadmess 30` / `loadmess 7`.
- Сменить формулу mixer-mode — `expr 23 + $i1 + (2*(($i2 + $i3) % 2))`.
- Тюнинг JS — константы `TOPOLOGY_CHECK_MS`, `INIT_RETRY_MS`, `INIT_MAX_RETRIES` и debounce `Task.schedule(1)`.
- Дополнительные CC в фильтр passthrough — добавить в `[sel 30 31]`.

(source: XL_Performance.README.md)

## Related pages

- [[XL_Performance README]]
- [[Custom Modes Model]]
- [[Mode Encoding]]
- [[Mixer Layer]]
- [[Instruments Layer]]
- [[CC47 Cross-Mode Transit]]
- [[Solo Follower]]
- [[MIDI Passthrough]]
