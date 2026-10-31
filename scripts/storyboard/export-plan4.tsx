// Writes Episode 4's shot list (episodes/ep04/shotlist.md + shotlist.json) from the plan in
// src/series/ep04plan.tsx. Timing is estimated from the script until the voice exists.
//   node scripts/storyboard/run.mjs ep04
import fs from 'fs';
import {EP04_PLAN, EP04_PACE, ep04Times} from '../../src/series/ep04plan';

const times = ep04Times();
const mmss = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const rows = EP04_PLAN.map((s, i) => ({
  n: i + 1,
  start: +times[i].start.toFixed(2),
  length: +times[i].length.toFixed(2),
  line: s.line,
  size: s.size,
  move: s.move,
  inFrame: s.cast.length ? 'Ebo' : '–',
  action: s.action,
  set: s.set,
  text: s.text ?? '',
  out: s.out ?? 'cut',
}));
const total = times[times.length - 1].start + times[times.length - 1].length;
const esc = (v: string) => v.replace(/\|/g, '\\|');
const md = [
  '# Ep 04 — The Ultimate Guide to Staying Broke: shot list',
  '',
  `${rows.length} shots, Ebo alone. **Timing is estimated** from the script at ${EP04_PACE} words/s (≈ ${mmss(total)}); it snaps to the real word timings once the voice is generated. Each storyboard panel is in \`storyboard/\` (panel *n* = shot *n*). Generated from \`src/series/ep04plan.tsx\`.`,
  '',
  'Sizes: EWS extreme wide · WS wide · MS medium · CU close-up · ECU extreme close-up. On the panels: dashed white box = where the camera starts, red box = where it ends, arrow = pan / whip / follow.',
  '',
  '| # | Time (est.) | Len | Line | Size | Camera | Action | Set | Text on screen | Out |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.n} | ${mmss(r.start)} | ${r.length.toFixed(1)}s | ${esc(r.line)} | ${esc(r.size)} | ${r.move} | ${esc(r.action)} | ${r.set} | ${esc(r.text) || '–'} | ${r.out} |`),
  '',
].join('\n');
fs.mkdirSync('episodes/ep04', {recursive: true});
fs.writeFileSync('episodes/ep04/shotlist.md', md);
fs.writeFileSync('episodes/ep04/shotlist.json', JSON.stringify(rows, null, 1));
console.log(`wrote ${rows.length} shots (≈ ${mmss(total)}) → episodes/ep04/shotlist.md`);
