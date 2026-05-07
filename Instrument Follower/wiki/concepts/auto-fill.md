---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Auto-fill

**Summary**: Опциональная кнопка в device UI, которая в один клик распределяет macros всех Rack'ов трека по unmapped encoder'ам в порядке: каждый Rack занимает столько подряд идущих encoder'ов, сколько у него macros.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Алгоритм

1. Идём по Rack'ам трека в их естественном порядке (source: rack-controller-bridge-discussion.md).
2. Для каждого Rack'а берём его macros.
3. Заполняем unmapped encoder'ы подряд.
4. Уже занятые слоты не трогаем — поверх можно домапить через [[knobbler-style-mapping]].

## Когда полезно

- Quick start с новым сетом или новым треком.
- После добавления Rack'а — добить остаток энкодеров.
- Сброс к «дефолтной» раскладке через сначала clear → auto-fill.

## Когда не помогает

- Если на треке нет ни одного Rack'а — кнопка no-op.
- Если энкодеров меньше, чем суммарно macros — лишние Rack'и не уместятся (документировать как ограничение).

## Связь с Knobbler

Идея «пользователь выделил Rack — устройство автоматически знает что мапить» взята из Bluhand-режима [[knobbler]], но без полноценного follow-selected-device — у нас однократный fill всего трека.

## Related pages

- [[instrument-follower-device]]
- [[knobbler-style-mapping]]
- [[knobbler]]
- [[rack-controller-bridge-discussion]]
