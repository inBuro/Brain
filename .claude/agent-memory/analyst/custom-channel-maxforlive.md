---
name: custom-channel-maxforlive
description: Custom Channel Type rules in project modifiers.customChannelTypeRules — "Max for Live" (utm_source=maxforlive) and "Reddit" (utm_source=reddit OR referring_domain icontains reddit), both configured 2026-06-18; how they're stored, how to query/verify, retroactive behavior, the full final array, and the UTM-on-$referrer gotcha that limits coverage
metadata:
  type: project
---

# Custom Channel Type rules (configured 2026-06-18)

Two custom channel rules now live in `modifiers.customChannelTypeRules` (array, order = priority,
first-match-wins, ALWAYS above PostHog defaults). Their conditions are disjoint (maxforlive vs
reddit) so order between them is cosmetic. **FULL FINAL ARRAY (verified live 2026-06-18):**
```json
[
  {"id":"maxforlive","channel_type":"Max for Live","combiner":"OR","items":[
    {"id":"maxforlive-utm-source","key":"utm_source","op":"exact","value":"maxforlive"}]},
  {"id":"reddit","channel_type":"Reddit","combiner":"OR","items":[
    {"id":"reddit-utm-source","key":"utm_source","op":"exact","value":"reddit"},
    {"id":"reddit-referring-domain","key":"referring_domain","op":"icontains","value":"reddit"}]}
]
```
**When adding a 3rd rule: `project-get` first, APPEND to this array, never send a single-rule array
(that clobbers the others).** The write tool is `project-settings-update {"id":458316,"modifiers":{"customChannelTypeRules":[…]}}` — PATCH semantics on top-level fields, but `modifiers` is replaced WHOLE, so you must include every existing rule.

# Custom Channel Type "Max for Live" (configured 2026-06-18)

Set up so the maxforlive.com listing traffic shows as its OWN channel in Web
Analytics instead of being lumped into Referral/Direct. See [[sale-1-attribution]]
(first sale came from this channel) and the maxforlive UTM markers in [[posthog-access]].

## THE RULE
- **`utm_source = maxforlive` (exact) → channel_type "Max for Live"**, single condition, combiner OR.
- Custom channel rules ALWAYS take priority over PostHog's default channel types,
  and the FIRST matching rule wins. This is the only custom rule, so it's first by
  definition → fires before Referral/Direct/Organic. (If more custom rules are added
  later, keep this one's position in mind — order in the array = priority.)

## WHERE IT LIVES (storage) — applied via MCP, no UI step needed
- Stored on the PROJECT under **`modifiers.customChannelTypeRules`** (a HogQLQueryModifiers
  field). Was `modifiers: null` before; now holds exactly this one rule. Writing it did
  NOT clobber anything — `default_modifiers` (bounceRate, sessionTableVersion, etc.) are
  separate and untouched.
- Applied through the MCP with `project-settings-update {"id":458316,"modifiers":{"customChannelTypeRules":[…]}}`
  (`modifiers` is an open `{}` field in the tool schema → it accepts the rules array).
  NO manual dashboard step was required. The equivalent UI lives at
  https://us.posthog.com/settings/project-web-analytics (Web analytics → Custom channel type).
- **Exact JSON shape (verified against PostHog source channel_type.py):**
  rule = `{id, channel_type, combiner:"OR"|"AND", items:[…]}`;
  condition = `{id, key, op, value}`. Backend reads only channel_type/combiner/items +
  key/op/value; `id`s are for the UI editor. Our rule:
  `{"id":"maxforlive","channel_type":"Max for Live","combiner":"OR","items":[{"id":"maxforlive-utm-source","key":"utm_source","op":"exact","value":"maxforlive"}]}`
- **CustomChannelField keys:** utm_source, utm_medium, utm_campaign, referring_domain, url, pathname, hostname.
- **CustomChannelOperator ops:** exact, is_not, is_set, is_not_set, icontains, not_icontains, regex, not_regex.

## RETROACTIVE — it's a query-time HogQL rule, not stored on the event
- `$channel_type` is computed at QUERY TIME (lives on the `sessions` table, derived
  via HogQL). So the rule reclassifies ALL historical sessions instantly, no backfill.
- VERIFY query (owner auto-excluded because these all have email=None; for sessions
  table there's no email col, cross-check via events):
  `SELECT $channel_type, count(), uniqExact(distinct_id) FROM sessions WHERE $entry_utm_source='maxforlive' GROUP BY $channel_type`

## COVERAGE AS OF 2026-06-18 — 3 sessions / 3 persons reclassified to "Max for Live"
- All 3 sessions with `$entry_utm_source='maxforlive'` now read channel_type "Max for Live"
  (were "Referral": entry_utm_medium=referral, entry_referring_domain=maxforlive.com).
  Dates: 06-15 00:16 ICT (ES/Edge, entry `/`), 06-15 04:58 ICT (DK/Firefox), 06-16 15:43 ICT.
  All campaign=control_xl_listing, all real visitors (email=None ≠ owner).
- **GOTCHA — the buyer's own session is NOT in this set, and that's expected.** The buyer
  ([[sale-1-attribution]], session 019eca70-…, 06-15 15:40, entry `/free-custom-modes`)
  has `$entry_utm_source = None` because the maxforlive UTM lived in `$referrer` after a
  self-referrer in-site hop, never landing on the entry-UTM field. A custom channel rule
  keyed on `utm_source` therefore CANNOT catch sessions where the UTM only survived in
  `$referrer`. To also capture those, a referring_domain-based rule (`referring_domain
  icontains maxforlive` → "Max for Live") could be added — but careful, the buyer's
  entry_referring_domain was the self-domain too, so even that wouldn't catch THAT
  session. The real fix is upstream (preserve UTM on the captured entry pageview). For
  now the rule cleanly separates the 3 clean-entry maxforlive sessions; the buyer's
  session stays Referral and is attributed by hand.

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
