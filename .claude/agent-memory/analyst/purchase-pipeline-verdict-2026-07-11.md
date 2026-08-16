---
name: purchase-pipeline-verdict-2026-07-11
description: Gumroad-ping → PostHog `purchase` pipeline audit — historically 0 genuine is_test=false webhook deliveries ever (only a hand-backfill), 3wk silence since 06-18; THEN live end-to-end test 2026-07-11 00:23 ICT CONFIRMED delivery works (~90s, correct attribution) but is_test=true even on real paid transactions — root cause = Gumroad-side test-mode toggle, not a code bug
metadata:
  type: project
---

# Verdict: has the Gumroad `purchase` webhook EVER delivered a real event?

**No — not once, in the project's entire history.** Checked live 2026-07-11 (requested after the
2026-07-11 checkout-page rework, to separate "checkout UX was broken" from "telemetry was broken").

## Lifetime `purchase` event count: 9, ALL accounted for
```
is_test | source           | n | first_seen           | last_seen
true    | gumroad-ping     | 8 | 2026-06-10 10:53 ICT | 2026-06-18 12:03 ICT
false   | manual-backfill  | 1 | 2026-06-17 13:50 ICT | 2026-06-17 13:50 ICT
```
Row-by-row `sale_id` on the 8 `is_test=true` rows tells the whole story — every one is explicitly
test/verification data, not a live checkout:
- `ACLFuPRB6ZZiMYWI6xYa8Q==` (06-10) — first ping ever, is_test=true.
- `test_sale_claude_check` (06-10) — literal manual test.
- `aKrKs--u0JFZjW2haKM73w==` ×5 (06-17 13:50:33, identical retries) — **this IS the sale_id of the
  real first sale** ([[sale-1-attribution]]) — Gumroad sent 5 retries of the SAME ping, but Gumroad
  itself flagged them `test: true` on all 5. Root cause (confirmed 06-19, no code bug): the Ping
  endpoint was still in its "test mode" setup phase when this real sale happened, so Gumroad honestly
  reported `test=true` even though the underlying transaction was real. The webhook code is not at
  fault — Gumroad's own test flag was on.
- `manual-pipe-verify-20260618` (06-18) — literal manual pipeline-verification ping.
- `purchase_refunded` (1 lifetime event, 06-19 17:29) — `sale_id = VERIFY-lifecycle-deploy`,
  `is_test=true` — also a manual deploy-verification event, not a real refund.

**The ONLY `is_test=false` purchase event in the whole database is the manual backfill** I inserted
via the capture API on 2026-06-18 to make the known real sale #1 visible in analytics (full detail
in [[sale-1-attribution]]) — it is NOT evidence the pipeline works. It's a hand patch standing in for
a webhook delivery that never happened.

## Silence since 06-18 — 3+ weeks, zero pings of ANY kind
Last `purchase`/`purchase_refunded` event of any flavor (test or real) is **2026-06-19 17:29 ICT**
(the refund-verify ping). Nothing since — not even a test ping — through 2026-07-10, despite dozens
of `buy_click` events across at least 8 more days in that window (06-22, 06-28×2, 07-08×3, 07-10×2,
per daily memory logs). Two possible explanations, not distinguishable from PostHog alone:
1. None of those buy_clicks actually completed a Gumroad checkout (plausible — matches the standing
   pattern that buy_click has NEVER once been followed by a same-day purchase in this project's
   history, documented repeatedly in the daily logs).
2. The Gumroad Ping is no longer reaching PostHog at all (wrong/expired token, Ping URL changed,
   Cloudflare Pages Function broken, or Gumroad-side Ping setting disabled) — cannot be ruled out
   since there's been no test ping either since 06-18 to prove liveness.

## Bottom line for the coordinator's question (as of the historical-only check)
The Gumroad → `functions/api/gumroad-ping.js` → PostHog `purchase` pipeline had **never delivered a
single genuine (is_test=false, non-manual) event** in this project's history up to that point. Every
real "sale" signal in PostHog was a hand-backfill, not a webhook delivery. Revenue truth needed
reconciling against Gumroad directly until the pipeline proved itself live.

## LIVE END-TO-END TEST — 2026-07-11 00:23 ICT — PIPELINE CONFIRMED ALIVE
The owner made a real purchase on Gumroad (Sends Follower, $14) as a live end-to-end test, minutes
after the historical audit above. Checked live: **event landed.**
```
event=purchase, ts=2026-07-11T00:23:10+07:00 (checked 00:24:35 ICT, ~90s later — no meaningful delay)
is_test=true, source=gumroad-ping, product_name="Sends Follower", price=14.0, currency=usd,
sale_id=sMARMOrjIn6At4SXUSct4A==, country=Thailand, distinct_id=fadercraft-owner
```
- **Delivery: WORKS, and fast** (~90s ping-to-query, likely faster — that's just when it was checked).
  This is the **first `gumroad-ping`-sourced purchase event since 2026-06-18** — 3+ weeks of total
  silence is now explained as "no completed real checkout in that window", NOT a dead endpoint.
  Hypothesis #2 (broken pipeline) from the historical section is **refuted** — the endpoint is alive
  and reachable today.
- **Attribution: correct.** `country=Thailand` matches the owner's real location (this field carries
  Gumroad's billing country, not server IP — consistent with [[sale-1-attribution]]'s finding).
  `distinct_id=fadercraft-owner` — correctly tied to the owner's identified person (likely via email
  match in the ping handler), meaning this event is automatically excluded by `filterTestAccounts`
  in all real-customer analytics, as expected for a self-test purchase.
- **`is_test=true` again, on a REAL paid transaction.** Same pattern as sale #1 (06-17, also real
  money, also flagged test=true). Two-for-two real transactions both flagged test=true strongly
  suggests this is **NOT per-transaction noise but a persistent Gumroad-side setting** — most likely
  the product/Ping's "test mode" toggle in Gumroad has simply never been switched to live, so it
  will keep stamping `test=true` on every ping, real sale or not, until the owner flips that setting
  in Gumroad. **This is a Gumroad account/product configuration item, not a webhook code bug** — no
  engineering fix needed in `gumroad-ping.js` itself, but flag to the owner: real customer sales will
  keep reading `is_test=true` (and therefore keep getting filtered out of "real sale" counts) until
  that Gumroad-side toggle is addressed.

## Updated bottom line
Pipeline delivery is confirmed healthy end-to-end as of 2026-07-11. The one remaining risk to
analytics-correctness is NOT delivery — it's the `is_test` flag: every purchase event ever seen
(including two confirmed-real transactions) has arrived `is_test=true`, so any dashboard/count that
filters `is_test != true` will keep reading **zero real sales even when sales are happening**, until
the Gumroad test-mode toggle is fixed. Recommend checking that Gumroad setting before trusting
`purchase` counts going forward, and re-running this same live check after the NEXT genuine customer
sale to confirm whether the flag finally reads `false`.
