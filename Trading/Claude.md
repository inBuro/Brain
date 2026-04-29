## Purpose
  

This wiki is a structured, interlinked knowledge base for a team chat.
Claude maintains the wiki. The human curates sources, asks questions, and guides the analysis.

  
  

## Folder structure

```

raw/ -- source documents (immutable -- never modify these)

wiki/ -- markdown pages maintained by Claude

wiki/index.md -- table of contents for the entire wiki

wiki/log.md -- append-only record of all operations

```

  
  

## Ingest workflow


When the user adds a new source to `raw/` and asks you to ingest it:

1. Read the full source document
2. Discuss key takeaways with the user before writing anything
3. Create a summary page in `wiki/` named after the source
4. Create or update concept pages for each major idea or entity
5. Add wiki-links ([[page-name]]) to connect related pages
6. Update `wiki/index.md` with new pages and one-line descriptions
7. Append an entry to `wiki/log.md` with the date, source name, and what changed

A single source may touch 10-15 wiki pages. That is normal.

  

## Page format

  

Every wiki page should follow this structure:  

```markdown

# Page Title



**Summary**: One to two sentences describing this page.
**Sources**: List of raw source files this page draws from.
**Last updated**: Date of most recent update.
  
---

  
Main content goes here. Use clear headings and short paragraphs.
Link to related concepts using [[wiki-links]] throughout the text.
## Related pages

- [[related-concept-1]]

- [[related-concept-2]]

```

  
  

## Citation rules

  
- Every factual claim should reference its source file
- Use the format (source: filename.pdf) after the claim
- If two sources disagree, note the contradiction explicitly
- If a claim has no source, mark it as needing verification

  
  

## Question answering

When the user asks a question:

1. Read `wiki/index.md` first to find relevant pages
2. Read those pages and synthesize an answer
3. Cite specific wiki pages in your response
4. If the answer is not in the wiki, say so clearly
5. If the answer is valuable, offer to save it as a new wiki page

  

Good answers should be filed back into the wiki so they compound over time.

  
## Lint

When the user asks you to lint or audit the wiki:

- Check for contradictions between pages
- Find orphan pages (no inbound links from other pages)
- Identify concepts mentioned in pages that lack their own page
- Flag claims that may be outdated based on newer sources
- Check that all pages follow the page format above
- Report findings as a numbered list with suggested fixes

  

## Rules

- Never modify anything in the `raw/` folder
- Always update `wiki/index.md` and `wiki/log.md` after changes
- Keep page names lowercase with hyphens (e.g. `machine-learning.md`)
- Write in clear, plain language
- When uncertain about how to categorize something, ask the user

## Live market analysis behavior

When the user shares market screenshots/context for a trading setup analysis:

- If a valid setup exists → walk through entry rules, suggest size/SL/TP per the strategy.
- **If no valid setup exists** → don't just say "no entry right now". Always propose a concrete time window for the next market check, e.g. "Сейчас setup'а нет. Возвращайся примерно через ~6 часов с новыми скриншотами 4h/1h."

Why: the trader has a 30-40 min/day attention budget (see `wiki/trader-profile` / `raw/strategy-v3.md`) and explicitly does not want to sit over the chart. An open-ended "no setup" leaves the trader either forgetting to come back or checking too often. A concrete next-checkpoint converts a no-trade into an actionable plan.

How to pick the interval:
- If waiting for an HL/LH to form on 4h → ~4-6 hours
- If price is far from key support/resistance → 8-12 hours
- If price is close to the zone but conditions are missing → 2-3 hours
- Always specify what to send back (4h + 1h minimum, plus Bybit Data screenshots when whale ratio / funding are decision-relevant)