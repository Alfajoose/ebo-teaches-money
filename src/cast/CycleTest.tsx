import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {CastId} from './castConfig';
import {CycleName, cycleSpeed} from './cycles';
import {POSES} from '../components/Character';
import {C, FONT} from '../theme';

/** Dev sheet: every walk / run cycle on its character, looping in place over a ground line. */
export const CYCLE_ROWS: [CastId, CycleName, string][] = [
  ['ebo', 'run', 'Ebo — run'],
  ['christy', 'walk', 'Christy — walk'],
  ['christy', 'fastWalk', 'Christy — fast walk'],
  ['obuor', 'fastWalk', 'Obuor — fast walk'],
  ['mica', 'fastWalk', 'Mica — fast walk'],
];

export const CycleTest: React.FC<{frame?: number; travel?: boolean}> = ({frame, travel = false}) => {
  const cur = useCurrentFrame();
  const t = frame ?? cur;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {travel
          ? CYCLE_ROWS.map((_, i) => <line key={i} x1={0} x2={1920} y1={180 + i * 200} y2={180 + i * 200} stroke={C.ink} strokeWidth={2} opacity={0.3} />)
          : <line x1={0} x2={1920} y1={800} y2={800} stroke={C.ink} strokeWidth={3} opacity={0.3} />}
        {CYCLE_ROWS.map(([who, cycle, label], i) => (
          <g key={label}>
            <text x={travel ? 120 : 220 + i * 370} y={travel ? 150 + i * 200 : 900} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
              {label}
            </text>
            <RigCharacter who={who} x={travel ? -200 + ((cycleSpeed(who, cycle) * 0.3 * t) / 30) % 2300 : 220 + i * 370} y={travel ? 180 + i * 200 : 800} scale={travel ? 0.3 : 0.9} pose={{...POSES.standing, eyes: 'open', mouth: 'smile'}} t={t} cycle={cycle} noBlink />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
