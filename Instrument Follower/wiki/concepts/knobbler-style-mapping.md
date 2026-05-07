---
type: concept
project: Instrument Follower
created: 2026-05-07
updated: 2026-05-07
---

# Knobbler-style mapping

**Summary**: Mapping flow без отдельного режима — пользователь кликает на macro Rack'а в Live, потом крутит любой свободный encoder на физическом контроллере, и unmapped encoder привязывается к выделенному macro. Состояние всегда живое.

**Sources**: `raw/rack-controller-bridge-discussion.md`.

**Last updated**: 2026-05-07.

---

## Шаги

1. Юзер кликает по macro Rack'а в Live (выделение через LiveAPI).
2. Юзер крутит любой unmapped encoder на железе.
3. Slot привязывается к этому macro; LED ноба сразу подхватывает [[rack-color-knobs|цвет Rack'а]] и [[value-feedback|значение]].
4. Маппинг сохраняется вместе с Live set (source: rack-controller-bridge-discussion.md).

## Чем отличается от tap-to-map у [[knobbler]]

У Knobbler tap-to-map — палец выбирает свободный слайдер. У нас естественнее twist-to-map: encoder сам сообщает «вот меня крутят», и core привязывает его к текущему выделенному macro.

## Что не делаем

- Никакого global mapping mode (вход / выход).
- Никакой кнопки «start mapping».
- Никакого latch'а на конкретный slot.

## Связь с auto-fill

[[auto-fill]] — опциональная кнопка для quick start. После auto-fill юзер может перемапить любой encoder поверх через тот же twist-to-map.

## Related pages

- [[instrument-follower-device]]
- [[auto-fill]]
- [[knobbler]]
- [[rack-color-knobs]]
- [[value-feedback]]
- [[core-driver-architecture]]
- [[rack-controller-bridge-discussion]]
