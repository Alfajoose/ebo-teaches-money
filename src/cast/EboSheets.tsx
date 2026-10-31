import React from 'react';
import {Pose, POSES, Eyes, Mouth} from '../components/Character';
import {PoseGrid} from './PoseSheet';

/** Review sheets for Ebo's new master: his four views, the in-front arm, and every face. */
const B = {...POSES.standing, armL: [10, 6], armR: [10, 6]} as Pose;
const P = (label: string, x: Partial<Pose>): [string, Pose] => [label, {...B, ...x}];

export const EboViewsSheet: React.FC = () => (
  <PoseGrid
    who="ebo"
    cols={9}
    title="Ebo · views and the in-front arm"
    poses={[
      P('L 140,-10', {armL: [140, -10]}),
      P('L 120,-40', {armL: [120, -40]}),
      P('L 100,-60', {armL: [100, -60]}),
      P('L 100,+60', {armL: [100, 60]}),
      P('L 110,-90', {armL: [110, -90]}),
      P('L 90,-100', {armL: [90, -100]}),
      P('L 80,-120', {armL: [80, -120]}),
      P('L 125,-70', {armL: [125, -70]}),
      P('L 160,-30', {armL: [160, -30]}),
      P('both 90,-100', {armL: [90, -100], armR: [138, -12]}),
      P('both 80,-120', {armL: [80, -120], armR: [138, -12]}),
      P('v1 L 100,-60', {view: 1, armL: [100, -60], armR: [100, -60]}),
    ]}
  />
);

const EYES: Eyes[] = ['open', 'wide', 'happy', 'half', 'sad', 'squint', 'angry', 'suspicious', 'tired', 'squeeze', 'closed'];
const MOUTHS: Mouth[] = ['smile', 'grin', 'teeth', 'laugh', 'o', 'scream', 'frown', 'flat', 'smirk', 'grimace', 'wobbly'];
export const EboFacesSheet: React.FC<{part: 'eyes' | 'mouths'}> = ({part}) => (
  <PoseGrid
    who="ebo"
    cols={6}
    title={part === 'eyes' ? 'Ebo · eyes' : 'Ebo · mouths'}
    poses={part === 'eyes' ? EYES.map((e) => P(e, {eyes: e, mouth: 'smile', view: 1})) : MOUTHS.map((m) => P(m, {mouth: m, view: 1}))}
  />
);
