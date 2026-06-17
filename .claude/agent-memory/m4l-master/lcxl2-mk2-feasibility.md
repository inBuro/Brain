---
name: lcxl2-mk2-feasibility
description: Launch Control XL MK2 hardware/protocol facts vs MK3, for assessing a Control XL port to MK2 (templates, native template-change SysEx, absolute pots, .syx differences)
metadata:
  type: reference
---

Анализ осуществимости порта Control XL (флагман, ныне MK3-only) на Launch Control XL **MK2**. Источники: Novation/Focusrite "Launch Control XL Programmer's Reference Guide v2" (PDF, fael-downloads-prod.focusrite.com/customer/prod/downloads/launch_control_xl_programmer_s_reference_guide.pdf — извлекать текст на macOS через JXA+PDFKit, pdftotext/mutool/gs на этой машине НЕТ), Novation Components guide, MusicTech/SOS reviews. Проверено 2026-06-17.

## Ключевые факты MK2 (отличия от MK3 [[lcxl3-daw-protocol]])
- **Контролы = АБСОЛЮТНЫЕ потенциометры**, НЕ endless-энкодеры. MK3 = 24 endless-энкодера. Это физическое отличие — на MK2 при переключении режима потенциометр физически не совпадает с новым значением → скачок. Pickup/takeover можно делать только софтом (Ableton Takeover: Pickup / Value Scaling), но это деградация UX, не паритет. Бесшовность MK3 (вернулся к ручке — значение не прыгнуло) на MK2 ЖЕЛЕЗНО недостижима.
- **Templates:** 16 штук = 8 user (slots 00h-07h, редактируемы) + 8 factory (08h-0Fh, read-only). MK3 custom modes тоже редактируемы через Components. MK2 user-слотов всего **8** — потенциальное узкое место под схему «N режимов» (MK3-схема юзера: 10 instrument + 4 mixer + спец = до 15 кастом-модов; на MK2 в 8 user-слотов не влезает один-к-одному).
- **Native "Template changed" SysEx (КЛЮЧЕВОЕ, лучше MK3):** при ручной смене шаблона MK2 САМ шлёт `F0 00 20 29 02 11 77 <Template> F7` (dec `240 0 32 41 2 17 119 <T> 247`). Т.е. mode-detect на MK2 НЕ требует трюка с маркер-CC (CC47=N×10 «at transit» на MK3) — есть прямой нативный отчёт о текущем шаблоне. (NB: подтвердить монитором, на какой ПОРТ уходит этот SysEx и видит ли его M4L `[midiin]` на треке — у MK2 нет отдельного DAW-порта как у MK3; вероятно один порт.)
- **Remote template select (host→device):** `F0 00 20 29 02 11 77 <Template> F7` — тот же месседж, симметрично. На MK3 select = CC30 ch7. Логику select надо переписать под SysEx.
- **Per-control конфиг в Editor:** для pots можно задать CC number, MIDI channel, min/max value, LED color, LED MIDI channel. Buttons/pads: тип Note или CC. → произвольный маркер-CC при желании НАЗНАЧИТЬ можно (хотя для mode-detect он не нужен — есть native SysEx).
- **LED feedback:** MK2 умеет LED через note/CC (текущий шаблон) и через SysEx (любой шаблон, в фоне) — `F0 00 20 29 02 11 78 …` (LED) / `7B` (flash). Т.е. LED-индикация на MK2 ЕСТЬ. Чего НЕТ на MK2 — двунаправленный motorized/value-feedback ручек (их физически нет; абсолютные пласт. потенциометры не двигаются).

## `.syx` формат
MK2 custom template ≠ MK3 custom mode по байт-лейауту (разные мануфактур-под-сообщения; MK2 дескрипторы из programmer guide, MK3-лейаут реверсён в проектной wiki [[Custom Mode SysEx Layout]]). Под MK2 надо генерить/реверсить шаблоны отдельно — это объём работы, не блокер.

## Вердикт (для продуктового решения)
- **ЖЁСТКИЙ блокер только один: бесшовность энкодеров.** Абсолютные потенциометры MK2 → скачок значения при смене режима, лечится только pickup/value-scaling (деградация). dnk8n в Reddit прав по сути: MK2 «basically the same» МИНУС бесшовность; но «just disable the pot until it reaches current value» = именно pickup, и это заметная потеря UX, не косметика.
- **НЕ блокеры (объём работы):** mode-detect (на MK2 даже ПРОЩЕ — native template-change SysEx вместо CC47-трюка), select (переписать на SysEx 77h), `.syx` под MK2 (отдельная генерация), LED (есть). Узкое место — 8 user-слотов vs 15 кастом-модов MK3-схемы → переупаковка раскладки режимов.
- Грубая оценка порта: средний-крупный. Основное: (1) перепроектировать раскладку режимов под 8 слотов, (2) генератор `.syx` под MK2-лейаут, (3) ветка select/detect на SysEx 77h в патче, (4) опц. pickup-логика. Это новый под-продукт, не «флажок совместимости».
