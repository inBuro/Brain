---
name: df-slot-architecture
description: DF Slot.amxd — архитектура и рабочие инварианты (как работает каждая подсистема). Кирилл попросил 2026-07-13.
metadata:
  type: reference
---

# DF Slot — как это работает

**Файлы (2026-07-17, CURRENT — label в центре диала КАНОН, jsui ПАРКОВАНО):**
- `Dynamic Focus Slot.amxd` md5 `6f875013` (UNFROZEN; переименован Кириллом 2026-07-14)
- `midi_learn_slot.js` md5 `e78e9887` (outlets=13; outlet 11=textedit text; outlet 12=UNUSED; computeFontsize УДАЛЁН; placeholder="+"; takeoverMode=2 hardcoded; debug post() убраны — только WARNING в _buildLabelPids)
- **jsui display layer v1 ПАРКОВАНО** (2026-07-14): `df_slot_label.js` md5 `5b2d24c0` → `~/Brain/fadercraft/_device-backups/df_slot_label.jsui-parked.js`. AMXD jsui-снэпшот → `_device-backups/DF Slot.2026-07-14-132312.jsui-parked.amxd` (md5 `7305855d`, 91 boxes/135 lines). Причина: jsui не работал нормально в Live. JSUI JSON-ловушки задокументированы ниже; продолжить при следующем витке.
- Shadow js: `/Users/Kirill/Music/Ableton/User Library/Max Devices/midi_learn_slot.js` (источник: `~/Documents/Max 9/Max for Live Devices/DF Slot Project/code/midi_learn_slot.js`)
- `DF Input.amxd` md5 `0c0a601a` (2931 B, FROZEN, 8 boxes/5 lines) — Takeover selector УДАЛЁН (решение Кирилла: Scale-only)

---

## Два независимых маппинга (UX-сигнал для Кирилла)

DF Slot содержит ДВА отдельных маппинга, которые пользователь может спутать:
1. **CC-learn** (кнопка «Map CC» / `df_mapcc`): связывает физическую ручку (CC-номер) с диалом устройства
2. **MapButton** (кнопка «Map» / `df_mapparam` = MapButtonTint.maxpat): связывает диал с Live-параметром (track/device/param через LOM)

Оба независимы. CC без MapButton → крутить ручку = видишь диал, но параметр не меняется. MapButton без CC → Live-параметр меняется через диал (например automaция), но ручкой не управлять.

---

## CC routing (midi_learn_slot.js)

### Режимы (mode_abs, inlet 8)
Кирилл вручную переименовал кнопку режимов: теперь **Select (0) / Follow (1)** (на диске text='Sellect', texton='Follow' или аналог — точное значение из текущего amxd). Ручные правки Кирилла НЕПРИКОСНОВЕННЫ.

- **Select (0) / бывший Focus:** CC проходит ТОЛЬКО пока host-трек девайса — выбранный трек в Live.  
  Gate: `if (!absoluteMode && !active) return;`
- **Follow (1) / бывший Lock:** CC проходит ВСЕГДА (байпас gate). При каждом CC-событии `selectTargetTrack()` выбирает нужный трек — пользователь видит что контролируется.

`selectTargetTrack()` (Follow): выбирает `targetTrackId` (трек MapButton-цели если есть) или `hostId` (трек девайса) с guard против redundant set().

### Takeover mode — Scale-only (hardcoded)
**Решение Кирилла (2026-07-13):** Takeover = только Value Scaling (режим 2). Выбор пользователя не нужен.

- Селектор на DF Input (live.menu Jump/Pickup/Scale) **удалён** вместе с `send fc_df_mode`, `delay 500`, `comment "Takeover"`.
- `receive fc_df_mode` в DF Slot **удалён** (obj-recv-mode + его линия на obj-4[6]).
- JS: `takeoverMode = 2` захардкожен; спящие ветки routeCC для 0=Jump и 1=Pickup оставлены (бесплатные, не удалять).
- **⚠️ РЕЮЗ КАНАЛА (2026-07-27):** `fc_df_mode` переиспользован для ГЛОБАЛЬНОГО режима Focus Mode (0=Dynamic, 1=Static). Новый `receive fc_df_mode` (id=`dfs_mode_recv`) → `mode_abs[0]` (устанавливает значение mode_abs кнопки → fires outlet 0 → JS inlet 8 → absoluteMode).

**Обоснование:** Pickup dead-ends (провалился на практике в июне), Jump противоречит позиционированию, mismatch в DF постоянен → единственный верный режим без вопросов пользователю.

### Takeover Value Scaling (inlet 6, режим 2)
Якорь `anchorC` ставится первым движением ручки. **Первый поворот после загрузки/смены трека устанавливает якорь БЕЗ движения диала** (выглядит как «не работает» — это норма).

### Learn FSM (toggleLearn)
```
Cold ─[click]→ Arming ─[CC arrives]→ Mapped
                  │                      │
              [click]                 [click]
                  ↓                      ↓
                Cold ←──────────── Arming (remap, старый CC жив)
                                      │
                                  [click]
                                      ↓
                                    Cold
```
Mapped → click → Arming (remap): старый CC активен ДО получения нового. Arming/Mapped → click → Cold (unmap).

---

## Цвет (Colour Mode, inlet 7)

### Standard (0)
- Диал: SA `themecolor.live_value_arc` (= яркий циан `[0.427,0.843,1.0]`); native chain `dev_ndq "Control On Variant"` → `live.colors` → `dev_ndr route "Control On Variant"` → `prepend needlecolor` → obj-31 (бэнгается при mode=STANDARD через `dev_modesel sel 1`)
- MapButton: нативный Ableton (амбер-текст, тёмный фон, arm мигание через obj-39)
- CC кнопка: циан `DEFAULT_CC` = value_arc цвет
- **mode_abs (FOCUS/LOCK кнопка):** текстовый акцент = амбер из live.colors токена `"LCD Text / Icon"` (запрашивается рантайм через цепочку, NO literal)

### Follow (1)
- Все акценты (диал, кнопки) = цвет host-трека (или target-трека в Lock+MapButton)
- Диал: js outlet5 → `prepend needlecolor` → obj-31
- MapButton: state machine (3 states) в MapButtonTint.maxpat
- **mode_abs:** текстовый акцент = цвет трека (тот же что идёт на дугу); zombie-логика НЕ применяется (только полный track color на LOCK-state)

### mode_abs тинт-пайплайн (outlet 10)

`js outlet 10` → `obj-mabs-rt` (route standard):
- Если `symbol "standard"` (pushDefaults при смене режима): bang → message `"LCD Text / Icon"` → `live.colors` → `route "LCD Text / Icon"` → 4-float amber RGBA → `t l l l` → 3×prepend → mode_abs
- Если `list [r g b 1.0]` (emitTrack Follow): passthrough из outlet1 → прямо в `t l l l` fanout → mode_abs

Атрибуты, которые красятся: `textcolor`, `activetextcolor`, `activetextoncolor`.
Атрибуты, которые НЕ трогаются: `bordercolor`, `focusbordercolor` (Кирилл настроил вручную — НЕПРИКОСНОВЕННЫ).

Смена режима Standard↔Follow живая (без перезагрузки девайса): при переключении mode в FOLLOW JS вызывает `emitTrack()` → outlet 10 красит кнопку; при переключении в STANDARD JS вызывает `pushDefaults()` → `outlet(10, "standard")` → live.colors возвращает амбер.

Подробности цвета → [[df-slot-coloring-recipe]]

---

## pattr tgt_param_id — персистентность MapButton цели

MapButton (MapButtonTint.maxpat) имеет `live.observer` (_persistence:1) на id параметра. **НА ЗАГРУЗКЕ `mb_idout` НЕ реплеит:** id теряется в `substitute 0 → t Map b` цепочке внутри MapButtonTint.

Фикс: `pattr tgt_param_id` в AMXD. Получает id когда mb_idout стреляет в сессии (`obj-46[1] → tgt_param_id`) и реплеит через JS inlet 9 (`onTargetId(v)`) при следующей загрузке. В Lock-режиме `onTargetId` вызывает `resolveTargetTrack()` → наблюдает за цветом target-трека.

**Ограничение:** только один replay на загрузку (первый pattr autorestore). Если пользователь меняет маппинг в сессии — pattr обновляется через прямую связь.

---

## Диагностика

**«Какой билд загружен в Live»:** AbletonMCP → список DeviceParameter девайса; проверить наличие нового параметра (напр. "Mapping Mode") — быстрее md5-археологии.

**«Диал не отвечает на CC»:** проверить `learnedCC >= 0` и в Lock что `absoluteMode=true` (live.text mode_abs связан с js inlet 8 через `mode_abs[0] → obj-4[8]`; findAbsoluteMode() читает параметр на bang()).

**«Цвет диала чёрный в Standard»:** проверить SA obj-31 `needlecolor` expression = `themecolor.live_value_arc` (НЕ `live_dial_needle` — тёмная); dev_ndq text = `"Control On Variant"` (с кавычками); dev_ndr text = `route "Control On Variant"`.

**«Max-редактор + Cmd-S стёр цвет»:** SA обнулился, рантайм запечён. Восстановить SA expression + статик materialized-fallback → [[df-slot-coloring-recipe]].

---

## Архитектура мультимап-панели (mm_tgt_N / mm_idroute / live.remote~)

**mm_tgt_0..7** — `Stored Only` live.numbox в главном патчере. Хранят target param id каждого панельного слота. **НЕ имеют исходящих связей.** Только принимают значения от `mm_route` (когда пользователь маппит в панели).

**Путь записи** (когда пользователь маппит слот i в панели):
`bpslot_i outlet 0 → mm_idprep_i (prepend i) → mm_idout → mm_panel outlet 1 → mm_route (в главном патчере) → mm_tgt_i[0]`

**Путь сброса live.remote~** (дубликат-гард):
`mm_idroute.message(i, 0)` (в multimapDF patcher) → `route 0..7 outlet i` → `bpslot_i inlet 1` (mb_ididin в MapButtonTint) → `mb_ididmsg "id 0"` → `live.remote~ "id 0"` → unmap.

**Почему не работает только очистка mm_tgt_N:** mm_tgt_N не имеют исходящих связей. Сброс mm_tgt_N через `box.message(0)` обновляет только visual amber state (через JS `_updateMapBtnVisibility`), но live.remote~ в каждом bpslot сохраняет привязку через внутренний механизм M4L.

**Доступ из JS:** `this.patcher.getnamed("multimap").subpatcher(0).getnamed("mm_idroute")`

## Invariants (при любой правке AMXD)

- Unfrozen: JSON @ 0x20, `ptch_size` = `json_len + 1` (включает `\x00`), LE@0x1C. Invariant: `ptch_size == filesize - 0x20`.
- Rebuild: `new_ptch_size = len(new_json_bytes) + 1`, `new_raw = raw[:0x1C] + pack("<I", new_ptch_size) + new_json_bytes + b'\x00'`.
- После rebuild: re-parse JSON, счётчики boxes/lines не изменились (если не добавляли), null-byte на месте.

---

## Label persistence (слот-подпись, finalized 2026-07-14)

### Хранение
6 скрытых live.numbox (`lnb_t0..lnb_t5`), `presentation=0`, `patching_rect` off-screen:
- `parameter_type: 0` (Float) — **критично**: тип Int → M4L игнорирует mmax и зажимает в 0..255
- `parameter_mmax: 4194304.0` (= 2^22) — задаёт DeviceParameter.max, который Live API уважает
- `parameter_unitstyle: 0`, `parameter_modmode: 0` — из шаблона Mapping Deck dfp_pg0_t0
- Без `parameter_mmin`, `parameter_initial`, `parameter_initial_enable` (тоже по шаблону)
- **box-level `minimum`/`maximum` НЕ управляют DeviceParameter range** — не нужны и удалены

### Кодек (11-bit/2 chars per chunk)
`v = c0 + c1 * CHAR_BASE` (CHAR_BASE=2048=2^11). Sentinel c0=0 = end of string.
- Покрывает U+0000..U+07FF: ASCII + Latin Extended + **кириллица** U+0400..U+04FF
- Символы ≥ U+0800 → '?' (63) — emoji и прочие заменяются
- Max значение чанка: 2047+2047×2048 = 4194303 < mmax 4194304 ✓
- 6 чанков × 2 символа = **MAX_LABEL_LEN=12 символов**

### Push (text → LiveAPI)
`schedulePushLabel()` — debounced 400ms после ввода. Защита `_restoring` (echo-loop guard). `_pendingPushName` глобальная переменная (ES3-безопасная для Max JS Task-closure). `LiveAPI.set("value", chunkVals[i])` на lnb_t0..t5.

### Restore (LiveAPI → display)
`bang() → Task(200ms) → _buildLabelPids() → _armLabelRestore()`:
- Observer на lnb_t0 (срабатывает при Live restore) + 500ms fallback timer → `_doRestore()` (идемпотентный)
- `restoreLabel()` → `parseFloat(par.get("value"))` × 6 → decode → `_applyLabel()`
- `_applyLabel()` → `slotName` update + `outlet(11)` (textedit set) + `outlet(12)` (fontsize)
- `_restoring=true` на 100ms: блокирует `schedulePushLabel()` чтобы restore не запустил push (echo-loop)

### Поиск pids (_buildLabelPids)
`par.get("name")` возвращает **короткое имя** (lbl_c0, НЕ lbl_chunk_0 longname).
Поиск: prefix `"lbl_c"` + `replace(/^lbl_c(hunk_)?/, '')` → index.
Если < 6 found: WARNING в console (громкий — помогает отловить сломанный параметр).

### textedit (pg_name_edit) — центр диала (КАНОН 2026-07-17, ПРИНЯТ ПОЛЬЗОВАТЕЛЕМ)

**Это чисто пользовательский ввод.** Ничего не тянется в `pg_name_edit` извне — только echo-восстановление из JS через `mm_tp`. Любой код, который пытается SET значение напрямую через inlet 0, сломает поведение.

**Канонические атрибуты (ручная сборка Кирилла, НЕПРИКОСНОВЕННЫ):**
- `varname = pg_name_edit`, `id = pg_name_edit`
- `fontsize = 16`, `fontname = "Ableton Sans"`, `wordwrap = 0`, **`keymode = 1`**
- `textjustification = 1` (center)
- `presentation_rect = [41, 57, 99, 28]`
- `patching_rect = [249, 82, 100, 37]`
- `bgcolor = [0,0,0,0]`, `border = 0`, `bordercolor` transparent
- `textcolor = themecolor.live_control_fg`
- Плейсхолдер `"+"`. Пустой ввод → `"+"`.

`keymode = 1`: Return немедленно завершает ввод и выводит буфер, не вставляя перенос строки. `wordwrap = 0` оставлен второй защитой, но НЕ блокирует Return-перенос сам по себе.

**Разводка (wiring):**
- `pg_name_edit[out0]` → `obj-4[in10]` — JS читает лейбл из textedit
- Echo-восстановление: `JS outlet(11, name)` → `pg_name_fromsym` → `pg_name_dfl (deferlow)` → `pg_name_setmsg ("script sendbox pg_name_edit set $1")` → `mm_tp (thispatcher)`
- **ИНВАРИАНТЫ:** inlet 0 — НОЛЬ входящих patchline; outlet 1 — НОЛЬ подключений (давал selectall-петлю); selectall — не использовать вообще

**Показ/скрытие при панели (ключевые боксы с геометрией):**
- `mm_col` (свернуть панель) = `script sendbox pg_name_edit presentation_rect 41 57 99 28`
- `mm_exp` (развернуть панель — прячет за экран) = `script sendbox pg_name_edit presentation_rect 600 57 99 28`
- При любой смене коробки `pg_name_edit` (размер/позиция) — синхронно править ОБА этих бокса
- Init-pos: `pg_init_sel (sel 0 1)` → [0]`mm_col` / [1]`mm_exp` → `mm_tp`

**JS-обработка ввода:**
- textedit шлёт весь контент с selector `"text"` → PRIMARY handler `function text()` в JS; `msg_symbol`/`list` — fallback
- `_applyLabel(name)`: PRIMARY = `this.patcher.getnamed("pg_name_edit").message("set", name)` (синхронный); FALLBACK = `outlet(11)` через deferlow
- `_applyLabel` вырезает `\n`/`\r` из строки (sanitize `/[\n\r]/g`) — вторая линия защиты от переносов
- `MAX_LABEL_LEN = 10` (ёмкость кодека lnb_t0..t5 = 6×2=12 символов, лимит 10 с запасом)
- Многословный лейбл: `b.message.apply(b, ["set"].concat(name.split(" ")))` — fixes Max quoting пробелов в textedit
- fontsize-цепочка (pg_name_fs_dfl + pg_name_fssend) УДАЛЕНА, computeFontsize из JS УДАЛЁН

**ВАЖНЫЕ УРОКИ (закрыты навсегда):**
1. Клиппинг текста и сползание при фокусе НЕ лечится подбором fontsize (13/15/16 — тупик) и НЕ лечится изменением высоты rect. Причина — накопленный мусор в атрибутах старого объекта. Единственное лечение: удалить textedit и создать заново начисто.
2. `wordwrap 0` НЕ блокирует вставку переноса строки по нажатию Return. Блокирует только `keymode 1`. Без `keymode 1` пользователь может создать двустрочный лейбл, который сломает кодек.

---

## Уроки сессии 2026-07-14 (важные инварианты)

### live.numbox parameter_type ловушка (подтверждено AbletonMCP)
- `parameter_type: 1` (Int) → M4L игнорирует `parameter_mmax`, DeviceParameter max = 255 (default Int)
- `LiveAPI.set("value", v)` при v>255 → клампится до 255 / "Invalid value" → данные не сохраняются
- FIX: `parameter_type: 0` (Float) + `parameter_mmax` → DeviceParameter принимает весь диапазон
- box-level `minimum`/`maximum` — только для виджета отображения, не управляют DeviceParameter
- Эталон: Mapping Deck `dfp_pg0_t0` (подтверждён MCP в живой сессии: min=0, max=4194304, is_quantized=False)

### Enum-параметры при init (Color Mode / Mapping Mode)
- `par.get("value")` для Enum может вернуть строковое имя значения → `parseInt("Follow Track")` = NaN
- NaN в тернарном выражении `NaN ? ... : ...` = falsy → всегда дефолт → сбивает restore
- FIX: убрать `findColorMode()`/`findAbsoluteMode()` из `bang()` — доверять inlet-callback от live.* объектов (они реплеят restore ДО live.thisdevice loadbang)
- `parameter_initial_enable: 1` нужен для live.text (Enum) чтобы начальное значение работало

### LiveAPI par.get("name") = shortname
- Live возвращает **shortname** (lbl_c0), не longname (lbl_chunk_0)
- Поиск параметров по longname-строке → 0 found → silent failure → persistence broken
- FIX: prefix-matching по shortname + громкое WARNING если count < expected

### jsui JSON-ловушки (для следующего витка jsui-label)
1. `filename` живёт НА ВЕРХНЕМ уровне box-JSON (НЕ в `saved_object_attributes!`): `"filename": "df_slot_label.js"` в самом box-объекте
2. `border: 0` обязателен — иначе белый прямоугольник поверх jsui
3. `box.rect` в jsui = `[x, y, width, height]`. Ширина = `box.rect[2]`, НИКОГДА `box.rect[2] - box.rect[0]` (= отрицательное число → paint() падает, серый пирог)
4. Gray "pie chart" default рендеринг = ИЛИ скрипт не найден, ИЛИ runtime-ошибка в paint(). Симптомы неотличимы → проверять оба.
5. Путь к .js для jsui: Max ищет в paths, включая папку рядом с .amxd и User Library/Max Devices/
6. Парковка: `~/Brain/fadercraft/_device-backups/df_slot_label.jsui-parked.js` (md5 `5b2d24c0`)

### Отладочная петля с AbletonMCP
- Проверка фактических DeviceParameter min/max + тестовая запись через MCP ДО ручного теста → экономит 1-2 цикла «сохрани-перезапусти»
- "DeviceParameter.max=255 при mmax=4M" = точная диагностика за 30 секунд

---

## Ретроспектива 2026-07-17 — сага с pg_name_edit (центральная подпись диала)

**Финальный md5 продакшна:** `6f875013`

### Что было сломано

textedit-подпись в центре диала резалась снизу при фокусе/редактировании: нижняя часть текста уходила за край коробки и «сползала» вниз. При нажатии Return вставлялся перенос — текст уходил на вторую строку. Персист лейбла и показ/скрытие панели периодически переставали работать.

### Тупики — что НЕ сработало (не повторять)

**1. Подбор fontsize и высоты rect (много раундов).**
Гоняли кегль 13 → 15 → 16 и двигали высоту presentation_rect, ожидая что «влезет». Клиппинг и сползание не уходили ни при каком размере коробки и ни при каком fontsize. Причина оказалась совершенно другой — подбор кегля и размеров был потерей времени.

**2. Откат к «заведомо рабочему» состоянию (md5 ca421e0c, fontsize=13, rect=[39,63,103,15]).**
Ключевой эксперимент: откатились к ранней версии AMXD, где клиппинга предположительно не было. Результат — текст ВСЕГДА резался, даже в этой версии. Это окончательно исключило версию «что-то сломалось в кегле/rect»: дело было в самом объекте, а не в его параметрах.

**3. Ручное смещение y-координаты (57→53→61) «на глаз».**
Пробовали сдвигать presentation_rect по Y без понимания механизма. Ни одно значение не убирало клиппинг — эмпирика без гипотезы, зря потраченные круги.

**4. `wordwrap 0` как единственный барьер от переноса.**
`wordwrap 0` НЕ блокирует вставку `\n` при нажатии Return — текст всё равно уходит на вторую строку. Обнаружили, что рычаг не там.

### Что устаканили — канон

**Корень клиппинга/сползания: порча атрибутов старого объекта.**
textedit прошёл через множество правок, переименований, подмен атрибутов в JSON — накопился невидимый мусор в сохранённом состоянии. Лечение только одно: удалить объект и создать `textedit` заново начисто. Пользователь сделал это руками. Чистый 16pt textedit не режется, не прыгает, не сползает.

**varname — обязательное условие персиста и показ/скрытия.**
Новый объект пользователь подключил правильно (`pg_name_edit[out0] → obj-4[in10]`), но не добавил `varname = pg_name_edit`. Без него `getnamed("pg_name_edit")` и все `script sendbox pg_name_edit …` молча промахиваются — нет ни echo-восстановления, ни показ/скрытия. Добавили в JSON → всё заработало.

**Message-боксы панели держат геометрию хардкодом.**
`mm_col` и `mm_exp` содержат полный `presentation_rect` в тексте сообщения. При любой смене коробки `pg_name_edit` (позиция/размер) их надо синхронно обновлять, иначе первое сворачивание панели вернёт старый режущий rect. Приведены к `[41,57,99,28]` / `[600,57,99,28]`.

**Однострочность: рычаг — `keymode 1`.**
`keymode 1` заставляет textedit немедленно вывести буфер при Return, не вставляя `\n` (перехватывает и Shift+Return). `wordwrap 0` оставлен второй защитой. JS `_applyLabel` режет `\n\r` третьим барьером.

**MAX_LABEL_LEN подняли до 10.**
С 8 подняли на +2 — с запасом в пределах ёмкости кодека (6 чанков × 2 символа = 12 символов).

**Персист лейбла жив и в финале работает нормально.**
Параметры `lbl_chunk_0..5`, JS находит их через `_buildLabelPids()` по префиксу `"lbl_c"`, декодирует chunk-значения → `_applyLabel` → `getnamed("pg_name_edit")`. Цепочка цела — проблемы с персистом были следствием отсутствия `varname`, не самого кодека.

### Мета-урок (навсегда)

При клиппинге или сползании textedit — **не гонять кегль и rect по кругу**. Первое подозрение: порча атрибутов объекта. Верификация: откатиться к заведомо старой версии AMXD и проверить, воспроизводится ли там. Если воспроизводится — значит дело в объекте, не в параметрах. Решение: удалить textedit и создать заново начисто.

---

## Текущее состояние (2026-08-08, после отката)

**AMXD:** `Dynamic Focus Slot.amxd` md5=`a7e525f6` (217379B, **173 boxes / 141 lines**, UNFROZEN). Убраны: `pattr_tgt` + zombie chain (dev_lczq/lcz/lczr/mapz/thgz) + `mmi_bc` + `p colorlogic` в multimapDF. Это подтверждённый рабочий чекпоинт (Кирилл: "кажется, все встало на место. Работает, не ломается").
**JS:** `midi_learn_slot.js` md5=`9c265566` (1831 строк, 86426B). Внешний unfrozen файл.
**Формат:** JSON indent=1, UNFROZEN, нет dlst, JSON @ 0x20.

### Orphan audit 2026-08-07 — результаты (ФИНАЛЬНО подтверждено Кириллом)
- **Убрано (2026-08-07), все в чекпоинте `a7e525f6`:**
  - `pattr_tgt` (`pattr TgtId @autorestore 1`) — orphaned, superseded pipeline `ps_tgt→lnb_tgt`
  - Zombie chain: `dev_lczq`, `dev_lcz`, `dev_lczr`, `dev_mapz`, `dev_thgz` (5 объектов, 6 линий) — готовил `lcd_control_fg_zombie` цвет, но `dev_thgz` gate-выход никуда не шёл
  - `mmi_bc` (`bordercolor $4 $5 $6 1.`) — получал цвет от dev_thg/mmi_trkg, 0 исходящих (intentionally cut), убран
  - В multimapDF.maxpat: `obj-59 (p colorlogic)` — inline sub-patcher с color logic, outlet в parent не подключён; no side effects (нет send/pattr/LiveAPI кроме live.colors/live.thisdevice)
- **Итог: 180 → 173 boxes; 149 → 141 lines в main AMXD. multimapDF: 55 → 54 boxes; 93 → 92 lines.**
- **Попытка фичи Slot-7/main-Map mirror (2026-08-07-08) — ОТКАТЕНА.** JS-only линковка не заработала, вся отладка провалилась. Wiring не был понят правильно. Откат к этому чекпоинту.
- **Легитимная персистентность (не мусор):** `lnb_t0..5` (label codec), `lnb_dev_slot` (dup-guard), `lnb_dn_0..6`+`lnb_tpi` (main byname), `pnl_dn_0_0..pnl_dn_7_6`+`pnl_tpi_0..7` (64+8 объектов, panel-slot byname), `mm_tgt_0..7` (Stored Only).
- **Debug-боксов нет**
- **multimapDF:** `mm_idroute` varname='mm_idroute' (добавлен Кириллом 2026-08-07, fix для JS getnamed); `obj-10` (outlet 0) dangling с начала — нормально
- **AMXD итог:** 180 → 173 boxes; 149 → 141 lines. **multimapDF итог:** 55 → 54 boxes; 93 → 92 lines.

### pnl_dn_N_M / pnl_tpi_N — панельный byname (64+8 объектов)
8 слотов × 9 нумбоксов = 72 completely-dangling live.numbox в main AMXD. Все ЛЕГИТИМНЫ:
- `pnl_dn_S_C` (float, shortname="PnDnSC") — имя устройства (3 символа на чанк), slot S, chunk C
- `pnl_tpi_S` (float, shortname="PnTpiS") — packed paramIdx+devOcc для панельного слота S
- JS: `_findPanelBnParams()` → `_encodePanelBn(si, devName, paramIdx, occ)` → `_resolvePanelSlotsOnHostTrack()` на bang() init
- Доступ только через LiveAPI (id), нет patcher-линий — нормально

### Preset recall bug — ✅ ЗАКРЫТ (2026-07-23, подтверждён пользователем)

**Ключевой факт (ПОДТВЕРЖДЁН тестом):** `LiveAPI.set("value", X)` обновляет LOM-значение devparam, но НЕ обновляет serialized stored value `live.numbox`, которое Ableton реально сохраняет в `.adv`/`.als`. Единственный рабочий путь к persistent stored value — patcher-message `"set X"` → `lnb_tgt in0`.

**Источник 0:** MapButtonTint → inline RangeAndName (obj-16) → `live.object` (obj-130) без привязки при init → `route min max name id` (obj-133) out3 → `ran_idout` → `mb_idout` → выход 1 bpatcher → `ps_tgt → "set 0" → lnb_tgt`. Происходит ПОСЛЕ parameter restore → перезапись 0.

**Исправление в двух файлах (никаких новых объектов):**

1. **MapButtonTint.maxpat** (md5=`539e870b`): внутри inline-патчера obj-16 (RangeAndName):
   - УДАЛЕНА линия `obj-133[3] → ran_idout` (прямой неотфильтрованный путь)
   - ДОБАВЛЕНА линия `obj-31[1] → ran_idout` (через существующий `sel 0` obj-31, который уже там был)
   - Теперь: id=0 → obj-31 out0 (match) → obj-30 (цветовая машина) → ran_idout НЕ стреляет
   - id=X → obj-31 out1 (non-match) → obj-132, obj-32, ran_idout ✓

2. **Dynamic Focus Slot.amxd** (md5=`b74bff3b`, 97 boxes/138 lines): ВОССТАНОВЛЕНА линия `ps_tgt[0] → lnb_tgt[0]` (канал персистентности). Новых объектов нет.

Цепочка при ребайнде: id=X → sel0 фильтрует → ran_idout → mb_idout → (out1 bpatcher) → ps_tgt → "set X" → lnb_tgt stored = X ✓

**Панельный слот (mm_tgt_0..7) — отдельная подсистема, не баг:**
- Кнопка Map в расширенной панели (8 строк) = панельный слот, НЕ главная кнопка
- mm_tgt_0..7 (Stored Only) → путь mm_idprep → mm_route, НЕ через ps_tgt/lnb_tgt
- live.remote~ панельного слота восстанавливается Live самостоятельно → кнопка amber после recall = нормально
- CC не роутит через панельный слот — это design intent, не баг
- Главная кнопка (скрыта при раскрытой панели) → после закрытия панели и маппинга → preset recall работает

**Архивы (2026-07-23) в `~/Brain/fadercraft/_device-backups/`:**
- `82b41cb0` AMXD = pre-all-fixes (2026-07-22, tag `pre-preset-recall-fix`)
- `73c54aba` AMXD = first broken fix (ps_tgt→lnb_tgt disconnected)
- `9dd14dc6` AMXD = sel0-in-main-patcher broken (`object: no such object`) — СЛОМАН
- `c86727a5` AMXD = if-gate in main patcher broken (`if: missing then`) — СЛОМАН
- **`b74bff3b` AMXD + `539e870b` MBT = ФИНАЛЬНЫЙ ПРОДАКШН, подтверждён пользователем**

### learnedChannel persistence bug — ✅ ЗАКРЫТ (2026-07-27)

**Симптом:** два DF Slot, выучившие одно и то же CC на РАЗНЫХ Custom Mode (ch11 и ch12), после reload сета оба теряют learnedChannel (откат к неверному значению). CC от Custom Mode перестаёт маршрутизироваться либо двойной триггер.

**Корень:** `LiveAPI.set("value", learnedChannel)` в JS после Learn обновлял только LOM DeviceParameter, но NOT сериализуемое stored value live.numbox. Кроме того, `lnb_ch` имел varname `'live.numbox[1]'` — недоступен через `patcher.getnamed("lnb_ch")`. `pattr_ch restore: [0]` перезаписывал неверным дефолтом.

**Фикс (2026-07-27):**
1. **JSON patcher:** `lnb_ch` varname `'live.numbox[1]'` → `'lnb_ch'` (делает доступным через getnamed). `pattr_ch` restore `[0]` → `[-1]` (семантически верно: -1=unlearned).
2. **JS (3 места):**
   - Learn completion (ранее ~l.1682): `LiveAPI.set(chParamId, learnedChannel)` → `this.patcher.getnamed("lnb_ch").message(learnedChannel)` (raw number → inlet 0 → обновляет stored value + LOM + firing outlet → persists to .als).
   - `unmap()`: то же, message(-1).
   - `_resetAllMappings()`: то же, message(-1).
   - Guard expanded: `if (chParamId < 0 || ...) _findOwnParams()` чтобы chParamId находился при раннем Learn.
3. **Патч формат:** Path B (JSON + JS dep меняют размер). JSON 213683→152913B (indent=1 компактный). Все dlst of32 сдвинуты на -60770. JS 86196→86426B (+230). Итоговый файл 718317B.

**Инвариант после фикса:** `this.patcher.getnamed("lnb_ch").message(ch)` → raw число в inlet 0 live.numbox → stored value = ch → при следующем .als reload DeviceParameter restore → lnb_ch outlet → JS inlet 4 → learnedChannel = ch ✓. Также chObserver при 200ms Task читает LOM = ch ✓.

**Архивы (2026-07-27):**
- `_device-backups/Dynamic Focus Slot.2026-07-27.amxd` md5=`592e002d` — pre-fix
- `_device-backups/midi_learn_slot.2026-07-27.pre-ch-persist-fix.js` — pre-fix JS
- Продакшн: md5=`8e072d5f` (718317B), JS md5=`9c265566` (86426B)

**Пользователю:** после первой загрузки нового девайса нужно заново сделать Learn в существующих сетах (старые .als хранят неверный channel=0). После нового Learn + save → канал персистирует навсегда.

### Rack focus bug (НЕ исправлен в продакшне, 2026-07-22)

Если DF Slot помещён внутрь рэка (Instrument/Audio/MIDI rack), `setupFocus()` → `canonical_parent` возвращает id Chain, а не Track. `hostId` = Chain id; `selId` = Track id → `selId !== hostId` всегда → `active=0` → CC не работает. Тест-копия реализует `_findOwningTrackId()` (ходит по canonical_parent вверх до MidiTrack/AudioTrack/ReturnTrack/MasterTrack). Нужен hardware тест.

Тест-копия: `Dynamic Focus Slot (TEST).amxd` md5=`96eeb3dd` + `midi_learn_slot_test.js` в UL. Лог: `[TEST] onSelectedTrack: selId=N hostId=M → nowActive=N`. Удалить после теста.

### IPC-оптимизация JS (2026-07-22)

- empty-guard: `onSelectedTrack` гейтит `checkParentMove/readDialValue` за `learnedCC >= 0 || targetParamId > 0`.
- `_thisDeviceApi` кэш: `_getThisDevice()` → одноразовый IPC.
- `_dialObserver` на `dialParam.value` — `currentVal` актуален без IPC.
- `_parentObserver` на `this_device canonical_parent` — rate-limit 30s.
- `_lastSentDialValue` echo-guard в setVal().
- IPC per mapped instance per track-switch: 0 steady-state, 1 раз в 30s.

### Дубликат-гард (v3 panel-only, 2026-07-21)

`lnb_dev_slot` (Stored Only Float, shortname="DevSlot", initial=-1, mmax=1M). Bang Task: всегда вызывает `_isDuplicate()` → Phase1: external ids (TgtId + mm_tgt_0..7); Phase2: slot(track×1000+device) изменился? → reset. `_resetAllMappings`: CC/Ch/TgtId=0 + outlet(12,0) + mm_idroute(i,0) для 8 слотов. Ключевые ловушки:
- `mm_idroute` требует varname (иначе getnamed() = null → цикл сброса панели молча пропускается).
- `it_dg` gate в MapButtonTint открывается ТОЛЬКО через `obj-14 live.text → obj-39`; outlet(12,0) unbind-ит remote~, но gate остаётся закрытым.
- initial=-1 (не 0): slot трека 0/dev0 = 0, guard `< 0` (не `<= 0`).

### Персист и lnb объекты

`lnb_cc` (INT, pe=1, shortname="CC", mmax=128), `lnb_ch` (INT, shortname="Ch", mmax=16), `lnb_tgt` (FLOAT, shortname="TgtId", mmax=10M). pattr_cc/ch ещё пишут в lnb_cc/ch (стреляют ДО parameter restore — безопасно). lnb_tgt out0 → obj-4 in9 (FLOAT, игнорится msg_float; tgtIdObserver ловит). Label: lnb_t0..t5 (Float, mmax=4194304, 11-bit codec 2 chars/chunk, MAX_LABEL_LEN=10). pg_name_edit: fontsize=16 Ableton Sans, keymode=1.

**Byname numboxes (добавлены 2026-07-23, 8 новых боксов):**
- `lnb_dn_0..6` (Float, shortname="DevNm0".."DevNm6", mmax=2097152): имя устройства, 3 ASCII-символа на чанк (DN_BASE=128, max 21 символ)
- `lnb_tpi` (Float, shortname="TgtPI", mmax=1000000): packed `paramIdx + devOcc * 10000`

**Byname pipeline:** `onTargetId(id)` → `_captureByNameFromId(id)` [Task(0)] → `_pushByNameData(devName, paramIdx, devOcc)` → numboxes. На init: `_findByNameParams()` + `_restoreByNameData()` → `_resolveByNameOnHostTrack()`. Dup-guard: если byname resolve успешен → `_bindToId(id)` вместо `_resetAllMappings()`. Stale TgtId: аналогично. `unmap()` очищает DevNm0..6 + TgtPI. mixer/return/master параметры byname не поддерживают (нет named-device path) — silent skip.

### SVG-ошибки в console

18 ошибок при загрузке от `obj-swap-btn` (pictures swap-params[-flip].svg не существуют). Нормально, не цикл. mb_ididin/mm_idroute не связан с obj-swap-btn.
