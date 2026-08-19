# What to ask the PM for — Beefy case (2026-08-19)

The case currently proves **process** (research ops, method, instrumented
prototype) and **usability** (Maze scores, misclick, duration, satisfaction).
What it cannot yet prove is **product effect**: that the redesign changed
behaviour. Every item below closes that gap.

Ordered by what a hiring manager actually reacts to.

## Tier 1 — the four numbers that change the case

Ask these first. Any one of them turns "I redesigned filters" into "I moved a
number".

1. **Boosted deposits, before vs after release.** This is not a random ask — the
   research board itself names the success criterion: *"statistically
   significant increase of boosted deposits"*. So the right question is not
   "give me some metrics", it is: **"we defined the success criteria up front —
   were they measured, and what did they show?"** That framing is hard to
   refuse and makes you look like someone who closes loops.
2. **Click-rate of the boosted-vaults control**, before vs after. The second
   stated success criterion from the same board.
3. **Share of sessions that use filters or search at all**, before vs after.
   The whole premise is that 63% of user time goes into finding vaults — this
   shows whether the rework made that path more used or merely prettier.
4. **Time from landing to first deposit** (or to opening a vault page), before
   vs after. The usability tests measured task time in a prototype; this is the
   same measurement in the real product.

## Tier 2 — strong supporting numbers

5. **Mobile share of traffic.** Doubles as the missing answer to "why was only
   mobile tested" — if mobile is the majority of sessions, the choice explains
   itself without inventing a reason.
6. **Bounce rate of the main page**, before vs after.
7. **Zero-result rate** — how often a filter combination returns nothing. Users
   asked for TVL-based hiding and complained about over-long lists; this
   quantifies it.
8. **Save-feature usage in production.** The test says 21 of 52 never use it.
   Real telemetry either confirms a dead feature or contradicts the sample —
   both are interesting, and disagreement with your own test data is worth
   showing.
9. **Repeat-deposit rate after a vault retires.** The "Suggested vaults" board
   states outright that this data did not exist. If it exists now, it validates
   the whole problem framing.

## Tier 3 — context that makes the story legible

10. **Release dates** of the filter rework and the boosts changes — without them
    no before/after window can be drawn honestly.
11. **Number of boosted vaults over time** (1–3 → 5–10 → 20–30). The board tells
    this story qualitatively; a chart tells it in one glance.
12. **Which analytics stack** is in use and whether you can read it directly.
    Self-serve access is worth more than any single number, and it makes future
    cases cheap.
13. **Performance data** — several testers complained the app felt laggy or
    unresponsive. If load time improved alongside the redesign, that is a result
    you are currently giving away for free.

## How to ask

Send it as one message, not a wishlist drip. Suggested shape:

> "I'm writing up the filtering and boosts work as a portfolio case, cleared for
> public use. We set success criteria before the redesign — a significant lift
> in boosted deposits and in the boosted control's click-rate. Were those
> measured after release, and can I quote the result? If those weren't tracked,
> the next most useful things are: share of sessions using filters, time to
> first deposit, and mobile traffic share — each before vs after the release
> dates. Rounded figures or percentage changes are fine; I don't need raw data."

Offering rounded numbers or percentage deltas lowers the bar for a PM to say
yes — most refusals are about effort and disclosure, not secrecy.

## If the answer is "we didn't measure"

That is a legitimate case outcome, and it must be stated, not hidden:

> "Success criteria were defined before the redesign — a lift in boosted
> deposits and in control click-rate. Post-release measurement was not run, so
> the outcome is reported at the usability level: task success, misclick and
> satisfaction across 98 participants in two studies."

Then put "close the measurement loop" into the What-I'd-do-next block. Naming a
gap you identified yourself reads far better than silence — and it is the exact
thing a senior is expected to notice.
