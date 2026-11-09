import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose, POSES} from '../components/Character';
import {POSE, CONTACT, frontOn, gentle} from '../cast/poses';
import {Backdrop, SHADES} from './sets';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, VStage, Framing, lipFrame, beatGesture} from './kit';
import {Badge, BigBadge, Dim, Glow, Header, In, INK, Label, RED, Tracker, badgeX, swoopZoom, useMarkerFont} from './filterKit';
import {Cake, CalPage, CarKeys, Clock, DinnerTable, Heart, Lobster, MovingBox, ParkingTicket, Receipt, Speech} from '../components/NiceGuyProps';
import {Mark, House} from '../components/WantsInserts';
import {Wallet} from '../components/Props';
import wordsJson from './data/ep08-words.json';
import envJson from './data/ep08-env.json';

/**
 * EBO TEACHES MONEY — Ep 08 "Why Nice Guys Get Taken Advantage Of" (vertical, 1080×1920, ~35s), v3:
 * the Peanut style (house rules 20 and 21). A deadpan story about Ebo: dinner when Christy forgot her wallet
 * (four times), helping Ama move (twice, same apartment), lending his car ("one hour"… three days and a
 * parking ticket), then the twist: a surprise party at his favourite restaurant… and they sent him the bill.
 * The lesson in two lines, and a button: next birthday he's ordering lobster.
 * - A picture on every key word, landing on it, showing the action; things swoop in from the sides with a swoosh.
 * - The camera swoops on every shot (video only; the Animate file stays camera-free).
 * - Every take moves: Ebo, Christy and Ama walk in, act on the words and react.
 * - The tracker (rule 19): dinner · the move · the car · ? → the bill.
 */
export const EP08_W = 1080;
export const EP08_H = 1920;
type W8 = Word & {who: 'ebo'};
const WORDS = wordsJson as W8[];
const END = WORDS[WORDS.length - 1].e + 0.6;
export const EP08_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;

/** scene: the story, everyone full figure (Ebo included) · react: an example above, Ebo big along the bottom ·
 * close: his face · insert: a prop fills the frame, his head in the corner · story: the example alone. */
type Stage = 'scene' | 'react' | 'close' | 'insert' | 'story';
const WHOLE: Framing = {zoom: 1, cx: 540, cy: 960};
const FRAMES: Record<Stage, Framing> = {scene: WHOLE, react: WHOLE, close: {zoom: 1.8, cx: 540, cy: 980}, insert: WHOLE, story: WHOLE};
const FLOOR = 1520;
const CAST_SCALE = 1.3;
const EBO_AT: Record<Stage, {x: number; y: number; scale: number} | null> = {
  scene: {x: 540, y: FLOOR, scale: CAST_SCALE},
  react: {x: 540, y: 2440, scale: 2.7},
  close: {x: 540, y: 1500, scale: 1.75},
  insert: {x: 860, y: 2350, scale: 2.4},
  story: null,
};

// ───────────────────────── the tracker ─────────────────────────
const BADGES: Badge[] = [
  {color: '#45B69C', icon: <g><circle r={30} fill="#fff" /><circle r={18} fill="none" stroke="#45B69C" strokeWidth={4} /><path d="M 38 -26 L 38 26" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>}, // dinner: a plate and a fork
  {color: '#F5A33A', icon: <g><rect x={-28} y={-24} width={56} height={48} fill="#fff" /><rect x={-6} y={-24} width={12} height={48} fill="#F5A33A" opacity={0.5} /></g>}, // the move: a box
  {color: '#2F80ED', icon: <g><circle cx={-14} cy={-8} r={14} fill="none" stroke="#fff" strokeWidth={6} /><path d="M -2 2 L 28 30 M 18 20 L 26 12 M 24 26 L 32 18" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>}, // the car: a key
  {color: '#E5484D', icon: <g><rect x={-20} y={-30} width={40} height={60} fill="#fff" /><text y={14} textAnchor="middle" fontFamily="EboMarker" fontSize={30} fill="#E5484D">$$</text></g>}, // ? → the bill
];
const SLOT_AT = () => [at(12), at(23), at(30), at(62)];
const TRACK_FROM = () => at(12);

// ───────────────────────── the shots ─────────────────────────
type Actor = {x: number; pose?: Partial<Pose>; hold?: React.ReactNode; holdL?: React.ReactNode; facing?: 1 | -1;
  enter?: {from: number; dur?: number}; exit?: {to: number; at: number; dur?: number}; acts?: [number, Partial<Pose> & {hold?: React.ReactNode | null; holdL?: React.ReactNode | null}][]};
type Side = Actor & {who: 'ama' | 'pretty'};
type Shot = {
  at: number;
  line: string;
  stage: Stage;
  /** Ebo: his face and arms; in a scene, where he stands and what he does */
  ebo?: Actor;
  touch?: keyof typeof CONTACT;
  board?: (t: number) => React.ReactNode;
  side?: Side[];
  /** props in the world, in front of everyone (the table) */
  front?: (t: number) => React.ReactNode;
  /** drawn in the world behind everyone (a glow behind a character) */
  under?: (t: number) => React.ReactNode;
  cam?: 'reveal' | 'push' | 'none';
  dim?: number;
  header?: [string, string?];
  action: string;
};
const stand = (x: Partial<Pose>): Partial<Pose> => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const badgeIn = (t: number, k: number, from: 'left' | 'right' | 'top' = 'right') => (
  <g>
    <Glow x={badgeX(k, 4)} y={120} r={140} />
    <In t={t} at={SLOT_AT()[k]} x={540} y={520} k={2.2} from={from}><BigBadge b={BADGES[k]} /></In>
  </g>
);
const TABLE_Y = 1290;

export const EP08_PLAN: Shot[] = [
  // ── The story ──
  {at: 0, line: 'Ebo was the nicest guy…', stage: 'scene', cam: 'reveal',
    ebo: {x: 540, pose: {eyes: 'happy', mouth: 'grin'}, acts: [[3, {armR: [140, -10], eyes: 'happy', mouth: 'laugh', headTilt: 6}]]},
    under: () => <Glow x={540} y={1200} r={480} />,
    board: (t) => <In t={t} at={at(3)} x={0} y={0} from="left"><Label x={540} y={560} text="the nicest guy" red size={100} rot={-3} /></In>,
    action: 'Ebo, beaming, in a glow; on "nicest" he waves big. "the nicest guy" swoops in.'},
  {at: 5, line: '…in his whole friend group.', stage: 'scene', cam: 'reveal',
    ebo: {x: 540, pose: {eyes: 'happy', mouth: 'grin'}},
    side: [
      {who: 'pretty', x: 210, pose: stand({eyes: 'happy', mouth: 'grin'}), enter: {from: -300}, acts: [[8, {armL: [130, -10], headTilt: 8}]]},
      {who: 'ama', x: 870, pose: stand({eyes: 'happy', mouth: 'grin'}), facing: -1, enter: {from: 1400}, acts: [[8, {armL: [130, -10], headTilt: -8}]]},
    ],
    action: 'Christy and Ama walk in from both sides; on "friend group" all three wave.'},
  {at: 10, line: 'He covered dinner…', stage: 'scene', cam: 'push',
    ebo: {x: 540, pose: {eyes: 'happy', mouth: 'smile'}, acts: [[11, {armR: [80, -20]}]]},
    side: [{who: 'pretty', x: 210, pose: stand({eyes: 'happy', mouth: 'grin'})}],
    front: (t) => (
      <g>
        <DinnerTable x={540} y={TABLE_Y} />
        <In t={t} at={at(12)} x={560} y={TABLE_Y - 20} k={1} rot={-80} from="right"><Receipt len={260} /></In>
      </g>
    ),
    board: (t) => badgeIn(t, 0, 'top'),
    action: 'A dinner table: Christy and Ebo. On "dinner" the bill swoops onto the table in front of Ebo. The first badge (a plate) lights up.'},
  {at: 13, line: '…when Christy forgot her wallet.', stage: 'story', cam: 'push',
    side: [{who: 'pretty', x: 420, pose: stand({eyes: 'wide', mouth: 'o', armL: [30, -30], armR: [30, -30]}), acts: [[15, {armL: [60, 20], armR: [60, 20], headTilt: 10, mouth: 'grimace'}], [17, {eyes: 'happy', mouth: 'grin', headTilt: -8}]]}],
    board: (t) => (
      <g>
        <In t={t} at={at(17)} x={800} y={760} k={2.4} from="right"><Wallet x={0} y={0} /></In>
        <In t={t} at={at(17) + 0.25} x={800} y={760} k={1.6} twist={0}><Mark kind="cross" /></In>
      </g>
    ), action: 'Christy pats her pockets… "wallet": a wallet swoops in and gets crossed out. She grins.'},
  {at: 18, line: 'Four times.', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        {[0, 1, 2, 3].map((k) => (
          <In key={k} t={t} at={at(18) + k * 0.16} x={230 + k * 210} y={900} k={1.1} rot={k % 2 ? 8 : -8} from={k % 2 ? 'right' : 'left'}><Receipt len={360} /></In>
        ))}
      </g>
    ), action: 'Four bills slap down in a row, one after another.'},
  {at: 20, line: 'He helped Ama move.', stage: 'scene', cam: 'reveal',
    ebo: {x: 330, pose: {eyes: 'happy', mouth: 'smile', armR: [70, -30]}, hold: <MovingBox x={0} y={-20} />},
    side: [{who: 'ama', x: 820, pose: stand({eyes: 'happy', mouth: 'grin'}), facing: -1, acts: [[23, {armR: [110, -10], headTilt: -8}]]}],
    board: (t) => (
      <g>
        {badgeIn(t, 1, 'left')}
        <In t={t} at={at(23)} x={640} y={1300} k={1.2} from="top"><MovingBox /></In>
        <In t={t} at={at(23) + 0.15} x={640} y={1120} k={1.2} from="top"><MovingBox rotate={5} /></In>
      </g>
    ), action: 'Ebo carrying a box; Ama points; on "move" more boxes drop. The second badge (a box) lights up.'},
  {at: 24, line: 'Twice.', stage: 'close', ebo: {x: 540, pose: {eyes: 'tired', mouth: 'flat'}},
    board: (t) => <In t={t} at={at(24)} x={0} y={0} from="right"><Label x={760} y={560} text="x2" red size={150} /></In>,
    action: 'Close: Ebo, deadpan. "x2" swoops in.'},
  {at: 25, line: 'Same apartment.', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        <In t={t} at={at(25)} x={290} y={900} k={1.6} from="left"><House /></In>
        <In t={t} at={at(26)} x={0} y={0}><Label x={540} y={930} text="=" size={160} /></In>
        <In t={t} at={at(26)} x={790} y={900} k={1.6} from="right"><House /></In>
      </g>
    ), action: 'An apartment… "=" the same apartment.'},
  {at: 27, line: 'He lent his car…', stage: 'scene', cam: 'push',
    ebo: {x: 330, pose: {eyes: 'happy', mouth: 'smile', armR: [80, -20]}, hold: <CarKeys />, acts: [[30, {armR: [90, -10], hold: null}]]},
    side: [{who: 'pretty', x: 790, pose: stand({eyes: 'happy', mouth: 'grin', armR: [80, -20]}), facing: -1, acts: [[30, {hold: <CarKeys />, armR: [120, -10], mouth: 'laugh'}]]}],
    board: (t) => badgeIn(t, 2, 'top'),
    action: 'Ebo holds out his keys; on "car" they jump to Christy, who throws her arm up. The third badge (a key) lights up.'},
  {at: 31, line: '…for "one hour."', stage: 'story', cam: 'push',
    board: (t) => (
      <g>
        <In t={t} at={at(32)} x={540} y={820} k={2} from="top"><Clock h={1} /></In>
        <In t={t} at={at(33)} x={0} y={0} from="left"><Label x={540} y={1200} text='"one hour"' red size={110} rot={-3} /></In>
      </g>
    ), action: 'A clock… "one hour".'},
  {at: 34, line: 'It came back three days later…', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        {['1', '2', '3'].map((n, k) => (
          <In key={n} t={t} at={at(37) + k * 0.2} x={250 + k * 290} y={880} k={1} rot={(k - 1) * 6} from="top"><CalPage top="DAY" n={n} /></In>
        ))}
      </g>
    ), action: 'Calendar pages drop: day 1, day 2, day 3.'},
  {at: 40, line: '…with a parking ticket.', stage: 'insert', ebo: {x: 860, pose: {eyes: 'wide', mouth: 'o', lookX: -18, lookY: -12}},
    board: (t) => (
      <g>
        <In t={t} at={at(42)} x={480} y={820} k={2.4} rot={-6} from="right"><ParkingTicket /></In>
        <In t={t} at={at(42) + 0.35} x={180} y={1250} k={1.4} rot={-20}><CarKeys /></In>
      </g>
    ), action: 'Insert: the keys come back… with a parking ticket, $85, filling the frame. Ebo stares from the corner.'},
  {at: 44, line: 'So for his birthday…', stage: 'scene', cam: 'reveal',
    ebo: {x: 540, pose: {eyes: 'wide', mouth: 'grin'}, acts: [[47, {armL: [120, -10], armR: [120, -10], eyes: 'happy', mouth: 'laugh', lift: -20}]]},
    board: (t) => <In t={t} at={at(47)} x={540} y={760} k={1.8} from="top"><Cake /></In>,
    action: 'A birthday cake drops in above Ebo; he throws both arms up.'},
  {at: 48, line: '…they threw him a surprise party.', stage: 'scene', cam: 'reveal',
    ebo: {x: 540, pose: {eyes: 'wide', mouth: 'o'}, acts: [[52, {eyes: 'happy', mouth: 'laugh', armL: [100, -20], armR: [100, -20]}]]},
    side: [
      {who: 'pretty', x: 210, pose: stand({eyes: 'happy', mouth: 'laugh', armL: [140, -10], armR: [140, -10], lift: -20}), enter: {from: -300, dur: 0.3}},
      {who: 'ama', x: 870, pose: stand({eyes: 'happy', mouth: 'laugh', armL: [140, -10], armR: [140, -10], lift: -20}), facing: -1, enter: {from: 1400, dur: 0.3}},
    ],
    board: (t) => <In t={t} at={at(52)} x={0} y={0} from="top"><Label x={540} y={520} text="SURPRISE!" red size={130} rot={-4} /></In>,
    action: 'Christy and Ama jump in from both sides, arms up: "SURPRISE!" Ebo is thrilled.'},
  {at: 54, line: 'At his favorite restaurant.', stage: 'scene', cam: 'push',
    ebo: {x: 540, pose: {eyes: 'happy', mouth: 'grin'}},
    side: [
      {who: 'pretty', x: 210, pose: stand({eyes: 'happy', mouth: 'grin'})},
      {who: 'ama', x: 870, pose: stand({eyes: 'happy', mouth: 'grin'}), facing: -1},
    ],
    front: (t) => (
      <g>
        <DinnerTable x={540} y={TABLE_Y} />
        <In t={t} at={at(57)} x={540} y={TABLE_Y - 90} k={0.8} from="top"><Cake /></In>
      </g>
    ), action: 'All three at the restaurant table; on "restaurant" the cake lands on it.'},
  {at: 58, line: 'And sent him the bill.', stage: 'close', ebo: {x: 540, pose: {eyes: 'wide', mouth: 'scream'}},
    board: (t) => (
      <g>
        <Glow x={badgeX(3, 4)} y={120} r={150} />
        <In t={t} at={at(62) + 0.15} x={300} y={780} k={1.5} rot={-10} from="top"><Receipt len={560} total="$412.80" /></In>
      </g>
    ), action: 'THE TWIST: close on Ebo… on "bill" the last badge turns red ($$) and a huge bill slams down in front of him.'},
  // ── The lesson ──
  {at: 63, line: 'Ebo didn\'t get used because he was nice.', stage: 'react', ebo: {x: 540, pose: {eyes: 'half', mouth: 'flat', lookY: -14}}, cam: 'push',
    board: (t) => (
      <g>
        <In t={t} at={at(70)} x={540} y={760} k={2.2} from="left"><Heart /></In>
        <In t={t} at={at(70) + 0.2} x={0} y={0}><Label x={540} y={1060} text="not the problem" red rot={-3} /></In>
      </g>
    ), action: 'A heart (nice)… "not the problem".'},
  {at: 71, line: 'He got used because his yes was free.', stage: 'react', ebo: {x: 540, pose: {eyes: 'squint', mouth: 'flat', lookY: -14}}, cam: 'push',
    board: (t) => (
      <g>
        <In t={t} at={at(76)} x={0} y={0} from="left"><Label x={540} y={660} text="YES" size={170} /></In>
        <In t={t} at={at(78)} x={700} y={720} k={1.9} rot={16} from="right">
          <g>
            <path d="M 0 -40 L 170 -40 L 200 0 L 170 40 L 0 40 Z" fill={RED} stroke={INK} strokeWidth={6} />
            <text x={90} y={16} textAnchor="middle" fontFamily="EboMarker" fontSize={46} fill="#fff">FREE</text>
          </g>
        </In>
      </g>
    ), action: 'A big YES… a red FREE tag slaps onto it.'},
  {at: 79, line: 'So now he says no.', stage: 'scene', cam: 'reveal',
    ebo: {x: 720, pose: {eyes: 'half', mouth: 'smile'}, acts: [[83, {armL: [95, 0], eyes: 'half', mouth: 'flat'}]]},
    side: [{who: 'pretty', x: 280, pose: stand({eyes: 'happy', mouth: 'grin', armR: [80, -20]}), hold: <Receipt len={220} rotate={-20} />, acts: [[83, {eyes: 'wide', mouth: 'o'}]]}],
    board: (t) => <In t={t} at={at(83)} x={760} y={640} k={1.3} from="right"><Speech short /></In>,
    action: 'Christy holds out another bill; on "no" Ebo puts a hand up: "No." She blinks.'},
  {at: 84, line: 'No speech.', stage: 'story', cam: 'push',
    board: (t) => <In t={t} at={at(85)} x={540} y={880} k={1.3} from="left"><Speech /></In>,
    action: 'The long speech of excuses, crossed out.'},
  {at: 86, line: 'And next birthday…', stage: 'scene', cam: 'push',
    ebo: {x: 540, pose: {eyes: 'half', mouth: 'smirk'}},
    front: () => <DinnerTable x={540} y={TABLE_Y} />,
    action: 'Back at the restaurant table, Ebo, smug.'},
  {at: 89, line: '…he\'s ordering lobster.', stage: 'insert', ebo: {x: 860, pose: {eyes: 'happy', mouth: 'grin', lookX: -18, lookY: -12}},
    board: (t) => (
      <g>
        <Glow x={480} y={860} r={460} />
        <In t={t} at={at(91)} x={480} y={860} k={2.1} from="top"><Lobster /></In>
      </g>
    ), action: 'THE BUTTON: a lobster lands, glowing, filling the frame. Ebo grins in the corner.'},
];

export const EP08_SECTIONS: string[] = EP08_PLAN.map((s) => (s.at < 10 ? 'The Nicest Guy' : s.at < 44 ? 'The Favors' : s.at < 63 ? 'The Party' : 'The Lesson'));

export const ep08Times = () => {
  const starts = EP08_PLAN.map((s) => Math.max(0, WORDS[s.at].s - 0.08));
  starts[0] = 0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : END) - st}));
};
const TIMES = ep08Times();
export const EP08_SHOT_TIMES = TIMES.map((x) => x.start);
export const ep08ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < TIMES.length; k++) if (t >= TIMES[k].start) i = k;
  return i;
};

/** A pop for each picture that lands without a swoop. */
export const EP08_SLAMS: number[] = [26, 52].map(at).concat([at(17) + 0.25, at(42) + 0.35, at(70) + 0.2]);
/** Swooshes (rule 21): a loud one for each piece that swoops in, a soft one on each camera reveal. */
export const EP08_SWOOSH = () => {
  const pieces = [3, 12, 17, 23, 24, 25, 26, 32, 33, 42, 47, 52, 57, 62, 70, 76, 78, 83, 85, 91].map(at)
    .concat([0, 1, 2, 3].map((k) => at(18) + k * 0.16), [0, 1, 2].map((k) => at(37) + k * 0.2));
  const reveals = EP08_PLAN.map((s, i) => ((s.cam ?? (s.stage === 'close' ? 'push' : 'reveal')) === 'reveal' && i > 0 ? TIMES[i].start : null)).filter((x): x is number => x !== null);
  return [...pieces.map((a) => ({at: a - 0.05, sfx: 'swoosh', vol: 0.75})), ...reveals.map((a) => ({at: a, sfx: 'swoosh', vol: 0.35}))];
};
/** Sound effects beyond the pops (sfxCues.ts). */
export const EP08_SFX = () => [
  ...EP08_SWOOSH(),
  ...SLOT_AT().map((a) => ({at: a + 0.05, sfx: 'pop', vol: 0.8})),
  {at: at(62) + 0.3, sfx: 'stamp', vol: 0.9}, // the bill slams down
  {at: at(52), sfx: 'pop', vol: 1}, // SURPRISE!
  {at: at(42) + 0.4, sfx: 'clink', vol: 0.7}, // the keys come back
  {at: at(91) + 0.2, sfx: 'cha_ching', vol: 0.6}, // lobster
];

// ───────────────────────── performance ─────────────────────────
const ENV = (envJson as Record<string, number[]>).ebo;
const talking = (f: number) => (ENV[f] ?? 0) > 0.1;
/** Never frozen (rule 18): a slow lean and shoulder shift, a glance while talking, a blink on every cut. */
const idle = (t: number, l: number, f: number, i: number): Partial<Pose> => {
  const glance = Math.floor(t / 1.7) % 3 === 1 && t % 1.7 < 0.25 && talking(f) ? (Math.floor(t / 1.7) % 2 ? 7 : -7) : 0;
  return {
    tilt: 1.3 * Math.sin((t * 2 * Math.PI) / 3.1),
    lift: 2.5 * Math.sin((t * 2 * Math.PI) / 2.3 + 1),
    ...(glance ? {lookX: glance} : {}),
    ...(i > 0 && l < 0.1 ? {eyes: 'closed' as const} : {}),
  };
};
/** Where an actor is and what they're doing now: walk in / walk off (legs swap every 0.12 s while moving), pose-to-pose on the words. */
const perform = (c: Actor, t: number, local: number, st: number) => {
  let x = c.x;
  let moving = false;
  if (c.enter) {
    const u = Math.min(1, local / (c.enter.dur ?? 0.45));
    x = c.enter.from + (c.x - c.enter.from) * (1 - (1 - u) ** 2);
    moving = u < 1;
  }
  if (c.exit && t >= at(c.exit.at)) {
    const u = Math.min(1, (t - at(c.exit.at)) / (c.exit.dur ?? 0.5));
    x = c.x + (c.exit.to - c.x) * u * u;
    moving = u < 1;
  }
  let p: Partial<Pose> = {...c.pose};
  let hold = c.hold;
  let holdL = c.holdL;
  for (const [w, a] of c.acts ?? []) {
    if (t < at(w)) continue;
    const {hold: h, holdL: hl, ...rest} = a;
    p = {...p, ...rest};
    if (h !== undefined) hold = h ?? undefined;
    if (hl !== undefined) holdL = hl ?? undefined;
  }
  if (moving) {
    const ph = Math.floor((t - st) / 0.12) % 2;
    p = {...p, legL: ph ? [20, 6] : [-8, 0], legR: ph ? [-8, 0] : [20, 6], lift: -6 * ph};
  }
  return {x, p, hold, holdL};
};

export const Ep08Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep08ShotAt(f);
  const s = EP08_PLAN[i];
  const local = t - TIMES[i].start;
  const st = TIMES[i].start;
  const place = EBO_AT[s.stage];

  // Ebo: the shot's face and acting; a contact pose, or his hands on the beat; idle and nods on top
  const me = s.ebo ? perform(s.ebo, t, local, st) : null;
  let pose: Pose = {...POSE.stand, ...me?.p} as Pose;
  const actedArms = s.ebo?.acts?.some(([w, a]) => t >= at(w) && (a.armL || a.armR)) || s.ebo?.hold || s.ebo?.pose?.armR;
  if (s.touch) {
    const c = CONTACT[s.touch];
    pose = {...pose, armL: c.armL, armR: c.armR, armFront: c.armFront, contact: true, headTilt: c.headTilt, view: 1};
  } else if (!actedArms) pose = beatGesture(pose, WORDS, ENV, f, st, st + TIMES[i].length);
  const id = idle(t, local, f, i);
  pose = {...pose, tilt: (pose.tilt ?? 0) + (id.tilt ?? 0), lift: (pose.lift ?? 0) + (id.lift ?? 0), ...(id.lookX ? {lookX: id.lookX} : {}), ...(id.eyes ? {eyes: id.eyes} : {})} as Pose;
  // he nods on the words while he talks
  const wi = WORDS.findIndex((w) => t >= w.s && t < w.e);
  if (wi >= 0 && talking(f)) pose = {...pose, headTilt: (pose.headTilt ?? 0) + (wi % 2 ? 4 : -3)} as Pose;

  // the camera swoop (video only; the Animate file stays camera-free)
  const camKind = s.cam ?? (s.stage === 'close' ? 'push' : 'reveal');
  const zoom = swoopZoom(camKind, local, TIMES[i].length);
  const base = FRAMES[s.stage];
  const framing = {...base, zoom: base.zoom * zoom};
  const zoomScreen = `translate(540 960) scale(${zoom}) translate(-540 -960)`;
  const overlay = (
    <g>
      {s.dim !== undefined && <Dim t={t} at={at(s.dim)} />}
      <g transform={zoomScreen}>{s.board?.(t)}</g>
      <Tracker t={t} from={TRACK_FROM()} slotAt={SLOT_AT()} badges={BADGES} />
      {s.header && <Header text={s.header} />}
    </g>
  );
  const eboX = s.stage === 'scene' && me ? me.x : place?.x ?? 540;
  return (
    <StageSizeContext.Provider value={{w: EP08_W, h: EP08_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={framing} bg={SHADES.cream[2]} blurBg={<Backdrop id="ep08-cream" shade="cream" />} overlay={overlay}>
              {s.under?.(t)}
              {s.side?.map((c, k) => {
                const a = perform(c, t, local, st);
                return (
                  <RigCharacter key={k} who={c.who} x={a.x} y={FLOOR} scale={CAST_SCALE} facing={c.facing ?? 1} t={f + k * 13} pose={gentle({...(POSES.standing as Pose), ...a.p} as Pose)} holdL={a.holdL}>
                    {a.hold}
                  </RigCharacter>
                );
              })}
              {place && (
                <RigCharacter who="ebo" x={eboX} y={place.y} scale={place.scale} t={f} pose={gentle(frontOn(pose))} holdL={me?.holdL}
                  mouthFrame={talking(f) ? lipFrame(ENV, WORDS, f) : undefined}>
                  {me?.hold}
                </RigCharacter>
              )}
              {s.front?.(t)}
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp08: React.FC = () => (
  <>
    <Ep08Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep08/voice.mp3')} />
    {/* sound effects (src/series/sfxCues.ts, mixed by scripts/sfx/mix.py) */}
    <Html5Audio src={staticFile('ebo-ep08/sfx.mp3')} />
  </>
);
