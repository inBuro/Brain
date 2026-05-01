# Wiki Index

**Summary**: Entry point for the entire Trading knowledge base. Each page gets one descriptive line.
**Sources**: operational page (no upstream source)
**Last updated**: 2026-04-30 (v5 added: range-trade-rules, trading-journal-v5; sources reordered)

---

## Strategy

- [[trading-strategy]] — main page for the systematic ETH/USDT swing strategy (v3)
- [[strategy-v3-baseline-backtest]] — sanity check of v3's individual signals on 2 years of daily ETH-USD data (backtest via the `backtesting-trading-strategies` skill)

## Sources

- [[strategy-v5]] — **CURRENT** strategy version (2026-04-30). Lowered potential and R:R thresholds, added RANGE-trade subcategory, graduated position sizing ($30 → $40), scheduled remote agent for passive monitoring + email alerts
- [[strategy-v4]] — previous strategy version (2026-04-29), kept as historical reference. Adds multi-TF alignment, prohibitive conditions from the `risk-management` skill, news Impact Score, weekly leverage accounting
- [[strategy-v3]] — strategy version v3 (2026-04-29), older historical reference. See changelog in [[strategy-v4]]

## Concepts

- [[entry-rules-long]] — long entry conditions (main question → multi-TF pre-check → news Impact Score → 5 base conditions + bonuses + 7 prohibitive)
- [[entry-rules-short]] — short entry conditions (mirror page to entry-rules-long)
- [[range-trade-rules]] — new in v5: range mean-reversion subcategory (4h MACD ≈ 0 + ATR contraction + clear horizontal range)
- [[pending-orders]] — added 2026-05-01 as v5 supplement: rules for suggesting concrete pending limit orders when a setup is probable but not yet triggered
- [[trading-journal-v5]] — append-only journal of all market checks (manual + scheduled routine), v5 onward

## Concepts (planned)

These pages are referenced from `[[trading-strategy]]` via wiki-links but not yet created. We expand one or two per weekly review when there is a real reason to discuss the topic in depth.

- `trader-profile` — trader profile: capital, leverage, work mode
- `position-sizing` — position size formula
- `stop-loss-rules` — where to place SL and when to trail it
- `take-profit-rules` — three TP levels (30/30/40)
- `timeframes` — purpose of each timeframe (1D / 4h / 1h / 15m / 1m)
- `indicators` — BOLL, EMA, RSI, MACD
- `bybit-data` — Bybit Data tab (funding, OI, whale ratio)
- `bybit-chart-markers` — B/S markers on Bybit charts mean executed orders, not signals
- `multi-tf-alignment` — multi-TF pre-check concept: what "alignment 4h+1h+15m" means, when it's satisfied, link to the underlying risk-management pattern
- `news-impact-score` — Impact Score formula, Price Impact / Breadth / Forward Modifier scales, decision thresholds
- `leverage-accounting` — separate P&L tracking for trades where 5x leverage was actually required vs not (for weekly review)
- `news-check` — taxonomy of financial news (older concept, now partially absorbed by `news-impact-score`; merge-or-keep decision pending)
- `daily-routine` — trading day routine
- `weekly-review` — weekly strategy review (including leverage outcome accounting)
- `psychology-rules` — psychological rules and breakdown patterns
- `commission-management` — commission minimization

## Operational

- [[log]] — wiki operations journal (append-only)

## Glossary (planned)

Terms that come up in the strategy and deserve their own page for definition and context:

- whale ratio
- funding rate
- open interest (OI)
- bollinger bands (BOLL)
- exponential moving average (EMA)
- relative strength index (RSI)
- MACD
- HH / HL / LH / LL (candle structure)
- R:R (risk-reward ratio)
