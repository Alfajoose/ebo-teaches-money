import React from 'react';
import {Rough} from '../handDrawn';
import {random} from 'remotion';
import {C, FONT} from '../theme';
import {useNoScale} from '../noScale';

const S = {stroke: C.ink, strokeWidth: 8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// ───────────────────────── Bedroom ─────────────────────────

export const Bed: React.FC<{x: number; y: number; blanket?: string}> = ({x, y, blanket = '#F2A65A'}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-330} y={-250} width={40} height={250} rx={12} fill="#B98458" {...S} />
    <rect x={290} y={-170} width={40} height={170} rx={12} fill="#B98458" {...S} />
    <rect x={-300} y={-130} width={600} height={90} rx={16} fill={C.white} {...S} />
    <rect x={-300} y={-60} width={600} height={30} rx={8} fill="#B98458" {...S} />
  </g>
);

export const Blanket: React.FC<{x: number; y: number; color?: string; breathe?: number}> = ({x, y, color = '#F2A65A', breathe = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d={`M -150 -128 Q -150 ${-232 - breathe} 40 ${-228 - breathe} Q 270 -220 300 -128 L 300 -70 L -150 -70 Z`}
      fill={color}
      {...S}
    />
    <path d="M -90 -190 L -80 -84 M 40 -210 L 50 -84 M 170 -200 L 180 -84" stroke="#D88A40" strokeWidth={5} fill="none" />
  </g>
);

export const Pillow: React.FC<{x: number; y: number}> = ({x, y}) => (
  <ellipse cx={x} cy={y} rx={80} ry={34} fill={C.white} {...S} />
);

export const Nightstand: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-80} y={-150} width={160} height={150} rx={10} fill="#C89766" {...S} />
    <line x1={-80} x2={80} y1={-80} y2={-80} {...S} />
    <circle cx={0} cy={-112} r={7} fill={C.ink} />
    <circle cx={0} cy={-42} r={7} fill={C.ink} />
  </g>
);

export const Lamp: React.FC<{x: number; y: number; on?: number}> = ({x, y, on = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    {on > 0 && <ellipse cx={0} cy={-120} rx={120} ry={90} fill={C.yellow} opacity={0.18 * on} />}
    <rect x={-8} y={-110} width={16} height={100} fill={C.ink} />
    <ellipse cx={0} cy={-8} rx={40} ry={10} fill={C.ink} />
    <path d="M -55 -110 L 55 -110 L 35 -180 L -35 -180 Z" fill={on > 0.5 ? '#FBE3A0' : '#E6D7B5'} {...S} />
  </g>
);

export const Phone: React.FC<{x: number; y: number; scale?: number; ringing?: number; t?: number; rotate?: number; screen?: React.ReactNode}> = ({
  x,
  y,
  scale = 1,
  ringing = 0,
  t = 0,
  rotate = 0,
  screen,
}) => {
  const buzz = ringing > 0 ? Math.sin(t * 2.4) * 6 * ringing : 0;
  return (
    <g transform={`translate(${x + buzz} ${y}) rotate(${rotate + buzz}) scale(${scale})`}>
      {ringing > 0 && (
        <g stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" opacity={ringing}>
          <path d="M -60 -80 Q -76 -50 -60 -20" />
          <path d="M -80 -96 Q -104 -50 -80 -4" />
          <path d="M 60 -80 Q 76 -50 60 -20" />
          <path d="M 80 -96 Q 104 -50 80 -4" />
        </g>
      )}
      <rect x={-38} y={-110} width={76} height={130} rx={14} fill={C.ink} />
      <rect x={-30} y={-98} width={60} height={104} rx={6} fill={ringing > 0 && Math.sin(t * 0.8) > 0 ? '#9FE3C1' : '#5D6B86'} />
      {screen}
    </g>
  );
};

export const Window: React.FC<{x: number; y: number; w?: number; h?: number; night?: boolean; children?: React.ReactNode}> = ({
  x,
  y,
  w = 300,
  h = 240,
  night = true,
  children,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={night ? C.night : '#BFE1F2'} {...S} />
    <g>{children}</g>
    {night && (
      <g>
        <circle cx={w * 0.2} cy={-h * 0.15} r={34} fill="#F7E8B5" />
        <circle cx={w * 0.2 + 16} cy={-h * 0.15 - 10} r={30} fill={C.night} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={-w * 0.35 + i * 50} cy={-h * 0.3 + (i % 2) * 60} r={4} fill="#F7E8B5" />
        ))}
      </g>
    )}
    <line x1={0} x2={0} y1={-h / 2} y2={h / 2} {...S} />
    <line x1={-w / 2} x2={w / 2} y1={0} y2={0} {...S} />
    <rect x={-w / 2 - 14} y={h / 2} width={w + 28} height={16} rx={4} fill={C.white} {...S} />
  </g>
);

export const Wallet: React.FC<{x: number; y: number; open?: number; rotate?: number}> = ({x, y, open = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-46} y={-30} width={92} height={60} rx={8} fill="#8A5A3C" {...S} strokeWidth={6} />
    <g transform={`translate(0 -30) scale(1 ${1 - open * 1.8})`}>
      <rect x={-46} y={0} width={92} height={30} rx={8} fill="#A87150" {...S} strokeWidth={6} />
    </g>
  </g>
);

export const Moth: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const flap = Math.abs(Math.sin(t * 0.9));
  return (
    <g transform={`translate(${x} ${y}) scale(1.7)`}>
      <path d={`M 0 0 L ${-30 * flap - 4} -18 L ${-24 * flap - 4} 14 Z`} fill="#D8CDB8" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M 0 0 L ${30 * flap + 4} -18 L ${24 * flap + 4} 14 Z`} fill="#D8CDB8" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={5} ry={13} fill={C.ink} />
      <path d="M -2 -12 L -8 -22 M 2 -12 L 8 -22" stroke={C.ink} strokeWidth={3} />
    </g>
  );
};

export const Zzz: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const noScale = useNoScale();
  return (
  <g>
    {[0, 1, 2].map((i) => {
      const life = ((t + i * 20) % 60) / 60;
      return (
        <text
          key={i}
          x={x + life * 80 + Math.sin(life * 6) * 10}
          y={y - life * 140}
          fontFamily={FONT}
          fontWeight={900}
          fontSize={noScale ? 48 : 36 + life * 30}
          fill={C.ink}
          opacity={Math.sin(life * Math.PI)}
          transform={noScale ? `rotate(${-10 + life * 20} ${x + life * 80} ${y - life * 140})` : undefined}
        >
          Z
        </text>
      );
    })}
  </g>
  );
};

export const ThoughtBubble: React.FC<{x: number; y: number; scale: number; from: [number, number]; children?: React.ReactNode}> = ({
  x,
  y,
  scale,
  from,
  children,
}) => {
  if (scale <= 0.001) return null;
  const dots = [0.25, 0.5, 0.72];
  return (
    <g>
      {dots.map((p, i) => (
        <circle
          key={i}
          cx={from[0] + (x - 200 - from[0]) * p}
          cy={from[1] + (y + 150 - from[1]) * p}
          r={(10 + i * 9) * Math.min(1, scale * 1.4)}
          fill={C.white}
          {...S}
          strokeWidth={6}
        />
      ))}
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path
          d="M -260 40 Q -330 -40 -240 -110 Q -230 -220 -100 -200 Q -30 -290 80 -220 Q 200 -260 250 -150 Q 350 -80 280 30 Q 300 150 160 160 Q 80 240 -40 170 Q -170 220 -220 130 Q -320 120 -260 40 Z"
          fill={C.white}
          {...S}
        />
        {children}
      </g>
    </g>
  );
};

// ───────────────────────── Business / garage ─────────────────────────

export const Whiteboard: React.FC<{x: number; y: number; children?: React.ReactNode}> = ({x, y, children}) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={-200} y1={180} x2={-240} y2={420} {...S} />
    <line x1={200} y1={180} x2={240} y2={420} {...S} />
    <rect x={-300} y={-200} width={600} height={390} rx={14} fill={C.white} {...S} strokeWidth={10} />
    <rect x={-300} y={180} width={600} height={18} rx={5} fill="#B9B2A6" {...S} strokeWidth={6} />
    {children}
  </g>
);

const CrateDrawing: React.FC<{x: number; y: number; cans?: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-90} width={220} height={90} rx={8} fill="#C99A62" {...S} />
    <line x1={-110} x2={110} y1={-45} y2={-45} {...S} strokeWidth={5} />
    <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} opacity={0.7}>
      SODA x48
    </text>
  </g>
);

export const Dolly: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -10 -560 L -10 -10 L 160 -10" fill="none" {...S} strokeWidth={14} stroke="#55606E" />
    <path d="M -10 -560 L -10 -10 L 160 -10" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />
    <circle cx={10} cy={-4} r={26} fill={C.ink} />
    <circle cx={10} cy={-4} r={10} fill="#9AA" />
  </g>
);

export const DeliveryBox: React.FC<{x: number; y: number; open?: number}> = ({x, y, open = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-580} width={340} height={580} rx={6} fill="#D7B07A" {...S} />
    <path d="M -170 -540 L 170 -540 M -40 -580 L -40 -480 L 40 -480 L 40 -580" stroke={C.ink} strokeWidth={6} fill="none" />
    <text x={0} y={-280} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink} opacity={0.6 * (1 - open)}>
      THIS SIDE UP
    </text>
    <path d="M -20 -230 L 0 -260 L 20 -230 M 0 -260 L 0 -200" stroke={C.ink} strokeWidth={6} fill="none" opacity={0.6} />
  </g>
);

// ───────────────────────── Hallway ─────────────────────────

const CalendarDrawing: React.FC<{x: number; y: number; day: number; month: string; flip?: number}> = ({x, y, day, month, flip = 0}) => {
  const noScale = useNoScale();
  return (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-80} y={-90} width={160} height={180} rx={10} fill={C.white} {...S} />
    <rect x={-80} y={-90} width={160} height={50} rx={10} fill={C.red} {...S} />
    <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.white}>
      {month}
    </text>
    <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={82} fill={C.ink}>
      {day}
    </text>
    {flip > 0 && (
      <g transform={noScale ? `translate(${flip * 40} ${-40 - flip * 120}) rotate(${-flip * 35})` : `translate(0 -40) scale(1 ${1 - flip * 2})`} opacity={1 - flip}>
        <rect x={-80} y={0} width={160} height={130} rx={6} fill={C.white} {...S} strokeWidth={6} />
      </g>
    )}
    <circle cx={-40} cy={-90} r={8} fill={C.ink} />
    <circle cx={40} cy={-90} r={8} fill={C.ink} />
  </g>
  );
};

export const Spider: React.FC<{x: number; y: number; drop: number; t: number}> = ({x, y, drop, t}) => {
  const sway = Math.sin(t * 0.07) * 8;
  const yy = y + drop;
  return (
    <g>
      <line x1={x} y1={y} x2={x + sway} y2={yy} stroke={C.ink} strokeWidth={2.5} />
      <g transform={`translate(${x + sway} ${yy})`}>
        {[-1, 1].map((s) =>
          [0, 1, 2, 3].map((i) => (
            <path key={`${s}${i}`} d={`M 0 0 q ${s * 22} ${-14 + i * 8} ${s * 30} ${4 + i * 9}`} stroke={C.ink} strokeWidth={4} fill="none" />
          )),
        )}
        <ellipse rx={16} ry={18} fill={C.ink} />
        <circle cx={-6} cy={-4} r={5} fill={C.white} />
        <circle cx={6} cy={-4} r={5} fill={C.white} />
        <circle cx={-6} cy={-3} r={2} fill={C.ink} />
        <circle cx={6} cy={-3} r={2} fill={C.ink} />
      </g>
    </g>
  );
};

export const Tumbleweed: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 0.25)) * 40}) rotate(${t * 9})`}>
    <circle r={44} fill="none" stroke="#A0835A" strokeWidth={6} />
    <path d="M -40 -10 Q 0 30 40 -14 M -30 28 Q 0 -30 30 30 M -10 -42 Q 20 0 -14 42" stroke="#A0835A" strokeWidth={5} fill="none" />
  </g>
);

// ───────────────────────── Discovery ─────────────────────────

export const Invoice: React.FC<{x: number; y: number; title: string; amount: string; rotate?: number; scale?: number; color?: string}> = ({
  x,
  y,
  title,
  amount,
  rotate = 0,
  scale = 1,
  color = C.red,
}) => {
  if (scale <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <rect x={-130} y={-160} width={260} height={320} rx={8} fill={C.white} {...S} />
      <rect x={-130} y={-160} width={260} height={56} rx={8} fill={color} {...S} />
      <text x={0} y={-122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.white}>
        {title}
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-100} y={-80 + i * 34} width={200 - i * 50} height={12} rx={6} fill="#D6CEC0" />
      ))}
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={color}>
        {amount}
      </text>
      <g transform="translate(60 120) rotate(-14)">
        <rect x={-58} y={-22} width={116} height={44} rx={8} fill="none" stroke={color} strokeWidth={6} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={color}>
          DUE
        </text>
      </g>
    </g>
  );
};

export const Lightbulb: React.FC<{x: number; y: number; scale: number; t: number}> = ({x, y, scale, t}) => {
  if (scale <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 80 + Math.sin(t * 0.4 + i) * 6;
        return <line key={i} x1={Math.cos(a) * 66} y1={Math.sin(a) * 66} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke={C.yellow} strokeWidth={9} strokeLinecap="round" />;
      })}
      <circle r={48} fill="#FFE27A" {...S} />
      <rect x={-22} y={40} width={44} height={30} rx={6} fill="#B5ADA0" {...S} strokeWidth={6} />
    </g>
  );
};

// ───────────────────────── Office ─────────────────────────

export const Desk: React.FC<{x: number; y: number; monitor?: boolean}> = ({x, y, monitor = true}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-150} width={300} height={24} rx={6} fill="#D9C3A0" {...S} />
    <rect x={-140} y={-126} width={18} height={126} fill={C.ink} />
    <rect x={122} y={-126} width={18} height={126} fill={C.ink} />
    {monitor && (
      <g>
        <rect x={-70} y={-280} width={140} height={100} rx={8} fill="#5D6B86" {...S} />
        <rect x={-10} y={-180} width={20} height={30} fill={C.ink} />
        <rect x={-50} y={-262} width={60} height={10} rx={5} fill="#9FE3C1" />
        <rect x={-50} y={-242} width={90} height={10} rx={5} fill="#9FE3C1" opacity={0.6} />
      </g>
    )}
  </g>
);

export const Plant: React.FC<{x: number; y: number; t?: number; scale?: number}> = ({x, y, t = 0, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g transform={`rotate(${Math.sin(t * 0.05) * 2} 0 -90)`}>
      <path d="M 0 -90 Q -70 -150 -60 -230 Q -10 -180 0 -90 Z" fill="#6DBE7A" {...S} strokeWidth={6} />
      <path d="M 0 -90 Q 70 -160 50 -250 Q 0 -190 0 -90 Z" fill="#59A867" {...S} strokeWidth={6} />
      <path d="M 0 -90 Q -10 -200 10 -280 Q 30 -190 0 -90 Z" fill="#7FCC8A" {...S} strokeWidth={6} />
    </g>
    <path d="M -50 -100 L 50 -100 L 38 0 L -38 0 Z" fill="#D9805A" {...S} />
  </g>
);

export const WaterCooler: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-50} y={-220} width={100} height={220} rx={10} fill={C.white} {...S} />
    <path d="M -40 -220 Q -50 -330 0 -340 Q 50 -330 40 -220 Z" fill="#A8D8EE" {...S} />
    <rect x={-14} y={-170} width={28} height={16} rx={4} fill={C.blue} {...S} strokeWidth={5} />
  </g>
);

export const SalesCounter: React.FC<{x: number; y: number; value: number; scale?: number}> = ({x, y, value, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-150} y={-56} width={300} height={112} rx={20} fill={C.white} {...S} />
    <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.gray} letterSpacing={3}>
      SALES TODAY
    </text>
    <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.moneyDark}>
      ${value.toFixed(2)}
    </text>
  </g>
);

// ───────────────────────── FX ─────────────────────────

export const Impact: React.FC<{x: number; y: number; scale: number; color?: string; text?: string; rotate?: number}> = ({
  x,
  y,
  scale,
  color = C.yellow,
  text,
  rotate = 0,
}) => {
  if (scale <= 0.001) return null;
  const pts = Array.from({length: 24})
    .map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = i % 2 === 0 ? 150 : 100;
      return `${Math.cos(a) * r * 1.4},${Math.sin(a) * r}`;
    })
    .join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <polygon points={pts} fill={color} {...S} />
      {text && (
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.ink}>
          {text}
        </text>
      )}
    </g>
  );
};

export const Confetti: React.FC<{t: number; count?: number; seed?: string; cx?: number; cy?: number}> = ({t, count = 40, seed = 'conf', cx = 960, cy = 400}) => {
  if (t < 0 || t > 90) return null;
  const cols = [C.red, C.blue, C.yellow, C.shirt, C.purple, C.pink];
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = 10 + random(`${seed}v${i}`) * 18;
        const x = cx + Math.cos(a) * v * t;
        const y = cy + Math.sin(a) * v * t * 0.7 + 0.5 * t * t;
        return <rect key={i} x={x} y={y} width={18} height={10} fill={cols[i % cols.length]} transform={`rotate(${t * 12 + i * 30} ${x} ${y})`} opacity={Math.max(0, 1 - t / 90)} />;
      })}
    </g>
  );
};

export const SpeedLines: React.FC<{x: number; y: number; dir?: 1 | -1; opacity?: number}> = ({x, y, dir = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={opacity} stroke={C.ink} strokeWidth={6} strokeLinecap="round">
    <line x1={-200} y1={-120} x2={-60} y2={-120} />
    <line x1={-260} y1={-40} x2={-80} y2={-40} />
    <line x1={-220} y1={40} x2={-70} y2={40} />
  </g>
);

export const Exclaim: React.FC<{x: number; y: number; scale: number; text?: string}> = ({x, y, scale, text = '!'}) => {
  if (scale <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={140} fill={C.red} stroke={C.ink} strokeWidth={6} paintOrder="stroke">
        {text}
      </text>
    </g>
  );
};

/** Crate, drawn in the hand-drawn style when it's switched on (see handDrawn.tsx). */
export const Crate: typeof CrateDrawing = (props) => (
  <Rough>
    <CrateDrawing {...props} />
  </Rough>
);

/** Calendar, drawn in the hand-drawn style when it's switched on (see handDrawn.tsx). */
export const Calendar: typeof CalendarDrawing = (props) => (
  <Rough>
    <CalendarDrawing {...props} />
  </Rough>
);
