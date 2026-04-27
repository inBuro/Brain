---
type: entity
tags: [solo-follower, javascript, live-api, observer]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# Solo Follower

JS-скрипт `solo_follower.js`, грузится внутрь патча через `[js solo_follower.js]`. Держит собственный трек устройства всегда в solo, когда заsoloен любой другой трек, и автоматически фокусирует последний заsoloенный трек.

## Алгоритм

1. На `bang` / `loadmess 1` / `live.thisdevice` → `safeInit()`
2. Получает `this_device → canonical_parent` — «свой» трек (исключается из обзора)
3. Проходит по `live_set tracks` + `live_set return_tracks`, ставит `LiveAPI` observer на `solo`
4. Поддерживает `soloCount` и `lastSoloedExternalId`
5. На изменение solo → `scheduleApply(...)` (debounce через `Task.schedule(1)`):
   - `forceOwnSolo(soloCount > 0 ? 1 : 0)`
   - `selectTrackById(lastSoloedExternalId)` — фокус на последнем заsoloенном

## Topology Check

Каждые **3 секунды** (`TOPOLOGY_CHECK_MS`) — `topologyCheck()`. Если число tracks/return_tracks изменилось → `rebuild()` всех observers.

## Защита от гонок

| Механизм | Назначение |
|----------|------------|
| `rebuilding` флаг | Блокирует повторный `tryInit` |
| Невалидный `LiveAPI` (id == 0) | `rebuildFailed()` с экспонентой попыток до `INIT_MAX_RETRIES = 40` |
| `try/catch` + `safeGetInt` | Обертка всех `api.get/set` |

## Inlet

`int 0/1` — включает/выключает фолловер (`sf_active` на UI).

## Очистка

`freebang()` — корректная отписка observers и таймеров при перезагрузке устройства. `autowatch = 1` для чистой перегрузки при редактировании скрипта.

## Тонкости

- Свой трек **исключен** по `ownTrackId` — иначе самоповтор
- `forceOwnSolo` сравнивает текущее значение перед `set` — не дергает undo-стек Live
- `extractSoloValue` обрабатывает оба варианта ответа Max API (массив `[prop, value]` и число)

## Связанные страницы
- [[Mixer Layer]] — один из слоев, с которым работает устройство
- [[Instruments Layer]] — другой слой
- [[MIDI Passthrough]] — проброс MIDI, в рамках которого работает Solo Follower
