# Setup Verdict Format

**Summary**: Standard at-a-glance header that opens every market-check response — one-line verdict at the top, three lines of essence below. Without it, the verdict gets buried under indicator config, multi-TF alignment discussion, and chart reading. The trader has a 30-40 min/day attention budget and needs to answer "do I act now?" from the first line alone.
**Sources**: chat 2026-05-06 (live market session where verdict got buried under several rounds of indicator-config back-and-forth)
**Last updated**: 2026-05-06 (created)

---

## The rule

Every market analysis response — manual or routine-generated — opens with **one** of three header blocks. Header always sits at the very top, before any chart reading or indicator discussion. After the header comes `---` and then the full analysis.

### 🟢 Setup live

```markdown
# 🟢 СЕТАП ЕСТЬ — <TYPE> @ $<PRICE>

**Тип:** LONG | SHORT | RANGE_LONG | RANGE_SHORT
**Главная причина:** <one sentence — why now, no hedging>
**Следующее действие:** Enter now via limit @ $X | Place pending @ $X, SL $Y, TPs $A/$B/$C, valid 8h
```

### 🟡 Setup forming

```markdown
# 🟡 СЕТАП ФОРМИРУЕТСЯ — <TYPE>-зона $<LOW>–$<HIGH>

**Тип:** LONG | SHORT | RANGE
**Главная причина:** <one sentence — what's pending, what triggered the watch>
**Следующая проверка:** <HH:MM ICT, what to send back>
```

### 🔴 No setup

```markdown
# 🔴 СЕТАПА НЕТ

**Тип:** —
**Главная причина:** <one sentence — what's blocking>
**Следующая проверка:** <HH:MM ICT, what to send back>
```

### 🔵 Off-instrument context read (added 2026-05-06)

For any asset that isn't ETH/USDT (e.g. BTC, LINK, SOL, stocks-on-Bybit) — see [[asset-context-read]] for the full protocol. Use this header instead of 🟢/🟡/🔴; the strategy v5 verdict states are reserved for the traded instrument only.

```markdown
# 🔵 КОНТЕКСТНОЕ ЧТЕНИЕ — <SYMBOL> @ $<PRICE>

**Инструмент:** <SYMBOL> (off-strategy — стратегия v5 на этот актив не распространяется)
**Что вижу:** <one sentence — dominant structural read>
**Применимость к ETH:** <one sentence — does this read inform the ETH trade decision, and how?>
```

🔵 reads never carry entry / SL / TP / size — those belong only to a real ETH/USDT verdict. See [[asset-context-read]] anti-patterns.

## Strict rules

- **Header always at the very top.** Before any chart reading, before any indicator discussion, before any preamble. The first line of the response is the `# 🟢/🟡/🔴/🔵 ...` line.
- **One verdict per response.** If both LONG and RANGE look possible, pick the stronger one for the header. The alternative goes in the body, not in a second header. ETH/USDT verdicts (🟢🟡🔴) and off-instrument reads (🔵) never mix in the same response.
- **Absolute time, ICT.** "в 15:00 ICT" — never "через 3 часа", never "in a few hours". See [[trading-hours]] for the 09:00-22:00 ICT window; off-window verdicts default to "10:00 ICT next morning".
- **No hedging in "Главная причина".** One sentence. If it needs "however / но / с другой стороны" — that isn't the real driver and the verdict is wrong.
- **Claude makes the call.** "3 of 5 conditions met, you decide" is forbidden. The trader still clicks the order button, but the verdict is Claude's, not punted.
- **Body comes after `---`.** Full multi-TF read, prohibitive checklist, base-condition breakdown, news Impact Score, pending-order parameters — all after the separator.

## Mapping to journal decision codes

The header state must agree with the [[trading-journal-v5]] decision code in the same response:

| Decision code in journal | Header |
|---|---|
| `SETUP_LONG` / `SETUP_SHORT` / `SETUP_RANGE` (live, all conditions met) | 🟢 СЕТАП ЕСТЬ |
| `PENDING_ELIGIBLE` (zone identified + multi-TF align + can pre-order) | 🟢 СЕТАП ЕСТЬ — pending @ $X |
| Watch state (zone forming, alignment partial, gating condition pending) | 🟡 СЕТАП ФОРМИРУЕТСЯ |
| `NO_SETUP` | 🔴 СЕТАПА НЕТ |
| `RUN_ERROR` (routine only — data fetch / API failed) | 🔴 СЕТАПА НЕТ + краткая нота об ошибке |

## "Главная причина" examples

One sentence each. The driver, not a summary.

- 🟢 "ETH on lower BB(4h) with bullish reversal candle 15m, whale ratio flipped to 1.31 against bearish background"
- 🟢 "Range upper edge $2,330-$2,336 rejected on 15m close, BB(4h) flat for 6h, ATR(1h) contracting"
- 🟡 "BTC bullish confirmed (no prohibitive #6), ETH in pullback toward EMA100 4h $2,300, MACD 4h flip pending"
- 🟡 "Range pre-check 3/4 satisfied — ATR contraction needs ~11h more to qualify"
- 🔴 "Multi-TF alignment fails: 1h MACD bear cross while 4h still bullish"
- 🔴 "Outside trading window (currently 22:30 ICT — 09:00-22:00 per [[trading-hours]])"

## "Следующее действие" / "Следующая проверка" examples

Green — concrete order:
- "Enter now via limit @ $2,318"
- "Place pending limit short @ $2,333, SL $2,344, TPs $2,308/$2,288/$2,260, size 0.84 ETH (Tier 1, $42 risk), valid until 22:00 ICT today"

Yellow/red — absolute time + what to send:
- "в 15:00 ICT — пришли свежий 1h ETH + Bybit Data → Top 100 на 1h"
- "в 10:00 ICT завтра — пришли 4h и проверь, удержался ли диапазон через ночь"
- "в 22:00 ICT — 4h close определит, удержался ли $2,340 как resistance"

## Anti-patterns (forbidden)

These are the failure modes seen in real sessions before the format was standardized:

1. **Leading with indicator config.** Response opens with "сначала посмотрим настройки BOLL и MACD" — verdict appears 5 paragraphs in.
2. **Multi-verdict hedging.** "Either LONG might work, or RANGE could form, or maybe SHORT..." — pick one or none, not all three.
3. **"You decide" verdicts.** "3 of 5 base conditions hit, depends on your risk appetite" — Claude's job is to call it; the trader's job is to execute.
4. **Hedging inside Главная причина.** "ETH bullish on 4h, but BTC weak, but funding negative, but..." — find the dominant driver or admit there isn't one (→ 🔴).
5. **Relative time.** "Возвращайся через 3 часа" — bad. "В 15:00 ICT" — good. (Backed by the no-setup follow-up memory.)
6. **Burying the verdict in a summary at the bottom.** Even if the analysis above is correct, putting the verdict last breaks the at-a-glance contract.

## Why this format

- **Mobile-first.** First line plus three short lines fit on one phone screen. Trader can decide whether to read further.
- **Color-coded.** 🟢 act / 🟡 watch / 🔴 nothing — the same visual language already used in [[trading-journal-v5]] decision codes and routine emails.
- **Forces commitment.** Writing "🟢 СЕТАП ЕСТЬ" requires having concluded; writing "🟡" requires naming what's pending and when to look again. No fence-sitting.
- **Shrinks the no-setup tax.** A red verdict with a concrete next-check time is still actionable: "okay, ignore until 15:00 ICT". A buried "no setup" leaves the trader unsure whether to keep watching.

## Related pages

- [[trading-strategy]] — overall strategy that drives the verdicts
- [[entry-rules-long]] / [[entry-rules-short]] / [[range-trade-rules]] — the conditions that produce 🟢 vs 🟡 vs 🔴
- [[trading-hours]] — 09:00-22:00 ICT window; verdicts outside the window default to 🔴 with next-day check
- [[pending-orders]] — when 🟢 takes the "pending @ $X" form rather than "enter now"
- [[trading-journal-v5]] — decision codes that the header must match
