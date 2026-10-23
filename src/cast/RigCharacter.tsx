import React from 'react';
import {C} from '../theme';
import type {Pose, Eyes, Mouth} from '../components/Character';
import {CAST, CastId, CastConfig, RigData} from './castConfig';
import measureJson from './data/measure.json';
import {CameraContext, mmul, R as Rm, S as Sm, T as Tm, useCapture, useLayerMode} from '../series/exportCtx';
import {useContext} from 'react';

/**
 * Renders one of the user's Adobe Animate characters (exported rig) in a pose.
 * House rule: parts only ever rotate or translate — never scale.
 *
 * It accepts the same `Pose` the original Benny character used, so every scene's
 * choreography carries over: limb angles are converted to per-layer rotations
 * relative to each rig's rest pose, and eye/mouth types become frame swaps.
 */

type M = [number, number, number, number, number, number];
type Measure = Record<string, {bounds: number[]; layers: Record<string, {pivot: number[]; center: number[] | null}>}>;
const MEASURE = measureJson as unknown as Measure;

const mul = (m1: M, m2: M): M => {
  const [a1, b1, c1, d1, x1, y1] = m1;
  const [a2, b2, c2, d2, x2, y2] = m2;
  return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1];
};
const ap = (m: M, p: number[]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const inv = (m: M): M => {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
};
const deg = (r: number) => (r * 180) / Math.PI;
/** SVG-sense angle of a direction, measured from straight down (clockwise positive). */
const angOf = (from: number[], to: number[]) => deg(Math.atan2(-(to[0] - from[0]), to[1] - from[1]));

/** Rotate about pivot p (in parent space) then translate. No scale, by design. */
const localMatrix = (m0: M, tp: number[], rot: number, dx: number, dy: number): M => {
  const [px, py] = ap(m0, tp);
  const r = (rot * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return mul([1, 0, 0, 1, px + dx, py + dy], mul([c, s, -s, c, 0, 0], mul([1, 0, 0, 1, -px, -py], m0)));
};

const LIMBS = {
  armL: ['hand_top_1', 'hand_down_1_'],
  armR: ['hand_top_2', 'hand_down_2'],
  legL: ['leg_top_1', 'leg_down_1_'],
  legR: ['leg_top_2', 'leg_down_2'],
} as const;

type Prepared = {
  cfg: CastConfig;
  rig: RigData;
  byName: Record<string, RigData['layers'][number]>;
  byRig: Record<string, RigData['layers'][number]>;
  rest: Record<string, number>;
  origin: [number, number];
  handLocal: [number, number];
};
const cache: Partial<Record<CastId, Prepared>> = {};

const prepare = (id: CastId): Prepared => {
  const hit = cache[id];
  if (hit) return hit;
  const cfg = CAST[id];
  const rig = cfg.rig;
  const meas = MEASURE[id];
  const byName = Object.fromEntries(rig.layers.map((l) => [l.name, l]));
  const byRig = Object.fromEntries(rig.layers.filter((l) => l.rig != null).map((l) => [l.rig as string, l]));
  const rest: Record<string, number> = {};
  for (const [upper, lower] of Object.values(LIMBS)) {
    const pu = meas.layers[upper].pivot;
    const pl = meas.layers[lower].pivot;
    const cl = meas.layers[lower].center ?? pl;
    rest[upper] = angOf(pu, pl);
    rest[lower] = angOf(pl, cl);
  }
  // rest-pose world matrix of the right forearm → find the hand tip in its local space
  const world0 = (name: string): M => {
    const l = byName[name];
    return l.parent != null && byRig[l.parent] ? mul(world0(byRig[l.parent].name), l.m as M) : (l.m as M);
  };
  const fp = meas.layers.hand_down_2.pivot;
  const fc = meas.layers.hand_down_2.center ?? fp;
  const tip = [fp[0] + (fc[0] - fp[0]) * 1.7, fp[1] + (fc[1] - fp[1]) * 1.7];
  const handLocal = ap(inv(world0('hand_down_2')), tip);
  const p: Prepared = {
    cfg,
    rig,
    byName,
    byRig,
    rest,
    origin: [meas.layers.waist.pivot[0], meas.bounds[3]],
    handLocal,
  };
  cache[id] = p;
  return p;
};

const pickFrame = (v: number | number[], t: number) => (Array.isArray(v) ? v[Math.floor(t / 4) % v.length] : v);

type Props = {
  who: CastId;
  x?: number;
  y?: number;
  scale?: number; // static placement size only — never animate this
  facing?: 1 | -1;
  pose: Pose;
  t?: number;
  children?: React.ReactNode; // held in the raised (right) hand
  mouthFrame?: number; // direct mouth swap (lip sync) — overrides pose.mouth
  eyeFrame?: number | number[]; // direct eye swap — overrides pose.eyes
  noBlink?: boolean;
};

export const RigCharacter: React.FC<Props> = ({who, x = 0, y = 0, scale = 1, facing = 1, pose, t = 0, children, mouthFrame, eyeFrame: eyeOverride, noBlink}) => {
  const mode = useLayerMode();
  const cap = useCapture();
  const cam = useContext(CameraContext);
  if (mode === 'bg') return null;
  const P = prepare(who);
  const {cfg, rig, byName, byRig, rest} = P;

  // ── layer rotations from limb angles ──
  const rot: Record<string, number> = {};
  const dxy: Record<string, [number, number]> = {};
  rot.head = pose.headTilt;
  const setLimb = (upper: string, lower: string, upperAbs: number, lowerAbs: number) => {
    const ru = upperAbs - rest[upper];
    rot[upper] = ru;
    rot[lower] = lowerAbs - rest[lower] - ru;
  };
  setLimb(LIMBS.armL[0], LIMBS.armL[1], pose.armL[0], pose.armL[0] + pose.armL[1]);
  setLimb(LIMBS.armR[0], LIMBS.armR[1], -pose.armR[0], -(pose.armR[0] + pose.armR[1]));
  setLimb(LIMBS.legL[0], LIMBS.legL[1], -pose.legL[0], -(pose.legL[0] - pose.legL[1]));
  setLimb(LIMBS.legR[0], LIMBS.legR[1], -pose.legR[0], -(pose.legR[0] - pose.legR[1]));

  // ── face ──
  const blink = !noBlink && (t + 17 + cfg.blinkOffset) % 97 < 4;
  let eyes: Eyes = pose.eyes;
  if (blink && (eyes === 'open' || eyes === 'half' || eyes === 'sad' || eyes === 'dollar')) eyes = 'closed';
  const eyeFrame = eyeOverride !== undefined && !blink ? eyeOverride : cfg.eyes[eyes];
  const mouthF = mouthFrame ?? pickFrame(cfg.mouth[pose.mouth as Mouth], t);
  const look: [number, number] = [pose.lookX * 0.6, pose.lookY * 0.5];
  for (const e of cfg.eyeLayers) dxy[e] = look;
  if (byName.mouth) dxy.mouth = [look[0] * 0.5, look[1] * 0.3];

  // ── compose world matrices along the parent chain ──
  const memo: Record<string, M> = {};
  const world = (name: string): M => {
    if (memo[name]) return memo[name];
    const l = byName[name];
    const d = dxy[name] ?? [0, 0];
    const local = localMatrix(l.m as M, l.tp, rot[name] ?? 0, d[0], d[1]);
    const w = l.parent != null && byRig[l.parent] ? mul(world(byRig[l.parent].name), local) : local;
    memo[name] = w;
    return w;
  };

  const frameFor = (name: string, first: number) => {
    if (cfg.eyeLayers.includes(name)) return Array.isArray(eyeFrame) ? eyeFrame[cfg.eyeLayers.indexOf(name)] : eyeFrame;
    if (name === 'mouth') return mouthF;
    return cfg.outfit?.[name] ?? first;
  };

  const s = scale * cfg.scale;
  const [ox, oy] = P.origin;
  const hand = ap(world('hand_down_2'), P.handLocal);
  const layers = rig.layers.filter((l) => !cfg.hide.includes(l.name));

  if (cap) {
    const locals: Record<string, M> = {};
    const frames: Record<string, number> = {};
    for (const l of rig.layers) {
      const d = dxy[l.name] ?? [0, 0];
      locals[l.name] = localMatrix(l.m as M, l.tp, rot[l.name] ?? 0, d[0], d[1]);
      frames[l.name] = Math.min(l.frames.length - 1, Math.max(0, frameFor(l.name, l.first)));
    }
    const outer = mmul(
      cam,
      mmul(Tm(x, y), mmul(Sm(facing * s, s), mmul(Rm(pose.tilt), mmul(Tm(0, pose.lift / cfg.scale), Tm(-ox, -oy))))),
    ) as M;
    cap.chars.push({who, outer, locals, frames});
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * s} ${s})`}>
      <ellipse cx={0} cy={6 / s} rx={110} ry={20} fill={C.ink} opacity={0.12} />
      <g transform={`rotate(${pose.tilt} 0 0) translate(0 ${pose.lift / cfg.scale}) translate(${-ox} ${-oy})`}>
        {layers.map((l) => {
          const f = Math.min(l.frames.length - 1, Math.max(0, frameFor(l.name, l.first)));
          return <g key={l.name} transform={`matrix(${world(l.name).join(',')})`} dangerouslySetInnerHTML={{__html: l.frames[f]}} />;
        })}
        {children && (
          <g transform={`translate(${hand[0]} ${hand[1]}) scale(${1 / cfg.scale})`}>{children}</g>
        )}
      </g>
    </g>
  );
};
