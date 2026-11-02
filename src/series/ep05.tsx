import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose, POSES} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {StageSizeContext, Slam} from './exportCtx';
import {VFPS, Word, VStage, Framing} from './kit';
import {C} from '../theme';
import wordsJson from './data/ep05-words.json';

/**
 * EBO TEACHES MONEY — Ep 05 "Never Run Out of Things to Say" (YouTube Short, 1080×1920, ~38s).
 * Cold open (approved hook): Ama's line, Ebo's flat "Oh, nice.", a dead beat, then Ebo to camera.
 * Ebo teaches on the plain backdrop; the conversation plays as a two-shot with Ama. Each grabbed
 * word pops up handwritten (Chicago → wedding → caterer) and stays, building a little chain. The
 * camera holds still (house rule 11); Ebo faces us (14); the last line cuts straight back to the
 * first for the loop. Shots start on the first word of their line (episodes/ep05/words.json).
 */
export const EP05_W = 1080;
export const EP05_H = 1920;
type W5 = Word & {who: 'ebo' | 'ama'};
const WORDS = wordsJson as W5[];
const END = WORDS[WORDS.length - 1].e + 0.35;
export const EP05_DURATION = Math.ceil(END * VFPS);

const FLOOR = 1500;
const Z = (zoom: number, cx: number, cy: number): Framing => ({zoom, cx, cy});
const TWO = Z(1.15, 555, 1060); // both of them, knees up
const BUST = Z(1.8, 540, 980); // Ebo alone, chest up, to camera
const CU_EBO = Z(1.9, 330, 960);
const CU_AMA = Z(1.7, 790, 900);
const EBO_TWO_X = 320;
const AMA_X = 800;
const EBO_SCALE = 1.75;
const AMA_SCALE = 1.5;

type Shot = {
  /** first word of the line (index into words.json), or a time in seconds */
  at: number | {t: number};
  line: string;
  size: string;
  frame: Framing;
  ebo?: {x?: number; pose: Pose};
  ama?: {pose: Pose; talking?: boolean};
  /** grabbed words shown (the chain grows), and which one just popped */
  chain?: number;
  action: string;
};

const amaPose = (x: Partial<Pose>): Pose => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const ebo = (p: Pose, x?: number) => ({pose: p, x});

export const EP05_PLAN: Shot[] = [
  {at: 0, line: 'I just got back from Chicago.', size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'open', mouth: 'flat', lookX: 14}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'wide', mouth: 'grin', armR: [60, -30]}), talking: true}, action: 'Cold open, mid-conversation. Ama, bright, tells Ebo her news. Ebo listens with a blank face.'},
  {at: 6, line: '"…Oh, nice."', size: 'CU Ebo', frame: CU_EBO, ebo: ebo({...POSE.stand, eyes: 'half', mouth: 'flat', lookX: 14, armL: [4, 2], armR: [4, 2]}, EBO_TWO_X), ama: {pose: amaPose({})}, action: 'Ebo, flat and limp: "Oh, nice." Nothing else.'},
  {at: {t: 3.2}, line: '(dead silence)', size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'open', mouth: 'flat', lookX: 14, armL: [4, 2], armR: [4, 2]}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'half', mouth: 'flat'})}, action: 'The dead beat: Ama\'s smile drops. Both frozen. One awkward second.'},
  {at: 8, line: "Don't be that guy.", size: 'BUST', frame: BUST, ebo: ebo({...POSE.pointAtYou, eyes: 'squint', mouth: 'smirk'}), action: 'Hard cut: Ebo alone on the backdrop, to camera, pointing at us.'},
  {at: 12, line: "Here's the fix. Grab one word and ask about it.", size: 'BUST', frame: BUST, ebo: ebo({...POSE.stand, armR: [100, -20], armL: [12, 6], eyes: 'happy', mouth: 'grin'}), action: 'Ebo explains, hands talking; on "grab" his hand snaps up and grabs the air.'},
  {at: 22, line: '"Chicago? What took you there?"', size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'wide', mouth: 'o', lookX: 16, tilt: 6, armR: [60, -30]}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'open', mouth: 'smile'})}, chain: 1, action: 'Back in the two-shot. Ebo leans in, curious. "Chicago" pops up handwritten over them.'},
  {at: 27, line: '"My sister\'s wedding."', size: 'CU Ama', frame: CU_AMA, ebo: ebo({...POSE.stand, lookX: 16}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'open', mouth: 'smile', armR: [40, -30]}), talking: true}, chain: 1, action: 'Ama, warm, opening up.'},
  {at: 30, line: 'Grab another.', size: 'BUST', frame: BUST, ebo: ebo({...POSE.stand, eyes: 'happy', mouth: 'smirk', armR: [100, -20]}), chain: 1, action: 'Quick aside to camera: Ebo grabs the air again, a little smug.'},
  {at: 32, line: '"How was the wedding?"', size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'wide', mouth: 'o', lookX: 16, tilt: 6, armL: [50, -30]}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'open', mouth: 'smile'})}, chain: 2, action: 'Two-shot. "wedding" pops up next to "Chicago".'},
  {at: 36, line: '"Chaos. The caterer didn\'t show up!"', size: 'CU Ama', frame: CU_AMA, ebo: ebo({...POSE.stand, lookX: 16}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'happy', mouth: 'grin', armL: [100, -20], armR: [100, -20]}), talking: true}, chain: 3, action: 'Ama laughs, arms up — the story is pouring out now. "caterer" pops up.'},
  {at: 42, line: '"No! So what did you eat?"', size: 'TWO', frame: TWO, ebo: ebo({...POSE.shocked, eyes: 'wide', mouth: 'o', lookX: 16}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'wide', mouth: 'grin'})}, chain: 3, action: 'Ebo gasps, arms out, hooked. Ama grinning.'},
  {at: 48, line: 'You said almost nothing, and she told you a whole story.', size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'happy', mouth: 'smile', lookX: 16}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'wide', mouth: 'grin', armR: [80, -30], armL: [50, -20]}), talking: true}, chain: 3, action: 'Ama mid-story, gesturing big (mouth moving, no sound); Ebo just nods. The word chain sits over them.'},
  {at: 59, line: "That's how you win clients, jobs and deals, one conversation at a time.", size: 'BUST', frame: BUST, ebo: ebo({...POSE.stand, eyes: 'happy', mouth: 'grin', armL: [55, -30], armR: [55, -30]}), action: 'Ebo to camera, hands on the beats: clients… jobs… deals.'},
  {at: 72, line: 'So next time you freeze,', size: 'BUST', frame: BUST, ebo: ebo({...POSE.stand, eyes: 'wide', mouth: 'flat', armL: [2, 0], armR: [2, 0]}), action: 'Ebo goes stiff — frozen, eyes wide.'},
  {at: 77, line: "don't search your head for something clever.", size: 'BUST', frame: BUST, ebo: ebo({...POSE.stand, eyes: 'suspicious', mouth: 'flat', lookY: -16, lookX: 6, armR: [100, -20]}), action: 'Eyes roll up, searching his head; then he shakes it off.'},
  {at: 84, line: "The answer's in what they just said.", size: 'TWO', frame: TWO, ebo: ebo({...POSE.stand, eyes: 'happy', mouth: 'smile', armR: [88, 0], lookX: 16}, EBO_TWO_X), ama: {pose: amaPose({eyes: 'open', mouth: 'smile'})}, chain: 3, action: 'Ebo points at Ama, smiling. LOOP: hard cut straight back to "I just got back from Chicago."'},
];

export const ep05Times = () => {
  const starts = EP05_PLAN.map((s) => (typeof s.at === 'number' ? Math.max(0, WORDS[s.at].s - 0.08) : s.at.t));
  starts[0] = 0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : END) - st}));
};
const TIMES = ep05Times();
export const EP05_SHOT_TIMES = TIMES.map((x) => x.start);
export const ep05ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < TIMES.length; k++) if (t >= TIMES[k].start) i = k;
  return i;
};

/** The grabbed words: handwritten, popping in on the word, then staying as a chain. */
const GRABBED = [
  {text: 'Chicago', at: WORDS[22].s, x: 270, y: 300, rot: -6},
  {text: 'wedding', at: WORDS[35].s, x: 560, y: 420, rot: 4},
  {text: 'caterer', at: WORDS[38].s, x: 820, y: 300, rot: -5},
];
const MARKER = 'EboMarker';
const useMarkerFont = () => {
  const [handle] = useState(() => delayRender('marker font'));
  useEffect(() => {
    const f = new FontFace(MARKER, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`);
    f.load().then((ff) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};
const Chain: React.FC<{n: number; t: number}> = ({n, t}) => (
  <g>
    {GRABBED.slice(0, n).map((g, i) => (
      <Slam key={g.text} t={t} at={g.at} dist={-60} twist={g.rot}>
        <g transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`}>
          <text textAnchor="middle" fontFamily={MARKER} fontSize={104} fill={i === n - 1 ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">
            {g.text}
          </text>
        </g>
        {i > 0 && (
          // a short hand-drawn arrow from the last word to this one
          <g stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M ${GRABBED[i - 1].x + (i === 1 ? 60 : 150)} ${GRABBED[i - 1].y + (i === 1 ? 30 : -20)} L ${g.x + (i === 1 ? -110 : -170)} ${g.y + (i === 1 ? -60 : 10)}`} />
          </g>
        )}
      </Slam>
    ))}
  </g>
);

export const Ep05Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep05ShotAt(f);
  const s = EP05_PLAN[i];
  return (
    <StageSizeContext.Provider value={{w: EP05_W, h: EP05_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={s.frame} bg="#D2C4EE" blurBg={<Backdrop id="ep05" />} overlay={s.chain ? <Chain n={s.chain} t={t} /> : undefined}>
              {s.ama && <RigCharacter who="ama" x={AMA_X} y={FLOOR} scale={AMA_SCALE} facing={-1} t={f} pose={gentle(s.ama.pose)} />}
              {s.ebo && <RigCharacter who="ebo" x={s.ebo.x ?? 540} y={FLOOR} scale={EBO_SCALE} t={f} pose={gentle(frontOn(s.ebo.pose))} />}
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp05: React.FC = () => <Ep05Frame f={useCurrentFrame()} />;
