---
name: sends-follower-parity-2026-07-07
description: Full code+PostHog audit that gave Sends Follower (/sends-follower) the same analytics goals as Control XL; what's identical, what's structurally N/A, and the one real discrepancy (hero CTA tracked on SF, not on CXL)
metadata:
  type: project
---

# Sends Follower analytics parity audit (2026-07-07)

Task: mirror Control XL's PostHog goal/conversion tracking onto the new `/sends-follower`
page. Full code read (`ProductPage.tsx`, `SendsFollowerPage.tsx`, `useCtaViewImpressions.ts`,
`useSectionViewImpressions.ts`, `links.ts`, `BuyButton.tsx`, `NewsletterSection.tsx`,
`FooterFull.tsx`, `index.html`) + PostHog audit (project 458316) on 2026-07-07.

## Routing correction (also filed in [[posthog-access]])
`app/src/App.tsx`: `/` is now **HubPage** (brand umbrella), Control XL product lives at
**`/control-xl`**, Sends Follower at **`/sends-follower`**. Confirmed via `query-trends`
breakdown by `$pathname` (60d, owner-excluded): `/`=227, `/free-custom-modes`=108,
`/sends-follower`=14, `/updates`=10, `/control-xl`=5, `/guide/...`=3, `/legal`=1.

## Code parity — event by event
All custom events are global listeners (`index.html` delegated `document.addEventListener`,
or shared React components) — NOT page-specific code. SF automatically inherits any event
whose trigger selector/URL pattern it also matches. Verified via live data query
(`$pathname exact /sends-follower`, 60d, owner-excluded):

| Event | CXL mechanism | SF status | Live count on `/sends-follower` |
|---|---|---|---|
| `buy_click` | `index.html:140-165`, matches any `a[href*="gumroad.com/l/"]`, adds `path` | SAME selector matches `SENDS_FOLLOWER_URL` (`fadercraft.gumroad.com/l/sends-follower`) — fires automatically, no code needed | 0 (traffic too small, not a gap) |
| `newsletter_signup` | `index.html:170-175`, matches form `action` containing `gumroad.com/follow` | SF's `NewsletterSection` uses same Gumroad-follow embed (`gumroadSellerId="6976309857072"`) — same action URL | 0 |
| `social_click` | `index.html:188-197`, global delegated listener on any social host, `FooterFull` is a SHARED component | Identical — same `FooterFull` component, same Discord/YouTube/Instagram links | 0 |
| `video_play` | `VideoSection.tsx`, prop `video_id: youtubeId` | SF uses same `VideoSection` component (`youtubeId="1xYVGh-SX_k"` vs CXL's `"UsJxPBdf568"`) | 14 |
| `footer_cta_view` | `useCtaViewImpressions.ts`, fires per `[data-cta]` el ≥50% visible | SF calls the SAME hook (`SendsFollowerPage.tsx:78`) | 20 total (7 `newsletter` + 13 `hero` — see discrepancy below) |
| `section_view` | `useSectionViewImpressions.ts`, fires per `[data-section]` el ≥30% visible | SF calls the SAME hook (`SendsFollowerPage.tsx:79`) | 67 total across 6 distinct `section` values (see below) |

`$pathname`, `$current_url` etc. are standard PostHog autocapture properties present on
**every** event including these custom ones (confirmed via `read-data-schema` on
`footer_cta_view` and `section_view` — both list `$pathname`) — so pathname-filtering goals
works without any extra `path` prop in the React hooks (unlike the `index.html` events, which
explicitly add `path` redundantly).

### `data-section` values — CXL vs SF (different content, not a gap)
- **Control XL** (`ProductPage.tsx`): `video` (781), `faq` (815), `requirements` (824).
- **Sends Follower** (`SendsFollowerPage.tsx`): `video` (111), `modulation-overview` (116),
  `effects-marquee` (117), `callout` (121), `track-or-return` (128), `requirements` (136).
  Live breakdown (60d): effects-marquee 13, modulation-overview 13, video 13, callout 12,
  track-or-return 9, requirements 7.
- Different section sets are EXPECTED — the pages have different content architecture (SF has
  no FAQ, has a marquee/callout/track-or-return block CXL doesn't). Only `video` and
  `requirements` overlap by name.

### Features genuinely absent from SF (product-scope, NOT a code gap)
- **No `FAQSection`** on `SendsFollowerPage.tsx` at all → `faq_open` can never fire there.
  Action 283077 ("FAQ — question opened") has nothing to mirror unless a FAQ section is added
  to the SF page later — that would be a content decision (ux-ui-designer / copy), not an
  instrumentation fix.
- **No `OneActionBetweenThem`/`PluginMockup` interactive demo** on SF (that's the Control XL
  mixer-tabs-and-encoders mockup) → `demo_interact`, and Actions 283039 ("Plugin — Mixer tab
  click") / 283040 ("Plugin — Checkbox row click") have no SF analog. SF's product doesn't
  have that kind of interactive widget.
- **No free-mode downloads** on SF → `mode_download` / Action 277927 N/A.
- **No `?p=`-style Custom-Modes bridge** on SF → Action 277925 N/A.

### The one real discrepancy — hero CTA tracking
`SendsFollowerPage.tsx:106` passes `ctaLocation="hero"` into `HeroProduct`, which forwards it
to `BuyButton`'s `location` prop (`HeroProduct.tsx:66`) → sets `data-cta="hero"` on the hero
Buy button → **`useCtaViewImpressions` DOES track SF's hero CTA impression** (13 hits/60d,
confirmed via `section`... err `location` breakdown of `footer_cta_view` filtered to
`/sends-follower`: `hero`=13, `newsletter`=7).

Control XL's `ProductPage.tsx:716` calls `StaticHeroProduct` WITHOUT `ctaLocation` — its hero
Buy is deliberately untracked. The comment at `useCtaViewImpressions.ts:6-9` explains why: "the
hero Buy is intentionally left untracked (above the fold → its impression would just equal
pageviews)".

This is a real code-level asymmetry, not an oversight I should silently "fix" (no code edits
made, per task instructions). Two options for whoever edits the code next:
1. **Match CXL exactly** — drop `ctaLocation="hero"` from `SendsFollowerPage.tsx:106` so SF's
   hero also goes untracked, achieving byte-for-byte instrumentation parity.
2. **Keep it** — SF's hero layout may not be as reliably above-the-fold as CXL's (shorter
   page, different hero copy), so the impression may carry real signal there. If kept, it's
   simply an SF-only metric with no CXL analog (currently ungoaled — no Action filters
   `location=hero`, so it doesn't pollute the mirrored "SF — Footer CTA view" goal, which
   filters `location=newsletter` only).
No action needed unless the owner picks one.

## Goals created (2026-07-07) — see [[posthog-access]] for full list + reasoning
Actions 285584–285589 (SF — Buy click / Newsletter signup / Social click / Footer CTA view /
Video play / Video section view), all `event + $pathname exact /sends-follower`. Insight
**zt1U2A25** "SF landing conversion — Pageview → Buy click" (funnel, favorited), mirrors
A24NPDaz. 285584/285587/285588/285589 pinned to the Goals tile (see
[[web-analytics-goals-tile]]), matching CXL's pinned set minus the SF-N/A ones.

**Important framing:** Control XL's original CTA Actions (277920 etc.) are NOT page-scoped —
they're site-wide event matchers that happened to also catch SF traffic once SF launched,
just mixed together. The new SF-prefixed actions are the first PRODUCT-SCOPED goals in the
project; consider whether CXL's own Actions should eventually get a `/control-xl` pathname
filter added too for a true apples-to-apples split (not done here — out of task scope, and
would change historical CXL numbers by excluding `/`-attributed traffic from the pre-Hub era).

## Traffic reality check (2026-07-07, 60d, owner-excluded)
`/sends-follower`: 14 pageviews, 11 unique visitors reaching the funnel's first step, 20
footer_cta_view (13 hero + 7 newsletter), 14 video_play, 67 section_view, **0 buy_click, 0
newsletter_signup, 0 social_click, 0 purchase**. Too small for any funnel/experiment
conclusion — same "prefer Session Replay" rule as the rest of the site applies to SF now too.
