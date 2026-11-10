import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {CastId} from '../cast/castConfig';
import {Pose, POSES} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {Backdrop} from './sets';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, VStage, lipFrame} from './kit';
import {In, Label, swoopZoom, useMarkerFont} from './filterKit';
import {Brick, BrickWall, Bucket, Door, FakeFront, Hammer, House, Plot, PostedPhone, Shout, Storm, Sun} from '../components/HouseProps';
import {Arrow, FeeSlip, Ladder, SayBubble, StickGuy} from '../components/PovertyProps';
import wordsJson from './data/ep10-words.json';
import envJson from './data/ep10-env.json';

/**
 * EBO TEACHES MONEY — Ep 10 "Marry a Woman Who…" (vertical, 1080×1920, ~64s).
 * One story (episodes/ep10/script.md, draft 5): a pretty house falls in the rain; why? Ebo and Ama build one house,
 * the neighbours (Mica, Christy) only decorate theirs; the same storm hits both; only one stands.
 * Cast by the CAST.md roles. Ebo narrates (voice over) and speaks to camera in shots 2 and 13 only.
 * Peanut animation (rule 21): pieces swoop in on their words, characters walk and act, the camera swoops
 * (video only: VStage keeps the Animate export camera-free).
 */
export const EP10_W = 1080;
export const EP10_H = 1920;
const WORDS = wordsJson as (Word & {who: string})[];
const ENV = (envJson as Record<string, number[]>).ebo;
const END = WORDS[WORDS.length - 1].e + 0.9;
export const EP10_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;
const FLOOR = 1500;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (u: number) => 1 - (1 - clamp(u)) ** 3;
const easeIn = (u: number) => clamp(u) ** 2;
/** 0→1 over `d` seconds from `a`, eased out. */
const go = (t: number, a: number, d = 0.4) => easeOut((t - a) / d);

// ───────────────────────── the cast ─────────────────────────
type Look = Partial<Pose>;
/** idle sway so nobody is ever frozen (rule 18) */
const sway = (t: number, k: number) => ({tilt: 1.4 * Math.sin(t * 2.1 + k), lift: 2.5 * Math.sin(t * 2.9 + k * 2)});
/** legs swap every 0.12 s while walking */
const stride = (t: number, moving: boolean): Look => {
  if (!moving) return {};
  const ph = Math.floor(t / 0.12) % 2;
  return {legL: ph ? [20, 6] : [-8, 0], legR: ph ? [-8, 0] : [20, 6], lift: -6 * ph};
};
/** walk from `from` to `x`, starting at `a`, taking `d` seconds; returns where they are and whether they move */
const walk = (t: number, a: number, from: number, x: number, d = 0.55) => {
  const u = clamp((t - a) / d);
  return {x: from + (x - from) * (1 - (1 - u) ** 2), moving: u > 0 && u < 1};
};
const Ebo: React.FC<{f: number; x: number; y?: number; s?: number; p?: Look; front?: boolean; facing?: 1 | -1; talk?: boolean; hold?: React.ReactNode}> = ({f, x, y = FLOOR, s = 1.3, p = {}, front = true, facing = 1, talk, hold}) => {
  const t = f / VFPS;
  const sw = sway(t, 0);
  let pose = {...POSE.stand, ...p} as Pose;
  pose = {...pose, tilt: (pose.tilt ?? 0) + sw.tilt, lift: (pose.lift ?? 0) + sw.lift} as Pose;
  const speaking = talk && (ENV[f] ?? 0) > 0.1;
  return (
    <RigCharacter who="ebo" x={x} y={y} scale={s} facing={facing} t={f} pose={front ? gentle(frontOn(pose)) : gentle(pose)} mouthFrame={speaking ? lipFrame(ENV, WORDS, f) : undefined}>
      {hold}
    </RigCharacter>
  );
};
const Side: React.FC<{f: number; who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; hold?: React.ReactNode; k?: number}> = ({f, who, x, y = FLOOR, s = 1.3, p = {}, facing = 1, hold, k = 1}) => {
  const t = f / VFPS;
  const sw = sway(t, k);
  const pose = {...(POSES.standing as Pose), ...p} as Pose;
  return (
    <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={f + k * 17} pose={gentle({...pose, tilt: (pose.tilt ?? 0) + sw.tilt, lift: (pose.lift ?? 0) + sw.lift} as Pose)}>
      {hold}
    </RigCharacter>
  );
};

// ───────────────────────── the world ─────────────────────────
const Sky: React.FC<{storm?: boolean}> = ({storm}) => <Backdrop id={storm ? 'ep10-storm' : 'ep10-sky'} shade="sky" night={storm} />;
const Ground: React.FC<{storm?: boolean; y?: number}> = ({storm, y = FLOOR}) => (
  <g>
    <rect x={-300} y={y - 10} width={1680} height={900} fill={storm ? '#6F8F62' : '#A9D18E'} />
    <line x1={-300} y1={y - 10} x2={1380} y2={y - 10} stroke="#1D1A1A" strokeWidth={7} />
  </g>
);
/** Falling rain (moves with time). */
const Rain: React.FC<{t: number; seed?: number}> = ({t, seed = 0}) => (
  <g>
    {Array.from({length: 46}, (_, i) => {
      const x = ((i * 137 + seed * 61) % 1300) - 110;
      const y = ((((i * 211 + seed * 97) % 2100) + t * 2300) % 2100) - 120;
      return <line key={i} x1={x} y1={y} x2={x - 26} y2={y + 110} stroke="#9CC9EC" strokeWidth={6} strokeLinecap="round" opacity={0.8} />;
    })}
  </g>
);
const Split: React.FC<{top: React.ReactNode; bottom: React.ReactNode; topDy?: number}> = ({top, bottom, topDy = 0}) => (
  <g>
    <defs>
      <clipPath id="ep10-top"><rect x={0} y={0} width={1080} height={952} /></clipPath>
      <clipPath id="ep10-bot"><rect x={0} y={968} width={1080} height={952} /></clipPath>
    </defs>
    <g clipPath="url(#ep10-top)"><g transform={`translate(0 ${topDy})`}>{top}</g></g>
    <g clipPath="url(#ep10-bot)">{bottom}</g>
    <rect x={-10} y={952} width={1100} height={16} fill="#1D1A1A" />
  </g>
);
const Umbrella: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={0} x2={0} y2={300} stroke="#1D1A1A" strokeWidth={10} strokeLinecap="round" />
    <path d="M -230 10 Q -220 -160 0 -170 Q 220 -160 230 10 Q 175 -20 115 10 Q 58 -20 0 10 Q -58 -20 -115 10 Q -175 -20 -230 10 Z" fill="#3E7CB1" stroke="#1D1A1A" strokeWidth={7} strokeLinejoin="round" />
  </g>
);
const Bill: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -20}) => (
  <g>
    <path d={`M ${x + 120} ${y - 30} l 90 -20 M ${x + 120} ${y + 10} l 110 0 M ${x + 120} ${y + 50} l 90 20`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(0.45)`}><FeeSlip top="BILL" bottom="OVERDUE" amount="$900" /></g>
  </g>
);
const Window: React.FC<{x: number; y: number; w?: number; h?: number; t: number}> = ({x, y, w = 360, h = 400, t}) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill="#3B4A6B" stroke="#1D1A1A" strokeWidth={10} />
    <defs><clipPath id="ep10-win"><rect x={x - w / 2} y={y - h / 2} width={w} height={h} /></clipPath></defs>
    <g clipPath="url(#ep10-win)"><g transform={`translate(${x - 540} ${y - 960}) `}><Rain t={t} seed={7} /></g></g>
    <path d={`M ${x} ${y - h / 2} L ${x} ${y + h / 2} M ${x - w / 2} ${y} L ${x + w / 2} ${y}`} stroke="#1D1A1A" strokeWidth={8} />
  </g>
);
const Room: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#E9D3B4" />
    <rect x={-300} y={FLOOR - 10} width={1680} height={900} fill="#B58A62" />
    <line x1={-300} y1={FLOOR - 10} x2={1380} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
  </g>
);
const Filmer: React.FC<{x: number; y: number; k?: number}> = ({x, y, k = 0.55}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <StickGuy pose="climb" />
    <rect x={56} y={-250} width={60} height={100} rx={10} fill="#2B2B2B" stroke="#1D1A1A" strokeWidth={6} />
    <rect x={64} y={-240} width={44} height={70} rx={4} fill="#BFE3F5" />
  </g>
);

// ───────────────────────── the shots ─────────────────────────
type Ctx = {t: number; f: number; local: number};
type Shot = {
  /** first word (-1: the cold open, from 0 s) */
  w: number;
  line: string;
  section: string;
  cam: 'reveal' | 'push' | 'none';
  storm?: boolean;
  /** the world (inside the camera) */
  draw: (c: Ctx) => React.ReactNode;
  /** screen shake, if any */
  shake?: (t: number) => number;
};
const shakeAt = (t: number, a: number, amp = 18) => (t > a && t < a + 0.35 ? amp * Math.sin((t - a) * 90) * (1 - (t - a) / 0.35) : 0);
const FALL = 1.15; // the cold-open crash starts here (s)

export const EP10_PLAN: Shot[] = [
  // 1 · cold open: the pretty house wobbles… and crashes flat
  {w: -1, line: '(rain, a creak, a crash)', section: 'Cold Open', cam: 'push', storm: true, shake: (t) => shakeAt(t, FALL + 0.42, 26),
    draw: ({t}) => {
      const tilt = t < FALL ? -4 + 2.5 * Math.sin(t * 9) : -4 - 86 * easeIn((t - FALL) / 0.42);
      return (
        <g>
          <Ground storm />
          <g transform="translate(540 330)"><Storm w={1100} /></g>
          {t < FALL + 0.42 ? <g transform={`translate(600 ${FLOOR})`}><FakeFront tilt={tilt} side /></g> : <g transform={`translate(640 ${FLOOR}) scale(1.4)`}><FakeFront fallen /></g>}
          <Rain t={t} />
        </g>
      );
    }},
  // 2 · That house looked perfect. Here's why it fell.
  {w: 0, line: 'That house looked perfect. Here\'s why it fell.', section: 'Cold Open', cam: 'reveal', storm: true,
    draw: ({t, f}) => (
      <g>
        <Ground storm />
        <g transform={`translate(800 ${FLOOR}) scale(1.3)`}><FakeFront fallen /></g>
        <Ebo f={f} x={320} y={2150} s={2.1} talk p={{eyes: t >= at(4) ? 'squint' : 'tired', mouth: 'flat', armR: [140, -10], armL: t >= at(6) ? [95, -6] : [14, 8]}} />
        <Umbrella x={300} y={760} />
        <Rain t={t} seed={1} />
      </g>
    )},
  // 3 · You can marry a woman for how she looks. Or for how she builds.
  {w: 8, line: 'You can marry a woman for how she looks. Or for how she builds.', section: 'Hook', cam: 'none',
    draw: ({t}) => (
      <Split
        top={
          <g>
            <Backdrop id="ep10-split-a" shade="pink" />
            <In t={t} at={at(14)} x={540} y={900} k={1.1} from="top"><FakeFront /></In>
            <In t={t} at={at(16)} x={0} y={0} from="drop"><Label x={540} y={140} text="looks" size={90} /></In>
          </g>
        }
        bottom={
          <g>
            <Backdrop id="ep10-split-b" shade="sky" />
            <In t={t} at={at(20)} x={540} y={1500} k={4} rot={-6} from="top"><Brick /></In>
            <In t={t} at={at(21)} x={0} y={0} from="drop"><Label x={540} y={1130} text="builds" red size={90} /></In>
          </g>
        }
      />
    )},
  // 4 · Marriage is a house you build together. Every kind word is a brick. Every insult is a crack.
  {w: 22, line: 'Marriage is a house you build together. Every kind word is a brick. Every insult is a crack.', section: 'The House', cam: 'reveal',
    draw: ({t, f}) => {
      const ama = walk(t, at(22) - 0.1, -200, 170);
      const ebo = walk(t, at(22) - 0.1, 1280, 910);
      const rows = t >= at(34) + 0.1 ? 6 : t >= at(27) ? 5 : t >= at(25) ? 3 : 0;
      return (
        <g>
          <Ground />
          <g transform={`translate(540 ${FLOOR + 140})`}><Plot /></g>
          {rows > 0 && <g transform={`translate(540 ${FLOOR})`}><BrickWall w={360} rows={rows} crack={t >= at(39)} /></g>}
          <Side f={f} who="ama" x={ama.x} p={{eyes: t >= at(39) ? 'sad' : 'happy', mouth: t >= at(39) ? 'frown' : 'smile', armR: t >= at(30) && t < at(37) ? [60, -30] : [12, 6], ...stride(t, ama.moving)}} />
          <Ebo f={f} x={ebo.x} front={!ebo.moving} facing={ebo.moving ? -1 : 1} p={{eyes: t >= at(36) ? 'half' : 'happy', mouth: t >= at(36) ? 'smirk' : 'smile', lookX: t >= at(36) ? -10 : 0, ...stride(t, ebo.moving)}} />
          <In t={t} at={at(30)} x={300} y={700} from="left"><SayBubble a="Proud of you!" size={56} w={440} /></In>
          {t >= at(32) && t < at(34) + 0.1 && <g transform={`translate(${430 + 110 * go(t, at(32), at(34) - at(32))} ${960 + 340 * easeIn((t - at(32)) / (at(34) - at(32) + 0.1))}) rotate(-8) scale(1.2)`}><Brick /></g>}
          <In t={t} at={at(36)} x={780} y={560} from="right"><g transform="scale(-1 1)"><SayBubble a="" size={52} w={440} /></g></In>
          <In t={t} at={at(36)} x={0} y={0} from="drop"><Label x={780} y={578} text="Ugh. Whatever." size={52} /></In>
        </g>
      );
    }},
  // 5 · So marry a woman who works with willing hands. When you both build, the walls go up fast.
  {w: 40, line: 'So marry a woman who works with willing hands. When you both build, the walls go up fast.', section: 'Willing Hands', cam: 'push',
    draw: ({t, f}) => {
      const rows = 6 + Math.round(10 * clamp((t - at(45)) / (at(57) - at(45))));
      const beat = WORDS.findIndex((w) => t >= w.s && t < w.e);
      const up = beat >= 45 && beat % 2 === 0;
      return (
        <g>
          <Ground />
          <g transform={`translate(540 ${FLOOR})`}><BrickWall w={460} rows={rows} /></g>
          <Ebo f={f} x={170} p={{eyes: 'happy', mouth: 'grin', armR: up ? [130, -20] : [70, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
          <Side f={f} who="ama" x={910} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: up ? [70, -20] : [130, -20]}} hold={<g transform="scale(0.8)"><Brick /></g>} />
        </g>
      );
    }},
  // 6 · Next door? Perfect paint. Fancy curtains. But nobody built the walls. Marry a woman who builds a home…
  {w: 58, line: 'Next door? Perfect paint. Fancy curtains. But nobody built the walls. Marry a woman who builds a home, not just decorates a house.', section: 'Next Door', cam: 'reveal',
    draw: ({t, f}) => {
      const mica = walk(t, at(60), 1300, 680);
      const christy = walk(t, at(62), 1400, 950);
      const wob = t >= at(65) ? 6 * Math.sin((t - at(65)) * 7) * Math.exp(-(t - at(65)) * 1.2) : 0;
      return (
        <g>
          <Ground />
          <g transform={`translate(270 ${FLOOR - 60}) scale(0.72)`}><House lights={t >= at(75)} /></g>
          <In t={t} at={at(59)} x={810} y={FLOOR - 60} k={0.72} from="right"><FakeFront side tilt={-3 + wob} /></In>
          <Ebo f={f} x={140} y={FLOOR + 330} s={0.8} p={{eyes: 'happy', mouth: 'smile', lookX: t >= at(58) && t < at(69) ? 10 : 0}} />
          <Side f={f} who="ama" x={400} y={FLOOR + 330} s={0.8} facing={-1} p={{eyes: 'happy', mouth: 'smile'}} k={2} />
          <Side f={f} who="mica" x={mica.x} y={FLOOR + 330} s={0.8} facing={mica.moving ? -1 : 1} p={{eyes: 'happy', mouth: 'smile', armR: mica.moving ? [12, 6] : [70, -30], ...stride(t, mica.moving)}} k={3} />
          <Side f={f} who="christy" x={christy.x} y={FLOOR + 330} s={0.8} facing={-1} p={{eyes: t >= at(65) ? 'wide' : 'happy', mouth: t >= at(65) ? 'o' : 'smile', ...stride(t, christy.moving)}} k={4} />
        </g>
      );
    }},
  // 7 · Then the storm comes. Every marriage gets one.
  {w: 81, line: 'Then the storm comes. Every marriage gets one.', section: 'The Storm', cam: 'reveal', storm: true,
    draw: ({t}) => {
      const fly = go(t, at(84), 0.55);
      return (
        <g>
          <Ground storm />
          <In t={t} at={at(83)} x={540} y={380} from="top"><Storm w={1100} /></In>
          <g transform={`translate(280 ${FLOOR}) scale(0.62)`}><House lights={false} /></g>
          <g transform={`translate(810 ${FLOOR}) scale(0.62)`}><FakeFront tilt={-6 + 2 * Math.sin(t * 6)} side /></g>
          {t >= at(84) && <Bill x={-250 + 400 * fly} y={1060} rot={-24} />}
          {t >= at(84) && <Bill x={290 + 400 * fly} y={1060} rot={-24} />}
          {t >= at(83) && <Rain t={t} seed={2} />}
        </g>
      );
    }},
  // 8 · Next door, they shout. It ends up online. Now the whole street knows… and the wall comes down.
  {w: 89, line: 'Next door, they shout. It ends up online. Now the whole street knows… and the wall comes down.', section: 'The Storm', cam: 'push', storm: true, shake: (t) => shakeAt(t, at(105) + 0.4, 22),
    draw: ({t, f}) => {
      const fall = easeIn((t - at(104)) / 0.55);
      const tilt = t < at(104) ? -10 + 3 * Math.sin(t * 8) : -10 - 75 * fall;
      const yell = (k: number) => (Math.floor(t / 0.2 + k) % 2 ? [140, -10] : [110, -20]) as [number, number];
      return (
        <g>
          <Ground storm />
          <g transform={`translate(560 ${FLOOR + 40})`}><FakeFront tilt={tilt} side /></g>
          <Side f={f} who="mica" x={250} p={{eyes: 'wide', mouth: t >= at(91) ? 'scream' : 'o', armL: t >= at(91) ? yell(0) : [12, 6], armR: t >= at(96) ? [120, -20] : [12, 6]}} hold={t >= at(96) ? <g transform="scale(0.35) rotate(-10)"><PostedPhone /></g> : undefined} k={3} />
          <Side f={f} who="christy" x={860} facing={-1} p={{eyes: 'angry', mouth: t >= at(92) ? 'scream' : 'flat', armL: t >= at(92) ? yell(1) : [12, 6], armR: t >= at(92) ? [100, -10] : [12, 6]}} k={4} />
          <In t={t} at={at(91)} x={250} y={640} from="left" twist={0}><Shout text="YOU!" rotate={-6} /></In>
          <In t={t} at={at(92) + 0.25} x={850} y={600} from="right" twist={0}><Shout text="NO, YOU!" rotate={6} /></In>
          <Rain t={t} seed={3} />
        </g>
      );
    }},
  // 9 · In your house, she stays calm.
  {w: 107, line: 'In your house, she stays calm.', section: 'She Stays Calm', cam: 'push', storm: true,
    draw: ({t, f}) => {
      const slide = go(t, at(110), 0.5);
      const settled = t >= at(112) + 0.2;
      const drop = ((t * 1.6) % 1) * 820;
      return (
        <g>
          <Room />
          <Window x={540} y={560} t={t} />
          <ellipse cx={300} cy={-10 + drop} rx={14} ry={22} fill="#6BB7E8" stroke="#1D1A1A" strokeWidth={4} />
          {!settled && <path d="M 250 900 q -30 -30 -10 -60 M 350 900 q 30 -30 10 -60" fill="none" stroke="#6BB7E8" strokeWidth={9} strokeLinecap="round" />}
          <Ebo f={f} x={settled ? 200 : 300} p={settled ? {eyes: 'open', mouth: 'o'} : {eyes: 'squeeze', mouth: 'scream', armL: [150, -20], armR: [150, -20], lift: -20 * Math.abs(Math.sin(t * 9))}} />
          <Side f={f} who="ama" x={800} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: t >= at(110) && !settled ? [40, -10] : [12, 6]}} k={2} />
          <g transform={`translate(${720 - 420 * slide} ${FLOOR - 70}) scale(0.9)`}><Bucket /></g>
        </g>
      );
    }},
  // 10 · You find the leak, together. And you fix it.
  {w: 113, line: 'You find the leak, together. And you fix it.', section: 'She Stays Calm', cam: 'reveal', storm: true,
    draw: ({t, f}) => {
      const hammering = t >= at(119);
      const hit = Math.floor(t / 0.16) % 2;
      return (
        <g>
          <Ground storm />
          <g transform={`translate(360 ${FLOOR}) scale(1.15)`}><House patch={t >= at(121)} leak={t < at(121)} lights /></g>
          <In t={t} at={at(113) - 0.1} x={860} y={FLOOR} rot={-12} from="right"><Ladder total={7} rungs={0} /></In>
          <Ebo f={f} x={770} y={1120} s={1} facing={-1} front={false} p={{eyes: 'squint', mouth: 'flat', armR: hammering && hit ? [150, -10] : [120, -10]}} />
          <g transform={`translate(590 880) rotate(${hammering && hit ? -10 : -45}) scale(0.7)`}><Hammer /></g>
          <Side f={f} who="ama" x={940} s={1} facing={-1} p={{eyes: 'open', mouth: 'smile', armR: [80, -20], armL: [70, -20], lookY: -14}} k={2} />
          <Rain t={t} seed={4} />
        </g>
      );
    }},
  // 11 · Marry a woman who handles conflict with grace, and keeps your problems inside your walls.
  {w: 122, line: 'Marry a woman who handles conflict with grace, and keeps your problems inside your walls.', section: 'With Grace', cam: 'none', storm: true,
    draw: ({t, f}) => (
      <Split
        top={
          <g>
            <Sky storm />
            <rect x={-200} y={760} width={1480} height={400} fill="#6F8F62" />
            <line x1={-200} y1={760} x2={1280} y2={760} stroke="#1D1A1A" strokeWidth={7} />
            <g transform="translate(540 790) scale(1.2)"><FakeFront fallen /></g>
            <Side f={f} who="mica" x={380} y={900} s={1} p={{eyes: 'sad', mouth: 'frown'}} k={3} />
            <Side f={f} who="christy" x={700} y={900} s={1} facing={-1} p={{eyes: 'sad', mouth: 'frown'}} k={4} />
            {[90, 200, 880, 990].map((fx, i) => (
              <In key={fx} t={t} at={at(126) + i * 0.15} x={fx} y={820 + (i % 2) * 20} from={fx < 540 ? 'left' : 'right'}><Filmer x={0} y={0} /></In>
            ))}
            <Rain t={t} seed={5} />
          </g>
        }
        bottom={
          <g>
            <Sky storm />
            <rect x={-200} y={1760} width={1480} height={400} fill="#6F8F62" />
            <line x1={-200} y1={1760} x2={1280} y2={1760} stroke="#1D1A1A" strokeWidth={7} />
            <g transform="translate(540 1760) scale(1.2)"><House lights /></g>
            <rect x={472} y={1532} width={136} height={228} fill="#FFE07A" />
            <g transform="translate(468 1760) scale(0.686 0.543)"><Door open={0.3 * (1 - go(t, at(134), 0.5))} /></g>
            <Rain t={t} seed={6} />
          </g>
        }
      />
    )},
  // 12 · Because the storm doesn't decide if a house stands. The builders do.
  {w: 137, line: 'Because the storm doesn\'t decide if a house stands. The builders do.', section: 'The Answer', cam: 'reveal',
    draw: ({t, f, local}) => (
      <g>
        <Ground />
        <g transform={`translate(900 ${560 - 260 * easeOut(local / 1.2)})`}><Sun /></g>
        <g transform={`translate(330 ${FLOOR}) scale(0.7)`}><House patch /></g>
        <g transform={`translate(820 ${FLOOR})`}><FakeFront fallen /></g>
        <Ebo f={f} x={150} y={FLOOR + 170} s={0.95} p={{eyes: 'happy', mouth: 'grin', armR: t >= at(147) ? [150, -10] : [12, 6], armL: t >= at(147) ? [150, -10] : [12, 6]}} />
        <Side f={f} who="ama" x={500} y={FLOOR + 170} s={0.95} facing={-1} p={{eyes: 'happy', mouth: 'smile', armR: t >= at(147) ? [140, -10] : [12, 6]}} k={2} />
        <In t={t} at={at(147)} x={0} y={0} from="top"><Label x={540} y={560} text="the builders do." red size={100} rot={-2} /></In>
      </g>
    )},
  // 13 · And remember: she's choosing a builder too. Be the man worth building with.
  {w: 149, line: 'And remember: she\'s choosing a builder too. Be the man worth building with.', section: 'Close', cam: 'push',
    draw: ({t, f}) => (
      <g>
        <In t={t} at={at(154)} x={850} y={980} k={2} rot={-8} from="right"><Brick /></In>
        <Ebo f={f} x={480} y={2560} s={3.1} talk p={{eyes: 'happy', mouth: 'smile', lookX: t >= at(154) && t < at(156) ? 12 : 0}} />
        <In t={t} at={at(159)} x={0} y={0} from="top"><Label x={540} y={420} text="be worth building with" red size={86} rot={-2} /></In>
      </g>
    )},
];

export const EP10_SECTIONS: string[] = EP10_PLAN.map((s) => s.section);
const START = EP10_PLAN.map((s) => (s.w < 0 ? 0 : Math.max(0, at(s.w) - 0.1)));
export const EP10_SHOT_TIMES = START;
export const ep10ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < START.length; k++) if (t >= START[k]) i = k;
  return i;
};
const LEN = START.map((s, i) => (i + 1 < START.length ? START[i + 1] : END) - s);

// ───────────────────────── sound ─────────────────────────
/** Every piece that swoops in on a word (rule 21), and the effects (sfxCues). */
export const EP10_SFX = () => [
  // the cold open: creak, crash
  {at: 0.6, sfx: 'slide', vol: 0.5},
  {at: FALL + 0.42, sfx: 'body_thud', vol: 1},
  {at: FALL + 0.45, sfx: 'drop', vol: 0.8},
  // swooshes on the pieces
  ...[14, 20, 30, 36, 59, 83, 91, 154, 147, 159].map((k) => ({at: at(k) - 0.05, sfx: 'swoosh', vol: 0.7})),
  ...[0, 1, 2, 3].map((i) => ({at: at(126) + i * 0.15 - 0.05, sfx: 'swoosh', vol: 0.4})),
  ...EP10_PLAN.map((s, i) => (s.cam === 'reveal' && i > 0 ? {at: START[i], sfx: 'swoosh', vol: 0.3} : null)).filter((x): x is {at: number; sfx: string; vol: number} => x !== null),
  // footsteps on the walk-ins
  ...[0, 0.12, 0.24, 0.36].map((d) => ({at: at(22) - 0.1 + d, sfx: 'footstep', vol: 0.4})),
  ...[0, 0.12, 0.24, 0.36].map((d) => ({at: at(60) + d, sfx: 'footstep', vol: 0.35})),
  // bricks and the crack
  {at: at(25), sfx: 'drop', vol: 0.5}, {at: at(27), sfx: 'drop', vol: 0.5}, {at: at(34) + 0.1, sfx: 'drop', vol: 0.7},
  {at: at(30), sfx: 'pop', vol: 0.6}, {at: at(36), sfx: 'pop', vol: 0.6}, {at: at(39), sfx: 'crunch', vol: 0.8},
  ...[46, 48, 50, 52, 54, 56].map((k) => ({at: at(k), sfx: 'drop', vol: 0.35})),
  // the house lights, the bills
  {at: at(75), sfx: 'click', vol: 0.6}, {at: at(84), sfx: 'paper_flick', vol: 0.8}, {at: at(84) + 0.5, sfx: 'slap', vol: 0.6},
  // the fight, the phone, the wall
  {at: at(96), sfx: 'phone_buzz', vol: 0.6},
  {at: at(105) + 0.4, sfx: 'body_thud', vol: 1}, {at: at(105) + 0.42, sfx: 'drop', vol: 0.7},
  // the bucket, the hammer, the door
  {at: at(110), sfx: 'slide', vol: 0.6},
  ...[0, 0.32, 0.64, 0.96].map((d) => ({at: at(119) + 0.16 + d, sfx: 'hammer', vol: 0.7})),
  {at: at(136), sfx: 'click', vol: 0.8},
  // the end
  {at: at(147), sfx: 'cha_ching', vol: 0.5},
];
/** A pop for each piece that drops without a swoop. */
export const EP10_SLAMS: number[] = [16, 21].map(at);

// ───────────────────────── the frame ─────────────────────────
export const Ep10Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep10ShotAt(f);
  const s = EP10_PLAN[i];
  const local = t - START[i];
  const zoom = swoopZoom(s.cam, local, LEN[i]);
  const shake = s.shake?.(t) ?? 0;
  return (
    <StageSizeContext.Provider value={{w: EP10_W, h: EP10_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={{zoom, cx: 540, cy: 960}} shakeX={shake} shakeY={shake * 0.6} bg={s.storm ? '#2E2848' : '#DDE9F8'} blurBg={<Sky storm={s.storm} />}>
              {s.draw({t, f, local})}
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp10: React.FC = () => (
  <>
    <Ep10Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep10/voice.mp3')} />
    {/* sound effects (src/series/sfxCues.ts, mixed by scripts/sfx/mix.py) */}
    <Html5Audio src={staticFile('ebo-ep10/sfx.mp3')} />
  </>
);
