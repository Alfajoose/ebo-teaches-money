// Records, frame by frame, what every character, prop, graphic and caption does in an
// episode (as edited: lesson numbers cut out), for building the Animate .fla.
// Bundled with esbuild and run in Node:
//   node scripts/export-fla/run-capture.mjs out/fla-export/capture.json [ep01|ep02|ep03|ep04]
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'fs';
import {Ep01Frame, EP01_DURATION, EP01_SHOT_TIMES, ep01ToSource, shotIndexAt as shot01} from '../../src/series/ep01';
import {Ep02Frame, EP02_DURATION, EP02_SHOT_TIMES, ep02ToSource, shotIndexAt as shot02} from '../../src/series/ep02';
import {Ep03Frame, EP03_DURATION, EP03_SHOT_TIMES, EP03_W, EP03_H, shotIndexAt as shot03} from '../../src/series/ep03';
import {Ep04Frame, EP04_DURATION, EP04_SHOT_TIMES, EP04_W, EP04_H, shotIndexAt as shot04} from '../../src/series/ep04';
import {EP04_SECTIONS} from '../../src/series/ep04plan';
import {K01Frame, K01_DURATION, K01_SHOT_TIMES, K01_W, K01_H, k01ShotIndexAt, K01_PLAN} from '../../src/series/konka01';
import {Ep05Frame, EP05_DURATION, EP05_SHOT_TIMES, EP05_W, EP05_H, ep05ShotAt, EP05_SECTIONS} from '../../src/series/ep05';
import {Ep06Frame, EP06_DURATION, EP06_SHOT_TIMES, EP06_W, EP06_H, ep06ShotAt, EP06_SECTIONS} from '../../src/series/ep06';
import {Ep07Frame, EP07_DURATION, EP07_SHOT_TIMES, EP07_W, EP07_H, ep07ShotAt, EP07_SECTIONS} from '../../src/series/ep07';
import {Ep08Frame, EP08_DURATION, EP08_SHOT_TIMES, EP08_W, EP08_H, ep08ShotAt, EP08_SECTIONS} from '../../src/series/ep08';
import {Ep09Frame, EP09_DURATION, EP09_SHOT_TIMES, EP09_W, EP09_H, ep09ShotAt, EP09_SECTIONS} from '../../src/series/ep09';
import {Ep10Frame, EP10_DURATION, EP10_SHOT_TIMES, EP10_W, EP10_H, ep10ShotAt, EP10_SECTIONS} from '../../src/series/ep10';
import {Capture, CaptureContext} from '../../src/series/exportCtx';

const EPISODES = {
  ep01: {name: 'Ep01', Frame: Ep01Frame, duration: EP01_DURATION, shotTimes: EP01_SHOT_TIMES, shotIndexAt: shot01, toSource: ep01ToSource, width: 1080, height: 1920},
  ep02: {name: 'Ep02', Frame: Ep02Frame, duration: EP02_DURATION, shotTimes: EP02_SHOT_TIMES, shotIndexAt: shot02, toSource: ep02ToSource, width: 1080, height: 1920},
  ep03: {name: 'Ep03', Frame: Ep03Frame, duration: EP03_DURATION, shotTimes: EP03_SHOT_TIMES, shotIndexAt: shot03, toSource: (f: number) => f, width: EP03_W, height: EP03_H},
  ep04: {name: 'Ep04', Frame: Ep04Frame, duration: EP04_DURATION, shotTimes: EP04_SHOT_TIMES, shotIndexAt: shot04, toSource: (f: number) => f, width: EP04_W, height: EP04_H, sections: EP04_SECTIONS},
  ep05: {name: 'Ep05', Frame: Ep05Frame, duration: EP05_DURATION, shotTimes: EP05_SHOT_TIMES, shotIndexAt: ep05ShotAt, toSource: (f: number) => f, width: EP05_W, height: EP05_H, sections: EP05_SECTIONS},
  ep06: {name: 'Ep06', Frame: Ep06Frame, duration: EP06_DURATION, shotTimes: EP06_SHOT_TIMES, shotIndexAt: ep06ShotAt, toSource: (f: number) => f, width: EP06_W, height: EP06_H, sections: EP06_SECTIONS},
  ep07: {name: 'Ep07', Frame: Ep07Frame, duration: EP07_DURATION, shotTimes: EP07_SHOT_TIMES, shotIndexAt: ep07ShotAt, toSource: (f: number) => f, width: EP07_W, height: EP07_H, sections: EP07_SECTIONS},
  ep08: {name: 'Ep08', Frame: Ep08Frame, duration: EP08_DURATION, shotTimes: EP08_SHOT_TIMES, shotIndexAt: ep08ShotAt, toSource: (f: number) => f, width: EP08_W, height: EP08_H, sections: EP08_SECTIONS},
  ep09: {name: 'Ep09', Frame: Ep09Frame, duration: EP09_DURATION, shotTimes: EP09_SHOT_TIMES, shotIndexAt: ep09ShotAt, toSource: (f: number) => f, width: EP09_W, height: EP09_H, sections: EP09_SECTIONS},
  ep10: {name: 'Ep10', Frame: Ep10Frame, duration: EP10_DURATION, shotTimes: EP10_SHOT_TIMES, shotIndexAt: ep10ShotAt, toSource: (f: number) => f, width: EP10_W, height: EP10_H, sections: EP10_SECTIONS},
  konka01: {name: 'Konka Short01', Frame: K01Frame, duration: K01_DURATION, shotTimes: K01_SHOT_TIMES, shotIndexAt: k01ShotIndexAt, toSource: (f: number) => f, width: K01_W, height: K01_H, sections: K01_PLAN.map((p) => p.section)},
};

const out = process.argv[2] || 'out/fla-export/capture.json';
const ep = EPISODES[(process.argv[3] || 'ep01') as keyof typeof EPISODES];
if (!ep) throw new Error(`unknown episode ${process.argv[3]} (have: ${Object.keys(EPISODES).join(', ')})`);
const frames: (Capture & {f: number; shot: number})[] = [];

// No camera in the Animate file (the animator does the camera there): every frame is taken back
// out of its shot's camera and laid on one fixed full-stage view (zoom 1, centred), so characters,
// props and sets sit at their real positions and nothing zooms, pans or punches in.
type M6 = [number, number, number, number, number, number];
const mul = (m1: M6, m2: M6): M6 => {
  const [a1, b1, c1, d1, x1, y1] = m1;
  const [a2, b2, c2, d2, x2, y2] = m2;
  return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1];
};
const inv = (m: M6): M6 => {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
};
const KEEP_CAMERA = process.argv.includes('--keep-camera');
const BASE: M6 = [1, 0, 0, 1, 0, 0]; // world = stage: the full set at zoom 1
const noCamera = (cap: Capture) => {
  const cam = cap.background?.cam as M6 | undefined;
  if (KEEP_CAMERA || !cam) return;
  const X = mul(BASE, inv(cam));
  for (const c of cap.chars) c.outer = mul(X, c.outer as M6);
  for (const p of cap.props) p.matrix = mul(X, p.matrix as M6);
  cap.background!.cam = BASE;
};
for (let f = 0; f < ep.duration; f++) {
  const cap: Capture = {chars: [], graphics: [], props: [], caption: null};
  renderToStaticMarkup(
    <CaptureContext.Provider value={cap}>
      <ep.Frame f={ep.toSource(f)} />
    </CaptureContext.Provider>,
  );
  noCamera(cap);
  frames.push({f, shot: ep.shotIndexAt(ep.toSource(f)), ...cap});
}
fs.mkdirSync(out.replace(/\/[^/]+$/, ''), {recursive: true});
// Animate scenes: one per section (where the plan names its sections), starting on that section's first shot
const sections = (ep as {sections?: string[]}).sections;
const scenes = sections
  ? sections.flatMap((name, i) => (i === 0 || name !== sections[i - 1] ? [{name: name !== name.toUpperCase() ? name : name.replace(/^STEP (\d) — /, '').replace(/^THE /, '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), start: Math.ceil(ep.shotTimes[i] * 30 - 1e-6)}] : []))
  : undefined;
if (scenes) scenes[0].start = 0; // the first scene always starts the file
fs.writeFileSync(out, JSON.stringify({episode: ep.name, fps: 30, width: ep.width, height: ep.height, duration: ep.duration, shotTimes: ep.shotTimes, scenes, frames}));
console.log(`captured ${ep.name}: ${frames.length} frames → ${out}`);
