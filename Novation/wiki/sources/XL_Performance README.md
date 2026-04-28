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
- ⚠️ README говорит «до 16 custom-modes», но фактическая ёмкость LCXL MK3 — **14 слотов** (уточнено 2026-04-28). Деталь и сверка: [[Custom Modes Model]].
- Архитектура из 4 секций патча + passthrough + startup default (mode 11) (source: XL_Performance.README.md).
- [[Mixer Layer]] — value-объекты `mixer_bank/page/hold`, формула, UI.
- [[Instruments Layer]] — overlay CC (по умолчанию 49), фильтрация мусора, маппинг 1..10.
- [[CC47 Cross-Mode Transit]] — quick-jump в микшер и обратно.
- [[Solo Follower]] — JS, LiveAPI observers, `topologyCheck` каждые 3 сек.
- [[MIDI Passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
- Видимые в Live параметры (`sf_active`, `mix_obj-*`).
- Точки расширения: смена listen CC, mode-select CC/ch, формула mixer, тюнинг JS.
- Тонкости: исключение собственного трека, retry при холодном старте, `forceOwnSolo` сравнивает перед `set`.

## Версии (на момент ingest)

- Patch comment: **v1.5** (source: XL_Performance.README.md).
- Внутренний тег router'а: **LCXL Overlay Router v18 (single Listen CC + mode by value)** (source: XL_Performance.README.md).
- Сохранён в Max **9.0.10 x64** (source: XL_Performance.README.md).

## Related pages

- [[XL_Performance — как это работает]]
- [[Custom Modes Model]]
- [[Mode Encoding]]
- [[Mixer Layer]]
- [[Instruments Layer]]
- [[CC47 Cross-Mode Transit]]
- [[Solo Follower]]
- [[MIDI Passthrough]]
