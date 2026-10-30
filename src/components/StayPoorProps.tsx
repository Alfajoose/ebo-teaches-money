import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 3 (How to Stay Poor). Each is a prop (see prop.tsx): hand-drawn in the
 * video, its own vector symbol in the Animate export. Origins are at the bottom-centre
 * unless noted. Animated parts only move or turn (house rule: no scale).
 */

const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** Striped popcorn bucket (held). Origin at its base. */
const PopcornDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {[[-30, -112], [-8, -122], [16, -118], [34, -108], [-18, -100], [8, -104]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={15} fill="#FFF6DA" {...S} strokeWidth={4} />
    ))}
    <path d="M -46 -96 L 46 -96 L 34 0 L -34 0 Z" fill={C.white} {...S} />
    {[-28, 0, 28].map((dx) => (
      <path key={dx} d={`M ${dx - 8} -96 L ${dx + 8} -96 L ${dx * 0.74 + 6} 0 L ${dx * 0.74 - 6} 0 Z`} fill={C.red} />
    ))}
    <path d="M -46 -96 L 46 -96 L 34 0 L -34 0 Z" fill="none" {...S} />
  </g>
);

/** TV remote (held). Origin at its centre. */
const RemoteDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-16} y={-50} width={32} height={100} rx={10} fill="#3A3A44" {...S} strokeWidth={5} />
    <circle cx={0} cy={-30} r={6} fill={C.red} />
    {[-8, 6, 20].map((yy) => (
      <g key={yy}>
        <circle cx={-6} cy={yy} r={4} fill="#9A9AA6" />
        <circle cx={6} cy={yy} r={4} fill="#9A9AA6" />
      </g>
    ))}
  </g>
);

/** Open laptop on a table top. */
const LaptopDrawing: React.FC<{x?: number; y?: number; screen?: 'off' | 'code' | 'shop'}> = ({x = 0, y = 0, screen = 'code'}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -110 -150 L 110 -150 L 110 -14 L -110 -14 Z" fill="#2E3440" {...S} />
    <rect x={-96} y={-138} width={192} height={112} rx={4} fill={screen === 'off' ? '#4B566E' : '#F6F0E4'} />
    {screen === 'code' &&
      [0, 1, 2, 3, 4].map((i) => <rect key={i} x={-84 + (i % 2) * 18} y={-126 + i * 20} width={90 - (i % 3) * 22} height={9} rx={4} fill={['#45B69C', '#4D8FD6', '#E5484D'][i % 3]} />)}
    {screen === 'shop' && (
      <g>
        <rect x={-84} y={-126} width={70} height={60} fill="#F7C873" />
        <rect x={-6} y={-122} width={80} height={10} fill={C.ink} />
        <rect x={-6} y={-102} width={44} height={14} fill={C.moneyDark} />
      </g>
    )}
    <path d="M -130 -14 L 130 -14 L 140 0 L -140 0 Z" fill="#C9CDD6" {...S} />
  </g>
);

/** Easel with a canvas; `done` 0–1 is how much of the portrait is painted (in steps). */
const EaselDrawing: React.FC<{x?: number; y?: number; done?: number; framed?: boolean}> = ({x = 0, y = 0, done = 1, framed = false}) => {
  const step = Math.floor(Math.min(1, Math.max(0, done)) * 4); // 0..4 strokes, held, no tweening
  return (
    <g transform={`translate(${x} ${y})`}>
      {!framed && (
        <g>
          <path d="M -90 0 L -20 -420 M 90 0 L 20 -420 M 0 -420 L 0 0" stroke="#8B6A48" strokeWidth={14} strokeLinecap="round" />
          <rect x={-120} y={-150} width={240} height={18} rx={6} fill="#A57A45" {...S} strokeWidth={5} />
        </g>
      )}
      <rect x={-110} y={-430} width={220} height={280} fill={framed ? '#F3E3B6' : C.white} {...S} strokeWidth={framed ? 14 : 7} />
      {step >= 1 && <rect x={-110} y={-430} width={220} height={280} fill="#A9D6EE" />}
      {step >= 2 && <circle cx={0} cy={-310} r={56} fill="#7A5A3A" {...S} strokeWidth={5} />}
      {step >= 3 && <path d="M -70 -150 Q 0 -250 70 -150 Z" fill={C.purple} {...S} strokeWidth={5} />}
      {step >= 4 && (
        <g>
          <circle cx={-18} cy={-318} r={6} fill={C.ink} />
          <circle cx={18} cy={-318} r={6} fill={C.ink} />
          <path d="M -18 -292 Q 0 -278 18 -292" stroke={C.ink} strokeWidth={5} fill="none" />
        </g>
      )}
      <rect x={-110} y={-430} width={220} height={280} fill="none" {...S} strokeWidth={framed ? 14 : 7} />
    </g>
  );
};

/** Paintbrush (held). Origin at its centre. */
const BrushDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-6} y={-40} width={12} height={70} rx={5} fill="#C9744A" {...S} strokeWidth={4} />
    <rect x={-7} y={-56} width={14} height={18} fill="#B8BCC6" {...S} strokeWidth={4} />
    <path d="M -7 -56 Q 0 -86 7 -56 Z" fill={C.purple} {...S} strokeWidth={4} />
  </g>
);

/** Hamster wheel with its hamster; `spin` turns the wheel (degrees), the hamster bobs in place. */
const HamsterWheelDrawing: React.FC<{x?: number; y?: number; spin?: number; step?: number}> = ({x = 0, y = 0, spin = 0, step = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -150 0 L 0 -200 L 150 0" stroke="#7D7F88" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <g transform={`translate(0 -200) rotate(${spin})`}>
      <circle r={190} fill="#BFE3EA" {...S} strokeWidth={10} />
      <circle r={160} fill="none" stroke="#5E8FA0" strokeWidth={6} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 160} y1={Math.sin(a) * 160} x2={Math.cos(a) * 190} y2={Math.sin(a) * 190} stroke={C.ink} strokeWidth={5} />;
      })}
      <circle r={16} fill="#7D7F88" {...S} strokeWidth={5} />
    </g>
    {/* the hamster: bobs up and down on the bottom of the wheel */}
    <g transform={`translate(0 ${-58 - (step % 2) * 10}) rotate(${(step % 2) * 6 - 3})`}>
      <ellipse cx={0} cy={0} rx={58} ry={40} fill="#E8B07A" {...S} strokeWidth={6} />
      <circle cx={44} cy={-16} r={10} fill="#F4A3B4" {...S} strokeWidth={4} />
      <circle cx={34} cy={-8} r={5} fill={C.ink} />
      <path d={step % 2 ? 'M -30 36 L -40 52 M 20 36 L 34 50' : 'M -30 36 L -18 52 M 20 36 L 8 52'} stroke={C.ink} strokeWidth={6} />
    </g>
  </g>
);

/** Crystal ball on its stand (sits on a table). */
const CrystalBallDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -60 0 L 60 0 L 40 -40 L -40 -40 Z" fill="#7A4A8E" {...S} />
    <circle cx={0} cy={-110} r={78} fill="#CFC3F2" {...S} />
    <path d="M -40 -150 Q -20 -170 6 -168" stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
    <text x={0} y={-92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#8F6BD1">
      $?
    </text>
  </g>
);

/** Candle (sits on a table). The flame is drawn still, not flickering. */
const CandleDrawing: React.FC<{x?: number; y?: number; h?: number}> = ({x = 0, y = 0, h = 110}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-16} y={-h} width={32} height={h} rx={4} fill="#F3E3B6" {...S} strokeWidth={5} />
    <line x1={0} x2={0} y1={-h} y2={-h - 12} stroke={C.ink} strokeWidth={4} />
    <path d={`M 0 ${-h - 50} Q 18 ${-h - 24} 0 ${-h - 10} Q -18 ${-h - 24} 0 ${-h - 50} Z`} fill={C.yellow} {...S} strokeWidth={4} />
  </g>
);

/** A lottery ticket. Origin at its centre. */
const TicketDrawing: React.FC<{x?: number; y?: number; rotate?: number; label?: string}> = ({x = 0, y = 0, rotate = 0, label = 'LOTTO'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-70} y={-38} width={140} height={76} rx={6} fill="#FFE680" {...S} strokeWidth={5} />
    <line x1={34} x2={34} y1={-38} y2={38} stroke={C.ink} strokeWidth={3} strokeDasharray="6 6" />
    <text x={-18} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.red}>
      {label}
    </text>
    <text x={-18} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill={C.ink}>
      07 13 42
    </text>
  </g>
);

/** Notebook with a pen (held or on a table). Origin at its centre. */
const NotebookDrawing: React.FC<{x?: number; y?: number; rotate?: number; lines?: number}> = ({x = 0, y = 0, rotate = 0, lines = 3}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill={C.white} {...S} strokeWidth={5} />
    <rect x={-60} y={-80} width={18} height={160} fill="#E5484D" {...S} strokeWidth={5} />
    {Array.from({length: lines}).map((_, i) => (
      <line key={i} x1={-30} x2={44 - (i % 2) * 20} y1={-44 + i * 32} y2={-44 + i * 32} stroke="#4D8FD6" strokeWidth={6} strokeLinecap="round" />
    ))}
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

export const Popcorn = prop('Popcorn', PopcornDrawing);
export const Remote = prop('Remote', RemoteDrawing);
export const Laptop = prop('Laptop', LaptopDrawing);
export const Easel = prop('Easel', EaselDrawing);
export const Brush = prop('Brush', BrushDrawing);
export const HamsterWheel = prop('HamsterWheel', HamsterWheelDrawing);
export const CrystalBall = prop('CrystalBall', CrystalBallDrawing);
export const Candle = prop('Candle', CandleDrawing);
export const Ticket = prop('Ticket', TicketDrawing);
export const Notebook = prop('Notebook', NotebookDrawing);
