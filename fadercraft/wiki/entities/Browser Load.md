# Browser Load

> ⛔ **ОТЛОЖЕНО / свёрнуто 2026-06-06.** Фича удалена из всех слотов Control XL; откат выполнен. **Причина: Live Browser (`browser`/`load_item`/`hotswap_target`/`BrowserItem`) НЕ выставлен в Max for Live LiveAPI** — подтверждено на Live 12.4.1 через `new LiveAPI("live_app").info` (Application отдаёт только `control_surfaces`+`view`, без `browser`/`get_browser`; в `live_set` тоже нет). Загрузка выделенного браузер-item из `.amxd`-девайса НЕВОЗМОЖНА — только через Python MIDI Remote Script (полный Live API). Если фича вернётся — делать в remote-script (у пользователя декомпилированный LCXL remote-script, см. [[CC47 Cross-Mode Transit]]/память `reference_lcxl3_remote_script`), НЕ в M4L. Все артефакты Control XL вернулись на чистый md5 `44aa142b`; scratch-js (`browser_load.js`/`fc_browserload.js`/`fc_bload2.js`) удалены; история попыток в `raw/archive/`. Текст ниже — историческое описание задумки и попыток в M4L, НЕ актуальное состояние.

**Summary**: *(задумка, отложена)* Одной кнопкой LCXL (CC51) ИЛИ кликом по UI-кнопке в интерфейсе девайса грузить элемент, выделенный пользователем в левой библиотеке браузера Live, на текущую дорожку, затем шагать на следующую сцену и возвращать фокус в браузер.

**Sources**: история попыток (архив `raw/archive/` 2026-06-06).

**Last updated**: 2026-06-06 (ОТЛОЖЕНО — нет browser в M4L LiveAPI; полный откат).

---

## Статус (история — фича отложена)

| Что | Статус | Примечание |
|---|---|---|
| Ловля CC51 (`ctlin 51`, любой канал) | ✅ MIDI-сторона работает | **Было `ctlin 51 15` — фича молчала.** Канал 15 в кастом-модах не назначен; LCXL шлёт CC51 не на ch15, а фильтр отбрасывал нажатие. Снят фильтр канала → ловим CC51 на ВСЕХ каналах, как все соседние `ctlin` в девайсе. См. ниже «Канал». |
| Реакция только на нажатие | ✅ работает | `sel 127` УДАЛЁН (build 11); теперь прямая `bl_ctlin[0]→bl_js[0]`, js получает int (127 нажатие / 0 release), `msg_int(v){ if(v) … }` реагирует только на ненулевое. |
| **UI-кнопка теста (без железа)** | ✅ MIDI-эквивалент в UI | `live.text` в button-режиме `bl_ui_btn`, в presentation. Клик = int 1 в `bl_js[0]` = то же, что нажатие CC51. См. ниже «UI-кнопка». |
| Обход браузера → выделенный item → `load_item` | ⚠️ диагностируется | Логика готова и `browser_load.js` лежит на диске, но item пока НЕ грузится — ловим по логам Max Console (билд js = `DBG=1`, логирует каждый этап). |
| Сдвиг на следующую сцену (`selected_scene +1`) | ✅ работает | `selected_scene_index`, clamp на последней сцене; key-down НЕ эмулируется |
| Возврат фокуса в браузер (`focus_view Browser`) | ✅ работает | `live_app view` |
| **Вшито во freeze (рассылка)** | ❌ НЕ вшито | `browser_load.js` только на диске; у покупателя без freeze будет `js: can't find file browser_load.js`. Незакрытый ship-шаг (как [[Version Check (Update Notifier)]]). |

## Канал (почему фильтр снят)

Все остальные `ctlin` девайса одно-аргументные (`ctlin 20/28/47/48/49` + два «голых» `ctlin`) — они слушают CC на **любом канале**. Только Browser Load изначально стоял как `ctlin 51 15` (фильтр на ch15) — рассинхрон с конвенцией девайса.

Проверка кастом-модов (`.syx`, control ID `0x3e` = кнопка CC51, разобрано побайтово 2026-06-06): CC51 присутствует во всех 15 модах, но per-control флаг-байт `X1` (тип/цвет/поведение/канал, offset +3 в дескрипторе) **нигде не кодирует канал 15**. Канал в custom-mode задаётся per-control в дескрипторе и в этой конфигурации не равен 15. Поэтому LCXL слал CC51 не на канале 15 → `ctlin 51 15` глушил каждое нажатие. Снятие фильтра (`ctlin 51`) убирает неопределённость канала как класс. Пользовательское «27/28» — это CC-номера соседних контролов (CC27 = энкодер ряд2, CC28 = фейдер), а не канал.

Значение кнопки на нажатие = **127** (descriptor max value = `0x7f`), release = 0 — `bl_sel` (`sel 127`) корректно ловит нажатие; вдобавок `browser_load.js` сам принимает любое ненулевое (`msg_int(v){ if(v) … }`), так что значение — двойно безопасно и НЕ было причиной.

## Контракт

Триггер: исполнитель жмёт кнопку на LCXL, замапленную в custom-mode на **CC51 (любой канал)**. Поведение:

1. Найти элемент, **выделенный пользователем в левой библиотеке браузера** (вариант A: грузим текущий выбор, не свой жёстко зашитый путь).
2. Загрузить его на текущую (выбранную) дорожку через `Browser.load_item`.
3. Перейти на **следующую сцену** Session-вида (эквивалент «стрелка вниз»).
4. Вернуть фокус в браузер, чтобы стрелками можно было выбрать следующий сэмпл.

## Проводка объектов (id)

- `bl_lbl` — `comment` «BROWSER LOAD (CC51, any ch)» (баннер раскладки).
- `bl_ctlin` — `ctlin 51` (один аргумент → CC51 на любом канале, 2 outlet: value, channel; используется outlet 0 = value).
- `bl_js` — `js browser_load.js`. Принимает int (127 нажатие / 0 release); `msg_int(v){ if(v) … }`.
- `bl_ui_btn` — **UI-кнопка теста** `live.text` в button-режиме (`mode: 1`), в presentation. См. ниже.

Связи: `bl_ctlin[0] → bl_js[0]` (MIDI), `bl_ui_btn[0] → bl_js[0]` (UI-клик). Обе ветки бьют в один и тот же inlet0 `bl_js`. `bl_sel (sel 127)` удалён в build 11 — js сам отсеивает release по `if(v)`.

## UI-кнопка (тест без железа)

Чтобы тестировать Browser Load без подключённого LCXL, в presentation-вид девайса добавлена кнопка, видимая на дорожке в Live.

- **Объект:** `bl_ui_btn`, `maxclass = live.text`, `mode: 1` (button-режим → momentary: int 1 на нажатие, 0 на отпускание; не toggle с хранимым состоянием).
- **Подпись:** «Load Sample (Browser Load)».
- **Раскладка:** в presentation отдельным рядом под «Prelisten» (`presentation_rect [12, 162, 192, 20]`, на всю ширину панели). В patcher-вид — рядом с кластером `bl_*` (`patching_rect [400, 2990, 100, 24]`).
- **Маппинг/automation:** `parameter_invisible: 2` (Hidden), `parameter_enable: 1` — кнопка работает (шлёт значение), но скрыта из Live MIDI-маппинга/automation/param-листа; Live не пытается хранить/автоматизировать лишнее состояние. `varname: bl_ui_btn`, `parameter_longname: "Browser Load Test"`, `parameter_shortname: "Load"`.
- **Поведение:** клик → outlet0 шлёт int 1 в `bl_js[0]` (тот же inlet, что MIDI-ветка) → `browser_load.js` запускает загрузку. Отпускание шлёт 0 → js игнорирует. Полностью эквивалентно нажатию CC51, с теми же логами `[browser_load] …` в Max Console.

## Логика `browser_load.js`

- `bang` / non-zero `msg_int` / сообщение `load` → `scheduleLoad()` → `Task.schedule(1)` (deferlow-эквивалент: уводим Live API с high-priority потока).
- `doLoad()`:
  - `new LiveAPI("live_app browser")`; обходим корневые категории (`sounds, drums, instruments, audio_effects, midi_effects, max_for_live, plugins, clips, samples, packs, user_library, current_project`).
  - спускаемся **только в ветки с `is_selected == 1`** — выбор в браузере уникален, поэтому обход дешёвый (не полный обход дерева); лимит глубины `MAX_DEPTH = 12`.
  - находим глубочайший `is_selected && is_loadable` item → `browser.call("load_item", "id", item.id)`.
  - `advanceScene()` → `focusBrowser()`.
- `advanceScene()`: `live_set view` `selected_scene_index + 1`, clamp на последней сцене; settable, детерминирован. (Эмуляция key-down из M4L нетривиальна — нативной инжекции клавиш нет — поэтому через `selected_scene`, поведение для юзера идентичное.)
- `focusBrowser()`: `live_app view` `call focus_view Browser`.
- `freebang()`: отменяет отложенный Task при выгрузке устройства.

## Пути рантайм-файлов

- Канон (Brain): `~/Brain/Fadercraft/raw/browser_load.js`.
- Рядом с девайсом (проектный эталон): `~/Projects/Claude/Fadercraft/device/browser_load.js`.
- Во `freeze` (`dlst` контейнера `.amxd`) **НЕ вшит** — на диске лежат `solo_follower.js` и `version_check.js`, `browser_load.js` пока нет.

## Незакрытый ship-шаг

Перед рассылкой `browser_load.js` нужно **вшить во freeze** (как и `version_check.js`), иначе у покупателя при загрузке устройства Max выдаст `can't find file browser_load.js` и фича не сработает. До этого шага также НЕ пропагировать в бандл-слоты Demo/Starter и User Library (см. карту проекта в памяти m4l-master).

## Замечание про производительность

Вариант A (грузим текущий выбор обходом `is_selected`) выбран осознанно: пользователь реально сам листает левую библиотеку. Прунинг по `is_selected` держит обход дешёвым даже на больших библиотеках. Если в реальном большом сете проявится тормоз — вернуться к стратегии (напр. кешировать путь к выбранному).

## Related pages

- [[XL_Performance — как это работает]]
- [[Version Check (Update Notifier)]]
- [[MIDI Passthrough]]
