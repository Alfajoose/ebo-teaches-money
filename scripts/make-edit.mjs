// Cuts Ebo's spoken lesson numbers ("Lesson one:", "Lesson two:" …) out of each episode.
// From the voiceover's word timings it writes the kept segments to
// src/series/data/<ep>-edit.json and cuts public/ebo-<ep>/voice-edit.mp3 to match; the
// episodes play their animation through the same segments, so everything stays in sync.
// Episode 1's short cut (EP01_SHORT_EDL) gets the same cuts → voice-short.mp3.
//   usage: node scripts/make-edit.mjs
import fs from 'fs';
import {execFileSync} from 'child_process';

const FPS = 30;
const TAIL = 1.1; // seconds kept after the last word (end card)
const SEARCH = 0.12; // look this far either side of a word gap for the quietest moment

/** Loudness (RMS) of the voice in 10 ms steps. */
const loudness = (mp3) => {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], {maxBuffer: 1 << 28});
  const n = pcm.length >> 1;
  const env = [];
  for (let i = 0; i + 160 <= n; i += 160) {
    let sum = 0;
    for (let k = i; k < i + 160; k++) sum += pcm.readInt16LE(k * 2) ** 2;
    env.push(Math.sqrt(sum / 160));
  }
  return env;
};

/** The quietest 10 ms step between t0 and t1 (seconds), as the middle of a 30 ms window. */
const quietest = (env, t0, t1) => {
  let best = t0;
  let lo = Infinity;
  for (let i = Math.max(1, Math.floor(t0 * 100)); i <= Math.ceil(t1 * 100) && i + 1 < env.length; i++) {
    const v = env[i - 1] + env[i] + env[i + 1];
    if (v < lo) [lo, best] = [v, i / 100];
  }
  return best;
};

/**
 * [start, end] seconds of each "Lesson <number>:" callout. The word timings can be a few
 * hundredths off, so each edge snaps to the quietest moment in the gap between words.
 */
const callouts = (words, env) => {
  const cuts = [];
  for (let i = 1; i + 2 < words.length; i++) {
    if (/^lesson$/i.test(words[i].w) && /^(one|two|three|four|five|six|seven|eight|nine|ten)[:.,]?$/i.test(words[i + 1].w)) {
      const a = quietest(env, Math.min(words[i - 1].e, words[i].s - 0.02) - 0.02, words[i].s + 0.04);
      const b = quietest(env, words[i + 1].e - SEARCH / 2, words[i + 2].s + 0.02);
      cuts.push([+a.toFixed(3), +b.toFixed(3)]);
    }
  }
  return cuts;
};

/** Segments [a, b] minus the cut ranges. */
const subtract = (segs, cuts) => {
  let out = segs;
  for (const [c0, c1] of cuts) {
    out = out.flatMap(([a, b]) => (c1 <= a || c0 >= b ? [[a, b]] : [[a, c0], [c1, b]].filter(([x, y]) => y - x > 0.05)));
  }
  return out.map(([a, b]) => [+a.toFixed(3), +b.toFixed(3)]);
};

/** Cut `src` down to `keep` (frame-accurate, same rounding as src/series/kit.tsx editTimeline). */
const cutAudio = (src, keep, dst) => {
  const flt = keep.map(([a, b], i) => {
    const s = Math.ceil(a * FPS - 1e-6) / FPS;
    const e = Math.round(b * FPS) / FPS;
    const d = (e - s).toFixed(4);
    return `[0:a]atrim=start=${s}:end=${e},asetpts=PTS-STARTPTS,apad=whole_dur=${d},atrim=0:${d},afade=t=in:d=0.01,afade=t=out:st=${(e - s - 0.012).toFixed(3)}:d=0.012[s${i}]`;
  });
  flt.push(keep.map((_, i) => `[s${i}]`).join('') + `concat=n=${keep.length}:v=0:a=1[out]`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', flt.join(';'), '-map', '[out]', '-b:a', '192k', dst], {stdio: 'inherit'});
};

for (const ep of ['ep01', 'ep02']) {
  const words = JSON.parse(fs.readFileSync(`src/series/data/${ep}-words.json`, 'utf8'));
  const end = Math.ceil((words[words.length - 1].e + TAIL) * FPS) / FPS;
  const cuts = callouts(words, loudness(`public/ebo-${ep}/voice.mp3`));
  const keep = subtract([[0, end]], cuts);
  fs.writeFileSync(`src/series/data/${ep}-edit.json`, JSON.stringify({cuts, keep}, null, 1));
  cutAudio(`public/ebo-${ep}/voice.mp3`, keep, `public/ebo-${ep}/voice-edit.mp3`);
  const kept = keep.reduce((n, [a, b]) => n + (Math.round(b * FPS) - Math.ceil(a * FPS - 1e-6)), 0) / FPS;
  console.log(`${ep}: cut ${cuts.length} callouts, ${end.toFixed(2)} s → ${kept.toFixed(2)} s`);

  if (ep === 'ep01') {
    const src = fs.readFileSync('src/series/ep01short.tsx', 'utf8');
    const body = src.slice(src.indexOf('EP01_SHORT_EDL'), src.indexOf('];', src.indexOf('EP01_SHORT_EDL')));
    const edl = [...body.matchAll(/\[([\d.]+), ([\d.]+)\]/g)].map((m) => [+m[1], +m[2]]);
    const shortKeep = subtract(edl, cuts);
    fs.writeFileSync('src/series/data/ep01short-edit.json', JSON.stringify({keep: shortKeep}, null, 1));
    cutAudio('public/ebo-ep01/voice.mp3', shortKeep, 'public/ebo-ep01/voice-short.mp3');
    console.log(`ep01 short: ${edl.length} → ${shortKeep.length} segments`);
  }
}
