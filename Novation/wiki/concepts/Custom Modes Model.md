---
type: concept
project: Novation
created: 2026-04-27
updated: 2026-04-29
status: stable
tags: [lcxl, midi]
---

# Custom Modes Model

**Summary**: Как Launch Control XL MK3 хранит и переключает 14 пользовательских custom-modes; роль CC30/ch7 как канала смены режима.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-29

---

Launch Control XL MK3 хранит до **14 пользовательских режимов** (custom-modes 1..14) во внутренней памяти (по факту работы устройства; уточнено пользователем 2026-04-28). Каждый режим — самостоятельный layout: какие физические энкодеры/слайдеры/кнопки шлют какие CC и ноты, какая подсветка.

> **⚠️ Расхождение с источником.** README v1.5 (`raw/XL_Performance.README.md`) утверждает «до 16» — это ошибка README, а не хардварная спецификация. Фактическая ёмкость LCXL MK3 — **14 слотов**, и патч `XL_Performance` использует их полностью (1–10 instruments + 11–14 mixer). Свободных слотов 15–16 не существует.

## Как переключается режим

LCXL принимает и отдаёт смену режима как контрол-сообщение **CC30 на канале 7** (source: XL_Performance.README.md). Значение CC30 = `5 + N` для custom-mode N (т.е. mode 1 → value 6, mode 11 → value 16, …) — но фактический маппинг в `XL_Performance` сделан под зарезервированную «дыру» под mixer-modes 11–14, см. [[Mode Encoding]].

Подсветка кнопок выбора режима в самом LCXL также реагирует на тот же CC30 — поэтому, если входящий CC30 не отфильтровать, можно случайно поймать петлю «устройство шлёт mode → LCXL подсвечивает → шлёт обратно». В патче эта петля закрывается фильтром `[sel 30 31]` в [[MIDI Passthrough]] (source: XL_Performance.README.md).

## Как используется в этом патче

| Диапазон | Слой | Где |
|---|---|---|
| 1–10 | инструменты | [[Instruments Layer]] |
| 11–14 | микшер | [[Mixer Layer]] |

Вся ёмкость LCXL (14 слотов) занята; резерва нет (source: XL_Performance.README.md, скорректировано по факту устройства).

Cross-mode переход между двумя диапазонами реализован отдельно: [[CC47 Cross-Mode Transit]].

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[XL_Performance — как это работает]]
- [[Mode Encoding]]
- [[Mixer Layer]]
- [[Instruments Layer]]
- [[CC47 Cross-Mode Transit]]
- [[MIDI Passthrough]]
- [[XL_Performance README]]
