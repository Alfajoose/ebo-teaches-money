import type {CastId} from './castConfig';
import eboRun from './data/cycles/ebo-run.json';
import christyWalk from './data/cycles/christy-walk.json';
import christyFastWalk from './data/cycles/christy-fastwalk.json';
import obuorFastWalk from './data/cycles/obuor-fastwalk.json';
import micaFastWalk from './data/cycles/mica-fastwalk.json';

/**
 * Walk / run cycles from the user's own Animate files (cast/cycles/*.fla), copied onto the
 * current characters by cast/tools/export_cycle.py: body-part rotations and pivots only —
 * faces, outfits and art stay each character's own. Held keys at 24 fps, looping in place;
 * move the character across the set yourself (see `speed`).
 */
export type Cycle = {source: string; fps: number; frames: number; layers: Record<string, number[][]>};
export type CycleName = 'walk' | 'fastWalk' | 'run';

export const CYCLES: Partial<Record<CastId, Partial<Record<CycleName, Cycle>>>> = {
  ebo: {run: eboRun as Cycle},
  christy: {walk: christyWalk as Cycle, fastWalk: christyFastWalk as Cycle},
  obuor: {fastWalk: obuorFastWalk as Cycle},
  mica: {fastWalk: micaFastWalk as Cycle},
};

export const getCycle = (who: CastId, name: CycleName): Cycle => {
  const c = CYCLES[who]?.[name];
  if (!c) throw new Error(`${who} has no ${name} cycle (has: ${Object.keys(CYCLES[who] ?? {}).join(', ') || 'none'})`);
  return c;
};

/** Cycle frame for a video frame `t` at `videoFps` — the cycle keeps its own 24 fps timing. */
export const cycleFrame = (c: Cycle, t: number, videoFps = 30) => Math.floor((t * c.fps) / videoFps) % c.frames;
