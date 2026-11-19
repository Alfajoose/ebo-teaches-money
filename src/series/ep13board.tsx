import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {StageSizeContext} from './exportCtx';
import {useMarkerFont} from './filterKit';
import {DoodleBubble, DoodleTable, DoodleCup, MotionLines, SketchPage} from '../components/StickFigures';
import {DoodlePerson, DoodlePose, DoodleWho} from '../components/DoodleCast';

/**
 * Ep 13 "Someone Stepped on My Foot. I Said Sorry.": the storyboard. Storytime, all doodles on the sketchbook page:
 * Ebo tells it (voice-over), the doodle cast acts it out. One panel per beat, about one a second.
 */
const FLOOR = 1520;
const INK = '#1D1A1A';
const RED = '#E5484D';
const L = {stroke: INK, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};

/** Animation state for the doodles: frame, seconds into the shot, who is speaking and their lip-sync frame. The board leaves the defaults. */
export const Ep13Anim = React.createContext<{f: number; l: number; speaker?: string; mouth?: number}>({f: 0, l: 99});
const VOICE: Partial<Record<DoodleWho, string>> = {ebo: 'ebo', wife: 'wife', guy: 'stranger'};
/** A doodle person standing on the floor line (s = size). Lip-syncs when `talk` and it's their line; bobs and blinks. */
const P: React.FC<{who: DoodleWho; x: number; s?: number; y?: number; pose?: DoodlePose; facing?: 1 | -1; hold?: React.ReactNode; talk?: boolean}> = ({who, x, s = 1.85, y = FLOOR, pose = {}, facing = 1, hold, talk}) => {
  const {f, speaker, mouth} = React.useContext(Ep13Anim);
  let p: DoodlePose = pose;
  if (talk && speaker === VOICE[who] && mouth !== undefined) p = {...p, mouth: mouth as DoodlePose['mouth']};
  const seed = who.length * 23 + Math.round(x);
  const eyes = p.eyes ?? 'dot';
  if (f > 0 && (eyes === 'dot' || eyes === 'side') && (f + seed) % 96 < 3) p = {...p, eyes: 'closed'};
  const bob = f > 0 ? 3 * Math.sin((f + seed) / 9) : 0;
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-118 + bob / s})`}><DoodlePerson who={who} pose={p} facing={facing} hold={hold} /></g>;
};
/** A face close-up: the head fills the frame. */
const Face: React.FC<{who: DoodleWho; pose?: DoodlePose; facing?: 1 | -1; talk?: boolean; dx?: number}> = ({who, pose, facing, talk, dx = 0}) => (
  <P who={who} x={540 + dx - 14 * 4.2 * (facing ?? 1)} s={4.2} y={1000 + 353 * 4.2} pose={pose} facing={facing} talk={talk} />
);
const Floor: React.FC = () => <path d={`M 120 ${FLOOR} L 1020 ${FLOOR}`} {...L} />;
const Page: React.FC<{tint?: string; children?: React.ReactNode}> = ({tint, children}) => (
  <g><SketchPage />{tint && <rect x={-300} y={-300} width={1680} height={2600} fill={tint} opacity={0.35} />}{children}</g>
);

// ── sets ──
const Street: React.FC<{dusk?: boolean}> = ({dusk}) => (
  <g>
    {dusk && <circle cx={850} cy={560} r={90} {...L} fill="#FFB86B" />}
    <g transform="translate(0 100)"><path d="M 140 1420 L 140 760 L 360 760 L 360 1420 M 200 840 l 50 0 l 0 70 l -50 0 Z M 270 840 l 50 0 l 0 70 l -50 0 Z M 200 980 l 50 0 l 0 70 l -50 0 Z" {...L} strokeWidth={6} />
    <path d="M 900 1420 L 900 1000 M 860 1000 l 80 0 M 900 1000 q 40 -40 80 0" {...L} strokeWidth={6} /></g>
    <Floor />
  </g>
);
const Cafe: React.FC<{cup?: boolean}> = ({cup}) => (
  <g>
    <path d="M 160 640 l 200 0 l 0 160 l -200 0 Z M 260 700 l 0 160 M 160 780 l 200 0" {...L} strokeWidth={6} />
    <g transform={`translate(430 ${FLOOR})`}><DoodleTable /></g>
    {cup && <g transform={`translate(400 ${FLOOR - 216})`}><DoodleCup /></g>}
    <Floor />
  </g>
);
const Glass: React.FC<{x: number; y: number; full?: boolean}> = ({x, y, full}) => (
  <g transform={`translate(${x} ${y})`}>
    {full && <path d="M -26 -60 L 26 -60 L 22 0 L -22 0 Z" fill="#9BD3F2" />}
    <path d="M -30 -90 L 30 -90 L 22 0 L -22 0 Z" {...L} strokeWidth={6} />
  </g>
);
const Office: React.FC = () => (
  <g>
    <path d="M 700 720 l 220 0 l 0 140 l -220 0 Z M 730 830 l 40 -50 l 40 30 l 40 -60 l 40 50" {...L} strokeWidth={6} />
    <g transform={`translate(640 ${FLOOR})`}><path d="M -230 -260 L 230 -260 M -200 -260 L -200 0 M 200 -260 L 200 0" {...L} /></g>
    <Floor />
  </g>
);
const PhoneProp: React.FC<{r?: number}> = ({r = 0}) => <g transform={`rotate(${r})`}><rect x={-16} y={-46} width={32} height={56} rx={6} fill={INK} /><rect x={-11} y={-40} width={22} height={40} rx={3} fill="#6BB7E8" /></g>;
const Pad: React.FC<{r?: number}> = ({r = -10}) => <g transform={`rotate(${r})`}><rect x={-28} y={-60} width={56} height={70} rx={4} fill="#fff" stroke={INK} strokeWidth={5} /><path d="M -16 -42 l 32 0 M -16 -28 l 32 0 M -16 -14 l 20 0" stroke={INK} strokeWidth={3} /></g>;
const Sun: React.FC = () => <g><circle cx={860} cy={420} r={70} {...L} fill="#FFE45C" />{Array.from({length: 8}, (_, i) => <path key={i} d="M 0 -100 l 0 -30" {...L} transform={`translate(860 420) rotate(${i * 45})`} />)}</g>;

/** The notepad insert: the wife's tally. */
const Tally: React.FC<{n: number; big?: string; l?: number}> = ({n: total, big, l = 99}) => {
  const n = total <= 3 ? (l > 0.15 ? total : total - 1) : Math.min(total, Math.round((total * l) / 0.7));
  const showBig = big && l > 0.75;
  const groups = Array.from({length: Math.ceil(n / 5)}, (_, g) => Math.min(5, n - g * 5));
  return (
    <g transform="translate(540 960)">
      <g transform="rotate(-4)">
        <rect x={-340} y={-470} width={680} height={900} rx={18} fill="#fff" stroke={INK} strokeWidth={12} />
        {Array.from({length: 11}, (_, i) => <line key={i} x1={-300} x2={300} y1={-340 + i * 70} y2={-340 + i * 70} stroke="#CFE0F2" strokeWidth={4} />)}
        <text x={0} y={-380} textAnchor="middle" fontFamily="EboMarker" fontSize={64} fill={INK}>sorry</text>
        {groups.map((k, g) => {
          const gx = -250 + (g % 5) * 120;
          const gy = -280 + Math.floor(g / 5) * 110;
          return <g key={g}>
            {Array.from({length: Math.min(k, 4)}, (_, i) => <path key={i} d={`M ${gx + i * 22} ${gy} l 0 80`} {...L} strokeWidth={10} />)}
            {k === 5 && <path d={`M ${gx - 14} ${gy + 66} L ${gx + 80} ${gy + 14}`} {...L} strokeWidth={10} stroke={RED} />}
          </g>;
        })}
        {showBig && <text x={0} y={320} textAnchor="middle" fontFamily="EboMarker" fontSize={240} fill={RED} transform="rotate(-6)">{big}</text>}
      </g>
    </g>
  );
};
/** A close-up of feet: Ebo's sneaker, and a big shoe coming down on it. */
const Feet: React.FC<{l?: number}> = ({l = 99}) => {
  const u = Math.min(1, l / 0.22);
  const stomp = u >= 1;
  return (
  <g>
    <path d="M 120 1250 L 1000 1250" {...L} />
    <path d="M 300 400 L 330 1100" {...L} strokeWidth={22} />
    <path d="M 250 1100 Q 240 1250 400 1250 L 560 1250 Q 600 1160 470 1120 L 300 1090 Z" fill="#fff" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    <path d="M 330 1150 l 40 -20 M 370 1170 l 40 -20" {...L} strokeWidth={6} />
    <g transform={`translate(0 ${-420 * (1 - u) ** 2})`}>
      <path d="M 640 300 L 600 1040" {...L} strokeWidth={22} />
      <path d="M 380 1110 Q 380 1010 560 1000 L 780 1010 Q 820 1130 760 1150 L 420 1160 Z" fill="#3A3A44" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    </g>
    {stomp && <path d="M 300 1000 l -60 -60 M 520 960 l 20 -80 M 820 1040 l 70 -40" {...L} strokeWidth={8} />}
  </g>
  );
};
/** A speech bubble, drawn big enough to read on a phone. */
const B: React.FC<{x: number; y: number; text: string[]; tail?: 1 | -1; w?: number}> = ({x, y, w = 400, ...r}) => (
  <g transform={`translate(${x} ${y}) scale(1.5)`}><DoodleBubble x={0} y={0} w={w} {...r} /></g>
);
/** A speech bubble with a red line through it. */
const Crossed: React.FC<{x: number; y: number; text: string[]; tail?: 1 | -1}> = ({x, y, text, tail}) => (
  <g><B x={x} y={y} text={text} tail={tail} w={440} /><path d={`M ${x - 330} ${y + 50} L ${x + 330} ${y - 50}`} stroke={RED} strokeWidth={16} strokeLinecap="round" /></g>
);

const WAVE: DoodlePose = {armR: [125, 25]};
const TALKER: DoodlePose = {armR: [70, 30]};
const SHRUG: DoodlePose = {armL: [-70, -50], armR: [70, 50], brows: 'up', mouth: 'flat'};
const STARE: DoodlePose = {brows: 'up', mouth: 'flat', eyes: 'side'};
const POLITE: DoodlePose = {eyes: 'closed', mouth: 'grin', brows: 'worried', armR: [60, 40], armL: [-30, -20]};

export const PANELS: ((l: number) => React.ReactNode)[] = [
  // ── the hook ──
  /* 1 */ (l) => <Page><Feet l={l} /></Page>,
  /* 2 */ () => <Page><Face who="ebo" pose={{eyes: 'x', mouth: 'wobble', sweat: true}} /></Page>,
  /* 3 */ () => <Page><Street /><P who="ebo" x={360} pose={POLITE} talk /><P who="guy" x={760} facing={-1} pose={{eyes: 'side', mouth: 'flat'}} /><B x={380} y={430} text={['sorry!']} tail={-1} w={323} /></Page>,
  /* 4 */ () => <Page><Street /><P who="ebo" x={300} pose={{mouth: 'smile'}} /><P who="wife" x={720} facing={-1} pose={STARE} /></Page>,
  /* 5 */ () => <Page><Face who="wife" pose={{brows: 'up', mouth: 'flat'}} talk /><B x={540} y={330} text={['do you know how many', 'times you said that today?']} tail={1} w={600} /></Page>,
  /* 6 */ () => <Page><P who="ebo" x={540} s={2.2} pose={SHRUG} talk /></Page>,
  /* 7 */ () => <Page><Street /><P who="wife" x={600} s={2} facing={-1} pose={{armR: [80, 20], eyes: 'side', mouth: 'smile', brows: 'angry'}} hold={<Pad />} /></Page>,
  // ── the count ──
  /* 8 */ () => <Page><Cafe /><P who="ebo" x={300} pose={WAVE} /><P who="waiter" x={800} facing={-1} /></Page>,
  /* 9 */ () => <Page><Cafe /><P who="ebo" x={300} pose={{...POLITE, armR: [125, 25]}} talk /><P who="waiter" x={800} facing={-1} /><B x={430} y={430} text={['sorry, could I get…']} tail={-1} w={494} /></Page>,
  /* 10 */ (l) => <Page><Tally n={1} l={l} /></Page>,
  /* 11 */ () => <Page><Office /><P who="boss" x={640} pose={{armR: [150, -40], eyes: 'side', mouth: 'flat'}} hold={<PhoneProp />} /><P who="ebo" x={250} pose={TALKER} /></Page>,
  /* 12 */ () => <Page><Office /><P who="boss" x={640} pose={{armR: [150, -40], eyes: 'side', mouth: 'flat'}} hold={<PhoneProp />} /><P who="ebo" x={250} pose={{...POLITE, armR: [70, 30]}} talk /><B x={460} y={430} text={['sorry, quick question…']} tail={-1} w={532} /></Page>,
  /* 13 */ (l) => <Page><Tally n={2} l={l} /></Page>,
  /* 14 */ (l) => <Page><Street /><P who="ebo" x={470} pose={{eyes: 'wide', mouth: 'o', lean: -10}} /><P who="guy" x={640 + 320 * (1 - Math.min(1, l / 0.25)) ** 2} facing={-1} pose={{lean: 14, eyes: 'side', armR: [60, 20]}} /><MotionLines x={900} y={1000} dir={-1} /></Page>,
  /* 15 */ () => <Page><Street /><P who="ebo" x={420} pose={POLITE} talk /><P who="guy" x={820} facing={-1} pose={{eyes: 'side', mouth: 'flat'}} /><B x={420} y={430} text={['oh, sorry!']} tail={-1} w={361} /></Page>,
  /* 16 */ (l) => <Page><Tally n={3} l={l} /></Page>,
  /* 17 */ (l) => <Page><P who="ebo" x={540} s={2} pose={POLITE} talk />
    {[[260, 420, -8], [800, 380, 6], [230, 760, 4], [850, 740, -6], [540, 260, 0]].filter((_, i) => l > i * 0.14).map(([x, y, r], i) => <g key={i} transform={`rotate(${r} ${x} ${y})`}><DoodleBubble x={x} y={y} text={['sorry']} tail={x < 540 ? 1 : -1} w={260} /></g>)}</Page>,
  /* 18 */ (l) => <Page><Tally n={47} big="47" l={l} /></Page>,
  /* 19 */ () => <Page><Face who="ebo" pose={{eyes: 'wide', mouth: 'o', brows: 'worried', sweat: true}} /></Page>,
  // ── the cost ──
  /* 20 */ () => <Page><Face who="wife" pose={{brows: 'angry', mouth: 'flat', eyes: 'side'}} facing={-1} /></Page>,
  /* 21 */ (l) => <Page><Cafe /><Glass x={440} y={FLOOR - 216} /><P who="ebo" x={250} pose={{...WAVE, mouth: 'frown', brows: 'worried'}} /><P who="waiter" x={660 + 160 * Math.min(l, 1.2)} pose={{eyes: 'side', mouth: 'smile', armR: [95, -10]}} hold={<Glass x={0} y={0} full />} /><MotionLines x={1000} y={1060} dir={1} /></Page>,
  /* 22 */ () => <Page><Office /><P who="boss" x={640} pose={{armR: [150, -40], eyes: 'side', mouth: 'flat'}} hold={<PhoneProp />} /><P who="ebo" x={250} pose={TALKER} talk /></Page>,
  /* 23 */ () => <Page><Face who="boss" pose={{eyes: 'side', mouth: 'flat'}} facing={-1} /><g transform="translate(830 1500) scale(4)"><PhoneProp r={-8} /></g></Page>,
  /* 24 */ () => <Page><Street /><P who="ebo" x={540} s={1.6} pose={POLITE} talk /><B x={540} y={430} text={['sorry']} tail={-1} w={266} /></Page>,
  /* 25 */ (l) => <Page><Street /><P who="ebo" x={540} s={1.85 - 0.95 * Math.min(1, l / 0.6)} pose={{...POLITE, mouth: 'frown'}} /></Page>,
  /* 26 */ () => <Page><Street /><P who="guy" x={300} s={1.8} pose={{eyes: 'side', mouth: 'flat'}} /><P who="ebo" x={540} s={0.55} pose={{brows: 'worried', mouth: 'frown', eyes: 'dot'}} /><P who="waiter" x={800} s={1.8} facing={-1} pose={{eyes: 'side'}} /></Page>,
  // ── the rule ──
  /* 27 */ () => <Page tint="#FFF3C4"><P who="wife" x={600} s={2.2} facing={-1} pose={{armR: [150, -20], brows: 'up', mouth: 'smile'}} /><P who="ebo" x={250} s={1.3} pose={{eyes: 'dot', mouth: 'flat'}} /></Page>,
  /* 28 */ () => <Page tint="#FFF3C4"><Face who="wife" pose={{mouth: 'smile'}} talk /><B x={530} y={330} text={['every time you want', 'to say sorry…']} tail={1} w={560} /></Page>,
  /* 29 */ () => <Page tint="#FFF3C4"><Face who="wife" pose={{mouth: 'smile', eyes: 'happy'}} talk /><B x={540} y={330} text={['…say thank you.']} tail={1} w={532} /></Page>,
  /* 30 */ () => <Page><Cafe cup /><P who="friend" x={620} facing={-1} pose={{eyes: 'side', mouth: 'flat', brows: 'angry'}} /><P who="ebo" x={220} pose={{lean: 14, mouth: 1}} /><Crossed x={540} y={430} text={["sorry I'm late"]} /></Page>,
  /* 31 */ () => <Page><Cafe cup /><P who="friend" x={620} facing={-1} pose={{eyes: 'happy', mouth: 'grin'}} /><P who="ebo" x={300} pose={{...WAVE, mouth: 'grin'}} talk /><B x={430} y={430} text={['thanks for waiting!']} tail={-1} w={494} /></Page>,
  /* 32 */ () => <Page><Office /><P who="boss" x={640} pose={{armR: [150, -40], eyes: 'side', mouth: 'flat'}} hold={<PhoneProp />} /><P who="ebo" x={250} pose={TALKER} /><Crossed x={540} y={430} text={['sorry, quick question']} /></Page>,
  /* 33 */ () => <Page><Office /><P who="boss" x={640} pose={{armR: [150, -40], eyes: 'side', mouth: 'flat'}} hold={<PhoneProp />} /><P who="ebo" x={250} pose={{...TALKER, mouth: 'smile'}} talk /><B x={445} y={430} text={['thanks for your time.']} tail={-1} w={513} /></Page>,
  // ── the change ──
  /* 34 */ () => <Page><Sun /><Office /><P who="ebo" x={300} pose={{armR: [30, 10], armL: [-30, -10], eyes: 'dot', mouth: 'smile', lean: 6}} /></Page>,
  /* 35 */ () => <Page><Office /><g transform={`translate(560 ${FLOOR - 270})`}><PhoneProp r={90} /></g><P who="boss" x={640} pose={{armR: [60, 10], eyes: 'dot', mouth: 'flat'}} facing={-1} /><P who="ebo" x={250} pose={TALKER} talk /></Page>,
  /* 36 */ () => <Page><Face who="boss" pose={{eyes: 'dot', mouth: 'flat', brows: 'up'}} facing={-1} /></Page>,
  /* 37 */ () => <Page><Office /><P who="boss" x={600} pose={{lean: 12, eyes: 'dot', mouth: 'smile', armR: [20, 60]}} facing={-1} /><P who="ebo" x={250} pose={{...TALKER, mouth: 'grin'}} talk /></Page>,
  // ── the button ──
  /* 38 */ (l) => <Page tint="#FFD9B0"><Street dusk /><P who="ebo" x={300 + 180 * Math.min(l, 1.4)} pose={{armR: [20, 10], legL: Math.floor(l * 5) % 2 ? [-25, 10] : [20, 10], legR: Math.floor(l * 5) % 2 ? [25, 0] : [-20, 0], eyes: 'happy', mouth: 'smile'}} /></Page>,
  /* 39 */ (l) => <Page tint="#FFD9B0"><Feet l={l} /></Page>,
  /* 40 */ () => <Page tint="#FFD9B0"><Face who="ebo" pose={{eyes: 'closed', mouth: 1}} talk /><B x={540} y={330} text={['thank—']} tail={1} w={361} /></Page>,
  /* 41 */ () => <Page tint="#FFD9B0"><Face who="ebo" pose={{eyes: 'wide', mouth: 'flat', brows: 'up'}} /></Page>,
  /* 42 */ () => <Page tint="#FFD9B0"><Street dusk /><P who="ebo" x={360} pose={{brows: 'angry', mouth: 1, armR: [80, -10]}} talk /><P who="guy" x={720} facing={-1} pose={{eyes: 'wide', mouth: 'o', sweat: true}} /><B x={430} y={430} text={["hey. that's my foot."]} tail={-1} w={494} /></Page>,
  /* 43 */ () => <Page tint="#FFD9B0"><Street dusk /><P who="ebo" x={360} pose={{brows: 'angry', mouth: 'smile', eyes: 'happy'}} /><P who="guy" x={740} facing={-1} pose={{...POLITE, sweat: true}} talk /><B x={740} y={430} text={['oh— sorry!']} tail={1} w={361} /></Page>,
];
export const EP13_BOARD_PANELS = PANELS.length;

export const Ep13Board: React.FC = () => {
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
