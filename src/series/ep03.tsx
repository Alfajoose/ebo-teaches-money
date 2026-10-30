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
import {VFPS, Word, makeAt, VStage, HWIDE, HMEDIUM, HCLOSE, snapPose, stepAt, lipFrame, lipHeadNod, chunkWords, TopCaption, BigText} from './kit';
import {C, FONT} from '../theme';
import {Slam, Still, LayerMode, LayerModeContext, StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import wordsJson from './data/ep03-words.json';
import envJson from './data/ep03-env.json';

/**
 * EBO TEACHES MONEY — Episode 3: How to Stay Poor (16:9 long-form, 1920×1080).
 * Ebo sarcastically "teaches" six habits that keep you broke, the cast act each one out,
 * then he flips it into what to do instead. Each habit opens on a chapter card (no
 * numbers). Every beat is timed to the voiceover's word timings (data/ep03-words.json);
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
const GREEN = '#7BE07B';

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

// ───────────────────────── graphics (screen space, 1920×1080) ─────────────────────────

const textW = (text: string, size: number) => text.length * size * 0.68 + size * 1.0;

/** Rounded label; `mark` adds a green tick or a red cross in front. */
const Chip: React.FC<{x: number; y: number; text: string; size?: number; fill?: string; color?: string; mark?: 'yes' | 'no'; anchor?: 'start' | 'middle'}> = ({
  x,
  y,
  text,
  size = 46,
  fill = C.white,
  color = C.ink,
  mark,
  anchor = 'start',
}) => {
  const pad = mark ? size * 1.3 : 0;
  const w = textW(text, size) + pad;
  const left = anchor === 'middle' ? x - w / 2 : x;
  const h = size * 1.7;
  return (
    <g>
      <rect x={left} y={y - h / 2} width={w} height={h} rx={h / 2.6} fill={fill} stroke={C.ink} strokeWidth={7} />
      {mark === 'yes' && (
        <g>
          <circle cx={left + h / 2} cy={y} r={size * 0.5} fill={C.shirt} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${left + h / 2 - size * 0.24} ${y + 1} l ${size * 0.18} ${size * 0.18} l ${size * 0.32} ${-size * 0.38}`} stroke="#fff" strokeWidth={size * 0.14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {mark === 'no' && (
        <g>
          <circle cx={left + h / 2} cy={y} r={size * 0.5} fill={C.red} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${left + h / 2 - size * 0.2} ${y - size * 0.2} l ${size * 0.4} ${size * 0.4} m 0 ${-size * 0.4} l ${-size * 0.4} ${size * 0.4}`} stroke="#fff" strokeWidth={size * 0.14} strokeLinecap="round" />
        </g>
      )}
      <text x={left + pad + (w - pad) / 2} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

/** The green "FLIP IT" pill that opens every turnaround. */
const FlipPill: React.FC<{t: number; at: number; x?: number; y?: number}> = ({t, at: a, x = 1360, y = 200}) => (
  <Slam t={t} at={a}>
    <rect x={x - 190} y={y - 60} width={380} height={120} rx={60} fill={C.shirt} stroke={C.ink} strokeWidth={10} />
    <path d={`M ${x - 140} ${y + 18} q 30 -50 70 -10 l 0 -22 l 30 34 l -40 18 l 6 -18 q -30 -26 -50 14 z`} fill="#fff" stroke={C.ink} strokeWidth={4} />
    <text x={x + 34} y={y + 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill="#fff" letterSpacing={3}>
      FLIP IT
    </text>
  </Slam>
);

/** A speech / thought bubble. */
const Bubble: React.FC<{x: number; y: number; text: string; size?: number; tail?: 'left' | 'right'; fill?: string; color?: string}> = ({
  x,
  y,
  text,
  size = 54,
  tail = 'left',
  fill = C.white,
  color = C.ink,
}) => {
  const w = textW(text, size) + 40;
  const h = size * 2;
  const tx = tail === 'left' ? x + 70 : x + w - 70;
  return (
    <g>
      <path d={`M ${tx - 30} ${y + h - 4} L ${tx + (tail === 'left' ? -40 : 40)} ${y + h + 60} L ${tx + 30} ${y + h - 4} Z`} fill={fill} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={h / 2.4} fill={fill} stroke={C.ink} strokeWidth={8} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

/** A bank-app balance card. */
const BankCard: React.FC<{x: number; y: number; amount: string; color?: string}> = ({x, y, amount, color = C.red}) => (
  <g>
    <rect x={x} y={y} width={440} height={250} rx={34} fill={C.ink} stroke={C.ink} strokeWidth={8} />
    <rect x={x + 16} y={y + 16} width={408} height={218} rx={22} fill={CREAM} />
    <text x={x + 44} y={y + 80} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.gray}>
      BANK BALANCE
    </text>
    <text x={x + 44} y={y + 190} fontFamily={FONT} fontWeight={900} fontSize={100} fill={color}>
      {amount}
    </text>
  </g>
);

// ───────────────────────── chapter cards ─────────────────────────

/** Chapter card: dark plum room, "HOW TO STAY POOR" label, the habit as a big title, Ebo on the right. */
const ChapterShot: React.FC<{t: number; f: number; from: number; lines: string[]; pose: Pose; label?: string; labelColor?: string}> = ({
  t,
  f,
  from,
  lines,
  pose,
  label = 'HOW TO STAY POOR',
  labelColor = C.red,
}) => (
  <VStage
    framing={HMEDIUM(EBO_X - 380, 600)}
    bg={PLUM}
    blurBg={<ChapterRoom />}
    overlay={
      <g>
        <Slam t={t} at={from - 0.6} dist={-160} twist={-4}>
          <text x={150} y={300} fontFamily={FONT} fontWeight={900} fontSize={54} fill={labelColor} letterSpacing={8}>
            {label}
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
const ChapterRoom: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill={PLUM} />
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#1A1322" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke="#3A2C48" strokeWidth={8} />
  </g>
);

/** Ebo in the studio on the left of frame, leaving the right for graphics. */
const EboTalk: React.FC<{t: number; f: number; pose: Pose; overlay?: React.ReactNode; children?: React.ReactNode}> = ({f, pose, overlay, children}) => (
  <VStage framing={HMEDIUM(EBO_X + 230, 600)} blurBg={<Studio t={0} />} overlay={overlay}>
    <Ebo f={f} pose={pose}>
      {children}
    </Ebo>
  </VStage>
);

type Shot = {at: number; render: (t: number, f: number) => React.ReactNode};

const HABITS = ['TV ALL DAY', 'NO HOBBIES', 'NO PASSION', 'COMFORT ZONE', 'WAIT FOR MAGIC', 'BLAME OTHERS'];
const RICH = ['TAKE AN HOUR BACK', 'PICK A HOBBY', 'FOLLOW WHAT YOU CARE ABOUT', 'DO HARD THINGS WEEKLY', 'MAKE SMALL BETS', 'OWN WHAT YOU CONTROL'];

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
              <text x={150} y={420} fontFamily={FONT} fontWeight={900} fontSize={150} fill={CREAM}>
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
    at: at('Just'),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'open')], [at('rich'), face(G.shrug, 'half', {mouth: 'smirk'})]])}
        overlay={
          <g>
            {HABITS.map((h, i) =>
              t >= at('six') + i * 0.12 ? (
                <Slam key={h} t={t} at={at('six') + i * 0.12} dist={-200} twist={i % 2 ? 8 : -8}>
                  <Chip x={1000 + (i % 2) * 460} y={250 + Math.floor(i / 2) * 130} text={h} size={36} mark="no" />
                </Slam>
              ) : null,
            )}
            {t >= at('opposite.') && (
              <Slam t={t} at={at('opposite.')} dist={-300} twist={-10}>
                <BigText text="…OR DO THE OPPOSITE" x={1440} y={760} size={78} fill={GREEN} rotate={-4} />
              </Slam>
            )}
          </g>
        }
      />
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
      <VStage
        framing={HWIDE(880, 600)}
        blurBg={<LivingRoom />}
        overlay={
          <g>
            <Slam t={t} at={at('three')}>
              <Chip x={1240} y={220} text="≈ 3 HRS / DAY" size={58} />
            </Slam>
            {t >= at('thousand') && (
              <Slam t={t} at={at('thousand')} dist={-260} twist={8}>
                <Chip x={1080} y={380} text="1,000+ HRS / YEAR" size={58} fill={C.yellow} />
              </Slam>
            )}
          </g>
        }
      >
        <Cast who="ama" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat', lookX: -14})}>
          <Popcorn y={60} />
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('A full-time'),
    render: (t, f) => {
      const bar = (y: number, w: number, label: string, col: string, a: number) =>
        t >= a ? (
          <Slam t={t} at={a} dist={-200} twist={0}>
            <rect x={160} y={y} width={w} height={130} rx={18} fill={col} stroke={C.ink} strokeWidth={8} />
            <text x={190} y={y + 86} fontFamily={FONT} fontWeight={900} fontSize={58} fill={C.ink}>
              {label}
            </text>
          </Slam>
        ) : null;
      return (
        <VStage
          framing={HMEDIUM(EBO_X - 380, 600)}
          bg={PLUM}
          blurBg={<ChapterRoom />}
          overlay={
            <g>
              {bar(260, 1200, 'FULL-TIME JOB · 2,000 HRS', '#9FD3FF', at('A full-time'))}
              {bar(450, 600, 'TV · 1,000 HRS', C.yellow, at('So'))}
              {t >= at('half') && (
                <Slam t={t} at={at('half')} dist={-260} twist={-6}>
                  <BigText text="= HALF A WORK YEAR" x={160} y={760} size={96} fill={C.red} anchor="start" rotate={-2} />
                </Slam>
              )}
            </g>
          }
        >
          <Ebo f={f} pose={snapPose(t, [[0, face(G.present, 'open')], [at('couch.'), face(G.shrug, 'half', {mouth: 'smirk'})]])} />
        </VStage>
      );
    },
  },
  {
    at: at('Ama'),
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(900, 560)}
        blurBg={<LivingRoom />}
        overlay={
          <g>
            <Slam t={t} at={at('every')}>
              <Chip x={1150} y={230} text="EPISODES WATCHED: ALL" size={46} />
            </Slam>
            {t >= at('Her bank') && (
              <Slam t={t} at={at('Her bank')} dist={-300} twist={8}>
                <BankCard x={1250} y={360} amount={t >= at('nothing') ? '$0.00' : '$ . . .'} />
              </Slam>
            )}
          </g>
        }
      >
        <Cast who="ama" f={f} x={760} y={SEAT_Y} pose={face(G.sit, t >= at('nothing') ? 'sad' : 'half', {mouth: t >= at('nothing') ? 'frown' : 'flat'})}>
          {t < at('Her bank') ? <Remote rotate={-20} /> : <Popcorn y={60} />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip'),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('one hour'), face(G.point, 'open')]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip')} />
            {t >= at('one hour') && (
              <Slam t={t} at={at('one hour')} dist={-260}>
                <BigText text="1 HOUR / DAY" x={1360} y={520} size={130} fill={C.yellow} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },
  {
    at: at("That's three"),
    render: (t, f) => {
      const items: [string, string][] = [
        ['learn', 'LEARN A SKILL'],
        ['start a', 'START A SIDE HUSTLE'],
        ['build', 'BUILD SOMETHING PEOPLE PAY FOR'],
      ];
      return (
        <VStage
          framing={HWIDE(1000, 600)}
          blurBg={<LivingRoom tv={false} />}
          overlay={
            <g>
              <Slam t={t} at={at("That's three")}>
                <BigText text="= 365 HRS / YEAR" x={1360} y={180} size={92} fill={GREEN} rotate={-2} />
              </Slam>
              {items.map(([w, label], i) =>
                t >= at(w) ? (
                  <Slam key={w} t={t} at={at(w)} dist={-220} twist={i % 2 ? 6 : -6}>
                    <Chip x={880} y={320 + i * 120} text={label} size={38} mark="yes" />
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Table x={520} w={460} />
          <Laptop x={520} y={FLOOR_Y - 250} screen="code" />
          <Cast who="ama" f={f} x={260} pose={face(G.hold, 'happy', {armR: [70 + (Math.floor(f / 5) % 2) * 14, -30], mouth: 'smile'})} />
        </VStage>
      );
    },
  },

  // ───────────── NO HOBBIES ─────────────
  {
    at: at('Have no hobbies'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Have no hobbies')} lines={['NO HOBBIES']} pose={face(G.shrug, 'half', {mouth: 'smirk'})} />,
  },
  {
    at: at('Hobbies are'),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.hips, 'wide', {mouth: 'o'})], [at('good at'), face(G.point, 'squint', {mouth: 'smirk'})]])}
        overlay={
          <g>
            <Slam t={t} at={at('dangerous')}>
              <path d="M 1360 140 L 1500 380 L 1220 380 Z" fill={C.yellow} stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
              <text x={1360} y={350} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill={C.ink}>
                !
              </text>
            </Slam>
            {t >= at('good at') && (
              <Slam t={t} at={at('good at')} dist={-240} twist={6}>
                <Chip x={1360} y={510} text="SIDE EFFECTS: SKILLS" size={56} fill={C.yellow} anchor="middle" />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },
  {
    at: at('Christy draws'),
    render: (t, f) => {
      const done = Math.max(0, Math.min(1, (t - at('draws')) / 1.4));
      return (
        <VStage framing={HMEDIUM(980, 560)} blurBg={<LivingRoom wall="#CFE3D4" tv={false} />} overlay={<Slam t={t} at={at('evening')}><Chip x={1300} y={200} text="EVERY EVENING" size={52} /></Slam>}>
          <Easel x={1130} y={FLOOR_Y} done={done} />
          <Cast who="christy" f={f} x={840} pose={face(G.hold, 'happy', {armR: [96 + (Math.floor(f / 6) % 2) * 16, -30], mouth: 'smile', lookX: 10})}>
            <Brush rotate={-30} />
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at('Two years'),
    render: (t, f) => {
      const w = walkTo('obuor', 'fastWalk', t, at('Two years') + 0.3, 1580, 1260);
      const pay = at('fifty');
      return (
        <VStage
          framing={HWIDE(1000, 600)}
          blurBg={<LivingRoom wall="#CFE3D4" tv={false} />}
          overlay={
            <g>
              <Slam t={t} at={at('Two years')}>
                <Chip x={160} y={160} text="2 YEARS LATER" size={56} fill={C.yellow} />
              </Slam>
              {t >= pay && (
                <Slam t={t} at={pay} dist={-300} twist={8}>
                  <BigText text="$50 / PORTRAIT" x={1300} y={240} size={110} fill={GREEN} rotate={-3} />
                </Slam>
              )}
            </g>
          }
        >
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
      <VStage
        framing={HMEDIUM(900, 560)}
        blurBg={<LivingRoom />}
        overlay={
          <Slam t={t} at={at('scrolls')}>
            <BigText text="scrolling… scrolling…" x={1340} y={300} size={80} fill="#B7B0C4" rotate={-3} />
          </Slam>
        }
      >
        <Cast who="mica" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'half', {mouth: 'flat', armR: [60 + (Math.floor(f / 8) % 2) * 6, -50]})}>
          <HandPhone screen="off" rotate={-8} />
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Same phone'),
    render: (t, f) => (
      <VStage
        framing={HWIDE(960, 600)}
        blurBg={<Studio t={0} />}
        overlay={
          <g>
            <Slam t={t} at={at('Same phone')}>
              <BigText text="SAME PHONE." x={960} y={170} size={100} rotate={-2} />
            </Slam>
            {t >= at('Different') && (
              <Slam t={t} at={at('Different')} dist={-280} twist={8}>
                <BigText text="DIFFERENT RESULT." x={960} y={300} size={100} fill={C.yellow} rotate={2} />
                <Chip x={300} y={520} text="$0" size={56} fill="#E6E1EA" anchor="middle" />
                <Chip x={1640} y={520} text="+$50" size={56} fill={GREEN} anchor="middle" />
              </Slam>
            )}
          </g>
        }
      >
        <Cast who="mica" f={f} x={560} pose={face(G.hold, 'half', {mouth: 'flat'})}>
          <HandPhone screen="off" />
        </Cast>
        <Cast who="christy" f={f} x={1360} facing={-1} pose={face(G.hold, 'happy', {mouth: 'grin'})}>
          <HandPhone screen="listing" />
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip', 2),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('making'), face(G.open, 'open')], [at('every week'), face(G.point, 'happy')]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip', 2)} />
            {(
              [
                ['making', 'MAKE'],
                ['fixing', 'FIX'],
                ['doing', 'DO'],
              ] as [string, string][]
            ).map(([w, label], i) =>
              t >= at(w) ? (
                <Slam key={w} t={t} at={at(w)} dist={-220} twist={i % 2 ? 8 : -8}>
                  <Chip x={1110 + i * 270} y={400} text={label} size={60} fill={C.yellow} anchor="middle" />
                </Slam>
              ) : null,
            )}
            {t >= at('every week') && (
              <Slam t={t} at={at('every week')} dist={-260}>
                <BigText text="EVERY WEEK" x={1340} y={620} size={110} fill={GREEN} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },
  {
    at: at('Skills'),
    render: (t, f) => {
      const s0 = at('Skills');
      const steps = Math.min(5, Math.floor((t - s0) / 0.45) + 1);
      return (
        <VStage
          framing={HMEDIUM(EBO_X - 380, 600)}
          bg={PLUM}
          blurBg={<ChapterRoom />}
          overlay={
            <g>
              {Array.from({length: steps}).map((_, i) => (
                <Slam key={i} t={t} at={s0 + i * 0.45} dist={-180} twist={0}>
                  <rect x={150 + i * 180} y={720 - (i + 1) * 90} width={150} height={(i + 1) * 90} rx={10} fill={i === 4 ? GREEN : '#8F6BD1'} stroke={C.ink} strokeWidth={8} />
                </Slam>
              ))}
              <Still>
                <text x={150} y={790} fontFamily={FONT} fontWeight={900} fontSize={44} fill={CREAM} letterSpacing={6}>
                  SKILL, WEEK BY WEEK
                </text>
              </Still>
              {t >= at('paying') && (
                <Slam t={t} at={at('paying')} dist={-300} twist={-10}>
                  <BigText text="$$$" x={870} y={250} size={150} fill={GREEN} rotate={-6} />
                </Slam>
              )}
            </g>
          }
        >
          <Ebo f={f} pose={snapPose(t, [[0, face(G.present, 'open')], [at('paying'), face(G.celebrate, 'happy', {mouth: 'grin'})]])} />
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
      <VStage
        framing={HMEDIUM(820, 600)}
        blurBg={<Bedroom />}
        overlay={
          <g>
            {t >= at('minimum') && (
              <Slam t={t} at={at('minimum')}>
                <Chip x={1240} y={200} text="DO THE MINIMUM" size={56} fill="#E6E1EA" />
              </Slam>
            )}
            {t >= at('sleep') && (
              <Slam t={t} at={at('sleep')} dist={-200}>
                <BigText text="Z z z" x={560} y={240} size={90} fill={CREAM} rotate={-8} />
              </Slam>
            )}
          </g>
        }
      >
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
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.shrug, 'half', {mouth: 'smirk'})], [at('because passion'), face(G.raise, 'open')]])}
        overlay={
          <g>
            {(
              [
                ['work harder', 'WORK HARDER'],
                ['notice', 'NOTICE PROBLEMS'],
                ['keep going', "KEEP GOING WHEN IT'S BORING"],
              ] as [string, string][]
            ).map(([w, label], i) =>
              t >= at(w) ? (
                <Slam key={w} t={t} at={at(w)} dist={-220} twist={i % 2 ? 6 : -6}>
                  <Chip x={1000} y={260 + i * 130} text={label} size={40} mark="yes" />
                </Slam>
              ) : null,
            )}
            {t >= at('because passion') && (
              <Slam t={t} at={at('because passion')}>
                <BigText text="PASSION MAKES YOU…" x={1040} y={160} size={56} anchor="start" />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },
  {
    at: at('Obuor loves'),
    render: (t, f) => (
      <VStage
        framing={HWIDE(1000, 600)}
        blurBg={<SneakerRoom />}
        overlay={
          <g>
            {t >= at('release') && (
              <Slam t={t} at={at('release')}>
                <Chip x={1180} y={620} text="EVERY DROP DATE" size={46} fill={C.yellow} />
              </Slam>
            )}
            {t >= at("That's not") && t < at('market') && (
              <Slam t={t} at={at("That's not")}>
                <BigText text="WASTED TIME?" x={600} y={170} size={96} fill="#B7B0C4" rotate={-3} />
              </Slam>
            )}
            {t >= at('market') && (
              <Slam t={t} at={at('market')} dist={-300} twist={8}>
                <BigText text="MARKET RESEARCH" x={600} y={170} size={110} fill={GREEN} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      >
        <Cast who="obuor" f={f} x={700} pose={t < at('market') ? face(G.hold, 'happy', {mouth: 'grin'}) : face(G.celebrate, 'dollar', {mouth: 'grin'})}>
          {t < at('market') && <Sneakers x={0} y={40} color={C.red} />}
        </Cast>
      </VStage>
    ),
  },
  {
    at: at('Flip', 3),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.hold, 'happy')], [at('who would'), face(G.point, 'open', {brows: 'up'})]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip', 3)} />
            {t >= at('write down') && (
              <Slam t={t} at={at('write down')}>
                <rect x={1050} y={290} width={620} height={330} rx={16} fill={C.white} stroke={C.ink} strokeWidth={8} />
                <text x={1080} y={350} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
                  I COULD TALK ABOUT…
                </text>
                {[0, 1, 2].map((i) => (
                  <line key={i} x1={1090} x2={1620 - i * 80} y1={430 + i * 70} y2={430 + i * 70} stroke="#4D8FD6" strokeWidth={8} strokeLinecap="round" />
                ))}
              </Slam>
            )}
            {t >= at('who would') && (
              <Slam t={t} at={at('who would')} dist={-300} twist={-8}>
                <BigText text="WHO WOULD PAY FOR THIS?" x={1360} y={760} size={74} fill={C.yellow} rotate={-2} />
              </Slam>
            )}
          </g>
        }
      >
        <Notebook rotate={-10} />
      </EboTalk>
    ),
  },

  // ───────────── COMFORT ZONE ─────────────
  {
    at: at('Stay in your'),
    render: (t, f) => <ChapterShot t={t} f={f} from={at('Stay in your')} lines={['STAY IN YOUR', 'COMFORT ZONE']} pose={face(G.sit, 'happy', {mouth: 'smile'})} />,
  },
  {
    at: at('Same job'),
    render: (t, f) => {
      const lines: [string, string][] = [
        ['Same job', 'SAME JOB.'],
        ['Same routine', 'SAME ROUTINE.'],
        ['Same excuses', 'SAME EXCUSES.'],
      ];
      return (
        <VStage
          framing={HWIDE(1400, 600)}
          blurBg={<Office t={0} />}
          overlay={
            <g>
              {lines.map(([w, label], i) =>
                t >= at(w) ? (
                  <Slam key={w} t={t} at={at(w)} dist={-200} twist={i % 2 ? 6 : -6}>
                    <BigText text={label} x={1260} y={220 + i * 130} size={96} fill={i === 2 ? C.red : '#fff'} rotate={-2} />
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Cast who="mica" f={f} x={1260} pose={face(G.slouch, 'half', {mouth: 'flat'})} />
        </VStage>
      );
    },
  },
  {
    at: at('Never ask for'),
    render: (t, f) => {
      const items: [string, string][] = [
        ['Never ask for', 'ASK FOR A RAISE'],
        ['never apply', 'APPLY ANYWHERE NEW'],
        ['never try', 'TRY SELLING ANYTHING'],
      ];
      return (
        <VStage
          framing={HWIDE(1400, 600)}
          blurBg={<Office t={0} />}
          overlay={
            <g>
              {items.map(([w, label], i) =>
                t >= at(w) ? (
                  <Slam key={w} t={t} at={at(w)} dist={-200} twist={i % 2 ? 6 : -6}>
                    <Chip x={140} y={240 + i * 140} text={label} size={52} mark="no" />
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Cast who="mica" f={f} x={1260} pose={face(G.slouch, 'half', {mouth: 'flat', lookX: Math.floor(f / 10) % 2 ? 12 : -12})} />
        </VStage>
      );
    },
  },
  {
    at: at('Comfortable feels'),
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(900, 560)}
        blurBg={<LivingRoom />}
        overlay={
          <Slam t={t} at={at('safe')}>
            <Chip x={1180} y={240} text="FEELS SAFE" size={60} mark="yes" />
          </Slam>
        }
      >
        <Cast who="obuor" f={f} x={760} y={SEAT_Y} pose={face(G.sit, 'happy', {mouth: 'smile', armR: [30, 20]})} />
      </VStage>
    ),
  },
  {
    at: at('But a hamster'),
    render: (t, f) => {
      const k = Math.floor(f / 3);
      return (
        <VStage
          framing={{zoom: 1.3, cx: 900, cy: 620}}
          bg={PLUM}
          blurBg={<ChapterRoom />}
          overlay={
            <g>
              {t >= at('runs') && (
                <Slam t={t} at={at('runs')}>
                  <Chip x={160} y={200} text="RUNS ALL DAY" size={60} fill={C.yellow} />
                </Slam>
              )}
              {t >= at('nowhere') && (
                <Slam t={t} at={at('nowhere')} dist={-300} twist={-8}>
                  <BigText text="…GOES NOWHERE" x={1420} y={260} size={110} fill={C.red} rotate={-3} />
                </Slam>
              )}
            </g>
          }
        >
          {/* the wheel turns in 10° steps; with 12 spokes there are only three distinct looks */}
          <HamsterWheel x={900} y={FLOOR_Y} spin={(k % 3) * 10} step={k} />
        </VStage>
      );
    },
  },
  {
    at: at('Flip', 4),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('uncomfortable'), face(G.point, 'open')]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip', 4)} />
            {t >= at('uncomfortable') && (
              <Slam t={t} at={at('uncomfortable')} dist={-280}>
                <BigText text="1 UNCOMFORTABLE" x={1360} y={460} size={104} fill={C.yellow} rotate={-3} />
                <BigText text="THING A WEEK" x={1360} y={590} size={104} fill={C.yellow} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      />
    ),
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
            <g>
              <Slam t={t} at={at('Send')}>
                <Chip x={160} y={160} text="SEND THE EMAIL" size={60} mark="yes" />
              </Slam>
              {p > 0 && p < 1 && (
                <g transform={`translate(${880 + p * 900} ${520 - p * 360}) rotate(${-20 - p * 10})`}>
                  <rect x={-70} y={-46} width={140} height={92} rx={8} fill={C.white} stroke={C.ink} strokeWidth={7} />
                  <path d="M -70 -46 L 0 10 L 70 -46" fill="none" stroke={C.ink} strokeWidth={6} />
                </g>
              )}
            </g>
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
          <g>
            <Slam t={t} at={at('Ask for the raise')}>
              <Chip x={160} y={160} text="ASK FOR THE RAISE" size={60} mark="yes" />
            </Slam>
            <Slam t={t} at={at('raise.')}>
              <Bubble x={820} y={250} text="Can we talk about a raise?" size={44} tail="left" />
            </Slam>
          </g>
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
      <VStage
        framing={HMEDIUM(900, 560)}
        blurBg={<LivingRoom wall="#F2D7D9" tv={false} />}
        overlay={
          <g>
            <Slam t={t} at={at('Post')}>
              <Chip x={160} y={160} text="POST THE FIRST VIDEO" size={60} mark="yes" />
            </Slam>
            <Slam t={t} at={at('video.')}>
              <Chip x={1180} y={380} text="UPLOADED" size={56} fill={GREEN} mark="yes" />
            </Slam>
          </g>
        }
      >
        <Cast who="ama" f={f} x={820} pose={face(G.hold, 'happy', {mouth: 'grin', armR: [96, -40]})}>
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
      <VStage
        framing={HWIDE(1000, 600)}
        blurBg={<LivingRoom wall="#4A3B5E" tv={false} />}
        overlay={
          <g>
            <Slam t={t} at={at('The lottery')}>
              <Bubble x={1140} y={110} text="THE LOTTERY" size={48} tail="left" />
            </Slam>
            {t >= at('rich uncle') && (
              <Slam t={t} at={at('rich uncle')}>
                <Bubble x={1220} y={290} text="A RICH UNCLE" size={48} tail="left" />
              </Slam>
            )}
            {t >= at('viral') && (
              <Slam t={t} at={at('viral')}>
                <Bubble x={1120} y={470} text="GOING VIRAL BY ITSELF" size={48} tail="left" />
              </Slam>
            )}
          </g>
        }
      >
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
    at: at('The odds'),
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(EBO_X - 380, 600)}
        bg={PLUM}
        blurBg={<ChapterRoom />}
        overlay={
          <g>
            <Still>
              <text x={150} y={250} fontFamily={FONT} fontWeight={900} fontSize={48} fill={CREAM} letterSpacing={6}>
                ODDS OF A BIG JACKPOT
              </text>
            </Still>
            {t >= at('one in') && (
              <Slam t={t} at={at('one in')} dist={-300} twist={-6}>
                <text x={150} y={420} fontFamily={FONT} fontWeight={900} fontSize={118} fill={C.yellow}>
                  1 in 300,000,000
                </text>
              </Slam>
            )}
            {t >= at('struck') && (
              <Slam t={t} at={at('struck')} dist={-300} twist={10}>
                <path d="M 260 520 L 180 700 L 250 700 L 200 860 L 360 650 L 280 650 L 340 520 Z" fill={C.yellow} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
                <text x={400} y={720} fontFamily={FONT} fontWeight={900} fontSize={64} fill={CREAM}>
                  LIGHTNING IS MORE LIKELY
                </text>
              </Slam>
            )}
          </g>
        }
      >
        <Ebo f={f} pose={snapPose(t, [[0, face(G.present, 'open')], [at('struck'), face(G.shrug, 'wide', {mouth: 'o'})]])} />
      </VStage>
    ),
  },
  {
    at: at('Flip', 5),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('luck'), face(G.point, 'open')]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip', 5)} />
            {t >= at('luck') && (
              <Slam t={t} at={at('luck')} dist={-280}>
                <BigText text="MAKE YOUR" x={1360} y={460} size={110} fill={C.yellow} rotate={-3} />
                <BigText text="OWN LUCK" x={1360} y={590} size={110} fill={C.yellow} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },
  {
    at: at('Small bets'),
    render: (t, f) => {
      const tries = ['PITCH', 'POST', 'APPLY', 'SELL', 'ASK', 'BUILD'];
      const s0 = at('Small bets');
      const win = at('win');
      return (
        <VStage
          framing={HWIDE(1000, 600)}
          blurBg={<Studio t={0} />}
          overlay={
            <g>
              <Slam t={t} at={s0}>
                <BigText text="SMALL BETS, DONE OFTEN" x={1240} y={170} size={78} rotate={-2} />
              </Slam>
              {tries.map((label, i) =>
                t >= s0 + 0.4 + i * 0.35 ? (
                  <Slam key={label} t={t} at={s0 + 0.4 + i * 0.35} dist={-200} twist={i % 2 ? 10 : -10}>
                    <g transform={`translate(${900 + (i % 3) * 300} ${330 + Math.floor(i / 3) * 190}) rotate(${(i % 2 ? 1 : -1) * 4})`}>
                      <rect x={-130} y={-62} width={260} height={124} rx={10} fill="#FFE680" stroke={C.ink} strokeWidth={7} />
                      <line x1={70} x2={70} y1={-62} y2={62} stroke={C.ink} strokeWidth={4} strokeDasharray="8 8" />
                      <text x={-30} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
                        {label}
                      </text>
                      {t >= win && i % 2 === 0 && (
                        <g transform="rotate(-12)">
                          <rect x={-110} y={-30} width={170} height={60} rx={8} fill="none" stroke={C.moneyDark} strokeWidth={7} />
                          <text x={-25} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.moneyDark}>
                            PAID
                          </text>
                        </g>
                      )}
                    </g>
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Ebo f={f} x={420} pose={snapPose(t, [[0, face(G.present, 'open')], [win, face(G.celebrate, 'dollar', {mouth: 'grin'})]])} />
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
    at: at('The economy'),
    render: (t, f) => {
      const blames: [string, string, number, number][] = [
        ['The economy', 'THE ECONOMY', 160, 200],
        ['Your boss', 'MY BOSS', 1340, 200],
        ['Your parents', 'MY PARENTS', 160, 420],
        ['The weather', 'THE WEATHER', 1340, 420],
      ];
      const k = blames.filter(([w]) => t >= at(w)).length;
      return (
        <VStage
          framing={HWIDE(960, 600)}
          blurBg={<LivingRoom wall="#F2D7D9" />}
          overlay={
            <g>
              {blames.map(([w, label, x, y], i) =>
                t >= at(w) ? (
                  <Slam key={w} t={t} at={at(w)} dist={-200} twist={i % 2 ? 8 : -8}>
                    <Chip x={x} y={y} text={label} size={56} fill={C.yellow} />
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Cast who="mica" f={f} x={960} facing={k % 2 ? -1 : 1} pose={face(POSES.pointing, 'squint', {mouth: 'scream', brows: 'angry'})} />
        </VStage>
      );
    },
  },
  {
    at: at('Blaming'),
    render: (t, f) => (
      <VStage
        framing={HMEDIUM(900, 560)}
        blurBg={<LivingRoom wall="#F2D7D9" />}
        overlay={
          <g>
            {t >= at('your job') && (
              <Slam t={t} at={at('your job')}>
                <Chip x={1150} y={220} text="NOT MY JOB" size={60} mark="yes" />
              </Slam>
            )}
            {t >= at('It also') && (
              <Slam t={t} at={at('It also')} dist={-300} twist={8}>
                <BankCard x={1250} y={360} amount="$0.00" />
              </Slam>
            )}
            {t >= at('nothing changes') && (
              <Slam t={t} at={at('nothing changes')} dist={-260}>
                <BigText text="NOTHING CHANGES" x={1470} y={720} size={78} fill={C.red} rotate={-3} />
              </Slam>
            )}
          </g>
        }
      >
        <Calendar x={420} y={330} day={1 + (Math.floor((t - at('It also')) * 8) % 30 + 30) % 30} month="SAME" />
        <Cast who="mica" f={f} x={760} y={SEAT_Y} pose={face(G.sit, t < at('It also') ? 'happy' : 'half', {mouth: t < at('It also') ? 'grin' : 'flat', armR: [30, 20]})} />
      </VStage>
    ),
  },
  {
    at: at('Flip', 6),
    render: (t, f) => (
      <EboTalk
        t={t}
        f={f}
        pose={snapPose(t, [[0, face(G.raise, 'happy')], [at('What part'), face(G.point, 'open', {brows: 'up'})], [at('Start there'), face(G.hips, 'happy', {mouth: 'grin'})]])}
        overlay={
          <g>
            <FlipPill t={t} at={at('Flip', 6)} />
            {t >= at('ask one question') && (
              <Slam t={t} at={at('ask one question')}>
                <BigText text="ASK ONE QUESTION:" x={1060} y={390} size={60} anchor="start" />
              </Slam>
            )}
            {t >= at('What part') && (
              <Slam t={t} at={at('What part')} dist={-280} twist={-6}>
                <BigText text="WHAT CAN I CONTROL?" x={1380} y={520} size={92} fill={C.yellow} rotate={-3} />
              </Slam>
            )}
            {t >= at('Start there') && (
              <Slam t={t} at={at('Start there')} dist={-260}>
                <BigText text="START THERE." x={1380} y={680} size={100} fill={GREEN} rotate={2} />
              </Slam>
            )}
          </g>
        }
      />
    ),
  },

  // ───────────── WRAP-UP ─────────────
  {
    at: at("So here's"),
    render: (t, f) => {
      const keys: [string, number][] = [
        ['TV all day', 2],
        ['No hobbies', 2],
        ['No passion', 2],
        ['Stay comfortable', 1],
        ['Wait for magic', 2],
        ['Blame everyone', 2],
      ];
      return (
        <VStage
          framing={HMEDIUM(EBO_X - 380, 600)}
          bg={PLUM}
          blurBg={<ChapterRoom />}
          overlay={
            <g>
              <Slam t={t} at={at("So here's")}>
                <text x={150} y={170} fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.red} letterSpacing={6}>
                  THE RECIPE TO STAY POOR
                </text>
              </Slam>
              {keys.map(([w, n], i) =>
                t >= at(w, n) ? (
                  <Slam key={w} t={t} at={at(w, n)} dist={-200} twist={i % 2 ? 6 : -6}>
                    <Chip x={150} y={270 + i * 100} text={HABITS[i]} size={40} mark="no" />
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <Ebo f={f} pose={face(G.hips, 'half', {mouth: 'smirk'})} />
        </VStage>
      );
    },
  },
  {
    at: at("And here's"),
    render: (t, f) => {
      const s0 = at('opposite', 2);
      return (
        <VStage
          framing={HMEDIUM(EBO_X - 380, 600)}
          bg="#1E3A2E"
          blurBg={
            <g>
              <rect x={-1000} y={-900} width={4000} height={1800} fill="#1E3A2E" />
              <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#16291F" />
            </g>
          }
          overlay={
            <g>
              <Slam t={t} at={at("And here's")}>
                <text x={150} y={170} fontFamily={FONT} fontWeight={900} fontSize={64} fill={GREEN} letterSpacing={6}>
                  THE RECIPE TO GET RICH
                </text>
              </Slam>
              {RICH.map((r, i) =>
                t >= s0 + i * 0.18 ? (
                  <Slam key={r} t={t} at={s0 + i * 0.18} dist={-200} twist={i % 2 ? 6 : -6}>
                    <Chip x={150} y={260 + i * 92} text={r} size={34} mark="yes" />
                  </Slam>
                ) : null,
              )}
              {t >= at('one small habit') && (
                <Slam t={t} at={at('one small habit')} dist={-260}>
                  <BigText text="ONE SMALL HABIT AT A TIME" x={150} y={860} size={62} fill={C.yellow} anchor="start" rotate={-2} />
                </Slam>
              )}
            </g>
          }
        >
          <Ebo f={f} pose={snapPose(t, [[0, face(G.raise, 'happy')], [s0, face(G.open, 'happy', {mouth: 'grin'})]])} />
        </VStage>
      );
    },
  },
  {
    at: at('Start today'),
    render: (t, f) => {
      const x = 0 + (t - at('Start today')) * cycleSpeed('ebo', 'run');
      return (
        <VStage
          framing={HWIDE(960, 600)}
          blurBg={<Studio t={0} />}
          overlay={
            <Slam t={t} at={at('Start today') + 0.1}>
              <BigText text="START TODAY" x={960} y={220} size={160} fill={C.yellow} rotate={-3} />
            </Slam>
          }
        >
          <Ebo f={f} x={x} cycle="run" pose={face(G.idle, 'happy')} />
        </VStage>
      );
    },
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
