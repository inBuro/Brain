# m4l-master — память

Дайджест. Горячие факты + карта детальных файлов.

## Карта памяти
- [df-master.md](df-master.md) — **DF Master.amxd** md5=`4c18fc6e` (340416B), UNFROZEN, SELF-CONTAINED в `Max Devices/DF Master/`.
- [feedback-color-transparency-policy.md](feedback-color-transparency-policy.md) — ⚠️ ПОСТОЯННО: цвета M4L трогать ТОЛЬКО по явной просьбе; alpha<1 = намеренная прозрачность.
- [amxd-format.md](amxd-format.md) — рецепт распаковки/пересборки `.amxd`, раскладка байт, модель patcher JSON, Live API практики.
- [xl-performance.md](xl-performance.md) — факты по флагману Control XL: пути, объекты CC47, карта режимов.
- [feedback-iterative-no-versionlog.md](feedback-iterative-no-versionlog.md) — при итеративной отладке НЕ вести журнал версий; только дата-бэкап + current-state.
- [lcxl3-daw-protocol.md](lcxl3-daw-protocol.md) — DAW-mode протокол LCXL3, CC30/CC31, relative-энкодеры.
- [lcxl3-daw-channel-collapse.md](lcxl3-daw-channel-collapse.md) — **ПОДТВЕРЖДЕНО**: LCXL3 сворачивает Custom Mode CC → ch1 при DAW-подключении.
- [encoder-relative-research.md](encoder-relative-research.md) — гипотеза firmware relative-toggle; **НЕ подтверждено**.
- [lcxl2-mk2-feasibility.md](lcxl2-mk2-feasibility.md) — порт на MK2: абсолютные потенциометры (блокер).
- [controlxl-project-map.md](controlxl-project-map.md) — 6 device-слотов Control XL, md5, zip-деливераблы, процедура правки.
- [sends-reader.md](sends-reader.md) — **SendsReader.amxd** v1.3 `9c0386ab`, UNFROZEN.
- [sends-follower-persistence-automap.md](sends-follower-persistence-automap.md) — SF персистентность, applySlotRanges инвариант.
- [sends-follower-signal-path.md](sends-follower-signal-path.md) — SF модуляционный fan-out ЦЕЛ.
- [sends-follower.md](sends-follower.md) — **Sends Follower** CURRENT 2026-07-11 FROZEN: Return `66720265` / Track `a4947020`.
- [sends-follower-lfo.md](sends-follower-lfo.md) — **SendsFollower LFO.amxd** эксперимент, v1 `7ae739b3`.
- [m4l-portability-collect-freeze.md](m4l-portability-collect-freeze.md) — unfrozen M4L НЕ переживает Collect All; freeze = единственный портируемый артефакт.
- [df-slot-multimap-panel.md](df-slot-multimap-panel.md) — DF Slot ченджлог multimap panel.
- [df-slot-architecture.md](df-slot-architecture.md) — **DF Slot — все подсистемы** + CURRENT state. Читать ПЕРЕД любой правкой.
- [df-slot-session-2026-07-23.md](df-slot-session-2026-07-23.md) — ключевые находки: live.remote~ не персистит, LiveAPI.set ≠ stored value.
- [df-slot-coloring-recipe.md](df-slot-coloring-recipe.md) — ⭐ как красить каждый элемент DF Slot + live.colors токены.
- [mm-native.md](mm-native.md) — **MM Native.amxd** v2 `fa8779d7`.
- [df-slot-mapbuttontint-facts.md](df-slot-mapbuttontint-facts.md) — ФАКТЫ MapButtonTint: карта объектов, канон-поведения, ловушки.
- [mapbuttontint-border-diag.md](mapbuttontint-border-diag.md) — MapButtonTint чёрная рамка + порт V20 (COMPLETE 2026-07-17).
- [mapping-deck.md](mapping-deck.md) — **Mapping Deck.amxd** CURRENT `988ff67e`, JS `bcac0f77` (v3.1). ЗАМОРОЖЕН.
- [df-slot-release-build.py](df-slot-release-build.py) — parametric Python: `python3 df-slot-release-build.py 1.3` → собирает релизный AMXD+zip с вычищенными dev-постами, патчит dlst, валидирует.

## Конвенции (железно)
- **Где редактировать Control XL:** основной артефакт = **User Library** `.amxd`. Пропагация — только по команде. → [controlxl-project-map.md](controlxl-project-map.md).
- **Архив до правки.** `~/Brain/fadercraft/_device-backups/<Name>.YYYY-MM-DD[-HHMMSS].amxd`. Никогда не перезаписывать.
- **Правка на месте.** Меняем сам `.amxd`, не шлём куски кода.
- **Валидация перед подменой.** Re-parse JSON, счётчики boxes/lines, инварианты размеров.
- **Перезагрузка в Live.** Live кеширует — убрать/добавить девайс заново; Max-редактор закрывать без сохранения.
- **⚠️ ЦВЕТА/ПРОЗРАЧНОСТЬ** → [feedback-color-transparency-policy.md](feedback-color-transparency-policy.md).

## Где что лежит
- Девайсы: `/Users/Kirill/Music/Ableton/User Library/Max Devices/`
- Архивы DF/SF: `~/Brain/fadercraft/_device-backups/`
- Архивы Control XL: `~/Brain/fadercraft/Control XL/raw/archive/`
- `.syx` кастом-моды (канон): `~/Projects/Projects/fadercraft/custom-modes/`
- **AbletonMCP remote script**: `User Library/Remote Scripts/AbletonMCP/__init__.py` — пропатчен (2026-07-14).
- **JS symlink-схема (2026-08-09):** ОДИН файл `User Library/Max Devices/midi_learn_slot.js`; два symlink из Brain и Documents. Правь любой путь — физически один файл.

## Быстрые факты формата
- **Оба типа**: JSON @ 0x30. Инвариант `ptch(LE@0x1C) == filesize−0x20`. Unfrozen = нет dlst. Frozen = dlst с embedded файлами.
- Проверка frozen: `data.find(b'dlst') != -1`.
- При изменении длины frozen: `ptch`(LE@0x1C) и `mx@c`(BE@0x2C) += ΔL + патч `dlst` офсетов. → [amxd-format.md](amxd-format.md).
- Хвост (suffix от `\x00`) сохранять **байт-в-байт**.

## Текущее состояние домена

**Dynamic Focus Slot** DEV — JS **v66-COLOR-RAW**, MapButtonTint **v47**. Frozen v1.2-clean `b3801e5c` в User Library. JS грузится с ДИСКА (User Library/Max Devices/) — правки JS и .maxpat применяются без рефриза AMXD.

**midi_learn_slot.js** v66-COLOR-RAW — DEV. Маркер: `>>> S7-DEV-v66-COLOR-RAW LOADED <<<`.
`tc=123,123,123` = реальный серый `0x7B7B7B`, не fallback. Распаковка packed int в `_getActiveTrackColor()` ПРАВИЛЬНАЯ. Root cause гипотеза: stale `hostTrack` (race: `hostId` обновился, но `hostTrack` LiveAPI объект не успел). Фикс v66: stale-guard в `_getActiveTrackColor()` — если `hostTrack.id != hostId`, пересоздать `hostTrack = new LiveAPI(null, "id " + hostId)`. `[COLOR-RAW]` лог показывает `trkId/hostId/raw` для диагностики. Архив: `midi_learn_slot.2026-08-11-111746.pre-v66-color-raw.js`.

**ПОДТВЕРЖДЕНО 2026-08-11:** v64–v66 = диагностика ЛОЖНОЙ ТРЕВОГИ. Тест шёл в Absolute-режиме (`abs=true`). В Absolute-mode цвет = targetTrack (целевой параметр), не hostTrack. Drag корпуса девайса между треками в Absolute-mode КОРРЕКТНО не меняет цвет. Код исправен. Правило: при "цвет не меняется после drag" — сначала проверить `colorMode` + `abs` в консоли.

**Дизайн si=7 (v63, ФИНАЛЬНЫЙ):** track color bg + black text (0,0,0) — одинаково с si<7. Amber/dark ОТМЕНЁН пользователем 2026-08-11. Не возвращать.

**MapButtonTint v47** (текущий): varname=it_vtrig + it_state + it_dg + it_st2close. 145 boxes / 242 lines. Загружается с ДИСКА. Каждая следующая правка → новый номер + маркер.

**PERSISTENCE ЛОВУШКА:** `LiveAPI.set("value", X)` на live.numbox с parameter_enable=1 НЕ сохраняет в .als. Единственный путь: `patcher.getnamed("varname").message("set", X)`. Для DSP: сначала "set" X, затем message(X) (fires outlet).

**RangeAndName (obj-16) — АСИНХРОННЫЙ.** outlet 4 → it_id0 ("0") при cancel/async. outlet 6 → it_mflag. Root cause mbt_map=0 устранён в v60: MapButtonTint v47 varname=it_vtrig + JS 100ms deferred it_mapstore(1)+it_vtrig(1).

**swap-params.svg:** `can't find` = Max кэширует image search path на уровне СЕССИИ. Нужен ПОЛНЫЙ ПЕРЕЗАПУСК LIVE.

**Dynamic Focus Input** FROZEN `7abcd0d0` (24012B). 4 debug print бокса удалены (2026-08-10). DEVICE_VERSION='1.2' (bumped 2026-08-11, синхронизирован с DF Slot). Update-иконка не будет гореть когда сервер будет поднят до '1.2'.

**Control XL** FROZEN `924bfac1` (269411B). ⚠️ Старая unfrozen копия в `Presets/MIDI Effects/Max MIDI Effect/Imported/` (`adeacc9b`) — источник `can't find version_check.js`. Удалить.

**Mapping Deck** ЗАМОРОЖЕН. → [mapping-deck.md](mapping-deck.md). **Control XL** v1.1. → [controlxl-project-map.md](controlxl-project-map.md).

## Бандлы Dynamic Focus
- **v1.1-release** (2026-08-08): `dist/Fadercraft Dynamic Focus v1.1.zip` `65558ff3`.
- **v1.2-clean** (2026-08-09): `dist/archive/Dynamic Focus Slot v1.2-clean.amxd` `b3801e5c`. Frozen base — НЕ публиковать.
- **v1.2-release** (2026-08-11): `dist/archive/Dynamic Focus Slot v1.2.amxd` `ff0212ea` (847790B). `dist/Fadercraft Dynamic Focus v1.2.zip` `467cb575` (финальный, после sync DF Input). DEVICE_VERSION='1.2' в ОБОИХ устройствах. DF Input `7abcd0d0` (24012B). DF Slot `ff0212ea` (847790B). Embeds Slot: JS v66 cleaned, MBT v47 (145/242), df_version_check v1.2. НЕ опубликован — координатор решает когда деплоить.
- **v1.2-20260811** (пересборка 2026-08-11): `dist/archive/Dynamic Focus Slot v1.2-20260811.amxd` `ff0212ea` (847790B). `dist/Fadercraft Dynamic Focus v1.2-20260811.zip` `96b12a8d`. AMXD md5 совпадает с v1.2-release — рабочая копия JS v66 + MBT v47 идентична. ZIP чуть отличается (df_version_check.js +1 байт, временные метки). DEVICE_VERSION='1.2' не изменена. 32 dev-поста удалены, маркер S7-PROD-v1.2.
- **Рецепт сборки релиза:** `df-slot-release-build.py` — parametric Python, принимает VERSION, собирает AMXD+zip, валидирует.

## TODO
- **v66-COLOR-RAW тест (ТЕКУЩАЯ версия):** 1) Reload девайс. 2) Замапить 1-2 слота. 3) Drag на жёлтый трек (id 43077), кликнуть. 4) Console: `[COLOR-RAW] STALE hostTrack!` → race подтверждён, stale-guard сработал → проверь что цвет жёлтый теперь. Если `trkId=43077 raw=GRAY` без STALE → LOM запаздывает, иная причина.
- **⚠️ ПЕРЕД ТЕСТОМ "drag = цвет не меняется":** проверить `colorMode` и `abs` flag в консоли (`[COLOR-OBS] ... abs=true/false`). В Absolute-режиме цвет = targetTrack, drag корпуса не меняет — это BY DESIGN, не баг.
- **v63 si=7 + FOLLOW регрессии:** замапить все 8 строк → track color + black text. STANDARD → amber + dark. Persistence + Min/Max без регрессии.
- **v60-RESTORE тест:** reload after save → si=0/1 показывают track color (не dark) в ≤300ms.
- **Лейбл «Bank fx» → «Bank»** в Control XL MIXER-секции (запрошено 2026-06-02).
- **Rack focus bug** — портировать `_findOwningTrackId()` в prod JS после hardware теста.
- **v1.2 бандл собран** (2026-08-11). Следующий шаг: опубликовать на Gumroad (решение координатора). После публикации — обновить `versions.json` на сервере (dynamic_focus.latest='1.2').

## Ключевые факты (верифицировано)
- `pak` inlet 0 = hot, inlet 1 = cold. `LiveAPI.get()` может вернуть массив `[0]` — оборачивать `parseInt()`.
- `pattr.message(value)` fires outlet; `pattr.message("set", value)` только хранит (без side-effects).
- `live.colors` outlet 1 = bang on skin change — в MapButtonTint НЕ подключён.
- RangeAndName outer inlets: 0=audio, 1=TargetMin, 2=TargetMax, 3=ID. obj-55(pak) = DSP trigger.
- ALS `<Color Value="N"/>` = palette index, НЕ packed RGB. LOM IDs ≠ XML Id — нельзя сопоставить напрямую.
