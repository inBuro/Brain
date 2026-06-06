# XL_Performance — факты по флагману

M4L-роутер для Novation Launch Control XL MK3. Переключает кастом-моды LCXL и роутит CC под Ableton-перформанс.

## Рабочий процесс (с 2026-06-06) — КАНОН РЕДАКТИРУЕТСЯ В РЕПО, НЕ В USER LIBRARY
- **Канонический редактируемый `.amxd`:** `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd`. ВСЕ правки — здесь.
- **User Library** (`~/Music/Ableton/User Library/Max Devices/Control XL.amxd`) = деплой-артефакт / чистый оригинал. **НЕ редактировать напрямую.** Деплой репо→User Library — только по явной команде «деплой/ship».
- Чистый оригинал (байт-в-байт до любых правок, 211548 B, md5 `90de7585…`): `~/Brain/Fadercraft/raw/archive/Control XL.2026-06-06.amxd`. Из него восстанавливать User Library и пересобирать Путём A.
- Пользователь смотрит новую раскладку, открывая ПРОЕКТНЫЙ файл в Max-редакторе напрямую.

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

## Журнал правок
### 2026-06-06 (6) — СМЕНА КУРСА: единый эталон во все 4 бандл-слота + «Bank fx»→«Bank»
- Требование пользователя: один и тот же amxd во всех четырёх бандл-файлах; Router-слоты (старый билд `0c8119ed`) ЗАМЕНЕНЫ каноном, не причёсываются.
- **Эталон:** взят проектный canon `0dcc07d7` (211548 B), заменено «Bank fx»→«Bank» (5 строк, 2 бокса) Путём A. Валидация: filesize/JSON-span/prefix/suffix==, 267 box / 408 line, id-set==, lines identical, РОВНО 2 changed boxes (`mix_obj-ui-page`,`mix_obj-page-label`), presentation 16==, 0 dangling, ptch инвариант, dlst+solo_follower.js+version_check.js целы. Лейбл = «Bank» (text+longname+shortname). Новый md5 эталона **`44aa142b198b6001613db3b29c36cc38`**. Архив canon до правки: `raw/archive/Canon-Control XL.2026-06-06-100433.amxd` (`0dcc07d7`).
- **4 слота** заархивированы (TS 100558) и перезаписаны эталоном байт-в-байт. Все 4 md5 == `44aa142b`. Архивы старых версий:
  - `raw/archive/DemoMain-Control XL.2026-06-06-100558.amxd` (`91c25bea`)
  - `raw/archive/DemoRouter-XL_Performance.2026-06-06-100558.amxd` (`0c8119ed`, старый билд)
  - `raw/archive/StarterMain-Control XL.2026-06-06-100558.amxd` (`91c25bea`)
  - `raw/archive/StarterRouter-XL_Performance.2026-06-06-100558.amxd` (`0c8119ed`, старый билд)
- Zip-бандлы НЕ пересобирались, в User Library НЕ деплоилось (по заданию; User Library пока «Bank fx»-версия `90de7585` — отдельный вопрос).

### 2026-06-06 (5) — кластерная раскладка для dist-бандлов: DEMO main + оба Router
- Движок `cxl_engine.py` реконструирован заново (эфемерен) в `/tmp/`, добавлен авто-детект контейнера (canon `mx@c`@0x20 / router `{`@0x20, balanced-end).
- **DEMO main** (`dist/Control XL Demo Project/Max Devices/Control XL.amxd`, 211533 B): граф идентичен canon (267/408, id-set==, lines==, лейбл «Bank» уже стоял) → patching_rect всех 267 скопированы по id из canon. Результат md5 `91c25bea…` = **байт-в-байт совпал со Starter main** (как и ожидалось). Валидация: filesize/JSON-span/prefix/suffix==, 0 не-гео диффов, 0 W/H, lines==, 16 presentation==, 0 dangling, ptch инвариант. Архив: `raw/archive/Demo-Control XL.2026-06-06-095550.amxd`.
- **DEMO Router** (`dist/Control XL Demo Project/XL_Performance.amxd`, 150220 B): движок по факт. графу 265/418, seed 7. Кресты **3840→1468 (−62%)**, 0 наложений, pad 195. Все 265 moved (x/y only), 0 не-гео, 0 W/H, lines==, suffix(`\n\x00`)==, 16 presentation==, 0 dangling, `solo_follower.js` ссылки целы, ptch инвариант, filesize сохранён. Новый md5 `0c8119ed…`. Архив: `raw/archive/Demo-Router-XL_Performance.2026-06-06-095751.amxd`.
- **STARTER Router** (`dist/Control XL Starter Project/XL_Performance.amxd`): исходник был байт-в-байт равен Demo Router → готовый результат скопирован, md5 `0c8119ed…` (идентичен Demo Router). Архив: `raw/archive/Starter-Router-XL_Performance.2026-06-06-095751.amxd`.
- Starter main НЕ трогался (уже `91c25bea` с прошлого захода, сверено на месте). Zip-бандлы НЕ пересобирались, в User Library НЕ деплоилось (по заданию).

### 2026-06-06 (4) — кластерная раскладка применена к бандл-девайсам (Demo + Starter)
- **STARTER** (`dist/.../Max Devices/Control XL.amxd`, 211533 B): граф идентичен canon → patching_rect всех 267 боксов скопированы по id из canon. «Bank» лейбл сохранён (НЕ откатился в «Bank fx»). Валидация: filesize/JSON-span/prefix/suffix байт-в-байт, 0 не-гео диффов, lines==, presentation 16 боксов==, 0 dangling, ptch инвариант. Архив до правки: `raw/archive/Starter-Control XL.2026-06-06-094316.amxd`. Новый md5 `91c25bea…`.
- **DEMO** (`raw/Demo-set Project/.../XL_Performance.amxd`, 218417 B): движок переразложил по своему графу (277 box). Кресты **3203→1416 (−56%, seed 7)**, 0 наложений. Все 277 боксов moved (x/y only), 0 не-гео диффов, 0 W/H, lines==, presentation 16==, suffix (dlst+`solo_follower.js`) байт-в-байт, 0 dangling, ptch инвариант, filesize сохранён (Путь A). Архив: `raw/archive/Demo-XL_Performance.2026-06-06-094316.amxd`. Новый md5 `f2447484…`.
- Движок реконструирован (был эфемерен): `/tmp/cxl_engine.py` — classify→intra layered (longest-path + port-aware barycenter ×8 + SA 4000 итер)→greedy tile order (хаб MIXER)→shelf-pack snap-100→глоб. счётчик крестов + overlap-чек→Путь A. Грабли: `mix_new_ctlin48_bank` НЕ ловится `startswith('mix_obj-')` (нет дефиса) — нужен явный case →MIXER ПЕРЕД остальными mix-проверками. НЕ деплоилось в User Library (только бандлы на месте).
### 2026-06-06 (3) — НОВЫЙ процесс (репо-канон) + кластерная раскладка
- Рабочий процесс изменён: канон редактируется в `~/Projects/Claude/Fadercraft/device/Control XL.amxd`, User Library не трогать (см. раздел «Рабочий процесс» вверху).
- User Library восстановлен в чистый оригинал (211548 B, md5 `90de7585…`); страховка изменённой версии → `raw/archive/Control XL.2026-06-06-085757.amxd` (md5 `e98cec17…`).
- Патч переразложен КЛАСТЕРАМИ-плитками (см. «Раскладка … КАНОН»). **Кресты 2742→1215 (−56%)**, 0 наложений, presentation/lines/W/H/suffix/`dlst`/встроенные js байт-в-байт, 0 не-геометрических диффов. НЕ деплоился в User Library (по заданию — стоп после валидации). Проектный файл md5 `0dcc07d7…`.
### 2026-06-06 (2) — переразложен патч под мин. пересечений проводов
Двойная сетка 10×10 (внутри модуля) / 100×100 (между модулями) + новый порядок секций (см. «Раскладка»). Движок: топ-слои + port-aware barycenter + SA-перестановка узлов. **Пересечения проводов: 3725 → 1661 (−55%)**, наложений боксов 0. Per-section intra-кресты: INSTRUMENTS 307, MIXER 162, CC47 57, остальные ≤5. Все 270 боксов repositioned (только x/y `patching_rect`), 408 связей без изменений, 0 не-геометрических диффов полей, presentation 16 UI-боксов идентичны, suffix/`dlst`/`solo_follower.js`/`version_check.js` байт-в-байт (Путь A, L0=201786 сохранён). Архив до правки: `~/Brain/Fadercraft/raw/archive/Control XL.2026-06-06-082947.amxd`.
### 2026-06-06 — переразложен patcher-вид (только геометрия)
Косметика: `patching_rect` всех 267 боксов разложены на 10 функц. полос (см. раздел «Раскладка patcher-вида»), +3 comment-заголовка (→270 боксов), 408 связей без изменений. Логика/шнуры/presentation не тронуты (валидировано: 0 не-геометрических изменений полей, `presentation_rect`/`presentation` всех 16 UI-боксов идентичны). Путь A, длина JSON сохранена, suffix/`dlst`/`solo_follower.js`/`version_check.js` байт-в-байт. Архив: `~/Brain/Fadercraft/raw/archive/Control XL.2026-06-06.amxd`.
### 2026-06-02 — mode-кнопки 11–14 закрыты для маппинга
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
