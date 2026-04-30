# Wiki Index

**Summary**: Точка входа во всю базу знаний Trading. Для каждой страницы — одна строка с описанием.
**Sources**: операционная страница (источника нет)
**Last updated**: 2026-04-29 (синк wiki с [[strategy-v4]]: hub перепаян на v4, [[entry-rules-long]] синхронизирована, создана [[entry-rules-short]])

---

## Стратегия

- [[trading-strategy]] — главная страница системной свинг-стратегии для ETH/USDT (v3)
- [[strategy-v3-baseline-backtest]] — sanity-check одиночных сигналов из v3 на дневках ETH-USD за 2 года (бэктест через `backtesting-trading-strategies` skill)

## Sources

- [[strategy-v4]] — **АКТУАЛЬНАЯ** версия стратегии (2026-04-29). Добавлены multi-TF alignment, запрещающие условия из risk-management skill, news Impact Score, weekly leverage accounting
- [[strategy-v3]] — предыдущая версия стратегии (2026-04-29), сохранена как исторический референс. См. changelog в [[strategy-v4]]

## Концепты

- [[entry-rules-long]] — условия входа в long (главный вопрос → multi-TF pre-check → news Impact Score → 5 базовых + бонусные + 7 запрещающих)
- [[entry-rules-short]] — условия входа в short (зеркальная страница к entry-rules-long)

## Концепты (planned)

Страницы упомянуты в `[[trading-strategy]]` через wiki-links, но ещё не созданы. Раскрываем по одной-две за каждое еженедельное ревью, когда есть повод обсудить тему детально.

- `trader-profile` — профиль трейдера: депозит, плечо, режим работы
- `position-sizing` — формула размера позиции
- `stop-loss-rules` — где ставить SL и когда подтягивать
- `take-profit-rules` — конфигурация трёх TP уровней (30/30/40)
- `timeframes` — назначение таймфреймов (1D / 4h / 1h / 15m / 1m)
- `indicators` — BOLL, EMA, RSI, MACD
- `bybit-data` — раздел Data на Bybit (funding, OI, whale ratio)
- `bybit-chart-markers` — метки B/S на графиках = исполненные ордера, не сигналы
- `multi-tf-alignment` — концепт multi-TF pre-check: что значит «alignment 4h+1h+15m», когда считается выполненным, отсылка к risk-management паттерну
- `news-impact-score` — формула Impact Score, шкалы Price Impact / Breadth / Forward Modifier, пороги решений
- `leverage-accounting` — как вести отдельный учёт P&L по сделкам где 5x плечо реально использовалось vs нет (для weekly review)
- `news-check` — типология финансовых новостей (старый концепт, теперь частично поглощён `news-impact-score`; решим объединять или оставить рядом)
- `daily-routine` — рутина торгового дня
- `weekly-review` — еженедельное ревью стратегии (включая leverage outcome accounting)
- `psychology-rules` — психологические правила и паттерны срывов
- `commission-management` — минимизация комиссий

## Операционные

- [[log]] — журнал операций над wiki (append-only)

## Глоссарий (planned)

Термины которые встречаются в стратегии и заслуживают отдельной страницы для определения и контекста:

- whale ratio
- funding rate
- open interest (OI)
- bollinger bands (BOLL)
- exponential moving average (EMA)
- relative strength index (RSI)
- MACD
- HH / HL / LH / LL (структура свечей)
- R:R (risk-reward ratio)
