#!/bin/bash
# Transcribe course videos with whisper.cpp (large-v3-turbo, Russian).
# Extracts 16 kHz mono audio from each lesson video, then transcribes it.
# Usage: .pipeline/transcribe.sh   — skips lessons that already have a transcript.
# Override the audio scratch dir with AUDIO_DIR=... if the session temp dir is gone.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AUD="${AUDIO_DIR:-/private/tmp/claude-501/-Users-Kirill-Brain/b2880e1e-9c7d-4958-802a-bf1941577566/scratchpad/audio}"
MODEL="$HOME/.cache/whisper/ggml-large-v3-turbo.bin"
OUT="$ROOT/transcripts"
# Initial prompt: seeds punctuation and casing — without it the model returns raw lowercase.
PROMPT="Итак, разберём, как это устроено. Три фазы: директива, агент и результат. Дальше — по шагам."
mkdir -p "$OUT"
tail -n +2 "$ROOT/.pipeline/manifest.tsv" | while IFS=$'\t' read -r slug vid; do
  [ -z "$slug" ] && continue
  [ -s "$OUT/$slug.txt" ] && { echo "skip $slug"; continue; }
  if [ ! -f "$AUD/$slug.wav" ]; then
    mkdir -p "$AUD"
    echo "extract $slug"
    ffmpeg -v error -y -i "$ROOT/$vid" -vn -ac 1 -ar 16000 -c:a pcm_s16le "$AUD/$slug.wav" </dev/null \
      || { echo "NOAUDIO $slug"; continue; }
  fi
  echo "==> $slug"
  whisper-cli -m "$MODEL" -f "$AUD/$slug.wav" -l ru -t 8 -otxt -ovtt -of "$OUT/$slug" \
    --prompt "$PROMPT" -np </dev/null 2>&1 | tail -2
done
