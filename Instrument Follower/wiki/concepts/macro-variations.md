---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Macro Variations

**Summary**: Фича Live 12, позволяющая в Rack'ах сохранять / вызывать / рандомизировать состояния macros. Зарезервирована под 16 fader-buttons LCXL MK3 в v3 [[phasing-roadmap]].

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Что это

Live 12 в Rack'ах поддерживает store / recall / randomize набора значений macros — Macro Variations (source: rack-controller-bridge-discussion.md). Можно держать numbered «снимки» состояния Rack'а и переключаться между ними.

## Привязка к [[lcxl-mk3]]

У LCXL MK3 16 fader-buttons под фейдерами — естественное место под:

- numbered variations (recall by number),
- store текущего состояния как новой variation,
- randomize.

Точное распределение buttons между recall / store / randomize — open question, фиксируется в v3.

## Почему сейчас не делаем

Phasing держит MVP узким (Core + RGB feedback на LCXL MK3). Variations требуют отдельного UX-захода и завязаны на Live 12 API, поэтому отнесены в v3 [[phasing-roadmap]].

## Зачем держать в голове сейчас

Чтобы при проектировании MVP **не занять** 16 fader-buttons чем-то другим. Они зарезервированы.

## Related pages

- [[instrument-follower-device]]
- [[lcxl-mk3]]
- [[phasing-roadmap]]
- [[rack-controller-bridge-discussion]]
