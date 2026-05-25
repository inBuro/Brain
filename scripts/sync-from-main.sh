#!/bin/bash
# Pulls main into a local Brain clone, logs the result.
# Intended for daily launchd / cron invocation.
#
# Usage:
#   REPO_PATH=~/Brain ./sync-from-main.sh
#   ./sync-from-main.sh ~/Brain        # path as first arg also works
#
# Exit codes:
#   0 — pull succeeded (fast-forward or already up-to-date)
#   1 — bad invocation (no path, path not a git repo, etc.)
#   2 — local has uncommitted changes (refused to pull to avoid clobbering)
#   3 — local has divergent commits not on main (refused; would need merge/rebase)
#   4 — network / git failure

set -u

REPO_PATH="${1:-${REPO_PATH:-}}"

if [ -z "$REPO_PATH" ]; then
  echo "[$(date -Iseconds)] ERROR: REPO_PATH not set and no path argument given" >&2
  exit 1
fi

REPO_PATH="${REPO_PATH/#\~/$HOME}"

if [ ! -d "$REPO_PATH/.git" ]; then
  echo "[$(date -Iseconds)] ERROR: $REPO_PATH is not a git repo" >&2
  exit 1
fi

cd "$REPO_PATH" || exit 1

echo "[$(date -Iseconds)] sync start: $REPO_PATH"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[$(date -Iseconds)] REFUSED: uncommitted changes in working tree" >&2
  git status --short >&2
  exit 2
fi

CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo DETACHED)"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "[$(date -Iseconds)] NOTE: current branch is '$CURRENT_BRANCH', will fetch main without switching"
fi

if ! git fetch origin main 2>&1; then
  echo "[$(date -Iseconds)] ERROR: git fetch failed" >&2
  exit 4
fi

if [ "$CURRENT_BRANCH" = "main" ]; then
  AHEAD_COUNT="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
  if [ "$AHEAD_COUNT" != "0" ]; then
    echo "[$(date -Iseconds)] REFUSED: local main has $AHEAD_COUNT commit(s) not on origin/main — manual review needed" >&2
    exit 3
  fi

  if ! git merge --ff-only origin/main 2>&1; then
    echo "[$(date -Iseconds)] ERROR: ff-only merge failed (history diverged?)" >&2
    exit 3
  fi
else
  if ! git update-ref refs/heads/main refs/remotes/origin/main 2>&1; then
    echo "[$(date -Iseconds)] ERROR: failed to update local main ref" >&2
    exit 4
  fi
  echo "[$(date -Iseconds)] updated local main to origin/main (current branch '$CURRENT_BRANCH' untouched)"
fi

HEAD_SHA="$(git rev-parse --short HEAD)"
MAIN_SHA="$(git rev-parse --short main)"
echo "[$(date -Iseconds)] sync done: HEAD=$HEAD_SHA main=$MAIN_SHA"
