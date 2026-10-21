#!/usr/bin/env bash
# Download the free Kokoro voice model (Apache-2.0) once, from its GitHub release.
set -euo pipefail
mkdir -p models
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "models/$f" ] || curl -sSL -o "models/$f" "$BASE/$f"
done
