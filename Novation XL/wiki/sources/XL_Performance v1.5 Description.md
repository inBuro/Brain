---
type: source
tags: [xl-performance, device-description, v1.5]
created: 2026-04-27
updated: 2026-04-27
---

# XL_Performance v1.5 — описание устройства

Первоисточник: развернутое описание XL_Performance.amxd v1.5, предоставленное автором.

## Суть

Max for Live MIDI Effect для **Novation Launch Control XL MK3**. Превращает контроллер в перформанс-инструмент с двумя переключаемыми слоями ([[Mixer Layer]] / [[Instruments Layer]]), [[CC47 Cross-Mode Transit|кросс-режимными переходами]] и [[Solo Follower|автоматическим Solo Follow]].

## Файлы
- `XL_Performance.amxd` — Max patch v9.0.10, ~265 объектов
- `solo_follower.js` — JS-скрипт, грузится через `[js solo_follower.js]`

## Архитектура

Патч физически разделен на 4 секции + MIDI passthrough + startup default:

1. **[[Mixer Layer]]** — custom modes 11-14
2. **[[Instruments Layer]]** — custom modes 1-10 через overlay CC
3. **[[Solo Follower]]** — JS-скрипт автоследования solo
4. **[[CC47 Cross-Mode Transit]]** — механизм быстрого перехода между слоями
5. **[[MIDI Passthrough]]** — проброс MIDI с фильтром CC30/CC31
6. **Startup** — `live.thisdevice` → `deferlow` → `del 50` → стартовый mode 11

## Распределение Custom Modes

| Режим | Назначение |
|-------|-----------|
| 1..10 | [[Instruments Layer]] — 10 инструментальных страниц |
| 11..14 | [[Mixer Layer]] — 4 страницы микшера (DAW / Prelisten x Page / Bank) |

## Параметры устройства (видимы из Live)

| Varname | Label | Назначение |
|---------|-------|------------|
| sf_active | Active | Solo Follower on/off |
| mix_obj-hotkey-daw | Daw | DAW toggle |
| mix_obj-hotkey-pre | Prelisten | Prelisten toggle |
| mix_obj-mode11-btn | Mode 11 | Индикатор mode 11 |
| mix_obj-mode12-btn | Mode 12 | Индикатор mode 12 |
| mix_obj-mode13-btn | Mode 13 | Индикатор mode 13 |
| mix_obj-mode14-btn | Mode 14 | Индикатор mode 14 |
| mix_obj-ui-bank | Page | Page toggle |
| mix_obj-ui-hold | Hold | Hold toggle |
| mix_obj-ui-page | Bank fx | Bank toggle |

## Версии
- Patch comment: v1.5
- Router tag: LCXL Overlay Router v18 (single Listen CC + mode by value)
- Max 9.0.10 x64
