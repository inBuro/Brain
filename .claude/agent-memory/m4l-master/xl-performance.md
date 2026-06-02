# XL_Performance — факты по флагману

M4L-роутер для Novation Launch Control XL MK3. Переключает кастом-моды LCXL и роутит CC под Ableton-перформанс.

## Пути
- Девайс: `/Users/Kirill/Music/Ableton/User Library/Max Devices/XL_Performance.amxd`
- Архив: `…/Max Devices/Archive/` (`XL_Performance.YYYY-MM-DD[-HHMMSS].amxd`)
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

## Журнал правок
### 2026-06-02 — вычищены все debug-принты
- Удалены все 14 `print`-объектов из патча (+ 32 входящих шнура): `inst_p_*` (selected_in/non_return/ignored_zero/enter_route/back_hit/route_mode/overlay_mode_cc30/out_pair), `cc47_print_*` (save/return/enter/track/raw), `init_mode11_print`. Все терминальные (нет выходов) → удаление не рвёт цепочки. Length-preserving (Путь A), `solo_follower`/`dlst`/suffix целы.
- `version_check.js` `maxApi.post` (`version check: … -> dot 0`) **оставлен по просьбе** — полезный, раз в 30 мин, не спамит. `solo_follower.js` в консоль не пишет вообще. Итог: ушёл весь per-event спам Max-принтов, осталась одна осмысленная строка version-check на проверку.
### 2026-06-02 — round-trip для кастом-мода 15
Баг: с мода 15 «back to mixer» → «back to previous» возвращал в мод 3. Причина: `15.syx` кнопка перехода (CC47, ctrl `0x3a`) слала значение `30` (= мод 3), унаследованное от шаблона мода 3; а `15×10=150 > 127` (MIDI), и в транзите не было слота под 15.

Фикс:
1. **15.syx**: байт значения ctrl `0x3a` (file offset `0x23E`) `0x1e → 0x6e` → теперь эмитит **CC47 = 110** (уникальная метка мода 15; кратно 10, не ловится overlay-роутером 10..100). Бэкап: `custom-modes/15.syx.backup-*`.
2. **XL_Performance.amxd**: добавлена ветка для 110:
   - новые объекты: `m15_ctlin` (`ctlin 47`) → `m15_sel` (`sel 110`); match → `m15_save` (msg `15`) → `m15_v` (`v instruments_mode`) [запоминает origin=15]; match → `cc47_last_mixer_cc30` левый вход [прыжок в микшер];
   - `cc47_return_sel`: `sel 1 2 3 4 5 6 7 8 9 10` → `sel 1 2 3 4 5 6 7 8 9 10 15` (numinlets/outlets 11→12); новый выход 10 (match «15») → `m15_ret` (msg `28`) → `cc47_return_ctlout` (`ctlout 30 7`) [CC30=28 → слот 15].
   - Архив до правки: `Archive/XL_Performance.2026-06-02-154032.amxd` (218415 B). После пересборки файл ~169 КБ (компактный JSON, данные те же).

Распределение (free funnel / bundle / published `app/public/free-custom-modes/15.syx` + zip) НЕ трогалось — это деплой-шаг, делать отдельно по явному «ship» (см. правило no-auto-deploy в основной памяти).

**Грабли той же правки (исправлено в тот же день):** первая пересборка шла без сохранения длины JSON (ΔL=−49520) и не патчила `dlst` → встроенный `solo_follower.js` уехал, Max выдал `js: malformed UTF-8 at offset 0` и `no function msg_int/bang [solo_follower.js]`, а после раз-/заморозки потерял скрипт. Лечение: пересборка Путём A (длина JSON сохранена паддингом) из чистого архива — `solo_follower.js`/`dlst`/хвост байт-в-байт целы. Девайс — **frozen** (зависимости внутри); пользователю не нужно freeze/unfreeze. Деталь формата — см. [amxd-format.md](amxd-format.md) «КРИТИЧНО: dlst».

### 2026-06-02 — version-check восстановлен + стартовая гонка убрана
- Потерянный `version_check.js` (Node for Max, фича собрана 2026-06-01) восстановлен из `raw/`, положен рядом с девайсом (`Max Devices/version_check.js`). Работает с диска (в freeze пока НЕ вшит — нужно для рассылки). Деталь: wiki `[[Version Check (Update Notifier)]]`.
- Убран `vdot_loadtrig` (`loadmess check`) + его шнур к `version_node`: стрелял `check` до подъёма Node → `node.script not ready can't handle message check`. Скрипт сам триггерит `check()` при старте Node + каждые 30 мин, патчевый loadmess был избыточен. Пересборка length-preserving (Путь A) из текущего файла; `solo_follower.js`/`dlst`/suffix целы.
- Пред-существующая (не моя) `node.script can't find version_check.js` была следствием именно отсутствия файла на диске — закрыта восстановлением скрипта.
