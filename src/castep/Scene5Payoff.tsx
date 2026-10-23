import React from 'react';
import {Easing} from 'remotion';
import {useSceneFrame} from '../sync';
import {Stage, Iris} from '../components/Stage';
import {Bedroom, Office, FLOOR_Y} from '../backgrounds/Backgrounds';
import {POSES, Pose, walkPose} from '../components/Character';
import {Hero, flyIn} from './Hero';
import {VendingMachine} from '../components/VendingMachine';
import {MoneyRain, Coin} from '../components/Money';
import {Phone, Zzz, Impact, Confetti, SalesCounter} from '../components/Props';
import {BedBenny, Customer, customerFx, poseAt, WORKERS} from './shared';
import {C, FONT, kf, lin, pop, shake} from '../theme';

/** BEAT 5 — THE PAYOFF (0:43–0:58). Setups: Office → Bedroom → Office cutaway → Bedroom. Local 0–450. */
const OMX = 1000;

export const Scene5Payoff: React.FC = () => {
  const t = useSceneFrame();
  if (t < 108) return <CelebratePart t={t} />;
  if (t >= 262 && t < 340) return <BrokenCutaway t={t - 262} />;
  return <BedroomPart t={t} />;
};

const CelebratePart: React.FC<{t: number}> = ({t}) => {
  const starts = [-26, -8, 12, 34, 56];
  let sales = 242;
  let dispense = -1;
  const coins: {x: number; y: number}[] = [];
  starts.forEach((s) => {
    const fx = customerFx(t - s, OMX);
    if (fx.sold && s >= 0) sales += 2;
    if (fx.dispense >= 0) dispense = fx.dispense;
    if (fx.coin) coins.push(fx.coin);
  });

  // dance: swap between two big poses on the beat
  const beat = Math.floor(t / 9) % 2;
  const bounce = Math.abs(Math.sin((t * Math.PI) / 9));
  let bx = 640;
  let pose: Pose =
    beat === 0
      ? {...POSES.celebrate, lift: -bounce * 70, eyes: 'happy'}
      : {...POSES.happy, armL: [150, 40], armR: [20, -60], legL: [30, 30], legR: [-10, 0], lift: -bounce * 40, tilt: -8};
  let facing: 1 | -1 = 1;
  if (t >= 84) {
    bx = kf(t, [84, 108], [640, 160], (n) => n);
    pose = walkPose(t, {eyes: 'happy', mouth: 'grin'}, 0.5);
    facing = -1;
  }
  const zoom = kf(t, [0, 70, 90, 108], [1, 1.18, 1.18, 1.3]);
  const cx = kf(t, [0, 70, 108], [960, 800, 500]);
  const sx = 960 + zoom * (bx - cx);

  return (
    <Stage zoom={zoom} cx={cx} cy={kf(t, [0, 70], [560, 590])} overlay={<Iris progress={kf(t, [94, 107], [0, 1])} x={Math.max(150, sx)} y={480} />}>
      <Office t={t} />
      <SalesCounter x={OMX} y={250} value={sales} />
      <VendingMachine x={OMX} y={FLOOR_Y} t={t} fill={1} dispense={dispense} glow={0.6} />
      {starts.map((s, i) => (
        <Customer key={i} u={t - s} i={i + 2} mx={OMX} floorY={FLOOR_Y} />
      ))}
      {coins.map((c, i) => (
        <Coin key={i} x={c.x} y={c.y} r={16} spin={t * 0.5} />
      ))}
      <Hero x={bx} y={FLOOR_Y} t={t} pose={pose} facing={facing} />
      <g transform={`translate(0 ${(1 - pop(t, 30)) * -380})`}>
        <Impact x={600} y={250} scale={t > 30 && t < 84 ? 0.7 : 0} rotate={-5} text="PASSIVE INCOME!" />
      </g>
      <Confetti t={t - 2} cx={640} cy={420} count={50} />
      <MoneyRain t={t} count={22} seed="payoff" />
    </Stage>
  );
};

const PHONE_REST = {x: 1400, y: 750};
const SX = 1180; // where Benny stands after jumping out of bed

const BedroomPart: React.FC<{t: number}> = ({t}) => {
  // ── Benny ──
  const walking = t < 136;
  const inBed = t < 138 ? 0 : t < 214 ? kf(t, [138, 154], [0, 1]) : kf(t, [214, 224], [1, 0], Easing.out(Easing.back(2)));
  const blanket = t < 214 ? kf(t, [152, 164], [0, 1]) : kf(t, [214, 220], [1, 0]);
  const ringing = t >= 196 && t < 236 ? 1 : 0;

  const closeUp = t >= 340;
  const holdPose: Pose = {...POSES.disappointed, armR: [120, -90], lookX: 10, lookY: 8};
  const twitch = t > 392 && t < 414 && Math.floor(t / 3) % 2 === 0;
  const finalPose: Pose =
    t < 392
      ? holdPose
      : t < 414
        ? {...holdPose, eyes: twitch ? 'squint' : 'half', brows: twitch ? 'angry' : 'flat', headTilt: twitch ? -6 : -4}
        : {...holdPose, eyes: 'sad', mouth: 'wobbly', brows: 'sad', headTilt: -2, sweat: 1};

  const sleepPose = poseAt(t, [
    [136, {...POSES.standing, armL: [150, 10], armR: [150, 10], eyes: 'closed', mouth: 'smile'}],
    [154, {...POSES.sleeping, mouth: 'smile'}],
    [176, POSES.sleeping],
    [212, {...POSES.shocked}],
  ]);
  let pose: Pose;
  if (closeUp) pose = finalPose;
  else if (t >= 236) pose = {...holdPose, eyes: 'wide', mouth: 'o', brows: 'up'};
  else if (t >= 224) pose = {...POSES.shocked, armR: [120, -90]};
  else pose = sleepPose;

  // phone flies into his hand at 226
  const grab = kf(t, [226, 234], [0, 1], Easing.out(Easing.quad));
  const handX = SX + 108;
  const handY = FLOOR_Y - 163;
  const phoneInHand = t >= 234;

  // ── Camera ──
  let zoom = kf(t, [108, 136, 160, 200], [1.15, 1.05, 1.15, 1.25]);
  let cx = kf(t, [108, 136, 160], [700, 900, 980]);
  let cy = kf(t, [108, 160], [600, 600]);
  if (t >= 196 && t < 340) {
    zoom = kf(t, [196, 204, 224, 236], [1.25, 1.4, 1.4, 1.6]);
    cx = kf(t, [196, 204, 224, 236], [980, 1260, 1260, 1240]);
    cy = kf(t, [196, 236], [600, 600]);
  }
  if (closeUp) {
    zoom = kf(t, [340, 449], [1.75, 2.05], Easing.inOut(Easing.sin));
    cx = kf(t, [340, 449], [1215, 1205]);
    cy = kf(t, [340, 449], [600, 590]);
  }
  const ringShake = ringing ? 4 : 0;
  const walkX = kf(t, [108, 136], [-150, 820], (n) => n);

  return (
    <Stage
      zoom={zoom}
      cx={cx}
      cy={cy}
      shakeX={shake(t, ringShake, 3)}
      overlay={
        <g>
          <Iris progress={kf(t, [108, 120], [1, 0])} x={600} y={600} />
          {/* flash on cut in/out of the cutaway */}
          {t >= 340 && <rect width={1920} height={1080} fill={C.white} opacity={lin(t, [340, 346], [1, 0])} />}
          <EndTag t={t} />
        </g>
      }
    >
      <Bedroom lamp={kf(t, [150, 158], [1, 0])} />
      {/* phone resting on the nightstand */}
      {!phoneInHand && (
        <Phone
          x={PHONE_REST.x + (handX - PHONE_REST.x) * grab}
          y={PHONE_REST.y + (handY - PHONE_REST.y) * grab}
          scale={0.8}
          rotate={-90 * (1 - grab)}
          ringing={ringing}
          t={t}
        />
      )}
      {ringing > 0 && (
        <Impact x={1500} y={520} scale={0.55} rotate={Math.sin(t * 0.9) * 6} color={C.white} text="RING!" />
      )}
      {walking ? (
        <Hero x={walkX} y={FLOOR_Y} t={t} pose={walkPose(t, {eyes: 'half', mouth: 'smile'}, 0.45)} />
      ) : (
        <BedBenny t={t} inBed={inBed} pose={pose} blanket={blanket} sx={t < 200 ? 820 : SX} />
      )}
      {phoneInHand && !walking && inBed < 0.05 && (
        <g transform={`translate(${handX} ${handY + 6})`}>
          <Phone x={0} y={0} scale={0.8} t={t} rotate={-8} />
          <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={14} fill={C.red}>
            ERR!
          </text>
        </g>
      )}
      {t > 164 && t < 212 && <Zzz x={760} y={560} t={t} />}
      {/* final beat: a tiny ellipsis thought */}
      {t > 360 && (
        <text x={1060} y={400} fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.ink} opacity={lin(t, [360, 366], [0, 1])}>
          {'.'.repeat(Math.min(3, Math.floor((t - 360) / 8) + 1))}
        </text>
      )}
    </Stage>
  );
};

const BrokenCutaway: React.FC<{t: number}> = ({t}) => {
  const kick = t > 20 && t < 60 && Math.floor((t - 20) / 10) % 2 === 0;
  const workerPose: Pose = kick
    ? {...POSES.standing, legL: [80, 0], legR: [-10, 0], armL: [60, 0], armR: [60, 0], eyes: 'squint', mouth: 'scream', brows: 'angry', tilt: -6}
    : {...POSES.standing, armR: [100, -40], armL: [30, 20], eyes: 'half', mouth: 'frown', brows: 'angry'};
  const hit = kick ? 1 : 0;
  const zoom = kf(t, [0, 78], [1.3, 1.45]);
  return (
    <Stage
      zoom={zoom}
      cx={1100}
      cy={560}
      shakeX={shake(t, hit * 10, 3)}
      overlay={
        <g>
          <rect width={1920} height={1080} fill={C.white} opacity={lin(t, [0, 6], [1, 0])} />
          <g transform="translate(960 90)">
            <rect x={-330} y={-44} width={660} height={88} rx={20} fill={C.ink} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.yellow}>
              MEANWHILE, AT THE OFFICE...
            </text>
          </g>
        </g>
      }
    >
      <Office t={t} />
      <VendingMachine x={OMX} y={FLOOR_Y} t={t + 50} fill={0.7} broken={1} rotate={hit * 2} />
      <Hero who="obuor" x={OMX + 290} y={FLOOR_Y} t={t} facing={-1} pose={workerPose} />
      <Impact x={OMX + 150} y={FLOOR_Y - 100} scale={kick ? 0.5 : 0} text="BONK" />
    </Stage>
  );
};

const EndTag: React.FC<{t: number}> = ({t}) => {
  if (t < 424) return null;
  const s = pop(t, 424);
  return (
    <g transform={`translate(${1690 + (1 - s) * 500} 90)`}>
      <rect x={-190} y={-40} width={380} height={80} rx={20} fill={C.ink} />
      <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} letterSpacing={5} fill={C.yellow}>
        MIA CREATES
      </text>
    </g>
  );
};
