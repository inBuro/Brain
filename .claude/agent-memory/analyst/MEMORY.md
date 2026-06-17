# Analyst memory index

Read at the start of every task. One line per memory file.

- [posthog-access.md](posthog-access.md) — the kitchen: PostHog project 458316, the MCP (OAuth, `mcp__posthog__exec`), client snippet, owner exclusion, custom events, CTA goals/insights, channel UTM markers (reddit + maxforlive listing), hero A/B experiment 376381 (draft), traffic state
- [query-recipes.md](query-recipes.md) — how to query via the exec gateway (search→info→schema→call), trends/funnel/breakdown/replay snippets, gotchas
- [demo-engagement-baseline.md](demo-engagement-baseline.md) — before/after baseline for the 2026-06-12 interactive-demo UX fix; NO demo-interaction event yet (gap → propose `demo_interact`); comparison plan for the next ~100+ session spike
- [reddit-threads-tracking.md](reddit-threads-tracking.md) — WATCHLIST of every Reddit thread/comment owner asks us to track for attribution (links + utm_campaign + audience-fit + live status): r/Novation, r/ableton, organic + abletonlive_post pushes
- [reddit-novation-post-1.md](reddit-novation-post-1.md) — the 2026-06-10 r/Novation post measured: ~10x traffic day, 11 reddit sessions, ~0.2–0.4% post→site CTR, geo matches US/UK/DE, 0 buy_click/0 sales → verdict REACH not conversion
- [buy-cta-visibility-2026-06-15.md](buy-cta-visibility-2026-06-15.md) — replay+scroll read of 06-15 engaged sessions: buy CTA = 10th of 11 blocks (bottom), no nav/hero Buy; nobody scrolled to it → VISIBILITY not persuasion. ALSO: $autocapture clicks + scroll-depth props ARE queryable (corrects old "autocapture OFF")
- [day-2026-06-16.md](day-2026-06-16.md) — FIRST buy_click ever (06-16 17:56, US iPad, control variant, $direct, no scroll on `/` → buy CTA now reachable above-fold?); experiment exposure bug FIXED ($feature_flag_called fires, control 6/test 7); 22 sessions (4th-biggest), reddit `abletonlive_post` #3 the engine; NEW reddit campaign value `abletonlive_post`
- [hourly-profile-ict.md](hourly-profile-ict.md) — hour-of-day traffic profile in ICT (owner clock); PEAK 19:00–22:00 ICT (19:00 & 21:00 biggest); weekday/weekend not separable (n=100 lifetime); peaks mirror posting times not audience habit
- [day-2026-06-17.md](day-2026-06-17.md) — owner reports FIRST SALE but PostHog has NO real purchase (only 2 is_test=True pings → webhook gap); 2nd-ever buy_click = a RETURNING NL visitor (likely the buyer); new events cta_view + demo_interact NOW LIVE (close the demo-interaction gap)
- [sale-1-attribution.md](sale-1-attribution.md) — FIRST SALE hard-attributed: buyer = NL/Firefox/Serooskerke person bcf21ee7, source = **maxforlive listing** (UTM in $referrer, NOT reddit), **control** variant, 2 touches 06-15→06-17, no free-mode/no-demo evaluator; no email-identify; real purchase STILL not in PostHog (webhook only fires test pings)
- [teams-referrer-2026-06-16.md](teams-referrer-2026-06-16.md) — NEW channel: 2 GB sessions opened from inside Microsoft Teams (referrers statics.teams.cdn.office.net + teams.public.onecdn.static.microsoft), 06-16 ~22:07–22:12, one a High Wycombe (Novation HQ) RETURNER first seen on free-modes 06-10 → fits Isotonik/Novation-insider hypothesis; n=2, no UTM, both bare `/`

## Standing context
- Reports in Russian (chat), artifacts/docs in English. Clock times in Thai time (UTC+7).
- Always `filterTestAccounts: true` to exclude the owner.
- Traffic is tiny right now → prefer Session Replay over funnels/experiments until volume grows.
