# Wiki Operations Log

**Summary**: Append-only log of wiki operations — ingests, page creation, lints, reviews.
**Sources**: operational page (no upstream source)
**Last updated**: 2026-04-30

---

This file is **append-only**. Never modify previous entries — only add new ones at the bottom.

Each entry describes one logical act of wiki work: source ingest, page creation, review, lint, etc.

---

## 2026-04-29 — Initial strategy ingest (v3)

**Operation:** First wiki population. Built the skeleton and seeded the main strategy page.

**Created:**
- `raw/strategy-v3.md` — canonical strategy v3 document, used as primary source
- `wiki/trading-strategy.md` — main summary page with links to planned concept pages
- `wiki/index.md` — updated; now contains the trading-strategy entry and the planned-pages list
- `wiki/log.md` — this file

**Source:** live trading sessions 2026-04-26..29 + strategy alignment in chat. Full transcripts not preserved — curator (Kirill) confirmed strategy content verbally, the document was assembled by Claude over the course of discussion.

**Pending concept pages** (referenced via wiki-links from the main page, not yet created):
- trader-profile, entry-rules-long, entry-rules-short, position-sizing, stop-loss-rules, take-profit-rules, timeframes, indicators, bybit-data, bybit-chart-markers, daily-routine, weekly-review, psychology-rules, commission-management

**Plan:** concept pages get filled in incrementally. Each weekly strategy review is an opportunity to expand one or two topics in detail (for example, after the first real series of short trades, expand `entry-rules-short` with examples).

**Next:** wait for the first week of v3 trading, discuss statistics at review, decide which concepts to expand first (likely `entry-rules-long` + `position-sizing`, the most frequently used).

---

## 2026-04-29 — Audit fixes + first concept page

**Operation:** small fixes per the wiki audit + creation of the first concept.

**Updated:**
- `wiki/index.md` — added the `Sources` field in the header for compliance with the page format (set to "operational page (no upstream source)")
- `wiki/log.md` — added the `Summary / Sources / Last updated` header
- `wiki/trading-strategy.md` — added three inline citations `(source: strategy-v3.md)` to key numeric statements (capital/leverage, minimum 4-5% movement, target win-rate metrics)

**Created:**
- `wiki/entry-rules-long.md` — first concept: long entry conditions. Structure: main question (4-7% potential) → 5 base conditions → bonuses → prohibitive conditions → check order → next steps. Source — `raw/strategy-v3.md`, "LONG entry rules" section, expanded with explanations per condition.

**Index:** `entry-rules-long` moved from "Concepts (planned)" to active "Concepts".

**Reasoning for the choice of first concept:** the previous log entry predicted `entry-rules-long` as the most-used concept. We decided not to wait for the first trading week and to expand it right away, so that on the first setup we don't have to revisit the raw document. Other concepts continue to be expanded as needed — next candidate is `position-sizing` (needed right after `entry-rules-long` in the "decided to enter → calculate size" flow).

**Next:** at the next wiki touch — either `entry-rules-short` (mirror page) or `position-sizing` (next step in operational flow). Decide at that point.

## 2026-04-29 — link `raw/strategy-v3` ↔ trading-strategy (graph)

The canonical strategy document is now explicitly linked as a wiki-link, not mentioned as plain text — so it becomes a node in the Obsidian Graph View next to `trading-strategy` and `entry-rules-long`.

- `wiki/trading-strategy.md`: in the `**Sources**` line `strategy-v3.md` → `[[raw/strategy-v3]]`; in "Version history" `\`raw/strategy-v3.md\`` → `[[raw/strategy-v3]]`. Inline citations `(source: strategy-v3.md)` left as plain text per CLAUDE.md convention.
- `wiki/entry-rules-long.md`: in the `**Sources**` line `strategy-v3.md` → `[[raw/strategy-v3]]`.
- `wiki/index.md`: added a `## Sources` section with the link `[[raw/strategy-v3]]` and a description — the hub now references the canonical document too.

In the graph, `raw/strategy-v3` becomes a source node with edges to `trading-strategy`, `entry-rules-long`, and `wiki/index`. Same pattern that was applied in Novation for `raw/XL_Performance.README` and `solo_follower.js`.

---

## 2026-04-29 — Lint fix: wiki-link path resolution

**Issue:** Wiki-links of the form `[[raw/strategy-v3]]` weren't resolving in Obsidian. Vault root = `/Users/Kirill/Brain` (confirmed by `.obsidian/` being there), so the link was looking for `/Users/Kirill/Brain/raw/strategy-v3.md`, while the file is at `/Users/Kirill/Brain/Trading/raw/strategy-v3.md`. The graph was broken.

**Fix:** replaced `[[raw/strategy-v3]]` → `[[strategy-v3]]` (short form, works because `strategy-v3` is unique within the vault — verified via `find` over `/Users/Kirill/Brain`).

**Updated:**
- `wiki/index.md` — Sources section
- `wiki/trading-strategy.md` — Sources field in header + "Version history" section
- `wiki/entry-rules-long.md` — Sources field in header

**Why this form:** `[[strategy-v3]]` is shorter than `[[Trading/raw/strategy-v3]]` and resilient to moving the file into another subfolder. If another `strategy-v3.md` ever appears somewhere in the vault — Obsidian will complain about a name collision, and we will switch to the full path then.

---

## 2026-04-29 — Rule for checking financial news in entry-rules

**Operation:** added a new rule to `entry-rules-long`: before entering, mandatory check of Bybit Feed → News (or another ETH news feed). Change emerged from a live trading session — the curator asked to add this to the rules and apply it immediately to the current market.

**Updated:**
- `wiki/entry-rules-long.md`:
  - Header `Summary` — mentioned the news check in the pipeline.
  - New section "Financial news (context check)" — what to look for (critical blockers, sell-pressure signals, macro headlines, soft bullish/bearish background), and the contextual rule (mixed-bearish or upcoming headline → reduced size or skip).
  - In "Prohibitive conditions" added the 5th blocker — critical news (core-protocol or L2 hack, regulatory action, macro headline within the next 1-2 hours).
  - In "Check order" — news check is now step 2, between the main question and the prohibitive conditions.
- `wiki/index.md`:
  - In "Concepts (planned)" added a `news-check` page — taxonomy of financial news.
  - `Last updated` field updated with a note about the news rule.

**Mirror:** the rule applies symmetrically to short. When `entry-rules-short` gets created, the news section is copied with inverted bonuses (bullish news → an argument against shorting).

**Why no separate `news-check` page yet:** the rule was just introduced, and the actual news-reaction taxonomy doesn't exist yet. Once we collect 2-3 cases where news clearly affected a trade (or should have) — we will expand it on a separate page. For now, it lives inline in `entry-rules-long`.

**Application to the current market (2026-04-29, 07:49 UTC):** news background was mixed-bearish (6 bearish / 3 bullish / 1 neutral over the last 2 hours). Sell-pressure signals — losses by market-makers (Hyperliquid/Wintermute/Auros) and a transfer of 3,418 ETH to Binance with profit-taking. Macro — market awaiting Fed assessment of inflation. No critical blockers, but the background confirmed the "no setup, wait" decision. Recorded as a live example of the rule at work.

## 2026-04-29 — Baseline backtest of single signals from strategy-v3

**Operation:** installed skills `risk-management` (0xhubed/agent-trading-arena), `market-news-analyst` (tradermonty), `backtesting-trading-strategies` (jeremylongshore). Ran Variant A of [[strategy-v3]] validation — sanity check of single indicator signals on daily ETH-USD over 2 years ($2,200 capital).

**Results (vs benchmark Buy&Hold = −28.4%):**
- RSI reversal (14, 40/65): −67.8%, win rate 51.5%, profit factor 0.73
- Bollinger Bands (20, 2): −54.2%, win rate 52.3%, profit factor 0.69
- MACD (12, 26, 9): −62.8%, win rate 28.6%, profit factor 0.66
- EMA 50/100 crossover: +32.8% (only 1 trade in 2 years = effectively buy-and-hold)

**Conclusion:** single indicators from strategy-v3 on daily ETH **have no edge**. This isn't a reason to change the strategy — it's an argument for its discipline: the rule "3 of 5 base conditions" + funding/OI/whale ratio as filters are critically needed; without them, TA on ETH in 2024-2026 = loss.

**Created:**
- `wiki/strategy-v3-baseline-backtest.md` — full report with interpretation and test limitations.
- `wiki/index.md` — added a link in the "Strategy" section.

**Technical artifacts:**
- venv `.venv/` (pandas, numpy, yfinance, matplotlib) for dependency isolation.
- Reports and PNGs in `.agents/skills/backtesting-trading-strategies/reports/`.

**What wasn't tested (skill limitations):**
- Timeframe 4h/1h (skill hardcodes 1d).
- Funding / OI / whale ratio (yfinance doesn't provide them).
- Combo logic "3 of 5" and multi-TP exits.
- Prohibitive conditions (news blocker, BTC correlation).

**Further options:** Variant B — custom python strategy on OHLC (~50% of rules). Variant C — full backtest with Bybit API (perp + funding + OI). Decision on B/C deferred.

## 2026-04-29 — Strategy v4: integration of risk-management and news-analyst skills

**Operation:** created a new strategy version [[strategy-v4]] based on the analysis of two installed skills (`risk-management` from 0xhubed/agent-trading-arena, `market-news-analyst` from tradermonty/claude-trading-skills) and [[strategy-v3-baseline-backtest]]. v3 not modified (immutable per CLAUDE.md), kept as historical reference.

**What v4 adds (4 changes, discussed and approved by curator):**

1. **Multi-TF Alignment as a mandatory pre-check** — new section before entry conditions. Requires 4h + 1h + 15m alignment in the trade direction before evaluating the 5 base conditions. Source: `risk-management` pattern "Multi-timeframe bearish alignment" (success rate 88%, 383 samples, 99% confidence).

2. **Prohibitive conditions extended by 2 items** (mirrored for long/short):
   - Mixed-market momentum trade (1D MACD trendless + momentum entry)
   - Counter-trend in a bearish/bullish market (1D MACD against + BTC EMA200 against)
   Source: "Avoid momentum-following in mixed markets" (75%/33), "Contrarian LONG entries in bearish markets" (0-30% success).

3. **New "Financial news" section with the Impact Score formula**: `(Price Impact × Breadth) × Forward Modifier` with ETH-adapted thresholds (Severe ≥5%, Major 3-5%, Moderate 1-3%, Minor <1%). Decision thresholds: ≥20 = skip, 10-20 = halve size, <10 = informational. Prohibitive headlines (any Impact): core-protocol or L2 hack, regulatory action, macro headline within 1-2 hours. Source: impact-scoring methodology from market-news-analyst, adapted for crypto.

4. **Weekly review — leverage outcome accounting**: separate P&L tracking for trades where 5x leverage was actually required vs not. Trigger: alarming signal from risk-management "High leverage 4x-5x with optimal risk = 0% success / 132 samples / 50% confidence". Decision: don't change leverage (low confidence), but measure. After 30+ observations — re-evaluate.

**What wasn't carried over from skills (deliberately rejected):**
- Concrete trade-frequency limits (high-freq modes, not relevant)
- 6-step news-analyst workflow (no time budget, 30-40 min/day)
- Pattern comparison (consistent/amplified/dampened/inverse) — rejected by curator as adding cognitive load

**What didn't change vs v3:**
- Position size, $25 risk, R:R 1:3-1:5, 5x leverage (under observation)
- Core indicators, multi-TP configuration
- Main principle "the trade should work on its own"

**Created/Updated:**
- `raw/strategy-v4.md` — new canonical strategy version (immutable after creation)
- `wiki/index.md` — v4 marked as CURRENT, v3 as historical reference

**Follow-up (not done in this session):**
- `wiki/trading-strategy.md` — update to point to v4
- `wiki/entry-rules-long.md` — sync with v4 (news section now scored, add multi-TF pre-check, add 2 prohibitive)
- `wiki/entry-rules-short.md` — create (mirror page)
- Concept pages planned: `multi-tf-alignment`, `news-impact-score`, `leverage-accounting`

---

## 2026-04-29 — Wiki sync with strategy-v4 + creation of entry-rules-short

**Operation:** closed three of four follow-ups from the previous entry. Wiki fully migrated to [[strategy-v4]] as the active source; concept pages for new sections remain planned.

**Updated:**
- `wiki/trading-strategy.md` — Summary/Sources/Last updated switched to v4. All inline citations `(source: strategy-v3.md)` replaced with `strategy-v4.md` (numeric parameters didn't change in v4, citations stay accurate). Added new section "Pre-checks before each entry" with brief multi-TF alignment and news Impact Score description (details — in entry-rules-* pages). In "Target metrics" added a paragraph about weekly leverage outcome accounting. Version history extended with the v4 entry.
- `wiki/entry-rules-long.md` — synced with v4: old "Financial news" section (categories) replaced with "Pre-check 2 — News Impact Score" (formula + three scales + decision thresholds). Added new section "Pre-check 1 — Multi-TF Alignment" before base conditions. In the prohibitive list added 2 items: mixed-market momentum trade, counter-trend in a bearish market (1D MACD <0 + BTC <EMA200). Check order rewritten as 6 steps instead of 5. All sources switched from strategy-v3.md to strategy-v4.md.
- `wiki/index.md` — `entry-rules-short` promoted from "planned" to active "Concepts" with description. In planned added three new concepts: `multi-tf-alignment`, `news-impact-score`, `leverage-accounting`. Old planned `news-check` kept with a note that it's partially absorbed by `news-impact-score` — merge decision deferred. `Last updated` refreshed.

**Created:**
- `wiki/entry-rules-short.md` — new page, mirror of entry-rules-long. Identical structure: main question (down 4-7%) → multi-TF alignment for short → news Impact Score (mirror interpretation of bullish/bearish) → 5 base conditions (RSI >65/>60, whale ratio <0.8 or declining, etc.) → 6 bonus confirmations → 7 prohibitive (including counter-trend in a bullish market: 1D MACD >0 + BTC >EMA200 with a fresh break). Added a short section "Short-specific notes on ETH" with three observations for future expansion (short squeezes more frequent, funding ≠ setup, wicks vs close above the high) — no statistics yet, notes for future trades.

**Decisions on entry-rules-short content:**
- Impact Score scales not duplicated in short — pointer to entry-rules-long to avoid two sources of truth. If scales change, only one place gets updated.
- Prohibitive headline about ETH/L2 core-protocol hack also included in short, despite the bearish narrative. Argument: on hack day volatility is unpredictable in both directions, no short either.
- Multi-TF alignment pattern in risk-management is calibrated specifically on bearish scenarios (88% / 383 samples) — flagged as "extra weight" for short.
- Short-specific notes carved out as a separate section, not dissolved into the rules — so weekly review can see which observations were confirmed by live trades.

**What wasn't done (still in follow-up):**
- Concept pages `multi-tf-alignment`, `news-impact-score`, `leverage-accounting` — still inline in entry-rules-* and trading-strategy. Will expand once live material appears (first multi-TF alignment trade, first real-news Impact Score, first ≥10 trades for leverage accounting).
- Decision on `news-check` vs `news-impact-score` — both kept planned; merge or replacement when writing the concept.
- Inline citations `(source: strategy-v3.md)` in trading-strategy.md replaced with v4. If v4 actually introduces new numeric parameters (absent in v3), new citations will be added — but in current v4 the numbers haven't changed.

**Graph (expected state):** [[strategy-v4]] becomes the new central source; [[strategy-v3]] and [[strategy-v3-baseline-backtest]] are linked historical nodes. [[trading-strategy]], [[entry-rules-long]], [[entry-rules-short]] are three first-order pages referencing [[strategy-v4]]. [[entry-rules-long]] ↔ [[entry-rules-short]] — mutual link as mirror documents.

**Next:** wait for the first real trade under v4, discuss at review — which of the new pre-checks actually fired, which turned out to be noise, which threshold settings (especially Impact Score) need calibration. Concept pages get expanded based on live material.

---

## 2026-04-30 — Bulk RU → EN translation + Vale/LanguageTool tooling

**Operation:** translated the entire `wiki/` from Russian to English following the new "docs in English, chat in Russian" rule (memory: `feedback_language_split.md`). Installed and configured prose-checking tooling so every future English doc edit gets linted automatically.

**Translated (content unchanged, language only):**
- `wiki/index.md`
- `wiki/trading-strategy.md`
- `wiki/entry-rules-long.md`
- `wiki/entry-rules-short.md`
- `wiki/strategy-v3-baseline-backtest.md`
- `wiki/log.md` (this file — historical entries above this line are translated; append-only convention preserved)

`raw/` not touched (immutable per CLAUDE.md). Wiki-link filenames (`[[entry-rules-long]]` etc.) were already lowercase-hyphen English and stayed unchanged. User quotes and citations preserved.

**Tooling installed:**
- `vale` 3.14.1 (`brew install vale`) — style linter, configured with Microsoft + write-good packages.
- `languagetool` 6.7 (`brew install languagetool`) — grammar checker.
- `Trading/.vale.ini` — config tuned for trading wiki: disabled overly strict rules (`Microsoft.Headings`, `Microsoft.Acronyms`, `Microsoft.Hyphens`, `Microsoft.Dashes`, `Microsoft.DateOrder`, `Microsoft.Quotes`, `Microsoft.Foreign`, `Microsoft.Auto`, `Microsoft.HeadingColons`, `Microsoft.Terms`); downgraded `write-good.E-Prime` and `write-good.TooWordy` from error to suggestion. Spaced em-dashes preserved as stylistic choice.
- `Trading/.vale/styles/config/vocabularies/Trading/accept.txt` — domain vocab: Bybit, Ethereum, indicator acronyms (RSI/MACD/EMA/BOLL), candle structure (HH/HL/LH/LL), exchange and market-maker names (Binance, Coinbase, Hyperliquid, etc.), python tooling (yfinance, numpy, pandas), and other wiki terminology.
- `Trading/.gitignore` — ignores `.vale/styles/` (auto-synced by `vale sync`).

**Process:** for each file — full translate → `vale` → fix findings → `vale` again until 0 errors / 0 warnings. Most fixes were mechanical: switching to contracted forms (`don't`, `isn't`, `doesn't`), replacing Latin abbreviations with English equivalents, and adding domain terms to the vocab when Vale flagged them as misspellings.

**Memory translated alongside:**
- `feedback_no_setup_followup.md`, `user_timezone.md`, `feedback_language_split.md` — all bodies translated to English, descriptions kept already-English from previous edits.
- `MEMORY.md` index — three entries rewritten in English.
- `feedback_language_split.md` extended with the "Prose-checking after writing/translating English docs" section codifying the Vale + LanguageTool workflow as a persistent rule.

**Why the bulk pass now (not incremental):** user explicitly requested it, citing the value of a single coherent pass over slow file-by-file drift across many sessions. One large diff, one log entry, one consistent terminology pass.

**Follow-up:** none required. Future doc edits run through the lint workflow automatically.

---

## 2026-04-30 — Strategy v5 launched + scheduled remote agent for paper-trading journal

**Operation:** drafted strategy v5 as a frequency-and-coverage iteration. Goal: lift expected monthly P&L from v4's effective ~$30 (5 setups × 25% catch rate at manual scans) to **$200-500/month** by relaxing thresholds, adding range trades, graduated position sizing, and scheduled remote agent for passive monitoring.

**Created:**
- `raw/strategy-v5.md` — new canonical strategy version (immutable after creation per CLAUDE.md). English (per language-split memory rule).
- `wiki/range-trade-rules.md` — new concept page for the v5 range-trade subcategory (mean-reversion when 4h MACD ≈ 0 + ATR contracting + clear horizontal range).
- `wiki/trading-journal-v5.md` — append-only journal stub for the 2-week paper-trading test (2026-04-30 → 2026-05-14). Will be filled by the scheduled remote agent and by manual entries during chat sessions.

**Updated:**
- `wiki/index.md` — v5 promoted to CURRENT, v4 → historical reference, v3 → older reference. Added `range-trade-rules` and `trading-journal-v5` to active Concepts. Last updated note refreshed.
- `wiki/trading-strategy.md` — Summary/Sources/Last updated switched to v5. Target parameters table rewritten for new tier risk schedule, R:R, frequency, and the dollar-based monthly target ($200-350 Tier 1, $500 Tier 2 stretch). Pre-checks section mentions range pre-check as alternative path. Strategy structure section adds `range-trade-rules` link. Target metrics section adds Tier promotion/demotion tracking and range vs trend split. Version history entry for v5.
- `wiki/entry-rules-long.md` — main potential question lowered from 4-7% to 2.5-4% (with $60-100 profit target instead of $100-150). Mentions `range-trade-rules` as alternative for shorter-range plays. All inline `(source: strategy-v4.md)` citations replaced with `strategy-v5.md`. Sources field updated.
- `wiki/entry-rules-short.md` — mirror updates: 2.5-4%, range-trade-rules link, source citations.

**Strategy v5 content highlights (full changelog inside `raw/strategy-v5.md`):**

1. **Lowered potential threshold** for trend trades: 4-7% → 2.5-4%.
2. **Lowered R:R**: minimum 1:3 → 1:2, target 1:5 → 1:3.5. TP levels: TP1 1:1, TP2 1:2 (was 1:2.5), TP3 1:3.5+ (was 1:5+).
3. **Added RANGE-trade subcategory** — entirely new section with own pre-check (no multi-TF alignment), entry rules (rejection candle at edge), 2 TPs (midpoint + opposite edge), smaller size ($15 Tier 1), higher target win rate (60-65%).
4. **Graduated position sizing**: $25 → $30 (Tier 1 initial) → $40 (Tier 2 after 30 valid setups + ≥45% win rate). Demotion to $20 if losses > $300 in any 7-day window.
5. **Scheduled remote agent** (passive monitoring layer) — see below.
6. **Margin per trade relaxed** 40% → 50% (to accommodate Tier 2 positions on tight SL setups).
7. **Psychology rule #9** — "trust routine alerts but still run manual checklist".
8. **Daily routine restructured** — passive layer at top, manual scans become supplements.

**Why v5 was written before the routine:** trader requested it (chat 2026-04-30). Routine needs the latest strategy doc to evaluate against — by writing v5 first, the routine prompt can reference it directly without baking strategy logic into the prompt itself.

**What was deliberately rejected (recorded in v5 changelog):**
- Removing the "counter-trend in bearish market" prohibitive — empirically too dangerous (`risk-management`: 0-30% success rate, 132+ samples).
- Variant 3 from brainstorm ($60 risk, R:R 1:1.5) — too aggressive for current $2,200 capital.
- Auto-execution by routine — violates "decision before entry" principle. Routine alerts, human enters.

**Scheduled remote agent setup (next step in this session):**

- Routine name: `eth-paper-journal`
- Schedule: cron `0 3,8,16 * * *` UTC = 10:00 / 15:00 / 23:00 ICT
- Tools: Bash, Read, Write, Edit, Glob, Grep
- MCP: Gmail (for email alerts to `hellokbbureau@gmail.com`)
- Repo: `inBuro/Brain`
- Test period: 2 weeks (2026-04-30 → 2026-05-14)
- After 2 weeks: review journal stats, decide if routine pays off

**What the routine does each run:**
1. Reads current strategy from repo (`wiki/trading-strategy.md`, `wiki/entry-rules-*.md`, `wiki/range-trade-rules.md`)
2. Fetches Bybit market data via public REST API
3. Computes indicators in Python
4. Evaluates strategy rules (excluding news Impact Score and whale ratio — flagged for manual verification)
5. Appends entry to `wiki/trading-journal-v5.md` (always, even on no-setup runs)
6. Sends email via Gmail MCP if SETUP_LONG / SETUP_SHORT / SETUP_RANGE detected
7. Commits + pushes the journal update

**Linting:** `raw/strategy-v5.md` and all wiki updates ran through Vale + LanguageTool per the language-split workflow. Vocab extended for new domain terms (TradingView, EMAs, cron, recalibrated, drawdowns).

**Next:** create the routine via the `schedule` skill, manually trigger a test run, verify end-to-end (data fetch → analysis → journal append → email if setup → commit/push), then let cron take over for 2 weeks.

---

## 2026-05-01 — Pending-orders supplement to v5 + 2-week review one-shot routine

**Operation:** added a pending-orders capability (concept page, routine prompt update, memory rule) so that probable setups generate ready-to-paste limit orders rather than just watch points. Scheduled a one-shot remote agent for 2026-05-14 09:00 ICT to email a 2-week review of the eth-paper-journal routine.

**Why:** trader requested 2026-05-01 — manual scans 3x/day miss many setup zones because price doesn't always touch them within a scan window. A pending order with full structure (entry / SL / TP1/2/3 / size / time validity / manual cancel triggers) closes the gap without forcing the trader to draft each order at fill time. Trader also asked Claude to remind them about the 2-week mark rather than relying on memory.

**Created:**
- `wiki/pending-orders.md` — new concept page. Defines when pending orders are appropriate (5 conditions all hold) and when they aren't (7 disqualifiers, including macro events in next 12h, counter-trend bearish blocking LONG, conditions still developing, news Impact Score in grey zone, etc.). Includes a structured chat-output template with all required fields and per-direction notes (LONG/SHORT/RANGE). Range trades are the natural fit; trend trades need stricter eligibility.

**Updated:**
- `wiki/index.md` — added `pending-orders` link to active Concepts section.
- `wiki/trading-strategy.md` — added pending-orders link in Entries subsection of Strategy structure.
- Routine prompt for `eth-paper-journal` (`trig_0169HXZsfncrZeL5dD3MwMfr`) — extended to evaluate pending-order eligibility per direction (LIVE_SETUP / PENDING_ELIGIBLE / WATCH / BLOCKED), output structured pending-order suggestions in the journal entry, and send email when EITHER live setup OR pending suggestion exists (not just live setups).

**Memory:**
- `feedback_pending_orders.md` — feedback memory: in market checks, when probable setup with all gating criteria satisfied, proactively suggest concrete pending order. Reference [[pending-orders]] for rules.
- `project_2week_review_reminder.md` — project memory: 2-week review scheduled for 2026-05-14 09:00 ICT via one-shot routine; if email doesn't arrive, raise topic in chat.
- `MEMORY.md` — index updated with both new entries.

**Scheduled remote agent:**
- One-shot routine `eth-paper-journal-2week-review` (`trig_01SgfeZ7dayRSNiEjbR8NmWp`) — fires once at 2026-05-14T02:00:00Z (= 09:00 ICT). Aggregates stats from `wiki/trading-journal-v5.md` (decision distribution, pending-order count, data source distribution, top NO_SETUP blockers, BTC EMA200 status), emits a recommendation (CONTINUE / CONTINUE WITH REFINEMENT / REVERT / PAUSE), emails to `hellokbbureau@gmail.com`, appends report to journal, commits + pushes.

**Linting:** all wiki and memory updates passed Vale + LanguageTool with disable list. Vocab extended for `[Tt]rendlines?`, `eth-paper-journal`, `[Aa]llowlist(?:ed)?`.

**Follow-up:** none required — routine continues running 3x/day with new pending-order logic; one-shot reminder fires automatically on 2026-05-14.

