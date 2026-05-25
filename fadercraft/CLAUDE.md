# Fadercraft — project entry-point

**Project**: Fadercraft — umbrella brand of Max for Live utilities for Ableton-based performance with MIDI controllers. Flagship product: **Control XL** (legacy name `XL_Performance.amxd`), an M4L device for Novation Launch Control XL MK3.

## Source of truth

- **Figma**: `OdPRdjodGO3WiR6tgSP7AA` (file `Novation XL`, to be renamed `Control XL`). Workboard for in-progress layouts: page `Content`, frame `1434:6869`.
- **Wiki / planning**: `~/Brain/fadercraft/wiki/` — `landing-narrative.md`, `design-system.md`, `roadmap.md`, `payment-rails.md`, entity pages.
- **Code workspace** (separate machine path): `~/Projects/Claude/Fadercraft/` — React + Vite landing, design-system parity. No code lives in `~/Brain/`.
- **Gumroad**: store handle `fadercraft`. Domain: `fadercraft.com`.

## Memory map

See `memory/MEMORY.md` for the full index. Subfolders:
- `tokens/` — colors, typography, density, foundations
- `components/` — Figma + React inventory
- `decisions/` — naming, structural calls
- `product/` — glossary, tone-of-voice
- `patterns/` — reusable patterns (empty)
- `wiki-workflow.md` — wiki linting and structure conventions
- `questions.md` — open questions & tech debt (read before any task)

## Roles in use

- **ux-ui-designer** — Figma operations, design-system parity, layout decisions. Memory: `.claude/agent-memory/ux-ui-designer/`.
- **copywriter** — narrative, ToV, landing copy, FAQ. Memory: `.claude/agent-memory/copywriter/`.

## Project-specific rules

- **All copy on site, in mockups, and in docs — English only.** No Cyrillic in UI. Chat replies — Russian.
- **Brand naming**: `Fadercraft` (brand), `Control XL` (product). Legacy `XL_Performance` — internal only, not in new comms.
- **Density tokens** — Figma name: number with comma (`0,25`, `12,5`). CSS name: number with dash (`--0-25`, `--12-5`). No prefixes, no `space-` layer.
- **After editing any English doc**: run Vale + LanguageTool.
- **Copy edits**: show variants in chat (red=before, green=after) before applying to files or Figma. See `~/.claude/projects/-Users-Kirill-Brain/memory/feedback_copy_variants_before_edit.md`.

## Globals this project overrides

None currently. Beefy DS exception (`project_beefy_no_text_styles.md`) does **not** apply here — Fadercraft DS uses Text Styles normally.
