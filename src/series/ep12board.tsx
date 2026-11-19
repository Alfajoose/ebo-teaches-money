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
export const EP12_BOARD_PANELS = 8;
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

const PANELS: (() => React.ReactNode)[] = [
  // 1 · EBO (to camera): Watch this guy.
  () => (
    <g>
      <SketchPage />
      <g transform="translate(540 820) scale(0.9)"><StickFigure pose={{mouth: 'smile'}} /></g>
      <Ebo p={{eyes: 'squint', mouth: 'smirk', armL: [110, -10]}} />
    </g>
  ),
  // 2 · (as the stick guy) Sorry! Sorry I'm late, sorry, the traffic— sorry!
  () => (
    <g>
      <SketchPage />
      <Big>
      <Floor />
      <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
      <g transform={`translate(520 ${FLOOR})`}><DoodleChair tipped={-18} /></g>
      <Friend x={880} pose={CROSSED} />
      <Guy x={330} pose={{armL: [130, 20], armR: [150, 10], legL: [40, 30], legR: [-30, 10], lean: 18, eyes: 'wide', mouth: 'open', brows: 'worried', sweat: true}} />
      <g transform={`translate(170 ${FLOOR - 330})`}><MotionLines /></g>
      <g transform="translate(470 1130) scale(0.8)"><Bonk /></g>
      <g transform="translate(400 560)"><DoodleBubble text={['Sorry! Sorry I\'m late,', 'sorry, the traffic—', 'SORRY!']} w={620} tail={-1} /></g>
      </Big>
    </g>
  ),
  // 3 · …Sorry. (to the chair)  The friend checks his watch. Cricket.
  () => (
    <g>
      <SketchPage />
      <Big>
      <Floor />
      <g transform={`translate(720 ${FLOOR})`}><DoodleTable /></g>
      <g transform={`translate(520 ${FLOOR})`}><DoodleChair /></g>
      <Friend x={880} pose={{armL: [25, 110], armR: [70, -120], brows: 'angry', mouth: 'flat', eyes: 'side'}} />
      <g transform="translate(860 840)"><TickTock /></g>
      <Guy x={330} pose={{armL: [40, 40], armR: [40, 40], lean: 35, eyes: 'closed', mouth: 'frown', brows: 'worried'}} />
      <g transform="translate(330 760)"><DoodleBubble text={['…sorry.']} w={300} tail={1} /></g>
      <g transform={`translate(240 ${FLOOR + 60}) scale(1.1)`}><Cricket /></g>
      </Big>
    </g>
  ),
  // 4 · EBO (to camera): Don't be that guy…
  () => (
    <g>
      <SketchPage />
      <g transform="translate(330 900) scale(0.95)"><StickFigure pose={{lean: 30, eyes: 'closed', mouth: 'frown', brows: 'worried', armL: [40, 40], armR: [40, 40]}} /></g>
      <g transform="translate(560 520)"><DoodleBubble text={['sorry…']} w={300} /></g>
      <Ebo p={{eyes: 'half', mouth: 'flat', armL: [70, -40]}} />
    </g>
  ),
  // 5 · Here's the fix. Swap "sorry"… for "thank you".
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
  // 6 · Same guy, same late. "Thanks for waiting!" / friend: No worries! Got you a drink.
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
  // 7 · …Thanks, chair.  (bumps the same chair; the friend laughs)
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
  // 8 · EBO (to camera): "Sorry" makes it about your mistake. "Thank you" makes it about them.
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
