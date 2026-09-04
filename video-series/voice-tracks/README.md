# 🎙️ Voice Tracks — Episodes 2–11

Pre-generated narration tracks for the screen-recorded episodes, ready to lay under your app footage in any editor. Each file is the **full episode length** with the spoken lines placed at their script timestamps and silence in between — drop it on the timeline at 0:00 and it lines up with the script's shot table. Add the music bed yourself (or reuse `renders/ep00-generator/gen_audio*.py`).

## Files

`epNN-en.mp3` — English narration (`en-US-AndrewNeural`)
`epNN-ar.mp3` — Arabic narration (`ar-SA-HamedNeural`, Saudi voice)

| Episode | Length | Notes |
|---------|--------|-------|
| ep02 | 75s | Demo accounts & login |
| ep03 | 90s | Customer portal |
| ep04 | 90s | Service advisor |
| ep05 | 60s | Technician |
| ep06 | 75s | Store keeper |
| ep07 | 90s | Finance & compliance |
| ep08 | 60s | Support |
| ep09 | 90s | Admin dashboard |
| ep10 | 75s | Platform admin |
| ep11 | 96s | **Arabic track is in Saudi dialect (بالدارجة)** per the episode's script; the English track reads the gloss |

Episodes 2–10 Arabic tracks are MSA (فصحى) matching the scripts' «التعليق الصوتي» sections. Per the Arabic-first production plan ([PLANNING-AR.md](../PLANNING-AR.md)), dialect (دارجة) versions will replace these episode by episode as each video's plan is approved — the generator (`renders/ep00-generator/voicetracks.py`) regenerates any track from an edited script in one command.

## Mixing under a screen recording

```bash
ffmpeg -i screen-recording.mp4 -i ep03-ar.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -shortest ep03-ar-rough-cut.mp4
```

If a line was pushed later than its script time to avoid overlaps, the generator printed it during creation (`pushed +N.Ns`) — trim your footage to match, or regenerate after shortening that line.
