# Content assets for comment/thread replies (SEO "closers")

Registry of owned content pieces (guides/articles on `fadercraft.com`) that we
can point people to when replying to YouTube comments, Reddit posts, or Ableton
forum threads. The point: instead of a throwaway reply, we drop a link to a real
article that (a) answers the person and (b) ranks on our own domain and funnels
to the product.

**Standing directive — read this when analysing comments/threads.**
When you finish a comment or thread analysis pass (esp. the YouTube-comments
n8n pipeline we're standing up as of 2026-07-03), do NOT just report findings.
Proactively surface the relevant asset below and offer the owner one of:
- **give a link** to it (if published) as the reply/closer,
- **publish** it (if still planned/draft),
- **edit** it to better fit a comment cluster you found,
- **create a similar** article for a new recurring question/pain you spotted.
Many comments can be "closed" by an existing or near-existing article — flag that
match explicitly rather than leaving it to the owner to notice.

Routing: article copy → main agent calls the **copywriter** (draft). Site route
→ **main agent** builds a `/guide/...` route (same per-route SEO mechanism as
`/free-custom-modes`, via `app/scripts/seo-meta.mjs`). This registry = PM-owned;
analyst reads it. Keep status/URLs current here as assets ship.

---

## Asset #1 — JTBD guide: LCXL MK3 mappings across every Live Set

- **Status:** PUBLISHED (2026-07-03) — live on prod, in sitemap, indexable. Copy
  may still get light refinement, but the URL is stable — **safe to share now** as
  a reply link. Technical claims were fact-checked against Ableton/Novation docs.
- **Canonical URL (live):** `https://fadercraft.com/guide/launch-control-xl-mk3-across-live-sets`
- **Working title:** "How to use Launch Control XL MK3 across all your Ableton Live Sets".
- **JTBD / angle:** native Ableton MIDI mappings don't carry between Live Sets.
  Control XL stores mappings inside a Max for Live device → map once, works in
  every project; the fixed layout builds muscle memory you can trust live. This
  is the single pain the product solves best.
- **Target keywords (P1, from the 2026-07-03 SEO map):** `midi mapping persistence
  ableton`, `ableton controller across live sets`, `launch control xl mapping`,
  `ableton controller template`. Top-funnel problem→solution; the searcher doesn't
  know the brand yet, they google the pain.
- **Why it exists:** owned SEO asset (weight accrues to our domain, not Medium),
  and a reusable "closer" for comment/thread replies about mapping persistence.
- **Distribution once live:** Publish canonical on our domain ONLY; any
  Medium/dev.to repost must carry `rel=canonical` back to us.
  **Platform rules (2026-07-03 strategic read):**
  - r/Novation, maxforlive, YouTube comments/description, Ableton forum — link
    directly with a short human preamble ("wrote about this in more detail if
    curious"); these surfaces accept help-first links.
  - r/ableton / r/abletonlive — NEVER drop the URL as a standalone reply. Give a
    plain-noun concrete answer first (TrieMond formula from voice-guide); offer
    the link only if the thread is warm. Raw link = "posting an ad" penalty.
  - Cluster note: "template vs M4L" threads = direct fit for the link. "Newcomer
    overwhelmed by MIDI" threads = start with a simplified plain-answer, then
    link — don't rely on the article to do the simplification work for them.

---

## Context this came from (2026-07-03)
Analyst SEO pass found organic search ≈ 0 (3 search visits lifetime, 1.6%) —
we're starting from scratch, niche is nearly empty (no MK3-specific M4L content;
Novation owns hardware FAQ, Isotonik covers MK1/MK2 and is stale). Shipped same
day: product-page title/meta reworked for P0 keywords ("Launch Control XL MK3",
"custom modes", "Max for Live"), Product/FAQ schema already present, maxforlive
listing description reworked with keyword-forward opener + tracked `/m4l` link.
This JTBD guide is the top-funnel follow-up to capture the pain-search traffic.
