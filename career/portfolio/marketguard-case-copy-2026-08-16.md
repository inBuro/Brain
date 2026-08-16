# MarketGuard case — text materials & page structure (draft 2026-08-16)

Working source for the rebuilt case study. Built on a separate URL
(`/works/marketguard/`) so the live `/works/finchguard/` page keeps working
until this one replaces it.

## Sources used

| Source | What it gave |
|---|---|
| `works/finchguard/index.html` (live) | current copy, section list, anchors |
| Notion "Копирайт сайта и кейсов — полный текст (2026-08-14)" | copy source of truth, already vocabulary-corrected |
| Notion "Vocabulary Gap Analysis (2026-08-14)" + §5 FinchGuard round | market vocabulary, case-specific before/after, metric corrections |
| `classified.json` (1391 Telegram vacancy posts) | live market phrasing; MATCH posts read in full: Playneta, crypto payments processor (billions.works) |
| Figma `Ficnhtrade-portfolio`, node `1251:19609` | the artboard the current page was sliced from; research frames `2648:22107`–`2648:22283` |

Also used, found after the first draft of this doc:

| Source | What it gave |
|---|---|
| `career/research/finchguard-case-vocabulary-2026-08-15.md` | node-level before/after for this exact case, 6 rounds, with what was already applied to the artboard |
| `career/resume/resume.md` | period, role, client, the achievement list with baselines |
| FigJam board `FT research` (`LvtPoSamuHIpXKXCBK6TJI`) | **the source of truth for every table in both cases.** Personas for MarketGuard: node `2003:1142`; FinchTrade personas: `2001:1064`. Corrections go into the board first, then onto the page |

## Vocabulary rules for this case

Locked from the gap analysis; apply everywhere on the page.

- `end-to-end`, `from discovery to delivery` — not "from research to implementation"
- `user portal` — never "user cabinet"
- `design system` spelled out — not "Atomic D.S."
- `user story map` — not "USM"
- `communication design` / `brand communications` — not bare "Communications"
- `qualitative and quantitative research` spelled out
- `data-driven` / `metrics-driven` stated explicitly, not just implied by numbers
- `multi-tenant B2B platform with separate trader and compliance roles`
- `activation time` (not "onboarding time"), `manual rework` (not "paperwork")
- Numbers are stated as before → after, with the measurement window
- One point of view throughout: "I designed", never mixing in "the admin panel reduced"
- Sentence case in English headings; en dash, never em dash

## Page structure

Ten blocks. Anything the reader must remember is text, never an image.

### 1. Hero
- h1 `MarketGuard`
- One line: what it is and who it is for
- Fact row: role · scope · period · domain
- Three result tiles, as text, above the fold

### 2. Context
What the business had before the project, why the product was needed, what
constraint shaped the work. 3–4 sentences, no marketing.

### 3. Role and scope
What I owned end-to-end, who the stakeholders were, what I did not own.

### 4. Three insights that changed the product
The spine of the case. Each insight in the same shape:

> **What research found** — one line, with the evidence behind it (quote,
> count, or metric)
> **What changed in the product** — the concrete interface decision
> **What it produced** — the metric, or an honest "not measured separately"

The research artifact (persona table, CJM, story map) sits under the insight as
evidence, not as a standalone exhibit.

### 5. User portal
### 6. Product website
### 7. Design system
### 8. Communication design

Each product section: one paragraph of what the design problem was, then the
screens. Screens keep their captions in text.

### 9. Results
The four numbers, each with baseline, window and measurement method. Client
reference quote here, as text.

### 10. Research
Full artifacts inline, readable, with a one-line finding above each.

Tried as a separate `/research/` page first and reverted: there was no argument
for it. Research depth is the differentiator, so putting it one click away
hides the strongest signal from anyone who does not click — and now that the
artifacts are HTML instead of 4000px posters, they cost no more page length
than the images they replace.

## Draft copy — ready blocks

Only blocks whose facts are confirmed. Everything else is in "Open questions".

### Hero

> **MarketGuard**
>
> AML and KYT compliance platform for crypto businesses – built from scratch
> with FinchTrade AG and shipped as [marketguard.io](https://marketguard.io).
> A multi-tenant B2B product with separate compliance, product and founder
> roles, each with its own portal.

Result tiles (wording final, numbers pending baselines):

- `Activation time –79%` — time from signup to first completed check
- `Manual rework –95%` — compliance manager's repeat handling per case
- `NPS 87` — B2B onboarding survey
- `Bounce rate 4%` — product website, monthly

### Role and scope

> Sole product designer, end-to-end: discovery, user research, information
> architecture, UX and UI, the design system, the product website and brand
> communications. I worked directly with the CEO, the CPO and the compliance
> side of the business – CCO, MLRO and AML officers – who were both the
> stakeholders and the users of what I designed.

### Research method (compressed from the current bullet list)

> I started from the user-goals list the stakeholders had, then checked it
> against the market: competitive research across B2C2, Wintermute, Flowdesk,
> CoinAlpha, Saddle and ElixirTech, and 20+ jobs-to-be-done interviews with
> people already using those solutions. Their needs and pains became the
> product requirements list for the MVP – then personas, information
> architecture, prototypes, A/B tests, and qualitative and quantitative
> surveys on top of the live product.

### Client reference (already on the page, moves to text)

> "Kirill has proven to be not only a good designer but a person who tries to
> understand the essence and the value of a product. He pays attention to
> statistics of user behavior and tries to put himself in client's shoes."
> — Ilia Drozdov, CFA, Co-Founder at Finery Markets, May 2023

## Answered

- **Period and team.** FinchTrade AG, Zug – Aug 2021 to May 2023. Team of 16,
  the same scope as FinchTrade. On the page.
- **Context.** The project was triggered by a major exchange collapsing; the
  whole market realised at once that it needed real AML controls. FinchTrade's
  own compliance need became a sellable product. On the page.
- **Usability numbers.** Tested with groups of 5–7 participants: task
  completion time –45%, task completion rate 100%, satisfaction score 90% on
  address whitelisting. On the page and in the appendix.
- **Results wording.** Uses the template agreed in the vocabulary doc: one POV,
  activation time not onboarding time, manual rework not paperwork, NPS
  demoted from hero metric.
- **Research artifacts.** The FigJam board is the source; the persona table is
  already rebuilt as a real HTML table at `/works/marketguard/research/`.

## Answered, round 2

- **Trigger and timing.** FTX collapsed, MarketGuard development started right
  after it. Built late 2022 to May 2023, inside the FinchTrade AG tenure.
- **Measurement.** Activation time is clocked from the start of registration
  through document submission to the final onboarding step. NPS is surveyed
  among companies that completed onboarding, not visitors. Bounce uses the same
  web analytics as the rest of the product and is tracked together with
  abandoned registrations. A/B tests measured the same axis as activation:
  time to complete, and how far a company got before dropping out.

## Open questions — still blocking

1. **Activation before → after.** –79% has to resolve to two real values. The
   dictated numbers were ambiguous: 28 hours → 6 hours fits –79%; 28 hours →
   10 minutes would be –99%. Which pair is right?
2. **NPS respondent count.** 87 on how many companies.
3. **Insights 2 and 3.** Insight 1 is drafted from the persona table – three
   buyers with incompatible definitions of "good", which is why the portal
   splits into role-specific views over one shared case. Two more needed; the
   causal link has to come from the author, the wording does not.
4. **A/B variants.** The metric axis is now known; what is missing is what was
   tested against what, and which variant won.

## Not blocking, fix during the rebuild

- Domain typo `www.FinchGaurd.com` in the Figma source (fixed there, must not
  come back into the new page)
- `/works/finchtrade/` references four images that exist on the live site but
  not in the local repo – a deploy from the current checkout would break them
- `user-portal-02.webp` sits in the FinchGuard image folder unused
