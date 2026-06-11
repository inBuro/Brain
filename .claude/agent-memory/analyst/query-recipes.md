# PostHog query recipes (via mcp__posthog__exec)

Hard rule of the `exec` gateway: `search` → `info` → `schema` (for hinted fields) → `call`. Never guess a tool's schema. Before any data query, confirm the event exists with `read-data-schema`. Always pass `filterTestAccounts: true` (excludes the owner — see [[posthog-access]]).

## Discover what exists
- Events: `call read-data-schema {"query":{"kind":"events"}}`
- Props of an event: `call read-data-schema {"query":{"kind":"event_properties","event_name":"social_click"}}`
- Prop values: `call read-data-schema {"query":{"kind":"event_property_values","event_name":"social_click","property_name":"platform"}}`
- Actions: `call actions-get-all {"limit":100}`
- Saved insights: `call insights-list {"limit":100}`

## Trends — counts over time
```
call query-trends {"kind":"TrendsQuery","series":[{"kind":"EventsNode","event":"$pageview","math":"total"},{"kind":"EventsNode","event":"$pageview","math":"dau"}],"dateRange":{"date_from":"-7d"},"interval":"day","filterTestAccounts":true}
```
- Breakdown by a property: add `"breakdownFilter":{"breakdowns":[{"property":"platform","type":"event"}]}`.
- Use an Action as a series: `{"kind":"ActionsNode","id":277920,"name":"CTA — Buy click"}`.
- Single big number: `"trendsFilter":{"display":"BoldNumber"}`.

## Funnel — conversion between steps
```
call query-funnel {"kind":"FunnelsQuery","series":[{"kind":"EventsNode","event":"$pageview"},{"kind":"ActionsNode","id":277920,"name":"CTA — Buy click"}],"dateRange":{"date_from":"-30d"},"filterTestAccounts":true}
```
Funnels need ≥2 series. Already saved as insight A24NPDaz.

## Save / update an insight
- `insight-create` — query is `{"kind":"InsightVizNode","source":{<TrendsQuery|FunnelsQuery|...>}}`. Set `"favorited":true` to pin.
- `insight-update` / `insight-get` by `short_id`.
- Surface the result's `_posthogUrl` verbatim to the user (don't hand-build slugs). For entities lacking one, use `generate-app-url`.

## Session replay (most useful at low traffic)
- `search session-recording` / `query-session-recordings-list` — list real sessions to watch by hand.

## Mobile audit (device × viewport × browser) — verified 2026-06-10
- Replay list for mobile: `call query-session-recordings-list {"kind":"RecordingsQuery","date_from":"-21d","filter_test_accounts":true,"properties":[{"key":"$device_type","operator":"exact","type":"event","value":["Mobile"]}],"limit":50}`. Deep link = `https://us.posthog.com/project/458316/replay/<id>` (never `/replay/home?...`). The list does NOT include browser/viewport per recording.
- Browser × viewport table: `query-trends` on `$pageview` with `"breakdownFilter":{"breakdowns":[{"property":"$browser","type":"event"},{"property":"$viewport_width","type":"event"}]}` (max 3 breakdowns) + series-level filter `$device_type = Mobile`.
- Per-session detail rows (browser, os, viewport, url per `$session_id`) can't be expressed via query-* → legit `execute-sql` case. Run `info execute-sql` + `read-data-warehouse-schema` first, then group events by `$session_id`, `any(properties.$browser)` etc. Owner exclusion in raw SQL: `(person.properties.email IS NULL OR person.properties.email != 'hellokbbureau@gmail.com')` (filterTestAccounts doesn't apply to raw SQL).
- Useful props on `$pageview`: `$viewport_width/height` (browser window), `$screen_width/height` (physical), `$device`, `$browser_version`, `$os_version`. `vh == sh` ⇒ no browser chrome ⇒ likely in-app/WebView/headless.

## Per-session audit (verified 2026-06-11)
One SQL gives the whole picture per session (entry path, source, geo, device, CTA events) — better than many trends at low volume:
```
SELECT $session_id, min(timestamp), any(properties.$referring_domain), any(properties.utm_source), any(properties.$geoip_country_code), any(properties.$device_type), any(properties.$browser), countIf(event='$pageview') AS pv, arrayDistinct(groupArrayIf(toString(properties.$pathname), event='$pageview')) AS paths, countIf(event='mode_download'), countIf(event='buy_click'), countIf(event='video_play'), any(distinct_id)
FROM events WHERE timestamp >= '<date>' AND (person.properties.email IS NULL OR person.properties.email != 'hellokbbureau@gmail.com') AND event IN ('$pageview','mode_download','buy_click','video_play','social_click') GROUP BY $session_id ORDER BY 2
```
Pair it with `query-session-recordings-list` (same window) — recordings add duration/clicks/active-vs-inactive seconds and start_url; deep link `https://us.posthog.com/project/458316/replay/<id>`. ~~No `$pageleave`~~ STALE: `$pageleave` IS captured (seen 2026-06-11 on owner sessions); scroll-depth props still unverified — check before claiming.

## Experiments (verified 2026-06-11, exp 376381)
- `experiment-create` makes a DRAFT and **auto-creates the feature flag** (don't pre-create one; flag stays `active:false` until launch). Required: `name`, `feature_flag_key`, `allow_unknown_events:false`.
- **Metrics must NOT be passed on create** — hard rule in the tool. Two-step: create draft → `experiment-update {"id":…, "metrics":[…], "metrics_secondary":[…]}`.
- Metric shape: `{"kind":"ExperimentMetric","metric_type":"funnel","name":…,"series":[…],"goal":"increase"}`. A single-step funnel series = "conversion from exposure to event" (the standard conversion metric). Series accept `{"kind":"ActionsNode","id":277920}` — use the canonical Action, not a raw event.
- Variant baseline key MUST be the literal `control` (lowercase). Owner exclusion: `"exposure_criteria":{"filterTestAccounts":true}` (top-level param on create).
- Drill `schema experiment-update metrics` before constructing — it's a hinted field. Lifecycle = dedicated tools (`experiment-launch` / `-pause` / `-end`), never via update.

## Gotchas
- Person-on-events mode is ON: `person.properties.*` on the events table reflects the value at ingest time, not the current value.
- Canonical-looking events (`$pageview`) still need `read-data-schema` confirmation per project.
- Custom CTA events won't appear in the schema until they've actually fired at least once.
