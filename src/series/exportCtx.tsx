import React, {createContext, useContext} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Easing, interpolate} from 'remotion';

/**
 * Export support for turning an episode into an Adobe Animate .fla.
 *
 * - `LayerModeContext`: what a render draws.
 *     'full' — the normal video.
 *     'set'  — only the set (walls, furniture, plants): no props, characters, graphics or
 *              captions. Rendered to the Animate "Background" image layer.
 *     'bg'   — set + props baked together (how Episode 1's first export was made).
 *   Props are captured separately as vector symbols for the Animate "Props" layers.
 * - `CaptureContext`: when present, characters, graphics and captions report what they
 *   draw on the current frame, so scripts/export-fla can rebuild them as editable
 *   Animate layers (rig keyframes, vector graphics, text).
 */

export type M6 = [number, number, number, number, number, number];
export const IDENT: M6 = [1, 0, 0, 1, 0, 0];
export const mmul = (m1: M6, m2: M6): M6 => {
  const [a1, b1, c1, d1, x1, y1] = m1;
  const [a2, b2, c2, d2, x2, y2] = m2;
  return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1];
};
export const T = (x: number, y: number): M6 => [1, 0, 0, 1, x, y];
export const S = (x: number, y: number): M6 => [x, 0, 0, y, 0, 0];
export const R = (deg: number, cx = 0, cy = 0): M6 => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return mmul(T(cx, cy), mmul([c, s, -s, c, 0, 0], T(-cx, -cy)));
};

export type CharRecord = {who: string; outer: M6; locals: Record<string, M6>; frames: Record<string, number>; hidden?: string[]};
export type GraphicRecord = {key: string; matrix: M6; alpha: number; svg: string};
/** A prop on this frame: `svg` is its drawing in its own coordinates, `matrix` places it on screen. */
export type PropRecord = {name: string; key: string; matrix: M6; svg: string; front: boolean};
/**
 * What the Background layer shows on this frame: the screen-space backdrop, the set drawn in
 * world space with the camera matrix that frames it, and the vignette on top.
 */
type SvgPart = {key: string; svg: string};
export type BackgroundRecord = {back: SvgPart; world: SvgPart; cam: M6; front: SvgPart};
export type Capture = {chars: CharRecord[]; graphics: GraphicRecord[]; props: PropRecord[]; caption: string | null; background?: BackgroundRecord};
export type LayerMode = 'full' | 'set' | 'bg';

export const CaptureContext = createContext<Capture | null>(null);
export const CameraContext = createContext<M6>(IDENT);
/** Frame size of the episode: 1080×1920 for the vertical Shorts, 1920×1080 for long-form. */
export const StageSizeContext = createContext<{w: number; h: number}>({w: 1080, h: 1920});
export const useStageSize = () => useContext(StageSizeContext);
export const LayerModeContext = createContext<LayerMode>('full');

export const useCapture = () => useContext(CaptureContext);
export const useLayerMode = () => useContext(LayerModeContext);

export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
};

/** Parse an SVG transform list (translate / rotate / scale / matrix) into a matrix. */
export const parseTransform = (str: string): M6 => {
  let m = IDENT;
  for (const [, fn, args] of str.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (fn === 'translate') m = mmul(m, T(v[0], v[1] ?? 0));
    else if (fn === 'scale') m = mmul(m, S(v[0], v[1] ?? v[0]));
    else if (fn === 'rotate') m = mmul(m, R(v[0], v[1] ?? 0, v[2] ?? 0));
    else if (fn === 'matrix') m = mmul(m, v as M6);
  }
  return m;
};

/**
 * A transformed group inside a shot. Use this instead of a bare `<g transform>` around
 * props, so the Animate export knows where they sit on screen.
 */
export const Place: React.FC<{m: M6; children: React.ReactNode}> = ({m, children}) => {
  const cam = useContext(CameraContext);
  return (
    <CameraContext.Provider value={mmul(cam, m)}>
      <g transform={`matrix(${m.join(',')})`}>{children}</g>
    </CameraContext.Provider>
  );
};

/** Graphic that slams in from above with a twist (translation + rotation only). */
export const Slam: React.FC<{t: number; at: number; dist?: number; twist?: number; children: React.ReactNode}> = ({
  t,
  at,
  dist = -260,
  twist = -14,
  children,
}) => {
  const cap = useCapture();
  const mode = useLayerMode();
  const {w} = useStageSize();
  if (mode !== 'full' || t < at) return null;
  const u = interpolate((t - at) * 30, [0, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2.2))});
  const matrix = mmul(T(0, (1 - u) * dist), R((1 - u) * twist, w / 2, 0));
  if (cap) {
    const svg = renderToStaticMarkup(<g>{children}</g>);
    cap.graphics.push({key: `${at.toFixed(3)}:${hash(svg)}`, matrix, alpha: 1, svg});
  }
  return <g transform={`matrix(${matrix.join(',')})`}>{children}</g>;
};

/** A graphic that just sits on screen (no motion). */
export const Still: React.FC<{children: React.ReactNode}> = ({children}) => {
  const cap = useCapture();
  const mode = useLayerMode();
  if (mode !== 'full') return null;
  if (cap) {
    const svg = renderToStaticMarkup(<g>{children}</g>);
    cap.graphics.push({key: `still:${hash(svg)}`, matrix: IDENT, alpha: 1, svg});
  }
  return <g>{children}</g>;
};
