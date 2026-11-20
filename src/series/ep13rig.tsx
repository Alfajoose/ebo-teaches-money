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
import {DoodleBubble, MotionLines} from '../components/StickFigures';
import {B, Cafe, Crossed, FLOOR, Glass, Office, Page, PhoneProp, Street, Sun, Tally, Ep13Anim} from './ep13board';

/**
 * Ep 13 with the real cast (the user's rigs) on the sketchbook page: Ebo tells it, Ama is his wife, Mica the waiter,
 * Christy the boss, Obuor the stranger (his voice says the last line). Same 43 shots and timings as the doodle board.
 */
type Look = Partial<Pose>;
const INK = '#1D1A1A';
const L = {stroke: INK, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
const VOICE: Partial<Record<CastId, string>> = {ebo: 'ebo', ama: 'wife', obuor: 'stranger'};
const S = 1.45;

/** One of the cast on the floor line. Ebo and Ama face the camera (rule 14); the others turn ¾. Bobs, blinks, lip-syncs on their own lines. */
const R: React.FC<{who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; hold?: React.ReactNode; holdL?: React.ReactNode; talk?: boolean; touch?: keyof typeof CONTACT; cycle?: 'fastWalk'}> = ({who, x, y = FLOOR, s = S, p = {}, facing = 1, hold, holdL, talk, touch, cycle}) => {
  const {f, speaker, mouth} = React.useContext(Ep13Anim);
  const front = who === 'ebo' || who === 'ama';
  let pose = {...(front ? POSE.stand : (POSES.standing as Pose)), ...p} as Pose;
  if (touch) pose = {...pose, ...CONTACT[touch], ...p, contact: true, view: 1} as Pose;
  const seed = who.length * 17 + Math.round(x);
  pose = {...pose, lift: (pose.lift ?? 0) + (f > 0 ? 2.5 * Math.sin((f + seed) / 10) : 0), tilt: (pose.tilt ?? 0) + (f > 0 ? 1.1 * Math.sin((f + seed) / 15) : 0)};
  const lip = talk && speaker === VOICE[who] ? mouth : undefined;
  return (
    <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={f} noBlink={f === 0} mouthFrame={lip} cycle={cycle} pose={front && !touch ? gentle(frontOn(pose)) : gentle(pose)} holdL={holdL}>
      {hold}
    </RigCharacter>
  );
};
/** A head-and-shoulders close-up. */
const Close: React.FC<{who: CastId; p?: Look; facing?: 1 | -1; talk?: boolean; touch?: keyof typeof CONTACT; hold?: React.ReactNode}> = (props) => <R x={540} y={1980} s={2.6} {...props} />;

/** The rigs' feet, close: Ebo's foot, and the stranger's coming down on it. */
const Feet: React.FC<{l?: number}> = ({l = 99}) => {
  const u = Math.min(1, l / 0.22);
  const ink = {stroke: INK, strokeWidth: 10, strokeLinejoin: 'round' as const};
  return (
    <g>
      <path d="M 100 1300 L 1000 1300" {...L} />
      <rect x={220} y={120} width={200} height={760} fill="#D3D6C8" {...ink} />
      <path d="M 250 860 L 250 1180 Q 250 1300 400 1300 L 620 1300 Q 700 1300 690 1220 Q 680 1150 560 1150 L 420 1150 L 420 860 Z" fill="#7E5E42" {...ink} />
      <g transform={`translate(0 ${-460 * (1 - u) ** 2})`}>
        <rect x={560} y={-200} width={230} height={880} fill="#6E4A33" {...ink} />
        <path d="M 560 660 L 560 1080 Q 460 1080 450 1150 Q 450 1210 560 1210 L 800 1210 Q 840 1210 840 1150 L 790 660 Z" fill="#7C5A3E" {...ink} />
      </g>
      {u >= 1 && <path d="M 330 1080 l -70 -60 M 520 1020 l 10 -90 M 880 1080 l 80 -50 M 420 1240 l -90 30" {...L} strokeWidth={10} />}
    </g>
  );
};
/** Ama's notepad in her hand (small) or held out (big). */
const HeldPad: React.FC<{n: number; l: number; k?: number}> = ({n, l, k = 0.2}) => <g transform={`scale(${k}) translate(100 -900)`}><Tally n={n} l={l} /></g>;
/** She ticks the pad, right in the scene: Ama big at the left, Ebo still apologising behind her. */
const Count: React.FC<{n: number; l: number; set: React.ReactNode; ebo: Look}> = ({n, l, set, ebo}) => {
  const tick = l > 0.1 && l < 0.3 ? Math.sin(((l - 0.1) / 0.2) * Math.PI) : 0;
  return (
    <g>
      {set}
      <R who="ebo" x={860} s={1.0} p={ebo} />
      <R who="ama" x={260} y={FLOOR + 200} s={1.75} p={{eyes: 'half', mouth: 'flat', brows: 'angry', lookX: 14, armR: [70 - 12 * tick, -10], armL: [20, 10]}} hold={<HeldPad n={n} l={l} />} />
    </g>
  );
};
const PHONE: Look = {...POSE.checkPhone};
const Boss: React.FC<{x?: number; p?: Look; phone?: boolean; talk?: boolean}> = ({x = 680, p = {}, phone = true}) => (
  <R who="christy" x={x} facing={-1} p={phone ? {...PHONE, eyes: 'half', mouth: 'flat', ...p} : {eyes: 'open', mouth: 'flat', ...p}} hold={phone ? <PhoneProp /> : undefined} />
);
const NERVOUS: Look = {...POSE.nervous, mouth: 'grin', eyes: 'happy', sweat: 1};

export const RIG_PANELS: ((l: number) => React.ReactNode)[] = [
  // ── the hook ──
  /* 1 */ (l) => <Page><Feet l={l} /></Page>,
  /* 2 */ () => <Page><Close who="ebo" p={{eyes: 'squint', mouth: 'wobbly', sweat: 1, brows: 'sad'}} /></Page>,
  /* 3 */ () => <Page><Street /><R who="ebo" x={330} p={NERVOUS} talk /><R who="obuor" x={780} facing={1} p={{eyes: 'half', mouth: 'flat'}} cycle="fastWalk" /><B x={360} y={430} text={['sorry!']} tail={-1} w={320} /></Page>,
  /* 4 */ () => <Page><Street /><R who="ebo" x={330} p={{mouth: 'smile'}} /><R who="ama" x={750} p={{eyes: 'half', mouth: 'flat', brows: 'up', lookX: -14}} /></Page>,
  /* 5 */ () => <Page><Close who="ama" p={{brows: 'up', eyes: 'half', mouth: 'flat'}} talk /><B x={540} y={330} text={['do you know how many', 'times you said that today?']} tail={1} w={600} /></Page>,
  /* 6 */ () => <Page><R who="ebo" x={540} y={1800} s={1.8} p={{...POSE.shrug}} talk /></Page>,
  /* 7 */ () => <Page><Street /><R who="ama" x={520} s={1.55} p={{eyes: 'squint', mouth: 'smirk', brows: 'angry', armR: [80, 20]}} hold={<HeldPad n={0} l={99} k={0.16} />} /></Page>,
  // ── the count ──
  /* 8 */ () => <Page><Cafe /><R who="ebo" x={280} p={{...POSE.wave}} /><R who="mica" x={800} facing={-1} p={{eyes: 'open', mouth: 'smile'}} /></Page>,
  /* 9 */ () => <Page><Cafe /><R who="ebo" x={280} p={{...NERVOUS, armR: [150, 20]}} talk /><R who="mica" x={800} facing={-1} p={{eyes: 'open', mouth: 'smile'}} /><B x={430} y={430} text={['sorry, could I get…']} tail={-1} w={494} /></Page>,
  /* 10 */ (l) => <Page><Count n={1} l={l} set={<Cafe />} ebo={{...NERVOUS, armR: [150, 20]}} /></Page>,
  /* 11 */ () => <Page><Office /><Boss /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile'}} /></Page>,
  /* 12 */ () => <Page><Office /><Boss /><R who="ebo" x={260} p={{...NERVOUS, armR: [70, 20]}} talk /><B x={460} y={430} text={['sorry, quick question…']} tail={-1} w={532} /></Page>,
  /* 13 */ (l) => <Page><Count n={2} l={l} set={<Office />} ebo={{...NERVOUS, armR: [70, 20]}} /></Page>,
  /* 14 */ (l) => <Page><Street /><R who="ebo" x={420} p={{...POSE.shocked, tilt: -8}} /><R who="obuor" x={660 + 320 * (1 - Math.min(1, l / 0.25)) ** 2} facing={-1} p={{eyes: 'half', mouth: 'flat', tilt: 10}} /><MotionLines x={960} y={1000} dir={-1} /></Page>,
  /* 15 */ () => <Page><Street /><R who="ebo" x={380} p={NERVOUS} talk /><R who="obuor" x={800} facing={1} p={{eyes: 'half', mouth: 'flat'}} /><B x={420} y={430} text={['oh, sorry!']} tail={-1} w={361} /></Page>,
  /* 16 */ (l) => <Page><Count n={3} l={l} set={<Street />} ebo={NERVOUS} /></Page>,
  /* 17 */ (l) => <Page><R who="ebo" x={540} y={1700} s={1.6} p={NERVOUS} talk />
    {[[260, 420, -8], [800, 380, 6], [230, 760, 4], [850, 740, -6], [540, 260, 0]].filter((_, i) => l > i * 0.14).map(([x, y, r], i) => <g key={i} transform={`rotate(${r} ${x} ${y})`}><DoodleBubble x={x} y={y} text={['sorry']} tail={x < 540 ? 1 : -1} w={260} /></g>)}</Page>,
  /* 18 */ (l) => <Page><Street /><R who="ebo" x={880} s={1.15} p={{...POSE.shocked, sweat: l > 0.5 ? 1 : 0}} />
    <R who="ama" x={200 + 60 * Math.min(1, l / 0.25)} s={1.3} p={{eyes: 'half', mouth: 'flat', brows: 'up', armR: [95, -5]}} hold={<HeldPad n={47} l={l * 1.4} k={0.34} />} /></Page>,
  /* 19 */ () => <Page><Close who="ebo" p={{eyes: 'wide', mouth: 'o', sweat: 1, brows: 'sad'}} /></Page>,
  // ── the cost ──
  /* 20 */ () => <Page><Close who="ama" p={{eyes: 'half', mouth: 'flat', brows: 'angry'}} /></Page>,
  /* 21 */ (l) => <Page><Cafe /><Glass x={440} y={FLOOR - 216} /><R who="ebo" x={250} p={{...POSE.wave, mouth: 'frown', eyes: 'sad'}} /><R who="mica" x={640 + 160 * Math.min(l, 1.2)} facing={1} p={{eyes: 'half', mouth: 'smile', armR: [80, 10]}} hold={<Glass x={0} y={0} full />} cycle="fastWalk" /></Page>,
  /* 22 */ () => <Page><Office /><Boss /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile'}} talk /></Page>,
  /* 23 */ () => <Page><Close who="christy" facing={-1} p={{...PHONE, eyes: 'half', mouth: 'flat'}} hold={<PhoneProp />} /></Page>,
  /* 24 */ () => <Page><Street /><R who="ebo" x={540} s={1.25} p={NERVOUS} talk /><B x={540} y={430} text={['sorry']} tail={-1} w={266} /></Page>,
  /* 25 */ (l) => <Page><Street /><R who="ebo" x={540} s={1.25 - 0.6 * Math.min(1, l / 0.6)} p={{...NERVOUS, mouth: 'frown', eyes: 'sad'}} /></Page>,
  /* 26 */ () => <Page><Street /><R who="christy" x={280} s={1.45} facing={1} p={{eyes: 'half', mouth: 'flat'}} /><R who="ebo" x={540} s={0.55} p={{eyes: 'sad', mouth: 'frown'}} /><R who="obuor" x={820} s={1.45} facing={-1} p={{eyes: 'half', mouth: 'flat'}} /></Page>,
  // ── the rule ──
  /* 27 */ () => <Page tint="#FFF3C4"><R who="ama" x={640} s={1.6} p={{...POSE.ideaFinger, mouth: 'smile'}} /><R who="ebo" x={240} s={1.0} p={{eyes: 'open', mouth: 'flat'}} /></Page>,
  /* 28 */ () => <Page tint="#FFF3C4"><Close who="ama" p={{mouth: 'smile', eyes: 'open'}} talk /><B x={540} y={330} text={['every time you want', 'to say sorry…']} tail={1} w={560} /></Page>,
  /* 29 */ () => <Page tint="#FFF3C4"><Close who="ama" p={{mouth: 'smile', eyes: 'happy'}} talk /><B x={540} y={330} text={['…say thank you.']} tail={1} w={532} /></Page>,
  /* 30 */ () => <Page><Cafe cup /><R who="ama" x={700} touch="armsCrossed" p={{eyes: 'half', mouth: 'flat'}} /><R who="ebo" x={250} p={{...NERVOUS, tilt: 10}} /><Crossed x={540} y={430} text={["sorry I'm late"]} /></Page>,
  /* 31 */ () => <Page><Cafe cup /><R who="ama" x={700} p={{...POSE.happy}} /><R who="ebo" x={280} p={{...POSE.wave, mouth: 'grin', eyes: 'happy'}} talk /><B x={430} y={430} text={['thanks for waiting!']} tail={-1} w={494} /></Page>,
  /* 32 */ () => <Page><Office /><Boss /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile'}} /><Crossed x={540} y={430} text={['sorry, quick question']} /></Page>,
  /* 33 */ () => <Page><Office /><Boss /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile', eyes: 'happy'}} talk /><B x={445} y={430} text={['thanks for your time.']} tail={-1} w={513} /></Page>,
  // ── the change ──
  /* 34 */ () => <Page><Sun /><Office /><R who="ebo" x={300} p={{...POSE.happy, eyes: 'open', mouth: 'smile'}} /></Page>,
  /* 35 */ () => <Page><Office /><g transform={`translate(520 ${FLOOR - 270})`}><PhoneProp r={90} /></g><Boss phone={false} p={{brows: 'up', eyes: 'open'}} /><R who="ebo" x={260} p={{...POSE.explain, mouth: 'smile'}} talk /></Page>,
  /* 36 */ () => <Page><Close who="christy" facing={-1} p={{eyes: 'open', mouth: 'flat', brows: 'up'}} /></Page>,
  /* 37 */ () => <Page><Office /><Boss phone={false} p={{eyes: 'happy', mouth: 'smile', tilt: -10}} /><R who="ebo" x={260} p={{...POSE.explainBoth, mouth: 'grin'}} talk /></Page>,
  // ── the button ──
  /* 38 */ (l) => <Page tint="#FFD9B0"><Street dusk /><R who="ebo" x={260 + 220 * Math.min(l, 1.4)} p={{eyes: 'happy', mouth: 'smile'}} cycle="fastWalk" /></Page>,
  /* 39 */ (l) => <Page tint="#FFD9B0"><Feet l={l} /></Page>,
  /* 40 */ () => <Page tint="#FFD9B0"><Close who="ebo" p={{eyes: 'closed', mouth: 'grin'}} talk /><B x={540} y={330} text={['thank—']} tail={1} w={361} /></Page>,
  /* 41 */ () => <Page tint="#FFD9B0"><Close who="ebo" p={{eyes: 'wide', mouth: 'flat'}} /></Page>,
  /* 42 */ () => <Page tint="#FFD9B0"><Street dusk /><R who="ebo" x={330} p={{...POSE.pointAtYou, brows: 'angry', eyes: 'squint', mouth: 'flat'}} talk /><R who="obuor" x={780} facing={-1} p={{...POSE.shocked, sweat: 1}} /><B x={400} y={430} text={["hey. that's my foot."]} tail={-1} w={494} /></Page>,
  /* 43 */ () => <Page tint="#FFD9B0"><Street dusk /><R who="ebo" x={330} p={{...POSE.smug}} /><R who="obuor" x={780} facing={-1} p={{...POSE.nervous, sweat: 1, mouth: 'grin'}} talk /><B x={740} y={430} text={['oh— sorry!']} tail={1} w={361} /></Page>,
];

export const Ep13RigBoard: React.FC = () => {
  useMarkerFont();
  const f = useCurrentFrame();
  return (
    <StageSizeContext.Provider value={{w: 1080, h: 1920}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#FFFDF6'}}>
            <svg viewBox="0 0 1080 1920" width="100%" height="100%">
              {RIG_PANELS[Math.min(f, RIG_PANELS.length - 1)](99)}
            </svg>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
