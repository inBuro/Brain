---
type: roadmap
project: Novation
created: 2026-05-05
updated: 2026-06-10 (T9 демо-видео ЗАКРЫТ к launch — видео финал на YouTube ID UsJxPBdf568, вшито в лендинг, канал+описание готовы; 5 клипов→Phase 1. Продакт-решения: pricing.html отменён (цена в CTA); «last in chain» гринлайт→кластер A; mode 15 ЗАКРЫТ (байт 574=110, 5 копий синхронизированы). Bundle-фиксы: custom-modes/ в Demo+Starter, девайс переименован Control XL.amxd + Router.als refs. Зипы пересобраны (custom-modes верхним уровнем, Control XL.amxd, README, Session view). Demo 191.7МБ принят как есть (продакт-решение, чистку не делаем). Зипы перезалиты на Gumroad (пользователь). Кластер A (финализация бандла) ЗАКРЫТ. Дальше — T13 верификация. Phase 0 105/114 ~92%)
---

# Fadercraft Roadmap

**Summary**: Живой checklist прогресса по запуску **Fadercraft XL Performance** (M4L-устройство для Novation Launch Control XL MK3). Основной хаб проекта — [[Novation XL]]. Спека и план — `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` и `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md`.

**Implementation workspace**: `~/Projects/Claude/Fadercraft/` (раньше `novation/`, переименовано 2026-05-06). Там живут: design system tokens, React-компоненты, Figma parity. Эта папка (Brain) — только планирование.

**Sources**: spec + Phase 0 plan + chat-history с Claude.

**Last updated**: 2026-06-10

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
| T8 M4L update integration | 7 | 9 | 78% |
| T9 Демо-видео (закрыт к launch) | 9 | 10 | 90% |
| T10 Документация | 3 | 3 | 100% |
| T11 Newsletter (Gumroad follow) | 1 | 1 | 100% |
| T12 Bundle assembly | 15 | 19 | 79% |
| T13 Final verification | 1 | 6 | 17% |
| T14 Discord community | 10 | 11 | 91% |
| T15 Analytics (Clarity) | 2 | 2 | 100% |
| **ИТОГО Phase 0** | **105** | **114** | **~92%** |

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

### Isotonik Studios (B2B reseller)
- [x] Триггер сработал: XL_Performance готов + демо-видео опубликовано (пилот, 2026-06-10) → можно питчить
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

### T8 M4L device update integration

> **Реализация изменилась (2026-06-01):** plain `[js]` не умеет HTTPS → перешли на **Node for Max** (`node.script`, встроенный `https`, без npm/external — портативно, фризом впекается внутрь `.amxd`). UI вместо «version display + Check button + dot» — кликабельный **«New Version»**, появляется только при доступном обновлении.

- [x] `version_check.js` (наш update-check) в `~/Music/Ableton/User Library/Max Devices/` — **2026-06-01**
- [x] `Control XL.amxd` открыт/правится в Max — **2026-06-01**
- [x] UI: индикатор **«New Version»** (мятный, только при апдейте; прячет правую MIXER-линию, выровнен к правому краю кнопки 14; клик → Gumroad продукт `l/control-xl`) — **2026-06-01**
- [x] Подключён `node.script version_check.js @autostart 1` (пинг `/api/version.json` → поле `latest`, semver-сравнение, ре-чек по таймеру 30 мин) — **2026-06-01**
- [x] Routing статусов: up_to_date → скрыт; update_available → «New Version» + клик; ошибка/не-JSON → без ложного индикатора — **2026-06-01**
- [ ] ~~In-device newsletter signup (Buttondown)~~ → deferred Phase 1 (рассылка через Gumroad, см. T11)
- [ ] (опц.) Anonymous heartbeat
- [x] Re-version patch v1.5 → v1.0 (метка убрана, `DEVICE_VERSION=1.0`) — **2026-06-01**
- [x] Тест «обновление доступно»: форс `DEVICE_VERSION=0.9` vs прод `latest 1.0` → «New Version» показался — **2026-06-01**
- [ ] Финальный smoke-test в Live (клик/показ/скрытие подтвердить) + **Freeze** (впечь `version_check.js`) + удалить dev-копию → один файл для рассылки

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
- [ ] *(опц.)* Реальные тайм-коды глав + синк `wiki/youtube-video-description.md` с live-текстом — wiki-черновик пока с `00:00` и расходится с опубликованным заголовком; добивать только если решим, что главы нужны
- → 5 коротких клипов 30 sec для IG/TikTok/Reels — **вынесено в Phase 1** (2026-06-10), см. блок Phase 1 ниже

> **Статус (2026-06-10):** **видео финальное**, играет на лендинге; канал оформлен, описание опубликовано → launch-критерий «демо-видео опубликовано» и B2B-триггер Isotonik закрыты. T9 закрыт к launch; единственный остаток — опциональные тайм-коды глав. Короткие клипы переехали в Phase 1.

### T10 Extended documentation

> **Content must-include (user note 2026-05-25):** Quickstart и user-facing README **обязаны** иметь отдельный шаг «Настройка MIDI-роутинга» со скриншотом: **MIDI From / MIDI To / Channel** на трек с устройством. Не объединять с шагом «положить .amxd на трек» — это два разных действия, второе часто пропускают.

- [x] `dist/Quickstart.md` — **пересоздан 2026-06-02** (потерялся при миграции деплоя из Brain; user-facing, English: requirements / 4-step setup с выделенным MIDI-routing / using / updates «New Version» / troubleshooting; отражает frozen-реальность — bundle = один `.amxd`, без отдельного `solo_follower.js`)
- [x] `dist/Quickstart.pdf` — **2026-06-02** (make-pdf, 389 слов, 112 КБ, 1in поля, без CONFIDENTIAL-футера)
- [x] User-facing `dist/README.md` — **2026-06-10**. Не второй walkthrough (Quickstart уже подробный), а первый файл бандла: ориентация + 3-шаговый short setup (→ Quickstart.pdf за деталями) + reference-карточка (контролы CC47/45/46, encoder banks A/B, Cue mode 15, custom-modes map, MIDI-routing DAW Ch.7, device-last-in-chain) + updates/license/support. English, тон Quickstart, без Solo Follower. LanguageTool чист (флаги = бренд-термины). Источник `raw/XL_Performance.README.md` — внутренний тех-дип, в user-facing не тащил.

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
- [x] **Зипы пересобраны (m4l-master, 2026-06-10):** оба `Fadercraft Control XL v1.0 - Demo/Starter.zip`. Структура: `<Проект>/` + `custom-modes/` (15, на верхнем уровне бандла — канон, дубль из-внутри-проекта убран) + `Quickstart.pdf` + `README.md`. Проверено: девайс `Control XL.amxd` (0 вхождений старого имени), `15.syx`=0x6e, оба `.als` Session/Clip, без macOS-мусора. Demo **191.7 МБ** (вырос из-за свежих recorded-стемов 32-bit float ×4мин в Demo-сете от 08.06), Starter 0.2 МБ. **Продакт-решение 2026-06-10: вес 191 МБ принят как есть, чистку сэмплов НЕ делаем, двигаемся дальше.** Бэкапы старых зипов в `raw/archive/` (метка `…031209`).
- [x] **Перезалиты новые зипы на Gumroad — 2026-06-10** (пользователь): старые Demo/Starter в product Content заменены на пересобранные (custom-modes/, Control XL.amxd, README, Session view). Дальше — re-smoke скачивания в рамках T13 (старый test-purchase 03.06 проверял прежние зипы).
- [ ] *(опц., non-blocker)* `Router.als` в обоих бандлах сохранён в Arrangement view — для единообразия можно пересохранить в Session (вспомогательный rack-сет, покупатель его обычно не открывает).
- [x] **Загружено в Gumroad product Content** — **2026-06-03**: оба zip залиты, качаются со страницы покупки (Starter/Demo, описания Demo-vs-Starter вынесены в Description файлов, над сгибом; install-гайд ниже). Подтверждено test-purchase'ом.
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
- [x] **Test purchase smoke-test — пройден 2026-06-03** (creator test-mode purchase, не списано): sale-notification (seller) + receipt-письмо (buyer) + invoice PDF + Content/Library страница + download обоих zip + файлы открываются ✅. **Баг (закрыт 2026-06-03):** в receipt-письме Gumroad был старый Discord-инвайт `discord.gg/dAt2JGZps7` → исправлен на `EBsdgst3jU` пользователем на Gumroad; Quickstart чист (инвайт там не встречается). **Ещё не пройдено:** полноценный install по Quickstart в Live. Прим.: license-активация в **сам девайс не встроена** — проверка ключа живёт на web-стороне (`verify-license.js`) / в Gumroad library. In-device license — отдельная таска, проектируется (см. блок «In-device license activation» ниже)
- [ ] Tag `v1.0` в git
- [ ] PR review всех веток в main

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
- [ ] Первый пост в `#announcements`: «v1.0 launched» — синхронно с T13 finish

**Follow-ups (не блокеры Phase 0, всплывают по мере готовности соседних треков):**

- Quickstart Support-секцию с линком на Discord — встроить при сборке `dist/Quickstart.md`/PDF (T10)
- Gumroad product description: добавить блок «Community: discord.gg/EBsdgst3jU» на странице `fadercraft.gumroad.com/l/xl-performance` (ручная правка через Gumroad UI)
- Banner 960×540 для Discord-сервера (`app/public/discord-banner.png`) — спека в [[discord-server-setup]]

**Deferred → Phase 1** (когда появятся триггеры):

- Vanity URL `discord.gg/fadercraft` — триггер: 14 активных бустеров или готовность платить ~$70/мес самому
- Auto-role `@Verified Owner` через Gumroad webhook + Discord bot — триггер: ≥10–20 продаж, ручное присвоение начинает занимать время
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
- [ ] **5 коротких клипов 30 sec для IG/TikTok/Reels** — нарезка из основного демо (НЕ новая съёмка), вертикаль 9:16, captions читаемы без звука, нижняя треть чистая от транспорта Live; точки реза = feature-секции в [[demo-video-script]] (pages / banks / jump / native modes + общий тизер); класть в `dist/social-clips/`. Перенесено из T9 2026-06-10.
- [ ] Listing на **maxforlive.com** (бесплатно, обязательно)
- [ ] Listing на **KVR Audio**
- [ ] Reddit posts: r/ableton, r/abletonlive
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

## Связанные страницы

- [[Novation XL]] — основной хаб проекта
- [[index]] — flat TOC
- [[log]] — журнал операций над wiki
