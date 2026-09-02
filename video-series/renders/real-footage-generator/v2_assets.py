"""Video 2 offline assets: English VO mix (82s) — captions rendered separately."""
import asyncio, os, subprocess, wave, contextlib
import edge_tts, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')
VOICE = 'en-US-AndrewNeural'
UP = '/root/.claude/uploads/4f00c6a0-ee85-57b9-a358-16edb94f1d99'

# shot starts: 0,6,14,26,36,46,58,66,74 ; total 82
LINES = [
    (0.4, 5.4,  "Come take a tour of the owner's seat — the SALIS AUTO owner dashboard."),
    (6.4, 13.4, "Sign in with the Owner account from quick access — one click and you're in."),
    (14.4, 25.4,"The numbers that matter are right there: revenue, active jobs, customers, and inventory — one glance and you know where your shop stands today."),
    (26.4, 35.4,"And here's your workflow pipeline: how many cars are checked in, in repair, in quality check — you know where every car is without leaving your desk."),
    (36.4, 45.4,"The charts give you the big picture: revenue month by month, and how your jobs break down — numbers you can build decisions on."),
    (46.4, 57.4,"From the sidebar, open Job Cards — every job with its details: the car, the customer, the technician, and the status."),
    (58.4, 65.4,"The appointments calendar organizes your week — see the busy days before they hit you."),
    (66.4, 73.4,"And invoices, all in one place: paid and due, every invoice ready to print."),
    (74.4, 81.0,"That's a quick look from the owner's seat — and there's a lot more. Try it yourself at salisauto dot app."),
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
    os.makedirs('vo_v2', exist_ok=True)
    clips = []
    for i, (t0, tend, txt) in enumerate(LINES):
        mp3, wav_ = f'vo_v2/l{i}.mp3', f'vo_v2/l{i}.wav'
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
                    '-t', '6', '-vn', '-ar', '44100', '-ac', '2', 'vo_v2/introA.wav'], check=True)
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/02793591-logo.mp4',
                    '-t', '8', '-vn', '-ar', '44100', '-ac', '2', 'vo_v2/outroA.wav'], check=True)

    inputs = ['-i', 'pad82.wav', '-i', 'vo_v2/introA.wav', '-i', 'vo_v2/outroA.wav']
    f = ['[0:a]volume=0.20[bed]',
         '[1:a]volume=0.55,afade=t=out:st=4.8:d=1.2[ia]',
         '[2:a]volume=0.55,afade=t=in:st=0:d=1.0,adelay=74000|74000[oa]']
    labels = ['[bed]', '[ia]', '[oa]']
    for j, (t0, wav_) in enumerate(clips):
        inputs += ['-i', wav_]
        ms = int(t0 * 1000)
        f.append(f'[{j+3}:a]adelay={ms}|{ms}[v{j}]')
        labels.append(f'[v{j}]')
    f.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.95[out]')
    subprocess.run([FF, '-y', '-loglevel', 'error'] + inputs +
                   ['-filter_complex', ';'.join(f), '-map', '[out]', 'audio_v2.wav'], check=True)
    print('audio_v2.wav done', dur_of('audio_v2.wav'))

asyncio.run(main())
