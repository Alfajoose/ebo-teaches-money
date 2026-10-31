import React from 'react';
import {C} from '../theme';
import type {Pose, Eyes, Mouth} from '../components/Character';
import {CAST, CastId, CastConfig, RigData, EYES_FALLBACK, MOUTH_FALLBACK} from './castConfig';
import {CycleName, cycleFrame, getCycle} from './cycles';
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

/** The right arm of rigs that also have an in-front copy (Ebo): back pair and front pair. */
const ARM_R_BACK = ['hand_top_2', 'hand_down_2'] as const;
const ARM_R_FRONT = ['hand_top_2_front', 'hand_down_2_front'] as const;

type Layer = RigData['layers'][number];
type Eff = {m: number[]; first: number; show: boolean};

type Prepared = {
  cfg: CastConfig;
  rig: RigData;
  view: number;
  byName: Record<string, Layer>;
  byRig: Record<string, Layer>;
  eff: Record<string, Eff>; // each layer in this view
  rest: Record<string, number>;
  origin: [number, number];
  handLocal: Record<string, [number, number]>; // per forearm layer: the hand tip in its own space
};
const cache: Record<string, Prepared> = {};

const prepare = (id: CastId, view: number): Prepared => {
  const key = `${id}@${view}`;
  const hit = cache[key];
  if (hit) return hit;
  const cfg = CAST[id];
  const rig = cfg.rig;
  const meas = MEASURE[view ? key : id];
  if (!meas) throw new Error(`no measurement for ${key}: run scripts/measure-rigs.mjs`);
  const byName = Object.fromEntries(rig.layers.map((l) => [l.name, l]));
  const byRig = Object.fromEntries(rig.layers.filter((l) => l.rig != null).map((l) => [l.rig as string, l]));
  const eff: Record<string, Eff> = {};
  for (const l of rig.layers) {
    const v = l.views?.[view];
    eff[l.name] = v ? {m: v.m ?? l.m, first: v.first ?? l.first, show: v.show} : {m: l.m, first: l.first, show: true};
  }
  const rest: Record<string, number> = {};
  const pairs = [...Object.values(LIMBS), ARM_R_FRONT];
  for (const [upper, lower] of pairs) {
    if (!meas.layers[upper] || !meas.layers[lower]) continue;
    const pu = meas.layers[upper].pivot;
    const pl = meas.layers[lower].pivot;
    const cl = meas.layers[lower].center ?? pl;
    rest[upper] = angOf(pu, pl);
    rest[lower] = angOf(pl, cl);
  }
  // rest-pose world matrix of the right forearm → find the hand tip in its local space
  const world0 = (name: string): M => {
    const l = byName[name];
    return l.parent != null && byRig[l.parent] ? mul(world0(byRig[l.parent].name), eff[name].m as M) : (eff[name].m as M);
  };
  const handLocal: Record<string, [number, number]> = {};
  for (const fore of [ARM_R_BACK[1], ARM_R_FRONT[1]]) {
    const ml = meas.layers[fore];
    if (!ml || !byName[fore]) continue;
    const fp = ml.pivot;
    const fc = ml.center ?? fp;
    handLocal[fore] = ap(inv(world0(fore)), [fp[0] + (fc[0] - fp[0]) * 1.7, fp[1] + (fc[1] - fp[1]) * 1.7]);
  }
  const p: Prepared = {cfg, rig, view, byName, byRig, eff, rest, origin: [meas.layers.waist.pivot[0], meas.bounds[3]], handLocal};
  cache[key] = p;
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
  cycle?: CycleName; // play a walk/run cycle (body only); pose still drives face, tilt and lift
  cycleOffset?: number; // shift the cycle in video frames (so two walkers aren't in step)
};

export const RigCharacter: React.FC<Props> = ({who, x = 0, y = 0, scale = 1, facing = 1, pose, t = 0, children, mouthFrame, eyeFrame: eyeOverride, noBlink, cycle, cycleOffset = 0}) => {
  const mode = useLayerMode();
  const cap = useCapture();
  const cam = useContext(CameraContext);
  if (mode !== 'full') return null;
  // a walk / run cycle is drawn in the rig's first view
  const cyc = cycle ? getCycle(who, cycle) : null;
  const nViews = CAST[who].rig.views ?? 1;
  const view = cyc ? 0 : Math.max(0, Math.min(nViews - 1, Math.round(pose.view ?? 0)));
  const P = prepare(who, view);
  const {cfg, rig, byName, byRig, rest} = P;

  // ── which right arm draws: the back pair (behind the head) or the in-front pair ──
  const eff: Record<string, Eff> = {...P.eff};
  const alias: Record<string, string> = {}; // drawn layer → the layer whose placement / rest it borrows
  let armR: readonly [string, string] = LIMBS.armR;
  if (byName[ARM_R_FRONT[0]]) {
    const backShown = eff[ARM_R_BACK[0]].show;
    const src = backShown ? ARM_R_BACK : ARM_R_FRONT;
    const dst = pose.armFront ?? !backShown ? ARM_R_FRONT : ARM_R_BACK;
    armR = dst;
    if (src !== dst) {
      for (let k = 0; k < 2; k++) {
        eff[dst[k]] = {...eff[src[k]], show: true};
        eff[src[k]] = {...eff[src[k]], show: false};
        alias[dst[k]] = src[k];
      }
    }
  }
  const base = (name: string) => alias[name] ?? name;

  // ── layer rotations from limb angles ──
  const rot: Record<string, number> = {};
  const dxy: Record<string, [number, number]> = {};
  rot.head = pose.headTilt;
  const setLimb = (upper: string, lower: string, upperAbs: number, lowerAbs: number) => {
    const ru = upperAbs - rest[base(upper)];
    rot[upper] = ru;
    rot[lower] = lowerAbs - rest[base(lower)] - ru;
  };
  const armLUp = cfg.armLMax !== undefined && view !== 3 ? Math.min(pose.armL[0], cfg.armLMax) : pose.armL[0];
  setLimb(LIMBS.armL[0], LIMBS.armL[1], armLUp, armLUp + pose.armL[1]);
  setLimb(armR[0], armR[1], -pose.armR[0], -(pose.armR[0] + pose.armR[1]));
  setLimb(LIMBS.legL[0], LIMBS.legL[1], -pose.legL[0], -(pose.legL[0] - pose.legL[1]));
  setLimb(LIMBS.legR[0], LIMBS.legR[1], -pose.legR[0], -(pose.legR[0] - pose.legR[1]));

  // ── face ──
  const blink = !noBlink && (t + 17 + cfg.blinkOffset) % 97 < 4;
  let eyes: Eyes = pose.eyes;
  if (blink && ['open', 'half', 'sad', 'dollar', 'tired', 'suspicious', 'angry'].includes(eyes)) eyes = 'closed';
  const eyeOf = (e: Eyes) => cfg.eyes[e] ?? cfg.eyes[EYES_FALLBACK[e] ?? 'open'] ?? 0;
  const eyeFrame = eyeOverride !== undefined && !blink ? eyeOverride : eyeOf(eyes);
  const pup = cfg.pupils ? cfg.pupils.eyes[eyes] ?? cfg.pupils.eyes[EYES_FALLBACK[eyes] ?? 'open'] ?? [null, null] : null;
  const mouthOf = (m: Mouth) => cfg.mouth[m] ?? cfg.mouth[MOUTH_FALLBACK[m] ?? 'smile'] ?? 0;
  const mouthF =
    mouthFrame !== undefined ? (cfg.lip ? pickFrame(cfg.lip[mouthFrame] ?? cfg.lip[0], t) : mouthFrame) : pickFrame(mouthOf(pose.mouth as Mouth), t);
  const look: [number, number] = [pose.lookX * 0.6, pose.lookY * 0.5];
  for (const e of cfg.pupils?.layers ?? cfg.eyeLayers) dxy[e] = look;
  if (byName.mouth) dxy.mouth = [look[0] * 0.5, look[1] * 0.3];

  // ── a cycle replaces the body layers' rest matrices frame by frame ──
  const cf = cyc ? cycleFrame(cyc, t + cycleOffset) : 0;
  const baseM = (name: string): M => {
    const k = cyc?.layers[base(name)];
    return (k ? k[cf] : eff[name].m) as M;
  };
  const rotOf = (name: string) => (cyc?.layers[base(name)] ? 0 : rot[name] ?? 0);

  // ── compose world matrices along the parent chain ──
  const memo: Record<string, M> = {};
  const world = (name: string): M => {
    if (memo[name]) return memo[name];
    const l = byName[name];
    const d = dxy[name] ?? [0, 0];
    const local = localMatrix(baseM(name), l.tp, rotOf(name), d[0], d[1]);
    const w = l.parent != null && byRig[l.parent] ? mul(world(byRig[l.parent].name), local) : local;
    memo[name] = w;
    return w;
  };

  const frameFor = (name: string, first: number) => {
    if (pup) {
      const ei = cfg.eyeLayers.indexOf(name);
      if (ei >= 0) return eyeOverride !== undefined && !blink ? (Array.isArray(eyeOverride) ? eyeOverride[ei] : eyeOverride) : pup[0] ?? first;
      if (cfg.pupils!.layers.includes(name)) return pup[1] ?? first;
    } else if (cfg.eyeLayers.includes(name)) return Array.isArray(eyeFrame) ? eyeFrame[cfg.eyeLayers.indexOf(name)] : eyeFrame;
    if (name === 'mouth') return mouthF;
    return cfg.outfit?.[name] ?? first;
  };

  const s = scale * cfg.scale;
  const [ox, oy] = P.origin;
  const hand = ap(world(armR[1]), P.handLocal[base(armR[1])]);
  const layers = rig.layers.filter((l) => !cfg.hide.includes(l.name) && eff[l.name].show);

  const outer = mmul(
    cam,
    mmul(Tm(x, y), mmul(Sm(facing * s, s), mmul(Rm(pose.tilt), mmul(Tm(0, pose.lift / cfg.scale), Tm(-ox, -oy))))),
  ) as M;
  const handM = mmul(outer, mmul(Tm(hand[0], hand[1]), Sm(1 / cfg.scale, 1 / cfg.scale)));

  if (cap) {
    const locals: Record<string, M> = {};
    const frames: Record<string, number> = {};
    const hidden: string[] = [];
    for (const l of rig.layers) {
      if (!eff[l.name].show) {
        hidden.push(l.name);
        continue;
      }
      const d = dxy[l.name] ?? [0, 0];
      locals[l.name] = localMatrix(baseM(l.name), l.tp, rotOf(l.name), d[0], d[1]);
      frames[l.name] = Math.min(l.frames.length - 1, Math.max(0, frameFor(l.name, eff[l.name].first)));
    }
    cap.chars.push({who, outer, locals, frames, hidden});
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * s} ${s})`}>
      <ellipse cx={0} cy={6 / s} rx={110} ry={20} fill={C.ink} opacity={0.12} />
      <g transform={`rotate(${pose.tilt} 0 0) translate(0 ${pose.lift / cfg.scale}) translate(${-ox} ${-oy})`}>
        {layers.map((l) => {
          const f = Math.min(l.frames.length - 1, Math.max(0, frameFor(l.name, eff[l.name].first)));
          return <g key={l.name} transform={`matrix(${world(l.name).join(',')})`} dangerouslySetInnerHTML={{__html: l.frames[f]}} />;
        })}
        {children && (
          // held props: tell the Animate export where the hand is on screen
          <CameraContext.Provider value={handM}>
            <g transform={`translate(${hand[0]} ${hand[1]}) scale(${1 / cfg.scale})`}>{children}</g>
          </CameraContext.Provider>
        )}
      </g>
    </g>
  );
};
