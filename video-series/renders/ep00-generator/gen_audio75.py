"""Gentle ambient pad for Episode 1 — 60s, 44.1kHz stereo WAV."""
import math, wave, struct

SR = 44100
DUR = 75.0
N = int(SR * DUR)

# chord progression, one chord per 7.5s segment (freqs in Hz)
D3, F3, A3 = 146.83, 174.61, 220.0
Bb2, C3, E3, G3, C4 = 116.54, 130.81, 164.81, 196.0, 261.63
CHORDS = [
    [D3, F3, A3],       # Dm
    [Bb2, D3, F3],      # Bb
    [F3, A3, C4],       # F
    [C3, E3, G3],       # C
    [D3, F3, A3],       # Dm
    [Bb2, D3, F3],      # Bb
    [C3, E3, G3],       # C
    [D3, F3, A3],       # Dm
]
SEG = DUR / len(CHORDS)

buf = [0.0] * N
for si, chord in enumerate(CHORDS):
    t0 = si * SEG
    notes = list(chord) + [chord[0] / 2.0]          # add sub-octave root
    amps  = [0.30, 0.26, 0.24, 0.20]
    for freq, amp in zip(notes, amps):
        detune = 1.0 + 0.0015 * math.sin(si + freq)  # tiny per-note detune
        i0 = int(t0 * SR)
        i1 = min(int((t0 + SEG + 2.5) * SR), N)      # 2.5s release bleeds into next chord
        for i in range(i0, i1):
            t = i / SR - t0
            env = min(t / 1.8, 1.0)                  # slow attack
            rel = max(0.0, (i1 / SR - t0) - t)
            env *= min(rel / 2.5, 1.0)               # slow release
            buf[i] += amp * env * (
                math.sin(2 * math.pi * freq * detune * (i / SR)) +
                0.35 * math.sin(2 * math.pi * freq * 2 * (i / SR))  # soft octave shimmer
            )

# master envelope: fade-in, fade-out, slow tremolo, low overall level
out = []
for i in range(N):
    t = i / SR
    master = 0.10 * (1 + 0.10 * math.sin(2 * math.pi * 0.28 * t))
    if t < 2.0:  master *= t / 2.0
    if t > 70.5: master *= max(0.0, (75.0 - t) / 4.5)
    s = buf[i] * master
    s = max(-0.95, min(0.95, s))
    out.append(s)

with wave.open('pad75.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i, s in enumerate(out):
        v = int(s * 32767)
        # slight stereo width: right channel delayed 12 samples
        vr = int(out[max(0, i - 12)] * 32767)
        frames += struct.pack('<hh', v, vr)
    w.writeframes(bytes(frames))
print('pad75.wav written:', N, 'samples')
