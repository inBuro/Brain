# Analyst memory index

Read at the start of every task. One line per memory file.

- [posthog-access.md](posthog-access.md) — the kitchen: PostHog project 458316, the MCP (OAuth, `mcp__posthog__exec`), client snippet, owner exclusion, custom events, CTA goals/insights, hero A/B experiment 376381 (draft), traffic state
- [query-recipes.md](query-recipes.md) — how to query via the exec gateway (search→info→schema→call), trends/funnel/breakdown/replay snippets, gotchas

## Standing context
- Reports in Russian (chat), artifacts/docs in English. Clock times in Thai time (UTC+7).
- Always `filterTestAccounts: true` to exclude the owner.
- Traffic is tiny right now → prefer Session Replay over funnels/experiments until volume grows.
