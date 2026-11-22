import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {useMarkerFont, Label} from './filterKit';

/** Views test sheet: each character in its ¾, front and back views (frame = character index). */
const WHO: CastId[] = ['mica', 'obuor', 'ama', 'christy', 'pretty', 'boss', 'ebo'];
export const ViewTest: React.FC = () => {
  useMarkerFont();
  const who = WHO[Math.min(useCurrentFrame(), WHO.length - 1)];
  const pose = (view: number) => ({...(POSES.standing as Pose), view} as Pose);
  return (
    <AbsoluteFill style={{background: '#FFFDF6'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {[0, 1, 3].map((v, i) => (
          <g key={v}>
            <RigCharacter who={who} x={320 + i * 640} y={980} scale={1.15} t={0} noBlink pose={pose(v)} />
            <Label x={320 + i * 640} y={110} text={['3/4', 'front', 'back'][i]} size={70} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
