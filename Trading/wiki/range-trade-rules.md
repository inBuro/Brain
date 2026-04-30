# Range Trade Rules

**Summary**: New in v5 — explicit subcategory for sideways/choppy markets that the trend/reversal rules silently skipped. Range trades use mean-reversion from defined edges of a horizontal range, with smaller position size, lower R:R, but higher target win rate.
**Sources**: [[strategy-v5]] (current strategy version)
**Last updated**: 2026-04-30 (created)

---

## When to use range trades vs trend trades

| Market state | Use |
|---|---|
| Clear trend up/down on 1D + 4h, momentum present | [[entry-rules-long]] / [[entry-rules-short]] |
| 1D MACD ≈ 0, 4h MACD between −10 and +10, ATR contracting, defined horizontal range | **range-trade-rules** (this page) |
| Mixed: trend on 1D but chop on 4h — DON'T trade either | wait for clarity |

A range setup and a trend setup shouldn't both fire at the same time. If they do, something is wrong with the analysis — re-check.

## Main question (gating)

**Is there a clean range with width ≥1.5%?** Range width = (range high − range low) / current price.

If width is under 1.5% — partial-position TPs don't cover commissions, skip. If width is over ~3.5% — that's not really a range anymore, look at trend rules.

Practical example: ETH consolidates between $2,250 and $2,300. Width = $50 / $2,275 = **2.2%**. Acceptable range. Edge-to-midpoint = ~1.1% (TP1), edge-to-edge = ~2.2% (TP2). If width is $30 instead — only 1.3%, skip.

## Pre-check (replaces multi-TF alignment for ranges)

All four conditions below must hold:

1. **4h MACD between −10 and +10** — no clear trend signal on the structural timeframe
2. **ATR(14) on 1h declining for at least 24h** — volatility is contracting (a classic range characteristic)
3. **Clear horizontal range** — defined high and defined low, each touched at least 2x with **rejection** (not breakout) within the last 24-48h. "Rejection" = candle closes back inside the range, often with a wick beyond the level.
4. **BB(20,2) flat on 4h** — bands aren't expanding outward (would indicate a trend developing)

If any one fails — no range setup. Could still be a trend setup; check those rules separately.

## Base conditions (at least 2 of 3)

Range trades have fewer base conditions than trend trades because the structural setup is more visual — if the range is clean and the pre-check passes, the structure does most of the work. The base conditions confirm the mean-reversion is still active rather than about to break.

1. **Last 2-3 touches of the relevant edge were rejections** — long upper wicks at the top edge (selling pressure when price pokes through), long lower wicks at the bottom edge (buying pressure when price dips below). If the most recent touch was a clean breakout that came back in, the range is weakening — be cautious.
2. **Volume contracts inside the range** — not building toward a breakout. Rising volume on edge approaches signals a coming break.
3. **RSI(14) on 1h between 30 and 70** — not stretched in either direction. RSI extremes near range edges are normal, but the overall reading shouldn't show a clear directional bias.

## Entry rules

**Long at lower edge:**
- Wait for the 15m candle showing rejection (lower wick + close above the wick low)
- Enter on close of that 15m candle, or limit order slightly above the wick low
- Don't enter on the wick itself ("catching the knife") — wait for confirmation

**Short at upper edge:** mirror — long upper wick + close below the wick high.

**SL placement:**
- 0.5-1% beyond the range edge (tight by design — invalidation = breakout)
- Minimum 10 points

**TP placement (only 2 TPs for ranges, no TP3):**
- **TP1** (50% of position): midpoint of the range, R:R typically 1:1
- **TP2** (50% of position): opposite edge, R:R typically 1:2
- Once the opposite edge prints, exit fully — don't try to "ride the breakout"

## Position size for range trades

Half of normal trend-trade size:
- Tier 1: $15 risk per range trade (vs $30 for trend)
- Tier 2: $20 risk per range trade (vs $40 for trend)

Why smaller: lower R:R means lower per-trade reward, so smaller risk keeps the math sane and protects against unexpected breakouts.

## Prohibitive conditions (any one — no entry)

1. **Range width <1.5%** — not enough to cover commissions on partial exits
2. **4h MACD > +20 or < −20** — clear trend, not a range
3. **Breakout already happened** — 15m candle closed outside the range with above-average volume (range is dead, wait for new structure)
4. **Long/Short position holder ratio extreme** (>2.5 or <0.5) — likely about to break in the crowded direction
5. **Macro headline within the next 1-2 hours** — volatility about to spike, range will break (FOMC, CPI, Fed Chair speech)
6. **Critical news** (same prohibitive list as trend trades — see [[entry-rules-long]] for full list)

## Target metrics for range trades

- Win rate: 60-65% (higher than trend trades because the structure is more constrained)
- Average win: $20-30 (Tier 1) / $25-40 (Tier 2)
- Average loss: $15 (Tier 1) / $20 (Tier 2)
- Expected contribution to monthly P&L: ~25-30% of total

## What range trades aren't

- Not breakout trades. If price closes outside the range with volume, the range is broken — wait for new structure to form.
- Not "fade the move" trades. Range mean-reversion only works when both edges are clearly defined and respected. Random oscillations without a defined range = chop, not range.
- Not for low-volatility days near holidays/weekends. Range trades need the volatility contraction to be cyclical (Asia → London → New York), not flat-line dead.

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-long]] — trend-trade long entry conditions
- [[entry-rules-short]] — trend-trade short entry conditions
- [[indicators]] — RSI, MACD, EMA, BOLL, ATR (planned)
- [[bybit-data]] — whale ratio, funding, OI (planned)
- [[position-sizing]] — graduated $30 → $40 schedule (planned)
- [[trading-journal-v5]] — journal of all checks where range conditions were evaluated
