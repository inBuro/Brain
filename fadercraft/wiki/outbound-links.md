---
type: reference
project: Fadercraft
created: 2026-06-12
updated: 2026-06-12
---

# Outbound Links (tracked vanity redirects)

**Summary**: Single retrievable list of all campaign-tracked outbound short links for Fadercraft placements (YouTube descriptions, Reddit posts, etc.). Each is a server-side **302** vanity redirect on Cloudflare Pages that appends per-channel UTM, so placements carry a clean short URL instead of a raw UTM string. Distinct from [[external-links]] (brand/social/storefront URLs) — this page is the campaign-tracking layer.

**Sources**: `~/Projects/Claude/Fadercraft/app/public/_redirects` (canonical source of truth — this page mirrors it for quick retrieval).

**Last updated**: 2026-06-12

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

First Reddit post (2026-06-10). Keep these tagged to this campaign so they don't mix with later Reddit posts.

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r` | home `/` | reddit / social / introduction_post | site link |
| `https://fadercraft.com/r-modes` | `/free-custom-modes` | reddit / social / introduction_post | free modes link (this is what the original post linked) |
| `https://fadercraft.com/r-buy` | gumroad `l/control-xl` | reddit / social / introduction_post | buy link |

## Reddit — r/ableton post — campaign `ableton_post`

Second Reddit post (2026-06-11/12). Links go **only in replies**, never in the post body (r/ableton "No selling" rule).

| Short link | → Target | utm_source / medium / campaign | Use for |
|---|---|---|---|
| `https://fadercraft.com/r-ableton` | home `/` | reddit / social / ableton_post | reply to "is it available / what is it" |
| `https://fadercraft.com/r-ableton-modes` | `/free-custom-modes` | reddit / social / ableton_post | reply about free modes (goodwill / safest, not selling) |

> No `r-ableton-buy` was created on purpose — pushing a buy link in r/ableton risks the No-selling rule. Reveal the product via `/r-ableton` (home) only when asked.

## Non-tracked placement links

- **YouTube demo video**: `https://youtu.be/UsJxPBdf568` — carries YouTube's own attribution; clicks from it to the site that go through the YT description use the `/yt*` links (so they attribute to youtube, not the referring post — known limitation).

## Adding / changing a link

1. Edit `~/Projects/Claude/Fadercraft/app/public/_redirects` (whitespace-delimited: `/<slug>  <target+utm>  302`).
2. From `~/Projects/Claude/Fadercraft`: `git add -A && git commit && git push`, then `cd app && npm run build`, then `source ~/.config/cloudflare/env && wrangler pages deploy app/dist --project-name=fadercraft-landing`.
3. Verify on prod: `curl -sI "https://fadercraft.com/<slug>"` → expect `302` + correct `location:` with the UTM.
4. Mirror the change into this page.

## Related pages

- [[external-links]]
- [[index]]
- [[roadmap]]
