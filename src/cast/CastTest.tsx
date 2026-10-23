import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {CastId} from './castConfig';
import {POSES, Pose, walkPose} from '../components/Character';
import {SITTING} from '../scenes/shared';
import {C, FONT} from '../theme';

/** Dev sheet: every cast member in every reusable pose (rotation + translation only). */
const IDS: CastId[] = ['ebo', 'mica', 'obuor', 'ama', 'christy'];
const ROWS: [string, (t: number) => Pose][] = [
  ['standing', () => POSES.standing],
  ['happy', () => POSES.happy],
  ['shocked', () => POSES.shocked],
  ['disappointed', () => POSES.disappointed],
  ['devastated', () => POSES.devastated],
  ['celebrate', () => POSES.celebrate],
  ['pointing', () => POSES.pointing],
  ['pushing', () => POSES.pushing],
  ['walk', (t) => walkPose(t)],
  ['sitting', () => SITTING],
];

export const CastTest: React.FC<{rows?: number[]}> = ({rows = [0, 1, 2, 3, 4]}) => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {rows.map((r, ri) => (
          <g key={r}>
            <text x={20} y={ri * 216 + 40} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
              {ROWS[r][0]}
            </text>
            {IDS.map((id, i) => (
              <RigCharacter key={id} who={id} x={330 + i * 340} y={ri * 216 + 205} scale={0.42} pose={ROWS[r][1](t + 7)} t={t} />
            ))}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
