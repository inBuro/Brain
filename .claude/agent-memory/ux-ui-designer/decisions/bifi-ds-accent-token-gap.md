---
name: bifi-ds-accent-token-gap
description: Beefy DS has no semantic primary/secondary accent color tokens — graphs/* palette used as a stand-in once, candidate for a real DS addition
metadata:
  type: project
---

The "v2.4 Beefy Design System" (`vBAfvod9AWpHeyJi2yu2Eh`) has no dedicated semantic **accent** color tokens — no `primary accent` / `secondary accent` (or equivalently named `brand/*`, `action/cta`, `highlight/*`) pair for "give this piece of UI a brand-colored emphasis that isn't a button." Searched `search_design_system` for `accent`, `brand`, `action interactive cta button fill`, `highlight link accent green` — all returned empty against the DS library.

What *does* exist: `txt/primary|secondary|tertiary|fourth` (text-role hierarchy, not brand-colored), raw `Primitives/color/green/*`, `darkBlue/*`, `lightBlue/*` ramps (not semantic), and — the closest real semantic match — **`Semantic/graphs/*`** (`graphGreen`, `graphBlue`, `graphCyan`, `graphGrey`, `graphDarkGrey`, `graphWhite`, `graphGrey-32a`): a small palette clearly scoped for telling multiple chart/graph data series apart.

**Where this surfaced:** 2026-07-06, Bifi product file `fLrH3120KL4aNrtSBwi2rT`, Yield tooltip round 7 (`decisions/bifi-yield-tooltip-debt.md`) — needed to color-code two comparison tokens ("auto reinvest" vs "manual reinvest") as primary/secondary emphasis. Used `graphs/graphGreen` for primary and `graphs/graphBlue` for secondary, since they're the nearest **semantic** (not raw, not primitive-ramp) tokens that do the job of "distinguish two related things by color" — reusing a graph-series palette for inline text emphasis outside of any chart.

**Why this is a gap, not just an ad-hoc choice:** `graphs/*` is scoped (by name and presumably by design intent) to chart/graph rendering. Borrowing it for text-emphasis works visually but semantically overloads it — a future chart added to the same screen using `graphGreen`/`graphBlue` for its own series would coincidentally collide in meaning with this usage. A real fix is a proper `accent/primary`, `accent/secondary` (or `emphasis/*`) pair in the Semantic collection, decoupled from the graphs palette.

**How to apply:** if another surface needs a primary/secondary (or tertiary) accent color for non-button, non-graph emphasis, don't default to re-borrowing `graphs/*` a second time without flagging it again — that's the signal this has become a real pattern, not a one-off, and the DS-level token should get built (new task, not a tooltip-scoped fix). Whoever owns the Beefy DS file should be looped in before adding more consumers of `graphs/*` outside of actual graphs.

**Status:** open, no owner assigned, no deadline. Low urgency until a second consumer shows up.
