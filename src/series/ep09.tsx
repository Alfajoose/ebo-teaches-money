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
import {Arrow, BufferJar, CalNote, CheapShoe, CoinStack, CreditCard, DirtPile, DoctorBill, EmptyWallet, FeeSlip, FlatTire, GoodShoe, HillPath, Hole, HopeSign, LotteryTicket, Padlock, SayBubble, Shovel, SkillLaptop, StickGuy, Thought} from '../components/PovertyProps';
import wordsJson from './data/ep09-words.json';
import envJson from './data/ep09-env.json';

/**
 * EBO TEACHES MONEY — Ep 09 "Why Some People Never Escape Poverty" (vertical, 1080×1920, ~56s).
 * v2: the script and the pictures follow the user's reference board (16 shots). Rule 19 format with a tracker of
 * three padlocks (no safety net · the poverty tax · ? → the escape fantasy); the Peanut animation (rule 21): a
 * picture on every key word, swoops with a swoosh, camera swoops in the video only, every take moves.
 * The joke is never on poor people: it names the traps. (v1, the bold-and-blunt cut, is in git: 758b08c.)
 */
export const EP09_W = 1080;
export const EP09_H = 1920;
type W8 = Word & {who: 'ebo'};
const WORDS = wordsJson as W8[];
const END = WORDS[WORDS.length - 1].e + 0.6;
export const EP09_DURATION = Math.ceil(END * VFPS);
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
// ───────────────────────── the tracker ─────────────────────────
const LOCK = (inner: React.ReactNode) => (
  <g>
    <path d="M -18 -8 L -18 -26 Q -18 -42 0 -42 Q 18 -42 18 -26 L 18 -8" fill="none" stroke="#fff" strokeWidth={7} />
    <rect x={-28} y={-10} width={56} height={44} rx={8} fill="#fff" />
    <g transform="translate(0 12)">{inner}</g>
  </g>
);
const BADGES: Badge[] = [
  {color: '#45B69C', icon: LOCK(<rect x={-10} y={-12} width={20} height={24} rx={4} fill="none" stroke="#45B69C" strokeWidth={4} />)}, // no safety net: an empty jar
  {color: '#E5484D', icon: LOCK(<text y={9} textAnchor="middle" fontFamily="EboMarker" fontSize={22} fill="#E5484D">FEE</text>)}, // the poverty tax
  {color: '#F2C230', icon: LOCK(<text y={10} textAnchor="middle" fontFamily="EboMarker" fontSize={28} fill="#B88A10">$</text>)}, // ? → the escape fantasy: easy money
];
const SLOT_AT = () => [at(27), at(52), at(80)];
const TRACK_FROM = () => at(23);
const badgeIn = (t: number, k: number, from: 'left' | 'right' | 'top' = 'right', x = 540) => (
  <g>
    <Glow x={badgeX(k, 3)} y={120} r={140} />
    <Glow x={x} y={760} r={380} />
    <In t={t} at={SLOT_AT()[k]} x={x} y={760} k={3.2} from={from}><BigBadge b={BADGES[k]} /></In>
  </g>
);
const ebo = (p: Partial<Pose>): Actor => ({x: 540, pose: p});

export const EP09_PLAN: Shot[] = [
  // ── The hook ──
  {at: 0, line: 'Ever noticed how being broke actually costs you more money?', stage: 'react', ebo: ebo({eyes: 'wide', mouth: 'o', lookX: -10, lookY: -16}),
    board: (t) => (
      <g>
        <In t={t} at={at(4)} x={440} y={700} k={1.4} from="left"><CoinStack up={t >= at(8)} /></In>
        <In t={t} at={at(8)} x={0} y={0} from="right"><Label x={540} y={1010} text="costs MORE" red size={100} rot={-3} /></In>
      </g>
    ), action: 'Ebo, surprised, eyes on a stack of coins that swoops in on "broke"… on "more" a red arrow shoots up: "costs MORE".'},
  {at: 10, line: 'It\'s like climbing out of a hole while someone keeps digging.', stage: 'story', cam: 'push',
    board: (t) => {
      const dug = t >= at(20);
      const swing = t >= at(19) ? Math.floor((t - at(19)) / 0.22) % 2 : 0;
      return (
        <g>
          <g transform="translate(540 1040)"><Hole /></g>
          <g transform={`translate(470 ${dug ? 1330 : t >= at(13) ? 1170 : t >= at(12) ? 1250 : 1330})`}><StickGuy pose="climb" sad={dug} /></g>
          <In t={t} at={at(18)} x={860} y={1040} k={1} from="right"><DirtPile /></In>
          <In t={t} at={at(18)} x={880} y={824} k={1} from="right"><StickGuy pose="dig" /></In>
          <In t={t} at={at(18) + 0.1} x={790} y={850} k={1} from="right" rot={swing ? -35 : -10}><Shovel dirt={!!swing} /></In>
        </g>
      );
    }, action: 'A stick figure climbs out of a hole, step by step… a digger swoops in on the edge and keeps shovelling; the climber slides back down.'},
  {at: 21, line: 'And three locks keep people down.', stage: 'react', ebo: ebo({eyes: 'squint', mouth: 'flat', lookY: -18}),
    board: (t) => (
      <g>
        {(['jar', 'fees', 'q'] as const).map((face, k) => <In key={k} t={t} at={at(22) + k * 0.18} x={230 + k * 310} y={720} k={1.3} from={(['left', 'top', 'right'] as const)[k]}><Padlock rotate={(k - 1) * 6} face={face} /></In>)}
      </g>
    ), action: 'Three padlocks land over Ebo\'s head: a jar, FEES, a "?". The tracker appears: three grey "?".'},
  // ── Lock 1: no safety net ──
  {at: 27, line: 'First. No safety net.', stage: 'react', ebo: ebo({eyes: 'wide', mouth: 'o', lookY: -18}), header: ['Lock 1:', 'No safety net'], dim: 27,
    board: (t) => (
      <g>
        {badgeIn(t, 0, 'left', 340)}
        <In t={t} at={at(29)} x={650} y={760} k={0.9} twist={0} from="drop"><Arrow /></In>
        <In t={t} at={at(30)} x={860} y={760} k={0.75} from="right"><BufferJar /></In>
      </g>
    ), action: 'LOCK 1 lights up (green) and drops in big → an arrow → an empty jar.'},
  {at: 31, line: 'Your car breaks down. You borrow to fix it. Interest piles up.', stage: 'react', ebo: ebo({eyes: 'sad', mouth: 'flat', lookY: -16}), header: ['Lock 1:', 'No safety net'],
    board: (t) => (
      <g>
        <In t={t} at={at(32)} x={210} y={580} k={0.9} from="left"><FlatTire /></In>
        <In t={t} at={at(35)} x={395} y={590} k={0.8} twist={0} from="drop"><Arrow /></In>
        <In t={t} at={at(36)} x={580} y={620} k={0.75} rot={-4} from="top"><DoctorBill /></In>
        <In t={t} at={at(39)} x={740} y={760} k={0.8} rot={35} twist={0} from="drop"><Arrow /></In>
        <In t={t} at={at(40)} x={860} y={860} k={0.6} rot={-6} from="right"><CreditCard amount={t >= at(41) ? '$260' : '$200'} /></In>
        <In t={t} at={at(41)} x={0} y={0} from="left"><Label x={330} y={900} text="+ interest" red size={90} rot={-4} /></In>
      </g>
    ), action: 'Over a worried Ebo, built left to right: a flat tire → a doctor\'s bill ($200) → a credit card… on "piles up" it ticks to $260: "+ interest".'},
  {at: 43, line: 'Now you\'re paying for yesterday\'s emergency with tomorrow\'s paycheck.', stage: 'react', ebo: ebo({eyes: 'tired', mouth: 'flat', lookY: -16}), header: ['Lock 1:', 'No safety net'],
    board: (t) => (
      <g>
        <In t={t} at={at(47)} x={280} y={720} k={0.9} rot={-4} from="left"><CalNote title="TODAY" note="emergency" /></In>
        <In t={t} at={at(49)} x={540} y={720} k={0.8} twist={0} from="drop"><Arrow color={RED} /></In>
        <In t={t} at={at(50)} x={800} y={720} k={0.9} rot={4} from="right"><CalNote title="NEXT" title2="PAYCHECK" note="paying for it" /></In>
      </g>
    ), action: 'Over a tired Ebo: a calendar page, TODAY (emergency) → NEXT PAYCHECK (paying for it).'},
  // ── Lock 2: the poverty tax ──
  {at: 52, line: 'Second. The poverty tax.', stage: 'react', ebo: ebo({eyes: 'squint', mouth: 'flat', lookY: -18}), header: ['Lock 2:', 'The poverty tax'], dim: 52,
    board: (t) => badgeIn(t, 1, 'right'), action: 'LOCK 2 lights up (red, FEES) and drops in big.'},
  {at: 56, line: 'Late fees. Overdraft charges.', stage: 'react', ebo: ebo({eyes: 'squeeze', mouth: 'grimace', lookY: -14}), header: ['Lock 2:', 'The poverty tax'],
    board: (t) => (
      <g>
        <In t={t} at={at(56)} x={300} y={720} k={1} rot={-6} from="left"><FeeSlip top="LATE" bottom="FEE" amount="$35" /></In>
        <In t={t} at={at(58)} x={780} y={740} k={1} rot={6} from="right"><FeeSlip top="OVERDRAFT" bottom="FEE" amount="$38" /></In>
      </g>
    ), action: 'LATE FEE $35 slams down… OVERDRAFT FEE $38 beside it. Ebo winces at each one.'},
  {at: 60, line: 'Cheap shoes that fall apart. You know the expensive pair lasts longer.', stage: 'react', ebo: ebo({eyes: 'half', mouth: 'flat', lookY: -16}), header: ['Lock 2:', 'The poverty tax'],
    board: (t) => (
      <g>
        <In t={t} at={at(60)} x={0} y={0} from="left"><Label x={280} y={510} text="cheap" size={96} /></In>
        <In t={t} at={at(60) + 0.1} x={0} y={0} from="drop"><Label x={280} y={600} text="(3 months)" red size={64} /></In>
        <In t={t} at={at(60)} x={280} y={800} k={1.5} from="left"><CheapShoe worn={t >= at(63)} /></In>
        <In t={t} at={at(68)} x={0} y={0} from="right"><Label x={790} y={510} text="better" size={96} /></In>
        <In t={t} at={at(68) + 0.1} x={0} y={0} from="drop"><Label x={790} y={600} text="(longer)" size={64} /></In>
        <In t={t} at={at(68)} x={790} y={800} k={1.5} from="right"><GoodShoe /></In>
      </g>
    ), action: 'CHEAP (3 months): a shoe… on "fall apart" its sole flaps off. Then BETTER (longer) swoops in beside it.'},
  {at: 72, line: 'But your wallet says, "Not today, my friend."', stage: 'react', ebo: ebo({...POSE.shrug, eyes: 'sad', mouth: 'flat', lookY: -10}), header: ['Lock 2:', 'The poverty tax'],
    board: (t) => (
      <g>
        <In t={t} at={at(74)} x={260} y={900} k={0.8} rot={-6} from="left"><EmptyWallet /></In>
        <In t={t} at={at(76)} x={640} y={640} k={1} from="top"><SayBubble a="Not today," b="my friend." /></In>
      </g>
    ), action: 'Ebo shrugs. His empty wallet swoops in… and speaks: "Not today, my friend."'},
  // ── Lock 3: the escape fantasy ──
  {at: 80, line: 'Third. The escape fantasy.', stage: 'react', ebo: ebo({eyes: 'happy', mouth: 'smile', lookY: -18}), header: ['Lock 3:', 'The escape fantasy'], dim: 80,
    board: (t) => (
      <g>
        {badgeIn(t, 2, 'top', 340)}
        <In t={t} at={at(82)} x={650} y={760} k={0.9} twist={0} from="drop"><Arrow /></In>
        <In t={t} at={at(83)} x={860} y={760} k={0.6} rot={8} from="right"><LotteryTicket /></In>
      </g>
    ), action: 'LOCK 3: the "?" turns gold ($) and drops in big → an arrow → a lottery ticket.'},
  {at: 84, line: 'Waiting for that one lucky break. That viral idea. That miracle job.', stage: 'react', ebo: ebo({eyes: 'happy', mouth: 'smile', lookY: -20}), touch: 'thinkChin', header: ['Lock 3:', 'The escape fantasy'],
    board: (t) => (
      <g>
        <In t={t} at={at(88)} x={230} y={720} k={1} from="left"><Thought kind="money" side={-1} /></In>
        <In t={t} at={at(91)} x={540} y={540} k={1} from="top"><Thought kind="video" side={0} /></In>
        <In t={t} at={at(94)} x={850} y={720} k={1} from="right"><Thought kind="job" side={1} /></In>
      </g>
    ), action: 'Ebo daydreams, chin on his hand. Three thought bubbles pop, one per phrase: $$$, a video, a briefcase.'},
  {at: 96, line: 'But hope without a plan keeps you standing still.', stage: 'scene', cam: 'reveal',
    ebo: {x: 320, pose: {eyes: 'half', mouth: 'flat'}, acts: [[103, {eyes: 'tired', armL: [12, 6], armR: [12, 6]}]]},
    board: (t) => <In t={t} at={at(97)} x={770} y={FLOOR} k={1} from="right"><HopeSign noPlan={t >= at(100)} /></In>,
    action: 'Ebo stands beside a wooden sign: HOPE… on "plan": "(no plan)". On "standing still" he stops moving.'},
  // ── Where to start ──
  {at: 105, line: 'So where do you start? Build a tiny buffer. Dodge the fees you can. Learn a skill that opens another door.', stage: 'react', ebo: ebo({eyes: 'happy', mouth: 'smile', lookY: -16}), header: ['So where do you', 'start?'],
    board: (t) => (
      <g>
        <In t={t} at={at(110)} x={190} y={660} k={0.8} from="left"><BufferJar coins /></In>
        <In t={t} at={at(112)} x={0} y={0} from="drop"><Label x={190} y={920} text="tiny buffer" size={50} /></In>
        <In t={t} at={at(114)} x={540} y={650} k={0.75} rot={5} from="top"><FeeSlip top="LATE" bottom="FEE" crossed={t >= at(116)} /></In>
        <In t={t} at={at(116)} x={0} y={0} from="drop"><Label x={540} y={920} text="dodge fees" size={50} /></In>
        <In t={t} at={at(119)} x={880} y={680} k={0.85} from="right"><SkillLaptop /></In>
        <In t={t} at={at(121)} x={0} y={0} from="drop"><Label x={890} y={920} text="learn a skill" size={50} /></In>
      </g>
    ), action: 'Ebo, smiling. Over him, one per phrase: a jar with a few coins, a LATE FEE crossed out, a laptop with a gear.'},
  // ── The close ──
  {at: 126, line: 'And remember: some locks need more than one person to break.', stage: 'react', ebo: ebo({eyes: 'open', mouth: 'smile', lookY: -16}),
    board: (t) => (
      <g>
        {t >= at(136) && <Glow x={230} y={700} r={260} />}
        {(['jar', 'fees', 'q'] as const).map((face, k) => <In key={k} t={t} at={at(128) + k * 0.12} x={230 + k * 310} y={720} k={1.3} from={(['left', 'top', 'right'] as const)[k]}><Padlock rotate={(k - 1) * 6} face={face} open={k === 0 && t >= at(136)} /></In>)}
      </g>
    ), action: 'The three locks over Ebo again… on "break" the first pops open; the other two stay shut.'},
  {at: 137, line: 'Poverty isn\'t always a choice. And escaping it isn\'t always a straight line.', stage: 'scene', cam: 'push',
    ebo: {x: 290, pose: {eyes: 'open', mouth: 'smile', armR: [60, -20]}},
    board: (t) => (
      <g>
        <In t={t} at={at(137)} x={540} y={560} k={1} from="top"><SayBubble lines={t >= at(142) ? ['Poverty isn\'t always a choice.', 'And escaping it isn\'t', 'always a straight line.'] : ['Poverty isn\'t always a choice.']} size={58} w={1000} /></In>
        <In t={t} at={at(143)} x={760} y={FLOOR} k={0.9} from="right"><HillPath /></In>
      </g>
    ), action: 'Ebo, front on, his speech bubble filling line by line. A hill swoops in beside him: a winding path climbs to a flag.'},
];

export const EP09_SECTIONS: string[] = EP09_PLAN.map((s) => (s.at < 27 ? 'The Hook' : s.at < 52 ? 'No Safety Net' : s.at < 80 ? 'The Poverty Tax' : s.at < 105 ? 'The Escape Fantasy' : s.at < 126 ? 'Where To Start' : 'The Close'));

export const ep09Times = () => {
  const starts = EP09_PLAN.map((s) => Math.max(0, WORDS[s.at].s - 0.08));
  starts[0] = 0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : END) - st}));
};
const TIMES = ep09Times();
export const EP09_SHOT_TIMES = TIMES.map((x) => x.start);
export const ep09ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < TIMES.length; k++) if (t >= TIMES[k].start) i = k;
  return i;
};

/** A pop for each picture that lands without a swoop. */
export const EP09_SLAMS: number[] = [8, 29, 35, 39, 41, 49, 63, 82, 100, 112, 116, 121].map(at);
/** Swooshes (rule 21). */
export const EP09_SWOOSH = () => {
  const pieces = [4, 18, 30, 32, 36, 40, 47, 50, 56, 58, 60, 68, 74, 76, 83, 88, 91, 94, 97, 110, 114, 119, 137, 143].map(at)
    .concat([0, 1, 2].map((k) => at(22) + k * 0.18), [0, 1, 2].map((k) => at(128) + k * 0.12));
  const reveals = EP09_PLAN.map((s, i) => ((s.cam ?? (s.stage === 'close' ? 'push' : 'reveal')) === 'reveal' && i > 0 ? TIMES[i].start : null)).filter((x): x is number => x !== null);
  return [...pieces.map((a) => ({at: a - 0.05, sfx: 'swoosh', vol: 0.7})), ...reveals.map((a) => ({at: a, sfx: 'swoosh', vol: 0.35}))];
};
/** Sound effects beyond the pops (sfxCues.ts). */
export const EP09_SFX = () => [
  ...EP09_SWOOSH(),
  ...SLOT_AT().map((a) => ({at: a + 0.05, sfx: 'pop', vol: 0.8})),
  {at: at(20), sfx: 'body_thud', vol: 0.6}, // he slides back down the hole
  {at: at(56) + 0.15, sfx: 'stamp', vol: 0.9}, // LATE FEE
  {at: at(58) + 0.15, sfx: 'stamp', vol: 0.9}, // OVERDRAFT FEE
  {at: at(63), sfx: 'pop', vol: 0.6}, // the sole flaps off
  {at: at(116), sfx: 'marker_tick', vol: 0.8}, // the fee crossed out
  {at: at(112), sfx: 'clink', vol: 0.7}, // coins in the jar
  {at: at(136), sfx: 'click', vol: 0.9}, // the first lock pops open
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

export const Ep09Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep09ShotAt(f);
  const s = EP09_PLAN[i];
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
    <StageSizeContext.Provider value={{w: EP09_W, h: EP09_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={framing} bg={SHADES.cream[2]} blurBg={<Backdrop id="ep09-cream" shade="cream" />} overlay={overlay}>
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

export const EboEp09: React.FC = () => (
  <>
    <Ep09Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep09/voice.mp3')} />
    {/* sound effects (src/series/sfxCues.ts, mixed by scripts/sfx/mix.py) */}
    <Html5Audio src={staticFile('ebo-ep09/sfx.mp3')} />
  </>
);
