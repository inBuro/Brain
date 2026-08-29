#!/bin/bash
# Build the Skill Optimizer menu bar app (release), re-sign the installed
# app bundle in place, and relaunch it. Run from anywhere.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../app" && pwd)"
APP="/Users/Kirill/Applications/SkillOptimizer.app"

echo "Building release binary..."
(cd "$PROJECT_DIR" && swift build -c release)

echo "Installing binary into app bundle..."
cp "$PROJECT_DIR/.build/release/SkillOptimizer" "$APP/Contents/MacOS/SkillOptimizer"

echo "Re-signing (ad-hoc)..."
codesign --force --deep --sign - "$APP"

echo "Relaunching..."
osascript -e 'quit app "SkillOptimizer"' 2>/dev/null || true
sleep 1
pkill -f "SkillOptimizer" 2>/dev/null || true
sleep 1
open "$APP"

echo "Done. First launch does a full transcript scan (~20-30s of CPU) before the UI populates."
