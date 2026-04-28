# XL_Performance.amxd

Max for Live MIDI-устройство для **Novation Launch Control XL MK3**.
Превращает контроллер в перформанс-инструмент с переключаемыми «слоями» (Mixer / Instruments), кросс-режимными переходами и автоматическим Solo Follow.

Файлы:
- `XL_Performance.amxd` — устройство (Max patch v9.0.10, Live MIDI Effect, ~265 объектов).
- `solo_follower.js` — JS-скрипт, грузится внутрь патча через `[js solo_follower.js]`.

Зависимостей кроме `solo_follower.js` нет.

---

## 1. Зачем это нужно

Launch Control XL MK3 умеет хранить до 14 «Custom Modes» в собственной памяти. Стандартный сценарий — руками тыкать кнопки выбора режима. Этот патч превращает контроллер в **режимный сервер**: режимы выбираются программно, между ними организованы переходы с памятью предыдущего состояния, а собственный трек устройства всегда «слышен» вместе с любым соло.

Распределение custom-режимов:
| Режим | Назначение |
|-------|-----------|
| 1..10  | **Instruments Layer** — 10 инструментальных страниц |
| 11..14 | **Mixer Layer** — 4 страницы микшера (DAW / Prelisten × Page / Bank) |

---

## 2. Архитектура (что внутри патча)

Патч физически разделён на 4 секции, помеченные комментариями:

```
================  MIXER LAYER  (custom modes 11, 12, 13, 14)  ================
===========  INSTRUMENTS LAYER  (custom modes 1..10 via overlay CC)  ===========
=====  SOLO FOLLOWER  =====
=====  CC47 CROSS-MODE TRANSIT  =====
```

Плюс **MIDI passthrough** в конце и **startup default** (на загрузку — режим 11).

### 2.1. MIXER LAYER (custom modes 11–14)

Состояние микшера хранится в трёх value-объектах:

- `v mixer_bank` — банк (1 / 2), переключается **CC47** (momentary).
- `v mixer_page` — страница (0 / 1), переключается **CC49** (momentary).
- `v mixer_hold` — Hold-флаг, переключается **CC28**.

Активный custom-mode рассчитывается формулой:

```
mode = 23 + bank + 2 * ((page + hold) % 2)
```

То есть mixer_bank/mixer_page/mixer_hold отображаются на CC30 значения **24..27** → custom modes **11..14** (Launch Control шлёт mode-change как `CC30 value=23+N`).

UI-объекты на front panel:
- `Daw` / `Prelisten` — `live.toggle` (varname `mix_obj-hotkey-daw` / `-pre`).
- `Page` / `Bank fx` / `Hold` — `live.toggle`.
- `11 / 12 / 13 / 14` — `live.text` индикаторы текущего mixer-режима.

CC47 / CC49 работают как **momentary**: на 1 → переключение, на 2 → возврат к сохранённому состоянию (`v mixer_bank_restore`, `v mixer_page_restore`).

### 2.2. INSTRUMENTS LAYER (custom modes 1–10)

Здесь LCXL отдаёт не CC30, а одну общую «Listen CC» (по умолчанию **49**, выставляется `loadmess 49`). Значения **10, 20, 30, …, 100** трактуются как режимы **1..10** соответственно. Любые другие значения (включая `0` и `127`) фильтруются как мусор/возврат.

Параметры по умолчанию (`loadmess`):
| Параметр       | Значение | Смысл |
|----------------|----------|-------|
| Listen CC      | 49       | входная CC для смены инструмент-режима |
| Overlay Route  | 11       | базовый custom-mode оверлея |
| Mode Select CC | 30       | CC, которой LCXL принимает смену режима |
| Mode Select Ch | 7        | MIDI-канал для Mode Select |

Активность оверлея — `v instruments_active` (`live.toggle` на UI). Текущий выбранный режим — `v instruments_mode` (1..10).

Маппинг режим → CC30 value: `1..10 → 6,7,8,9,18,19,20,21,22,23` (т.е. custom-modes LCXL 1..10 со смещением 5/14 — сделано так, чтобы оставить «дыру» под зарезервированные mixer-modes 11..14).

Дублированных `print …` объектов в патче много (`selected_in`, `non_return`, `ignored_zero`, `enter_route`, `back_hit`, `route_mode`) — это **рабочая телеметрия**, оставлена намеренно (см. комментарий `Debug kept intact`). Открой Max Console чтобы увидеть поток.

### 2.3. CC47 CROSS-MODE TRANSIT

Отдельный механизм поверх обоих слоёв. По CC47 на значениях **10, 20, …, 100** запоминает текущий instruments-mode (1..10) в `v instruments_mode`, **переключает LCXL на последний используемый Mixer-mode** (CC30 ch7, value 24..27 → custom 11..14). На CC47 = **127** — восстанавливает сохранённый instruments-mode и шлёт LCXL обратно на инструмент-страницу (CC30 ch7, value 6..23).

Назначение — быстрая «отбивка» в микшер с любого инструмента и возврат туда же одной кнопкой.

### 2.4. SOLO FOLLOWER (`solo_follower.js`)

JS внутри `[js solo_follower.js]`. Цель — **держать собственный трек этого устройства всегда заSOLOенным, когда заSOLOен любой другой трек**, и автоматически фокусировать (`selected_track`) тот трек, который засолили последним.

Алгоритм:
1. На `bang` / `loadmess 1` / `live.thisdevice` → `safeInit()`.
2. Получает `this_device → canonical_parent` — это «свой» трек, чтобы исключить его из обзора.
3. Проходит по `live_set tracks` и `live_set return_tracks`, на каждом ставит `LiveAPI` observer на свойство `solo`.
4. Поддерживает счётчик `soloCount` и `lastSoloedExternalId`.
5. На любое изменение solo дёргает `scheduleApply(...)` (debounce через `Task.schedule(1)`):
    - `forceOwnSolo(soloCount > 0 ? 1 : 0)` — синхронизирует свой `solo`.
    - `selectTrackById(lastSoloedExternalId)` — фокус на последнем заSOLOенном.
6. Каждые **3 сек** (`TOPOLOGY_CHECK_MS`) — `topologyCheck()`: если число tracks/return_tracks изменилось → `rebuild()` всех observers.
7. `freebang()` корректно отписывается (важно при перезагрузке устройства).

Inlet `int 0/1` включает/выключает фолловер (`sf_active` на UI).

Защита от гонок:
- `rebuilding` флаг блокирует повторный `tryInit`.
- При невалидном `LiveAPI` (id == 0) — `rebuildFailed()` с экспонентой попыток до `INIT_MAX_RETRIES = 40` (полезно при загрузке Live-сета, когда live_set ещё не готов).
- Все `api.get/set` обёрнуты в `try/catch` и `safeGetInt`.

### 2.5. MIDI Passthrough

Хвост патча: `notein/noteout`, `bendin/bendout`, `touchin/touchout`, `polyin/polyout`, `pgmin/pgmout` — verbatim. Для `ctlin/ctlout` стоит `[sel 30 31] → gate` который **режет CC30 и CC31**, чтобы исходящая смена режима LCXL не возвращалась обратно и не образовывала петлю.

### 2.6. Startup

`live.thisdevice` → `deferlow` → `del 50` → `24` → отправка на LCXL → стартовый custom-mode = **11** (mixer, bank=1, page=0, hold=0). Параллельно `live.thisdevice` → `deferlow` → `del 300` → инициализация overlay router’а.

---

## 3. Параметры устройства (видимы из Live)

```
sf_active                Active            (Solo Follower on/off)
mix_obj-hotkey-daw       Daw
mix_obj-hotkey-pre       Prelisten
mix_obj-mode11-btn       Mode 11
mix_obj-mode12-btn       Mode 12
mix_obj-mode13-btn       Mode 13
mix_obj-mode14-btn       Mode 14
mix_obj-ui-bank          Page
mix_obj-ui-hold          Hold
mix_obj-ui-page          Bank fx
```

Все автоматизируемы / маппятся / сохраняются с сетом.

---

## 4. Как пользоваться

1. На LCXL MK3 в **Components** залить custom-modes согласно распределению (1..10 — инструменты, 11..14 — микшер). Custom-modes должны слать **CC30/ch7** на смену режима и принимать тот же CC30 для подсветки.
2. Положить `solo_follower.js` рядом с `XL_Performance.amxd` (одна папка) — иначе `[js solo_follower.js]` не найдёт скрипт.
3. Закинуть `XL_Performance.amxd` на MIDI-трек, в его **MIDI From** — Launch Control XL MK3 (DAW port), **MIDI To** — обратно на LCXL DAW port.
4. Включить `Active` — Solo Follower начнёт работать.
5. Кнопки `Daw` / `Prelisten` / `Page` / `Bank fx` / `Hold` дублируют hardware-кнопки LCXL для случаев когда устройство удалённое.

---

## 5. Расширение / правки

- **Сменить Listen CC** (instruments) — поменять `loadmess 49` в секции «Listen CC».
- **Сменить Mode Select CC/Ch** — `loadmess 30` / `loadmess 7` соответственно.
- **Поменять формулу mixer-mode** — выражение `expr 23 + $i1 + (2*(($i2 + $i3) % 2))`.
- **Тюнинг Solo Follower**:
  - `TOPOLOGY_CHECK_MS` — частота проверки изменения числа треков.
  - `INIT_RETRY_MS` / `INIT_MAX_RETRIES` — стратегия повторов при холодном старте Live.
  - `scheduleApply(... ).schedule(1)` — задержка дебаунса (мс).
- **Логирование оверлей-роутера** — все `print …` пишут в Max Console под одноимёнными префиксами; убрать можно отключив объекты, но проще оставить, шум минимальный.
- **MIDI-passthrough фильтр** — если нужно резать дополнительные CC, добавить значения в `[sel 30 31]`.

---

## 6. Известные тонкости

- `solo_follower.js` намеренно **не** использует свой собственный трек как «жертву» — он его исключает по `ownTrackId`, иначе получится самоповтор.
- При смене сета observers корректно пересобираются благодаря `topologyCheck`, но первое срабатывание может занять до 3 секунд.
- `forceOwnSolo` всегда сравнивает текущее значение перед `set`, чтобы не плодить лишние LiveAPI-транзакции и не дёргать undo-стек Live.
- Перепарсинг `args` в `extractSoloValue` обрабатывает оба варианта (массив `[prop, value]` и просто число) — это разные версии Max API.
- `freebang()` очищает таймеры и observers — если редактируешь скрипт, `autowatch = 1` его перегружает чисто.

---

## 7. Версии

- Patch comment: **v1.5**
- Внутренний тег router’а: **LCXL Overlay Router v18 (single Listen CC + mode by value)**
- Min Live: см. `minimum_live_version` в `.amxd`. Min Max: `minimum_max_version`. Patch сохранён в Max **9.0.10 x64**.















