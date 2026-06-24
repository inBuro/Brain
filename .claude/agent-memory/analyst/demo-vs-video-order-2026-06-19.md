---
name: demo-vs-video-order-2026-06-19
description: Data read for "should we swap the demo and the video on the landing" (2026-06-19) — section order, scroll-depth distribution (engaged visitors DO reach bottom — corrects the 06-15 snapshot), demo vs video engagement counts, and the buy-click correlation (n=3, none touched either)
metadata:
  type: project
---

# Demo vs Video order — data read (2026-06-19)

Question: should the interactive prototype and the demo video be swapped on the landing?

## Current section order (confirmed from code, ProductPage.tsx, 2026-06-19)
Header → Hero (no CTA) → **interactive demo (mixer / OneActionBetweenThem)** → PerformanceFlow →
**Video #video (YouTube UsJxPBdf568)** → ICPColumns → TheKit #kit (free-modes CTA) → FAQ →
Requirements → Newsletter #subscribe (ONLY buy CTA) → Footer.
- So the **interactive demo is ABOVE the video** today (demo sits directly under the hero; video
  comes after PerformanceFlow, roughly mid-page). They are NOT adjacent — PerformanceFlow is
  between them. A "swap" means moving the video up under the hero and the demo down below the flow.
- The interactive demo also has an affordance hint overlay ("Interactive demo — try the controls")
  that the 06-12 UX fix added.

## Scroll depth on `/` (14d, owner-excluded, $pageleave $prev_pageview_max_scroll_percentage)
Distribution (pageleaves with dwell>3s): 00-10%=8, 10-25%=3, 25-50%=2, 50-75%=6, 75-90%=7,
90-100%=14. **Bimodal: a big bounce cluster (00-10%) AND a big deep-read cluster (75-100% = 21
of 40).** The page is short — engaged visitors reach the bottom (and thus the #subscribe buy CTA).
- **This CORRECTS the [[buy-cta-visibility-2026-06-15]] snapshot** ("nobody scrolls to the buy CTA,
  best was 73%"). That was true for the 06-15 cohort only; across 14d, ~half of non-bounce
  sessions reach 90-100%. The buy CTA IS being reached now (consistent with the first buy_clicks
  06-16→06-18). Visibility is less of a wall than the 06-15 read implied — but the bounce half
  still never gets past the hero+demo.
- Contamination removed before reading: TH Desktop Safari/Brave deep sessions on 06-07/08 and the
  06-15 TH 34397s / 95% session = owner / owner-orphan inactive tab — discount these from "deep".
  Real-human deep scrollers are spread US/BR/CA/FI/BY/GB/DK/NO/UA/PL/SE.

## Engagement by element (14d, landing `/`, owner-excluded)
- 85 landing sessions.
- **demo_interact: 7 events / 7 sessions** (~8% of landing sessions touch the interactive demo).
- **video_play: 10 events / 9 sessions** (~11% press play on the video).
- So video is pressed slightly MORE than the demo is touched, even though the demo is higher on
  the page. Both are single-digit-session signals — tiny.
- demo_interact props: `path`, `zone`. (Live since ~06-16/17.)

## Buy-click correlation (the conversion question) — NO SIGNAL, n=3
3 buy_click sessions in 14d: 06-16 US Tablet (no scroll data, no demo, no video), 06-17 TH Desktop
(71% scroll, no demo, no video), 06-18 PL Desktop (100% scroll, 1 cta_view, no demo, no video,
buy×2). **None of the 3 buyers interacted with EITHER the demo or the video.** They scrolled (or
in the iPad case the CTA was reachable) and clicked buy without touching either rich element.
→ At n=3 this proves nothing about which element drives conversion; it only says the current
converters didn't need either. Real purchase still = 1 (NL maxforlive buyer, also no demo/video).

## VERDICT
- Reordering demo↔video is **NOT data-justified right now** — it's a coin-flip on n≈7-9 engaged
  sessions each and zero conversion linkage. Don't reorder on vibes.
- If the goal is "get the richer asset seen first": video is already played slightly more, and the
  demo (higher) is touched less — weak hint that height isn't the bottleneck for either; the
  bounce-half just leaves regardless.
- Proper way to settle it = a PostHog A/B experiment (we have the harness, exp 376381 pattern),
  but at ~10-20 sessions/day it would take months to reach significance — same honesty caveat as
  the hero experiment. So: either accept it's a judgment call, or run the experiment as a slow
  accumulator and don't peek.
- Better near-term lever than ordering: the bounce-half never leaves the hero (00-10% cluster).
  Engagement work belongs at the hero/first-screen, not at demo-vs-video sequencing.
