"""Voice a script with Kokoro (free, Apache-2.0) and write per-word timings.

Usage: python pipeline/tts.py scripts/001-blind-spot.json --models models --out public/001-blind-spot

Each line is synthesized on its own, trimmed of silence and joined with a short
pause, so every line's start and end time is exact. Word times inside a line are
spread by character length, which is close enough for caption highlighting.
"""

import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SAMPLE_RATE = 24000
GAP_SECONDS = 0.22
LEAD_IN_SECONDS = 0.15


def trim_silence(audio: np.ndarray, threshold: float = 0.01) -> np.ndarray:
    loud = np.where(np.abs(audio) > threshold)[0]
    if len(loud) == 0:
        return audio
    pad = int(0.03 * SAMPLE_RATE)
    return audio[max(0, loud[0] - pad) : loud[-1] + pad]


def word_times(text: str, start: float, end: float) -> list[dict]:
    words = text.split()
    # Punctuation reads as a short pause, so it counts as extra length.
    weights = [len(w) + 1 + 3 * len(re.findall(r"[,.!?]", w)) for w in words]
    total = sum(weights)
    out, t = [], start
    for word, weight in zip(words, weights):
        dur = (end - start) * weight / total
        out.append({"word": word, "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("script")
    parser.add_argument("--models", default="models")
    parser.add_argument("--out", required=True)
    parser.add_argument("--voice", help="override the script's voice")
    args = parser.parse_args()

    script = json.loads(Path(args.script).read_text())
    models = Path(args.models)
    kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    voice = args.voice or script.get("voice", "af_heart")
    speed = script.get("speed", 1.0)

    chunks = [np.zeros(int(LEAD_IN_SECONDS * SAMPLE_RATE), dtype=np.float32)]
    t = LEAD_IN_SECONDS
    lines = []
    for i, line in enumerate(script["lines"]):
        samples, sr = kokoro.create(line["text"], voice=voice, speed=speed, lang="en-us")
        assert sr == SAMPLE_RATE
        samples = trim_silence(samples.astype(np.float32))
        dur = len(samples) / SAMPLE_RATE
        lines.append({
            "index": i,
            "text": line["text"],
            "visual": line.get("visual", "default"),
            "emphasis": line.get("emphasis", []),
            "start": round(t, 3),
            "end": round(t + dur, 3),
            "words": word_times(line["text"], t, t + dur),
        })
        chunks.append(samples)
        # "pause" gives the viewer time to act, e.g. during an on-screen test.
        gap = GAP_SECONDS + line.get("pause", 0)
        chunks.append(np.zeros(int(gap * SAMPLE_RATE), dtype=np.float32))
        t += dur + gap

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / "voice.wav", np.concatenate(chunks), SAMPLE_RATE)
    timeline = {
        "id": script["id"],
        "title": script["title"],
        "theme": script.get("theme", "psychology"),
        "duration": round(t + 0.6, 3),
        "lines": lines,
    }
    (out / "timeline.json").write_text(json.dumps(timeline, indent=2))
    print(f"{script['id']}: {len(lines)} lines, {timeline['duration']}s, voice {voice}")


if __name__ == "__main__":
    main()
