---
name: homepage-seo-gsc-2026-07-07
description: GSC 90-day read of the fadercraft.com hub homepage for the metadata brief — the anonymized-query quirk, current title/desc snapshot, and keyword-target verdict
metadata:
  type: project
---

## What was pulled (2026-04-06 → 2026-07-04, GSC API, `sc-domain:fadercraft.com`)

**Homepage (`https://fadercraft.com/`) totals, page-level:** 24 impressions, 2 clicks, CTR 8.3%, avg
position 17.8 — much better than the 2026-07-03 baseline snapshot (that pull used a shorter/older
window and only saw position 54-69).

**Homepage totals, query-level breakdown — only 4 rows visible, all 0 clicks:**
`crafting controller` (1 impr, pos 54), `fadermaster` (2 impr, pos 67.5), `faders for cm labs
motormix` (2 impr, pos 72), `lcxl` (1 impr, pos 67). All four are off-target/coincidental matches,
not real product-intent searches ("faders for cm labs motormix" is a *different* hardware fader
controller brand entirely).

**Site-wide:** homepage is the ONLY page with any impressions in the 90-day window (0 for
`/control-xl`, `/sends-follower`, the new JTBD guide — guide too fresh, others just not indexed
enough yet). Query filter `contains "fadercraft"` (brand) returned **0 visible rows**.

## The key quirk: anonymized queries
Date-dimension breakdown shows ~11 separate days at **position 1-3** (2026-06-10, 06-12, 06-13,
06-15, 06-17, 06-20, 06-25, 06-27, 06-29, 07-02) that don't correspond to ANY of the 4 named
queries (all of which sit at position 54-72). This is GSC's known behavior: it suppresses
individual rows for very-low-volume/rare queries (privacy), but still folds their clicks/
impressions into the page- and date-level aggregates. Conclusion: the site is almost certainly
already ranking #1-3 for **brand-exact "fadercraft" searches**, we just can't see the query text
directly — the page-level position average (17.8) is a blend of those excellent brand hits and
the handful of bad-fit generic queries.

## Current metadata (checked live via curl, 2026-07-07)
- Homepage `<title>`: "Fadercraft · Max for Live devices for Ableton performance" / description:
  "Focused Max for Live utilities for Ableton Live — Control XL for the Launch Control XL MK3,
  Sends Follower, and more."
- `/control-xl` `<title>`: "Control XL · M4L device for Launch Control XL MK3" / description:
  "Launch Control XL MK3 custom modes download + Max for Live interface. One fixed layout across
  all Ableton sets. $39." — already owns the LCXL MK3 exact-match terms; no cannibalization risk
  if the hub stays on brand+category.

## Verdict for the copywriter brief
Homepage should NOT compete for "Launch Control XL MK3" / "LCXL MK3" / "Control XL" exact-match —
cede those to `/control-xl`, which already targets them well. Real whitespace is category-level
terms that currently sit at **zero impressions in 90 days**: "ableton controller", "max for live
devices/tools", "ableton performance controller/tools", "controller mapping ableton". Brand
("fadercraft") already appears to win position 1-3 — keep it first in the title, don't rework it.

Traffic volume is still razor-thin (single digits of impressions per query) — this is a
directional read to prioritize which 3-5 phrases the title/description should carry, not a
statistically solid ranking study. Recheck in another 60-90 days once the JTBD guide and any
category-targeted copy have had time to get crawled/indexed and accrue impressions.

See also [[gsc-access.md]] for the API mechanics and general baseline.
