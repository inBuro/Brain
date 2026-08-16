---
name: bifi-tag-gradient-gap
description: Beefy DS Tag component only has 2 variants (Green inline / Yellow floating) — no combo/mixed variant for "holds both reward modes"; resolved via two adjacent raw badges, not a gradient
metadata:
  type: project
---

The "v2.4 Beefy Design System" `Tag` component set (`vBAfvod9AWpHeyJi2yu2Eh`, local id in product file `40008881:559341`) has exactly two variants: `Property 1=Green inline` (bound to `Semantic/notifications/confirmation-bg|fg`, used for Auto-compound) and `Property 1=Yellow floating` (bound to `Semantic/notifications/teaser-bg|fg`, used for Claim myself). No third "combo"/"mixed" variant exists.

**Where this surfaced:** 2026-07-07, Bifi product file `fLrH3120KL4aNrtSBwi2rT`, CLM Pool+Vault merge dashboard row (see `panel-anatomy.md`-style history, node `40009249:23068` = Block 3 header row). A user holding both Auto-compound and Claim-myself positions on the same merged CLM needs the header row to signal "both modes present."

**Two things were considered and rejected before landing on the resolution:**
1. A literal two-stop gradient badge (green→tan) — rejected. Figma `GradientPaint` stops don't support `boundVariables` the way `SolidPaint` does, so a gradient would have to bake in raw RGBA copied from the resolved token values at creation time and silently drift if the source Semantic Variables ever change. Also would have required inventing a new component variant outside the DS owner's process.
2. Waiting on a DS-level third variant before touching the artboard — rejected by the coordinator as blocking; the phase's actual working rule (below) removed the need for a formal variant at all.

**Resolution (coordinator decision, 2026-07-07):** for this phase, mockups are built with raw elements, not component instances — so the fix isn't "add a DS variant," it's two separate small badges placed side by side on the header: green "Auto-compound" + tan "Claim myself" pill, each a plain auto-layout frame + text (not a `Tag` instance), with paints copied directly from the real `Green inline`/`Yellow floating` instances (`40009249:22937` / `40009249:22945`) so both still resolve to the same `Semantic/notifications/*` variables — no raw hex, no invented gradient, no new component. Reads as "holds both" more honestly than a blended color would anyway. New nodes: `40009261:1149` (green), `40009261:1151` (tan), both children of `40009249:23084` on header `40009249:23068`.

**How to apply:** if a future screen needs this "holds both X and Y" signal again, default to the same pattern — two small token-bound badges side by side — rather than reaching for a gradient or blocking on a new DS variant. If the DS owner later adds a real third `Tag` variant for this, this is the reference case to migrate onto it (swap the two raw frames for one instance in the header, remove this workaround note).

**Status:** resolved for now via raw-element workaround. Optional follow-up: raise with the DS owner whether a formal combo variant is worth adding, given this is likely to recur anywhere dashboards show "position spans two reward modes."
