---
name: custom-channel-maxforlive
description: Custom Channel Type rules in project modifiers.customChannelTypeRules — "Max for Live" (utm_source=maxforlive OR referring_domain icontains maxforlive, widened 2026-07-09) and "Reddit" (utm_source=reddit OR referring_domain icontains reddit), configured 2026-06-18; how they're stored, how to query/verify, retroactive behavior, the full final array
metadata:
  type: project
---

# Custom Channel Type rules (configured 2026-06-18, maxforlive rule widened 2026-07-09)

Two custom channel rules now live in `modifiers.customChannelTypeRules` (array, order = priority,
first-match-wins, ALWAYS above PostHog defaults). Their conditions are disjoint (maxforlive vs
reddit) so order between them is cosmetic. **FULL FINAL ARRAY (verified live 2026-07-09):**
```json
[
  {"id":"maxforlive","channel_type":"Max for Live","combiner":"OR","items":[
    {"id":"maxforlive-utm-source","key":"utm_source","op":"exact","value":"maxforlive"},
    {"id":"maxforlive-referring-domain","key":"referring_domain","op":"icontains","value":"maxforlive"}]},
  {"id":"reddit","channel_type":"Reddit","combiner":"OR","items":[
    {"id":"reddit-utm-source","key":"utm_source","op":"exact","value":"reddit"},
    {"id":"reddit-referring-domain","key":"referring_domain","op":"icontains","value":"reddit"}]}
]
```
**When adding/widening a rule: `project-get` first, APPEND/edit within this array, never send a
single-rule array (that clobbers the others).** The write tool is
`project-settings-update {"id":458316,"modifiers":{"customChannelTypeRules":[…]}}` — PATCH
semantics on top-level fields, but `modifiers` is replaced WHOLE, so every existing rule must be
resent together.

# Custom Channel Type "Max for Live" (configured 2026-06-18, widened 2026-07-09)

Set up so the maxforlive.com listing traffic shows as its OWN channel in Web
Analytics instead of being lumped into Referral/Direct. See [[sale-1-attribution]]
(first sale came from this channel) and the maxforlive UTM markers in [[posthog-access]].
**maxforlive.com is a confirmed, ongoing acquisition channel** — for Control XL originally, and
since ~2026-07-08 also driving real volume to Sends Follower (owner-confirmed 2026-07-09 the SF
listing is intentional and ongoing, not a one-off).

## THE RULE (as of 2026-07-09)
- **`utm_source = maxforlive` (exact) OR `referring_domain icontains maxforlive` → channel_type
  "Max for Live"**, combiner OR, two conditions.
- Custom channel rules ALWAYS take priority over PostHog's default channel types,
  and the FIRST matching rule wins. This is still effectively first (only maxforlive/reddit
  exist) → fires before Referral/Direct/Organic.

## WHY WIDENED (2026-07-09) — the referrer-only gap
The original rule (06-18, `utm_source=maxforlive` only) missed any session where the UTM never
reached the entry-pageview UTM field — documented below for the 06-15 buyer, and reproduced at
scale by [[day-2026-07-08]]: **20+ sessions on 07-08 landed via `$referring_domain=maxforlive.com`
with NO utm params at all** (SF's maxforlive listing apparently doesn't pass UTMs on its
outbound link), all falling through to default "Referral" classification. Owner confirmed the
channel is real and ongoing → added `referring_domain icontains maxforlive` as a second OR
condition on the same rule (channel_type unchanged).
- **VERIFIED immediately after the write, against 07-08 data:** `SELECT $channel_type, count()
  FROM sessions WHERE <07-08 day bounds, Asia/Bangkok> GROUP BY $channel_type` →
  **Direct 31, Max for Live 22, Reddit 8, Referral 4, Organic Search 2, Organic Video 2**.
  Isolating `$entry_referring_domain ILIKE '%maxforlive%'` → all 22 sessions now read "Max for
  Live" (previously would have read "Referral" under the old rule, per the same default
  classification logic verified for the original 3 pre-widening sessions below).
- The buyer-session gotcha below (UTM-in-`$referrer`-after-self-hop) is STILL not caught by this
  widened rule either — that's a different, deeper gap (referrer overwritten by an on-site hop
  before the referring-domain field itself gets set), not fixable by a channel-type rule at all.
  It remains a hand-attribution case.

## WHERE IT LIVES (storage) — applied via MCP, no UI step needed
- Stored on the PROJECT under **`modifiers.customChannelTypeRules`** (a HogQLQueryModifiers
  field). Applied through the MCP with
  `project-settings-update {"id":458316,"modifiers":{"customChannelTypeRules":[…]}}`
  (`modifiers` is an open `{}` field in the tool schema → it accepts the rules array).
  NO manual dashboard step was required. The equivalent UI lives at
  https://us.posthog.com/settings/project-web-analytics (Web analytics → Custom channel type).
- **Exact JSON shape (verified against PostHog source channel_type.py):**
  rule = `{id, channel_type, combiner:"OR"|"AND", items:[…]}`;
  condition = `{id, key, op, value}`. Backend reads only channel_type/combiner/items +
  key/op/value; `id`s are for the UI editor.
- **CustomChannelField keys:** utm_source, utm_medium, utm_campaign, referring_domain, url, pathname, hostname.
- **CustomChannelOperator ops:** exact, is_not, is_set, is_not_set, icontains, not_icontains, regex, not_regex.

## RETROACTIVE — it's a query-time HogQL rule, not stored on the event
- `$channel_type` is computed at QUERY TIME (lives on the `sessions` table, derived
  via HogQL). So the rule reclassifies ALL historical sessions instantly, no backfill.
- VERIFY query (owner auto-excluded because these all have email=None; for sessions
  table there's no email col, cross-check via events):
  `SELECT $channel_type, count(), uniqExact(distinct_id) FROM sessions WHERE $entry_utm_source='maxforlive' OR $entry_referring_domain ILIKE '%maxforlive%' GROUP BY $channel_type`

## COVERAGE HISTORY
- **As of 2026-06-18** (utm_source-only rule): 3 sessions / 3 persons reclassified to "Max for
  Live" (were "Referral": entry_utm_medium=referral, entry_referring_domain=maxforlive.com).
  Dates: 06-15 00:16 ICT (ES/Edge, entry `/`), 06-15 04:58 ICT (DK/Firefox), 06-16 15:43 ICT.
  All campaign=control_xl_listing, all real visitors (email=None ≠ owner).
- **As of 2026-07-09** (widened rule): 22 sessions read "Max for Live" on 07-08 alone (see
  [[day-2026-07-08]]) — the Sends Follower listing driving real, recurring volume.
- **GOTCHA — the original buyer's own session is STILL NOT caught, and that's expected.** The
  buyer ([[sale-1-attribution]], session 019eca70-…, 06-15 15:40, entry `/free-custom-modes`)
  has `$entry_utm_source = None` AND `$entry_referring_domain` = the self-domain (fadercraft.com)
  because the maxforlive UTM lived in `$referrer` after an on-site self-referrer hop, never
  landing on either the entry-UTM or entry-referring-domain field. Neither condition on this rule
  can catch that specific shape — the real fix would be upstream (preserve UTM on the captured
  entry pageview). That one session stays hand-attributed.

# Custom Channel Type "Reddit" (configured 2026-06-18)

Set up so Reddit traffic (the main acquisition source — see [[reddit-threads-tracking]],
[[posthog-access]] channel-UTM table) shows as its OWN channel instead of being lumped into
"Organic Social". Before this rule ALL reddit read as **Organic Social**.

## THE RULE — chosen from real data, not guessed
- **combiner OR, two items: `utm_source = reddit` (exact) OR `referring_domain icontains reddit`
  → channel_type "Reddit".**
- WHY `utm_source=reddit` is primary: a session-level audit (2026-06-18) showed EVERY reddit
  session carries `$entry_utm_source='reddit'` exactly — across all campaigns (introduction_post,
  abletonlive_post, organic, ableton_post). It's the one signal present on 100% of reddit visits.
- WHY also `referring_domain icontains reddit` (safety net): reddit `$entry_referring_domain` is
  only ever `$direct` (~30, WebView strips referrer) or `com.reddit.frontpage` (~6) — NEVER a bare
  `reddit.com`. So the referrer item catches NOTHING extra today (those 6 already carry the UTM),
  but future-proofs against a desktop click landing as `reddit.com`/`out.reddit.com`/`old.reddit.com`
  WITHOUT the UTM. `icontains reddit` can't false-positive (nothing non-reddit has "reddit" in its
  domain).
- WHY NOT key on utm_campaign or utm_medium: **telegram** traffic also has `utm_medium=social` +
  `utm_campaign=organic`. Keying on those would wrongly grab telegram. `utm_source=reddit` excludes
  it cleanly (telegram stays Organic Social). VERIFIED no overlap with maxforlive either (no
  maxforlive session has "reddit" anywhere).

## COVERAGE AS OF 2026-06-18 — 36 sessions / 36 persons reclassified to "Reddit"
- Post-write channel split (whole history, all sessions, no filter): Direct 107/56, **Reddit 36/36**,
  Referral 15/9, **Max for Live 3/3 (UNCHANGED — not broken)**, Organic Social 3/3 (= telegram, correctly
  left out of Reddit). All 36 Reddit matched via `utm_source=reddit`; the referrer item added 0 today.
- Campaign breakdown inside Reddit (utm_campaign): introduction_post ~14, abletonlive_post ~14,
  organic ~6, ableton_post ~2 (all historically reddit markers).

## VERIFY query (Reddit)
`SELECT $channel_type, count(), uniqExact(distinct_id) FROM sessions WHERE $entry_utm_source='reddit' OR $entry_referring_domain ILIKE '%reddit%' GROUP BY $channel_type`
— should return only "Reddit". And the channel-overview query (GROUP BY $channel_type, no filter)
should keep "Max for Live"=3 and "Organic Social"=3 (telegram).
