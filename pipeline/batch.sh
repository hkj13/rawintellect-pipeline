#!/usr/bin/env bash
# Build several videos in a row: bash pipeline/batch.sh scripts/002-*.json scripts/003-*.json ...
# A failure in one video is logged and the batch moves on to the next.
set -uo pipefail
for s in "$@"; do
  echo "=== $s"
  bash pipeline/make.sh "$s" || echo "FAILED: $s"
done
