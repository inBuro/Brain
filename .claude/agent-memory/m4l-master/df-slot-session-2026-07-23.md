---
name: df-slot-session-2026-07-23
description: Ключевые находки сессии 2026-07-23 — preset recall debug DF Slot. Архитектурные факты, классы багов, методология.
metadata:
  type: reference
---

# DF Slot — Находки сессии 2026-07-23 (preset recall debug)

## Архитектурные факты — ПОДТВЕРЖДЕНЫ ЭМПИРИЧЕСКИ

### Два механизма маппинга в одном устройстве

**Главная кнопка (Map Parameter / `df_mapparam` / `obj-46`):**
- Пишет в `lnb_tgt` (Stored Only Float, shortname="TgtId") через `ps_tgt (prepend set) → lnb_tgt[0]`
- `ps_tgt` необходим чтобы избежать feedback-loop (lnb_tgt out0 → JS inlet 9)
- Rebind после recall: JS-driven через `tgtIdObserver` → `_doRebind()` → `outlet(12, id)` → `obj-46 in1`
- CC-роутинг: JS читает `targetParamId`, вызывает `setVal(v)` → `outlet(0)` → `live.dial`

**Панельные слоты (mm_tgt_0..7 / multimapDF):**
- 8 bpatcher-инстанций MapButtonTint внутри `multimapDF.maxpat`
- Пишут в `mm_tgt_i` НАПРЯМУЮ (без prepend set), потому что mm_tgt_i не имеет исходящих связей
- CC-роутинг: аудио-rate через `live.dial → sig~ → mm_panel inlet 0 → bpslot_i inlet 0 → +~ 0. → live.remote~ inlet 0 (audio)`
- Привязка `live.remote~`: через `mb_ididin inlet 1 → mb_ididmsg "id X" → live.remote~ inlet 1` (binding inlet)
- `live.remote~` НЕ восстанавливается нативно через preset recall — нужен явный rebind

### live.remote~ не персистирует через recall нативно (ПОДТВЕРЖДЕНО)

Гипотеза "Live восстанавливает live.remote~ автоматически" — НЕВЕРНА эмпирически.
Факт: после recall все 8 панельных кнопок показывали "Map" (unbound).
Фикс: явный rebind в init Task, читает `mm_tgt_i.getvalueof()` → `mm_idroute.message(i, mmv)`.
При stale id — silent fail (graceful), live.remote~ просто не привяжется.

---

## Класс бага: live.object стреляет id=0 при init и перезаписывает stored value

**Pattern:** live.object (объект наблюдения LOM) при инициализации без активной привязки стреляет `id 0`.
Если этот 0 попадает в stored-value numbox (live.numbox с parameter_enable=1) без фильтра — перезаписывает восстановленное значение.

**В MapButtonTint:** live.object (obj-130) внутри inline RangeAndName (obj-16) → obj-133 "route id" out3 → РАНЬШЕ шло напрямую в ran_idout → mb_idout → ps_tgt → lnb_tgt = 0. Происходило ПОСЛЕ Live restore параметра → тихая перезапись.

**Фикс:** reroute через существующий `sel 0` (obj-31) который уже был в патчере: id=0 → outlet 0 (filtered), id=X → outlet 1 → ran_idout. Без новых объектов.

**Применимость к другим устройствам:** при переиспользовании MapButtonTint.maxpat — всегда проверять путь из `live.object → route id out3` на наличие фильтра нуля перед записью в персистентный numbox.

---

## Критичный факт: LiveAPI.set() vs patcher "set X"

`LiveAPI.set("value", X)` из JS:
- Обновляет значение DevParameter в LOM ✓
- Обновляет displayed value в UI ✓
- НЕ обновляет serialized stored value в `.adv`/`.als` ✗

Единственный путь к persistent stored value live.numbox:
- Patcher-message `"set X"` → live.numbox inlet 0 (= "set" message, без triggering output)
- ИЛИ обычный number message → inlet 0 (sets value + triggers output — осторожно с feedback)

**Проверено:** после recall с LiveAPI.set-persist → storedTgtId=0 (не сохранилось). После patcher "set X" → storedTgtId=54330 (сохранилось).

---

## Патчерная хирургия: добавление новых объектов — высокий риск

За сессию 3 подряд попытки добавить новые объекты в DF Slot AMXD через JSON — все сломались:
1. `sel 0` добавлен в main patcher → "object: no such object" при загрузке
2. `if $i1 > 0 then $i1` → "if: missing then" + "if: no such object"
3. Оба случая: Max не мог создать объект, но JSON был валидным

**Вывод:** добавление box-объектов через JSON-правку ненадёжно. Правильный подход:
- Чинить через существующие объекты + перекоммутацию проводов
- Если нужен новый объект — добавить через Max редактор вручную, затем прочитать получившийся JSON

---

## Событийная модель init Task (200ms)

```
t=0: device loads → Live restores параметры
t=200ms: init Task:
  1. _setupOwnParamObservers() → tgtIdObserver.property = "value" → fires сразу текущим значением
     - если lnb_tgt=0 (не восстановился ещё) → fires 0
     - если lnb_tgt=54330 (восстановился) → fires 54330 → schedules Task(0) → _doRebind()
  2. storedTgtId = read lnb_tgt via LiveAPI.get("value")
  3. _isDuplicate() check
  4. if not duplicate: panel rebind (mm_tgt_i.getvalueof() → mm_idroute.message(i, v))
t=200+160ms: _doRebind() завершается (PERF log показывал ~160ms)
```

Если Live не успел восстановить lnb_tgt за 200ms → tgtIdObserver fires 54330 ПОЗЖЕ как события изменения → _doRebind() отрабатывает через этот observer-путь.

**Уменьшение 200ms:** для главной кнопки безопасно (tgtIdObserver safety net). Для панельных слотов опасно (нет observer, getvalueof() может вернуть 0).

---

## Echo-loop guard pattern

Если JS пишет значение в параметр через LiveAPI.set() И слушает этот параметр через observer — собственная запись возвращается как "внешнее" изменение. Решение: `_lastSentValue` guard в observer callback — если значение совпадает с последним отправленным, игнорировать.

---

## Финальные md5 (2026-07-23 сессия 1 — preset recall fix)

| Файл | md5 | Строк | Изменение |
|------|-----|-------|-----------|
| `Dynamic Focus Slot.amxd` | `b74bff3b` | 97 boxes/138 lines | sel0 filter fix + ps_tgt restored |
| `MapButtonTint.maxpat` | `9724d178` | 127 boxes/220 lines | ran_idout rerouted + 3 print объекта удалены |
| `midi_learn_slot.js` | `c7495623` | 1400 | panel rebind добавлен, 28 debug post() удалено, LiveAPI check убран |

---

## Баг 2: панельные слоты не персистируют при drag → соседний трек (сессия 2)

### Корень причины

Byname-система (lnb_dn_0..6 + lnb_tpi) покрывала ТОЛЬКО главный слот (Map Parameter).
Панельные слоты (mm_tgt_0..7 → live.remote~) хранили только сырые runtime ID.
После новой сессии (reload .als) + drag → все старые ID стали stale → raw-id rebind тихо падал.

### Диагностика

- `_isDuplicate()` возвращает false (новая сессия → foundAny=false)
- else-ветка: `storedTgtId > 0`, `idExists = false` → byname resolve для главного слота ✓
- Panel rebind: `mm_idroute.message(i, staleId)` → live.remote~ остаётся unbound → кнопки "Map" ✗

### Фикс — Panel Byname (2026-07-23 сессия 2)

**AMXD**: добавлено 64 новых live.numbox (Stored Only, parameter_enable=1):
- 56 DN boxes: `pnl_dn_S_C` (S=0-7, C=0-6), shortname `PnDnSC`, mmax=2097152 (3 ASCII chars)
- 8 TPI boxes: `pnl_tpi_S` (S=0-7), shortname `PnTpiS`, mmax=1000000, initial_enable=1
- Итого: 105 → 169 boxes, md5 pre-fix=6daf0bed → post-fix=4edd104a

**JS** (1613 → 1829 lines, md5=47c418d9):
- Новые глобалы: `_pBnPids`, `_pendingPanelSi`, `_pendingPanelId`, `PANEL_SLOTS`, `_panelPrevTgts`
- `_findPanelBnParams()`: сканирует params по regex PnDnSC/PnTpiS → кэш PIDs
- `_encodePanelBn(slotIdx, devName, paramIdx, devOcc)`: пишет в pnl_dn_S_C + pnl_tpi_S
- `_clearPanelBnSlot(slotIdx)`: обнуляет panel byname numboxes (при unmap)
- `_captureSlotBn(slotIdx, paramId)`: async (Task(0)) capture devName/paramIdx/occ для слота
- `_resolvePanelSlotsOnHostTrack()`: читает byname из numboxes → скануеr host track → rebind
- `panelmap()`: теперь детектирует изменения в mm_tgt_N и вызывает `_captureSlotBn()` / `_clearPanelBnSlot()`
- `bang() Task`: добавлен `_findPanelBnParams()`; в stale-ID ветке → `_resolvePanelSlotsOnHostTrack()`; в Cmd+D ветке → тоже; _panelPrevTgts синхронизируется после resolve

### Тестовые шаги

1. В Live: DF Slot на трек А, замапить главную кнопку (Map Parameter) + 2-3 кнопки в панели
2. Сохранить .als, закрыть Live
3. Открыть тот же .als, drag DF Slot → трек Б
4. Max Console должен показать:
   - `[DF Slot] stale TgtId: byname resolved id=... dev=...` (главный слот)
   - `[DF Slot] panel slot N: byname resolved id=... dev=...` (каждый панельный слот)
5. Все замапленные кнопки (главная + панельные) должны показывать имя параметра, не "Map"

Shadow JS синхронизирован: `/Documents/Max 9/Max for Live Devices/DF Slot Project/code/midi_learn_slot.js`
