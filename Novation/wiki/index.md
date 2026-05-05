---
type: index
project: Novation
created: 2026-04-28
updated: 2026-05-05
---

# Wiki Index

**Summary**: Альтернативный плоский TOC вики проекта **Novation** (knowledge base вокруг `XL_Performance.amxd` для Launch Control XL MK3). Основной хаб с описаниями страниц и связями к raw-источникам — [[Novation XL]].

**Sources**: —

**Last updated**: 2026-05-05

---

## Roadmap

- [[roadmap]] — живой checklist прогресса Phase 0 + Phase 1, статус каждой задачи, тайские мото-права как backup-документ для KYC. Обновляется при каждом крупном шаге.

## Synthesis

- [[XL_Performance — как это работает]] — сквозной обзор: слои, поток событий, точки расширения.

## Sources

- [[XL_Performance README]] — канонический README патча `XL_Performance.amxd` (v1.5).

## Concepts

- [[Custom Modes Model]] — как LCXL MK3 хранит и переключает 14 custom-modes; роль CC30/ch7.
- [[Mode Encoding]] — формула `mode = 23 + bank + 2*((page+hold) % 2)` и таблица маппинга инструментов.

## Entities

- [[Mixer Layer]] — custom-modes 11–14, value-объекты `mixer_bank/page/hold`, UI.
- [[Instruments Layer]] — custom-modes 1–10, overlay CC (по умолчанию 49), фильтрация.
- [[CC47 Cross-Mode Transit]] — quick-jump между микшером и инструментами с памятью.
- [[Solo Follower]] — JS + LiveAPI, держит собственный трек заSOLOенным вместе с внешними; **неотъемлемая часть** XL_Performance.
- [[MIDI Passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
