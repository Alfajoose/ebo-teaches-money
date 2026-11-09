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
import {CheapShoe, CreditCard, DoctorBill, FeeStamp, FlatTire, Ladder, LotteryTicket, Padlock, TenCoin} from '../components/PovertyProps';
import {FunJar, Mark, BillDue, PaySlip} from '../components/WantsInserts';
import {BigPhone} from '../components/StayBrokeProps';
import {Lightbulb} from '../components/Props';
import wordsJson from './data/ep09-words.json';
import envJson from './data/ep09-env.json';

/**
 * EBO TEACHES MONEY — Ep 09 "Why Some People Never Escape Poverty" (vertical, 1080×1920, ~54s).
 * Bold-and-blunt script (rule 20); rule 19 format with a tracker of three padlocks (no buffer · the broke tax ·
 * ? → waiting for a big break); the Peanut animation (rule 21): a picture on every key word, swoops with a
 * swoosh, camera swoops in the video only, every take moves. The joke is never on poor people: it names the traps.
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
  {color: '#45B69C', icon: LOCK(<rect x={-10} y={-12} width={20} height={24} rx={4} fill="none" stroke="#45B69C" strokeWidth={4} />)}, // no buffer: an empty jar
  {color: '#E5484D', icon: LOCK(<text y={9} textAnchor="middle" fontFamily="EboMarker" fontSize={22} fill="#E5484D">FEE</text>)}, // the broke tax
  {color: '#F2C230', icon: LOCK(<text y={10} textAnchor="middle" fontFamily="EboMarker" fontSize={26} fill="#B88A10">7</text>)}, // ? → waiting for a big break: a lucky 7
];
const SLOT_AT = () => [at(17), at(45), at(79)];
const TRACK_FROM = () => at(9);
const badgeIn = (t: number, k: number, from: 'left' | 'right' | 'top' = 'right') => (
  <g>
    <Glow x={badgeX(k, 3)} y={120} r={140} />
    <Glow x={540} y={760} r={380} />
    <In t={t} at={SLOT_AT()[k]} x={540} y={760} k={3.2} from={from}><BigBadge b={BADGES[k]} /></In>
  </g>
);
const ebo = (p: Partial<Pose>): Actor => ({x: 540, pose: p});

export const EP09_PLAN: Shot[] = [
  // ── The hook ──
  {at: 0, line: 'Poverty isn\'t just low income.', stage: 'react', ebo: ebo({eyes: 'half', mouth: 'flat', lookY: -14}),
    board: (t) => (
      <g>
        <In t={t} at={at(3)} x={540} y={720} k={1.7} from="left"><PaySlip /></In>
        <In t={t} at={at(4)} x={0} y={0}><Label x={540} y={1020} text="not just this" red rot={-3} /></In>
      </g>
    ), action: 'A payslip swoops in above him on "low income"… "not just this".'},
  {at: 5, line: 'It\'s a trap.', stage: 'story', cam: 'push',
    board: (t) => (
      <g>
        <Glow x={540} y={860} r={380} />
        <In t={t} at={at(7)} x={540} y={900} k={2.4} from="top"><Padlock /></In>
        <In t={t} at={at(7) + 0.2} x={0} y={0}><Label x={540} y={520} text="a trap" red size={120} /></In>
      </g>
    ), action: 'A big padlock slams down: "a trap".'},
  {at: 8, line: 'With three locks.', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        {[0, 1, 2].map((k) => <In key={k} t={t} at={at(9) + k * 0.18} x={230 + k * 310} y={900} k={1.3} from={(['left', 'top', 'right'] as const)[k]}><Padlock rotate={(k - 1) * 6} /></In>)}
      </g>
    ), action: 'Three padlocks land in a row, one after another; the tracker appears: three grey "?".'},
  {at: 11, line: 'And the last one is invisible.', stage: 'close', ebo: ebo({eyes: 'suspicious', mouth: 'flat', lookX: 10, lookY: -12, headTilt: 6}),
    board: () => <Glow x={badgeX(2, 3)} y={120} r={160} />, action: 'Close: Ebo leans in. The last "?" glows.'},
  // ── No buffer ──
  {at: 17, line: 'First. No buffer.', stage: 'react', ebo: ebo({eyes: 'wide', mouth: 'o', lookY: -18}), header: ['No', 'buffer'], dim: 17,
    board: (t) => (
      <g>
        {badgeIn(t, 0, 'right')}
        <In t={t} at={at(19)} x={820} y={1040} k={0.9} from="right"><FunJar empty /></In>
      </g>
    ), action: 'The first lock lights up (green, an empty jar) and drops in big; an empty jar swoops in beside it.'},
  {at: 20, line: 'One flat tire.', stage: 'story', header: ['No', 'buffer'],
    board: (t) => <In t={t} at={at(21)} x={540} y={880} k={2.2} from="left"><FlatTire /></In>, action: 'A flat tire rolls in from the left and slumps.'},
  {at: 23, line: 'One doctor\'s bill.', stage: 'story', header: ['No', 'buffer'],
    board: (t) => <In t={t} at={at(24)} x={540} y={880} k={2.2} rot={4} from="right"><DoctorBill /></In>, action: 'A doctor\'s bill swoops in: $200.'},
  {at: 26, line: 'No savings, so it goes on a card.', stage: 'scene', cam: 'reveal',
    ebo: {x: 640, pose: {eyes: 'sad', mouth: 'flat'}, acts: [[33, {armR: [110, -10], hold: <CreditCard rotate={-10} />, eyes: 'half'}]]},
    board: (t) => (
      <g>
        <In t={t} at={at(27)} x={260} y={1000} k={1} from="left"><FunJar empty /></In>
        <In t={t} at={at(27) + 0.15} x={260} y={700} k={1.1} twist={0}><Mark kind="cross" /></In>
      </g>
    ), action: 'Ebo, the empty jar crossed out beside him… on "card" he pulls out a credit card.'},
  {at: 34, line: 'Now a two-hundred-dollar problem costs three hundred.', stage: 'story',
    board: (t) => (
      <g>
        <In t={t} at={at(36)} x={540} y={820} k={2.2} from="top"><CreditCard amount={t >= at(39) ? '$300' : '$200'} /></In>
        <In t={t} at={at(39)} x={0} y={0}><Label x={540} y={1180} text="+ interest" red size={100} rot={-3} /></In>
      </g>
    ), action: 'The card: $200… on "three hundred" it ticks up to $300. "+ interest".'},
  {at: 41, line: 'Being broke is expensive.', stage: 'close', ebo: ebo({eyes: 'tired', mouth: 'flat'}), touch: 'facepalm',
    board: (t) => <In t={t} at={at(44)} x={0} y={0} from="right"><Label x={540} y={430} text="expensive" red size={110} rot={-3} /></In>,
    action: 'Close: Ebo facepalms. "expensive".'},
  // ── The broke tax ──
  {at: 45, line: 'Next. The broke tax.', stage: 'react', ebo: ebo({eyes: 'squint', mouth: 'flat', lookY: -18}), header: ['The broke', 'tax'], dim: 45,
    board: (t) => badgeIn(t, 1, 'left'), action: 'The second lock lights up (red, FEE) and drops in big.'},
  {at: 49, line: 'Overdraft fees. Late fees.', stage: 'story', header: ['The broke', 'tax'],
    board: (t) => (
      <g>
        <In t={t} at={at(49)} x={540} y={720} k={1.3} rot={-8} from="left"><FeeStamp text="OVERDRAFT FEE" /></In>
        <In t={t} at={at(51)} x={540} y={1020} k={1.3} rot={6} from="right"><FeeStamp text="LATE FEE" /></In>
      </g>
    ), action: 'OVERDRAFT FEE stamps down… LATE FEE stamps down under it.'},
  {at: 53, line: 'Cheap shoes that last three months,', stage: 'scene', cam: 'push',
    ebo: {x: 540, pose: {eyes: 'sad', mouth: 'flat', lookY: 18}},
    board: (t) => (
      <g>
        <In t={t} at={at(54)} x={540} y={700} k={1.6} from="top"><CheapShoe /></In>
        <In t={t} at={at(58)} x={0} y={0}><Label x={540} y={480} text="3 months" red size={90} rot={-3} /></In>
      </g>
    ), action: 'Ebo looks down: a cheap shoe drops in, its sole flapping. "3 months".'},
  {at: 59, line: 'so you buy them four times a year.', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        {[0, 1, 2, 3].map((k) => <In key={k} t={t} at={at(63) + k * 0.15} x={190 + k * 235} y={900} k={0.85} rot={k % 2 ? 8 : -8} from={k % 2 ? 'right' : 'left'}><CheapShoe /></In>)}
        <In t={t} at={at(66)} x={0} y={0}><Label x={540} y={1140} text="x4 a year" red size={100} /></In>
      </g>
    ), action: 'Four cheap shoes slap down in a row. "x4 a year".'},
  {at: 67, line: 'The less you have, the more everything costs.', stage: 'react', ebo: ebo({eyes: 'open', mouth: 'flat', lookY: -14}),
    board: (t) => (
      <g>
        <In t={t} at={at(68)} x={0} y={0} from="left"><Label x={300} y={700} text="less $" size={100} /></In>
        <In t={t} at={at(72)} x={0} y={0} from="right"><Label x={780} y={700} text="more cost" red size={100} /></In>
        <In t={t} at={at(72)} x={540} y={700} k={1} twist={0}><path d="M -50 0 L 40 0 M 20 -24 L 44 0 L 20 24" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /></In>
      </g>
    ), action: '"less $" → "more cost".'},
  // ── The invisible lock ──
  {at: 75, line: 'And the invisible lock?', stage: 'close', ebo: ebo({eyes: 'squint', mouth: 'flat', headTilt: -4}),
    board: () => <Glow x={badgeX(2, 3)} y={120} r={160} />, action: 'Close: Ebo squints. The last "?" glows.'},
  {at: 79, line: 'Waiting for one big break.', stage: 'react', ebo: ebo({eyes: 'happy', mouth: 'smile', lookY: -18}), header: ['Waiting for a', 'big break'], dim: 79,
    board: (t) => badgeIn(t, 2, 'top'), action: 'THE PAYOFF: the "?" turns gold (a lucky 7) and drops in big. Ebo looks up, hopeful.'},
  {at: 84, line: 'The lottery ticket.', stage: 'story', header: ['Waiting for a', 'big break'],
    board: (t) => (
      <g>
        <Glow x={540} y={880} r={380} />
        <In t={t} at={at(85)} x={540} y={880} k={2.2} rot={-4} from="right"><LotteryTicket /></In>
      </g>
    ), action: 'A lottery ticket, glowing.'},
  {at: 87, line: 'The viral idea.', stage: 'story', header: ['Waiting for a', 'big break'],
    board: (t) => (
      <g>
        <In t={t} at={at(88)} x={540} y={800} k={1} from="left"><Lightbulb x={0} y={0} scale={2.2} t={0} /></In>
        <In t={t} at={at(89)} x={0} y={0}><Label x={540} y={1180} text="1M views?" red size={100} /></In>
      </g>
    ), action: 'A lightbulb: the viral idea. "1M views?"'},
  {at: 90, line: 'The perfect job.', stage: 'story', header: ['Waiting for a', 'big break'],
    board: (t) => <In t={t} at={at(91)} x={540} y={880} k={2.2} from="right"><BigPhone screen="job" /></In>, action: 'A job ad, APPLY.'},
  {at: 93, line: 'Big breaks are rare.', stage: 'story', cam: 'push',
    board: (t) => <In t={t} at={at(93)} x={540} y={880} k={2.2} rot={-4}><LotteryTicket lost={t >= at(96)} /></In>, action: 'The lottery ticket again… on "rare": NOT A WINNER.'},
  {at: 97, line: 'Small wins are daily.', stage: 'story', cam: 'reveal',
    board: (t) => (
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <In key={k} t={t} at={at(98) + k * 0.1} x={150 + (k % 4) * 260} y={760 + Math.floor(k / 4) * 260} k={0.9} from="top"><TenCoin /></In>)}
        <In t={t} at={at(100)} x={0} y={0}><Label x={540} y={1300} text="every day" red size={100} /></In>
      </g>
    ), action: 'Small coins rain in, one a day, filling the frame. "every day".'},
  // ── Break it small ──
  {at: 101, line: 'So break it small.', stage: 'react', ebo: ebo({eyes: 'happy', mouth: 'smile', lookY: -16}), header: ['Break it', 'small'],
    board: (t) => (
      <g>
        <Glow x={540} y={760} r={360} />
        <In t={t} at={at(101)} x={540} y={760} k={2} from="top"><Padlock open={t >= at(104)} /></In>
      </g>
    ), action: 'A padlock… on "small" it pops open.'},
  {at: 105, line: 'Save ten dollars a week.', stage: 'story', header: ['Save', '$10 a week'],
    board: (t) => (
      <g>
        <g transform="translate(540 980) scale(2)"><FunJar empty={t < at(107) + 0.35} /></g>
        {t < at(107) + 0.35 && <In t={t} at={at(106)} x={540} y={t >= at(107) ? 700 + (t - at(107)) * 900 : 700} k={1} from="top"><TenCoin /></In>}
      </g>
    ), action: 'A $10 coin drops into the jar; the jar fills.'},
  {at: 110, line: 'A buffer, not a fortune.', stage: 'story', header: ['A', 'buffer'],
    board: (t) => (
      <g>
        <g transform="translate(540 940) scale(1.6)"><FunJar /></g>
        <In t={t} at={at(112)} x={0} y={0} from="right"><Label x={540} y={1330} text="not a fortune" red size={90} /></In>
      </g>
    ), action: 'The jar, with a little in it… "not a fortune".'},
  {at: 115, line: 'Pay the bill before the fee.', stage: 'story', header: ['Pay before the', 'fee'],
    board: (t) => (
      <g>
        <In t={t} at={at(117)} x={330} y={860} k={1.3} from="left"><BillDue /></In>
        <In t={t} at={at(118)} x={330} y={620} k={1.2} twist={0} from="drop"><Mark kind="tick" /></In>
        <In t={t} at={at(120)} x={780} y={900} k={0.8} rot={8} from="right"><FeeStamp text="LATE FEE" /></In>
        <In t={t} at={at(120) + 0.15} x={780} y={900} k={1.2} twist={0}><Mark kind="cross" /></In>
      </g>
    ), action: 'The bill gets a tick… the LATE FEE gets a cross.'},
  {at: 121, line: 'Buy once. Buy right.', stage: 'story', header: ['Buy once.', 'Buy right.'],
    board: (t) => (
      <g>
        <In t={t} at={at(122)} x={540} y={900} k={2} from="top"><CheapShoe worn={false} /></In>
        <In t={t} at={at(124)} x={820} y={640} k={1.2} twist={0} from="drop"><Mark kind="tick" /></In>
      </g>
    ), action: 'One good shoe, sole intact. A tick.'},
  // ── The close ──
  {at: 125, line: 'Nobody escapes in one jump.', stage: 'scene', cam: 'reveal',
    ebo: {x: 540, pose: {eyes: 'wide', mouth: 'o'}, acts: [[128, {lift: -60, armL: [140, -10], armR: [140, -10], eyes: 'squeeze', mouth: 'grimace'}], [129, {lift: 0, eyes: 'tired', mouth: 'flat', armL: [12, 6], armR: [12, 6]}]]},
    board: (t) => <In t={t} at={at(129)} x={0} y={0} from="top"><Label x={540} y={520} text="one jump? no." red size={100} rot={-3} /></In>,
    action: 'Ebo jumps… and lands right where he was. "one jump? no."'},
  {at: 130, line: 'You climb out. One step at a time.', stage: 'scene', cam: 'push',
    ebo: {x: 380, pose: {eyes: 'happy', mouth: 'smile'}, acts: [[131, {armR: [120, -10]}], [134, {armR: [130, -10], lift: -20, eyes: 'happy', mouth: 'grin'}]]},
    board: (t) => (
      <g>
        <In t={t} at={at(130)} x={760} y={1500} k={1.4} from="right"><Ladder rungs={[131, 133, 134, 137].filter((k) => t >= at(k)).length} /></In>
        {[0, 1, 2].map((k) => <In key={k} t={t} at={at(135) + k * 0.12} x={300 + k * 240} y={560} k={0.75} rot={(k - 1) * 8}><Padlock open /></In>)}
      </g>
    ), action: 'A ladder: a rung lights on each word… Ebo reaches up, grinning; the three padlocks pop open.'},
];

export const EP09_SECTIONS: string[] = EP09_PLAN.map((s) => (s.at < 17 ? 'The Hook' : s.at < 45 ? 'No Buffer' : s.at < 75 ? 'The Broke Tax' : s.at < 101 ? 'The Invisible Lock' : s.at < 125 ? 'Break It Small' : 'The Close'));

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
export const EP09_SLAMS: number[] = [4, 7, 39, 58, 66, 72, 93, 96, 100].map(at).concat([at(27) + 0.15, at(120) + 0.15]);
/** Swooshes (rule 21). */
export const EP09_SWOOSH = () => {
  const pieces = [3, 9, 19, 21, 24, 36, 44, 49, 51, 54, 68, 85, 88, 91, 101, 106, 111, 112, 117, 120, 122, 129, 130].map(at)
    .concat([0, 1, 2].map((k) => at(9) + k * 0.18), [0, 1, 2, 3].map((k) => at(63) + k * 0.15), [0, 1, 2, 3, 4, 5, 6].map((k) => at(98) + k * 0.1));
  const reveals = EP09_PLAN.map((s, i) => ((s.cam ?? (s.stage === 'close' ? 'push' : 'reveal')) === 'reveal' && i > 0 ? TIMES[i].start : null)).filter((x): x is number => x !== null);
  return [...pieces.map((a) => ({at: a - 0.05, sfx: 'swoosh', vol: 0.7})), ...reveals.map((a) => ({at: a, sfx: 'swoosh', vol: 0.35}))];
};
/** Sound effects beyond the pops (sfxCues.ts). */
export const EP09_SFX = () => [
  ...EP09_SWOOSH(),
  ...SLOT_AT().map((a) => ({at: a + 0.05, sfx: 'pop', vol: 0.8})),
  {at: at(7) + 0.1, sfx: 'stamp', vol: 0.9}, // the padlock slams
  {at: at(49) + 0.15, sfx: 'stamp', vol: 0.9}, // OVERDRAFT FEE
  {at: at(51) + 0.15, sfx: 'stamp', vol: 0.9}, // LATE FEE
  {at: at(96), sfx: 'stamp', vol: 0.8}, // NOT A WINNER
  {at: at(104), sfx: 'click', vol: 0.9}, // the lock pops open
  ...[0, 1, 2].map((k) => ({at: at(135) + k * 0.12 + 0.17, sfx: 'click', vol: 0.7})), // the three locks pop open
  {at: at(107) + 0.3, sfx: 'clink', vol: 0.8}, // the coin in the jar
  {at: at(118), sfx: 'marker_tick', vol: 0.8},
  {at: at(124), sfx: 'marker_tick', vol: 0.8},
  {at: at(128), sfx: 'whoosh', vol: 0.6}, // the jump
  {at: at(129), sfx: 'body_thud', vol: 0.7}, // …lands
  ...[131, 133, 134, 137].map((k) => ({at: at(k), sfx: 'pop', vol: 0.5})), // the rungs
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
