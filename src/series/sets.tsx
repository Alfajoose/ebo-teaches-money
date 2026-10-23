import React from 'react';
import {C, FONT} from '../theme';
import {Plant} from '../components/Props';
import {FLOOR_Y} from '../backgrounds/Backgrounds';

/** Show sets for "Ebo Teaches Money" (world space, floor at y = 900). */

const Floor: React.FC<{color: string; line: string}> = ({color, line}) => (
  <g>
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill={color} />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
    {Array.from({length: 18}).map((_, i) => (
      <line key={i} x1={-1000 + i * 260} x2={-1300 + i * 260} y1={FLOOR_Y} y2={FLOOR_Y + 600} stroke={line} strokeWidth={4} />
    ))}
  </g>
);

/** Ebo's money class: plum walls, a chalkboard for the math, a plant. */
export const Studio: React.FC<{t: number; board?: React.ReactNode}> = ({t, board}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#6E5F8E" />
    <rect x={-1000} y={600} width={4000} height={300} fill="#5E5079" />
    <line x1={-1000} x2={3000} y1={600} y2={600} stroke={C.ink} strokeWidth={6} />
    {/* chalkboard */}
    <g>
      <rect x={1060} y={150} width={760} height={560} rx={16} fill="#8B6A48" stroke={C.ink} strokeWidth={10} />
      <rect x={1090} y={180} width={700} height={500} rx={8} fill="#2F4A3C" stroke={C.ink} strokeWidth={6} />
      <rect x={1100} y={690} width={680} height={22} rx={6} fill="#B48D63" stroke={C.ink} strokeWidth={5} />
      {board}
    </g>
    {/* money poster */}
    <g transform="translate(560 330) rotate(-3)">
      <rect x={-110} y={-140} width={220} height={280} fill="#F3E3B6" stroke={C.ink} strokeWidth={8} />
      <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill={C.moneyDark}>
        $
      </text>
      <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
        STACK IT
      </text>
    </g>
    <Floor color="#4A3F63" line="#40365A" />
    <Plant x={250} y={FLOOR_Y} t={t} scale={1.2} />
  </g>
);

/** A gym: pale walls, stripe, dumbbell rack, mats. */
export const Gym: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#C9D3DB" />
    <rect x={-1000} y={420} width={4000} height={70} fill="#E05A4A" />
    <rect x={-1000} y={490} width={4000} height={30} fill="#2E3A4E" />
    {[300, 1500].map((x) => (
      <g key={x} transform={`translate(${x} ${FLOOR_Y})`}>
        <rect x={-180} y={-260} width={360} height={20} fill="#555" stroke={C.ink} strokeWidth={6} />
        <rect x={-180} y={-140} width={360} height={20} fill="#555" stroke={C.ink} strokeWidth={6} />
        <rect x={-180} y={-260} width={20} height={260} fill="#555" stroke={C.ink} strokeWidth={6} />
        <rect x={160} y={-260} width={20} height={260} fill="#555" stroke={C.ink} strokeWidth={6} />
        {[-120, -40, 40, 120].map((dx, i) => (
          <g key={i}>
            <rect x={dx - 30} y={-290} width={60} height={26} rx={10} fill="#2B2B2B" />
            <rect x={dx - 30} y={-170} width={60} height={26} rx={10} fill="#2B2B2B" />
          </g>
        ))}
      </g>
    ))}
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#3D4552" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
    <rect x={500} y={FLOOR_Y + 40} width={700} height={70} rx={10} fill="#4F86C6" stroke={C.ink} strokeWidth={6} />
    <text x={960} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#fff" opacity={0.8} letterSpacing={10}>
      GYM
    </text>
  </g>
);

/** A school hallway: lockers. */
export const School: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#F0E6CF" />
    {Array.from({length: 16}).map((_, i) => (
      <g key={i} transform={`translate(${-300 + i * 170} 260)`}>
        <rect x={0} y={0} width={160} height={640} fill={i % 2 ? '#4C8FBF' : '#5A9DCB'} stroke={C.ink} strokeWidth={6} />
        {[60, 90, 120].map((y) => (
          <line key={y} x1={50} x2={110} y1={y} y2={y} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={120} y={300} width={16} height={50} rx={4} fill={C.ink} />
      </g>
    ))}
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#D9C9A6" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
    <text x={960} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={C.ink} opacity={0.6} letterSpacing={10}>
      SCHOOL
    </text>
  </g>
);
