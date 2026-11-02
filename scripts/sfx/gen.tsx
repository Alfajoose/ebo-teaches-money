// Absolute SFX cue lists (seconds) for each episode, from src/series/sfxCues.ts and the shot timing.
import fs from 'fs';
import {EP04_SFX, K01_SFX, Cue, ep05Sfx} from '../../src/series/sfxCues';
import ep05Words from '../../src/series/data/ep05-words.json';
import {EP05_DURATION} from '../../src/series/ep05';
import {EP04_PLAN, ep04Times} from '../../src/series/ep04plan';
import {K01_PLAN, K01_SHOT_TIMES, K01_DURATION} from '../../src/series/konka01';

const out: Record<string, {duration: number; cues: Cue[]}> = {};
const t4 = ep04Times();
const c4: Cue[] = [];
EP04_PLAN.forEach((s, i) => {
  const fn = EP04_SFX[`${s.line}#${s.set}`] ?? EP04_SFX[s.line];
  if (fn) c4.push(...fn(t4[i].length).map((c) => ({...c, at: t4[i].start + c.at})));
});
out.ep04 = {duration: t4[t4.length - 1].start + t4[t4.length - 1].length, cues: c4};
const k: Cue[] = [];
const kd = K01_DURATION / 30;
K01_PLAN.forEach((_, i) => {
  const st = K01_SHOT_TIMES[i];
  const len = (i + 1 < K01_SHOT_TIMES.length ? K01_SHOT_TIMES[i + 1] : kd) - st;
  const fn = K01_SFX[i];
  if (fn) k.push(...fn(len).map((c) => ({...c, at: st + c.at})));
});
out.konka01 = {duration: kd, cues: k};
out.ep05 = {duration: EP05_DURATION / 30, cues: ep05Sfx(ep05Words)};
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log('cues: ep04', c4.length, 'konka01', k.length);
