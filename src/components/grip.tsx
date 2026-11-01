import React from 'react';
import {C} from '../theme';

/**
 * Hands on props (house rule 10). A held prop draws the holder's thumb and fingers over itself,
 * so the hand is on the object instead of the object floating beside it. Part of the prop's
 * drawing, so the Animate export keeps it too.
 */
export const SKIN = '#7E6143'; // Ebo's skin, from his master rig
const INK = {stroke: C.ink, strokeWidth: 5, strokeLinejoin: 'round' as const};

/** A thumb across a prop's edge at (x, y), pointing in `angle` degrees (0 = right). */
export const Thumb: React.FC<{x: number; y: number; angle?: number; size?: number; skin?: string}> = ({x, y, angle = -30, size = 1, skin = SKIN}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
    <rect x={-6} y={-11} width={44} height={22} rx={11} fill={skin} {...INK} />
  </g>
);

/** Fingers curled round a prop's edge at (x, y): `side` −1 = the left edge, 1 = the right. */
export const Fingers: React.FC<{x: number; y: number; side?: -1 | 1; count?: number; skin?: string}> = ({x, y, side = 1, count = 3, skin = SKIN}) => (
  <g transform={`translate(${x} ${y}) scale(${side} 1)`}>
    {Array.from({length: count}).map((_, i) => (
      <rect key={i} x={-14} y={-10 + i * 22} width={26} height={20} rx={10} fill={skin} {...INK} />
    ))}
  </g>
);
