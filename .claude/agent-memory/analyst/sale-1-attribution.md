---
name: sale-1-attribution
description: Hard attribution of Fadercraft's FIRST SALE (Holger Aust, $39, 2026-06-17) — buyer = maxforlive listing visitor (NOT reddit), control variant, 2 touches, returner; the buy_click person fully matched to the Gumroad receipt
metadata:
  type: project
---

# First sale — hard attribution (2026-06-17)

Done 2026-06-17 ~18:45 ICT. Buyer data from Gumroad email: Holger Aust,
austacademy@gmail.com, Fadercraft Control XL $39 qty1, receipt ~13:50 ICT.

## THE MATCH — who bought
- **person_id `bcf21ee7-cbf0-574e-86ea-6a2b03e912c3`**, distinct_id
  `019eca70-97b0-7184-9316-370840d48ae7`. NL / Desktop / Firefox 151 / Mac OS X,
  city **Serooskerke** (tiny NL village → near-unique fingerprint).
- buy_click 06-17 **13:47:20 ICT** ("Buy on Gumroad • $39") → Gumroad receipt 13:50.
  Geo + device + time all line up. As confident a match as PostHog allows (n=1, no
  identify, but a unique fingerprint).

## SOURCE — maxforlive listing, NOT reddit (important correction)
- The buyer's FIRST captured event (06-15 15:40:37, entry `/free-custom-modes`) carries
  `$referrer = https://fadercraft.com/?utm_source=maxforlive&utm_medium=referral&utm_campaign=control_xl_listing`.
- So true entry = `fadercraft.com/?utm_source=maxforlive...` (the **maxforlive.com
  Control XL listing** via the `/m4l` vanity redirect, device id 15522), landed on `/`,
  immediately clicked through to `/free-custom-modes` → the first *captured* pageview is
  already `/free-custom-modes` with a self-referrer. sessions.$channel_type = "Referral".
- **First Fadercraft sale came from the maxforlive listing, not Reddit.** Channel verdict:
  maxforlive converts to MONEY; reddit so far = reach only ([[reddit-novation-post-1.md]]).
- GOTCHA reinforced: the true source hid in `$referrer` (full URL with UTM) on the FIRST
  pageview, NOT in `$referring_domain` (= self-domain after the in-site hop) and NOT in
  sessions.$entry_utm_* (which were None because the UTM was on the pre-redirect `/` load
  that wasn't separately captured). When a session's entry referrer == fadercraft.com,
  ALWAYS read `properties.$referrer` (full URL) on the earliest pageview to recover UTM.

## PATH — 2 touches, 2 days apart, returner
- **Touch 1 — 06-15 15:40–15:42 ICT (91s):** entry `/free-custom-modes` (from maxforlive),
  ~10 autocapture clicks, hopped to `/`, more autocapture, left. NO mode_download,
  NO video_play. Browsed both pages, didn't grab a free mode, didn't buy.
- **Touch 2 — 06-17 13:47–13:51 ICT (237s):** came back straight to bare `/` (SPA re-entry,
  so $pageview_count=0 on this session — only autocapture+buy_click+pageleave), and after
  ~ on-page time clicked **Buy** at 13:47:20, pageleave 13:51:17 (≈4 min on page → went to
  Gumroad and bought).
- Lifetime events for this person: $pageview×2, $autocapture×11, buy_click×1,
  $feature_flag_called×1 (06-15), pageleave×2. **NO mode_download, video_play,
  demo_interact, or cta_view EVER.** Bought without taking the free modes and without
  the demo-video — a decisive evaluator.

## A/B VARIANT — control (both touches)
- `$feature/hero-permanent-interface` = **control** on every event, both 06-15 and 06-17,
  incl. the buy_click. So the first money came on the CONTROL hero (current feature-led
  copy), NOT the test "permanent interface" variant. n=1 — proves nothing, but logged.
- Both lifetime buy_clicks are now control (06-16 US iPad + this one). test variant: 0 buys.

## EMAIL→PERSON — no identify (as expected)
- NO person in PostHog with email `austacademy@gmail.com` (persons query empty). The buyer
  is anonymous (anon distinct_id only); purchase webhook doesn't identify, and the site
  has no email-collection that fires $identify for buyers. Email↔visitor link exists only
  via the manual fingerprint above, not in PostHog data.

## WEBHOOK — real purchase STILL not captured (re-confirmed 2026-06-17 19:17 ICT)
- Lifetime `purchase` = 2, BOTH `is_test=True`, BOTH 06-10 (gumroad-ping ACLFuPRB US,
  distinct_id `gumroad:6976309857072` + my test_sale_claude_check SG,
  `gumroad:test_purchaser_001`). NO `is_test=False` purchase for the Holger Aust sale.
  The real sale did NOT reach PostHog as a purchase event.
- `purchase` event carries NO email and NO buyer name (verified via event_properties):
  only sale_id, order_number, product_name, price, currency, seller_id, is_test, refunded,
  geo. So even when the webhook works, the buyer's identity never lands in PostHog from the
  purchase event — email↔visitor must be matched by hand or via ph_did stitching.
- Both test pings used the FALLBACK distinct_id `gumroad:<purchaser_id>`, NOT a ph_did →
  proves the checkout URL did NOT carry `url_params[ph_did]` even on the test. Consistent
  with the code finding below.
- What to check on the Gumroad→PostHog side: (1) is the Gumroad Ping (Settings → Advanced →
  Ping) URL set to `https://fadercraft.com/api/gumroad-ping?token=<GUMROAD_PING_TOKEN>` and
  is the token current; a wrong/missing token → 403, ping silently dropped; (2) does it fire
  on real (non-test) sales at all, or only on the "Send test ping" button; (3) `is_test`
  must arrive false on a real sale. Until a real sale lands as purchase(is_test=False),
  conversion-to-money is invisible in PostHog and reconciled by hand vs Gumroad.

## CODE FINDING — checkout URL is NOT stamped (corrects old pipeline memory)
- `app/src/links.ts`: `GUMROAD_URL = 'https://fadercraft.gumroad.com/l/control-xl'` — a
  CLEAN url, no query params. BuyButton just renders this href as-is (verified
  BuyButton.tsx + all ProductPage/FreeCustomModesPage usages). The buyer's buy_click href
  was exactly this clean URL (no `?ph_did`/`hero_variant`/`cta`/`utm`).
- So the user-memory note "Buy link stamps ph_did/variant/cta into url_params" (auto-memory
  reference_gumroad_purchase_pipeline) is STALE/WRONG vs current code. The gumroad-ping.js
  function still READS `url_params[ph_did]`/`[hero_variant]`/`[cta]`/`[utm_source]` and would
  use them — but the site never PUTS them on the link → they always arrive empty → purchase
  always falls to `gumroad:<purchaser_id>`, can't auto-stitch to the visitor's PostHog person
  and can't carry source/variant. To make purchase attribution work, the Buy href must be
  stamped client-side with `?ph_did=<posthog.get_distinct_id()>&hero_variant=<variant>&cta=
  <location>&utm_source=<…>` before navigating to Gumroad. (eng task, not analytics.)
- gumroad-ping.js explicitly forwards NO email and NO license key (privacy by design).

## DISCORD — buyer never touched it; link is footer-only & untracked
- `social_click` lifetime = 2 events TOTAL, both 06-10 from the TH person 2352f295
  (youtube + instagram). `platform=discord` count = 0 EVER. The buyer fired 0 social_click.
- `$autocapture` clicks on anything containing "discord" = 0 lifetime (nobody ever clicked
  a Discord link on the site).
- Discord link on the site = footer only (`FooterFull.tsx`: https://discord.gg/EBsdgst3jU,
  a RAW invite, NOT a tracked /discord vanity redirect — there is no discord row in
  `_redirects` nor an `/r-*`-style /discord slug). HomePage + SendsFollowerPage have teaser
  copy "join the Discord" but the only actual clickable Discord URL is the footer one.
- The buyer never scrolled to the footer either touch (replay 06-17 had 1 click = the Buy
  pill; 06-15 had 13 clicks but stayed on free-modes + top of `/`). So in PostHog there is
  NO signal the buyer ever saw a Discord invite ON THE SITE. Whether he got one POST-purchase
  (Gumroad receipt / product content / email) is NOT visible in PostHog → manual check.

## REPLAY — buyer's two recordings exist
- 06-17 buy session `019ed447-168b-7b62-ac2b-9ee9df925fa2` (https://us.posthog.com/project/458316/replay/019ed447-168b-7b62-ac2b-9ee9df925fa2):
  start 13:31:33 ICT, start_url `/`, 1 click (the Buy pill), ~58s active / ~1124s idle
  (opened, bought, left tab open). 0 console errors.
- 06-15 first session `019eca70-97ba-73ab-a4e5-f7a30488fda0` (https://us.posthog.com/project/458316/replay/019eca70-97ba-73ab-a4e5-f7a30488fda0):
  start 15:40:37 ICT, start_url `/free-custom-modes`, 13 clicks, ~97s active. Engaged but
  no mode_download / no video_play / never reached the product page `/control-xl`.
- Buyer's lifetime pages = only `/` and `/free-custom-modes`. NEVER visited `/control-xl`
  (the full product/spec page). Bought off the homepage + free-modes bridge alone.
