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
- **283039** — **Plugin — Mixer tab click** (created 2026-06-27). `$autocapture` on `<button>`
  with text exact `11`/`12`/`13`/`14` (4 OR steps). ✅ CONFIRMED LIVE: 54 autocapture hits
  over the last 30 days (breakdown: 11=15, 12=13, 13=13, 14=13). The `aria-label` (`Mode 11`…)
  is NOT captured as a flat property in SQL — PostHog stores element attrs in the internal
  elements table. The TEXT-based matcher is the confirmed reliable signal. NOT pinned to Goals.
- **283040** — **Plugin — Checkbox row click** (created 2026-06-27, matcher UPDATED 2026-06-28).
  One step: custom event `demo_interact` + property filter `control = 'checkbox'` (exact).
  Props also include `element` ∈ {Page, Bank, Daw, Prelisten} — breakdown by `element` for
  per-row split. ⚠️ Code built locally 2026-06-27, NOT yet deployed → zero historical hits;
  fills from first visit after release. NOT pinned to Goals.
- **283077** — **FAQ — question opened** (created 2026-06-28). One step: custom event `faq_open`
  (no property filter = any question). For per-question breakdown use `question` prop.
  ⚠️ Zero historical hits — `faq_open` deployed 2026-06-28. NOT pinned to Goals.

Saved insights (favorited):
- **NnXsc3IV** — **FAQ opens by question** (created 2026-06-28). TrendsQuery, `faq_open`,
  `math=total`, breakdown by `question` (event prop), `ActionsBarValue` display (total bar chart,
  not time-series). Added to dashboard **1680409** (My App Dashboard). Zero data until
  `faq_open` accumulates events post-deploy.

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

## A/B experiment (LAUNCHED 2026-06-11 12:46 Thai)
- **Experiment 376381** — "Hero copy — permanent interface vs feature-led", `https://us.posthog.com/project/458316/experiments/376381`. Status **running** since 2026-06-11T05:46:30Z (12:46 Thai); landing code reading the flag was deployed to prod BEFORE launch and verified.
- Feature flag **`hero-permanent-interface`** (id 711811, auto-created by experiment) — **active:true** (experiment-launch activates it itself). Variants `control` (current feature-led hero) / `test` (permanent-interface copy: eyebrow "M4L INTERFACE FOR LCXL MK3", H1 "One controller. Your permanent interface.", body "Map once — the same layout from studio to stage, in every Live Set."), 50/50, rollout 100%.
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

Cohorts:
- **378522** — `Review candidates — engaged 2026-06-24` (STATIC, count=3). The three engaged-but-non-converting sessions worth a Session Replay watch: CH/maxforlive 06:14 (30 clicks, demo_interact+2 video_play), IE/facebook 19:57 (527s, 3 pages incl. /updates), TR/reddit 14:11 (scrolled to footer Buy-CTA without clicking). Built from a HogQL query on the three distinct_ids → person_ids. https://us.posthog.com/project/458316/cohorts/378522 — created by Kirill 2026-06-24, verified live. Filter Session Replays by this cohort to find them. Pattern reusable for future "watch these" batches.

Pre-existing = PostHog templates only: Web Analytics starter dashboard **1680409** (WAU/DAU/retention/referring domain), LLM-analytics dashboard **1680554** (ignore — not the landing).

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
| **Facebook (`utm_source=facebook`)** — TWO DISTINCT ORIGINS, see note | **`novation_group`** | **`facebook`** | **`community`** | **Added 2026-06-24.** The `facebook` source spans TWO different things on two days — DO NOT lump them. **(1) 06-20 traffic = manual outreach:** owner hand-dropping links in REPLIES to random people's comments on FB — 1-on-1, one-off, NOT self-sustaining, NO tail expected. **(2) 06-24 traffic (the 5 sessions) = a REAL Novation-group POST:** organic group post, so `novation_group` is the CORRECT name for today's traffic and this IS a proper channel that MAY produce a multi-day tail like the Reddit post — WATCH whether 06-25+ shows facebook day-tails to judge if the group post has legs. Entry mostly `/free-custom-modes` + `/`. CAVEAT: medium is `community` (NOT `social`); some clicks arrive via **`fbclid` only with NO UTM** (referrer `www.facebook.com`/`m.facebook.com`/`Facebook Mobile`) → to catch the whole source use `utm_source=facebook` OR referrer icontains `facebook`. Best session 06-24 IE Mobile 527s/3 pages/2 video_play. **PostHog Action: 282107** `Channel — Facebook / Novation group` (two OR steps: $pageview utm_source=facebook; $pageview $referring_domain icontains facebook), https://us.posthog.com/project/458316/data-management/actions/282107 — created by Kirill 2026-06-24, verified live. |

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
