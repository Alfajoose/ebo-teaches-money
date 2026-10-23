import type {Eyes, Mouth} from '../components/Character';
import ebo from './data/ebo.json';
import mica from './data/mica.json';
import obuor from './data/obuor.json';
import ama from './data/ama.json';
import christy from './data/christy.json';

/**
 * The show's cast, exported from the user's .fla files (cast/tools/export_rig.py).
 * Frame numbers are the 0-based "First frame" of each swap symbol — see cast/CAST.md.
 */

export type RigData = {
  symbol: string;
  layers: {name: string; rig: string | null; parent: string | null; m: number[]; tp: number[]; first: number; frames: string[]}[];
};

export type CastId = 'ebo' | 'mica' | 'obuor' | 'ama' | 'christy';

export type CastConfig = {
  name: string;
  rig: RigData;
  scale: number; // rig units → show pixels (static, never animated)
  eyeLayers: string[];
  eyes: Record<Eyes, number | number[]>; // one frame for all eye layers, or one per layer
  mouth: Record<Mouth, number | number[]>; // arrays alternate every 4 frames (wobble, snore)
  hide: string[];
  outfit?: Record<string, number>;
  blinkOffset: number;
};

// Ebo & Christy share the 7-frame eye set; Ama, Mica & Obuor share the 5-frame set.
const EYES_7: CastConfig['eyes'] = {open: 0, closed: 2, wide: 4, happy: 6, half: 1, sad: 5, dollar: 4, squint: 6};
const EYES_5: CastConfig['eyes'] = {open: 0, closed: 2, wide: 1, happy: 2, half: 0, sad: 0, dollar: 1, squint: 2};

// mouth sets — A: 0 rest, 1 wide open, 2 mid open, 3 O.   B: 0 smile, 1 flat open, 2 O, 3 big open
const MOUTH_A: CastConfig['mouth'] = {smile: 0, grin: 1, o: 3, scream: 1, frown: 0, flat: 0, wobbly: [0, 2], smirk: 0, snore: [3, 0]};
const MOUTH_B: CastConfig['mouth'] = {smile: 0, grin: 3, o: 2, scream: 3, frown: 1, flat: 1, wobbly: [1, 0], smirk: 0, snore: [2, 1]};

const S = 0.68; // one shared factor keeps the cast's relative heights as drawn

export const CAST: Record<CastId, CastConfig> = {
  ebo: {name: 'Ebo', rig: ebo as RigData, scale: S, eyeLayers: ['pupil_1', 'pupil_2'], eyes: EYES_7, mouth: MOUTH_A, hide: [], blinkOffset: 0},
  mica: {name: 'Mica', rig: mica as RigData, scale: S, eyeLayers: ['eye_1', 'eye_2'], eyes: EYES_5, mouth: MOUTH_B, hide: [], blinkOffset: 23},
  obuor: {name: 'Obuor', rig: obuor as RigData, scale: S, eyeLayers: ['eye_1', 'eye_2'], eyes: EYES_5, mouth: MOUTH_B, hide: [], blinkOffset: 41},
  ama: {name: 'Ama', rig: ama as RigData, scale: S, eyeLayers: ['eye_1', 'eye_2'], eyes: EYES_5, mouth: MOUTH_A, hide: [], blinkOffset: 57},
  // Christy's eye_1 layer holds both eyes (exported as eye_1 + eye_1__2); her eye_2 layer is a stray copy parked off-canvas.
  christy: {name: 'Christy', rig: christy as RigData, scale: S, eyeLayers: ['eye_1', 'eye_1__2'], eyes: EYES_7, mouth: MOUTH_A, hide: ['eye_2'], blinkOffset: 71},
};
