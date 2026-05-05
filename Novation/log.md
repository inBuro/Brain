# Log — Novation

Хронология wiki проекта. Append-only, новые записи сверху.

---

## [2026-05-05] new layer | wiki/operations + Paddle Verification blocker

Источник: устные пояснения Кирилла + header-комментарий `Novation/web/functions/api/verify-license.js` на ветке `origin/t6/paddle-license`.

Контекст: до сих пор wiki содержала только тех-документацию устройства. Не было слоя для launch-блокеров и операционного состояния — из-за этого следующая сессия Claude (на любом устройстве) не могла понять связь между визитом в DLT 2026-05-06 и Paddle-верификацией. Теперь связь зафиксирована.

Создано:
- `wiki/operations/` — новый раздел для операционных страниц (статусы, блокеры, KYC, биллинг).
- [[Paddle Merchant Verification]] — цепочка Stripe rejected → Paddle pivot → KYC frozen → DLT visit → unfreeze; список того, что записать после визита.

Обновлено:
- [[wiki/index]] — добавлены секции «⚠️ Active Blockers» (наверху, чтобы новый Claude увидел первым) и «Operations».

Контекст-провал, который это закрывает: личные/операционные таски (визиты, документы, KYC) раньше жили только в голове и в удалённых ветках кода. Теперь они в wiki, и любая новая сессия начнёт с `cat wiki/index.md` и сразу увидит блокер.

## [2026-04-27] ingest | XL_Performance README v1.5

Source: [[raw/XL_Performance.README]] (12.6 KB).

Создано:
- [[Novation XL]] (изначально `index.md`, переименован 2026-04-29 для уникального узла в графе)
- [[XL_Performance — как это работает]] — синтез верхнего уровня.
- [[wiki/sources/XL_Performance README]]
- [[wiki/concepts/Custom Modes Model]]
- [[wiki/concepts/Mode Encoding]]
- [[wiki/entities/Mixer Layer]]
- [[wiki/entities/Instruments Layer]]
- [[wiki/entities/CC47 Cross-Mode Transit]]
- [[wiki/entities/Solo Follower]]
- [[wiki/entities/MIDI Passthrough]]

Базовый патрон ingest по [[../_Inbox/llm-wiki|llm-wiki]]: README → 1 source-страница + 5 entity + 2 concept + synthesis.
