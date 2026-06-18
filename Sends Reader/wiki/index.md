# Sends Reader — Wiki

Sends Reader is a standalone Max for Live audio-effect device — a fork of Sends Follower with
inverted semantics. This wiki is the home for its technical reference. It is a separate product,
unrelated to the Instrument Follower device.

## Entities

- [[entities/sends-reader-device|Sends Reader device]] — main technical reference: purpose, placement,
  host-type detection, the Send dropdown, the read path, the 8-slot mapper, anti-feedback, I/O,
  limitations, and open items.

## Relationship to Sends Follower

Sends Reader was forked from the current on-disk Sends Follower patcher. The reused machinery
(observer self-healing, 8-slot native-`live.map` mapper, version-check notifier, cold-load
defer/retry) is documented in the [[../../Sends Follower/wiki/index|Sends Follower wiki]]; this wiki
covers only what differs in Sends Reader (the read path, host detection, the Send dropdown,
anti-feedback).

## Logs

- [[log|Change log]]
