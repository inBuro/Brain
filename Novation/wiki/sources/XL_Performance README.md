---
type: source
project: Novation
created: 2026-04-27
updated: 2026-04-27
status: ingested
tags: [readme, m4l]
---

# XL_Performance README (v1.5)

Источник: [[../../raw/XL_Performance.README]] — авторская README патча `XL_Performance.amxd`. Считается каноном.

## Краткое содержание

- Назначение, распределение custom-modes (1–10 instruments, 11–14 mixer).
- Архитектура из 4 секций патча + passthrough + startup default (mode 11).
- [[../entities/Mixer Layer]] — value-объекты `mixer_bank/page/hold`, формула, UI.
- [[../entities/Instruments Layer]] — overlay CC (по умолчанию 49), фильтрация мусора, маппинг 1..10.
- [[../entities/CC47 Cross-Mode Transit]] — quick-jump в микшер и обратно.
- [[../entities/Solo Follower]] — JS, LiveAPI observers, `topologyCheck` каждые 3 сек.
- [[../entities/MIDI Passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
- Видимые в Live параметры (`sf_active`, `mix_obj-*`).
- Точки расширения: смена listen CC, mode-select CC/ch, формула mixer, тюнинг JS.
- Тонкости: исключение собственного трека, retry при холодном старте, `forceOwnSolo` сравнивает перед `set`.

## Версии (на момент ingest)

- Patch comment: **v1.5**
- Внутренний тег router'а: **LCXL Overlay Router v18 (single Listen CC + mode by value)**
- Сохранён в Max **9.0.10 x64**.

## Связанные страницы

[[../../XL_Performance — как это работает]] · [[../concepts/Custom Modes Model]] · [[../concepts/Mode Encoding]]
