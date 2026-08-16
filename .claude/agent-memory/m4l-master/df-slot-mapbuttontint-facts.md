---
name: df-slot-mapbuttontint-facts
description: MapButtonTint ячейки DF Slot — УСТАНОВЛЕННЫЕ ФАКТЫ (диффы/дампы/скриншоты). Обновлять при каждой новой проверке.
metadata:
  type: reference
---

# MapButtonTint — Установленные факты (2026-07-16)

> Правило: только факты, подтверждённые инструментально (дамп / diff / скриншот). Обновлять при каждой новой проверке.

---

## 1. Карта элементов ячейки MapButtonTint

Подтверждено: diff канон `MapButtonTint.maxpat` (eba6508b) + инспекция атрибутов.

| Объект | maxclass | varname | Роль | Visible |
|--------|----------|---------|------|---------|
| `obj-9` | live.text | `border` | «Рамка»-плейсхолдер поверх Map button | НЕТ: все цвета alpha=0; ignoreclick=1 |
| `obj-14` | live.text | `live.text` | Map button (LCD appearance=2): click=arm/map | ДА: bgcolor=amber/alpha=0 (off), bgoncolor=amber/alpha=1 (on), **bordercolor=amber/alpha=1 (ВСЕГДА)** |
| `obj-28` | live.text | `live.text[1]` | X (unmap) кнопка | ДА |
| RangeAndName | sub-patcher | — | Получает `id N`, пишет в live.remote~, выдаёт ran_idout (outlet 6) | — |
| `live_remote` | live.remote~ | `live_remote` | Хранит маппинг параметра | — |

### Кто пишет в какой цветовой атрибут obj-14

| Отправитель | Атрибут | Когда |
|-------------|---------|-------|
| `t_bgon` (message) | bgoncolor | При track color change (Follow) |
| `t_bord` (message) | bordercolor | При track color change (Follow): `$4 $5 $6 1.` |
| `t_abgon` (message) | activebgoncolor | При track color change |
| `it_bgg` gate | lcdbgcolor | При init/mode |
| `it_ctg`, `it_txg`, `it_zg` gates | lcdcolor | Контент-цвета |
| `obj-42` (p mapping) | value 0/1 | Arm on/off |
| **JS `_updateMapBtnVisibility`** | **bordercolor** | **DEV-V5+: mapped=alpha0, unmapped=alpha1** |

**obj-9 (border)** — ВСЕ цвета alpha=0 (прозрачный). bordercolor=[0,0,0,0]. Hiding obj-9 визуально ничего не меняет. Цепочка `bord_hidden_on/off → obj-9 hidden` в archive была архитектурной ошибкой (действовала на невидимый объект).

---

## 2. Канон-поведения (подтверждены diff/dump)

- **obj-14.value=0 при замапленной ячейке = КАНОН**: `p mapping` (obj-42) выключает кнопку после выбора параметра. Diff входящих линий obj-14: ИДЕНТИЧЕН в каноне, archive и dev (14 линий, все перечислены выше). Bord_ chain никогда к obj-14 не подключался. Подтверждено: diff 2026-07-16.
- **Амберное кольцо obj-14 = КАНОН**: `bordercolor=[amber, alpha=1]` сохранён в canonical `eba6508b`. В Standard+unmapped: bgcolor alpha=0 + bordercolor alpha=1 = visible ring. В Standard+mapped: то же (value=0, ring visible) — ЭТО visual issue, не баг JS.
- **obj-14.value=1 = ARM state**: пользователь кликнул Map, ожидает выбор параметра. Может сохраняться между сессиями (parameter_enable=1 на obj-14 → Live сохраняет value).
- **bord_ chain (archive 229eb1fe)**: 6 объектов, 12 линий — управляли только obj-9.hidden. К obj-14 отношения не имели. Удаление bord_ chain в dev = инертно для видимости рамки. Подтверждено: diff 2026-07-16.
- **isFollow × state-machine**: в Standard режиме (colorMode=1) state machine всегда выдаёт 0 на компоненты цвета. Follow (colorMode=0) → track color → obj-14 bordercolor через t_bord.

---

## 3. Ловушки (подтверждены)

| Ловушка | Источник | Подтверждено |
|---------|----------|--------------|
| `live.text` не имеет атрибута `border` в Max UI | Атрибут называется `bordercolor`. Нет toggle; рисуется ВСЕГДА при alpha>0. | Инспекция атрибутов obj-14 |
| `bordercolor alpha=0` НЕ прячет в Live themed context | Live/Ableton тема рисует свой border поверх | ⚠️ Под вопросом для DEV-V5 — нужен hardware тест. При alpha=0 в dev окне Max объект выглядит без рамки; в Live может отличаться |
| JS-бокс грузит файл по `saved_object_attributes.filename`, НЕ по `text` | Confirmed: изменение только `text` не меняло загружаемый файл. Консоль показывала `midi_learn_slot.js` вместо `_dev_midi_learn_slot.js`. | Дамп 2026-07-16 (msg "no function devdump [midi_learn_slot.js]") |
| `delay` не отвечает на int (нужен `t b`) | delay в Max ожидает bang, int игнорирует. | Общая Max-ловушка, документирована в amxd-format.md |
| `getattr("value")` на plain `number` box → NaN | Правильный API: `getvalueof()`. | Дамп 2026-07-16: dbg_mflag=NaN |
| `panelmap.local = 1` делает функцию недоступной для message | Max js: `.local=1` = private, вызов через message невозможен. Ошибка: `js: function panelmap is private`. | Ошибка в консоли 2026-07-16 |
| `live.remote~.getattr("mapcount")` из JS → NaN | DSP-объект, атрибут mapcount недоступен стандартным getattr из JS. Возвращает "N/A" / NaN. | Дамп DEV-V3 2026-07-16: `mapcount=gv:0` |
| `obj-16[6]` (ran_idout) не стреляет при restore из Live Set | `live.remote~` reconnects INTERNALLY (Live engine), bypass Max data flow. Событийный number box `dbg_tgtid` остаётся 0 после reload. | Дамп DEV-V4: 7 mapped rows → все tgtId=0 |

---

## 4. Схема persist/restore TgtId

### Main cell (DF Slot main patcher)
- **Хранится в**: `lnb_tgt` (live.numbox, parameter_enable=1, Stored Only, `Parameter TgtId`, mmax=10000000)
- **Пишется**: `onTargetId(id)` в JS → outlet → через `ps_tgt (prepend set)` → lnb_tgt
- **Restore при reload**: Live engine восстанавливает lnb_tgt.value до JS 200ms Task → JS читает через restore outlet → `onTargetId()` → `_doRebind()`

### Panel cells (bpslot0..7 в multimapDF → MapButtonTint)
- **Маппинг хранится в**: `live.remote~` (восстанавливается Live engine автоматически — параметр bindging в Live Set)
- **TgtId для JS-чтения**: `mm_tgt_N` (live.numbox, parameter_enable=1, varname=`mm_tgt_0`..`mm_tgt_7`) в ГЛАВНОМ AMXD патче — питаются от `mm_route[N]` при живом маппинге, сохраняются в Live Set
- **Restore при reload**: Live engine восстанавливает mm_tgt_N.value до JS 200ms Task → `getvalueof()` возвращает корректный ID
- **dbg_tgtid в MapButtonTint**: event-only (plain number), обнуляется при reload. НЕ использовать как primary source. Оставлен для диагностики.

### Почему live.remote~ restore не обновляет mm_tgt_N
Live engine reconnects `live.remote~` через внутренний механизм без прохождения через Max data flow (mb_ididmsg, ran_idout и т.д.). Поэтому любой event-only объект (plain number box) будет 0 после reload.

---

## 5. live.text (appearance=2, usepicture=1, remapsvgcolors=1) — канал-карта иконки

**Ловушка active\* семантики**: в M4L контексте «active» = девайс включён (normal/enabled state). `bg*` (без active prefix) = когда M4L-девайс BYPASSED. Наши ранние фиксы бились в `bg*`-каналы которые в нормальной работе вообще не рендерятся.

**Confirmed channel map (mm_icon, probe V11 + operational V13 2026-07-17):**

| Состояние | Button background | Глиф/бары SVG |
|-----------|------------------|---------------|
| value=0 (closed, device ON) | `activebgcolor` (dark, expression) | `textcolor` + `textoffcolor` (both amber, set by text* attrs) |
| value=1 (open, device ON) | `activebgcolor` (dark) | `textcolor` |
| device BYPASSED | `bgcolor`/`bgoncolor` | — |

**Подтверждённые правила (operationally confirmed V13):**
- `textcolor` и `textoffcolor` = гляф каналы (SVG source #FFB532 remapped to these)
- `activebgcolor` = button BACKGROUND (dark, themecolor.live_lcd_bg expression)
- `bgcolor`/`bgoncolor` = bypassed state — в нормальной работе не рендерятся
- `dev_thg` → `mmi_tc` → `textcolor $4 $5 $6` fires amber ONLY at init/mode-change/track-change, NOT on mapcount change
- Когда mapcount→N: mm_buttoncolor sel=1 fires и может ОБНУЛИТЬ textcolor до dark (obj-64 original = "LCD Background")

**ROOT CAUSE GLYPH KILL**: mm_buttoncolor sel=1 content:
- obj-64: `textcolor "LCD Background"` = dark → fires when mapped → textcolor=dark → glyph invisible
- obj-65: `activetextoncolor "LCD Background"` = dark → same issue
- obj-66: `activetextcolor "LCD Background"` = dark → same issue
- `dev_thg` does NOT re-fire on mapcount change → dark sticks

**V13 FINAL FIX sel=1:**

| obj | текст V13 | смысл |
|-----|-----------|-------|
| obj-70 | `activebgcolor "LCD Background"` | dark fill (Fix-4, keep) ✓ |
| obj-67 | `activebgoncolor "LCD Background"` | dark fill click (Fix-4, keep) ✓ |
| obj-74 | `textoffcolor "LCD Text / Icon (Inactive)"` | amber glyph (V12 fix) ✓ |
| obj-64 | `textcolor "LCD Text / Icon (Inactive)"` | **amber-dim glyph — V13 KEY FIX** ✓ |
| obj-65 | `activetextoncolor "LCD Text / Icon"` | amber glyph click ✓ |
| obj-66 | `activetextcolor "LCD Text / Icon"` | amber glyph ✓ |
| obj-63 | `bgoncolor "LCD Text / Icon (Inactive)"` | bypassed+open amber |
| obj-62 | `bgcolor "LCD Text / Icon (Inactive)"` | bypassed+closed amber |

---

## 6. mm_icon / mm_buttoncolor fix (портирован в продакшн)

**Проблема**: arm blink metro (`it_armmetro`) → mm_buttoncolor → bordercolor mm_icon = amber (token "LCD Text / Icon"). Создавало видимую амберную рамку вокруг mm_icon (Show/Hide Panel кнопка) в Standard режиме.

**Фикс**: изменить mm_buttoncolor output target с amber на `themecolor.live_lcd_bg` (тёмный, = bordercolor самого mm_icon). Убрать линию `mmi_bc → mm_icon`. 

**Результат**: mm_icon.bordercolor = live_lcd_bg (тёмный, невидимая рамка). Статус: ПОРТИРОВАН в продакшн `Dynamic Focus Slot.amxd` (8e38a081, 2026-07-16).

---

## 6. Инвентарь файлов

### MASTER baseline (снапшот 2026-07-16)
`~/Brain/fadercraft/_device-backups/MASTER-2026-07-16/`:
- `Dynamic Focus Slot.amxd`: `8e38a081` (127965 B) — с mm_icon fix
- `MapButtonTint.maxpat`: `eba6508b` (129640 B) — canonical
- `multimapDF.maxpat`: `37e6ccf7` — canonical

### Продакшн (User Library Max Devices)
- `Dynamic Focus Slot.amxd`: `8e38a081` (127965 B) ← CURRENT PROD
- `midi_learn_slot.js`: `c69bc19e` ← CURRENT PROD, НИКОГДА НЕ ТРОГАТЬ

### Dev-среда (_dev_*) — CURRENT V13 (2026-07-17)
| Файл | md5 | Что изменено vs master |
|------|-----|------------------------|
| `_dev_DF-Slot.amxd` | `7ef18490` (V13, 60297 B, 104 boxes/150 lines) | sel=1 obj-64/65/66 text* → amber; obj-74 textoffcolor amber; mm_icon exprs dark; mmi_bgon dynamic |
| `_dev_midi_learn_slot.js` | `4da6b984` (DEV-JS-V13) | panelmap() 700ms Task; applyColor() in _doRebind 700ms Task |
| `_dev_dfs_dump.js` | `fcde20f2` (DEV-V13) | version markers |

**Dev-only мусор** (не трогать при портировании в продакшн): dump chain, DEV-JS-V3 post, dbg_tgtid, dbg_mflag, dbg_isstd, mode_rs, _dev_* имена файлов.

### Архивы (device-backups)
- `_dev_MapButtonTint.2026-07-16-163949.maxpat` md5=`229eb1fe` — pre-bord-removal (archive)
- Текущие архивы: `_dev_*.2026-07-16-192252.*`, `_dev_*.2026-07-16-213038.*`, `_dev_*.2026-07-16-214202.*`

---

## 7. Текущий дизайн фикса рамок (DEV-V6)

### Что делает `_updateMapBtnVisibility()`
1. Main cell: `targetParamId > 0` = mapped
   - obj-9 (border): `hidden = (Standard && mapped) ? 1 : 0`
   - obj-14 (live.text): в Standard → `bordercolor amber alpha=0` если mapped, `alpha=1` если unmapped
2. Panel cells: `mm_tgt_N.getvalueof() > 0` = mapped (persistent source)
   - Аналогично obj-9 hidden и obj-14 bordercolor

### Открытые вопросы
- **bordercolor alpha=0 в Live**: работает ли в продакшн Live? Live может рисовать themed border поверх. Нужен hardware тест DEV-V6.
- **Первая строка панели solid amber**: obj-14.value=1 (arm state сохранился между сессиями через parameter_enable=1). Не баг логики — следствие того что Map button state персистирует. Очищается при следующем взаимодействии.
- **bordercolor в Follow mode**: НЕ трогаем (track color управляет через t_bord, наш код пропускает Follow).

### Точки вызова _updateMapBtnVisibility
1. bang() 200ms Task (init settle)
2. setMode() (mode change)  
3. unmap() (after updateLabel)
4. list() CC-learn branch
5. devdump() (refresh before read)
6. onTargetId() (end of function)
7. _doRebind() (after outlet(12))
8. tgtIdObserver else-ветка (id=0 unbind)
9. panelmap() (panel slot maps — via AMXD wire mm_panel[1]→t b→message panelmap→JS inlet 0)
