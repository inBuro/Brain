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

**STALE UPDATE (2026-06-22):** 281487 "Video section view" was also pinned (05-22
07:25:27Z) — this file's "final set" above predates that pin.

**Sends Follower parity pins (2026-07-07)** — mirroring the CXL pinned set for the SF
product, added when SF goal-parity was built (full audit in [[sends-follower-parity-2026-07-07]]):
- 285584 SF — Buy click
- 285587 SF — Footer CTA view
- 285588 SF — Video play
- 285589 SF — Video section view
Not pinned (exist, deliberately unpinned, mirroring CXL's unpinned Newsletter/Social):
- 285585 SF — Newsletter signup
- 285586 SF — Social click

## "Today" + Compare-to-previous can show stale 0s even when real data exists (found 2026-07-07)
On 2026-07-07 the owner's Web Analytics screenshot showed all 5 pinned goals (Buy click,
Mode download, Video play, Footer CTA view, Video section view) at 0/0/0.0% with filter
"Today" + "Compare to previous period" ON. Reproduced the EXACT query the tile uses —
`query-web-overview` (`WebOverviewQuery`) with `conversionGoal:{actionId}`, `date_from:"dStart"`,
`compareFilter:{compare:true}`, `filterTestAccounts:true` — and got REAL nonzero results for 3
of the 5: Video play 18 conversions/8 unique/44.4% CR, Footer CTA view 11/10/55.6%, Video
section view 20/16/88.9% (Buy click and Mode download were genuinely 0 that day — no bug there).
So the tile can render stale/wrong 0s for goals that DO have same-day conversions server-side —
a front-end display bug, not a data or Action-config problem (same family as the 06-18
soft-delete caching bug above). Underlying cause of the traffic itself that day: an
unexplained ~20-session /sends-follower spike, mostly `$direct` with no UTM, 13 different EU/
Asia countries, real scroll/video engagement — source unidentified, worth watching for a repeat.
**Diagnostic recipe:** to check if the tile is lying, don't trust the UI — call
`query-web-overview` with the same `conversionGoal`/date range/`compareFilter` yourself and
compare. If the UI shows 0 but this call doesn't, it's a render/cache bug — tell the owner to
hard-refresh or toggle the date range, not to worry about tracking.

## Diagnosis 2026-07-08: 5 of 9 pinned goals are page-abstract (mix all pages into one number)
Owner complained the Goals tile goals are "abstract" — you see e.g. "Buy click: N" with no way
to tell WHICH page drove it. Verified via `query-trends` breakdown by `$pathname` (30d, monthly
interval): the 5 CXL-era pinned actions have **NO `$pathname` filter in their steps** and their
event genuinely fires across multiple pages:
- `buy_click`: `/`, `/updates`, `/control-xl`, `/free-custom-modes` (4 distinct pages)
- `video_play`: `/`, `/sends-follower`, `/control-xl`
- `footer_cta_view`: `/sends-follower`, `/free-custom-modes`, `/`, `/control-xl`
- `section_view` (section=video): `/`, `/sends-follower`, `/control-xl`
So the current tile numbers for **277920 Buy click / 277926 Video play / 280502 Footer CTA
view / 281487 Video section view** are a same-name-event rollup across Hub + Control XL +
Sends Follower + free-modes-bridge, all summed — that's the literal "abstraction" the owner
is reacting to. `277927 Mode download` is the one exception, structurally single-page
(`/free-custom-modes` only, no other page has a download link).

Contrast: the 2026-07-07 SF-parity actions (285584/87/88/89, see [[sends-follower-parity-2026-07-07]])
ALREADY solve this correctly by adding a `$pathname exact /sends-follower` step — so today the
tile shows BOTH the page-scoped "SF — Buy click" (SF only) AND the generic "Buy click" (all
pages, SF included) side by side — partially redundant, and the generic one still hides which
of Hub/CXL/SF (minus SF, still ambiguous between Hub vs CXL) drove it.

**The consistency mechanism the owner also wants ("действие срабатывало и там и там" — same
goal visible in Goals tile AND in funnels/insights) already exists structurally** — Actions are
one shared object, referenced by the Goals tile via `pinned_at` and by `query-funnel`/
`query-trends` via `{"kind":"ActionsNode","id":<actionId>}`. No new plumbing needed for that
part; the fix is purely about adding `$pathname` scoping to the Action's `steps[].properties`
(exact match `/control-xl` or `/` etc.), mirroring the SF pattern, then re-pinning the
page-scoped versions in place of (or alongside) the generic ones.

## FIX EXECUTED 2026-07-08 — owner approved via coordinator, scope = CXL + SF only, no Hub
Owner's decisions: (1) page split only for **Control XL + Sends Follower** (Hub `/` not
broken out — its hits fall into "other/uncounted" for these 4 metrics), (2) generic all-pages
actions **fully retired from the tile** (no "site-wide total" row kept).

Created 4 new Control XL actions mirroring the SF `$pathname` pattern exactly:
- **285962** CXL — Buy click (`buy_click` + `$pathname exact /control-xl`)
- **285963** CXL — Video play (`video_play` + `$pathname exact /control-xl`)
- **285964** CXL — Footer CTA view (`footer_cta_view` OR `cta_view`, both with
  `location=newsletter` + `$pathname exact /control-xl` — mirrors 280502's two-step rename span)
- **285965** CXL — Video section view (`section_view` `section=video` + `$pathname exact
  /control-xl`)

Then swapped the pin: unpinned the 4 generic (all-pages) actions — **277920 CTA — Buy click,
277926 Video play, 280502 Footer CTA view, 281487 Video section view** (still exist in Data
Management, just `pinned_at:null` now, not deleted) — and pinned the 4 new CXL actions above.
**277927 CTA — Mode download left untouched** (still pinned, no rescoping needed — it's
structurally single-page, only ever fires on `/free-custom-modes`).

**Final Goals-tile pinned set as of 2026-07-08 (9 actions, same count, now every one is
page-explicit):** CXL — Buy click (285962) · CXL — Video play (285963) · CXL — Footer CTA
view (285964) · CXL — Video section view (285965) · SF — Buy click (285584) · SF — Footer CTA
view (285587) · SF — Video play (285588) · SF — Video section view (285589) · CTA — Mode
download (277927, free-modes-only). Verified live via `actions-get-all` post-change — the
9 IDs above are the only ones with non-null `pinned_at`. Deep links:
https://us.posthog.com/project/458316/web (tile) ·
https://us.posthog.com/project/458316/data-management/actions (full action list).

If the owner later wants Hub (`/`) broken out too, or wants the retired generic actions fully
deleted (not just unpinned) rather than left dormant in Data Management, that's a follow-up —
not done here (task only named unpin, not delete).

## "Tile shows only 5 of 9 pinned goals, 'See all' stuck at 5" (found 2026-07-08, likely a 4th UI bug on this tile)
Right after the CXL remediation above, owner reported the Goals tile only renders **5** goals
and clicking "See all"/expand doesn't reveal the rest. Re-verified via `actions-get-all`
immediately: **all 9 intended actions are still pinned, exactly as set, no drift, no dupes,
no stale timestamps** — 285962/63/64/65 (CXL ×4), 285584/87/88/89 (SF ×4), 277927 (Mode
download). So this is NOT a config regression.

Checked for a real display limit: `project-get` has no goals-count/limit field anywhere
(`marketing_analytics_config.conversion_goals` is a DIFFERENT, unrelated, empty feature —
Marketing Analytics' own conversion-goal list, not the Web Analytics Goals tile).
`docs-search` on "Web Analytics Goals tile limit / See all" surfaced conversion-goals docs
+ dashboard docs — **no mention anywhere of a hard cap on number of goals shown**. So there's
no documented or config-level reason for a 5-item cap.

**Working diagnosis: front-end display/cache bug, same family as the two prior ones on this
tile** (soft-delete stale display 06-18; stale 0s under "Today"+compare 07-07 — both were
confirmed front-end issues, not data/config problems, by cross-checking the same
`query-web-overview` call the tile itself uses). No 4th distinct root cause was found here —
recommend the owner hard-refresh (Cmd+Shift+R) / clear cache / try an incognito window before
assuming a real product limit exists. If the count is still capped at 5 after a clean reload,
it's worth reporting to PostHog directly (an `agent-feedback` draft was prepared but blocked by
this session's auto-mode permission classifier as an unrequested external-system write — ask
the owner explicitly if they want it sent).

**Not yet tried/inconclusive:** did not have a way to render the actual front-end tile from
this agent (API-only access) to confirm the exact rendering bug visually — this diagnosis is
inference from "backend is provably correct + no documented limit exists", not a direct repro
of the UI bug itself. If the owner reports it recurring after a hard refresh, treat "does the
tile only fetch/show the first 5 by some batch size" as the next hypothesis to test (e.g. via
browser devtools network tab on the actual `/web` page load, which this agent cannot inspect).

## Dynamic Focus goal parity (created 2026-07-23, full spec in [[dynamic-focus-actions-spec]])
7 Actions created for /dynamic-focus, mirroring the CXL/SF pattern. Pinned set (4 actions):
- **294066** DF — Buy click (`buy_click` + `$pathname exact /dynamic-focus`) — pinned
- **294069** DF — Footer CTA view (`footer_cta_view` + `location=footer` + `$pathname exact /dynamic-focus`) — pinned. NOTE: `location=footer` (not `newsletter`) — DF's closing BuyButton passes `location="footer"`, unlike CXL/SF which use `location="newsletter"`. Single-step action (no legacy cta_view span needed — DF is a brand-new page).
- **294070** DF — Video play (`video_play` + `$pathname exact /dynamic-focus`) — pinned
- **294071** DF — Video section view (`section_view` + `section=video` + `$pathname exact /dynamic-focus`) — pinned

Not pinned (exist in Data Management, deliberately unpinned, mirroring CXL/SF pattern):
- **294067** DF — Newsletter signup
- **294068** DF — Social click
- **294072** DF — FAQ opened (DF HAS a FAQSection — 6 items — so this action exists here, unlike SF which has no FAQ)

**Final Goals-tile pinned set as of 2026-07-23 (13 actions):**
CXL — Buy click (285962) · CXL — Video play (285963) · CXL — Footer CTA view (285964) · CXL — Video section view (285965) · SF — Buy click (285584) · SF — Footer CTA view (285587) · SF — Video play (285588) · SF — Video section view (285589) · CTA — Mode download (277927) · DF — Buy click (294066) · DF — Footer CTA view (294069) · DF — Video play (294070) · DF — Video section view (294071).

**NAMING SITUATION (clarified 2026-07-30 via full actions-get-all + insight RikP9Cee HogQL inspection):**
TWO DIFFERENT naming contexts co-exist and must not be confused:

1. **Actions in Data Management** (live `actions-get-all`, 2026-07-30): named **"LC —"**. Confirmed IDs:
   - 285962 = "LC — Buy click"
   - 285963 = "LC — Video play"
   - 285964 = "LC — Footer CTA view"
   - 285965 = "LC — Video section view" (soft-deleted 2026-07-29, but was named "LC —")
   - 283077 = "LC — FAQ opened"
   - 283039 = "LC — Mixer tab click"
   Also confirmed renames: 277920 = "Site — Buy click" (was "CTA — Buy click"), 277927 = "Free — Mode download" (was "CTA — Mode download").

2. **Insight RikP9Cee "All goals — firing counts" (HogQL)**: as of **2026-07-30 all "CXL —" aliases RENAMED to "LC —"** (one-pass update). The insight SQL now uses "LC —" everywhere, consistent with Action names in Data Management. The NAMING SITUATION is now unified — no more "CXL vs LC" split.

**LC — Mixer tab click in the insight** = NOT a new action. It's this HogQL formula: `sumIf(1, event = '$autocapture' AND hasAny(elements_chain_texts, ['11','12','13','14']))` — same logic as Action 283039 "LC — Mixer tab click". Low-volume (0 on most recent days checked).

**BUG in RikP9Cee: "CXL — FAQ opened" has no pathname filter. FIXED 2026-07-30.** The old unscoped `sumIf(1, event = 'faq_open')` (catching ALL pages under a wrong "CXL" label) was replaced with 3 properly-scoped columns — see "FAQ Actions" section below. Insight now has 19 columns (was 17).

**Goals-tile state as of 2026-07-30 (re-verified via actions-get-all — NO CHANGE from 07-29):** ONLY 4 actions pinned (all Buy click variants):
- **277920** "Site — Buy click" — pinned_at "2026-07-26T12:03:42.921935Z"
- **285584** "SF — Buy click" — pinned_at "2026-07-07T14:09:23.303289Z"
- **285962** "LC — Buy click" — pinned_at "2026-07-08T15:32:52.722370Z"
- **294066** "DF — Buy click" — pinned_at "2026-07-23T00:00:00Z" (round midnight timestamp — set manually/programmatically)
Everything else (Video play, Footer CTA, Video section view, Mode download for all pages) is currently unpinned. Cause of the 13→4 reduction unknown; happened between 07-23 and 07-29.

**Diagnosis 2026-07-30 — "owner sees only LC goals":**
Owner reported after recent deploys that the Goals tile shows only "LC — Buy click" and the other 3 (Site/SF/DF) "don't display." Ran `query-web-overview` with `conversionGoal:{actionId}`, `-14d`, `filterTestAccounts:true` for all 4 pinned actions. Server-side results (all non-zero):
- 277920 Site — Buy click: **25 conversions, 11.68% CR** (214 visitors)
- 294066 DF — Buy click: **16 conversions, 7.48% CR**
- 285584 SF — Buy click: **6 conversions, 2.80% CR**
- 285962 LC — Buy click: **3 conversions, 1.40% CR** (the one owner says is visible — and it's the LOWEST)
**Verdict: 100% front-end cache/display bug.** All 4 goals have real data; the tile is rendering stale state. LC (pinned 07-08, the oldest) is the one that "stuck." No config changes were made — the recent deploys the owner mentioned (D1 dashboard, dark theme, /fb-df redirect, leads table) cannot touch PostHog Actions. Fix: Cmd+Shift+R hard refresh or open an incognito tab at https://us.posthog.com/project/458316/web.
Traffic note (07-16→07-30): `/dynamic-focus` = 178 PVs (50% of all traffic!), SF = 62, Hub = 50, LC = 46. DF is now the dominant product page by far.

**Post-hard-refresh: "5 rows including DF — FAQ opened" (diagnosed 2026-07-30 later)**
After Cmd+Shift+R owner saw a table with ACTION / CONVERTING USERS / CONVERSIONS / CR columns and "→" arrows next to each number (compare-to-previous mode). 5 rows:
- SF — Buy click: 0/0/0.0%
- LC — Buy click: 0/0/0.0%
- DF — Buy click: 0/0/0.0%
- Site — Buy click: 0/0/0.0%
- DF — FAQ opened: 1/2/6.7%
Backend verification (actions-get-all, 07-30): ONLY 4 actions pinned — the 4 buy click actions. 294072 "DF — FAQ opened" has `pinned_at: null` (not pinned). So 5 rows ≠ 4 pinned actions — why the 5th shows up is unclear from the API alone (possible PostHog UI auto-surfacing recently-active unpinned actions, or the user was on a non-standard view).

**Data verdict:** The 0s for buy clicks were ACCURATE. The only buy_click today fired at 15:45:57 ICT (SF, external visitor `019f4eba...`). The screenshot was taken before 15:45 — no buy clicks existed at that moment, the tile was honest. The DF FAQ opened row is also ACCURATE: external visitor `019fb1cc...` opened the DF FAQ 2 times at 13:55:19 and 13:55:27 ICT (2 conversions / 1 user). /dynamic-focus had 16 total visitors today; filterTestAccounts removes 1 owner → 15 external visitors → 1/15 = 6.67% ≈ 6.7% CR. Everything matches.
**Conclusion: this was NOT a bug.** "Today" date range, genuinely no buy clicks at screenshot time, real FAQ engagement data. The tile showing DF — FAQ opened as a 5th row despite it being unpinned is a UI mystery (PostHog may auto-suggest goals with today's conversions). Config is clean. If owner checks NOW (after 15:45), SF Buy click + Site Buy click should show 1/1/CR.

**285965 "LC — Video section view" DELETED 2026-07-29** (soft-deleted, `deleted:true`). Was already unpinned before deletion. Historical data preserved.

Funnel insight: **Jalc8E7K** "DF landing conversion — Pageview → Buy click" (id 10394476), favorited, mirrors zt1U2A25 (SF). https://us.posthog.com/project/458316/insights/Jalc8E7K

## FAQ Actions — full 3-Action set (completed 2026-07-30)

`faq_open` event fires on exactly 2 active page routes: `/control-xl` (LC) and `/dynamic-focus` (DF). Additional 24 historical events exist on `/` (root) — those pre-date the 2026-07-07 routing change when `/` was still the Control XL product page. No other pages have FAQSection in code (HubPage, SendsFollower, DFGuidePage all confirmed FAQ-free via grep).

| # | Name | ID | Event | pathname filter | Pinned |
|---|------|----|-------|-----------------|--------|
| 1 | Site — FAQ opened | **300738** | `faq_open` | none (rollup, all pages incl. historical `/`) | NO |
| 2 | LC — FAQ opened | **283077** | `faq_open` | `exact /control-xl` (added 2026-07-24 — was unscoped before) | NO |
| 3 | DF — FAQ opened | **294072** | `faq_open` | `exact /dynamic-focus` (created 2026-07-23) | NO |

**Per-page counts (60d window, owner excl.):** DF=43, `/` historical=24, LC=15. Total=82 = "Site — FAQ opened" rollup.

**LC and DF are non-overlapping confirmed:** spot-check across 50 days — no single calendar day ever has both LC>0 and DF>0 simultaneously. `Site — FAQ opened` = LC + DF + historical-root (no double-counting). ✅

**Not pinned** (per standing pattern: DF/LC/SF non-buy actions all unpinned — only Buy click actions in Goals tile). The 5th mystery-row "DF — FAQ opened" PostHog auto-surfaces in Goals tile is coming from the real 294072 action having today's activity — not a config bug.

**Insight RikP9Cee update (2026-07-30):** The old single bad `CXL — FAQ opened` column replaced with 3 columns: `Site — FAQ opened` / `LC — FAQ opened` / `DF — FAQ opened` — with proper pathname conditions in the `sumIf`. chartSettings.yAxis updated accordingly. Total columns: 19 (was 17).

Links:
- [Site — FAQ opened action 300738](https://us.posthog.com/project/458316/data-management/actions/300738)
- [LC — FAQ opened action 283077](https://us.posthog.com/project/458316/data-management/actions/283077)
- [DF — FAQ opened action 294072](https://us.posthog.com/project/458316/data-management/actions/294072)
- [RikP9Cee — All goals — firing counts](https://us.posthog.com/project/458316/insights/RikP9Cee)

### Narrower hypothesis tested and REJECTED (2026-07-08, same session): "the 4 CXL actions were duplicated broken"
Owner sharpened the report: the 5 visible = exactly SF ×4 + Mode download; the 4 MISSING are
exactly the 4 just-created CXL actions (285962/63/64/65). Hypothesis: bad duplication from the
SF template left them empty/malformed. **Checked directly, both angles came back clean:**
- **Steps structurally intact** — re-ran `action-get` on all 4 individually: each has a
  non-empty `steps` array, correct event name (`buy_click`/`video_play`/`footer_cta_view`+
  `cta_view`/`section_view`), correct `$pathname exact /control-xl` filter (no stray slash, no
  typo), 285964 correctly carries the two-step OR span mirroring 280502/285587. Side-by-side
  with the working SF actions, the only difference is the `$pathname` value, as intended.
- **Volume is real, not zero** — `query-trends` with `ActionsNode` on all 4 CXL ids (30d):
  Buy click 2, Video play 4, Footer CTA view 3, Video section view 8 (July bucket) — matches
  the pre-creation `$pathname` breakdown numbers exactly. These actions DO fire on real events.
- So the duplication was clean; this is NOT a corrupted-Action-config bug.

**Refined diagnosis:** the one real difference between the visible 5 and the invisible 4 is
**recency of the pin** — SF was pinned 2026-07-07 (a day earlier), CXL was pinned minutes
before the owner looked at the tile in this same session. This points more precisely at a
stale client-side cache of "which action IDs are pinned" (fetched once, not re-fetched after
the API-side pin changes), rather than a generic random front-end flakiness. Recommended test:
hard refresh / new tab/incognito on `/web` — if the 4 CXL goals appear after a clean reload,
it confirms pure staleness and no further action is needed on the config side.

Related: action inventory + goal descriptions in [[posthog-access]].
