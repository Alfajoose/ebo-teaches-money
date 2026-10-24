// Records, frame by frame, what every character, graphic and caption does in Episode 1,
// for building the Animate .fla. Bundled with esbuild and run in Node:
//   node scripts/export-fla/run-capture.mjs  ->  out/fla-export/capture.json
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'fs';
import {Ep01Frame, EP01_DURATION, EP01_SHOT_TIMES, shotIndexAt} from '../../src/series/ep01';
import {Capture, CaptureContext} from '../../src/series/exportCtx';

const out = process.argv[2] || 'out/fla-export/capture.json';
const frames: (Capture & {f: number; shot: number})[] = [];
for (let f = 0; f < EP01_DURATION; f++) {
  const cap: Capture = {chars: [], graphics: [], props: [], caption: null};
  renderToStaticMarkup(
    <CaptureContext.Provider value={cap}>
      <Ep01Frame f={f} />
    </CaptureContext.Provider>,
  );
  frames.push({f, shot: shotIndexAt(f), ...cap});
}
fs.mkdirSync(out.replace(/\/[^/]+$/, ''), {recursive: true});
fs.writeFileSync(out, JSON.stringify({episode: 'Ep01', fps: 30, width: 1080, height: 1920, duration: EP01_DURATION, shotTimes: EP01_SHOT_TIMES, frames}));
console.log(`captured ${frames.length} frames → ${out}`);
