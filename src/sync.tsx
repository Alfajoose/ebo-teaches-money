import React, {createContext, useContext, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {LINES, TOTAL_FRAMES, FPS} from './timing';

/**
 * Voiceover sync.
 *
 * Scenes are animated against a fixed "design" timeline (timing.ts).
 * A piecewise-linear time map converts the real video frame into a design
 * frame, using one marker per narration line. With no audio the map is the
 * identity. With public/narration.mp3 the markers come from either
 * public/narration-timing.json (exact) or are scaled to the audio length.
 */

export type NarrationTiming = {
  // seconds, one entry per line in timing.ts (same order)
  lines: {start: number; end?: number}[];
};

export type SyncInput = {
  hasAudio: boolean;
  audioDurationInSeconds: number | null;
  timing: NarrationTiming | null;
};

export type TimeMap = {
  toDesign: (realFrame: number) => number;
  toReal: (designFrame: number) => number;
};

const lerpMap = (from: number[], to: number[], x: number) => {
  if (x <= from[0]) return to[0] + (x - from[0]);
  for (let i = 0; i < from.length - 1; i++) {
    if (x <= from[i + 1]) {
      const span = from[i + 1] - from[i];
      const p = span === 0 ? 0 : (x - from[i]) / span;
      return to[i] + p * (to[i + 1] - to[i]);
    }
  }
  return to[to.length - 1] + (x - from[from.length - 1]);
};

const isMonotonic = (arr: number[]) => arr.every((v, i) => i === 0 || v > arr[i - 1]);

export const buildTimeMap = (input: SyncInput | undefined): TimeMap => {
  const identity: TimeMap = {toDesign: (f) => f, toReal: (f) => f};
  if (!input || !input.hasAudio) return identity;

  const design = [0, ...LINES.map((l) => l.start), TOTAL_FRAMES];
  let real: number[] | null = null;

  if (input.timing && input.timing.lines.length === LINES.length) {
    real = [0, ...input.timing.lines.map((l) => l.start * FPS), TOTAL_FRAMES];
  } else if (input.audioDurationInSeconds) {
    const lastEnd = LINES[LINES.length - 1].end;
    const scale = Math.min(1, (input.audioDurationInSeconds * FPS) / lastEnd);
    real = [0, ...LINES.map((l) => l.start * scale), TOTAL_FRAMES];
  }

  if (!real || !isMonotonic(real) || real[real.length - 2] >= TOTAL_FRAMES) return identity;
  const r = real;
  return {
    toDesign: (f) => lerpMap(r, design, f),
    toReal: (f) => lerpMap(design, r, f),
  };
};

const SyncContext = createContext<TimeMap>(buildTimeMap(undefined));
const SceneContext = createContext<{designStart: number; realStart: number}>({
  designStart: 0,
  realStart: 0,
});

export const SyncProvider: React.FC<{map: TimeMap; children: React.ReactNode}> = ({map, children}) => (
  <SyncContext.Provider value={map}>{children}</SyncContext.Provider>
);

export const SceneProvider: React.FC<{
  designStart: number;
  realStart: number;
  children: React.ReactNode;
}> = ({designStart, realStart, children}) => {
  const value = useMemo(() => ({designStart, realStart}), [designStart, realStart]);
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
};

export const useTimeMap = () => useContext(SyncContext);

/** Absolute design frame (0–1740), voiceover-synced. */
export const useDesignFrame = () => {
  const frame = useCurrentFrame();
  const {toDesign} = useTimeMap();
  const {realStart} = useContext(SceneContext);
  return toDesign(frame + realStart);
};

/** Scene-local design frame. Use this in every scene instead of raw frames. */
export const useSceneFrame = () => {
  const abs = useDesignFrame();
  const {designStart} = useContext(SceneContext);
  return abs - designStart;
};
