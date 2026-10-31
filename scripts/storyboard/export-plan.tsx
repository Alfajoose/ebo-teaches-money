// Writes Episode 3's shot list (episodes/ep03/shotlist.md + shotlist.json) from the plan in
// src/series/ep03plan.tsx, so the table and the storyboard panels come from the same data.
//   node scripts/storyboard/run.mjs
import fs from 'fs';
import {EP03_PLAN, planStart} from '../../src/series/ep03plan';

const castName = (w: string) => w[0].toUpperCase() + w.slice(1);
const mmss = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const rows = EP03_PLAN.map((s, i) => {
  const start = planStart(s);
  const end = i + 1 < EP03_PLAN.length ? planStart(EP03_PLAN[i + 1]) : start + 2.4;
  return {
    n: i + 1,
    start: +start.toFixed(2),
    length: +(end - start).toFixed(2),
    line: s.line,
    size: s.size,
    move: s.move,
    inFrame: s.cast.map((c) => castName(c.who)).join(', ') || '–',
    action: s.action,
    set: s.set,
    text: s.text ?? '',
    out: s.out ?? 'cut',
  };
});
const esc = (v: string) => v.replace(/\|/g, '\\|');
const md = [
  '# Ep 03 — How to Stay Poor: shot list',
  '',
  `${rows.length} shots, keyed to the existing voiceover (2:48.6). Each storyboard panel is in \`storyboard/\` (panel *n* = shot *n*). Generated from \`src/series/ep03plan.tsx\` by \`scripts/storyboard/run.mjs\`.`,
  '',
  'Sizes: EWS extreme wide · WS wide · MS medium · CU close-up · ECU extreme close-up · 2S two-shot. On the panels: dashed white box = where the camera starts, red box = where it ends, arrow = pan / whip / follow.',
  '',
  '| # | Time | Len | Line | Size | Camera | In frame | Action | Set | Text on screen | Out |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.n} | ${mmss(r.start)} | ${r.length.toFixed(1)}s | ${esc(r.line)} | ${esc(r.size)} | ${r.move} | ${r.inFrame} | ${esc(r.action)} | ${r.set} | ${esc(r.text) || '–'} | ${r.out} |`),
  '',
].join('\n');
fs.mkdirSync('episodes/ep03', {recursive: true});
fs.writeFileSync('episodes/ep03/shotlist.md', md);
fs.writeFileSync('episodes/ep03/shotlist.json', JSON.stringify(rows, null, 1));
console.log(`wrote ${rows.length} shots → episodes/ep03/shotlist.md`);
