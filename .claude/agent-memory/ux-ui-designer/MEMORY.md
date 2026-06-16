# UX/UI Designer Memory — Fadercraft

Updated: 2026-06-16
Source of truth: https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA

## Product

Fadercraft — umbrella brand for M4L / Ableton performance utilities. Flagship: XL Performance (M4L device for LaunchControl XL MK3). Target: Ableton Live performers who play live rigs. Primary device: desktop (landing page), also responsive to tablet + mobile. Tone: direct, technical, no fluff.

Code root: `~/Projects/Claude/Fadercraft/app/` (React).
Planning / wiki: `~/Brain/Fadercraft/`.

## Design system — where it lives

- Figma file: `OdPRdjodGO3WiR6tgSP7AA`
- Pages:
  - `00 — Product` — ProductPage frames (1920, 1440, 960, 640, 360)
  - `02 — Atoms` — Icon, Avatar, Badge, TagChip, Input, Button, ModeButton, AccordionItem, SpecRow, Tooltip, DownloadChip
  - `03 — Molecules` — molecules (check file)
  - `04 — Organisms` — organisms
  - `07 — Illustrations` — illustration assets
  - `11 — Free Custom Modes` — FreeCustomModes page (Desktop 1440 `2078:4985`, Tablet 640 `2080:4985`, Mobile 360 `2080:5500`)
- No separate Product file; everything in one Figma file.
- Frame widths: 1920 / 1440 / 960 / 640 / 360.

## Map

Load via Read as needed:

| Task | What to read |
|---|---|
| Colors / variables | pull from Figma via get_variable_defs |
| Typography | pull from Figma; text styles local in file |
| Components | get_metadata on Atoms page `25:2`, Molecules `63:2`, Organisms `63:3` |
| FreeCustomModes frames | get_metadata on `2078:4985`, `2080:4985`, `2080:5500` |
| ProductPage frames | get_metadata on `25:3` |

## Hot tokens

### Color variables (confirmed via get_variable_defs)

| Token | Value | Use |
|---|---|---|
| `color-semantic-bg-dark` | `#0f1017` | Dark section/hero bg |
| `color-semantic-bg-default` | `#c6c8d2` | Light surface bg |
| `color-semantic-action-primary` | `#63f2ca` | Mint — primary positive action, signup, confirm, free |
| `color-semantic-action-secondary` | `#639af2` | Lavender — secondary/info action |
| `Semantic/Action/Tertiary` | `#ffad56` | Amber — CTA/revenue actions (purchase, upgrade). **Single amber token** — Secondary (alias дубль) удалён 2026-06-16. |
| `color-semantic-action-dark` | `#0f1017` | Dark button bg |
| `color-semantic-action-dark-text` | `#dfe0e7` | Text on dark action button |
| `Semantic/Text/OnDark/Primary` | `#ffffff` | Text on dark bg |
| `Semantic/Text/OnDark/Secondary` | `#c6c8d2` | Secondary text on dark bg |
| `Semantic/Text/OnDark/Tertiary` | `#989bae` | Tertiary text on dark bg |
| `Semantic/Text/OnLight/Primary` | `#0f1017` | Text on light bg |
| `Semantic/Text/OnLight/Secondary` | `#414458` | Secondary text on light bg |
| `Primitives/Mint/400` | `#63f2ca` | mint-500 alias |
| `Primitives/Lavender/400` | `#639af2` | lavender alias |
| `Semantic/Surface/Mute` | `#ffad56` | amber surface |
| `Semantic/Surface/Mixer` | `#63f2ca` | mint surface |
| `Semantic/Surface/Service` | `#2a2c3c` | dark surface |

### Typography (local Figma text styles, bound via setTextStyleIdAsync)

Core palette (canonical — matches FreeCustomModes / Hub):

| Style name | px | Weight | Line-height px | LetterSpacing | TextCase |
|---|---|---|---|---|---|
| Heading/Hero | 48 | Bold | 62 | -0.9px | — |
| Heading/Section | 40 | Bold | 50 | -1% | — |
| Heading/Product | 36 | Bold | 42 | -1% | — |
| Heading/Title | 20 | Bold | 30 | 0 | — |
| Heading/Subtitle | 20 | Regular | AUTO | 0 | — |
| Body/Regular | 20 | Regular | 30 | 0 | — |
| Body/Medium | 18 | Medium | 26 | 0 | — |
| Body/Medium-rg | 18 | Regular | 26 | 0 | — |
| Body/Compact | 16 | Regular | 24 | 0 | — |
| Label/lg | 20 | SemiBold | 28 | 0 | — |
| Label/md | 17 | SemiBold | 24 | 0 | — |
| Label/md-rg | 17 | Regular | 24 | 0 | — |
| Label/sm | 14 | SemiBold | 20 | 0 | — |
| Label/sm-rg | 14 | Regular | 20 | 0 | — |
| Label/xs | 12 | SemiBold | 16 | 0 | — |
| Eyebrow | 14 | Bold | 20 | 3.6px | UPPER |
| Eyebrow/sm | 12 | Bold | 16 | 3px | UPPER |
| Caption | 14 | Regular | 20 | **0.5px** | — |

Additional styles in file (legacy / special use, not part of core landing palette):

| Style name | px | Weight | Note |
|---|---|---|---|
| Heading/Display | 64 | Bold | lh AUTO — not used in Product/Hub |
| Heading/Compact | 28 | Bold | lh 34, ls -1% — used in Content page |
| Body/Regular-Semibold | 20 | SemiBold | lh 30 — used in Product page |
| Body/Large | 20 | Regular | lh AUTO — not used in Product/Hub |
| Price | 24 | Bold | lh 30 — Molecules only |
| MatStudy/Title | 8 | SemiBold | lh AUTO — technical/legacy |
| MatStudy/Sub | 5 | Regular | lh AUTO — technical/legacy |

Font family: DM Sans. All text nodes must be bound to a local text style — no raw font props.

**Caption letterSpacing fix 2026-06-17:** was 2px in file, corrected to 0.5px (canonical value). Propagates to all 187 nodes using this style automatically via style binding.

### Spacing / density

Base unit 4px. Density names: plain number with comma for fractions (Figma), hyphen in CSS.
Common values used: 1,5=6, 2=8, 3=12, 4=16, 5=20, 6=24, 7=28, 8=32, 12=48.

### Radii (confirmed)

Button: lg=1,5 (6px), md=1 (4px), sm=0,5 (2px).

## Hard rules

- Every TEXT node must be bound to a local Text Style via `setTextStyleIdAsync`. Raw fontName+fontSize forbidden.
- Every color must use a local variable, no hex literals.
- Max-width via inner content wrapper (1200px full / 720px reading) + center. Never constrain via fixed outer padding. Mobile only gets 16–24px outer breathing room.
- Repeated sections must become components, not inline duplicates.
- One responsive instance preferred over per-breakpoint variants.
- When user points to a Figma node, pull from that node. If ambiguous, ask before guessing.
- Density-token names: plain number in Figma (comma for fractions), hyphen in CSS, no prefixes, no suffixes.

## Component inventory (Atoms page `25:2`)

Button (COMPONENT_SET, id `33:20`), Icon, Avatar, Badge, TagChip, Input, ModeButton, AccordionItem, SpecRow, Tooltip, DownloadChip (`2064:4984`).

### Button variants

Component set id: `33:20` (parent of all variants).

| Variant | Size | Fill | Text color | Note |
|---|---|---|---|---|
| primary | sm/md/lg | mint `#63f2ca` | dark `#0f1017` | signup, confirm, free actions |
| secondary | sm/md/lg | lavender `#639af2` | dark `#0f1017` | secondary action |
| dark | sm/md/lg | dark `#0f1017` | `#dfe0e7` | dark surface action |
| outlined | sm/md/lg | transparent | varies | ghost action |
| **cta** | sm/md/lg | amber `#ffad56` | dark `#0f1017` | **revenue / purchase actions** (added 2026-05-26) |

CTA variant nodes: sm=`2094:5213`, md=`2094:5215`, lg=`2094:5217`.

**Convention**: `primary` = mint (free/positive), `cta` = amber (revenue/purchase). Never use `primary` for amber renders.

### What does NOT exist in the system

- DS Header has no `model` prop — per-instance text override used as workaround (shows "Control XL" by default).
- DS FooterFull has no `model` prop either — footer still shows "Control XL" on FreeCustomModes page.
- No dark mode (not planned).
- No animation/motion tokens documented.

## DS ↔ Code divergences (current state as of 2026-06-16)

| Surface | DS | Code | Status |
|---|---|---|---|
| Button amber CTA | `Variant=cta` (amber `#ffad56`) | `variant="primary"` renders amber | Reconciled in Figma — DS now has `cta` variant. Code uses wrong variant name but renders correctly. Code refactor not done. |
| Amber color token | Single `Semantic/Action/Tertiary` | `--action-secondary` (lavender) + `--action-tertiary` (amber) — separate tokens | Figma merged Secondary→Tertiary (2026-06-16). Code has two separate CSS vars which is semantically correct. No code change needed unless renaming `--action-tertiary` to align with DS naming. |
| Header | per-instance text override | has `model` prop | DS behind code |
| Footer | per-instance text override | has `model` prop | DS behind code |

## Recently created / modified nodes (2026-05-26)

- `DownloadChip` atom — `2064:4984` (Atoms page)
- FreeCustomModes Desktop 1440 — `2078:4985` (page `11 — Free Custom Modes`)
- FreeCustomModes Tablet 640 — `2080:4985`
- FreeCustomModes Mobile 360 — `2080:5500`
- Button `Variant=cta, Size=sm` — `2094:5213`
- Button `Variant=cta, Size=md` — `2094:5215`
- Button `Variant=cta, Size=lg` — `2094:5217`
- FreeCustomModes Tablet CTA instance (Button/cta/lg) — `2097:13892` (inside `cta-wrap` `2080:5342`)
- FreeCustomModes Mobile CTA instance (Button/cta/lg) — `2097:17332` (inside `cta-wrap` `2080:5703`; x=-49.5 centered overflow; ancestor clips disabled)

## Anti-patterns (rejected)

- Using amber fill with `variant="primary"` naming — now resolved as `variant=cta`.
- Constraining section content via fixed left/right padding (use max-width inner wrapper instead).
- T-shirt size suffixes on density tokens (`xs/sm/md/lg/xl` as density names).
- Raw hex colors or font props anywhere in Figma layers.
- Per-breakpoint duplicate frames for the same section — build as component, instance it.

## Conventions

- **Icon export — always WITH the safe zone.** When exporting an icon SVG from Figma for code, export the full icon FRAME (e.g. the 24×24 component with its built-in transparent air around the glyph), NOT the cropped vector path alone. The cropped glyph fills its box edge-to-edge and reads oversized/tight beside text; the framed icon (small glyph + air) renders proportionate to the text at the same box size. Also set stroke/fill to `currentColor` (inherit text color) and use a fixed numeric width/height + proper viewBox (drop `preserveAspectRatio="none"`). [rule from user, 2026-06-16]
- **Figma "negative padding" → CSS negative margin.** CSS `padding` cannot be negative (invalid → ignored). When a Figma layer uses negative padding (e.g. an icon slot's `pr:-8` pulling the icon toward the edge to balance its insets), implement it as a negative `margin` in code, never padding.

## Open questions

- Header and Footer DS components still lack `model` prop — per-instance overrides are a workaround. Organism refactor needed.
- Button `Variant=cta` added to DS; React code still uses `variant="primary"` for amber render. Code-side rename is an open task (not blocking Figma work).
- ~~FreeCustomModes tablet and mobile CTA buttons are raw frames~~ — resolved 2026-05-26: both replaced with `Variant=cta, Size=lg` instances (`2097:13892` tablet, `2097:17332` mobile).
