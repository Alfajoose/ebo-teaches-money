// Master timeline. All values are "design frames" at 30 fps.
// When a real voiceover is present, these design frames are remapped onto the
// real narration timing (see sync.tsx), so scenes never need to change.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 58 * FPS; // 1740 — exactly 58 seconds

export type BeatId = 'hook' | 'business' | 'reality' | 'discovery' | 'payoff';

export const BEATS: {id: BeatId; start: number; end: number}[] = [
  {id: 'hook', start: 0, end: 210},
  {id: 'business', start: 210, end: 510},
  {id: 'reality', start: 510, end: 840},
  {id: 'discovery', start: 840, end: 1290},
  {id: 'payoff', start: 1290, end: 1740},
];

export type Line = {text: string; start: number; end: number};

// Placeholder narration timing. Each line start is also a sync marker.
export const LINES: Line[] = [
  {text: 'This is Benny. Benny is broke.', start: 8, end: 68},
  {text: 'Benny dreams of money that shows up while he sleeps.', start: 72, end: 148},
  {text: 'Enter: the vending machine.', start: 152, end: 205},

  {text: 'So Benny buys one, stuffs it with soda, and does the math.', start: 215, end: 330},
  {text: 'Buy a can for eighty cents. Sell it for two bucks.', start: 340, end: 420},
  {text: "That's a dollar twenty of pure profit. Benny is a genius.", start: 425, end: 505},

  {text: 'He parks it in a quiet hallway... and waits.', start: 520, end: 600},
  {text: 'Days pass. Weeks pass. A spider moves in.', start: 612, end: 700},
  {text: 'Grand total: three dollars.', start: 742, end: 815},

  {text: 'Then the bills show up. Electricity. Maintenance. Location fees.', start: 850, end: 960},
  {text: "Turns out revenue isn't profit. Revenue is just money visiting.", start: 965, end: 1055},
  {text: 'So Benny moves the machine where thirsty people actually live: an office.', start: 1060, end: 1185},
  {text: "Suddenly, everyone's buying.", start: 1195, end: 1280},

  {text: 'Benny celebrates. Passive income, baby!', start: 1295, end: 1380},
  {text: 'He finally goes home to sleep.', start: 1400, end: 1465},
  {text: 'Then... his phone rings.', start: 1490, end: 1550},
  {text: 'The machine is broken.', start: 1580, end: 1640},
  {text: 'Passive. Income.', start: 1672, end: 1732},
];

/** Same script and timing, starring Ebo (cast episode). */
export const LINES_EBO: Line[] = LINES.map((l) => ({...l, text: l.text.replace(/Benny/g, 'Ebo')}));
