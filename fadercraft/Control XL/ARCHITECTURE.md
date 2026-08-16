# Control XL — email delivery & tracking

> Пока покрывает только email-инфраструктуру вокруг Control XL (free-modes-gate + личные
> письма пользователям). Архитектура самого M4L-устройства сюда ещё не внесена.

## Два разных канала исходящей почты — их нельзя путать

Fadercraft отправляет письма пользователям Control XL через **два независимых канала**,
и от отправителя зависит, что вообще можно узнать про судьбу письма.

### 1. Автоматический — Resend API (Cloudflare Function)

`app/functions/api/free-modes-gate.js` — срабатывает автоматически, когда посетитель
скачивает бесплатные Custom Modes на сайте (email-gate форма). Шлёт с фиксированной темой
«Your 15 Launch Control XL custom modes» и фиксированным текстом через `api.resend.com`
от `hello@fadercraft.com`. Побочно: пишет лид в D1 (`LEADS_DB`), шлёт владельцу
уведомление о новом лиде, опционально добавляет контакт в Resend Audience.

### 2. Ручной — Gmail «Send mail as» через SendGrid SMTP-relay

Настроено в `hellokbbureau@gmail.com` → Send mail as → `Fadercraft <hello@fadercraft.com>`,
исходящее реально идёт через SendGrid SMTP (см. [[email-setup]] в `brand/email-setup.md`
за DNS/DKIM-детали). Это канал для **личных, вручную написанных писем** — то, что ты
компонуешь сам в Gmail и отправляешь конкретному человеку (например: «вот держи ссылку,
если хочешь»). Resend тут не участвует вообще.

**Письмо, о котором шла речь 2026-08-09** (человек скачал Custom Modes, ты лично ответил
ссылкой) по формулировке — почти наверняка канал 2 (ручной, через Gmail/SendGrid), не
автоматический free-modes-gate. Разница важна, потому что трекинг-возможности у каналов
разные.

## Трекинг открытий/кликов/спам-жалоб — статус на 2026-08-09: НЕДОСТУПЕН

Проверено напрямую (не предположение):

- `RESEND_API_KEY` (`~/.config/resend/env`) — **send-only**. Запрос к `/emails` и
  `/domains` возвращает `401 restricted_api_key: "This API key is restricted to only send
  emails"`. Ключ физически не может прочитать статус доставки/открытия ни одного письма.
- `SENDGRID_API_KEY` (`~/.config/sendgrid/env`) — scopes: `mail.send`,
  `mail.batch.*`, `user.scheduled_sends.*`. **Нет** `stats.read` и нет Activity Feed
  (`messages.read`) — читать статус отправленных писем этим ключом тоже нельзя.
  Заодно free-тир SendGrid может вообще не включать Email Activity Feed (это часто
  платная фича) — не проверено, т.к. ключ отсекается раньше по scope.

Итог: сейчас никто — ни человек через дашборд с текущими правами, ни я через API — не
может увидеть открыл ли конкретный пользователь письмо, кликнул ли по ссылке, попало ли
в спам. Это не «данных нет», это «доступа к данным нет» — оба провайдера технически
трекают это у себя, ключи просто не имеют прав это прочитать.

## Как это включить (два независимых пути, можно оба)

1. **Быстро, для разовых проверок**: зайти в дашборд Resend/SendGrid руками и посмотреть
   статус конкретного письма по получателю — не требует смены ключей, но это ты, не я.
2. **Постоянно, чтобы это было видно и мне, и в PostHog**: завести event webhook —
   у Resend это `email.opened` / `email.clicked` / `email.bounced` / `email.complained`
   (Resend → Webhooks в дашборде), у SendGrid — Event Webhook с теми же событиями.
   Webhook стучится в новый Cloudflare Function (по образцу уже существующих
   `functions/api/gumroad-ping.js` и `functions/api/survey-notify.js`), тот пишет событие
   в PostHog (проект 458316, Fadercraft) — тогда воронка «письмо отправлено → открыто →
   кликнуло» становится обычным PostHog-инсайтом, запрашиваемым в любой момент.
   Для канала 2 (ручные письма через SendGrid SMTP-relay) трекинг сработает только если
   в SendGrid включены Open/Click Tracking в настройках аккаунта (Settings → Tracking) —
   не проверено, т.к. текущий ключ не может это прочитать.

**Открытый вопрос**: если хочешь трекать именно личные однострочные письма (канал 2),
пункт 2 — единственный надёжный путь. Открыть его: либо выдать ключам read-scope
(`stats.read` у SendGrid, полный доступ у Resend), либо сразу настроить webhook — второе
безопаснее (не расширяет права send-only ключа, только добавляет отдельный webhook-секрет).

## Related

- [[email-setup]] — DNS/DKIM/SPF, инбаунд-роутинг, история миграции SendGrid↔Resend
- `app/functions/api/free-modes-gate.js` — код автоматического канала
- `app/functions/api/gumroad-ping.js`, `app/functions/api/survey-notify.js` — образец
  webhook→PostHog моста, который нужно повторить для email-событий
