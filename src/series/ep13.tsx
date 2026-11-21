import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, VStage, lipFrame} from './kit';
import {swoopZoom, useMarkerFont} from './filterKit';
import {DoodleAnim} from '../components/StickFigures';
import {Ep13Anim} from './ep13board';
import {V3_PANELS as PANELS, V3_PUSH as PUSH, V3_HOLD as HOLD, v3Section, v3Start} from './ep13v3';
import wordsJson from './data/ep13-words.json';
import envJson from './data/ep13-env.json';

/**
 * EBO TEACHES MONEY — Ep 13 "Someone Stepped on My Foot. I Said Sorry." (vertical, ~59 s). The storytime style:
 * Ebo tells his own story in voice-over, the cast acts it out in real sets (storyboard v3, after the user's reference). 46 shots: the shoe stomps,
 * the doors slide, the phone slaps down, people walk past,
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

/** When each of the 46 panels starts (storyboard v3, from the word timings). */
const START = v3Start(at, after);
export const EP13_SHOT_TIMES = START;
export const EP13_SECTIONS = START.map((_, i) => v3Section(i));
export const ep13ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < START.length; k++) if (t >= START[k]) i = k;
  return i;
};
const LEN = START.map((s, i) => (i + 1 < START.length ? START[i + 1] : END) - s);

// ───────────────────────── sound ─────────────────────────
export const EP13_SFX = () => [
  ...[0, 0.25, 0.5, 0.75, 1.0].map((d) => ({at: d, sfx: 'footstep', vol: 0.4})), // walking down the street
  {at: START[1] + 0.2, sfx: 'body_thud', vol: 0.9}, {at: START[1] + 0.22, sfx: 'crunch', vol: 0.5}, // the stomp
  {at: START[7] + 0.2, sfx: 'paper_flick', vol: 0.6}, // the notepad comes out
  ...[10, 13, 16].map((i) => ({at: START[i] + 0.12, sfx: 'marker_tick', vol: 0.8})), // she writes a mark: one, two, three
  {at: START[14], sfx: 'whoosh', vol: 0.5}, {at: START[14] + 0.24, sfx: 'body_thud', vol: 0.7}, // the bump
  {at: START[17], sfx: 'slide', vol: 0.5}, // the automatic doors
  {at: START[18] + 0.15, sfx: 'cha_ching', vol: 0.4}, // paying the barista
  {at: START[19] + 0.15, sfx: 'paper_flick', vol: 0.7}, // the full notepad held up
  {at: START[20] + 0.1, sfx: 'cricket', vol: 0.6},
  ...[0, 0.35, 0.7, 1.05].map((d) => ({at: START[22] + d, sfx: 'footstep', vol: 0.45})), // the waiter walks past
  {at: START[23], sfx: 'typing', vol: 0.3}, // the boss on his phone
  {at: START[25] + 0.2, sfx: 'slide', vol: 0.4}, // he shrinks into the couch
  {at: START[28] + 0.2, sfx: 'clink', vol: 0.5}, // the mug on the kitchen table
  {at: START[36] + 0.18, sfx: 'slap', vol: 0.8}, {at: START[36] + 0.2, sfx: 'click', vol: 0.6}, // the phone slapped face-down
  ...[0, 0.25, 0.5, 0.75, 1.0, 1.25].map((d) => ({at: START[39] + d, sfx: 'footstep', vol: 0.45})), // walking home
  {at: START[40] + 0.2, sfx: 'body_thud', vol: 0.9}, {at: START[40] + 0.22, sfx: 'crunch', vol: 0.5}, // the stomp again
  ...START.slice(1).filter((_, k) => k !== 25).map((s) => ({at: s, sfx: 'swoosh', vol: 0.16})), // a soft swoosh on every cut (not into the held shot 27)
];
export const EP13_SLAMS: number[] = [];

// ───────────────────────── the frame ─────────────────────────
export const Ep13Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep13ShotAt(f);
  const local = t - START[i];
  const zoom = HOLD.has(i + 1) || HOLD.has(i + 2) ? 1 : swoopZoom(PUSH.has(i + 1) ? 'push' : 'reveal', local, LEN[i]);
  const speaker = Object.keys(ENV).find((k) => (ENV[k][f] ?? 0) > 0.1);
  const mouth = speaker ? lipFrame(ENV[speaker], WORDS, f) : undefined;
  return (
    <StageSizeContext.Provider value={{w: EP13_W, h: EP13_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value={false}>
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
