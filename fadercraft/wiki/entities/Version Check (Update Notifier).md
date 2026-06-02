---
type: entity
project: Novation
created: 2026-06-02
updated: 2026-06-02
status: works-locally (needs freeze for distribution)
tags: [m4l, node-for-max, update, version]
---

# Version Check (Update Notifier)

**Summary**: Фоновая проверка апдейтов внутри `Control XL.amxd`. На загрузке устройство пингует опубликованный манифест версии, сравнивает с собственной сборкой и, если вышла новее, подсвечивает ментоловую кнопку **«Update ready»**, ведущую на страницу покупки/обновления.

**Sources**: восстановлено из `raw/version_check.js` + проводки патчера 2026-06-02 (фича собрана 2026-06-01, скрипт потерялся — см. ниже).

**Last updated**: 2026-06-02

---

## Статус

| Часть | Состояние |
|---|---|
| UI-кнопка + проводка в патче | ✅ есть (frozen в девайсе) |
| Серверный манифест `fadercraft.com/api/version.json` | ✅ есть (`app/public/api/version.json`) |
| Скрипт `version_check.js` (Node for Max) | ✅ восстановлен, лежит рядом с девайсом |
| Вшит во freeze для рассылки | ⚠️ НЕТ — нужно заморозить перед дистрибуцией |

## Как работает

Поток в патчере:
```
node.script version_check.js ──▶ sel 0 1
   (сам триггерит check при старте Node      ├ 0 ▶ script hide version_link  (актуальная версия)
    + каждые 30 мин)                          └ 1 ▶ script show version_link  («Update ready»)
version_link (textbutton «Update ready») ──▶ ;max launchbrowser https://fadercraft.gumroad.com/l/control-xl
```
Объекты (id): `version_node` (`node.script version_check.js @autostart 1`), `vdot_sel` (`sel 0 1`), `vlink_show`/`vlink_hide` (`script show/hide version_link`) → `vlink_thispatcher` (`thispatcher`), `version_link` (textbutton), `vlink_open` (launchbrowser на Gumroad).

> **Триггер — со стороны скрипта, не патча.** Раньше был `vdot_loadtrig` (`loadmess check`), но он стрелял `check` до того, как Node-процесс поднимался → `node.script • Node script not ready can't handle message check` на каждой загрузке. Убран 2026-06-02; скрипт сам зовёт `check()` при старте Node и по `setInterval` (30 мин), плюс принимает `check`/`bang` извне, если понадобится ручной ре-чек.

## Контракт `version_check.js`
- Node for Max (`require('max-api')`, `require('https')`), без внешних зависимостей.
- На `check` / `bang` (и однократно при загрузке + каждые 30 мин) фетчит `https://fadercraft.com/api/version.json`.
- Сравнивает `latest` манифеста с константой `DEVICE_VERSION` (semver-сравнение по точкам).
- `maxApi.outlet(1)` если `latest` строго новее → показать кнопку; иначе `0`. Сеть недоступна / не JSON / нет поля → `0` (fail-safe, без ложного апдейта).

Манифест (`app/public/api/version.json`, раздаётся как `/api/version.json`):
```json
{ "latest": "1.0", "url": "https://fadercraft.com/update", "changelog": "…", "min_compatible": "1.0" }
```

## Где лежат файлы
- **Канон скрипта**: `~/Brain/Fadercraft/raw/version_check.js` (2525 B — основной; `version_check 17.14.40.js` — старый дубль; `/tmp/version_check2,3.js` — тестовые харнессы, не рабочие).
- **Рантайм-копия** (чтобы `node.script` нашёл): `~/Music/Ableton/User Library/Max Devices/version_check.js` рядом с девайсом.
- **Манифест**: `~/Projects/Claude/Fadercraft/app/public/api/version.json`.

## Релизная связка (важно)
На каждом релизе бампать СИНХРОННО:
1. `DEVICE_VERSION` в `version_check.js` (версия конкретной сборки девайса);
2. `latest` в `app/public/api/version.json` (что считается новейшим) — деплоится на сайт.
Только когда `latest` > `DEVICE_VERSION` у пользователя, у него загорается «Update ready». Связано с правилом [[version_bump_gumroad_proof]] (сначала пруф загрузки на Gumroad, потом бамп).

## Грабли (2026-06-02)
Фича собрана 2026-06-01, но `version_check.js` не был положен рядом с девайсом и не вшит во freeze → `node.script • can't find file version_check.js`, кнопка висела показанной по дефолту. Знание потерялось за сутки, т.к. фича не была задокументирована. Лечение: восстановлен скрипт из `raw/`, положен рядом с девайсом. Для рассылки — заморозить девайс (Max сам забандлит node.script).

## Related pages
- [[XL_Performance — как это работает]]
- [[Fadercraft deploy]] · [[version_bump_gumroad_proof]]
- [[Novation XL]]
