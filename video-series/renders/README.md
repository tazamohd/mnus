# 🎞️ Rendered Episodes

Finished video files for the series, plus the generator used to produce them.

## Files

- **`episode-00-story-en.mp4`** / **`episode-00-story-ar.mp4`** — Episode 0 "The Story of SALIS AUTO / قصة سالس أوتو" in **English and Arabic**: 75s, 1920×1080, 30fps, H.264 + AAC. The storytelling intro from the [Episode 0 script](../00-the-story.md): Riyadh dawn skyline, Abu Khalid's chaos montage (whiteboard, paper job cards, WhatsApp bookings, spreadsheet, ringing phone), the three pain cards, the chaos collapsing into one clean system, the Saudi compliance badges (VAT ١٥٪ / ZATCA فاتورة / Hijri / Arabic-first), the logo reveal, and the "Follow Amal's Camry" series roadmap. The Arabic cut has fully RTL captions and Arabic overlays (Noto Sans Arabic).
- **`episode-01-welcome.mp4`** — Episode 1 "Welcome to SALIS AUTO", fully rendered: 60s, 1920×1080, 30fps, H.264 + AAC (subtle ambient pad). Motion-graphics production of the [Episode 1 script](../01-welcome-to-salis-auto.md) — animated logo intro, stylized UI mockups (login, dashboard, workshop calendar, ZATCA invoice), the 18-group sidebar scroll, customer-vs-advisor split screen, compliance zoom, and end card, with the narration as on-screen captions.
- **`episode-02-demo-access-en.mp4` / `episode-02-demo-access-ar.mp4`** — Episode 2 "Free Demo Accounts", the step-by-step access walkthrough (75s each, narrated, both languages): the full 9-account credentials table (held long enough to screenshot), STEP 1–5 badges, an animated login with real credentials typed in, the role-routing moment (`role: CUSTOMER → /portal/dashboard`), the customer portal, and switching roles to Finance/Technician/Support. Mock-UI motion graphics; per [PLANNING-AR.md](../PLANNING-AR.md) the next iteration replaces mock screens with real system screenshots, Arabic-first.

Episodes 0 and 1 need no app footage, so they are produced entirely as motion graphics. Episodes 2–11 are written around real screen recordings of the running app — record those per their scripts (each script includes both English and Arabic narration).

## Voiceover

**All three rendered videos carry a full spoken voiceover** (neural TTS, mixed over the quiet music bed, with the captions kept on screen):

- English episodes: `en-US-AndrewNeural` (warm male narrator).
- Arabic episode 0: `ar-SA-HamedNeural` (Saudi male voice, MSA read).

The pipeline lives in `ep00-generator/voiceover.py`: it synthesizes each narration line with edge-tts, measures it against its time slot, re-synthesizes slightly faster only when a line runs long (capped so it never sounds rushed — the Arabic spoken lines are lightly condensed from the on-screen captions for timing, a standard dubbing practice), then mixes the lines at their script timestamps over the pad at 30% volume and remuxes into the video without re-encoding.

To change the voice, edit the `voice` field per episode (any edge-tts voice id works — e.g. `ar-SA-ZariyahNeural` for a female Arabic narrator, or a Saudi-dialect read for Episode 11) and rerun:

```bash
pip install edge-tts imageio-ffmpeg
python3 voiceover.py            # all episodes
python3 voiceover.py ep00-ar    # one episode
```

To replace the TTS with a human recording, record the narration column from the script and mix it the same way:

```bash
ffmpeg -i episode-01-welcome.mp4 -i voiceover.wav \
  -filter_complex "[0:a]volume=0.30[bg];[bg][1:a]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac episode-01-human.mp4
```

## Regenerating / tweaking (`ep00-generator/`, `ep01-generator/`)

The videos are fully code-generated and deterministic — edit and re-render:

| File | Role |
|------|------|
| `render.html` / `render-ep00.html` | The animation: a canvas `renderFrame(t)` that draws the full timeline (scenes, captions, easing). Ep00 takes `?lang=en` or `?lang=ar` — all strings, caption direction, and fonts switch per language |
| `capture.mjs` / `capture00.mjs` | Renders frames through headless Chromium (Playwright) — JPEG frames at 30fps (`LANG_VIDEO=ar` for the Arabic cut of ep00) |
| `gen_audio.py` / `gen_audio75.py` | Synthesizes the ambient chord-pad WAV (pure Python, no dependencies) |

The Arabic cut needs an Arabic-capable font installed for Chromium (the renders use **Noto Sans Arabic**; on Linux, drop the TTF in `/usr/share/fonts` and run `fc-cache -f`).

```bash
npm install playwright-core        # needs a Chromium binary available
node capture.mjs                   # → frames/f00000.jpg … f01799.jpg
python3 gen_audio.py               # → pad.wav
ffmpeg -framerate 30 -i frames/f%05d.jpg -i pad.wav \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -shortest episode-01-welcome.mp4
```

Preview single timestamps without a full render: `TEST="3.5,26,47" OUT=./preview node capture.mjs` (writes PNGs). `capture.mjs` looks for Chromium under `/opt/pw-browsers`; point `findChrome()` at your local install otherwise.
