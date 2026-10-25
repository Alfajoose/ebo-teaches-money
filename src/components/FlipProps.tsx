import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 2 (flipping). Each is a prop (see prop.tsx): hand-drawn in the video,
 * its own vector symbol in the Animate export. Origins are at the bottom-centre unless noted.
 */

const S = {stroke: C.ink, strokeWidth: 8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const DUST = '#9C9284';

/** The lamp the episode flips: dusty → clean → bulb on. */
const LampDrawing: React.FC<{x?: number; y?: number; rotate?: number; dust?: number; on?: boolean}> = ({x = 0, y = 0, rotate = 0, dust = 0, on = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <ellipse cx={0} cy={-10} rx={62} ry={16} fill="#7A5A3A" {...S} strokeWidth={6} />
    <path d="M -10 -18 L -14 -150 L 14 -150 L 10 -18 Z" fill="#B8873E" {...S} strokeWidth={6} />
    <circle cx={0} cy={-90} r={20} fill="#C99A4E" {...S} strokeWidth={6} />
    <circle cx={0} cy={-170} r={22} fill={on ? '#FFE680' : '#E8E2D2'} {...S} strokeWidth={5} />
    <path d="M -90 -160 L 90 -160 L 58 -270 L -58 -270 Z" fill={on ? '#F7C873' : '#3E8E7E'} {...S} />
    <path d="M -74 -190 L 74 -190" stroke={on ? '#D9A24E' : '#2F6F62'} strokeWidth={6} />
    {dust > 0 && (
      <g opacity={dust}>
        <path d="M -90 -160 L 90 -160 L 58 -270 L -58 -270 Z" fill={DUST} />
        <path d="M -10 -18 L -14 -150 L 14 -150 L 10 -18 Z" fill={DUST} />
        {[[-40, -230], [20, -250], [45, -200], [-20, -190], [0, -60], [-30, -14]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5} fill="#6F675C" />
        ))}
        <path d="M 58 -270 Q 80 -300 70 -330 M 70 -330 L 78 -312" stroke={C.ink} strokeWidth={3} fill="none" />
      </g>
    )}
  </g>
);

/** A string price tag. Origin at the string's top. */
const PriceTagDrawing: React.FC<{x?: number; y?: number; rotate?: number; text: string; color?: string}> = ({x = 0, y = 0, rotate = 0, text, color = C.white}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M 0 0 L 0 34" stroke={C.ink} strokeWidth={4} />
    <path d="M -46 34 L 46 34 L 46 104 L -46 104 Z" fill={color} {...S} strokeWidth={6} />
    <circle cx={0} cy={46} r={6} fill={C.ink} />
    <text x={0} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
      {text}
    </text>
  </g>
);

/** A pair of sneakers, side view. */
const SneakersDrawing: React.FC<{x?: number; y?: number; rotate?: number; color?: string}> = ({x = 0, y = 0, rotate = 0, color = C.red}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {[-30, 30].map((dx, i) => (
      <g key={i} transform={`translate(${dx} ${i * -6})`}>
        <path d="M -70 -6 L -70 -46 Q -60 -66 -30 -62 L 10 -40 Q 50 -38 70 -22 L 72 -6 Z" fill={color} {...S} strokeWidth={6} />
        <rect x={-74} y={-12} width={150} height={14} rx={6} fill={C.white} {...S} strokeWidth={5} />
        <path d="M -30 -54 L -16 -40 M -18 -58 L -4 -44" stroke={C.white} strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** An old radio. */
const RadioDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-80} y={-110} width={160} height={110} rx={18} fill="#C9744A" {...S} />
    <circle cx={-36} cy={-55} r={30} fill="#5B4636" {...S} strokeWidth={5} />
    <rect x={10} y={-86} width={52} height={26} rx={4} fill="#F3E3B6" {...S} strokeWidth={4} />
    <circle cx={24} cy={-34} r={9} fill={C.ink} />
    <circle cx={50} cy={-34} r={9} fill={C.ink} />
    <path d="M -40 -110 L -60 -150" stroke={C.ink} strokeWidth={5} />
  </g>
);

/** A cardboard moving box. */
const BoxDrawing: React.FC<{x?: number; y?: number; rotate?: number; label?: string; w?: number}> = ({x = 0, y = 0, rotate = 0, label = '', w = 180}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-w / 2} y={-140} width={w} height={140} fill="#C99A62" {...S} />
    <path d={`M ${-w / 2} -140 L ${-w / 2 - 24} -176 M ${w / 2} -140 L ${w / 2 + 24} -176`} stroke={C.ink} strokeWidth={8} />
    <line x1={0} x2={0} y1={-140} y2={-100} stroke="#A57A45" strokeWidth={10} />
    {label && (
      <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

/** A cleaning rag (held). Origin at its centre. */
const RagDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -34 -24 Q 0 -40 34 -22 Q 44 0 30 26 Q 0 36 -30 24 Q -42 0 -34 -24 Z" fill="#7FB8E0" {...S} strokeWidth={5} />
    <path d="M -14 -16 Q 0 0 -8 18 M 10 -18 Q 18 2 12 20" stroke="#4E8BB8" strokeWidth={4} fill="none" />
  </g>
);

/** A phone held in hand, screen facing camera. Origin at its centre. */
const PhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; screen?: 'off' | 'camera' | 'listing'}> = ({x = 0, y = 0, rotate = 0, screen = 'off'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={12} fill={C.ink} />
    <rect x={-27} y={-52} width={54} height={100} rx={5} fill={screen === 'off' ? '#4B566E' : '#F6F0E4'} />
    {screen === 'camera' && <circle cx={0} cy={-2} r={16} fill="none" stroke={C.ink} strokeWidth={4} />}
    {screen === 'listing' && (
      <g>
        <rect x={-21} y={-46} width={42} height={42} fill="#F7C873" />
        <rect x={-21} y={4} width={42} height={8} fill={C.ink} />
        <rect x={-21} y={20} width={24} height={10} fill={C.moneyDark} />
      </g>
    )}
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

export const VintageLamp = prop('Lamp', LampDrawing);
export const PriceTag = prop('PriceTag', PriceTagDrawing);
export const Sneakers = prop('Sneakers', SneakersDrawing);
export const Radio = prop('Radio', RadioDrawing);
export const MovingBox = prop('Box', BoxDrawing);
export const Rag = prop('Rag', RagDrawing);
export const HandPhone = prop('Phone', PhoneDrawing);
