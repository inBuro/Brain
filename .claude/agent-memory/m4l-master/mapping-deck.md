---
name: mapping-deck
description: Mapping Deck.amxd — текущее состояние, архитектура, история багфиксов (переименован из DF Master 2026-07-22).
metadata:
  type: reference
---

## Текущее состояние (2026-07-22)

**AMXD:** `Mapping Deck.amxd` md5=`988ff67e` (344400B, 755 boxes/387 lines, UNFROZEN).
**JS:** `mapping_deck.js` md5=`bcac0f77` (1199 строк, v3.1). Shadow: `Documents/Max 9/Max for Live Devices/DF Slot Project/code/mapping_deck.js`.
128 слотов (8 страниц × 16). Sub-патчеры: `MapCCButtonDF.maxpat`, `MapButtonDF_M.maxpat` (32 bpatcher в UL). НЕ live.remote~ — управление через `b.target.set("value", ...)`.
Старый `df_master.js` оставлен в UL как fallback для старых .als. ЗАМОРОЖЕН — дальнейших правок не планируется. autowatch=0, reload = убрать+добавить.

## Архитектура

Персист: df_sN_meta/p0/p1/p2 (512 numbox) + df_ch + df_pgN_t0..7 (64) = 577 параметров. Restore: observer на `df_s0_meta` → Task(200ms) → `restoreFromParams()` ("observer-delayed" в логе).

## Баги и фиксы

**BUG1-FIX: restore timing.** Observer срабатывал немедленно → `restoreFromParams()` читал параметры до того как Live их восстановил → слоты пустые. Фикс: Task(200ms) перед вызовом restoreFromParams(). Лог-сигнатура: `restoreFromParams("observer-delayed")`.

**BUG2-FIX v3.1: per-instance devMap.** SharedDict (v3) вызывал регрессию: rapid track switching → Task(0) читал `selected_track` от нового трека, записывал в Dict с track_id старого → _currentDevMap[b.devName] = undefined → b.target = null → CC не работало постоянно. Инстанс 1 (REC) не страдал (b.mixerTail не использует devMap). Фикс: убран SharedDict; каждый инстанс вызывает `_buildDevMap()` напрямую. Lazy slot resolve: `resolveForTrackChange()` только строит devMap (~20ms) + очищает targets; per-slot LiveAPI → `_lazyResolveSlot()` при первом касании. PERF: 3×~20ms = 60ms vs v2 3×~100ms = 300ms. Лог: `"PERF resolveForTrackChange: Nms"`.

**mm_icon bug (Max re-save bake).** textcolor/textoffcolor/activetextcolor/activetextoncolor запечены в трек-лайм `[0.9686,0.9569,0.4863]`, SA-expressions обнулены. Фикс: амбер `[1,0.678,0.337,1]` + SA `themecolor.live_lcd_control_fg`; bgoncolor dark + SA `themecolor.live_lcd_bg`. Диагностика re-save bake: grep `0.48627450980392156`.

**Perf: renderCurrentPage deferred 100ms.** onSelectedTrack → Task(0) вызывал `renderCurrentPage()` сразу: 3 инстанса × 32 outlets = 96 UI updates синхронно. Фикс: `_renderTask.schedule(100)`.

**Perf: anyMapped guard.** Пустой инстанс вызывал `_buildDevMap()` (~10–15 IPC) при каждом track-switch. Фикс: проверка anyMapped (128 SLOTS, ищем первый с path) перед resolveForTrackChange() → пропускаем devMap+render. 0 IPC для пустого. Лог: `"PERF onSelectedTrack Task: 0ms (empty — skip devMap+render)"`.

## Архивы (md5)

Pre-rename: AMXD `ebc049c5` (`Mapping Deck.2026-07-22.amxd`). JS `df_master.js` pre-rename: `a6722702`. Pre-lazypages: `9a058b94`. Pre-lazyresolve: `a0bccb77`. v3 SharedDict buggy: `76d661f7`. Pre-rendertask: `b8c5a069`. Pre-lazyresolve v3.1: `bac32921`. CURRENT JS: `bcac0f77`.
