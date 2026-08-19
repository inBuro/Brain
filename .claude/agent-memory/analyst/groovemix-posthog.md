---
name: groovemix-posthog
description: GrooveMix (formerly Counter DJ) PostHog project — client token, project ID 542001, ingest proxy, owner exclusion, extension event schema, dashboard plan
metadata:
  type: reference
---

## GrooveMix PostHog project

Separate PostHog project from Fadercraft (458316), same US cloud. Renamed Counter DJ → GrooveMix 2026-08-05. **Moved to new org "GrooveMix" (id: 019fe5ea-f9f9-0000-99a3-a69c9bbbd945) on 2026-08-09** — lossless ownership-only transfer; was in Fadercraft org (019ea2d6-362f-0000-86ea-e7e2ddade215).

- **Client token (public, safe in repo):** `phc_BAghKLaJXyEZ9hcPdjQ7BFfQ3543X6aDDjzapsrJTE3S`
- **Numeric project ID:** **542001** (confirmed from `reference_groovemix_infra.md` memory)
- **US cloud host:** `https://us.posthog.com`
- **First-party ingest proxy:** `https://groovemix.app/ingest` (updated from counterdj.com 2026-08-05)
  - Proxy function: `~/Projects/Projects/groove mix/functions/ingest/[[path]].js`
- **Landing page snippet:** `~/Projects/Projects/groove mix/site/index.html`
- **Chrome extension:** `~/Brain/fadercraft/groove mix/sidepanel.js` — uses same token via `vendor/posthog.js`; events carry `source: 'extension'` property to separate extension traffic from landing-page traffic within the same project
- **`person_profiles: 'identified_only'`** — profiles created only on identify call
- **Owner identify:** when `localStorage.ph_owner === '1'` → `posthog.identify('counter-dj-owner', { email: 'hellokbbureau@gmail.com' })` (wired in extension sidepanel.js)

## Owner exclusion — test_account_filters

- **Status: ACTIVE** — set via MCP `project-settings-update` on 2026-08-06.
- Filter applied: `{"key":"email","type":"person","value":"hellokbbureau@gmail.com","operator":"is_not"}`
- `test_account_filters_default_checked: true` — new insights default to filtering test accounts.
- Anonymous sessions (email=null) pass `is_not` automatically — no false exclusions.

## Extension instrumentation (added 2026-08-05)

All extension events carry `source: 'extension'` property. This is the key filter to separate extension traffic from groovemix.app landing page traffic in the same project.

### Automatic events (PostHog SDK auto-capture, filter by source=extension)
- Standard PostHog session tracking applies (`$session_id`, GeoIP, etc.)
- Session count, session duration, sessions by country — all derivable from standard events + `source=extension` filter

### Per-session boolean super-properties (stamped on EVERY event once action fires)
These are session-level flags — a single event in a session with the flag = true means the session used that feature:
- `used_crossfader` — crossfade action fired
- `used_tempo_manual` — manual tempo drag/nudge (NOT the automatic first-lock engage)
- `used_phase_nudge` — ◀♪▶ beat-grid nudge buttons
- `used_eq` — touched any HIGH/MID/LOW knob
- `used_gain` — gain knob touched
- `used_fx_filter` — FX/filter knob touched
- `used_hotkeys` — any keyboard shortcut
- `used_zoom` — zoom control used

### Custom events
- `track_loaded` — props: `deck` (A/B), `via` ('connect' or 'auto_next'). "How many tracks/mixes" metric.
- `track_skip` — props: `direction` ('next'/'prev'). "How many skips/seeks" metric.

## HogQL function gotchas (GrooveMix project)

- `toBoolean(...)` → NOT supported; use `toBool(...)`
- `toInt32(...)` → NOT supported; use `toInt(...)`
- When grouping by `$session_id`, wrap all `properties.*` references in `any()` to satisfy ClickHouse aggregate rule
- UNION ALL in subquery works fine in PostHog HogQL
- Session properties accessed as `session.$session_duration` in HogQL math expressions
- CROSS JOIN in DataVisualizationNode subquery → HogQL parsing error; use scalar subquery in SELECT instead
- % adoption pattern: scalar subquery `(SELECT countDistinct($session_id) FROM events WHERE ...)` as denominator, `countDistinctIf(...)` per feature as numerator — validated 2026-08-06

## Key insights on dashboard 1957704 ("Extension Usage")

- **SVsIQ6DH** (id: 10797013) — "User Retention (weekly)" — RetentionQuery, track_loaded/source=extension, first_time, Week, 9 intervals, filterTestAccounts=true; favorited. Infrastructure — meaningful when n>20.
- **mLR5C7Jx** (id: 10797014) — "User Lifecycle (weekly)" — LifecycleQuery, track_loaded/source=extension, week interval, -90d, filterTestAccounts=true; favorited. NOTE: lifecycle requires person profiles — with `person_profiles: 'identified_only'` anonymous extension users may not appear (only identified users do). Infrastructure — meaningful when n>20.

Dashboard created 2026-08-05. Key insight IDs (do NOT delete these):

- **k8bQJDP3** (id: 10771016) — "Sessions by country" WorldMap. breakdown fixed 2026-08-07: was `$geoip_country_name` (map showed 0 — WorldMap requires ISO alpha-2 codes), corrected to `$geoip_country_code`. Confirmed data: TH=9 sess, MX=1 sess (30d). math=unique_session.
- **POj0JCaY** (id: 10826587) — "Users by country" WorldMap. Companion to k8bQJDP3 — identical config (source=extension, $geoip_country_code breakdown, -30d) but math=dau (unique users). Created 2026-08-07, on dashboard 1957704. PostHog has NO native per-tile aggregation toggle for WorldMap — two separate insights is the only option.
- **5mmf21PF** (id: 10770955) — Sessions over time (TrendsQuery, unique_session, daily, source=extension)
- **BoM5jXGa** (id: 11147699) — "Sessions — trailing 3 days (alert target)" — DataVisualizationNode/HogQLQuery, BoldNumber; rolling 3 complete days of unique extension sessions. Alert target for the silence alert; do NOT delete.
- **GkWeK0qL** (id: 10771407) — "Trial → License Funnel" (FunnelsQuery, 4 steps, favorited)
- **Fm8Hez3W** (id: 10792069) — "Users — Progress to 100 (cumulative)" — TrendsQuery, first_time_for_user math, ActionsLineGraphCumulative display, all-time, filterTestAccounts=true; favorited. Visual progress chart toward 100-user milestone.
- **XoX3sVkg** (id: 10792070) — "Total Extension Users (milestone alert)" — DataVisualizationNode/HogQLQuery, BoldNumber display; returns `count(DISTINCT person_id)` on track_loaded/source=extension/owner excluded. Alert target for 100-user milestone.

### Funnel GkWeK0qL step config (updated 2026-08-06)

Step 2 was `track_skip` with only `source=extension` filter (weak signal — skipping ≠ mixing). Updated to add HogQL OR filter:
```
"key": "ifNull(toBoolean(properties.used_crossfader), false) OR ifNull(toBoolean(properties.used_eq), false)",
"type": "hogql"
```
Custom name: "2. Active mixing (crossfader or EQ used)"

FunnelsQuery series does NOT support `type: "OR"` property group natively — must use HogQL filter for OR conditions on boolean props.

### Alert on extension sessions (created 2026-08-06, retargeted 2026-08-19)

- Alert ID: `019fd348-4fb4-0000-12bf-b0253e015512` (same alert, reused — not recreated)
- Name: "Sessions — 3-day silence alert" (was "Sessions — Daily Drop Alert")
- Insight: **BoM5jXGa** (id: 11147699) — "Sessions — trailing 3 days (alert target)", SQL BoldNumber.
  Was 5mmf21PF (daily trends), which is now chart-only and no longer wired to any alert.
- Condition: `absolute_value`, lower bound = 1; `calculation_interval: daily`;
  config `HogQLAlertConfig` / `evaluation: last_row` / `column: sessions_3d`
- Subscriber: Kirill Bush (id: 579310, hello@in-buro.com)
- URL: https://us.posthog.com/project/542001/alerts?alert_type=insights&alert_id=019fd348-4fb4-0000-12bf-b0253e015512

**Why retargeted:** the old version evaluated one calendar day against a lower bound of 1, so a single
day with nobody opening the extension fired it. It went off on 2026-08-18 (0 sessions) after 13
straight non-zero days (1–8 sessions/day, 1–5 DAU) — real low usage, not breakage. Verified the same
day: `groovemix.app/ingest` 200 on POST, site 200, and the project still received events on 08-18
(5 events, landing-page traffic), so ingestion was alive; only extension usage was absent.

**Why a new insight rather than `calculation_interval: weekly`:** PostHog docs do not state whether a
weekly calculation interval evaluates a weekly bucket or just re-checks the insight's own daily bucket
less often, and `alert-simulate` only works for anomaly detectors, so the semantics could not be
probed. Putting the window inside the query removes the ambiguity — the alert now fires only when
three consecutive complete days have zero extension sessions.

**SQL / day-boundary note:** `SELECT count(DISTINCT properties.$session_id) ... WHERE
properties.source = 'extension' AND toDate(timestamp) >= today() - 3 AND toDate(timestamp) < today()`.
Excludes the in-progress day on purpose. This SQL runs ~1 session/day lower than the trends
`unique_session` math on the same days (e.g. 08-17: SQL 4 vs trends 5) — irrelevant for a
zero/non-zero alert, but don't treat the two numbers as interchangeable in reporting.

### Alert: 100-user milestone (created 2026-08-06)

- Alert ID: `019fd5bf-8af8-0000-4234-5df4a91edc7b`
- Name: "100 Users Milestone Reached"
- Insight: XoX3sVkg (id: 10792070) — SQL BoldNumber, total distinct persons on track_loaded/source=extension
- Config: HogQLAlertConfig, evaluation=first_row, column=total_users
- Condition: `absolute_value`, upper bound = 100 (fires when total ≥ 100)
- Calculation: `daily`
- Subscriber: Kirill Bush (id: 579310, hello@groovemix.app)
- State: `Not firing`, enabled: true
- URL: https://us.posthog.com/project/542001/alerts?alert_type=insights&alert_id=019fd5bf-8af8-0000-4234-5df4a91edc7b
- NOTE: Alert evaluates the raw SQL result (not a display-transformed cumulative). SQL manually excludes hellokbbureau@gmail.com owner email.

### 100-user milestone baseline (2026-08-06)

SQL count: 1 distinct person has fired track_loaded/source=extension (owner excluded by email filter). This is the real-user baseline at MVP launch day.

- **zFYNKXKK** (id: 10797169) — "Avg session duration (min)": TrendsQuery, math=hogql `avg(session.$session_duration)/60`, source=extension filter, filterTestAccounts=true, postfix " min", 1 decimal. URL: https://us.posthog.com/project/542001/insights/zFYNKXKK
- **Tem47ElP** (id: 10771174) — "Feature engagement — % session adoption" (UPDATED 2026-08-06, was raw session table): DataVisualizationNode/HogQLQuery, ActionsBar, x=feature y=pct_sessions (%, 1 decimal, suffix "%"), all-time, owner excluded, sorted DESC. UNION ALL + scalar subquery denominator pattern. URL: https://us.posthog.com/project/542001/insights/Tem47ElP
- **CPouyUGc** (id: 10824757) — "Users — clicks per session (simple)": DataVisualizationNode/HogQLQuery, ActionsTable, 3 cols: user_id (concat('p:', substring(any(distinct_id),1,6))), session_started (ICT), clicks (countIf(event NOT LIKE '$%')). Excludes owner + healthcheck-script by distinct_id. Owner excluded via `distinct_id NOT IN ('counter-dj-owner', 'healthcheck-script')`. All-time, newest first. Companion to KwQI1Om4 — simple reading, no color coding. URL: https://us.posthog.com/project/542001/insights/CPouyUGc
- **uzam0hHG** (id: 10824948) — "Users — actions profile (all-time)": DataVisualizationNode/HogQLQuery, ActionsStackedBar, X=user_label (User N, dense_rank by first appearance), Y=13 stacked segments (same as KwQI1Om4). Aggregated per USER not per session — for boolean flags: sum = count of sessions where feature used; for track_skip/buttons: total count across all sessions. Two-CTE SQL: per_session→per_user. Owner excluded same as CPouyUGc. All-time. URL: https://us.posthog.com/project/542001/insights/uzam0hHG
- **sNsTON8V** (id: 10825089) — "Users — actions profile (by week)": Companion to uzam0hHG. DataVisualizationNode/HogQLQuery, ActionsStackedBar. X=week_label (concat 'User N | MM/DD', dense_rank by first_week per user). Same 13 stacked segments. Three-CTE SQL: per_session→per_user_week (GROUP BY person_id+week_start using toMonday())→user_ranks (min week per person). JOIN user_ranks to assign stable user rank numbers. ORDER BY ur.first_week, pw.week_start → User 1's weeks run left-to-right, then User 2's, etc. Owner + healthcheck excluded. URL: https://us.posthog.com/project/542001/insights/sNsTON8V

- **ObCBGzii** (id: 10793957) — "UI Errors by Message (extension)": TrendsQuery, `ui_error`/source=extension, ActionsBar, breakdown by event property `message` (top-25), interval=day, date_from=-7d, showLegend=true, filterTestAccounts=true; favorited. Top-level `properties` filter added 2026-08-09: `distinct_id is_not '019fda77-be69-742f-955d-db3bb755d580'` — excludes dev-session noise spike (~4,873 "No YouTube tabs open yet" events from a client-side polling bug, 2.7h spam on 08-09). Filter is insight-specific, does not affect other insights. Real errors still visible: "Deck B disconnected" (8 on 08-06, 13 on 08-07), "Deck A: injection failed" (3 on 08-07), "No other YouTube tab" (6 on 08-07), "Phase sync failed: tab not found" (5 on 08-07). URL: https://us.posthog.com/project/542001/insights/ObCBGzii

- **KwQI1Om4** (id: 10797695) — "Session actions — stacked breakdown": DataVisualizationNode/HogQLQuery, ActionsStackedBar, x=session_label (datetime + **person prefix** `p:XXXXXX` — first 6 chars of `any(distinct_id)`, ICT), y=13 stacked series (8 bool flags as 0/1 + track_skip_count + 4 individual button columns: btn_play_pause/btn_cue/btn_connect/btn_swap_decks), all-time, owner excluded. Labels: "Play/Pause", "Cue", "Connect", "Swap Decks". Updated 2026-08-07 — X-axis label changed from `$session_id` fragment to `distinct_id` fragment so same `p:XXXXXX` suffix = same person. NOTE: original `$session_id` prefix (4 chars) was both wrong AND useless — all recent sessions share the same time-based UUID prefix "019f". Uses 6 chars of distinct_id (not 4) because current 2 persons differ only at position 6 (`019fd2` vs `019fd9`). In production data as of 2026-08-07: 7 sessions = 2 distinct persons (person A `019fd2` = 6 sessions 08-05→08-06; person B `019fd9` = 1 session 08-07). `distinct_id` is always populated regardless of `person_profiles` setting — client-side assignment. URL: https://us.posthog.com/project/542001/insights/KwQI1Om4
- **JI5ThErb** (id: 10770986) — "Session duration (per session)": DataVisualizationNode/HogQLQuery, ActionsTable, columns: SESSION / STARTED / DURATION. DURATION column uses CASE WHEN dur_sec>=60 THEN concat(round/60.0,' min') ELSE concat(dur_sec,' sec'). Threshold 60s (standard boundary). Owner excluded (explicit email filter). Last 90 days, newest first. URL: https://us.posthog.com/project/542001/insights/JI5ThErb

- **ntZBRM9g** (id: 10872867) — "Feedback — Avg Rating Over Time": InsightVizNode/TrendsQuery, feedback_idea/source=extension, math=avg/math_property=rating, weekly, -90d, filterTestAccounts=true; favorited. URL: https://us.posthog.com/project/542001/insights/ntZBRM9g
- **4rICa6HS** (id: 10872870) — "User Feedback (rating + text)": DataVisualizationNode/HogQLQuery, ActionsTable. Columns: submitted_at/distinct_id/feedback_text/rating. All feedback_idea events, newest first. **NO `{filters.dateRange.*}` → immune to dashboard date filter, shows all-time always.** Owner excluded via `distinct_id NOT IN ('counter-dj-owner', 'healthcheck-script')`. NOTE: 019fd215 junk entries ("dfdsfdsf"/"check") still appear — no person record, uncatchable; 019fda93 test rating=4.0 also visible. Accepted. Updated 2026-08-13 to remove date filter vars (was using `{filters.dateRange.from}` / `{filters.dateRange.to}` which caused dashboard to override to last 7 days). URL: https://us.posthog.com/project/542001/insights/4rICa6HS
- **VdDdhxpd** (id: 10990801) — "Extension — Language Distribution": **DataVisualizationNode/HogQLQuery** (ActionsBar, bar chart). SQL: countDistinct($session_id) by $browser_language on track_loaded/source=extension. Excludes TH geo (`properties.$geoip_country_code != 'TH'`) + distinct_id NOT IN ('counter-dj-owner', 'healthcheck-script'). **NO `{filters.dateRange.*}` → completely immune to dashboard date filter.** All-time aggregate always. favorited. Current data: en-US=4 (real users). URL: https://us.posthog.com/project/542001/insights/VdDdhxpd
  - **GOTCHA logged 2026-08-13**: InsightVizNode/TrendsQuery with `date_from:"all"` is NOT immune to dashboard global date filter — dashboard overrides it. Only DataVisualizationNode/HogQL without `{filters.dateRange.*}` is truly immune.

### filter_test_accounts in person-on-events mode — key gotcha (2026-08-09)

Setting `test_account_filters` (email is_not hellokbbureau@gmail.com) has NO retroactive effect on historical events. In person-on-events mode, person.properties.* reflects values AT ingestion time. Email set on a person TODAY does not appear in events ingested before today. The filter only catches FUTURE events where the email property is ingested alongside the event. Result: `owner_sessions = 0` for all days in comparison query on 2026-08-09 — the filter made zero numeric difference to the dashboard.

### Deleted orphan template insights (2026-08-06)

All 8 PostHog sample insights were soft-deleted (all had `is_sample: true`, no dashboard memberships, `favorited: false`):
3AoEoBDo, f8R8mwoo, OylC9zXp, OGl5YtSk, Ebfprlsr, NWAOeoH8, eURXr1ox, ijc8hYCd

## Website dashboard "GrooveMix — Website" (created 2026-08-14, id 1993143)

Companion to "Extension Usage" (1957704) — that one covers the Chrome extension (`source=extension`); this one covers the groovemix.app landing page only. Mirrors Fadercraft's website-dashboard pattern (pinned Goals + funnel + CTA breakdown), applied here as an actual PostHog Dashboard object since GrooveMix already has a dashboard-centric culture (unlike Fadercraft, which leans on the native Web Analytics tab).

**Key discovery: `button_click` is NOT site-exclusive.** It also fires from the extension with `button` values `connect`/`play_pause` (no `surface` prop set on those). Site-side button_click always carries `surface` = `"site"` or `"site_bottom"` (confirmed via `read-data-schema` event_property_values). **Every site-scoped Action/insight MUST filter `surface in [site, site_bottom]`** or it silently blends in extension clicks — first pass at the 3 actions below didn't have this filter and pulled in `connect`/`play_pause`; caught and fixed same session.

**3 Actions created** (Data Management), all scoped `button_click` + `surface in [site, site_bottom]`:
- **324343** "Site — Web store click" (`button=web_store`) — PRIMARY conversion goal, **pinned** to Web Analytics Goals tile (mirrors Fadercraft's only-pin-the-buy-click-equivalent pattern)
- **324344** "Site — Fadercraft click" (`button=fadercraft`) — tracks the cross-promo link to fadercraft.com (now UTM-tagged `utm_source=groovemix&utm_medium=nav&utm_campaign=cross_promo`, see [[reference_outbound_links_doc]] in Brain memory / `fadercraft/wiki/outbound-links.md`). NOT pinned.
- **324345** "Site — Buy coffee click" (`button=buy_coffee`) — donation link. NOT pinned.

**5 insights on the dashboard, all favorited:**
- **Elfkc6gG** (id 11004547) "Site conversion — Pageview → Web store click" — funnel, $pageview → Action 324343. Baseline 2026-08-14 (30d): 131 pageviews → 6 clicks, 4.58% CR.
- **UVPLCzCR** (id 11004592) "Site — CTA clicks by button" — TrendsQuery, button_click/surface filter, breakdown by `button` (ActionsBar).
- **7oadichS** (id 11004593) "Site — Pageviews over time" — TrendsQuery, daily $pageview, no extra filter needed ($pageview is host-guarded to groovemix.app client-side, confirmed via event_property_values `$host`="groovemix.app" only, single pathname "/").
- **nUP4a523** (id 11004608) "Site — Traffic sources" — WebStatsTableQuery, breakdownBy InitialReferringDomain. Baseline: mostly `$direct` (128/131, friends/personal contacts), 2 from chromewebstore.google.com, 1 from bing.com. Thin data as of 2026-08-14 — pre-real-launch.
- **s1IDWFMd** (id 11004730) "Site — Visitors by country per day" — TrendsQuery, `$pageview`/math=dau, ActionsStackedBar, breakdown by `$geoip_country_code`, daily, -30d. No `surface` filter needed ($pageview is inherently site-only, see above). Added 2026-08-13 on user request ("посетители по стране за каждый день, стейкед бар чарт"). 23 distinct countries in the 30d window, US/TH dominant.
- **gH5tUzXG** (id 11005102) "Site — Visitors by channel per day" — TrendsQuery, `$pageview`/math=dau, ActionsStackedBar, breakdown by **`$channel_type`** (type=`session`, not `event` — it's a session-level virtual property, NOT a raw event property; confirmed via `read-data-schema {"kind":"entity_properties","entity":"session"}`, does not appear in `event_properties` for `$pageview`). Values seen: Direct, Organic Search, None. Added 2026-08-13.
- **bvQhh65l** (id 11005112) "Site — All goals firing counts" — TrendsQuery, 3 ActionsNode series (324343/324344/324345, one per goal) instead of a property breakdown, ActionsStackedBar, daily, -30d. Mirrors Fadercraft's "All goals — firing counts" concept but as a stacked trends chart instead of a HogQL wide-table. Added 2026-08-13.
- **cQQVWZsi** (id 11005118) "Site — Visitors by referring domain" — TrendsQuery, `$pageview`/math=dau, breakdown by `$referring_domain` (type=event), display=**ActionsBar (plain, not stacked)** — deliberately different from the country/channel/goals charts per user request ("просто бар чарт"). Companion to nUP4a523 (session-level WebStatsTableQuery table) — this one is the simple visual version. Added 2026-08-13.

**waitlist_joined event is DEAD CODE** — `functions/api/waitlist.js` exists (comment says "for groovemix.app's coming-soon page") but nothing in the current `site/index.html` calls `/api/waitlist`. Not built into a goal; skip it like Fadercraft skipped the "Legal view" action for a non-firing path.

Dashboard URL: https://us.posthog.com/project/542001/dashboard/1993143

## Accessing this project in PostHog UI
Direct URL: `https://us.posthog.com/project/542001/`
