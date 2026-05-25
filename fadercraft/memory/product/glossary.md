# Product — Glossary

Обновлено: 2026-05-15

Термины проекта Fadercraft. Цель — чтобы дизайн-копи и нейминг компонентов опирались на согласованный язык.

## Бренд и продукт

- **Fadercraft** — зонтичный бренд утилит Max for Live / Ableton Live. Лендинг: `fadercraft.com`.
- **Control XL** — флагманский продукт. M4L-устройство для Novation Launch Control XL MK3. Заменяет внутреннее имя `XL_Performance.amxd`.
- **XL_Performance** — *legacy*-имя продукта Control XL. В новой коммуникации не использовать (оставлено только в `raw/XL_Performance.README.md` и историческом коде).

## Железо (бренд Novation, имена не менять)

- **LCXL MK3** — сокращение от Novation Launch Control XL MK3. Физический MIDI-контроллер: 8 фейдеров, 24 ручки, 16 пэдов, 14 customizable modes, кнопки навигации/transport.
- **Custom Mode** — пользовательский слой настройки контроллера, хранится в самом устройстве. У LCXL MK3 их 14, переключаются по CC30 на ch7.

## Архитектура продукта (Control XL)

Из вики:

- **Mode Encoding** — формула `mode = 23 + bank + 2 * ((page + hold) % 2)`. Определяет, какой Custom Mode активирован.
- **Mixer Layer** — Custom Modes 11–14. Состояния: `mixer_bank`, `mixer_page`, `mixer_hold`. UI на устройстве — микшерная семантика (фейдеры = volume, ручки = pan/send и т.д.).
- **Instruments Layer** — Custom Modes 1–10. Overlay CC (по умолчанию CC49) фильтрует поток для конкретного инструмента.
- **CC47 Cross-Mode Transit** — quick-jump между Mixer и Instruments слоями с памятью о последней позиции.
- **Solo Follower** — JS-модуль + LiveAPI; держит собственный трек заSOLOенным синхронно с внешними. Неотъемлемая часть Control XL.
- **MIDI Passthrough** — verbatim notes/bend/aftertouch/program; CC режутся через `[sel 30 31]`.

## Бизнес-термины

- **M4L** — Max for Live (среда Ableton Live для пользовательских устройств).
- **AMXD** — расширение файла M4L-устройства (`XL_Performance.amxd` сейчас, `Control_XL.amxd` после переименования).
- **Isotonik** — потенциальный канал продаж (см. `wiki/payment-rails`).
- **Gumroad** — текущий выбранный канал продаж.

## Язык

- Сайт и любой UI — **English**. Никакой кириллицы.
- Чат с заказчиком (мной) — Russian. Документация (wiki, MEMORY) — English по правилу проекта, но мой текущий bootstrap MEMORY написан на русском как рабочий язык агента; на финальную доку перенос — отдельная задача.
