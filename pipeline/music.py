"""Generate a royalty-free ambient bed and a whoosh effect from scratch.

Usage: python pipeline/music.py --seconds 50 --theme psychology --out public/001-blind-spot

Everything is synthesized here, so there is no licensing risk. Swap in a track
from the YouTube Audio Library later by dropping music.wav into the same folder.
"""

import argparse
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100

# Root notes per theme: mystery sits lower and darker than psychology.
THEMES = {
    "psychology": [110.0, 164.81, 220.0, 277.18],  # A minor-ish, open
    "mystery": [73.42, 110.0, 146.83, 174.61],  # low D with a dark sixth
}


def ambient(seconds: float, theme: str, seed: int = 7) -> np.ndarray:
    rng = np.random.default_rng(seed)
    t = np.arange(int(seconds * SR)) / SR
    out = np.zeros_like(t)
    for i, f in enumerate(THEMES.get(theme, THEMES["psychology"])):
        lfo = 0.5 + 0.5 * np.sin(2 * np.pi * (0.05 + 0.03 * i) * t + rng.uniform(0, 6))
        detune = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.003 * t)
        out += detune * lfo / (i + 1.5)
    # A slow heartbeat-like pulse under the pad keeps tension without a melody.
    beat = np.zeros_like(t)
    for start in np.arange(0.0, seconds, 1.6):
        n = int(start * SR)
        k = np.arange(min(int(0.35 * SR), len(t) - n))
        beat[n : n + len(k)] += np.sin(2 * np.pi * 52 * k / SR) * np.exp(-k / (0.08 * SR))
    out = out / np.max(np.abs(out)) * 0.5 + beat * 0.35
    fade = int(1.5 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return (out / np.max(np.abs(out)) * 0.8).astype(np.float32)


def whoosh(seconds: float = 0.6, seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    noise = rng.standard_normal(n)
    # One-pole low-pass whose cutoff sweeps up then down.
    sweep = np.sin(np.linspace(0, np.pi, n)) ** 2
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.02 + 0.5 * sweep[i]
        y += a * (noise[i] - y)
        out[i] = y
    out *= sweep
    return (out / np.max(np.abs(out)) * 0.9).astype(np.float32)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seconds", type=float, required=True)
    parser.add_argument("--theme", default="psychology")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if not (out / "music.wav").exists():
        sf.write(out / "music.wav", ambient(args.seconds, args.theme), SR)
    sf.write(out / "whoosh.wav", whoosh(), SR)
    print(f"music and whoosh written to {out}")


if __name__ == "__main__":
    main()
