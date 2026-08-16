# Google Search Console — API access (real Google search data)

We now have **programmatic GSC access** for `fadercraft.com` — the only source of
real Google **search queries, impressions, positions, CTR**, plus **index status**.
PostHog cannot see any of this (Google encrypts the keyword). Use this to answer
"what are we actually ranking for / getting impressions on", and to check whether
a specific page is indexed.

## Where reports live
- **Latest report:** `~/.config/google/gsc-reports/latest.md` (launchd monitor writes here every 2 days)
- **Dated archives:** `~/.config/google/gsc-reports/YYYY-MM-DD.md`
- NOT `~/Brain/gsc-reports/` — that directory does not exist

## How to run (main agent has the key; ask it, or if you have Bash + key access)
Helper script, no deps (mints RS256 JWT via openssl):
```
bash ~/.config/google/gsc.sh sites                     # confirm access
bash ~/.config/google/gsc.sh query 2026-04-04 2026-07-03 query   # top queries
bash ~/.config/google/gsc.sh query 2026-04-04 2026-07-03 page    # top pages
bash ~/.config/google/gsc.sh query 2026-04-04 2026-07-03 date    # daily totals
bash ~/.config/google/gsc.sh inspect https://fadercraft.com/…    # index status of a URL
```
Property is a Domain property → `sc-domain:fadercraft.com`. Key lives under
`~/.config/google/` (reading it needs sandbox disabled). Data lags ~2–3 days.

## Baseline (2026-07-03, first pull)
Near-zero organic presence — matches the PostHog read exactly. ~8 lifetime
impressions, **0 clicks**, positions **54–69** (page 6–7). Surfaced queries:
`crafting controller`, `fadermaster`, `lcxl` — 1 impression each. We are starting
from scratch; this is the pre-SEO-work baseline to measure the title/meta rework
and the new JTBD guide against over the coming weeks.

## Update 2026-07-07 (90-day pull for homepage metadata brief)
Homepage page-level totals over 90d are actually 24 impressions / 2 clicks / avg position 17.8 —
better than the 07-03 snapshot suggested. But query-level breakdown only shows 4 rows (0 clicks,
positions 54-72, all off-target). The gap is GSC's **anonymized-query suppression**: date-dimension
data shows ~11 days at position 1-3 that don't map to any visible query — almost certainly brand
("fadercraft") exact-match searches that Google hides individually for low volume but still counts
in page/date aggregates. Filtering query `contains "fadercraft"` site-wide returns 0 visible rows
even though the pattern strongly implies brand searches are landing at #1-3. Full detail + keyword
verdict in [[homepage-seo-gsc-2026-07-07.md]].

## Update 2026-07-10 — guide "noindex" was a stale HTTP-header verdict (RESOLVED at source)
Monitor's 3/5 report flagged `/guide/…mk3-across-live-sets` as 🔴 "Excluded by 'noindex' tag".
Root cause via `inspect`: `indexingState: BLOCKED_BY_HTTP_HEADER` (last crawl 2026-07-04) — it was
an **`X-Robots-Tag: noindex` HTTP header**, NOT a meta tag. Verified live 07-10: header is GONE
under both normal UA and Googlebot, and `grep -rniE 'x-robots|noindex'` over the site repo returns
0 hits. Fix is already on prod; GSC just hadn't recrawled since the header was live. So the 🔴
verdict is **stale, not an open bug** — expect it to flip to "Submitted and indexed" after recrawl.
Owner ran manual **Request Indexing** for both `/guide/…` and `/free-custom-modes` on 2026-07-10.
`/free-custom-modes` had never been crawled (`lastCrawlTime: null`) — Discovered-only, now queued.
→ At next monitor run, if guide still 🔴, re-`inspect` to confirm it's just recrawl lag, don't re-alarm.

## Update 2026-07-17 — WoW comparison + new query signals

**Week Jul 10–16 vs Jul 3–9 (API pull, Jul 17):**

| Метрика | Jul 3–9 | Jul 10–16 | Δ |
|---------|---------|-----------|---|
| Clicks | 1 | 1 | flat |
| Impressions | 19 | 19 | flat |
| Avg CTR | 5.3% | 5.3% | flat |

**Top queries Jul 10–16:**
- "control xl" — 1 click / 6 imp / pos 48.7 (NEW — впервые видно как запрос)
- "ableton fader" — 0 / 1 / pos 27 (NEW)
- "faderplay" — 0 / 1 / pos 51

**Top pages Jul 10–16:**
- /control-xl — 1 click / 8 imp / pos 41.1 (FIRST GSC click для этой страницы)
- / — 0 / 7 imp / pos 18.3
- /sends-follower — 0 / 6 imp / pos 16.0 (новичок в выдаче, position хорошая)
- /legal — 0 / 1 / pos 17

**Indexing (07-16 monitor):**
- / ✅, /control-xl ✅, /sends-follower ✅ — indexed
- /free-custom-modes ⏳ Discovered (RI sent 07-10, не проиндексирован до сих пор — 7 дней, уже долго)
- /guide/...mk3 🔴 "Excluded by noindex" (STALE crawl 07-04, header verified gone, RI sent 07-10)
- /updates — нет RI вообще, owner должен подать вручную

## Update 2026-07-18 — full API inspection sweep (7 pages, 5 indexed, 2 pending)

**Indexed (5/7):** /, /control-xl, /sends-follower, /legal, /updates
**Not indexed (2/7):** /free-custom-modes (Discovered, never crawled), /guide (noindex stale)

**VideoObject warnings — RESOLVED as of 2026-07-24:**
- Memory (07-18) had both pages showing richResultsResult WARNINGs ("Invalid datetime value for uploadDate" / "Datetime property uploadDate is missing a timezone").
- Fix deployed to prod 2026-07-24 (uploadDate with explicit TZ: control-xl `2026-06-09T21:43:51-07:00`, sends-follower `2026-07-07T01:08:35-07:00`); confirmed live via curl.
- API inspect run 2026-07-24 shows **PASS, no warnings** for both pages (last crawls: /control-xl 07-22, /sends-follower 07-19). Either an intermediate crawl already caught a prior partial fix, OR GSC URL Inspection API does not serialize advisory-level warnings (the "missing timezone" note may only appear in the full Rich Results UI report, not in the API verdict).
- Request Indexing submitted by owner via GSC UI on 2026-07-24 to ensure Google picks up the new fix.
- **GSC UI deep-links (from API inspectionResultLink):**
  - /control-xl: `https://search.google.com/search-console/inspect?resource_id=sc-domain:fadercraft.com&id=287zf08OIWV-mFUQRa4iVw&utm_medium=link&utm_source=api`
  - /sends-follower: `https://search.google.com/search-console/inspect?resource_id=sc-domain:fadercraft.com&id=RD1Y8vvccJktsESyEPuN1w&utm_medium=link&utm_source=api`
Homepage has no VideoObject in response (no richResultsResult block returned).

**Guide page: STILL stale July 4 crawl (14 days stale, RI submitted 07-10 = 8 days pending)**
`indexingState: "BLOCKED_BY_HTTP_HEADER"` unchanged. The URL Inspection API returns ONLY the CACHED indexed state — there is NO "live test" mode via the public API (GSC UI "Test Live URL" is UI-only). So we CANNOT confirm live state via API; must trust the manual curl verification.
8-day RI without recrawl is unusually slow → **owner should re-submit Request Indexing manually in GSC UI** (the original RI may have expired or been deprioritized due to low crawl budget).

**`/updates` surprise: INDEXED** — last crawl 2026-07-13. Memory had it as "no RI, never crawled" but Google discovered and indexed it organically. No action needed.

**`/free-custom-modes`**: Still "Discovered, not indexed", never crawled. RI sent 07-10 = 8 days pending. Same slow queue as guide.

**No other open structured data types:** /legal, /updates, / have no structured data markup. /free-custom-modes and /guide are not crawled so can't check.

## Update 2026-07-13 — full sitemap audit (7 pages, 4 indexed, 3 pending)

Page-by-page status as of today:

| URL | Status | Last crawl |
|-----|--------|------------|
| `/` | PASS — Submitted and indexed | 2026-07-07 |
| `/control-xl` | PASS — Submitted and indexed | 2026-07-07 |
| `/sends-follower` | PASS — Submitted and indexed | 2026-07-07 |
| `/legal` | PASS — Submitted and indexed | 2026-07-06 |
| `/guide/…mk3-across-live-sets` | NEUTRAL — Excluded by 'noindex' (stale) | 2026-07-04 (pre-fix) |
| `/free-custom-modes` | NEUTRAL — Discovered, not indexed | never crawled |
| `/updates` | NEUTRAL — Discovered, not indexed | never crawled |

Guide status is still stale from the pre-fix 07-04 crawl. Header is verified gone (curl 07-13: no X-Robots-Tag).
RI was submitted 07-10 for guide + free-custom-modes. **No RI ever submitted for `/updates`** — owner needs to do that manually.

90-day performance (2026-04-14 → 2026-07-13):
- `/` : 3 clicks / 32 impressions / CTR 9.4% / avg pos 21.6
- `/control-xl` : 0 clicks / 8 impressions / avg pos **6.5** (mid-first-page — notable)
- `/sends-follower` : 0 clicks / 5 impressions / avg pos 17.2
- `/legal` : 0 clicks / 2 impressions / avg pos 3.5

Notable: `/control-xl` averaging position 6.5 despite only 8 impressions over 90d — page 1 for some rare query, 0 CTR.

## Update 2026-07-24 — full diagnostic sweep (guide pages + FAQ link audit)

**All-pages status as of 2026-07-24 (GSC inspect API):**

| URL | Status | Last crawl |
|-----|--------|------------|
| `/` | PASS — Indexed | — |
| `/control-xl` | PASS — Indexed | 2026-07-22 |
| `/sends-follower` | PASS — Indexed | 2026-07-19 |
| `/legal` | PASS — Indexed | — |
| `/updates` | PASS — Indexed | 2026-07-13 |
| `/dynamic-focus` | **PASS — Indexed** | **2026-07-20** (NEW confirm) |
| `/guide/…mk3-across-live-sets` | BLOCKED_BY_HTTP_HEADER (stale 07-04) | 2026-07-04 |
| `/guide/…pickup-mode` | Discovered, not indexed | never crawled |
| `/free-custom-modes` | Discovered, not indexed | never crawled |

**Key facts:**
- `/dynamic-focus` is NOW confirmed indexed (last crawl 07-20, verdict PASS). Was not in prior sweep.
- Guide 1 (`…mk3`): still stale verdict from 07-04 (BLOCKED_BY_HTTP_HEADER). Live curl today = 200, no x-robots-tag. RI from 07-10 has not triggered recrawl in 20 days — owner should re-submit RI again.
- Guide 2 (`…pickup-mode`): discovered via sitemap (lastmod 07-20), never crawled, no referringUrls in response (page not yet fetched). RI status unclear — may not have been submitted.
- `/free-custom-modes`: same "Discovered, never crawled" as 07-20 check; RI re-submitted 07-20 by owner. Still pending.

**Guide link architecture (code-verified 2026-07-24):**
- Guide 1 linked from `/control-xl` FAQ: `<a href="/guide/launch-control-xl-mk3-across-live-sets">` — standard href, relative URL, in pre-rendered HTML (answerWrap has `grid-template-rows:0fr` collapsed = CSS-visible in DOM, not display:none). Container has `inert={!isOpen}` (React attr).
- Guide 2 linked from `/dynamic-focus` FAQ: `<a href="https://fadercraft.com/guide/ableton-controller-knob-jump-pickup-mode">` — absolute URL, same collapse/inert pattern.
- Both `/control-xl` and `/dynamic-focus` are INDEXED — so FAQ links on them exist on crawled pages.
- GSC referringUrls for guide 1 = only `sitemap.xml` (NOT `/control-xl`), suggesting Google has not yet credited the internal FAQ link as a discovery path.
- Pre-render script (`scripts/prerender.mjs`) includes BOTH guide pages in ROUTES — pre-rendered static HTML ships with FAQ content, links exist in HTML even when collapsed.

**Why FAQ "hidden link" hypothesis is NOT the primary cause:**
1. Both guide pages are in `sitemap.xml` — Google discovered them via sitemap, not via FAQ links.
2. CSS collapse = `grid-template-rows: 0fr`, NOT `display:none` — links exist in pre-rendered HTML source.
3. `inert` attribute is on the collapsed container, but inert elements ARE in the DOM; Google should still see `<a href>` (though `inert` may reduce link weight/priority).
4. The real blocker is crawl budget — new low-authority site; RI submitted 20 days ago for guide 1 with no recrawl.

**robots.txt:** `Allow: /` — all paths allowed. No blockers there.
**`_headers`:** only cache rules for `/static/*` and `/fonts/*`. No noindex anywhere.
**`_middleware.js`:** only www→apex redirect + asset cache-poisoning guard. No noindex logic.

## Update 2026-07-26 — guide 2 indexed; kit-link hypothesis check

**Guide 2 (`/guide/ableton-controller-knob-jump-pickup-mode`) — NOW INDEXED:**
- `verdict: PASS`, `Submitted and indexed`, `lastCrawlTime: 2026-07-24T03:44:44Z`
- `referringUrls`: `["https://fadercraft.com/guide/ableton-controller-knob-jump-pickup-mode?from=%2Fdynamic-focus%23faq"]`
  → Google discovered guide 2 by following the FAQ link on `/dynamic-focus` (the `?from` param is embedded in the href). Not via sitemap this time — via an actual internal link crawl.
- GSC monitor (07-23 17:23 ICT): status was still "URL is unknown to Google" → "Discovered, not indexed" (marked as a change in that run). Indexed between then and 03:44 UTC on 07-24.

**Guide 1 (`/guide/…mk3-across-live-sets`) — UNCHANGED:**
- Still BLOCKED_BY_HTTP_HEADER, `lastCrawlTime: 2026-07-04T18:00:32Z` (unchanged from 07-04)
- `referringUrls`: still only `["https://fadercraft.com/sitemap.xml"]` — no /control-xl link credited yet

**Kit-section link hypothesis — REFUTED:**
- Commit `4f66cf1` adding the `/control-xl#kit` link to guide 1 landed 2026-07-24 11:47:19 +0700 = 04:47 UTC
- Guide 2's crawl happened at 03:44 UTC — 1h03m BEFORE the commit; kit-link didn't exist yet
- Guide 2 is not what the kit-link points to anyway (kit-link → guide 1, /dynamic-focus FAQ → guide 2)
- Verdict: guide 2's indexing was triggered by the OLD /dynamic-focus FAQ link, not the new kit-section link

**Performance data Jul 16–25 (date dimension):**
- Days 07-16 to 07-23 visible; 07-24/25 not yet in API (2-3d lag)
- Site-wide: flat trend, 5–10 imp/day, position 2–10 (brand queries dominate)
- Guide pages: 0 impressions in this period (guide 2 just indexed, no ranking signal yet)

**Page-level Jul 16–25 (top by impressions):**
- /updates: 43 imp / 1 click / pos 3.1 — STRONGEST non-home page
- /: 49 imp / 0 clicks / pos 2.6
- /control-xl: 38 imp / 0 clicks / pos 12.0
- /sends-follower: 21 imp / 0 clicks / pos 9.6
- /dynamic-focus: 11 imp / 0 clicks / pos 8.7
- No guide pages appear in performance data at all

**Queries Jul 16–25:** "fadercraft" 20 imp pos 1 (brand, anonymized); "control xl" 8 imp pos 21; "farecraft" typo 1 imp — no guide-related queries visible yet.

## Update 2026-07-20 — "Discovered not indexed" issue-view lags real per-URL state
GSC UI's Пages > "Discovered, not indexed" drilldown (issue detected 2026-06-13) still listed
**both** `/free-custom-modes` and `/updates` as affected (2 pages) as of today. Live `inspect`
via API shows this is stale for `/updates`: `verdict: PASS`, `Submitted and indexed`, last crawl
2026-07-13 — matches the 07-18 memory entry, confirms it's genuinely indexed, no regression. The
aggregate issue-view just hasn't reconciled that one URL's fixed state yet — **don't trust the
Pages-issue drilldown list alone; always re-`inspect` the specific URLs before acting on it.**
`/free-custom-modes` is the one real problem: still `Discovered - currently not indexed`, never
crawled (no `lastCrawlTime` in response at all), RI from 07-10 now **10 days pending, no crawl**.
Owner re-submitted Request Indexing 2026-07-20 via UI. Watch next monitor run for a crawl.

## Caveats
- "Request Indexing" has NO public API for normal pages → stays a manual GSC action by the owner. Google Indexing API (separate from URL Inspection) covers only JobPosting and BroadcastEvent/LiveStream — NOT regular VideoObject on product pages.
- URL Inspection needs the full `webmasters` scope + owner (helper handles via `inspect`).
- A "noindex" coverageState can be a META tag OR an `X-Robots-Tag` HTTP header — check
  `indexingState` (`BLOCKED_BY_HTTP_HEADER`) and compare `lastCrawlTime` vs the fix date before
  treating it as a live site bug; it's often just a stale pre-fix crawl awaiting recrawl.
