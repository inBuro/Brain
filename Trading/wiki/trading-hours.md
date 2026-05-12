# Trading Hours

**Summary**: New entries are only allowed during **09:00-22:00 ICT** (13-hour window, every day including weekends). Outside this window, no new positions are opened — but existing positions continue to run via their pre-set SL/TPs. Replaces the older "after 22:00 local — no new entries" rule with an explicit start time. Added 2026-05-01 as a v5 supplement; window widened from 09-17 to 09-22 on 2026-05-06.
**Sources**: [[strategy-v5]] + chat 2026-05-01 + chat 2026-05-06 (widening)
**Last updated**: 2026-05-12 (routine cron reconciled with reality: hourly `0 2-15 * * *` UTC = every hour 09:00–22:00 ICT, 14 runs/day — all inside window)

---

## The window

**09:00 ICT → 22:00 ICT, daily (Mon-Sun).**

This covers Asia morning, Europe session, and the start of the US session — the highest-volume slice of the crypto day for ETH/USDT. Outside the window, the trader is off-shift (sleep / next-day buffer).

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

## Why this window

- **Asia morning (09:00-15:00 ICT)** is moderate liquidity for ETH (Asian retail + early European desks). Setups often form but are sometimes thin and prone to retests.
- **London open + Europe session (15:00-20:00 ICT = 08:00-13:00 UTC)** brings the first major institutional flow of the day. This is when many of yesterday's overnight fakeouts get cleanly resolved.
- **NY pre-open / US morning (20:00-22:00 ICT = 13:00-15:00 UTC)** is the **peak volume window** for crypto — London afternoon overlapping with US morning. Cleanest setup quality, but also highest news/macro risk. Capturing this slice is the main reason the window was widened from 09-17 to 09-22 on 2026-05-06.
- **22:00-09:00 ICT** is the trader's off-shift block (sleep + buffer). The US main session technically continues until ~05:00 ICT but the trader can't watch it without wrecking sleep, so the rule is hard 22:00 cutoff.

## Weekend nuances

- **Lower overall liquidity** Sat/Sun → spreads wider, slippage higher
- **No macro events** → one prohibitive blocker auto-cleared
- **Less institutional flow** (ETF closed, OTC quieter)
- **Whale-specific transfers can move price more** — wallet-specific news has higher Breadth Multiplier impact effectively

Weekends are still tradeable in the 09-22 window, but if a setup forms with marginal conditions (only 3 base conditions hit, not 4-5), prefer to skip — weekend setups should be cleaner than weekday setups to compensate for thinner books. Note that on weekends the London/NY volume boost is muted (institutional desks closed), so the second half of the window (15:00-22:00 ICT) loses its main edge — weekend trading effectively reverts to the old 09-17 character.

## Interaction with other rules

- **Pending orders time validity**: cap at "Cancel by 22:00 ICT today" if the suggestion is made inside the window. Don't suggest pending orders that would fill overnight (per [[pending-orders]]).
- **Late-day setups (21:00-22:00 ICT)**: still allowed but with reduced size (−25%) — less time to react if structure breaks before TP1, and trader is winding down for sleep.
- **Macro events in next 1-2h**: window is irrelevant — macro blocker is independent. If FOMC at 21:30 ICT and we're at 20:30, no entry regardless of window. (FOMC announcements at 01:00 ICT, when the trader is asleep, are a routine block on next-morning entries until structure resolves.)

## How the routine handles this

The `eth-paper-journal` routine (cron `0 2-15 * * *` UTC = **every hour from 09:00 to 22:00 ICT inclusive**, 14 runs/day) runs entirely inside the 09:00-22:00 ICT trading window. GitHub Issue alerts fire on detected setups or pending eligibility — which emails the trader automatically. No outside-window tagging needed.

Slot rationale: hourly coverage means no setup-forming window is missed. Early-morning runs (09:00-11:00 ICT) catch overnight structure resolution; mid-day runs (12:00-15:00 ICT) catch Europe-session moves; afternoon runs (16:00-20:00 ICT) cover London/NY overlap; late runs (21:00-22:00 ICT) catch end-of-window setups while the window is still open for action. 14 of the 15 available daily execution slots are used for this routine.

## Migration history

**v5 source rule (pre-2026-05-01):** "Late evening (after 22:00 local) — no new entries". One-sided cutoff with no explicit start.

**2026-05-01 → 09-17 window:** Added explicit morning start at 09:00 and tightened evening cutoff to 17:00 — chosen to keep the trader strictly in Asia/early-Europe sessions. Symmetric and clean, but in practice missed the highest-volume part of the crypto day.

**2026-05-06 → 09-22 window (current):** Widened back to 22:00 evening cutoff so the trader can act on London/NY-overlap setups (20:00-22:00 ICT). The decision rationale: the trader is already glancing at Bybit throughout the day to send scan requests anyway, so a single wide window beats two narrow ones. Aligns the upper bound back with the original v5 22:00 rule.

## Related pages

- [[trading-strategy]] — main strategy page
- [[entry-rules-long]] / [[entry-rules-short]] / [[range-trade-rules]] — entry rules respect this window
- [[pending-orders]] — pending suggestions cap at 22:00 ICT validity
- [[psychology-rules]] (planned) — broader psychological constraints
- [[trading-journal-v5]] — entries tagged with within/outside window flag
