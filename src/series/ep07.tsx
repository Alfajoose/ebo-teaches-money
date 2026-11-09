import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose} from '../components/Character';
import {POSE, CONTACT, frontOn, gentle} from '../cast/poses';
import {Backdrop, SHADES, Shade} from './sets';
import {StageSizeContext, Slam} from './exportCtx';
import {VFPS, Word, VStage, Framing, lipFrame, beatGesture} from './kit';
import {C} from '../theme';
import {AppPhone, ChainsHeld, ChainsWorn} from '../components/WantsProps';
import {NeedBox, FoodBowl, DeliveryBag, ModelPhone, Shirt, WantGuy, PaySlip, Mark, House, Bus, BillDue, DayPage, Payday, FunJar, ChainsBig} from '../components/WantsInserts';
import wordsJson from './data/ep07-words.json';
import envJson from './data/ep07-env.json';

/**
 * EBO TEACHES MONEY — Ep 07 "Wants vs. Needs" (vertical, 1080×1920, ~80s), v2 staging: the prop
 * gets the room (after the user's reference video). Ebo is small at the bottom of the frame and
 * what he's talking about is drawn big above him, each piece landing on its word; for the punches
 * he's back close (the change of size is the punctuation), and a couple of inserts give the prop
 * the whole frame with his head in the corner. Ebo alone, teaching to camera, broke in three gold chains.
 * Still camera, hard cuts (rule 11); he stands (12), faces us (14), gentle arms (13), hands on the
 * beat (15); props handled (10); handwritten words, no lesson numbers (4).
 */
export const EP07_W = 1080;
export const EP07_H = 1920;
type W7 = Word & {who: 'ebo'};
const WORDS = wordsJson as W7[];
const END = WORDS[WORDS.length - 1].e + 0.5;
export const EP07_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;

const WIDE: Framing = {zoom: 1, cx: 540, cy: 960}; // the whole stage: Ebo small at the bottom, the prop above
const BUST: Framing = {zoom: 1.8, cx: 540, cy: 980}; // chest up, to camera
const MID: Framing = {zoom: 1.35, cx: 540, cy: 1040}; // waist up
type Stage = 'wide' | 'bust' | 'mid' | 'corner';
const FRAMES: Record<Stage, Framing> = {wide: WIDE, bust: BUST, mid: MID, corner: WIDE};
const PLACE: Record<Stage, {x: number; y: number; scale: number}> = {
  wide: {x: 540, y: 1850, scale: 1.4},
  bust: {x: 540, y: 1500, scale: 1.75},
  mid: {x: 540, y: 1500, scale: 1.75},
  corner: {x: 860, y: 2350, scale: 2.4}, // his head and chains in the bottom corner of a prop insert
};

// ───────────────────────── the drawn boards ─────────────────────────
const MARKER = 'EboMarker';
/** The lively pass (face acting, idle, props that react): on for the test composition. */
const LIVELY = {on: false};
/** A handwritten word. */
const Label: React.FC<{x: number; y: number; text: string; red?: boolean; rot?: number; size?: number}> = ({x, y, text, red, rot = 0, size = 84}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={red ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={size / 7} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  </g>
);
/** Something that slams in at its time, placed at (x, y), drawn at a fixed size `k` (static size, never animated). */
const In: React.FC<{t: number; at: number; x: number; y: number; k?: number; rot?: number; twist?: number; alive?: boolean; children: React.ReactNode}> = ({t, at: a, x, y, k = 1, rot = 0, twist = -4, alive = false, children}) => {
  // lively: once it has landed it rocks once and settles (a damped wobble); a living thing keeps a gentle sway.
  // Rotation only, kept on the symbol's matrix (Slam's spin) so the Animate file gets one symbol, not one per frame.
  const u = t - a - 0.17;
  const wob = LIVELY.on && u > 0 ? 5 * Math.sin(u * 16) * Math.exp(-u * 6) : 0;
  const sway = LIVELY.on && alive ? 3 * Math.sin(t * 2.3) : 0;
  return (
    <Slam t={t} at={a} dist={-80} twist={twist} spin={{deg: wob + sway, cx: x, cy: y}}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>{children}</g>
    </Slam>
  );
};
/** need on the left, want on the right, each slamming in on its word. */
const Pair: React.FC<{t: number; needAt: number; wantAt: number; need: React.ReactNode; want: React.ReactNode; needText?: string; wantText?: string}> = ({t, needAt, wantAt, need, want, needText = 'need', wantText = 'want'}) => (
  <g>
    <In t={t} at={needAt} x={285} y={840} k={1.6}>{need}</In>
    <In t={t} at={needAt} x={0} y={0} twist={-4}><Label x={285} y={470} text={needText} rot={-4} /></In>
    <In t={t} at={wantAt} x={780} y={840} k={1.6} twist={4}>{want}</In>
    <In t={t} at={wantAt} x={0} y={0} twist={4}><Label x={790} y={470} text={wantText} red rot={4} /></In>
  </g>
);

type Shot = {
  /** first word of the line (index into words.json), or a time in seconds */
  at: number | {t: number};
  line: string;
  stage: Stage;
  pose: Partial<Pose>;
  /** what's drawn big above him (screen space), by absolute time */
  board?: (t: number) => React.ReactNode;
  /** acting that drives the arms (otherwise his hands go on the beat) */
  arms?: (t: number) => Partial<Pose> | null;
  hold?: (t: number) => React.ReactNode;
  action: string;
};

const POINT_L: Partial<Pose> = {armR: [100, -10], armL: [12, 6]}; // his right hand: towards the left of the frame
const POINT_R: Partial<Pose> = {armL: [100, -10], armR: [12, 6]};
/** Point left on the need, right on the want. */
const pointAt = (needK: number, wantK: number) => (t: number) => (t >= at(wantK) ? POINT_R : t >= at(needK) ? POINT_L : null);

export const EP07_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: 'I can\'t make rent this month. I don\'t get it.', stage: 'corner', pose: {eyes: 'wide', mouth: 'o', lookX: -18, lookY: -12},
    board: () => <g transform="translate(470 820) rotate(-4) scale(3.3)"><AppPhone screen="bank" /></g>, arms: () => ({}),
    action: 'Cold open: his bank app fills the frame ($14.20, RENT DUE); Ebo, gold chains on, peeks up at it from the corner.'},
  {at: {t: 0}, line: '(looks down at the chains… back up at us)', stage: 'bust', pose: {eyes: 'open', mouth: 'flat'}, arms: () => ({}),
    action: 'Hard cut close: the three chains. His eyes drop to them… and slowly come back up to us.'},
  {at: 10, line: '…Okay. I get it.', stage: 'bust', pose: {eyes: 'half', mouth: 'flat'}, action: 'Deadpan.'},
  {at: 14, line: 'A lot of us aren\'t broke because we earn too little.', stage: 'wide', pose: {eyes: 'squint', mouth: 'flat'},
    board: (t) => (
      <g>
        <In t={t} at={at(22)} x={540} y={760} k={1.7}><PaySlip /></In>
        <In t={t} at={at(24)} x={0} y={0}><Label x={540} y={430} text="not the problem" red rot={-3} /></In>
      </g>
    ), action: 'Wide: Ebo small below; a payslip slams in above him on "earn"… "not the problem".'},
  {at: 25, line: 'We\'re broke because our wants are dressed up as needs.', stage: 'wide', pose: {eyes: 'open', mouth: 'smirk'},
    board: (t) => (
      <g>
        <In t={t} at={at(29)} x={470} y={860} k={2.1} alive><WantGuy disguise t={LIVELY.on ? t : undefined} /></In>
        <In t={t} at={at(31)} x={0} y={0}><Label x={540} y={400} text="a want in disguise" red rot={-3} size={76} /></In>
      </g>
    ), arms: (t) => (t >= at(29) ? POINT_L : null), action: 'A little purple want in a hat and moustache, holding up a NEED sign. He points at it.'},
  {at: 35, line: 'So let\'s learn to tell them apart. Without giving up everything fun.', stage: 'bust', pose: {eyes: 'happy', mouth: 'smile'}, action: 'Close, warmer: "everything fun" with a grin.'},
  // ── 2. The test ──
  {at: 47, line: 'Here\'s the test. If it vanished tomorrow, would you have to replace it?', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => (
      <g>
        <In t={t} at={at(50)} x={0} y={0}><Label x={540} y={600} text="Would you HAVE" size={112} rot={-3} /></In>
        <In t={t} at={at(54)} x={0} y={0}><Label x={540} y={740} text="to replace it?" red size={112} rot={-3} /></In>
      </g>
    ), action: 'The question, handwritten big in the space above him.'},
  {at: 60, line: 'Rent? Yes. Food? Yes. Getting to work? Yes.', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => (
      <g>
        <In t={t} at={at(60)} x={210} y={840} k={1.05}><House /></In>
        <In t={t} at={at(62)} x={540} y={860} k={1.05}><FoodBowl /></In>
        <In t={t} at={at(64)} x={860} y={850} k={0.95}><Bus /></In>
        {[[61, 210], [63, 540], [67, 860]].map(([k, x]) => <In key={k} t={t} at={at(k)} x={x} y={600} twist={0}><Mark kind="tick" /></In>)}
      </g>
    ), arms: (t) => (t >= at(64) ? POINT_R : t >= at(62) ? {armL: [70, -20], armR: [70, -20]} : t >= at(60) ? POINT_L : null),
    action: 'Rent, food, the bus to work land in a row; a big green tick on each "Yes".'},
  {at: 68, line: '…These? No.', stage: 'wide', pose: {eyes: 'sad', mouth: 'flat', lookY: 16},
    board: (t) => (
      <g>
        <g transform="translate(540 760) scale(6)"><ChainsBig /></g>
        <In t={t} at={at(69)} x={540} y={800} k={2.4} twist={0}><Mark kind="cross" /></In>
      </g>
    ), arms: () => ({}), action: 'His three chains, big above him. He looks down at his own… "No." A red cross.'},
  // ── 3. The sneaky ones ──
  {at: 70, line: 'Now watch the sneaky ones. A need with a want hiding inside.', stage: 'wide', pose: {eyes: 'suspicious', mouth: 'smirk'},
    board: (t) => (
      <g>
        <g transform="translate(540 860) scale(1.6)"><NeedBox peek={Math.min(1, Math.max(0, (t - at(79)) / 0.25))} /></g>
        <In t={t} at={at(79)} x={0} y={0} twist={6}><Label x={800} y={470} text="want" red rot={8} /></In>
      </g>
    ), arms: (t) => (t >= at(79) ? POINT_L : null), action: 'A box marked NEED… a little want peeks out of it on "want hiding".'},
  {at: 82, line: 'You need food. You want delivery.', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => <Pair t={t} needAt={at(83)} wantAt={at(86)} need={<FoodBowl />} want={<DeliveryBag />} />, arms: pointAt(82, 85),
    action: 'need: a bowl of home food. want: a delivery bag with a long $$$ receipt.'},
  {at: 88, line: 'You need a phone. You want the new one. Every year.', stage: 'wide', pose: {eyes: 'half', mouth: 'smirk'},
    board: (t) => <Pair t={t} needAt={at(89)} wantAt={at(93)} need={<ModelPhone />} want={<ModelPhone fresh year={t >= at(98) ? '2027' : t >= at(97) + 0.3 ? '2026' : t >= at(97) ? '2025' : undefined} />} />,
    arms: pointAt(88, 92), action: 'need: his old cracked phone. want: the shiny NEW! one… 2025, 2026, 2027 on "Every year".'},
  {at: 99, line: 'You need clothes. You want the brand.', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => <Pair t={t} needAt={at(100)} wantAt={at(103)} need={<Shirt />} want={<Shirt brand />} />, arms: pointAt(99, 102),
    action: 'need: a plain $8 tee. want: the black LUXE tee, $250.'},
  {at: 106, line: 'And the sneakiest of all: subscriptions.', stage: 'bust', pose: {eyes: 'squint', mouth: 'flat'}, action: 'Hard cut close, slowing down.'},
  {at: 112, line: 'Four streaming apps. …I watch one.', stage: 'corner', pose: {eyes: 'open', mouth: 'flat', lookX: -18, lookY: -12},
    board: (t) => <g transform="translate(470 820) rotate(-4) scale(3.3)"><AppPhone screen="apps" watched={t >= at(115)} /></g>, arms: () => ({}),
    action: 'Insert: the phone fills the frame, four apps; three grey out on "I watch one". Ebo winces in the corner.'},
  // ── 4. Wants can wait ──
  {at: 118, line: 'Here\'s the thing. Needs are urgent. Wants can wait.', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => <Pair t={t} needAt={at(121)} wantAt={at(124)} need={<BillDue />} want={<WantGuy mood="happy" ticket t={LIVELY.on ? t : undefined} />} needText="urgent" wantText="can wait" />, arms: pointAt(121, 124),
    action: 'urgent: the rent bill, DUE TODAY. can wait: the want, holding ticket #99.'},
  {at: 127, line: 'So give every want a one-day pause. Still want it tomorrow? Fine, think about it.', stage: 'wide', pose: {eyes: 'happy', mouth: 'smile'},
    board: (t) => (
      <g>
        <In t={t} at={at(128)} x={540} y={830} k={1.5}><DayPage tomorrow={t >= at(137)} /></In>
        <In t={t} at={at(132)} x={0} y={0}><Label x={540} y={430} text="one-day pause" red rot={-3} /></In>
        <In t={t} at={at(137)} x={860} y={660} k={1} twist={8} alive><WantGuy mood="happy" rotate={10} t={LIVELY.on ? t : undefined} /></In>
      </g>
    ), action: 'A calendar page: TODAY… it turns to TOMORROW, and the want is still there, waiting.'},
  {at: 142, line: 'Forgot about it by tomorrow? It was never that important.', stage: 'bust', pose: {eyes: 'half', mouth: 'smirk'}, action: 'Close: a shrug.'},
  // ── 5. Needs first. Wants on purpose. ──
  {at: 152, line: 'So when the money lands, pay your needs first. Rent, food, transport. Done.', stage: 'wide', pose: {eyes: 'open', mouth: 'smile'},
    board: (t) => (
      <g>
        <In t={t} at={at(155)} x={540} y={640} k={1.2}><Payday /></In>
        <In t={t} at={at(159)} x={0} y={0}><Label x={540} y={340} text="needs first" rot={-3} /></In>
        <In t={t} at={at(161)} x={220} y={1010} k={0.75}><House /></In>
        <In t={t} at={at(162)} x={540} y={1020} k={0.75}><FoodBowl /></In>
        <In t={t} at={at(163)} x={860} y={1010} k={0.7}><Bus /></In>
        <In t={t} at={at(164)} x={540} y={1000} k={1.2} twist={0}><Mark kind="tick" /></In>
      </g>
    ), action: 'PAYDAY lands; "needs first"; rent, food, the bus line up… "Done." A big tick.'},
  {at: 165, line: 'Then give your wants a fixed amount. Your fun money. Spend it however you like, no guilt.', stage: 'wide', pose: {eyes: 'happy', mouth: 'grin'},
    board: (t) => (
      <g>
        <In t={t} at={at(166)} x={0} y={0}><Label x={540} y={340} text="wants on purpose" red rot={-3} /></In>
        <In t={t} at={at(172)} x={420} y={820} k={1.5}><FunJar /></In>
        <In t={t} at={at(175)} x={830} y={900} k={1.2} twist={8} alive><WantGuy mood="happy" t={LIVELY.on ? t : undefined} /></In>
      </g>
    ), arms: (t) => (t >= at(172) ? POINT_L : null), action: '"wants on purpose"; a FUN MONEY jar with some cash in it, and the want, happy beside it.'},
  {at: 182, line: 'When it\'s gone, it\'s gone. Until next month.', stage: 'wide', pose: {eyes: 'half', mouth: 'flat'},
    board: (t) => (
      <g>
        <g transform="translate(420 820) scale(1.5)"><FunJar empty={t >= at(184)} /></g>
        <g transform="translate(830 900) scale(1.2)"><WantGuy mood={t >= at(184) ? 'sad' : 'happy'} t={LIVELY.on ? t : undefined} /></g>
      </g>
    ), action: 'The jar empties on "gone"; the want deflates. Dry.'},
  // ── 6. The close ──
  {at: 190, line: 'Wants aren\'t the enemy. Wants with no limit are.', stage: 'bust', pose: {eyes: 'open', mouth: 'smile'}, action: 'Close, sincere, to camera.'},
  {at: 199, line: 'This one? Paid for. With want money.', stage: 'mid', pose: {eyes: 'happy', mouth: 'grin'}, action: 'Takes two chains off (they hang from his hand), keeps one. Slow grin. LOOP: hard cut back to shot 1.'},
];
// the silent beat after "I don't get it."
(EP07_PLAN[1] as Shot).at = {t: WORDS[9].e + 0.1};

/** When something slams in (for the sound effects): every `In`/`Pair` time above. */
export const EP07_SLAMS: number[] = [22, 29, 50, 60, 62, 64, 83, 86, 89, 93, 100, 103, 121, 124, 128, 155, 161, 162, 163, 172, 175].map(at);
export const EP07_TICKS: number[] = [61, 63, 67, 164].map(at);

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

/** Extra acting by shot: (time in the shot, absolute time) → pose changes, what he holds, chains worn. */
type Act = {pose?: Partial<Pose>; holdL?: React.ReactNode; chains?: number};
/** Lively: a fresh face on each punch, held. Shot → [word, expression] in order. */
const REACT: Record<number, [number, Partial<Pose>][]> = {
  2: [[10, {eyes: 'tired', mouth: 'flat', headTilt: -4}], [12, {eyes: 'half', mouth: 'smirk', headTilt: 0}]],
  3: [[19, {eyes: 'suspicious', mouth: 'flat'}], [24, {eyes: 'squint', mouth: 'smirk', headTilt: 5}]],
  4: [[29, {eyes: 'suspicious', mouth: 'smirk', headTilt: 6}], [33, {eyes: 'wide', mouth: 'o', headTilt: 0}]],
  5: [[45, {eyes: 'happy', mouth: 'laugh', headTilt: -5}]],
  6: [[52, {eyes: 'wide', mouth: 'o'}], [58, {eyes: 'squint', mouth: 'smirk', headTilt: 6}]],
  8: [[69, {eyes: 'sad', mouth: 'frown', headTilt: -6}]],
  9: [[79, {eyes: 'suspicious', mouth: 'smirk', headTilt: 6}]],
  11: [[96, {eyes: 'tired', mouth: 'flat'}], [98, {eyes: 'squint', mouth: 'grimace'}]],
  12: [[104, {eyes: 'dollar', mouth: 'o'}]],
  13: [[111, {eyes: 'angry', mouth: 'flat', headTilt: 4}]],
  15: [[123, {eyes: 'wide', mouth: 'o'}], [126, {eyes: 'happy', mouth: 'smile', headTilt: -5}]],
  16: [[133, {eyes: 'closed', mouth: 'smile'}], [137, {eyes: 'open', mouth: 'smile', headTilt: 5}]],
  17: [[146, {eyes: 'half', mouth: 'smirk', headTilt: -8}], [149, {eyes: 'tired', mouth: 'flat', headTilt: 0}]],
  18: [[164, {eyes: 'happy', mouth: 'grin'}]],
  19: [[173, {eyes: 'happy', mouth: 'laugh', headTilt: 5}]],
  20: [[184, {eyes: 'tired', mouth: 'flat'}], [187, {eyes: 'half', mouth: 'smirk'}]],
  21: [[193, {eyes: 'wide', mouth: 'smile'}], [197, {eyes: 'squint', mouth: 'flat', headTilt: 5}]],
};
const reactAt = (i: number, t: number): Partial<Pose> => {
  let r: Partial<Pose> = {};
  for (const [k, p] of REACT[i] ?? []) if (t >= at(k)) r = p;
  return r;
};
/** Lively: never frozen — a slow lean and a shoulder shift, a glance off and back while talking, a blink on every cut. */
const idle = (t: number, l: number, f: number, i: number): Partial<Pose> => {
  const glance = Math.floor(t / 1.7) % 3 === 1 && (t % 1.7) < 0.25 && talking(f) ? (Math.floor(t / 1.7) % 2 ? 7 : -7) : 0;
  return {
    tilt: 1.3 * Math.sin((t * 2 * Math.PI) / 3.1),
    lift: 2.5 * Math.sin((t * 2 * Math.PI) / 2.3 + 1),
    lookX: glance,
    ...(i > 0 && l < 0.1 ? {eyes: 'closed' as const} : {}),
  };
};

const ACTS: Record<number, (l: number, t: number) => Act> = {
  // eyes drop to the chains, then slowly come back up
  1: (l) => ({pose: {lookY: l < 0.35 ? 0 : l < 1.0 ? 18 : Math.max(0, 18 - (l - 1.0) * 40)}}),
  // four apps… three grey out: he winces
  14: (_l, t) => (t >= at(115) ? {pose: {eyes: 'squeeze', mouth: 'grimace'}} : {}),
  // two chains off: from "Paid for." two hang from his hand, one stays on
  22: (_l, t) => (t >= at(201) - 0.25 ? {chains: 1, holdL: <ChainsHeld count={2} />, pose: {armL: [85, -25]}} : {}),
};

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

/** Rule 16: reactions as contact poses (the arm lands on him). Shot → [from word (-1: the shot's start), pose or null to let go]. */
const CONTACT_AT: Record<number, [number, string | null][]> = {
  0: [[6, 'cheekWorry']], // "I don't get it."
  1: [[-1, 'hmm']], // looking down at the chains
  2: [[10, 'facepalm'], [12, null]], // "…Okay." / "I get it."
  6: [[54, 'thinkChin']], // "would you have to replace it?"
  8: [[69, 'cheekWorry']], // "No."
  9: [[70, 'thinkChin']], // "Now watch the sneaky ones." (until he points)
  13: [[106, 'thinking']], // "subscriptions"
  14: [[115, 'bothCheeks']], // "…I watch one."
  17: [[142, 'armsCrossed']], // "Forgot about it… never that important."
  20: [[182, 'armsCrossed']], // "When it's gone, it's gone."
};
const contactAt = (i: number, t: number, start: number): Pose | null => {
  let c: string | null = null;
  for (const [k, name] of CONTACT_AT[i] ?? []) if (t >= (k < 0 ? start : at(k))) c = name;
  return c ? CONTACT[c] : null;
};
/** Rule 17: each section shifts the backdrop shade a little. */
const SECTION_SHADE: Record<string, Shade> = {'The Hook': 'lilac', 'The Test': 'pink', 'The Sneaky Ones': 'mint', 'Wants Can Wait': 'peach', 'Needs First': 'sky', 'The Close': 'lilac'};

export const Ep07Frame: React.FC<{f: number; lively?: boolean}> = ({f, lively = true}) => {
  useMarkerFont();
  LIVELY.on = lively;
  const t = f / VFPS;
  const i = ep07ShotAt(f);
  const s = EP07_PLAN[i];
  const local = t - TIMES[i].start;
  const act = ACTS[i]?.(local, t) ?? {};
  let pose: Pose = {...POSE.stand, ...s.pose} as Pose;
  const acted = s.arms?.(t);
  if (acted) pose = {...pose, ...acted};
  else if (!act.holdL) pose = beatGesture(pose, WORDS, ENV, f, TIMES[i].start, TIMES[i].start + TIMES[i].length); // hands on the beat (rule 15)
  pose = {...pose, ...act.pose} as Pose;
  // a contact pose takes the arms (unless the shot's acting is already driving them)
  const touch = !acted && !act.holdL ? contactAt(i, t, TIMES[i].start) : null;
  if (touch) pose = {...pose, armL: touch.armL, armR: touch.armR, armFront: touch.armFront, contact: true, headTilt: touch.headTilt, view: 1};
  if (LIVELY.on) {
    const id = idle(t, local, f, i);
    // he looks at what he's pointing at (or at what just landed above him), then back to us
    const pointing = acted && (acted.armR?.[0] ?? 0) >= 100 ? -16 : acted && (acted.armL?.[0] ?? 0) >= 100 ? 16 : 0;
    const landed = s.stage === 'wide' && EP07_SLAMS.some((a) => t >= a && t < a + 0.6);
    const look: Partial<Pose> = pointing || landed ? {lookX: pointing, lookY: -12} : {};
    pose = {...pose, ...reactAt(i, t), tilt: (pose.tilt ?? 0) + (id.tilt ?? 0), lift: (pose.lift ?? 0) + (id.lift ?? 0),
      lookX: look.lookX ?? (pose.lookX || id.lookX || 0), lookY: look.lookY ?? pose.lookY, ...(id.eyes ? {eyes: id.eyes} : {})} as Pose;
  }
  const e = PLACE[s.stage];
  return (
    <StageSizeContext.Provider value={{w: EP07_W, h: EP07_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={FRAMES[s.stage]} bg={SHADES[SECTION_SHADE[EP07_SECTIONS[i]]][2]} blurBg={<Backdrop id={`ep07-${SECTION_SHADE[EP07_SECTIONS[i]]}`} shade={SECTION_SHADE[EP07_SECTIONS[i]]} />} overlay={s.board?.(t)}>
              <RigCharacter who="ebo" x={e.x} y={e.y} scale={e.scale} t={f} pose={gentle(frontOn(pose))} holdL={act.holdL}
                wear={<ChainsWorn count={act.chains ?? 3} />} mouthFrame={talking(f) ? lipFrame(ENV, WORDS, f) : undefined} />
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
