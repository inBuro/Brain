---
name: cv-current-state
description: Текущее состояние CV и портфолио Кирилла на 2026-08-14 — форматы, хранение, критические пробелы, аудит
metadata:
  type: project
---

## CV

Существует как две живые Notion-страницы (RU: "CV Кирилл Буш", EN: "CV Kirill Bush") под родительской страницей "inBuro". Мастер-копия также сохранена в `~/Brain/portfolio/resume/resume.md` (EN, после аудита 2026-08-14).

Контент: 8 мест работы 2018–2025 (Service-guru, OTP Bank, Mirafox, Sollers Auto, FinchTrade/MarketGuard, Prom.io/MIDL, Beefy.finance). Опыт 7+ лет → уровень Senior (из CV явно "Senior Product Designer").

Шапка: in-buro.com, LinkedIn (bit.ly-редирект), Telegram, email, Calendly.
Кейсы портфолио: инлайн-ссылки на in-buro.com/works/... встроены в описания опыта.

**ИСПРАВЛЕНО 2026-08-14 вечер:** предыдущая версия этой памяти ошибочно утверждала "нет PDF". На деле PDF полностью автоматизирован — см. [[project_cv_pdf_pipeline]]. `~/Projects/Projects/portfolio/cv/index.html` (EN) и `cv/ru/index.html` (RU) печатаются в `Kirill-Bush-CV-EN.pdf`/`RU.pdf` через `node scripts/generate-cv-pdf.js en|ru` (Playwright, `@media print` в `cv.css`). Оба PDF уже существуют в репозитории. Notion — черновик/контент-источник, НЕ синхронизирован автоматически с этими HTML-страницами — любая правка контента (роль, ссылка, метрика) должна вноситься в Notion И в `cv/index.html`/`cv/ru/index.html` отдельно, потом перегенерировать PDF.

**Реальный gap:** не "нет PDF", а "PDF может быть неактуален после правок контента, если забыли перегенерировать".

## Исправленные ошибки CV (аудит 2026-08-14)

1. ~~OTP Bank ошибочно ссылался на /works/kwork, дублировал Mirafox~~ — **ПЕРЕСМОТРЕНО**: это была ошибка только в EN Notion-странице. RU Notion всё время содержала верную отдельную ссылку OTP Bank → `/works/otp`. Первая правка (удаление ссылки) была неверной, откачена. Кейс реален и найден живым на исходном Webflow-домене (`/works/bank-otp`) — не терялся, просто не попал в хардкоженный список `_mirror-script.py` при миграции. Notion EN+RU и `resume.md` обновлены на финальный slug `/works/bank-otp`; мирроринг страницы в репозиторий + добавление в грид/sitemap/CV-HTML — делегировано frontend-design (см. roadmap).
2. `/works/kwork` (Mirafox) на живом in-buro.com отдаёт SPA-фолбэк, кейса в репозитории нет — не проверено, жив ли аналогично на старом Webflow (стоит проверить тем же способом при случае). Не срочно.
3. Saeco и Bubblebee — по решению пользователя 2026-08-14: скрыть из грида/sitemap (не удалять файлы). Saeco — потому что это иллюстрация не по профилю; Bubblebee — вместо более раннего плана "наполнить контентом", пользователь решил просто убрать из индекса и из CV.

## Портфолио-сайт in-buro.com

Код: `~/Projects/Projects/portfolio`, CF Pages.

9 кейсов на сайте: bubblebee, entangle, f-show, finchguard, finchtrade, lipton, saeco, sollers, starbucks.

**Сильные PD-кейсы (показывать рекрутерам):**
- finchtrade: полный нарратив, personas, USM, IA, A/B, design system, website metrics
- finchguard: 2 таба Design/Research, богатый research раздел
- sollers: структурированный, но без метрик и текста

**Слабые / не-PD кейсы:**
- bubblebee: PD (iOS app), но нет процесса, нет метрик, нет контекста — наиболее неоформленный PD-кейс
- entangle: test assignment, визуально OK, но явно помечен как "test assignment"
- lipton, starbucks: иллюстрационные работы (не PD)
- saeco: иллюстрационный + технический баг (H1 показывает "Starbucks. Promo")
- f-show: промо-сайт, визуально OK, не PD кейс

**Отсутствующие кейсы (есть в CV, нет на сайте):**
- Beefy.finance (текущая роль!) — нет кейса
- Prom.io/MIDL — нет кейса
- Kwork/Mirafox — ссылка /works/kwork битая (SPA-фолбэк)

**Технические баги сайта:**
- saeco/index.html: `<h1>Starbucks. Promo</h1>` вместо "Saeco. Promo"
- sollers/index.html, entangle/index.html: meta description = "Swiss trading platform tailored to your needs" (чужой текст FinchTrade)

## Статус на 2026-08-19 (аудит расхождений)

Старт откликов сдвинут на **2026-08-24**. Актуальный аудит: `~/Brain/portfolio/applications/audit-2026-08-19.md`.

**Критические пробелы на 19.08:**
1. `cv/index.html` и `cv/ru/index.html` → `/works/kwork` → 404 — рекрутер видит битую ссылку из PDF
2. PDF (EN+RU) устарел: от 14.08, HTML правился 19.08 — нужна перегенерация
3. 83 незакоммиченных изменения в репо, включая `works/marketguard/` как untracked
4. `sitemap.xml` на проде: `/works/finchguard/` вместо `/works/marketguard/`; `/works/marketguard/` не проиндексирован
5. `resume.md` → `/works/finchguard` (редирект работает, но нестройно)

**Что НЕ делать до 24.08:** Beefy.finance кейс и Prom.io/MIDL кейс — обоим нужно >1 недели.

**Пробелы в профиле (нужно уточнить у Кирилла):**
- Индустриальный фокус: только crypto/DeFi или шире?
- Зарплатные ожидания: $4500+ — минимум или цель? Форма оплаты?
- Релокация vs remote-only?
- ~~Атрибуция `~/Brain/portfolio/raw/*.png`~~ — **закрыто 19.08:** это материалы MarketGuard/FinchGuard (CJM compliance-персон, LinkedIn-страница FinchGuard, Scorechain), не Beefy и не MIDL. Для Beefy и MIDL визуальных исходников в `~/Brain` нет вообще
- NDA/публичность материалов Beefy.finance
- Статус pipeline на 24.08 (вакансии Playneta + crypto payments из Telegram от 10.08 актуальны?)

## Roadmap-файлы

Роадмап 08-17 (устарел): `~/Brain/portfolio/applications/roadmap-2026-08-17.md`
Аудит 08-14: `~/Brain/portfolio/portfolio/audit-2026-08-14.md`
Аудит 08-19 (актуальный): `~/Brain/portfolio/applications/audit-2026-08-19.md`
