# Browser Load

**Summary**: Одной кнопкой LCXL (CC51, любой канал) грузит элемент, выделенный пользователем в левой библиотеке браузера Live, на текущую дорожку, затем шагает на следующую сцену и возвращает фокус в браузер. Реализована JS-объектом `browser_load.js` через Live API.

**Sources**: device `Control XL.amxd` (граф 271/410), `browser_load.js`.

**Last updated**: 2026-06-06 (channel-filter fix).

---

## Статус

| Что | Статус | Примечание |
|---|---|---|
| Ловля CC51 (`ctlin 51`, любой канал) | ✅ работает | **Было `ctlin 51 15` — фича молчала.** Канал 15 в кастом-модах не назначен; LCXL шлёт CC51 не на ch15, а фильтр отбрасывал нажатие. Снят фильтр канала → ловим CC51 на ВСЕХ каналах, как все соседние `ctlin` в девайсе. См. ниже «Канал». |
| Реакция только на нажатие (`sel 127`) | ✅ работает | release=0 игнорируется |
| Обход браузера → выделенный item → `load_item` | ✅ логика готова | требует, чтобы `browser_load.js` лежал на диске рядом с девайсом |
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
- `bl_sel` — `sel 127`. outlet0 (match 127 = нажатие) → bang; outlet1 (passthrough, в т.ч. release 0) не подключён.
- `bl_js` — `js browser_load.js`. `saved_object_attributes.filename = browser_load.js`, `parameter_enable = 0`.

Связи: `bl_ctlin[0] → bl_sel[0]`, `bl_sel[0] → bl_js[0]`.

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
