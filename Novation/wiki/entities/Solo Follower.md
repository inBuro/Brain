---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-29
status: stable
tags: [m4l, js, liveapi, solo]
---

# Solo Follower

**Summary**: JS-скрипт `solo_follower.js`, держащий собственный трек устройства заSOLOенным, пока заSOLOен любой другой трек, удерживающий пользовательское выделение (`selected_track`) на месте даже при программном `set("solo")` и старающийся уместить в видимом viewport одновременно засоленный трек и трек, выделенный пользователем. **Неотъемлемая часть** [[XL_Performance — как это работает|XL_Performance]] — без него router-трек устройства глохнет под чужим solo, и весь смысл «mixer + instruments + сквозной MIDI» в одном устройстве разваливается.

**Sources**: `raw/XL_Performance.README.md`, [[solo_follower.js]]

**Last updated**: 2026-04-29

---

JS-скрипт [[solo_follower.js]], грузится внутри патча через объект `[js solo_follower.js]`. Должен лежать **в той же папке**, что и `XL_Performance.amxd`.

Цели:
1. Держать **собственный трек устройства всегда заSOLOенным, когда заSOLOен любой другой трек**.
2. **Не смещать выделение** (`selected_track`) Live'а ни на router-трек устройства, ни на засоленный — фокус остаётся там, где он был **до** того, как пользователь начал заходить в solo.
3. По возможности **удерживать в видимом viewport** оба интересных трека: тот, что ушёл в solo, и тот, на котором был фокус. Если они близко — оба видны, фокус на сохранённом. Если далеко — viewport уйдёт к сохранённому, но фокус не теряется.

## Алгоритм зеркалирования solo

1. На `bang` / `loadmess 1` / `live.thisdevice` → `safeInit()`.
2. Получает `this_device → canonical_parent` — это «свой» трек, чтобы исключить его из обзора. `ownTrackId` приводится к числу через `parseIntSafe(ownTrackApi.id)` — без этого сравнение `===` ломается из-за смешанных типов string/number из Live API.
3. Проходит по `live_set tracks` и `live_set return_tracks`, на каждом ставит `LiveAPI` observer на свойство `solo`. Все id треков тоже приводятся к числу через `parseIntSafe`.
4. Поддерживает счётчик `soloCount`, карту `soloStates[id]` и `lastSoloedExternalId` — последний трек, перешедший в solo.
5. На любое изменение solo дёргает `markSoloEvent()` (флаг `inSoloEvent` на 500 мс) и `scheduleApply(...)` (debounce через `Task.schedule(1)`):
   - `forceOwnSolo(soloCount > 0 ? 1 : 0)` синхронизирует свой `solo`.
6. Каждые **3 сек** (`TOPOLOGY_CHECK_MS`) — `topologyCheck()`: если число tracks/return_tracks изменилось → `rebuild()` всех observers.
7. `freebang()` корректно отписывается (важно при перезагрузке устройства).

## Защита фокуса (`selected_track`)

Без специальной логики Live, как побочный эффект программного `ownTrackApi.set("solo", v)`, перебрасывает выделение либо на router-трек, либо на трек с активным solo, либо на «соседний» — это сбивает контекст исполнителя во время рифф-перформанса. Решение реализовано через `LiveAPI` observer на `live_set view → selected_track` плюс прямое чтение `solo` свойства каждого «подозрительного» трека.

### Состояние

| Переменная | Назначение |
|---|---|
| `viewObserver` | observer на `selected_track` в `live_set view` |
| `lastUserSelectedId` | последний выделенный пользователем «обычный» трек (не router, не засоленный) |
| `pendingFocusRestore` | флаг «активен режим защиты фокуса»; держится пока сохранён solo |
| `savedSelectionForRestore` | id выделения, на который надо возвращать фокус |
| `inSoloEvent` | флаг 500 мс после любого внешнего solo-callback'а |
| `lastSoloedExternalId` | последний внешний трек, перешедший в solo (нужен для двухшагового viewport-set) |

### Ключевая эвристика — `readTrackSolo(id)`

Изменения `selected_track` отличаются от пользовательских кликов **прямым чтением** `solo` свойства целевого трека через свежий `LiveAPI("id <id>")`. Если трек уже засолен (`solo == 1`) — это side-effect от auto-select-on-solo Live'а, и мы:
- в **обычном режиме** не записываем такой id в `lastUserSelectedId`;
- в **режиме защиты** возвращаем фокус на `savedSelectionForRestore`.

Опираться только на наш кэш `soloStates` нельзя — view-callback может приходить раньше, чем solo-callback успеет обновить кэш.

### Поведение

**Обычный режим (`pendingFocusRestore = 0`):**
- view-observer обновляет `lastUserSelectedId` только если `idx > 0`, `idx !== ownTrackId`, `readTrackSolo(idx) !== 1`, `soloStates[idx] !== 1`.
- Если активен `inSoloEvent` — обновление пропускается полностью.

**Режим защиты (`pendingFocusRestore = 1`):**
- Включается в `forceOwnSolo(1)`, если `savedId > 0 && savedId !== ownTrackId`.
- При каждом изменении `selected_track`:
  - если `currentId === savedSelectionForRestore` → ничего;
  - иначе `isAutoShift = (currentId === ownTrackId) || (readTrackSolo(currentId) === 1) || (soloStates[currentId] === 1)`;
  - **Live-побочка** (`isAutoShift = true`) → возвращаем выделение на `savedSelectionForRestore`;
  - **пользовательский клик** (`isAutoShift = false`) → принимаем как новое значение, обновляем `savedSelectionForRestore` и `lastUserSelectedId`. Это позволяет юзеру сменить «куда возвращать», пока активен solo.

**Снятие защиты:**
- `forceOwnSolo(0)` (свой solo снимается) → `pendingFocusRestore = 0` сразу + 800 мс хвост `clearPendingTask` на случай поздних sweep'ов Live.

## Защита viewport (двухшаговый view-set)

Live API не даёт прямого управления scroll-позицией session/arrangement viewport — только `selected_track` влияет на видимую область. Чтобы по возможности удержать в кадре оба трека одновременно, в `forceOwnSolo` после `ownTrackApi.set("solo", v)` идёт **безусловный двухшаговый** view-set:

```js
if (v === 1 && lastSoloedExternalId не равен ownTrack/saved) {
    view.set("selected_track", "id " + lastSoloedExternalId);  // step 1
}
view.set("selected_track", "id " + savedSelectionForRestore);   // step 2
```

- **Step 1** скроллит viewport так, чтобы засоленный трек оказался в видимой области.
- **Step 2** ставит финальный фокус на сохранённый трек. Если он уже виден в текущем viewport (близко к засоленному), Live **не** скроллит ещё раз → оба трека остаются в кадре. Если сохранённый далеко — Live скроллит к нему, viewport уезжает (засоленный выпадает из кадра), но фокус не теряется.

Step 1 пропускается только в тривиальных случаях: `lastSoloedExternalId == savedSelectionForRestore` (юзер сам сейчас на засоленном) или `lastSoloedExternalId == ownTrackId` (защита от эха).

Поведение полностью полагается на встроенную в Live логику «не скролить, если трек уже виден»: на широком viewport step 1 — это no-op без визуального эффекта; на узком — даёт шанс уместить оба в кадре, либо честно показывает один из них.

> Попытка добавить эвристику с порогом дистанции по индексу (`VIEWPORT_NEIGHBOR_SPAN`, `shouldDoSoloedPrescroll`) для пропуска заведомо «бессмысленного» step 1 была отвергнута — она давала несимметричное поведение между первым и последующими solo (см. лог 2026-04-29). Текущая безусловная двухшаговая логика стабильно одинакова для любого по счёту solo и проще для понимания.

## Inlet и UI

`int 0/1` на инлет включает/выключает фолловер. На UI это `live.toggle` с varname `sf_active` (параметр **Active** в Live).

## Защита от гонок и валидация

- Флаг `rebuilding` блокирует повторный `tryInit`.
- При невалидном `LiveAPI` (`id == 0`) → `rebuildFailed()` с экспоненциальным backoff до `INIT_MAX_RETRIES = 40`.
- Все `api.get/set` обёрнуты в `try/catch` и `safeGetInt`.
- **Все id треков приводятся к числу** через `parseIntSafe` — это критично: Live API возвращает id в смешанных формах (string/number/array), и `===` без приведения ломает всю логику сравнения.

## Тонкости

- Собственный трек **исключается** из обзора по `ownTrackId` — иначе self-feedback.
- При смене сета observers пересобираются благодаря `topologyCheck`, но первое срабатывание может занять до 3 секунд.
- `extractSoloValue` разбирает оба варианта `args` (массив `[prop, value]` и просто число) — это разные версии Max API.
- `freebang()` чистит таймеры (`applyTask`, `clearPendingTask`, `soloEventTask`), все observers (`clearObservers` + `uninstallViewObserver`) и сбрасывает все state-переменные включая `lastSoloedExternalId`.

## Точки тюнинга

| Константа | Что меняет |
|---|---|
| `TOPOLOGY_CHECK_MS` | частота проверки изменения числа треков |
| `INIT_RETRY_MS` / `INIT_MAX_RETRIES` | стратегия повторов на холодном старте Live |
| `Task.schedule(1)` в `scheduleApply` | задержка дебаунса solo-зеркалирования (мс) |
| `soloEventTask.schedule(500)` | как долго после внешнего solo не доверяем `selected_track`-обновлениям |
| `clearPendingTask.schedule(800)` | хвост защиты после `forceOwnSolo(0)` на случай поздних sweep'ов |

## Известные ограничения

- **Скролл viewport при программном изменении `selected_track`** — это hard-limit Live API, отменить нельзя. Двухшаговый view-set минимизирует это для близких треков; для далёких — viewport всё равно уезжает к сохранённому, но фокус и звук остаются корректными.

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
- [[MIDI Passthrough]]
