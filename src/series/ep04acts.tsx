import React from 'react';
import {Pose} from '../components/Character';
import {Remote, Easel, Notebook, Brush} from '../components/StayPoorProps';
import {Sticky, Cereal, Chips, Letter, MondayPad} from '../components/StayBrokeProps';
import {FLOOR_Y} from '../backgrounds/Backgrounds';
import {G, drop, beat} from './kit';

/**
 * Episode 4 — Ebo handles the props (house rule 10, and the note on Short 01: props he
 * interacts with, that feel tangible). Keyed by the shot's line. Per shot: his pose over time
 * (`pose` gets the plan's pose to build on), what is in his hand (it follows his grip), and props
 * that react: things fall with gravity and bounce once, get slapped, tipped, flipped or ticked.
 * What he holds is drawn in his hand's space (world px, turned with the forearm), so a falling
 * held prop counter-turns its fall to drop straight down (`fall`).
 */
export type Ep04Act = {pose?: Pose; x?: number; hold?: React.ReactNode | null; props?: React.ReactNode; replace?: boolean};
type ActFn = (local: number, f: number, base: Pose) => Ep04Act;

/** The held prop's turn with the forearm (RigCharacter's holdRot). */
const holdRot = (p: Pose) => 0.6 * (40 - (p.armR[0] + p.armR[1]));
/** A straight-down offset `d` in the hand's (turned) space: [x, y] to add to the held prop. */
const fall = (p: Pose, d: number): [number, number] => {
  const a = (holdRot(p) * Math.PI) / 180;
  return [d * Math.sin(a), d * Math.cos(a)];
};
/** Typing: the hands alternate on the keys (every 4 frames). */
const typing = (f: number, base: Pose): Pose => ({...base, armR: f % 8 < 4 ? [70, -60] : [74, -48], armL: f % 8 < 4 ? [58, -62] : [54, -72]});
/** A tipping-over angle from t0 (pivot on its bottom edge), landing flat at 90° with one rebound. */
const tip = (local: number, t0: number) => {
  if (local < t0) return 0;
  const t = local - t0;
  const tHit = 0.32;
  if (t < tHit) return 90 * (t / tHit) ** 2;
  const u = (t - tHit) / 0.16;
  return u < 1 ? 90 - 14 * 4 * u * (1 - u) : 90;
};

const DESK = FLOOR_Y - 250; // the desk top in the work room (the notebook and pad stand on it)

export const EP04_ACTS: Record<string, ActFn> = {
  // the blank CV: shown to us… then flicked over his shoulder; it sails up and back and drops out of frame
  "You don't need experience.": (l, _f, b) => {
    const t0 = 0.55;
    if (l < t0) return {};
    const p: Pose = {...b, armR: [150, -20]};
    const t = l - t0;
    return {pose: p, hold: <Letter label="CV: BLANK" x={-1100 * t} y={-1300 * t + 0.5 * G * t * t} rotate={-8 - 600 * t} />};
  },
  // bedroom: the remote clicks, a jab of the thumb on every beat
  'Television.': (l, _f, b) => (b.tilt === -90
    ? {hold: <Remote rotate={beat(l, 0.3) % 2 ? -32 : -20} />}
    // kitchen: the bowl tips in his hand as his eyes slide to the TV (the spoon rattles)
    : {hold: <Cereal x={0} y={-10} />}),
  // breakfast: bowl in hand, spooning — the bowl bobs on every spoonful while his eyes drift
  'Eating breakfast?': (l, _f, b) => {
    const up = beat(l, 0.45) % 2 === 1;
    return {pose: {...b, armR: up ? [80, -36] : [70, -20], mouth: up ? 'o' : 'flat'}, hold: <Cereal y={-10} />};
  },
  // the brush: lifted, looked at… and dropped on the shrug; it hits the floor and bounces once
  'Drawing? Too much effort.': (l, _f, b) => {
    const t0 = 0.65;
    const p: Pose = l < t0 ? {...b, armR: [70, -20], armL: [12, 6], mouth: 'flat'} : {...b, armR: [70, -20]};
    const [dx, dy] = fall(p, drop(l, t0, 150));
    return {pose: p, hold: <Brush x={dx} y={dy} rotate={l < t0 ? -30 : -30 + Math.min(70, (l - t0) * 400)} />};
  },
  // the notebook: one poke and it tips over flat on the desk
  'Writing? Sounds exhausting.': (l, _f, b) => {
    const poke = l > 0.5 && l < 0.8;
    const a = tip(l, 0.6);
    return {
      x: 700,
      pose: poke ? {...b, armR: [92, -4], mouth: 'flat'} : b,
      props: (
        // tips about its bottom-right corner (60, 80): written out so the export keeps it as the notebook's own matrix
        <Notebook x={900 + 60 - 60 * Math.cos((a * Math.PI) / 180) + 80 * Math.sin((a * Math.PI) / 180)} y={DESK - 80 + 80 - 80 * Math.cos((a * Math.PI) / 180) - 60 * Math.sin((a * Math.PI) / 180) + 0} rotate={a} lines={0} />
      ),
      replace: true,
    };
  },
  // the idea: sticky in his raised hand… SLAPPED on the wall, where it settles (one wobble)
  'Got an idea?': (l, _f, b) => {
    const t0 = 0.4;
    if (l < t0) return {x: 620, pose: {...b, armR: [125, -40]}, hold: <Sticky x={90} y={-30} text="APP IDEA" rotate={-6} />, replace: true};
    const k = l - t0;
    const rot = k < 0.07 ? -16 : k < 0.17 ? 2 : -6;
    return {x: 640, pose: {...b, armR: k < 0.3 ? [96, 8] : b.armR}, props: <Sticky x={830} y={520} text="APP IDEA" rotate={rot} />, replace: true};
  },
  // …it peels off the wall, falls, bounces once on the floor and lies there
  'Forget it.': (l) => {
    const t0 = 0.05;
    const y = 500 + drop(l, t0, FLOOR_Y - 20 - 500);
    const rot = l < t0 ? -6 : Math.min(84, -6 + (l - t0) * 260);
    return {props: <Sticky x={830 + Math.min(60, Math.max(0, l - t0) * 120)} y={y + 20} text="APP IDEA" rotate={rot} />, replace: true};
  },
  // he reaches over and flips the pad to next week; it jolts under his hand
  'well, obviously, you meant next Monday.': (l, _f, b) => {
    const reach = l > 0.45 && l < 0.8;
    const flipped = l >= 0.6;
    const jolt = l >= 0.6 && l < 0.67 ? 6 : 0;
    return {x: 680, pose: reach ? {...b, armR: [100, -10], armL: [12, 6]} : b, props: <MondayPad x={900} y={FLOOR_Y - 340 + jolt} week={flipped ? 3 : 2} />, replace: true};
  },
  // the imagined rejection: on the flinch it slips out of his fingers
  'What if they reject you?': (l, _f, b) => {
    const p: Pose = {...b, armR: [112, -40]};
    const [dx, dy] = fall(p, drop(l, 0.45, 300));
    return {pose: p, hold: <Letter x={dx} y={dy} rotate={-10 + Math.min(40, Math.max(0, l - 0.45) * 200)} />};
  },
  // comfort zone: munching — the bag comes up to his mouth on every bite
  'Besides… your comfort zone has snacks.': (l, _f, b) => {
    const up = beat(l, 0.4) % 2 === 1;
    return {pose: {...b, armR: up ? [80, -50] : b.armR, mouth: up ? 'laugh' : 'grin', eyes: up ? 'happy' : b.eyes}, hold: <Chips rotate={up ? -24 : -10} />};
  },
  // the planner: one shove and it slides away along the desk, slowing to a stop
  "Don't make a plan.": (l, _f, b) => {
    const k = Math.min(1, Math.max(0, (l - 0.35) / 0.35)); // shoved at 0.35, sliding to a stop (friction)
    const push = l > 0.3 && l < 0.6;
    return {x: 640, pose: push ? {...b, armR: [92, -6], tilt: 5} : b, props: <Notebook x={850 + 150 * (1 - (1 - k) ** 2)} y={FLOOR_Y - 330} rotate={k > 0 && k < 1 ? 4 : 0} lines={0} />, replace: true};
  },
  // typing at the desk: hands alternate on the keys
  'Supposed to be working on something important?': (_l, f, b) => ({pose: typing(f, b)}),
  'Never try learning something difficult.': (l, f, b) => ({pose: beat(l, 0.9) % 2 ? b : typing(f, b)}), // slow: stop, stare, peck
  'Start the Monday project today.': (_l, f, b) => ({pose: typing(f, b)}),
  // the recap: actually painting — brush strokes, and the canvas fills stroke by stroke
  'Pick one hobby.': (l, _f, b) => {
    const n = beat(l, 0.35);
    return {pose: {...b, armR: n % 2 ? [96, -10] : [104, -34]}, hold: <Brush rotate={-50} />, props: <Easel x={1000} y={FLOOR_Y} done={Math.min(1, 0.5 + 0.13 * n)} />, replace: true};
  },
  // all better: remote in hand, clicking
  "And we certainly can't have that.": (l) => ({hold: <Remote rotate={beat(l, 0.35) % 2 ? -32 : -20} />}),
};
