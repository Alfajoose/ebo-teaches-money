import React from 'react';
import {Rough} from '../handDrawn';
import {random} from 'remotion';
import {C, FONT} from '../theme';
import {useNoScale} from '../noScale';

const DollarBillDrawing: React.FC<{x?: number; y?: number; rotate?: number; scale?: number; flip?: number}> = ({
  x = 0,
  y = 0,
  rotate = 0,
  scale = 1,
  flip = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale * flip} ${scale})`}>
    <rect x={-60} y={-30} width={120} height={60} rx={6} fill={C.money} stroke={C.ink} strokeWidth={5} />
    <rect x={-50} y={-21} width={100} height={42} rx={4} fill="none" stroke={C.moneyDark} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={18} ry={16} fill={C.white} stroke={C.moneyDark} strokeWidth={3} />
    <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.moneyDark}>
      $
    </text>
  </g>
);

const CoinDrawing: React.FC<{x?: number; y?: number; r?: number; spin?: number}> = ({x = 0, y = 0, r = 26, spin = 0}) => {
  const noScale = useNoScale();
  const sx = Math.max(0.12, Math.abs(Math.cos(spin)));
  return (
    <g transform={noScale ? `translate(${x} ${y}) rotate(${(spin * 57) % 360})` : `translate(${x} ${y}) scale(${sx} 1)`}>
      <circle r={r} fill={C.gold} stroke={C.ink} strokeWidth={5} />
      <circle r={r * 0.68} fill="none" stroke={C.goldDark} strokeWidth={3} />
      <text y={r * 0.34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.95} fill={C.goldDark}>
        $
      </text>
    </g>
  );
};

const CanDrawing: React.FC<{x?: number; y?: number; color?: string; scale?: number; rotate?: number; label?: boolean}> = ({
  x = 0,
  y = 0,
  color = C.red,
  scale = 1,
  rotate = 0,
}) => (
  // origin at bottom-center
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-24} y={-82} width={48} height={82} rx={10} fill={color} stroke={C.ink} strokeWidth={6} />
    <rect x={-24} y={-58} width={48} height={22} fill={C.white} opacity={0.85} />
    <rect x={-16} y={-90} width={32} height={10} rx={3} fill="#C9C4BC" stroke={C.ink} strokeWidth={4} />
    <rect x={-16} y={-74} width={7} height={60} rx={3} fill={C.white} opacity={0.4} />
  </g>
);

/** Deterministic falling bills. */
export const MoneyRain: React.FC<{t: number; count?: number; width?: number; top?: number; height?: number; seed?: string; x?: number; coins?: boolean; speed?: number}> = ({
  t,
  count = 26,
  width = 1920,
  top = -100,
  height = 1250,
  seed = 'rain',
  x = 0,
  coins = false,
  speed = 1,
}) => {
  const noScale = useNoScale();
  if (t < 0) return null;
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const r1 = random(`${seed}-x-${i}`);
        const r2 = random(`${seed}-d-${i}`);
        const r3 = random(`${seed}-s-${i}`);
        const delay = r2 * 40;
        const lt = t - delay;
        if (lt < 0) return null;
        const v = (6 + r3 * 5) * speed;
        const yy = top + ((lt * v) % height);
        const xx = x + r1 * width + Math.sin(lt * 0.08 + i) * 40;
        if (coins && i % 3 === 0) return <Coin key={i} x={xx} y={yy} r={22} spin={lt * 0.25 + i} />;
        return <DollarBill key={i} x={xx} y={yy} rotate={Math.sin(lt * 0.07 + i) * 35} scale={0.75 + r3 * 0.4} flip={noScale || Math.cos(lt * 0.1 + i) > 0 ? 1 : -1} />;
      })}
    </g>
  );
};

/** Coins popping out from a point with gravity. */
export const CoinBurst: React.FC<{t: number; x: number; y: number; count?: number; seed?: string; power?: number}> = ({
  t,
  x,
  y,
  count = 8,
  seed = 'burst',
  power = 1,
}) => {
  if (t < 0 || t > 60) return null;
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const a = -Math.PI / 2 + (random(`${seed}a${i}`) - 0.5) * 2.2;
        const v = (14 + random(`${seed}v${i}`) * 10) * power;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.9 * t * t;
        return <Coin key={i} x={px} y={py} r={20} spin={t * 0.4 + i} />;
      })}
    </g>
  );
};

/** DollarBill, drawn in the hand-drawn style when it's switched on (see handDrawn.tsx). */
export const DollarBill: typeof DollarBillDrawing = (props) => (
  <Rough>
    <DollarBillDrawing {...props} />
  </Rough>
);

/** Coin, drawn in the hand-drawn style when it's switched on (see handDrawn.tsx). */
export const Coin: typeof CoinDrawing = (props) => (
  <Rough>
    <CoinDrawing {...props} />
  </Rough>
);

/** Can, drawn in the hand-drawn style when it's switched on (see handDrawn.tsx). */
export const Can: typeof CanDrawing = (props) => (
  <Rough>
    <CanDrawing {...props} />
  </Rough>
);
