---
type: entity
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Knobbler

**Summary**: iPad / iPhone / Android multitouch surface для Ableton через OSC от Zack Steinkamp (plugins.steinkamp.us); используется как **референс** для UX-паттернов в [[instrument-follower-device]], сам с физическими MIDI-контроллерами не работает.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Что взяли

- **Auto-coloring** — слайдеры подхватывают цвет трека из Live в реальном времени. У нас аналогично, но из [[rack-color-knobs|rack.color]] (source: rack-controller-bridge-discussion.md).
- **Tap-to-map** → у нас [[knobbler-style-mapping|twist-to-map]]: выбираешь параметр в Live, активируешь свободный slot, mapping готов без режима. Минимизирует ручную работу.
- **Bluhand page** — следует за selected device. У нас полноценного Bluhand нет, но идея «пользователь выделил Rack — устройство автоматически знает что мапить» лежит в основе [[auto-fill]].

## Что НЕ взяли

- Ручной tap-to-map workflow — для encoder'ов естественнее twist-to-map.
- OSC-транспорт — у нас MIDI / SysEx.
- iPad UI — мы про физические контроллеры.

## Related pages

- [[instrument-follower-device]]
- [[knobbler-style-mapping]]
- [[auto-fill]]
- [[rack-color-knobs]]
- [[rack-controller-bridge-discussion]]
