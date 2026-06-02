---
type: concept
project: Novation
created: 2026-04-27
updated: 2026-04-29
status: stable
tags: [lcxl, midi]
---

# Custom Modes Model

**Summary**: Как Launch Control XL MK3 хранит и переключает custom-modes (патч использует 15 слотов: 1–10 инструменты, 11–14 микшер, 15 Cue); роль CC30/ch7 как канала смены режима.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-29

---

Launch Control XL MK3 хранит пользовательские режимы (custom-modes) во внутренней памяти. Каждый режим — самостоятельный layout: какие физические энкодеры/слайдеры/кнопки шлют какие CC и ноты, какая подсветка.

`XL_Performance` использует **15 слотов** (уточнено пользователем 2026-06-02):

| Слот | Слой |
|---|---|
| 1–10 | инструменты ([[Instruments Layer]]) |
| 11–14 | микшер ([[Mixer Layer]]) |
| 15 | Cue / prelisten volume |

> **⚠️ История правок.** README v1.5 (`raw/XL_Performance.README.md`) говорит «до 16». Промежуточно (2026-04-28) фигурировала цифра «14 слотов» — она устарела: после добавления mode 15 (Cue, 2026-06-01) фактический layout = **15 занятых слотов**. Точный хардварный максимум (15 или 16) — открытый вопрос, см. ниже.

## Как переключается режим

LCXL принимает и отдаёт смену режима как контрол-сообщение **CC30 на канале 7** (source: XL_Performance.README.md). Значение CC30 = `5 + N` для custom-mode N (т.е. mode 1 → value 6, mode 11 → value 16, …) — но фактический маппинг в `XL_Performance` сделан под зарезервированную «дыру» под mixer-modes 11–14, см. [[Mode Encoding]].

Подсветка кнопок выбора режима в самом LCXL также реагирует на тот же CC30 — поэтому, если входящий CC30 не отфильтровать, можно случайно поймать петлю «устройство шлёт mode → LCXL подсвечивает → шлёт обратно». В патче эта петля закрывается фильтром `[sel 30 31]` в [[MIDI Passthrough]] (source: XL_Performance.README.md).

## Как используется в этом патче

| Диапазон | Слой | Где |
|---|---|---|
| 1–10 | инструменты | [[Instruments Layer]] |
| 11–14 | микшер | [[Mixer Layer]] |
| 15 | Cue / prelisten volume | [[Custom Mode SysEx Layout]] |

Патч занимает **15 слотов** (1–10 + 11–14 + 15). Хардварный максимум (15 или 16) не подтверждён окончательно: README v1.5 говорит «до 16», пользователь использует 15.

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
