---
type: concept
project: Novation
created: 2026-05-26
updated: 2026-05-26
status: stable
tags: [lcxl, midi, sysex, format]
---

# Custom Mode SysEx Layout

**Summary**: Байт-уровневая структура `.syx`-файлов кастом-модов LCXL MK3, reverse-engineered методом diff пользовательских экспортов из Components. Описывает, какие байты что значат, как mode-index пробрасывается по контролам, и какие «аномалии» (always-13, +32 flag, linked-bank) на самом деле являются design-паттернами для cross-mode transit.

**Sources**: эмпирический диф `1.syx`/`2.syx`/`3.syx` (инструмент-моды) и `11.syx`–`14.syx` (mixer-моды), верифицировано экспортами из Novation Components. Спека Novation **не публична** — это reverse-engineering.

**Last updated**: 2026-05-26

---

## Файл = две SysEx-сообщения

Каждый `.syx`-файл одного мода содержит **два последовательных `F0…F7`-сообщения**:

- **msg1**: ~327–332 байта — header + 24 encoder descriptor (3 ряда × 8 энкодеров).
- **msg2**: ~335–364 байта — ~24 button/fader descriptor + label-секция в конце.

Размеры варьируются на ±30 байт из-за переменной длины labels (длинные текстовые метки = больше байт).

## Header (12–13 байт)

```
F0 00 20 29 02 15 05 00 45 00 7F 20 <NAME_LEN> <NAME_CHAR(S)> 49 …
^                              ^         ^             ^
сысекс    Novation/LCXL         ?         length        первый control descriptor (0x49 = маркер)
```

| Offset | Байт | Назначение |
|---|---|---|
| 0–2 | `F0 00 20 29` | SysEx start + Novation manufacturer ID |
| 4–5 | `02 15` | LCXL MK3 device family |
| 6 | `05` | Протокол/версия |
| 7 | `00` | ? (всегда 0 в наблюдаемых файлах) |
| 8 | `45` | Opcode «write custom mode» |
| 9 | `00` | ? (всегда 0 в msg1) |
| 10 | `7F` | ? (всегда 0x7F) |
| 11 | `20` | ? (всегда 0x20) |
| 12 | `<NAME_LEN>` | Длина имени мода в байтах (1 для «1»–«9»+«A», 2 для «11»–«14») |
| 13… | `<NAME_CHAR(S)>` | ASCII-имя мода |

**Важно:** длина имени напрямую сдвигает все последующие offset'ы. Для инструмент-модов (имя 1 байт) первый control descriptor на offset 14; для mixer-модов (имя 2 байта) — на offset 15.

## Control descriptor (11 байт каждый)

Описывает один физический контрол (энкодер, фейдер, кнопка):

```
49 <ID> 02 <T1> <T2> <MODE-IDX> <FLAGS> 00 <CC> <MAX> <TERM>
```

| Поле | Размер | Что |
|---|---|---|
| `0x49` | 1 | Маркер начала descriptor'а (литерал `'I'`) |
| `ID` | 1 | ID контрола (0x10+ для энкодеров row 1, 0x18+ для row 2, 0x20+ для row 3, и т.д.) |
| `0x02` | 1 | Тип descriptor'а (= 2 для большинства) |
| `T1`, `T2` | 2 | Подтип/behavior (absolute/relative encoder, momentary/toggle для кнопок). Семантика байта не до конца понятна; зависит от семейства контрола. |
| `MODE-IDX` | 1 | Mode-index (см. ниже — у большинства = `N-1`, у некоторых hardcoded) |
| `FLAGS` | 1 | Color/LED flags (например, `0x08` — стандартный цвет) |
| `0x00` | 1 | Разделитель/channel high-nibble |
| `CC` | 1 | Номер CC (или note), который контрол отправляет |
| `MAX` | 1 | Максимальное значение (обычно `0x7F` = 127) или `0x02 0x01` для специальных типов |
| `TERM` | 1 | `0x00` или `0x01` — конец descriptor'а |

В мoде ~45 таких descriptor'ов: 24 в msg1 + 21 в msg2.

## MODE-INDEX байт: правило и исключения

**Правило:** у большинства descriptor'ов `MODE-IDX = N − 1`, где N — номер мода (1..14). Так LCXL/плагин знает, какому моду принадлежит контрол.

**Исключения (систематические паттерны, НЕ баги):**

### Hardcoded 0x0D (= 13) — «метаданные»
- **Один descriptor в инструмент-моде** (ID 0x3A, CC=0x2F=47, holds static mode value) — содержит **value байт = N×10**, который LCXL шлёт на overlay listen CC при активации мода. См. [[Mode Encoding]].
- **Три descriptor'а в mixer-моде** (msg1 позиции #7, #15, #23 = последние энкодеры каждого ряда) — `MODE-IDX = 0x0D` во всех 4 mixer-модах.

Скорее всего `0x0D` здесь работает не как «принадлежит моду 14», а как **маркер «metadata/special control»** в этом байтовом поле.

### +32 flag (`MODE-IDX = (N-1) | 0x20`) — cross-mode transit
Группа из 7 button descriptor'ов (ID 0x30–0x36) в каждом mixer-моде имеет `MODE-IDX = (N-1) + 0x20`:
- mode 11: 0x2A
- mode 12: 0x2B
- mode 13: 0x2C
- mode 14: 0x2D

Это контролы, участвующие в [[CC47 Cross-Mode Transit]]. Бит 5 (0x20) — флаг «cross-mode capable».

### Linked-bank reference в mixer-модах 13/14
В модах 13 и 14 (page=1) есть band из 7 descriptor'ов (ID 0x28–0x2E), у которых `MODE-IDX` указывает на **парный bank-1 мод**:
- mode 13 → `0x0A` (= 11-1, ссылка на mode 11)
- mode 14 → `0x0B` (= 12-1, ссылка на mode 12)

Реализует логику hold: при удержании page-кнопки мод 13/14 «возвращается» на соответствующий мод 11/12 ([[Mode Encoding]] formula `(page+hold)%2`).

## Label section (конец msg2)

После всех control descriptor'ов идёт таблица меток. Каждая запись:

```
<TYPE> <BUTTON_ID_CHAR> <LABEL_TEXT>
```

| Type | Hex | Назначение |
|---|---|---|
| `` ` `` | `0x60` | No label (только индекс кнопки) |
| `d` | `0x64` | Standard text label (используется для UNDO/REDO) |
| `f` | `0x66` | Alt label type 1 (наблюдается на track-name метках) |
| `h` | `0x68` | Alt label type 2 (наблюдается на track-name метках) |

`BUTTON_ID_CHAR` — ASCII-символ ID кнопки. Например, кнопка #8 представлена как `8` (= 0x38), #9 как `9` (= 0x39), #15 как `?` (= 0x3F), и т.д. До #16 ASCII-диапазон совпадает с printable.

Стандартные хоткеи в наблюдаемых модах: `d8UNDO d9REDO` — UNDO на кнопке 8, REDO на кнопке 9 (Cmd+Z / Cmd+Y в Live).

## CRC / checksum

**Нет.** Диф `1.syx ↔ 2.syx ↔ 3.syx` показал ровно 47 различающихся байт; если бы был CRC, изменился бы ещё минимум один (контрольный) байт. Это упрощает программную модификацию.

## Алгоритм генерации мода N из mode-1-template (инструмент-моды)

1. Прочитать `template.syx` (1 мод 1).
2. Для каждого N ∈ 1..10:
   - Установить байт `12` (name length) — `0x01` для имён 1–9 + 'A'.
   - Установить байт `13` (name char) — ASCII цифра или `'A'` для N=10.
   - Установить байт `340` (name char в msg2) — копия `13`.
   - Установить байт `564` (static mode value) — `N × 10`.
   - Установить 45 байт mode-index = `N − 1` на offsets:
     - msg1: `19, 30, 41, … +11` (24 значения)
     - msg2: `346, 357, …` (21 значение, в трёх band'ах с гэпами)
3. Записать как `N.syx`.

Sanity-check: сгенерированные `mode-01/02/03` совпали byte-в-byte с пользовательскими референс-экспортами из Components.

Для mixer-модов (имя=2 байта) все offset'ы сдвинуты на +1.

## Что НЕЛЬЗЯ из формата вывести

- Точная семантика байтов `T1`, `T2`, `FLAGS` — требует пары экспортов с одним и тем же контролом в разных конфигурациях для diff.
- Поведение absolute vs relative encoder в байт-кодировке.
- Channel encoding — не локализовано однозначно.
- Размер max-value поля (1 или 2 байта в зависимости от типа контрола).

Для полной декодировки нужно либо публичная спека Novation (нет на 2026-05-26), либо ещё пара десятков diff'ов между парами модов с известным отличием в одном параметре.

## Related pages

- [[Custom Modes Model]] — высокоуровневая модель 14 модов
- [[Mode Encoding]] — формула `23 + bank + 2*((page+hold)%2)` и таблица CC30
- [[Instruments Layer]] — overlay listen CC (default 49, в нашей конфигурации 47)
- [[Mixer Layer]] — bank/page/hold
- [[CC47 Cross-Mode Transit]] — поведение transit между bank/page
- [[XL_Performance — как это работает]] — корневое описание устройства
- [[Novation XL]] — хаб проекта
