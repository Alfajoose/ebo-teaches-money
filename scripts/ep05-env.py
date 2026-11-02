"""Per-speaker loudness envelope (30 fps) of Ep5's assembled voice, for lip sync and beat gestures.
usage: python3 -I scripts/ep05-env.py   (after scripts/ep05-voice.py) -> src/series/data/ep05-env.json"""
import json, subprocess, struct, math
D = 'episodes/ep05'
pcm = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', f'{D}/voice.mp3', '-ac', '1', '-ar', '44100', '-f', 's16le', '-'], capture_output=True, check=True).stdout
n = len(pcm) // 2
S = struct.unpack(f'<{n}h', pcm[:n * 2])
per = 44100 // 30
rms = [math.sqrt(sum(x * x for x in S[f * per:(f + 1) * per]) / max(1, len(S[f * per:(f + 1) * per]))) for f in range(n // per + 1)]
ref = sorted(rms)[int(len(rms) * 0.95)] or 1
env = [0 if r / ref < 0.06 else min(1, round(r / ref, 3)) for r in rms]
edl = json.load(open(f'{D}/voice_edl.json'))
t, spans = 0, []
for s in edl['segments']:
    d = s['to'] - s['from']
    spans.append((t, t + d, s['who']))
    t += d + s['gap']
who = lambda tt: next((w for a, b, w in spans if a <= tt < b), None)
out = {k: [e if who(i / 30) == k else 0 for i, e in enumerate(env)] for k in ('ebo', 'ama')}
json.dump(out, open('src/series/data/ep05-env.json', 'w'))
print(len(env), 'frames')
