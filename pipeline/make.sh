#!/usr/bin/env bash
# Script JSON to finished, YouTube-ready MP4.
# Usage: npm run make -- scripts/001-blind-spot.json
set -euo pipefail

SCRIPT="$1"
ID=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$SCRIPT")
THEME=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('theme','psychology'))" "$SCRIPT")
PY="${PYTHON:-python3}"
OUT="public/$ID"

bash pipeline/setup-models.sh
python3 pipeline/grain.py
"$PY" pipeline/tts.py "$SCRIPT" --models models --out "$OUT"
DURATION=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['duration'])" "$OUT/timeline.json")
"$PY" pipeline/music.py --seconds "$DURATION" --theme "$THEME" --out "$OUT"

mkdir -p out
npx remotion render remotion/index.ts Short "out/$ID.raw.mp4" --props="{\"id\":\"$ID\",\"timeline\":null}" --concurrency="${CONCURRENCY:-4}" --log=error
# YouTube plays everything at -14 LUFS and never turns quiet videos up, so master to that.
ffmpeg -v error -y -i "out/$ID.raw.mp4" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -movflags +faststart "out/$ID.mp4"
rm "out/$ID.raw.mp4"
python3 pipeline/upload_text.py "$SCRIPT" > "out/$ID.upload.txt"
echo "Done: out/$ID.mp4 and out/$ID.upload.txt"
