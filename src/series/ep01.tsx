import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {POSES, Pose, walkPose} from '../components/Character';
import {VendingMachine} from '../components/VendingMachine';
import {Coin, Can, DollarBill} from '../components/Money';
import {Calendar, Crate} from '../components/Props';
import {Hallway, Office, FLOOR_Y} from '../backgrounds/Backgrounds';
import {SITTING} from '../castep/shared';
import {Studio, Gym, School} from './sets';
import {
  VW,
  VH,
  VFPS,
  Word,
  makeAt,
  VStage,
  WIDE,
  MEDIUM,
  CLOSE,
  snapPose,
  stepAt,
  lipFrame,
  lipHeadNod,
  chunkWords,
  TopCaption,
  BigText,
  LessonCard,
} from './kit';
import {C, FONT, lin} from '../theme';
import {Slam, Still, LayerModeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import wordsJson from './data/ep01-words.json';
import envJson from './data/ep01-env.json';

/**
 * EBO TEACHES MONEY — Episode 1: How Vending Machines Make Money.
 * Ebo teaches to camera; the cast act out his examples. Every cut is timed to
 * the ElevenLabs voiceover's word timestamps (src/series/data/ep01-words.json).
 */

const WORDS = wordsJson as Word[];
const ENV = (envJson as {env: number[]}).env;
const at = makeAt(WORDS);
const CHUNKS = chunkWords(WORDS);
export const EP01_DURATION = Math.ceil((WORDS[WORDS.length - 1].e + 1.1) * VFPS);

const EBO_X = 760;
const MX = 1060; // vending machine x in most sets

// ── Ebo's gestures (rotation-only limb poses) ──
const G: Record<string, Pose> = {
  idle: {...POSES.standing, armL: [10, 6], armR: [12, 8]},
  point: {...POSES.standing, armR: [95, -8], armL: [12, 6], brows: 'up'},
  present: {...POSES.standing, armR: [70, -35], armL: [18, 10], brows: 'up'},
  raise: {...POSES.standing, armR: [165, 0], armL: [12, 6], brows: 'up'},
  open: {...POSES.standing, armL: [62, -30], armR: [62, -30]},
  hips: {...POSES.standing, armL: [38, -110], armR: [38, -110], brows: 'up'},
  shrug: {...POSES.standing, armL: [72, -72], armR: [72, -72], headTilt: 8, brows: 'up'},
  celebrate: {...POSES.celebrate, lift: -30},
};
const withFace = (p: Pose, eyes: Pose['eyes'], extra: Partial<Pose> = {}): Pose => ({...p, eyes, ...extra});

/** Ebo, lip-synced to the voiceover. */
const Ebo: React.FC<{f: number; pose: Pose; x?: number; facing?: 1 | -1; talk?: boolean; children?: React.ReactNode}> = ({
  f,
  pose,
  x = EBO_X,
  facing = 1,
  talk = true,
  children,
}) => (
  <RigCharacter
    who="ebo"
    x={x}
    y={FLOOR_Y}
    facing={facing}
    t={f}
    pose={{...pose, headTilt: pose.headTilt + (talk ? lipHeadNod(ENV, f) : 0)}}
    mouthFrame={talk ? lipFrame(ENV, WORDS, f) : undefined}
  >
    {children}
  </RigCharacter>
);

const Cast: React.FC<{who: CastId; f: number; pose: Pose; x: number; facing?: 1 | -1; children?: React.ReactNode}> = ({who, f, pose, x, facing = 1, children}) => (
  <RigCharacter who={who} x={x} y={FLOOR_Y} facing={facing} t={f} pose={pose}>
    {children}
  </RigCharacter>
);

/** A shot = start time + renderer. Hard cut to the next shot. */
type Shot = {at: number; render: (t: number, f: number, local: number) => React.ReactNode};

const studio = (_t: number) => <Studio t={0} />;

const SHOTS: Shot[] = [
  // ── HOOK ──
  {
    at: 0,
    render: (t, f) => (
      <VStage framing={CLOSE(EBO_X + 10)} blurBg={studio(t)}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.point, 'wide')], [at('sleep?'), withFace(G.point, 'happy')]])} />
      </VStage>
    ),
  },
  {
    at: at("Let's"),
    render: (t, f) => (
      <VStage
        framing={WIDE(900)}
        blurBg={studio(t)}
        overlay={
          <g>
            <Slam t={t} at={at("Let's")}>
              <rect x={VW / 2 - 300} y={300} width={600} height={80} rx={40} fill={C.ink} />
              <text x={VW / 2} y={354} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.yellow} letterSpacing={6}>
                EBO TEACHES MONEY
              </text>
            </Slam>
            <Slam t={t} at={at('vending')}>
              <BigText text="VENDING" x={VW / 2} y={540} size={150} rotate={-3} />
            </Slam>
            <Slam t={t} at={at('machines.')} dist={-260} twist={12}>
              <BigText text="MACHINES" x={VW / 2} y={700} size={150} rotate={2} fill={C.yellow} />
            </Slam>
          </g>
        }
      >
        <VendingMachine fx={false} x={MX + 60} y={FLOOR_Y} t={f} fill={1} />
        <Ebo f={f} pose={withFace(G.present, 'happy')} />
      </VStage>
    ),
  },
  // ── LESSON 1: MARGIN ──
  {
    at: at('Lesson one'),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio(t)} overlay={<LessonCard tSec={t} at={at('Lesson one')} n={1} title="MARGIN" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.raise, 'open')], [at('margin.'), withFace(G.open, 'wide')]])} />
      </VStage>
    ),
  },
  {
    at: at('You buy'),
    render: (t, f) => {
      const pay = at('two dollars');
      const coinP = lin(t, [pay, pay + 0.25], [0, 1]);
      const disp = lin(t, [pay + 0.3, pay + 0.6], [0, 1]);
      return (
        <VStage
          framing={WIDE(1150, 640)}
          blurBg={<Office t={0} />}
          overlay={
            <g>
              <Slam t={t} at={at('eighty')}>
                <rect x={70} y={1240} width={430} height={210} rx={30} fill={C.white} stroke={C.ink} strokeWidth={10} />
                <text x={285} y={1310} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.gray} letterSpacing={4}>
                  YOU BUY
                </text>
                <text x={285} y={1410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill={C.red}>
                  $0.80
                </text>
              </Slam>
              <Slam t={t} at={at('sell')} dist={-260} twist={14}>
                <path d="M 520 1345 L 580 1345 L 580 1315 L 630 1360 L 580 1405 L 580 1375 L 520 1375 Z" fill={C.ink} />
                <rect x={580 + 60} y={1240} width={430 - 60} height={210} rx={30} fill={C.white} stroke={C.ink} strokeWidth={10} />
                <text x={825} y={1310} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.gray} letterSpacing={4}>
                  YOU SELL
                </text>
                <text x={825} y={1410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill={C.moneyDark}>
                  $2.00
                </text>
              </Slam>
            </g>
          }
        >
          <Crate x={760} y={FLOOR_Y} />
          <VendingMachine fx={false} x={MX} y={FLOOR_Y} t={f} fill={1} dispense={disp > 0 && disp < 1 ? disp : -1} />
          {coinP > 0 && coinP < 1 && <Coin x={1290 - 120 * coinP} y={720 - 100 * coinP - Math.sin(coinP * Math.PI) * 60} r={16} spin={f * 0.5} />}
          <Cast
            who="christy"
            f={f}
            x={1330}
            facing={-1}
            pose={snapPose(t, [
              [0, {...POSES.standing, eyes: 'open', mouth: 'smile'}],
              [pay - 0.2, {...POSES.standing, armR: [82, 0], eyes: 'open', mouth: 'o'}],
              [pay + 0.7, {...POSES.happy, armR: [40, -40], armL: [20, 10], eyes: 'happy', mouth: 'grin'}],
            ])}
          >
            {t > pay + 0.7 && <Can x={0} y={14} color={C.blue} scale={0.6} />}
          </Cast>
        </VStage>
      );
    },
  },
  {
    at: at("That's"),
    render: (t, f) => (
      <VStage
        framing={CLOSE(EBO_X + 10)}
        blurBg={studio(t)}
        overlay={
          <g>
            <Slam t={t} at={at('dollar twenty')}>
              <BigText text="+$1.20" x={VW / 2} y={1420} size={200} fill="#7BE07B" rotate={-4} />
            </Slam>
            <Slam t={t} at={at('every')} dist={-200} twist={10}>
              <BigText text="EVERY CAN" x={VW / 2} y={1580} size={96} />
            </Slam>
          </g>
        }
      >
        <Ebo f={f} pose={withFace(G.hips, 'half', {mouth: 'smirk'})} />
      </VStage>
    ),
  },
  // ── LESSON 2: LOCATION ──
  {
    at: at('Lesson two'),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio(t)} overlay={<LessonCard tSec={t} at={at('Lesson two')} n={2} title="LOCATION" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.raise, 'open')], [at('everything.'), withFace(G.open, 'wide')]])} />
      </VStage>
    ),
  },
  {
    at: at('Put your'),
    render: (t, f) => (
      <VStage framing={WIDE(970, 640)} blurBg={<Hallway t={0} />} overlay={<CricketsTag t={t} from={at('empty')} />}>
        <VendingMachine fx={false} x={MX + 80} y={FLOOR_Y} t={f} fill={1} />
        <Cast who="obuor" f={f} x={800} pose={{...POSES.standing, armL: [38, -110], armR: [38, -110], eyes: 'open', mouth: 'smile', brows: 'up', lookX: (f % 40) < 20 ? -12 : 12}} />
      </VStage>
    ),
  },
  {
    at: at("and you'll"),
    render: (t, f) => {
      const k = Math.floor((t - at("and you'll")) * 12);
      return (
        <VStage framing={WIDE(970, 620)} blurBg={<Hallway t={0} dim={0.25} />}>
          <Calendar x={560} y={430} day={(k * 7) % 30 + 1} month={['JAN', 'FEB', 'MAR', 'APR', 'MAY'][Math.floor(k / 4) % 5]} flip={(t * 12) % 1} />
          <VendingMachine fx={false} x={MX + 80} y={FLOOR_Y} t={f} fill={1} display="$3.00" />
          <Cast who="obuor" f={f} x={800} pose={{...SITTING, eyes: 'half', mouth: 'flat'}} />
        </VStage>
      );
    },
  },
  {
    at: at('three dollars'),
    render: (t, f) => (
      <VStage
        framing={{zoom: 4.6, cx: 810, cy: 560}}
        screenBg={<rect width={VW} height={VH} fill="#141416" />}
        overlay={
          <Slam t={t} at={at('three dollars') + 0.1}>
            <BigText text="$3 / MONTH" x={VW / 2} y={1500} size={150} fill={C.red} rotate={-5} />
          </Slam>
        }
      >
        <Cast who="obuor" f={f} x={800} pose={{...POSES.devastated, eyes: 'wide', mouth: 'scream'}} />
      </VStage>
    ),
  },
  {
    at: at('Put it'),
    render: (t, f) => (
      <VStage framing={CLOSE(EBO_X + 10)} blurBg={studio(t)}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.shrug, 'half')], [at('people'), withFace(G.point, 'open')]])} />
      </VStage>
    ),
  },
  // offices / gyms / schools — three quick cuts
  ...(
    [
      ['offices,', 'OFFICES', 'office', ['mica', 'ama', 'christy']],
      ['gyms,', 'GYMS', 'gym', ['ama', 'obuor']],
      ['schools.', 'SCHOOLS', 'school', ['christy', 'mica']],
    ] as [string, string, string, CastId[]][]
  ).map(
    ([word, label, set, who]): Shot => ({
      at: at(word),
      render: (t, f) => (
        <VStage
          framing={WIDE(1110, 640)}
          blurBg={set === 'office' ? <Office t={0} /> : set === 'gym' ? <Gym /> : <School />}
          overlay={
            <Slam t={t} at={at(word)}>
              <BigText text={label} x={VW / 2} y={1450} size={170} fill={C.yellow} rotate={-4} />
            </Slam>
          }
        >
          <VendingMachine fx={false} x={MX - 120} y={FLOOR_Y} t={f} fill={1} />
          {who.map((w, i) => (
            <Cast
              key={w}
              who={w}
              f={f + i * 9}
              x={1180 + i * 170}
              facing={-1}
              pose={i === 0 ? {...POSES.standing, armR: [82, 0], eyes: 'open', mouth: 'smile'} : {...walkPose(f + i * 11, {eyes: 'happy', mouth: 'grin'}), lift: 0}}
            >
              {i === 0 ? <Coin r={16} /> : <DollarBill scale={0.5} />}
            </Cast>
          ))}
        </VStage>
      ),
    }),
  ),
  // ── LESSON 3: REVENUE ≠ PROFIT ──
  {
    at: at('Lesson three'),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio(t)} overlay={<LessonCard tSec={t} at={at('Lesson three')} n={3} title="REVENUE ≠ PROFIT" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.raise, 'open')], [at("isn't"), withFace(G.shrug, 'half')]])} />
      </VStage>
    ),
  },
  {
    at: at('The building'),
    render: (t, f) => {
      const bills: [number, string, string, string][] = [
        [at('building'), 'BUILDING CUT', '-15%', C.blue],
        [at('electricity'), 'ELECTRICITY', '-$40', C.red],
        [at('keep buying'), 'MORE SODA', '-$$$', C.purple],
      ];
      const hits = bills.filter((b) => t >= b[0]).length;
      const coins = 6 - hits * 2;
      return (
        <VStage
          framing={WIDE(1000, 640)}
          blurBg={<Office t={0} />}
          overlay={
            <g>
              {bills.map(([a, title, amt, col], i) =>
                t >= a ? (
                  <Slam key={i} t={t} at={a} dist={-500} twist={i % 2 ? 18 : -18}>
                    <g transform={`translate(${[300, 780, 540][i]} ${[1250, 1330, 1560][i]}) rotate(${[-8, 7, -3][i]})`}>
                      <rect x={-230} y={-110} width={460} height={220} rx={20} fill={C.white} stroke={C.ink} strokeWidth={10} />
                      <rect x={-230} y={-110} width={460} height={64} rx={20} fill={col} stroke={C.ink} strokeWidth={10} />
                      <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill="#fff">
                        {title}
                      </text>
                      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={col}>
                        {amt}
                      </text>
                    </g>
                  </Slam>
                ) : null,
              )}
            </g>
          }
        >
          <VendingMachine fx={false} x={MX + 120} y={FLOOR_Y} t={f} fill={1} />
          <Cast
            who="mica"
            f={f}
            x={820}
            pose={stepAt(t, [
              [0, {...POSES.happy, armR: [60, -60], armL: [60, -60], eyes: 'happy', mouth: 'grin'} as Pose],
              [bills[0][0], {...POSES.shocked, eyes: 'wide', mouth: 'o'} as Pose],
              [bills[1][0], {...POSES.disappointed, eyes: 'half', mouth: 'flat'} as Pose],
              [bills[2][0], {...POSES.devastated, eyes: 'sad', mouth: 'frown'} as Pose],
            ])}
          />
          {Array.from({length: Math.max(0, coins)}).map((_, i) => (
            <Coin key={i} x={820 + (i - coins / 2) * 30} y={FLOOR_Y - 20 - (i % 2) * 14} r={18} />
          ))}
        </VStage>
      );
    },
  },
  // ── THE REAL MATH ──
  {
    at: at("Here's"),
    render: (t, f) => (
      <VStage framing={CLOSE(EBO_X + 10)} blurBg={studio(t)}>
        <Ebo f={f} pose={withFace(G.hips, 'half', {brows: 'up'})} />
      </VStage>
    ),
  },
  {
    at: at('Fifteen'),
    render: (t, f) => <MathShot t={t} f={f} />,
  },
  // ── LESSON 4: KEEP IT RUNNING ──
  {
    at: at('Lesson four'),
    render: (t, f) => (
      <VStage framing={MEDIUM(EBO_X)} blurBg={studio(t)} overlay={<LessonCard tSec={t} at={at('Lesson four')} n={4} title="KEEP IT RUNNING" y={1560} />}>
        <Ebo f={f} pose={snapPose(t, [[0, withFace(G.raise, 'open')], [at('running.'), withFace(G.point, 'open')]])} />
      </VStage>
    ),
  },
  ...(
    [
      ['Take card', 0],
      ['stock what', 1],
      ['check it', 2],
    ] as [string, number][]
  ).map(
    ([phrase, k]): Shot => ({
      at: at(phrase),
      render: (t, f) => <ChecklistShot t={t} f={f} k={k} />,
    }),
  ),
  {
    at: at('Because'),
    render: (t, f) => {
      const kick = Math.floor((t - at('Because')) * 6) % 2 === 0;
      return (
        <VStage framing={WIDE(1150, 640)} blurBg={<Office t={0} />}>
          <VendingMachine fx={false} x={MX} y={FLOOR_Y} t={f + 50} fill={0.7} broken={1} rotate={kick ? 2 : 0} />
          <Cast
            who="mica"
            f={f}
            x={1300}
            facing={-1}
            pose={
              kick
                ? {...POSES.standing, legL: [80, 0], legR: [-10, 0], armL: [60, 0], armR: [60, 0], eyes: 'squint', mouth: 'scream', brows: 'angry', tilt: -6}
                : {...POSES.standing, armR: [100, -40], armL: [30, 20], eyes: 'half', mouth: 'frown', brows: 'angry'}
            }
          />
        </VStage>
      );
    },
  },
  {
    at: at('zero'),
    render: (t, f) => (
      <VStage
        framing={{zoom: 2.6, cx: MX, cy: 640}}
        screenBg={<rect width={VW} height={VH} fill="#D93A3A" />}
        overlay={
          <Slam t={t} at={at('zero')}>
            <BigText text="$0.00" x={VW / 2} y={1500} size={230} fill="#fff" rotate={-4} />
          </Slam>
        }
      >
        <VendingMachine fx={false} x={MX} y={FLOOR_Y} t={f + 50} fill={0.7} broken={1} />
      </VStage>
    ),
  },
  // ── SCALE UP ──
  {
    at: at('One machine?'),
    render: (t, f) => (
      <VStage
        framing={WIDE(900)}
        blurBg={studio(t)}
        overlay={
          <Slam t={t} at={at('Three hundred', 2)}>
            <BigText text="1 MACHINE" x={VW / 2} y={1330} size={110} />
            <BigText text="≈ $300/mo" x={VW / 2} y={1480} size={130} fill="#7BE07B" rotate={-3} />
          </Slam>
        }
      >
        <VendingMachine fx={false} x={MX + 60} y={FLOOR_Y} t={f} fill={1} />
        <Ebo f={f} pose={withFace(G.present, 'open')} />
      </VStage>
    ),
  },
  {
    at: at('Ten machines?'),
    render: (t, f) => {
      const party = at('Now');
      return (
        <VStage
          framing={{zoom: 1.35, cx: 960, cy: 600}}
          blurBg={studio(t)}
          overlay={
            <g>
              <Slam t={t} at={at('Ten machines?')}>
                <BigText text="10 MACHINES" x={VW / 2} y={430} size={120} />
              </Slam>
              <Slam t={t} at={party} dist={-300} twist={10}>
                <BigText text="≈ $3,000/mo" x={VW / 2} y={1560} size={140} fill={C.yellow} rotate={-4} />
              </Slam>
            </g>
          }
        >
          {Array.from({length: 10}).map((_, i) => (
            <g key={i} transform={`translate(${520 + (i % 5) * 220} ${i < 5 ? 640 : FLOOR_Y + 260}) scale(0.5)`}>
              <VendingMachine fx={false} x={0} y={0} t={f + i * 7} fill={1} />
            </g>
          ))}
          <Ebo f={f} x={960} pose={t > party ? {...G.celebrate, lift: -Math.abs(Math.sin(f * 0.35)) * 70, eyes: 'happy'} : withFace(G.open, 'wide')} />
        </VStage>
      );
    },
  },
  {
    at: at('Subscribe'),
    render: (t, f) => (
      <VStage
        framing={CLOSE(EBO_X + 10)}
        blurBg={studio(t)}
        overlay={
          <Slam t={t} at={at('Subscribe') + 0.15}>
            <rect x={VW / 2 - 330} y={1330} width={660} height={130} rx={65} fill="#FF0033" stroke={C.ink} strokeWidth={10} />
            <rect x={VW / 2 - 270} y={1360} width={96} height={70} rx={20} fill="#fff" />
            <path d={`M ${VW / 2 - 232} ${1375} L ${VW / 2 - 196} ${1395} L ${VW / 2 - 232} ${1415} Z`} fill="#FF0033" />
            <text x={VW / 2 + 50} y={1418} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#fff" letterSpacing={3}>
              SUBSCRIBE
            </text>
            <text x={VW / 2} y={1540} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" stroke={C.ink} strokeWidth={8} paintOrder="stroke" letterSpacing={4}>
              EBO TEACHES MONEY · EP 1
            </text>
          </Slam>
        }
      >
        <Ebo f={f} pose={withFace(G.point, 'happy', {mouth: 'grin'})} talk={t < at('more.') + 0.6} />
      </VStage>
    ),
  },
];

const CricketsTag: React.FC<{t: number; from: number}> = ({t, from}) =>
  t < from ? null : (
    <Still>
      <text x={VW - 90} y={1180} textAnchor="end" fontFamily={FONT} fontStyle="italic" fontWeight={800} fontSize={54} fill="#fff" opacity={0.85}>
        *crickets*
      </text>
    </Still>
  );

/** Chalkboard math, line by line on the words. */
const MathShot: React.FC<{t: number; f: number}> = ({t, f}) => {
  const lines: [number, string, string][] = [
    [at('Fifteen'), '15 cans/day × $2', '#F2F0E6'],
    [at('is about'), '× 30 days', '#F2F0E6'],
    [at('nine hundred'), '= $900/month', '#9BE59B'],
    [at('soda', 3), '− soda   $360', '#FF9C8F'],
    [at('fees'), '− fees     $185', '#FF9C8F'],
    [at('power,'), '− power   $40', '#FF9C8F'],
  ];
  const keep = at('around');
  const board = (
    <g fontFamily="'Comic Sans MS', 'Chalkboard SE', Inter, sans-serif" fontWeight={800}>
      {lines.map(([a, txt, col], i) =>
        t >= a ? (
          <text key={i} x={1240} y={250 + i * 62} fontSize={46} fill={col}>
            {txt}
          </text>
        ) : null,
      )}
      {t >= keep && (
        <g>
          <line x1={1240} x2={1770} y1={622} y2={622} stroke="#F2F0E6" strokeWidth={6} />
          <text x={1240} y={672} fontSize={50} fill={C.yellow}>
            ≈ $315 you keep
          </text>
        </g>
      )}
    </g>
  );
  return (
    <VStage
      framing={{zoom: 1.3, cx: 1400, cy: 600}}
      blurBg={<Studio t={0} />}
      overlay={
        <g>
          <Slam t={t} at={keep}>
            <BigText text="≈ $315/mo" x={VW / 2} y={1560} size={150} fill={C.yellow} rotate={-4} />
          </Slam>
          <Still>
            <text x={VW / 2} y={VH - 120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#fff" opacity={0.75}>
              Example numbers — real results vary by location.
            </text>
          </Still>
        </g>
      }
    >
      <g>{board}</g>
      <Ebo f={f} x={1075} pose={snapPose(t, [[0, withFace(G.point, 'open')], [keep, withFace(G.hips, 'happy', {mouth: 'grin'})]])} />
    </VStage>
  );
};

const CHECKS = ['TAKE CARDS', 'STOCK WHAT SELLS', 'CHECK IT WEEKLY'];
/** Lesson 4 checklist: each item gets its own quick cutaway. */
const ChecklistShot: React.FC<{t: number; f: number; k: number}> = ({t, f, k}) => {
  const who: CastId = (['ama', 'obuor', 'christy'] as CastId[])[k];
  const list = (
    <g>
      {CHECKS.map((c, i) =>
        i <= k ? (
          <Slam key={c} t={t} at={i === k ? at(['Take card', 'stock what', 'check it'][i]) : -1}>
            <rect x={110} y={1180 + i * 130} width={860} height={110} rx={24} fill={C.white} stroke={C.ink} strokeWidth={8} />
            <circle cx={180} cy={1235 + i * 130} r={34} fill={C.shirt} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${162} ${1236 + i * 130} l 14 14 l 26 -30`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={240} y={1255 + i * 130} fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.ink}>
              {c}
            </text>
          </Slam>
        ) : null,
      )}
    </g>
  );
  const restock = k === 1;
  return (
    <VStage framing={WIDE(1060, 600)} blurBg={<Office t={0} />} overlay={list}>
      {k === 2 && <Calendar x={720} y={360} day={7} month="WEEK" />}
      {restock && <Crate x={780} y={FLOOR_Y} />}
      <VendingMachine fx={false} x={MX} y={FLOOR_Y} t={f} fill={restock ? Math.min(1, 0.4 + ((f % 60) / 60) * 0.6) : 1} display={k === 0 ? 'TAP' : '$2.00'} />
      {restock &&
        Array.from({length: 4}).map((_, i) => {
          const p = ((f + i * 6) % 24) / 24;
          return <Can key={i} x={780 + (MX - 120 - 780) * p} y={820 - Math.sin(p * Math.PI) * 200 - p * 200} color={[C.red, C.blue, C.yellow, '#56B870'][i]} scale={0.6} rotate={p * 360} />;
        })}
      <Cast
        who={who}
        f={f}
        x={k === 1 ? 640 : 1300}
        facing={k === 1 ? 1 : -1}
        pose={
          k === 0
            ? {...POSES.standing, armR: [84, 0], eyes: 'happy', mouth: 'smile'}
            : k === 1
              ? {...POSES.standing, armR: [120 + Math.sin(f * 0.5) * 30, -20], eyes: 'open', mouth: 'smile'}
              : {...POSES.pointing, eyes: 'open', mouth: 'smile'}
        }
      >
        {k === 0 && <rect x={-26} y={-18} width={52} height={34} rx={6} fill={C.gold} stroke={C.ink} strokeWidth={4} />}
      </Cast>
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
export const Ep01Frame: React.FC<{f: number; handDrawn?: boolean}> = ({f, handDrawn = true}) => {
  const t = f / VFPS;
  const shot = SHOTS[shotIndexAt(f)];
  return (
    <NoScaleContext.Provider value>
      <HandDrawnContext.Provider value={handDrawn}>
        <AbsoluteFill style={{background: '#000'}}>
          {shot.render(t, f, t - shot.at)}
          <TopCaption chunks={CHUNKS} tSec={t} />
        </AbsoluteFill>
      </HandDrawnContext.Provider>
    </NoScaleContext.Provider>
  );
};

/** layer='bg' renders only sets/props (for the Animate background image layer). */
export const EboEp01: React.FC<{layer?: 'full' | 'bg'; handDrawn?: boolean}> = ({layer = 'full', handDrawn = true}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <Ep01Frame f={f} handDrawn={handDrawn} />
      {layer === 'full' && <Html5Audio src={staticFile('ebo-ep01/voice.mp3')} />}
    </LayerModeContext.Provider>
  );
};

export const EP01_SHOT_TIMES = SHOTS.map((s) => s.at);
