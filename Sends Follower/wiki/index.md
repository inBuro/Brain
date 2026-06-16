# Sends Follower — Wiki

Sends Follower is a standalone Max for Live audio-effect device. This wiki is the home for its
technical reference. It is a separate project, unrelated to the Instrument Follower device.

## Entities

- [[entities/sends-follower-device|Sends Follower device]] — main technical reference: purpose,
  placement, I/O, parameters, signal flow, limitations.

## Concepts

- [[concepts/send-gathering-via-liveapi|Send gathering via LiveAPI]] — how the embedded JavaScript
  collects every track's send to this return and outputs the maximum.
- [[concepts/self-healing-return-index|Self-healing return-index detection]] — how the device finds
  which return track it sits on, both through the patch and inside the JavaScript.
- [[concepts/live-remote-modulation-chain|live.remote~ modulation chain]] — the native modulation
  output that writes the follow value into a downstream device parameter.
- [[concepts/internal-buses|Internal send/receive buses]] — the named `---max_send` and
  `---max_send_percent` buses and where each value goes.
- [[concepts/adg-rack-wrapper|Audio Effect Rack wrapper]] — the `MaxSendsFollower.adg` preset that
  bundles the device with a stock LFO.

## Logs

- [[log|Change log]]
