---
name: hourly-profile-ict
description: Hour-of-day traffic profile in Asia/Bangkok (ICT) for fadercraft.com — when visits land in the OWNER's timezone; trough 07-08 ICT, ramp from 10:00, peaks 19:00+21:00; built 2026-06-17, updated 2026-06-19 (n=94 human sessions)
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

## The numbers v2 (2026-06-01 → 2026-06-19, owner excluded, n=94 human / 115 raw / 21 bots stripped)

Full 24-hour table (bot-strip: browser empty OR vh==sh AND pvs=1):

| Hour ICT | Human sessions |
|----------|---------------|
| 00 | 7 |
| 01 | 2 |
| 02 | 5 |
| 03 | 6 |
| 04 | 3 |
| 05 | 3 |
| 06 | 1 |
| **07** | **0** — absolute minimum |
| **08** | **0** — absolute minimum |
| 09 | 1 |
| **10** | **8** — first strong jump (start of ramp-up) |
| 11 | 2 |
| 12 | 3 |
| 13 | 7 |
| 14 | 2 |
| 15 | 5 |
| 16 | 2 |
| 17 | 3 |
| 18 | 1 |
| **19** | **12** — MAIN PEAK |
| 20 | 3 |
| **21** | **10** — MAIN PEAK |
| 22 | 3 |
| 23 | 5 |

**ABSOLUTE MINIMUM: 07:00–08:00 ICT** (= 00:00–01:00 UTC = deep EU night + early US evening,
0 sessions across the full window). Audience is EU-centric; their night = TH morning trough.

**RAMP-UP STARTS: 10:00 ICT** (= 03:00 UTC = 09:00–10:00 Berlin/London). Jump from 1 → 8,
first consistent traffic. Stable presence from 10:00 onwards through the full day.

## PEAK WINDOW = 19:00–21:00 ICT (the evening block)
19:00 = 12:00 UTC = 08:00 US East + 14:00 Europe — both audiences active simultaneously.
~23% of human sessions land in 19:00–21:00 alone (22 of 94). Clear double peak at 19:00 and 21:00.
Secondary minor: late night / early AM 00:00–05:00 ICT (US/EU daytime bleeding into TH night).
Recommendation: post/drop links ~18:30–19:00 ICT so they're fresh going into the peak.

## Audience interpretation
07:00–08:00 ICT = 00:00–01:00 UTC = deep night in EU, early evening US → zero traffic is
structural (audience-clock-driven), not a site issue. Traffic is fully audience-timezone-driven.

## Weekday vs weekend — NOT separable yet
~30-day window but total n=94 is still too small to split weekday/weekend reliably.
Don't claim a weekly pattern.

## Caveat to always state
n=94 human sessions, push-driven history (Reddit + maxforlive spikes dominate).
Hours mirror posting times, not an independent organic circadian rhythm.
Honest read; no significance claims. Re-check when n reaches ~300+.
