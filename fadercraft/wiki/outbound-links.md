---
type: reference
project: Fadercraft
created: 2026-06-12
updated: 2026-06-16
---

# Outbound Links (tracked vanity redirects)

**Summary**: Single retrievable list of all campaign-tracked outbound short links for Fadercraft placements (YouTube descriptions, Reddit posts, etc.). Each is a server-side **302** vanity redirect on Cloudflare Pages that appends per-channel UTM, so placements carry a clean short URL instead of a raw UTM string. Distinct from [[external-links]] (brand/social/storefront URLs) — this page is the campaign-tracking layer.

**Sources**: `~/Projects/Claude/Fadercraft/app/public/_redirects` (canonical source of truth — this page mirrors it for quick retrieval).

**Last updated**: 2026-06-15

---

## Rules (do not skip)

- **New channel = new redirect, created BEFORE publishing.** Never publish a placement without its own tracked link.
- **One distinct `utm_source` per channel** (reddit / youtube / discord / …) and **one distinct `utm_campaign` per post/placement**, so each post is separable in PostHog/analytics. The Reddit app strips referrers → entry-page + UTM is the only attribution we get.
- **302, not 301** — so a campaign can be retargeted later without browsers caching the hop forever.
- Source of truth is the `_redirects` file. Edit there → deploy → verify (see bottom). Update this page in the same pass.

## YouTube — campaign `control_xl_presentation`

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/yt` | home `/` | youtube / video / control_xl_presentation | "site" link in YT description |
| `https://fadercraft.com/yt-modes` | `/free-custom-modes` | youtube / video / control_xl_presentation | free modes link in YT description |
| `https://fadercraft.com/yt-buy` | gumroad `l/control-xl` | youtube / video / control_xl_presentation | buy link in YT description |

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

## Non-tracked placement links

- **YouTube demo video**: `https://youtu.be/UsJxPBdf568` — carries YouTube's own attribution; clicks from it to the site that go through the YT description use the `/yt*` links (so they attribute to youtube, not the referring post — known limitation).

## Adding / changing a link

1. Edit `~/Projects/Claude/Fadercraft/app/public/_redirects` (whitespace-delimited: `/<slug>  <target+utm>  302`).
2. **Run the deploy from `app/`, not the repo root** — `cd ~/Projects/Claude/Fadercraft/app && npm run build && source ~/.config/cloudflare/env && wrangler pages deploy dist --project-name=fadercraft-landing`. Wrangler resolves `functions/` relative to CWD: deploying `app/dist` from the repo root silently ships **without** the Pages Functions (PostHog `/ingest` proxy, www→apex 301, the cache-poisoning guard) — confirmed-broken-then-fixed 2026-06-15. The successful run prints `✨ Compiled Worker successfully` + `Uploading Functions bundle`; if you don't see those, functions were dropped. Then `git add -A && git commit && git push` for history.
3. Verify on prod: `curl -sI "https://fadercraft.com/<slug>"` → expect `302` + correct `location:` with the UTM. Also confirm functions survived: `curl -s -o /dev/null -w '%{content_type}' https://fadercraft.com/ingest/static/array.js` → `application/javascript` (not `text/html`).
4. Mirror the change into this page.

## Related pages

- [[external-links]]
- [[index]]
- [[roadmap]]
