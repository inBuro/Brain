---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, js, liveapi, solo]
---

# Solo Follower

**Summary**: JS-скрипт `solo_follower.js`, держащий собственный трек устройства заSOLOенным, пока заSOLOен любой другой, и фокусирующий последний заSOLOенный.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

JS-скрипт `solo_follower.js`, грузится внутри патча через объект `[js solo_follower.js]`. Должен лежать **в той же папке**, что и `XL_Performance.amxd` — иначе Max не найдёт (source: XL_Performance.README.md).

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

(source: XL_Performance.README.md)

## Inlet и UI

`int 0/1` на инлет включает/выключает фолловер. На UI это `live.toggle` с varname `sf_active` (параметр **Active** в Live) (source: XL_Performance.README.md).

## Защита от гонок

- Флаг `rebuilding` блокирует повторный `tryInit`.
- При невалидном `LiveAPI` (`id == 0`) → `rebuildFailed()` с экспоненциальным backoff до `INIT_MAX_RETRIES = 40`. Полезно при загрузке Live-сета, когда `live_set` ещё не готов.
- Все `api.get/set` обёрнуты в `try/catch` и `safeGetInt`.

(source: XL_Performance.README.md)

## Тонкости

- Собственный трек **исключается** из обзора по `ownTrackId` — иначе self-feedback (source: XL_Performance.README.md).
- При смене сета observers пересобираются благодаря `topologyCheck`, но первое срабатывание может занять до 3 секунд.
- `extractSoloValue` разбирает оба варианта `args` (массив `[prop, value]` и просто число) — это разные версии Max API.
- `freebang()` чистит таймеры и observers; `autowatch = 1` корректно перезагружает скрипт при правках.

## Точки тюнинга

| Константа | Что меняет |
|---|---|
| `TOPOLOGY_CHECK_MS` | частота проверки изменения числа треков |
| `INIT_RETRY_MS` / `INIT_MAX_RETRIES` | стратегия повторов на холодном старте Live |
| `Task.schedule(1)` в `scheduleApply` | задержка дебаунса (мс) |

(source: XL_Performance.README.md)

## Запланированные изменения

### 🟡 Убрать смещение фокуса (запрос пользователя 2026-04-28)

**Проблема:** во время рифф-перформанса, когда исполнитель уходит в соло на одном из инструментов, Solo Follower вызывает `selectTrackById(lastSoloedExternalId)` и **смещает `selected_track` Live** на заSOLOенный трек. Это сбивает контекст исполнителя — фокус прыгает помимо его воли.

**Желаемое поведение:** фокус (`selected_track`) **не меняется** ни при каких изменениях solo — ни при входе в соло на инструменте, ни при выходе. Solo-зеркалирование собственного трека (`forceOwnSolo`) сохраняется как есть.

**Где править в `solo_follower.js`:**
- Удалить (или заглушить флагом) вызов `selectTrackById(lastSoloedExternalId)` в `scheduleApply`.
- Решить судьбу `lastSoloedExternalId` и связанных observer-полей — если они больше нигде не используются, можно убрать целиком; если оставить «на будущее», достаточно перестать их применять.
- Inlet/UI-флаг (опционально): добавить второй `live.toggle` (например, `sf_focus`) рядом с `sf_active`, чтобы фокусирование можно было включать обратно без правки кода. Если решено, что фокус не нужен никогда — флаг не заводить, удалить функциональность.

**Открытые вопросы:**
- Делать ли поведение конфигурируемым через UI-toggle или удалить focus-логику полностью? *(ждёт решения)*

## Related pages

- [[XL_Performance — как это работает]]
- [[XL_Performance README]]
- [[MIDI Passthrough]]
