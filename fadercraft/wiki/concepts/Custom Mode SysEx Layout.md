---
type: concept
project: Novation
created: 2026-05-26
updated: 2026-06-10 (mode 15 self-report byte 574 = 110; published-копии синхронизированы с каноном)
status: stable
tags: [lcxl, sysex, midi, format]
---

# Custom Mode SysEx Layout

**Summary**: Reverse-engineered формат `.syx`-файлов Components-export для Novation Launch Control XL MK3. Достаточно для программной генерации/правки custom-modes без открытия Components.

**Sources**: byte-diff экспериментов 2026-05-26 над инструмент-модами 1/2/3 и mixer-модами 11/12/13/14 (экспорт из Components, исходники удалены после извлечения знаний; канонические файлы — в `~/Projects/Claude/Fadercraft/custom-modes/`, перенесены из Brain `dist/custom-modes/` 2026-06-01).

**Last updated**: 2026-06-01

---

## Структура файла

Один Custom Mode = **2 последовательных SysEx-сообщения** `F0…F7` в одном `.syx` файле.

```
[F0 00 20 29 02 15 05 00 45 00 7F 20 LEN NAME[LEN] DESC×N LABELS F7] [F0 … F7]
                                     ^^^ name length+chars      ^^^^ msg1 ends
```

### Header (одинаковый для msg1 и msg2)

| Offset | Bytes | Смысл |
|---|---|---|
| 0 | `F0` | SysEx start |
| 1–3 | `00 20 29` | Novation manufacturer ID |
| 4–5 | `02 15` | LCXL MK3 device ID |
| 6 | `05` | Protocol version (?) |
| 7 | `00` | Reserved |
| 8 | `45` | Opcode: write custom mode |
| 9 | `00` (msg1) / `03` (msg2) | Section index внутри мода |
| 10 | `7F` | Reserved |
| 11 | `20` | Name field marker |
| 12 | LEN | **Длина имени мода в байтах** (`0x01` для "1"-"9"/"A", `0x02` для "10"-"14") |
| 13… | NAME | ASCII-имя мода, LEN байт |

> ⚠️ **Length-byte at offset 12 сдвигает весь хвост файла**. Mode "10" двумя символами длиннее, чем "9" — поэтому имя в нашем `10.syx` пока `'A'` (single-byte), payload не сдвинут. Если нужно "10" двумя байтами — пересчитывать все offset'ы.

### Control descriptor (11 байт, повторяется N раз)

```
49 ID 02 X1 X2 [MODE-IDX] X3 X4 CC 7F 00
```

| Поле | Описание |
|---|---|
| `49` | Marker начала descriptor'а ('I' в ASCII) |
| `ID` | Внутренний control ID (encoder/fader/button) |
| `02` | Type marker |
| `X1, X2, X3, X4` | Контрол-специфичные флаги (channel encoding, behavior, color) |
| **MODE-IDX** | Mode-index байт. Для "нормального" контрола = `N − 1` |
| `CC` | MIDI CC# |
| `7F` | Max value |
| `00` | Terminator |

**Mode-index byte** — главный варьирующийся байт для генерации. Для большинства контролов он равен `N - 1` (= 0 для mode 1, 13 для mode 14). Аномалии — см. ниже.

### Labels section (хвост msg2)

После всех descriptor'ов идёт label table. Формат записи:

```
MARKER ID [TEXT]
```

- `MARKER` (1 байт, >= 0x60) — кодирует **длину текста** по формуле:
  `text_len = lower_nibble(MARKER) + 16 * (upper_nibble(MARKER) − 6)`
- `ID` (1 байт) — внутренний control ID
- `TEXT` — ровно `text_len` байт ASCII (0 байт если `text_len == 0`)

**Таблица маркеров (проверено на mode 11):**

| Маркер | text_len | Пример текста |
|--------|----------|---------------|
| `0x60` | 0 | нет метки |
| `0x64` | 4 | `Undo`, `Redo` |
| `0x6A` | 10 | `Mixer Page` |
| `0x6C` | 12 | `Encoder Bank`, `Sends Volume` |
| `0x6D` | 13 | `Launch   Clip` |
| `0x6E` | 14 | `Launch   Scene` |
| `0x6F` | 15 | `Vertical Scroll`, `Horizontal nav.` |
| `0x70` | 16 | `Momentary   Page`, `Momentary   Bank` |
| `0x74` | 20 | `To prev   mixer page` |

> ⚠️ **Маркерный байт кодирует длину, не стиль/цвет.** Прежняя гипотеза «64=стандарт, 66=цвет2, 68=цвет3» — НЕВЕРНА. Маркеры `0x6n`/`0x7n` — это просто длины 0..31 в упакованной форме. Буквы `d/j/l/n/o/m/p` внутри текста меток — НЕ маркеры, т.к. они встречаются ПОСЛЕ первых двух байт (MARKER+ID). Формат самодокументируется длиной.

В наших файлах (mode 11): `60` = no label (энкодеры/фейдеры без имени), `0x64`/`0x6A`/`0x6C`/`0x6D`/`0x6E`/`0x6F`/`0x70`/`0x74` — метки с текстом соответствующей длины.

**Важно:** label-секция НЕ всегда монолитна в конце msg2. В mode 11 структура msg2:
1. 8 дескрипторов (фейдеры `0x28..0x2E` + CC47-контрол `0x2F`)
2. Первая label-часть: no-label для `0x28..0x2E` + `0x6C 0x2F "Sends Volume"`
3. 16 дескрипторов (кнопки `0x30..0x3F`)
4. Вторая label-часть: no-label для `0x30..0x37` + метки для `0x38..0x3F`

Дескрипторы `0x49` и label-записи чередуются двумя блоками, а не идут строго "все дескрипторы, потом все метки".

## Instrument modes (1–10) — overlay listen CC

Per [[Instruments Layer]]: instrument-modes переключаются не CC30, а одной overlay listen CC. **Подтверждено CC47** (не 49 как в default `loadmess 49` из README v1.5 — конфигурация плагина у нашего пользователя переопределяет default). Это видно прямо в файле: descriptor c CC=`0x2F` (=47) хранит static value `10×N`.

**Static value at offset 564** в msg2 = `N × 10` — это значение, которое мод эмитит на CC47 при активации. Плагин ловит это значение и узнаёт, в каком моде сейчас контроллер.

| Mode N | static value | hex |
|---|---|---|
| 1 | 10 | `0x0A` |
| 2 | 20 | `0x14` |
| 5 | 50 | `0x32` |
| 10 | 100 | `0x64` |

Имя инструмент-мода — 1 символ ASCII (`'1'`–`'9'`, `'A'` для mode 10 чтобы не сдвигать payload).

**45 control descriptor'ов на мод** (24 в msg1 = 3 × 8 энкодеров; 21 в msg2 = 8 фейдеров + 13 кнопок). Все имеют одинаковый mode-idx = `N − 1`.

## Mixer modes (11–14) — CC30 ch7

Per [[Mixer Layer]]: переключение по CC30 ch7 (native LCXL mode-select), значение CC30 = `5 + N`. Bank/page/hold кодируются формулой `mode = 23 + bank + 2 · ((page + hold) % 2)`.

Архитектура богаче, чем у instrument-mode'ов. Имя — 2 символа ("11"–"14"). Размер варьируется (664–696 байт) из-за разного объёма label-секции.

### Три класса исключений в mode-index байте (все — designed, НЕ баги)

Изначальная гипотеза «mode-idx = `N − 1` для всех контролов» подтвердилась только для инструмент-модов. У mixer-модов есть три систематических класса исключений — все они симметричны по модам 11–14 и соответствуют [[Mode Encoding]] semantic'е:

1. **`0x0D` = маркер «возврат в предыдущий мод» (намеренный, НЕ артефакт; подтверждено пользователем 2026-06-02).** Descriptors с ID `0x17`, `0x1F`, `0x27` (последний контрол каждого ряда) во ВСЕХ четырёх mixer-mode'ах имеют hardcoded mode-idx = `0x0D`, независимо от N. Этот же `0x0D` встречается в инструмент-моде у descriptor'а с CC=`0x2F` (=47).
   - **Функция:** дескриптор с mode-idx `0x0D` (=13, «индекс мода 14») и **значением 127** — это контрол **возврата**: вызов CC возвращает контроллер в тот мод, в котором был до перехода. Это байтовая реализация `CC47 = 127 → возврат` из [[CC47 Cross-Mode Transit]].
   - `0x0D` — **не литеральная ссылка на mode 14 и не export-артефакт**, а намеренный функциональный маркер: помечает контролы, чьё значение участвует в mode-routing (возврат / mode-report), а не как обычный CC.

2. **`+32` cross-mode capable bit** (7 байт на мод): button descriptors с ID `0x30`–`0x36` во всех 4 mixer-модах имеют mode-idx = `(N − 1) | 0x20`:
   - mode 11 → `0x2A`, mode 12 → `0x2B`, mode 13 → `0x2C`, mode 14 → `0x2D`
   - Бит 5 (`0x20`) = «cross-mode capable» — эти кнопки участвуют в [[CC47 Cross-Mode Transit]] (могут запускать переход в другой mixer-mode с памятью предыдущего состояния).

3. **`linked-bank` references** (7 байт): descriptors с ID `0x28`–`0x2E` в page-1 модах (13 и 14) имеют mode-idx, указывающий на парный bank-1 мод того же bank'а:
   - mode 13 → mode-idx = `0x0A` (= mode 11 - 1)
   - mode 14 → mode-idx = `0x0B` (= mode 12 - 1)
   - Это byte-уровневая реализация формулы hold-возврата `(page + hold) % 2 = 0` из [[Mode Encoding]] — page-1 наследует fader/state от page-0 партнёра.

### Label policy (2026-05-26 onwards)

Моды 1–14 имеют **минимальную label-схему**: только button index (`0`–`?` для buttons 0-15) + `UNDO`/`REDO` на buttons #8/#9. Никаких track-name меток (Kick/Melody/Perc/Shaker и т.п.). **Исключение — mode 15**: он намеренно несёт одну функциональную метку `"Cue Volume"` (это название параметра, не имя трека, поэтому остаётся нейтральным для рассылки). Изначально в mode 15 был ещё track-name `"Perc C"` — снят 2026-06-01 как привязка к конкретному Live Set'у.

Раньше mixer-моды имели asymmetric labels (mode 11 — "Kick", mode 12 — "Kick" + Melody 1/2 + Perc 3 + Shaker, mode 14 — Melody/Perc/Shaker), но их сняли как привязку к конкретной user-конфигурации Live Set'а. Bundle для рассылки должен быть нейтрален — покупатель назовёт треки сам.

После очистки все 4 mixer-мода стали byte-uniform по размеру (664 B каждый, как и инструмент-моды).

### `UNDO`/`REDO` хоткеи

Сохраняются во ВСЕХ модах (instrument 1-10 + mixer 11-14 + mode 15) на buttons #8 и #9 как `64 38 "UNDO"` и `64 39 "REDO"`. Это Cmd-Z / Cmd-Y хоткеи универсально для перформанса.

## Mode 15 — Cue / prelisten volume

15-й мод (добавлен 2026-06-01). Здесь под «listen» настраивается **громкость предпрослушки (cue/prelisten) сэмплов** в Live. В Demo-set'е соответствующий маппинг уже есть (см. залётный `Preview Volume` / cue в палитре маппинга — это и есть целевой параметр mode 15).

| Параметр | Значение |
|---|---|
| Имя мода | `"15"` (2 ASCII-символа, как у mixer-модов) |
| Размер | **670 B** (не byte-uniform с 11–14 из-за метки `"Cue Volume"`) |
| Спец-метка | `6a` (j) `"Cue Volume"` — единственная функциональная подпись |
| UNDO/REDO | на месте, как у всех модов |

**Distribution**: mode 15 кладётся **и в free funnel, и в архив** — наравне с 1–14 (в Demo/Starter bundle'ах `.syx` НЕ лежат — раздаются только через free funnel). Канонический файл: `~/Projects/Claude/Fadercraft/custom-modes/15.syx` (md5 `e1e00f165e1a4ce330201dd0bae578b0`). Published-копии: `app/public/free-custom-modes/15.syx`, `app/dist/free-custom-modes/15.syx` + обе `free-custom-modes.zip` (раздаётся лендингом `fadercraft.com`). Все копии **должны быть byte-identical канону** — синхронизированы 2026-06-10.

### Mode-self-report byte (offset 574, listen-CC=47) — критично, НЕ 30

В дескрипторе listen-контрола (id `0x3a`, паттерн `49 3a 02 11 00 0d 10 00 2f XX 00`, маркер mode-routing `0x0d`, CC `0x2f`=47) байт значения `XX` по **offset 574 (0-based) / 575 (1-based)** обязан быть **`0x6e` = 110** для mode 15.

- Mode 15 self-report'ится на CC47 значением 110; в девайсе под него выделена ветка `m15_ctlin`(`ctlin 47`)→`m15_sel`(`sel 110`)→`m15_save`(msg `15`)→`m15_v`(`v instruments_mode`), плюс прыжок в микшер и возврат `cc47_return_sel` outlet10 → `m15_ret`(msg `28`)→`ctlout 30 7` (CC30=28 = слот 15). Без 110 round-trip «отбой в микшер с памятью origin=15 / возврат» не работает.
- **Почему не N×10:** `15×10 = 150 > 127` (вне MIDI-диапазона), поэтому для mode 15 выбран свободный кратный-10 слот **110** (не ловится overlay-роутером 10..100 и route 1..16 — чистая уникальная метка).
- **Почему `0x1e` (30) — БАГ, а не нейтраль:** значение 30 ловит overlay-роутер инструментов (`inst_sel_enter` = `sel 10 20 30 40 50 60 70 80 90 100`) и читает его как «enter instrument mode 3» — то есть mode 15 коллизирует с инструмент-модом 3 (ровно исходный round-trip-баг). 30 наследовался от шаблона мода 3. Унаследованный `0x1e` сидел во всех published-копиях до 2026-06-10 (исправлено).

## Relative (endless) энкодеры — недоступны в custom mode

**Вопрос:** можно ли в custom-mode'е перевести ряд энкодеров в relative/endless-режим (шлёт «+1/−1» вместо абсолютной позиции)?

**Ответ: нет.** Relative-режим энкодеров на LCXL MK3 существует **только в DAW mode**, не в custom-mode'ах. Подтверждено двумя независимыми источниками:

1. Официальные user-guides Novation ([programmer's DAW mode](https://userguides.novationmusic.com/hc/en-gb/articles/27840466544402-Launch-Control-XL-3-programmer-s-DAW-mode)): «By default encoders are in absolute mode… each row can be independently switched into relative mode» — это раздел именно про DAW mode.
2. Прямой ответ техподдержки Novation на [KVR Controller Scripting Forum](https://www.kvraudio.com/forum/viewtopic.php?t=622318&start=15): relative для энкодеров в custom mode — **зарегистрированный feature-request, ещё НЕ реализован** (по состоянию на 2026-06).

Поэтому в дескрипторе custom-mode'а флага absolute/relative **нет** — байт-diff его не находил не из-за неполноты реверса, а потому что формат custom-mode его не кодирует. Флаги `X1…X4` в дескрипторе (offset см. выше) кодируют channel/behavior/color, но не endless-режим.

### Как relative работает в DAW mode (справочно, не применимо к `.syx`)

- Переключается **per row** (по ряду), не по отдельному энкодеру и не по моду.
- Кодировка: **pivot = `0x40` (64)** = нет движения; `> 64` = по часовой, `< 64` = против. `0x41` (65) = +1 шаг CW, `0x3F` (63) = −1 CCW. CC-номера ряда сдвигаются на +`0x40`.
- Смена режима репортится/задаётся MIDI-событием **Channel 7, CC `0x1E` (30)** — тот же CC30/ch7, что и native mode-select (см. [[Mode Encoding]]).
- Точный SysEx-байт команды переключения ряда **не извлечён** — страницы programmer's reference Novation отдают 403 на машинное чтение, PDF под XL3 — 404. Достоверны: факт per-row relative, кодировка pivot-64, канал CC30/ch7.

**Следствие для Fadercraft:** `XL_Performance` построен на custom-mode'ах → endless-ряд внутри него **недостижим**, пока Novation не добавит фичу. Единственный путь к relative — уводить поверхность в DAW mode (другая модель интеграции, не custom-mode `.syx`). См. также [[Custom Modes Model]].

## Pipeline генерации (instrument modes)

Скрипт читает один reference-mode (например `custom-modes/1.syx`, 662 байта), для каждого N ∈ 1..10:

1. Копирует payload целиком
2. Меняет 2 байта имени (offsets 13 и 340 — в обеих секциях) на ASCII digit
3. Меняет 45 mode-index байт (24 в msg1 + 21 в msg2 на фиксированных смещениях step=11) на `N - 1`
4. Меняет 1 байт на offset 564 на `N × 10`

**Validation pipeline**: пользователь экспортирует mode 1, 2, 3 из Components → `cmp -l` находит ровно 48 различающихся байт между ними → формула выводится → mode 4–10 синтезируются → byte-identical check vs reference подтверждает корректность для известных модов (1, 2, 3).

## Pipeline для mixer modes (НЕ автоматизирован)

Mixer-mode'ы НЕЛЬЗЯ синтезировать тем же простым substitution-pipeline'ом из одного reference'а, потому что:

- Размер варьируется (664–696 байт) из-за label-секции
- Mode-idx байт имеет три разных "режима" (self, anchor, cross-page) на разных descriptor'ах
- Bank/page структура требует понимания, какие контролы наследуются, какие "+32 flag", какие anchor

Для генерации новых mixer-модов: экспортить из Components вручную **либо** написать отдельный pipeline с учётом всех трёх классов исключений (нужны минимум 4 reference-файла на все комбинации bank × page).

## Related pages

- [[Custom Modes Model]] — высокоуровневая модель 14 модов
- [[Mode Encoding]] — как CC30 ch7 кодирует переключение мода
- [[Instruments Layer]] — секция патча для модов 1–10
- [[Mixer Layer]] — секция патча для модов 11–14
- [[CC47 Cross-Mode Transit]] — кросс-режимный переход с памятью
- [[Novation XL]] — корневой хаб проекта
