/**
 * Sound effects (ElevenLabs Sound Effects, episodes/sfx/): one cue per physical beat of the prop
 * acting — a hit, a drop landing, a click, a bite — timed from the same beats the animation uses
 * (ep04acts.tsx, konka01.tsx). Times are seconds from the start of the shot. `loop` repeats the
 * sound for that many seconds (typing). Mixed into one track per episode by scripts/sfx/mix.py.
 */
export type Cue = {at: number; sfx: string; vol?: number; loop?: number};
type Shot = (len: number) => Cue[];

const every = (from: number, period: number, until: number, sfx: string, vol?: number): Cue[] => {
  const out: Cue[] = [];
  for (let t = from; t < until - 0.05; t += period) out.push({at: t, sfx, vol});
  return out;
};
/** Time a prop dropped at t0 takes to land after falling `dist` px (kit.drop, G = 2600). */
const land = (t0: number, dist: number) => t0 + Math.sqrt((2 * dist) / 2600);

/** Ep4, by the shot's line. Lines that repeat (the three "Television.") are told apart by index. */
export const EP04_SFX: Record<string, Shot> = {
  "You don't need a degree.": () => [{at: 0.45, sfx: 'stamp'}],
  "You don't need experience.": () => [{at: 0.52, sfx: 'whoosh', vol: 0.7}, {at: 0.56, sfx: 'paper_flick'}],
  'Television.#bedroom': (len) => every(0.3, 0.6, len, 'click'),
  'Eating breakfast?': (len) => every(0.45, 0.9, len, 'crunch', 0.6),
  'Supposed to be working on something important?': (len) => [{at: 0, sfx: 'typing', vol: 0.6, loop: len}],
  'Television!': () => [{at: 0.25, sfx: 'couch_flop'}],
  'Drawing? Too much effort.': () => [{at: land(0.65, 150), sfx: 'drop'}],
  'Writing? Sounds exhausting.': () => [{at: 0.92, sfx: 'book_thud'}],
  'Got an idea?': () => [{at: 0.4, sfx: 'slap'}],
  'Forget it.': () => [{at: land(0.05, 380), sfx: 'page_flip', vol: 0.5}],
  'well, obviously, you meant next Monday.': () => [{at: 0.6, sfx: 'page_flip'}],
  'What if they reject you?': () => [{at: 0.45, sfx: 'paper_flick', vol: 0.6}],
  'Never try learning something difficult.': (len) => every(0, 1.8, len, 'typing', 0.5).map((c) => ({...c, loop: 0.9})),
  'What if you fail?': () => [{at: 0.35, sfx: 'laptop_slam'}],
  'Besides… your comfort zone has snacks.': (len) => every(0.4, 0.8, len, 'crunch', 0.7),
  "Don't make a plan.": () => [{at: 0.35, sfx: 'slide'}],
  "Don't build useful skills.": () => [{at: 0.3, sfx: 'slide'}],
  "And we certainly can't have that.": (len) => every(0.35, 0.7, len, 'click'),
  'Pick one hobby.': (len) => every(0, 0.7, len, 'brush', 0.7),
  'Start the Monday project today.': (len) => [{at: 0, sfx: 'typing', vol: 0.6, loop: len}],
};

/** Short 01 (Ebo), by shot index (konka01.tsx EBO_ACT). */
export const K01_SFX: Record<number, Shot> = {
  1: () => [{at: 4.0, sfx: 'paper_flick', vol: 0.6}],
  6: (len) => every(1.0, 1.0, Math.min(len, 5.2), 'ball_catch', 0.6),
  8: (len) => every(0.45, 0.9, len, 'clink', 0.7),
  9: () => [0.5, 1.0, 1.5].map((at) => ({at, sfx: 'page_flip', vol: 0.6})),
  10: (len) => every(0.4, 0.8, len, 'hammer'),
  12: () => [...[0.5, 1.0, 1.5].map((at) => ({at, sfx: 'body_thud', vol: 0.45})), {at: 1.9, sfx: 'body_thud'}],
  15: () => [{at: 0.4, sfx: 'pop'}, {at: 1.8, sfx: 'whoosh'}],
  16: (len) => every(0.8, 1.6, len, 'crunch'),
  21: () => [{at: 0.45, sfx: 'click', vol: 0.5}],
  24: () => [{at: 0.3, sfx: 'footstep'}],
  25: () => [{at: land(0.9, 330), sfx: 'drop'}],
  26: () => [0.15, 0.45, 0.75].map((at) => ({at, sfx: 'marker_tick'})),
  31: () => [{at: 0.5, sfx: 'phone_buzz'}],
};

/** Ep5, absolute times (seconds) from the word timings: a pop for each handwritten word, a whoosh and
 * a soft catch for each air-grab. Built by scripts/sfx/gen.tsx from ep05-words.json. */
export const ep05Sfx = (w: {s: number; e: number}[], holdExtra = 0): Cue[] => [
  // the dead beat after "Oh, nice.": crickets (the user's night take), running a few frames past the beat;
  // `holdExtra` stretches it over a longer held pause (the Animate cut holds the Cold Open 4.07s longer)
  {at: w[7].e + 0.2, sfx: 'cricket_night', vol: 0.9, loop: 1.3 + holdExtra},
  {at: w[22].s, sfx: 'pop'}, // "Chicago" pops up
  {at: w[35].s, sfx: 'pop'}, // "wedding"
  {at: w[38].s, sfx: 'pop'}, // "caterer"
  {at: w[15].s - 0.04, sfx: 'whoosh', vol: 0.8}, // the grab
  {at: w[15].s + 0.3, sfx: 'ball_catch', vol: 0.6}, // …and the hand closes
  {at: w[30].s - 0.04, sfx: 'whoosh', vol: 0.8}, // "Grab another."
  {at: w[30].s + 0.22, sfx: 'ball_catch', vol: 0.6},
];

/** Ep6, absolute times from the word timings (ep06-words.json): the cash register on the money,
 * the stamp as the tax card slams, a pop for each handwritten move, a cricket in the dead beat
 * before "Oh. Never mind.", her footsteps out, and the register again for the money kept. */
export const ep06Sfx = (w: {s: number; e: number}[]): Cue[] => [
  {at: w[4].s, sfx: 'cha_ching', vol: 0.7}, // "two hundred?"
  {at: w[35].s, sfx: 'stamp', vol: 0.8}, // THE PEOPLE-PLEASER TAX slams down
  {at: w[52].s, sfx: 'pop'}, // "Buy time"
  {at: w[63].s, sfx: 'pop'}, // "Not you, the request"
  {at: w[84].s, sfx: 'pop'}, // "Offer what you can"
  {at: w[93].e + 0.3, sfx: 'cricket', vol: 0.9, loop: Math.max(0.6, w[94].s - w[93].e - 0.4)},
  ...[0, 1, 2, 3].map((i) => ({at: w[96].s + 0.35 + i * 0.26, sfx: 'footstep', vol: 0.5 - i * 0.08})),
  {at: w[110].s, sfx: 'cha_ching', vol: 0.55}, // "the two hundred stays in your pocket"
];

/** Ep7 (v2 staging), absolute times from the word timings (ep07-words.json) and the plan's drop-in
 * times (EP07_SLAMS / EP07_TICKS in ep07.tsx): the bank app buzzes, a pop for everything that lands,
 * a tick for each green tick, a stamp for the red cross, a tap on "Every year", the apps fade,
 * a clink as two chains come off, and the register at the end. */
export const ep07Sfx = (w: {s: number; e: number}[], slams: number[], ticks: number[], gags: Cue[] = []): Cue[] => [
  ...gags,
  {at: 0.05, sfx: 'phone_buzz', vol: 0.6}, // RENT DUE
  ...slams.map((at) => ({at, sfx: 'pop', vol: 0.75})),
  ...ticks.map((at) => ({at, sfx: 'marker_tick', vol: 0.8})),
  {at: w[69].s, sfx: 'stamp', vol: 0.7}, // the red cross on the chains
  {at: w[97].s, sfx: 'click', vol: 0.6}, // "Every year"
  {at: w[115].s, sfx: 'slide', vol: 0.5}, // three apps fade
  {at: w[201].s - 0.25, sfx: 'clink', vol: 0.8}, // two chains off
  {at: w[203].s, sfx: 'cha_ching', vol: 0.6}, // "With want money."
];
