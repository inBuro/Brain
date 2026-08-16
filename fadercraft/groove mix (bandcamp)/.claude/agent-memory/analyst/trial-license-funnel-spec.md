---
name: trial-license-funnel-spec
description: Spec for GrooveMix trial→license funnel — not yet created in PostHog (MCP blocked 2026-08-05)
metadata:
  type: project
---

## Status
NOT YET CREATED. Attempted 2026-08-05 but MCP tools were not available in subagent context.

**Why:** MCP subagent limitation — see [[posthog-access-groovemix]] for full explanation.

## Insight to create
Name: **GrooveMix trial→license funnel**
Type: FunnelsQuery (4-step ordered funnel)
Project: 542001 (Counter DJ / GrooveMix)
`favorited: true` to pin it

## Steps

| # | Event | Filter | Notes |
|---|---|---|---|
| 1 | `track_loaded` | `source = 'extension'` | First deck connect |
| 2 | `track_skip` | `source = 'extension'` | **COMPROMISE**: intended as `track_loaded` OR `track_skip` but PostHog funnel steps can't express OR without a pre-created Action. `track_skip` = user actively used the mixer, slightly stronger signal than second track_loaded. Flag this when reading results. |
| 3 | `trial_limit_reached` | `source = 'extension'` | Crosses 5h cumulative active mixing |
| 4 | `license_activated` | `source = 'extension'` | Gumroad license key verified |

## Known limitations to flag when reporting
1. Step 2 OR logic: should be "`track_loaded` (second deck) OR `track_skip`" — can't do OR in a funnel step without an Action. Using `track_skip` as the proxy.
2. Both `trial_limit_reached` and `license_activated` fire ONCE per install — if events haven't fired yet (brand new product, very low volume), all steps 3 & 4 will show 0 and the funnel is empty. This is expected — purpose is instrumentation, not reading a verdict.
3. Extension events may not have appeared in the event schema yet if the extension hasn't been used by real users since launch.

## MCP call to create (for parent session or direct session)
```
search insight-create
info insight-create
call insight-create {
  "name": "GrooveMix trial→license funnel",
  "query": {
    "kind": "InsightVizNode",
    "source": {
      "kind": "FunnelsQuery",
      "series": [
        {
          "kind": "EventsNode",
          "event": "track_loaded",
          "name": "1. First deck connected",
          "properties": [{"key": "source", "value": "extension", "operator": "exact", "type": "event"}]
        },
        {
          "kind": "EventsNode",
          "event": "track_skip",
          "name": "2. Active mixer use (track_skip proxy)",
          "properties": [{"key": "source", "value": "extension", "operator": "exact", "type": "event"}]
        },
        {
          "kind": "EventsNode",
          "event": "trial_limit_reached",
          "name": "3. Trial limit hit (5h)",
          "properties": [{"key": "source", "value": "extension", "operator": "exact", "type": "event"}]
        },
        {
          "kind": "EventsNode",
          "event": "license_activated",
          "name": "4. License activated",
          "properties": [{"key": "source", "value": "extension", "operator": "exact", "type": "event"}]
        }
      ],
      "dateRange": {"date_from": "-90d"},
      "filterTestAccounts": true,
      "funnelsFilter": {
        "funnelWindowInterval": 14,
        "funnelWindowIntervalUnit": "day"
      }
    }
  },
  "favorited": true
}
```

NOTE: Before calling insight-create, need to switch project from 458316 (Fadercraft) to 542001 (Counter DJ / GrooveMix). Search for project-switch tool: `search project` or `search switch`.
