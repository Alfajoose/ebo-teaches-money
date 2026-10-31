import React from 'react';
import {CastId} from '../cast/castConfig';
import {CycleName} from '../cast/cycles';
import {POSES, Pose} from '../components/Character';
import {DollarBill} from '../components/Money';
import {Calendar} from '../components/Props';
import {HandPhone, Sneakers} from '../components/FlipProps';
import {Popcorn, Remote, Laptop, Easel, Brush, HamsterWheel, CrystalBall, Candle, Ticket, Notebook} from '../components/StayPoorProps';
import {FLOOR_Y, Bedroom, Office} from '../backgrounds/Backgrounds';
import {SITTING} from '../castep/shared';
import {Studio, LivingRoom, SneakerRoom, Table} from './sets';
import {Framing, Word, makeAt} from './kit';
import wordsJson from './data/ep03-words.json';

/**
 * EPISODE 3 — SHOT PLAN (pre-production). One entry per shot, keyed to the voiceover.
 * Reviewed as a storyboard (Ep03-Storyboard composition → episodes/ep03/storyboard) and as
 * a shot list (episodes/ep03/shotlist.md), approved before animating. The animation is
 * then built from this same plan.
 */

const at = makeAt(wordsJson as Word[]);

// ───────────────────────── vocabulary ─────────────────────────

export type SetKey = 'chapter' | 'green' | 'studio' | 'living' | 'livingOff' | 'christyRoom' | 'micaRoom' | 'pinkRoom' | 'magicRoom' | 'bedroom' | 'office' | 'sneakers';
export type Move = 'static' | 'push-in' | 'pull-out' | 'pan' | 'whip-pan' | 'snap-zoom' | 'follow' | 'drift';

export type Placed = {who: CastId | 'ebo'; x: number; y?: number; seat?: boolean; pose: Pose; facing?: 1 | -1; hold?: React.ReactNode; cycle?: CycleName};

export type PlanShot<K extends string = SetKey> = {
  /** where the shot starts: a phrase in the voiceover (and which occurrence) */
  cue: [string, number?];
  line: string;
  size: string;
  move: Move;
  from: Framing;
  to?: Framing;
  set: K;
  cast: Placed[];
  props?: React.ReactNode;
  text?: string;
  action: string;
  out?: string;
};

export const Z = (zoom: number, cx: number, cy: number): Framing => ({zoom, cx, cy});
// shot sizes at 1920×1080 (world coords: floor y = 900; standing heads ≈ 480, seated ≈ 440)
export const EWS = (cx: number, cy = 560) => Z(0.85, cx, cy);
export const WS = (cx: number, cy = 600) => Z(1.0, cx, cy);
export const MS = (cx: number, cy = 600) => Z(1.55, cx, cy);
export const CU = (cx: number, cy = 480) => Z(2.6, cx, cy);
export const ECU = (cx: number, cy = 500) => Z(4.2, cx, cy);

const SEAT_Y = FLOOR_Y - 110;
export const P: Record<string, Pose> = {
  idle: {...POSES.standing, armL: [10, 6], armR: [12, 8]},
  point: {...POSES.standing, armR: [95, -8], armL: [12, 6], brows: 'up'},
  present: {...POSES.standing, armR: [70, -35], armL: [18, 10], brows: 'up'},
  raise: {...POSES.standing, armR: [165, 0], armL: [12, 6], brows: 'up'},
  open: {...POSES.standing, armL: [62, -30], armR: [62, -30]},
  hips: {...POSES.standing, armL: [38, -110], armR: [38, -110], brows: 'up'},
  shrug: {...POSES.standing, armL: [72, -72], armR: [72, -72], headTilt: 8, brows: 'up'},
  hold: {...POSES.standing, armR: [70, -20], armL: [14, 8]},
  celebrate: {...POSES.celebrate, lift: -30},
  sit: {...SITTING, armR: [55, -45], armL: [20, 10]},
  slouch: {...POSES.disappointed, eyes: 'half', mouth: 'flat'},
  sleep: {...POSES.sleeping},
  pointing: {...POSES.pointing},
};
export const pose = (p: string, eyes: Pose['eyes'], extra: Partial<Pose> = {}): Pose => ({...P[p], eyes, ...extra});

const E = 760; // Ebo's mark

// ───────────────────────── the plan ─────────────────────────

export const EP03_PLAN: PlanShot[] = [
  // ═════ HOOK ═════
  {cue: ['Want'], line: 'Want to stay poor forever?', size: 'EWS → MS', move: 'push-in', from: EWS(E - 300), to: Z(1.9, E - 240, 570), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('point', 'squint', {mouth: 'smirk'})}], text: 'HOW TO STAY / POOR (slams on "stay", "poor")', action: 'Ebo alone in the dark room, pointing at us. Slow push-in.', out: 'cut'},
  {cue: ['Good news'], line: "Good news. It's easy.", size: 'CU', move: 'static', from: CU(E), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('shrug', 'happy', {mouth: 'grin'})}], action: 'Big grin, shrug: "easy".', out: 'cut'},
  {cue: ['Just'], line: 'Just follow these six habits.', size: 'WS', move: 'pan', from: Z(1.4, 660, 560), to: Z(1.4, 1500, 560), set: 'studio', cast: [{who: 'ebo', x: 520, pose: pose('present', 'happy')}, {who: 'ama', x: 1000, pose: pose('slouch', 'half'), facing: -1}, {who: 'christy', x: 1260, pose: pose('hips', 'squint', {mouth: 'flat'}), facing: -1}, {who: 'mica', x: 1520, pose: pose('slouch', 'half'), facing: -1}, {who: 'obuor', x: 1780, pose: pose('shrug', 'half', {mouth: 'flat'}), facing: -1}], action: 'Ebo presents; the camera pans right along the cast, each in a lazy pose.', out: 'cut'},
  {cue: ['And if'], line: "And if you'd rather get rich...", size: '2S, MS', move: 'snap-zoom', from: MS(1400), to: Z(2.2, 1405, 480), set: 'studio', cast: [{who: 'christy', x: 1290, pose: pose('idle', 'wide', {mouth: 'o'}), facing: -1}, {who: 'mica', x: 1520, pose: pose('idle', 'dollar', {mouth: 'grin'}), facing: -1}], action: 'Reaction: Christy and Mica perk up at "rich".', out: 'cut'},
  {cue: ['do the exact'], line: 'do the exact opposite.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'happy', {mouth: 'grin'})}], action: 'Ebo points straight at us.', out: 'cut to chapter'},

  // ═════ WATCH TV ALL DAY ═════
  {cue: ['Watch'], line: 'Watch TV all day.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('hips', 'half', {mouth: 'smirk'}), hold: <Remote rotate={-20} />}], text: 'HOW TO STAY POOR / WATCH TV ALL DAY', action: 'Chapter card. Ebo holds a remote, smug.', out: 'cut'},
  {cue: ['The average'], line: 'The average person watches almost three hours a day.', size: 'EWS', move: 'push-in', from: EWS(820), to: MS(700, 560), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat', lookX: -14}), hold: <Popcorn y={60} />}], action: 'Establishing: living room, TV on, Ama sinking into the couch. Slow push.', out: 'cut'},
  {cue: ["That's over"], line: "That's over a thousand hours a year.", size: 'ECU TV → CU Ama', move: 'pan', from: Z(3.0, 60, 620), to: Z(2.6, 760, 440), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat', lookX: -14}), hold: <Popcorn y={60} />}], action: 'Start on the glowing TV screen, pan to Ama staring at it.', out: 'cut'},
  {cue: ['A full-time'], line: 'A full-time job is about two thousand.', size: 'WS', move: 'static', from: WS(1400), set: 'office', cast: [{who: 'mica', x: 1300, pose: pose('hold', 'squint', {mouth: 'flat', armR: [95, -30]})}], action: 'Cutaway: Mica busy at a desk — what a full work year looks like.', out: 'cut'},
  {cue: ['So'], line: "So you're spending half a work year...", size: 'ECU calendar → MS', move: 'pull-out', from: Z(3.4, 1300, 300), to: WS(880), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat'}), hold: <Remote rotate={-20} />}], props: <Calendar x={1300} y={300} day={14} month="JUN" />, action: 'Calendar pages flip; pull out — Ama hasn\'t moved.', out: 'cut'},
  {cue: ['on the couch'], line: 'on the couch.', size: 'CU', move: 'snap-zoom', from: CU(760, 440), to: ECU(760, 440), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'happy', {mouth: 'grin'}), hold: <Popcorn y={60} />}], action: 'Reaction: Ama, mouth full of popcorn.', out: 'cut'},
  {cue: ['Ama has'], line: 'Ama has seen every episode of everything.', size: 'MS', move: 'static', from: MS(840, 560), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'happy', {mouth: 'grin', armR: [140, -10]}), hold: <Remote rotate={-20} />}], action: 'Ama raises the remote like a trophy.', out: 'cut'},
  {cue: ['Her bank'], line: 'Her bank account has seen nothing.', size: 'CU → ECU', move: 'snap-zoom', from: CU(760, 440), to: ECU(760, 440), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'sad', {mouth: 'frown', armR: [80, -40]}), hold: <HandPhone screen="off" rotate={-8} />}], action: 'Ama checks her banking app; snap-zoom on her face dropping at "nothing".', out: 'cut'},
  {cue: ['Flip it'], line: 'Flip it: take one hour back a day.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 60, 470), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'open')}], text: 'FLIP IT', action: 'Ebo turns sincere; push in on "one hour".', out: 'cut'},
  {cue: ["That's three"], line: "That's three hundred and sixty-five hours a year to learn a skill,", size: 'WS', move: 'pan', from: Z(1.6, 140, 520), to: WS(760), set: 'livingOff', cast: [{who: 'ama', x: 260, pose: pose('hold', 'happy', {mouth: 'smile'})}], props: <><Table x={520} w={460} /><Laptop x={520} y={FLOOR_Y - 250} screen="code" /></>, action: 'TV is off. Pan from the dark TV to Ama at a table with a laptop.', out: 'cut'},
  {cue: ['start a side'], line: 'start a side hustle, or build something people pay for.', size: 'ECU laptop → MS', move: 'pull-out', from: Z(3.6, 520, 580), to: MS(460, 580), set: 'livingOff', cast: [{who: 'ama', x: 260, pose: pose('hold', 'happy', {mouth: 'grin'})}], props: <><Table x={520} w={460} /><Laptop x={520} y={FLOOR_Y - 250} screen="shop" /></>, action: 'Start on the laptop: her own shop page. Pull out to a proud Ama.', out: 'cut to chapter'},

  // ═════ NO HOBBIES ═════
  {cue: ['Have no hobbies'], line: 'Have no hobbies.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('shrug', 'half', {mouth: 'smirk'})}], text: 'HOW TO STAY POOR / NO HOBBIES', action: 'Chapter card.', out: 'cut'},
  {cue: ['Hobbies are'], line: 'Hobbies are dangerous.', size: 'CU', move: 'static', from: CU(E + 10, 500), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('hips', 'wide', {mouth: 'o'})}], action: 'Mock-scared Ebo.', out: 'cut'},
  {cue: ['They make'], line: 'They make you good at things.', size: 'ECU', move: 'snap-zoom', from: CU(E + 10, 500), to: ECU(E, 510), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'squint', {mouth: 'smirk'})}], action: 'Snap-zoom on a suspicious squint (the joke lands).', out: 'cut'},
  {cue: ['Christy draws'], line: 'Christy draws every evening.', size: 'WS', move: 'static', from: WS(1000), set: 'christyRoom', cast: [{who: 'christy', x: 840, pose: pose('hold', 'happy', {mouth: 'smile', armR: [104, -30], lookX: 10}), hold: <Brush rotate={-30} />}], props: <Easel x={1130} y={FLOOR_Y} done={0.5} />, action: "Establishing: Christy's room, easel by the window, she paints.", out: 'cut'},
  {cue: ['every evening'], line: '(every evening)', size: 'ECU canvas', move: 'static', from: Z(3.0, 1130, 610), set: 'christyRoom', cast: [], props: <Easel x={1130} y={FLOOR_Y} done={0.75} />, action: 'Insert: the portrait builds up stroke by stroke (held, snappy).', out: 'cut'},
  {cue: ['Two years'], line: 'Two years later,', size: 'WS', move: 'follow', from: Z(1.25, 1250, 580), to: Z(1.25, 1010, 580), set: 'christyRoom', cast: [{who: 'christy', x: 760, pose: pose('present', 'happy', {mouth: 'grin'})}, {who: 'obuor', x: 1300, facing: -1, pose: pose('idle', 'open'), cycle: 'fastWalk'}], props: <Easel x={1000} y={FLOOR_Y} done={1} framed />, action: 'A framed portrait. Obuor (a buyer) fast-walks in; camera follows him.', out: 'cut'},
  {cue: ['people pay', 2], line: 'people pay her fifty dollars a portrait.', size: '2S, CU', move: 'push-in', from: Z(1.6, 1010, 540), to: Z(2.2, 960, 480), set: 'christyRoom', cast: [{who: 'christy', x: 760, pose: pose('hold', 'dollar', {mouth: 'grin'}), hold: <DollarBill scale={0.6} />}, {who: 'obuor', x: 1260, facing: -1, pose: pose('hold', 'happy', {mouth: 'smile'})}], props: <Easel x={1000} y={FLOOR_Y} done={1} framed />, action: 'The cash hand-off; Christy beams.', out: 'cut'},
  {cue: ['Mica'], line: 'Mica, meanwhile, scrolls.', size: 'MS → CU', move: 'push-in', from: MS(840, 560), to: ECU(760, 440), set: 'living', cast: [{who: 'mica', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat', armR: [62, -50]}), hold: <HandPhone screen="off" rotate={-8} />}], action: 'Mica slumped on the couch scrolling; slow, bored push to her face.', out: 'cut'},
  {cue: ['Same phone'], line: 'Same phone.', size: 'CU Mica', move: 'static', from: Z(2.2, 620, 540), set: 'studio', cast: [{who: 'mica', x: 620, pose: pose('hold', 'half', {mouth: 'flat'}), hold: <HandPhone screen="off" />}], action: 'Mica holds up her phone, blank face.', out: 'whip-pan right'},
  {cue: ['Different'], line: 'Different result.', size: 'CU Christy', move: 'whip-pan', from: Z(2.2, 620, 540), to: Z(2.2, 1300, 540), set: 'studio', cast: [{who: 'mica', x: 620, pose: pose('hold', 'half', {mouth: 'flat'}), hold: <HandPhone screen="off" />}, {who: 'christy', x: 1300, facing: -1, pose: pose('celebrate', 'dollar', {mouth: 'grin'})}], action: 'Whip-pan to Christy celebrating a sale on hers.', out: 'cut'},
  {cue: ['Flip it', 2], line: 'Flip it: pick one thing you enjoy making, fixing or doing.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 60, 470), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('open', 'open')}], text: 'FLIP IT', action: 'Ebo counts on his fingers: making, fixing, doing.', out: 'cut'},
  {cue: ['Do it'], line: 'Do it every week.', size: 'ECU canvas (×3 jump cuts)', move: 'static', from: Z(3.0, 1130, 610), set: 'micaRoom', cast: [], props: <Easel x={1130} y={FLOOR_Y} done={0.25} />, action: 'Three quick jump cuts of Mica\'s canvas getting further each week.', out: 'cut'},
  {cue: ['Skills'], line: 'Skills grow quietly... then they start paying.', size: 'WS → 2S', move: 'follow', from: WS(1000), to: Z(1.8, 1000, 520), set: 'micaRoom', cast: [{who: 'mica', x: 840, pose: pose('hold', 'dollar', {mouth: 'grin'}), hold: <DollarBill scale={0.6} />}, {who: 'christy', x: 1260, facing: -1, cycle: 'fastWalk', pose: pose('idle', 'happy')}], props: <Easel x={1130} y={FLOOR_Y} done={1} />, action: 'Mica paints; on "paying" Christy fast-walks in and buys it.', out: 'cut to chapter'},

  // ═════ NO PASSION ═════
  {cue: ['Have no passion'], line: 'Have no passion.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('slouch', 'half', {mouth: 'flat'})}], text: 'HOW TO STAY POOR / NO PASSION', action: 'Chapter card. Ebo slouches.', out: 'cut'},
  {cue: ['Wake'], line: 'Wake up,', size: 'WS', move: 'static', from: WS(900), set: 'bedroom', cast: [{who: 'obuor', x: 560, pose: pose('idle', 'half', {mouth: 'o', armR: [150, -20]})}], action: 'Bedroom. Obuor stretches and yawns.', out: 'cut'},
  {cue: ['do the minimum'], line: 'do the minimum,', size: 'MS', move: 'static', from: MS(620), set: 'bedroom', cast: [{who: 'obuor', x: 560, pose: pose('slouch', 'half')}], action: 'Slouched, dead-eyed.', out: 'cut'},
  {cue: ['go back'], line: 'go back to sleep.', size: 'CU', move: 'snap-zoom', from: MS(620), to: CU(600, 470), set: 'bedroom', cast: [{who: 'obuor', x: 560, pose: pose('sleep', 'closed')}], action: 'Snap-zoom: asleep standing up.', out: 'cut'},
  {cue: ['Never ask what'], line: 'Never ask what you care about, because passion makes you…', size: 'MS', move: 'drift', from: MS(E + 260), to: MS(E + 60), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('shrug', 'half', {mouth: 'smirk'})}], action: 'Ebo shrugs; slow sideways drift.', out: 'cut'},
  {cue: ['work harder'], line: 'work harder, notice problems, and keep going when it\'s boring.', size: 'CU ×3', move: 'static', from: CU(840, 480), set: 'christyRoom', cast: [{who: 'christy', x: 840, pose: pose('hold', 'squint', {mouth: 'flat', armR: [104, -30]}), hold: <Brush rotate={-30} />}], props: <Easel x={1130} y={FLOOR_Y} done={0.75} />, action: 'Three quick reaction cuts: Christy painting hard / Ama spotting something / Obuor grinding on.', out: 'cut'},
  {cue: ['Obuor loves'], line: 'Obuor loves sneakers.', size: 'EWS → MS', move: 'pan', from: Z(1.7, 300, 420), to: Z(1.7, 760, 520), set: 'sneakers', cast: [{who: 'obuor', x: 700, pose: pose('hold', 'happy', {mouth: 'grin'}), hold: <Sneakers x={0} y={40} color="#E5484D" />}], action: 'Track along the sneaker wall to Obuor holding his favourite pair.', out: 'cut'},
  {cue: ['He knows'], line: 'He knows every release date.', size: 'ECU calendar', move: 'whip-pan', from: Z(2.4, 700, 460), to: Z(2.6, 1500, 330), set: 'sneakers', cast: [{who: 'obuor', x: 700, pose: pose('point', 'happy', {mouth: 'grin', lookX: 14})}], action: 'Obuor points; whip-pan to the release calendar.', out: 'cut'},
  {cue: ["That's not"], line: "That's not wasted time...", size: 'CU', move: 'static', from: Z(2.4, 700, 460), set: 'sneakers', cast: [{who: 'obuor', x: 700, pose: pose('hold', 'half', {mouth: 'flat'}), hold: <Sneakers x={0} y={40} color="#E5484D" />}], action: 'Obuor looks guilty for a beat.', out: 'cut'},
  {cue: ["that's market"], line: "that's market research.", size: 'WS', move: 'pull-out', from: Z(2.0, 700, 480), to: WS(1000), set: 'sneakers', cast: [{who: 'obuor', x: 700, pose: pose('celebrate', 'dollar', {mouth: 'grin'})}], action: 'Pull out: Obuor celebrates.', out: 'cut'},
  {cue: ['Flip it', 3], line: 'Flip it: write down three things you could talk about for an hour.', size: 'ECU notebook', move: 'static', from: Z(3.0, 860, 560), set: 'sneakers', cast: [{who: 'obuor', x: 760, pose: pose('hold', 'squint', {mouth: 'flat', armR: [86, -40]}), hold: <Notebook rotate={-10} lines={3} />}], text: 'FLIP IT', action: 'Close on Obuor\'s notebook as he writes his list.', out: 'cut'},
  {cue: ['Then ask'], line: 'Then ask: who would pay for help with this?', size: 'CU (tilt up)', move: 'pan', from: Z(3.0, 860, 560), to: Z(2.4, 760, 430), set: 'sneakers', cast: [{who: 'obuor', x: 760, pose: pose('raise', 'wide', {mouth: 'grin'}), hold: <Notebook rotate={-10} lines={3} />}], action: 'Tilt up from the notebook to Obuor\'s face: idea!', out: 'cut to chapter'},

  // ═════ STAY IN YOUR COMFORT ZONE ═════
  {cue: ['Stay in your'], line: 'Stay in your comfort zone.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('sit', 'happy', {mouth: 'smile'})}], text: 'HOW TO STAY POOR / STAY IN YOUR COMFORT ZONE', action: 'Chapter card. Ebo lounging.', out: 'cut'},
  {cue: ['Same job'], line: 'Same job. Same routine. Same excuses.', size: 'WS → MS → CU (jump cuts)', move: 'snap-zoom', from: WS(1400), to: Z(2.6, 1260, 450), set: 'office', cast: [{who: 'mica', x: 1260, pose: pose('slouch', 'half')}], props: <Calendar x={1700} y={320} day={1} month="SAME" />, action: 'Deliberate jump cuts closer on each "Same"; the calendar on the wall changes, Mica doesn\'t.', out: 'cut'},
  {cue: ['Never ask for'], line: 'Never ask for a raise,', size: '2S', move: 'static', from: WS(1300), set: 'office', cast: [{who: 'mica', x: 1060, pose: pose('present', 'open', {mouth: 'o'})}, {who: 'ama', x: 1560, facing: -1, pose: pose('hips', 'squint', {mouth: 'flat'})}], action: 'Mica opens her mouth to the boss (Ama)… and closes it.', out: 'cut'},
  {cue: ['never apply'], line: 'never apply anywhere new,', size: 'ECU laptop', move: 'static', from: Z(3.4, 900, 580), set: 'office', cast: [], props: <><Table x={900} w={460} /><Laptop x={900} y={FLOOR_Y - 250} screen="shop" /></>, action: 'Insert: a job page, cursor hovering on Apply… nothing.', out: 'cut'},
  {cue: ['never try'], line: 'never try selling anything.', size: 'CU', move: 'static', from: Z(2.6, 1260, 450), set: 'office', cast: [{who: 'mica', x: 1260, pose: pose('slouch', 'half', {lookX: 12})}], action: 'Mica shakes her head (look left, right).', out: 'cut'},
  {cue: ['Comfortable feels'], line: 'Comfortable feels safe.', size: 'MS → CU', move: 'push-in', from: MS(840, 560), to: Z(2.8, 760, 450), set: 'living', cast: [{who: 'obuor', x: 760, seat: true, pose: pose('sit', 'happy', {mouth: 'smile', armR: [30, 20]})}], action: 'Obuor sinks happily into the couch. Gentle push.', out: 'cut'},
  {cue: ['But a hamster'], line: 'But a hamster on a wheel is comfortable too.', size: 'ECU', move: 'static', from: Z(4.0, 920, 650), set: 'chapter', cast: [], props: <HamsterWheel x={900} y={FLOOR_Y} spin={0} step={0} />, action: 'Extreme close-up: the hamster running.', out: 'cut'},
  {cue: ['It runs'], line: 'It runs all day... and goes nowhere.', size: 'ECU → WS', move: 'pull-out', from: Z(4.0, 920, 650), to: Z(1.3, 900, 620), set: 'chapter', cast: [], props: <HamsterWheel x={900} y={FLOOR_Y} spin={10} step={1} />, action: 'Pull out to reveal the whole wheel going nowhere.', out: 'cut'},
  {cue: ['Flip it', 4], line: 'Flip it: do one uncomfortable thing a week.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 60, 470), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'open')}], text: 'FLIP IT', action: 'Ebo, sincere.', out: 'cut'},
  {cue: ['Send'], line: 'Send the email.', size: 'MS', move: 'pan', from: Z(1.9, 760, 560), to: Z(1.2, 1150, 560), set: 'office', cast: [{who: 'christy', x: 620, pose: pose('point', 'squint', {mouth: 'flat'})}], props: <><Table x={900} w={460} /><Laptop x={900} y={FLOOR_Y - 250} screen="shop" /></>, action: 'Christy hits Send; pan with the envelope as it flies out.', out: 'cut'},
  {cue: ['Ask for the raise'], line: 'Ask for the raise.', size: '2S', move: 'push-in', from: WS(1300), to: Z(1.6, 1310, 520), set: 'office', cast: [{who: 'mica', x: 1060, pose: pose('present', 'open', {mouth: 'o'})}, {who: 'ama', x: 1560, facing: -1, pose: pose('hips', 'squint', {mouth: 'flat'})}], text: '"Can we talk about a raise?" (speech bubble)', action: 'This time Mica says it.', out: 'cut'},
  {cue: ['Post'], line: 'Post the first video.', size: 'ECU phone → MS', move: 'pull-out', from: Z(3.2, 880, 520), to: MS(900, 560), set: 'pinkRoom', cast: [{who: 'ama', x: 820, pose: pose('hold', 'happy', {mouth: 'grin', armR: [96, -40]}), hold: <HandPhone screen="camera" />}], action: 'Start on the phone recording; pull out to Ama, nervous then grinning.', out: 'cut to chapter'},

  // ═════ WAIT FOR MAGIC ═════
  {cue: ['Wait for magic'], line: 'Wait for magic.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('raise', 'wide', {mouth: 'o'})}], text: 'HOW TO STAY POOR / WAIT FOR MAGIC', action: 'Chapter card. Ebo waves "magic" hands.', out: 'cut'},
  {cue: ['The lottery'], line: 'The lottery.', size: 'ECU ticket', move: 'static', from: Z(3.6, 760, 560), set: 'magicRoom', cast: [{who: 'ama', x: 680, pose: pose('hold', 'closed', {mouth: 'smile', armR: [110, -30]}), hold: <Ticket rotate={-10} />}], action: 'Insert: a lottery ticket held up like a prayer.', out: 'cut'},
  {cue: ['A rich'], line: 'A rich uncle.', size: 'ECU crystal ball → WS', move: 'pull-out', from: Z(3.6, 1040, 540), to: Z(1.4, 900, 580), set: 'magicRoom', cast: [{who: 'ama', x: 680, pose: pose('hold', 'closed', {mouth: 'smile', armR: [110, -30]}), hold: <Ticket rotate={-10} />}], props: <><Table x={1040} w={520} color="#5B4636" /><CrystalBall x={1040} y={FLOOR_Y - 250} /><Candle x={880} y={FLOOR_Y - 250} /><Candle x={1200} y={FLOOR_Y - 250} h={80} /></>, action: 'From the crystal ball, pull out: candles, ticket, Ama eyes closed, wishing.', out: 'cut'},
  {cue: ['A video'], line: 'A video that just goes viral by itself.', size: 'CU', move: 'push-in', from: Z(1.8, 760, 520), to: Z(2.8, 690, 420), set: 'magicRoom', cast: [{who: 'ama', x: 680, pose: pose('hold', 'wide', {mouth: 'grin', armR: [96, -40]}), hold: <HandPhone screen="off" />}], props: <><Table x={1040} w={520} color="#5B4636" /><CrystalBall x={1040} y={FLOOR_Y - 250} /></>, action: 'Ama stares at her phone, waiting for views.', out: 'cut'},
  {cue: ['The odds'], line: 'The odds of winning a big lottery jackpot are about one in three hundred million.', size: 'MS → CU', move: 'push-in', from: MS(900), to: Z(2.8, 780, 440), set: 'magicRoom', cast: [{who: 'ama', x: 760, pose: pose('hold', 'wide', {mouth: 'o', armR: [100, -40]}), hold: <Ticket rotate={-10} />}], props: <><Table x={1040} w={520} color="#5B4636" /><CrystalBall x={1040} y={FLOOR_Y - 250} /></>, action: 'Slow, tense push-in as she checks the numbers.', out: 'cut'},
  {cue: ['You are'], line: 'You are more likely to get struck by lightning.', size: 'ECU', move: 'snap-zoom', from: Z(2.8, 780, 440), to: ECU(770, 440), set: 'magicRoom', cast: [{who: 'ama', x: 760, pose: pose('slouch', 'sad', {mouth: 'frown'})}], props: <><Table x={1040} w={520} color="#5B4636" /><CrystalBall x={1040} y={FLOOR_Y - 250} /></>, action: 'The ticket drops; snap-zoom on her face.', out: 'cut'},
  {cue: ['Flip it', 5], line: 'Flip it: make your own luck.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 60, 470), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'open')}], text: 'FLIP IT', action: 'Ebo, sincere.', out: 'cut'},
  {cue: ['Small bets'], line: 'Small bets, done often. Every try is another ticket,', size: 'MS (tracking)', move: 'pan', from: Z(1.9, 460, 520), to: Z(1.9, 1200, 520), set: 'studio', cast: [{who: 'christy', x: 460, pose: pose('hold', 'squint', {mouth: 'flat'}), hold: <HandPhone screen="listing" />}, {who: 'obuor', x: 760, pose: pose('hold', 'happy', {mouth: 'smile'}), hold: <Sneakers x={0} y={40} color="#4D8FD6" />}, {who: 'mica', x: 1060, pose: pose('hold', 'squint', {mouth: 'flat'}), hold: <Notebook rotate={-10} />}], action: 'Track along the cast, each trying something small: a listing, a pair to resell, a pitch.', out: 'cut'},
  {cue: ['and these'], line: 'and these tickets actually win.', size: 'WS', move: 'pull-out', from: Z(1.9, 1100, 520), to: WS(960), set: 'studio', cast: [{who: 'christy', x: 460, pose: pose('celebrate', 'dollar', {mouth: 'grin'}), hold: <DollarBill scale={0.6} />}, {who: 'obuor', x: 760, pose: pose('celebrate', 'happy', {mouth: 'grin'})}, {who: 'mica', x: 1060, pose: pose('celebrate', 'dollar', {mouth: 'grin'}), hold: <DollarBill scale={0.6} />}, {who: 'ebo', x: 1420, facing: -1, pose: pose('celebrate', 'happy', {mouth: 'grin'})}], action: 'Pull out: they win, Ebo cheers.', out: 'cut to chapter'},

  // ═════ BLAME EVERYONE ELSE ═════
  {cue: ['Blame everyone else'], line: 'Blame everyone else.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('pointing', 'squint', {mouth: 'frown', brows: 'angry'})}], text: 'HOW TO STAY POOR / BLAME EVERYONE ELSE', action: 'Chapter card. Ebo points off-screen, accusing.', out: 'cut'},
  {cue: ['The economy'], line: 'The economy. Your boss. Your parents. The weather.', size: 'MS (whip-pans)', move: 'whip-pan', from: Z(1.8, 1160, 520), to: Z(1.8, 760, 520), set: 'pinkRoom', cast: [{who: 'mica', x: 960, pose: pose('pointing', 'squint', {mouth: 'scream', brows: 'angry'})}], action: 'Mica points a new way on every excuse; the camera whips after her finger each time.', out: 'cut'},
  {cue: ['Blaming'], line: 'Blaming feels great, because it means nothing is your job.', size: 'MS → CU', move: 'push-in', from: MS(840, 560), to: Z(2.4, 760, 450), set: 'pinkRoom', cast: [{who: 'mica', x: 760, seat: true, pose: pose('sit', 'happy', {mouth: 'grin', armR: [30, 20]})}], action: 'Mica flops on the couch, smug.', out: 'cut'},
  {cue: ['It also'], line: 'It also means nothing changes.', size: 'ECU calendar → ECU Mica', move: 'whip-pan', from: Z(3.0, 420, 330), to: ECU(760, 440), set: 'pinkRoom', cast: [{who: 'mica', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat'})}], props: <Calendar x={420} y={330} day={15} month="SAME" />, action: 'The "SAME" calendar flips… whip to Mica, realising.', out: 'cut'},
  {cue: ['Flip it', 6], line: 'Flip it: ask one question. What part of this can I control? Start there.', size: 'MS → CU → MS', move: 'push-in', from: MS(E + 120), to: CU(E + 60, 470), set: 'studio', cast: [{who: 'ebo', x: E, pose: pose('point', 'open', {brows: 'up'})}], text: 'FLIP IT', action: 'Push in on "What part of this can I control?", ease back out on "Start there."', out: 'cut'},

  // ═════ WRAP-UP ═════
  {cue: ["So here's"], line: "So here's the recipe to stay poor:", size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('hips', 'half', {mouth: 'smirk'})}], action: 'Ebo in the dark room.', out: 'cut'},
  {cue: ['TV all day', 2], line: 'TV all day. No hobbies. No passion. Stay comfortable. Wait for magic. Blame everyone.', size: 'CU ×6 (one per habit)', move: 'static', from: Z(2.4, 760, 440), set: 'living', cast: [{who: 'ama', x: 760, seat: true, pose: pose('sit', 'half', {mouth: 'flat'}), hold: <Popcorn y={60} />}], action: 'Six fast cuts, one per habit, reusing each character\'s close-up (Ama/TV, Mica/phone, Obuor asleep, Obuor couch, Ama/ticket, Mica pointing).', out: 'cut'},
  {cue: ["And here's"], line: "And here's the recipe to get rich: do the opposite,", size: 'CU → EWS', move: 'pull-out', from: Z(2.8, 960, 430), to: Z(0.95, 960, 600), set: 'green', cast: [{who: 'ebo', x: 960, pose: pose('open', 'happy', {mouth: 'grin'})}, {who: 'ama', x: 300, pose: pose('celebrate', 'happy', {mouth: 'grin'})}, {who: 'christy', x: 600, pose: pose('celebrate', 'happy', {mouth: 'grin'})}, {who: 'mica', x: 1320, facing: -1, pose: pose('celebrate', 'happy', {mouth: 'grin'})}, {who: 'obuor', x: 1620, facing: -1, pose: pose('celebrate', 'happy', {mouth: 'grin'})}], action: 'Start on Ebo, pull out to reveal the whole cast celebrating.', out: 'cut'},
  {cue: ['one small habit'], line: 'one small habit at a time.', size: 'CU', move: 'static', from: CU(960, 470), set: 'green', cast: [{who: 'ebo', x: 960, pose: pose('present', 'happy', {mouth: 'smile'})}], action: 'Ebo, warm nod.', out: 'cut'},
  {cue: ['Start today'], line: 'Start today.', size: 'MS (tracking)', move: 'follow', from: Z(1.6, 360, 560), to: Z(1.6, 1100, 560), set: 'studio', cast: [{who: 'ebo', x: 300, pose: pose('idle', 'happy'), cycle: 'run'}], action: 'Ebo sprints off; the camera runs with him.', out: 'cut'},
  {cue: ['Subscribe'], line: 'Subscribe for more.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.8, E - 230, 580), set: 'chapter', cast: [{who: 'ebo', x: E, pose: pose('point', 'happy', {mouth: 'grin'})}], text: 'SUBSCRIBE button · EBO TEACHES MONEY · EP 3', action: 'End card.', out: 'end'},
];

export const planStart = (s: PlanShot) => at(s.cue[0], s.cue[1] ?? 1);

/** The set behind a shot (sets only: furniture is part of them, props are not). */
export const planSet = (key: SetKey): React.ReactNode => {
  switch (key) {
    case 'chapter':
      return <PlainRoom wall="#241B2F" floor="#1A1322" />;
    case 'green':
      return <PlainRoom wall="#1E3A2E" floor="#16291F" />;
    case 'studio':
      return <Studio t={0} />;
    case 'living':
      return <LivingRoom />;
    case 'livingOff':
      return <LivingRoom tv={false} />;
    case 'christyRoom':
      return <LivingRoom wall="#CFE3D4" tv={false} />;
    case 'micaRoom':
      return <LivingRoom wall="#E3D9F2" tv={false} />;
    case 'pinkRoom':
      return <LivingRoom wall="#F2D7D9" />;
    case 'magicRoom':
      return <LivingRoom wall="#4A3B5E" tv={false} />;
    case 'bedroom':
      return <Bedroom />;
    case 'office':
      return <Office t={0} />;
    case 'sneakers':
      return <SneakerRoom />;
  }
};

export const PlainRoom: React.FC<{wall: string; floor: string}> = ({wall, floor}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill={wall} />
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill={floor} />
  </g>
);

export {SEAT_Y};
