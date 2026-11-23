import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {useMarkerFont, Label} from './filterKit';

/** Views test sheet: each character in its ¾, front and back views (frame = character index). */
const WHO: CastId[] = ['ebo', 'etoo', 'konka', 'mica', 'pretty', 'ama', 'christy', 'obuor', 'boss'];
export const ViewTest: React.FC = () => {
  useMarkerFont();
  const who = WHO[Math.min(useCurrentFrame(), WHO.length - 1)];
  const pose = (view: number) => ({...(POSES.standing as Pose), view} as Pose);
  return (
    <AbsoluteFill style={{background: '#FFFDF6'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {[1, 0, 4, 3].map((v, i) => (
          <g key={v}>
            <RigCharacter who={who} x={260 + i * 470} y={980} scale={1.0} t={0} noBlink pose={pose(v)} />
            <Label x={260 + i * 470} y={110} text={['front', '3/4', 'side', 'back'][i]} size={64} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
