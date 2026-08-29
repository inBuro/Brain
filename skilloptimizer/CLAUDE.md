# Skill Optimizer

Menu bar утилита для macOS: показывает плотность использования Claude Code скиллов (день/неделя/месяц/всё время),
группирует подскиллы под роутерами, и позволяет прямо из попапа редактировать реальные `SKILL.md` — добавлять
текстовые триггеры и слэш-команды, удалять отдельные фразы, архивировать скилл целиком.

## Архитектура

Три слоя: правила → директивы → исполнение.

| Слой | Что | Где |
| --- | --- | --- |
| Правила и контекст | этот файл | `CLAUDE.md` |
| Исполнение — детерминированный скрипт | сборка + подпись + релонч приложения | `scripts/deploy.sh` |
| Исходники | Swift-пакет (SwiftUI, MenuBarExtra) | `app/` |
| Промежуточные файлы | нет — сборка идёт в `app/.build/`, вне git | `app/.build/` (в `.gitignore`) |

Почему так: правки в Swift-коде без единого скрипта деплоя означали десятки ручных
`swift build && cp && codesign && relaunch` — источник опечаток и рассинхрона версий.

## Что где лежит

| Что | Где |
| --- | --- |
| Package.swift + Sources/ | `app/` |
| Скрипт сборки/деплоя | `scripts/deploy.sh` |
| Описание фич приложения | `docs/features.md` |
| Установленный `.app` (не в репозитории) | `~/Applications/SkillOptimizer.app` |
| LaunchAgent автозапуска (не в репозитории) | `~/Library/LaunchAgents/brain.kirill.skilloptimizer.plist` |
| Ресёрч рынка (быстрый анализ 5 конкурентов, SWOT, фичи, UX-паттерны, Deep Research промпт) | `research/` + зеркало в Notion (страница «Skill Optimizer») |

### Карта исходников (`app/Sources/SkillOptimizer/`)

| Файл | Роль |
| --- | --- |
| `SkillOptimizerApp.swift` | точка входа, `MenuBarExtra`, activation policy `.accessory` |
| `SkillScanner.swift` | актор: парсит `~/.claude/projects/**/*.jsonl`, кэш по mtime, детектит подскиллы через связку Skill+Read |
| `SkillDescriptionIndex.swift` | актор: читает `description:`/`name:` из всех `SKILL.md` (личные + плагины), включая многострочный YAML `>-` |
| `SkillDensityModel.swift` | состояние: таймфрейм, сортировка, acknowledge-таймеры (персистентны в `UserDefaults`), группировка роутер→подскиллы |
| `SkillFileEditor.swift` | пишет прямо в `SKILL.md`: добавление/удаление триггеров и слэш-команд, архивация скилла |
| `SkillDensityMenu.swift` / `DescriptionPopover.swift` | UI |
| `ThinScrollbar.swift`, `AnimatedEllipsisText.swift` | мелкие вспомогательные view |

## Правила

- **Полностью переименовано в Skill Optimizer** (2026-08-29): bundle id `brain.kirill.skilloptimizer`,
  исполняемый файл `SkillOptimizer`, LaunchAgent `brain.kirill.skilloptimizer.plist`, ключ `UserDefaults`
  `SkillOptimizer.acknowledgedAt`. Старые «подтверждённые» триггеры мигрированы автоматически при первом
  запуске новой сборки (код в `loadAcknowledgedAt()` разово читает legacy-домен `brain.kirill.skilldensitybar`,
  если новый ключ пуст) — миграционный код можно убрать через несколько месяцев, когда не останется машин
  со старым состоянием. Внутренние имена типов (`SkillDensityModel`, `SkillDensityMenu` и т.д.) намеренно
  оставлены как есть — это про модель данных «плотность скиллов», а не про бренд продукта.
- **После правки Swift-кода — `scripts/deploy.sh`.** Не гонять `swift build`/`codesign`/`open` вручную по частям.
- **Первый запуск после деплоя всегда сканирует весь корпус транскриптов** (~1.8+ ГБ, ~20-30 сек CPU) —
  это ожидаемо, не баг. Дальше кэш по mtime файла делает пересканирование почти бесплатным.
- **Add trigger / Add /trigger / Delete Skill пишут в боевые файлы** пользователя (`~/.claude/skills/**/SKILL.md`),
  не в тестовые копии. Перед новыми похожими фичами — проверять логику на disposable-копии в scratchpad, не на живых файлах.
- **Delete Skill архивирует, не удаляет** — перемещает папку скилла в `_archive/skills-retired-<дата>/`
  (конвенция уже принята в среде), обратимо простым перемещением назад.

## Инструменты этого проекта

- Скиллы: нет специфичных — обычная Swift/SwiftUI разработка
- Субагенты: нет
- MCP: нет
