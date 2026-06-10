# m4l-master — память

Дайджест. Горячие факты + карта детальных файлов. Детали — в отдельных файлах, читай по ссылке.

## Карта памяти
- [amxd-format.md](amxd-format.md) — проверенный рецепт распаковки/пересборки `.amxd`, раскладка байт, модель Max patcher JSON, Live API практики, веб-источники.
- [xl-performance.md](xl-performance.md) — факты по флагману: пути, объекты секции CC47, карта режимов CC30/CC47, текущее состояние (один срез, без журнала версий).
- [feedback-iterative-no-versionlog.md](feedback-iterative-no-versionlog.md) — при итеративной отладке НЕ вести журнал версий/wiki на каждую правку; обязателен только дата-бэкап + краткий current-state. Развёрнутая дока — на финализации/по просьбе.
- [lcxl3-daw-protocol.md](lcxl3-daw-protocol.md) — DAW-mode протокол LCXL3 + decompiled Live12 remote-script (URL structure-void); CC30 select / CC31 report, DAW-порт, relative-энкодеры. Источник истины по нативному протоколу контроллера.
- [controlxl-project-map.md](controlxl-project-map.md) — 6 device-слотов Control XL + инвариант байт-в-байт, эталон md5, zip-деливераблы, процедура правки. ⚠️ Правки теперь в User Library (слот 2); пропагация дальше — только по команде. Читать при любой правке/пропагации.

## Конвенции (железно)
- **Где редактировать Control XL (РАЗВОРОТ 2026-06-06 (8)):** основной редактируемый артефакт = **User Library** `.amxd` (`~/Music/Ableton/User Library/Max Devices/Control XL.amxd`). Прежнее правило «edit canon in project repo, User Library pristine/deploy-only» — **ОТМЕНЕНО**. Пропагация дальше (репо-эталон, бандл-слоты 3–6, zip) — **только по явной команде** «копируй дальше»/«пропагируй». Детали: [controlxl-project-map.md](controlxl-project-map.md), [xl-performance.md](xl-performance.md).
  - **Все 6 слотов Control XL = `28840e394da60839f71c33c39e0922ec`** (212123 B, 271 box / 413 line) с 2026-06-10 (IV): вернули диагностический `maxApi.post` (статус апдейт-детекта + `url=` в Max Console) в `version_check.js` (vc 2933→3100, Путь B по хвосту, JSON-патчер не тронут); оба зипа пересобраны. Прежние `edd4bf55` (III, click-fix v2, без post) / `211ed6f8` (без post, mdat-вариант) — заменены. Сохранены server-controlled update URL + ФИКС клика «Update ready» (v2 silent-store: `vlink_store`=message + `vlink_prepend`=`prepend set`, оба источника url + клик в inlet 0, Console чистый). «New Version» открывает `url` из `version.json` (fallback `library.gumroad.com`). ⚠️ dist-раскладка: Router-слот = `Control XL.amxd` в КОРНЕ dist-проекта. Грабли zip: `zip` падает молча при записи в `~/Brain` (sandbox) → собирать `zip -r -X` в `/tmp`, потом `cp`; `ditto --sequesterRsrc` плодит `__MACOSX`/`._*` junk — НЕ использовать. Механизм/бэкапы — [controlxl-project-map.md](controlxl-project-map.md), [xl-performance.md](xl-performance.md).
  - ⚠️ **Browser Load (CC51)** — ОТЛОЖЕН (нет `browser` в M4L LiveAPI → только Python remote-script). **Hardware feedback** (явный midiout / port-selector) — ОТЛОЖЕН в следующую версию как KNOWN BUG: фидбэк гибнет, если после девайса в цепи стоит audio-девайс. WIP-бэкапы 154534/160053/161926 в archive — материал для следующей версии. Детали обеих фич — [xl-performance.md](xl-performance.md).
- **Архив до правки.** Текущий девайс → `raw/archive/<Name>.YYYY-MM-DD.amxd` (если занято — `-HHMMSS`). Для XL_Performance это `~/Brain/Fadercraft/raw/archive/`. **Pre-edit backup обязателен ВСЕГДА.** Никогда не перезаписывать архив.
- **Правка на месте.** Меняем сам `.amxd`, не шлём куски кода, не просим руками патчить в Max.
- **Валидация перед подменой.** Re-parse JSON, счётчики boxes/lines, хвост байт-в-байт, инварианты размеров. Не сошлось — откат к архиву.
- **Перезагрузка в Live.** Live кеширует — убрать/добавить девайс заново; Max-редактор закрывать без сохранения.

## Где что лежит
- Девайсы: `/Users/Kirill/Music/Ableton/User Library/Max Devices/` (`Control XL.amxd`, `SendsFollower.amxd`).
- Архив: `~/Brain/Fadercraft/raw/archive/` (не рядом с девайсом).
- `.syx` кастом-моды (канон): `~/Projects/Claude/Fadercraft/custom-modes/` (`1.syx`…`15.syx`).
- Wiki проекта (логика, форматы): `~/Brain/Fadercraft/wiki/concepts/` и `…/entities/`.

## Быстрые факты формата
- `.amxd` = контейнер `ampf`: бинарный заголовок → JSON-патчер (с офсета **48**, до первого `\x00`) → встроенные JS/файлы → метачанки с checksum (`mdat`, Live её игнорит при загрузке).
- Два поля размера зависят от длины JSON: `ptch` (u32 **LE** @`0x1C`) и `mx@c`-data (u32 **BE** @`0x2C`). При изменении JSON оба += ΔL. Инвариант: `ptch == filesize − 0x20`.
- Хвост (suffix от `\x00`) при правке сохранять **байт-в-байт**.

## Текущее состояние домена
XL_Performance: 2026-06-02 добавлен round-trip для кастом-мода 15 (QUE/prelisten). Подробности и карта объектов — в [xl-performance.md](xl-performance.md).

⚠️ **Файл девайса переименован 2026-06-02:** `XL_Performance.amxd` → **`Control XL.amxd`** (везде: канон в User Library, бандлы в `dist/`, ссылки в `.als`). **Внутреннее имя Max-патча всё ещё «XL_Performance»** — переименован только файл. Если нужно переименовать и внутренний патч (чтобы на дорожке Live отображалось «Control XL») — отдельная правка. При работе с девайсом теперь это `Control XL.amxd`.

## TODO для следующей сборки девайса
- **Лейбл «Bank fx» → «Bank»** (UI-надпись в MIXER-секции; на сайте-мокапе уже «Bank», приводим девайс к нему). Запрошено пользователем 2026-06-02.
