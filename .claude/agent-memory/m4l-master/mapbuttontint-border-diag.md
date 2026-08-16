---
name: mapbuttontint-border-diag
description: MapButtonTint черная обводка в Standard — dev-среда создана 2026-07-16; V20 портирован в продакшн 2026-07-17
metadata:
  type: project
---

# MapButtonTint bordercolor — диагностика черной рамки (Standard режим)

## CURRENT STATUS (2026-07-17) — PORT V20 → PRODUCTION COMPLETE

### Финальные продакшн-файлы (порт V20 завершён)

| Файл | md5 | Размер | Изменения |
|------|-----|--------|-----------|
| `Dynamic Focus Slot.amxd` | `85b2f924` | 58272 B | pg_name_edit patching_rect W/H → presentation W/H (H:50→26, W:118→98.67): устраняет layout/clip mismatch (textedit layout по patching, clip по presentation) |
| `MapButtonTint.maxpat` | `d061ed69` | 130231 B | it_dgc expr-фикс + mb_bindtrig | ← pre-preset-recall-fix; CURRENT prod = `539e870b` (sel0-filter 2026-07-23) |
| `multimapDF.maxpat` | `37e6ccf7` | 142584 B | без изменений |
| `midi_learn_slot.js` | `4cd076f0` | 44716 B | MAX_LABEL_LEN=8 (15pt/98.66px; 8×11=88 ✓, 9×11=99>98.66 ✗) |
| `monitor_init.js` | `eb3da0d9` | 2047 B | 5 spam post() удалены |

**История AMXD после порта V20:**
- `496c066b` (57860 B) — PORT V20 complete (96 boxes/139 lines), mm_icon fix; compact JSON
- `aa879a1f` (141477 B) — промежуточное (JSON indented, итерации высоты)
- `8ed133a1` (58300 B) — pg_name_edit rebuilt: ptc_H/pr_H aligned, H=44
- `b30e77c1` (140915 B) — пользователь создал obj-16 (clean fs=16 test), удалил старый pg_name_edit; шнур потерян; JSON снова indented
- `728e5542` (58229 B) — obj-16 удалён, pg_name_edit создан начисто (но с неверной геометрией [39,48,103,44])
- `b889e2a5` (58229 B) — CURRENT: геометрия заменена на VERBATIM пользователя [40.5,57.5,100,26] / ptc [110.75,69.75,140,50]

Контаминация (`_dev_`, `DEV-V`, `DEV-JS`, `dfs_dump`, `devdump`, `mode_rs`, `/tmp/`): ALL 4 FILES CLEAN.

**Диагноз edit-mode клиппинга pg_name_edit (2026-07-17):**
- Корень: `patching_rect H=48 ≠ presentation_rect H=27`. Max textedit в edit-режиме использует `patching_rect` для внутренней раскладки курсора/селекции (bufferHeight), а `presentation_rect` — только как clip-окно. При patchH > presentH нижняя часть курсора невидима → клиппинг.
- Вторичное: patchW=349 ≠ presentW=103 (разные ширины→разная разбивка строк между режимами). 
- Третичное: дробные coords (1170.0000348687172, 209.33333957195282) — накопленный мусор.
- Четвертичное: `text="ывфывфв"` — застрявший дебаг-текст запечён в JSON.
- Фикс: patching_rect→[1170,210,103,44] (integer, W=H= presentation), presentation_rect H→44, text→"".
- Архив до фикса: `Dynamic Focus Slot.2026-07-17-192752.amxd` = `aa879a1f`

Архив pre-port: `~/Brain/fadercraft/_device-backups/PRE-PORT-2026-07-17/`
- `Dynamic Focus Slot.amxd` = `8e38a081` (127965 B)
- `MapButtonTint.maxpat` = `eba6508b` (129640 B)
- `multimapDF.maxpat` = `37e6ccf7` (142584 B)
- `midi_learn_slot.js` = `c69bc19e` (38897 B)

Архив pre-AMXD-port (последний бэкап до правки AMXD): `Dynamic Focus Slot.2026-07-17-182023.amxd` = `8e38a081`

### Что добавлено в Dynamic Focus Slot.amxd (C)

**Boxes (+12):**
- `mm_tgt_0..7` — 8× live.numbox (parameter_enable=1, Stored Only, varname=mm_tgt_N, mmax=10000000, longname="Panel TgtId N") — персист TgtId для 8 слотов панели; читаются из JS `_updateMapBtnVisibility()` через `this.patcher.getnamed("mm_tgt_N")`
- `ps_tgt` — prepend set; цепочка `obj-46[1]→ps_tgt[0]→lnb_tgt[0]` — silent SET TgtId при маппинге главной ячейки
- `mm_trig_b` — t b; `mm_trig_msg` — message panelmap; цепочка `mm_panel[1]→mm_trig_b→mm_trig_msg→obj-4[0]` запускает `panelmap()` в JS при маппинге панельной строки
- `mmi_bgon` — message "bgoncolor $4 $5 $6 1."; цепочка `dev_thg/mmi_trkg→mmi_bgon→mm_icon` — передаёт bgoncolor mm_icon при tint-обновлении

**Примечание по размеру:** исходный prod AMXD был 127965 B (JSON с indent'ом от предыдущей пересборки). Пересборка с compact JSON → 57860 B. Функционально идентично; Max парсит оба формата.

### Тест на железе после перезагрузки

1. Убрать `Dynamic Focus Slot.amxd` с MIDI-трека, перетащить заново (очистить Live-кеш)
2. **Главная ячейка:**
   - Standard → нажать Map → выбрать параметр → ячейка: amber fill + тёмный текст, МГНОВЕННО (нет 700ms паузы)
   - Unmap → холодное состояние
3. **Panel cells (multimapDF):**
   - Замапить строку в панели → ячейка: amber fill + тёмный текст, мгновенно
   - JS console после load: нет "SendMessage error 2"; нет "Live API is not initialized" спама
4. **Reload Set:** TgtId главной ячейки и всех 8 панельных слотов восстановлены (персист через lnb_tgt / mm_tgt_0..7)
5. **Follow mode:** tint работает, mm_icon получает bgoncolor от mmi_bgon

---

## PREVIOUS STATUS (2026-07-17) — DEV-JS-V20

### Файлы DEV-V20
| Файл | md5 | Размер | Что изменено |
|------|-----|--------|-------------|
| `_dev_DF-Slot.amxd` | `f42b0c45` | 60155 B | UNCHANGED (V18); ptch=60123 инвариант OK |
| `_dev_midi_learn_slot.js` | `cb49b024` | 58189 B | V20: _updateMapBtnVisibility Standard+mapped: добавлено lcdbgcolor=amber + inkFor(amber)→INK_DARK (main cell + panel cells); убран _colorForBtn (читал тёмный фон → белый текст); маркеры V20 |
| `_dev_MapButtonTint.maxpat` | `c96b866f` | 131141 B | UNCHANGED (V19); 133 boxes/226 lines |
| `_dev_dfs_dump.js` | `446b946f` | 822 B | V20: маркеры only |

### V20 — регресс filled→outline восстановлен

**Регресс V19:** Закрытие gate `it_dg` в Standard+mapped предотвратило amber lcdcolor overwrite — цель достигнута. НО: `it_dg` гейтил ВСЕ выходы `p setButtonColor`, включая `lcdbgcolor=amber`. После V19 `lcdbgcolor` оставался тёмным (тема ~0.08). `_colorForBtn` читал его → `inkFor(0.08,0.08,0.08)` → hsp=0.08 < 0.5 → `INK_LIGHT=[0.96]` → JS устанавливал белый `lcdcolor`. Итог: белый текст на тёмном фоне (outline-вид без заливки).

**Фикс V20 (только JS):** `_updateMapBtnVisibility()` для Standard+mapped теперь сам выставляет:
```js
var AR = 0.999999, AG = 0.678, AB = 0.337; // lcd_control_fg amber
var mbInk = inkFor(AR, AG, AB); // hsp≈0.763 > 0.5 → INK_DARK=[0.06,0.06,0.06]
mainBtn.message("lcdbgcolor", AR, AG, AB, 0.999999); // amber fill
mainBtn.message("bordercolor", AR, AG, AB, 0.999999); // border = fill (merges)
mainBtn.message("lcdcolor", _fa(mbInk[0]), _fa(mbInk[1]), _fa(mbInk[2]), 0.999999); // dark text
```
Патч (it_dg закрыт V19) ничего не перезаписывает. JS владеет полным визуалом Standard+mapped.

**Состояния после V20:**
- Standard+cold: `it_dg` открыт → `lcdcolor=amber` из it_zpak → amber text outline (правильно) ✓
- Standard+mapped: JS → lcdbgcolor=amber, lcdcolor=dark → amber fill + dark text (filled view) ✓
- Follow: JS не входит в `if(standardMode)` ветку → tint-путь через mmi_trkg (нетронут) ✓
- Тайминг: мгновенный (V19 gate блокирует async state-machine overwrite, V20 JS ставит оба цвета) ✓

### Архив V19 → V20
- `_dev_midi_learn_slot.2026-07-17-175827.js` (md5=`d26deec7`, V19 pre-V20)
- `_dev_dfs_dump.2026-07-17-175827.js` (md5=`fd1db35e`, V19 pre-V20)

### V19 — что исправлено: gate it_dg в Standard+mapped

**Корень 700ms паузы (найден при сравнительном трейсе с Abl.MapUi.maxpat 2026-07-17):**

Когда JS вызывает `_updateMapBtnVisibility()`, он устанавливает тёмный `lcdcolor` (INK_DARK) на Map-кнопке. Но почти немедленно (~10ms) приходит асинхронный ответ `RangeAndName` (обновление mapcount) — он активирует state machine, которая посылает amber lcdcolor через цепочку:
```
it_stfan[1] → it_dgc(==0) → 1 (gate open) → it_dg → it_rt → obj-14 lcdcolor=amber
```
В Standard режиме `it_state` формула всегда даёт state=0 (т.к. isFollow=0 множитель), поэтому `it_dgc (==0)` = 1 и gate `it_dg` **всегда открыт**. Amber перезаписывал тёмный. 700ms Task восстанавливал тёмный после того, как async settle завершался — пользователь видел паузу.

**Фикс V19:** изменена логика `it_dgc`:
- Было: `== 0` (gate open when state==0 — always in Standard)
- Стало: `expr ($i1==0)&&!($i2&&$i3)` — gate открыт ТОЛЬКО если НЕ (Standard AND mapped)

Новые входы:
- `it_stfan[1] → it_dgc[0]` (уже было, hot inlet, триггерит expr)
- `it_isstd[0] → it_dgc[1]` (НОВОЕ, cold, Standard=1 / Follow=0)
- `it_mflag[0] → it_dgc[2]` (НОВОЕ, cold, mapped=1 / cold=0)

**Таблица состояний:**
| State | isStandard | isMapped | Результат expr | it_dg |
|-------|-----------|----------|----------------|-------|
| 0 | 1 | 0 | (0==0)&&!(1&&0)=1 | OPEN → amber fire ✓ (cold Standard) |
| 0 | 1 | 1 | (0==0)&&!(1&&1)=0 | CLOSED → no amber ✓ (Standard+mapped!) |
| 0 | 0 | 0 | (0==0)&&!(0&&0)=1 | OPEN ✓ (Follow cold) |
| 0 | 0 | 1 | (0==0)&&!(0&&1)=1 | OPEN ✓ (Follow: gate managed separately) |
| 1 | 1 | 1 | (1==0)&&...=0 | CLOSED ✓ (was same before) |
| 2 | 0 | 1 | (2==0)&&...=0 | CLOSED ✓ (Follow mapped, was same before) |

**Синхронизация входов it_dgc[2]:** `it_mflag` (x=1050) → `it_dgc` (x=1490) и `it_mapstore` (x=700). Max right-to-left ordering для unordered connections: it_dgc (x=1490) правее it_mapstore (x=700) → `it_mflag → it_dgc[2]` fires ПЕРВЫМ, обновляя inlet[2] до того, как chain `it_mapstore→...→it_stfan→it_dgc[0]` доходит до expr. 

**700ms Task сохранён** как safety net (Follow-mode tint + edge cases).

### Архив V18 → V19
- `_dev_MapButtonTint.2026-07-17-165653.maxpat` (md5=`31f4f9df`, V18 pre-V19)
- `_dev_midi_learn_slot.2026-07-17-165744.js` (md5=`f10f9798`, V18 pre-V19)
- `_dev_dfs_dump.2026-07-17-165744.js` (md5=`377c9e76`, V18 pre-V19)

### V18 — что исправлено (три пункта координатора)

**1. Панель всё ещё мигала ~1с (V17 JS-getnamed loop не работал)**
Корень: `this.patcher.getnamed()` из родительского JS-контекста не может достучаться до объектов ВНУТРИ вложенных bpatcher-инстансов (bpslot0..7 в multimapDF).
Канонный фикс (по образцу `Abl.MapUi.maxpat`): перенесено ВНУТРЬ `_dev_MapButtonTint.maxpat` как патч-кордная цепочка:
```
mb_ididin[0] → mb_bindtrig (t 0 0) → [0]→it_armmetro[0] (stop), [1]→it_phase[0] (reset counter)
```
Max порядок срабатывания (правый→левый): сначала outlet[1] сбрасывает counter (фаза=0 → state machine финализируется корректно), потом outlet[0] останавливает metro. Каждый инстанс управляет собой локально — никакого JS getnamed.

**2. Спам SendMessage error 2 + "Live API not initialized" ×5 (регресс V17)**
Корень: JS-код `arm_phase.message(0)` в `_doRebind()` выполнялся до `_initialized=true`, запускал counter → state machine → it_zq → live.colors → Live API ошибка.
Фикс: весь JS-side stop-код удалён из `_doRebind()` (патч-фикс делает его ненужным; `_updateMapBtnVisibility()` сохраняет guard `if (!_initialized) return`).

**3. mm_icon bgcolor кремовый (V17 удалил не то)**
V17 удалил `obj-55[0]→obj-59[0]` (sel=0: bgcolor "LCD Background") — правильно, но ошибочно.
Реальный виновник кремового: `obj-62[0]→obj-61[0]` (sel=1: bgcolor "LCD Text / Icon (Inactive)").
V18 удаляет эту линию из p ButtonColor. Обе bgcolor-линии теперь отсутствуют → mm_icon держит expression-based `themecolor.live_lcd_bg` (тёмный) независимо от состояния panel mapping.

### Abl.MapUi.maxpat — канонный компонент (найден 2026-07-17)
Путь: `/Users/Kirill/Documents/Max 9/Max for Live Devices/LFO Project/Abl.MapUi.maxpat` (md5=`f0023a48`, 38 boxes/41 lines).
3 inlets (param_id, reset_btn, arm_state) / 7 outlets. **Ключевая разница от нашего MapButtonTint:**
- Blink управляется отдельным `arm state` сигналом (inlet 3 = 0 armed/1 not, or vice versa), а не через mode-gate
- Blink гасится НЕМЕДЛЕННО при выборе параметра: `arm_state=0 → p ButtonColor inlet 1 → qmetro.message(0)+gate.close` — NO PAUSE
- Имя параметра: `p SetName` → `text $1, texton $1` (оба состояния live.text сразу)
- `qmetro 200` вместо `metro 200` (тихая версия: не стреляет без DSP)
- **Нет global sends** для bgcolor: все цвета через lcdbgcolor/lcdcolor/inactivelcdcolor
- Глобальные sends: `s ---mappedState` (для соседних компонентов LFO) + `s ---modMode`

**Сравнение и вывод**: НЕ заменять MapButtonTint на Abl.MapUi — наш форк несёт tint/hidden/border-логику специфичную для DF Slot. Но механизм arm-state из Abl.MapUi можно перенять в будущем для устранения gating: вместо getnamed(arm_metro).stop() — выделенный inlet "arm done" в MapButtonTint. Текущий V17 (varname+stop) функционально эквивалентен.

### V15 архивы (pre-V16)
| Файл | Путь |
|------|------|
| `_dev_midi_learn_slot.2026-07-17-135113.js` | `~/Brain/fadercraft/_device-backups/` |
| `_dev_MapButtonTint.2026-07-17-135113.maxpat` | `~/Brain/fadercraft/_device-backups/` |
| `_dev_DF-Slot.2026-07-17-135113.amxd` | `~/Brain/fadercraft/_device-backups/` |

### V16 fix — механика arm-blink stop
**Проблема:** `outlet(12, rid)` в `_doRebind()` запускает mb_ididin → state machine в MapButtonTint. Metro (it_armmetro, 200ms) продолжает тикать ПОСЛЕ bind и перезаписывает lcdcolor=dark-ink из `_updateMapBtnVisibility()` →желтая пауза ~600-700ms.

**Корень:** metro не получает `0` при bind (arm_mg закрывает/открывает поток только от obj-14, не от событий bind).

**Фикс (V16):**
1. Добавлены `varname="arm_metro"` и `varname="arm_phase"` в `_dev_MapButtonTint.maxpat` (it_armmetro/it_phase не имели varname до V16).
2. В `_doRebind()` после `outlet(12, rid)`:
   ```js
   var mbPat = this.patcher.getnamed("df_mapparam").subpatcher(0);
   mbPat.getnamed("arm_metro").message(0);      // stop metro
   mbPat.getnamed("arm_phase").message("reset"); // reset counter → phase=0
   ```
3. `_updateMapBtnVisibility()` сразу после — metro остановлен, lcdcolor finalizes.
4. 700ms Task сохранён как idempotent guard.

**Инвариант arm-blink ДО bind:** не нарушен — metro стартует при нажатии Map (через arm_mg→mb_ididin цепочку), V16 только добавляет stop при успешном bind.

### V14 регресс — анализ причины

**Симптом**: mm_icon пропадает визуально через ~1.5–2с после старта девайса.

**Подозреваемый 1 — mode_rs_dl (1500ms)**: ИСКЛЮЧЁН.
Цепочка: mode_rs_dl→mode_rs→mm_panel[3]→mmdf_mode→mmdf_stdsel(sel 1)→mmdf_lcq→mmdf_lcc(live.colors)→mmdf_lcr→mmdf_a_at/aton/bord → сообщения цвета на inlet[0] mmdf_close (live.text). Сообщения типа `activetextcolor R G B 1.` устанавливают атрибут молча — outlet[0] live.text НЕ срабатывает. mmdf_t→mmdf_out (outlet[2] mm_panel) НЕ firing. Параллельная ветка (slot bpatchers→mm_idout→mm_panel outlet[1]→mm_trig_b→panelmap() в JS) вызывает только _updateMapBtnVisibility() которая НЕ трогает mm_icon. ИСКЛЮЧЁН как прямая причина.

**Подозреваемый 2 — геометрия V14**: ВИНОВНИК.
V14 сдвинул mm_icon с x=163 на x=181. Это совместило левый край mm_icon (x=181) с правым краем mm_panel в развёрнутом состоянии (mm_exp: presentation_rect [0,0,181,169] → правый край x=181). Бпатчер рендерит фоновый прямоугольник до своего правого края включительно. При x=181 mm_icon попадает на пиксельную границу бпатчера и гасится рендером. В V13 mm_icon (x=163) находился в INTERIOR зоне панели, покрывал mmdf_close (Z=13 < 27) — визуально устойчиво.

**Фикс**: реверт mm_icon и mode_icon x=181→163, obj-46 W=178/H=14→160/15 (согласованно с mm_col-скриптом который итак перезаписывает obj-46 в [1,153,160,15] при старте).

**Таймингт 1.5с**: mode_rs_dl совпадает по времени но НЕ является причиной. Реальная причина — геометрия, но mm_icon при x=181 нестабильно исчезает именно когда mm_buttoncolor через mmi_bcg посылает 8 color-update'ов подряд (из slot targetid reporting) что совпадает с 1500ms.

### Унификация ячеек (V14 — ОТЛОЖЕНА из-за регресса)

Различия main cell vs panel cells выявлены в V14 но геометрическое выравнивание отложено: mm_col-скрипт always сбрасывает obj-46 → [1,153,160,15] при старте (через pg_init_state→mm_col→script sendbox), поэтому изменения W/H в JSON без обновления mm_col/mm_exp = runtime no-op. Для реального выравнивания нужно обновлять оба скрипта — отдельная задача.

### Архивы V14→V15
- Pre-V15 AMXD: `_dev_DF-Slot.2026-07-17-102500.amxd`
- Pre-V15 JS: `_dev_midi_learn_slot.js.2026-07-17-102500.js`
- Pre-V15 dfs_dump: `_dev_dfs_dump.js.2026-07-17-102500.js`

---

## PREVIOUS STATUS (2026-07-17) — DEV-JS-V14

### Файлы DEV-V14
| Файл | md5 | Что изменено |
|------|-----|-------------|
| `_dev_DF-Slot.amxd` | `ab5911e3` (60284 B, 104 boxes/150 lines) | V14: obj-46 W=178/H=14; mm_icon x=181; mode_icon x=181 |
| `_dev_midi_learn_slot.js` | `98c58fd5` (DEV-JS-V14) | _doRebind immediate _updateMapBtnVisibility() before 700ms Task |
| `_dev_dfs_dump.js` | `fd922c76` (DEV-V14) | markers |

### Унификация ячеек (V14)

Различия main cell (obj-46) vs panel cells (bpslot0..7 в multimapDF):

| Параметр | Main cell (V13) | Panel cells |
|----------|----------------|-------------|
| presentation W | 160 px | 178 px |
| presentation H | 15 px | 14 px |
| swap_btn visible | НЕТ (clips at x=160, swap starts x=161) | ДА (x=161+15=176 < 178) |
| TargetMax visible | barely (right edge=160, clip at edge) | ДА |

Fix: obj-46 W=160→178, H=15→14. mm_icon x=163→181, mode_icon x=163→181 (сдвинуты вправо чтобы не перекрывались с расширенной ячейкой). Оба остаются вертикально выровнены.

### Жёлтая пауза fix (V14)

`_doRebind()`: добавлен немедленный вызов `_updateMapBtnVisibility()` перед outlet(12) arm animation → 700ms Task. Цель: имя параметра видно тёмным с первого момента, даже если arm blink перезаписывает lcdcolor — 700ms Task восстанавливает финальное состояние.

Arm blink может переписывать lcdcolor в своём цикле (metro 200ms). Немедленный вызов → blink → 700ms restore = пользователь видит минимальный "пустой" период.

### Архивы V13→V14
- Pre-V14 AMXD: `_dev_DF-Slot.2026-07-17-093109.amxd`
- Pre-V14 JS: `_dev_midi_learn_slot.js.2026-07-17-093109.js`

---

## PREVIOUS STATUS (2026-07-17) — DEV-JS-V13

### Файлы DEV-V13
| Файл | md5 | Что изменено |
|------|-----|-------------|
| `_dev_DF-Slot.amxd` | `7ef18490` (60297 B, 104 boxes/150 lines) | **V13**: mm_buttoncolor sel=1 obj-64/65/66 text* → amber (glyph fix) |
| `_dev_midi_learn_slot.js` | `4da6b984` (DEV-JS-V13) | panelmap() 700ms Task added |
| `_dev_dfs_dump.js` | `fcde20f2` (DEV-V13) | markers only |

### Диагноз V13 — ГЛІФ ЧЕРНИЄ ПІСЛЯ МАППІНГА (Defect 1 root cause)

**Механизм**: mm_buttoncolor sel=1 fires `textcolor "LCD Background"` (dark) via obj-64 + `activetextoncolor "LCD Background"` via obj-65 + `activetextcolor "LCD Background"` via obj-66. `dev_thg` (которий відновлює amber через mmi_tc→textcolor) **не перестрілює при зміні mapcount** — тільки при mode change / track color change / init. Результат: після маппінга textcolor=dark → гліф темний = ЧОРНИЙ.

**Фікс**: obj-64 → `textcolor "LCD Text/Icon(Inactive)"`, obj-65 → `activetextoncolor "LCD Text/Icon"`, obj-66 → `activetextcolor "LCD Text/Icon"` (як у sel=0 гілці).

**ПІДТВЕРДЖЕНА КАРТА КАНАЛІВ mm_icon (usepicture=1, remapsvgcolors=1)**:
- SVG bars fill → `textcolor` (value=0 idle) / `textoffcolor` (value=0)
- SVG open bar → `textcolor` (value=1)  
- Button background → `activebgcolor` (= themecolor.live_lcd_bg = dark via expression)
- All bg* = dark (themecolor.live_lcd_bg expression) — NOT glyph channels
- **"active" prefix in this context = NORMAL/ENABLED device state** (same as before)

**Ловушка**: mm_buttoncolor sel=1 містить textcolor/activetextcolor = dark (production original). Після Fix-4 (activebgcolor=dark) ця гілка також вбиває textcolor. До Fix-4 це було приховано: activebgcolor=amber заповнювало фон і гліф виглядав amber через заливку. Після Fix-4 (dark bg) → textcolor=dark → невидимий гліф.

**Defect 2**: panelmap() не мала 700ms Task → freshly mapped row залишалась жовтою без імені. Виправлено: додано ту саму Task(700) що і в _doRebind().

### Архіви V12→V13
- Pre-V13: `_dev_DF-Slot.2026-07-17-090337.amxd` (V12 state)
- Pre-V13 JS: `_dev_midi_learn_slot.js.2026-07-17-090337.js` (V12 state)

---

## PREVIOUS STATUS (2026-07-17) — DEV-JS-V12

### Файлы DEV-V12
| Файл | md5 | Что изменено |
|------|-----|-------------|
| `_dev_DF-Slot.amxd` | `d1f7efc6` (60283 B, 104 boxes/150 lines) | **V12**: obj-74 textoffcolor "LCD Text/Icon(Inactive)"; mm_icon exprs=themecolor.live_lcd_bg; probe colors cleared; mmi_bgon dynamic |
| `_dev_midi_learn_slot.js` | `ded09e21` (DEV-JS-V12) | applyColor() in _doRebind 700ms Task carry from V10 |
| `_dev_dfs_dump.js` | `349f13ac` (DEV-V12) | markers only |
| Production | `c69bc19e` / `8e38a081` | НЕ ТРОНУТЫ |

### Ключевое открытие V12 — live.text channel map

Подтверждено пробой V11 (уникальные цвета на каждый bg-атрибут):
- **value=0 fill → `activebgcolor`** (device active/enabled = normal M4L state)
- **value=0 SVG glyph → `textoffcolor`** (source #FFB532 → textoffcolor)
- **value=1 fill → `lcdbgcolor`** (theme-bound dark, НЕ activebgoncolor!)
- **value=1 SVG glyph → `textcolor`** (dev_thg fires amber last)
- `bg*` без active prefix = только при BYPASSED device → не видны в норме

### Архивы V11 → V12
- Pre-V12: `_dev_DF-Slot.2026-07-17-010308.amxd` (V11 probe state)

---

## PREVIOUS STATUS (2026-07-16 ~23:50) — DEV-JS-V9

### Файлы DEV-V9

| Файл | md5 | Что изменено |
|------|-----|-------------|
| `_dev_midi_learn_slot.js` | `af5e5612` | **DEV-JS-V9**: Fix1 lcdcolor=INK_DARK для mapped; Fix2 _doRebind 700ms delay; Fix3 dfs_dump markers V9; bordercolor = lcd-amber [0.999999,0.678,0.337,0.999999] |
| `_dev_DF-Slot.amxd` | `31ea1899` | без изменений (ps_tgt на месте) |
| `_dev_MapButtonTint.maxpat` | `e3de1126` | без изменений |
| `_dev_dfs_dump.js` | `5e1d5683` | DEV-V3→V9 во всех маркерах |
| Production | `c69bc19e` / `8e38a081` | НЕ ТРОНУТЫ |

### МЕХАНИЗМ НЕВИДИМОГО ТЕКСТА (ПОДТВЕРЖДЁН ДАМПОМ V8)

**Факты из дампа (23:26):**
- На загрузке: `lcdcolor=[1,0.678,0.337]` = amber = lcdbgcolor → текст невидим
- После первого REBIND: `lcdcolor=[0.082...]` = тёмный → текст видим
- Оба события в 1 секунду → mode_rs_dl (1500ms) не влияет — успевает до него

**Механизм:**
1. t=0: device load, tint chain fire → `t_nlcd lcdcolor=amber` устанавливает lcdcolor=amber (accent color)
2. t=200ms: init Task → `_updateMapBtnVisibility()` — в V8 НЕ трогало lcdcolor → текст invisible
3. t=300ms: REBIND → state=2 settles → `it_brc(==2) → it_txpak (default dark) → it_txg → lcdcolor=dark` → текст видим
4. mode_rs_dl не пересекается с этим окном

**Фикс V9 (Fix1):** в `_updateMapBtnVisibility()` для mapped-ячеек добавлено:
```js
mainBtn.message("lcdcolor", 0.06, 0.06, 0.06, 0.999999);
```
Наш 200ms вызов (ПОСЛЕ t_nlcd init fire) записывает INK_DARK → текст видим сразу после загрузки.

### МЕХАНИЗМ "AMBER ON AMBER ON AMBER" ARM BLINK (FIX2)

REBIND в _doRebind() немедленно звал `_updateMapBtnVisibility()` → bordercolor=amber устанавливался ОДНОВРЕМЕННО с запуском arm blink (outlet(12)). Arm animation (it_armmetro metro 200ms) играл с уже-установленным amber border → "yellow on yellow."

**Фикс V9 (Fix2):** в `_doRebind()` убран немедленный вызов `_updateMapBtnVisibility()`. Вместо него — Task(700ms) после arm animation завершения. Во время arm animation JS не трогает bordercolor/lcdcolor.

### Решение bordercolor (V9 — исправлен amber)

- **V8 amber**: `[0.999999, 0.709804, 0.196078, 0.999999]` — НЕВЕРНЫЙ (взят textcolor-amber)
- **V9 lcd-amber**: `[0.999999, 0.678, 0.337, 0.999999]` = `[1, 0.678, 0.337]` из dump lcdbgcolor → точное совпадение с заливкой → кольцо сливается

### mm_icon tint — Fix4 (проверка, не правка)

Структура dev AMXD (из grep):
- `mmi_bcg` (gate) → открыт в Standard (dev_isstd=1), закрыт в Follow → блокирует mm_buttoncolor в Follow
- `mmi_trkg` (gate) → открыт в Follow (mmi_isf = ==0 = 1 при Follow), закрыт в Standard → проводит JS outlet(7) tint → mm_icon
- `mmi_bc/tc/atc/atoc/toc` → mm_icon (text+border colors от tint)

**Вывод:** протечки mm_buttoncolor → mm_icon в Follow НЕТ. mmi_bcg корректно блокирует bg-path в Follow. mmi_trkg корректно пропускает track-tint. dev AMXD исправен.

### Архивы V8 → V9

- `_dev_midi_learn_slot.2026-07-16-234408.js` md5=`5e3da3ad` (V8 pre-V9)
- `_dev_dfs_dump.2026-07-16-234408.js` md5=`b4d37963` (V3 pre-V9)

---

## PREVIOUS STATUS (2026-07-16 22:30) — DEV-JS-V7 + ps_tgt fix

## PREVIOUS STATUS (2026-07-16 23:20) — DEV-JS-V8: mapped=amber-alpha≈1, cold=без вмешательства, +lcd-поля дамп

---

## STATUS (2026-07-16 22:30) — DEV-JS-V7 + ps_tgt fix (предыдущее)

### DEV-V7 файлы (User Library Max Devices)

| Файл | md5 | Что изменено |
|------|-----|-------------|
| `_dev_midi_learn_slot.js` | `90cc0626` (1136 lines) | **DEV-JS-V7**: banner V7; bordercolor 1.0→0.9999 и 0.0→0.0001; devdump +text/texton/textcolor/textoffcolor для main+panel obj-14 |
| `_dev_DF-Slot.amxd` | `31ea1899` (65668 B, 103 boxes/147 lines) | **+ps_tgt** (prepend set): `obj-46[1]→ps_tgt[0]→lnb_tgt[0]` — silent write TgtId при свежем маппинге |
| `_dev_MapButtonTint.maxpat` | `e3de1126` (132 boxes/221 lines) | **без изменений** |
| `_dev_multimapDF.maxpat` | `49b359fc` | **без изменений** |
| `midi_learn_slot.js` | `c69bc19e` | PRODUCTION — НЕ ТРОНУТ |
| `Dynamic Focus Slot.amxd` | `8e38a081` | PRODUCTION — НЕ ТРОНУТ |

### Диагноз СПАМА (сотни "SendMessage error 2: Bad parameter value")

**Корень**: `message("bordercolor", 1.0, 0.709804, 0.196078, 0.0)` в JS.  
В JavaScript `1.0 === 1` и `0.0 === 0` — MAX JS передаёт эти значения как **integer atoms**.  
`live.text` (appearance type=2, button) отвергает integer atoms в `bordercolor` → **error 2**.  
Ошибка появилась в DEV-V5/V6 впервые (код до этого не выполнялся — старый dev-девайс держал V3 JS).

**Фикс**: `0.9999` вместо `1.0`, `0.0001` вместо `0.0` — все 4 аргумента bordercolor = float атомы.

Примечание: `obj-border-on = "bordercolor 1. 0.709804 0.196078 0."` в production MapButtonTint (dead end, не подключён ни к чему) — ТОЖЕ имеет alpha=0, но `1.` в Max-message = float literal. JS-число `0.0` != Max `0.` по типу атома.

### Диагноз "СВЕЖИЙ МАППИНГ = SOLID AMBER БЕЗ ИМЕНИ"

**Гипотеза**: error 2 при `message("bordercolor", ..., 0.0)` оставлял `obj-14` (live.text button) в broken state. После исправления float-атомов `deferlow` от `p mapping` сможет корректно перевести `value=1→0` и имя параметра отобразится.  
Факт-первый: devdump V7 добавляет `.getattr("text")`, `.getattr("texton")`, `.getattr("textcolor")`, `.getattr("textoffcolor")` для каждого obj-14 — для подтверждения гипотезы.

### Диагноз "9× Live API is not initialized"

Источников `onTargetId()` только ОДИН при свежем маппинге: `obj-46[1]→obj-4[9]`.  
Вероятно: retry-loop в `_doRebind()` (MAX_REBIND_ATTEMPTS=5; если `_initialized=false` когда fires = 6 попыток). Источник V6: mm_tgt_N выполнялось уже с `_initialized` guard, но timing ms_tgt_N лив.нумбоксов мог сдвинуть начало init.

### Находка: ps_tgt отсутствовал (persistence bug для main cell)

MEMORY документировал "ВІДНОВЛЕНИЙ ps_tgt" — но в реальном AMXD ps_tgt НЕ БЫЛО.  
`obj-46[1]` (mb_idout) → `obj-4[9]` (JS) ТОЛЬКО. `lnb_tgt` не обновлялась при свежем маппинге.  
Фикс V7: добавлен `ps_tgt` (prepend set): `obj-46[1]→ps_tgt[0]→lnb_tgt[0]` (silent "set N").  
Теперь: свежий маппинг → TgtId сохраняется в lnb_tgt → persists в Live Set → restore work после reload.

### Дисциплина маркера (правило навсегда!)

**КАЖДОЕ изменение JS = обновить load banner** (`post("DEV-JS-V<N> loaded\n")`).  
Расхождение маркера и реального кода → тест недействителен (V4/V5 тесты провалены из-за этого).  
В AMXD лежал СТАРЫЙ экземпляр из прошлой сессии с V3 JS — V4/V5 фактически тестировали V3.

### Тест DEV-V7

1. В Live: убрать `_dev_DF-Slot.amxd` с дорожки, перетащить заново
2. Max console: `DEV-JS-V7 loaded` → OK
3. Проверить: **нет** "SendMessage returned with error 2" при загрузке
4. Проверить: **нет** "Live API is not initialized" (или их стало существенно меньше)
5. Freshly map один panel slot: Map → select param → после deferlow (≈1ms) ячейка должна показать имя параметра, без solid amber
6. Dump: нажать кнопку → `/tmp/dfs_dump.txt` → для свежезамапленного слота проверить:
   - `mapbtn.value=0` (disarmed)
   - `text="<param name>"` (имя выставлено)
   - `textoffcolor=<visible>` (не прозрачный)

### Архивы V7

- `_dev_midi_learn_slot.2026-07-16-222024.js` md5=`c1fd5f66` (pre-V7)
- `_dev_DF-Slot.2026-07-16-222024.amxd` md5=`d525e9e3` (pre-V7)

---

## PREVIOUS STATUS (2026-07-16 21:30) — DEV-V5 BORDERCOLOR FIX + PANELMAP CALLABLE + SCAN VARNAMES

### Файлы dev-среды (User Library Max Devices)

| Файл | md5 | Содержимое |
|------|-----|-----------|
| `_dev_DF-Slot.amxd` | `dd45de55` (55466 B, 94 boxes/137 lines) | obj-4 → `_dev_midi_learn_slot.js`; obj-46→_dev_MapButtonTint; mm_panel→_dev_multimapDF; dump chain; **NEW: mm_trig_b+mm_trig_msg → panel rebind trigger** |
| `_dev_midi_learn_slot.js` | `d1f298aa` (1106 lines) | DEV-V5: bordercolor control obj-14; panelmap() callable (no .local); main scan pObjMap varnames |
| `_dev_MapButtonTint.maxpat` | `e3de1126` (132 boxes/221 lines) | bord_ цепь УДАЛЕНА; **NEW: dbg_tgtid (number, varname) ← obj-16[6]** |
| `_dev_multimapDF.maxpat` | `49b359fc` (152326 B, 55 boxes/93 lines) | все 8 bpslot → `_dev_MapButtonTint.maxpat`; pak fix |
| `_dev_dfs_dump.js` | `b4d37963` (819 B) DEV-V3 | relay: bang → getnamed("df_slot_js").message("devdump") |
| `midi_learn_slot.js` | `c69bc19e` | PRODUCTION — НЕ ТРОНУТ |
| `Dynamic Focus Slot.amxd` | `8e38a081` | PRODUCTION — НЕ ТРОНУТ |

### JS-driven механизм (DEV-V4)

**`_updateMapBtnVisibility()` в `_dev_midi_learn_slot.js`:**
- Guard: `if (!_initialized) return;` — no pre-bang spam
- Main cell: `slotMapped = (targetParamId > 0)` — target bound = ID non-zero
- Panel cells: `slotMapped = slotSub.getnamed("dbg_tgtid").getvalueof() > 0` — **dbg_tgtid** = новый named number box в _dev_MapButtonTint, получает tgt ID от RangeAndName (ran_idout = obj-16[6])
- Follow mode (colorMode=0): hidden=0 для всех

**`panelmap()` функция (НОВАЯ):**
- Вызывается из AMXD: `mm_panel[1]` → `mm_trig_b` (t b) → `mm_trig_msg` (message panelmap) → `obj-4[0]` (JS inlet 0)
- Сразу вызывает `_updateMapBtnVisibility()` после маппинга строки панели

**`devdump()` новое:**
- File truncation: `fh.eof = fh.position` (обрезает хвост от более длинного предыдущего дампа)
- Panel: `tgtId=N slotMapped=T/F mapbtn(obj-14).value=V border.value=V expected_hidden=H actual_hidden=H`
- Main cell: `border.hidden=H border.value=V mapbtn(obj-14).value=V`
- Main patcher scan: df_mapparam/mm_icon/mode_icon/mode_abs/blt_dot/df_dial/pg_name_edit → hidden+value

**⚠️ АРХИТЕКТУРА panel rebind:**
- Panel rows (bpslot0..7) имеют СОБСТВЕННЫЙ MapButton (`p mapping` sub-patcher в MapButtonTint)
- Rebind НЕ проходит через главный JS — отдельная цепочка в MapButtonTint
- `dbg_tgtid` = ran_idout (outlet 6 obj-16 RangeAndName) → хранит текущий target ID

**⚠️ KEY FINDING — obj-14 (Map button) bordercolor:**
- obj-14 (live.text, varname `live.text`, text "Map") в MapButtonTint:
  - `bordercolor: [amber, alpha=1]` — ВСЕГДА ВИДИМЫЙ (не зависит от on/off)
  - `bgcolor: [amber, alpha=0]` — прозрачный (OFF state)
  - `bgoncolor: [amber, alpha=1]` — заполненный (ON state)
- При value=0: прозрачный центр + амберная рамка = "рамка снаружи, тёмно внутри"
- При value=1: заполненный амбер = нет эффекта рамки
- obj-14.value при замапленной ячейке = диагностический вопрос (нужен дамп)

**⚠️ obj-9 (border live.text) — все цвета alpha=0 (прозрачные), только focusbordercolor=amber alpha=1**
- obj-9 визуально НЕВИДИМ (кроме фокуса клавиатуры)
- Hiding obj-9 не даёт видимого эффекта сам по себе
- Источник visible amber border = obj-14.bordercolor

**Точки вызова _updateMapBtnVisibility:**
1. bang() 200ms Task
2. setMode() — mode change
3. unmap() — после updateLabel()
4. list() CC learn branch — после updateLabel()
5. devdump() — refresh before read
6. onTargetId() — в конце функции
7. _doRebind() — после outlet(12)
8. tgtIdObserver else-ветка (id=0 unbind)
9. panelmap() — при маппинге панельной строки (НОВАЯ)

**devdump() — вызов из _dev_dfs_dump.js:**
```
dev_dump_btn → dev_dump_js (bang) → this.patcher.getnamed("df_slot_js").message("devdump")
→ _dev_midi_learn_slot.js::devdump()
→ _updateMapBtnVisibility() + write /tmp/dfs_dump.txt (DEV-V3 маркер)
```

**obj-9 (border live.text) оставшиеся connections (только styling):**
- `obj-15[1] → obj-9[0]` (p colors — bordercolor track tint)
- `it_bg9[0] → obj-9[0]` (gate — bg color)
- `it_bord_std[0] → obj-9[0]` (bordercolor 0.0.0.0 в Standard)

**⚠️ АРХИВЫ DEV (before JS-driven):**
- `_dev_DF-Slot.2026-07-16-163904.amxd` md5=`5f5b37b4` (до redirect obj-4)
- `_dev_MapButtonTint.2026-07-16-163949.maxpat` md5=`229eb1fe` (до удаления bord_)

### Процедура теста DEV-V3

1. Убрать `_dev_DF-Slot.amxd` с дорожки и перетащить заново
2. Standard mode → замапить главную ячейку (CC-learn):
   - border.hidden=1 ожидается → рамка невидима
3. Unmap → border.hidden=0 → рамка видима
4. Follow mode → border.hidden=0 для всех
5. Dump: нажать `dev_dump_btn` → Max console DEV-V3 маркер + /tmp/dfs_dump.txt
   - Проверить `expected_hidden` = `actual_hidden` для всех слотов
6. Panel cells (bpslot0..7): mm_ididin не подключён → dbg_mflag=0 always → hidden=0 always (border видима — OK пока)

**⚠️ КОРЕНЬ mm_ididin:** mm_panel[1] не подключён → live.remote~ без id → it_mflag=0 всегда → dbg_mflag=0 → panel cells всегда slotMapped=false → hidden=0 (всегда видима в обоих режимах). JS-подход обходит это для main cell; panel cells будут фикситься позже.

**⚠️ КОРЕНЬ всех слотов hidden=0:** pattr-restored ids из прошлых сессий (не разница проводки). Паттерн 1,2,3,6 vs 0,4,5,7 из DEV-V1/V2 был артефактом pattr — статически все 8 bpslots идентичны.

### MASTER baseline (НИКОГДА не трогать)
`~/Brain/fadercraft/_device-backups/MASTER-2026-07-16/`:
- `Dynamic Focus Slot.amxd`: `8e38a0815caa2d7a0ce0d62ab47b3eb7` (127965 B)
- `MapButtonTint.maxpat`: `eba6508bb0ecb81f915eced060ae0e01` (129640 B)
- `multimapDF.maxpat`: `37e6ccf7b19b7e8c2eda595a94007558` (142584 B)

### Production Dynamic Focus Slot.amxd
md5=`8e38a0815caa2d7a0ce0d62ab47b3eb7` (127965 B, 84 boxes/123 lines). **mm_icon ПОЧИНЕН** (2026-07-16): mm_buttoncolor obj-11/obj-13→`"LCD Background"`, mm_icon.bordercolor=тёмный, mmi_bc→mm_icon линия удалена. Бордюра mm_icon в Standard = НЕТ. **MapButtonTint.maxpat остаётся `eba6508b` (не тронут).**

### Bord_ chain в _dev_MapButtonTint (verified from _stand/final/_stand_MapButtonTint.maxpat b976dae4)
```
it_isstd[0] → bord_stdg[0]      (gate: Standard=1 open, Follow=0 closed)
it_mflag[0] → bord_stdg[1]      (map flag as data)
bord_stdg[0] → bord_msel[0]     (live path: gate output)
it_mflag[0] → bord_mstore[1]    (silent store)
it_stdsel[0] → bord_mstore[0]   (bang on Standard entry → mode-switch path)
bord_mstore[0] → bord_msel[0]
bord_msel[0] → bord_hidden_off[0] → obj-9[0]   (cold=0 → hidden 0 = visible)
bord_msel[1] → bord_hidden_on[0]  → obj-9[0]   (mapped=1 → hidden 1 = invisible)
it_isf[0] → bord_folsel[0] → bord_hidden_off[0] (Follow → always visible)
```
Диагностика: `it_mflag[0]→dbg_mflag[0]`, `it_isstd[0]→dbg_isstd[0]`.

### _dev_DF-Slot инструментарий
```
obj-4[8] → mode_rs[1]           (store mode silently)
obj-6[0] → mode_rs_dl[0]        (dial fires on load → delay 1500ms)
mode_rs_dl[0] → mode_rs[0] → mm_panel[3]   (resend mode to all panel cells)
obj-6[0] → dev_v1[0]            (print DEV-V1 on load)
obj-4[12] → dev_dump_tb[0] → dev_dump_dl[0] → dev_dump_js[0]  (auto-dump on rebind)
dev_dump_btn[0] → dev_dump_js[0]  (manual dump button)
obj-6[0] → dev_load_dl[0] → dev_dump_js[0]  (auto-dump on load, delay 2000ms)
```

### Процедура теста dev-среды
1. Загрузить `_dev_DF-Slot.amxd` на MIDI-трек; убрать/перетащить заново
2. Max console: `DEV-V1` в течение 2с = ОК; dump.txt в `/tmp/dfs_dump.txt`
3. Маппинг: назначить 4 слота в панели (разных рядах)
4. Переключить режим Standard/Follow → проверить dump (все замапленные слоты border.hidden=1 в Standard, =0 в Follow)
5. Если 4/8 не работают — dump покажет mflag=0 (т.е. слоты холодные, не баг)

---

## Статус (2026-07-16) — ФИНАЛЬНЫЙ ФИКС border=0 (JSON attr)

**НОВЫЙ ПОДХОД (смена по фидбеку пользователя 2026-07-16):**
- `border 0` как runtime-сообщение → live.text отвергает → ПРОВАЛ (было задокументировано)
- `"border": 0` как **сохранённый JSON-атрибут** в теле бокса obj-9 → РАБОТАЕТ → рамка исчезает полностью

Стенд очищен: убраны все костыли (Task A lcd_bg fix, Task B demo inlet, Fix-2 color inject). Fix-1 (gate tint_in) оставлен — не влияет на переключение режимов.

### Диагноз "Cold = Mapped" (2026-07-16)

Три взаимосвязанных причины:

1. **Стейт-машина в Standard всегда = 0.** Формула `($i4*(...))*(...+1)`: i4=isFollow=0 в Standard → результат 0 (холодный), независимо от M. Mapped-визуал через стейт-машину НЕВОЗМОЖЕН в Standard по дизайну.

2. **Gate не переотправляет.** В Follow: tint_in → it_unpk → it_bgpak → (it_bgg gate). Если tint пришёл ДО того как gate открылся (state 0→2), данные пройдут через закрытый gate и потеряются. Когда gate открывается (state 2), новых данных нет → lcdbgcolor obj-14 не обновляется.

3. **obj-39 (p setButtonColor, нативный драйвер) не стреляет** без Live API / live.remote~ (obj-16 = RangeAndName требует Live-контекст чтобы разрезолвить id параметра).

### Диагноз "Standard tint = синий" (2026-07-16)

`it_apply (t l)` принимает данные из двух источников:
- `it_thg (gate=Standard)` — 9-float list из lcd_control_fg (amber)
- `tint_in` — 9-float list из tint (напр., синий)

`it_apply` — fan-out на **13 message-box** (`t_bord`, `t_bgon`, `t_nlcd`, `t_abgon`, `t_fbord`, `t_nilcd`, `t_slid`, `t_swap`, `t_swap2`, `t_tri`, `t_x`, `t_swap_bord` + `it_cttrig`). Все стреляют при каждом входе. В Standard, нажав Blue, tint переписывает все атрибуты цвета на obj-14 поверх amber.

## Файлы стенда

| Файл | md5 | Заметка |
|------|-----|---------|
| `_stand_MapButton-Stand.amxd` | `ae5639a1` (26 boxes/13 lines) | CLEAN: demo msgs удалены, bp-mbt numinlets=5 |
| `_stand_MapButtonTint.maxpat` | `730826e5` (130 boxes/220 lines) | CLEAN: border=0 на OBJ-9 И OBJ-14, Fix-1 gate |
| `_stand_dump.js` | `63e9fbc1` | без изменений; `border` в otherAttrs ✓ |
| Backup dir | — | `~/Brain/fadercraft/_device-backups/_stand/` |
| Архив до cleanup | `5106e151`/`cde04eef` | `*2026-07-16-114502.pre-cleanup.*` |
| Архив до fix-1/2 | `a9cb3f1d` | `_stand_MapButtonTint.2026-07-16-105541.pre-fix12.maxpat` |
| Архив до task-ab | `795b09b9`/`5931a52a` | `*2026-07-16-*.pre-task-ab.*` |

**Оригинал `MapButtonTint.maxpat` md5=`eba6508b` — НЕ ТРОНУТ.**
**`Dynamic Focus Slot.amxd` md5=`e84eeaa4` — НЕ ТРОНУТ.**

## Как DF Slot подключает MapButtonTint

`Dynamic Focus Slot.amxd` использует **ссылку по имени** (bpatcher `name="MapButtonTint.maxpat"`, без embedded patcher JSON внутри бокса). Выводы:
- Изменения в `MapButtonTint.maxpat` немедленно подхватываются unfrozen-девайсом (Live перечитывает при следующей загрузке)
- При freeze Max вшивает `MapButtonTint.maxpat` в dlst как зависимость → frozen-девайс несёт свою копию
- Фикс при портировании применяется ТОЛЬКО к `MapButtonTint.maxpat` (одно место)

## Корень проблемы (статически подтверждён)

**Culprit: obj-9 (`varname=border`, кнопка «Map»)**

DUMP-данные:
- Standard: `obj-9.bordercolor = [0, 0, 0, 0]` → ВИДИМАЯ ЧЁРНАЯ РАМКА
- Follow:   `obj-9.bordercolor = [0.3, 0.5, 1.0, 1.0]` → рамка invisible (совпадает с tint-bg)

obj-14 (`live.text`, LCD) — НЕ виновник (одинаковый синий в обоих режимах).

**Механизм:** obj-9 имеет `border` (ширина) = **1 (default, не сохранён в JSON)**. При `bordercolor.alpha=0` Ableton-рендерер рисует 1px рамку цветом темы (тёмный/чёрный). alpha=0 ≠ "скрыть рамку" — это "рисовать рамку темой". В Follow режиме `bordercolor = track_tint 1.0` (opaque) перекрывает theme-рамку цветом трека → invisible.

## Сигнальный путь obj-9.bordercolor

**Standard (it_mode=1):**
```
it_mode → it_stdsel (sel 1) → output 0 (match) → it_bord_std ("bordercolor 0. 0. 0. 0.") → obj-9
it_isf (==0) → 0 → it_bg9 (gate) CLOSED → tint НЕ достигает obj-9
```

**Follow (it_mode=0):**
```
it_mode → it_stdsel (sel 1) → output 1 (passthrough=0) → [was: dead end]
it_isf (==0) → 1 → it_bg9 (gate) OPEN → t_bord ("bordercolor $4 $5 $6 1.") → obj-9 (track tint, alpha=1)
```

## СТАТУС 2026-07-16: ПРОДАКШН ОТКАТАН, ЖИВОЙ СТЕНД ГОТОВ

**border=0 в MapButtonTint провалился** — рамка в Standard при живом маппинге осталась (источник не в JSON-атрибутах объектов). Плюс: при reload выявился предсуществующий баг `mm_icon` (жёлтый в иконке), не связанный с нашей правкой. Всё откатано.

**Откат:** `MapButtonTint.maxpat` = `eba6508b` (восстановлен из `/Users/Kirill/Brain/fadercraft/_device-backups/MapButtonTint.2026-07-16.pre-border0.maxpat`).

**mm_icon НЕ наш регресс:** `mm_icon` живёт в **DF Slot main patcher** (id=`mm_icon`, mc=live.text, varname=`live.text`, usepicture=1, remapsvgcolors=1, pictures=[multimap-closed-off.svg, multimap-open-off.svg]). Наша правка border=0 на obj-9/obj-14 в MapButtonTint.maxpat физически не может затронуть mm_icon — разные пространства имён. Проблема mm_icon = предсуществующий баг (mmi_bcg gate / mm_buttoncolor path), всплывший при reload.

**Живой стенд создан:**
- `_stand_DF-Slot.amxd` (md5=`75002f8d`, 87 boxes/125 lines) — полная копия DF Slot с dump-кнопкой
- `_stand_dfs_dump.js` — dump-скрипт, навигирует в bpatcher `df_mapparam` (obj-46, subpatcher(0)=MapButtonTint) и читает border/bordercolor/bgcolor/bgoncolor/hidden всех виджетов
- Оба файла: `/Users/Kirill/Music/Ableton/User Library/Max Devices/`
- Ссылается на продакшн `MapButtonTint.maxpat` (eba6508b) — воспроизводит реальный баг

### Схема dump-щупа
```
obj-53 (live.button) → obj-52 (js _stand_dfs_dump.js)
                                 ↓ this.patcher.getnamed("df_mapparam")
                                 ↓ .subpatcher(0)  → MapButtonTint.maxpat
                                   getnamed("border")    → obj-9  Map button
                                   getnamed("live.text") → obj-14 LCD cell
                                   getnamed("live.text[1]") → obj-28 X button
                                   getnamed("swap_btn") → obj-swap-btn
                                   getnamed("live.toggle") → obj-4
                                 ↓ this.patcher.getnamed("live.text") → mm_icon DF Slot main
```

### Процедура теста живым маппингом
1. Загрузить `_stand_DF-Slot.amxd` на MIDI-трек
2. Открыть Max editor (двойной клик на устройстве в редакторе)
3. В Ableton: нажать кнопку Map в DF Slot → кликнуть живой параметр (напр. фильтр синта)
4. Убедиться что режим = Standard
5. В Max editor: найти dump-кнопку (obj-53, live.button, x=1840 y=20 в patching view) + нажать
6. Max console: `=== DFS DUMP ===` → для каждого объекта — строки `border = N` + `bordercolor = rgba(...)` + `bgcolor = ...`
7. Найти КАКОЙ элемент имеет border≠0 и тёмный непрозрачный bordercolor

### Bpatcher map в DF Slot
| varname | mc | что внутри |
|---------|----|----|
| `df_mapparam` (obj-46) | bpatcher | MapButtonTint.maxpat |
| `df_mapcc` (obj-48) | bpatcher | MapCCButtonDF.maxpat |
| `multimap` (mm_panel) | bpatcher | multimapDF.maxpat |

## ФИНАЛЬНЫЙ ФИКС border=0 на obj-9 И obj-14 — применён в стенде

### Трейс субпатчеров (результат статического анализа)

**`p setButtonColor` (obj-39, 50 боксов):**
- Посылает в `obj-39[0]` → `it_dg (gate)` → `it_rt (route lcdcolor)` → `obj-14`
- `it_dg` управляется `it_dgc (== 0)` ← `it_stfan[1]`; ОТКРЫТ только когда state=0 (cold). При маппинге gate ЗАКРЫТ → цвета из `p setButtonColor` НЕ достигают obj-14 при живом маппинге
- Посылает ТОЛЬКО: `lcdcolor`, `lcdbgcolor`, `focusbordercolor`, `inactivelcdcolor`
- **НЕ посылает `bordercolor`** ни на obj-9, ни на obj-14 — это исключает setButtonColor как источник рамки

**`p RangeAndName` (obj-16, 66 боксов):**
- Выходы: live.remote~ (сигнал), p setText (имя параметра), mapcount/id → obj-39[1..3]
- Не посылает никаких UI-color-атрибутов — только param-данные в setButtonColor

### Источник рамки — ДВА СЛОЯ

**Слой 1: obj-9 (Map button)**
- `bordercolor = [0,0,0,0]` (alpha=0) + `border=1` (default) → Live рисует тёмную тему-рамку
- Источник bordercolor: `it_bord_std (bordercolor 0.0.0.0.)` при Standard / tint_in → it_bg9 при Follow
- Фикс: `"border": 0` в JSON obj-9 → **убирает рамку полностью**

**Слой 2: obj-14 (LCD live.text, param name)**
- `bordercolor = [1,0.71,0.196,1]` (amber, alpha=1) в JSON + `border=1` (default, не в JSON) → видимая 1px amber/tint-рамка вокруг LCD
- Источник bordercolor: `tint_in → it_apply → t_bord (bordercolor $4 $5 $6 1.) → obj-14` — всегда при изменении тинта или режима
- В рабочем Live tint = цвет трека; при тёмном треке → тёмная кромка на obj-14
- `p setButtonColor` при живом маппинге НЕ достигает obj-14 (it_dg закрыт при state≠0)
- Фикс: `"border": 0` в JSON obj-14 → **убирает рамку на LCD**

**Почему `border=0` на obj-9 уменьшил, но не убрал:**
Obj-9 потерял свою рамку. Но obj-14 рядом с ним (они расположены рядом в ячейке) всё ещё рендерит свою border=1 рамку с amber/tint-bordercolor → пользователь видит тонкую кромку вдоль края LCD.

### Что ещё в стенде

- **it_b9pak (obj-43) УДАЛЁН** — Task A lcd_bg fix был промежуточным шагом; с border=0 bordercolor не нужен
- **Demo inlet (obj-44..49) УДАЛЁН** — вызывал "мигает Amount вместо Map", деградацию переключения; стенд возвращён к честной стейт-машине
- **Fix-2 color inject (obj-51..54) УДАЛЁН** — вместе с demo inlet, источник нестабильности
- **Fix-1 gate (obj-50, it_tin_g) ОСТАВЛЕН** — не влияет на переключение режимов (Standard chain идёт через it_thg, независимо от gate); предотвращает перекрашивание obj-14 синим в Standard при нажатии Blue. Анализ: режим-переключение ухудшала именно demo-инъекция (obj-48/49 → it_mapstore), не Fix-1.
- **it_bord_std → obj-9 ВОССТАНОВЛЕН** (оригинальный путь; был отрезан в Task A)

## Статус до текущего фикса (архив)

## Фикс Task A (ОТКАЩЕН; был только в стенде, оригинал не трогался)

**`border 0` провалился:** `live.text doesn't understand "border"`. live.text attr `border` не принимает set-message.

**Текущий фикс (цветовой — через lcd_bg token):**

В патче уже есть: `it_bgcload (loadmess lcd_bg) → it_bgc (live.colors) → it_bgcr (route lcd_bg) → it_bgcu (unpack) → it_wbgpak`. RGB lcd_bg загружается при init.

Добавлен `it_b9pak (pak bordercolor 0. 0. 0. 1.)` (id=obj-43):
- `it_bgcu[0] → it_b9pak[1]` (R)
- `it_bgcu[1] → it_b9pak[2]` (G)  
- `it_bgcu[2] → it_b9pak[3]` (B)
- `it_stdsel[0] → it_b9pak[0]` (bang при входе в Standard)
- `it_b9pak[0] → obj-9[0]` (→ `bordercolor R G B 1.`)

`it_bord_std → obj-9` **ОТКЛЮЧЁН** (dead end — fires but no connection to obj-9).  
`it_bord_std` text reverted to `bordercolor 0. 0. 0. 0.` (original).  
`it_bord_flw` (border 1) **УДАЛЁН**.

Token: `lcd_bg` (short form для `live_lcd_bg`, label "LCD Background"). В дефолтной теме = [0.157, 0.157, 0.157]; в теме пользователя ≈ [0.082, 0.082, 0.086] (из dump).

## Фикс Task B (demo inlet для mapped visual)

Добавлен inlet 5 в `_stand_MapButtonTint.maxpat` (x=1400 → inlet 5, rightmost):

```
demo_in (inlet) → demo_sel (sel 0 1):
  sel[1] (input=1, mapped):
    → "text Cutoff" → obj-14[0]    (LCD text = "Cutoff")
    → "1"           → it_mapstore  (state machine: M=1 → state 2)
  sel[0] (input=0, cold):
    → "text Map"    → obj-14[0]    (LCD text = "Map", default)
    → "0"           → it_mapstore  (state machine: M=0 → state 0)
```

Stand AMXD `btn-map` / `btn-cold` теперь посылают:
- `id 42 / id 0` → bp-mbt[1] (как раньше)
- `1 / 0` → bp-mbt[5] (новый demo inlet)

## Fix-1 (tint gate для Standard)

Добавлен `it_tin_g (gate, obj-50)` между `tint_in` и `it_apply`:
- `tint_in → obj-50[1]` (data)
- `it_isf → obj-50[0]` (control: Follow=1=OPEN, Standard=0=CLOSED)
- `obj-50 → it_apply` (gated output)
- Удалена прямая `tint_in → it_apply`

Результат: в Standard tint_in заблокирован до `it_apply` → ни одна из 13 message-box-ветвей не стреляет от tint; Standard amber (из `it_thg → it_apply` chain) остаётся.

## Fix-2 (прямая инъекция lcdbgcolor/lcdcolor в demo-пути)

Добавлены 4 message-бокса (obj-51..54), подключены от `demo_sel (obj-45)`:

| outlet | box | текст | получатель |
|--------|-----|-------|-----------|
| 1 (mapped) | obj-51 | `lcdbgcolor 0.3 0.5 1. 1.` | obj-14[0] |
| 1 (mapped) | obj-52 | `lcdcolor 0. 0. 0. 1.` | obj-14[0] |
| 0 (cold) | obj-53 | `lcdbgcolor 0.082 0.082 0.086 1.` | obj-14[0] |
| 0 (cold) | obj-54 | `lcdcolor 1. 0.678 0.337 1.` | obj-14[0] |

Синий fill+чёрный текст (Mapped) vs тёмный bg+amber текст (Cold) — инъекция прямая, обходит state machine gate и obj-39.

## Стенд — как тестировать (АКТУАЛЬНЫЕ инструкции post-cleanup 2026-07-16)

1. Убрать `_stand_MapButton-Stand.amxd` с дорожки и перетащить заново (Max перечитывает maxpat)
2. **ТЕСТ BORDER (главная задача):**
   - `Std (1)` → `Blue` → `Mapped (id 42)` → кнопка «Map» obj-9: тёмная кромка/обводка исчезла?
   - `Cold (id 0)` → кнопка в холодном виде — кромки тоже нет
3. **ТЕСТ DUMP border=0:**
   - Нажать DUMP → Max console → `[border] obj-9 Map button` → строка `border = 0`
4. **ТЕСТ Standard isolation (Fix-1 gate):**
   - `Std (1)` → `Blue` → obj-14 (LCD) НЕ синеет
   - `Flw (0)` → `Blue` → obj-14 может синеть (gate открыт в Follow)
5. **ТЕСТ стабильность переключения:**
   - Несколько быстрых переключений Std↔Flw → без зависаний; Mapped/Cold работают нормально

После успешного теста → применить `"border": 0` в оригинальный `MapButtonTint.maxpat` и перефризить DF Slot.

## Инлеты bpatcher MapButtonTint (справка)

| Inlet | X-pos | ID | Назначение |
|-------|-------|----|-----------|
| 0 | 237 | obj-1 | главный inlet |
| 1 | 500 | mb_ididin | state machine (id N / id 0=cold) |
| 2 | 800 | tint_in | 9-float list R G B × 3 |
| 3 | 950 | it_mode | 1=Standard / 0=Follow |
| 4 | 1100 | mb_rebind_in | тихий rebind |
