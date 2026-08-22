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
- Code: guarded inline snippet in `~/Projects/Projects/fadercraft/app/index.html` `<head>`.
- Public project token (client write-only, safe in repo): `phc_CjTzqqmUa65wJMnWCVA2xKCX8LkDkeotu5hEcQz7kPaq`.
- Loads **only on `fadercraft.com` / `www.fadercraft.com`** — localhost/preview don't pollute analytics.
- The site is a **SPA, one `index.html`**; routing via `?p=…` (`?p=free-modes` = custom-modes page). One snippet covers every route; SPA pageviews auto-tracked. No per-page snippet needed.
- **ROUTING UPDATE (confirmed 2026-07-07, `app/src/App.tsx`):** the app has since grown real
  pathname routing alongside the legacy `?p=` redirect (which now only rewrites `?p=free-modes`
  → `/free-custom-modes` and `?p=legal` → `/legal`, then continues). Current path map: `/` =
  **HubPage** (the umbrella brand page, NOT the Control XL product anymore), **`/control-xl`** =
  ProductPage (Control XL), `/free-custom-modes`, `/legal`, `/updates`, **`/sends-follower`** =
  SendsFollowerPage, **`/dynamic-focus`** = DynamicFocusPage (Mapping Deck),
  `/guide/launch-control-xl-mk3-across-live-sets`. Any unknown path redirects to
  `/`. **When filtering events by product, use `$pathname` exact `/control-xl` or `/sends-follower` or `/dynamic-focus`**
  — don't assume `/` is Control XL traffic anymore (older memory entries before this date treat `/`
  as the product page; that's now the Hub).
- First-party reverse proxy: `api_host: https://fadercraft.com/ingest` → Cloudflare Pages Function `app/functions/ingest/[[path]].js`. Beats Brave/ad-blockers (events count again).
- Deploy gotcha: run wrangler FROM `app/` (`cd app && wrangler pages deploy dist --project-name=fadercraft-landing --branch=main`) so `app/functions/` (the proxy) is bundled.

## Owner self-exclusion (always filter the owner out)
- Visiting `fadercraft.com/?ph_owner=1` once per device sets `localStorage.ph_owner=1` and `posthog.identify('fadercraft-owner', {email:'hellokbbureau@gmail.com'})`.
- **In every query pass `filterTestAccounts: true`** so the owner's own visits don't skew numbers.

### Project-level test_account_filters (updated 2026-07-24)
Two conditions — a session is included only if it passes ALL (i.e., excluded if it fails ANY):
1. `cohort not_in 349231` — excludes anyone in the internal/bot cohort (pre-existing cohort: "$internal_or_test_user=true OR email icontains @fadercraft.com" — DO NOT MODIFY)
2. `email is_not hellokbbureau@gmail.com` (type: person) — primary owner exclusion

**No viewport_width condition at project level.** The PostHog `test_account_filters` API is a flat array with a single AND/OR type — it cannot express compound `NOT (country=TH AND viewport IN [1920, 390])` logic natively. Adding viewport_width alone (globally) would incorrectly exclude real non-TH visitors with 1080p monitors or iPhones. The compound logic lives only in the 4 HogQL insights below.

**TH geo-based exclusion REMOVED 2026-07-24.** All `$geoip_country_code NOT IN ('TH')` filters stripped from every insight. Thailand geo was the legacy owner-exclusion; now replaced by email + compound HogQL condition.

**Owner device widths confirmed 2026-07-24** (fresh fadercraft-owner sessions at 20:55–20:58 ICT):
- MacBook (Brave/Mac OS X): `$screen_width=2560` (external QHD monitor — NOT used), `$viewport_width=1920` (browser window)
- iPhone (Chrome iOS/iOS = Brave on iPhone): `$screen_width=390`, `$viewport_width=390`

**VPN/abroad risk**: if owner travels outside TH, the viewport-based geo compound won't fire — only email identify catches them. Owner confirmed this is accepted (2026-07-24).

### HogQL insights — manual exclusion pattern
DataVisualizationNode/HogQLQuery don't support `filterTestAccounts`. These use the compound condition:
```sql
AND (person.properties.email IS NULL OR person.properties.email != 'hellokbbureau@gmail.com')
AND NOT (properties.$geoip_country_code = 'TH' AND properties.$viewport_width IN (1920, 390))
```
Logic: only exclude viewport 1920/390 when the session is ALSO from Thailand — avoids false positives for real visitors with common 1080p monitors or iPhones outside TH.

For insights where viewport_w and country_code are aliases from argMin in subquery (LpqpZ5R1):
```sql
AND NOT (country_code = 'TH' AND viewport_w IN (1920, 390))
```
The LpqpZ5R1 subquery also captures: `argMin(properties.$geoip_country_code, timestamp) AS country_code` (added 2026-07-24).

## Custom events (set up 2026-06-07, client-side delegated listeners)
- `buy_click` — any link to `gumroad.com/l/` checkout. Props: `href`, `label`, `path`.
- `newsletter_signup` — submit of the Gumroad-follow form. Prop: `path`.
- `social_click` — click to a known social host (discord/youtube/instagram + X/tiktok/fb/linkedin/telegram ready). Props: **`platform`**, `href`, `path`. → break social down by `platform` to see which network.
- All measure on-site clicks, NOT the downstream Gumroad purchase/confirm.

Added 2026-06-10 (same delegated pattern in index.html) — **deployed & verified firing 2026-06-10/11**:
- `video_play` — click on the demo-video play button (`button[aria-label="Play demo"]`). Prop: `path`. Explicit marker (a pageview can't tell a play apart).
- `mode_download` — click on a free-modes download link (`a[href$=".zip"]` / `.syx`). Props: `file`, `href`, `path`. Explicit marker (a file download fires no pageview).

**`purchase` event = Gumroad server-side webhook** (`gumroad-ping.js`, not our snippet). Props: `product_name`, `price`, `currency`, `sale_id`, `seller_id`, `refunded`, **`is_test`**, `source`, geo. `is_test` is RELIABLE — the webhook just mirrors Gumroad's `test` form-field (`is_test: f('test') === 'true'`), no bug, no inversion; so `is_test=True` rows are genuine setup/test pings, not mis-flagged real sales. ALWAYS filter `is_test != true` when counting real sales. DEDUP (2026-06-19): the webhook now sends a deterministic per-sale `uuid` derived from `sale_id`, so PostHog collapses Gumroad webhook RETRIES into one `purchase` event (no more row-per-retry). Pipeline verified working.

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
- ~~**277924** — CTA — Legal view~~ **DELETED 2026-06-18** (legacy misconfig — `cta_view`
  never fires on `/legal`, so the action — which actually matched `$pageview` URL contains
  `p=legal` — was a meaningless "CTA impression" sitting at 0→0→0.0% in monitoring; only ever
  1 hit, a pageview on 06-07). Replaced by 280502 below.
- **277925** — CTA — Custom Modes page view (`$pageview` URL contains `p=free-modes`) — no code
- **277926** — CTA — Video play (`video_play`) — needs deploy
- **277927** — CTA — Mode download (`mode_download`) — needs deploy
- **280502** — **Footer CTA view** (created 2026-06-18, replaces 277924). Impression of the
  footer Buy-CTA on the product page. **Two OR steps spanning an event RENAME**: step1
  `footer_cta_view` (NEW name, code-deployed 06-18) + step2 `cta_view` (HISTORICAL name), BOTH
  with `location=newsletter`. So the series is continuous across the rename. ✅ verified counting
  the historical newsletter impressions (06-16=3, 06-17=1, 06-18=1 = 5/30d).
- **281487** — **CTA — Video section view** (created 2026-06-22). Event `section_view` with
  property `section=video`. Tracks visitors who scrolled to the demo video section (engagement
  depth signal). Not yet pinned to Goals tile.
- **283039** — **LC — Mixer tab click** (created 2026-06-27; renamed CXL→LC 2026-07-19). `$autocapture` on `<button>`
  with text exact `11`/`12`/`13`/`14` (4 OR steps). ✅ CONFIRMED LIVE: 54 autocapture hits
  over the last 30 days (breakdown: 11=15, 12=13, 13=13, 14=13). The `aria-label` (`Mode 11`…)
  is NOT captured as a flat property in SQL — PostHog stores element attrs in the internal
  elements table. The TEXT-based matcher is the confirmed reliable signal. NOT pinned to Goals.
- **283040** — **LC — Checkbox row click** (created 2026-06-27, matcher UPDATED 2026-06-28; renamed CXL→LC 2026-07-19).
  One step: custom event `demo_interact` + property filter `control = 'checkbox'` (exact).
  Props also include `element` ∈ {Page, Bank, Daw, Prelisten} — breakdown by `element` for
  per-row split. ⚠️ Code built locally 2026-06-27, NOT yet deployed → zero historical hits;
  fills from first visit after release. NOT pinned to Goals.
- **283077** — **LC — FAQ opened** (created 2026-06-28; renamed CXL→LC 2026-07-19). One step: custom event `faq_open`
  (no property filter = any question). For per-question breakdown use `question` prop.
  ⚠️ Zero historical hits — `faq_open` deployed 2026-06-28. NOT pinned to Goals.

Saved insights (favorited):
- **0IFIRn2D** — **Visitors by country** (renamed 2026-07-27 from "Visitors — last 8 days by country"; created 2026-07-19; filter updated 2026-07-24).
  DataVisualizationNode (HogQL stacked bar), `$pageview`, `count(DISTINCT person_id)` per Bangkok calendar date × country.
  **DATE: `{filters.dateRange.from}` / `{filters.dateRange.to}` (2026-07-27)** — responds to dashboard date filter. Standalone default: `-30d`.
  Owner email + NOT(geoip_country_code=TH AND viewport_width IN (1920,390)) in WHERE. Display: `ActionsStackedBar`, xAxis=`day`,
  `seriesBreakdownColumn="country"` (property `$geoip_country_name`), showLegend=true. ORDER BY day ASC, unique_visitors DESC.
  Added to dashboard **1680409** (tile 9773263).
  https://us.posthog.com/project/458316/insights/0IFIRn2D
- **nXfjtj7g** — **Visitors by channel** (renamed 2026-07-27 from "Visitors — last 8 days by channel"; created 2026-07-19; filter updated 2026-07-24).
  DataVisualizationNode (HogQL stacked bar), `$pageview`, `count(DISTINCT person_id)` per Bangkok calendar date × channel.
  **DATE: `{filters.dateRange.from}` / `{filters.dateRange.to}` (2026-07-27)** — responds to dashboard date filter. Standalone default: `-30d`.
  Channel field: `coalesce(nullIf(session.$channel_type, ''), 'Direct')` — uses HogQL session join,
  customChannelTypeRules apply at query time ("Max for Live", "Reddit"). `nullIf` required because
  PostHog returns `''` (empty string) for some unattributed sessions, not NULL alone.
  Display: `ActionsStackedBar`, xAxis=`day`, `seriesBreakdownColumn="channel"`, showLegend=true.
  Added to dashboard **1680409** (tile 9778032).
  https://us.posthog.com/project/458316/insights/nXfjtj7g
- **NnXsc3IV** — **FAQ opens by question** (created 2026-06-28). TrendsQuery, `faq_open`,
  `math=total`, breakdown by `question` (event prop), `ActionsBarValue` display (total bar chart,
  not time-series). Added to dashboard **1680409** (My App Dashboard). Zero data until
  `faq_open` accumulates events post-deploy.

**Video watch-duration tracking** (deployed 2026-07-20, `VideoSection.tsx`):
- `video_play` — existing event (fires on play facade click). Props: `video_id`.
- `video_watch_time` — event (fires on pause / ended / unload via YouTube IFrame API).
  Props: `video_id`, `watched_seconds` (cumulative wall-clock play time, NOT position; last event
  per session = true total), `duration_seconds` (video total length), `reason` (pause|ended|unload).
  NOTE: `watched_seconds` is cumulative per session — always use `MAX(watched_seconds)` per
  (`$session_id`, `video_id`) to get the true total; don't average raw events.
  **video_id mapping (deployed 2026-07-24: now human-readable name; pre-2026-07-24 = raw hash):**
  - `UsJxPBdf568` / "Control XL" — ProductPage (`/control-xl`)
  - `1xYVGh-SX_k` / "Sends Follower" — SendsFollowerPage (`/sends-follower`)
  - `vEJGWkK9gIU` / "Dynamic Focus" — DynamicFocusPage (`/dynamic-focus`)
  Data as of 2026-07-24 (90d window, owner excl.):
  Sends Follower 78.7% avg depth / 5 sessions; Dynamic Focus 61.2% / 10 sessions; Control XL 0 sessions.

Video engagement insights:
- **2XiLH06o** — **Video watch depth by video (avg %)** (created 2026-07-24). DataVisualizationNode
  (HogQL), `ActionsBar` (vertical bar — DataVisualizationNode has no horizontal bar type; `ActionsBarValue`
  is TrendsQuery-only and can't do per-session MAX). SQL: AVG(MAX(watched_sec/duration_sec) per session)×100.
  Subquery deduplicates multi-event sessions correctly. `favorited:true`. Owner email excl. in WHERE.
  https://us.posthog.com/project/458316/insights/2XiLH06o
- **MDQRA3MU** — Video — watch log (per session). DataVisualizationNode (HogQL), ActionsTable.
  Columns: watched_at (ICT), video (Control XL / Sends Follower), watched_sec. One row per
  (session_id, video_id), MAX(watched_seconds) = true total. Owner email excluded in WHERE.
  Sorted newest-first. Added to dashboard 1680409 (tile 9813600).
  https://us.posthog.com/project/458316/insights/MDQRA3MU
  NOTE: Insights hKTIW3GC / 6LMN2VmZ / s5slvvUA / aGtx3J1O (charts/funnel/breakdown) were
  REMOVED from dashboard 2026-07-20 — owner wanted plain activity log, not charts.

**AUTOCAPTURE GOTCHA (confirmed 2026-06-27): `<li role="button">` is invisible to PostHog
autocapture.** Only native-interactive HTML tags captured by default (`<a>`, `<button>`,
`<input>` etc.). RESOLVED via variant A: custom `demo_interact` event with `control='checkbox'`
+ `element='Page'|'Bank'|'Daw'|'Prelisten'` fired in onClick handlers in PluginMockup.
Action 283040 updated accordingly — `$autocapture`+`<li>` matcher replaced.

**`section_view` IS LIVE & scroll-depth IS now instrumented (confirmed 2026-06-24).** Event fires
from 2026-06-22 onward with prop **`section`** ∈ {`video`, `faq`, `requirements`} — these are
mid/lower-page blocks, so a `section_view` = the session scrolled that far. 7d (06-17→24): `video`
10 sessions, `faq` 2, `requirements` 2. **GAP: NO `section=buy`/footer-CTA value** — buy-CTA reach
is still only inferable via the separate `footer_cta_view`/`cta_view` impression event (Action
280502), not via section_view. So scroll-to-video is measurable now; scroll-to-buy still needs the
footer_cta_view path. `section_view` carries NO buy/hero section yet.

## Footer-CTA impression event RENAME (code change 2026-06-18, NOT mine)
- Event `cta_view` → **`footer_cta_view`** (below-fold Buy-CTA impression). Historical data lives
  under `cta_view`; new events go under `footer_cta_view` once the fresh HTML propagates past the
  CDN cache on the apex (delayed at task time). `footer_cta_view` not yet in the event schema —
  expected, hasn't fired once yet.
- Property **`location`** distinguishes WHERE the impression fired: **`newsletter`** = the Buy
  banner in the FOOTER of the product page (this is "the footer CTA"); **`free_modes_bridge`** =
  the Buy bridge on the free-modes page. The hedge/hero CTA is NOT tracked.
- To count footer-CTA impressions ACROSS the rename: query Action **280502** (combines both event
  names + `location=newsletter`), or hand-roll trends with both `footer_cta_view` and `cta_view`
  filtered `location=newsletter`.

## A/B experiment — STOPPED 2026-07-16
- **Experiment 376381** — "Hero copy — permanent interface vs feature-led", `https://us.posthog.com/project/458316/experiments/376381`. Status **STOPPED** (conclusion: `stopped_early`). Ran 2026-06-11 → 2026-07-16 (35 days). Control copy hardcoded to production; experiment code removed from codebase. Feature flag DISABLED (active:false) same day.
- **FINAL NUMBERS (2026-07-16):** Exposures: control 82 / test 79 (total 161, balanced split — SRM p=0.81). Primary metric (exposure → buy_click action 277920): control 8/82 (9.8%) vs test 10/79 (12.7%). Test chance to win: 69.6% — **NOT significant**. Bayesian credible interval: −84% to +144% (wildly wide, n far too small). Secondary (pageview → buy_click): control 0/21 pageviews (validation failure: baseline-mean-is-zero), test 4/31 pageviews. Verdict: inconclusive, traffic volume was the bottleneck as predicted at setup (needed 1,778 exposures per variant; got only 82/79 after 35 days).
- Feature flag **`hero-permanent-interface`** (id 711811) — **active:false** as of 2026-07-16. Variants `control` / `test`, 50/50, rollout 100% (config unchanged, just disabled). No new users get either variant.
- Primary metric: funnel → Action 277920 (CTA — Buy click). Secondary: funnel `$pageview` → Action 277920. `exposure_criteria.filterTestAccounts: true`. Stats: Bayesian.
- Time-to-significance honesty in description: at ~10–20 sessions/day, 1–3% baseline, even 2x lift ≈ 2.5–8 months; +50% ≈ a year+. Owner deliberately set it up early to accumulate.
- **EXPOSURE BUG diagnosed 2026-06-15 — flag works, but `$feature_flag_called` is NEVER captured → experiment will never accumulate.** The flag is read fine: `$feature/hero-permanent-interface` rides on `$pageview` + custom events (56 ev 06-11, 23 06-12, 7 06-14, 57 06-15) and `$feature_flag_request_id` is present on the same events → SDK requests + applies the variant correctly. Variant split is real (lifetime ~control 8 / test 10 persons ≈ 50/50). BUT `$feature_flag_called` is STILL absent from the event schema and flag `last_called_at: null` → the dedicated exposure event is not being sent, so the experiment's funnel has a null denominator forever. The 06-11 "exposure 0 = normal after launch" read was WRONG: it's not a warmup, it's a config gap. Root cause = posthog-js not emitting `$feature_flag_called` (snippet likely bootstraps / reads flags via `advanced_disable_feature_flags`-style path or capture suppressed; needs `posthog.capture('$feature_flag_called')` to fire, normally automatic on `getFeatureFlag()`/`onFeatureFlags`). FIX: ensure the landing reads the variant via `posthog.getFeatureFlag('hero-permanent-interface')` (auto-emits exposure) OR call `posthog.capture('$feature_flag_called', {$feature_flag:'hero-permanent-interface', $feature_flag_response: variant})` once per visitor where the hero copy is chosen; redeploy from `app/` so the `/ingest` proxy is bundled; verify `$feature_flag_called` appears in `read-data-schema` + flag `last_called_at` populates. Until fixed, conversion-by-variant must be read manually off the `$feature/...` property (as done 06-15), NOT from experiment results. Buy_click by variant on 06-15: control 0 / test 0 (no buy_click has ever fired site-wide anyway). **Don't peek at significance — there's nothing valid to peek at yet.**

**ROOT CAUSE REFINED + DELIVERY CONFIRMED HEALTHY (2026-06-15 PM, server-side check).** The dev found the real client bug: a React effect read the flag inside `onFeatureFlags` but ran ONCE on mount when `window.posthog` was still undefined (posthog loads lazily via requestIdleCallback) → early-return, no re-run → `getFeatureFlag()` never called → `$feature_flag_called` never emitted. Fix (poll until posthog exists + register the callback) deployed to prod as **deployment c0dde357** ~14:50 ICT. My server-side verification of live data:
- **Flag DELIVERY to real web users WORKS — not the headless-test artifact.** Per-session pattern every session: the FIRST `$pageview` lands with `variant=None` + no `$feature_flag_request_id` (fires before `/flags` returns — normal lazy-load race), then within seconds `/flags` answers and ALL later events ($web_vitals/$pageleave/$autocapture/$pageview#2/mode_download) carry `$feature/hero-permanent-interface` = control|test + `$feature_flag_request_id`. If `/flags` returned empty `{}` the variant would NEVER appear — but it does, all day. So real browsers get the flag; the dev's headless `flags:{}` is a headless/test-harness artifact, NOT a production server-delivery problem.
- Hourly flow today (06-15 ICT) is CONTINUOUS, never cut off: feature-prop rode on events at 06:00=7, 07:00=26, 08:00=7, 09:00=6, 11:00=2, 12:00=12, 14:00=1; `$feature_flag_request_id` count == feature-prop count every hour (SDK requests AND applies). Last event of the day 14:15 ICT. All `$lib=web v1.386.6` (single SDK snapshot).
- **`$feature_flag_called` exposure STILL = 0 lifetime** (absent from taxonomy, flag `last_called_at` still null) AFTER c0dde357 — BUT this does NOT disprove the fix yet: **0 events arrived after 07:30 UTC (14:30 ICT), and c0dde357 went live ~14:50 ICT, so NOT A SINGLE real visitor has hit the patched bundle yet.** Verdict on exposure = UNVERIFIABLE until the next real session loads the new bundle. Monitor: re-run schema check + `last_called_at` after the next visit; expect `$feature_flag_called` to appear.
- Flag config is CLEAN: one group, rollout 100%, empty property filter, no cohort/release condition, `aggregation_group_type_index:null` (bucket by distinct_id). Activity log shows only created (06-11 12:39 ICT) + activated (06-11 12:46 ICT) — NOTHING changed in the last 12h, so the empty-headless-flags anomaly is not a config edit. `system.ingestion_warnings` EMPTY → no quota/drop warning; no `quotaLimited` on any flag response. No billing flag-request limit evident from the data (billing itself is org-scoped, outside MCP).

**EXPOSURE BUG FIXED — confirmed 2026-06-16 (see [[day-2026-06-16]]).** The above two paragraphs
are now HISTORICAL. After deploy c0dde357 (~06-15 14:50 ICT), `$feature_flag_called` FIRES for real
visitors: lifetime 13 events / 13 persons, earliest 06-15 15:40 ICT, by variant control 6 / test 7.
Experiment 376381 is accumulating exposures again. The first-ever `buy_click` (06-16) landed on
`control`. Still tiny N — don't peek at significance, but exposure is no longer null.

Saved insights (favorited):
- **A24NPDaz** — Landing conversion — Pageview → Buy click (funnel)
- **j8HECUNN** — Social clicks by platform (trends, breakdown by `platform`)
- **zt1U2A25** — SF landing conversion — Pageview → Buy click (funnel, mirrors A24NPDaz,
  scoped `$pathname=/sends-follower`). See Sends Follower parity below.
- **Jalc8E7K** — DF landing conversion — Pageview → Buy click (funnel, mirrors zt1U2A25,
  scoped `$pathname=/dynamic-focus`). Step 2 = Action 294066. Created 2026-07-23.
  https://us.posthog.com/project/458316/insights/Jalc8E7K
- **koOmdOdZ** — LC — Goals completions by week (created 2026-07-19; renamed + TH geo filter removed 2026-07-24). TrendsQuery,
  7 LC-action series (285962 Buy click / 285963 Video play / 285964 Footer CTA view / 285965
  Video section view / 283077 FAQ opened / 283040 Checkbox row click / 283039 Mixer tab click),
  `ActionsBar` display (stacked bar), `interval:week`, `date_from:-90d`, `filterTestAccounts:true` (no TH property filter).
  Added to dashboard **1680409** (tile 9773001). https://us.posthog.com/project/458316/insights/koOmdOdZ

Additional insights with TH geo filter removed 2026-07-24:
- **YMYbIjbc** — All goals — firing counts (8d). TrendsQuery, 17 Actions, `filterTestAccounts:true`. Had duplicate TH properties filter (both `country` and `$geoip_country_name` is_not Thailand, in two identical AND groups). Removed. Not on dashboard. https://us.posthog.com/project/458316/insights/YMYbIjbc
- **RikP9Cee** — **All goals — firing counts** (renamed 2026-07-27 from "All goals — firing counts (8d, fixed window SQL)"). HogQL SQL twin of YMYbIjbc (DataVisualizationNode). **DATE: `{filters.dateRange.from}` / `{filters.dateRange.to}` (2026-07-27)** — responds to dashboard date filter. Standalone default `-30d`. On dashboard 1680409 (tile 9919395). https://us.posthog.com/project/458316/insights/RikP9Cee
- **LpqpZ5R1** — Visits by visitor local hour (genuine traffic, owner+bots excl.). HogQL, subquery now also captures `argMin(properties.$geoip_country_code, timestamp) AS country_code`. Outer WHERE: `NOT (country_code = 'TH' AND viewport_w IN (1920, 390))`. Not on dashboard. https://us.posthog.com/project/458316/insights/LpqpZ5R1

## FAQ goal diagnosis + DF traffic spike + first real sale (2026-07-24 session)
- **Action 283077 "LC — FAQ opened" has NO `$pathname` filter** (`steps_json` confirmed via SQL: `properties: null`). Despite the "LC" name, it catches `faq_open` from ANY page. In practice, over 2026-07-17→24, **100% of `faq_open` hits came from `/dynamic-focus`, ZERO from `/control-xl`** — the "LC" label is misleading; this Action is currently entirely a DF signal. `294072` (DF — FAQ opened, pathname-scoped) already exists as of 2026-07-23 for clean DF-only tracking; 283077 itself is still unscoped — recommend adding a `$pathname exact /control-xl` filter to make the "LC" name true, or retiring/renaming it.
- **2026-07-22 "mass of FAQ firings" mystery SOLVED: it wasn't real.** That day had only 2 `faq_open` events, both from person `2352f295-19de-591c-8e8b-451037224106` = **the owner** (`person.properties.email = hellokbbureau@gmail.com`), dogfooding `/dynamic-focus`. Real site-wide unique visitors that day: 5 (matches the user's "5-6 people" recollection). **2026-07-21 had the real spike: 30 `faq_open` events, but again all 1 person = the owner**, opening all 6 DF FAQ questions repeatedly while testing. No bot, no tracking bug — just owner QA activity inflating the Action's raw count relative to real traffic. Always cross-check `faq_open`/goal spikes against `person.properties.email != 'hellokbbureau@gmail.com'` before reading them as visitor signal.
- **MAJOR: `/dynamic-focus` unique visitors exploded 2026-07-23→24** (owner excluded): 22 (07-23) → 43 (07-24, partial day) vs. 1-4/day the whole prior week (07-17→22). Verified NOT a bot burst: wide geo spread (US/DE/UK/UA/ES/NL/CA/MX/BY/CY/TH...), mixed browsers (Chrome/Safari/Firefox/Brave/Mobile Safari) and devices, all `$device_type` diverse — looks like genuine, organic-shaped traffic growth. Source/channel of this spike NOT yet diagnosed — worth a dedicated follow-up (UTM/referrer breakdown for 07-23/24 DF sessions).
- **First confirmed 100%-real Gumroad sale end-to-end:** `purchase` event, product **Dynamic Focus**, **$19 USD**, `sale_id=Wgh_zwm7-imPpyKEIX-Zkg==`, timestamp **2026-07-24 03:38:41 ICT** (= 2026-07-23 US Eastern/Pacific time — explains why it read as "yesterday's sale" to the user), `is_test=False`, `refunded=False`, `source=gumroad-ping`, country US, single row (dedup by `uuid` confirmed working, no retries duplicated). Pipeline Gumroad→`gumroad-ping.js`→PostHog worked flawlessly for this sale. (Contrast with 2026-07-11 Sends Follower ping, which was `is_test=True` — that earlier test-mode concern is NOT universal; real sales do land clean.)
- **BAm8V1TO** — **Pageview drop-off by day (site-wide)**. DataVisualizationNode (HogQL area chart). 3-level session drop-off: stopped after 1 page / 2 pages / reached 3+. **DATE: `{filters.dateRange.from}` / `{filters.dateRange.to}` (2026-07-27)** — responds to dashboard date filter. Standalone default `-30d`. Owner excl. + NOT(TH AND viewport 1920/390). Colors: #1d4aff / #9d34e8 / #2ea597. On dashboard 1680409 (tile 9993670). https://us.posthog.com/project/458316/insights/BAm8V1TO

## Dynamic Focus goal parity (created 2026-07-23, full spec + IDs in [[dynamic-focus-actions-spec]])
7 Actions for /dynamic-focus (Mapping Deck product). Route confirmed: `App.tsx:37` `/dynamic-focus`. Key difference from CXL/SF: Footer CTA view uses `location=footer` (not `newsletter`) — DF's closing `BuyButton` passes `location="footer"`. DF has a FAQSection (6 items) → FAQ action exists. No hero CTA tracking (same as CXL). Pinned (4): 294066 / 294069 / 294070 / 294071. Not pinned (3): 294067 / 294068 / 294072. Funnel: **Jalc8E7K** "DF landing conversion — Pageview → Buy click" (id 10394476), favorited. https://us.posthog.com/project/458316/insights/Jalc8E7K

## Sends Follower goal parity (created 2026-07-07, full audit in [[sends-follower-parity-2026-07-07]])
Control XL's CTA Actions (277920/277921/277922/280502/277926/281487) are all **site-wide**
(no page filter) — they were never product-scoped, so they already technically counted SF
events too, just mixed in with CXL. Built **product-scoped mirrors for SF** (event = same,
plus `$pathname` exact `/sends-follower`), pinned to match CXL's Goals-tile set:
- **285584** SF — Buy click (mirrors 277920) — pinned
- **285585** SF — Newsletter signup (mirrors 277921) — not pinned (CXL's isn't either)
- **285586** SF — Social click (mirrors 277922) — not pinned (CXL's isn't either)
- **285587** SF — Footer CTA view (mirrors 280502) — `footer_cta_view` + `location=newsletter`
  + pathname — pinned
- **285588** SF — Video play (mirrors 277926) — pinned
- **285589** SF — Video section view (mirrors 281487) — `section_view` + `section=video` +
  pathname — pinned
- **291089** SF — Track/Return toggle — `track_return_toggle` + `$pathname=/sends-follower` —
  pinned (2026-07-17). New event, zero data until after deploy. Property `to`=Track|Return.
- ~~**291090** SF — Bundle section viewed~~ **DELETED 2026-07-25** (owner request; `pinned_at` was null, not in Goals tile; only dependency was monitoring insight YMYbIjbc — no funnel impact).

**Not mirrored (product-scope N/A, not a tracking gap):** LC-only Actions 277925 (Custom
Modes page view), 277927 (Mode download), 283077 (LC — FAQ opened), 283039/283040 (LC — Mixer tab /
LC — Checkbox row clicks) — SF's page has no free-mode downloads, no FAQSection, and no
interactive PluginMockup/mixer demo, so these events structurally can't fire there. Not a code
gap to fix; SF is a smaller/simpler product page.

**Known discrepancy (flagged, not fixed — no code edits made):** `SendsFollowerPage.tsx:106`
passes `ctaLocation="hero"` to `HeroProduct`, so SF's hero Buy button gets `data-cta="hero"`
and DOES fire `footer_cta_view{location:'hero'}` (13 hits/60d as of 2026-07-07) — unlike
Control XL, where the hero CTA is deliberately left untracked (comment in
`useCtaViewImpressions.ts:6-9`: "the hero Buy is intentionally left untracked (above the fold
→ its impression would just equal pageviews)"). The "SF — Footer CTA view" action above
filters `location=newsletter` only, so it stays a true 1:1 mirror; the extra `hero` value is
real SF-only data, sitting ungoaled in the raw event stream if the owner ever wants it.

Cohorts:
- **378522** — `Review candidates — engaged 2026-06-24` (STATIC, count=3). The three engaged-but-non-converting sessions worth a Session Replay watch: CH/maxforlive 06:14 (30 clicks, demo_interact+2 video_play), IE/facebook 19:57 (527s, 3 pages incl. /updates), TR/reddit 14:11 (scrolled to footer Buy-CTA without clicking). Built from a HogQL query on the three distinct_ids → person_ids. https://us.posthog.com/project/458316/cohorts/378522 — created by Kirill 2026-06-24, verified live. Filter Session Replays by this cohort to find them. Pattern reusable for future "watch these" batches.

Pre-existing = PostHog templates only: Web Analytics starter dashboard **1680409** (WAU/DAU/retention/referring domain), LLM-analytics dashboard **1680554** (ignore — not the landing).

## Data Warehouse sources (created 2026-07-30)

### custom.leads (leads source, id 019fb27d-131b-0000-ac8c-a2af8c1def47)
- `base_url: https://fadercraft.com/api`, path `/leads-export`, auth Bearer
- HogQL name: `custom.leads`, table `custom_leads`
- Column structure: `data JSON` — single array column, each row = `[{...one_record...}]`
- Extraction: `JSONExtractString(data, 1, 'field')` (1 = first element of array)
- Syncs every 6h (full_refresh; incremental cursor is in DLT manifest, not PostHog sync_type)

### custom.cm.comments (comment miner, id 019fb304-63c5-0000-f882-d9f22a3e31d2)
- `base_url: https://fadercraft-comment-miner.hellokbbureau.workers.dev`, path `/export`, auth Bearer (WORKER_RUN_TOKEN from `~/.config/cloudflare/worker-env`)
- Prefix `cm_`, HogQL name: **`custom.cm.comments`**, table `cm_custom_comments`
- Column structure: **DIFFERENT from leads** — the endpoint returns ALL records in ONE response (`paginator: single_page`). DLT stores the ENTIRE `data` array as ONE ClickHouse row: `data = [{record1}, {record2}, ..., {record122}]`. So 1 row in `count()` but N records inside.
- Fields in each record: `created_time` (ISO8601), `text`, `category` (pain|question|feature_request|other), `product` (Control XL|Sends Follower|Dynamic Focus|Mapping Deck|Other), `reason`, `likes`, `replies`, `video`, `query`, `published`, `url`, **`status`** (comma-separated multi_select tag names from Notion "Status" property, e.g. `"Replied"` or `""`; added 2026-07-30)
- Primary key: `url` (unique YouTube comment URL — all real URLs are non-empty)
- **CORRECT extraction** — requires ARRAY JOIN to unnest records:
  ```sql
  SELECT arrayJoin(JSONExtractArrayRaw(assumeNotNull(data))) AS comment
  FROM custom.cm.comments WHERE data IS NOT NULL
  -- Then: JSONExtractString(comment, 'created_time'), JSONExtractString(comment, 'product') etc.
  -- Date: toDate(left(JSONExtractString(comment, 'created_time'), 10))
  ```
  DO NOT use `JSONExtractString(data, 1, 'field')` — that extracts only the FIRST record.
- Syncs every 6h (full_refresh). `incremental_sync` removed from DLT manifest 2026-07-30 (was causing DLT to process only 1 record per run due to cursor tracking).
- **Data as of 2026-07-30 (post-cleanup)**: **122 records** (1 ClickHouse row), date range 07-03 to 07-21. Breakdown: Mapping Deck 52 / Dynamic Focus 34 / Control XL 31 / Sends Follower 5 / Other 0.

**Data cleanup history (2026-07-30):**
- Before cleanup (original state): 212 records — Other 132 / Mapping Deck 52 / CXL 14 / DF 9 / SF 5.
- Kirill archived 90 null-product (Other) Notion rows + reclassified 42 (17→CXL, 25→DF). Notion archived pages are excluded from Worker's `/export` call via Notion API default behavior.
- Forced resync at 21:22 ICT confirmed completion. **GOTCHA**: ClickHouse caches queries by hash — after resync the "total count" query returned 122 immediately, but the GROUP BY product query returned old results from cache. Bypass: add any SELECT-level variation (e.g. add `pct` column via `round(...) OVER ()`).
- "Other" in chart = `product = 'Other'` (literal string, NOT NULL). Worker maps Notion null Product→'Other' on line 357 of index.js. After cleanup, 0 Other records remain.

**Root cause of initial 0-row sync (2026-07-30):**
- Worker's `NOTION_TOKEN` CF secret was expired/lost access to Notion → endpoint returned `{"data": []}` → DLT wrote empty data. Fixed by owner updating the secret. Diagnose: `/status` endpoint on Worker + direct Notion API check.

**Root cause of initial 0-row sync (2026-07-30):**
- Worker's `NOTION_TOKEN` CF secret was expired/lost access to Notion → endpoint returned `{"data": []}` → DLT wrote empty data. Fixed by owner updating the secret. Diagnose: `/status` endpoint on Worker + direct Notion API check.

**DLT JSON-wrapping note:** The leads source stores ONE record per ClickHouse row (`JSONExtractString(data, 1, 'field')`). The comments source stores ALL records in ONE row (must use ARRAY JOIN). Different endpoint pagination patterns cause different DLT behavior.

## F5Bot Data Warehouse source (PLANNED 2026-08-22, pending execution)

### custom.f5bot.hits (Reddit miner via F5Bot, PENDING CREATION)
- `base_url: https://fadercraft-f5bot.hellokbbureau.workers.dev`, path `/export`, auth Bearer (token at `~/.config/cloudflare/f5bot-run-token`)
- Prefix `f5bot_`, HogQL name: **`custom.f5bot.hits`**, physical CH table: `f5bot_custom_hits` (verify after first sync)
- Same single-blob storage pattern as `custom.cm.comments`: endpoint returns ALL records in ONE response, DLT stores entire `data` array as ONE ClickHouse row
- Column structure: `data JSON` — one row. Unwrap with ARRAY JOIN (same as cm.comments):
  ```sql
  SELECT arrayJoin(JSONExtractArrayRaw(assumeNotNull(data))) AS hit
  FROM custom.f5bot.hits WHERE data IS NOT NULL
  ```
- Fields per record: `created_time` (string "YYYY-MM-DD HH:MM:SS"), `title`, `text`, `product` (Control XL / Sends Follower / Dynamic Focus / Other), `reason`, `author`, `keyword` (comma-joined if multiple F5Bot keywords), `subreddit` (e.g. "/r/Elektron/"), `source` ("Reddit Posts" or "Reddit Comments"), `url` (direct Reddit link), `status` (plain string: `"worth_reply"` or `"skip"` — NOT a comma-joined multi_select like YouTube's status)
- Primary key: `url` (unique Reddit hit URL)
- **15 records as of 2026-08-22**: status=1 worth_reply / 14 skip; product=all Control XL; dates 2026-08-16 to 2026-08-22
- Source type: Custom REST (PostHog ExternalDataSource `source_type="Custom"`)
- Manifest format (for recreation): `{"client":{"base_url":"...","auth":{"type":"bearer"}},"resources":[{"name":"hits","primary_key":"url","endpoint":{"path":"/export","data_selector":"data"}}]}`
- Auth token goes in `payload.auth_token`, NOT in the manifest inline
- **Flat view**: `f5bot_hits_flat` (warehouse_saved_query) — unwraps the blob into one-row-per-hit with all columns labelled; see `setup-posthog-f5bot.py`
- **Script**: `/Users/Kirill/Projects/Projects/fadercraft/worker-f5bot/setup-posthog-f5bot.py` — creates source + view + updates both insights; needs `POSTHOG_API_KEY` env var

### Insights updated 2026-08-22 to include Reddit data (UNION with custom.cm.comments)
Both existing insights updated to UNION YouTube + Reddit data, source-agnostic flat merge:

**Mq5FXm5W SQL (updated)**:
```sql
SELECT
  count() AS total,
  countIf(status LIKE '%Replied%' OR status = 'worth_reply') AS replied
FROM (
  SELECT JSONExtractString(comment, 'status') AS status
  FROM (SELECT arrayJoin(JSONExtractArrayRaw(assumeNotNull(data))) AS comment FROM custom.cm.comments WHERE data IS NOT NULL)
  WHERE JSONExtractString(comment, 'created_time') != ''
  UNION ALL
  SELECT JSONExtractString(hit, 'status') AS status
  FROM (SELECT arrayJoin(JSONExtractArrayRaw(assumeNotNull(data))) AS hit FROM custom.f5bot.hits WHERE data IS NOT NULL)
  WHERE JSONExtractString(hit, 'created_time') != ''
)
```
Semantic note: "replied" = YT rows with Notion tag "Replied" + Reddit rows with status "worth_reply" (different semantics but owner-confirmed combined column).
Expected counts after sync: total=137, replied=17.

**lHKrFkPF SQL (updated)**:
UNION of both sources, breakdown by product only (source-agnostic per owner direction).
YouTube filter: `NOT LIKE '%Replied%'` (exclude processed); Reddit filter: `!= 'skip'` (exclude noise).

## Comment miner insight
- **lHKrFkPF** — **Comment miner — new comments by product per day** (created 2026-07-30; SQL updated 2026-07-30 to exclude Replied; SQL UPDATED 2026-08-22 to UNION Reddit hits).
  DataVisualizationNode (HogQL), ActionsStackedBar. xAxis=`day`, yAxis=`new_comments`, `seriesBreakdownColumn="product"`.
  **CORRECT SQL (uses ARRAY JOIN; filters out Replied records):**
  ```sql
  SELECT
    toDate(left(JSONExtractString(comment, 'created_time'), 10)) AS day,
    JSONExtractString(comment, 'product') AS product,
    count() AS new_comments
  FROM (
    SELECT arrayJoin(JSONExtractArrayRaw(assumeNotNull(data))) AS comment
    FROM custom.cm.comments
    WHERE data IS NOT NULL
  )
  WHERE JSONExtractString(comment, 'created_time') != ''
    AND JSONExtractString(comment, 'status') NOT LIKE '%Replied%'
  GROUP BY day, product
  ORDER BY day ASC, product
  ```
  **STATUS FILTER PIPELINE**: Worker export now includes `status` field (comma-separated Notion multi_select tags). HogQL filters `status NOT LIKE '%Replied%'`. After next DW resync (6h cycle), records marked "Replied" in Notion disappear from chart retroactively. Worker code change deployed 2026-07-30 (`runCommentsExport` map adds `status: (p.Status?.multi_select || []).map(o => o.name).join(',')`).
  Added to dashboard 1680409 (tile 10249479). `favorited:true`.
  https://us.posthog.com/project/458316/insights/lHKrFkPF

## Comment miner live count insight
- **Mq5FXm5W** — **Comment miner — total / replied** (created 2026-07-30; SQL UPDATED 2026-08-22 to UNION Reddit).
  DataVisualizationNode, ActionsTable (transposed), 1 row × 2 cols: `total` and `replied`.
  SQL now UNIONs `custom.cm.comments` (YouTube) + `custom.f5bot.hits` (Reddit). `replied` = YT Replied + Reddit worth_reply.
  Favorited, on dashboard 1680409 (tile 10258745). Description includes Notion DB link.
  **Verified live: total=122, replied=16** as of 2026-07-30. After f5bot sync: expected total≈137, replied≈17.
  https://us.posthog.com/project/458316/insights/Mq5FXm5W
- Old static text tile 10253830 **DELETED 2026-07-30** — replaced by the live insight above.
- Notion DB id: `39255889-1bb0-818f-ae1c-cd5d93a94041`

## Channel UTM markers (how to split traffic by campaign)
Each acquisition channel has its own UTM marker. When slicing traffic, filter by these to
attribute a session to its channel — don't lump them. Reddit-app WebView strips referrer
(→ `$direct`), so UTM + entry path + timing are the reliable signal, not referrer alone.

(Full watchlist of Reddit threads being tracked for attribution — incl. links not yet live — lives in [[reddit-threads-tracking]]. This table = markers that ALREADY fire.)

| Channel | `utm_campaign` | `utm_source` | `utm_medium` | Notes / entry |
|---|---|---|---|---|
| r/Novation post #1 (the introduction post) | `introduction_post` | `reddit` | `social` | The original 06-10 r/Novation post; entry usually `/free-custom-modes`. Its tail keeps trickling. |
| r/ableton post | `ableton_post` | `reddit` | `social` | The 06-11 r/ableton post (buried link, AI-flagged, ~0 real clicks). |
| **maxforlive.com listing** | **`control_xl_listing`** | **`maxforlive`** | **referral** | **Added 2026-06-12.** Control XL device listing (device id **15522**). |
| **Owner's YouTube channel** | **`control_xl_presentation`** | **`youtube`** | **`video`** | **First seen 2026-06-28.** UTM built via Gumroad UTM constructor, placed in Kirill's own YouTube video description/cards (links to site + Gumroad). NOT a third-party channel — this is Kirill's own video content. Attribute all `utm_campaign=control_xl_presentation` sessions as "own YouTube". |
| **Facebook (`utm_source=facebook`)** — MULTIPLE DISTINCT ORIGINS | **`novation_group`** | **`facebook`** | **`community`** | **Added 2026-06-24.** **(1) 06-20 = manual outreach** (1-on-1, no tail). **(2) 06-24 = Novation-group POST** (organic, multi-day tail). CAVEAT: some clicks arrive via `fbclid` only / no UTM → catch full source via `utm_source=facebook` OR referrer icontains `facebook`. Best session 06-24 IE Mobile 527s. **PostHog Action: 282107** (two OR steps). |
| **Facebook — M4L community** | **`m4l_community`** | **`facebook`** | `community` | **First seen 2026-07-13.** Referring from `l.facebook.com`, 2 sessions, all `/sends-follower`. Likely a Max for Live Facebook group. Unconfirmed — owner to clarify which post/group. |
| **Facebook — Ableton community** | **`abl_community`** | **`facebook`** | `community` | **First seen 2026-07-13.** Referring from `l.facebook.com`, 1 session, `/sends-follower`. Likely an Ableton Facebook group (abl = Ableton). Unconfirmed — owner to clarify which post/group. |

**maxforlive.com listing (deployed to prod 2026-06-12).** Vanity redirects on `fadercraft.com`, all
carrying `utm_source=maxforlive&utm_medium=referral&utm_campaign=control_xl_listing`:
- `/m4l` → homepage
- `/m4l-modes` → `/free-custom-modes`
- `/m4l-buy` → Gumroad
ANY session with `utm_campaign=control_xl_listing` (or `utm_source=maxforlive`) = a click from the
maxforlive listing. Do NOT confuse with the reddit markers above.
**Custom Channel Type "Max for Live" configured 2026-06-18** — `utm_source=maxforlive` now
classifies as its OWN channel (priority over Referral/Direct), stored in project
`modifiers.customChannelTypeRules`. Details + coverage + gotcha → [[custom-channel-maxforlive]].
**ALIVE as of 2026-06-15:** first real maxforlive session landed 2026-06-15 00:16 ICT (ES/Desktop
Edge): entered `/`, went to `/free-custom-modes`, 74s, **mode_download ×1**. Quality visit (the
listing's External Link swap worked). Maxforlive numbers are now real — start counting them.
**LIFETIME maxforlive (as of 2026-06-15 18:11 ICT): 2 sessions / 2 unique persons / 3 pageviews,
mode_download ×1, buy_click 0, video_play 0.** Both visits 06-15 (00:16 ES Desktop/Edge → `/`→
`/free-custom-modes`, dl×1; 04:58 DK Desktop/Firefox → `/` only, bounce, ref=maxforlive.com). No
per-week breakdown — both same day. Still single drops, not a stream.
**ATTRIBUTION GOTCHA (verified 2026-06-15): UTM lives on `$pageview`, NOT on conversion events.**
Filtering `mode_download`/`buy_click` by `properties.utm_source='maxforlive'` returns 0 — the
download/buy event fires WITHOUT utm props. To count a channel's conversions you MUST go session-level:
take session_ids whose `$pageview` carried the UTM, then count conversion events within those sessions
(subquery on `$session_id`). The per-UTM-on-event count undercounts (misses every dl/buy/video).

**NEW reddit UTM marker `organic` (seen 2026-06-15).** Fresh reddit sessions now arrive with
`utm_source=reddit&utm_medium=social&utm_campaign=organic` (NOT `introduction_post`). The old
r/Novation `introduction_post` tail is DEAD — its last session was 2026-06-12 10:10 ICT. So as of
mid-June there are two live channels: reddit `organic` (mostly bounce on `/`, ref `$direct` = app
WebView) + maxforlive `control_xl_listing`. Treat `introduction_post` sessions as historical only.

**NEW channel `telegram` (first seen 2026-06-15).** A `utm_source=telegram` session appeared in the
06-15 breakdown (1 pageview). New acquisition surface — watch it; UTM params for the telegram link
not yet documented. The 06-15 push was multi-source: reddit `organic` 9 pv + maxforlive 3 pv +
telegram 1 pv (+ direct/None 9 pv). Same impulse-spike shape as Reddit, not a steady tail.
Telegram link uses `utm_source=telegram&utm_medium=social&utm_campaign=organic` (confirmed 06-15
14:15 ICT, EE Mobile Safari, 1 pv on `/`, bounce).

**`ableton_post` IS ALIVE after all (revised 2026-06-15/16).** The earlier "r/ableton post = ~0
clicks" read was true for 06-11/12, but on 2026-06-15 the `utm_campaign=ableton_post` marker
delivered 3 real sessions: 02:50 US Mobile Safari (video_play ×1), 05:39 RU/Yandex Mobile
(**mode_download ×1**, entered `/free-custom-modes`), 15:40 RU/Yandex Mobile (`/` bounce). So
ableton_post now converts at least as well as organic. As of 06-15 there are FOUR live reddit
markers, not two: `organic`, `ableton_post`, plus tail `introduction_post` (one NL /free-modes
session 04:18) — treat all reddit markers as potentially live, don't pre-write any off.

## Daily traffic log (owner-excluded $pageview sessions)
06-07=2, 06-09=3, 06-10=30, 06-11=21, 06-12=4, **06-13=0, 06-14=1, 06-15=16, 06-16=22, 06-17=10, 06-18=4 (partial), 06-21=7 (external), 06-22=5 (external, excl. TH owner-noise), 06-25=3–4, 06-26=2, 06-27=2, 06-28=6 (clean, 4 bot sess stripped)** sessions.
**2026-06-28** = 6 clean sessions / 5 unique / ~14 PV. Three distinct channels in one day (unusual): Reddit `introduction_post` (FR Mobile Chrome, main actor), YouTube `control_xl_presentation` (IE Desktop Chrome — NEW UTM, unknown origin — someone published video w/ link), Google organic (HU Desktop Safari — FIRST-EVER Google→site referral in the site's history). Bot cluster 23:32 ICT: 4 US Desktop Chrome sessions in 6 seconds, vh=sh=768, no CTA events — scanner/link-preview, stripped. KEY: **2 buy_click** (both from same FR Mobile Chrome distinct_id `019f0dc7-e969-…`; session 20:35–20:51 ICT, 16 min, 3 pages, 4×video_play, demo_interact×1, FAQ+Requirements sections, mode_download×1; pressed "Open in Gumroad" + "Buy • $39" 26s apart — NO purchase event → didn't complete checkout). This is the 4th buy_click day ever. IE Desktop (youtube) also engaged: demo_interact×6, mode_download×1, footer_cta_view×2. No purchase event for anyone on 06-28.
**7-day social slice 06-11→06-18 (reported for copywriter/PM 2026-06-18).** Window totals (session-level, owner-excluded): reddit **39 sess / 61 pv** (the dominant channel, ~52% of all sessions), $direct/none 25, internal/onsite-ref 5, telegram 3, maxforlive 3, teams 2. Reddit by campaign over window: `abletonlive_post` 14 sess (1 dl, 5 cta_view — the 06-16/17 engine), `introduction_post` tail 14 sess (still trickling, 0 conv), `organic` 8 sess (2 video_play, 1 demo), `ableton_post` 3 sess (1 video_play). NO `youtube` source ever appeared (CORRECTED 2026-06-22: first `utm_source=youtube` sessions appeared 22:47 ICT on 06-21 evening — 2 sessions GE/Chrome/Windows, near-simultaneous, one engaged (demo_interact + footer_cta_view in 18s), one bounce (1s) — see [[day-2026-06-22]]). **social_click = 0 all window** (no on-site clicks to social hosts). Engagement in window: video_play 8 (reddit 3 + organic concentrated), mode_download 3 (reddit abletonlive_post DE, reddit ableton_post RU, maxforlive ES), demo_interact 5 (live since ~06-16), cta_view 8 reddit / scattered. Conversions in window: buy_click **4 total** (06-16 US iPad first-ever; 06-17 NL buyer; 06-18 PL ×2 — none reddit-sourced), real purchase **1** (the NL Control XL $39, see below). Spike days: 06-16 (22 sess, reddit abletonlive_post push) & 06-15 (16 sess, multi-source). 06-13 dead (0). **Sale #1 was NOT social** — buyer person `019eca70-97b0-…` (NL/Firefox) touched maxforlive listing 06-15 (UTM hid in $referrer → shows source None) then returned $direct 06-17, buy_click→backfilled purchase; reddit contributed 0 sales.
**2026-06-15** = the second-biggest day ever (16 human sessions / 13 unique / 22 pv), a fresh
multi-source push the day after a dead 06-13/14. NO bot burst (sessions arrived 1-3/hour, evenly
00:00-16:00 ICT — contrast the 06-11 14-session same-minute scraper cluster). Source split (06-15,
session-level): reddit 8 (organic 4, ableton_post 3, introduction_post tail 1), direct 7, maxforlive
2, telegram 1, internal nav 2. Conversions 06-15: **mode_download ×2** (1 maxforlive ES, 1 reddit
ableton_post RU), **video_play ×1** (reddit ableton_post US), **buy_click 0, social_click 0, real
purchase 0**. Still the same shape: free-mode pull (2 dl) + zero buy-intent. Geo widened: US, ES, DK,
DE, NL, RU, PL, EE, TH, GB. One GB Desktop Chrome with `vh==sh` (1080==1080) 16:34 = likely
WebView/headless — minor, discount.

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
- Conversion events, ALL TIME: `mode_download`=3 (3 sessions), `video_play`=3, **`buy_click`=0 (NEVER fired once)**, `social_click`=0, `newsletter_signup`=0 (not in event schema = never fired). `purchase`=2 but BOTH `is_bot=1`/`is_test=True` Gumroad SETUP/test pings (not real sales mis-flagged — `is_test` honestly mirrors Gumroad's field) → **ZERO real purchases as of 2026-06-10.** (First real sale later landed 06-17, backfilled — see [[sale-1-attribution]].)
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
