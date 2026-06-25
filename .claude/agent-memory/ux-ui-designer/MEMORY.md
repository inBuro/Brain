# UX/UI Designer Memory — Fadercraft + Bifi

Updated: 2026-06-24
Fadercraft Figma: `OdPRdjodGO3WiR6tgSP7AA` — https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA

## Fadercraft — Product

M4L / Ableton performance utilities. Flagship: XL Performance (LCXL MK3). Audience: live performers. Desktop-first landing, responsive to tablet+mobile. Tone: direct, technical, no fluff. Code: `~/Projects/Claude/Fadercraft/app/` (React). Wiki: `~/Brain/Fadercraft/`.

## Figma file structure

Pages: `00 — Product` (frames 1920/1440/960/640/360), `02 — Atoms` (`25:2`), `03 — Molecules` (`63:2`), `04 — Organisms` (`63:3`), `07 — Illustrations`, `11 — Free Custom Modes` (Desktop `2078:4985`, Tablet `2080:4985`, Mobile `2080:5500`), `12 — SendsFollower` (artboard `2505:17290`).

## Map

| Task | Where |
|---|---|
| Colors | `tokens/colors.md` |
| Typography | `tokens/typography.md` |
| Spacing / density | hot tokens below |
| Component inventory | `components/inventory.md` |
| Button variants | hot tokens below |
| SendsFollower screen | hot tokens below + `decisions/sends-follower-*.md` |
| FreeCustomModes screen | get_metadata `2078:4985`, `2080:4985`, `2080:5500` |
| Bifi icons | `components/bifi-icons.md` |
| Decisions / debt | `decisions/` |

## Hot tokens — Spacing / Density

Base unit 4px. Figma name = plain number, comma for fractions. CSS = hyphen. No prefixes/suffixes.
Common: `1,5`=6px, `2`=8, `3`=12, `4`=16, `5`=20, `6`=24, `7`=28, `8`=32, `10`=40, `12`=48, `16`=64, `20`=80, `24`=96, `32`=128, `40`=160.
Note: `16`, `20`, `24`, `32`, `40` были добавлены 2026-06-25 (ранее отсутствовали в коллекции Density).

## Hot tokens — Radii

Button: lg=`1,5` (6px), md=`1` (4px), sm=`0,5` (2px). Outer boxes via `--radius-*` aliases (multiples of 4).

## Hot tokens — Key Colors (see `tokens/colors.md` for full table)

`#0f1017` bg-dark · `#63f2ca` mint/primary · `#639af2` lavender/secondary · `#ffad56` amber/cta · `#c6c8d2` bg-default · `#ffffff` OnDark/Primary · `#c6c8d2` OnDark/Secondary · `#989bae` OnDark/Tertiary · `#0f1017` OnLight/Primary · `#414458` OnLight/Secondary.

## Hot tokens — Typography (see `tokens/typography.md` for full table)

Font: DM Sans. Key styles: `Heading/Hero` 48/Bold, `Heading/Section` 40/Bold, `Heading/Product` 36/Bold, `Heading/Title` 20/Bold, `Body/Regular` 20/Rg, `Body/Medium` 18/Md, `Label/md` 17/SemiBold, `Eyebrow` 14/Bold/UPPER/ls3.6, `Caption` 14/Rg/ls0.5px.

## Component inventory (Atoms `25:2`)

Button `33:20`, Icon, Avatar, Badge, TagChip, Input, ModeButton, AccordionItem, SpecRow, Tooltip, DownloadChip `2064:4984`.

**Button variants**: `primary` mint, `secondary` lavender, `dark`, `outlined`, `cta` amber `#ffad56` (revenue). CTA nodes: sm `2094:5213`, md `2094:5215`, lg `2094:5217`. Convention: `primary`=free/positive, `cta`=revenue. Never primary for amber.

**TrackReturnCard** (local, SendsFollower only): ComponentSet `2511:25712` (on page, x=-1500 y=-4644). `Layout=Desktop` `2505:21696` w=1184, gap=48, top-row horizontal. `Layout=Mobile` `2511:25690` w=390, gap=32, image top / article bottom, device preview hidden. Instances in Frame 7 `2505:21667`: TRACK `2511:25735`, RETURN `2505:21697`.

## SendsFollower responsive frames (созданы 2026-06-25)

| Frame | Node | Width | URL |
|---|---|---|---|
| SendsFollower · 1440 | `2518:26053` | 1440 | [link](https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA?node-id=2518-26053) |
| SendsFollower · 960 | `2519:26628` | 960 | [link](https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA?node-id=2519-26628) |
| SendsFollower · 640 | `2519:26851` | 640 | [link](https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA?node-id=2519-26851) |
| SendsFollower · 360 | `2519:27076` | 360 | [link](https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA?node-id=2519-27076) |

**SectionWhoItsFor** ComponentSet `2518:26047` (props: `Breakpoint=1440|960|640|360`). Variants: `2518:25851`, `2518:25900`, `2518:25949`, `2518:25998`.
**HeroSubtitle** ComponentSet `2518:26052` (props: `Layout=desktop|mobile`). Variants: `2518:26048`, `2518:26050`.
**TrackReturnCard** updated: Mobile variant image constraints → STRETCH (fluid on 360–640).

Density tokens added: `16`=64px `2518:25843`, `20`=80px `2518:25844`, `24`=96px `2518:25845`, `32`=128px `2518:25846`, `40`=160px `2518:25847`.

## SendsFollower screen node map (`2505:17290`)

Artboard `2505:17290` → VERTICAL auto-layout. Direct children (fill/hug): Header `2505:17291`, Hero DS `2505:17292`, VideoSection `2505:21624`, Hero local `2505:21695`, Section `2505:21563`, Frame 2 `2505:21606` (Requirements + Newsletter + Footer). Section → Container `2505:21565` (max-w 1184, gap=48, pt=96, pb=128) → Header frame `2505:21566` + Frame 7 `2505:21667` (gap=160) → TRACK + RETURN instances.

Heading «Track or Return» `2505:21568` → bound to `Heading/Section`.

## Hard rules

- Every TEXT node → `setTextStyleIdAsync` (local text style). Raw fontName+fontSize forbidden.
- Every color → local variable. No hex literals (exception: `#a1f7df` eyebrow TRACK/RETURN — known debt).
- Section content: inner max-width wrapper + center. Never fixed outer padding. Mobile: 16–24px breathing room.
- Repeated structure → component. One responsive instance over per-breakpoint frames.
- Density names: plain number, comma for fractions in Figma, hyphen in CSS, no prefixes/suffixes.
- Edit master components, not per-instance overrides. Never resize atoms/instances; flip state via props.

## DS gaps / open questions

- Header + Footer DS lack `model` prop — per-instance text overrides are workaround.
- Button `cta` in DS; React code still uses `variant="primary"` for amber — code rename pending.
- `#a1f7df` on eyebrow — raw hex debt, decision pending (`decisions/sends-follower-raw-colors.md`).
- `TrackReturnCard` local to SendsFollower artboard — not in DS (`decisions/sends-follower-local-components.md`).

## DS ↔ Code divergences

Button amber: DS=`Variant=cta`, code=`variant="primary"` (renders correctly, rename pending). Amber token: DS=`Semantic/Action/Tertiary`, code=`--action-tertiary` (aligned). Header/Footer: DS=text overrides, code=`model` prop.

---

## Bifi / Beefy Design System

Figma file: `vBAfvod9AWpHeyJi2yu2Eh` ("v2.4 Beefy Design System"). Pages: `Accordion` `5015:6337`, `Icons` `3810:5039`. Full DS as team library (key in Bifi/ds/source.md).

**Font**: DM Sans variable (`opsz` axis). **No text styles** — bind via 5 CSS vars per node. **Colors**: `--backgrounds/*`, `--txt/*`, `--strokes/*` vars (no raw hex). Key: `--backgrounds/cardhead` `#1c1e32`, `--strokes/light-default` `#242842`, `--txt/secondary/secondary---default` `#dadce8`, `--txt/tertiary/tertiary---default` `#999cb3`.

Icon sizes: 20×20 UI, 24×24 Token/Chain/Social, 48×48 Wallet/TokenSet. Full inventory → `components/bifi-icons.md`.

Accordion nodes: dark bg `5015:6350` (Desktop default `5015:6351`, expanded `5015:6354`; Mobile default `5115:139`, expanded `5115:144`); light bg `6338:133` (default `5981:98`, expanded `6338:132`).
