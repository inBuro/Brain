---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-27
status: stable
tags: [m4l, js, liveapi, solo]
---

# Solo Follower

JS-скрипт `solo_follower.js`, грузится внутри патча через объект `[js solo_follower.js]`. Должен лежать **в той же папке**, что и `XL_Performance.amxd` — иначе Max не найдёт.

Цель — держать **собственный трек устройства всегда заSOLOенным, когда заSOLOен любой другой трек**, и автоматически фокусировать (`selected_track`) тот трек, который засолили последним.

## Алгоритм

1. На `bang` / `loadmess 1` / `live.thisdevice` → `safeInit()`.
2. Получает `this_device → canonical_parent` — это «свой» трек, чтобы исключить его из обзора.
3. Проходит по `live_set tracks` и `live_set return_tracks`, на каждом ставит `LiveAPI` observer на свойство `solo`.
4. Поддерживает счётчик `soloCount` и `lastSoloedExternalId`.
5. На любое изменение solo дёргает `scheduleApply(...)` (debounce через `Task.schedule(1)`):
   - `forceOwnSolo(soloCount > 0 ? 1 : 0)` — синхронизирует свой `solo` (сравнивает значение перед `set`, чтобы не плодить undo-транзакций).
   - `selectTrackById(lastSoloedExternalId)` — фокус на последнем заSOLOенном.
6. Каждые **3 сек** (`TOPOLOGY_CHECK_MS`) — `topologyCheck()`: если число tracks/return_tracks изменилось → `rebuild()` всех observers.
7. `freebang()` корректно отписывается (важно при перезагрузке устройства).

## Inlet и UI

`int 0/1` на инлет включает/выключает фолловер. На UI это `live.toggle` с varname `sf_active` (параметр **Active** в Live).

## Защита от гонок

- Флаг `rebuilding` блокирует повторный `tryInit`.
- При невалидном `LiveAPI` (`id == 0`) → `rebuildFailed()` с экспоненциальным backoff до `INIT_MAX_RETRIES = 40`. Полезно при загрузке Live-сета, когда `live_set` ещё не готов.
- Все `api.get/set` обёрнуты в `try/catch` и `safeGetInt`.

## Тонкости

- Собственный трек **исключается** из обзора по `ownTrackId` — иначе self-feedback.
- При смене сета observers пересобираются благодаря `topologyCheck`, но первое срабатывание может занять до 3 секунд.
- `extractSoloValue` разбирает оба варианта `args` (массив `[prop, value]` и просто число) — это разные версии Max API.
- `freebang()` чистит таймеры и observers; `autowatch = 1` корректно перезагружает скрипт при правках.

## Точки тюнинга

| Константа | Что меняет |
|---|---|
| `TOPOLOGY_CHECK_MS` | частота проверки изменения числа треков |
| `INIT_RETRY_MS` / `INIT_MAX_RETRIES` | стратегия повторов на холодном старте Live |
| `Task.schedule(1)` в `scheduleApply` | задержка дебаунса (мс) |
