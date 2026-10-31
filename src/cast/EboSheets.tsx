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
      P('view 0 (¾)', {view: 0}),
      P('view 1 (front)', {view: 1}),
      P('view 2 (hands in)', {view: 2}),
      P('view 3 (back)', {view: 3}),
      P('v1 arms out', {view: 1, armL: [80, -20], armR: [80, -20]}),
      P('v3 back wave', {view: 3, armR: [130, 30]}),
      P('F 180,+0', {armFront: true, armR: [180, 0]}),
      P('F 175,+40', {armFront: true, armR: [175, 40]}),
      P('F 170,+80', {armFront: true, armR: [170, 80]}),
      P('F 160,+100', {armFront: true, armR: [160, 100]}),
      P('F 190,+60', {armFront: true, armR: [190, 60]}),
      P('F 200,+90', {armFront: true, armR: [200, 90]}),
      P('L 180,+40', {armL: [180, 40]}),
      P('L 165,+80', {armL: [165, 80]}),
      P('v1 F 170,+60', {view: 1, armR: [170, 60]}),
      P('v1 F 160,+110', {view: 1, armR: [160, 110]}),
      P('v1 L 170,+60', {view: 1, armL: [170, 60]}),
      P('v1 both 170,+60', {view: 1, armL: [170, 60], armR: [170, 60]}),
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
