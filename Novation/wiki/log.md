---
type: log
project: Novation
created: 2026-04-28
---

# Wiki Log

Append-only журнал операций над вики.

---

## 2026-04-28 — ingest `raw/XL_Performance — как это работает.md`

- Прочитан новый source-файл (synthesis-документ, frontmatter `type: synthesis`).
- Создана synthesis-страница `wiki/XL_Performance — как это работает.md` со сквозным обзором, таблицей слоёв, потоком из 6 событий, видимыми параметрами и точками расширения. Цитаты `(source: …)` проставлены.
- Создан `wiki/index.md` — TOC по synthesis / sources / concepts / entities (ранее отсутствовал).
- Создан `wiki/log.md` (этот файл).
- Существующие entity- и concept-страницы не модифицированы — синтез согласуется с ними; правок не потребовалось.

## 2026-04-28 — lint pass

Источник правок — отчёт линта.

- **Format compliance.** Все 8 страниц вики (источник, оба concept-а, 5 entity, synthesis) приведены к формату CLAUDE.md: `**Summary**` / `**Sources**` / `**Last updated**` + `---` + контент + `## Related pages`. YAML-frontmatter сохранён, цитаты `(source: …)` проставлены.
- **Mixer Layer:** добавлены индикаторы `mix_obj-mode11-btn`..`mode14-btn` в раздел «Состояние» (восполнен гэп относительно README).
- **CC47 Cross-Mode Transit:** переформулирован save-point — явно отмечено, что отдельной save-переменной нет, `v instruments_mode` работает и как «текущий», и как save-point. Согласовано с Instruments Layer.
- **Solo Follower:** добавлены исходящие wiki-links (synthesis, README, MIDI Passthrough) — больше не semi-orphan.
- **`raw/XL_Performance — как это работает.md` удалён** из `raw/` — это был synthesis-черновик пользователя, его содержимое полностью переехало в `wiki/XL_Performance — как это работает.md`. В `raw/` теперь только истинно immutable-источники: `XL_Performance.README.md` и бинарь `XL_Performance.amxd`.
- **Wiki-links нормализованы по basename** (`[[Page Name]]` вместо `[[wiki/path/Page Name]]`) — Obsidian резолвит однозначно, читать проще.
- **`index.md`** обновлён под basename-стиль.

## 2026-04-28 — корректировка ёмкости LCXL: 14, не 16

Пользователь уточнил: LCXL MK3 фактически хранит **14** custom-modes, а не 16, как утверждает README v1.5.

- `wiki/concepts/Custom Modes Model.md` — изменено «до 16» → «до 14», удалена строка «15–16 свободно», добавлен явный блок «Расхождение с источником» с пометкой, что README ошибается.
- `wiki/XL_Performance — как это работает.md` — «16» → «14» в идее-абзаце, добавлено упоминание ошибки README.
- `wiki/sources/XL_Performance README.md` — добавлен предупреждающий пункт о расхождении и ссылка на Custom Modes Model.
- `raw/XL_Performance.README.md` **не правился** (раздел `raw/` immutable per CLAUDE.md).

## 2026-04-28 — feature-request: Solo Follower без смены фокуса

Пользователь сообщил, что во время рифф-перформанса фокус Live сбивается на заSOLOенный трек, что мешает играть. Желаемое поведение: solo-зеркалирование собственного трека сохранить, но фокус (`selected_track`) больше **не** менять.

- `wiki/entities/Solo Follower.md` — добавлен раздел «Запланированные изменения» с описанием запроса, точкой правки в `solo_follower.js` (`selectTrackById` в `scheduleApply`), вариантами реализации (удалить совсем vs UI-toggle `sf_focus`) и открытым вопросом, какой вариант выбрать.
- Сам `solo_follower.js` пока не правлен — файл живёт рядом с `XL_Performance.amxd` (вне отслеживаемой `raw/`/`wiki/`-структуры) и в текущем рабочем каталоге не найден.
