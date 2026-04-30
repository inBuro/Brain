# Strategy v3 — Baseline Backtest (Sanity Check on Single Signals)

**Summary**: Backtest of **individual indicators** from [[strategy-v3]] on 2 years of daily ETH-USD data. This isn't a full-strategy validation — it's a check whether individual signals have any edge in isolation (Variant A from the validation plan).
**Sources**: `raw/strategy-v3.md`, `.agents/skills/backtesting-trading-strategies/`
**Last updated**: 2026-04-30 (translation RU → EN; content unchanged from 2026-04-29)

---

## Context and limitations

A direct full backtest of [[strategy-v3]] via the installed `backtesting-trading-strategies` skill isn't possible, for these reasons:

1. **Data source** — `yfinance` (`ETH-USD` spot), not Bybit ETH/USDT perpetual. The price difference is small, but funding rate, open interest, and whale ratio (Bybit Trading Trend) are **completely absent** — and those are key setup components.
2. **Timeframe** — the skill hardcodes `interval='1d'`, while [[strategy-v3]] runs on 4h/1h.
3. **Entry logic** — built-in skill strategies are single-rule (one indicator → signal), while strategy-v3 requires "3 of 5 base conditions" + bonuses + prohibitive.
4. **Multi-TP exits** — TP1/TP2/TP3 with different R:R and moving SL to breakeven after TP1 (the standard playbook) isn't modeled by the skill.

**So this backtest answers only one question:**
> If you use only one of the indicators from strategy-v3 (RSI, BOLL, MACD, EMA crossover) on daily ETH without any filter — does it have edge?

## Test parameters

- **Instrument**: ETH-USD spot (yfinance)
- **Period**: 2024-04-29 → 2026-04-29 (2 years)
- **Timeframe**: 1D
- **Starting capital**: $2,200 (matches strategy-v3 deposit)
- **Indicator parameters** taken from strategy-v3 where applicable

## Results

| Strategy | Total Return | Win Rate | Trades | Profit Factor | Max DD | Notes |
|---|---|---|---|---|---|---|
| **Buy & Hold** | **−28.4%** | — | 1 | — | −63.2% | benchmark — market dropped from $3215 to $2301 |
| RSI reversal (14, 40/65) | **−67.8%** | 51.5% | 68 | 0.73 | −84.3% | RSI<40 long / >65 short per [[strategy-v3]] |
| Bollinger Bands (20, 2) | **−54.2%** | 52.3% | 44 | 0.69 | −62.7% | mean-reversion off the bands |
| MACD (12, 26, 9) | **−62.8%** | 28.6% | 56 | 0.66 | −79.3% | crossover signal/MACD |
| EMA 50/100 crossover | **+32.8%** | 100% | 1 | ∞ | −31.0% | fired once in 2 years, effectively buy-and-hold with a filter |

(source: `.agents/skills/backtesting-trading-strategies/reports/`)

## Interpretation

### What got confirmed

1. **Single-indicator signals from strategy-v3 on daily ETH have no positive edge.** Three of four strategies (RSI, BOLL, MACD) lost to buy-and-hold, with RSI and MACD losing by more than 2x.

2. **~50% win rate with negative expectancy** for RSI and BOLL means the classic problem: average win ($100-104) smaller than average loss ($145-165). No profit even on a "fair coin".

3. **MACD on dailies works catastrophically** (win rate 28.6%, profit factor 0.66) — produces many false signals in chop.

### What this means for strategy-v3

This is an **argument for** the discipline of strategy-v3, not against it:

- The rule **"at least 3 of 5 base conditions"** is critical. Without it, any single indicator is effectively random.
- **Funding / OI / whale ratio as filters** aren't optional. They're the only source of "non-TA edge", and without them naked TA on ETH in 2024-2026 = loss.
- **Lower timeframes (4h/1h) matter more than they seem** — on dailies signals are too noisy, and trade frequency should be 1-2 per day, not 30-60 over 2 years.
- **Multi-TP exit (TP1=BU)** — likely a key edge source: in these tests every trade runs single-shot SL/TP without moving to breakeven.

### What wasn't tested

- Exact strategy-v3 rules on 4h/1h — needs a custom engine (Variant B of the validation plan)
- Funding / OI / whale ratio as filters — no data in yfinance
- Multi-TP with SL-to-BU
- Combo logic "3 of 5"
- Prohibitive conditions (news blocker, BTC correlation, etc.)

## Decision / next steps

**Don't change [[strategy-v3]] based on this test** — it validates only that single signals don't work, which is already baked into the design (combo requirement).

**Continuation options:**
1. **Variant B** (1-2 hours) — write a custom python strategy implementing a subset of strategy-v3 rules on OHLC (no funding/OI/whale). Use the same skill's engine with a custom strategy.
2. **Variant C** (several days) — stand up a full backtest with Bybit perp + funding + OI via Bybit API. Whale ratio from Trading Trend has no public API — skip it or scrape.
3. **Don't validate quantitatively** — keep journaling real trades and doing the weekly review (also a form of validation, just slow).

## Artifacts

- Per-backtest reports: `.agents/skills/backtesting-trading-strategies/reports/`
- PNG equity-curve charts: same path
- ETH-USD 1D data cache: `.agents/skills/backtesting-trading-strategies/data/ETH_USD_1d.csv`

## Related pages

- [[strategy-v3]] — the canonical strategy that was tested
- [[trading-strategy]] — wiki page for the strategy
- [[indicators]] — description of indicators used (planned)
- [[bybit-data]] — funding, OI, whale ratio (planned), absent from this test
