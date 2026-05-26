---
type: roadmap
project: Novation
created: 2026-05-05
updated: 2026-05-26
---

# Fadercraft Roadmap

**Summary**: Живой checklist прогресса по запуску **Fadercraft XL Performance** (M4L-устройство для Novation Launch Control XL MK3). Основной хаб проекта — [[Novation XL]]. Спека и план — `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` и `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md`.

**Implementation workspace**: `~/Projects/Claude/Fadercraft/` (раньше `novation/`, переименовано 2026-05-06). Там живут: design system tokens, React-компоненты, Figma parity. Эта папка (Brain) — только планирование.

**Sources**: spec + Phase 0 plan + chat-history с Claude.

**Last updated**: 2026-05-26

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
| Gumroad onboarding | 4 | 5 | 80% |
| T3 Brand identity | 5 | 7 | 71% |
| T5 Instagram | 0 | 3 | 0% |
| T7-real Лендинг | 0 | 5 | 0% |
| T8 M4L update integration | 0 | 9 | 0% |
| T9 Демо-видео | 0 | 9 | 0% |
| T10 Документация | 1 | 3 | 33% |
| T11 Buttondown | 0 | 8 | 0% |
| T12 Bundle assembly | 4 | 14 | 29% |
| T13 Final verification | 0 | 6 | 0% |
| **ИТОГО Phase 0** | **47** | **102** | **~46%** |

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
- [ ] Content upload (bundle zip) — блокируется T12; welcome+quickstart-текст в Content tab уже вставлен **2026-05-26**

---

## 🚀 Phase 1 — Alternative payment rails (post-launch, deferred)

После v1.0 launch, если будут конкретные триггеры (см. [[payment-rails]] для матрицы).

### Payoneer (USD-приёмник)
- [ ] Триггер: Gumroad payout через банк дороже Payoneer
- [ ] Регистрация: passport + Thai address proof (motorbike DL ✅ доступен)
- [ ] Verify identity → Linked Bangkok Bank THB → тестовый transfer

### Isotonik Studios (B2B reseller)
- [ ] Триггер: XL_Performance готов + демо-видео опубликовано
- [ ] Email sales@isotonikstudios.com с pitch
- [ ] Revenue share, developer agreement, payout setup

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
- [ ] **`/free-custom-modes` страница** (free funnel — см. T12 distribution strategy ниже): `lcxl-mk3-modes.json` + README + CTA-блок к bundle, объясняющий что без `.amxd` modes работают как обычные layout'ы без mode-switching

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

> **Content must-include (user note 2026-05-25):** «Закинул на MIDI-трек» — недостаточно. Скрипт **обязан** показать на экране настройку: **MIDI From → Launch Control XL MK3 (DAW port)**, **MIDI To → Launch Control XL MK3 (DAW port)**, **Channel → All** (или явно тот, на котором сидит overlay listen CC). Без этих трёх настроек устройство не получает входной MIDI и не отвечает на LCXL — самая частая причина «не работает» у первого пользователя.

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

> **Content must-include (user note 2026-05-25):** Quickstart и user-facing README **обязаны** иметь отдельный шаг «Настройка MIDI-роутинга» со скриншотом: **MIDI From / MIDI To / Channel** на трек с устройством. Не объединять с шагом «положить .amxd на трек» — это два разных действия, второе часто пропускают.

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

> **Distribution strategy (user note 2026-05-25):** Гибрид — Custom Modes JSON **дублируется** в двух местах: бесплатно на `fadercraft.com/free-custom-modes` (см. T7-real) как SEO/discovery funnel, и в платном bundle (чтобы покупатель не ходил отдельно на сайт). Live Set + `.amxd` + Quickstart + Demo — только в платном bundle. Обоснование: modes без `.amxd` работают как любые обычные custom-mode'ы LCXL — переключаются руками на самой ручке. Mode-switching/cross-mode transit/Solo Follower живут в `.amxd`, поэтому feature-set не утекает. Подробно: см. log 2026-05-25 «distribution strategy».

- [ ] Custom Modes для LCXL MK3 → `dist/custom-modes/lcxl-mk3-modes.json` + README (с CTA на bundle внутри README)
- [ ] **Опубликовать `lcxl-mk3-modes.json` отдельно** на `web/free-custom-modes/` (free funnel — связано с T7-real)
- [ ] `XL_Performance_starter.als` Live Set с маппингами + контентом
- [ ] Собрать `dist/fadercraft-xl-performance-v1.0/` (содержит `.amxd` + `solo_follower.js` + custom-modes/ + `.als` + Quickstart.pdf + опц. demo.mp4)
- [ ] Zip → `fadercraft-xl-performance-v1.0.zip`
- [ ] Загрузить в Gumroad product Content (welcome+quickstart-текст уже вставлен **2026-05-26**; файлы — после сборки bundle)
- [x] Cover image 1280×720 PNG + thumbnail — брендовые ассеты залиты в Gumroad **2026-05-26**, дефолтная плашка снята
- [x] Описание продукта на странице Gumroad — **2026-05-26**
  - ✅ Copy fix «6 controls instead of 2» применён вручную на Gumroad (2026-05-26); параллельно поправлено в `PerformanceFlow.tsx` и в Figma (nodes `1398:143`, `1434:6902`)
- [x] URL slug `xl-performance` — **2026-05-26**
- [ ] env vars `LATEST_BUNDLE_URL` + `GUMROAD_PRODUCT_ID` в CF Pages
- [x] Publish продукт (Draft → Live) — **2026-05-26**, продукт виден на `fadercraft.gumroad.com`

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
