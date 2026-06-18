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

## WEBHOOK — only setup/test pings reached PostHog for this sale (revised 2026-06-19; root-cause corrected)
- NO WEBHOOK BUG. `gumroad-ping.js` line `is_test: f('test') === 'true'` HONESTLY MIRRORS
  the `test` form-field Gumroad sends — it does not set, invert, or mislabel the flag.
  Verified against deployed `app/functions/api/gumroad-ping.js` (owner sign-off 2026-06-19).
- So the 5 `is_test=True` rows for this sale are almost certainly **setup/test pings** fired
  while the Gumroad Ping endpoint was being stood up (instrumentation was wired ~same time
  as sale #1), NOT a real sale mis-flagged. There was no real non-test ping for sale #1
  because the pipeline wasn't live yet when it happened.
- Live re-check 2026-06-18 23:55 ICT: filtering `purchase` by order_number=1010996217 /
  sale_id returns **6 rows** for ONE logical sale: my 1 backfill (is_test=false) + **5
  IDENTICAL gumroad-ping rows (is_test=True)** all stamped 06-17 13:50:33 ICT — Gumroad
  RETRIED/re-fired the ping 5× (same sale_id, same order, $39), all on fallback distinct_id
  `gumroad:5290360120821` / person `431759b1-5ac2-55e9-aa22-1822200ad68d` (no ph_did → not
  stitched to the buyer). The "3rd purchase" wording in the old note was an undercount of
  these ping repeats; the true picture is 5 test-pings + 1 backfill. Dedupe on sale_id → 1
  real sale. (Retries like this no longer double-count — see DEDUP fix in [[day-2026-06-17]].)
  Each ping `country` prop = "The Netherlands"; `$geoip_country_code=US` = Gumroad's
  server IP, ignore (the backfill's geo_cc=TH is likewise the capture-proxy IP, not the
  buyer — the buyer's real geo is NL/Serooskerke, read off the buy_click session).
  Its `country` prop = "The Netherlands" (Gumroad billing country = confirms NL);
  `$geoip_country_code=US` on it is just Gumroad's server IP, ignore it.
- So the real sale was INVISIBLE to analytics (is_test filter drops it) and detached
  from the buyer's person. The earlier "lifetime purchase = 2" read missed this 3rd ping
  because it counted from memory; on 06-18 the live query showed 3.

## BACKFILL — clean purchase event inserted 2026-06-18 (~11:43 ICT)
- Inserted ONE `purchase` event via PostHog capture API (first-party `/ingest` proxy,
  public client token) to make the first real sale visible in analytics/funnel and
  attached to the buyer.
- distinct_id = `019eca70-97b0-7184-9316-370840d48ae7` (the buy_click visitor) → person
  **bcf21ee7** (this same buyer). $session_id `019ed447-168b-7b62-ac2b-9ee9df925fa2`
  (the buy session) so source/variant inherit via the session.
- Props: timestamp `2026-06-17T13:50:00+07:00`, product_name "Fadercraft Control XL",
  product_permalink "control-xl", price 39, currency USD, quantity 1, **country NL**
  (= $geoip_country_code of the buy_click session), **is_test=false**,
  source="manual-backfill", backfill_reason="lost-first-sale-pre-ping-fix",
  + sale_id/order_number copied from the real ping for dedupe, no PII (no email/name).
- VERIFIED: landed on 06-17, person_id bcf21ee7, real-purchase count now 1 (is_test=false),
  no dup. Attribution re-confirmed via the person's first $pageview $referrer =
  maxforlive listing (utm_source=maxforlive…control_xl_listing).
- RE-VERIFIED LIVE 2026-06-18 23:55 ICT: the backfill `purchase` sits in the SAME session
  as the buy_click (`$session_id 019ed447-168b-7b62-ac2b-9ee9df925fa2`), timestamp
  13:50:00 ICT (between buy_click 13:47:20 and pageleave 13:51:17) — so source/variant
  inherit cleanly via the buy session. Person's full lifetime event sequence holds exactly
  as logged below (2 touches, control on every event, NO mode_download/video_play/demo_interact/
  cta_view ever). Nothing drifted. The Gumroad CSV (Sales20260618.csv) line for this sale —
  referrer=direct, all UTM empty, order 1010996217, NL/ZH — matches: Gumroad sees `direct`
  because the checkout URL is unstamped (CODE FINDING below); the TRUE source only survives
  in PostHog's first-pageview $referrer.
- DEDUPE RULE for future real-sale counts: filter `is_test != true` AND, when both the
  test-flagged ping and this backfill coexist, dedupe on `sale_id='aKrKs--u0JFZjW2haKM73w=='`
  (count the backfill row, not the is_test=True ping). NOTE 2026-06-19: `gumroad-ping.js`
  now generates a deterministic per-sale `uuid` from `sale_id`, so PostHog collapses Gumroad
  webhook RETRIES into one `purchase` event — future real sales won't fan out into a row per
  retry the way these 5 setup pings did. Manual sale_id dedupe on OLD data is still a good
  habit. For sale #1 the backfill IS the canonical real (is_test=false) purchase; the
  is_test=True rows are setup pings, keep filtering them out.
- `purchase` event carries NO email and NO buyer name (verified via event_properties):
  only sale_id, order_number, product_name, price, currency, seller_id, is_test, refunded,
  geo. So even when the webhook works, the buyer's identity never lands in PostHog from the
  purchase event — email↔visitor must be matched by hand or via ph_did stitching.
- Both test pings used the FALLBACK distinct_id `gumroad:<purchaser_id>`, NOT a ph_did →
  proves the checkout URL did NOT carry `url_params[ph_did]` even on the test. Consistent
  with the code finding below.
- What to check on the Gumroad→PostHog side: (1) is the Gumroad Ping (Settings → Advanced →
  Ping) URL set to `https://fadercraft.com/api/gumroad-ping?token=<GUMROAD_PING_TOKEN>` and
  is the token current; a wrong/missing token → 403, ping silently dropped; (2) confirm it
  fires on real (non-test) sales — sale #1 only ever saw "Send test ping"-style pings because
  the endpoint was being set up at the time. `is_test` itself is reliable: it just mirrors
  Gumroad's `test` field (no code bug), so a real sale WILL land as purchase(is_test=False)
  once a genuine non-test ping comes through. Until then, conversion-to-money is reconciled
  by hand vs Gumroad.

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
