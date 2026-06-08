# XL_Performance — факты по флагману

M4L-роутер для Novation Launch Control XL MK3. Переключает кастом-моды LCXL и роутит CC под Ableton-перформанс.

## Рабочий процесс (РАЗВОРОТ 2026-06-06 (8)) — РЕДАКТИРУЕМ ПРЯМО В USER LIBRARY
⚠️ Прежнее правило (репо-канон, User Library pristine/deploy-only) **ОТМЕНЕНО 2026-06-06**. Новое правило пользователя:
- **Основной редактируемый артефакт = User Library `.amxd`:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd`. ВСЕ правки — здесь. Это теперь канонная рабочая копия. (Путь — из памяти; подтвердить существование файла при первой правке по новому правилу.)
- **Pre-edit backup ОБЯЗАТЕЛЕН ВСЕГДА**, перед КАЖДОЙ правкой: архив User Library .amxd с датой-временем `~/Brain/Fadercraft/raw/archive/Control XL.YYYY-MM-DD-HHMMSS.amxd` (не перезаписывать существующий).
- **Propagate-only-on-command:** копирование/пропагация дальше (проектный репо-эталон, бандл-слоты 3–6, zip, и т.п.) — ТОЛЬКО по явной команде «копируй дальше»/«пропагируй». Никогда не авто-копировать результат.

### ⛔ BROWSER LOAD ОТЛОЖЕН + ПОЛНЫЙ ОТКАТ 2026-06-06 (14) — все слоты `44aa142b`
**Фича Browser Load (CC51) свёрнута/отложена по решению пользователя; откат выполнил пользователь сам (я .amxd НЕ трогаю).**
- **Причина:** Live Browser (`browser`/`load_item`/`hotswap_target`/`BrowserItem`) **НЕ выставлен в M4L LiveAPI** — подтверждено на Live 12.4.1 (детали в [[reference_m4l_no_browser_api]]). Загрузка выделенного браузер-item из `.amxd`-девайса НЕВОЗМОЖНА. Возврат к фиче — только через Python MIDI Remote Script ([[reference_lcxl3_remote_script]]), не в M4L.
- **Текущее состояние:** все 6 слотов Control XL = **`44aa142b198b6001613db3b29c36cc38`** (чистая до-фичная версия). Слот 2 User Library и слот 1 проектный эталон восстановлены на `44aa142b` (были `0fc224e4`/`095885b6`/`63d95bbe`). Слоты 3–6 не менялись.
- **Удалены scratch-js** `browser_load.js`/`fc_browserload.js`/`fc_bload2.js` (+ `.backup-*`) из User Library и project device. `version_check.js` НЕ тронут.
- **История попыток** заархивирована в `~/Brain/Fadercraft/raw/archive/` (`Canon-`/`UserLib-`/`Control XL.*` 2026-06-06).
- ~~«Расхождение версий закрыто (9)»: Browser Load доставлен в User Library, UL = `63d95bbe`.~~ **ОТКАЧЕНО — недействительно.**

### История (отменённого правила)
- Прежний канон-в-репо: `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd`. Теперь это просто проектный эталон — пропагация туда только по команде.
- Чистый оригинал (байт-в-байт до любых правок, 211548 B, md5 `90de7585…`): `~/Brain/Fadercraft/raw/archive/Control XL.2026-06-06.amxd`.

## Пути
- Девайс (деплой-артефакт): `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd`
- Архив: `~/Brain/Fadercraft/raw/archive/` (`Control XL.YYYY-MM-DD[-HHMMSS].amxd`)
- `.syx` кастом-моды (канон): `~/Projects/Claude/Fadercraft/custom-modes/1.syx … 15.syx`
- Wiki: `~/Brain/Fadercraft/wiki/` → concepts/`Mode Encoding.md`, `Custom Mode SysEx Layout.md`; entities/`CC47 Cross-Mode Transit.md`; + `Instruments Layer`, `Mixer Layer`.

## Карта режимов
- **Instruments** 1–10: переключаются overlay listen CC; CC30/ch7 для выбора слота = `6,7,8,9,18,19,20,21,22,23` (дыра 10–17 зарезервирована под mixer).
- **Mixer** 11–14: CC30/ch7 = `24,25,26,27`. Формула `mode = 23 + bank + 2·((page+hold)%2)`.
- **Слот 15** (QUE/prelisten volume, спец-мод): CC30/ch7 = **28**.
- В `.syx` кастом-мода значение-метка эмитится на **CC47** (Listen CC у этого пользователя = 47, не дефолтный 49). Дескриптор контрола: id `0x3a`, байт значения = `mode×10`.

## CC47 Cross-Mode Transit (секция патча)
Одной кнопкой «отбить» в микшер с инструмента и вернуться обратно с памятью.
- Вход — `ctlin 47` → `cc47_sel` (`sel 10 20 30 40 50 60 70 80 90 100 127`).
- Значение `10·N` (N=1..10): запоминает `v instruments_mode = N` (через `cc47_m1..m10`) + банкает `cc47_last_mixer_cc30` (`int 24`, хранит последний mixer CC30 24..27) → `cc47_return_ctlout` (`ctlout 30 7`) → прыжок в микшер.
- Значение `127`: `cc47_v_read` (v instruments_mode) → `cc47_return_sel` → `cc47_rm1..rm10` (CC30 6,7,8,9,18..23) → `ctlout 30 7` → возврат на инструмент.
- На CC47 также висит momentary bank микшера (значения `1`/`2`) — не пересекается с `10·N`/`127`.

Ключевые объекты (id): `mix_obj-ctlin47`, `cc47_sel`, `cc47_v_write`/`cc47_v_read` (`v instruments_mode`), `cc47_return_sel`, `cc47_last_mixer_cc30` (`int 24`), `cc47_return_ctlout` (`ctlout 30 7`, единственный с ch7 — рядом есть просто `ctlout 30`, не путать). Overlay-роутер инструментов слушает отдельно (`inst_ctlin`, loadmess Listen CC).

## Фичи устройства (статус)
Подробности — в wiki проекта; здесь только карта со статусом.
| Фича | Статус | Где |
|---|---|---|
| Mixer / Instruments / CC47-транзит / passthrough / Solo Follower | ✅ работает | wiki entities + `xl-performance.md` выше |
| **Version Check** (node.script → `/api/version.json` → кнопка «Update ready») | ⚠️ скрипт на диске рядом с девайсом, **не вшит во freeze** | wiki `[[Version Check (Update Notifier)]]`; скрипт: `Max Devices/version_check.js` (канон `~/Brain/Fadercraft/raw/version_check.js`), манифест `app/public/api/version.json` |
| **Browser Load** (CC51 → грузит выделенный browser item) | ⛔ **ОТЛОЖЕНО / откачено 2026-06-06 (14)** — НЕТ `browser` в M4L LiveAPI; делать в Python remote-script, не в M4L | wiki `[[Browser Load]]` (помечен отложенным); [[reference_m4l_no_browser_api]] |

Релизная связка version-check: бампать `DEVICE_VERSION` (в `version_check.js`) и `latest` (в `version.json`) синхронно; «Update ready» зажигается, когда latest > DEVICE_VERSION.

## Раскладка patcher-вида (канон после 2026-06-06, переразложен второй раз)
Patcher = 10 функц. полос-модулей, уложенных вертикально. **Двойная сетка:** внутри модуля шаг 10×10 (X кратен 10 с учётом ширины бокса + gap 30, ряды слоёв шаг 60 по Y), между модулями шаг 100×100 (каждая полоса стартует на 100-grid линии по Y, зазор ≥100). Раскладка построена движком минимизации пересечений проводов (Sugiyama: топ. слои источник→приёмник + port-aware barycenter + simulated-annealing перестановка узлов внутри слоёв). Скрипты движка лежали в `/private/tmp/cxl_*.py` (эфемерны; рецепт — здесь).

**Порядок секций изменён** (оптимизирован под мин. суммарной длины меж-секционных проводов: MIXER — хаб, его тяжёлые партнёры рядом). Сверху вниз:
1. PASSTHROUGH (`pass_lbl`) · 2. INSTRUMENTS (`lbl_instruments`) · 3. MODE STATE TAPS (`inst_mode_tap_comment`) · 4. STARTUP (`init_mode11_lbl`) · 5. MIXER (`lbl_mixer`) · 6. CC47 TRANSIT (`cc47_lbl`) · 7. MIXER MOMENTARY (`lbl_mix_momentary`) · 8. PRELISTEN (`lbl_prelisten`) · 9. SOLO FOLLOWER (`lbl_solo`) · 10. VERSION (`lbl_version`).
Y-полосы (top): PASS 100, INST 500, MODE_TAP 1800, STARTUP 2100, MIXER 2400, CC47 3300, MOMENTARY 3700, PRELISTEN 4100, SOLO 4400, VERSION 4700. X от 200.

Классификатор секции по id (без изменений): `mix_obj-*`→MIXER, кроме momentary-подмножества `*restore*/*opposite*/tii-4*/read-47/read-48/ctlin47/sel47/ctlin48/sel48/cc47-label/cc48-label`→MIXER MOMENTARY (+`mix_new_ctlin48_bank`→MIXER); `sf_*`→SOLO; `inst_mode*`/`mix_mode*`→MODE TAP; `inst_*`→INSTRUMENTS; `cc47*`/`m15*`→CC47; `init_mode11*`+`mode_all_off_msg`→STARTUP; `pass_*`→PASSTHROUGH; `version*`/`vdot*`/`vlink*`/`hdr_*`/`mixer_hdr*`→VERSION; `pre_*`→PRELISTEN.
Правило: правка раскладки = ТОЛЬКО `patching_rect` (x/y; W/H не трогать). НИКОГДА не трогать `presentation_rect`/`presentation` 16 UI-боксов (это Live-вид). 270 боксов, JSON ~153КБ < L0=201786 → Путь A с паддингом, большой запас.
**Грабли пересечений:** fan-out от `sel` (напр. `inst_sel_route`→16×`inst_rm*`) даёт 0 пересечений ТОЛЬКО если приёмники в ряду упорядочены по индексу outlet источника — обычный (не port-aware) barycenter их рандомит и плодит кресты. INSTRUMENTS (64-узловой связный граф с обратными связями) и MIXER — главные источники остаточных пересечений, полностью развести straight-line шнурами нельзя.

## Раскладка patcher-вида (КАНОН с 2026-06-06 (3) — КЛАСТЕРЫ, не оси)
Подход «длинные вертикальные оси-полосы» ОТМЕНЁН. Новый принцип — **компактные кластеры-плитки** на 2D-сетке:
- Каждая функция = компактный КЛАСТЕР (маленький блок), внутри — слоевая раскладка (longest-path layering сверху→вниз, шаг ряда 60, gap по X 30, pad 20; баннер-комментарий стопкой над контентом).
- 10 кластеров раскладываются плитками: greedy-цепочка по весу межкластерных связей (старт = хаб MIXER), shelf-packing с зазором ≥60 между плитками, **origin'ы снаппятся на 100-grid**. Сильно связанные кластеры — рядом.
- Внутри кластера: port-aware barycenter (учёт индекса outlet/inlet) + simulated-annealing перестановка узлов в слоях → мин. intra-крестов.
- Скрипты движка эфемерны (`/private/tmp/cxl_*.py`): `cxl_layout2.py` (внутрикластерный layout+SA, seed 101), `cxl_place.py` (плиточная разместка+подсчёт), `cxl_fix_labels.py` (развести баннеры), `cxl_build.py` (Путь A), `cxl_validate.py`, `cxl_cross.py` (счётчик крестов: bottom-of-source→top-of-dest порт-сегменты, O(E²)).

**Кластеры (10) и их веса связей:** хаб = MIXER (85 боксов, 117 intra); связан с CC47(12 межкласт.), STARTUP(6), MOMENTARY(5), PRELISTEN(5), MODETAP(4). INSTRUMENTS (73, 119 intra) почти изолирован (MODETAP×2, STARTUP×1). CC47 (34, 70 intra) тяжело связан с MIXER. Изоляты: PASSTHROUGH(17), VERSION(12), SOLO(7). Прочие: MODETAP(15), MOMENTARY(16), STARTUP(5), PRELISTEN(3).
**Порядок плиток (greedy):** MIXER, CC47, STARTUP, MOMENTARY, PRELISTEN, MODETAP, INSTRUMENTS, SOLO, PASSTHROUGH, VERSION.
**Origin'ы (snapped 100):** MIXER(200,100) CC47(1400,100) STARTUP(2500,100) MOMENTARY(3000,100) PRELISTEN(200,1100) MODETAP(400,1100) INSTRUMENTS(1000,1100) SOLO(2100,1100) PASSTHROUGH(200,2500) VERSION(1300,2500).
**Пересечения: 2742 (чистый baseline) → 1215 (−56%)**, лучше прошлой осевой (1661). Наложений боксов 0. Intra-кресты: INSTRUMENTS 351, MIXER 176, CC47 122, остальные ≤6. INSTRUMENTS (связный граф с обратными связями) и MIXER — главные остаточные кресты, straight-line развести нельзя.
**Классификатор секции по id** (без изменений с прошлой версии) — см. `cxl_*.py` функцию `classify()`: `mix_obj-*`→MIXER кроме momentary-подмножества→MOMENTARY; `sf_*`/`lbl_solo`→SOLO; `inst_mode*`/`mix_mode*`→MODETAP; `inst_*`/`lbl_instruments`→INSTRUMENTS; `cc47*`/`m15*`→CC47; `init_mode11*`+`mode_all_off_msg`→STARTUP; `pass_*`→PASSTHROUGH; `version*`/`vdot*`/`vlink*`/`hdr_*`/`mixer_hdr*`→VERSION; `pre_*`→PRELISTEN; `lbl_mixer`→MIXER. 0 unclassified.
Правило неизменно: правка раскладки = ТОЛЬКО `patching_rect` x/y. W/H, presentation (16 UI-боксов), lines/семантика — байт-в-байт. 267 боксов, 408 связей, Путь A (L0=201786, компактный JSON 152КБ + паддинг 49702).

## Бандл-раскладка (КАНОН с 2026-06-06 (6)) — ЕДИНЫЙ эталон во всех 4 слотах
Подход «свой билд в каждом слоте» (Demo/Starter main отдельно, Router-слоты отдельным старым билдом) **ОТМЕНЁН**. Новое требование: во ВСЕХ ЧЕТЫРЁХ бандл-файлах лежит ОДИН И ТОТ ЖЕ amxd = эталон (= проектный canon). Router-слоты больше НЕ несут старый билд.
- **Эталон = проектный canon** `~/Projects/Claude/Fadercraft/device/Control XL.amxd` после правки «Bank fx»→«Bank». md5 **`44aa142b…`**, 211548 B, лейбл «Bank».
- 4 слота (все = байт-в-байт эталон, имена файлов НЕ менять — на них ссылаются .als):
  1. `dist/Control XL Demo Project/Max Devices/Control XL.amxd` (main, `.als`→Control XL.amxd)
  2. `dist/Control XL Demo Project/XL_Performance.amxd` (Router, `Router.als`→XL_Performance.amxd)
  3. `dist/Control XL Starter Project/Max Devices/Control XL.amxd`
  4. `dist/Control XL Starter Project/XL_Performance.amxd`
- **Лейбл «Bank fx»→«Bank»:** 5 строковых вхождений в 2 боксах: `mix_obj-page-label`.text (1) + `mix_obj-ui-page` saved_attribute_attributes longname/shortname (2) + блок `mix_obj-ui-page` в pattr/param-массиве хвоста JSON (2, @~148072). Замена через рекурсивный walk строк obj. Путь A (sub 15 байт → паддинг до L0). Это контентная правка, 2 changed boxes, lines/presentation/suffix байт-в-байт.
- Старая инфа ниже (Router как отдельный 265/418 граф, Demo как 277/435) — ИСТОРИЯ; в дистрибутиве этих графов больше нет, везде эталон 267/408.

## Бандл-девайсы (встроенные в Demo/Starter) — отношение к canon (ИСТОРИЯ до 2026-06-06 (6))
- **STARTER**: `dist/Control XL Starter Project/Max Devices/Control XL.amxd`. Граф ИДЕНТИЧЕН canon (267 box / 408 line, тот же id-set, lines равны). Единственное логич. отличие — лейбл **«Bank»** вместо canon-овского «Bank fx» (2 бокса: `mix_obj-page-label`.text + `mix_obj-ui-page` parameter_longname/shortname). Т.е. Starter = canon + уже сделанный «Bank fx→Bank». При раскладке коорд. копируются по id из canon, лейбл «Bank» НЕ трогать. `.als` ссылается только на `Control XL.amxd` (Max Devices). `20XL` в `.als` — это `%20XL` из url-энкода `Max%20Devices:Control%20XL.amxd`, НЕ файл `20XL.amxd`. Root-level `XL_Performance.amxd` (150220 B) в Starter — неиспользуемый огрызок, не ссылается из `.als`, НЕ трогать.
- **DEMO**: `raw/Demo-set Project/Max Devices/XL_Performance.amxd` (frozen, 218417 B, L0=211288). Граф ОТЛИЧАЕТСЯ от canon: это СТАРЫЙ билд до 2026-06-02 чистки. 277 box / 435 line: содержит 14 debug-`print` (`inst_p_*`, `cc47_print_*`, `init_mode11_print`) + `vdot_loadtrig` (`loadmess check`), и НЕ содержит 5 m15-объектов (`m15_ctlin/sel/save/v/ret`). version_check НЕ вшит (фича младше билда). Имя файла НЕ менять (`.als`→`XL_Performance.amxd`). К Demo раскладку применять движком по ФАКТИЧЕСКОМУ графу, не копировать коорд. canon.

## Бандл Router-девайс (`XL_Performance.amxd`, root каждого dist-проекта, 150220 B) — отдельный граф
На него ссылается `Router.als` в обоих бандлах (Demo+Starter). **Это ТОТ ЖЕ перформ-патч XL_Performance, но СТАРЫЙ билд** (до 2026-06-02 чистки) и **НЕЗАМОРОЖЕННЫЙ** контейнер.
- **Контейнер иной, чем canon:** НЕТ обёртки `mx@c`, НЕТ `dlst`. JSON-патчер лежит прямо в `ptch`-payload **@0x20** (не @0x30), конец JSON ловится балансом скобок, хвост = `\n\x00` (2 байта). `solo_follower.js` — только ссылкой в JSON-боксе `sf_js` (не вшит, на диске рядом). `device['rect']` = `[0,105,1600,1400]`.
- **Граф 265 box / 418 line** — третий, отдельный от canon (267/408) и от Demo-set frozen (277/435). vs canon: НЕТ `m15_*`(5), version-check (`version_node/version_link/vlink_*/hdr_*/vdot_sel`), `pre_*`(3); ЕСТЬ лишние 14 debug-`print` (`inst_p_*`, `cc47_print_*`, `init_mode11_print`) + комментарий `device_version_lbl`. 9 кластеров (без PRELISTEN). `device_version_lbl` классифицируется в VERSION.
- Раскладка — движком по ФАКТИЧЕСКОМУ графу (не копия canon). Путь A: парсер контейнера в `cxl_engine.py` авто-детектит `mx@c`@0x20 (canon) vs `{`@0x20 (router).
- Demo Router и Starter Router байт-в-байт ИДЕНТИЧНЫ (до и после правки) → раскладка одна, результат копируется.

## Browser Load (CC51) — ⛔ ОТЛОЖЕНО / ИСТОРИЯ (свёрнуто 2026-06-06 (14))
**Фича удалена из всех слотов, откат выполнил пользователь сам. Все `bl_*` / `deferlow bl_defer` / `bl_ui_btn` / browser-js — НЕТ в актуальном девайсе (`44aa142b`).** Причина: Live Browser НЕ в M4L LiveAPI ([[reference_m4l_no_browser_api]]) — грузить выделенный браузер-item из `.amxd` невозможно; возврат только в Python remote-script. Текст ниже — историческое описание попыток в M4L, НЕ актуальное состояние.

### (история) секция патча (добавлено 2026-06-06 (7); канал-фикс (10))
Одной кнопкой LCXL грузить выделенный в левой библиотеке браузера item на текущую дорожку и шагнуть на следующую сцену.
- **MIDI:** CC51, **любой канал**. `bl_ctlin` = `ctlin 51` (один аргумент, 2 outlet: value, channel; used outlet0=value).
  - ⚠️ **ФИКС 2026-06-06 (10):** было `ctlin 51 15` (фильтр ch15) — фича МОЛЧАЛА. Причина: в кастом-модах CC51 (control ID `0x3e`) не назначен на канал 15 (per-control флаг-байт `X1` дескриптора `.syx` нигде = ch15), а ВСЕ соседние `ctlin` девайса (`ctlin 20/28/47/48/49` + 2 «голых») слушают любой канал. Снят фильтр → конвенция девайса соблюдена, неопределённость канала снята. Значение кнопки 127 (descriptor max `0x7f`) — НЕ было причиной; `sel 127` + JS `msg_int(v){if(v)…}` корректны.
- `bl_ctlin` → `bl_sel` (`sel 127`, реагируем только на нажатие=127, release=0 игнор) → `bl_js` (`js browser_load.js`).
- **JS (`browser_load.js`):** bang/non-zero → `deferlow`-через-Task → (1) обход дерева `live_app browser` по категориям, спуск ТОЛЬКО в ветки `is_selected` (selection уникальна → дешёвый прунинг, лимит глубины 12) → находит глубочайший `is_selected && is_loadable` → `browser.call("load_item","id",item.id)`; (2) `advanceScene()` — `live_set view selected_scene_index +1` (clamp на последней сцене), settable, детерминирован (key-down НЕ эмулируем); (3) `focusBrowser()` — `live_app view call focus_view Browser`. Cleanup в `freebang`.
- **Источник сэмпла = вариант A** (юзер реально сам выбирает в левой библиотеке, грузим текущий выделенный). Если в большом сете тормозит обход — вернуться к этому отдельно.
- **Объекты (id):** `bl_lbl` (comment), `bl_ctlin` (`ctlin 51` после фикса), `bl_sel` (`sel 127`), `bl_js` (`js browser_load.js`). Раскладка-плитка @ x200 y2900 (вне основного графа кластеров).
- **⚠️ НЕ ВШИТО ВО FREEZE.** `browser_load.js` лежит на диске рядом с девайсом (`device/browser_load.js`) + канон `~/Brain/Fadercraft/raw/browser_load.js`, но НЕ записан в `dlst`. Для рассылки — отдельный ship-шаг (freeze), иначе у покупателя `js: can't find file browser_load.js`. Незакрытый шаг, как version-check.
- **Классификатор раскладки:** при следующем переразложении кластеров добавить case `bl_*`→новый кластер BROWSERLOAD (или к PASSTHROUGH/MIXER по весу связей; сейчас изолят, 0 межкластерных).

## Грабли: фильтр канала в ctlin (конвенция девайса)
**Все `ctlin` в Control XL — одно-аргументные (`ctlin N`, слушают ЛЮБОЙ канал):** `ctlin 20/28/47/48/49` + два «голых» `ctlin` (inst/pass). Не ставить второй арг-канал у новых веток — рассинхрон с конвенцией = ветка молчит (так Browser Load молчал на `ctlin 51 15`). Канал-конвенция девайса: игнорировать канал, фильтровать только по CC.

## `.syx` дескриптор: где канал контрола (разобрано 2026-06-06)
Дескриптор = `49 ID 02 X1 X2 MIDX X3 X4 CC VAL 00` (11 байт; маркер `0x49`, +2=`0x02`, +10=`0x00`). `VAL` (+9) = max value (`0x7f`) ИЛИ статик-значение у спец-контролов. Listen-контрол: id `0x3a`, CC=`0x2f`(47), `VAL`=`mode×10` (НЕ `0x7f`) — поэтому скан с фильтром `VAL==0x7f` его пропускает.
- **CC51-кнопка = control ID `0x3e`** (присутствует во всех 15 модах).
- **Канал per-control в байте `X1`** (offset +3), смешан с типом/цветом/поведением; в этой конфигурации НЕ равен 15 ни для одного мода → отсюда фикс Browser Load. Точный декод X1→канал НЕ выведен начисто (гипотеза lo-nibble даёт нелепую раскладку); канал custom-mode'а лучше не реверсить, а делать `ctlin` channel-agnostic.
- CC-номера контролов кнопочного ряда: CC48..52 = id `0x3b`..`0x3f`. Энкодеры рядами: ряд1 CC13–20, ряд2 CC21–28, ряд3 CC29–36. Фейдеры CC5–12. («27/28» юзера = CC27 энкодер ряд2 / CC28 фейдер, не канал.)

## Текущее состояние (один актуальный срез — перезаписывать, не копить историю)
Журнал версий НЕ ведём при итеративной отладке (правило [[feedback-iterative-no-versionlog]]); ниже — текущее состояние, ниже него только устойчивые факты («ремесло»: грабли формата, mode-кнопки и т.п.).
- **2026-06-08: ОТКАТ hardware-feedback фичи — ВСЕ 6 слотов снова `44aa142b` (чистая версия, 211548 B).** Пользователь решил отложить фичу на следующую версию. User Library (слот 2) восстановлен из чистого бэкапа `Control XL.2026-06-08-154534.amxd` (`44aa142b`). md5 до отката был `4f74edca` (поверх пропатченной `1490ffc3` была ещё правка). Слоты 1, 3–6 не трогались — уже `44aa142b`. Инвариант байт-в-байт между всеми слотами ВОССТАНОВЛЕН.
  - **Сегодняшние WIP-бэкапы в `~/Brain/Fadercraft/raw/archive/` — НЕ удалять, материал для следующей версии:** `Control XL.2026-06-08-154534.amxd` (`44aa142b`, чистый исходник ДО правок), `…-160053.amxd` (`73409df1`, итерация автодетекта v1), `…-161926.amxd` (`7ec0fa62`, автодетект v2 + начало UI-селектора).
- **⚠️ KNOWN BUG (отложено в следующую версию): hardware feedback dies when an audio device sits after Control XL in the chain.** См. блок «Hardware feedback known bug» в устойчивых фактах ниже — там симптом, root cause, проваленные попытки фикса и направление на следующую версию.
- **Browser Load — ⛔ ОТЛОЖЕН (не делать в M4L).** Корень: `browser` нет в M4L LiveAPI ([[reference_m4l_no_browser_api]]) — ошибки `jsliveapi: component 'browser' is not an object` / `browser api id = 0` НЕ лечатся defer/deferlow/путями/кешем; это фундаментальное ограничение surface, а не баг проводки. Возврат к фиче — только Python remote-script ([[reference_lcxl3_remote_script]]). История отладочных попыток (threading-фикс `bl_defer`/`deferlow`, пересборка Путём B/A, инцидент порчи `095885b6`, канал-фикс `ctlin 51 15`→`ctlin 51`, UI-кнопка `bl_ui_btn`, версии `0fc224e4`/`63d95bbe`) — в `~/Brain/Fadercraft/raw/archive/` 2026-06-06; в актуальном девайсе этих объектов НЕТ.

## Устойчивые факты (ремесло — не итеративная история)

### Hardware feedback known bug — DEFERRED to next version (2026-06-08)
WIP groundwork lives in archive backups `Control XL.2026-06-08-{154534,160053,161926}.amxd`. Don't restart from scratch next version — start from these.
- **Symptom:** Control XL (MIDI Effect) outgoing hardware feedback (LED / custom-mode select via CC30 ch7) stops reaching the LCXL when an audio device sits directly after it in the track chain (no instrument bridge). Input (hardware→plugin) keeps working; only output (plugin→hardware) dies — mode switches on-screen only.
- **Root cause established:** the unnamed `ctlout` injects feedback into the track's downstream MIDI chain; a downstream audio device terminates that MIDI branch, so feedback never reaches the hardware port.
- **Attempted fix (rolled back):** route feedback to an explicit `midiout` bound to the hardware port. Two approaches tried & abandoned this session:
  - (a) port-name autodetect by regexp — fragile + the multi-stage `zl.reg` gate chain silently failed (`print` never fired);
  - (b) UI port-selector dropdown (`umenu`→`pattr` by name→`midiout`, auto-default to LCXL3+MIDI, not DAW/DIN) — built but session ended before it was verified on hardware.
- **Real CoreMIDI destination on this machine:** correct feedback port = `LCXL3 1 MIDI In` (paired with input source `LCXL3 1 MIDI Out`); NOT the DAW or DIN ports. (Full port table below.)
- **Next-version direction:** revisit the port-selector approach — it's the robust "works for everyone" path. Verify `midiout` actually reaches hardware, and confirm CC30 ch7 select truly switches the physical custom mode. The `umenu`+`pattr`-by-name ремесло is captured below ("umenu как селектор порта").
- **Current shipped workaround (told to user):** Control XL must be the only / last relevant device on its track — nothing after it in the chain (especially no audio device), or hardware feedback breaks.

### LCXL3 порты + детект порта в Max (ремесло)
- **CoreMIDI-порты машины пользователя.** Выходные (host→железо, destinations): `[0] LCXL3 1 MIDI In` ← НУЖНЫЙ для custom-mode фидбэка, `[1] LCXL3 1 DAW In`, `[2] LCXL3 1 To DIN Out`, `[3] LCXL3 1 To DIN Out 2`, `[4] Zenith 2`. Входные (железо→host, sources): `[0] LCXL3 1 MIDI Out`, `[1] LCXL3 1 DAW Out`, `[2] Zenith 2`. Вход плагина работает с `LCXL3 1 MIDI Out` → парный фидбэк-выход = `LCXL3 1 MIDI In`.
- **`regexp LCXL3` НЕ годится для выбора порта** — совпадает с 4 портами сразу. Однозначно custom-mode: подстроки `LCXL3` И `MIDI` И НЕ `DAW` И НЕ `DIN`. Имя целиком НЕ хардкодить (суффикс/номер порта плавает).
- **`midiinfo`** bang в left inlet → по сообщению `append <index> <name атомы…>` на КАЖДЫЙ выходной порт. `route append` снимает префикс. `zl.slice 1` отделяет индекс (left) от имени (right idx1).
- **`tosymbol`**: дефолтный сепаратор = ПРОБЕЛ → склеивает список атомов в ОДИН символ С пробелами (`LCXL3 1 MIDI In`). НЕ слать сообщение `separator` без аргумента — оно вырежет все пробелы (`LCXL31MIDIIn`). Многоатомное имя в `prepend port`/`midiout` обязано идти как один символ, иначе `port` ломается.
- **`regexp` outlets:** idx0 substitute, idx1 capture-groups, idx2 matched-portion (фаерит на match, отдаёт только совпавший кусок — годен как bang-триггер), idx3 passthrough оригинала (фаерит ТОЛЬКО на no-match). NOT-тест = брать idx3. Positive-тест с сохранением полного имени = `zl.reg` (store) + idx2-bang на release. Lookahead `(?=…)`/`(?!…)` в Max regexp НЕ подтверждён — не закладываться, строить AND явными объектами.
- **`midiformat`** control-change: список = `CC#, value` (CC первым) в **inlet 2** (3-й); channel — в **rightmost inlet (idx6)**, НЕ в списке.

### umenu как селектор порта + persist по имени (ремесло)
- **`umenu` outlets:** left(0)=индекс выбранного, **middle(1)=ТЕКСТ выбранного пункта** (символ; для имени порта — годен прямо в `prepend port`), right(2)=status. Брать имя порта = middle outlet.
- **`umenu @pattrmode 1`** → связанный `pattr` хранит/восстанавливает состояние по СИМВОЛУ (имени), не по индексу. Это и есть «persist по имени, устойчиво к смене порядка портов между машинами». Без pattrmode pattr хранит индекс.
- **`umenu` сообщения:** `clear` — очистить все пункты; `append <symbol>` — добавить пункт последним; `symbol <name>` — выбрать пункт по метке И отдать индекс+текст из outlet'ов (в отличие от `set <name>` — тот ставит без вывода). Многоатомное имя обязано идти как ОДИН символ (`tosymbol`), иначе `append`/`symbol` разобьёт на несколько пунктов.
- **Наполнение живым списком выходных MIDI-портов:** `midiinfo` bang → `append <idx> <name…>` на каждый destination → `route append` → `zl.slice 1` (right=name) → `tosymbol` (один символ) → `prepend append` → umenu. Перед наполнением слать `clear`.
- **`pattr … @bindto <varname>`:** двусторонняя синхронизация с именованным объектом; bang в pattr → выдаёт хранимое значение из LEFT outlet (используй для отложенного восстановления ПОСЛЕ наполнения меню — иначе early autorestore ставит символ в ещё пустой umenu и теряется). `pattr` без сохранённого значения на bang НЕ выдаёт ничего → удобно как «первый запуск» (тогда применять автодефолт).
- **Порядок restore→default:** наполнить меню → bang pattr (восстановить сохранённый порт) → если pattr выдал непустое, ЗАКРЫТЬ `gate`, через который идёт автодефолт-best-match; если пусто — gate открыт, применяется best-match (`symbol <bestname>`). `t b b` фаерит R→L: restore первым, default-apply вторым.
- **presentation-панель растёт через `patcher.openrect` height** (`[0,0,W,H]`); добавление UI-бокса с `presentation:1` ниже текущего низа + увеличение H панели. UI-боксы — `presentation:1`+`presentation_rect`; НЕ путать с `patching_rect`.


### mode-кнопки 11–14 закрыты для маппинга
Кнопки 11–14 микшера = `live.text` id `mix_obj-mode11-btn`..`mode14-btn`, varname `mode_11`..`mode_14`, longname «Mode 11..14». «Кабельные»: outlet0 → `mix_obj-modeN-sel`; inlet0 от `mix_obj-m24..m27-on/off` + `mode_all_off_msg`.
- Баг: «Visible for mapping = off» в инспекторе не убирало из маппинга. Причина: у этих объектов в `saved_attribute_attributes.valueof` **отсутствовал** `parameter_invisible` (дефолт 0 = Automated&Stored = виден). На frozen-девайсе инспектор правку в файл не пишет → при reload откат к дефолту.
- Фикс: добавлен `parameter_invisible: 2` (Hidden) всем 4 (Путь A, длина JSON сохранена, pad). `parameter_enable` оставлен `1` — outlet/inlet/значение работают, Hidden режет только пользовательский маппинг/automation/Live param list. Шнуры и прочие боксы не тронуты.
- Значения `parameter_invisible`: 0 = Automated&Stored (виден для маппинга), 1 = Stored Only, 2 = Hidden (вне маппинга). В девайсе до этого ни у кого не был выставлен.
- Архив: `Archive/XL_Performance.2026-06-02.amxd` (208608 B).

### 2026-06-02 — вычищены все debug-принты
- Удалены все 14 `print`-объектов из патча (+ 32 входящих шнура): `inst_p_*` (selected_in/non_return/ignored_zero/enter_route/back_hit/route_mode/overlay_mode_cc30/out_pair), `cc47_print_*` (save/return/enter/track/raw), `init_mode11_print`. Все терминальные (нет выходов) → удаление не рвёт цепочки. Length-preserving (Путь A), `solo_follower`/`dlst`/suffix целы.
- `version_check.js` `maxApi.post` (`version check: … -> dot 0`) **оставлен по просьбе** — полезный, раз в 30 мин, не спамит. `solo_follower.js` в консоль не пишет вообще. Итог: ушёл весь per-event спам Max-принтов, осталась одна осмысленная строка version-check на проверку.
### 2026-06-02 — round-trip для кастом-мода 15
Баг: с мода 15 «back to mixer» → «back to previous» возвращал в мод 3. Причина: `15.syx` кнопка перехода (CC47, ctrl `0x3a`) слала значение `30` (= мод 3), унаследованное от шаблона мода 3; а `15×10=150 > 127` (MIDI), и в транзите не было слота под 15.

Фикс:
1. **15.syx**: байт значения ctrl `0x3a` (file offset `0x23E`) `0x1e → 0x6e` → теперь эмитит **CC47 = 110** (уникальная метка мода 15; кратно 10, не ловится overlay-роутером 10..100). Бэкап: `custom-modes/15.syx.backup-*`.
2. **Control XL.amxd**: добавлена ветка для 110:
   - новые объекты: `m15_ctlin` (`ctlin 47`) → `m15_sel` (`sel 110`); match → `m15_save` (msg `15`) → `m15_v` (`v instruments_mode`) [запоминает origin=15]; match → `cc47_last_mixer_cc30` левый вход [прыжок в микшер];
   - `cc47_return_sel`: `sel 1 2 3 4 5 6 7 8 9 10` → `sel 1 2 3 4 5 6 7 8 9 10 15` (numinlets/outlets 11→12); новый выход 10 (match «15») → `m15_ret` (msg `28`) → `cc47_return_ctlout` (`ctlout 30 7`) [CC30=28 → слот 15].
   - Архив до правки: `Archive/XL_Performance.2026-06-02-154032.amxd` (218415 B). После пересборки файл ~169 КБ (компактный JSON, данные те же).

Распределение (free funnel / bundle / published `app/public/free-custom-modes/15.syx` + zip) НЕ трогалось — это деплой-шаг, делать отдельно по явному «ship» (см. правило no-auto-deploy в основной памяти).

**Грабли той же правки (исправлено в тот же день):** первая пересборка шла без сохранения длины JSON (ΔL=−49520) и не патчила `dlst` → встроенный `solo_follower.js` уехал, Max выдал `js: malformed UTF-8 at offset 0` и `no function msg_int/bang [solo_follower.js]`, а после раз-/заморозки потерял скрипт. Лечение: пересборка Путём A (длина JSON сохранена паддингом) из чистого архива — `solo_follower.js`/`dlst`/хвост байт-в-байт целы. Девайс — **frozen** (зависимости внутри); пользователю не нужно freeze/unfreeze. Деталь формата — см. [amxd-format.md](amxd-format.md) «КРИТИЧНО: dlst».

### 2026-06-02 — version-check восстановлен + стартовая гонка убрана
- Потерянный `version_check.js` (Node for Max, фича собрана 2026-06-01) восстановлен из `raw/`, положен рядом с девайсом (`Max Devices/version_check.js`). Работает с диска (в freeze пока НЕ вшит — нужно для рассылки). Деталь: wiki `[[Version Check (Update Notifier)]]`.
- Убран `vdot_loadtrig` (`loadmess check`) + его шнур к `version_node`: стрелял `check` до подъёма Node → `node.script not ready can't handle message check`. Скрипт сам триггерит `check()` при старте Node + каждые 30 мин, патчевый loadmess был избыточен. Пересборка length-preserving (Путь A) из текущего файла; `solo_follower.js`/`dlst`/suffix целы.
- Пред-существующая (не моя) `node.script can't find version_check.js` была следствием именно отсутствия файла на диске — закрыта восстановлением скрипта.
