import React from 'react';
import {C, FONT} from '../theme';
import {useNoScale} from '../noScale';
import {Bed, Lamp, Nightstand, Pillow, Window, Plant, Desk, WaterCooler} from '../components/Props';

/**
 * The five primary visual setups:
 *   1. Bedroom   2. Dream   3. Garage   4. Hallway   5. Office
 * Each is drawn in a 1920x1080 world (camera can move over a wider area).
 */

const Floor: React.FC<{y: number; color?: string; line?: string; from?: number; to?: number}> = ({y, color = C.floor, line = C.floorLine, from = -800, to = 2720}) => (
  <g>
    <rect x={from} y={y} width={to - from} height={900} fill={color} />
    <line x1={from} x2={to} y1={y} y2={y} stroke={C.ink} strokeWidth={8} />
    {[60, 150].map((d) => (
      <line key={d} x1={from} x2={to} y1={y + d} y2={y + d} stroke={line} strokeWidth={4} />
    ))}
  </g>
);

export const FLOOR_Y = 900;

export const Bedroom: React.FC<{lamp?: number}> = ({lamp = 0}) => (
  <g>
    <rect x={-800} y={-600} width={3520} height={1600} fill="#EFE6D6" />
    <rect x={-800} y={720} width={3520} height={30} fill="#E2D5BE" />
    <Window x={1340} y={380} />
    {/* poster: a hopeful dollar */}
    <g transform="translate(560 330) rotate(-4)">
      <rect x={-90} y={-120} width={180} height={240} fill="#F7DFB8" stroke={C.ink} strokeWidth={7} />
      <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
        GET
      </text>
      <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
        RICH
      </text>
      <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={C.moneyDark}>
        $
      </text>
    </g>
    <Floor y={FLOOR_Y} color="#D9C3A6" line="#C4AC8B" />
    <Bed x={960} y={FLOOR_Y} />
    <Pillow x={720} y={FLOOR_Y - 150} />
    <Nightstand x={1440} y={FLOOR_Y} />
    <Lamp x={1490} y={FLOOR_Y - 150} on={lamp} />
  </g>
);

export const Dream: React.FC<{t: number}> = ({t}) => {
  const noScale = useNoScale();
  return (
  <g>
    <defs>
      <radialGradient id="dreamGrad" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stopColor="#FFF4D6" />
        <stop offset="70%" stopColor="#F8D9E0" />
        <stop offset="100%" stopColor="#D9C7EE" />
      </radialGradient>
    </defs>
    <rect x={-800} y={-600} width={3520} height={2200} fill="url(#dreamGrad)" />
    {Array.from({length: 14}).map((_, i) => {
      const x = (i * 337) % 1920;
      const y = 80 + ((i * 211) % 700);
      const s = 0.6 + 0.5 * Math.abs(Math.sin(t * 0.08 + i));
      return (
        <path
          key={i}
          transform={noScale ? `translate(${x} ${y}) rotate(${t * 3 + i * 40})` : `translate(${x} ${y}) scale(${s})`}
          d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z"
          fill={C.white}
          stroke={C.ink}
          strokeWidth={4}
        />
      );
    })}
    {/* floating clouds */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${((i * 700 + t * 1.5) % 2400) - 240} ${200 + i * 260})`} opacity={0.9}>
        <path d="M -120 20 Q -130 -40 -60 -40 Q -40 -90 20 -70 Q 80 -100 110 -40 Q 160 -30 140 20 Z" fill={C.white} stroke={C.ink} strokeWidth={6} />
      </g>
    ))}
    <ellipse cx={960} cy={FLOOR_Y + 20} rx={600} ry={60} fill={C.white} stroke={C.ink} strokeWidth={8} />
  </g>
  );
};

export const Garage: React.FC = () => (
  <g>
    <rect x={-800} y={-600} width={3520} height={1600} fill={C.paper} />
    {/* roll-up door */}
    <g transform="translate(-760 0)">
      <rect x={0} y={170} width={520} height={730} fill="#DCD3C3" stroke={C.ink} strokeWidth={8} />
      {Array.from({length: 9}).map((_, i) => (
        <line key={i} x1={0} x2={520} y1={170 + i * 80} y2={170 + i * 80} stroke="#B9AE9B" strokeWidth={5} />
      ))}
    </g>
    {/* pegboard + tools */}
    <g transform="translate(-1000 0)">
      <rect x={1200} y={230} width={360} height={240} rx={8} fill="#E5CFA8" stroke={C.ink} strokeWidth={7} />
      {Array.from({length: 24}).map((_, i) => (
        <circle key={i} cx={1230 + (i % 8) * 43} cy={260 + Math.floor(i / 8) * 80} r={4} fill="#B5986D" />
      ))}
      {/* hammer */}
      <g transform="translate(1290 360) rotate(-20)">
        <rect x={-8} y={-10} width={16} height={100} rx={6} fill="#B98458" stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={-40} width={80} height={34} rx={6} fill="#7D8794" stroke={C.ink} strokeWidth={6} />
      </g>
      {/* wrench */}
      <g transform="translate(1400 350) rotate(15)">
        <rect x={-9} y={-50} width={18} height={110} rx={8} fill="#9AA3AE" stroke={C.ink} strokeWidth={6} />
        <path d="M -26 -70 A 28 28 0 1 0 26 -70 L 10 -70 L 10 -50 L -10 -50 L -10 -70 Z" fill="#9AA3AE" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* tape roll */}
      <circle cx={1495} cy={350} r={36} fill="#E7C15A" stroke={C.ink} strokeWidth={6} />
      <circle cx={1495} cy={350} r={14} fill="#E5CFA8" stroke={C.ink} strokeWidth={5} />
    </g>
    {/* hanging bulb */}
    <line x1={980} y1={-600} x2={980} y2={110} stroke={C.ink} strokeWidth={4} />
    <circle cx={980} cy={130} r={22} fill="#FFE9A3" stroke={C.ink} strokeWidth={6} />
    <Floor y={FLOOR_Y} color="#D8D0C2" line="#C2B8A6" />
  </g>
);

export const Hallway: React.FC<{t: number; dim?: number; flicker?: boolean}> = ({t, dim = 0, flicker = false}) => {
  const light = flicker && Math.sin(t * 1.3) * Math.sin(t * 0.37) > 0.55 ? 0.35 : 1;
  return (
    <g>
      <rect x={-800} y={-600} width={3520} height={1600} fill="#EDE6D8" />
      {/* wainscot */}
      <rect x={-800} y={640} width={3520} height={260} fill="#E1D6C2" />
      <line x1={-800} x2={2720} y1={640} y2={640} stroke={C.ink} strokeWidth={6} />
      {/* doors */}
      {[-300, 300, 1620, 2220].map((x) => (
        <g key={x}>
          <rect x={x} y={300} width={220} height={600} rx={6} fill="#C7B79C" stroke={C.ink} strokeWidth={8} />
          <rect x={x + 30} y={340} width={160} height={200} rx={4} fill="none" stroke="#A8977A" strokeWidth={5} />
          <circle cx={x + 190} cy={620} r={11} fill={C.ink} />
        </g>
      ))}
      {/* ceiling lights */}
      {[300, 960, 1620].map((x, i) => (
        <g key={x} opacity={i === 1 ? light : 1}>
          <rect x={x - 90} y={60} width={180} height={22} rx={8} fill="#FFF6D8" stroke={C.ink} strokeWidth={6} />
          <path d={`M ${x - 90} 82 L ${x - 220} 900 L ${x + 220} 900 L ${x + 90} 82 Z`} fill="#FFF4C8" opacity={0.18} />
        </g>
      ))}
      <rect x={-800} y={0} width={3520} height={60} fill="#E2D9C8" />
      <line x1={-800} x2={2720} y1={60} y2={60} stroke={C.ink} strokeWidth={6} />
      <Floor y={FLOOR_Y} color="#CFC6B6" line="#BBB09C" />
      {dim > 0 && <rect x={-800} y={-600} width={3520} height={2200} fill="#3A3447" opacity={dim} />}
    </g>
  );
};

export const Office: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-800} y={-600} width={3520} height={1600} fill="#F3EEE4" />
    {/* big windows with skyline */}
    {[-200, 360, 1360, 1920].map((x, i) => (
      <g key={x}>
        <rect x={x} y={140} width={460} height={400} rx={8} fill="#CFE7F3" stroke={C.ink} strokeWidth={8} />
        {Array.from({length: 5}).map((_, j) => {
          const h = 90 + ((i * 7 + j * 13) % 5) * 45;
          return <rect key={j} x={x + 20 + j * 88} y={540 - h} width={70} height={h} fill="#A9C6D8" />;
        })}
        <line x1={x + 230} x2={x + 230} y1={140} y2={540} stroke={C.ink} strokeWidth={6} />
      </g>
    ))}
    <text x={1080} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#B4AA98" letterSpacing={8}>
      SYNERGY CORP · FLOOR 12
    </text>
    <Floor y={FLOOR_Y} color="#D6DCD9" line="#BCC4C0" />
    <Desk x={-60} y={FLOOR_Y} />
    <Desk x={1560} y={FLOOR_Y} />
    <Desk x={2050} y={FLOOR_Y} />
    <WaterCooler x={460} y={FLOOR_Y} />
    <Plant x={1240} y={FLOOR_Y} t={t} />
  </g>
);
