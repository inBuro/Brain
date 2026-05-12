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
- RSI not ob/os: PASS | FAIL
- No major catalyst within 4h: PASS | FAIL

**Trade**: no trade | Hypothetical [LONG | SHORT] @ $X, SL $Y, TP $Z
```

---

## Journal entries

### 2026-04-30 - journal initialized

This file was initialized with the template. Entries will be appended below as the paper-trading test proceeds.

### 2026-05-12 14:05 ICT — auto check

**Data source**: web search aggregates (Bybit/CoinGecko/Binance REST APIs blocked by sandbox egress allowlist; data synthesised from CoinMarketCap, TradingView aggregated signals, Investing.com snippets, search result summaries)
**Price**: $2,320 (Δ −0.96% 24h)
**Decision**: NO_SETUP

**Market state**:
- Price context: ETH consolidating in $2,200–$2,400 range since April; current price $2,320 sits at ~56% of the $2,260–$2,367 sub-range (midpoint ~$2,314)
- 1D structure: ETH below both EMA50 ($2,361) and EMA200 ($2,367) — key resistance cluster; bearish macro structure
- 1D RSI: 53.46 (neutral, no extreme)
- 1D MACD: below signal line, histogram ≈ −0.7 (slightly bearish, but contracting — flattening momentum)
- 4h structure: Bollinger Band squeeze in progress; bands contracting, price coiling; 4h MACD near zero (within −10/+10 band); ATR declining (implied by BB squeeze)
- 1h RSI: ~48.6 (neutral; not at oversold/overbought extreme)
- BTC: $82,127 — below its 1D EMA200 ($82,228); bearish macro regime confirmed
- Funding rate: slightly positive (~+0.005%, longs paying); not at prohibitive level (>0.025%)
- OI: $35.61B (elevated); no sharp directional change data available
- Whale ratio / L/S ratio: not available via API — **manual verification needed**
- Whale on-chain: 140,000 ETH accumulated in ~96h (approximately $322M) — bullish accumulation signal
- Spot ETH ETF inflows: positive streak continuing (BlackRock/Fidelity led $101M single-session on 2026-05-01); institutional demand rebuilding
- News: U.S. Senate Banking Committee hearing on Digital Asset Market Clarity Act on 2026-05-14 (2 days away, no immediate impact); Base blockchain "Azul" upgrade 2026-05-13 (tomorrow, L2 news, asset-specific at most); Glamsterdam upgrade targeting June 2026 (not imminent). No prohibitive headlines.

**Pre-checks**:
- Multi-TF alignment LONG: **FAIL** — 4h MACD already below zero (no cross from below), 1h RSI ~48 (not exiting <40 oversold zone), price at midrange not at support edge
- Multi-TF alignment SHORT: **FAIL** — 1h RSI ~48 (not exiting >65 overbought zone), no LH forming on 1h, price at midrange not at resistance
- Prohibitive — counter-trend in bearish market (LONG): **TRIGGERED** — 1D MACD histogram <0 AND BTC below 1D EMA200 ($82,127 < $82,228). Longs blocked by this prohibitive regardless of base conditions.
- Prohibitive — mixed-market momentum (SHORT): **APPLIES** — 4h MACD near zero, no clear directional trend; momentum-based short would be invalid in this regime
- News Impact Score: estimated ~1 (negligible 24h move <1%, no catalyst within 1–2h) — below 10 threshold; informational only
- No prohibitive headlines: **PASS**
- Trading window (09:00–22:00 ICT): **PASS** — current time 14:05 ICT

**Reasoning**:
- LONG is doubly blocked: (1) hard prohibitive — counter-trend in bearish market (1D MACD <0, BTC <EMA200 1D); (2) multi-TF alignment fails — 4h MACD not crossing 0 from below, 1h RSI neutral
- SHORT fails on alignment — 1h RSI at 48 has not exited an overbought zone; no LH confirmed on 1h; price is not at a resistance edge that would justify a short trigger
- RANGE pre-checks 3/4 pass (4h MACD near zero, ATR declining, BB flat), but price is at the midpoint of the range ($2,320 ≈ midpoint $2,314), not at a tradeable edge; no valid entry
- RANGE_LONG would require price approaching $2,260 lower edge; RANGE_SHORT would require price approaching $2,367 upper edge
- Pending order eligibility: **WATCH** — neither edge is being tested right now; no pending order justified
- Bullish macro undercurrent (whale accumulation, ETF inflows) is a positive backdrop but does not override the prohibitive conditions or fix alignment

**Watch levels for next hours**:
- If price pulls back toward $2,260–$2,280 with rejection candle on 15m → RANGE_LONG candidate (watch for 15m rejection, then evaluate range pre-check 3: edge touched 2x minimum in last 24–48h)
- If price pushes up toward $2,361–$2,367 cluster with rejection → RANGE_SHORT candidate (but note EMA50/200 resistance here; tight SL required)
- Range width $2,260–$2,367 = 4.7% → satisfies ≥1.5% requirement for range trades
- Hypothetical range parameters (WATCH only, not a live suggestion):
  - RANGE_LONG entry $2,260, SL $2,242 (−18 pts, 0.8%), TP1 $2,314 (R:R 3.0), TP2 $2,367 (R:R 5.9), size 0.83 ETH ($15 risk, Tier 1)
  - RANGE_SHORT entry $2,367, SL $2,386 (+19 pts, 0.8%), TP1 $2,314 (R:R 2.8), TP2 $2,260 (R:R 5.7), size 0.79 ETH ($15 risk, Tier 1)

**Manual verification needed**:
- Whale ratio (Bybit Trading Trend tab) — critical for confirming long/short dominance before any entry
- Exact 4h candle structure (last 5 swing points: HH/HL/LH/LL) — not available from search aggregates
- 1h and 15m live candle close confirmation if price approaches $2,260 or $2,367
- Range pre-check 3: confirm both $2,260 and $2,367 each touched 2x with rejection in last 24–48h before activating pending order

**GitHub Issue**: skipped (NO_SETUP)
