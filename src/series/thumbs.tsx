import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
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

/**
 * Ep5 "Never Run Out of Things to Say": the awkward silence. Ama waits, smiling; Ebo is frozen with
 * nothing to say; a lone cricket on the floor between them. Handwritten "Chicago?" hints at the fix.
 */
const MARKER5 = 'EboMarker';
const useMarker5 = () => {
  const [handle] = React.useState(() => (typeof document === 'undefined' ? null : delayRender('marker font')));
  React.useEffect(() => {
    if (handle === null) return;
    const f = new FontFace(MARKER5, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`);
    f.load().then((ff) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};
const EBO_FROZEN = gentle(frontOn({...POSE.shocked, eyes: 'wide', mouth: 'grimace', lookX: 28, lookY: 0, headTilt: -4, armL: [14, 6], armR: [14, 6]}));
const AMA_WAITING = {...POSES.standing, eyes: 'open' as const, mouth: 'smile' as const, armL: [12, 6] as [number, number], armR: [12, 6] as [number, number]};

const Cricket: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    {/* back legs, folded */}
    <path d="M -10 -6 L 22 -40 L 40 0" fill="none" />
    <path d="M -20 -4 L 6 -34 L 22 2" fill="none" />
    {/* front legs */}
    <path d="M -40 -8 L -50 4 M -30 -6 L -34 6" fill="none" />
    {/* body and head */}
    <ellipse cx={-10} cy={-16} rx={34} ry={14} fill="#5E7A2E" />
    <circle cx={-46} cy={-20} r={11} fill="#4A6324" />
    <circle cx={-50} cy={-23} r={3} fill={C.ink} />
    {/* antennae */}
    <path d="M -52 -28 Q -80 -70 -40 -86 M -48 -30 Q -60 -80 -14 -84" fill="none" strokeWidth={3} />
  </g>
);

const Title5: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => (
  <g fontFamily={FONT} fontWeight={900} textAnchor="middle">
    {[
      ['NOTHING', C.ink, 0],
      ['TO SAY?', '#E5484D', 1],
    ].map(([t, fill, i]) => (
      <text key={t as string} x={x} y={y + (i as number) * size * 1.02} fontSize={size} fill={fill as string} stroke="#fff" strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round" letterSpacing={1}>
        {t}
      </text>
    ))}
  </g>
);
const Word5: React.FC<{x: number; y: number; size: number; text: string; rot: number; red?: boolean}> = ({x, y, size, text, rot, red}) => (
  <text transform={`translate(${x} ${y}) rotate(${rot})`} textAnchor="middle" fontFamily={MARKER5} fontSize={size} fill={red ? '#E5484D' : C.ink} stroke="#fff" strokeWidth={size * 0.14} paintOrder="stroke" strokeLinejoin="round">
    {text}
  </text>
);

export const Ep05ThumbVertical: React.FC = () => {
  useMarker5();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <AbsoluteFill style={{background: '#D2C4EE'}}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            <g transform="translate(540 960) scale(1.6) translate(-540 -960)">
              <Backdrop id="thumb5v" />
            </g>
            <RigCharacter who="ama" x={830} y={1640} scale={1.75} facing={-1} t={0} pose={AMA_WAITING} noBlink />
            <RigCharacter who="ebo" x={330} y={1820} scale={2.5} t={0} pose={EBO_FROZEN} noBlink />
            <Cricket x={610} y={1830} s={1.7} />
            <Word5 x={780} y={640} size={84} text="…Chicago?" rot={-6} />
            <Title5 x={540} y={250} size={150} />
          </svg>
        </AbsoluteFill>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const Ep05ThumbWide: React.FC = () => {
  useMarker5();
  return (
    <StageSizeContext.Provider value={{w: 1280, h: 720}}>
      <NoScaleContext.Provider value>
        <AbsoluteFill style={{background: '#D2C4EE'}}>
          <svg viewBox="0 0 1280 720" width="100%" height="100%">
            <g transform="translate(640 360) scale(1.4) translate(-640 -360)">
              <Backdrop id="thumb5w" />
            </g>
            <RigCharacter who="ama" x={1090} y={860} scale={1.05} facing={-1} t={0} pose={AMA_WAITING} noBlink />
            <RigCharacter who="ebo" x={300} y={1000} scale={1.45} t={0} pose={EBO_FROZEN} noBlink />
            <Cricket x={760} y={705} s={1.1} />
            <Word5 x={1000} y={300} size={52} text="…Chicago?" rot={-6} />
            <Title5 x={700} y={130} size={100} />
          </svg>
        </AbsoluteFill>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
