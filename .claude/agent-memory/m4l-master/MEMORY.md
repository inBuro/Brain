# m4l-master — память

Дайджест. Горячие факты + карта детальных файлов. Детали — в отдельных файлах, читай по ссылке.

## Карта памяти
- [amxd-format.md](amxd-format.md) — проверенный рецепт распаковки/пересборки `.amxd`, раскладка байт, модель Max patcher JSON, Live API практики, веб-источники.
- [xl-performance.md](xl-performance.md) — факты по флагману: пути, объекты секции CC47, карта режимов CC30/CC47, журнал правок.
- [lcxl3-daw-protocol.md](lcxl3-daw-protocol.md) — DAW-mode протокол LCXL3 + decompiled Live12 remote-script (URL structure-void); CC30 select / CC31 report, DAW-порт, relative-энкодеры. Источник истины по нативному протоколу контроллера.
- [controlxl-project-map.md](controlxl-project-map.md) — 6 device-слотов Control XL + инвариант байт-в-байт, эталон md5, zip-деливераблы, процедура правки. ⚠️ Правки теперь в User Library (слот 2); пропагация дальше — только по команде. Читать при любой правке/пропагации.

## Конвенции (железно)
- **Где редактировать Control XL (РАЗВОРОТ 2026-06-06 (8)):** основной редактируемый артефакт = **User Library** `.amxd` (`~/Music/Ableton/User Library/Max Devices/Control XL.amxd`). Прежнее правило «edit canon in project repo, User Library pristine/deploy-only» — **ОТМЕНЕНО**. Пропагация дальше (репо-эталон, бандл-слоты 3–6, zip) — **только по явной команде** «копируй дальше»/«пропагируй». Детали: [controlxl-project-map.md](controlxl-project-map.md), [xl-performance.md](xl-performance.md).
  - ✅ Browser Load (CC51) доставлен + ПОЧИНЕН в User Library. UL теперь **`572deaa600b9effbf7712e8590c5fdd4`** (271/410). 2026-06-06 (10): `bl_ctlin` `ctlin 51 15`→`ctlin 51` (снят фильтр канала — фича молчала: CC51 в кастом-модах не на ch15, а все соседние `ctlin` слушают любой канал). `browser_load.js` рядом на диске, НЕ во freeze. Бандлы 3–6 (`44aa142b`) и слот 1 (`63d95bbe`, ещё `ctlin 51 15`) — пропагация по отдельной команде.
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
