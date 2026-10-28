import React from 'react';
import {Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {Ep01Frame} from './ep01';
import {LayerMode, LayerModeContext} from './exportCtx';
import {VFPS} from './kit';
import shortEditJson from './data/ep01short-edit.json';

/**
 * Episode 1 — short cut (~37 s). Re-edits the full episode by mapping each output
 * frame onto a source frame, so animation, captions and lip sync stay exactly in sync.
 * The matching audio (public/ebo-ep01/voice-short.mp3) is cut from the same segments
 * by scripts/cut-audio.mjs.
 */

// [start, end] in source seconds — cut points sit in the pauses between words.
export const EP01_SHORT_EDL: [number, number][] = [
  [52.04, 54.4], // cold open: "Ten machines? Now we're talking."  (10 machines, ≈$3,000/mo)
  [0.0, 3.48], // "Want to make money while you sleep? Let's talk vending machines."
  [3.6, 11.48], // Lesson 1: margin
  [11.52, 19.26], // Lesson 2: location … "three dollars a month."
  [19.28, 23.84], // "Put it where people actually are: offices, gyms, schools."
  [31.92, 40.42], // "Here's the real math …"
  [54.4, 56.63], // "Subscribe for more." + end card
];

// the EDL minus Ebo's spoken lesson numbers (scripts/make-edit.mjs); starts round up so a
// segment never shows the last frame of the previous shot
const SEG_FRAMES = (shortEditJson.keep as [number, number][]).map(([a, b]) => [Math.ceil(a * VFPS - 1e-6), Math.round(b * VFPS)] as const);
export const EP01_SHORT_DURATION = SEG_FRAMES.reduce((n, [a, b]) => n + (b - a), 0);

export const shortToSource = (f: number) => {
  let rest = f;
  for (const [a, b] of SEG_FRAMES) {
    if (rest < b - a) return a + rest;
    rest -= b - a;
  }
  const [, lastEnd] = SEG_FRAMES[SEG_FRAMES.length - 1];
  return lastEnd - 1;
};

export const EboEp01Short: React.FC<{layer?: LayerMode}> = ({layer = 'full'}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <Ep01Frame f={shortToSource(f)} />
      {layer === 'full' && <Html5Audio src={staticFile('ebo-ep01/voice-short.mp3')} />}
    </LayerModeContext.Provider>
  );
};
