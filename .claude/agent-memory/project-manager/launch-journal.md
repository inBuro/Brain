# Launch journal

Newest entries at the top. Format: What / Numbers / Qualitative / Read / Decision.

## 2026-06-11 — Hero A/B experiment LAUNCHED: `hero-permanent-interface` (PostHog 376381)
**What:** First live application of insight #1 (permanent interface). PostHog experiment **id 376381** (https://us.posthog.com/project/458316/experiments/376381), **running since 12:46 ICT 2026-06-11** on the home page. Control = current feature-led hero. Test = eyebrow "M4L INTERFACE FOR LCXL MK3" / H1 "One controller. Your permanent interface." / sub "Map once — the same layout from studio to stage, in every Live Set." Primary metric: **buy_click**.

**Numbers:** none — just launched; exposure events expected with the first real visitor.

**Read:** At current traffic, significance will take **months** (recorded in the experiment description itself). This is a "set and accumulate" experiment, not a fast read — the anti-impulse rule applies to experiment peeking too: no reads in the first weeks, no early stopping on noise. This closes the open item from the bridge entry below ("verify `hero-permanent-interface` flag status with analyst") — the experiment is confirmed live.

**Tech note (QA hygiene):** PostHog serves empty feature flags to headless browsers (bot UA) — so our own headless QA visits do NOT pollute the experiment arms. Exposure events will start flowing with the first live visitor; analyst to confirm at the next cut.

**Decision:** (a) leave it running untouched — no peeking, no variant edits mid-flight (an edit invalidates accumulated exposures); (b) every home-page metric read in this window MUST segment by experiment variant — the bridge CTA also routes to home, so bridge and hero reads share traffic; (c) at the next analyst cut: confirm exposure events are flowing and arms are balanced; (d) the real lever for experiment velocity is traffic volume — next r/ableton post feeds this experiment too.

## 2026-06-11 — Fix #1 SHIPPED: "free modes → Control XL" bridge on /free-custom-modes (quiet variant)
**What:** The top-priority fix from the 2026-06-11 checkpoint — the bridge from the free-modes page to the paid product — implemented and deployed to prod (fadercraft.com), daytime ICT 2026-06-11. Smoke passed: pages 200, console clean, `/r-modes` and `/yt-*` redirects live.

**Implementation facts (baseline for future comparison):**
- Final card on `/free-custom-modes`, last block before the footer: eyebrow "MORE POWER", H2 "Wake Up Your Launch Control", body "Control XL is the Max for Live device that connects all 15 custom modes, adding mixer access, pages, banks and instant switching so your controller layout stays consistent across every Live Set." CTA — orange "See how it works →" → **home page** (NOT Gumroad).
- Page structure now: Hero+mixer → Download → Import → Free pack includes → bridge card → footer.
- Side cleanups in the same deploy: nav-channel lightened on mobile, unequal Navigation knobs in the big mixer fixed, mobile footer reworked, NBSP typography.

**Deviation from PM recommendation — deliberate "quiet bridge" hypothesis (user's call):**
The checkpoint recommendation was "product + price visible on the page + return anchor for mobile". The shipped version intentionally drops all of that: no price, no direct Gumroad CTA, newsletter anchor for mobile removed, License block removed, "Explore Control XL" button removed from the download group. Copy went through copywriter iterations ("wake up" angle, idea-first held in the H2). The bet: a single idea-first card routing to the product story (home) converts cold freebie traffic better than a hard offer+price on a free page. Recorded as a hypothesis, not a settled disagreement — the original "product+price on page" variant remains the obvious B-arm if the quiet bridge underperforms.

**Also shipped in this deploy (not PM's work — flag for tracking):** `ProductPage.tsx` now carries A/B experiment code `hero-permanent-interface` (PostHog feature flag): control = current hero, test = "One controller. Your permanent interface." built on the permanent-interface insight (#1). Analyst/user work; flag status in PostHog unknown to PM — **verify with analyst** before reading any hero metrics for this window.

**Numbers:** none yet — deployed today; pre-fix baseline = 10/13 Reddit entries stuck at 1 pageview, 0 buy_click (see checkpoint entry below).
**Read:** Fix #1 is closed as shipped, not as validated. Success metric for the bridge: share of `/free-custom-modes` entries that reach a second pageview (home/product), vs the 3/13 baseline. The hero A/B overlapping the same window means home-page metric reads must segment by experiment variant — coordinate with analyst.
**Decision:** (a) journal + roadmap closed for fix #1; (b) measure bridge click-through at the parked-tab re-check ~2026-06-17 and at the next post wave — compare second-pageview rate against the 3/13 baseline; (c) ask analyst to confirm `hero-permanent-interface` flag status and that bridge clicks are distinguishable (event or URL) — if the orange CTA click isn't captured as an event, request one before the next traffic wave; (d) no further changes to /free-custom-modes until bridge data arrives (anti-impulse rule).

**Day-close update (2026-06-11 evening):**
- Prod deploy landed **~14:00–15:00 ICT**. Copy went through ~10 iterations with the copywriter agent; the final wording is the user's own.
- **Cycle hypothesis pinned:** "quiet bridge without price" vs the recommended "product + price on page". Verification metrics: (1) clicks on the bridge CTA — captured via PostHog **autocapture** on the orange CTA (closes decision item (c), no custom event needed); (2) the `/free-custom-modes` → `/` path in sessions (second-pageview rate vs the 3/13 baseline).
- Removals confirmed on prod: License block gone entirely, "Explore" button gone from the download group, newsletter section gone from the page — the bridge card is the page's single next step.
- Decision item (c) other half also closed: `hero-permanent-interface` is confirmed RUNNING (PostHog experiment 376381, see the entry above).

## 2026-06-11 — Checkpoint: first Reddit post — site-analytics window
**What:** Planned 24 h checkpoint on the first Reddit post (r/Novation, 2026-06-10). Analyst agent processed site traffic for the post window 2026-06-10 00:00 → 2026-06-11 ~10:15 ICT (PostHog + 27 session recordings). Fresh Reddit snapshot added same morning (~10:00–11:00 ICT, post showing "15 hr. ago"). YT re-snapshot landed in the evening (23 h 22 min after publish) — **checkpoint fully closed 2026-06-11**.

**Numbers (site, post window, analyst cut 2026-06-11 ~10:15 ICT):**
- Raw: 45 pageviews, 37 "sessions". After cleaning owner leakage (user's phone without `ph_owner` flag, ~11 TH sessions) and scraper bots (3 link-preview pairs): **~20–24 real external sessions**.
- ~~811 Reddit post views → ~20–24 sessions ≈ 2.5–3% CTR~~ — recomputed same day against the 15 h Reddit cut (2.8K views, same window as the session count): **≈0.7–0.9% sessions-per-view**. The earlier figure used a stale view count; see Read.
- Timing: post live ~19:00 ICT 06-10; peak in first 3 h (19:00 and 21:00 buckets), trickle until ~05:18.
- Attribution: Reddit app strips referrer → almost everything "direct". Entry-page attribution: post linked `/free-custom-modes` → **13 entries there = Reddit**. UTM tags only from 00:53 06-11 (`utm_campaign=introduction_post`, 5 visitors). YouTube traffic indistinguishable from direct (no `utm_source=youtube`).
- Geography (ex-TH): US core, NL 3, DE 2, GB 2, BE/FR/GE/IE 1 each. US+UK hypothesis half-confirmed — UK weaker than Reddit views suggested, Benelux/DE notable.
- Conversion events: buy_click **0**, social_click 0, newsletter_signup 0, mode_download 2 (1 real — BE desktop), video_play **1**, purchase 0 real (2 events = Gumroad test pings `is_test=True`; Gumroad→PostHog pipeline confirmed working).

**Numbers (Reddit Post Insights, snapshot ~10:00–11:00 ICT 2026-06-11, post showing "15 hr. ago" ≈ 15 h after posting):**
- **2.8K views** (+42 over the last reporting period — tail still smoldering but fading)
- 8 upvotes, upvote ratio **100%** (still zero downvotes); 9 comments
- Badges: "#1 post of all time" + "**#1 post on r/Novation today**" (was #2)
- Top countries by views: US 35.3%, UK 9.8%, DE 6.1%, Other 48.9% (Thailand/owner share diluted out of the top list)
- Hourly graph: steady 10–30 views/h through the night, fading toward the morning of 06-11
- Corrected snapshot timeline: 518 (~1.5 h) → 811 (~2 h) → 2,800 (~15 h) ⇒ **~71% of all views arrived AFTER the 2 h cut**
- views:upvotes ≈ **350:1** — view growth came from feed impressions, not vote-driven ranking

**Numbers (YouTube Studio, snapshot 23 h 22 min after publish, 2026-06-11):**
- Video "Fadercraft Control XL presentation": **35 views** (was 25 @ 9 h → +10 in the tail)
- Avg view duration **0:57** (was 0:46 @ 9 h) → on 1:37 (97 s) ≈ **59% avg retention** (was ≈47%)
- Likes 1 (first like appeared); comments still 1 = owner's pinned comment only; impressions CTR still **0%** (all traffic external, nothing from YT recommendations)
- Channel: 1 subscriber. "Top content, last 48 h" panel shows **44 views** for this video vs 35 on the video page — different counter/window; both figures recorded as observed, no explanation invented
- Weighted tail math (handle with care, n=10 + YT rounding): 25×46 s ≈ 1150 s → 35×57 s ≈ 1995 s ⇒ the ~10 late views averaged ~84 s ≈ **~87% of the video** — late/tail viewers watched dramatically longer than launch-hour viewers

**Qualitative (patterns from 27 session recordings):**
- A. "Landed on /free-custom-modes and froze": 10 of 13 entries stayed at 1 pageview; long passive sessions (300–400 s, 90%+ inactive) — tab parked from Reddit.
- B. Rare "explorers" go deeper and are ALL desktop: BE user downloaded the modes zip; best session (US desktop Edge) — 260 s, 28 clicks, the only video_play, left without buy_click.
- C. Mobile (more than half of 06-10 traffic) downloads nothing — `.syx`/`.zip` useless on a phone.
- D. One session: 17 clicks in 41 s with zero target events — possible dead-clicks.

**Read (PM):** The funnel worked up to the door — but the post pointed at the wrong door. The post promised free modes, the link delivered free modes, and 10/13 Reddit visitors never saw the product page or a price. That is a routing hole, not an offer verdict: 0 buy_click on ~20 cold sessions is statistical noise (analyst threshold for offer conclusions: ~100+ real sessions — concur). Second structural finding: Reddit traffic is mobile-majority, but every meaningful action observed (zip download, deep exploration, video play) was desktop — the channel's context and the product's action surface don't overlap on mobile; "parked tab" pattern A is the mobile-user's version of "save for later" with no return anchor. CTR 2.5–3% and US-core geography are healthy; acquisition is fine, the leak is on-site routing + mobile next-step. Video signal (1 play / ~20 sessions) is weak but unverified — could be below the fold; needs replay confirmation before touching layout. Distilled to insights #7–#9.

**Read addendum (PM, after the 15 h Reddit cut):**
- **CTR recalibrated, not deteriorated.** Same numerator (~20–24 sessions), corrected denominator (2.8K, not 811): **≈0.7–0.9% sessions-per-view**, not the 2.5–3% logged earlier — that figure compared a near-final session count against a 2 h view count. The unit matters: a Reddit "view" counts feed impressions (scroll-past), not post reads, so it's a cheap unit and ~1% of views → site sessions is the realistic planning number for future posts. Nothing about the funnel got worse overnight; we just measured the denominator properly.
- **Tail calibration was badly off.** Real tail of a small-sub post ≈ **70%+ of views after the first 2 h**, delivered steadily through the night with zero support. Any reach judgment before the ~24 h mark is not "early" — it's meaningless. Supersedes the "~30% in the tail" rule of thumb (insight #3 updated).
- **"#1 post on r/Novation today" at 8 upvotes = the sub's ceiling, and upvotes are not the reach lever.** Views grew 3.5× overnight while upvotes went 4→8 (≈350 views per upvote). Reach in a small sub is feed-impression-driven; topping the sub costs single-digit upvotes and buys little by itself. Channel growth still = more posts / more subs.
- Still zero downvotes at 2.8K views — strengthens insight #6 (idea-first product post passes etiquette).

**Decision (prioritized; honors no-impulse-landing-changes + deploy-only-on-command rules):**
- **Do now (process, zero site risk):** (a) UTM discipline — every future outbound link carries UTM from minute one, separate `utm_source` per channel incl. `utm_source=youtube` in the video description; (b) `ph_owner` flag on user's phone — pending user action; (c) ~~collect fresh Reddit/YT snapshot~~ — Reddit closed 2026-06-11 (15 h cut); YT closed 2026-06-11 (23 h 22 min cut above). Item fully closed.
- **Do next (site work, stop at local build, deploy only on explicit command):** design the "free modes → Control XL" bridge on `/free-custom-modes` — make the product + price visible to the 10/13 who currently never see it; fold a return anchor (Discord/newsletter block) into the same section. Copy variants shown in chat before applying (user rule). This is the single highest-leverage fix from this window. Added to roadmap Phase 1.
- **Next post:** link target = product page (or home), NOT `/free-custom-modes`; keep idea-first framing (insight #1); UTM on the link from the first minute.
- **Don't do:** no offer/pricing/hero changes off 0 buy_click (noise at n≈20); no video repositioning until replays confirm it sits below the fold; no new mobile feature ("send yourself a link") yet — newsletter already offers a light mobile step and sits at 0 submits, sample too small to justify build.
- **Plan check after the 15 h cut:** nothing in the Reddit snapshot changes the priorities — the bridge on `/free-custom-modes` stays fix #1, next-post link-target rule stands, no offer conclusions at n≈20. The lower CTR is a measurement correction, not a funnel problem.
- **Checkpoints:** ~~YT re-snapshot~~ (closed 2026-06-11, see YT numbers above); parked-tab/retention re-check ~2026-06-17 (do returning visitors come back to /free-custom-modes?); offer-signal review at ~100+ cumulative real sessions.

**Checkpoint updates (2026-06-11, midday ICT):**
- **UTM discipline SHIPPED** — decision item (a) closed for YT + the current Reddit post. Vanity redirects deployed on Cloudflare Pages: `/yt`, `/yt-modes`, `/yt-buy` (utm_source=youtube, utm_campaign=control_xl_presentation) and `/r`, `/r-modes`, `/r-buy` (utm_source=reddit, utm_campaign=introduction_post). Gumroad-bound paths 302 to gumroad.com/l/control-xl with UTMs for Gumroad-side analytics. Smoke test passed (all 302 to correct targets). User updated the YouTube video description to the short links and is swapping the Reddit post link to `fadercraft.com/r-modes`.
- **ph_owner CLOSED (all owner devices)** — Brave iPhone, Brave Mac, and stock Safari iPhone all flagged and filtered (user confirmed the stock-Safari visit 2026-06-11; analyst's cut had already shown that profile flagged since 06-10, landing as `fadercraft-owner`). Decision item (b) done — no further user action. The orphan in-app-browser profile (`374b2aa6…`) stays unmerged; its historical events remain in filtered sets forever (person-on-events), analyst discounts by hand.
- ~~YT re-snapshot~~ — **closed** (evening cut, 23 h 22 min after publish; numbers in the YT block above). With this, **the 2026-06-11 checkpoint is fully closed**: Reddit 15 h cut, site-analytics window, and YT ~24 h cut all captured. Only follow-ups remaining are the future-dated ones (parked-tab re-check ~06-17, offer review at 100+ sessions).

**Read addendum (PM, YT ~24 h cut):** YT stayed exactly in its lane (insight #5): 0% impressions CTR, zero algorithmic reach, all 35 views referral — hosting asset, as expected. The interesting bit is avg duration rising 0:46 → 0:57 (≈47% → ≈59% retention) on cold traffic: the ~10 tail views averaged ~87% of the video, i.e. late arrivals (post readers who clicked deliberately after the launch-hour rush, possibly warmer/more intentional) watched almost everything. At n=10 this is a hypothesis, not a finding — but it reinforces that the video is NOT the funnel's weak link, and front-loaded short format works. The 44-vs-35 discrepancy (48 h top-content panel vs video page) is recorded as-is; do not reconcile or build on either number beyond "views are in the dozens". Nothing here changes priorities: bridge on `/free-custom-modes` remains fix #1.

**Qualitative (day 2, comment thread, 2026-06-11 evening):**
- **The commenter pattern crystallized.** Every substantive commenter on the post turns out to be solving the same problem with a different home-built rig:
  - Elektron guy → one fixed template
  - Hardware-mixer guy → one mixer-style layout
  - Gig Performer guy → FOUR LCXLs side by side, mounted on a pedalboard with cable routing underneath, plus an on-screen widget GUI mirroring the physical layout
  - The author (us) → Fadercraft
  Four independent people, one problem, four DIY solutions. The shared problem, in the user's formulation: **make the controller stop being a per-project temporary setup and become a permanent performance interface.** This is the headline takeaway of the first Reddit test — stronger and more precise than "fixed layout" and far stronger than any feature framing ("15 custom modes", "6 controls per channel").
- **Conversation tactic validated.** Instead of explaining Fadercraft, the user asked the Gig Performer commenter to show *his* GUI — and received a detailed, unprompted description of a serious rig (the 4×LCXL pedalboard above) plus a promise to come back with studio photos. Asking about *their* setup produced more signal and more engagement than any pitch would have; it also creates a natural return-visit hook (the photos). User is drafting a reply that reacts to the new info, calls out the unusual detail (pedalboard mount), shows he understands the solution, gives a reason to return with photos — and does NOT steer the conversation back to the product. PM concurs with that reply shape.
- **Expected follow-up:** Gig Performer guy returning with studio photos of the 4×LCXL rig — a potential social artifact (with his permission) for future posts/landing social proof.

**Read (PM, day-2 qualitative):** This upgrades insight #1 from "people buy the idea, not features" to a *named* idea: **permanent interface vs per-project setup**. The evidence quality is unusual — not agreement with our framing, but four independently-built workarounds converging on the same job-to-be-done. That's the strongest form of qualitative validation a 9-comment thread can produce. The ask-about-their-setup tactic is a separate durable lesson (new insight #10). Distilled to insights #1 (refined) and #10 (new).

**Directions opened (not tasks, no priority change):**
- Next video / next post / landing hooks can lead with "permanent interface" framing — candidate hook territory: "your controller as a permanent interface, not a per-project setup".
- Gig Performer 4×LCXL photos, if they materialize, = social-proof artifact candidate (future post material, landing testimonial vector) — needs his permission before any reuse.
- Bridge on `/free-custom-modes` remains fix #1; nothing here reorders the decision stack. **Update 2026-06-11 (day): fix #1 SHIPPED — see the entry above (quiet-bridge variant).**

## 2026-06-10 — First Reddit post (Control XL / Fadercraft launch)
**What:** First post about the product in r/Novation: ["I started using the Launch Control XL MK3 as a…"](https://www.reddit.com/r/Novation/comments/1u20ebm/i_started_using_the_launch_control_xl_mk3_as_a/). Linked to the site and the YouTube demo.

**Numbers:** (snapshot ~1–1.5 h after posting)
- 518 post views
- 3 upvotes
- 10+ click-throughs to the site
- 9–10 YouTube views, 1 YouTube subscriber
- Several genuine comments; zero "stop advertising" / "this is spam"; post not removed

**Numbers:** (snapshot ~9 h 01 min after video publish, YouTube Studio, 2026-06-10)
- Video "Fadercraft Control XL presentation": 25 views, 1 comment, 0 likes. The 1 comment is the owner's own pinned comment ("Questions about the system or workflow — ask here") → organic viewer comments = 0 (closed 2026-06-10)
- Impressions CTR: 0% — all traffic is external (the Reddit link), nothing from YT recommendations
- Avg view duration: 0:46; video length 1:37 (97 s) → avg retention ≈ 47% (closed 2026-06-10, user fed length)
- Channel: 1 subscriber; 48 h top content = this video (25 views); watch time 0.1 h
- YT views grew ~10 (at ~1.5 h) → 25 (at ~9 h): traffic tail still flowing

**Numbers:** (snapshot ~21:00 ICT 2026-06-10 ≈ **2 h after posting**, Reddit Post Insights; the "2 hr. ago" label was accurate, NOT a display artifact — corrected 2026-06-11 when the next cut consistently showed "15 hr. ago")
- 811 post views (+123 over the last reporting period)
- 4 upvotes (+1), upvote ratio 100% — zero downvotes so far
- 8 comments
- Reddit badges: "your #1 post of all time" (trivial — first product post) and "#2 post on r/Novation today"
- Top countries by views: US 30.1%, UK 11%, Thailand 5.1% (Thailand ≈ the owner himself), Other 53.9%
- Dynamics across snapshots: 518 views / 3 up (~1.5 h) → 811 views / 4 up / 8 comments (~2 h) — +57% views in ~30 min

**Qualitative:** Commenters discuss fixed layouts, dawless workflows, hardware mixing, MIDI ports, Elektron. Almost nobody discusses the concrete features: 14 channels, 6 controls, pages, banks, hotkeys — or the Fadercraft name itself. Nobody asked "how do the hotkeys work?", but people volunteered "I also built one fixed template".

**Read (user's initial assessment, fed 2026-06-10):**
- Net positive for a first post by a new product in a niche sub: normal numbers, no rejection.
- 518 views → 3 upvotes = "interesting, not viral" zone; no wow-effect, no pushback.
- The post sells the *idea* ("stop rebuilding your controller for every project"), not the device. People responded to the idea, not the feature list.
- Key insight: users latched onto the "fixed layout" concept far more than onto Fadercraft's specific capabilities. People are buying "I don't want to rebuild my controller every project", not pages/banks/hotkeys.

**Read (PM, 2026-06-10):** Agree with the user's assessment. The strongest signal is qualitative, not numeric: commenters self-identified ("I also built one fixed template") — the ICP exists and already does the workaround manually. Numbers are baseline-normal for a cold first post in a niche sub; too early to judge reach. Distilled to [insights.md](insights.md) #1–#4.
**Read addendum (PM, 2026-06-10, after video length closed):** ~47% avg retention (0:46 of 1:37) on 100% cold referral traffic is a solid pass — the video holds, it's not the weak link in the funnel. Caveat: it's a mean, not a curve; on a 97 s video the average viewer is gone before the midpoint, so we can't tell "half watch fully, half bounce at 0:10" from "everyone fades around 0:45". Either way, everything that must be communicated has to land inside the first ~45 s. Distilled to insights #5.

**Read addendum (PM, 2026-06-10 ~2 h snapshot):** The "~30% of traffic comes in the tail" rule of thumb is underselling it here: 36% of all views (293 of 811) arrived after the 1.5 h cut, and the tail is still open. Upvote ratio 100% on a product post = zero rejection signal, consistent with the qualitative read. "#2 on r/Novation today" confirms the sub's absolute bar is low — being near the top costs ~4 upvotes; reach within the sub is effectively saturated per post, so growth must come from more posts/subs, not from optimizing one post. US+UK ≈ 41% of views — the audience geography matches paid-market targets (Thailand 5.1% is the owner). Nothing in this snapshot changes the plan; the 2026-06-11 checkpoint stands.
**Correction (PM, 2026-06-11, after the 15 h snapshot):** two reads above did not survive the night. (a) The tail was not 36% — **~71% of all views arrived after the 2 h cut** (811 → 2,800 by ~15 h). (b) "Reach saturated per post" was wrong: views grew 3.5× overnight while upvotes only went 4→8 — reach is feed-impression-driven, not upvote-driven, and a small sub keeps delivering for many hours. See the 2026-06-11 checkpoint entry for the corrected calibration.

**Gaps / unknown (capture at checkpoint 2026-06-11):**
- ~~Subreddit name + post URL~~ — closed 2026-06-10: r/Novation, URL above
- ~~YouTube watch time / avg view duration~~ — closed 2026-06-10: 0.1 h / 0:46 (9 h snapshot)
- ~~Site analytics for the window (visits, buy_click, purchase)~~ — closed 2026-06-11: analyst report, see checkpoint entry above (~20–24 real sessions, buy_click 0, purchase 0 real)
- ~~Gumroad sales since post~~ — closed 2026-06-11: 0 real sales (2 `purchase` events were Gumroad test pings `is_test=True`; pipeline itself confirmed working)
- ~~Video length~~ — closed 2026-06-10: 1:37 → avg retention ≈ 47%
- ~~Text of the 1 YouTube comment~~ — closed 2026-06-10: owner's own pinned comment, organic comments = 0 (normal at 25 cold views, not a signal)

**Decision (user's stance at feed time, PM concurs):**
- Do NOT post a second post today, do NOT push more links/Gumroad, do NOT rescue the post with extra comments.
- Observe for 24 h (small subs often get ~30% of traffic over the following day) → checkpoint 2026-06-11: re-snapshot same metrics (views/upvotes/comments/CTR/YT) + close the gaps above + reply to genuine comments (conversation, not selling).
- The "fixed layout" insight is the foundation for the next post and the next video hook; landing hero — review against it, change only if hero contradicts the idea-first framing.
