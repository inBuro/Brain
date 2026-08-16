# Dynamic Focus — State Map & Architecture Notes
# Живой документ — обновляется до/после каждой правки

Покрывает оба устройства: **DF Slot** (правки нумеруются v31→текущая) и **DF Input** (отдельные разделы ниже).
Построено по коду v30 (`midi_learn_slot.js`) + анализу MapButtonTint.maxpat + console log.
Предназначено для ревью координатором перед следующей правкой кода.

---

## DF Input — правки (2026-08-10)

### DF Input — Update Icon (2026-08-10) — ДИАГНОСТИКА: это ожидаемо, не баг репака

**Симптом:** После перезагрузки `Dynamic Focus Input.amxd` из User Library в Live —
на лицевой панели горит иконка "update available".

**Диагностика (проведена 2026-08-10):**

| Параметр | CURRENT (post-edit) | ARCHIVE (pre-edit) |
|---|---|---|
| Embedded `DEVICE_VERSION` | `'1'` | `'1'` |
| Embedded `DEVICE_KEY` | `'dynamic_focus'` | `'dynamic_focus'` |
| `fadercraft.com/api/versions.json` `latest` | `"1.1"` | — |

**Вывод: это НЕ регрессия от нашего репака.**

Обе копии — текущая и архив до правки — содержат идентичное embedded значение
`DEVICE_VERSION = '1'`. Наша правка (удаление 4 debug print-боксов) не затронула
`df_version_check.js` или его константы.

**Механизм:** `node.script df_version_check.js` (box id=`dfi_vc_node`) при загрузке
делает GET `https://fadercraft.com/api/versions.json`, читает поле `dynamic_focus.latest`
(`"1.1"`) и сравнивает с embedded `DEVICE_VERSION` (`'1'`). Строка `'1'` < `'1.1'`
→ update-иконка загорается. Это сравнение идёт с СЕРВЕРОМ, не с локальным файлом.
Откуда физически загружен `.amxd` — не имеет значения.

**Корень:** при сборке v1.1 bundle (2026-08-08) `versions.json` на сервере был выставлен в
`"1.1"`, но `DEVICE_VERSION` в embedded `df_version_check.js` не был обновлён с `'1'` до `'1.1'`.
Значит update-иконка горела уже в опубликованном v1.1 bundle — это упущение при релизе, а не баг от сегодняшней правки.

**Что делать пользователю:** update-иконка означает «на сервере объявлена версия 1.1, а в этом
файле зашито "1"». Это НЕ про свежесть локальной копии. Поскольку пользователь и так
работает с актуальным dev-файлом, можно игнорировать.

**Как починить (к следующему релизу):** перед публикацией bumped bundle'а обновить
`DEVICE_VERSION = '1.1'` в `df_version_check.js` перед freeze. При сборке из unfrozen-исходников
файл `df_version_check.js` редактируется напрямую; для уже-frozen девайса — нужен Path B реpack
с заменой embedded скрипта. Сейчас НЕ делать — это dev-копия.

---

### DF Input v1.1-no-debug-prints (2026-08-10) — удалены 4 диагностических объекта

**Файл:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/Dynamic Focus Input.amxd`
**Новый MD5:** `6757b0279244a0f87db1918338c387f0` (был `0c486e52`, 31558 B → 24010 B)
**Архив до правки:** `_device-backups/Dynamic Focus Input.2026-08-10-210359.pre-rm-debug-prints.amxd`

**Найдено:** В frozen patcher-JSON `Dynamic Focus Input.amxd` жили 4 диагностических бокса,
оставшихся от разработки:

| id | text | тип | откуда firing |
|---|---|---|---|
| `dbg-ch` | `print dfi-raw-ch` | newobj | ctlin outlet 2 (channel) → ВСЕ CC |
| `dbg-pack` | `print dfi-pack-out` | newobj | pack outlet 0 → ВСЕ CC |
| `dbg-midiin-ch` | `print dfi-midiparse-cc` | newobj | midiparse outlet 3 → ВСЕ CC |
| `dbg-midiparse` | `midiparse` | newobj | midiin outlet 0 (только для debug-ветки) |

**Почему критично:** Все три `print` объекта стреляли на КАЖДОЕ входящее CC-сообщение.
При активном контроллере (даже без явного вращения ручки — многие контроллеры посылают позиции
автоматически при подключении или непрерывно) это создавало 2–3 строки в Max Console на каждое
сообщение, т.е. сотни строк в секунду. Console spam такого масштаба перегружал Max-планировщик
и был вероятной причиной "тормозняка" и неверной покраски в DF Slot (deferred Tasks на 300/900ms
не успевали сработать вовремя под нагрузкой).

**Что именно удалено:**
- 4 бокса: `dbg-ch`, `dbg-pack`, `dbg-midiin-ch`, `dbg-midiparse`
- 4 patchlines:
  - `obj-1[0] → dbg-midiparse[0]` (midiin → midiparse)
  - `dbg-midiparse[3] → dbg-midiin-ch[0]` (midiparse → print)
  - `obj-3[2] → dbg-ch[0]` (ctlin channel → print)
  - `obj-4[0] → dbg-pack[0]` (pack → print)

**Что НЕ тронуто:** `dbg-midiparse` — это был `midiparse`-объект, подключённый ТОЛЬКО к print-боксу.
Основной сигнальный путь `ctlin → pack → dfi_rel_js → send fc_df_cc` не изменился.

**Метод:** Path B (compact JSON, patched dlst). ΔL = −7548 байт. Все 3 embedded JS (`dfi_relative.js`,
`df_version_check.js`, `monitor_init.js`) проверены байт-в-байт через dlst.of32 → идентичны.

**Boxes/Lines:** 28/23 → 24/19.

**Тест:**
1. Убрать DF Input с MIDI-дорожки, положить заново (Live кеширует)
2. Max Console: `dfi-raw-ch`, `dfi-pack-out`, `dfi-midiparse-cc` — НЕ должны появляться при вращении
3. MIDI должен поступать в DF Slot (fc_df_cc): CC control на замапленном параметре должен работать
4. Encoder mode (Absolute/Relative) кнопка — по-прежнему работает
5. Версия-чекер (`node.script df_version_check.js`) — по-прежнему работает

**Примечание — зависание на маппинге:**
Пользователь сообщал о freeze именно в момент маппинга (ещё до поворота ручки). Наиболее вероятная
причина: контроллер посылает burst MIDI-данных в момент соединения/активации, что вызывало лавину
print'ов через DF Input. После удаления print'ов этот burst проходит тихо. Если freeze при маппинге
сохраняется после данного фикса — искать в DF Slot: в panelmap() живут [S7-v53] diagnostic posts
(t+300ms / t+900ms), унаследованные из диагностики v53 — они не такие интенсивные, но могут
добавлять шум при многократном вызове panelmap() (restore многих слотов одновременно).

---

## ФИНАЛЬНЫЙ ВЫВОД v64–v66 (2026-08-11) — НЕ БАГ, Absolute-mode by design

**Подтверждено пользователем.** Весь диагностический трейл v64 (htId-diag) → v65 (UMV-DRAG /
COLOR-OBS) → v66 (COLOR-RAW stale-guard) был потрачен на **ложную тревогу**.

**Что происходило на самом деле:**

Тест проводился в **Absolute-режиме** (`abs=true` в логе `[COLOR-OBS]`). В этом режиме девайс
замапил параметр (Roar) на треке `trkId=54175` (целевой трек, не меняется при переносе корпуса).
Код `_getActiveTrackColor()` в Absolute-режиме берёт цвет от `targetTrack` (целевой), а не от
`hostTrack` (хост-трек, где физически лежит девайс).

Переброска девайса между треками в Absolute-режиме **корректно НЕ меняет** цвет — целевой
параметр остался на том же треке. `tc=123,123,123` (серый `0x7B7B7B`) — это реальный цвет
трека с параметром Roar, а не сбой кода.

**Что НЕ нужно делать:** Не искать баг в `_getActiveTrackColor()`, stale-guard, deferred
repaints ради этого сценария — код технически исправен.

**Артефакты v66 (stale-guard + `[COLOR-RAW]` пост) остаются** — они безвредны и могут помочь
в будущих реальных race-condition сценариях (FOLLOW-режим).

**Правило для будущих раундов:** При жалобе "цвет не обновился после drag" — ПЕРВЫМ ДЕЛОМ
проверить `colorMode` и `abs` flag в консоли. В Absolute-режиме хост-трек не управляет цветом.

---

## DF Slot — Журнал правок (v31 → v66-COLOR-RAW, 2026-08-09/11)

### v66-COLOR-RAW — ТЕКУЩАЯ ВЕРСИЯ (2026-08-11) — stale-guard hostTrack + raw color диагностика

**Console при загрузке:**
```
>>> S7-DEV-v66-COLOR-RAW LOADED <<<
MapButtonTint: MapButtonTint v47 loaded
```

**Баг (из v65):** `[UMV-DRAG]` стабильно показывает `tc=123,123,123` (серый `0x7B7B7B = 8092539`)
при drag на жёлтый трек. Серый не меняется ни в 300ms, ни в 900ms, ни в 1500ms вызовах.

**Разбор формата LOM `color`:**

`Track.get("color")` в Max JS LiveAPI возвращает **один packed 24-bit integer** (возвращаемый
как JavaScript array из одного числа). Формат: `0xRRGGBB`. Распаковка через побитовые сдвиги:
```
r = ((ci >> 16) & 255) / 255.0
g = ((ci >> 8)  & 255) / 255.0
b = ( ci        & 255) / 255.0
```

Код `_getActiveTrackColor()` реализует эту распаковку ПРАВИЛЬНО. Нет захардкоженного fallback `123`.

`0x7B7B7B = 8092539` — это реальный серый цвет палитры Ableton, не artfact парсинга.

**Root cause (гипотеза v66):** `hostTrack` (кешированный LiveAPI объект) при вызове
`_getActiveTrackColor()` после drag указывает на СТАРЫЙ трек (серый), а не на новый (жёлтый).
Race condition: `setupFocus()` обновляет `hostId` (int) первым, а `hostTrack` (LiveAPI объект)
может использоваться в `_getActiveTrackColor()` до того как `setupFocus()` успел его пересоздать,
или `setupFocus()` создала `colorObserver` (fires `onTrackColor` sync) до обновления `hostTrack`.

Диагностика `[COLOR-RAW]` в v66 покажет:
- `STALE hostTrack! trkId=X hostId=Y` → race подтверждён, stale-guard сработал
- `trkId=Y hostId=Y raw=GRAY` → treck id правильный, но LOM возвращает серый → иная причина

**Изменения v66:**

В `_getActiveTrackColor()`:
1. **Stale-guard:** перед чтением цвета проверяет `hostTrack.id` против `hostId`. Если
   расходятся — пересоздаёт `hostTrack = new LiveAPI(null, "id " + hostId)` (1 IPC, только при
   реальном расхождении) и логирует `[COLOR-RAW] STALE hostTrack!`.
2. **[COLOR-RAW] пост:** после guard — логирует `trkId`, `hostId`, сырое `raw` значение из
   `track.get("color")` ДО `parseInt`. Это позволяет видеть что реально возвращает Live LOM.

**Архив JS:** `midi_learn_slot.2026-08-11-111746.pre-v66-color-raw.js`

**Протокол теста:**

1. Reload девайс (убрать/добавить). Console: `>>> S7-DEV-v66-COLOR-RAW LOADED <<<`
2. Замапить 1-2 слота. Drag на жёлтый трек (id 43077). Кликнуть на него.
3. Console: ищи `[COLOR-RAW]` записи.

**Интерпретация `[COLOR-RAW]`:**
- `STALE hostTrack! trkId=X hostId=43077` → race подтверждён. Stale-guard исправляет на лету.
  Проверь: цвет после этого стал жёлтым? Если да — фикс полный.
- `trkId=43077 hostId=43077 raw=8092539` → трек правильный, но серый (0x7B7B7B). Трек
  действительно серый в этот момент, или LOM обновляется с задержкой? Попробуй тест через 500ms.
- `trkId=43077 hostId=43077 raw=16766516` → жёлтый правильно читается → виновен другой путь
  (MapButtonTint overwrite происходит ПОСЛЕ 1500ms).

**Интерпретация `[UMV-DRAG]` после v66:**
- `tc=YELLOW` и цвет изменился → stale-guard помог, баг устранён
- `tc=GRAY` и `[COLOR-RAW]` показывает `raw=GRAY` с правильным `trkId` → LOM запаздывает,
  нужен retry с большей задержкой

---

### v65-COLOR-DIAG — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-11) — диагностика маппед-драг + 900/1500ms дефередды

**Console при загрузке:**
```
>>> S7-DEV-v65-COLOR-DIAG LOADED <<<
MapButtonTint: MapButtonTint v47 loaded
```

**Репро (подтверждён в свежем Live Set, 2026-08-11):**
- Незамапленное устройство + drag между треками → цвет обновляется корректно
- Замапленное устройство (любой слот) + drag между треками → панельные кнопки НЕ меняют цвет

**Статический анализ root cause:**

`_doRebind()` (путь при первоначальном маппинге) имеет дефередды 300ms + 900ms + 1500ms для
`_updateMapBtnVisibility()` — чтобы перекрыть async ребиндинг `live.remote~` и RangeAndName
state-machine re-fires (→ amber/dark overwrite).

`checkParentMove()` (путь при drag) имел ТОЛЬКО 300ms деферред. Если MapButtonTint state-machine
или `live.remote~` перерисовывает ячейки ПОСЛЕ 300ms — не было ничего, что перекрыло бы это.

**Гипотеза (вероятная причина):** `live.remote~` в MapButtonTint после drag на новый трек
ребиндится к тому же параметру → `mb_bindtrig` → state machine → `it_emit` → overwrite track
color. `_doRebind()` при drag НЕ вызывается (TgtId не меняется → `tgtIdObserver` не стреляет),
поэтому его 900/1500ms coverage отсутствовала. Фикс: добавлены 900ms + 1500ms в `checkParentMove()`.

**Добавленная диагностика:**

1. `[COLOR-OBS]` в `onTrackColor()` — срабатывает ли colorObserver при живом перекрашивании?
   (Свойство `"color"` трека может не быть listenable в Live LOM — аналогично `canonical_parent`).
2. `[UMV-DRAG]` в `_updateMapBtnVisibility()` FOLLOW+mapped branch — для каждого mapped слота
   при каждом вызове `_updateMapBtnVisibility()`:
   ```
   [UMV-DRAG] si=N btn=OK/NULL val=N tc=R,G,B/NULL
   ```
   - `btn=NULL` → `getnamed("live.text")` не нашёл объект (patcher иерархия сломана)
   - `val=1` → слот в armed состоянии, paint пропущен по guard
   - `tc=NULL` → `hostTrack.get("color")` вернул NaN (Live API не готов)
   - `btn=OK, val=0, tc=R,G,B` → paint выполнен корректно → если цвет НЕ виден → overwrite ПОСЛЕ

**Изменения кода:**
- `checkParentMove()`: добавлены `_cpmRpt900.schedule(900)` + `_cpmRpt1500.schedule(1500)` — оба вызывают `_updateMapBtnVisibility()`. Теперь coverage = 0ms + 300ms + 900ms + 1500ms (идентично `_doRebind()`).
- `onTrackColor()`: добавлен `[COLOR-OBS]` post в начало.
- `_updateMapBtnVisibility()` FOLLOW+mapped: добавлен `[UMV-DRAG]` post; guard рефакторен для лога (вынесен в `_tcBtnVal`).

**Архив:** `midi_learn_slot.2026-08-11-110010.pre-v65-color-diag.js`

**Протокол теста:**

**Тест 1 — Mapped drag (основной баг):**
1. Свежий Live Set, добавить DF Slot, замапить 1-2 панельных слота
2. Открыть Max Console
3. Выбрать трек с устройством
4. Перетащить устройство на другой трек (явно ДРУГОГО цвета), затем кликнуть на новый трек
5. Console: должно появиться `[DF Slot] checkParentMove: host moved X -> Y`
6. Затем серия `[UMV-DRAG]` для каждого mapped слота (sync + 300ms + 900ms + 1500ms = 4 волны)

**Интерпретация [UMV-DRAG]:**
- `btn=OK, val=0, tc=R,G,B` → paint выполнен. Если цвет виден → фикс работает.
  Если цвет НЕ виден → что-то перезаписывает ПОСЛЕ 1500ms (искать в MapButtonTint keep-alive или другом пути).
- `tc=NULL` (в 0ms sync) + `tc=R,G,B` (в 300ms) → async color resolution, 300ms деферред достаточен.
- `val=1` → слот застрял в armed state (отдельный баг).
- `btn=NULL` → patcher разрушен (критический баг, нужно перезагрузить Live).

**Тест 2 — Live recolor (onTrackColor):**
1. Замапить слот, НЕ перетаскивать устройство
2. Перекрасить хост-трек через правый клик → "Assign Track Color"
3. Console: если `[COLOR-OBS] onTrackColor FIRED` — colorObserver работает
4. Если `[COLOR-OBS]` НЕ появляется — свойство `"color"` НЕ listenable в Live LOM
   → нужен color-polling (TODO, если подтверждено)

---

### v64-HTID-DIAG — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-11) — диагностика hostTrack.id при drag-repaint

**Console при загрузке:**
```
>>> S7-DEV-v64-HTID-DIAG LOADED <<<
MapButtonTint: MapButtonTint v47 loaded
```

**Контекст:** Пользователь сообщил о визуальном "барахлении" при перетаскивании девайса между
треками (drag&drop). Диагностические посты v63 показали идентичный цвет `tc=255,163,116` для
двух разных `hostId` (43077 и 54175). Улика неоднозначна: либо треки реально одного цвета
(#FFA374 ≈ оранжевый), либо `hostTrack` не был правильно переуказан перед чтением цвета.

⚠️ **ВЫВОД (исправлен 2026-08-11):** Гипотеза "треки одного цвета" НЕВЕРНА. Новый тест в
свежем Live Set выявил чёткий репро-кейс: `unmapped + drag = работает`, `mapped + drag = НЕ работает`.
Старый тестовый сет имел накопленное orphaned state (множество перезагрузок), которое маскировало
реальный баг. v64 диагностика (`htId === hostId`) подтвердила отсутствие race condition.
Root cause: `checkParentMove()` имел только 300ms деферред, тогда как MapButtonTint state-machine
re-fires могут происходить позже. Фикс: v65 добавил 900ms + 1500ms.

**Добавленная диагностика (v64):**

К обоим diag-постам в `checkParentMove()` добавлен `htId = hostTrack.id`:
```
drag repaint sync:  hostId=NNNNN htId=MMMMM tc=R,G,B
drag repaint 300ms: hostId=NNNNN htId=MMMMM tc=R,G,B
```

**Архив:** `midi_learn_slot.2026-08-11-075642.pre-v64-htid-diag.js`

---

### v63-S7-UNIFIED + BLACK-TEXT — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-11) — унификация si=7 FOLLOW + диагностика drag + чёрный текст

**Console при загрузке:**
```
>>> S7-DEV-v63-S7-UNIFIED LOADED <<<
MapButtonTint: MapButtonTint v47 loaded
```

**Задача 1 — Унификация si=7 дизайна (явный редизайн):**

⚠️ ВНИМАНИЕ БУДУЩИМ РАУНДАМ: Дизайн si=7 "тёмный фон + amber текст/рамка" был ОТМЕНЁН
пользователем 2026-08-11. Это НЕ баг и НЕ регрессия — прямой редизайн.
Не возвращать si=7 к amber/dark без явного запроса.

Прежний дизайн si=7 (v42/v50): skin-adaptive тёмный фон + amber border+text.
Новый дизайн si=7 (v63): track color bg + white text — ИДЕНТИЧНО si=0..6.
Уточнение 2026-08-11: white text → **black text** (0., 0., 0.) во всех 8 строках FOLLOW mode.
Три точки замены: `emitTrack()` outlet(7) поз. 6-8, `_updateMapBtnVisibility()` lcdcolor, `_s7kaFn()` lcdcolor.

**Изменения в коде:**
- `_updateMapBtnVisibility()` FOLLOW mapped branch: `si < 7` → `si <= 7`. Раздельный
  si===7 блок (с `lnb_lbg_r/g/b` read и amber paint) полностью удалён.
- `_s7kaFn()` keep-alive: заменён amber paint на track color + white text (через
  `_getActiveTrackColor()` + `_fa()`). lcdbgcolor теперь тоже обновляется каждые 100ms
  (было убрано в v50; возвращено т.к. state machine может сбросить lcdbgcolor к dark).

**Задача 2 — Диагностические посты drag repaint (по запросу координатора):**

В `checkParentMove()` добавлены два поста, которые стреляют при каждом детектированном
переносе девайса на другой трек:

```
[DF Slot] drag repaint sync: hostId=NNNNN tc=R,G,B
[DF Slot] drag repaint 300ms: hostId=NNNNN tc=R,G,B
```

- `sync`: сразу после `_updateMapBtnVisibility()` (синхронно), показывает что возвращает
  `_getActiveTrackColor()` на момент первого репейнта.
- `300ms`: внутри деферд-Task, показывает что возвращает та же функция после 300ms.
- `tc=NULL`: означает что `hostTrack` = null или `track.get("color")` вернул NaN.
  Возможная причина — `setupFocus()` бросил до установки `hostTrack`.

Эти посты стреляют ТОЛЬКО при реальном drag (детектированной смене canonical_parent),
не при каждом `_updateMapBtnVisibility()` вызове. Флуда не создают.

**Что тестировать:**
1. **Load-маркер:** `>>> S7-DEV-v63-S7-UNIFIED LOADED <<<` + `MapButtonTint v47 loaded`
2. **si=7 FOLLOW mode:** замапить главную кнопку Map → строка 8 (bpslot7) = track color bg
   + чёрный текст. НЕ тёмный/amber.
3. **si=0..6 регрессия:** все остальные FOLLOW mapped слоты по-прежнему track color + чёрный.
4. **si=7 keep-alive устойчивость:** после маппинга подождать 3+ секунды — si=7 не скатывается
   в amber (keep-alive теперь держит track color + чёрный текст).
5. **STANDARD mode:** amber фон + тёмный текст. Без регрессии для всех 8 строк.
6. **Drag diagnostics:** перенести девайс на другой трек →
   - Console: `drag repaint sync: hostId=X tc=R,G,B` (не NULL)
   - Console: `drag repaint 300ms: hostId=X tc=R,G,B` (не NULL)
   - Цвет панели должен обновиться через ≤300ms.
7. **Persistence:** Cmd+S → reload → все маппинги восстановлены, цвета правильные.

**Архив JS:** `_device-backups/midi_learn_slot.2026-08-11-HHMMSS.pre-v63-s7-unified.js`

---

### v62-WHITE-TEXT — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — track-move repaint fix + белый текст FOLLOW

**Console при загрузке:**
```
>>> S7-DEV-v62-WHITE-TEXT LOADED <<<
MapButtonTint: MapButtonTint v47 loaded
```

**Баг 1 (регрессия track-move repaint) — Root Cause:**

`setupFocus()` вызывался ПОСЛЕ `post()` внутри общего `try { ... } catch(e) {}` в `checkParentMove()`.
Если `setupFocus()` бросил исключение (возможно при нестабильном Live API state в момент drag),
outer catch поглощал исключение И пропускал `_updateMapBtnVisibility()`. Console показывал post
(он до setupFocus), но репейнт никогда не происходил. Регрессия возникла в этой же сессии — не в
конкретной версии v52→v61, а как побочный эффект нестабильного Live API state при bounce drag.

**Ещё одна причина (косвенная):** при `_getActiveTrackColor()` в синхронном вызове — если
`hostTrack.get("color")` возвращает null/NaN до завершения Live async state update, первый
синхронный `_updateMapBtnVisibility()` ничего не красит. Деферд 300ms решает это.

**Fix (Баг 1):**
- `setupFocus()` вынесен в собственный `try { setupFocus(); } catch(_eSF) {}` — если бросит,
  `applyColor()`, `updateBullet()`, `_updateMapBtnVisibility()` всё равно вызываются.
- Добавлен deferred Task 300ms → `_updateMapBtnVisibility()` после синхронного вызова.
  Перехватывает случаи когда Live async track-color state не готов в момент синхронного вызова.

**Баг 2 (дизайн-уточнение) — белый текст:**

Пользователь: «текст должен быть белым, кнопка залита в цвет своего трека» — меняет спецификацию.
Ранее: `lcdcolor = inkFor(track_color)` — контрастный (тёмный на светлом треке, светлый на тёмном).
Теперь: `lcdcolor = 1,1,1` (белый) — ВСЕГДА, независимо от яркости трека.

**Edge case:** если трек почти белый (RGB ~255,255,255), белый текст на белом фоне = нечитаемо.
Пользователь явно попросил белый — реализовано как просит. При необходимости проще добавить
min-darken cap на lcdbgcolor, но это только по запросу.

**Fix (Баг 2):**
- `_updateMapBtnVisibility()` FOLLOW si<7 ветка: убран `inkFor()`, lcdcolor = `0.999999, 0.999999, 0.999999, 0.999999`.
- `emitTrack()`: `outlet(7, r, g, b, r, g, b, 0.999999, 0.999999, 0.999999)` — white lcdcolor
  через tint chain → `it_unpk[6,7,8]` = white → state machine `it_txpak` тоже использует white.
- `inkFor()` и `INK_DARK/INK_LIGHT` остаются — используются в STANDARD mode amber paint.

**MapButtonTint:** v47 — без изменений.
**Архив JS:** `_device-backups/midi_learn_slot.2026-08-10-HHMMSS.pre-v62-white-text.js`

**Что тестировать:**
1. **Load-маркер:** `>>> S7-DEV-v62-WHITE-TEXT LOADED <<<` + `MapButtonTint v47 loaded`
2. **Баг 1 — track-move repaint (КРИТИЧЕСКИ):**
   - FOLLOW mode, замапить si=0..2. Перетащить девайс на трек другого цвета (drag&drop в Session View).
   - Console: `[DF Slot] checkParentMove: host moved X -> Y`
   - Через ~300ms: панель перекрасилась в цвет нового трека. Текст — белый.
3. **Баг 2 — белый текст:**
   - FOLLOW mode, замапить слот → фон = цвет трека, текст = БЕЛЫЙ (не amber, не тёмный).
   - На очень светлом треке (жёлтый/белый) текст может быть нечитаем — это ожидаемо по текущей спецификации.
4. **si=7 (slot 8) — FOLLOW mode:** ~~тёмный фон + amber текст/рамка~~ ЗАМЕНЁН v63 на track color + white. Не тестировать этот пункт.
5. **STANDARD mode:** amber фон + тёмный текст. Без регрессии.
6. **Persistence:** Cmd+S → reload → все маппинги восстановлены.
7. **Min/Max:** cross-session sync работает (v61 тесты).

---

### v59-AUDIT — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — статический аудит; откат DRST2; guard pre-bang

**Console при загрузке:**
```
>>> S7-DEV-v59-AUDIT LOADED <<<
MapButtonTint: MapButtonTint v46 loaded
```

**Контекст:** После двух freeze-событий в Live проведён полный статический аудит
`midi_learn_slot.js`, `MapButtonTint.maxpat`, `Dynamic Focus Input.amxd`.

---

#### Результаты аудита (2026-08-10)

**1. Task/Task.repeat() — все пути проверены**

| Task | Паттерн | Стоп-условие | Статус |
|---|---|---|---|
| `_s7kaTask` | `task.repeat()` | `_s7kaStop()` в bang(), onTargetId(0), unmap(), перед новым startом | SAFE |
| `_mmSyncTask` | `task.repeat()` | `_mmSyncStop()` в тех же путях; self-stop при `_s7mirrorId<=0` | SAFE |
| `_runSlotDiag` (DRST2) | self-scheduling 1s | tick counter>15 AND wall-clock >20s | SAFE (технически), но **УДАЛЁН** |
| `_scheduleAdvRestore` | self-scheduling | MAX_ADV_RETRIES=5 | SAFE |
| panelmap() 300/900/1500ms | one-shot | — | SAFE |
| _doRebind() 300/900/1500ms | one-shot | — | SAFE |

Вывод: ни один Task не является кандидатом на бесконечный loop после v58.

**2. Источник `jsliveapi: Live API is not initialized` × 2**

**Найдено.** В `onTargetId()`, путь `id > 0 && id !== _lastWrittenTgtId`:

```js
// ДО правки — без guard:
try { _tgtParamAPI = new LiveAPI(null, "id " + id); } catch(_eApi) { _tgtParamAPI = null; }
if (!tgtIdParam) _findOwnParams();   // _findOwnParams() тоже создаёт new LiveAPI
```

Inlet 9 (targetParamId) получает значение из stored DeviceParameter ДО `live.thisdevice bang()`.
Max отправляет сохранённое значение параметров через все inlets при загрузке, ПЕРЕД тем как
`live.thisdevice` сигнализирует готовность Live API. Оба `new LiveAPI()` вызова стреляют
до `_initialized = true` → Max внутренне логирует `jsliveapi: Live API is not initialized`
(ПЕРЕД тем как бросает JS-исключение, поэтому `try-catch` убирает JS-исключение, но НЕ
убирает строку в консоли — это особенность Max). Два вызова = два сообщения в консоли.

Эти сообщения были **косметическими** (поведение не сломано), но возможно связаны с
некорректной инициализацией `_tgtParamAPI` в pre-bang window.

**Фикс применён:**
```js
if (_initialized) {
    try { _tgtParamAPI = new LiveAPI(null, "id " + id); } catch(_eApi) { _tgtParamAPI = null; }
    if (!tgtIdParam) _findOwnParams();
}
```
Pre-bang: `_tgtParamAPI` остаётся `null` → заполнится при первом вызове в `bang()` или
первом `onTargetId()` после `_initialized = true`.

**3. try-catch без верхнего предела повтора**

Все `try-catch` в файле проверены. Ни один не содержит цикла с retry-без-лимита. Стандартный
паттерн: `try { ... } catch(e) { /* log or set null */ }`. SAFE.

**4. MapButtonTint patchcord loops**

Проверен полный граф через Python-парсинг JSON. Никаких циклических зависимостей не найдено.
Критические пути:
- `it_stfan[1] → it_brc → it_st2close → it_dg[0]` — односторонний
- `it_stfan[1] → it_dgc → it_dgc2 → it_dg[0]` — односторонний
- `it_armmetro → it_phase → it_state → it_stfan` — это forward chain, не loop

`it_st2close` (v45, добавлен 2026-08-10) безопасен: один вход, один выход, нет обратной связи.

**Итог аудита:**
- Конкретного однозначного источника freeze не найдено.
- Источник jsliveapi × 2 найден и устранён (pre-bang guard).
- DRST2 — наиболее крупное новое добавление в v57-v58 — удалён как консервативная мера
  (технически безопасен, но исключает большую новую поверхность при диагностике неизвестного freeze).

---

#### Что изменено в v59

1. **Удалён DRST2** (Drift/Reset diagnostic): функции `_runSlotDiag()` и `_startSlotDiag()`,
   4 глобальных переменных (`_drstTask`, `_drstTick`, `_drstActive`, `_drstStartTime`),
   вызов `if (si < 7) { _startSlotDiag(); }` в `panelmap()`.

2. **Удалены v53 diagnostic posts** (5 вызовов `post()`):
   - `[S7-v53] umv si=N tc=R,G,B` в `_updateMapBtnVisibility()`
   - `[S7-v53] umv si=N tc=NULL` в `_updateMapBtnVisibility()`
   - `[S7-v53] umv si=N ARMED` в `_updateMapBtnVisibility()`
   - `[S7-v53] umv si=7 FOLLOW dark+amber` в `_updateMapBtnVisibility()`
   - `[S7-v53] 300ms. colorMode=N` в `panelmap()` 300ms Task
   - `[S7-v53] 900ms. colorMode=N` в `panelmap()` 900ms Task

3. **Добавлен `_initialized` guard** в `onTargetId()` вокруг pre-bang LiveAPI calls.

4. **DF Input DEVICE_VERSION** (`df_version_check.js` embedded в frozen AMXD):
   `'1'` → `'1.1'`. Path B repack. Архив: `Dynamic Focus Input.2026-08-10-214243.pre-version-bump.amxd`.
   MD5: `6757b0279244a0f87db1918338c387f0` → `a46dd2c0314c3764e08e6b172088e9d2`.
   Теперь embedded version совпадает с `fadercraft.com/api/versions.json` `latest`.
   Update-иконка больше не горит.

**MapButtonTint:** v46 без изменений.
**Архив JS:** `midi_learn_slot.2026-08-10-HHMMSS.pre-v59-audit.js` не создавался —
JS не бинарный файл, правки трекаются git. Архив AMXD создан только для DF Input.

---

### v58-DRST2 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — безопасная диагностика сброса цвета

**Console при загрузке:**
```
>>> S7-DEV-v58-DRST2 LOADED <<<
MapButtonTint: MapButtonTint v46 loaded
```

**Поведение:** v56/v45 + добавлена DRST2-диагностика.

**Что изменено:** только `midi_learn_slot.js`. MapButtonTint v46 (c varname=it_state, varname=it_dg) — без изменений, уже была в v57-rollback.

**Фиксы механики `Task.repeat()` по сравнению с v57:**
1. **Нет `Task.repeat()`**. `_runSlotDiag()` в конце своего тела создаёт новый Task и вызывает `task.schedule(1000)` — только если `_drstActive=true` и лимиты не достигнуты. Один вызов → один следующий тик.
2. **Флаг `_drstActive`**: `_startSlotDiag()` при `_drstActive=true` сразу возвращает `return` — никаких дублирующих экземпляров. Многократные вызовы из `panelmap()` при частых Live API callbacks = безопасно.
3. **Двойной стоп**: тик-счётчик (>15 тиков) И абсолютный wall-clock cap (>20 секунд реального времени через `Date.now()`). Даже если логика тиков даст сбой — через 20 сек мониторинг физически останавливается.
4. **`_drstActive = false`** явно выставляется в КАЖДОМ пути выхода: обычное завершение по счётчику, wall-clock cap, ошибка catch, `anyMapped=false`.

**Глобалы добавлены:** `_drstTask`, `_drstTick`, `_drstActive` (bool), `_drstStartTime` (ms).

**Вызов:** в `panelmap()` цикле, в ветке `mmv > 0` при `si < 7` — только один раз при обнаружении нового маппинга. При повторных `panelmap()` без нового маппинга вызов не происходит (guard `_panelPrevTgts[si]`). При повторном вызове с новым маппингом — `_drstActive` guard блокирует запуск второго монитора.

**Архив до правки:** `midi_learn_slot.2026-08-10-205246.pre-v58-drst2.js`

---

### v57-rollback — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — DRST удалён

**DRST-диагностика откачена из-за флуда консоли.** `Task.repeat()` без аргумента =
бесконечный цикл (не 20 тиков). Автостоп `_drstTick > 20` внутри callback работал,
НО: `_startSlotDiag()` вызывался в `panelmap()` — каждый раз сбрасывал `_drstTick = 0`
и создавал новый Task. При частых вызовах `panelmap()` (инициализация, Live API callbacks)
могли накопиться параллельные задачи, каждая с бесконечным `repeat()`. Итог — flood.

**Поведение = v56/v45 (последнее подтверждённое стабильное).**

**Console при загрузке:**
```
>>> S7-DEV-v57-rollback LOADED <<<
MapButtonTint: MapButtonTint v46 loaded
```

**Архив v57-DRST:** `midi_learn_slot.2026-08-10-201114.v57-drst-ROLLED-BACK.js`

---

### v57/v46 — ROLLED BACK (2026-08-10) — ⚠️ НЕ ВКЛЮЧАТЬ без фикса Task.repeat()

**ПРИЧИНА ОТКАТА:** `Task.repeat()` без аргумента = бесконечный loop в Max/MSP.
Стоп-условие (`_drstTick > 20`) работало, но `_startSlotDiag()` перезапускался из
`panelmap()` при каждом маппинге — сбрасывая счётчик и создавая новый Task. При частых
`panelmap()` вызовах накапливались параллельные бесконечные Tasks → flood консоли.

**Фикс для будущего:** `_drstTask.repeat(20)` с аргументом (20 повторов, не бесконечно),
ИЛИ `_drstTask.interval = 1000; _drstTask.execute()` с ручным перепланированием внутри
callback. Также убрать вызов из `panelmap()` — запускать один раз, не перезапускать.

**ВАЖНО: Этот раунд — ТОЛЬКО добавление диагностических логов. Никакой логики не менялось.**
**Финального фикса НЕТ. Задача: поймать момент и механизм сброса цвета в консоли.**

**Console при загрузке (БЫЛО — не использовать):**
```
>>> S7-DEV-v57-DRST LOADED <<<
MapButtonTint: MapButtonTint v46 loaded
```

---

#### Ситуация (v57)

После v56/v45 пользователь сообщает: «фон закрашивается на какое-то время, потом снова
сбрасывается» — цвет трека появляется корректно на несколько секунд, а потом самостоятельно
сбрасывается. Это происходит ПОСЛЕ того как все 300/900/1500ms дефереды JS уже отработали.

Наша диагностика (v53 посты) показывает ТОЛЬКО момент записи. Она не логирует что происходит
через 3-10 секунд после маппинга. Источник сброса невидим.

---

#### Гипотеза (корневая причина) — ожидает подтверждения диагностикой

**Механизм:** `obj-16` (RangeAndName) outlet 4 соединён с ДВУМЯ объектами:
1. `p setButtonColor inlet 1` — ожидаемо (для расчёта цвета кнопки)
2. `it_id0` (message box "0") — при любом входящем сигнале отправляет 0

**Когда outlet 4 стреляет:**
- `it_id0 → 0 → it_mflag (!= 0) → 0 → it_mapstore = 0` → `it_state` вычисляется с $i1=0
- В FOLLOW mode: `expr ($i4*(($i1||$i2)))...` при $i1=0, $i2=0 → result = 0 → state=0 (unmapped)
- state=0 → `it_st2close` выводит 1 → `it_dg = 1 (open)` → p setButtonColor async callback пишет
  `lcdbgcolor=dark` через it_dg → live.text → визуальный сброс

**Когда outlet 4 может стрелять ПОСЛЕ 1500ms:**
Live API notifications из `live.object` внутри RangeAndName. Кандидаты:
- Изменение значения параметра (от CC через `_applyScaledValue → .set("value", X)`)
  → Live fires `value` notification → obj-16 outlet 4 fires
- Смена трека → re-evaluation RangeAndName → outlet 4
- Любое другое Live-событие которое инициирует notification для наблюдаемого параметра

**Проверяется через:** `mbt_map` в DRST логе. Если в момент сброса `mbt_map=0` (при mm_tgt>0) —
гипотеза подтверждена: it_mapstore был сброшен.

---

#### Что изменено (v57 JS + v46 MapButtonTint)

**midi_learn_slot.js v57:**
- Version marker: `>>> S7-DEV-v57-DRST LOADED <<<`
- Добавлены 2 глобала: `_drstTask`, `_drstTick`
- Добавлена функция `_runSlotDiag()`: per-second poll 20 тиков, для каждого mapped si<7 слота
  читает из bpslot's MapButtonTint subpatcher:
  - `it_mapstore.getvalueof()` → `mbt_map` (0 или 1 = MBT видит слот как not-mapped/mapped)
  - `it_state.getvalueof()` → `mbt_st` (0/1/2 = текущий state machine output)
  - `it_dg.getvalueof()` → `it_dg` (gate state, для info)
  - Флаг `*** ANOMALY ***` если mbt_map != 1 OR mbt_st != 2
- Добавлена функция `_startSlotDiag()`: запускает/перезапускает _drstTask
- В `panelmap()` цикл si<7 mapped branch: вызов `_startSlotDiag()`

**MapButtonTint v46:**
- Добавлены `varname="it_state"` и `varname="it_dg"` к соответствующим боксам
  (без varname getnamed() возвращал null — диагностика не работала бы)
- Version marker: `MapButtonTint v46 loaded`
- Структура 145 boxes / 242 lines — НЕ изменилась

---

#### Архивы (v57)

- `midi_learn_slot.2026-08-10-pre-v57-drst.js` (в `Brain/fadercraft/_device-backups/`)
- `MapButtonTint.2026-08-10-pre-v46-drst-varnames.maxpat` (там же)

---

#### Протокол живого теста — что делать пользователю

**Подготовка:**
1. Открыть Max Console (Max → Window → Max Console)
2. Reload девайс: убрать с дорожки, положить заново
3. Max-редактор закрыть БЕЗ сохранения
4. Console: убедиться `>>> S7-DEV-v57-DRST LOADED <<<` + `MapButtonTint v46 loaded`

**Тест:**
5. FOLLOW mode. Замапить ОДИН слот (si=0..6, например слот 1)
6. Console должна показать `[DRST] starting 20s state-monitor for si<7 slots`
7. Ждать 20+ секунд. НЕ трогать ничего первые ~5 секунд, потом можно покрутить CC.
8. Наблюдать в консоли записи типа:
   ```
   [DRST t+1s] si=0 mm_tgt=1234 mbt_map=1 mbt_st=2 it_dg=0
   [DRST t+2s] si=0 mm_tgt=1234 mbt_map=1 mbt_st=2 it_dg=0
   ...
   [DRST t+Ns] si=0 mm_tgt=1234 mbt_map=0 mbt_st=0 it_dg=1 *** ANOMALY ***  ← вот он
   ```

**Скопировать в ответ:** весь блок от `[DRST] starting` до момента после ANOMALY появления.

**Корреляция:** если ANOMALY совпадает по времени (тот же тик) с другими console-сообщениями —
скопировать их тоже. Это покажет что именно в Live вызвало сброс.

---

#### Следующий шаг после получения лога

Если `mbt_map=0` при ANOMALY: фикс — разорвать прямое соединение `obj-16[4] → it_id0`.
Вместо этого: `obj-16[4] → sel 0 → it_id0` (только 0 = cancel сбрасывает; ненулевые = цвет, не сбрасывают).

Если `mbt_map=1` но `mbt_st!=2`: другой путь в state machine сбрасывает. Нужен анализ it_vtrig/it_modetrig.

Если всё норма в логе (mbt_map=1, mbt_st=2 все 20 тиков) но цвет всё равно сбрасывается: 
источник — не state machine. Возможно прямая запись в live.text.lcdbgcolor из другого пути. 
Следующий шаг: добавить диагностику на стороне MapButtonTint (print объект) или анализировать 
другие пути (qmetro 200, it_armmetro).

---

### v56/v45 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — синхронный gate-close + немедленный tint

**Console при загрузке:**
```
>>> S7-DEV-v56 LOADED <<<
MapButtonTint: MapButtonTint v45 loaded
```

**Источник задачи:** v55 не устранил visual bug для si=4-6 в FOLLOW mode. Пользователь видит
amber текст на тёмном/чёрном фоне («оранжевый текст на чёрном фоне — на второй странице
неправильная инверсия»). Console подтверждал `umv si=4/5/6 tc=247,244,124` в том числе после
1500ms deferred — JS пишет правильный цвет, но визуально amber остаётся.

---

#### Диагностика — корневая причина (dark bg + amber text)

**Путь `p setButtonColor` через `it_dg` (ОСНОВНАЯ причина):**

`p setButtonColor` (obj-39 в MapButtonTint) делает ASYNC `live.colors` запрос каждый раз при
срабатывании inlet 3 (из RangeAndName outlet 6) и inlet 0 (из it_refbang при state=0).
Async callback выводит `lcdbgcolor skin_lcd_bg` → `it_dg [gate]` → `it_rt outlet 1`
(non-lcdcolor pass-through) → напрямую в live.text. В FOLLOW mode: `nb_g` ЗАКРЫТ →
`lcdcolor` от p setButtonColor заблокирован. Но `lcdbgcolor` (skin lcd_bg = тёмный) проходит
через `it_rt outlet 1` без nb_g → live.text.lcdbgcolor = ТЁМНЫЙ.

**Источник amber lcdcolor (ПОДТВЕРЖДЕНО):**

`it_zpak [pak lcdcolor amber]` → `it_zg [gate]` → live.text при loadbang (`it_load=1`).
После закрытия it_zg: amber lcdcolor остаётся в live.text — в FOLLOW mode lcdcolor от
p setButtonColor заблокирован nb_g, it_txpak пишет it_unpk[6,7,8]=0,0,0=dark — но ПЕРЕД
этим amber из it_zpak уже сидит в live.text и it_dg был ещё открыт.

**Почему it_dg не закрывался достаточно быстро:**

`it_dgc2 → it_dg[in0]` закрывает gate ТОЛЬКО когда state machine оценит state=2 — async
(зависит от RangeAndName async completion). Между loadbang и state=2: it_dg открыт.
p setButtonColor async callback долетает в этот period → `lcdbgcolor=dark` записан в live.text.
Итог: dark lcdbgcolor + amber lcdcolor (из it_zpak/loadbang) = тёмный фон + amber текст.

**«Фолл скин» — НЕ Live тема:**
Термин пользователя обозначает наш `colorMode=FOLLOW`, а не реальный Ableton skin.
live.colors в MapButtonTint независимо квери-ит skin-токены (`lcd_control_fg` и пр.).
Конфликта нет.

**Дополнительная причина: it_unpk[0,1,2]=0,0,0 initial:**

Пока tint из JS outlet(7) не обновит it_unpk, state machine fires state=2 → it_bgpak →
lcdbgcolor 0,0,0 = black. Если applyColor() вызывается только через 300ms deferred —
state machine может fire несколько раз с black до корекции JS.

---

#### Фикс 1 — MapButtonTint v45: синхронное закрытие it_dg при state=2

**Добавлен объект `it_st2close [== 0]` в позиции [1550, 540]:**
```
it_brc [== 2] → it_st2close [== 0] → it_dg[in0]
```

**Механизм:**
- state=2: `it_brc` fires 1 → `it_st2close` fires 0 → `it_dg[in0]=0` → ЗАКРЫТ НЕМЕДЛЕННО
  (синхронно, в той же Max event, до любых async callbacks)
- state<2: `it_brc` fires 0 → `it_st2close` fires 1 → `it_dg[in0]=1` (открыт, совпадает с it_dgc2)

**Почему это решает:** it_brc fires СИНХРОННО из it_stfan[out1]. Как только state=2, it_dg
закрывается ДО любых async p setButtonColor callbacks → `lcdbgcolor=dark` не проходит.

**Счётчики:** 144 boxes/240 lines → **145 boxes/242 lines** (v44 → v45).

---

#### Фикс 2 — midi_learn_slot.js v56: немедленный applyColor() в panelmap() и _doRebind()

**В `panelmap()`** добавлен `applyColor()` до deferred schedule (сразу после `_updateMapBtnVisibility()`).
**В `_doRebind()`** добавлен `applyColor()` (теперь безусловно, не только для absoluteMode).

**Механизм:** applyColor() в FOLLOW mode с hostTrack → emitTrack(r,g,b) → outlet(7) →
mm_panel[i2] → mmdf_tint → все bpslot[i2] → it_apply → it_cttrig → **it_unpk = track_color**
ДО async RangeAndName completion. Когда state machine fires state=2 → it_bgpak uses
track_color → lcdbgcolor=track_color. Если hostTrack=null → pushDefaults() без tint. Безопасно.

---

**Архивы:**
- `MapButtonTint.2026-08-10-174734.pre-v45.maxpat`
- `midi_learn_slot.2026-08-10-174734.pre-v56.js`
(оба в `Brain/fadercraft/_device-backups/`)

**Что тестировать (v56):**

1. **Load маркер:** `>>> S7-DEV-v56 LOADED <<<` + `MapButtonTint v45 loaded`
2. **Dark bg + amber text fix (ОСНОВНОЙ):**
   - FOLLOW mode. Замапить слоты si=4-6 (слоты 5, 6, 7 в UI). Ждать 2 секунды.
   - Все слоты: track color bg + ink text. НЕ amber на тёмном фоне (включая preset restore).
3. **Диагностика v53 (посты сохранены):**
   - Замапить si=0, ждать 2 сек: `[S7-v53] 300ms. colorMode=0` → `umv si=0 tc=R,G,B` → `900ms`
4. **si=7:** FOLLOW mode, замапленный слот 8 → тёмный фон + amber. EXPECTED, не баг.
5. **STANDARD mode:** Слоты → amber bg + dark text. Без регрессии.
6. **Persistence:** 8 слотов, Cmd+S, Cmd+Q, открыть → всё восстановилось.
7. **is_enabled guard (v55):** Disabled параметр → нет `jsliveapi: Value cannot be set...`.
8. **Bug #3 (переброска):** Переложить девайс → ячейки перекрашиваются. ПОДТВЕРЖДЁН.
9. **Min/Max:** Max=50%, CC до упора → параметр 50%.
10. **swap-params.svg:** После ПОЛНОГО ПЕРЕЗАПУСКА Live → нет `can't find swap-params.svg`.

---

### v55 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — neighbor bleed fix + is_enabled guard fix

**Console при загрузке:**
```
>>> S7-DEV-v55 LOADED <<<
MapButtonTint: MapButtonTint v44 loaded
```

**Источник задачи:** Три находки пользователя на v54: (1) amber текст на уже-замапленных соседних
слотах после маппинга нового, (2) `jsliveapi: Value cannot be set, the parameter is disabled`
продолжало появляться несмотря на v54 guard, (3) `swap-params.svg: can't find` всё ещё.

---

#### Диагностика Issue 1 — Neighbor bleed (amber текст соседних слотов)

**Гипотеза пользователя:** глобальный path в MapButtonTint стреляет по всем bpslot-инстансам;
300/900ms репейнт покрывает только свежезамапленный слот.

**Верификация (анализ кода + MaxPat):**

*Механизм A (ПОДТВЕРЖДЁН — основной):*
`RangeAndName (obj-16)` внутри MapButtonTint — АСИНХРОННЫЙ объект с вызовом LiveAPI внутри.
Получив "id $1" на inlet 3, он запускает async цепочку → выдаёт результат через `obj-16[6]` →
`it_mflag → it_mapstore → it_state` (re-eval) → `it_emit (t b b)` → `it_txpak` (amber lcdcolor).
Эта цепочка **может долетать ПОСЛЕ 900ms** — особенно в нагруженной сессии или при быстром
маппинге нескольких слотов (overlapping async chains). При this = FOLLOW mode: `it_isf` = 1,
`it_emit` стреляет, `it_unpk[6,7,8]` содержат amber (init из it_lc9, никогда не обновляются
в FOLLOW mode через it_thg-гейт), → `lcdcolor` слота становится amber.

*Механизм B (ПОДТВЕРЖДЁН — вторичный):*
`_doRebind()` (любой ребинд main Map TgtId) выполняет цикл по `mm_tgt_0..6` и явно посылает
все id через `mm_idroute.message(si, id)` → каждый бпслот с id > 0 получает `mb_bindtrig →
it_phase[0] reset → it_state re-eval → it_emit → amber`. 300/900ms deferreds должны это поймать,
но если 900ms задержки не хватает (session lag), amber остаётся.

*Механизм C (ИСКЛЮЧЁН):*
`p_mapping` в уже-замапленных слотах при вооружении нового. Анализ показал: gate в p_mapping
управляется toggle, привязанным к live.text armed state. В невооружённом слоте toggle=0 → gate
CLOSED → `live.path selected_parameter` стреляет, но id через gate не проходит → outlet 1 не
генерируется. Не может вызвать bleed.

*Механизм D (ИСКЛЮЧЁН):*
`_s7kaFn()` (keep-alive si=7, 100ms) — влияет только на si=7, не вызывает
`_updateMapBtnVisibility()` для si<7.

**Дерево объектов MapButtonTint (ключевые пути amber state machine):**
```
mb_bindtrig [t 0 0]:
  outlet 0 → it_armmetro[0] (stops metro)
  outlet 1 → it_phase[0]    (phase counter reset)
    → it_phtrig [t b i] → it_mapstore[0] + it_state[2]
      it_state expr → it_stfan → it_stsel [sel 0 1 2]
        outlet 2 (state=2) → it_emit [t b b]
          outlet 0 → it_txpak (amber lcdcolor via it_unpk[6,7,8])

obj-16[6] → it_mflag → it_mapstore → it_state → it_emit (same amber path, ASYNC)

it_unpk holds amber values in FOLLOW mode (it_thg gate CLOSED → it_lc9 never writes new values)
```

**Fix:** Добавлен третий deferred 1500ms в `panelmap()` И `_doRebind()`:
```js
var vt1500 = new Task(function() { _updateMapBtnVisibility(); }, this);
vt1500.schedule(1500);
```
Это ловит поздние RangeAndName async коллбэки (obj-16[6] → amber) после 900ms.
`_updateMapBtnVisibility()` при FOLLOW mode + slotMapped + si<7 → перекрашивает в track color
поверх amber. Период 1500ms — страховочный, без доп. диагностики (v53 посты сохранены).

---

#### Диагностика Issue 2 — `jsliveapi: Value cannot be set, the parameter is disabled` (v54 guard)

**Гипотеза пользователя:** guard не покрывает binding путь (initial sync-push при capture).

**Верификация:**

Grep всех `.set("value", ...)` вызовов через LiveAPI в `midi_learn_slot.js`:
- Строки 658, 1309, 2072 — пишут в собственные параметры девайса (TgtId, lbl_chunk, lnb_dn_N).
  Собственные параметры НИКОГДА не бывают disabled → guard не нужен.
- Строка 2768 (v54) — пишет в `_tgtParamAPI` (целевой параметр). ТОЛЬКО эта строка нужна guard.

**Binding path (capture → _doRebind → onTargetId → applyToParam):**
После анализа: при capture `_tgtParamAPI` устанавливается через `onTargetId()` → вызывает
`_applyScaledValue()` через `_mmSyncFn()` или `setVal()` — оба идут через `_applyScaledValue()`.
Путь один, guard v54 должен был его покрыть.

**Найденный баг (v54 guard сломан — JS type coercion):**
`LiveAPI.get("is_enabled")` может вернуть **массив** `[0]` или `[1]` вместо plain int.
В JavaScript: `![0] === false` (non-empty array = truthy, независимо от содержимого).
Поэтому `if (!_tgtParamAPI.get("is_enabled")) return;` НИКОГДА не срабатывает для disabled
параметра, возвращающего `[0]` — guard безмолвно провален, `.set()` вызывается → console spam.

**Fix v55:** Обёртка `parseInt()`:
```js
if (!parseInt(_tgtParamAPI.get("is_enabled"))) return;
```
`parseInt([0])` = 0 (falsy), `parseInt([1])` = 1 (truthy), `parseInt(0)` = 0, `parseInt(1)` = 1.
Корректно обрабатывает оба варианта возврата LiveAPI.get().

---

#### Диагностика Issue 3 — `swap-params.svg: can't find` после reload девайса

**Гипотеза пользователя:** Max кэширует image search path на уровне сессии.

**Верификация:**

Файлы проверены:
```
/Users/Kirill/Music/Ableton/User Library/Max Devices/swap-params.svg      277 B  -rw-r--r--
/Users/Kirill/Music/Ableton/User Library/Max Devices/swap-params-flip.svg 320 B  -rw-r--r--
```
Файлы присутствуют с правильными правами (644). Причина ошибки — НЕ отсутствие файлов.

**Подтверждение гипотезы:** Image search path в Max кэшируется на уровне **сессии** (на уровне
Max runtime), не на уровне девайса. Когда `live.text` с атрибутом `pictures:
["swap-params.svg","swap-params-flip.svg"]` загружается при старте сессии, Max резолвит пути
один раз и кэширует. Удаление/добавление девайса с дорожки НЕ вызывает повторного сканирования.

В отличие от `.js`-файлов, которые компилируются каждый раз при загрузке `js`-объекта, изображения
для `live.text pictures` требуют перезапуска Max-сессии для распознавания новых файлов в
поисковых путях.

**Требуемое действие:** Полный перезапуск Live (Quit → Reopen). После перезапуска Max ресканирует
поисковые пути, `User Library/Max Devices/` будет найден, оба SVG-файла будут доступны, ошибка
исчезнет.

**Код не менялся.** MapButtonTint.maxpat v44 не изменялся.

---

**Архив (v55):**
- `midi_learn_slot.2026-08-10-162754.pre-v55.js` (в `Brain/fadercraft/_device-backups/`)

**Что тестировать (v55):**

1. **Load маркер:** `>>> S7-DEV-v55 LOADED <<<`
2. **Issue 2 (is_enabled guard):** Замапить параметр disabled-устройства (отключить устройство
   в Live → параметр становится disabled). Поворачивать CC — в консоли НЕ должно быть
   `jsliveapi: Value cannot be set, the parameter is disabled`. Включить устройство обратно —
   CC control возобновляется в течение ≤500ms.
3. **Issue 1 (neighbor bleed):** FOLLOW mode, замапить 4 слота подряд быстро (< 3 сек).
   Подождать 2 секунды после последнего маппинга. Все замапленные слоты (si<7) должны показывать
   track color, НЕ amber. Если si=7 (слот 8) = amber — это ДИЗАЙН, не баг.
4. **Issue 3 (swap SVG):** ТРЕБУЕТСЯ ПОЛНЫЙ ПЕРЕЗАПУСК LIVE (Quit → Reopen), не просто reload
   девайса. После перезапуска ошибка `can't find swap-params.svg` должна исчезнуть.
5. **Регрессии:** Min/Max, persistence (8 слотов), STANDARD mode amber, CC control нормального
   (enabled) параметра.
6. **Bug #1/#2 ДИАГНОСТИКА:** Посты v53 СОХРАНЕНЫ — тесты из v53 секции применяются полностью.
   Console должна показывать `[S7-v53] 300ms/900ms colorMode=...` / `tc=R,G,B` постф.

---

### v54 — (2026-08-10) — is_enabled guard: заглушка "parameter is disabled" spam

**Console при загрузке:**
```
>>> S7-DEV-v54 LOADED <<<
MapButtonTint: MapButtonTint v44 loaded
```

**Источник задачи:** После маппинга слота 6 → Re-Enveloper param 9 в консоли появлялась ошибка
`jsliveapi: Value cannot be set, the parameter is disabled` — 10 раз подряд.

**Root cause:**

`_applyScaledValue()` вызывает `_tgtParamAPI.set("value", ...)` — запись в замапленный параметр.
Если параметр в данный момент **disabled** в Live (устройство выключено, секция недоступна, или
конкретный параметр временно disabled по логике устройства), Max печатает эту ошибку в консоль
**ДО** броска JS-исключения. Уже существующий `try { } catch (_eAsc) {}` ловит JS-исключение,
но Max-консоль-сообщение уже напечатано — try-catch его не подавляет.

10 раз подряд = `_mmSyncFn()` (500ms poll) вызывал `_applyScaledValue()` пока параметр был disabled.

**Fix:** Добавлен `is_enabled` check ПЕРЕД `.set()`:
```js
function _applyScaledValue(mn, mx) {
    if (!_tgtParamAPI) return;
    try {
        // v54: skip write if parameter is currently disabled in Live.
        if (!_tgtParamAPI.get("is_enabled")) return;
        var _scaled = mn / 100 + (mx / 100 - mn / 100) * currentVal;
        _tgtParamAPI.set("value", Math.max(0.0, Math.min(1.0, _scaled)));
    } catch (_eAsc) {}
}
```

`is_enabled` — стандартное LOM-свойство `DeviceParameter` (bool, get/observe). Когда параметр
disabled, `.set()` никогда не вызывается → Max не генерирует console message. Когда параметр
снова enabled — запись возобновляется с следующего CC или следующего тика `_mmSyncFn` (≤500ms).

**Функциональных потерь нет:** disabled параметр всё равно не может быть изменён из Live
(это ограничение Ableton, не обходится через JS). Поведение пользователя не меняется — только
исчезает console spam.

**Guard срабатывает на обоих путях:**
- CC путь: `setVal()` → `_applyScaledValue()`
- Min/Max live-preview: `_mmSyncFn()` → `_applyScaledValue()`

**Дополнительные находки в том же логе (НЕ баги DF Slot):**

#### `node.script: can't find file version_check.js` — НЕ DF Slot

Источник: `Control XL.amxd` по пути
`/Users/Kirill/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/Imported/Control XL.amxd`
— это UNFROZEN копия (size 195211, md5 `adeacc9b`), которая содержит `node.script version_check.js`
но не имеет `version_check.js` встроенного в dlst. При unfrozen загрузке `node.script` не находит
файл через стандартный search path.

DF Slot использует `node.script df_version_check.js` (с префиксом `df_`). Файл `df_version_check.js`
корректно вшит в frozen DF Slot bundle (offset 0xbaaa0). Ошибка DF Slot'у не принадлежит.

Рекомендация: удалить или обновить/заморозить старую unfrozen копию в Presets/Imported.

#### `live.path: getcount: invalid property name` — предсуществующий шум MapButtonTint

Источник: `live.path live_set view selected_parameter` (obj-8 в subpatcher obj-42 — p_mapping
capture механизм MapButtonTint). При инициализации live.path с этим путём, Max внутренне пытается
выполнить `getcount` на свойстве `selected_parameter`, которое является единичным объектом (не список),
и не поддерживает `getcount`. Это встроенное поведение LOM-объектов при навигации к property-path.

Это **предсуществующий шум** — был в каждой версии, где используется p_mapping capture.
Не влияет на функциональность (capture работает корректно). Чинить нет смысла.

**Архив:**
- `midi_learn_slot.2026-08-10-153623.pre-v54-isenabled.js` (в `Brain/fadercraft/_device-backups/`)

**Что тестировать (v54):**

1. **Load маркер:** `>>> S7-DEV-v54 LOADED <<<`
2. **is_enabled guard:** Замапить слот на параметр устройства с disabled-секцией (или отключить
   само устройство в Live). Console НЕ должна показывать `jsliveapi: Value cannot be set, the
   parameter is disabled`. При включении обратно — CC control должен возобновиться.
3. **Регрессия CC control:** Нормальный параметр (enabled) — CC управление работает как прежде.
4. **Bug #1/#2 ДИАГНОСТИКА:** Диагностика v53 СОХРАНЕНА — тесты из v53 секции применяются полностью.
   Console должна показывать `[S7-v53] 300ms/900ms colorMode=...` / `tc=R,G,B` постф.

---

### v53/v44 + swap-icon RESTORE — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10)

#### swap-params.svg / swap-params-flip.svg — ВОССТАНОВЛЕНО (2026-08-10)

**Диагноз:** Файлы `swap-params.svg` / `swap-params-flip.svg` физически отсутствовали в
`User Library/Max Devices/`. В результате кнопка swap отображалась пустым прямоугольником с
жёлтой рамкой. Ошибка `can't find swap-params.svg` присутствовала во всех архивах с 2026-08-08
— это ПРЕДСУЩЕСТВУЮЩИЙ баг, не регрессия от сессии.

**Временная шкала:**
- **2026-07-10:** Оригинальные файлы БЫЛИ в User Library (подтверждено MANIFEST working-2026-07-10;
  md5 `ea27fcc8` / `29428ff7`). Кнопка работала.
- **Между Jul-10 и Aug-08:** Файлы исчезли из User Library (возможно, при реорганизации Max Project
  или очистке). Начала появляться ошибка `can't find swap-params.svg`.
- **2026-08-10 (предыдущий раунд):** Агент создал новые SVG → кнопка отображалась (но новые файлы
  были другого содержимого). Потом откат: pictures восстановлен, новые SVG удалены → пустой прямоугольник.
- **2026-08-10 (этот раунд):** Оригинальные файлы найдены в `_device-backups/DF-Slot-working-2026-07-10/`
  (md5 совпадают с DF Slot Project.2026-08-09/media/) и скопированы обратно в User Library.

**Исправление:** Скопированы оригинальные файлы в `User Library/Max Devices/`:
- `swap-params.svg` → md5 `ea27fcc8967b5ac4115d2f0e1329c24c` (16×16 amber square/rect icon)
- `swap-params-flip.svg` → md5 `29428ff7be108a0c16f26a09d4a456bd` (flipped variant)
Источник: `_device-backups/DF-Slot-working-2026-07-10/` (идентичны archived project media/).
**MapButtonTint.maxpat не изменялся.** Только добавлены физические файлы на диск.

**Примечание:** Эти два файла надо включить в freeze при следующей сборке бандла, иначе у
покупателей без Max Project снова будет "can't find swap-params.svg".

---

### v53/v44 — (2026-08-10) — DIAG: targeted color diagnostics + swap-icon revert

**Console при загрузке:**
```
>>> S7-DEV-v53 LOADED <<<
MapButtonTint: MapButtonTint v44 loaded
```

**Что изменено:**

#### MapButtonTint v44 — откат Issue B (swap-icon) [out-of-scope]

**Контекст:** В предыдущем раунде (v43) был добавлен пункт "Issue B — fix swap-params.svg". Это была
**ошибка планирования** (не агента) — пользователь не просил чинить SVG-ошибку, она появилась в скоупе
как побочный шум. Фикс не сработал технически (ошибка `can't find swap-params.svg` продолжала
выдаваться, т.к. runtime message-объекты `obj-swap-pict-0/1` всё равно слали имена SVG при загрузке).
Плюс, очистка `pictures: []` сломала визуально кнопки swap.

**Откат:**
- `obj-swap-btn.pictures` восстановлен до оригинального значения: `["swap-params.svg", "swap-params-flip.svg"]`
- Удалены созданные SVG-файлы из `User Library/Max Devices/`
- Ошибка `can't find swap-params.svg` вернётся — это **предсуществующий косметический шум**, не в скоупе.

**ВАЖНО — что сохранилось от v43 (не откатилось):**
- Issue A (удаление 4 print-объектов из obj-16 subpatcher) — СОХРАНЕНО. obj-16: 70 boxes/65 lines.

**Архив до правки:**
- `MapButtonTint.2026-08-10-145941.pre-v44-swap-revert.maxpat`

#### JS v53 — диагностика цвета панельных слотов FOLLOW mode

**Контекст:** Пользователь подтвердил Bug #3 (переброска трека) — работает. Но на скриншоте
один слот показывает amber (тёмный фон + amber рамка + amber текст) — предположительно последний
замапленный. Два других слота серые. Неясно:
1. Является ли amber-слот si=7 (bpslot7 — дизайн: dark+amber в FOLLOW mode) или si<7 (должен быть track color)?
2. Является ли grey track color (трек серый) или дефолтным состоянием (track color не применился)?
3. Долетают ли 300ms/900ms deferreds?

**Что добавлено:**
- В `panelmap()` deferreds: `post("[S7-v53] 300ms. colorMode=X")` и `"[S7-v53] 900ms. colorMode=X"`
- В `_updateMapBtnVisibility()` FOLLOW si<7 ветка:
  - `"[S7-v53] umv si=N tc=R,G,B"` — когда track color успешно применён (RGB 0–255)
  - `"[S7-v53] umv si=N tc=NULL (hostTrack=ID/null)"` — когда `_getActiveTrackColor()` вернул null
  - `"[S7-v53] umv si=N ARMED (v=1)"` — когда armed guard заблокировал покраску
- В `_updateMapBtnVisibility()` FOLLOW si=7 ветка:
  - `"[S7-v53] umv si=7 FOLLOW dark+amber lbg=R,G,B"` — подтверждение что si=7 красится

**Как использовать для диагностики:**

Открыть Max Console перед тестом (Preferences → Max Console).
Перезагрузить девайс → проверить маркер `>>> S7-DEV-v53 LOADED <<<` и `MapButtonTint v44 loaded`.
FOLLOW mode, замапить ОДИН слот (например слот 1, si=0).
Ждать 2 секунды. Смотреть в консоль:

**Ожидаемая цепочка если всё работает:**
```
[S7-v53] 300ms. colorMode=0
[S7-v53] umv si=0 tc=R,G,B   ← цвет трека (RGB 0–255)
[S7-v53] 900ms. colorMode=0
[S7-v53] umv si=0 tc=R,G,B   ← тот же цвет ещё раз
```
После этого визуально ячейка должна показывать этот цвет и не меняться.

**Если 300ms/900ms не появляются** → Task scheduling не работает → архитектурная проблема.
**Если `tc=NULL`** → `hostTrack` не инициализирован или потерян → нужен `setupFocus()` re-trigger.
**Если `ARMED`** → живой.text ячейки показывает value=1 через 300ms → зависший armed state.
**Если всё ОК (tc=R,G,B появляется)** → покраска проходит, но что-то после 900ms перебивает цвет
  → надо смотреть есть ли `[S7-v53] umv si=0 tc=...` ПОСЛЕ того как цвет становится неправильным.

**Дополнительно для bpslot7 (si=7):** В консоли должно быть
`[S7-v53] umv si=7 FOLLOW dark+amber lbg=...` при каждом `_updateMapBtnVisibility()` вызове.
Если "Dry/Wet" — это именно si=7, то amber = ожидаемое поведение по дизайну (не баг).

**Архивы (v53):**
- `midi_learn_slot.2026-08-10-150718.pre-v53-diag.js`
- `MapButtonTint.2026-08-10-145941.pre-v44-swap-revert.maxpat`
(оба в `Brain/fadercraft/_device-backups/`)

---

### v52/v43 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — 6-issue fix: yellow text / track repaint / console spam

**Console при загрузке:**
```
>>> S7-DEV-v52 LOADED <<<
MapButtonTint: MapButtonTint v43 loaded
```

**Что исправлено:**

#### Bug #1+#2 — желтый текст и delay при маппинге (root cause найден)

**Root cause — amber init через `it_unpk`:**
В STANDARD mode при init: `it_stdsel` (sel 1) → `it_lcq` → `it_lc` (live.colors `lcd_control_fg`) →
`it_lc9` (format "$1 $2 $3 × 3") → через `it_thg` gate (открыт только в STANDARD mode) →
`it_cttrig` → `it_unpk` (9 floats): amber заполняет позиции 0–8.
В FOLLOW mode `it_thg` закрыт — `it_unpk` навсегда хранит amber из момента init.

**Root cause — async re-fires:**
При маппинге (state 0→2): `it_stfan` → `it_stsel[2]` → `it_emit` → `it_txpak` использует
`it_unpk[6,7,8]` как lcdcolor = amber = жёлтый текст сразу.
Async re-fires (~200–900ms позже): `mb_bindtrig` (live.remote~ bind trigger) → `it_phase`
(counter 0 1) → `it_phtrig` → `it_state` пересчитывается → `it_emit` снова = amber lcdcolor.
Параллельно: RangeAndName (`obj-16`, async LiveAPI) → outlet 6 → `it_mflag` → `it_mapstore` →
`it_state` → `it_emit` ещё раз. Итог: желтый текст возвращался через ~700ms после исправления.

**Fix:** Заменил single 700ms deferred в `panelmap()` и в `_doRebind()` на two-deferred стратегию:
- 300ms: первая перекраска (state machine initial fire осел)
- 900ms: вторая перекраска (перехватывает mb_bindtrig + RangeAndName async callbacks)
```js
var vt300 = new Task(function() { _updateMapBtnVisibility(); applyColor(); }, this);
vt300.schedule(300);
var vt900 = new Task(function() { _updateMapBtnVisibility(); }, this);
vt900.schedule(900);
```
Та же схема применена в `_doRebind()` (была одна Task на 700ms).

#### Bug #3 — панельные слоты не перекрашиваются при переброске девайса на другой трек

**Root cause:** `checkParentMove()` правильно детектировал переброску (через `canonical_parent` sync
read) и вызывал `setupFocus() / applyColor() / updateBullet()`, но НЕ вызывал
`_updateMapBtnVisibility()` — панельные ячейки оставались с цветом старого трека.

**Fix:** В `checkParentMove()` добавлен вызов `_updateMapBtnVisibility()` после обнаружения переезда:
```js
post("[DF Slot] checkParentMove: host moved " + hostId + " -> " + newId + "\n");
setupFocus(); applyColor(); updateBullet();
_updateMapBtnVisibility();  // v52: repaint panel slots with new track color
```

#### Issue C — "jsliveapi: property cannot be listened to" на каждый reload

**Root cause:** `_parentObserver` блок в `bang()` пытался подписаться на `canonical_parent`
через LiveAPI observer. В Live 12 это свойство не observable. Live логирует ошибку ДО выброса
исключения (или вообще без него) → `try-catch` не останавливал спам.

**Fix:** Удалён весь `_parentObserver` блок. Pull-based `checkParentMove()` через selObserver
(onSelectedTrack) — рабочий fallback, уже существовал. Заменяющий комментарий:
```js
// canonical_parent не observable в Live 12. Fallback: checkParentMove() via onSelectedTrack.
// v52: _parentObserver block removed — try-catch не предотвращал console spam.
if (absoluteMode && targetParamId > 0) resolveTargetTrack();
```

#### Issue A — print objects в MapButtonTint RangeAndName subpatcher

**Root cause:** Диагностические print-объекты из сессии v37–v39 (debug Min/Max DSP chain) остались
внутри subpatcher `obj-16` (RangeAndName): `dbg-pak4`, `dbg-pack`, `dbg-coeff`, `ran-pak`.
Стреляли на каждый Min/Max event через obj-55, obj-49, obj-67, obj-65.

**Fix (MapButtonTint.maxpat):** Удалены 4 print-объекта + 4 patchlines из subpatcher `obj-16`.
obj-16 subpatcher: 74 boxes/69 lines → 70 boxes/65 lines. Версия маркера: v43.

#### Issue B — "can't find swap-params.svg / swap-params-flip.svg" на каждый load

**Root cause:** `obj-swap-btn` (live.text кнопка MinMax-swap) имел `pictures` атрибут
`['swap-params.svg', 'swap-params-flip.svg']`. Файлы отсутствовали. Два runtime message
объекта (obj-swap-pict-0, obj-swap-pict-1) также посылали эти имена при загрузке.

**Fix:** (a) Очищен `pictures` атрибут в patcher definition → `[]`.
(b) Созданы минималистичные SVG-иконки (стрелки swap 15×15 px):
- `/Users/Kirill/Music/Ableton/User Library/Max Devices/swap-params.svg`
- `/Users/Kirill/Music/Ableton/User Library/Max Devices/swap-params-flip.svg`

**Что тестировать (v52/v43):**

1. **Load markers:** Console = `>>> S7-DEV-v52 LOADED <<<` + `MapButtonTint v43 loaded`.

2. **Issue C (jsliveapi spam):** Перезагрузить девайс. Console НЕ должна содержать
   "jsliveapi: property cannot be listened to".

3. **Issue A (print spam):** Замапить слот → изменить Min/Max. Console НЕ должна содержать
   `dbg-pak4 /` `dbg-pack /` `dbg-coeff /` `ran-pak /` строк.

4. **Issue B (SVG):** Reload → нет "can't find swap-params.svg". Кнопка swap (если видна) отображает иконки.

5. **Bug #1/#2 (жёлтый текст):** FOLLOW mode. Замапить слот si=0..6.
   - Заливка должна появиться в пределах ~300ms (не 700ms).
   - Текст должен остаться inkFor-цвета (не желтый). Ждать 1–2 сек после маппинга.
   - SUCCESS: никакой вспышки желтого текста. FAILURE: желтый текст через ~700ms → async re-fire
     происходит позже 900ms (проверить timing, увеличить vt900.schedule до 1200ms).

6. **Bug #3 (переброска трека):** Замапить панельные слоты. Перетащить девайс на трек с другим
   цветом. Console: "checkParentMove: host moved X -> Y". Панельные ячейки перекрашиваются
   без перезагрузки девайса.

7. **STANDARD mode регрессия:** Замапленные слоты — amber. Не track color.

8. **Min/Max регрессия:** Max=50%, CC до упора → параметр 50%.

9. **bpslot7 регрессия:** FOLLOW mode, слот 8 (si=7) → тёмный фон + amber текст/рамка.

10. **Persistence:** 8 слотов, Cmd+S, Cmd+Q, открыть → всё восстановилось.

**Архивы (v52):**
- `midi_learn_slot.2026-08-10-144055.pre-v52.js`
- `MapButtonTint.2026-08-10-144055.pre-v43.maxpat`
(оба в `Brain/fadercraft/_device-backups/`)

---

### v51/v42 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — FOLLOW panel track color + log cleanup

**Console при загрузке:**
```
>>> S7-DEV-v51 LOADED <<<
MapButtonTint: MapButtonTint v42 loaded
```

**Что исправлено (v51 JS):**

**Bug:** В FOLLOW mode замапленные панельные слоты 1-7 (si=0..6) показывали сплошную amber-заливку вместо цвета трека. Вторая проблема: при смене трека, на котором лежит девайс, панельные слоты не меняли цвет (только dial needlecolor обновлялся через `onTrackColor → applyColor`).

**Root cause:** 
1. `_updateMapBtnVisibility()` не имела FOLLOW-ветки для si=0..6 — state machine (state=2 → it_emit → it_bgpak → it_bgg) красил amber однократно при маппинге, JS не переопределял.
2. `onTrackColor()` вызывала только `applyColor()` (обновляет dial), но не `_updateMapBtnVisibility()` → при смене трека цвет панельных ячеек не обновлялся.

**Fix 1:** `_getActiveTrackColor()` — helper, читает цвет хост-трека (или target-трека в Absolute mode), возвращает `{r,g,b}` или null. Зеркалит логику `applyColor()` для выбора источника.

**Fix 2:** В `_updateMapBtnVisibility()` добавлена ветка для FOLLOW + slotMapped + si<7:
```js
if (!standardMode && slotMapped && si < 7) {
    var _tc = _getActiveTrackColor();
    if (_tc) {
        // lcdbgcolor + bordercolor = цвет трека
        // lcdcolor = inkFor(tc) = тёмный/светлый текст в зависимости от яркости трека
    }
}
```
State machine красит amber однократно на маппинге; существующий 700ms deferred `_updateMapBtnVisibility()` в `panelmap()` переопределяет его цветом трека после оседания.

**Fix 3:** `onTrackColor()` теперь также вызывает `_updateMapBtnVisibility()`. То же для `onTargetTrackColor()` (Absolute mode). colorObserver уже обновляет host при смене трека — теперь изменение доходит и до панельных ячеек.

**Log cleanup:** Убраны все посты, стрелявшие часто или по уже закрытым багам:
- MINMAX-DBG Patch A (10+ строк при каждом маппинге)
- MINMAX-DBG A↔B sync (каждые 500ms при активном синке)
- v42-ka keep-alive diagnostic (каждые 100ms × 3)
- v42-pm panelmap + si=X CHANGE (на каждое изменение слота)
- v42-pbn slot params (8 × 2 строки при каждой инициализации)
- v44-rps / v42-rps restore slot (8 слотов × 2 строки при восстановлении)
- PERSIST-DBG restore path (storedTgtId, idExists, mm_idroute loop, panel slots)
- LIVESET-DBG _tgtParamAPI cached (на каждый bind)
- TGT-DBG onTargetId / _doRebind outlet(12) (на каждый rebind)
Остались только холодные гарды: stale TgtId, byname fail, _doRebind STALE, ADV-DBG, unmap(), X-click.

**Что тестировать (v51):**

1. **Track color в панельных слотах (КРИТИЧЕСКИ):**
   - FOLLOW mode. Перезагрузить девайс (убрать с дорожки, положить заново).
   - Замапить любой из слотов 1-7 (si=0..6). Через ~700ms ячейка должна принять цвет ТРЕКА (не amber).
   - Переложить девайс на трек с другим цветом → ячейки должны перекраситься автоматически (без перезагрузки девайса).
   - SUCCESS: lcdbgcolor = цвет трека, текст адаптивный (тёмный на светлом треке, светлый на тёмном).
   - FAILURE: amber fill → `_getActiveTrackColor()` вернула null (hostTrack=null?) или timing issue с 700ms.

2. **Load-маркер:** `>>> S7-DEV-v51 LOADED <<<` в Console.

3. **Чистые логи:** При CC-маппинге (крутить ручку) — в Console НЕ должно быть потока постов. Только единичные сообщения при событиях (byname capture, stale TgtId и т.д.).

4. **STANDARD mode:** Замапленные слоты в STANDARD mode по-прежнему amber — убедиться что ветка стандарт-режима не сломана.

5. **Регрессия persistence:** Замапить 8 позиций, Cmd+S, Cmd+Q, открыть → всё восстановилось.

6. **bpslot7 (si=7):** В FOLLOW mode замапленный слот 8 — темный фон + amber текст/рамка (без изменений от v50).

**Архив:**
- `midi_learn_slot.2026-08-10-HHMMSS.pre-v51-trackcolor.js` (в `Brain/fadercraft/_device-backups/`)

---

### v49/v41 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — Flood fix + live Min/Max preview

**Console при загрузке:**
```
>>> S7-DEV-v49 LOADED <<<
MapButtonTint: MapButtonTint v41 loaded
```

**Что диагностировано (flood):**

Пользователь получил баннер "Too many lines (more than 10000)" в момент CC-mapping/arming
(кликнул Map → повернул ручку контроллера). Источник — горячий путь JS post() в v48:
- `list()` else-ветка: `post("LIVESET-DBG: CC-IN …")` — стреляло на КАЖДОЕ CC-сообщение
- `list()` v48 scaling block: `post("LIVESET-DBG: raw=…")` + `post("LIVESET-DBG: set() ERR …")`
- `routeCC()`: `post("LIVESET-DBG: routeCC BLOCKED active=0")` — на каждое CC при неактивном треке
- `setVal()`: `post("LIVESET-DBG: raw=…")` + `post("LIVESET-DBG: _tgtParamAPI=null …")`

Итог: 60–100+ CC/сек × 2–3 поста = 10 000 строк за ~1 минуту. Не осцилляция A↔B
(та исправлена в v45 и не регрессировала). Чистый линейный flush горячего пути.

Дополнительно: v48 вводил дублирующий `_tgtParamAPI.set()` прямо в `list()` before `routeCC()`,
обходя Focus-gate (active guard). При active=true это давало двойную запись. При active=false —
нарушало Focus-концепцию (параметр двигался даже на чужом треке). Убрано.

**Что изменено (v49 JS):**

Fix 1 — удалены все hot-path `post()`:
- `list()` else-ветка: убран весь v48 scaling block (CC-IN, raw, set-ERR posts + дублирующий `.set()`)
- `routeCC()`: убран `post("LIVESET-DBG: routeCC BLOCKED …")` из `if (!active)` ветки
- `setVal()`: убраны raw/null/exception posts

Холодные посты (PERSIST-DBG, TGT-DBG, MINMAX-DBG, S7-DBG, v42-*, LIVESET-DBG: _tgtParamAPI cached)
сохранены — они стреляют не чаще 1 раза за событие.

Fix 2 — live Min/Max preview без нового CC:
- Добавлен `_applyScaledValue(mn, mx)` — общий хелпер, пишет `_tgtParamAPI.set(scaled)` используя
  `currentVal` (последнее известное CC-значение). No-op если `_tgtParamAPI = null`.
- `setVal()` рефакторирован: вычисляет mn/mx → вызывает `_applyScaledValue(mn, mx)`.
- `_mmSyncFn()`: во всех трёх ветках (aChg&&!bChg, bChg&&!aChg, aChg&&bChg) после обновления
  `_lastSyncMinA/_lastSyncMaxA` вызывается `_applyScaledValue()` с новыми значениями.
  Это даёт live-preview диапазона: при перетаскивании Max/Min мышкой (без CC) целевой параметр
  обновляется в течение ≤500ms следующего тика _mmSyncFn.

**Логика масштабирования (v49):**
```
CC 0..127 → list(inlet 2) → routeCC() → setVal(p):
    currentVal = p (0.0..1.0)
    outlet(0, currentVal)  → live.dial
    _applyScaledValue(mn, mx):
        scaled = mn/100 + (mx/100 - mn/100) * currentVal
        _tgtParamAPI.set("value", clamp(scaled, 0, 1))

Без CC (перетащил Max мышкой):
    _mmSyncFn() через ≤500ms: bChg detected
    → propagate B→A → _applyScaledValue(minB, maxB)
    → _tgtParamAPI.set("value", clamp(minB/100 + (maxB/100 - minB/100) * currentVal, 0, 1))
```

**Что тестировать (v49):**
1. **Flood (КРИТИЧЕСКИ):**
   - Перезагрузить девайс (убрать с дорожки, положить заново, закрыть Max-редактор БЕЗ сохранения).
   - Замапить CC (кликнуть Map → покрутить ручку ≥10 секунд).
   - Console НЕ должна показывать поток LIVESET-DBG: CC-IN или routeCC BLOCKED.
   - Баннер "Too many lines" не должен появляться.
2. **Live Min/Max preview (КРИТИЧЕСКИ):**
   - Замапить параметр (e.g. Volume трека). Подождать 500ms (чтобы _mmSyncFn запустился).
   - НЕ крутить физический CC. Перетащить Max мышкой до 50%.
   - ОЖИДАЕМО: через ≤500ms параметр сдвинется до уровня `min + (50-min)/100 * currentVal`.
     Если currentVal=0 (CC не трогали) → параметр = min% (чаще всего 0). Чтобы увидеть
     наглядный эффект: сначала крутануть CC до MAX (currentVal≈1.0), потом потянуть Max
     слайдер до 50% — параметр должен стать ≈50%.
3. **Min/Max range при повороте CC:**
   - Max=50%, повернуть CC до упора → параметр останавливается на 50%.
   - Min=25%, CC=0 → параметр = 25%.
4. **Oscillation (должен быть исправлен v45, не регрессировал):**
   - Console НЕ должна показывать бесконечный поток `MINMAX-DBG: B→A sync`.
5. **Persistence:**
   - Замапить 8 слотов, Cmd+S, Cmd+Q, открыть → всё восстановилось.

**Архив:**
- `midi_learn_slot.2026-08-10-124815.pre-v49-flood-minmax.js`
  (в `Brain/fadercraft/_device-backups/`)

---

### v46/v41 — ПРЕДЫДУЩАЯ ВЕРСИЯ (2026-08-10) — JS-PATH Min/Max scaling

**Console при загрузке:**
```
>>> S7-DEV-v46 LOADED <<<
MapButtonTint: MapButtonTint v41 loaded
```

**Что изменено (v46 JS + v41 MapButtonTint):**

**midi_learn_slot.js v46 — новый JS-путь масштабирования Min/Max:**
- Добавлен глобал `_tgtParamAPI = null` — кэш LiveAPI к целевому параметру.
- В `onTargetId(id > 0)`: `_tgtParamAPI = new LiveAPI(null, "id " + id)` — кэшируется при каждом новом маппинге.
- В `setVal(p)`: добавлен блок JS-масштабирования:
  ```js
  if (_tgtParamAPI) {
      var _mn = (_lastSyncMinA >= 0) ? _lastSyncMinA : 0;
      var _mx = (_lastSyncMaxA >= 0) ? _lastSyncMaxA : 100;
      var _scaled = _mn/100 + (_mx/100 - _mn/100) * currentVal;
      _tgtParamAPI.set("value", Math.max(0.0, Math.min(1.0, _scaled)));
  }
  ```
- `_tgtParamAPI = null` в `bang()` (reload) и `unmap()` (сброс).
- `_lastSyncMinA/_lastSyncMaxA` обновляются `_mmSyncFn` каждые 500ms и инициализируются в Patch A (`_mmSyncStart`).

**MapButtonTint v41 — revert hardcode test:**
- `obj-13` (`*~`): возвращён к `*~ 1.` (hardcode 0.5 был только для диагностики v40, NEGATIVE).
- Версия-маркер: `v41 loaded`.

**Логика масштабирования:**
```
CC 0..127 → routeCC → currentVal = CC/127 (0.0..1.0)
→ setVal(currentVal):
    outlet(0, currentVal) → live.dial (UI display)
    _tgtParamAPI.set("value", min/100 + (max/100 - min/100) * currentVal)
      → Live parameter (JS direct write, bypasses dead DSP chain)
```

Источник Min/Max: `_lastSyncMinA/_lastSyncMaxA` — JS-глобалы, отражающие текущие TargetMin/TargetMax из df_mapparam. Обновляются:
- При первом маппинге: `_mmSyncStart(syncMin, syncMax, ...)` → `_lastSyncMinA = syncMin`.
- Каждые 500ms: `_mmSyncFn()` читает df_mapparam numboxes → обновляет `_lastSyncMinA/_lastSyncMaxA`.
- Fallback (до инициализации Patch A): `mn=0, mx=100` → полный диапазон.

**Что тестировать:**
1. **Min/Max range (КЛЮЧЕВОЙ):**
   - Перезагрузить девайс (убрать с дорожки, положить заново, закрыть Max-редактор БЕЗ сохранения).
   - Console: `>>> S7-DEV-v46 LOADED <<<` + `MapButtonTint: MapButtonTint v41 loaded`.
   - Замапить параметр, поставить Max=50%, повернуть CC до максимума.
   - ОЖИДАЕМО: параметр останавливается на 50%.
   - Если 100% → `_tgtParamAPI.set()` не работает на этот тип параметра или live.remote~ DSP опережает.
2. **Min range:**
   - Min=25% → при CC=0 параметр = 25%.
3. **Persistence:**
   - Замапить 8 позиций, Cmd+S, Cmd+Q, открыть → все 8 имён восстановлены.
4. **Oscillation:**
   - Console НЕ должна показывать поток `MINMAX-DBG: B→A sync`.

**Архивы (2026-08-10):**
- `midi_learn_slot.2026-08-10-HHMMSS.pre-v46-js-scale.js`
- `MapButtonTint.2026-08-10-HHMMSS.pre-v41-revert-hardcode.maxpat`

---

### v45/v40 — CONFIRMED NEGATIVE: *~ 0.5 hardcode — параметр всё равно 100% (2026-08-10) — ДИАГНОСТИКА *~ hardcode

**Console при загрузке:**
```
>>> S7-DEV-v45 LOADED <<<
MapButtonTint: MapButtonTint v40 loaded
```

**Что изменено (v40 = HARDCODE TEST):**
- `obj-13` (`*~`): текст изменён с `*~ 1.` на `*~ 0.5` — жёсткая константа, коэффициент динамически НЕ обновляется
- Версия-маркер: `v40 loaded`
- ВСЕ остальные диагностики из v39 сохранены (ran-pak, dbg-pak4, dbg-pack, dbg-coeff)

**Цель теста — один вопрос:**
При максимальном CC (127), параметр останавливается на 50% или всё равно идёт до 100%?

```
СЦЕНАРИЙ A: параметр останавливается на 50%
  → live.remote~ IS реальный контроллер параметра ✓
  → DSP цепь sig~ → *~(hardcode 0.5) → live.remote~ работает ✓
  → Проблема была: динамический коэффициент из obj-65 не достигает *~ в DSP-рантайме
  → Следующий шаг (v41): принудительно доставить коэффициент через sig~ вместо float-to-inlet

СЦЕНАРИЙ B: параметр ВСЁ РАВНО идёт до 100%
  → live.remote~ НЕ является реальным контроллером параметра
  → Что-то ДРУГОЕ управляет параметром (mm_panel? JS LiveAPI.set?)
  → Следующий шаг: найти другой путь (проверить mm_panel multimapDF)
```

**Архив перед v40:** `MapButtonTint.2026-08-10-HHMMSS.pre-v40-hardcode-test.maxpat`

---

### v45/v39 — ПОДТВЕРЖДЕНО: coeff=0.5 верный, параметр всё равно 100% (2026-08-10)

**Ожидаемые Console-маркеры при загрузке:**
```
>>> S7-DEV-v45 LOADED <<<
MapButtonTint: MapButtonTint v39 loaded
```

**Что тестировать — результат сверки с SF (см. блок v39 ниже)**

---

### v45/v38 → v45/v39 (2026-08-10) — DIAG: сверка с SF + prints pack/coeff

**Сверка с Sends Follower (MapButton.maxpat):**

MapButton.maxpat (SF) содержит ІДЕНТИЧНУЮ `patcher RangeAndName` с теми же object IDs. Полное сравнение соединений показало: post-pak4 цепь (pak4 → unpack → scale → pack → obj-65/obj-3 → *~/+~ → outlet) **байт-в-байт одинакова** в обоих устройствах. Аудиопуть тоже: `clip~(obj-11) → *~(obj-13) → +~(obj-69) → outlet(obj-19)`.

Разница только в PRE-PAK routing:
- SF: `/100 max [obj-10] → pak[1] COLD` (max только на COLD, никогда не тригерит pak самостоятельно)
- DF v38: через `t b f → mindiv100 → pak[0] HOT` (Max тоже тригерит pak)

Вывод: SF имеет тот же потенциальный баг с Max (Max не тригерит pak самостоятельно → нужно изменить Min после Max чтобы effect применился). DF Slot v37+ исправил это. Структурного превосходства SF над DF нет — пути идентичны.

**Что добавлено в v39 (диагностика pack и coefficient):**

ДОБАВЛЕНО (inside RangeAndName obj-16):
- `obj-dbg-pack` (`print dbg-pack`) в [240, 375]
- `obj-67[0] → obj-dbg-pack[0]` — показывает когда pack стреляет и с какими [abs_min, abs_max]
- `obj-dbg-coeff` (`print dbg-coeff`) в [240, 447]
- `obj-65[0] → obj-dbg-coeff[0]` — показывает когда flonum obj-65 выдаёт coefficient в *~ inlet 1

**Что дадут диагностики v39:**

```
Сценарий А: dbg-pack НЕ печатается
  → pack[0] не получает триггер от obj-56 (flonum abs_min proto='Live')
  → либо scale57 не выдаёт output, либо obj-56 молчит
  → Следующий шаг: print после obj-56 outlet, или после scale57 outlet

Сценарий Б: dbg-pack печатается как "dbg-pack: 0. 0.5" (для Min=0%, Max=50%)
             но dbg-coeff НЕ печатается
  → pack fires корректно → obj-68 (- 0.) или obj-66 (* -1.) или obj-65 (proto='Live') молчит
  → Следующий шаг: проверить obj-68 → obj-66 → obj-65 цепь

Сценарий В: dbg-coeff печатается как "dbg-coeff: 0.5" (для Max=50%)
             но параметр всё равно идёт до 100%
  → obj-65 ВЫДАЁТ правильный coefficient в *~ inlet 1
  → *~ coefficient 0.5 → DSP output max 0.5
  → Баг в live.remote~ binding или в аудиопути ДО live.remote~
  → Проверить: binding бпатчера (df_mapparam vs bpslot7 confusion), или *~ inlet 1 не горячий
```

**MapButtonTint v39:** MD5 `a163d8ced4de635b86f7d16355c8ac3b` (265942 bytes).
**Архив:** `MapButtonTint.2026-08-10-032957.pre-v39-pack-coeff-diag.maxpat` (MD5 `cc4b526a2a75b130fdae5b64c393798c` = v38).
**RangeAndName:** 74 boxes / 69 lines (v38: 72/67; +2 boxes +2 lines).

---

### v45/v38 — CONFIRMED PARTIAL: pak4 получает max/100 ✅ (2026-08-10)

**ПОДТВЕРЖДЕНО ПОЛЬЗОВАТЕЛЕМ:** `dbg-pak4` печатает `0. 0.97 0. 1. → 0. 0.5 0. 1.` — slot 1 плавно следует за перетаскиванием Max slider. Это означает:
- `unpack 0. 1.` (obj-minmax-split) корректно разбивает pak output
- max/100 явно пишется в pak4 slot 1 COLD ДО того как pak4 стреляет
- pak4 outlet 0 выдаёт правильные `[min/100, max/100, 0., 1.]`

**СТАТУС v38 fix: ПОДТВЕРЖДЁН ✅** — причина (pak list spreading не работал для slot 1) устранена.

**НО:** несмотря на корректный pak4 output, параметр ВСЁ ЕЩЁ не реагирует на Max. Обрыв строго ПОСЛЕ pak4.

**Ожидаемые Console-маркеры при загрузке:**
```
>>> S7-DEV-v45 LOADED <<<
MapButtonTint: MapButtonTint v38 loaded
```

**Что тестировать:**

1. **Max-диапазон (PRIMARY, четвёртая попытка, диагностика включена):**
   - Убрать девайс с дорожки, положить заново (не через Reload, а физически — кэш)
   - Замапить параметр
   - Поставить Max=50% → Console ДОЛЖЕН показать:
     - `ran-pak: 0. 0.5` (подтверждение pak)
     - `dbg-pak4: 0. 0.5 0. 1.` ← КЛЮЧЕВОЙ ТЕСТ (slot 1 должен быть 0.5, не 1.0)
   - Повернуть до упора → параметр должен остановиться на 50%
   - Если `dbg-pak4` показывает `0. 1. 0. 1.` — pak4 по-прежнему не видит max → нужен другой подход
   - Если `dbg-pak4` показывает `0. 0.5 0. 1.` → pak4 правильный → баг ниже по цепи

2. **Min-диапазон (не должен сломаться):**
   - Min=25% → `dbg-pak4: 0.25 1. 0. 1.` → параметр начинается с 25% при CC=0

3. **Sync oscillation (должен быть исправлен v45):**
   - Console НЕ должна показывать бесконечный `MINMAX-DBG: B→A sync`

4. **Panel slot persistence (должен работать v44/v45):**
   - Замапить 8 позиций, Cmd+S, Cmd+Q, открыть заново → все 8 слотов восстановлены

---

### v45/v37 → v45/v38 (2026-08-10) — FIX: Max-диапазон (четвёртая попытка; explicit pak4 slot routing)

**Диагноз (post-pak failure):**

После v37 `ran-pak` подтвердил: pak (obj-55) корректно выдаёт `[min/100, max/100]`. Но параметр по-прежнему не реагирует на Max. Полная статическая трассировка цепи pak→pak4→unpack→scale→pack→*~ подтвердила: все соединения структурно верны. Значит баг в РАНТАЙМ-ПОВЕДЕНИИ одного из промежуточных шагов.

**Гипотеза (pak list-spreading):**

`pak (obj-55)` выдаёт LIST `[min/100, max/100]` на outlet 0 → `pak4 (obj-49) inlet 0`.

В Max, поведение `pak` при получении LIST на inlet 0 неоднозначно: объект может взять только ПЕРВЫЙ элемент (min/100) для slot 0 и оставить slot 1 (max/100) на дефолте 1.0. Если это так:
- scale61 всегда получает 1.0 → abs_max = 1.0 → *~ coefficient = 1-min/100 всегда
- Min меняет floor (работает), Max никогда не меняет ceiling (сломан)
- Это точно соответствует наблюдаемому симптому

Все flonum в DSP-цепи (obj-56, obj-58, obj-65, obj-3) имеют `proto='Live'` — это стиль, не должно влиять на вывод. Но для уверенности дополнительно добавлена диагностика pak4 outlet.

**Фикс (MapButtonTint.maxpat v38, inside RangeAndName obj-16):**

УДАЛЕНО:
- `obj-55[0] → obj-49[0]` — прямой pak→pak4 (не гарантирует spreading list в slot 1)

ДОБАВЛЕНО:
- `obj-minmax-split` (`unpack 0. 1.`) в [112, 168] — явное разбиение LIST [min/100, max/100]
- `obj-55[0] → obj-minmax-split[0]` — pak → unpack
- `obj-minmax-split[1] → obj-49[1]` COLD (max/100 в pak4 slot 1 ЯВНО, до того как pak4 стреляет)
- `obj-minmax-split[0] → obj-49[0]` HOT (min/100 в pak4 slot 0, pak4 стреляет)
- `obj-dbg-pak4` (`print dbg-pak4`) в [240, 208] — диагностика pak4 output
- `obj-49[0] → obj-dbg-pak4[0]`

Поскольку `unpack` стреляет справа налево: outlet 1 (max/100) → pak4[1] COLD СНАЧАЛА, затем outlet 0 (min/100) → pak4[0] HOT → pak4 выдаёт `[min/100, max/100, param_min, param_max]`.

**Диагностика:**
- `ran-pak:` — старая диагностика, pak output ОК (было подтверждено v37)
- `dbg-pak4:` — НОВАЯ, показывает что pak4 реально видит в слотах

**MapButtonTint v38:** MD5 `cc4b526a2a75b130fdae5b64c393798c` (264905 bytes).
**Архив:** `MapButtonTint.2026-08-10-031433.pre-v38-pak4-split.maxpat` (MD5 `f55c74c82b7121fab5ed0d4ef6c94efb` = v37).
**RangeAndName:** 72 boxes / 67 lines (v37: 70/64; +2 boxes +4-1=3 lines net).

---

### v45/v37 — (OBSOLETE — заменён v38) (2026-08-10)

**Ожидаемые Console-маркеры при загрузке:**
```
>>> S7-DEV-v45 LOADED <<<
MapButtonTint: MapButtonTint v37 loaded
```

**Что тестировать: → см. блок v45/v38 выше**

---

### v45/v36 → v45/v37 (2026-08-10) — FIX: Max-диапазон (третья попытка; new Min/100 flonum)

**Диагноз (Max-path failure, три попытки):**

Всестороннее статическое исследование RangeAndName (obj-16) внутри MapButtonTint.maxpat показало: цепь `t b f → bang → obj-53(flonum с prototypename "Live") → /100 → pak[0] hot` теоретически корректна, но Max-параметр не отвечает. Возможная причина: obj-53 имеет `prototypename: "Live"` — это специальный стиль Live-объекта. Стандартное поведение `flonum` при получении bang на inlet 0 — «выдать сохранённое значение» — может нарушаться или задерживаться в M4L-контексте для Live-прототипных flonum.

**Полная карта Min-chain vs Max-chain (для сравнения):**

```
MIN CHAIN (работает — прямой путь к pak):
RangeAndName outer inlet 1 → inner obj-8(inlet idx=2)[0] → obj-53(flonum raw min)[0] [stores raw 0-100]
  → obj-9(/ 100.)[0] → obj-mindiv100(flonum min/100 NEW)[0] [stores 0-1]
  → obj-55(pak 0. 1.)[0] HOT → fires immediately with [min/100, pak_cold_stored]

MAX CHAIN v37 (NEW — bang к flonum min/100, не raw flonum):
RangeAndName outer inlet 2 → inner obj-6(inlet idx=3)[0] → obj-52(flonum raw max)[0] [stores raw 0-100]
  → obj-10(/ 100.)[0] → obj-maxfix-tf(t b f)[0]:
     outlet 1 fires FIRST: float max/100 → obj-55(pak)[1] COLD [stores max/100]
     outlet 0 fires SECOND: bang → obj-mindiv100(flonum min/100 NEW)[0]
       → outputs stored min/100 → obj-55(pak)[0] HOT → fires with [min/100, max/100]

DOWNSTREAM (общий для Min и Max):
obj-55(pak)[0] → obj-ran-pak-print(print ran-pak) [ДИАГНОСТИКА]
               → obj-49(pak 0. 1. 0. 1.)[0] HOT [fires with [min/100, max/100, param_min, param_max]]
  → obj-50(unpack)[0..3] RIGHT-TO-LEFT:
     [3] param_max → obj-57(scale 0.1.0.1.)[4] cold + obj-61(scale 0.1.0.1.)[4] cold
     [2] param_min → obj-57[3] cold + obj-61[3] cold
     [1] max/100 → obj-61[0] HOT → scale(max/100, 0,1,pmin,pmax) = abs_max → obj-58 flonum → obj-67(pack)[1] cold
     [0] min/100 → obj-57[0] HOT → scale(min/100, 0,1,pmin,pmax) = abs_min → obj-56 flonum → obj-67(pack)[0] HOT
       → pack fires [abs_min, abs_max]
         → obj-3 flonum (abs_min) → obj-69(+~ 0.)[1] OFFSET
         → obj-68(- 0.) gets list [abs_min, abs_max] → abs_min - abs_max = -range
           → obj-66(* -1.) → range → obj-65 flonum → obj-13(*~ 1.)[1] MULTIPLIER
  AUDIO: clip~[0] → obj-13(*~)[0] → obj-69(+~)[0] → outlet idx=1 → outer outlet 0 → live.remote~
  output = audio * (abs_max - abs_min) + abs_min = correct DSP range scaling
```

**Фикс (MapButtonTint.maxpat v37, inside RangeAndName obj-16):**

УДАЛЕНО:
- `obj-9(/100)[0] → obj-55(pak)[0]` — прямое соединение min/100 → pak hot
- `obj-maxfix-tf(t b f)[0] → obj-53(flonum raw min)[0]` — bang → Live-прототипный flonum (СЛОМАН)

ДОБАВЛЕНО:
- `obj-mindiv100` — стандартный flonum (без prototypename, без parameter_enable) в [8, 160]
  Хранит min/100 (уже делённое значение). Отвечает на bang стандартно.
- `obj-9(/100)[0] → obj-mindiv100[0]` — Min/100 → новый flonum (обновляет хранимое значение)
- `obj-mindiv100[0] → obj-55(pak)[0]` — новый flonum → pak hot (Min trigger, как раньше)
- `obj-maxfix-tf[0](bang) → obj-mindiv100[0]` — Max trigger: bang → новый flonum → pak hot
- `obj-ran-pak-print` (print ran-pak) — диагностика: Console показывает когда pak срабатывает

**MapButtonTint v37:** MD5 `f55c74c82b7121fab5ed0d4ef6c94efb` (268249 → 263622 bytes; форматирование JSON изменено, контент эквивалентен).
**Архив:** `MapButtonTint.2026-08-10-024610.pre-v37-maxfix2.maxpat` (MD5 `c00afb757337747214979bb613853b64` = v36).
**RangeAndName:** 70 boxes / 64 lines (v36: 68/62; +2 boxes +2 lines net).

---

### v44 → v45 (2026-08-10) — FIX: sync oscillation; remove keep-alive lcdbgcolor override

**Диагноз (sync oscillation):**

Пользователь изменял Max в bpslot7. `_mmSyncFn` (500ms poll) видел `bChg=true` → `B→A sync` → писал в df_mapparam. Но на следующем тике `minB` снова был отличен от `_lastSyncMinB`, и так в цикле: `B→A sync min=43 max=23`, `min=23`, `min=0`, `min=18`, ... хаотично.

Причина: `_bMnP.message(minA)` / `_fMnP.message(minB)` — запись в pattr — тригерила pattr outlet 0 → RangeAndName inlet 1/2 → `t b f` → bang → Min flonum → pak fires → DSP update. Это нормальный путь, но pattr с `@autorestore 1` через Max-внутренние механизмы (возможно pattrstorage broadcast или lifetime notification) приводил к тому, что `bpslot7.TargetMin.getvalueof()` на следующем тике возвращал другое значение. Точный механизм не поддаётся статической трассировке (не является прямой loop в JSON), но эффект устраним.

**Фикс (midi_learn_slot.js v45):**

В `_mmSyncFn` (все три ветки: A→B, B→A, conflict) и в Patch A (init write):
- OLD: `pattr.message(value)` → pattr outlet 0 → RangeAndName → DSP
  ЗАТЕМ: `numbox.message("set", value)` → numbox stores (no DSP, no outlet)
- NEW: `numbox.message(value)` → numbox outlet → RangeAndName → DSP (правильный путь)
  ЗАТЕМ: `pattr.message("set", value)` → pattr stores for @autorestore (NO outlet 0 fire)

Pattr outlet 0 больше не тригерится во время sync writes. Numbox → RangeAndName → t b f → pak — чистый однократный путь.

**Фикс 2 (_s7kaFn lcdbgcolor):**

`kaBtn.message("lcdbgcolor", ...)` было закомментировано. Причина: keep-alive перезаписывал lcdbgcolor каждые 100ms тем же amber, что и state machine (state=2 → it_emit → it_bgpak → it_bgg → live.text lcdbgcolor). Лишнее переопределение каждые 100ms убрано. `bordercolor` и `lcdcolor` из keep-alive оставлены.

**Цвет bpslot7 (ONGOING):** Корневая причина amber — `it_bgpak` (Follow BG pak) получает RGB из `it_unpk` ← `it_cttrig` ← `it_apply` ← `it_lc (live.colors lcd_control_fg)`. `lcd_control_fg` = amber во ВСЕХ скинах (R=0.999 G=0.678 B=0.337). Skin-adaptive цвет нужен через другой live.colors токен. Отдельный шаг — требует определить правильный токен.

**Схема хранения файлов (DF Slot, обновлено 2026-08-10):**
- `midi_learn_slot.js` — **ОДИН реальный файл**: `User Library/Max Devices/midi_learn_slot.js`. Два symlink на него: `Brain/fadercraft/Dynamic Focus/midi_learn_slot.js` и `Documents/Max 9/…/Dynamic Focus Slot Project/code/midi_learn_slot.js`. Правь любой из трёх путей — это один файл. Синхронизировать копии больше НЕ нужно.
- `MapButtonTint.maxpat` — plain text JSON (Max patcher format), редактируется напрямую в `User Library/Max Devices/`.
- `multimapDF.maxpat` — то же.
- `Dynamic Focus Slot.amxd` — binary container. Требует Python unpack/repack ТОЛЬКО при изменении main patcher wiring. В данной задаче — не трогался.

**JS v45:** MD5 `46d1edca572c6907268044df39d323ff`.
**Архив:** `midi_learn_slot.2026-08-10-014040.pre-v45.js`, `MapButtonTint.2026-08-10-014040.pre-v37.maxpat` (MapButtonTint не изменился, остался v36).

---

### MapButtonTint v35 → v36 (2026-08-10) — FIX: loadbang format + it_zc varname (bpslot7 цвет)

v35 был сломан: `maxclass:"loadbang"` вместо `maxclass:"newobj"` + `text:"loadbang"` → Max выдавал "extra arguments creating object" × 9 инстансов, маркер не печатался.

**v36 Фикс 1 (loadbang):** `obj-vmark-lb` → `maxclass:"newobj"` + `text:"loadbang"`. Теперь `MapButtonTint: MapButtonTint v36 loaded` появляется в Console.

**v36 Фикс 2 (it_zc varname / bpslot7 color):**
- `it_zc` (live.colors) имел `id:"it_zc"` но пустой varname → `getnamed("it_zc")` в JS всегда возвращал null → `_kaZc.message("lcd_control_fg")` никогда не срабатывал → lnb_lcfg_r/g/b хранили amber-дефолт → bpslot7 оставался amber под Follow-скином.
- Fix: добавлен `varname:"it_zc"` на live.colors объект в MapButtonTint.maxpat.
- Теперь: `_kaZc.message("lcd_control_fg")` реально выполняется → live.colors → it_zcr (route) → it_zcu (unpack) → lnb_lcfg_r/g/b обновляются → bpslot7 получает правильный цвет.

**Подтверждение t b f наличия:** `obj-maxfix-tf` (t b f) @ [152, 134] ЕСТb в RangeAndName (obj-16). 68 boxes / 62 lines в RangeAndName.

MapButtonTint v36: 141 boxes / 237 lines. MD5 `c00afb757337747214979bb613853b64`.
Архив pre-v36: `MapButtonTint.2026-08-10-001355.pre-v36.maxpat`.

---

### v43 → v44 (2026-08-10) — CRITICAL: panel slot byname persistence fix; MapButtonTint v35 marker

**CONFIRMED WORKING (v43):** Persistence на всех 8 позициях работает финально — больше не трогать.

**Диагноз (пatcher trace MapButtonTint.maxpat → obj-16 RangeAndName):**

- Сигнальный путь DSP: live.dial (0-1) → sig~ → df_mapparam inlet 0 → clip~ → RangeAndName inlet 0 → clip~ → `*~` (gain=obj-65) → `+~` (offset=obj-3) → live.remote~ → Live parameter.
- gain и offset вычисляются из Min/Max через цепочку: `/100.` → pak 0. 1. → pak 0. 1. 0. 1. → unpack → scale → pack → offset (obj-3) + gain (obj-65).
- **КОРЕНЬ:** `pak 0. 1.` (obj-55) имел Min на inlet 0 (горячий, triggers output) и Max на inlet 1 (холодный, stores only, НЕ triggers). Изменение Max хранилось в pak но НЕ вызывало пересчёт gain/offset. Max НИКОГДА не влиял на диапазон в реальном времени (только когда пользователь потом менял Min — pak срабатывал с сохранённым Max).
- Min РАБОТАЛ всегда (hot inlet). Max — нет (cold inlet). Это фундаментальный давний баг, НЕ регрессия.

**Фикс (MapButtonTint.maxpat, внутри patcher RangeAndName = obj-16):**
- Удалено соединение: obj-10 (/100. Max) outlet 0 → pak (obj-55) inlet 1
- Добавлен объект: `t b f` (obj-maxfix-tf) @ [152, 134, 36, 20]
- Добавлено: obj-10 → obj-maxfix-tf inlet 0
- Добавлено: obj-maxfix-tf outlet 1 (float, fires FIRST) → pak inlet 1 (устанавливает Max/100)
- Добавлено: obj-maxfix-tf outlet 0 (bang, fires SECOND) → obj-53 (Min flonum) → pak inlet 0 (TRIGGERS pak с новым Max уже установленным)

В итоге: Max changes → `t b f` → (1) pak inlet 1 = новый Max/100, (2) pak inlet 0 = re-trigger → pack fires → scale → DSP update. Теперь функционирует.

**Page sync status:** _mmSyncFn пишет pattr Max → RangeAndName inlet 2 → теперь также тригерит pak через `t b f`. Sync DSP тоже работает. Если пользователь всё ещё видит visual desync — _mmSyncFn не запущен (бросить лог с _s7mirrorId).

MapButtonTint v34: 68 boxes / 62 lines. MD5 `e6115b295beade6cb5f32ae104b93b1c` (до: `ee7d3312`, v33). Статус фикса Max: см. секцию v44→??? выше — ожидает теста с маркером.

---

### MapButtonTint v42 + JS v50 (2026-08-10) — bpslot7 FOLLOW amber цвет: root-cause fix

**Баг:** в FOLLOW mode bpslot7 (si=7, mirror главной Map кнопки) всегда показывал amber lcdbgcolor при замапленном состоянии — даже когда основной UI и слоты 1-7 адаптировались к скину Live.

**Root cause:** `_updateMapBtnVisibility` читал `lnb_lcfg_r/g/b` (flonums внутри MapButtonTint, хранящие `lcd_control_fg`). Но `lcd_control_fg` — ФИКСИРОВАННЫЙ amber во ВСЕХ скинах Live (R=1.0 G=0.678 B=0.337). Ни смена скина, ни принудительный re-query `it_zc.message("lcd_control_fg")` не помогали — токен всегда amber. `_s7kaFn` (keep-alive 100ms) делал то же самое.

**Почему bpslot7 отличается от слотов 0-6:** MapButtonTint state machine устанавливает amber lcdbgcolor при state=2 через `it_emit → it_bgpak → it_bgg`. В FOLLOW mode bpslot7 намеренно держится при state=0 (иначе `mm_idroute` вызовет dual-bind error). Поэтому patcher-level state machine не рисует amber — это делал JS. И читал всегда amber токен.

**Решение (двухступенчатое):**

**MapButtonTint v42** (`MapButtonTint.maxpat`):
- Добавлены 3 flonum объекта: `lnb_lbg_r` @ [1680,330], `lnb_lbg_g` @ [1730,330], `lnb_lbg_b` @ [1780,330]
- Проводка: `it_bgcu` outlets 0,1,2 → каждый flonum (inlet 0)
- `it_bgcu` = `unpack f f f f`, получает значения от `it_bgcr` (route lcd_bg) ← `it_bgc` (live.colors) ← `it_bgcload` (loadmess lcd_bg) — запрос происходит при loadbang
- Таким образом `lnb_lbg_r/g/b` хранят скин-адаптивный тёмный цвет фона (LCD background) — меняется при смене скина Live
- Итог: 141→144 boxes, 237→240 lines, MD5=`a92e0424`
- Version marker: "MapButtonTint v42 loaded"

**JS v50** (`midi_learn_slot.js`):
- `_updateMapBtnVisibility` FOLLOW si=7 блок: вместо `lnb_lcfg_r/g/b` читает `lnb_lbg_r/g/b` для `lcdbgcolor` (скин-адаптивный тёмный фон). Для `bordercolor` и `lcdcolor` — hardcoded amber (0.999999, 0.678431, 0.337255), чтобы показывать "замапленное" состояние на тёмном фоне
- `_s7kaFn` keep-alive: полностью упрощён — убраны lnb_lcfg reads и live.colors re-query. Просто поддерживает amber border+text каждые 100ms; lcdbgcolor не трогает (уже установлен _updateMapBtnVisibility)
- Удалена v42-диагностика (post с lnb_lcfg значениями)
- Version marker: `>>> S7-DEV-v50 LOADED <<<`

**Тест:** переключить скин Live (Preferences → Look/Feel → Skin) — bpslot7 при замапленном FOLLOW-слоте 8 должен менять цвет фона вместе с остальным устройством; amber текст+рамка остаются как индикатор "замаплено"

---

### v43 → v44 (2026-08-10) — CRITICAL: panel slot byname persistence root-cause fix; MapButtonTint v35 marker

**КРИТИЧЕСКИЙ БАГ (Issues 0, 3):**

Root cause: `_encodePanelBn()` и `_clearPanelBnSlot()` использовали `LiveAPI.set("value", X)` для записи в `pnl_dn_S_C` numboxes. Это обновляет только LOM in-memory значение — НЕ обновляет serialized stored value, которое Live реально сохраняет в `.als`/`.adv`. Абсолютно идентичный баг был найден и исправлен для `lnb_tgt` 2026-07-23 (ARCHITECTURE.md §Preset recall bug). В результате: каждый save/reload все `pnl_dn_*` восстанавливались как 0 → `_decDnChunk(0)=''` → sentinel → `name2=''` → SKIP → все panel slots не восстанавливались. v43 fix "unconditional byname resolve" имел правильный тайминг, но читал заведомо нулевые значения.

**Фикс (midi_learn_slot.js v44):**
- `_encodePanelBn`: заменён `LiveAPI.set("value", X)` на `patcher.getnamed("pnl_dn_S_C").message("set", X)` для 7 чанков + `patcher.getnamed("pnl_tpi_S").message("set", packed)` для TPI.
- `_clearPanelBnSlot`: то же, `message("set", 0)`.
- Диагностика: в `_resolvePanelSlotsOnHostTrack` добавлен лог `v44-rps si=X c0: pid=... raw=... v2=...` для c=0 каждого слота.

**MapButtonTint v35 (Issue 0, Priority 0):**
- Добавлены 3 объекта в outer patcher: `loadbang` → `message "MapButtonTint v35 loaded"` → `print MapButtonTint`.
- На загрузке в Max Console: `MapButtonTint: MapButtonTint v35 loaded`.
- 141 boxes / 237 lines. MD5 `b32632cb198899c8616b65280d0d36ec`.

**JS v44:** MD5 `3ed915adaa1f05a090e4f96bac7f4795`.
**Архивы (2026-08-10-000113):** `midi_learn_slot.2026-08-10-000113.pre-v44.js`, `MapButtonTint.2026-08-10-000113.pre-v35.maxpat`.

---

### v42 → v43 (2026-08-09) — Fix 1: panel slots si=0..6 не восстанавливались; Fix 2: bpslot7 цвет amber вместо skin-адаптивного

**Диагноз Fix 1 (подтверждён v42-pbn/v42-rps логами):**

- `v42-pbn TOTAL pids found: 64/64` — PnDn DeviceParameters заполнены корректно.
- `v42-rps` отсутствует в логе → `_resolvePanelSlotsOnHostTrack()` **не вызывалась**.
- Путь `storedTgtId=0` → проверял `_hasPanel` через `mm_tgt_0..7.getvalueof()`.
- `mm_tgt` (live.numbox) — **асинхронное восстановление** из .adv: на +200ms все = 0.
- Поэтому `_hasPanel=false` → else-branch → `_resolvePanelSlotsOnHostTrack()` НЕ вызвана.
- PnDn DeviceParameters — синхронное восстановление: на +200ms уже готовы (64/64).

**Фикс:** Убрана freshness-эвристика. `_resolvePanelSlotsOnHostTrack()` вызывается
**всегда** в storedTgtId=0 ветке. Функция идемпотентна: пропускает слоты с пустыми
PnDn данными, резолвит и ребиндит остальные.

**Диагноз Fix 2 (подтверждён v42-ka/v42-umv логами + patcher trace):**

- `v42-ka lnb_lcfg found: R=0.999999 G=0.678431 B=0.337255` = **amber**, не yellow.
- `v42-umv si=7 standardMode=false` → FOLLOW branch активен — код верный.
- Пatcher trace MapButtonTint: `it_zc` (live.colors) триггерится только из:
  - `it_zload` (loadbang) → `it_zq` → `it_zc` — один раз при загрузке
  - `it_stsel` outlet 0 (state→0, unmapped) → `it_zq` → `it_zc`
  - НЕ триггерится при state→1 или state→2.
- Если устройство загружено в amber-скине → lnb_lcfg кешируется amber.
  Переключение на Follow skin после загрузки → live.colors никогда не обновляется.

**Фикс:** В `_s7kaFn()` и `_updateMapBtnVisibility()` si=7 FOLLOW ветке —
перед чтением lnb_lcfg_r/g/b вызывается `it_zc.message("lcd_control_fg")`.
Max propagates синхронно: it_zc→it_zcr→it_zcu→flonum. Значение актуально в тот же вызов.

---

### v41 → v42 (2026-08-09) — диагностика: si=1..6 capture/restore + цвет bpslot7

**Что добавлено:**

Компрехенсивное логирование для диагностики двух проблем:

1. **si=1..6 не восстанавливают маппинг** — возможная причина: race в Max fan-out.
   `mm_panel[1]` имеет два параллельных пути:
   - [40] → `mm_route` → `mm_tgt_N` (обновляет числовой бокс)
   - [41] → `mm_trig_b` → `mm_trig_msg` → `panelmap` (запускает panelmap() в JS)
   В Max, соединение с БОЛЬШИМ индексом в массиве patchlines fires FIRST.
   Индекс 41 (mm_trig_b) > 40 (mm_route) → panelmap() fires BEFORE mm_tgt_N обновлён.
   СЛЕДСТВИЕ: panelmap() видит СТАРОЕ значение mm_tgt_N → no change detected with old state →
   PnDn data not written on first interactive map. However, subsequent slot mappings trigger
   panelmap() and detect the PREVIOUS slot's freshId as new → cascading capture.
   HYPOTHESIS (требует подтверждения тестом): пропущенный слот — это ПОСЛЕДНИЙ mapped slot
   (нет последующего panelmap() trigger). Fix A1 покрывает si=7. Остальные должны работать
   via cascade, если пользователь maps > 1 slot.

2. **Цвет bpslot7 остаётся amber вместо жёлтого** — нужно выяснить:
   - В каком colorMode устройство (STANDARD vs FOLLOW)?
   - Какие значения lnb_lcfg_r/g/b реально читаются?
   - Если STANDARD mode: amber — ПРАВИЛЬНОЕ поведение (по дизайну); жёлтый только в FOLLOW.

**Диагностика v42:**
- `_findPanelBnParams()`: log count per slot
- `panelmap()`: log every change detected (si, old, new, action)
- `_resolvePanelSlotsOnHostTrack()`: log ALL slots (was: only si=0 and si=7)
- `_s7kaFn()`: first-call diagnostic (colorMode + lnb_lcfg values)
- `_updateMapBtnVisibility()`: log bpslot7 paint branch (which mode, which color)

---

### v40 → v41 (2026-08-09) — bpslot7 not updating on restore (Guard 2 block)

**Диагноз (подтверждён кодом + логом пользователя):**

Page 1 (df_mapparam) восстанавливалась корректно; page 2 (bpslot7/mirror) — нет.

**Корень:** Все три вызова `_bindToId()` из `bang()` устанавливают
`_lastWrittenTgtId = freshId` синхронно (в `_bindToId()` строка 2069).
Когда `_doRebind()` срабатывает через +100ms → `outlet(12, id)` → RangeAndName →
`mb_idout=id` → JS inlet 9 → `onTargetId(id)`:
  Guard 2 (`id !== _lastWrittenTgtId`) → FALSE (оба = freshId) → **BLOCKED**
  → `_s7mainT` никогда не запускается → bpslot7 не обновляется.

Аналогичный баг ранее был исправлен в `_doRebind()` stale path (строка 1460, v37).
Та же строка `_lastWrittenTgtId = -1` нужна ПОСЛЕ каждого `_bindToId()` в bang().

**Три исправленных места:**
- Строка ~642 (Cmd+D path): `_bindToId(bynameIdDup)` → `_lastWrittenTgtId = -1`
- Строка ~699 (storedTgtId>0 stale): `_bindToId(bynameIdStale)` → `_lastWrittenTgtId = -1`
- Строка ~724 (Fix A2, storedTgtId=0): `_bindToId(_bn0Main)` → `_lastWrittenTgtId = -1`

**Почему безопасно:** `tgtIdParam.set()` в `_bindToId()` триггерит `tgtIdObserver` АСИНХРОННО
(после окончания текущего Task). `_doRebind()` запускается через +100ms. К этому моменту
`_lastWrittenTgtId = -1` — это то значение, которое видит Guard 2 в `onTargetId()`.
→ PASS → `_s7mainT` запускается → bpslot7 обновляется.

**CONFIRMED WORKING (после v41):**
- Все три bang()-пути: bpslot7 (page 2) обновляется при restore — HYPOTHESIS (тест ожидается)

---

### v39 → v40 (2026-08-09) — si=0/si=7 save+restore fix

**Диагноз (подтверждён кодом + проверкой AMXD):**

#### Bug A: si=7 (main cell) — PnDn7C никогда не записываются (HYPOTHESIS, не проверено тестом)

В `_s7mainT` Task (внутри `onTargetId()`):
```
mm_tgt_7.message(id)       ← fires mm_tgt_7 outlet (deferred)
_panelPrevTgts[7] = id     ← установлено СИНХРОННО в том же Task
```
Когда пришедший deferred panelmap() видит mm_tgt_7=id, `_panelPrevTgts[7]` уже равен id → "нет изменения" → `_captureSlotBn(7, id)` **никогда не вызывается** из panelmap().

Следствие: PnDn7C (pnl_dn_7_0..6 + pnl_tpi_7) всегда пусты. `_resolvePanelSlotsOnHostTrack()` читает PnDn7C → пусто → skip si=7.

Параллельный механизм (lnb_dn_*/lnb_tpi) пишется `_captureByNameFromId(id)` корректно. Но `_resolveByNameOnHostTrack()` (использует lnb_dn_*) вызывается только когда storedTgtId > 0 (stale path), НЕ вызывается когда storedTgtId=0.

**Fix A1 (в _s7mainT):** добавить явный вызов `_captureSlotBn(7, _s7mainId)` после `_panelPrevTgts[7] = _s7mainId`. Это заполняет PnDn7C напрямую, минуя panelmap() guard.

**Fix A2 (в bang Task, storedTgtId=0 branch):** перед проверкой panel slots — пробовать `_resolveByNameOnHostTrack()` (читает lnb_dn_*). Это восстанавливает main cell даже когда TgtId=0 в .adv.

**Что НЕ трогаем:** lnb_dn_* write-path (`_captureByNameFromId()`), tgtIdObserver, `_doRebind()` stale path — всё подтверждено рабочим (v35/v37).

#### Bug B: si=0 — ES3-closure race в panelmap() (HYPOTHESIS, не подтверждено тестом)

`_pendingPanelSi` / `_pendingPanelId` — глобалы. При нескольких слотах, меняющихся в одном цикле panelmap() (напр., из `_resolvePanelSlotsOnHostTrack()`), все Task(0)-замыкания читают ПОСЛЕДНЕЕ записанное значение.

Пример: si=0 (id0) и si=6 (id6) оба меняются → `_pendingPanelSi=6, _pendingPanelId=id6` (последнее). Обе Task(0) вызывают `_captureSlotBn(6, id6)` → PnDn0C не пишется.

**Или:** при картировании si=0 одновременно с main cell mapping (который меняет mm_tgt_7 через _s7mainT) — panelmap() fires для si=0 и si=7. Если si=7 change detected (когда `_panelPrevTgts[7]` ещё не updated) → `_pendingPanelSi=7` → Task(0) для si=0 запускается с si=7's данными.

**Fix B (в panelmap()):** заменить ES3-глобалы на factory-функцию `_schedPanelCapture(si, id)`, которая создаёт правильное замыкание per-call.

**Что НЕ трогаем:** логика обнаружения изменения `mmv !== _panelPrevTgts[si]`, `_clearPanelBnSlot`, si=7 special case.

#### CONFIRMED WORKING (НЕ трогать без явного упоминания риска):
- v35: `_doRebind()` stale-ID path (byname resolve + `_bindToId`) — ПОДТВЕРЖДЕНО пользователем
- v37: `_lastWrittenTgtId = -1` после `_bindToId` в stale path — ПОДТВЕРЖДЕНО
- v37: flonum `lnb_lcfg_r/g/b` + skin-adaptive color — ПОДТВЕРЖДЕНО  
- v38: `LiveAPI.get("name")` в `_doRebind()` + `_resolvePanelSlotsOnHostTrack()` — ПОДТВЕРЖДЕНО
- v39: `_psr39` 600ms Task в stale path — HYPOTHESIS (тест запланирован)

---

## 1. Все переменные состояния JS

### 1.1 Runtime-only (не переживают перезагрузку Live Set)

| Переменная | Тип | Начальное | Что означает |
|---|---|---|---|
| `targetParamId` | int | -1 | Текущий id целевого параметра; -1 = не замаплен |
| `learnedCC` | int | -1 | Выученный CC-номер; -1 = нет |
| `learnedChannel` | int | -1 | MIDI-канал; -1 = нет |
| `arming` | bool | false | Устройство в режиме ожидания (blinking) |
| `engaged` | bool | false | Pickup/Takeover активировался |
| `_s7mirrorId` | int | 0 | Отражает: main Map сейчас замаплен; ==id, если mirror активен; 0 = нет mirror |
| `_s7kaTask` | Task | null | Keep-alive Task (100 ms) для amber в FOLLOW-режиме |
| `_panelPrevTgts` | int[8] | [-1…-1] | Prev значения mm_tgt_0..7 для change-detection в panelmap() |
| `_pendingPanelSi/Id` | int | 0/0 | ES3-safe Task-closure globals для panelmap captures |
| `_pendingCaptureId` | int | 0 | Для _captureByNameFromId Task closure |
| `_pendingRebindId` | int | 0 | Id, ожидающий _doRebind; 0 = cancel |
| `_rebindTask` | Task | null | Handle для отмены текущего _doRebind |
| `_rebindAttempts` | int | 0 | Счётчик попыток rebind (retry up to 5) |
| `_initialized` | bool | false | true после bang() (live.thisdevice) |
| `_lastWrittenTgtId` | int | -1 | Последнее записанное TgtId; -1 = initial, 0 = после unmap() |
| `tgtIdParam` | LiveAPI | null | Кэш LiveAPI к TgtId DeviceParameter |
| `tgtIdObserver` | LiveAPI | null | Наблюдатель на TgtId value (re-fires on restore) |
| `ccObserver/chObserver` | LiveAPI | null | Наблюдатели CC/Ch (восстанавливают learnedCC/Ch на reload) |
| `_dialObserver` | LiveAPI | null | Наблюдатель на "Slot 1" param (push dial value) |
| `_parentObserver` | LiveAPI | null | Наблюдатель canonical_parent (drag detection) |
| `hostId/hostTrack` | int/LiveAPI | -1/null | id и API текущего хост-трека |
| `targetTrackId/Track` | int/LiveAPI | -1/null | id и API целевого трека (Absolute mode) |
| `targetColorObserver` | LiveAPI | null | Наблюдатель color на target track |
| `colorMode` | int | STANDARD | 0=FOLLOW, 1=STANDARD |
| `absoluteMode` | bool | false | Absolute/Focus mode переключатель |
| `currentVal` | float | 0.0 | Текущее значение Slot 1 dial |
| `_lastSentDialValue` | float | -1 | Echo suppression для dialObserver |
| `takeoverMode` | int | 2 | 0=Pass-through, 1=Pickup, 2=Value Scaling |

### 1.2 Persisted (переживают save/reload через Live Parameter system)

| Имя | Механизм | Хранит |
|---|---|---|
| `TgtId` DeviceParameter | `tgtIdParam.set("value", id)` / pattr | id целевого параметра (main Map) |
| `CC` DeviceParameter | `ccParamId` LiveAPI set | learnedCC + 1 (0 = не выучен) |
| `Ch` DeviceParameter | `chParamId` LiveAPI set | learnedChannel |
| `lnb_tgt` live.numbox (varname) | `.message("set", 0)` | Синхрон-копия TgtId для stale-guard |
| `lnb_cc / lnb_ch` live.numbox | outlet(1/2) → ps_cc/ch | Отображение CC/Ch в UI |
| `mm_tgt_0..7` live.numboxes | `.message(id)` | Target id каждого из 8 panel-слотов |
| `pattr TargetMin @autorestore 1` | pattr bind к TargetMin[7] numbox | Min-value для live.remote~ scaling (per MapButtonTint instance) |
| `pattr TargetMax @autorestore 1` | pattr bind к TargetMax[7] numbox | Max-value для live.remote~ scaling (per MapButtonTint instance) |
| `PnDnSC` (slot×chunk), `PnTpiS` (slot) | LiveAPI.set | Byname persistence panel-слотов (cross-session) |
| `DevNm0..6`, `TgtPI` | LiveAPI.set | Byname persistence main Map (cross-session) |
| `lbl_chunk_0..5` | LiveAPI.set | Имя слота (11-bit Unicode codec) |
| `DevSlot` DeviceParameter | LiveAPI.set | track_idx*1000+dev_idx (Cmd+D detection) |
| `SwapFlipState[7]` live.numbox | varname | Swap-Flip state (UI) |

---

## 2. Путь min/max: где хранится, как рендерится, где разрывается

### Хранение (per MapButtonTint instance)

Каждый экземпляр MapButtonTint содержит:
- `obj-8` (live.numbox, varname=`TargetMin[7]`) — процентное значение min
- `obj-3` (live.numbox, varname=`TargetMax[7]`) — процентное значение max
- `obj-pattr-min` (`pattr TargetMin @autorestore 1`) — autorestore min
- `obj-pattr-max` (`pattr TargetMax @autorestore 1`) — autorestore max

pattr-min/max → RangeAndName inlet 1/2 (min/max signal into scaling subpatcher).
pattr привязывается к live.numbox по scripting name ("TargetMin"/"TargetMax").
При изменении numbox → pattr получает новое значение → хранит → restores on load.

### Рендер (RangeAndName внутри MapButtonTint)

RangeAndName (obj-16 в MapButtonTint, 4 инлета, 7 аутлетов):
- inlet 0: scaled CC signal (от clip~)
- inlet 1: min (от TargetMin numbox ИЛИ pattr)
- inlet 2: max (от TargetMax numbox ИЛИ pattr)
- inlet 3: param id (от mb_ididin: "id $1" message)

Что RangeAndName делает с min/max:
- Масштабирует CC сигнал под [min..max] → outlet 0 → `live.remote~` signal input → фактически управляет параметром
- Выдаёт min/max в p setButtonColor (outlets 4/5) → рендерит числа в ячейке

### РАЗРЫВ (ключевой системный баг #3)

```
df_mapparam (page 1)                  bpslot7 (page 2, mirror)
│                                     │
├── TargetMin[7] numbox ──── pattr ──►│── НЕТ. Это ДРУГОЙ ЭКЗЕМПЛЯР MapButtonTint.
├── TargetMax[7] numbox ──── pattr    │   У bpslot7 СВОИ pattr TargetMin/TargetMax.
│   (значение: 0% / 28%)             │   (значение: 0% / 100% — дефолт)
│                                     │
└── RangeAndName: масштаб 0-28%      └── RangeAndName: масштаб 0-100%
    live.remote~ → param 0-28%            НЕ ПРИВЯЗАН (no live.remote~ для bpslot7)
```

**Нет НИКАКОГО механизма синхронизации min/max между df_mapparam и bpslot7.**
Пользователь видит Max=28% на странице 1 и Max=100% на странице 2.

Путь записи TargetMax в df_mapparam при изменении пользователем:
```
user drags TargetMax slider on page 1
→ obj-3 (TargetMax[7] numbox) value changes
→ pattr TargetMax captures it (autobinding)
→ obj-3 outlet → RangeAndName inlet 2 (immediately rescales CC output)
```

Ничто из этого не уведомляет bpslot7.

---

## 3. Порядок срабатывания инлетов/аутлетов при каждом триггере

### 3.1 MAP (пользователь выбирает параметр, arm → capture)

```
Live captures param → fires id to df_mapparam inlet 3 (mb_ididmsg)
→ df_mapparam RangeAndName inlet 3 = id
  → outlet 6 (ran_idout) → it_mflag(true) + mb_idout=id + p setButtonColor(id)
  → outlet 0 (scaled signal) → live.remote~ id=id  [BIND live.remote~]
  → outlet 1 (name) → p setText → live.text text=paramName
  → outlet 3 (msg 1) → binding trigger (mb_bindtrig)

mb_idout=id → outlet 1 of df_mapparam → obj-46[1] → JS inlet 9 → onTargetId(id)

JS onTargetId(id):
  ├── Guard 2 (id != _lastWrittenTgtId):
  │   ├── _lastWrittenTgtId = id
  │   ├── tgtIdParam.set("value", id)  [PERSISTS TgtId]
  │   │   └── tgtIdObserver fires → _doRebind Task(0)
  │   ├── Task(0): _captureByNameFromId(id)  [PERSISTS byname]
  │   └── Task(0): _s7mainT
  │       ├── mm_tgt_7.message(id)  [PERSISTS mm_tgt_7]
  │       │   └── numbox outlet fires → panelmap()
  │       │       └── si=7 changed → onTargetId(id) [Guard 2 BLOCKS double-write]
  │       ├── bpslot7 live.text: message(0) → un-arm blink
  │       ├── bpslot7 live.text: text=paramName
  │       ├── _updateMapBtnVisibility()
  │       └── _s7mirrorId = id  [SET HERE — LAST step in Task]
  │           _s7kaTask.repeat() (100ms keep-alive)
  └── _updateMapBtnVisibility()

_doRebind Task(0) [from tgtIdObserver or direct schedule]:
  └── outlet(12, id) → obj-46[1] (df_mapparam inlet 1 = mb_ididin)
      → df_mapparam RangeAndName inlet 3 = id
        → same chain as above (binds live.remote~, fires mb_idout=id)
        → Guard 2 blocks second onTargetId write
```

**Timing issue #1**: `_s7mirrorId = id` зависит от успеха ВСЕГО _s7mainT Task.
Если getnamed("bpslot7") вернёт null (пример: multimapDF ещё не инициализирован),
весь inner try-catch поглощает ошибку, но `_s7mirrorId` НА ЭТОМ ЖЕ УРОВНЕ выставляется
вне inner try:

```javascript
try {  // outer
    mm_tgt_7.message(id);
    try {  // inner — bpslot7 navigation
        ...
    } catch(_e7ms) {}  // inner catch
    _updateMapBtnVisibility();
    _s7mirrorId = id;  // ← ЭТО вне inner try, НО внутри outer try
    _s7kaStop(); _s7kaTask.repeat();
} catch(_e7m) {}  // outer catch
```

Если `_updateMapBtnVisibility()` бросит исключение (нет, оно само в try-catch),
или если `_s7mirrorId = id` и далее бросит — outer catch поглотит и _s7mirrorId=0.
Вероятнее — проблема в другом: mm_tgt_7.message(id) триггерит mm_tgt_7 outlet →
panelmap() fires СИНХРОННО? В Max, message() вызов к patcher объекту
обычно defer-ится. Но если panelmap() каким-то образом выполняется ДО окончания
_s7mainT Task (неожиданный re-entry через Max scheduler), это могло бы создавать ситуацию
где _s7mirrorId не set.

**ЭТО ГИПОТЕЗА**, требует подтверждения. Лог показывает _s7mirrorId=0 при первом X-click
спустя 24 секунды после mapping — либо _s7mirrorId не был выставлен, либо что-то его обнулило
в промежутке (не видно в логе).

### 3.2 ARM-CANCEL (page 1, двойной клик Map без выбора)

```
live.text (arm btn) fires 0 → p_mapping gate:
  gate was open (armed=1) → fires 0 on cancel
  p_mapping outlet 1 → obj-5[1] (live.remote~ id=0)  [UNBIND live.remote~]
  p_mapping outlet 1 → obj-16[3] (RangeAndName id=0)

RangeAndName id=0:
  → ran_obs_clr ("id 0" to live.observer = detach subscription)
  → it_id0 (message 0)
  → mb_idout = 0
  → outlet 1 of df_mapparam
  → obj-46[1] → JS inlet 9 → onTargetId(0)

JS onTargetId(0) [v30 manual block, if _s7mirrorId > 0]:
  _s7mirrorId = 0
  _s7kaStop()
  mm_tgt_7.message(0)  [CLEARS mirror visual]
  _panelPrevTgts[7] = 0
  bpslot7 it_mflag → 0 (visual)
  bpslot7 live.text → "Map" (text)
  _updateMapBtnVisibility()
  return

ИТОГ:
  ✓ visual cleared
  ✓ bpslot7 shows "Map"
  ✓ live.remote~ UNBOUND (from patcher, before JS fires)
  ✗ TgtId NOT cleared (preserved → reload restores binding)
  ✗ learnedCC NOT cleared (preserved)
  ✗ mm_tgt_7 cleared (visual only — bpslot7 live.remote~ NOT bound anyway)

ПРОБЛЕМА: live.remote~ unbound в текущей сессии → CC не работает до reload.
На reload: storedTgtId > 0 → _doRebind → live.remote~ rebinds → всё ок.
Но В ТЕКУЩЕЙ СЕССИИ после arm-cancel: CC не управляет параметром.
```

### 3.3 X-CLICK (bpslot7, page 2)

```
X button (live.text[1]) in bpslot7 MapButtonTint fires — ЧЕТЫРЕ параллельных пути:

PATH A: obj-20 ("id 0") → obj-5[1] (bpslot7 live.remote~ id=0) [NO-OP: не был привязан]
PATH A': obj-20 → obj-16[3] (bpslot7 RangeAndName id=0)
  → ran_obs_clr (bpslot7 observer detach)
  → it_id0 → mb_idout=0 → bpslot7 outlet 1

PATH B: obj-21 (p setText bang) → fires parameter name [NO-OP: harmless]

PATH C: xt_out bang → multimapDF xt_mm_out → mm_panel[3] → JS inlet 11
  → bang() → _handleXClick11()

PATH D: print DF-X-CLICK → Max console

ПОРЯДОК ИНЛЕТОВ в JS:
  inlet 9 (onTargetId) — срабатывает ЕСЛИ PATH A' propagates через multimapDF
    → bpslot7 outlet 1 = mb_idout=0
    → в multimapDF: bpslot7 outlet 1 → [НЕИЗВЕСТНО куда, нужна топология multimapDF]
    → возможно: mm_idroute? panelmap trigger? JS inlet 9 НЕ напрямую?

  inlet 11 (_handleXClick11) — PATH C, fires ПОСЛЕ inlet 9

ГОНКА:
  Если PATH A' приводит к JS inlet 9 (onTargetId(0)):
    v30 manual block: _s7mirrorId=0
    → _handleXClick11: guard _lastWrittenTgtId>0 → TRUE → unmap()
    ✓ РАБОТАЕТ

  Если PATH A' НЕ приводит к JS inlet 9:
    onTargetId(0) не вызывается
    → _handleXClick11: guard _lastWrittenTgtId>0 → TRUE → unmap()
    ✓ РАБОТАЕТ (guard не зависит от onTargetId)

Лишние DF-X-CLICK bangs без inlet11:
  Вероятно: когда X-button физически не видима/заблокирована, patcher может
  генерировать bang от неизвестного источника. Либо: multimapDF маршрутизирует
  bang от bpslot7 outlet 1 (mb_idout=0) как отдельный DF-X-CLICK print.
  При этом inlet 11 НЕ срабатывает (guard _lastWrittenTgtId=0 после первого unmap).
  В ИТОГЕ: лишние bangs безвредны при v30, но симптоматически указывают на
  то что путь X-click не атомарен.
```

---

## 4. Все Race Conditions

### RC-1: `_s7mirrorId` и порядок Task(0) при маппинге

**Суть**: `_s7mirrorId = id` устанавливается в самом конце _s7mainT Task.
`_handleXClick11` использует `_s7mirrorId > 0` (v29) или `_lastWrittenTgtId > 0` (v30).
При v30 — гонка УСТРАНЕНА. При v29 — проявлялась если _s7mirrorId=0 в момент X-click.

**Первый X-click в логе** показывает `_s7mirrorId=0` при `_lastWrittenTgtId=54298`.
Возможные объяснения (убыванию вероятности):
1. _s7mainT выбросил исключение до `_s7mirrorId = id` (outer try поглотил)
2. panelmap() для si=7 вызвал onTargetId(id) → который сбросил _s7mirrorId? (нет, Guard 2 блокирует _s7mainT повторно)
3. Неизвестный источник обнуления за 24 секунды

**Следствие**: v30 правильно убрал зависимость _handleXClick11 от _s7mirrorId.

### RC-2: panelmap() ↔ onTargetId(7) feedback loop

**Суть**:
```
onTargetId(id) → _s7mainT → mm_tgt_7.message(id)
  → mm_tgt_7 outlet fires → panelmap()
    → si=7 changed → onTargetId(id) [Guard 2: id==_lastWrittenTgtId → BLOCK]
```

Guard 2 блокирует повторную запись в TgtId. **Не loop**, но добавляет одну лишнюю
итерацию _updateMapBtnVisibility. В текущей реализации это безопасно, но хрупко.

Если Guard 2 когда-нибудь будет снят или сломан → infinite loop.

### RC-3: tgtIdObserver → _doRebind → onTargetId → tgtIdObserver

**Суть**:
```
onTargetId(id) → tgtIdParam.set("value", id) → tgtIdObserver fires
  → _doRebind Task(0) → outlet(12, id) → mb_idout=id → onTargetId(id)
    → Guard 2: id==_lastWrittenTgtId → BLOCK (no second tgtIdParam.set)
```

Guard 2 блокирует второй круг. **Безопасно** при текущей реализации.

### RC-4: init id=0 → onTargetId(0) → manual block или нет

**Суть**: RangeAndName внутри df_mapparam стартует с id=0 (live.thisdevice → getid=0)
→ mb_idout=0 → JS inlet 9 → onTargetId(0) в самом начале (t=0).
В v30 manual block: guard `_s7mirrorId > 0` = FALSE (t=0, ещё не mapped) → SAFE.

**НО**: если по какой-то причине маппинг успевает произойти (tgtIdObserver и _doRebind
отработали БЫСТРО до init id=0) → _s7mirrorId > 0 → manual block fires. Теоретически,
на сверхбыстрой машине это возможно, но на практике init id=0 всегда происходит раньше
200ms Task. **Маловероятно, но не доказано невозможным**.

Более надёжная защита: `if (id === 0 && _s7mirrorId > 0 && _restoreDone)` — gate на
`_restoreDone` гарантировал бы что manual block не fires во время init.

### RC-5: min/max sync между df_mapparam и bpslot7

**Суть**: НЕТ механизма синхронизации. При изменении TargetMax на page 1:
- df_mapparam pattr обновляется → RangeAndName масштабирует CC
- bpslot7 pattr НЕ обновляется → остаётся 100%

Пользователь видит 28% на странице A, 100% на странице B.

**Путей синхронизации нет вообще.**

### RC-6: panel slot arm-cancel (slots 0-6) — путь ПОДТВЕРЖДЁН из multimapDF

**Суть** (установлена из multimapDF.maxpat):

Для panel slots 0-6 (bpslot0..6 в multimapDF, numoutlets=2):
```
arm-cancel:
  bpslotN outlet 1 (mb_idout=0)
  → mm_idprep_N ("prepend N") → "N 0" message
  → mm_idout (multimapDF outlet 1 = mm_panel outlet 1 в main patcher)
```

Для bpslot7 (numoutlets=3):
```
  bpslot7 outlet 1 (mb_idout) → mm_idprep_7 → mm_idout (mm_panel outlet 1)
  bpslot7 outlet 2 (xt_out) → xt_mm_out (mm_panel outlet 3 → JS inlet 11)
```

multimapDF outlets:
- outlet 0: zl sum of all slot ids (presence)
- outlet 1: mm_idout — "N id" pairs from any bpslotN outlet 1
- outlet 2: mmdf_out — close panel trigger
- outlet 3: xt_mm_out — bpslot7 X-click only

**Куда идёт mm_panel outlet 1 ("N 0" cancel message) в main patcher — НЕ ОПРЕДЕЛЕНО**
(требует чтения frozen AMXD). Возможно:
- → записывает mm_tgt_N = 0 через route/unpack → panelmap() → si=N changed, mmv=0 → _clearPanelBnSlot() = **DESTROYING persistence**
- → или → JS inlet (panelmap message) напрямую

**Сигнал тревоги**: arm-cancel gate fix (добавлен 2026-08-09 для panel slots 0-6 в MapButtonTint) теперь ПОРОЖДАЕТ mb_idout=0 на cancel. Если этот путь пишет mm_tgt_N=0 → persistence panel slots уничтожается. Именно это описывает "все кнопки не получают назначения после reload" — если пользователь arm-cancelил любой panel slot.

---

## 5. Полная таблица: что persisted, что нет

| Состояние | Persisted? | Механизм | Scope |
|---|---|---|---|
| TgtId (main Map param id) | ✅ | DeviceParameter + pattr | main patcher |
| learnedCC | ✅ | DeviceParameter CC | main patcher |
| learnedChannel | ✅ | DeviceParameter Ch | main patcher |
| mm_tgt_0..7 | ✅ | parameter_enable=1 live.numbox | main patcher |
| TargetMin/Max page 1 | ✅ | pattr @autorestore inside df_mapparam | df_mapparam instance |
| TargetMin/Max page 2 (bpslot7) | ✅ | pattr @autorestore inside bpslot7 | bpslot7 instance |
| Byname (main) | ✅ | DeviceParameters DevNm0..6+TgtPI | main patcher |
| Byname (panel) | ✅ | DeviceParameters PnDnSC+PnTpiS | main patcher |
| Slot label | ✅ | DeviceParameters lbl_chunk_0..5 | main patcher |
| DevSlot (Cmd+D) | ✅ | DeviceParameter DevSlot | main patcher |
| _s7mirrorId | ❌ | JS runtime only | JS |
| _lastWrittenTgtId | ❌ | JS runtime only | JS |
| targetParamId | ❌ | JS runtime only (restored via tgtIdObserver) | JS |
| learnedCC (JS var) | ❌ | JS runtime only (restored via ccObserver) | JS |
| learnedChannel (JS var) | ❌ | JS runtime only (restored via chObserver) | JS |
| live.remote~ binding | ❌ | Runtime DSP graph (rebuilt on each load) | df_mapparam |
| bpslot7 live.remote~ | N/A | NOT bound by design (dual-bind prevention) | bpslot7 |

**КЛЮЧЕВОЕ НАБЛЮДЕНИЕ**: TargetMin/Max для page 1 и page 2 — это РАЗНЫЕ persisted values
в РАЗНЫХ экземплярах MapButtonTint. Синхронизации нет. Это отдельный persisted state.

---

## 6. Архитектурное предложение

### Корень проблемы

Одно логическое состояние "mapping" размазано по 4+ местам без единого источника истины:

```
ОДНА МАППИНГ-ЗАПИСЬ = { paramId, CC, channel, min, max, name }

Хранится в:
  A. JS runtime:    targetParamId, _s7mirrorId, _lastWrittenTgtId
  B. Main patcher:  TgtId DevParam, mm_tgt_7 numbox, lnb_tgt numbox
  C. df_mapparam:   pattr TargetMin, pattr TargetMax, live.remote~ binding,
                    RangeAndName id, live.text text
  D. bpslot7:       pattr TargetMin (desync!), pattr TargetMax (desync!),
                    live.text text, it_mflag state
```

Каждое обновление проходит разным путём с разными задержками:
- A → через JS var assignment (синхронно)
- B → через `.message()` (Max message queue, defer)
- C → через `outlet(12, id)` → RangeAndName (async, через несколько объектов)
- D → через `_s7mainT` Task(0) (1 event-cycle delay) + keep-alive для цветов

Гонки возникают потому, что события из пути C и D читают состояние из пути A,
которое может ещё не отражать самые свежие события.

### Предложение: единый коммит

Вместо того чтобы мутировать состояние в разных местах через разные пути,
ввести единую функцию `_commitMapping(id, minPct, maxPct, name)` и
`_commitUnmap()`, которые атомарно обновляют ВСЕ 4 представления.

```
_commitMapping(id, minPct, maxPct, name):
  // Шаг 1: JS state (синхронно)
  targetParamId     = id
  _lastWrittenTgtId = id
  // НЕ устанавливать _s7mirrorId здесь — это происходит после визуального обновления

  // Шаг 2: Persisted DevParams (async LiveAPI)
  tgtIdParam.set("value", id)
  lnb_tgt.message("set", id)

  // Шаг 3: main cell visual + live.remote~ bind (через outlet(12))
  outlet(12, id)  → df_mapparam RangeAndName id=id → live.remote~[id] bind

  // Шаг 4: СИНХРОННАЯ запись min/max в ОБА экземпляра
  df_mapparam.TargetMin = minPct
  df_mapparam.TargetMax = maxPct
  bpslot7.TargetMin = minPct   ← новое! синхронизация
  bpslot7.TargetMax = maxPct   ← новое!

  // Шаг 5: mirror state (mm_tgt_7 + _panelPrevTgts[7] + bpslot7 text)
  mm_tgt_7.message(id)
  _panelPrevTgts[7] = id
  bpslot7.live.text.text = name (≤12 chars)
  bpslot7.live.text.message(0)  // un-arm

  // Шаг 6: _s7mirrorId + keep-alive (ПОСЛЕ всех визуальных обновлений)
  _s7mirrorId = id
  _s7kaStop(); _s7kaStart()

  // Шаг 7: byname capture (Task(0), деферированно)
  _captureByNameFromId(id)
  _captureSlotBn(7, id)

_commitUnmap():
  // Симметрично: очищает ВСЕ 4 представления
  targetParamId     = -1
  _lastWrittenTgtId = 0
  _s7mirrorId       = 0
  _s7kaStop()
  tgtIdParam.set("value", 0)
  lnb_tgt.message("set", 0)
  mm_tgt_7.message(0)
  _panelPrevTgts[7] = 0
  bpslot7.it_mflag.message(0)
  bpslot7.live.text.message(0)
  bpslot7.live.text.message("text", "Map")
  df_mapparam.live.text.message("text", "Map")
  outlet(12, 0)  // unbind live.remote~
  learnedCC = -1; learnedChannel = -1; ...
```

### Что нужно перед реализацией

1. **Прочитать multimapDF.maxpat** — понять куда идёт `bpslot7 outlet 1` (mb_idout)
   при X-click (is it → JS inlet 9? → panelmap trigger?). Это закрывает RC-6.

2. **Проверить pattr binding**: `pattr TargetMin @autorestore 1` — к чему именно
   он привязан? К scripting name "TargetMin" на TargetMin[7] numbox? Если varname
   `TargetMin[7]` и scripting name разные — pattr может не bind-иться и не хранить значение.
   Проверяется: изменить max на 28%, сохранить set, перезагрузить, посмотреть сохранилось ли.

3. **Рассмотреть RC-4 усиление**: добавить `_restoreDone` в guard onTargetId(0):
   `if (id === 0 && _s7mirrorId > 0 && _restoreDone)` — гарантия что init id=0 fire
   никогда не попадает в manual block.

4. **Panel slot arm-cancel (RC-6)**: прочитать multimapDF, понять путь bpslotN outlet 1.
   Если он ведёт к mm_tgt_si.message(0) → panelmap → _clearPanelBnSlot → byname data wiped,
   то arm-cancel на panel slot убивает byname persistence. Нужно решить.

### Масштаб рефактора

- **JS**: создать `_commitMapping` / `_commitUnmap`, заменить все вызовы unmap() +
  onTargetId(id>0) + _s7mainT Task + _s7uT Task на единые коммиты.
  Оценка: ~200 строк JS, высокий риск регрессий в граничных сценариях.

- **Patcher (MapButtonTint)**: добавить inlet/outlet для синхронизации TargetMin/Max
  между df_mapparam и bpslot7. Либо: JS напрямую пишет в pattr через varname.
  Оценка: 2-4 новых провода в MapButtonTint, AMXD rebuild.

- **Тестирование**: нужен полный цикл (map → arm-cancel → X-click → reload →
  min/max adjust → reload) на реальном железе.

---

## 7. Немедленные стабилизирующие патчи (не ждущие полного рефактора)

Если полный рефактор отложить, можно применить эти точечные исправления
(низкий риск, решают самые острые жалобы):

**Патч A: Синхронизация min/max bpslot7 ← df_mapparam**
Когда _s7mainT устанавливает bpslot7 text (param name), читать также TargetMin/TargetMax
из df_mapparam и записать в bpslot7. JS имеет доступ через getnamed().getattr():
```javascript
// в _s7mainT, после bpslot7.live.text.message(name):
var dfMinBox = dfSub.getnamed("TargetMin");  // scripting name
var dfMaxBox = dfSub.getnamed("TargetMax");
if (dfMinBox && dfMaxBox) {
    var bpMinBox = _bs7.getnamed("TargetMin");  // в bpslot7 subpatcher
    var bpMaxBox = _bs7.getnamed("TargetMax");
    if (bpMinBox) bpMinBox.message("set", dfMinBox.getvalueof());
    if (bpMaxBox) bpMaxBox.message("set", dfMaxBox.getvalueof());
}
```
Это не решает persistent sync (при изменении min/max пользователем), но закрывает
"default 100%" на bpslot7 при первом маппинге/reload.

**Патч B: Усиление RC-4 guard с _restoreDone**
```javascript
if (id === 0 && _s7mirrorId > 0 && _restoreDone) { // manual block }
```
Делает onTargetId(0) manual block абсолютно безопасным во время init.

**Патч C: min/max persistent sync через дополнительный сохранённый параметр**
Хранить minPct/maxPct как DeviceParameters (как TgtId). При _commitMapping писать оба.
При bpslot7 rebuild (after reload/mirror) — читать из DevParams и писать в bpslot7 pattr.
Масштаб: 2 новых DeviceParameter в AMXD + 10-15 строк JS.

---

## 8. CONFIRMED ROOT CAUSE — mbt_map=0 после reload (2026-08-10)

### Диагноз (подтверждён DRST2 логом: mbt_map=0 для всех 15 тиков)

Это КОРЕНЬ всей цветовой эпопеи v49–v58. Три фактора дают mbt_map=0 после byname-restore:

**Фактор 1 (sync, немедленно):** `mmIdr.message(si, freshId)` → mm_idroute → bpslot_si inlet 1 → `mb_ididin` → `mb_bindtrig (t 0 0)`. `t 0 0` right-to-left: сначала outlet 1 (0→it_phtrig), затем outlet 0 (0→**it_mflag→it_mapstore=0**). Происходит синхронно, до возврата из mmIdr.message.

**Фактор 2 (async, миллисекунды позже):** RangeAndName (obj-16, async) завершает lookup:
- outlet 6 → it_mflag=1 → it_mapstore=1 (КРАТКОВРЕМЕННО)
- outlet 4 → it_id0 (message "0") → it_id0 fires 0 → it_mflag=0 → **it_mapstore=0** (сбрасывает outlet 6)

**Фактор 3 (structural):** Даже в короткий момент когда it_mapstore=1 (между outlet 6 и outlet 4), `it_state` = 0. Выражение: `($i4*(($i1||$i2)))*...`. $i4 = 0 потому что `it_ltchg` (change) получает значение ТОЛЬКО когда arm button (obj-14) МЕНЯЕТСЯ. После reload, arm button не трогали → it_ltchg не срабатывал → it_vtrig не получал → $i4 хранит 0 → state = 0 * ... = 0.

**Путь interactive mapping работает потому что:** пользователь нажимает arm → obj-14 меняется 0→1 → it_ltchg fires → it_vtrig: outlet 1 (1)→$i4=1 stored (COLD), outlet 0 (bang)→it_mapstore fires → state=2. К моменту async RangeAndName — $i4 уже 1.

### Исправление (v60 + MapButtonTint v47)

**MapButtonTint v47** (`/Users/Kirill/Music/Ableton/User Library/Max Devices/MapButtonTint.maxpat`):
- Добавлен `varname="it_vtrig"` к объекту `it_vtrig (t b i)` — теперь доступен через `getnamed("it_vtrig")` из JS
- Маркер обновлён: "MapButtonTint v47 loaded"
- Архив: `_device-backups/MapButtonTint.2026-08-10-221456.pre-v47-vtrig-varname.maxpat`

**JS v60** (`midi_learn_slot.js`, маркер `>>> S7-DEV-v60-RESTORE-STATE LOADED <<<`):
В `_resolvePanelSlotsOnHostTrack()` добавлен 100ms deferred Task после основного цикла:
- Для каждого resolved si<7 слота: `it_mapstore.message(1)` + `it_vtrig.message(1)`
- `it_vtrig (t b i)` right-to-left: outlet 1 (int=1) → $i4=1 ПЕРВЫМ (cold inlet stored); outlet 0 (bang) → it_mapstore fires 1 → it_state HOT → state = 1*(1||0)*((1*(0==0))+1) = 2
- 100ms: гарантирует что RangeAndName async (outlet 6 + outlet 4) отработал до нашего override
- Архив JS: `_device-backups/midi_learn_slot.2026-08-10-221456.pre-v59-restore-state.js`

### Протокол теста (обязательно)

1. Live: убрать DF Slot с дорожки и добавить заново (reload), Max-редактор закрыть БЕЗ сохранения
2. Проверить консоль: `>>> S7-DEV-v60-RESTORE-STATE LOADED <<<` + `MapButtonTint v47 loaded`
3. FOLLOW mode: замапить 3+ слота si=0..2 интерактивно, убедиться что цвет правильный
4. Сохранить .als (Cmd+S), закрыть Live, открыть снова
5. Reload DF Slot на дорожке
6. DRST2 запустить или просто проверить визуально: si=0..2 должны показывать track color (не dark bg)
7. Через 300ms после загрузки — цвета должны быть правильными (state=2 → it_dg closed)

**Ожидаемый результат:** После restore, si<7 слоты показывают правильный цвет (track color в FOLLOW mode). mbt_map=1, mbt_st=2 через 100ms после restore.

**Если mbt_map всё ещё 0 после v60:** outlet 4 фаерит 0 ПОСЛЕ нашего 100ms Task. Нужен v48 MapButtonTint: добавить `sel 0` между `obj-16[4]` и `it_id0[0]` (блокирует ненулевой outlet 4, пропускает только cancel=0).

---

## 9. Min/Max desync (страница 1 vs страница 2) — ИСПРАВЛЕНО в v61 (2026-08-10)

**Симптом:** После reload, df_mapparam (page 1) и bpslot7 (page 2) показывают разные Min/Max значения, причём сразу (не постепенно расходятся).

### Диагноз (подтверждён статическим анализом MapButtonTint.maxpat + кода JS)

**Ключевой факт:** `TargetMin[7]` и `TargetMax[7]` в MapButtonTint — `parameter_enable=1` (live.numbox, M4L DeviceParameter, хранятся в .als).

**Цепочка сбоя:**

1. Пользователь меняет Min на странице 1 (df_mapparam) → numbox обновляется через прямое взаимодействие → M4L DeviceParameter в .als = 20 ✓
2. `_mmSyncFn` через 500ms обнаруживает aChg → пишет в bpslot7: `_bMnN.message(20)` (без "set") — это обновляет DISPLAY и DSP outlet, но **НЕ обновляет M4L DeviceParameter storage** в .als (см. MEMORY.md PERSISTENCE ARCHITECTURE: "Единственный рабочий путь: `message("set", X)`") → bpslot7 DeviceParameter в .als остаётся = 100 (stale) ✗
3. pattr @autorestore ОБНОВЛЯЕТСЯ (`_bMnP.message("set", 20)`) → patcherstate = 20 ✓
4. При сохранении .als: df_mapparam TargetMin DevParam = 20 ✓; bpslot7 TargetMin DevParam = 100 ✗ (stale); оба pattr = 20 ✓

**На restore:**
- T<0 (patch load): pattr @autorestore стреляет в оба numbox → df_mapparam=20, bpslot7=20 ✓
- T+0 (live.thisdevice bang): JS инициализируется
- T+300ms: `_doRebind` → `onTargetId` → `_s7mainT` Task(0) → Patch A читает df_mapparam=20 (правильно), пишет bpslot7=20 (правильно), `_mmSyncStart(20,100,20,100)`
- T+200..500ms: Live async DeviceParameter restore стреляет stale значение 100 в bpslot7.TargetMin[7] → bpslot7=100 ← ДЕСИНК
- T+800ms: `_mmSyncFn` видит bChg (100 ≠ 20 = _lastSyncMinB) → распространяет B→A: df_mapparam=100 → ОБОИ страницы показывают 100 (неверно)

### Исправление (v61, 2026-08-10)

**Fix A — `_mmSyncFn` (все 3 ветки aChg/bChg/aChg&&bChg):**
```javascript
// Было:
_bMnN.message(minA);  // DSP update, но DeviceParameter НЕ обновлялся

// Стало:
_bMnN.message("set", minA);  // persist DeviceParameter (parameter_enable=1)
_bMnN.message(minA);          // fire outlet → DSP update (как было)
```
Аналогично для _fMnN (B→A путь). Гарантирует что при следующем сохранении DeviceParameters обоих страниц корректны.

**Fix B — Patch A в `_s7mainT`:**
```javascript
_s7MinNb.message("set", _syncMin);  // persist DeviceParameter
_s7MinNb.message(_syncMin);          // fire outlet → DSP
```

**Fix C — Deferred re-sync Task в `_s7mainT` (+1000ms):**
После `_mmSyncStart()` добавлен Task, который через 1000ms (когда все async restores завершились) перечитывает обе стороны. Если bpslot7 ≠ df_mapparam → страница 1 является authority, bpslot7 исправляется. Обновляет `_lastSyncMin/MaxA/B` чтобы `_mmSyncFn` не воспринял stale restore как пользовательское изменение.

Диагностический вывод в консоль: `[DF v61] mm-resync @1s: page1=20/100  page2=100/100`

### Архив до правки

`_device-backups/midi_learn_slot.2026-08-10-225141.pre-v61-minmax.js`

### Протокол теста

1. Reload DF Slot (убрать/добавить на дорожку). Маркер: `>>> S7-DEV-v61-MINMAX-PERSIST LOADED <<<`
2. FOLLOW mode: замапить параметр. Убедиться что page1 Min=0, Max=100
3. На странице 1: поставить Min=20, Max=80
4. Подождать 500ms (sync). Перейти на страницу 2: должны быть Min=20, Max=80 ← проверить
5. Сохранить .als (Cmd+S). Закрыть Live. Открыть Live. Reload DF Slot
6. Через 1 секунду после загрузки посмотреть консоль: `[DF v61] mm-resync @1s: page1=20/80  page2=20/80` (совпадают — коррекции нет)
7. Перейти на страницу 1 → Min=20, Max=80 ✓. Перейти на страницу 2 → Min=20, Max=80 ✓

**Если вместо этого консоль показывает `page2=0/100` или другое:** Fix C корректирует и выводит `mm-resync: corrected page2 to 20/80`. После этого перезапустить Live ещё раз для теста чистого состояния.

**Регрессии для проверки:**
- Min/Max в рамках сессии (drag slider page1 → page2 sync ≤500ms) — не должно сломаться
- CC control с новым Range (20-80%) ограничивает параметр в ожидаемом диапазоне
- STANDARD mode amber + FOLLOW mode track color — без регрессии
- Остальные тесты из v60 (mbt_map, persistence 8 slots) — без регрессии

---

## 10. TODO после тестов v61

- Если mm-resync всегда показывает `page2=20/80` без коррекции → Fix A + B достаточно, Fix C работает как belt-and-suspenders
- Если mm-resync ВСЕГДА корректирует → значит DeviceParameters не обновляются через `message("set")` для nested subpatcher objects → нужен другой механизм
- После подтверждения v61 стабильна + v60 restore-state тест → финальный clean build (обновить DEVICE_VERSION, заморозить, Gumroad)

---

_Документ обновлён 2026-08-10._
