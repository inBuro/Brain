---
name: controlxl-project-map
description: Полная карта всех слотов девайса Control XL (.amxd) — что обновлять при «обновить девайс», инвариант байт-в-байт, эталон md5, zip-деливераблы. Читать ВСЕГДА при любой правке/пропагации Control XL.
metadata:
  type: project
---

# Control XL — карта проекта (все слоты девайса)

Пользователь требует: я держу эту карту в памяти и сам обновляю все нужные файлы при «обновить девайс» — без передачи путей вручную. См. также [[xl-performance]].

## ИНВАРИАНТ (железно)
Один и тот же `.amxd` (единый эталон) обязан быть **БАЙТ-В-БАЙТ идентичен во всех device-слотах**. Проверка = md5 всех слотов совпадают с эталоном.
- Инвариант относится ко ВСЕМ слотам, включая User Library (слот 2) — но синхронизация User Library инициируется ТОЛЬКО явно (см. ниже). Когда User Library синхронизирован, он тоже = эталон байт-в-байт.

## ⚠️ РАЗВОРОТ ПРАВИЛА 2026-06-06 (8): USER LIBRARY = ОСНОВНОЙ РЕДАКТИРУЕМЫЙ АРТЕФАКТ
Прежнее правило (слот 1 проектный эталон = источник правок; слот 2 User Library = explicit-only deploy-таргет) **ОТМЕНЕНО**. Новое правило пользователя:
- **Слот 2 (User Library) = основная канонная рабочая копия. ВСЕ правки идут СЮДА:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd`.
- **Pre-edit backup ОБЯЗАТЕЛЕН ВСЕГДА** перед каждой правкой: архив этого User Library .amxd с датой-временем → `~/Brain/Fadercraft/raw/archive/Control XL.YYYY-MM-DD-HHMMSS.amxd` (не перезаписывать).
- **Propagate-only-on-command:** копирование/пропагация дальше (слот 1 репо-эталон, слоты 3–6, zip) — ТОЛЬКО по явной команде «копируй дальше»/«пропагируй». Никакой автопропагации.

## ⛔ BROWSER LOAD ОТЛОЖЕН + ПОЛНЫЙ ОТКАТ 2026-06-06 (14) — все слоты = `44aa142b`
**Фича Browser Load (CC51) свёрнута/отложена по решению пользователя; откат выполнил пользователь сам (я .amxd НЕ трогаю).** Причина сворачивания: Live Browser (`browser`/`load_item`/`hotswap_target`/`BrowserItem`) **НЕ выставлен в M4L LiveAPI** (подтверждено на Live 12.4.1 — см. [[reference_m4l_no_browser_api]]). Загрузка выделенного браузер-item из `.amxd`-девайса НЕВОЗМОЖНА — только через Python MIDI Remote Script. Если вернёмся к фиче — делать в remote-script (у пользователя декомпилированный LCXL remote-script, см. [[reference_lcxl3_remote_script]]), НЕ в M4L.

**ТЕКУЩЕЕ СОСТОЯНИЕ ПОСЛЕ ОТКАТА (все артефакты консистентны):**
- **ВСЕ 6 слотов Control XL = `44aa142b198b6001613db3b29c36cc38`** (чистая до-фичная версия, без `bl_*` / `deferlow bl_defer` / UI-кнопки `bl_ui_btn` / ссылки на browser-js).
  - Слот 2 User Library восстановлен на `44aa142b` (был `0fc224e4`/`095885b6`/`63d95bbe` в ходе попыток).
  - Слот 1 проектный эталон восстановлен на `44aa142b` (был `63d95bbe` с ранней нерабочей Browser Load).
  - Слоты 3–6 — оставались `44aa142b` (Browser Load их не касался).
- **Удалены scratch-js** (`browser_load.js`, `fc_browserload.js`, `fc_bload2.js` + их `.backup-*`) из User Library Max Devices и из project device. `version_check.js` и `SendsFollower.amxd` НЕ тронуты.
- **Архивные бэкапы со всей историей попыток Browser Load** сохранены в `~/Brain/Fadercraft/raw/archive/` (`Canon-`/`UserLib-`/`Control XL.*` с датами 2026-06-06) — если фича вернётся, история там.

### История (отменено): расхождение версий «закрыто» 2026-06-06 (9) — Browser Load в User Library
~~Browser Load доставлен в User Library; User Library = `63d95bbe623f9238f48bccdcd7e96c92` (271 box / 410 line, с `bl_*` + `browser_load.js` рядом на диске).~~ **ОТКАЧЕНО (14) — см. выше. Все ссылки на `63d95bbe`/`0fc224e4`/`095885b6` как актуальные — недействительны.**

### История: ⚠️ USER LIBRARY = EXPLICIT-ONLY (ОТМЕНЁННОЕ правило, было 2026-06-06 ранее)
Слот 2 (User Library) считался рабочим live-инсталлом, который нельзя неожиданно перезаписывать. По прежнему правилу:
- User Library НЕ входил в автоматическую «обновить девайс»; трогать только по явной команде.
- Автопропагация шла на слот 1 (источник правок) + слоты 3–6. **Это правило больше не действует — см. разворот выше.**

**Текущий эталон (на 2026-06-06):**
- md5: `44aa142b198b6001613db3b29c36cc38`
- размер: `211548` B
- лейбл page «Bank» (бывш. «Bank fx»)
- граф: 267 box / 408 line
- содержит: мод-15 (QUE/prelisten round-trip), version-check, prelisten, frozen-in `solo_follower.js` + `version_check.js`
- Никаких отдельных старых билдов в Router-слотах. Огрызки прошлых версий неактуальны.

## ВСЕ СЛОТЫ (куда пропагировать)
| # | Роль | Путь | Имя файла |
|---|------|------|-----------|
| 2 | **User Library — ОСНОВНОЙ РЕДАКТИРУЕМЫЙ АРТЕФАКТ** (правила 2026-06-06 (8)); md5 **`6a348306`** (актуальный эталон 2026-06-27 22:58, 264344 B, frozen пользователем после CPU-fix) | `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 1 | **Проектный репо-эталон** (propagate-target, only-on-command); md5 **`275c016a`** (НЕ синхронизирован — пропагация по команде) | `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd` | `Control XL.amxd` |
| 3 | Demo bundle main | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Demo Project/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 4 | Demo bundle Router (ссылка из `Router.als`, type-1 relative) — РАСКЛАДКА АКТУАЛЬНА: `Control XL.amxd` в КОРНЕ dist-проекта (НЕ `XL_Performance.amxd`) | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Demo Project/Control XL.amxd` | `Control XL.amxd` |
| 5 | Starter bundle main | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Starter Project/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 6 | Starter bundle Router (ссылка из `Router.als`, type-1 relative) — `Control XL.amxd` в КОРНЕ dist-проекта | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Starter Project/Control XL.amxd` | `Control XL.amxd` |

## ПРАВИЛА СТРУКТУРЫ (нюансы)
- **Имена файлов в бандлах НЕ менять.** Main-сеты ссылаются на `Control XL.amxd`; `Router.als` — на `XL_Performance.amxd`. В оба слота кладётся ОДИН И ТОТ ЖЕ эталон, только под разными именами. (Слоты 4 и 6 = тот же байт-в-байт эталон, имя файла другое.)
- **`raw/Demo-set Project/` — рабочий мастер-Ableton-проект, НЕ shipping.** Его встроенный `Max Devices/XL_Performance.amxd` (218417 B, frozen, старый граф 277/435) в zip-дистрибутивы НЕ попадает и в пропагацию НЕ входит. Реальные дистрибутивы собираются из `dist/`-папок. `raw/` неизменяем — только читать.
- Огрызок `XL_Performance.amxd` 150220 B (прошлый) больше не актуален — заменён эталоном.

## ZIP-ДЕЛИВЕРАБЛЫ (публикация пользователям)
- `/Users/Kirill/Brain/Fadercraft/dist/Fadercraft Control XL v1.1 - Demo.zip` (201132046 B, md5 `090ecde4`, пересобран 2026-06-23 с обновлёнными .syx)
- `/Users/Kirill/Brain/Fadercraft/dist/Fadercraft Control XL v1.1 - Starter.zip` (244621 B, md5 `d08e008b`, пересобран 2026-06-23 с обновлёнными .syx)
- Старые v1.0 zip остались в dist/ (не удалять без команды).
- Внутр. структура zip: верхняя папка `Fadercraft Control XL v1.1 - {Demo,Starter}/` → `Control XL {Demo,Starter} Project/` → те же файлы, что в dist-папке + папка `15 Custom Modes/` с 15 .syx.
- ⚠️ ГРАБЛИ ZIP Demo: Demo Project содержит `Router.als` в корне папки проекта на диске — при сборке через rsync он попадает внутрь; в финальный zip его надо ИСКЛЮЧИТЬ (`-x "*/Control XL Demo Project/Router.als"`). В корне zip `Router.als` должен быть ОДИН (взятый из dist-папки проекта).
- **Пересборка zip = ОТДЕЛЬНЫЙ публикационный шаг.** Делать ТОЛЬКО по явной команде (правила: no-auto-deploy + version-bump→Gumroad-proof). Никогда автоматически.

## ПРОЦЕДУРА правки (правила 2026-06-06 (8); итеративная — см. [[feedback-iterative-no-versionlog]])
1. **Pre-edit backup ВСЕГДА:** архив текущего User Library `.amxd` (слот 2) → `~/Brain/Fadercraft/raw/archive/Control XL.YYYY-MM-DD-HHMMSS.amxd` (не перезаписывать).
2. Правку делаю **прямо в User Library (слот 2)**.
3. Валидация пересборки (re-parse JSON, счётчики box/line, хвост байт-в-байт, инварианты размеров). Не сошлось — откат к архиву.
4. **СТОП.** Слоты 1, 3–6 и zip НЕ трогаю. Пропагация дальше — ТОЛЬКО по явной команде «копируй дальше»/«пропагируй».
5. **Обновить КРАТКИЙ current-state** (md5 + объекты + проводка) одним актуальным срезом — перезаписать, не копить историю версий. БЕЗ журнала/log-записи на каждую правку и БЕЗ wiki на микро-шаг (правило [[feedback-iterative-no-versionlog]]). Развёрнутая wiki — только на финализации фичи или по явной просьбе.
6. В отчёте: что изменил, путь архива, тест в Live + напоминание перезагрузить девайс (кеш Live; Max-редактор закрывать без сохранения).

### Explicit-only шаг: «копируй дальше» / «пропагируй»
Только по явной команде. Тогда: заархивировать целевые слоты с датой-временем → скопировать User Library .amxd байт-в-байт в указанные слоты (1 и/или 3–6, имена файлов слотов соблюдать) → md5 целей = источник. zip — отдельный публикационный шаг.

## ⚠️ АКТУАЛЬНЫЙ ЭТАЛОН с 2026-06-27 (22:58, CPU-fix freeze by user): `6a3483061bc05bc7a24a1548569a7402` (264344 B) — СЛОТЫ 2,3,4,5,6 СИНХРОНИЗИРОВАНЫ; СЛОТ 1 НЕ СИНХРОНИЗИРОВАН
Пользователь зафризил User Library 2026-06-27 22:58 после CPU-runaway fix (solo_follower.js: debounce 1ms→50ms, удалён `new LiveAPI("live_set view")` на каждый apply). Пропагация выполнена 2026-06-27 23:08 в слоты 3–6 (dist bund). Слот 1 НЕ трогался.
**dlst этого файла: 3 ресурса (Control XL.amxd JSON + nav_track.js + solo_follower.js).** `version_check.js` (node.script, embed:0) в dlst НЕТ — лежит рядом на диске. В dist-папках и зипах `version_check.js` теперь кладётся РЯДОМ с `.amxd` в обоих слотах (корень проекта + Max Devices/).
Граф: 331 box / 477 line.
Zip-деливераблы пересобраны: Starter `d3192494` (265621 B), Demo `3639754b` (201136254 B). Архивы бандл-слотов до sync: `raw/archive/Control XL.2026-06-27-235900-pre-sync-slot{3,4,5,6,6-starter-root,5-starter-maxdev,4-demo-root,3-demo-maxdev}.amxd`. Архивы старых zip: `raw/archive/Fadercraft Control XL v1.1 - {Demo,Starter}.2026-06-27-235900-pre-rebuild.zip`.
⚠️ `.als` файлы (OriginalFileSize/CRC) НЕ обновлялись — при несовпадении CRC/Size Live находит файл по RelativePath и обновляет метаданные при следующем save сета.

## ⚠️ ПРЕДЫДУЩИЙ ЭТАЛОН 2026-06-23 (14:38, user-edited): `ab9b2cf13664cb8b3ead5477a0ddb462` (260154 B)
Пользователь вручную изменил User Library 2026-06-23 14:38. Пропагация выполнена 2026-06-23 14:42 в слоты 3–6 (dist bund). Zip-деливераблы: Starter `cff3321f` (244616 B), Demo `ac5040c9` (201114565 B). Архивы: `raw/archive/Control XL.2026-06-23-144024-pre-sync-slot{3,4,5,6}-*.amxd`, зипы `raw/archive/Fadercraft Control XL v1.1 - {Demo,Starter}.2026-06-23-144024-pre-rebuild.zip`.
**2026-06-23 (16:27): .als файлы обновлены.** `OriginalFileSize`+`OriginalCrc`: `size=255775 crc=12801` → `size=260154 crc=63244`. Архивы pre-edit: `raw/archive/Control XL Demo.2026-06-23-162759-pre-als-update.als`, `Router-Demo.*`, `Control XL Starter.*`, `Router-Starter.*`. ⚠️ ALS-формат: `OriginalCrc` = `binascii.crc_hqx(data, <init>)` (CRC-CCITT BinHex); `init` зависит от контекста — Live сам вычисляет при save.

## ⚠️ ПРЕДЫДУЩИЙ ЭТАЛОН 2026-06-23 (14:31): `275c016a9ff93fbb5cdd30c7d4ba7594` (203266 B, DEVICE_VERSION='1.1') — был во всех 6 слотах
Пропагация выполнена 2026-06-23 14:31. Девайс **FROZEN**, 4 ресурса в dlst: JSON-патчер + version_check.js + solo_follower.js + nav_track.js. Граф: 332 box / 477 line. Прежний эталон `11733d4d` (255775 B, 2 JS вшитых, без nav_track) заменён. Архивы pre-sync: `raw/archive/Control XL.2026-06-23-143121-pre-sync-slot{1,3,4,5,6}-*.amxd`. Zip-деливераблы пересобраны: Starter `9d0957b4` (242983 B), Demo `4a4b8714` (201112932 B). Архивы старых zip: `raw/archive/Fadercraft Control XL v1.1 - {Demo,Starter}.2026-06-23-143257-pre-rebuild.zip`. ⚠️ внешние JS (version_check.js + solo_follower.js) в dist-папках НЕ нужны — девайс FROZEN (самодостаточен). Прежний «Вариант B» (JS рядом) отменён.

## ⚠️ ПРЕДЫДУЩИЙ ЭТАЛОН 2026-06-23 00:52: `11733d4ddbbfa9ace4748a3007b3f8f4` (255775 B, DEVICE_VERSION='1.1', FROZEN, 2 JS)
DEVICE_VERSION бамп 1.0→1.1 (Clear Sends automation-aware). Прежний эталон `d1b2b29b` (244469 B, UNFROZEN, 2026-06-22) заменён. Архивы: pre-bump User Library `raw/archive/Control XL.2026-06-23-005226-pre-version-bump-1.1.amxd`, pre-sync repo canon `raw/archive/Control XL.2026-06-23-005238-pre-sync-repo-canon-v1.1.amxd` (`d1b2b29b`).
⚠️ Для рассылки правильный шаг = FREEZE через Max Editor (вшивает JS в dlst), а не внешние файлы. Текущий Вариант B — временный workaround до заморозки.

## ПРЕДЫДУЩИЙ ЭТАЛОН 2026-06-10 (IV): `28840e394da60839f71c33c39e0922ec` (212123 B, 271 box / 413 line)
**Вернули диагностический `maxApi.post` в `version_check.js` (продакт решил, что полезен — видеть статус апдейт-детекта в Max Console).** vc 2933→3100 B (dL=+167, Путь B по хвосту). Все 6 слотов = `28840e39` (explicit-пропагация), оба зипа Demo/Starter пересобраны. JSON-патчер (271/413) НЕ тронут — правка только в embedded JS. (md5 отличается от прошлого `edd4bf55` лишь хвостовой mdat-checksum'ой, которую Max пересчитывал при freeze; Live её игнорит — функционально это `edd4bf55` + post.)
- **Возвращённая строка (единственный post в JS), вставлена в `check()` сразу после вычисления `dot`, до outlet'ов:** `maxApi.post(\`version check: device=${DEVICE_VERSION} latest=${m.ok ? m.latest : '?'} (${m.ok ? 'ok' : m.reason}) url=${m.ok ? (m.url || '-') : '-'} -> dot ${dot}\`);` — теперь включает `url=` (диагностика, что ссылка тянется с сервера). `url` уже был в объекте `m` из `fetchManifest` — прокидывать не пришлось. Остальная логика (extract latest+url, cmp, outlet dot/url, fetch, redirect, setInterval) НЕ тронута.
- **Путь B по хвосту:** vc region splice на of32=201803 (граница перед solo_follower.js); патч dlst: vc sz32 2933→3100, solo_follower.js of32 +167 (204736→204903); `ptch`(LE@0x1C) +167, `mx@c`(BE@0x2C) +167; JSON sz32/of32 не тронуты (длина JSON-патчера = та же). Хвост diff = ровно 2 dlst-поля (vc sz32, solo of32) + head diff = ровно ptch/mxc. JSON identical, solo_follower.js байт-в-байт цел, `node --check` embedded JS OK.
- **Бэкапы 2026-06-10-123149/123404/123457:** device `Control XL.2026-06-10-123149.amxd` (`211ed6f8`, версия БЕЗ post) + `version_check.userlib.2026-06-10-123149.js` (старый JS без post) + слоты `Canon-device/Demo-root/Demo-maxdev/Starter-root/Starter-maxdev.2026-06-10-123404.amxd` + зипы `Fadercraft Control XL v1.0 - {Demo,Starter}.2026-06-10-123457.zip`. Все в `raw/archive/`. ⚠️ Слот 1 (Canon-device) ДО этой правки отставал на `edd4bf55` (не получил прошлую пропагацию) — теперь синхронизирован.
- **Грабли zip 2026-06-10:** `zip` падает МОЛЧА при записи в `~/Brain/...` (sandbox); `ditto -c -k --sequesterRsrc` пишет, но плодит `__MACOSX`/`._*` (junk!). Рабочий путь: `zip -r -X` в `/tmp` (разрешён) → `cp` готовый zip в dist. `-x '*.DS_Store'` + проверка `unzip -l | grep -iE 'DS_Store|MACOSX|/\._'`.

## ⚠️ ПРЕДЫДУЩИЙ ЭТАЛОН 2026-06-10 (III): `edd4bf559c7961888399bd7b19a3a118` (212123 B, 271 box / 413 line) — заменён (IV) добавлением post
**Server-controlled update URL + ФИКС клика v2 (silent-store).** «New Version»/«Update ready» открывает `url` из `version.json` (server) либо fallback `https://library.gumroad.com`. Все 6 слотов = `edd4bf55` (explicit-пропагация). Зипы Demo/Starter пересобраны (explicit deploy). DEVICE_VERSION=1.0.
- **Фикс клика v2 (регресс `d927295f`):** прошлый фикс хранил url в `vlink_store`=`v upd_url` и подключал ОБА источника url в `vlink_store`[1]. Но объект `value` имеет ТОЛЬКО inlet 0 → Max при загрузке УДАЛЯЛ оба патчкорда («patchcord inlet out of range: deleting patchcord» ×2 в Console) → стор пустой → клик бэнгал пустым → браузер не открывался. Решение: `vlink_store` теперь = **message-бокс** (silent-store: `set <url>` пишет молча, bang выводит), перед ним новый `vlink_prepend`=`newobj prepend set`. Оба источника url + клик идут в **inlet 0**: `vlink_route`[1]→`vlink_prepend`[0], `vlink_fallback`[0]→`vlink_prepend`[0], `vlink_prepend`[0]→`vlink_store`[0]; клик `version_link`[0]→`vlink_store`[0]→`vlink_open`[0]. НИ ОДНОГО патчкорда в inlet≥1 → Console чистый. Bare `v` нельзя (он выводит при приёме значения в inlet 0 → браузер открывался бы сам без клика); message+`prepend set` хранит без вывода. url одним symbol (`://`/`.` не рвутся). Путь A length-preserving (compact JSON 153916 ≪ L0 201786).
- **Механизм url→патч:** `version_check.js` читает `latest`+`url`, шлёт на outlet 0 теговые `dot N` и `url <link>`. Патч: `version_node`→`vlink_route`(`route dot url`); outlet0(dot)→`vdot_sel`(`sel 0 1`); outlet1(url)→`vlink_prepend`(`prepend set`)→`vlink_store`(message). Fallback `vlink_fallback`(`loadmess https://library.gumroad.com`)→`vlink_prepend`. `vlink_open` text = `;\rmax launchbrowser $1` (НЕ менялся). Server url override'ит fallback при успешном пинге.
- **Бэкапы фикса v2 2026-06-10:** device `Control XL.2026-06-10-120524.amxd` (`d927295f` до фикса) + слоты `Canon-device/Demo-root/Demo-maxdev/Starter-root/Starter-maxdev.2026-06-10-120634.amxd` + зипы `Fadercraft Control XL v1.0 - {Demo,Starter}.2026-06-10-120737.zip`. Прошлая версия `d927295f` (270/412) — заменена (была сломана: out-of-range патчкорды).
- **Embedded JS обновлён во freeze** (Путь B по хвосту: vc 2525→3100, dL=+575; `solo_follower.js` of32 +575; `ptch`/`mx@c` +575; sz32 vc=3100; rel +16 сохранён). Зип-девайсы несут новый JS вшитым — у покупателя НЕ нужен внешний файл.
- **Изменённая раскладка dist (vs старая карта):** Router-слот теперь = `Control XL.amxd` в КОРНЕ каждого dist-проекта (НЕ `XL_Performance.amxd`), на него ссылается `Router.als` type-1 relative `Control XL.amxd`. 6 слотов: User Library, project `device/`, Demo root+`Max Devices/`, Starter root+`Max Devices/` — все `Control XL.amxd`.
- Бэкапы 2026-06-10: device `Control XL.2026-06-10-113251.amxd` (чистый `44aa142b` до правки) + слоты `Canon-device/Demo-root/Demo-maxdev/Starter-root/Starter-maxdev.2026-06-10-113724.amxd` + зипы `…-113836.zip` + js `version_check[.userlib].2026-06-10-113251.js`. Все в `raw/archive/`.

## Сверка 2026-06-06 (после отката Browser Load) — ИСТОРИЯ
Все 6 слотов = `44aa142b198b6001613db3b29c36cc38`, 211548 B. **Сменён на `984d4339` 2026-06-10 (см. выше).**
