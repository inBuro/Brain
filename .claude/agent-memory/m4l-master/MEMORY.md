# m4l-master — память

Дайджест. Горячие факты + карта детальных файлов. Детали — в отдельных файлах, читай по ссылке.

## Карта памяти
- [amxd-format.md](amxd-format.md) — проверенный рецепт распаковки/пересборки `.amxd`, раскладка байт, модель Max patcher JSON, Live API практики, веб-источники.
- [xl-performance.md](xl-performance.md) — факты по флагману: пути, объекты секции CC47, карта режимов CC30/CC47, журнал правок.
- [lcxl3-daw-protocol.md](lcxl3-daw-protocol.md) — DAW-mode протокол LCXL3 + decompiled Live12 remote-script (URL structure-void); CC30 select / CC31 report, DAW-порт, relative-энкодеры. Источник истины по нативному протоколу контроллера.

## Конвенции (железно)
- **Архив до правки.** Текущий девайс → `Archive/<Name>.YYYY-MM-DD.amxd` (если занято — `-HHMMSS`). Никогда не перезаписывать архив.
- **Правка на месте.** Меняем сам `.amxd`, не шлём куски кода, не просим руками патчить в Max.
- **Валидация перед подменой.** Re-parse JSON, счётчики boxes/lines, хвост байт-в-байт, инварианты размеров. Не сошлось — откат к архиву.
- **Перезагрузка в Live.** Live кеширует — убрать/добавить девайс заново; Max-редактор закрывать без сохранения.

## Где что лежит
- Девайсы: `/Users/Kirill/Music/Ableton/User Library/Max Devices/` (`XL_Performance.amxd`, `SendsFollower.amxd`).
- Архив: та же папка, подпапка `Archive/`.
- `.syx` кастом-моды (канон): `~/Projects/Claude/Fadercraft/custom-modes/` (`1.syx`…`15.syx`).
- Wiki проекта (логика, форматы): `~/Brain/Fadercraft/wiki/concepts/` и `…/entities/`.

## Быстрые факты формата
- `.amxd` = контейнер `ampf`: бинарный заголовок → JSON-патчер (с офсета **48**, до первого `\x00`) → встроенные JS/файлы → метачанки с checksum (`mdat`, Live её игнорит при загрузке).
- Два поля размера зависят от длины JSON: `ptch` (u32 **LE** @`0x1C`) и `mx@c`-data (u32 **BE** @`0x2C`). При изменении JSON оба += ΔL. Инвариант: `ptch == filesize − 0x20`.
- Хвост (suffix от `\x00`) при правке сохранять **байт-в-байт**.

## Текущее состояние домена
XL_Performance: 2026-06-02 добавлен round-trip для кастом-мода 15 (QUE/prelisten). Подробности и карта объектов — в [xl-performance.md](xl-performance.md).
