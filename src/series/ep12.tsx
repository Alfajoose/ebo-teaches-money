import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, VStage, lipFrame} from './kit';
import {swoopZoom, useMarkerFont} from './filterKit';
import {DoodleAnim} from '../components/StickFigures';
import {PANELS} from './ep12board';
import wordsJson from './data/ep12-words.json';
import envJson from './data/ep12-env.json';

/**
 * EBO TEACHES MONEY — Ep 12 "Why Saying Sorry Too Much Makes People Respect You Less" (vertical, ~41 s).
 * The experiment: Ebo narrates (and voices the stick guy); his stick-figure doodles act it out on a sketchbook page.
 * 40 shots, about one a second (the user's density), each one of the storyboard's panels brought to life: the page
 * "boils" like hand-drawn animation, bubbles drop in, the stick figures move in the key moments, the camera pushes
 * in or pulls back on every cut, Ebo lip-syncs to camera.
 */
export const EP12_W = 1080;
export const EP12_H = 1920;
const WORDS = wordsJson as (Word & {who: string})[];
const ENV = (envJson as Record<string, number[]>).ebo;
const END = WORDS[WORDS.length - 1].e + 0.9;
export const EP12_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s - 0.06;
const after = (k: number, d = 0) => WORDS[k].e + 0.08 + d;

/** When each of the 40 panels starts (the storyboard's shots, in order). */
const START = [
  0, after(2), at(3), at(4), after(6), after(6, 0.6), at(7), after(7, 0.5), after(7, 1.05), at(8),
  after(12), after(12, 0.6), at(13), at(15), at(18), at(19), after(24), at(25), at(29), at(33),
  at(36), at(39), at(43), at(46), after(47), at(48), after(50), at(51), after(53), at(54),
  after(57), at(58), at(61), after(66), at(67), after(70), at(71), after(74), at(75), at(77),
].map((s) => Math.max(0, s));
export const EP12_SHOT_TIMES = START;
export const EP12_SECTIONS = START.map((_, i) => (i < 17 ? 'The Mistake' : i < 22 ? 'Why' : i < 26 ? 'The Fix' : i < 39 ? 'The Replay' : 'Close'));
export const ep12ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < START.length; k++) if (t >= START[k]) i = k;
  return i;
};
const LEN = START.map((s, i) => (i + 1 < START.length ? START[i + 1] : END) - s);
/** Close-ups and inserts push in; everything else pulls back (rule 21). */
const PUSH = new Set([2, 3, 4, 5, 8, 15, 16, 17, 22, 27, 34, 35, 37, 39]);

// ───────────────────────── sound ─────────────────────────
export const EP12_SFX = () => [
  {at: after(2) - 0.05, sfx: 'slap', vol: 0.6}, // the café door bangs
  ...[0, 0.12, 0.24].map((d) => ({at: after(2) + d, sfx: 'footstep', vol: 0.5})),
  {at: after(6, 0.6), sfx: 'body_thud', vol: 0.8}, {at: after(6, 0.62), sfx: 'pop', vol: 0.6}, // BONK
  {at: at(7) + 0.5, sfx: 'cricket', vol: 0.7},
  {at: after(7, 0.5), sfx: 'slap', vol: 0.8}, // papers on the desk
  {at: after(12, 0.6), sfx: 'body_thud', vol: 0.7}, // street collision
  {at: at(18), sfx: 'click', vol: 0.6}, // the lift doors
  {at: at(19), sfx: 'phone_buzz', vol: 0.5}, {at: after(24), sfx: 'phone_buzz', vol: 0.5},
  ...[at(29), at(33), at(36)].map((a) => ({at: a, sfx: 'pop', vol: 0.5})), // the counter
  {at: at(46), sfx: 'marker_tick', vol: 0.7}, {at: after(47), sfx: 'marker_tick', vol: 0.8}, {at: at(48), sfx: 'marker_tick', vol: 0.7},
  {at: after(50), sfx: 'whoosh', vol: 0.4},
  {at: after(53), sfx: 'clink', vol: 0.6}, // the drink
  {at: after(70), sfx: 'phone_buzz', vol: 0.4},
  {at: at(71), sfx: 'cha_ching', vol: 0.4},
  {at: after(74), sfx: 'body_thud', vol: 0.8}, {at: after(74) + 0.02, sfx: 'pop', vol: 0.6}, // BONK again
  ...START.slice(1).map((s) => ({at: s, sfx: 'swoosh', vol: 0.18})), // a soft swoosh on every cut
];
export const EP12_SLAMS: number[] = [];

// ───────────────────────── the frame ─────────────────────────
export const Ep12Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep12ShotAt(f);
  const local = t - START[i];
  const zoom = swoopZoom(PUSH.has(i + 1) ? 'push' : 'reveal', local, LEN[i]);
  const talking = (ENV[f] ?? 0) > 0.1;
  // the line boil: the drawing re-settles every 4 frames, a pixel or two, like hand-drawn animation
  const b = Math.floor(f / 4);
  const jx = ((b * 37) % 5) - 2;
  const jy = ((b * 53) % 5) - 2;
  const jr = (((b * 29) % 7) - 3) * 0.08;
  return (
    <StageSizeContext.Provider value={{w: EP12_W, h: EP12_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <VStage framing={{zoom, cx: 540, cy: 960}} bg="#FFFDF6">
              <DoodleAnim.Provider value={{l: local, f, mouth: talking ? lipFrame(ENV, WORDS, f) : undefined}}>
                <g transform={`translate(${jx} ${jy}) rotate(${jr} 540 960)`}>{PANELS[i](local)}</g>
              </DoodleAnim.Provider>
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp12: React.FC = () => (
  <>
    <Ep12Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep12/voice.mp3')} />
    <Html5Audio src={staticFile('ebo-ep12/sfx.mp3')} />
  </>
);
