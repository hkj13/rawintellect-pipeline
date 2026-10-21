# RawIntellect pipeline

Turns a short script file into a finished, YouTube-ready Short for the RawIntellect channel. Everything is free: Kokoro for the voice, Remotion for the video, and music made in code.

## How it works

1. **Script** (`scripts/*.json`): lines of narration, each with a `visual` scene, the words to highlight, and the sources behind every claim.
2. **Voice** (`pipeline/tts.py`): Kokoro voices each line and records exact line timings, plus per-word timings for captions.
3. **Music** (`pipeline/music.py`): an ambient bed and a whoosh, synthesized so there is no copyright risk. Drop a `music.wav` from the YouTube Audio Library into `public/<id>/` to use that track instead.
4. **Video** (`remotion/`): a 1080x1920 Remotion template with word-by-word captions, animated scenes, a progress bar and a flash cut between scenes.
5. **Master**: ffmpeg brings the audio to -14 LUFS, the level YouTube plays at.

## Make a video

```bash
npm install
pip install -r requirements.txt
npm run make -- scripts/001-blind-spot.json   # writes out/001-blind-spot.mp4
```

The first run downloads the Kokoro model (about 350 MB) into `models/`. In a cloud session, set `REMOTION_BROWSER` to the preinstalled headless Chromium so Remotion does not try to download one.

`npm run studio` opens Remotion Studio for live preview while editing scenes.

## Writing a script

- The first line is the hook: the most surprising claim, with no intro.
- Keep Shorts to 90 to 130 words; one idea per line.
- `emphasis` lists the words that light up in the accent color.
- `pause` (seconds) holds after a line, for example while the viewer tries something.
- `theme` is `psychology` (cyan) or `mystery` (red).
- Every claim gets an entry in `sources`.

## Voices

`voice` in the script picks a Kokoro voice. `af_heart` is the highest quality. For a deeper male narrator, try `am_michael`, `am_fenrir` or `bm_george`.

## Scenes

The `visual` names currently drawn are `hook`, `retina`, `moons`, `fill`, `test`, `octopus` and `outro`, in `remotion/scenes.tsx`. New topics get new scenes, or stock clips once Pexels and Pixabay are reachable.
