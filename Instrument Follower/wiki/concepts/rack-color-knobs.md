---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Rack color → knob color

**Summary**: Цвет RGB-ноба на физическом контроллере берётся напрямую из `rack.color` — параметра Rack'а, в котором живёт замапленный macro. Палитра становится свойством сета, юзер красит Rack'и стандартным workflow Ableton.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Логика

- При маппинге [[instrument-follower-device|устройство]] читает цвет Rack'а через `parameter.canonical_parent.color` (или эквивалент LiveAPI) (source: rack-controller-bridge-discussion.md).
- Цвет конвертируется в RGB и шлётся на encoder через [[sysex-rgb-protocol|SysEx]].
- Если параметр почему-то вне Rack'а — fallback на цвет трека.

## Что это даёт

- Группы знобов одного Rack'а сразу читаются на железе как кластер одного цвета.
- Юзер не настраивает отдельную палитру в нашем устройстве — красит Rack'и через Ableton (правый клик → Edit Info Text / Color).
- Цвет переезжает вместе с проектом, так как это свойство Rack'а.

## Что НЕ делаем

- Не вводим внутреннюю палитру 4–5 цветов и циклическое распределение — это было одной из отвергнутых развилок (source: rack-controller-bridge-discussion.md).
- Не предлагаем UI для перекраски Rack'ов из нашего устройства — стандартного UI Ableton достаточно.

## Related pages

- [[instrument-follower-device]]
- [[sysex-rgb-protocol]]
- [[value-feedback]]
- [[knobbler]]
- [[rack-controller-bridge-discussion]]
