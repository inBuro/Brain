# .amxd — формат и рецепт правки

Подтверждено реверсом реального девайса (XL_Performance) + документацией Ableton/Cycling74. `.amxd` = гибрид: бинарный заголовок, большой JSON-патчер (обычный maxpat) в середине, бинарный хвост со встроенными файлами и контрольной суммой.

## Контейнер `ampf` (chunked) — ДВА варианта хедера

### FROZEN (и большинство UNFROZEN из User Library)
`ampf` → `meta` → `ptch` → `mx@c` (payload = JSON-патчер + встроенные файлы через `dlst` + хвостовые метачанки).

Раскладка байт:
- `0x00`: `ampf` + u32(4)
- `0x18`: `ptch` + **u32 LE @0x1C** = размер payload = `filesize − 0x20`
- `0x20`: `mx@c` + u32 BE(16)@0x24 + u32(0)@0x28 + **u32 BE @0x2C** = размер данных mx@c (JSON + `\0` + встроенные скрипты)
- `0x30` (=48): начало JSON-патчера. Заканчивается первым байтом `\x00` (null-terminator). Дальше — встроенные JS-файлы и метачанки.

### UNFROZEN (DEV-вариант, подтверждён на Dynamic Focus Slot DEV.amxd 2026-08-08)
Нет субчанка `mx@c`. JSON начинается ПРЯМО в 0x20, суффикс = 1 байт `\x00`.
- `0x00-0x07`: `ampf` + u32(4)
- `0x08-0x17`: `aaaa` + `meta` + u32(4) + u32(1)
- `0x18-0x1B`: `ptch`
- `0x1C-0x1F`: **u32 LE** = `filesize − 0x20` (инвариант тот же!)
- `0x20`: начало JSON. JSON заканчивается `\x00` в самом конце файла.
- Python парсить: `decoder = json.JSONDecoder(); full = raw[0x20:].decode('utf-8', errors='replace'); obj, end_idx = decoder.raw_decode(full)`. Реальная длина JSON в байтах = `len(full[:end_idx].encode('utf-8', errors='replace'))`. Суффикс = `raw[0x20 + json_byte_len:]` = `b'\x00'`.
- Repack: `new_ptch = len(new_json_bytes) + 1; header[0x1C:0x20] = new_ptch.to_bytes(4,'little'); raw = bytes(header) + new_json_bytes + b'\x00'`.

`mdat` в самом конце (`mdat` + size + 4 байта) — контрольная сумма. **Live игнорит её при загрузке** / пересчитывает на своём save. Оставляй как есть; ручной пересчёт не нужен.

## ⚠️ КРИТИЧНО: `dlst` и встроенные файлы (freeze)
**Замороженный (frozen) `.amxd` хранит все зависимости (JS-скрипты и т.п.) ВНУТРИ файла, после JSON, а в хвосте есть директория `dlst` с АБСОЛЮТНЫМИ смещениями и размерами каждого ресурса.** Если поменять длину JSON и не поправить `dlst`, встроенные скрипты «уезжают» относительно записанных смещений → Max читает мусор (`js: malformed UTF-8 at offset 0`, `no function … [name.js]`), а после раз-/заморозки теряет их совсем.

`dlst` (в самом конце файла) — список записей `dire`, по одной на ресурс:
`type`(JSON/TEXT) · `fnam`(имя) · `sz32`(размер) · `of32`(смещение, относительно базы `mx@c` = `0x20`) · `vers` · `flag` · `mdat`(checksum ресурса).
Первый ресурс = сам патчер-JSON (`sz32 = длина JSON + 1` за счёт `\0`, `of32 = 16`). Дальше — встроенные скрипты с `of32`, указывающим прямо в пост-JSON область.

**Поэтому НЕ меняй длину JSON вслепую.** Два безопасных пути:

### Путь A (предпочтительный) — пересборка БЕЗ изменения длины JSON
Добиваешь новый JSON пробелами до ТОЧНО исходной длины. Тогда ничего в контейнере не сдвигается: `dlst`, встроенные файлы, поля размера — всё валидно, меняется только содержимое JSON (той же длины). Это проверенный способ для frozen-девайсов.

```python
core=json.dumps(obj,ensure_ascii=False,indent=1).encode('utf-8')
pad=L0-len(core)                       # L0 = END-JS (исходная длина JSON)
assert pad>=0 and core[-1:]==b'}'      # компактный JSON короче исходного — место под паддинг есть
new_json=core[:-1]+b' '*pad+core[-1:]  # пробелы перед финальной '}' — валидный JSON
# суффикс (от \0), поля размера — НЕ трогаем; длина файла не меняется
```
Валидация: `suffix` байт-в-байт идентичен; встроенный скрипт по своему `of32` байт-в-байт совпадает с исходным; `dlst` идентичен.

### Путь B — менять длину JSON, но патчить `dlst`
Если длину сохранить нельзя (правка больше исходного JSON): тогда `+= ΔL` нужно применить к `ptch`(LE@0x1C), `mx@c`(BE@0x2C), к `sz32` JSON-ресурса в `dlst`, И к `of32` КАЖДОГО ресурса, лежащего после JSON (т.е. встроенных скриптов). Per-file `mdat`-checksum'ы устаревают — Live их при загрузке игнорит.

> **Путь B проверен 2026-06-06** (Control XL, JSON 201786→154500, dL=−47286). Корректный рецепт:
> - `ptch`(LE@0x1C) `+= dL`; инвариант `0x20+ptch == filesize`.
> - `mx@c`(BE@0x2C) `+= dL`. ⚠️ `0x30+mxc` НЕ обязан быть ≤ позиции `dlst` — у Control XL mx@c-data легально ЗАХОДИТ в dlst-регион на +16 байт (mx@c включает заголовок dlst-директории). Не вводить инвариант «mxc ≤ dlst»; вместо этого проверять, что отношение `(0x30+mxc) − dlst_pos` СОХРАНЕНО относительно источника.
> - В `dlst`: патчер-ресурс (`*.amxd`) `sz32 = новая_длина_JSON + 1` (за `\0`), `of32` остаётся 16. Каждому ТРЕЙЛИНГ-скрипту (`version_check.js`, `solo_follower.js`) `of32 += dL`; их `sz32` НЕ меняется.
> - Структура `dire`-записи: 4b tag + 4b BE-len(=12) + 4b BE-value. Сканировать `dire`→внутри найти `fnam`/`sz32`/`of32`, значение читать/писать по `pos+8`.
> - Плюс Путь B даёт файл БЕЗ гигантского padding-run (как пишет сам Max) — снимает риск «Max не парсит при валидном Python-JSON».
Этот путь теперь не «опаснее A», а скорее ПРЕДПОЧТИТЕЛЬНЕЕ для frozen-девайсов, т.к. результат байт-в-байт по стилю похож на нативный Max-save (нет искусственного паддинга).

> История: 2026-06-02 первая правка XL_Performance шла «наивной» пересборкой (ΔL=−49520) без патча `dlst` → встроенный `solo_follower.js` уехал, Max выдал malformed-UTF-8 и потерял скрипт после раз-заморозки. Исправлено пересборкой Путём A из чистого архива. Длина JSON — священна для frozen-девайсов.

## Рецепт пересборки (Python, Путь A — дефолт, проверен)
Собирай из ЧИСТОГО источника (архив/незатронутый девайс), не из уже сломанного файла.
```python
import json, struct
SRC = '/path/to/clean/Device.amxd'   # чистый источник (напр. свежий архив)
DST = '/path/to/Device.amxd'
data = bytearray(open(SRC, 'rb').read())
JS = 48
END = data.find(b'\x00', JS)                          # конец JSON
L0 = END - JS                                         # ИСХОДНАЯ длина JSON — держим её
prefix = bytes(data[:JS])
suffix = bytes(data[END:])                            # СОХРАНЯЕМ БАЙТ-В-БАЙТ (с \0 + встроенные файлы + dlst)
obj = json.loads(data[JS:END].decode('utf-8'))
p = obj['patcher']

# ---- правки ----
# p['boxes'].append({"box": {...}})
# p['lines'].append({"patchline": {"source": [srcid, outlet], "destination": [dstid, inlet]}})
# существующий объект: найти по box['id'], поправить text/numinlets/numoutlets/outlettype

core = json.dumps(obj, ensure_ascii=False, indent=1).encode('utf-8')   # ensure_ascii=False — не плодить \uXXXX
pad = L0 - len(core)
assert pad >= 0 and core[-1:] == b'}', "правка больше исходного JSON — см. Путь B"
new_json = core[:-1] + b' ' * pad + core[-1:]         # добиваем пробелами до L0
assert len(new_json) == L0
json.loads(new_json.decode('utf-8'))                  # всё ещё валиден

out = bytearray(prefix) + new_json + suffix
assert len(out) == len(data)                          # длина файла не изменилась → dlst/смещения целы
assert struct.unpack('<I', out[0x1c:0x20])[0] == len(out) - 0x20   # инвариант ptch
open(DST + '.new', 'wb').write(out)                   # сначала .new, валидировать, потом mv
```
Длина файла остаётся прежней → поля размера и `dlst` трогать не нужно. Путь B (с изменением длины + патчем `dlst`) — только когда правка физически не влезает в L0.

## ⚠️ ОБЯЗАТЕЛЬНО: реальный JSON-парсер на ИЗВЛЕЧЁННОМ из .amxd JSON
Размер/суффикс/ptch-инвариант могут ВСЕ пройти, а Max при загрузке всё равно крикнет `error parsing patcher file … missing initial '{' … line=1 char=2`. Поэтому ПОСЛЕ репака ВСЕГДА: вырезать `d[48 : d.find(b'\x00',48)]`, записать в файл и прогнать через НАСТОЯЩИЙ парсер — `python3 -c 'import json;json.load(open(...))'` И `jq -e . < extracted.json`. Не парсится → пересборка провалена, файл НЕ подменять.
Доп. структурный чек: brace/bracket-баланс == 0 вне строк; первый байт `{`, последний `}`. (История 2026-06-06: «Path A» length-preserving дал файл, который Python-json парсил и брэйсы сходились, но Max ругался — диагностика показала, что сам JSON валиден; чтобы исключить единственную оставшуюся переменную — гигантский однострочный padding-run на ~47К пробелов — перешли на Путь B с компактным JSON, как пишет сам Max. Урок: не доверять size/suffix-проверке, гонять реальный парсер.)

## Валидация после пересборки (до подмены файла)
- повторно распарсить JSON из нового файла (`json.loads(d[48:d.find(b'\x00',48)])`) ← + реальный внешний парсер, см. блок выше;
- `len(boxes)` / `len(lines)` = ожидаемые `+N`;
- новые `box['id']` присутствуют; правленые объекты имеют новый `text`/`numoutlets`;
- `suffix` нового == `suffix` оригинала (байт-в-байт) — это покрывает целостность встроенных скриптов и `dlst`;
- встроенный скрипт по своему `dlst.of32` (`d[0x20+of32 : +sz32]`) байт-в-байт совпадает с источником и начинается осмысленно (напр. `b'autowatch'`); `b'function <name>'` на месте;
- `dlst` идентичен источнику;
- `ptch == filesize − 0x20`; конец mx@c-data (`0x30 + mxc`) меньше позиции первого `of32` в хвосте.

Сначала писать в `<Name>.amxd.new`, проверить, и только потом `mv` на место (архив уже сделан до этого).

## ⚠️ Frozen vs Unfrozen контейнер — различия (задокументировано 2026-06-26)

### Как Live определяет ТИП М4L-девайса (аудио/midi/инструмент) — ПОДТВЕРЖДЕНО 2026-07-18

Тип задаётся **чанк-тегом meta** в заголовке (байты 8–15):
- `aaaameta` → Audio Effect (можно класть на audio- и return-треки)
- `mmmmmeta` → MIDI Effect (только MIDI-треки)
- `iiiimeta` → Instrument (предположительно; не измерено напрямую)

**ВАЖНО: байт 0x14 (первый байт data-части meta-чанка) НЕ определяет тип.** Он кодирует frozen-состояние:
- `01` = UNFROZEN audio effect (aaaameta + 01 00 00 00)
- `07` = FROZEN (любой тип: aaaameta + 07 или mmmmmeta + 07)
- `00` = UNFROZEN MIDI/instrument (mmmmmeta + 00 00 00 00)

Сводка по реальным девайсам User Library (2026-07-18):
| Файл | tag | byte[20] | state | тип |
|------|-----|----------|-------|-----|
| SF Return | aaaameta | 07 | FROZEN | audio |
| SF Track | aaaameta | 07 | FROZEN | audio |
| DF Slot | aaaameta | 07 | FROZEN | audio |
| Control XL | mmmmmeta | 07 | FROZEN | MIDI |
| DF Input | mmmmmeta | 00 | UNFROZEN | MIDI |
| SF Merge Probe (после фикса) | aaaameta | 01 | UNFROZEN | audio |

Рецепт для нового UNFROZEN audio-эффекта: header bytes [8:24] = `b'aaaameta' + b'\x04\x00\x00\x00' + b'\x01\x00\x00\x00'`

⚠️ Ранняя версия объяснения («`07000000` = device_type=7 = audio effect») была НЕВЕРНОЙ (исправлено после эмпирического прогона 2026-07-18).

### Unfrozen `.amxd`:
- Заголовок (0x00-0x1F): `ampf` + **для audio**: `aaaameta` + `04000000` + `01000000`; **для MIDI**: `mmmmmeta` + `04000000` + `00000000`
- ptch chunk @0x18: `ptch` + ptch_size_LE (ptch_size = filesize - 0x20)
- **JSON начинается прямо с 0x20** (без mx@c wrapper), формат `{"patcher": {...}}`
- Нет `dlst`. Суффикс после JSON = только `\x00` (3 байта: `\n}\x00`)
- Зависимости — внешние файлы, ищутся по пути

### Frozen `.amxd`:
- Заголовок (0x00-0x1F): `ampf` + `aaaameta`/`mmmmmeta`/... + `04000000` + `07000000`
- ptch chunk @0x18: `ptch` + ptch_size_LE (ptch_size = filesize - 0x20)
- **mx@c chunk @0x20**: `mx@c` + 0x10(BE, фиксирован) + 0x00(BE) + mxc_field(BE) (16 bytes)
  - `mxc_field` @0x2C = 16 (заголовок mx@c) + len(JSON) + 1 (null) + sum(len(dep_i))
  - dlst начинается ровно на `0x20 + mxc_field`
- **JSON @0x30**: `{"patcher": {...}}` + `\x00` (null-terminator)
- **Deps inline**: после JSON+null, конкатенированы без разделителей
- **dlst**: после всех deps, до конца файла. Содержит `dire`-записи с offset/size каждого dep (of32 relative to 0x20)
  - dlst subfield size-семантика: tag(4) + total_size(4 BE) + data(total_size - 8 bytes)
  - Main patcher: of32=0x10 (abs=0x30), sz32 = JSON_len + 1 (включает null)
  - Deps: sz32 = точный размер, of32 = от 0x20 (продолжение после предыдущего)

### Определение is_frozen:
```python
is_frozen = data[0x20:0x24] == b'mx@c'
```

### ⚠️ Куда Max сохраняет при Unfreeze из сета (грабля, 2026-07-04)
Когда пользователь размораживает девайс, ЗАГРУЖЕННЫЙ В LIVE-СЕТ (View → Unfreeze + Save), Max пишет unfrozen-копию НЕ обратно в исходный `.amxd`, а в **`User Library/Presets/MIDI Effects/Max MIDI Effect/Imported/<Name>.amxd`**. Исходный канон (`Max Devices/<Name>.amxd`) остаётся FROZEN и не меняется (md5/размер/дата те же). Симптом: «разморозил и сохранил, а канон всё ещё frozen». Решение: правь именно Imported-копию (она unfrozen, чистая), затем канон синхронит/рефризит владелец. Проверяй фактический путь и `is_frozen`, а не доверяй «пользователь разморозил».

### Frozen без JS-deps (DF Input.amxd — проверено 2026-07-13)
При frozen-девайсе БЕЗ встроенных JS/SVG (`dlst` содержит только 1 `dire` — сам патчер):
- Суффикс = `\x00` + `dlst`(112 bytes) + конец файла. Никаких deps между `\x00` и `dlst`.
- `of32` в dlst = 0x10 = 16 (offset от 0x20 = JSON начинается в 0x30; не меняется при Path B).
- `sz32` = JSON_len + 1 (только JSON + null, без deps). Обновлять при Path B: `struct.pack_into(">I", new_suffix, 61, new_json_len + 1)` (offset 61 от начала суффикса).
- dlst chunk size (8 bytes после `\x00`) = 112 = константа, не меняется.
- `mxc_field` @0x2C = 16 + JSON_len + 1 (НЕТ deps в сумме). При Path B: += ΔL.

### ⚠️ КРИТИЧНО: Ручная сборка frozen-контейнера — ОПАСНО (2026-06-28)
Попытка вручную собрать frozen `.amxd` (header 0x14=07 + mx@c + JSON + js_bytes + dlst) дала файл, который Live отверг с ошибкой **«CreateDevice returned with error 6: Device file broken»**. Формат dlst и/или mx@c имеют дополнительные инварианты, которые не покрыты текущей документацией. **ПРАВИЛО: Freeze только через Max-редактор (File → Freeze). Программная сборка frozen-контейнера — НЕ ПОДДЕРЖИВАЕТСЯ и не делается.** Для dev-режима всегда держи unfrozen (js внешним файлом рядом), это работает надёжно.

### Deps, вшиваемые Max при freeze bpatcher-девайсов:
- Все `bpatcher name=X.maxpat` → X.maxpat (JSON) вшивается рекурсивно
- Все `js X.js` + `saved_object_attributes.filename=X.js` → вшивается как TEXT
- Все `node.script X.js` → вшивается как TEXT
- Изображения/SVG, на которые ссылаются объекты внутри bpatcher'ов → вшиваются (напр. `multimap-unmap.svg` из `MapButton.maxpat`)
- Системные SVG из Max resources: `/Applications/Ableton Live *.app/.../Max.app/Contents/Resources/C74/packages/Max for Live/media/`

## ⚠️ Размер видимого M4L-девайса в Live (механизм — ПРОВЕРЕНО)
Как Live рисует device view в device chain (НЕ путать с окном Max-редактора):
- **Ширина** = ТРЕТЬЕ число `openrect` патчера (`[x,y,W,H]`) = то, что ставит «View → Set Device Width» / поле «Fixed Initial Window Location». Управляемо: правь `openrect[2]`. Live скроллит device chain ГОРИЗОНТАЛЬНО — широкий девайс ок.
- **Высота = ФИКСИРОВАННАЯ КОНСТАНТА Live = 169 px.** НЕ управляется ничем: ни `openrect[3]`, ни bbox presentation, ни `rect`. Всё, что в presentation ниже ~169 px (`presentation_rect.y + h > 169`), **обрезается** — Live НЕ скроллит вертикально внутри одного M4L-устройства. Источник: Ableton M4L Production Guidelines («Live's Device View has a fixed height») + cycling74 forum (169 px). Совпадает с эмпирикой: Control XL openrect height=169 помещается идеально; правки высоты через openrect «не долетают» именно потому, что высота вообще не из openrect.
- **Следствие:** если контент выше 169 px — единственные пути: (1) горизонтальная раскладка (всё в одну «полку» 169, расширяем вширь через openrect width, контент в 2+ колонки), либо (2) floating window (`thispatcher` → `window flags float`, открывается отдельным окном любого размера — меняет UX). НЕЛЬЗЯ «просто поднять openrect height».
- **presentation-bbox должен влезать в 169 по высоте**, по ширине — в `openrect[2]` с полем ~6–8 px (Control XL: bbox x[12..208] при openrect width 216 = поле 8; высота bbox 158 < 169). Если bbox.y_max > 169 → нижние ряды невидимы в Live (это НЕ кеш).
- Программно: `setwidth`/`setsize` объект ← `live.thisdevice` может менять ширину на лету (height всё равно зажат 169).

## Модель Max patcher JSON
- **box**: `{"box": {"id","maxclass","numinlets","numoutlets","outlettype":[...],"patching_rect":[x,y,w,h],"text"}}`.
  - `maxclass`: `newobj` (объекты типа `sel`,`int`,`v`,`ctlin`…), `message` (message-бокс), `comment`, `live.*`.
- **line**: `{"patchline": {"source":[boxid, outlet_idx], "destination":[boxid, inlet_idx]}}`. Индексы с нуля, выходы/входы слева направо. (Опц. поле `order` для порядка срабатывания при веере.)
- **`sel a b c …`**: `N+1` выходов — `N` match (bang при совпадении значения) + 1 крайний-правый passthrough (несовпавшее). Добавляя аргумент **в конец**, НЕ сдвигаешь существующие шнуры: новый match встаёт перед passthrough. `numinlets`/`numoutlets` = `len(args)+1`; `outlettype = ["bang"]*N + [""]`. Править вместе с `text`.
- **`int` / `int N`**: bang в ЛЕВЫЙ вход → выдаёт хранимое; число в левый → сохраняет И выдаёт; число в правый → сохраняет молча.
- **`v <name>`** (value): общий регистр по имени между всеми одноимёнными `v`. Число в вход — пишет (и выдаёт), bang — читает.
- **message-бокс**: bang → выдаёт свой контент (так конвертируют bang → конкретное число).
- **`ctlin N`**: вых0 = value, вых1 = channel. **`ctlout N ch`**: шлёт CC N на канал ch.
- **`live.thisdevice`**: bang слева, когда девайс полностью загружен (включая Live API) — сюда вешать инициализацию.

## Live / M4L практики (web)
- LiveAPI нельзя в high-priority thread и в global-коде JS → переочередь через `defer`/`deferlow`.
- Освобождение ресурсов LiveAPI = присвоить ссылку `null`.
- В патчере: `live.path` / `live.object` / `live.observer`; в JS — объект `LiveAPI` с callback на путь/свойство.

## ⚠️ live.numbox parameter_type ловушка (подтверждено MCP 2026-07-14)
Для скрытых numbox, хранящих большие значения через LiveAPI.set:
- `parameter_type: 0` = **Float** — M4L уважает `parameter_mmax`. LiveAPI.set принимает значения в [0, mmax].
- `parameter_type: 1` = Int — M4L ИГНОРИРУЕТ parameter_mmax и использует собственный дефолт (0..255). LiveAPI.set зажимает всё >255.
- `box.minimum`/`box.maximum` НЕ управляют диапазоном DeviceParameter (только отображением виджета).
- Шаблон из Mapping Deck (`dfp_pg0_t0`): `parameter_type: 0`, `parameter_mmax: 4194304.0`, `parameter_unitstyle: 0`, `parameter_modmode: 0`. БЕЗ `parameter_mmin`, `parameter_initial`, `box.minimum/maximum`.
- Проверка в живом девайсе: DeviceParameter показывает `min/max` (M4L API) — если max=255 при mmax=4M, значит тип выставлен Int.

## ⚠️ live.numbox: `set X` НЕ обновляет DeviceParameter (ПОДТВЕРЖДЕНО MCP 2026-07-15)

Факт: когда live.numbox получает `set X` через `prepend set` от bpatcher outlet — DeviceParameter остаётся в исходном значении (напр. 0). В MCP видно: TgtId=0 после маппинга, несмотря на то что `prepend set → lnb_tgt` явно получал id.

**`set X` на live.numbox:**
- Обновляет ОТОБРАЖЕНИЕ (display value) ✓
- НЕ обновляет M4L DeviceParameter → пресет/Live Set не видит нового значения ✗
- НЕ стреляет outlet 0 (тихое обновление) ✗

**Raw number в inlet 0 live.numbox:**
- Обновляет display value ✓
- Обновляет M4L DeviceParameter ✓ (может, только если стреляет outlet?)
- Стреляет outlet 0 ✓

**ПРАВИЛО:** для live.numbox, чьё DeviceParameter нужно в пресете — всегда подавай raw number прямо в inlet 0. НЕ через `prepend set`. Если нужно «тихое» обновление (не стрелять outlet) — используй LiveAPI.set на параметр напрямую.

**Исключение (почему CC работает через prepend set):** TODO — механизм не до конца прояснён; возможно, Int-type ведёт иначе, или есть другой write-path через pattr/restore-loop. Факт: lnb_cc (Int) сохраняется, lnb_tgt (Float) не сохранялся до замены prepend-set на raw connection.

## ⚠️ ГРАБЛИ: textedit в M4L — стек-overflow через inlet 0 и стале-баннер

### Поведение outlets (standalone Max 9, stend2+stend3, 2026-07-15)

**Стенд подтвердил:** в standalone Max 9 любые программные сообщения к textedit SILENT (ни один outlet не срабатывает):
- `set text` / `fontsize N` / `textcolor R G B A` / `presentation_rect` / `hidden` — все SILENT
- Одинаково для **обоих** методов доставки: `MaxObj.message()` (прямой JS API) И patchline (message-бокс → провод → inlet 0)
- Outlet 0 срабатывает ТОЛЬКО на нажатие Enter пользователем (keyboard event)
- `grabfocus` / `startediting` — `textedit doesn't understand` (подтверждено Кириллом, 2026-07-14)

**Важная оговорка:** поведение в M4L-контексте (Live) может отличаться от standalone Max. В практике (2026-07-14) были overflow'ы — предположительно из-за другого маршрута (patcher cable, не script sendbox).

**Реальный overflow (bf9a7ce1):** был вызван patcher cable `pg_name_setmsg → pg_name_edit[0]`. Убрали cable — overflow исчез. Механизм: patcher cable в inlet 0 в M4L-контексте, вероятно, ведёт к outlet 0; script sendbox через thispatcher — нет.

**Цикл через outlet 1 (1aa82093):** `outlet 1 → sel 1 → selectall → outlet 1 → ...` — доказанная петля. Убрана удалением pg_focus_sel/pg_focus_sa.

**Стале-баннер (КРИТИЧНО для тестирования):** жёлтый баннер `stack overflow — outlets are disabled` залипает в Live до полного перезапуска. Если в предыдущей версии девайса был overflow — баннер виден даже после загрузки исправленной версии. ВСЕГДА: (1) закрыть баннер крестиком и/или (2) полностью перезапустить Live перед тестированием новой сборки. Именно это было причиной «ложной тревоги» после e86a5f93.

**Вторичный эффект script sendbox → outlet 0 (2026-07-15):** если `script sendbox pg_name_edit fontsize 13` стреляет outlet 0 с текущим текстом "+" (в M4L), JS получает "+" как пользовательский ввод → `_applyLabel("+")` → `outlet(11, "+")` → echo → `schedulePushLabel("+")` → СТИРАЕТ сохранённый лейбл. Фикс: (1) перенести стиль в JS через MaxObj.message() (assumed silent), (2) добавить guard `if (combined==='+') return` в text()/msg_symbol(). Оба фикса применены в `15f6cfd0`.

### Рабочая архитектура (реализована 2026-07-15, DF Slot `15f6cfd05cf5b16d44836a3d2f044c61`)

1. **Ввод пользователя:** `textedit[0] → JS[inlet 10]` — без обратной связи на inlet 0 напрямую.
2. **Echo/restore из JS:** `JS outlet(11) → fromsym → deferlow → "script sendbox textedit set $1" → mm_tp`. `_echoing` guard в JS как второй рубеж.
3. **Focus styling через outlet 3 (focus bang):** `textedit[3] → msg("1") → change → sel 0 1[1] → JS inlet 12 → bang() → _applyStyleFocus()` (MaxObj.message fontsize/textcolor). change-гейт = идемпотентность.
4. **Blur restore через outlet 2 (blur bang):** `textedit[2] → deferlow → msg("0") → change → sel 0 1[0] → JS inlet 11 → _applyStyleBlur()`.
5. **Style применяется через JS MaxObj.message()** — assumed SILENT в M4L (в отличие от script sendbox). Не создаёт re-fire outlet 0/2/3.
6. **outlet 1 (focus int): НОЛЬ подключений** — именно он давал петлю через selectall. Никогда не использовать.
7. **Inlet 0: НОЛЬ входящих patcher-линий**.
8. **Guard в JS text()/msg_symbol():** `if (combined === '+') return` — не позволяет "+" placeholder стереть сохранённый лейбл через spurious outlet 0 события.
9. **selectall: не использовать** — ни через outlet 1, ни через script sendbox.

## Веб-источники
- Cycling74 forum «Max For Live Device File Format» — https://cycling74.com/forums/max-for-live-device-file-format
- js2max (компиляция JS в `.amxd`, разбор контейнера) — https://github.com/ktamas77/js2max
- LiveAPI / JS — https://docs.cycling74.com/max8/vignettes/jsliveapi
- Live API via JavaScript (Max Cookbook) — https://music.arts.uci.edu/dobrian/maxcookbook/live-api-javascript
