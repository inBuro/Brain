# Voice of user – unmet M4L utility needs (2026-08-16)

First discovery sweep aimed at a question the production miner cannot answer: **what small
Max for Live utility do Ableton users keep asking for?** – as opposed to "does this comment
match one of the three products I already sell".

> **Status 2026-08-17: the discovery lane is off the cron schedule.** It ran daily for one
> day (`discover` / `cluster` / `market`), which only added ~12 comments a day to a
> conclusion already drawn below. The lanes still exist in `worker-comment-miner` – re-run
> on demand with `/run?job=discover|cluster|market&token=$RUN_TOKEN`, or restore the three
> cron expressions in `wrangler.toml` to put it back on a schedule. Cost was not the
> reason: the whole Gemini project runs ~THB 1.5/day, and this sweep cost THB 85 once.

## Why the production miner went quiet

Two independent causes, both structural:

1. **The keyword universe is mined out.** `worker-comment-miner/src/config.js` holds 48
   queries, `maxVideos: 1` (2 for Sends Follower). That is a corpus of ~50 videos. The KV
   `seen:<url>` dedup holds for 180 days, so after a few cycles every comment on those
   videos is already burned. Last run (2026-08-16): 12 keywords processed, 4 classified,
   **0 created**. The Notion DB got 25 rows in August vs 75 in July, newest 2026-08-13.
2. **`classify()` is a yes/no gate against three products.** A comment saying "I wish
   Ableton could do X" returns `match:false`, is written to `seen:` for 180 days, and is
   gone forever. The miner is a validation tool, not a discovery tool – no amount of new
   keywords changes that.

Any discovery lane must use its own `seen:` keyspace, or it will skip everything the
validation miner has already burned.

## Method

- 34 YouTube queries in 5 shapes, 3–4 videos each, up to 200 comments per video –
  ~4300 comments scanned, ~6300 YouTube API units
- Wish-language pre-filter ("i wish", "is there a way to", "why can't", "annoying", …)
  → 189 candidates
- Per-comment judgement (Gemini 3.1 Pro): is this a real need, can a **small** M4L device
  actually deliver it given the Live API, canonical need statement, breadth
- Clustering pass over the surviving needs → countable demand clusters

Scripts and raw JSON live in the session scratchpad; regenerate rather than trust the
snapshot if this is re-run.

### Query shapes, by yield

| Shape | Example query | Wish-hit rate |
|---|---|---|
| `hack` – workflow-task tutorials | `ableton follow actions tutorial` | 5.7% |
| `ctrl` – controller / performance | `ableton launchpad performance tutorial` | 4.5% |
| `pain` – friction videos | `things i hate about ableton` | 4.2% |
| `wishlist` – "features Ableton needs" | `ableton live 12 wishlist` | 3.3% |
| `m4l` – device showcases | `max for live devices 2025` | 2.4% |
| `chore` – mixing/arrangement chores | `ableton gain staging tutorial` | 0.9% |

**The wishlist shape is a trap.** It has a decent hit rate but the content is almost
entirely core-DAW requests M4L cannot touch – ARA2, take lanes, MIDI-editor feel, true
buses, CPU scheduling, stem separation, keyboard shortcuts. Only 5–8 of 54 wishlist
candidates were device-shaped. `hack` and `ctrl` – tutorials where people ask "is there a
way to…" – are where M4L-solvable needs actually live.

Overall: **117 of 189 candidates were judged not feasible in M4L**, 62 yes, 10 partial.
After dropping large-scope ideas (sequencers, synths), **59 needs** remained.

## Ranked clusters

Sorted by mention count, then breadth. Every quote links to the live comment.

### 1. Fixed-length clip recorder – 4 mentions, build: medium

Record a loop of a pre-set length and have it stop and flip to playback on its own, without
a second click.

- "I wish there was a way to pre-select the loop length" – 5♥ –
  [link](https://www.youtube.com/watch?v=qAVqNbC_wso&lc=Ugx1ytb4vKG93u5P_sV4AaABAg)
- "record the audio for 4 bars abd the repeat like a guitar looping pedal" –
  [link](https://www.youtube.com/watch?v=qAVqNbC_wso&lc=Ugx_Jf_sEtlH1L19Gqp4AaABAg)
- "auto loop in ableton after x amount of bar(s)?" –
  [link](https://www.youtube.com/watch?v=qAVqNbC_wso&lc=Ugzu5CpMRaimUyMqoAl4AaABAg)
- "do up to 16 or more bar fixed length recording for people who play longer length recordings" –
  [link](https://www.youtube.com/watch?v=gm67P7lvEek&lc=UgyZOGCatQZHsV2zHLl4AaABAg)

Existing: Push has this natively; non-Push users reach for M4L devices and report trouble
with long clips. **Verify what already ships before costing this.**

### 2. Macro Variation automator – 3 mentions, build: small

Sequence Macro Variations from an arrangement automation envelope. Live exposes the
variation buttons but not as an automatable parameter.

- "still no automation for the variation buttons" – 3♥ –
  [link](https://www.youtube.com/watch?v=mC68YQG_r2U&lc=Ugy5QRY2oo7qDoOYPD94AaABAg)
- "draw automation envelopes that will switch between macro variations" –
  [link](https://www.youtube.com/watch?v=mC68YQG_r2U&lc=UgxKixXSKBq2dMYAMnp4AaABAg)
- "automate switching between the variations" –
  [link](https://www.youtube.com/watch?v=zskczAO44fU&lc=Ugzmc2UwXgXqJ_1iX_14AaABAg)

### 3. Macro Variation morpher – 3 mentions, build: medium

Interpolate between saved variation states over a timeline instead of jumping, and carry
more than 8 parameters.

- "automate between macro variations" –
  [link](https://www.youtube.com/watch?v=mC68YQG_r2U&lc=Ugz0bitgwr2yExCERlJ4AaABAg)
- "Morph between lock states on Master macros" –
  [link](https://www.youtube.com/watch?v=zskczAO44fU&lc=Ugz7z4FgAASME1TzCgx4AaABAg)
- "wish it had more than 8 assignable" –
  [link](https://www.youtube.com/watch?v=MYeBf21AxOc&lc=Ugwb24t2d1hGTUGQhk94AaABAg)

### Macro Variations as one theme

Clusters 2, 3 and 10 (action-based triggering) are three faces of the same gap: Live 11
shipped Macro Variations with no automation, no interpolation and no cross-rack triggering.
**Combined that is 8 mentions – the single strongest signal in this sweep**, and it sits
next to the existing mapping/modulation product line rather than off in a new category.

### 4. Parameter toggle utility – 2 mentions, breadth: broad, build: small

Make a macro or a foot controller behave as a hard on/off toggle rather than a continuous
knob.

- "map a foot controller and on/off these effects" –
  [link](https://www.youtube.com/watch?v=0b76TnXKlQg&lc=UgxP6KvohUJN8-2TXXN4AaABAg)
- "make a knob of the macros behave like a button? For example to turn on or off" –
  [link](https://www.youtube.com/watch?v=F9dSi23XE5g&lc=UgyguTmv6Nl3hH74orp4AaABAg)

### 5. Looper transport mapper – 2 mentions, 12♥, build: small

Quantized punch-in/out on the native Looper, driven from MIDI or the computer keyboard.

- "incorporate quantizing, and whatever else is used to get the start/stop" – 12♥ –
  [link](https://www.youtube.com/watch?v=qAVqNbC_wso&lc=UgyEul1yvgxE5bSpaL94AaABAg)
- "how would you loop with the PC keyboard." –
  [link](https://www.youtube.com/watch?v=qAVqNbC_wso&lc=UgwQoS-kC1tXB3WSENx4AaABAg)

### 6. Stateful MIDI feedback – 2 mentions, 8♥, build: medium

Light up LEDs on generic controllers to reflect mute/solo/record state. Adjacent to the
Control XL line and to the LCXL feedback work already done.

- "make MIDI CC pads state-ful in custom setups (ie different colors for different states)" – 8♥ –
  [link](https://www.youtube.com/watch?v=gm67P7lvEek&lc=UgzLhmqLRB6XAHkadFZ4AaABAg)
- "make the record transport button work in chord/ note mode/custom mode so I can record in arrangement" –
  [link](https://www.youtube.com/watch?v=gm67P7lvEek&lc=Ugx7nNc284cGSxfoN2x4AaABAg)

### 7–12. Remaining two-mention clusters

| Cluster | Job | Build |
|---|---|---|
| Track arming & focus | Arm/select the next track from a key or pad, no mouse | small |
| Conditional clip & scene actions | Stop or fire clips based on another clip's state | medium |
| Device snapshot & recall | Store and MIDI-recall whole device-chain configurations | medium |
| Action-based macro triggering | Fire variations across several racks on clip launch or one button | medium |
| Keyswitch instrument selector | Select rack chains by MIDI note and focus the chain's UI | medium |
| Auto-follow by audio end | Fire the next scene exactly when an unwarped clip ends | small |

31 further needs appeared once each – kept in the raw data, too thin to rank.

## How much to trust this

- **Counts of 2–4 are directional, not demand data.** They say "this recurs across unrelated
  videos and phrasings", not "N% of users want it". Treat the ranking as a shortlist to
  probe, not a verdict.
- **The "existing solutions" notes are model claims and are unverified.** Several clusters
  (fixed-length recording, snapshots, conditional actions) may already be well served by
  ClyphX Pro, Kapture or existing free devices. Check each candidate against
  maxforlive.com and the Ableton forum before costing it – that check is cheap and kills
  bad candidates fast.
- Comment likes are a weak signal here; most of these sit at 0–1♥ because they are buried
  replies under tutorials, not top comments.

## Now automated (2026-08-16)

This lane runs in the Cloudflare Worker alongside the product miner, as two jobs:

- `discover` (cron `0 2 * * *`, 09:00 ICT) – walks `keywordsDiscovery`, wish-language
  pre-filter, per-comment judgement on Gemini 3.1 Pro, writes to the **M4L Idea Mining**
  Notion DB. Own KV cursor (`discoveryCursor`) and own dedup prefix (`dseen:`) – sharing
  `seen:` with the product miner would make it skip exactly the wish-comments the product
  gate already rejected.
- `cluster` (cron `30 2 * * *`, 09:30 ICT) – assigns each new row to an **existing** cluster
  where one fits, then denormalizes `Mentions`, `Cluster likes` and `Score` onto every
  member row so the table sorts by demand. Matching against existing clusters is the
  load-bearing part: clustering each day's batch in isolation would split one need across
  days and frequency would never accumulate.

Manual: `/run?job=discover|cluster&token=…`. `/maintenance?job=reset-discovery-dedup` forgets
`dseen:` so a changed classifier can re-judge (prefix-scoped – never touches `seen:`).

**Score** = `(Mentions × 10 + Cluster likes) × effort multiplier`, where micro 1.0 /
medium 0.75 / large 0.5. Frequency dominates because it is the only real demand signal;
likes are a deliberately weak tiebreaker (these comments are buried replies at 0–1♥, so
weighting them would rank by luck of placement); effort discounts rather than decides, so a
popular hard thing still outranks a trivial thing nobody asked for.

`Scope` (feature / product / suite) and `Effort` (micro / medium / large) are separate axes
on purpose – a need can be product-substantial and cheap to build, which is the best
combination. `feature` rows are stored, not filtered: a single comment is almost always
feature-sized, and the product emerges from the cluster – Macro Variations showed up here as
three separate clusters totalling 7 mentions, the same way it did in the one-shot sweep.

First live ranking reproduced the manual result: **Automate rack Macro Variations** on top.

## Market check – the finding that reframes this whole lane (2026-08-16)

A `market` job now runs as a pipeline stage (cron `45 2 * * *`), asking per cluster whether
somebody already ships this, using Gemini with Google Search grounding. First full pass:
**7 of 7 clusters came back "exists free"**, with specific, checkable evidence.

| Cluster | Already solved by |
|---|---|
| Automate rack Macro Variations | AbletonKurse "AUTOMATE MACRO VARIATIONS" pack (PWYW), KBDevices "Variation Launcher" |
| Morph between Macro Variations | KBDevices **Smooth Automator** (free/PWYW), Metamagicum "Preset Morpher", Maboroshy "Variation Transition" |
| Advance scene on clip end | Stock Live – Scene Follow Actions set to "Linked" / "Next" |
| Auto-toggle metronome during recording | Stock Live – metronome dropdown, "Enable Only While Recording" |
| MIDI pedalboard effect toggling | Stock Live – Audio Effect Rack macros + Chain Selector |
| Macro knob as toggle button | Greywood "Toggle Button Macro", surfingpikachu "Simple One-Button Macro" |
| Multi-voice drum pattern generator | mganss "DrumBrain"; Live 12 Suite ships Iftah's "Generators" pack |

**What this means.** The demand ranking was measuring the wrong thing. A need that recurs in
2025–2026 comments does not imply a gap – it far more often means the solution exists and the
asker cannot find it. Frequency alone would have sent us to build a device two people already
give away. Scoring now multiplies demand by a market factor (`exists free` 0.25, `exists paid`
0.6, `partial` 0.85, `none found` 1.0), which collapsed the top cluster from 34 to 9.

The lane is therefore not a shortlist generator – it is a **filter whose output is the rare
`none found` row**. Those are what to watch; everything else is noise or, at best, a content
opportunity (people asking for things that already exist are a video/reply audience, not a
product market).

**Caveat:** a checker that answers "exists" seven times out of seven deserves suspicion. The
evidence is specific and checkable rather than hand-waving, which is why it is trusted here,
but spot-check any verdict before acting on it – especially a `none found`, where the cost of
a false negative is building something redundant.

## Recency floor

Comments now have to be from **2025-01-01 or later** (`CONFIG.commentsSince`), on both lanes.
Video-level search stays wide on purpose – an old tutorial keeps collecting fresh comments.
Comment ordering switched `relevance` → `time`, since relevance returns a video's all-time top
comments, which on an older video are mostly pre-2025 and get discarded after we already paid
to fetch them.

Applied retroactively: 17 of 26 rows were pre-2025 and were archived. Notably **Automate rack
Macro Variations survived intact** – all three of its mentions are 2025-01-03, 2025-01-24 and
2026-03-29 – which is what confirmed the complaint is alive in the Live 12 era rather than a
Live 11 leftover. It is still a no-build, but for the market reason, not a staleness one.

## Next steps

1. Verify the top 3–4 clusters against what already exists on maxforlive.com / Isotonik /
   ClyphX. Whatever survives is a real gap.
2. Widen the sweep on the two shapes that actually pay – `hack` and `ctrl` – to lift the
   single-mention tail into countable clusters. The wishlist and chore shapes are not worth
   more quota.
3. If this becomes recurring, add it to the Worker as a fourth mode with its own Notion DB
   and **its own `seen:` key prefix**, so it does not inherit the validation miner's burned
   URLs.
