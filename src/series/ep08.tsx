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
import {CarKeys, ChatPhone, Crown, DinnerTable, Doormat, Heart, MovingBox, Receipt, SaleClock, Speech} from '../components/NiceGuyProps';
import {Mark} from '../components/WantsInserts';
import {BigPhone} from '../components/StayBrokeProps';
import wordsJson from './data/ep08-words.json';
import envJson from './data/ep08-env.json';

/**
 * EBO TEACHES MONEY — Ep 08 "Why Nice Guys Get Taken Advantage Of" (vertical, 1080×1920, ~63s).
 * House rule 19 (the 3rd-Filter format): a tracker of three badges (an open door: you never say no · a
 * lit-up phone: you're always available · "?" until the payoff: liked isn't respected, a crown); a new
 * picture every 1–2 s; Ebo big along the bottom reacting, close-ups for the punches; tiny stories with
 * Christy (Ama Pretty) and Ama. v2: the bold-and-blunt script (house rule 20), straight in on the claim;
 * the last line loops back to the first.
 */
export const EP08_W = 1080;
export const EP08_H = 1920;
type W8 = Word & {who: 'ebo'};
const WORDS = wordsJson as W8[];
const END = WORDS[WORDS.length - 1].e + 0.5;
export const EP08_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;

type Stage = 'react' | 'close' | 'story' | 'insert' | 'mid';
const WHOLE: Framing = {zoom: 1, cx: 540, cy: 960};
const FRAMES: Record<Stage, Framing> = {react: WHOLE, close: {zoom: 1.8, cx: 540, cy: 980}, story: WHOLE, insert: WHOLE, mid: {zoom: 1.35, cx: 540, cy: 1040}};
const EBO_AT: Record<Stage, {x: number; y: number; scale: number} | null> = {
  react: {x: 540, y: 2440, scale: 2.7},
  close: {x: 540, y: 1500, scale: 1.75},
  story: null,
  insert: {x: 860, y: 2350, scale: 2.4},
  mid: {x: 540, y: 1500, scale: 1.75},
};
const FLOOR = 1520;

// ───────────────────────── the tracker ─────────────────────────
const BADGES: Badge[] = [
  {
    color: '#45B69C',
    icon: (
      // an open door: you say yes to everything
      <g>
        <rect x={-26} y={-34} width={52} height={68} fill="none" stroke="#fff" strokeWidth={6} />
        <path d="M -26 -34 L 6 -24 L 6 42 L -26 34 Z" fill="#fff" />
      </g>
    ),
  },
  {
    color: '#F5A33A',
    icon: (
      // a phone lighting up: always available
      <g>
        <rect x={-18} y={-30} width={36} height={60} rx={7} fill="#fff" />
        <path d="M -34 -20 Q -42 0 -34 20 M 34 -20 Q 42 0 34 20" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      </g>
    ),
  },
  {
    color: '#8F6BD1',
    icon: (
      // a crown: liked isn't respected
      <path d="M -30 18 L -34 -14 L -16 0 L 0 -24 L 16 0 L 34 -14 L 30 18 Z" fill="#fff" />
    ),
  },
];
const SLOT_AT = () => [at(34), at(65), at(98)];
const TRACK_FROM = () => at(28);

// ───────────────────────── the shots ─────────────────────────
/** A side character in a story shot. Rule 21: they act the whole time: they walk in (`enter`: from x, at a time),
 * change pose on the words (`acts`: [word, pose]), and can walk off (`exit`: to x, at a word). */
type Side = {who: 'ama' | 'pretty'; x: number; pose: Partial<Pose>; hold?: React.ReactNode; facing?: 1 | -1;
  enter?: {from: number; dur?: number}; exit?: {to: number; at: number; dur?: number}; acts?: [number, Partial<Pose>][]};
type Shot = {
  at: number;
  line: string;
  stage: Stage;
  pose?: Partial<Pose>;
  touch?: keyof typeof CONTACT;
  board?: (t: number) => React.ReactNode;
  side?: Side[];
  under?: (t: number) => React.ReactNode;
  /** props in his world, drawn in front of him (the table, things he throws) */
  front?: (t: number) => React.ReactNode;
  /** what he holds in his left hand */
  holdL?: (t: number) => React.ReactNode;
  arms?: (t: number) => Partial<Pose> | null;
  header?: [string, string?];
  /** the camera swoop (video only): a quick zoom-out reveal, or a slow push-in; default reveal for wide shots, push for close */
  cam?: 'reveal' | 'push' | 'none';
  /** dim the scene from this time (word index) while a title or badge is up */
  dim?: number;
  action: string;
};
const stand = (x: Partial<Pose>): Partial<Pose> => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const bigBadge = (t: number, k: number, a: number, from?: 'left' | 'right' | 'top') => (
  <g>
    <Glow x={badgeX(k, 3)} y={120} r={140} />
    <Glow x={540} y={760} r={380} />
    <In t={t} at={a} x={540} y={760} k={3.2} from={from}><BigBadge b={BADGES[k]} /></In>
  </g>
);
const keysToss = () => at(50);

export const EP08_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: 'Being nice isn\'t your problem.', stage: 'react', pose: {eyes: 'half', mouth: 'flat', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(1)} x={540} y={720} k={2.2}><Heart /></In>
        <In t={t} at={at(2)} x={0} y={0}><Label x={540} y={1010} text="not the problem" red rot={-3} /></In>
      </g>
    ), action: 'Straight in: a big pink heart (nice) above him… "not the problem".'},
  {at: 5, line: 'Being available is.', stage: 'insert', pose: {eyes: 'squint', mouth: 'flat', lookX: -18, lookY: -12},
    board: (t) => (
      <g>
        <Glow x={470} y={820} r={420} />
        <g transform="translate(470 820) rotate(-4) scale(2.4)"><ChatPhone /></g>
        <In t={t} at={at(7)} x={0} y={0}><Label x={330} y={1250} text="the problem" red rot={-4} /></In>
      </g>
    ), action: 'Insert: his phone, lit up with a midnight "need a favor", glowing. "the problem".'},
  {at: 8, line: 'Every free yes teaches people your time is worthless.', stage: 'react', pose: {eyes: 'squint', mouth: 'flat', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(10)} x={0} y={0}><Label x={540} y={660} text="YES" size={170} /></In>
        <In t={t} at={at(9)} x={700} y={720} k={1.9} rot={16}>
          <g>
            <path d="M 0 -40 L 170 -40 L 200 0 L 170 40 L 0 40 Z" fill={RED} stroke={INK} strokeWidth={6} />
            <text x={90} y={16} textAnchor="middle" fontFamily="EboMarker" fontSize={46} fill="#fff">FREE</text>
          </g>
        </In>
        <In t={t} at={at(14)} x={300} y={940} k={0.7}><SaleClock /></In>
      </g>
    ), action: 'A big YES with a red FREE tag… then his time: a clock marked down to $0.99.'},
  {at: 17, line: 'And nobody respects worthless things.', stage: 'story',
    board: (t) => (
      <g>
        <In t={t} at={at(18)} x={540} y={880} k={1.8}><Doormat /></In>
        <In t={t} at={at(20)} x={0} y={0}><Label x={540} y={560} text="worthless" red size={110} /></In>
      </g>
    ), action: 'A WELCOME doormat covered in footprints. "worthless".'},
  {at: 22, line: 'Here\'s how nice guys get used. Three ways.', stage: 'react', pose: {eyes: 'open', mouth: 'smirk', lookY: -18}, touch: 'thinkChin',
    action: 'Ebo, hand on chin; on "Three ways" the tracker appears: three grey "?" badges.'},
  {at: 30, line: 'The last one stings.', stage: 'close', pose: {eyes: 'suspicious', mouth: 'flat', lookX: 10, lookY: -12, headTilt: 6},
    board: () => <Glow x={badgeX(2, 3)} y={120} r={150} />, action: 'Close: Ebo leans in. The last "?" badge glows.'},
  // ── 2. You never say no ──
  {at: 34, line: 'First. You never say no.', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['You never say', 'no'], dim: 34, cam: 'push',
    board: (t) => bigBadge(t, 0, at(34), 'right'), action: 'The first badge lights up (green, an open door) and drops in big.'},
  {at: 39, line: 'Cover the bill? Yes.', stage: 'story', header: ['You never say', 'no'],
    side: [{who: 'pretty', x: 360, pose: stand({armR: [80, -20], eyes: 'happy', mouth: 'grin'}), hold: <Receipt len={260} rotate={-20} />, enter: {from: -250},
      acts: [[40, {tilt: 6, headTilt: 8, eyes: 'happy', mouth: 'grin'}], [41, {tilt: -2, headTilt: -6, mouth: 'smile'}], [42, {armL: [150, -10], lift: -24, eyes: 'happy', mouth: 'laugh', headTilt: 10}]]}],
    cam: 'push',
    board: (t) => <In t={t} at={at(42)} x={0} y={0} from="right"><Label x={800} y={900} text="Yes." red size={110} /></In>,
    action: 'Story: Christy, all smiles, holds out the bill. "Yes."'},
  {at: 43, line: 'Help them move? Yes.', stage: 'story', header: ['You never say', 'no'],
    side: [{who: 'ama', x: 330, pose: stand({armR: [70, -30], eyes: 'happy', mouth: 'smile'}), enter: {from: -250, dur: 0.35},
      acts: [[44, {armR: [100, -10], eyes: 'open', mouth: 'o', headTilt: -6}], [45, {armR: [100, -10], armL: [40, -30], eyes: 'happy', mouth: 'grin', headTilt: 6}], [46, {armL: [140, -10], armR: [140, -10], lift: -26, eyes: 'happy', mouth: 'laugh'}]]}],
    board: (t) => (
      <g>
        <In t={t} at={at(43)} x={760} y={1330} k={1.3} from="top"><MovingBox /></In>
        <In t={t} at={at(44)} x={760} y={1120} k={1.3} from="top" twist={6}><MovingBox rotate={4} /></In>
        <In t={t} at={at(45)} x={760} y={910} k={1.3} from="top"><MovingBox rotate={-5} /></In>
        <In t={t} at={at(46)} x={0} y={0} from="left"><Label x={540} y={560} text="Yes." red size={110} /></In>
      </g>
    ), action: 'Ama, sweet, next to a growing stack of moving boxes. "Yes."'},
  {at: 47, line: 'Lend the car? Yes.', stage: 'close', pose: {eyes: 'tired', mouth: 'flat'},
    front: (t) => {
      if (t < keysToss()) return null;
      const u = t - keysToss();
      if (u > 0.9) return null;
      return <g transform={`translate(${380 - 520 * u} ${1300 - 1000 * u + 1300 * u * u}) rotate(${-500 * u}) scale(1.4)`}><CarKeys /></g>;
    },
    arms: (t) => (t >= keysToss() ? {armL: [110, -10]} : null),
    action: 'Close, resigned: "Yes." His car keys are already flying out of his hand.'},
  {at: 51, line: 'A yes that costs nothing is worth nothing.', stage: 'react', pose: {eyes: 'squint', mouth: 'flat', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(52)} x={0} y={0} from="left"><Label x={540} y={660} text="YES" size={170} /></In>
        <In t={t} at={at(55)} x={700} y={720} k={1.9} rot={16} from="right">
          <g>
            <path d="M 0 -40 L 170 -40 L 200 0 L 170 40 L 0 40 Z" fill={RED} stroke={INK} strokeWidth={6} />
            <text x={90} y={16} textAnchor="middle" fontFamily="EboMarker" fontSize={46} fill="#fff">$0</text>
          </g>
        </In>
        <In t={t} at={at(58)} x={0} y={0} from="top"><Label x={540} y={1010} text="worth nothing" red rot={-3} /></In>
      </g>
    ), action: 'YES again, tagged $0… "worth nothing".'},
  {at: 59, line: 'People stop asking. They start expecting.', stage: 'story',
    side: [
      {who: 'pretty', x: 250, pose: stand({armR: [80, -20], eyes: 'half', mouth: 'smirk', lookX: 14}), hold: <Receipt len={220} rotate={-20} />, enter: {from: -300},
        acts: [[61, {tilt: 8, headTilt: 10, eyes: 'half'}], [64, {armR: [100, -10], tilt: 10, eyes: 'squint', mouth: 'grin'}]]},
      {who: 'ama', x: 840, pose: stand({armR: [80, -20], eyes: 'half', mouth: 'smirk', lookX: -14}), facing: -1, hold: <CarKeys />, enter: {from: 1380},
        acts: [[62, {tilt: 8, headTilt: -8}], [64, {armR: [100, -10], tilt: 10, eyes: 'squint', mouth: 'grin'}]]},
    ],
    board: (t) => <In t={t} at={at(64)} x={0} y={0} from="top"><Label x={540} y={520} text="expecting" red size={100} /></In>,
    action: 'Christy and Ama, both holding out what they want, not even asking. "expecting".'},
  // ── 3. Always available ──
  {at: 65, line: 'Next. You answer instantly.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -18}, header: ['You answer', 'instantly'], dim: 65,
    board: (t) => bigBadge(t, 1, at(65), 'left'), action: 'The second badge lights up (orange, a phone lighting up) and drops in big.'},
  {at: 69, line: 'Every call. Every text. Even at midnight.', stage: 'story', header: ['You answer', 'instantly'],
    board: (t) => (
      <g>
        <In t={t} at={at(71)} x={540} y={880} k={1.8}><ChatPhone /></In>
        <In t={t} at={at(75)} x={0} y={0}><Label x={540} y={1380} text="12:00 AM" red /></In>
      </g>
    ), action: 'Her text, big: "u up? need a favor". 12:00 AM.'},
  {at: 76, line: 'Instant replies say one thing:', stage: 'insert', pose: {eyes: 'wide', mouth: 'grin', lookX: -18, lookY: -12},
    board: (t) => (
      <g>
        <g transform="translate(470 820) rotate(-4) scale(2.4)"><ChatPhone reply={t >= at(77) ? 'On my way!' : undefined} read={t >= at(78) ? '12:00:02' : undefined} /></g>
        <In t={t} at={at(78)} x={0} y={0}><Label x={380} y={1330} text="2 seconds" red rot={-4} /></In>
      </g>
    ), action: 'Insert: his reply pops in instantly: "On my way!" Ebo, eager, in the corner.'},
  {at: 81, line: '"I have nothing better to do."', stage: 'story',
    board: (t) => (
      <g>
        <In t={t} at={at(81)} x={0} y={0}><Label x={540} y={680} text='"I have nothing' size={96} rot={-3} /></In>
        <In t={t} at={at(84)} x={0} y={0}><Label x={540} y={800} text='better to do."' red size={96} rot={-3} /></In>
        <In t={t} at={at(83)} x={540} y={1120} k={1}><SaleClock /></In>
      </g>
    ), action: 'The message, handwritten big… and his time, on sale.'},
  {at: 87, line: 'And people will make sure you don\'t.', stage: 'story',
    side: [
      {who: 'pretty', x: 300, pose: stand({armR: [60, -30], eyes: 'half', mouth: 'smirk', lookY: 10}), hold: <BigPhone screen="scroll" />},
      {who: 'ama', x: 780, pose: stand({armR: [60, -30], eyes: 'half', mouth: 'smirk', lookY: 10}), facing: -1, hold: <BigPhone screen="scroll" />},
    ],
    board: (t) => <In t={t} at={at(90)} x={0} y={0}><Label x={540} y={520} text="more favors" red size={100} /></In>,
    action: 'Christy and Ama, both already typing the next favor. "more favors".'},
  // ── 4. Liked isn't respected (the payoff) ──
  {at: 94, line: 'And the real problem?', stage: 'close', pose: {eyes: 'squint', mouth: 'flat', headTilt: -4},
    board: () => <Glow x={badgeX(2, 3)} y={120} r={160} />, action: 'Close, serious. The last "?" glows… a beat.'},
  {at: 98, line: 'You\'re chasing liked. Not respected.', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['Liked isn\'t', 'respected'], dim: 98,
    board: (t) => (
      <g>
        {bigBadge(t, 2, at(98), 'top')}
        <In t={t} at={at(100)} x={300} y={1060} k={1}><Heart /></In>
        <In t={t} at={at(101)} x={0} y={0}><Label x={540} y={1090} text="≠" size={140} /></In>
        <In t={t} at={at(102)} x={780} y={1080} k={0.85}><Crown /></In>
      </g>
    ), action: 'THE PAYOFF: the "?" turns purple, a crown, and drops in big; under it a heart ≠ a crown.'},
  {at: 103, line: 'Liked people get asked for favors.', stage: 'story', header: ['Liked:', 'favors'],
    side: [{who: 'pretty', x: 380, pose: stand({armR: [80, -20], eyes: 'happy', mouth: 'grin', headTilt: 10}), hold: <MovingBox rotate={-6} />}],
    under: () => <Glow x={380} y={1100} r={320} />,
    board: (t) => (
      <g>
        <In t={t} at={at(104)} x={790} y={760} k={0.7}><Heart /></In>
        <In t={t} at={at(108)} x={0} y={0}><Label x={760} y={1000} text="favors" red size={96} /></In>
      </g>
    ), action: 'Christy, all hearts, holding out a box for him to carry. "favors".'},
  {at: 109, line: 'Respected people get asked for their time. Politely. In advance.', stage: 'story', header: ['Respected:', 'asked first'],
    side: [{who: 'pretty', x: 380, pose: stand({armR: [60, -30], eyes: 'open', mouth: 'flat', lookY: 10}), hold: <BigPhone screen="gallery" />}],
    board: (t) => (
      <g>
        <In t={t} at={at(109)} x={790} y={700} k={0.9}><Crown /></In>
        <In t={t} at={at(117)} x={0} y={0}><Label x={760} y={1000} text="in advance" red size={90} /></In>
      </g>
    ), action: 'Christy checking his calendar before she asks: a crown over her. "in advance".'},
  // ── 5. The rule ──
  {at: 119, line: 'So here\'s the rule.', stage: 'close', pose: {eyes: 'half', mouth: 'flat'}, touch: 'armsCrossed', action: 'Close, firm, arms crossed.'},
  {at: 123, line: 'Kindness is a gift. Not a service.', stage: 'react', pose: {eyes: 'happy', mouth: 'smile', lookY: -16}, header: ['Kindness is a', 'gift'],
    board: (t) => (
      <g>
        <Glow x={540} y={760} r={340} />
        <In t={t} at={at(123)} x={540} y={760} k={2}><Heart /></In>
        <In t={t} at={at(126)} x={0} y={0}><Label x={540} y={1010} text="a gift" rot={-3} /></In>
        <In t={t} at={at(129)} x={0} y={0}><Label x={540} y={1110} text="not a service" red rot={-3} /></In>
      </g>
    ), action: 'The heart, glowing: "a gift"… "not a service".'},
  {at: 130, line: 'Say no. Don\'t explain.', stage: 'story', header: ['Say', 'no'],
    board: (t) => (
      <g>
        <In t={t} at={at(131)} x={540} y={760} k={1.6}><Speech short /></In>
        <In t={t} at={at(132)} x={760} y={1160} k={0.7}><Speech /></In>
      </g>
    ), action: 'A clean "No." … and the long speech of excuses, crossed out.'},
  {at: 134, line: 'Reply when it suits you.', stage: 'story', header: ['Reply when it', 'suits you'],
    board: (t) => <In t={t} at={at(134)} x={540} y={880} k={1.8}><ChatPhone time="9:00 AM" reply="Can't, sorry." read="Read 9:00 AM" /></In>,
    action: 'The same chat, answered the next morning, calmly: 9:00 AM.'},
  {at: 139, line: 'Let people pay their own way.', stage: 'story', header: ['Pay their', 'own way'],
    side: [{who: 'pretty', x: 420, pose: stand({armR: [60, -30], eyes: 'half', mouth: 'flat', lookY: 10}), hold: <Receipt len={260} rotate={-10} />}],
    board: (t) => <In t={t} at={at(144)} x={790} y={760} k={1.4} twist={0} from="drop"><Mark kind="tick" /></In>,
    action: 'Christy holding her own receipt, reading it. A tick.'},
  // ── 6. The close ──
  {at: 145, line: 'Be kind.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -16},
    board: (t) => (
      <g>
        <Glow x={540} y={760} r={460} />
        {[0, 1, 2].map((k) => (
          <In key={k} t={t} at={at(145) + k * 0.12} x={540 + (k - 1) * 260} y={760} k={1.9}><BigBadge b={BADGES[k]} /></In>
        ))}
      </g>
    ), action: 'All three badges land together in the middle. Ebo, sincere.'},
  {at: 147, line: 'Never convenient.', stage: 'close', pose: {eyes: 'squint', mouth: 'smirk', headTilt: 5}, touch: 'armsCrossed',
    action: 'Close, arms crossed: the line. LOOP: hard cut back to "Being nice isn\'t your problem."'},
];

export const EP08_SECTIONS: string[] = EP08_PLAN.map((s) => (s.at < 34 ? 'The Hook' : s.at < 65 ? 'You Never Say No' : s.at < 94 ? 'You Answer Instantly' : s.at < 119 ? 'Liked Isnt Respected' : s.at < 145 ? 'The Rule' : 'The Close'));
/** A pop for each new picture that lands, and each badge. */
export const EP08_SLAMS: number[] = [1, 2, 7, 9, 10, 14, 18, 20, 42, 43, 44, 45, 46, 52, 55, 58, 64, 71, 75, 78, 81, 83, 84, 90, 100, 101, 102, 104, 108, 109, 117, 123, 126, 129, 131, 132, 134, 145].map(at);
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
/** Swooshes (rule 21): a loud one for each piece that swoops in from the side or the top, a soft one for each camera reveal. */
export const EP08_SWOOSH = () => {
  const pieces = [...new Set([34, 42, 43, 44, 45, 46, 52, 55, 58, 64, 65, 98].map(at).concat(EP08_SLAMS))];
  const reveals = EP08_PLAN.map((s, i) => ((s.cam ?? (s.stage === 'close' ? 'push' : 'reveal')) === 'reveal' && i > 0 ? TIMES[i].start : null)).filter((x): x is number => x !== null);
  return [...pieces.map((a) => ({at: a - 0.05, sfx: 'swoosh', vol: 0.8})), ...reveals.map((a) => ({at: a, sfx: 'swoosh', vol: 0.4}))];
};
/** Sound effects beyond the pops (sfxCues.ts). */
export const EP08_SFX = () => [
  ...EP08_SWOOSH(),
  ...SLOT_AT().map((a) => ({at: a, sfx: 'pop', vol: 0.9})),
  {at: keysToss(), sfx: 'whoosh', vol: 0.8},
  {at: keysToss() + 0.5, sfx: 'clink', vol: 0.8},
  {at: at(5), sfx: 'phone_buzz', vol: 0.6},
  {at: at(75), sfx: 'phone_buzz', vol: 0.6},
  {at: at(77), sfx: 'click', vol: 0.7},
  {at: at(144), sfx: 'marker_tick', vol: 0.8},
];

// ───────────────────────── performance ─────────────────────────
const ENV = (envJson as Record<string, number[]>).ebo;
const talking = (f: number) => (ENV[f] ?? 0) > 0.1;
/** Never frozen (rule 18). */
const idle = (t: number, l: number, f: number, i: number): Partial<Pose> => {
  const glance = Math.floor(t / 1.7) % 3 === 1 && t % 1.7 < 0.25 && talking(f) ? (Math.floor(t / 1.7) % 2 ? 7 : -7) : 0;
  return {
    tilt: 1.3 * Math.sin((t * 2 * Math.PI) / 3.1),
    lift: 2.5 * Math.sin((t * 2 * Math.PI) / 2.3 + 1),
    ...(glance ? {lookX: glance} : {}),
    ...(i > 0 && l < 0.1 ? {eyes: 'closed' as const} : {}),
  };
};

export const Ep08Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep08ShotAt(f);
  const s = EP08_PLAN[i];
  const local = t - TIMES[i].start;
  const place = EBO_AT[s.stage];

  let pose: Pose = {...POSE.stand, ...s.pose} as Pose;
  const acted = s.arms?.(t);
  if (acted) pose = {...pose, ...acted} as Pose;
  else if (s.touch) {
    const c = CONTACT[s.touch];
    pose = {...pose, armL: c.armL, armR: c.armR, armFront: c.armFront, contact: true, headTilt: s.pose?.headTilt ?? c.headTilt, view: 1};
  } else pose = beatGesture(pose, WORDS, ENV, f, TIMES[i].start, TIMES[i].start + TIMES[i].length);
  const id = idle(t, local, f, i);
  pose = {...pose, tilt: (pose.tilt ?? 0) + (id.tilt ?? 0), lift: (pose.lift ?? 0) + (id.lift ?? 0), ...(id.lookX ? {lookX: id.lookX} : {}), ...(id.eyes ? {eyes: id.eyes} : {})} as Pose;

  // Ebo nods on the words while he talks (rule 21: every take moves)
  const wi = WORDS.findIndex((w) => t >= w.s && t < w.e);
  if (place && wi >= 0 && talking(f)) pose = {...pose, headTilt: (pose.headTilt ?? 0) + (wi % 2 ? 4 : -3)} as Pose;
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
  return (
    <StageSizeContext.Provider value={{w: EP08_W, h: EP08_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={framing} bg={SHADES.cream[2]} blurBg={<Backdrop id="ep08-cream" shade="cream" />} overlay={overlay}>
              {s.under?.(t)}
              {s.side?.map((c, k) => {
                // walk in / walk off (legs swap every 0.12 s while moving), pose-to-pose on the words
                const st = TIMES[i].start;
                let x = c.x;
                let moving = false;
                const enter = c.enter ?? {from: c.x < 540 ? -300 : 1380, dur: 0.35};
                if (enter) {
                  const u = Math.min(1, local / (enter.dur ?? 0.45));
                  x = enter.from + (c.x - enter.from) * (1 - (1 - u) ** 2);
                  moving = u < 1;
                }
                if (c.exit && t >= at(c.exit.at)) {
                  const u = Math.min(1, (t - at(c.exit.at)) / (c.exit.dur ?? 0.5));
                  x = c.x + (c.exit.to - c.x) * u * u;
                  moving = u < 1;
                }
                let p: Partial<Pose> = {...c.pose};
                for (const [w, a] of c.acts ?? []) if (t >= at(w)) p = {...p, ...a};
                // rule 21, every take moves: with no acting of their own they bob and tilt on Ebo's words
                if (!c.acts) {
                  const wi2 = WORDS.findIndex((w) => t >= w.s && t < w.e);
                  if (wi2 >= 0) p = {...p, headTilt: (p.headTilt ?? 0) + (wi2 % 2 ? 6 : -5), tilt: (p.tilt ?? 0) + (wi2 % 3 === 0 ? 3 : 0), lift: (p.lift ?? 0) + (wi2 % 2 ? -4 : 0)};
                }
                if (moving) {
                  const ph = Math.floor((t - st) / 0.12) % 2;
                  p = {...p, legL: ph ? [20, 6] : [-8, 0], legR: ph ? [-8, 0] : [20, 6], lift: -6 * ph};
                }
                return (
                  <RigCharacter key={k} who={c.who} x={x} y={FLOOR} scale={1.7} facing={c.facing ?? 1} t={f + k * 13} pose={gentle({...(POSES.standing as Pose), ...p} as Pose)}>
                    {c.hold}
                  </RigCharacter>
                );
              })}
              {place && (
                <RigCharacter who="ebo" x={place.x} y={place.y} scale={place.scale} t={f} pose={gentle(frontOn(pose))} holdL={s.holdL?.(t)}
                  mouthFrame={talking(f) ? lipFrame(ENV, WORDS, f) : undefined} />
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
