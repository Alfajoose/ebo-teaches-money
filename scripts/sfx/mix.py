"""Mix one episode's sound-effect track from its cue list.

usage: python3 -I scripts/sfx/mix.py CUES.json EPISODE OUT.wav
Each effect (episodes/sfx/NAME.mp3) is cleaned once: leading silence cut so the hit lands on its
cue, capped in length with a short fade, and peak-normalised. Cues are placed with their volume;
`loop` cues repeat the effect for that many seconds. The track is the episode's full length.
"""
import sys, os, json, subprocess
cues_path, ep, out = sys.argv[1:4]
data = json.load(open(cues_path))[ep]
SRC, CLEAN = 'episodes/sfx', 'out/sfx/clean'
os.makedirs(CLEAN, exist_ok=True)
CAP = {'typing': 1.04, 'marker_tick': 0.35, 'phone_buzz': 1.6, 'slide': 0.8, 'couch_flop': 0.7, 'cricket_night': 9.3, 'rain': 12.0, 'thunder': 3.0}
LEVEL = 0.55  # effects sit under the voice


def clean(name):
    p = f'{CLEAN}/{name}.wav'
    if os.path.exists(p):
        return p
    cap = CAP.get(name, 0.9)
    # peak to -1 dB first (some takes come out very quiet), then cut the lead-in silence
    det = subprocess.run(['ffmpeg', '-nostdin', '-i', f'{SRC}/{name}.mp3', '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    peak = float(det.split('max_volume:')[1].split('dB')[0])
    trim = '' if name == 'typing' else 'silenceremove=start_periods=1:start_threshold=-30dB,'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SRC}/{name}.mp3', '-af',
                    f'volume={-1 - peak:.1f}dB,{trim}atrim=0:{cap},afade=t=out:st={max(0, cap - 0.06)}:d=0.06,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono',
                    p], check=True)
    return p


args, filt = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-t', f'{data["duration"]:.3f}', '-i', 'anullsrc=r=44100:cl=mono'], []
for i, c in enumerate(data['cues']):
    src = clean(c['sfx'])
    if c.get('loop'):
        args += ['-stream_loop', '-1', '-t', f"{c['loop']:.3f}", '-i', src]
    else:
        args += ['-i', src]
    ms = int(round(c['at'] * 1000))
    fade = f",afade=t=out:st={max(0, c['loop'] - 0.3):.3f}:d=0.3" if c.get('loop') else ''  # loops tail off instead of cutting
    filt.append(f"[{i + 1}]volume={c.get('vol', 1) * LEVEL:.3f}{fade},adelay={ms}[c{i}]")
mix = ''.join(f'[c{i}]' for i in range(len(data['cues'])))
filt.append(f"[0]{mix}amix=inputs={len(data['cues']) + 1}:normalize=0:duration=first,alimiter=limit=0.9[o]")
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '[o]', '-ac', '1', '-ar', '44100', out], check=True)
print(f'{ep}: {len(data["cues"])} cues -> {out}')
