---
name: posthog-access-groovemix
description: PostHog project for GrooveMix (Counter DJ) — project 542001, events, token, MCP subagent limitation
metadata:
  type: project
---

## Project
- PostHog project: **Counter DJ** (display name, not yet renamed), id **542001**, US cloud (`us.posthog.com`)
- Public project token (ingestion only, returns 401 on management API): `phc_BAghKLaJXyEZ9hcPdjQ7BFfQ3543X6aDDjzapsrJTE3S`
- Same PostHog organization as Fadercraft (458316) — personal API key via MCP OAuth covers both
- URL base: `https://us.posthog.com/project/542001/`

## Source discrimination
- This project captures BOTH extension events AND marketing-site (groovemix.app) events
- Extension events carry super-property `source: 'extension'`
- Always filter `source = 'extension'` to isolate extension behavior from landing page traffic

## Named events (extension, as of 2026-08-05)
- `track_loaded` — deck successfully loads a YouTube tab. Props: `deck` ['A'|'B'], `via` ['connect'|'auto_next']
- `track_skip` — user skips next/prev track. Prop: `direction`
- `feedback_idea` — free-text feedback submission. Prop: `text` (PII-adjacent — count only, never dump raw)
- `trial_limit_reached` — fires ONCE per install when cumulative active-mixing time crosses 5 hours
- `license_activated` — fires ONCE when Gumroad license key verified successfully

All other events are PostHog autocapture (clicks/pageviews from groovemix.app, no clean business-event names).

## filterTestAccounts
Configured as of 2026-08-09. Filter: `{key: email, type: person, value: hellokbbureau@gmail.com, operator: is_not}`. `test_account_filters_default_checked: true` — all new insights default to filtering owner out.

Owner person records:
- `019fda77-be69-742f-955d-db3bb755d580` → person UUID `1c400b55-4d2c-5a45-837f-7a157b0e2b79`, numeric id `31479157083`. Email set to `hellokbbureau@gmail.com` on 2026-08-09. Now named "hellokbbureau@gmail.com" in UI. Had 4879 non-pageview events (ui_error-spam session, Aug 7).
- `019fd215-0640-773b-9b9c-531bb1442025` → person record DOES NOT EXIST in API or persons SQL table (orphaned). 85 extension events + 413 total events with empty person properties. Cannot be excluded retroactively by email filter in POE mode. Only 85 non-pageview events — small enough to ignore.

POE mode caveat: `person_on_events_querying_enabled: true`. Past events store person properties at ingestion time. Setting email on person now does NOT retroactively update past events' property snapshots for regular filters. `filterTestAccounts` behavior on past events depends on whether PostHog joins against current persons table (likely yes for this filter type).

## MCP subagent gotcha (documented 2026-08-05)
**Why:** When the analyst subagent is spawned via the Agent SDK, `mcp__posthog__exec` is listed in the agent definition's `tools:` field but does NOT land in the actual callable function registry of the subagent invocation. The MCP server connects successfully (confirmed via `claude mcp get posthog` = Connected, and MCP log at `~/Library/Caches/claude-cli-nodejs/-Users-Kirill-Brain-Fadercraft-Groove-Mix/mcp-logs-posthog/`), but the tool call returns "No such tool available".

**How to apply:** If analyst is invoked as a subagent by the parent (Opus 4.8 main loop), the parent session DOES have `mcp__posthog__exec` available and can execute the PostHog calls directly. The analyst can prepare the exact call payload and the parent can execute it. Alternatively, user can invoke analyst directly from the main Claude Code session (not via Agent delegation), where MCP tools are properly available.

Personal API key: NOT stored on disk (MCP uses OAuth). Retrieved dynamically by Claude Code from storage not accessible to subagent (length 48 chars = phx_... format confirmed via MCP log). Project token `phc_...` returns 401 for management API — cannot be used to create insights.
