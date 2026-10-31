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

// ───────────────────────── Episode 2 (flipping) ─────────────────────────

const Lawn: React.FC = () => (
  <g>
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#7DBE6A" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
    {Array.from({length: 30}).map((_, i) => (
      <path key={i} d={`M ${-900 + i * 140} ${FLOOR_Y + 60 + (i % 3) * 70} l 10 -24 l 10 24`} stroke="#5E9F4E" strokeWidth={5} fill="none" />
    ))}
  </g>
);

const HouseFront: React.FC<{color?: string}> = ({color = '#E9D7B0'}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#A9D6EE" />
    <rect x={-400} y={120} width={2800} height={780} fill={color} stroke={C.ink} strokeWidth={10} />
    {Array.from({length: 12}).map((_, i) => (
      <line key={i} x1={-400} x2={2400} y1={180 + i * 60} y2={180 + i * 60} stroke="#CDB98F" strokeWidth={4} />
    ))}
    <path d="M -480 140 L 1000 -260 L 2480 140 Z" fill="#8C4A3A" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    {[0, 1700].map((x) => (
      <g key={x}>
        <rect x={x} y={300} width={300} height={260} rx={6} fill="#CFE7F3" stroke={C.ink} strokeWidth={8} />
        <line x1={x + 150} x2={x + 150} y1={300} y2={560} stroke={C.ink} strokeWidth={6} />
      </g>
    ))}
    <rect x={820} y={420} width={220} height={480} rx={6} fill="#5E7FA6" stroke={C.ink} strokeWidth={8} />
    <circle cx={1005} cy={680} r={10} fill={C.gold} stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Folding table — set furniture: the items for sale on it are props. */
export const SaleTable: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
  <g transform={`translate(${x} ${FLOOR_Y})`}>
    <path d={`M ${-w / 2 + 30} 0 L ${w / 2 - 80} -200 M ${w / 2 - 30} 0 L ${-w / 2 + 80} -200`} stroke="#8A8F98" strokeWidth={12} />
    <rect x={-w / 2} y={-226} width={w} height={30} rx={6} fill="#F3EEE4" stroke={C.ink} strokeWidth={8} />
  </g>
);

/** Front lawn yard sale. */
export const YardSale: React.FC = () => (
  <g>
    <HouseFront />
    <Lawn />
    <g transform="translate(1650 520) rotate(4)">
      <rect x={-20} y={0} width={16} height={380} fill="#8B6A48" stroke={C.ink} strokeWidth={5} />
      <rect x={-190} y={-150} width={340} height={160} rx={8} fill="#FFF3C4" stroke={C.ink} strokeWidth={8} />
      <text x={-20} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red}>
        YARD
      </text>
      <text x={-20} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red}>
        SALE!
      </text>
    </g>
  </g>
);

/** Thrift store aisle: racks and shelves. */
export const ThriftStore: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#E6C9A8" />
    <text x={960} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#B5543C" letterSpacing={12}>
      THRIFT
    </text>
    {[150, 1500].map((x) => (
      <g key={x}>
        <rect x={x} y={260} width={420} height={640} fill="#B98E62" stroke={C.ink} strokeWidth={8} />
        {[420, 580, 740].map((y) => (
          <rect key={y} x={x} y={y} width={420} height={18} fill="#8B6A48" stroke={C.ink} strokeWidth={5} />
        ))}
      </g>
    ))}
    <line x1={650} x2={1400} y1={360} y2={360} stroke="#6F6A66" strokeWidth={12} />
    {Array.from({length: 7}).map((_, i) => (
      <path key={i} d={`M ${700 + i * 100} 360 L ${670 + i * 100} 420 L ${660 + i * 100} 620 L ${750 + i * 100} 620 L ${740 + i * 100} 420 Z`} fill={['#E05A4A', '#4D8FD6', '#F3C53F', '#56B870', '#8F6BD1', '#F4A3B4', '#45B69C'][i]} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    ))}
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#C7B39A" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
  </g>
);

/** Moving day: a house with a FREE sign on the curb. */
export const MovingDay: React.FC = () => (
  <g>
    <HouseFront color="#D9E4C8" />
    <Lawn />
    <g transform="translate(300 640) rotate(-5)">
      <rect x={-8} y={0} width={14} height={260} fill="#8B6A48" stroke={C.ink} strokeWidth={5} />
      <rect x={-130} y={-110} width={260} height={120} rx={8} fill={C.white} stroke={C.ink} strokeWidth={8} />
      <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.moneyDark}>
        FREE
      </text>
    </g>
  </g>
);

// ───────────────────────── Episode 3 (How to Stay Poor) ─────────────────────────

const Couch: React.FC<{x: number; color?: string}> = ({x, color = '#C96F5A'}) => (
  <g transform={`translate(${x} ${FLOOR_Y})`}>
    <rect x={-330} y={-300} width={660} height={190} rx={40} fill={color} stroke={C.ink} strokeWidth={8} />
    <rect x={-360} y={-170} width={720} height={130} rx={30} fill={color} stroke={C.ink} strokeWidth={8} />
    <rect x={-400} y={-230} width={90} height={200} rx={36} fill={color} stroke={C.ink} strokeWidth={8} />
    <rect x={310} y={-230} width={90} height={200} rx={36} fill={color} stroke={C.ink} strokeWidth={8} />
    <line x1={0} x2={0} y1={-170} y2={-40} stroke={C.ink} strokeWidth={5} opacity={0.5} />
    {[-300, 300].map((dx) => (
      <rect key={dx} x={dx - 14} y={-40} width={28} height={40} fill="#6B4A36" stroke={C.ink} strokeWidth={6} />
    ))}
  </g>
);

/** The TV on its stand, facing the couch (static screen glow is part of the set). */
const TVSet: React.FC<{x: number; on?: boolean}> = ({x, on = true}) => (
  <g transform={`translate(${x} ${FLOOR_Y})`}>
    <rect x={-170} y={-150} width={340} height={150} fill="#8B6A48" stroke={C.ink} strokeWidth={8} />
    <line x1={0} x2={0} y1={-150} y2={0} stroke={C.ink} strokeWidth={5} />
    <rect x={-260} y={-470} width={520} height={300} rx={18} fill="#22222A" stroke={C.ink} strokeWidth={10} />
    <rect x={-236} y={-448} width={472} height={256} rx={8} fill={on ? '#7FB8E0' : '#3A3F4E'} />
    {on && (
      <g>
        <circle cx={-90} cy={-330} r={50} fill="#F3C53F" />
        <path d="M -236 -230 Q -100 -300 40 -240 Q 160 -190 236 -250 L 236 -192 L -236 -192 Z" fill="#56B870" />
      </g>
    )}
    <rect x={-40} y={-170} width={80} height={20} fill="#22222A" stroke={C.ink} strokeWidth={6} />
  </g>
);

/** Living room: couch, TV, rug, window. `wall` changes the paint for different homes. */
export const LivingRoom: React.FC<{wall?: string; tv?: boolean}> = ({wall = '#E9D3B4', tv = true}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill={wall} />
    <rect x={-1000} y={700} width={4000} height={26} fill="#000" opacity={0.08} />
    <g>
      <rect x={1180} y={180} width={360} height={300} rx={8} fill="#A9D6EE" stroke={C.ink} strokeWidth={8} />
      <line x1={1360} x2={1360} y1={180} y2={480} stroke={C.ink} strokeWidth={6} />
      <line x1={1180} x2={1540} y1={330} y2={330} stroke={C.ink} strokeWidth={6} />
    </g>
    <g transform="translate(300 300) rotate(-3)">
      <rect x={-80} y={-60} width={160} height={120} fill="#F3E3B6" stroke={C.ink} strokeWidth={7} />
      <path d="M -60 40 L -20 -10 L 10 20 L 30 0 L 60 40 Z" fill="#7DBE6A" stroke={C.ink} strokeWidth={4} />
    </g>
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#B98E62" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
    <ellipse cx={760} cy={FLOOR_Y + 70} rx={520} ry={60} fill="#D9805A" stroke={C.ink} strokeWidth={6} />
    {tv && <TVSet x={60} />}
    <Couch x={760} />
    <Plant x={1700} y={FLOOR_Y} t={0} scale={1.2} />
  </g>
);

/** Obuor's sneaker room: shelves of sneakers (set dressing) and a release calendar. */
export const SneakerRoom: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#2F3A56" />
    {[0, 1, 2, 3].map((row) => (
      <g key={row}>
        <rect x={80} y={180 + row * 170} width={1000} height={20} fill="#B98E62" stroke={C.ink} strokeWidth={6} />
        {Array.from({length: 6}).map((_, i) => (
          <g key={i} transform={`translate(${170 + i * 160} ${180 + row * 170})`}>
            <path d="M -60 0 L -60 -42 Q -50 -62 -24 -58 L 10 -38 Q 46 -36 64 -20 L 66 0 Z" fill={[C.red, C.blue, C.yellow, '#56B870', C.purple, C.white][(i + row * 2) % 6]} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <rect x={-64} y={-8} width={134} height={10} rx={4} fill={C.white} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    ))}
    <g transform="translate(1500 330)">
      <rect x={-160} y={-170} width={320} height={340} rx={10} fill={C.white} stroke={C.ink} strokeWidth={8} />
      <rect x={-160} y={-170} width={320} height={70} rx={10} fill={C.red} stroke={C.ink} strokeWidth={8} />
      <text x={0} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.white}>
        DROPS
      </text>
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x={-136 + (i % 4) * 70} y={-80 + Math.floor(i / 4) * 80} width={50} height={56} fill={[2, 5, 9].includes(i) ? C.yellow : '#EFE6D6'} stroke={C.ink} strokeWidth={4} />
      ))}
    </g>
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill="#3A3F4E" />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
  </g>
);

/** A plain table for props to sit on (set furniture). */
export const Table: React.FC<{x: number; w?: number; color?: string}> = ({x, w = 420, color = '#8B6A48'}) => (
  <g transform={`translate(${x} ${FLOOR_Y})`}>
    <rect x={-w / 2} y={-250} width={w} height={34} rx={8} fill={color} stroke={C.ink} strokeWidth={8} />
    <rect x={-w / 2 + 30} y={-220} width={26} height={220} fill={color} stroke={C.ink} strokeWidth={7} />
    <rect x={w / 2 - 56} y={-220} width={26} height={220} fill={color} stroke={C.ink} strokeWidth={7} />
  </g>
);

// ───────────────────────── Episode 4 (Staying Broke) ─────────────────────────

const PlainFloor: React.FC<{color: string}> = ({color}) => (
  <g>
    <rect x={-1000} y={FLOOR_Y} width={4000} height={1400} fill={color} />
    <line x1={-1000} x2={3000} y1={FLOOR_Y} y2={FLOOR_Y} stroke={C.ink} strokeWidth={8} />
  </g>
);

/** Ebo's kitchen: a breakfast table and a small TV on the counter (furniture is set). */
export const Kitchen: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#F2E3B8" />
    {Array.from({length: 26}).map((_, i) => (
      <line key={i} x1={-1000 + i * 160} x2={-1000 + i * 160} y1={420} y2={600} stroke="#E3CF96" strokeWidth={4} />
    ))}
    <rect x={-1000} y={600} width={4000} height={300} fill="#D9B97A" stroke={C.ink} strokeWidth={6} />
    <rect x={1250} y={520} width={420} height={80} fill="#8B6A48" stroke={C.ink} strokeWidth={7} />
    <rect x={1300} y={300} width={300} height={220} rx={14} fill="#22222A" stroke={C.ink} strokeWidth={8} />
    <rect x={1318} y={318} width={264} height={184} rx={6} fill="#7FB8E0" />
    <path d="M 1318 460 Q 1400 410 1480 450 Q 1540 470 1582 440 L 1582 502 L 1318 502 Z" fill="#56B870" />
    <rect x={200} y={150} width={300} height={260} rx={8} fill="#A9D6EE" stroke={C.ink} strokeWidth={8} />
    <line x1={350} x2={350} y1={150} y2={410} stroke={C.ink} strokeWidth={6} />
    <PlainFloor color="#C8B79A" />
    <g transform={`translate(760 ${FLOOR_Y})`}>
      <rect x={-260} y={-250} width={520} height={34} rx={8} fill="#B98458" stroke={C.ink} strokeWidth={8} />
      <rect x={-230} y={-220} width={26} height={220} fill="#B98458" stroke={C.ink} strokeWidth={7} />
      <rect x={204} y={-220} width={26} height={220} fill="#B98458" stroke={C.ink} strokeWidth={7} />
    </g>
  </g>
);

/** A work desk by a wall (the sticky-note wall and the laptop are props). */
export const WorkRoom: React.FC<{night?: boolean}> = ({night = false}) => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill={night ? '#3A3550' : '#DCE6EE'} />
    <rect x={1400} y={160} width={320} height={280} rx={8} fill={night ? '#1E2240' : '#A9D6EE'} stroke={C.ink} strokeWidth={8} />
    {night && <circle cx={1640} cy={230} r={28} fill="#F3E6CF" />}
    <PlainFloor color={night ? '#2C2840' : '#B9C3CC'} />
    <g transform={`translate(900 ${FLOOR_Y})`}>
      <rect x={-300} y={-260} width={600} height={34} rx={8} fill="#8B6A48" stroke={C.ink} strokeWidth={8} />
      <rect x={-270} y={-230} width={26} height={230} fill="#8B6A48" stroke={C.ink} strokeWidth={7} />
      <rect x={244} y={-230} width={26} height={230} fill="#8B6A48" stroke={C.ink} strokeWidth={7} />
    </g>
  </g>
);

/** Inside the front door (for the millionaire who never knocks). */
export const FrontDoor: React.FC = () => (
  <g>
    <rect x={-1000} y={-900} width={4000} height={1800} fill="#E9D3B4" />
    <rect x={1100} y={240} width={300} height={660} rx={8} fill="#8B5A3C" stroke={C.ink} strokeWidth={10} />
    {[[1140, 290], [1270, 290], [1140, 560], [1270, 560]].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={90} height={220} rx={6} fill="#7A4A2E" stroke={C.ink} strokeWidth={5} />
    ))}
    <circle cx={1360} cy={600} r={16} fill={C.gold} stroke={C.ink} strokeWidth={5} />
    <rect x={1210} y={420} width={80} height={14} rx={5} fill={C.gold} stroke={C.ink} strokeWidth={4} />
    <PlainFloor color="#B98E62" />
    <rect x={1060} y={FLOOR_Y + 10} width={380} height={40} rx={8} fill="#C96F5A" stroke={C.ink} strokeWidth={6} />
  </g>
);
