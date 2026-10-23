import React from 'react';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {POSES, Pose, PoseName} from '../components/Character';

/** Ebo, the main character, with the same props the scenes used for Benny. */
export const Hero: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose | PoseName;
  t?: number;
  beard?: number; // ignored: not part of Ebo's design
  who?: CastId;
  children?: React.ReactNode;
}> = ({pose = 'standing', who = 'ebo', beard: _beard, ...rest}) => (
  <RigCharacter who={who} pose={typeof pose === 'string' ? POSES[pose] : pose} {...rest} />
);

/** Office customers, cycling through the supporting cast. */
export const CUSTOMERS: CastId[] = ['mica', 'obuor', 'ama', 'christy'];

/** Fly-in helper (replaces scale "pops"): 0→1 progress becomes a drop + twist + fade. */
export const flyIn = (p: number, dist = -260, twist = -25) => ({
  transform: `translate(0 ${(1 - p) * dist}) rotate(${(1 - p) * twist})`,
  opacity: Math.max(0, Math.min(1, p * 1.6)),
});
