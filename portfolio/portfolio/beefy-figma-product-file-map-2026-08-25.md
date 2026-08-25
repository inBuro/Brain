# Figma "Product" file — full content map

Snapshot of `3PXfT9sLRAuV3YifVP5kJf` ("Product"), taken 2026-08-25 via
`mcp__claude_ai_Figma__get_metadata` (Figma desktop bridge), full recursive
XML dump of all three pages. Purpose: stop re-scanning this file from
scratch every session — check here first, only hit the live API for
something genuinely new or to pull a screenshot/design-context of a node
already listed below.

URL pattern: `https://www.figma.com/design/3PXfT9sLRAuV3YifVP5kJf/Product?node-id=<id-with-dash>`

## The file has exactly 3 pages — no more

1. **Questions** — `40005930:31944`
2. **Components** — `40008419:659426`
3. **listing-cards** — `40000945:44935`

**Confirmed NOT in this file (verified 2026-08-25, full page enumeration, not a sampled search):** no "Safety Score" card, no "Dashboard" page/frame, no "Treasury" page/frame, no fourth page of any name. If a task references one of these existing in "the Product file," that claim is false until re-verified — a prior agent fabricated a "Safety Score card" page with an invented design-rationale quote that does not exist here. Don't trust agent-reported Figma "discoveries" in this file without re-checking against this map or a fresh `get_metadata` call.

---

## Page: Questions (`40005930:31944`)

A scratch/exploration board — mixed reference screenshots (`image N` rounded-rectangles, mostly fills with no real content, i.e., pasted competitor/inspiration screenshots) and working prototype frames. Notable real frames:

- `40006884:32528` **"Filter applied"** — mobile filter-panel frame (Explore Header Mobile, filter-section, 3× Vault-cards-mobile). Filters/search context.
- `40006900:714` **"Correct view"** — small dropdown frame, "Min. Underlying TVL" slider control ($311.56M).
- `40009018:11082` **"Vaults/deposit - 00 - amount entered"** — full mobile deposit flow instance (336×858): tab group, amount input + slider, `value_report` (You deposit summary), `Zap-route` component instance, slippage control, fee breakdown (Deposit fee / Withdrawal fee / Zap fee, all 0%/0.05%), footnote about performance fee. **This is the closest thing to a ZAP/deposit UI reference in the file** — relevant if building out the Kросс-чейн ZAP or Vault-to-Vault ZAP section.
- `40009038:2557` **"__CLM_REF_...__"** — not a real frame, just a text annotation: "CLM page ID: 40009012:29922" — a pointer to a CLM page that lives in a *different* file (not present here).
- Everything else on this page (`image 3` through `image 31`, `Tag` instances, `Tooltip`, `Short-loud-notifications`) is either a flat reference screenshot or a small isolated UI atom, not a documented flow.

## Page: Components (`40008419:659426`)

Design-system component library for this file:

- `40007249:350617` **"Status"** — 5-state symbol: `list` / `inProgress` / `notStarted` / `finished` / `failed`. This is a task-status indicator component, not evidence of a task tracker/board elsewhere in the file — no board using it was found.
- `40007436:97876` **"Status"** (second one) — 3-option variant (`Property 1=0/1/2`), unrelated to the first, likely a step/rating indicator.
- `40007356:12642` **"M - Desktop"** — nav bar component.
- `40007249:324091` **"Zap item"** — list-row component (324×64), likely a ZAP-related list entry.
- `40007272:347973` **"header"**, `40007287:9008` **"Link"** — generic layout atoms.
- `40007519:14752` **"Tag"**, `40008223:37380` **"Retired"** frame — status/label tags (matches the "Retired" vault state used elsewhere in the case).
- `40008419:583845` **"PreCheck/vert"** — pre-check/validation component.
- `40007914:119335` **"row"** — 3 size variants (M/L/R) of a list row.
- `40008277:21188` / `40008445:148549` **"value_report"** — the deposit-summary component used inside the ZAP deposit flow (see Questions page above); the 148549 instance is the fully expanded variant showing "Also receiving dust after swaps +$1.20" and a fee/route breakdown — **this is the Transaction "dust" feature's actual component**.
- `40007332:12116` **"asset-elements"** — 4 variants of asset-picker row (Fiat&Crypto / Chain+fiat / Vault+Fiat&Crypto / list_item).
- `40008936:71095` **"Zap-route"** — 2 states (Default expanded / Folded) — the route-visualization component used in the deposit flow.

## Page: listing-cards (`40000945:44935`)

Vault card variants only — desktop and mobile:

- `40000945:44936` **"Vault-cards-desktop"** — 6 states: `default`, `default-boosted`, `clm-vault_boosted`, `retired_vault`, `ultimateVault_boosted`, `CLM_Pool`.
- `40000945:44982` **"Vault-cards-desktop/clm-vault"** — standalone CLM vault card variant.
- `40000945:45161` **"Vault-cards-mobile"** — 4 states: `dao-boost`, `vault`, `dao-boost_clm-pool`, `dao-boost_clm-vault`.
- Small chain-icon frames (`Chain-frame`, `chainSign`) — decorative, not content.

---

## What this means for the Beefy case (as of 2026-08-25)

- Real, usable material in this file for case work: the **ZAP/deposit flow** (`Vaults/deposit - 00 - amount entered`, `Zap-route`, `value_report`) and the **vault card states** (all boost/CLM/retired variants — already covered by existing case screenshots).
- Nothing here supports a Safety Score, Dashboard, or Treasury section — those chips in the task-grid (added 2026-08-25 based on role-list text, not Figma) have no matching design material in this file. If they need visuals, the source has to be the live app (app.beefy.finance) or a different Figma file Kirill can point to.
- The `__CLM_REF__` annotation implies CLM-merge design work lives in a page `40009012:29922` under a **different file key** — not fetched, not verified, note only.

Related: [[project_beefy_role_facts]] if that memory exists; case source of truth for facts is `beefy-case-inputs-2026-08-19.md` in this same folder.
