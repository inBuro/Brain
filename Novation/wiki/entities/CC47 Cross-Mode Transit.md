---
type: entity
project: Novation
created: 2026-04-27
updated: 2026-04-28
status: stable
tags: [m4l, lcxl, cross-mode]
---

# CC47 Cross-Mode Transit

**Summary**: Механизм поверх Mixer Layer и Instruments Layer: одной кнопкой «отбить» в микшер с любого инструмента и вернуться обратно с памятью предыдущего режима.

**Sources**: `raw/XL_Performance.README.md`

**Last updated**: 2026-04-28

---

Секция патча, маркированная:

```
=====  CC47 CROSS-MODE TRANSIT  =====
```

Отдельный механизм поверх [[Mixer Layer]] и [[Instruments Layer]]. Позволяет одной кнопкой «отбить» в микшер с любого инструмента и вернуться обратно (source: XL_Performance.README.md).

## Поведение

| CC47 value | Действие |
|---|---|
| 10, 20, …, 100 (т.е. `10·N`, N=1..10) | использовать текущее значение `v instruments_mode` как save-point, **переключить LCXL на последний используемый mixer-mode** (CC30/ch7 value 24..27 → custom 11..14) |
| 127 | прочитать `v instruments_mode` и отправить LCXL обратно на инструмент-страницу (CC30/ch7 value 6..23 по таблице из [[Mode Encoding]]) |

(source: XL_Performance.README.md)

> **Деталь:** отдельной save-переменной нет — `v instruments_mode` уже хранит текущий instruments-mode (см. [[Instruments Layer]]) и просто не перезаписывается на время кросс-перехода. Поэтому при возврате восстанавливается ровно тот режим, что был активен в момент «отбивки».

## Зачем такая кодировка

CC47 одновременно используется как:
- **momentary-кнопка bank** в [[Mixer Layer]] (значения 1/2).
- **trigger cross-transit** (значения 10·N и 127).

Дискриминация по значению работает потому, что mixer-bank шлёт только 1/2, а cross-transit — только кратные 10 и 127. Никакого пересечения.

## Видимый результат для исполнителя

Удобный one-touch-jump: нажал — попал в mix, отпустил/нажал ещё раз → вернулся в свой инструмент с тем же выбранным режимом (source: XL_Performance.README.md).

## Related pages

- [[Novation XL]] — корневой хаб проекта
- [[XL_Performance — как это работает]]
- [[Mixer Layer]]
- [[Instruments Layer]]
- [[Mode Encoding]]
- [[XL_Performance README]]
