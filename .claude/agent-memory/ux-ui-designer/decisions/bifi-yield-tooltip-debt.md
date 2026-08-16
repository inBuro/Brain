---
name: bifi-yield-tooltip-debt
description: Yield tooltip (MOCA-USDC) in Bifi product file is a raw-value one-off, not a DS Tooltip instance — partially closed 2026-07-06, full rebind pending
metadata:
  type: project
---

Frame `Tooltip — Yield (MOCA-USDC, both)` (node `40009211:5235`, product file `fLrH3120KL4aNrtSBwi2rT`) is a one-off frame built entirely with raw values — no color or typography variable bindings anywhere in the subtree (`get_variable_defs` on the whole node returned empty), despite the file having the "v2.4 Beefy Design System" library subscribed with matching semantic/typography tokens available (e.g. `Semantic/color/txt/tertiary/tertiary - default`, `Typography/float/fontSizes/fontSize-sm`). It is also not an instance of the DS `Tooltip` component set (`beb70f8ec841ea8be7a61d2d72ed400bf9013137`) — it's built from plain frames/text/ellipses directly in the product file. Existing caption sizes (12.5px, 11.5px) don't even match the DS type scale (12px/10px), suggesting this was hand-tuned outside the token system from the start.

2026-07-06 session did a scoped edit here (reward-mode copy de-personalized, radio-selection semantics removed, APY/APR explainer line added — see product-manager/launch-journal or git history for the actual content diff). Per "close debt immediately" rule, the **new/edited node only** (the APY-vs-APR hint text) was bound properly: `fontSize` → `Typography/fontSize-sm` (key `8375d08befbb2258f9e23b0f6518e19bc64e36c1`), fill → `Semantic/txt/tertiary/tertiary - default` (key `466b3718eaee24b431967979234e5da4672ff2f9`). The pre-existing unbound nodes (headline, both mode-row labels/values, both mode-row captions, both footer disclaimer lines, the cloned "Current" badge) were deliberately left as-is.

**Why not closed in full:** rebinding every pre-existing text/color in this frame is a full DS-conformance pass across ~15 nodes, not something the session's actual ask (3 specific copy/semantic edits) called for. Doing it anyway would be unrequested scope creep (see [[feedback_no_unrequested_style_changes]] equivalent principle) and risks introducing visual drift (12.5px → 12px, etc.) nobody signed off on.

**How to apply:** next time this tooltip is touched for any reason, treat the full rebind as in-scope and do it then (don't let it compound further). If a full audit is explicitly requested, scope = every TEXT node's fontSize/fontWeight/fill + every FRAME/ELLIPSE fill in node `40009211:5235`, mapped against the "v2.4 Beefy Design System" Semantic + Typography collections (both confirmed subscribed via `get_libraries` on `fLrH3120KL4aNrtSBwi2rT`).

**Status:** open, low priority, waiting for the next legitimate touch of this specific tooltip (no deadline set).

## Round 2 — 2026-07-06, header restructure

Same session, follow-up ask: make the tooltip shorter for mobile + copy cleanup. Four changes, all accepted:

1. **Merged the title row into the headline row.** Coordinator's stated premise ("Yield label and header Current badge are on separate rows") did not match the file — `get_metadata` showed they were already one row (`40009211:5236`) both before and after round 1. Flagged this mismatch, then re-read the ask by its actual goal (reduce tooltip height for mobile) rather than its literal wording, since a no-op wouldn't have served that goal. Merged the *title row* (`40009211:5236`: Yield + Current) with the separate *headline row* (`40009211:5240`: 33.57% / APY) into one `SPACE_BETWEEN` row — real ~38px height save (77px combined → 39px). New row id **`40009220:1147`** (replaces old `40009211:5236`, now deleted). Children `40009211:5237` (Yield), `40009211:5240` (value group), `40009211:5238` (badge) were reparented, not recreated — no restyle.
   - **Gotcha hit:** the value-group (`40009211:5240`) had stale `layoutSizingHorizontal: FILL` left over from being a direct 304px-wide child of root. Reparenting into the new hug-sized row caused it to keep trying to fill 304px, pushing the Current badge off-canvas (invisible in the first screenshot). Fix: explicitly set `layoutSizingHorizontal = 'HUG'` on it post-reparent. **Lesson: after `appendChild`-ing an existing (not newly-created) node into a new auto-layout parent, always re-check/reset its `layoutSizing*` — it does not get reset automatically and can silently break the new parent's layout.**
2. Hint line (`40009219:1149`) now spells out both acronyms on first use: "APY (Annual Percentage Yield) includes compounding; APR (Annual Percentage Rate) doesn't — that's the gap above". Same node, no new block added.
3. Removed the duplicate row-level "Current" badge that round 1 had added next to Auto-compound (`40009219:1147`, the clone — note this id number is coincidentally close to but distinct from the new header row id `40009220:1147` created in the same round; don't confuse them). Only one Current badge remains, now in the merged header row.
4. Dropped trailing periods on the hint (`40009219:1149`) and the footer disclaimer (`40009211:5261`); mid-paragraph periods left untouched.

**Current node map for this frame (as of round 2, supersedes round-1 ids where noted):**
- Header/headline row (merged): `40009220:1147` → Yield `40009211:5237`, value group `40009211:5240` (33.57% `40009211:5241` + APY `40009211:5242`), Current badge `40009211:5238` (text `40009211:5239`)
- `net · auto-compounded`: `40009211:5243`
- Divider: `40009211:5244`
- "By reward mode": `40009211:5245`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250` (no more row-level badge), value `40009211:5251`; caption `40009211:5252`
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259`
- APY/APR hint: `40009219:1149`
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**How to apply:** trust this map over the round-1 one in this file if they ever conflict. Before touching this frame again, re-verify with `get_metadata` anyway — node ids that get reparented/recreated in Figma churn easily, and a coordinator-stated premise about current layout should always be checked against `get_metadata`/a screenshot before acting on it, even when it sounds plausible.

## Round 3 — 2026-07-06, header collapsed to one label, hero number dropped, perf fee spelled out

Same session, follow-up ask: remove information duplication, get denser still. Three changes, all accepted:

1. **Current badge + Yield label → one text layer.** The round-2 header row (`40009220:1147`: Yield text + hero value-group + Current badge) is gone. `40009211:5237` was reparented directly onto root (no wrapper frame), its characters changed `"Yield"` → **`"Current Yield"`**, `layoutSizingHorizontal` set to `FILL` to match sibling convention. The badge pill (`40009211:5238`/`5239`) and the hero value-group (`40009211:5240`/`5241`/`5242`) were deleted in one cascade by removing the now-empty `40009220:1147` wrapper after pulling the text out of it — no separate delete calls needed.
2. **Hero number removed as a duplicate of the Auto-compound row's own number** (both were 33.57% APY — same figure, same meaning: current mode = auto-compound). Also removed `40009211:5243` ("net · auto-compounded") — once the hero number was gone this caption had nothing left to qualify, and its content (net-of-fee, auto-compound mechanism) is already carried by the Auto-compound row's own caption + the footer basis line. Chose **not** to keep it "just in case" — a caption anchored to nothing is worse than no caption.
   - **Current-mode indicator, no pill:** rather than a badge or a size/weight bump on the row value (both discussed with the coordinator as options), added the word **"current"** as the first token of the Auto-compound row's own caption — reuses an existing text node, zero new nodes, unambiguous regardless of how closely someone reads relative font sizes. This is now the *only* place "current" is signaled anywhere in the frame.
3. **`perf fee` → `performance fee`**, both occurrences: Auto-compound caption and the footer basis line (see final text below). Checked every other text node in the frame — no other occurrences.

**Final copy of the two rewritten captions:**
- Auto-compound caption (`40009211:5252`): `"current · auto-reinvested · −9.5% performance fee"`
- Footer basis line (`40009211:5262`): `"Current-rate basis · performance fee 9.5%"`

**Current node map for this frame (as of round 3, supersedes round-2 header entries):**
- Header label (was row + hero number + badge, now just this): `40009211:5237` — text **"Current Yield"**, direct child of root, `FILL` width
- Divider: `40009211:5244`
- "By reward mode": `40009211:5245`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY" — now the *only* place this number appears); caption `40009211:5252` (carries the "current" marker)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259`
- APY/APR hint: `40009219:1149`
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**Removed for good (round 2 ids, do not reference):** `40009220:1147` (header row wrapper), `40009211:5238`/`5239` (Current badge + its text), `40009211:5240`/`5241`/`5242` (hero value-group), `40009211:5243` (net · auto-compounded subline).

**How to apply:** trust this map over both round-1 and round-2 maps in this file. The frame has shrunk by a full row+badge+subline across three rounds — if a fourth round touches the header again, re-verify with `get_metadata` first rather than assuming any prior round's map is still accurate.

## Round 4 — 2026-07-06, heading + section label merged, hint trimmed, ambiguous "current" removed

Same session, follow-up ask: cut one more row of height, tighten copy. Three changes, all accepted:

1. **"Current Yield" heading + "By reward mode" section label → one intro row.** Both were previously separate direct children of root, stacked with a divider between them. Created a new row frame **`40009224:329825`** (`HORIZONTAL`, `SPACE_BETWEEN`, `counterAxisAlignItems: 'BASELINE'`), reparented both existing text nodes into it (`40009211:5237` "Current Yield" left, `40009211:5245` right — recased to **"by reward mode"**, lowercase, reads as a trailing descriptor rather than a competing heading). Both set to `layoutSizingHorizontal: 'HUG'` post-reparent (per the round-2 lesson — reparented nodes keep stale sizing otherwise), row itself set to `FILL`. No new text nodes, no restyle — same node ids, same fonts/colors, just recomposed. The divider (`40009211:5244`) still sits right after this row, now separating the intro block from the mode list instead of separating the two texts from each other.
2. **Hint trimmed:** `40009219:1149` dropped the trailing "— that's the gap above" (redundant — the two numbers sit right above it). Final: `"APY (Annual Percentage Yield) includes compounding; APR (Annual Percentage Rate) doesn't"` (no trailing period, per house rule).
3. **Removed "current ·" from the Auto-compound caption** (`40009211:5252`) — it collided with two other, unrelated uses of "current" in the frame ("Current Yield" heading, "Current-rate basis" footer, both about calculation basis, not about which reward mode is active). Final: `"auto-reinvested · −9.5% performance fee"`. Decided **no replacement marker** — this block reads as a comparison of two modes, not a selection, and Auto-compound being listed first already carries the "this is the primary one" signal without a word doing double duty.

**Current node map for this frame (as of round 4, supersedes round-3 header entry):**
- Intro row: `40009224:329825` → "Current Yield" `40009211:5237` (heading), "by reward mode" `40009211:5245` (muted, lowercase)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"auto-reinvested · −9.5% performance fee"` (no marker)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259`
- APY/APR hint: `40009219:1149` = `"APY (Annual Percentage Yield) includes compounding; APR (Annual Percentage Rate) doesn't"`
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**How to apply:** trust this map over round-1/2/3 maps. Four rounds in, the frame keeps losing rows/words each time — before any future round, re-verify structure with `get_metadata` rather than trusting any prior map blind, this one included.

## Round 5 — 2026-07-06, intro row turned into a real table header + caption parallelism

Same session, final ask: make the (already de-facto two-column) block read as an actual table, plus one copy-parallelism fix. Three changes, all accepted:

1. **Intro row → table header.** The round-4 intro row (`40009224:329825`) held a heading ("Current Yield") + a muted trailing descriptor ("by reward mode"). Turned it into two column headers over the existing two-column body:
   - Column 1 (`40009211:5245`): text `"by reward mode"` → **`"Reward Mode"`**, left-aligned, style untouched (was already the muted tertiary 12px Bold treatment a table header needs).
   - Column 2 (`40009211:5237`): text unchanged (**"Current Yield"**), but *restyled down* to match column 1's muted style — copied `fontName`/`fontSize`/`fills`/`letterSpacing`/`lineHeight`/`textCase` from `40009211:5245` onto it (was Bold/15px/white — a heading treatment that would have outranked the column-1 label; a table header shouldn't be bigger than its sibling header). Reordered to be the row's *second* child (`headerRow.insertChild(0, textBRM)` pushed "Reward Mode" to index 0) so `SPACE_BETWEEN` places it flush right — its right edge (x=225+width 79=304) now lines up exactly with both value cells' right edges (also flush to 304). No new nodes; both existing text nodes reused, just retexted/restyled/reordered. Row renamed to **"Table header"** (layer name only, not visible content — doesn't conflict with the "no added labels" rule, which is about visible captions/badges, not internal layer naming).
   - **Zebra/column-1 background — explicitly skipped.** Considered (coordinator left it to judgment). Both row captions (`40009211:5252`, `40009211:5259`) span the full 304px row width, not just the column-1 zone under the mode-name label. A background confined to column 1 would end mid-caption, visually cutting it off — "grazing dirty" was the explicit bar for skipping, and this cleared it. Would require restructuring both rows into a true column-confined grid (narrowing captions to ~119px and accepting different wrapping) to do cleanly — bigger structural change than this round's ask, not attempted.
2. **Caption token-order parallelism.** Auto-compound's caption (`40009211:5252`) already leads with its reinvest descriptor: `"auto-reinvested · −9.5% performance fee"` (untouched this round). Manual claim's caption (`40009211:5259`) did not — reordered tokens only (no wording changes): `"claimable · manual reinvest · no fee"` → **`"manual reinvest · claimable · no fee"`**. Both captions now lead with the reinvest descriptor, so the two rows scan as structurally parallel.

**Current node map for this frame (as of round 5, supersedes round-4 intro-row entry):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245` (left, over mode names), "Current Yield" `40009211:5237` (right, over values, muted style matching column 1)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"auto-reinvested · −9.5% performance fee"`
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"manual reinvest · claimable · no fee"`
- APY/APR hint: `40009219:1149` = `"APY (Annual Percentage Yield) includes compounding; APR (Annual Percentage Rate) doesn't"`
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**How to apply:** trust this map over round-1/2/3/4 maps. If a zebra/column background is ever revisited, it needs the caption-width restructure noted above done first — don't bolt a background onto the current full-width-caption layout.

## Round 6 — 2026-07-06, compounding became an explicit caption parameter, hint line removed

Same session, coordinator's framing: make auto-compound-or-not an explicit parameter in the row captions so the APY-vs-APR difference reads straight out of the table, then the separate explainer line is redundant. Two changes, both accepted:

1. **Compounding as a parallel, non-tautological caption parameter.** New shared schema across both rows: `[reinvest mechanism] · [compounding status] · [fee]`.
   - Auto-compound (`40009211:5252`): `"auto-reinvested · −9.5% performance fee"` → **`"auto-reinvested · rewards compound · −9.5% performance fee"`**
   - Manual claim (`40009211:5259`): `"manual reinvest · claimable · no fee"` → **`"manual reinvest · rewards don't compound · no fee"`**
   - Deliberately avoided `"auto-reinvested · compounding"` (flagged by the coordinator as tautological — restates the same fact via a near-synonym). `"rewards compound"` / `"rewards don't compound"` states the *rate math consequence* (why one is APY and the other APR), not the mechanism itself.
   - **Footer-consistency check:** the word "rewards" is doing real work here — it's there specifically so this can't be misread against the footer disclaimer (`40009211:5261`, unchanged): `"Trading fees compound in both modes. Mode only changes what happens to incentive rewards"`. Trading-fee compounding is untouched/always-on; only the *reward* rate's compounding differs by mode. The caption wording now echoes the footer's own phrase ("incentive rewards") instead of contradicting it.
2. **Hint line removed entirely.** `40009219:1149` (`"APY (Annual Percentage Yield) includes compounding; APR (Annual Percentage Rate) doesn't"`) deleted. This also drops the spelled-out acronym expansion added back in round 2 — an explicit, accepted tradeoff: the coordinator judged that the new caption parameter now carries the "why APY vs APR" explanation the hint used to provide, so the separate line became pure redundancy. Did not block on "acronym expansion is now gone" since the underlying comprehension goal (why the two numbers differ) is still met without it.

**Current node map for this frame (as of round 6, supersedes round-5 caption text + removes the hint entry):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245`, "Current Yield" `40009211:5237`
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"auto-reinvested · rewards compound · −9.5% performance fee"`
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"manual reinvest · rewards don't compound · no fee"`
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**Removed for good (do not reference):** `40009219:1149` (APY/APR hint line — deleted, not just edited).

**How to apply:** trust this map over round-1 through round-5 maps. The frame no longer has a dedicated APY/APR explainer — if a future round reintroduces acronym confusion as a problem, the fix belongs in the caption parameter language (already established: `rewards compound` / `rewards don't compound`), not a new standalone hint line, unless the coordinator explicitly wants the line back.

## Round 7 — 2026-07-06, table header recolored white, reinvest tokens get accent color + consistent wording

Same session, final batch: three changes, all accepted.

1. **`Reward Mode` header → primary/white.** `40009211:5245` fill rebound from its prior raw tertiary fill to **`Semantic/txt/primary/primary - default`** (key `5451914265faf2c7dea3ba694024e05458d8d5b1`). `Current Yield` (`40009211:5237`) matched to the same token by default (coordinator's stated default). Checked for competition against the bold-white row values (`33.57% APY`/`31.87% APR`, 15px) below — kept both headers white: they're 12px (smaller than the 15px values) and sit above a divider, so size + position still carry the hierarchy even with matching hue. Didn't revert to muted.
2. **Reinvest-token accent color, per row.** DS has no dedicated `primary accent`/`secondary accent` semantic tokens — searched `accent`, `brand`, `action/cta`, `highlight`, all empty. Closest legitimate **semantic** (not raw, not a `Primitives` ramp) match: the `Semantic/graphs/*` family (`graphGreen`, `graphBlue`, `graphCyan`, `graphGrey`…), built for telling multiple data series apart — same job as "primary vs secondary accent" here. Used:
   - Auto-compound caption (`40009211:5252`) reinvest token → **`Semantic/graphs/graphGreen`** (key `b8ea0cf6ba27b7466ce41fc079a8fe0e2ccf9d27`) as the "primary" accent — green also happens to be Beefy's brand hue.
   - Manual claim caption (`40009211:5259`) reinvest token → **`Semantic/graphs/graphBlue`** (key `f4332d6b9cf77852014b24c9466b5f95b546b361`) as the "secondary" accent.
   - Applied via `setRangeFills` on just the token's character range — rest of each caption kept its pre-existing (still-unbound, still-documented-debt) tertiary fill untouched.
   - Flagged this substitution explicitly to the coordinator rather than silently treating `graphs/*` as equivalent to a real accent token — see DS-gap note below.
3. **Reinvest-token wording made consistent.** `auto-reinvested` (hyphen, past tense) → **`auto reinvest`** (space, present tense) in `40009211:5252`, matching `manual reinvest`'s existing form in `40009211:5259` (unchanged). Both tokens stay first in their caption — parallelism from round 5 preserved.

**Final copy + color of the two captions:**
- Auto-compound (`40009211:5252`): `"auto reinvest"` (green, `graphs/graphGreen`) `" · rewards compound · −9.5% performance fee"` (tertiary, unchanged)
- Manual claim (`40009211:5259`): `"manual reinvest"` (blue, `graphs/graphBlue`) `" · rewards don't compound · no fee"` (tertiary, unchanged)

**Current node map for this frame (as of round 7, supersedes round-5/6 header-fill + caption-text entries):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245` (white, `txt/primary`), "Current Yield" `40009211:5237` (white, `txt/primary`, matched)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"auto reinvest · rewards compound · −9.5% performance fee"` (reinvest token green)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"manual reinvest · rewards don't compound · no fee"` (reinvest token blue)
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262`

**How to apply:** trust this map over round-1 through round-6 maps. Seven rounds in — always `get_metadata` before touching this frame again; don't assume any map, including this one, is still current.

## Round 8 — 2026-07-06, footer fee duplicate removed

Same session, one small edit, accepted:

1. **Footer basis line trimmed.** `40009211:5262`: `"Current-rate basis · performance fee 9.5%"` → **`"Current-rate basis"`**. The `9.5%` performance-fee figure was a duplicate — it's already stated in the Auto-compound row's own caption (`40009211:5252`). Only `characters` changed; style/structure untouched.

**Current node map for this frame (as of round 8, supersedes round-7 footer-basis-line entry):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245` (white, `txt/primary`), "Current Yield" `40009211:5237` (white, `txt/primary`)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"Auto Reinvest · rewards compound · −9.5% performance fee"` (reinvest token green — see casing note below)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"Manual Reinvest · rewards don't compound · no fee"` (reinvest token blue — see casing note below)
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262` = `"Current-rate basis"` (fee figure removed, no trailing period)

**Casing note — reinvest tokens are intentionally Title Case, do not lowercase.** Round 7 set both reinvest tokens lowercase (`"auto reinvest"` / `"manual reinvest"`) via script — confirmed via that round's own logged `use_figma` calls. Sometime after round 7 completed and before round 8 was checked, both `40009211:5252` and `40009211:5259` were found reading **`"Auto Reinvest"`** / **`"Manual Reinvest"`** (Title Case) instead. Inspected both nodes directly: `textCase` is `ORIGINAL` on the whole node and on every range (no display-level transform/capitalize style is applying this) — the literal stored `characters` string itself is Title Case. Since `.characters =` via the plugin API sets the exact string given (round 7's script demonstrably wrote lowercase and nothing in this session's own logged calls touched these two nodes' text again before round 8), the casing change happened through a channel outside this session's scripted edits — almost certainly a direct manual edit in the Figma editor between rounds. **Decision (coordinator, 2026-07-06): keep Title Case as-is — treat as a manual user edit, do not revert to lowercase on future touches of this frame**, consistent with the general "don't touch user-edited shapes" rule. If either caption's text is edited again for unrelated reasons, preserve the `Auto Reinvest` / `Manual Reinvest` capitalization on the reinvest token specifically.

**How to apply:** trust this map over round-1 through round-7 maps.

## Round 9 — 2026-07-06, footer basis line de-jargonned

Same session, one small edit, accepted — then this pass on the tooltip was closed by the coordinator:

1. **Footer basis line rewritten in plain language.** `40009211:5262`: `"Current-rate basis"` → **`"Rates vary over time"`**. Reason: "Current-rate basis" was jargon that didn't communicate its actual job (this is the variable-yield disclaimer — the quoted rate isn't fixed). Only `characters` changed; style/structure/position untouched, no trailing period.

**Current node map for this frame (as of round 9, supersedes round-8 footer-basis-line entry):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245` (white, `txt/primary`), "Current Yield" `40009211:5237` (white, `txt/primary`)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"Auto Reinvest · rewards compound · −9.5% performance fee"` (reinvest token green, Title Case is intentional — see round-8 casing note)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"Manual Reinvest · rewards don't compound · no fee"` (reinvest token blue, Title Case is intentional — see round-8 casing note)
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262` = `"Rates vary over time"`

**Status: this pass on the tooltip is closed (coordinator, 2026-07-06).** Nine rounds total this session — table-ified header, parallel captions with compounding + accent-color parameters, de-jargonned footer. Next session touching this frame: `get_metadata` first regardless, per the standing rule in every round above.

## Round 10 — 2026-07-06, hanging bullet removed from both captions

Coordinator flagged that `40009211:5252`/`40009211:5259` had been hand-edited by the user after round 9 (independent of any script in this file) — read actual `characters` fresh before touching anything, per instruction. One edit, accepted, then this pass closed again:

1. **Removed the bullet separator that sat right before the fee clause** in both captions (the one *after* "compound"/"don't compound" — the first bullet, right after "Auto Reinvest"/"Manual Reinvest", was left alone). Exact strings read from the nodes before editing:
   - `40009211:5252`: `"Auto Reinvest · rewards compound ·  9.5% performance fee"`
   - `40009211:5259`: `"Manual Reinvest · rewards don't compound ·  no performance fee"`
   Final strings after editing:
   - `40009211:5252`: `"Auto Reinvest · rewards compound"` + U+2028 + `"9.5% performance fee"`
   - `40009211:5259`: `"Manual Reinvest · rewards don't compound"` + U+2028 + `"no performance fee"`

2. **Important finding — U+2028, not a space, not `\n`.** What read as a double-space in the raw string dump was actually **one regular space + one U+2028 (LINE SEPARATOR) character**, already present from the user's manual edit — i.e. the user had *already* soft-broken the fee clause onto its own line; only the stray "·" + its flanking regular space hadn't been cleaned up yet. First pass on this didn't detect U+2028 as whitespace (only checked for literal `' '`), so it inserted an *additional* `\n` on top of the existing U+2028 — this produced a double line-break with the U+2028 surviving as an invisible leading character on the second line. Caught via character-code inspection (`codePointAt`), fixed by deleting only the erroneously-inserted `\n` and leaving the original U+2028 as the sole line break. Net result has exactly one line break per caption, sourced from the user's own edit, not a new one authored by a script.
   - **If these captions are ever edited again:** read `characters` with `codePointAt`/char-code inspection before assuming plain spaces — the separator before the fee clause is U+2028, not `' '` (0x20) and not `'\n'` (0x0A). Don't add a second line break on top of it.

3. **Current copy is a manual user edit — do not revert.** The no-minus-sign `9.5%` (was `−9.5%` in round 7) and the `"no performance fee"` wording (was `"no fee"` in round 7) in these two captions were changed by the user directly in Figma at some point after round 9, outside any script in this file. Per the coordinator's standing instruction (consistent with the round-8 casing note), **treat this as intentional and do not roll back to the round-7/9 wording** on future touches.

**Current node map for this frame (as of round 10, supersedes round-9 caption entries):**
- Table header: `40009224:329825` → "Reward Mode" `40009211:5245` (white, `txt/primary`), "Current Yield" `40009211:5237` (white, `txt/primary`)
- Divider: `40009211:5244`
- Auto-compound row: `40009211:5246` → label row `40009211:5247` → label `40009211:5250`, value `40009211:5251` ("33.57% APY"); caption `40009211:5252` = `"Auto Reinvest · rewards compound"` + U+2028 + `"9.5% performance fee"` (reinvest token green, Title Case + no-minus + "performance fee" wording + U+2028 break all intentional manual edits — do not revert any of it)
- Manual claim row: `40009211:5253` → label row `40009211:5254` → label `40009211:5257`, value `40009211:5258`; caption `40009211:5259` = `"Manual Reinvest · rewards don't compound"` + U+2028 + `"no performance fee"` (reinvest token blue, same manual-edit caveats apply)
- Divider: `40009211:5260`
- Footer disclaimer: `40009211:5261`
- Footer basis line: `40009211:5262` = `"Rates vary over time"`

**Status: this pass on the tooltip is closed again (coordinator, 2026-07-06).** Ten rounds total this session. Next touch of this frame: `get_metadata` first, and specifically re-read `40009211:5252`/`40009211:5259` character-by-character (not just visually) before editing — this frame has now twice diverged from what any prior round's map recorded, via direct manual edits outside this file's own script history.
