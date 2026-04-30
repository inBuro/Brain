# Wiki Operations Log

**Summary**: Append-only журнал операций над wiki — ингесты, создание страниц, лит, ревью.
**Sources**: операционная страница (источника нет)
**Last updated**: 2026-04-29

---

This file is **append-only**. Never modify previous entries — only add new ones at the bottom.

Каждая запись описывает один логический акт работы над wiki: ингест источника, создание страниц, ревью, лит и т.п.

---

## 2026-04-29 — Initial strategy ingest (v3)

**Operation:** First wiki population. Создан каркас и заведена главная стратегическая страница.

**Created:**
- `raw/strategy-v3.md` — канонический документ торговой стратегии v3 как первоисточник
- `wiki/trading-strategy.md` — главная сводная страница со ссылками на планируемые концептуальные страницы
- `wiki/index.md` — обновлён, теперь содержит запись про trading-strategy и список planned-страниц
- `wiki/log.md` — этот файл

**Source:** живые торговые сессии 2026-04-26..29 + согласование стратегии в чате. Полные транскрипты не сохранены — куратор (Кирилл) подтвердил content стратегии устно, документ собран Claude по ходу обсуждения.

**Pending concept pages** (упомянуты в wiki-links на главной странице, не созданы):
- trader-profile, entry-rules-long, entry-rules-short, position-sizing, stop-loss-rules, take-profit-rules, timeframes, indicators, bybit-data, bybit-chart-markers, daily-routine, weekly-review, psychology-rules, commission-management

**Plan:** концептуальные страницы наполняются постепенно. Каждое еженедельное ревью стратегии — повод раскрыть одну-две темы подробно (например, после первой реальной серии шорт-сделок развернуть `entry-rules-short` с примерами).

**Next:** дождаться первой недели торговли по v3, на ревью обсудить статистику и решить какие концепты раскрывать первыми (предположительно `entry-rules-long` + `position-sizing`, как самые часто используемые).

---

## 2026-04-29 — Audit fixes + first concept page

**Operation:** мелкие правки по результатам аудита wiki + создание первого концепта.

**Updated:**
- `wiki/index.md` — добавлено поле `Sources` в шапку для соответствия page format (стоит "операционная страница (источника нет)")
- `wiki/log.md` — добавлена шапка с `Summary / Sources / Last updated`
- `wiki/trading-strategy.md` — добавлены три inline-цитаты `(source: strategy-v3.md)` к ключевым числовым утверждениям (депозит/плечо, минимальное движение 4-5%, целевые показатели win rate)

**Created:**
- `wiki/entry-rules-long.md` — первый концепт: условия входа в long. Структура: главный вопрос (потенциал 4-7%) → 5 базовых условий → бонусы → запрещающие условия → порядок проверки → next steps. Источник — `raw/strategy-v3.md`, раздел "Правила входа в LONG", расширен пояснениями по каждому условию.

**Index:** `entry-rules-long` перенесён из секции "Концепты (planned)" в активные "Концепты".

**Reasoning по выбору первого концепта:** в предыдущей log-записи было предсказано что `entry-rules-long` — самый часто используемый концепт. Решили не ждать первой недели торговли, а сразу развернуть его, чтобы при первом же setup'е не возвращаться к raw-документу. Остальные концепты по-прежнему раскрываем по мере необходимости — следующий кандидат `position-sizing` (нужен сразу после `entry-rules-long` в потоке "решил войти → считаю размер").

**Next:** при следующем касании wiki — либо `entry-rules-short` (зеркальная пара), либо `position-sizing` (следующий шаг в operational flow). Решим по ситуации.

## 2026-04-29 — связь `raw/strategy-v3` ↔ trading-strategy (граф)

Канонический документ стратегии теперь явно залинкован как wiki-link, а не упоминается plain text'ом — чтобы быть узлом в Obsidian Graph View рядом с `trading-strategy` и `entry-rules-long`.

- `wiki/trading-strategy.md`: в строке `**Sources**` `strategy-v3.md` → `[[raw/strategy-v3]]`; в разделе «История версий» `\`raw/strategy-v3.md\`` → `[[raw/strategy-v3]]`. Inline-цитаты `(source: strategy-v3.md)` оставлены plain text по конвенции CLAUDE.md.
- `wiki/entry-rules-long.md`: в строке `**Sources**` `strategy-v3.md` → `[[raw/strategy-v3]]`.
- `wiki/index.md`: добавлена секция `## Sources` со ссылкой `[[raw/strategy-v3]]` и описанием — теперь хаб тоже ссылается на канонический документ.

В графе `raw/strategy-v3` — узел источника со связями к `trading-strategy`, `entry-rules-long` и `wiki/index`. Аналог пути, который сделан в Novation для `raw/XL_Performance.README` и `solo_follower.js`.

---

## 2026-04-29 — Lint fix: wiki-link path resolution

**Issue:** Wiki-links вида `[[raw/strategy-v3]]` не резолвились в Obsidian. Vault root = `/Users/Kirill/Brain` (подтверждено наличием `.obsidian/` именно там), значит ссылка искала `/Users/Kirill/Brain/raw/strategy-v3.md`, а файл лежит на `/Users/Kirill/Brain/Trading/raw/strategy-v3.md`. Граф был сломан.

**Fix:** заменил `[[raw/strategy-v3]]` → `[[strategy-v3]]` (короткая форма, работает потому что имя `strategy-v3` уникально в vault'е — проверено `find` по всему `/Users/Kirill/Brain`).

**Updated:**
- `wiki/index.md` — секция Sources
- `wiki/trading-strategy.md` — поле Sources в шапке + раздел «История версий»
- `wiki/entry-rules-long.md` — поле Sources в шапке

**Why this form:** `[[strategy-v3]]` короче чем `[[Trading/raw/strategy-v3]]` и устойчивее к перемещению файла в другую подпапку. Если в будущем появится другой `strategy-v3.md` где-то в vault'е — Obsidian заругается на коллизию имён, и тогда переключимся на полный путь.

---

## 2026-04-29 — Правило проверки финансовых новостей в entry-rules

**Operation:** добавлено новое правило в `entry-rules-long`: перед входом обязательно заглядывать в Bybit Feed → News (или другую ленту по ETH). Изменение возникло из живой торговой сессии — куратор попросил добавить это в правила и сразу применить к текущему рынку.

**Updated:**
- `wiki/entry-rules-long.md`:
  - Шапка `Summary` — добавлено упоминание новостного чека в пайплайне.
  - Новый раздел "Финансовые новости (контекст-чек)" — что искать (критические блокеры, sell-pressure сигналы, macro-headlines, мягкий bullish/bearish фон), правило выходного контекста (mixed-bearish или headline впереди → урезанный размер или skip).
  - В "Запрещающих условиях" добавлен 5-й блокер — критические новости (хак core-протокола / L2, регуляторное действие, macro-headline в ближайшие 1-2 часа).
  - В "Порядке проверки" — новостной чек теперь шаг 2, между главным вопросом и запрещающими условиями.
- `wiki/index.md`:
  - В секции "Концепты (planned)" добавлена страница `news-check` — типология финансовых новостей.
  - Поле `Last updated` обновлено пометкой про правило новостей.

**Зеркало:** правило симметрично применяется к short. Когда будет создан `entry-rules-short`, новостной раздел туда копируется с инвертированными бонусами (bullish-новости → аргумент против шорта).

**Почему отдельной страницей `news-check` пока не делаем:** правило только что введено, реальной типологии новостей по реакции рынка ещё нет. Соберём 2-3 случая когда новость явно повлияла на сделку (или должна была) — тогда развернём на отдельной странице. Пока живёт inline в `entry-rules-long`.

**Применение к текущему рынку (29.04.2026, 07:49 UTC):** новостной фон mixed-bearish (6 bearish / 3 bullish / 1 neutral за последние 2 часа). Sell-pressure сигналы — убытки market-makers (Hyperliquid/Wintermute/Auros) и transfer 3,418 ETH на Binance с фиксацией прибыли. Macro — рынок ждёт оценку ФРС по инфляции. Критических блокеров нет, но фон подтвердил решение "no setup, ждём". Записано как живой пример работы правила.

## 2026-04-29 — Baseline backtest одиночных сигналов strategy-v3

**Operation:** установлены skill'ы `risk-management` (0xhubed/agent-trading-arena), `market-news-analyst` (tradermonty), `backtesting-trading-strategies` (jeremylongshore). Прогнан Variant A валидации [[strategy-v3]] — sanity-check одиночных индикаторных сигналов на дневках ETH-USD за 2 года ($2,200 капитал).

**Результаты (vs benchmark Buy&Hold = −28.4%):**
- RSI reversal (14, 40/65): −67.8%, win rate 51.5%, profit factor 0.73
- Bollinger Bands (20, 2): −54.2%, win rate 52.3%, profit factor 0.69
- MACD (12, 26, 9): −62.8%, win rate 28.6%, profit factor 0.66
- EMA 50/100 crossover: +32.8% (но всего 1 сделка за 2 года = фактически buy-and-hold)

**Вывод:** одиночные индикаторы из strategy-v3 на дневках ETH **edge'а не имеют**. Это не повод менять стратегию — это аргумент в пользу её дисциплины: правило «3 из 5 базовых условий» + funding/OI/whale ratio как фильтры — критически нужны, без них ТА на ETH в 2024-2026 = убыток.

**Created:**
- `wiki/strategy-v3-baseline-backtest.md` — полный отчёт с интерпретацией и ограничениями теста.
- `wiki/index.md` — добавлена ссылка в раздел «Стратегия».

**Технические артефакты:**
- venv `.venv/` (pandas, numpy, yfinance, matplotlib) для изоляции зависимостей.
- Отчёты и PNG в `.agents/skills/backtesting-trading-strategies/reports/`.

**Что НЕ протестировано (ограничения skill'а):**
- Таймфрейм 4h/1h (skill хардкодит 1d).
- Funding / OI / whale ratio (yfinance их не отдаёт).
- Combo-логика «3 из 5» и multi-TP exits.
- Запрещающие условия (новостной блокер, BTC-корреляция).

**Дальнейшие опции:** Variant B — кастомная python-стратегия на OHLC (~50% правил). Variant C — полноценный бэктест с Bybit API (perp + funding + OI). Решение по B/C отложено.

## 2026-04-29 — Strategy v4: интеграция risk-management и news-analyst skill'ов

**Operation:** создана новая версия стратегии [[strategy-v4]] на основе анализа двух установленных skill'ов (`risk-management` от 0xhubed/agent-trading-arena, `market-news-analyst` от tradermonty/claude-trading-skills) и [[strategy-v3-baseline-backtest]]. v3 не модифицирована (immutable per CLAUDE.md), сохранена как исторический референс.

**Что добавлено в v4 (4 изменения, обсуждены и approved by curator):**

1. **Multi-TF Alignment как обязательный pre-check** — новый раздел перед условиями входа. Требует согласования 4h + 1h + 15m в направлении сделки до оценки 5 базовых условий. Источник: risk-management паттерн «Multi-timeframe bearish alignment» (success rate 88%, 383 samples, 99% confidence).

2. **Запрещающие условия пополнены 2 пунктами** (зеркально для long/short):
   - Mixed-market momentum trade (1D MACD без тренда + momentum-вход)
   - Контр-тренд в медвежьем/бычьем рынке (1D MACD против + BTC EMA200 против)
   Источник: «Avoid momentum-following in mixed markets» (75%/33), «Contrarian LONG entries in bearish markets» (0-30% success).

3. **Новый раздел «Финансовые новости» с Impact Score формулой**: `(Price Impact × Breadth) × Forward Modifier` с адаптированными под ETH порогами (Severe ≥5%, Major 3-5%, Moderate 1-3%, Minor <1%). Пороги решений: ≥20 = skip, 10-20 = размер ÷2, <10 = информационно. Запрещающие новости (любой Impact): хак core-протокола / L2, регдействие, macro-headline в ближайшие 1-2 часа. Источник: методология импакт-скоринга из market-news-analyst, адаптирована под крипту.

4. **Weekly review — leverage outcome accounting**: отдельный учёт P&L по сделкам где 5x плечо реально использовалось vs не использовалось. Триггер: тревожный сигнал из risk-management «High leverage 4x-5x with optimal risk = 0% success / 132 samples / 50% confidence». Решение: не менять плечо (низкая confidence), но измерять. После 30+ наблюдений — пересмотр.

**Что НЕ переносилось из skill'ов (намеренно отказались):**
- Конкретные trade-frequency лимиты (high-freq режимы, не релевантны)
- 6-step workflow news-analyst (нет бюджета времени, 30-40 мин/день)
- Pattern comparison (consistent/amplified/dampened/inverse) — отвергнут куратором как добавляющий когнитивную нагрузку

**Что НЕ менялось vs v3:**
- Размер позиции, риск $25, R:R 1:3-1:5, плечо 5x (под наблюдением)
- Основные индикаторы, multi-TP конфигурация
- Главный принцип «сделка должна работать сама»

**Created/Updated:**
- `raw/strategy-v4.md` — новая канонiческая версия стратегии (immutable после создания)
- `wiki/index.md` — v4 помечена как АКТУАЛЬНАЯ, v3 — как исторический референс

**Follow-up (не сделано в этой сессии):**
- `wiki/trading-strategy.md` — обновить чтобы указывала на v4
- `wiki/entry-rules-long.md` — синхронизировать с v4 (новостной раздел теперь скоринговый, добавить multi-TF pre-check, добавить 2 запрещающих)
- `wiki/entry-rules-short.md` — создать (зеркальная страница)
- Концептуальные страницы планируются: `multi-tf-alignment`, `news-impact-score`, `leverage-accounting`

---

## 2026-04-29 — Wiki sync со strategy-v4 + создание entry-rules-short

**Operation:** закрыты три из четырёх follow-up'ов предыдущей записи. Wiki полностью переведена на [[strategy-v4]] как актуальный источник, концептуальные страницы для новых разделов остаются planned.

**Updated:**
- `wiki/trading-strategy.md` — Summary/Sources/Last updated переключены на v4. Все inline-цитаты `(source: strategy-v3.md)` заменены на `strategy-v4.md` (числовые параметры в v4 не менялись, цитаты остаются точными). Добавлен новый раздел «Pre-check перед каждым входом» с кратким описанием multi-TF alignment и news Impact Score (детали — в entry-rules-* страницах). В разделе «Целевые показатели» добавлен абзац про weekly leverage outcome accounting. История версий пополнена записью про v4.
- `wiki/entry-rules-long.md` — синхронизирована с v4: старый раздел «Финансовые новости» (категории) заменён на «Pre-check 2 — News Impact Score» (формула + три шкалы + пороги решений). Добавлен новый раздел «Pre-check 1 — Multi-TF Alignment» перед базовыми условиями. В список запрещающих условий добавлены 2 пункта: mixed-market momentum trade, контр-тренд в медвежьем рынке (1D MACD <0 + BTC <EMA200). Порядок проверки переписан под 6 шагов вместо 5. Все источники переключены с strategy-v3.md на strategy-v4.md.
- `wiki/index.md` — `entry-rules-short` поднята из «planned» в активные «Концепты» с описанием. В planned добавлены три новых концепта: `multi-tf-alignment`, `news-impact-score`, `leverage-accounting`. Старый planned `news-check` оставлен с пометкой что он частично поглощён `news-impact-score` — решим про объединение позже. Last updated обновлён.

**Created:**
- `wiki/entry-rules-short.md` — новая страница, зеркало entry-rules-long. Структура идентична: главный вопрос (4-7% вниз) → multi-TF alignment в сторону шорта → news Impact Score (зеркальная трактовка bullish/bearish) → 5 базовых условий (RSI >65/>60, whale ratio <0.8 или снижается, и т.д.) → 6 бонусных подтверждений → 7 запрещающих (включая контр-тренд в бычьем рынке: 1D MACD >0 + BTC >EMA200 со свежим пробоем). Добавлен короткий раздел «Особенности шортов на ETH» с тремя наблюдениями для будущей раскрутки (шорт-сквизы чаще, funding ≠ setup, тени vs закрытие выше high) — пока без статистики, заметки для будущих сделок.

**Решения по содержанию entry-rules-short:**
- Шкалы Impact Score не дублируются в short — отсылка к entry-rules-long чтобы не было двух источников правды. Если шкалы поменяются, правится только одно место.
- Запрещающая новость про хак core-протокола ETH/L2 включена и в short, несмотря на bearish-нарратив. Аргумент: в день хака волатильность непредсказуема в обе стороны, шорт тоже не открываем.
- Multi-TF alignment паттерн в risk-management калиброван именно на bearish-сценариях (88% / 383 samples) — для шорта помечено как «особенно весом».
- Особенности шортов вынесены отдельным разделом, а не растворены в правилах — чтобы при еженедельном ревью видеть, какие из этих наблюдений подтвердились живыми сделками.

**Что НЕ сделано (остаётся в follow-up):**
- Концептуальные страницы `multi-tf-alignment`, `news-impact-score`, `leverage-accounting` — пока живут inline в entry-rules-* и trading-strategy. Раскрутим когда появится живой материал (первая сделка по multi-TF alignment, первый Impact Score реальной новости, первые ≥10 сделок для leverage accounting).
- Решение про `news-check` vs `news-impact-score` — оставлены оба planned, объединение или замена будет когда писать концепт.
- Inline-цитаты `(source: strategy-v3.md)` в trading-strategy.md заменены на v4. Если на v4 действительно появятся новые числовые параметры (которых нет в v3), нужно будет добавить новые цитаты — но в текущем v4 числа не менялись.

**Граф (ожидаемое состояние):** [[strategy-v4]] становится новым центральным источником, [[strategy-v3]] и [[strategy-v3-baseline-backtest]] — связанные исторические узлы. [[trading-strategy]], [[entry-rules-long]], [[entry-rules-short]] — три страницы первого порядка, ссылающиеся на [[strategy-v4]]. [[entry-rules-long]] ↔ [[entry-rules-short]] — взаимная ссылка как зеркальные документы.

**Next:** дождаться первой реальной сделки по v4, на ревью обсудить — какой из новых pre-check'ов реально сработал, какой оказался шумом, какие настройки шкал (особенно пороги Impact Score) требуют калибровки. Концепт-страницы раскрываем по живому материалу.
