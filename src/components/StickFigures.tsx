import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Stick figures: Ebo's doodles, acting the story out on a sketchbook page (Ep 12 experiment). Black marker lines,
 * a round head with a face, posable limbs. Each is a prop (prop.tsx): its own vector symbol in the Animate export.
 * Origin at the hips. Angles in degrees: 0 = hanging straight down, + = swung forward (toward +x), elbow/knee relative.
 */
const INK = C.ink;
const L = {stroke: INK, strokeWidth: 10, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};

export type StickPose = {
  armL?: [number, number];
  armR?: [number, number];
  legL?: [number, number];
  legR?: [number, number];
  /** whole-body lean, degrees (+ = forward) */
  lean?: number;
  eyes?: 'dot' | 'closed' | 'wide' | 'happy' | 'side';
  mouth?: 'smile' | 'flat' | 'o' | 'frown' | 'grin' | 'open';
  brows?: 'angry' | 'worried' | 'none';
  /** sweat drops */
  sweat?: boolean;
};
const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a: [number, number], l1: number, l2: number) => {
  const a1 = rad(a[0]);
  const ex = x + l1 * Math.sin(a1);
  const ey = y + l1 * Math.cos(a1);
  const a2 = rad(a[0] + a[1]);
  return `M ${x} ${y} L ${ex} ${ey} L ${ex + l2 * Math.sin(a2)} ${ey + l2 * Math.cos(a2)}`;
};

const StickFigureDrawing: React.FC<{x?: number; y?: number; facing?: 1 | -1; pose?: StickPose; hat?: string; hold?: React.ReactNode}> = ({x = 0, y = 0, facing = 1, pose = {}, hat, hold}) => {
  const {armL = [12, 10], armR = [-12, -10], legL = [10, 0], legR = [-10, 0], lean = 0, eyes = 'dot', mouth = 'smile', brows = 'none', sweat = false} = pose;
  // arm "R" is the near arm (drawn toward +x when facing right)
  const handR = (() => {
    const a1 = rad(armR[0]);
    const ex = 22 + 70 * Math.sin(a1);
    const ey = -150 + 70 * Math.cos(a1);
    const a2 = rad(armR[0] + armR[1]);
    return [ex + 70 * Math.sin(a2), ey + 70 * Math.cos(a2)];
  })();
  const mouthPath = {
    smile: 'M -18 -186 Q 0 -170 18 -186',
    grin: 'M -22 -190 Q 0 -160 22 -190 Z',
    flat: 'M -16 -182 L 16 -182',
    frown: 'M -18 -176 Q 0 -192 18 -176',
    o: '',
    open: 'M -20 -188 Q 0 -150 20 -188 Z',
  }[mouth];
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
      {/* legs */}
      <path d={limb(0, 0, legL, 85, 85)} {...L} />
      <path d={limb(0, 0, legR, 85, 85)} {...L} />
      <g transform={`rotate(${-lean} 0 0)`}>
        {/* body */}
        <path d="M 0 0 L 0 -150" {...L} />
        {/* arms from the shoulder */}
        <path d={limb(-6, -150, armL, 70, 70)} {...L} />
        <path d={limb(6, -150, armR, 70, 70)} {...L} />
        {hold && <g transform={`translate(${handR[0] - 16} ${handR[1]})`}>{hold}</g>}
        {/* head */}
        <g transform="translate(14 0)">
          <circle cx={0} cy={-210} r={56} fill="#fff" stroke={INK} strokeWidth={9} />
          {hat && <path d="M -56 -226 Q -50 -280 0 -282 Q 50 -280 56 -226 Z" fill={hat} stroke={INK} strokeWidth={7} strokeLinejoin="round" />}
          {eyes === 'dot' && <g><circle cx={-6} cy={-218} r={7} fill={INK} /><circle cx={26} cy={-218} r={7} fill={INK} /></g>}
          {eyes === 'side' && <g><circle cx={0} cy={-218} r={7} fill={INK} /><circle cx={32} cy={-218} r={7} fill={INK} /></g>}
          {eyes === 'wide' && <g><circle cx={-6} cy={-220} r={13} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={28} cy={-220} r={13} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={-4} cy={-220} r={5} fill={INK} /><circle cx={30} cy={-220} r={5} fill={INK} /></g>}
          {eyes === 'closed' && <path d="M -16 -218 l 18 0 M 18 -218 l 18 0" {...L} strokeWidth={6} />}
          {eyes === 'happy' && <path d="M -16 -214 q 10 -14 20 0 M 18 -214 q 10 -14 20 0" {...L} strokeWidth={6} />}
          {brows === 'angry' && <path d="M -20 -240 l 22 8 M 40 -240 l -22 8" {...L} strokeWidth={6} />}
          {brows === 'worried' && <path d="M -20 -232 l 22 -8 M 40 -232 l -22 -8" {...L} strokeWidth={6} />}
          {mouth === 'o' ? <circle cx={10} cy={-182} r={10} fill={INK} /> : <path d={mouthPath} transform="translate(10 0)" fill={mouth === 'grin' || mouth === 'open' ? INK : 'none'} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
          {sweat && <path d="M 62 -250 q -12 22 0 30 q 12 -8 0 -30 Z" fill="#6BB7E8" stroke={INK} strokeWidth={4} />}
        </g>
      </g>
    </g>
  );
};

/** A sketchbook page filling the frame: off-white paper, faint blue lines, a red margin, a spiral binding at the top. */
const SketchPageDrawing: React.FC<{lines?: boolean}> = ({lines = true}) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#FFFDF6" />
    {lines && Array.from({length: 34}, (_, i) => <line key={i} x1={-300} x2={1380} y1={160 + i * 64} y2={160 + i * 64} stroke="#CFE0F2" strokeWidth={3} />)}
    {lines && <line x1={110} x2={110} y1={-300} y2={2300} stroke="#F2B8B8" strokeWidth={4} />}
    {Array.from({length: 12}, (_, i) => <ellipse key={i} cx={60 + i * 90} cy={40} rx={16} ry={34} fill="none" stroke="#9A9AA6" strokeWidth={8} />)}
  </g>
);

/** Doodled café furniture: a little round table and a chair, in marker. `tipped`: the chair knocked over (degrees). */
const DoodleTableDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-190} rx={150} ry={26} {...L} fill="#fff" />
    <path d="M 0 -164 L 0 0 M -70 0 L 70 0" {...L} />
  </g>
);
const DoodleChairDrawing: React.FC<{x?: number; y?: number; tipped?: number}> = ({x = 0, y = 0, tipped = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tipped} 60 0)`}>
    <path d="M -50 -230 L -50 0 M -50 -110 L 60 -110 L 60 0 M -50 -110 L -50 -230" {...L} />
  </g>
);
/** A doodled cup with steam. */
const DoodleCupDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -26 -50 L 26 -50 L 20 0 L -20 0 Z" {...L} fill="#fff" strokeWidth={7} />
    <path d="M 26 -40 q 22 6 0 26" {...L} strokeWidth={6} />
    <path d="M -8 -64 q -10 -14 0 -28 M 10 -64 q -10 -14 0 -28" {...L} strokeWidth={5} />
  </g>
);
/** A doodled speech bubble with words, its tail toward -x/+x by `tail`. */
const DoodleBubbleDrawing: React.FC<{x?: number; y?: number; text?: string[]; tail?: 1 | -1; w?: number}> = ({x = 0, y = 0, text = [''], tail = -1, w = 460}) => {
  const h = 60 + text.length * 54;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w / 2} ${-h / 2} Q ${-w / 2 - 20} ${h / 2} ${-w / 4} ${h / 2} L ${tail * w * 0.2} ${h / 2} L ${tail * w * 0.32} ${h / 2 + 70} L ${tail * w * 0.05} ${h / 2} L ${w / 2} ${h / 2} Q ${w / 2 + 20} ${-h / 2} ${w / 4} ${-h / 2} Z`} {...L} fill="#fff" strokeWidth={7} />
      {text.map((t, i) => (
        <text key={i} y={(i - (text.length - 1) / 2) * 54 + 16} textAnchor="middle" fontFamily="EboMarker" fontSize={44} fill={INK}>
          {t}
        </text>
      ))}
    </g>
  );
};
/** Motion lines (a stick figure bursting in). */
const MotionLinesDrawing: React.FC<{x?: number; y?: number; dir?: 1 | -1}> = ({x = 0, y = 0, dir = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
    <path d="M 0 -60 l -110 0 M -10 0 l -150 0 M 0 60 l -110 0" {...L} strokeWidth={8} />
  </g>
);
/** A doodled wristwatch tap: little "tick tick" marks. */
const TickTockDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <text textAnchor="middle" fontFamily="EboMarker" fontSize={40} fill={INK}>tap tap</text>
  </g>
);
/** A cartoon impact star (the chair bump). */
const BonkDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 0 -60 L 16 -18 L 60 -18 L 24 8 L 38 52 L 0 26 L -38 52 L -24 8 L -60 -18 L -16 -18 Z" fill="#FFE45C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <text y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>BONK</text>
  </g>
);

const prop = <P extends object>(name: string, Drawing: React.FC<P>): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <Prop name={name}>
      <Drawing {...props} />
    </Prop>
  );
  return Wrapped;
};

export const StickFigure = prop('StickFigure', StickFigureDrawing);
export const SketchPage = prop('SketchPage', SketchPageDrawing);
export const DoodleTable = prop('DoodleTable', DoodleTableDrawing);
export const DoodleChair = prop('DoodleChair', DoodleChairDrawing);
export const DoodleCup = prop('DoodleCup', DoodleCupDrawing);
export const DoodleBubble = prop('DoodleBubble', DoodleBubbleDrawing);
export const MotionLines = prop('MotionLines', MotionLinesDrawing);
export const TickTock = prop('TickTock', TickTockDrawing);
export const Bonk = prop('Bonk', BonkDrawing);
