# .amxd — формат и рецепт правки

Подтверждено реверсом реального девайса (XL_Performance) + документацией Ableton/Cycling74. `.amxd` = гибрид: бинарный заголовок, большой JSON-патчер (обычный maxpat) в середине, бинарный хвост со встроенными файлами и контрольной суммой.

## Контейнер `ampf` (chunked)
`ampf` → `meta` → `ptch` (payload = субчанк `mx@c` с JSON-патчером + встроенные файлы через `dlst` + хвостовые метачанки `of32/gvers/flag/mdat`).

Раскладка байт (смещения общие для всех `.amxd`):
- `0x00`: `ampf` + u32(4)
- `0x18`: `ptch` + **u32 LE @0x1C** = размер payload = `filesize − 0x20`
- `0x20`: `mx@c` + u32 BE(16)@0x24 + u32(0)@0x28 + **u32 BE @0x2C** = размер данных mx@c (JSON + `\0` + встроенные скрипты)
- `0x30` (=48): начало JSON-патчера. Заканчивается первым байтом `\x00` (null-terminator). Дальше — встроенные JS-файлы и метачанки.

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

### Unfrozen `.amxd`:
- Заголовок (0x00-0x1F): `ampf` + meta (07→**01** в байте 0x14)
- ptch chunk @0x18: `ptch` + ptch_size_LE (ptch_size = filesize - 0x20)
- **JSON начинается прямо с 0x20** (без mx@c wrapper), формат `{"patcher": {...}}`
- Нет `dlst`. Суффикс после JSON = только `\x00` (3 байта: `\n}\x00`)
- Зависимости — внешние файлы, ищутся по пути

### Frozen `.amxd`:
- Заголовок (0x00-0x1F): `ampf` + meta (07→**07** в байте 0x14, НЕ 01)
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

## Веб-источники
- Cycling74 forum «Max For Live Device File Format» — https://cycling74.com/forums/max-for-live-device-file-format
- js2max (компиляция JS в `.amxd`, разбор контейнера) — https://github.com/ktamas77/js2max
- LiveAPI / JS — https://docs.cycling74.com/max8/vignettes/jsliveapi
- Live API via JavaScript (Max Cookbook) — https://music.arts.uci.edu/dobrian/maxcookbook/live-api-javascript
