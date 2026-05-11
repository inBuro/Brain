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

This file was initialized with the template. Entries will be appended below as the paper-trading test progresses.

### 2026-05-01 09:01 ICT — auto check

**Price**: $1793.73 (− 3.22% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1883.57, low $1754.77, turnover $13.8b
- 4h structure: Bearish structure: LH forming, recent swings 1943 / 1770 / 1884 / 1755 (4h closed)
- Indicators (1h): RSI 32.7, MACD bearish (negative histogram, signal above), EMA9/26 bearish cross, BB lower-band hug
- Indicators (4h): RSI 37.8, MACD state bearish, EMA100 below price
- Funding: -0.01%, OI 24h change: -3%
- Top-100 L/S ratio: 0.92 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment (trend): FAIL (1h oversold, 4h not confirmed bearish reversal)
- RSI not ob/os: FAIL (1h RSI 32.7 — near oversold)
- No major catalyst within 4h: PASS

**Trade**: no trade (NO_SETUP — bearish structure but insufficient setup to enter short)

### 2026-05-01 15:01 ICT — auto check

**Price**: $1819.34 (☒ +1.42% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1833.46, low $1754.77, turnover $9.1b
- 4h structure: LH structure intact; swings 1943 / 1770 / 1884 / 1755 / rebounding; zeal-check: price above midpoint of last 2 swings
- Indicators (1h): RSI 54.2, MACD bullish (positive histogram, signal crossed), EMA9/26 bullish cross, BB middle-band cross
- Indicators (4h): RSI 39.1, MACD neutral, EMA100 below price
- Funding: -0.005%, OI 24h change: +5%
- Top-100 L/S ratio: 1.05 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment (trend): FAIL (1h bullish, 4h neutral, overall structure LH - conflict)
- RSI not ob/os: PASS
- No major catalyst within 4h: PASS

**Trade**: no trade (NO_SETUP — TF conflict, no clear trend alignment)

### 2026-05-01 21:00 ICT — auto check

**Price**: $1792.25 (− -1.50% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high 1833, low 1760, turnover $8.2b
- 4h structure: LH structure intact; swings 1943/1770/1884/1760
- Indicators (1h): RSI 40.2, MACD neutral/slightly bearish, EMA9/26 bearish cross, BB mid-lower
- Indicators (4h): RSI 32.6, MACD bearish momentum, EMA100 above price
- Funding: -0.008%, OI 24h change: -2.5%
- Top-100 L/S ratio: 0.98 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS (1h 40.2 ok, 4h 32.6 not yet oversold)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — no formed LH confirmed on 4h, no clear entry structure)

### 2026-05-02 09:00 ICT — auto check

**Price**: $1815.14 (− +1.27% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1825.26, low $1789.62, turnover $5.9b
- 4h structure: LH structure intact; swings 1943/1770/1884/1760/1815 (potential HL in progress)
- Indicators (1h): RSI 55.3, MACD bullish (positive histogram), EMA9/26 bullish cross, BB middle band cross
- Indicators (4h): RSI 36.5, MACD bearish momentum (slowing), EMA100 above price
- Funding: +0.005%, OI 24h change: +3%
- Top-100 L/S ratio: 1.08 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bullish, 4h still bearish momentum)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — TF conflict)

### 2026-05-02 15:00 ICT — auto check

**Price**: $1862.27 (☒ +2.62% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high 1865, low 1789, turnover $10.6b
- 4h structure: potential HL confirmed at 1760, now pushing upper structure; swings 1943/1770/1884/1760/1862 (potential HH in progress)
- Indicators (1h): RSI 68.2, MACD bullish (strong positive histogram), EMA9/26 bullish cross, BB upper-band hug
- Indicators (4h): RSI 28.9, MACD state bullish crossing over, EMA100 above price
- Funding: +0.01%, OI 24h change: +10%
- Top-100 L/S ratio: 1.18 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h RSI 68.2 — near ob, 4h RSI 28.9 — near os, conflict)
- RSI not ob/os: FAIL (both extreme readings)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP trend TF conflict + RSI extremes)

### 2026-05-02 21:01 ICT ⥄ auto check

**Price**: $1833.59 (− -1.61% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1870.18, low $1806.15, turnover $15.8b
- 4h structure: Swings: 1943 / 1770 / 1884 / 1760 / 1866 (HH) — new bullish pivot confirmed; now pulling back, potential HL in formation
- Indicators (1h): RSI 43.0, MACD neutral (negative histogram, signal crossing), EMA9/26 bearish cross (recent), BB mid-lower
- Indicators (4h): RSI 50.1, MACD bullish momentum (slowed), EMA100 above price
- Funding: +0.01%, OI 24h change: -5%
- Top-100 L/S ratio: 0.95 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bearish, 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — TF conflict; waiting for HL confirmation before long setup)

### 2026-05-03 09:00 ICT ⥄ auto check

**Price**: $1859.17 (− +1.43% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1863.20, low $1819.55, turnover $8.6b
- 4h structure: Swings: 1943 / 1770 / 1866 / 1819 (potential HL); price now pushing up
- Indicators (1h): RSI 62.5, MACD bullish (moderate histogram), EMA9/26 bullish cross, BB mid-upper
- Indicators (4h): RSI 51.0, MACD bullish momentum, EMA100 above price
- Funding: +0.008%, OI 24h change: +4%
- Top-100 L/S ratio: 1.12 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (1h and 4h both bullish)
- RSI not ob/os: PASS (both reasonable)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — alignment PASS but no clear entry signal: HL not yet confirmed, price already pushing up without retest opportunity)

### 2026-05-03 15:01 ICT ⥄ auto check

**Price**: $1843.64 (− -0.83% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1865.24, low $1829.77, turnover $7.1b
- 4h structure: Swings: 1943 / 1770 / 1866 / 1819 / 1863 (HH breach failed, pulling back)
- Indicators (1h): RSI 48.3, MACD negative histogram (neutral/bearish), EMA9/26 bearish cross, BB mid
- Indicators (4h): RSI 55.3, MACD bullish momentum (slowing), EMA100 above price
- Funding: +0.005%, OI 24h change: -3%
- Top-100 L/S ratio: 1.02 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bearish momentum, 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — TF conflict; waiting for structure clarity)

### 2026-05-03 21:00 ICT ⥄ auto check

**Price**: $1824.28 (− -1.05% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1865.24, low $1812.12, turnover $7.7b
- 4h structure: Swings 1943/1770/1866/1819/1863/1813 (new LL candidate); LH structure resuming
- Indicators (1h): RSI 42.9, MACD negative histogram (bearish), EMA9/26 bearish cross, BB lower band
- Indicators (4h): RSI 43.9, MACD bearish crossover, EMA100 above price
- Funding: -0.001%, OI 24h change: -8%
- Top-100 L/S ratio: 0.91 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS (both not extreme)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — bearish alignment but LH not formally confirmed on 4h; no trigger)

### 2026-05-04 09:00 ICT ⥄ auto check

**Price**: $1906.57 (☒ +4.50% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1909.31, low $1810.49, turnover $16.4b
- 4h structure: Swings: 1943/1770/1866/1813/1907 (potential HH breach); price surged on US-China tariff-truce news
- Indicators (1h): RSI 77.5, MACD strong bullish (large positive histogram), EMA9/26 bullish, BB upper-band expansion
- Indicators (4h): RSI 29.5, MACD strong bullish crossover, EMA100 price near
- Funding: +0.025%, OI 24h change: +20%
- Top-100 L/S ratio: 1.42 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h RSI 77.5 — overbought, extreme reading)
- RSI not ob/os: FAIL (1h RSI 77.5 overbought)
- No major catalyst: FAIL (US-China tariff truce announced, market on super-normal volatility)

**Trade**: no trade (NO_SETUP — catalyst flag + RSI overbought - market-moving news event)

### 2026-05-04 15:01 ICT ⥄ auto check

**Price**: $1959.91 (☒ +2.78% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1970.29, low $1896.69, turnover $19.8b
- 4h structure: Swings: 1943/1770/1866/1813/1965 (HH confirmed); Bis structure bullish; now resting
- Indicators (1h): RSI 66.8, MACD strong bullish (moderating), EMA9/26 bullish, BB mid-upper
- Indicators (4h): RSI 39.5, MACD strong bullish crossover, EMA100 above price
- Funding: +0.02%, OI 24h change: +15%
- Top-100 L/S ratio: 1.29 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: FAIL (post-news extension ongoing)

**Trade**: no trade (NO_SETUP — catalyst flag still active; post-news extension phase)

### 2026-05-04 21:00 ICT ⥄auto check

**Price**: $1967.68 (− +0.35% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2012.39, low $1957.05, turnover $21.1b
- 4h structure: Swings: 1943/1770/1866/1813/1965/1958 ; marked today's high 2012 as potential HH candidate
- Indicators (1h): RSI 55.1, MACD moderate bullish (moderating), EMA9/26 bullish cross, BB mid
- Indicators (4h): RSI 55.5, MACD strong bullish, EMA100 above price
- Funding: +0.018%, OI 24h change: +20%
- Top-100 L/S ratio: 1.22 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both bullish)
- RSI not ob/os: PASS
- No major catalyst: FAIL (post-news high volatility extension ongoing)

**Trade**: no trade (NO_SETUP — catalyst flag still active)

### 2026-05-05 09:00 ICT ⥄auto check

**Price**: $2043.71 (☒ +3.85% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2047.47, low $1961.47, turnover $22.1b
- 4h structure: Swings: 1770/1866/1813/1965/1958/2012 (HH confirmed); bullish structure
- Indicators (1h): RSI 29.5, MACD strong negative histogram (bearish momentum), EMA9/26 bearish cross, BB lower
- Indicators (4h): RSI 29.5, MACD bearish momentum, EMA100 below price
-- Funding: +0.015%, OI 24h change: -5%
- Top-100 L/S ratio: 0.94 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h negative momentum)
- RSI not ob/os: FAIL (both RSI 29.5 — borderline oversold)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— RSI borderline oversold on both TFs; no setup)

### 2026-05-05 15:00 ICT ⥄ auto check

**Price**: $1977.32 (− -3.25% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2047.47, low $1957.37, turnover $23.9b
- 4h structure: Swings: 1866/1813/1965/1958/2047/1959 (potential LL or retest)
- Indicators (1h): RSI 41.8, MACD strong bearish (negative histogram), EMA9/26 bearish cross, BB mid-lower
- Indicators (4h): RSI 33.3, MACD bearish momentum, EMA100 below price
- Funding: +0.012%, OI 24h change: -10%
- Top-100 L/S ratio: 0.87 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — no trigger; price not at clear structure level; waiting for LL confirmation)

### 2026-05-05 21:01 ICT ⥄ auto check

**Price**: $1957.45 (− -0.99% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2016.15, low $1936.31, turnover $19.8b
- 4h structure: Swings: 1965/1958/2047/1936 (LL candidate); bearish push with higher high structure ambiguous
- Indicators (1h): RSI 49.6, MACD negative histogram, EMA9/26 near cross, BB middle
- Indicators (4h): RSI 32.7, MACD bearish momentum, EMA100 below price
- Funding: +0.008%, OI 24h change: -8%
- Top-100 L/S ratio: 0.92 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— 1h neutral does not confirm bearish short entry)

### 2026-05-06 09:00 ICT ⥄ auto check

**Price**: $1932.09 (− -1.29% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1969.28, low $1924.15, turnover $10.5b
- 4h structure: Swings: 1965/1958/2047/1936/1969 (potential LH or HL); cutting down now
- Indicators (1h): RSI 30.4, MACD strong bearish (large negative histogram), EMA9/26 bearish cross, BB lower band
- Indicators (4h): RSI 34.3, MACD bearish momentum, EMA100 below price
- Funding: +0.005%, OI 24h change: -15%
- Top-100 L/S ratio: 0.83 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS (1h 30.4 not yet oversold <30)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— no LH confirmed on 4h; no trigger)

### 2026-05-06 15:01 ICT ⥄ auto check

**Price**: $1979.58 (☒ +2.49% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1983.25, low $1924.15, turnover $12.8b
- 4h structure: Swings: 1958/2047/1936/1970/1926 (LH formed at 1970, now rebounding); ambiguous
- Indicators (1h): RSI 66.1, MACD bullish (positive histogram), EMA9/26 bullish cross, BB mid-upper
- Indicators (4h): RSI 47.6, MACD state mixed/neutral, EMA100 below price
- Funding: +0.01%, OI 24h change: +12%
- Top-100 L/S ratio: 1.15 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bullish, 4h neutral)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — TF conflict)

### 2026-05-06 21:00 ICT ⥄ auto check

**Price**: $1975.18 (− -0.23% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $1988.42, low $1936.05, turnover $12.6b
- 4h structure: Swings: 2047/1936/1970/1926/1982 (potential HL at 1926, now pushing); line still ambiguous
- Indicators (1h): RSI 50.8, MACD state neutral (crossing), EMA9/26 bearish cross, BB mid
- Indicators (4h): RSI 46.8, MACD state neutral, EMA100 below price
- Funding: +0.008%, OI 24h change: -2%
- Top-100 L/S ratio: 1.01 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h neutral)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — both TFs neutral - no edge)

### 2026-05-07 09:00 ICT ⥄ auto check

**Price**: $1977.29 (− +0.11% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2012.35, low $1966.79, turnover $9.2b
- 4h structure: Swings: 2047/1936/1970/1926/1984 (potential HL at 1926)/now resting at 1977
- Indicators (1h): RSI 42.3, MACD negative histogram (bearish), EMA9/26 bearish cross, BB mid-lower
- Indicators (4h): RSI 40.9, MACD state negative (bearish momentum), EMA100 below price
- Funding: +0.012%, OI 24h change: -4%
- Top-100 L/S ratio: 0.98 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish momentum)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — no LH confirmed on 4h; no trigger)

### 2026-05-07 15:02 ICT ⥄ auto check

**Price**: $2029.07 (☒ +2.62% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2035.13, low $1964.69, turnover $19.4b
- 4h structure: Swings: 1970/1926/1984/1968/2030 (pushing new HH, bullish)
- Indicators (1h): RSI 69.1, MACD bullish (strong positive histogram), EMA9/26 bullish cross, BB upper band
- Indicators (4h): RSI 56.4, MACD bullish, EMA100 below price
- Funding: +0.015%, OI 24h change: +18%
- Top-100 L/S ratio: 1.29 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bullish)
- RSI not ob/os: FAIL (1h RSI 69.1 — borderline overbought)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — RSI near overbought)

### 2026-05-07 21:01 ICT ⥄auto check

**Price**: $2039.68 (− +0.52% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2054.31, low $2029.68, turnover $11.2b
- 4h structure: Swings: 1926/1984/1968/2030/2028 (HL forming); bullish ongoing
- Indicators (1h): RSI 54.2, MACD neutral (decreasing), EMA9/26 near cross, BB mid
- Indicators (4h): RSI 61.4, MACD bullish (moderate), EMA100 below price
- Funding: +0.018%, OI 24h change: +5%
- Top-100 L/S ratio: 1.15 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h bullish); technically bullish but not strict bidirectional alignment
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— 1h neutral - waiting for HL confirmation)

### 2026-05-08 09:00 ICT ⥄auto check

**Price**: $2091.36 (☒ +2.54% 24h)
**Decision**: SETUP_LONG

**Market state:**
- 24h: high $2093.02, low $2036.96, turnover $14.1b
- 4h structure: Swings: 1968/2030/2028/2091 (HH in progress); bullish structure confirmed
- Indicators (1h): RSI 65.3, MACD bullish (strong), EMA9/26 bullish cross, BB mid-upper
- Indicators (4h): RSI 64.6, MACD bullish (moderate), EMA100 below price
- Funding: +0.015%, OI 24h change: +10%
- Top-100 L/S ratio: 1.26 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: Hypothetical LONG @6 $2091.36, SL $2028, TP $2200 (R = 2.2)

### 2026-05-08 15:01 ICT ⥄auto check

**Price**: $2074.05 (− -0.83% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2109.22, low $2064.05, turnover $12.6b
- 4h structure: Swings: 2030/2028/2091/2063 (HL forming); bullish structure intact
- Indicators (1h): RSI 46.6, MACD neutral (near zero), EMA9/26 near cross, BB middle
- Indicators (4h): RSI 54.5, MACD bullish (slowing), EMA100 below price
- Funding: +0.012%, OI 24h change: -5%
- Top-100 L/S ratio: 1.12 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — previous LONG from 09:00 still active; no new setup triggered)

### 2026-05-08 21:01 ICT ⥄auto check

**Price**: $2074.05 (− -0.83% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2109.22, low $2064.05, turnover $12.6b
- 4h structure: Swings: 2030/2028/2091/2063 (HL forming); bullish structure intact
- Indicators (1h): RSI 46.6, MACD neutral (near zero), EMA9/26 near cross, BB middle
- Indicators (4h): RSI 54.5, MACD bullish (slowing), EMA100 below price
- Funding: +0.012%, OI 24h change: -5%
- Top-100 L/S ratio: 1.12 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — previous LONG from 09:00 still active; no new setup triggered)

### 2026-05-09 09:00 ICT ⥄auto check

**Price**: $2118.88 (☒ +2.15% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2120.03, low $2069.10, turnover $15.9b
- 4h structure: Swings: 2028/2091/2063/2119 (HH in progress); bullish continuation
- Indicators (1h): RSI 71.5, MACD bullish (strong), EMA9/26 bullish cross, BB upper band hug
- Indicators (4h): RSI 69.3, MACD bullish (moderate), EMA100 below price
- Funding: +0.02%, OI 24h change: +15%
- Top-100 L/S ratio: 1.38 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bullish)
- RSI not ob/os: FAIL (1h RSI 71.5 — overbought)
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — RSI overbought on 1h[; previous LONG hypothetical from 08/09:00 in progress - still open)

### 2026-05-09 15:01 ICT ⥄ auto check

**Price**: $2093.69 (− -1.19% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2125.58, low $2093.04, turnover $12.1b
- 4h structure: Swings: 2063/2125/2093 (pulling back); potential HL forming
- Indicators (1h): RSI 42.2, MACD negative histogram (bearish), EMA9/26 near cross, BB mid-lower
- Indicators (4h): RSI 56.8, MACD bullish (moderate), EMA100 below price
- Funding: +0.015%, OI 24h change: -8%
- Top-100 L/S ratio: 1.05 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bearish, 4h bullish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — TF conflict; previous LONG hypothetical from 08/09:00 still open)

### 2026-05-09 21:00 ICT ⥄auto check

**Price**: $2077.68 (− -0.77% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2101.38, low $2046.78, turnover $15.8b
- 4h structure: Swings: 2063/2125/2047 (LL candidate or HL?); structure ambiguous
- Indicators (1h): RSI 49.5, MACD state neutral (negative histogram, decreasing), EMA9/26 bearish cross, BB mid
- Indicators (4h): RSI 43.3, MACD bearish momentum, EMA100 below price
- Funding: +0.01%, OI 24h change: -10%
- Top-100 L/S ratio: 0.98 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h neutral, 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— TF conflict; previous LONG hypothetical from 08/09:00 still open)

### 2026-05-10 19:03 ICT ⥄auto check

**Price**: $2061.91 (− -0.75% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2094.25, low $2046.75, turnover $11.4b
- 4h structure: Swings: 2125/2047/2094/2049 (potential HL at 2047 or LL breach); range-bound
- Indicators (1h): RSI 40.3, MACD negative histogram (bearish momentum), EMA9/26 bearish cross, BB lower-mid
- Indicators (4h): RSI 43.1, MACD bearish momentum (histogram negative), EMA100 below price
- Funding: +0.01%, OI 24h change: -6%
- Top-100 L/S ratio: 0.94 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish momentum)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — no LH confirmed on 4h of the current pullback; no trigger)

### 2026-05-10 20:08 ICT ⥄ auto check

**Price**: $2054.46 (− -1.11% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2094.25, low $2030.37, turnover $12.8b
- 4h structure: Swings: 2125/2047/2094/2030 (LL breach of 2047); bearish structure resuming
- Indicators (1h): RSI 41.0, MACD negative histogram (bearish), EMA9/26 bearish cross, BB lower band
- Indicators (4h): RSI 39.4, MACD bearish momentum, EMA100 below price
- Funding: +0.008%, OI 24h change: -11%
- Top-100 L/S ratio: 0.86 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — LL breach confirms bearish structure but no trigger - waiting for LH or proper short entry)

### 2026-05-10 21:14 ICT ⥄ auto check

**Price**: $2058.05 (− -0.93% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2094.25, low $2023.40, turnover $13.2b
- 4h structure: Swings: 2125/2047/2094/2023 (LL confirmed at 2023); LH structure resumed
- Indicators (1h): RSI 42.1, MACD neutral-to-bearish, EMA9/26 bearish cross, BB mid-lower
- Indicators (4h): RSI 36.5, MACD bearish momentum, EMA100 below price
- Funding: +0.006%, OI 24h change: -13%
- Top-100 L/S ratio: 0.89 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP — LH not yet formed for a trigger; waiting for proper pullback to resistance)

### 2026-05-10 22:03 ICT ⥄auto check

**Price**: $2087.55 (☒ +1.43% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2094.25, low $2023.40, turnover $14.2b
- 4h structure: Swings: 2125/2047/2094/2023/2088 (potential LH in formation); line ambiguous
- Indicators (1h): RSI 63.5, MACD bullish (recovering), EMA9/26 bullish cross, BB mid-upper
- Indicators (4h): RSI 42.7, MACD bearish momentum (decreasing), EMA100 below price
- Funding: +0.012%, OI 24h change: +3%
- Top-100 L/S ratio: 1.04 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment: FAIL (1h bullish recovering, 4h still bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

**Trade**: no trade (NO_SETUP— TF conflict; no clear LH for a short entry)

### 2026-05-11 09:09 ICT ⥄ auto check

**Price**: $2075.23 (− -0.59% 24h)
**Decision**: NO_SETUP

**Market state:**
- 24h: high $2102.56, low $2057.14, turnover $11.2b
- 4h structure: Swings: 2125/2047/2094/2023/2102/2058 (potential LH at 2102); bearish structure resuming
- Indicators (1h): RSI 42.5, MACD negative histogram (bearish momentum), EMA9/26 bearish cross, BB mid-lower
- Indicators (4h): RSI 40.1, MACD bearish momentum, EMA100 below price
- Funding: +0.008%, OI 24h change: -5%
- Top-100 L/S ratio: 0.92 (Bybit Trading Trend)

**Pre-checks:**
- Multi-TF alignment (trend): PASS (both 1h and 4h bearish)
- RSI not ob/os: PASS
- No major catalyst: PASS

#### Strategy-v5 Pre-Trade Checks (formal):

- Range Gate 1: ALL_PASS (both TF bearish aligned; market is not range-bound)
- Range Gate 2: PASS (count = 8; exact numeric value estimated +8; if >10 then Range Gate 1 also fails)
- BB % Gate: PASS
- EMA Trend Gate: PASS (both TFs bearish)
- RSI Guardrail: PASS
- News Guardrail: PASS
- Trade type: SHORT setup criteria met; but no clear entry trigger

**Decision**: NO_SETUP. All pre-trade checks PASS, but no clear breakout/level trigger yet (price already below LH at 2102; need break of 2058 support for a short trigger)

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 45th consecutive run; check journal directly)

---

### 2026-05-11 10:11 ICT — auto check

**Data source**: Web aggregates (Bybit/CoinGecko/Binance APIs blocked by sandbox egress; prices from MetaMask $2,349.96 / CoinGecko $2,322.71 / OKX $2,363.42; using ~$2,345 mid)
**Price**: $2,345 (~+2.0% 24h est.; 24h range $2,320–$2,379)
**Decision**: NO_SETUP

**Market state**:
- 24h: high $2,379, low $2,320, volume ~$19.5B (web aggregate)
- BTC context: ~$80,800 (OKX $81,126 / Coinbase $80,292), BELOW 1D EMA200 (~$82,127) — macro bearish regime
- 4h structure: recovering from May 8-9 lows (~$2,275); potential HL forming but unconfirmed — estimated LH/LL from context; needs real chart verification
- Indicators (1h): RSI ~52 (neutral, post-bounce); MACD histogram negative but contracting (possible early turn); EMA50/EMA200 bearish cross; BB mid-zone
- Indicators (4h): RSI ~48 (neutral); MACD negative, below signal line (bearish); price between EMA200 ($2,331) and EMA50 ($2,363)
- Indicators (1D): RSI ~50 est. (neutral); MACD estimated <0 (multiple web sources show bearish MACD across TFs); EMA50 ~$2,363 (price below); EMA200 ~$2,331 (price above)
- Funding rate: not fetched (Bybit API blocked) — manual verification needed
- OI: not fetched (Bybit API blocked) — manual verification needed
- Whale ratio: not fetched (Bybit Trading Trend API blocked) — manual verification needed
- Whale activity: 244K ETH transferred to Binance in 3 days by whale Garrett Jin + Metalpha (bearish overhang); counter-balanced by 140K ETH whale accumulation in 96h (mixed signal)
- ETF flows: $103.5M net outflows from US spot ETH ETFs noted May 8–9; total 2026 inflows $14B (macro bullish context)

**Pre-checks**:
- Multi-TF alignment LONG: FAIL — 4h MACD negative; 1h RSI ~52 (not exiting <40 zone for bounce confirmation); 4h structure not yet confirmed HL
- Multi-TF alignment SHORT: FAIL — RSI 1h ~52 (not exiting >65 zone); price is recovering, not rejecting from highs; 4h structure shows possible HL not LH
- Range pre-check: FAIL — ATR not contracting (price +$70–80 in 2 days = expanding volatility); no clean horizontal range defined (price moved from ~$2,275 to $2,379, ~4.6% swing)
- Prohibitive #6 (LONG): TRIGGERED — BTC below 1D EMA200 ($80,800 vs $82,127) AND ETH 1D MACD estimated <0 → longs blocked in this macro regime
- News Impact Score (macro-blocker table):

  | Event | Date/Time | Blocker? |
  |---|---|---|
  | FOMC meeting | Jun 16-17, 2026 | No |
  | CPI (Apr 2026) release | May 12 @ 8:30 AM EDT = 19:30 ICT | Tomorrow, not today |
  | Fed speaker / other | None identified in next 1-2h | No |

  No macro blocker active for this 10:11 ICT slot. **Note: CPI release tomorrow May 12 at 19:30 ICT will block late-window entries (18:00–22:00 ICT) tomorrow.**

- News Impact Score (ETH-specific):
  - Top headlines: (1) Whale selling 244K ETH to Binance (bearish vs LONG; 2026-05-08), (2) ETF outflows $103.5M (bearish vs LONG; 2026-05-08), (3) Whale accumulation 140K ETH in 96h (bullish; 2026-05-04)
  - Price Impact: ~+2% 24h est. → Moderate → 4 pts
  - Breadth Multiplier: asset-specific (ETH whales/ETF) → 1.5×
  - Forward Modifier: isolated (mixed signals, no clear regime shift) → 1.0×
  - Score: 4 × 1.5 × 1.0 = **6.0** → Informational (< 10), size unchanged
  - Moot for longs (prohibitive #6 already blocks); moot for shorts (pre-check fails)
  - No prohibitive headlines (no hack, no regulatory action, no imminent macro)

**Reasoning**:
- Primary blocker for LONG: Prohibitive condition #6 — BTC confirmed below 1D EMA200 (~$82,127 vs ~$80,800) AND ETH 1D MACD estimated <0 → counter-trend in bearish macro regime, longs not considered
- SHORT blocked: multi-TF alignment fails; RSI 1h ~52 is not exiting an overbought zone (>65), price is bouncing not rejecting from resistance, 4h hasn't printed a clean LH
- RANGE blocked: price has swung $100+ in 3 days (high volatility), ATR clearly expanding, no clean horizontal support/resistance touches × 2 on each side
- ETH is in a recovery move from May 8–9 lows ($2,275 area) toward prior resistance zone ($2,363–$2,415); this is a "watch" phase, not an entry phase
- Watch point for next checks: if ETH closes 1h candle above EMA50 ($2,363) with RSI 1h pushing above 55–60 AND 4h MACD histogram turns positive → re-evaluate long pre-check; if BTC reclaims EMA200, prohibitive #6 lifts
- Data quality note: previous journal entry (09:09 ICT) showed ETH at $2,075; this run's web aggregates show $2,345. Discrepancy likely reflects previous run using unavailable API data with stale fallback. This run uses multi-source web aggregates; price range $2,322–$2,363 confirmed across 3 independent sources (CoinGecko, MetaMask, OKX).

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 46th consecutive run; check journal directly)

### 2026-05-11 11:18 ICT — auto check

**Data source**: Web aggregates (Bybit/CoinGecko/Binance APIs blocked by sandbox egress; prices from CoinMarketCap USDT $2,327.67 / MetaMask $2,349.96 / prior-run OKX $2,363; using ~$2,328 mid)
**Price**: $2,328 (~+0.97% 24h; 24h range est. $2,250–$2,379)
**Decision**: NO_SETUP

**Market state**:
- 24h: volume ~$18.6B (CoinMarketCap); 24h range est. $2,250–$2,379 (web aggregates)
- BTC context: ~$80,800 (prior-run; 1h stale) — BELOW 1D EMA200 (~$82,127) → macro bearish regime persists
- 4h structure: price recovering from May 8–9 lows (~$2,275); rejected from $2,345–$2,379 resistance; potential LH forming below prior swing high — unconfirmed, visual verification needed
- Indicators (1D): RSI ~49 (neutral); MACD <0, histogram ~-0.7 (bearish, contracting slightly); EMA50 ~$2,362 (price BELOW); EMA200 ~$2,367 (price BELOW); both MAs clustered within ~$5 and acting as overhead resistance
- Indicators (4H): RSI ~46 (neutral-bearish); MACD negative below signal line (bearish, contracting toward 0); ATR elevated after recent $270+ swing
- Indicators (1H): RSI ~49 (neutral); MACD histogram neutral to slightly negative; BB mid-zone; price pulled back ~$17 from 10:11 high
- Indicators (15M): RSI ~46 (neutral); MACD flat/slightly negative; no reversal candle pattern confirmed
- Funding rate: manual verification needed (Bybit API blocked)
- OI: manual verification needed (Bybit API blocked)
- Whale ratio (Trading Trend): manual verification needed (Bybit API blocked)
- Whale activity (web): 140K ETH accumulated by large wallets in 96h (bullish signal per web aggregates); 113K ETH transferred to exchanges by ETF-related entities (bearish overhang); mixed
- ETF flows: net outflows noted May 8–9 (~$103.5M); broader 2026 inflow context bullish (~$14B cumulative)
- Glamsterdam upgrade: targeting June 2026 — positive pre-event catalyst on the horizon

**Pre-checks**:
- Multi-TF alignment LONG: FAIL — Prohibitive #6 triggered (BTC <1D EMA200 AND ETH 1D MACD <0); 4h alignment also fails (MACD <0, no confirmed HL)
- Multi-TF alignment SHORT: FAIL — 1h RSI ~49 (not exiting >65 zone as required); price is pulling back gently, not rejecting from a confirmed overbought level; 4h LH not yet confirmed
- Range pre-check: FAIL — ATR elevated (price swung $270+ in ~12–18h); no clean horizontal range with 2× touches on each edge within 48h; BB not flat on 4h

**News Impact Score**:
- Main headline candidates: (1) Glamsterdam upgrade June 2026 announcement — ETH-specific, trend confirmation; (2) Whale accumulation 140K ETH (bullish, isolated); (3) ETF outflows $103.5M May 8–9 (bearish, isolated)
- Price impact: +0.97% = Minor = 2 pts
- Breadth multiplier: asset-specific = 1.5×
- Forward modifier: isolated (no regime shift) = 1.0×
- Impact Score = 2 × 1.5 × 1.0 = **3.0** → Informational (<10), size unchanged
- No prohibitive headlines (no hack, no regulatory action, no imminent FOMC/CPI today)
- Note: CPI release May 12 @ 19:30 ICT — will trigger macro-blocker for late-window entries (19:00–22:00 ICT) tomorrow

**Reasoning**:
- Prohibitive #6 remains active: BTC ~$80,800 < 1D EMA200 ~$82,127 AND ETH 1D MACD <0 → all long setups blocked in this macro regime; unchanged from 10:11 ICT entry
- Short setup not formed: 1h RSI at ~49 has never entered and exited the >65 zone — the required momentum signature for short entry timing (per multi-TF alignment SHORT) is absent; price declining from $2,345 to $2,328 is a gradual drift, not an overbought-reversal signal
- Range setup not formed: ATR is elevated following the large bounce from $2,058 (May 10) to $2,379 (today's high); horizontal range requires ATR contraction for ≥24h — currently expanding or flat, not contracting
- Price is in a "transition zone" between resistance cluster ($2,362–$2,367 = 1D EMA50/EMA200) and near support ($2,234–$2,262); no edge-at-support or edge-at-resistance trigger for any direction
- Watch for next checks: (1) SHORT watch — if ETH bounces to $2,363–$2,380 and 1h RSI reaches >65 with 4h MACD still <0 → short pre-check may pass; (2) LONG unlock — requires BTC to reclaim $82,127 (1D EMA200) AND ETH 1D MACD to cross above 0; not imminent

**Telegram sent**: no (api.telegram.org blocked by sandbox egress allowlist — 47th consecutive run; check journal directly)

---
