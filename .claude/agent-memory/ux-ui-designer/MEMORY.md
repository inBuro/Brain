# UX/UI Designer Memory — Fadercraft + Bifi

Updated: 2026-06-24
Fadercraft Figma: `OdPRdjodGO3WiR6tgSP7AA` — https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA

## Fadercraft — Product

M4L / Ableton performance utilities. Flagship: XL Performance (LCXL MK3). Audience: live performers. Desktop-first landing, responsive to tablet+mobile. Tone: direct, technical, no fluff. Code: `~/Projects/Projects/fadercraft/app/` (React). Wiki: `~/Brain/fadercraft/`.

## Figma file structure

Pages (as named 2026-06-24): `00 — Product` (frames 1920/1440/960/640/360), `02 — Atoms` (`25:2`), `03 — Molecules` (`63:2`), `04 — Organisms` (`63:3`), `07 — Illustrations`, `11 — Free Custom Modes` (Desktop `2078:4985`, Tablet `2080:4985`, Mobile `2080:5500`), `12 — SendsFollower` (artboard `2505:17290`).

**⚠️ (уточнить) 2026-07-04**: живой `get_metadata` (no nodeId) на файле вернул top-level pages БЕЗ числовых префиксов: **Hub** (`2372:20274`), **Atoms** (`25:2`), **Icons** (`2310:18598`), **Molecules** (`63:2`), **Organisms** (`63:3`), **OG images** (`2313:16269`). Node id `25:2`/`63:2`/`63:3` совпадают с записанными выше — похоже страницы просто переименовали (сняли числовые префиксы), «00 — Product» → вероятно стал **Hub**. Страницы «07 — Illustrations», «11 — Free Custom Modes», «12 — SendsFollower» на top-level НЕ встретились в этом скане — не проверено, удалены/переименованы/вложены ли они. Следующей сессии: подтвердить перед тем как полагаться на старые имена страниц.

**Dynamic Focus page** (`2706:3858`) — рабочий канвас (НЕ структурированный лендинг). Разрозненные Ableton Live скриншоты и device-мокапы DF Slot. Мастер-компонент `DFFeatureBreakdown` (Organisms `2866:8676`) — инстанс на Dynamic Focus (`2867:8705`) x=-720, y=2100. [Figma](https://figma.com/design/OdPRdjodGO3WiR6tgSP7AA?node-id=2867-8705)

На странице **Hub** секции-инстансы лендинга собраны в auto-layout фрейм **«Products»** (`2405:20077`, VERTICAL, gap 160 = density `40`, padding `px-120 pb-64`). Мастера самих секций (component sets: `FeatureSplit`, `HeroProduct`, `OneActionBetweenThem`, `PerformanceFlow`, `PanelAnatomy`...) живут на **Organisms**, инстансы — на Hub. Вставка новой секции = `insertChild` в «Products», авто-layout сам разводит gap.

Отдельно существует полноразмерный fully-built product frame **«123»** (`2232:5237`, 1920 wide) — детальная сборка Control XL лендинга с реальными секциями (`Header`, `Hero`, `OneActionBetweenThem` ×2, `PanelAnatomy`, `Section - Performance flow`, `Section - Who it's for`, `VideoSection`, `TheKitSection`, `FAQSection`, `RequirementsSection`, `NewsletterSection`, `Footer`). Похоже это и есть текущий рабочий "product page" (возможно то, что раньше называлось «00 — Product»).

## Map

| Task | Where |
|---|---|
| Colors | `tokens/colors.md` |
| Typography | `tokens/typography.md` |
| Spacing / density | hot tokens below + `tokens/density-full-scan.md` |
| Component inventory | `components/inventory.md` |
| Button variants | hot tokens below |
| SendsFollower screen | hot tokens below + `decisions/sends-follower-*.md` |
| FreeCustomModes screen | get_metadata `2078:4985`, `2080:4985`, `2080:5500` |
| Bifi icons | `components/bifi-icons.md` |
| PanelAnatomy (Control XL on-screen controls section) | `components/panel-anatomy.md` |
| Decisions / debt | `decisions/` |
| Kirill's personal taste (Eagle reference library, new/greenfield screens) | `taste/reference-library.md` (digest) + `taste/tag-index.md` (311 raw references by tag) |

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

## Component inventory (Atoms `25:2` + Organisms `63:3`)

Button `33:20`, Icon, Avatar, Badge, TagChip, Input, ModeButton, AccordionItem, SpecRow, Tooltip, DownloadChip `2064:4984`.

**Button variants**: `primary` mint, `secondary` lavender, `dark`, `outlined`, `cta` amber `#ffad56` (revenue). CTA nodes: sm `2094:5213`, md `2094:5215`, lg `2094:5217`. Convention: `primary`=free/positive, `cta`=revenue. Never primary for amber.

**TrackReturnCard** (local, SendsFollower only): ComponentSet `2511:25712` (on page, x=-1500 y=-4644). `Layout=Desktop` `2505:21696` w=1184, gap=48, top-row horizontal. `Layout=Mobile` `2511:25690` w=390, gap=32, image top / article bottom, device preview hidden. Instances in Frame 7 `2505:21667`: TRACK `2511:25735`, RETURN `2505:21697`.

**Control XL device mockup** (Molecules `1958:5290`, componentSet variants `State=cold/11/12/13/14`): skeuomorphic screenshot of the Control XL on-screen panel (titlebar + Page/Bank/Daw/Prelisten rows + MIXER 11-14 tabs). Deliberately a SEPARATE warm/mocha palette (bg `#423732`, titlebar `#534842`, text `#d6cbc0`, wells `#241d17`, borders `#16110e`) — not on Semantic/OnDark tokens, this is "device skin" not app-chrome. Raw hex, unbound — pre-existing debt, see `decisions/panel-anatomy-debt.md`. Reused as instance in hero `FeatureSplit` (Control XL) and in `PanelAnatomy`. Edit via instance only, don't touch master without product sign-off (shipped in live hero).

**PanelAnatomy** — see `components/panel-anatomy.md`.

**DFFeatureBreakdown** (Organisms `2866:8676`) — 5-tile feature grid for Dynamic Focus product page. ICPColumns pattern, 3+2 rows, no icons, dark bg. Instance on DF page: `2867:8705` x=-720 y=2100. Source: Notion VO doc per-video scripts (Video 1–5, no Pickup Mode). Body text `you are adjusting` (apostrophe simplified from `you're` due to JS parsing constraint in plugin env).

**AnatomyCallout** (Organisms `2576:6938`) — reusable primitive: ONE line of Body/Medium text, no tick/leader-line/decoration (a decorative tick was tried 2026-07-04 and explicitly rejected by user — connection to a paired UI element must be done via alignment/proximity only, never added graphics). File had no such primitive before (`Tooltip` is hover-only light-bg bubble, doesn't fit; `SpecRow` is onlight spec-table row, doesn't fit).

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
- **Pairing a label to a control: alignment/inline-decor yes, floating leader-line no.** User rejected a decorative connector spanning the GAP between two separate elements (checkbox↔label bridge) twice in PanelAnatomy (2026-07-04) — fixed each time via row-lock (Y-alignment) + minimal proximity gap. BUT later (same day, v5) the user explicitly reintroduced a short inline dash ("— ") as a typographic lead-in glued to the start of each label's own line — and confirmed that's wanted. The distinction: a short mark that's part of one text unit (inline, touching its own label) = fine; a line/connector that bridges empty space between two separate objects = rejected. When in doubt, default to alignment/proximity/order — but a tight inline "— " prefix on a label is not the thing being avoided.
- Edit master components, not per-instance overrides. Never resize atoms/instances; flip state via props.

## DS gaps / open questions

- Header + Footer DS lack `model` prop — per-instance text overrides are workaround.
- Button `cta` in DS; React code still uses `variant="primary"` for amber — code rename pending.
- `#a1f7df` on eyebrow — raw hex debt, decision pending (`decisions/sends-follower-raw-colors.md`).
- `TrackReturnCard` local to SendsFollower artboard — not in DS (`decisions/sends-follower-local-components.md`).
- Control XL device mockup master fully raw-hex — pending product decision (`decisions/panel-anatomy-debt.md`).
- **⚠️ (уточнить) 2026-07-04**: live variable pull on the amber color returned name `Semantic/Action/Secondary` (`#ffad56`), NOT `Semantic/Action/Tertiary` as this file records (line above, dated from the 2026-06-16 rename). Also mint pulled as `Semantic/Action/Primary` (`#63f2ca`) matching. Possible the Tertiary→Secondary rename got reverted, or two similarly-named variables coexist. Re-verify both names directly before trusting either in a new session.
- **⚠️ (уточнить) 2026-07-04**: full live scan of the "Density" variable collection returned `-4,-3,-2,-1,-0,5,0,0,25,0,5,0,75,1,1,25,1,5,2,2,5,3,3,5,4,4,25,4,5,5,6,6,25,6,5,7,7,5,8,8,5,9,10,10,5,12,12,5,15,5,16,20,24,32,999` — no `40` (160px), despite the note above saying it was added 2026-06-25. Re-verify before relying on `40`.

## DS ↔ Code divergences

Button amber: DS=`Variant=cta`, code=`variant="primary"` (renders correctly, rename pending). Amber token: DS=`Semantic/Action/Tertiary`, code=`--action-tertiary` (aligned). Header/Footer: DS=text overrides, code=`model` prop.

---

## Bifi / Beefy Design System

Figma file: `vBAfvod9AWpHeyJi2yu2Eh` ("v2.4 Beefy Design System"). Pages: `Accordion` `5015:6337`, `Icons` `3810:5039`. Full DS as team library (key in bifi/ds/source.md).

**Font**: DM Sans variable (`opsz` axis). **No text styles** — bind via 5 CSS vars per node. **Colors**: `--backgrounds/*`, `--txt/*`, `--strokes/*` vars (no raw hex). Key: `--backgrounds/cardhead` `#1c1e32`, `--strokes/light-default` `#242842`, `--txt/secondary/secondary---default` `#dadce8`, `--txt/tertiary/tertiary---default` `#999cb3`.

Icon sizes: 20×20 UI, 24×24 Token/Chain/Social, 48×48 Wallet/TokenSet. Full inventory → `components/bifi-icons.md`.

Accordion nodes: dark bg `5015:6350` (Desktop default `5015:6351`, expanded `5015:6354`; Mobile default `5115:139`, expanded `5115:144`); light bg `6338:133` (default `5981:98`, expanded `6338:132`).

Bifi product file: `fLrH3120KL4aNrtSBwi2rT`. Yield tooltip (`40009211:5235`) raw-value debt, partially closed 2026-07-06 → `decisions/bifi-yield-tooltip-debt.md`.

**DS gap:** no semantic primary/secondary accent color tokens in Beefy DS — `graphs/graphGreen`/`graphBlue` borrowed as stand-in once (2026-07-06) → `decisions/bifi-ds-accent-token-gap.md`.

**DS gap:** `Tag` component (`40008881:559341`) only has 2 variants (Green inline / Yellow floating) — no combo/mixed variant. Resolved via two adjacent raw token-bound badges instead of a gradient → `decisions/bifi-tag-gradient-gap.md`.

**Current phase rule (2026-07-07, coordinator):** CLM Pool+Vault merge mockups on the dashboard row (`40009249:23465` artboard, "Your Vaults") are built with raw elements (frame+text), not component instances — but colors must still resolve to Semantic Variables (copy paints off real instances, don't hand-type hex). Typography just needs internal consistency, not exact named-font-instance fidelity.

**Font env issue (both Fadercraft + Bifi):** `"DM Sans 18pt"` не грузится через `figma.loadFontAsync` в агентских сессиях ни в Fadercraft (`OdPRdjodGO3WiR6tgSP7AA`), ни в Bifi (`fLrH3120KL4aNrtSBwi2rT`). Полный workaround-рецепт → `decisions/bifi-font-env-dm-sans-18pt.md`.
