import React from 'react';
import {Easing} from 'remotion';
import {useSceneFrame} from '../sync';
import {Stage} from '../components/Stage';
import {Garage, FLOOR_Y} from '../backgrounds/Backgrounds';
import {POSES, Pose, walkPose} from '../components/Character';
import {Hero, flyIn} from './Hero';
import {VendingMachine} from '../components/VendingMachine';
import {Can, DollarBill, MoneyRain} from '../components/Money';
import {Crate, DeliveryBox, Impact, Whiteboard, Wallet, Confetti, SpeedLines} from '../components/Props';
import {SceneIris} from './shared';
import {C, FONT, kf, lin, pop} from '../theme';

/** BEAT 2 — THE BUSINESS (0:07–0:17). Setup: Garage. Local frames 0–300. */
const DUR = 300;
const MX = 1100; // machine x
const CAN_COLORS = [C.red, C.blue, C.yellow, '#56B870'];
const TOSS_START = 100;
const TOSS_EVERY = 3;

export const Scene2Business: React.FC = () => {
  const t = useSceneFrame();

  // ── Camera ──
  const zoom = kf(t, [0, 95, 110, 150, 180, 238, 252], [1, 1, 1.12, 1.12, 1.02, 1.02, 1.32]);
  const cx = kf(t, [0, 95, 110, 150, 180, 238, 252], [900, 900, 900, 900, 1520, 1520, 1420]);
  const cy = kf(t, [0, 110, 150, 180, 238, 252], [560, 600, 600, 560, 560, 600]);
  const landShake = lin(t, [50, 62], [18, 0]) * Math.sin(t * 3);

  // ── Benny ──
  let bx = 0;
  let pose: Pose = POSES.standing;
  let facing: 1 | -1 = 1;
  if (t < 40) {
    bx = kf(t, [0, 40], [-180, 560], Easing.out(Easing.quad));
    pose = walkPose(t, {mouth: 'smile', lookX: 8});
  } else if (t < 100) {
    bx = 560;
    if (t >= 50 && t < 60) pose = {...POSES.shocked, lift: -30 * Math.sin(((t - 50) / 10) * Math.PI)};
    else if (t >= 60) pose = {...POSES.standing, armR: [100, -20], mouth: t < 80 ? 'flat' : 'grin', eyes: t < 80 ? 'half' : 'happy', lookX: 10, brows: t < 80 ? 'flat' : 'up'};
    else pose = {...POSES.standing, armR: [80, -10], lookX: 10, lookY: -10, mouth: 'o'};
  } else if (t < 150) {
    bx = 560;
    const k = (t - TOSS_START) % TOSS_EVERY;
    const swing = t < TOSS_START + 16 * TOSS_EVERY ? (k === 0 ? 40 : k === 1 ? 130 : 90) : 20;
    pose = {...POSES.happy, armR: [swing, -10], armL: [20, 10], eyes: 'squint', mouth: 'smirk', blush: 0, lookX: 14, lookY: -6};
  } else if (t < 178) {
    bx = kf(t, [150, 178], [560, 1330], Easing.inOut(Easing.quad));
    pose = walkPose(t, {mouth: 'grin', eyes: 'happy'}, 0.6);
  } else if (t < 240) {
    bx = 1330;
    const row = t < 200 ? 0 : t < 222 ? 1 : 2;
    pose = {...POSES.pointing, armR: [[84, 96, 106][row], 0], lookX: 12, mouth: t > 222 ? 'grin' : 'smirk', eyes: t > 222 ? 'happy' : 'open'};
  } else {
    bx = 1330;
    const jump = Math.abs(Math.sin((t - 240) * 0.2));
    pose = {...POSES.celebrate, lift: -jump * 90, eyes: 'dollar', squash: 1 + (1 - jump) * -0.06, armL: [160 + jump * 15, 0], armR: [160 + jump * 15, 0]};
    facing = (Math.floor((t - 240) / 16) % 2 === 0 ? 1 : -1) as 1 | -1;
  }

  // ── Delivery ──
  const boxY = t < 30 ? -1200 : kf(t, [30, 50], [-1200, 0], Easing.in(Easing.quad));
  const boxSquash = t >= 50 ? 1 - 0.12 * Math.sin(Math.min(1, (t - 50) / 10) * Math.PI) : 1;
  const boxOpen = kf(t, [84, 96], [0, 1], Easing.in(Easing.quad));
  const tossed = Math.max(0, Math.min(16, Math.floor((t - TOSS_START - 8) / TOSS_EVERY) + 1));

  return (
    <Stage zoom={zoom} cx={cx} cy={cy} shakeX={landShake} overlay={<SceneIris t={t} dur={DUR} inAt={[700, 600]} outAt={[960, 470]} />}>
      <Garage />
      <Whiteboard x={1800} y={510}>
        <BoardMath t={t} />
      </Whiteboard>

      {t >= 84 && <VendingMachine x={MX} y={FLOOR_Y} t={t} fill={tossed / 16} rotate={t < 100 ? Math.sin(((t - 84) / 16) * Math.PI * 2) * 3 : 0} />}
      {t < 100 && (
        <g transform={`translate(${MX + boxOpen * 260} ${FLOOR_Y + boxY + boxOpen * 120}) rotate(${boxOpen * 55 + (1 - boxSquash) * 30})`} opacity={1 - boxOpen}>
          <DeliveryBox x={0} y={0} />
        </g>
      )}
      <Impact x={MX} y={FLOOR_Y - 20} scale={t >= 50 && t < 62 ? 1 : 0} rotate={(t - 50) * 5} color={C.white} />
      {/* "SOLD" stamp */}
      {t > 56 && t < 96 && (
        <g transform={`translate(${MX} ${FLOOR_Y - 330 - (1 - pop(t, 56)) * 320}) rotate(${-12 - (1 - pop(t, 56)) * 40})`}>
          <rect x={-150} y={-56} width={300} height={112} rx={14} fill="none" stroke={C.red} strokeWidth={12} />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill={C.red}>
            SOLD
          </text>
        </g>
      )}
      {/* bills fly from Benny's wallet to the box */}
      {[0, 1, 2, 3].map((i) => {
        const s = 62 + i * 4;
        const p = lin(t, [s, s + 14], [0, 1]);
        if (p <= 0 || p >= 1) return null;
        const x = 640 + (MX - 640) * p;
        const y = 690 - Math.sin(p * Math.PI) * 220 + p * -40;
        return <DollarBill key={i} x={x} y={y} rotate={p * 540} scale={0.8} />;
      })}

      {t >= 96 && <Crate x={790} y={FLOOR_Y} />}
      {/* cans arcing into the machine */}
      {t >= TOSS_START &&
        Array.from({length: 16}).map((_, i) => {
          const s = TOSS_START + i * TOSS_EVERY;
          const p = lin(t, [s, s + 9], [0, 1]);
          if (p <= 0 || p >= 1) return null;
          const row = Math.floor(i / 4);
          const col = i % 4;
          const tx = MX - 150 + 44 + col * 42;
          const ty = FLOOR_Y - 540 + 90 + 74 * (row + 1) - 4;
          const x = 790 + (tx - 790) * p;
          const y = 820 + (ty - 820) * p - Math.sin(p * Math.PI) * 260;
          return <Can key={i} x={x} y={y} color={CAN_COLORS[(row + col) % 4]} scale={0.62} rotate={p * 720} />;
        })}

      {t >= 150 && t < 178 && <SpeedLines x={bx - 120} y={FLOOR_Y - 250} opacity={0.6} />}
      <Hero x={bx} y={FLOOR_Y} t={t} pose={pose} facing={facing}>
        {t >= 40 && t < 84 && <Wallet x={10} y={-10} open={kf(t, [56, 62], [0, 1])} rotate={-20} />}
      </Hero>

      <g transform={`translate(0 ${(1 - pop(t, 250)) * -420})`}>
        <Impact x={1060} y={330} scale={t > 250 ? 0.75 : 0} rotate={-6 + Math.sin(t * 0.3) * 4} text="GENIUS!" />
      </g>
      <Confetti t={t - 242} cx={1330} cy={500} />
      <MoneyRain t={t - 246} count={14} seed="genius" x={900} width={900} />
    </Stage>
  );
};

/** Hand-written margin math on the whiteboard (board-local coordinates). */
const BoardMath: React.FC<{t: number}> = ({t}) => {
  const write = (start: number, dur = 10) => lin(t, [start, start + dur], [0, 1]);
  const row1 = write(182);
  const row2 = write(204);
  const line = write(224, 6);
  const row3 = pop(t, 230, {damping: 9});
  const circle = lin(t, [236, 250], [0, 1]);
  const text = {fontFamily: FONT, fontWeight: 900 as const};
  return (
    <g>
      <defs>
        <clipPath id="w1">
          <rect x={-280} y={-180} width={560 * row1} height={100} />
        </clipPath>
        <clipPath id="w2">
          <rect x={-280} y={-80} width={560 * row2} height={100} />
        </clipPath>
      </defs>
      <g clipPath="url(#w1)">
        <Can x={-232} y={-100} color={C.red} scale={0.6} />
        <text x={-190} y={-112} {...text} fontSize={56} fill={C.ink}>
          BUY
        </text>
        <text x={250} y={-112} {...text} fontSize={64} fill={C.red} textAnchor="end">
          $0.80
        </text>
      </g>
      <g clipPath="url(#w2)">
        <text x={-190} y={-14} {...text} fontSize={56} fill={C.ink}>
          SELL
        </text>
        <text x={250} y={-14} {...text} fontSize={64} fill={C.blue} textAnchor="end">
          $2.00
        </text>
      </g>
      {line > 0 && <line x1={-250} x2={-250 + 500 * line} y1={20} y2={20} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />}
      <g transform={`translate(0 ${110 - (1 - row3) * 70})`} opacity={Math.min(1, Math.max(0, row3 * 1.5))}>
        <text x={-240} y={0} {...text} fontSize={50} fill={C.ink}>
          PROFIT
        </text>
        <text x={250} y={4} {...text} fontSize={84} fill={C.moneyDark} textAnchor="end">
          $1.20
        </text>
      </g>
      {circle > 0 && <ellipse
        cx={140}
        cy={80}
        rx={150}
        ry={70}
        fill="none"
        stroke={C.red}
        strokeWidth={8}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - circle}
        transform="rotate(-4 140 80)"
      />}
      {t > 250 && (
        <text x={-250} y={170} {...text} fontSize={30} fill={C.red} opacity={lin(t, [250, 256], [0, 1])}>
          EASY MONEY!!!
        </text>
      )}
    </g>
  );
};
