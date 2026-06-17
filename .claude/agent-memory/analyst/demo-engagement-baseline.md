---
name: demo-engagement-baseline
description: Before/after baseline marker for the 2026-06-12 UX fix that made the interactive-demo controls look more clickable; plus the measurement gap (no demo-interaction event yet) and the comparison plan to run once traffic grows
metadata:
  type: project
---

# Interactive-demo UX fix — before/after baseline (set 2026-06-12)

## The change (the "after" boundary)
Founder watched session replay and saw that a chunk of visitors did NOT realize the
interactive-demo controls on the landing (`fadercraft.com`) are clickable — they didn't read
the controls as interactive. He shipped a UX fix that makes the clickable controls more
obvious (more visibly clickable / affordance bump). In replay he already sees the effect:
people interact with the demo controls more.

**Why:** the interactive demo is the hero "try it" moment; if visitors don't touch it, the
whole "map once, your permanent interface" value prop never lands → no buy intent. Lifetime
`buy_click` = 0 (see [[posthog-access]] traffic state), so anything that lifts hero engagement
is worth measuring.

**How to apply:** treat **2026-06-12** as the dividing line for any "did the demo fix help?"
analysis. Sessions before = control cohort, sessions on/after = treated cohort.

## EXACT fix timestamp — TO CONFIRM before any real before/after split
The date is ~2026-06-12 but the precise deploy time is NOT yet pinned. Before running the
actual comparison, get the exact deploy moment from the project repo:
- Repo: `~/Projects/Claude/Fadercraft` (the code workspace; see main MEMORY.md "Fadercraft workspaces").
- Source it from `git log` around 2026-06-12 (commit that touches the hero/demo control styles)
  AND/OR the Cloudflare Pages deploy log (`wrangler pages deployment list` for project
  `fadercraft-landing`). Use the deploy time, not just commit time — what visitors saw is gated
  by the deploy. Convert to Thai time (UTC+7) when recording.
- Sessions straddling the deploy moment that day are ambiguous → drop the deploy-day partial,
  or split strictly by the confirmed timestamp.

## GAP CLOSED — `demo_interact` IS live now (confirmed 2026-06-17)
**The gap below is HISTORICAL.** As of 2026-06-17 both `demo_interact` AND `cta_view` are in the
live event schema (= they've fired at least once), alongside the existing `video_play`/`mode_download`/
`buy_click`/`social_click`/`purchase`. So demo-control interaction is now an explicit, queryable event —
the before/after demo-engagement rate (plan below) can finally be computed forward from whenever
`demo_interact` first fired. TODO next time: pin `demo_interact` first-fire timestamp + count, and
check what `cta_view` captures (new — not documented yet; likely a CTA-impression/viewport event).

## THE MEASUREMENT GAP — no demo-interaction event exists yet (was true 2026-06-12, NOW CLOSED)
There WAS **NO PostHog event that captures interaction with the interactive-demo
controller.** Verified against the live event schema 2026-06-12:
- `video_play` is NOT it — that fires on the demo **video** Play button
  (`button[aria-label="Play demo"]`), a different element. Don't reuse it for demo-control clicks.
- **Autocapture is OFF** — `$autocapture` is not in the project's event schema, so clicks on
  the demo DOM elements are not auto-recorded.
- `$rageclick` / `$dead_click` exist but are negative/ambiguous signals, not an engagement metric.
- So today the ONLY way to see demo interaction is watching session replay by hand (what the
  founder is doing). That cannot be turned into a before/after rate.

### Proposed fix for the gap (do when ready to instrument)
Add an explicit custom event, same delegated-listener pattern as the other CTAs in
`~/Projects/Claude/Fadercraft/app/index.html` (see [[posthog-access]] custom-events section).
- Event name suggestion: **`demo_interact`** — fires on the FIRST click of any clickable
  interactive-demo control in a session (de-dupe so it counts engaged sessions, not click spam;
  optionally also a raw per-click variant if click volume per session is interesting).
- Suggested props: `control` (which knob/fader/pad), `path`. Keep it minimal.
- Then create an Action wrapping `demo_interact` (a "Demo engaged" CTA goal) so it slots into
  funnels like the existing 2779xx CTA actions.
- Until this ships, before/after is replay-qualitative only, not a rate.

## COMPARISON PLAN — run at the next traffic spike (target ~100+ sessions)
Do NOT compute now: traffic is tiny (lifetime ≈ 45 human sessions as of 2026-06-12; the fix-day
window will have only a handful). Numbers now would be noise. When a real spike lands (next
Reddit/launch push) and the treated cohort reaches ~100+ sessions, compare control vs treated:
1. **Demo-engagement rate** — share of sessions that interacted with a demo control
   (= sessions with `demo_interact` / total sessions), before vs after the confirmed fix time.
   Requires `demo_interact` to be live; sessions before instrumentation can only be back-read
   from replay, so the clean comparison really starts once the event ships.
2. **Demo → buy reach** — funnel `demo_interact` → `buy_click` (Action 277920), before vs after,
   to check the fix doesn't just raise touches but actually moves people toward the CTA.
Always `filterTestAccounts: true` (owner exclusion). Report N raw; at low N say so, don't infer
significance. If the fix predates `demo_interact`, the honest framing is: replay shows
qualitative lift now; the quantitative before/after starts accumulating from the instrumentation
date forward.

## Status checklist
- [x] Baseline marker recorded (fix ≈ 2026-06-12, control=before / treated=after).
- [ ] Exact deploy timestamp confirmed from git/deploy log (TO-CONFIRM, see above).
- [x] `demo_interact` event instrumented in index.html + verified firing (in schema 2026-06-17; first-fire timestamp/count still TO-PIN).
- [ ] Action "Demo engaged" created wrapping `demo_interact`.
- [ ] Comparison run at ~100+ treated sessions (engagement rate + demo→buy funnel).
