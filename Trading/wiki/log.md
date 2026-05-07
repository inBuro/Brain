# Wiki Operations Log

**Summary**: Append-only log of wiki operations — ingests, page creation, lints, reviews.
**Sources**: operational page (no upstream source)
**Last updated**: 2026-05-06

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

---

## 2026-05-01 — Trading hours window 09:00-17:00 ICT (v5 supplement)

**Operation:** added explicit trading window to v5 — new entries (live or pending) only allowed 09:00-17:00 ICT, every day including weekends. Replaces the older "after 22:00 local — no new entries" rule with a symmetric morning + evening cutoff.

**Why:** trader question 2026-05-01 about weekend trading prompted this. The crypto market trades 24/7, but liquidity matters: 09-17 ICT covers Asia morning + Europe morning (best ETH liquidity). 17-22 ICT (US morning) brings news pumps and fakeouts; 22-09 ICT is dead/thin. Weekends have lower institutional flow and wider spreads — fitting in the same 09-17 window keeps discipline consistent.

**Created:**
- `wiki/trading-hours.md` — concept page. Defines the window, what's allowed/not allowed inside vs outside, weekend nuances (lower liquidity → setups should be cleaner, prefer to skip marginal weekend setups), routine handling (23:00 ICT cron is OUTSIDE window — journal entry yes, email no), interaction with other rules (pending-orders cap at 17:00 ICT validity, late-day setups 16:00-17:00 with −25% size, macro-event blocker independent of window).

**Updated:**
- `wiki/index.md` — added `trading-hours` to active Concepts.
- `wiki/trading-strategy.md` — added `trading-hours` to Entries subsection of Strategy structure.
- Routine prompt for `eth-paper-journal` (`trig_0169HXZsfncrZeL5dD3MwMfr`) — added Step 5c (window status check), updated journal entry template (window status field), updated Step 7 (email only when INSIDE window AND setup/pending), updated commit message format to include window status.

**Memory:**
- `feedback_trading_window.md` — feedback memory for me: in every market analysis, check current ICT time; if outside 09-17 → no new entries suggested even if setup valid; pending suggestions cap time validity at 17:00 ICT.
- `MEMORY.md` — index updated.

**Linting:** all updates passed Vale + LanguageTool.

**Decided NOT to:**
- Replace 22:00 rule entirely in v5 raw doc — that document is immutable. The 09-17 window is a supplement that takes precedence; 22:00 remains as legacy fallback in psychology-rules text.
- Differentiate weekday vs weekend window — single 09-17 rule for simplicity. If weekend behavior diverges meaningfully in the 2-week paper-test review, can split later.
- Auto-disable routine outside window — routine still runs and journal-logs, just doesn't email. Preserves trend-tracking data continuity.

**Next:** routine 23:00 ICT cron (16:00 UTC) tonight will be the first to evaluate window status — should write `**Window status**: OUTSIDE` and skip email. Verify in journal tomorrow morning.


---

## 2026-05-06 — Capital scaled to $3,000 (deposit top-up)

**Trigger**: User raised Bybit deposit from ~$2,200 to $3,000. Asked to bake the v5 risk percentages into a new minimum trade size based on the new sum.

**Decision**: Keep the v5 percentage schedule (1.4% Tier 1 / 1.8% Tier 2 / 0.93% Tier 0) intact; rescale only the absolute dollar values. v5 raw stays untouched per the immutability rule for `raw/`.

**Changes**:
- Created `wiki/position-sizing.md` (was on the planned list) — captures live capital ($3,000) and the rescaled risk schedule: trend $42 / $54 / $28; range $21 / $27 / $14; demotion threshold $400 / 7d; max margin $1,500. Includes a "When to recompute" recipe for the next deposit change.
- Updated `wiki/trading-strategy.md`: capital line ($2,200 → $3,000), Target parameters table (Tier 1 $30 → $42, Tier 2 $40 → $54, full TP3 ~$97 / ~$124, moderate ~$38 / ~$49), monthly targets ($280-490 Tier 1, ~$675 Tier 2 stretch), tier promotion/demotion paragraph (now references percentages + position-sizing for live dollars).
- Updated `wiki/index.md`: moved position-sizing from Concepts (planned) → active under Concepts, with one-line description.

**Math sanity check**: $42 / 1.4% = $3,000 ✓. TP math (30/30/40 split, R:R 1/2/3.5): Tier 1 full TP3 = $42 × (0.3·1 + 0.3·2 + 0.4·3.5) = $96.60 ≈ $97; moderate (TP1+TP2 only) = $37.80 ≈ $38. Tier 2 full TP3 = $124.20 ≈ $124; moderate = $48.60 ≈ $49.

**Not changed**: strategy-v5 raw source (immutable), entry/exit rule pages, trading-hours, pending-orders, range-trade-rules — all rule logic stays the same, only dollar denominations move.

**Next**: next setup taken should use Tier 1 = $42 risk; first time the new size flows through the strategy will show in the journal entry.

---

## 2026-05-06 (afternoon) — Window widened 09-22 ICT + dollars cleared from strategy page

**Trigger**: Two design questions raised after the morning capital rescale.

**Decision A — trading hours**: Widen `trading-hours.md` window from 09:00-17:00 ICT to **09:00-22:00 ICT** (single 13-hour window). Rationale: trader checks the terminal throughout the day anyway to send scan requests, so a single wide window beats two narrow ones; widening to 22:00 captures the London/NY overlap (20:00-22:00 ICT = 13:00-15:00 UTC), which is the highest-volume slice of the crypto day for ETH. Upper bound now matches the original v5 source rule ("no entries after 22:00 local").

**Decision B — dollars vs percentages**: Make `position-sizing.md` the **single source of truth for current dollar values**. Strip explicit dollar amounts from `trading-strategy.md` Target-parameters table and Target-metrics paragraph; restate everything in % of capital and R-multiples. Capital line in Context section now points to position-sizing instead of stating a number. Rationale: dollar values rot when capital changes (deposit, withdrawal, drift); percentages are invariant under capital changes; one place to edit on rescale.

**Changes**:
- `wiki/trading-hours.md`: Summary, "The window", "Why this window", weekend nuance, pending-orders cap, late-day setup window, macro example, Migration history — all rewritten for 09-22.
- `wiki/trading-strategy.md`: Summary (graduated sizing now stated as 1.4% → 1.8%), Context paragraph (capital fact moved to position-sizing), Target parameters table (rows now in % / R), Target metrics paragraph (monthly targets in % of capital), Tier promotion/demotion paragraph (in %), v5 changelog (no dollars).
- `wiki/index.md`: trading-hours line updated to mention 09-22 widening; position-sizing line clarifies role as single source of truth for dollars.

**Math sanity check on Tier promotion percentages**: 1.4% / 1.8% / 0.93% match the absolute dollars on position-sizing.md ($42 / $54 / $28 at $3,000 capital). Demotion threshold $400 = 13.3% of $3,000 ≈ 13% as stated.

**Not changed**: `position-sizing.md` (still has the dollar table — it's where dollars now live), entry/range/pending-orders rule pages, raw sources.

**Open question for next session**: should `trader-profile` finally be created? Capital fact currently lives in position-sizing because there's no profile page; profile would be a more natural home, with position-sizing referencing it for the capital input.

---

## 2026-05-06 (evening) — Setup Verdict Format

**Source:** chat 2026-05-06 (live market session where the verdict got buried under multiple rounds of indicator-config back-and-forth before the trader could tell whether action was needed).

**Trigger:** trader explicitly requested an at-a-glance header at the top of every market-check response. Quote: "выделяется в этом сложившийся сетап, так чтобы я сразу увидел, что сетап есть или что сетапа нет." Without it, the verdict drifts into the body and the 30-40 min/day attention budget is spent on triage instead of decision.

**Created:**
- `wiki/setup-verdict-format.md` — concept page. Defines the standard header opening every market analysis response. Three states: 🟢 СЕТАП ЕСТЬ / 🟡 СЕТАП ФОРМИРУЕТСЯ / 🔴 СЕТАПА НЕТ. Each header carries three lines: тип, главная причина (one sentence, no hedging), следующее действие или следующая проверка (absolute ICT time + what to send). Full chart reading and checklists go BELOW the header after `---`. Mapping table aligns the colored states with the [[trading-journal-v5]] decision codes (`SETUP_LONG` / `PENDING_ELIGIBLE` / watch / `NO_SETUP` / `RUN_ERROR`). Anti-pattern list captures the failure modes: indicator-config preamble, multi-verdict hedging, "you decide" punts, hedging inside Главная причина, relative time, buried-verdict summaries.

**Updated:**
- `wiki/index.md` — `setup-verdict-format` added to active Concepts; "Last updated" line extended.
- `Claude.md` — "Live market analysis behavior" section now opens with a bullet pointing to `[[setup-verdict-format]]` so the verdict-first rule is enforced before the existing "no setup → next checkpoint" rule.

**Decided NOT to:**
- Add a fourth state (e.g. 🟠 "marginal — your call"). The strategy is binary on entries (rules met or not); ambiguity belongs in the body, not the header. Trader still makes the final click, but Claude doesn't punt the decision into the header.
- Apply this to the `eth-paper-journal` routine output yet — the routine already produces structured journal entries with decision codes; adding the colored header to its emails is a separate small change to do after the 2026-05-14 2-week review if the format proves itself in manual sessions first.

**Re-do note:** an earlier attempt to ship this from a parallel agent session (commit `8bca590` on a `claude/suspicious-johnson-e3961f` git `worktree`) was rolled back because the branch had been forked from `origin/main` instead of `chore/rename-to-fadercraft` — its baseline still had the 09-17 trading window and would have re-introduced stale text on merge. Re-implemented here on the correct base; content essentially the same, but text examples (e.g. "Outside trading window" example) reference the current 09:00-22:00 ICT window from [[trading-hours]].

**Next:** apply the header on every subsequent market analysis response. Re-check the format after the 2026-05-14 2-week review — if the trader reports it's redundant (e.g. always reading full body anyway), drop the body sections he ignores; if useful, port it into routine emails.

---

## 2026-05-06 (evening, late) — Asset Context Read protocol

**Trigger:** trader shared LINKUSDT chart and asked for an analysis. Strategy v5 is explicitly bound to ETH/USDT, so a strict-discipline answer was 🔴 "off-instrument" — but the trader still benefits from a structured analytical read of correlated/curiosity assets, especially BTC (which already has a privileged role via prohibitive condition #6 in [[entry-rules-long]]). Without a documented protocol, off-instrument reads risk drifting into pseudo-setups with phantom R:R numbers.

**Decision:** add a fourth verdict state 🔵 КОНТЕКСТНОЕ ЧТЕНИЕ, scoped exclusively to non-ETH assets, which can't carry entry / SL / TP / size. Strategy verdicts (🟢🟡🔴) and context reads (🔵) never mix in one response. This isn't the previously-rejected "🟠 marginal" 4th state — that one would have hedged within ETH decisions, which we still refuse. 🔵 is a different axis (instrument scope), not a hedge.

**Created:**
- `wiki/asset-context-read.md` — full protocol page. Defines: (a) two-mode separation table — Strategy analysis (ETH only, 🟢🟡🔴) vs Context read (other assets, 🔵); (b) the 🔵 header template (Инструмент / Что вижу / Применимость к ETH); (c) body sections — TF structure, Bybit Data context, synthesis, applicability to ETH, mandatory non-action note; (d) what body MUST NOT contain — entry/SL/TP, R:R numbers, "looks like a setup" language, Tier sizing references; (e) special-case roles per asset (BTC privileged via prohibitive #6; alts as regime check; Bybit pre-IPO stocks with thin-market disclaimer); (f) trigger table for choosing mode; (g) anti-patterns.

**Updated:**
- `wiki/setup-verdict-format.md` — added the 🔵 fourth state section between the 🔴 template and Strict rules; updated Strict rules header bullet to mention all four states; updated "One verdict per response" rule to clarify ETH and off-instrument reads never mix.
- `Claude.md` — Live market analysis bullet now references both 🟢🟡🔴 (ETH) and 🔵 (off-instrument) routing into [[asset-context-read]].
- `wiki/index.md` — `asset-context-read` added to Concepts; setup-verdict-format line updated to mention 🔵.

**Decided NOT to:**
- Backtest v5 on LINK/BTC and produce per-instrument Tier sizes. That's a 1-month research project and wasn't what the trader asked for. The asked-for capability is **analytical reads**, not multi-asset trading. If the trader later wants to actually trade LINK/SOL with v5-style discipline, that's a v6 conversation requiring fresh backtests.
- Allow 🔵 on ETH/USDT during a "neutral" period. ETH is the traded instrument; on ETH the strategy must commit to 🟢🟡🔴 every time. Punting ETH into 🔵 would re-introduce the "ambiguity in header" anti-pattern.
- Add a separate context-read journal yet. Manual context reads aren't worth journaling individually; if patterns emerge later (e.g. BTC-context reads consistently flip the prohibitive #6 verdict on subsequent ETH trades), we can add a small `context-read-log.md` later.

**Next:** apply the 🔵 protocol on the next non-ETH question. The LINKUSDT response sent in the same chat (just before this log entry) is the canonical first example — header, structural read, on-chain context, "Применимость к ETH" line, explicit non-action close.

**2026-05-06 (refinement, same evening):** trader clarified that BTC charts specifically are **never** to be treated as a standalone analysis request — they're always input data for the in-progress ETH analysis. Updated `wiki/asset-context-read.md`: BTC special case now states the header should be the ETH verdict (🟢🟡🔴) with BTC findings folded into "Главная причина" or body sections (multi-TF alignment, prohibitive #6 check); 🔵 standalone is reserved for alts and stocks. Added an example response shape and a fallback question for the edge case where only a BTC chart arrives with no prior ETH context. Triggers table updated accordingly.

---

## 2026-05-07 — Routine schedule shifted to symmetric 09/15/21 ICT

**Operation:** moved `eth-paper-journal` routine cron from `0 3,8,16 * * *` UTC (10/15/23 ICT) to `0 2,8,14 * * *` UTC (**09/15/21 ICT**). All three slots now fall inside the 09-22 ICT trading window — outside-window 23:00 ICT run cancelled.

**Why:** the morning slot at 10:00 ICT created a 1h gap between window opening and first automated check, leaving the trader without fresh routine data when the trading day starts. The 23:00 ICT outside-window run produced informational journal entries with no email — useful for backtesting continuity but not actionable. Symmetric layout 09/15/21 places one run at window open, one at midpoint, one near close — full coverage with no idle slots.

**Updated:**
- Routine `eth-paper-journal` (`trig_0169HXZsfncrZeL5dD3MwMfr`) — cron updated via `schedule` skill; prompt simplified by removing outside-window branch (all runs now INSIDE)
- `wiki/trading-hours.md` — "How the routine handles this" rewritten; obsolete 23:00 ICT outside-window bullet removed; `Last updated` bumped
- `wiki/trading-journal-v5.md` — header schedule line updated to 09/15/21 ICT
- `wiki/trading-strategy.md` — new "Passive monitoring routine" section added

**What didn't change:**
- One-shot review routine `eth-paper-journal-2week-review` (`trig_01SgfeZ7dayRSNiEjbR8NmWp`) — still scheduled for 2026-05-14 09:00 ICT, which now coincides with the regular 09:00 ICT slot (same morning will produce both a normal journal entry and the 2-week review email)
- Journal entry format in `wiki/trading-journal-v5.md` — unchanged
- Email logic — still triggered only on SETUP_* or PENDING_ELIGIBLE; informational/no-setup runs still don't email
- `raw/strategy-v5.md` — immutable per CLAUDE.md; still mentions 10/15/23 ICT, will be reconciled at next major strategy revision

**Next:** verify first 09:00 ICT run tomorrow (2026-05-08) appends to journal correctly. If 2-week review on 2026-05-14 produces double output (regular + review), document interaction.

---

## 2026-05-07 — News-Impact-Score page + "Claude pulls the news himself" rule

**Trigger:** live market session 2026-05-07. After analyzing 4h/1h/15m ETH charts, Claude offered to fetch news instead of asking the trader to provide them. Trader's response: "запиши в вики самостоятельно всегда смотреть на новости" — i.e. codify it as a permanent rule. The previous wording in [[entry-rules-long]] / [[entry-rules-short]] said "open Bybit Feed → News", which was ambiguous about who opens it; the trader's intent: Claude does, every time.

**Created:**
- `wiki/news-impact-score.md` — full protocol page (was on the planned list since strategy-v4). Defines: who pulls the news (Claude, via WebSearch + WebFetch on Fed FOMC calendar + BLS CPI schedule + reading any Bybit Feed screenshot the trader includes); the formula `(Price Impact × Breadth Multiplier) × Forward Modifier`; thresholds (≥20 skip / 10-20 halve size / <10 informational); prohibitive headlines (core-protocol/L2 hack, regulatory action, macro within next 1-2h); output format in market-check responses (macro-blocker table, top 3-5 headlines, BTC-context line, computed score, sources block).

**Updated:**
- `wiki/entry-rules-long.md` — Pre-check 2 paragraph rewritten: "Claude pulls the news himself (WebSearch + Fed/BLS calendar fetch + reading any Bybit Feed screenshot the trader provided)" + pointer to the new page. Inline formula tables left in place (one source of truth still here for now; a follow-up consolidation could move them to `news-impact-score.md` and reference from here).
- `wiki/entry-rules-short.md` — mirror update.
- `wiki/index.md` — `news-impact-score` promoted from "Concepts (planned)" to active "Concepts" with description; "Last updated" line refreshed.

**Decided NOT to:**
- Move the formula tables out of `entry-rules-long.md` yet. The page still acts as a self-contained checklist for setup evaluation; pulling tables out now would make readers chase links mid-checklist. If the formula evolves (separate scales for crypto vs macro news, for example), then split.
- Add the rule to [[Claude.md]] root section. The "Live market analysis behavior" block already routes through [[setup-verdict-format]] which now references [[news-impact-score]] indirectly via the entry-rules pages. Adding another bullet would duplicate.
- Auto-pull news inside the `eth-paper-journal` routine. The routine already documents in [[trading-journal-v5]] that news Impact Score is "flagged for manual verification" — Claude-pulls-news applies to chat sessions where a real LLM is in the loop. Routine remains scoped to deterministic chart math.

**Memory:** new feedback memory `feedback_news_pulled_by_claude.md` in trading namespace + MEMORY.md index entry.

**Linting:** Vale + LanguageTool clean on the new page and updated paragraphs.

**Next:** apply the rule on every subsequent market check. The current 2026-05-07 session is the canonical first example — News Impact Score subsection in the verdict body, computed score, sources block at the end.

---

## 2026-05-07 — Routine moved hourly + email replaced with Telegram pushes

**Trigger:** trader asked to drop the email channel in favor of cross-device push notifications (iPhone + MacBook). Same session also asked to tighten cron from 3×/day to higher frequency. The schedule skill imposed a hard minimum of 1h interval (`*/30` rejected), so settled on hourly across the full 09:00-22:00 ICT window.

**Updated:**
- Routine `eth-paper-journal` (`trig_0169HXZsfncrZeL5dD3MwMfr`):
  - **Cron**: `0 3,8,16 * * *` UTC (10/15/23 ICT — was 3 runs, last one outside window) → `0 2-15 * * *` UTC = **every hour 09:00 to 22:00 ICT inclusive (14 runs/day)**. All runs now inside trading window — OUTSIDE branch removed from prompt.
  - **Notification channel**: Gmail MCP → Telegram bot `@marketguardbbot` via `curl https://api.telegram.org/bot.../sendMessage`. Bot token + chat_id (540660068) hard-coded in the routine prompt (NOT in repo). Gmail MCP detached via `clear_mcp_connections: true`.
  - **Step 7 rewritten**: replaces the email block with a Markdown-formatted Telegram message including the setup type, entry/SL/TP1-3, size, one-line reason, manual-verify bullets, and a GitHub link to the full journal entry. Includes a 4000-char budget with cut-from-bottom priorities (setup+price always; manual-verify bullets drop first if needed).
  - **Step 5c (window status check) removed**: redundant since all 14 cron slots are inside window.
  - **Strategy file list extended**: now also reads `Trading/wiki/news-impact-score.md` (added in the prior log entry).
  - **Hard constraint added**: never write the Telegram bot token to a file in the repo or echo in commit messages.

**Why hourly and not 30-min**: schedule skill enforces a 1h minimum (`*/30` rejected by API). Hourly = 14 runs/day (vs 3 before), 4.7× improvement without additional tooling. If hourly turns out to miss critical setup-zone touches in the 30-min window between fires, the upgrade path is a Bybit WebSocket watcher on a $4-6/mo VPS that pings the routine's `/run` endpoint on real-time triggers.

**Telegram setup:**
- Bot: `@marketguardbbot` (display name: Market Guard), created by trader via @BotFather
- Chat ID: 540660068 (private chat with @yellowshoess)
- Token: stored in `~/.config/telegram/marketguard.env` mode 600 on the trader's local machine for local-side scripts; hard-coded in the routine prompt for remote access (the routine has no env-var support)
- Test message sent successfully end-to-end before the routine update; trader confirmed receipt on iPhone + MacBook

**Decided NOT to:**
- Send Telegram on `NO_SETUP` runs — would create constant noise, defeats the alert purpose. Only `SETUP_*` and `PENDING_ELIGIBLE` trigger notifications.
- Send Telegram on `RUN_ERROR` — no actionable signal for the trader; the journal entry + commit log is enough for post-hoc debugging.
- Move the bot token out of the routine prompt into a managed secret store — schedule API doesn't expose env vars; the prompt itself is the only place to put it. Token leak surface is limited (bot can only message the trader's chat_id, not arbitrary users).
- Migrate `eth-paper-journal-2week-review` (one-shot) to Telegram in this pass — that routine fires once on 2026-05-14 09:00 ICT and may want a longer-form output. Decide format closer to the date.

**Next:** verify the first hourly fire at 14:00 ICT today (manual run was triggered immediately after the update). If the journal entry shows the new prompt executed correctly and (in case of a setup) the Telegram pipeline fired, the routine is locked in. Watch for: Bybit egress allow/block, Telegram message size overflow on long pending-order suggestions, character escaping in Markdown parse mode.
