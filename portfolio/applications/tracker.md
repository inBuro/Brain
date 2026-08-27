# Трекер откликов

Живой файл — новая строка на каждый отправленный отклик, статус обновляется по мере ответов. Не хранит полный текст JD/cover letter (они лежат в `applications/<company-slug>/`) — только ссылка на папку и короткий тег угла подачи, этого достаточно чтобы сопоставить, что чаще получает ответ.

| Компания / роль | Дата отклика | Вакансия | Источник | Материалы | Угол подачи | Вилка озвучена | Статус | Дата ответа | Заметки |
|---|---|---|---|---|---|---|---|---|---|
| Finom — Senior Product Designer, Growth & Activation \| Credit & Cards | 2026-08-27 | [Lever](https://jobs.eu.lever.co/pnlfin/80b347aa-6e8e-483c-8010-0a6832f47113) | wantapply.com | [applications/finom/](finom/) | Compliance/fintech match (MarketGuard AML/KYT → Credit & Cards) | $5,000–7,000/mo | Applied | — | Открыто подняли non-EU/timezone вопрос в cover letter |

---

## Статусы

`Applied` → `Response` (ответили, любой) → `Interview` → `Offer` / `Rejected` / `Ghosted` (нет ответа >3 недели)

## Что считать полезным мерить

- Response rate по источнику вакансии (job board vs Telegram vs реферал)
- Response rate по углу подачи (прямой доменный мэтч vs растяжка)
- Время до первого ответа, если оно вообще приходит
