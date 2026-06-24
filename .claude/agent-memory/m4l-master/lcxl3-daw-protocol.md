# LCXL3 — DAW-mode протокол и decompiled remote-script

Справочник по DAW-режиму Launch Control XL 3 (MK3). Полезно, когда правка девайса упирается в нативный протокол контроллера (mode select/report, SysEx, относительные энкодеры, handshake) — здесь источник истины, не реверсить руками.

## Главный источник — decompiled Live 12 control-surface скрипт

**URL:** https://midiremotescripts.structure-void.com/reference/live12/Launch_Control_XL_3/

(re-verified live 2026-06-02). Это декомпилированный Ableton Live 12 remote-script LCXL3 на structure-void. Авторитетен по DAW-mode протоколу: класс `Launch_Control_XL_3`, device-identity байты `(0, 32, 41, -1, 1, 0, 1)`, SysEx-константы (`SYSEX_FLUSH_THRESHOLD=10`, `SYSEX_DISPLAY_ID_LENGTH=9`), сабмодули — colored encoders, color schemes, device handling, display, UI, midi maps, mixer, session, transport, skin.

⚠️ Не путать домены: корень `midiremotescripts.structure-void.com` = доки фреймворка + `/generator/` (браузерный конструктор remote-script'ов). Per-device скрипты живут именно в дереве `/reference/live12/<Device>/`.

## Ключевые факты протокола (подтверждены монитором/байтами 2026-06-02)

- **CC30 ch7 = SELECT (команда).** Плагин шлёт его, чтобы переключить LCXL в мод. Значение: инструменты `5+N` (6..15), микшер `24..27` (16..23 — зарезервированная «дыра»).
- **CC31 ch7 = REPORT.** Нативный репорт девайса при смене мода, уходит на **DAW-порт**. Generic-дока Novation называет CC30, но реальный девайс шлёт CC31 — доверять девайсу.
  - value→mode (этот девайс): 6→1, 7→2, 8→3, 9→4, 13→5, 14→6, 15→7, 16→8, 17→9, 18→10.
- **Плагин CC31 прочитать НЕ может:** DAW-порт принадлежит Ableton Control Surface, M4L видит только вход трека. In-device `[midiin]` должен биндиться к DAW-порту напрямую (`port`-сообщение); имя порта НЕ хардкодить (варьируется) — авто-детект по подстроке `DAW`/`LCXL` через `midiinfo`.
- **DAW-порт (машина пользователя):** `LCXL3 1 (DAW In)` / `LCXL3 1 (DAW Out)`.
- **Relative (endless) энкодеры:** существуют ТОЛЬКО в DAW mode (per-row, pivot `0x40`=64, `>64` CW / `<64` CCW). В **custom mode НЕДОСТУПНЫ** — подтверждено техподдержкой Novation (feature-request, не реализовано). Для custom-mode `.syx` флага absolute/relative нет.
  - **Гипотеза (НЕ подтверждена, 2026-06-23):** firmware может откликаться на per-row relative toggle через CC69/CC72/CC73 ch7 val=127 даже в Custom Mode. Точные CC не опубликованы — programmer's reference страницы Novation отдают 403/404. Артефакты для теста: `EncoderRelativeMonitor.amxd` + `EncoderRelativeTest.amxd` в `~/Brain/Fadercraft/raw/`. Детали: [encoder-relative-research.md](encoder-relative-research.md).

## Связь с custom-mode `.syx`

DAW-mode (этот скрипт) и custom-mode (`.syx`, что генерит/правит XL_Performance) — **два разных протокола** одного железа. Детали custom-mode формата — в проектной wiki `~/Brain/Fadercraft/wiki/concepts/Custom Mode SysEx Layout.md` и в [xl-performance.md](xl-performance.md).
