# Pending Orders

**Summary**: When a probable setup is forming but not yet triggered, suggest concrete pending limit orders (with SL and all TPs pre-attached) that the trader can copy-paste into Bybit. Pending orders fire automatically on price touch — useful for closing the gap between manual scans, but require the rest of the strategy context to be locked in (no macro events, structure stable). Added 2026-05-01 as a v5 supplement.
**Sources**: [[strategy-v5]] + chat 2026-05-01
**Last updated**: 2026-05-01 (created)

---

## When to suggest pending orders

A pending order is appropriate when all the conditions below hold:

1. **Setup zone is concretely identified** — specific price level for entry (e.g. lower edge of range at $2,240, or major resistance at $2,330)
2. **Zone reachable in the near future** — current price action suggests the zone might be touched in the next 6-12h
3. **Structural pre-checks PASS NOW** — multi-TF alignment for trend trades, or range pre-check (4h MACD ≈ 0, ATR contracting, defined range with rejections) for range trades — already satisfied; only the price-trigger is pending
4. **Stable context window** — no macro events scheduled in the next 6-12h, news Impact Score not volatile
5. **Trader can monitor or accept fill** — not going off-grid for >12h

A pending order isn't appropriate when any of the conditions below hold:

1. **Macro event in next 12h** — FOMC, CPI, Fed Chair speech, central bank decision. Pending orders would auto-fill into volatility spike (per the 2026-04-29 conversation about Powell speeches: don't bracket macro events).
2. **Setup conditions still developing** — e.g. 4h MACD might cross out of the range zone, or RSI may move out of valid range. Wait until conditions are locked.
3. **Zone arrival > 12h away** — too speculative; price may go elsewhere, conditions may change.
4. **News Impact Score in 10-20 grey zone** — could shift to ≥20 (skip) before fill.
5. **Whale ratio extreme** (>1.3 or <0.8) — sentiment could shift before fill.
6. **Counter-trend in current macro regime** — even if structurally setup is fine, prohibitive #6 blocks entry; no pending order either.
7. **Trader will be away for >24h with no manual override possible** — open pending orders into unmonitored time create blind risk.

## What every pending-order suggestion MUST include

Skipping any field below = incomplete suggestion. The trader shouldn't have to compute anything; just copy fields into Bybit.

- **Entry**: limit price + reason (which level, which technical confluence)
- **SL**: price + structural invalidator (which level, why it's a hard stop)
- **TP1, TP2, TP3 (trend) or TP1, TP2 (range)**: all prices + R:R + percentage of position
- **Position size**: Tier-aware. Tier 1: $30 trend / $15 range. Tier 2: $40 trend / $20 range. ETH amount = risk / (SL distance in points)
- **Time validity**: "Cancel if not filled by HH:MM ICT" — typically 6-12h from suggestion, longer for range trades (12-18h)
- **Manual cancel triggers**: explicit list of events that should cause manual cancellation (price closes outside range with volume, BTC regime shift, macro headline appears, etc.)

## Order types on Bybit

- **Limit order** — fires when price touches the limit price, fills at that price or better. Use for setup-zone entries.
- **Stop-limit / Stop-market** — fires when price crosses a trigger; places a limit (or market) order at the specified price. Use for breakout/breakdown trades — but NEVER bracket macro events with stop-orders (whipsaw risk; both stops can fire in the same candle).
- **Conditional order with TP/SL bundle** — Bybit allows attaching TP/SL to a pending order so they activate on fill. Use this whenever possible to avoid forgetting to set SL/TPs after fill.

## Suggested order format (chat output)

When suggesting a pending order, use this structure:

```
**Pending RANGE_LONG suggestion** (valid until 22:00 ICT today)

| Field | Value |
|---|---|
| Order type | Limit (long) with attached TP/SL |
| Entry price | $2,240 |
| SL | $2,225 (15 pt — beyond range lower) |
| TP1 (50%) | $2,255 (R:R 1:1) |
| TP2 (50%) | $2,277 (R:R 1:2.5, near upper edge) |
| Position size | 1.0 ETH (Tier 1 $15 risk / 15 pt SL) |
| Time in force | Good-Till-Cancelled, manual cancel by 22:00 ICT |

**Why this setup is suggestable as pending right now**:
- Range $2,229-$2,280 confirmed (3 touches each side over last 36h)
- 4h MACD in [-8, +6] = range zone ✓
- ATR(1h) declining 24h ✓
- No macro events in next 12h
- BTC stable above $76K (no regime shift expected)

**Cancel manually if**:
- Price closes outside $2,229-$2,280 with above-average volume (range broken)
- BTC drops below $75K (regime shift, range may break down)
- A macro headline appears (FOMC speaker, CPI surprise)
- Whale ratio shifts to <0.8 or >1.3 (sentiment break)
```

## Pending orders for trend trades (LONG/SHORT)

Same logic, but be more selective — trend trades have more ways to invalidate before fill:
- 4h structure can shift (HL → LH or vice versa)
- Daily trend can flip
- BTC correlation breaks
- News Impact Score can swing significantly

Acceptable for trend pending orders ONLY when:
- Setup zone is at a major confluence (multi-EMA + historical level + nearby Fib + descending/ascending trendline)
- 1D structure is unambiguous (clear trend, not chop)
- Time validity ≤ 6h (shorter than range trades, less time for invalidation)

## Pending orders for range trades (RANGE_LONG/RANGE_SHORT)

Range trades are the most natural fit for pending orders:
- Range structure is visual and persistent for hours
- Edges are well-defined
- Both edges can have orders simultaneously (one will fill, the other can be set to auto-cancel on the first fill via Bybit OCO if available, or manually cancel)
- Lower R:R means tighter exits, more forgiving on bad fills

For range trades, suggesting BOTH edge orders simultaneously is OK — they're complementary, only one will fire (range can't break in both directions at the same time). When suggesting both, label them as "Bracket: order A or B will fire, cancel the other on fill".

## Behavior in market checks

When evaluating a market check (manual or automated):

1. If a setup is **live now** → execute as before (immediate trade decision with current entry zone)
2. If a setup is **probable in the next 6-12h** with all gating criteria already satisfied → suggest one or more pending orders with full structure above
3. If a setup is **possible but uncertain** (>12h away, conditions developing) → describe watch points, don't suggest pending orders
4. If LONG is blocked by prohibitive #6 (counter-trend bearish) → no pending LONG even if structure looks promising; wait for regime change

## What pending orders won't replace

- Manual verification of news Impact Score before fill — pending orders can't read news. If a critical headline drops while the order is pending, manual cancel is required.
- Whale ratio check — same problem. Pending orders fire on price, not on context.
- Trader's intuition on chart context — drawn trendlines, custom levels, sentiment shifts.

If the trader is fully off-grid for the pending-order window, accept the risk consciously: "set order, not monitoring for X hours, will accept fill or cancel at next chance".

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-long]] — long setup conditions (with pending-order section)
- [[entry-rules-short]] — short setup conditions (with pending-order section)
- [[range-trade-rules]] — range setup, naturally suited to pending orders
- [[trading-journal-v5]] — journal entries note when pending orders were suggested
