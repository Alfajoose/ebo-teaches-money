import React from 'react';
import {Easing} from 'remotion';
import {useSceneFrame} from '../sync';
import {Stage, Iris} from '../components/Stage';
import {Bedroom, Dream, FLOOR_Y} from '../backgrounds/Backgrounds';
import {Character, POSES} from '../components/Character';
import {VendingMachine} from '../components/VendingMachine';
import {MoneyRain, CoinBurst} from '../components/Money';
import {Wallet, Moth, Zzz, ThoughtBubble, Impact} from '../components/Props';
import {BedBenny, poseAt} from './shared';
import {C, FONT, kf, lin, pop} from '../theme';

/** BEAT 1 — THE HOOK (0:00–0:07). Setups: Bedroom → Dream. */
export const Scene1Hook: React.FC = () => {
  const t = useSceneFrame();
  return t < 136 ? <BedroomPart t={t} /> : <DreamPart t={t - 136} />;
};

const BedroomPart: React.FC<{t: number}> = ({t}) => {
  // Camera: start slightly wide, ease in on the wallet gag, then dive into the dream bubble.
  const zoomIn = kf(t, [100, 136], [1.25, 7], Easing.in(Easing.cubic));
  const zoom = t < 100 ? kf(t, [0, 40, 70, 100], [1.05, 1.18, 1.1, 1.25]) : zoomIn;
  const cx = t < 100 ? kf(t, [0, 40, 70, 100], [960, 860, 960, 900]) : kf(t, [100, 130], [900, 1030]);
  const cy = t < 100 ? kf(t, [0, 40, 70, 100], [560, 600, 600, 560]) : kf(t, [100, 130], [560, 330]);

  // Wallet gag 8–55, flop into bed 58–76.
  const inBed = kf(t, [58, 76], [0, 1], Easing.inOut(Easing.quad));
  const shakeWallet = t > 22 && t < 44 ? Math.sin(t * 1.6) * 14 : 0;
  const pose = poseAt(t, [
    [0, {...POSES.standing, armR: [95, -30], lookX: 6, lookY: 4}],
    [20, {...POSES.standing, armR: [150, 0], mouth: 'flat', lookY: -10, lookX: 10}],
    [44, {...POSES.disappointed, armR: [40, 10]}],
    [58, {...POSES.standing, armL: [150, 10], armR: [150, 10], eyes: 'closed', mouth: 'flat'}],
    [76, {...POSES.sleeping, mouth: 'smile'}],
    [96, POSES.sleeping],
  ]);
  const walletOpen = kf(t, [16, 22], [0, 1]);
  const bubble = pop(t, 96, {damping: 13});

  return (
    <Stage zoom={zoom} cx={cx} cy={cy} overlay={<TitleTag t={t} />}>
      <Bedroom lamp={kf(t, [52, 58], [1, 0])} />
      {t < 58 ? (
        <Character x={820} y={FLOOR_Y} t={t} pose={pose}>
          {t < 52 && (
            <g transform={`rotate(${180 * walletOpen + shakeWallet}) translate(0 -26)`}>
              <Wallet x={0} y={0} open={walletOpen} />
            </g>
          )}
        </Character>
      ) : (
        <BedBenny t={t} inBed={inBed} pose={pose} blanket={kf(t, [76, 88], [0, 1])} />
      )}
      {/* a moth escapes the empty wallet */}
      {t > 28 && t < 100 && <Moth x={950 + (t - 28) * 6 + Math.sin(t * 0.3) * 30} y={420 - (t - 28) * 5 + Math.cos(t * 0.4) * 20} t={t} />}
      {/* tiny "0¢" pops */}
      {t > 30 && t < 56 && (
        <text x={980} y={460 - (t - 30)} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.ink} opacity={lin(t, [30, 36, 50, 56], [0, 1, 1, 0])}>
          $0.00
        </text>
      )}
      {t > 82 && <Zzz x={760} y={600} t={t} />}
      <ThoughtBubble x={1030} y={330} scale={bubble} from={[800, 640]}>
        <g transform="translate(0 110) scale(0.42)">
          <VendingMachine t={t} glow={0.8} />
        </g>
        <MoneyRain t={t - 100} count={8} width={360} x={-180} top={-200} height={330} seed="bubble" speed={0.6} />
      </ThoughtBubble>
    </Stage>
  );
};

const TitleTag: React.FC<{t: number}> = ({t}) => {
  const o = lin(t, [0, 6, 46, 56], [0, 1, 1, 0]);
  if (o <= 0) return null;
  const y = kf(t, [0, 10], [-40, 0]);
  return (
    <g opacity={o} transform={`translate(70 ${70 + y})`}>
      <rect x={0} y={0} width={720} height={104} rx={20} fill={C.ink} />
      <text x={30} y={40} fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={4} fill={C.yellow}>
        MIA CREATES · EP 01
      </text>
      <text x={30} y={80} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.white}>
        How Vending Machines Actually Make Money
      </text>
    </g>
  );
};

const DreamPart: React.FC<{t: number}> = ({t}) => {
  const flash = lin(t, [0, 8], [1, 0]);
  const drop = kf(t, [8, 26], [-900, 0], Easing.in(Easing.quad));
  const land = t >= 26 ? pop(t, 26, {damping: 7, stiffness: 260}) : 0;
  const squash = t >= 26 ? 1 - 0.18 * Math.sin(land * Math.PI) * (1 - land * 0.5) : 1.04;
  const shakeAmt = lin(t, [26, 40], [16, 0]);
  const zoom = kf(t, [0, 30, 74], [1.3, 1.05, 1.15]);

  // Benny bounces with joy, dollar-sign eyes.
  const hop = Math.abs(Math.sin(t * 0.22)) * -60;
  const pose = poseAt(t, [
    [0, {...POSES.shocked, eyes: 'wide', mouth: 'o'}],
    [28, {...POSES.shocked}],
    [40, {...POSES.celebrate, eyes: 'dollar', lift: hop}],
  ]);
  const p = t >= 40 ? {...pose, lift: hop, armL: [150 + Math.sin(t * 0.4) * 20, 0] as [number, number], armR: [150 - Math.sin(t * 0.4) * 20, 0] as [number, number]} : pose;

  return (
    <Stage zoom={zoom} cx={960} cy={560} shakeX={Math.sin(t * 3) * shakeAmt} shakeY={Math.cos(t * 2.3) * shakeAmt} overlay={<Iris progress={kf(t, [60, 73], [0, 1])} x={620} y={520} />}>
      <Dream t={t} />
      <Impact x={1120} y={760} scale={t > 26 ? kf(t, [26, 32, 44], [0, 1.1, 0]) : 0} color={C.white} />
      <VendingMachine x={1120} y={FLOOR_Y + drop} t={t} glow={kf(t, [26, 40], [0, 1])} squash={squash} />
      <CoinBurst t={t - 34} x={1110} y={FLOOR_Y - 90} count={10} seed="d1" />
      <CoinBurst t={t - 50} x={1110} y={FLOOR_Y - 90} count={10} seed="d2" />
      <Character x={640} y={FLOOR_Y} t={t} pose={t < 40 ? pose : p} scale={0.95} />
      <MoneyRain t={t - 30} count={30} seed="dream" />
      {flash > 0 && <rect x={-800} y={-600} width={3520} height={2200} fill={C.white} opacity={flash} />}
    </Stage>
  );
};
