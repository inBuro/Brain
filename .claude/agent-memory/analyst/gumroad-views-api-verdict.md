---
name: gumroad-views-api-verdict
description: Gumroad API has NO page views endpoint — confirmed 2026-07-27; best proxy is buy_click in PostHog; daily snapshot script set up
metadata:
  type: project
---

## Verdict: Gumroad page views are NOT available via API

Investigated 2026-07-27. Probed every potential endpoint:
- `/v2/analytics` → 404
- `/v2/views` → 404
- `/v2/products/{id}/stats` → 404
- `/v2/products/{id}/views` → 404
- `/v2/products` → 200, but fields = `sales_count` + `sales_usd_cents` ONLY (no views, no impressions, no visitor counts)

Gumroad Creator Dashboard shows page views visually but exposes ZERO analytics via API v2. This is a confirmed platform limitation.

**Why:** Gumroad built their API for transactional use (sales, licenses, subscriptions) — not for analytics. Page view data is siloed in their internal analytics layer.

**How to apply:** Never try to pull "Gumroad page views" via API — it doesn't exist. Tell the user to check Gumroad Creator Dashboard manually for that number.

## What IS available from Gumroad API

- `sales_count` (cumulative per product)
- `sales_usd_cents` (cumulative revenue)
- Individual sales with `referrer` field (shows where the buyer was BEFORE checkout)
  - Dynamic Focus: referrer = `https://fadercraft.com/dynamic-focus` (our landing page)
  - Control XL: referrer = `direct` (probably maxforlive.com → Gumroad, but referrer stripped)

Current sales_count as of 2026-07-27:
- Dynamic Focus: 1 (matches PostHog `purchase` is_test=False)
- Control XL: 1 (matches PostHog `purchase` is_test=False)
- Sends Follower: 0

## Best available proxy for Gumroad interest signal

`buy_click` in PostHog = users who clicked Buy on fadercraft.com → went to Gumroad. 90-day totals:
- Dynamic Focus: 15 clicks (week of 07-20: 14 alone — spike)
- Sends Follower: 14 clicks
- Hub page (`/`): 6 clicks
- Control XL: 4 clicks
- `/updates` page: 4 clicks
- `/yt-df-buy` redirect: 2 clicks
- `/free-custom-modes`: 1 click

PostHog insight saved: **GAVUly2Z** "Buy clicks by product — Gumroad intent signal"
https://us.posthog.com/project/458316/insights/GAVUly2Z

## Daily Gumroad stats snapshot (set up 2026-07-27)

Script: `~/.config/gumroad/daily-snapshot.sh`
- Polls `/v2/products` daily
- Sends `gumroad_stats_snapshot` event to PostHog for each product (props: product_name, sales_count, sales_usd_cents, price_cents, delta_since_last)
- Sends `gumroad_new_sale_detected` when sales_count increases (backup signal alongside webhook)
- Persists state to `~/.config/gumroad/last_snapshot.json`
- Log: `~/.config/gumroad/snapshot.log`

LaunchAgent: `com.fadercraft.gumroad-snapshot` (daily 12:00 ICT = 05:00 UTC)
**Plist NOT auto-loaded** (classifier blocked write to ~/Library/LaunchAgents). User must run:
```
launchctl load ~/Library/LaunchAgents/com.fadercraft.gumroad-snapshot.plist
```
after saving the plist manually (see MEMORY.md for plist contents).

### Important caveat on first run
First run always shows `delta=1` for products with existing sales (since no previous snapshot). This is NOT a real new sale signal. From the 2nd run onward, delta is accurate.
