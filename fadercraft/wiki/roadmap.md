---
type: roadmap
project: Novation
created: 2026-05-05
updated: 2026-06-10 (T9 демо-видео ЗАКРЫТ к launch — видео финал на YouTube ID UsJxPBdf568, вшито в лендинг, канал+описание готовы; 5 клипов→Phase 1. Продакт-решения: pricing.html отменён (цена в CTA); «last in chain» гринлайт→кластер A; mode 15 ЗАКРЫТ (байт 574=110, 5 копий синхронизированы). Bundle-фиксы: custom-modes/ в Demo+Starter, девайс переименован Control XL.amxd + Router.als refs. Зипы пересобраны (custom-modes верхним уровнем, Control XL.amxd, README, Session view). Demo 191.7МБ принят как есть (продакт-решение, чистку не делаем). Зипы РЕСТРУКТУРИЗИРОВАНЫ + папка → `15 Custom Modes`, вид сетов исправлен (семантика была инвертирована: 1=Session/0=Arrangement, все .als=Session). README убран из бандла. Баг Router.als (не находил девайс) ПОЧИНЕН. Источник сборки = только `dist/`, мастер Projects/custom-modes снесён ([[reference_bundle_build_source]]). Финальные зипы на Gumroad. ВНЕШНЯЯ update-ссылка (version.json-driven) — работает на железе. Email/update-check/license-endpoint/лендинг — проверены. **tag `v1.0` поставлен и запушен. Phase 0 = 121/121 = 100% 🚀 — все категории закрыты. Тайм-коды глав, Router-строка в Gumroad, Discord-пост — done. Anonymous heartbeat → Phase 1. Продукт ГОТОВ К ЗАПУСКУ — остаётся только публикация Discord-поста по отмашке.**)
---

# Fadercraft Roadmap

**Summary**: Живой checklist прогресса по запуску **Fadercraft XL Performance** (M4L-устройство для Novation Launch Control XL MK3). Основной хаб проекта — [[Novation XL]]. Спека и план — `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` и `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md`.

**Implementation workspace**: `~/Projects/Claude/Fadercraft/` (раньше `novation/`, переименовано 2026-05-06). Там живут: design system tokens, React-компоненты, Figma parity. Эта папка (Brain) — только планирование.

**Sources**: spec + Phase 0 plan + chat-history с Claude.

**Last updated**: 2026-06-18 (PM, **🔧 КОРРЕКЦИЯ к окну: r/abletonlive `1u74c6t` живой тред перевернул чтение — «двигатель окна» = ВРАЖДЕБНЫЙ pile-on, не успех.** Score просел до ≈1, 18 комментов все враждебные («OP is posting an ad… AI generated» +7), ВСЕ ответы основателя в минусе (−6/−11/−9/−2/−1/+1) — наказан AI-регистр ответов. «100% ratio» был vanity-снимок launch-часа. Сильнейшее подтверждение «угол верный — подача убивает» (#1) на контрасте TrieMond YouTube-флип↔этот закопанный тред — ОДИН человек, два регистра. Закрыто: комменты получены (враждебные); UTM = `/r-abl` редирект (НЕ голый), атрибуция чистая. **НОВЫЙ insight #24: ответ в AI-регистре строго ХУЖЕ молчания — отвечать как на YouTube-флипе (3 конкретных существительных, свой голос) ИЛИ не отвечать.** AI-персона+AMA в пуристском сабе РЕТАЙРНУТА; PRIORITY RAISED на corrected-format r/ableton retry (единственный чистый own-voice тест). Канальный сплит СТОИТ. Прежнее — **📊 SOCIAL-ОКНО 06-11→06-18 сведено** — канальный сплит: Reddit ≈52% сессий (39) гонит ТРАФИК+любопытство но 0 buy_click/0 продаж (садит на бесплатные моды — insight #7); maxforlive = 3 сессии но единственный покупатель (sale #1 $39 NL); buy_click=4 (первые в истории) — ни один из Reddit; YouTube flip @triemond9961 hostile→advocate (резонанс, не продажа). n=1: maxforlive НЕ коронуем, Reddit НЕ хороним (мис-таргетед). Приоритеты: P1 следующий Reddit-пост на ПРОДУКТОВУЮ страницу + свой `/x` UTM; ~~P2 закрыть r/abletonlive `1u74c6t`~~ ЗАКРЫТО (см. коррекцию выше); P3 corrected-format r/ableton retry — кандидат, не форсим; P4 кормить maxforlive дешёвыми рычагами; P5 собрать YouTube-flip как копи/соц-актив. Открытый item: URL `organic`-поста не задокументирован. Детали: PM `launch-journal.md` 2026-06-18. Прежнее 2026-06-17 — **🛒 POST-PURCHASE JOURNEY & PIPELINE** — по разбору первой продажи заведён новый блок под Phase 1: два РАЗНЫХ трека PIPELINE (видеть продажи) ≠ JOURNEY (опыт покупателя). MUST = починить pipeline (реальный `purchase` в PostHog / штамп Buy-ссылки `ph_did/variant/utm` / email+`$identify` для когорты «купившие») — дёшево, разово, компаундит, гейт на чтение продажи №2. SHOULD = онбординг (верифицировать receipt-ссылки + Discord-инвайт, Quickstart выносит MIDI-routing первым, ОДНА человеческая записка покупателю #1 в шейпе insight #10, дверь для фидбэка = reply-email). LATER (гейт по объёму, НЕ строить под одного) = device heartbeat / VideoAsk ≥5 / Discord auto-role ≥10-20 / drip. **License key вердикт = KEEP-AS-IS** (есть+работает endpoint, НЕ энфорсить в девайсе — фрикшн+support при нулевом апсайде, НЕ убирать — единственный будущий anti-piracy хук). Тихий покупатель = норма, не проблема; Discord-pull при n=1 де-приоритизирован. Детали: PM `launch-journal.md`, insight #20. Прежнее — **🎯 ПЕРВАЯ РЕАЛЬНАЯ ПРОДАЖА Control XL** — GO-условие strategic checkpoint выполнено pending-атрибуция; доказывает воронку+ценовую кликабельность+резонанс→деньги, НЕ доказывает PMF/канал/линейку при n=1; источник продажи неизвестен — ждём atrib. от analyst + Gumroad-данные основателя; приоритеты P1 атрибуция → P2 поговорить с покупателем → P3 проверенный канал/формат → P4 первое соц-доказательство → P5 first-impression polish; повторяемость читаем на 2-3 продажах, не дёргаемся на одной. Детали: PM `launch-journal.md`, insight #19. Прежнее — **Phase 2 Sends Follower — прогресс за день**: ✅ **freeze девайса DONE** (m4l-master) — md5 `b5286b33`, `sends_follower.js`+`sf_version_check.js` вшиты, девайс самодостаточный, рэк грузит замороженный девайс, LFO=сток-Live не бандлим, дата-бэкап в `~/Brain/Sends Follower/raw/archive/`, семвер-смоук прошёл; ✅ **update-check «New Version» зеркально Control XL** (`DEVICE_VERSION='1.0'`, `URL='…/api/sends-follower.json'`); ✅ **серверный манифест создан** (в репо, не задеплоен, сейчас `latest=9.9.9` ТЕСТ → откатить на 1.0 перед запуском); ✅ **site build чистый**, нейминг+манифест в `dist`. ✅ **Открытый вопрос #1 НЕЙМИНГ ЗАКРЫТ → «Sends Follower» (два слова)**, применено в коде (`HomePage`/`SendsFollowerPage`/`seo-meta`), идентификаторы (`SendsFollowerPage`/`SendsFollower.amxd`/`/sends-follower`) как есть. Счётчик Phase 2 **1→4 задачи done из 23 (~17%)** (P2.1 = 3/5). **БЛИЖАЙШИЕ ШАГИ:** (1) деплой в preview-ветку (прод не трогаем, по команде); (2) хардверная проверка update-check end-to-end (нюанс: в девайсе прод-URL, проверять на preview); (3) откат манифеста 9.9.9→1.0; (4) 1-стр. спека «что делает Sends Follower» (блокер копи+видео). Орг-флаг: бэкап+wiki легли в новую папку `~/Brain/Sends Follower/` отдельно от Fadercraft — открытый вопрос про консолидацию. Детали: PM `launch-journal.md` 2026-06-17. Прежнее: **Phase 2 SendsFollower — уточнения основателя внесены**: (1) **деливерабл = Audio Effect RACK `SendsFollowerRack.adg`** (внутри девайс + LFO), а не голый `.amxd`; (2) **Quickstart ОБЯЗАТЕЛЕН** — добавлен в состав бандла и в P2.2 как [NEW]; (3) **впекание `sends_follower.js` во freeze** = подтверждённая in-scope под-задача P2.1 (+ проверка, что рэк грузит замороженный девайс); (4) **update-check ПОДТВЕРЖДЁН** — делаем как у Control XL, девайс пингует `/api/sends-follower.json`; (5) **серверный манифест `app/public/api/sends-follower.json` СОЗДАН** (в репо, не задеплоен — P2.4 done), новая m4l-задача про endpoint в `version_check.js`. Счётчик 21→**23 задачи, 1 done (~4%)**. Открыт по-прежнему #1 нейминг SendsFollower↔Sends Follower. Прежнее: новый блок «Phase 2 — SendsFollower launch» добавлен — лин-запуск второго платного продукта (M4L-девайс, software-only) на готовой инфраструктуре Control XL, [NEW] vs [REUSE]. Сознательно НЕ делаем: scroll-morph/интерактивный мокап, custom-modes funnel, отдельную pricing, 5 клипов; только одно презентационное видео. Детали: PM `launch-journal.md` 2026-06-17. Прежнее 2026-06-16 — **Isotonik outreach ОТПРАВЛЕН** — Kirill написал в Isotonik сегодня; канал из «гейтнуто» → «**письмо ушло, ждём ответа**»; ушёл ДО закрытия тайминг-гейта, риск LOW-to-MODERATE асимметричный/в основном OK т.к. relationship-канал прощает слабое первое впечатление; логика polish переворачивается — доделать ассеты СЕЙЧАС, чтобы дослать в follow-up; soft-чек окна ответа ~06-23; условия держать при ответе. Открытый вопрос: питч ушёл вхолодную или с demo. Содержание письма PM неизвестно. Подробности: PM `launch-journal.md` 2026-06-16. Также 2026-06-16: Novation manufacturer-outreach — support-тикет 2493139, ответ тёплый но non-committal, закрыто low-priority. Прежнее 2026-06-12 — 3 решения основателя по reddit-каналу и дистрибуции: (1) **Reddit-мониторинг = F5Bot (бесплатно) заведён** — базовый монитор упоминаний по проблемным keywords + имени; DIY-JSON-монитор отложен; AI-авто-реплай исключены принципиально (rule-12). (2) **F5Bot keyword-set задокументирован** (core ICP-железо + pain/intent фразы). (3) **Isotonik Studios переклассифицирован** из payment-rail/reseller в **distribution + credibility канал** — собранная профильная аудитория (лекарство от проблемы №1), MK3-щель = комплементарны, оценивают качество не цифры → actionable до первой продажи; тайминг = после полировки maxforlive-листинга+демо; условия (не-эксклюзив обязателен / rev-split / чьи данные) зафиксированы до контакта. Phase 1 distribution/маркетинг-блок: **9/20 (~45%)** (F5Bot закрыт). Прежнее: ★ maxforlive listing ОПУБЛИКОВАН (device id 15522, MIDI Effect, цена не в листинге, discovery = внутренний поиск). Pending: Search Console sitemap, замер моста + retention-чек ~06-17, keyword-тюнинг F5Bot ~06-19. Подробности: PM `launch-journal.md` + `insights.md` #13/#14)

**Payment rails matrix**: [[payment-rails]] — вердикты по всем рассмотренным платформам (PayPal/Stripe/Lemon/Polar/Patreon/Paddle/Payhip/Payoneer/Isotonik/crypto/Georgian IE) под профиль русский паспорт + Таиланд + Bangkok Bank, без тайского national ID.

---

## Сводка прогресса

| Категория | Сделано | Всего | % |
|---|---|---|---|
| Foundation (spec/plan/brand) | 3 | 3 | 100% |
| T1 Domain | 5 | 5 | 100% |
| T2 Email | 13 | 13 | 100% |
| T6 Server endpoints | 6 | 6 | 100% |
| T7 Placeholder pages | 6 | 6 | 100% |
| Gumroad onboarding | 5 | 5 | 100% |
| T3 Brand identity | 7 | 7 | 100% |
| T5 Instagram | 3 | 3 | 100% |
| T7-real Лендинг | 10 | 10 | 100% |
| T8 M4L update integration | 9 | 9 | 100% |
| T9 Демо-видео | 10 | 10 | 100% |
| T10 Документация | 3 | 3 | 100% |
| T11 Newsletter (Gumroad follow) | 1 | 1 | 100% |
| T12 Bundle assembly | 21 | 21 | 100% |
| T13 Final verification | 6 | 6 | 100% |
| T14 Discord community | 11 | 11 | 100% |
| T15 Analytics (Clarity) | 2 | 2 | 100% |
| **ИТОГО Phase 0** | **121** | **121** | **100% 🚀** |

Out-of-band (не блокируют Phase 0):

| Трек | Статус |
|---|---|
| Тайские мото-права (motorbike) | ✅ получены 2026-05-25 |
| Payment rails alt (Payoneer/Isotonik/crypto/GE) | deferred → Phase 1 |
| Тайские car-права | deferred → Phase 1+ |

---

## ✅ Foundation

- [x] Спека `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` написана и закоммичена
- [x] Phase 0 implementation plan `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md` написан и закоммичен
- [x] Имя бренда выбрано: **Fadercraft** (отбракованы Setforge, Backline, Patchcraft, Faderwork, Setcraft)

## ✅ T1 Domain & DNS

- [x] Домен `fadercraft.com` куплен на Cloudflare Registrar
- [x] DNS namervers активны (anita / rohin)
- [x] CNAME `www`
- [x] ~~CF Pages подключён к GitHub `inBuro/Brain`, root `fadercraft/web`~~ → **МИГРИРОВАНО 2026-06-01**: деплой уехал из Brain в проектный репо `inBuro/fadercraft-landing` (CF Pages проект `fadercraft-landing`, direct-upload через wrangler). Brain больше не публикует. Детали: [[reference-fadercraft-deploy]]
- [x] Custom domain `fadercraft.com` замаплен на CF Pages (проект `fadercraft-landing`), SSL active

## ✅ T2 Email infrastructure

- [x] CF Email Routing включён, MX + DKIM + SPF
- [x] Destination `hellokbbureau@gmail.com` верифицирован
- [x] Routes: `hello@`, `support@`, `noreply@` + catch-all (Drop)
- [x] Inbound тест пройден
- [x] SendGrid free tier зарегистрирован
- [x] Domain Authentication: 3 CNAMEs в CF DNS (DNS-only)
- [x] SendGrid Verify ✅ (`em678.fadercraft.com`)
- [x] SendGrid API key создан и сохранён
- [x] Gmail «Send mail as» подключён к SendGrid SMTP
- [x] DMARC TXT-запись с `rua=mailto:hello@fadercraft.com`
- [x] **mail-tester.com end-to-end: 8.3/10, SPF/DKIM/DMARC = PASS**
- [x] `brand/email-setup.md` документация закоммичена
- [x] GitGuardian false-positive алерт диагностирован

## ✅ T6 Server endpoints

- [x] `web/api/version.json` — endpoint update-check
- [x] `web/update.html` — license-key entry форма
- [x] `web/functions/api/verify-license.js` — Pages Function (Gumroad — канонический на `main`)
- [x] ~~Branch `t6/paddle-license`~~ — **abandoned** (Paddle отменён 2026-05-25, см. Gumroad onboarding ниже)
- [x] Quickstart.md написан (subagent)
- [x] Buttondown welcome email черновик добавлен в `brand/email-setup.md`

## ✅ T7 Placeholder pages

- [x] `web/index.html` — placeholder лендинг
- [x] `web/pricing.html`
- [x] `web/terms.html` (~830 слов)
- [x] `web/privacy.html` (~620 слов)
- [x] `web/refund.html` (~310 слов)
- [x] Footer-навигация на всех страницах

## ⏳ Gumroad onboarding

После отказа от Paddle 2026-05-25 (Sumsub-цикл затянулся, Gumroad принимает русский паспорт без блокеров). Gumroad — единственный payment rail для v1.0 launch.

- [x] **KYC пройден** (2026-05-25)
- [x] Tax setup (W-8BEN для non-US, выбор tax jurisdiction) — **2026-05-26**
- [x] Payout-реквизиты — **2026-05-26**
- [x] Страница продукта: описание, цена $39, URL slug `xl-performance` — **2026-05-26** (cover image + thumbnail заменены на брендовые **2026-05-26**, дефолтная розовая плашка снята)
- [x] Content upload (bundle zip) — **2026-06-03**: оба zip (Demo/Starter) залиты в Content tab, качаются со страницы покупки; welcome+quickstart-текст вставлен **2026-05-26**

---

## 🚀 Phase 1 — Alternative payment rails (post-launch, deferred)

После v1.0 launch, если будут конкретные триггеры (см. [[payment-rails]] для матрицы).

### Payoneer (USD-приёмник)
- [ ] Триггер: Gumroad payout через банк дороже Payoneer
- [ ] Регистрация: passport + Thai address proof (motorbike DL ✅ доступен)
- [ ] Verify identity → Linked Bangkok Bank THB → тестовый transfer

### Isotonik Studios (DISTRIBUTION + credibility канал — АУТРИЧ ОТПРАВЛЕН 2026-06-16, ждём ответа)
> **Статус (PM 2026-06-16):** **outreach ОТПРАВЛЕН 2026-06-16** — Kirill написал в Isotonik сегодня. Канал перешёл из «запланировано/гейтнуто» в «**письмо ушло, ждём ответа**». Содержание письма PM неизвестно (текст / кому именно / через какую форму-почту — не сообщено; `sales@isotonikstudios.com` ниже был ПЛАНОМ, не подтверждённым каналом отправки). Открытый вопрос: ушёл питч **вхолодную** (без demo/превью) или **тёплым** (с demo/превью/ссылкой) — это единственное, что меняет вывод. Подробности: PM `launch-journal.md` 2026-06-16.
> **Переоценка PM 2026-06-12:** это НЕ просто payment-rail/reseller-строка. Реальная ценность — **distribution + credibility**, не платёжный шлюз. Isotonik ведёт **Isotonik Collective** (курируемая группа сторонних разработчиков, чьи девайсы они дистрибутят под своим зонтиком), т.е. брать чужие девайсы — их штатная мотивация. Три структурных плюса: (a) **собранная профильная аудитория** Ableton/M4L power-users — прямое лекарство от проблемы №1 (ноль трафика), её мы сами дёшево не построим; (b) их **LaunchControl XXL не поддерживает MK3** → мы закрываем щель в их Novation-линейке = комплементарны, не конкурируем → «вам не хватает MK3, мы закрываем» вместо «конкурируем с вашим XXL»; (c) **заёмная кредибилити** снимает возражение «новый бренд, 0 отзывов». Оценивают **качество девайса, а не наши цифры** → actionable ДО первой продажи. Тип канала — borrowed-audience B2B (чужая аудитория + эндорсмент), отдельный от self-serve листингов/постов. Подробности: PM `insights.md` (**#14 new**), `launch-journal.md` 2026-06-12.
- [x] Триггер сработал: Control XL готов + демо-видео опубликовано (пилот, 2026-06-10) → можно питчить
- [x] **Outreach ОТПРАВЛЕН 2026-06-16** (Kirill). Ушёл ДО закрытия тайминг-гейта ниже (питч раньше полировки maxforlive-превью + сайт Demo kit-line + демо). **Оценка риска: LOW-to-MODERATE, асимметричный, в основном OK** — Isotonik это *relationship*-канал, не публичный пост: слабое первое впечатление приватного письма обратимо (можно дослать полированные ассеты в follow-up), в отличие от публичного reddit-ratio. Реально дорого только в случае «холодный питч без demo/превью» (Isotonik оценивает качество девайса — тонкое письмо его прячет → мягкое «не сейчас»), и даже это recoverable. НЕ переигрывать — решение основателя двигаться сейчас перекрывает мою последовательность (правило «direction, not contract»).
- [ ] ~~Тайминг-гейт: питчить ПОСЛЕ полировки maxforlive-листинга + демо~~ → **гейт пройден фактом отправки.** Логика переворачивается: вместо «полировка ДО питча» → **доделать polish-items СЕЙЧАС, пока ждём ответа**, чтобы было что вручить в момент ответа / в follow-up (maxforlive-превью, сайт Demo kit-line, чистая demo-ссылка). Если первое письмо было тонким — именно это его спасает.
- [ ] **Ждём ответа.** Доп-сообщений / nudge сейчас НЕ слать (один outbound на канал, дать отлежаться — anti-impulse). Soft-чек окна ответа ~**2026-06-23** (неделя): нет ответа → решать про полированный follow-up другому контакту или перенацел на artist-relations (тот же путь warm-intro в Novation). Ответ пришёл → переоткрыть немедленно.
- [ ] Email-канал (ПЛАН был `sales@isotonikstudios.com`; фактический канал отправки PM неизвестен; **питч готовил copywriter отдельно**, не PM-артефакт)
- [ ] **Условия держать при ответе (зафиксированы, чтобы не уступить под энтузиазмом ответа):** **не-эксклюзив ОБЯЗАТЕЛЕН** (сохранить Gumroad/maxforlive/лендинг живыми); revenue split (заметная доля — считать против маржи прямых продаж); **чьи данные клиента** (важно для umbrella-бренда). Минорный риск принят: раскрытие MK3-решения нишевому соседу (низкий — они MK3 так и не сделали).

### Novation outreach (manufacturer / borrowed-credibility канал — low-priority long-shot, PM 2026-06-16)
> **Тип канала:** прямой outreach к производителю железа. Апсайд = фичеринг/упоминание от Novation (или Focusrite-group PR) — самый кредибильный эндорсмент для нового аксессуар-бренда, снимает «новый бренд, 0 отзывов» (как Isotonik, insight #14, но через владельца платформы). Но вероятность низкая: у Novation нет структурной *нужды* в нас (Isotonik не хватает MK3 — Novation ничего «не хватает»). Поэтому — дешёвый оппортунистический long-shot, НЕ гейтить и не вытеснять им гейтнутые higher-fit каналы (Isotonik, следующий пост). Подробности: PM `launch-journal.md` 2026-06-16.
- [x] **Первая попытка — support-тикет 2493139, ОТВЕТ ПОЛУЧЕН 2026-06-16** (наш аутбаунд 15 Jun 10:34 BST → Tom H, Technical Support Engineer, 16 Jun 15:53 BST). Тёплый, но **полностью non-committal**: «спасибо, передам wider team» — без партнёрства/фичеринга/контакта. **Урок: writ в ПРАВИЛЬНУЮ дверь, не support** — у техподдержки нет ни мандата, ни мотива продвигать сторонние девайсы. Не ответ маркетинга/community. Закрыто на низком приоритете; follow-up в support НЕ слать (выжжет goodwill не в том отделе).
- [ ] **Если заходить серьёзно — перенацелить на функцию, что владеет maker/community-связями** (НЕ support): (a) **artist-relations / community / social** Novation (кто делает «made with Novation»-фичи и ведёт соцсети — они курируют и усиливают сторонних мейкеров); (b) **Focusrite-group press/PR** под earned coverage; (c) product/marketing через **тёплый интро** (напр. через Isotonik — у них уже есть связь с Novation; referred intro бьёт холодный тикет). Питч — ТОТ ЖЕ артефакт, что для Isotonik, перенацеленный (maker-story / review-unit для их community).
- [ ] **Тайминг-гейт = тот же, что у Isotonik:** не питчить artist-relations, пока не доведены maxforlive-превью + сайт Demo kit-line + демо. Un-gate на тех же polish-items; **Isotonik сначала** (выше fit, структурная нужда, + возможный warm-intro путь ВНУТРЬ Novation).

### Crypto checkout (Cryptomus / NOWPayments / Coinbase Commerce)
- [ ] Триггер: запрос от покупателей либо доля Gumroad-fees > 8%
- [ ] Выбор провайдера, CF Pages Function, тест-покупка, off-ramp USDT → Bangkok Bank

### Georgian Individual Entrepreneur
- [ ] Триггер: выручка ≥ $500–1000/мес стабильно
- [ ] Регистратор в Тбилиси (remote-PoA, ~$1–1.5k setup), ИП 1%, Wise Business, опц. Stripe Georgia

---

## ✅ Тайские мото-права (motorbike)

**Получены 2026-05-25.** Изначально шли как backup-документ для Paddle Sumsub-цикла; после отказа от Paddle и перехода на Gumroad (где русский паспорт принят без вопросов) KYC-обоснование отпало. Права остались как general-purpose Thai government ID — пригодится для Payoneer / address proof / Wise Thailand если когда-нибудь понадобится.

- [x] Pre-flight (2026-05-04): landlord, TM.30, Tabien Baan, ID copies, фото, 500 THB
- [x] Day 1 (2026-05-05): Bluport Immigration → Certificate of Residence, медсправка
- [x] Booking (2026-05-06): DLT Smart Queue, Pran Buri Branch
- [x] Подготовка: DLT QR LICENCE app, safety video, практика
- [x] Экзамен: theory + practical (slalom, баланс, восьмёрка, торможение)
- [x] Пластик на руках

### Phase 1+ — car license (deferred, no urgency)

- [ ] Триггер: реальная потребность водить машину в Таиланде
- [ ] Автошкола Hua Hin (Honda/Toyota DLT-certified) → курс → экзамен на категорию car

---

## 📋 Phase 0 (продукт + контент)

### T3 Brand identity

- [x] Бриф: tone, аудитория, что избегать — `brand/brief.md`, **2026-05-26**
- [x] Логотип-mark (SVG, ≤2KB) — `app/public/favicon.svg` + Figma-компонент `Logo` (1863:55) — **закрыто к 2026-05-26**
- [x] Wordmark «Fadercraft» — два варианта в Figma: Header (1117:5219) и Footer alt с fader-cap (1868:7106) — **закрыто к 2026-05-26**
- [x] Brand identity артборд в Figma — страница `00 — Brand identity` (1903:5006): Primary/Secondary/Tertiary палитра + 2 wordmark + favicon — **2026-05-26**
- [x] 2 primary colors → `brand/colors.md` — **2026-05-26**, задокументированы все 3 action-цвета (Primary `#63F2CA`, Secondary `#639AF2`, Tertiary `#FFAD56`) + neutrals + правила применения
- [x] Social tiles 1080×1080 — OG-картинка `Fadercraft/web/og.png` готова **2026-05-26** (IG-пост 1:1 и Stories 1080×1920 — отдельно в Phase 1 / маркетинг)
- [x] Commit `brand/` — закоммичено в `3b0de4d` (brief + colors + email-setup), **2026-05-26**

### T5 Instagram presence

- [x] Handle `@fadercraft_` зарегистрирован — **2026-05-26**
- [x] Bio + ссылка на fadercraft.com — **2026-05-26**
- [x] Profile photo (логотип/favicon-mark) — **2026-05-26**

### T7-real Real landing page

- [x] Заменить placeholder `index.html` на полноценный 9-секционный лендинг — **2026-05-26**
- ~~Полноценный `pricing.html`~~ — **отменено 2026-06-10**: цена ($39) указана прямо в CTA-кнопке, тарифов/планов не предполагается → отдельная pricing-страница не нужна
- ~~Hero loop video (8 sec, autoplay, muted)~~ — **отменено 2026-05-28**: `PerformanceFlow` сам играет роль hero (анимированные клавиши, eager-load под LCP). Полное демо-видео живёт в `VideoSection` ниже (см. T9).
- [x] `style.css` с brand colors (mobile-first) — **2026-05-26**
- [x] Smooth scroll в `main.js` — **2026-05-26**
- [x] Lazy load — `loading="lazy" decoding="async"` на всех below-the-fold `<img>` (CatalogSection, VideoSection, ProductGallery, ProductCard); above-the-fold (PerformanceFlow `keys.png`) оставлен eager под LCP — **2026-05-26**
- [x] **`/free-custom-modes` страница** (free funnel — см. T12 distribution strategy ниже): `web/free-custom-modes/index.html` + 14 individual `.syx` + README с инструкцией по импорту и CTA-блоком к платному bundle — **2026-05-26**
- [x] **React-version Custom Modes funnel** (`?p=free-modes`) под Figma `ProductPage · 1440 / Custom Modes` (node 2169-11012): Header (model+modelHref+modelSuffix) → HeroProduct → OneActionBetweenThem (controlled, cold = Custom Mode 1, лейбл «Custom Mode 1-10») → descripton (Import / Included / Included in XL Performance / License / CTA) → FooterFull. Заменила предыдущую статическую HTML-версию — **2026-05-28**
- [x] **Header API расширен**: `modelHref` (model word → home, hover-underline 40% / 1px), `modelSuffix` (буллет «•» + subtitle). Nav-якоря: Products/Features → `#kit`, Support/Contact → `#support` с авто-раскрытием FAQ-пункта slug='support'. Smooth-scroll глобально в `index.css` (+ reduced-motion override). — **2026-05-28**
- [x] **Global Tab-scope** (`lib/tab-scope.ts`): Tab/Shift+Tab оперирует только в `[data-focus-zone]` (`OneActionBetweenThem` + `PluginMockup`). На страницах без зон Tab работает по умолчанию. — **2026-05-28**
- [x] **Cleanup**: 13 неиспользуемых компонентов удалены — `Avatar`, `Badge`, `Input`, `AccordionItem`, `ProductCard`, `CatalogSection`, `ExplainerSection`, `FAQAccordion`, `Hero`, `MechanismDiagram`, `ModeGrid`, `ProductGallery`, `RequirementsList`. Билд: 171 → 133 модулей, CSS 73.8 → 71.6 KB. — **2026-05-28**
- [x] **VideoSection временно скрыта** (закомментирована в `ProductPage`) — re-enable после T9 demo video — **2026-05-28**
- [x] **Responsive polish pass** (mobile <720 / tablet ≤1024 / desktop) — **2026-06-04**: scroll-morph отключён на touch+планшете (несовместим с тачем и geometric-pin плагина), десктоп-парковка плагина сделана бесшовной (rect-based, без прыжка); мобильная стоп-точка плагина и старт-позиция настроены; энкодеры на мобилке затемнены (neutral-700), обводка к стандартной; DAW-лампы ×2 ярче; «Cue volume» — вертикальный лейбл (Figma 2168-10389); Arrow-up плашка чинит маскировку divider-линии на тач-масштабе; Momentary/«To previous» — pointer-events (press-and-hold работает на тач); user-select отключён на всех иллюстрациях; футер-логотип обновлён под Figma 2232-5251 (убран ghost-«FADER», голый трек+cap); Performance Flow порядок битов + копи «Run the whole rig» обновлены; футер/Subscribe отступы выровнены. Итерация продолжается на localhost (не задеплоено).
- [ ] **Сайт kit-секция (TheKitSection): добавить Demo как второй Live-set вариант** — расхождение найдено при maxforlive-листинге 2026-06-12: лендинг показывает только Starter, а реально сетов **два на выбор** (Starter ИЛИ Demo) — сайт неполный, выровнять с тем, что в бандле и в листинге.

### T8 M4L device update integration

> **Реализация изменилась (2026-06-01):** plain `[js]` не умеет HTTPS → перешли на **Node for Max** (`node.script`, встроенный `https`, без npm/external — портативно, фризом впекается внутрь `.amxd`). UI вместо «version display + Check button + dot» — кликабельный **«New Version»**, появляется только при доступном обновлении.

- [x] `version_check.js` (наш update-check) в `~/Music/Ableton/User Library/Max Devices/` — **2026-06-01**
- [x] `Control XL.amxd` открыт/правится в Max — **2026-06-01**
- [x] UI: индикатор **«New Version»** (мятный, только при апдейте; прячет правую MIXER-линию, выровнен к правому краю кнопки 14; клик → Gumroad продукт `l/control-xl`) — **2026-06-01**
- [x] Подключён `node.script version_check.js @autostart 1` (пинг `/api/version.json` → поле `latest`, semver-сравнение, ре-чек по таймеру 30 мин) — **2026-06-01**
- [x] Routing статусов: up_to_date → скрыт; update_available → «New Version» + клик; ошибка/не-JSON → без ложного индикатора — **2026-06-01**
- [ ] ~~In-device newsletter signup (Buttondown)~~ → deferred Phase 1 (рассылка через Gumroad, см. T11)
- ~~(опц.) Anonymous heartbeat~~ → **deferred Phase 1** (2026-06-10): опциональная анонимная телеметрия устройства, не launch-критерий; заводить пост-launch если понадобится аналитика активных установок.
- [x] Re-version patch v1.5 → v1.0 (метка убрана, `DEVICE_VERSION=1.0`) — **2026-06-01**
- [x] Тест «обновление доступно»: форс `DEVICE_VERSION=0.9` vs прод `latest 1.0` → «New Version» показался — **2026-06-01**
- [x] **Клик-ссылка обновления ВЫНЕСЕНА НАРУЖУ (m4l-master, 2026-06-10)** — клик «New Version» теперь открывает `url` из `version.json` (а не зашитый адрес). Механизм: `version_check.js` извлекает `latest`+`url`, эмитит теговые `dot N` + `url <link>` → патч `route dot url` → `vlink_open` (`launchbrowser $1`, динамический); fallback `loadmess https://library.gumroad.com` (работает offline/до пинга). Старый хардкод `/l/control-xl` удалён (0 вхождений). `version_check.js` вшит во freeze. **РАБОТАЕТ — подтверждено на железе** (тест: манифест `url:google.com` → клик открыл google.com, т.е. ссылка тянется с сервера, не из fallback). Путь к фиксу был неровный: (1) первая версия `984d4339` — клик не открывал ничего; Console показал `value • patchcord inlet out of range` ×2 — `value`-стор имеет 1 inlet, url-источники подключили в inlet 1 → Max удалял патчкорды → стор пустой; (2) фикс через message-box + `prepend set` (silent store, выдача по bang) — `edd4bf55`. (3) `version-check` post сначала убрали, потом ВЕРНУЛИ по запросу пользователя (полезная диагностика — печатает `version check: device=… latest=… (ok) url=… -> dot N` каждый пинг). **Финальный `.amxd` md5 `28840e39`** (DEVICE_VERSION=1.0), распространён по 6 слотам, оба зипа пересобраны (самоверификация: `version check:` post=1 с url, `launchbrowser $1`=1, моды 0x6e, .als Session, Router type-1 resolve ✓). Серверный `url`=`library.gumroad.com`, `latest`=1.0. Бэкапы `…113251`→`…121832`. **Ссылку теперь меняешь правкой `version.json` без пересборки устройства.**
- [x] **Финальный smoke-test + Freeze — 2026-06-10**: device freeze'нут (`version_check.js` впечён, единый файл `Control XL.amxd` `28840e39`, внешнего `.js` не требует — `can't find file` исключён); клик/показ/скрытие кнопки «Update ready» подтверждены пользователем на железе (кнопка горит при `latest>1.0`, клик открывает url с сервера). Dev-копий не осталось — один файл в бандле.

> **Сопутствующее (вне T8, сделано 2026-06-01):** версия убрана из мокапа лендинга (PluginMockup + vite-define + version.json); Prelisten перенаправлен **CM3 → CM15** и сделан **тумблером** (CM15 ↔ предыдущий мод, save/restore через `[change]`-трекинг); сжат зазор MIXER→табы (~40%). Инструмент-чекбокс **не возвращён** (откат): нет живого фидбэка от LCXL при смене мода — зафиксировано в памяти. Бэкап оригинала девайса в `Max Devices/Archive/`.

### T9 Demo video production

> **Content must-include (user note 2026-05-25):** «Закинул на MIDI-трек» — недостаточно. Скрипт **обязан** показать на экране настройку: **MIDI From → Launch Control XL MK3 (DAW port)**, **MIDI To → Launch Control XL MK3 (DAW port)**, **Channel → All** (или явно тот, на котором сидит overlay listen CC). Без этих трёх настроек устройство не получает входной MIDI и не отвечает на LCXL — самая частая причина «не работает» у первого пользователя.

- [x] **1-страничный скрипт** — `wiki/demo-video-script.md` (v3), **2026-06-04**: ~2:30, один непрерывный Live-set перформанс, English VO + burned-in captions, без install/setup (живёт в Quickstart). Три фичи по порядку: pages → encoder banks → cross-mode jump (mixer→instrument). Solo Follower намеренно не упоминается ([[feedback_no_solo_follower_marketing]]).
- [x] **Запись screen + voice-over** — **2026-06-10** (пилот)
- [x] **Монтаж** — **2026-06-10** (пилотный кат)
- [x] **Export master 1080p MP4** — **2026-06-10**: видео финальное (на уровне самого видео T9 закрыт), залито на YouTube
- ~~Hero loop 8 sec → `web/assets/hero-loop.mp4`~~ — **отменено 2026-05-28**: hero-роль закрывает `PerformanceFlow`; полное демо идёт в `VideoSection` через YouTube embed
- [x] Создать YouTube канал «Fadercraft» — **2026-05-26**
- [x] **Загрузить video, скопировать ID** — **2026-06-10**: ID `UsJxPBdf568` (`https://youtu.be/UsJxPBdf568`)
- [x] **Раскомментировать `VideoSection` + прокинуть YouTube ID** — **2026-06-10**: `ProductPage.tsx` секция `#video` живая, `youtubeId="UsJxPBdf568"` (lite-facade → `youtube-nocookie` embed)
- [x] **Оформление YouTube-канала** — **2026-06-10**: аватар, баннер, about, линки на канале есть
- [x] **Описание видео опубликовано на YouTube** — **2026-06-10** (live-заголовок «Fadercraft Control XL presentation»; базовое описание стоит)
- [x] **Тайм-коды глав видео проставлены** — **2026-06-10** (пользователь). Главы на YouTube готовы.
- → 5 коротких клипов 30 sec для IG/TikTok/Reels — **вынесено в Phase 1** (2026-06-10), см. блок Phase 1 ниже

> **Статус (2026-06-10):** **видео финальное**, играет на лендинге; канал оформлен, описание опубликовано → launch-критерий «демо-видео опубликовано» и B2B-триггер Isotonik закрыты. T9 закрыт к launch; единственный остаток — опциональные тайм-коды глав. Короткие клипы переехали в Phase 1.

### T10 Extended documentation

> **Content must-include (user note 2026-05-25):** Quickstart и user-facing README **обязаны** иметь отдельный шаг «Настройка MIDI-роутинга» со скриншотом: **MIDI From / MIDI To / Channel** на трек с устройством. Не объединять с шагом «положить .amxd на трек» — это два разных действия, второе часто пропускают.

- [x] `dist/Quickstart.md` — **пересоздан 2026-06-02** (потерялся при миграции деплоя из Brain; user-facing, English: requirements / 4-step setup с выделенным MIDI-routing / using / updates «New Version» / troubleshooting; отражает frozen-реальность — bundle = один `.amxd`, без отдельного `solo_follower.js`)
- [x] `dist/Quickstart.pdf` — **2026-06-02** (make-pdf, 389 слов, 112 КБ, 1in поля, без CONFIDENTIAL-футера)
- [x] User-facing `dist/README.md` — **2026-06-10**. Не второй walkthrough (Quickstart уже подробный), а первый файл бандла: ориентация + 3-шаговый short setup (→ Quickstart.pdf за деталями) + reference-карточка (контролы CC47/45/46, encoder banks A/B, Cue mode 15, custom-modes map, MIDI-routing DAW Ch.7, device-last-in-chain) + updates/license/support. English, тон Quickstart, без Solo Follower. LanguageTool чист (флаги = бренд-термины). Источник `raw/XL_Performance.README.md` — внутренний тех-дип, в user-facing не тащил. **Апдейт 2026-06-10: README ИСКЛЮЧЁН из бандла** (дублировал Quickstart — продакт-решение); единственный user-facing док в зипе = `Quickstart.pdf`. Файл `dist/README.md` остаётся на диске как внутренний справочник, покупателю не идёт.

### T11 Newsletter pipeline (Gumroad follow)

> **Strategy revised 2026-05-28**: список подписчиков ведём в **Gumroad** через бесплатный механизм followers. Двойная экономия (рассылка идёт оттуда же, где сидят покупатели) и ноль доп. инфраструктуры. **Buttondown отложен в Phase 1** — пригодится только если понадобится отдельный канал рассылки вне Gumroad-ecosystem (напр., narrowcast «только владельцам v1»).

- [x] Embed-форма на лендинге: `<form action="https://app.gumroad.com/follow_from_embed_form">` с hidden `seller_id=6976309857072`, `target="_blank"`, `pattern=[^@\s]+@[^@\s]+\.[A-Za-z]{2,}` на email-input. POST уходит в Gumroad, confirmation открывается в новой вкладке, double opt-in их штатный. — **2026-05-28**
- ~~Buttondown registration / custom domain / embed snippet / M4L in-device signup~~ → deferred Phase 1

### T12 Bundle assembly + Gumroad product

> **Distribution strategy (user note 2026-05-25):** Гибрид — Custom Modes JSON **дублируется** в двух местах: бесплатно на `fadercraft.com/free-custom-modes` (см. T7-real) как SEO/discovery funnel, и в платном bundle (чтобы покупатель не ходил отдельно на сайт). Live Set + `.amxd` + Quickstart + Demo — только в платном bundle. Обоснование: modes без `.amxd` работают как любые обычные custom-mode'ы LCXL — переключаются руками на самой ручке. Mode-switching/cross-mode transit/Solo Follower живут в `.amxd`, поэтому feature-set не утекает. Подробно: см. log 2026-05-25 «distribution strategy».

- [x] Custom Modes для LCXL MK3 → `Fadercraft/dist/custom-modes/{1..14}.syx` (one mode per file) — **2026-05-26**. Включает 10 instrument-модов (1-10, byte-uniform 662 B) + 4 mixer-моды (11-14, byte-uniform 664 B после strip extra labels). Все hardware-tested на LCXL MK3 пользователя. Формат — `.syx` (Components-native SysEx), не JSON. **Bundle .syx дропнут (commit b051255)** — Novation Components импортирует ровно один mode на файл, склейка не даёт one-shot import. README с CTA — отдельным шагом перед загрузкой в Gumroad bundle. Спека формата задокументирована в [[Custom Mode SysEx Layout]].
- [x] **Опубликовать модули отдельно** на `web/free-custom-modes/` (free funnel — связано с T7-real) — **2026-05-26**: `index.html` (статическая страница в стиле pricing/terms/etc.) + 14 индивидуальных `.syx` + README.md. CTA-блок ведёт на Gumroad `xl-performance`. Формат — `.syx`, не `.json` (см. [[Custom Mode SysEx Layout]]).
- [x] **`free-custom-modes.zip` single-download** (`app/public/free-custom-modes.zip`, 6.6 KB) — 14 индивидуальных `.syx` без бандла (бандл Components импортировать не умеет). Зелёная CTA «Download Free LC Custom modes» на странице Custom Modes ведёт на этот zip. — **2026-05-28**
- [x] **Mode 15 — QUE / prelisten volume** добавлен **2026-06-01**. Mixer-style мод для громкости предпрослушки сэмплов; метка `"QUE Volume"` (track-name `"Perc C"` снят как привязка к Live Set'у). Канонический `dist/custom-modes/15.syx` (670 B) разложен во free funnel + оба `free-custom-modes.zip` (web + app/public, теперь по 15 файлов). Маппинг в Demo-set уже есть. Спека обновлена: [[Custom Mode SysEx Layout]]. Теперь модов **15** (10 instrument + 4 mixer + 1 QUE).
- [x] `XL_Performance_starter.als` Live Set с маппингами + контентом — **демо-ливсет готов 2026-06-01** (28 треков: instrument-группа + audio-print-группа, returns A-Reverb/B-Delay/C-Echo/D-Phaser + E-Saturator, MIDI-маппинг палитра на ch11/ch13)
- [x] Bundle собран как **два** деливерабла (не один общий): `Control XL Demo Project/` + `Control XL Starter Project/`, каждый + `custom-modes/` + `Quickstart.pdf`. Demo с семплами (~138 МБ), Starter lightweight (~160 КБ). `.amxd` фриз + custom-modes внутри; `solo_follower.js` впечён в девайс. — **2026-06-03**
- [x] Zip → `Fadercraft Control XL v1.0 - Demo.zip` / `Fadercraft Control XL v1.0 - Starter.zip` (два архива, пересобраны 2026-06-03 с XL_Performance + Router в корне проекта) — **2026-06-03**
- [x] **Bundle-фиксы 2026-06-10 (m4l-master):** (a) `custom-modes/` с 15 синхронизированными `.syx` положена в корень обоих бандлов (Demo+Starter) — раньше отсутствовала, хотя Quickstart её обещает; (b) девайс в бандлах переименован `XL_Performance.amxd → Control XL.amxd` (отставал от уже принятого ренейма) + поправлены ссылки в `Router.als` обоих бандлов; `.amxd` бинарно не тронут (md5 `44aa142b…`). Бэкапы в `raw/archive/` (метки `…023338`, `…024424`). Заметка: в каждом бандле исторически 2 копии `Control XL.amxd` (корень + `Max Devices/`); главный сет грузит из `Max Devices/`, корневая — для `Router.als`. Чистка дубля — опционально, потребует правки `Router.als`.
- [x] **Pre-upload check Live Sets — 2026-06-10**: оба главных `.als` в Session/Clip view. Demo — сохранён пользователем в Ableton (Clip View, 03:01). Starter — Cmd+S не писался (view-toggle не делает документ «грязным»), починено хирургически в XML: `SelectedDocumentViewInMainWindow` `1`→`0` (эталон = Demo). Ключевой элемент вида найден: `SelectedDocumentViewInMainWindow` (0=Session, 1=Arrangement). Бэкап `raw/archive/Starter-set.…030730.als`. Память: [[liveset-clip-view-on-save]]
- [x] **Зипы пересобраны + РЕСТРУКТУРИЗАЦИЯ (m4l-master, 2026-06-10):** финальная раскладка бандла = в корне `Control XL.amxd` + `Router.als` + `custom-modes/` (15, 0x6e) + `Quickstart.pdf`, и `<Проект>/` (с `Control XL Demo/Starter.als` + `Max Devices/Control XL.amxd` + Samples). **README из бандла УБРАН** (дублировал Quickstart — продакт-решение; единственный док = Quickstart.pdf). **Icon, Backup, macOS-мусор — исключены.** Router.als перенесён в корень: ссылка на девайс перенастроена `RelativePathType` 3→1 (relative-to-document), иначе сломалась бы у покупателя; Router тоже переведён в Session view. Главный сет грузит девайс из `Max Devices/` (2 копии девайса в бандле — норма). Все ссылки RESOLVED (round-trip распаковка), оба `.als` Session view, `15.syx`=0x6e, 0 вхождений старого имени. Demo **191.7 МБ** (вес принят как есть — чистку сэмплов НЕ делаем), Starter 0.18 МБ. Бэкапы старых зипов: `raw/archive/` (метки `…031209`, `…094111`). Важно: на диске в `dist/` рабочие папки = только содержимое проекта; корневые `Control XL.amxd`/`Router.als`/Quickstart существуют только внутри зипа (staging).
- [x] **Финальная итерация бандла (m4l-master, 2026-06-10 ~10:02):** (a) папка модов переименована `custom-modes/` → **`15 Custom Modes/`** в обоих зипах (+ синхронно ссылки в Quickstart.md и README.md, Quickstart.pdf перегенерён через Chrome); (b) **вид сетов — ИСПРАВЛЕНА СЕМАНТИКА**: ранее была инверсия (думали 0=Session), по скриншоту пользователя установлено **1=Session, 0=Arrangement**; все 4 `.als` выставлены в `1` (Session) на диске и в зипах — раньше Demo/Starter ошибочно ушли в Arrangement. Память [[liveset-clip-view-on-save]] исправлена. Самостоятельная верификация зипов: папка `15 Custom Modes` (15 .syx, 0x6e), все `.als`=1, README нет, корень чист. Бэкапы метка `…100234` + view-бэкапы `…0950`, Quickstart.pdf — `…0957`.
- [x] **Баг Router.als ПОЧИНЕН + источник сборки = dist (m4l-master, 2026-06-10 ~10:34):** Router не находил девайс — причина: оба `Router.als` байт-в-байт идентичны (один скопирован в оба бандла), device-патч резолвился через `OriginalFileRef` (тип 6, User Library — у покупателя НЕТ) + `PatchSlot/MxPatchRef` (тип 3, абс. путь Demo-Router вёл в Starter-папку). Починено: оба FileRef → `RelativePathType=1` (relative-to-document) на соседний `Control XL.amxd`, путь на свой бандл, User-Library/кросс-пути убраны, вид Session сохранён. Round-trip + самоверификация: 0 broken refs, 0 User-Library, кросс-путей нет. **Источник сборки переключён: бандл теперь ТОЛЬКО из `~/Brain/Fadercraft/dist/` (моды из `dist/15 Custom Modes/`); мастер `Projects/custom-modes/` СНЕСЁН** (ничем не потреблялся; сайт-funnel живёт в `app/public/free-custom-modes/`). Правило: [[reference_bundle_build_source]] — моды в 2 местах (dist=бандл, app/public=сайт), синхронить обе. Бэкапы Router `…102943/44`, зипы `…103422`.
- [x] **Финальные зипы на Gumroad + re-smoke скачивания ПРОЙДЕН — 2026-06-10** (пользователь): оба зипа (реструктуризация + `15 Custom Modes` + Session-fix + Router-fix) залиты, **скачаны с Gumroad и проверены — всё открывается, работает** (Router находит девайс — баг подтверждённо починен в живом бандле).
- [x] **Финальные зипы залиты на Gumroad — 2026-06-10** (пользователь): оба архива (Demo + Starter) с device `28840e39` (внешняя ссылка обновления + version-check print). Это последняя пересборка бандла — дальше ссылка меняется в `version.json` без переупаковки. **Кластер финализации бандла ЗАКРЫТ окончательно.**
- [x] **Solo Follower убран из Gumroad «What's included»** — **2026-06-10** (пользователь подтвердил, в описании его нет) ([[feedback_no_solo_follower_marketing]]).
- [x] **Router-строка добавлена в Gumroad «What's included»** — **2026-06-10** (пользователь, drag-and-go формула [[reference_control_xl_setup_vs_router]]).
- [x] **Загружено в Gumroad product Content** — **2026-06-03**: оба zip залиты, качаются со страницы покупки (Starter/Demo, описания Demo-vs-Starter вынесены в Description файлов, над сгибом; install-гайд ниже). Подтверждено test-purchase'ом.
- [x] Cover image 1280×720 PNG + thumbnail — брендовые ассеты залиты в Gumroad **2026-05-26**, дефолтная плашка снята
- [x] Описание продукта на странице Gumroad — **2026-05-26**
  - ✅ Copy fix «6 controls instead of 2» применён вручную на Gumroad (2026-05-26); параллельно поправлено в `PerformanceFlow.tsx` и в Figma (nodes `1398:143`, `1434:6902`)
- [x] URL slug `xl-performance` — **2026-05-26**
- [x] **env vars `LATEST_BUNDLE_URL` + `GUMROAD_PRODUCT_ID` в CF Pages — 2026-06-10**. `GUMROAD_PRODUCT_ID=zyopjai` (unique permalink продукта, вытащен из storefront + проверен боевым запросом к Gumroad License API), `LATEST_BUNDLE_URL=https://library.gumroad.com` (Gumroad сам хостит/раздаёт бандл, отдельный хостинг не нужен). Заведены через `wrangler pages secret put` + redeploy. Проверено: `/api/verify-license` с фиктивным ключом → «License not recognized» (раньше «Server misconfigured») — product_id подхватился, endpoint функционален. Прим.: `/update`-форма (license-gated download) — НЕ на критическом пути launch, основной апдейт-путь = кнопка устройства → library; `/update` теперь просто рабочая, а не битая.
- [x] Publish продукт (Draft → Live) — **2026-05-26**, продукт виден на `fadercraft.gumroad.com`

### T13 Final pre-launch verification

- [x] **Лендинг checklist — проверен browse-QA 2026-06-10** на live `fadercraft.com`: грузится 200, **0 console errors**; **10 `<section>`** (8 заголовков: hero + Performance flow + In action/video + ICP + What's included + FAQ + Will it run + Newsletter); **видео** — постер + play, клик → `youtube-nocookie` плеер `UsJxPBdf568` грузится; **FAQ** — 7 Q/A (статичный список, не аккордеон — формат, не баг); **мобилка 390px** — нет гор.скролла (375≤390), секции целые, play-кнопка в правом нижнем углу видео с 24px отступом. (Число секций ≠ «9» из старого чеклиста — это норма, не блокер.)
- [x] **Email infra end-to-end — проверено 2026-06-10**: DNS живы (MX→CF route1/2/3, SPF, DKIM cf2024-1, DMARC p=none — проверил `dig`); входящий форвардинг подтверждён пользователем — тестовые письма дошли на **оба** адреса (`support@` + `hello@`) → личный gmail, **во Входящие (не спам)** — значит SPF/DKIM/DMARC реально работают; **catch-all=Drop подтверждён** — на несуществующий адрес НЕ пришло. Схема = только входящий форвардинг (CF Email Routing), исходящие шлёт Gumroad. Нюанс: ответы покупателям уходят с личного gmail (исходящий SMTP не настроен).
- [x] **Update-check end-to-end — ПРОЙДЕН 2026-06-10**: бампнул `app/public/api/version.json` `latest` 1.0→1.1, задеплоил (`wrangler pages deploy`, CF Pages `fadercraft-landing`); устройство (`version_check.js` `DEVICE_VERSION=1.0`, пинг `fadercraft.com/api/version.json` каждые 30мин/на load) увидело `1.1>1.0` → зажгло «New Version» (подтверждено пользователем на железе). version.json не кэшируется (`max-age=0, cf-cache-status DYNAMIC`). **Откачено обратно на 1.0 + редеплой** сразу после теста. Заодно задеплоен мобильный `VideoSection.tsx` (прямой YT-плеер на мобилке). Открытый вопрос (UX): куда ведёт кнопка обновления — сейчас `gumroad.com/l/control-xl` (product/витрина покупки), для существующего владельца лучше путь скачивания (Library / своя `/update`-страница) — обсуждается.
- [x] **Test purchase smoke-test — пройден 2026-06-03** (creator test-mode purchase, не списано): sale-notification (seller) + receipt-письмо (buyer) + invoice PDF + Content/Library страница + download обоих zip + файлы открываются ✅. **Баг (закрыт 2026-06-03):** в receipt-письме Gumroad был старый Discord-инвайт `discord.gg/dAt2JGZps7` → исправлен на `EBsdgst3jU` пользователем на Gumroad; Quickstart чист (инвайт там не встречается). **Ещё не пройдено:** полноценный install по Quickstart в Live. Прим.: license-активация в **сам девайс не встроена** — проверка ключа живёт на web-стороне (`verify-license.js`) / в Gumroad library. In-device license — отдельная таска, проектируется (см. блок «In-device license activation» ниже)
- [x] **Tag `v1.0` в git — 2026-06-10**: annotated tag на `inBuro/fadercraft-landing` main (коммит `2f560af`), запушен в origin. Включает финальный device (`28840e39`, внешняя update-ссылка) + финализированный VideoSection (простой facade, без YT IFrame API — продакт-решение).
- [x] **PR review веток — 2026-06-10**: неслитых веток нет (всё в `main`, рабочая копия чистая); финальные коммиты (device, version.json external-url, video) ревью пройдены по диффу перед коммитом. Отдельных feature-веток на ревью не осталось.

### T14 Discord community

> **Direction (user note 2026-05-26):** Discord — единственный коммьюнити-канал для Fadercraft (футер: только YT/IG/DC, FB/TT убраны). Создаём заранее, но `DC`-линк в футер вешаем только после **welcome + rules + первого `#announcements`-поста** — пустой сервер хуже отсутствия. Vanity URL и auto-role при покупке отложены до Phase 1 (см. ниже): vanity требует Boost Level 3 ($70/мес), auto-role оправдан после ≥10–20 продаж.
>
> **Финальная спека для исполнения** (settings / channels / roles / готовая копия welcome+rules+первого announcements / пошаговый порядок кликов в Discord): [[discord-server-setup]].

- [x] Founder-аккаунт Discord с 2FA — **2026-05-26**
- [x] Создать сервер `Fadercraft` — **2026-05-26**
- [x] Иконка сервера (`icon-512.png`) — **2026-05-26**. Баннер 960×540 отложен (non-blocking, отдельный sub-task в [[discord-server-setup]], Discord показывает text-fallback)
- [x] Enable Community: verification Low + explicit content filter (scan от non-role), rules channel `#rules`, community updates `#server-updates`, safety notifications `#server-updates`, default notifications "Only @mentions", 2FA-for-moderation ON — **2026-05-26**
- [x] Канальная структура (4 категории, 10 каналов): INFO/`#welcome`/`#rules`/`#announcements`, COMMUNITY/`#general`/`#show-and-tell`/`#custom-modes`, SUPPORT/`#support`/`#bug-reports`/`#feature-requests`, ADMIN/`#server-updates` (private) — **2026-05-26**
- [x] Роли: `@Founder` (mint `#63F2CA`, hoist, Administrator, @mention OFF), `@Verified Owner` (amber `#FFAD56`, hoist, default perms, manual assign), `@everyone` (default minus send в INFO-каналах) — **2026-05-26**
- [x] Welcome в `#welcome` + rules в `#rules` (6 пунктов), оба запинены, меншны живые — **2026-05-26**
- [x] Permanent invite link: `https://discord.gg/EBsdgst3jU` (Never / No limit / Temporary OFF) — **2026-05-26**
- [x] Линк в footer (`FooterFull.defaultSocials.DC`) — **2026-05-26**. Quickstart-блок ждёт T10 (`dist/Quickstart.md` → PDF); Gumroad description ждёт ручной правки на logged-in surface (см. follow-ups ниже).
- [x] **Gumroad↔Discord интеграция подключена** — 2026-06-03: штатная интеграция продукта (Gumroad → Fadercraft Control XL → Integrations → "Invite your customers to a Discord server" → сервер Fadercraft). Авто-инвайт покупателя на сервер + авто-кик на refund; бот-роль `Gumroad` поднята выше `@Verified Owner`. **Роль `@Verified Owner` штатно НЕ мапится** (Gumroad только зовёт на сервер) → присвоение остаётся ручным до Phase-1 auto-role. Welcome-копия поправлена `XL_Performance`→`Control XL`. **Gumroad Communities (встроенный чат, розовая кнопка «Community») намеренно ВЫКЛЮЧЕН** — Discord единственный канал, два места дробят соло-комьюнити; не включать обратно. Детали — [[discord-server-setup]].
- [x] **Первый пост в `#announcements` написан** — **2026-06-10** (пользователь). Публикация синхронно с финальной отмашкой на launch (T13 finish). Запин не обязателен для announcement-канала.

**Follow-ups (не блокеры Phase 0, всплывают по мере готовности соседних треков):**

- Quickstart Support-секцию с линком на Discord — встроить при сборке `dist/Quickstart.md`/PDF (T10)
- Gumroad product description: добавить блок «Community: discord.gg/EBsdgst3jU» на странице `fadercraft.gumroad.com/l/xl-performance` (ручная правка через Gumroad UI)
- Banner 960×540 для Discord-сервера (`app/public/discord-banner.png`) — спека в [[discord-server-setup]]

**Deferred → Phase 1** (когда появятся триггеры):

- Vanity URL `discord.gg/fadercraft` — триггер: 14 активных бустеров или готовность платить ~$70/мес самому
- Auto-role `@Verified Owner` при покупке — триггер: ≥10–20 продаж, ручное присвоение начинает занимать время. **Путь реализации (решено 2026-06-10):** основной — **Zapier** zap «New sale in Gumroad → Add role in Discord» (без своего сервера, но платная подписка Zapier); запасной — **GumCord** (self-hosted бот, покупатель сам верифицирует license key командой → бот выдаёт роль; бесплатно, но нужен хостинг). Нативная Gumroad-интеграция роль НЕ мапит (только зовёт на сервер) — поэтому нужен один из этих двух.
- Moderation бот (Carl-bot / MEE6) — триггер: ≥50 участников или первый рейд/спам
- Changelog auto-post из GitHub Releases в `#announcements` через webhook — nice-to-have

### T15 Analytics (Microsoft Clarity)

> **Выбор (2026-06-06):** Microsoft Clarity — бесплатно без лимитов, scroll/click heatmaps + viewport area maps + session replay + rage/dead-clicks. Полный аналог вебвизора Метрики, без платных тарифов. Альтернативы (PostHog / Hotjar free-35-сессий/день) отброшены для низкотрафного лендинга.

- [x] Guarded Clarity-сниппет в `app/index.html` — **2026-06-06**: no-op пока `CLARITY_ID` пустой; грузится только на `fadercraft.com`/`www.` (localhost/preview не засоряют). Локальный билд зелёный.
- [x] Проект создан на clarity.microsoft.com, **Project ID `x2l5ownj3q`** вписан в `CLARITY_ID`, локальный билд зелёный (ID впечён в `dist/index.html`) — **2026-06-06**
- [x] **Деплой** — **2026-06-06**: `wrangler pages deploy` из `inBuro/fadercraft-landing`, коммит `93ecb8a`. Проверено: сниппет + ID `x2l5ownj3q` живые на `fadercraft.com`. Heatmaps/recordings в Clarity Dashboard появятся через пару часов после первого живого визита.

---

## 🚀 Phase 1 (post-launch, отдельный план потом)

- [x] YouTube канал создан, демо-видео опубликовано (**пилот**, ID `UsJxPBdf568`, играет на лендинге — 2026-06-10)
- [x] **SEO core (Phase B)** — задеплоено 2026-06-10: path-роутинг (`/free-custom-modes`, `/legal`; legacy `?p=` → redirect), `robots.txt` + `sitemap.xml`, постбилд `scripts/seo-meta.mjs` (title/description/canonical/OG на маршрут + JSON-LD SoftwareApplication/FAQPage), `www` CNAME + 301 на apex (middleware), свой h1 на free-modes. Search Console: домен верифицирован (DNS). Осталось: сабмит sitemap + запрос индексации (см. ниже)
- [ ] **Search Console: сабмит `sitemap.xml` + запрос индексации 3 URL** (после деплоя SEO — можно сразу)
- [x] **Gumroad Ping → PostHog `purchase`** — серверное событие продажи (2026-06-10): `functions/api/gumroad-ping.js`, токен-аутентификация, без email/license key; воронка `$pageview → buy_click → purchase` сквозная. ⚠️ **ПЕРЕОТКРЫТО 2026-06-17** — по разбору первой продажи (analyst) реальное событие `purchase` **не долетает надёжно** + Buy-ссылка без штампа `ph_did/variant/utm` + нет email/`$identify` → покупку нельзя стянуть к визитору/источнику/когорте. Перенесено в блок «🛒 Post-purchase journey & pipeline» ниже как MUST-фиксы.

> ### 🛒 Post-purchase journey & pipeline (заведено PM 2026-06-17 после первой продажи)
> **Контекст:** первая продажа (Holger Aust, NL, $39, returner через free-modes) ушла в полную слепую зону — после клика Buy мы ничего не видим, покупатель «молчаливый» (не вошёл в Discord, не написал, не оставил отзыв). **Два РАЗНЫХ трека: PIPELINE (видеть продажи) ≠ JOURNEY (человеческий опыт покупателя).** При n=1 цель journey — НЕ масштаб, а ОБУЧЕНИЕ: рабочий чек, ОДНА человеческая записка, открытое ухо. Автоматизацию НЕ строим под одного покупателя (anti-pattern insight #17) — гейтим по объёму. **Тихий покупатель = норма, не проблема** (большинство довольных покупателей $39-утилиты молчат). Детали: PM `launch-journal.md` 2026-06-17, insight #20.
> **💵 ЮНИТ-ЭКОНОМИКА из Gumroad-CSV (2026-06-18, первоисточник sale #1):** **$39 list → $33.17 net** (комиссия Gumroad+Stripe $5.83, ~85% удержания; Card, без скидок/affiliate/PPP). Считаем «N продаж = $Y» по NET ($33.17), не по gross. **Gumroad-CSV показывает Referrer = `direct` + UTM пустые** — это НЕ канал-источник, а ровно слепота Gumroad (insight #9): реальный источник (maxforlive `/m4l`) живёт в PostHog, не в Gumroad-экспорте. Канал-атрибуцию НИКОГДА не читать из Gumroad-колонок. Это и есть аргумент за MUST-фикс pipeline ниже. **`austacademy` = «Aust Academy», музыкально-образовательный канал** — educator-гипотеза (insight #14) повышена с «догадка по @-хэндлу» до «названный публичный проект», НО при n=1 НЕ меняет ни одного вердикта и НЕ повод для outreach; проверять только естественным всплытием в разговоре с покупателем (P2), не «мы вас нашли».

**MUST — починить pipeline (дёшево, разово, компаундит — каждый будущий покупатель станет атрибутируемым; гейт на чтение продажи №2):**
- [ ] **Реальный `purchase` долетает в PostHog** — Gumroad Ping не срабатывает/настроен некорректно; проверка end-to-end требует боевой тест-покупки (Ping капризный). Без этого продажи невидимы.
- [ ] **Штамп на Buy-ссылке** — `ph_did/variant/cta/utm` в URL Gumroad, чтобы покупку можно было стянуть к визитору + источнику + A/B-варианту (сейчас чистый Gumroad URL → даже когда Ping заработает, привязки нет).
- [ ] **Email/имя на событии `purchase` + `$identify`** — личность покупателя должна появляться в PostHog; когорта «купившие» должна строиться. (Анти-импульс: PII обрабатывать аккуратно, но без identify когорта невозможна.)

**SHOULD — онбординг (чтобы покупатель завёлся; в основном верификация + одно письмо):**
- [ ] **Верифицировать receipt-письмо Gumroad** — download-ссылки + Discord-инвайт (`EBsdgst3jU`) живые и верные (старый битый инвайт чинили 2026-06-03; native Gumroad↔Discord auto-invite подключён — проверить, что зовёт).
- [ ] **Quickstart выносит MIDI-routing ПЕРВЫМ шагом** — это точка трения продукта (Control XL требует ручной роутинг, не drag-and-go → риск тихого «не завелось»). Quickstart.pdf уже единственный user-facing док в бандле (T10) — подтвердить, что шаг роутинга ведёт, а не закопан.
- [ ] **ОДНА человеческая записка покупателю #1 (Holger)** в ~24-72 ч — шейп insight #10 («какой у тебя сетап / роутинг завёлся?»), НЕ «оставь отзыв». = P2 из insight #19 + первое живое касание journey. Один send, без nag. **Educator-гипотеза (`austacademy` = «Aust Academy», муз.-образовательный канал) встроена в ЭТО касание естественно:** если человек — преподаватель/контент-мейкер с аудиторией, это всплывёт в том, КАК он ответит про свой сетап («веду курсы / мои студенты / мой канал») — БЕЗ прямого «вы Aust Academy?» (это читается как слежка, insight #16). Всплыло + есть аудитория → с разрешения исследовать testimonial/word-of-mouth (insight #14). Не всплыло — отпустить. НИКАКОГО partnership-питча по хэндлу при n=1.
- [ ] **Одна низкофрикционная дверь для фидбэка** — reply-to-email достаточно при n=1 (VideoAsk-виджет ждёт ≥5 покупателей, см. LATER).

**LATER / nice-to-have (гейтнуто по объёму — НЕ строить под одного покупателя):**
- [ ] **Анонимный device heartbeat** (уже отложен в Phase 1, T8) — **первое реальное обоснование:** делает «молчание» читаемым (device update-ping = «установлено + на связи»). Триггер: когда нужно читать активацию по многим покупателям.
- [ ] **VideoAsk feedback widget** — уже в бэклоге, триггер ≥5 продаж (см. ниже).
- [ ] **Discord auto-role `@Verified Owner`** — уже в T14, триггер ≥10-20 продаж. Discord-pull при n=1 де-приоритизирован: пустой сервер 1-2 человека = мёртвый воздух; покупатель уже ИМЕЛ путь в Discord (receipt + integration) и не вошёл — инвайт должен просто СУЩЕСТВОВАТЬ, не продавливаться.
- [ ] **License key — ВЕРДИКТ KEEP-AS-IS (PM 2026-06-17):** ключ генерится, web-side `verify-license.js` работает (T6) → не «декоративный», а «есть, но не энфорсится на happy-path» (in-device license сознательно не строили, см. блок ниже). НЕ энфорсить в девайсе сейчас: добавляет фрикшн + support-нагрузку (промахнувшийся license-чек = №1 способ сделать так, что у платящего «не работает») при ~нулевом апсайде против пиратства при n=1. НЕ убирать: единственный будущий anti-piracy/identity-хук. Переоткрыть ТОЛЬКО при видимом пиратстве (девайс на варезе) или если нужны license-gated перки/апдейты — обе проблемы объёмные.

- [ ] **5 коротких клипов 30 sec для IG/TikTok/Reels** — нарезка из основного демо (НЕ новая съёмка), вертикаль 9:16, captions читаемы без звука, нижняя треть чистая от транспорта Live; точки реза = feature-секции в [[demo-video-script]] (pages / banks / jump / native modes + общий тизер); класть в `dist/social-clips/`. Перенесено из T9 2026-06-10.
- [ ] **`fadercraft.com/update` страница (контент)** — **триггер: перед выпуском первого апдейта (1.1)** (решено 2026-06-10). Лёгкая страница в стиле лендинга: changelog + «Open your Gumroad Library» + «Gumroad emailed you a download link». URL уже зарезервирован в `version.json` (`url`). До неё `url` может временно указывать на `library.gumroad.com`.
- [x] **★ Listing на maxforlive.com — ОПУБЛИКОВАН 2026-06-12** (был top-priority distribution-канал — закрыт). **Device id `15522`, URL https://maxforlive.com/library/device.php?id=15522, Device Type = MIDI Effect, author Fadercraft, version 1.0.** Копи переписана benefit-first и выровнена по голосу сайта: открывается «Play your whole 14-channel rig like a single instrument», механика fixed-mapping вторым слоем (insight #1 — idea-first). Бандл подан как **два Live-сета на выбор (Starter ИЛИ Demo)**. Версии «Ableton Live 11 or later». **Цену в листинг не ставили** (решение основателя). Терминология выровнена с сайтом (instruments/mixer modes, toggle, encoder banks, Cue/Prelisten), licensing (one key / 3 activations), 48h support. Теги добавлены (вкл. `lcxl`/`mk3`/`lcxl mk3` под внутренний поиск каталога). **Канал обнаружения = ВНУТРЕННИЙ поиск/браузинг maxforlive** (не Google — решение основателя; внешнее SEO device-страницы не цель). _Завершено почему важно: единственный профильный канал, который ещё не был задействован — пассивный вечнозелёный, нулевой риск отторжения, квалифицированный интент. Был самый высокий рычаг на минимум усилий из бэклога._
  - **Follow-up (открытые, см. PM `launch-journal.md`):** (1) сайт kit-секция (TheKitSection) показывает только Starter, а сетов два на выбор — поправить, добавить Demo как второй Live-set вариант; (2) заменить дефолтный UI-скриншот превью на оформленный (instruments + mixer на фирменном тёмном фоне) — задача ux-ui-designer; (3) подтолкнуть первые скачивания/рейтинги (Discord / первые покупатели) — двигает девайс вверх в органической сортировке каталога + сейчас он в ленте новинок (окно внимания).
- [ ] Listing на **KVR Audio**
- [ ] Reddit posts: r/ableton, r/abletonlive — **post #1 published 2026-06-10** (r/Novation). Snapshot ~1.5 h: 518 views / 3 upvotes; evening: 811 views / 4 up / 8 comments, 100% upvote ratio, zero pushback. **Checkpoint 2026-06-11 — site-analytics side DONE** (analyst): ~20–24 real external sessions (после очистки owner/ботов), CTR с поста 2.5–3% (норма), buy_click 0 / purchase 0 (шум при n≈20, порог выводов по оферу ~100+ сессий), mode_download 1 реальный, video_play 1; 10/13 Reddit-входов на `/free-custom-modes` так и не увидели продуктовую страницу. **Решения PM:** следующий пост линкует ПРОДУКТОВУЮ страницу (не free-modes), UTM с первой минуты (отдельный utm_source на канал, в т.ч. youtube); мост free-modes→Control XL — см. Phase-1 задачу ниже. Key learning остаётся: idea-first («stop rebuilding your controller every project»), не фичи. Pending от поста #1: ~~свежий Reddit-срез~~ закрыт 2026-06-11 (15 h cut: 2.8K views / 8 up / 9 comments, 100% ratio, «#1 today»; реальный хвост ~71% после 2 h, CTR пересчитан ≈0.7–0.9% sessions-per-view); retention-чек припаркованных вкладок ~2026-06-17.
  - **Post #2 published ~06-11 вечер → r/ableton** (id `1u2wwuz`, **новый формат**: вопрос-обсуждение + ссылка дропнута в КОММЕНТЕ, не в теле — «soft launch»). Срез ~16 h (2026-06-12): **2.5K views, 0 upvotes (−1 нетто), 50% ratio, 8 comments**. **ФОРМАТ ПРОВАЛИЛСЯ — конкретно из-за AI-детекта**, не из-за темы: топ-коммент (+5) = «I don't get why you need to use AI to write a reddit question», AutoModerator напомнил правила «No AI/No selling». Боль зашла (on-topic ответ «remote script + master template» = тот же job-to-be-done). Восстановление сработало: OP признал AI прямо + переспросил реальный вопрос → нормальный техдиалог. **Контраст с постом #1: 100% ratio / ноль даунвотов** — первый сигнал реджекта на канале, и это **вердикт формату, а не оферу/аудитории**. **Решения PM:** (1) retire AI-prose question-with-comment-reveal формат → следующий пост = шейп поста #1 (first-person show-and-tell, СВОИМ голосом, ссылка в теле, idea-first); (2) UTM-провал — пост ушёл с голым `fadercraft.com` (не `/r-modes`), нарушение «UTM с первой минуты» → следующий пост обязательно vanity-редирект с отдельным `utm_campaign` под r/ableton; (3) next experiment — один повтор r/ableton в исправленном формате, чтобы отделить «реджект формата» от «реджект саба»; pass-bar ДО постинга: ratio ≥~80% + нет AI/spam в топ-комменте. Чекпоинт: r/ableton ~24 h (вечер 06-12) + analyst site-cut. Details: PM agent `launch-journal.md` + `insights.md` (#6 update, #10 update, **#11 new**)
- [ ] **Следующий Reddit-пост — в ПРОВЕРЕННОМ формате поста #1** (insight #11): first-person show-and-tell, СВОИМ голосом (не AI-проза), ссылка в теле, UTM с первой минуты. **🔒 REGISTER-GUARDRAIL (insight #24, 2026-06-18): свой голос НЕ только в теле, но и в КАЖДОМ ОТВЕТЕ в треде — ответ в AI-регистре строго ХУЖЕ молчания (на `1u74c6t` все ответы основателя закопаны −6/−11/−9). Отвечать как на YouTube-флипе (3 конкретных существительных, свой голос, без buy-ссылки) ИЛИ не отвечать. AMA в пуристском сабе НЕ запускать (формат усиливает урон — голос основателя = всё событие).** **Угол — РОВНО тот, что выстрелил** (permanent-interface / identity-frame «stop rebuilding my controller every project»), не фичи — триангулирован 3 линиями доказательств (тред 4 DIY-ригов + A/B пост#1-vs-#2 + engagement-профиль 2026-06-14: 21 share > 19 upvotes, ratio рос 93.3→95.2%). Угол ВАЛИДИРОВАН, канал — ещё под volume-тестом. **Саб — один на касание (insight #4), кандидаты по убыванию приоритета:** (a) **r/ableton retry** в исправленном формате — ключевой тест «реджект формата vs реджект саба» (pass-bar в [[reference_r_ableton_rules]]), **PRIORITY RAISED 2026-06-18** (теперь ДВА враждебных AI-персона результата в DAW-пуристских сабах — r/ableton post #2 + r/abletonlive `1u74c6t` — и НОЛЬ чистых own-voice тестов там; retry = единственный способ разделить «сабы отвергают НАС» vs «они отвергают AI-персону»); (b) **новые сабы под тот же угол** — r/edmproduction, r/madewithableton (санкционированный show-off дом по правилам r/ableton); **r/abletonlive — НЕ как «higher-fit lane», пока не пройдёт own-voice тест** (там AI-персона+AMA уже легла враждебно); (c) **r/Novation снова — НЕ табу**, но разнести во времени (≥1-2 нед, ДРУГОЙ first-person пост, не тот же угол в тот же мелкий саб подряд — пост #1 ещё распространяется). Pass-bar ДО постинга: ratio ≥~80%, нет AI/spam-коммента в топе. **НЕ лезть в 14 комментов поста #1, чтобы «оживить»** — тред 4 дня, ratio растёт, поздние founder-комменты читаются как манипуляция; отвечать только на новый реальный вопрос или если Gig-Performer вернётся с фото 4×LCXL (insight #10, кандидат в social-proof с разрешения). Details: PM `launch-journal.md` 2026-06-14 + 2026-06-18 (CORRECTION) + `insights.md` **#15, #24**.
  - **PM 2026-06-18 — SOCIAL-ОКНО 06-11→06-18, сведено (analyst + copywriter).** Главное: **канальный сплит — Reddit гонит ТРАФИК, maxforlive дал ДЕНЬГИ.** Reddit ≈52% сессий (39), весь video_play + 2/3 download, но НИ одного buy_click и 0 продаж — садит людей на `/free-custom-modes` (бесплатное) и там воронка кончается (insight #7; `introduction_post` = 14 сессий / 0 конверсий — инерция). maxforlive = 3 сессии, но единственный покупатель (sale #1, $39, NL). buy_click=4 за окно (первые в истории: US/iPad, NL, PL×2) — **ни один из Reddit-сессии.** YouTube: @triemond9961 **flip hostile→advocate 06-17** после конкретного фактологического ответа («sell it with a human feel… you will go much further») — живое подтверждение insight #11/#1, но это РЕЗОНАНС, не продажа. n=1-дисциплина: maxforlive НЕ коронуем (одна продажа ≠ rate), Reddit НЕ хороним (он мис-таргетед, не мёртв). **Решения PM (cheap/reversible):** (1) **P1 — следующий Reddit-пост линкует ПРОДУКТОВУЮ страницу (или free-page с ЖЁСТКИМ мостом), не голый giveaway** + свой `/x` UTM-редирект ДО публикации — прямой тест гипотезы «Reddit не конвертит»; (2) ~~**P2 — закрыть слепые зоны r/abletonlive `1u74c6t`**~~ **ЗАКРЫТО, см. КОРРЕКЦИЮ ниже** (живой тред пришёл — враждебный pile-on, UTM = `/r-abl` редирект); (3) **P3 — corrected-format r/ableton retry всё ещё НЕ сделан** — держим в очереди кандидатом, НЕ форсим (один-пост-на-касание); (4) **P4 — кормить maxforlive дешёвыми рычагами листинга** (видео в листинг, рейтинги, Last Updated), не коронуя; (5) **P5 — собрать YouTube-flip как копи/соц-актив** (слова @triemond9961 + его описание продукта как шаблон блока «что внутри»; souptron deep-dive ask = спрос на отложенное deep-dive видео/manual), НЕ чейзить хейтера в личку. **Открытый item: URL `organic`-поста не задокументирован** (самый вовлечённый Reddit-срез: 8 сессий, 2 video, 1 demo — но какой пост/где, в watchlist «(the organic-tagged push)») — попросить основателя/аналитика назвать URL, чтобы трекать+повторять. **НЕ:** разворачивать GTM на одном окне; считать конверсию при n=1; second-post-same-day. Чекпоинт: канальный сплит перечитываем на 2-3 продажах. Details: PM `launch-journal.md` 2026-06-18 (SOCIAL-WINDOW SYNTHESIS).
  - **PM 2026-06-18 — КОРРЕКЦИЯ к окну: r/abletonlive `1u74c6t` живой тред пришёл и ПЕРЕВЕРНУЛ его чтение — «двигатель окна» оказался ВРАЖДЕБНЫМ pile-on, не успехом.** (Сшивает рассинхрон: вывод «враждебный» уже стоял в записи PM 2026-06-17 ниже, но синтез окна 06-18 его не учёл и числил пост двигателем.) Факты (живой тред, ~2 дня после публикации): 4.5K views, score поста просел до ≈1, 18 комментов ВСЕ враждебные (топ: «OP is posting an ad. Their responses are AI generated» +7), формат был AMA. **ВСЕ ответы основателя закопаны в минус: −6/−11/−9/−2/−1/+1** — аудитория наказывает именно AI-регистр ответов (стены «cognitive load / persistent primitives», аналогия kitchen/stool/sink). «100% ratio / #1 дня» = vanity-снимок launch-часа, не выживший. **Сильнейшее на сегодня подтверждение «угол верный — подача убивает» (insight #1) + ценности человеческого голоса (#11):** TrieMond (тот же, что флипнулся в адвоката на YouTube 06-17) здесь пишет «I am genuinely interested in the thing being advertised» — продукт интересен, убивает подача; ОДИН человек, два регистра, противоположный исход. **Закрытые открытые items:** (a) комменты получены = враждебный pile-on; (b) UTM = `/r-abl` редирект (НЕ голый), атрибуция чистая. **НОВЫЙ durable-урок (insight #24): прекратить отвечать в тредах AI-стенами — ответ в AI-регистре строго ХУЖЕ молчания (углубляет pile-on + публично подтверждает обвинение). Отвечать только как на YouTube-флипе (3 конкретных существительных, свой голос, без buy-ссылки) ИЛИ не отвечать.** Влияние на очередь (cheap/reversible): r/abletonlive как канал НЕ закрыт, но связка AI-персона + AMA-в-пуристский-саб РЕТАЙРНУТА (второй враждебный AI-персона результат после r/ableton post #2); **PRIORITY RAISED на corrected-format r/ableton retry** — теперь ДВА враждебных AI-персона результата в DAW-пуристских сабах и НОЛЬ чистых own-voice тестов там, retry = единственный способ разделить «сабы отвергают НАС» vs «они отвергают AI-персону» (pass-bar без изменений: ratio ≥~80% + нет AI/spam в топе). Канальный сплит СТОИТ — коррекция объясняет reach-без-денег ПОЛНЕЕ (подача отталкивает + ссылка мис-таргетед), не переворачивает его. **НЕ:** хоронить r/abletonlive как саб; спасать тред новыми ответами (каждый тонул — пусть умрёт, insight #4); удалять тред (Streisand); чейзить TrieMond в личку. Details: PM `launch-journal.md` 2026-06-18 (CORRECTION), insight #24 new + #1/#11/#15 updated.
  - **PM 2026-06-17 — r/abletonlive AI-persona post = повторный (более резкий) реджект формата, вердикт усилен.** Тот же промо-оффер в r/abletonlive под AI-персоной RoundWitty4668 встречен ВРАЖДЕБНО (мгновенный AI-детект, «vibecoded bullshit», prompt-injection-ловушки, «Reported»). **Контраст подтверждает корпус:** тот же оффер в r/Novation — тёплый + intent на покупку; в r/ableton*/YouTube — реджект. **Убивает подача (AI-персона + buzzword), не оффер** («I am genuinely interested in the thing being advertised»). **Решения PM:** (1) **retire AI-persona для обсуждений ОКОНЧАТЕЛЬНО** — будущее присутствие только живым человеком, плейн-регистр «как TrieMond, не как RoundWitty4668» (усиливает rule-12 + insight #11; ЭТО конверсионная формула, проверенная на самом хейтере — voice-guide «Что конвертирует»); (2) **фокус GTM → r/Novation + железные площадки** (положительный ROI сейчас), r/ableton* НЕ закрываем как канал — закрываем AI-формат входа в него; (3) **dunk skwander «Can AI make it possible for you to stfu?» (+1, OP=0) — НЕ отвечать** (like-farming без конверсионной поверхности, тот же хейтер; ответ кормит тролля и держит проигранный тред наверху). Пост НЕ удалять (Streisand + признание поражения) — пусть тонет ~24 ч. Энергию → открытые запросы r/Novation (deep-dive/manual, спор mkii↔mkiii) живым ответом. Details: PM `launch-journal.md` + `insights.md` (#1–#5) 2026-06-17.
- [ ] **Вечнозелёный контент-актив: YouTube tutorial под поиск** (PM 2026-06-12). НЕ презентация продукта (она есть), а tutorial под намерение поиска («Launch Control XL MK3 in Ableton — permanent layout setup»), ведёт на лендинг с UTM. Переключает YT из «хостинг» (insight #5) в «канал открытия», создаёт хвост, переживающий reddit-импульсы. Средний рычаг, долгий горизонт.
- [x] **Reddit mention-monitoring: F5Bot (бесплатно) — заведён 2026-06-12** (решение основателя). Базовый монитор упоминаний, keywords добавлены. Цель — приходить рано и реально помогать СВОИМ голосом (rule-5 «be a redditor with a brand», тот же шейп, что insight #10 — спросить про ИХ сетап, без ссылки в первом касании). Ловим **проблемные keywords**, не только имя продукта (наш ICP говорит языком боли, не продукта — insight #1/#13).
  - **Keywords (задокументированы, чтобы не потерять):** *Core (ICP-железо):* `Launch Control XL`, `LCXL`, `Launch Control XL MK3`, `LCXL MK3`, `Novation Launch Control`. *Pain/intent:* `remap every project`, `remap my controller`, `remapping every project`, `mappings between projects`, `mappings don't save`, `controller mapping resets`, `remap every time`, `set up my controller every time`. *Тюнинг через ~1 неделю (≈2026-06-19):* шумные убрать, добавить вариантов болевых фраз.
  - **DIY Reddit-JSON монитор (search.json + cron + Discord webhook) — ОТЛОЖЕН** (триггер: F5Bot зашумит ИЛИ начнёт пропускать). Не пре-строить инфраструктуру под несуществующую проблему.
  - **AI-авто-реплай тулзы ИСКЛЮЧЕНЫ ПРИНЦИПИАЛЬНО** (IndiePilot, Listnr-AI, Gemini-боты и пр.) — прямой rule-12 «No AI» landmine, тот же, за который занулили пост #2 в r/ableton (insight #11). Монитор — чтобы привести НАС к разговору, не автоматизировать его. Не переоткрывать. Подробности: PM `insights.md` (**#13 new**).

> ### 🎯 STRATEGIC CHECKPOINT — go / passive / no-go (PM 2026-06-12)
> **Стадия сейчас:** pre-revenue валидация КАНАЛА (не оффера, не продукта). Подтверждено: ценностная гипотеза «permanent interface vs per-project setup» резонирует — пост #1 на срезе **2026-06-14 (4 дня): 6.2K views / 19 upvotes / 95.2% ratio / 14 comments / 21 share** (**shares > upvotes** — отпечаток felt-pain; ratio РОС с охватом 93.3→95.2% = угол обобщается за пределы хардкор-ICP), + 4 независимых DIY-решения в треде. **Угол/формат ВАЛИДИРОВАНЫ** (3 линии доказательств). Слабое/НЕ решено: трафик мизерный (~20-24 сессии с лучшего поста ≈ ~1% от просмотров), продаж ноль (analyst — шум при n≈20, порог выводов по оферу ~100+ сессий). **Резонанс ≠ конверсия** — держать раздельно: GO на «делать больше такого», HOLD на вердикте по оферу до накопления сессий/первой продажи.
> **Принцип:** канал #1 (Reddit) ещё НЕ отработан — 1 сильный пост + 1 формат-фейл = 2 точки данных, мало для вердикта. НЕ путать «канал не прокачан» с «оффер не работает».
> **Измеримый чекпоинт:** дать каналам **4-6 недель и ~5-6 качественных касаний** (посты в проверенном формате + maxforlive listing + 1-2 контент-актива), цель — накопить **~100+ реальных сессий**. Решающий сигнал — **первая реальная платящая продажа** (не тестовый пинг Gumroad).
> **🎯 UPDATE 2026-06-17 — GO-условие ВЫПОЛНЕНО (pending-атрибуция): ПЕРВАЯ РЕАЛЬНАЯ ПРОДАЖА Control XL.** Незнакомец заплатил реальные деньги end-to-end (не тест-пинг Gumroad). Это ровно событие, которое чекпоинт назвал решающим сигналом GO. **Что доказывает:** воронка физически проходима, оффер кликабелен по цене, резонанс впервые сконвертился в деньги. **Чего НЕ доказывает (n=1):** НЕ PMF (покупателей >0, не >1), НЕ что КАНАЛ конвертит (зависит от источника — пока неизвестен), НЕ валидацию линейки. **Источник продажи решает половину смысла** — ждём атрибуцию (analyst: utm/entry/path/A-B-вариант/owner-check/сессии-на-момент; основатель: продукт/цена, кто покупатель, был ли pre-sale контакт). НЕ пересматриваем стратегию на одной продаже — повторяемость читаем на 2-3 продажах. Приоритеты: P1 закрыть атрибуцию → P2 поговорить с покупателем (insight #10/#2, кандидат в testimonial) → P3 продолжать проверенный канал в проверенном формате → P4 первое соц-доказательство (снимает trust-tax нового бренда, insight #14) → P5 доделать first-impression polish (maxforlive preview + Demo kit-line). Детали: PM `launch-journal.md` 2026-06-17, insight #19. Анти-импульс держим: НЕ объявлять PMF, НЕ веером новые каналы, НЕ менять цену на радостях.
> **Развилка по итогу окна:**
> - **GO** (вкладываться дальше, думать про девайс #2 / umbrella-линейку): ≥1 реальная продажа ИЛИ явный buy-intent на 100+ сессиях. **← ✅ выполнено 2026-06-17 (первая продажа), pending-атрибуция.**
> - **PASSIVE** (листинг + лендинг + free modes работают пассивно, ручной маркетинг стоп, актив НЕ убиваем): 100+ сессий, тёплый качественный отклик, но ноль продаж и ноль buy-intent.
> - **NO-GO / пивот**: даже идея перестаёт резонировать (отторжение в проверенном формате на разных сабах). Тогда — пивот идеи или смена первого железа.
> **Потолок (TAM, честно):** Control XL на одном железе (LCXL MK3, нишевый channel-strip контроллер) = «приятный пассивный доход на нише», десятки-сотни продаж. Путь к большему ровно один — **umbrella-бренд + линейка** (тот же движок/идея под APC/Launchpad/Push — кратно больший рынок). Расширять линейку МОЖНО только после первой продажи первого девайса; раньше = масштабирование непроверенной гипотезы.

- [x] **UTM-дисциплина: vanity-редиректы** — **задеплоено 2026-06-11** (CF Pages): `/yt`, `/yt-modes`, `/yt-buy` (utm_source=youtube, campaign=control_xl_presentation) + `/r`, `/r-modes`, `/r-buy` (utm_source=reddit, campaign=introduction_post; Gumroad-пути → gumroad.com/l/control-xl с UTM). Смоук пройден (все 302). Описание YT-видео переведено на короткие ссылки; ссылка в Reddit-посте меняется на `/r-modes`. Правило: новый канал = новый `/x`-редирект ДО публикации
- [x] **Мост «free modes → Control XL» на `/free-custom-modes`** — **ЗАДЕПЛОЕН 2026-06-11** (фикс №1 чекпоинта; смоук пройден: страницы 200, консоль чистая, `/r-modes`+`/yt-*` живы). Реализован как **«quiet bridge»** (сознательное решение пользователя, отклонение от PM-рекомендации «продукт+цена на странице» — зафиксировано как гипотеза): финальная карточка перед футером — eyebrow "MORE POWER", H2 "Wake Up Your Launch Control", CTA "See how it works →" на ГЛАВНУЮ (не Gumroad); цены нет, newsletter-якорь и License-блок убраны, кнопка "Explore Control XL" из download-группы убрана. Структура страницы: Hero+миксер → Download → Import → Free pack includes → bridge card → footer. Попутно: nav-канал светлее на мобилке, кнобы Navigation выровнены, мобильный футер переработан, NBSP-типографика. **Прод-деплой ~14:00–15:00 ICT 2026-06-11**; копирайт ~10 итераций с copywriter-агентом, финал — пользователя. Метрики гипотезы: клики bridge-CTA (PostHog autocapture, кастомное событие не нужно) + путь `/free-custom-modes` → `/` в сессиях (доля входов со 2-м pageview vs baseline 3/13); замер на чекпоинте ~2026-06-17 (PM `launch-journal.md`)
- [x] **A/B `hero-permanent-interface` — ЗАПУЩЕН 2026-06-11** (PostHog experiment **376381**, https://us.posthog.com/project/458316/experiments/376381, running с 12:46 ICT): control = текущий фичевый hero, test = «M4L INTERFACE FOR LCXL MK3» / «One controller. Your permanent interface.» / «Map once — the same layout from studio to stage, in every Live Set.»; primary metric `buy_click`. Первое боевое применение инсайта «permanent interface». Значимость на текущем трафике — **месяцы** (зафиксировано в описании эксперимента): режим «поставить и копить», не подглядывать первые недели, варианты на лету не править. Все чтения hero-метрик за это окно — сегментировать по варианту. Тех: PostHog отдаёт пустые флаги headless-браузерам (bot UA) → QA-визиты эксперимент не загрязняют; exposure-события пойдут с первым живым визитёром (analyst проверит на следующем срезе)
- [x] **`ph_owner`-флаг на устройствах пользователя** — **закрыт 2026-06-11**: Brave iPhone, Brave Mac и штатный Safari iPhone помечены и фильтруются (пользователь подтвердил Safari-заход; analyst ранее показал, что штатный Safari помечен ещё с 06-10, заходы идут как `fadercraft-owner`). Осиротевший in-app-профиль (`374b2aa6…`) не смержился — его исторические события навсегда в отфильтрованных выборках (person-on-events), analyst дисконтирует руками
- [ ] Discord posts (3-5 серверов)
- [ ] Facebook groups posts: «LCXL Users», «Ableton Live Users Worldwide»
- [ ] Newsletter live (через Buttondown)
- [ ] **VideoAsk feedback widget** (Typeform) — круглый bubble с видео-аватаркой основателя на `/quickstart`, post-purchase странице и `/free-custom-modes`. Free tier 20 min/мес ответов, один `<script>` embed без cookie-consent. **Триггер**: первые ≥5 продаж или ≥50 уникальных посетителей `/free-custom-modes`. До запуска не вешать — first impression держим чистым. Записать 2-3 вопроса под разные точки воронки за один сеанс с микро/камерой (тот же setup, что и T9 demo).

---

## 🔧 2026-06-02 — Device fix + protocol/wiki hardening

> **Вне launch-счётчика Phase 0** (это не deliverable-треки, а корректность девайса и доков). Укрепляет то, на что опираются Quickstart/README (T10) и будущие правки m4l-master. Полный разбор — в [[log]].

**Device fix:**
- [x] Кнопки 11–14 (служебные mode-индикаторы) закрыты для MIDI-маппинга в `Control XL.amxd` — `parameter_invisible=2 (Hidden)`, кабельная функция сохранена, архив прошлой версии в `Max Devices/Archive/`
- [x] Лейбл «Bank fx» → «Bank» (UI MIXER-секции; сайт-мокап уже «Bank») — выполнено 2026-06-03 во всех трёх деливераблах (raw + Demo/Starter), бинарная пересборка с пересчётом chunk/offset-полей, scripting names не тронуты. Подробности — [[Mixer Layer]].
- [x] Bundle-состав обновлён 2026-06-03: в корень обоих сет-проектов (Demo/Starter) добавлены `XL_Performance.amxd` (исправленный) + `Router.als`; оба `.zip`-деливерабла пересобраны in-place (бэкапы `*.bak-prebankfix` в `dist/`). Загрузка в Gumroad — T12.

**Protocol/wiki reconciliation — 10 несостыковок разобраны (8 закрыто пруфами, #8 ложная тревога):**
- [x] listen-CC = **47** подтверждён байтами (`2F 0A`/`2F 14`); CC49 в инстр-модах — обычная кнопка
- [x] CC47 — **один CC, два слоя** (instrument mode-report+cross-transit / mixer_bank momentary)
- [x] CC49 (`page`) ≠ CC28 (`hold`) — независимые оси формулы
- [x] CC30-value микшера = **24..27** (правило `5+N` — только инструменты); поправлена ошибка «mode 11 → 16»
- [x] **CC30 ch7 = SELECT** (плагин шлёт) vs **CC31 ch7 = REPORT** (девайс шлёт, M4L не видит); passthrough режет оба
- [x] `0x0D` mode-idx = намеренный маркер **«возврат в предыдущий мод»** (value 127), не артефакт
- [x] Слоты: **15** (1–10 инстр / 11–14 mixer / 15 Cue), не 14
- [x] Relative энкодеры: только DAW mode (per-row, pivot 64), в custom mode недоступны (Novation feature-request) — задокументировано
- Правки в `wiki/concepts/` ([[Custom Modes Model]], [[Mode Encoding]], [[Custom Mode SysEx Layout]]) и `wiki/entities/` ([[Instruments Layer]], [[CC47 Cross-Mode Transit]], [[MIDI Passthrough]])

**Agent memory:**
- [x] m4l-master теперь помнит decompiled LCXL3 remote-script URL + DAW-mode протокол (`.claude/agent-memory/m4l-master/lcxl3-daw-protocol.md`)

---

## 🔧 In-device license activation — проектируется (scope TBD)

> Заведено 2026-06-03. Сейчас лицензии **в девайсе нет**: `version_check.js` только пингует версию и показывает «New Version» (клик → наружу). Проверка ключа существует только на web-стороне — `verify-license.js` (Gumroad API → `download_url`). «License встроен в девайс» — незаписанная фича. Решение v1.0-блокер / Phase 1 отложено до завершения дизайна. Дизайн обсуждается в чате 2026-06-03.

- [ ] **Дизайн**: цель (anti-piracy lock vs update-download unlock), модель (soft-unlock / hard-gate / grace), flow активации, оффлайн-устойчивость, хранение состояния, seat-caps — спроектировать до оценки
- [ ] (после дизайна) Решить: v1.0-блокер или Phase 1
- [ ] (после дизайна) Реализация в `.amxd` + при необходимости слим-endpoint `/api/activate`

## ✅ Mode 15 — CC47 report-value расхождение канон↔published (заведено 2026-06-03, ЗАКРЫТО 2026-06-10)

> **РЕШЕНО 2026-06-10:** канонический байт 574 = `0x6e` (110); все 5 шипящихся копий `15.syx` синхронизированы под канон, архивы пересобраны, wiki поправлена (диагноз + синха через `m4l-master`). Free-funnel файл теперь = канон, mode 15 self-report'ится корректно (110). Осталось только при следующем ручном деплое перезалить обновлённый `free-custom-modes.zip` на сайт (выкатывается со штатным `wrangler pages deploy`).

> Всплыло при ревизии нейминга «Cue Volume». Баг **не связан с меткой** — это рассинхрон функционального байта между каноном и тем, что реально раздаётся.

**Факты:**
- `custom-modes/15.syx` (канон) и `app/public/free-custom-modes/15.syx` (published) различаются **ровно одним байтом** на offset 574 (1-based 575), хотя mtime у обоих одинаковый (Jun 2 18:29) и вики [[Custom Mode SysEx Layout]] утверждает «byte-identical» — **утверждение ложное, поправить при фиксе**.
- Байт сидит в дескрипторе на offset 565: `49 3a 02 11 00 0d 10 00 2f XX 00` — CC=`0x2F`(47) + mode-routing маркер `0x0d`. То есть `XX` — это **значение mode-report для mode 15 на CC47**.
- канон = `0x6e` (110), published = `0x1e` (30).
- По правилу `N×10` для mode 15 ожидалось бы `150`, но это **> 127** (7-битный MIDI потолок) → mode 15 в принципе не может зарепортить себя этой схемой. `110` плагин прочтёт как mode 11, `30` — как mode 3.

**Impact:** раздаваемый во free-funnel файл ≠ канон; и self-report mode 15, похоже, сломан при любом из двух значений.

- [x] **Решено (m4l-master, 2026-06-10):** mode 15 ОБЯЗАН self-report'иться значением **110** (`0x6e`) — под него в патче выделенная CC47-ветка `m15_*`. `N×10=150>127` невозможно → 110 = свободный ×10-слот; `30` коллизирует с overlay inst-mode 3 (это и был баг).
- [x] **Синхронизировано (2026-06-10):** все **5** копий `15.syx` приведены к канону `0x6e` (на диске: `app/public/`, `app/dist/` + внутри обеих `free-custom-modes.zip`). Demo/Starter бандлы `.syx` не несут → bundle-zip не трогали. Бэкапы в `raw/archive/` (штамп `2026-06-10-023338`).
- [x] **Wiki поправлена (2026-06-10):** убрано ложное «byte-identical», задокументирован байт 574 = 110 + причина; запись в `log.md`.

## 🐞 Hardware feedback рвётся при downstream аудио-девайсе — DEFERRED → next version (заведено 2026-06-08)

> Откачено к чистому `44aa142b` 2026-06-08. Полный разбор + WIP-патчи у m4l-master (`xl-performance.md`), бэкапы итераций в `raw/archive/Control XL.2026-06-08-*.amxd`.

**Симптом:** выходной фидбэк Control XL на железо (LED / переключение custom-mode через CC30 ch7) перестаёт доходить до LCXL, когда **сразу после девайса в цепочке трека стоит аудио-девайс** (без инструмента-моста между ними). Вход (железо → плагин) при этом работает, UI плагина реагирует — ломается только выход (плагин → железо): мод переключается лишь на экране, контроллер физически не меняется.

**Root cause (установлен):** безымянный `ctlout` инжектит фидбэк в нисходящую MIDI-ветку цепочки трека; downstream аудио-девайс терминирует эту MIDI-ветку (у аудио-эффекта нет MIDI-выхода), поэтому фидбэк не доходит до аппаратного порта.

**Попытки фикса (откачены 2026-06-08):** маршрутизация фидбэка на явный `midiout` к аппаратному порту. Два подхода, оба не довели до рабочего на железе: (a) автодетект порта по имени через regexp — хрупкий, плюс multi-stage `zl.reg`-гейт тихо падал (`print` не срабатывал); (b) UI-селектор порта (`umenu` → pattr по имени → `midiout`, автодефолт `LCXL3 1 MIDI In`, матч LCXL3+MIDI без DAW/DIN) — собран, но сессия закрыта до проверки на железе. Реальный целевой порт на машине пользователя = `LCXL3 1 MIDI In` (пара к входу `LCXL3 1 MIDI Out`), НЕ DAW/DIN.

**Направление на следующую версию:** вернуться к UI-селектору порта (робастный путь «работает у всех»: автодефолт + ручной override, выбор в пресет по имени), проверить, что `midiout` реально достаёт до железа и CC30 ch7 физически переключает custom mode.

**Текущий workaround (документируем пользователю):** девайс должен быть единственным / последним релевантным на своём треке — после него в цепочке ничего лишнего (особенно аудио-девайса), иначе ломается hardware feedback.

- [ ] Next version: довести UI port-selector и проверить выход на железо (CC30 ch7 → физическая смена мода)
- [x] **Greenlit 2026-06-10** — «device must be last in chain, nothing after it». Уже в `dist/Quickstart.md` (2026-06-08). Пропагация PDF + bundle-zip + README + Gumroad install-гайд → выполняется вместе с финальной пересборкой бандла (кластер A, T12), отдельно PDF не гоняем. Также внести в новый `dist/README.md` (T10).

## 🏷️ Нейминг mode 15 — решение «Cue», не «Preview» (зафиксировано 2026-06-03)

Метка контрола = **«Cue Volume»**, оставлена как есть. Рассматривали выравнивание на `Preview Volume` (так зовётся DeviceParameter в палитре маппинга Live) — **отклонено**: эта строка видна только при ручном маппинге, а в видимом микшере Ableton ползунок живёт в секции **Cue**, поэтому «Cue» и точнее, и узнаваемее. «Listen/Prelisten» понятнее в вакууме, но это третий не-Ableton термин. Менять = перерезать байтовую метку в 5 копиях `.syx` + пересборка/редеплой — выгоды нет. **Не переоткрывать без новой причины.**

## 🚀 Phase 2 — SendsFollower launch (продукт #2, ЛИН-запуск)

> **Заведено 2026-06-17 (PM).** Второй платный продукт Fadercraft — **SendsFollower** (M4L-девайс для Ableton Live, software-only, не привязан к железу). **Сознательно лёгкий запуск на готовой инфраструктуре Control XL** — новое только: freeze девайса, копи, страница, одно видео, Gumroad-продукт. Всё остальное (домен, Header/Footer/компоненты, Gumroad-аккаунт/KYC/tax/payout `seller_id 6976309857072`, license-endpoint, email+SendGrid, Discord, PostHog, newsletter-форма, legal `/legal` бренд-уровня, система vanity-редиректов, update-механизм `node.script version_check.js` + `/api/version.json`) — **ПЕРЕИСПОЛЬЗУЕМ as-is**.
>
> **Зафиксированные решения основателя (НЕ переоткрывать):** (1) **девайс ГОТОВ** → нужен только freeze v1.0 + дата-бэкап (m4l-master), dev-трек минимальный; (2) **отдельный платный Gumroad-продукт** со своей ценой, license/refund/update-check переиспользуем с Control XL.
>
> **Деливерабл = Audio Effect RACK, а не голый `.amxd` (уточнено основателем 2026-06-17).** Продукт, который получает покупатель, — это рэк **`SendsFollowerRack.adg`** (уже существует: `~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack/SendsFollowerRack.adg`), внутри которого лежит сам девайс SendsFollower **и рядом LFO**. Покупатель получает готовый рэк (devices + LFO), а не отдельное устройство. Бэйр `SendsFollower.amxd` — это **компонент внутри рэка**, не самостоятельный продукт. **Quickstart — ОБЯЗАТЕЛЕН** (тон/формат Control XL Quickstart [[feedback_fadercraft_copy_conventions]]). Итоговый состав покупки: **рэк (`.adg`) + Quickstart**.
>
> **Update-check («New Version») — ПОДТВЕРЖДЁН, делаем абсолютно как у Control XL.** Девайс внутри рэка пингует серверный манифест `https://fadercraft.com/api/sends-follower.json` (зеркало Control XL `/api/version.json`), зажигает кнопку «New Version» при выходе апдейта. **Серверный манифест уже создан** (см. P2.4) — осталось прописать `version_check.js` во freeze.
>
> **Сознательно НЕ делаем** (в отличие от Control XL — это и есть «минимум усилий»): ❌ scroll-morph / PerformanceFlow / интерактивный мокап (только статика); ❌ custom-modes funnel (он про железо LCXL, SendsFollower software-only); ❌ отдельная pricing-страница (цена в CTA); ❌ 5 коротких клипов (опционально потом). ✅ Одно **презентационное видео** (+ опц. свой саундтрек), YouTube embed.
>
> **Состояние сегодня (обновлено 2026-06-17, проверено в репо/User Library):** **продукт = рэк** `SendsFollowerRack.adg` (6.4 КБ, в `Presets/Audio Effects/Audio Effect Rack/`) — внутри **замороженный** девайс Sends Follower (md5 `b5286b33`) + LFO (сток Live Suite, не бандлим). **Девайс ЗАМОРОЖЕН и самодостаточный** — `sends_follower.js` + `sf_version_check.js` (update-check «New Version») вшиты внутрь, внешних `.js` не требует. Дата-бэкап в `~/Brain/Sends Follower/raw/archive/SendsFollower.2026-06-17.amxd`. **Серверный update-манифест создан** — `app/public/api/sends-follower.json` (рядом с Control XL `api/version.json`; **в репозитории, НЕ задеплоен**; сейчас `latest=9.9.9` — ТЕСТ-значение для проверки кнопки, откатить на 1.0 перед запуском). **Site build чистый** (`npm run build` ок, манифест + нейминг «Sends Follower» в `dist`, не деплоено). Сайт = бренд-хаб (`/` HomePage со списком продуктов, `/control-xl` флагман готов, карточка Sends Follower = **COMING SOON**). Роут `/sends-follower` живой, но **заглушка** (`SendsFollowerPage.tsx` = Header + HeroProduct «is on the way» + FooterFull). В Brain пока НЕТ спеки/видео/Gumroad-продукта/копи Sends Follower. Что ещё НЕ сделано: Quickstart, 1-стр. спека (блокер копи/видео), презентационное видео, лендинг-копи, замена заглушки, Gumroad-продукт, vanity-редиректы, хардверная проверка update-check + деплой.
>
> Детали запуска и обоснование «минимум» — PM `launch-journal.md` 2026-06-17.

### 🎯 БЛИЖАЙШИЕ ШАГИ (по порядку, обновлено 2026-06-17)

> Это видимый чеклист «что делать дальше». Подробности — в фазах ниже.

1. **Деплой в ОТДЕЛЬНУЮ ветку/preview** (CF Pages branch deploy, `*.pages.dev`) — прод `fadercraft.com` **НЕ трогаем**. Только по команде основателя. (Манифест + нейминг уже в `dist`, билд чистый.)
2. **После деплоя — хардверная проверка update-check end-to-end:** при `latest 9.9.9 > 1.0` в девайсе загорается «New Version», клик → `library.gumroad.com`; манифест по адресу деплоя отдаёт реальный JSON, не SPA-fallback. ⚠️ **Нюанс:** в девайсе зашит ПРОД-URL `fadercraft.com/api/sends-follower.json` — на деплое решить, как свести (манифест-only на прод / временно перенацелить девайс на preview-URL).
3. **Откатить манифест `latest` 9.9.9 → 1.0** перед реальным запуском (сейчас 9.9.9 — ТЕСТ-значение для проверки кнопки).
4. **Написать 1-страничную спеку «что делает Sends Follower»** (P2.2) — **разблокирует копи и видео** (оба растут из спеки). Первый реальный шаг контент-трека.

---

### Сводка прогресса Phase 2

| Фаза | Сделано | Всего | % |
|---|---|---|---|
| P2.1 Продукт → freeze | 3 | 5 | 60% |
| P2.2 Контент / копи | 0 | 5 | 0% |
| P2.3 Страница (минимум) | 0 | 5 | 0% |
| P2.4 Коммерция | 1 | 4 | 25% |
| P2.5 Запуск | 0 | 4 | 0% |
| **ИТОГО Phase 2** | **4** | **23** | **~17%** |

> Условные обозначения: **[NEW]** = новый артефакт под Sends Follower; **[REUSE]** = переиспользуем инфраструктуру/компонент Control XL без изменений (нулевой объём, строка только чтобы было видно, что делать НЕ надо).

### P2.1 — Продукт → freeze (m4l-master) [почти весь NEW, но dev минимальный]

- [x] **[NEW] Freeze `SendsFollower.amxd` до v1.0 + дата-бэкап — DONE 2026-06-17 (m4l-master).** Девайс заморожен, новый md5 **`b5286b33`** (был `b5286b33d9adc12e023981ab1a117859`, подтверждён на диске в User Library). Дата-бэкап: `~/Brain/Sends Follower/raw/archive/SendsFollower.2026-06-17.amxd` (+ бэкапы рэка и js рядом). **`sends_follower.js` вшит внутрь** (был уже встроен) → девайс **самодостаточный**, внешних `.js` не требует (исключён «can't find file»). После freeze подтверждено: рэк **`SendsFollowerRack.adg` грузит замороженный девайс** (round-trip ок). **LFO внутри рэка = сток-устройство Live Suite** → бандлить/распространять НЕ нужно (закрывает вопрос про состав рэка). ([[feedback_amxd_edit_in_userlib]]) ⚠️ Замечание (не блокер): `send_follower.adv` отсутствует на диске, но рэк ссылается на него только в `LastPresetRef`, не в пути загрузки — девайс грузится нормально. Если будут раздавать пресет — восстановить.
- [x] **[NEW] Прописать update-endpoint в `version_check.js` внутри `SendsFollower.amxd` — DONE 2026-06-17 (m4l-master).** Update-check «New Version» добавлен **зеркально Control XL**: `node.script sf_version_check.js`, кнопка видна только при апдейте, клик открывает `url` из манифеста, fallback `library.gumroad.com`. Константы: `DEVICE_VERSION='1.0'`, `URL='https://fadercraft.com/api/sends-follower.json'`. `sf_version_check.js` **впечён во freeze** (девайс самодостаточный). **Лог-смоук семвера прошёл** (`1.1→dot 1`, `1.0→dot 0`, `2.3.1→dot 1`). Серверный манифест уже готов (P2.4). ⏳ **Хардверная проверка кнопки на железе — НЕ сделана** (см. БЛИЖАЙШИЕ ШАГИ #2: гейтнута деплоем preview; в манифесте на время теста стоит `latest=9.9.9`). ([[Version Check (Update Notifier)]])
- [x] **[NEW] Состав покупки ЗАФИКСИРОВАН = рэк `.adg` + Quickstart — деливерабл подтверждён 2026-06-17.** Деливерабл — **`SendsFollowerRack.adg`** (внутри девайс `b5286b33` + LFO; LFO = сток Live Suite, не бандлим). Бэйр `.amxd` отдельно НЕ кладём, он внутри рэка. Что остаётся открытым по составу: **написать Quickstart** (см. P2.2 — пока НЕ написан) и собрать сам Gumroad-zip (P2.4). Тон/формат — Control XL Quickstart [[feedback_fadercraft_copy_conventions]].
- [ ] **[REUSE] License-активация / endpoint** — НИЧЕГО не строим: `verify-license.js` + Gumroad License API уже работают; in-device license в Control XL так и не встроен (web-сторона) — у SendsFollower так же.

### P2.2 — Контент / копи [NEW]

- [ ] **[NEW] 1-страничная спека «что делает SendsFollower»** — `wiki/sendsfollower-spec.md`: что за проблема, что девайс делает, для кого. **Это основа и для копи, и для видео-скрипта** — пишем первой. (По формату — как `demo-video-script.md` / `landing-narrative` для Control XL, но короче.)
- [ ] **[NEW] Презентационное видео**: запись + монтаж (DaVinci Resolve [[project_fadercraft_vo_voice]]), **без install-части** (она в Quickstart, как у Control XL T9), опц. свой саундтрек → залить на YouTube → получить video ID. VO-голос по [[project_fadercraft_vo_voice]] если нужен.
- [ ] **[NEW] Лендинг-копи** (copywriter): hero / что делает / 2-3 буллета / requirements / CTA с ценой. idea-first, не фичи-лист (insight #1 — вести проблемой/идентичностью). Варианты в чат до применения ([[feedback_copy_variants_before_edit]]).
- [ ] **[NEW] Quickstart (обязателен)** — `dist/`-аналог Control XL Quickstart: requirements / как поставить рэк на трек (drag `SendsFollowerRack.adg`) / как пользоваться / updates («New Version») / troubleshooting. Тон/формат и конвенции — [[feedback_fadercraft_copy_conventions]]; идёт в Gumroad-zip (P2.1 состав покупки). Из спеки растёт так же, как видео и копи.
- [ ] **[NEW] OG-картинка + meta-копи** для роута (готовится тут, прокидывается в P2.3): title/description/canonical.

### P2.3 — Страница (минимум) [NEW страница на REUSE-компонентах]

> Заглушку `/sends-follower` → реальную страницу. **Только готовые компоненты, без анимаций** (это и есть «минимум»).

- [ ] **[NEW] Собрать страницу из REUSE-компонентов**: `Header` → `HeroProduct` → **статичный** feature-блок → `VideoSection` (YouTube ID из P2.2) → requirements → CTA (цена в кнопке) → `FooterFull`. Все компоненты уже существуют (`app/src/components`) — никаких scroll-morph/PerformanceFlow/интерактивного мокапа.
- [ ] **[NEW] SEO-meta для роута** в `scripts/seo-meta.mjs` (title/description/canonical/OG/JSON-LD SoftwareApplication) — тот же постбилд-скрипт, что у Control XL, добавить маршрут `/sends-follower`.
- [ ] **[NEW] OG-картинка** залить (`app/public/…`) и связать с meta.
- [ ] **[NEW] Превью-роут current-vs-proposed** перед заменой live-заглушки ([[feedback_current_vs_proposed]]) — current (заглушка) сверху / proposed (реальная) снизу, дождаться отмашки.
- [ ] **[NEW] Self smoke-test** страницы локально (консоль, видео play, per-route meta, мобилка) ДО деплоя ([[feedback_self_smoke_test]]).

### P2.4 — Коммерция [продукт NEW, рельсы REUSE]

- [ ] **[NEW] Gumroad product**: slug `sends-follower`, своя цена, cover image, описание (idea-first, [[feedback_fadercraft_copy_conventions]]), **Content = zip с рэком `SendsFollowerRack.adg` + Quickstart** (состав из P2.1). **[REUSE] аккаунт/KYC/tax/payout уже пройдены** (`seller_id 6976309857072`) — только новый продукт.
- [x] **[NEW] Серверный update-манифест под второй продукт — СОЗДАН 2026-06-17** (PM): `app/public/api/sends-follower.json` (рядом с Control XL `api/version.json`, отдельный путь — Control XL endpoint НЕ тронут). **⚠️ Сейчас в манифесте ТЕСТ-значение `latest=9.9.9`** (`url=library.gumroad.com`, changelog с пометкой «revert to 1.0 after testing», `min_compatible=1.0`) — нужно, чтобы кнопка «New Version» загорелась при хардверной проверке (9.9.9 > device 1.0). **ОБЯЗАТЕЛЬНО откатить `latest` → `1.0` перед реальным запуском** (см. БЛИЖАЙШИЕ ШАГИ #3), иначе у первого покупателя на v1.0 кнопка загорится ложно. **Файл в репозитории; на прод уедет со следующим деплоем — НЕ задеплоен** (правило [[feedback_no_auto_deploy_iterations]]). Девайс прописывает этот URL во вшитый `sf_version_check.js` — см. P2.1.
- [ ] **[NEW] Vanity-редиректы** `/sf` (+ `/sf-buy` если нужно) с UTM (`utm_source` по каналу) — в `app/public/_redirects` ДО анонса (insight #9, [[feedback_outbound_links_doc]]); **зеркалить в `wiki/outbound-links.md`** (отдельная кампания `sendsfollower_launch`).
- [ ] **[REUSE] license endpoint / refund-копи / Gumroad↔Discord** — `verify-license.js`, refund-страница `/legal` (бренд-уровня), Discord-интеграция продукта переиспользуются; новый продукт просто подключить к той же Discord-интеграции.

### P2.5 — Запуск [NEW действия, REUSE инфра]

- [ ] **[NEW] Хаб-карточка SendsFollower: COMING SOON → живой CTA «Explore»** (HomePage) — единственная правка хаба.
- [ ] **[REUSE→verify] Self smoke-test + verify assets после деплоя** — curl нового бандла до `application/javascript` ДО открытия в браузере ([[feedback_deploy_verify_assets_first]]), затем browse-QA на проде ([[feedback_self_smoke_test]]); деплой по той же процедуре `wrangler pages deploy` из `app/` ([[reference-fadercraft-deploy]], [[outbound-links]] раздел «деплой из app/, не из root»).
- [ ] **[NEW] Анонс**: Discord `#announcements`, соцсети (YT/IG), maxforlive listing (второй девайс — отдельный listing, тип = по факту девайса; insight #12 — пассивный вечнозелёный канал). Живым человеком, не AI-персоной (insight #11 / [[reference_r_ableton_rules]]).
- [ ] **[NEW] Чекпоинт после запуска**: первые качественные сигналы (что говорят / на что откликаются), первая продажа. Привязать к тому же strategic-checkpoint мышлению, что и Control XL (резонанс ≠ конверсия, не дёргаться на одном сигнале). PM `launch-journal.md`. **NB:** это чекпоинт Sends Follower (продукт #2) — НЕ путать с первой продажей Control XL (флагман), которая случилась 2026-06-17 (см. strategic checkpoint выше). У Sends Follower своя первая продажа ещё впереди.

> **Открытые вопросы / риски (PM 2026-06-17):**
> 1. ✅ **ЗАКРЫТО 2026-06-17 — нейминг = «Sends Follower» (два слова, с пробелом).** Каноническое написание выбрано и **уже применено в коде + проверено в сборке**: `HomePage.tsx` (карточка/alt), `SendsFollowerPage.tsx` (header/hero/footer), `scripts/seo-meta.mjs` (title+description `/sends-follower`). Технические идентификаторы остаются как есть: компонент `SendsFollowerPage`, файл `SendsFollower.amxd`, роут `/sends-follower`. Дальше Gumroad-листинг + maxforlive держать «Sends Follower».
> 2. **Спека = блокер всего контента (АКТИВНЫЙ):** видео и копи оба растут из 1-страничной спеки «что делает Sends Follower» (P2.2 первый пункт). Пока её нет — нельзя писать ни hero, ни видео-скрипт. Это первый реальный шаг контент-трека (см. БЛИЖАЙШИЕ ШАГИ #4).
> 3. ✅ **РАЗРЕШЕНО 2026-06-17 — `sends_follower.js` вшит во freeze.** Девайс самодостаточный (md5 `b5286b33`), внешних `.js` не требует → «can't find file» исключён, рэк грузит замороженный девайс. Не риск.
> 4. **Деплой-нюанс update-check (АКТИВНЫЙ):** в девайсе зашит ПРОД-URL `fadercraft.com/api/sends-follower.json`, а проверять кнопку будем на preview-деплое (`*.pages.dev`). На деплое решить, как свести: манифест-only выкатить на прод, либо временно перенацелить девайс на preview-URL. См. БЛИЖАЙШИЕ ШАГИ #2.
> 5. **Манифест на ТЕСТ-значении (АКТИВНЫЙ):** `app/public/api/sends-follower.json` сейчас `latest=9.9.9` (тест, чтобы кнопка «New Version» загорелась при проверке; в changelog пометка «revert to 1.0»). **Откатить на `1.0` перед реальным запуском** — иначе у первого покупателя на v1.0 кнопка загорится ложно. См. БЛИЖАЙШИЕ ШАГИ #3.
> 6. **Организационный (НОВЫЙ, к решению):** бэкап девайса и его wiki легли в **новую папку `~/Brain/Sends Follower/`** (своя `wiki/`, `raw/archive/`, `log.md`, `CLAUDE.md`), отдельно от `~/Brain/Fadercraft/wiki/` (где этот roadmap). Структура раздваивается — открытый вопрос: консолидировать ли Sends Follower под Fadercraft-зонтик, или вести как отдельный проект. Пока зафиксировано как факт; решение за основателем.

## Связанные страницы

- [[Novation XL]] — основной хаб проекта
- [[index]] — flat TOC
- [[log]] — журнал операций над wiki
