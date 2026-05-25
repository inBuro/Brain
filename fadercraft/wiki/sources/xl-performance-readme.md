---
type: source
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: ingested
tags: [readme, m4l]
---

# XL_Performance README (v1.5)

**Summary**: Канонический README патча `XL_Performance.amxd` — авторская документация устройства, считается каноном вики.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

## Краткое содержание

- Назначение, распределение custom-modes (1–10 instruments, 11–14 mixer) (source: XL_Performance.README.md).
- ⚠️ README говорит «до 16 custom-modes», но фактическая ёмкость LCXL MK3 — **14 слотов** (уточнено 2026-04-28). Деталь и сверка: [[custom-modes-model]].
- Архитектура из 4 секций патча + passthrough + startup default (mode 11) (source: XL_Performance.README.md).
- [[mixer-layer]] — value-объекты `mixer_bank/page/hold`, формула, UI.
- [[instruments-layer]] — overlay CC (по умолчанию 49), фильтрация мусора, маппинг 1..10.
- [[cc47-cross-mode-transit]] — quick-jump в микшер и обратно.
- [[solo-follower]] — JS, LiveAPI observers, `topologyCheck` каждые 3 сек.
- [[midi-passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
- Видимые в Live параметры (`sf_active`, `mix_obj-*`).
- Точки расширения: смена listen CC, mode-select CC/ch, формула mixer, тюнинг JS.
- Тонкости: исключение собственного трека, retry при холодном старте, `forceOwnSolo` сравнивает перед `set`.

## Версии (на момент ingest)

- Patch comment: **v1.5** (source: XL_Performance.README.md).
- Внутренний тег router'а: **LCXL Overlay Router v18 (single Listen CC + mode by value)** (source: XL_Performance.README.md).
- Сохранён в Max **9.0.10 x64** (source: XL_Performance.README.md).

## Related pages

- [[novation-xl]] — корневой хаб проекта
- [[xl-performance-how-it-works]]
- [[custom-modes-model]]
- [[mode-encoding]]
- [[mixer-layer]]
- [[instruments-layer]]
- [[cc47-cross-mode-transit]]
- [[solo-follower]]
- [[midi-passthrough]]
