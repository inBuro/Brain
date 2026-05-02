# Trading Strategy

**Summary**: Systematic positional swing strategy for ETH/USDT on Bybit perpetual futures. Current version is v5 (2026-04-30), which lowers potential and R:R thresholds, adds a RANGE-trade subcategory, introduces graduated position sizing ($30 → $40), and adds a scheduled remote agent for passive monitoring with email alerts. Main principle: "the trade should work on its own" — enter, set SL and TP, don't micromanage.
**Sources**: [[strategy-v5]] (current), [[strategy-v4]] (historical reference), [[strategy-v3]] (older reference), chat 2026-04-26..30
**Last updated**: 2026-04-30 (sync with v5: lowered thresholds, RANGE category, graduated sizing, routine)

---

## Context

The strategy targets a trader who can't (and doesn't want to) sit over the chart all day. Attention budget: 30-40 minutes per day. Capital $2,200 on Bybit perpetual futures, leverage 5x (source: strategy-v4.md). Only ETH/USDT is traded, both directions (LONG and SHORT). See [[trader-profile]] for details.

## Main principle

**"The trade should work on its own"** — the strategy is built so that decisions are made *before* opening a position, not during it. Once entered, the position is managed automatically: SL and TP are already in place, and manual intervention is allowed only in rare cases (see [[stop-loss-rules]], section "when to trail SL").

## Target parameters

| Parameter | Value (v5) |
|----------|----------|
| Risk per trade — Tier 1 (initial) | $30 (1.4% of capital) |
| Risk per trade — Tier 2 (after 30 valid setups, win rate ≥45%) | $40 (1.8% of capital) |
| Target profit (full TP3) | $69 (Tier 1) / $92 (Tier 2) |
| Realistic profit (TP1+TP2 hit, TP3 trailed to BU) | $27 (Tier 1) / $36 (Tier 2) |
| Minimum R:R | 1:2 (down from 1:3 in v4) |
| Target R:R | 1:3.5 (down from 1:5 in v4) |
| Trade duration | from hours to 3-4 days |
| Frequency target | 2-3 valid setups per day max |
| Frequency realistic | 10-15 valid setups per month |

Detailed sizing math lives on [[position-sizing]]. Minimum movement to take a trend trade — **2.5-4% from current price** (down from 4-7% in v4); for [[range-trade-rules]] the minimum is 1.5% range width (different metric). Otherwise, commissions eat the result (source: strategy-v5.md, see [[commission-management]]).

## Pre-checks before each entry

Two mandatory pre-checks (carried from v4) run **before** evaluating the 5 base conditions for trend trades:

1. **Multi-TF Alignment** — 4h, 1h and 15m must all point in the same direction. If at least one timeframe contradicts — no setup, wait for the next hour. Concept page planned at `multi-tf-alignment`. Source rule: `risk-management` skill, pattern "Multi-timeframe bearish alignment" (88% success / 383 samples / 99% confidence).

2. **News Impact Score** — open Bybit Feed → News, evaluate top headlines via the formula `(Price Impact × Breadth) × Forward Modifier`. Score ≥20 against the trade → skip. Score 10-20 → halve position size. Score <10 → informational only. Any prohibitive headline (core-protocol or major L2 hack, regulatory action, macro headline within the next 1-2 hours) is an instant blocker. Concept page planned at `news-impact-score`.

For trend trades, see [[entry-rules-long]] (mirrored in [[entry-rules-short]]). For range trades, the multi-TF alignment is replaced by a different pre-check (4h MACD ≈ 0 + ATR contraction + clear horizontal range) — see [[range-trade-rules]].

## Strategy structure

The strategy unfolds across the concept pages below:

**Profile and principles:**
- [[trader-profile]] — trader profile, capital, leverage, work mode
- [[psychology-rules]] — psychological rules and breakdown patterns

**Analytics:**
- [[timeframes]] — which timeframes to use and for what (1D / 4h / 1h / 15m / 1m)
- [[indicators]] — indicators (BOLL, EMA, RSI, MACD)
- [[bybit-data]] — Bybit Data tab (funding, OI, whale ratio)
- [[bybit-chart-markers]] — what B/S markers on Bybit charts mean (important: those are executed orders, not signals)

**Entries:**
- [[entry-rules-long]] — long entry conditions (5 base, bonuses, prohibitive)
- [[entry-rules-short]] — short entry conditions (mirror rules)
- [[range-trade-rules]] — range mean-reversion subcategory (new in v5)
- [[pending-orders]] — when to suggest pending limit orders for probable setups (v5 supplement, 2026-05-01)
- [[trading-hours]] — 09:00-17:00 ICT trading window for new entries (v5 supplement, 2026-05-01)

**Trade management:**
- [[position-sizing]] — position size formula
- [[stop-loss-rules]] — where to set SL and when to trail it
- [[take-profit-rules]] — three TP levels (30/30/40)

**Operations:**
- [[daily-routine]] — daily routine (morning, at setup, during the position, after)
- [[weekly-review]] — weekly strategy review
- [[commission-management]] — commission minimization
- [[trading-journal-v5]] — append-only journal of every market check (manual + scheduled routine)

## What we don't trade

The exclusion list matters as much as the entry rules. We don't take setups with potential under 4% movement. We don't take counter-trend against a strong daily trend in the opposite direction. After two consecutive SLs in one day — pause until the next day. Late evening (after 22:00 local) — no new entries. If tired or emotional — no trading at all. Full list: [[psychology-rules]].

## Target metrics

With disciplined execution, monthly targets are: trend win rate 50-60%, range win rate 60-65%, net result **$200-350/month at Tier 1** (~9-16% of capital), stretch **$500/month at Tier 2** (~22% of capital with good catch rate). v5 explicitly targets dollar amounts rather than just percentages because absolute monthly income is now the optimization target (source: strategy-v5.md). Worse than that — investigate at [[weekly-review]] what's going wrong. Better — record what's working.

Carried from v4, weekly review includes **leverage outcome accounting**: a separate P&L tally for trades where a tight SL actually required 5x leverage (that is, without leverage the position size would have been unreachable) vs trades where 5x had no effect on execution. Goal: collect ≥30 observations and assess whether leverage actually provides edge or 5x only inflates variance. This is data collection, not a decision to change leverage. Trigger: the `risk-management` record "High leverage 4x-5x with optimal risk = 0% success / 132 samples / 50% confidence" — sample too small to act on, but alarming enough to measure. Concept page planned at `leverage-accounting`.

New in v5: weekly review also tracks **Tier promotion** (30 valid setups + ≥45% win rate → promote $30 to $40), **Tier demotion** (loss > $300 in any 7-day window → drop to $20), and **range vs trend split** (% of monthly P&L from each subcategory).

## Version history

- **v1** — first attempt at formalization (no working notes preserved)
- **v2** — refined timeframes and R:R (no working notes preserved)
- **v3** — added shorts, weekly review, realistic profit expectations. Source: [[strategy-v3]]. Built from a series of live trading sessions 2026-04-26..29. Kept as historical reference.
- **v4** — iteration after ingesting the `risk-management` and `market-news-analyst` skills, plus [[strategy-v3-baseline-backtest]]. Adds: multi-TF alignment as pre-check, 2 new prohibitive conditions (mixed-market momentum, counter-trend by 1D MACD + BTC EMA200), news Impact Score, weekly leverage accounting. Source: [[strategy-v4]]. Full changelog inside the v4 document.
- **v5 (current)** — frequency-and-coverage iteration. Lowered potential threshold (4-7% → 2.5-4%), lowered R:R (min 1:3 → 1:2, target 1:5 → 1:3.5), added RANGE-trade subcategory, graduated position sizing ($30 → $40 after 30 valid setups with ≥45% win rate), scheduled remote agent for passive monitoring + email alerts. First version that explicitly targets monthly dollar income ($200-500) rather than capital growth percentage. Source: [[strategy-v5]]. Full changelog inside the v5 document.

A version bump only happens after real-world live testing and discussion at the weekly review. Intermediate edits to specific rules (for example, nudging an RSI threshold) live in commit history; a new major version is a separate document in `raw/` (in the v4 case — a separate file, so v3 stays immutable per CLAUDE.md).

## Related pages

- [[trader-profile]]
- [[entry-rules-long]]
- [[entry-rules-short]]
- [[position-sizing]]
- [[stop-loss-rules]]
- [[take-profit-rules]]
- [[daily-routine]]
- [[weekly-review]]
- [[psychology-rules]]
