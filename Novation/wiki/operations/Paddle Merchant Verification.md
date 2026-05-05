---
type: operations
project: Novation / Fadercraft
status: BLOCKED
created: 2026-05-05
updated: 2026-05-05
---

# Paddle Merchant Verification

**Summary**: Текущий launch-блокер №1 для Fadercraft. Paddle (Merchant of Record) удерживает мерчант-аккаунт в frozen/pending состоянии до прохождения KYC. Без разморозки нельзя ни принимать платежи, ни выполнить T4/T6/T12 из [[Phase 0 plan]]. Все остальные фронты Phase 0 (домен, email, лендинг, апдейтер) технически могут двигаться, но превращаются в мёртвый груз без рабочего платёжного канала.

**Sources**: `Novation/web/functions/api/verify-license.js` (origin/t6/paddle-license, header-комментарий с историей пивота), устные пояснения Кирилла 2026-05-05.

**Last updated**: 2026-05-05

---

## Цепочка зависимостей

```
Stripe KYC → REJECTED
        ↓
Pivot to Paddle (as Merchant of Record)
        ↓
Paddle KYC → FROZEN / pending document
        ↓
DLT visit (2026-05-06) → obtain document [?]
        ↓
Submit document to Paddle → expect verification unfreeze
        ↓
Phase 0 unblocks: T4 (Gumroad→Paddle storefront), T6 (license verifier needs PADDLE_API_KEY), T12 (bundle upload)
        ↓
Launch (target: late May 2026)
```

## Что мы знаем точно

- **Stripe отказал в KYC.** Проект пивотнул на Paddle as MoR. Источник: header-комментарий в `verify-license.js` (ветка `origin/t6/paddle-license`).
- **Gumroad полностью убран из контура.** В коде уже только Paddle Transactions API (`GET https://api.paddle.com/transactions/{id}`) с буквой «license key» = Paddle `txn_*`.
- **Paddle Licensing API** (отдельный endpoint `POST /licensing/v1/license-keys/validate`) ещё не включён на аккаунте — limited release. Текущий код-обходник через Transactions API помечен `TODO(paddle-api-verification)`.
- **Требуется ENV:** `PADDLE_API_KEY` (live в проде, sandbox в preview), `LATEST_BUNDLE_URL`, опционально `PADDLE_PRODUCT_ID`. Все три задаются в Cloudflare Pages env, но **бессмысленны без активной мерчант-учётки.**
- **Имя продавца на email-сигнатуре:** Кирилл (`brand/email-setup.md` → Buttondown welcome draft).

## Что нужно уточнить (open)

- **DLT — что это конкретно?** Пока в репо не записано. Контекст из 2026-05-05: «получение [документа] = визит в DLT, способ разморозить верификацию на Paddle». Наиболее вероятная интерпретация — гос-/частная организация, где выдаётся ID-документ для KYC (водительское удостоверение / пакет регистрационных документов / нотариально заверенная копия). **Заполнить после визита.**
- **Какой именно документ Paddle потребовал.** Паспорт уже подавался при первичной заявке (иначе аккаунт бы не дошёл до frozen-состояния), значит Paddle запросил **второй** или **подтверждающий** документ. Записать тип документа в эту страницу после получения.
- **Дедлайн на стороне Paddle.** Есть ли срок, после которого заявка будет отклонена? Уточнить в письме от Paddle.
- **План B на случай отказа Paddle.** После Stripe и Paddle вариантов MoR немного: LemonSqueezy, FastSpring, Polar.sh. Пока не нужен; зафиксировать сюда, если визит не даст разморозки.

## Что уже сделано в коде

| Файл | Ветка | Что |
|---|---|---|
| `Novation/web/functions/api/verify-license.js` | `origin/t6/paddle-license` | Полностью переписан под Paddle Transactions API. Готов к работе как только аккаунт активен. |
| `Novation/dist/Quickstart.md` | `origin/t6/paddle-license` | Готовый Quickstart для покупателей (Phase 0 T11). |
| `Novation/brand/email-setup.md` | `origin/t6/paddle-license` | +31 строка, в т.ч. Buttondown welcome email draft. |
| `Novation/web/*.html` (5 файлов) | `origin/t6/web-shell` | Удалены — ребилд лендинга. |
| `Novation/web/*.html` (placeholder pages) | `origin/t7/placeholder-pages` | Placeholder-страницы под Paddle onboarding. |

Ни одна из этих веток ещё не в `main`. Локальная `claude/cd-novation-UNYOv` отстаёт.

## Связи

- [[XL_Performance — как это работает]] — само устройство, оно готово.
- [[Phase 0 plan]] — `docs/superpowers/plans/2026-05-01-fadercraft-phase-0.md`. Этот блокер влияет на T4, T6, T12.
- [[Launch Status]] — общая сводка состояния всех Phase 0 task'ов (TBD).

## Что записать после визита 2026-05-06

1. Что такое DLT — расшифровать акроним и роль организации.
2. Какой документ получен (тип, срок действия).
3. Когда документ ушёл в Paddle, по какому каналу.
4. Ответ Paddle — таймлайн ожидания разморозки.
5. Если отказ — переход к плану B.
