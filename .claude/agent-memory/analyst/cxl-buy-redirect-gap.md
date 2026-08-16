---
name: cxl-buy-redirect-gap
description: CXL buy attribution gap (server-side -buy redirects) — FIXED 2026-07-14 with bridge pages; buy_click event schema from bridges; historical blind spot note
metadata:
  type: project
---

# CXL Goals: The Server-Side Redirect Blind Spot — RESOLVED 2026-07-14

Diagnosed 2026-07-14. Owner saw Gumroad traffic to Control XL but PostHog Goals tile showed near-zero. Root cause: NOT broken Actions — structural redirect gap. Now fixed.

**How to apply:** When owner compares Gumroad vs PostHog CXL buy_click counts, remember the pre-07-14 blind spot. From 07-14 onward, bridge pages fire buy_click and the gap is closed.

## Root cause (pre-fix)
Five 302 server-side redirects in `app/public/_redirects` went DIRECTLY to Gumroad — PostHog snippet never executed, no `buy_click` fired. Gap existed since 2026-06-12 (short-link deploy date).

## FIXED 2026-07-14 ~13:13 ICT — Bridge pages deployed to prod

All six `-buy` short links are now static bridge pages. They fire `buy_click` via `sendBeacon` then redirect to Gumroad.

| Slug | Product | Fires into Action |
|------|---------|-------------------|
| `/m4l-buy` | CXL (`l/control-xl`) | 285962 ✅ |
| `/yt-buy` | CXL (`l/control-xl`) | 285962 ✅ |
| `/r-buy` | CXL (`l/control-xl`) | 285962 ✅ |
| `/tg-buy` | CXL (`l/control-xl`) | 285962 ✅ |
| `/fb-buy` | CXL (`l/control-xl`) | 285962 ✅ |
| `/yt-sf-buy` | SF (`l/sends-follower`) | 285584 ✅, NOT 285962 |

### buy_click event schema from bridge pages
- `href` — full Gumroad URL with UTM + `ph_did` + `cta=<slug>`, e.g.:
  `https://fadercraft.gumroad.com/l/control-xl?utm_source=maxforlive&utm_medium=referral&utm_campaign=control_xl_listing&ph_did=...&cta=m4l-buy`
- `label` — slug, e.g. `m4l-buy`
- `path` — `/<slug>`, e.g. `/m4l-buy`
- `utm_source`, `utm_medium`, `utm_campaign` — as event properties (use for channel attribution)
- `$lib` = `fc-buy-bridge` — **key distinguisher** vs on-site clicks (`$lib=web`);
  filter `$lib = fc-buy-bridge` to isolate redirect-path buy intent

### E2E test event — IGNORE
- `distinct_id=fadercraft-owner`, `label=m4l-buy`, `utm_source=maxforlive`
- Timestamp: 2026-07-14T13:15:01+07:00
- Filtered by `filterTestAccounts: true` automatically

### Attribution gap: pre-14 July historical data
All `-buy` clicks before 2026-07-14 are a TOTAL BLIND SPOT in PostHog (gap since 2026-06-12).
**Do NOT compare buy_click counts before vs after 07-14 without this caveat.**
Pre-07-14 valid CXL buy_click data = only on-site clicks (from /control-xl, /, /free-custom-modes) = 9 total events lifetime (see action-get history).

## Action 285962 "LC — Buy click" — current definition (updated 07-14; renamed CXL→LC 2026-07-19)
- Step: `buy_click` + `href icontains "gumroad.com/l/control-xl"`
- Catches: on-site clicks from /control-xl, /free-custom-modes, / + bridge page clicks
- Does NOT catch: SF (`l/sends-follower`), library access (`app.gumroad.com/library`)
- Historical match: 9 events (earliest 06-16, latest 07-08; after 07-08 = 0 until bridges fire)

## buy_click selector in index.html (on-site)
```js
a[href*="gumroad.com/l/"], a[href*="app.gumroad.com/library"]
```
Fires for: (1) checkout links AND (2) library download links for existing owners.
The `/updates` buy_click events (href=app.gumroad.com/library) are library access — Action 285962 correctly ignores them (href filter only matches `l/control-xl`).

## Hub page: no direct Gumroad links
HubPage.tsx uses `ctaHref="/control-xl"` — funnels to product page, no direct Gumroad link. Clean.
