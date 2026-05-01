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

---

### 2026-05-01 10:28 ICT — auto check

**Data source**: Web search aggregates (reduced precision — CoinGecko and Binance REST APIs blocked by sandbox egress allowlist; WebFetch returning HTTP 403 on most external sites). All indicator values are estimates from published analyses and web-search results. Treat values as approximate (±5–10%).

**Price**: $2,245 (Δ −3.60% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high ~$2,329 (price 24h ago, pre-FOMC level), low ~$2,220–$2,230 (key support zone); volume ~$19.26B USD
- Context: Post-FOMC sell-off continuation. Fed held rates 3.5%–3.75% on April 29 with hawkish tone; 3 of 4 dissenters wanted removal of easing bias — most divided FOMC since Oct 1992. $149.7M ETH futures liquidations (longs $110.3M), 226K ETH flowing to exchanges over 72h, $87.73M ETH ETF outflows on Apr 29.
- BTC: ~$77,051 — below 200-day EMA ($82,228); −6.3% below EMA200; has not closed above EMA200 since Oct 2025
- 4h structure: Tightening triangle compression; LH/LL bearish macro trend; price approaching $2,220–$2,230 support zone; no HL forming; multiple analyses note "imminent compression resolution" without confirming direction
- Indicators (1h): RSI est. ~38–43 (declining with sell-off, approaching oversold); MACD negative, histogram decreasing; price below EMA20/EMA26/EMA100; approaching lower BB on 1h
- Indicators (4h): RSI est. ~38–42 (approaching oversold); MACD bearish, histogram est. ~−1 to −5 (contracting from prior −10s, possibly borderline for range pre-check — manual verification needed); EMA100 est. ~$2,348; price well below all MAs
- Indicators (1D): RSI ~33–35 (oversold territory); Weekly RSI ~30 (historically significant cycle-bottom zone); MACD negative (confirmed); EMA200 at $2,617 — price ~16% below; EMA50 ~$2,322
- Funding: Near neutral to slightly negative (post-liquidation wash of $110.3M longs; exact rate: manual verification needed; est. range −0.01% to +0.01%)
- OI: ~$31B (est., declined ~1.6% from prior $31.5B); declining on price drop = shorts closing / longs washed
- Top-100 L/S ratio: manual verification needed (no public API); long/short ratio reported ~0.97 (marginally short-biased on Binance)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h structure: no HL forming, price in LH/LL continuation; 1h RSI ~38–43 moving downward (not exiting oversold zone on bounce); no 15m reversal candle from confirmed support; 4h MACD not crossing from below 0
- Multi-TF alignment (SHORT): FAIL — price at $2,245 is near key support ($2,220–$2,230), NOT at resistance ($2,300–$2,347); 1h RSI ~38–43 is approaching oversold, not exiting overbought; 15m not showing rejection from an overhead level; no LH forming at resistance
- Range pre-check: FAIL — (1) ATR(1h): likely spiked with today's −3.60% sell-off move; contraction for 24h+ NOT confirmed — today's volatility expansion directly contradicts contraction requirement; (2) Range boundaries: unclear post-FOMC flush; 24h range ($2,220–$2,329 = ~$109, ~4.8% width) is too wide for range-trade category; shorter sub-range ($2,220–$2,300) would be 3.5% = borderline but 2x confirmed edge-rejections not established; (3) 4h MACD borderline/uncertain; (4) BB(4h) flatness: not confirmed
- **News Impact Score**: **26.2** (FOMC April 29 hawkish: Price Impact 7 [major, −3.60%] × Breadth 3× [systemic macro] × Forward 1.25× [trend confirmation of bearish macro]) → For LONG: SKIP threshold (≥20) is **independently triggered** even if Prohibitive #6 were lifted; For SHORT: bearish news score ≥10 is an extra argument, not a blocker
- **Prohibitive conditions (LONG)**: **TRIGGERED — two independent blockers:**
  - **Prohibitive #6**: 1D MACD <0 AND BTC <EMA200 on 1D ($77,051 vs $82,228) → counter-trend bearish regime; longs prohibited
  - **Prohibitive #4**: Inflow dominates and rising — 226K ETH flowing to exchanges over 72h post-FOMC; elevated selling preparation signal
  - (News Impact ≥20 would also independently block, per the financial news threshold, even without #6 and #4)
- **Prohibitive conditions (SHORT)**: CLEAR for known automated checks — Prohibitive #6 for short (1D MACD >0 AND BTC >EMA200 with fresh break) NOT triggered; funding not confirmed < −0.02% (manual check needed); no critical news identified for next 1–2h; no FOMC until June 16

**Reasoning:**
- **LONG — SKIP**: Three independent blockers. (a) Prohibitive #6: BTC firmly below EMA200, ETH 1D MACD negative — exact same macro regime as prior two entries, unchanged. (b) Prohibitive #4: 226K ETH exchange inflows over 72h = inflow dominance triggered. (c) News Impact Score 26.2 ≥ 20 threshold from hawkish FOMC April 29 — structural macro event. Multi-TF alignment also independently fails.
- **SHORT — SKIP**: Multi-TF pre-check alignment fails at the most basic level: price is near the $2,220–$2,230 support zone, not at resistance. RSI ~38–43 is approaching oversold, the opposite of the >65 trigger required for short alignment. Only base condition BC5 (1D not catastrophically bullish) qualifies; BC1 (price at resistance), BC2 (RSI >65/60), BC3 (LH forming) all fail. Score: 1 of 5 base conditions — well below minimum 3. While the macro context (FOMC hawkish, exchange inflows) is bearish, the immediate price action is not at a short-entry location.
- **RANGE — SKIP**: Pre-check fails on two hard conditions: (1) ATR contraction for 24h+ is directly contradicted by today's −3.60% sell-off impulse — volatility expanded; (2) range boundaries have been disrupted: the 24h range ($2,220–$2,329) is ~4.8% wide, too wide for range category; a narrower sub-range ($2,220–$2,300) hasn't had confirmed 2x rejection at both edges in 24–48h. 4h MACD borderline but other pre-check failures are definitive.
- **Primary blockers**: LONG → Prohibitive #6 + #4 + News Impact Score ≥20. SHORT → Multi-TF alignment fail + insufficient base conditions (1/5). RANGE → Pre-check fails (ATR expansion, range undefined post-FOMC flush).
- **Notable context**: (1) Weekly RSI ~30 is a historically significant cycle-bottom signal (preceded recoveries in 2018, 2022). (2) Long/short ratio ~0.97 suggests market balance vs. crowded longs — longs already washed by $149.7M in liquidations. (3) ETH approaching $2,220 key support zone — if this breaks, Prohibitive #1 (fresh break of key daily support) activates for long; could incrementally improve short pre-conditions but alignment still needs to develop at a resistance retest. (4) No FOMC until June 16 — near-term macro calendar relatively quiet. April CPI likely mid-May.
- **Email sent**: no (NO_SETUP)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- ETH funding rate exact % on Bybit (confirm near-neutral vs. extreme — short blocked if < −0.02%)
- OI 24h direction: confirm declining (longs closing = less downward pressure ahead) vs. rising (new shorts loading)
- Trader's eye: $2,220–$2,230 support — does it hold or break cleanly? If breaks with volume → Prohibitive #1 triggers for long; potential short continuation setup but would need LH to form on 4h on retest of broken level
- 4h MACD exact values: confirm whether in [−10, +10] for range pre-check (chart-only verification)
- ATR(1h) 24h trend: verify if volatility contracts again in next 12–24h after today's impulse (range pre-check prerequisite)

---

### 2026-05-01 15:00 ICT — auto check

**Data source**: Web search aggregates (reduced precision — CoinGecko and Binance REST APIs blocked by sandbox egress allowlist; WebFetch returning HTTP 403 on most external analysis sites). All indicator values are estimates from published technical analyses and web-search results. Treat values as approximate (±5–10%).

**Price**: $2,265 (Δ +0.72% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high ~$2,280, low ~$2,220; volume ~$18.3B USD
- BTC: ~$76,533 (+0.32% 24h) — below 200-day EMA ($82,228); −6.9% below EMA200; has not closed above EMA200 since Oct 2025; local resistance cluster $76,707–$77,000
- 4h structure: LH/LL bearish macro trend intact; price recovering from today's $2,220 low; contracting triangle compression zone $2,220–$2,300; no confirmed HL forming; 4h MACD negative but histogram contracting toward zero
- Indicators (1h): RSI est. ~38–42 (recovering from post-FOMC oversold; not exiting <40 zone on confirmed bounce); MACD negative, histogram flattening; price below EMA20/EMA26/EMA100; mid-range recovery from today's support touch
- Indicators (4h): RSI est. ~40–45 (approaching neutral); MACD negative, histogram contracting (moving toward zero from −5 to −15 estimated zone); EMA100 est. ~$2,348; price well below EMA100
- Indicators (1D): RSI ~35 (near oversold); Weekly RSI ~30 (historically significant cycle-bottom zone; preceded major recoveries in 2018, 2022); MACD negative (confirmed, histogram flattening); EMA200 at $2,617 — price ~16% below; EMA50 ~$2,322
- Funding: Near neutral to slightly positive (est. +0.001%–+0.005% post-liquidation washout); exact rate: manual verification needed
- OI: ~$31.1B; 24h direction unclear — manual verification needed
- ETF flows: $87.73M outflows Apr 29; ~$160M cumulative weekly net outflows (BlackRock ETHA $37M, Fidelity FETH $48M); persistent institutional selling pressure

**News Impact Score:**
- FOMC Apr 28–29 (hawkish hold, most divided since Oct 1992) is NOW PAST — no longer a forward-event blocker
- ETH ETF weekly outflows $160M: Price Impact 2 (minor, +0.72% 24h move) × Breadth 1.5× (asset-specific) × Forward 1.25× (trend confirmation, continuing outflows) = **3.75** → informational, below 10 threshold; no size reduction required
- Next key macro event: CPI May 12, 2026 (11 days away) — not an immediate blocker
- No macro events identified in next 1–2h → prohibitive news trigger: CLEAR

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h: LH/LL structure, no HL forming, MACD not crossing from below zero; 1h: RSI ~38–42 recovering but not exiting <40 on confirmed bounce; 15m: reversal candle unconfirmed
- Multi-TF alignment (SHORT): FAIL — 1h RSI ~38–42 recovering from oversold (not exiting >65 zone); price $2,265 sits between support ($2,220) and resistance ($2,280–$2,300); no LH forming at resistance; 15m: no rejection from overhead level confirmed
- Range pre-check: FAIL — (1) ATR(1h) declining 24h+: NOT met — earlier sell-off (~10:00 ICT today, −3.60%) expanded ATR significantly; only ~4–5h of potential re-contraction since the 10:28 ICT low; (2) Clear horizontal range with 2x edge rejections at each side: not established — 24h range $2,220–$2,280 (2.7% width, qualifies on width criterion) but only 1 confirmed touch at lower edge ($2,220 today), upper-edge rejection count unconfirmed; (3) 4h MACD: negative, possibly approaching [−10, +10] boundary — borderline, unconfirmed without raw chart values; (4) BB(4h) flatness: not confirmed flat post-FOMC move
- Prohibitive conditions (LONG): **TRIGGERED — Prohibitive #6**: 1D MACD <0 AND BTC $76,533 < EMA200 $82,228 → counter-trend bearish regime; longs prohibited
- Prohibitive conditions (SHORT): CLEAR — Prohibitive #6 for short (1D MACD >0 AND BTC fresh break above EMA200) not triggered; funding near neutral (below −0.02% extreme); no critical news in next 1–2h

**Reasoning:**
- **LONG — SKIP**: Blocked by Prohibitive #6 (counter-trend bearish regime: 1D MACD <0 AND BTC $76,533 < EMA200 $82,228 by 6.9%). Multi-TF alignment independently fails. Macro regime unchanged from all three prior runs today.
- **SHORT — SKIP**: Multi-TF pre-check fails. 1h RSI ~38–42 is recovering from post-FOMC oversold — the opposite of the >65 overbought-exit requirement. Price at $2,265 is mid-range between support ($2,220) and resistance ($2,280–$2,300+), not at a structural short-entry location. Base conditions: BC5 (1D not catastrophically bullish) ✓; BC1 (price at resistance) ✗; BC2 (RSI >65/60) ✗; BC3 (LH forming at resistance) ✗; BC4 (whale ratio) manual. Score: 1 of 5 confirmed — below minimum 3.
- **RANGE — SKIP**: Pre-check fails on two hard conditions: (1) ATR contraction for 24h+: directly contradicted by today's sell-off impulse; only ~4h of re-contraction observed, far below the 24h+ requirement. (2) Range edge rejections: 24h range $2,220–$2,280 has correct width (2.7%) but only 1 confirmed lower-edge touch ($2,220 today); 2x confirmed rejections at each edge not established. Pre-check conditions 2 and 3 fail definitively; conditions 3–4 are borderline or unconfirmed.
- **Notable context**: Weekly RSI ~30 is historically a major cycle-bottom signal (2018, 2022 precedents). Monthly performance March +7.07% and April +6.95% (per seasonal analysis sources). Contracting triangle on 1h chart signals imminent directional resolution — direction unconfirmed. Price recovered $20 off today's $2,220 low (held support). No FOMC until June 2026; CPI May 12 is the next material risk event (11 days).

**Pending order eligibility:**
- LONG: **BLOCKED** — Prohibitive #6 active (counter-trend bearish macro regime); no pending LONG per pending-orders.md rule #6
- SHORT: **WATCH** — Structural pre-checks not passing; RSI in recovery, not overbought; price not at resistance. Conditions still developing. Re-evaluate if price rallies to $2,280–$2,300 with rejection and 4h RSI approaches 55–60
- RANGE: **WATCH** — Potential range $2,220–$2,280 (2.7% width ✓) but ATR contraction condition requires 24h+ which restarts after today's impulse. Re-evaluate at 23:00 ICT if price holds inside this band through the afternoon/Asia session and ATR shows sustained decline

**Watch conditions for 23:00 ICT run:**
- Range: if price holds $2,220–$2,280 and ATR(1h) shows sustained decline from ~10:30 ICT through 23:00 (≈12h of contraction), range pre-check condition 2 will be partially re-qualifying; still need 2x confirmed edge rejections at both sides
- Short: if price rallies to $2,280–$2,300 with clear rejection candle and 4h RSI reaches ~55–60, SHORT alignment may begin forming; watch for LH on 4h
- Break scenario: if $2,220 breaks with volume before 23:00 → Prohibitive #1 for long activates (fresh daily support break); potential SHORT continuation setup on retest of broken level would need full 15m alignment

**Email sent**: no (NO_SETUP; no pending order eligible)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate exact % on Bybit (confirm near-neutral; short blocked if < −0.02%)
- OI 24h direction (rising = new shorts loading; declining = longs still washing out)
- Trader's eye: confirm $2,220 support held; 4h MACD exact value (within [−10, +10] for range pre-check?); BB(4h) flatness
- ATR(1h) 24h trend: verify if contraction sustains through afternoon/Asia session for range eligibility at 23:00 check

---

### 2026-05-01 23:16 ICT — auto check

**Window status**: OUTSIDE (09:00–17:00 ICT trading window; 23:00 ICT cron run is outside — journal-log only, no email)
**Data source**: Web search aggregates (reduced precision — CoinGecko and Binance REST APIs blocked by sandbox egress allowlist; WebFetch returning HTTP 403 on external analysis sites). Indicator values are estimates derived from published technical analyses and web search results. Treat all values as approximate (±5–10%).
**Price**: $2,258 (Δ ~−0.1% to +0.3% 24h; 24h high $2,275 / low $2,232; volume ~$12.3B USD)
**Decision**: NO_SETUP

**Market state:**
- 24h range: high $2,275, low $2,232 (width ~$43, ~1.9% rolling 24h); price drifted from $2,265 (15:00 ICT) to $2,258 (−$7, ~−0.3%) during Asia session open
- BTC: ~$76,550 — below 200-day EMA ($82,310); ~7.0% below EMA200; has not closed above EMA200 since Oct 2025; May 2026 articles query "Can BTC break EMA200 in May?" — no confirmed break yet
- 4h structure: LH/LL bearish macro trend intact; price in compression zone ~$2,220–$2,280 during Asia session; no HL forming; 4h MACD: negative, histogram contracting toward zero (est. range [−12, −3] — borderline for range pre-check [−10, +10]; exact value: manual chart verification needed)
- Indicators (1h): RSI est. ~42–48 (recovering from post-FOMC oversold ~38–40; no directional impulse in Asia session); MACD negative, histogram flat to marginally negative; price below EMA26/EMA100; mid-range consolidation
- Indicators (4h): RSI est. ~40–45 (approaching neutral-oversold boundary); MACD negative, histogram contracting toward zero; EMA100 est. ~$2,348; price well below EMA100
- Indicators (1D): RSI ~33–35 (near oversold); Weekly RSI ~30 (historically significant cycle-bottom zone; preceded major recoveries in 2018, 2022); MACD negative (confirmed, flattening); EMA200 (ETH) ~$2,617; EMA50 ~$2,322
- Funding rate: reported negative to marginally negative in Asia session ("negative taker buy-sell ratios alongside negative funding rates, signaling bearish near-term sentiment" — web aggregates); exact value: manual verification needed; not confirmed < −0.02% (Prohibitive #3 for short threshold)
- OI: ~$31B est.; Asia session direction: manual verification needed
- ATR(1h): declining since ~10:30 ICT today (FOMC-spike peak); **12.8h of contraction elapsed** as of 23:16 ICT; needs 24h+ for range pre-check → qualifies at ~10:30 ICT May 2 if no spike; current ATR(1h) est. ~$12–18/hr (reduced from spike peak, still above baseline)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h: LH/LL structure, no HL forming, MACD not crossing from below 0; 1h RSI ~42–48 (not exiting <40 zone on confirmed bounce); 15m reversal candle from confirmed support not established
- Multi-TF alignment (SHORT): FAIL — 1h RSI ~42–48 (not exiting >65 overbought zone; opposite of requirement); price $2,258 sits mid-range between support $2,220 and resistance $2,280–$2,300; no LH forming at resistance; 15m not showing rejection from overhead level
- Range pre-check: FAIL — (1) ATR(1h) declining 24h+: NOT met — only 12.8h elapsed since 10:30 ICT spike; threshold not reached until ~10:30 ICT May 2; (2) Clear horizontal range 2x edge rejections each side: lower edge $2,220 — 1 confirmed touch (10:28 ICT today); upper edge $2,275–$2,280 — rejection count unconfirmed; (3) 4h MACD within [−10, +10]: BORDERLINE — histogram contracting, est. [−12, −3]; manual chart check needed; (4) BB(4h) flatness: unconfirmed post-FOMC move
- News Impact Score: near-neutral; no macro events flagged in searches for next 1–2h; Asia session quiet; next key event CPI May 12 (11 days); funding negativity reflects derivatives sentiment, not a news event; no prohibitive headlines identified
- Prohibitive conditions (LONG): **TRIGGERED — Prohibitive #6**: 1D MACD <0 AND BTC $76,550 < EMA200 $82,310 → counter-trend bearish regime; longs prohibited. Fifth consecutive run with this prohibitive active.
- Prohibitive conditions (SHORT): CLEAR for known automated checks — Prohibitive #6 for short not triggered; funding not confirmed < −0.02%; no critical news in next 1–2h

**Reasoning:**
- **LONG — SKIP**: Prohibitive #6 unchanged (BTC $76,550 vs EMA200 $82,310; 7.0% gap; 1D MACD negative). Multi-TF alignment independently fails. Fifth run today with same prohibitive active; no regime change detected in Asia session.
- **SHORT — SKIP**: Multi-TF alignment fails. 1h RSI ~42–48 is mid-range / mildly recovering — the opposite of the >65 overbought-exit requirement. Price $2,258 is between support ($2,220) and resistance ($2,280–$2,300+), not at a short entry location. Base conditions: BC5 ✓ (1D not catastrophically bullish); BC1 ✗ (not at resistance); BC2 ✗ (RSI not >65/60); BC3 ✗ (no LH at resistance); BC4: manual. Score 1/5 — below minimum 3. Asia session negative funding is an atmospheric signal, not an entry trigger.
- **RANGE — SKIP**: Pre-check fails on two hard conditions: (1) ATR(1h) contraction only 12.8h elapsed vs 24h+ required — does not qualify until ~10:30 ICT May 2 if no volatility spike overnight; (2) Edge rejections at both boundaries not established — lower $2,220 has 1 confirmed touch (today's FOMC low), upper $2,275–$2,280 rejection count unconfirmed. 4h MACD borderline and BB(4h) flatness unknown.
- **Primary blockers**: LONG → Prohibitive #6 (BTC < EMA200 + 1D MACD <0). SHORT → multi-TF fail + base conditions 1/5. RANGE → ATR contraction 12.8h < 24h required + edge rejections unconfirmed.
- **Notable context vs 15:00 ICT entry**:
  - ATR clock advancing: 12.8h out of 24h required for range pre-check. If no volatility spike overnight, condition qualifies by ~10:30 ICT May 2.
  - Asia session funding turned negative (vs near-neutral at 15:00 ICT) — mild bearish sentiment lean; watch if deepens below −0.02% (Prohibitive #3 for short).
  - Price drift: −$7 from $2,265 → $2,258; staying within tracked $2,220–$2,280 band.
  - BTC holding $76,550 — no regime shift; same prohibitive picture.
  - Monthly seasonality: May historically +34.7% for ETH (macro tailwind), but current BTC bear structure overrides seasonal bias; Prohibitive #6 is the correct guard.
  - "CRT sweep done" note (coinedition.com): monthly candle swept lows; some analysts interpret as bullish for May recovery — informational context only, no entry signal without regime confirmation.
- **Hypothetical range math (NOT a trade suggestion — pre-check fails)**:
  - Range $2,220–$2,280 (60 pts, 2.7% width ✓)
  - If range qualified: RANGE_LONG entry $2,220 / SL $2,204 (15.5 pts) / TP1 50%@$2,250 (R:R 1:1.9) / TP2 50%@$2,280 (R:R 1:3.9) / Size 0.97 ETH (Tier 1 $15 risk)
  - If range qualified: RANGE_SHORT entry $2,280 / SL $2,296 (16.0 pts) / TP1 50%@$2,250 (R:R 1:1.9) / TP2 50%@$2,220 (R:R 1:3.8) / Size 0.94 ETH (Tier 1 $15 risk)
  - These are INFORMATIONAL — will only become actionable if all range pre-check conditions confirm on chart

**Pending order eligibility:**
- LONG: **BLOCKED** — Prohibitive #6 active; no pending LONG
- SHORT: **WATCH** — conditions still developing; price must rally to $2,280–$2,300+ with rejection candle and 1h RSI → 60+; re-evaluate at 10:00 ICT May 2
- RANGE: **WATCH** — ATR contraction needs ~11.2h more to qualify; edge rejections and 4h MACD need chart confirmation; potential range pending order eligible at 10:00 ICT May 2 if price holds band overnight and all pre-check conditions confirm; time validity would cap at 17:00 ICT May 2 per trading-hours rule

**Watch conditions for 10:00 ICT May 2 morning scan:**
- **Range (primary)**: if price holds $2,220–$2,280 through Asia session tonight with no spikes, ATR contraction reaches 24h by ~10:30 ICT May 2; morning scan should confirm: (1) 2x confirmed rejections at lower $2,220 edge (today's touch + any overnight touch), (2) 2x confirmed rejections at upper $2,275–$2,280, (3) 4h MACD within [−10, +10] on chart, (4) BB(4h) flat; if all pass → potential RANGE_LONG/RANGE_SHORT pending order during the 10:00 ICT window
- **Short**: if ETH rallies overnight to $2,280–$2,300 with clear rejection and 4h LH forming, SHORT alignment may begin; 1h RSI needs to approach 60+ for alignment condition; still needs funding not < −0.02%
- **Break scenario (downside)**: if $2,220 breaks with volume before 10:00 ICT → Prohibitive #1 for long activates; range invalidated; short continuation setup possible on 4h retest of broken level with alignment confirmation
- **Macro calendar**: no events in next 24h; CPI May 12 (11 days); Asia session quiet

**Email sent**: no (OUTSIDE window — 23:00 ICT cron run; no email per trading-hours rule even if setup detected)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate exact % on Bybit (confirm if approaching −0.02% blocker for short; or if funding normalizes overnight)
- OI Asia session direction (rising = new shorts loading; declining = longs washing out further)
- 4h MACD exact value on chart (within [−10, +10] for range pre-check? — critical for morning decision)
- ATR(1h) 24h trend: verify volatility stays contracted through overnight / Asia session (no spike = range pre-check condition 1 qualifies by 10:30 ICT)
- Trader's eye: confirm $2,220 held overnight; $2,275–$2,280 upper edge behavior; count of confirmed rejection touches at each boundary for range eligibility
