import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RigCharacter} from '../cast/RigCharacter';
import {POSES} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {C, FONT} from '../theme';
import {NoScaleContext} from '../noScale';
import {StageSizeContext} from './exportCtx';

/**
 * Thumbnails / covers. Short 01 (Ebo): "Can't control your lust?" — Ebo up close, caught: eyes wide,
 * looking sideways at Christy walking into frame. Same cast, backdrop and type as the Short.
 * Vertical cover (1080×1920, the Shorts frame) and a 16:9 version (1280×720).
 */
const EBO_CAUGHT = gentle(frontOn({...POSE.shocked, eyes: 'wide', mouth: 'o', lookX: 30, lookY: -4, headTilt: 8}));
const CHRISTY = {...POSES.standing, eyes: 'happy' as const, mouth: 'smile' as const};

const Title: React.FC<{x: number; y: number; size: number; anchor?: 'start' | 'middle'}> = ({x, y, size, anchor = 'middle'}) => (
  <g fontFamily={FONT} fontWeight={900} textAnchor={anchor}>
    {[
      ["CAN'T CONTROL", C.ink, 0],
      ['YOUR LUST?', '#E5484D', 1],
    ].map(([t, fill, i]) => (
      <text key={t as string} x={x} y={y + (i as number) * size * 1.02} fontSize={size} fill={fill as string} stroke="#fff" strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round" letterSpacing={1}>
        {t}
      </text>
    ))}
  </g>
);

export const Short01ThumbVertical: React.FC = () => (
  <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
    <NoScaleContext.Provider value>
      <AbsoluteFill style={{background: '#D2C4EE'}}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <g transform="translate(540 960) scale(1.6) translate(-540 -960)">
            <Backdrop id="thumbv" />
          </g>
          {/* Christy walking in from the right, half out of frame */}
          <RigCharacter who="christy" x={900} y={1560} scale={1.9} facing={-1} t={0} pose={CHRISTY} noBlink />
          {/* Ebo, close, caught looking */}
          <RigCharacter who="ebo" x={380} y={2300} scale={3.0} t={0} pose={EBO_CAUGHT} noBlink />
          <Title x={540} y={250} size={112} />
        </svg>
      </AbsoluteFill>
    </NoScaleContext.Provider>
  </StageSizeContext.Provider>
);

export const Short01ThumbWide: React.FC = () => (
  <StageSizeContext.Provider value={{w: 1280, h: 720}}>
    <NoScaleContext.Provider value>
      <AbsoluteFill style={{background: '#D2C4EE'}}>
        <svg viewBox="0 0 1280 720" width="100%" height="100%">
          <g transform="translate(640 360) scale(1.4) translate(-640 -360)">
            <Backdrop id="thumbw" />
          </g>
          <RigCharacter who="christy" x={1080} y={900} scale={1.05} facing={-1} t={0} pose={CHRISTY} noBlink />
          <RigCharacter who="ebo" x={340} y={1080} scale={1.6} t={0} pose={EBO_CAUGHT} noBlink />
          <Title x={640} y={105} size={84} />
        </svg>
      </AbsoluteFill>
    </NoScaleContext.Provider>
  </StageSizeContext.Provider>
);
