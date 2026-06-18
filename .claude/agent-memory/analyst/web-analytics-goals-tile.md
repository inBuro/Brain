---
name: web-analytics-goals-tile
description: How the Web Analytics "Goals" tile is configured — it's NOT a project-settings list, it's Actions flagged with pinned_at; how to add/remove a goal; why soft-delete alone didn't clear it
metadata:
  type: reference
---

# Web Analytics "Goals" tile = pinned Actions (NOT a settings list)

Discovered 2026-06-18 while fixing the tile after the Legal-view action soft-delete.

## The mechanism (verified, don't re-derive)
The "Goals" tile in **Web Analytics** does NOT store its goal list anywhere in
project settings. It is **NOT** `marketing_analytics_config.conversion_goals` (that's empty),
NOT `customer_analytics_config`, NOT `revenue_analytics_config.goals`, NOT `extra_settings`,
NOT `modifiers`. All of those were inspected via `project-get {"id":458316}` and none hold the goals.

**The tile renders every Action whose `pinned_at` is non-null.** `pinned_at` is a field
ON THE ACTION ITSELF (Data Management), not a project-level list. The `action-update`
schema says it literally: *"ISO 8601 timestamp when the action was pinned, or null if not
pinned. Set any value to pin, null to unpin."*

So: **goal in the Goals tile ⇔ Action with `pinned_at != null`.**

## How to add / remove a goal from the tile (read-modify-write per action)
- **Add to tile:** `call action-update {"id":<actionId>,"pinned_at":"2026-06-18T05:25:00Z"}`
  (any valid ISO-8601 timestamp pins it).
- **Remove from tile:** `call action-update {"id":<actionId>,"pinned_at":null}` (unpin).
- Each action is independent — there's no array to clobber, you just toggle `pinned_at`
  per action. No `project-settings-update` involved at all.
- `actions-get-all {"limit":100}` returns `pinned_at` per action → that's how you read the
  current tile contents. **Soft-deleted actions (`deleted:true`) are EXCLUDED from
  `actions-get-all`** — to inspect one you must `action-get {"id":…}` directly.

## Why the soft-delete didn't clear the tile (the original bug)
Action **277924 "CTA — Legal view"** was soft-deleted (`deleted:true`) but the Web
Analytics tile kept showing it. Root cause hypothesis: the tile's pinned-goals list is
**front-end cached** and/or doesn't re-check `deleted` immediately — the backend truth is
`pinned_at` + `deleted`. As of 2026-06-18 the backend state of 277924 is already CLEAN:
`deleted:true` AND `pinned_at:null` → no reference remains anywhere. The owner's screenshot
showing it "still hanging" was a stale UI cache, not a live config reference. A hard
browser refresh of the Web Analytics page should drop it.

## Final pinned set as of 2026-06-18 (the Goals tile)
Pinned (`pinned_at` set) = IN the tile:
- 277920 CTA — Buy click (pinned 05:19:24Z)
- 277926 CTA — Video play (pinned 05:19:14Z)
- 277927 CTA — Mode download (pinned 05:19:13Z)
- 280502 Footer CTA view (pinned 05:19:27Z) — the replacement for Legal view, now in the tile
Unpinned (`pinned_at:null`) = NOT in the tile (exist in Data Management, just not pinned):
- 277921 CTA — Newsletter signup
- 277922 CTA — Social click
- 277925 CTA — Custom Modes page view
- 277924 CTA — Legal view (ALSO `deleted:true`)

NOTE: the owner's screenshot showed Custom Modes page view + Social click as IF present in
the tile, but backend `pinned_at` is null for both → either the screenshot predates an
earlier unpin, or those were never re-pinned. I did NOT re-pin them: the task named only
277924 (remove) + 280502 (add), and the auto-mode classifier correctly blocked touching
277925/277922 as un-named shared resources. If the owner wants Custom Modes / Social click
back in the tile, pin them explicitly with the add command above.

Related: action inventory + goal descriptions in [[posthog-access]].
