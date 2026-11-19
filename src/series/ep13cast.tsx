import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useMarkerFont} from './filterKit';
import {SketchPage, DoodleChair} from '../components/StickFigures';
import {DoodlePerson} from '../components/DoodleCast';

/** Ep 13 look test: the doodle cast on the sketchbook page (frame 0 = lineup, frame 1 = expressions). */
export const Ep13CastTest: React.FC = () => {
  useMarkerFont();
  const T = (x: number, y: number, s: string) => <text x={x} y={y} textAnchor="middle" fontFamily="EboMarker" fontSize={46} fill="#222">{s}</text>;
  return (
    <AbsoluteFill style={{background: '#FFFDF6'}}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <SketchPage />
        {T(540, 190, 'the doodle cast')}
        <DoodlePerson who="ebo" x={300} y={600} pose={{armR: [125, 25], mouth: 1}} />
        {T(310, 775, 'me (Ebo)')}
        <DoodlePerson who="friend" x={780} y={600} facing={-1} pose={{eyes: 'happy', mouth: 'grin'}} />
        {T(780, 775, 'my friend')}
        <DoodlePerson who="wife" x={300} y={1180} pose={{brows: 'up', mouth: 'flat', armL: [-30, -30], armR: [30, 30]}} />
        {T(310, 1345, 'my wife')}
        <DoodlePerson who="boss" x={780} y={1180} facing={-1} pose={{mouth: 'frown', brows: 'angry'}} />
        {T(780, 1345, 'my boss')}
        <DoodlePerson who="waiter" x={250} y={1720} pose={{armR: [95, -10], mouth: 'smile'}} />
        <DoodlePerson who="guy" x={560} y={1720} facing={-1} pose={{eyes: 'side', mouth: 'flat'}} />
        <DoodlePerson who="ebo" x={840} y={1720} facing={-1} pose={{eyes: 'wide', mouth: 'wobble', brows: 'worried', sweat: true, armR: [115, 40], armL: [-115, -40]}} />
        <DoodleChair x={980} y={1720} />
        {T(540, 1880, 'waiter · random guy · "sorry, chair"')}
      </svg>
    </AbsoluteFill>
  );
};
