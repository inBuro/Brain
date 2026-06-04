---
type: index
project: Novation
created: 2026-04-28
updated: 2026-05-06
---

# Wiki Index

**Summary**: Альтернативный плоский TOC вики проекта **Novation** (knowledge base вокруг `Control XL.amxd` для Launch Control XL MK3). Основной хаб с описаниями страниц и связями к raw-источникам — [[Novation XL]].

**Sources**: —

**Last updated**: 2026-05-26

---

## Roadmap

- [[roadmap]] — живой checklist прогресса Phase 0 + Phase 1, статус каждой задачи, тайские мото-права как backup-документ для KYC. Обновляется при каждом крупном шаге.
- [[landing-narrative]] — 10-битная психологическая дуга лендинга `fadercraft.com`, маппинг бит → секция → компонент, обоснование отклонений от исходной спеки.
- [[demo-video-script]] — one-page shooting script главного демо-видео (~3 мин): hook → MIDI-routing setup → три сигнатурные фичи → close. Точки нарезки совпадают с 3 feature-шортами. Для T9 в [[roadmap]].

## Reference

- [[payment-rails]] — матрица платёжных рельсов (PayPal/Stripe/Lemon/Polar/Patreon/Paddle/Payhip/Payoneer/Isotonik/crypto/Georgian IE) с вердиктами под профиль «русский паспорт + Таиланд», расшифровка какие тайские документы что разблокируют.
- [[external-links]] — единая таблица всех внешних ссылок Fadercraft (соцсети, Gumroad, support, лендинг); single source of truth для футера и outreach.

## Synthesis

- [[XL_Performance — как это работает]] — сквозной обзор: слои, поток событий, точки расширения.

## Sources

- [[XL_Performance README]] — канонический README патча `Control XL.amxd` (v1.5).

## Concepts

- [[Custom Modes Model]] — как LCXL MK3 хранит и переключает 14 custom-modes; роль CC30/ch7.
- [[Mode Encoding]] — формула `mode = 23 + bank + 2*((page+hold) % 2)` и таблица маппинга инструментов.
- [[Custom Mode SysEx Layout]] — байт-уровневая структура `.syx`-файла мода, reverse-engineered: header, control descriptor (11 байт), mode-index байт и его исключения (`always-13`, `+32 flag`, `linked-bank`), алгоритм генерации модов из template.
- [[discord-server-setup]] — финальная спека Discord-сервера Fadercraft (settings, channels, roles, готовая копия welcome/rules/первого announcements). Для T14 в [[roadmap]].

## Entities

- [[Mixer Layer]] — custom-modes 11–14, value-объекты `mixer_bank/page/hold`, UI.
- [[Instruments Layer]] — custom-modes 1–10, overlay CC (по умолчанию 49), фильтрация.
- [[CC47 Cross-Mode Transit]] — quick-jump между микшером и инструментами с памятью.
- [[Solo Follower]] — JS + LiveAPI, держит собственный трек заSOLOенным вместе с внешними; **неотъемлемая часть** XL_Performance.
- [[MIDI Passthrough]] — verbatim notes/bend/aftertouch/program; CC режутся `[sel 30 31]`.
- [[Version Check (Update Notifier)]] — Node for Max пингует `/api/version.json`, зажигает кнопку «Update ready» при выходе новой версии. Статус: works-locally, нужен freeze для рассылки.
