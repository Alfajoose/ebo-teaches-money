import React from 'react';
import {C, FONT} from '../theme';
import {Can} from './Money';
import {useNoScale} from '../noScale';

/**
 * The vending machine — the show's co-star.
 * Origin at bottom-center. ~300 x 540 at scale 1.
 */
type Props = {
  x?: number;
  y?: number;
  scale?: number;
  t?: number;
  fill?: number; // 0–1 how stocked it is
  display?: string; // LED text
  glow?: number; // 0–1 "magic" glow
  broken?: number; // 0–1 smoke, sparks, tilt, OUT OF ORDER sign
  cobwebs?: number; // 0–1
  dust?: number; // 0–1 grey overlay
  dispense?: number; // 0–1 a can dropping into the tray
  rotate?: number;
  squash?: number;
};

const CAN_COLORS = [C.red, C.blue, C.yellow, '#56B870'];

export const VendingMachine: React.FC<Props> = ({
  x = 0,
  y = 0,
  scale = 1,
  t = 0,
  fill = 1,
  display = '$2.00',
  glow = 0,
  broken = 0,
  cobwebs = 0,
  dust = 0,
  dispense = -1,
  rotate = 0,
  squash = 1,
}) => {
  const noScale = useNoScale();
  const web = noScale ? 1 : cobwebs;
  const W = 300;
  const H = 540;
  const cans = Math.round(fill * 16);
  const flicker = broken > 0.5 ? (Math.sin(t * 2.7) > 0.2 ? 1 : 0.25) : 1;
  const tilt = rotate + broken * 3;

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} 0 0) scale(${scale} ${scale * squash})`}>
      {glow > 0 && (
        <g opacity={glow}>
          <ellipse cx={0} cy={-H / 2} rx={W * 0.95} ry={H * 0.7} fill={C.yellow} opacity={0.25} />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + t * 0.02;
            const r1 = 330;
            const r2 = 420 + Math.sin(t * 0.2 + i) * 20;
            return (
              <line
                key={i}
                x1={Math.cos(a) * r1}
                y1={-H / 2 + Math.sin(a) * r1}
                x2={Math.cos(a) * r2}
                y2={-H / 2 + Math.sin(a) * r2}
                stroke={C.yellow}
                strokeWidth={12}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}
      {/* shadow */}
      <ellipse cx={0} cy={4} rx={W * 0.62} ry={18} fill={C.ink} opacity={0.14} />
      {/* feet */}
      <rect x={-W / 2 + 18} y={-14} width={36} height={16} rx={4} fill={C.ink} />
      <rect x={W / 2 - 54} y={-14} width={36} height={16} rx={4} fill={C.ink} />
      {/* side depth */}
      <path d={`M ${W / 2} ${-H + 10} L ${W / 2 + 26} ${-H + 24} L ${W / 2 + 26} ${-20} L ${W / 2} ${-10} Z`} fill={C.machineDark} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      {/* body */}
      <rect x={-W / 2} y={-H} width={W} height={H - 8} rx={22} fill={C.machine} stroke={C.ink} strokeWidth={10} />
      {/* header */}
      <rect x={-W / 2 + 20} y={-H + 18} width={W - 40} height={56} rx={12} fill={C.white} stroke={C.ink} strokeWidth={7} />
      <text x={0} y={-H + 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.machine} letterSpacing={4}>
        SODA
      </text>
      {/* window */}
      <rect x={-W / 2 + 20} y={-H + 90} width={176} height={312} rx={10} fill={C.glass} stroke={C.ink} strokeWidth={8} />
      {Array.from({length: 4}).map((_, row) => (
        <g key={row}>
          <line x1={-W / 2 + 24} x2={-W / 2 + 192} y1={-H + 90 + 74 * (row + 1)} y2={-H + 90 + 74 * (row + 1)} stroke={C.ink} strokeWidth={5} />
          {Array.from({length: 4}).map((__, col) => {
            const idx = row * 4 + col;
            if (idx >= cans) return null;
            return <Can key={col} x={-W / 2 + 44 + col * 42} y={-H + 90 + 74 * (row + 1) - 4} color={CAN_COLORS[(row + col) % 4]} scale={0.62} />;
          })}
        </g>
      ))}
      {/* glass shine */}
      <path d={`M ${-W / 2 + 40} ${-H + 110} L ${-W / 2 + 70} ${-H + 110} L ${-W / 2 + 30} ${-H + 250} L ${-W / 2 + 30} ${-H + 160} Z`} fill={C.white} opacity={0.5} />
      {broken > 0.3 && (
        <path d={`M ${-W / 2 + 120} ${-H + 100} L ${-W / 2 + 96} ${-H + 170} L ${-W / 2 + 130} ${-H + 200} L ${-W / 2 + 92} ${-H + 290}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinejoin="round" />
      )}
      {/* control panel */}
      <rect x={W / 2 - 92} y={-H + 90} width={72} height={312} rx={10} fill={C.machineDark} stroke={C.ink} strokeWidth={7} />
      <rect x={W / 2 - 84} y={-H + 102} width={56} height={34} rx={5} fill={broken > 0.5 ? '#333' : '#22302A'} stroke={C.ink} strokeWidth={5} />
      <text
        x={W / 2 - 56}
        y={-H + 126}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight={800}
        fontSize={display.length > 5 ? 13 : 16}
        fill={broken > 0.5 ? '#FF6A5C' : '#7CF2A0'}
        opacity={flicker}
      >
        {broken > 0.5 ? 'ERR' : display}
      </text>
      {Array.from({length: 9}).map((_, i) => (
        <circle key={i} cx={W / 2 - 72 + (i % 3) * 16} cy={-H + 162 + Math.floor(i / 3) * 18} r={6} fill={C.white} stroke={C.ink} strokeWidth={3} />
      ))}
      {/* coin slot */}
      <rect x={W / 2 - 66} y={-H + 240} width={20} height={44} rx={4} fill={C.ink} />
      <rect x={W / 2 - 61} y={-H + 248} width={10} height={28} rx={3} fill={C.gold} />
      {/* dispenser tray */}
      <rect x={-W / 2 + 34} y={-118} width={W - 68} height={70} rx={10} fill={C.ink} />
      <rect x={-W / 2 + 44} y={-108} width={W - 88} height={22} rx={6} fill="#4A4040" />
      {dispense >= 0 && dispense <= 1 && (
        <g transform={`translate(${-10} ${-118 + Math.min(1, dispense) * 52}) rotate(${dispense * 90})`}>
          <Can x={0} y={0} color={C.blue} scale={0.7} />
        </g>
      )}
      {/* dust */}
      {dust > 0 && <rect x={-W / 2} y={-H} width={W} height={H - 8} rx={22} fill="#A89F92" opacity={dust * 0.45} />}
      {/* cobwebs */}
      {cobwebs > 0 && (
        <g opacity={Math.min(1, cobwebs * 1.5)} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round">
          <g transform={`translate(${-W / 2 + 6} ${-H + 6}) scale(${web})`}>
            <Web />
          </g>
          <g transform={`translate(${W / 2 - 6} ${-H + 6}) scale(${-web} ${web})`}>
            <Web />
          </g>
          <g transform={`translate(${-W / 2 + 6} ${-14}) scale(${web * 0.8} ${-web * 0.8})`}>
            <Web />
          </g>
        </g>
      )}
      {/* broken FX */}
      {broken > 0 && (
        <g>
          <g transform={`translate(${-60} ${-H + 250}) rotate(-8)`} opacity={Math.min(1, broken * 2)}>
            <rect x={-80} y={-30} width={160} height={60} fill={C.white} stroke={C.ink} strokeWidth={5} />
            <rect x={-40} y={-38} width={80} height={14} fill="#E9D9A8" opacity={0.9} />
            <text x={0} y={-4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.red}>
              OUT OF
            </text>
            <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.red}>
              ORDER
            </text>
          </g>
          {Array.from({length: 5}).map((_, i) => {
            const life = ((t * 1.2 + i * 22) % 110) / 110;
            return (
              <circle
                key={i}
                cx={60 + Math.sin(life * 6 + i) * 30 + life * 40}
                cy={-H - life * 260}
                r={noScale ? 55 : 30 + life * 50}
                fill="#8E8A84"
                opacity={broken * (1 - life) * 0.7}
              />
            );
          })}
          {Math.sin(t * 1.7) > 0.4 && (
            <path
              d={`M ${W / 2 - 40} ${-H + 200} l 30 -16 l -10 22 l 34 -14`}
              stroke={C.yellow}
              strokeWidth={7}
              fill="none"
              strokeLinejoin="round"
              opacity={broken}
            />
          )}
        </g>
      )}
    </g>
  );
};

const Web: React.FC = () => (
  <g>
    <path d="M 0 0 L 110 0 M 0 0 L 0 110 M 0 0 L 90 60 M 0 0 L 60 90" />
    <path d="M 30 0 Q 26 16 25 18 Q 18 22 0 30" />
    <path d="M 60 0 Q 54 28 50 34 Q 36 50 0 60" />
    <path d="M 95 0 Q 84 44 76 52 Q 54 78 0 95" />
  </g>
);
