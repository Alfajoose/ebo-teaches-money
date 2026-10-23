import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {HEIGHT, WIDTH} from '../timing';

/** Full-frame SVG stage with a camera. `zoom` scales around the focus point (cx, cy). */
export const Stage: React.FC<{
  zoom?: number;
  cx?: number;
  cy?: number;
  rotate?: number;
  shakeX?: number;
  shakeY?: number;
  bg?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode; // drawn in screen space (not affected by camera)
}> = ({zoom = 1, cx = WIDTH / 2, cy = HEIGHT / 2, rotate = 0, shakeX = 0, shakeY = 0, bg = C.paper, children, overlay}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <g
        transform={`translate(${WIDTH / 2 + shakeX} ${HEIGHT / 2 + shakeY}) rotate(${rotate}) scale(${zoom}) translate(${-cx} ${-cy})`}
      >
        {children}
      </g>
      <PaperTexture />
      {overlay}
    </svg>
  </AbsoluteFill>
);

/** Circular iris. progress 0 = fully open, 1 = fully closed (black). */
export const Iris: React.FC<{progress: number; x?: number; y?: number; color?: string}> = ({progress, x = WIDTH / 2, y = HEIGHT / 2, color = C.ink}) => {
  if (progress <= 0) return null;
  const maxR = Math.hypot(Math.max(x, WIDTH - x), Math.max(y, HEIGHT - y)) + 40;
  const r = Math.max(0, maxR * (1 - progress));
  return (
    <path
      d={`M 0 0 H ${WIDTH} V ${HEIGHT} H 0 Z M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`}
      fill={color}
      fillRule="evenodd"
    />
  );
};

/** Soft paper vignette + grain for a hand-made look. */
export const PaperTexture: React.FC = () => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="vig" cx="50%" cy="50%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#5A4630" stopOpacity={0.16} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#vig)" />
  </g>
);
