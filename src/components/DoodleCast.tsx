import React from 'react';
import {Prop} from '../prop';
import {C} from '../theme';

/**
 * The doodle cast (Ep 13, the storytime style): sketchbook versions of the rigs. A big round head with the
 * character's colours and one signature trait (Ebo's ears and cheek, the friend's beanie, the wife's hair), a small
 * shirt-coloured body, marker-line arms and legs. Origin at the hips. Angles in degrees: 0 = hanging down,
 * + = swung toward +x; the second number bends the elbow/knee.
 */
const INK = C.ink;
const L = {stroke: INK, strokeWidth: 10, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
export type DoodleWho = 'ebo' | 'friend' | 'wife' | 'boss' | 'waiter' | 'guy';
const LOOK: Record<DoodleWho, {skin: string; shirt: string; legs: string}> = {
  ebo: {skin: '#7E5E42', shirt: '#0C3540', legs: '#D3D6C8'},
  friend: {skin: '#7E5E42', shirt: '#CFCBFF', legs: '#6C98B6'},
  wife: {skin: '#7E5E42', shirt: '#F9AF5A', legs: '#64443A'},
  boss: {skin: '#9A7556', shirt: '#4A4F5C', legs: '#2E313A'},
  waiter: {skin: '#A9826A', shirt: '#FFFFFF', legs: '#2E313A'},
  guy: {skin: '#B08A6E', shirt: '#7FB46A', legs: '#56607A'},
};
export type DoodlePose = {
  armL?: [number, number];
  armR?: [number, number];
  legL?: [number, number];
  legR?: [number, number];
  lean?: number;
  eyes?: 'dot' | 'closed' | 'wide' | 'happy' | 'side' | 'tiny' | 'x';
  /** a face, or a lip-sync frame: 0 shut, 1 wide, 2 small, 3 round */
  mouth?: 'smile' | 'flat' | 'o' | 'frown' | 'grin' | 'open' | 'wobble' | 0 | 1 | 2 | 3;
  brows?: 'angry' | 'worried' | 'up' | 'none';
  sweat?: boolean;
  blush?: boolean;
};
const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a: [number, number], l1: number, l2: number) => {
  const a1 = rad(a[0]);
  const ex = x + l1 * Math.sin(a1);
  const ey = y + l1 * Math.cos(a1);
  const a2 = rad(a[0] + a[1]);
  return {d: `M ${x} ${y} L ${ex} ${ey} L ${ex + l2 * Math.sin(a2)} ${ey + l2 * Math.cos(a2)}`, end: [ex + l2 * Math.sin(a2), ey + l2 * Math.cos(a2)] as [number, number]};
};

const HY = -235; // head centre
const HR = 82; // head radius

const Face: React.FC<{pose: DoodlePose; who: DoodleWho}> = ({pose, who}) => {
  const {eyes = 'dot', mouth = 'smile', brows = 'none', sweat = false} = pose;
  const ey = HY - 6;
  const ex = [-4, 38];
  const m = (() => {
    const y = HY + 34;
    switch (mouth) {
      case 'smile': return <path d={`M -4 ${y} Q 16 ${y + 18} 36 ${y}`} {...L} strokeWidth={7} />;
      case 'grin': return <path d={`M -8 ${y - 4} Q 16 ${y + 34} 40 ${y - 4} Z`} fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
      case 'flat': case 0: return <path d={`M 2 ${y + 4} L 30 ${y + 4}`} {...L} strokeWidth={7} />;
      case 'frown': return <path d={`M -2 ${y + 12} Q 16 ${y - 4} 34 ${y + 12}`} {...L} strokeWidth={7} />;
      case 'o': case 3: return <ellipse cx={16} cy={y + 6} rx={10} ry={13} fill={INK} />;
      case 'open': case 1: return <path d={`M -6 ${y - 2} Q 16 ${y + 40} 38 ${y - 2} Z`} fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
      case 2: return <ellipse cx={16} cy={y + 5} rx={14} ry={7} fill={INK} />;
      case 'wobble': return <path d={`M -4 ${y + 6} q 7 -8 13 0 q 7 8 13 0 q 7 -8 13 0`} {...L} strokeWidth={6} />;
    }
  })();
  return (
    <g>
      {eyes === 'dot' && ex.map((x) => <ellipse key={x} cx={x} cy={ey} rx={8} ry={11} fill={INK} />)}
      {eyes === 'tiny' && ex.map((x) => <circle key={x} cx={x} cy={ey} r={5} fill={INK} />)}
      {eyes === 'side' && ex.map((x) => <ellipse key={x} cx={x + 8} cy={ey} rx={8} ry={11} fill={INK} />)}
      {eyes === 'wide' && ex.map((x) => <g key={x}><circle cx={x} cy={ey - 2} r={17} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={x + 2} cy={ey} r={6} fill={INK} /></g>)}
      {eyes === 'closed' && <path d={`M -16 ${ey} l 22 0 M 26 ${ey} l 22 0`} {...L} strokeWidth={6} />}
      {eyes === 'happy' && <path d={`M -16 ${ey + 4} q 12 -16 24 0 M 26 ${ey + 4} q 12 -16 24 0`} {...L} strokeWidth={6} />}
      {eyes === 'x' && <path d={`M -14 ${ey - 10} l 20 20 M 6 ${ey - 10} l -20 20 M 28 ${ey - 10} l 20 20 M 48 ${ey - 10} l -20 20`} {...L} strokeWidth={6} />}
      {brows === 'angry' && <path d={`M -20 ${ey - 30} l 24 10 M 56 ${ey - 30} l -24 10`} {...L} strokeWidth={6} />}
      {brows === 'worried' && <path d={`M -20 ${ey - 20} l 24 -10 M 56 ${ey - 20} l -24 -10`} {...L} strokeWidth={6} />}
      {brows === 'up' && <path d={`M -18 ${ey - 32} q 14 -10 26 0 M 26 ${ey - 32} q 14 -10 26 0`} {...L} strokeWidth={6} />}
      {(pose.blush ?? who === 'ebo') && <circle cx={-40} cy={HY + 26} r={13} fill="#5E3F2E" opacity={0.7} />}
      {m}
      {sweat && <path d={`M 76 ${HY - 50} q -14 26 0 36 q 14 -10 0 -36 Z`} fill="#6BB7E8" stroke={INK} strokeWidth={4} />}
    </g>
  );
};

const Head: React.FC<{who: DoodleWho; pose: DoodlePose}> = ({who, pose}) => {
  const k = LOOK[who];
  const ink = {stroke: INK, strokeWidth: 8, strokeLinejoin: 'round' as const};
  return (
    <g transform="translate(14 0)">
      {/* Ebo's big ears, behind the head */}
      {who === 'ebo' && [-1, 1].map((s) => <g key={s}><ellipse cx={s * (HR + 4)} cy={HY + 6} rx={26} ry={32} fill={k.skin} {...ink} /><path d={`M ${s * (HR + 8)} ${HY - 4} q ${-s * 10} 10 0 20`} {...L} strokeWidth={4} /></g>)}
      {/* the wife's hair, behind */}
      {who === 'wife' && <path d={`M ${-HR - 14} ${HY + 40} Q ${-HR - 30} ${HY - HR - 30} 0 ${HY - HR - 20} Q ${HR + 30} ${HY - HR - 30} ${HR + 14} ${HY + 40} Z`} fill="#24211C" {...ink} />}
      {/* head: slightly taller than wide, like the rigs */}
      <ellipse cx={0} cy={HY} rx={HR} ry={HR + 8} fill={k.skin} {...ink} />
      {who === 'wife' && <>
        <path d={`M ${-HR + 4} ${HY - 10} Q ${-HR + 10} ${HY - HR - 10} 0 ${HY - HR - 6} Q ${HR - 10} ${HY - HR - 8} ${HR - 2} ${HY - 20} Q 20 ${HY - 60} ${-HR + 4} ${HY - 10} Z`} fill="#24211C" {...ink} />
        <circle cx={-HR + 2} cy={HY + 30} r={6} fill="#fff" stroke={INK} strokeWidth={3} />
      </>}
      {who === 'friend' && <>
        <path d={`M ${-HR - 6} ${HY - 26} Q ${-HR} ${HY - HR - 70} 0 ${HY - HR - 70} Q ${HR} ${HY - HR - 70} ${HR + 6} ${HY - 26} Z`} fill="#3B6EF0" {...ink} />
        <rect x={-HR - 12} y={HY - 50} width={2 * HR + 24} height={34} rx={10} fill="#3B6EF0" {...ink} />
      </>}
      {who === 'boss' && <>
        <path d={`M ${-HR + 6} ${HY - 40} Q 0 ${HY - HR - 34} ${HR - 6} ${HY - 40} Q 0 ${HY - HR} ${-HR + 6} ${HY - 40} Z`} fill="#C8CCD4" {...ink} />
        <g {...L} strokeWidth={5}><circle cx={-4} cy={HY - 6} r={20} /><circle cx={38} cy={HY - 6} r={20} /><path d={`M 16 ${HY - 6} l 2 0`} /></g>
      </>}
      {who === 'waiter' && <path d={`M ${-HR + 10} ${HY - 56} Q 0 ${HY - HR - 30} ${HR - 10} ${HY - 56}`} {...L} strokeWidth={8} />}
      <Face pose={pose} who={who} />
    </g>
  );
};

const PersonDrawing: React.FC<{who: DoodleWho; x?: number; y?: number; facing?: 1 | -1; pose?: DoodlePose; hold?: React.ReactNode; holdL?: React.ReactNode}> = ({who, x = 0, y = 0, facing = 1, pose = {}, hold, holdL}) => {
  const {armL = [-14, -10], armR = [14, 10], legL = [-8, 0], legR = [8, 0], lean = 0} = pose;
  const k = LOOK[who];
  const aR = limb(26, -128, armR, 58, 58);
  const aL = limb(-26, -128, armL, 58, 58);
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
      <path d={limb(-14, -10, legL, 60, 60).d} {...L} />
      <path d={limb(14, -10, legR, 60, 60).d} {...L} />
      <g transform={`rotate(${-lean} 0 0)`}>
        <path d={aL.d} {...L} />
        {/* body: a little shirt over shorts */}
        <path d="M -36 -20 L -32 0 L 32 0 L 36 -20 Z" fill={k.legs} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -30 -140 Q -44 -80 -38 -18 L 38 -18 Q 44 -80 30 -140 Q 0 -152 -30 -140 Z" fill={k.shirt} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {who === 'boss' && <path d="M 0 -140 L -9 -112 L 0 -60 L 9 -112 Z" fill="#D04A3A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
        {who === 'waiter' && <path d="M -16 -146 l 16 8 l 16 -8 l 0 16 l -16 -8 l -16 8 Z" fill={INK} />}
        <path d={aR.d} {...L} />
        {holdL && <g transform={`translate(${aL.end[0]} ${aL.end[1]})`}>{holdL}</g>}
        {hold && <g transform={`translate(${aR.end[0]} ${aR.end[1]})`}>{hold}</g>}
        <Head who={who} pose={pose} />
      </g>
    </g>
  );
};

/** One of the doodle cast, as a prop (its own symbol in the Animate export). */
export const DoodlePerson: React.FC<React.ComponentProps<typeof PersonDrawing>> = (props) => (
  <Prop name={`Doodle_${props.who}`}>
    <PersonDrawing {...props} />
  </Prop>
);
