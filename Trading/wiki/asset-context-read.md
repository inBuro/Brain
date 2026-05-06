# Asset Context Read

**Summary**: Protocol for reading charts of assets that aren't the strategy's traded instrument (currently ETH/USDT). Allows useful analytical reads of correlated or curiosity assets (BTC, LINK, SOL, etc.) without pretending strategy v5 win-rate / R:R numbers apply to them. Off-instrument reads must be visually and structurally distinct from real trade verdicts.
**Sources**: chat 2026-05-06 (added in response to a LINKUSDT analysis request — needed a documented protocol so off-instrument reads don't drift into looking like v5 setups)
**Last updated**: 2026-05-06 (created as v5 supplement)

---

## Why this exists

Strategy v5 is explicitly bound to **ETH/USDT** — every win-rate, R:R, Tier-promotion, and minimum-movement number is derived from ETH-specific backtesting and live data. Applying those numbers to LINK or SOL is statistical fraud.

But the trader still wants to look at other charts:
- **BTC** as ETH context (prohibitive condition #6 in [[entry-rules-long]] depends on BTC EMA200 1D structure)
- **Correlated assets** like LINK/SOL when wondering whether a market regime is broad-alt-coin or ETH-specific
- **Curiosity reads** when a chart catches the eye

This page defines a clean way to do that without polluting the trading discipline.

## Two modes — strict separation

| Mode | Instrument | Verdict states | Suggests size/SL/TP? | Goes in [[trading-journal-v5]]? |
|---|---|---|---|---|
| **Strategy analysis** | ETH/USDT only | 🟢 🟡 🔴 (per [[setup-verdict-format]]) | Yes — full Tier-sized order parameters | Yes |
| **Context read** | Any other asset | 🔵 (only) | **No** — never | No (or in a separate context-log if we add one later) |

The two modes never mix in one response. If the user asks "что про LINK?" — that's a 🔵 context read; ETH/USDT setup verdicts are absent from that response. If the user asks about ETH — that's a strategy analysis; LINK is at most a one-line correlation note in the body.

## The 🔵 header

```markdown
# 🔵 КОНТЕКСТНОЕ ЧТЕНИЕ — <SYMBOL> @ $<PRICE>

**Инструмент:** <SYMBOL> (off-strategy — стратегия v5 на этот актив не распространяется)
**Что вижу:** <one sentence — dominant structural read on the displayed timeframe>
**Применимость к ETH:** <one sentence — does this read inform the ETH trade decision, and how?>
```

Header always at the top, followed by `---` and the body. Same discipline as [[setup-verdict-format]].

## Body — what to include

A context read should mirror the analytical depth of a strategy analysis, just without the order parameters. Suggested sections, in order:

1. **TF structure** (whatever timeframe the user shared — usually 4h or 1h):
   - Position relative to BB(20,2)
   - EMA50 / EMA100 — trend regime
   - MACD state (cross, histogram direction)
   - RSI level (with the usual >70 / <30 caveats)
   - ATR if visible

2. **Bybit Data context** (if Data-tab screenshots were shared — set TF to 1h per [[trading-hours]] guidance, not 5m):
   - Open Interest direction vs price (divergence flags squeeze/distribution)
   - Funding rate skew
   - Basis rate (futures vs index)
   - Top 100 long-short ratio (whale conviction)
   - Long-short position holder ratio

3. **Synthesis**: one paragraph — "if this were our instrument, what would I see?" — but framed in conditional voice, never as a recommendation.

4. **Applicability to ETH**: this is the load-bearing section. A LINK read is only operationally useful if it informs ETH. Examples:
   - "BTC bullish on 1D EMA200 → prohibitive #6 cleared for ETH longs" (BTC's main role in our framework)
   - "LINK/SOL all squeezing higher with weak OI → broad alt-coin short squeeze, not fundamental flow → discount any ETH momentum signal as part of the same regime"
   - "BTC dump while ETH/SOL/LINK hold up → ETH alpha is real, alignment more credible"

5. **Explicit non-action note** (mandatory closing line): "На основании этого чтения никаких ордеров на <SYMBOL> в рамках стратегии v5 не размещается."

## What body MUST NOT contain

- **Entry / SL / TP / size for non-ETH instruments.** Even if asked. Even if "obvious". The trader can act on a context read at his own discretion as a portfolio decision (spot holding, reducing exposure, etc.) — but Claude doesn't author those orders, because the strategy doesn't underwrite them.
- **R:R or win-rate claims** for non-ETH. Those numbers are ETH-specific.
- **"This looks like a setup"** language. It can look like one to the eye; the strategy doesn't say so. Use "structurally bullish on 4h" / "momentum overbought" / "OI/price divergence" — analytical, not actionable.
- **Tier sizing references.** Tier 1 / Tier 2 / $42 risk — all ETH-only.

## Special-case roles per asset

**BTCUSDT — never a standalone setup request.** Per trader instruction 2026-05-06: when the trader sends a BTC chart, this is **input data for the ongoing ETH analysis**, not a request to analyze BTC as if it were a tradable instrument. BTC is already privileged in the v5 framework via prohibitive condition #6 (BTC 1D EMA200 + 1D MACD context) and via correlation regime checks. The response should:

- Skip the standalone 🔵 КОНТЕКСТНОЕ ЧТЕНИЕ — BTC header, OR use it minimally — and immediately roll the read into the ETH verdict that the BTC chart was meant to support.
- Output the ETH verdict (🟢🟡🔴) as the primary header, with BTC findings folded into the ETH "Главная причина" or body sections (multi-TF alignment, prohibitive #6 check, regime correlation note).
- Never propose BTC entry/SL/TP — even less so than for other off-instrument assets, because the trader's framing makes clear this isn't a BTC trade question.

Example response shape when trader sends BTC chart:
```
# 🟡 СЕТАП ФОРМИРУЕТСЯ — LONG-зона $2,300–$2,341 (ETH)

**Тип:** LONG
**Главная причина:** ETH at lower BB(4h) with bullish 15m reversal; BTC 1D EMA200 cleared (prohibitive #6 OK) per the chart you sent.
**Следующая проверка:** в 10:00 ICT — пришли свежий 1h ETH + текущий BTC 1D, проверим что регим не развернулся.

---
[BTC findings as a section in the body, not as a separate verdict]
```

If the trader sends only a BTC chart with no prior ETH context in the session, ask explicitly: "это для проверки prohibitive #6 на ETH или ты хочешь отдельный read по BTC?" — default to the former.

**Other crypto majors (SOL, LINK, ARB, OP, etc.)** — broad regime check. Useful for distinguishing ETH-specific moves from alt-coin-wide regimes. No direct rule dependency in v5; informational only.

**Stocks on Bybit pre-IPO/perpetuals (ORCL, NVDA, CRCL, ZEC, etc.)** — caveat heavily. These markets are thin, news-driven, and often have weekend/overnight gaps. Bybit's USD-stock perpetuals especially: extreme funding skew is normal, basis is often broken, OI is small. A context read here should disclose limitations explicitly: "очень тонкий рынок, индикаторы могут давать ложные сигналы".

**Spot vs perpetual** — if the user has a spot position in an asset and asks for a read, the analytical answer is the same; the actionable note shifts to portfolio language ("если держишь spot и думаешь о фиксации — текущий уровень похож на overbought") rather than trade language.

## Triggers for a context read

| User says | → Mode |
|---|---|
| "что про ETH?" / shares ETH chart | Strategy analysis (🟢🟡🔴 per [[setup-verdict-format]]) |
| Shares BTC chart (any context) | **ETH analysis with BTC as input data** — see BTC special case above. Header is the ETH verdict (🟢🟡🔴), not 🔵. BTC findings go in the body. |
| "что про LINK / SOL / любой альт?" | 🔵 context read, broad regime framing |
| "посмотри ORCL / NVDA / стоки" | 🔵 context read with thin-market disclaimer |
| Shares chart of unknown asset without question | Default to 🔵 context read; ask if a strategy-style ETH read was intended |

## Anti-patterns (forbidden)

1. **Suggesting an order for non-ETH asset**, even softened with "ну если бы я держал...". Claude doesn't author those orders.
2. **Using the 🟢/🟡/🔴 verdict on non-ETH**. Those colors are reserved for ETH/USDT trade decisions per [[setup-verdict-format]]. Off-instrument = 🔵, always.
3. **Ranking non-ETH assets** ("LINK выглядит сильнее BTC сейчас"). Comparative framing slips into recommendation. State each individually; let the trader compare.
4. **Importing v5 numbers** into the read ("RSI 73 на LINK — это значит вероятность 35% на pullback по нашей статистике"). v5 statistics are ETH-derived; saying that for any other asset is wrong.

## Related pages

- [[setup-verdict-format]] — the 🟢/🟡/🔴 verdict format for ETH trades; this page extends it with the 🔵 fourth state for off-instrument
- [[trading-strategy]] — overall strategy; context-read mode preserves its ETH-only scope while allowing analytical reads of context assets
- [[entry-rules-long]] — prohibitive condition #6 (BTC 1D EMA200) is the main rule-level dependency on a non-ETH asset
- [[trading-hours]] — 1h TF default for Bybit Data widgets; same applies during context reads
