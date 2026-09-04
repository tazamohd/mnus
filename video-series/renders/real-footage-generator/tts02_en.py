"""English narration over the real-footage video; Arabic dialect stays as burned-in subtitles."""
import asyncio, os, subprocess, wave, contextlib
import edge_tts, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')
VOICE = 'en-US-AndrewNeural'
UP = '/root/.claude/uploads/4f00c6a0-ee85-57b9-a358-16edb94f1d99'

LINES = [
    (0.6, 7.6,  "Hey there! Want to try SALIS AUTO for yourself? It's easy — we keep things simple."),
    (8.4, 19.6, "There are free demo accounts ready to go — here's the list: one account for every role, one simple shared password, and the system fills it in for you. Take a screenshot."),
    (20.4, 25.6,"Open salisauto dot app, and hit Sign In."),
    (26.4, 35.6,"You'll find a demo account for every role — pick the one you want and click it. It fills in the email and password automatically."),
    (36.4, 45.6,"Hit Sign In… see that? The system knows your role right away, and opens your own dashboard."),
    (46.4, 52.6,"This is the dashboard — revenue, jobs, customers, inventory. Everything ready, fully in Arabic."),
    (53.4, 64.6,"Want to try another role? Log out, then click Technician — same steps, and every role gets its own screen."),
    (65.4, 73.5,"And that's it! Try it now at salisauto dot app. Good luck!"),
]

def dur_of(p):
    with contextlib.closing(wave.open(p, 'rb')) as w:
        return w.getnframes() / w.getframerate()

def to_wav(src, dst):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-ar', '44100', '-ac', '2', dst], check=True)

async def synth(txt, rate, out):
    kw = dict(voice=VOICE, proxy=PROXY)
    if rate: kw['rate'] = rate
    await edge_tts.Communicate(txt, **kw).save(out)

async def main():
    os.makedirs('vo02en', exist_ok=True)
    clips = []
    for i, (t0, tend, txt) in enumerate(LINES):
        mp3, wav_ = f'vo02en/l{i}.mp3', f'vo02en/l{i}.wav'
        await synth(txt, None, mp3); to_wav(mp3, wav_)
        d = dur_of(wav_); slot = tend - t0
        if d > slot:
            pct = min(int((d / slot - 1) * 100) + 4, 18)
            await synth(txt, f'+{pct}%', mp3); to_wav(mp3, wav_)
            print(f'line {i}: {d:.1f}s > {slot:.1f}s -> +{pct}% -> {dur_of(wav_):.1f}s')
        else:
            print(f'line {i}: {d:.1f}s / {slot:.1f}s')
        clips.append((t0, wav_))

    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/8d4c6551-one_more.mp4',
                    '-t', '8', '-vn', '-ar', '44100', '-ac', '2', 'vo02en/introA.wav'], check=True)
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/02793591-logo.mp4',
                    '-t', '10', '-vn', '-ar', '44100', '-ac', '2', 'vo02en/outroA.wav'], check=True)

    inputs = ['-i', 'pad75.wav', '-i', 'vo02en/introA.wav', '-i', 'vo02en/outroA.wav']
    f = ['[0:a]volume=0.20[bed]',
         '[1:a]volume=0.55,afade=t=out:st=6.8:d=1.2[ia]',
         '[2:a]volume=0.55,afade=t=in:st=0:d=1.0,adelay=65000|65000[oa]']
    labels = ['[bed]', '[ia]', '[oa]']
    for j, (t0, wav_) in enumerate(clips):
        inputs += ['-i', wav_]
        ms = int(t0 * 1000)
        f.append(f'[{j+3}:a]adelay={ms}|{ms}[v{j}]')
        labels.append(f'[v{j}]')
    f.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.95[out]')
    subprocess.run([FF, '-y', '-loglevel', 'error'] + inputs +
                   ['-filter_complex', ';'.join(f), '-map', '[out]', 'audio02en.wav'], check=True)
    print('audio02en.wav done', dur_of('audio02en.wav'))

asyncio.run(main())
