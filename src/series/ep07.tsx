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
import {AppPhone, ChainsHeld, ChainsWorn, NeedsList} from '../components/WantsProps';
import {BigPhone} from '../components/StayBrokeProps';
import wordsJson from './data/ep07-words.json';
import envJson from './data/ep07-env.json';

/**
 * EBO TEACHES MONEY — Ep 07 "Wants vs. Needs" (vertical, 1080×1920, ~80s). Ebo alone, teaching to
 * camera, and he is the example: broke in three gold chains.
 * 1. Hook: "I can't make rent… I don't get it." He looks at the chains. "…Okay. I get it."
 * 2. The test (would you HAVE to replace it?): his NEEDS list ticks Rent, Food, Getting to work… the chains fail.
 * 3. The sneaky ones: food/delivery, phone/new one, clothes/brand, and four streaming apps (he watches one).
 * 4. Wants can wait: a one-day pause.
 * 5. Needs first, wants on purpose: fun money.
 * 6. Close: "Wants aren't the enemy. Wants with no limit are." He takes two chains off: "This one? Paid for."
 *    Loops back to shot 1.
 * Handwritten, unnumbered cards stack up (no lesson numbers). Still camera, hard cuts (rule 11); he
 * stands (12), faces us (14), gentle elbows (13), hands on the beat (15); props handled (10).
 */
export const EP07_W = 1080;
export const EP07_H = 1920;
type W7 = Word & {who: 'ebo'};
const WORDS = wordsJson as W7[];
const END = WORDS[WORDS.length - 1].e + 0.5;
export const EP07_DURATION = Math.ceil(END * VFPS);

const FLOOR = 1500;
const Z = (zoom: number, cx: number, cy: number): Framing => ({zoom, cx, cy});
const BUST = Z(1.8, 540, 980); // chest up, to camera
const MID = Z(1.35, 540, 1040); // waist up: room for what he holds
const EBO_SCALE = 1.75;

type Shot = {
  /** first word of the line (index into words.json), or a time in seconds */
  at: number | {t: number};
  line: string;
  size: string;
  frame: Framing;
  pose: Partial<Pose>;
  /** how many of the cards are on screen */
  cards?: number;
  action: string;
};

export const EP07_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: 'I can\'t make rent this month. I don\'t get it.', size: 'BUST', frame: BUST, pose: {eyes: 'wide', mouth: 'o', armR: [60, -30]}, action: 'Cold open: three gold chains on, staring at his bank app ($14.20, RENT DUE).'},
  {at: {t: 0}, line: '(looks down at the chains… back up at us)', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'flat'}, action: 'Silent beat: eyes drop to the chains… and slowly come back up to us.'},
  {at: 10, line: '…Okay. I get it.', size: 'BUST', frame: BUST, pose: {eyes: 'half', mouth: 'flat'}, action: 'Deadpan.'},
  {at: 14, line: 'A lot of us aren\'t broke because we earn too little.', size: 'BUST', frame: BUST, pose: {eyes: 'squint', mouth: 'flat'}, action: 'To camera, dry; hands on the beat.'},
  {at: 25, line: 'We\'re broke because our wants are dressed up as needs.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smirk'}, action: 'Leans in on "dressed up".'},
  {at: 35, line: 'So let\'s learn to tell them apart. Without giving up everything fun.', size: 'BUST', frame: BUST, pose: {eyes: 'happy', mouth: 'smile'}, action: 'Warmer: "everything fun" with a grin.'},
  // ── 2. The test ──
  {at: 47, line: 'Here\'s the test. If it vanished tomorrow, would you have to replace it?', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, cards: 1, action: 'WOULD YOU HAVE TO REPLACE IT? slams up, handwritten.'},
  {at: 60, line: 'Rent? Yes. Food? Yes. Getting to work? Yes.', size: 'MID', frame: MID, pose: {eyes: 'open', mouth: 'smile', armR: [70, -30]}, cards: 1, action: 'His NEEDS list up: a green tick lands on each "Yes".'},
  {at: 68, line: '…These? No.', size: 'BUST', frame: BUST, pose: {eyes: 'sad', mouth: 'flat', lookY: 16, armR: [30, -40]}, cards: 1, action: 'Long beat, hand on the chains, eyes down… "No."'},
  // ── 3. The sneaky ones ──
  {at: 70, line: 'Now watch the sneaky ones. A need with a want hiding inside.', size: 'BUST', frame: BUST, pose: {eyes: 'suspicious', mouth: 'smirk'}, cards: 2, action: 'WATCH THE SNEAKY ONES joins the stack.'},
  {at: 82, line: 'You need food. You want delivery.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, cards: 2, action: 'One hand for the need, the other for the want.'},
  {at: 88, line: 'You need a phone. You want the new one. Every year.', size: 'MID', frame: MID, pose: {eyes: 'half', mouth: 'smirk', armR: [70, -30]}, cards: 2, action: 'Holds up his phone, taps it on "Every year".'},
  {at: 99, line: 'You need clothes. You want the brand.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, cards: 2, action: 'Tugs his shirt on "brand".'},
  {at: 106, line: 'And the sneakiest of all: subscriptions.', size: 'BUST', frame: BUST, pose: {eyes: 'squint', mouth: 'flat'}, cards: 2, action: 'Slowing down.'},
  {at: 112, line: 'Four streaming apps. …I watch one.', size: 'MID', frame: MID, pose: {eyes: 'open', mouth: 'flat', armR: [70, -30]}, cards: 2, action: 'Phone up: four apps… three fade. Embarrassed.'},
  // ── 4. Wants can wait ──
  {at: 118, line: 'Here\'s the thing. Needs are urgent. Wants can wait.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, cards: 3, action: 'WANTS CAN WAIT joins the stack.'},
  {at: 127, line: 'So give every want a one-day pause. Still want it tomorrow? Fine, think about it.', size: 'BUST', frame: BUST, pose: {eyes: 'happy', mouth: 'smile'}, cards: 3, action: 'Hand up: "pause". Shrug on "Fine".'},
  {at: 142, line: 'Forgot about it by tomorrow? It was never that important.', size: 'BUST', frame: BUST, pose: {eyes: 'half', mouth: 'smirk', armR: [30, -40]}, cards: 3, action: 'Touches the chains. Shrugs.'},
  // ── 5. Needs first. Wants on purpose. ──
  {at: 152, line: 'So when the money lands, pay your needs first. Rent, food, transport. Done.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, cards: 4, action: 'NEEDS FIRST. WANTS ON PURPOSE. completes the stack. Counting off.'},
  {at: 165, line: 'Then give your wants a fixed amount. Your fun money. Spend it however you like, no guilt.', size: 'BUST', frame: BUST, pose: {eyes: 'happy', mouth: 'grin'}, cards: 4, action: 'Loosens up: "fun money" with a grin.'},
  {at: 182, line: 'When it\'s gone, it\'s gone. Until next month.', size: 'BUST', frame: BUST, pose: {eyes: 'half', mouth: 'flat'}, cards: 4, action: 'Dry. Flat hand cuts the air.'},
  // ── 6. The close ──
  {at: 190, line: 'Wants aren\'t the enemy. Wants with no limit are.', size: 'BUST', frame: BUST, pose: {eyes: 'open', mouth: 'smile'}, action: 'Sincere, to camera. The cards are gone.'},
  {at: 199, line: 'This one? Paid for. With want money.', size: 'MID', frame: MID, pose: {eyes: 'happy', mouth: 'grin'}, action: 'Takes two chains off (they hang from his hand), keeps one. Slow grin. LOOP: hard cut back to shot 1.'},
];
// the silent beat after "I don't get it."
(EP07_PLAN[1] as Shot).at = {t: WORDS[9].e + 0.1};

export const EP07_SECTIONS: string[] = EP07_PLAN.map((_, i) => (i < 6 ? 'The Hook' : i < 9 ? 'The Test' : i < 15 ? 'The Sneaky Ones' : i < 18 ? 'Wants Can Wait' : i < 21 ? 'Needs First' : 'The Close'));

export const ep07Times = () => {
  const starts = EP07_PLAN.map((s) => (typeof s.at === 'number' ? Math.max(0, WORDS[s.at].s - 0.08) : s.at.t));
  starts[0] = 0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : END) - st}));
};
const TIMES = ep07Times();
export const EP07_SHOT_TIMES = TIMES.map((x) => x.start);
export const ep07ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < TIMES.length; k++) if (t >= TIMES[k].start) i = k;
  return i;
};

// ───────────────────────── performance ─────────────────────────
const ENV = (envJson as Record<string, number[]>).ebo;
const talking = (f: number) => (ENV[f] ?? 0) > 0.1;
const at = (k: number) => WORDS[k].s;

/** What he wears / holds in a shot, and how he moves, on top of the shot's pose. */
type Act = {pose?: Partial<Pose>; hold?: React.ReactNode; holdL?: React.ReactNode; chains?: number; arms?: boolean};
const ACTS: Record<number, (l: number, t: number, f: number) => Act> = {
  // staring at the bank app
  0: () => ({hold: <AppPhone screen="bank" x={-40} y={10} />, arms: true}),
  // eyes drop to the chains, then slowly come back up
  1: (l) => ({pose: {lookY: l < 0.35 ? 0 : l < 1.0 ? 18 : Math.max(0, 18 - (l - 1.0) * 40)}, hold: <AppPhone screen="bank" x={-40} y={10} />, arms: true}),
  2: () => ({hold: <AppPhone screen="bank" x={-40} y={10} />, arms: true}),
  // the list: a tick on every "Yes"
  7: (_l, t) => ({hold: <NeedsList x={-10} y={-120} ticked={[61, 63, 67].filter((k) => t >= at(k)).length} />, arms: true}),
  // hand on the chains, eyes down; "No."
  8: () => ({arms: true}),
  // need (left hand) / want (right hand)
  10: (_l, t) => ({pose: t >= at(85) ? {armR: [80, -30], armL: [12, 6]} : {armL: [80, -30], armR: [12, 6]}, arms: true}),
  // the phone up; tapped on "Every year"
  11: (_l, t) => ({hold: <BigPhone screen="scroll" />, pose: t >= at(97) && t < at(97) + 0.5 ? {armL: [55, -30]} : {}, arms: true}),
  // tugs his shirt on "brand"
  12: (_l, t) => ({pose: t >= at(103) ? {armR: [25, -40], mouth: 'grin'} : {}, arms: t >= at(103)}),
  // four apps… three fade on "I watch one"
  14: (_l, t) => ({hold: <AppPhone screen="apps" watched={t >= at(115)} x={0} y={-120} />, pose: t >= at(115) ? {eyes: 'squeeze', mouth: 'grimace'} : {}, arms: true}),
  // touches the chains, shrugs
  17: () => ({arms: true}),
  // two chains off: from "Paid for." two hang from his hand, one stays on
  22: (_l, t) => (t >= at(201) - 0.25 ? {chains: 1, holdL: <ChainsHeld count={2} />, pose: {armL: [85, -25]}, arms: true} : {}),
};

/** The cards, handwritten, unnumbered (house rule 4), building a stack; the newest in red. */
const CARDS = [
  {text: 'Would you HAVE to replace it?', at: at(50), y: 105, rot: -3, size: 52},
  {text: 'Watch the sneaky ones', at: at(71), y: 180, rot: 2, size: 60},
  {text: 'Wants can wait', at: at(124), y: 255, rot: -2, size: 62},
  {text: 'Needs first. Wants on purpose.', at: at(157), y: 330, rot: 1, size: 50},
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
const Cards: React.FC<{n: number; t: number}> = ({n, t}) => (
  <g>
    {CARDS.slice(0, n).map((m, i) => (
      <Slam key={m.text} t={t} at={m.at} dist={-60} twist={m.rot}>
        <g transform={`translate(540 ${m.y}) rotate(${m.rot})`}>
          <text textAnchor="middle" fontFamily={MARKER} fontSize={m.size} fill={i === n - 1 ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={12} paintOrder="stroke" strokeLinejoin="round">
            {m.text}
          </text>
        </g>
      </Slam>
    ))}
  </g>
);

export const Ep07Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep07ShotAt(f);
  const s = EP07_PLAN[i];
  const local = t - TIMES[i].start;
  const act = ACTS[i]?.(local, t, f) ?? {};
  let pose: Pose = {...POSE.stand, ...s.pose, ...act.pose} as Pose;
  // hands on the beat (rule 15) unless the shot's acting drives the arms
  if (!act.arms) pose = beatGesture(pose, WORDS, ENV, f, TIMES[i].start, TIMES[i].start + TIMES[i].length);
  return (
    <StageSizeContext.Provider value={{w: EP07_W, h: EP07_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={s.frame} bg="#D2C4EE" blurBg={<Backdrop id="ep07" />} overlay={s.cards ? <Cards n={s.cards} t={t} /> : undefined}>
              <RigCharacter who="ebo" x={540} y={FLOOR} scale={EBO_SCALE} t={f} pose={gentle(frontOn(pose))} holdL={act.holdL}
                wear={<ChainsWorn count={act.chains ?? 3} />} mouthFrame={talking(f) ? lipFrame(ENV, WORDS, f) : undefined}>
                {act.hold}
              </RigCharacter>
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp07: React.FC = () => (
  <>
    <Ep07Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep07/voice.mp3')} />
    {/* sound effects (src/series/sfxCues.ts, mixed by scripts/sfx/mix.py) */}
    <Html5Audio src={staticFile('ebo-ep07/sfx.mp3')} />
  </>
);
