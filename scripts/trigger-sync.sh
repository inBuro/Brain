#!/bin/bash
# Cloud-side trigger for a Mac-resident brain-sync listener (sync-trigger-server.py
# behind cloudflared). Run this from a remote Claude / SSH session when you
# want the local Mac clone to pull origin/main now instead of waiting for the
# daily 09:00 launchd fire.
#
# Reads BRAIN_SYNC_URL and BRAIN_SYNC_SECRET from one of:
#   1. environment (already exported in current shell)
#   2. file at BRAIN_SYNC_CONFIG (defaults to ./scripts/.trigger.env)
#
# Exit codes:
#   0 — Mac responded 200 (sync kicked)
#   1 — bad config (URL or secret missing)
#   2 — Mac responded but non-200 (auth fail, listener error, etc.)
#   3 — curl/network failure
#
# Usage:
#   scripts/trigger-sync.sh
#   BRAIN_SYNC_URL=https://... BRAIN_SYNC_SECRET=... scripts/trigger-sync.sh

set -u

CONFIG="${BRAIN_SYNC_CONFIG:-$(dirname "$0")/.trigger.env}"

if [ -f "$CONFIG" ]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$CONFIG"
  set +o allexport
fi

if [ -z "${BRAIN_SYNC_URL:-}" ] || [ -z "${BRAIN_SYNC_SECRET:-}" ]; then
  echo "ERROR: BRAIN_SYNC_URL and BRAIN_SYNC_SECRET must be set (env or $CONFIG)" >&2
  exit 1
fi

HTTP_CODE="$(
  curl -sS \
    --max-time 10 \
    --output /tmp/brain-sync-trigger.body \
    --write-out '%{http_code}' \
    -X POST \
    -H "X-Brain-Sync-Secret: $BRAIN_SYNC_SECRET" \
    "${BRAIN_SYNC_URL%/}/sync" \
  2>/tmp/brain-sync-trigger.err
)" || {
  echo "ERROR: curl failed:" >&2
  cat /tmp/brain-sync-trigger.err >&2
  exit 3
}

BODY="$(cat /tmp/brain-sync-trigger.body 2>/dev/null || true)"

if [ "$HTTP_CODE" = "200" ]; then
  echo "ok: $BODY"
  exit 0
fi

echo "ERROR: Mac responded HTTP $HTTP_CODE" >&2
[ -n "$BODY" ] && echo "body: $BODY" >&2
exit 2
