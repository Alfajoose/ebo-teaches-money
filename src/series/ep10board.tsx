import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {POSE, CONTACT, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {StageSizeContext} from './exportCtx';
import {Label, RED, useMarkerFont} from './filterKit';
import {Brick, BrickWall, Bucket, Door, FakeFront, Hammer, House, Plot, PostedPhone, Shout, Storm, Sun, TalkTable} from '../components/HouseProps';
import {Arrow, SayBubble} from '../components/PovertyProps';

/**
 * Ep 10 "Marry a Woman Who…": the storyboard, one panel per frame (no voice yet, so these are stills, not the
 * animated episode). Ebo and his wife (Ama) build one house; next door the neighbours (Mica, Christy) only
 * decorate theirs; a storm hits both.
 */
export const EP10_BOARD_PANELS = 12;
const FLOOR = 1500;

type Look = Partial<Pose>;
const Ebo: React.FC<{x: number; y?: number; s?: number; p?: Look; front?: boolean; hold?: React.ReactNode; touch?: keyof typeof CONTACT}> = ({x, y = FLOOR, s = 1.3, p = {}, front = true, hold, touch}) => {
  let pose = {...POSE.stand, ...p} as Pose;
  if (touch) pose = {...pose, ...CONTACT[touch], ...p, contact: true, view: 1} as Pose;
  return (
    <RigCharacter who="ebo" x={x} y={y} scale={s} t={0} noBlink pose={front ? gentle(frontOn(pose)) : gentle(pose)}>
      {hold}
    </RigCharacter>
  );
};
const Side: React.FC<{who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; hold?: React.ReactNode}> = ({who, x, y = FLOOR, s = 1.3, p = {}, facing = 1, hold}) => (
  <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={0} noBlink pose={gentle({...(POSES.standing as Pose), ...p} as Pose)}>
    {hold}
  </RigCharacter>
);

const Ground: React.FC<{storm?: boolean}> = ({storm}) => (
  <g>
    <rect x={-200} y={FLOOR - 10} width={1480} height={700} fill={storm ? '#6F8F62' : '#A9D18E'} />
    <line x1={-200} y1={FLOOR - 10} x2={1280} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
  </g>
);
const Sky: React.FC<{storm?: boolean}> = ({storm}) => <Backdrop id={storm ? 'ep10-storm' : 'ep10-sky'} shade="sky" night={storm} />;

/** The 12 panels (the script's 12 lines, episodes/ep10/script.md). */
const PANELS: (() => React.ReactNode)[] = [
  // 1 · You can marry a woman for how she looks. Or for how she builds.
  () => (
    <g>
      <Sky />
      <Label x={540} y={360} text="how she looks?" size={90} color="#8A8478" />
      <line x1={330} y1={330} x2={750} y2={330} stroke="#8A8478" strokeWidth={10} strokeLinecap="round" />
      <Label x={540} y={520} text="how she BUILDS" red size={110} rot={-3} />
      <g transform="translate(800 820) rotate(10) scale(1.8)"><Brick /></g>
      <g transform="translate(690 670) rotate(55) scale(0.9)"><Arrow color={RED} /></g>
      <Ebo x={540} y={2350} s={2.6} p={{eyes: 'squint', mouth: 'smirk', armR: [70, -30], brows: 'up'}} />
    </g>
  ),
  // 2 · Because marriage is a house, and you're building it together.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR + 140})`}><Plot /></g>
      <Ebo x={290} p={{eyes: 'happy', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} front={false} />
      <Side who="ama" x={800} facing={-1} p={{eyes: 'happy', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} />
      <Label x={540} y={520} text="one house," size={96} />
      <Label x={540} y={640} text="two builders" red size={96} />
    </g>
  ),
  // 3 · Every kind word is a brick. Every insult is a crack.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR})`}><BrickWall w={360} rows={6} crack /></g>
      <Side who="ama" x={170} p={{eyes: 'happy', mouth: 'smile', armR: [60, -30]}} />
      <Ebo x={910} p={{eyes: 'half', mouth: 'smirk', lookX: -10}} />
      <g transform="translate(300 700)"><SayBubble a="Proud of you!" size={56} w={440} /></g>
      <g transform="translate(430 980) rotate(-8) scale(1.2)"><Brick /></g>
      <g transform="translate(400 880) rotate(70) scale(0.6)"><Arrow /></g>
      <g transform="translate(780 560) scale(-1 1)"><SayBubble a="" size={52} w={440} /></g>
      <Label x={780} y={578} text="Ugh. Whatever." size={52} />
      <g transform="translate(680 980) rotate(110) scale(0.6)"><Arrow color={RED} /></g>
      <Label x={290} y={420} text="kind word = brick" size={60} />
      <Label x={790} y={330} text="insult = crack" red size={60} />
    </g>
  ),
  // 4 · Marry a woman who works with willing hands. When you both build, the walls go up fast.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR})`}><BrickWall w={460} rows={14} /></g>
      <Ebo x={170} p={{eyes: 'happy', mouth: 'grin', armR: [110, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
      <Side who="ama" x={910} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: [110, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
      <g transform="translate(540 820) rotate(-90)"><Arrow color={RED} /></g>
      <Label x={540} y={360} text="willing hands" red size={100} />
    </g>
  ),
  // 5 · Now look next door. Perfect paint. Fancy curtains. But nobody built the walls.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR})`}><FakeFront side tilt={-4} /></g>
      <Side who="mica" x={260} p={{eyes: 'happy', mouth: 'smile', armR: [60, -30]}} />
      <Side who="christy" x={830} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} />
      <Label x={540} y={420} text="perfect paint." size={80} />
      <Label x={540} y={1650} text="nobody built the walls" red size={74} rot={-2} />
    </g>
  ),
  // 6 · Marry a woman who builds a home, not just decorates a house.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR})`}><House /></g>
      <Ebo x={200} p={{eyes: 'happy', mouth: 'smile'}} />
      <Side who="ama" x={880} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} />
      <Label x={540} y={430} text="a HOME," red size={110} />
      <Label x={540} y={1680} text="not a decorated house" size={70} />
    </g>
  ),
  // 7 · Then one day, the storm comes. Every marriage gets one. Money runs short. The roof starts to leak.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(290 ${FLOOR}) scale(0.62)`}><House leak lights={false} /></g>
      <g transform={`translate(800 ${FLOOR}) scale(0.62)`}><FakeFront tilt={-6} side /></g>
      <g transform="translate(540 420)"><Storm w={1000} /></g>
      <Label x={540} y={760} text="the storm" red size={120} />
      <Label x={540} y={1680} text="every marriage gets one" size={66} />
    </g>
  ),
  // 8 · Next door, they shout. It ends up online. Now the whole street knows… and the wall comes down.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(560 ${FLOOR + 40})`}><FakeFront tilt={-38} side /></g>
      <Side who="mica" x={250} p={{eyes: 'wide', mouth: 'scream', armL: [80, -20], armR: [80, -20]}} />
      <Side who="christy" x={860} facing={-1} p={{eyes: 'angry', mouth: 'scream', armR: [95, -10]}} />
      <g transform="translate(260 760)"><Shout text="YOU!" rotate={-6} /></g>
      <g transform="translate(860 720)"><Shout text="NO, YOU!" rotate={6} /></g>
      <g transform="translate(540 420) scale(0.9)"><PostedPhone rotate={-4} /></g>
      <Label x={540} y={1700} text="the whole street knows" red size={70} />
    </g>
  ),
  // 9 · In your house, she stays calm. You find the leak, together. And you fix it.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(540 ${FLOOR})`}><House patch lights /></g>
      <Ebo x={200} p={{eyes: 'squint', mouth: 'flat', armR: [140, -10]}} hold={<g transform="scale(0.7)"><Hammer rotate={-20} /></g>} />
      <Side who="ama" x={880} facing={-1} p={{eyes: 'open', mouth: 'smile', armR: [70, -20]}} hold={<g transform="scale(0.6)"><Bucket /></g>} />
      <Label x={540} y={420} text="together" red size={110} />
    </g>
  ),
  // 10 · Marry a woman who handles conflict with grace, and keeps your problems inside your walls.
  () => (
    <g>
      <rect x={-200} y={-200} width={1480} height={2400} fill="#E9D3B4" />
      <rect x={-200} y={FLOOR - 10} width={1480} height={700} fill="#B58A62" />
      <line x1={-200} y1={FLOOR - 10} x2={1280} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
      <rect x={150} y={600} width={260} height={220} rx={10} fill="#3B4A6B" stroke="#1D1A1A" strokeWidth={7} />
      <path d="M 170 780 l 60 -60 l 40 30 l 60 -80 l 60 110" fill="none" stroke="#9DB4C9" strokeWidth={6} />
      <Ebo x={300} p={{eyes: 'open', mouth: 'smile', armR: [40, -30]}} front={false} />
      <Side who="ama" x={700} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: [40, -30]}} />
      <g transform={`translate(500 ${FLOOR})`}><TalkTable /></g>
      <g transform={`translate(870 ${FLOOR})`}><Door open={0.15} /></g>
      <Label x={540} y={360} text="with grace" red size={110} />
      <Label x={540} y={480} text="inside your walls" size={74} />
    </g>
  ),
  // 11 · Because the storm doesn't decide if a house stands. The builders do.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform="translate(900 300)"><Sun /></g>
      <g transform={`translate(330 ${FLOOR}) scale(0.7)`}><House patch /></g>
      <g transform={`translate(820 ${FLOOR})`}><FakeFront fallen /></g>
      <Ebo x={150} y={FLOOR + 170} s={0.95} p={{eyes: 'happy', mouth: 'grin', armR: [120, -10]}} />
      <Side who="ama" x={500} y={FLOOR + 170} s={0.95} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} />
      <Label x={540} y={560} text="the builders do." red size={100} rot={-2} />
    </g>
  ),
  // 12 · And remember: she's choosing a builder too. Be the man worth building with.
  () => (
    <g>
      <Sky />
      <Label x={540} y={400} text="she's choosing too." size={86} />
      <Label x={540} y={560} text="be worth building with" red size={86} rot={-2} />
      <g transform="translate(830 860) rotate(-8) scale(1.8)"><Brick /></g>
      <Ebo x={500} y={2350} s={2.6} p={{eyes: 'happy', mouth: 'smile', lookX: 10}} />
    </g>
  ),
];

export const Ep10Board: React.FC = () => {
  useMarkerFont();
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFF9EA'}}>
            <svg viewBox="0 0 1080 1920" width="100%" height="100%">
              {PANELS[Math.min(f, PANELS.length - 1)]()}
            </svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
