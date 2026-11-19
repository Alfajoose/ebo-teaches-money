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
import {Bonk, DoodleAnim, DoodleBubble, DoodleChair, DoodleCup, DoodleTable, MotionLines, SketchPage, StickFigure, StickPose, TickTock} from '../components/StickFigures';

/**
 * Ep 12 "Why Saying Sorry Too Much Makes People Respect You Less": the storyboard (experiment). Ebo narrates in
 * front of a big sketchbook page; stick figures (his doodles) act the story out on it. One panel per script line.
 */
export const EP12_BOARD_PANELS = 40;
const FLOOR = 1400;
type Look = Partial<Pose>;
const Ebo: React.FC<{x?: number; y?: number; s?: number; p?: Look}> = ({x = 540, y = 2170, s = 2.25, p = {}}) => {
  const {f, mouth} = React.useContext(DoodleAnim);
  const sway = {tilt: 1.3 * Math.sin(f / 14), lift: 2.5 * Math.sin(f / 10)};
  return <RigCharacter who="ebo" x={x} y={y} scale={s} t={f} noBlink={f === 0} mouthFrame={mouth} pose={gentle(frontOn({...POSE.stand, eyes: 'half', mouth: 'smile', ...p, tilt: sway.tilt, lift: sway.lift} as Pose))} />;
};
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

/** Props in context (no infographics, the user's note). */
const Folder: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -90 -60 L -40 -60 L -24 -76 L 90 -76 L 90 60 L -90 60 Z" {...INKL} fill="#F2C230" strokeWidth={6} />
    <text y={10} textAnchor="middle" fontFamily="EboMarker" fontSize={30} fill="#1D1A1A">BIG</text>
    <text y={42} textAnchor="middle" fontFamily="EboMarker" fontSize={26} fill="#1D1A1A">PROJECT</text>
  </g>
);
const Invite: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-60} y={-40} width={120} height={80} {...INKL} fill="#F7B6CB" strokeWidth={5} />
    <text y={10} textAnchor="middle" fontFamily="EboMarker" fontSize={26} fill="#1D1A1A">PARTY!</text>
  </g>
);
const Whiteboard: React.FC = () => (
  <g transform="translate(540 760)">
    <rect x={-330} y={-300} width={660} height={560} rx={12} {...INKL} fill="#fff" strokeWidth={10} />
    <text y={-210} textAnchor="middle" fontFamily="EboMarker" fontSize={64} fill="#1D1A1A">THE TEAM</text>
    {['Mica', 'Christy', 'Him', 'Obuor'].map((n, i) => <text key={n} x={-220} y={-110 + i * 90} fontFamily="EboMarker" fontSize={56} fill="#1D1A1A">{i + 1}. {n}</text>)}
    <path d="M -230 70 L 120 50" stroke="#E5484D" strokeWidth={14} strokeLinecap="round" />
  </g>
);
const Fridge: React.FC<{note: 'sorry' | 'crossed' | 'thanks'}> = ({note}) => (
  <g transform={`translate(540 ${FLOOR})`}>
    <rect x={-260} y={-1100} width={520} height={1100} rx={30} {...INKL} fill="#fff" strokeWidth={10} />
    <line x1={-260} y1={-720} x2={260} y2={-720} {...INKL} />
    <path d="M -210 -900 L -210 -800 M -210 -640 L -210 -500" {...INKL} strokeWidth={14} />
    <g transform="translate(40 -880) rotate(-4)">
      <rect x={-180} y={-150} width={360} height={360} {...INKL} fill="#FFE45C" strokeWidth={6} />
      <text y={-40} textAnchor="middle" fontFamily="EboMarker" fontSize={84} fill="#1D1A1A">sorry</text>
      {note !== 'sorry' && <path d="M -130 -70 L 130 -70" stroke="#E5484D" strokeWidth={14} strokeLinecap="round" />}
      {note === 'thanks' && <text y={110} textAnchor="middle" fontFamily="EboMarker" fontSize={72} fill="#E5484D">thank you</text>}
    </g>
  </g>
);

const P = (fn: (l: number) => React.ReactNode) => fn;
export const PANELS: ((l: number) => React.ReactNode)[] = [
  // ── the mistake ──
  P(() => <Page><g transform="translate(540 820) scale(0.9)"><StickFigure pose={{mouth: 'smile'}} /></g><Ebo p={{eyes: 'squint', mouth: 'smirk', armL: [110, -10]}} /></Page>), // 1 Watch this guy
  P((l) => <Page><Big><Cafe /><CafeDoor open /><Friend x={880} pose={CROSSED} /><Guy x={l < 0.4 ? -200 + 500 * (1 - (1 - l / 0.4) ** 2) : 300} pose={{armL: [130, 20], armR: [150, 10], legL: [40, 30], legR: [-30, 10], lean: 18, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform={`translate(150 ${FLOOR - 330})`}><MotionLines /></g></Big></Page>), // 2 door bangs open
  P(() => <Page><Face pose={{eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform="translate(540 420) scale(1.8)"><DoodleBubble text={['Sorry!']} w={300} /></g></Page>), // 3 Sorry!
  P(() => <Page><WallClock /><g transform="translate(540 1450) scale(1.7)"><DoodleBubble text={["Sorry I'm late—"]} w={440} tail={1} /></g></Page>), // 4 clock
  P(() => <Page><Face pose={{brows: 'angry', mouth: 'flat', eyes: 'side'}} hat="#3E6FD8" facing={-1} /></Page>), // 5 friend's face
  P(() => <Page><g transform="translate(540 1500) scale(2.4) translate(-520 -1400)"><g transform="translate(520 1400)"><DoodleChair tipped={-18} /></g><path d="M 380 1400 L 470 1250 L 430 1100" {...INKL} strokeWidth={10} /></g><g transform="translate(560 800) scale(1.6)"><Bonk /></g></Page>), // 6 BONK
  P(() => <Page><Big><Cafe tipped /><Friend x={880} pose={{armL: [25, 110], armR: [70, -120], brows: 'angry', mouth: 'flat', eyes: 'side'}} /><Guy x={330} pose={{armL: [40, 40], armR: [40, 40], lean: 35, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /><g transform="translate(330 760)"><DoodleBubble text={['…sorry.']} w={300} tail={1} /></g><g transform={`translate(240 ${FLOOR + 60}) scale(1.1)`}><Cricket /></g></Big></Page>), // 7 sorry to the chair
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [100, 20], brows: 'angry', mouth: 'frown'}} /><Guy x={330} pose={{eyes: 'wide', mouth: 'o', brows: 'worried'}} /><path d="M 520 1180 l -30 -40 M 600 1170 l 0 -50 M 680 1180 l 30 -40" stroke="#1D1A1A" strokeWidth={7} strokeLinecap="round" /></Big></Page>), // 8 office
  P(() => <Page><Papers /></Page>), // 9 red crosses
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [20, 80], armL: [20, 80], brows: 'angry', mouth: 'flat'}} /><Guy x={330} pose={{armL: [60, 90], armR: [60, 90], lean: 20, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} /><g transform="translate(360 680)"><DoodleBubble text={['Sorry, sorry,', "I'll fix it!"]} w={400} tail={-1} /></g></Big></Page>), // 10 grovels
  P(() => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={760} /><Guy x={300} pose={{eyes: 'dot', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} /></Big></Page>), // 11 street
  P((l) => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={l < 0.25 ? 760 - 160 * (l / 0.25) : 600} /><g transform="translate(540 1110) scale(0.8)"><Bonk /></g><Guy x={460} pose={{lean: -14, armL: [70, -20], eyes: 'wide', mouth: 'o'}} /></Big></Page>), // 12 collide
  P(() => <Page><Big><Floor /><Lamp x={950} /><PhoneGuy x={720} lean={0} /><Guy x={380} pose={{armL: [40, 40], armR: [40, 40], lean: 30, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /><g transform="translate(330 700)"><DoodleBubble text={['Oh— sorry!']} w={340} tail={1} /></g></Big></Page>), // 13 he apologises
  P(() => <Page><Big><Floor /><g transform={`translate(560 ${FLOOR})`}><DoodleTable /></g><Waiter dish="fish" /><Guy x={260} pose={{eyes: 'wide', mouth: 'smile', brows: 'worried', armL: [60, -30]}} /><g transform="translate(560 760)"><DoodleBubble text={["Sorry, it's fine!"]} w={420} tail={-1} /></g><g transform="translate(330 420)"><path d="M -150 40 Q -170 -60 -60 -70 Q 0 -130 70 -70 Q 170 -60 150 40 Q 140 110 40 100 Q -20 140 -80 100 Q -160 110 -150 40 Z" {...INKL} fill="#fff" strokeWidth={7} /><ellipse cx={0} cy={0} rx={70} ry={32} fill="#E2B04A" stroke="#1D1A1A" strokeWidth={5} /><rect x={-70} y={8} width={140} height={16} fill="#7A4A2A" /><circle cx={-20} cy={190} r={16} {...INKL} fill="#fff" strokeWidth={5} /><circle cx={-40} cy={150} r={22} {...INKL} fill="#fff" strokeWidth={5} /></g></Big></Page>), // 14 restaurant: fish for him, HIS burger at the next table
  P(() => <Page><Big><Floor /><Lift shut /><g transform={`translate(420 ${FLOOR - 170})`}><StickFigure pose={{armR: [90, 0], eyes: 'wide', mouth: 'open', brows: 'worried'}} /></g><g transform="translate(330 560)"><DoodleBubble text={['Sorry!']} w={300} tail={1} /></g></Big></Page>), // 15 lift
  P(() => <Page lines={false}><Phone lines={['Sorry for the', 'late reply,', 'sorry…']} /></Page>), // 16 phone
  P(() => <Page lines={false}><Phone lines={['sorry', 'sorry!!', 'so sorry']} reply={['…ok?']} /></Page>), // 17 group chat
  // ── why ──
  P(() => <Page><Ebo x={540} y={2350} s={2.6} p={{eyes: 'half', mouth: 'flat'}} /></Page>), // 18 Don't be that guy
  P((l) => <Page><Big><Floor /><Desk x={540} /><Boss x={820} pose={{armR: [100, -10], eyes: 'side', mouth: 'flat'}} /><g transform={`translate(${830 - Math.min(l, 0.5) * 900} ${FLOOR - 280})`}><Folder x={0} y={0} /></g><g transform={`translate(260 ${FLOOR - 170})`}><StickFigure pose={{armR: [100, -10], eyes: 'happy', mouth: 'grin'}} hat="#7BC47F" /></g><Guy x={540} pose={{eyes: 'wide', mouth: 'o', brows: 'worried'}} /></Big></Page>), // 19 the big project goes past him
  P(() => <Page><Big><Floor /><g transform={`translate(640 ${FLOOR - 170})`}><StickFigure pose={{armR: [160, -10], eyes: 'happy', mouth: 'grin'}} hat="#7BC47F" hold={<rect x={-14} y={-40} width={28} height={46} rx={5} fill="#1D1A1A" />} /></g><g transform={`translate(820 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{armL: [150, -10], eyes: 'happy', mouth: 'grin'}} hat="#3E6FD8" /></g><Guy x={300} pose={{armL: [130, -10], eyes: 'dot', mouth: 'flat', brows: 'worried', lean: -8}} /><g transform="translate(270 760)"><DoodleBubble text={["…me?"]} w={240} tail={-1} /></g></Big></Page>), // 20 the group selfie, he's left out of frame
  P(() => <Page><Big><Floor />{[500, 660, 820].map((x, i) => <g key={x} transform={`translate(${x} ${FLOOR - 170})`}><StickFigure facing={i ? -1 : 1} pose={{armR: [165, -5], armL: [165, -5], eyes: 'happy', mouth: 'grin'}} hat={['#7BC47F', '#3E6FD8', undefined][i]} /></g>)}<path d="M 640 860 l -20 -30 M 660 850 l 0 -36 M 680 860 l 20 -30" stroke="#1D1A1A" strokeWidth={6} strokeLinecap="round" /><Guy x={230} pose={{armL: [150, -10], eyes: 'dot', mouth: 'flat', brows: 'worried'}} /></Big></Page>), // 21 the team high-five without him
  P((l) => <Page><Floor /><g transform={`translate(560 ${FLOOR - 170})`}><StickFigure pose={{armL: [150, -10], eyes: 'wide', mouth: 'smile', brows: 'worried'}} /></g>{[120, 980].map((x, i) => <g key={x} transform={`translate(${x + (i ? -1 : 1) * (Math.min(l, 1.4) / 1.4) * 760} ${FLOOR - 170 + (i ? 30 : -30)})`}><StickFigure facing={i ? -1 : 1} pose={{eyes: 'side', mouth: 'smile', legL: [20, 6], legR: [-8, 0]}} hat={i ? '#3E6FD8' : undefined} /></g>)}<g transform="translate(560 760)"><DoodleBubble text={["hey—?"]} w={260} tail={-1} /></g></Page>), // 22 friends walk past
  // ── the fix ──
  P(() => <Page><Ebo p={{eyes: 'squint', mouth: 'smile', armL: [140, -10]}} /></Page>), // 23 Here's the fix
  P(() => <Page><Face pose={{eyes: 'wide', mouth: 'open', brows: 'worried'}} /><g transform="translate(540 420) scale(1.7)"><DoodleBubble text={['Sor—']} w={260} /></g></Page>), // 24 he starts to say sorry…
  P(() => <Page><g transform="translate(540 1450) scale(2) translate(0 -170)"><StickFigure pose={{eyes: 'wide', mouth: 'flat', brows: 'worried', armR: [100, 149], armL: [-100, -159], lean: -6}} /></g></Page>), // 25 …catches himself (hands over his mouth)
  P(() => <Page><Face pose={{eyes: 'happy', mouth: 'grin'}} /><g transform="translate(540 420) scale(1.7)"><DoodleBubble text={['Thank you!']} w={340} /></g></Page>), // 26 …and says thank you
  // ── the replay ──
  P((l) => <Page><Big><Cafe /><CafeDoor open /><Friend x={880} pose={{eyes: 'dot', mouth: 'smile'}} /><Guy x={l < 0.6 ? -100 + 400 * (l / 0.6) : 300} pose={{eyes: 'happy', mouth: 'grin', legL: [20, 6], legR: [-8, 0], armL: [60, -30]}} /></Big></Page>), // 27 walks in relaxed
  P(() => <Page><Face pose={{eyes: 'happy', mouth: 'grin'}} /><g transform="translate(540 420) scale(1.6)"><DoodleBubble text={['Thanks for waiting!']} w={520} /></g></Page>), // 28
  P(() => <Page><Big><Cafe cup /><Friend x={880} pose={{armL: [70, -20], eyes: 'happy', mouth: 'grin'}} /><Guy x={330} pose={{eyes: 'happy', mouth: 'grin'}} /><g transform="translate(690 820)"><DoodleBubble text={['No worries!', 'Got you a drink.']} w={400} tail={1} /></g></Big></Page>), // 29
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{eyes: 'dot', mouth: 'smile'}} /><Guy x={330} pose={{armL: [60, -20], eyes: 'dot', mouth: 'smile'}} /><g transform="translate(360 680)"><DoodleBubble text={['Thanks for', 'catching that.']} w={420} tail={-1} /></g></Big></Page>), // 30
  P(() => <Page><Big><Floor /><Desk x={600} papers /><Boss x={820} pose={{armR: [150, -40], eyes: 'happy', mouth: 'grin'}} /><Guy x={330} pose={{eyes: 'happy', mouth: 'smile'}} /></Big></Page>), // 31 thumbs up
  P(() => <Page><Big><Floor /><Lamp x={950} /><g transform={`translate(640 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{armL: [40, 40], armR: [40, 40], lean: 25, eyes: 'closed', mouth: 'frown', brows: 'worried'}} /></g><Guy x={420} pose={{eyes: 'dot', mouth: 'smile', armL: [60, -20]}} /><g transform="translate(720 700)"><DoodleBubble text={['Oh, sorry!']} w={320} tail={1} /></g><g transform="translate(330 560)"><DoodleBubble text={['All good, man.']} w={380} tail={-1} /></g></Big></Page>), // 32 street, the other guy says sorry
  P(() => <Page><Big><Floor /><g transform={`translate(560 ${FLOOR})`}><DoodleTable /></g><Waiter dish="burger" /><Guy x={300} pose={{eyes: 'dot', mouth: 'smile', armL: [60, -30]}} /><g transform="translate(330 640)"><DoodleBubble text={['Thanks — but I', 'ordered the burger.']} w={460} tail={-1} /></g><g transform="translate(730 860)"><DoodleBubble text={['Oh! Right away.']} w={340} tail={1} /></g></Big></Page>), // 33
  P(() => <Page><Big><Floor /><Lift /><g transform={`translate(330 ${FLOOR - 170})`}><StickFigure pose={{armR: [90, 0], eyes: 'happy', mouth: 'smile'}} /></g><g transform={`translate(700 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{eyes: 'happy', mouth: 'grin', legL: [20, 6], legR: [-8, 0]}} hat="#E5484D" /></g><g transform="translate(700 600)"><DoodleBubble text={['Thanks!']} w={260} tail={1} /></g></Big></Page>), // 34 holds the lift
  P(() => <Page lines={false}><Phone lines={['Thanks for', 'your patience!']} /></Page>), // 35
  P(() => <Page lines={false}><Phone lines={['Thanks for', 'your patience!']} reply={['No problem!']} /></Page>), // 36
  P((l) => <Page><Big><Floor /><Desk x={540} /><Boss x={820} pose={{armR: [100, -10], eyes: 'happy', mouth: 'smile'}} /><g transform={`translate(${830 - Math.min(l, 0.4) * 1000} ${FLOOR - 280})`}><Folder x={0} y={0} /></g><Guy x={400} pose={{armL: [100, -20], eyes: 'happy', mouth: 'grin'}} /></Big></Page>), // 37 the big project goes to him
  P(() => <Page><g transform="translate(540 1500) scale(2.4) translate(-520 -1400)"><g transform="translate(520 1400)"><DoodleChair tipped={-18} /></g><path d="M 380 1400 L 470 1250 L 430 1100" {...INKL} strokeWidth={10} /></g><g transform="translate(560 800) scale(1.6)"><Bonk /></g></Page>), // 38 BONK again
  P(() => <Page><Big><Cafe tipped cup /><Friend x={880} pose={{armL: [60, 90], armR: [60, 90], lean: -12, eyes: 'happy', mouth: 'open'}} /><Guy x={330} pose={{armL: [60, 30], lean: 10, eyes: 'dot', mouth: 'smile'}} /><g transform="translate(330 680)"><DoodleBubble text={['…thanks, chair.']} w={420} tail={-1} /></g><path d="M 960 820 q 20 -20 40 0 M 980 870 q 20 -20 40 0 M 950 770 q 18 -18 36 0" stroke="#1D1A1A" strokeWidth={6} fill="none" strokeLinecap="round" /></Big></Page>), // 39
  // ── the close ──
  P(() => <Page><g transform="translate(330 900) scale(0.8)"><StickFigure pose={{armR: [130, -30], eyes: 'happy', mouth: 'grin'}} hold={<DoodleCup />} /></g><g transform="translate(760 900) scale(0.8)"><StickFigure facing={-1} pose={{armR: [130, -30], eyes: 'happy', mouth: 'grin'}} hat="#3E6FD8" hold={<DoodleCup />} /></g><Ebo x={520} y={2480} s={3} p={{eyes: 'half', mouth: 'smile'}} /></Page>), // 40
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
              {PANELS[Math.min(f, PANELS.length - 1)](99)}
            </svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
