import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {StageSizeContext, Slam} from './exportCtx';
import {VFPS, Word, VStage, Framing, lipFrame, beatGesture} from './kit';
import {C} from '../theme';
import {AppPhone, ChainsWorn} from '../components/WantsProps';
import {NeedBox, FoodBowl, DeliveryBag, ModelPhone, Shirt} from '../components/WantsInserts';
import {ep07Times, EP07_W, EP07_H} from './ep07';
import wordsJson from './data/ep07-words.json';
import envJson from './data/ep07-env.json';

/**
 * TEST: Ep7's "sneaky ones" section (shots 10–15) re-staged after the user's reference video:
 * the prop gets the room. Ebo is smaller at the bottom of the frame and the thing he's talking about
 * is drawn big above him (need on one side, want on the other, each landing on its word); the
 * streaming apps get the whole frame with Ebo's head in the corner. Same voice and timing as Ep7.
 * Still camera, hard cuts; Ebo stands, faces us, gentle arms, hands on the beat.
 */
const WORDS = wordsJson as (Word & {who: 'ebo'})[];
const ENV = (envJson as Record<string, number[]>).ebo;
const TIMES = ep07Times();
const FIRST = 9; // "Now watch the sneaky ones."
const LAST = 14; // "Four streaming apps. …I watch one."
const T0 = TIMES[FIRST].start;
const T1 = TIMES[LAST + 1].start;
export const EP07T_DURATION = Math.ceil((T1 - T0) * VFPS);
const at = (k: number) => WORDS[k].s;
const MARKER = 'EboMarker';
const useMarkerFont = () => {
  const [handle] = useState(() => (typeof document === 'undefined' ? null : delayRender('marker font')));
  useEffect(() => {
    if (handle === null) return;
    const ff = new FontFace(MARKER, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`);
    ff.load().then((x) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(x);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};
const talking = (f: number) => (ENV[f] ?? 0) > 0.1;

const WIDE: Framing = {zoom: 1, cx: 540, cy: 960}; // whole stage: Ebo small at the bottom
const BUST: Framing = {zoom: 1.8, cx: 540, cy: 980};
const FLOOR = 1500;

/** A handwritten label (need / want) that lands with its prop. */
const Label: React.FC<{x: number; y: number; text: string; red?: boolean; rot?: number}> = ({x, y, text, red, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor="middle" fontFamily={MARKER} fontSize={84} fill={red ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={12} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  </g>
);
/** need on the left, want on the right, each slamming in on its word. */
const Pair: React.FC<{t: number; needAt: number; wantAt: number; need: React.ReactNode; want: React.ReactNode}> = ({t, needAt, wantAt, need, want}) => (
  <g>
    <Slam t={t} at={needAt} dist={-80} twist={-4}>
      <g>
        <g transform="translate(285 840) scale(1.6)">{need}</g>
        <Label x={275} y={470} text="need" rot={-4} />
      </g>
    </Slam>
    <Slam t={t} at={wantAt} dist={-80} twist={4}>
      <g>
        <g transform="translate(780 840) scale(1.6)">{want}</g>
        <Label x={805} y={470} text="want" red rot={4} />
      </g>
    </Slam>
  </g>
);

type Shot = {frame: Framing; pose: Partial<Pose>; ebo?: {x: number; y: number; scale: number}; board?: (t: number) => React.ReactNode; arms?: (t: number) => Partial<Pose> | null; hold?: (t: number) => React.ReactNode};
const PLAN: Record<number, Shot> = {
  // "Now watch the sneaky ones. A need with a want hiding inside." — the NEED box; a want peeks out of it on "want hiding"
  9: {frame: WIDE, pose: {eyes: 'suspicious', mouth: 'smirk'}, board: (t) => (
    <g>
      <g transform="translate(540 860) scale(1.6)"><NeedBox peek={Math.min(1, Math.max(0, (t - at(79)) / 0.25))} /></g>
      <Slam t={t} at={at(79)} dist={-40} twist={6}><Label x={800} y={470} text="want" red rot={8} /></Slam>
    </g>
  ), arms: (t) => (t >= at(79) ? {armR: [100, -10]} : null)},
  // "You need food. You want delivery."
  10: {frame: WIDE, pose: {eyes: 'open', mouth: 'smile'}, board: (t) => <Pair t={t} needAt={at(83)} wantAt={at(86)} need={<FoodBowl />} want={<DeliveryBag />} />,
    arms: (t) => (t >= at(85) ? {armL: [100, -10], armR: [12, 6]} : t >= at(82) ? {armR: [100, -10], armL: [12, 6]} : null)},
  // "You need a phone. You want the new one. Every year." — on "Every year" the new one keeps coming: 2025, 2026, 2027
  11: {frame: WIDE, pose: {eyes: 'half', mouth: 'smirk'}, board: (t) => (
    <g>
      <Pair t={t} needAt={at(89)} wantAt={at(93)} need={<ModelPhone />} want={<ModelPhone fresh year={t >= at(98) ? '2027' : t >= at(97) + 0.3 ? '2026' : t >= at(97) ? '2025' : undefined} />} />
    </g>
  ), arms: (t) => (t >= at(92) ? {armL: [100, -10], armR: [12, 6]} : t >= at(88) ? {armR: [100, -10], armL: [12, 6]} : null)},
  // "You need clothes. You want the brand."
  12: {frame: WIDE, pose: {eyes: 'open', mouth: 'smile'}, board: (t) => <Pair t={t} needAt={at(100)} wantAt={at(103)} need={<Shirt />} want={<Shirt brand />} />,
    arms: (t) => (t >= at(102) ? {armL: [100, -10], armR: [12, 6]} : t >= at(99) ? {armR: [100, -10], armL: [12, 6]} : null)},
  // "And the sneakiest of all: subscriptions." — back close on him: the scale change is the punctuation
  13: {frame: BUST, pose: {eyes: 'squint', mouth: 'flat'}},
  // "Four streaming apps. …I watch one." — the phone fills the frame; his head peeks in at the corner
  14: {frame: WIDE, pose: {eyes: 'open', mouth: 'flat', lookX: -18, lookY: -12}, ebo: {x: 860, y: 2350, scale: 2.4}, board: (t) => (
    <g transform="translate(470 820) rotate(-4)">
      <g transform="scale(3.3)"><AppPhone screen="apps" watched={t >= at(115)} /></g>
    </g>
  ), arms: () => ({armL: [12, 6], armR: [12, 6]})},
};

export const Ep07TestFrame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = T0 + f / VFPS;
  const F = Math.round(t * VFPS); // the episode frame (voice envelope, lip sync)
  let i = FIRST;
  for (let k = FIRST; k <= LAST; k++) if (t >= TIMES[k].start) i = k;
  const s = PLAN[i];
  const shotEnd = TIMES[i].start + TIMES[i].length;
  let pose: Pose = {...POSE.stand, ...s.pose} as Pose;
  if (i === 14 && t >= at(115)) pose = {...pose, eyes: 'squeeze', mouth: 'grimace'};
  const acted = s.arms?.(t);
  pose = acted ? {...pose, ...acted} : beatGesture(pose, WORDS, ENV, F, TIMES[i].start, shotEnd);
  const e = s.ebo ?? (s.frame === WIDE ? {x: 540, y: 1850, scale: 1.4} : {x: 540, y: FLOOR, scale: 1.75});
  return (
    <StageSizeContext.Provider value={{w: EP07_W, h: EP07_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={s.frame} bg="#D2C4EE" blurBg={<Backdrop id="ep07t" />} overlay={s.board?.(t)}>
              <RigCharacter who="ebo" x={e.x} y={e.y} scale={e.scale} t={F} pose={gentle(frontOn(pose))} wear={<ChainsWorn count={3} />}
                mouthFrame={talking(F) ? lipFrame(ENV, WORDS, F) : undefined} />
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp07Test: React.FC = () => (
  <>
    <Ep07TestFrame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep07/voice.mp3')} trimBefore={Math.round(T0 * VFPS)} />
    <Html5Audio src={staticFile('ebo-ep07/sfx.mp3')} trimBefore={Math.round(T0 * VFPS)} />
  </>
);
