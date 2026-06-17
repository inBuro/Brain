---
name: faq-opens-as-intent-signal
description: FAQ accordion opens on the Control XL landing are captured as $autocapture clicks (the question text rides in $el_text) — a direct, queryable "what the audience worries about" signal; ranked list as of 2026-06-17 plus the reusable query
metadata:
  type: project
---

# FAQ opens = a free "audience intent / objection" signal (found 2026-06-17)

When a visitor opens an FAQ accordion item on `/`, it fires a `$autocapture` click whose
`properties.$el_text` IS THE QUESTION TEXT. So FAQ engagement is fully queryable — no custom
event needed. This is the single richest qualitative signal on the site about *what this
audience is thinking/worried about*, far more useful than scroll alone. Reusable for copy/tone
work (which objections to pre-empt) and for any audience research, including sibling products.

## Reusable query (autocapture click targets, owner-excluded)
```
SELECT properties.$pathname AS path, properties.$el_text AS el_text, elements_chain_href AS href, count() AS clicks
FROM events WHERE event='$autocapture'
AND toTimeZone(timestamp,'Asia/Bangkok') >= '<date>'
AND (person.properties.email IS NULL OR person.properties.email != 'hellokbbureau@gmail.com')
GROUP BY path, el_text, href ORDER BY clicks DESC
```
FAQ rows = `href` empty + `$el_text` ending in `?`. Real CTAs = rows with an href.
Demo-mixer clicks = `$el_text` None or a mode-number ("11"/"12"/"14") — the mixer mode captions.

## Ranked FAQ opens on `/` (window 2026-06-10 → 2026-06-17, owner-excluded)
1. **"Will this work with my existing Live Sets, or only the included starter set?"** — 8 opens (clear #1)
2. "Will this overwrite my current Custom Modes on the controller?" — 4
3. "How do I get updates after purchase?" — 3
4. "Does this work with the LCXL MK1 or MK2?" — 3
(plus "Does this need Max for Live?" opened on /free-custom-modes — 1)

Read of the ranking: the audience's top anxieties are **compatibility / "will it fit MY existing
setup"** (#1, #2, #4 are all variants of this) and **safety of touching their controller** (#2
"overwrite"). Aspiration/feature questions barely get opened. → copy that leads with "drops into
your existing Live Sets, non-destructive" answers the loudest objection. Useful tone input for
ANY M4L product aimed at the same r/ableton crowd (e.g. Sends Follower).

## Demo-mixer clicks ARE visible too (corroborates engagement)
Top click targets on `/` after FAQ = the demo mixer mode buttons (`$el_text` "11"/"12"/"13"/"14",
~10-11 clicks each). People DO play with the interactive demo — that's the most-clicked thing on
the page after raw whitespace. The hero/demo is where attention concentrates (matches the scroll
profile: most pageleaves happen in the 0-25% hero/demo band).
