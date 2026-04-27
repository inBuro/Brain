---
type: entity
tags: [midi, passthrough, filter, loop-protection]
created: 2026-04-27
updated: 2026-04-27
sources: [XL_Performance v1.5 Description]
---

# MIDI Passthrough

Хвост патча XL_Performance. Пробрасывает все MIDI-сообщения насквозь, кроме CC30 и CC31.

## Что пробрасывается (verbatim)

- `notein` / `noteout`
- `bendin` / `bendout`
- `touchin` / `touchout`
- `polyin` / `polyout`
- `pgmin` / `pgmout`
- `ctlin` / `ctlout` — **с фильтром**

## Фильтр CC

`[sel 30 31] → gate` — режет **CC30** и **CC31**.

**Причина**: CC30 — это Mode Select, используемый для переключения custom modes LCXL. Если его пропустить на выход, возникнет MIDI-петля (патч шлет CC30 → LCXL → LCXL отвечает CC30 → патч снова обрабатывает → ...).

## Расширение

Для фильтрации дополнительных CC — добавить значения в `[sel 30 31]`.

## Связанные страницы
- [[Mixer Layer]] — генерирует CC30 для смены режимов
- [[Instruments Layer]] — генерирует CC30 для смены режимов
