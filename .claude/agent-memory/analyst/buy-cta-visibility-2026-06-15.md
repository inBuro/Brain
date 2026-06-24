---
name: buy-cta-visibility-2026-06-15
description: Replay+scroll analysis of the 2026-06-15 engaged sessions answering "is the buy CTA a visibility or a persuasion problem" — verdict VISIBILITY/STRUCTURE; plus the methodological find that $autocapture clicks AND scroll-depth props ARE available
metadata:
  type: project
---

# Buy CTA: visibility vs persuasion — session-replay read (2026-06-15)

## ⚠️ STALE PREMISE CORRECTED 2026-06-24 — HERO NOW HAS A BUY CTA
The "THE LANDING STRUCTURE" section below ("Hero has ZERO CTA", "buy CTA is the 10th of
11 blocks, only at #subscribe") was true on 2026-06-16 but is **NO LONGER TRUE**. The hero
was changed AFTER that: `HeroProduct.tsx` now renders a `<BuyButton>` under the body when
`ctaHref` is set (comment in code: "top-of-page placement so the offer is visible before any
scroll"), and `ProductPage.tsx` passes `<StaticHeroProduct ctaHref={GUMROAD_URL} …>` → so the
**$39 Buy button now sits above the fold in the hero, right next to the interactive demo.**
There are now THREE buy surfaces: hero (top), #subscribe/newsletter footer, free_modes_bridge.
IMPLICATIONS for the old verdict: the blanket "VISIBILITY, nobody ever saw a paid offer" read
is now only partially valid (still true for the footer CTA + for visitors who bounce the hero
without it loading), but for any engaged hero visitor the offer IS now in view. Re-frame
per session, don't reuse the old blanket verdict.
**INSTRUMENTATION GAP (confirmed 2026-06-24):** the hero BuyButton is passed NO `ctaLocation`
→ its IMPRESSION is NOT tracked (footer_cta_view only ever has location ∈ {newsletter,
free_modes_bridge}; no hero/above-fold impression value exists). Its CLICK *is* tracked — the
global delegated `buy_click` listener fires on any `a[href*="gumroad.com/l/"]` regardless of
location/placement. So: hero-Buy clicks ARE visible as `buy_click` (with prop `label`/`path`),
hero-Buy *views* are invisible. To split "saw hero-Buy, didn't click" from "bounced before it
rendered" we'd need to pass a `ctaLocation` (e.g. `hero`) to the hero BuyButton so it emits a
footer_cta_view impression too. Until then, hero-Buy impressions are a blind spot.

## METHOD FIND (reusable, important) — autocapture + scroll ARE queryable
Two data sources I previously thought were missing are actually present in raw events,
just not in the event-definition list:
- **`$autocapture` events ARE captured** (not in `read-data-schema {kind:events}` definitions,
  but they fire). They carry `elements_chain`, `elements_chain_href`, `elements_chain_texts`,
  `properties.$el_text`, `properties.$event_type`. → I can see EXACTLY which button/link a
  visitor clicked (text + href), not just that they clicked. This contradicts the old
  "autocapture is OFF" note in [[demo-engagement-baseline]] — autocapture data exists for
  click-target analysis. (Demo-control clicks still have no semantic event: they show up as
  `$el_text=None` / numeric mode labels like "11"/"12"/"14" = the mixer mode captions, not a
  named CTA. So `demo_interact` is still worth adding for clean demo-engagement counting, but
  raw demo clicks ARE visible in autocapture as "None"/number clicks.)
- **Scroll depth IS captured** on `$pageleave` via posthog-js: `$prev_pageview_max_scroll_percentage`,
  `$prev_pageview_max_content_percentage`, `$prev_pageview_last_scroll_percentage`,
  `$prev_pageview_duration`, `$prev_pageview_pathname`. → per-pageview scroll reach + dwell.
  This resolves the old "scroll-depth props unverified" caveat in [[query-recipes]]: they exist.

### Working SQL shapes (the date filter that DID NOT crash)
- Date filter that works: `toDate(toTimeZone(timestamp,'Asia/Bangkok')) = toDate('2026-06-15')`.
  `toDate(ts,'TZ')` (2-arg) is NOT supported; bare `timestamp >= '...Z'` over a wide window
  intermittently errored with "unknown error" — use the toTimeZone-wrapped toDate form.
- Scroll per pageleave: `SELECT $session_id, properties.$prev_pageview_pathname, properties.$prev_pageview_max_scroll_percentage, properties.$prev_pageview_max_content_percentage, properties.$prev_pageview_duration FROM events WHERE event='$pageleave' AND <date> AND <owner-excl> ORDER BY timestamp`.
- Click targets: `SELECT $session_id, properties.$pathname, properties.$el_text, elements_chain_href FROM events WHERE event='$autocapture' AND <date> AND <owner-excl> ORDER BY timestamp`.

## THE LANDING STRUCTURE (where the buy CTA physically is) — from code 2026-06-16
ProductPage.tsx (`/`) section order top→bottom: Header → **Hero** (no CTA at all, just
eyebrow+h1+body) → interactive mixer/demo → PerformanceFlow → Video(#video) → ICPColumns →
**TheKit(#kit)** [CTA "Try free custom modes →" → /free-custom-modes] → FAQ → Requirements →
**Newsletter(#subscribe)** [the ONLY buy CTA on the whole site: link "Buy on Gumroad • $39" →
gumroad.com/l/control-xl] → Footer.
- **The buy CTA is the 10th of 11 blocks — second from the bottom (~88-95% page height).**
- Header NAV = Features(#kit) / Free modes / Support / Contact — **NO "Buy" link in the nav.**
- Hero has ZERO CTA — no buy, no free-modes link in the first screen.
- So the ONLY paths to buy: scroll the entire page to #subscribe. There is no shortcut.
- grep confirms: the string "gumroad"/"l/control-xl"/"Buy"/"$39" appears on the site ONLY in
  NewsletterSection (+ legal page prose). One buy surface, at the very bottom.

## THE TWO KEY SESSIONS (replay + events + scroll)
**maxforlive ES** — session `019ec722-79b7-7ed8-ac9d-e0b9d739d48c`, 00:16 ICT, Desktop Edge,
viewport 2149×1159, 85s (39s inactive), 2 clicks.
- `/` (46s): max_scroll **0%**, content 11.6% → never scrolled, clicked NAV "Modos libres"
  (=localised Free modes) from the header. Site auto-localised to Spanish.
- `/free-custom-modes` (27s): scroll 44%, content 66% → clicked "Descarga modos…gratuitos"
  → mode_download (.zip). 
- back to `/` (15s): max_scroll **0%** again, content 11.5% → only hero, left.
- Never saw the buy block. 0 buy clicks.

**reddit RU (ableton_post)** — session `019ec849-d5e8-7803-89ed-571195fde3d2`, 05:39 ICT,
Mobile Yandex, viewport 393×651, 101s, 2 clicks. (Memory said "entered /free-custom-modes" —
WRONG: actually entered `/`, then navigated to free-modes.)
- `/` (80s): max_scroll **73%**, content 75% → best scroll of the day on `/`; reached the
  Kit(#kit) section, clicked "Try free custom modes →" → /free-custom-modes.
- `/free-custom-modes`: clicked "Download free Custom Modes" → mode_download (.zip); session
  ended on download (no pageleave row for the 2nd page).
- Got further than anyone but STILL stopped ~13-22 pts short of #subscribe. Never saw buy. 0 buy.

## ALL engaged sessions 06-15 — scroll reach on `/`
PL Desktop 18%/28% (played with demo, left) · ES 0%/11.5% · DK 0%/10% (1s bounce) ·
RU Mobile 73%/75% (best real) · GB 0%/11% · NL Desktop: free-modes 100% then back to `/`,
9 demo clicks, no buy · TH Desktop 95% = the residual owner-orphan inactive 34000s session
(discount, not a real shopper). **No real human session reached #subscribe on `/`.**

## ALL clicks 06-15 (autocapture, owner-excluded)
Every click with a real href → `/free-custom-modes` or `.zip` (free modes). **ZERO clicks
with a gumroad/buy href all day.** Other clicks = demo-mixer interactions (`$el_text`=None or
mode-number "11"/"12"/"14") + empty space. PL and NL clicked the demo a lot but neither bought.

## VERDICT — it is a VISIBILITY / STRUCTURE problem, not (yet) a persuasion problem
The buy CTA cannot be failing on persuasion because **essentially no engaged visitor ever
laid eyes on it.** It sits second-from-bottom (#subscribe), there's no Buy in the nav, and the
hero has no CTA. The best scroller of the day (RU, 73%) stopped before it; everyone else read
only the hero (0-18%). The free-modes CTA, by contrast, is reachable from the header AND from
#kit (mid-page) — so 100% of conversions go to the free path simply because it's the only CTA
people physically encounter. The funnel leaks at "did they ever see a paid offer", upstream of
"were they convinced". Persuasion is currently UNTESTABLE — there's no impression to convert.

## 3 hypotheses to test (when traffic supports it)
1. **Put a paid CTA above the fold + in the nav.** Add "Buy on Gumroad • $39" to the header nav
   and/or a hero CTA pair (primary "Get it $39" + secondary "Try free modes"). Measure: share
   of sessions with ANY buy-CTA in-viewport (proxy: scroll reach to the CTA, or a new
   `cta_view`/impression event), and buy_click rate. Expect buy_click to go from 0 simply
   because the offer becomes visible.
2. **The free-modes CTA cannibalises the paid path.** Both the only-visible CTAs ("Free modes"
   nav + "Try free custom modes →" in #kit) point to the free download, which sits structurally
   before the buy block. Test: after the free download, surface a "Get the full Control XL"
   upsell on /free-custom-modes (it currently has NO buy CTA either — RU/ES both downloaded and
   left with no paid prompt). Measure: free-modes → buy_click within session.
3. **Instrument a buy-CTA impression event before concluding persuasion.** Add an in-viewport
   impression event on the #subscribe buy link (IntersectionObserver → `cta_view`), so we can
   split "never saw it" from "saw, didn't click". Until this exists, every "buy=0" is ambiguous
   between invisibility and unpersuasiveness — the data above strongly says invisibility, but the
   impression event makes it provable and lets the hero/nav-CTA test be measured cleanly.
