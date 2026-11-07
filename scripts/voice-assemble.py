"""Assemble an episode's voice from its ElevenLabs takes, per its edit list.

usage: python3 -I scripts/voice-assemble.py episodes/epNN
Reads EP/voice_edl.json (segments: who, src, from, to, gap) and EP/raw_<src>.mp3 + EP/words_<src>_raw.json.
Cuts and interleaves the takes (short fades at each cut, each segment's own gap after it),
loudness-normalises to -14 LUFS, and writes EP/voice.mp3 and EP/words.json (every word on the final
timeline, tagged with its speaker). Then EP/env.json: each speaker's loudness per frame (30 fps).
"""
import json, subprocess, sys, struct, math, tempfile, os
D = sys.argv[1].rstrip('/')
edl = json.load(open(f'{D}/voice_edl.json'))
srcs = {s['src'] for s in edl['segments']}
words = {k: json.load(open(f'{D}/words_{k}_raw.json')) for k in srcs}
tmp = tempfile.mkdtemp()
t, parts, out_words, spans = 0.0, [], [], []
for k, s in enumerate(edl['segments']):
    p = f'{tmp}/seg{k}.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s['from']), '-to', str(s['to']), '-i', f'{D}/raw_{s["src"]}.mp3',
                    '-af', 'afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse', '-ar', '44100', '-ac', '1', p], check=True)
    for w in words[s['src']]:
        if s['from'] - 0.02 <= w['s'] and w['e'] <= s['to'] + 0.05:
            out_words.append({'w': w['w'], 's': round(t + w['s'] - s['from'], 3), 'e': round(t + w['e'] - s['from'], 3), 'who': s['who']})
    sil = f'{tmp}/gap{k}.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-t', str(max(0.01, s['gap'])), '-i', 'anullsrc=r=44100:cl=mono', sil], check=True)
    parts += [p, sil]
    d = s['to'] - s['from']
    spans.append((t, t + d, s['who']))
    t += d + s['gap']
lst = f'{tmp}/list.txt'
open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
                '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', f'{D}/voice.mp3'], check=True)
json.dump(out_words, open(f'{D}/words.json', 'w'), indent=0)
# per-speaker loudness, 30 fps
pcm = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', f'{D}/voice.mp3', '-ac', '1', '-ar', '44100', '-f', 's16le', '-'], capture_output=True, check=True).stdout
n = len(pcm) // 2
S = struct.unpack(f'<{n}h', pcm[:n * 2])
per = 44100 // 30
rms = [math.sqrt(sum(x * x for x in S[f * per:(f + 1) * per]) / max(1, len(S[f * per:(f + 1) * per]))) for f in range(n // per + 1)]
ref = sorted(rms)[int(len(rms) * 0.95)] or 1
env = [0 if r / ref < 0.06 else min(1, round(r / ref, 3)) for r in rms]
who = lambda tt: next((w for a, b, w in spans if a <= tt < b), None)
speakers = sorted({s['who'] for s in edl['segments']})
json.dump({k: [e if who(i / 30) == k else 0 for i, e in enumerate(env)] for k in speakers}, open(f'{D}/env.json', 'w'))
print(f'voice.mp3 {t:.2f}s, {len(out_words)} words, speakers {speakers}')
