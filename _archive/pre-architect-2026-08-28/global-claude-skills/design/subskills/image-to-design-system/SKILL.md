---
name: image-to-design-system
description: Turn a flat screenshot, JPEG, PNG, or mockup into a real design system (DTCG tokens + component specs + code) by scaffolding the third-party ux-ui-agent-skills kit into the current project on demand.
---

# Image to Design System

Router skill. Does not do the extraction itself — bootstraps `ux-ui-agent-skills`
(https://github.com/plugin87/ux-ui-agent-skills, MIT, npm) into whatever project
the user is currently working in, then hands off to its `image-to-code` skill.

This is installed globally but must never touch a project silently. Only act
when the user has actually handed you an image and asked for a design system,
tokens, or components extracted from it.

## Before You Start

Confirm:
- there is an actual reference image (screenshot/JPEG/PNG/mockup) to work from
- which project directory this should land in (default: the current repo root)

## Workflow

1. **Check for an existing install** in the target project root:
   ```bash
   ls .claude/skills/image-to-code 2>/dev/null
   ```
   If present, skip straight to step 4.

2. **Check for conflicts before writing anything.** The kit's `init` drops
   `CLAUDE.md`, `CONTEXT.md`, `tokens/`, `components/`, `taste/`,
   `accessibility/`, `frameworks/`, `design-systems/`, `content/`,
   `workflows/`, `scripts/`, `.claude/skills/*`, `.claude/commands/` into the
   project root. Run a dry run first and inspect it:
   ```bash
   npx ux-ui-agent-skills init --dry
   ```
   If the project already has its own `CLAUDE.md` or any of those top-level
   folders with unrelated content (common in this user's repos), **stop and
   ask** whether to rename/merge instead of overwriting. Never pass `--force`
   without explicit confirmation.

3. **Scaffold it**, once conflicts are resolved:
   ```bash
   npx ux-ui-agent-skills init
   ```
   (or `npx ux-ui-agent-skills add tokens taste design-systems components
   accessibility frameworks` plus the skills dir, if the user wants a lighter
   footprint than the full kit — check `npx ux-ui-agent-skills list` for area
   names.)

4. **Hand off to the kit's own skill**: read
   `.claude/skills/image-to-code/SKILL.md` in the project and follow it with
   the user's reference image — infer palette/type/spacing/radius/layout,
   build the 3-tier DTCG token theme, then component specs via
   `design-component`, then code via `design-code` if the user wants
   implementation, not just the system.

5. Report what was generated and where (token JSON/CSS paths, component spec
   paths) — don't just say "done."

## Boundaries

- Do not run `init --force` over an existing unrelated project without
  explicit user confirmation — it can clobber the project's own `CLAUDE.md`.
- Do not claim pixel-perfect reproduction — this matches the design
  *language* (palette, type scale, spacing, radius, layout archetype), not a
  literal copy. Never lift copyrighted photography/logos/copy from the
  reference.
- This is third-party, unvetted-by-Anthropic code (scripts run with agent
  permissions) — skim `.claude/skills/*/SKILL.md` and `scripts/` in the kit
  before first use in a given project if the user wants an extra safety pass.
