"""Synthesize narration (edge-tts), fit lines to their time slots, mix over the
ambient pad, and remux into the rendered episode videos."""
import asyncio, os, subprocess, sys, wave, contextlib
import edge_tts
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
PROXY = os.environ.get('HTTPS_PROXY')

EPISODES = {
    'ep00-en': dict(
        video='episode-00-story-en.mp4', pad='pad75.wav', out='episode-00-story-en-voiced.mp4',
        voice='en-US-AndrewNeural', end=73.0,
        starts=[0.6, 8.2, 20.2, 30.4, 42.2, 52.2, 62.2],
        lines=[
            "Six-thirty in the morning, Riyadh. Abu Khalid opens his garage — the same way his father did before him.",
            "And the day begins the way it always does: a whiteboard full of notes, job cards on paper, bookings on WhatsApp, inventory in a spreadsheet — and a phone that never stops ringing.",
            "A customer asks where her car is — nobody knows. A part goes missing. An invoice is forgotten. Every single day, hours disappear into the chaos.",
            "So we asked one simple question: what if the whole garage lived in one system? One screen for every booking, every job, every part, every riyal.",
            "And what if it spoke our language and followed our rules? Fifteen percent VAT. ZATCA e-invoicing. Hijri dates. Arabic — first, not as an afterthought.",
            "That question became SALIS AUTO — not software imported from somewhere else, but a platform built for garages like ours.",
            "In this series, we follow one car — Amal's Camry — from booking to payment, through every corner of the platform. This is the story of your garage… without the chaos. Let's begin.",
        ]),
    'ep00-ar': dict(
        video='episode-00-story-ar.mp4', pad='pad75.wav', out='episode-00-story-ar-voiced.mp4',
        voice='ar-SA-HamedNeural', end=73.0,
        starts=[0.6, 8.2, 20.2, 30.4, 42.2, 52.2, 62.2],
        lines=[
            "السادسة والنصف صباحاً في الرياض. أبو خالد يفتح ورشته كما كان يفعل والده.",
            "ويبدأ اليوم كما يبدأ دائماً: سبورة مليئة بالملاحظات، وبطاقات ورقية، وحجوزات على الواتساب، ومخزون في جداول — وهاتف لا يهدأ.",
            "عميلة تسأل: أين سيارتي؟ ولا أحد يعرف. قطعة تختفي، وفاتورة تُنسى، والساعات تضيع.",
            "فسألنا سؤالاً بسيطاً: ماذا لو اجتمعت الورشة كلها في نظام واحد؟ شاشة واحدة لكل حجز وعمل وقطعة وريال.",
            "وماذا لو تحدث لغتنا واتبع أنظمتنا؟ ضريبة خمسة عشر بالمئة، وفوترة زاتكا، والتاريخ الهجري، والعربية أولاً.",
            "ذلك السؤال أصبح «سالس أوتو» — ليس برنامجاً مستورداً، بل منصة بُنيت لورشٍ مثل ورشنا.",
            "في هذه السلسلة نتابع كامري أمل من الحجز إلى الدفع عبر كل ركن من المنصة. هذه قصة ورشتك بلا فوضى. لنبدأ.",
        ]),
    'ep01-en': dict(
        video='episode-01-welcome.mp4', pad='pad.wav', out='episode-01-welcome-voiced.mp4',
        voice='en-US-AndrewNeural', end=58.5,
        starts=[0.6, 8.2, 20.2, 32.2, 42.2, 52.2],
        lines=[
            "Running a garage means juggling bookings, job cards, parts, invoices, and customers — usually across five different tools.",
            "SALIS AUTO puts all of it in one platform — a complete automotive ERP, from a single workshop to a multi-country franchise network.",
            "The platform follows your real workflow: intake, check-in, diagnostics, parts, execution, billing, and analytics — in that order.",
            "Every role gets its own portal. Customers book and track online; your team works in screens built for their job.",
            "Saudi-market compliance is built in — fifteen percent VAT, ZATCA e-invoicing QR codes, Hijri dates, and full Arabic support.",
            "Try every part of it free — nine demo accounts. Next episode: how to log in.",
        ]),
}

def dur_of(wav_path):
    with contextlib.closing(wave.open(wav_path, 'rb')) as w:
        return w.getnframes() / w.getframerate()

def to_wav(src, dst):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src,
                    '-ar', '44100', '-ac', '2', dst], check=True)

async def synth(text, voice, rate, out_mp3):
    kw = dict(voice=voice, proxy=PROXY)
    if rate:
        kw['rate'] = rate
    await edge_tts.Communicate(text, **kw).save(out_mp3)

async def build(key):
    cfg = EPISODES[key]
    starts, lines = cfg['starts'], cfg['lines']
    os.makedirs(f'vo-{key}', exist_ok=True)
    clips = []
    for i, (t0, line) in enumerate(zip(starts, lines)):
        slot = (starts[i + 1] - 0.4 if i + 1 < len(starts) else cfg['end']) - t0
        mp3, wav_ = f'vo-{key}/l{i}.mp3', f'vo-{key}/l{i}.wav'
        await synth(line, cfg['voice'], None, mp3)
        to_wav(mp3, wav_)
        d = dur_of(wav_)
        if d > slot:  # too long for its slot -> speed up just enough
            pct = min(int((d / slot - 1) * 100) + 4, 35)
            await synth(line, cfg['voice'], f'+{pct}%', mp3)
            to_wav(mp3, wav_)
            d2 = dur_of(wav_)
            print(f'  [{key}] line {i}: {d:.1f}s > slot {slot:.1f}s -> +{pct}% -> {d2:.1f}s')
        else:
            print(f'  [{key}] line {i}: {d:.1f}s / slot {slot:.1f}s')
        clips.append((t0, wav_))

    # mix: bed (quiet) + delayed voice clips
    inputs = ['-i', cfg['pad']]
    fparts = ['[0:a]volume=0.30[bed]']
    labels = ['[bed]']
    for j, (t0, wav_) in enumerate(clips):
        inputs += ['-i', wav_]
        ms = int(t0 * 1000)
        fparts.append(f'[{j+1}:a]adelay={ms}|{ms},volume=1.0[v{j}]')
        labels.append(f'[v{j}]')
    fparts.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.95[out]')
    mix = f'vo-{key}/mix.wav'
    subprocess.run([FF, '-y', '-loglevel', 'error'] + inputs +
                   ['-filter_complex', ';'.join(fparts), '-map', '[out]', mix], check=True)
    # remux into the video
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', cfg['video'], '-i', mix,
                    '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '160k', '-shortest', cfg['out']], check=True)
    print(f'[{key}] -> {cfg["out"]}')

async def main():
    for key in sys.argv[1:] or list(EPISODES):
        await build(key)

asyncio.run(main())
