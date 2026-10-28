import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {CycleName, cycleSpeed} from '../cast/cycles';
import {POSES, Pose} from '../components/Character';
import {DollarBill} from '../components/Money';
import {VintageLamp, PriceTag, Sneakers, Radio, MovingBox, Rag, HandPhone} from '../components/FlipProps';
import {FLOOR_Y} from '../backgrounds/Backgrounds';
import {Studio, YardSale, ThriftStore, MovingDay, SaleTable} from './sets';
import {VW, VH, VFPS, Word, makeAt, VStage, WIDE, MEDIUM, CLOSE, snapPose, lipFrame, lipHeadNod, chunkWords, TopCaption, BigText, LessonCard, editTimeline} from './kit';
import {C, FONT} from '../theme';
import {Slam, Still, LayerMode, LayerModeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import wordsJson from './data/ep02-words.json';
import envJson from './data/ep02-env.json';
import editJson from './data/ep02-edit.json';

/**
 * EBO TEACHES MONEY — Episode 2: Flipping (reselling).
 * Ebo teaches to camera; Mica flips a dusty lamp, Christy and Obuor act out the rest.
 * Every cut is timed to the voiceover's word timestamps (src/series/data/ep02-words.json).
 */

const WORDS = wordsJson as Word[];
const ENV = (envJson as {env: number[]}).env;
const at = makeAt(WORDS);
// Ebo's spoken lesson numbers are cut out (scripts/make-edit.mjs); the episode plays through EDIT
const EDIT = editTimeline(editJson.keep as [number, number][]);
const CHUNKS = chunkWords(EDIT.heard(WORDS));
/** Where the voice picks up after the n-th cut lesson number — each lesson shot starts here. */
const lessonAt = (n: number) => (editJson.cuts as [number, number][])[n][1];
export const EP02_DURATION = EDIT.duration;
/** Output frame → frame of the original voiceover timeline (what Ep02Frame takes). */
export const ep02ToSource = EDIT.toSource;

const EBO_X = 760;
const TABLE_X = 1200; // yard-sale / workbench table
const TOP = FLOOR_Y - 226; // table top

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

const Cast: React.FC<{who: CastId; f: number; pose: Pose; x: number; facing?: 1 | -1; cycle?: CycleName; children?: React.ReactNode}> = ({
  who,
  f,
  pose,
  x,
  facing = 1,
  cycle,
  children,
}) => (
  <RigCharacter who={who} x={x} y={FLOOR_Y} facing={facing} t={f} pose={pose} cycle={cycle}>
    {children}
  </RigCharacter>
);

/**
 * Walk from x0 toward x1 on a cycle, at the cycle's own ground speed, then stop.
 * Returns where the character is and whether it is still walking.
 */
const walkTo = (who: CastId, cycle: CycleName, t: number, t0: number, x0: number, x1: number) => {
  const dir = Math.sign(x1 - x0) || 1;
  const dist = Math.max(0, t - t0) * cycleSpeed(who, cycle);
  const done = dist >= Math.abs(x1 - x0);
  return {x: done ? x1 : x0 + dir * dist, walking: !done, facing: (dir > 0 ? 1 : -1) as 1 | -1};
};

type Shot = {at: number; render: (t: number, f: number) => React.ReactNode};

const studio = <Studio t={0} />;

/** The workbench: Ebo's studio with the folding table. */
const Workbench: React.FC = () => (
  <g>
    <Studio t={0} />
    <SaleTable x={TABLE_X} />
  </g>
);

const YardWithTable: React.FC = () => (
  <g>
    <YardSale />
    <SaleTable x={TABLE_X} />
  </g>
);

/** Yard-sale goods on the table. */
const Goods: React.FC<{tags?: boolean; lampOn?: boolean; lampDust?: number; sneakerTag?: string}> = ({tags = true, lampOn = false, lampDust = 1, sneakerTag = '$3'}) => (
  <g>
    <VintageLamp x={TABLE_X - 170} y={TOP} dust={lampDust} on={lampOn} />
    <Sneakers x={TABLE_X + 20} y={TOP} color={C.red} />
    <Radio x={TABLE_X + 190} y={TOP} />
    {tags && <PriceTag x={TABLE_X - 120} y={TOP + 8} text="$5" rotate={-6} />}
    {tags && <PriceTag x={TABLE_X + 30} y={TOP + 8} text={sneakerTag} rotate={5} />}
  </g>
);

/** A speech bubble graphic in screen space. */
const Bubble: React.FC<{x: number; y: number; w: number; text: string; tail?: 'left' | 'right'; fill?: string; color?: string; size?: number}> = ({
  x,
  y,
  w,
  text,
  tail = 'left',
  fill = C.white,
  color = C.ink,
  size = 60,
}) => (
  <g>
    <path d={tail === 'left' ? `M ${x + 60} ${y + 100} L ${x + 30} ${y + 160} L ${x + 120} ${y + 100} Z` : `M ${x + w - 60} ${y + 100} L ${x + w - 30} ${y + 160} L ${x + w - 120} ${y + 100} Z`} fill={fill} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={x} y={y} width={w} height={110} rx={40} fill={fill} stroke={C.ink} strokeWidth={8} />
    <text x={x + w / 2} y={y + 55 + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
      {text}
    </text>
  </g>
);

/** Big phone mock-up (a graphic, not a prop): the listing being built, then the chat. */
const PhoneUI: React.FC<{t: number; mode: 'listing' | 'chat'}> = ({t, mode}) => {
  const X = 240;
  const Y = 260;
  const W = 600;
  const H = 1100;
  const light = at('light,');
  const title = at('title,');
  const price = at('honest');
  return (
    <g>
      <Still>
        <rect x={X} y={Y} width={W} height={H} rx={70} fill={C.ink} />
        <rect x={X + 26} y={Y + 70} width={W - 52} height={H - 140} rx={30} fill="#F6F0E4" />
        <rect x={X + W / 2 - 60} y={Y + 26} width={120} height={22} rx={11} fill="#333" />
        <text x={X + 60} y={Y + 140} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
          {mode === 'listing' ? 'New listing' : 'Messages'}
        </text>
      </Still>
      {mode === 'listing' && (
        <g>
          {t >= light && (
            <Slam t={t} at={light}>
              <rect x={X + 60} y={Y + 180} width={W - 120} height={400} rx={20} fill="#FFE9A8" stroke={C.ink} strokeWidth={6} />
              <path d={`M ${X + 220} ${Y + 470} L ${X + 380} ${Y + 470} L ${X + 350} ${Y + 380} L ${X + 250} ${Y + 380} Z`} fill="#F7C873" stroke={C.ink} strokeWidth={6} />
              <rect x={X + 292} y={Y + 470} width={16} height={70} fill="#B8873E" stroke={C.ink} strokeWidth={4} />
              <text x={X + W / 2} y={Y + 240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#B5543C">
                GOOD LIGHT
              </text>
            </Slam>
          )}
          {t >= title && (
            <Slam t={t} at={title}>
              <text x={X + 60} y={Y + 670} fontFamily={FONT} fontWeight={900} fontSize={50} fill={C.ink}>
                Vintage lamp
              </text>
              <text x={X + 60} y={Y + 725} fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.gray}>
                Works great · cleaned
              </text>
            </Slam>
          )}
          {t >= price && (
            <Slam t={t} at={price}>
              <rect x={X + 60} y={Y + 780} width={240} height={110} rx={24} fill={C.moneyDark} stroke={C.ink} strokeWidth={6} />
              <text x={X + 180} y={Y + 858} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#fff">
                $25
              </text>
            </Slam>
          )}
        </g>
      )}
      {mode === 'chat' && (
        <g>
          <Slam t={t} at={at('answer')}>
            <Bubble x={X + 50} y={Y + 220} w={460} text="Still available?" size={44} />
          </Slam>
          {t >= at('fast.') && (
            <Slam t={t} at={at('fast.')}>
              <Bubble x={X + 90} y={Y + 440} w={460} text="Yes! Today?" tail="right" fill="#7BE07B" size={48} />
            </Slam>
          )}
        </g>
      )}
    </g>
  );
};

const SHOTS: Shot[] = [
  // ── HOOK ──
  {
    at: 0,
    render: (t, f) => (
      <VStage
        framing={WIDE(1060, 640)}
        blurBg={<YardSale />}
        overlay={
          <Slam t={t} at={at('five')}>
            <BigText text="$5" x={VW / 2} y={1500} size={260} fill={C.red} rotate={-6} />
          </Slam>
        }
      >
        <SaleTable x={TABLE_X} />
        <Goods />
        <Cast who="mica" f={f} x={860} pose={snapPose(t, [[0, face(G.idle, 'open', {mouth: 'smile'})], [at('five'), face(G.point, 'dollar', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },
  {
    at: at('Sell'),
    render: (t, f) => {
      const pay = at('forty.');
      return (
        <VStage
          framing={WIDE(1000, 640)}
          blurBg={<YardSale />}
          overlay={
            <Slam t={t} at={pay}>
              <BigText text="$40" x={VW / 2} y={1500} size={260} fill="#7BE07B" rotate={-5} />
            </Slam>
          }
        >
          <Cast who="mica" f={f} x={820} pose={face(G.hold, 'happy', {mouth: 'grin'})}>
            <VintageLamp x={0} y={110} dust={0} on />
          </Cast>
          <Cast who="christy" f={f + 7} x={1190} facing={-1} pose={snapPose(t, [[0, face(G.idle, 'open', {mouth: 'o'})], [pay - 0.25, face(G.hold, 'happy', {mouth: 'smile'})]])}>
            {t >= pay - 0.25 && <DollarBill scale={0.6} />}
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at("Let's"),
    render: (t, f) => (
      <VStage
        framing={WIDE(900)}
        blurBg={studio}
        overlay={
          <g>
            <Slam t={t} at={at("Let's")}>
              <rect x={VW / 2 - 300} y={300} width={600} height={80} rx={40} fill={C.ink} />
              <text x={VW / 2} y={354} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.yellow} letterSpacing={6}>
                EBO TEACHES MONEY
              </text>
            </Slam>
            <Slam t={t} at={at('flipping.')} dist={-260} twist={12}>
              <BigText text="FLIPPING" x={VW / 2} y={600} size={170} fill={C.yellow} rotate={-3} />
            </Slam>
          </g>
        }
      >
        <SaleTable x={TABLE_X} />
        <VintageLamp x={TABLE_X - 60} y={TOP} on />
        <PriceTag x={TABLE_X + 100} y={TOP + 8} text="$40" rotate={-4} />
        <Ebo f={f} pose={face(G.present, 'happy')} />
      </VStage>
    ),
  },
  // ── LESSON 1: BUY BELOW VALUE ──
  {
    at: lessonAt(0),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio} overlay={<LessonCard tSec={t} at={lessonAt(0)} title="BUY BELOW VALUE" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, face(G.raise, 'open')], [at('value.'), face(G.point, 'squint', {mouth: 'smirk'})]])} />
      </VStage>
    ),
  },
  {
    at: at('Yard'),
    render: (t, f) => {
      const w = walkTo('mica', 'fastWalk', t, at('Yard'), 640, 880);
      return (
        <VStage
          framing={WIDE(1000, 640)}
          blurBg={<YardSale />}
          overlay={
            <Slam t={t} at={at('Yard')}>
              <BigText text="YARD SALES" x={VW / 2} y={1500} size={150} fill={C.yellow} rotate={-4} />
            </Slam>
          }
        >
          <SaleTable x={TABLE_X} />
          <Goods />
          <Cast who="mica" f={f} x={w.x} facing={w.facing} cycle={w.walking ? 'fastWalk' : undefined} pose={face(G.idle, w.walking ? 'open' : 'dollar', {mouth: 'grin'})} />
        </VStage>
      );
    },
  },
  {
    at: at('thrift'),
    render: (t, f) => {
      const x = 700 + (t - at('thrift')) * cycleSpeed('christy', 'walk');
      return (
        <VStage
          framing={WIDE(960, 640)}
          blurBg={<ThriftStore />}
          overlay={
            <Slam t={t} at={at('thrift')}>
              <BigText text="THRIFT STORES" x={VW / 2} y={1500} size={130} fill={C.yellow} rotate={3} />
            </Slam>
          }
        >
          <Radio x={1260} y={FLOOR_Y} />
          <PriceTag x={1300} y={FLOOR_Y - 104} text="$4" rotate={8} />
          <Cast who="christy" f={f} x={x} cycle="walk" pose={face(G.idle, 'open', {mouth: 'smile'})} />
        </VStage>
      );
    },
  },
  {
    at: at('people'),
    render: (t, f) => {
      const x = 1300 - (t - at('people')) * cycleSpeed('obuor', 'fastWalk');
      return (
        <VStage
          framing={WIDE(1000, 640)}
          blurBg={<MovingDay />}
          overlay={
            <Slam t={t} at={at('moving')}>
              <BigText text="MOVING OUT" x={VW / 2} y={1500} size={150} fill={C.yellow} rotate={-3} />
            </Slam>
          }
        >
          <MovingBox x={640} y={FLOOR_Y} label="FREE" />
          <MovingBox x={800} y={FLOOR_Y} w={140} rotate={-3} />
          <Cast who="obuor" f={f} x={x} facing={-1} cycle="fastWalk" pose={face(G.idle, 'happy', {mouth: 'grin'})}>
            <Sneakers x={0} y={40} color={C.blue} />
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at('Look'),
    render: (t, f) => (
      <VStage
        framing={WIDE(1060, 620)}
        blurBg={<YardSale />}
        overlay={
          <g>
            <Slam t={t} at={at('want,')}>
              <BigText text="WORTH $60" x={VW / 2} y={1360} size={130} fill="#7BE07B" rotate={-4} />
            </Slam>
            {t >= at('nobody') && (
              <Slam t={t} at={at('nobody')} dist={-300} twist={10}>
                <BigText text="PRICED $3" x={VW / 2} y={1540} size={130} fill={C.red} rotate={3} />
              </Slam>
            )}
          </g>
        }
      >
        <SaleTable x={TABLE_X} />
        <Goods />
        <Cast who="mica" f={f} x={880} pose={snapPose(t, [[0, face(G.point, 'open', {lookX: 10})], [at('nobody'), face(G.shrug, 'dollar', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },
  // ── LESSON 2: CLEAN IT UP ──
  {
    at: lessonAt(1),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio} overlay={<LessonCard tSec={t} at={lessonAt(1)} title="CLEAN IT UP" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, face(G.raise, 'open')], [at('up.'), face(G.open, 'happy')]])} />
      </VStage>
    ),
  },
  {
    at: at('A dusty'),
    render: (t, f) => (
      <VStage
        framing={WIDE(1060, 640)}
        blurBg={studio}
        overlay={
          <Slam t={t} at={at('five', 2)}>
            <BigText text="$5" x={VW / 2} y={1500} size={240} fill={C.red} rotate={-5} />
          </Slam>
        }
      >
        <SaleTable x={TABLE_X} />
        <VintageLamp x={TABLE_X - 40} y={TOP} dust={1} />
        <PriceTag x={TABLE_X + 110} y={TOP + 8} text="$5" rotate={-8} />
        <Cast who="obuor" f={f} x={840} pose={face(G.shrug, 'half', {mouth: 'flat'})} />
      </VStage>
    ),
  },
  {
    at: at('Wipe'),
    render: (t, f) => {
      const wipe = at('Wipe');
      const bulb = at('bulb,');
      const photo = at('take');
      // dust comes off in snaps on each scrub
      const scrubs = Math.floor(Math.max(0, t - wipe) * 6);
      const dust = t >= at('fix') ? 0 : Math.max(0, 1 - scrubs * 0.25);
      const scrubUp = scrubs % 2 === 0;
      const stage = t < at('fix') ? 'wipe' : t < photo ? 'bulb' : 'photo';
      return (
        <VStage
          framing={WIDE(1060, 640)}
          blurBg={studio}
          overlay={
            <g>
              <Slam t={t} at={wipe}>
                <BigText text="WIPE" x={300} y={1380} size={110} rotate={-6} />
              </Slam>
              {t >= bulb && (
                <Slam t={t} at={bulb}>
                  <BigText text="FIX" x={VW / 2} y={1520} size={110} fill={C.yellow} rotate={4} />
                </Slam>
              )}
              {t >= photo && (
                <Slam t={t} at={at('photo...')}>
                  <BigText text="PHOTO" x={780} y={1380} size={110} fill="#9FD3FF" rotate={-3} />
                </Slam>
              )}
            </g>
          }
        >
          <SaleTable x={TABLE_X} />
          <VintageLamp x={TABLE_X - 40} y={TOP} dust={dust} on={t >= bulb} />
          <Cast
            who="mica"
            f={f}
            x={880}
            pose={
              stage === 'wipe'
                ? face(G.hold, 'squint', {armR: [scrubUp ? 95 : 70, scrubUp ? -40 : -10], mouth: 'flat'})
                : stage === 'bulb'
                  ? face(G.raise, 'happy', {mouth: 'grin'})
                  : face(G.hold, 'open', {armR: [88, -30], mouth: 'smile'})
            }
          >
            {stage === 'wipe' && <Rag />}
            {stage === 'photo' && <HandPhone screen="camera" />}
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at('now'),
    render: (t, f) => (
      <VStage
        framing={WIDE(1080, 620)}
        blurBg={studio}
        overlay={
          <g>
            <Slam t={t} at={at('vintage')}>
              <BigText text="VINTAGE" x={VW / 2} y={1330} size={150} fill={C.yellow} rotate={-4} />
            </Slam>
            {t >= at('Twenty-five') && (
              <Slam t={t} at={at('Twenty-five')} dist={-300} twist={10}>
                <BigText text="$25" x={VW / 2} y={1560} size={220} fill="#7BE07B" rotate={4} />
              </Slam>
            )}
          </g>
        }
      >
        <SaleTable x={TABLE_X} />
        <VintageLamp x={TABLE_X - 40} y={TOP} on />
        <PriceTag x={TABLE_X + 110} y={TOP + 8} text={t >= at('Twenty-five') ? '$25' : '$5'} rotate={-8} />
        <Cast who="mica" f={f} x={900} pose={snapPose(t, [[0, face(G.present, 'happy')], [at('Twenty-five'), face(G.celebrate, 'dollar', {mouth: 'grin'})]])} />
      </VStage>
    ),
  },
  // ── LESSON 3: LIST IT WELL ──
  {
    at: lessonAt(2),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio} overlay={<LessonCard tSec={t} at={lessonAt(2)} title="LIST IT WELL" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, face(G.raise, 'open')], [at('well.'), face(G.point, 'open')]])}>
          <HandPhone screen="listing" />
        </Ebo>
      </VStage>
    ),
  },
  {
    at: at('Good light'),
    render: (t) => (
      <VStage framing={WIDE(900)} blurBg={studio} overlay={<PhoneUI t={t} mode="listing" />} />
    ),
  },
  {
    at: at('Then answer'),
    render: (t) => (
      <VStage framing={WIDE(900)} blurBg={studio} overlay={<PhoneUI t={t} mode="chat" />} />
    ),
  },
  {
    at: at('The first'),
    render: (t, f) => {
      const w = walkTo('christy', 'fastWalk', t, at('The first'), 1400, 1150);
      const swap = at('sale.');
      return (
        <VStage
          framing={WIDE(1000, 640)}
          blurBg={<YardSale />}
          overlay={
            <Slam t={t} at={swap}>
              <BigText text="SOLD!" x={VW / 2} y={1500} size={200} fill={C.red} rotate={-6} />
            </Slam>
          }
        >
          <Cast who="mica" f={f} x={820} pose={t < swap ? face(G.hold, 'open', {mouth: 'smile'}) : face(G.hold, 'dollar', {mouth: 'grin'})}>
            {t < swap ? <VintageLamp x={0} y={110} on /> : <DollarBill scale={0.6} />}
          </Cast>
          <Cast who="christy" f={f} x={w.x} facing={-1} cycle={w.walking ? 'fastWalk' : undefined} pose={w.walking ? face(G.idle, 'open') : face(G.hold, 'happy', {mouth: 'grin'})}>
            {!w.walking && (t < swap ? <DollarBill scale={0.6} /> : <VintageLamp x={0} y={110} on />)}
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at('And when'),
    render: (t, f) => (
      <VStage
        framing={MEDIUM(1040, 600)}
        blurBg={<YardSale />}
        overlay={
          <Slam t={t} at={at('haggle?')}>
            <Bubble x={120} y={380} w={380} text="$10?" tail="right" size={90} />
          </Slam>
        }
      >
        <Cast who="christy" f={f} x={1100} facing={-1} pose={face(G.hips, 'squint', {mouth: 'smirk'})} />
      </VStage>
    ),
  },
  {
    at: at('Know'),
    render: (t, f) => (
      <VStage
        framing={CLOSE(EBO_X + 10)}
        blurBg={studio}
        overlay={
          <Slam t={t} at={at('lowest')}>
            <rect x={VW / 2 - 320} y={1300} width={640} height={230} rx={30} fill={C.white} stroke={C.ink} strokeWidth={10} />
            <text x={VW / 2} y={1375} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.gray} letterSpacing={4}>
              MY LOWEST
            </text>
            <text x={VW / 2} y={1485} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={C.moneyDark}>
              $20
            </text>
          </Slam>
        }
      >
        <Ebo f={f} pose={snapPose(t, [[0, face(G.point, 'squint', {mouth: 'smirk'})], [at('before'), face(G.hips, 'half')]])} />
      </VStage>
    ),
  },
  // ── THE MATH ──
  {
    at: at("Here's"),
    render: (t, f) => <MathShot t={t} f={f} />,
  },
  // ── START ──
  {
    at: at('Start'),
    render: (t, f) => {
      const x = 380 + (t - at('Start')) * cycleSpeed('ebo', 'run');
      return (
        <VStage
          framing={WIDE(900)}
          blurBg={studio}
          overlay={
            <Slam t={t} at={at('item.')}>
              <BigText text="1 ITEM" x={VW / 2} y={1500} size={180} fill={C.yellow} rotate={-4} />
            </Slam>
          }
        >
          <Ebo f={f} x={x} cycle="run" pose={face(G.idle, 'happy')}>
            <VintageLamp x={0} y={110} on />
          </Ebo>
        </VStage>
      );
    },
  },
  {
    at: at('Then do'),
    render: (t, f) => {
      const x = 1420 - (t - at('Then do')) * cycleSpeed('ebo', 'run');
      return (
        <VStage
          framing={WIDE(900)}
          blurBg={studio}
          overlay={
            <Slam t={t} at={at('again.')}>
              <BigText text="REPEAT" x={VW / 2} y={1500} size={180} fill="#7BE07B" rotate={4} />
            </Slam>
          }
        >
          <Ebo f={f} x={x} facing={-1} cycle="run" pose={face(G.idle, 'happy')}>
            <Radio x={0} y={90} />
          </Ebo>
        </VStage>
      );
    },
  },
  {
    at: at('Subscribe'),
    render: (t, f) => (
      <VStage
        framing={CLOSE(EBO_X + 10)}
        blurBg={studio}
        overlay={
          <Slam t={t} at={at('Subscribe') + 0.15}>
            <rect x={VW / 2 - 330} y={1330} width={660} height={130} rx={65} fill="#FF0033" stroke={C.ink} strokeWidth={10} />
            <rect x={VW / 2 - 270} y={1360} width={96} height={70} rx={20} fill="#fff" />
            <path d={`M ${VW / 2 - 232} ${1375} L ${VW / 2 - 196} ${1395} L ${VW / 2 - 232} ${1415} Z`} fill="#FF0033" />
            <text x={VW / 2 + 50} y={1418} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#fff" letterSpacing={3}>
              SUBSCRIBE
            </text>
            <text x={VW / 2} y={1540} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" stroke={C.ink} strokeWidth={8} paintOrder="stroke" letterSpacing={4}>
              EBO TEACHES MONEY · EP 2
            </text>
          </Slam>
        }
      >
        <Ebo f={f} pose={face(G.point, 'happy', {mouth: 'grin'})} talk={t < at('more.') + 0.6} />
      </VStage>
    ),
  },
];

/** Chalkboard math, line by line on the words. */
const MathShot: React.FC<{t: number; f: number}> = ({t, f}) => {
  const lines: [number, string, string][] = [
    [at('Buy ten'), '10 items × $5', '#F2F0E6'],
    [at('each.'), '= $50 spent', '#FF9C8F'],
    [at('Sell them'), '10 × $25', '#F2F0E6'],
    [at('twenty-five.', 2), '= $250 back', '#9BE59B'],
  ];
  const profit = at("That's two");
  const board = (
    <g fontFamily="'Comic Sans MS', 'Chalkboard SE', Inter, sans-serif" fontWeight={800}>
      {lines.map(([a, txt, col], i) =>
        t >= a ? (
          <text key={i} x={1240} y={270 + i * 72} fontSize={52} fill={col}>
            {txt}
          </text>
        ) : null,
      )}
      {t >= profit && (
        <g>
          <line x1={1240} x2={1770} y1={572} y2={572} stroke="#F2F0E6" strokeWidth={6} />
          <text x={1240} y={640} fontSize={56} fill={C.yellow}>
            $200 profit
          </text>
        </g>
      )}
    </g>
  );
  return (
    <VStage
      framing={{zoom: 1.3, cx: 1360, cy: 600}}
      blurBg={<Studio t={0} />}
      overlay={
        <g>
          <Slam t={t} at={at('every', 1)}>
            <BigText text="$200/WEEK" x={VW / 2} y={1560} size={160} fill={C.yellow} rotate={-4} />
          </Slam>
          <Still>
            <text x={VW / 2} y={VH - 120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#fff" opacity={0.75}>
              Example numbers — real results vary.
            </text>
          </Still>
        </g>
      }
    >
      <g>{board}</g>
      <Ebo f={f} x={1075} pose={snapPose(t, [[0, face(G.point, 'open')], [profit, face(G.hips, 'happy', {mouth: 'grin'})]])} />
    </VStage>
  );
};

export const shotIndexAt = (f: number) => {
  const t = f / VFPS;
  let idx = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].at) idx = i;
  return idx;
};

/** One frame of the episode (pure — also used by the .fla exporter). */
export const Ep02Frame: React.FC<{f: number; handDrawn?: boolean}> = ({f, handDrawn = true}) => {
  const t = f / VFPS;
  const shot = SHOTS[shotIndexAt(f)];
  return (
    <NoScaleContext.Provider value>
      <HandDrawnContext.Provider value={handDrawn}>
        <AbsoluteFill style={{background: '#000'}}>
          {shot.render(t, f)}
          <TopCaption chunks={CHUNKS} tSec={t} />
        </AbsoluteFill>
      </HandDrawnContext.Provider>
    </NoScaleContext.Provider>
  );
};

/** layer='set' renders only the sets (for the Animate Background layer); see exportCtx.tsx. */
export const EboEp02: React.FC<{layer?: LayerMode; handDrawn?: boolean}> = ({layer = 'full', handDrawn = true}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <Ep02Frame f={EDIT.toSource(f)} handDrawn={handDrawn} />
      {layer === 'full' && <Html5Audio src={staticFile('ebo-ep02/voice-edit.mp3')} />}
    </LayerModeContext.Provider>
  );
};

export const EP02_SHOT_TIMES = SHOTS.map((s) => s.at);
