"""Dialect narration for the real-footage demo-access video + final audio mix."""
import asyncio, os, subprocess, wave, contextlib
import edge_tts, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')
VOICE = 'ar-SA-HamedNeural'
UP = '/root/.claude/uploads/4f00c6a0-ee85-57b9-a358-16edb94f1d99'

# (start, slot_end, spoken text) — dialect, URL spelled for speech
LINES = [
    (0.6, 7.6,  'هلا وغلا! تبي تجرب سالس أوتو بنفسك؟ بسيطة — مبسّطين الحكاية.'),
    (8.4, 19.6, 'مسوّين حسابات تجريبية ببلاش — هذي قائمتها: كل دور له حساب، والباسورد وحدة وسهلة، والنظام يعبيها بنفسه. صوّرها عندك.'),
    (20.4, 25.6,'افتح سالس أوتو دوت آب، واضغط تسجيل الدخول.'),
    (26.4, 35.6,'تلاقي حساب تجريبي لكل الأدوار — اختر الحساب اللي تبي تجربه واضغط عليه، وهو بيعبي لك الإيميل والباسورد بنفسه.'),
    (36.4, 45.6,'اضغط تسجيل الدخول… شفت؟ النظام عرف دورك وفتح لك لوحتك — كل دور له شاشته.'),
    (46.4, 52.6,'هذي لوحة التحكم — إيرادات وأعمال وعملاء ومخزون، كل شي بالعربي وجاهز.'),
    (53.4, 64.6,'تبي تجرب دور ثاني؟ سجّل خروج، وارجع اضغط على فني — نفس الطريقة، وكل دور بشاشته.'),
    (65.4, 73.5,'وبس! جرّبها الحين على سالس أوتو دوت آب. الله يوفقك.'),
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
    os.makedirs('vo02', exist_ok=True)
    clips = []
    for i, (t0, tend, txt) in enumerate(LINES):
        mp3, wav_ = f'vo02/l{i}.mp3', f'vo02/l{i}.wav'
        await synth(txt, None, mp3); to_wav(mp3, wav_)
        d = dur_of(wav_); slot = tend - t0
        if d > slot:
            pct = min(int((d / slot - 1) * 100) + 4, 18)
            await synth(txt, f'+{pct}%', mp3); to_wav(mp3, wav_)
            d2 = dur_of(wav_)
            print(f'line {i}: {d:.1f}s > {slot:.1f}s -> +{pct}% -> {d2:.1f}s')
        else:
            print(f'line {i}: {d:.1f}s / {slot:.1f}s')
        clips.append((t0, wav_))

    # extract intro/outro audio from the uploaded logo clips
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/8d4c6551-one_more.mp4',
                    '-t', '8', '-vn', '-ar', '44100', '-ac', '2', 'vo02/introA.wav'], check=True)
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{UP}/02793591-logo.mp4',
                    '-t', '10', '-vn', '-ar', '44100', '-ac', '2', 'vo02/outroA.wav'], check=True)

    inputs = ['-i', 'pad75.wav', '-i', 'vo02/introA.wav', '-i', 'vo02/outroA.wav']
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
                   ['-filter_complex', ';'.join(f), '-map', '[out]', 'audio02.wav'], check=True)
    print('audio02.wav done', dur_of('audio02.wav'))

asyncio.run(main())
