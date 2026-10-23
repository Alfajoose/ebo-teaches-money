import React from 'react';
import {Easing} from 'remotion';
import {useSceneFrame} from '../sync';
import {Stage} from '../components/Stage';
import {Hallway, FLOOR_Y} from '../backgrounds/Backgrounds';
import {POSES, Pose, mixPose} from '../components/Character';
import {Hero, flyIn} from './Hero';
import {VendingMachine} from '../components/VendingMachine';
import {CoinBurst, Coin} from '../components/Money';
import {Calendar, Spider, Tumbleweed} from '../components/Props';
import {SceneIris, SITTING} from './shared';
import {C, FONT, kf, lin, pop} from '../theme';

/** BEAT 3 — REALITY (0:17–0:28). Setup: Hallway. Local frames 0–330. */
const DUR = 330;
export const MX3 = 1150;
export const BX3_END = 930;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Final frame state, shared with Scene 4's opening so the cut is invisible. */
export const realityEndCamera = {zoom: 1.85, cx: BX3_END + 10, cy: 600};

export const Scene3Reality: React.FC = () => {
  const t = useSceneFrame();

  // Time-lapse 96–200.
  const lapse = lin(t, [96, 200], [0, 1]);
  const flipping = t >= 96 && t < 200;
  const flipIndex = flipping ? Math.floor((t - 96) / 2) : t >= 200 ? 52 : 0;
  const day = ((flipIndex * 3) % 30) + 1;
  const month = MONTHS[Math.floor(flipIndex / 10) % 12];
  const flipPhase = flipping ? ((t - 96) % 2) / 2 : 0;
  const dayNight = flipping ? (Math.sin((t - 96) * 0.9) * 0.5 + 0.5) * 0.35 : 0;

  // ── Benny ──
  let bx = 760;
  let pose: Pose;
  if (t < 96) {
    // proud, waiting, looking around
    const look = t < 40 ? 0 : t < 58 ? -16 : t < 76 ? 16 : 0;
    pose = {...POSES.standing, armL: [38, -110], armR: [38, -110], mouth: 'smirk', brows: 'up', lookX: look};
    if (t > 76) pose = {...pose, mouth: 'flat', brows: 'neutral', eyes: 'half'};
  } else if (t < 200) {
    const slump = lin(t, [110, 150], [0, 1]);
    pose = mixPose({...POSES.disappointed}, {...SITTING, eyes: 'half', mouth: 'flat'}, slump);
    pose = {...pose, headTilt: Math.sin(t * 0.1) * 4 * slump};
  } else if (t < 214) {
    // springs up and scoots to the machine
    pose = mixPose(SITTING, {...POSES.standing, mouth: 'o', brows: 'up', lookX: 10}, lin(t, [200, 206], [0, 1]));
    bx = kf(t, [204, 214], [760, BX3_END]);
  } else if (t < 252) {
    bx = BX3_END;
    pose = {...POSES.standing, armR: [70, -20], lookX: 14, lookY: 14, mouth: 'smile', brows: 'up'};
    if (t > 236) pose = {...pose, mouth: 'o', eyes: 'wide', brows: 'up', lookY: 18};
  } else {
    bx = BX3_END;
    pose = {...POSES.devastated, sweat: 0};
    // a tiny eye glisten wobble
    pose = {...pose, headTilt: 6 + Math.sin(t * 0.5) * 1.2};
  }
  const beard = lin(t, [110, 195], [0, 1]);

  // ── Camera ──
  let zoom = kf(t, [0, 90], [1.12, 0.94]);
  let cx = 960;
  let cy = kf(t, [0, 90], [560, 540]);
  if (t >= 90 && t < 214) {
    zoom = 0.94;
    cy = 540;
  }
  if (t >= 214) {
    zoom = kf(t, [214, 230], [0.94, 1.25]);
    cx = kf(t, [214, 230], [960, 1040]);
    cy = kf(t, [214, 230], [540, 600]);
  }
  if (t >= 252) {
    // whip-zoom to the face for the comedic stare
    const p = kf(t, [252, 258], [0, 1], Easing.out(Easing.cubic));
    zoom = 1.25 + (realityEndCamera.zoom - 1.25) * p;
    cx = 1040 + (realityEndCamera.cx - 1040) * p;
    cy = 600 + (realityEndCamera.cy - 600) * p;
  }

  const coinsOut = t >= 238;
  return (
    <Stage zoom={zoom} cx={cx} cy={cy} overlay={<SceneIris t={t} dur={DUR} inAt={[960, 560]} noOut />}>
      <Hallway t={t} dim={dayNight} flicker={t > 96} />
      <Calendar x={520} y={430} day={day} month={month} flip={flipPhase} />
      {t > 30 && t < 150 && <Tumbleweed x={kf(t, [30, 150], [-200, 2200], (n) => n)} y={FLOOR_Y - 44} t={t} />}
      {t > 40 && t < 92 && (
        <text x={1500} y={300} fontFamily={FONT} fontWeight={800} fontStyle="italic" fontSize={40} fill={C.gray} opacity={lin(t, [40, 48, 84, 92], [0, 1, 1, 0])}>
          *crickets*
        </text>
      )}
      {flipping && (
        <text x={520} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink} opacity={0.7}>
          {t < 150 ? 'DAYS LATER...' : 'WEEKS LATER...'}
        </text>
      )}
      <VendingMachine x={MX3} y={FLOOR_Y} t={t} fill={1} cobwebs={kf(t, [110, 190], [0, 1])} dust={kf(t, [110, 190], [0, 1])} display={t >= 230 ? '$3.00' : '$2.00'} />
      <Spider x={MX3 + 70} y={60} drop={kf(t, [120, 160], [0, 300], Easing.out(Easing.back(1.4)))} t={t} />
      <Hero x={bx} y={FLOOR_Y} t={t} pose={pose} beard={beard} />
      {/* the "earnings": three sad coins */}
      <CoinBurst t={coinsOut ? t - 238 : -1} x={MX3 - 10} y={FLOOR_Y - 90} count={3} seed="three" power={0.35} />
      {t >= 262 && (
        <g>
          {/* one coin rolls away slowly during the stare */}
          <Coin x={kf(t, [262, 330], [MX3 - 160, 700], (n) => n)} y={FLOOR_Y - 20} r={20} spin={t * 0.15} />
        </g>
      )}
      {t >= 242 && t < 330 && (
        <g transform={`translate(${MX3 - 40} ${FLOOR_Y - 640 - (1 - pop(t, 242)) * 420})`}>
          <rect x={-190} y={-50} width={380} height={100} rx={20} fill={C.white} stroke={C.ink} strokeWidth={8} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red}>
            TOTAL: $3.00
          </text>
        </g>
      )}
    </Stage>
  );
};
