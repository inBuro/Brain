---
name: counterdj-posthog
description: Counter DJ PostHog project — client token, host, ingest proxy location, owner self-exclusion pattern
metadata:
  type: reference
---

## Counter DJ PostHog project

Separate PostHog project from Fadercraft (458316), same US-cloud org.

- **Client token (public, safe in repo):** `phc_BAghKLaJXyEZ9hcPdjQ7BFfQ3543X6aDDjzapsrJTE3S`
- **US cloud host:** `https://us.posthog.com`
- **First-party ingest proxy:** `https://counterdj.com/ingest`
  - Proxy function: `/Users/Kirill/Projects/Projects/Counter DJ/functions/ingest/[[path]].js`
- **Numeric project ID:** NOT stored locally — look it up at `https://us.posthog.com` by switching to the Counter DJ project in the project switcher; the URL reveals `/project/<ID>/`.
- **Snippet location:** `/Users/Kirill/Projects/Projects/Counter DJ/site/index.html` (line 19)
  - Guarded by `location.hostname === "counterdj.com"` (appropriate for the landing page, NOT for the Chrome extension)
- **Owner self-exclusion:** same pattern as Fadercraft — `counterdj.com/?ph_owner=1` sets `localStorage.ph_owner=1` then `posthog.identify("counterdj-owner", { email: "hellokbbureau@gmail.com" })`
- **`person_profiles: 'identified_only'`** — matches Fadercraft config (profiles created only on identify)

## Owner exclusion — test_account_filters
- Filter to set: **Person property `email` `is_not` `hellokbbureau@gmail.com`**
- Same pattern as Fadercraft (project 458316).
- One filter is sufficient: `identify('counter-dj-owner', {email:…})` creates a person with email; anonymous/non-identified sessions have email=null which passes the `is_not` filter automatically.
- Numeric project ID NOT yet stored — find it in the URL after switching to Counter DJ project in PostHog project switcher. Record it here once found.
- To set via API: `PATCH /api/projects/<ID>/` with `Authorization: Bearer phx_…` and body `{"test_account_filters":[{"key":"email","value":"hellokbbureau@gmail.com","operator":"is_not","type":"person"}]}`
- Status: **PENDING** — MCP not available in subagent context, user to configure manually or via API. (2026-08-05)

## For Chrome extension use
- Remove the `location.hostname` guard (irrelevant in extension context)
- Use same token + hosts above
- May need `chrome.storage.local` instead of `localStorage` for owner flag, depending on extension architecture
- Owner flag: when `localStorage.ph_owner === '1'` → `posthog.identify('counter-dj-owner', { email: 'hellokbbureau@gmail.com' })` (already wired per user report 2026-08-05)
