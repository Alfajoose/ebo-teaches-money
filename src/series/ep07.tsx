import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose, POSES} from '../components/Character';
import {POSE, CONTACT, frontOn, gentle} from '../cast/poses';
import {Backdrop, SHADES} from './sets';
import {StageSizeContext, Slam} from './exportCtx';
import {VFPS, Word, VStage, Framing, lipFrame, beatGesture} from './kit';
import {C} from '../theme';
import {AppPhone, ChainsHeld, ChainsWorn} from '../components/WantsProps';
import {BigPhone} from '../components/StayBrokeProps';
import {NeedBox, FoodBowl, DeliveryBag, ModelPhone, Shirt, WantGuy, PaySlip, Mark, House, Bus, BillDue, DayPage, Payday, FunJar, ChainsBig} from '../components/WantsInserts';
import wordsJson from './data/ep07-words.json';
import envJson from './data/ep07-env.json';

/**
 * EBO TEACHES MONEY — Ep 07 "Wants vs. Needs" (vertical, 1080×1920, ~80s), v3: the "3rd Filter" style
 * (the user's references, Nov 2026).
 * - One metaphor on screen the whole way: a tracker of four badges at the top. Each lights up as Ebo
 *   teaches it; the last stays a grey "?" until the payoff (icons, no numbers: house rule 4).
 * - Animate less, cut more: a new held picture every 1–2 s.
 * - Ebo as the reaction layer: big and cropped along the bottom, looking up at the example above him.
 * - Examples as tiny stories with side characters (Ama, Christy) and the want.
 * - A soft yellow glow marks what matters right now. One plain cream backdrop.
 * Still camera, hard cuts (rule 11); he stands (12) and faces us (14); contact poses (16); a fresh face
 * on each punch (18). Same voice and timing as before.
 */
export const EP07_W = 1080;
export const EP07_H = 1920;
type W7 = Word & {who: 'ebo'};
const WORDS = wordsJson as W7[];
const END = WORDS[WORDS.length - 1].e + 0.5;
export const EP07_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;

// ───────────────────────── layouts ─────────────────────────
/** react: example above, Ebo big and cropped along the bottom · close: his face · story: the example alone (side
 * characters, props) · insert: a prop fills the frame, his head in the corner · mid: waist up. */
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
const FLOOR = 1520; // side characters' feet in the story panels

// ───────────────────────── drawing helpers ─────────────────────────
const MARKER = 'EboMarker';
const INK = C.ink;
const RED = '#E5484D';
/** A handwritten word. */
const Label: React.FC<{x: number; y: number; text: string; red?: boolean; rot?: number; size?: number}> = ({x, y, text, red, rot = 0, size = 84}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={red ? RED : INK} stroke="#fff" strokeWidth={size / 7} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  </g>
);
/** Something that lands at its time, placed at (x, y) at a fixed size `k` (static size, never animated). */
const In: React.FC<{t: number; at: number; x: number; y: number; k?: number; rot?: number; twist?: number; children: React.ReactNode}> = ({t, at: a, x, y, k = 1, rot = 0, twist = -4, children}) => {
  // once landed it rocks once and settles (rotation only, on the symbol's matrix)
  const u = t - a - 0.17;
  const wob = u > 0 ? 4 * Math.sin(u * 16) * Math.exp(-u * 6) : 0;
  return (
    <Slam t={t} at={a} dist={-70} twist={twist} spin={{deg: wob, cx: x, cy: y}}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>{children}</g>
    </Slam>
  );
};
/** The focus glow: a soft yellow halo behind what matters right now. */
const Glow: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <defs>
      <radialGradient id={`glow-${x}-${y}-${r}`}>
        <stop offset="0" stopColor="#FFE45C" stopOpacity={0.85} />
        <stop offset="0.55" stopColor="#FFE45C" stopOpacity={0.35} />
        <stop offset="1" stopColor="#FFE45C" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#glow-${x}-${y}-${r})`} />
  </g>
);

// ───────────────────────── the tracker ─────────────────────────
/** Four badges, top of frame, from "So let's learn to tell them apart." Each lights up when it's taught;
 * the last stays a grey "?" until the payoff. */
const SLOT_AT = () => [at(47), at(70), at(118), at(152)];
const TRACK_FROM = () => at(35);
const SLOT_COLOR = ['#8F6BD1', '#45B69C', '#F5A33A', '#2F6FB0'];
const SlotIcon: React.FC<{k: number}> = ({k}) => {
  if (k === 0)
    // the vanish test: a dashed outline where something was, and a sparkle
    return (
      <g>
        <rect x={-26} y={-26} width={52} height={52} rx={8} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="10 8" />
        <path d="M 30 -38 L 34 -28 L 44 -24 L 34 -20 L 30 -10 L 26 -20 L 16 -24 L 26 -28 Z" fill="#fff" />
      </g>
    );
  if (k === 1)
    // the sneaky ones: two eyes peeking
    return (
      <g>
        {[-16, 16].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={0} rx={13} ry={16} fill="#fff" />
            <circle cx={x + 5} cy={3} r={6} fill={INK} />
          </g>
        ))}
      </g>
    );
  if (k === 2)
    // wants can wait: an hourglass
    return <path d="M -20 -30 L 20 -30 L 4 0 L 20 30 L -20 30 L -4 0 Z" fill="#fff" />;
  // needs first, wants on purpose: a coin
  return (
    <g>
      <circle r={26} fill="#fff" />
      <text y={12} textAnchor="middle" fontFamily={MARKER} fontSize={36} fill={SLOT_COLOR[3]}>
        $
      </text>
    </g>
  );
};
const Tracker: React.FC<{t: number}> = ({t}) => {
  if (t < TRACK_FROM()) return null;
  const lit = SLOT_AT().filter((a) => t >= a).length;
  return (
    <g>
      {[0, 1, 2, 3].map((k) => {
        const x = 540 + (k - 1.5) * 190;
        const on = k < lit;
        const now = on && k === lit - 1 && t < SLOT_AT()[k] + 2.5; // the one just taught glows for a bit
        return (
          <g key={k}>
            {now && <Glow x={x} y={120} r={120} />}
            <circle cx={x} cy={120} r={66} fill={on ? SLOT_COLOR[k] : '#CFC9BC'} stroke={INK} strokeWidth={7} />
            {on ? (
              <g transform={`translate(${x} 120)`}>
                <SlotIcon k={k} />
              </g>
            ) : (
              <text x={x} y={146} textAnchor="middle" fontFamily={MARKER} fontSize={76} fill="#fff">
                ?
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
/** A tracker badge, big, dropped into the middle of the frame when it lights up. */
const BigBadge: React.FC<{k: number}> = ({k}) => (
  <g>
    <circle r={66} fill={SLOT_COLOR[k]} stroke={INK} strokeWidth={7} />
    <SlotIcon k={k} />
  </g>
);
/** The line under the tracker: what this beat is about (black, with the key word in red). */
const Header: React.FC<{text: [string, string?]}> = ({text: [a, b]}) => (
  <text x={540} y={300} textAnchor="middle" fontFamily={MARKER} fontSize={70} fill={INK} stroke="#FFF4DB" strokeWidth={8} paintOrder="stroke">
    {a}
    {b && <tspan fill={RED}> {b}</tspan>}
  </text>
);

// ───────────────────────── the shots ─────────────────────────
type Side = {who: 'ama' | 'pretty'; x: number; pose: Partial<Pose>; hold?: React.ReactNode; facing?: 1 | -1};
type Shot = {
  /** first word of the line (index into words.json) */
  at: number;
  line: string;
  stage: Stage;
  /** Ebo's face and arms (when he's in the shot) */
  pose?: Partial<Pose>;
  /** a contact pose for his arms (house rule 16) */
  touch?: keyof typeof CONTACT;
  /** the example: drawn big in the frame (screen space), by absolute time */
  board?: (t: number) => React.ReactNode;
  /** side characters acting the example out */
  side?: Side[];
  /** drawn in his world behind everyone (a glow behind a side character) */
  under?: (t: number) => React.ReactNode;
  header?: [string, string?];
  action: string;
};
const stand = (x: Partial<Pose>): Partial<Pose> => ({...POSES.standing, armL: [12, 6], armR: [12, 6], eyes: 'open', mouth: 'smile', ...x});

export const EP07_PLAN: Shot[] = [
  // ── 1. The hook ──
  {at: 0, line: 'I can\'t make rent this month.', stage: 'insert', pose: {eyes: 'wide', mouth: 'o', lookX: -18, lookY: -12},
    board: () => <g transform="translate(470 820) rotate(-4) scale(3.3)"><AppPhone screen="bank" /></g>,
    action: 'Insert: his bank app fills the frame ($14.20, RENT DUE); Ebo, gold chains on, peeks up at it from the corner.'},
  {at: 6, line: 'I don\'t get it.', stage: 'close', pose: {eyes: 'wide', mouth: 'o', lookY: -8}, touch: 'cheekWorry', action: 'Close: three gold chains. Baffled.'},
  {at: 10, line: '…Okay.', stage: 'close', pose: {eyes: 'tired', mouth: 'flat', lookY: 18}, touch: 'facepalm', action: 'His eyes drop to the chains. Facepalm.'},
  {at: 11, line: 'I get it.', stage: 'close', pose: {eyes: 'half', mouth: 'smirk'}, action: 'Deadpan, to us.'},
  {at: 14, line: 'A lot of us aren\'t broke because we earn too little.', stage: 'react', pose: {eyes: 'squint', mouth: 'flat', lookY: -14},
    board: (t) => (
      <g>
        <In t={t} at={at(22)} x={540} y={720} k={1.7}><PaySlip /></In>
        <In t={t} at={at(24)} x={0} y={0}><Label x={540} y={1040} text="not the problem" red rot={-3} /></In>
      </g>
    ), action: 'A payslip above him; Ebo looks up at it… "not the problem".'},
  {at: 25, line: 'We\'re broke because our wants…', stage: 'react', pose: {eyes: 'suspicious', mouth: 'smirk', lookY: -14},
    board: (t) => (
      <g>
        <Glow x={480} y={760} r={330} />
        <In t={t} at={at(29)} x={480} y={820} k={2.3}><WantGuy disguise t={t} /></In>
      </g>
    ), action: 'A little purple want, glowing, in a hat and moustache, holding up a NEED sign. Ebo eyes it.'},
  {at: 31, line: '…are dressed up as needs.', stage: 'story',
    board: (t) => (
      <g>
        <g transform="translate(470 860) scale(2.6)"><WantGuy disguise t={t} /></g>
        <In t={t} at={at(31)} x={0} y={0}><Label x={540} y={430} text="a want in disguise" red rot={-3} /></In>
      </g>
    ), action: 'The want in disguise, big: "a want in disguise".'},
  {at: 35, line: 'So let\'s learn to tell them apart.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -16}, touch: 'thinkChin',
    board: (t) => <In t={t} at={at(37)} x={0} y={0}><Label x={540} y={700} text="tell them apart" rot={-3} size={96} /></In>,
    action: 'The tracker appears at the top: four grey "?" badges. Ebo looks up at them, hand on chin.'},
  {at: 42, line: 'Without giving up everything fun.', stage: 'close', pose: {eyes: 'happy', mouth: 'laugh', headTilt: -5}, action: 'Close, grinning.'},
  // ── 2. The test ──
  {at: 47, line: 'Here\'s the test.', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['The', 'vanish test'],
    board: (t) => (
      <g>
        <Glow x={255} y={120} r={140} />
        <Glow x={540} y={760} r={380} />
        <In t={t} at={at(47)} x={540} y={760} k={3.2}><BigBadge k={0} /></In>
      </g>
    ), action: 'The first badge lights up (purple, a dashed box and a sparkle) and drops in big. Ebo looks up at it.'},
  {at: 50, line: 'If it vanished tomorrow…', stage: 'story', header: ['The', 'vanish test'],
    board: (t) => {
      const gone = t >= at(52) + 0.2;
      return (
        <g>
          <g transform="translate(540 820) scale(5.2)" opacity={gone ? 0.18 : 1}><ChainsBig /></g>
          {gone && <rect x={330} y={640} width={420} height={360} rx={30} fill="none" stroke={INK} strokeWidth={8} strokeDasharray="26 20" />}
          {gone && <Label x={540} y={1150} text="poof." red rot={-4} />}
        </g>
      );
    }, action: 'His three gold chains, big… on "vanished" they fade to a dashed outline. "poof."'},
  {at: 54, line: '…would you have to replace it?', stage: 'react', pose: {eyes: 'squint', mouth: 'flat', lookY: -14}, touch: 'thinkChin', header: ['The', 'vanish test'],
    board: (t) => (
      <g>
        <In t={t} at={at(54)} x={0} y={0}><Label x={540} y={640} text="Would you HAVE" size={100} rot={-3} /></In>
        <In t={t} at={at(57)} x={0} y={0}><Label x={540} y={770} text="to replace it?" red size={100} rot={-3} /></In>
      </g>
    ), action: 'The question, handwritten big. Ebo below, hand on chin.'},
  {at: 60, line: 'Rent? Yes.', stage: 'story', header: ['The', 'vanish test'],
    board: (t) => (
      <g>
        <In t={t} at={at(60)} x={540} y={880} k={2.4}><House /></In>
        <In t={t} at={at(61)} x={540} y={560} k={1.6} twist={0}><Mark kind="tick" /></In>
      </g>
    ), action: 'A house… a big green tick on "Yes".'},
  {at: 62, line: 'Food? Yes.', stage: 'story', header: ['The', 'vanish test'],
    board: (t) => (
      <g>
        <In t={t} at={at(62)} x={540} y={900} k={2.4}><FoodBowl /></In>
        <In t={t} at={at(63)} x={540} y={560} k={1.6} twist={0}><Mark kind="tick" /></In>
      </g>
    ), action: 'A bowl of food… tick.'},
  {at: 64, line: 'Getting to work? Yes.', stage: 'story', header: ['The', 'vanish test'],
    board: (t) => (
      <g>
        <In t={t} at={at(64)} x={540} y={900} k={2}><Bus /></In>
        <In t={t} at={at(67)} x={540} y={560} k={1.6} twist={0}><Mark kind="tick" /></In>
      </g>
    ), action: 'The bus to work… tick.'},
  {at: 68, line: '…These? No.', stage: 'close', pose: {eyes: 'sad', mouth: 'frown', lookY: 18, headTilt: -6}, touch: 'cheekWorry',
    board: (t) => <In t={t} at={at(69)} x={540} y={1060} k={2} twist={0}><Mark kind="cross" /></In>,
    action: 'Close: he looks down at his chains… "No." A red cross slams over them.'},
  // ── 3. The sneaky ones ──
  {at: 70, line: 'Now watch the sneaky ones.', stage: 'react', pose: {eyes: 'suspicious', mouth: 'smirk', lookY: -18}, touch: 'thinkChin', header: ['The', 'sneaky ones'],
    board: (t) => (
      <g>
        <Glow x={445} y={120} r={140} />
        <Glow x={540} y={760} r={380} />
        <In t={t} at={at(70)} x={540} y={760} k={3.2}><BigBadge k={1} /></In>
      </g>
    ), action: 'The second badge lights up (green, two peeking eyes) and drops in big. Ebo, suspicious, hand on chin.'},
  {at: 75, line: 'A need with a want hiding inside.', stage: 'story', header: ['The', 'sneaky ones'],
    board: (t) => (
      <g>
        <g transform="translate(540 900) scale(2)"><NeedBox peek={Math.min(1, Math.max(0, (t - at(79)) / 0.25))} /></g>
        <In t={t} at={at(79)} x={0} y={0} twist={6}><Label x={780} y={470} text="want" red rot={8} size={96} /></In>
      </g>
    ), action: 'A box marked NEED… a little want peeks out of it on "want hiding".'},
  {at: 82, line: 'You need food.', stage: 'story', header: ['need:', 'food'],
    side: [{who: 'ama', x: 400, pose: stand({armR: [60, -30], eyes: 'happy', mouth: 'smile'}), hold: <FoodBowl x={20} y={-20} />}],
    under: () => <Glow x={420} y={1150} r={320} />, action: 'Story: Ama with a bowl of home food. Happy.'},
  {at: 85, line: 'You want delivery.', stage: 'story', header: ['want:', 'delivery'],
    side: [{who: 'ama', x: 380, pose: stand({armR: [60, -30], eyes: 'half', mouth: 'smirk', lookY: 10}), hold: <BigPhone screen="scroll" />}],
    board: (t) => (
      <g>
        <In t={t} at={at(86)} x={800} y={1180} k={1.4}><DeliveryBag /></In>
      </g>
    ), action: 'Ama on her phone… a delivery bag lands beside her, its $$$ receipt trailing.'},
  {at: 88, line: 'You need a phone.', stage: 'story', header: ['need:', 'a phone'],
    side: [{who: 'pretty', x: 420, pose: stand({armR: [60, -30], eyes: 'open', mouth: 'smile'}), hold: <ModelPhone x={10} y={-40} />}],
    action: 'Story: Christy with her old, cracked phone. It works.'},
  {at: 92, line: 'You want the new one.', stage: 'story', header: ['want:', 'the new one'],
    side: [{who: 'pretty', x: 360, pose: stand({armR: [70, -30], eyes: 'wide', mouth: 'grin'}), hold: <ModelPhone fresh x={10} y={-40} />}],
    under: () => <Glow x={400} y={1100} r={340} />, action: 'Christy, starry-eyed, holding up the shiny NEW! one. Glow.'},
  {at: 97, line: 'Every year.', stage: 'story', header: ['want:', 'the new one'],
    board: (t) => (
      <g>
        {['2025', '2026', '2027'].map((y, k) => (
          <In key={y} t={t} at={at(97) + k * 0.3} x={250 + k * 290} y={900} k={1.3} twist={k % 2 ? 6 : -6}><ModelPhone fresh year={y} /></In>
        ))}
      </g>
    ), action: 'Three new phones land in a row: 2025, 2026, 2027.'},
  {at: 99, line: 'You need clothes.', stage: 'story', header: ['need:', 'clothes'],
    board: (t) => <In t={t} at={at(100)} x={540} y={920} k={2.4}><Shirt /></In>, action: 'A plain $8 tee.'},
  {at: 102, line: 'You want the brand.', stage: 'story', header: ['want:', 'the brand'],
    board: (t) => (
      <g>
        <Glow x={540} y={920} r={360} />
        <In t={t} at={at(103)} x={540} y={920} k={2.4}><Shirt brand /></In>
      </g>
    ), action: 'The same tee in black: LUXE, $250. Glow.'},
  {at: 106, line: 'And the sneakiest of all:', stage: 'close', pose: {eyes: 'squint', mouth: 'flat'}, action: 'Close, slowing down.'},
  {at: 111, line: '…subscriptions.', stage: 'react', pose: {eyes: 'angry', mouth: 'flat', lookY: -14}, touch: 'thinking', header: ['The sneakiest:', 'subscriptions'],
    board: (t) => <In t={t} at={at(111)} x={540} y={760} k={2.2}><AppPhone screen="apps" /></In>, action: 'His phone above him, four streaming apps. Ebo glares up at it.'},
  {at: 112, line: 'Four streaming apps. …I watch one.', stage: 'insert', pose: {eyes: 'open', mouth: 'flat', lookX: -18, lookY: -12},
    board: (t) => <g transform="translate(470 820) rotate(-4) scale(3.3)"><AppPhone screen="apps" watched={t >= at(115)} /></g>,
    action: 'Insert: the phone fills the frame; three apps grey out on "I watch one". Ebo winces in the corner.'},
  // ── 4. Wants can wait ──
  {at: 118, line: 'Here\'s the thing.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -18}, header: ['Wants', 'can wait'],
    board: (t) => (
      <g>
        <Glow x={635} y={120} r={140} />
        <Glow x={540} y={760} r={380} />
        <In t={t} at={at(118)} x={540} y={760} k={3.2}><BigBadge k={2} /></In>
      </g>
    ), action: 'The third badge lights up (orange, an hourglass) and drops in big.'},
  {at: 121, line: 'Needs are urgent.', stage: 'story', header: ['Needs are', 'urgent'],
    board: (t) => (
      <g>
        <Glow x={540} y={880} r={360} />
        <In t={t} at={at(121)} x={540} y={880} k={2.4}><BillDue /></In>
      </g>
    ), action: 'The rent bill, DUE TODAY, glowing.'},
  {at: 124, line: 'Wants can wait.', stage: 'story', header: ['Wants', 'can wait'],
    board: (t) => <In t={t} at={at(124)} x={540} y={900} k={3}><WantGuy mood="happy" ticket t={t} /></In>, action: 'The want, happily holding ticket #99. It can wait.'},
  {at: 127, line: 'So give every want a one-day pause.', stage: 'story', header: ['a one-day', 'pause'],
    side: [{who: 'ama', x: 330, pose: stand({armR: [60, -30], eyes: 'wide', mouth: 'o', lookX: 14}), hold: <BigPhone screen="gallery" />}],
    board: (t) => <In t={t} at={at(130)} x={780} y={900} k={1.5}><DayPage /></In>, action: 'Story: Ama, wide-eyed at something on her phone… a calendar page: TODAY.'},
  {at: 134, line: 'Still want it tomorrow? Fine, think about it.', stage: 'story', header: ['a one-day', 'pause'],
    side: [{who: 'ama', x: 330, pose: stand({eyes: 'half', mouth: 'flat', lookX: 14}), hold: <BigPhone screen="gallery" />}],
    board: (t) => <In t={t} at={at(137) - 0.1} x={780} y={900} k={1.5}><DayPage tomorrow /></In>, action: 'TOMORROW. Ama, calmer, still looking. Fine: think about it.'},
  {at: 142, line: 'Forgot about it by tomorrow? It was never that important.', stage: 'react', pose: {eyes: 'half', mouth: 'smirk', lookY: -14}, touch: 'armsCrossed', header: ['Wants', 'can wait'],
    board: (t) => <g transform="translate(540 780) scale(2.2)" opacity={Math.max(0.15, 1 - Math.max(0, t - at(147)) * 0.8)}><WantGuy mood="sad" t={t} /></g>,
    action: 'The want above him slowly fades away. Ebo, arms crossed: never that important.'},
  // ── 5. Needs first. Wants on purpose. ──
  {at: 152, line: 'So when the money lands,', stage: 'react', pose: {eyes: 'wide', mouth: 'o', lookY: -18}, header: ['Needs first.', 'Wants on purpose.'],
    board: (t) => (
      <g>
        <Glow x={825} y={120} r={140} />
        <In t={t} at={at(155)} x={540} y={760} k={1.8}><Payday /></In>
      </g>
    ), action: 'THE PAYOFF: the last "?" badge turns blue ($). PAYDAY lands above Ebo.'},
  {at: 157, line: 'pay your needs first.', stage: 'close', pose: {eyes: 'open', mouth: 'smile'}, header: ['Needs first.', 'Wants on purpose.'], action: 'Close, firm.'},
  {at: 161, line: 'Rent, food, transport. Done.', stage: 'story', header: ['Needs', 'first'],
    board: (t) => (
      <g>
        <In t={t} at={at(161)} x={220} y={900} k={1.2}><House /></In>
        <In t={t} at={at(162)} x={540} y={920} k={1.2}><FoodBowl /></In>
        <In t={t} at={at(163)} x={860} y={910} k={1.1}><Bus /></In>
        <In t={t} at={at(164)} x={540} y={620} k={1.6} twist={0}><Mark kind="tick" /></In>
      </g>
    ), action: 'Rent, food, the bus line up… "Done." A big tick.'},
  {at: 165, line: 'Then give your wants a fixed amount.', stage: 'story', header: ['Wants', 'on purpose'],
    board: (t) => <In t={t} at={at(169)} x={540} y={900} k={2.4}><FunJar /></In>, action: 'A jar: FUN MONEY.'},
  {at: 172, line: 'Your fun money. Spend it however you like, no guilt.', stage: 'story', header: ['Your', 'fun money'],
    board: (t) => (
      <g>
        <Glow x={540} y={880} r={380} />
        <g transform="translate(400 900) scale(2)"><FunJar /></g>
        <In t={t} at={at(175)} x={800} y={1000} k={2} twist={8}><WantGuy mood="happy" t={t} /></In>
      </g>
    ), action: 'The jar, glowing; the want hops in beside it, happy. No guilt.'},
  {at: 182, line: 'When it\'s gone, it\'s gone.', stage: 'story', header: ['Your', 'fun money'],
    board: (t) => (
      <g>
        <g transform="translate(400 900) scale(2)"><FunJar empty={t >= at(184)} /></g>
        <g transform="translate(800 1000) scale(2)"><WantGuy mood={t >= at(184) ? 'sad' : 'happy'} t={t} /></g>
      </g>
    ), action: 'The jar empties on "gone"; the want deflates.'},
  {at: 187, line: 'Until next month.', stage: 'close', pose: {eyes: 'half', mouth: 'flat'}, touch: 'armsCrossed', action: 'Close, dry, arms crossed.'},
  // ── 6. The close ──
  {at: 190, line: 'Wants aren\'t the enemy.', stage: 'react', pose: {eyes: 'open', mouth: 'smile', lookY: -16},
    board: (t) => (
      <g>
        <Glow x={540} y={780} r={480} />
        {[0, 1, 2, 3].map((k) => (
          <In key={k} t={t} at={at(190) + k * 0.12} x={540 + ((k % 2) - 0.5) * 300} y={640 + Math.floor(k / 2) * 300} k={2}><BigBadge k={k} /></In>
        ))}
      </g>
    ), action: 'All four badges, big, land together in the middle. Ebo looks up at them, sincere.'},
  {at: 194, line: 'Wants with no limit are.', stage: 'close', pose: {eyes: 'squint', mouth: 'flat', headTilt: 5}, action: 'Close: the warning.'},
  {at: 199, line: 'This one? Paid for. With want money.', stage: 'mid', pose: {eyes: 'happy', mouth: 'grin'},
    action: 'Two chains off and in his hand, one stays on… on "With" he tosses the two offscreen… CLANG. Slow grin. LOOP: hard cut back to shot 1.'},
];

export const EP07_SECTIONS: string[] = EP07_PLAN.map((s) => (s.at < 47 ? 'The Hook' : s.at < 70 ? 'The Test' : s.at < 118 ? 'The Sneaky Ones' : s.at < 152 ? 'Wants Can Wait' : s.at < 190 ? 'Needs First' : 'The Close'));

/** A pop for each new picture that lands (sfx), a tick for each green tick. */
export const EP07_SLAMS: number[] = [190, 22, 29, 37, 54, 57, 60, 62, 64, 79, 86, 100, 103, 111, 121, 124, 130, 155, 161, 162, 163, 169, 175].map(at).concat([0, 1, 2].map((k) => at(97) + k * 0.3));
export const EP07_TICKS: number[] = [61, 63, 67, 164].map(at);

export const ep07Times = () => {
  const starts = EP07_PLAN.map((s) => Math.max(0, WORDS[s.at].s - 0.08));
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

// the ending: two chains off and into his hand, then tossed offscreen; a clang off camera
const LAST = EP07_PLAN.length - 1;
const tossAt = () => at(203);
const tossProp = (t: number) => {
  if (t < tossAt()) return null;
  const u = t - tossAt();
  if (u > 1.2) return null;
  return <g transform={`translate(${230 - 650 * u} ${1180 - 1500 * u + 0.5 * 2600 * u * u}) rotate(${-600 * u})`}><ChainsHeld count={2} /></g>;
};
/** Sound effects for the ending gag and the glow beats (sfxCues.ts). */
export const EP07_GAG_SFX = () => [
  ...SLOT_AT().map((a) => ({at: a, sfx: 'pop', vol: 0.9})), // a badge lights up
  {at: tossAt(), sfx: 'whoosh', vol: 0.8},
  {at: tossAt() + 0.6, sfx: 'clink', vol: 1},
];

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

export const Ep07Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep07ShotAt(f);
  const s = EP07_PLAN[i];
  const local = t - TIMES[i].start;
  const place = EBO_AT[s.stage];

  // Ebo: the shot's face; a contact pose or his hands on the beat; idle on top
  let pose: Pose = {...POSE.stand, ...s.pose} as Pose;
  let holdL: React.ReactNode;
  let chains = 3;
  if (i === LAST) {
    if (t >= tossAt()) pose = {...pose, armL: [120, -10]};
    else if (t >= at(201) - 0.25) pose = {...pose, armL: [85, -25]};
    if (t >= at(201) - 0.25) chains = 1;
    if (t >= at(201) - 0.25 && t < tossAt()) holdL = <ChainsHeld count={2} />;
  } else if (s.touch) {
    const c = CONTACT[s.touch];
    pose = {...pose, armL: c.armL, armR: c.armR, armFront: c.armFront, contact: true, headTilt: s.pose?.headTilt ?? c.headTilt, view: 1};
  } else pose = beatGesture(pose, WORDS, ENV, f, TIMES[i].start, TIMES[i].start + TIMES[i].length);
  const id = idle(t, local, f, i);
  pose = {...pose, tilt: (pose.tilt ?? 0) + (id.tilt ?? 0), lift: (pose.lift ?? 0) + (id.lift ?? 0), ...(id.lookX ? {lookX: id.lookX} : {}), ...(id.eyes ? {eyes: id.eyes} : {})} as Pose;

  const overlay = (
    <g>
      {s.board?.(t)}
      <Tracker t={t} />
      {s.header && <Header text={s.header} />}
    </g>
  );
  return (
    <StageSizeContext.Provider value={{w: EP07_W, h: EP07_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={FRAMES[s.stage]} bg={SHADES.cream[2]} blurBg={<Backdrop id="ep07-cream" shade="cream" />} overlay={overlay}>
              {s.under?.(t)}
              {s.side?.map((c, k) => (
                <RigCharacter key={k} who={c.who} x={c.x} y={FLOOR} scale={1.7} facing={c.facing ?? 1} t={f + k * 13} pose={gentle({...(POSES.standing as Pose), ...c.pose} as Pose)}>
                  {c.hold}
                </RigCharacter>
              ))}
              {place && (
                <RigCharacter who="ebo" x={place.x} y={place.y} scale={place.scale} t={f} pose={gentle(frontOn(pose))} holdL={holdL}
                  wear={<ChainsWorn count={chains} />} mouthFrame={talking(f) ? lipFrame(ENV, WORDS, f) : undefined} />
              )}
              {i === LAST && tossProp(t)}
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
