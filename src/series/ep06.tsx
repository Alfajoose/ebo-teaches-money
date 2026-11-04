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
 * EBO TEACHES MONEY — Ep 06 "Say No Without the Guilt" (YouTube Short, 1080×1920, ~49s), v2:
 * snappy Practical-Psychology-style pacing within the house rules.
 * 1. Hook: Christy (played by Ama Pretty) asks for two hundred, and Ama gives a silent, panicked smile.
 *    Ebo names the PEOPLE-PLEASER TAX (red card).
 * 2. Buy time / 3. Not you, the request / Offer what you can: handwritten, unnumbered cards build a
 *    stack while Ama does each one.
 * 4. Cricket beat, "Oh. Never mind." (Christy walks off), then Ama, stunned: "that actually worked?"
 * 5. Loop: "A kind no beats a broke yes." Hard cut back to Christy's first line.
 * Still camera (house rule 11), Ebo faces us (14), hands on the beat (15); the acting carries it, with no icons.
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
  /** the red PEOPLE-PLEASER TAX card */
  tax?: boolean;
  action: string;
};

const stand = (x: Partial<Pose>): Pose => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const ebo = (p: Partial<Pose>, x?: number) => ({pose: {...POSE.stand, ...p} as Pose, x});

export const EP06_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: '"Hey, can I borrow two hundred? Just till Friday."', size: 'TWO C+A', frame: TWO, christy: stand({mouth: 'grin', armR: [55, -30], lookX: 14}), ama: stand({mouth: 'smile', eyes: 'open'}), action: 'Christy leans in, breezy, hand out. (cha-ching)'},
  {at: {t: 0}, line: '(Ama: a tight, panicked smile)', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'wide', mouth: 'grimace', armL: [20, 10], armR: [20, 10]}), action: 'Ama, silent: a tight, panicked smile.'},
  {at: 9, line: 'That\'s the third time this month. And that "Friday"? It never comes.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'half', mouth: 'flat'}), action: 'Hard cut: Ebo to camera, dry; deadpan on "never comes".'},
  {at: 21, line: 'If your gut screams no, but your mouth says yes…', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'squint', mouth: 'flat', tilt: 4}), action: 'Leaning in, hands on the beats.'},
  {at: 31, line: 'you\'re suffering from the People-Pleaser Tax.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'wide', mouth: 'o'}), tax: true, action: 'THE PEOPLE-PLEASER TAX slams up in red.'},
  // ── 2. The shift: buy time ──
  {at: 37, line: 'Stop answering on the spot. Panic makes you a yes-man.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'squint', mouth: 'flat'}), action: 'Brisk, confident.'},
  {at: 47, line: 'Your first move is to pause.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'smile'}), chain: 1, action: 'BUY TIME pops up handwritten.'},
  {at: 53, line: '"Let me check my week and get back to you."', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'open', mouth: 'smile', armR: [95, -30]}), chain: 1, action: 'Ama, calm, hand up: the pause.'},
  // ── 3. Not you, the request / offer what you can ──
  {at: 63, line: 'Next, separate the person from the favor.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'open', mouth: 'smile'}), chain: 2, action: 'NOT YOU, THE REQUEST joins the stack.'},
  {at: 70, line: 'You aren\'t rejecting them; you\'re declining the task.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'smile'}), chain: 2, action: 'Hands on the beats.'},
  {at: 78, line: '"I can\'t lend money right now…"', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'wide', mouth: 'flat', lookX: 14}), ama: stand({eyes: 'open', mouth: 'flat', armR: [30, -20]}), chain: 2, action: 'Ama to Christy, gently. Christy blinks.'},
  {at: 84, line: '"…but I can help you build a budget this weekend."', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'wide', mouth: 'grin', armL: [50, -30], armR: [50, -30]}), chain: 3, action: 'Ama brightens. OFFER WHAT YOU CAN completes the stack.'},
  // ── 4. The climax and resolution ──
  {at: {t: 0}, line: '(beat — cricket)', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'open', mouth: 'flat'}), ama: stand({eyes: 'open', mouth: 'smile'}), chain: 3, action: 'Silence. Christy blinks. A lone cricket chirps.'},
  {at: 94, line: '"Oh. Never mind."', size: 'TWO C+A', frame: TWO, christy: stand({eyes: 'half', mouth: 'flat', armL: [30, -30], armR: [30, -30]}), ama: stand({eyes: 'open', mouth: 'smile'}), chain: 3, action: 'Christy shrugs… then turns and walks off.'},
  {at: 97, line: '"Wait… that actually worked?"', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'wide', mouth: 'o', lookY: 14, armL: [40, -20], armR: [40, -20]}), action: 'Ama stares at her hands, wide-eyed… then delighted.'},
  {at: 101, line: 'No lies. No drama. Just a clear boundary.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin'}), chain: 3, action: 'Ebo, warm, three beats over the stack.'},
  {at: 109, line: 'The two hundred stays in your pocket.', size: 'CU Ama', frame: CU_AMA, ama: stand({eyes: 'happy', mouth: 'grin', armL: [30, -30], armR: [30, -30]}), action: 'Ama, relieved and happy.'},
  // ── 5. The loop ──
  {at: 116, line: 'A kind no beats a broke yes. Every time.', size: 'BUST', frame: BUST, ebo: ebo({eyes: 'happy', mouth: 'grin', armL: [50, -30], armR: [50, -30]}), action: 'The line. LOOP: hard cut back to "Hey, can I borrow two hundred?"'},
];
// the two timed beats: Ama's silent smile after Christy's ask, and the cricket after Ama's offer
(EP06_PLAN[1] as Shot).at = {t: WORDS[8].e + 0.1};
(EP06_PLAN[12] as Shot).at = {t: WORDS[93].e + 0.15};

export const EP06_SECTIONS: string[] = EP06_PLAN.map((_, i) => (i < 5 ? 'The Hook' : i < 8 ? 'Buy Time' : i < 12 ? 'Not You, The Request' : i < 17 ? 'The Resolution' : 'The Loop'));

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
type Act = {ebo?: Partial<Pose>; ama?: Partial<Pose>; christy?: Partial<Pose>; christyX?: number; christyFacing?: 1 | -1};
const ACTS: Record<number, (l: number, t: number) => Act> = {
  // the cricket beat: Christy blinks
  12: (l) => ({christy: {eyes: l > 0.45 && l < 0.57 ? 'closed' : 'open'}}),
  // "Never mind." then she turns and walks off (stepping, out of frame left)
  13: (_l, t) => {
    const go = WORDS[96].e + 0.1;
    if (t < go) return {};
    const k = t - go;
    return {christy: {legL: Math.floor(k / 0.13) % 2 ? [20, 6] : [-8, 0], legR: Math.floor(k / 0.13) % 2 ? [-8, 0] : [20, 6], eyes: 'half'}, christyX: -k * 900, christyFacing: -1};
  },
  // "Wait…" staring at her hands… "that actually worked?" delighted
  14: (_l, t) => (t >= at(98) ? {ama: {eyes: 'happy', mouth: 'grin', lookY: 0, armL: [60, -30], armR: [60, -30]}} : {}),
};
/** Shots where Ebo's own act drives the arms (no beat gestures then). */
const ARMS_ACTED = (_i: number, _t: number) => false;

/** The three moves, handwritten, no numbers (house rule 6), building a stack. */
const MOVES = [
  {text: 'Buy time', at: at(52), y: 170, x: 540, rot: -4},
  {text: 'Not you, the request', at: at(63), y: 285, x: 540, rot: 2},
  {text: 'Offer what you can', at: at(84), y: 400, x: 540, rot: -2},
];
const TAX = {text: ['The People-', 'Pleaser Tax'], at: at(35)};
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
const Chain: React.FC<{n: number; t: number}> = ({n, t}) => (
  <g>
    {MOVES.slice(0, n).map((m, i) => {
      const hot = i === n - 1; // the newest one in red
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

/** THE PEOPLE-PLEASER TAX: a red stamped card in the hook. */
const TaxCard: React.FC<{t: number}> = ({t}) => (
  <Slam t={t} at={TAX.at} dist={-80} twist={-6}>
    <g transform="translate(540 250) rotate(-5)">
      <rect x={-430} y={-150} width={860} height={270} rx={26} fill="#fff" stroke="#E5484D" strokeWidth={14} />
      {TAX.text.map((l, k) => (
        <text key={l} y={-30 + k * 115} textAnchor="middle" fontFamily={MARKER} fontSize={104} fill="#E5484D">
          {l}
        </text>
      ))}
    </g>
  </Slam>
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
            <VStage framing={s.frame} bg="#D2C4EE" blurBg={<Backdrop id="ep06" />} overlay={s.tax ? <TaxCard t={t} /> : s.chain ? <Chain n={s.chain} t={t} /> : undefined}>
              {christyPose && (
                <RigCharacter who="pretty" x={LEFT_X + 30 + (act.christyX ?? 0)} y={FLOOR} scale={CHRISTY_SCALE} facing={act.christyFacing ?? 1} t={f} pose={gentle(christyPose)}
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
