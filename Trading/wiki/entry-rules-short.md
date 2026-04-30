# Entry Rules: SHORT

**Summary**: Short entry conditions for ETH/USDT. Mirror page to [[entry-rules-long]] — same structure: main potential question → multi-TF alignment pre-check → news Impact Score → 5 base conditions (at least 3 of 5) → bonus confirmations → prohibitive conditions (including mixed-market momentum and counter-trend in a bullish market). For range mean-reversion setups, see [[range-trade-rules]].
**Sources**: [[strategy-v5]] (current strategy version), [[strategy-v4]] (historical reference), [[strategy-v3]] (older reference)
**Last updated**: 2026-04-30 (sync with v5: lowered potential 4-7% → 2.5-4%, R:R 1:3 → 1:2 min)

---

## Main question (gating)

Before any other check, one question: **is there a 2.5-4% downward move (or $60-100 of profit) potential up to TP3?** (source: strategy-v5.md, lowered from 4-7% in v4). If no potential — don't look further, don't enter. This filters out small moves that don't justify the risk and commissions (see [[commission-management]]).

In practice: if ETH is at $2,300, then TP3 for short should sit at $2,243 or lower. If the nearest strong support is $2,270 — potential is only ~1.3%, nothing to enter on. For shorter-range mean-reversion shorts where potential is 1.5-2.5%, see [[range-trade-rules]].

## Pre-check 1 — Multi-TF Alignment

**Mandatory check BEFORE evaluating the 5 base conditions** (source: strategy-v5.md). If alignment doesn't hold — there is no setup, don't look further.

For short, all three timeframes must line up in the same direction (mirror of long):

- **4h** — structure shows a downward reversal or continuation: LH (lower high) is forming, price rejects from EMA100 / BB upper, MACD crosses 0 from above.
- **1h** — momentum doesn't contradict the short: RSI exits the >65 zone, MACD histogram falls, LH is forming.
- **15m** — entry timing confirmed: downward reversal candle pattern, volume on retest, RSI rollback from >70.

If one of the timeframes contradicts (for example, 4h for short, 1h for long) — alignment fails, no setup, wait for the next hour. It's **not a replacement** for the 5 base conditions; it's a primary filter.

Source rule — `risk-management` skill, pattern "Multi-timeframe bearish alignment" (success rate 88%, 383 observations, confidence 99% — the pattern is historically calibrated specifically on bearish scenarios, so it carries extra weight for shorts). Concept page planned at `multi-tf-alignment`.

## Pre-check 2 — News Impact Score

After multi-TF alignment — open Bybit Feed → News (or another ETH news feed) and score the top headlines via the formula:

```
Impact Score = (Price Impact × Breadth Multiplier) × Forward Modifier
```

The Price Impact / Breadth Multiplier / Forward Modifier scales are the same as for long; see [[entry-rules-long]] section "Pre-check 2 — News Impact Score". Only the news polarity interpretation flips.

**Decision thresholds** (for bullish news when evaluating a short — it works against the trade):

| Impact Score | Decision |
|---|---|
| ≥ 20 | **SKIP** — don't take the short |
| 10...20 | Halve position size |
| < 10 | Informational, size unchanged |

Symmetrically, bearish news with Impact ≥10 gives the short an extra argument (but not a "free pass" — all other rules still apply).

**Prohibitive headlines** (any Impact, instant blocker, listed separately below):
- Hack of Ethereum core protocol or a major L2 (Arbitrum, Optimism, Base, zkSync) — despite the bearish narrative, day-of-hack market is unstable in both directions, no short either
- Regulatory action (SEC charges, exchange shutdown, ban in a major jurisdiction)
- Macro headline within the next 1-2 hours (FOMC decision, CPI print)

Methodology source — `market-news-analyst` skill, adapted for crypto/ETH. Concept page planned at `news-impact-score`. See also [[bybit-data]] (Feed section).

## Base conditions (at least 3 of 5)

This is the core of the entry rules. Need to satisfy at least **three of the five** below at the same time (source: strategy-v5.md):

1. **Price at strong resistance.** Resistance means: 24h high, EMA100 on 4h, upper BB band on 4h, or a historical level. The more resistance types overlap, the stronger the zone.
2. **RSI overbought.** Satisfied if RSI(14) on 1h >65 OR RSI(14) on 4h >60. Either one is enough — both not required.
3. **4h structure starts to reverse downward.** LH (lower high — below the previous high) or a double top is forming. Visible on 4h candles: after an upward sequence, price pulls back down and the next high prints below the previous one.
4. **Whale ratio short.** Taken from Data → Trading Trend on Bybit (see [[bybit-data]]). Satisfied if whale ratio <0.8 (whales short) OR declining from >1 to <1 (whales rotating into short).
5. **Daily trend not catastrophically bullish.** This is a negative condition — satisfied by default *unless* there's a recent strong resistance break on 1D or an outright steep up move. Idea: don't go short against a destructive daily uptrend.

## Bonus confirmations

Not required for entry, but they raise confidence and can justify increasing size to the target value (rather than the reduced one after a string of SLs):

- **High positive funding (>0.015%)** — longs are overheated, paying shorts. Signal that the market is ready to correct down.
- **OI rising on price advance** — open interest builds at the highs = new longs entering exactly where they will be liquidated later.
- **Inflow > Outflow** — money moves to the exchange (sells being prepared), usually bearish.
- **BTC shows a similar pattern** — correlation with bitcoin confirms the move isn't idiosyncratic.
- **MACD on 4h begins to turn down** — histogram shrinks positive values or MACD lines make a bearish crossover.
- **Long upper wicks on 4h candles** — sellers overpower buyers at every test of resistance.

## Prohibitive conditions (any one — no entry)

These are blockers. If **any one** of the conditions below holds — don't take the short, even if all 5 base conditions are met and bonuses favor us (source: strategy-v5.md):

1. **Fresh break of a key daily resistance.** If the 1D level just broke up — don't short into impulse, you risk a short squeeze.
2. **Whale ratio >1.3.** Whales are strongly long. Going against them is a bad idea.
3. **Funding strongly negative (<-0.02%).** Shorts already overloaded, no fuel for downward move, easy squeeze.
4. **Outflow dominates and rising.** Money leaves the exchange (to cold wallets) = accumulation, not distribution.
5. **Mixed-market momentum trade.** 1D MACD wandering near zero without clear trend AND entry based on a momentum signal (breakout, impulse). Momentum doesn't work in chop. (Source: `risk-management` pattern "Avoid momentum-following in mixed markets", 75% / 33 samples.)
6. **Counter-trend in a bullish market.** 1D MACD >0 AND BTC >EMA200 on 1D with a fresh break — shorts in such an environment aren't considered. (Mirror pattern to `risk-management` "Contrarian LONG entries in bearish markets", same logic — don't trade against a strong daily trend.)
7. **Critical news on the asset.** Hack of ETH core protocol or a major L2, regulatory action against ETH, or macro headline within the next 1-2 hours (FOMC, CPI, Fed Chair speech). See "Pre-check 2 — News Impact Score" above.

## Check order

Mirror of long — same checklist as in [[entry-rules-long]]:

1. **Main potential question** (down 4-7%). No potential — stop.
2. **Pre-check 1: Multi-TF alignment** (4h + 1h + 15m for short). Doesn't hold — stop.
3. **Pre-check 2: News Impact Score.** Prohibitive headline or Score ≥20 against the trade — stop. Score 10-20 — halve size during sizing.
4. **Prohibitive conditions** (structural blockers #1-6). Any one holds — stop.
5. **Base conditions.** Count how many hold. <3 — stop.
6. Only if 3 base conditions are passed without blockers — look at the bonuses.

## Short-specific notes on ETH (for the future)

These aren't rules, just observations that accumulate as live trades pile up. Will be expanded once there is statistical material:

- **Short squeezes on ETH happen more often than long capitulations** — therefore, for shorts, set SL tighter to the structural invalidator than for longs. Details in [[stop-loss-rules]].
- **High funding ≠ automatic short** — the market can stay overbought for weeks. Funding alone isn't a setup, only a bonus confirmation.
- **Daily candles with long upper wicks vs close above the high** — the first is a strong short signal, the second is a strong "no short" signal.

## What happens after entry

Once all conditions pass:
- Position size calculated by formula — see [[position-sizing]]. If news Impact Score is 10-20 against the trade — halve size.
- SL placed immediately on entry, **above** the last significant LH or a key EMA with a buffer — see [[stop-loss-rules]].
- All three TPs placed on entry — see [[take-profit-rules]].
- Entry preferably via limit order to save commissions — see [[commission-management]].

After entry, the strategy's main principle kicks in: **"the trade should work on its own"**. The decision was made before entry, no further intervention.

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-long]] — mirror rules for long entry
- [[indicators]] — RSI, MACD, EMA, BOLL
- [[bybit-data]] — whale ratio, funding, OI
- [[position-sizing]] — position size
- [[stop-loss-rules]] — SL placement
- [[take-profit-rules]] — three TP levels
