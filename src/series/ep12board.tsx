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
export const EP12_BOARD_PANELS = 17;
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

const PANELS: (() => React.ReactNode)[] = [
  // 1 · EBO (to camera): Watch this guy.
  () => (
    <g>
      <SketchPage />
      <g transform="translate(540 820) scale(0.9)"><StickFigure pose={{mouth: 'smile'}} /></g>
      <Ebo p={{eyes: 'squint', mouth: 'smirk', armL: [110, -10]}} />
    </g>
  ),
  // 2 · Café: Sorry! Sorry I'm late—
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
        <g transform={`translate(520 ${FLOOR})`}><DoodleChair /></g>
        <Friend x={880} pose={CROSSED} />
        <Guy x={300} pose={{armL: [130, 20], armR: [150, 10], legL: [40, 30], legR: [-30, 10], lean: 18, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} />
        <g transform={`translate(150 ${FLOOR - 330})`}><MotionLines /></g>
        <g transform="translate(380 640)"><DoodleBubble text={["Sorry! Sorry", "I'm late—"]} w={420} tail={-1} /></g>
      </Big>
    </g>
  ),
  // 3 · (beat) close-up: the friend's flat face
  () => (
    <g>
      <SketchPage />
      <g transform="translate(540 1500) scale(3.2)"><StickFigure pose={{brows: 'angry', mouth: 'flat', eyes: 'side'}} facing={-1} hat="#3E6FD8" /></g>
      <Label x={540} y={380} text="…" size={150} />
    </g>
  ),
  // 4 · Café: …sorry. (to the chair)
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
        <g transform={`translate(520 ${FLOOR})`}><DoodleChair tipped={-18} /></g>
        <g transform="translate(470 1130) scale(0.7)"><Bonk /></g>
        <Friend x={880} pose={{armL: [25, 110], armR: [70, -120], brows: 'angry', mouth: 'flat', eyes: 'side'}} />
        <Guy x={330} pose={{armL: [40, 40], armR: [40, 40], lean: 35, eyes: 'closed', mouth: 'frown', brows: 'worried'}} />
        <g transform="translate(330 760)"><DoodleBubble text={['…sorry.']} w={300} tail={1} /></g>
        <g transform={`translate(240 ${FLOOR + 60}) scale(1.1)`}><Cricket /></g>
      </Big>
    </g>
  ),
  // 5 · Office: Sorry, sorry, I'll fix it!
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <Desk x={600} papers />
        <Boss x={820} pose={{armR: [60, -30], brows: 'angry', mouth: 'frown'}} />
        <Guy x={330} pose={{armL: [60, 90], armR: [60, 90], eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} />
        <g transform="translate(360 680)"><DoodleBubble text={['Sorry, sorry,', "I'll fix it!"]} w={400} tail={-1} /></g>
      </Big>
    </g>
  ),
  // 6 · Street: a man walks INTO him… and he apologises
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <Lamp x={900} />
        <g transform={`translate(640 ${FLOOR - 170})`}><StickFigure facing={-1} pose={{armR: [150, -150], eyes: 'side', mouth: 'flat', lean: 8}} hold={<rect x={-12} y={-30} width={24} height={40} rx={4} fill="#1D1A1A" />} /></g>
        <g transform="translate(560 1110) scale(0.6)"><Bonk /></g>
        <Guy x={440} pose={{lean: -14, armL: [70, -20], eyes: 'wide', mouth: 'open', brows: 'worried'}} />
        <g transform="translate(330 700)"><DoodleBubble text={['Oh— sorry!']} w={340} tail={1} /></g>
      </Big>
    </g>
  ),
  // 7 · Phone: "Sorry for the late reply, sorry."
  () => (
    <g>
      <SketchPage lines={false} />
      <Phone lines={['Sorry for the', 'late reply,', 'sorry…']} />
    </g>
  ),
  // 8 · EBO (to camera): Don't be that guy.
  () => (
    <g>
      <SketchPage />
      <Ebo x={540} y={2350} s={2.6} p={{eyes: 'half', mouth: 'flat'}} />
    </g>
  ),
  // 9 · Every sorry tells people you messed up… (he shrinks, sorry by sorry)
  () => (
    <g>
      <SketchPage />
      <Floor />
      {[[230, 1.1, 'sorry'], [540, 0.75, 'sorry ×10'], [850, 0.45, 'sorry ×47']].map(([x, k, c], i) => (
        <g key={i}>
          <g transform={`translate(${x} ${FLOOR}) scale(${k}) translate(0 -170)`}><StickFigure pose={{eyes: i ? 'closed' : 'dot', mouth: i ? 'frown' : 'flat', brows: 'worried', lean: 6 + i * 8}} /></g>
          <Label x={x as number} y={FLOOR - 560 * (k as number) - 40} text={c as string} size={54} />
        </g>
      ))}
      <path d="M 330 600 l 400 0 M 700 570 l 32 30 l -32 30" stroke="#E5484D" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label x={540} y={520} text="respect" red size={70} />
    </g>
  ),
  // 10 · EBO (to camera): Here's the fix.
  () => (
    <g>
      <SketchPage />
      <Ebo p={{eyes: 'squint', mouth: 'smile', armL: [130, -10]}} />
    </g>
  ),
  // 11 · Swap "sorry"… for "thank you".
  () => (
    <g>
      <SketchPage />
      <Label x={540} y={420} text="sorry" size={130} />
      <path d="M 360 380 L 720 380" stroke="#E5484D" strokeWidth={16} strokeLinecap="round" />
      <path d="M 540 470 l 0 90 M 510 530 l 30 30 l 30 -30" stroke="#1D1A1A" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label x={540} y={700} text="thank you" red size={140} rot={-3} />
      <Ebo p={{eyes: 'happy', mouth: 'grin', armL: [100, -20]}} />
    </g>
  ),
  // 12 · Café: Thanks for waiting! / No worries! Got you a drink.
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
        <g transform={`translate(520 ${FLOOR})`}><DoodleChair /></g>
        <g transform={`translate(660 ${FLOOR - 190})`}><DoodleCup /></g>
        <Friend x={880} pose={{armL: [70, -20], eyes: 'happy', mouth: 'grin'}} />
        <Guy x={330} pose={{armL: [100, -30], armR: [12, 10], eyes: 'happy', mouth: 'grin'}} />
        <g transform="translate(320 600)"><DoodleBubble text={['Thanks for', 'waiting!']} w={380} tail={-1} /></g>
        <g transform="translate(690 820)"><DoodleBubble text={['No worries!', 'Got you a drink.']} w={400} tail={1} /></g>
      </Big>
    </g>
  ),
  // 13 · Office: Thanks for catching that. (thumbs up)
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <Desk x={600} papers />
        <Boss x={820} pose={{armR: [150, -40], eyes: 'happy', mouth: 'smile'}} />
        <Guy x={330} pose={{armL: [60, -20], eyes: 'dot', mouth: 'smile'}} />
        <g transform="translate(360 680)"><DoodleBubble text={['Thanks for', 'catching that.']} w={420} tail={-1} /></g>
        <Label x={790} y={740} text="nice!" size={64} />
      </Big>
    </g>
  ),
  // 14 · Phone: "Thanks for your patience!" / "No problem!"
  () => (
    <g>
      <SketchPage lines={false} />
      <Phone lines={['Thanks for', 'your patience!']} reply={['No problem!']} />
    </g>
  ),
  // 15 · Same mistakes. Different guy. (he grows back, thank you by thank you)
  () => (
    <g>
      <SketchPage />
      <Floor />
      {[[230, 0.45, 'thanks'], [540, 0.8, 'thanks'], [850, 1.2, 'THANK YOU']].map(([x, k, c], i) => (
        <g key={i}>
          <g transform={`translate(${x} ${FLOOR}) scale(${k}) translate(0 -170)`}><StickFigure pose={{eyes: 'happy', mouth: 'grin', armL: i === 2 ? [150, -10] : [12, 10], armR: i === 2 ? [150, -10] : [-12, -10]}} /></g>
          <Label x={x as number} y={FLOOR - 560 * (k as number) - 40} text={c as string} red={i === 2} size={54} />
        </g>
      ))}
      <path d="M 330 600 l 400 0 M 700 570 l 32 30 l -32 30" stroke="#2E7D5B" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label x={540} y={520} text="respect" size={70} color="#2E7D5B" />
    </g>
  ),
  // 16 · Café: …thanks, chair. (the friend laughs)
  () => (
    <g>
      <SketchPage />
      <Big>
        <Floor />
        <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
        <g transform={`translate(520 ${FLOOR})`}><DoodleChair tipped={-18} /></g>
        <g transform={`translate(660 ${FLOOR - 190})`}><DoodleCup /></g>
        <Friend x={880} pose={{armL: [60, 90], armR: [60, 90], lean: -12, eyes: 'happy', mouth: 'open'}} />
        <Guy x={330} pose={{armL: [60, 30], lean: 10, eyes: 'dot', mouth: 'smile'}} />
        <g transform="translate(470 1130) scale(0.7)"><Bonk /></g>
        <g transform="translate(330 680)"><DoodleBubble text={['…thanks, chair.']} w={420} tail={-1} /></g>
        <Label x={800} y={760} text="HA!" size={70} />
      </Big>
    </g>
  ),
  // 17 · EBO (to camera): "Sorry" makes it about your mistake. "Thank you" makes it about them.
  () => (
    <g>
      <SketchPage />
      <Label x={540} y={360} text="sorry = your mistake" size={70} color="#8A8478" />
      <Label x={540} y={480} text="thank you = them" red size={84} rot={-2} />
      <Ebo x={520} y={2480} s={3} p={{eyes: 'half', mouth: 'smile'}} />
    </g>
  ),
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
