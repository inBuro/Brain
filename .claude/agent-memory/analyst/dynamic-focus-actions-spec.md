---
name: dynamic-focus-actions-spec
description: Code-verified spec for all PostHog Actions for /dynamic-focus; route confirmed, events verified, adaptations from SF documented. EXECUTED 2026-07-23 — all 7 Actions + funnel insight created.
metadata:
  type: project
---

# Dynamic Focus PostHog Actions — pending creation spec

Verified 2026-07-23 via full code read of `DynamicFocusPage.tsx` and `App.tsx`.

## Route
`/dynamic-focus` (confirmed in App.tsx:37 `LAZY_BY_PATH`). Gumroad URL: `https://fadercraft.gumroad.com/l/aqlsvy?wanted=true` (matches `gumroad.com/l/` selector → `buy_click` fires automatically).

## Events confirmed firing on /dynamic-focus
- `buy_click` — global selector hits `DYNAMIC_FOCUS_URL`
- `newsletter_signup` — FooterFull includes the Gumroad follow embed
- `social_click` — FooterFull shared component
- `video_play` — VideoSection with `youtubeId="vEJGWkK9gIU"` (DF-specific video)
- `video_watch_time` — same VideoSection component
- `footer_cta_view` — useCtaViewImpressions() called; closing BuyButton uses `location="footer"` → property `location=footer`
- `section_view` — useSectionViewImpressions() called; data-section values: `video`, `modes`, `features`, `text-band`, `revived`, `faq`, `requirements`
- `faq_open` — **FAQSection IS present** (6 items); fires on any FAQ expand

## HeroProduct CTA — intentionally untracked (same as CXL)
`HeroProduct` called WITHOUT `ctaLocation` prop → hero Buy button has no `data-cta` attribute → `useCtaViewImpressions` does NOT track the hero CTA. Same as CXL (different from SF which tracks hero with `ctaLocation="hero"`). Do NOT create a "DF — Hero CTA view" action.

## Key adaptation from SF: `location=footer` not `location=newsletter`
SF and CXL footer BuyButton use `location="newsletter"` → `footer_cta_view{location:'newsletter'}`.
DF's closing BuyButton (line 601) uses `location="footer"` → `footer_cta_view{location:'footer'}`.
The DF Footer CTA view action MUST filter `location=footer`, NOT `location=newsletter`.
Also: no `cta_view` historical step needed for DF (it's a brand-new page, the old event never fired there).

## Actions created (7 total, 2026-07-23)

| # | Name | ID | Event(s) | Step filters | Pinned |
|---|------|----|----------|--------------|--------|
| 1 | DF — Buy click | **294066** | `buy_click` | `$pathname exact /dynamic-focus` | YES |
| 2 | DF — Newsletter signup | **294067** | `newsletter_signup` | `$pathname exact /dynamic-focus` | NO |
| 3 | DF — Social click | **294068** | `social_click` | `$pathname exact /dynamic-focus` | NO |
| 4 | DF — Footer CTA view | **294069** | `footer_cta_view` | `location=footer` + `$pathname exact /dynamic-focus` | YES |
| 5 | DF — Video play | **294070** | `video_play` | `$pathname exact /dynamic-focus` | YES |
| 6 | DF — Video section view | **294071** | `section_view` | `section=video` + `$pathname exact /dynamic-focus` | YES |
| 7 | DF — FAQ opened | **294072** | `faq_open` | `$pathname exact /dynamic-focus` | NO |

## DF vs SF differences explained
- **location=footer (not newsletter)** — see above.
- **Action 7 (FAQ opened) present** — DF has FAQSection, SF does NOT. SF 285584-89 set has no FAQ analog; CXL has 283077 (site-wide, no pathname). DF's version adds the pathname scope.
- **NO Track/Return toggle** — SF 291089 has `track_return_toggle` for SF's device-mode UI. DF has no such toggle. Skip.
- **NO Bundle section viewed** — SF 291090 has `section=track-or-return`. DF has no such section. Skip.
- **NO mode_download** — DF has no free-modes downloads.
- **NO demo_interact / mixer tab / checkbox** — DF has no PluginMockup interactive widget.

## Funnel insight created (2026-07-23)
Mirror of `zt1U2A25` (SF landing conversion):
- Name: "DF landing conversion — Pageview → Buy click"
- **short_id: Jalc8E7K** (id: 10394476)
- Steps: `$pageview` with `$pathname=/dynamic-focus` → Action 294066 "DF — Buy click"
- `filterTestAccounts: true`, `favorited: true`
- URL: https://us.posthog.com/project/458316/insights/Jalc8E7K

## Goals tile (pinned set after creation, 2026-07-23)
Added 4 DF actions to Goals tile: 294066 / 294069 / 294070 / 294071.
Prior pinned set was 9 (CXL ×4 + SF ×4 + Mode download ×1). New total: 13 pinned.
Full updated list in [[web-analytics-goals-tile]].
