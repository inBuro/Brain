---
name: feedback-color-transparency-policy
description: Permanent policy for M4L colors — touch only on explicit request, never repaint user colors, never strip alpha<1 transparency. Read before any color/hex edit.
metadata:
  type: feedback
---

# M4L colors & transparency — permanent policy (founder, 2026-06-24)

## Rule 1 — colors only on explicit request, never proactive
Do NOT clean/repaint/normalize M4L colors on your own initiative. Only when the founder explicitly
asks, for a **specific named element**. When asked: use **only Live palette tokens** (`themecolor.*`),
and show **before/after in chat before applying**. **Never repaint a color the user set himself.**

**Why:** founder hand-tunes the device colors across many Max re-saves; proactive cleanup overwrites
his deliberate choices. (Incident 2026-06-24: a blanket hex cleanup stripped intentional transparency.)
**How to apply:** any task that says "clean hex" / "fix colors" → scope to exactly what's asked, confirm
the element, show before/after, keep every binding the user set.

## Rule 2 — transparency (alpha < 1) is a PROTECTED user layer
Distinguish two kinds of color literals:
- **alpha = 1 under a theme binding** = Max auto-materialized fallback (junk) — may be removed during an
  explicit hex cleanup.
- **alpha < 1 (especially alpha = 0)** = **intentional user transparency** (hides/de-fills the element).
  **NEVER strip or repaint it.** Any hex cleanup MUST preserve alpha<1 literals untouched.

**Why:** alpha-0 `bgcolor`/`bgfillcolor_color`/`bubble_bgcolor` etc. = the element is deliberately
no-fill (transparent button bg, dial blended into the LCD, label with no bubble). Removing them returns
an opaque theme default → an unwanted fill appears. (Incident 2026-06-24: blanket cleanup deleted
alpha-0 on Track `version_link.bgcolor/bgoncolor`, `obj-3(dial).bgcolor`, `send_label.bubble_bgcolor/
bubble_outlinecolor`; Return `version_link.bgcolor/bgoncolor`, `obj-3.bgcolor` — all intentional
transparency, wrongly stripped.)
**How to apply:** before deleting any `*color*` literal, check `v[3]` (alpha). If `< 0.999`, KEEP it.
Only delete alpha==1 literals that sit under a non-empty theme binding.

## Research — how to make an M4L element transparent via the Live palette (verified by grep of stock M4L)
- **There is NO "transparent"/"none" theme token.** No `themecolor.*` resolves to transparent.
- **The stock idiom for no-fill / transparency is a per-element `bgcolor` (or `bgfillcolor_color`)
  literal with alpha = 0.** Confirmed across stock M4L patchers: 172 umenu, 148 umenu bgfillcolor,
  21 textbutton, 21 panel, 17 live.text, etc. all use literal alpha-0 `bgcolor`.
- So **per-element alpha-0 literal IS the canonical, correct way** — it is NOT a hack. The clean
  approach the founder wants = keep the alpha-0 literal (the element stays transparent) AND, if a
  visible color is also needed elsewhere on the same element, bind THAT slot to a `themecolor.*`. The
  transparent slot has no token equivalent; the alpha-0 literal is correct and must be preserved.

## Practical cleanup recipe (when explicitly asked to remove hex)
1. For each box, for each `*color*` array literal: if `alpha (v[3]) < 0.999` → **KEEP** (intentional).
2. If `alpha == 1` AND the same attribute has a non-empty `themecolor.*` binding in
   `saved_attribute_attributes` → safe to delete (Max fallback under a binding).
3. If `alpha == 1` and NO binding → ask before deleting (could be a user's opaque choice without a token).
4. Never add/remove bindings the user set; show before/after.
