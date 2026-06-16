---
name: teams-referrer-2026-06-16
description: Microsoft Teams CDN referrers (statics.teams.cdn.office.net + teams.public.onecdn.static.microsoft) = 2 GB sessions 06-16, one a High Wycombe returner first seen on free-modes 06-10; new in-app channel
metadata:
  type: project
---

NEW traffic source spotted 2026-06-16: two `$referring_domain` values both = Microsoft Teams
CDNs, i.e. someone opened the fadercraft.com link from inside the Teams desktop/web app.
- `statics.teams.cdn.office.net` (Teams desktop client web-view CDN)
- `teams.public.onecdn.static.microsoft` (newer Teams CDN host)

**Why this matters:** both sessions are GB, and one is a RETURNER from the Novation/Focusrite
region (High Wycombe = Novation–Focusrite HQ; Ramsgate also GB). Strongly fits the
"Isotonik (UK) / Novation insider" hypothesis — a UK person sharing/opening the link in a Teams
chat (internal corporate messenger). This is the first time the site has been opened from a
corporate-messenger context, not Reddit/maxforlive/direct.

**The hard facts (lifetime, both = 06-16 evening ICT, owner NOT present — email None on both,
neither distinct_id belongs to the owner person):**
- `teams.public.onecdn.static.microsoft` → 1 session `019ed0f8-…` 06-16 22:07–22:11 ICT, GB
  High Wycombe, England, **Desktop / Firefox / Mac OS X**, viewport 2560×1218 (vw≠sh ⇒ real
  browser chrome, not WebView). Entry `/`, 1 pageview, bounce=0, dur 213s. **demo_interact ×1 +
  video_play ×1** (pressed the demo video Play), 2 clicks / 56 mouse moves. Max scroll 60%.
  No buy_click, no mode_download, no social/outbound. New visitor (distinct_id first seen 06-16).
- `statics.teams.cdn.office.net` → 1 session `019ed0fb-…` 06-16 22:09–22:12 ICT, GB Ramsgate,
  England, **Desktop / Brave / Mac OS X**, viewport 1440×760. Entry `/`, 1 pageview, bounce=0,
  dur 168s. `cta_view ×1` (the buy CTA scrolled into view — **scrolled to 100%**), 0 clicks,
  16 mouse moves. No buy_click/dl/video/outbound. **RETURNER**: same distinct_id
  `019eb194-5d57-…` first hit the site **2026-06-10 19:49 ICT** (session `019eb194-5d5f-…`),
  GB Desktop/Brave, referrer `fadercraft.com`, entry **`/free-custom-modes`**, 3 pageviews —
  i.e. came in on the FREE-MODES page during the 06-10 r/Novation spike, then returned 6 days
  later via a Teams link. 19 events lifetime / 4 pageviews / GB only.

**Combined: 2 sessions / 2 unique persons / 2 pageviews, first & last appearance both 2026-06-16
(~22:07–22:12 ICT, within 5 min of each other). No UTM on either (utm_source/medium/campaign all
None) — Teams strips/omits UTM, so referrer domain is the only channel signal. Landing path = bare
`/` for both. $channel_type classified by PostHog as "Referral".** Both have replay:
- https://us.posthog.com/project/458316/replay/019ed0f8-fd5f-741b-8139-f531ac75ce85 (High Wycombe, demo+video)
- https://us.posthog.com/project/458316/replay/019ed0fb-23fc-7b87-8217-069025ef71b1 (Ramsgate, returner, scroll-to-100%)

n=2 — too small for any rate/conversion claim; this is qualitative signal, not statistics. Both
landed within 5 min ⇒ likely ONE Teams thread where the link was posted and a couple of people
clicked. Watch `$referring_domain LIKE '%teams%'` for repeats — if a UK Teams cluster recurs it's
an insider/industry channel worth naming.
