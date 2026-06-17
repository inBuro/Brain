---
name: reddit-threads-tracking
description: Single registry of every Reddit thread/post/comment the owner is dropping the Fadercraft link into and asking us to track for attribution — subreddit, type, link, date added, audience relevance, and live status in PostHog
metadata:
  type: reference
---

# Reddit threads being tracked (attribution registry)

The one place that lists every Reddit thread/comment the owner hands us "track this for
attribution." Distinct from the UTM-marker table in [[posthog-access]] (that table = markers
that ALREADY fire in PostHog). This file = the watchlist, including links not yet active.

How to check if a tracked link has produced traffic: filter `$pageview` by `utm_source=reddit`
(the reliable signal — Reddit-app WebView strips the referrer to `$direct`, so `$referring_domain`
alone undercounts badly; web Reddit shows `com.reddit.frontpage` for the app or nothing for desktop).
Then break down by `utm_campaign` + `$pathname`. See [[query-recipes]]. Always `filterTestAccounts:true`.

## Watchlist

| Subreddit | Type | Link | Added | utm_campaign (if known) | Audience fit for Control XL (LCXL MK3 / Ableton M4L) | Live in PostHog? |
|---|---|---|---|---|---|---|
| r/Novation | post | `reddit.com/r/Novation/comments/1u20ebm/` | 2026-06-10 | `introduction_post` | HIGH — Novation hardware owners, the exact LCXL crowd | YES (tail dead since 06-12 10:10 ICT) — see [[reddit-novation-post-1]] |
| r/ableton | post (link in OP comment) | (r/ableton "controller setup across Live sets") | 2026-06-11 | `ableton_post` | HIGH — Ableton Live users = core M4L audience | YES (alive after all, see [[day-2026-06-16]]) |
| r/ableton or r/Novation | post | (the `organic`-tagged push) | ~2026-06-14/15 | `organic` | HIGH (Ableton/Novation) | YES (live channel mid-June) |
| (reddit) | post | (the `abletonlive_post`-tagged push) | 2026-06-16 | `abletonlive_post` | HIGH (Ableton) | YES — the 06-16 engine, #3 source that day, see [[day-2026-06-16]] |

(Telegram is tracked too — `utm_source=telegram`, campaign `organic` — but it's not Reddit; lives in [[posthog-access]] only.)

## When a tracked link goes live (checklist)
1. Confirm with `utm_source=reddit` + the campaign tag (or new referrer) that sessions actually arrived.
2. Tag the campaign value in the [[posthog-access]] UTM table once it appears.
3. Read entry path, geo, device, engagement (replay at low volume); count session-level conversions
   (UTM is on `$pageview`, NOT on `buy_click`/`mode_download` — go session-level, see [[posthog-access]]).
4. State audience-fit when interpreting (high-fit Novation/Ableton vs low-fit off-platform communities).
