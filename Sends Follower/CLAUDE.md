# Sends Follower — project rules

Standalone project for the **Sends Follower** Max for Live device. Separate from and unrelated to the
Instrument Follower project; do not merge the two.

## Folder structure

```
raw/          -- the device + any source artifacts (treat as immutable inputs)
wiki/         -- markdown technical reference maintained by Claude
wiki/index.md -- flat table of contents
wiki/log.md   -- append-only record of operations
```

## Rules

- All docs in **English** (no Cyrillic in the wiki). After editing English docs, run Vale +
  LanguageTool (config in `.vale.ini`) and fix genuine flags.
- Ground every technical claim in what is actually read from the patch/JS; cite the patcher object
  id or LiveAPI path. Mark anything unverified as needs-verification rather than guessing.
- `.amxd` analysis/edits go through the **m4l-master** subagent (it owns the `.amxd` format recipe).
  Editing the device requires a dated pre-edit backup — never overwrite an archive.
- Keep wiki page names lowercase-with-hyphens. Update `wiki/index.md` and `wiki/log.md` after changes.
