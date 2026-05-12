---
type: roadmap
project: Novation
created: 2026-05-05
updated: 2026-05-06
---

# Fadercraft Roadmap

**Summary**: Живой checklist прогресса по запуску **Fadercraft XL Performance** (M4L-устройство для Novation Launch Control XL MK3). Основной хаб проекта — [[Novation XL]]. Спека и план — `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` и `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md`.

**Implementation workspace**: `~/Projects/Claude/Fadercraft/` (раньше `novation/`, переименовано 2026-05-06). Там живут: design system tokens, React-компоненты, Figma parity. Эта папка (Brain) — только планирование.

**Sources**: spec + Phase 0 plan + chat-history с Claude.

**Last updated**: 2026-05-12 (Gumroad verification passed — primary MoR разблокирован)

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
| **Gumroad (primary MoR)** ✅ | **4** | **15** | **27%** |
| Paddle onboarding (deprioritized) | 5 | 6 | 83% |
| Payment rails (Payoneer/Isotonik/crypto/GE) | 0 | 14 | 0% |
| Тайские мото-права | 9 | 22 | 41% |
| T3 Brand identity | 0 | 6 | 0% |
| T5 Instagram | 0 | 3 | 0% |
| T7-real Лендинг | 0 | 5 | 0% |
| T8 M4L update integration | 0 | 9 | 0% |
| T9 Демо-видео | 0 | 9 | 0% |
| T10 Документация | 1 | 3 | 33% |
| T11 Buttondown | 0 | 8 | 0% |
| T12 Bundle assembly | 0 | 14 | 0% |
| T13 Final verification | 0 | 6 | 0% |
| **ИТОГО Phase 0** | **49** | **119** | **~41%** |

---

## ✅ Foundation

- [x] Спека `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` написана и закоммичена
- [x] Phase 0 implementation plan `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md` написан и закоммичен
- [x] Имя бренда выбрано: **Fadercraft** (отбракованы Setforge, Backline, Patchcraft, Faderwork, Setcraft)

## ✅ T1 Domain & DNS

- [x] Домен `fadercraft.com` куплен на Cloudflare Registrar
- [x] DNS namervers активны (anita / rohin)
- [x] CNAME `www`
- [x] CF Pages подключён к GitHub `inBuro/Brain`, root `fadercraft/web`
- [x] Custom domain `fadercraft.com` замаплен на CF Pages, SSL активен

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
- [x] `web/functions/api/verify-license.js` — Pages Function (Gumroad version on `main`)
- [x] **Branch `t6/paddle-license`:** verify-license переписан под Paddle Transactions API
- [x] Quickstart.md написан (subagent)
- [x] Buttondown welcome email черновик добавлен в `brand/email-setup.md`

## ✅ T7 Placeholder pages

- [x] `web/index.html` — placeholder лендинг
- [x] `web/pricing.html`
- [x] `web/terms.html` (~830 слов)
- [x] `web/privacy.html` (~620 слов)
- [x] `web/refund.html` (~310 слов)
- [x] Footer-навигация на всех страницах

## ✅ Gumroad (primary MoR — verification passed 2026-05-12)

Главный блокер запуска снят. Gumroad стал primary fiat-рельсом, Paddle уходит в backlog. Source of truth по всей Gumroad-интеграции — `brand/gumroad-setup.md`.

- [x] **Seller account verified** (Russian passport + Thai address) 2026-05-12
- [x] Payout method: Bank Account → Bangkok Bank (code 002), THB, Weekly schedule
- [x] Billing → Business name `Fadercraft`, Invoice PDF включён
- [x] Seller ID зафиксирован, сохранён в `GUMROAD_SELLER_ID` (CF Pages Secret) 2026-05-12
- [ ] Tax interview / W-8BEN (проверить, требуется ли Gumroad'ом для non-US individual)
- [ ] Profile: avatar + bio + social links (depend on T3 brand identity)
- [ ] Settings → support email = `support@fadercraft.com`
- [ ] Создать product **«Fadercraft XL Performance»**, slug `xl-performance`, цена $39
- [ ] Cover image 1280×720 + product description (взять из landing-narrative Beat 1–2)
- [ ] Включить **«Generate license keys for each sale»** в product settings
- [ ] Зафиксировать `GUMROAD_PRODUCT_ID` в CF Pages env vars после создания продукта
- [ ] Залить bundle `fadercraft-xl-performance-v1.0.zip` (Gumroad-hosted на MVP, см. setup-doc)
- [ ] Зафиксировать `LATEST_BUNDLE_URL` в CF Pages env vars
- [ ] Кастомизировать receipt-email: download link + license key + Quickstart-ссылка
- [ ] 100% off discount code для smoke-test покупки (T13)
- [ ] **NOT:** Ping endpoint — пока не настраиваем, текущий verify-license endpoint не подходит под Gumroad ping контракт (см. setup-doc, Flow A vs Flow B)
- [ ] **NOT:** PayPal connection — заблокирован NDID, не пытаемся
- [ ] (опц., Phase 1) Custom domain `buy.fadercraft.com`

## 🆕 Payment rails (secondary, parallel to Gumroad)

После ресёрча 2026-05-06 (см. [[payment-rails]]) зафиксированы рабочие рельсы для профиля «русский паспорт + Таиланд + Bangkok Bank, без тайского ID». Идут параллельно Gumroad как дополнительные каналы.

### Payoneer (USD-приёмник)

- [ ] Регистрация на Payoneer: passport + Thai address proof (Bangkok Bank statement / lease / TM.30 / motorbike DL после получения)
- [ ] Verify identity (1–3 рабочих дня)
- [ ] Linked Bangkok Bank THB receiving — настроить
- [ ] Тестовый incoming USD transfer

### Isotonik Studios (B2B reseller)

- [ ] Дождаться готового XL_Performance + демо-видео
- [ ] Email на sales@ isotonikstudios.com с pitch + демо
- [ ] Согласовать revenue share, подписать developer agreement
- [ ] Указать payout (Payoneer USD или Wise / Bangkok Bank SWIFT)

### Crypto checkout (direct sales)

- [ ] Сравнить **Cryptomus** vs **NOWPayments** vs **Coinbase Commerce** — комиссии, поддерживаемые сети, UX чекаута, anti-fraud
- [ ] Выбрать провайдера, интегрировать на лендинг (Cloudflare Pages Function для verify-payment + license-issue)
- [ ] Тестовая покупка end-to-end
- [ ] Off-ramp: USDT → Bybit P2P → Bangkok Bank THB, проверить лимиты и спред

### Georgian Individual Entrepreneur (deferred)

- [ ] Триггер: выручка ≥ $500–1000/мес стабильно
- [ ] Найти регистратора в Тбилиси с remote-PoA-сервисом (~$1–1.5k setup)
- [ ] Регистрация ИП с режимом 1% (до 500k GEL/год)
- [ ] Открыть Wise Business на грузинскую сущность
- [ ] (опц.) Stripe Georgia → unlocks Lemon Squeezy / Polar / Paddle через грузинский entity

---

## ⏸ Paddle onboarding (deprioritized after Gumroad verification)

Gumroad покрывает primary fiat MoR. Paddle оставлен как opt-in second rail (EU-VAT handling + B2B), но больше не блокирует запуск. Чейзить Sumsub только если разрешение само придёт.

- [x] Seller account зарегистрирован
- [x] Trading name: Fadercraft
- [x] Web domains, Pricing, Terms, Privacy, Refund URLs поданы
- [x] Compliance questionnaire (MATCH list, etc.) отправлен
- [x] Identity documents отправлены в Sumsub (первая попытка — отклонена за качество фото)
- [ ] **Sumsub session разблокирована (Paddle support contacted, waiting reply)**
- [ ] Re-upload документов в Sumsub
- [ ] Paddle final KYC approval

---

## 🆕 Тайские мото-права (backup-документ для KYC)

Цель — иметь тайские DL как местный government-issued ID, чтобы пройти Stripe-зависимые KYC если Paddle с загранпаспортом откажет (или для будущих платформ). Категория: **motorbike** (car отложен — нет опыта вождения, потребует отдельного блока с уроками).

Полный чеклист и тактика ускорения: [`_Inbox/thai-driver-license.md`](../../_Inbox/thai-driver-license.md).

### Pre-flight ✅ (2026-05-04)

- [x] Связаться с landlord, TM.30 receipt, копии Tabien Baan и ID, фото 4×6, 500 THB

### Day 1 ✅ (2026-05-05)

- [x] Bluport Immigration → Certificate of Residence
- [x] Медсправка «for driving license»

### Booking ✅ (2026-05-06)

- [x] DLT Smart Queue: слот **2026-07-01** в **Prachuap Khiri Khan Provincial Land Transport Office, Pran Buri Branch**
- [x] Категория решена: **motorbike**

### До экзамена

- [ ] Двигать слот раньше 1 июля (рефреш приложения, walk-in утром, альтернативные офисы Prachuap/Hua Hin)
- [ ] Подготовка: DLT QR LICENCE app до стабильных ≥48/50, safety video, практика баланса/восьмёрки
- [ ] Освежить Residence Cert + Medical Cert ≤30 дней до экзамена

### Экзамен-день

- [ ] Документы → physicals → safety video → theory (50 вопросов) → practical (slalom, баланс, восьмёрка, торможение) → пластик

### После получения прав

- [ ] Загрузить тайские права в Sumsub (если Paddle ещё не одобрил по загранпаспорту)
- [ ] Получить Paddle approval
- [ ] (Опц.) Альтернативно — зарегистрироваться на FastSpring как backup-канал

### Отдельный трек (позже): car license

- [ ] Найти автошколу в Hua Hin (Honda/Toyota DLT-certified)
- [ ] Пройти курс уроков вождения
- [ ] Сдать на категорию car (теория уже зачтётся? — проверить)

---

## 📋 Phase 0 (продукт + контент)

### T3 Brand identity

- [ ] Бриф: tone, аудитория, что избегать
- [ ] Логотип-mark (SVG, ≤2KB)
- [ ] Wordmark «Fadercraft»
- [ ] 2 primary colors → `brand/colors.md`
- [ ] Social tiles 1080×1080
- [ ] Commit `brand/`

### T5 Instagram presence

- [ ] Зарегистрировать handle (`@fadercraft.studio`/`.audio`/`.dev`)
- [ ] Bio + ссылка на fadercraft.com
- [ ] Profile photo

### T7-real Real landing page

- [ ] Заменить placeholder `index.html` на полноценный 9-секционный лендинг
- [ ] Полноценный `pricing.html`
- [ ] Hero loop video (8 sec, autoplay, muted)
- [ ] `style.css` с brand colors (mobile-first)
- [ ] Smooth scroll + lazy load в `main.js`

### T8 M4L device update integration

- [ ] Скопировать `update_check.js` в `~/Music/Ableton/User Library/Max Devices/`
- [ ] Открыть `XL_Performance.amxd` в Max
- [ ] UI секция: version display + «Check for update» + indicator dot
- [ ] Подключить `[js update_check.js]`
- [ ] Routing статусов (up_to_date / update_available / errors)
- [ ] In-device newsletter signup (Buttondown embed-API)
- [ ] (опционально) Anonymous heartbeat
- [ ] Re-version patch с v1.5 → v1.0
- [ ] Smoke test в Live: «Check for update» работает
- [ ] Test «v1.1 available» сценарий

### T9 Demo video production

- [ ] 1-страничный скрипт
- [ ] Запись screen + voice-over
- [ ] Монтаж
- [ ] Export master 1080p MP4
- [ ] Hero loop 8 sec → `web/assets/hero-loop.mp4`
- [ ] 5 коротких клипов 30 sec для IG/TikTok/Reels
- [ ] Создать YouTube канал «Fadercraft»
- [ ] Загрузить video, скопировать ID
- [ ] Update `index.html` с YouTube embed

### T10 Extended documentation

- [x] `dist/Quickstart.md` (subagent)
- [ ] `dist/Quickstart.pdf` (рендер через pandoc/make-pdf)
- [ ] User-facing `dist/README.md` (адаптировать `raw/XL_Performance.README.md`)

### T11 Newsletter pipeline (Buttondown)

- [ ] Регистрация на https://buttondown.email
- [ ] Username `fadercraft`
- [ ] Custom domain (опц.) `news.fadercraft.com`
- [ ] Welcome email вставить (текст уже на ветке `t6/paddle-license`)
- [ ] Double opt-in
- [ ] Получить embed snippet формы
- [ ] Embed на лендинг (T7-real)
- [ ] Embed внутрь M4L-устройства (T8)

### T12 Bundle assembly + Gumroad product

- [ ] Custom Modes для LCXL MK3 → `dist/custom-modes/lcxl-mk3-modes.json` + README
- [ ] `XL_Performance_starter.als` Live Set с маппингами + контентом
- [ ] Собрать `dist/fadercraft-xl-performance-v1.0/`
- [ ] Zip → `fadercraft-xl-performance-v1.0.zip`
- [ ] Загрузить в Gumroad product Content
- [ ] Cover image 1280×720 PNG
- [ ] Описание продукта на странице Gumroad
- [ ] URL slug `xl-performance`
- [ ] env vars `LATEST_BUNDLE_URL` + `GUMROAD_PRODUCT_ID` в CF Pages
- [ ] Publish продукт (Draft → Live)

### T13 Final pre-launch verification

- [ ] Лендинг checklist (9 секций, video, FAQ, mobile)
- [ ] Email infra end-to-end
- [ ] Update-check end-to-end (bump 1.0 → 1.1, license-key flow)
- [ ] Test purchase: 100% off coupon → checkout → license → download → install по Quickstart
- [ ] Tag `v1.0` в git
- [ ] PR review всех веток в main

---

## 🚀 Phase 1 (post-launch, отдельный план потом)

- [ ] YouTube канал создан, демо-видео опубликовано
- [ ] Listing на **maxforlive.com** (бесплатно, обязательно)
- [ ] Listing на **KVR Audio**
- [ ] Reddit posts: r/ableton, r/abletonlive
- [ ] Discord posts (3-5 серверов)
- [ ] Facebook groups posts: «LCXL Users», «Ableton Live Users Worldwide»
- [ ] Newsletter live (через Buttondown)

---

## Связанные страницы

- [[Novation XL]] — основной хаб проекта
- [[index]] — flat TOC
- [[log]] — журнал операций над wiki
