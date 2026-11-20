import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, VStage, lipFrame} from './kit';
import {swoopZoom, useMarkerFont} from './filterKit';
import {DoodleAnim} from '../components/StickFigures';
import {Ep13Anim} from './ep13board';
import {RIG_PANELS as PANELS} from './ep13rig';
import wordsJson from './data/ep13-words.json';
import envJson from './data/ep13-env.json';

/**
 * EBO TEACHES MONEY — Ep 13 "Someone Stepped on My Foot. I Said Sorry." (vertical, ~59 s). The storytime style:
 * Ebo tells his own story in voice-over, the cast (Ebo, Ama, Mica, Christy, Obuor) acts it out on the sketchbook page. 43 shots, each one
 * of the storyboard's panels brought to life: bubbles drop in, the shoe stomps, the tally fills, Ebo shrinks,
 * everyone bobs and blinks, whoever is speaking lip-syncs, and the camera pushes in or pulls back on every cut.
 */
export const EP13_W = 1080;
export const EP13_H = 1920;
const WORDS = wordsJson as (Word & {who: string})[];
const ENV = envJson as Record<string, number[]>;
const END = WORDS[WORDS.length - 1].e + 1.0;
export const EP13_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s - 0.06;
const after = (k: number, d = 0) => WORDS[k].e + 0.08 + d;

/** When each of the 43 panels starts (the storyboard's shots, in order). */
const START = [
  0, at(6), at(9), at(10), at(16), at(26), at(29), at(33), at(38), at(42),
  at(43), at(48), at(51), at(52), at(56), at(58), at(59), at(61), after(61, 0.1), at(62),
  at(69), at(74), at(79), at(84), at(89), at(91), at(97), at(103), at(110), at(113),
  at(116), at(120), at(123), at(128), at(132), at(138), at(141), at(143), at(148), at(155),
  at(160) + 0.22, at(161), at(165),
].map((s) => Math.max(0, s));
export const EP13_SHOT_TIMES = START;
export const EP13_SECTIONS = START.map((_, i) => (i < 7 ? 'Hook' : i < 19 ? 'The Count' : i < 26 ? 'The Cost' : i < 33 ? 'The Rule' : i < 37 ? 'The Change' : 'Button'));
export const ep13ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < START.length; k++) if (t >= START[k]) i = k;
  return i;
};
const LEN = START.map((s, i) => (i + 1 < START.length ? START[i + 1] : END) - s);
/** Close-ups and inserts push in; everything else pulls back. (1-based shot numbers) */
const PUSH = new Set([2, 5, 10, 13, 16, 18, 19, 20, 23, 28, 29, 36, 40, 41]);

// ───────────────────────── sound ─────────────────────────
export const EP13_SFX = () => [
  {at: 0.2, sfx: 'body_thud', vol: 0.9}, {at: 0.22, sfx: 'crunch', vol: 0.5}, // the stomp
  {at: START[6] + 0.2, sfx: 'paper_flick', vol: 0.6}, // the notepad comes out
  ...[9, 12, 15].map((i) => ({at: START[i] + 0.15, sfx: 'marker_tick', vol: 0.8})), // one, two, three
  {at: START[13], sfx: 'whoosh', vol: 0.5}, {at: START[13] + 0.24, sfx: 'body_thud', vol: 0.7}, // the bump
  ...[0, 0.3, 0.6].map((d) => ({at: START[16] + d, sfx: 'slide', vol: 0.35})), // he turns to apologise to each of them
  {at: START[17] + 0.2, sfx: 'paper_flick', vol: 0.7}, // the notebook held up in his face
  {at: START[18] + 0.1, sfx: 'cricket', vol: 0.6},
  ...[0, 0.35, 0.7].map((d) => ({at: START[20] + d, sfx: 'footstep', vol: 0.5})), // the waiter walks past
  {at: START[21], sfx: 'typing', vol: 0.3}, // the boss on his phone
  {at: START[24], sfx: 'slide', vol: 0.5}, // Ebo shrinks
    {at: START[30] + 0.1, sfx: 'clink', vol: 0.5},
  {at: START[34] + 0.1, sfx: 'click', vol: 0.6}, // the phone goes down
  ...[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((d) => ({at: START[37] + d, sfx: 'footstep', vol: 0.45})), // walking home
  {at: START[38] + 0.2, sfx: 'body_thud', vol: 0.9}, {at: START[38] + 0.22, sfx: 'crunch', vol: 0.5}, // the stomp again
  {at: START[40], sfx: 'slap', vol: 0.4},
  ...START.slice(1).map((s) => ({at: s, sfx: 'swoosh', vol: 0.16})), // a soft swoosh on every cut
];
export const EP13_SLAMS: number[] = [];

// ───────────────────────── the frame ─────────────────────────
export const Ep13Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep13ShotAt(f);
  const local = t - START[i];
  const zoom = swoopZoom(PUSH.has(i + 1) ? 'push' : 'reveal', local, LEN[i]);
  const speaker = Object.keys(ENV).find((k) => (ENV[k][f] ?? 0) > 0.1);
  const mouth = speaker ? lipFrame(ENV[speaker], WORDS, f) : undefined;
  return (
    <StageSizeContext.Provider value={{w: EP13_W, h: EP13_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <VStage framing={{zoom, cx: 540, cy: 960}} bg="#FFFDF6">
              <DoodleAnim.Provider value={{l: local, f}}>
                <Ep13Anim.Provider value={{f: f + 1, l: local, speaker, mouth}}>{PANELS[i](local)}</Ep13Anim.Provider>
              </DoodleAnim.Provider>
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp13: React.FC = () => (
  <>
    <Ep13Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep13/voice.mp3')} />
    <Html5Audio src={staticFile('ebo-ep13/sfx.mp3')} />
  </>
);
