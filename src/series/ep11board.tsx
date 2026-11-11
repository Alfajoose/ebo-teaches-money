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
import {Clock, CarKeys} from '../components/NiceGuyProps';
import {FoodBowl} from '../components/WantsInserts';
import {Laptop} from '../components/StayPoorProps';
import {Door, TalkTable} from '../components/HouseProps';
import {SayBubble} from '../components/PovertyProps';
import {Brush, BuzzPhone, Cricket, Notebook, Router, SneakerSign, Sneakers, Sticky, ThreadPhone, WeekCalendar} from '../components/AvailableProps';

/**
 * Ep 11 "The Dangerous Side of Being Too Available": the storyboard, one panel per line of episodes/ep11/script.md
 * (stills; no voice yet). Ebo tells it as his own story (first person); Mica asks, Christy needs her wifi, Obuor
 * (the boss) calls at midnight, Ama asks the question that turns it.
 */
export const EP11_BOARD_PANELS = 17;
const FLOOR = 1500;
type Look = Partial<Pose>;
const Ebo: React.FC<{x: number; y?: number; s?: number; p?: Look; front?: boolean; facing?: 1 | -1; hold?: React.ReactNode; holdL?: React.ReactNode; touch?: keyof typeof CONTACT}> = ({x, y = FLOOR, s = 1.3, p = {}, front = true, facing = 1, hold, holdL, touch}) => {
  let pose = {...POSE.stand, ...p} as Pose;
  if (touch) pose = {...pose, ...CONTACT[touch], ...p, contact: true, view: 1} as Pose;
  return (
    <RigCharacter who="ebo" x={x} y={y} scale={s} facing={facing} t={0} noBlink pose={front ? gentle(frontOn(pose)) : gentle(pose)} holdL={holdL}>
      {hold}
    </RigCharacter>
  );
};
const Side: React.FC<{who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; hold?: React.ReactNode}> = ({who, x, y = FLOOR, s = 1.3, p = {}, facing = 1, hold}) => (
  <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={0} noBlink pose={gentle({...(POSES.standing as Pose), ...p} as Pose)}>
    {hold}
  </RigCharacter>
);
/** Ebo narrating to camera (rule 22): big along the bottom. */
const Narrator: React.FC<{p?: Look; hold?: React.ReactNode}> = ({p = {}, hold}) => <Ebo x={540} y={2170} s={2.25} p={{eyes: 'half', mouth: 'smile', ...p}} hold={hold} />;

const Room: React.FC<{wall?: string; floor?: string; night?: boolean}> = ({wall = '#F2E3B8', floor = '#B58A62', night}) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill={night ? '#3A3550' : wall} />
    <rect x={-300} y={FLOOR - 10} width={1680} height={900} fill={night ? '#2A2640' : floor} />
    <line x1={-300} y1={FLOOR - 10} x2={1380} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
  </g>
);
const Speed: React.FC<{x: number; y: number}> = ({x, y}) => (
  <path d={`M ${x} ${y} l -140 0 M ${x} ${y + 50} l -180 0 M ${x} ${y + 100} l -120 0`} stroke="#1D1A1A" strokeWidth={9} strokeLinecap="round" />
);
const Bubble: React.FC<{x: number; y: number; lines: string[]; flip?: boolean; w?: number; size?: number}> = ({x, y, lines, flip, w = 560, size = 54}) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={flip ? 'scale(-1 1)' : undefined}><SayBubble lines={lines.map(() => '')} size={size} w={w} /></g>
    {lines.map((l, i) => (
      <Label key={i} x={0} y={(i - (lines.length - 1) / 2) * size * 1.12 + size * 0.34} text={l} size={size} />
    ))}
  </g>
);

const PANELS: (() => React.ReactNode)[] = [
  // 1 · (buzz) Ebo, mouth full of noodles, answers in one ring
  () => (
    <g>
      <Room />
      <Ebo x={330} p={{eyes: 'wide', mouth: 'o', lookX: 12, armL: [60, -40]}} />
      <g transform={`translate(560 ${FLOOR})`}><TalkTable /></g>
      <g transform="translate(470 1215) scale(0.8)"><FoodBowl /></g>
      <g transform="translate(720 1130) scale(0.55) rotate(8)"><BuzzPhone caller="MICA" /></g>
      <Label x={760} y={880} text="bzzz!" red size={70} rot={8} />
    </g>
  ),
  // 2 · MICA (phone): Bro, you free?
  () => (
    <g>
      <Backdrop id="ep11-car" shade="sky" />
      <rect x={-50} y={300} width={1180} height={1000} rx={60} fill="none" stroke="#1D1A1A" strokeWidth={40} />
      <Side who="mica" x={540} y={2120} s={2.1} p={{eyes: 'happy', mouth: 'grin', armR: [130, -70]}} />
      <g transform="translate(290 1130) rotate(-12) scale(0.55)"><BuzzPhone caller="EBO" buzz={false} /></g>
      <Bubble x={560} y={560} lines={['Bro, you free?']} />
    </g>
  ),
  // 3 · EBO: Always!
  () => (
    <g>
      <Room />
      <Speed x={860} y={1100} />
      <Ebo x={460} front={false} p={{eyes: 'happy', mouth: 'grin', legL: [24, 8], legR: [-14, 0], tilt: 6, armR: [80, -20]}} hold={<g transform="scale(1.4)"><CarKeys /></g>} />
      <Bubble x={430} y={620} lines={['Always!']} w={420} size={70} />
    </g>
  ),
  // 4 · EBO (to camera): That was my problem. I was always free.
  () => (
    <g>
      <Room />
      <Narrator p={{eyes: 'half', mouth: 'flat', armR: [70, -30]}} hold={<g transform="scale(1.2)"><CarKeys /></g>} />
    </g>
  ),
  // 5 · CHRISTY: Ebo! My wifi!
  () => (
    <g>
      <Backdrop id="ep11-street" shade="mint" />
      <rect x={-200} y={FLOOR - 10} width={1480} height={700} fill="#A9D18E" />
      <line x1={-200} y1={FLOOR - 10} x2={1280} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
      <g transform={`translate(760 ${FLOOR}) scale(1.4)`}><Door open={0.5} /></g>
      <Side who="christy" x={880} facing={-1} p={{eyes: 'wide', mouth: 'scream', armR: [110, -10]}} />
      <g transform="translate(560 1420) scale(0.7)"><Router /></g>
      <Ebo x={300} front={false} p={{eyes: 'wide', mouth: 'o', legL: [28, 10], legR: [-18, 0], tilt: 10}} />
      <Speed x={160} y={1150} />
      <Bubble x={640} y={420} lines={['Ebo! My wifi!']} flip />
    </g>
  ),
  // 6 · OBUOR (phone): Quick one… I know it's midnight…
  () => (
    <g>
      <Room night />
      <g transform="translate(820 420) scale(0.9)"><Clock h={12} /></g>
      <Label x={820} y={620} text="12:04 AM" red size={60} />
      <g transform={`translate(560 ${FLOOR})`}><TalkTable /></g>
      <g transform="translate(560 1230) scale(0.8)"><Laptop screen="code" /></g>
      <Ebo x={300} p={{eyes: 'tired', mouth: 'flat'}} />
      <g transform="translate(760 1170) scale(0.4)"><BuzzPhone caller="BOSS" /></g>
      <Bubble x={560} y={800} lines={['Quick one…', "I know it's midnight…"]} w={640} size={48} />
    </g>
  ),
  // 7 · EBO (walk-and-talk): your time looks free… free things get used, not valued
  () => (
    <g>
      <Room />
      <Ebo x={540} front={false} p={{eyes: 'half', mouth: 'flat', legL: [20, 6], legR: [-8, 0]}} />
      {[['MICA', -70, 1080, -12, '#FFE45C'], ['WIFI!', 30, 1180, 10, '#F7B6CB'], ['BOSS', -20, 1290, -6, '#BFE3F5'], ['HELP', 90, 1050, 14, '#B7E4A8'], ['RIDE?', 60, 1330, -14, '#FFE45C'], ['LOAN?', -100, 1240, 8, '#F7B6CB']].map(([t, dx, y, r, c]) => (
        <g key={t as string} transform={`translate(${540 + (dx as number)} ${y}) scale(0.8)`}><Sticky text={t as string} rotate={r as number} color={c as string} /></g>
      ))}
      <Label x={540} y={420} text="free = used" red size={90} rot={-3} />
    </g>
  ),
  // 8 · MICA (text): Party was mad last night! Can you help clean up?
  () => (
    <g>
      <Backdrop id="ep11-phone" shade="lilac" />
      <g transform="translate(540 960) scale(2)"><ThreadPhone photo msg={['Party was mad', 'last night!', 'Can you help', 'clean up?']} /></g>
    </g>
  ),
  // 9 · EBO: …Sure.
  () => (
    <g>
      <Room />
      <Ebo x={540} y={2350} s={2.6} p={{eyes: 'half', mouth: 'flat'}} />
      <Bubble x={540} y={480} lines={['…Sure.']} w={380} size={70} />
      <g transform="translate(860 1820) scale(1.2)"><Cricket /></g>
    </g>
  ),
  // 10 · EBO: People stopped planning with me. They planned around me.
  () => (
    <g>
      <Room />
      <g transform="translate(560 640) scale(0.95)"><WeekCalendar /></g>
      <Ebo x={250} p={{eyes: 'half', mouth: 'flat', armR: [100, -10]}} />
    </g>
  ),
  // 11 · AMA: When did you last finish something for you?
  () => (
    <g>
      <Room />
      <g transform={`translate(830 ${FLOOR}) scale(0.8)`}><SneakerSign done={0.34} dust /></g>
      <Side who="ama" x={170} p={{eyes: 'open', mouth: 'smile', armR: [95, -10]}} />
      <Ebo x={540} facing={-1} front={false} p={{eyes: 'half', mouth: 'flat'}} />
      <Bubble x={420} y={520} lines={['When did you last finish', 'something for you?']} w={720} size={48} />
    </g>
  ),
  // 12 · (beat) Ebo looks at the sign. Silence.
  () => (
    <g>
      <Room />
      <g transform="translate(820 1250) scale(0.85)"><SneakerSign done={0.34} dust /></g>
      <Ebo x={420} y={2350} s={2.6} p={{eyes: 'sad', mouth: 'flat', lookX: 14}} />
    </g>
  ),
  // 13 · EBO (walk-and-talk): I'm reachable. Just not instantly.
  () => (
    <g>
      <Room />
      <g transform={`translate(700 ${FLOOR}) scale(0.95)`}><SneakerSign done={0.67} /></g>
      <Ebo x={300} p={{eyes: 'squint', mouth: 'smile', armR: [110, -20]}} hold={<g transform="scale(1)"><Brush rotate={30} /></g>} />
      <g transform={`translate(160 ${FLOOR + 120}) rotate(-80) scale(0.4)`}><BuzzPhone caller="MICA" /></g>
      <Label x={540} y={420} text="reachable ≠ on call" red size={70} rot={-2} />
    </g>
  ),
  // 14 · EBO (text): Can't today. Saturday, 2pm?
  () => (
    <g>
      <Backdrop id="ep11-phone2" shade="sky" />
      <g transform="translate(540 960) scale(2)"><ThreadPhone msg={['Bro you free?']} reply={["Can't today.", 'Saturday, 2pm?']} /></g>
    </g>
  ),
  // 15 · MICA: …Oh. Okay. Saturday.
  () => (
    <g>
      <Backdrop id="ep11-mica" shade="peach" />
      <Side who="mica" x={470} y={2250} s={2.4} p={{eyes: 'wide', mouth: 'o', armR: [80, -40]}} />
      <g transform="translate(820 1150) rotate(8) scale(1.2)"><Notebook text="SAT 2pm" /></g>
      <Bubble x={540} y={480} lines={['…Oh. Okay.', 'Saturday.']} w={500} size={60} />
    </g>
  ),
  // 16 · EBO: When my time stopped being free, people started treating it like it mattered.
  () => (
    <g>
      <Room />
      <g transform={`translate(560 ${FLOOR}) scale(0.95)`}><SneakerSign done={1} /></g>
      <g transform="translate(560 1360) scale(1)"><Sneakers shine /></g>
      <Ebo x={200} p={{eyes: 'happy', mouth: 'grin', armR: [120, -20]}} />
      <Side who="ama" x={940} facing={-1} p={{eyes: 'happy', mouth: 'grin', armL: [80, -60], armR: [80, -60]}} />
    </g>
  ),
  // 17 · EBO: Be there for people. Just don't be everyone's backup plan.
  () => (
    <g>
      <Room />
      <Ebo x={540} y={2500} s={3} p={{eyes: 'half', mouth: 'smile'}} />
      <Label x={540} y={420} text="not everyone's backup plan" red size={70} rot={-2} />
    </g>
  ),
];

export const Ep11Board: React.FC = () => {
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
