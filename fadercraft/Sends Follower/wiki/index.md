# Sends Follower — Wiki

Sends Follower is a standalone Max for Live audio-effect device. This wiki is the home for its
technical reference. It is a separate project, unrelated to the Instrument Follower device.

## Entities

- [[entities/sends-follower-device|Sends Follower device]] — main technical reference: purpose,
  placement, I/O, parameters, signal flow, limitations.
- [[entities/embedded-multimap-panel|Embedded multi-map panel]] — the right-half mapping panel, the
  proven `multimap.maxpat` + `MapButton.maxpat` embedded whole from LFO Plus and fed by the follow
  signal (replaced the in-house frame 2026-06-19); status table, wiring, runtime files.

## Concepts

- [[concepts/send-gathering-via-liveapi|Send gathering via LiveAPI]] — how the embedded JavaScript
  collects every track's send to this return and outputs the maximum.
- [[concepts/self-healing-return-index|Self-healing return-index detection]] — how the device finds
  which return track it sits on, both through the patch and inside the JavaScript.
- [[concepts/live-remote-modulation-chain|live.remote~ modulation chain]] — the native modulation
  output that writes the follow value into a downstream device parameter.
- [[concepts/map-button|Mapper (8-slot direct parameter mapping)]] — **SUPERSEDED 2026-06-19**:
  describes the prior in-house 8-slot mapping frame. The on-disk device now embeds the LFO Plus
  `multimap.maxpat` panel instead — see [[entities/embedded-multimap-panel|Embedded multi-map panel]].
  Kept for the history of the native `live.map` → `live.remote~` mechanism.
- [[concepts/stock-multimap-visual-spec|Stock multi-map visual spec]] — **SUPERSEDED 2026-06-19**:
  pixel reference for the in-house stock-look frame. The shipping right half is now the embedded LFO
  Plus panel; this remains as the visual target the in-house frame chased.
- [[concepts/lfoplus-mapbutton-recipe|LFO Plus Map-button recipe]] — read-only reverse-engineering of
  the LFO Plus device's Map-button blink + state machine (`qmetro 200` → toggle → orange text-alpha
  pulse, state-aware restore); the technique the shipping device's Map-button blink now uses.
- [[concepts/internal-buses|Internal send/receive buses]] — the named `---max_send` and
  `---max_send_percent` buses and where each value goes.
- [[concepts/adg-rack-wrapper|Audio Effect Rack wrapper]] — the `SendsFollowerRack.adg` preset that
  bundles the device with a stock LFO.
- [[concepts/version-check|Version check (update notifier)]] — the `sf_version_check.js` ping that
  lights a mint "New Version" button when an update is published; mirrored from Control XL.
- [[concepts/known-behaviors|Known behaviors (by design)]] — intentional/inherent behaviors that
  should not be re-reported as bugs; currently the Total-mode 1.0 latch in the self-feeding loop case.
- [[concepts/performance|Performance — CPU profiling findings]] — the devices are not the CPU
  bottleneck (idle floor is Live's own GUI/FramePacing); the 50 Hz `outlet("max")` poll was
  change-gated; Live-side levers for the idle floor.

## Planning

- [[roadmap|Roadmap]] — released features and backlog.

## Logs

- [[log|Change log]]
