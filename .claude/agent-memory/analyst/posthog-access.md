# PostHog access & setup (the "kitchen")

The single source of analytics truth for Fadercraft. No secrets live here — the MCP uses OAuth, no API key is stored on disk.

## Project
- Tool: **PostHog**, US cloud (`us.posthog.com`).
- Project: **Fadercraft**, id **458316**. Org id `019ea2d6-362f-0000-86ea-e7e2ddade215`.
- Project timezone: **Asia/Bangkok** (matches the user; express clock times in Thai time).
- Account: Kirill Bush, `hello@fadercraft.com`.
- Dashboards: Base URL `https://us.posthog.com` + `/project/458316/...`.

## How the agent reads data — the MCP
- MCP server **posthog** is registered in `~/.claude.json` (user scope), URL `https://mcp.posthog.com/mcp`, transport HTTP.
- Auth = **OAuth** (login in browser via `/mcp` in Claude Code). No personal API key stored. If it ever drops to "Needs authentication", the user re-auths via `/mcp`.
- Only tool exposed: `mcp__posthog__exec` — a CLI-style gateway. Workflow is MANDATORY:
  1. `search <regex>` (or `tools`) to find a tool
  2. `info <tool>` before any call
  3. `schema <tool> <field>` for fields with a `hint`
  4. `call <tool> <json>`
  - Before any analytical query touching collected data, run `call read-data-schema {"query":{"kind":"events"}}` — confirm the event exists; don't query guessed names.
- Recipes in [[query-recipes]].

## Client-side integration (how events are produced)
- Code: guarded inline snippet in `~/Projects/Claude/Fadercraft/app/index.html` `<head>`.
- Public project token (client write-only, safe in repo): `phc_CjTzqqmUa65wJMnWCVA2xKCX8LkDkeotu5hEcQz7kPaq`.
- Loads **only on `fadercraft.com` / `www.fadercraft.com`** — localhost/preview don't pollute analytics.
- The site is a **SPA, one `index.html`**; routing via `?p=…` (`?p=free-modes` = custom-modes page). One snippet covers every route; SPA pageviews auto-tracked. No per-page snippet needed.
- First-party reverse proxy: `api_host: https://fadercraft.com/ingest` → Cloudflare Pages Function `app/functions/ingest/[[path]].js`. Beats Brave/ad-blockers (events count again).
- Deploy gotcha: run wrangler FROM `app/` (`cd app && wrangler pages deploy dist --project-name=fadercraft-landing --branch=main`) so `app/functions/` (the proxy) is bundled.

## Owner self-exclusion (always filter the owner out)
- Visiting `fadercraft.com/?ph_owner=1` once per device sets `localStorage.ph_owner=1` and `posthog.identify('fadercraft-owner', {email:'hellokbbureau@gmail.com'})`.
- PostHog test-account filter = `email ≠ hellokbbureau@gmail.com`.
- **In every query pass `filterTestAccounts: true`** so the owner's own visits don't skew numbers.

## Custom events (set up 2026-06-07, client-side delegated listeners)
- `buy_click` — any link to `gumroad.com/l/` checkout. Props: `href`, `label`, `path`.
- `newsletter_signup` — submit of the Gumroad-follow form. Prop: `path`.
- `social_click` — click to a known social host (discord/youtube/instagram + X/tiktok/fb/linkedin/telegram ready). Props: **`platform`**, `href`, `path`. → break social down by `platform` to see which network.
- All measure on-site clicks, NOT the downstream Gumroad purchase/confirm.

Added 2026-06-10 (same delegated pattern in index.html) — **shipped to code, pending deploy** (only fire once prod has the new snippet):
- `video_play` — click on the demo-video play button (`button[aria-label="Play demo"]`). Prop: `path`. Explicit marker (a pageview can't tell a play apart).
- `mode_download` — click on a free-modes download link (`a[href$=".zip"]` / `.syx`). Props: `file`, `href`, `path`. Explicit marker (a file download fires no pageview).

Principle (user, 2026-06-10): when context is unambiguous from existing events, DON'T add code — derive it (e.g. legal/custom-modes page views = `$pageview` URL filter). Only add an explicit event where there'd be ambiguity (video play, file download).

## Goals & insights created (2026-06-10)
Actions (the CTA goals):
- **277920** — CTA — Buy click (`buy_click`) — primary conversion ✅ verified firing 2026-06-10
- **277921** — CTA — Newsletter signup (`newsletter_signup`)
- **277922** — CTA — Social click (`social_click`)
- **277924** — CTA — Legal view (`$pageview` URL contains `p=legal`) — no code
- **277925** — CTA — Custom Modes page view (`$pageview` URL contains `p=free-modes`) — no code
- **277926** — CTA — Video play (`video_play`) — needs deploy
- **277927** — CTA — Mode download (`mode_download`) — needs deploy

Saved insights (favorited):
- **A24NPDaz** — Landing conversion — Pageview → Buy click (funnel)
- **j8HECUNN** — Social clicks by platform (trends, breakdown by `platform`)

Pre-existing = PostHog templates only: Web Analytics starter dashboard **1680409** (WAU/DAU/retention/referring domain), LLM-analytics dashboard **1680554** (ignore — not the landing).

## State of traffic (as of 2026-06-10)
Tiny but moving. Data starts 2026-06-07. Evening of 2026-06-10 brought a burst of **mobile** sessions (~17 mobile sessions / 18 mobile pageviews, 12 with replays), all `$direct` referrer — looks like the link was posted somewhere. Real mobile viewport widths seen: 320, 338, 384, 390 (most common), 402, 412 (most common Android). Funnels / A/B experiments still premature; Session Replay is the useful lens.

**Bot/in-app marker discovered:** sessions where `$viewport_height == $screen_height` (no browser chrome) are likely WebView/in-app browsers or headless — e.g. the cluster of 6 Chrome-Android 412×823 sessions and 2 Chrome-iOS 390×844 sessions on 2026-06-10. Real mobile browsers show vh < sh (address bar). Check this before trusting mobile session counts.

## Related project memory
Brand & workspaces: [[../../../memory pointers handled in main MEMORY.md]]. Analytics reference memory: `reference_fadercraft_analytics`. Deploy: `reference_fadercraft_deploy`.
