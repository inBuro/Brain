---
type: index
project: Fadercraft
created: 2026-04-28
updated: 2026-05-15
---

# Wiki Index

**Summary**: Альтернативный плоский TOC вики проекта **Fadercraft** (knowledge base вокруг `Control XL` — M4L-устройства для Novation Launch Control XL MK3). Основной хаб с описаниями страниц и связями к raw-источникам — [[novation-xl]].

**Sources**: —

**Last updated**: 2026-05-06

---

## Roadmap

- [[roadmap]] — живой checklist прогресса Phase 0 + Phase 1, статус каждой задачи, тайские мото-права как backup-документ для KYC. Обновляется при каждом крупном шаге.
- [[landing-narrative]] — 10-битная психологическая дуга лендинга `fadercraft.com`, маппинг бит → секция → компонент, обоснование отклонений от исходной спеки.

## Reference

- [[payment-rails]] — матрица платёжных рельсов (PayPal/Stripe/Lemon/Polar/Patreon/Paddle/Payhip/Payoneer/Isotonik/crypto/Georgian IE) с вердиктами под профиль «русский паспорт + Таиланд», расшифровка какие тайские документы что разблокируют.
- [[design-system]] — полный аудит Fadercraft / Control XL DS: токены (Colors/Spacing/Radius/Typography), инвентарь компонентов, состояние code-parity, TODO для production-ready.

## Synthesis

- [[xl-performance-how-it-works]] — сквозной обзор: слои, поток событий, точки расширения.

## Sources

- [[xl-performance-readme]] — канонический README патча `XL_Performance.amxd` (v1.5).

## Concepts

- [[custom-modes-model]] — как LCXL MK3 хранит и переключает 14 custom-modes; роль CC30/ch7.
- [[mode-encoding]] — формула `mode = 23 + bank + 2*((page+hold) % 2)` и таблица маппинга инструментов.

## Entities

- [[mixer-layer]] — custom-modes 11–14, value-объекты `mixer_bank/page/hold`, UI.
- [[instruments-layer]] — custom-modes 1–10, overlay CC (по умолчанию 49), фильтрация.
- [[cc47-cross-mode-transit]] — quick-jump между микшером и инструментами с памятью.
- [[solo-follower]] — JS + LiveAPI, держит собственный трек заSOLOенным вместе с внешними; **неотъемлемая часть** XL_Performance.
- [[midi-passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
