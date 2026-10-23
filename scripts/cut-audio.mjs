// Cuts public/ebo-ep01/voice-short.mp3 from voice.mp3 using the same frame-accurate
// segments as src/series/ep01short.tsx (EP01_SHORT_EDL).   usage: node scripts/cut-audio.mjs
import fs from 'fs';
import {execFileSync} from 'child_process';
const src = fs.readFileSync('src/series/ep01short.tsx', 'utf8');
const body = src.slice(src.indexOf('EP01_SHORT_EDL'), src.indexOf('];', src.indexOf('EP01_SHORT_EDL')));
const edl = [...body.matchAll(/\[([\d.]+), ([\d.]+)\]/g)].map((m) => [+m[1], +m[2]]);
const fps = 30;
const flt = edl.map(([a, b], i) => {
  const s = Math.ceil(a * fps - 1e-6) / fps;
  const e = Math.round(b * fps) / fps;
  const d = (e - s).toFixed(4);
  return `[0:a]atrim=start=${s}:end=${e},asetpts=PTS-STARTPTS,apad=whole_dur=${d},atrim=0:${d},afade=t=in:d=0.01,afade=t=out:st=${(e - s - 0.012).toFixed(3)}:d=0.012[s${i}]`;
});
flt.push(edl.map((_, i) => `[s${i}]`).join('') + `concat=n=${edl.length}:v=0:a=1[out]`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', 'public/ebo-ep01/voice.mp3', '-filter_complex', flt.join(';'), '-map', '[out]', '-b:a', '192k', 'public/ebo-ep01/voice-short.mp3'], {stdio: 'inherit'});
console.log(`cut ${edl.length} segments → public/ebo-ep01/voice-short.mp3`);
