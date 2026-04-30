# Entry Rules: LONG

**Summary**: Long entry conditions for ETH/USDT. Structure: main potential question → multi-TF alignment pre-check → news Impact Score → 5 base conditions (at least 3 of 5) → bonus confirmations → prohibitive conditions (including mixed-market momentum and counter-trend). Mirrored on [[entry-rules-short]]. For range mean-reversion setups, see [[range-trade-rules]].
**Sources**: [[strategy-v5]] (current strategy version), [[strategy-v4]] (historical reference), [[strategy-v3]] (older reference), chat 2026-04-29..30
**Last updated**: 2026-04-30 (sync with v5: lowered potential 4-7% → 2.5-4%, R:R 1:3 → 1:2 min)

---

## Main question (gating)

Before any other check, one question: **is there a 2.5-4% move (or $60-100 of profit) potential up to TP3?** (source: strategy-v5.md, lowered from 4-7% in v4). If no potential — don't look further, don't enter. This filters out small moves that don't justify the risk and commissions (see [[commission-management]]).

In practice: if ETH is at $2,300, then TP3 for long should sit at $2,358 or higher. If the nearest strong resistance is $2,330 — potential is only ~1.3%, nothing to enter on. For shorter-range mean-reversion plays where potential is 1.5-2.5%, see [[range-trade-rules]] (different rule set).

## Pre-check 1 — Multi-TF Alignment

**Mandatory check BEFORE evaluating the 5 base conditions** (source: strategy-v5.md). If alignment doesn't hold — there is no setup, don't look further.

For long, all three timeframes must line up in the same direction:

- **4h** — structure shows a reversal up or continuation: HL is forming, price holds EMA100, MACD crosses 0 from below.
- **1h** — momentum doesn't contradict the long: RSI rises out of the <40 zone, MACD histogram grows, HL is forming.
- **15m** — entry timing confirmed: reversal candle pattern, volume on retest, RSI bounce from <30.

If one of the timeframes contradicts (for example, 4h for long, 1h for short) — alignment fails, no setup, wait for the next hour. It's **not a replacement** for the 5 base conditions; it's a primary filter.

Source rule — `risk-management` skill, pattern "Multi-timeframe bearish alignment" (success rate 88%, 383 observations, confidence 99%). Concept page planned at `multi-tf-alignment`.

## Pre-check 2 — News Impact Score

After multi-TF alignment — open Bybit Feed → News (or another ETH news feed) and score the top headlines via the formula:

```
Impact Score = (Price Impact × Breadth Multiplier) × Forward Modifier
```

**Price Impact** (ETH move over 24h): Severe ≥±5% = 10, Major ±3...±5% = 7, Moderate ±1...±3% = 4, Minor <±1% = 2, Negligible = 1.

**Breadth Multiplier** (reach): Systemic (crypto-wide, regulatory news, BTC ETF, macro) = 3×, Cross-asset (ETH + DeFi or ETH + L2) = 2×, Asset-specific (Ethereum only) = 1.5×, Wallet-specific (single whale / protocol / market-maker) = 1×.

**Forward Modifier**: Regime change (ETF approval, regulatory action, halving pivot) = ×1.5, Trend confirmation (consecutive liquidations, sustained outflows, series of hot CPI prints) = ×1.25, Isolated (single whale transfer, local news) = ×1.0, Contrary signal (bullish news ignored / bearish rallied) = ×0.75.

**Decision thresholds** (for bearish news when evaluating a long):

| Impact Score | Decision |
|---|---|
| ≥ 20 | **SKIP** — don't take the trade |
| 10...20 | Halve position size |
| < 10 | Informational, size unchanged |

Symmetrically, bullish news with Impact ≥10 gives the long an extra argument (but not a "free pass" — all other rules still apply).

**Prohibitive headlines** (any Impact, instant blocker, listed separately below):
- Hack of Ethereum core protocol or a major L2 (Arbitrum, Optimism, Base, zkSync)
- Regulatory action (SEC charges, exchange shutdown, ban in a major jurisdiction)
- Macro headline within the next 1-2 hours (FOMC decision, CPI print)

Methodology source — `market-news-analyst` skill, adapted for crypto/ETH. Concept page planned at `news-impact-score`. See also [[bybit-data]] (Feed section).

## Base conditions (at least 3 of 5)

This is the core of the entry rules. Need to satisfy at least **three of the five** below at the same time (source: strategy-v5.md):

1. **Price at strong support.** Support means: 24h low, EMA100 on 4h, lower BB band on 4h, or a historical level. The more support types overlap, the stronger the zone.
2. **RSI oversold.** Satisfied if RSI(14) on 1h <40 OR RSI(14) on 4h <45. Either one is enough — both not required.
3. **4h structure starts to reverse.** HL (higher low — above the previous low) or a double bottom is forming. Visible on 4h candles: after a downward sequence, price pulls back up and the next low prints above the previous one.
4. **Whale ratio >1.2 long.** Taken from Data → Trading Trend on Bybit (see [[bybit-data]]). >1.2 means whales are buying.
5. **Daily trend not catastrophically bearish.** This is a negative condition — satisfied by default *unless* there's a recent strong support break on 1D or an outright steep down move. Idea: don't go long against a destructive daily downtrend.

## Bonus confirmations

Not required for entry, but they raise confidence and can justify increasing size to the target value (rather than the reduced one after a string of SLs):

- **Negative funding** — shorts pay longs. Signal that the market is overloaded with shorts and ready to bounce.
- **OI declining on the drop** — open interest leaves on price decline, meaning shorts are closing (not adding), downward pressure weakens.
- **Outflow > Inflow** — money leaves the exchange (cold wallets), usually a bullish signal.
- **BTC shows a similar pattern** — correlation with bitcoin confirms the move isn't idiosyncratic.
- **MACD on 4h begins to turn up** — histogram reduces negative values or MACD lines make a bullish crossover.

## Prohibitive conditions (any one — no entry)

These are blockers. If **any one** of the conditions below holds — don't take the long, even if all 5 base conditions are met and bonuses favor us (source: strategy-v5.md):

1. **Fresh break of a key daily support.** If the 1D level just broke down — don't catch a falling knife.
2. **Whale ratio <0.8.** Whales are short. Going against them is a bad idea.
3. **Funding strongly positive (>0.025%).** Longs are already overloaded, no room to expand higher.
4. **Inflow dominates and rising.** Money actively moving to the exchange = sells being prepared.
5. **Mixed-market momentum trade.** 1D MACD wandering near zero without clear trend AND entry based on a momentum signal (breakout, impulse). Momentum doesn't work in chop. (Source: `risk-management` pattern "Avoid momentum-following in mixed markets", 75% / 33 samples.)
6. **Counter-trend in a bearish market.** 1D MACD <0 AND BTC <EMA200 on 1D — longs in such an environment aren't considered. (Source: `risk-management` pattern "Contrarian LONG entries in bearish markets", 0-30% success.)
7. **Critical news on the asset.** Hack of ETH core protocol or a major L2, regulatory action against ETH in a major jurisdiction, or macro headline within the next 1-2 hours (FOMC, CPI, Fed Chair speech). See "Pre-check 2 — News Impact Score" above.

## Check order

To avoid getting tangled in setup analysis, the checklist runs in this order:

1. **Main potential question.** No potential — close the tab, stop thinking.
2. **Pre-check 1: Multi-TF alignment** (4h + 1h + 15m in the same direction). Doesn't hold — no setup, stop thinking.
3. **Pre-check 2: News Impact Score.** Prohibitive headline or Score ≥20 against the trade — stop. Score 10-20 — flag it, halve size during sizing.
4. **Prohibitive conditions** (structural blockers #1-6). Any one holds — stop.
5. **Base conditions.** Count how many hold. <3 — stop.
6. Only if 3 base conditions are passed without blockers — look at the bonuses.

This order saves time: pre-checks and blockers are the fastest to verify (multi-TF alignment is visible in a couple of minutes, a single whale ratio or funding value cuts off half the false setups). News are checked second — sometimes they close the question immediately (for example, FOMC in an hour — no new trades).

## What happens after entry

Once all conditions pass:
- Position size calculated by formula — see [[position-sizing]]
- SL placed immediately on entry — see [[stop-loss-rules]]
- All three TPs placed on entry — see [[take-profit-rules]]
- Entry preferably via limit order to save commissions — see [[commission-management]]

After entry, the strategy's main principle kicks in: **"the trade should work on its own"**. The decision was made before entry, no further intervention.

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-short]] — mirror rules for short entry
- [[indicators]] — RSI, MACD, EMA, BOLL
- [[bybit-data]] — whale ratio, funding, OI
- [[position-sizing]] — position size
- [[stop-loss-rules]] — SL placement
- [[take-profit-rules]] — three TP levels
