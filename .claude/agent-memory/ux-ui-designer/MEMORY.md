# UX/UI Designer Memory — Fadercraft

Updated: 2026-05-26
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
| `color-semantic-action-dark` | `#0f1017` | Dark button bg |
| `color-semantic-action-dark-text` | `#dfe0e7` | Text on dark action button |
| `Semantic/Action/Tertiary` | `#ffad56` | Amber — CTA/revenue actions (purchase, upgrade) |
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

| Style name | Size (density) | px | Weight | Line-height |
|---|---|---|---|---|
| Heading/Hero | 12 | 48 | Bold | 15,5 (62px) |
| Heading/Section | 10 | 40 | Bold | 12,5 (50px) |
| Heading/Product | 9 | 36 | Bold | 10,5 (42px) |
| Heading/Title | 5 | 20 | Bold | 7,5 (30px) |
| Heading/Subtitle | 5 | 20 | Regular | 100 |
| Body/Regular | 5 | 20 | Regular | 7,5 |
| Body/Medium | 4,5 | 18 | Medium | 6,5 |
| Body/Compact | 4 | 16 | Regular | 6 |
| Label/lg | 5 | 20 | SemiBold | 7 |
| Label/md | 4,25 | 17 | SemiBold | 6 |
| Label/sm | 3,5 | 14 | SemiBold | 5 |
| Label/xs | 3 | 12 | SemiBold | 4 |
| Eyebrow | 3,5 | 14 | Bold | 5 (+ tracking 3.6px, uppercase) |
| Caption | 3,5 | 14 | Regular | 5 (+ tracking 0.5px) |

Font family: DM Sans. All text nodes must be bound to a local text style — no raw font props.

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

## DS ↔ Code divergences (current state as of 2026-05-26)

| Surface | DS | Code | Status |
|---|---|---|---|
| Button amber CTA | `Variant=cta` (amber `#ffad56`) | `variant="primary"` renders amber | Reconciled in Figma — DS now has `cta` variant. Code uses wrong variant name but renders correctly. Code refactor not done. |
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

## Open questions

- Header and Footer DS components still lack `model` prop — per-instance overrides are a workaround. Organism refactor needed.
- Button `Variant=cta` added to DS; React code still uses `variant="primary"` for amber render. Code-side rename is an open task (not blocking Figma work).
- ~~FreeCustomModes tablet and mobile CTA buttons are raw frames~~ — resolved 2026-05-26: both replaced with `Variant=cta, Size=lg` instances (`2097:13892` tablet, `2097:17332` mobile).
