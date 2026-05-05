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

---

### 2026-05-02 10:06 ICT — auto check

**Window status**: INSIDE (09:00–17:00 ICT trading window; 10:00 ICT cron run)
**Data source**: Web search aggregates (reduced precision — CoinGecko and Binance REST APIs blocked by sandbox egress allowlist; WebFetch returning HTTP 403 on external analysis sites). Indicator values are estimates derived from published technical analyses and web search results. Treat all values as approximate (±5–10%).
**Price**: $2,291 (Δ +1.5% 24h; est. from multiple sources: $2,286–$2,307)
**Decision**: NO_SETUP

**Market state:**
- 24h: high ~$2,310, low ~$2,232 (Asia session overnight floor); volume ~$12.8B USD
- BTC: ~$77,500 — below 200-day EMA ($82,228); ~5.7% below EMA200; BTC reclaimed $77K overnight per aggregates ("BTC reclaims $77K as April closes strongest ETF month of 2026"); has not closed above EMA200 since Oct 2025; May 2026 is Saturday (weekend — reduced liquidity)
- 4h structure: LH/LL bearish macro trend continues; price recovering from May 1 FOMC low $2,220; possible HL forming on 4h (price bounced $2,220 → $2,291+); unconfirmed without chart — no confirmed HL on 4h yet; 4h "tight bull channel" described in some sources after bounce off 4h 200-period MA; price still below EMA100 ($2,355 est.) and all major daily MAs
- Indicators (1h): RSI est. ~49 (neutral; recovered from ~38–43 during May 1 sell-off); MACD bearish, histogram near zero (contracting from prior −5 to −15 zone); price recovering above EMA9/EMA20 (~$2,282) but below EMA26/EMA100
- Indicators (4h): RSI est. ~44 (approaching neutral); MACD bearish, histogram est. ~−1 (near zero — borderline for range pre-check [-10, +10]); EMA100 est. ~$2,355; price well below EMA100; EMA50 ~$2,322
- Indicators (1D): RSI ~35 (near oversold; historically significant zone); Weekly RSI ~30 (cycle-bottom zone; preceded major recoveries 2018, 2022); MACD negative (confirmed); EMA50 ~$2,322, EMA200 ~$2,617
- Funding: Negative territory (shorts paying longs — bearish derivatives sentiment; per aggregates: "negative funding rates signal bearish near-term expectations"); not confirmed below −0.02% (Prohibitive #3 for short not triggered)
- OI: ~13.5M ETH (declining from 14.4M on Apr 18; market reducing exposure rather than adding); 24h OI direction: manual verification needed
- Day of week: Saturday — reduced cyclical liquidity (no full London/New York session overlap pattern)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h: LH/LL structure, possible HL forming but not confirmed (no chart); MACD not crossed from below 0 (histogram ~−1, still bearish side); 1h RSI ~49 (never exited <40 zone on confirmed bounce; was 38–43, now recovering but without established reversal candle from confirmed support); 15m reversal candle from support not confirmed
- Multi-TF alignment (SHORT): FAIL — 1h RSI ~49, not exiting >65 overbought zone; price $2,291 is well below resistance ($2,348–$2,400); no LH forming at resistance; 15m: no overbought rejection candle; 4h not showing LH at resistance
- Range pre-check: FAIL (borderline on 3 of 4 conditions) — (1) 4h MACD within [−10, +10]: BORDERLINE PASS — histogram est. ~−1.0, likely within zone but needs chart confirmation; (2) ATR(1h) declining 24h+: FAIL — 23.6h elapsed since FOMC spike at 10:30 ICT May 1; 24 minutes short of threshold; (3) Clear horizontal range 2x edge rejections each side: BORDERLINE — lower $2,220: PASS (Apr 30 low + May 1 FOMC low = 2 confirmed touches); upper $2,275–$2,280: BORDERLINE (multiple 24h highs on May 1 at $2,275–$2,280, but current price $2,291 is above upper edge — possible evolution or breakout; unresolved); (4) BB(4h) flat: UNCERTAIN (cannot verify from web data); (5) **Weekend liquidity flag**: Saturday — strategy note explicitly states range trades need cyclical volatility contraction (Asia→London→NY), not "flat-line dead"; today has no London/NY session in full form
- News Impact Score: manual verification required; no macro events identified in next 1–2h; Asia session quiet; next key macro event CPI May 12 (10 days); BTC EMA200 narrative ongoing but informational, not a dated event
- Prohibitive conditions (LONG): **TRIGGERED — Prohibitive #6**: 1D MACD <0 AND BTC $77,500 < EMA200 $82,228 (5.7% gap) → counter-trend bearish regime; longs prohibited. Sixth consecutive run with this prohibitive active. No regime change detected.
- Prohibitive conditions (SHORT): CLEAR for automated checks — Prohibitive #6 for short (1D MACD >0 AND BTC fresh break above EMA200) not triggered; funding not confirmed < −0.02%; no critical news in next 1–2h

**Reasoning:**
- **LONG — SKIP**: Prohibitive #6 unchanged (BTC $77,500 vs EMA200 $82,228; 5.7% gap; 1D MACD negative). Sixth consecutive run with same prohibitive. No regime change overnight. Multi-TF alignment also independently fails: 4h structure shows no confirmed HL formation, MACD not crossing from below 0, 1h RSI never reached <40 zone for valid oversold bounce signal. Base conditions: BC5 ✓ (marginal); BC1, BC2, BC3 ✗; BC4 manual. Score: 1/5 — below minimum 3. Two independent blockers.
- **SHORT — SKIP**: Multi-TF pre-check fails. 1h RSI ~49 is neutral — the opposite of the >65 overbought-exit requirement. Price $2,291 sits well below resistance zone ($2,348–$2,400); no LH forming at resistance; no overbought reversal candle. Base conditions: BC5 ✓; BC1, BC2, BC3 ✗; BC4 manual. Score: 1/5 — below minimum 3. Negative funding is an atmospheric signal and actually works against the short setup (funding negative = shorts overloaded → squeeze risk).
- **RANGE — SKIP**: Pre-check fails on two definitive conditions: (1) ATR(1h) contraction 23.6h of 24h required — 24 minutes technically short; (2) Price $2,291 is above upper range edge $2,280 — range boundary evolution unclear; if overnight move above $2,280 was a clean breakout, range is dead per Prohibitive #3 for range (15m close outside range with volume); (3) Weekend liquidity (Saturday) reduces cyclical session structure that supports range trades — per strategy "not for low-volatility days near holidays/weekends." BB(4h) flatness also unconfirmed. 4h MACD is the one borderline PASS condition.
- **Notable observations vs prior entry**: (1) ATR clock is 23.6h/24h — only 24 minutes short; had overnight been fully quiet, condition would qualify at ~10:30 ICT today. (2) Price moved from $2,258 (23:16 May 1) to $2,291 (+$33, +1.5%) — the overnight/early morning rally drove price above the tracked $2,280 upper range edge, which is the key unresolved variable. (3) Negative funding + declining OI combined is a notable derivatives picture: longs were washed on May 1 ($149.7M liquidations), shorts are now loaded but paying longs (negative funding) — setup for potential short squeeze if price breaks above $2,348+. (4) 1D RSI ~35 and weekly RSI ~30 remain historically significant oversold readings. (5) Saturday = no cyclical London/NY session pattern — reduces reliability of any range-trade setup today even if conditions technically qualify.
- **Primary blockers**: LONG → Prohibitive #6 (BTC < EMA200 + 1D MACD <0). SHORT → multi-TF alignment fail + base conditions 1/5. RANGE → ATR 23.6h/24h + price above upper range edge + weekend liquidity flag.

**Pending order eligibility:**
- LONG: **BLOCKED** — Prohibitive #6 active; no pending LONG under any circumstance
- SHORT: **WATCH** — alignment conditions not met; price must rally to $2,348–$2,400 with 1h RSI approaching 60–65 and LH forming on 4h; re-evaluate at 15:00 ICT
- RANGE: **WATCH (lower confidence due to weekend)** — ATR condition is 24 minutes from qualifying; range boundaries need trader's chart confirmation (especially whether $2,280 break was a true breakout or just range evolution); 4h MACD needs chart verification; Saturday liquidity makes range trade execution riskier today; higher-quality re-evaluation window is Monday 10:00 ICT

**Watch conditions for 15:00 ICT scan:**
- **Range (primary — low weekend priority)**: if price holds within $2,260–$2,330 through midday with no volatility spikes, ATR clock extends to ~27h by 15:00 ICT, satisfying condition 1; trader should confirm 4h MACD and BB(4h) flatness on chart; if range is re-confirmed with $2,220–$2,300 or $2,260–$2,340 as updated boundaries (both have 2x edge touches), a pending order may become eligible — but weekend liquidity caveat applies; time validity would cap at 17:00 ICT today per trading-hours rule
- **Short**: if price rallies to $2,348–$2,380 with clear overbought RSI (1h >60) and LH forming on 4h during London/US session hours (after ~15:00 ICT), SHORT alignment may begin forming; still need 1h RSI to approach 65+ for full alignment
- **Upside break scenario**: if price closes above $2,400 on 4h with volume → potential trend change beginning; longs would still be blocked by Prohibitive #6 unless BTC simultaneously reclaims EMA200
- **Downside scenario**: if $2,220 retested and broken with volume → Prohibitive #1 for long activates; range structure disrupted; short continuation setup possible if LH forms on 4h retest
- **BTC regime watch**: BTC at $77,500 is still 5.7% below EMA200. A move above $80,000 would reduce the gap; actual EMA200 reclaim ($82,228+) would be the regime-change signal enabling LONG setups

**Email sent**: no (NO_SETUP; no pending order eligible; window INSIDE but no actionable setup)

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate exact % on Bybit (confirm negative and not < −0.02% short blocker; deepening negative = short squeeze risk growing)
- OI 24h direction (declining = longs washing out; rising = new shorts loading)
- 4h MACD exact value on chart (within [−10, +10]? — critical for range pre-check; histogram near zero per aggregates but needs chart confirmation)
- ATR(1h) current value and trend on chart (verify no overnight spike invalidated the contraction clock)
- BB(4h) flatness: verify on chart for range pre-check condition 4
- Trader's eye: is $2,280 a true breakout level now, or is price just drifting above it with low volume? Defines whether range is alive ($2,220–$2,280) or evolved/broken; what is the new upper boundary if evolved?
- Weekend volume note: verify if volume is above average on any ETH moves today (if yes, higher chance of a range breakout; if below average, range may still be valid)

---

### 2026-05-02 15:17 ICT — auto check

**Window status**: INSIDE (09:00–17:00 ICT trading window per wiki/trading-hours.md)
**Data source**: Web search aggregates (CoinMarketCap, CoinGecko, CoinDesk, Investing.com summaries — Binance & CoinGecko REST APIs blocked 403; indicators estimated from published analyses, precision ±5%)
**Price**: $2,307 (Δ +0.43–2.09% 24h — conflicting across sources; conservative lower bound used)
**24h range**: High $2,335.71 / Low $2,220.31 (range width $115.40 = 5.0%)
**Volume 24h**: ~$10B (aggregate; sources range $5B–$12.8B)
**Decision**: NO_SETUP

**Market state**:
- BTC: $78,244 — BELOW EMA200 daily ($82,271) by 4.9%; bearish macro regime unchanged
- ETH 4h structure: LH/LL bearish — price rejected supply zone $2,380–$2,400, formed LH; 24h low $2,220 = new LL in the sequence
- ETH below EMA50 daily ($2,322) and EMA200 daily ($2,345) — "Death Cross" zone; both MAs acting as overhead resistance
- RSI(14) 1D: ~35.0 (approaching oversold); RSI 4h: ~41; RSI 1h: ~37 (near oversold — momentum exhausted to the downside)
- MACD: NEGATIVE across 1h / 4h / 1D — below signal line; bearish pressure persisting but stabilising
- ATR(14) daily: ~$84; 1h estimated ~$17
- BB(20,2) approx: upper ~$2,345 / mid ~$2,288 / lower ~$2,230; price between mid and lower = mildly bearish positioning
- Key news: Ether ETF $1.6B inflows (bullish fundamental); BTC ETF $175M outflows (mixed); JP Morgan accepts BTC as collateral; U.S. CLARITY Act stablecoin compromise advancing — mild macro positive
- Funding rate: manual verification needed (no public API)
- Whale ratio: manual verification needed (no public API)
- OI 24h trend: manual verification needed

**Pre-checks**:
- Multi-TF alignment LONG: FAIL — 4h shows no HL forming (LH/LL pattern); 1h RSI at 37, MACD negative, no reversal candle; 15m not showing bounce confirmation
- Multi-TF alignment SHORT: PARTIAL FAIL — 4h bearish (LH/LL, MACD negative) ✓ aligned; but 1h RSI at 37 is NOT exiting the >65 zone (short entry window was at $2,380–$2,400 when RSI >65; timing has passed); 15m RSI near oversold, not rolling from >70 ✗
- Range pre-check: FAIL — 4h MACD clearly negative (outside −10 to +10 range); ATR elevated after $115 directional move (not contracting); no clean horizontal range with dual-edge rejections (directional decline visible); BB(4h) expanding not flat
- Prohibitive #6 for LONG: TRIGGERED — 1D MACD <0 AND BTC <EMA200 daily (seventh consecutive run with this prohibitive active)
- News Impact Score: manual verification needed; no prohibitive headlines detected from aggregates (no hack, no SEC action, no imminent macro headline)

**Reasoning**:
- **LONG — BLOCKED**: Prohibitive #6 remains fully active (BTC $78,244 vs EMA200 $82,271 = 4.9% gap; no meaningful narrowing since prior runs). Multi-TF alignment also fails independently on 4h structure (no HL formation) and 1h/15m momentum. Base conditions: BC5 ✓ (marginal in bearish environment — but this is the weakest pass); BC1 ✗ (price $2,307 not at support — above 24h low); BC2 ✗ (RSI not <40 at 1h level or <45 at 4h level required); BC3 ✗ (no HL forming on 4h); BC4 unknown. Score: 1/5 confirmed. Three independent blockers (prohibitive, alignment fail, <3 base conditions). No path to LONG today.
- **SHORT — NOT CONFIRMED**: The 4h bearish structure is genuine and confirmed — LH/LL pattern with supply rejection is real. However, the short entry window was earlier (ideal: RSI 1h crossing below 65 near $2,380–$2,400). With RSI now at 37 on 1h, we are deep in oversold territory — entering a short here risks catching a bounce. Base conditions: BC3 ✓ (4h LH forming); BC5 ✓ (no catastrophically bullish 1D — it's bearish, passes the non-catastrophic-bullish filter); BC1 ✗ (price not at resistance, $2,307 is $15–38 below nearest resistance at $2,322–$2,345); BC2 ✗ (RSI 1h=37, 4h=41, both far from >65 / >60 thresholds); BC4 unknown. Score: 2/5 confirmed (3 possible if whale ratio favors short, but even 3/5 with partial alignment and RSI-at-oversold risk warrants no entry). Additionally, ETH ETF $1.6B inflows is a significant fundamental contra-signal to new shorts — not prohibitive per rules but noted as counter-argument. SHORT timing has passed for this downward leg.
- **RANGE — NOT APPLICABLE**: Pre-check fails on all four conditions simultaneously. The market is in a directional bearish move, not consolidation. ATR elevated from 5% intraday swings. No defined horizontal range with validated edge rejections present.
- **Context update vs 10:10 ICT run**: ETH rallied from $2,291 (10:10 ICT) to $2,307 (+$16, +0.7%) during the trading session. The watch condition from the prior run — "SHORT if price rallies to $2,348–$2,380 with RSI >60" — has not been triggered; price stalled at ~$2,307–$2,336 (24h high) and did not reach the resistance zone. RSI has not recovered to overbought. Range watch conditions (ATR contraction, BB flat, range edge rejections) remain unmet — the weekend factor from the 10:10 run is now irrelevant (today is Saturday → Monday qualifies; today's assessment stands on structural grounds alone). BTC still has not made a meaningful move toward EMA200.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active
- SHORT: **WATCH** — alignment and base conditions not met; entry zone would be $2,322–$2,350 with RSI 1h recovering to >60; re-evaluate at 23:00 ICT run (note: 23:00 is OUTSIDE window — entry would not be suggested even if setup forms)
- RANGE: **BLOCKED** — pre-check fails; not applicable in current regime

**Watch conditions for 23:00 ICT run and next-morning 10:00 ICT**:
- **SHORT watch (primary)**: if price rallies to $2,345–$2,400 and RSI 1h returns to >60 with 4h LH confirmed at that level → partial alignment forming; full alignment requires RSI >65 on 1h; still need BC1 (at resistance), BC2 (RSI overbought), BC3 (LH confirmed) = 3/5 minimum
- **LONG blocker watch**: BTC needs to close above $82,271 on 1D to remove prohibitive #6; currently 4.9% away — unlikely in this session
- **Bounce scenario**: RSI 1h at 37 is historically a bounce zone; if BTC shows strength (approaches $80,000) and ETH RSI recovers to 50–55, watch for structural HL formation on 4h — does not trigger a setup today but would be the first sign of a regime shift
- **Breakdown scenario**: ETH breaks below $2,220 24h low with volume → range structures disrupted; potential SHORT continuation but with RSI already oversold, risk of whipsaw; do not short into fresh breakdown with RSI <35

**Email sent**: no (NO_SETUP — no email regardless of window status per strategy rules)

**Manual verification needed before next entry**:
- Whale ratio from Bybit Trading Trend (no public API; critical for BC4 both long and short)
- Funding rate exact % (negative = short squeeze risk building; positive = long overload)
- OI direction 24h (rising = new short accumulation; falling = position washout)
- Confirm 4h MACD exact value on chart (is it −5 to −15 range, or deeper negative?)
- Confirm BB(4h) state on chart (flat = range possible; expanding = confirms trend)
- News Impact Score for ETH ETF inflows ($1.6B) applied to any LONG setup: Moderate (±1–3% move) × Asset-specific (1.5×) × Trend confirmation (1.25×) = ~7.5 Impact Score — below 10 threshold, informational only; does not affect sizing but adds bullish argument

---

### 2026-05-03 15:30 ICT — auto check

**Window status**: INSIDE (09:00–17:00 ICT trading window per wiki/trading-hours.md; 15:00 ICT cron run)
**Data source**: Web search aggregates (CoinGecko, CoinMarketCap, Binance, CoinDesk, Investing.com; REST APIs blocked 403). All indicator values estimated from published analyses. Precision ±5–10%. Note: 2026-05-02 23:00 ICT and 2026-05-03 10:00 ICT cron runs produced no log entries — this entry follows directly from 2026-05-02 15:17 ICT.
**Price**: $2,300 (Δ +1.4% 24h; est. range $2,292–$2,324 across sources)
**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,336, low ~$2,232; volume ~$10B USD (declining from $12.8B on May 2)
- BTC: ~$78,350 (+0.02%, sideways); 200-day EMA at $82,271 — BTC is 5.0% below EMA200; no regime change since Oct 2025; BTC daily range $78,040–$79,199
- ETH 4h structure: LH/LL macro bearish (Apr high ~$2,380–$2,400 → LH ~$2,336 May 2 → LL $2,220 May 1 FOMC); possible HL forming if $2,220 holds (April staircase $1,960→$2,050→$2,200→$2,350 noted in aggregates; $2,220 may be new HL in that recovery); price currently mid-range between $2,220 and $2,336; 4h structure remains ambiguous — requires chart confirmation; price below EMA100 4h (~$2,352) and EMA50 1D (~$2,322)
- Indicators (1h): RSI(14) est. ~48 (mid-range, not overbought/oversold); MACD histogram est. ~−1.0 (barely bearish, contracting); BB(20,2): upper ~$2,345 / mid ~$2,278 / lower ~$2,210 (est.)
- Indicators (4h): RSI(14) est. ~42 (recovering from ~38 May 1); MACD histogram est. ~−1.1 — **BORDERLINE IN [−10, +10]: KEY CHANGE vs prior entries** (was est. −5 to −15 on May 2; contracted significantly over 53h of consolidation); EMA100 4h est. ~$2,352 (price well below); BB(4h) flatness: UNKNOWN (cannot verify from web data — critical for range pre-check)
- Indicators (1D): RSI(14) ~35 (near oversold; historically significant cycle-bottom zone; weekly RSI ~30); MACD negative (confirmed), histogram contracting toward zero; EMA50 ~$2,322; EMA200 (ETH) ~$2,617; ETH 12% below 1D EMA200
- ATR(14) 1h: est. ~$12–15 (declining; 53h elapsed since May 1 10:28 ICT FOMC spike — well past 24h threshold for range pre-check)
- Funding: Negative territory (shorts paying longs per aggregates — bearish derivatives sentiment; exact % unknown — manual verification needed; not confirmed < −0.02% short blocker)
- OI: ~13.5M ETH (stable, declining from 14.4M Apr 18; net exposure contracting)
- Top-100 L/S ratio: manual verification needed (no public API)
- Notable macro context: Ether ETF $356M April inflows (fundamental positive); BTC $175M ETF outflows; U.S. CLARITY Act advancing; no prohibitive macro events in next 1–2h identified

**Pre-checks**:
- Multi-TF alignment LONG: FAIL — 4h: LH/LL structure, no confirmed HL, no MACD cross from below 0; 1h RSI ~48 (not exiting <40 oversold zone on confirmed bounce; 15m reversal candle from confirmed support absent
- Multi-TF alignment SHORT: FAIL — 1h RSI ~48 (not exiting >65 overbought zone; opposite of requirement); price $2,300 is mid-range, not at resistance ($2,345–$2,380 zone untouched today); no LH forming at resistance; no overbought 15m rejection candle
- Range pre-check (4 conditions):
  - (1) 4h MACD within [−10, +10]: **BORDERLINE PASS** — histogram est. ~−1.1; within zone if estimate correct; needs chart confirmation
  - (2) ATR(1h) declining 24h+: **PASS** — 53h elapsed since May 1 FOMC spike; no major volatility events identified in May 2–3 period
  - (3) Clear horizontal range, 2x edge rejections each side: **PARTIAL PASS** — lower $2,220–$2,232: 2 confirmed rejections (Apr 30 low + May 1 FOMC low); upper $2,330–$2,336: 1 confirmed rejection (May 2 24h high $2,335.71); needs 2nd rejection to qualify
  - (4) BB(4h) flat: **UNKNOWN** — cannot verify from web aggregates; must be confirmed on chart
  - Pre-check verdict: 1 PASS, 1 BORDERLINE PASS, 1 PARTIAL PASS, 1 UNKNOWN → **OVERALL BORDERLINE FAIL** — insufficient for PENDING_ELIGIBLE; upgraded to WATCH
- News Impact Score: manual verification required; no prohibitive headlines detected; one source notes "symmetrical triangle resolved to upside" — if this is a May 3 breakout signal above $2,336, range Prohibitive #3 may be triggered; must verify on chart
- Prohibitive #6 (LONG): **TRIGGERED — 8th consecutive run** — 1D MACD <0 AND BTC $78,350 < EMA200 $82,271 (gap 5.0%); regime unchanged since 2026-04-30

**Reasoning**:
- **LONG — BLOCKED**: Prohibitive #6 unchanged (BTC $78,350 vs EMA200 $82,271, 5.0% gap; 1D MACD negative; 8th consecutive run with same prohibitive). Multi-TF alignment also independently fails (no HL confirmed on 4h, 1h RSI never exited oversold zone on confirmed bounce). Base conditions: BC5 ✓ (marginal); BC1, BC2, BC3 ✗; BC4 unknown. Score 1/5. No path to LONG until BTC reclaims EMA200 ($82,271+) on daily close OR 1D MACD turns positive (neither plausible in current session: BTC needs +5% from $78,350).
- **SHORT — SKIP**: Pre-check fails on all three timeframes. 1h RSI ~48 is mid-range — opposite of the >65 overbought-exit requirement for short entry. Price $2,300 is mid-range between $2,220 support and $2,345–$2,380 resistance; not at a short entry zone. 4h: LH/LL macro bearish is real but the short entry timing for this downward leg passed on May 1–2 (when RSI was at resistance and overbought). Negative funding (bearish derivatives sentiment) is an atmospheric signal that actually argues against new shorts (squeeze risk). Base conditions: BC5 ✓; BC1, BC2, BC3 ✗; BC4 unknown. Score 1/5.
- **RANGE — WATCH (UPGRADED from BLOCKED in prior entries)**:
  - **KEY CHANGE**: 4h MACD histogram contracted from est. −15 (May 1 FOMC spike) → est. −1.1 (today) over 53h of consolidation. First time this appears to be within the [−10, +10] range pre-check zone since the FOMC event. Range pre-check condition 1 now borderline-passing.
  - ATR(1h) has been declining for 53h, satisfying condition 2 comfortably.
  - Lower edge $2,220–$2,232 has 2 confirmed rejections (conditions 3-lower satisfied).
  - **Remaining gaps**: upper edge $2,330–$2,336 has only 1 confirmed rejection (needs 2nd); BB(4h) flatness is unknown (cannot confirm from web data).
  - Until upper edge gets a 2nd rejection AND BB(4h) is confirmed flat on chart, range pre-check does not fully pass → WATCH, not PENDING_ELIGIBLE.
  - Current price $2,300 is mid-range ($2,278 midpoint) — not at either entry edge today; no immediate range entry opportunity regardless of pre-check status.
  - **Triangle note**: "symmetrical triangle resolved to upside" (web aggregate, exact date unclear) — if this describes a May 3 breakout above $2,336, range Prohibitive #3 would activate; must verify on chart to rule out.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active; no pending LONG order under any circumstance
- SHORT: **WATCH** — conditions developing; entry zone $2,345–$2,380 with 1h RSI approaching >65 + confirmed LH on 4h; re-evaluate 23:00 ICT run (OUTSIDE window) and 10:00 ICT May 4
- RANGE_SHORT (upper edge): **WATCH** — if price rallies to $2,330–$2,336 during US session AND trader confirms (a) this is a 2nd rejection not a breakout, (b) BB(4h) flat on chart → PENDING_ELIGIBLE; informational parameters below
- RANGE_LONG (lower edge): **WATCH** — entry at $2,220–$2,232; current price $2,300 is $68–$80 above lower edge; gap too large for a near-term pending order today; re-evaluate if price approaches lower edge

**Informational range parameters (WATCH status — NOT a pending order suggestion; pre-check not yet confirmed)**:

RANGE_SHORT (upper edge — activates only on 2nd confirmed rejection + BB(4h) flat confirmed):
| Field | Value |
|---|---|
| Direction | RANGE_SHORT |
| Order type | Limit (short) with attached TP/SL |
| Entry price | $2,330 (upper range edge) |
| SL | $2,346 (16 pt — 0.69% above entry; beyond range upper) |
| TP1 (50%) | $2,278 (midpoint; 52 pt; R:R 1:3.2) |
| TP2 (50%) | $2,220 (lower edge; 110 pt; R:R 1:6.9) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Status | WATCH — not PENDING_ELIGIBLE; pre-check incomplete |

RANGE_LONG (lower edge — activates only if price returns to $2,220 + all pre-checks confirmed):
| Field | Value |
|---|---|
| Direction | RANGE_LONG |
| Order type | Limit (long) with attached TP/SL |
| Entry price | $2,220 (lower range edge) |
| SL | $2,204 (16 pt — 0.72% below entry; beyond range lower) |
| TP1 (50%) | $2,278 (midpoint; 58 pt; R:R 1:3.6) |
| TP2 (50%) | $2,336 (upper edge; 116 pt; R:R 1:7.2) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Status | WATCH — current price $2,300 is $80 above entry; not actionable today |

**Watch conditions for 23:00 ICT run (OUTSIDE window — no email even if setup detected)**:
- **RANGE_SHORT trigger**: if price rallies to $2,330–$2,340 and is rejected (rejection candle on 15m, no close above $2,340 on 4h) → 2nd upper edge rejection confirmed → condition 3 passes; if trader concurrently confirms BB(4h) flat → full range pre-check PASS → RANGE_SHORT PENDING_ELIGIBLE at next morning's 10:00 ICT run
- **Triangle/breakout watch**: if 4h candle closes above $2,340 with above-average volume → Prohibitive #3 for range activates (range broken); note as potential trend change beginning (LONG alignment may start forming — Prohibitive #6 still blocks until BTC >$82,271)
- **BTC regime watch**: BTC at $78,350, needs +5.0% to EMA200 $82,271; monitor direction; above $80,000 = gap narrowing; daily close above $82,271 = regime change, LONG setups become evaluable
- **Short watch**: if price reaches $2,345–$2,380 with 1h RSI recovering to >60 and 4h LH confirmed → SHORT alignment beginning; full alignment requires RSI 1h >65 + LH on 4h at resistance
- **Downside watch**: if $2,220 retested → 3rd confirmed lower edge rejection; range_long eligibility strengthens; does not trigger SHORT (RSI would be at oversold again, not setup condition)

**Email sent**: no (NO_SETUP — window INSIDE but no actionable setup and no PENDING_ELIGIBLE direction; hard constraint: no email on pure NO_SETUP)

**Manual verification needed before next entry**:
- Whale ratio from Bybit Trading Trend (no public API; BC4 for long and short)
- Funding rate exact % on Bybit (confirm negative; is it approaching −0.02% short Prohibitive #3 threshold?)
- 4h MACD exact value on chart (CRITICAL: verify histogram is within [−10, +10]; est. −1.1 but actual may differ — this is the gate condition for range pre-check)
- BB(4h) flatness on chart (CRITICAL: condition 4 of range pre-check; must be verified before any range trade)
- Upper range edge $2,330–$2,336 on chart: confirm rejection count; verify whether May 2 high was a true wick rejection or a consolidation closing; identify if a 2nd rejection has occurred since
- ATR(14) 1h on chart: confirm declining trend; verify no spike since May 2 15:00 ICT
- "Symmetrical triangle resolved to upside" note: verify on chart whether this describes a current May 3 breakout above $2,336 (range invalidation) or historical April recovery context
- OI direction over last 24h (rising = new positions being built; falling = washout continuing)
- Trader's eye: is $2,220 a range floor or a macro HL in a recovery trend? This structural interpretation changes the trade thesis significantly

---

### 2026-05-03 23:07 ICT — auto check

**Window status**: OUTSIDE (23:07 ICT > 17:00 ICT — 23:00 ICT cron run is outside the 09:00–17:00 ICT trading window per wiki/trading-hours.md. Journal entry produced; no email regardless of setup status.)
**Data source**: Web search aggregates (CoinGecko, CoinMarketCap, Investing.com, LatestLY, coinotag; REST APIs blocked 403). Indicator values estimated from published analyses. Precision ±5–10%.
**Price**: $2,315 (Δ +0.91% 24h; up $15 from $2,300 at 15:30 ICT run; est. 24h range $2,232–$2,340)
**Decision**: NO_SETUP

**Market state**:
- ETH: $2,315, up $15 (+0.65%) since last run at 15:30 ICT; 24h volume ~$6.3B (declining from ~$10B on May 2); 24h change +0.91%
- ETH sits between range midpoint ($2,279) and upper edge ($2,330–$2,336); EMA50 1D confirmed at $2,322 (ETH $7 below); EMA100 4h est. $2,352 (ETH $37 below)
- BTC: ~$78,400 (+0.02% 24h), virtually unchanged vs 15:30 run ($78,350); daily range $78,040–$79,199; EMA200 1D at $82,271 — BTC is $3,871 / 4.9% below; multiple May 2026 headlines confirm BTC has not broken EMA200
- BTC momentum: MACD 1D histogram negative; RSI estimated 4h ~60 (neutral-bullish on shorter TF, does NOT change 1D regime); no bullish regime change
- ETH RSI(14): 1h est. ~51 (neutral; slight recovery from ~48 at 15:30 as price drifted +$15); 4h est. ~43 (recovering, below 45 threshold for long condition but not at short threshold); 1D = 35.05 (confirmed via Investing.com/altindex — near oversold; historically significant cycle zone, same as prior entries)
- ETH MACD(12,26,9): 4h histogram est. ~−0.8 (contracting further from −1.1 at 15:30; firmly borderline in [−10, +10] zone; weak bearish)
- ETH BB(20,2) 1h est: upper $2,348 / mid $2,295 / lower $2,242; price at $2,315 is between mid and upper, within normal range
- ATR(14) 1h: est. ~$12 (declining ~68h since May 1 FOMC spike; comfortably past the 24h threshold for range pre-check condition 2)
- OI, funding, whale ratio: manual verification needed (no public API access)
- Notable: upper range edge $2,330–$2,336 NOT touched in this session (price peaked ~$2,315–$2,318); no new rejection of upper edge added since May 2

**Pre-checks**:
- **Multi-TF alignment LONG**: FAIL — 4h structure still LH/LL macro bearish; no confirmed HL; no MACD cross from below 0; 1h RSI ~51 (not exiting <40 zone on confirmed bounce — never reached oversold); no 15m reversal candle from identified support
- **Multi-TF alignment SHORT**: FAIL — 1h RSI ~51 (opposite of >65 overbought-exit requirement); price $2,315 is mid-range, not at resistance zone ($2,330–$2,336 / $2,345–$2,380 untouched today); no LH forming at resistance; 15m short confirmation absent
- **Range pre-check** (4 conditions):
  - (1) 4h MACD in [−10, +10]: **BORDERLINE PASS** — histogram est. ~−0.8; within zone if estimate correct; chart confirmation mandatory
  - (2) ATR(1h) declining 24h+: **PASS** — ~68h of decline since May 1 FOMC spike; no volatility events since
  - (3) Clear horizontal range, 2× edge rejections each side: **PARTIAL FAIL** — lower $2,220–$2,232: 2+ confirmed rejections (Apr 30 low + May 1 FOMC + May 3 low $2,232) ✓; upper $2,330–$2,336: **still only 1 confirmed rejection** (May 2 high $2,335.71); price at $2,315 did not reach upper edge today → 2nd upper rejection NOT confirmed
  - (4) BB(4h) flat: **UNKNOWN** — cannot verify from web aggregates; critical condition for range pre-check
  - Verdict: **BORDERLINE FAIL** — conditions 1 and 2 pass; upper edge short by 1 rejection; BB(4h) unverified; WATCH maintained
- **Prohibitive #6 (LONG)**: **TRIGGERED — run #9** — BTC $78,400 < EMA200 $82,271 (4.9% gap; 1D MACD negative confirmed; no headlines suggest regime change before tomorrow)

**Reasoning**:
- **LONG — BLOCKED**: Prohibitive #6 unchanged for the 9th consecutive run. BTC 4.9% below 1D EMA200; 1D MACD negative. ETH 1h RSI ~51 and 4h ~43 are both below the oversold thresholds needed for long base conditions (BC2: RSI 1h <40 or 4h <45 — 4h at 43 is borderline but no confirmed bounce). Multi-TF alignment independently fails. No path until BTC daily closes above $82,271 (needs +4.9% from current) OR 1D MACD turns positive (not plausible in one session).
- **SHORT — WATCH**: No setup. RSI 1h ~51 is mid-range — opposite of the ≥65 overbought exit required for short entry. Price $2,315 is ~$15–$18 below the upper edge and ~$30–$65 below the short entry zone ($2,345–$2,380). Negative funding continues to act as a squeeze warning against aggressive shorting. 4h LH confirmation at resistance would be the trigger — not present tonight.
- **RANGE — WATCH (unchanged from 15:30)**: The mild upward drift from $2,300 to $2,315 has brought price closer to the upper range edge ($2,330–$2,336) but has not tested it. No 2nd upper rejection has been added. Until the upper edge is tested and rejected again AND BB(4h) is confirmed flat on chart, range pre-check cannot be declared fully passing. Current price $2,315 is also not at either actionable entry edge (lower $2,225 or upper $2,333), so even if pre-check somehow cleared tonight, there is no live entry point.
- **Context shift since 15:30**: The only change is a mild $15 drift upward in price and ~7.5h of additional low-volatility consolidation (ATR declining further). No structural changes. The range watch remains exactly as described in the 15:30 entry; no new data contradicts or confirms the pending conditions.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active; no pending LONG
- SHORT: **WATCH** — entry zone $2,345–$2,380 with 1h RSI approaching >65 and 4h LH confirmed; not eligible tonight
- RANGE_SHORT (upper edge): **WATCH** — pre-check condition 3 (upper edge 2 rejections) and condition 4 (BB(4h) flat) both unmet; informational parameters below for reference
- RANGE_LONG (lower edge): **WATCH** — price $2,315 is $90 above lower entry $2,225; not actionable; zone gap too large for near-term pending

**Informational range parameters (WATCH status — NOT pending order suggestions; window OUTSIDE in any case)**:

RANGE_SHORT (activates only on: 2nd upper rejection confirmed + BB(4h) flat confirmed + window INSIDE):
| Field | Value |
|---|---|
| Direction | RANGE_SHORT |
| Order type | Limit (short) with attached TP/SL |
| Entry price | $2,333 (upper edge midpoint) |
| SL | $2,349 (16 pt — 0.69% above entry; beyond $2,336 range upper) |
| TP1 (50%) | $2,279 (54 pt; R:R 1:3.4) |
| TP2 (50%) | $2,225 (108 pt; R:R 1:6.8) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Status | WATCH — NOT actionable; re-evaluate at 10:00 ICT May 4 |

RANGE_LONG (activates only if: price returns to $2,220–$2,232 + all pre-checks confirmed + window INSIDE):
| Field | Value |
|---|---|
| Direction | RANGE_LONG |
| Order type | Limit (long) with attached TP/SL |
| Entry price | $2,225 (lower edge midpoint) |
| SL | $2,209 (16 pt — 0.72% below entry; beyond $2,220 range lower) |
| TP1 (50%) | $2,279 (54 pt; R:R 1:3.4) |
| TP2 (50%) | $2,333 (108 pt; R:R 1:6.8) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Status | WATCH — price $2,315 is $90 above entry; not actionable |

**Watch conditions for 10:00 ICT May 4 (next morning run — INSIDE window)**:
- **RANGE_SHORT trigger**: if price tests $2,330–$2,336 overnight or early morning and is rejected (rejection wick or 15m candle closing back below $2,330 with volume) → 2nd upper edge rejection confirmed; if BB(4h) also flat on chart → range pre-check FULLY PASSES → RANGE_SHORT becomes PENDING_ELIGIBLE at 10:00 run; email alert would be sent
- **RANGE breakout watch**: if 4h candle closes above $2,340 with above-average volume overnight → Prohibitive #3 for range activates (range broken upward); re-evaluate as possible LONG alignment beginning (Prohibitive #6 still blocks; BTC regime change required first)
- **RANGE_LONG watch**: if ETH drops back to $2,220–$2,232 overnight → 3rd lower edge rejection (strengthens range thesis); still requires upper edge 2nd rejection and BB(4h) to be confirmed before any pending order
- **BTC regime watch**: BTC at $78,400 needs +4.9% to $82,271 EMA200; direction of BTC overnight will set the tone for May 4 morning; close above $80,000 = gap narrowing meaningfully
- **SHORT watch**: needs price rally to $2,345–$2,380 with 1h RSI >65 and 4h LH forming; not expected overnight from current $2,315 without a catalyst

**Email sent**: no (OUTSIDE trading window — 23:00 ICT cron is always non-email run per wiki/trading-hours.md; additionally decision is NO_SETUP)

**Manual verification needed at next morning scan (10:00 ICT May 4)**:
- Whale ratio from Bybit Trading Trend (no public API; critical for BC4 long and short)
- Funding rate exact % on Bybit (is it near/above −0.02% which would trigger short Prohibitive #3?)
- 4h MACD exact value on chart (CRITICAL: verify histogram is truly within [−10, +10]; est. −0.8 but actual may differ — gate condition for range pre-check)
- BB(4h) flatness on chart (CRITICAL: range pre-check condition 4; cannot substitute with web data)
- Upper edge $2,330–$2,336: has an overnight 2nd rejection occurred? (This is the key question for May 4 morning)
- OI direction 24h (rising = new positions building; falling = continued washout)
- BTC overnight behavior: did it break $80,000 or fall toward $75,000?

---

### 2026-05-04 10:08 ICT — auto check

**Window status**: INSIDE (09:00–17:00 ICT trading window; 10:00 ICT cron run)
**Data source**: Web search aggregates (CoinGecko, CoinMarketCap, MetaMask, Bybit published data, coinotag, Investing.com; REST APIs blocked 403). All indicator values estimated from published analyses. Precision ±5–10%.
**Price**: $2,329 (Δ +0.60% 24h; up $14 from $2,315 at 23:07 ICT May 3)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2,334, low $2,299, volume ~$8.78B USD (declining from ~$10B on May 3)
- BTC: ~$79,900 (median of MetaMask $79,722 / OKX $80,058); EMA200 1D ~$82,228; gap ~$2,330 (~2.83%) below EMA200; BTC rallied +1.9% overnight from $78,400 — most meaningful gap-narrowing since Apr 28 FOMC; approaching $80,000 psychological resistance; has not closed above EMA200 since Oct 2025; BTC MACD 1D: negative
- ETH 4h structure: LH/LL bearish macro trend intact; 72h consolidation band $2,220–$2,336; no confirmed HL on 4h; price now **above EMA50 1D ($2,322) by +$7** — first EMA50 1D reclaim since macro bearish phase began; still below EMA100 4h (~$2,352) and EMA200 1D (~$2,617 for ETH)
- Indicators (1h): RSI est. ~53 (neutral-recovering; up from ~51 at 23:07 May 3); MACD histogram est. ~−0.5 to −0.9 (contracting, near zero); BB(20,2) est: upper ~$2,348 / mid ~$2,295 / lower ~$2,242; price between mid and upper band
- Indicators (4h): RSI est. ~44 (recovering toward neutral); MACD histogram est. ~−0.9 (**borderline within [−10, +10]** — 71.7h of contraction since May 1 FOMC spike); EMA100 4h est. ~$2,352 (price below by ~$23)
- Indicators (1D): RSI(14) 35.05 (confirmed via multiple sources; near oversold; weekly RSI ~30, historically significant cycle-bottom zone); MACD negative (confirmed, histogram flattening); EMA50 1D ~$2,322; EMA200 (ETH) ~$2,617
- ATR(14) 1h: est. ~$11 (declining for 71.7h since May 1 10:28 ICT FOMC spike; well past 24h threshold)
- BB(4h): UNKNOWN — cannot verify from web aggregates; CRITICAL for range pre-check
- Funding: negative territory (shorts paying longs per aggregates); exact % unknown; not confirmed < −0.02% (Prohibitive #3 for short not triggered)
- OI: ~13.5M ETH (stable/marginally declining since Apr 18 peak 14.4M; net exposure contraction)
- Notable news: (1) Bitmine purchased 101,901 ETH (~$236M) — largest institutional buy of year; (2) separate whale cluster: 61,000 ETH ($171.15M) purchased from Binance; (3) Spot ETH ETF outflows ~$184M over 4 days; (4) long-term holders showing persistent net withdrawals from exchanges (accumulation signal)

**Pre-checks:**
- Multi-TF alignment (LONG): FAIL — 4h: LH/LL structure, no confirmed HL, MACD not crossing from below 0; 1h RSI ~53 (not exiting <40 oversold zone on confirmed bounce); no 15m reversal candle from identified support
- Multi-TF alignment (SHORT): FAIL — 1h RSI ~53 (not exiting >65 overbought zone, opposite of requirement); price $2,329 is at the upper range edge but below structural short resistance ($2,345–$2,380); no LH forming at resistance; no overbought 15m rejection candle
- Range pre-check (4 conditions):
  - (1) 4h MACD in [−10, +10]: **BORDERLINE PASS** — histogram est. ~−0.9; within zone if estimate correct; chart confirmation mandatory
  - (2) ATR(1h) declining 24h+: **PASS** — 71.7h of decline since May 1 10:28 ICT; no volatility spikes detected May 2–4
  - (3) Clear horizontal range, 2x edge rejections each side:
    - Lower $2,220–$2,232: **PASS** — 3 confirmed rejections (Apr 30 24h low; May 1 FOMC low $2,220; May 3 low ~$2,232)
    - Upper $2,330–$2,336: **BORDERLINE PASS** — (1st) May 2 24h high $2,335.71; (potential 2nd) today's 24h high $2,334 with current price $2,329 (−$5 pullback from high); CANNOT confirm rejection-candle close below $2,330 from web data alone
  - (4) BB(4h) flat: **UNKNOWN** — CRITICAL unresolved condition; cannot substitute with web aggregates
  - Pre-check verdict: 3 of 4 conditions borderline-passing; condition 4 unknown → **BORDERLINE WATCH (not PENDING_ELIGIBLE)**
  - Width note: Range $2,220–$2,336 = 5.09% width — above soft guideline (~3.5% where strategy says "look at trend rules"); explicit prohibitives not triggered; range characterisation supported by 71.7h ATR contraction and MACD near zero; flagged for manual assessment
- News Impact Score:
  - Bitmine 101,901 ETH purchase: (2 × 1.0) × 1.0 = **2.0** — informational, no size reduction
  - ETF outflows ~$184M / 4 days: (2 × 1.5) × 1.25 = **3.75** — informational, no size reduction
  - No prohibitive headlines: no ETH core hack; no SEC/regulatory action; no FOMC/CPI in next 1–2h (CPI May 12; next FOMC June 16–17)
- Prohibitive conditions (LONG): **TRIGGERED — 10th consecutive run** — 1D MACD <0 AND BTC ~$79,900 < EMA200 ~$82,228 (gap 2.83%) → counter-trend bearish regime; longs prohibited
- Prohibitive conditions (SHORT): CLEAR for automated checks — Prohibitive #6 for short not triggered; funding not confirmed < −0.02%; no critical news in next 1–2h

**Reasoning:**
- **LONG — BLOCKED**: Prohibitive #6 unchanged (BTC ~$79,900 vs EMA200 ~$82,228; 2.83% gap; 1D MACD negative; 10th consecutive run). BTC rallied +1.9% overnight — the gap has narrowed from 6.4% → 2.83%, the most meaningful EMA200 approach since Apr 28. ETH reclaiming EMA50 1D ($2,329 > $2,322) is the first structural improvement since the bearish phase began. However, Prohibitive #6 overrides all LONG setups until BTC closes above ~$82,228 on 1D. Multi-TF alignment independently fails (no confirmed HL on 4h, MACD not from below 0, 1h RSI never exited oversold on a confirmed bounce).
- **SHORT — WATCH**: No setup. RSI 1h ~53 is neutral-recovering — the opposite of the ≥65 overbought-exit requirement. Price at the upper range edge is a structural location but not a momentum-overbought entry zone. Base conditions: BC5 ✓; BC1 ✗ (range edge ≠ resistance); BC2 ✗ (RSI far from >65/60); BC3 ✗ (no LH at resistance); BC4 manual. Score: 1/5 — below minimum 3. Negative funding continues to signal short-squeeze risk; institutional whale accumulation (~163K ETH / ~$407M) is a contra-signal for aggressive shorts.
- **RANGE — WATCH (HIGHEST PRIORITY — MOST ACTIONABLE STATE OF ENTIRE TEST PERIOD)**:
  - Condition 2 (ATR 24h+): CONFIRMED ✓ — 71.7h
  - Condition 3-lower (edge rejections): CONFIRMED ✓ — 3 rejections
  - Condition 1 (4h MACD in zone): BORDERLINE ✓ — est. −0.9, within range; needs chart
  - Condition 3-upper (2nd rejection): BORDERLINE ✓ — 24h high $2,334 in edge zone; current $2,329 is −$5 below; likely a 2nd rejection but needs candle confirmation
  - Condition 4 (BB(4h) flat): **UNKNOWN** — the single remaining gate condition preventing PENDING_ELIGIBLE
  - Current price $2,329 is only $4 below the entry level ($2,333) and $7 below the upper boundary ($2,336). This is the most actionable state the range setup has been in during the test period.

**⚠️ TRADER ACTION — INSIDE WINDOW — CHECK CHART NOW:**
If you are looking at your chart: (1) Is BB(4h) flat (bands not expanding)? (2) Did the $2,334 high today produce a 15m candle that closed back below $2,330? If BOTH = yes → enter RANGE_SHORT now (per parameters below). Price is at the entry zone. Time validity caps at 17:00 ICT today.

**Pending order eligibility:**
- LONG: **BLOCKED** — Prohibitive #6 active
- SHORT: **WATCH** — entry zone $2,345–$2,380 with RSI 1h >65 and 4h LH confirmed; not eligible today
- RANGE_SHORT: **WATCH → PENDING_ELIGIBLE if BB(4h) flat + $2,334 high was rejection candle confirmed on chart**

**Informational range parameters (WATCH status — NOT a formal pending order suggestion; conditional on BB(4h) flat confirmed on chart):**

RANGE_SHORT (upper edge — activates when: BB(4h) flat confirmed + today's $2,334 high confirmed as rejection close below $2,330 + price still ≤ $2,336):

| Field | Value |
|---|---|
| Direction | RANGE_SHORT |
| Order type | Limit (short) with attached TP/SL |
| Entry price | $2,333 (upper edge midpoint) |
| SL | $2,349 (16 pt — 0.69% above entry; beyond $2,336 range upper + buffer) |
| TP1 (50%) | $2,279 (54 pt; R:R 1:3.4) |
| TP2 (50%) | $2,225 (108 pt; R:R 1:6.8) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Time validity | Cancel by 17:00 ICT today (window cap per trading-hours rule) |
| Status | WATCH — NOT actionable without chart confirmation of BB(4h) flat |

**Cancel manually if:**
- Price closes above $2,340 on a 4h candle with above-average volume (range breakout — invalidates setup)
- BTC falls below $77,000 (macro breakdown risk; range may follow lower)
- BTC closes above $82,228 EMA200 on 1D (regime change — Prohibitive #6 removed; cancel range short, re-evaluate LONG)
- Macro headline appears before fill (FOMC speaker, surprise CPI, crypto regulatory action)
- Whale ratio shifts to >1.3 (whales strongly long — upper range break risk)

**Manual verification needed before fill:**
1. News Impact Score from Bybit Feed (primary gate before any entry)
2. Whale ratio from Bybit Trading Trend — if >1.3: do not enter range short
3. **BB(4h) flatness on chart — CRITICAL single gate condition automated run cannot verify**
4. Confirm today's $2,334 high resulted in closed candle(s) rejecting below $2,330 (true rejection, not just intraday high)
5. Trader's drawn trendlines and custom levels — check for any active breakout trendline above $2,333

**Email sent**: no (NO_SETUP — range pre-check not confirmed; WATCH status does not trigger email per hard constraints; window is INSIDE but neither decision is SETUP_* nor is eligibility PENDING_ELIGIBLE)

**Watch conditions for 15:00 ICT run:**
- **RANGE_SHORT (primary, INSIDE window)**: if price holds $2,310–$2,336 through midday without a 4h close above $2,340 → upper edge still intact; 15:00 ICT run will reassess upper rejection confirmation and BB(4h) status; if conditions confirmed → RANGE_SHORT becomes PENDING_ELIGIBLE at 15:00 run with time validity capping at 17:00 ICT today (tight window — only 2h validity left by 15:00)
- **BTC regime watch (highest longer-term priority)**: BTC ~$79,900 approaching $80,000 resistance; a daily close above $82,228 EMA200 removes Prohibitive #6 and opens LONG evaluations for the first time since Oct 2025; this would be a regime-change event
- **SHORT watch**: if price rallies to $2,345–$2,380 with RSI 1h recovering to >65 and 4h LH confirmed at that level → SHORT alignment begins developing; not expected from $2,329 without a catalyst
- **Downside watch**: if $2,299 (today's low) breaks → range lower boundary retest; if $2,220 retested → 4th lower rejection; RANGE_LONG parameters: entry $2,225, SL $2,209 (16pt), TP1 50%@$2,279 (R:R 1:3.4), TP2 50%@$2,333 (R:R 1:6.8), 0.94 ETH

**Manual verification needed before next scan:**
- Whale ratio from Bybit Trading Trend (no public API; critical for any entry decision)
- Funding rate exact % on Bybit (confirm negative; deepening toward −0.02% = short Prohibitive #3 approaching; positive = longs re-entering, supportive of range upper hold)
- **BB(4h) flatness on chart — single gate condition that determines RANGE_SHORT eligibility**
- 4h MACD exact value on chart (verify within [−10, +10]; est. ~−0.9)
- Did today's $2,334 high produce a rejection candle with close below $2,330? (Determines 2nd upper edge confirmation)
- OI direction 24h (rising = new positions building; falling = continued washout)
- BTC price: holding $79,900 or rejected at $80,000? Daily close direction determines timing of potential Prohibitive #6 removal

---

### 2026-05-04 15:25 ICT — auto check

**Window status**: INSIDE (15:25 ICT is within 09:00–17:00 ICT trading window; 15:00 ICT cron run. Window closes in ~95 min at 17:00 ICT.)
**Data source**: Web search aggregates (CoinGecko, CoinMarketCap, MetaMask, Investing.com, altindex, coinotag; REST APIs blocked 403). All indicator values estimated from published analyses. Precision ±5–10%.
**Price**: $2,328 (Δ +0.84% 24h; −$1 from $2,329 at 10:08 ICT run; 24h range $2,299–$2,334; 24h volume $8.78B)
**Decision**: NO_SETUP

**Market state**:
- ETH: $2,328, effectively flat vs 10:08 ICT run (−$1); 24h high $2,334.38 (no new high since morning); 24h low $2,299.38; 24h volume $8.78B; 24h change +0.84%
- Price has consolidated in a narrow $2,310–$2,334 band through the full morning and afternoon session; no 4h candle close above $2,340 confirmed → upper range edge ($2,330–$2,336) structurally intact
- Upper edge 2nd rejection developing: 24h high $2,334 printed (within the $2,330–$2,336 zone) and price has held $4–$8 below the edge for ~5h since the 10:08 ICT run; pattern consistent with a 2nd rejection but 15m candle close below $2,330 still requires chart confirmation
- BTC: ~$79,800 (essentially flat from $79,900 at 10:08 ICT; intraday drift only); EMA200 1D ~$82,200; gap ~$2,400 (~2.92% below EMA200); BTC MACD 1D confirmed negative; no regime change this session
- ETH EMA50 1D: ~$2,322 (price above by +$6; first reclaim since macro bearish phase; unchanged vs 10:08)
- ETH EMA100 4h: ~$2,352 (price below by ~$24)
- ETH EMA200 1D: ~$2,617 (price well below; long-term bearish context)
- Indicators (1h): RSI(14) est. ~51 (neutral; flat from 10:08 run ~53; no directional momentum); MACD(12,26,9) histogram est. ~−0.5 to −0.8 (slightly negative, contracting toward zero); BB(20,2) est: upper ~$2,348 / mid ~$2,295 / lower ~$2,242; price between mid and upper band
- Indicators (4h): RSI(14) est. ~44–45 (recovering toward neutral; borderline at LONG BC2 threshold of <45); MACD histogram est. ~−0.9 to −1.1 (within [−10, +10] zone; continued slow contraction from FOMC spike May 1)
- Indicators (1D): RSI(14) est. ~35 (confirmed near-oversold; historically significant cycle zone; unchanged from prior runs); MACD histogram negative (confirmed)
- ATR(14) 1h: est. ~$10–$11 (declining for ~77h since May 1 10:28 ICT FOMC spike; 5h additional contraction vs 10:08 run)
- BB(4h): UNKNOWN — critical range pre-check condition 4; cannot verify from web aggregates; CRITICAL gate for RANGE_SHORT eligibility
- Funding: negative territory (shorts paying longs per aggregates); exact % not confirmed; not confirmed < −0.02% (short Prohibitive #3 not triggered)
- OI: ~13.5M ETH (stable; same as 10:08 run; no new builds)
- Institutional context: Bitmine 101,901 ETH + whale cluster 61,000 ETH — accumulation confirmed but priced in from this morning; no new whale flow data

**Pre-checks**:
- **Multi-TF alignment LONG**: FAIL — 4h LH/LL bearish structure intact; no confirmed HL on 4h; MACD not crossing from below 0; 1h RSI ~51 (not exiting <40 oversold zone on confirmed bounce; 4h RSI at ~44 borderline but no structural confirmation); no 15m reversal candle from identified support
- **Multi-TF alignment SHORT**: FAIL — 1h RSI ~51 (not exiting >65 overbought zone; opposite of requirement); price $2,328 is below structural short resistance ($2,345–$2,380); no LH forming at resistance; no overbought 15m rejection candle
- **Range pre-check** (4 conditions):
  - (1) 4h MACD in [−10, +10]: **BORDERLINE PASS** — histogram est. ~−0.9 to −1.1; within zone; chart confirmation mandatory
  - (2) ATR(1h) declining 24h+: **PASS** — 77h of continuous decline since May 1 10:28 ICT; confirmed via multiple sessions with no volatility spikes
  - (3) Clear horizontal range, 2× edge rejections each side:
    - Lower $2,220–$2,232: **PASS** — 3 confirmed rejections (Apr 30 24h low; May 1 FOMC low $2,220; May 3 low $2,232)
    - Upper $2,330–$2,336: **BORDERLINE PASS (strengthened vs 10:08 run)** — (1st) May 2 24h high $2,335.71 confirmed; (2nd developing) today's 24h high $2,334.38 within edge zone + 5h consolidation below $2,330–$2,334; pattern resembles rejection but requires 15m close below $2,330 confirmed on chart
  - (4) BB(4h) flat: **UNKNOWN** — CRITICAL unresolved gate condition; sole remaining blocker for RANGE_SHORT
  - Pre-check verdict: Conditions 2, 3 (lower) confirmed; conditions 1 and 3-upper borderline; condition 4 unknown → **WATCH (not PENDING_ELIGIBLE)** — same status as 10:08 run but conditions 2–3 have strengthened
- **News Impact Score** (mandatory; INSIDE window):
  - No new prohibitive headlines found for May 4 afternoon
  - Previously scored: Bitmine 101,901 ETH (Impact 2.0), whale cluster 61K ETH (Impact ~3.75), ETF outflows (Impact 3.75) — all informational; no size reduction triggered
  - No FOMC/CPI/regulatory event in next 1–2h: CPI May 12, FOMC June 16–17 — CLEAR
- **Prohibitive conditions (LONG)**: **TRIGGERED — 11th consecutive run** — BTC ~$79,800 < EMA200 ~$82,200 (gap 2.92%); BTC MACD 1D negative; 1D ETH MACD negative. Counter-trend bearish regime. Longs prohibited.
- **Prohibitive conditions (SHORT)**: CLEAR for automated checks — no confirmed short prohibitive (funding not confirmed < −0.02%; no critical news; no overbought momentum at resistance)

**Reasoning**:
- **LONG — BLOCKED (11th run)**: BTC at ~$79,800 remains 2.92% below EMA200 ($82,200), MACD 1D negative. BTC did not sustain the $80,000 psychological level from the overnight rally. Gap narrowed from 6.4% (Apr 28) → 2.92% (today) over 6 sessions — meaningful structural improvement — but Prohibitive #6 is binary and overrides all LONG setups until BTC daily close above $82,200. ETH multi-TF alignment independently fails (no 4h HL, no MACD from below 0, 1h RSI never exited oversold on a confirmed bounce). No path until BTC daily close above ~$82,200.
- **SHORT — WATCH**: No change from 10:08 run. RSI 1h ~51 is neutral, opposite of the ≥65 overbought-exit requirement. Price $2,328 is below the short entry zone ($2,345–$2,380). No LH forming at resistance. Negative funding continues to signal squeeze risk against new shorts. Not actionable.
- **RANGE — URGENT WATCH — 95 MIN UNTIL WINDOW CLOSE**:
  - Condition 2 (ATR 24h+): 77h confirmed ✓
  - Condition 3-lower (3 rejections): confirmed ✓
  - Condition 1 (4h MACD in zone): borderline ~−1.0, within [−10, +10] ✓ (chart verify)
  - Condition 3-upper (2nd rejection): today's $2,334 high + 5h hold below edge is the strongest 2nd-rejection evidence of the test period; still needs 15m confirmation on chart
  - Condition 4 (BB(4h) flat): SOLE remaining unverifiable gate condition
  - Entry $2,333 is $5 above current price $2,328 — within reach on a small bounce
  - Range width 5.23%, SL 16 pt → RANGE_SHORT R:R = TP1 1:3.4, TP2 1:6.8 (exceptional vs typical 1:1 / 1:2 for range trades; due to wide $116 range with tight SL)
  - PRACTICAL NOTE: Window closes in ~95 min (17:00 ICT). A pending limit order at $2,333 has a very tight validity window. If trader confirms BB(4h) flat on chart, direct monitoring for a 15m short trigger at the upper edge is practical given the narrow window. Tomorrow's 10:00 ICT run (fresh 8h window) would be the cleaner opportunity if range holds overnight.

**⚠️ TRADER ACTION — INSIDE WINDOW — ~95 MIN REMAINING (until 17:00 ICT):**
If you are looking at your chart right now:
1. Is BB(4h) flat (bands running parallel, not expanding outward)?
2. Did the $2,334 high today produce a 15m candle that closed back below $2,330?
If BOTH = yes → range pre-check is fully confirmed → enter limit short at $2,333 (or watch for price to return to $2,330–$2,336 for entry). Time cap: 17:00 ICT today. Parameters below.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active (BTC below EMA200 + 1D MACD negative)
- SHORT: **WATCH** — no overbought momentum at resistance zone
- RANGE_SHORT: **WATCH (URGENT — window closing)** — BB(4h) flat is the sole unconfirmed gate condition; if confirmed on chart → PENDING_ELIGIBLE with 95 min validity; current price $2,328 is $5 below $2,333 entry
- RANGE_LONG: **WATCH** — price $2,328 is $103 above lower entry $2,225; not actionable today

**Informational range parameters (WATCH — NOT actionable until BB(4h) confirmed flat on chart)**:

RANGE_SHORT (upper edge):

| Field | Value |
|---|---|
| Direction | RANGE_SHORT |
| Order type | Limit (short) with attached TP/SL |
| Entry price | $2,333 (upper edge midpoint) |
| SL | $2,349 (16 pt — 0.69% above entry; beyond $2,336 upper boundary) |
| TP1 (50%) | $2,279 (54 pt — R:R 1:3.4; range midpoint) |
| TP2 (50%) | $2,225 (108 pt — R:R 1:6.8; lower edge) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Time validity | Cancel by 17:00 ICT today (window cap; ~95 min remaining) |
| Status | WATCH — NOT actionable without BB(4h) flat chart confirmation |

**Cancel manually if**:
- 4h candle closes above $2,340 with above-average volume (range breakout — hard invalidation)
- BTC falls below $77,000 (macro breakdown — range likely to follow lower)
- BTC closes above $82,200 EMA200 1D (regime change — remove Prohibitive #6; re-evaluate LONG; cancel range short)
- Macro headline appears before fill (FOMC speaker, surprise CPI, crypto regulatory action)
- Whale ratio shifts to >1.3 (whales strongly long — upper range break risk)
- Funding turns strongly positive >0.015% (longs overheating — upper range may break)

**Manual verification needed before fill**:
1. News Impact Score from Bybit Feed (primary gate before any entry)
2. Whale ratio from Bybit Trading Trend — if >1.3: do not enter range short
3. **BB(4h) flatness on chart — CRITICAL sole gate condition; automated run cannot verify**
4. Confirm today's $2,334 high produced a 15m rejection candle closing below $2,330 (true rejection, not intraday spike)
5. Long/Short position holder ratio — if >2.5 or <0.5 (Prohibitive #4 for range trades): do not enter
6. Trader's drawn trendlines and custom levels

**Email sent**: no (NO_SETUP — BB(4h) gate condition unresolved; WATCH status does not trigger email per hard constraints; email only on SETUP_* or PENDING_ELIGIBLE decision)

**Watch conditions for 23:00 ICT run (OUTSIDE window — informational only)**:
- Did range hold through 17:00 ICT close? No 4h candle above $2,340?
- Did price test lower boundary ($2,220–$2,232) or remain above $2,300?
- BTC overnight: holding $79,800 or testing $80,000+ / falling toward $77,000?
- If range intact at 23:00 ICT → RANGE_SHORT parameters carry forward to 10:00 ICT May 5 (fresh 8h trading window; cleaner entry opportunity than today's 95-min window)
- BTC daily close: did it close above $80,000? Above $82,200? (Regime change trigger)

**Manual verification needed (Bybit chart — cannot defer)**:
- **BB(4h) flat — CRITICAL** (sole gate condition for RANGE_SHORT; check before 17:00 ICT today or defer to tomorrow)
- Whale ratio from Bybit Trading Trend (no public API)
- Funding rate exact % (confirm negative; not approaching −0.02%)
- Upper edge: confirm 15m rejection candle close below $2,330 from today's $2,334 high
- OI direction 24h (building or declining?)
- BTC: holding above or losing $79,800 into close?

---

### 2026-05-04 23:37 ICT — auto check

**Window status**: OUTSIDE (09:00–17:00 ICT trading window per wiki/trading-hours.md; 23:00 ICT cron run — informational only; no email will be sent regardless of setup status)
**Data source**: Web search aggregates (Yahoo Finance, MetaMask price, The Market Periodical, CryptoBriefing, Financial Magnates, CoinMarketCap, coinotag; REST APIs blocked 403). Indicator values estimated from published analyses. Precision ±5–10%.
**Price**: $2,333 (Δ +1.0% 24h; +$5 / +0.2% vs 15:25 ICT run)
**Decision**: NO_SETUP

**Market state**:
- 24h: high $2,334, low $2,299, volume ~$8.78B USD — same extremes as all May 4 runs; no new high or low since morning; range structurally intact
- ETH drifted +$5 from 15:25 run ($2,328 → $2,333); still within $2,330–$2,336 upper range zone; no 4h candle close above $2,340 detected (range not broken)
- BTC: ~$79,810 (Δ +2.0% 24h); touched $80,393 in early Asian session (highest since Jan 31, 2026) on Iran de-escalation catalyst, then pulled back; intraday range ~$78,000–$80,393; EMA200 1D ~$82,200; gap ~$2,390 (~2.92% below EMA200); regime unchanged — BTC never closed above $80,000 or $82,200
- May 4 UTC daily candle closes at 07:00 ICT May 5 (7h 23m from now); BTC at $79,810 would need +3.0% to close above EMA200 ($82,200); scenario highly unlikely — Prohibitive #6 will remain active at 10:00 ICT May 5
- News / macro: Iran de-escalation — US responded to Iran's 14-point peace proposal (May 1); Brent crude fell to $107 from a 4-year high; Asian equity benchmarks near record highs; ETH traded higher in sympathy with BTC's $80k touch; positive macro backdrop since Apr 28; no Ethereum-specific prohibitive headlines detected (no core hack, no SEC/regulatory action, no FOMC/CPI in next 1–2h; next CPI May 12; next FOMC June 16–17)
- Whale accumulation: 140,000 ETH (~$322M) bought in prior 96h (Santiment data); OI $4.9B (64% longs); funding −0.0021% (shorts paying longs — historical precursor to squeeze rallies)
- Indicators (1h): RSI(14) ~51 (neutral; flat from 15:25 run); MACD histogram ~−0.5 to −0.9 (near zero, consolidating)
- Indicators (4h): RSI(14) ~44–45; MACD histogram ~−0.9 (borderline within [−10, +10]; 5h additional contraction vs 15:25 run)
- Indicators (1D): RSI(14) ~35 (near oversold; historically significant cycle zone); weekly RSI ~30 (matches 2022/2018 cycle-bottom lows); MACD negative (confirmed)
- ATR(14) 1h: est. ~$10 (declining ~85h since May 1 10:28 ICT FOMC spike — 8h additional contraction vs 15:25 run)
- EMA landscape: EMA50 1D ~$2,322 (price above by +$11; EMA50 reclaim maintained all day); EMA100 4h ~$2,352 (price below by ~$19); ETH EMA200 1D ~$2,617 (price well below)
- BB(4h): UNKNOWN — cannot verify from web aggregates; sole remaining gate condition for range pre-check

**Pre-checks**:
- Multi-TF alignment (LONG): FAIL — 4h LH/LL bearish structure intact; no confirmed HL on 4h; MACD not crossing from below 0; 1h RSI ~51 (never exited <40 oversold zone on confirmed bounce); no 15m reversal candle from identified support
- Multi-TF alignment (SHORT): FAIL — 1h RSI ~51 (opposite of ≥65 overbought-exit requirement); price at upper range edge but not at structural short resistance ($2,345–$2,380); no LH forming at resistance; negative funding (−0.0021%) + 64% long OI = material short-squeeze risk against new shorts
- Range pre-check (4 conditions):
  - (1) 4h MACD in [−10, +10]: **BORDERLINE PASS** — histogram est. ~−0.9; within zone if estimate correct; chart confirmation mandatory at 10:00 ICT May 5
  - (2) ATR(1h) declining 24h+: **PASS** — 85h of continuous decline since May 1 10:28 ICT FOMC spike; no volatility events detected through end of May 4 session
  - (3) Clear horizontal range, 2× edge rejections each side:
    - Lower $2,220–$2,232: **PASS** — 3 confirmed rejections (Apr 30 24h low; May 1 FOMC low $2,220; May 3 low ~$2,232)
    - Upper $2,330–$2,336: **BORDERLINE PASS (strengthened vs 15:25 run)** — (1st) May 2 24h high $2,335.71 confirmed; (2nd developing) May 4 24h high $2,334.38 + full-day hold below $2,336 through 17:00 ICT close with no breakout; strongest upper-edge rejection evidence of test period so far; 15m rejection-candle close below $2,330 still requires chart confirmation at morning scan
  - (4) BB(4h) flat: **UNKNOWN** — CRITICAL sole remaining gate condition; cannot substitute with web data
  - Pre-check verdict: Conditions 2 and 3-lower confirmed; conditions 1 and 3-upper borderline (strengthened); condition 4 unknown → **WATCH (not PENDING_ELIGIBLE)** — unchanged status from 15:25 run; range endured full trading day without breakout; thesis strengthened
- News Impact Score: Iran de-escalation = bullish macro (systemic cross-asset). ETH 24h +1.0% = Minor (4 pts) × Systemic breadth (3×) × Trend-confirmation modifier (1.25×) = Score ~15. News is directionally PRO-LONG (bullish for crypto) — no size penalty applies (penalty table targets adverse news vs trade direction; bullish news for a potential long = in-direction = informational). Noted.
- Prohibitive conditions (LONG): **TRIGGERED — 12th consecutive run** — BTC ~$79,810 < EMA200 ~$82,200 (gap 2.92%); BTC MACD 1D negative; 1D ETH MACD negative; longs prohibited
- Prohibitive conditions (SHORT): CLEAR for automated checks — funding not confirmed < −0.02% (short Prohibitive #3 not triggered); no critical news; no overbought momentum at resistance

**Reasoning**:
- **LONG — BLOCKED (12th run)**: BTC briefly touched $80,393 in early Asian session (Iran de-escalation, 3-month high) but failed to sustain above $80,000 and sits at $79,810 — still $2,390 below EMA200 ($82,200). Prohibitive #6 is binary and overrides all LONG evaluation until a daily close above $82,200. Gap has narrowed from 6.4% (Apr 28) to 2.92% over 7 sessions — meaningful structural improvement — but no regime change yet. BTC May 4 UTC daily candle closing at 07:00 ICT May 5; a +3.0% move in 7h would be needed to close above EMA200; not expected from current $79,810 without a new macro catalyst. ETH multi-TF alignment independently fails (no confirmed HL on 4h, MACD not from below 0, 1h RSI never exited oversold on a confirmed bounce).
- **SHORT — WATCH**: No setup. RSI 1h ~51 is neutral — opposite of the ≥65 overbought-exit requirement. Price at the upper range edge ($2,330–$2,336) is a structural location, not a momentum-overbought entry zone. Whale accumulation (140K ETH / $322M in 96h), negative funding (−0.0021%), and 64% long OI all signal meaningful short-squeeze risk at this price level. Only 1 of 5 base conditions met (price near resistance zone). Not actionable.
- **RANGE_SHORT — WATCH (carries forward to 10:00 ICT May 5)**: Range held intact through the entire May 4 trading day and has not broken as of 23:37 ICT. The upper edge ($2,330–$2,336) was tested twice today (morning $2,334 high, then current $2,333) and held. Per 15:25 run forecast: "If range intact at 23:00 ICT → RANGE_SHORT parameters carry forward to 10:00 ICT May 5 (fresh 8h trading window; cleaner entry opportunity)." That condition is met. Sole remaining gate: BB(4h) flat — must be confirmed at the 10:00 ICT May 5 chart scan.
- **Macro context update**: Iran de-escalation (Brent crude to $107, BTC briefly $80k) is the most bullish macro event since the Iran-US military escalation began in early 2026 and suppressed crypto. The macro backdrop has shifted positively, but ETH strategy regime (Prohibitive #6) requires BTC to close above EMA200 — not just touch $80k intraday. The gradual narrowing of the BTC-EMA200 gap (6.4% → 2.92% in 7 sessions) is tracking the right direction.

**Pending order eligibility** (informational only — OUTSIDE window):
- LONG: **BLOCKED** — Prohibitive #6 active; 12th consecutive run
- SHORT: **WATCH** — entry zone $2,345–$2,380 + RSI 1h >65 + 4h LH confirmed; not eligible
- RANGE_SHORT: **WATCH** — BB(4h) flat unconfirmed; outside window regardless; parameters carry to 10:00 ICT May 5
- RANGE_LONG: **WATCH** — price $2,333 is $108 above lower entry $2,225; not actionable

**Informational range parameters (WATCH — NOT actionable until: BB(4h) flat confirmed + upper edge rejection candle confirmed + window INSIDE at 10:00 ICT May 5)**:

RANGE_SHORT (upper edge — carry-forward WATCH from 15:25 run):

| Field | Value |
|---|---|
| Direction | RANGE_SHORT |
| Order type | Limit (short) with attached TP/SL |
| Entry price | $2,333 (upper edge midpoint) |
| SL | $2,349 (16 pt — 0.69% above entry; beyond $2,336 upper boundary + buffer) |
| TP1 (50%) | $2,279 (54 pt — R:R 1:3.4; range midpoint) |
| TP2 (50%) | $2,225 (108 pt — R:R 1:6.8; lower edge) |
| Position size | 0.94 ETH (Tier 1 $15 risk / 16 pt SL) |
| Time validity | Cancel by 17:00 ICT May 5 (window cap at next trading day's close) |
| Status | WATCH — NOT actionable; re-evaluate at 10:00 ICT May 5 |

**Cancel manually if (verify at 10:00 ICT May 5)**:
- 4h candle closes above $2,340 with above-average volume overnight (range breakout — hard invalidation; invalidates range trade entirely)
- BTC falls below $77,000 overnight (macro breakdown; range likely to break lower)
- BTC closes above $82,200 EMA200 on 1D (regime change — remove Prohibitive #6; cancel range short; re-evaluate LONG at the same time)
- Macro headline before fill (FOMC speaker, surprise CPI, crypto regulatory action, ETH-specific prohibitive)
- Whale ratio found >1.3 at morning check (whales strongly long — upper range breakout risk)
- Funding turns strongly positive >0.015% (longs overheating — upper range may break)

**Watch conditions for 10:00 ICT May 5 (next INSIDE-window run — primary decision point)**:
- **RANGE_SHORT (primary gate)**: if range intact (ETH below $2,340) AND BB(4h) confirmed flat on chart AND 15m rejection candle at upper edge confirmed → RANGE_SHORT becomes PENDING_ELIGIBLE → email alert will be sent at 10:00 ICT May 5 run
- **BTC regime watch (longest-horizon priority)**: BTC May 4 UTC daily candle closing 07:00 ICT May 5 will likely close ~$79,800 (Prohibitive #6 remains); path to removal requires +3% BTC rally to close 1D above $82,200; Iran peace process progress is the primary catalyst to watch overnight
- **SHORT watch**: needs price rally to $2,345–$2,380 with RSI 1h approaching >65 and 4h LH forming at resistance; unlikely overnight from $2,333 without fresh catalyst
- **RANGE_LONG watch**: if ETH drops to $2,220–$2,232 overnight → 4th lower edge rejection; parameters: entry $2,225, SL $2,209 (16 pt), TP1 50%@$2,279 (R:R 1:3.4), TP2 50%@$2,333 (R:R 1:6.8), 0.94 ETH

**Email sent**: no (OUTSIDE trading window — 23:00 ICT cron is always non-email run per wiki/trading-hours.md; decision is additionally NO_SETUP)

**Manual verification needed at 10:00 ICT May 5 morning scan (CRITICAL)**:
1. **BB(4h) flatness on chart** — CRITICAL sole gate condition for RANGE_SHORT eligibility; automated run cannot verify
2. Whale ratio from Bybit Trading Trend (no public API; if >1.3 → cancel range short)
3. Funding rate exact % on Bybit (confirm still negative; watch for sign reversal toward positive)
4. Did range hold overnight? Any 4h candle close above $2,340? (Range breakout = full invalidation)
5. Upper edge: did price return to $2,330–$2,336 overnight AND produce a 15m rejection candle close below $2,330? (Confirms 2nd upper edge rejection without ambiguity)
6. BTC overnight: sustained above $80,000 or pulled back? Did BTC close above $82,200 on 1D (07:00 ICT May 5 close)?
7. News Impact Score from Bybit Feed (Iran peace process developments overnight; any new crypto-specific prohibitive headlines)
8. OI direction 24h (rising new positions = new longs at the top = more fragile range; falling = washout)
9. Long/Short position holder ratio (Prohibitive #4 for range trades: >2.5 or <0.5 = likely breakout incoming)

---

### 2026-05-05 10:04 ICT — auto check

**Window status**: INSIDE (09:00–17:00 ICT trading window per wiki/trading-hours.md)
**Data source**: Web search aggregates (CoinGecko API 403, Binance API 403 — sandbox egress blocked). Indicator values from published analyses (CoinMarketCap, investing.com aggregates, altindex, coinglass, bitcoinethereumnews). Precision ±5–10%.
**Price**: $2,360 (Δ +1.30% 24h)
**Decision**: NO_SETUP

**Market state**:
- 24h: high $2,393, low $2,310, volume ~$26.5B USD, market cap ~$284.8B
- **⚠️ RANGE INVALIDATED**: prior multi-session RANGE_SHORT watch ($2,220–$2,336) is CANCELLED — ETH 24h high $2,393 is $57 above the $2,336 upper edge; 4h candle closed above $2,340 (breakout confirmed); cancel condition from 23:37 run triggered
- BTC: ~$80,290 (Δ +2.7% from May 4 23:37 run at $79,810); touched $80,393 intraday high (near but still below EMA200 1D); EMA200 1D ~$82,228; gap ~$1,938 (~2.4% below EMA200); regime unchanged — BTC has not closed above $82,228 on 1D
- ETH broke above the multi-session $2,220–$2,336 range to the upside; price now consolidating at 1D EMA50/EMA200 resistance cluster ($2,361–$2,367); pattern: possible bull breakout OR false breakout retest pending
- 4h structure: price rallied ~$60 overnight from $2,333 → $2,393 high; pulled back to $2,360; potential HH forming on short-term (24h high $2,393 > prior range top $2,336); macro 1D structure remains LH/LL (bearish); multiple rejections of $2,400 zone noted across the week
- EMA landscape: EMA50 1D ~$2,361 (price AT this level — resistance); EMA100 4h ~$2,352 (price slightly above by ~$8); EMA200 1D ~$2,617 (price well below — long-term bearish)
- Indicators (1h): RSI(14) ~49 (neutral, 30–70 zone — no directional conviction); MACD histogram ~0 to +1 est. (was −0.9 at 23:37 run; rally of ~$60 overnight pushed histogram toward neutral/positive); BB(20,2) est: lower ~$2,306, mid ~$2,362, upper ~$2,417; price inside bands near mid
- Indicators (4h): RSI(14) ~49 (neutral); MACD line est. ~−15 to −17 (absolute value; bearish context from prior periods); MACD histogram likely ~0 to +1 (transitioning post-rally); ATR(14) est. ~$27–$30 (rising vs ~$10 low during range period; volatility expanding on breakout)
- Indicators (1D): RSI(14) ~49 (neutral; some sources 48.58); MACD negative (confirmed; unchanged); price now AT 1D EMA50/EMA200 resistance cluster ($2,361/$2,367) — critical juncture for daily candle
- Funding: ~−0.0038% (shorts paying longs; bearish near-term sentiment among derivatives traders; below −0.02% short-prohibitive threshold)
- OI: ~13.5M ETH / ~$4.9B (stable; declining trend from 14.4M ETH Apr 18 peak; 64% long OI noted); overall long bias in OI but OI declining = prior longs reducing exposure while new positioning is cautious
- Top-100 L/S ratio: manual verification needed (no public API)
- Institutional/whale: 140K ETH (~$322M) accumulated in 4-day buying spree May 1–4 (Santiment data); Bitmine 101,901 ETH (confirmed from prior runs); strong long-horizon conviction signal; priced into current move
- Fear & Greed Index: ~40 (Fear)
- Macro: Iran de-escalation ongoing (positive for risk assets; BTC's $80,393 overnight test attributed to this catalyst); Pectra upgrade optimism persists; Core PCE 3.2% elevated (limits rate cut probability; macro headwind for risk assets); no prohibitive macro events in next 1–2h (CPI next May 12; FOMC next June 16–17)

**Pre-checks**:
- **Multi-TF alignment (LONG)**: FAIL — 4h macro structure is LH/LL (bearish); no confirmed HL on 4h yet (overnight rally may be forming one but price hasn't held a higher low for multiple 4h candles); MACD (4h line) still negative (~−15 to −17 absolute); 1h RSI ~49 (not exiting <40 oversold zone on a confirmed bounce from support; price moved UP from resistance, not bouncing from support). Additionally, 1h is at EMA resistance cluster, not at support. 15m: no reversal candle from an identified support level
- **Multi-TF alignment (SHORT)**: FAIL — 1h RSI ~49 (far from the ≥65 overbought-exit requirement); price $2,360 is at EMA resistance cluster but momentum is neutral, not overbought; no LH confirmed on 4h (only 1 high at $2,393; would need second lower high after confirmed rejection); 15m: no reversal candle from overbought zone
- **Range pre-check**:
  - (1) 4h MACD in [−10, +10]: likely BORDERLINE PASS (histogram ~0 to +1 estimated post-rally); chart confirmation mandatory
  - (2) ATR(1h) declining 24h+: **FAIL** — ATR has risen sharply from ~$10 (range period) to ~$27–$30 on the overnight breakout move; volatility is EXPANDING, opposite of range requirement
  - (3) Clear horizontal range, 2× edge rejections: **FAIL** — old range $2,220–$2,336 BROKEN; new potential range $2,310–$2,393 has only 1 rejection at each edge (insufficient; need 2+ per edge)
  - (4) BB(4h) flat: UNKNOWN; unlikely (volatility expanding on breakout)
  - Pre-check verdict: FAIL (conditions 2, 3 fail; condition 4 likely fails) — no range setup available
- **News Impact Score** (mandatory; INSIDE window):
  - ETH 24h +1.30% = Minor (4 pts) × Cross-asset breadth (Iran de-escalation + BTC/ETH rally = 2×) × Trend-confirmation modifier (1.25×) = ~10. Score = 10 → "halve position size" zone for adverse news; this news is PRO (confirming existing rally) — informational, no size penalty
  - No prohibitive headlines detected: no Ethereum core hack, no SEC/regulatory action, no FOMC/CPI within 1–2h
  - Manual verification required for complete score
- **Prohibitive conditions (LONG)**: **TRIGGERED — 13th consecutive run** — BTC ~$80,290 < EMA200 ~$82,228 (gap 2.4%); BTC MACD 1D negative; ETH 1D MACD negative. Counter-trend bearish regime. Longs prohibited.
- **Prohibitive conditions (SHORT)**: CLEAR for automated checks — funding not confirmed < −0.02% (Prohibitive #3 not triggered); no critical news; no overbought momentum at resistance; no whale ratio extreme confirmed

**Reasoning**:
- **LONG — BLOCKED (13th run)**: BTC at $80,290 touched $80,393 intraday (highest since Jan 31) but has not sustained above $80,000 let alone closed daily above $82,228 (EMA200). Gap narrowed from 6.4% (Apr 28) → 2.4% (today) over 8 sessions — significant structural improvement (best gap reading of the test period). But Prohibitive #6 is binary: requires a 1D close above $82,228, not an intraday touch. BTC will need to close today's UTC daily candle (07:00 ICT May 6) ~2.4% higher than current price. ETH independently fails multi-TF alignment: 4h structure has not printed a confirmed HL, no 4h MACD cross from below 0, 1h RSI at EMA resistance zone (49) not bouncing from oversold. The whale accumulation and negative funding are bullish contextual factors but insufficient to override prohibitive #6 or satisfy pre-check alignment.
- **SHORT — WATCH (upgraded from prior runs)**: Price is now AT the 1D EMA50 + EMA200 resistance cluster ($2,361–$2,367). This is the highest-quality resistance zone encountered this test period. The $2,393 intraday high was rejected within today's session, forming the beginning of what could be a short setup. BUT: the pre-check requires 1h RSI to EXIT the >65 overbought zone — RSI must first reach >65 (price rallying further toward $2,400–$2,420) then reject. Currently RSI is 49 — price is at resistance without momentum overextension. Only 1–2 of 5 base conditions met: (1) price at strong resistance (1D EMA cluster) ✓; (2) 4h structure starting to form LH (potential, not confirmed) ✓; RSI 1h not >65 ✗; whale ratio unknown ✗; 1D trend not catastrophically bullish (still LH/LL macro) ✓ — 2–3 of 5 base conditions borderline, multi-TF alignment hard-fails at 1h RSI. Not actionable as a SHORT now. Watch: if price rallies to $2,390–$2,420 with RSI 1h reaching >65 → SHORT alignment may pass.
- **RANGE — NOT ELIGIBLE**: Old range ($2,220–$2,336) formally cancelled. ATR rising (opposite of range requirement). New range $2,310–$2,393 embryonic — only 1 edge touch per boundary, 4h ATR expanding. Range conditions typically take 24–48h of consolidation to establish. Not applicable today.
- **Notable structural development**: ETH has now broken above a multi-day range for the first time during this test period. The rally from $2,220 lows (Apr 30) to $2,393 (today) represents a +7.8% recovery. This is the first time during the test period that ETH has reclaimed its 1D EMA50 ($2,361) AND the prior range top ($2,336). If this breakout holds, it changes the 4h structure from LH/LL to a potential HL/HH — the key condition that would eventually allow LONG setups (assuming BTC regime also shifts). However, Prohibitive #6 will remain the binding constraint until BTC closes above $82,228 on 1D.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active; 13th consecutive run; BTC 2.4% below EMA200
- SHORT: **WATCH** — price at structural resistance (1D EMA cluster), beginning of LH possibly forming; entry zone $2,385–$2,395 requires 1h RSI to reach >65 and then confirm rollback; monitor 15:00 ICT run
- RANGE_SHORT (old): **CANCELLED** — $2,220–$2,336 range broken; parameters from prior runs no longer valid
- RANGE_LONG: **WATCH** — new range $2,310–$2,393 embryonic; minimum 2 rejections at lower edge needed before range_long becomes eligible

**Cancel conditions for RANGE_SHORT (applies to prior open orders if trader placed one):**
If trader placed the RANGE_SHORT from the 23:37 run notification: **CANCEL IMMEDIATELY**. ETH 24h high $2,393 confirms the range breakout (breakout cancel condition from the 23:37 entry triggered: "4h candle closes above $2,340 with above-average volume"). The range is no longer valid.

**Watch conditions for 15:00 ICT run (next INSIDE-window run)**:
- **SHORT watch (primary)**: did price rally further to $2,385–$2,395 with RSI 1h approaching >65? Did a 4h LH form below $2,393? Does BB(4h) start showing upper-band rejection? If yes to 2+ → SHORT WATCH may upgrade to PENDING_ELIGIBLE at 15:00 ICT
- **BTC regime watch (critical)**: BTC UTC daily candle closes 07:00 ICT tomorrow (May 6); today's close (07:00 ICT May 6) will confirm if BTC holds above or below $82,228; if BTC closes above $82,228 on 1D — regime change, Prohibitive #6 removed, LONG evaluation begins
- **Range embryo watch**: did price pull back to $2,310–$2,320 zone and hold? First lower-edge rejection of new potential range $2,310–$2,393?
- **Whale ratio check (manual)**: with price at EMA resistance and OI 64% long, whale ratio >1.3 would be a short prohibitive; <0.8 would be a short bonus condition

**Email sent**: no (NO_SETUP — no email; window is INSIDE but decision is NO_SETUP; email rule requires SETUP_* decision)

**Manual verification needed at next scan / before any entry**:
1. **Cancel any pending RANGE_SHORT from prior runs** — range breakout confirmed, order must be cancelled manually on Bybit
2. Whale ratio from Bybit Trading Trend (no public API; critical for SHORT base condition #4 and range prohibitive #4)
3. Funding exact % (confirm still negative; watch for sign reversal toward positive which would signal longs overheating)
4. BB(4h) status: is it now expanding (consistent with breakout) or flattening into new range? Chart mandatory
5. 4h candle structure at EMA resistance cluster: is $2,393 holding as a rejection high, or is price pushing to new highs toward $2,400+?
6. BTC: holding above $80,000? Approaching $82,228 EMA200? (1D close at 07:00 ICT May 6 is the key event)
7. News Impact Score from Bybit Feed (Iran peace process developments; any new ETH-specific news)
8. OI direction: rising (new longs at resistance = fragile) or falling (washout = potential short squeeze exhausted)?
9. Long/Short position holder ratio (range prohibitive #4: >2.5 or <0.5 = likely directional move)

---

### 2026-05-05 15:08 ICT — auto check

**Window status**: INSIDE (15:08 ICT is within 09:00–17:00 ICT trading window per wiki/trading-hours.md; 15:00 ICT cron run. Window closes in ~52 min at 17:00 ICT.)
**Data source**: Web search aggregates (CoinGecko, CoinMarketCap, Yahoo Finance, Investing.com, CoinGlass, Fortune; REST APIs blocked 403). All indicator values estimated from published analyses. Precision ±5–10%.
**Price**: $2,350 (Δ ~+0.9% 24h; est. 24h range $2,299–$2,393; 24h volume: not available — prior run reported ~$26.5B at 10:04 ICT)
**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,393, low ~$2,299; price consolidating below today's high in $2,330–$2,360 band; no new 4h candle close above $2,393 detected
- Old range $2,220–$2,336: **CANCELLED** — broken to the upside per 10:04 ICT run; still cancelled; no retest of lower boundary yet
- BTC: ~$80,894 (Δ +~2.5% 24h); 1D EMA200 ~$82,228; gap ~$1,334 (~1.6% below EMA200) — **smallest gap of the entire test period** (down from 6.4% on Apr 28 across 8 sessions); BTC MACD 1D negative (confirmed); has not closed above EMA200 since Oct 2025
- ETH EMA landscape: EMA50 1D ~$2,361 (price near/below — resistance); EMA100 4h ~$2,352 (price AT or just below — resistance cluster); EMA200 1D ~$2,617 (price well below; long-term bearish)
- Indicators (1h): RSI(14) ~48–49 (neutral; unchanged from 10:04 run); MACD histogram est. ~0 to +0.5 (transitioning from negative; post-rally histogram near zero); BB(20,2) est: upper ~$2,420 / mid ~$2,362 / lower ~$2,304 (expanded from range period)
- Indicators (4h): RSI(14) ~49 (neutral; recovered from ~38 May 1 low); MACD line est. ~−15 to −17 (absolute bearish; not within [−10, +10]); MACD histogram est. ~0 to +1 (transitioning post-rally; histogram near zero, within [−10, +10] zone); ATR(14) 1h est. ~$25–$30 (EXPANDING — up from ~$10 range-period low; breakout spike still reverberating)
- Indicators (1D): RSI(14) ~48.58 (NEUTRAL — **significant structural shift** from ~35 near-oversold on May 1; daily RSI fully recovered on breakout rally); MACD negative (confirmed; histogram flattening toward zero); EMA50 1D ~$2,361; EMA200 (ETH) ~$2,617
- Funding: −0.0038% (shorts paying longs; below −0.02% Prohibitive #3 threshold for short; unchanged from prior runs)
- OI: ~$4.5B (~13.5M ETH); 61.6% long bias; net OI declining from Apr 18 peak 14.4M ETH (traders reducing exposure, not adding)
- Macro/news: No prohibitive events today; FOMC concluded Apr 28–29 (rates 3.5–3.75%; next June 16–17); CPI next May 12 (7 days); CLARITY Act + GENIUS Act advancing (regulatory positive, informational); BTC ETF April net inflows $2B (best month since Oct 2025); Iran de-escalation ongoing (mild macro positive); no ETH core hack, no SEC action, no FOMC/CPI in next 1–2h — CLEAR
- Institutional: Bitmine 101,901 ETH + whale 61K ETH from prior runs (priced in); 140K ETH accumulated May 1–4 (Santiment; ongoing accumulation signal)
- Fear & Greed Index: ~40 (Fear)

**Pre-checks**:
- **Multi-TF alignment LONG**: FAIL — 4h macro structure LH/LL bearish intact; no confirmed HL on 4h (overnight rally is one leg up; need a second higher low to establish HL pattern); MACD line ~−15 to −17 (absolute; not crossing from below 0 — a histogram transition near zero is NOT the same as MACD line crossing 0); 1h RSI ~49 (never exited <40 oversold zone before this rally; launched from neutral); no 15m reversal candle from identified support
- **Multi-TF alignment SHORT**: FAIL — 1h RSI ~49 (not exiting >65 overbought zone; far from requirement; price never pushed to overbought in this session); price ~$2,350 is below structural short resistance ($2,393 intraday high; $2,400+ zone untested); no confirmed LH on 4h (only one high at $2,393 so far; need a second lower high after pullback to confirm LH pattern); 15m overbought rejection candle absent
- **Range pre-check**:
  - (1) 4h MACD between −10 and +10: **FAIL** — MACD line est. ~−15 to −17 (absolute; outside [−10, +10] threshold); breakout momentum has pushed MACD line further from zero in absolute terms
  - (2) ATR(1h) declining 24h+: **FAIL** — ATR EXPANDED from ~$10 (range period) to ~$25–$30 on the May 5 morning breakout spike; volatility is expanding, the opposite of the range pre-check requirement; ATR clock reset to zero
  - (3) Clear horizontal range 2× edge rejections each side: **FAIL** — old range $2,220–$2,336 broken; new embryonic range $2,299–$2,393 has only 1 touch per edge (low $2,299.38; high $2,393 — both from today's single session); minimum 2× per edge not met
  - (4) BB(4h) flat: **FAIL** — volatility expanding on breakout; bands have expanded from range period; cannot be flat
  - Pre-check verdict: ALL FOUR CONDITIONS FAIL → **RANGE NOT ELIGIBLE**
- **News Impact Score** (mandatory; INSIDE window): no prohibitive headlines found (no ETH core hack, no SEC/regulatory action, no FOMC/CPI in next 1–2h); regulatory clarity news (CLARITY Act, GENIUS Act) is mild positive, informational; Impact Score < 10; no size penalty. Manual full verification required from Bybit Feed.
- **Prohibitive conditions (LONG)**: **TRIGGERED — 14th consecutive run** — BTC ~$80,894 < EMA200 ~$82,228 (gap 1.6%); BTC MACD 1D negative; ETH 1D MACD negative. Counter-trend bearish regime. Longs prohibited.
- **Prohibitive conditions (SHORT)**: CLEAR for automated checks — funding −0.0038% (not < −0.02%; Prohibitive #3 for short not triggered); no critical news; no overbought momentum at resistance confirmed; no extreme whale ratio confirmed

**Reasoning**:
- **LONG — BLOCKED (14th run)**: BTC at $80,894 is 1.6% below EMA200 $82,228 — the smallest gap of the entire test period (down from 6.4% on Apr 28). The gap has narrowed meaningfully across 8 sessions. However, Prohibitive #6 is binary: requires a 1D daily close above $82,228. BTC's current UTC daily candle (May 5) closes at 07:00 ICT May 6; a close above $82,228 is possible but would require another +1.6% from current — unlikely in the next ~16h without a fresh catalyst. ETH multi-TF alignment independently fails: 4h structure has not printed a confirmed HL (one leg up ≠ HL), MACD line not crossing from below 0, 1h RSI never entered oversold before this move. Positive signs (1D RSI recovery 35→48.58, range breakout, BTC gap narrowing) are structural tailwinds — but not entry triggers under v5 rules.

- **SHORT — WATCH (UPGRADED — highest-quality short watch setup of test period)**:
  - Price ~$2,350 is AT the 1D EMA50 ($2,361) / EMA100 4h ($2,352) resistance cluster; the zone that, if price bounces back to, could produce a confirmed LH on 4h
  - The $2,393 intraday high was rejected this morning and price has spent the afternoon ~$40 below it — the beginning of an LH-forming process
  - Pre-check alignment for SHORT still fails: 1h RSI ~49 is neutral (need >65 after an overbought push); no confirmed LH on 4h; no 15m rejection candle from overbought zone
  - Base conditions: BC1 (price at resistance) ✓ — EMA cluster is genuine resistance; BC2 (RSI 1h >65 or 4h >60) ✗ — RSI 49/49; BC3 (4h LH forming) — developing but not confirmed; BC4 (whale ratio) — manual; BC5 (1D trend not catastrophically bullish) ✓ — macro LH/LL intact
  - Score: 2 of 5 confirmed; need minimum 3; pre-check alignment also fails → NOT actionable
  - Negative funding (−0.0038%) + 61.6% long OI = material squeeze risk against new shorts; any SHORT entry requires confirmed reversal candle, not anticipation
  - **Scenario to watch**: if ETH rallies back to $2,390–$2,420 and RSI 1h approaches >65 → SHORT alignment may begin qualifying; the first time this test period that a SHORT has been this close to becoming eligible

- **RANGE — NOT ELIGIBLE**: All four pre-check conditions fail simultaneously. Old range $2,220–$2,336 broken; ATR expanding from breakout volatility; new embryonic range $2,299–$2,393 has only 1 edge touch per boundary; BB(4h) expanding. A range setup in the post-breakout zone would require 24–48h of ATR contraction + 2× edge rejections per boundary — earliest plausible assessment: 10:00 ICT May 7 if tight consolidation continues.

- **Structural note**: This is the third consecutive INSIDE-window run (10:04 and 15:08 ICT today, preceded by 10:04 and 15:25 ICT May 4) where ETH has been operating in a new post-range environment. The 1D RSI recovery from 35 → 48.58, the range breakout above $2,336, and the EMA50 1D reclaim ($2,322) are the most positive structural changes of the test period. BTC is 1.6% from a regime-change signal. The question is whether a SHORT setup materialises at EMA resistance before BTC breaks higher.

**Pending order eligibility**:
- LONG: **BLOCKED** — Prohibitive #6 active (14th consecutive run; BTC 1.6% below EMA200; binary threshold)
- SHORT: **WATCH** — alignment conditions not met; entry zone $2,385–$2,420 with RSI 1h recovering to >65 + confirmed 4h LH; ~52 min left in today's window; not eligible before window closes at 17:00 ICT; re-evaluate at 23:00 ICT (OUTSIDE window — informational) and 10:00 ICT May 6 (INSIDE window)
- RANGE: **WATCH** — embryonic $2,299–$2,393; pre-check fails (ATR expanding, MACD line outside zone, insufficient edge touches); re-evaluate at 10:00 ICT May 7 if consolidation extends
- RANGE_LONG: **WATCH** — lower boundary $2,299; price ~$2,350 is $51 above entry; not actionable

**Watch conditions for 23:00 ICT run (OUTSIDE window — no email; informational journal entry)**:
- **SHORT watch (primary)**: did ETH push toward $2,390–$2,420 this afternoon/evening and reject? Did RSI 1h approach >65 and roll back? Did a 4h candle close with a rejection wick from the $2,390–$2,420 zone forming a LH? If YES → SHORT watch upgraded; re-evaluate at 10:00 ICT May 6 for PENDING_ELIGIBLE
- **BTC regime change watch (critical priority)**: BTC May 5 UTC daily candle closes 07:00 ICT May 6; if BTC closes above $82,228 on 1D → Prohibitive #6 removed; LONG setups evaluable for first time since Oct 2025; from $80,894 requires +1.6% close
- **Range embryo watch**: if ETH consolidates tightly $2,310–$2,393 through Asia session with no new high or break below $2,299 — edge touch count builds; ATR clock begins resetting
- **Breakdown watch**: if ETH breaks below $2,299 (today's low) with volume → possible false breakout; may retest range-break level; re-assess structure

**Email sent**: no (NO_SETUP — window INSIDE but decision is NO_SETUP with all directions at WATCH status; hard constraint: no email on pure NO_SETUP)

**Manual verification needed before next scan / any entry**:
1. Whale ratio from Bybit Trading Trend (no public API; BC4 for both SHORT and any future LONG)
2. Funding exact % on Bybit (confirm still negative; watch for reversal toward positive — longs overheating signal; positive funding + resistance = SHORT bonus condition)
3. BB(4h) status on chart (expanding = confirms post-breakout trend; beginning to flatten = early range formation signal)
4. 4h MACD exact value on chart (verify MACD line value: is it within [−10, +10] or still ~−15 to −17?)
5. Did $2,393 hold as today's high? Has a 4h LH begun forming (second lower high on 4h)?
6. BTC progress toward $82,228: did BTC sustain above $80,000? Direction into Asia session?
7. News Impact Score from Bybit Feed (any fresh ETH-specific or macro news post-15:00 ICT)
8. OI direction: rising (new longs at resistance = fragile, supports SHORT watch) or falling (washout = squeeze risk growing)?
9. Long/Short position holder ratio on Bybit (if <0.8 → SHORT base condition BC4 partially met)
