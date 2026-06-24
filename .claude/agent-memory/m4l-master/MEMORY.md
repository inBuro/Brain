# m4l-master — память

Дайджест. Горячие факты + карта детальных файлов. Детали — в отдельных файлах, читай по ссылке.

## Карта памяти
- [feedback-color-transparency-policy.md](feedback-color-transparency-policy.md) — ⚠️ ПОСТОЯННО: цвета M4L трогать ТОЛЬКО по явной просьбе на конкретный элемент (палитра `themecolor.*`, before/after, не перекрашивать user-цвета); alpha<1 = намеренная прозрачность пользователя, НИКОГДА не стирать. Читать перед любой правкой цвета/hex.
- [amxd-format.md](amxd-format.md) — проверенный рецепт распаковки/пересборки `.amxd`, раскладка байт, модель Max patcher JSON, Live API практики, веб-источники.
- [xl-performance.md](xl-performance.md) — факты по флагману: пути, объекты секции CC47, карта режимов CC30/CC47, текущее состояние (один срез, без журнала версий).
- [feedback-iterative-no-versionlog.md](feedback-iterative-no-versionlog.md) — при итеративной отладке НЕ вести журнал версий/wiki на каждую правку; обязателен только дата-бэкап + краткий current-state. Развёрнутая дока — на финализации/по просьбе.
- [lcxl3-daw-protocol.md](lcxl3-daw-protocol.md) — DAW-mode протокол LCXL3 + decompiled Live12 remote-script (URL structure-void); CC30 select / CC31 report, DAW-порт, relative-энкодеры. Источник истины по нативному протоколу контроллера.
- [encoder-relative-research.md](encoder-relative-research.md) — исследование гипотезы firmware relative-toggle для Custom Mode (CC69/72/73 ch7 127); артефакты Monitor + Prototype в raw/; протокол валидации (Outcome A/B); **НЕ подтверждено — нужен аппаратный тест**.
- [lcxl2-mk2-feasibility.md](lcxl2-mk2-feasibility.md) — осуществимость порта Control XL на **MK2**: абсолютные потенциометры (жёсткий блокер бесшовности), 8 user-слотов, native «Template changed» SysEx `77h` (mode-detect проще MK3), отличия `.syx`. Читать при вопросах о поддержке MK2/MK1.
- [controlxl-project-map.md](controlxl-project-map.md) — 6 device-слотов Control XL + инвариант байт-в-байт, эталон md5, zip-деливераблы, процедура правки. ⚠️ Правки теперь в User Library (слот 2); пропагация дальше — только по команде. Читать при любой правке/пропагации.
- [sends-reader.md](sends-reader.md) — **SendsReader.amxd** — форк Sends Follower, ИНВЕРТИРОВАННАЯ семантика (на обычном треке читает ОДИН свой send → 8-слот маппер). CURRENT v1.3 `9c0386ab`, UNFROZEN, буквенное меню, без Sum/Max. Детали/история — в файле.
- [sends-follower.md](sends-follower.md) — **Sends Follower (Track+Return)** — пара standalone-девайсов, история всех правок (UI/цвета/маппер/движки), формат контейнера, CANON-md5, KNOWN-BEHAVIORS. **Читать перед любой правкой пары.** ⚠️ Канон/on-disk md5 быстро меняются (founder фризит/правит в Max) — ВСЕГДА md5 реального файла.
- [sends-follower-lfo.md](sends-follower-lfo.md) — **SendsFollower LFO.amxd** — эксперимент: маппер SF + свой нативный LFO-генератор (portable MSP). v1 `7ae739b3`. Детали — в файле.
- [mm-native.md](mm-native.md) — **MM Native.amxd** — нативная реплика стоковой «чёрной рамки» мульти-маппинга (тест-девайс). CURRENT v2 `fa8779d7`. Детали — в файле.

## Конвенции (железно)
- **Где редактировать Control XL (РАЗВОРОТ 2026-06-06):** основной артефакт = **User Library** `.amxd`. Пропагация дальше (репо, бандл-слоты, zip) — только по явной команде. Все 6 слотов = `28840e39…` (с 2026-06-10). Browser Load (CC51) + HW-feedback — ОТЛОЖЕНЫ. Детали/грабли zip/механизм — [controlxl-project-map.md](controlxl-project-map.md), [xl-performance.md](xl-performance.md).
- **Архив до правки.** Текущий девайс → `raw/archive/<Name>.YYYY-MM-DD.amxd` (если занято — `-HHMMSS`). Для XL_Performance это `~/Brain/Fadercraft/raw/archive/`. **Pre-edit backup обязателен ВСЕГДА.** Никогда не перезаписывать архив.
- **Правка на месте.** Меняем сам `.amxd`, не шлём куски кода, не просим руками патчить в Max.
- **Валидация перед подменой.** Re-parse JSON, счётчики boxes/lines, хвост байт-в-байт, инварианты размеров. Не сошлось — откат к архиву.
- **Перезагрузка в Live.** Live кеширует — убрать/добавить девайс заново; Max-редактор закрывать без сохранения.
- **⚠️ КООРДИНАТЫ/ПРАВКИ ПОЛЬЗОВАТЕЛЯ НЕПРИКОСНОВЕННЫ (founder 2026-06-18).** Если позиции/структура девайса изменились ПОСЛЕ твоей сборки — это правил founder руками; базируй правки на ТЕКУЩЕМ on-disk файле, сохраняй его позиции, меняй только запрошенное. Любой девайс. (= assistant-memory `feedback_dont_touch_user_edited_shapes`.) ⚠️ ЦВЕТА/ПРОЗРАЧНОСТЬ — см. [feedback-color-transparency-policy.md](feedback-color-transparency-policy.md).

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
