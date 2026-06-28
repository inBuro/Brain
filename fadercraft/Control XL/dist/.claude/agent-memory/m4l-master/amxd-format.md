---
name: amxd-format
description: Проверенный байт-рецепт распаковки/пересборки .amxd-контейнера Control XL (mx@c + dlst/dire, какие size-поля править)
metadata:
  type: reference
---

Проверено на Control XL device (md5 `edd4bf55…`→`211ed6f8…`, 2026-06-10).
`.amxd` = `ampf` контейнер с одним `ptch`-чанком, внутри `mx@c`-обёртка + JSON-патчер + встроенные текст-блобы (`*.js`) + `dlst`/`dire` директория.

## Раскладка байт (этот девайс)
```
[0:4]   'ampf'
[4:8]   LE u32 = 4
[8:12]  'mmmm'
[12:16] 'meta'
[16:20] LE 4 ; [20:24] LE 7
[24:28] 'ptch'
[28:32] LE u32 PTCH_LEN = total - 32              <-- ПРАВИТЬ
[32:36] 'mx@c'
[36:40] BE 0x10 ; [40:44] BE 0
[44:48] BE u32 MXC_SIZE = total - 32 - 332         <-- ПРАВИТЬ (332 = размер dlst-хвоста)
[48:..] JSON-патчер (UTF-8), кончается на '}' (последняя фигурная)
        затем 1 байт \x00 (разделитель)
[.. ]   version_check.js (UTF-8, без рамки, плотно)
[.. ]   solo_follower.js (UTF-8, плотно)
[..end] 'dlst' BE size(332) + три 'dire'-записи
```
ВАЖНО: dire `of32` (offset) для JSON-блоба СТАРЫЙ/неточный — Max грузит JSON brace-matching'ом, не по of32. Но `sz32` блобов БАЙТ-ТОЧНЫЕ (JSON sz32 = len(json)+1 за счёт \x00-разделителя; js sz32 = ровно длина текста js).

## dire-директория (хвост, big-endian)
Три записи, каждая dire-чанк size=108, содержит под-чанки `type`(JSON/TEXT) `fnam`(имя) `sz32` `of32` `vers` `flag` `mdat`.
Под-чанк значения: `<tag>` + BE size(=12) + BE value(4 байта). Значение читать как `BE u32` по offset(tag)+8.
- запись1 `XL_Performance.amxd` (=JSON-блоб): sz32, of32=16
- запись2 `version_check.js`: sz32, of32
- запись3 `solo_follower.js`: sz32, of32

## Какие поля править при изменении блоба на N байт
Если шринкуешь/растишь блоб X на N (delta = old-new, >0 = убрали):
1. `PTCH_LEN` @28 (LE) -= N
2. `MXC_SIZE` @44 (BE) -= N   (mx@c покрывает JSON+все js до dlst)
3. `sz32` блоба X -= N  (BE, по позиции value)
4. `of32` КАЖДОГО блоба, идущего ПОСЛЕ X в файле -= N (он сдвинулся раньше)
5. sz32/of32 блобов ДО X — не трогать. dlst/dire структурные size(108, 332) — не трогать.

## Алгоритм правки (Python)
- Найти границы блобов по контенту, НЕ по of32: JSON `[48: last-'}'+1]`; js — по характерным маркерам начала (`// Fadercraft`, `autowatch = 1`) и по `dlst`.
- Собрать новый буфер: `data[:Xstart] + new_blob + data[Xend:]`.
- Запатчить 5 групп полей выше (позиции dire-полей в новом буфере сдвинуты на -N т.к. они за точкой правки).
- ВАЛИДАЦИЯ перед подменой: JSON region байт-идентичен (если не трогали патчер); JSON парсится; `PTCH_LEN == newtotal-32`; `MXC_SIZE == newtotal-32-332`; блобы ДО точки правки байт-идентичны; sz32 блоба == измеренной длине; в хвосте отличаются РОВНО байты обновлённых sz32/of32; скан всего файла на u32==старые размеры не находит «забытых» полей.

## Грабли
- `len(js_str) != len(js_bytes)` если есть многобайтовые символы (em-dash `—` в version_check.js). Считать N в БАЙТАХ.
- brace-match по всему файлу врёт (js-блобы содержат `{}`). Ограничивай поиск конца JSON диапазоном до `dlst`.
- `of32` базы не совпадают с файловыми offset напрямую (смещены на +32); неважно — обновляй дельтой, не абсолютом.

## Слоты Control XL (5 на диске + 4 в зипах)
Девайс копия-в-копию в 5 местах (все byte-identical):
- `dist/Control XL Demo Project/Control XL.amxd` (+ `/Max Devices/`)
- `dist/Control XL Starter Project/Control XL.amxd` (+ `/Max Devices/`)
- `~/Music/Ableton/User Library/Max Devices/Control XL.amxd` (рабочая копия Ableton)
Зипы (`dist/*.zip`): обновлять только 2 amxd-записи через `cd <stage> && zip -X -q <zip> "<in-zip path>"` (freshen существующих entry); остальное дерево уже верное — не пересобирать с нуля.
