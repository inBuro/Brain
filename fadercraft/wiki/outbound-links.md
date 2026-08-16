---
type: reference
project: Fadercraft
created: 2026-06-12
updated: 2026-08-12
---

# Outbound Links (tracked vanity redirects)

**Summary**: Single retrievable list of all campaign-tracked outbound short links for Fadercraft placements (YouTube descriptions, Reddit posts, etc.). Site-internal links are server-side **302** vanity redirects on Cloudflare Pages that append per-channel UTM. The `*-buy` links (straight to Gumroad checkout) are **bridge pages**, not 302s — see the Buy bridge section. Distinct from [[external-links]] (brand/social/storefront URLs) — this page is the campaign-tracking layer.

**Sources**: `~/Projects/Projects/fadercraft/app/public/_redirects` + `app/public/*-buy.html` (canonical sources of truth — this page mirrors them for quick retrieval).

**Last updated**: 2026-08-12

---

## Rules (do not skip)

- **New channel = new redirect, created BEFORE publishing.** Never publish a placement without its own tracked link.
- **One distinct `utm_source` per channel** (reddit / youtube / discord / …) and **one distinct `utm_campaign` per post/placement**, so each post is separable in PostHog/analytics. The Reddit app strips referrers → entry-page + UTM is the only attribution we get.
- **302, not 301** — so a campaign can be retargeted later without browsers caching the hop forever.
- Source of truth is the `_redirects` file. Edit there → deploy → verify (see bottom). Update this page in the same pass.
- **`*-buy` links are bridge pages, NEVER `_redirects` lines.** A server 302 straight to Gumroad returns no HTML, so PostHog never sees the visit — that gap ran 2026-06-12 → 2026-07-14 (Gumroad saw the traffic, analytics didn't). A `_redirects` rule shadows the static asset, so re-adding a `-buy` line silently kills its tracking again.

## Buy bridge mechanism (since 2026-07-14)

Each `*-buy` short link is a static page `app/public/<slug>.html` (generated from one shared template — keep all six in sync). On load it fires `buy_click` into PostHog via `sendBeacon` (survives navigation → the hop to Gumroad is immediate), then `location.replace()`s to the same checkout URL the old 302 pointed at. Details:

- Event schema matches the app: `{href, label: <slug>, path: /<slug>}` + `utm_*`, with `$lib: "fc-buy-bridge"` to tell bridge clicks from on-site clicks.
- Stamps `ph_did` + `cta=<slug>` on the Gumroad URL, so a sale ties back to the visitor and placement via [[gumroad-ping]] — same as on-site CTAs.
- Owner clicks (localStorage `ph_owner`) are captured as `fadercraft-owner` and excluded by the standard internal-users filter; localhost/preview hosts redirect without reporting.
- Pages are `noindex` (GSC lists them under "Страница с переадресацией"-type noise otherwise).
- Action 285962 "CXL — Buy click" matches on `href contains gumroad.com/l/control-xl`, so bridge clicks count toward the goal automatically.

## YouTube — campaign `control_xl_presentation`

> `/yt` points at the **permanent** `/control-xl` path (not `/`), so when `/` becomes the umbrella brand page the YouTube-description link never needs re-pointing and the video description is never re-edited. `/control-xl` is a real route today (renders the Control XL ProductPage) — see [App.tsx](../../Projects/Projects/fadercraft/app/src/App.tsx). Not in `sitemap.xml` on purpose (temporary dupe of home until the restructure).

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/yt` | `/control-xl` | youtube / video / control_xl_presentation | "site" link in YT description |
| `https://fadercraft.com/yt-modes` | `/free-custom-modes` | youtube / video / control_xl_presentation | free modes link in YT description |
| `https://fadercraft.com/yt-buy` | gumroad `l/control-xl` | youtube / video / control_xl_presentation | buy link in YT description |

## Sends Follower — YouTube demo — campaign `sends_follower_yt`

Sends Follower is a separate M4L device with its own product route `/sends-follower` (real route in [App.tsx](../../Projects/Projects/fadercraft/app/src/App.tsx)). Its `/yt-sf*` links are kept on their own `sends_follower_yt` campaign so they never mix with Control XL's `control_xl_presentation`. No "free modes" analogue — the SF bundle ships two devices + a Quick Start Guide, no free asset. Added 2026-07-07.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/yt-sf` | `/sends-follower` | youtube / video / sends_follower_yt | "site" link in SF YT description |
| `https://fadercraft.com/yt-sf-buy` | gumroad `l/sends-follower` | youtube / video / sends_follower_yt | buy link in SF YT description |

## Dynamic Focus — YouTube demo — campaign `dynamic_focus_yt`

Dynamic Focus is a separate M4L device with its own product route `/dynamic-focus` (real route in [App.tsx](../../Projects/Projects/fadercraft/app/src/App.tsx)). Its `/yt-df*` links are kept on their own `dynamic_focus_yt` campaign, mirroring `sends_follower_yt`. Added 2026-07-23.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/yt-df` | `/dynamic-focus` | youtube / video / dynamic_focus_yt | "site" link in DF YT description |
| `https://fadercraft.com/yt-df-buy` | gumroad `l/aqlsvy` | youtube / video / dynamic_focus_yt | buy link in DF YT description |
| `https://fadercraft.com/yt-df-short` | `/dynamic-focus` | youtube / video / shorts | "site" link in DF YouTube **Shorts** descriptions — separate `shorts` campaign, not `dynamic_focus_yt`, so Shorts traffic doesn't mix with the long-form video. Added 2026-07-29. |

## Reddit — r/Novation post — campaign `introduction_post`

First Reddit post (2026-06-10); the post itself linked `/r-modes`. Keep these on `introduction_post` so they don't mix with later posts. **`/r` was repurposed** into the general `organic` link (see below) — it was never the post's active link.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r-modes` | `/free-custom-modes` | reddit / social / introduction_post | free modes link (this is what the original post linked) |
| `https://fadercraft.com/r-buy` | gumroad `l/control-xl` | reddit / social / introduction_post | buy link |

## Reddit — r/ableton post — campaign `ableton_post`

Second Reddit post (2026-06-11/12). Links go **only in replies**, never in the post body (r/ableton "No selling" rule).

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r-ableton` | home `/` | reddit / social / ableton_post | reply to "is it available / what is it" |
| `https://fadercraft.com/r-ableton-modes` | `/free-custom-modes` | reddit / social / ableton_post | reply about free modes (goodwill / safest, not selling) |

> No `r-ableton-buy` was created on purpose — pushing a buy link in r/ableton risks the No-selling rule. Reveal the product via `/r-ableton` (home) only when asked.

## Reddit — r/abletonlive post — campaign `abletonlive_post`

Dedicated post for **r/abletonlive** (2026-06-16). Sub **Rule 1 = "Don't buy, sell, or beg for anything here"** → value-first only: the post's single body link goes to the genuinely-free modes (sharing free stuff, not selling). No buy link created.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r-abl` | `/free-custom-modes` | reddit / social / abletonlive_post | free modes link — the post's single body link |

> No `r-abl-buy` on purpose — Rule 1 bans selling. **Slug note:** `/r-abl` = r/abletonlive; do not confuse with `/r-ableton` = r/ableton. r/abletonlive is small (~9.2K weekly visitors / ~121 weekly contributions) — low-risk warm placement, not a traffic driver.

## Reddit — general outreach — campaign `organic`

Evergreen link for ad-hoc Reddit replies across threads (not a dedicated post). One link, no per-post variants. Use **value-first** — drop only when contextual or asked, to avoid shadowban.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r` | home `/` | reddit / social / organic | ad-hoc Reddit comment replies (evergreen) — short canonical, repurposed from the old first-post link |

## Telegram — organic — campaign `organic`

Evergreen links for organic Telegram posts (own channel / music-production communities). Telegram's in-app browser strips the referrer, so the entry page + UTM is the only attribution — same as Reddit. Lead value-first (free modes) in communities.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/tg-modes` | `/free-custom-modes` | telegram / social / organic | **primary** — value-first hook (free Launch Control XL modes) for organic posts |
| `https://fadercraft.com/tg` | home `/` | telegram / social / organic | full product story (when leading with the device, not the free modes) |
| `https://fadercraft.com/tg-buy` | gumroad `l/control-xl` | telegram / social / organic | direct buy link |

## Max for Live — maxforlive.com listing — campaign `control_xl_listing`

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/m4l` | home `/` | maxforlive / referral / control_xl_listing | site link in the maxforlive.com listing |
| `https://fadercraft.com/m4l-modes` | `/free-custom-modes` | maxforlive / referral / control_xl_listing | free modes link |
| `https://fadercraft.com/m4l-buy` | gumroad `l/control-xl` | maxforlive / referral / control_xl_listing | buy link |

## Max for Live — Sends Follower listing (device 15727) — campaign `sends_follower_listing`

Closes the gap flagged in analyst's `custom-channel-maxforlive.md`: the SF device-detail page (maxforlive.com/library/device/15727/sends-follower) had NO outbound site link at all — only the YouTube video-presentation link — so its traffic fell through to `referring_domain` fallback with zero UTM. Added 2026-07-19.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/m4l-sf` | `/sends-follower` | maxforlive / referral / sends_follower_listing | site link in the Sends Follower maxforlive.com listing |

> No `/m4l-sf-buy` yet — add one (copy an existing `*-buy.html` bridge page) only once a direct buy link is actually placed in the listing description; until then `/m4l-sf` (site link) is the only outbound link this listing needs.

## Max for Live — Dynamic Focus listing — campaign `dynamic_focus_listing`

Same pattern as `sends_follower_listing`: the maxforlive.com listing links to the **site** page (`/dynamic-focus`), not straight to Gumroad — the site captures the visit and carries its own buy CTA. Added 2026-07-23.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/m4l-df` | `/dynamic-focus` | maxforlive / referral / dynamic_focus_listing | site link in the Dynamic Focus maxforlive.com listing |

> No `/m4l-df-buy` on purpose, same reasoning as Sends Follower — add one only if a direct buy link actually goes in the listing.

## Facebook — Page — campaign `fb_page`

Brand Facebook Page (created 2026-06-24). Low-priority presence channel, not a traffic driver — the Page's Website field + any post links use these. Facebook's in-app browser strips referrers, so entry page + UTM is the only attribution (same as Reddit/Telegram).

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/fb` | home `/` | facebook / social / fb_page | Page "Website" field + general post links |
| `https://fadercraft.com/fb-modes` | `/free-custom-modes` | facebook / social / fb_page | free modes link in posts |
| `https://fadercraft.com/fb-buy` | gumroad `l/control-xl` | facebook / social / fb_page | buy link in posts |
| `https://fadercraft.com/fb-df` | `/dynamic-focus` | facebook / social / fb_page | Dynamic Focus post link on the brand Page. Added 2026-07-30. |

## Facebook — Novation community groups — campaign `novation_group`

For value-first posts/comments in **user-run Launch Control XL FB groups** (not Novation's official Page — promo there is off-limits, see PM note). Distinct `utm_medium=community` separates this from the own-Page traffic (`fb_page`) and from Reddit-Novation (`/r`). Lead value-first (free modes), brand soft. First placement: group "Launch Control XL 3 (Novation)" (public, ~89 members).

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/nov-modes` | `/free-custom-modes` | facebook / community / novation_group | **primary** — value-first giveaway (free 15 LCXL modes) |
| `https://fadercraft.com/nov` | home `/` | facebook / community / novation_group | full product story (only if asked / organic) |

> No `/nov-buy` on purpose — never lead with a buy link in someone else's community. Reveal the paid device softly via `/nov` (home) only when the conversation invites it.

## Facebook — Max for Live community — campaign `m4l_community`

For the Sends Follower post in the **Max for Life** Facebook community (a user-run M4L group, not the maxforlive.com site — hence `utm_source=facebook`, not `maxforlive`). `utm_medium=community` keeps it separate from the own-Page `fb_page` traffic; target is the **`/sends-follower`** product page since the post is about that device. Added 2026-07-11.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/fb-m4l` | `/sends-follower` | facebook / community / m4l_community | the Sends Follower post in the M4L FB community |
| `https://fadercraft.com/fb-abl` | `/sends-follower` | facebook / community / abl_community | Sends Follower post in the Public Ableton FB community |

## Fadercraft ↔ GrooveMix — cross-promo — campaign `cross_promo`

Own-site-to-own-site links, not an external placement — so no `fadercraft.com/<slug>` redirect indirection, UTM is appended directly to the destination URL in each component. Distinct `utm_medium` per placement so they're separable in PostHog:

| Link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://groovemix.app/?utm_source=fadercraft&utm_medium=footer&utm_campaign=cross_promo` | groovemix.app home | fadercraft / footer / cross_promo | GrooveMix link in the site footer "PRODUCTS" column (`FooterFull.tsx`), all pages |
| `https://groovemix.app/?utm_source=fadercraft&utm_medium=nav&utm_campaign=cross_promo` | groovemix.app home | fadercraft / nav / cross_promo | GrooveMix entry in the header product switcher (`links.ts` → `PRODUCTS`), all pages |
| `https://fadercraft.com/?utm_source=groovemix&utm_medium=nav&utm_campaign=cross_promo` | fadercraft.com home | groovemix / nav / cross_promo | "Also building Fadercraft" link in the GrooveMix top-links bar (`site/index.html`), single-page site. Added 2026-08-14. |

## Non-tracked placement links

- **YouTube demo video**: `https://youtu.be/UsJxPBdf568` — carries YouTube's own attribution; clicks from it to the site that go through the YT description use the `/yt*` links (so they attribute to youtube, not the referring post — known limitation).

## Adding / changing a link

1. Site-internal link: edit `~/Projects/Projects/fadercraft/app/public/_redirects` (whitespace-delimited: `/<slug>  <target+utm>  302`). **Buy link (to Gumroad): copy an existing `app/public/*-buy.html`, change only `SLUG`/`TARGET` (and the `noscript`/fallback hrefs) — do NOT add it to `_redirects`.**
2. **Run the deploy from `app/`, not the repo root** — `cd ~/Projects/Projects/fadercraft/app && npm run build && source ~/.config/cloudflare/env && wrangler pages deploy dist --project-name=fadercraft-landing`. Wrangler resolves `functions/` relative to CWD: deploying `app/dist` from the repo root silently ships **without** the Pages Functions (PostHog `/ingest` proxy, www→apex 301, the cache-poisoning guard) — confirmed-broken-then-fixed 2026-06-15. The successful run prints `✨ Compiled Worker successfully` + `Uploading Functions bundle`; if you don't see those, functions were dropped. Then `git add -A && git commit && git push` for history.
3. Verify on prod: `curl -sI "https://fadercraft.com/<slug>"` → expect `302` + correct `location:` with the UTM for redirect links, or `200` + `text/html` for `*-buy` bridge pages (then check the `buy_click` lands in PostHog Activity). Also confirm functions survived: `curl -s -o /dev/null -w '%{content_type}' https://fadercraft.com/ingest/static/array.js` → `application/javascript` (not `text/html`).
4. Mirror the change into this page.

## Related pages

- [[external-links]]
- [[index]]
- [[roadmap]]
