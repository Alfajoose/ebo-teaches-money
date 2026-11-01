import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {PoseCharacter} from '../cast/PoseCharacter';
import {RigCharacter} from '../cast/RigCharacter';
import {POSE, LIE_Y} from '../cast/poses';
import {Pose} from '../components/Character';
import {SKIN} from '../components/grip';
import {POSES} from '../components/Character';
import {cycleSpeed} from '../cast/cycles';
import {Backdrop} from './sets';
import {BigPhone, PhoneInsert} from '../components/StayBrokeProps';
import {Laptop, Notebook} from '../components/StayPoorProps';
import {Dumbbell, Birdhouse, Crate, Mirror, Pizza, Thought, ChalkLine, Checklist, Todo, Hammer, Slice, Ball, Chalk, Marker, KONKA_SKIN} from '../components/KonkaProps';
import {Sticky} from '../components/StayBrokeProps';
import {VFPS, Word, VStage, Framing, CamMove, camera, lipFrame, chunkWords, TopCaption, G, drop, beat} from './kit';
import {C, FONT} from '../theme';
import {Slam, Still, LayerMode, LayerModeContext, StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import danWords from './data/konka01-words-dan.json';
import danEnv from './data/konka01-env-dan.json';
import jimmyWords from './data/konka01-words-jimmy.json';
import jimmyEnv from './data/konka01-env-jimmy.json';

/**
 * KONKA SHORT 01 — "Can't control your lust?" (YouTube Short, 1080×1920).
 * Animated from the approved storyboard (episodes/konka01/storyboard.png): 32 shots, each
 * starting on the first word of its line in the recorded voice (Jimmy, ElevenLabs).
 * Konka is a pose-library character: every pose is one of his 87 drawn poses (frames of his
 * symbol), and he snaps between them. House style: plain lilac backdrop, acting first, props
 * only for the jokes, phone inserts as big-hand drawings.
 */

export const K01_W = 1080;
export const K01_H = 1920;
/** Who stars: Ebo replaced Konka in this Short (Konka's version is still here: STAR = 'konka'). */
export type Star = 'ebo' | 'konka';
export const STAR = 'ebo' as Star;
/** Each star has his own voice: Ebo is Dan, Konka is Jimmy (ElevenLabs). */
const VOICE = STAR === 'ebo' ? {words: danWords, env: danEnv, audio: 'konka01/voice-dan.mp3'} : {words: jimmyWords, env: jimmyEnv, audio: 'konka01/voice-jimmy.mp3'};
const WORDS = VOICE.words as Word[];
const ENV = (VOICE.env as {env: number[]}).env;
const CHUNKS = chunkWords(WORDS, 4, 22);

// world: feet on y = FLOOR; Konka is ~860 px tall
const FLOOR = 1500;
const X = 540;
const Z = (zoom: number, cx: number, cy: number): Framing => ({zoom, cx, cy});
const FULL = (cx = X) => Z(1, cx, 1000);
const MS = (cx = X) => Z(1.45, cx, 1020);
const CU = (cx = X) => Z(2.3, cx, 860);
const ECU = (cx = X) => Z(3.3, cx, 840);
const WIDE = (cx = X) => Z(0.8, cx, 980);

type Move = 'static' | 'push-in' | 'pull-out' | 'snap-zoom' | 'pan';
type Konka = {pose: number; x?: number; facing?: 1 | -1; then?: {at: number; pose: number}[]; look?: [number, number]; dy?: (local: number) => number};
type Shot = {
  line: string;
  section: string;
  size: string;
  move: Move;
  from: Framing;
  to?: Framing;
  konka?: Konka;
  talk?: boolean; // Konka says the line to camera (lip sync)
  night?: boolean;
  card?: [number, string, string]; // chapter card: step, title lines
  idea?: string; // the idea line at the top
  props?: (local: number, f: number) => React.ReactNode;
  front?: (local: number, f: number) => React.ReactNode; // drawn over Konka (inserts)
  christy?: {x0: number; dir: 1 | -1}; // walking past
  text?: (local: number) => React.ReactNode;
  action: string;
};

const step = (local: number, at: number[]) => at.filter((a) => local >= a).length;

const EBO_SCALE = 1.75;
const CARD_X = STAR === 'ebo' ? 700 : 620; // on chapter cards, clear of the title // Ebo at Konka's height in this Short
/** Push-up, side-on: up = arms straight to the floor, down = forearms flat; the head stays upright to us. */
const PUSH_UP: Pose = {...POSE.stand, tilt: 60, headTilt: -45, armL: [-70, 0], armR: [50, 0], eyes: 'squint', mouth: 'grimace'};
const PUSH_DOWN: Pose = {...POSE.stand, tilt: 74, headTilt: -58, armL: [-100, 0], armR: [80, 0], eyes: 'squeeze', mouth: 'teeth'};
const TYPE: Partial<Pose> = {armR: [70, -60], armL: [55, -70], lookX: 10, lookY: 8};
/**
 * Ebo's pose for each of Konka's (by his pose number in each shot), from Ebo's pose library;
 * `then` changes follow the same beats as Konka's.
 */
/**
 * Ebo's arm is an upper arm and a forearm with no hand or fingers, so a deep elbow bend reads as a
 * broken limb (the user's note). Every pose in this Short goes through this: elbows stay within
 * ±ELBOW_MAX (straight or gently bent).
 */
const ELBOW_MAX = 40;
const gentle = (p: Pose): Pose => {
  const c = (a: [number, number]): [number, number] => [a[0], Math.max(-ELBOW_MAX, Math.min(ELBOW_MAX, a[1]))];
  return {...p, armL: c(p.armL), armR: c(p.armR)};
};
const EBO: Record<number, Pose> = {
  37: {...POSE.pointAtYou, view: 1},
  20: {...POSE.shocked, lookX: 14},
  49: {...POSE.stand, tilt: 6, headTilt: 6, armR: [24, 10], eyes: 'wide', mouth: 'o', lookX: 16},
  36: {...POSE.happy, eyes: 'happy', mouth: 'laugh', headTilt: 10},
  85: {...POSE.point, view: 1, eyes: 'squint', mouth: 'smirk'},
  64: {...POSE.bored, view: 1, eyes: 'tired', mouth: 'flat'},
  2: {...POSE.ideaFinger, view: 0},
  32: {...POSE.bored, eyes: 'half', mouth: 'flat'},
  30: {...POSE.stand, armL: [26, 128], armR: [26, 128], eyes: 'suspicious', mouth: 'smirk', lookX: 12},
  84: {...POSE.pointUp, eyes: 'happy', mouth: 'smirk'},
  11: {...POSE.stand, view: 1, legL: [45, 80], legR: [-35, 80], lift: 55, armL: [70, -70], armR: [70, -70], eyes: 'squeeze', mouth: 'grimace'},
  31: {...POSE.holdOut, eyes: 'squint', mouth: 'flat', lookX: 10, lookY: 8},
  10: {...POSE.kneel, armL: [60, -40], armR: [60, -40], eyes: 'squint', mouth: 'flat', lookX: 10, lookY: 8},
  23: {...POSE.explain, view: 1, eyes: 'squint', mouth: 'flat'},
  9: PUSH_UP,
  86: {...POSE.backHips},
  78: POSE.pointUp,
  54: {...POSE.stopHand, view: 1},
  27: {...POSE.holdOut, eyes: 'happy', mouth: 'grin'},
  8: {...POSE.stand, eyes: 'suspicious', mouth: 'grimace', lookX: 14},
  39: POSE.explain,
  79: POSE.nervous,
  33: {...POSE.shocked, eyes: 'wide', mouth: 'grimace'},
  38: {...POSE.ideaFinger, eyes: 'half', mouth: 'smirk'},
  1: {...POSE.stand, legL: [22, 10], legR: [-8, 0], tilt: 4, eyes: 'happy', mouth: 'smile'},
  77: {...POSE.stopHand, view: 1, eyes: 'angry', mouth: 'flat'},
  3: {...POSE.point, eyes: 'happy', mouth: 'grin'},
  57: {...POSE.shrug, view: 1, armL: [60, -30], armR: [60, -30], eyes: 'happy', mouth: 'smile', headTilt: 6},
  62: {...POSE.stand, armL: [90, 0], armR: [90, 0], eyes: 'open', mouth: 'flat'},
  72: {...POSE.hostFront, mouth: 'flat'},
  66: {...POSE.stand, eyes: 'wide', mouth: 'o', lookX: 16, lookY: 12, headTilt: -6},
};

/**
 * Ebo handles the props (house rule 10, and the user's note: props he interacts with, that feel
 * tangible). Per shot: his pose over time, what is in his hand (it follows his grip), and props
 * that react: things fall with gravity and bounce once, get hit, swatted or ticked.
 * Hand-space units are world px / EBO_SCALE (what he holds is drawn in his hand's space).
 */
type Act = {pose?: Pose; hold?: React.ReactNode; props?: React.ReactNode; replace?: boolean; dx?: number};
const EBO_ACT: Record<number, (local: number, f: number) => Act> = {
  // walk-by: his to-do list in hand… slips out as he drifts after her, hits the floor, bounces
  1: (l) => ({hold: <Todo y={drop(l, 3.6, 190) / 1} rotate={l < 3.6 ? -8 : Math.min(80, (l - 3.6) * 260)} />}),
  // "find something you want to achieve": holds up a GOAL note to us
  5: () => ({pose: {...POSE.showToCamera, eyes: 'wide', mouth: 'grin'}, hold: <Sticky y={-70} text="GOAL" rotate={-6} />}),
  // bored on the floor: tosses a ball up and catches it, over and over
  6: (l) => {
    const t = (l % 1.0) / 1.0; // one toss a second
    return {pose: l < 5.2 ? {...POSE.stand, armR: [t < 0.15 ? 62 : 44, t < 0.15 ? 20 : 0], armL: [8, 4], headTilt: -6, eyes: 'half', mouth: 'flat', lookY: -14} : undefined, hold: l < 5.2 ? <Ball y={-20 - 1300 * t * (1 - t)} /> : null};
  },
  // gym: curls the dumbbell (right arm), rep after rep
  // (¾ view so the curl is seen from the side; effort face on the lift)
  8: (l) => {
    const up = beat(l, 0.45) % 2 === 1;
    return {pose: {...POSE.stand, armL: [12, 6], armR: up ? [95, 0] : [12, 0], eyes: up ? 'angry' : 'squint', mouth: up ? 'teeth' : 'flat', brows: 'angry', lift: up ? 4 : 0, headTilt: up ? -4 : 0}, hold: <Dumbbell small rotate={90} />, replace: true};
  },
  // skill: standing, studying a notebook in his hand; the page fills as he reads on
  9: (l) => ({pose: {...POSE.holdOut, armR: [70, -20], eyes: 'squint', mouth: 'flat', lookX: 10, lookY: 8, headTilt: -4}, hold: <Notebook y={-40} rotate={-8} lines={1 + Math.min(3, beat(l, 0.5))} />, replace: true}),
  // build: hammering the birdhouse; it jolts on every hit
  10: (l) => {
    const n = beat(l, 0.4);
    const hit = (l % 0.4) < 0.08;
    // standing at a crate, the birdhouse on top (it jolts on every hit)
    return {pose: {...POSE.stand, armR: n % 2 ? [82, -20] : [150, -40], armL: [40, -30], eyes: 'squint', mouth: 'flat', brows: 'angry', lookX: 12, lookY: 8}, hold: <Hammer rotate={-30} />, props: <><Crate x={530} y={FLOOR} /><Birdhouse x={530} y={FLOOR - 150 + (hit && n % 2 ? 8 : 0)} /></>, replace: true, dx: -120};
  },
  // the thought bubble: he swats it away and it flies off
  15: (l) => {
    // the bubble pops up by his head; he eyes it, suspicious… then swats it away
    const sw = l > 1.8;
    const k = Math.max(0, l - 1.8);
    return {pose: sw ? {...POSE.stopHand, view: 1, armR: [60, -90], tilt: 6} : {...POSE.stand, eyes: 'suspicious', mouth: 'flat', brows: 'angry', lookX: 14, lookY: -12, headTilt: 6}, props: l > 0.4 ? <Thought x={600 + k * 900} y={1010 - k * 500 + 0.5 * G * 0.3 * k * k} text="?!" /> : null, replace: true};
  },
  // three push-ups, on the counts (1… 2… 3.), then he collapses and stays down
  12: (l) => {
    const counts = [0.5, 1.0, 1.5];
    const down = counts.some((c) => l >= c && l < c + 0.22) || l >= 1.9;
    return {pose: l >= 1.9 ? {...PUSH_DOWN, eyes: 'tired', mouth: 'frown'} : down ? PUSH_DOWN : PUSH_UP};
  },
  // start small: one tiny step forward… and he's SO proud of it
  24: (l) => (l < 0.3
    ? {pose: {...POSE.stand, eyes: 'squint', mouth: 'flat', lookY: 14, headTilt: -6}}
    : l < 0.55
      ? {pose: {...POSE.stand, legL: [30, 10], legR: [-14, 6], armL: [-20, 0], armR: [30, 40], tilt: 4, eyes: 'squint', mouth: 'flat', lookY: 14}, dx: 30}
      : {pose: {...POSE.stand, armL: [24, 0], armR: [24, 0], eyes: 'happy', mouth: 'smile', headTilt: -10, lift: -6}, dx: 60}),
  // not a robot: stiff arms, the head snaps side to side on a beat
  28: (l) => {
    const n = beat(l, 0.35);
    return {pose: {...POSE.stand, armL: n % 2 ? [90, 0] : [60, 0], armR: n % 2 ? [60, 0] : [90, 0], headTilt: n % 2 ? 8 : -8, eyes: 'open', mouth: 'flat'}};
  },
  // midnight pizza: picks up a slice and bites
  16: (l) => {
    const up = beat(l, 0.8) % 2 === 1;
    return {pose: {...POSE.stand, armFront: up, armR: up ? [118, 30] : [50, 20], armL: [12, 6], eyes: up ? 'happy' : 'wide', mouth: up ? 'laugh' : 'grin'}, hold: <Slice bitten={l > 1.6} rotate={-20} />, replace: true};
  },
  17: () => ({pose: {...POSE.stand, armFront: true, armR: [118, 30], eyes: 'suspicious', mouth: 'grimace', lookX: 14}, hold: <Slice bitten rotate={-20} />}),
  // boundaries: chalks the line himself, then stands behind it
  // the line is drawn; he stands behind it, hand up — NO — and drops the chalk (it bounces once)
  25: (l) => ({pose: l < 0.9 ? {...POSE.stopHand, view: 1, eyes: 'angry', mouth: 'flat'} : undefined, hold: l < 0.9 ? <Chalk rotate={-40} /> : null, props: <><ChalkLine x={X} y={FLOOR + 30} />{l >= 0.9 && <Chalk x={X + 150} y={FLOOR - 330 + drop(l, 0.9, 330)} rotate={-40 + Math.min(130, (l - 0.9) * 500)} />}</>, replace: true}),
  // impulses don't decide: studying, and he doesn't look up when she walks past
  29: (l) => ({pose: {...POSE.holdOut, armR: [70, -20], eyes: 'squint', mouth: 'flat', lookX: 10, lookY: 8, headTilt: -4}, hold: <Notebook y={-40} rotate={-8} lines={3} />, replace: true}),
  // routine: ticks the checklist with a marker, one tap per tick
  26: (l) => {
    const n = Math.min(3, beat(l, 0.3, 0.15));
    const tap = ((l - 0.15) % 0.3) < 0.1 && l > 0.15 && n < 3;
    return {pose: {...POSE.point, armR: tap ? [100, -10] : [92, 20], eyes: 'happy', mouth: 'grin'}, hold: <Marker rotate={-60} />, props: <Checklist x={780} y={900} ticks={n} />, replace: true};
  },
  // the ending: the phone buzzes on the floor when it lights up
  31: (l, f) => ({props: <BigPhone x={800} y={FLOOR - 30} rotate={-70 + (l > 0.5 && l < 1.4 ? (f % 4 < 2 ? 6 : -6) : 0)} screen={l < 0.5 ? 'off' : 'scroll'} t={f} />, replace: true}),
};

export const K01_PLAN: Shot[] = [
  // ═════ THE HOOK ═════
  {section: 'THE HOOK', line: "So... you can't control your lust?", size: 'MS', move: 'push-in', from: MS(), to: CU(), konka: {pose: 37}, talk: true, action: 'Konka alone on the backdrop, finger up, squinting at us. Slow push-in.'},
  {section: 'THE HOOK', line: 'One attractive person walks past, and suddenly your brain forgets every important thing you were supposed to do today.', size: 'WIDE', move: 'static', from: WIDE(560), konka: {pose: 20, x: 330, then: [{at: 2.2, pose: 49}, {at: 3.6, pose: 36}]}, christy: {x0: 2500, dir: -1},
    props: (l) => <Todo x={330 + (l < 3.6 ? 120 : 160)} y={l < 3.6 ? 1180 : Math.min(FLOOR - 10, 1180 + (l - 3.6) * 900)} rotate={l < 3.6 ? -8 : 50} />,
    action: 'Christy walks past (just walking). Konka\'s head snaps to follow her; he drifts after her and his to-do list drops to the floor.'},
  {section: 'THE HOOK', line: 'Congratulations. Your hormones have officially taken over management.', size: 'CU', move: 'snap-zoom', from: MS(), to: CU(), konka: {pose: 36}, action: 'Snap-zoom on his face: dazed, dopey grin. Nobody home.'},
  // ═════ STEP 1 ═════
  {section: 'STEP 1 — FIND YOUR PURPOSE', line: 'First, get yourself a purpose.', size: 'FULL', move: 'push-in', from: FULL(), to: Z(1.06, X, 1060), konka: {pose: 85, x: CARD_X}, talk: true, card: [1, 'FIND YOUR', 'PURPOSE'], action: 'Chapter card: title slams in above, Konka thinking below.'},
  {section: 'STEP 1 — FIND YOUR PURPOSE', line: 'Seriously.', size: 'ECU', move: 'static', from: ECU(), konka: {pose: 64}, talk: true, action: 'Hard cut to a deadpan stare into the lens. Hold.'},
  {section: 'STEP 1 — FIND YOUR PURPOSE', line: 'Find something you actually want to achieve.', size: 'MS', move: 'static', from: MS(), konka: {pose: 2}, talk: true, action: 'Finger up, eyes up: the idea lands. Determined.'},
  {section: 'STEP 1 — FIND YOUR PURPOSE', line: 'Because when your entire day consists of doing absolutely nothing, your brain has plenty of time to entertain some very questionable ideas.', size: 'FULL → MS', move: 'push-in', from: FULL(), to: MS(), konka: {pose: 32, then: [{at: 5.2, pose: 30}]}, action: 'Slumped on the floor doing nothing; push in as his eyes slide sideways and a sly smirk creeps in.'},
  // ═════ STEP 2 ═════
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'Second, work on yourself.', size: 'FULL', move: 'push-in', from: FULL(), to: Z(1.06, X, 1060), konka: {pose: 84, x: CARD_X}, talk: true, card: [2, 'WORK ON', 'YOURSELF'], action: 'Chapter card. Konka arms crossed, pleased with himself.'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'Hit the gym.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 11, dy: (l) => (Math.floor(l * 4) % 2 ? -14 : 0)}, front: (l) => <Dumbbell x={X} y={(Math.floor(l * 4) % 2 ? 1255 : 1270)} />, action: 'Jump cut 1: squatting, heaving a dumbbell (it bobs on the beat).'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'Learn a skill.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 31, x: 430}, props: () => <Laptop x={760} y={FLOOR} view="side" />, action: 'Jump cut 2: on the floor at the laptop (side-on, screen toward him).'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'Build something.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 10, x: 420}, props: () => <Birdhouse x={800} y={FLOOR} />, action: 'Jump cut 3: kneeling, finishing a wonky birdhouse.'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'Give your brain something productive to obsess over.', size: 'CU', move: 'push-in', from: CU(), to: Z(2.8, X, 850), konka: {pose: 23}, talk: true, action: 'Close-up: total focus, brow down.'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: 'And no, doing three push-ups', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 9, x: STAR === 'ebo' ? 130 : X, dy: (l) => (step(l, [0.5, 1.0, 1.5]) % 2 ? 20 : 0)}, text: (l) => (
    <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={C.ink}>
      {['', '1…', '1… 2…', '1… 2… 3.'][step(l, [0.5, 1.0, 1.5])]}
    </text>
  ), action: 'Three push-up dips on the counts, then he stays down.'},
  {section: 'STEP 2 — WORK ON YOURSELF', line: "and checking your abs in the mirror doesn't count as a transformation.", size: 'FULL', move: 'static', from: FULL(), konka: {pose: 86, x: 400}, props: () => <Mirror x={790} y={FLOOR - 40} />, action: 'From behind, at the mirror, admiring his round tummy.'},
  // ═════ STEP 3 ═════
  {section: 'STEP 3 — CONTROL YOUR MIND', line: 'Third, stop entertaining every thought that enters your head.', size: 'FULL', move: 'push-in', from: FULL(), to: Z(1.06, X, 1060), konka: {pose: 78, x: CARD_X}, talk: true, card: [3, 'CONTROL', 'YOUR MIND'], action: 'Chapter card. Konka, finger up, arms crossed.'},
  {section: 'STEP 3 — CONTROL YOUR MIND', line: "Just because your brain suggests something doesn't mean you have to follow through.", size: 'MS', move: 'static', from: MS(), konka: {pose: 54, x: 460}, talk: true, props: (l) => (l > 0.4 ? <Thought x={600} y={1010} text="?!" /> : null), action: 'A thought bubble pops up by his head; he holds up a flat hand to it: no.'},
  {section: 'STEP 3 — CONTROL YOUR MIND', line: 'Your brain also tells you to eat an entire pizza at midnight.', size: 'FULL', move: 'static', from: FULL(), night: true, konka: {pose: 27, x: 470}, props: () => <Pizza x={780} y={FLOOR} />, action: 'Night (the backdrop goes dark): Konka on the floor with an entire pizza, delighted.'},
  {section: 'STEP 3 — CONTROL YOUR MIND', line: "Doesn't mean it's a genius.", size: 'ECU', move: 'snap-zoom', from: CU(), to: ECU(), night: true, konka: {pose: 8}, action: 'Mid-bite freeze, guilty side-eye to the lens.'},
  // ═════ STEP 4 ═════
  {section: 'STEP 4 — AVOID YOUR TRIGGERS', line: 'Fourth, stop feeding the temptation.', size: 'FULL', move: 'push-in', from: FULL(), to: Z(1.06, X, 1060), konka: {pose: 39, x: CARD_X}, talk: true, card: [4, 'AVOID YOUR', 'TRIGGERS'], action: 'Chapter card. Konka explaining.'},
  {section: 'STEP 4 — AVOID YOUR TRIGGERS', line: 'You know that account you keep checking?', size: 'INSERT', move: 'static', from: Z(1, 540, 960), front: (_l, f) => <PhoneInsert x={540} y={980} screen="profile" t={f} skin={STAR === 'ebo' ? SKIN : KONKA_SKIN} />, action: 'Insert (its own drawing): big hand, phone tilted, an account page (no photos, just tiles). Thumb hovers.'},
  {section: 'STEP 4 — AVOID YOUR TRIGGERS', line: 'Yeah. That one.', size: 'CU', move: 'static', from: CU(), konka: {pose: 79}, talk: true, action: 'Caught. Nervous grin, hands together.'},
  {section: 'STEP 4 — AVOID YOUR TRIGGERS', line: 'Unfollow it.', size: 'INSERT', move: 'static', from: Z(1, 540, 960), front: (l, f) => <PhoneInsert x={540} y={980} screen={l < 0.45 ? 'profile' : 'unfollow'} t={f} skin={STAR === 'ebo' ? SKIN : KONKA_SKIN} />, action: 'Insert: the thumb taps; FOLLOWING flips to FOLLOW.'},
  {section: 'STEP 4 — AVOID YOUR TRIGGERS', line: "You can't complain about being distracted while deliberately surrounding yourself with distractions.", size: 'FULL → WIDE', move: 'pull-out', from: FULL(), to: WIDE(), konka: {pose: 33},
    props: (_l, f) => <>{[[-330, -20], [-200, 14], [200, -12], [330, 18], [-90, 28]].map(([dx, r], i) => <BigPhone key={i} x={X + dx} y={FLOOR - 70} rotate={r} screen="scroll" t={f + i * 3} />)}</>,
    action: 'Pull out: Konka on the floor, hands up, surrounded by five phones all showing feeds.'},
  // ═════ STEP 5 ═════
  {section: 'STEP 5 — BUILD DISCIPLINE', line: 'Finally, practice self-discipline.', size: 'FULL', move: 'push-in', from: FULL(), to: Z(1.06, X, 1060), konka: {pose: 38, x: CARD_X}, talk: true, card: [5, 'BUILD', 'DISCIPLINE'], action: 'Chapter card. Konka, smug finger.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: 'Start small.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 1, x: 500, dy: () => 0}, action: 'Jump cut 1: one tiny step forward. Proud.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: 'Set boundaries.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 77}, props: () => <ChalkLine x={X} y={FLOOR + 30} />, action: 'Jump cut 2: he stands behind a chalk line on the floor, arms crossed.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: 'Stick to a routine.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 3, x: 380}, props: () => <Checklist x={780} y={900} />, action: 'Jump cut 3: he points at a routine checklist, three ticks.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: 'And remember, feeling attraction is completely normal.', size: 'MS', move: 'static', from: MS(), konka: {pose: 57}, talk: true, action: 'Sincere beat: relaxed open shrug, warm smile.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: "The goal isn't to become a robot.", size: 'MS', move: 'static', from: MS(), konka: {pose: 62}, talk: true, action: 'Gag: Konka goes stiff as a robot, blank eyes. Held.'},
  {section: 'STEP 5 — BUILD DISCIPLINE', line: "It's to stop letting every passing impulse make your decisions.", size: 'WIDE', move: 'static', from: WIDE(560), konka: {pose: 31, x: 380}, christy: {x0: -350, dir: 1}, props: () => <Laptop x={720} y={FLOOR} view="side" />, action: 'Callback to shot 2: Christy walks past again. This time he stays on his work. Small smile.'},
  // ═════ THE ENDING ═════
  {section: 'THE ENDING', line: "Because if you can't control your attention...", size: 'MS → CU', move: 'push-in', from: MS(), to: CU(), konka: {pose: 72}, talk: true, action: 'Slow push-in on Konka, calm, serious, to the lens.'},
  {section: 'THE ENDING', line: 'Something else will.', size: 'FULL', move: 'static', from: FULL(), konka: {pose: 72, x: 400, then: [{at: 0.7, pose: 66}]}, props: (l, f) => <BigPhone x={800} y={FLOOR - 30} rotate={-70} screen={l < 0.5 ? 'off' : 'scroll'} t={f} />, action: 'His phone lights up on the floor. His head turns to it on its own. Cut to black.'},
];

/**
 * The "tracker" look (after the reference Short the user loves): a row of five step badges at
 * the top that light up one by one (the last stays a "?" until its step), one short idea line
 * above it instead of word-by-word captions, and chest-up framing whenever the star talks to us.
 * The tracker does the chapter cards' job, so there are no big title cards.
 */
const BUST = (cx = X) => Z(1.8, cx, 980);
const IDEAS = [
  "Can't control your lust?", 'One person walks past…', 'Hormones: now in charge.',
  '#1 Find your purpose', 'Seriously.', 'Want something real', 'Bored brain = bad ideas',
  '#2 Work on yourself', 'Gym', 'Skill', 'Build', 'Obsess over progress', '3 push-ups…', '…is not a glow-up',
  '#3 Control your mind', 'A thought is not an order', 'The midnight pizza idea', 'Not a genius.',
  '#4 Avoid your triggers', 'That account?', 'Yeah. That one.', 'Unfollow.', 'Distracted… by choice',
  '#5 Build discipline', 'Start small', 'Set boundaries', 'Keep a routine', 'Attraction is normal', 'Not a robot',
  "Impulses don't decide", 'Control your attention…', '…or something else will.',
];
/** Lines whose camera move the script calls for (the move is the joke). */
const CAMERA_CALLED = ["You can't complain about being distracted"];
K01_PLAN.forEach((sh, i) => {
  sh.idea = IDEAS[i];
  if (sh.card) {
    sh.card = undefined;
    sh.from = BUST();
    sh.to = undefined;
    sh.move = 'static';
    sh.size = 'BUST';
    if (sh.konka) sh.konka.x = X;
  } else if (sh.talk && (sh.size === 'MS' || sh.size === 'MS → CU')) {
    sh.from = BUST();
    sh.to = sh.move === 'push-in' ? Z(2.2, X, 900) : undefined;
    sh.size = 'BUST';
  }
  // the camera holds still unless the script calls for a move (the user's note): only the
  // pull-out that reveals the phones all around him stays. A snap-zoom keeps its punch framing.
  if (sh.move !== 'static' && !CAMERA_CALLED.some((c) => sh.line.startsWith(c))) {
    if (sh.move === 'snap-zoom' && sh.to) sh.from = sh.to;
    sh.to = undefined;
    sh.move = 'static';
  }
});
const stepOf = (sec: string) => (sec.startsWith('STEP ') ? +sec[5] : sec === 'THE ENDING' ? 6 : 0);

/** The step tracker: five badges, grey "?" until their step begins, then their colour and icon. */
const BADGES: {color: string; icon: React.ReactNode}[] = [
  {color: '#F3C53F', icon: <g><circle r={30} fill="#fff" /><circle r={20} fill="#E5484D" /><circle r={10} fill="#fff" /><circle r={4} fill="#E5484D" /></g>},
  {color: '#E5484D', icon: <g><rect x={-26} y={-5} width={52} height={10} fill="#fff" /><rect x={-34} y={-16} width={12} height={32} rx={3} fill="#fff" /><rect x={22} y={-16} width={12} height={32} rx={3} fill="#fff" /></g>},
  {color: '#8F6BD1', icon: <g fill="#fff"><circle cx={-12} cy={-6} r={16} /><circle cx={12} cy={-6} r={16} /><circle cx={-8} cy={10} r={13} /><circle cx={9} cy={10} r={13} /><path d="M 0 -20 L 0 22" stroke="#8F6BD1" strokeWidth={4} /></g>},
  {color: '#3B82F6', icon: <g><rect x={-15} y={-26} width={30} height={52} rx={6} fill="#fff" /><path d="M -26 26 L 26 -26" stroke={C.ink} strokeWidth={7} strokeLinecap="round" /></g>},
  {color: '#45B69C', icon: <g><rect x={-26} y={-22} width={52} height={46} rx={6} fill="#fff" /><rect x={-26} y={-22} width={52} height={12} fill={C.ink} /><path d="M -12 6 l 9 9 l 17 -19" stroke="#45B69C" strokeWidth={7} fill="none" strokeLinecap="round" /></g>},
];
const Tracker: React.FC<{step: number; t: number; start: number}> = ({step, t, start}) => (
  <g>
    {BADGES.map((b, i) => {
      const n = i + 1;
      const lit = n <= step;
      const x = 540 + (i - 2) * 190;
      const fresh = n === step && t - start < 0.4; // drops in when its step begins
      const dy = fresh ? -60 * Math.max(0, 1 - (t - start) / 0.17) : 0;
      return (
        <Still key={i}>
        <g transform={`translate(${x} ${330 + dy})`}>
          {n === step && <circle r={80} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="10 10" />}
          <circle r={66} fill={lit ? b.color : '#C9C2D6'} stroke={C.ink} strokeWidth={7} />
          <g transform="scale(1.15)">
          {lit ? b.icon : <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill="#fff">?</text>}
          </g>
          <text y={-88} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={lit ? C.red : '#9C94AA'}>
            #{n}
          </text>
        </g>
        </Still>
      );
    })}
  </g>
);

/** The idea line: one short sentence at the top, the shot's point (not the transcript). */
const Idea: React.FC<{text: string; night?: boolean}> = ({text, night}) => (
  <Still>
  <text x={540} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={text.length > 22 ? 62 : 74} fill={night ? '#F4F0FC' : C.ink}>
    {text}
  </text>
  </Still>
);

/** Shot timing: each shot starts on the first word of its line (letter-level match to the voice). */
const norm = (t: string) => t.toLowerCase().replace(/[^a-z]/g, '');
const k01Times = () => {
  const owner: number[] = [];
  WORDS.forEach((w, i) => norm(w.w).split('').forEach(() => owner.push(i)));
  let pos = 0;
  const starts = K01_PLAN.map((sh) => {
    const st = WORDS[owner[Math.min(pos, owner.length - 1)]].s;
    pos += norm(sh.line).length;
    return Math.max(0, st - 0.08);
  });
  starts[0] = 0;
  const end = WORDS[WORDS.length - 1].e + 1.0;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : end) - st}));
};
const TIMES = k01Times();
export const K01_DURATION = Math.ceil((TIMES[TIMES.length - 1].start + TIMES[TIMES.length - 1].length) * VFPS);
export const K01_SHOT_TIMES = TIMES.map((x) => x.start);
export const k01ShotIndexAt = (f: number) => {
  const t = f / VFPS;
  let idx = 0;
  for (let i = 0; i < TIMES.length; i++) if (t >= TIMES[i].start) idx = i;
  return idx;
};

const shotCamera = (t: number, start: number, length: number, s: Shot): Framing => {
  if (!s.to) return s.from;
  const moves: CamMove[] = [];
  if (s.move === 'snap-zoom') moves.push([start + Math.min(0.3, length * 0.25), s.to, 0.18, 'whip']);
  else if (s.move === 'pan') moves.push([start + 0.1, s.to, Math.max(0.6, Math.min(length - 0.2, 1.6)), 'ease']);
  else moves.push([start, s.to, Math.max(0.5, length * 0.9), 'ease']);
  return camera(t, s.from, moves);
};

/** The chapter card text (above Konka's head; the caption sits at the top). */
const Card: React.FC<{card: [number, string, string]; t: number; start: number}> = ({card, t, start}) => (
  <g>
    <Slam t={t} at={start} dist={-160} twist={-4}>
      <text x={90} y={330} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red} letterSpacing={8}>
        STEP {card[0]}
      </text>
    </Slam>
    <Slam t={t} at={start + 0.12} dist={-300} twist={-8}>
      <text x={84} y={440} fontFamily={FONT} fontWeight={900} fontSize={112} fill={C.ink}>
        {card[1]}
      </text>
      <text x={84} y={556} fontFamily={FONT} fontWeight={900} fontSize={112} fill={C.ink}>
        {card[2]}
      </text>
      <rect x={92} y={590} width={220} height={18} rx={9} fill={C.red} />
    </Slam>
  </g>
);

export const K01Frame: React.FC<{f: number}> = ({f}) => {
  const t = f / VFPS;
  const i = k01ShotIndexAt(f);
  const s = K01_PLAN[i];
  const {start, length} = TIMES[i];
  const local = t - start;
  const k = s.konka;
  const pose = k ? (k.then ?? []).reduce((p, th) => (local >= th.at ? th.pose : p), k.pose) : 0;
  const end = TIMES[TIMES.length - 1];
  const black = i === K01_PLAN.length - 1 && t > end.start + end.length - 0.5;
  return (
    <StageSizeContext.Provider value={{w: K01_W, h: K01_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage
              framing={shotCamera(t, start, length, s)}
              bg={s.night ? '#2E2848' : '#D2C4EE'}
              blurBg={<Backdrop night={s.night} />}
              overlay={
                <g>
                  {s.card && <Card card={s.card} t={t} start={start} />}
                  {s.idea && <Idea text={s.idea} night={s.night} />}
                  {s.section !== 'THE ENDING' || local < length - 0.6 ? <Tracker step={stepOf(s.section)} t={t} start={TIMES[K01_PLAN.findIndex((p) => p.section === s.section)].start} /> : null}
                  {s.text && <Still>{s.text(local)}</Still>}
                </g>
              }
            >
              {s.christy && (
                <RigCharacter who="christy" x={s.christy.x0 + s.christy.dir * local * cycleSpeed('christy', 'walk') * 2.3} y={FLOOR - 40} scale={2.3} facing={s.christy.dir} t={f} pose={{...POSES.standing, eyes: 'open', mouth: 'smile'}} cycle="walk" />
              )}
              {(() => {
                const act = STAR === 'ebo' ? EBO_ACT[i]?.(local, f) : undefined;
                return (
                  <>
                    {!act?.replace && s.props?.(local, f)}
                    {act?.props}
                  </>
                );
              })()}
              {k && STAR === 'ebo' && (
                <RigCharacter
                  who="ebo"
                  x={(k.x ?? X) + (EBO_ACT[i]?.(local, f).dx ?? 0)}
                  y={FLOOR + (STAR === 'ebo' && EBO_ACT[i] ? 0 : k.dy?.(local) ?? 0) - (EBO[pose].tilt < -45 ? LIE_Y * EBO_SCALE : 0)}
                  scale={EBO_SCALE}
                  facing={k.facing ?? 1}
                  t={f}
                  pose={gentle(EBO_ACT[i]?.(local, f).pose ?? EBO[pose])}
                  mouthFrame={s.talk ? lipFrame(ENV, WORDS, f) : undefined}
                  noBlink={EBO[pose].eyes === 'closed' || EBO[pose].eyes === 'squeeze'}
                >
                  {EBO_ACT[i]?.(local, f).hold}
                </RigCharacter>
              )}
              {k && STAR === 'konka' && (
                <PoseCharacter who="konka" pose={pose} x={k.x ?? X} y={FLOOR + (k.dy?.(local) ?? 0)} facing={k.facing ?? 1} t={f} lip={s.talk ? lipFrame(ENV, WORDS, f) : undefined} look={k.look} />
              )}
              {!(STAR === 'ebo' && EBO_ACT[i]?.(local, f).replace) && s.front?.(local, f)}
            </VStage>
            {black && <AbsoluteFill style={{background: '#000'}} />}
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const KonkaShort01: React.FC<{layer?: LayerMode}> = ({layer = 'full'}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <K01Frame f={f} />
      {layer === 'full' && <Html5Audio src={staticFile(VOICE.audio)} />}
    </LayerModeContext.Provider>
  );
};
