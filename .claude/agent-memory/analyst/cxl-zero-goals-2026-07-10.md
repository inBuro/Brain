---
name: cxl-zero-goals-2026-07-10
description: Diagnosis of "no Control XL goals firing, only Sends Follower" complaint (2026-07-10) — verified NOT a tracking/config bug, just traffic asymmetry + the known Goals-tile cache quirk
metadata:
  type: project
---

# "Zero Control XL goals" diagnosis (2026-07-10)

Owner reported the Web Analytics Goals tile shows conversions only for Sends Follower, none
for Control XL. Full re-audit (Actions config + live `query-trends`/`query-web-overview` +
code read of `ProductPage.tsx`/`SendsFollowerPage.tsx`/`BuyButton.tsx`/
`useCtaViewImpressions.ts`/`gumroad-ping.js`).

## Verdict: NOT a tracking bug
The page-scoped CXL actions (285962 Buy click / 285963 Video play / 285964 Footer CTA view /
285965 Video section view — all created+pinned 2026-07-08, see [[web-analytics-goals-tile]])
are configured correctly (`$pathname exact /control-xl`, no trailing-slash mismatch — confirmed
live `$pathname` values are clean `/control-xl`) and **DO fire**: 30d totals CXL Buy click=2,
Video play=6, Footer CTA view=3, Video section view=10 (mostly 07-07→07-08). `query-web-overview`
direct replica of the tile's own call, 7d: CXL Buy click 2 conversions/1.35% CR, SF Buy click 5
conversions/3.38% CR — both real, both nonzero.

## Actual root cause: traffic asymmetry, not code
Daily pageview split (`$pathname` breakdown, filterTestAccounts, 07-05→07-10):
`/control-xl`: 1, 0, 7, 30, 10, 2. `/sends-follower`: 0, 0, 0, 20, 40, 46, 7. SF is riding the
Telegram-launch + maxforlive.com-listing wave (see [[sends-follower-telegram-launch-2026-07-07]],
[[day-2026-07-08]]) — 4-20x CXL's daily visits since 07-07. On **07-10 alone** (the day of the
complaint, partial day): CXL pageviews=2, all 4 CXL goals=0; SF pageviews=7, Video play=4,
Footer CTA view=2, Video section view=7, Buy click=0. If the owner was looking at a "Today"
(or otherwise very short) window on the Goals tile, CXL=0/SF>0 is the LITERAL, correct,
non-buggy readout — CXL just isn't getting visits today. Not a config or instrumentation
problem; it's the same story as every prior "traffic is tiny, don't over-read short windows"
caveat in [[posthog-access]].

## Secondary, real but unconfirmed contributor: the known Goals-tile pin-recency cache bug
[[web-analytics-goals-tile]] already documented (2026-07-08) that the 4 CXL actions, pinned
minutes before the owner looked, failed to render in the tile ("only 5 of 9 goals visible,
See-all stuck") while the day-earlier SF pins rendered fine — diagnosed as a stale
client-side cache of "which action IDs are pinned," not a data/config issue. If the owner is
STILL on a stale tab/session from around 07-08, this same caching quirk could still be why
CXL goals visually don't appear at all (rather than showing real-but-small numbers). Fix
recommended then, still applicable: hard refresh (Cmd+Shift+R) / new incognito tab on
`https://us.posthog.com/project/458316/web`.

## Code parity re-confirmed clean (no diff needed)
- `buy_click` is a single global delegated listener in `index.html` on any
  `a[href*="gumroad.com/l/"]` — fires identically regardless of page. `src/links.ts`:
  `GUMROAD_URL` (`.../l/control-xl`) vs `SENDS_FOLLOWER_URL` (`.../l/sends-follower`) are
  correctly distinct, no cross-wiring.
- `useCtaViewImpressions.ts` / `useSectionViewImpressions.ts` are called identically on both
  pages (`ProductPage.tsx:702/704`, `SendsFollowerPage.tsx:79/80`); `$pathname` rides on every
  event automatically (confirmed in `buy_click`'s own property list via `read-data-schema`),
  no extra code needed for page-scoping.
- Only known real code asymmetry is the pre-existing one already logged in
  [[sends-follower-parity-2026-07-07]]: SF's hero Buy CTA is tracked (`ctaLocation="hero"`,
  `SendsFollowerPage.tsx:106`) while CXL's hero is deliberately left untracked
  (`useCtaViewImpressions.ts:6-9` comment) — unrelated to this complaint (doesn't touch
  `buy_click`/`newsletter`-location goals), flagged, not fixed, owner's call.

## Real (non-test) purchases by product, 30d — sanity check, unrelated to the complaint but checked
`purchase` events `is_test != true`, breakdown by `product_name`: "Fadercraft Control XL" = 1
(June), 0 in July. No Sends Follower real sale has ever landed in this window either — so if
anything, the *actual paid* conversion signal is CXL-only right now, the *opposite* of the
CTA-click-goal picture. Good context for the owner: SF's wave is producing clicks/engagement,
not (yet) checkouts.
