# News Impact Score

**Summary**: Pre-check 2 from [[entry-rules-long]] / [[entry-rules-short]], promoted to its own page on 2026-05-07. Defines the `(Price Impact × Breadth Multiplier) × Forward Modifier` formula, decision thresholds, prohibitive headlines, and — most importantly — codifies that **Claude pulls the news himself** rather than asking the trader to forward headlines.
**Sources**: [[strategy-v4]] (formula introduction), [[strategy-v5]] (current), chat 2026-05-07 (Claude-pulls-news rule)
**Last updated**: 2026-05-07 (created)

---

## Who pulls the news

**Claude does, every market check, without being asked.** The trader has a 30-40 min/day attention budget and shouldn't have to copy-paste headlines into chat for the score to run.

Claude's order of operations on every ETH market check:

1. **WebSearch** for the most recent ETH/crypto/macro news (last 24-48h). Suggested queries:
   - `Ethereum ETH news <month> <year> price`
   - `Bitcoin crypto market news <date>`
   - `FOMC CPI economic calendar <date> this week` — to check macro blockers in the next 1-2h
   - `ETH ETF outflows hack regulation <month> <year>` — for prohibitive headlines
2. **WebFetch** the Fed's FOMC calendar (`https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm`) and BLS CPI schedule whenever a macro event might land inside the trade window.
3. **Read the Bybit Feed screenshot** if the trader includes one — Bybit pre-tags each headline `ETH Bullish` / `ETH Bearish` / `ETH Neutral`, which is a direct input into the Forward Modifier polarity check. Don't ignore the screenshot just because WebSearch ran.
4. **Cross-reference** the two sources: if WebSearch and Bybit Feed disagree on tone (e.g. WebSearch says "ETH ETF outflows", Bybit Feed today says "4 consecutive days of inflows"), trust the more recent and more granular source — usually the Bybit Feed since it's real-time. Note the disagreement in the verdict body.

If Claude skips this step and asks the trader "what's the news today" — that's the rule violation. The check belongs in Claude's pre-output flow, not in the chat round-trip.

## The formula

```
Impact Score = (Price Impact × Breadth Multiplier) × Forward Modifier
```

### Price Impact (ETH move over 24h)

| Tier | Range | Score |
|---|---|---|
| Severe | ≥ ±5% | 10 |
| Major | ±3 ... ±5% | 7 |
| Moderate | ±1 ... ±3% | 4 |
| Minor | < ±1% | 2 |
| Negligible | flat | 1 |

### Breadth Multiplier (reach)

| Reach | Multiplier |
|---|---|
| Systemic (crypto-wide, regulatory, BTC ETF, macro) | ×3 |
| Cross-asset (ETH + DeFi, ETH + L2) | ×2 |
| Asset-specific (Ethereum only) | ×1.5 |
| Wallet-specific (single whale / protocol / market-maker) | ×1 |

### Forward Modifier

| Type | Multiplier |
|---|---|
| Regime change (ETF approval, regulatory action, halving pivot) | ×1.5 |
| Trend confirmation (consecutive liquidations, sustained outflows, series of hot CPI prints, multi-day ETF flow streak) | ×1.25 |
| Isolated (single whale transfer, local news) | ×1.0 |
| Contrary signal (bullish news ignored / bearish rallied) | ×0.75 |

## Decision thresholds

For news that runs **against** the trade direction (bearish vs LONG, bullish vs SHORT):

| Impact Score | Decision |
|---|---|
| ≥ 20 | **SKIP** — don't take the trade |
| 10 ... 20 | Halve position size (Tier-aware: 1.4% → 0.7%, 1.8% → 0.9%, 0.93% → 0.47%) |
| < 10 | Informational, size unchanged |

For news that runs **with** the trade direction (bullish for LONG, bearish for SHORT) at Impact ≥ 10 — counts as an extra confirmation argument, **but not a free pass**. All other rules still apply.

## Prohibitive headlines (any Impact, instant blocker)

Independent of the score:

- Hack of Ethereum core protocol or a major L2 (Arbitrum, Optimism, Base, zkSync) — blocker for **both** directions; day-of-hack volatility is unpredictable in either direction
- Regulatory action against ETH (SEC charges, exchange shutdown, ban in a major jurisdiction)
- Macro headline within the next 1-2 hours (FOMC decision, CPI print, Fed Chair speech)

When the macro check finds nothing scheduled in the window, state it explicitly in the verdict body — silence is ambiguous.

## Output format in market-check responses

The verdict body should include a "News Impact Score" subsection with:

1. **Macro-blocker table** — events in next 1-2h, with date and "blocker yes/no". Even when nothing fires, keep the empty table — it shows the check ran.
2. **Top 3-5 ETH-specific headlines** with timestamps (UTC) and Bybit's polarity tag if available.
3. **BTC-context one-liner** — does BTC news support or contradict the ETH thesis?
4. **Computed score** — Price Impact × Breadth × Forward = N → decision (skip / halve / informational).
5. **Source links** in the WebSearch sources block at the bottom of the response.

## Why this rule exists

Before 2026-05-07, news was treated as input the trader provided. In practice, the trader either skipped it (no time) or forwarded a partial set (only the headlines that caught his eye). The score lost calibration because half the inputs were missing.

After 2026-05-07: Claude runs the check unilaterally on every market analysis. The trader still gets to override if the live sentiment on his terminal disagrees, but the default is "Claude already checked".

## Related pages

- [[entry-rules-long]] — pre-check 2 lives here
- [[entry-rules-short]] — mirror
- [[setup-verdict-format]] — the score's output goes in the body, not the header
- [[bybit-data]] (planned) — Bybit Feed tab structure for screenshot reading
