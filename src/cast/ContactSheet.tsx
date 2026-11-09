import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RigCharacter} from './RigCharacter';
import {POSE, CONTACT, frontOn, gentle} from './poses';
import {Pose} from '../components/Character';
import {NoScaleContext} from '../noScale';
import {StageSizeContext} from '../series/exportCtx';
import {C, FONT} from '../theme';

/** The contact set, front view (the "no hands" look). */
export const EboContactSheet: React.FC = () => (
  <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
    <NoScaleContext.Provider value>
      <AbsoluteFill style={{background: '#F6F0E4'}}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <text x={540} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.ink}>
            EBO · CONTACT POSES
          </text>
          <text x={540} y={140} textAnchor="middle" fontFamily={FONT} fontSize={26} fill="#55505A">
            no hands: the end of the arm lands on him (chin, mouth, cheek, face, the other arm)
          </text>
          {Object.entries(CONTACT).map(([k, p], i) => {
            const x = 270 + (i % 2) * 540;
            const y = 560 + Math.floor(i / 2) * 430;
            return (
              <g key={k}>
                <RigCharacter who="ebo" x={x} y={y} scale={0.68} t={0} noBlink pose={frontOn(gentle(p))} />
                <text x={x} y={y + 52} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={C.ink}>
                  {k}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </NoScaleContext.Provider>
  </StageSizeContext.Provider>
);
