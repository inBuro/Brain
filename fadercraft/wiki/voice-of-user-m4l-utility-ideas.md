# Voice of user – unmet M4L utility needs (2026-08-16)

First discovery sweep aimed at a question the production miner cannot answer: **what small
Max for Live utility do Ableton users keep asking for?** – as opposed to "does this comment
match one of the three products I already sell".

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

## Next steps

1. Verify the top 3–4 clusters against what already exists on maxforlive.com / Isotonik /
   ClyphX. Whatever survives is a real gap.
2. Widen the sweep on the two shapes that actually pay – `hack` and `ctrl` – to lift the
   single-mention tail into countable clusters. The wishlist and chore shapes are not worth
   more quota.
3. If this becomes recurring, add it to the Worker as a fourth mode with its own Notion DB
   and **its own `seen:` key prefix**, so it does not inherit the validation miner's burned
   URLs.
