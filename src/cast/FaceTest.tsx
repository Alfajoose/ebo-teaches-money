import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {CastId} from './castConfig';
import {POSES, Eyes, Mouth} from '../components/Character';
import {C, FONT} from '../theme';

/** Dev sheet: expression swaps per cast member (blink disabled via t). */
const IDS: CastId[] = ['ebo', 'mica', 'obuor', 'ama', 'christy'];
const FACES: [string, Eyes, Mouth][] = [
  ['open/smile', 'open', 'smile'],
  ['wide/scream', 'wide', 'scream'],
  ['closed/o', 'closed', 'o'],
  ['happy/grin', 'happy', 'grin'],
  ['half/flat', 'half', 'flat'],
  ['sad/frown', 'sad', 'frown'],
];
export const FaceTest: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {FACES.map(([label, eyes, mouth], c) => (
        <g key={label}>
          <text x={250 + c * 290} y={40} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} textAnchor="middle">
            {label}
          </text>
          {IDS.map((id, r) => (
            <RigCharacter key={id} who={id} x={250 + c * 290} y={r * 205 + 470} scale={0.95} pose={{...POSES.standing, eyes, mouth}} t={50} />
          ))}
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
