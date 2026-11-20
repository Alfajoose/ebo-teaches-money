import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {POSE, CONTACT, frontOn, gentle} from '../cast/poses';
import {StageSizeContext} from './exportCtx';
import {useMarkerFont} from './filterKit';
import {Ep13Anim} from './ep13board';
import {
  AutoDoorSet, AutoDoors, BigCouch, Briefcase, CafeCounter, CafeSet, FLOOR, KitchenSet, KitchenTable, LivingRoomSet, Notepad, OfficeDesk, OfficeSet,
  ChairSet, Papers, RestaurantSet, RestaurantTable, SidewalkSet, Smartphone, StompClose, Tray, Mug,
} from '../components/SorryProps';

/**
 * Ep 13 v3: the user's reference storyboard staged with their rigs in real sets (SorryProps). Ebo tells it; Ama is his
 * wife; Obuor in his suit (the `boss` rig) is the boss ("his phone"); Ama Pretty the waiter, Christy the barista; Mica the stranger. No text on screen.
 * 46 shots on the same voice track; each panel is (l = seconds into the shot) => drawing.
 */
type Look = Partial<Pose>;
const VOICE: Partial<Record<CastId, string>> = {ebo: 'ebo', ama: 'wife', mica: 'stranger'};
const S = 1.2;
const R: React.FC<{who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; hold?: React.ReactNode; holdL?: React.ReactNode; talk?: boolean; touch?: keyof typeof CONTACT; cycle?: 'fastWalk' | 'walk'}> = ({who, x, y = FLOOR, s = S, p = {}, facing = 1, hold, holdL, talk, touch, cycle}) => {
  const {f, speaker, mouth} = React.useContext(Ep13Anim);
  const front = who === 'ebo' || who === 'ama';
  let pose = {...(front ? POSE.stand : (POSES.standing as Pose)), ...p} as Pose;
  if (touch) pose = {...pose, ...CONTACT[touch], ...p, contact: true, view: 1} as Pose;
  // no sway: the user asked for no wobbly effects (still poses, the cast moves only when acting)
  const lip = talk && speaker === VOICE[who] ? mouth : undefined;
  return (
    <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={f} noBlink={f === 0} mouthFrame={lip} cycle={cycle} pose={front && !touch && !cycle ? gentle(frontOn(pose)) : gentle(pose)} holdL={holdL}>
      {hold}
    </RigCharacter>
  );
};
/** Head-and-shoulders over a set. */
const Close: React.FC<{who: CastId; p?: Look; facing?: 1 | -1; talk?: boolean; touch?: keyof typeof CONTACT; hold?: React.ReactNode; x?: number}> = ({x = 540, ...props}) => <R x={x} y={1980} s={2.6} {...props} />;
/** A set pushed in (a closer framing of the same place). */
const Zoom: React.FC<{k: number; cx?: number; cy?: number; children: React.ReactNode}> = ({k, cx = 540, cy = 1100, children}) => <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>{children}</g>;
/** A split frame: two scenes side by side, each the full frame at half size. */
const Split: React.FC<{left: React.ReactNode; right: React.ReactNode; l: number}> = ({left, right, l}) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#FFFDF6" />
    <defs><clipPath id="splitL"><rect x={0} y={480} width={540} height={960} /></clipPath><clipPath id="splitR"><rect x={540} y={480} width={540} height={960} /></clipPath></defs>
    <g clipPath="url(#splitL)"><g transform="translate(0 480) scale(0.5)">{left}</g></g>
    {l > 0.25 && <g clipPath="url(#splitR)"><g transform="translate(540 480) scale(0.5)">{right}</g></g>}
    <path d="M 540 470 L 540 1450" stroke="#1D1A1A" strokeWidth={10} />
    <rect x={0} y={480} width={1080} height={960} fill="none" stroke="#1D1A1A" strokeWidth={10} />
  </g>
);
const NERVOUS: Look = {...POSE.nervous, mouth: 'grin', eyes: 'happy', sweat: 1};
const SLUMP: Look = {...POSE.sad, eyes: 'sad', mouth: 'frown', tilt: 6};
const TALL: Look = {...POSE.happy, eyes: 'open', mouth: 'smile'};
const PAD = <g transform="scale(0.55) rotate(-8)"><Notepad /></g>;
const PHONE = <g transform="scale(0.55)"><Smartphone /></g>;
/** Speed lines for a walk-past / bump (marks only, no words). */
const Whoosh: React.FC<{x: number; y: number; dir?: 1 | -1}> = ({x, y, dir = 1}) => (
  <path d={`M ${x} ${y} l ${-120 * dir} 0 M ${x} ${y + 50} l ${-170 * dir} 0 M ${x} ${y + 100} l ${-110 * dir} 0`} stroke="#1D1A1A" strokeWidth={9} strokeLinecap="round" />
);
/** Seated at a table: the chair behind, the rig lowered so the table hides the legs. */
const SEAT = FLOOR - 60;
const walk = (l: number, from: number, to: number, dur = 1.6) => from + (to - from) * Math.min(1, l / dur);

export const V3_PANELS: ((l: number) => React.ReactNode)[] = [
  // ── the hook ──
  /* 1 */ (l) => <g><SidewalkSet /><R who="ama" x={walk(l, 160, 260)} s={1.05} /><R who="ebo" x={walk(l, 340, 440)} p={{eyes: 'happy', mouth: 'smile'}} /><R who="mica" x={walk(l, 1100, 820, 0.8)} facing={-1} p={{eyes: 'half', mouth: 'flat'}} cycle="fastWalk" hold={<g transform="scale(0.5)"><Briefcase /></g>} /></g>,
  /* 2 */ (l) => <StompClose l={l} />,
  /* 3 */ (l) => <g><SidewalkSet /><R who="ebo" x={540} y={1780} s={1.7} p={{eyes: 'squint', mouth: 'grin', sweat: 1, brows: 'sad', legR: [35, -30], armR: [20, 10], armL: [-25, -10], lift: -40 * Math.abs(Math.sin(l * 7)), tilt: 6 * Math.sin(l * 7)}} /></g>,
  /* 4 */ (l) => <g><SidewalkSet /><R who="ebo" x={330} p={{...NERVOUS, tilt: 10}} talk /><R who="mica" x={walk(l, 640, 980, 1)} facing={1} p={{eyes: 'half', mouth: 'flat'}} cycle="fastWalk" hold={<g transform="scale(0.5)"><Briefcase /></g>} /></g>,
  /* 5 */ () => <g><SidewalkSet /><Close who="ama" touch="armsCrossed" p={{eyes: 'half', mouth: 'flat', brows: 'up'}} /></g>,
  /* 6 */ () => <g><SidewalkSet /><R who="ama" x={330} touch="armsCrossed" p={{eyes: 'half', mouth: 'flat'}} talk /><R who="ebo" x={760} p={{eyes: 'open', mouth: 'flat'}} /></g>,
  /* 7 */ () => <g><SidewalkSet /><R who="ebo" x={360} s={1.5} p={{...POSE.shrug}} talk /><R who="ama" x={800} p={{eyes: 'half', mouth: 'flat'}} /></g>,
  /* 8 */ () => <g><SidewalkSet /><R who="ebo" x={300} p={{...POSE.shrug, mouth: 'flat'}} /><R who="ama" x={720} s={1.4} p={{eyes: 'squint', mouth: 'smirk', armR: [70, 20]}} hold={PAD} /></g>,
  // ── the count ──
  /* 9 */ () => <g><RestaurantSet /><ChairSet x={300} /><ChairSet x={720} /><R who="ama" x={720} y={SEAT} p={{eyes: 'half', mouth: 'flat', armR: [60, 20]}} hold={PAD} /><R who="ebo" x={300} y={SEAT} p={{...POSE.wave, mouth: 'smile'}} /><RestaurantTable x={510} glass="full" /><R who="pretty" x={980} facing={-1} p={{eyes: 'open', mouth: 'smile', armR: [80, 10]}} hold={<g transform="scale(0.7)"><Tray /></g>} /></g>,
  /* 10 */ () => <g><RestaurantSet /><Close who="ebo" p={{...NERVOUS, armR: [150, 20]}} talk /></g>,
  /* 11 */ (l) => <g><RestaurantSet /><Close who="ama" x={500} p={{eyes: 'half', mouth: 'flat', armR: [70 - 14 * Math.sin(Math.min(1, l / 0.3) * Math.PI), 20]}} hold={PAD} /></g>,
  /* 12 */ () => <g><OfficeSet /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'half', mouth: 'flat'}} hold={PHONE} /><OfficeDesk x={700} /><R who="ebo" x={180} p={{...NERVOUS, mouth: 'smile'}} /></g>,
  /* 13 */ () => <g><OfficeSet /><Close who="ebo" x={420} p={{...NERVOUS, armR: [70, 20]}} talk /></g>,
  /* 14 */ (l) => <g><OfficeSet /><R who="ama" x={150} s={1.0} p={{eyes: 'half', mouth: 'flat', armR: [70 - 14 * Math.sin(Math.min(1, l / 0.3) * Math.PI), 20]}} hold={PAD} /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'half'}} hold={PHONE} /><OfficeDesk x={700} /><R who="ebo" x={420} p={NERVOUS} /></g>,
  /* 15 */ (l) => <g><SidewalkSet /><R who="ebo" x={420} p={{...POSE.shocked, tilt: -12}} /><R who="mica" x={walk(l, 900, 620, 0.25)} facing={-1} p={{eyes: 'half', mouth: 'flat', tilt: 10}} hold={<g transform="scale(0.5)"><Briefcase /></g>} /><Whoosh x={1060} y={980} /></g>,
  /* 16 */ () => <g><SidewalkSet /><R who="ebo" x={360} p={NERVOUS} talk /><R who="mica" x={830} facing={1} p={{eyes: 'half', mouth: 'flat'}} /></g>,
  /* 17 */ (l) => <g><SidewalkSet /><R who="ebo" x={360} p={NERVOUS} /><R who="ama" x={860} s={0.95} p={{eyes: 'half', mouth: 'flat', armR: [70 - 14 * Math.sin(Math.min(1, l / 0.3) * Math.PI), 20]}} hold={PAD} /></g>,
  /* 18 */ (l) => <g><AutoDoorSet /><AutoDoors open={Math.min(1, l / 0.3)} /><R who="ebo" x={540} p={{...NERVOUS, tilt: 12}} talk /></g>,
  /* 19 */ (l) => <g><CafeSet /><R who="christy" x={720} facing={-1} p={{eyes: 'open', mouth: 'smile'}} /><CafeCounter x={700} /><R who="ama" x={70} s={0.95} p={{eyes: 'half', mouth: 'flat', armR: [70 - 14 * Math.sin(Math.min(1, l / 0.3) * Math.PI), 20]}} hold={PAD} /><R who="ebo" x={380} p={{...NERVOUS, armR: [90, 10]}} talk /></g>,
  /* 20 */ (l) => <g><KitchenSet /><ChairSet x={760} /><R who="ebo" x={760} y={SEAT} p={{...POSE.shocked, sweat: l > 0.4 ? 1 : 0}} /><KitchenTable x={600} /><R who="ama" x={260} s={1.3} p={{eyes: 'half', mouth: 'flat', brows: 'up', armR: [90, -10]}} hold={<g transform="scale(0.9)"><Notepad pencil={false} /></g>} /></g>,
  /* 21 */ () => <g><KitchenSet /><Close who="ebo" p={{eyes: 'wide', mouth: 'o', sweat: 1, brows: 'sad'}} /></g>,
  // ── the cost ──
  /* 22 */ () => <g><KitchenSet /><Close who="ama" p={{eyes: 'half', mouth: 'flat', brows: 'angry'}} /></g>,
  /* 23 */ (l) => <g><RestaurantSet /><ChairSet x={300} /><R who="ebo" x={300} y={SEAT} p={{...POSE.wave, eyes: 'sad', mouth: 'frown'}} /><RestaurantTable x={510} glass="empty" /><R who="pretty" x={walk(l, 700, 1080, 1.4)} facing={1} p={{eyes: 'half', mouth: 'smile'}} /></g>,
  /* 24 */ () => <g><OfficeSet /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'half', mouth: 'flat', armL: [60, 10]}} hold={PHONE} /><OfficeDesk x={700} /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile'}} /></g>,
  /* 25 */ () => <g><OfficeSet /><Close who="boss" facing={-1} p={{...POSE.checkPhone, eyes: 'half', mouth: 'flat'}} hold={PHONE} /></g>,
  /* 26 */ (l) => <g><OfficeSet /><R who="ebo" x={walk(l, 360, 120, 1.2)} p={SLUMP} /></g>,
  /* 27 */ () => <g><LivingRoomSet /><BigCouch /><R who="ebo" x={540} s={0.55} y={FLOOR - 230} p={{eyes: 'sad', mouth: 'frown'}} /></g>,
  /* 28 */ (l) => <g><SidewalkSet /><R who="christy" x={walk(l, 120, 420, 1.4)} s={1.5} facing={1} p={{eyes: 'half', mouth: 'flat'}} cycle="walk" /><R who="ebo" x={600} s={0.6} p={{eyes: 'sad', mouth: 'frown'}} /><R who="obuor" x={walk(l, 980, 760, 1.4)} s={1.5} facing={-1} p={{eyes: 'half', mouth: 'flat'}} cycle="fastWalk" /></g>,
  // ── the rule ──
  /* 29 */ (l) => <g><KitchenSet /><ChairSet x={290} /><ChairSet x={790} /><R who="ama" x={290} y={SEAT} p={{eyes: 'happy', mouth: 'smile', armR: [70, 10]}} /><R who="ebo" x={790} y={SEAT} touch="thinkChin" p={{eyes: 'open', mouth: 'flat'}} /><KitchenTable x={540} /><g transform={`translate(${540 - 150 + 260 * Math.min(1, Math.max(0, (l - 0.2) / 0.6))} ${FLOOR - 360})`}><Mug /></g></g>,
  /* 30 */ () => <g><KitchenSet /><Close who="ama" p={{mouth: 'smile', eyes: 'open'}} talk /></g>,
  /* 31 */ () => <g><KitchenSet /><Close who="ama" p={{mouth: 'smile', eyes: 'happy'}} talk /></g>,
  /* 32 */ () => <g><RestaurantSet /><ChairSet x={760} /><R who="ama" x={760} y={SEAT} touch="armsCrossed" p={{eyes: 'half', mouth: 'flat'}} /><RestaurantTable x={560} glass="none" /><R who="ebo" x={260} p={SLUMP} /></g>,
  /* 33 */ (l) => <Split l={l}
    left={<g><RestaurantSet /><ChairSet x={760} /><R who="ama" x={760} y={SEAT} touch="armsCrossed" p={{eyes: 'half', mouth: 'flat'}} /><RestaurantTable x={560} glass="none" /><R who="ebo" x={260} p={SLUMP} /></g>}
    right={<g><RestaurantSet /><ChairSet x={760} /><R who="ama" x={760} y={SEAT} p={{...POSE.happy}} /><RestaurantTable x={560} glass="none" /><R who="ebo" x={260} p={{...POSE.wave, mouth: 'grin', eyes: 'happy'}} talk /></g>} />,
  /* 34 */ () => <g><OfficeSet /><R who="ebo" x={180} p={SLUMP} /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'half'}} hold={PHONE} /><OfficeDesk x={700} /></g>,
  /* 35 */ (l) => <Split l={l}
    left={<g><OfficeSet /><R who="ebo" x={180} p={SLUMP} /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'half'}} hold={PHONE} /><OfficeDesk x={700} /></g>}
    right={<g><OfficeSet /><R who="ebo" x={260} p={{...TALL, armR: [40, 20]}} hold={<g transform="scale(0.8)"><Papers /></g>} talk /><R who="boss" x={700} facing={-1} p={{...POSE.checkPhone, eyes: 'open'}} hold={PHONE} /><OfficeDesk x={700} /></g>} />,
  // ── the change ──
  /* 36 */ () => <g><OfficeSet sunny /><R who="ebo" x={180} p={TALL} /><OfficeDesk x={700} /></g>,
  /* 37 */ (l) => <g><OfficeSet /><Zoom k={2.4} cx={600} cy={1300}><OfficeDesk x={700} mug={false} /><g transform={`translate(640 ${FLOOR - 262 + -120 * (1 - Math.min(1, l / 0.18)) ** 2}) scale(1.5)`}><Smartphone down /></g></Zoom>
    {l > 0.18 && <path d="M 300 900 l -60 -40 M 860 900 l 60 -40 M 580 760 l 0 -70" stroke="#1D1A1A" strokeWidth={10} strokeLinecap="round" />}</g>,
  /* 38 */ () => <g><OfficeSet /><Close who="boss" facing={-1} p={{eyes: 'open', mouth: 'flat', brows: 'up'}} /></g>,
  /* 39 */ () => <g><OfficeSet sunny /><R who="boss" x={700} facing={-1} p={{eyes: 'happy', mouth: 'smile', tilt: -10}} /><OfficeDesk x={700} /><R who="ebo" x={260} p={{...POSE.explainBoth, mouth: 'grin'}} talk /></g>,
  // ── the button ──
  /* 40 */ (l) => <g><SidewalkSet dusk /><R who="ebo" x={walk(l, 200, 560, 1.4)} p={{eyes: 'happy', mouth: 'smile'}} cycle="fastWalk" /></g>,
  /* 41 */ (l) => <StompClose l={l} dusk />,
  /* 42 */ () => <g><SidewalkSet dusk /><Close who="ebo" p={{eyes: 'closed', mouth: 'grin'}} talk /></g>,
  /* 43 */ () => <g><SidewalkSet dusk /><Close who="ebo" p={{eyes: 'wide', mouth: 'flat'}} /></g>,
  /* 44 */ () => <g><Zoom k={1.35} cx={540} cy={1800}><SidewalkSet dusk /></Zoom><R who="ebo" x={540} y={2000} s={2.1} p={{...POSE.pointAtYou, brows: 'angry', eyes: 'squint', mouth: 'flat'}} talk /></g>,
  /* 45 */ () => <g><SidewalkSet dusk /><R who="ebo" x={330} touch="armsCrossed" p={{eyes: 'happy', mouth: 'smirk'}} /><R who="mica" x={780} facing={-1} p={{...POSE.nervous, sweat: 1, mouth: 'grin', tilt: 8}} talk /></g>,
  // ── the outro: the moral, to camera ──
  /* 46 */ (l) => <g><KitchenSet /><R who="ebo" x={540} y={1930} s={2.25} p={l < 1.35 ? {...POSE.explainBoth, eyes: 'happy', mouth: 'smile'} : {...POSE.point, eyes: 'open', mouth: 'smile', lookX: 10}} talk /></g>,
];

/** The 46 shot starts, from the word timings (at = a word's start, after = its end). */
export const v3Start = (at: (k: number) => number, after: (k: number, d?: number) => number) => [
  0, at(2), at(6), at(9), at(10), at(16), at(26), at(29), at(33), at(38),
  at(42), at(43), at(48), at(51), at(52), at(56), at(58), at(59), at(60), at(61),
  after(61, 0.1), at(62), at(69), at(74), at(79), at(84), at(89), at(91), at(97), at(103),
  at(110), at(113), at(116), at(120), at(123), at(128), at(132), at(138), at(141), at(143),
  at(148), at(155), at(160) + 0.22, at(161), at(165), at(168) - 0.25,
].map((s) => Math.max(0, s));
export const V3_PUSH = new Set([2, 3, 5, 10, 11, 13, 21, 22, 25, 30, 31, 37, 38, 41, 42, 43, 46]);
export const v3Section = (i: number) => (i < 8 ? 'Hook' : i < 21 ? 'The Count' : i < 28 ? 'The Cost' : i < 35 ? 'The Rule' : i < 39 ? 'The Change' : i < 45 ? 'Button' : 'Outro');

export const Ep13V3Board: React.FC = () => {
  useMarkerFont();
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value={false}>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <svg viewBox="0 0 1080 1920" width="100%" height="100%">{V3_PANELS[Math.min(f, V3_PANELS.length - 1)](99)}</svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
