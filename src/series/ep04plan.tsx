import React from 'react';
import {POSES, Pose} from '../components/Character';
import {Popcorn, Remote, Laptop, Easel, Notebook, Candle} from '../components/StayPoorProps';
import {CouchBack, Diploma, Sticky, StickyWall, BigPhone, Cereal, Chips, BlanketFort, Suitcase, Letter, MondayPad} from '../components/StayBrokeProps';
import {FLOOR_Y, Bedroom, Office} from '../backgrounds/Backgrounds';
import {LivingRoom, LivingRoomTV, Kitchen, WorkRoom, FrontDoor} from './sets';
import {PlanShot, Placed, Z, EWS, WS, MS, CU, ECU, P, pose as basePose, PlainRoom} from './ep03plan';
import {Word} from './kit';
import {POSE} from '../cast/poses';
import wordsJson from './data/ep04-words.json';

/**
 * EPISODE 4 — "The Ultimate Guide to Staying Broke" — SHOT PLAN (pre-production).
 * Ebo alone, and it's his life, not a lecture: when he talks to camera he's standing in the
 * place the habit happens (his front door, living room, work room, kitchen), squared up to the
 * lens (front view); the rest of the time he acts the habit out. That sets up the ending
 * (he's been doing all of it).
 * Living room: the couch faces the TV, and the TV is on the camera side — front-on couch shots
 * are the TV's point of view. The reverse angle (livingTV) looks over the couch back at the TV. One entry per shot; each
 * shot's `line` is the next stretch of the script, in order, so the plan covers every word.
 * Each shot starts on the first word of its line in the recorded voice (see ep04Times).
 */

export type Ep04Set = 'chapter' | 'green' | 'living' | 'livingNight' | 'livingTV' | 'livingTVOff' | 'kitchen' | 'work' | 'workNight' | 'bedroom' | 'door' | 'office';

const E = 760; // Ebo's mark
const SEAT = true;
const pose = basePose;
const lying: Pose = {...POSES.sleeping, tilt: -90, lift: -60, eyes: 'open', mouth: 'flat'};
const ebo = (x: number, p: Pose, extra: Partial<{y: number; seat: boolean; facing: 1 | -1; hold: React.ReactNode; cycle: 'run' | 'fastWalk'}> = {}) => [{who: 'ebo' as const, x, pose: p, ...extra}];
const BED = {x: 1190, y: FLOOR_Y - 150}; // feet end of the bed: Ebo lies in it, head on the pillow
const chapter = (title: string, line: string, p: Pose, extra: Partial<PlanShot<Ep04Set>> = {}): PlanShot<Ep04Set> => ({
  cue: [''],
  line,
  size: 'MS',
  move: 'push-in',
  from: MS(E - 380),
  to: Z(1.85, E - 230, 580),
  set: 'chapter',
  cast: ebo(E, p),
  text: `HOW TO STAY BROKE / ${title}`,
  action: 'Chapter card: title slams in on the left, Ebo on the right. Slow push-in.',
  out: 'cut',
  ...extra,
});
type S = PlanShot<Ep04Set> & {
  /** Ebo is talking to camera (lip sync) */
  talk?: boolean;
  /** drawn in front of the cast (the couch back in the reverse angle) */
  fore?: React.ReactNode;
};
const shot = (s: Omit<S, 'cue'>): S => ({cue: [''], ...s});

/** Where Ebo stands when he talks to camera in each location (clear of the furniture). */
const HOST_X: Partial<Record<Ep04Set, number>> = {door: 760, living: 1330, livingNight: 1330, work: 1450, kitchen: 1130};
const shift = (f: S['from'], dx: number) => ({...f, cx: f.cx + dx});
/**
 * A to-camera line, staged in a real place: Ebo on that location's mark, squared up to the
 * lens (front view) unless he's walking; the framing moves with him.
 */
const host = (set: Ep04Set, s: Omit<S, 'cue' | 'set'>): S => {
  const dx = (HOST_X[set] ?? E) - E;
  return {
    cue: [''],
    ...s,
    set,
    talk: true,
    from: shift(s.from, dx),
    to: s.to && shift(s.to, dx),
    // arms raised high would cover his face in the front view (its arms are drawn in front), so those stay ¾
    cast: s.cast.map((c) => ({...c, x: c.x + dx, pose: c.cycle || c.pose.view !== undefined || Math.max(c.pose.armL[0], c.pose.armR[0]) > 110 ? c.pose : {...c.pose, view: 1}})),
    action: s.action.replace(/^./, (c) => c.toUpperCase()),
  };
};
/** The reverse angle: over the couch back onto the TV. Ebo sits with his back to us. */
const REV_X = 820;
const REV_BASE = FLOOR_Y + 60; // the couch is nearer the camera than the TV wall
const fromBehind = (p: Pose): Placed => ({who: 'ebo', x: REV_X, y: REV_BASE - 110, pose: {...p, view: 3}});
const couchBack = <CouchBack x={REV_X} y={REV_BASE} />;

export const EP04_PLAN: S[] = [
  // ═════ SCENE 1 — INTRODUCTION ═════
  host('door', {line: 'Congratulations!', size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('celebrate', 'happy', {mouth: 'grin'})), action: 'Cold open at his front door: Ebo throws his arms up, beaming, straight to camera.', out: 'cut'}),
  host('door', {line: "You've decided you want to stay poor.", size: 'CU', move: 'push-in', from: Z(2.2, E + 60, 500), to: CU(E + 40, 480), cast: ebo(E, pose('point', 'squint', {mouth: 'smirk'})), action: 'Points straight at us. Slight push.', out: 'cut'}),
  host('door', {line: "And lucky for you, it's actually pretty easy.", size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('shrug', 'happy', {mouth: 'grin'})), action: 'Easy shrug.', out: 'cut'}),
  host('door', {line: "You don't need a degree.", size: 'ECU insert', move: 'static', from: Z(3.4, 420, 380), cast: ebo(E, pose('hold', 'half', {mouth: 'smirk'})), props: <Diploma x={420} y={380} />, action: 'Insert: the framed degree on his hallway wall gets a red NOT NEEDED stamp (stamp snaps on).', out: 'cut'}),
  host('door', {line: "You don't need experience.", size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('hold', 'half', {mouth: 'smirk'}), {hold: <Letter label="CV: BLANK" rotate={-8} />}), action: 'Ebo holds up a completely blank CV.', out: 'cut'}),
  shot({line: "You don't even need to leave your house.", size: 'WS', move: 'pull-out', from: MS(840, 560), to: EWS(820), set: 'living', cast: ebo(E, pose('sit', 'happy', {mouth: 'smile'}), {seat: SEAT}), action: 'Hard cut home: Ebo already on the couch. Pull out to show the whole cosy room.', out: 'cut'}),
  shot({line: 'All you need is a comfortable couch,', size: 'ECU', move: 'static', from: Z(3.0, 1000, 760), set: 'living', cast: ebo(E, pose('sit', 'happy', {mouth: 'smile'}), {seat: SEAT}), action: 'Insert: the couch cushion sinking.', out: 'cut'}),
  shot({line: 'a smartphone,', size: 'ECU', move: 'static', from: Z(3.6, 860, 540), set: 'living', cast: ebo(E, pose('sit', 'half', {armR: [80, -40], mouth: 'flat'}), {seat: SEAT, hold: <BigPhone screen="scroll" />}), action: 'Insert: the phone glowing in his hand.', out: 'cut'}),
  shot({line: 'and an extraordinary ability to make terrible decisions.', size: 'CU', move: 'snap-zoom', from: CU(760, 440), to: ECU(760, 440), set: 'living', cast: ebo(E, pose('sit', 'happy', {mouth: 'grin'}), {seat: SEAT, hold: <Chips rotate={-10} />}), action: 'Ebo proudly opens a giant bag of chips for breakfast. Snap-zoom on the grin.', out: 'cut'}),
  host('living', {line: "Now, obviously, life isn't fair. Some people start with way more opportunities than others.", size: 'MS', move: 'drift', from: MS(E + 200), to: MS(E + 80), cast: ebo(E, pose('open', 'open', {mouth: 'flat'})), action: 'sincere for a beat. Slow sideways drift.', out: 'cut'}),
  host('living', {line: 'But if your goal is to make your situation even worse…', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('hips', 'squint', {mouth: 'smirk'})), action: 'The grin creeps back. Push in.', out: 'cut'}),
  host('living', {line: 'Oh boy. Have I got some tips for you.', size: 'ECU', move: 'snap-zoom', from: CU(E + 40, 480), to: ECU(E, 500), cast: ebo(E, pose('raise', 'wide', {mouth: 'grin'})), action: 'Snap-zoom: wide eyes, rubbing hands.', out: 'cut'}),
  shot({line: 'Welcome to the ultimate guide to staying broke.', size: 'EWS', move: 'push-in', from: EWS(E - 300), to: MS(E - 380), set: 'chapter', cast: ebo(E, pose('present', 'happy', {mouth: 'grin'})), text: 'THE ULTIMATE GUIDE TO STAYING BROKE (title card)', action: 'Title card in the dark room; Ebo presents it. Slow push.', out: 'cut to chapter'}),

  // ═════ SCENE 2 — WATCH TV ALL DAY ═════
  chapter('WATCH TV ALL DAY', 'Watch television.', pose('hips', 'half', {mouth: 'smirk'}), {cast: ebo(E, pose('hips', 'half', {mouth: 'smirk'}), {hold: <Remote rotate={-20} />})}),
  shot({line: 'Lots of television.', size: 'EWS (reverse)', move: 'static', from: EWS(900), set: 'livingTV', cast: [fromBehind(pose('sit', 'half', {mouth: 'flat'}))], fore: couchBack, action: 'Reverse angle, establishing: over the couch back — the back of Ebo\'s head, the TV glowing ahead of him.', out: 'cut'}),
  shot({line: 'And when I say lots, I mean LOTS.', size: 'ECU → EWS', move: 'pull-out', from: Z(3.6, 760, 440), to: EWS(820), set: 'living', cast: ebo(E, pose('sit', 'wide', {mouth: 'grin'}), {seat: SEAT, hold: <Popcorn y={60} />}), action: 'The TV\'s point of view: start on his face, eyes glued to the screen (to us); on "LOTS" pull out fast.', out: 'cut'}),
  host('living', {line: 'The average person already watches almost three hours a day.', size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('present', 'open')), action: 'Ebo states the fact like a news anchor.', out: 'cut'}),
  host('living', {line: 'Rookie numbers.', size: 'ECU', move: 'snap-zoom', from: CU(E + 40, 480), to: ECU(E, 500), cast: ebo(E, pose('hips', 'half', {mouth: 'smirk'})), action: 'Snap-zoom: unimpressed.', out: 'cut'}),
  shot({line: 'Wake up in the morning?', size: 'WS', move: 'static', from: WS(960), set: 'bedroom', cast: ebo(BED.x, lying, {y: BED.y}), action: 'Bedroom, morning: Ebo in bed, eyes snap open.', out: 'cut'}),
  shot({line: 'Television.', size: 'CU', move: 'static', from: Z(2.4, 820, 640), set: 'bedroom', cast: ebo(BED.x, lying, {y: BED.y, hold: <Remote rotate={-20} />}), action: 'Remote already in hand, clicks.', out: 'cut'}),
  shot({line: 'Eating breakfast?', size: 'WS', move: 'static', from: WS(1000), set: 'kitchen', cast: ebo(E, pose('hold', 'half', {mouth: 'flat', lookX: 14})), props: <Cereal x={640} y={FLOOR_Y - 250} />, action: 'Kitchen: Ebo at the table, cereal.', out: 'cut'}),
  shot({line: 'Television.', size: 'CU', move: 'whip-pan', from: Z(2.4, 760, 480), to: Z(2.4, 1450, 410), set: 'kitchen', cast: ebo(E, pose('hold', 'wide', {mouth: 'o', lookX: 14})), props: <Cereal x={640} y={FLOOR_Y - 250} />, action: 'Whip-pan along his eyeline to the kitchen TV.', out: 'cut'}),
  shot({line: 'Supposed to be working on something important?', size: 'WS', move: 'static', from: WS(900), set: 'work', cast: ebo(620, pose('hold', 'squint', {mouth: 'flat'})), props: <Laptop x={900} y={FLOOR_Y - 260} screen="code" />, action: 'Desk, laptop open: a real deadline. Ebo looks determined…', out: 'cut'}),
  shot({line: 'You guessed it.', size: 'CU', move: 'static', from: Z(2.4, 620, 480), set: 'work', cast: ebo(620, pose('hold', 'half', {mouth: 'smirk', lookX: -14})), action: '…his eyes slide sideways.', out: 'cut'}),
  shot({line: 'Television!', size: 'WS', move: 'whip-pan', from: Z(2.4, 620, 480), to: EWS(820), set: 'living', cast: ebo(E, pose('celebrate', 'happy', {mouth: 'grin'}), {seat: SEAT}), action: 'Whip to the living room: Ebo dives onto the couch.', out: 'cut'}),
  shot({line: "And if you're feeling particularly ambitious, switch to your phone.", size: 'MS', move: 'push-in', from: MS(840, 560), to: Z(2.4, 800, 480), set: 'living', cast: ebo(E, pose('sit', 'happy', {armR: [80, -40], mouth: 'grin'}), {seat: SEAT, hold: <BigPhone screen="scroll" />}), action: 'TV still on (camera side), phone comes out too: double screens.', out: 'cut'}),
  shot({line: 'Because why waste eight hours watching television', size: 'ECU', move: 'static', from: Z(3.2, 1060, 600), set: 'livingTV', cast: [], action: 'Insert: the TV screen.', out: 'cut'}),
  shot({line: 'when you can waste twelve hours scrolling through videos of strangers doing absolutely nothing?', size: 'ECU', move: 'static', from: Z(3.8, 860, 540), set: 'living', cast: ebo(E, pose('sit', 'half', {armR: [80, -40], mouth: 'flat'}), {seat: SEAT, hold: <BigPhone screen="scroll" />}), action: 'Insert: the phone feed scrolling, held frames.', out: 'cut'}),
  host('living', {line: "Remember, the goal isn't to relax. Relaxing is perfectly normal.", size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('raise', 'open')), action: 'finger up, making a point.', out: 'cut'}),
  host('living', {line: 'The goal is to make sure entertainment becomes your entire personality.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('hips', 'squint', {mouth: 'smirk'})), action: 'Push in on "entire personality".', out: 'cut'}),
  shot({line: 'And whatever you do… never ask yourself where all that time went.', size: 'EWS', move: 'pull-out', from: MS(840, 560), to: EWS(820), set: 'livingNight', cast: ebo(E, pose('sit', 'half', {mouth: 'flat'}), {seat: SEAT, hold: <Remote rotate={-20} />}), action: 'Night now, same couch, same pose. Slow pull-out.', out: 'cut'}),
  shot({line: "I certainly don't.", size: 'CU', move: 'static', from: CU(760, 440), set: 'livingNight', cast: ebo(E, pose('sit', 'half', {mouth: 'smirk'}), {seat: SEAT}), action: 'Eyes still on the screen (on us), a tiny smirk.', out: 'cut to chapter'}),

  // ═════ SCENE 3 — HAVE NO HOBBIES ═════
  chapter('NO HOBBIES', 'Avoid hobbies.', pose('shrug', 'half', {mouth: 'smirk'})),
  host('work', {line: 'Especially hobbies that teach you something.', size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('hips', 'wide', {mouth: 'o'})), action: 'Mock horror.', out: 'cut'}),
  shot({line: 'Drawing? Too much effort.', size: 'WS', move: 'static', from: WS(900), set: 'work', cast: ebo(620, pose('shrug', 'half', {mouth: 'flat'}), {facing: 1}), props: <Easel x={1000} y={FLOOR_Y} done={0} />, action: 'An empty easel. Ebo looks at it and shrugs.', out: 'cut'}),
  shot({line: 'Writing? Sounds exhausting.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('slouch', 'half', {mouth: 'flat'})), props: <Notebook x={900} y={FLOOR_Y - 330} lines={0} />, action: 'A blank notebook. Ebo slumps just looking at it.', out: 'cut'}),
  shot({line: 'Learning to code?', size: 'ECU', move: 'static', from: Z(3.2, 900, 580), set: 'work', cast: [], props: <Laptop x={900} y={FLOOR_Y - 260} screen="code" />, action: 'Insert: lines of code on the laptop.', out: 'cut'}),
  shot({line: 'Absolutely disgusting.', size: 'ECU', move: 'snap-zoom', from: CU(620, 480), to: ECU(620, 500), set: 'work', cast: ebo(620, pose('hold', 'squint', {mouth: 'scream', brows: 'angry'})), action: 'Snap-zoom: full disgust face.', out: 'cut'}),
  host('work', {line: 'Why would you spend your free time developing a skill', size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('open', 'open')), action: 'reasoning with us.', out: 'cut'}),
  shot({line: 'when you could spend twelve hours watching someone else develop theirs?', size: 'MS → ECU phone', move: 'push-in', from: MS(840, 560), to: Z(3.8, 860, 540), set: 'living', cast: ebo(E, pose('sit', 'happy', {armR: [80, -40], mouth: 'grin'}), {seat: SEAT, hold: <BigPhone screen="scroll" />}), action: 'Ebo on the couch, watching a painting video on his phone, entranced. Push to the phone.', out: 'cut'}),
  host('work', {line: "And please, don't even think about trying something new.", size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('point', 'squint', {mouth: 'flat'})), action: 'Wagging a finger at us.', out: 'cut'}),
  shot({line: "You might discover you're actually good at it.", size: 'WS', move: 'static', from: WS(900), set: 'work', cast: ebo(760, pose('hold', 'wide', {mouth: 'o'})), props: <Easel x={1000} y={FLOOR_Y} done={1} />, action: 'Fantasy: Ebo tries painting… and it\'s good. He\'s shocked.', out: 'cut'}),
  host('work', {line: 'And then what?', size: 'CU', move: 'push-in', from: Z(2.2, E + 40, 500), to: CU(E + 40, 480), cast: ebo(E, pose('shrug', 'wide', {mouth: 'o'})), action: 'alarmed.', out: 'cut'}),
  host('work', {line: 'You might improve.', size: 'ECU', move: 'snap-zoom', from: CU(E + 40, 480), to: Z(3.0, E + 40, 480), cast: ebo(E, pose('hips', 'wide', {mouth: 'o'})), action: 'Snap-zoom 1.', out: 'cut'}),
  host('work', {line: 'You might meet interesting people.', size: 'ECU', move: 'snap-zoom', from: Z(3.0, E + 40, 480), to: Z(3.6, E + 30, 490), cast: ebo(E, pose('hips', 'wide', {mouth: 'scream'})), action: 'Snap-zoom 2 (closer).', out: 'cut'}),
  host('work', {line: 'You might even find an opportunity.', size: 'ECU', move: 'snap-zoom', from: Z(3.6, E + 30, 490), to: ECU(E, 500), cast: ebo(E, POSE.handOverMouth), action: 'Snap-zoom 3 (closest): a gasp, hand over his mouth.', out: 'cut'}),
  shot({line: 'Terrifying.', size: 'EWS', move: 'static', from: EWS(E - 200), set: 'chapter', cast: ebo(E, pose('slouch', 'wide', {mouth: 'o'})), action: 'Smash cut wide: Ebo alone in the dark, tiny and scared.', out: 'cut'}),
  shot({line: 'Better to stay exactly where you are.', size: 'WS', move: 'static', from: EWS(820), set: 'living', cast: ebo(E, pose('sit', 'happy', {mouth: 'smile'}), {seat: SEAT}), action: 'Back on the couch, relieved.', out: 'cut to chapter'}),

  // ═════ SCENE 4 — HAVE NO PASSION ═════
  chapter('NO PASSION', 'Never pursue anything you care about.', pose('slouch', 'half', {mouth: 'flat'})),
  shot({line: 'Have a dream?', size: 'WS', move: 'static', from: WS(960), set: 'bedroom', cast: ebo(BED.x, {...lying, eyes: 'closed', mouth: 'smile'}, {y: BED.y}), action: 'Bedroom, night: Ebo asleep, smiling.', out: 'cut'}),
  shot({line: 'Ignore it.', size: 'CU', move: 'snap-zoom', from: Z(2.4, 820, 640), to: Z(3.2, 800, 650), set: 'bedroom', cast: ebo(BED.x, {...lying, eyes: 'open', mouth: 'flat'}, {y: BED.y}), action: 'Eyes snap open, flat face, rolls over.', out: 'cut'}),
  shot({line: 'Got an idea?', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('raise', 'wide', {mouth: 'grin'})), props: <Sticky x={900} y={500} text="APP IDEA" rotate={-6} />, action: 'Desk: Ebo slaps a sticky note on the wall, inspired.', out: 'cut'}),
  shot({line: 'Forget it.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('slouch', 'half', {mouth: 'flat'})), props: <Sticky x={900} y={700} text="APP IDEA" rotate={30} />, action: 'The note has slid down the wall. Ebo walks off.', out: 'cut'}),
  shot({line: 'Want to start a project?', size: 'WS', move: 'static', from: WS(900), set: 'work', cast: ebo(620, pose('present', 'happy')), props: <Laptop x={900} y={FLOOR_Y - 260} screen="off" />, action: 'Ebo at the desk, cracking his knuckles.', out: 'cut'}),
  shot({line: "Tell yourself you'll do it next Monday.", size: 'ECU', move: 'static', from: Z(3.4, 900, 520), set: 'work', cast: [], props: <MondayPad x={900} y={520} week={1} />, action: 'Insert: he writes MONDAY on the desk calendar.', out: 'cut'}),
  shot({line: 'And when Monday comes…', size: 'ECU', move: 'static', from: Z(3.4, 900, 520), set: 'work', cast: [], props: <MondayPad x={900} y={520} week={2} />, action: 'Same insert: the page flips. It\'s Monday.', out: 'cut'}),
  shot({line: 'well, obviously, you meant next Monday.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('shrug', 'half', {mouth: 'smirk'})), props: <MondayPad x={900} y={FLOOR_Y - 340} week={3} />, action: 'Ebo shrugs and flips the page again.', out: 'cut'}),
  host('work', {line: 'This is called strategic procrastination. Very advanced stuff.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, {...POSE.thinkChin, view: 0, mouth: 'smirk'}), action: 'Hand on chin, very pleased with himself.', out: 'cut'}),
  shot({line: "Eventually, you'll become so good at planning things that you'll never actually have to do anything.", size: 'WS → EWS', move: 'pull-out', from: Z(2.0, 900, 480), to: WS(900), set: 'workNight', cast: ebo(620, pose('hips', 'happy', {mouth: 'grin'})), props: <StickyWall x={900} y={420} n={17} />, action: 'Night: a wall FULL of sticky notes. Pull out to reveal it all.', out: 'cut'}),
  shot({line: "You'll have seventeen unfinished ideas,", size: 'ECU', move: 'pan', from: Z(3.0, 600, 320), to: Z(3.0, 1200, 460), set: 'workNight', cast: [], props: <StickyWall x={900} y={420} n={17} />, action: 'Pan across the seventeen notes.', out: 'cut'}),
  shot({line: 'forty motivational screenshots,', size: 'ECU', move: 'static', from: Z(3.8, 860, 520), set: 'workNight', cast: ebo(E, pose('hold', 'half', {armR: [80, -40]}), {hold: <BigPhone screen="gallery" />}), action: 'Insert: the phone gallery, grid of quote screenshots.', out: 'cut'}),
  shot({line: 'and absolutely nothing to show for them.', size: 'WS', move: 'static', from: WS(900), set: 'workNight', cast: ebo(620, pose('slouch', 'half', {mouth: 'flat'})), props: <StickyWall x={900} y={420} n={17} />, action: 'Ebo, alone at the empty desk under the wall of notes.', out: 'cut'}),
  shot({line: 'But hey… at least your phone gallery looks inspirational.', size: 'CU', move: 'push-in', from: Z(2.0, 700, 480), to: CU(660, 470), set: 'workNight', cast: ebo(620, pose('hold', 'happy', {mouth: 'grin', armR: [96, -40]}), {hold: <BigPhone screen="gallery" />}), action: 'He holds the gallery up proudly. Push in.', out: 'cut to chapter'}),

  // ═════ SCENE 5 — STAY IN YOUR COMFORT ZONE ═════
  chapter('COMFORT ZONE', 'Stay comfortable. At all costs.', pose('sit', 'happy', {mouth: 'smile'})),
  shot({line: 'Never apply for a better opportunity.', size: 'ECU', move: 'static', from: Z(3.8, 860, 540), set: 'living', cast: ebo(E, pose('sit', 'squint', {armR: [80, -40]}), {seat: SEAT, hold: <BigPhone screen="job" />}), action: 'Insert: a job post, thumb hovering over APPLY.', out: 'cut'}),
  shot({line: 'What if they reject you?', size: 'CU', move: 'snap-zoom', from: CU(760, 440), to: ECU(760, 440), set: 'living', cast: ebo(E, pose('sit', 'wide', {mouth: 'o'}), {seat: SEAT, hold: <Letter rotate={-10} />}), action: 'Imagined: a REJECTED letter appears in his hand. He flinches.', out: 'cut'}),
  shot({line: 'Never try learning something difficult.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('hold', 'squint')), props: <Laptop x={900} y={FLOOR_Y - 260} screen="code" />, action: 'Desk: a hard tutorial on the laptop.', out: 'cut'}),
  shot({line: 'What if you fail?', size: 'ECU', move: 'snap-zoom', from: CU(620, 480), to: ECU(620, 500), set: 'work', cast: ebo(620, pose('hold', 'wide', {mouth: 'o'})), action: 'He slams the laptop shut. Snap-zoom.', out: 'cut'}),
  shot({line: 'And definitely never ask questions.', size: 'WS', move: 'static', from: WS(1400), set: 'office', cast: ebo(1260, pose('raise', 'open', {mouth: 'o'})), action: 'Office: Ebo half-raises his hand…', out: 'cut'}),
  shot({line: 'What if somebody thinks you\'re stupid?', size: 'CU', move: 'push-in', from: Z(2.2, 1260, 480), to: CU(1260, 470), set: 'office', cast: ebo(1260, pose('slouch', 'sad', {mouth: 'frown'})), action: '…and lowers it slowly. Push in.', out: 'cut'}),
  host('living', {line: 'See, the trick is to avoid every situation where you might feel uncomfortable.', size: 'MS', move: 'drift', from: MS(E + 200), to: MS(E + 80), cast: ebo(E, pose('open', 'open')), action: 'explaining.', out: 'cut'}),
  host('living', {line: "That way, you'll never experience embarrassment.", size: 'CU', move: 'static', from: CU(E + 40, 480), cast: ebo(E, pose('point', 'happy', {mouth: 'smile'})), action: 'Ticks it off on a finger.', out: 'cut'}),
  host('living', {line: 'Or rejection.', size: 'CU', move: 'static', from: Z(2.9, E + 40, 480), cast: ebo(E, pose('point', 'happy', {mouth: 'smile'})), action: 'Jump cut closer.', out: 'cut'}),
  host('living', {line: 'Or failure.', size: 'ECU', move: 'static', from: Z(3.3, E + 40, 490), cast: ebo(E, pose('point', 'happy', {mouth: 'grin'})), action: 'Jump cut closer again.', out: 'cut'}),
  shot({line: 'Of course, you might also miss opportunities to grow.', size: 'WS', move: 'static', from: WS(1200), set: 'door', cast: ebo(700, pose('slouch', 'half', {mouth: 'flat'})), action: 'Ebo walks right past the front door (an open opportunity) without looking.', out: 'cut'}),
  host('living', {line: "But that's a small price to pay for never having to try.", size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('shrug', 'happy', {mouth: 'grin'})), action: 'cheerful shrug.', out: 'cut'}),
  shot({line: 'Besides… your comfort zone has snacks.', size: 'ECU → EWS', move: 'pull-out', from: Z(3.4, 760, 520), to: EWS(800), set: 'living', cast: ebo(760, pose('sit', 'happy', {mouth: 'grin'}), {seat: SEAT, hold: <Chips rotate={-10} />}), props: <BlanketFort x={760} y={FLOOR_Y} />, action: 'From Ebo munching, pull out: he\'s inside a blanket fort labelled COMFORT ZONE, piled with snacks.', out: 'cut to chapter'}),

  // ═════ SCENE 6 — WAIT FOR MAGIC ═════
  chapter('WAIT FOR MAGIC', 'Wait for a miracle.', pose('raise', 'wide', {mouth: 'o'})),
  shot({line: "Don't make a plan.", size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('hold', 'half', {mouth: 'flat'})), props: <Notebook x={900} y={FLOOR_Y - 330} lines={0} />, action: 'He closes a blank planner.', out: 'cut'}),
  shot({line: "Don't build useful skills.", size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('hold', 'half', {mouth: 'flat'})), props: <Laptop x={900} y={FLOOR_Y - 260} screen="off" />, action: 'Laptop pushed away.', out: 'cut'}),
  shot({line: "Don't take action.", size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('slouch', 'half', {mouth: 'flat'})), action: 'He just sits down. (three matching cuts, same framing)', out: 'cut'}),
  shot({line: 'Just sit there and wait for the universe to recognize your incredible potential.', size: 'EWS → MS', move: 'push-in', from: EWS(900), to: MS(900, 620), set: 'livingNight', cast: ebo(900, lying), props: <Candle x={600} y={FLOOR_Y} />, action: 'Ebo lies on the living-room floor, arms out, candles lit, waiting. Very slow push-in.', out: 'cut'}),
  shot({line: 'Maybe a millionaire will randomly knock on your door.', size: 'WS', move: 'static', from: WS(1150), set: 'door', cast: ebo(800, pose('hold', 'wide', {mouth: 'grin', lookX: 14})), action: 'Ebo waits by the front door, hopeful.', out: 'cut'}),
  shot({line: "Maybe someone will offer you your dream job while you're sleeping.", size: 'WS', move: 'static', from: WS(960), set: 'bedroom', cast: ebo(BED.x, {...lying, eyes: 'closed', mouth: 'smile'}, {y: BED.y}), props: <Letter x={1000} y={420} label="HIRED!" rotate={10} />, action: 'Asleep, dreaming of a HIRED letter.', out: 'cut'}),
  shot({line: 'Maybe a suitcase full of money will fall from the sky.', size: 'WS', move: 'pan', from: Z(1.6, 900, 200), to: WS(900, 600), set: 'livingNight', cast: ebo(900, pose('raise', 'wide', {mouth: 'grin', lookY: -16})), props: <Suitcase x={900} y={120} rotate={-12} />, action: 'Tilt down from a suitcase of cash in the sky to Ebo waiting under it, arms out. (It never lands.)', out: 'cut'}),
  host('livingNight', {line: 'The odds of winning a big lottery jackpot are about one in three hundred million.', size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('present', 'open')), action: 'the real number, deadpan.', out: 'cut'}),
  host('livingNight', {line: 'Practically guaranteed.', size: 'ECU', move: 'snap-zoom', from: CU(E + 40, 480), to: ECU(E, 500), cast: ebo(E, pose('hips', 'happy', {mouth: 'grin'})), action: 'Snap-zoom: big fake grin.', out: 'cut'}),
  shot({line: "And if none of those things happen? Don't worry. Just keep waiting.", size: 'WS', move: 'static', from: WS(1150), set: 'door', cast: ebo(800, pose('slouch', 'half', {mouth: 'flat'})), action: 'Back at the door: still waiting, slumped. No knock.', out: 'cut'}),
  shot({line: 'After all, nothing says financial strategy quite like staring at the ceiling and hoping for the best.', size: 'ECU → EWS', move: 'pull-out', from: Z(3.2, 900, 560), to: EWS(900), set: 'livingNight', cast: ebo(900, lying), action: 'From his face, staring up, pull all the way out: tiny Ebo on the floor.', out: 'cut to chapter'}),

  // ═════ SCENE 7 — BLAME EVERYONE ELSE ═════
  chapter('BLAME EVERYONE', 'And finally… blame everybody.', pose('pointing', 'squint', {mouth: 'frown', brows: 'angry'})),
  shot({line: 'Your boss.', size: 'MS', move: 'whip-pan', from: MS(1000), to: MS(1400), set: 'office', cast: ebo(1260, pose('pointing', 'squint', {mouth: 'scream', brows: 'angry'})), action: 'Office: Ebo points off right.', out: 'whip'}),
  shot({line: 'Your parents.', size: 'MS', move: 'whip-pan', from: MS(1300, 560), to: MS(600, 560), set: 'living', cast: ebo(800, pose('pointing', 'squint', {mouth: 'scream', brows: 'angry'}), {facing: -1}), action: 'Whip into the living room, pointing left.', out: 'whip'}),
  host('kitchen', {line: 'Your friends.', size: 'MS', move: 'whip-pan', from: MS(E - 200), to: MS(E + 260), cast: ebo(E, pose('pointing', 'squint', {mouth: 'scream', brows: 'angry'})), action: 'Whip into the kitchen, pointing right.', out: 'whip'}),
  shot({line: 'The government.', size: 'MS', move: 'whip-pan', from: MS(1300), to: MS(900, 420), set: 'kitchen', cast: ebo(E, pose('raise', 'squint', {mouth: 'scream', brows: 'angry', lookY: -16})), action: 'Kitchen, pointing at the ceiling.', out: 'whip'}),
  shot({line: 'The weather.', size: 'MS', move: 'whip-pan', from: MS(900), to: MS(1560, 300), set: 'work', cast: ebo(1100, pose('pointing', 'squint', {mouth: 'scream', brows: 'angry'})), action: 'At the window, pointing at the rain.', out: 'cut'}),
  host('kitchen', {line: 'That guy who looked at you funny in 2017.', size: 'ECU', move: 'push-in', from: CU(E + 40, 480), to: ECU(E, 500), cast: ebo(E, {...POSE.hmm, view: 0}), text: '2017 (flashback date, small)', action: 'Slow, intense push-in on narrowed eyes. Long hold.', out: 'cut'}),
  shot({line: 'Everybody!', size: 'EWS', move: 'static', from: EWS(E - 200), set: 'chapter', cast: ebo(E, pose('celebrate', 'squint', {mouth: 'scream', brows: 'angry'})), action: 'Smash cut wide: Ebo pointing everywhere at once in the dark room.', out: 'cut'}),
  host('kitchen', {line: 'Now, some problems really are outside your control.', size: 'MS', move: 'static', from: MS(E + 120), cast: ebo(E, pose('open', 'open', {mouth: 'flat'})), action: 'Sincere beat.', out: 'cut'}),
  host('kitchen', {line: "But that's no reason to examine the things you actually can change.", size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('hips', 'squint', {mouth: 'smirk'})), action: 'Back to sarcasm. Push in.', out: 'cut'}),
  host('kitchen', {line: 'Because the moment you take responsibility for one small decision…', size: 'CU', move: 'push-in', from: CU(E + 40, 480), to: Z(3.2, E + 30, 490), cast: ebo(E, pose('point', 'wide', {mouth: 'o'})), action: 'Leaning in, whispering.', out: 'cut'}),
  host('kitchen', {line: 'you might have to do something about it.', size: 'ECU', move: 'snap-zoom', from: Z(3.2, E + 30, 490), to: ECU(E, 500), cast: ebo(E, POSE.panic), action: 'Snap-zoom: horror, hands on his cheeks.', out: 'cut'}),
  shot({line: "And we certainly can't have that.", size: 'WS', move: 'static', from: EWS(820), set: 'living', cast: ebo(E, pose('sit', 'happy', {mouth: 'smile'}), {seat: SEAT, hold: <Remote rotate={-20} />}), action: 'Back on the couch, all better.', out: 'cut'}),

  // ═════ SCENE 8 — THE ENDING ═════
  shot({line: 'So there you have it. Six simple habits that can help keep you stuck.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.85, E - 230, 580), set: 'chapter', cast: ebo(E, pose('present', 'open')), action: 'Dark room: wrapping up.', out: 'cut'}),
  host('living', {line: "Of course, avoiding them won't magically make you rich. But changing even one might help you move forward.", size: 'MS → CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('open', 'open', {mouth: 'smile'})), action: 'sincere and warm. Slow push.', out: 'cut'}),
  shot({line: 'Turn off the TV for one hour.', size: 'MS (reverse)', move: 'static', from: MS(900, 600), set: 'livingTVOff', cast: [fromBehind(pose('sit', 'happy', {mouth: 'smile'}))], fore: couchBack, action: 'Recap montage (each habit reversed). Reverse angle: the TV is off, Ebo still facing it.', out: 'cut'}),
  shot({line: 'Pick one hobby.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(760, pose('hold', 'happy', {mouth: 'smile', armR: [104, -30]})), props: <Easel x={1000} y={FLOOR_Y} done={0.5} />, action: 'Ebo painting.', out: 'cut'}),
  shot({line: 'Start the Monday project today.', size: 'MS', move: 'static', from: MS(900), set: 'work', cast: ebo(620, pose('hold', 'squint', {mouth: 'flat', armR: [90, -40]})), props: <Laptop x={900} y={FLOOR_Y - 260} screen="code" />, action: 'Typing on the laptop; the sticky wall is gone.', out: 'cut'}),
  shot({line: 'Do one scary thing a week.', size: 'MS', move: 'static', from: MS(1300), set: 'office', cast: ebo(1260, pose('raise', 'happy', {mouth: 'grin'})), action: 'Hand up high in the office.', out: 'cut'}),
  shot({line: 'Make your own luck.', size: 'MS', move: 'static', from: MS(900), set: 'door', cast: ebo(1050, pose('present', 'happy', {mouth: 'grin'})), action: 'Ebo opens the front door himself and steps out.', out: 'cut'}),
  host('living', {line: 'And own what you can control.', size: 'CU', move: 'push-in', from: MS(E + 120), to: CU(E + 40, 480), cast: ebo(E, pose('point', 'happy', {mouth: 'smile'})), action: 'nod to camera.', out: 'cut'}),
  host('living', {line: "Now, if you'll excuse me…", size: 'MS', move: 'follow', from: MS(E + 120), to: MS(E + 700), cast: ebo(E, pose('idle', 'happy'), {cycle: 'fastWalk'}), action: 'Ebo fast-walks off frame right; the camera follows.', out: 'cut'}),
  shot({line: "I've got seventeen episodes of a show to finish.", size: 'EWS (reverse)', move: 'push-in', from: EWS(900), to: MS(960, 560), set: 'livingTV', cast: [fromBehind(pose('sit', 'happy', {mouth: 'grin'}))], fore: couchBack, action: 'The reveal, reverse angle: right back on the couch, TV on. Push in over his shoulder.', out: 'cut'}),
  shot({line: 'For research purposes, obviously.', size: 'CU', move: 'snap-zoom', from: CU(760, 440), to: ECU(760, 440), set: 'living', cast: ebo(E, pose('sit', 'half', {mouth: 'smirk'}), {seat: SEAT, hold: <Remote rotate={-20} />}), action: 'The TV\'s point of view: smirk. Snap-zoom.', out: 'cut'}),
  shot({line: 'Subscribe for more.', size: 'MS', move: 'push-in', from: MS(E - 380), to: Z(1.8, E - 230, 580), set: 'chapter', cast: ebo(E, pose('point', 'happy', {mouth: 'grin'})), text: 'SUBSCRIBE button · EBO TEACHES MONEY · EP 4', action: 'End card.', out: 'end'}),
];

export const ep04Set = (key: Ep04Set): React.ReactNode => {
  switch (key) {
    case 'chapter':
      return <PlainRoom wall="#241B2F" floor="#1A1322" />;
    case 'green':
      return <PlainRoom wall="#1E3A2E" floor="#16291F" />;
    case 'living':
      return <LivingRoom tv={false} />;
    case 'livingNight':
      return <LivingRoom wall="#4A3B5E" tv={false} />;
    case 'livingTV':
      return <LivingRoomTV />;
    case 'livingTVOff':
      return <LivingRoomTV on={false} />;
    case 'kitchen':
      return <Kitchen />;
    case 'work':
      return <WorkRoom />;
    case 'workNight':
      return <WorkRoom night />;
    case 'bedroom':
      return <Bedroom />;
    case 'door':
      return <FrontDoor />;
    case 'office':
      return <Office t={0} />;
  }
};

/**
 * Shot timing from the recorded voice (data/ep04-words.json): each shot starts on the first
 * word of its line. The lines are matched in order, letter by letter, so punctuation and
 * spoken numbers ("2017" is said "twenty seventeen") don't matter.
 */
const norm = (t: string) => t.toLowerCase().replace(/2017/g, 'twenty seventeen').replace(/[^a-z]/g, '');
export const ep04Times = () => {
  const words = wordsJson as Word[];
  const owner: number[] = []; // letter → word index
  words.forEach((w, i) => norm(w.w).split('').forEach(() => owner.push(i)));
  let pos = 0;
  const starts = EP04_PLAN.map((sh) => {
    const start = words[owner[pos]].s;
    pos += norm(sh.line).length;
    return start;
  });
  const end = words[words.length - 1].e + 1.1;
  return starts.map((st, i) => ({start: st, length: (i + 1 < starts.length ? starts[i + 1] : end) - st}));
};
export const EP04_DURATION_S = (wordsJson as Word[])[(wordsJson as Word[]).length - 1].e + 1.1;
