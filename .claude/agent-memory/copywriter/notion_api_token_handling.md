# Notion API token handling — never split read and use across Bash calls

When posting/reading comments or blocks via the Notion API, the integration token lives in `~/.config/notion/env`. Bash tool shell state does NOT persist between separate tool calls — reading the token in one call and pasting its literal value into a second call's command string exposes the raw secret in the tool-call transcript. This has happened twice already (flagged by the harness as a credential-leakage security warning both times).

**Rule:** always read the token and make the API call within a SINGLE Bash invocation, so the literal value never needs to be typed into the command text — either:
- Python script with `open()` reading the file inside the same process (safest, used successfully before), or
- One shell command chaining read + curl: `TOKEN=$(grep -oP 'NOTION_TOKEN=\K.*' ~/.config/notion/env) && curl -H "Authorization: Bearer $TOKEN" ...`

Never write the actual token characters into any command string across two separate tool calls, and never echo/print the token for "verification."

**Third occurrence (2026-07-21):** a variant leak — printing a TRUNCATED excerpt of the token (`token[:8]`, `cut -c1-20`, etc.) "just to debug/verify it loaded" still echoes real credential bytes into the tool-output transcript and still triggers the security warning. Debugging must never print ANY slice of the token, however short. To verify the token loaded, check only `len(token) > 0` / `bool(token)` — print a boolean or length, never a character from the value itself.
