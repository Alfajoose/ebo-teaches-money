"""Assemble Ep5's voice from the ElevenLabs takes (episodes/ep05/raw_dan.mp3, raw_hook.mp3, raw_ama.mp3).

usage: python3 -I scripts/ep05-voice.py
Cuts and interleaves the takes per episodes/ep05/voice_edl.json (each segment's own gap after it; the dead beat after "Oh, nice."),
loudness-normalises to -14 LUFS, and writes episodes/ep05/voice.mp3 plus episodes/ep05/words.json
(every word on the final timeline, tagged with its speaker, for lip sync, captions and shot timing).
"""
import json, subprocess, os
D = 'episodes/ep05'
edl = json.load(open(f'{D}/voice_edl.json'))
words = {k: json.load(open(f'{D}/words_{k}_raw.json')) for k in {s['src'] for s in edl['segments']}}
t, parts, out_words = 0.0, [], []
for k, s in enumerate(edl['segments']):
    p = f'/tmp/ep05_seg{k}.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s['from']), '-to', str(s['to']), '-i', f'{D}/raw_{s["src"]}.mp3',
                    '-af', 'afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse', '-ar', '44100', '-ac', '1', p], check=True)
    for w in words[s['src']]:
        if s['from'] - 0.02 <= w['s'] and w['e'] <= s['to'] + 0.05:
            out_words.append({'w': w['w'], 's': round(t + w['s'] - s['from'], 3), 'e': round(t + w['e'] - s['from'], 3), 'who': s['who']})
    sil = f'/tmp/ep05_gap{k}.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-t', str(s['gap']), '-i', 'anullsrc=r=44100:cl=mono', sil], check=True)
    parts += [p, sil]
    t += s['to'] - s['from'] + s['gap']
lst = '/tmp/ep05_list.txt'
open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
                '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', f'{D}/voice.mp3'], check=True)
json.dump(out_words, open(f'{D}/words.json', 'w'), indent=0)
print(f'voice.mp3 {t:.2f}s, {len(out_words)} words')
