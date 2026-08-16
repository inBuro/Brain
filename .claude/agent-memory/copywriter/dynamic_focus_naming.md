---
name: dynamic-focus-naming
description: Dynamic Focus is the confirmed final product name — "Mapping Deck" rename was reverted 2026-08-06; comment-miner DB still has 33 rows tagged "Mapping Deck" pending tag cleanup
metadata:
  type: project
---

# Dynamic Focus — Naming Status

**Current name: Dynamic Focus** (confirmed final, 2026-08-06 — product-owner decision)

**Why:** "Mapping Deck" was briefly considered as the final name (noted in earlier project memory as "final name"). That decision was reversed. The product reverts to "Dynamic Focus" permanently.

**How to apply:** All copy, product descriptions, community replies, and marketing materials use "Dynamic Focus" — never "Mapping Deck". If you encounter "Mapping Deck" anywhere in copy or marketing context, replace immediately.

## Comment-miner DB — RESOLVED 2026-08-06

The Notion YouTube comment-miner DB (`39255889-1bb0-818f-ae1c-cd5d93a94041`) originally had 33 rows with `Product = "Mapping Deck"`.

**Session 1 (2026-08-06, earlier):** 4 rows retagged to Dynamic Focus (per-track isolation fit). 29 remained.

**Session 2 (2026-08-06, copywriter-agent):** Kirill confirmed his editorial framework — per-instrument/per-track persistence is the RIGHT architecture; a monolithic per-set persistent map is a bad engineering idea. DF solves the real underlying need through per-track focus, not per-session mapping.

Of the 29 remaining rows, **26 retagged to Dynamic Focus**. 3 left as Mapping Deck (not a honest fit):
- Row with comment "not happy with '1 track at a time' paradigm" — direct conflict with DF's core mechanism
- Row asking for simultaneous multi-track fader control (mixer-style) — DF intentionally does NOT do this
- Row asking about Min/Max tempo range (global param) — DF not applicable; DF URL removed from that answer

**Current state:** 4 + 26 = 30 rows carry `Product="Dynamic Focus"` and flow through yt-reply-post.py. 3 rows remain `Product="Mapping Deck"` and are blocked; can be set to Status=Ignore when convenient.

**Product enum in worker:** the worker product enum still includes "Mapping Deck" — separate task per `feedback_product_tag_iron_rule.md`. Don't modify worker code here; those 3 rows being blocked is acceptable until enum is cleaned up.

## Voice fixes applied (cumulative)

| Session | Fix |
|---------|-----|
| 2026-08-06 S1 | "takes that approach" → "takes a different approach" (2 rows) |
| 2026-08-06 S1 | DF plug after Exclusive Arm answer removed (no logical connection) |
| 2026-08-06 S2 | DF URL removed from BPM/tempo answer (global param ≠ per-track) |
| 2026-08-06 S2 | Row 28 (Oxygen auto-mapping) unarchived before retag (was archived)
