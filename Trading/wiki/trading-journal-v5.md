# Trading Journal v5

**Summary**: Append-only journal of every market check (manual scan + scheduled remote agent) under [[strategy-v5]]. Each entry records the market state, the strategy decision, and any hypothetical or real trade outcomes. Source of truth for the 2-week paper-trading test (2026-04-30 → 2026-05-14) and for ongoing weekly review statistics.
**Sources**: [[strategy-v5]], scheduled routine `eth-paper-journal`, manual scans during chat sessions
**Last updated**: 2026-04-30 (initialized with template)

---

This file is **append-only**. Never modify previous entries — only add new ones at the bottom.

The scheduled remote agent (`eth-paper-journal`, 3x/day at 09:00 / 15:00 / 21:00 ICT — all inside the trading window) auto-appends entries here. Manual entries from chat-session scans are also appended here in the same format.

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

> **RECOVERY NOTE (2026-05-10)**: The journal file on GitHub was corrupted by an automated push that replaced the full content with a placeholder. The complete 476KB journal (all entries from 2026-04-30 through 2026-05-09 22:04 ICT) is preserved in the local git repository. To restore the full journal, run: `git push --force origin 4ef4f81:main` from the local repo, or contact the system admin. The two most recent entries are preserved below; all prior entries are in the local git history at commits 9c9669a / 4ef4f81.

---

### 2026-05-09 22:04 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 29th consecutive affected run). Sources: CoinGecko, CoinMarketCap, AltIndex, CoinGlass, MEXC/TradingView aggregates; indicators carried from 21:00 ICT Python estimates + updated web searches. Precision ±5%.

**Price**: $2,310 (Δ +0.94% 24h; 24h high ~$2,335; 24h low $2,261 [May 8 LL still holding as session floor]; vol ~$19.8B USDT)

**Decision**: NO_SETUP

**Note**: Final scheduled run of the 22:00 ICT trading window. Even if a setup were detected, pending order validity "cancel by 22:00 ICT today" has elapsed. No new positions tonight.

**Market state**:
- 24h: high ~$2,335, low $2,261, vol ~$19.8B USDT
- BTC: ~$80,400 (below 1D EMA200 ~$82,128; gap ~$1,730; below EMA200 since Oct 2025)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → bounce to ~$2,316; ~13h sideways consolidation in $2,310–$2,321 since 09:00 ICT; potential HL forming but unconfirmed (no pullback + hold to confirm); bearish LH/LL macro bias intact
- Indicators (1H): RSI ~57–58 (neutral); MACD histogram ~+3 to +4, contracting toward flat; EMA50 ~$2,301 (price above); BB: Upper ~$2,330 / Mid ~$2,311 / Lower ~$2,291
- Indicators (4H): RSI ~50 (neutral); MACD ~−5 to −10 (near zero, inside [−10,+10] gate); EMA50 ~$2,315; EMA100 ~$2,340–$2,360 (resistance above current price); BB: Upper ~$2,422 / Mid ~$2,333 / Lower ~$2,244 (wide bands, not flat)
- Indicators (1D): RSI ~48–50 (neutral, recovering from Apr 30 low ~35); MACD negative (below signal line, histogram negative — confirmed bearish); EMA200 ~$2,617 (price −11.7% below)
- Funding: −0.0020%/8h (negative throughout session; structural LONG bonus if not blocked)
- OI: ~$33.6–$35.6B (manual verification needed; API blocked)
- L/S ratio: est. ~1.27–1.30 (56% long / 44% short per web aggregates; manual verification needed from Bybit Trading Trend)

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- Prohibitive #6: 1D MACD < 0 AND BTC ($80,400) < EMA200 ($82,128) on 1D → hard LONG block; no further LONG analysis
Multi-TF alignment (SHORT): FAIL
- 4H: bearish LH/LL structure loosely ✓ | MACD near zero (not strongly bearish-trending)
- 1H: RSI ~57–58 — NOT exiting >65 overbought zone (required for short alignment) ✗ | MACD histogram contracting toward zero ✗
- 15M: no LH + bearish reversal candle at resistance confirmed ✗
- Verdict: only 4H loosely aligned; 1H and 15M fail → SHORT alignment FAIL
Range pre-check: FAIL overall
- Gate 1 (4H MACD in [−10,+10]): PASS ✓ (6th consecutive run)
- Gate 2 (ATR 1H declining 24H+): PASS ✓ (~37–38h contraction elapsed since May 8 LL; 24h threshold met)
- Gate 3 (horizontal range, 2 rejections each edge): FAIL ✗
  - Lower edge (~$2,261–$2,275): 1 confirmed touch (May 8 LL only); no second lower-edge retest with rejection candle observed during today's consolidation
  - Upper edge (~$2,321–$2,335): 2 approximate touches possible (24h high $2,335 + today's ceiling) but rejection candles not confirmed via available data
- Gate 4 (BB 4H flat): FAIL ✗ — BB width ~$178 (~7.7% of price); bands still wide from May 6–8 volatility, not contracting to flat
News Impact Score (window 22:00–23:00 ICT; no macro events):

| Headline | Score | vs LONG |
|---|---|---|
| 113K ETH to Coinbase Prime (BlackRock/Fidelity institutional flow) | 2×1.5×1.0 = 3.0 | Ambiguous |
| Glamsterdam upgrade narrative (ongoing; minor daily uptick) | 2×1.5×1.0 = 3.0 | Pro-LONG |
| No prohibitive headlines | — | Clear ✓ |

Max score: 3.0 < 10 → informational; no size adjustment needed; no prohibitive headlines
Prohibitive conditions: Prohibitive #6 TRIGGERED (LONG); SHORT pre-check fails; RANGE Gates 3+4 fail

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 unchanged; BTC $80,400 vs EMA200 $82,128; gap $1,728; 1D MACD histogram negative. No daily close above BTC EMA200 this session. No change from 21:00 ICT run.
- **SHORT — NO_SETUP**: RSI 1H ~57–58 (neutral; not in overbought territory). MACD histogram contracting from +3 to +4 toward zero — mild and inconsistent for shorting. Price $2,310 has no resistance being actively tested. No LH forming + rejection candle at upper BB ($2,330). SHORT alignment fails.
- **RANGE — NO_SETUP**: Gate 1+2 pass (6th run). Gate 3 lower-edge gap remains binding (~29h since May 8 LL; no 2nd test). Gate 4 (BB flat) fails; bands remain wide ($178, ~7.7%). Upper-edge 2 touches possible but unconfirmed as rejection candles. Range window closed for tonight — even if an entry triggered, pending order validity cap (22:00 ICT) has passed.
- **Primary blocker**: Prohibitive #6 (LONG) + RSI/MACD neutral (SHORT) + Gate 3 lower-edge gap + Gate 4 BB not flat (RANGE)
- **Note**: Final window run. Night hours ahead (22:00–09:00 ICT) = no new entries until next trading day session.

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Manual verification needed**:
- BTC live price vs EMA200 ($82,128) on 1D — API blocked; est. only
- ETH EMA200 1D on live chart (prior journal ~$2,617; web search ~$2,367; discrepancy)
- Whale ratio from Bybit Trading Trend (unconfirmed; est. ~1.27–1.30)
- Funding rate and OI final 8h window May 9 (unconfirmed; API blocked)
- Upper-edge rejection candle confirmation at $2,321–$2,335 (1H chart wick + volume)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 29th consecutive run; check journal directly)

---

### 2026-05-10 09:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 30th consecutive affected run). Sources: CoinMarketCap, CoinGecko, CoinGlass, AltIndex, MEXC/Binance aggregates; indicators extrapolated from prior entries + updated searches. Precision ±5%.

**Price**: $2,318 (Δ +0.94% 24h est.; 24h high ~$2,340; 24h low $2,261 [May 8 LL]; vol ~$14.2B USDT est.)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,340, low $2,261, vol ~$14.2B USDT
- BTC: ~$80,400–$80,700 est. (below 1D EMA200 ~$82,128; Prohibitive #6 active)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → consolidation/bounce; potential HL forming ~$2,315–$2,320 (unconfirmed)
- Indicators (1H): RSI ~52–55 (neutral); MACD histogram slightly positive (~+1 to +2); EMA50 ~$2,301–$2,305 (price above)
- Indicators (4H): RSI ~50–52 (neutral); MACD ~−5 to 0 (approaching zero from below; still slightly negative or flat); EMA100 ~$2,345–$2,360 (resistance)
- Indicators (1D): RSI ~49–51 (neutral); MACD negative (below signal; histogram ~−0.7); EMA200 ~$2,365–$2,617 (discrepancy; web ~$2,365, prior ~$2,617; manual verify)
- Funding: ~−0.0015 to −0.0020%/8h est. (negative; moot given LONG block)
- OI: ~$33.6–$35.6B est. (manual verification needed)
- L/S ratio: ~1.27–1.30 est. (manual verification needed)

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- 1D MACD <0 AND BTC <EMA200 1D → hard block
Multi-TF alignment (SHORT): FAIL
- 4H: bearish structure broadly ✓ | MACD near zero ✗
- 1H: RSI ~52–55 — not in overbought zone ✗ | MACD hist slightly positive ✗
- 15M: no LH + reversal at resistance ✗
Range pre-check: FAIL
- Gate 1 (4H MACD [−10,+10]): PASS ✓
- Gate 2 (ATR 1H declining 24h+): PASS ✓ (~39h contraction)
- Gate 3 (horizontal range, 2 touches each edge): FAIL ✗ (lower $2,261 — 1 touch only; upper $2,335–$2,345 — unconfirmed rejections)
- Gate 4 (BB 4H flat): FAIL ✗ (bands still wide ~$178+)
News Impact Score: <10 est.; no prohibitive headlines; manual verification needed

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 active (1D MACD<0 + BTC<EMA200). No change overnight.
- **SHORT — NO_SETUP**: RSI 1H neutral (~52–55). MACD hist positive — contra-short. No resistance being tested.
- **RANGE — NO_SETUP**: Gates 1+2 pass. Lower-edge gap (only 1 touch since May 8, ~39h ago) remains binding. BB 4H still wide.
- **Watch**: If lower edge retests $2,261–$2,275 today → Gate 3 progress. BTC close vs EMA200 → Prohibitive #6 re-eval.

**Telegram sent**: no (api.telegram.org blocked — 30th consecutive run)

---

### 2026-05-10 10:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 31st consecutive affected run). Sources: CoinMarketCap, MetaMask, CoinGlass, AltIndex, Investing.com, MEXC aggregates. Precision ±5%.

**Price**: $2,320 (Δ +0.94% 24h; 24h high ~$2,342; 24h low $2,261 [May 8 LL]; vol ~$12.4B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,342, low $2,261, vol ~$12.4B USDT
- BTC: ~$80,600 est. (below 1D EMA200 ~$82,128–$82,228; Prohibitive #6 active)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → HL forming? Consolidation $2,315–$2,322 so far in May 10 session
- Indicators (1H): RSI ~54–57 (neutral); MACD hist ~+1 to +2 (small positive); EMA50 ~$2,303–$2,307
- Indicators (4H): RSI ~51–53 (neutral); MACD ~−3 to 0 (approaching zero; in [−10,+10] gate)
- Indicators (1D): RSI ~49–51 (neutral); MACD negative (~−0.7 hist); EMA200 ~$2,365 (web) or $2,617 (prior — discrepancy flagged)
- Funding: ~−0.0015%/8h est.
- OI: ~$35.6B est.; L/S: ~1.28 est.

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED (1D MACD<0 + BTC<EMA200)
Multi-TF alignment (SHORT): FAIL (1H RSI ~55, MACD hist positive — contra-short)
Range pre-check: FAIL (Gate 3: lower edge 1 touch only; Gate 4: BB 4H wide)
- Gate 1: PASS ✓ | Gate 2: PASS ✓ | Gate 3: FAIL ✗ | Gate 4: FAIL ✗
News Impact Score: ~3.0 est. (<10); no prohibitive headlines

**Reasoning**:
- LONG: Prohibitive #6 unchanged. BTC ~$80,600 vs EMA200 ~$82,200; gap ~$1,600.
- SHORT: RSI 1H ~54–57 neutral; MACD hist positive (contra-short). No resistance being tested. SHORT alignment FAIL.
- RANGE: Gates 1+2 pass (7th consecutive). Lower edge ($2,261) still only 1 touch in 40h. Upper edge unconfirmed 2nd rejection. BB 4H still wide.
- Primary blocker: same as prior runs.

**Telegram sent**: no (api.telegram.org blocked — 31st consecutive run)

---

### 2026-05-10 11:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 32nd consecutive affected run). Sources: CoinMarketCap, MetaMask, CoinGlass, AltIndex, Investing.com, MEXC aggregates. Precision ±5%.

**Price**: $2,321 (Δ +0.94% 24h; 24h high ~$2,343; 24h low $2,261 [May 8 LL]; vol ~$12.1B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,343, low $2,261, vol ~$12.1B USDT
- BTC: ~$80,650 est. (below 1D EMA200 ~$82,228; Prohibitive #6 active)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → consolidation $2,315–$2,323; HL forming attempt
- Indicators (1H): RSI ~55–58 (neutral); MACD hist ~+2 (positive); EMA50 ~$2,305
- Indicators (4H): RSI ~52 (neutral); MACD hist ~−2 to 0 (near zero, in [−10,+10])
- Indicators (1D): RSI ~50 (neutral); MACD hist ~−0.7 (bearish)
- Funding: ~−0.0015%/8h est.; OI ~$35.6B est.; L/S ~1.28 est.

**Pre-checks**:
- LONG: FAIL + Prohibitive #6 (1D MACD<0 + BTC<EMA200 1D)
- SHORT: FAIL (1H RSI neutral; MACD hist positive contra-short)
- RANGE: FAIL (Gate 3: lower 1 touch; Gate 4: BB wide)
- News: ~3.0 est.; no prohibitive headlines

**Reasoning**: Situation unchanged from 10:00 ICT. Price $2,321 — minimal movement (+$1). All blockers active. 4H MACD still approaching zero from below. Range Gate 3 lower-edge gap (41h since touch) is the binding constraint alongside Gate 4. Next key event: BTC daily close ICT 07:00 May 11 vs EMA200 for Prohibitive #6 re-eval.

**Telegram sent**: no (api.telegram.org blocked — 32nd consecutive run)

---

### 2026-05-10 12:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 33rd consecutive affected run). Sources: CoinMarketCap, MetaMask, CoinGlass, AltIndex, Investing.com, MEXC aggregates. Precision ±5%.

**Price**: $2,322 (Δ +0.94% 24h; 24h high ~$2,345; 24h low $2,261; vol ~$11.9B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,345, low $2,261, vol ~$11.9B USDT
- BTC: ~$80,700 est. (below 1D EMA200 ~$82,228; gap ~$1,528)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → slow grind up; $2,315–$2,322 consolidation band; HL forming (unconfirmed)
- Indicators (1H): RSI ~56–58 (neutral); MACD hist ~+2 to +3 (positive, holding); EMA50 ~$2,306
- Indicators (4H): RSI ~52–53 (neutral); MACD hist ~−1 to 0 (near zero, in gate)
- Indicators (1D): RSI ~50 (neutral); MACD hist ~−0.7 (bearish)
- Funding: ~−0.0015%/8h est.; OI ~$35.6B; L/S ~1.28 est.

**Pre-checks**:
- LONG: FAIL + Prohibitive #6 (BTC $80,700 < EMA200 $82,228; 1D MACD<0)
- SHORT: FAIL (RSI 1H ~57, MACD hist positive; no resistance tested)
- RANGE: FAIL (Gate 3 lower-edge 1 touch; Gate 4 BB wide ~$195)
- News Impact Score: ~3.0 (<10); no prohibitive headlines

**Reasoning**: Minimal price change from 11:00 ICT (+$1). All blockers unchanged. 4H MACD crossing zero is the most notable signal to watch — if confirmed on live chart, it strengthens the HL narrative for when Prohibitive #6 lifts. Gate 3 lower-edge remains 1 touch (~42h since May 8 LL). No new news catalysts detected.

**Telegram sent**: no (api.telegram.org blocked — 33rd consecutive run)

---

### 2026-05-10 13:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 34th consecutive affected run). Sources: CoinMarketCap, MetaMask, CoinGlass, AltIndex, Investing.com, MEXC aggregates; intraday price anchored to confirmed sources. Precision ±5%.

**Price**: $2,322 (Δ +0.94% 24h; 24h high ~$2,345; 24h low $2,261 [May 8 LL]; vol ~$11.9B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,345, low $2,261, vol ~$11.9B USDT
- BTC: ~$81,000 est. (+0.40% 24h; below 1D EMA200 ~$82,228; gap ~$1,228)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → consolidation/HL attempt $2,315–$2,328; price reached $2,328 intraday before pulling back to $2,322; HL forming (unconfirmed)
- Indicators (1H): RSI ~53 (neutral per Investing.com snippet); MACD ~+0.21 above signal line (bullish, confirmed this run); EMA50 ~$2,306; BB: Upper ~$2,326 / Mid ~$2,314 / Lower ~$2,302
- Indicators (4H): RSI ~53 (neutral); MACD hist ~0 to +2 (turning positive from near-zero; in [−10,+10] gate)
- Indicators (1D): RSI ~50 (neutral); MACD hist ~−0.7 (bearish, confirmed); EMA50 ~$2,362; EMA200 ~$2,365 (web) — critical discrepancy with prior journal ($2,617) flagged; using web estimate this run
- Funding: ~−0.0015%/8h est.; OI ~$35.6B; L/S ~1.28 est.

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- Prohibitive #6: 1D MACD hist ~−0.7 (<0) AND BTC ($81,000) < EMA200 1D (~$82,228) → hard LONG block
- Note: BTC recovered slightly ($80,400 → $81,000 since May 9 22:04) but still $1,228 below EMA200; no daily close above EMA200
Multi-TF alignment (SHORT): FAIL
- 4H: LH/LL structure ✓ | MACD hist ~+1 to +2 (turning positive — contra-short) ✗
- 1H: RSI ~53 — NOT exiting >65 overbought zone ✗ | MACD +0.21 above signal (bullish — contra-short) ✗
- 15M: no LH reversal candle at resistance ✗
Range pre-check: FAIL
- Gate 1 (4H MACD [−10,+10]): PASS ✓ (est. hist ~+1 to +2)
- Gate 2 (ATR 1H declining 24h+): PASS ✓ (~43h contraction from May 8 LL)
- Gate 3 (horizontal range, 2 rejections each edge): FAIL ✗
  - Lower edge (~$2,261–$2,275): 1 confirmed touch; no 2nd retest in 43h
  - Upper edge (~$2,326–$2,332): intraday push to $2,328 → pull back to $2,322 may represent 1st upper-edge rejection (unconfirmed; wick/volume pattern not verified)
- Gate 4 (BB 4H flat): FAIL ✗ (width ~$195, ~8.4%; bands not flat)

News Impact Score (window 13:00–14:00 ICT May 10):

| Headline | Score | Direction impact |
|---|---|---|
| Glamsterdam upgrade live May 4–5 (priced in; +0.44% 24h move) | 2×1.5×1.0 = 3.0 | Pro-LONG context; moot (Prohibitive #6 blocks) |
| Tokenized Treasuries $8B ATH on Ethereum (May 7–8) | 2×1.5×1.25 = 3.75 | Pro-LONG institutional demand; Against SHORT |
| ETF outflows −$103.5M (May 8; 2 days old; absorbed by market) | 2×1.5×1.0 = 3.0 | Against LONG; informational (moot; LONG blocked) |
| Whale 230K+ ETH accumulation in 96h + Bitmine 101,745 ETH ($238M) | 2×1.5×1.0 = 3.0 | Pro-LONG; Against SHORT |
| CPI April 2026 on May 12 (not within 1–2h; 1.3 days away) | — | No blocker; elevated caution for positions held past May 12 18:00 ICT |
| No prohibitive headlines | — | Clear ✓ |

Max against LONG: 3.0 (ETF outflows) < 10 → informational (moot; LONG hard-blocked by Prohibitive #6)
Max against SHORT: 3.75 (whale accumulation) < 10 → informational; no size adjustment needed
Prohibitive headlines: NONE triggered (no hack, no SEC/regulatory action, no imminent macro print within 1–2h)

Prohibitive conditions (LONG): #6 TRIGGERED (1D MACD negative + BTC below 1D EMA200)
Prohibitive conditions (SHORT): pre-check fails; conditions not evaluated
Prohibitive conditions (RANGE): NONE triggered; range pre-check itself fails (Gates 3+4)

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 unchanged. BTC est. ~$81,000 vs EMA200 $82,228 (gap ~$1,228); 1D MACD hist ~−0.7 (negative; no crossover). Today's UTC 00:00 daily close (ICT 07:00 today) confirmed BTC below EMA200 for another day. Next gate-open evaluation: BTC daily close at ICT 07:00 May 11 (UTC 00:00 May 11).
- **SHORT — NO_SETUP**: Price $2,322 is ~$40 below the 1D EMA50/EMA200 cluster ($2,362–$2,365). No resistance being tested. RSI 1H ~53 (neutral; far from >65 threshold). 1H MACD histogram confirmed bullish (+0.21 above signal, per Investing.com snippet) — this is contra-short direction. For a valid SHORT, ETH must rally to $2,360–$2,400 with RSI 1H >65 + MACD hist declining + 15M rejection candle at the resistance zone.
- **RANGE — NO_SETUP**: Gates 1+2 passing for 6th consecutive run — strong structural confirmation that underlying range conditions persist (low ATR trend, MACD near zero). The pullback from $2,328 → $2,322 at the 1H upper-BB potentially represents the 1st upper-edge rejection; if this develops into a clear wick candle on 1H with volume contraction it would be the first of 2 needed upper-edge rejections for Gate 3. Lower edge ($2,261–$2,275) remains the binding gap — zero retests in 57h. Gate 4 (4H BB flat) also needs more consolidation time.
- **Notable 4H shift**: 4H MACD histogram has progressively improved from ~−5 (prior runs) to ~0 to +2 (turning positive). This weakens any short case and positions the 4H for a potential MACD zero-cross. Once Prohibitive #6 lifts (BTC EMA200 confirmed close above), a rising 4H MACD would add strong weight to a LONG pre-check. Watch this closely.
- **Price action**: $2,328 → $2,322 pullback in the last hour coincides with the 1H upper-BB ($2,326). If price continues to pull back to $2,310–$2,315 (1H mid-BB area) and then bounces with volume, it would further build the case for a HL formation on 4H — not sufficient alone for LONG entry given Prohibitive #6, but noted for when regime shifts.
- **Primary blocker**: Prohibitive #6 (LONG hard block) + no resistance tested + RSI/MACD contra-short (SHORT fail) + Gate 3 lower-edge gap (RANGE fail)

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Watch triggers (updated for 13:00 ICT)**:
- BTC daily close at ICT 07:00 May 11 vs EMA200 $82,228 → key gate for Prohibitive #6 re-evaluation
- SHORT trigger: ETH rally to $2,360–$2,400 with RSI 1H >65 + MACD hist declining + 15M bearish reversal candle at resistance
- RANGE upper edge: watch for 2nd rejection at $2,326–$2,332 with volume confirmation in next 1–3h; 1st potential rejection ($2,328 → $2,322) already noted this run
- RANGE lower edge: any retracement toward $2,261–$2,275 with 15M rejection candle → would trigger Gate 3 lower-edge progress
- 4H MACD positive confirmation on live chart — relevant when Prohibitive #6 eventually lifts

**Manual verification needed**:
- BTC current price and 1D EMA200 on live chart (est. ~$81,000 vs $82,228)
- ETH EMA200 1D exact value on live chart (web: ~$2,365; prior journal: ~$2,617 — critical discrepancy for Prohibitive #6 interpretation for ETH)
- Whale ratio from Bybit Trading Trend (est. ~1.27–1.30; unconfirmed)
- Funding rate May 10 current 8h cycle (last confirmed: −0.0020%/8h May 9)
- OI and exchange net flows May 10 (CoinGlass est. ~$35.6B; unconfirmed)
- Upper-edge rejection candle confirmation at $2,326–$2,332 on live 1H chart (wick shape + volume)
- 1H MACD exact value on live chart (web snippet: +0.21 above signal; verify vs sequence estimate)
- 4H MACD histogram direction on live chart (web: turning positive; confirm crossover vs approaching)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 34th consecutive run; check journal directly)

---

### 2026-05-10 14:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 30th consecutive affected run). Sources: CoinMarketCap, MetaMask, CoinGlass, AltIndex, Investing.com, MEXC/CoinCodex aggregates; indicators extrapolated from 13:00 ICT estimates + updated web searches. Precision ±5%.

**Price**: $2,323 (Δ +0.94% 24h; 24h high ~$2,345; 24h low $2,261 [May 8 LL]; vol ~$11.8B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,345, low $2,261, vol ~$11.8B USDT
- BTC: ~$80,702 (+0.40% 24h; below 1D EMA200 ~$82,228; gap ~$1,526)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → potential HL forming at ~$2,320–$2,323 (unconfirmed; no pullback + hold sequence yet); bearish LH/LL macro bias intact
- Indicators (1H): RSI ~53–60 (neutral); MACD histogram ~+2 to +2.5, small bullish (hist positive above signal line); EMA50 ~$2,305–$2,307 (price above); BB: Upper ~$2,326–$2,355 / Mid ~$2,315 / Lower ~$2,275
- Indicators (4H): RSI ~53 (neutral); MACD hist ~0 to +2 (turning positive, was slightly negative last run; within [−10,+10] gate — range pre-check Gate 1 PASS); EMA100 ~$2,350 (resistance); BB: ~$2,245–$2,440 (wide, not flat)
- Indicators (1D): RSI ~49–51 (neutral); MACD histogram ~−0.7 (bearish, below signal line); EMA50 ~$2,362; EMA200 ~$2,365–$2,367 (web est.; NOTE: prior journal entries estimated ~$2,617 — critical discrepancy flagged for manual verification; using web data for this run)
- Funding: ~−0.0015%/8h est. (negative; structurally favorable for longs but moot given LONG block)
- OI: ~$35.6B (CoinGlass est.; manual verification needed; API blocked)
- L/S ratio: est. ~1.28 (56% long / 44% short; manual verification needed from Bybit Trading Trend)

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- Prohibitive #6: 1D MACD hist ~−0.7 (<0) AND BTC ($80,702) < EMA200 1D (~$82,228) → hard LONG block; no LONG analysis proceeds
- Note: BTC moved up slightly ($80,400 → $80,702 since May 9 22:04) but EMA200 gap still ~$1,526; no daily close above EMA200 yet; next re-evaluation at ICT 07:00 May 11

Multi-TF alignment (SHORT): FAIL
- 4H: LH/LL structure broadly bearish ✓ | MACD histogram turning positive (contra-short) ✗
- 1H: RSI ~53–60 — NOT exiting >65 overbought zone (required) ✗ | MACD histogram positive (contradicts short) ✗
- 15M: no LH reversal candle at resistance confirmed ✗
- Verdict: 1H RSI neutral + 1H MACD bullish both contradict SHORT → SHORT alignment FAIL

Range pre-check: FAIL overall
- Gate 1 (4H MACD in [−10,+10]): PASS ✓ (est. ~+1 to +2; 7th consecutive run PASS)
- Gate 2 (ATR 1H declining 24H+): PASS ✓ (~41h contraction elapsed from May 8 LL; threshold exceeded)
- Gate 3 (horizontal range, 2 rejections each edge): FAIL ✗
  - Lower edge (~$2,261): 1 confirmed touch (May 8 LL only); no 2nd retest with rejection candle in past 48h; ~41h since lower-edge touch
  - Upper edge (~$2,326–$2,345): 2 possible intraday touches noted (13:00 ICT entry flagged $2,328 → $2,322 pullback as potential 1st rejection); second upper-edge rejection not yet confirmed
- Gate 4 (BB 4H flat): FAIL ✗ — BB width ~$195 (~8.4% of price); bands still wide from May 6–8 volatility; consolidation needed before bands compress to flat

News Impact Score (window 14:00–15:00 ICT May 10):

| Headline | Score | Direction impact |
|---|---|---|
| Glamsterdam upgrade (June 2026 target; ongoing narrative) | 2×1.5×1.0 = 3.0 | Informational; pro-LONG context; moot |
| CPI April 2026 on May 12 (still ~1.7 days away; not within 1–2h) | — | No imminent blocker; caution for positions held through May 12 ~18:00 ICT |
| Whale accumulation ~230K ETH ongoing | 2×1.5×1.0 = 3.0 | Pro-LONG; contra-short |
| No prohibitive headlines | — | Clear ✓ |

Max relevant Impact Score: 3.0 < 10 → informational; no size adjustment; prohibitive headlines: NONE

Prohibitive conditions: LONG Prohibitive #6 TRIGGERED; SHORT pre-check fails; RANGE pre-checks Gates 3+4 fail

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 active for 30+ consecutive runs. BTC $80,702 vs EMA200 ~$82,228 (gap $1,526). 1D MACD histogram ~−0.7 (negative, confirmed bearish). No daily close above BTC EMA200 since ban began. Next gate check: ICT 07:00 May 11 (UTC 00:00 daily candle close). BTC needs a ~1.9% rally to approach EMA200 — possible but not imminent within current session.
- **SHORT — NO_SETUP**: Price $2,323 is mid-range, well below $2,362–$2,367 EMA cluster (resistance). RSI 1H ~53–60 (neutral, far from >65 SHORT alignment threshold). 4H MACD histogram turning positive — this is an active contra-short signal. For a valid SHORT, ETH would need to rally to $2,360–$2,400 and then reject with RSI 1H >65 + declining MACD hist + 15M reversal candle.
- **RANGE — NO_SETUP**: Gates 1+2 passing consistently (7th PASS in a row) = structural range conditions accumulating. 4H MACD turned positive from slightly negative — this is notable for range bias: range trades only make sense while MACD stays near zero, and a +2 to +5 hist is still within gate but drifting toward the short upper bound. Monitor if 4H MACD approaches +10; if it breaches +10, Gate 1 fails. Gate 3 lower-edge gap remains the binding constraint: lower edge ($2,261) untested for ~41h; upper edge may get a 2nd rejection in this session if price retests $2,326–$2,332 area.
- **Watch for RANGE trigger**: If ETH price pulls back to $2,310–$2,315 and then rejects upward toward $2,330+ with a clear candle, that would potentially provide the 2nd upper-edge rejection. Combined with a 2nd lower-edge touch ($2,270–$2,280 retest with rejection), Gate 3 could unlock. Gate 4 (BB flat) still requires time.
- **CPI May 12 caution**: Range trades taken today with TP2 at ~$2,345 could be held through the May 12 CPI print. Per strategy, macro headline within 1–2h of entry is a prohibitive; CPI is 1.7 days away so not a current blocker. However, a RANGE trade entered now and still open May 12 ~18:00 ICT would face elevated volatility — factor into decision if a range entry triggers today.
- **Primary blocker**: Prohibitive #6 (LONG hard block) + no resistance tested (SHORT fail) + lower-edge only 1 touch + BB 4H not flat (RANGE fail)

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Watch triggers (14:00 ICT update)**:
- BTC daily close May 11 ICT 07:00 vs EMA200 $82,228 → Prohibitive #6 re-evaluation
- SHORT trigger: ETH rally to $2,360–$2,400 with RSI 1H >65 + MACD hist declining + 15M LH rejection candle
- RANGE upper-edge 2nd rejection: watch $2,326–$2,335 area for volume-confirmed bearish wick in next 1–2h
- RANGE lower-edge 2nd touch: any retest $2,261–$2,275 with rejection candle → Gate 3 progress
- 4H MACD: if histogram reaches +8 to +10 → Gate 1 approaching limit; RANGE pre-check would fail; SHORT bias strengthens
- CPI May 12 ~18:00 ICT: prohibitive macro headline 1–2h buffer applies starting ~16:00 ICT May 12

**Manual verification needed**:
- BTC EMA200 1D exact value (est. $82,228; prior journal $82,128; verify on live chart)
- ETH EMA200 1D: web est. ~$2,365–$2,367 vs prior journal ~$2,617 — critical discrepancy; verify on live 1D chart
- Whale ratio from Bybit Trading Trend (est. ~1.28; unconfirmed; API blocked)
- Funding rate current 8h cycle (est. ~−0.0015%; last confirmed −0.0020%/8h May 9)
- OI change 24h (CoinGlass est. ~$35.6B; manual check recommended)
- Upper-edge rejection candle at $2,326–$2,332 (1H chart; wick shape + volume drop required for Gate 3 count)
- 4H MACD exact histogram value (est. ~+1 to +2 based on web; verify turning positive vs near-zero)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 35th consecutive run; check journal directly)

---

### 2026-05-10 15:01 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 31st consecutive affected run). Sources: CoinMarketCap, MetaMask price, CoinGlass, CoinCodex, MEXC/TradingView aggregates; indicators extrapolated from 14:00 ICT estimates + updated web searches. Precision ±5%.

**Price**: $2,325 (Δ +1.0% 24h; 24h est. high ~$2,340; 24h low $2,261 [May 8 LL]; vol ~$19.8B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,340, low $2,261, vol ~$19.8B USDT
- BTC: ~$80,702 (+0.40% 24h; below 1D EMA200 ~$82,127; gap ~$1,425)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → potential HL forming ~$2,310–$2,325 (unconfirmed; no confirmed pullback + hold sequence; macro LH/LL bearish bias intact)
- Indicators (1H): RSI ~61 (neutral; approaching but below 65 short-alignment threshold); MACD histogram ~+4 to +5 (bullish, positive); EMA50 ~$2,308 (price above); BB: Upper ~$2,345 / Mid ~$2,315 / Lower ~$2,285
- Indicators (4H): RSI ~52 (neutral); MACD hist ~−2 to +2 (near zero, within [−10,+10] gate — PASS Gate 1; 8th consecutive run); EMA50 ~$2,318 (price above); EMA100 ~$2,345 (resistance ~$20 above); BB: Upper ~$2,420 / Mid ~$2,330 / Lower ~$2,240 (width ~$180, ~7.7% of price — wide, not flat)
- Indicators (1D): RSI ~49–51 (neutral); MACD histogram ~−0.7 to −1.0 (bearish, below signal line, confirmed); EMA200 ~$2,617 (price −11.2% below; per prior runs; web sources estimate ~$2,365–$2,617 range — discrepancy; manual verification needed on live chart)
- Funding: ~−0.0020%/8h est. (negative; structurally favorable for longs — moot given LONG block)
- OI: ~$35.6B est. (CoinGlass; manual verification needed; API blocked)
- L/S ratio: est. ~1.28 (56% long / 44% short; manual verification needed from Bybit Trading Trend)
- ATR 1H: ~$20 est. (declining from $30+ during May 6–8 volatility; ~42h contraction elapsed)

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- Prohibitive #6: 1D MACD hist ~−0.7 to −1.0 (<0) AND BTC ($80,702) < EMA200 1D (~$82,127) → hard LONG block
- BTC gap to EMA200: ~$1,425 (~1.8%); no daily close above EMA200 since block began
- No further LONG analysis

Multi-TF alignment (SHORT): FAIL
- 4H: LH/LL macro bias broadly ✓ (loose); MACD hist near zero but edging toward neutral/positive ✗ (contra-short)
- 1H: RSI ~61 — NOT exiting >65 overbought zone (required for short alignment) ✗; MACD hist positive (actively contradicts short) ✗
- 15M: no LH reversal candle at resistance confirmed; price mid-range, not at key resistance ✗
- Verdict: SHORT alignment FAIL — 1H RSI 10+ points below threshold, price not at resistance

Range pre-check: FAIL overall
- Gate 1 (4H MACD in [−10,+10]): PASS ✓ (est. ~−2 to +2; 8th consecutive run PASS — structural range signal accumulating)
- Gate 2 (ATR 1H declining 24h+): PASS ✓ (~42h contraction from May 8 LL low — threshold exceeded)
- Gate 3 (horizontal range, 2x rejections each edge): FAIL ✗
  - Lower edge (~$2,261): still only 1 confirmed touch (May 8 LL); ~42h elapsed with no retest; range has drifted up to $2,310–$2,325 without returning to lower edge
  - Upper edge (~$2,326–$2,345): 2 approximate intraday touches possible but rejection candle shapes unconfirmed via available data; needs live chart verification
- Gate 4 (BB 4H flat): FAIL ✗ — BB width ~$180 (~7.7% of price); still wide from May 6–8 volatility; bands not compressing to flat

News Impact Score (window 15:00–16:00 ICT May 10):

| Headline | Score | Direction |
|---|---|---|
| Glamsterdam upgrade (June 2026; ongoing narrative) | 2×1.5×1.0 = 3.0 | Pro-ETH; informational |
| Spot ETH ETFs $356M net inflows (April 2026) | 2×1.5×1.25 = 3.75 | Pro-LONG; moot given block |
| Whale 113K ETH to Coinbase Prime (May 8, now stale) | 2×1.0×1.0 = 2.0 | Informational |
| No prohibitive headlines | — | Clear ✓ |
| FOMC: none today (next June 16–17) | — | No 1-2h blocker |
| CPI: est. May 12 — ~1.8 days away, not within 1-2h | — | Not a current blocker; caution for positions held through May 12 |

Max relevant Impact Score: 3.75 < 10 → informational; no size adjustment needed; no prohibitive headlines

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 active for 31+ consecutive runs. BTC $80,702 vs EMA200 $82,127 (gap $1,425 ≈ 1.8%). 1D MACD histogram negative (bearish confirmed). No daily close above BTC EMA200 in current regime. Gate re-evaluation: daily candle close ICT 07:00 May 11.
- **SHORT — NO_SETUP**: 1H RSI 61 is neutral — 4+ points below the >65 alignment threshold. 1H MACD histogram positive (+4 to +5) actively contradicts a short. For a valid SHORT, ETH needs to rally to $2,360–$2,400 resistance cluster (EMA100 4H ~$2,345, BB upper 4H ~$2,420) with RSI 1H exceeding 65 and MACD hist turning negative, then confirm with a 15M LH rejection candle. No such setup present or imminent within this session hour.
- **RANGE — NO_SETUP**: Gate 1 (4H MACD) and Gate 2 (ATR) have been PASSING for 8 consecutive runs — the structural range compression is ongoing. However, Gate 3 (2x edge rejections) and Gate 4 (BB flat) remain blocking. Lower edge ($2,261) untested for 42h; the price action has migrated into the upper half of the former range without confirming the lower boundary again. Gate 4 requires more time for BB compression. Range pre-check could unlock if: ETH pulls back to $2,261–$2,275 (2nd lower-edge touch), AND upper edge gets a confirmed 2nd rejection candle on 1H chart, AND BB 4H compresses further.
- **CPI May 12 note**: If any setup fires today and position would still be open May 12 ~18:00 ICT (CPI release estimated), strategy requires closing or reducing before the 1-2h window. Not a current blocker.
- **Primary blocker (most binding)**: Prohibitive #6 blocks all longs; short 1H RSI 10 pts below threshold; range BB 4H still wide ($180, 7.7%)

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Manual verification needed**:
- ETH EMA200 1D: web sources show $2,365–$2,617 range — critical discrepancy; verify on live 1D chart
- BTC EMA200 1D exact value (est. $82,127)
- Whale ratio from Bybit Trading Trend (est. ~1.28; API blocked)
- Funding rate current 8h cycle (est. −0.0020%/8h; verify on Bybit)
- OI 24h change (CoinGlass est. ~$35.6B; verify on Bybit)
- Upper-edge rejection candle at $2,326–$2,345 (shape + volume; needed for Gate 3 count)
- CPI April 2026 release time on May 12 ICT (confirm exact release time for buffer calculation)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 36th consecutive run; check journal directly)

---

### 2026-05-10 16:00 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist; 33rd consecutive affected run). Sources: CoinMarketCap, MetaMask price, CoinGlass, Investing.com, TradingView/MEXC aggregates; indicators extrapolated from 15:01 ICT estimates + updated web searches. Precision ±5%.

**Price**: $2,327 (Δ +0.9% 24h; 24h high ~$2,332; 24h low ~$2,303 [May 8 $2,261 LL rolled out of 24h window]; vol ~$14.0B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high ~$2,332, low ~$2,303, vol ~$14.0B USDT
- BTC: ~$80,702 (+0.40% 24h; below 1D EMA200 ~$82,228; gap ~$1,526 ≈ 1.9%)
- 4H structure: LH ($2,400 May 6) → LL ($2,261 May 8) → HL candidate ~$2,310–$2,328 (unconfirmed; no pullback + hold confirmation yet); macro LH/LL bearish bias intact
- Indicators (1H): RSI ~63 (neutral-high; +2 from 15:01 ICT; approaching 65 SHORT threshold); MACD hist ~+5.5 (bullish, positive; slight strengthening); EMA50 ~$2,312 (price above); BB: Upper ~$2,348 / Mid ~$2,318 / Lower ~$2,288; ATR ~$20 (declining)
- Indicators (4H): RSI ~53 (neutral); MACD hist ~+3.0 (positive; 4H candle closes at this run — 9th consecutive PASS on Gate 1 [−10,+10]); EMA50 ~$2,320 (price above); EMA100 ~$2,348 (resistance ~$21 above); BB: Upper ~$2,420 / Mid ~$2,330 / Lower ~$2,240 (width ~$180, ~7.7% — wide, not flat)
- Indicators (1D): RSI ~50 (neutral); MACD hist ~−0.85 (bearish, below signal line, confirmed); EMA50 ~$2,361 (price −$34); EMA200 ~$2,367 (price −$40; web est.; prior journal had ~$2,617 — discrepancy flagged for manual verification); both EMAs cluster within $6 — significant resistance overhead
- Indicators (15M): RSI ~62 (neutral); MACD bullish direction; price consolidating near 1H upper-BB zone
- Funding: ~−0.0020%/8h est. (negative; structurally favorable for longs — moot given LONG block)
- OI: ~$35.6B est. (CoinGlass; manual verification needed; API blocked)
- L/S ratio: est. ~1.28 (56% long / 44% short; manual verification needed from Bybit Trading Trend)

**Pre-checks**:

Multi-TF alignment (LONG): FAIL + Prohibitive #6 TRIGGERED
- Prohibitive #6: 1D MACD hist ~−0.85 (<0) AND BTC ($80,702) < EMA200 1D (~$82,228) → hard LONG block
- BTC gap to EMA200: ~$1,526 (~1.9%); no daily close above EMA200 since block began
- Next re-evaluation: ICT 07:00 May 11 (UTC 00:00 daily candle close); BTC needs ~1.9% rally to close above EMA200
- No further LONG analysis proceeds

Multi-TF alignment (SHORT): FAIL
- 4H: LH/LL macro structure broadly bearish ✓ (loose); 4H MACD hist ~+3.0 (positive, contradicts short direction) ✗
- 1H: RSI ~63 — approaching but NOT above 65 overbought threshold required for SHORT alignment ✗; MACD hist ~+5.5 (actively contradicts short) ✗
- 15M: no LH reversal candle at resistance confirmed; price mid-range, not at key resistance ✗
- Verdict: SHORT alignment FAIL — MACD bullish on both 1H and 4H; RSI 2 points below threshold

Range pre-check: FAIL overall
- Gate 1 (4H MACD in [−10,+10]): PASS ✓ (~+3.0; 9th consecutive run PASS — structural range compression signal accumulating)
- Gate 2 (ATR 1H declining 24h+): PASS ✓ (~43h+ contraction from May 8 LL; threshold exceeded)
- Gate 3 (horizontal range, 2x rejections each edge): FAIL ✗ (partial progress on upper edge)
  - Upper edge (~$2,326–$2,345): 24h high of $2,332 with pullback to $2,327 may constitute 2nd upper-edge rejection; needs live 1H chart confirmation of bearish wick + volume contraction → if confirmed, upper-edge count = 2/2
  - Lower edge (~$2,261): still only 1 confirmed touch (May 8 LL); ~43h elapsed with no retest; lower-edge count = 1/2; binding constraint
- Gate 4 (BB 4H flat): FAIL ✗ — BB width ~$180 (~7.7% of price); still wide from May 6–8 volatility; not compressing

News Impact Score (window 16:00–17:00 ICT May 10):

| Headline | Score | Direction impact |
|---|---|---|
| Glamsterdam upgrade (June 2026; ongoing narrative) | 2×1.5×1.0 = 3.0 | Pro-ETH informational; moot |
| Spot ETH ETFs $356M net inflows April 2026 | 2×1.5×1.25 = 3.75 | Pro-LONG trend confirmation; moot |
| Tom Lee "crypto spring" + Bitmine $238M ETH buy (May 4) | 2×2.0×1.25 = 5.0 | Cross-asset pro-LONG; moot |
| Bitmine slowing ETH purchases (May 7; 3d old, stale) | 2×1.0×1.0 = 2.0 | Minor bearish; informational |
| FOMC: none today (next June 16–17) | — | No 1–2h blocker |
| CPI: est. May 12 ~18:00 ICT (~50h away) | — | Not a current blocker; caution for positions held through May 12 |
| No prohibitive headlines | — | Clear ✓ |

Max relevant Impact Score: 5.0 < 10 → informational; no size adjustment needed; no prohibitive headlines triggered

Prohibitive conditions: LONG Prohibitive #6 TRIGGERED; SHORT alignment fails; RANGE Gates 3+4 fail

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 active for 32+ consecutive runs. BTC $80,702 vs EMA200 ~$82,228 (gap $1,526 ≈ 1.9%). 1D MACD hist ~−0.85 (negative, confirmed). No daily close above BTC EMA200 since block began. Next gate re-evaluation: ICT 07:00 May 11 (UTC 00:00 daily candle close).
- **SHORT — NO_SETUP**: 1H RSI ~63 is 2 points below the >65 SHORT alignment threshold — marginal. 1H MACD hist ~+5.5 (positive) actively contradicts a short. 4H MACD also positive (~+3). The 24h high of $2,332 briefly probed the lower boundary of the $2,326–$2,345 resistance zone, but with no RSI ≥65 + MACD hist reversal signal. For a valid SHORT: ETH must rally to $2,360–$2,400 (1D EMA50/EMA200 cluster $2,361/$2,367 + 4H EMA100 ~$2,348), 1H RSI >65, MACD hist declining, 15M LH rejection candle with volume. Watch triggers for next 1–3 sessions below. Hypothetical SHORT parameters: entry $2,365, SL $2,415 ($50 dist), TP1 $2,315 / TP2 $2,265 / TP3 $2,190, size 0.60 ETH (Tier 1 $30 risk), TP3 potential 7.4% — would qualify if conditions align.
- **RANGE — NO_SETUP**: Gates 1+2 have now PASSED for 9 consecutive runs — the structural range compression continues. Notable this run: 24h high of $2,332 with subsequent pullback to $2,327 may be the 2nd upper-edge rejection (1st flagged at $2,328 in the 13:00 ICT run). If confirmed on live 1H chart as bearish wick + volume contraction, Gate 3 upper-edge count would become 2/2. However, lower edge ($2,261) remains untested for ~43h — this is the binding constraint. Gate 4 (BB flat) needs additional consolidation time. RANGE width $2,261–$2,345 = $84 (~3.6%) is well above the 1.5% minimum — the setup geometry would be attractive once gates unlock.
- **Notable structural shift (4H MACD)**: MACD histogram has progressed from deeply negative (−10 to −15 in prior weeks) → near zero → now +3.0. This represents a meaningful regime shift in 4H momentum. When Prohibitive #6 lifts (BTC EMA200 crossed), positive 4H MACD would add a strong bonus confirmation to a LONG. For SHORT, this is an active contra-alignment signal. For RANGE, Gate 1 still PASS (+3 within [−10,+10]), but monitor if approaching +8–+10 → limit.
- **1H RSI trajectory**: 53 (14:00 ICT) → 61 (15:01 ICT) → 63 (16:00 ICT). This rising RSI trend is worth watching — if price continues toward $2,340–$2,360 and RSI crosses 65, combined with a 15M rejection at a resistance level, SHORT conditions could emerge within the next 1–3h.
- **Primary blocker**: Prohibitive #6 blocks all longs; 1H RSI 2 pts below short threshold + 1H/4H MACD bullish contra-short; RANGE lower edge untested 43h+ (Gate 3 lower count = 1/2)

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Watch triggers (updated 16:00 ICT)**:
- SHORT trigger (hottest watch): ETH rally to $2,360–$2,400 with 1H RSI >65 + 1H MACD hist declining + 15M LH rejection candle → SHORT entry $2,365 limit, SL $2,415 ($50), TP1 $2,315 / TP2 $2,265 / TP3 $2,190, 0.60 ETH Tier 1
- RANGE lower edge (Gate 3 binding constraint): ETH retracement to $2,261–$2,275 with 15M bullish rejection candle → lower-edge count 2/2; Gate 3 becomes possible
- RANGE upper edge (Gate 3 partial): live 1H chart confirm of $2,332 bearish wick + volume contraction → upper-edge count 2/2
- BTC daily close May 11 ICT 07:00 vs EMA200 $82,228 → Prohibitive #6 re-evaluation; LONG eligible if close above
- 4H MACD gate limit: if hist reaches +8 to +10 → RANGE Gate 1 approaching limit; monitor
- CPI May 12 ~18:00 ICT: prohibitive macro buffer starts ~16:00 ICT May 12; any open position must account for this

**Manual verification needed**:
- ETH EMA200 1D: web est. ~$2,365–$2,367 vs prior journal ~$2,617 — critical discrepancy; verify on live 1D chart
- BTC EMA200 1D exact value (est. $82,228)
- Whale ratio from Bybit Trading Trend (est. ~1.28; no public API; manual only)
- Funding rate current 8h cycle (est. ~−0.0020%/8h; last confirmed May 9)
- OI 24h change (CoinGlass est. ~$35.6B; verify on Bybit)
- Upper-edge rejection candle: did $2,332 print as clear bearish wick on 1H chart with volume drop? (determines Gate 3 upper-edge count)
- 4H MACD exact histogram value at 16:00 ICT close on live chart (est. ~+3; confirm direction)
- 1H RSI exact value (est. ~63; confirm vs 65 SHORT threshold)
- CPI April 2026 release time on May 12 ICT (confirm exact release time)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 37th consecutive run; check journal directly)

---

### 2026-05-10 17:06 ICT — auto check

**Data source**: Web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked — sandbox egress allowlist, 31st+ consecutive affected run). Sources: CoinGecko, CoinMarketCap, Barchart, Coinalyze, CoinGlass, web aggregates; 4H MACD +3.0 and 1H RSI trajectory carried from prior 16:00 ICT entry; price from CoinGecko/CMC consensus. Precision ±5%.

**Price**: $2,325 (Δ +0.97% 24h; 24h high ~$2,331; 24h low $2,302; vol ~$14B USDT)

**Decision**: NO_SETUP

**Market state**:
- 24h: high $2,331, low $2,302, vol ~$14B USDT
- BTC: ~$81,500 (below 1D EMA200 est. ~$82,228; gap ~$728; Prohibitive #6 active)
- 4H structure: LH/LL bearish macro — LH $2,400 (May 6) → LL $2,261 (May 8) → bounce to ~$2,325; price 19h above $2,302 low but still below 4H EMA100 (~$2,348–$2,352); unconfirmed HL forming
- Indicators (1H): RSI ~61 (trajectory: 53→61→63 at 16:00 ICT → ~61 on slight pullback from $2,331 high); MACD hist ~+2.5 (slightly bullish, flattening); EMA50 ~$2,318; BB: Lower ~$2,290 / Mid ~$2,316 / Upper ~$2,342
- Indicators (4H): RSI ~52; MACD hist ~+3.0 (POSITIVE — turned bullish from deeply negative levels over recent sessions, inside [−10,+10] range-gate); EMA50 ~$2,318; EMA100 ~$2,348–$2,352 (resistance); BB: wide (~$2,250–$2,430, not flat)
- Indicators (1D): RSI ~49 (neutral, recovering from Apr lows ~35); MACD hist negative (bearish, confirmed); EMA200 ~$2,367 (price −$42 = −1.8% below); ETH below 20/50/100/200-day EMAs
- Indicators (15M): RSI ~55 (neutral); MACD hist ~+1.5
- Funding: −0.0020%/8h (negative; structural LONG bonus if not blocked by other conditions)
- OI: manual verification needed (API blocked; est. ~$35B per prior runs)
- L/S ratio: ~1.28 (56% long / 44% short per web aggregates; manual verification needed from Bybit Trading Trend)

**Pre-checks**:
- Multi-TF alignment LONG: FAIL — Prohibitive #6 hard-blocks all longs (1D MACD<0 confirmed + BTC $81,500 < EMA200 $82,228; 33rd consecutive blocked run)
- Multi-TF alignment SHORT: FAIL — 1H RSI 61 (needs >65 for SHORT alignment; 4 points below threshold); 4H MACD hist +3.0 (positive/bullish side, actively contra-short); 15M RSI ~55 (not >70)
- Range pre-check: FAIL — Gate 3: 24h range $2,302–$2,331 = $29 = 1.25% < 1.5% minimum width; Gate 4: 4H BB wide (upper ~$2,430, lower ~$2,250, band width ~$180 = ~7.7%) — not flat; Gates 1+2 PASS (+3.0 within [−10,+10], ATR contracting)
- News Impact Score:
  - CLARITY Act Senate vote May 14 (regulatory): IS = 1 × 3 × 1.5 = **4.5** (approaching systemic event; not a current 1–2h macro blocker; no trade within 1–2h of the May 14 vote)
  - 113k ETH exchange inflows (May 8, 2d old): IS = 2 × 1 × 1.0 = **2.0** (informational, one-off)
  - Max IS: 4.5 < 10 → informational; no size adjustment; no prohibitive headlines
- Prohibitive conditions: LONG Prohibitive #6 active; SHORT multi-TF alignment fails; RANGE Gates 3+4 fail

**Reasoning**:
- **LONG — HARD BLOCKED**: Prohibitive #6 for 33rd consecutive run. BTC $81,500 vs EMA200 ~$82,228 (gap ~$728, ~0.9%). 1D MACD histogram confirmed negative. Next re-evaluation: BTC daily close at ICT 07:00 May 11 (UTC 00:00).
- **SHORT — NO_SETUP**: 1H RSI at ~61 peaked at 63 in the 16:00 ICT run during the $2,331 high probe; slight pullback to $2,325 eased RSI. For a valid SHORT: need price to rally to $2,360–$2,400 (4H EMA100 $2,348–$2,352 + 1D EMA200 ~$2,367 cluster), 1H RSI crossing >65, AND 4H MACD hist turning down from +3. Currently 4H MACD +3.0 is an active contra-short signal. The $2,331–$2,332 area printed a possible upper-edge rejection but RSI never crossed 65 — no valid SHORT here.
- **RANGE — NO_SETUP**: Gates 1+2 PASS (4H MACD +3 inside gate, ATR likely contracting). Gate 3: 24h intraday range ($2,302–$2,331 = 1.25%) below 1.5% minimum; wider range using May 8 LL ($2,261–$2,331 = 3.1%) has sufficient width but lower-edge count remains 1/2 (untested for ~43h+). Gate 4: 4H BB still wide. Both Gates 3+4 fail. Structure approaching range conditions but not there yet.
- **Notable 4H MACD context**: histogram has progressed from deeply negative (prior weeks) → near zero → now +3.0 (positive). This is a meaningful momentum shift. If Prohibitive #6 lifts (BTC crosses EMA200 daily), bullish 4H MACD would add a strong bonus confirmation to a LONG setup. For SHORT it remains a contra-signal to monitor.
- **Primary blocker**: LONG blocked by Prohibitive #6; SHORT blocked by 1H RSI 4pt below threshold + 4H MACD contra-short signal; RANGE blocked by narrow 24h range width and wide BB bands.

**Live setup details**: N/A

**Pending order suggestion**: N/A

**Watch triggers**:
- SHORT (active watch): ETH rally to $2,360–$2,400 with 1H RSI >65 + 4H MACD hist turning negative + 15M LH rejection candle → hypothetical entry $2,365, SL $2,415 ($50 dist), TP1 $2,315 / TP2 $2,265 / TP3 $2,190 (7.4% move), size 0.60 ETH Tier 1
- RANGE Gate 3 upper: confirm whether $2,331–$2,332 printed as bearish rejection on live 1H chart with volume drop (would make upper-edge count 2/2)
- RANGE Gate 3 lower: retracement to $2,261–$2,275 with 15M bullish rejection (lower-edge count still 1/2)
- LONG re-evaluation: BTC daily close May 11 ICT 07:00 vs EMA200 ~$82,228
- CPI buffer: avoid new positions after ICT ~16:00 May 12 (estimate; confirm exact release time)

**Manual verification needed**:
- ETH 1D EMA200 exact value on live chart (web est. ~$2,367; prior journal had ~$2,617 — critical discrepancy; the ~$2,367 estimate appears more consistent with recent data)
- BTC EMA200 1D exact value (est. $82,228)
- Whale ratio from Bybit Trading Trend (est. ~1.28; no public API)
- Funding current 8h cycle exact value (est. −0.0020%/8h)
- OI 24h change (manual; est. ~$35B)
- Live 1H chart: confirm $2,331–$2,332 as bearish wick rejection vs noise
- 4H MACD hist exact value at this hour's close (est. ~+3.0)
- 1H RSI exact value (est. ~61)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 38th consecutive run; check journal directly)
