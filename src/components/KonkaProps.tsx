import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Konka's Short "Can't control your lust?". Each is a prop (prop.tsx): hand-drawn in
 * the video, its own vector symbol in the Animate export. Origins at the bottom-centre unless noted.
 */
const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const KONKA_SKIN = '#FF9966';

const DumbbellDrawing: React.FC<{x?: number; y?: number; small?: boolean; rotate?: number}> = ({x = 0, y = 0, small = false, rotate = 0}) =>
  small ? (
    // hand-held size: a single dumbbell gripped in the middle
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-50} y={-7} width={100} height={14} fill="#666" {...S} strokeWidth={4} />
      <rect x={-76} y={-34} width={30} height={68} rx={9} fill="#3A3A44" {...S} strokeWidth={5} />
      <rect x={46} y={-34} width={30} height={68} rx={9} fill="#3A3A44" {...S} strokeWidth={5} />
    </g>
  ) : (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-110} y={-10} width={220} height={20} fill="#666" {...S} strokeWidth={5} />
      <rect x={-150} y={-50} width={42} height={100} rx={10} fill="#3A3A44" {...S} />
      <rect x={108} y={-50} width={42} height={100} rx={10} fill="#3A3A44" {...S} />
    </g>
  );
/** A wooden crate (a stand to work on, so nobody has to kneel). Its top is at y − 150. */
const CrateDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-150} width={220} height={150} fill="#B98A55" {...S} />
    <path d="M -110 -100 L 110 -100 M -110 -50 L 110 -50" {...S} strokeWidth={4} />
    <path d="M -110 -150 L 110 0" {...S} strokeWidth={4} />
  </g>
);
const BirdhouseDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(-4)`}>
    <rect x={-90} y={-150} width={180} height={150} fill="#C99A62" {...S} />
    <path d="M -115 -150 L 0 -240 L 115 -150 Z" fill="#B5563C" {...S} />
    <circle cx={0} cy={-80} r={28} fill={C.ink} />
    <path d="M -10 -40 L 40 -40" {...S} />
  </g>
);
const MirrorDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-640} width={340} height={640} rx={170} fill="#DCEEF8" stroke="#8B6A48" strokeWidth={20} />
    <path d="M -90 -500 L -30 -560" stroke="#fff" strokeWidth={16} strokeLinecap="round" />
  </g>
);
const PizzaDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-24} width={340} height={24} fill="#C9A16B" {...S} />
    <ellipse cx={0} cy={-34} rx={140} ry={42} fill="#F3C53F" {...S} />
    {[[-70, -36], [10, -44], [70, -30], [-20, -24]].map(([dx, dy], i) => (
      <circle key={i} cx={dx} cy={dy} r={15} fill="#D9534F" />
    ))}
  </g>
);
/** A thought bubble; origin at the small trailing bubble (put it by his head). */
const ThoughtDrawing: React.FC<{x?: number; y?: number; text?: string}> = ({x = 0, y = 0, text = '?!'}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={0} r={18} fill="#fff" {...S} strokeWidth={6} />
    <circle cx={40} cy={-60} r={30} fill="#fff" {...S} strokeWidth={6} />
    <ellipse cx={180} cy={-200} rx={220} ry={130} fill="#fff" {...S} />
    <text x={180} y={-175} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={C.ink}>
      {text}
    </text>
  </g>
);
/** `drawn` 0–1: how much of the line has been chalked, left to right (in dashes, held). */
const ChalkLineDrawing: React.FC<{x?: number; y?: number; drawn?: number}> = ({x = 0, y = 0, drawn = 1}) => {
  const n = Math.round(Math.max(0, Math.min(1, drawn)) * 9);
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* gives the line some height, so the hand-drawn filter has an area to draw in */}
      <rect x={-320} y={-24} width={640} height={48} fill="#000" opacity={0} />
      {Array.from({length: n}).map((_, i) => (
        <path key={i} d={`M ${-300 + i * 72} 0 l 44 0`} stroke="#4A3F6B" strokeWidth={16} strokeLinecap="round" />
      ))}
    </g>
  );
};
const ChecklistDrawing: React.FC<{x?: number; y?: number; ticks?: number}> = ({x = 0, y = 0, ticks = 3}) => (
  <g transform={`translate(${x} ${y}) rotate(2)`}>
    <rect x={-150} y={-200} width={300} height={320} fill="#FFF6DA" {...S} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={-110} y={-150 + i * 90} width={50} height={50} fill="none" {...S} strokeWidth={5} />
        {i < ticks && <path d={`M -104 ${-128 + i * 90} l 18 20 l 34 -40`} stroke="#45B69C" strokeWidth={12} fill="none" strokeLinecap="round" />}
        <rect x={-40} y={-132 + i * 90} width={150} height={14} rx={7} fill="#B5A88C" />
      </g>
    ))}
  </g>
);
/** His to-do list, for the moment it slips out of his hand. Origin at its centre. */
const TodoDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-70} y={-90} width={140} height={180} fill="#fff" {...S} strokeWidth={5} />
    <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
      TO DO
    </text>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-50} y={-24 + i * 32} width={100 - i * 16} height={10} rx={5} fill="#B5A88C" />
    ))}
  </g>
);

/** Held props (origin = where the hand grips them). */
const HammerDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-8} y={-110} width={16} height={130} rx={6} fill="#B98458" {...S} strokeWidth={5} />
    <rect x={-40} y={-140} width={80} height={36} rx={6} fill="#666" {...S} strokeWidth={5} />
  </g>
);
const SliceDrawing: React.FC<{x?: number; y?: number; rotate?: number; bitten?: boolean}> = ({x = 0, y = 0, rotate = 0, bitten = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d={bitten ? 'M -40 -10 L 50 -40 Q 40 -55 30 -48 Q 20 -62 8 -50 Q -2 -64 -14 -50 Z' : 'M -40 -10 L 60 -70 Q 70 -40 50 -20 Z'} fill="#F3C53F" {...S} strokeWidth={5} />
    <path d="M -40 -10 L 50 -40" stroke="#C9A16B" strokeWidth={14} strokeLinecap="round" />
    <circle cx={10} cy={-30} r={7} fill="#D9534F" />
  </g>
);
const BallDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={24} fill="#C8E35A" {...S} strokeWidth={5} />
    <path d="M -22 -8 Q 0 4 22 -8 M -22 8 Q 0 -4 22 8" stroke="#fff" strokeWidth={4} fill="none" />
  </g>
);
const ChalkDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-8} y={-10} width={16} height={56} rx={5} fill="#fff" {...S} strokeWidth={4} />
  </g>
);
const MarkerDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-9} y={-20} width={18} height={70} rx={6} fill="#45B69C" {...S} strokeWidth={4} />
    <path d="M -6 50 L 0 64 L 6 50 Z" fill={C.ink} />
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
export const Dumbbell = prop('Dumbbell', DumbbellDrawing);
export const Birdhouse = prop('Birdhouse', BirdhouseDrawing);
export const Crate = prop('Crate', CrateDrawing);
export const Mirror = prop('Mirror', MirrorDrawing);
export const Pizza = prop('Pizza', PizzaDrawing);
export const Thought = prop('Thought', ThoughtDrawing);
export const ChalkLine = prop('ChalkLine', ChalkLineDrawing);
export const Checklist = prop('Checklist', ChecklistDrawing);
export const Todo = prop('Todo', TodoDrawing);
export const Hammer = prop('Hammer', HammerDrawing);
export const Slice = prop('Slice', SliceDrawing);
export const Ball = prop('Ball', BallDrawing);
export const Chalk = prop('Chalk', ChalkDrawing);
export const Marker = prop('Marker', MarkerDrawing);
