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
| 2 | **User Library — ОСНОВНОЙ РЕДАКТИРУЕМЫЙ АРТЕФАКТ** (правила 2026-06-06 (8)); md5 **`44aa142b`** (чисто, после отката Browser Load) | `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 1 | **Проектный репо-эталон** (propagate-target, only-on-command); md5 **`44aa142b`** (чисто, после отката Browser Load) | `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd` | `Control XL.amxd` |
| 3 | Demo bundle main | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Demo Project/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 4 | Demo bundle Router (ссылка из `Router.als`) | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Demo Project/XL_Performance.amxd` | `XL_Performance.amxd` |
| 5 | Starter bundle main | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Starter Project/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 6 | Starter bundle Router | `/Users/Kirill/Brain/Fadercraft/dist/Control XL Starter Project/XL_Performance.amxd` | `XL_Performance.amxd` |

## ПРАВИЛА СТРУКТУРЫ (нюансы)
- **Имена файлов в бандлах НЕ менять.** Main-сеты ссылаются на `Control XL.amxd`; `Router.als` — на `XL_Performance.amxd`. В оба слота кладётся ОДИН И ТОТ ЖЕ эталон, только под разными именами. (Слоты 4 и 6 = тот же байт-в-байт эталон, имя файла другое.)
- **`raw/Demo-set Project/` — рабочий мастер-Ableton-проект, НЕ shipping.** Его встроенный `Max Devices/XL_Performance.amxd` (218417 B, frozen, старый граф 277/435) в zip-дистрибутивы НЕ попадает и в пропагацию НЕ входит. Реальные дистрибутивы собираются из `dist/`-папок. `raw/` неизменяем — только читать.
- Огрызок `XL_Performance.amxd` 150220 B (прошлый) больше не актуален — заменён эталоном.

## ZIP-ДЕЛИВЕРАБЛЫ (публикация пользователям)
- `/Users/Kirill/Brain/Fadercraft/dist/Fadercraft Control XL v1.0 - Demo.zip` (~144 МБ, с Samples)
- `/Users/Kirill/Brain/Fadercraft/dist/Fadercraft Control XL v1.0 - Starter.zip` (~170 КБ)
- Внутр. структура zip: верхняя папка `Fadercraft Control XL v1.0 - {Demo,Starter}/` → `Control XL {Demo,Starter} Project/` → те же файлы, что в dist-папке.
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

## Сверка 2026-06-06 (после отката Browser Load)
Все 6 слотов = `44aa142b198b6001613db3b29c36cc38`, 211548 B. Инвариант ВЫПОЛНЕН. (Откат Browser Load выполнил пользователь сам — см. блок «BROWSER LOAD ОТЛОЖЕН» выше.)
