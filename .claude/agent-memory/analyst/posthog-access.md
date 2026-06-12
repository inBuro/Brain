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

Added 2026-06-10 (same delegated pattern in index.html) — **deployed & verified firing 2026-06-10/11**:
- `video_play` — click on the demo-video play button (`button[aria-label="Play demo"]`). Prop: `path`. Explicit marker (a pageview can't tell a play apart).
- `mode_download` — click on a free-modes download link (`a[href$=".zip"]` / `.syx`). Props: `file`, `href`, `path`. Explicit marker (a file download fires no pageview).

**`purchase` event = Gumroad server-side webhook** (not our snippet). Props: `product_name`, `price`, `currency`, `sale_id`, `seller_id`, `refunded`, **`is_test`**, `source`, geo. Both events so far (2026-06-10) were `is_test=True` pings — ALWAYS filter `is_test != true` when counting real sales. Pipeline verified working.

Principle (user, 2026-06-10): when context is unambiguous from existing events, DON'T add code — derive it (e.g. legal/custom-modes page views = `$pageview` URL filter). Only add an explicit event where there'd be ambiguity (video play, file download).

**GAP — interactive-demo engagement has NO event (confirmed 2026-06-12).** Clicks on the hero
interactive-demo controls are NOT captured: `video_play` is the demo-*video* Play button (different
element), `$autocapture` is OFF (not in the schema), only `$rageclick`/`$dead_click` exist (negative
signals). To measure demo interaction we'd need a new `demo_interact` event. Full baseline + proposal
+ before/after plan for the 2026-06-12 demo UX fix → [[demo-engagement-baseline]].

## Goals & insights created (2026-06-10)
Actions (the CTA goals):
- **277920** — CTA — Buy click (`buy_click`) — primary conversion ✅ verified firing 2026-06-10
- **277921** — CTA — Newsletter signup (`newsletter_signup`)
- **277922** — CTA — Social click (`social_click`)
- **277924** — CTA — Legal view (`$pageview` URL contains `p=legal`) — no code
- **277925** — CTA — Custom Modes page view (`$pageview` URL contains `p=free-modes`) — no code
- **277926** — CTA — Video play (`video_play`) — needs deploy
- **277927** — CTA — Mode download (`mode_download`) — needs deploy

## A/B experiment (LAUNCHED 2026-06-11 12:46 Thai)
- **Experiment 376381** — "Hero copy — permanent interface vs feature-led", `https://us.posthog.com/project/458316/experiments/376381`. Status **running** since 2026-06-11T05:46:30Z (12:46 Thai); landing code reading the flag was deployed to prod BEFORE launch and verified.
- Feature flag **`hero-permanent-interface`** (id 711811, auto-created by experiment) — **active:true** (experiment-launch activates it itself). Variants `control` (current feature-led hero) / `test` (permanent-interface copy: eyebrow "M4L INTERFACE FOR LCXL MK3", H1 "One controller. Your permanent interface.", body "Map once — the same layout from studio to stage, in every Live Set."), 50/50, rollout 100%.
- Primary metric: funnel → Action 277920 (CTA — Buy click). Secondary: funnel `$pageview` → Action 277920. `exposure_criteria.filterTestAccounts: true`. Stats: Bayesian.
- Time-to-significance honesty in description: at ~10–20 sessions/day, 1–3% baseline, even 2x lift ≈ 2.5–8 months; +50% ≈ a year+. Owner deliberately set it up early to accumulate.
- Exposure: still 0 as of re-check **2026-06-11 (post-deploy verification run)** — `$feature_flag_called` not yet in event schema AND flag `last_called_at: null` (two independent confirmations the flag has never been evaluated by a live visitor). Normal right after launch, not a bug: exposures land with the first real visitor; headless/QA/bot-UA hits don't enter the experiment. Check later: once it fires it appears in `read-data-schema`; break exposures down by `$feature_flag_response`. **Don't peek at significance in the first weeks.**

Saved insights (favorited):
- **A24NPDaz** — Landing conversion — Pageview → Buy click (funnel)
- **j8HECUNN** — Social clicks by platform (trends, breakdown by `platform`)

Pre-existing = PostHog templates only: Web Analytics starter dashboard **1680409** (WAU/DAU/retention/referring domain), LLM-analytics dashboard **1680554** (ignore — not the landing).

## Channel UTM markers (how to split traffic by campaign)
Each acquisition channel has its own UTM marker. When slicing traffic, filter by these to
attribute a session to its channel — don't lump them. Reddit-app WebView strips referrer
(→ `$direct`), so UTM + entry path + timing are the reliable signal, not referrer alone.

| Channel | `utm_campaign` | `utm_source` | `utm_medium` | Notes / entry |
|---|---|---|---|---|
| r/Novation post #1 (the introduction post) | `introduction_post` | `reddit` | `social` | The original 06-10 r/Novation post; entry usually `/free-custom-modes`. Its tail keeps trickling. |
| r/ableton post | `ableton_post` | `reddit` | `social` | The 06-11 r/ableton post (buried link, AI-flagged, ~0 real clicks). |
| **maxforlive.com listing** | **`control_xl_listing`** | **`maxforlive`** | **referral** | **Added 2026-06-12.** Control XL device listing (device id **15522**). |

**maxforlive.com listing (deployed to prod 2026-06-12).** Vanity redirects on `fadercraft.com`, all
carrying `utm_source=maxforlive&utm_medium=referral&utm_campaign=control_xl_listing`:
- `/m4l` → homepage
- `/m4l-modes` → `/free-custom-modes`
- `/m4l-buy` → Gumroad
ANY session with `utm_campaign=control_xl_listing` (or `utm_source=maxforlive`) = a click from the
maxforlive listing. Do NOT confuse with the reddit markers above. Attribution starts accumulating
only AFTER the founder swaps the listing's External Link to `https://fadercraft.com/m4l` — listing is
fresh, no traffic yet (don't count maxforlive numbers until they appear).

## State of traffic (as of 2026-06-12)
Data starts 2026-06-07. **First Reddit post 2026-06-10 ~19:00 Thai** (r/Novation, `reddit.com/r/Novation/comments/1u20ebm/`) → burst of ~37 sessions in 24h, but after removing owner-TH + bots, ~20-25 real external sessions. Reddit gave 811 post views → ~3% click-through to site. Funnels / A/B still premature; Session Replay is the lens.

**Second Reddit post 2026-06-11 (r/ableton, "How do you handle controller setup across different Live sets?", fadercraft.com dropped in OP comment, NOT in post body; flagged as AI-generated, 0 upvotes, 50% ratio, 2.5K post-views) → ZERO measurable site traffic.** Verified 2026-06-12: in the whole 06-11→06-12 window, NO session arrived with a reddit referrer pointing at the new post, and NO non-UTM `$direct` session entered the bare homepage `/` from a target country after the post went live. Every reddit-attributable session in this window still carries `utm_campaign=introduction_post` + entry `/free-custom-modes` = leftover TAIL OF THE OLD r/Novation post (that UTM is the old post's marker; it keeps trickling). Lesson: a dead/down-voted post that buries the link in a comment converts to ~0 clicks; the AI-generated flag likely killed it. Session-level pageview totals (owner excluded, bots NOT yet removed): 06-07=2, 06-09=3, 06-10=30, 06-11=21, 06-12=4 sessions. The 06-11 count is inflated by a ~14-session bot burst at 10:49–10:51 Thai (TH/US Chrome+Windows, vh==sh, same-second, 1 pv on `/`); real human 06-11 traffic ≈ 6-7 sessions, all old-post tail.

**Attribution gotchas (Reddit window):**
- The post's first hours had NO UTM — traffic arrived as `$direct` with entry `/free-custom-modes` (the post linked the free-modes page directly). From ~00:53 06-11 sessions carry `utm_source=reddit&utm_medium=social&utm_campaign=introduction_post` (link was updated/comment added). Reddit app (WebView) strips referrer → `$direct`; only occasionally `com.reddit.frontpage`. So referrer alone undercounts Reddit badly — use entry path + UTM + timing.
- YouTube traffic is indistinguishable ($direct, entry `/`).

**Bot/in-app markers:**
- `$viewport_height == $screen_height` (no browser chrome) ⇒ WebView/headless.
- NEW (2026-06-10): **same-second pairs** of US Desktop-Chrome + US Mobile-Chrome sessions (e.g. 21:07:43+21:07:48, 21:36:24+21:36:25, 21:49:47+21:49:48), each 1 pageview on `/`, ~5-15s, 0 clicks — link-preview/scraper bots that come after posting a URL on Reddit. Discount them.

**LIFETIME DEMAND READ (2026-06-12, full history 06-07 → 06-12, owner excluded, manual bot tag):**
- Total `$pageview`: 78 events / 60 sessions raw. After manual bot removal (15 bot sessions): **45 human sessions / ~38 unique visitors**.
- Human sessions by source: **direct/unattributed 31, reddit 11, internal inter-page nav 3.** ZERO organic-search referrers in the entire history (no google/bing/ddg ref ever). Two real sources only: Reddit (r/Novation 06-10 post) + direct/in-app.
- Conversion events, ALL TIME: `mode_download`=3 (3 sessions), `video_play`=3, **`buy_click`=0 (NEVER fired once)**, `social_click`=0, `newsletter_signup`=0 (not in event schema = never fired). `purchase`=2 but BOTH `is_bot=1`/`is_test=True` Gumroad pings → **ZERO real purchases ever.**
- Conversion shares (N too small for significance, report as raw): visit→mode_download = 3/45 ≈ 6.7%; visit→buy_click = 0/45 = 0%; visit→purchase = 0/45 = 0%.
- Quality by source: of 3 downloads, 2 came from `internal_ref`/`fadercraft.com`-referrer sessions (= engaged multi-page visitors) + 1 reddit; all 3 video_plays were reddit sessions (reddit visitors are the only ones who pressed play). Direct/$direct 31 sessions → mostly single-pageview bounces on `/`, only 1 download. Reddit = highest-engagement source (every multi-pageview + every video_play). Direct = bounciest.
- Day trend: 06-07=2, 06-09=3, 06-10=18, 06-11=18, 06-12=4 human sessions. Shape = ONE promo spike (Reddit r/Novation post) + decay, no organic tail. Not growth, not plateau — single push, fading.
- **Verdict: essentially pure push, no market pull yet.** People arrive only when actively pushed (Reddit), grab the FREE modes a little (3 downloads), but 0 buy-intent clicks and 0 sales across the whole life of the site. Demand signal is near-zero on the paid funnel; the only faint positive is free-mode pull from Reddit.

**Owner devices & the leakage (audited 2026-06-11):**
- `$identify` → `fadercraft-owner` fired 4× total: 06-07 23:44 Brave/Desktop/Mac (laptop), 06-07 23:44 **Chrome iOS** (= Brave on iPhone — Brave iOS uses CriOS UA, PostHog detects it as "Chrome iOS", NOT "Brave"), 06-10 14:41 Mobile Safari ×2 (both with FRESH anon ids 16s apart — typical of private tab / in-app SFSafariViewController where localStorage doesn't persist).
- Flagged devices ARE excluded by `filterTestAccounts:true` — verified 06-11 (trends with filter shows zero owner rows).
- **Re-flag test 06-11 11:12 Thai (regular iPhone Safari, `/?ph_owner=1`):** `$set`+`$pageview` arrived ALREADY under `distinct_id=fadercraft-owner`, person `2352f295-…`, email present; NO new `$identify` event fired ⇒ regular Safari was ALREADY flagged since 06-10 14:41 (identify with same id = no-op, localStorage persisted). Hourly trends with `filterTestAccounts:true` show 0 Mobile Safari in the 11:00 bucket — owner's iPhone events are excluded. Owner data is now clean across laptop Brave, iPhone Brave ("Chrome iOS"), iPhone regular Safari.
- **Residual, accepted:** person `374b2aa6-9bf7-559d-97b9-c027527b0ba7` (distinct_id `019eafb2-d049-…`, 34 events, last 06-11 00:50, email None) did NOT merge — its distinct_id is not among owner-person's distinct_ids. Since regular Safari turned out to be already flagged, this orphan context is NOT regular Safari — likely an in-app browser (SFSafariViewController/Reddit-app) with its own persistent storage. Its 34 historic events stay in filtered results forever (person-on-events); it may add more if the owner browses via that in-app context again — watch for new TH Mobile Safari events with email=None from this distinct_id.
- New bot pattern 06-11 ~10:50: burst of ~7 fresh TH **Chrome/Windows** distinct_ids + 3 US no-browser ids, 1 pageview each on `/` within 2 min — scanner-like, geo TH but Windows ⇒ not the owner's devices; discount.

## Related project memory
Brand & workspaces: [[../../../memory pointers handled in main MEMORY.md]]. Analytics reference memory: `reference_fadercraft_analytics`. Deploy: `reference_fadercraft_deploy`.
