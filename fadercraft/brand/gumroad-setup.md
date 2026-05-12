---
type: setup-doc
project: Fadercraft
created: 2026-05-12
updated: 2026-05-12
---

# Gumroad Setup — Source of Truth

Single document covering Gumroad seller account configuration, license-verification architecture, environment variables, and what is intentionally NOT wired up yet. Use this when picking up Gumroad work in any future session.

Related: [[wiki/payment-rails]] (why Gumroad), [[wiki/roadmap]] (Phase 0 checklist), `brand/email-setup.md` (transactional email infra).

## Seller account

- Seller handle: `fadercraft` (`gumroad.com/fadercraft`)
- Verification: passed 2026-05-12 (Russian passport + Thai address proof, profile setup as Individual / Thailand resident)
- Business name (used on invoices): `Fadercraft`
- Support email: `support@fadercraft.com` (routed via CF Email Routing → Gmail)

## Payout

- Method: Bank Account (Stripe Connect → Thailand)
- Bank code: `002` (Bangkok Bank)
- Currency: THB
- Schedule: Weekly, minimum payout USD 100 (Thailand floor)
- Effective fee at $39 list price: ~$5.83 (10% + 50¢ Gumroad + 2.9% + 30¢ card) ≈ 15%
- PayPal: intentionally NOT connected — PayPal Thailand requires NDID, blocked for foreign residents

## Identifiers

- `seller_id` (from Settings → Advanced): `KqksizqwmpYMmR0vaDfEjA==`
  Used to authenticate inbound Gumroad Ping POSTs once we write the ping handler.
- `product_id`: TBD — assigned by Gumroad on product creation. Needed for `/v2/licenses/verify` API call.
- Product permalink: TBD — planned slug `xl-performance` → `gumroad.com/l/xl-performance`

## License-verification architecture

Two distinct flows, intentionally separated:

### Flow A — Live license verification (implemented)

Endpoint: `web/functions/api/verify-license.js` (CF Pages Function on `main`)

Caller: Fadercraft landing page (`update.html`) or M4L device (`update_check.js`).

Contract:
- `POST https://fadercraft.com/api/verify-license`
- `Content-Type: application/json`
- Body: `{license: "XXXX-XXXX-XXXX-XXXX"}`
- Response: `{ok: true, download_url: "..."}` on success, `{ok: false, error: "..."}` otherwise

Internally calls `https://api.gumroad.com/v2/licenses/verify` with `product_id` + `license_key`. Reads `env.GUMROAD_PRODUCT_ID` and `env.LATEST_BUNDLE_URL`.

### Flow B — Gumroad Ping webhook (NOT implemented, NOT enabled)

Would be: `web/functions/api/gumroad-ping.js` — receives `application/x-www-form-urlencoded` POST on every sale/refund/dispute. Use cases when we want it:
- custom welcome email from our own infra (replacing Gumroad's receipt),
- log sales to our own DB,
- auto-subscribe buyer to Buttondown.

On MVP we don't need it. Gumroad's native receipt email + Sales dashboard are sufficient. License verification works without ping (Flow A pulls directly from Gumroad API).

**Current state of `gumroad.com/settings/advanced` Ping endpoint:** SHOULD BE EMPTY. Earlier attempt put the verify-license URL there — that endpoint expects JSON `{license: "..."}` and would return 400 on every form-urlencoded ping, triggering Gumroad retries. Clear the field until Flow B is built.

## Environment variables in CF Pages

Project: `fadercraft` (CF Pages → Workers & Pages → fadercraft → Settings → Variables and Secrets → Production).

| Name | Type | Value | Status |
|---|---|---|---|
| `GUMROAD_SELLER_ID` | Secret | `KqksizqwmpYMmR0vaDfEjA==` | ✅ set 2026-05-12 |
| `GUMROAD_PRODUCT_ID` | Text | (assigned on product creation) | ⏳ pending T12 |
| `LATEST_BUNDLE_URL` | Text or Secret | (signed URL or Gumroad-hosted download) | ⏳ pending T12 |

Without `GUMROAD_PRODUCT_ID`, the verify-license endpoint returns 500 "Server misconfigured". Therefore: do not announce the license-key flow as live until both `GUMROAD_PRODUCT_ID` and `LATEST_BUNDLE_URL` are populated.

## Bundle hosting decision

Default plan: **Gumroad-hosted ZIP** (upload to product content storage on Gumroad). Lower complexity, signed download URLs handled by Gumroad. `LATEST_BUNDLE_URL` would then be Gumroad's stable download endpoint per license.

Alternative: self-host ZIP in Cloudflare R2. Adds R2 binding + signed-URL generation logic in `verify-license.js`. Only switch to this if we hit Gumroad bandwidth or download-control limits — not on MVP.

## Gumroad-side settings checklist

Mapped 1:1 to [[wiki/roadmap]] Gumroad section. Status snapshot 2026-05-12:

- [x] Seller verification (2026-05-12)
- [x] Payout method (Bangkok Bank, THB)
- [x] Business name (Billing → `Fadercraft`)
- [x] Invoice PDF on every receipt (Billing → Delivery toggle)
- [ ] Tax interview / W-8BEN — check whether Gumroad requires one for non-US individual sellers; not yet visible in dashboard
- [ ] Profile avatar + bio + social links (depends on T3 brand identity)
- [ ] Support email field in general Settings = `support@fadercraft.com`
- [x] Product draft created 2026-05-12: name `Fadercraft XL Performance`, slug `xl-performance`, price $39, description from landing-narrative Beat 1–2, CTA `Buy now`, three Additional Detail rows (Hardware / DAW / License), e-publication for VAT ON, refund policy ON (14-day money back, fine print pointing to support@ + /refund)
- [ ] **License keys toggle** — в новом Gumroad UI лежит в Content tab → Files settings, появляется только после загрузки хотя бы одного файла. Без этого toggle Flow A endpoint бесполезен. Включить вместе с загрузкой bundle (T12). Также поставить `Limit uses per license key = 3` (три машины на ключ).
- [ ] Cover image 1280×720
- [ ] Upload bundle ZIP (after T12)
- [x] Receipt tab настроен 2026-05-12: Button text `Download XL Performance` (24/26 chars), Custom message — компактный thanks + what's inside + license-key reminder + support email
- [x] Share tab 2026-05-12: Category `Music & Sound Design`, 1-5 star rating display ON, profile section toggle ON
- [x] Tags (Gumroad hard-limits to **5**, curated to avoid substring duplicates): `max for live`, `ableton live`, `launch control xl`, `novation`, `live performance`. Rejected: `m4l` (substring of "max for live"), `ableton` (substring of "ableton live"), bare `launch control` (matches old non-XL hardware → risk of mismatched buyers).
- **Critical lesson 2026-05-12:** товар нельзя Publish до того, как (а) bundle ZIP залит в Content, (б) license keys toggle ON. Первый успешный sale запускает Gumroad Risk Review — если первый покупатель получит пустоту и потребует refund, Risk Review это увидит как negative signal. Держать в draft до полного T12.
- **Gotcha:** Custom message field has **hard limit ≈580 characters** (silently truncates mid-word, no error). Always test in Preview pane. First two attempts were truncated; final compact version ≈480 chars fits with safety margin.
- [ ] Once bundle is ready, проверить что download button (Receipt tab button text) показывается корректно на post-purchase странице
- [ ] Discover sales: leave at default 30% (organic Gumroad marketplace traffic worth more than 10% extra margin)
- [ ] 100% off discount code for smoke test (T13)

## Third-party analytics (Settings → Third-party analytics)

- Toggle: ON
- Google Analytics: not yet linked — set up GA4 property for `fadercraft.com` and paste measurement ID before launch
- Facebook Pixel / TikTok Pixel: leave empty until we start paid traffic
- Domain verification: leave OFF until pixel is connected (verification is for pixel attribution, not for ping)

## What is intentionally NOT done

- PayPal connection — blocked by NDID, do not retry
- Gumroad Ping endpoint — empty until Flow B handler is written
- Custom domain (`buy.fadercraft.com`) — defer; `gumroad.com/l/xl-performance` is fine on MVP
- Gumroad Workflows (post-purchase automations) — defer to Phase 1, low ROI before any sales data
- Affiliates program — defer to Phase 1
