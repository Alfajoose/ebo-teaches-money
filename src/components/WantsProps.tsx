import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 7 (Wants vs. Needs). Each is a prop (see prop.tsx): hand-drawn in the video,
 * its own vector symbol in the Animate export. Animated parts only move or turn (no scale).
 */

const S = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const GOLD = '#F2C230';
const GOLD_DK = '#B88A10';
const MARKER = 'EboMarker';

/** One gold chain as a row of links along a U-shaped curve, from (-w, 0) down to (0, d) and up to (w, 0). */
const chainPath = (w: number, d: number, n: number) =>
  Array.from({length: n}, (_, i) => {
    const u = i / (n - 1);
    const x = -w + 2 * w * u;
    const y = d * (1 - (2 * u - 1) ** 2);
    const a = (Math.atan2(2 * d * (2 - 4 * u) / (2 * w), 1) * 180) / Math.PI; // the curve's slope, so the links follow it
    return {x, y, a};
  });

const Links: React.FC<{w: number; d: number; n: number; big?: boolean}> = ({w, d, n, big}) => (
  <g>
    {chainPath(w, d, n).map((p, i) => (
      <ellipse key={i} cx={p.x} cy={p.y} rx={big ? 8 : 6.5} ry={big ? 5 : 4.2} transform={`rotate(${i % 2 ? p.a + 90 : p.a} ${p.x} ${p.y})`}
        fill={i % 2 ? GOLD_DK : GOLD} stroke={C.ink} strokeWidth={2} />
    ))}
  </g>
);

/** Gold chains worn round the neck: `count` of them (1–3), each hanging a little lower. Drawn in
 * the torso's space: origin at the neck, y down the chest. The lowest one carries a "$" pendant. */
const ChainsWornDrawing: React.FC<{x?: number; y?: number; count?: number}> = ({x = 100, y = 36, count = 3}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: count}, (_, k) => count - 1 - k).map((k) => (
      <Links key={k} w={46 + k * 10} d={22 + k * 20} n={13 + k * 3} big={k === 2} />
    ))}
    {count >= 1 && (
      <g transform={`translate(0 ${22 + (count - 1) * 20 + 8})`}>
        <circle r={14} fill={GOLD} {...S} strokeWidth={3} />
        <text y={7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={GOLD_DK}>
          $
        </text>
      </g>
    )}
  </g>
);

/** Gold chains held up in the hand, hanging from the fist (origin at the grip). */
const ChainsHeldDrawing: React.FC<{x?: number; y?: number; rotate?: number; count?: number}> = ({x = 0, y = 0, rotate = 0, count = 2}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {Array.from({length: count}, (_, k) => (
      <g key={k} transform={`translate(${(k - (count - 1) / 2) * 14} 0)`}>
        <Links w={18 + k * 5} d={95 + k * 18} n={13 + k * 2} big />
      </g>
    ))}
  </g>
);

/** His "NEEDS" list on lined paper (origin at its centre). `ticked` items get a check; `crossed` a red line. */
const NeedsListDrawing: React.FC<{x?: number; y?: number; rotate?: number; items?: string[]; ticked?: number; crossed?: number[]}> = ({
  x = 0,
  y = 0,
  rotate = 0,
  items = ['Rent', 'Food', 'Bus fare', 'Gold chains'],
  ticked = 0,
  crossed = [],
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-90} y={-120} width={180} height={240} fill={C.white} {...S} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={-80} x2={80} y1={-52 + i * 40} y2={-52 + i * 40} stroke="#BFD5EA" strokeWidth={3} />
    ))}
    <text x={0} y={-76} textAnchor="middle" fontFamily={MARKER} fontSize={36} fill={C.ink}>
      NEEDS
    </text>
    {items.map((it, i) => (
      <g key={it} transform={`translate(-62 ${-26 + i * 40})`}>
        <text x={18} y={0} fontFamily={MARKER} fontSize={it.length > 9 ? 22 : 26} fill={C.ink}>
          {it}
        </text>
        {i < ticked && <path d="M -8 -10 L 0 0 L 14 -22" fill="none" stroke="#2E9E6A" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
        {crossed.includes(i) && <line x1={12} x2={128} y1={-9} y2={-12} stroke="#E5484D" strokeWidth={6} strokeLinecap="round" />}
      </g>
    ))}
  </g>
);

/** His phone, screen towards us: the bank app (balance in red) or four streaming apps. Origin at its centre. */
const AppPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; screen?: 'bank' | 'apps'; watched?: boolean}> = ({x = 0, y = 0, rotate = 0, screen = 'bank', watched = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-70} y={-130} width={140} height={260} rx={22} fill={C.ink} />
    <rect x={-60} y={-112} width={120} height={224} rx={10} fill="#F6F0E4" />
    {screen === 'bank' && (
      <g>
        <rect x={-60} y={-112} width={120} height={40} rx={10} fill="#2F6FB0" />
        <text x={0} y={-84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill="#fff">
          MY BANK
        </text>
        <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={15} fill="#55505A">
          Balance
        </text>
        <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#E5484D">
          $14.20
        </text>
        <rect x={-50} y={26} width={100} height={30} rx={8} fill="#FBE3E3" />
        <text x={0} y={47} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={14} fill="#E5484D">
          RENT DUE
        </text>
        {[0, 1].map((i) => (
          <rect key={i} x={-50} y={68 + i * 18} width={100 - i * 30} height={8} fill="#B5A88C" />
        ))}
      </g>
    )}
    {screen === 'apps' &&
      ['#E5484D', '#2F6FB0', '#45B69C', '#8F6BD1'].map((c, i) => (
        <g key={c} transform={`translate(${i % 2 ? 28 : -28} ${-48 + Math.floor(i / 2) * 76})`}>
          <rect x={-24} y={-24} width={48} height={48} rx={12} fill={c} opacity={watched && i > 0 ? 0.35 : 1} />
          <path d="M -7 -11 L 11 0 L -7 11 Z" fill="#fff" opacity={watched && i > 0 ? 0.5 : 1} />
        </g>
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

export const ChainsWorn = prop('ChainsWorn', ChainsWornDrawing);
export const ChainsHeld = prop('ChainsHeld', ChainsHeldDrawing);
export const NeedsList = prop('NeedsList', NeedsListDrawing);
export const AppPhone = prop('AppPhone', AppPhoneDrawing);
