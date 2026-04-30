# Trading Strategy (v5)

**Created:** 2026-04-30
**Trader:** Kirill
**Status:** Active
**Source type:** Canonical strategy document
**Supersedes:** [[strategy-v4]] (see "What changed vs v4" at the bottom)

> This is a raw source — don't modify. Updates go to v6 in a new file.
> Wiki interpretations and concept pages live in `wiki/` and reference this document.

---

## Trader profile

- Name: Kirill
- Capital: $2,200 (Bybit perpetual futures)
- Time per day: 30-40 minutes (active scans), continuous passive monitoring via scheduled remote agent
- Style: positional swing trader
- Main instrument: ETH/USDT Perpetual
- Directions: LONG, SHORT, RANGE (new in v5)
- Leverage: 5x

## Main principle

**"The trade should work on its own"**
Open a position with proper SL and TP, then let it breathe — from hours to 3-4 days. Don't sit over the chart. Don't trail SL nervously. Don't close manually if the structure is still working.

## Target trade parameters

| Parameter | Value (v5) | Notes vs v4 |
|---|---|---|
| Risk per trade (initial) | $30 (1.4% of capital) | up from $25 |
| Risk per trade (after 30 valid setups, if win rate ≥45%) | $40 (1.8% of capital) | graduated promotion |
| Target profit (ideal full TP3) | $60-105 | recalculated for new R:R |
| Realistic profit (moderate execution) | $30-60 | TP1 + TP2 hit, TP3 trailed to BU |
| Minimum R:R | 1:2 | down from 1:3 |
| Target R:R | 1:3.5 | down from 1:5 |
| Trade duration | hours to 3-4 days | unchanged |
| Frequency (target) | 2-3 valid setups per day max | up from 1-2 |
| Frequency (realistic) | 10-15 valid setups per month | informed by v4 backtest of visible setups |

## Timeframes used

**1D (daily):** Global trend
- Where price sits in the big picture
- Key historical levels
- Long-term patterns

**4h:** Mid-term trend
- Structure HH/HL (bullish) or LH/LL (bearish)
- Key EMAs as support/resistance
- Accumulation/distribution zones

**1h:** Primary entry/exit timeframe
- Entry trigger
- SL and TP placement
- Reversal/continuation confirmation

**15m:** Entry timing fine-tune
- Best price on retest
- Reversal candle confirmation

**1m:** Only for live position monitoring, not decisions

## Indicators used

- BOLL(20, 2)
- EMA50, EMA100
- RSI(14)
- MACD(12, 26, 9)
- ATR(14) — new in v5, used for range-trade volatility filter
- Volume
- Bybit Data tab: Funding, OI, Trading Trend (whale ratio)

---

## Multi-Timeframe Alignment (PRE-CHECK before entry conditions)

**Mandatory check BEFORE evaluating the 5 base conditions.** If alignment doesn't hold — no setup, don't go further.

**For LONG, all three must align:**
- **4h**: structure shows reversal up or continuation (HL forming, price holds EMA100, MACD crosses 0 from below)
- **1h**: momentum doesn't contradict the long (RSI exits the <40 zone, MACD histogram grows, HL forming)
- **15m**: entry timing confirmed (reversal candle, volume on retest, RSI bounce from <30)

**For SHORT — mirror:**
- **4h**: reversal down or continuation (LH forming, price rejects EMA100/BB upper, MACD crosses 0 from above)
- **1h**: RSI exits the >65 zone, MACD histogram falls, LH forming
- **15m**: reversal candle, volume on retest, RSI rollback from >70

**For RANGE (new):** see the "Range-trade rules" section below — multi-TF alignment is REPLACED by a different alignment check (4h MACD near zero, ATR contraction, clear horizontal range).

If alignment fails on one timeframe — no setup, wait for the next hour.

(Source: rule from `risk-management` skill pattern "Multi-timeframe bearish alignment 15m+4h", success rate 88%, 383 samples, 99% confidence.)

---

## Financial news (mandatory context check)

**Before every entry** — check the ETH news feed (Bybit Feed → News or equivalent).

### Impact Score — news prioritization formula

```
Impact Score = (Price Impact × Breadth Multiplier) × Forward Modifier
```

#### Price Impact (ETH 24h move)

| Level | ETH 24h move | Points |
|---|---|---|
| Severe | ≥ ±5% | 10 |
| Major | ±3...±5% | 7 |
| Moderate | ±1...±3% | 4 |
| Minor | <±1% | 2 |
| Negligible | within noise | 1 |

#### Breadth Multiplier

| Reach | Coverage | Multiplier |
|---|---|---|
| Systemic | crypto-wide: regulatory, BTC ETF flow, macro CPI/FOMC | 3× |
| Cross-asset | ETH + DeFi, or ETH + a major L2 | 2× |
| Asset-specific | Ethereum only (Merge-related, ETH ETF flow, EIP) | 1.5× |
| Wallet-specific | Single whale / protocol / market-maker | 1× |

#### Forward Modifier

| Type | Meaning | Multiplier |
|---|---|---|
| Regime change | Structural shift (ETF approval/denial, regulatory action, halving cycle pivot) | ×1.5 |
| Trend confirmation | Confirms current trend (consecutive liquidations, sustained outflows/inflows, hot CPI series) | ×1.25 |
| Isolated | One-off event, no follow-through (single whale transfer, local news) | ×1.0 |
| Contrary signal | Goes against narrative (bullish ignored / bearish rallied) | ×0.75 |

### Decision thresholds

| Impact Score | Bearish news → long | Bullish news → short |
|---|---|---|
| **≥ 20** | **SKIP** (don't take the trade) | **SKIP** |
| 10...20 | Halve position size | Halve position size |
| < 10 | Informational, size unchanged | Informational, size unchanged |

**Symmetric for the same direction:** bearish news with Impact ≥10 gives the short an extra argument (but not a "free pass" — all other rules still apply).

### Prohibitive headlines (any Impact, instant blocker)

These headlines fully cancel any trade for the day, regardless of Impact Score:
- Hack of Ethereum core protocol or a major L2 (Arbitrum, Optimism, Base, zkSync)
- Regulatory action (SEC charges, exchange shutdown, ban)
- Macro headline within the next 1-2 hours (FOMC decision, CPI print)

---

## LONG entry rules

**Main question:** is there a 2.5-4% move (or $60-100 of profit) potential up to TP3?
If less — don't enter. (v5: lowered from 4-7% to 2.5-4%.)

**Pre-check:** Multi-TF alignment for long (see section above). No alignment — no setup.

**Base conditions (at least 3 of 5):**
1. Price at strong support (24h low, EMA100 4h, BB lower 4h, historical level)
2. RSI 1h <40 OR RSI 4h <45
3. 4h structure starts to reverse (HL forming or double bottom)
4. Whale ratio in Trading Trend >1.2 long
5. 1D trend not catastrophically bearish

**Bonus confirmations:**
- Negative funding (shorts pay longs)
- OI declining on price drop
- Outflow > Inflow (money leaves the exchange)
- BTC shows similar pattern
- 4h MACD starts to turn up

**Prohibitive conditions (any one — no entry):**
1. Fresh break of a key daily support
2. Whale ratio <0.8 (whales short)
3. Funding strongly positive (>0.025%)
4. Inflow dominates and rising
5. **Mixed-market momentum trade**: 1D MACD wanders near zero without clear trend AND entry based on momentum signal (breakout, impulse) — momentum doesn't work in chop
6. **Counter-trend in a bearish market**: 1D MACD <0 AND BTC <EMA200 on 1D — longs not considered in this regime
7. **Critical news** (see "Financial news" — prohibitive list)

---

## SHORT entry rules

**Main question:** is there a 2.5-4% downward move (or $60-100 of profit) potential up to TP3?
(v5: lowered from 4-7% to 2.5-4%.)

**Pre-check:** Multi-TF alignment for short. No alignment — no setup.

**Base conditions (at least 3 of 5):**
1. Price at strong resistance (24h high, EMA100 4h, BB upper 4h, historical level)
2. RSI 1h >65 OR RSI 4h >60
3. 4h structure starts to reverse down (LH forming or double top)
4. Whale ratio in Trading Trend <0.8 (whales short) OR declining from >1 to <1
5. 1D trend not catastrophically bullish (no fresh break)

**Bonus confirmations:**
- High positive funding (>0.015%) — longs overheated
- OI rising on price advance (new longs at the highs)
- Inflow > Outflow (money to exchange = sells being prepared)
- BTC shows similar pattern
- 4h MACD starts to turn down
- Long upper wicks on 4h candles

**Prohibitive conditions (any one — no entry):**
1. Fresh break of a key daily resistance
2. Whale ratio >1.3 (whales strongly long)
3. Funding strongly negative (<-0.02%) — shorts already overloaded
4. Outflow dominates and rising
5. **Mixed-market momentum trade** (same wording as long)
6. **Counter-trend in a bullish market**: 1D MACD >0 AND BTC >EMA200 on 1D with a fresh break
7. **Critical news**

---

## RANGE-trade rules (new in v5)

The trend/reversal rules above don't fit choppy sideways markets. Many days the chart sits in a range without a clear trend — v4 silently skipped these. v5 adds an explicit subcategory for them.

**Main question:** is there a clean range with width ≥1.5% (giving ~1.5% potential edge-to-edge for partial-position TPs)?

**Pre-check (replaces multi-TF alignment for ranges):**
1. **4h MACD between −10 and +10** (no clear trend signal)
2. **ATR(14) on 1h declining for at least 24h** (volatility contracting)
3. **Clear horizontal range**: defined high and low, each touched at least 2x with rejection (not breakout) within the last 24-48h
4. **BB(20,2) flat** on 4h (bands not expanding outward)

**Base conditions (at least 2 of 3, range trades have fewer base conditions because the structural setup is more visual):**
1. Last 2-3 touches of the relevant edge were rejections (long upper wicks at top, long lower wicks at bottom)
2. Volume contracts inside the range (not building toward a breakout)
3. RSI 1h between 30 and 70 (not overstretched in either direction)

**Entry rules:**
- **Long at lower edge** with rejection candle on 15m: entry on close of the 15m candle showing rejection
- **Short at upper edge** with rejection candle on 15m: same, mirror
- **SL**: 0.5-1% beyond the range edge (tight, since invalidation = breakout)
- **TP1** (50% of position): midpoint of the range, R:R typically 1:1
- **TP2** (50% of position): opposite edge, R:R typically 1:2
- No TP3 for range trades — once the opposite edge prints, exit fully

**Position size for range trades:** half of normal trend-trade size ($15 risk in graduated tier 1, $20 in tier 2). Lower R:R means lower per-trade reward, so smaller risk keeps the math sane and protects against unexpected breakouts.

**Prohibitive conditions for range trades:**
1. Range width <1.5% (not enough to cover commissions on partial exits)
2. 4h MACD > +20 or < −20 (clear trend, not a range)
3. Breakout already happened (15m candle closed outside range with above-average volume)
4. Long/Short position holder ratio extreme (>2.5 or <0.5) — likely about to break
5. Macro headline within the next 1-2 hours (volatility about to spike, range will break)
6. Critical news (same list as trend trades)

**Target win rate for ranges:** 60-65% (higher than trend trades because the structure is more constrained), with smaller average wins. Net contribution to monthly P&L: ~25-30% of total expected, with the rest from trend setups.

---

## Position sizing

**Formula:** ETH size = (risk $) / (SL distance in points)

**Graduated risk schedule (v5):**

| Phase | Trigger | Risk per trade | Range-trade risk |
|---|---|---|---|
| Tier 1 (initial) | First 30 valid setups | **$30** | **$15** |
| Tier 2 (promoted) | 30 setups complete AND win rate ≥45% | **$40** | **$20** |
| Tier 1 (held back) | 30 setups complete AND win rate <45% | stay at $30, reassess at 50 setups | stay at $15 |
| Tier 0 (demoted) | Loss > $300 in any 7-day window | drop to $20, reassess after 30 more setups | drop to $10 |

**Examples (Tier 1, $30 risk):**

| SL points | ETH size | Margin at 5x | Notional |
|-----------|----------|--------------|----------|
| 25 | 1.2 | $552 | $2,760 |
| 30 | 1.0 | $460 | $2,300 |
| 50 | 0.6 | $276 | $1,380 |
| 100 | 0.3 | $138 | $690 |

**Leverage:** 5x
**Margin per trade:** not more than 50% of capital (relaxed from 40% in v4 to accommodate larger Tier 2 positions)
**After SL:** next trade size 50-70% of normal (unchanged from v4)

**Size adjustment by Impact Score:** if Impact ≥10 against the trade — halve size (see "Financial news" table).

---

## Stop Loss rules

**MANDATORY on every entry. No SL — no entry.**

**Where to place SL for LONG:**
- Below the last significant HL on 4h
- Below a key EMA with 5-10 point buffer
- Below a broken historical level
- Minimum 15-20 points from entry
- Maximum 50-60 points

**Where to place SL for SHORT:**
- Above the last significant LH on 4h
- Above a key EMA with 5-10 point buffer
- Above a broken historical level
- Same distance limits

**Where to place SL for RANGE:**
- 0.5-1% beyond the range edge (tight by design)
- Minimum 10 points (range trades use shorter SLs than trend trades)

**When to trail SL:**
1. After breaking a key level → behind the broken level
2. After TP1 → to breakeven (BU)
3. After TP2 → protect part of the profit (under/above the previous HL/LH)
4. New HL/LH forms on 4h → SL behind that level

**What NOT to do:**
- Don't move SL into loss
- Don't remove SL entirely
- Don't trail SL every 30 minutes
- Don't place SL too close to entry (<15 points for trend, <10 for range)

---

## Take Profit rules

**Standard configuration for trend trades — 3 TP levels (v5 R:R lowered from v4):**

| TP | % of position | R:R (v5) | R:R (v4 was) | Target |
|----|---------------|----------|---------------|--------|
| TP1 | 30% | 1:1 | 1:1 | nearest resistance/support |
| TP2 | 30% | 1:2 | 1:2.5 | next strong level |
| TP3 | 40% | 1:3.5+ | 1:5+ | ambitious target |

**Profit distribution at $30 risk (Tier 1, full TP3):**
- TP1: ~$30 on 30% position = $9 contribution
- TP2: ~$60 on 30% position = $18 contribution
- TP3: ~$105 on 40% position = $42 contribution
- **Total full TP3: $69**
- **Moderate execution (TP1 + TP2 hit, TP3 trailed to BU): $27**

**At Tier 2 ($40 risk):**
- Full TP3: $92
- Moderate execution: $36

**Range trades use 2 TPs (50/50 split):**
- TP1 at midpoint (R:R 1:1) — $15 contribution at Tier 1
- TP2 at opposite edge (R:R 1:2) — $30 contribution at Tier 1
- **Total: $45 if both hit; $7.50 if only TP1**

**TP trailing:**
- Sharp move to TP1 without pullback → push TP3 higher
- Strong level broken on 4h → drop TP, switch to trailing-stop
- Structure continues → add TP4

---

## Minimum movement for entry

**Mandatory:** TP3 potential at least 2.5% from current price (lowered from 4-5% in v4)
- ETH at $2,300 → TP3 at $2,358+ for long, $2,243- for short
- Smaller moves don't justify risk + commissions
- For RANGE trades the minimum is 1.5% range width (different metric)

---

## What we don't trade

- Trend trades with potential <2.5% movement
- Range trades with width <1.5%
- Counter-trend in strong daily trend opposite direction
- When signals contradict (whale ratio one way, funding the other)
- After 2 consecutive SLs in a day — pause until tomorrow
- Without understanding the macro context for the next few days
- Late evening (after 22:00 local) — no new entries
- When self-aware that tired or emotional
- **When multi-TF alignment fails** (trend trades) or **range conditions fail** (range trades)
- **Mixed-market momentum trade** (see prohibitive)

---

## Psychological rules

1. **After SL — pause minimum 2-3 hours** or until next day
2. **After TP — log the lesson in journal** (what worked)
3. **Don't sit over the chart** — the position should work on its own
4. **One instrument** — only ETH
5. **One position at a time** — don't dilute attention (range trade may run alongside an unrelated 4h alert, but never two simultaneous directional bets)
6. **Don't trade for the sake of trading** — skipping a day is normal
7. **Real ≠ ideal** — $30-50 is a good moderate result at Tier 1, don't beat yourself up
8. **Don't manually close a working position out of "concentration anxiety"** — statistically harmful (`risk-management`: success rate 30% on 708 samples)
9. **Trust the routine alerts** — if the scheduled agent flags a setup, trust it as a watch-trigger but still run the manual checklist before entering. Don't enter from notification alone, don't ignore notifications either.

---

## Daily routine (v5 — supplemented with passive monitoring)

### Passive layer (always-on, no human time)

A scheduled remote agent ("paper-trading routine") runs **3x per day at 10:00 / 15:00 / 23:00 ICT** and:
- Fetches Bybit market data
- Computes indicators
- Evaluates strategy rules
- Appends a journal entry to `wiki/trading-journal-v5.md`
- **Sends an email alert** to `hellokbbureau@gmail.com` if a setup is detected

Email push acts as the always-on layer that closes the gap between manual scans. No need to manually check unless an alert arrives or a planned scan window comes up.

### Morning scan (10-15 minutes, ~10:00 ICT)

- Read overnight journal entries (one or two from the routine)
- ETH 1D and 4h — where are we in the big picture?
- BTC for context (synced or diverging?)
- Bybit Data → Trading Trend (whale ratio)
- Funding and OI dynamics
- News check — apply Impact Score formula, write the score for the day's main headline
- Daily decision:
  - Setup exists → prepare for entry
  - No setup → observe
  - Position open → confirm the plan is working

### When a setup appears (10 minutes)

- **Pre-check: Multi-TF alignment** (4h + 1h + 15m same direction) — for trend trades. For range trades — range pre-check (4h MACD near 0, ATR contraction, etc.).
- Entry checklist (≥3 of 5 base conditions for trend, ≥2 of 3 for range)
- Prohibitive check (including news Impact Score)
- Size by formula (with −50% adjustment if Impact ≥10 against the trade, and Tier-aware base)
- Define SL and all TPs before opening
- Enter via limit order to save on commissions
- Set SL and all TPs immediately after fill

### During the position (5 minutes × 2-3 times per day)

- Check that price hasn't broken structure
- Check TP triggers
- After TP1 → SL to breakeven
- New HL/LH forms on 4h → trail SL

### After closing (5 minutes)

- Log to journal: entry, exit, P&L, reasons, lesson
- **Tag with leverage flag**: did the tight SL actually exploit 5x leverage edge, or was 5x irrelevant? (For weekly review.)
- **Tag with Tier**: Tier 1 ($30) or Tier 2 ($40) and which valid-setup count we're at
- Don't trade for the next few hours

### Weekly review (30 minutes, Sunday/Monday)

- How many trades this week
- What % were winners
- Average win / loss
- What worked (success patterns)
- What didn't (failure patterns)
- **Leverage outcome accounting** (carried from v4): separate P&L for trades where 5x actually mattered vs not
- **Tier promotion check**: are we at 30 valid setups? If yes, what's the win rate? Promote to Tier 2 if ≥45%, hold or demote otherwise
- **Range vs trend split**: how much P&L came from each subcategory? Is the range subcategory adding alpha or just noise?
- Need to adjust rules?
- Plan for next week

---

## Commission management

**Main pain:** commissions eat profits on small trades. Even worse in v5 with smaller potential thresholds.

**Minimization rules:**
- Enter via limit order (0.02% maker vs 0.055% taker)
- Don't trade trend setups with <2.5% potential
- Don't trade range setups with <1.5% width
- At TP1 = $30, commissions eat ~$3.30 = 11%
- At TP3 (Tier 1) = $42, commissions eat ~$3.30 = 8%
- At full TP cycle (Tier 1) = $69, commissions eat ~$10 = 14%
- **The bigger the move, the smaller the commission share** — but Tier 1 / range trades are tighter, so commission impact is more visible. Limit orders are non-negotiable.

---

## Target metrics

**Monthly target with discipline (Tier 1):**
- Win rate: 50-60% (trend) + 60-65% (range)
- Average win (trend): $40-60 moderate, $69 full
- Average loss (trend): $30
- Average win (range): $20-30
- Average loss (range): $15
- **Net result target: $200-350/month** (~9-16% of capital)
- **Stretch target: $500/month** (~22% of capital, requires Tier 2 + good catch rate)

**At Tier 2 ($40 risk, post-promotion):**
- Same percentages, larger absolute values
- Net target: $300-500/month sustainable

**If worse — analyze what's wrong**
**If better — record what's working**

---

## TradingView alerts via scheduled routine (new in v5)

Manual alert setup was rejected by the trader as "no way I will bother". The replacement is a scheduled remote agent (set up via the `schedule` skill).

**Routine name:** `eth-paper-journal`
**Schedule:** cron `0 3,8,16 * * *` UTC = 10:00 / 15:00 / 23:00 ICT
**Output channels:**
1. Append entry to `wiki/trading-journal-v5.md` every run (always, even on no-setup runs — for sample size)
2. Email to `hellokbbureau@gmail.com` ONLY when a setup is detected (avoid notification fatigue)

**What the routine evaluates:**
- All conditions in this strategy doc
- EXCEPT: News Impact Score (no reliable feed API) — flagged as "manual verification needed"
- EXCEPT: Whale ratio (no public Bybit Trading Trend API) — same flag

**What the routine doesn't do:**
- Doesn't open trades — alert + journal only
- Doesn't override the manual checklist — the trader still runs through the rules before entering

**Initial test period:** 2 weeks (2026-04-30 to 2026-05-14)
**Decision after 2 weeks:** review journal stats, decide if routine pays off vs noise

---

## What changed vs v4 (changelog)

v5 is a frequency-and-coverage iteration. v4 was disciplined but produced ~5 valid setups per 25 days at a catch rate of 25% = ~$30/month actual P&L. v5 aims for $200-500/month by relaxing thresholds, adding range trades, growing position size on a graduated schedule, and adding always-on monitoring via a scheduled remote agent.

1. **Lowered potential threshold** for trend trades: 4-7% → **2.5-4%**. Captures shorter swings that v4 silently rejected.

2. **Lowered R:R**: minimum 1:3 → **1:2**, target 1:5 → **1:3.5**. TP levels recalibrated: TP1 1:1, TP2 1:2 (was 1:2.5), TP3 1:3.5+ (was 1:5+). More setups become reachable; per-trade win value drops from $80 to $69 full.

3. **Added RANGE-trade subcategory** — entirely new section. Trades horizontal range mean-reversion when 4h MACD ≈ 0, ATR contracting, clear range with rejected edges. Lower per-trade size ($15 Tier 1), higher target win rate (60-65%), 2 TPs not 3. Expected to add ~25-30% of monthly P&L.

4. **Graduated position sizing**: $25 → **$30 (Tier 1) → $40 (Tier 2)** after 30 valid setups with ≥45% win rate. Demotion to $20 if losses > $300 in any 7-day window. Replaces v4's flat $25.

5. **Scheduled remote agent (passive monitoring layer)**: 3x/day automated journal + email alert. Replaces the manual TradingView alerts the trader rejected. Catch rate target: 70%+ of setups (vs ~25% with manual scans only).

6. **Margin per trade relaxed**: 40% → 50% of capital (to accommodate larger Tier 2 positions on tight SL setups).

7. **Psychology rule #9 added** — "Trust the routine alerts but still run the manual checklist". Codifies how to interact with the new automation.

8. **Daily routine restructured** — new "passive layer" subsection at the top, manual scans become supplements rather than the primary monitoring loop.

**What didn't change vs v4:**
- Multi-TF alignment pre-check (still mandatory for trend trades)
- News Impact Score formula and thresholds
- 7 prohibitive conditions for long and short (counter-trend in bearish/bullish, mixed-market momentum, critical news, etc.)
- 5x leverage (still under observation per leverage outcome accounting)
- Main principle "the trade should work on its own"
- Stop Loss placement rules (extended for range trades, but trend rules unchanged)
- Weekly review framework

**What was rejected for v5 (deliberately not included):**
- Removing the "counter-trend in bearish market" prohibitive — empirically too dangerous (`risk-management`: 0-30% success rate, 132+ samples). Even though it blocks all longs in the current regime, we keep it.
- Increasing risk to $60 (Variant 3 from brainstorm) — too aggressive for current capital, would mean 13.6% drawdown on a 5 SL streak.
- Lower R:R to 1:1.5 (Variant 3) — risk-reward asymmetry stops being attractive enough.
- Auto-execution by the routine — violates "decision before entry" principle. The routine alerts, the human enters.

---

## Strategy version history

- v1: first attempt at formalization
- v2: refined timeframes and R:R
- v3: added shorts, weekly review, realistic profit expectations
- v4: multi-TF alignment as pre-check, expanded prohibitive list, formalized news Impact Score, weekly leverage accounting
- **v5 (current):** lowered potential and R:R thresholds, added RANGE-trade subcategory, graduated position sizing ($30 → $40), scheduled remote agent for passive monitoring + email alerts. First strategy version that explicitly targets $300-500/month rather than 8-15% capital growth.
- Future: refine after weekly reviews
