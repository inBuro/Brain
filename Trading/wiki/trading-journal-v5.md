# Trading Journal v5

**Summary**: Append-only journal of every market check (manual scan + scheduled remote agent) under [[strategy-v5]]. Each entry records the market state, the strategy decision, and any hypothetical or real trade outcomes. Source of truth for the 2-week paper-trading test (2026-04-30 → 2026-05-14) and for ongoing weekly review statistics.
**Sources**: [[strategy-v5]], scheduled routine `eth-paper-journal`, manual scans during chat sessions
**Last updated**: 2026-04-30 (initialized with template)

---

This file is **append-only**. Never modify previous entries — only add new ones at the bottom.

The scheduled remote agent (`eth-paper-journal`, 3x/day at 10:00 / 15:00 / 23:00 ICT) auto-appends entries here. Manual entries from chat-session scans are also appended here in the same format.

## Entry template

Every entry follows this format (markdown subsection per check):

```markdown
### YYYY-MM-DD HH:MM ICT — [auto | manual] check

**Price**: $X (Δ Y% 24h)
**Decision**: SETUP_LONG | SETUP_SHORT | SETUP_RANGE | NO_SETUP

**Market state:**
- 24h: high $X, low $Y, turnover $Zb
- 4h structure: <HH/HL/LH/LL summary, last 5 swing points>
- Indicators (1h): RSI X, MACD state, EMA9/26 cross state, BB position
- Indicators (4h): RSI X, MACD state, EMA100 position
- Funding: X%, OI 24h change: Y%
- Top-100 L/S ratio: X (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment (trend): PASS | FAIL (which TF contradicts)
- Range pre-check: PASS | FAIL (4h MACD, ATR, range definition, BB)
- News Impact Score: <X, manual verification required for routine entries>
- Prohibitive conditions: PASS | FAIL (which one)

**Reasoning:**
- <bullet list of what conditions were met and what blocked entry>

**If SETUP detected:**
- Hypothetical entry: $X limit
- SL: $Y (Z points)
- TP1: $A (R:R 1:1) / TP2: $B (R:R 1:2) / TP3: $C (R:R 1:3.5+)
- Position size: ETH = (risk $) / (SL points) — Tier 1 $30 risk
- Email sent: yes | no

**Manual verification needed before entry:**
- News Impact Score (for live news context)
- Whale ratio from Bybit Trading Trend (no public API)
- Trader's eye on drawn trendlines / custom levels
```

## Tier and stats tracking

Updated weekly during review (see [[weekly-review]]):

- **Current tier**: Tier 1 ($30 risk for trend, $15 for range)
- **Valid setups completed**: 0 / 30 (until tier re-evaluation)
- **Win rate so far**: — (need 30+ samples)
- **7-day rolling P&L**: $0 (Tier demotion trigger if < −$300)
- **Range vs trend split**: — / —
- **Routine catch rate**: — (setups detected by routine vs missed)
- **Routine false-positive rate**: — (setups that turned out to fail before manual verification)

## Test period

- **Start**: 2026-04-30
- **End**: 2026-05-14 (2 weeks)
- **Decision after end**: review stats, decide whether to continue routine, refine v5 → v6, or revert to manual-only

---

## Entries

(Empty. First entry will be appended by the scheduled routine or by the manual session that follows v5 launch.)

### 2026-04-30 21:10 ICT — auto check

**Decision**: RUN_ERROR

**Error**: Bybit public REST API is blocked by the sandbox egress allowlist (`api.bybit.com` → "Host not in allowlist"). All seven data fetches (1h/4h/15m/1D klines, funding, OI, ticker) returned empty 21-byte responses. No market data was loaded; no indicators could be computed; no strategy evaluation performed.

**Action required**: The `api.bybit.com` domain must be added to the sandbox egress allowlist (or the routine must be migrated to an environment with unrestricted outbound HTTPS). No email sent (no setup detected). This entry is logged per the hard constraint to always commit even on errors.

---

### 2026-04-30 23:17 ICT — auto check

**Price**: $2,259 (Δ −2.92% 24h)
**Decision**: NO_SETUP

**Data source note**: Bybit REST API remains blocked (egress allowlist). Market data sourced from web search aggregates (Fortune, CoinMarketCap, CoinGecko, Coinotag technical analysis for April 30, 2026). Indicators are estimates derived from published analyses, not computed from raw klines. Precision is lower than a normal API-sourced run; treat indicator values as approximate (±5%).

**Market state:**
- 24h: high ~$2,329, low ~$2,220, volume ~$19.2B USD
- BTC: ~$76,316 — below 200-day EMA ($82,228); has not closed above EMA200 since Oct 2025
- 4h structure: LH/LL bearish trend; price in tight consolidation $2,220–$2,347; Supertrend bearish; no HL forming
- Indicators (1h): RSI ~49 (neutral); MACD negative, below signal line (bearish crossover); price below EMA20 ($2,286) and EMA26/EMA100; BB not clearly at lower edge
- Indicators (4h): RSI ~49–52 (neutral); MACD clearly negative with bearish crossover; EMA100 est. ~$2,310–$2,348; price far below all MAs
- Indicators (1D): RSI ~35 (approaching oversold); Weekly RSI ~28–30 (historically significant cycle-bottom zone); MACD negative (confirmed); EMA200 at $2,617 — price ~16% below
- Funding: Positive in April 2026 (longs paying shorts) — exact % unavailable, manual verification required
- OI 24h change: OI elevated vs early-April baseline (+13% was reported for April); direction of last-24h change unclear — manual verification required
- Top-100 L/S ratio: manual verification needed (no public API)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h shows no HL forming, MACD not crossing up from below 0, RSI ~49 (not exiting <40 zone on 1h); no reversal signal on 15m
- Multi-TF alignment (SHORT): FAIL — RSI ~49 (not exiting >65 zone on 1h), price is near lows/support ($2,253), not at resistance ($2,406 / EMA100); 15m not printing reversal from overbought
- Range pre-check: FAIL — 4h MACD clearly outside [−10, +10] (confirmed bearish trend momentum); band expansion in progress; no clean 2+ touch horizontal range confirmed within 24–48h
- News Impact Score: manual verification required; no critical macro events flagged in searches; "seasonal trends favor bulls" noted (CoinDesk, Apr 30) — informational only
- Prohibitive conditions (LONG): TRIGGERED — Prohibitive #6: 1D MACD <0 AND BTC <EMA200 on 1D (BTC $76,316 vs EMA200 $82,228) → counter-trend bearish regime, longs prohibited

**Reasoning:**
- **LONG — SKIP**: Two independent blockers. (a) Multi-TF alignment fails: 4h in LH/LL structure with no HL forming, MACD deeply negative, no reversal confirmation on 1h or 15m. (b) Prohibitive condition #6 triggered: BTC is firmly below its 200-day EMA; ETH 1D MACD is negative. The strategy explicitly prohibits longs in this macro regime.
- **SHORT — SKIP**: Pre-check alignment fails. RSI is at ~49 — not exiting an overbought zone. Price at $2,259 is near the major pivot support ($2,253), not at a resistance level where a short setup would have structural backing. Only 1–2 of 5 base conditions met (1D trend non-bullish ✓; LH structure partially ✓); minimum 3 required.
- **RANGE — SKIP**: Pre-check fails at first gate: 4h MACD is clearly in bearish trend territory, well outside the [−10, +10] neutral zone required for a range setup. The market is trending down, not consolidating cleanly.
- **Primary blocker**: LONG prohibited by counter-trend regime (BTC <EMA200 + 1D MACD <0). SHORT and RANGE fail their respective pre-checks.
- **Notable context**: Weekly RSI at ~28–30 is a historically significant oversold level (preceded major recoveries in 2018, 2022). Combined with institutional ETF inflows, this could signal a longer-term bottom forming — but the v5 strategy correctly waits for multi-TF reversal confirmation before acting, and that confirmation is absent today.
- **Email sent**: no (NO_SETUP)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate exact % (confirm whether >0.025% would additionally block long, or <−0.02% blocks short)
- News Impact Score — any macro events scheduled in next 1–2h (FOMC, CPI)
- Trader's eye: confirm $2,253 support hold or break; if break → fresh daily support broken (prohibitive #1 for long, but also signals potential short setup at retest of broken level on 4h)
- OI direction last 24h: rising or falling alongside price drop?

---

### 2026-05-01 09:04 ICT — auto check

**Data source**: Web search aggregates (reduced precision — CoinGecko and Binance REST APIs blocked by sandbox egress allowlist; WebFetch returning HTTP 403 on external analysis sites). Indicator values are estimates derived from published technical analyses and web search results. Treat all values as approximate (±5–10%).

**Price**: $2,261 (Δ +0.09% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high ~$2,275, low ~$2,232, volume ~$12.31B USD
- BTC: ~$76,528 — below 200-day EMA (~$82,228); ~7.3% below EMA200; has not closed above EMA200 since Oct 2025
- 4h structure: Tightening triangle / consolidation approx $2,230–$2,380; no clear HL or LH forming; price between support zone ~$2,221–$2,243 and resistance ~$2,348–$2,380; no directional momentum
- Indicators (1h): RSI est. ~51 (neutral); MACD negative, no bullish crossover; price below EMA20 (~$2,286); mid-range consolidation
- Indicators (4h): RSI est. ~40–45 (approaching neutral-oversold boundary); MACD negative, flattening (histogram contracting toward 0); EMA100 est. ~$2,348; price below all major EMAs
- Indicators (1D): RSI ~35 (near oversold); Weekly RSI ~30 (historically significant cycle-bottom zone); MACD negative (confirmed, histogram flattening); EMA20 ~$2,286, EMA50 ~$2,322, EMA100 ~$2,348, EMA200 ~$2,617 — price ~16% below EMA200
- Funding: ~+0.0028% (longs paying; below +0.025% prohibitive threshold)
- OI: ~$4.5B; 24h OI change direction: manual verification needed
- Top-100 L/S ratio: ~67.6% / 32.4% (longs dominant; Bybit Trading Trend whale ratio: manual verification needed)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h shows no HL forming, MACD not crossing up from below 0, price below EMA100 ($2,261 < $2,348); 1h RSI ~51 (not exiting <40 zone); 15m reversal candle not confirmed
- Multi-TF alignment (SHORT): FAIL — RSI ~51 on 1h (not exiting >65 zone); price at $2,261 near support zone, not at key resistance ($2,348+); 4h structure not showing LH formation; no overbought reversal candle
- Range pre-check: FAIL — 4h MACD: uncertain/possibly borderline near -10 to +10 (bearish but flattening, raw value unavailable); ATR: daily $150+ moves (elevated, not confirmed contracting on 1h for 24h+); 24h range $2,232–$2,275 (width ~1.9%, qualifies for width criterion) but 2x edge rejections within 24–48h NOT confirmed; BB(4h) flatness unknown
- News Impact Score: manual verification required; no critical macro events flagged in searches; Ethereum Glamsterdam upgrade (H1 2026 — ETH-specific positive catalyst) noted, no near-term event risk identified
- Prohibitive conditions (LONG): **TRIGGERED — Prohibitive #6**: 1D MACD <0 AND BTC <EMA200 on 1D (BTC $76,528 vs EMA200 ~$82,228) → counter-trend bearish regime; longs prohibited
- Prohibitive conditions (SHORT): CLEAR — Prohibitive #6 for short not triggered (1D MACD not >0, BTC not >EMA200); funding +0.0028% (below -0.02% short trigger); no critical news flagged

**Reasoning:**
- **LONG — SKIP**: Blocked by Prohibitive #6 (counter-trend in bearish market: 1D MACD <0 AND BTC below EMA200 on 1D — identical macro regime to previous two entries). Multi-TF alignment also independently fails: 4h in tightening consolidation with no HL forming, MACD not crossing up, 1h RSI neutral at ~51. Base conditions: ~1 of 4 confirmed (BC5 marginal). Two independent blockers.
- **SHORT — SKIP**: Multi-TF alignment fails. RSI ~51 on 1h — not exiting overbought zone. Price $2,261 is near support zone ($2,221–$2,243), not at resistance ($2,348+). Base conditions: 1 of 5 confirmed (BC5: 1D not catastrophically bullish ✓; BC1 ✗; BC2 ✗; BC3 ✗; BC4 manual). Minimum 3 required.
- **RANGE — SKIP**: Pre-check fails on at least two conditions: (1) ATR elevated ($150+ daily) with only tentative tightening triangle — contraction on 1h over 24h+ NOT confirmed; (2) 24h range $2,232–$2,275 has correct width (1.9%) but 2x confirmed rejection touches at each edge within the required 24–48h window not established. 4h MACD borderline and BB(4h) flatness unknown. Cannot validate pre-check with reduced precision data.
- **Primary blockers**: LONG → Prohibitive #6 (BTC <EMA200 + 1D MACD <0). SHORT → Multi-TF alignment fail + insufficient base conditions. RANGE → Pre-check fail (ATR unconfirmed contraction + range edge rejections not established).
- **Notable context**: Weekly RSI at ~30 is a historically significant cycle-bottom zone (preceded major recoveries in 2018, 2022). Tight 24h consolidation ($43 range, 1.9%) hints at pre-breakout compression. Ethereum Glamsterdam upgrade (H1 2026, gas limit 60M → 200M, ~78% fee reduction target) is an ETH-specific bullish structural catalyst. However, BTC macro bear structure (below EMA200 since Oct 2025) continues to block longs per v5 Prohibitive #6. Strategy correctly waits for BTC regime flip or confirmed multi-TF reversal before enabling longs.
- **Email sent**: no (NO_SETUP)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate confirmation on Bybit (aggregate data shows +0.0028%; verify not approaching +0.025% trigger)
- News Impact Score — any macro events in next 1–2h (FOMC, CPI, Fed Chair speech)
- OI direction last 24h (rising or falling during consolidation)
- Trader's eye: confirm $2,232 24h low held or broken; if $2,221 support breaks → fresh daily support broken (Prohibitive #1 for long); could improve short setup preconditions but alignment still needed
- ATR(1h) 24h trend: manually verify if volatility contracting for range pre-check assessment
- 4h MACD exact values: check on chart to determine if within [-10, +10] for range pre-check
