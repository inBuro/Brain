# Discord server setup

**Summary**: Step-by-step setup spec for the Fadercraft Discord community server. All copy below is final and ready to paste — no decisions left open. Linked from T14 in [[roadmap]].

**Sources**: T14 direction block in [[roadmap]]; brand assets in `app/public/` and `app/src/assets/brand/`; brand voice from `brand/brief.md` and `brand/colors.md`.

**Last updated**: 2026-05-26

---

## Server settings

| Setting | Value |
|---|---|
| Server name | `Fadercraft` |
| Region | Auto |
| Server icon | `app/public/icon-512.png` (512×512 PNG, ready) |
| Server banner | 960×540 PNG — **pending sub-task**, not blocking |
| AFK channel | none |
| System messages channel | `#general` |
| Default notifications | Only @mentions |
| Verification level | Low (verified email required on member accounts) |
| Explicit content filter | Scan messages from members without a role |

## Community settings

Server Settings → **Enable Community** → run the wizard:

- Rules channel target: `#rules`
- Community Updates channel target: `#server-updates` (private, owner-only — must exist before running wizard)
- 2FA requirement for moderation: ON (founder account already has 2FA)

## Role structure

Create in this order:

| Role | Color | Hoist | Permissions | Assignment |
|---|---|---|---|---|
| `@Founder` | `#63F2CA` (mint) | Yes | Administrator | You (kbbureau) |
| `@Verified Owner` | `#FFAD56` (amber) | Yes | Default + post in all community/support channels | Manual by `@Founder` after license-key check (Phase 1: auto via Gumroad webhook + bot) |
| `@everyone` (Member) | none | No | Discord default minus posting in `#welcome`, `#rules`, `#announcements` | Auto on join |

## Channel structure

```
📌 INFO
  #welcome           — pinned welcome, read-only
  #rules             — pinned rules, read-only
  #announcements     — releases, patches; @Founder posts only

💬 COMMUNITY
  #general           — open chat
  #show-and-tell     — videos, sets, screenshots
  #custom-modes      — share .syx Custom Modes for LCXL MK3

🛠 SUPPORT
  #support           — install / MIDI routing / "it doesn't work"
  #bug-reports       — reproducible bugs (see topic)
  #feature-requests  — wishes, one per post

🔒 ADMIN (private, @Founder only)
  #server-updates    — Discord Community Updates target
```

### Channel topics (paste into Edit Channel → Topic)

- `#welcome` — Start here. Read #rules, say hi in #general.
- `#rules` — Community guidelines. Read before posting.
- `#announcements` — Releases, patches, news from Fadercraft. Read-only.
- `#general` — Open chat about Fadercraft tools, Ableton, Launch Control XL, performance setups.
- `#show-and-tell` — Share videos, screenshots, sets that use Fadercraft tools. No promo of unrelated products.
- `#custom-modes` — Share and request .syx Custom Modes for LCXL MK3. Include a short description of what each mode does.
- `#support` — Stuck? Ask here. Include Live version, OS, Fadercraft device version, MIDI routing screenshot.
- `#bug-reports` — Format: [Device + version] | [Live version + OS] | What you did | What happened | What you expected | (optional) screen recording.
- `#feature-requests` — One feature per post. Explain the use case, not just the feature.
- `#server-updates` — Discord Community Updates target. Owner only.

## Pinned welcome message (post in `#welcome`)

```
Welcome to Fadercraft.

This is the community for performers using Fadercraft tools — starting with
XL_Performance for the Novation Launch Control XL MK3.

Start here:
• Read #rules
• Say hi in #general
• Own XL_Performance? DM your Gumroad license key to get the @Verified Owner role.
• Share what you build in #show-and-tell
• Stuck? #support
• Bug? #bug-reports
• Wish? #feature-requests
```

When pasting, type `#` in the compose box and pick each channel from the popup so Discord turns it into a real channel mention.

## Rules (post in `#rules`)

```
**1. Be respectful.** No harassment, slurs, or bad-faith argument.

**2. No piracy.** Do not share `.amxd` files, license keys, cracked Live builds,
or paid Custom Modes from other vendors. Free `.syx` Custom Modes
(including ours at fadercraft.com/free-custom-modes) are fine.

**3. Stay on-topic per channel.** Custom Modes → #custom-modes. Bugs → #bug-reports.
General music chat → #general.

**4. No spam, no off-topic promotion.** Showing your own music, sets, or videos
that use Fadercraft tools is welcome.

**5. English in public channels** so the whole community can follow.
DMs are your own business.

**6. Bug-report format:** Live version, OS, Fadercraft device version,
steps to reproduce. If you skip these, expect to be asked.

Breaking these gets a warning, then a timeout, then a ban.
Founder is final arbiter.
```

## First `#announcements` post (post at v1.0 launch — sync with T13)

```
**Fadercraft XL_Performance v1.0 is live.**

Six controls per track instead of two — pre-fader send, post-fader send,
mute, solo, send return, cue — all driven from the Launch Control XL MK3.
Plus Solo Follower, cross-mode transit, and performance-oriented mode switching.

Grab it: https://fadercraft.gumroad.com/l/xl-performance
Free Custom Modes (works with any LCXL MK3, no purchase needed):
https://fadercraft.com/free-custom-modes
Quickstart + Live set + docs in the bundle.

Owners: drop your license key in this thread or DM me — I'll add
the @Verified Owner role.

Bug? #bug-reports. Wish? #feature-requests.
```

## Permanent invite link

Server Settings → **Invites** → "Create Invite link" (top-right of the Invites tab):

- Expire after: **Never**
- Max number of uses: **No limit**
- Grant temporary membership: **OFF**

Result format: `https://discord.gg/XXXXXXX`. Hand the link back so it can be wired into:

- `app/src/components/organisms/FooterFull/FooterFull.tsx` (DC href)
- `dist/Quickstart.md` Support section (after T10 lands)
- Gumroad product description (you paste — Gumroad is a logged-in surface)

## Execution order (for the Discord client)

1. Confirm 2FA on founder Discord account (Settings → My Account → Enable Two-Factor Auth).
2. Create server: Add Server → Create My Own → For me and my friends → name **Fadercraft**.
3. Upload server icon (`app/public/icon-512.png`).
4. Create roles per table above (Server Settings → Roles).
5. Create categories + channels per the structure block.
6. Set channel topics (one paste each).
7. For `#welcome`, `#rules`, `#announcements`: Edit Channel → Permissions → @everyone → "Send Messages" = ✗.
8. For `#server-updates`: Edit Channel → Permissions → @everyone → View Channel = ✗ (private).
9. Server Settings → Enable Community → wizard → point at `#rules` and `#server-updates`.
10. Post the welcome message in `#welcome`, pin it.
11. Post the rules in `#rules`, pin it.
12. Generate permanent invite link, save it.
13. Hand the invite link back to Claude → footer + Quickstart wiring.
14. **Do not** post the first `#announcements` message yet — it ships with v1.0 launch (T13).

## Banner sub-task (pending, non-blocking)

Spec for 960×540 PNG (Discord server banner):

- Background: brand dark (same as site `--bg`, see `brand/colors.md`)
- Center: Fadercraft wordmark + tagline "Max for Live tools that turn your controller into an instrument."
- Optional: schematic LCXL on the right at ~30% opacity (reusable from `Product gallery – 1` Figma artboard, same source used for OG image)
- Output: `app/public/discord-banner.png`

Discord shows a wordmark text fallback if no banner is set, so the server can launch without it.

## Related pages

- [[roadmap]] — T14 Discord community
- [[payment-rails]] — Gumroad license-key flow that gates `@Verified Owner` (Phase 1 auto-assign)
- [[Custom Mode SysEx Layout]] — `.syx` format shared in `#custom-modes`
