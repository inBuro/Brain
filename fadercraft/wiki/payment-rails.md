---
type: reference
project: Novation
created: 2026-05-06
updated: 2026-05-06
---

# Payment Rails for a Russian-passport Seller in Thailand

**Summary**: Decision matrix for plugin-distribution payment rails, calibrated to the seller profile of [[Novation XL]] / Fadercraft: Russian passport, Thailand long-stay residence, Bangkok Bank account in own name, no Thai national ID. Most Western Merchant-of-Record platforms are blocked by either sanctions screens or the Thai-NDID-only requirement; viable paths in 2026 are Isotonik B2B, Payoneer + crypto checkout, or a foreign legal entity (Georgian Individual Entrepreneur).

**Sources**: research-2026-05-06, vendor ToS pages cited inline, `wiki/roadmap.md` (Phase 0 progress).

**Last updated**: 2026-05-12 (Gumroad verification passed — flipped from Blocked to primary rail)

---

## Why a dedicated page

The "just sign up for Lemon Squeezy / Polar / PayPal" advice that works for most digital-product sellers fails three ways for this profile:
1. **Citizenship-based sanctions screen** — Stripe, Wise, Polar (via Stripe Connect), Patreon all screen Russian citizenship independently of country of residence. Post-2022 EU/UK/US sanctions packages tightened through 2025–2026, not loosened.
2. **Thai NDID requirement** — PayPal Thailand has required NDID (Thai citizen-only digital ID) since Oct 2022; foreigners cannot register or hold a Thai PayPal account. This is independent of Russian citizenship.
3. **Thai entity requirement** — Stripe Thailand requires a Thai-registered juristic person (Co., Ltd. or sole proprietor with Thai tax ID). Foreign-passport individuals do not onboard directly.

The Bangkok Bank account in own name (opened on Russian passport as foreign resident) satisfies the "Thai bank" sub-requirement on most platforms but does not satisfy the "Thai national ID" sub-requirement.

## Verdict matrix (2026)

| Platform | Verdict | Choke point |
|---|---|---|
| **PayPal Thailand** | Blocked | NDID (Thai-citizen-only) since Oct 2022; foreigners cannot register |
| **Stripe Thailand (direct)** | Blocked | Requires Thai entity + Thai tax ID; sanctions EDD on Russian directors |
| **Wise personal** | Blocked | EU 19th sanctions package (Jan 2026): Russian-passport cards closed except for EEA/Swiss residents; Thai residence does not qualify |
| **Lemon Squeezy** | Blocked | Payout rail requires Stripe in supported country; Russia not listed |
| **Gumroad** | **Works** ✅ (verified 2026-05-12) | Onboarded as Thailand-resident seller; passed verification on Russian passport + Thai address. Payouts через Stripe Connect Thailand → Bangkok Bank THB |
| **Polar.sh** | Blocked | Stripe Connect Express + explicit Russia exclusion |
| **Patreon** | Blocked-ish | "Based in Russia" creators blocked; Stripe-payout dependency replicates Polar's wall; gray zone for Russian-citizen Thai residents |
| **Paddle** | In progress | KYC via Sumsub — first attempt rejected for photo quality; awaiting support reply on session re-unlock |
| **Payhip** | Blocked (transitively) | No nationality clause itself, but requires active Stripe/PayPal seller — both unavailable |
| **Payoneer** | **Works** | Russian passport + Thai address proof + Bangkok Bank THB payout supported |
| **Isotonik Studios** | **Works** | Private B2B reseller; no public nationality restriction; payout via PayPal/bank/Wise on contract terms |
| **Crypto checkout** (NOWPayments / Cryptomus / Coinbase Commerce) | **Works** | Self-hosted; USDT/USDC payout to self-custody; off-ramp via Bybit P2P → Bangkok Bank THB |
| **Georgian Individual Entrepreneur** | **Works (entity setup)** | Remote registration on Russian passport via PoA; 1% tax up to 500k GEL; unlocks Wise Business and possibly Stripe Georgia |

## What Thai documents unlock what

The seller has booked a Thai motorbike driving license exam for 2026-07-01 (see [[roadmap]]). Worth being explicit about what that unlocks vs what it does not:

| Thai document | Effort | What it unlocks |
|---|---|---|
| Motorbike DL | weeks | Secondary photo ID for Sumsub-style KYC (Paddle, etc.); proof of Thai address for Payoneer / Wise / Lemon-style residence checks |
| Thai tax ID | days–weeks | Required input for Thai sole-prop / Co. registration; alone does not open processors |
| Work permit (Non-B + sponsoring company OR LTR Visa OR BOI Smart Visa) | months | Combined with Thai company → enables Stripe Thailand sole-prop / company onboarding |
| Thai company (Co., Ltd.) | 3–6 months, ~30–60k THB setup + ~30–50k THB/yr | Unlocks Stripe Thailand → cascades to Polar, Lemon, Paddle via Stripe Connect |
| Thai PR (Permanent Residence) | 5+ years on consecutive Non-B | Tax-residence clarity; does **not** grant NDID |
| Thai citizenship | 5+ years from PR | NDID → unlocks PayPal Thailand. Very long horizon |

**Critical:** Thai DL alone does not bypass citizenship-based sanctions screens. KYC providers see Thai DL as identity proof but still cross-check nationality / place of birth against OFAC/EU lists. The DL primarily helps where the wall is "no Thai address proof" or "no second photo ID", not where the wall is "Russian citizenship".

The single Thai document with the largest unlock surface is the **Thai company registration (with associated work permit)** — it opens the entire Stripe-based MoR ecosystem. But for a Russian-passport founder, foreign ownership of a Thai Co. Ltd. is restricted to 49% unless going through BOI/LTR/Smart Visa exemptions, which adds significant capital and time cost.

## Realistic onboarding order for Fadercraft

1. **Gumroad** ✅ — **primary fiat MoR**. Verification пройдена 2026-05-12. Запускаемся на нём, не дожидаясь Paddle.
2. **Payoneer** — open in parallel as USD receiving rail для Isotonik revenue share, freelance income, B2B remittance. Не нужен для Gumroad payouts (Stripe Connect → Bangkok Bank напрямую).
3. **Isotonik Studios** — write to them as soon as XL_Performance is in production-ready state with demo video. Curated reseller для Max for Live; revenue share ~50–70%. Параллельный канал к Gumroad, не замена.
4. **Crypto checkout on Fadercraft landing** — secondary rail для покупателей, не желающих идти через Gumroad (RU-аудитория, приватность). Evaluate Cryptomus vs NOWPayments vs Coinbase Commerce.
5. **Paddle approval** (in flight, deprioritized) — больше не критично; если Sumsub разблокируется и одобрит — добавляем как второй MoR с EU-VAT handling. Если нет — закрываем тред без потерь.
6. **Georgian Individual Entrepreneur** — defer до выручки ≥ $500–1000/мес. Имеет смысл, только если Gumroad когда-нибудь развернёт политику или захотим Stripe-зависимые рельсы (Lemon/Polar).

PayPal Thailand, Stripe Thailand (direct), Wise personal, Polar.sh direct, Lemon Squeezy direct — всё ещё dead-end для профиля без entity-level workaround.

## Choke-point summary for future me

When asked about a new payment platform, screen on three independent axes before recommending:
1. Russian citizenship / sanctions — does the platform's ToS or its underlying processor (Stripe/Wise/PayPal) block Russian nationals regardless of residence?
2. Thailand residence — does it accept Thailand as a seller country? Are payouts supported in THB or only in USD/EUR?
3. Thai national ID — is it required (e.g. NDID for PayPal Thailand), or does a Russian passport suffice for the foreign-resident path?

A platform must clear all three to onboard this seller. "Available in Thailand" alone is insufficient.

## Related pages

- [[Novation XL]] — project hub
- [[roadmap]] — Phase 0 progress, including Thai DL track and Paddle onboarding
- [[index]] — flat TOC
