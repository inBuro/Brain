---
name: sends-follower-persistence-automap
description: SF mapping persistence architecture (ranges vs target) + automap internals + Variant-D external-surface cut. Load-bearing param-index invariant for applySlotRanges.
metadata:
  type: project
---

# SF — персистентность маппингов + авто-слой + D-cut (2026-07-10)

Реверс на канонах `Sends Follower – {Return,Track}.amxd` (unfrozen, User Library). Разбор ради безопасного удаления авто-маппинга без потери маппингов сохранённых сетов (forSultry).

## Как персистятся маппинги (НЕОДНОРОДНО — критично)
- **Диапазоны min/max — персистятся НАТИВНО.** Внутри `MapButton.maxpat` на слот: ~~`pattr TargetMin @autorestore 1`~~ → изменено на `@autorestore 0` (2026-07-11, оба UL + Track shadow) для устранения `getparamvalue_typemanual` ошибок при загрузке. Диапазоны по-прежнему восстанавливаются через `live.numbox parameter_enable=1` + `live.thisdevice outlet0 → numbox → RangeAndName`. В `.als` они = `MxDIntParameter` (per-instance Manual-значения). Восстанавливаются сами при загрузке; переживают свап устройства, пока `multimap`/`MapButton` не тронуты (scripting-имена `TargetMin[n]`/`TargetMax[n]` стабильны, Live матчит по имени).
- **Цель (привязка `live.remote~`) — НЕ персистится.** Ставится программно `id $1 → live.remote~ inlet1` (рантайм, Live не сохраняет). Восстанавливается ТОЛЬКО replay авто-слоя: `liveready → mapall()` читает сохранённые `SF_*Idx` + флаг `SF_MapAll=1`.
- **`persistPath`/`restorepath` в js — ВЕСТИГИАЛЬНЫ/НЕ ПОДКЛЮЧЕНЫ.** В топ-патчере `pattr`=0, `restorepath`=0, `store`=0. `obj-46` out1 → только `route warn`; «store» уходит в неподключённый passthrough. Источника `restorepath` в obj-46 нет. Вывод: чисто ручные маппинги (без SF_*Idx) в текущем билде reload НЕ переживают — латентное ограничение.

## Param-index инвариант (load-bearing)
Live-API `device parameters N` (N=0 = Device On, дальше als-Index+1). Раскладка (проверено по .als):
- API 1-8 = `SF_DIdx1-8`; 10-17 = `SF_PIdx1-8`; 18-25 = `SF_TIdx1-8`; 9 = `SF_MapAll`.
- **API 26-33 = `TargetMax[1-8]`; API 34-41 = `TargetMin[1-8]`** (nested bpslot-параметры).
- `mapall()` читает didx=`params 1+s`, pidx=`10+s`, tidx=`18+s`. `applySlotRanges()` читает max=`26+s`, min=`34+s` → пушит в `TargetMax[7]`/`TargetMin[7]` через getnamed. Т.е. applySlotRanges читает ТЕ ЖЕ нативно-персистнутые Target-параметры и идемпотентно возвращает их в мультимаппер на replay. Диапазоны на replay НЕ затираются.
- `parameter_order` у всех = default (эмерджентный порядок). **⚠️ Нельзя удалять/переставлять SF-параметры так, чтобы сдвинулись индексы 26-41 — иначе applySlotRanges читает не те params и ломает диапазоны для ВСЕХ сетов.** `sf_cmd_minmax` — последний параметр (API 44), но удаление самого параметра даёт un-Live-проверяемый риск сдвига → его НЕ удаляли, оставили инертным.

## Авто-слой (карта)
- Внешняя запись LLM (AbletonMCP): Live-параметры `SF_TIdx/DIdx/PIdx` + `SF_MapAll` (основной вектор) и UDP-мост `sf_udp.js` (`sf_cmd_minmax`-команды min/max, set/mapall).
- Внутренний replay: `SF_MapAll=1` (restore) → `sf_mapall`(live.text) → `sf_mapall_sel`(sel 1) → `sf_mapall_msg`(msg mapall) → `obj-46 mapall()`. На Track биндинг `obj-46[4]→multimap_panel[1]`, на Return `obj-46[2]→…[1]`.
- js-функции авто: `mapall`, `tidx/didx/pidx`, `_setIdx`, `slotPathFromIdx`, `applySlotRanges`, `bpatcherRowY`. `targetmap()` — НЕ авто (feedback-warn, ядро).

## ПОЛНОЕ удаление авто-матрицы выполнено 2026-07-10 (final, заместило D-cut)
Решение founder: снести ВСЮ авто/LLM-матрицу; forSultry ремапнем по снапшоту (сохранность больше не ограничение). Двухфазно: сначала D-cut (UDP-транспорт), потом full-matrix.
Проверка перед удалением параметров: grep обоих js — фиксированный param-by-index читают ТОЛЬКО automap (`mapall`,`applySlotRanges`,`slotPathFromIdx`, все удаляются). Ядровые `resetMultimapSlots`/`midi_dial`-finder читают по ИМЕНИ (enumeration, index-independent). Ядровых читателей по индексу нет.

Удалено из ОБОИХ канонов (unfrozen repack: JSON@0x20, ptch LE@0x1C=filesize-0x20, суффикс=1 байт `\x00`, dlst нет):
- **Фаза D** (боксы 7): `udp_js`(js sf_udp.js), `sfcmd_gate/hold/open`, `rg_delay/defer/thisdev` + файл `sf_udp.js` (User Library + Track shadow code/).
- **Фаза full** — боксы: Return 52 (`sf_tidx/didx/pidx 0-7`, `prep_tidx/didx/pidx 0-7`, `sf_mapall`, `sf_mapall_sel`, `sf_mapall_msg`, `sf_cmd_numbox`); Track 28 (то же БЕЗ prep_*). Параметры снесены: `SF_TIdx/DIdx/PIdx 1-8`, `SF_MapAll`, `sf_cmd_minmax`.
- js (User Library + shadow): вырезаны `tidx/didx/pidx/_setIdx/slotPathFromIdx/mapall/applySlotRanges/bpatcherRowY`, массивы `tIdx/dIdx/pIdx`, `_pendingMapall` + replay-строка `liveready()`, `SF_TRACK_*_START`-конст (Track). node --check OK.
ОСТАВЛЕНО рабочим: ядро follow (`obj-46`→`multimap_panel[0]`→bpslot→live.remote~), ручной маппинг (`multimap_panel`,`mm_targetprep`,`targetmap`/`captureTarget`/`resolveAndConnect`/`restorepath`/`persistPath`/`arm`/`unmap`, feedback-warn), Target Min/Max (нативно), Return `mode_tab`/`wn_*`, Track `host_track_idx`/`midi_dial`/`send_menu`/knob/`resetMultimapSlots`, оба `version_node`/`vlink_*`.

Итог: Return 118→**59** box (117→57 line), md5 **`b6ca9c9b`** (33659 B). Track 108→**73** box (87→76 line), md5 **`3dfda13f`** (51917 B). Топ-параметры после: Return=`Mode`; Track=`host_track_idx`,`midi_dial`,`send_menu` (+ nested Target/Map в мультимаппере). Return shadow без code/ (js из User Library); Track shadow code/ синхронизирован.
Backups: `_device-backups/…preDcut…` (`6fabf587`/`2ffcff94`) и `…preFullMatrixRemoval…` + `…preFullMatrix.bak` js. Оригинал до всего: `51da7604`/`97f75d80`.

## Track-type warning (2026-07-11, переиспользован warn-слой)
Бывший feedback-loop warn переназначен под предупреждение о неверном типе трека. Детект: js `hostTrackClass()` парсит `this_device canonical_parent`.`unquotedpath` → `return`/`master`/`regular`/`unknown` (retry ×10 по 300ms при unknown); зовётся из `liveready()` (Return) / конца `init()` (Track).
- **Return** (`fb_warn` textbutton, переиспользована цепь `wn_route→wn_sel→wn_show/wn_hide`): текст → `Works on Return tracks only`; показ при `cls!=="return"`. Feedback-эмиссии `outlet(1,"warn",…)` в `recomputeWarn`/`updateFeedbackWarning` СНЯТЫ (расцеплены от дисплея; сами функции целы). Драйв — `checkHostTrackWarn()` → `outlet(1,"warn",1|0)`.
- **Track** (warn-слоя не было — ДОБАВЛЕН): бокс `tt_warn` (клон стиля `fb_warn`, prrect слота `version_link` [54,8,70,14], hidden) + `ttw_route`(route trackwarn)/`ttw_sel`(sel 0 1)/`ttw_show`/`ttw_hide`, переиспользован `vlink_thispatcher`. `obj-46` numoutlets 5→6; js `outlet(5,"trackwarn",1|0)`; показ при `cls!=="regular"`. Текст `Works on Audio/MIDI tracks only`.
- Финал геометрии warn-текста (2026-07-11):
  - **Return** `fb_warn`: founder сам расширил в ОДНУ строку до полной колонки `[0.25, 7.5, 123.75, 14]` (правый край ~124 сохранён, тянул влево до края устройства). md5 **`acfb51ca`**. Return НЕ трогаем.
  - **Track** `tt_warn`: **3 сложенных textbutton'а** (textbutton не многострочный) — `tt_warn`«Works on» [59,8,65,14] / `tt_warn2`«Audio/MIDI» [59,22,65,14] / `tt_warn3`«tracks only» [59,36,65,14]. Правый край 124, x=59 = правый край слайдера `obj-70`(x7..59) → **0 наезда**; низ y50 (чисто до `send_label` y126). `ttw_show`/`ttw_hide` шоу/хайдят все 3 + version_link. Стиль прозрачный оранжевый как `version_link`/`fb_warn`. md5 **`cc20da92`** (57625 B, box 80/line 82). Метрика (PIL AbletonSansBold 9px): usable≈box_w−8; «Works on Audio/MIDI» 87.7px не влезал в узкую левую колонку без наезда на слайдер → выбраны 3 строки.

## Warn — рантайм-фиксы + live-обновление (2026-07-11)
Два бага «warn не показывался» (оба статические, не догадки):
1. **Return**: D-cut удалил `rg_delay(delay 400)`, который питал НЕ только sfcmd-gate, но и `rg_msg(message "liveready")→obj-46` → `liveready()` не звался вообще (страдал и warn, и init follow-движка). Починка: восстановил выделенную цепь `rg_thisdev2(live.thisdevice)→rg_defer2(deferlow)→rg_delay2(delay 400)→rg_msg`. ⚠️ Урок: при D-cut проверять, не питал ли удаляемый узел ЯДРО (fan-out).
2. **Track**: js `outlets = 5`, а warn слал `outlet(5,...)` (вне диапазона; box numoutlets авторитетности не имеет — важна js-переменная). Починка: `outlets = 6`.
+ post()-инструментирование в обоих js (`hostTrackClass` печатает `canonical_parent path`; `checkHostTrackWarn` печатает `cls -> warn v (outlet N)`) — временно, снять после подтверждения.

**Live-обновление при переезде девайса** (2026-07-11): оба js УЖЕ имеют `devPathObs = new LiveAPI(onLiveChange,"this_device canonical_parent")` (`.property="name"`) — инстанс СОХРАНЯЕТСЯ при переезде, меняется canonical_parent, наблюдатель срабатывает (автор строил на нём move-детекцию `resetMultimapSlots`). Подцепил в `onLiveChange`: `_warnRetry=0; checkHostTrackWarn();` → warn гаснет/появляется живьём при перетаскивании на другой трек. JS-only, .amxd не трогал.

**Текст warn (правки пользователя, СОХРАНЯТЬ):** Return `fb_warn`=«Works on Return only»; Track `tt_warn`/`tt_warn2`/`tt_warn3` = «Works on» / «audio/midi» / «only» (пользователь поправил регистр/сократил). .amxd md5 после его правок: Return `77e71e3a`, Track `da68a2fc` — при js-правках НЕ переписывать .amxd, чтобы не затереть.

НЕ сделано (на потом): снять post() после подтверждения; тест founder → пересборка frozen dist-бандлов (`Sends Follower/dist/build-v1.0/`); ремап forSultry по снапшоту (project-копии `01e9b79c`/`3e4b4660` НЕ тронуты).

## forSultry снапшот (страховка)
`_device-backups/SendsFollower_pre-automap-removal_2026-07-10/forSultry_mappings_snapshot.{md,json}` — 10 SF-инстансов, 8 авто-мапленных, цели декодированы + non-default диапазоны. Инстансы #1/#2 slots1-2 = битый device-index (2064/2470/…) — баги авто-маппера, ремап вручную при надобности.
