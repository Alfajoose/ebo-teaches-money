import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {POSE, frontOn, gentle} from './poses';
import {Pose} from '../components/Character';
import {NoScaleContext} from '../noScale';
import {StageSizeContext} from '../series/exportCtx';
import {C, FONT} from '../theme';

/**
 * Simple mitten hands for the rigs (the user's call after the Ep7 style review: tube arms can't
 * point, hold or count). Drawn in Ebo's own style — his skin, a black outline, no fingernails or
 * palm lines beyond a single crease — so they sit on his forearms like the rest of the rig.
 * Each is drawn with the wrist at the origin and the fingers along +y (down the forearm's line),
 * in world px; RigCharacter's handR / handL put one on the end of a forearm, turned with it.
 * For Animate: one graphic symbol, one hand per frame, on a layer parented to each forearm
 * (as the Ebo_HandProps set already is).
 */
const SKIN = '#7E6143';
const SHADE = '#6A5038';
const O = {stroke: '#000', strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** A closed fist (the resting hand). */
export const Fist: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 26 -4 L 30 40 Q 30 58 12 60 L -14 60 Q -32 58 -30 40 Z" fill={SKIN} {...O} />
    {[-14, 0, 14].map((x) => (
      <path key={x} d={`M ${x} 44 L ${x} 58`} fill="none" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    ))}
    {/* the thumb, folded across */}
    <path d="M -28 20 Q -8 18 6 30" fill="none" stroke="#000" strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

/** An open palm, fingers together, thumb out (shrug, "stop", presenting). */
export const Open: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 24 -4 L 28 34 L 30 86 Q 30 96 20 96 Q 12 96 12 86 L 10 62 L 6 92 Q 4 102 -6 100 Q -14 98 -12 88 L -10 62 L -16 88 Q -18 98 -27 95 Q -34 92 -31 82 L -30 40 Z" fill={SKIN} {...O} />
    {/* thumb */}
    <path d="M 26 14 Q 48 18 54 38 Q 56 48 46 48 Q 38 46 30 34" fill={SKIN} {...O} />
    <path d="M -14 40 Q -2 48 12 42" fill="none" stroke={SHADE} strokeWidth={3} strokeLinecap="round" />
  </g>
);

/** Pointing: a fist with the index finger out along the forearm's line. */
export const Point: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 26 -4 L 30 36 Q 30 54 12 56 L -14 56 Q -32 54 -30 36 Z" fill={SKIN} {...O} />
    {/* the index finger */}
    <path d="M 6 44 L 8 104 Q 8 116 -2 116 Q -12 116 -12 104 L -12 50" fill={SKIN} {...O} />
    {[-2, 12].map((x) => (
      <path key={x} d={`M ${x + 14} 42 L ${x + 14} 54`} fill="none" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    ))}
    <path d="M -28 18 Q -10 16 2 26" fill="none" stroke="#000" strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

/** Thumbs up: a fist with the thumb sticking out to the side (up, when the arm is raised forward). */
export const ThumbsUp: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 26 -4 L 30 40 Q 30 58 12 60 L -14 60 Q -32 58 -30 40 Z" fill={SKIN} {...O} />
    {[-14, 0, 14].map((x) => (
      <path key={x} d={`M ${x} 44 L ${x} 58`} fill="none" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    ))}
    {/* the thumb */}
    <path d="M -28 10 L -66 4 Q -78 4 -78 14 Q -78 24 -66 26 L -30 30" fill={SKIN} {...O} />
  </g>
);

/** A grip: fingers curled round an object (for holding a prop: the prop sits in the C). */
export const Grip: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 26 -4 L 30 30 Q 34 56 20 70 L 8 62 Q 16 52 12 38 L -12 38 Q -18 52 -8 62 L -20 70 Q -34 56 -30 30 Z" fill={SKIN} {...O} />
    <path d="M -16 20 Q 0 26 16 20" fill="none" stroke={SHADE} strokeWidth={3} strokeLinecap="round" />
  </g>
);

/** Counting: two fingers up in a V (for "first… second…"; also peace). */
export const Two: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g transform={`scale(${side} 1)`}>
    <path d="M -26 -4 L 26 -4 L 30 36 Q 30 54 12 56 L -14 56 Q -32 54 -30 36 Z" fill={SKIN} {...O} />
    <path d="M -14 46 L -24 104 Q -26 114 -16 116 Q -6 116 -4 106 L 2 54" fill={SKIN} {...O} />
    <path d="M 4 50 L 14 106 Q 16 116 26 114 Q 34 110 32 100 L 22 46" fill={SKIN} {...O} />
  </g>
);

export const HANDS = {fist: Fist, open: Open, point: Point, thumbsUp: ThumbsUp, grip: Grip, two: Two};
export type HandName = keyof typeof HANDS;
export const hand = (name: HandName, side: 1 | -1 = 1) => {
  const H = HANDS[name];
  // the thumb has to point up when the arm is raised out to the side, so this one is drawn the other way round
  return <H side={name === 'thumbsUp' ? (-side as 1 | -1) : side} />;
};

// ───────────────────────── the preview sheet (1080×1920) ─────────────────────────
const LABELS: [HandName, string][] = [
  ['fist', 'fist (resting)'],
  ['open', 'open palm'],
  ['point', 'point'],
  ['thumbsUp', 'thumbs up'],
  ['grip', 'grip (holding)'],
  ['two', 'two / counting'],
];
const DEMO: {label: string; pose: Partial<Pose>; r: HandName; l: HandName}[] = [
  {label: 'resting', pose: {}, r: 'fist', l: 'fist'},
  {label: 'pointing', pose: {armR: [100, -10], eyes: 'suspicious', mouth: 'smirk'}, r: 'point', l: 'fist'},
  {label: 'shrug', pose: {armR: [70, -30], armL: [70, -30], eyes: 'half', mouth: 'flat'}, r: 'open', l: 'open'},
  {label: 'thumbs up', pose: {armL: [95, -35], eyes: 'happy', mouth: 'grin'}, r: 'fist', l: 'thumbsUp'},
];

export const EboHandsSheet: React.FC = () => (
  <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
    <NoScaleContext.Provider value>
      <AbsoluteFill style={{background: '#F6F0E4'}}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <text x={540} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.ink}>
            EBO · HAND SET
          </text>
          <text x={540} y={140} textAnchor="middle" fontFamily={FONT} fontSize={26} fill="#55505A">
            wrist at the top, fingers down the forearm · one symbol, one hand per frame
          </text>
          {LABELS.map(([n, label], i) => (
            <g key={n} transform={`translate(${180 + (i % 3) * 360} ${230 + Math.floor(i / 3) * 330})`}>
              <rect x={-150} y={-30} width={300} height={290} rx={20} fill="#fff" stroke="#E2D8C6" strokeWidth={3} />
              <g transform="translate(0 30) scale(1.6)">{hand(n)}</g>
              <text y={240} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={C.ink}>
                {label}
              </text>
            </g>
          ))}
          {DEMO.map((d, i) => (
            <g key={d.label}>
              <RigCharacter who="ebo" x={i % 2 ? 790 : 290} y={i < 2 ? 1330 : 1830} scale={0.62} t={0} noBlink pose={gentle(frontOn({...POSE.stand, ...d.pose} as Pose))} handR={hand(d.r, 1)} handL={hand(d.l, -1)} />
              <text x={i % 2 ? 790 : 290} y={i < 2 ? 1380 : 1880} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.ink}>
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </AbsoluteFill>
    </NoScaleContext.Provider>
  </StageSizeContext.Provider>
);
