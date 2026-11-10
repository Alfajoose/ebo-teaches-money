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
import {Label, useMarkerFont} from './filterKit';
import {Brick, BrickWall, Bucket, Door, FakeFront, Hammer, House, Plot, PostedPhone, Shout, Storm, Sun, TalkTable} from '../components/HouseProps';
import {Arrow, FeeSlip, Ladder, SayBubble, StickGuy} from '../components/PovertyProps';

/**
 * Ep 10 "Marry a Woman Who…": the storyboard, one panel per frame (no voice yet, so these are stills, not the
 * animated episode). Ebo and his wife (Ama) build one house; next door the neighbours (Mica, Christy) only
 * decorate theirs; a storm hits both.
 */
export const EP10_BOARD_PANELS = 13;
const FLOOR = 1500;

type Look = Partial<Pose>;
const Ebo: React.FC<{x: number; y?: number; s?: number; p?: Look; front?: boolean; facing?: 1 | -1; hold?: React.ReactNode; touch?: keyof typeof CONTACT}> = ({x, y = FLOOR, s = 1.3, p = {}, front = true, facing = 1, hold, touch}) => {
  let pose = {...POSE.stand, ...p} as Pose;
  if (touch) pose = {...pose, ...CONTACT[touch], ...p, contact: true, view: 1} as Pose;
  return (
    <RigCharacter who="ebo" x={x} y={y} scale={s} facing={facing} t={0} noBlink pose={front ? gentle(frontOn(pose)) : gentle(pose)}>
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

/** Rain over the whole frame. */
const Rain: React.FC<{seed?: number}> = ({seed = 0}) => (
  <g>
    {Array.from({length: 46}, (_, i) => {
      const x = ((i * 137 + seed * 61) % 1300) - 110;
      const y = ((i * 211 + seed * 97) % 1900) - 40;
      return <line key={i} x1={x} y1={y} x2={x - 26} y2={y + 110} stroke="#9CC9EC" strokeWidth={6} strokeLinecap="round" opacity={0.8} />;
    })}
  </g>
);
/** Two stacked shots in one frame (top, bottom), each drawn in full-frame coordinates and shifted by its dy. */
const Split: React.FC<{top: React.ReactNode; bottom: React.ReactNode; topDy?: number; bottomDy?: number}> = ({top, bottom, topDy = 0, bottomDy = 0}) => (
  <g>
    <defs>
      <clipPath id="ep10-top"><rect x={0} y={0} width={1080} height={952} /></clipPath>
      <clipPath id="ep10-bot"><rect x={0} y={968} width={1080} height={952} /></clipPath>
    </defs>
    <g clipPath="url(#ep10-top)"><g transform={`translate(0 ${topDy})`}>{top}</g></g>
    <g clipPath="url(#ep10-bot)"><g transform={`translate(0 ${bottomDy})`}>{bottom}</g></g>
    <rect x={-10} y={952} width={1100} height={16} fill="#1D1A1A" />
  </g>
);
const Umbrella: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={0} x2={0} y2={300} stroke="#1D1A1A" strokeWidth={10} strokeLinecap="round" />
    <path d="M -230 10 Q -220 -160 0 -170 Q 220 -160 230 10 Q 175 -20 115 10 Q 58 -20 0 10 Q -58 -20 -115 10 Q -175 -20 -230 10 Z" fill="#3E7CB1" stroke="#1D1A1A" strokeWidth={7} strokeLinejoin="round" />
  </g>
);
const Bill: React.FC<{x: number; y: number; rot?: number; k?: number}> = ({x, y, rot = -20, k = 0.45}) => (
  <g>
    <path d={`M ${x + 120} ${y - 30} l 90 -20 M ${x + 120} ${y + 10} l 110 0 M ${x + 120} ${y + 50} l 90 20`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}><FeeSlip top="BILL" bottom="OVERDUE" amount="$900" /></g>
  </g>
);
const Window: React.FC<{x: number; y: number; w?: number; h?: number; night?: boolean}> = ({x, y, w = 420, h = 520, night = true}) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill={night ? '#3B4A6B' : '#BFE3F5'} stroke="#1D1A1A" strokeWidth={10} />
    <path d={`M ${x} ${y - h / 2} L ${x} ${y + h / 2} M ${x - w / 2} ${y} L ${x + w / 2} ${y}`} stroke="#1D1A1A" strokeWidth={8} />
    {Array.from({length: 10}, (_, i) => <line key={i} x1={x - w / 2 + 30 + i * 38} y1={y - h / 2 + 30 + (i % 3) * 90} x2={x - w / 2 + 22 + i * 38} y2={y - h / 2 + 90 + (i % 3) * 90} stroke="#9CC9EC" strokeWidth={5} strokeLinecap="round" />)}
  </g>
);
const Room: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#E9D3B4" />
    <rect x={-200} y={FLOOR - 10} width={1480} height={700} fill="#B58A62" />
    <line x1={-200} y1={FLOOR - 10} x2={1280} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
  </g>
);

/** A faceless onlooker filming on a phone. */
const Filmer: React.FC<{x: number; y: number; k?: number}> = ({x, y, k = 0.55}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <StickGuy pose="climb" />
    <rect x={56} y={-250} width={60} height={100} rx={10} fill="#2B2B2B" stroke="#1D1A1A" strokeWidth={6} />
    <rect x={64} y={-240} width={44} height={70} rx={4} fill="#BFE3F5" />
  </g>
);

/** The 13 panels (the script's 13 lines, episodes/ep10/script.md). */
const PANELS: (() => React.ReactNode)[] = [
  // 1 · cold open: the pretty house crashes down in the rain
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform="translate(540 330)"><Storm w={1100} /></g>
      <g transform={`translate(600 ${FLOOR})`}><FakeFront tilt={-58} side /></g>
      <path d="M 180 1000 q 60 -40 120 0 M 150 1120 q 70 -40 140 0" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <Rain />
    </g>
  ),
  // 2 · That house looked perfect. Here's why it fell.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(800 ${FLOOR}) scale(1.3)`}><FakeFront fallen /></g>
      <Ebo x={320} y={2150} s={2.1} p={{eyes: 'squint', mouth: 'flat', armL: [95, -6], armR: [140, -10]}} />
      <Umbrella x={300} y={760} />
      <Rain seed={1} />
    </g>
  ),
  // 3 · You can marry a woman for how she looks. Or for how she builds.
  () => (
    <Split
      top={
        <g>
          <Sky />
          <g transform="translate(540 900) scale(1.1)"><FakeFront /></g>
          <Label x={540} y={140} text="looks" size={90} />
        </g>
      }
      bottom={
        <g>
          <Sky />
          <g transform="translate(540 1500) rotate(-6) scale(4)"><Brick /></g>
          <Label x={540} y={1130} text="builds" red size={90} />
        </g>
      }
    />
  ),
  // 4 · Marriage is a house you build together. Every kind word is a brick. Every insult is a crack.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR + 140})`}><Plot /></g>
      <g transform={`translate(540 ${FLOOR})`}><BrickWall w={360} rows={6} crack /></g>
      <Side who="ama" x={170} p={{eyes: 'happy', mouth: 'smile', armR: [60, -30]}} />
      <Ebo x={910} p={{eyes: 'half', mouth: 'smirk', lookX: -10}} />
      <g transform="translate(300 700)"><SayBubble a="Proud of you!" size={56} w={440} /></g>
      <g transform="translate(430 980) rotate(-8) scale(1.2)"><Brick /></g>
      <g transform="translate(400 880) rotate(70) scale(0.6)"><Arrow /></g>
      <g transform="translate(780 560) scale(-1 1)"><SayBubble a="" size={52} w={440} /></g>
      <Label x={780} y={578} text="Ugh. Whatever." size={52} />
    </g>
  ),
  // 5 · So marry a woman who works with willing hands. When you both build, the walls go up fast.
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(540 ${FLOOR})`}><BrickWall w={460} rows={16} /></g>
      <Ebo x={170} p={{eyes: 'happy', mouth: 'grin', armR: [110, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
      <Side who="ama" x={910} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: [110, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
      <path d="M 300 760 l 0 -80 M 780 760 l 0 -80" stroke="#1D1A1A" strokeWidth={8} strokeLinecap="round" />
    </g>
  ),
  // 6 · Next door? Perfect paint. Fancy curtains. But nobody built the walls. Marry a woman who builds a home…
  () => (
    <g>
      <Sky />
      <Ground />
      <g transform={`translate(270 ${FLOOR - 60}) scale(0.72)`}><House /></g>
      <g transform={`translate(810 ${FLOOR - 60}) scale(0.72)`}><FakeFront side tilt={-3} /></g>
      <Ebo x={140} y={FLOOR + 330} s={0.8} p={{eyes: 'happy', mouth: 'smile'}} />
      <Side who="ama" x={400} y={FLOOR + 330} s={0.8} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} />
      <Side who="mica" x={680} y={FLOOR + 330} s={0.8} p={{eyes: 'happy', mouth: 'smile', armR: [70, -30]}} />
      <Side who="christy" x={950} y={FLOOR + 330} s={0.8} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} />
    </g>
  ),
  // 7 · Then the storm comes. Every marriage gets one.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform="translate(540 380)"><Storm w={1100} /></g>
      <g transform={`translate(280 ${FLOOR}) scale(0.62)`}><House lights={false} /></g>
      <g transform={`translate(810 ${FLOOR}) scale(0.62)`}><FakeFront tilt={-6} side /></g>
      <Bill x={150} y={1060} rot={-24} />
      <Bill x={690} y={1060} rot={-24} />
      <Rain seed={2} />
    </g>
  ),
  // 8 · Next door, they shout. It ends up online. Now the whole street knows… and the wall comes down.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(560 ${FLOOR + 40})`}><FakeFront tilt={-38} side /></g>
      <Side who="mica" x={250} p={{eyes: 'wide', mouth: 'scream', armL: [140, -10], armR: [120, -20]}} hold={<g transform="scale(0.35) rotate(-10)"><PostedPhone /></g>} />
      <Side who="christy" x={860} facing={-1} p={{eyes: 'angry', mouth: 'scream', armL: [130, -10], armR: [100, -10]}} />
      <g transform="translate(250 640)"><Shout text="YOU!" rotate={-6} /></g>
      <g transform="translate(850 600)"><Shout text="NO, YOU!" rotate={6} /></g>
      <Rain seed={3} />
    </g>
  ),
  // 9 · In your house, she stays calm.
  () => (
    <g>
      <Room />
      <Window x={540} y={560} w={360} h={400} />
      <path d="M 300 -10 L 300 820" stroke="#6BB7E8" strokeWidth={10} strokeDasharray="30 30" strokeLinecap="round" />
      <path d="M 250 900 q -30 -30 -10 -60 M 350 900 q 30 -30 10 -60" fill="none" stroke="#6BB7E8" strokeWidth={9} strokeLinecap="round" />
      <Ebo x={300} p={{eyes: 'squeeze', mouth: 'scream', armL: [150, -20], armR: [150, -20], lift: -20}} />
      <Side who="ama" x={800} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: [40, -10]}} />
      <g transform={`translate(560 ${FLOOR - 70}) scale(0.9)`}><Bucket /></g>
      <path d="M 640 1440 l 60 0 M 650 1470 l 50 0" stroke="#1D1A1A" strokeWidth={7} strokeLinecap="round" />
    </g>
  ),
  // 10 · You find the leak, together. And you fix it.
  () => (
    <g>
      <Sky storm />
      <Ground storm />
      <g transform={`translate(360 ${FLOOR}) scale(1.15)`}><House patch lights /></g>
      <g transform={`translate(860 ${FLOOR}) rotate(-12)`}><Ladder total={7} rungs={0} /></g>
      <Ebo x={770} y={1120} s={1} facing={-1} p={{eyes: 'squint', mouth: 'flat', armR: [130, -10]}} front={false} />
      <g transform="translate(590 880) rotate(-40) scale(0.7)"><Hammer /></g>
      <Side who="ama" x={940} s={1.0} facing={-1} p={{eyes: 'open', mouth: 'smile', armR: [80, -20], armL: [70, -20]}} />
      <Rain seed={4} />
    </g>
  ),
  // 11 · Marry a woman who handles conflict with grace, and keeps your problems inside your walls.
  () => (
    <Split
      top={
        <g>
          <Sky storm />
          <rect x={-200} y={760} width={1480} height={400} fill="#6F8F62" />
          <line x1={-200} y1={760} x2={1280} y2={760} stroke="#1D1A1A" strokeWidth={7} />
          <g transform="translate(540 790) scale(1.2)"><FakeFront fallen /></g>
          <Side who="mica" x={380} y={900} s={1} p={{eyes: 'sad', mouth: 'frown'}} />
          <Side who="christy" x={700} y={900} s={1} facing={-1} p={{eyes: 'sad', mouth: 'frown'}} />
          {[90, 200, 880, 990].map((fx, i) => <Filmer key={fx} x={fx} y={820 + (i % 2) * 20} />)}
          <Rain seed={5} />
        </g>
      }
      bottom={
        <g>
          <Sky storm />
          <rect x={-200} y={1760} width={1480} height={400} fill="#6F8F62" />
          <line x1={-200} y1={1760} x2={1280} y2={1760} stroke="#1D1A1A" strokeWidth={7} />
          <g transform="translate(540 1760) scale(1.2)"><House lights /></g>
          <rect x={472} y={1532} width={136} height={228} fill="#FFE07A" />
          <g transform="translate(468 1760) scale(0.686 0.543)"><Door open={0.3} /></g>
          <Rain seed={6} />
        </g>
      }
    />
  ),
  // 12 · Because the storm doesn't decide if a house stands. The builders do.
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
  // 13 · And remember: she's choosing a builder too. Be the man worth building with.
  () => (
    <g>
      <Sky />
      <g transform="translate(850 980) rotate(-8) scale(2)"><Brick /></g>
      <Ebo x={480} y={2560} s={3.1} p={{eyes: 'happy', mouth: 'smile', lookX: 8}} />
      <Label x={540} y={420} text="be worth building with" red size={86} rot={-2} />
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
