import React from 'react';
import {Pose, POSES, mixPose, Palette, Hair, walkPose} from '../components/Character';
import {Hero, CUSTOMERS} from './Hero';
import {Coin, Can} from '../components/Money';
import {Blanket} from '../components/Props';
import {Iris} from '../components/Stage';
import {C, kf, lin} from '../theme';
import {FLOOR_Y} from '../backgrounds/Backgrounds';

/** Benny tucked into the bedroom bed. `inBed` 0 = standing at (sx, FLOOR_Y), 1 = lying down. */
export const BedBenny: React.FC<{t: number; inBed: number; sx?: number; pose: Pose; blanket: number; facing?: 1 | -1; beard?: number}> = ({
  t,
  inBed,
  sx = 820,
  pose,
  blanket,
  facing = 1,
}) => {
  const lieX = 1060;
  const lieY = 650;
  const x = sx + (lieX - sx) * inBed;
  const arc = Math.sin(inBed * Math.PI) * -160;
  const y = FLOOR_Y + (lieY - FLOOR_Y) * inBed + arc;
  const rot = -90 * inBed;
  const breathe = inBed > 0.95 ? Math.sin(t * 0.12) * 5 : 0;
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <Hero t={t} pose={pose} facing={facing} />
      </g>
      {blanket > 0 && (
        <g transform={`translate(${(1 - blanket) * 600} 0)`} opacity={Math.min(1, blanket * 3)}>
          <Blanket x={960} y={FLOOR_Y} breathe={breathe} />
        </g>
      )}
    </g>
  );
};

export const SITTING: Pose = {
  ...POSES.disappointed,
  legL: [88, 0],
  legR: [82, 0],
  lift: 86,
  armL: [20, 30],
  armR: [30, 40],
};

/** Iris in at the start and out at the end of a scene. */
export const SceneIris: React.FC<{t: number; dur: number; inAt?: [number, number]; outAt?: [number, number]; noIn?: boolean; noOut?: boolean}> = ({
  t,
  dur,
  inAt = [960, 600],
  outAt = [960, 600],
  noIn,
  noOut,
}) => {
  const pin = noIn ? 0 : kf(t, [0, 14], [1, 0]);
  const pout = noOut ? 0 : kf(t, [dur - 14, dur - 1], [0, 1]);
  return (
    <>
      <Iris progress={pin} x={inAt[0]} y={inAt[1]} />
      <Iris progress={pout} x={outAt[0]} y={outAt[1]} />
    </>
  );
};

/** Quick blend helper: pose a until `at`, then blend to b over `dur` frames. */
export const poseAt = (t: number, keys: [number, Pose][], dur = 6): Pose => {
  let current = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, p] = keys[i];
    if (t >= at) {
      current = mixPose(current, p, lin(t, [at, at + dur], [0, 1]));
    }
  }
  return current;
};

// ───────────────────────── Office customers ─────────────────────────


export const WORKERS: {palette: Palette; hair: Hair; tie?: boolean; glasses?: boolean}[] = [
  {palette: {skin: '#E9B48A', shirt: '#F3F0E8', pants: '#3E3A4F', hair: '#4A2E1F'}, hair: 'bob', glasses: true},
  {palette: {skin: '#C68B5E', shirt: '#7AA7E0', pants: '#2F3446', hair: C.ink}, hair: 'spiky', tie: true},
  {palette: {skin: '#F3D2B5', shirt: '#E98B6D', pants: '#45506B', hair: '#C9893B'}, hair: 'bun'},
  {palette: {skin: '#8D5B3E', shirt: '#B8A6E3', pants: '#2C2C38', hair: C.ink}, hair: 'bald', tie: true, glasses: true},
  {palette: {skin: '#F0C29C', shirt: '#F5D46A', pants: '#4B5563', hair: '#6B4A2E'}, hair: 'cap'},
  {palette: {skin: '#D9A07A', shirt: '#9ED2B5', pants: '#3B3F58', hair: '#2A1A14'}, hair: 'tuft', glasses: true},
];

export const SLOT = {dx: 94, y: 620}; // coin slot offset from machine x, absolute y (floor 900)
export const BUY_X_OFFSET = 260; // where customers stand, right of the machine

/**
 * One office customer: walks in from the right, buys, walks off to the left.
 * u = frames since this customer started. Returns null when off-screen.
 */
export const Customer: React.FC<{u: number; i: number; mx: number; floorY: number; speed?: number}> = ({u, i, mx, floorY, speed = 1}) => {
  const enterDur = 24 / speed;
  const buyEnd = enterDur + 14;
  const exitDur = 40 / speed;
  if (u < 0 || u > buyEnd + exitDur) return null;
  const standX = mx + BUY_X_OFFSET;
  let x: number;
  let pose;
  let holding = false;
  if (u < enterDur) {
    x = kf(u, [0, enterDur], [2200, standX], (n) => n);
    pose = walkPose(u * speed, {mouth: 'flat', eyes: 'half'});
  } else if (u < buyEnd) {
    x = standX;
    pose = {...POSES.standing, armR: [82, 0] as [number, number], mouth: 'flat' as const, eyes: 'half' as const, lookY: 6};
    if (u > enterDur + 8) pose = {...POSES.standing, armR: [40, -30] as [number, number], mouth: 'smile' as const, eyes: 'happy' as const};
  } else {
    x = kf(u, [buyEnd, buyEnd + exitDur], [standX, -300], (n) => n);
    pose = walkPose(u * speed, {mouth: 'smile', eyes: 'open', armR: [40, -60]});
    holding = true;
  }
  const exiting = u >= buyEnd;
  return (
    <Hero who={CUSTOMERS[i % CUSTOMERS.length]} x={x} y={floorY + (exiting ? 46 : 0)} facing={-1} t={u + i * 13} pose={pose}>
      {u >= enterDur - 6 && u < enterDur + 2 && <Coin x={0} y={0} r={16} />}
      {holding && <Can x={0} y={14} color={[C.red, C.blue, C.yellow][i % 3]} scale={0.6} />}
    </Hero>
  );
};

/** Coin flight + can drop for a customer, in world space. */
export const customerFx = (u: number, mx: number, speed = 1) => {
  const enterDur = 24 / speed;
  const coinP = lin(u, [enterDur + 2, enterDur + 7], [0, 1]);
  const dispense = lin(u, [enterDur + 6, enterDur + 13], [0, 1]);
  const sold = u >= enterDur + 7;
  const fromX = mx + BUY_X_OFFSET - 96;
  const fromY = 720;
  const coin =
    coinP > 0 && coinP < 1
      ? {x: fromX + (mx + SLOT.dx - fromX) * coinP, y: fromY + (SLOT.y - fromY) * coinP - Math.sin(coinP * Math.PI) * 80}
      : null;
  return {coin, dispense: dispense > 0 && dispense < 1 ? dispense : -1, sold};
};
