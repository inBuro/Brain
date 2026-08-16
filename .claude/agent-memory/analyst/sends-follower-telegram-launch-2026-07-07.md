---
name: sends-follower-telegram-launch-2026-07-07
description: Biggest traffic spike to date — owner posted Sends Follower release in RU Telegram publics 2026-07-07; full PostHog read of the resulting ~20h burst (volume, attribution, geo/VPN, engagement, conversion, replay)
metadata:
  type: project
---

# Sends Follower Telegram push (2026-07-07 evening → 2026-07-08 midday)

Owner released Sends Follower 2026-07-07 and dropped the news in Russian-language Telegram
publics same day. Full read of window 2026-07-07 00:00 ICT → 2026-07-08 12:04 ICT.

## Headline numbers
- **36 sessions / 31 unique people / 50 pageviews** in ~20h — the biggest traffic burst on
  record (previous record 06-10 r/Novation post ≈ 30 raw sessions). 24 sessions landed 07-07
  (first arrival 16:31 ICT), 10 more trickled into 07-08 morning (through 12:04 ICT, still
  arriving at time of report).
- Hourly shape: starts 16:00 ICT, ramps 18:00-21:00, **peak 20:00 ICT (9 pv / 6 unique)**,
  decays overnight, small second wave 04:00-05:00 ICT (same HU visitor cluster, not new) and a
  09:00 ICT trickle (fresh visitors, still direct/no-referrer).

## Attribution (first-touch, session-level, clean n=32)
- **`direct_landed_on_SF` (no referrer, no UTM, entry pathname = `/sends-follower` exactly):
  19/32 = 59%** — the dominant pattern.
- `direct_other_page` (no referrer, entered on `/` or `/control-xl`): 6/32 = 19%.
- `reddit` (utm_source=reddit or referring_domain contains reddit): 4/32 = 12.5% — NOT the
  driver this time.
- `internal_return_no_new_entry` (referrer = fadercraft.com, i.e. same visitor continuing a
  prior visit in a new session bucket): 3/32 = 9%.
- **Combined "no referrer at all" (direct_landed_on_SF + direct_other_page) = 78%**; adding the
  internal-return continuations of that same traffic ≈ 87% — this is the empirical basis for
  the owner's "~90% from the posts" claim.

## Why we call this "Telegram" without a literal referrer
PostHog captured **zero** `t.me`/`telegram` referrers and no UTM on this batch (owner pasted
bare links, no UTM builder used this time — unlike the documented `telegram` UTM marker from
06-15 in [[posthog-access]]). Telegram's in-app browser/desktop client is known to drop the
Referer header entirely (same behavior as Reddit's app WebView, previously documented) — so
"$direct, landed straight on `/sends-follower`, a page that had only 14 lifetime pageviews
before this" is the structural fingerprint, not proof. Corroborating signals below (language,
timezone/geo mismatch) make it very likely real, but flag to the owner: **PostHog cannot
technically distinguish "posted in Telegram" from "any other bare-link share app that also
drops Referer."** If precision matters later, tell the owner to append
`?utm_source=telegram&utm_medium=social&utm_campaign=<name>` to the links he drops next time.

## Geo / language / VPN
- Of the ~19 direct-to-SF sessions, **13 carry a Russian browser locale** (`ru`/`ru-RU`), but
  **country/timezone is scattered across the EU/CIS** (BG, SE, FI, NL, AT, HU, KZ, DE, BY, PL) —
  classic "RU-speaking visitor via VPN exit node" shape, matching the pre-existing
  [[vpn-proxy-suspects-cohort]] pattern (cohort 399599) almost exactly.
- **8 of ~19 SF-session people (≈42%) are members of cohort 399599** (VPN/Proxy suspects — geo
  mismatch) — a much higher hit-rate than the cohort's baseline ~21% lifetime rate, reinforcing
  that this specific batch skews heavily RU-via-VPN. Consistent with Russian Telegram-public
  audience circumventing geo-blocks/access restrictions to reach a Western site.
- Non-RU cluster: 5 Hungary (HU) sessions, `en-US` locale, spread over 23:36→05:15 ICT, referrer
  chain shows the SAME visitor returning repeatedly (internal fadercraft.com referrer on later
  hits) — this looks like one unusually engaged HU lead, not part of the RU/Telegram wave. **This
  HU visitor is the one who fired the single `buy_click`** (00:28 ICT, 07-08, no purchase
  followed). Worth a closer look if it recurs.

## Engagement (on `/sends-follower`)
- Scroll/section reach (`section_view`, 21 sessions total touched the page): `modulation-overview`
  23 hits/21 sessions, `effects-marquee` 23/21, `video` 23/21, `callout` 20/19,
  `track-or-return` 17/16, **`requirements` (the bottom-most section) 11/11** — roughly half of
  engaged sessions scroll all the way to the bottom. Good depth, not a bounce-fest.
- `video_play` 22 hits / 9 sessions (some sessions replayed it).
- `footer_cta_view`: **hero Buy CTA impression 16 hits/15 sessions**, newsletter/footer CTA 11
  hits/11 sessions on `/sends-follower` — most visitors DID see the Buy button (SF's hero CTA is
  tracked, unlike Control XL's — see [[sends-follower-parity-2026-07-07]]). So unlike the earlier
  CXL "buried CTA" finding, **visibility is not the bottleneck here.**
- **`buy_click` = 1** (the HU returning visitor, not the RU/Telegram wave), **`purchase` = 0**,
  `social_click` = 1, newsletter_signup = 0.

## Verdict for "how to answer people in the Telegram threads"
1. **Reach is real and it's the biggest ever** — lots of people are opening the link and
   actually scrolling the whole page (video, all content sections, even down to Requirements).
   This is NOT a bounce problem.
2. **They see the Buy button but don't press it** (16 hero-CTA impressions vs 1 buy_click across
   ~19 sessions) — this is a straight persuasion/price/certainty gap at the CTA, not a
   visibility gap. When replying in threads, lead with what removes hesitation at the point of
   buying: refund policy, exact compatibility (MK1/MK2/M4L reqs — see
   [[faq-opens-as-intent-signal]] pattern from Control XL, worth checking if similar objections
   apply to Sends Follower), or a concrete before/after clip of the modulation effect.
3. **Many are on VPN (~42% of this batch)** — Gumroad checkout/currency/region friction is worth
   double-checking for RU-adjacent buyers (payment method availability), since that's a
   plausible silent drop-off point purely from clicking the CTA to completing checkout, separate
   from persuasion.
4. **n is still small (19 SF sessions, 1 buy_click)** — good enough to read qualitatively, too
   small to declare a "conversion rate" or run an experiment on this specific spike.

## Session replay (verified, top by activity)
- No recording captured for the HU buy_click session (404 — recording likely below sampling
  threshold or not started in time).
- Best available: DE `ru-RU` visitor 20:45-20:48 ICT, 132s duration, 8 clicks, 106 mouse
  events, console_warn×1 — genuinely explored (3 pages: `/sends-follower`→`/`→`/control-xl`).
  AT `ru-RU` visitor 20:27-20:29 ICT, 134s, 2 clicks, 31 mouse events, long idle tail (inactive
  110s) — opened, read, then went idle without acting.
  US(Yandex, `ru`) visitor 20:07-20:34 ICT — recording spans 1624s (~27 min) but only 107s
  active — tab left open in background, single click, not strong evidence of deep reading.
  Deep-link to the raw recordings list (this cohort+date scope):
  https://us.posthog.com/project/458316/replay
