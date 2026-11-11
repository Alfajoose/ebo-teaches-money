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
import {Clock, CarKeys} from '../components/NiceGuyProps';
import {FoodBowl} from '../components/WantsInserts';
import {Laptop} from '../components/StayPoorProps';
import {Door, TalkTable} from '../components/HouseProps';
import {SayBubble} from '../components/PovertyProps';
import {Brush, BuzzPhone, Cricket, Notebook, Router, SneakerSign, Sneakers, Sticky, ThreadPhone, WeekCalendar} from '../components/AvailableProps';
import wordsJson from './data/ep11-words.json';
import envJson from './data/ep11-env.json';

/**
 * EBO TEACHES MONEY — Ep 11 "The Dangerous Side of Being Too Available" (vertical, 1080×1920, ~41 s).
 * Rule 22: Ebo tells it as his own story (first person), to camera for the explaining lines and as voice-over in the
 * action; the cast speak their own lines (Mica, Christy, the boss, Ama), lip-synced; silent beats for the gags.
 * One chain: always available → your time looks free → used, not valued → people plan around you → the fix.
 */
export const EP11_W = 1080;
export const EP11_H = 1920;
type W = Word & {who: string};
const WORDS = wordsJson as W[];
const ENV = envJson as Record<string, number[]>;
const END = WORDS[WORDS.length - 1].e + 0.9;
export const EP11_DURATION = Math.ceil(END * VFPS);
const at = (k: number) => WORDS[k].s;
const after = (k: number) => WORDS[k].e + 0.12;
const FLOOR = 1500;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const go = (t: number, a: number, d = 0.4) => 1 - (1 - clamp((t - a) / d)) ** 3;

// ───────────────────────── the cast ─────────────────────────
type Look = Partial<Pose>;
const sway = (t: number, k: number) => ({tilt: 1.4 * Math.sin(t * 2.1 + k), lift: 2.5 * Math.sin(t * 2.9 + k * 2)});
const stride = (t: number, moving: boolean): Look => {
  if (!moving) return {};
  const ph = Math.floor(t / 0.12) % 2;
  return {legL: ph ? [20, 6] : [-8, 0], legR: ph ? [-8, 0] : [20, 6], lift: -6 * ph};
};
const walk = (t: number, a: number, from: number, x: number, d = 0.55) => {
  const u = clamp((t - a) / d);
  return {x: from + (x - from) * (1 - (1 - u) ** 2), moving: u > 0 && u < 1};
};
/** Lip sync for anyone: Ebo's four talk shapes (0 shut, 1 wide, 2 small, 3 round), mapped to each rig's own mouths. */
const LIP_MAP: Partial<Record<CastId, number[]>> = {mica: [0, 3, 1, 2], obuor: [0, 3, 1, 2], christy: [0, 1, 0, 3]};
const talkFrame = (who: CastId, f: number) => {
  const env = ENV[who];
  if (!env || (env[f] ?? 0) < 0.1) return undefined;
  const k = lipFrame(env, WORDS, f);
  return LIP_MAP[who]?.[k] ?? k;
};
const Ebo: React.FC<{f: number; x: number; y?: number; s?: number; p?: Look; front?: boolean; facing?: 1 | -1; talk?: boolean; hold?: React.ReactNode}> = ({f, x, y = FLOOR, s = 1.3, p = {}, front = true, facing = 1, talk, hold}) => {
  const t = f / VFPS;
  const sw = sway(t, 0);
  let pose = {...POSE.stand, ...p} as Pose;
  pose = {...pose, tilt: (pose.tilt ?? 0) + sw.tilt, lift: (pose.lift ?? 0) + sw.lift} as Pose;
  return (
    <RigCharacter who="ebo" x={x} y={y} scale={s} facing={facing} t={f} pose={front ? gentle(frontOn(pose)) : gentle(pose)} mouthFrame={talk ? talkFrame('ebo', f) : undefined}>
      {hold}
    </RigCharacter>
  );
};
const Side: React.FC<{f: number; who: CastId; x: number; y?: number; s?: number; p?: Look; facing?: 1 | -1; talk?: boolean; hold?: React.ReactNode; k?: number}> = ({f, who, x, y = FLOOR, s = 1.3, p = {}, facing = 1, talk, hold, k = 1}) => {
  const t = f / VFPS;
  const sw = sway(t, k);
  const pose = {...(POSES.standing as Pose), ...p} as Pose;
  return (
    <RigCharacter who={who} x={x} y={y} scale={s} facing={facing} t={f + k * 17} pose={gentle({...pose, tilt: (pose.tilt ?? 0) + sw.tilt, lift: (pose.lift ?? 0) + sw.lift} as Pose)} mouthFrame={talk ? talkFrame(who, f) : undefined}>
      {hold}
    </RigCharacter>
  );
};
/** Ebo narrating to camera (rule 22): big along the bottom, lip-synced, a gesture every few words. */
const Narrator: React.FC<{f: number; t: number; look?: number; armR?: [number, number]; hold?: React.ReactNode}> = ({f, t, look = 0, armR, hold}) => {
  const wi = WORDS.findIndex((w) => t >= w.s && t < w.e);
  const beat = wi >= 0 ? Math.floor(wi / 3) % 3 : 0;
  const gesture: Look = beat === 1 ? {armL: [70, -40], brows: 'up'} : beat === 2 ? {armL: [55, -50]} : {};
  const eyes = beat === 1 ? 'squint' : beat === 2 ? 'happy' : 'half';
  return <Ebo f={f} x={540} y={2170} s={2.25} talk hold={hold} p={{eyes, mouth: 'smile', lookX: look, headTilt: wi >= 0 ? (wi % 2 ? 3 : -2) : 0, ...(armR ? {armR} : {}), ...gesture}} />;
};

// ───────────────────────── the world ─────────────────────────
const Room: React.FC<{night?: boolean}> = ({night}) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill={night ? '#3A3550' : '#F2E3B8'} />
    <rect x={-300} y={FLOOR - 10} width={1680} height={900} fill={night ? '#2A2640' : '#B58A62'} />
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
const buzzShake = (t: number, a: number) => (t > a ? 6 * Math.sin(t * 70) : 0);

// ───────────────────────── the shots ─────────────────────────
type Ctx = {t: number; f: number; local: number};
type Shot = {start: number; line: string; section: string; cam: 'reveal' | 'push' | 'none'; bg?: string; draw: (c: Ctx) => React.ReactNode};

export const EP11_PLAN: Shot[] = [
  // 1 · cold open: noodles; the phone buzzes; he answers in one ring
  {start: 0, line: '(buzz)', section: 'Cold Open', cam: 'push',
    draw: ({t, f}) => {
      const chew = Math.floor(t / 0.18) % 2;
      return (
        <g>
          <Room />
          <Ebo f={f} x={330} p={t < 0.55 ? {eyes: 'happy', mouth: chew ? 'smile' : 'o', armL: chew ? [70, -40] : [45, -40]} : {eyes: 'wide', mouth: 'o', lookX: 12, armL: [60, -40]}} />
          <g transform={`translate(560 ${FLOOR})`}><TalkTable /></g>
          <g transform="translate(470 1215) scale(0.8)"><FoodBowl /></g>
          <g transform={`translate(720 1130) scale(0.55) rotate(${8 + buzzShake(t, 0.4)})`}><BuzzPhone caller="MICA" buzz={t >= 0.4} /></g>
          {t >= 0.4 && <In t={t} at={0.4} x={0} y={0} from="drop"><Label x={760} y={880} text="bzzz!" red size={70} rot={8} /></In>}
        </g>
      );
    }},
  // 2 · MICA: Bro, you free?
  {start: at(0) - 0.1, line: 'Bro, you free?', section: 'Cold Open', cam: 'reveal',
    draw: ({t, f}) => (
      <g>
        <Backdrop id="ep11-car" shade="sky" />
        <rect x={-50} y={300} width={1180} height={1000} rx={60} fill="none" stroke="#1D1A1A" strokeWidth={40} />
        <g transform={`translate(0 ${4 * Math.sin(t * 14)})`}>
          <Side f={f} who="mica" x={540} y={2120} s={2.1} talk p={{eyes: 'happy', mouth: 'grin', armR: [130, -70]}} k={3} />
          <g transform="translate(290 1130) rotate(-12) scale(0.55)"><BuzzPhone caller="EBO" buzz={false} /></g>
        </g>
        <In t={t} at={at(0)} x={560} y={560} from="top"><Bubble x={0} y={0} lines={['Bro, you free?']} /></In>
      </g>
    )},
  // 3 · EBO: Always!  (grabs the keys and runs)
  {start: at(3) - 0.1, line: 'Always!', section: 'Cold Open', cam: 'none',
    draw: ({t, f}) => {
      const run = walk(t, after(3) + 0.15, 460, 1350, 0.5);
      return (
        <g>
          <Room />
          {run.moving && <Speed x={run.x - 140} y={1100} />}
          <Ebo f={f} x={run.x} front={false} talk p={{eyes: 'happy', mouth: 'grin', tilt: run.moving ? 8 : 0, armR: [80, -20], ...stride(t, true)}} hold={<g transform="scale(1.4)"><CarKeys /></g>} />
          <In t={t} at={at(3)} x={430} y={620} from="drop" twist={0}><Bubble x={0} y={0} lines={['Always!']} w={420} size={70} /></In>
        </g>
      );
    }},
  // 4 · EBO (to camera): That was my problem. I was always free.
  {start: at(4) - 0.1, line: 'That was my problem. I was always free.', section: 'The Problem', cam: 'push',
    draw: ({t, f}) => (
      <g>
        <Room />
        <Narrator f={f} t={t} armR={[70, -30]} hold={<g transform="scale(1.2)"><CarKeys /></g>} />
      </g>
    )},
  // 5 · CHRISTY: Ebo! My wifi!
  {start: at(12) - 0.25, line: 'Ebo! My wifi!', section: 'The Problem', cam: 'reveal', bg: '#DCF1E5',
    draw: ({t, f, local}) => {
      const run = walk(local, 0.15, -250, 300, 0.45);
      return (
        <g>
          <Backdrop id="ep11-street" shade="mint" />
          <rect x={-300} y={FLOOR - 10} width={1680} height={900} fill="#A9D18E" />
          <line x1={-300} y1={FLOOR - 10} x2={1380} y2={FLOOR - 10} stroke="#1D1A1A" strokeWidth={7} />
          <g transform={`translate(760 ${FLOOR}) scale(1.4)`}><Door open={0.5} /></g>
          <Side f={f} who="christy" x={880} facing={-1} talk p={{eyes: 'wide', mouth: 'scream', armR: [110 + 15 * Math.sin(t * 12), -10]}} k={4} />
          <g transform="translate(560 1420) scale(0.7)"><Router /></g>
          <Ebo f={f} x={run.x} front={false} p={{eyes: 'wide', mouth: 'o', tilt: 10, ...stride(t, true)}} />
          <Speed x={run.x - 140} y={1150} />
          <In t={t} at={at(12)} x={640} y={420} from="right"><Bubble x={0} y={0} lines={['Ebo! My wifi!']} flip /></In>
        </g>
      );
    }},
  // 6 · THE BOSS (phone): Quick one… I know it's midnight…
  {start: at(15) - 0.15, line: "Quick one… I know it's midnight…", section: 'The Problem', cam: 'push', bg: '#3A3550',
    draw: ({t, f}) => {
      const typing = Math.floor(t / 0.14) % 2;
      return (
        <g>
          <Room night />
          <g transform="translate(820 420) scale(0.9)"><Clock h={12} /></g>
          <Label x={820} y={620} text="12:04 AM" red size={60} />
          <g transform={`translate(560 ${FLOOR})`}><TalkTable /></g>
          <g transform="translate(560 1230) scale(0.8)"><Laptop screen="code" /></g>
          <Ebo f={f} x={300} p={{eyes: 'tired', mouth: 'flat', armR: typing ? [70, -30] : [60, -40]}} />
          <g transform={`translate(760 1170) scale(0.4) rotate(${buzzShake(t, at(15) - 0.15)})`}><BuzzPhone caller="BOSS" /></g>
          <In t={t} at={at(15)} x={560} y={800} from="top"><Bubble x={0} y={0} lines={['Quick one…', "I know it's midnight…"]} w={640} size={48} /></In>
        </g>
      );
    }},
  // 7 · EBO (walk-and-talk): your time looks free… free things get used, not valued
  {start: at(21) - 0.1, line: "When you're always available, your time looks free. And free things get used. Not valued.", section: 'Why', cam: 'push',
    draw: ({t, f, local}) => {
      const x = 330 + 300 * clamp(local / 4.5);
      const notes: [string, number, number, number, string, number][] = [
        ['MICA', -70, 1080, -12, '#FFE45C', 22], ['WIFI!', 30, 1180, 10, '#F7B6CB', 24], ['BOSS', -20, 1290, -6, '#BFE3F5', 26],
        ['HELP', 90, 1050, 14, '#B7E4A8', 29], ['RIDE?', 60, 1330, -14, '#FFE45C', 31], ['LOAN?', -100, 1240, 8, '#F7B6CB', 33],
      ];
      return (
        <g>
          <Room />
          <Ebo f={f} x={x} front={false} talk p={{eyes: 'half', mouth: 'flat', ...stride(t, local < 4.5)}} />
          {notes.map(([txt, dx, y, r, c, k]) => (
            <In key={txt} t={t} at={at(k)} x={x + dx} y={y} k={0.8} from={dx < 0 ? 'left' : 'right'}><Sticky text={txt} rotate={r} color={c} /></In>
          ))}
          <In t={t} at={at(33)} x={0} y={0} from="top"><Label x={540} y={420} text="free = used" red size={90} rot={-3} /></In>
        </g>
      );
    }},
  // 8 · MICA (text): Party was mad last night! Can you help clean up?  (silent)
  {start: after(35), line: 'Party was mad last night! Can you help clean up?', section: 'Why', cam: 'push', bg: '#E6DEF7',
    draw: ({t, local}) => (
      <g>
        <Backdrop id="ep11-phone" shade="lilac" />
        <In t={t} at={after(35)} x={540} y={960} k={2} from="right"><ThreadPhone photo msg={local > 0.7 ? ['Party was mad', 'last night!', 'Can you help', 'clean up?'] : []} /></In>
      </g>
    )},
  // 9 · EBO: …Sure.  (a cricket)
  {start: at(36) - 0.3, line: '…Sure.', section: 'Why', cam: 'none',
    draw: ({t, f}) => (
      <g>
        <Room />
        <Ebo f={f} x={540} y={2350} s={2.6} talk p={{eyes: 'half', mouth: 'flat'}} />
        <In t={t} at={at(36)} x={540} y={480} from="drop" twist={0}><Bubble x={0} y={0} lines={['…Sure.']} w={380} size={70} /></In>
        {t >= at(36) + 0.5 && <g transform={`translate(${880 - 60 * clamp((t - at(36) - 0.5) / 0.3)} 1820) scale(1.2)`}><Cricket /></g>}
      </g>
    )},
  // 10 · EBO: People stopped planning with me. They planned around me.
  {start: at(37) - 0.1, line: 'People stopped planning with me. They planned around me.', section: 'The Result', cam: 'reveal',
    draw: ({t, f}) => (
      <g>
        <Room />
        <In t={t} at={at(37)} x={560} y={640} k={0.95} from="top"><WeekCalendar /></In>
        <Ebo f={f} x={250} talk p={{eyes: 'half', mouth: 'flat', armR: t >= at(43) ? [100, -10] : [12, 6]}} />
      </g>
    )},
  // 11 · AMA: When did you last finish something for you?
  {start: at(46) - 0.15, line: 'When did you last finish something for you?', section: 'The Turn', cam: 'push',
    draw: ({t, f}) => (
      <g>
        <Room />
        <g transform={`translate(830 ${FLOOR}) scale(0.8)`}><SneakerSign done={0.34} dust /></g>
        <Side f={f} who="ama" x={170} talk p={{eyes: 'open', mouth: 'smile', armR: t >= at(50) ? [95, -10] : [12, 6]}} k={2} />
        <Ebo f={f} x={540} facing={t >= at(51) ? 1 : -1} front={false} p={{eyes: 'half', mouth: 'flat', lookX: t >= at(51) ? 10 : 0}} />
        <In t={t} at={at(46)} x={420} y={520} from="left"><Bubble x={0} y={0} lines={['When did you last finish', 'something for you?']} w={720} size={48} /></In>
      </g>
    )},
  // 12 · (beat) Ebo looks at the sign. Silence.
  {start: after(53), line: '(beat)', section: 'The Turn', cam: 'push',
    draw: ({f}) => (
      <g>
        <Room />
        <g transform="translate(820 1250) scale(0.85)"><SneakerSign done={0.34} dust /></g>
        <Ebo f={f} x={420} y={2350} s={2.6} p={{eyes: 'sad', mouth: 'flat', lookX: 14}} />
      </g>
    )},
  // 13 · EBO (walk-and-talk): So I changed one thing. I'm reachable. Just not instantly.
  {start: at(54) - 0.1, line: "So I changed one thing. I'm reachable. Just not instantly.", section: 'The Fix', cam: 'reveal',
    draw: ({t, f}) => {
      const stroke = Math.floor(t / 0.22) % 2;
      return (
        <g>
          <Room />
          <g transform={`translate(700 ${FLOOR}) scale(0.95)`}><SneakerSign done={t >= at(60) ? 0.67 : 0.34} /></g>
          <Ebo f={f} x={300} talk p={{eyes: 'squint', mouth: 'smile', armR: stroke ? [120, -20] : [100, -30]}} hold={<Brush rotate={30} />} />
          <g transform={`translate(160 ${FLOOR + 120}) rotate(${-80 + (t >= at(57) ? buzzShake(t, at(57)) : 0)}) scale(0.4)`}><BuzzPhone caller="MICA" buzz={t >= at(57)} /></g>
          <In t={t} at={at(61)} x={0} y={0} from="top"><Label x={540} y={420} text="reachable ≠ on call" red size={70} rot={-2} /></In>
        </g>
      );
    }},
  // 14 · EBO (text): Can't today. Saturday, 2pm?  (silent; he types)
  {start: after(63), line: "Can't today. Saturday, 2pm?", section: 'The Fix', cam: 'push', bg: '#DDE9F8',
    draw: ({t, local}) => (
      <g>
        <Backdrop id="ep11-phone2" shade="sky" />
        <In t={t} at={after(63)} x={540} y={960} k={2} from="left"><ThreadPhone msg={['Bro you free?']} reply={local > 1.0 ? ["Can't today.", 'Saturday, 2pm?'] : local > 0.5 ? ["Can't today."] : undefined} /></In>
      </g>
    )},
  // 15 · MICA: …Oh. Okay. Saturday.
  {start: at(64) - 0.15, line: '…Oh. Okay. Saturday.', section: 'The Fix', cam: 'reveal', bg: '#F8E5CF',
    draw: ({t, f}) => (
      <g>
        <Backdrop id="ep11-mica" shade="peach" />
        <Side f={f} who="mica" x={470} y={2250} s={2.4} talk p={{eyes: 'wide', mouth: 'o', armR: [80, -40]}} k={3} />
        <In t={t} at={at(66)} x={820} y={1150} k={1.2} rot={8} from="right"><Notebook text="SAT 2pm" /></In>
        <In t={t} at={at(64)} x={540} y={480} from="top"><Bubble x={0} y={0} lines={['…Oh. Okay.', 'Saturday.']} w={500} size={60} /></In>
      </g>
    )},
  // 16 · EBO: When my time stopped being free, people started treating it like it mattered.
  {start: at(67) - 0.1, line: 'Funny thing. When my time stopped being free, people started treating it like it mattered.', section: 'Payoff', cam: 'reveal',
    draw: ({t, f}) => {
      const clap = Math.floor(t / 0.16) % 2;
      return (
        <g>
          <Room />
          <g transform={`translate(560 ${FLOOR}) scale(0.95)`}><SneakerSign done={1} /></g>
          <In t={t} at={at(75)} x={560} y={1360} from="top"><Sneakers shine /></In>
          <Ebo f={f} x={200} p={{eyes: 'happy', mouth: 'grin', armR: [120, -20]}} />
          <Side f={f} who="ama" x={940} facing={-1} p={{eyes: 'happy', mouth: 'grin', armL: t >= at(77) ? (clap ? [80, -60] : [60, -80]) : [12, 6], armR: t >= at(77) ? (clap ? [80, -60] : [60, -80]) : [12, 6]}} k={2} />
        </g>
      );
    }},
  // 17 · EBO: Be there for people. Just don't be everyone's backup plan.
  {start: at(82) - 0.1, line: "Be there for people. Just don't be everyone's backup plan.", section: 'Close', cam: 'push',
    draw: ({t, f}) => (
      <g>
        <Room />
        <Narrator f={f} t={t} />
        <In t={t} at={at(89)} x={0} y={0} from="top"><Label x={540} y={420} text="not everyone's backup plan" red size={70} rot={-2} /></In>
      </g>
    )},
];

export const EP11_SECTIONS: string[] = EP11_PLAN.map((s) => s.section);
const START = EP11_PLAN.map((s) => Math.max(0, s.start));
export const EP11_SHOT_TIMES = START;
export const ep11ShotAt = (f: number) => {
  const t = f / VFPS;
  let i = 0;
  for (let k = 0; k < START.length; k++) if (t >= START[k]) i = k;
  return i;
};
const LEN = START.map((s, i) => (i + 1 < START.length ? START[i + 1] : END) - s);

// ───────────────────────── sound ─────────────────────────
export const EP11_SFX = () => [
  {at: 0.4, sfx: 'phone_buzz', vol: 0.8},
  {at: at(15) - 0.15, sfx: 'phone_buzz', vol: 0.6},
  {at: after(35), sfx: 'phone_buzz', vol: 0.6},
  {at: at(57), sfx: 'phone_buzz', vol: 0.5},
  ...[0, 0.12, 0.24, 0.36].map((d) => ({at: at(3) + 0.35 + d, sfx: 'footstep', vol: 0.5})),
  ...[0, 0.12, 0.24].map((d) => ({at: at(12) - 0.1 + d, sfx: 'footstep', vol: 0.5})),
  {at: at(3) + 0.3, sfx: 'whoosh', vol: 0.5},
  ...[0, 2, 12, 36, 46, 64].map((k) => ({at: at(k), sfx: 'pop', vol: 0.45})),
  ...[22, 24, 26, 29, 31, 33].map((k) => ({at: at(k), sfx: 'slap', vol: 0.4})),
  ...[0.6, 0.75, 0.9, 1.05, 1.2].map((d) => ({at: after(63) + d, sfx: 'typing', vol: 0.4})),
  {at: at(36) + 0.5, sfx: 'cricket', vol: 0.7},
  {at: at(66), sfx: 'marker_tick', vol: 0.6},
  {at: at(75), sfx: 'cha_ching', vol: 0.6},
  ...[37, 54, 67].map((k) => ({at: at(k) - 0.1, sfx: 'swoosh', vol: 0.3})),
  ...[33, 61, 89].map((k) => ({at: at(k) - 0.05, sfx: 'swoosh', vol: 0.6})),
];
export const EP11_SLAMS: number[] = [];

// ───────────────────────── the frame ─────────────────────────
export const Ep11Frame: React.FC<{f: number}> = ({f}) => {
  useMarkerFont();
  const t = f / VFPS;
  const i = ep11ShotAt(f);
  const s = EP11_PLAN[i];
  const local = t - START[i];
  const zoom = swoopZoom(s.cam, local, LEN[i]);
  return (
    <StageSizeContext.Provider value={{w: EP11_W, h: EP11_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={{zoom, cx: 540, cy: 960}} bg={s.bg ?? '#F2E3B8'}>
              {s.draw({t, f, local})}
            </VStage>
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

export const EboEp11: React.FC = () => (
  <>
    <Ep11Frame f={useCurrentFrame()} />
    <Html5Audio src={staticFile('ebo-ep11/voice.mp3')} />
    <Html5Audio src={staticFile('ebo-ep11/sfx.mp3')} />
  </>
);
