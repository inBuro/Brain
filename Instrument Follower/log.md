# Log — Instrument Follower

Хронология wiki проекта. Append-only, новые записи сверху.

---

## [2026-05-07] ingest #1 — rack-controller-bridge-discussion

Заполнена структура вики на основе `raw/rack-controller-bridge-discussion.md` (single source — лог дискуссии, в которой зафиксирована финальная архитектура устройства). Сопроводительный `raw/lcxl_mk3_rgb_test.maxpat` упомянут в entity [[lcxl-mk3-rgb-test-patch]].

- 1 source: [[rack-controller-bridge-discussion]].
- 4 entity: [[instrument-follower-device]], [[lcxl-mk3]], [[lcxl-mk3-rgb-test-patch]], [[knobbler]].
- 8 concept: [[core-driver-architecture]], [[knobbler-style-mapping]], [[auto-fill]], [[rack-color-knobs]], [[value-feedback]], [[sysex-rgb-protocol]], [[macro-variations]], [[phasing-roadmap]].
- Обновлены [[Instrument Follower|hub]], [[wiki/index]], [[wiki/log]].

Открытые вопросы вынесены в страницы [[lcxl-mk3]], [[sysex-rgb-protocol]] и source-страницу — точные encoder indices, работа color SysEx в Custom Mode, escape hatch для не-Rack параметров, OLED protocol, save format маппингов.

---

## [2026-05-06] init

Создана структура проекта по шаблону [[../_Inbox/llm-wiki|llm-wiki]] (паттерн Карпати):

- `Claude.md` — правила ведения wiki (копия из `Novation/Claude.md`).
- `Instrument Follower.md` — корневой хаб проекта (пустые таблицы Sources / Entities / Concepts до первого ingest).
- `log.md` — этот файл.
- `raw/` — пусто, ждёт первый источник.
- `wiki/index.md` — плоский TOC (пуст).
- `wiki/log.md` — журнал операций над wiki (пуст).
- `wiki/concepts/`, `wiki/entities/`, `wiki/sources/` — пусто.
