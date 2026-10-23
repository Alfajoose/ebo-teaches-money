import React, {createContext, useContext} from 'react';

/**
 * Hand-drawn look for props: a slight, *static* waver on every line (inked by hand)
 * plus a light crayon grain inside the fills. The noise seed never changes, so the
 * lines don't boil or shimmer — it's a drawing style, not an effect.
 *
 * Turn on with <HandDrawnContext.Provider value>; prop components wrap themselves in
 * <Rough>. Nested props (cans inside the machine) are only filtered once.
 */
export const HandDrawnContext = createContext(false);

export const HAND_DRAWN = {
  wobble: 4.5, // how far lines waver (world units)
  wobbleFreq: 0.018, // waviness along a line (lower = longer, softer waves)
  grain: 0.13, // crayon texture strength inside fills (0–1)
};

export const HandDrawnDefs: React.FC = () => (
  <filter id="hd-rough" x="-4%" y="-4%" width="108%" height="108%" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency={HAND_DRAWN.wobbleFreq} numOctaves={1} seed={11} result="warp" />
    <feDisplacementMap in="SourceGraphic" in2="warp" scale={HAND_DRAWN.wobble} xChannelSelector="R" yChannelSelector="G" result="inked" />
    <feTurbulence type="fractalNoise" baseFrequency="0.55 0.9" numOctaves={2} seed={4} result="tooth" />
    <feColorMatrix
      in="tooth"
      type="matrix"
      values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${(HAND_DRAWN.grain * 4).toFixed(3)} 0 0 0 ${(-HAND_DRAWN.grain * 1.9).toFixed(3)}`}
      result="grain"
    />
    <feComposite in="grain" in2="inked" operator="in" result="grainInside" />
    <feMerge>
      <feMergeNode in="inked" />
      <feMergeNode in="grainInside" />
    </feMerge>
  </filter>
);

/** Wrap a prop's drawing so it renders hand-drawn when the style is on. */
export const Rough: React.FC<{children: React.ReactNode}> = ({children}) => {
  const on = useContext(HandDrawnContext);
  if (!on) return <>{children}</>;
  return (
    <g filter="url(#hd-rough)">
      <HandDrawnContext.Provider value={false}>{children}</HandDrawnContext.Provider>
    </g>
  );
};
