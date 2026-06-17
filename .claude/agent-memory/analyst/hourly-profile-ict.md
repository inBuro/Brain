---
name: hourly-profile-ict
description: Hour-of-day traffic profile in Asia/Bangkok (ICT) for fadercraft.com — when visits land in the OWNER's timezone; peak windows for posting; built 2026-06-17 over full lifetime (n=100 sessions)
metadata:
  type: project
---

# Hour-of-day traffic profile in ICT (owner's timezone) — built 2026-06-17

Project timezone is already Asia/Bangkok, so `toHour(timestamp)` in HogQL = ICT directly,
no offset math. This is the OWNER-clock view (when Kirill should post), NOT the visitor-local
view (a separate prior analysis).

**Why:** to choose when Kirill posts/sends so the drop lands during the site's busiest hours.
**How to apply:** the live traffic is push-driven (Reddit/maxforlive/telegram drops), so these
"peaks" largely reflect WHEN PAST POSTS WENT OUT, not an organic circadian audience rhythm.
Treat them as "what times have historically converted a post into a spike," and re-check after
more independent drops accumulate — it's self-fulfilling until organic pull exists.

## The numbers (full lifetime 2026-06-07 → 2026-06-17, owner excluded, n=100 sessions / 131 pv / 90 persons)
Top hours by HUMAN sessions (after grubby bot strip: browser empty OR vh==sh & 1pv):
- **21:00 ICT — 10 human sessions (biggest, 17 raw, 7 bots stripped)**
- **19:00 ICT — 10 human sessions (15 raw, 4 bots)**
- 00:00 ICT — 6
- 03:00 ICT — 6 (note: these are insomnia-hour US/EU-daytime visitors, real)
- 10:00 ICT — 8 human (11 raw, but 3 were the 06-11 same-minute scraper cluster → discount this hour)
- 13:00 / 15:00 ICT — 5 each
- 23:00 ICT — 5

Raw bot caveat: the 22:00 hour looks tiny (2 human, 3 bots) and 10:00 is inflated by the
06-11 10:49–10:51 bot burst (already known in [[posthog-access]] traffic state).

## PEAK WINDOW = 19:00–22:00 ICT (the evening block)
~30% of human sessions land 19:00–23:00 ICT. Clear single peak at 19:00 and 21:00.
Secondary minor: late night / early AM 00:00–05:00 ICT (US/EU daytime bleeding into TH night).
Recommendation given: post/drop links ~18:30–19:00 ICT so they're fresh going into the peak.

## Weekday vs weekend — NOT separable yet
Only 2 weekend days in the whole dataset (Sun 06-07, Sun 06-14) with ~3 sessions total; the
rest is weekdays. No statistical basis to split weekday/weekend. Don't claim a weekly pattern.

## Caveat to always state
n=100 lifetime sessions, single-promo-spike history (06-10 Reddit + 06-15/16 multi-source pushes
dominate). Hours mirror posting times, not audience habit. Honest read, no significance claims.
