---
type: index
project: Novation
created: 2026-04-28
updated: 2026-05-06
---

# Wiki Index

**Summary**: Альтернативный плоский TOC вики проекта **Novation** (knowledge base вокруг `Control XL.amxd` для Launch Control XL MK3). Основной хаб с описаниями страниц и связями к raw-источникам — [[Novation XL]].

**Sources**: —

**Last updated**: 2026-06-17

---

## Roadmap

- [[roadmap]] — живой checklist прогресса Phase 0 (Control XL, 100%) + Phase 1 (post-launch дистрибуция) + **Phase 2 — Sends Follower launch** (лин-запуск продукта #2, **23 задачи / 4 done (~17%)**, [NEW] vs [REUSE]; деливерабл = рэк `SendsFollowerRack.adg` + Quickstart; **девайс заморожен `b5286b33`** + update-check вшит зеркально Control XL; нейминг ЗАКРЫТ → «Sends Follower»; видимый блок «🎯 Ближайшие шаги»: деплой в preview → хардвер-проверка update-check → откат манифеста 9.9.9→1.0 → 1-стр. спека). Обновляется при каждом крупном шаге.
- [[landing-narrative]] — 10-битная психологическая дуга лендинга `fadercraft.com`, маппинг бит → секция → компонент, обоснование отклонений от исходной спеки.
- [[demo-video-script]] — one-page shooting script главного демо-видео (~3 мин): hook → MIDI-routing setup → три сигнатурные фичи → close. Точки нарезки совпадают с 3 feature-шортами. Для T9 в [[roadmap]].
- [[youtube-video-description]] — описание демо-видео для YouTube (черновик); главы пока плейсхолдеры.
- [[gumroad-description]] — копи для Gumroad: страница продукта, чек-нота (receipt), bundle-сводка.
- [[copy-inventory]] — единый хаб всей текстовой копи под анализ: снапшот живых строк лендинга из кода + ссылки на VO/скрипт/нарратив/YT/Gumroad.

## Reference

- [[payment-rails]] — матрица платёжных рельсов (PayPal/Stripe/Lemon/Polar/Patreon/Paddle/Payhip/Payoneer/Isotonik/crypto/Georgian IE) с вердиктами под профиль «русский паспорт + Таиланд», расшифровка какие тайские документы что разблокируют.
- [[external-links]] — единая таблица всех внешних ссылок Fadercraft (соцсети, Gumroad, support, лендинг); single source of truth для футера и outreach.
- [[outbound-links]] — все campaign-tracked vanity-редиректы (UTM short links) для YT/Reddit-плейсментов; правила (новый канал = новый редирект до публикации), таблицы по кампаниям, процедура add→deploy→verify. Зеркало `app/public/_redirects`.

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
- [[Browser Load]] — ⛔ ОТЛОЖЕНО (свёрнуто 2026-06-06): Live Browser НЕ выставлен в M4L LiveAPI, загрузить выделенный item из `.amxd` невозможно; если вернётся — делать в Python remote-script. Все артефакты Control XL откачены на чистый md5 `44aa142b`.
- [[Version Check (Update Notifier)]] — Node for Max пингует `/api/version.json`, зажигает кнопку «Update ready» при выходе новой версии. Статус: works-locally, нужен freeze для рассылки.
