---
name: xl-performance
description: Факты по флагману Control XL (XL_Performance) — структура патчера, встроенные js, что debug/функционал
metadata:
  type: project
---

Девайс Control XL (внутр. имя `XL_Performance`). На 2026-06-10 текущий md5 = `211ed6f8eb88c0a4ff4cb94b9236d0cd` (был `edd4bf55…`).

## Патчер (JSON)
271 boxes / 413 lines всего (с сабпатчерами). Histogram: newobj 126, message 94, comment 25, number 11, live.toggle 6, live.text 4, live.line 2, toggle 1, button 1, textbutton 1.
**`print`-объектов в патчере НЕТ** (на 2026-06-10). Были раньше — уже вычищены в прошлых правках. Осталась стейл-comment-коробка "Debug kept intact. loadmess Listen CC = 49…" — это просто текст-документация, НЕ debug-вывод; но «49» противоречит факту Listen CC=47 (memory reference_lcxl_syx_format) — comment устарел, в Console не сыпет, не трогал.
Функциональные объекты с "debug" в id (НЕ print, НЕ трогать): `mix_obj-bank-debug`/`-page-debug`/`-hold-debug` (number-боксы), `inst_pak_debug` (`pak 0 0 0`).

## Встроенные js (как блобы в .amxd, см. amxd-format)
1. `version_check.js` (~3100→2933 байт после чистки) — update-check. Логика НЕ трогать: `require('max-api')`/`https`, fetch `https://fadercraft.com/api/version.json`, redirect-follow, `cmp(latest,DEVICE_VERSION)`, эмит `maxApi.outlet('dot', 0|1)` и `maxApi.outlet('url', link)`, `addHandler('check'/'bang')`, `setInterval(check, 30min)`, `check()` на загрузке. DEVICE_VERSION='1.0'.
   - 2026-06-10: убрана ЕДИНСТВЕННАЯ debug-строка `maxApi.post(\`version check: …-> dot ${dot}\`)` (167 байт). Console больше не спамит на каждый пинг/load. Outlets dot/url сохранены.
2. `solo_follower.js` (6856 байт) — Solo Follower (frozen-in, в маркетинге НЕ упоминается). Уже чистый: 0 maxApi.post / console.log. Не трогать.

## Update-link цепочка в патчере (НЕ ТРОГАТЬ)
`version_check.js` outlet → route dot/url → `prepend set`/vlink_* → текстовая кнопка "Update ready" + `launchbrowser $1` по клику. Url из манифеста (server-controlled) оверрайдит hardcoded fallback (seeded через loadmess). Подтверждено юзером на железе что работает.

## Слои/режимы — в проектной wiki, не дублировать
Mode Encoding, CC47 Cross-Mode Transit, Custom Mode SysEx Layout, Instruments/Mixer Layer — в `~/Brain/Fadercraft/wiki/concepts/` и `entities/`.
