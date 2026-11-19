import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {StageSizeContext} from './exportCtx';
import {Label, useMarkerFont} from './filterKit';
import {Cricket} from '../components/AvailableProps';
import {Bonk, DoodleBubble, DoodleChair, DoodleCup, DoodleTable, MotionLines, SketchPage, StickFigure, StickPose, TickTock} from '../components/StickFigures';

/**
 * Ep 12 "Why Saying Sorry Too Much Makes People Respect You Less": the storyboard (experiment). Ebo narrates in
 * front of a big sketchbook page; stick figures (his doodles) act the story out on it. One panel per script line.
 */
export const EP12_BOARD_PANELS = 40;
const FLOOR = 1400;
type Look = Partial<Pose>;
const Ebo: React.FC<{x?: number; y?: number; s?: number; p?: Look}> = ({x = 540, y = 2170, s = 2.25, p = {}}) => (
  <RigCharacter who="ebo" x={x} y={y} scale={s} t={0} noBlink pose={gentle(frontOn({...POSE.stand, eyes: 'half', mouth: 'smile', ...p} as Pose))} />
);
/** The doodled café floor line. */
const Floor: React.FC = () => <path d={`M 120 ${FLOOR} L 1020 ${FLOOR}`} stroke="#1D1A1A" strokeWidth={8} strokeLinecap="round" />;
const Guy: React.FC<{x: number; pose?: StickPose; facing?: 1 | -1; hold?: React.ReactNode}> = ({x, pose, facing = 1, hold}) => (
  <g transform={`translate(${x} ${FLOOR - 170})`}><StickFigure pose={pose} facing={facing} hold={hold} /></g>
);
const Friend: React.FC<{x?: number; pose?: StickPose}> = ({x = 800, pose}) => (
  <g transform={`translate(${x} ${FLOOR - 170})`}><StickFigure pose={pose} facing={-1} hat="#3E6FD8" /></g>
);
/** A stick scene, scaled up around the middle of the page. */
const Big: React.FC<{children: React.ReactNode}> = ({children}) => <g transform="translate(540 1000) scale(1.35) translate(-540 -1000)">{children}</g>;
const CROSSED: StickPose = {armL: [25, 110], armR: [25, 110], brows: 'angry', mouth: 'flat'};

/** More doodles (marker lines, kept as plain SVG for the board). */
const INKL = {stroke: '#1D1A1A', strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
const Desk: React.FC<{x: number; papers?: boolean}> = ({x, papers}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <path d="M -170 -190 L 170 -190 M -150 -190 L -150 0 M 150 -190 L 150 0" {...INKL} />
    {papers && <g><path d="M -110 -200 l 90 -8 l 6 -26 l -92 8 Z" {...INKL} fill="#fff" strokeWidth={5} /><path d="M -96 -226 l 60 -5 M -94 -216 l 50 -4" {...INKL} strokeWidth={3} /></g>}
  </g>
);
const Boss: React.FC<{x?: number; pose?: StickPose}> = ({x = 820, pose}) => (
  <g transform={`translate(${x} ${FLOOR - 170})`}>
    <StickFigure pose={pose} facing={-1} />
    <path d="M -14 -150 l 14 40 l 14 -40 Z" fill="#E5484D" stroke="#1D1A1A" strokeWidth={4} />
  </g>
);
const Lamp: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}><path d="M 0 0 L 0 -560 Q 0 -600 60 -600 L 90 -600" {...INKL} /><path d="M 70 -600 l 40 0 l -10 30 l -20 0 Z" {...INKL} fill="#FFE45C" strokeWidth={5} /></g>
);
const Phone: React.FC<{lines: string[]; reply?: string[]; blue?: boolean}> = ({lines, reply}) => (
  <g transform="translate(540 960) scale(1.6)">
    <rect x={-230} y={-420} width={460} height={840} rx={50} {...INKL} fill="#fff" strokeWidth={10} />
    <rect x={-190} y={-360} width={380} height={680} rx={14} {...INKL} fill="#F4F2EE" strokeWidth={5} />
    <g transform="translate(-40 -60)"><rect x={-130} y={-40} width={300} height={40 + lines.length * 50} rx={22} fill="#2F80ED" />
      {lines.map((l, i) => <text key={i} x={20} y={i * 50 + 14} textAnchor="middle" fontFamily="EboMarker" fontSize={40} fill="#fff">{l}</text>)}</g>
    {reply && <g transform="translate(-60 160)"><rect x={-110} y={-40} width={260} height={40 + reply.length * 50} rx={22} fill="#E2E3E8" />
      {reply.map((l, i) => <text key={i} x={20} y={i * 50 + 14} textAnchor="middle" fontFamily="EboMarker" fontSize={40} fill="#1D1A1A">{l}</text>)}</g>}
  </g>
);
/** The stick guy scaled by how much respect he gets, a counter over his head. */
// (kept for the animation)
export const Shrinking: React.FC<{k: number; count: string; red?: boolean}> = ({k, count, red}) => (
  <g>
    <Floor />
    <g transform={`translate(540 ${FLOOR}) scale(${k}) translate(0 -170)`}><StickFigure pose={k < 1 ? {eyes: 'closed', mouth: 'frown', brows: 'worried', lean: 15} : {eyes: 'happy', mouth: 'grin', armL: [150, -10], armR: [150, -10]}} /></g>
    <Label x={540} y={520} text={count} red={red} size={90} />
  </g>
);

/** Doodles for the 40-shot board. */
const Page: React.FC<{lines?: boolean; children?: React.ReactNode}> = ({lines, children}) => <g><SketchPage lines={lines} />{children}</g>;
const Cafe: React.FC<{tipped?: boolean; cup?: boolean}> = ({tipped, cup}) => (
  <g>
    <Floor />
    <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
    <g transform={`translate(520 ${FLOOR})`}><DoodleChair tipped={tipped ? -18 : 0} /></g>
    {cup && <g transform={`translate(660 ${FLOOR - 190})`}><DoodleCup /></g>}
  </g>
);
const CafeDoor: React.FC<{open?: boolean}> = ({open}) => (
  <g transform={`translate(200 ${FLOOR})`}>
    <path d="M -100 0 L -100 -520 L 140 -520 L 140 0" {...INKL} />
    {open ? <path d="M -100 -520 L -40 -500 L -40 -20 L -100 0" {...INKL} fill="#fff" /> : <path d="M -100 -520 L 140 -520 L 140 0 L -100 0 Z" {...INKL} fill="#fff" />}
    <text x={20} y={-560} textAnchor="middle" fontFamily="EboMarker" fontSize={50} fill="#1D1A1A">CAFÉ</text>
  </g>
);
const WallClock: React.FC<{x?: number; y?: number; k?: number}> = ({x = 540, y = 800, k = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={200} {...INKL} fill="#fff" strokeWidth={12} />
    {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-170} x2={0} y2={-150} {...INKL} transform={`rotate(${i * 30})`} />)}
    <path d="M 0 0 L 0 -130 M 0 0 L 40 40" {...INKL} strokeWidth={14} />
    <text y={290} textAnchor="middle" fontFamily="EboMarker" fontSize={90} fill="#E5484D">10:15</text>
  </g>
);
/** A stick face close-up (the head fills the frame). */
const Face: React.FC<{pose: StickPose; hat?: string; facing?: 1 | -1}> = ({pose, hat, facing = 1}) => (
  <g transform="translate(540 1800) scale(3.4)"><StickFigure pose={pose} facing={facing} hat={hat} /></g>
);
const Papers: React.FC = () => (
  <g transform="translate(540 960)">
    <path d="M -300 -380 L 300 -380 L 300 380 L -300 380 Z" {...INKL} fill="#fff" strokeWidth={10} />
    {Array.from({length: 8}, (_, i) => <line key={i} x1={-230} x2={160 - (i % 3) * 60} y1={-280 + i * 80} y2={-280 + i * 80} stroke="#9A9AA6" strokeWidth={10} strokeLinecap="round" />)}
    {[[-150, -200], [80, -40], [-60, 120], [150, 260]].map(([x, y], i) => <path key={i} d={`M ${x - 50} ${y - 50} l 100 100 M ${x + 50} ${y - 50} l -100 100`} stroke="#E5484D" strokeWidth={16} strokeLinecap="round" />)}
  </g>
);
const PhoneGuy: React.FC<{x: number; lean?: number}> = ({x, lean = 8}) => (
  <g transform={`translate(${x} ${FLOOR - 170})`}><StickFigure facing={-1} pose={{armR: [150, -150], eyes: 'side', mouth: 'flat', lean}} hold={<rect x={-12} y={-30} width={24} height={40} rx={4} fill="#1D1A1A" />} /></g>
);
const Waiter: React.FC<{dish: 'fish' | 'burger'}> = ({dish}) => (
  <g transform={`translate(800 ${FLOOR - 170})`}>
    <StickFigure facing={-1} pose={{armR: [100, -10], eyes: 'dot', mouth: 'smile'}} />
    <g transform="translate(-170 -230)">
      <ellipse cx={0} cy={0} rx={90} ry={18} {...INKL} fill="#fff" strokeWidth={6} />
      {dish === 'fish' ? <path d="M -50 -20 Q 0 -60 40 -20 L 70 -45 L 70 5 L 40 -20 Q 0 20 -50 -20 Z" {...INKL} fill="#9BC4E2" strokeWidth={5} /> : <g><ellipse cx={0} cy={-30} rx={50} ry={24} {...INKL} fill="#E2B04A" strokeWidth={5} /><rect x={-50} y={-22} width={100} height={12} fill="#7A4A2A" /></g>}
    </g>
  </g>
);
const Lift: React.FC<{shut?: boolean}> = ({shut}) => (
  <g transform={`translate(560 ${FLOOR})`}>
    <rect x={-300} y={-700} width={600} height={700} {...INKL} fill="#E6E6EC" strokeWidth={10} />
    <rect x={shut ? -150 : -290} y={-690} width={140} height={690} {...INKL} fill="#C9CCD6" />
    <rect x={shut ? 10 : 150} y={-690} width={140} height={690} {...INKL} fill="#C9CCD6" />
    <text y={-730} textAnchor="middle" fontFamily="EboMarker" fontSize={50} fill="#1D1A1A">LIFT</text>
  </g>
);
const Write: React.FC<{sorry?: boolean; cross?: boolean; thanks?: boolean}> = ({sorry, cross, thanks}) => (
  <g>
    {sorry && <Label x={540} y={760} text="sorry" size={190} />}
    {cross && <path d="M 290 700 L 790 700" stroke="#E5484D" strokeWidth={22} strokeLinecap="round" />}
    {thanks && <Label x={540} y={1150} text="thank you" red size={180} rot={-3} />}
  </g>
);
const Counter: React.FC<{n: string; k: number}> = ({n, k}) => (
  <g>
    <Floor />
    <g transform={`translate(540 ${FLOOR}) scale(${k}) translate(0 -170)`}><StickFigure pose={{eyes: k < 1 ? 'closed' : 'dot', mouth: k < 1 ? 'frown' : 'flat', brows: 'worried', lean: (1.4 - k) * 20}} /></g>
    <Label x={540} y={FLOOR - 560 * k - 60} text={n} red size={84} />
  </g>
);

const P = (fn: () => React.ReactNode) => fn;
const PANELS: (() => React.ReactNode)[] = [
  // ── the mistake ──
  P(() => <Page><g transform="translate(540 820) scale(0.9)"><StickFigure pose={{mouth: 'smile'}} /></g><Ebo p={{eyes: 'squint', mouth: 'smirk', armL: [110, -10]}} /></Page>), // 1 Watch this guy
  P(() => <Page><Big><Cafe /><CafeDoor open /><Friend x={880} pose={CROSSED} /><Guy x={300} pose={{armL: [130, 20], armR: [150, 10], legL: [40, 30], legR: [-30, 10], lean: 18, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform={`translate(150 ${FLOOR - 330})`}><MotionLines /></g></Big></Page>), // 2 door bangs open
  P(() => <Page><Face pose={{eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform="translate(540 420) scale(1.8)"><DoodleBubble text={['Sorry!']} w={300} /></g></Page>), // 3 Sorry!
  P(() => <Page><WallClock /><g transform="translate(540 1450) scale(1.7)"><DoodleBubble text={["Sorry I'm late—"]} w={440} tail={1} /></g></Page>), // 4 clock
  P(() => <Page><Face pose={{brows: 'angry', mouth: 'flat', eyes: 'side'}} hat="#3E6FD8" facing={-1} /><Label x={540} y={380} text="…" size={150} /></Page>), // 5 friend's face
  P(() => <Page><g transform="translate(540 1500) scale(2.4) translate(-520 -1400)"><g transform="translate(520 1400)"><DoodleChair tipped={-18} /></g><path d="M 380 1400 L 470 1250 L 430 1100" {...INKL} strokeWidth={10} /></g><g transform="translate(560 800) scale(1.6)"><Bonk /></g></Page>), // 6 BONK
  P(() => <Page><Big><Cafe tipped /><Friend x={880} pose={{armL: [25, 110], armR: [70, -120], brows: 'angry', mouth: 'flat', eyes: 'side'}} /><Guy x={330} pose={{armL: [40, 40], armR: [40, 40], lean: 35, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /><g transform="translate(330 760)"><DoodleBubble text={['…sorry.']} w={300} tail={1} /></g><g transform={`translate(240 ${FLOOR + 60}) scale(1.1)`}><Cricket /></g></Big></Page>), // 7 sorry to the chair
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [100, 20], brows: 'angry', mouth: 'frown'}} /><Guy x={330} pose={{eyes: 'wide', mouth: 'o', brows: 'worried'}} /><Label x={600} y={1150} text="SLAP" size={60} /></Big></Page>), // 8 office
  P(() => <Page><Papers /></Page>), // 9 red crosses
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [20, 80], armL: [20, 80], brows: 'angry', mouth: 'flat'}} /><Guy x={330} pose={{armL: [60, 90], armR: [60, 90], lean: 20, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform="translate(360 680)"><DoodleBubble text={['Sorry, sorry,', "I'll fix it!"]} w={400} tail={-1} /></g></Big></Page>), // 10 grovels
  P(() => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={760} /><Guy x={300} pose={{eyes: 'dot', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} /></Big></Page>), // 11 street
  P(() => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={600} /><g transform="translate(540 1110) scale(0.8)"><Bonk /></g><Guy x={460} pose={{lean: -14, armL: [70, -20], eyes: 'wide', mouth: 'o'}} /></Big></Page>), // 12 collide
  P(() => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={720} lean={0} /><Guy x={380} pose={{armL: [40, 40], armR: [40, 40], lean: 30, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /><g transform="translate(330 700)"><DoodleBubble text={['Oh— sorry!']} w={340} tail={1} /></g></Big></Page>), // 13 he apologises
  P(() => <Page><Big><Floor /><g transform={`translate(560 ${FLOOR})`}><DoodleTable /></g><Waiter dish="fish" /><Guy x={300} pose={{eyes: 'wide', mouth: 'smile', brows: 'worried', armL: [60, -30]}} /><g transform="translate(330 660)"><DoodleBubble text={["Sorry, it's fine!"]} w={420} tail={-1} /></g><Label x={700} y={1500} text="(he ordered a burger)" size={36} color="#8A8478" /></Big></Page>), // 14 restaurant
  P(() => <Page><Big><Floor /><Lift shut /><g transform={`translate(420 ${FLOOR - 170})`}><StickFigure pose={{armR: [90, 0], eyes: 'wide', mouth: 'open', brows: 'worried'}} /></g><g transform="translate(330 560)"><DoodleBubble text={['Sorry!']} w={300} tail={1} /></g><Label x={760} y={600} text="(to the lift)" size={40} color="#8A8478" /></Big></Page>), // 15 lift
  P(() => <Page lines={false}><Phone lines={['Sorry for the', 'late reply,', 'sorry…']} /></Page>), // 16 phone
  P(() => <Page lines={false}><Phone lines={['sorry', 'sorry!!', 'so sorry']} reply={['…ok?']} /></Page>), // 17 group chat
  // ── why ──
  P(() => <Page><Ebo x={540} y={2350} s={2.6} p={{eyes: 'half', mouth: 'flat'}} /></Page>), // 18 Don't be that guy
  P(() => <Page><Counter n="SORRY × 1" k={1.1} /></Page>), // 19
  P(() => <Page><Counter n="SORRY × 10" k={0.7} /></Page>), // 20
  P(() => <Page><Counter n="SORRY × 47" k={0.35} /></Page>), // 21
  P(() => <Page><Floor /><g transform={`translate(560 ${FLOOR}) scale(0.35) translate(0 -170)`}><StickFigure pose={{eyes: 'closed', mouth: 'frown', brows: 'worried'}} /></g>{[260, 820].map((x, i) => <g key={x} transform={`translate(${x} ${FLOOR - 170})`}><StickFigure facing={i ? -1 : 1} pose={{eyes: 'side', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} hat={i ? '#3E6FD8' : undefined} /></g>)}<Label x={560} y={1220} text="?" size={60} /></Page>), // 22 friends walk past
  // ── the fix ──
  P(() => <Page><Ebo p={{eyes: 'squint', mouth: 'smile', armL: [140, -10]}} /></Page>), // 23 Here's the fix
  P(() => <Page><Write sorry /></Page>), // 24
  P(() => <Page><Write sorry cross /></Page>), // 25
  P(() => <Page><Write sorry cross thanks /></Page>), // 26
  // ── the replay ──
  P(() => <Page><Big><Cafe /><CafeDoor open /><Friend x={880} pose={{eyes: 'dot', mouth: 'smile'}} /><Guy x={300} pose={{eyes: 'happy', mouth: 'grin', legL: [20, 6], legR: [-8, 0], armL: [60, -30]}} /></Big></Page>), // 27 walks in relaxed
  P(() => <Page><Face pose={{eyes: 'happy', mouth: 'grin'}} /><g transform="translate(540 420) scale(1.6)"><DoodleBubble text={['Thanks for waiting!']} w={520} /></g></Page>), // 28
  P(() => <Page><Big><Cafe cup /><Friend x={880} pose={{armL: [70, -20], eyes: 'happy', mouth: 'grin'}} /><Guy x={330} pose={{eyes: 'happy', mouth: 'grin'}} /><g transform="translate(690 820)"><DoodleBubble text={['No worries!', 'Got you a drink.']} w={400} tail={1} /></g></Big></Page>), // 29
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{eyes: 'dot', mouth: 'smile'}} /><Guy x={330} pose={{armL: [60, -20], eyes: 'dot', mouth: 'smile'}} /><g transform="translate(360 680)"><DoodleBubble text={['Thanks for', 'catching that.']} w={420} tail={-1} /></g></Big></Page>), // 30
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [150, -40], eyes: 'happy', mouth: 'grin'}} /><Guy x={330} pose={{eyes: 'happy', mouth: 'smile'}} /><Label x={790} y={740} text="nice!" size={64} /></Big></Page>), // 31 thumbs up
  P(() => <Page><Big><Floor /><Lamp x={950} /><g transform={`translate(640 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{armL: [40, 40], armR: [40, 40], lean: 25, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /></g><Guy x={420} pose={{eyes: 'dot', mouth: 'smile', armL: [60, -20]}} /><g transform="translate(720 700)"><DoodleBubble text={['Oh, sorry!']} w={320} tail={1} /></g><g transform="translate(330 560)"><DoodleBubble text={['All good, man.']} w={380} tail={-1} /></g></Big></Page>), // 32 street, the other guy says sorry
  P(() => <Page><Big><Floor /><g transform={`translate(560 ${FLOOR})`}><DoodleTable /></g><Waiter dish="burger" /><Guy x={300} pose={{eyes: 'dot', mouth: 'smile', armL: [60, -30]}} /><g transform="translate(330 640)"><DoodleBubble text={['Thanks — but I', 'ordered the burger.']} w={460} tail={-1} /></g><g transform="translate(730 860)"><DoodleBubble text={['Oh! Right away.']} w={340} tail={1} /></g></Big></Page>), // 33
  P(() => <Page><Big><Floor /><Lift /><g transform={`translate(330 ${FLOOR - 170})`}><StickFigure pose={{armR: [90, 0], eyes: 'happy', mouth: 'smile'}} /></g><g transform={`translate(700 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{eyes: 'happy', mouth: 'grin', legL: [20, 6], legR: [-8, 0]}} hat="#E5484D" /></g><g transform="translate(700 600)"><DoodleBubble text={['Thanks!']} w={260} tail={1} /></g></Big></Page>), // 34 holds the lift
  P(() => <Page lines={false}><Phone lines={['Thanks for', 'your patience!']} /></Page>), // 35
  P(() => <Page lines={false}><Phone lines={['Thanks for', 'your patience!']} reply={['No problem!']} /></Page>), // 36
  P(() => <Page><Floor />{[[230, 0.45, 'thanks'], [540, 0.8, 'thanks'], [850, 1.2, 'THANK YOU']].map(([x, k, c], i) => <g key={i}><g transform={`translate(${x} ${FLOOR}) scale(${k}) translate(0 -170)`}><StickFigure pose={{eyes: 'happy', mouth: 'grin', armL: i === 2 ? [150, -10] : [12, 10], armR: i === 2 ? [150, -10] : [-12, -10]}} /></g><Label x={x as number} y={FLOOR - 560 * (k as number) - 40} text={c as string} red={i === 2} size={54} /></g>)}</Page>), // 37 he grows back
  P(() => <Page><g transform="translate(540 1500) scale(2.4) translate(-520 -1400)"><g transform="translate(520 1400)"><DoodleChair tipped={-18} /></g><path d="M 380 1400 L 470 1250 L 430 1100" {...INKL} strokeWidth={10} /></g><g transform="translate(560 800) scale(1.6)"><Bonk /></g></Page>), // 38 BONK again
  P(() => <Page><Big><Cafe tipped cup /><Friend x={880} pose={{armL: [60, 90], armR: [60, 90], lean: -12, eyes: 'happy', mouth: 'open'}} /><Guy x={330} pose={{armL: [60, 30], lean: 10, eyes: 'dot', mouth: 'smile'}} /><g transform="translate(330 680)"><DoodleBubble text={['…thanks, chair.']} w={420} tail={-1} /></g><Label x={800} y={760} text="HA!" size={70} /></Big></Page>), // 39
  // ── the close ──
  P(() => <Page><Label x={540} y={360} text="sorry = your mistake" size={70} color="#8A8478" /><Label x={540} y={480} text="thank you = them" red size={84} rot={-2} /><Ebo x={520} y={2480} s={3} p={{eyes: 'half', mouth: 'smile'}} /></Page>), // 40
];

export const Ep12Board: React.FC = () => {
  useMarkerFont();
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <svg viewBox="0 0 1080 1920" width="100%" height="100%">
              {PANELS[Math.min(f, PANELS.length - 1)]()}
            </svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
