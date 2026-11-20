import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {StageSizeContext} from './exportCtx';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {
  AutoDoorSet, AutoDoors, BigCouch, Briefcase, CafeCounter, CafeSet, DressShoe, FLOOR, KitchenSet, KitchenTable, LivingRoomSet, Mug, Notepad,
  OfficeDesk, OfficeSet, Papers, RestaurantSet, RestaurantTable, ShoulderBag, SidewalkSet, Smartphone, Sneaker, StompClose, WaterGlass,
} from '../components/SorryProps';

/** Ep 13 props sheet: each set from the reference storyboard with the cast in it for scale, then the hand props. */
const R: React.FC<{who: CastId; x: number; y?: number; s?: number; p?: Partial<Pose>; facing?: 1 | -1}> = ({who, x, y = FLOOR, s = 1.1, p = {}, facing = 1}) => {
  const front = who === 'ebo' || who === 'ama';
  const pose = {...(front ? POSE.stand : (POSES.standing as Pose)), ...p} as Pose;
  return <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={0} noBlink pose={front ? gentle(frontOn(pose)) : gentle(pose)} />;
};
export const EP13_PROP_SHEETS: (() => React.ReactNode)[] = [
  () => <g><SidewalkSet /><R who="ebo" x={330} /><R who="ama" x={700} /></g>,
  () => <g><SidewalkSet dusk /><R who="ebo" x={330} p={{eyes: 'happy'}} /><R who="obuor" x={780} facing={-1} /></g>,
  () => <StompClose />,
  () => <g><RestaurantSet /><R who="ebo" x={300} p={{...POSE.wave}} /><R who="mica" x={850} facing={-1} /><RestaurantTable x={560} /></g>,
  () => <g><OfficeSet /><R who="christy" x={680} facing={-1} /><OfficeDesk x={680} /><R who="ebo" x={220} /></g>,
  () => <g><KitchenSet /><R who="ama" x={300} /><R who="ebo" x={790} /><KitchenTable x={540} mug={-60} /></g>,
  () => <g><LivingRoomSet /><BigCouch /><R who="ebo" x={540} s={0.6} y={FLOOR - 230} /></g>,
  () => <g><AutoDoorSet /><AutoDoors open={0.5} /><R who="ebo" x={540} p={{...POSE.shocked}} /></g>,
  () => <g><CafeSet /><R who="mica" x={720} facing={-1} /><CafeCounter x={700} /><R who="ebo" x={180} /></g>,
  () => (
    <g>
      <rect x={-300} y={-300} width={1680} height={2600} fill="#FFFDF6" />
      <g transform="translate(300 380) scale(1.3)"><DressShoe /></g>
      <g transform="translate(780 380) scale(1.3)"><Sneaker /></g>
      <g transform="translate(250 780) scale(1.6)"><Notepad /></g>
      <g transform="translate(560 860) scale(1.8)"><Mug /></g>
      <g transform="translate(850 880) scale(1.8)"><WaterGlass coaster /></g>
      <g transform="translate(250 1260) scale(1.8)"><Smartphone /></g>
      <g transform="translate(560 1260) scale(1.8)"><Smartphone down /></g>
      <g transform="translate(860 1240) scale(2)"><Papers /></g>
      <g transform="translate(330 1720) scale(1.6)"><Briefcase /></g>
      <g transform="translate(760 1720) scale(1.6)"><ShoulderBag /></g>
    </g>
  ),
];
export const Ep13Props: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <svg viewBox="0 0 1080 1920" width="100%" height="100%">{EP13_PROP_SHEETS[Math.min(f, EP13_PROP_SHEETS.length - 1)]()}</svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
