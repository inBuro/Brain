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

## ⚠️ USER LIBRARY = EXPLICIT-ONLY (правило пользователя, 2026-06-06)
Слот 2 (User Library) — рабочий live-инсталл пользователя. Неожиданная перезапись может подменить девайс под открытым в Live сетом, с которым он сейчас играет. Поэтому:
- User Library НЕ входит в автоматическую процедуру «обновить девайс».
- Трогать слот 2 ТОЛЬКО по явной команде («обнови в user lib» / «деплой в User Library» и т.п.).
- Автопропагация по умолчанию идёт на: **слот 1 (проектный эталон, где правка) + слоты 3–6 (4 бандл-слота Demo/Starter main+Router)**. User Library и zip-деливераблы — отдельные explicit-only шаги.

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
| 1 | **Проектный эталон** (источник правок) | `/Users/Kirill/Projects/Claude/Fadercraft/device/Control XL.amxd` | `Control XL.amxd` |
| 2 | **User Library — EXPLICIT-ONLY deploy-таргет** (рабочий live-инсталл) | `/Users/Kirill/Music/Ableton/User Library/Max Devices/Control XL.amxd` | `Control XL.amxd` |
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

## ПРОЦЕДУРА «обновить девайс» (по умолчанию — БЕЗ User Library)
1. Правку делаю в **проектном эталоне (слот 1)**.
2. Перед перезаписью КАЖДОГО из автопропагируемых слотов 3–6 — архив с датой-временем в `~/Brain/Fadercraft/raw/archive/` (`<Name>.YYYY-MM-DD-HHMMSS.amxd`, не перезаписывать существующий).
3. Копирую эталон БАЙТ-В-БАЙТ в слоты **3–6** (соблюдая имена файлов слотов). **Слот 2 (User Library) НЕ трогаю** — только по явной команде.
4. Валидация: md5 слотов 1 + 3–6 = эталон. Не сошлось — откат к архиву.
5. User Library (слот 2) и zip — НЕ трогаю; синхронизация/пересборка только по явной команде.

### Explicit-only шаг: «обновить в User Library»
Только по явной команде. Архив с датой-временем → перезапись слота 2 эталоном байт-в-байт → md5 слота 2 = эталон. Напомнить пользователю про кеш Live (убрать/добавить девайс заново) и про открытый сет.

## Сверка 2026-06-06 (read-only)
Все 6 слотов = `44aa142b198b6001613db3b29c36cc38`, 211548 B. Инвариант ВЫПОЛНЕН.
