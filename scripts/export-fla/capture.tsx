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
import {Capture, CaptureContext} from '../../src/series/exportCtx';

const EPISODES = {
  ep01: {name: 'Ep01', Frame: Ep01Frame, duration: EP01_DURATION, shotTimes: EP01_SHOT_TIMES, shotIndexAt: shot01, toSource: ep01ToSource, width: 1080, height: 1920},
  ep02: {name: 'Ep02', Frame: Ep02Frame, duration: EP02_DURATION, shotTimes: EP02_SHOT_TIMES, shotIndexAt: shot02, toSource: ep02ToSource, width: 1080, height: 1920},
  ep03: {name: 'Ep03', Frame: Ep03Frame, duration: EP03_DURATION, shotTimes: EP03_SHOT_TIMES, shotIndexAt: shot03, toSource: (f: number) => f, width: EP03_W, height: EP03_H},
  ep04: {name: 'Ep04', Frame: Ep04Frame, duration: EP04_DURATION, shotTimes: EP04_SHOT_TIMES, shotIndexAt: shot04, toSource: (f: number) => f, width: EP04_W, height: EP04_H},
};

const out = process.argv[2] || 'out/fla-export/capture.json';
const ep = EPISODES[(process.argv[3] || 'ep01') as keyof typeof EPISODES];
if (!ep) throw new Error(`unknown episode ${process.argv[3]} (have: ${Object.keys(EPISODES).join(', ')})`);
const frames: (Capture & {f: number; shot: number})[] = [];
for (let f = 0; f < ep.duration; f++) {
  const cap: Capture = {chars: [], graphics: [], props: [], caption: null};
  renderToStaticMarkup(
    <CaptureContext.Provider value={cap}>
      <ep.Frame f={ep.toSource(f)} />
    </CaptureContext.Provider>,
  );
  frames.push({f, shot: ep.shotIndexAt(ep.toSource(f)), ...cap});
}
fs.mkdirSync(out.replace(/\/[^/]+$/, ''), {recursive: true});
fs.writeFileSync(out, JSON.stringify({episode: ep.name, fps: 30, width: ep.width, height: ep.height, duration: ep.duration, shotTimes: ep.shotTimes, frames}));
console.log(`captured ${ep.name}: ${frames.length} frames → ${out}`);
