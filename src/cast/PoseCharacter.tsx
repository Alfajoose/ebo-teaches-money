import React, {useContext} from 'react';
import {C} from '../theme';
import konkaJson from './data/konka.json';
import konkaMeasure from './data/konka-measure.json';
import {CameraContext, mmul, S as Sm, T as Tm, useCapture, useLayerMode} from '../series/exportCtx';

/**
 * A pose-library character (Konka): every pose is one drawn frame of his symbol (body, arms and
 * legs are drawn swaps placed per pose — see cast/tools/export_poselib.py). Poses snap from one
 * to the next (house rule 1); nothing rotates or scales. His eyes, pupils and mouth sit on their
 * own layers, so blinks and lip sync swap on top of any pose.
 */

type Item = {layer: string; sym?: string; frame?: number; svg?: string; m: number[]};
type PoseLib = {symbol: string; poses: Item[][]; symbols: Record<string, string[]>};
type M = [number, number, number, number, number, number];

export type PoseCastId = 'konka';

type PoseCfg = {
  lib: PoseLib;
  scale: number; // symbol units → world px (static)
  origin: [number, number]; // feet, in symbol space (all poses share the ground line)
  mouthLayer: string;
  eyeLayers: string[];
  pupilLayers: string[];
  blinkFrame: number; // eye frame for a blink (pupils hidden)
  /** lip sync per mood: [wide, mid, round] mouth frames (rest = the pose's own mouth) */
  lip: Record<'happy' | 'upset' | 'neutral', (number | number[])[]>;
  /** the pose's own mouth frame decides the talking mood */
  mood: (restMouth: number) => 'happy' | 'upset' | 'neutral';
  blinkOffset: number;
};

const KB = (konkaMeasure as {bounds: number[][]}).bounds[0];
export const POSE_CAST: Record<PoseCastId, PoseCfg> = {
  // Konka's mouths (mouth 01): 0 line · 1 tall open · 2 small open smile · 3 big open · 4 wavy · 5 smile
  // 6 round o · 7 big laugh · 8 gritted · 9 open round · 12 small · 13 side smile · 14 big open grin
  // 15 squiggle · 16 wide smile · 17 black o
  konka: {
    lib: konkaJson as PoseLib,
    scale: 0.82,
    origin: [(KB[0] + KB[2]) / 2, KB[3]],
    mouthLayer: 'mouth_01',
    eyeLayers: ['eye_1', 'eye_2'],
    pupilLayers: ['pupil', 'pupil_2'],
    blinkFrame: 3,
    lip: {happy: [[3, 14], [2, 9], [6, 9]], upset: [[1, 3], [8, 9], [6, 17]], neutral: [[3, 1], [2, 9], [6, 9]]},
    mood: (m) => ([4, 8, 15, 17].includes(m) ? 'upset' : [2, 5, 7, 10, 13, 14, 16].includes(m) ? 'happy' : 'neutral'),
    blinkOffset: 11,
  },
};

const pick = (v: number | number[], t: number) => (Array.isArray(v) ? v[Math.floor(t / 4) % v.length] : v);

type Props = {
  who: PoseCastId;
  pose: number; // frame of his pose library
  x?: number;
  y?: number;
  facing?: 1 | -1;
  t?: number;
  lip?: number; // kit.lipFrame level: 0 rest, 1 wide, 2 mid, 3 round
  noBlink?: boolean;
  /** look direction for the pupils, in symbol units */
  look?: [number, number];
  children?: React.ReactNode; // drawn over him at `hold` (symbol space), e.g. a phone in his hand
  hold?: [number, number];
};

export const PoseCharacter: React.FC<Props> = ({who, pose, x = 0, y = 0, facing = 1, t = 0, lip, noBlink, look = [0, 0], children, hold}) => {
  const mode = useLayerMode();
  const cap = useCapture();
  const cam = useContext(CameraContext);
  if (mode !== 'full') return null;
  const cfg = POSE_CAST[who];
  const items = cfg.lib.poses[Math.max(0, Math.min(cfg.lib.poses.length - 1, Math.round(pose)))];
  const rest = items.find((it) => it.layer === cfg.mouthLayer)?.frame ?? 0;
  const mouth = lip === undefined || lip === 0 ? rest : pick(cfg.lip[cfg.mood(rest)][lip - 1], t);
  const blink = !noBlink && (t + 23 + cfg.blinkOffset) % 89 < 4;
  const s = cfg.scale;
  const [ox, oy] = cfg.origin;
  const frameOf = (it: Item) => {
    if (it.layer === cfg.mouthLayer) return mouth;
    if (blink && cfg.eyeLayers.includes(it.layer)) return cfg.blinkFrame;
    return it.frame ?? 0;
  };
  const shown = (it: Item) => !(blink && cfg.pupilLayers.includes(it.layer));
  const lookM = (it: Item): M => (cfg.pupilLayers.includes(it.layer) ? [1, 0, 0, 1, look[0], look[1]] : [1, 0, 0, 1, 0, 0]);
  const outer = mmul(cam, mmul(Tm(x, y), mmul(Sm(facing * s, s), Tm(-ox, -oy)))) as M;

  if (cap) {
    const frames: Record<string, number> = {};
    // only the face swaps are overridden; everything else is the pose's own frame
    for (const it of items) if (it.sym && (it.layer === cfg.mouthLayer || cfg.eyeLayers.includes(it.layer))) frames[it.layer] = frameOf(it);
    cap.chars.push({who, outer, locals: {}, frames, pose: Math.round(pose), hidden: items.filter((it) => !shown(it)).map((it) => it.layer)});
  }

  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={150} ry={22} fill={C.ink} opacity={0.12} />
      <g transform={`scale(${facing * s} ${s}) translate(${-ox} ${-oy})`}>
        {items.filter(shown).map((it, k) => {
          const body = it.svg ?? cfg.lib.symbols[it.sym!][Math.min(cfg.lib.symbols[it.sym!].length - 1, frameOf(it))];
          const m = mmul(lookM(it), it.m as M);
          return <g key={k} transform={`matrix(${m.join(',')})`} dangerouslySetInnerHTML={{__html: body}} />;
        })}
        {children && hold && (
          <CameraContext.Provider value={mmul(outer, Tm(hold[0], hold[1])) as M}>
            <g transform={`translate(${hold[0]} ${hold[1]}) scale(${facing / s} ${1 / s})`}>{children}</g>
          </CameraContext.Provider>
        )}
      </g>
    </g>
  );
};
