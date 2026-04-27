# Cloud Wiki — XL_Performance (Novation Launch Control XL MK3)

Это LLM-maintained wiki по проекту **XL_Performance.amxd** — Max for Live MIDI-устройству, которое превращает Novation Launch Control XL MK3 в перформанс-инструмент с переключаемыми слоями, кросс-режимными переходами и автоматическим Solo Follow.

---

## Принцип

Wiki ведется по паттерну **LLM Wiki** (Karpathy). LLM читает сырые источники, извлекает знания и интегрирует их в структурированную вики. Знания компилируются один раз и поддерживаются в актуальном состоянии — не пересоздаются на каждый запрос.

- **Человек** — курирует источники, задает вопросы, направляет анализ.
- **LLM** — пишет и поддерживает вики: суммаризация, перекрестные ссылки, обновления, консистентность.

---

## Структура директорий

```
Cloud/
  Novation XL/        ← все материалы по проекту собраны здесь.
    cloud.md          ← ТЫ ЗДЕСЬ. Схема вики (конвенции, workflow, правила).
    index.md          ← Каталог всех страниц вики со ссылками и описаниями.
    log.md            ← Хронологический лог операций (ingest, query, lint).
    raw/              ← Сырые источники. Иммутабельны — LLM читает, но не меняет.
      raw/assets/     ← Изображения и вложения.
    wiki/             ← LLM-генерируемые страницы вики.
      wiki/entities/  ← Страницы сущностей (компоненты, объекты, CC-маппинги).
      wiki/concepts/  ← Концептуальные страницы (архитектура, workflow, протоколы).
      wiki/sources/   ← Конспекты обработанных источников.
      wiki/analysis/  ← Аналитические страницы, сравнения, синтез.
```

---

## Категории страниц

### Entities (wiki/entities/)
Страницы по конкретным сущностям проекта:
- Компоненты патча (Mixer Layer, Instruments Layer, Cross-Mode Transit, Solo Follower, MIDI Passthrough)
- CC-каналы и их назначение (CC30, CC47, CC49, CC28 и т.д.)
- Custom Modes (1..10 instruments, 11..14 mixer)
- Параметры устройства (sf_active, mix_obj-*, etc.)
- Файлы проекта (XL_Performance.amxd, solo_follower.js)

### Concepts (wiki/concepts/)
Архитектурные и концептуальные темы:
- Режимная модель (Custom Modes распределение)
- Overlay Router (механизм оверлейного переключения)
- Momentary-переключение (CC47/CC49 логика save/restore)
- Solo Follow (алгоритм, observer pattern, topology check)
- MIDI-маршрутизация (passthrough, петлевая защита)
- Формулы маппинга (mixer mode formula, instruments mode→CC30 value)

### Sources (wiki/sources/)
Конспекты обработанных источников:
- Описания устройства
- Документация Novation LCXL MK3
- Max/MSP и Live API справки
- Заметки из сессий разработки

### Analysis (wiki/analysis/)
Синтез и аналитика:
- Сравнения подходов
- Ответы на запросы, достойные сохранения
- Карты сигнальных потоков
- Таблицы CC-маппингов

---

## Конвенции

### Формат страниц
- Markdown с YAML-frontmatter:
  ```yaml
  ---
  type: entity | concept | source | analysis
  tags: [mixer, cc-mapping, solo-follower, ...]
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  sources: [список источников]
  ---
  ```
- Перекрестные ссылки — Obsidian wiki-links: `[[Название страницы]]`
- Каждая страница — одна тема/сущность. Не смешивать.

### Именование файлов
- Entities: `wiki/entities/Mixer Layer.md`, `wiki/entities/CC47 Cross-Mode Transit.md`
- Concepts: `wiki/concepts/Custom Modes Model.md`
- Sources: `wiki/sources/XL_Performance v1.5 Description.md`
- Analysis: `wiki/analysis/CC Mapping Table.md`
- Язык имен файлов — английский. Содержание — на языке источника или по запросу.

### Ссылки и перекрестные ссылки
- При создании/обновлении страницы — добавлять `[[wiki-links]]` на связанные страницы.
- Концептуальные страницы должны ссылаться на все релевантные entities.
- Entity-страницы должны ссылаться на concepts, в которых они участвуют.

---

## Workflow

### Ingest (добавление источника)
1. Источник помещается в `raw/`.
2. LLM читает источник, обсуждает ключевые находки с пользователем.
3. Создает конспект в `wiki/sources/`.
4. Создает или обновляет entity-страницы по всем упомянутым сущностям.
5. Создает или обновляет concept-страницы при необходимости.
6. Обновляет `index.md`.
7. Добавляет запись в `log.md`.

### Query (запрос к вики)
1. LLM читает `index.md`, находит релевантные страницы.
2. Читает найденные страницы, синтезирует ответ.
3. Ответ со ссылками на wiki-страницы.
4. Ценные ответы (сравнения, анализ, таблицы) могут быть сохранены как новые страницы в `wiki/analysis/`.
5. При необходимости — запись в `log.md`.

### Lint (ревизия вики)
Периодическая проверка здоровья вики:
- Противоречия между страницами
- Устаревшие утверждения
- Orphan-страницы без входящих ссылок
- Упомянутые, но не созданные страницы
- Пропущенные перекрестные ссылки
- Пробелы в данных, которые можно закрыть

---

## Форматы index.md и log.md

### index.md
```markdown
# Index

## Entities
- [[Mixer Layer]] — секция патча для custom modes 11-14, DAW/Prelisten switching
- [[Solo Follower]] — JS-скрипт автоматического solo follow
...

## Concepts
- [[Custom Modes Model]] — распределение 14 custom modes по слоям
...

## Sources
- [[XL_Performance v1.5 Description]] — основное описание устройства v1.5
...

## Analysis
- [[CC Mapping Table]] — полная таблица CC → функция → custom mode
...
```

### log.md
```markdown
# Log

## [YYYY-MM-DD] ingest | Название источника
Обработан источник. Создано N страниц, обновлено M страниц.
Ключевые находки: ...

## [YYYY-MM-DD] query | Вопрос
Ответ сохранен в [[Название страницы]].

## [YYYY-MM-DD] lint
Найдено N проблем, исправлено M.
```

---

## Домен проекта — краткая справка

**XL_Performance.amxd** — Max for Live MIDI Effect (v1.5, Max 9.0.10 x64).

### Ключевые сущности
| Сущность | Описание |
|----------|----------|
| Mixer Layer | Custom modes 11-14. DAW/Prelisten x Page/Bank. Формула: `mode = 23 + bank + 2*((page + hold) % 2)` |
| Instruments Layer | Custom modes 1-10. Listen CC 49, values 10/20/.../100 → modes 1..10 |
| CC47 Cross-Mode Transit | Быстрое переключение instrument→mixer и обратно |
| Solo Follower | `solo_follower.js` — держит свой трек в solo при solo любого другого трека |
| MIDI Passthrough | Проброс всех MIDI кроме CC30/CC31 (защита от петель) |

### CC-назначения
| CC | Функция |
|----|---------|
| CC28 | Mixer Hold toggle |
| CC30 | Mode Select (LCXL ← → патч), канал 7 |
| CC47 | Mixer Bank momentary / Cross-Mode Transit |
| CC49 | Mixer Page momentary / Instruments Listen CC |

### Custom Modes маппинг
| Custom Mode | CC30 value | Назначение |
|-------------|-----------|------------|
| 1-10 | 6,7,8,9,18,19,20,21,22,23 | Instrument pages |
| 11 | 24 | Mixer: bank=1, page=0 |
| 12 | 25 | Mixer: bank=2, page=0 |
| 13 | 26 | Mixer: bank=1, page=1 |
| 14 | 27 | Mixer: bank=2, page=1 |

### Файлы
- `XL_Performance.amxd` — Max patch (~265 объектов)
- `solo_follower.js` — JS-скрипт (должен лежать рядом с .amxd)

---

## Заметки для LLM

- При добавлении нового источника всегда проверяй, не противоречит ли он существующим страницам вики.
- Перед созданием новой страницы проверяй `index.md` — возможно, страница уже существует и нужно обновление.
- Debug-телеметрия в патче (`print ...`) — это рабочий инструмент, не мусор.
- CC30 и CC31 намеренно режутся в passthrough — это защита от MIDI-петель.
- Формула mixer mode и маппинг instruments mode→CC30 value — критически важные данные, при любых изменениях обновлять сразу.
- `solo_follower.js` имеет retry-логику при холодном старте — это не баг, а фича для случаев когда Live API еще не готов.
