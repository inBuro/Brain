# Sends Follower device

Source analyzed: the Sends Follower device patcher (object IDs in parentheses are patcher box IDs).
The object-level analysis below covers the **core** patcher (50 boxes / 51 lines); the shipped User
Library device is the frozen build with the update notifier added on top, described in the update note
below.

> Update 2026-06-19 (right frame → embedded LFO Plus multi-map panel): the self-made right frame was
> removed and replaced by the **proven `multimap.maxpat` panel embedded whole from the free LFO Plus
> device** (used with permission), fed by Sends Follower's own follow signal. md5 `a1c060f8`,
> **63 boxes / 61 lines**, 282087 bytes. The right half is now a single `bpatcher` (`multimap_panel`,
> `name multimap.maxpat`) in presentation at `[128, 0, 204, 163]` — **7** mapping rows (LFO Plus ships
> 7, not 8) with Parameter / Min / Max. Map/blink/range/unmap are all handled inside the imported
> `MapButton.maxpat` (the proven LFO Plus state machine), not our own objects. Source for every slot:
> `receive ---max_send` (`obj-7`, 0–1, **branched** — still feeds the dial) → `sig~` (`mm_sig`) →
> bpatcher inlet → 7× `MapButton` → `clip~ 0. 1.` → Min/Max → `live.remote~`. Five files embedded in
> the freeze (`multimap.maxpat` `657fa074`, `MapButton.maxpat` `50975cdc`, `multimap-closed-off.svg`
> `d1c2fffd`, `multimap-open-off.svg` `a7f47192`, `multimap-unmap.svg` `1a31f546`), self-contained for
> the buyer. The tracking JS (`sends_follower.js` `53bdbfbd`), `sf_version_check.js` (`a5d905fc`), and
> the left half (dial, Peak/Total, "New Version") are byte-identical / untouched. **Status: built and on
> disk, awaiting founder hardware test.** Supersedes the in-house frame below. See
> [[embedded-multimap-panel|Embedded multi-map panel]] and the 2026-06-19 log entry.
>
> Update 2026-06-19 (right-frame → stock multi-map look, Remote-only): the shipped User Library device
> now carries the founder-approved **MM-Native stock frame** in place of the older 8-slot mapper UI.
> md5 `2bbc12eebc1f8914c280f67a62e61117`, 218 boxes / 268 lines, 192221 bytes, openrect width 332 → 304.
> The right half is now an 8-row table styled like Live's stock multi-map panel — one dark LCD panel,
> headers **Parameter / Min / Max**, a grey **Map** button per row that turns into the mapped target's
> name in orange (no orange idle frame), an SVG unmap **X** that appears only when mapped, and orange
> **%** Min/Max number boxes. The mapping engine is unchanged in mechanism (native `live.map @strict 1`
> → `live.remote~` with Min/Max scaling) but is now **Remote-only**: the per-slot Mod path
> (`live.modulate~`), the ±/Depth controls, the per-slot Remote/Mod toggle, and the standalone LFO leg
> (`obj-11`) were all removed. The source for every slot is the existing follow value on
> `receive ---max_send` (0–1), scaled into each slot's [Min/100 .. Max/100]. The name now appears in the
> button via `live.text` (both outlets of `substitute <none> Map` → `tosymbol` → `text $1, texton $1`),
> not the old comment overlay. The tracking JS (`sends_follower.js`, `53bdbfbd`), `sf_version_check.js`
> (`a5d905fc`), and the unmap SVG (`1a31f546`) are byte-identical — follow, Peak/Total, percent monitor,
> and the dial display are untouched. **Status: built and on disk, awaiting founder hardware test.** See
> [[../concepts/stock-multimap-visual-spec\|Stock multi-map visual spec]] and the log entry for 2026-06-19.
>
> Update 2026-06-18 (Map button): the shipped User Library device now adds a front-panel **Map**
> button — 82 boxes / 85 lines, 68498 bytes, md5 `6f156eab973ecec0d9793f794c75cfce`, two embedded JS
> resources (`sends_follower.js` 22368 bytes with the return-index observers **and** the map
> subsystem, `sf_version_check.js` 3106 bytes unchanged), self-contained (no external `.js` needed;
> the unmap icon is a built-in Max package asset referenced by name, not embedded). The Map button maps
> Sends Follower's own bipolar follow signal directly onto any Live parameter you click, via a
> **second** `live.remote~` — additive, the LFO leg (`obj-11`) is untouched. See
> [[../concepts/map-button\|Map button]] and the log entry for 2026-06-18 (Map button).
>
> Update 2026-06-18 (Mode relabel): the prior frozen build (md5
> `5a8ba853a3c31d80cb84870e977a13f4`, 66 boxes / 65 lines, 49134 bytes) added the **Mode (Peak /
> Total) switch** with the update notifier. The cosmetic pass renamed the switch labels from Max / Sum
> to **Peak / Total**, renamed the parameter from "Follow Mode" to **"Mode"**, and added a **"Mode"**
> comment label above the switch; the index-to-behavior mapping is unchanged (Peak = old Max, Total =
> old Sum). See [[../concepts/version-check\|Version check]] and the Follow Mode section below.

## Status

| Aspect | Status | Notes |
|---|---|---|
| Reads follow level toward its return | Works | Computed by the embedded JS (`obj-46`); algorithm selectable Peak / Total, see [[../concepts/send-gathering-via-liveapi\|Send gathering]] |
| Mode switch (Peak / Total) | Works (added 2026-06-17, relabelled 2026-06-18) | `live.tab` (`follow_mode`) selects Peak (max-of-sends) or Total (sum-of-sends clamped to 1.0); saved with set + preset, default Peak — see the Follow Mode section |
| Self-detects which return it sits on | Works | Patch path chain and a JS fallback, see [[../concepts/self-healing-return-index\|Self-healing]] |
| Writes follow value to a downstream parameter via modulation | Works (signed offset to the LFO's **Offset** parameter, founder-confirmed 2026-06-17) | `live.remote~` (`obj-11`) applies a **bipolar/signed offset** to the stock LFO's **Offset** parameter (`devices 1 parameters 5`). Both the signed-offset character and the exact target are confirmed — see Limitations for the positional usage caveat |
| Maps the follow value to any Live parameter (embedded LFO Plus panel) | Built 2026-06-19 (LFO Plus `multimap.maxpat` embedded whole), **needs hardware test** | A **7**-row multi-map panel imported verbatim from LFO Plus. Each row: click **Map**, then click any parameter of any device — its name appears in the button; the follow value (`receive ---max_send` → `sig~`, 0–1 signal) drives the target scaled into that row's [**Min** .. **Max**] %; the **X** unmaps. Map/blink/range/unmap all live inside the imported `MapButton.maxpat` (`live.map` → `live.remote~`). Replaces the prior in-house frame. See the 2026-06-19 update note and [[embedded-multimap-panel\|Embedded multi-map panel]] |
| Exposes follow value on internal buses | Works | `---max_send` and `---max_send_percent`, see [[../concepts/internal-buses\|Internal buses]] |
| Embedded JavaScript shipped inside the device | Yes (frozen 2026-06-16) | `sends_follower.js` is now embedded in the frozen container, byte-identical to the Archive copy — see Limitations |
| Update notifier ("New Version" button) | Works (frozen 2026-06-17) | `node.script sf_version_check.js` pings the manifest; mint button shows only when an update exists — see [[../concepts/version-check\|Version check]] |
| Front-panel parameter exposed to Live | Partial | The dial (`obj-3`) is a passive meter (`parameter_enable: 0`), but the **Mode** `live.tab` (`follow_mode`) is parameter-enabled and is published as a Live/preset parameter |

## What it does (plain terms)

Sends Follower is meant to sit on a **return track**. It watches the send knobs of every track that
routes to that return, combines those send amounts into a single number via the selected **Mode**
(Peak = the **maximum** of the sends, or Total = their **sum** clamped to 1.0), and turns that into a control
value. The intent is "the more signal the rest of the set is pushing into this return, the more this
value rises" — a one-number summary of how hard the return is being driven.

That follow value is then made available three ways:

1. As a normalized 0.–1. control fed into a native `live.remote~` modulation output that targets the
   **Offset** parameter of the **next device in this return's chain** — the stock LFO
   (`devices 1 parameters 5` = the LFO's Offset, founder-confirmed).
2. On a Max named bus `---max_send` (raw 0.–1. value).
3. On a Max named bus `---max_send_percent` (the value scaled to 0–100).

> Note: the device computes a single follow value. The "what should this drive" question is answered
> by the `live.remote~` target (the stock LFO's **Offset** parameter) and/or by patching from the
> `receive ---max_send` buses. See Limitations for the positional usage caveat on that target.

## Where / when to use it

- **Placement:** on a **return track** (A, B, C, …). The whole concept is "watch the sends that feed
  this return," which only makes sense when the device is on the return those sends point at.
- **Device type:** audio effect (`plugin~`/`plugout~` pass audio straight through, `obj-1` → `obj-2`,
  so the device is audio-transparent and just observes/modulates).
- **Intended pairing:** the shipped [[../concepts/adg-rack-wrapper\|Audio Effect Rack preset]]
  `SendsFollowerRack.adg` places Sends Follower first, then a stock Ableton **LFO** device after it,
  so the follow value can drive the LFO's **Offset** parameter (`devices 1 parameters 5` points at
  the LFO's Offset — founder-confirmed; if you drop a different device into slot 2 the target moves
  with the position, see Limitations).

## I/O

| Port | Object | Direction | Purpose |
|---|---|---|---|
| Audio in/out L+R | `plugin~` (`obj-1`) → `plugout~` (`obj-2`) | pass-through | Audio is untouched; device is a transparent insert |
| LiveAPI read | `js sends_follower.js` (`obj-46`) | in | Reads `value` of each track's send to this return |
| LiveAPI write | `live.remote~` (`obj-11`) | out | Modulates the stock LFO's **Offset** parameter (`devices 1 parameters 5`) on the return chain |
| LiveAPI write | `live.remote~` (`map_remote`) | out | Modulates the **user-mapped** parameter (Map button); same bipolar signal, bypasses the LFO — see [[../concepts/map-button\|Map button]] |
| LiveAPI read | `js sends_follower.js` (`obj-46`) selected-parameter observer | in | Captures `live_set view selected_parameter` while the Map button is armed |
| Named bus out | `send ---max_send` (`obj-50`) | out | Raw follow value (0.–1.) |
| Named bus out | `send ---max_send_percent` (`obj-20`) | out | Follow value as 0–100 |
| Named bus in | `receive ---max_send` (`obj-7`, `obj-12`) | in | Internal consumers of the raw value |

## Parameters

The device exposes **one** Live/preset parameter: **Mode** (`live.tab`, object id `follow_mode`
— the varname is unchanged from when the parameter was named "Follow Mode", enum `Peak` / `Total`,
default `Peak`). It is `parameter_enable: 1`, so it saves with the set and with device presets and can
be automated/mapped. See the Follow Mode section.

A `comment` label reading **"Mode"** (`mode_label`, Arial Bold 9, grey) sits directly above the switch
in the presentation view.

The other front-panel object is a `dial` (`obj-3`) with `parameter_enable: 0` — a passive meter, not a
mapped parameter. It is driven for display only: `receive ---max_send` (`obj-7`) → `* 127.`
(`obj-11_scale`) → `prepend set` (`obj-11_set`) → `dial`. The `prepend set` means the dial is updated
**silently** (set, not output), so it shows the current follow level without re-emitting it.

Two `flonum` boxes (`obj-19`, `obj-49`) are bench/monitor read-outs (one shows the 0–100 percent
value, the other shows the raw 0.–1. value).

## Follow Mode (Peak / Total)

The aggregation algorithm is selectable at runtime via the **Mode** switch (`live.tab`,
`follow_mode`). The labels were Max / Sum until 2026-06-18 and were renamed to Peak / Total; the
index-to-behavior mapping is unchanged.

- **Peak** (index 0, default): the follow value is the single largest send amount among all tracks
  routing to the return — the original behavior.
- **Total** (index 1): the follow value is the **sum** of all send amounts to the return, then
  **clamped to 1.0**. Each send is 0.–1.; the sum is capped at 1.0 so the value stays in the 0.–1.
  range the downstream `scale 0. 1. …` boxes expect and the percent monitor (`---max_send_percent`)
  never exceeds 100%.

Flow: `follow_mode` outlet 0 (the selected index) → `prepend mode` (`mode_prepend`) →
`js sends_follower.js` (`obj-46`) inlet 0, delivering `mode 0` / `mode 1`. The embedded JS keeps a
`followMode` state (defaulting to 0 = Peak) and switches `bang()` between max and clamped-sum
accordingly; the output message keeps its `"max"` label regardless of mode, because the downstream
`route max` / `---max_send` / percent paths key on that word.

The saved value is restored to the JS on load via `loadbang` (`mode_loadbang`) → `delay 300`
(`mode_delay`) → `follow_mode`: banging the tab makes it re-emit its current/saved index, which then
travels the same path to the JS. Because the JS also initializes `followMode` to 0, a late or missing
bang still leaves the device in the default Peak behavior.

## Signal / data flow

Two cooperating subgraphs run in parallel.

### A. Read path — compute the follow value (the JS side)

1. Startup gating: `live.thisdevice` (`obj-21`) and `loadbang` (`obj-22`) → `deferlow` (`obj-23`)
   fans out to three staged delays `delay 50 / 150 / 300` (`obj-24/25/26`). This is the anti-race
   ladder — see [[../concepts/self-healing-return-index\|Self-healing]].
2. The 50 ms branch (`obj-24`) → message `path this_device` (`obj-27`) → `live.path` (`obj-30`).
   The 150 ms branch (`obj-25`) → message `getpath` (`obj-29`) → `live.object` (`obj-31`).
   The 300 ms branch (`obj-26`) → message `1` (`obj-32`) → `qmetro 500` (`obj-33`) → re-issues
   `getpath` periodically (a retry pump while the path is still resolving).
3. `live.object` (`obj-31`) → `route path` (`obj-36`) → `zl.slice 1` (`obj-37`) →
   `route return_tracks` (`obj-38`) → `unpack i s i` (`obj-39`) → `int` (`obj-40`) →
   `change -1` (`obj-41`) → `prepend build` (`obj-42`). This parses the device's own path string and
   extracts the **return-track index**, then sends `build <index>` to the JS.
4. `prepend build` → `t l b b` (`obj-43`). Right-to-left: outlet 2 (`bang`) → message `0` (`obj-45`)
   → `qmetro 500` (`obj-33`) **stops** the resolve pump; outlet 1 (`bang`) → message `1` (`obj-44`)
   → `qmetro 33` (`obj-35`) **starts** the 33 ms poll; outlet 0 (`l`) → the JS (`obj-46`) delivers
   `build <index>`. So once the index is known, the patch stops searching and starts polling.
5. Poll: `qmetro 33` (`obj-35`) bangs `js sends_follower.js` (`obj-46`) ~30×/s. On each bang the JS
   reads every gathered send and outputs `max <value>` — see
   [[../concepts/send-gathering-via-liveapi\|Send gathering via LiveAPI]].
6. JS out → `route max` (`obj-47`) → `change 0.` (`obj-48`) (drops repeats) → both
   `send ---max_send` (`obj-50`) and the monitor `flonum` (`obj-49`).

### B. Write path — turn the follow value into modulation/percent

1. `receive ---max_send` (`obj-12`) → `change 0.` (`obj-13`) → `speedlim 30` (`obj-14`) (rate-limit
   to ~33 ms) → `t f f` (`obj-15`).
2. `t f f` outlet 0 → `scale 0. 1. -100. 100.` (`obj-16`) → `sig~` (`obj-17`) → `live.remote~`
   inlet 0 (`obj-11`). This is the signal that is modulated onto the mapped parameter.
3. `t f f` outlet 1 → `scale 0. 1. 0. 100.` (`obj-18`) → `flonum` (`obj-19`) and
   `send ---max_send_percent` (`obj-20`).
4. The mapping target itself: `delay 300` (`obj-6`, fed by its own `live.thisdevice` `obj-4` →
   `deferlow` `obj-5`) → message `path this_device canonical_parent devices 1 parameters 5`
   (`obj-9`) → `live.path` (`obj-10`) → `live.remote~` inlet 1 (`obj-11`). This binds `live.remote~`
   to that parameter — the stock LFO's **Offset** (`devices 1 parameters 5`, founder-confirmed). See
   [[../concepts/live-remote-modulation-chain\|live.remote~ chain]].

### C. Map leg — drive a user-clicked parameter (added 2026-06-18)

A parallel, additive leg taps the same bipolar signal and drives a user-mapped target with a
**second** `live.remote~`:

1. `scale 0. 1. -100. 100.` (`obj-16`) outlet 0 also feeds `sig~` (`map_sig`) → `live.remote~`
   inlet 0 (`map_remote`). The LFO leg (`obj-11`) is untouched.
2. The Map button (`map_button`, `live.text` toggle) sends `arm 0/1` to the JS (`obj-46`). While
   armed, the JS observes `live_set view selected_parameter`, captures the next clicked parameter's
   path, and emits it on outlet 1 → `route … target_path …` (`map_route`) → `prepend path`
   (`map_pathprep`) → `live.path` (`map_path`) → `live.remote~` inlet 1 (`map_remote`).
3. The captured path is persisted in `pattr map_target` (`map_pattr`) and re-resolved on load via
   `prepend restorepath` (`map_restoreprep`) → the JS. The "X" icon (`map_unmap`) clears it and sends
   `id 0` to `map_remote`. See [[../concepts/map-button\|Map button]] for the full object table.

## Limitations / open questions

- **The embedded JavaScript — resolved 2026-06-16.** The device was previously unfrozen and the
  `js sends_follower.js` script was neither embedded nor on disk next to it, so it failed with
  `js: can't find file sends_follower.js` and produced no follow value. The script has now been
  pulled into the device object and **frozen**: the JS text is embedded in the container (verified
  byte-identical to the `Archive/sends_follower.js` source, 113 lines) and the device loads and runs.
  See [[../concepts/send-gathering-via-liveapi\|Send gathering]] for the script's behavior.
- **Bipolar (signed) modulation is intended — founder-confirmed 2026-06-17.** The `scale 0. 1.
  -100. 100.` box (`obj-16`) maps the 0.–1. follow value onto a **bipolar -100…+100** range, and
  `live.remote~` (`obj-11`) applies that as a **signed offset** to the target parameter. This was
  previously flagged needs-verification; the founder has confirmed it is deliberate. The device
  modulates not only the *amount* but the *direction*: the follow value can push the target both up
  and down around its base value, and into the negative region (a follow value of 0 maps to -100,
  0.5 to 0/no offset, 1 to +100). This is two-directional offset modulation by design, not a unipolar
  0…100 mistake. See [[../concepts/live-remote-modulation-chain\|live.remote~ chain]].
- **The modulation target is the stock LFO's "Offset" parameter — founder-confirmed 2026-06-17.**
  `live.remote~` modulates "the parameter at index 5 of the device at index 1 of this return's device
  chain." `devices 1` is the **second** device in the chain (0-based), i.e. whatever sits right after
  Sends Follower — in the shipped rack that is the stock LFO. `parameters 5` resolves to that LFO's
  **Offset** parameter. The founder built and confirms the device this way: it drives the LFO's
  Offset and nothing else. (The `.adg` alone cannot prove this, because Live stores the parameter
  list alphabetically rather than in LiveAPI index order — but the founder authoritatively confirms
  the runtime target, so this is no longer an open verification item.)
- **Usage caveat: the target is positional.** Because the mapping is addressed by position
  (`devices 1 parameters 5`), it stays on the LFO's Offset only while the LFO is the second device in
  the chain. If you swap, remove, or reorder the device after Sends Follower — or drop in a device
  with fewer than six parameters — the modulation moves to a different parameter/device or fails
  silently. The shipped [[../concepts/adg-rack-wrapper\|rack]] pins the layout (Sends Follower then
  LFO) precisely to keep the target on the LFO's Offset. This is a use-it-correctly caveat, not an
  open question.
- **One mapped Live parameter (Mode).** The only Live-automatable/mappable parameter is the Mode
  `live.tab`. The follow value itself is not exposed as a parameter; consumers must be the
  `live.remote~` modulation target or read `receive ---max_send` / `---max_send_percent`.
- **Aggregation is selectable: Peak or Total (clamped).** Default is the single largest send value
  among all tracks routing to the return (Peak). Total mode adds all send amounts and clamps the total
  to 1.0. Neither mode produces an average. See the Follow Mode section.
- **Polling, not observing.** The value is refreshed by a `qmetro 33` poll (~30 Hz) rather than
  LiveAPI property observers, so it is CPU-cheap but not sample-accurate and has up to ~33 ms latency
  plus the `change`/`speedlim 30` de-duplication.

## Unrelated to Instrument Follower

Sends Follower is a **different, unrelated device** from Instrument Follower. Sends Follower is a
return-track audio effect that reads send levels via LiveAPI and outputs a follow value (max of
sends) into a local modulation/bus. Instrument Follower is a separate device that bridges Live Rack
macros to a Novation Launch Control XL MK3 controller with RGB feedback. They share neither code,
buses, nor purpose; the only thing in common is the word "Follower." This is confirmed by the patcher
contents: Sends Follower contains no controller I/O (`ctlin`/`ctlout`/`midiout`), no SysEx, no RGB or
LCXL references — only audio pass-through, LiveAPI send-reading, `live.remote~`, and two internal
buses.
