---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Value feedback on LED

**Summary**: Encoder LED на физическом контроллере отображает текущее значение macro, нормализованное в диапазон 0–127 для соответствующего MIDI-протокола. LiveAPI-observer держит LED в синхроне с автоматизацией, мышью или другим контроллером.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Что отображаем

- Текущее значение macro (source: rack-controller-bridge-discussion.md).
- Нормализуется в 0–127 для MIDI-передачи драйверу.
- На [[lcxl-mk3]] это выражается интенсивностью свечения encoder'а; цвет берётся из [[rack-color-knobs|rack.color]].

## Источники изменения значения

- Юзер крутит encoder.
- Юзер двигает macro мышью в Live.
- Автоматизация на треке.
- Другой MIDI-контроллер мапнут на тот же параметр.

Все четыре пути идут через LiveAPI observer — LED всегда отражает фактическое значение.

## Защита от feedback-петли

После `ctlin` от конкретного encoder'а драйвер блокирует отправку value обратно на этот же encoder в окне ~30–50 мс (source: rack-controller-bridge-discussion.md). Это убивает race между юзеровским движением и нашим observer-update без введения dirty-флагов.

## Что НЕ делаем

- Не показываем automation recorded / overridden / controlled-by-other-device индикаторы как у [[knobbler]] — value feedback через интенсивность LED считается достаточным сигналом (source: rack-controller-bridge-discussion.md). Можно вернуться позже.

## Related pages

- [[instrument-follower-device]]
- [[rack-color-knobs]]
- [[sysex-rgb-protocol]]
- [[core-driver-architecture]]
- [[knobbler]]
- [[rack-controller-bridge-discussion]]
