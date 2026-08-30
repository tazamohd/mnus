# 🎞️ Rendered Episodes

Finished video files for the series, plus the generator used to produce them.

## Files

- **`episode-01-welcome.mp4`** — Episode 1 "Welcome to SALIS AUTO", fully rendered: 60s, 1920×1080, 30fps, H.264 + AAC (subtle ambient pad). Motion-graphics production of the [Episode 1 script](../01-welcome-to-salis-auto.md) — animated logo intro, stylized UI mockups (login, dashboard, workshop calendar, ZATCA invoice), the 18-group sidebar scroll, customer-vs-advisor split screen, compliance zoom, and end card, with the narration as on-screen captions.

Episode 1 needs no app footage, so it could be produced entirely as motion graphics. Episodes 2–10 are written around real screen recordings of the running app — record those per their scripts.

## Adding a voiceover

The rendered file carries the narration as captions plus a quiet music bed. To add voice, record (or TTS-generate) the narration column from the script and mix it over this file:

```bash
ffmpeg -i episode-01-welcome.mp4 -i voiceover.wav \
  -filter_complex "[0:a]volume=0.35[bg];[bg][1:a]amix=inputs=2:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac episode-01-voiced.mp4
```

## Regenerating / tweaking (`ep01-generator/`)

The video is fully code-generated and deterministic — edit and re-render:

| File | Role |
|------|------|
| `render.html` | The animation: a canvas `renderFrame(t)` that draws the full 60s timeline (scenes, captions, easing) |
| `capture.mjs` | Renders frames through headless Chromium (Playwright) — 1800 JPEG frames at 30fps |
| `gen_audio.py` | Synthesizes the ambient chord-pad WAV (pure Python, no dependencies) |

```bash
npm install playwright-core        # needs a Chromium binary available
node capture.mjs                   # → frames/f00000.jpg … f01799.jpg
python3 gen_audio.py               # → pad.wav
ffmpeg -framerate 30 -i frames/f%05d.jpg -i pad.wav \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -shortest episode-01-welcome.mp4
```

Preview single timestamps without a full render: `TEST="3.5,26,47" OUT=./preview node capture.mjs` (writes PNGs). `capture.mjs` looks for Chromium under `/opt/pw-browsers`; point `findChrome()` at your local install otherwise.
