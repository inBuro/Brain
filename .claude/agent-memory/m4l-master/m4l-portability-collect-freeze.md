---
name: m4l-portability-collect-freeze
description: Почему unfrozen M4L-девайс НЕ переживает Live «Collect All and Save»; freeze = единственный портируемый артефакт; как устроена проект-папка SF-Track
metadata:
  type: reference
---

# Портируемость M4L: Collect All vs Freeze (проверено 2026-07-04 на Sends Follower – Track)

**Корень проблемы «панель multimap пропала после Collect All and Save в новую папку»:** девайс был UNFROZEN. У unfrozen `.amxd` зависимости (`multimap.maxpat`, `sf_udp.js`, `sf_version_check.js`, `MapButton.maxpat`, svg) лежат ВНЕ файла и резолвятся через Max search path (User Library) / проект-папку. **Live «Collect All and Save» копирует в новый Live-проект ТОЛЬКО сам `.amxd`, а Max-граф зависимостей не понимает** → внешние js/maxpat НЕ собираются. Max-проект девайса живёт в `~/Documents/Max 9/Max for Live Devices/<Name> Project` (не внутри Live-сета) и Collect его не трогает. Итог: собранный сет = `can't find file` / `bpatcher: error loading multimap.maxpat` / `no function msg_float [sf_udp.js]`.

**Вывод (железно):** unfrozen M4L девайс НЕ портируется через Live Collect All. Единственный самодостаточный артефакт — **FROZEN** `.amxd`: freeze вшивает ВСЕ зависимости рекурсивно (js/node.script/bpatcher/вложенные maxpat/их svg, включая системные SVG Max типа `multimap-unmap.svg`). Frozen `.amxd` = один файл, Collect All его просто копирует → работает везде. Демо/релиз всегда фризить.

**Freeze находит deps через search path, НЕ через членство в проекте** — поэтому freeze работает даже при пустом `patcher.project.contents`. Проект-папку наполняем ради: убрать хрупкий симлинк, самодостаточность dev-окружения, чистое re-freeze без зависимости от плоских копий в User Library.

## SF-Track проект-папка (структура после сборки 2026-07-04)
`~/Documents/Max 9/Max for Live Devices/Sends Follower – Track Project/`
- `code/`: `sends_follower_track.js` (md5 c2085457, БЫЛ симлинком → заменён реальным файлом), `sf_udp.js`, `sf_version_check.js`
- `patchers/`: `multimap.maxpat`, `MapButton.maxpat`
- `media/`: `swap-params.svg`, `swap-params-flip.svg`, `multimap-unmap.svg` (системный SVG, извлечён из frozen)
- `patcher.project`: `autoorganize:1`, `devpath:"."`, `contents.patchers:{}` (пустой — .amxd НЕ правил; membership подхватится при open+save в Max). Симлинки Collect/перенос НЕ переживают — только реальные файлы.

**НЕ править `patcher.project` в frozen-бинаре** (риск error 6 из [[amxd-format]]); frozen уже вшивает всё. Полная зав-цепь SF-Track: device→[sends_follower_track.js, sf_udp.js(js), sf_version_check.js(node.script), multimap.maxpat(bpatcher)] ; multimap→MapButton.maxpat→[3 svg].
