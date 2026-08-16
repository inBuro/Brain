---
name: sends-follower-signal-path
description: SF modulation signal fan-out (multimap/MapButton) is INTACT — не наша регрессия. Full trace + why runtime break is elsewhere (Live cache / stale .amxd).
metadata:
  type: project
---

# SF modulation signal path — целостность проверена 2026-07-03

Расследование device-wide «замапленные target-params не двигаются» (Manual+Follow, обоих SF-Return/SF-Track). Гипотеза «наши scramble-правки (mm_idroute rewire + bpslot spacing) сломали сигнальный fan-out» — **ОПРОВЕРГНУТА**.

**Why:** нужно было исключить multimap как причину рантайм-поломки прежде чем трогать что-либо.
**How to apply:** при повторе симптома НЕ трогать сигнальный fan-out multimap/MapButton — он цел; искать причину в Live-кеше (stale загруженный .amxd) или в том, попадает ли pushValue в РАБОЧИЙ инстанс. Cmd+Q Live + повторный drag девайса — первый шаг.

## Полная сигнальная цепь (все 3 уровня целы, 0 dangling)
- Device (Return/Track `.amxd`): `js outlet0 → route max → change 0. → send ---max_send → receive → mm_sig (sig~)[0] → multimap_panel[0]`. Проверено в обоих девайсах.
- `multimap.maxpat`: inlet `obj-2`[0] (панель inlet 0) → фан в **inlet 0 каждого из 8 bpslot**: obj-1(bpslot1),obj-3(2),obj-4(3),obj-5(4),obj-6(5),obj-7(bpslot0!),obj-8(6),obj-9(7). ВСЕ 8 кордов present.
- `MapButton.maxpat`: inlet `obj-1`[0] → `obj-2 (clip~ 0. 1.)` → `obj-16 (p RangeAndName)` → `obj-5 (live.remote~, varname live_remote)[0]`.

## DIFF current vs pristine (07-01 preMapAll) — сигнальный fan-out БАЙТ-К-БАЙТУ идентичен
Сигнальные dests из `obj-2[0]` идентичны во ВСЕХ версиях: 07-01 preMapAll, 07-02 mapStyle, 07-03 1248/1421/1444, CURRENT. Ноль удалённых/добавленных/переехавших сигнальных кордов. То же в MapButton clip~-путь: identical.

## id/binding-канал (наш scramble-fix) — аддитивен, сигнал не задел
- multimap: `mm_ididin` (inlet 1) → `mm_idroute (route 0..7)` → out K → bpslot[slot K] inlet 1. Отдельный inlet, не смешан с сигналом.
- MapButton: `mb_ididin`→`mb_map_id (id $1, varname mb_map_id)` → фан в `RangeAndName[3]` + `live_remote[1]`. Зеркалит существующий `obj-20 (id 0)`.
- `obj-20 (id 0)` present в pristine И current; триггерится ТОЛЬКО от `obj-28 (X-кнопка)` — при mapall/load молчит, биндинг не сбрасывает.
- `mapall()` (Return) биндит по имени: `bpslot{s}.subpatcher().getnamed("mb_map_id").message(id)`. varname `mb_map_id` и `live_remote` присутствуют в current MapButton.

## pushValue() (sends_follower.js / _track.js) — НЕ блокирует значение
- def: `computeResult(m)` (0.0 если нет refs, иначе агрегат send) → guard ТОЛЬКО `isNaN` → `outlet(0,"max",result)`. **Guard `v<0` never-seen в pushValue ОТСУТСТВУЕТ** — pushValue игнорит `lastResult`, всегда шлёт текущий агрегат.
- Call sites: конец `mapall()` (стр.522); load-prime Task `tp.schedule(1200)` в start()/loadbang; `mode()` if `!pickupActive`. Все выстрелят безусловно и доставят ненулевой агрегат в sig~.
- Вывод: JS доставляет значение. `lastResult=-1` в buildRefs — только gate для onAnySendChange, pushValue его не читает.

## Итог
Ни multimap-fan-out, ни pushValue не объясняют рантайм-поломку. Оба канала статически корректны. Реальная причина рантайм-симптома — вне этих файлов: скорее всего **Live кеширует старый инстанс** (нужен Cmd+Q + re-drag) ИЛИ проблема в резолве live.remote~ target id в конкретном сете. НИЧЕГО не восстанавливал (нечего было). Детали id-fix/pushValue — в [[sends-follower]].
