import React from 'react';
import {Pose, POSES} from '../components/Character';
import {SITTING} from '../castep/shared';
import {CastId} from './castConfig';
import {PoseGrid} from './PoseSheet';
import {POSE_GROUPS} from './poses';

/** The poses the episodes used before the library was organised (base POSES + per-episode gestures). */
const OLD: [string, Pose][] = [
  ...(Object.entries(POSES) as [string, Pose][]),
  ['sitting', SITTING],
  ['idle', {...POSES.standing, armL: [10, 6], armR: [12, 8]}],
  ['point', {...POSES.standing, armR: [95, -8], armL: [12, 6], brows: 'up'}],
  ['present', {...POSES.standing, armR: [70, -35], armL: [18, 10], brows: 'up'}],
  ['raise', {...POSES.standing, armR: [165, 0], armL: [12, 6], brows: 'up'}],
  ['open', {...POSES.standing, armL: [62, -30], armR: [62, -30]}],
  ['hips', {...POSES.standing, armL: [38, -110], armR: [38, -110], brows: 'up'}],
  ['shrug', {...POSES.standing, armL: [72, -72], armR: [72, -72], headTilt: 8, brows: 'up'}],
  ['hold', {...POSES.standing, armR: [70, -20], armL: [14, 8]}],
  ['lying', {...POSES.sleeping, tilt: -90, lift: -60, eyes: 'open', mouth: 'flat'}],
];

export const PoseSheetOld: React.FC<{who?: CastId}> = ({who = 'ebo'}) => <PoseGrid who={who} poses={OLD} cols={7} title="Pose library today (21)" />;

const B = POSES.standing;
const cal = (label: string, extra: Partial<Pose>): [string, Pose] => [label, {...B, ...extra}];
/** Calibration: how the rig answers each joint angle. */
export const PoseSheetCal: React.FC = () => (
  <PoseGrid
    who="ebo"
    cols={8}
    title="Calibration: armR [shoulder, elbow] · legs [hip, knee]"
    poses={[
      cal('R 0,0', {armR: [0, 0]}),
      cal('R 45,0', {armR: [45, 0]}),
      cal('R 90,0', {armR: [90, 0]}),
      cal('R 135,0', {armR: [135, 0]}),
      cal('R 180,0', {armR: [180, 0]}),
      cal('R 90,-90', {armR: [90, -90]}),
      cal('R 90,+90', {armR: [90, 90]}),
      cal('R 30,-130', {armR: [30, -130]}),
      cal('R 30,+130', {armR: [30, 130]}),
      cal('R 150,-120', {armR: [150, -120]}),
      cal('R 150,+120', {armR: [150, 120]}),
      cal('L 90,0', {armL: [90, 0]}),
      cal('L 90,-90', {armL: [90, -90]}),
      cal('L 30,-130', {armL: [30, -130]}),
      cal('L 30,+130', {armL: [30, 130]}),
      cal('R -40,0', {armR: [-40, 0]}),
      cal('legL 45,0', {legL: [45, 0]}),
      cal('legL 45,60', {legL: [45, 60]}),
      cal('legR -30,0', {legR: [-30, 0]}),
      cal('legs 90,90', {legL: [90, 90], legR: [90, 90]}),
      cal('tilt 15', {tilt: 15}),
      cal('headTilt 12', {headTilt: 12}),
      cal('lift 40', {lift: 40}),
      cal('look 14,10', {lookX: 14, lookY: 10}),
    ]}
  />
);

const TITLES: Record<string, string> = {stand: 'Standing', talk: 'Talking & gestures', emotion: 'Emotions', sit: 'Sitting', lie: 'Lying', action: 'Actions', hands: 'Hand to face (Ebo)', front: 'Front & shy views (Ebo)', back: 'Back view (Ebo)'};
/** One group of the pose library on one character. */
export const PoseSheetGroup: React.FC<{group: keyof typeof POSE_GROUPS; who?: CastId}> = ({group, who = 'ebo'}) => {
  const poses = Object.entries(POSE_GROUPS[group]) as [string, Pose][];
  return <PoseGrid who={who} poses={poses} cols={Math.min(7, Math.max(4, Math.ceil(poses.length / 2)))} title={`${TITLES[group]} (${poses.length})`} />;
};
