---
type: project
project: Novation XL
created: 2026-04-27
updated: 2026-04-27
status: active
---

# Novation XL

Проект кастомных режимов для Novation Launch Control XL MK3 (патч `XL_Performance`).

## Цель
Спроектировать и поддерживать конфигурацию из 14 custom modes (10 Instruments + 4 Mixer) с механиками cross-mode transit, solo follower и MIDI passthrough.

## Контекст
Устройство имеет 14 слотов custom modes (не 16, как часто пишут). Архитектура разделена на два слоя — Instruments (моды 1-10) и Mixer (моды 11-14) — с переключением через CC47.

## Артефакты
- [[Novation XL/index|index]] — каталог страниц проекта
- [[Novation XL/log|log]] — хронология проекта
- `raw/` — оригиналы документации, ассеты
- `wiki/` — обработанные сущности, концепты, источники, анализ

## Структура

```
Novation XL/
├── README.md
├── index.md
├── log.md
├── raw/
│   └── assets/
└── wiki/
    ├── entities/
    ├── concepts/
    ├── sources/
    └── analysis/
```

## Статус
Активный. Базовая структура wiki заполнена сущностями (Mixer Layer, Instruments Layer, Solo Follower, CC47 Cross-Mode Transit, MIDI Passthrough) и концептом Custom Modes Model.
