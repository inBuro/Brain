#!/bin/bash
set -e
cd "/Users/Kirill/Brain/agents/hiring-manager/tools/telegram-vacancy-bot"

export PATH="/Users/Kirill/.local/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

PROMPT="Invoke the telegram-vacancy-mining skill (via the Skill tool) and run its full pipeline for the hiring-manager Telegram vacancy scan in this directory. End with a one-line summary: N new messages scanned, M new MATCH/MAYBE pushed to Notion."

claude -p "$PROMPT" --permission-mode dontAsk
