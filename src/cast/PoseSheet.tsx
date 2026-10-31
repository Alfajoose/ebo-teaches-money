import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {CastId} from './castConfig';
import {Pose} from '../components/Character';
import {C, FONT} from '../theme';
import {LIE_Y} from './poses';

/**
 * Pose sheet: one character in a list of named poses, in a grid, on a ground line.
 * Used to review the pose library (src/cast/poses.ts).
 */
export const PoseGrid: React.FC<{who: CastId; poses: [string, Pose][]; cols?: number; title?: string}> = ({who, poses, cols = 6, title}) => {
  const W = 1920;
  const rows = Math.ceil(poses.length / cols);
  const cellW = W / cols;
  const top = title ? 90 : 20;
  const cellH = (1080 - top) / rows;
  const scale = Math.min(0.62, cellH / 760);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {title && (
          <text x={40} y={64} fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink}>
            {title}
          </text>
        )}
        {poses.map(([name, p], i) => {
          const cx = (i % cols) * cellW + cellW / 2;
          const gy = top + Math.floor(i / cols) * cellH + cellH - 46;
          return (
            <g key={name}>
              <line x1={cx - cellW / 2 + 16} x2={cx + cellW / 2 - 16} y1={gy} y2={gy} stroke={C.ink} strokeWidth={2} opacity={0.2} />
              <RigCharacter who={who} x={Math.abs(p.tilt) > 45 ? cx + 120 * scale : cx} y={Math.abs(p.tilt) > 45 ? gy - LIE_Y * scale : gy} scale={scale} pose={p} t={0} noBlink />
              <text x={cx} y={gy + 34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
