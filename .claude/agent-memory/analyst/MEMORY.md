# Analyst memory index

Read at the start of every task. One line per memory file.

- [posthog-access.md](posthog-access.md) — the kitchen: PostHog project 458316, the MCP (OAuth, `mcp__posthog__exec`), client snippet, owner exclusion, custom events, CTA goals/insights, channel UTM markers (reddit + maxforlive listing), hero A/B experiment 376381 (draft), traffic state
- [query-recipes.md](query-recipes.md) — how to query via the exec gateway (search→info→schema→call), trends/funnel/breakdown/replay snippets, gotchas
- [demo-engagement-baseline.md](demo-engagement-baseline.md) — before/after baseline for the 2026-06-12 interactive-demo UX fix; NO demo-interaction event yet (gap → propose `demo_interact`); comparison plan for the next ~100+ session spike
- [reddit-novation-post-1.md](reddit-novation-post-1.md) — the 2026-06-10 r/Novation post measured: ~10x traffic day, 11 reddit sessions, ~0.2–0.4% post→site CTR, geo matches US/UK/DE, 0 buy_click/0 sales → verdict REACH not conversion
- [buy-cta-visibility-2026-06-15.md](buy-cta-visibility-2026-06-15.md) — replay+scroll read of 06-15 engaged sessions: buy CTA = 10th of 11 blocks (bottom), no nav/hero Buy; nobody scrolled to it → VISIBILITY not persuasion. ALSO: $autocapture clicks + scroll-depth props ARE queryable (corrects old "autocapture OFF")

## Standing context
- Reports in Russian (chat), artifacts/docs in English. Clock times in Thai time (UTC+7).
- Always `filterTestAccounts: true` to exclude the owner.
- Traffic is tiny right now → prefer Session Replay over funnels/experiments until volume grows.
