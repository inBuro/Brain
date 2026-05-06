---
name: position-sizing
description: Position size formula and graduated risk schedule, scaled to current capital
type: wiki-concept
---

# Position sizing

**Summary**: How to size each ETH/USDT trade. Risk in dollars is derived from a percentage of current capital; ETH size is then risk divided by SL distance in points. Graduated tiers promote, hold, or demote risk based on rolling performance.

**Sources**: [[strategy-v5]] (percentage schedule and tier triggers), chat 2026-05-06 (deposit raised to $3,000)

**Last updated**: 2026-05-06 (capital scaled from $2,200 to $3,000; absolute dollar values recomputed)

---

## Current capital

**$3,000** on Bybit perpetual futures, leverage 5x.

Capital is the input. All dollar amounts on this page are derived from percentages defined in [[strategy-v5]] and recomputed when the deposit changes. The percentages don't change with the deposit; the absolute dollars do.

## Formula

```
ETH size = (risk $) / (SL distance in points)
```

Risk in dollars comes from the graduated schedule below. SL distance comes from [[stop-loss-rules]] — minimum 15-20 points for trend, minimum 10 for range.

## Graduated risk schedule

| Phase | Trigger | % of capital | Trend risk | Range risk |
|---|---|---|---|---|
| Tier 1 (initial) | First 30 valid setups | 1.4% | **$42** | **$21** |
| Tier 2 (promoted) | 30 setups complete AND win rate ≥45% | 1.8% | **$54** | **$27** |
| Tier 1 (held back) | 30 setups complete AND win rate <45% | 1.4% | stay at $42, reassess at 50 setups | stay at $21 |
| Tier 0 (demoted) | Loss > $400 in any 7-day window | 0.93% | drop to **$28**, reassess after 30 more setups | drop to **$14** |

The 1.4% / 1.8% / 0.93% percentages and the tier triggers are inherited from [[strategy-v5]]. Only the dollar values were rescaled when the deposit moved from $2,200 to $3,000.

## Examples (Tier 1, $42 risk, capital = $3,000, ETH ≈ $2,300)

| SL points | ETH size | Margin at 5x | % of deposit | Notional | Notional / deposit |
|-----------|----------|--------------|--------------|----------|--------------------|
| 25 | 1.68 | $773 | **26%** | $3,864 | 1.29× |
| 30 | 1.40 | $644 | **21%** | $3,220 | 1.07× |
| 50 | 0.84 | $387 | **13%** | $1,932 | 0.64× |
| 100 | 0.42 | $193 | **6%** | $966 | 0.32× |

ETH size rounded to two decimals; margin uses ETH ≈ $2,300 (recompute against live price at entry). The **% of deposit** column shows how much of the $3,000 deposit is locked as margin for that trade — the everyday-language number for "сколько от депозита заходит в сделку". Cap is 50% of deposit per [[strategy-v5]] → tight SL <15 pt would breach this and gets clipped.

**Equivalent table at Tier 2 ($54 risk):**

| SL points | ETH size | Margin at 5x | % of deposit |
|-----------|----------|--------------|--------------|
| 25 | 2.16 | $994 | **33%** |
| 30 | 1.80 | $828 | **28%** |
| 50 | 1.08 | $497 | **17%** |
| 100 | 0.54 | $248 | **8%** |

## Margin and after-loss rules

- **Leverage**: 5x.
- **Margin per trade**: not more than 50% of capital → max **$1,500** at $3,000 deposit.
- **After SL**: next trade size 50-70% of normal → **$21-29** at Tier 1, **$27-38** at Tier 2.
- **Size adjustment by Impact Score**: if Impact ≥10 against the trade — halve size (see news-impact section in [[strategy-v5]]).

## When to recompute this page

Recompute every time capital changes by more than 10% (deposit, withdrawal, or sustained P&L drift). The procedure is mechanical: take the percentage column above, multiply by the new capital, round to the nearest dollar, update the dollar columns and the examples block, bump **Last updated**, append to [[log]].

## Related pages

- [[trading-strategy]]
- [[strategy-v5]]
- [[range-trade-rules]]
- [[pending-orders]]
- `stop-loss-rules` (planned)
- `take-profit-rules` (planned)
- `trader-profile` (planned)
