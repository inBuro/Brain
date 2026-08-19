---
name: portfolio
description: Роутер группы портфолио и job-search (2 своих подскилла + индекс 22 глобальных резюме-скиллов). Применять при задачах на поиск вакансий, резюме, cover letter, LinkedIn, собеседования, переговоры о зарплате, сравнение офферов, карьерный кейс-стади — весь путь кандидата от мониторинга вакансий до готового отклика.
---

# Portfolio — роутер группы

Физически владеемых подскилла два: `subskills/telegram-vacancy-mining/SKILL.md` (майнинг вакансий из Telegram-каналов) и `subskills/portfolio-writer/SKILL.md` (канон написания кейсов портфолио — голос, словарь рынка, красные флаги). Остальное — глобальный резюме/job-search бандл в `~/.claude/skills/` (не переносится: вендорский набор без общей структуры для переноса, дедуп — на уровне функции). Этот роутер — индекс поверх него, чтобы 22 скилла не терялись плоским списком.

## Свой подскилл

| Задача | Подскилл |
|---|---|
| Мониторинг вакансий в Telegram-каналах, классификация, дедуп, пуш в Notion | subskills/telegram-vacancy-mining |
| Написать, переписать или вычитать кейс портфолио in-buro.com | subskills/portfolio-writer |

## Индекс: резюме/job-search бандл (глобальный, вызывается по своему имени)

| Задача | Скилл |
|---|---|
| Заполнить поля формы отклика (Greenhouse/Lever/Ashby/Workday) | application-form-filler |
| Академическое резюме (faculty/research/postdoc) | academic-cv-builder |
| Перевод опыта в другую индустрию | career-changer-translator |
| Cold email рекрутеру/фаундеру (не cover letter) | cold-email-writer |
| Cover letter под конкретную вакансию | cover-letter-generator |
| Резюме для дизайн/маркетинг/writing ролей (ATS + визуальная версии) | creative-portfolio-resume |
| C-suite/VP/Director резюме | executive-resume-writer |
| STAR-истории и банк ответов к интервью | interview-prep-generator |
| Анализ вакансии: match score, пробелы, скрытые требования | job-description-analyzer — обычно первый шаг перед resume-tailor |
| LinkedIn-профиль (headline, About, буллеты) | linkedin-profile-optimizer |
| Сравнение нескольких офферов (total comp) | offer-comparison-analyzer |
| Развернуть буллет в портфолио-кейс-стади | portfolio-case-study-writer — общая механика; для кейсов in-buro.com канон `subskills/portfolio-writer` |
| Список рекомендателей и подготовка к reference check | reference-list-builder |
| ATS-совместимость резюме (keyword match) | resume-ats-optimizer |
| Переписать слабый буллет (STAR/X-Y-Z + метрики) | resume-bullet-writer |
| ATS-форматирование (layout, шрифты, поля) | resume-formatter |
| Добавить/оценить метрики в буллеты | resume-quantifier |
| Собрать секцию резюме (summary/skills/experience) под уровень | resume-section-builder |
| Подогнать резюме под конкретную вакансию | resume-tailor — потребляет вывод job-description-analyzer |
| Версионирование резюме, master-копия | resume-version-manager |
| Подготовка к переговорам о зарплате | salary-negotiation-prep |
| Резюме под tech-роли (SWE/PM/DevOps) | tech-resume-optimizer — специализация resume-ats-optimizer |

## Дедуп-вахта

- **resume-ats-optimizer / resume-formatter**: оба про ATS-совместимость, разные слои (keyword-парсинг vs визуальный layout) — держать оба, не сливать (вендорский пак).
- **resume-ats-optimizer / resume-tailor**: пересечение в keyword-подборе; `resume-tailor` явно потребляет вывод `job-description-analyzer`, `resume-ats-optimizer` — самостоятельный. Держать оба.
- **resume-bullet-writer / resume-quantifier**: `resume-quantifier` — узкий подслучай `resume-bullet-writer` (только метрики). Если `resume-quantifier` месяцами не зовётся отдельно — кандидат на пенсию в пользу `resume-bullet-writer`.
- **tech-resume-optimizer**: специализация `resume-ats-optimizer` под tech-роли — держать, не сливать (вендорский пак, дедуп по функции не по контенту).
