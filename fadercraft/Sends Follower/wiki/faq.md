# Sends Follower — FAQ

**Summary**: Practical questions that come up while mapping and editing the Sends Follower
devices — persistence, undo behaviour, and why device edits need a full Live restart.

**Last updated**: 2026-07-03

---

## Do I have to save after mapping?

Yes. Slot bindings and their Min/Max ranges are stored inside the Live Set and held in memory
until you save. Press **Cmd+S** after mapping. If Live is quit or restarted (Cmd+Q) without saving,
every unsaved mapping reverts to the last saved state — the panel comes back empty/default.

This bit us repeatedly during development: mappings written programmatically (via AbletonMCP) were
lost on the next full restart because the Set had not been saved in between. Rule: **map → Cmd+S**,
before any restart.

## How does Undo (Cmd+Z) interact with mapping changes?

Every individual change is its own undo step — one mapped slot, one range tweak, one device
add/remove = one Cmd+Z each. They are **not** grouped into a single undo block.

- One **Cmd+Z** reverts only the single most recent change (e.g. the last device you deleted).
- Repeated Cmd+Z walks back one change at a time and can unwind an entire mapping session — so do
  not mash it; press it once for a targeted undo, then stop. **Cmd+Shift+Z** redoes.
- Once you **Cmd+S**, the mappings live in the file independently of the undo stack and are safe
  from an accidental undo.

## I edited the device (.maxpat / .js) but Live still shows the old behaviour — why?

Sends Follower's panel (`multimap.maxpat`) and its JavaScript (`sends_follower.js` /
`sends_follower_track.js`) are cached by Live/Max for the whole session. Removing the device from a
track and dragging it back is **not** enough to reload them.

- A **full quit and relaunch of Live (Cmd+Q → reopen)** is required to load edited `.maxpat`/`.js`.
- If the file is open in the Max editor, close it **without saving** first (Cmd+W → Don't Save),
  otherwise the in-memory version overwrites the on-disk edit and reverts it.

## Why does the send-follow menu (SF-Track) not list a return I added?

The `send_menu` is rebuilt at runtime to list `Manual` plus every return, and (since 2026-07-03) it
also pushes the parameter range so all returns — including ones added after the device was placed —
are selectable. If a newly added return does not appear, do a full Live restart so the updated
device JavaScript is loaded.

## Related pages

- [[concepts/known-behaviors]] — intentional/inherent behaviours that are not bugs.
- [[concepts/performance]] — CPU profiling findings.
- [[roadmap]] — released features and backlog.
