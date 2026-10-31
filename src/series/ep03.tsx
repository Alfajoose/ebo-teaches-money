import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {CycleName, cycleSpeed} from '../cast/cycles';
import {POSES, Pose} from '../components/Character';
import {DollarBill} from '../components/Money';
import {Calendar} from '../components/Props';
import {HandPhone, Sneakers} from '../components/FlipProps';
import {Popcorn, Remote, Laptop, Easel, Brush, HamsterWheel, CrystalBall, Candle, Ticket, Notebook} from '../components/StayPoorProps';
import {FLOOR_Y, Bedroom, Office} from '../backgrounds/Backgrounds';
import {SITTING} from '../castep/shared';
import {Studio, LivingRoom, SneakerRoom, Table} from './sets';
import {VFPS, Word, makeAt, VStage, HWIDE, HMEDIUM, HCLOSE, snapPose, stepAt, lipFrame, lipHeadNod, chunkWords, TopCaption} from './kit';
import {C, FONT} from '../theme';
import {Slam, LayerMode, LayerModeContext, StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import wordsJson from './data/ep03-words.json';
import envJson from './data/ep03-env.json';

/**
 * EBO TEACHES MONEY — Episode 3: How to Stay Poor (16:9 long-form, 1920×1080).
 * Ebo sarcastically "teaches" six habits that keep you broke, the cast act each one out,
 * then he flips it into what to do instead. Each habit opens on a chapter card (no
 * numbers). Light on infographics: the cast act the points out; on-screen text is only
 * the title, the chapter cards, the FLIP IT marker, one speech bubble and the end card. Every beat is timed to the voiceover's word timings (data/ep03-words.json);
 * the voice has a one-second pause before each chapter (data/ep03-pauses.json).
 */

export const EP03_W = 1920;
export const EP03_H = 1080;
const W = EP03_W;

const WORDS = wordsJson as Word[];
const ENV = (envJson as {env: number[]}).env;
const at = makeAt(WORDS);
const CHUNKS = chunkWords(WORDS, 6, 34);
export const EP03_DURATION = Math.ceil((WORDS[WORDS.length - 1].e + 1.1) * VFPS);

const EBO_X = 760;
const SEAT_Y = FLOOR_Y - 110; // sitting on the couch
const CREAM = '#F3E6CF';
const PLUM = '#241B2F';

// ───────────────────────── cast ─────────────────────────

const G: Record<string, Pose> = {
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
};
const face = (p: Pose, eyes: Pose['eyes'], extra: Partial<Pose> = {}): Pose => ({...p, eyes, ...extra});

/** Ebo, lip-synced to the voiceover. */
const Ebo: React.FC<{f: number; pose: Pose; x?: number; facing?: 1 | -1; talk?: boolean; cycle?: CycleName; children?: React.ReactNode}> = ({
  f,
  pose,
  x = EBO_X,
  facing = 1,
  talk = true,
  cycle,
  children,
}) => (
  <RigCharacter
    who="ebo"
    x={x}
    y={FLOOR_Y}
    facing={facing}
    t={f}
    cycle={cycle}
    pose={{...pose, headTilt: pose.headTilt + (talk ? lipHeadNod(ENV, f) : 0)}}
    mouthFrame={talk ? lipFrame(ENV, WORDS, f) : undefined}
  >
    {children}
  </RigCharacter>
);

const Cast: React.FC<{who: CastId; f: number; pose: Pose; x: number; y?: number; facing?: 1 | -1; cycle?: CycleName; noBlink?: boolean; children?: React.ReactNode}> = ({
  who,
  f,
  pose,
  x,
  y = FLOOR_Y,
  facing = 1,
  cycle,
  noBlink,
  children,
}) => (
  <RigCharacter who={who} x={x} y={y} facing={facing} t={f} pose={pose} cycle={cycle} noBlink={noBlink}>
    {children}
  </RigCharacter>
);

/** Walk from x0 toward x1 at the cycle's own ground speed, then stop. */
const walkTo = (who: CastId, cycle: CycleName, t: number, t0: number, x0: number, x1: number) => {
  const dir = Math.sign(x1 - x0) || 1;
  const dist = Math.max(0, t - t0) * cycleSpeed(who, cycle);
  const done = dist >= Math.abs(x1 - x0);
  return {x: done ? x1 : x0 + dir * dist, walking: !done, facing: (dir > 0 ? 1 : -1) as 1 | -1};
};

// ───────────────────────── graphics (kept to a minimum: titles, FLIP IT, one speech bubble) ─────────────────────────

const textW = (text: string, size: number) => text.length * size * 0.68 + size * 1.0;

/** The green "FLIP IT" marker that opens every turnaround. */
const FlipPill: React.FC<{t: number; at: number; x?: number; y?: number}> = ({t, at: a, x = 1600, y = 150}) => (
  <Slam t={t} at={a}>
    <rect x={x - 190} y={y - 60} width={380} height={120} rx={60} fill={C.shirt} stroke={C.ink} strokeWidth={10} />
    <path d={`M ${x - 140} ${y + 18} q 30 -50 70 -10 l 0 -22 l 30 34 l -40 18 l 6 -18 q -30 -26 -50 14 z`} fill="#fff" stroke={C.ink} strokeWidth={4} />
    <text x={x + 34} y={y + 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill="#fff" letterSpacing={3}>
      FLIP IT
    </text>
  </Slam>
);

/** A speech bubble (dialogue, not an infographic). */
const Bubble: React.FC<{x: number; y: number; text: string; size?: number; tail?: 'left' | 'right'}> = ({x, y, text, size = 54, tail = 'left'}) => {
  const w = textW(text, size) + 40;
  const h = size * 2;
  const tx = tail === 'left' ? x + 70 : x + w - 70;
  return (
    <g>
      <path d={`M ${tx - 30} ${y + h - 4} L ${tx + (tail === 'left' ? -40 : 40)} ${y + h + 60} L ${tx + 30} ${y + h - 4} Z`} fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={h / 2.4} fill={C.white} stroke={C.ink} strokeWidth={8} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};

// ───────────────────────── chapter cards ─────────────────────────

/** Chapter card: dark plum room, "HOW TO STAY POOR" label, the habit as a big title, Ebo on the right. */
const ChapterShot: React.FC<{t: number; f: number; from: number; lines: string[]; pose: Pose}> = ({t, f, from, lines, pose}) => (
  <VStage
    framing={HMEDIUM(EBO_X - 380, 600)}
    bg={PLUM}
    blurBg={<ChapterRoom />}
    overlay={
      <g>
        <Slam t={t} at={from - 0.6} dist={-160} twist={-4}>
          <text x={150} y={300} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red} letterSpacing={8}>
            HOW TO STAY POOR
          </text>
        </Slam>
        <Slam t={t} at={from} dist={-300} twist={-8}>
          {lines.map((l, i) => (
            <text key={l} x={142} y={440 + i * 140} fontFamily={FONT} fontWeight={900} fontSize={lines.length > 1 ? 136 : 150} fill={CREAM} letterSpacing={2}>
              {l}
            </text>
          ))}
          <rect x={150} y={440 + (lines.length - 1) * 140 + 50} width={220} height={18} rx={9} fill={C.red} />
        </Slam>
      </g>
    }
  >
    <Ebo f={f} pose={pose} />
  </VStage>
);

/** The chapter cards' room: dark plum wall, darker floor (a set: Background layer). */
const ChapterRoom: React.FC<{wall?: string; floor?: string}> = ({wall = PLUM, floor = '#1A1322'}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill={wall} />
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill={floor} />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke="#3A2C48" strokeWidth={8} />
  </g>
);

/** Ebo talking to camera in the studio. */
const EboTalk: React.FC<{t: number; f: number; pose: Pose; flip?: number; close?: boolean; children?: React.ReactNode}> = ({t, f, pose, flip, close, children}) => (
  <VStage framing={close ? HCLOSE(EBO_X + 10, 520) : HMEDIUM(EBO_X + 120, 600)} blurBg={<Studio t={0} />} overlay={flip !== undefined ? <FlipPill t={t} at={flip} /> : undefined}>
    <Ebo f={f} pose={pose}>
      {children}
    </Ebo>
  </VStage>
);

type Shot = {at: number; render: (t: number, f: number) => React.ReactNode};

/** A wall calendar whose page turns every `rate` seconds from `from` (time passing). */
const daysGoBy = (t: number, from: number, rate = 0.12) => Math.floor(Math.max(0, t - from) / rate);

const SHOTS: Shot[] = [
  // ───────────── HOOK ─────────────
  {
    at: 0,
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(EBO_X - 380, 600)}
        bg={PLUM}
        blurBg={<ChapterRoom />}
        overlay={
          <g>
            <Slam t={t} at={at('stay')} dist={-200}>
              <text x={150} y={420} fontFamily={FONT} fontWeight={900} fontSize={140} fill={CREAM}>
                HOW TO STAY
              </text>
            </Slam>
            {t >= at('poor') && (
              <Slam t={t} at={at('poor')} dist={-320} twist={10}>
                <text x={150} y={640} fontFamily={FONT} fontWeight={900} fontSize={230} fill={C.red}>
                  POOR
                </text>
              </Slam>
            )}
          </g>
        }
      >
        <Ebo f={f} pose={snapPose(t, [[0, face(G.point, 'squint', {mouth: 'smirk'})], [at('Good news'), face(G.shrug, 'happy', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },
  {
    // the whole cast, ready to demonstrate
    at: at('Just'),
    render: (t, f) => (
      <VStage framing={HWIDE(960, 600)} blurBg={<Studio t={0} />}>
        {(['ama', 'christy', 'mica', 'obuor'] as CastId[]).map((who, i) => (
          <Cast key={who} who={who} f={f + i * 7} x={1060 + i * 230} facing={-1} pose={snapPose(t, [[0, face(G.idle, 'open', {mouth: 'smile'})], [at('rich') + i * 0.08, face(G.hips, 'squint', {mouth: 'smirk'})]])} />
        ))}
        <Ebo f={f} x={560} pose={snapPose(t, [[0, face(G.present, 'happy')], [at('rich'), face(G.shrug, 'half', {mouth: 'smirk'})], [at('opposite.'), face(G.point, 'happy', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },

  // ───────────── WATCH TV ALL DAY ─────────────
  {
    at: at('Watch'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Watch')} lines={['WATCH TV', 'ALL DAY']} pose={face(G.hips, 'half', {mouth: 'smirk'})} />,
  },
  {
    at: at('The average'),
    render: (t, f) => (
      <VStage framing={HWIDE(880, 600)} blurBg={<LivingRoom />}>
        <Cast who="ama" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat', lookX: -14})}>
          <Popcorn y={60} />
        </Cast>
      </VStage>
    ),
  },
  {
    // the days fly by on the wall calendar while Ama doesn't move
    at: at('A full-time'),
    render: (t, f) => (
      <VStage framing={HWIDE(880, 600)} blurBg={<LivingRoom />}>
        <Calendar x={1300} y={300} day={(daysGoBy(t, at('A full-time')) % 30) + 1} month={['JAN', 'MAR', 'JUN', 'SEP', 'DEC'][Math.floor(daysGoBy(t, at('A full-time')) / 30) % 5]} />
        <Cast who="ama" f={f} x={760} y={SEAT_Y} pose={face(G.sit, t < at('couch.') ? 'half' : 'closed', {mouth: 'flat', lookX: -14})} noBlink>
          <Remote rotate={-20} />
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Ama'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(840, 560)} blurBg={<LivingRoom />}>
        <Cast who="ama" f={f} x={760} y={SEAT_Y} pose={t < at('Her bank') ? face(G.sit, 'happy', {mouth: 'grin', lookX: -14}) : face(G.sit, t < at('nothing') ? 'wide' : 'sad', {mouth: t < at('nothing') ? 'o' : 'frown', armR: [80, -40]})}>
          {t < at('Her bank') ? <Popcorn y={60} /> : <HandPhone screen="off" rotate={-8} />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip'),
    render: (t, f) => <EboTalk t={t} f={f} flip={at('Flip')} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('one hour'), face(G.point, 'open')]])} />,
  },
  {
    // TV off, laptop open
    at: at("That's three"),
    render: (t, f) => (
      <VStage framing={HWIDE(760, 600)} blurBg={<LivingRoom tv={false} />}>
        <Table x={520} w={460} />
        <Laptop x={520} y={FLOOR_Y - 250} screen={t < at('start a') ? 'code' : 'shop'} />
        <Cast who="ama" f={f} x={260} pose={face(G.hold, 'happy', {armR: [70 + (Math.floor(f / 5) % 2) * 14, -30], mouth: 'smile'})} />
      </VStage>
    ),
  },

  // ───────────── NO HOBBIES ─────────────
  {
    at: at('Have no hobbies'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Have no hobbies')} lines={['NO HOBBIES']} pose={face(G.shrug, 'half', {mouth: 'smirk'})} />,
  },
  {
    at: at('Hobbies are'),
    render: (t, f) => <EboTalk t={t} f={f} close pose={snapPose(t, [[0, face(G.hips, 'wide', {mouth: 'o'})], [at('good at'), face(G.point, 'squint', {mouth: 'smirk'})]])} />,
  },
  {
    at: at('Christy draws'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(980, 560)} blurBg={<LivingRoom wall="#CFE3D4" tv={false} />}>
        <Easel x={1130} y={FLOOR_Y} done={Math.max(0, Math.min(1, (t - at('draws')) / 1.4))} />
        <Cast who="christy" f={f} x={840} pose={face(G.hold, 'happy', {armR: [96 + (Math.floor(f / 6) % 2) * 16, -30], mouth: 'smile', lookX: 10})}>
          <Brush rotate={-30} />
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Two years'),
    render: (t, f) => {
      const w = walkTo('obuor', 'fastWalk', t, at('Two years') + 0.3, 1580, 1260);
      const pay = at('fifty');
      return (
        <VStage framing={HWIDE(1000, 600)} blurBg={<LivingRoom wall="#CFE3D4" tv={false} />}>
          <Easel x={1000} y={FLOOR_Y} done={1} framed />
          <Cast who="christy" f={f} x={760} pose={t < pay ? face(G.present, 'happy', {mouth: 'grin'}) : face(G.hold, 'dollar', {mouth: 'grin'})}>
            {t >= pay && <DollarBill scale={0.6} />}
          </Cast>
          <Cast who="obuor" f={f} x={w.x} facing={-1} cycle={w.walking ? 'fastWalk' : undefined} pose={w.walking ? face(G.idle, 'open') : face(G.hold, 'happy', {mouth: 'smile'})}>
            {!w.walking && t < pay && <DollarBill scale={0.6} />}
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at('Mica'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(840, 560)} blurBg={<LivingRoom />}>
        <Cast who="mica" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat', armR: [60 + (Math.floor(f / 8) % 2) * 6, -50]})}>
          <HandPhone screen="off" rotate={-8} />
        </Cast>
      </VStage>
    ),
  },
  {
    // same phone: Mica scrolling, Christy selling her art
    at: at('Same phone'),
    render: (t, f) => (
      <VStage framing={HWIDE(960, 600)} blurBg={<Studio t={0} />}>
        <Cast who="mica" f={f} x={620} pose={face(G.hold, 'half', {mouth: 'flat'})}>
          <HandPhone screen="off" />
        </Cast>
        <Cast who="christy" f={f} x={1300} facing={-1} pose={t < at('Different') ? face(G.hold, 'open', {mouth: 'smile'}) : face(G.celebrate, 'dollar', {mouth: 'grin'})}>
          {t < at('Different') && <HandPhone screen="listing" />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip', 2),
    render: (t, f) => <EboTalk t={t} f={f} flip={at('Flip', 2)} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('making'), face(G.open, 'open')], [at('every week'), face(G.point, 'happy')]])} />,
  },
  {
    // skills grow quietly: Mica swaps the phone for a brush, then gets paid
    at: at('Skills'),
    render: (t, f) => {
      const pay = at('paying');
      return (
        <VStage framing={HMEDIUM(980, 560)} blurBg={<LivingRoom wall="#E3D9F2" tv={false} />}>
          <Easel x={1130} y={FLOOR_Y} done={Math.max(0, Math.min(1, (t - at('Skills')) / 1.6))} />
          <Cast who="mica" f={f} x={840} pose={t < pay ? face(G.hold, 'squint', {armR: [96 + (Math.floor(f / 6) % 2) * 16, -30], mouth: 'flat', lookX: 10}) : face(G.hold, 'dollar', {mouth: 'grin'})}>
            {t < pay ? <Brush rotate={-30} /> : <DollarBill scale={0.6} />}
          </Cast>
        </VStage>
      );
    },
  },

  // ───────────── NO PASSION ─────────────
  {
    at: at('Have no passion'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Have no passion')} lines={['NO PASSION']} pose={face(G.slouch, 'half', {mouth: 'flat'})} />,
  },
  {
    at: at('Wake'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(820, 600)} blurBg={<Bedroom />}>
        <Cast
          who="obuor"
          f={f}
          x={560}
          pose={stepAt(t, [
            [0, face(POSES.standing, 'half', {mouth: 'o', armR: [150, -20]})],
            [at('minimum'), face(G.slouch, 'half', {mouth: 'flat'})],
            [at('sleep'), {...POSES.sleeping}],
          ])}
          noBlink
        />
      </VStage>
    ),
  },
  {
    at: at('Never ask what'),
    render: (t, f) => <EboTalk t={t} f={f} pose={snapPose(t, [[0, face(G.shrug, 'half', {mouth: 'smirk'})], [at('because passion'), face(G.raise, 'open')], [at('keep going'), face(G.point, 'happy')]])} />,
  },
  {
    at: at('Obuor loves'),
    render: (t, f) => (
      <VStage framing={HWIDE(1000, 600)} blurBg={<SneakerRoom />}>
        <Cast who="obuor" f={f} x={700} pose={t < at('market') ? face(G.hold, 'happy', {mouth: 'grin', lookX: t >= at('release') ? 14 : 0}) : face(G.celebrate, 'dollar', {mouth: 'grin'})}>
          {t < at('market') && <Sneakers x={0} y={40} color={C.red} />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip', 3),
    render: (t, f) => (
      <VStage framing={HMEDIUM(900, 600)} blurBg={<SneakerRoom />} overlay={<FlipPill t={t} at={at('Flip', 3)} />}>
        <Cast who="obuor" f={f} x={760} pose={t < at('who would') ? face(G.hold, 'squint', {mouth: 'flat', armR: [80 + (Math.floor(f / 6) % 2) * 10, -40]}) : face(G.raise, 'wide', {mouth: 'grin'})}>
          <Notebook rotate={-10} lines={Math.min(3, Math.floor(Math.max(0, t - at('write down')) / 0.6) + 1)} />
        </Cast>
      </VStage>
    ),
  },

  // ───────────── COMFORT ZONE ─────────────
  {
    at: at('Stay in your'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Stay in your')} lines={['STAY IN YOUR', 'COMFORT ZONE']} pose={face(G.sit, 'happy', {mouth: 'smile'})} />,
  },
  {
    // same job, same routine, same excuses: the calendar turns, nothing else does
    at: at('Same job'),
    render: (t, f) => (
      <VStage framing={HWIDE(1400, 600)} blurBg={<Office t={0} />}>
        <Calendar x={1700} y={320} day={(daysGoBy(t, at('Same job'), 0.2) % 30) + 1} month="SAME" />
        <Cast who="mica" f={f} x={1260} pose={face(G.slouch, 'half', {mouth: 'flat'})} />
      </VStage>
    ),
  },
  {
    at: at('Never ask for'),
    render: (t, f) => (
      <VStage framing={HWIDE(1400, 600)} blurBg={<Office t={0} />}>
        <Calendar x={1700} y={320} day={30} month="SAME" />
        <Cast who="mica" f={f} x={1260} pose={face(G.slouch, 'half', {mouth: 'flat', lookX: Math.floor(f / 10) % 2 ? 12 : -12})} />
      </VStage>
    ),
  },
  {
    at: at('Comfortable feels'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(840, 560)} blurBg={<LivingRoom />}>
        <Cast who="obuor" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'happy', {mouth: 'smile', armR: [30, 20]})} />
      </VStage>
    ),
  },
  {
    at: at('But a hamster'),
    render: (t, f) => {
      const k = Math.floor(f / 3);
      return (
        <VStage framing={{zoom: 1.3, cx: 900, cy: 620}} bg={PLUM} blurBg={<ChapterRoom />}>
          {/* the wheel turns in 10° steps; with 12 spokes there are only three distinct looks */}
          <HamsterWheel x={900} y={FLOOR_Y} spin={(k % 3) * 10} step={k} />
        </VStage>
      );
    },
  },
  {
    at: at('Flip', 4),
    render: (t, f) => <EboTalk t={t} f={f} flip={at('Flip', 4)} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('uncomfortable'), face(G.point, 'open')]])} />,
  },
  {
    at: at('Send'),
    render: (t, f) => {
      const p = Math.min(1, Math.max(0, (t - at('email') - 0.1) / 0.4));
      return (
        <VStage
          framing={HWIDE(900, 600)}
          blurBg={<Office t={0} />}
          overlay={
            p > 0 && p < 1 ? (
              <g transform={`translate(${880 + p * 900} ${520 - p * 360}) rotate(${-20 - p * 10})`}>
                <rect x={-70} y={-46} width={140} height={92} rx={8} fill={C.white} stroke={C.ink} strokeWidth={7} />
                <path d="M -70 -46 L 0 10 L 70 -46" fill="none" stroke={C.ink} strokeWidth={6} />
              </g>
            ) : undefined
          }
        >
          <Table x={900} w={460} />
          <Laptop x={900} y={FLOOR_Y - 250} screen="shop" />
          <Cast who="christy" f={f} x={620} pose={face(G.point, 'squint', {mouth: 'flat'})} />
        </VStage>
      );
    },
  },
  {
    at: at('Ask for the raise'),
    render: (t, f) => (
      <VStage
        framing={HWIDE(1300, 600)}
        blurBg={<Office t={0} />}
        overlay={
          <Slam t={t} at={at('Ask for the raise')}>
            <Bubble x={820} y={250} text="Can we talk about a raise?" size={44} tail="left" />
          </Slam>
        }
      >
        <Cast who="mica" f={f} x={1060} pose={face(G.present, 'open', {mouth: 'o'})} />
        <Cast who="ama" f={f} x={1560} facing={-1} pose={face(G.hips, 'squint', {mouth: 'flat'})} />
      </VStage>
    ),
  },
  {
    at: at('Post'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(900, 560)} blurBg={<LivingRoom wall="#F2D7D9" tv={false} />}>
        <Cast who="ama" f={f} x={820} pose={t < at('video.') ? face(G.hold, 'squint', {mouth: 'flat', armR: [96, -40]}) : face(G.hold, 'happy', {mouth: 'grin', armR: [96, -40]})}>
          <HandPhone screen="camera" />
        </Cast>
      </VStage>
    ),
  },

  // ───────────── WAIT FOR MAGIC ─────────────
  {
    at: at('Wait for magic'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Wait for magic')} lines={['WAIT FOR', 'MAGIC']} pose={face(G.raise, 'wide', {mouth: 'o'})} />,
  },
  {
    at: at('The lottery'),
    render: (t, f) => (
      <VStage framing={HWIDE(1000, 600)} blurBg={<LivingRoom wall="#4A3B5E" tv={false} />}>
        <Table x={1040} w={520} color="#5B4636" />
        <CrystalBall x={1040} y={FLOOR_Y - 250} />
        <Candle x={880} y={FLOOR_Y - 250} />
        <Candle x={1200} y={FLOOR_Y - 250} h={80} />
        <Cast who="ama" f={f} x={680} pose={face(G.hold, 'closed', {mouth: 'smile', armR: [110, -30]})} noBlink>
          <Ticket rotate={-10} />
        </Cast>
      </VStage>
    ),
  },
  {
    // the ticket loses
    at: at('The odds'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(900, 600)} blurBg={<LivingRoom wall="#4A3B5E" tv={false} />}>
        <Table x={1040} w={520} color="#5B4636" />
        <CrystalBall x={1040} y={FLOOR_Y - 250} />
        <Cast who="ama" f={f} x={760} pose={t < at('You are') ? face(G.hold, 'wide', {mouth: 'o', armR: [100, -40]}) : face(G.slouch, 'sad', {mouth: 'frown'})}>
          {t < at('You are') && <Ticket rotate={-10} />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip', 5),
    render: (t, f) => <EboTalk t={t} f={f} flip={at('Flip', 5)} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('luck'), face(G.point, 'open')]])} />,
  },
  {
    // small bets, done often: the cast each try something; some pay off
    at: at('Small bets'),
    render: (t, f) => {
      const win = at('win');
      return (
        <VStage framing={HWIDE(960, 600)} blurBg={<Studio t={0} />}>
          <Cast who="christy" f={f} x={460} pose={t < win ? face(G.hold, 'squint', {mouth: 'flat'}) : face(G.celebrate, 'dollar', {mouth: 'grin'})}>
            {t < win ? <HandPhone screen="listing" /> : <DollarBill scale={0.6} />}
          </Cast>
          <Cast who="obuor" f={f + 9} x={760} pose={face(G.hold, 'happy', {mouth: 'smile'})}>
            <Sneakers x={0} y={40} color={C.blue} />
          </Cast>
          <Cast who="mica" f={f + 4} x={1060} pose={t < win ? face(G.hold, 'squint', {mouth: 'flat'}) : face(G.celebrate, 'dollar', {mouth: 'grin'})}>
            {t < win ? <Notebook rotate={-10} /> : <DollarBill scale={0.6} />}
          </Cast>
          <Ebo f={f} x={1420} facing={-1} pose={snapPose(t, [[0, face(G.present, 'open')], [win, face(G.celebrate, 'happy', {mouth: 'grin'})]])} />
        </VStage>
      );
    },
  },

  // ───────────── BLAME EVERYONE ELSE ─────────────
  {
    at: at('Blame everyone else'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Blame everyone else')} lines={['BLAME', 'EVERYONE ELSE']} pose={face(POSES.pointing, 'squint', {mouth: 'frown', brows: 'angry'})} />,
  },
  {
    // Mica points somewhere new on every excuse
    at: at('The economy'),
    render: (t, f) => {
      const k = ['The economy', 'Your boss', 'Your parents', 'The weather'].filter((w) => t >= at(w)).length;
      return (
        <VStage framing={HWIDE(960, 600)} blurBg={<LivingRoom wall="#F2D7D9" />}>
          <Cast who="mica" f={f} x={960} facing={k % 2 ? -1 : 1} pose={face(POSES.pointing, 'squint', {mouth: 'scream', brows: 'angry', tilt: k % 2 ? 4 : -4})} />
        </VStage>
      );
    },
  },
  {
    at: at('Blaming'),
    render: (t, f) => (
      <VStage framing={HMEDIUM(840, 560)} blurBg={<LivingRoom wall="#F2D7D9" />}>
        <Calendar x={420} y={330} day={t < at('It also') ? 1 : (daysGoBy(t, at('It also'), 0.12) % 30) + 1} month="SAME" />
        <Cast who="mica" f={f} x={760} y={SEAT_Y} pose={face(G.sit, t < at('It also') ? 'happy' : 'half', {mouth: t < at('It also') ? 'grin' : 'flat', armR: [30, 20]})} />
      </VStage>
    ),
  },
  {
    at: at('Flip', 6),
    render: (t, f) => (
      <EboTalk t={t} f={f} flip={at('Flip', 6)} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('What part'), face(G.point, 'open', {brows: 'up'})], [at('Start there'), face(G.hips, 'happy', {mouth: 'grin'})]])} />
    ),
  },

  // ───────────── WRAP-UP ─────────────
  {
    // the recipe to stay poor: each habit, one quick cut of its character
    at: at("So here's"),
    render: (t, f) => {
      const beats: [number, React.ReactNode][] = [
        [at("So here's"), <Ebo key="e" f={f} x={960} pose={face(G.hips, 'half', {mouth: 'smirk'})} />],
        [at('TV all day', 2), <Cast key="a" who="ama" f={f} x={960} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat'})}><Popcorn y={60} /></Cast>],
        [at('No hobbies', 2), <Cast key="m" who="mica" f={f} x={960} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat'})}><HandPhone screen="off" rotate={-8} /></Cast>],
        [at('No passion', 2), <Cast key="o" who="obuor" f={f} x={960} pose={{...POSES.sleeping}} noBlink />],
        [at('Stay comfortable'), <Cast key="o2" who="obuor" f={f} x={960} y={SEAT_Y} pose={face(G.sit, 'happy', {mouth: 'smile'})} />],
        [at('Wait for magic', 2), <Cast key="a2" who="ama" f={f} x={960} pose={face(G.hold, 'closed', {mouth: 'smile', armR: [110, -30]})} noBlink><Ticket rotate={-10} /></Cast>],
        [at('Blame everyone', 2), <Cast key="m2" who="mica" f={f} x={960} pose={face(POSES.pointing, 'squint', {mouth: 'scream', brows: 'angry'})} />],
      ];
      const cur = beats.filter(([a]) => t >= a).pop()!;
      return (
        <VStage framing={HMEDIUM(960, 600)} blurBg={<LivingRoom />}>
          {cur[1]}
        </VStage>
      );
    },
  },
  {
    at: at("And here's"),
    render: (t, f) => (
      <VStage framing={HWIDE(960, 600)} blurBg={<ChapterRoom wall="#1E3A2E" floor="#16291F" />}>
        {(['ama', 'christy', 'mica', 'obuor'] as CastId[]).map((who, i) => (
          <Cast key={who} who={who} f={f + i * 5} x={[300, 600, 1320, 1620][i]} facing={i < 2 ? 1 : -1} pose={snapPose(t, [[0, face(G.idle, 'open', {mouth: 'smile'})], [at('opposite', 2) + i * 0.1, face(G.celebrate, 'happy', {mouth: 'grin'})]])} />
        ))}
        <Ebo f={f} x={960} pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('opposite', 2), face(G.open, 'happy', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },
  {
    at: at('Start today'),
    render: (t, f) => (
      <VStage framing={HWIDE(960, 600)} blurBg={<Studio t={0} />}>
        <Ebo f={f} x={(t - at('Start today')) * cycleSpeed('ebo', 'run')} cycle="run" pose={face(G.idle, 'happy')} />
      </VStage>
    ),
  },
  {
    at: at('Subscribe'),
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(EBO_X - 380, 600)}
        bg={PLUM}
        blurBg={<ChapterRoom />}
        overlay={
          <Slam t={t} at={at('Subscribe') + 0.15}>
            <rect x={150} y={360} width={760} height={150} rx={75} fill="#FF0033" stroke={C.ink} strokeWidth={10} />
            <rect x={210} y={395} width={110} height={80} rx={22} fill="#fff" />
            <path d="M 252 412 L 292 435 L 252 458 Z" fill="#FF0033" />
            <text x={600} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#fff" letterSpacing={3}>
              SUBSCRIBE
            </text>
            <text x={150} y={620} fontFamily={FONT} fontWeight={900} fontSize={44} fill={CREAM} letterSpacing={6}>
              EBO TEACHES MONEY · EP 3
            </text>
          </Slam>
        }
      >
        <Ebo f={f} pose={face(G.point, 'happy', {mouth: 'grin'})} talk={t < at('more.') + 0.6} />
      </VStage>
    ),
  },
];

export const shotIndexAt = (f: number) => {
  const t = f / VFPS;
  let idx = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].at) idx = i;
  return idx;
};

/** One frame of the episode (pure — also used by the .fla exporter). */
export const Ep03Frame: React.FC<{f: number; handDrawn?: boolean}> = ({f, handDrawn = true}) => {
  const t = f / VFPS;
  const shot = SHOTS[shotIndexAt(f)];
  return (
    <StageSizeContext.Provider value={{w: EP03_W, h: EP03_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value={handDrawn}>
          <AbsoluteFill style={{background: '#000'}}>
            {shot.render(t, f)}
            <TopCaption chunks={CHUNKS} tSec={t} />
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

/** layer='set' renders only the sets; see exportCtx.tsx. */
export const EboEp03: React.FC<{layer?: LayerMode; handDrawn?: boolean}> = ({layer = 'full', handDrawn = true}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <Ep03Frame f={f} handDrawn={handDrawn} />
      {layer === 'full' && <Html5Audio src={staticFile('ebo-ep03/voice.mp3')} />}
    </LayerModeContext.Provider>
  );
};

export const EP03_SHOT_TIMES = SHOTS.map((s) => s.at);
