# Trading Hours

**Summary**: New entries are only allowed during **09:00-17:00 ICT** (8-hour window, every day including weekends). Outside this window, no new positions are opened — but existing positions continue to run via their pre-set SL/TPs. Replaces the older "after 22:00 local — no new entries" rule with an explicit window. Added 2026-05-01 as a v5 supplement.
**Sources**: [[strategy-v5]] + chat 2026-05-01
**Last updated**: 2026-05-01 (created)

---

## The window

**09:00 ICT → 17:00 ICT, daily (Mon-Sun).**

This covers Asia morning + Europe morning, which together provide the best liquidity and the cleanest setup formation for ETH/USDT. Outside the window, the trader is off-shift.

## What's allowed inside the window

- New live setup entries (LONG/SHORT/RANGE) per [[entry-rules-long]] / [[entry-rules-short]] / [[range-trade-rules]]
- New pending limit orders per [[pending-orders]] (with time validity ≤ 8h to avoid overnight fills)
- Adjusting SL on open positions per [[stop-loss-rules]] (trailing after TP1, etc.)

## What's NOT allowed outside the window

- Opening new positions (live or pending fills counted as new)
- Adding to existing positions (averaging up/down)
- Setting new pending orders that would trigger outside the window

## What CAN run outside the window

- Existing positions opened earlier inside the window — they keep running with their pre-set SL/TP
- Pending orders that were set inside the window AND have time validity that lapses before window-close — they fire if price touches in-window
- The scheduled remote agent `eth-paper-journal` cron at 23:00 ICT — still runs, still appends to the journal, but **emails marked with a "OUTSIDE WINDOW" tag** so the trader knows not to act on them until next morning

## Why this window

- **Asia morning (09:00-12:00 ICT)** is high-liquidity for ETH (Asian retail + early European algos). Many setup formations happen here.
- **Europe morning (12:00-17:00 ICT)** adds European institutional flow. Clean trends often develop in this overlap.
- **17:00-22:00 ICT (US morning)** is high-vol but high-risk: news pumps, US-driven volatility, fakeouts before/after market open. Skipping this is conservative but acceptable — better to miss a setup than chase a US-driven fakeout.
- **22:00-09:00 ICT** is dead/thin liquidity (US close → Asian morning). High whipsaw risk, low reward density.

## Weekend nuances

- **Lower overall liquidity** Sat/Sun → spreads wider, slippage higher
- **No macro events** → one prohibitive blocker auto-cleared
- **Less institutional flow** (ETF closed, OTC quieter)
- **Whale-specific transfers can move price more** — wallet-specific news has higher Breadth Multiplier impact effectively

Weekends are still tradeable in the 09-17 window, but if a setup forms with marginal conditions (only 3 base conditions hit, not 4-5), prefer to skip — weekend setups should be cleaner than weekday setups to compensate for thinner books.

## Interaction with other rules

- **Pending orders time validity**: cap at "Cancel by 17:00 ICT today" if the suggestion is made between 09:00 and 17:00. Don't suggest pending orders that would fill overnight (per [[pending-orders]]).
- **Late-day setups (16:00-17:00 ICT)**: still allowed but with reduced size (−25%) — less time to react if structure breaks before TP1.
- **Macro events in next 1-2h**: window is irrelevant — macro blocker is independent. If FOMC at 16:30 ICT and we're at 15:30, no entry regardless of window.

## How the routine handles this

The `eth-paper-journal` routine (cron 0 3,8,16 * * * UTC = 10/15/23 ICT) still runs all three slots. The 23:00 ICT slot is **outside** the trading window. Its journal entries are tagged as `OUTSIDE_WINDOW` — the entry/setup analysis is still computed for trend tracking and backtesting, but no email alert is sent (or if sent, subject prefixed with "INFO ONLY — OUTSIDE WINDOW").

The 10:00 and 15:00 ICT slots are inside the window — emails fire normally on detected setups or pending eligibility.

## Migration from older "after 22:00" rule

Previously v5 said "Late evening (after 22:00 local) — no new entries". This was a one-sided cutoff with no explicit start. The new 09-17 window:
- Tightens evening cutoff from 22:00 → 17:00 (5h earlier)
- Adds explicit morning start at 09:00 (was implicit in the daily routine)
- Is symmetric and easier to evaluate at any given time

The 22:00 rule remains in legacy psychology-rules text as a fallback, but the 09-17 window takes precedence.

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-long]] / [[entry-rules-short]] / [[range-trade-rules]] — entry rules respect this window
- [[pending-orders]] — pending suggestions cap at 17:00 ICT validity
- [[psychology-rules]] (planned) — broader psychological constraints
- [[trading-journal-v5]] — entries tagged with within/outside window flag
