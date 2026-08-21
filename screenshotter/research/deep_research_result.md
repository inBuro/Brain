# Deep Research (Gemini) — рынок macOS-утилит оптимизации скриншотов для AI-чатов и IDE-агентов

> Прогнано в Gemini Deep Research по промпту `deep_research_prompt.md`. Ссылки — оригинальные
> источники модели, см. «Works cited» в конце.

## 1. Абсорбция нативными функциями вендоров

За 12 месяцев ключевые AI/IDE-вендоры интенсивно встраивают захват и обработку скриншотов прямо
в свои десктопные клиенты, снижая ценность сторонних утилит базового захвата.

- **Anthropic (Claude Desktop)** — март 2026, функция **Quick Entry** (двойной Option): выделение
  области/окна и мгновенное прикрепление к диалогу. Claude Computer Use / Cowork нативно
  масштабирует скриншоты под целевое разрешение (например, 1024×768). Статус абсорбции: **высокий**.
- **OpenAI (ChatGPT macOS)** — меню-бар клиент, глобальные хоткеи, Cmd+Cmd для Codex/ChatGPT;
  серверное разбиение на тайлы и масштабирование. Статус: **высокий**.
- **Windsurf / Cursor** — нативная мультимодальная вставка, drag-and-drop, но без встроенной
  «токеномики» (клиентской оптимизации под контекст). Статус: **средний**.
- **Claude Code (CLI)** — автоматически читает локальные файлы/скриншоты, но **не имеет** встроенной
  оптимизации — требует предварительного сжатия или MCP. Статус: **низкий**.

Вывод: базовый «сделать скриншот → вставить в чат» закрывается платформами. Незанятая ниша —
**клиентская оптимизация токенов и калибровка разрешения перед отправкой в CLI-агенты**
(Claude Code, RooCode), так как вендоры оптимизируют трение ввода, а не экономию контекста.

## 2. Формулировка проблемы пользователями

Reddit (r/ClaudeAI, r/cursor, r/ChatGPT, r/MacApps) формулирует боль через деньги и деградацию
сессии, а не неудобство самого захвата:

1. **Token burn / token drain / context bloat** — Retina-скриншоты без калибровки быстро сжигают
   контекстное окно («screenshots eating up token limit», «context rot»).
2. **Session died / context limit hit / forced new session** — принудительный обрыв длинной сессии
   отладки с потерей истории размышлений модели.
3. **Click misalignment / coordinate shift** — при Computer Use/Cursor Agent серверное сжатие
   искажает пиксельные координаты → модель промахивается по элементам («model clicked wrong
   element»).

Прямые ошибки («image too large», HTTP 413) — в основном у CLI без клиентской подготовки.
В массовом сегменте проблема — скрытый фактор, а не явная ошибка. **Боль массовая среди
профессиональных разработчиков на CLI-инструментах.**

## 3. Динамика конкурентов за 12 месяцев

Рынок разделился на классические Mac-утилиты общего назначения и утилиты второго поколения,
интегрированные с AI-агентами.

| Продукт | Цена | Специализация | Динамика (12 мес) |
|---|---|---|---|
| LazyScreenshots | $29 разовая | Вставка в один клик, burst-режим | Стагнация — вытесняется MCP-инструментами |
| **Screentack** *(новый)* | $29 разовая | MCP-инструменты (12 автономных для агента), spatial manifest | Активный рост в агентной разработке |
| SlimSnap | Бесплатно | Скриншот → JSON (координаты + OCR), ~700 токенов vs 1500–4000 у сырой картинки | Высокий вирусный охват (Product Hunt, GitHub) |
| **pxpipe** *(новый)* | Open-source | Обратная идея: упаковывает громоздкий текстовый контекст в PNG для экономии токенов в Claude Code | Высокий резонанс на GitHub |
| CleanShot X | $29 + $8/мес Cloud Pro | Полнофункциональный редактор | Устойчивое лидерство в общем сегменте, но без AI-токеномики |
| Shottr | Free / $8–$12 | Скорость, лёгкий вес | Стабильное присутствие |

Простые утилиты авто-вставки (LazyScreenshots) теряют актуальность под давлением нативных функций
платформ **и** новых MCP-нативных конкурентов (Screentack). Тренд — переход изображения в
векторные/JSON-данные или MCP-серверы для автономных агентов.

## 4. Незакрытые запросы фич

Запросы аудитории сместились от визуальной разметки к управлению сессионной токеномикой:

1. **Адаптивная эскалация сжатия сессии** — динамическое увеличение компрессии по мере роста
   контекста текущей сессии.
2. **Оверлей стоимости токенов перед отправкой** — «этот снимок займёт 1250 токенов в Sonnet /
   765 в GPT-4o».
3. **Прямое взаимодействие через MCP** — агент сам запрашивает скриншот/область без участия
   человека в цепочке «захват → вставка».
4. **Нормализация координат для Computer Use** — фиксированные разрешения (1024×768 / 1280×720)
   с коррекцией пропорций, чтобы не промахивался курсор.
5. **Локальная деперсонализация (PII)** — автообнаружение и пикселизация ключей/токенов/личных
   данных через локальный OCR перед отправкой.

**Фиксированная разовая оптимизация (2000px + JPEG q90) без учёта состояния сессии и без MCP
перестаёт восприниматься как достаточная ценность для покупки отдельного софта.**

## 5. Эффективность ценовых моделей узких утилит

- One-time purchase — единственная воспринимаемая модель для узкой локальной утилиты; попытки
  подписки на мелкий софт вызывают негатив на Reddit/MacApps.
- Потолок готовности платить за утилиту без облачного бэкенда — **$15–$20**.
- Аудитория легко уходит на open-source/самодельные решения (`sips`, ImageMagick, лёгкий
  Cloudflare Worker), если функционал воспроизводим коротким скриптом.
- Удержание падает быстро без глубокой интеграции (плагин IDE, MCP-сервер) — пользователь
  возвращается к системным хоткеям, если сторонний софт требует лишних шагов.
- Устойчивые продажи в категории $20 требуют устранения барьера, который **нельзя** закрыть
  коротким bash-скриптом.

## 6. Технический механизм и архитектурные лимиты платформ

| Платформа | Жёсткий лимит файла | Расчёт vision-токенов | Порог серверного масштабирования | Риск без ресайза |
|---|---|---|---|---|
| Anthropic Claude 3.5/3.7 | 32 МБ/запрос (413 при превышении) | Попиксельный (~1568 токенов на макс. изображение) | ~1.15 МП (≈1092×1092px), сервер сам масштабирует | Сдвиг координат кликов + быстрое выгорание контекста |
| OpenAI GPT-4o | 20 МБ через API/Desktop | 85 базовых + тайлы 512px × 170 токенов | Короткая сторона приводится к 768px | Переплата за лишние тайлы |
| Claude Code (CLI) | Лимиты буфера терминала | Изображения копятся в общем контексте CLI | Отсутствует на клиенте | Преждевременное исчерпание лимита сессии |

Вывод по открытому вопросу брифа: переполняется **контекстное окно модели** (токены на пиксели),
а не отдельный технический лимит интерфейса — но в Computer Use есть **второй, не описанный в
брифе эффект**: серверное авто-масштабирование высокого разрешения искажает пиксельные координаты
и модель промахивается кликами на 20–40px. Локальное приведение к 1024×768/1280×720 решает и
расход токенов, и точность кликов разом.

## 7. Категория как тренд

«AI-скриншот-утилита» **не оформилась в устойчивую категорию** — это сольные side-проекты и
микро-утилиты. Внимание разработчиков смещается с GUI-обрезки изображений на протокол **MCP**:
инструменты только интерфейсного захвата и ручной вставки быстро теряют актуальность. Развитие —
в сторону агентов, самостоятельно анализирующих экран через фоновые MCP-серверы.

## Общий вывод (Gemini)

> Собранная база **существенно ослабляет** обоснованность выхода на рынок с продуктом Screenshotter
> в текущей концепции (платная утилита $20, фиксированный функционал: de-retinization + clamp
> 2000px + JPEG q90).

**Аргументы против выхода в текущем формате:**

1. Платформы (Anthropic, OpenAI) абсорбируют базовый воркфлоу «сделать и вставить скриншот»
   нативными средствами (Quick Entry, хоткеи) — сторонний софт для этого больше не нужен.
2. Статичная оптимизация (2000px + JPEG) устарела: продукты следующего поколения переводят
   скриншот в JSON (SlimSnap) или дают MCP-доступ агенту (Screentack), полностью убирая человека
   из цепочки.
3. Фиксированный ресайзер легко воспроизводится бесплатным локальным скриптом; в категории $20
   пользователи ждут либо полноценный редактор уровня CleanShot X, либо развитую AI-контекст-экосистему.

**Стратегические рекомендации Gemini:**

- **Вариант A (рекомендован моделью): open-source.** Опубликовать на GitHub ради репутационного
  капитала, без нагрузки поддержки/маркетинга платного продукта с низким удержанием.
- **Вариант B: глубокий пивот перед платным запуском** — сместить позиционирование с
  «menu-bar скриншотер» на «менеджер контекста и точности для AI-агентов»:
  - MCP-сервер, чтобы Claude Code/Cursor сами запрашивали скриншот;
  - адаптивное сжатие, растущее вместе с заполнением контекста сессии;
  - нормализация разрешений (1024×768 / 1280×720) против промахов курсора в Computer Use;
  - индикатор точной стоимости снимка в токенах перед отправкой.

## Works cited

1. [Use quick entry with Claude Desktop on Mac — Anthropic Help Center](https://support.claude.com/en/articles/12626668-use-quick-entry-with-claude-desktop-on-mac)
2. [How to Run Anthropic Computer Use Locally (2026 Guide)](https://www.cloudvyn.com/blog/anthropic-computer-use-locally-guide-2026)
3. [ChatGPT & Codex changelog](https://learn.chatgpt.com/docs/changelog)
4. [How to Take a Screenshot on Mac (2026) — LazyScreenshots](https://www.lazyscreenshots.com/guides/how-to-screenshot-on-mac/)
5. [Claude Computer Use: Complete Setup and Developer Guide — Fastio](https://fast.io/resources/claude-computer-use-guide/)
6. [ChatGPT macOS app release notes — OpenAI Help Center](https://help.openai.com/en/articles/9703738-chatgpt-macos-app-release-notes)
7. [Windsurf AI: Complete Guide — igmGuru](https://www.igmguru.com/blog/windsurf-ai)
8. [Changelog (Pre-release) — Windsurf Plugins](https://docs.devin.ai/windsurf/plugins/changelog-next)
9. [OpenAI API Pricing Calculator — Spur](https://www.spurnow.com/en/tools/openai-chatgpt-api-pricing-calculator)
10. [Image/Vision Processing capability · Issue #95 — GitHub](https://github.com/pydantic/pydantic-ai-harness/issues/95)
11. [Playwright screenshots quickly filling up context — r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1ojwtop/playwright_screenshots_quickly_filling_up_context/)
12. [Confused About Context Size in Cursor — r/cursor](https://www.reddit.com/r/cursor/comments/1magtu7/confused_about_context_size_in_cursor_shows_200k/)
13. [My side project crossed thousands of users this week — r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1uqqn92/my_side_project_crossed_thousands_of_users_this/)
14. [I saved 10M tokens (89%) on my Claude Code sessions with a CLI — r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1r2tt7q/i_saved_10m_tokens_89_on_my_claude_code_sessions/)
15. [Context windows — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)
16. [Essential Anthropic Official Best Practices for Using Computer Use](https://note.com/michael_pwe/n/n908fed98bbd8?hl=en)
17. [Claude AI Context Window, Token Limits, and Memory — Data Studios](https://www.datastudios.org/post/claude-ai-context-window-token-limits-and-memory-operational-boundaries-and-long-context-behavior)
18. [GitHub - teamchong/pxpipe: cut Claude Code token usage](https://github.com/teamchong/pxpipe)
19. [LazyScreenshots — Best Mac Screenshot Tool for AI Coding](https://www.lazyscreenshots.com/)
20. [LazyScreenshots vs Screentack for AI Coding](https://screentack.com/blog/lazyscreenshots-vs-screentack)
21. [SlimSnap: Your AI doesn't know which button you mean — Product Hunt](https://www.producthunt.com/products/slimsnap)
22. [Best screenshot tools for AI coding agents (2026) — SlimSnap](https://slimsnap.ai/blog/best-screenshot-tools-for-ai-coding)
23. [LazyScreenshots vs macOS Built-in Screenshots](https://www.lazyscreenshots.com/vs-macos/)
24. [Enable Autonomous Image Analysis for Agents — Cursor Forum](https://forum.cursor.com/t/enable-autonomous-image-analysis-for-agents/53415)
25. [I'm debating between Xnapper and CleanShotX — r/macapps](https://www.reddit.com/r/macapps/comments/1e4dr86/im_debating_between_xnapper_and_cleanshotx_help/)
26. [What are the best free Mac apps to capture — r/MacOS](https://www.reddit.com/r/MacOS/comments/1ecxke9/what_are_the_best_free_mac_apps_to_capture_a/)
27. [FEATURE] Enhance Azure OpenAI Image Token Counting — GitHub](https://github.com/langchain4j/langchain4j/issues/4519)
28. [macOS products for teams that manage product roadmaps — Shipyard](https://shipyardhq.dev/use-cases/manage-product-roadmaps/platforms/mac)
29. [Image Recognition Startups — BetaList](https://betalist.com/browse/ai/image-recognition)
30. [Any better screenshot tools? — r/MacOS](https://www.reddit.com/r/MacOS/comments/19ctxbs/any_better_screenshot_tools/)
31. [SlimSnap connector — MCP Servers · LobeHub](https://lobehub.com/it/mcp/bickov-slimsnap-mcp)
