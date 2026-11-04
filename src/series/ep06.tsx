import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose, POSES} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {StageSizeContext, Slam} from './exportCtx';
import {VFPS, Word, VStage, Framing, lipFrame, beatGesture} from './kit';
import {C} from '../theme';
import wordsJson from './data/ep06-words.json';
import envJson from './data/ep06-env.json';

/**
 * EBO TEACHES MONEY — Ep 06 "Say No Without the Guilt" (YouTube Short, 1080×1920, ~67s).
 * Cold open: Christy (played by Ama Pretty, the 'pretty' rig) asks to borrow two hundred, Ama caves. Ebo, to camera, names the cost and the
 * three moves; Ama practises each in a coaching two-shot, and each move pops up handwritten,
 * building a chain (Buy time → No to the request → Offer what you can). Christy pushes, Ama holds,
 * a cricket fills the beat, "…Okay. Fair." Ebo's wrap-up recaps the moves over the chain and ends
 * on "A kind no beats a broke yes", which loops back to Christy's first line.
 * Still camera (house rule 11), Ebo faces us (14), hands on the beat (15).
 */
export const EP06_W = 1080;
export const EP06_H = 1920;
type Who = 'ebo' | 'ama' | 'christy';
type W6 = Word & {who: Who};
const WORDS = wordsJson as W6[];
const END = WORDS[WORDS.length - 1].e + 0.4;
export const EP06_DURATION = Math.ceil(END * VFPS);

const FLOOR = 1500;
const Z = (zoom: number, cx: number, cy: number): Framing => ({zoom, cx, cy});
const TWO = Z(1.15, 555, 1060); // two characters, knees up
const BUST = Z(1.8, 540, 980); // Ebo alone, chest up, to camera
const CU_AMA = Z(1.7, 790, 900);
const LEFT_X = 320;
const RIGHT_X = 800;
const EBO_SCALE = 1.75;
const AMA_SCALE = 1.6;
const CHRISTY_SCALE = 1.5; // played by Ama Pretty (cast 'pretty')

type Shot = {
  /** first word of the line (index into words.json), or a time in seconds */
  at: number | {t: number};
  line: string;
  size: string;
  frame: Framing;
  ebo?: {x?: number; pose: Pose};
  ama?: Pose;
  christy?: Pose;
  /** how many of the three moves are on screen (the chain) */
  chain?: number;
  action: string;
};

const stand = (x: Partial<Pose>): Pose => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const ebo = (p: Partial<Pose>, x?: number) => ({pose: {...POSE.stand, ...p} as Pose, x});

export const EP06_PLAN: Shot[] = [
  // ── Cold open ──
  {at: 0, line: '"Hey, can I borrow two hundred? Just till Friday."', size: 'TWO C+A', frame: TWO, christy: stand({mouth: 'grin', armR: [55, -30], lookX: 14}), ama: stand({mouth: 'smile', eyes: 'open'}), action: 'Christy, breezy, hand out. Ama, smiling, frozen. (cha-ching)'},
  {at: 9, line: '"…Of course!"', size: 'CU Ama', frame: CU_AMA, christy: stand({}), ama: stand({eyes: 'wide', mouth: 'grimace', armL: [20, 10], armR: [20, 10]}), action: 'Ama: a forced smile, dying inside.'},
  // ── The problem ──
  {at: 11, line: "That's the third time this month.", size: 'BUST', frame: BUST, ebo: ebo({eyes: 'half', mouth: 'flat'}), action: 'Hard cut: Ebo to camera, dry.'},
  {at: 17, line: 'Rent? Short. Savings? Gone.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'squint', mouth: 'flat'}), action: 'Ticking them off, hands on the beats.'},
  {at: 21, line: 'And Friday? Never comes.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'half', mouth: 'flat', armL: [4, 2], armR: [4, 2]}), action: 'Deadpan. Arms limp.'},
  {at: 25, line: "Here's how to say no and keep the friend.", size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin'}), action: 'Ebo perks up: the fix.'},
  // ── The moves ──
  {at: 34, line: "Don't answer right away. Buy yourself time.", size: 'BUST', frame: BUST, ebo: ebo({eyes: 'open', mouth: 'smile'}), chain: 1, action: '"Buy time" pops up handwritten.'},
  {at: 41, line: '"Let me check and get back to you."', size: 'TWO E+A', frame: TWO, ebo: ebo({eyes: 'happy', mouth: 'smile', lookX: 16}, LEFT_X), ama: stand({eyes: 'open', mouth: 'smile', armR: [40, -20]}), chain: 1, action: 'Coaching two-shot: Ama practises, a little unsure. Ebo nods.'},
  {at: 49, line: 'Then say no to the request, not the person.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'open', mouth: 'smile'}), chain: 2, action: '"No to the request" joins the chain.'},
  {at: 58, line: '"I can\'t lend money right now…"', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'open', mouth: 'flat', armR: [30, -20]}), chain: 2, action: 'Ama, gently, getting the hang of it.'},
  {at: 64, line: 'And offer something you can give.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin'}), chain: 3, action: '"Offer what you can" completes the chain.'},
  {at: 70, line: '"…but I can help you make a budget this weekend?"', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'wide', mouth: 'grin', armL: [50, -30], armR: [50, -30]}), chain: 3, action: 'Ama brightens: that one feels good.'},
  // ── The test ──
  {at: 80, line: '"Come on, you always help me!"', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'sad', mouth: 'wobbly', armL: [70, -30], armR: [70, -30], lookX: 14}), ama: stand({eyes: 'wide', mouth: 'flat'}), action: 'Christy pushes, arms out, whiny. Ama wobbles.'},
  {at: 86, line: 'This is where most people cave. Don\'t.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'squint', mouth: 'flat'}), action: 'Ebo, low, aside to camera. On "Don\'t." his hand comes up: stop.'},
  {at: 93, line: '"I know. And I still can\'t."', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'open', mouth: 'smile', headTilt: 4}), action: 'Ama, steady and warm. She holds.'},
  {at: {t: 0}, line: '(beat — cricket)', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'open', mouth: 'flat'}), ama: stand({eyes: 'open', mouth: 'smile'}), action: 'Silence. Christy blinks. A lone cricket chirps.'},
  {at: 99, line: '"…Okay. Fair."', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'half', mouth: 'smile', armL: [40, -40], armR: [40, -40]}), ama: stand({eyes: 'open', mouth: 'smile'}), action: 'Christy shrugs. No drama.'},
  {at: 101, line: '"Wait. That worked?"', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'wide', mouth: 'o'}), action: 'Ama, stunned… then delighted.'},
  // ── The lesson ──
  {at: 104, line: 'Look what she did. She bought time, said no to the request, not the person, and offered what she could actually give.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'smile'}), chain: 3, action: 'Ebo recaps over the chain; each move turns red as he says it.'},
  {at: 126, line: 'No lies. No drama. No guilt.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin'}), action: 'Three beats, three hand moves.'},
  {at: 132, line: 'And the two hundred? Still in her pocket, where it can pay her rent.', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'happy', mouth: 'grin', armL: [30, -30], armR: [30, -30]}), action: 'Ama, smiling, relieved — rent paid.'},
  {at: 146, line: "People respect a no that's clear and kind.", size: 'BUST', frame: BUST, ebo: ebo({eyes: 'open', mouth: 'smile'}), action: 'Ebo, warm, to camera.'},
  {at: 154, line: 'So next time someone asks and your gut says no… say it.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'squint', mouth: 'smirk'}), action: 'On "say it." he points straight at us.'},
  {at: 166, line: 'A kind no beats a broke yes. Every time.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin', armL: [50, -30], armR: [50, -30]}), action: 'The line. LOOP: hard cut back to "Hey, can I borrow two hundred?"'},
];
// the cricket beat starts just after Ama's "can't." ends
(EP06_PLAN[15] as Shot).at = {t: WORDS[98].e + 0.15};

export const EP06_SECTIONS: string[] = EP06_PLAN.map((_, i) => (i < 2 ? 'Cold Open' : i < 6 ? 'The Problem' : i < 12 ? 'The Moves' : i < 18 ? 'The Test' : 'The Lesson'));

export const ep06Times = () => {
  const starts = EP06_PLAN.map((s) => (typeof s.at === 'number' ? Math.max(0, WORDS[s.at].s - 0.08) : s.at.t));
  starts[0] = 0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : END) - st}));
};
const TIMES = ep06Times();
export const EP06_SHOT_TIMES = TIMES.map((x) => x.start);
export const ep06ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < TIMES.length; k++) if (t >= TIMES[k].start) i = k;
  return i;
};

// ───────────────────────── performance ─────────────────────────
const ENV = envJson as Record<Who, number[]>;
const W_BY: Record<Who, W6[]> = {ebo: WORDS.filter((w) => w.who === 'ebo'), ama: WORDS.filter((w) => w.who === 'ama'), christy: WORDS.filter((w) => w.who === 'christy')};
const talking = (who: Who, f: number) => (ENV[who][f] ?? 0) > 0.1;
const at = (k: number) => WORDS[k].s;

/** Per-shot acting on top of the shot's poses: (time in the shot, absolute time) → changes. */
type Act = {ebo?: Partial<Pose>; ama?: Partial<Pose>; christy?: Partial<Pose>};
const ACTS: Record<number, (l: number, t: number) => Act> = {
  // "Don't.": the hand comes up flat — stop
  13: (_l, t) => (t >= at(92) - 0.07 ? {ebo: {armR: t < at(92) ? [40, 10] : [100, -10], eyes: 'angry', mouth: 'flat'}} : {}),
  // the beat: Christy blinks, the cricket chirps
  15: (l) => ({christy: {eyes: l > 0.5 && l < 0.62 ? 'closed' : 'open'}}),
  // "Wait." stunned… "That worked?" delighted
  17: (_l, t) => (t >= at(102) ? {ama: {eyes: 'happy', mouth: 'grin', armL: [60, -30], armR: [60, -30]}} : {}),
  // "say it." — pointing straight at us
  22: (_l, t) => (t >= at(164) - 0.07 ? {ebo: {...POSE.pointAtYou, eyes: 'squint', mouth: 'smirk'}} : {}),
};
/** Shots where Ebo's own act drives the arms (no beat gestures then). */
const ARMS_ACTED = (i: number, t: number) => (i === 13 && t >= at(92) - 0.07) || (i === 22 && t >= at(164) - 0.07);

/** The three moves, handwritten, building a chain; in the recap each turns red as Ebo names it. */
const MOVES = [
  {text: 'Buy time', at: at(38), y: 170, x: 540, rot: -4, recap: at(109)},
  {text: 'No to the request', at: at(54), y: 285, x: 540, rot: 2, recap: at(111)},
  {text: 'Offer what you can', at: at(65), y: 400, x: 540, rot: -2, recap: at(120)},
];
const MARKER = 'EboMarker';
const useMarkerFont = () => {
  // (the Animate export renders frames outside the player, where there's nothing to wait for)
  const [handle] = useState(() => (typeof document === 'undefined' ? null : delayRender('marker font')));
  useEffect(() => {
    if (handle === null) return;
    const f = new FontFace(MARKER, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`);
    f.load().then((ff) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};
const Chain: React.FC<{n: number; t: number; recap: boolean}> = ({n, t, recap}) => (
  <g>
    {MOVES.slice(0, n).map((m, i) => {
      // newest move red while building; during the recap, the one he's naming
      const hot = recap ? t >= m.recap && (i === MOVES.length - 1 || t < MOVES[i + 1].recap) : i === n - 1;
      return (
        <Slam key={m.text} t={t} at={m.at} dist={-60} twist={m.rot}>
          <g transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`}>
            <text textAnchor="middle" fontFamily={MARKER} fontSize={94} fill={hot ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={13} paintOrder="stroke" strokeLinejoin="round">
              {m.text}
            </text>
          </g>
        </Slam>
      );
    })}
  </g>
);

export const Ep06Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep06ShotAt(f);
  const s = EP06_PLAN[i];
  const local = t - TIMES[i].start;
  const act = ACTS[i]?.(local, t) ?? {};
  let eboPose: Pose | undefined = s.ebo && {...s.ebo.pose, ...act.ebo};
  if (eboPose && s.size === 'BUST' && !ARMS_ACTED(i, t)) eboPose = beatGesture(eboPose, W_BY.ebo, ENV.ebo, f, TIMES[i].start, TIMES[i].start + TIMES[i].length);
  const amaPose = s.ama && {...s.ama, ...act.ama};
  const christyPose = s.christy && {...s.christy, ...act.christy};
  return (
    <StageSizeContext.Provider value={{w: EP06_W, h: EP06_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={s.frame} bg="#D2C4EE" blurBg={<Backdrop id="ep06" />} overlay={s.chain ? <Chain n={s.chain} t={t} recap={i === 18} /> : undefined}>
              {christyPose && (
                <RigCharacter who="pretty" x={LEFT_X + 30} y={FLOOR} scale={CHRISTY_SCALE} facing={1} t={f} pose={gentle(christyPose)}
                  mouthFrame={talking('christy', f) ? lipFrame(ENV.christy, W_BY.christy, f) : undefined} />
              )}
              {amaPose && (
                <RigCharacter who="ama" x={RIGHT_X} y={FLOOR} scale={AMA_SCALE} facing={-1} t={f} pose={gentle(amaPose)}
                  mouthFrame={talking('ama', f) ? lipFrame(ENV.ama, W_BY.ama, f) : undefined} />
              )}
              {eboPose && (
                <RigCharacter who="ebo" x={s.ebo!.x ?? 540} y={FLOOR} scale={EBO_SCALE} t={f} pose={gentle(frontOn(eboPose))}
                  mouthFrame={talking('ebo', f) ? lipFrame(ENV.ebo, W_BY.ebo, f) : undefined} />
              )}
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp06: React.FC = () => (
  <>
    <Ep06Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep06/voice.mp3')} />
    {/* sound effects (src/series/sfxCues.ts, mixed by scripts/sfx/mix.py) */}
    <Html5Audio src={staticFile('ebo-ep06/sfx.mp3')} />
  </>
);
