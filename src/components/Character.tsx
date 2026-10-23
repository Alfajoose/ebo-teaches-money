import React from 'react';
import {C} from '../theme';

/**
 * Benny — the reusable cartoon character.
 * Local origin is between the feet (0,0); the character is ~440px tall at scale 1.
 * Everything is driven by a `Pose`, so scenes can blend presets or tweak joints.
 */

export type Eyes = 'open' | 'closed' | 'wide' | 'happy' | 'half' | 'sad' | 'dollar' | 'squint';
export type Mouth = 'smile' | 'grin' | 'o' | 'scream' | 'frown' | 'flat' | 'wobbly' | 'smirk' | 'snore';
export type Brows = 'neutral' | 'up' | 'angry' | 'sad' | 'flat';

export type Pose = {
  // [shoulder, elbow] degrees. 0 = hanging down, + = swing outward/up.
  armL: [number, number];
  armR: [number, number];
  // [hip, knee] degrees. + = forward (toward facing direction); knee bends back.
  legL: [number, number];
  legR: [number, number];
  tilt: number; // whole-body lean (deg)
  headTilt: number;
  lift: number; // vertical body offset (negative = up, e.g. jumping)
  squash: number; // 1 = normal, <1 squashed, >1 stretched
  eyes: Eyes;
  mouth: Mouth;
  brows: Brows;
  lookX: number;
  lookY: number;
  blush: number;
  sweat: number;
};

const base: Pose = {
  armL: [12, 8],
  armR: [12, 8],
  legL: [3, 0],
  legR: [-3, 0],
  tilt: 0,
  headTilt: 0,
  lift: 0,
  squash: 1,
  eyes: 'open',
  mouth: 'smile',
  brows: 'neutral',
  lookX: 0,
  lookY: 0,
  blush: 0,
  sweat: 0,
};

export const POSES = {
  standing: base,
  sleeping: {...base, armL: [6, 4], armR: [6, 4], eyes: 'closed', mouth: 'snore', brows: 'flat'} as Pose,
  shocked: {
    ...base,
    armL: [128, 40],
    armR: [128, 40],
    legL: [8, 0],
    legR: [-8, 0],
    eyes: 'wide',
    mouth: 'scream',
    brows: 'up',
    lift: -18,
    squash: 1.06,
    sweat: 1,
  } as Pose,
  happy: {
    ...base,
    armL: [150, -20],
    armR: [150, -20],
    eyes: 'happy',
    mouth: 'grin',
    brows: 'up',
    blush: 1,
  } as Pose,
  disappointed: {
    ...base,
    armL: [4, 2],
    armR: [4, 2],
    tilt: 0,
    headTilt: -4,
    lift: 6,
    squash: 0.97,
    eyes: 'half',
    mouth: 'flat',
    brows: 'flat',
    lookY: 6,
  } as Pose,
  devastated: {
    ...base,
    armL: [2, 0],
    armR: [2, 0],
    headTilt: 6,
    lift: 14,
    squash: 0.93,
    eyes: 'sad',
    mouth: 'wobbly',
    brows: 'sad',
    lookY: 8,
  } as Pose,
  pointing: {...base, armR: [95, 0], armL: [10, 6], mouth: 'smirk', brows: 'up'} as Pose,
  pushing: {
    ...base,
    armL: [-75, -10],
    armR: [75, 10],
    legL: [28, 30],
    legR: [-30, 10],
    tilt: 14,
    mouth: 'flat',
    brows: 'angry',
    eyes: 'squint',
    sweat: 1,
  } as Pose,
  celebrate: {
    ...base,
    armL: [165, 10],
    armR: [165, 10],
    legL: [20, 40],
    legR: [-20, 40],
    eyes: 'happy',
    mouth: 'grin',
    brows: 'up',
    lift: -40,
    blush: 1,
  } as Pose,
};

export type PoseName = keyof typeof POSES;

/** Blend two poses. Discrete face fields switch at the halfway point. */
export const mixPose = (a: Pose, b: Pose, p: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * p;
  const mm = (x: [number, number], y: [number, number]): [number, number] => [m(x[0], y[0]), m(x[1], y[1])];
  const pick = p < 0.5 ? a : b;
  return {
    armL: mm(a.armL, b.armL),
    armR: mm(a.armR, b.armR),
    legL: mm(a.legL, b.legL),
    legR: mm(a.legR, b.legR),
    tilt: m(a.tilt, b.tilt),
    headTilt: m(a.headTilt, b.headTilt),
    lift: m(a.lift, b.lift),
    squash: m(a.squash, b.squash),
    eyes: pick.eyes,
    mouth: pick.mouth,
    brows: pick.brows,
    lookX: m(a.lookX, b.lookX),
    lookY: m(a.lookY, b.lookY),
    blush: m(a.blush, b.blush),
    sweat: m(a.sweat, b.sweat),
  };
};

/** Walk cycle on top of any pose. `t` in frames, `speed` = steps/sec-ish. */
export const walkPose = (t: number, over: Partial<Pose> = {}, speed = 0.32): Pose => {
  const s = Math.sin(t * speed);
  const c = Math.cos(t * speed);
  return {
    ...base,
    legL: [s * 28, Math.max(0, -c) * 35],
    legR: [-s * 28, Math.max(0, c) * 35],
    armL: [s * 26 + 6, 14],
    armR: [s * 26 + 6, 14],
    lift: -Math.abs(c) * 10,
    tilt: 3,
    ...over,
  };
};

export type Palette = {skin: string; shirt: string; pants: string; hair: string};
export const BENNY: Palette = {skin: C.skin, shirt: C.shirt, pants: C.pants, hair: C.ink};

export type Hair = 'tuft' | 'bob' | 'bald' | 'bun' | 'spiky' | 'cap';

type Props = {
  x?: number;
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose | PoseName;
  t?: number; // used for automatic blinking
  palette?: Palette;
  hair?: Hair;
  beard?: number; // 0–1 stubble/beard growth
  tie?: boolean;
  glasses?: boolean;
  children?: React.ReactNode; // rendered in the right hand
};

const OUT = 9;

const limb = (
  ox: number,
  oy: number,
  a1: number,
  a2: number,
  l1: number,
  l2: number,
  side: 1 | -1,
): [number, number, number, number, number, number] => {
  // side -1 = left (outward = -x), side 1 = right
  const r1 = (a1 * Math.PI) / 180;
  const r2 = ((a1 + a2) * Math.PI) / 180;
  const x1 = ox + side * Math.sin(r1) * l1;
  const y1 = oy + Math.cos(r1) * l1;
  const x2 = x1 + side * Math.sin(r2) * l2;
  const y2 = y1 + Math.cos(r2) * l2;
  return [ox, oy, x1, y1, x2, y2];
};

const legPts = (ox: number, oy: number, hip: number, knee: number) => {
  const r1 = (hip * Math.PI) / 180;
  const r2 = ((hip - knee) * Math.PI) / 180;
  const x1 = ox + Math.sin(r1) * 50;
  const y1 = oy + Math.cos(r1) * 50;
  const x2 = x1 + Math.sin(r2) * 46;
  const y2 = y1 + Math.cos(r2) * 46;
  return [ox, oy, x1, y1, x2, y2] as const;
};

const Limb: React.FC<{pts: readonly number[]; color: string; w?: number}> = ({pts, color, w = 17}) => {
  const d = `M ${pts[0]} ${pts[1]} L ${pts[2]} ${pts[3]} L ${pts[4]} ${pts[5]}`;
  return (
    <g>
      <path d={d} stroke={C.ink} strokeWidth={w + 2 * OUT * 0.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Eye: React.FC<{type: Eyes; cx: number; cy: number; px: number; py: number; skin: string; blink: boolean; side: 1 | -1}> = ({
  type,
  cx,
  cy,
  px,
  py,
  skin,
  blink,
  side,
}) => {
  const k = {stroke: C.ink, strokeWidth: 7, fill: 'none', strokeLinecap: 'round' as const};
  if (type === 'closed' || (blink && (type === 'open' || type === 'half' || type === 'sad')))
    return <path d={`M ${cx - 22} ${cy} Q ${cx} ${cy + 14} ${cx + 22} ${cy}`} {...k} />;
  if (type === 'happy') return <path d={`M ${cx - 22} ${cy + 8} Q ${cx} ${cy - 20} ${cx + 22} ${cy + 8}`} {...k} strokeWidth={8} />;
  if (type === 'squint') return <path d={`M ${cx - 22} ${cy - side * 0} L ${cx + 22} ${cy}`} {...k} strokeWidth={8} />;
  const big = type === 'wide';
  const rx = big ? 36 : 27;
  const ry = big ? 44 : 33;
  const pr = big ? 7 : 12;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.white} stroke={C.ink} strokeWidth={6} />
      {type === 'dollar' ? (
        <text x={cx + px * 0.3} y={cy + 14} fontSize={42} fontWeight={900} textAnchor="middle" fill={C.moneyDark} fontFamily="Inter, Arial">
          $
        </text>
      ) : (
        <circle cx={cx + px * 0.35} cy={cy + py * 0.6 + (type === 'half' || type === 'sad' ? 10 : 2)} r={pr} fill={C.ink} />
      )}
      {!big && type !== 'dollar' && <circle cx={cx + px * 0.35 + 4} cy={cy + py * 0.6 - 4} r={3.5} fill={C.white} />}
      {(type === 'half' || type === 'sad') && (
        <g>
          <path
            d={
              type === 'half'
                ? `M ${cx - rx - 4} ${cy + 2} L ${cx + rx + 4} ${cy + 2} L ${cx + rx + 4} ${cy - ry - 6} L ${cx - rx - 4} ${cy - ry - 6} Z`
                : `M ${cx - rx - 4} ${cy - 2 - side * 10} L ${cx + rx + 4} ${cy - 2 + side * 10} L ${cx + rx + 4} ${cy - ry - 6} L ${cx - rx - 4} ${cy - ry - 6} Z`
            }
            fill={skin}
          />
          <path
            d={
              type === 'half'
                ? `M ${cx - rx} ${cy + 2} L ${cx + rx} ${cy + 2}`
                : `M ${cx - rx} ${cy - 2 - side * 10} L ${cx + rx} ${cy - 2 + side * 10}`
            }
            stroke={C.ink}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

const Brow: React.FC<{type: Brows; cx: number; cy: number; side: 1 | -1}> = ({type, cx, cy, side}) => {
  const k = {stroke: C.ink, strokeWidth: 8, fill: 'none', strokeLinecap: 'round' as const};
  // side: -1 left eye, +1 right eye. "inner" end is toward the face center.
  const inner = cx - side * 20;
  const outer = cx + side * 20;
  switch (type) {
    case 'up':
      return <path d={`M ${inner} ${cy - 18} Q ${cx} ${cy - 34} ${outer} ${cy - 16}`} {...k} />;
    case 'angry':
      return <path d={`M ${inner} ${cy + 6} L ${outer} ${cy - 10}`} {...k} />;
    case 'sad':
      return <path d={`M ${inner} ${cy - 14} L ${outer} ${cy + 4}`} {...k} />;
    case 'flat':
      return <path d={`M ${inner} ${cy + 4} L ${outer} ${cy + 4}`} {...k} />;
    default:
      return <path d={`M ${inner} ${cy - 4} Q ${cx} ${cy - 12} ${outer} ${cy - 4}`} {...k} />;
  }
};

const MouthShape: React.FC<{type: Mouth; x: number; y: number; t: number}> = ({type, x, y, t}) => {
  const k = {stroke: C.ink, strokeWidth: 7, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (type) {
    case 'smile':
      return <path d={`M ${x - 30} ${y} Q ${x} ${y + 26} ${x + 30} ${y}`} {...k} />;
    case 'smirk':
      return <path d={`M ${x - 26} ${y + 8} Q ${x + 6} ${y + 16} ${x + 30} ${y - 6}`} {...k} />;
    case 'grin':
      return (
        <g>
          <path d={`M ${x - 40} ${y - 6} Q ${x} ${y - 2} ${x + 40} ${y - 6} Q ${x + 34} ${y + 44} ${x} ${y + 44} Q ${x - 34} ${y + 44} ${x - 40} ${y - 6} Z`} fill={C.ink} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${x - 32} ${y} L ${x + 32} ${y} L ${x + 28} ${y + 10} L ${x - 28} ${y + 10} Z`} fill={C.white} />
          <ellipse cx={x} cy={y + 34} rx={18} ry={8} fill="#E86A6A" />
        </g>
      );
    case 'o':
      return <ellipse cx={x} cy={y + 8} rx={13} ry={17} fill={C.ink} />;
    case 'snore': {
      const r = 8 + Math.sin(t * 0.12) * 4;
      return <ellipse cx={x + 6} cy={y + 10} rx={r} ry={r * 0.8} fill={C.ink} />;
    }
    case 'scream':
      return (
        <g>
          <ellipse cx={x} cy={y + 18} rx={30} ry={40} fill={C.ink} />
          <ellipse cx={x} cy={y + 40} rx={18} ry={11} fill="#E86A6A" />
        </g>
      );
    case 'frown':
      return <path d={`M ${x - 28} ${y + 16} Q ${x} ${y - 8} ${x + 28} ${y + 16}`} {...k} />;
    case 'flat':
      return <path d={`M ${x - 24} ${y + 8} L ${x + 24} ${y + 8}`} {...k} />;
    case 'wobbly': {
      const w = Math.sin(t * 0.9) * 3;
      return (
        <path
          d={`M ${x - 32} ${y + 12} q 8 ${-9 + w} 16 0 t 16 0 t 16 0 t 16 0`}
          {...k}
        />
      );
    }
  }
};

const HairShape: React.FC<{hair: Hair; color: string}> = ({hair, color}) => {
  const k = {fill: color, stroke: C.ink, strokeWidth: OUT, strokeLinejoin: 'round' as const};
  switch (hair) {
    case 'tuft':
      return (
        <path
          d="M -58 -96 Q -40 -150 -6 -112 Q 6 -172 34 -110 Q 64 -138 66 -92 Q 20 -118 -58 -96 Z"
          {...k}
        />
      );
    case 'spiky':
      return <path d="M -96 -60 L -84 -118 L -50 -96 L -30 -146 L 0 -106 L 30 -150 L 48 -100 L 86 -122 L 96 -58 Q 0 -110 -96 -60 Z" {...k} />;
    case 'bob':
      return (
        <path
          d="M -122 30 Q -140 -128 0 -124 Q 140 -128 122 30 L 100 30 Q 104 -54 40 -72 Q -20 -40 -100 -40 Q -104 0 -100 30 Z"
          {...k}
        />
      );
    case 'bun':
      return (
        <g>
          <circle cx={0} cy={-128} r={40} {...k} />
          <path d="M -114 -30 Q -110 -124 0 -120 Q 110 -124 114 -30 Q 60 -80 0 -78 Q -60 -80 -114 -30 Z" {...k} />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M -110 -40 Q -110 -124 0 -124 Q 110 -124 110 -40 Z" {...k} />
          <path d="M 40 -44 L 170 -40 Q 170 -24 100 -26 L 40 -28 Z" {...k} />
        </g>
      );
    default:
      return null;
  }
};

export const Character: React.FC<Props> = ({
  x = 0,
  y = 0,
  scale = 1,
  facing = 1,
  pose = 'standing',
  t = 0,
  palette = BENNY,
  hair = 'tuft',
  beard = 0,
  tie = false,
  glasses = false,
  children,
}) => {
  const p: Pose = typeof pose === 'string' ? POSES[pose] : pose;
  const blink = (t + 17) % 97 < 4;

  // Facial expressions mirror with facing, but we keep look direction world-relative.
  const lookX = p.lookX * facing;

  const hipY = -92;
  const legLp = legPts(-20, hipY, p.legL[0], p.legL[1]);
  const legRp = legPts(20, hipY, p.legR[0], p.legR[1]);
  const shoulderY = -178;
  const armLp = limb(-42, shoulderY, p.armL[0], p.armL[1], 50, 46, -1);
  const armRp = limb(42, shoulderY, p.armR[0], p.armR[1], 50, 46, 1);

  const headY = -322;

  const shoe = (pts: readonly number[]) => (
    <ellipse cx={pts[4] + 10} cy={pts[5] + 2} rx={26} ry={13} fill={C.shoe} stroke={C.ink} strokeWidth={5} />
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale})`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={4} rx={90 - Math.min(40, Math.abs(p.lift) * 0.6)} ry={14} fill={C.ink} opacity={0.12} />
      <g transform={`rotate(${p.tilt} 0 0) translate(0 ${p.lift}) scale(1 ${p.squash})`}>
        {/* legs */}
        <Limb pts={legLp} color={palette.pants} w={20} />
        <Limb pts={legRp} color={palette.pants} w={20} />
        {shoe(legLp)}
        {shoe(legRp)}

        {/* back arm */}
        <Limb pts={armLp} color={palette.shirt} />
        <circle cx={armLp[4]} cy={armLp[5]} r={14} fill={palette.skin} stroke={C.ink} strokeWidth={6} />

        {/* torso */}
        <path
          d="M -50 -190 Q -56 -120 -46 -84 L 46 -84 Q 56 -120 50 -190 Q 0 -212 -50 -190 Z"
          fill={palette.shirt}
          stroke={C.ink}
          strokeWidth={OUT}
          strokeLinejoin="round"
        />
        <path d="M -47 -100 L 47 -100 L 46 -84 L -46 -84 Z" fill={palette.pants} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {tie && <path d="M 0 -196 L 12 -178 L 6 -130 L 0 -120 L -6 -130 L -12 -178 Z" fill={C.red} stroke={C.ink} strokeWidth={5} />}

        {/* front arm (+ held item) */}
        <Limb pts={armRp} color={palette.shirt} />
        <g transform={`translate(${armRp[4]} ${armRp[5]})`}>{children}</g>
        <circle cx={armRp[4]} cy={armRp[5]} r={14} fill={palette.skin} stroke={C.ink} strokeWidth={6} />

        {/* head */}
        <g transform={`rotate(${p.headTilt} 0 -200) translate(0 ${headY})`}>
          <circle cx={-114} cy={12} r={24} fill={palette.skin} stroke={C.ink} strokeWidth={OUT} />
          <circle cx={114} cy={12} r={24} fill={palette.skin} stroke={C.ink} strokeWidth={OUT} />
          <circle cx={0} cy={0} r={120} fill={palette.skin} stroke={C.ink} strokeWidth={OUT + 1} />
          <HairShape hair={hair} color={palette.hair} />
          {beard > 0 && (
            <path
              d="M -100 40 Q -80 128 0 128 Q 80 128 100 40 Q 70 70 40 66 Q 0 90 -40 66 Q -70 70 -100 40 Z"
              fill="#6B5A4E"
              opacity={Math.min(1, beard)}
              transform={`translate(0 ${(1 - Math.min(1, beard)) * 10}) scale(1 ${0.6 + 0.4 * Math.min(1, beard)})`}
            />
          )}
          {p.blush > 0 && (
            <g opacity={p.blush * 0.6}>
              <ellipse cx={-70 + lookX * 0.4} cy={40} rx={18} ry={10} fill="#F2899A" />
              <ellipse cx={70 + lookX * 0.4} cy={40} rx={18} ry={10} fill="#F2899A" />
            </g>
          )}
          <Eye type={p.eyes} cx={-40 + lookX * 0.6} cy={-8 + p.lookY * 0.5} px={lookX} py={p.lookY} skin={palette.skin} blink={blink} side={-1} />
          <Eye type={p.eyes} cx={40 + lookX * 0.6} cy={-8 + p.lookY * 0.5} px={lookX} py={p.lookY} skin={palette.skin} blink={blink} side={1} />
          {glasses && (
            <g fill="none" stroke={C.ink} strokeWidth={6}>
              <circle cx={-40 + lookX * 0.6} cy={-8} r={36} />
              <circle cx={40 + lookX * 0.6} cy={-8} r={36} />
              <path d={`M ${-4 + lookX * 0.6} -10 L ${4 + lookX * 0.6} -10`} />
            </g>
          )}
          <Brow type={p.brows} cx={-40 + lookX * 0.6} cy={-50 + p.lookY * 0.3} side={-1} />
          <Brow type={p.brows} cx={40 + lookX * 0.6} cy={-50 + p.lookY * 0.3} side={1} />
          <MouthShape type={p.mouth} x={lookX * 0.5} y={52 + p.lookY * 0.4} t={t} />
          {p.sweat > 0 && (
            <path
              d="M 96 -70 Q 110 -44 104 -32 Q 92 -24 86 -38 Q 86 -50 96 -70 Z"
              fill="#9AD3F0"
              stroke={C.ink}
              strokeWidth={5}
              opacity={p.sweat}
              transform={`translate(0 ${(t % 30) * 0.8})`}
            />
          )}
        </g>
      </g>
    </g>
  );
};
