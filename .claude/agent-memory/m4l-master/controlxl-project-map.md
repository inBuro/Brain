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
- ✅ **Расхождение версий ЗАКРЫТО 2026-06-06 (9):** Browser Load доставлен в User Library. User Library теперь = **`63d95bbe623f9238f48bccdcd7e96c92`** (271 box / 410 line, с `bl_*` + `browser_load.js` рядом на диске). Доставка = байт-в-байт копия слота 1 (предв. сверка показала: UL чисто отставал ровно на +4 box/+2 line `bl_*`, 0 уникального контента, хвост идентичен). `browser_load.js` (md5 `559ad793…`) лежит в `Music/Ableton/User Library/Max Devices/` рядом с девайсом — НЕ вшит во freeze (как version-check), для рассылки нужен freeze-шаг. Бэкап до доставки: `raw/archive/UserLib-Control XL.2026-06-06-123410.amxd` (`44aa142b`). Бандлы 3–6 и слот 1 НЕ тронуты.

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
| 2 | **User Library — ОСНОВНОЙ РЕДАКТИРУЕМЫЙ АРТЕФАКТ** (правила 2026-06-06 (8)); md5 **`572deaa6`** (Browser Load ПОЧИНЕН — `ctlin 51`, с 2026-06-06 (10)) | `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd` | `Control XL.amxd` |
| 1 | **Проектный репо-эталон** (propagate-target, only-on-command; содержит Browser Load `63d95bbe`) | `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd` | `Control XL.amxd` |
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

## ПРОЦЕДУРА правки (правила 2026-06-06 (8))
1. **Pre-edit backup ВСЕГДА:** архив текущего User Library `.amxd` (слот 2) → `~/Brain/Fadercraft/raw/archive/Control XL.YYYY-MM-DD-HHMMSS.amxd` (не перезаписывать).
2. Правку делаю **прямо в User Library (слот 2)**.
3. Валидация пересборки (re-parse JSON, счётчики box/line, хвост байт-в-байт, инварианты размеров). Не сошлось — откат к архиву.
4. **СТОП.** Слоты 1, 3–6 и zip НЕ трогаю. Пропагация дальше — ТОЛЬКО по явной команде «копируй дальше»/«пропагируй».
5. В отчёте: что изменил, путь архива, тест в Live + напоминание перезагрузить девайс (кеш Live; Max-редактор закрывать без сохранения).

### Explicit-only шаг: «копируй дальше» / «пропагируй»
Только по явной команде. Тогда: заархивировать целевые слоты с датой-временем → скопировать User Library .amxd байт-в-байт в указанные слоты (1 и/или 3–6, имена файлов слотов соблюдать) → md5 целей = источник. zip — отдельный публикационный шаг.

## Сверка 2026-06-06 (read-only)
Все 6 слотов = `44aa142b198b6001613db3b29c36cc38`, 211548 B. Инвариант ВЫПОЛНЕН.

## ⚠️ 2026-06-06 (7) — слот 1 ушёл вперёд (Browser Load), инвариант временно НАРУШЕН намеренно
Слот 1 (проектный эталон) = **`63d95bbe623f9238f48bccdcd7e96c92`** (211548 B) — добавлена фича Browser Load (CC51 ch15, `bl_*` объекты + `browser_load.js` на диске). Слоты 2–6 ещё на `44aa142b`.
- НЕ пропагировать в слоты 3–6 / User Library, пока `browser_load.js` НЕ вшит во freeze: фича не shippable (покупатель получит `can't find file`). Пропагация + freeze — отдельный explicit ship-шаг.
- Когда фичу заморозят и решат раскатывать — заново вычислить эталонный md5, заархивировать слоты 3–6, скопировать байт-в-байт, обновить «Текущий эталон» выше.
