---
name: cv-current-state
description: Текущее состояние CV и портфолио Кирилла на 2026-08-14 — форматы, хранение, критические пробелы, аудит
metadata:
  type: project
---

## CV

Существует как две живые Notion-страницы (RU: "CV Кирилл Буш", EN: "CV Kirill Bush") под родительской страницей "inBuro". Мастер-копия также сохранена в `~/Brain/career/resume/resume.md` (EN, после аудита 2026-08-14).

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

## Финансы поиска работы

Roadmap до первого отклика: `~/Brain/career/applications/roadmap-2026-08-17.md`
Полный аудит: `~/Brain/career/portfolio/audit-2026-08-14.md`
