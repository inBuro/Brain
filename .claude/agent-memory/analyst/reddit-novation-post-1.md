---
name: reddit-novation-post-1
description: The 2026-06-10 r/Novation organic post ("fixed performance layer instead of remapping per project") — its measured site impact, post→site CTR, geo, behaviour, and the reach-not-conversion verdict
metadata:
  type: project
---

# r/Novation post #1 — measured site impact (analysed 2026-06-14, re-confirmed 2026-06-15)

**Re-run 2026-06-15 (Reddit Insights screenshot: 6.6K views, post id 1u20ebm, US37/UK8.9/DE6.3/Other47.8, 19up/95.2%/14c/25sh):** all findings below hold. This post's PostHog
marker = `utm_campaign=introduction_post`. Its flow was alive 06-11 (7 sessions) → 06-12 (4,
last at 10:10 ICT) → **06-13=0, 06-14=0** = fully spent, no organic tail. One late tail session
06-15 04:18 (NL /free-modes). `buy_click`=0 across the whole window AND across ALL sources
(maxforlive, direct too) → buy-intent bottleneck is on-site, not reddit-specific. The 06-14/15
mini-bump is NEW reddit markers, NOT this post: `organic` (06-14 23:39 US, 06-15 ×3) +
`ableton_post` (06-15 02:50 US video_play, 06-15 05:39 RU/Yandex **download**). So as of mid-June
`introduction_post` is historical; live reddit = `organic` + `ableton_post`. Both purchases in the
window were `is_test=True` (US, SG, both 06-10) → still zero real sales lifetime.

The single best-performing organic post of the account. Reddit-side stats (founder, not
PostHog): 6.2K post views in 48h, 19 upvotes, 95.2% ratio, 14 comments, 21 shares (shares >
upvotes = people forwarded it), geo US 36% / UK 9% / DE 6% / Other 48%. UTM marker for this
post = `utm_campaign=introduction_post` (`utm_source=reddit`), entry usually `/free-custom-modes`.
See [[posthog-access]] channel-UTM table.

## What actually reached the site (PostHog, owner-excluded, manual bot tag)
Window 2026-06-10 → 2026-06-14. Daily $pageview sessions: 06-10=30, 06-11=21, 06-12=4,
**06-13=0, 06-14=0** (spike is fully spent — site went dry after ~06-12 10:00 Thai).
Baseline before the post: 06-07=2, 06-09=3 sessions/day → so 06-10 (30) is roughly a **10x**
day-over-day jump that lines up with the post timing (first hours 06-10 ~19:00 Thai).

Sessions by source over the window (after removing 15 link-preview bot sessions):
- **reddit (explicit UTM/referrer) = 11 sessions, 20 pv, 1 download, 3 video_plays**
- direct/unattributed (human) = 25 sessions, 25 pv, 1 download, 0 video_plays (mostly 1-pv
  bounces on `/`; early-06-10 reddit-app WebView hits land here too — referrer stripped)
- internal_ref (engaged multi-page) = 4 sessions, 10 pv, 1 download
- bots = 15 sessions (no-browser / vh==sh / 1-pv on `/`) — discounted

## post→site CTR (rough)
Conservative (explicit reddit only): 11 / 6200 ≈ **0.18%**. If you credit the early no-UTM
WebView direct hits to the post too, realistic reddit-driven human sessions ≈ 15–25 → CTR
≈ **0.25–0.4%**. Either way well under 1% — normal for a soft, no-hard-CTA story post.

## Geo of the reddit visits — matches the Reddit dashboard
US dominant, then EU (GB, DE, FR, NL, ES, BE) + CA/BR. US/UK/DE leading bucket lines up with
Reddit's US 36% / UK 9% / DE 6%. The audience that read the post is the audience that landed.

## Behaviour (4 reddit session replays watched)
Reddit visitors are the engaged ones — every video_play in the window came from a reddit
session; multi-page + downloads cluster here. Sample replays (all entered `/free-custom-modes`):
- BR Desktop Edge: 555s, 21 clicks, 5 pv, download + video_play (top session of the window)
- US Mobile Safari: 569s, 13 clicks, 3 pv, video_play
- US Desktop Edge: 260s, 28 clicks, video_play
- US Desktop Chrome: 88s, 1 click, low engagement
Direct/non-reddit sessions = bounciest (single pv on `/`, no CTA).

## Conversion outcome
`buy_click` = **0** in the whole window (lifetime still 0). `purchase` = 2 but both
`is_test=True` Gumroad pings (US, SG) → **zero real sales**. Only paid-funnel signal is free
pull: 3 downloads (1 reddit, 1 internal_ref, 1 TH-direct) + 3 video_plays (all reddit).

## VERDICT — this post is REACH, not conversion
It delivered the best top-of-funnel the site has ever seen (10x traffic day, highest-engagement
visitors, every video_play) but converted to **0 buy-intent and 0 sales**. Treat r/Novation
story posts as an awareness/audience-building channel, not a sales channel. To turn this reach
into conversion the bottleneck is on-site: a clearer paid CTA + the `demo_interact` instrumentation
(see [[demo-engagement-baseline]]) to see whether the engaged reddit visitors even reach buy
intent. Spike decays in ~48–72h with no organic tail → conversion experiments still premature;
keep using Session Replay as the lens until a push lands ~100+ sessions.
