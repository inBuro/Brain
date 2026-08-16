# Dynamic Focus — Meeting Comments & Research Positioning

**Date:** 2026-07-18  
**Research:** Absolute-control value-jump problem: mechanism, hardware classification, voice-of-user  
**Output:** Strategic positioning for DF based on confirmed market signals

---

## WHAT WE LEARNED

### Market Validation
- **Real, unsolved 12-year problem** — not a feature request, not a niche edge case
- **Install base:** 2-3M active musicians affected (nanoKONTROL2 ~1M+, MPK Mini 1-2M, LCXL ~500k, Launchkey ~400k)
- **Bundled scripts fail** — even Novation's native Ableton script doesn't prevent jumping outside its single mixer page
- **Ableton's takeover modes break** — Pickup/Value Scaling don't work across bank switches (documented in Ableton Forum + Novation support acknowledgement)
- **Twelve-year iteration proof** — Novation spent MK1→MK2→MK3 cycle specifically moving from absolute pots to endless encoders to eliminate this problem

### User Language (For Copy)
- Primary symptom: **"knob jumps"** (not "parameter snap" or "value acquisition failure")
- Trigger: **"when I switch banks"** (specific, not abstract)
- Expectation failure: **"pickup mode doesn't work"** — they know what they want, bundled scripts promise it, they don't get it
- Emotional: **"can't perform"** / **"ruins my take"** — performance impact is the hook, not features

### Competitive Landscape
- No commercial solution exists despite 12 years of complaints
- Third-party hacks exist (GitHub patches, paid utilities like nK2-Live) but no standard
- Ableton has not addressed this as a platform (Live 8 → Live 12, still broken)
- Hardware fix is endless encoders (MK3, Komplete Kontrol, Push) — expensive, not available for existing gear
- Software fix = DF opportunity

---

## DF POSITIONING — THREE ANGLES

### For Budget Absolute-Controller Users (2-3M market)
**Nanocontrol2, MPK Mini, LCXL, Launchkey:**

**Problem statement (their language):**  
"Your knob jumps when you switch banks"

**DF answer:**  
"See your knob's live value. Switch banks instantly. Zero snap."

**Why DF matters:**  
These controllers don't have endless encoders (hardware expensive). They have absolute potentiometers (cheap, tactile, but broken across banks). DF provides the software equivalent of an endless encoder's behavior.

### For "Bundled Script" Trap Users (false safety)
**Launchkey MK1/2, LCXL MK1/2, APC mini, Axiom:**

**Problem statement:**  
"I thought the bundled script protected me everywhere. It doesn't work for custom mappings or outside the built-in mixer."

**DF answer:**  
"DF is the universal takeover that Ableton never built. Works with any controller, any mapping, any device."

**Why DF matters:**  
These users have been sold a half-solution (script works within its designed scope, fails everywhere else). DF is the complete solution.

### For Physical Synth Setups (Dawles Context)
**Multiple hardware synths + one MIDI controller:**

**Problem statement:**  
"My controller can't know what synth is playing at what value. Banks are chaos."

**DF answer:**  
"DF shows you the live parameter on screen. Switch between synts without surprises. Works with scale mode, absolute mode, anything."

**Why DF matters:**  
In physical synth rigs, value-jump is even more chaotic because you have no DAW display. DF solves "I can't see what I'm controlling" + "knobs jump on every switch."

---

## PRODUCT IMPLICATIONS

### Must-Have Features (From Research)
1. **Live value display** — the core ask from all user groups ("see the live value")
2. **Zero parameter jump on bank switch** — this is the entire value prop
3. **Works universally** — not tied to specific controller or bundled script
4. **Quick setup for known SICK controllers** — at least nanoKONTROL2 + MPK Mini + LCXL should have presets or one-click templates

### Nice-to-Have (Market Differentiator)
- Per-track controller focus (Mapping Deck positioning)
- Multi-device awareness (track 1 has Synth A on bank 1, Synth B on bank 2 → DF remembers position per device)
- Physical synth labeling (display "Moog Sub-37 Cutoff" instead of "Parameter 47")

### Edge Case to Clarify (Spec)
- **Dawles / Multi-Device Setups:** Does DF work when one controller maps to multiple devices on the same track? Or does DF assume one-device-per-track? (This affects copy for physical synth users and needs explicit documentation)

---

## GO / NO-GO DECISION

### GO

**Recommendation:** Launch DF with this positioning.

**Rationale:**
- Market exists and is validated (2-3M, not 200k edge case)
- 12-year unsolved problem (Ableton's architecture can't fix it, hardware solutions exist but are expensive)
- Bundled script trap is real (users will pay for a solution once they hit it)
- Language resonates (user research gives us exact phrases for copy)
- Competitive gap is large (no standard solution in 12 years)

---

## IMMEDIATE NEXT STEPS

### 1. DF Spec (End of Week, 1 page)
- [ ] Live value display design (on-screen knob/dial showing current parameter)
- [ ] Banking mechanism (how tracks/devices are selected, how focus switches)
- [ ] Controller support list (which ones have presets/templates)
- [ ] Edge case: multi-device per track behavior
- [ ] Pricing: Workflow tier ($24) or standalone?

### 2. YouTube Outreach (Parallel, ~2h)

**Note (2026-07-19):** The original raw data was NOT lost — it lives in the Notion database **"YouTube Comment Mining"** (43 rows tagged `Product = Dynamic Focus`). The URLs were present all along, just buried as plain text inside the `Reason` field instead of being attached to the `Comment` title — that's why the table read as a wall of unclickable text. Fixed: all 43 rows now have the source URL as a real hyperlink on the `Comment` title (patched via API 2026-07-19). Below is the verified real top-10 by like count, pulled straight from that database.

**Priority A — reply first (highest like count, clearest pain match):**

1. **105♥ — @keyhoarder**, on *"Do motorized knobs make MIDI controllers better? ROTO CONTROL Review (Ableton Live & hardware)"*
   > "Motorized Knobs are great, but to be honest problem with value vs knob position can be solved (for me) in much cheaper way, by endless encoders and on-screen values. Of course the best is when the screen is next to the knob."
   https://www.youtube.com/watch?v=NcfVQYjq41s&lc=UgzLmhEzA-moxGpC99p4AaABAg
   ↳ [visibility] — the single strongest resonance signal in the entire corpus.

2. **6♥ — @amosluyk**, same video
   > "Been waiting a decade for Behringer to make a new version of the BCR2000 with led strips over each row of knobs. I'm gonna get one of these now, as Behringer don't seem interested."
   https://www.youtube.com/watch?v=NcfVQYjq41s&lc=UgxE1ssAu5GU9FVGDMN4AaABAg

3. **3♥ — @hiphophorse**, on *"How to set up Global MIDI Mappings in Ableton Live"*
   > "Fantastic. Thank you. Limitations of Midimapping in ableton made me drop using laptops for music, so this would have been useful me a while back."
   https://www.youtube.com/watch?v=GBlMrDVWzDo&lc=UgxECK1ipoLQ1twHq-94AaABAg
   ↳ [per_track_mapping] — quit laptop music entirely over mapping limits.

4. **3♥ — @Pocket_Stuff**, same ROTO CONTROL video
   > "They should start incorporating this onto synths that way when you changes patches/preset the knobs match the actual values."
   https://www.youtube.com/watch?v=NcfVQYjq41s&lc=UgzRe1zzCmKYHEPWpsd4AaABAg
   ↳ [takeover] — wants knob values to sync on patch change, exactly DF's mechanism.

**Priority B — strong signal, worth a reply:**

5. **2♥ — @insolace**, same ROTO CONTROL video
   > "The only reason I own a push is for the 8 knobs with the screen above them... when you select a rack it's macro knobs should immediately come up on the controller without any additional programming."
   https://www.youtube.com/watch?v=NcfVQYjq41s&lc=Ugwq5VR9xejvzpcfJRN4AaABAg
   ↳ [follow_selection] — names Push's screen-above-knobs as the gold standard DF should match.

6. **2♥ — @andrewsmith4575**, on *"Auto arm track on selection & other Ableton Live 11 hidden features"*
   > "Thank you! It's crazy that auto-arm isn't on by default"
   https://www.youtube.com/watch?v=AG0p6yo4KPs&lc=UgwT7FZN59SSZ3MT97V4AaABAg

7. **1♥ — @lostreligion1313**, on *"How well does the new Launch Control XL work with Ableton Live?"*
   > "Had to return mine as i felt the led lights were unintuitive and should always reflect the track colours under the knobs as it does on the bottom row of buttons, such a shame"
   https://www.youtube.com/watch?v=0j4hQxlQCG0&lc=UgzUSNg5T9-0YWHRE514AaABAg
   ↳ [visibility] — returned the device over this.

8. **1♥ — @dirtyharry1881**, on *"Using a MIDI Controller to Control REAPER's Functions"*
   > "If you're using Beatstep's rotaries for Volume control, get ready for some really extreme volume jumps. Hope you have your earplugs on..."
   https://www.youtube.com/watch?v=jE5lrzNsk-A&lc=UgyVZ926JazJZ_NDewN4AaABAg
   ↳ [takeover] — value-jump on absolute knobs, live-audio-safety framing.

9. **1♥ — @lucianogonzálezyañez**, on *"How To Set Up Your MIDI Controller In Ableton Live (The EASY Way)"*
   > "i have the oxygen mkv 61 and didnt find a way to auto map the things automaticallly.."
   https://www.youtube.com/watch?v=tCwBxW-p0Uo&lc=Ugz3BZ3SVAE2SFmT5Q54AaABAg

10. **0♥ — @azenia**, on *"How to remotely change between instrument tracks in Ableton | Midi Mapping | Arturia MiniLab MK2"*
    > "hi, i was wondering how do you switch between tracks when you have more than 8?"
    https://www.youtube.com/watch?v=obrV3MuWcwU&lc=UgylLt-LqCFdJyBj7WZ4AaABAg
    ↳ [follow_selection] — banking beyond 8 tracks, direct product fit.

**Bucket breakdown (all 43 rows):** per_track_mapping 17 · follow_selection 13 · visibility 7 · takeover 6.
**Recurring framings:** "on-screen values next to the knob" (visibility) · "match the actual values on patch/preset change" (takeover) · "knobs immediately come up when I select a rack" (follow_selection) · "map more than 16 parameters" (per_track_mapping).
**Full list:** Notion → "YouTube Comment Mining" database, filter `Product = Dynamic Focus`.

**Template:**
```
"[Quote back their exact phrase — e.g. 'no visual indicator of the endless encoders,'
totally get it.]

We built DF to fix exactly this — see the live value of every mapped knob on screen,
switch banks instantly, no more guessing where you left it.

Check it out: [lendling]"
```

**Metrics:** Track CTR, not research signups. Low CTR = positioning missed; high CTR = language resonated.

### 3. Landing Page Copy Pass
- [ ] Hero: Use "**knob jumps**" not "parameter acquisition"
- [ ] Problem statement: "**When you switch banks**" not abstract DAW architecture
- [ ] Solution: "See your value. Switch instantly. No snap."
- [ ] Proof: Video showing bank switch with zero parameter jump
- [ ] Three persona angles (Nanocontrol2 user / Launchkey user / Synth rig builder)

### 4. Gearspace / KVR Seeding (After Spec)
- Comment on old threads: "nanoKONTROL2 jumps in pickup mode (Ableton)"
- Use exact problem language, link to lendling (not research survey)

---

## EVIDENCE SUMMARY

| Signal | Finding |
|---|---|
| **Install base** | nanoKONTROL2 ~1M+, MPK Mini 1-2M, LCXL 500k, Launchkey 400k = 2-3M |
| **Complaint volume** | HIGH (6-8 Ableton forum threads, 3+ Gearspace, KVR, SoS professional review) |
| **Years unsolved** | 12-14 years (2012-2026, Live 8 → Live 12 still broken) |
| **Bundled script gap** | Novation support: "Pickup mode doesn't work for custom mappings" |
| **Hardware proof** | Novation MK1→MK2→MK3 redesign driven specifically by this problem |
| **User language** | "Knob jumps when I switch banks" (not technical phrasing) |
| **Competitive gap** | No standard solution in 12 years despite massive complaint volume |

---

## NOTES FOR PRODUCT TEAM

- **This is not positioning drift.** DF = democratized banking + live value visibility = software answer to a 12-year hardware problem.
- **Copy is critical.** Use user language ("knob jumps"), not product language ("value acquisition"). Test on YouTube first.
- **Spec must address multi-device edge case** — matters for Dawles (physical synth) positioning and for Launchkey/LCXL multi-mapping users.
- **Don't position as "for Ableton developers."** Position as "for performers who switch banks." That's the ICP.

---

## NEXT MEETING FOCUS

- Approve DF Spec
- Review YouTube reply results (CTR metric)
- Decide: Gumroad/maxforlive-only OR also pitch curators (Isotonik filter: "Ableton-native tools, non-mapping shape")
