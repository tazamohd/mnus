"""Video 3 audio: English VO (slot-fitted) + intro/outro audio + quiet bed -> audio_v3.wav (80s)."""
import asyncio, os, subprocess, wave, contextlib
import edge_tts, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')
VOICE = 'en-US-AndrewNeural'
UP = '/root/.claude/uploads/4f00c6a0-ee85-57b9-a358-16edb94f1d99'

# shot starts: 0,6,14,26,36,50,60,70 ; total 80
LINES = [
    (0.4, 5.4,  "Now let's see the platform through your customer's eyes — the SALIS AUTO customer portal."),
    (6.4, 13.4, "Sign in with Khalid, the customer account — same story: one click and you're in your portal."),
    (14.4, 25.4,"The first thing your customer sees is their service journey — the same Camry we saw on the owner side, tracked step by step: check-in, inspection, quote, repair, quality, and pickup."),
    (26.4, 35.4,"And all their vehicles in one place — last service and mileage for every one."),
    (36.4, 49.4,"Want to book? Four steps: pick the car, the service type, then the day and time — no phone call, no waiting on hold."),
    (50.4, 59.4,"And when the shop sends a quote, it lands right here — they see the amount and settle it with their advisor, full transparency."),
    (60.4, 69.4,"Their appointments and invoices are right there — paid and due, crystal clear."),
    (70.4, 79.0,"That's an experience that puts your customer at ease — and brings them back. Try it at salisauto dot app."),
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
    os.makedirs('vo_v3', exist_ok=True)
    # 80s quiet bed from pad82
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', 'pad82.wav', '-t', '80',
                    '-ar', '44100', '-ac', '2', 'vo_v3/pad80.wav'], check=True)
    clips = []
    for i, (t0, tend, txt) in enumerate(LINES):
        mp3, wav_ = f'vo_v3/l{i}.mp3', f'vo_v3/l{i}.wav'
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
                    '-t', '6', '-vn', '-ar', '44100', '-ac', '2', 'vo_v3/introA.wav'], check=True)
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/02793591-logo.mp4',
                    '-t', '10', '-vn', '-ar', '44100', '-ac', '2', 'vo_v3/outroA.wav'], check=True)

    inputs = ['-i', 'vo_v3/pad80.wav', '-i', 'vo_v3/introA.wav', '-i', 'vo_v3/outroA.wav']
    f = ['[0:a]volume=0.20[bed]',
         '[1:a]volume=0.55,afade=t=out:st=4.8:d=1.2[ia]',
         '[2:a]volume=0.55,afade=t=in:st=0:d=1.0,afade=t=out:st=8.8:d=1.2,adelay=70000|70000[oa]']
    labels = ['[bed]', '[ia]', '[oa]']
    for j, (t0, wav_) in enumerate(clips):
        inputs += ['-i', wav_]
        ms = int(t0 * 1000)
        f.append(f'[{j+3}:a]adelay={ms}|{ms}[v{j}]')
        labels.append(f'[v{j}]')
    f.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.95[out]')
    subprocess.run([FF, '-y', '-loglevel', 'error'] + inputs +
                   ['-filter_complex', ';'.join(f), '-map', '[out]', '-t', '80', 'audio_v3.wav'], check=True)
    print('audio_v3.wav done', dur_of('audio_v3.wav'))

asyncio.run(main())
