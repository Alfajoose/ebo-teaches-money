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
import {Badge, BigBadge, Glow, Header, In, INK, Label, RED, Tracker, badgeX, useMarkerFont} from './filterKit';
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
 * Christy (Ama Pretty) and Ama. Ebo is the nice guy (self-roast). The receipt opens and closes it, and
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
const SLOT_AT = () => [at(35), at(68), at(98)];
const TRACK_FROM = () => at(21);

// ───────────────────────── the shots ─────────────────────────
type Side = {who: 'ama' | 'pretty'; x: number; pose: Partial<Pose>; hold?: React.ReactNode; facing?: 1 | -1};
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
  action: string;
};
const stand = (x: Partial<Pose>): Partial<Pose> => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});
const bigBadge = (t: number, k: number, a: number) => (
  <g>
    <Glow x={badgeX(k, 3)} y={120} r={140} />
    <Glow x={540} y={760} r={380} />
    <In t={t} at={a} x={540} y={760} k={3.2}><BigBadge b={BADGES[k]} /></In>
  </g>
);
const keysToss = () => at(56);
const slideBack = () => at(151);

export const EP08_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: '…They said they\'d get me next time.', stage: 'mid', pose: {eyes: 'tired', mouth: 'flat', lookY: 14},
    holdL: () => <Receipt len={560} />, arms: () => ({armL: [78, -14], armR: [12, 6]}),
    front: () => <DinnerTable x={720} y={1250} />,
    action: 'Cold open: a restaurant table, empty plates. Everyone\'s gone. Ebo, alone, holds up a receipt that hangs to the floor.'},
  {at: 7, line: 'That was four "next times" ago.', stage: 'close', pose: {eyes: 'half', mouth: 'flat'},
    board: (t) => <In t={t} at={at(9)} x={0} y={0}><Label x={540} y={420} text='4 "next times" ago' red rot={-3} /></In>,
    action: 'Close, deadpan to camera.'},
  {at: 13, line: 'Nice guys don\'t get used because they\'re nice.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(13)} x={540} y={720} k={2.2}><Heart /></In>
        <In t={t} at={at(19)} x={0} y={0}><Label x={540} y={1010} text="not the problem" red rot={-3} /></In>
      </g>
    ), action: 'A big pink heart (nice) above him… "not the problem".'},
  {at: 21, line: 'They get used for three reasons.', stage: 'react', pose: {eyes: 'squint', mouth: 'smirk', lookY: -18}, touch: 'thinkChin',
    action: 'The tracker appears: three grey "?" badges. Ebo looks up at them.'},
  {at: 27, line: 'And the last one… nobody wants to hear.', stage: 'close', pose: {eyes: 'suspicious', mouth: 'flat', lookX: 10, lookY: -12, headTilt: 6},
    board: () => <Glow x={badgeX(2, 3)} y={120} r={150} />, action: 'Close: Ebo leans in. The last "?" badge glows.'},
  // ── 2. You never say no ──
  {at: 35, line: 'First: you never say no.', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['You never say', 'no'],
    board: (t) => bigBadge(t, 0, at(35)), action: 'The first badge lights up (green, an open door) and drops in big.'},
  {at: 40, line: '"Can you cover me?" Yes.', stage: 'story', header: ['You never say', 'no'],
    side: [{who: 'pretty', x: 360, pose: stand({armR: [80, -20], eyes: 'happy', mouth: 'grin'}), hold: <Receipt len={260} rotate={-20} />}],
    board: (t) => <In t={t} at={at(44)} x={0} y={0}><Label x={800} y={900} text="Yes." red size={110} /></In>,
    action: 'Story: Christy, all smiles, holds out the bill. "Yes."'},
  {at: 45, line: '"Can you help me move?" Yes.', stage: 'story', header: ['You never say', 'no'],
    side: [{who: 'ama', x: 330, pose: stand({armR: [70, -30], eyes: 'happy', mouth: 'smile'})}],
    board: (t) => (
      <g>
        <In t={t} at={at(46)} x={760} y={1330} k={1.3}><MovingBox /></In>
        <In t={t} at={at(47)} x={760} y={1120} k={1.3} twist={6}><MovingBox rotate={4} /></In>
        <In t={t} at={at(48)} x={760} y={910} k={1.3}><MovingBox rotate={-5} /></In>
        <In t={t} at={at(50)} x={0} y={0}><Label x={540} y={560} text="Yes." red size={110} /></In>
      </g>
    ), action: 'Ama, sweet, next to a growing stack of moving boxes. "Yes."'},
  {at: 51, line: '"Can I borrow your car?"', stage: 'story', header: ['You never say', 'no'],
    side: [{who: 'pretty', x: 380, pose: stand({armR: [80, -20], eyes: 'wide', mouth: 'o'})}],
    board: (t) => <In t={t} at={at(53)} x={780} y={820} k={2.4}><CarKeys /></In>,
    action: 'Christy, hand out, wide-eyed… his car keys glow above her hand.'},
  {at: 56, line: '…Yes.', stage: 'close', pose: {eyes: 'tired', mouth: 'flat'},
    front: (t) => {
      if (t < keysToss()) return null;
      const u = t - keysToss();
      if (u > 0.9) return null;
      return <g transform={`translate(${380 - 520 * u} ${1300 - 1000 * u + 1300 * u * u}) rotate(${-500 * u}) scale(1.4)`}><CarKeys /></g>;
    },
    arms: (t) => (t >= keysToss() ? {armL: [110, -10]} : null),
    action: 'Close, resigned: "…Yes." The keys are already flying out of his hand.'},
  {at: 57, line: 'When your yes is free, people stop asking.', stage: 'react', pose: {eyes: 'squint', mouth: 'flat', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(59)} x={0} y={0}><Label x={540} y={660} text="YES" size={170} /></In>
        <In t={t} at={at(61)} x={700} y={720} k={1.9} rot={16}>
          <g>
            <path d="M 0 -40 L 170 -40 L 200 0 L 170 40 L 0 40 Z" fill={RED} stroke={INK} strokeWidth={6} />
            <text x={90} y={16} textAnchor="middle" fontFamily="EboMarker" fontSize={46} fill="#fff">FREE</text>
          </g>
        </In>
      </g>
    ), action: 'A big handwritten YES… a red FREE price tag slaps onto it.'},
  {at: 65, line: 'They start assuming.', stage: 'story',
    side: [
      {who: 'pretty', x: 300, pose: stand({armR: [80, -20], eyes: 'half', mouth: 'smirk', lookX: 14}), hold: <Receipt len={220} rotate={-20} />},
      {who: 'ama', x: 780, pose: stand({armR: [80, -20], eyes: 'half', mouth: 'smirk', lookX: -14}), facing: -1, hold: <CarKeys />},
    ],
    board: (t) => <In t={t} at={at(66)} x={0} y={0}><Label x={540} y={520} text="assuming" red size={100} /></In>,
    action: 'Christy and Ama, both holding out what they want, not even asking. "assuming".'},
  // ── 3. Always available ──
  {at: 68, line: 'Next: you\'re always available.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -18}, header: ['Always', 'available'],
    board: (t) => bigBadge(t, 1, at(68)), action: 'The second badge lights up (orange, a phone lighting up) and drops in big.'},
  {at: 72, line: 'She texts at midnight.', stage: 'story', header: ['Always', 'available'],
    board: (t) => (
      <g>
        <In t={t} at={at(73)} x={540} y={880} k={1.8}><ChatPhone /></In>
        <In t={t} at={at(75)} x={0} y={0}><Label x={540} y={1380} text="12:00 AM" red /></In>
      </g>
    ), action: 'Her text, big: "u up? need a favor". 12:00 AM.'},
  {at: 76, line: 'You reply in two seconds.', stage: 'insert', pose: {eyes: 'wide', mouth: 'grin', lookX: -18, lookY: -12},
    board: (t) => (
      <g>
        <g transform="translate(470 820) rotate(-4) scale(2.4)"><ChatPhone reply={t >= at(77) ? 'On my way!' : undefined} read={t >= at(79) ? '12:00:02' : undefined} /></g>
        <In t={t} at={at(79)} x={0} y={0}><Label x={380} y={1330} text="2 seconds" red rot={-4} /></In>
      </g>
    ), action: 'Insert: the chat fills the frame; his reply pops in instantly: "On my way!" Ebo, eager, in the corner.'},
  {at: 81, line: 'When you\'re always there, your time looks cheap.', stage: 'react', pose: {eyes: 'half', mouth: 'flat', lookY: -14},
    board: (t) => <In t={t} at={at(86)} x={540} y={760} k={1.7}><SaleClock /></In>, action: 'His time: a clock with a $0.99 sale tag.'},
  {at: 89, line: 'And cheap things get used.', stage: 'story',
    board: (t) => (
      <g>
        <In t={t} at={at(90)} x={540} y={880} k={1.8}><Doormat /></In>
        <In t={t} at={at(92)} x={0} y={0}><Label x={540} y={560} text="used." red size={110} /></In>
      </g>
    ), action: 'A WELCOME doormat covered in muddy footprints. "used."'},
  // ── 4. Liked isn't respected (the payoff) ──
  {at: 94, line: 'And the real reason?', stage: 'close', pose: {eyes: 'squint', mouth: 'flat', headTilt: -4},
    board: () => <Glow x={badgeX(2, 3)} y={120} r={160} />, action: 'Close, serious. The last "?" glows… a beat.'},
  {at: 98, line: 'You think being liked is the same as being respected.', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['Liked isn\'t', 'respected'],
    board: (t) => (
      <g>
        {bigBadge(t, 2, at(98))}
        <In t={t} at={at(101)} x={300} y={1060} k={1}><Heart /></In>
        <In t={t} at={at(104)} x={0} y={0}><Label x={540} y={1090} text="≠" size={140} /></In>
        <In t={t} at={at(107)} x={780} y={1080} k={0.85}><Crown /></In>
      </g>
    ), action: 'THE PAYOFF: the "?" turns purple, a crown, and drops in big; under it a heart ≠ a crown.'},
  {at: 108, line: 'It\'s not.', stage: 'close', pose: {eyes: 'half', mouth: 'flat'}, touch: 'armsCrossed', action: 'Close, firm, arms crossed.'},
  {at: 110, line: 'Liked is "he\'s so sweet."', stage: 'story', header: ['Liked:', '"he\'s so sweet"'],
    side: [{who: 'pretty', x: 420, pose: stand({eyes: 'happy', mouth: 'grin', headTilt: 10})}],
    under: () => <Glow x={420} y={1100} r={320} />,
    board: (t) => (
      <g>
        <In t={t} at={at(111)} x={780} y={760} k={0.7}><Heart /></In>
        <In t={t} at={at(113)} x={830} y={980} k={0.5} twist={8}><Heart /></In>
      </g>
    ), action: 'Christy, gushing, little hearts around her: "he\'s so sweet".'},
  {at: 115, line: 'Respected is "let me check if he\'s free first."', stage: 'story', header: ['Respected:', '"let me check first"'],
    side: [{who: 'pretty', x: 380, pose: stand({armR: [60, -30], eyes: 'open', mouth: 'flat', lookY: 10}), hold: <BigPhone screen="gallery" />}],
    board: (t) => <In t={t} at={at(115)} x={790} y={700} k={0.9}><Crown /></In>,
    action: 'Christy checks her phone before she asks: a crown over her. Respect.'},
  // ── 5. The fix ──
  {at: 124, line: 'So keep the kindness.', stage: 'react', pose: {eyes: 'happy', mouth: 'smile', lookY: -16}, header: ['Keep the', 'kindness'],
    board: (t) => (
      <g>
        <Glow x={540} y={760} r={340} />
        <In t={t} at={at(125)} x={540} y={760} k={2}><Heart /></In>
      </g>
    ), action: 'The heart again, glowing. Keep it.'},
  {at: 128, line: 'Lose the doormat.', stage: 'react', pose: {eyes: 'squint', mouth: 'smirk', lookY: -14}, header: ['Lose the', 'doormat'],
    board: (t) => {
      const u = Math.max(0, t - at(130));
      return <g transform={`translate(${540 + 2600 * u * u} 760) rotate(${u * 200}) scale(1.6)`}><Doormat /></g>;
    }, action: 'The doormat… on "doormat" it gets flung offscreen.'},
  {at: 131, line: 'Say no without a speech.', stage: 'story', header: ['Say', 'no'],
    board: (t) => (
      <g>
        <In t={t} at={at(131)} x={380} y={820} k={1.1}><Speech /></In>
        <In t={t} at={at(132)} x={800} y={1080} k={1.2}><Speech short /></In>
      </g>
    ), action: 'A long speech bubble of excuses, crossed out… a small, clean "No."'},
  {at: 136, line: 'Reply when you\'re ready.', stage: 'story', header: ['Reply when', 'ready'],
    board: (t) => <In t={t} at={at(136)} x={540} y={880} k={1.8}><ChatPhone time="9:00 AM" reply="Morning! Can't, sorry." read="Read 9:00 AM" /></In>,
    action: 'The same chat, replied to the next morning, calmly: 9:00 AM.'},
  {at: 140, line: 'And let people pay their own bill.', stage: 'story', header: ['Pay their', 'own bill'],
    side: [{who: 'pretty', x: 420, pose: stand({armR: [60, -30], eyes: 'half', mouth: 'flat', lookY: 10}), hold: <Receipt len={260} rotate={-10} />}],
    board: (t) => <In t={t} at={at(146)} x={790} y={760} k={1.4} twist={0}><Mark kind="tick" /></In>,
    action: 'Christy holding her own receipt, reading it. A tick.'},
  // ── 6. The close ──
  {at: 147, line: 'Be kind.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -16},
    board: (t) => (
      <g>
        <Glow x={540} y={760} r={460} />
        {[0, 1, 2].map((k) => (
          <In key={k} t={t} at={at(147) + k * 0.12} x={540 + (k - 1) * 260} y={760} k={1.9}><BigBadge b={BADGES[k]} /></In>
        ))}
      </g>
    ), action: 'All three badges land together in the middle. Ebo, sincere.'},
  {at: 149, line: 'Not convenient.', stage: 'close', pose: {eyes: 'squint', mouth: 'flat', headTilt: 5}, action: 'Close: the line.'},
  {at: 151, line: 'Next time… is today.', stage: 'mid', pose: {eyes: 'happy', mouth: 'grin'},
    front: (t) => {
      const u = Math.max(0, t - slideBack());
      return (
        <g>
          <DinnerTable x={720} y={1250} />
          <g transform={`translate(${600 + 900 * Math.min(1, u / 0.6) ** 2} 1222) rotate(-90)`}><Receipt len={300} /></g>
        </g>
      );
    },
    arms: (t) => (t >= slideBack() && t < slideBack() + 0.5 ? {armL: [95, -10]} : null),
    action: 'Back at the table: he slides the receipt across, offscreen. Slow grin. LOOP: hard cut back to "They said they\'d get me next time."'},
];

export const EP08_SECTIONS: string[] = EP08_PLAN.map((s) => (s.at < 35 ? 'The Hook' : s.at < 68 ? 'You Never Say No' : s.at < 94 ? 'Always Available' : s.at < 124 ? 'Liked Isnt Respected' : s.at < 147 ? 'The Fix' : 'The Close'));
/** A pop for each new picture that lands, and each badge. */
export const EP08_SLAMS: number[] = [9, 13, 19, 44, 46, 47, 48, 50, 53, 59, 61, 66, 73, 75, 79, 86, 90, 92, 101, 104, 107, 111, 113, 115, 125, 131, 132, 136, 147].map(at);
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
/** Sound effects beyond the pops (sfxCues.ts). */
export const EP08_SFX = () => [
  ...SLOT_AT().map((a) => ({at: a, sfx: 'pop', vol: 0.9})),
  {at: keysToss(), sfx: 'whoosh', vol: 0.8},
  {at: keysToss() + 0.5, sfx: 'clink', vol: 0.8},
  {at: at(73), sfx: 'phone_buzz', vol: 0.7},
  {at: at(77), sfx: 'click', vol: 0.7},
  {at: at(130), sfx: 'whoosh', vol: 0.8},
  {at: at(146), sfx: 'marker_tick', vol: 0.8},
  {at: slideBack(), sfx: 'slide', vol: 0.8},
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

  const overlay = (
    <g>
      {s.board?.(t)}
      <Tracker t={t} from={TRACK_FROM()} slotAt={SLOT_AT()} badges={BADGES} />
      {s.header && <Header text={s.header} />}
    </g>
  );
  return (
    <StageSizeContext.Provider value={{w: EP08_W, h: EP08_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={FRAMES[s.stage]} bg={SHADES.cream[2]} blurBg={<Backdrop id="ep08-cream" shade="cream" />} overlay={overlay}>
              {s.under?.(t)}
              {s.side?.map((c, k) => (
                <RigCharacter key={k} who={c.who} x={c.x} y={FLOOR} scale={1.7} facing={c.facing ?? 1} t={f + k * 13} pose={gentle({...(POSES.standing as Pose), ...c.pose} as Pose)}>
                  {c.hold}
                </RigCharacter>
              ))}
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
