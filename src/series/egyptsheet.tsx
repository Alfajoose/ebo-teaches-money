import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {StageSizeContext} from './exportCtx';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {useMarkerFont} from './filterKit';
import {OfficeSet, OfficeDesk} from '../components/SorryProps';
import {ChamberSet, Crook, FLOOR, Jug, NileVillageSet, OUTFIT, Platter, Reed, RoyalCouch, Throne, ThroneRoomSet} from '../components/EgyptProps';

/** Egypt short: costume and set sheet (frame 0 = costumes in 4 views, 1-4 = the sets with the cast). */
type Dress = React.ComponentProps<typeof RigCharacter>['dress'];
const R: React.FC<{who: CastId; x: number; y?: number; s?: number; view?: number; facing?: 1 | -1; dress?: Dress; p?: Partial<Pose>; hold?: React.ReactNode}> = ({who, x, y = FLOOR, s = 1.2, view = 1, facing = 1, dress, p = {}, hold}) => (
  <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={0} noBlink dress={dress} pose={{...(POSES.standing as Pose), view, ...p} as Pose}>{hold}</RigCharacter>
);
const SHEETS: (() => React.ReactNode)[] = [
  () => (
    <g>
      <rect x={-300} y={-300} width={1680} height={2600} fill="#FFFDF6" />
      {([['boss', OUTFIT.pharaoh], ['etoo', OUTFIT.physician], ['mica', OUTFIT.villager], ['konka', OUTFIT.villagerB]] as [CastId, Dress][]).map(([who, d], r) =>
        [1, 0, 4, 3].map((v, c) => <R key={`${r}${c}`} who={who} x={150 + c * 260} y={470 + r * 460} s={0.75} view={v} dress={d} />),
      )}
    </g>
  ),
  () => <g><ThroneRoomSet /><Throne x={540} /><R who="boss" x={540} y={FLOOR - 80} dress={OUTFIT.pharaoh} hold={<g transform="scale(0.8)"><Crook /></g>} /><g transform={`translate(860 ${FLOOR - 300})`}><Platter /></g></g>,
  () => <g><ChamberSet /><RoyalCouch x={640} /><R who="boss" x={640} y={FLOOR - 140} s={1.0} view={0} dress={OUTFIT.pharaoh} p={{eyes: 'wide', mouth: 'o'}} /><R who="etoo" x={230} view={0} dress={OUTFIT.physician} hold={<g transform="scale(0.9)"><Reed /></g>} /><g transform={`translate(380 ${FLOOR})`}><Jug /></g></g>,
  () => <g><NileVillageSet /><R who="mica" x={360} view={0} dress={OUTFIT.villager} hold={<g transform="scale(0.9)"><Reed long /></g>} /><R who="konka" x={760} view={0} facing={-1} dress={OUTFIT.villagerB} /></g>,
  () => <g><OfficeSet /><OfficeDesk x={680} /><R who="ebo" x={300} view={1} p={{eyes: 'happy', mouth: 'smile'}} /></g>,
];
export const EgyptSheet: React.FC = () => {
  useMarkerFont();
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <AbsoluteFill style={{background: '#FFFDF6'}}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">{SHEETS[Math.min(f, SHEETS.length - 1)]()}</svg>
        </AbsoluteFill>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
