import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {RigCharacter} from '../cast/RigCharacter';
import {cycleSpeed} from '../cast/cycles';
import {Pose} from '../components/Character';
import {BigPhone, Diploma} from '../components/StayBrokeProps';
import {FLOOR_Y} from '../backgrounds/Backgrounds';
import {VFPS, Word, VStage, Framing, CamMove, camera, lipFrame, lipHeadNod, chunkWords, TopCaption, BigText} from './kit';
import {C, FONT} from '../theme';
import {Slam, LayerMode, LayerModeContext, StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import {SEAT_Y} from './ep03plan';
import {EP04_PLAN, ep04Set, ep04Times, Ep04Set} from './ep04plan';
import wordsJson from './data/ep04-words.json';
import envJson from './data/ep04-env.json';

/**
 * EBO TEACHES MONEY — Episode 4: The Ultimate Guide to Staying Broke (16:9, 1920×1080).
 * Animated straight from the approved storyboard plan (ep04plan.tsx): each shot's framing,
 * camera move, set, props, Ebo's placement and pose come from the plan, and each shot starts
 * on the first word of its line in the recorded voice.
 */

export const EP04_W = 1920;
export const EP04_H = 1080;

const WORDS = wordsJson as Word[];
const ENV = (envJson as {env: number[]}).env;
const CHUNKS = chunkWords(WORDS, 6, 34);
const TIMES = ep04Times();
export const EP04_DURATION = Math.ceil((TIMES[TIMES.length - 1].start + TIMES[TIMES.length - 1].length) * VFPS);
export const EP04_SHOT_TIMES = TIMES.map((x) => x.start);

const CREAM = '#F3E6CF';
/** Sets where Ebo is the host talking to camera (lip-synced); elsewhere he's acting the habit. */
const HOST_SETS: Ep04Set[] = ['studio', 'chapter', 'green'];

/** The camera for a shot, from its planned start/end framing and move. */
const shotCamera = (t: number, start: number, length: number, s: (typeof EP04_PLAN)[number]): Framing => {
  const f = planCamera(t, start, length, s);
  // in tight shots, sit the face a little higher so the mouth stays clear of the caption
  return {...f, cy: f.cy + Math.max(0, f.zoom - 2.4) * 45};
};
const planCamera = (t: number, start: number, length: number, s: (typeof EP04_PLAN)[number]): Framing => {
  if (!s.to) return s.from;
  const moves: CamMove[] = [];
  switch (s.move) {
    case 'whip-pan':
      moves.push([start + Math.min(0.35, length * 0.3), s.to, 0.28, 'whip']);
      break;
    case 'snap-zoom':
      moves.push([start + Math.min(0.3, length * 0.25), s.to, 0.18, 'whip']);
      break;
    case 'drift':
    case 'follow':
      moves.push([start, s.to, length, 'linear']);
      break;
    case 'pan':
      moves.push([start + 0.1, s.to, Math.max(0.6, Math.min(length - 0.2, 1.6)), 'ease']);
      break;
    default: // push-in / pull-out: slow and steady over most of the shot
      moves.push([start, s.to, Math.max(0.5, length * 0.9), 'ease']);
  }
  return camera(t, s.from, moves);
};

/** Props that animate with time (the phone feed scrolls; the degree's stamp snaps on). */
const live = (node: React.ReactNode, f: number, local: number): React.ReactNode => {
  if (!React.isValidElement(node)) return node;
  const el = node as React.ReactElement<Record<string, unknown>>;
  if (el.type === BigPhone) return React.cloneElement(el, {t: f});
  if (el.type === Diploma) return React.cloneElement(el, {stamped: local > 0.45});
  if (el.type === React.Fragment) return <>{React.Children.map(el.props.children as React.ReactNode, (c) => live(c, f, local))}</>;
  return el;
};

/** On-screen text from the plan: the title, the chapter cards, the "2017" stamp and the end card. */
const Overlay: React.FC<{text?: string; t: number; start: number}> = ({text, t, start}) => {
  if (!text) return null;
  if (text.startsWith('HOW TO STAY BROKE /')) {
    const title = text.split('/ ')[1];
    const lines = title.length > 12 ? title.split(' ').reduce<string[]>((acc, w) => {
      if (acc.length && (acc[acc.length - 1] + ' ' + w).length <= 12) acc[acc.length - 1] += ' ' + w;
      else acc.push(w);
      return acc;
    }, []) : [title];
    return (
      <g>
        <Slam t={t} at={start - 0.5} dist={-160} twist={-4}>
          <text x={150} y={300} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.red} letterSpacing={8}>
            HOW TO STAY BROKE
          </text>
        </Slam>
        <Slam t={t} at={start} dist={-300} twist={-8}>
          {lines.map((l, i) => (
            <text key={l} x={142} y={440 + i * 140} fontFamily={FONT} fontWeight={900} fontSize={lines.length > 1 ? 136 : 150} fill={CREAM} letterSpacing={2}>
              {l}
            </text>
          ))}
          <rect x={150} y={440 + (lines.length - 1) * 140 + 50} width={220} height={18} rx={9} fill={C.red} />
        </Slam>
      </g>
    );
  }
  if (text.startsWith('THE ULTIMATE GUIDE')) {
    return (
      <g>
        <Slam t={t} at={start + 0.15} dist={-200}>
          <text x={150} y={360} fontFamily={FONT} fontWeight={900} fontSize={64} fill={CREAM} letterSpacing={6}>
            THE ULTIMATE GUIDE TO
          </text>
        </Slam>
        <Slam t={t} at={start + 0.9} dist={-320} twist={10}>
          <text x={150} y={560} fontFamily={FONT} fontWeight={900} fontSize={200} fill={C.red}>
            STAYING
          </text>
          <text x={150} y={760} fontFamily={FONT} fontWeight={900} fontSize={200} fill={C.red}>
            BROKE
          </text>
        </Slam>
      </g>
    );
  }
  if (text.startsWith('2017')) {
    return (
      <Slam t={t} at={start + 0.6} dist={-140} twist={6}>
        <BigText text="2017" x={1620} y={200} size={90} fill={C.yellow} rotate={-6} />
      </Slam>
    );
  }
  if (text.startsWith('SUBSCRIBE')) {
    return (
      <Slam t={t} at={start + 0.15}>
        <rect x={150} y={360} width={760} height={150} rx={75} fill="#FF0033" stroke={C.ink} strokeWidth={10} />
        <rect x={210} y={395} width={110} height={80} rx={22} fill="#fff" />
        <path d="M 252 412 L 292 435 L 252 458 Z" fill="#FF0033" />
        <text x={600} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#fff" letterSpacing={3}>
          SUBSCRIBE
        </text>
        <text x={150} y={620} fontFamily={FONT} fontWeight={900} fontSize={44} fill={CREAM} letterSpacing={6}>
          EBO TEACHES MONEY · EP 4
        </text>
      </Slam>
    );
  }
  return null;
};

export const shotIndexAt = (f: number) => {
  const t = f / VFPS;
  let idx = 0;
  for (let i = 0; i < TIMES.length; i++) if (t >= TIMES[i].start) idx = i;
  return idx;
};

/** One frame of the episode (pure — also used by the .fla exporter). */
export const Ep04Frame: React.FC<{f: number; handDrawn?: boolean}> = ({f, handDrawn = true}) => {
  const t = f / VFPS;
  const i = shotIndexAt(f);
  const s = EP04_PLAN[i];
  const {start, length} = TIMES[i];
  const local = t - start;
  const host = HOST_SETS.includes(s.set);
  return (
    <StageSizeContext.Provider value={{w: EP04_W, h: EP04_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value={handDrawn}>
          <AbsoluteFill style={{background: '#000'}}>
            <VStage framing={shotCamera(t, start, length, s)} bg="#241B2F" blurBg={ep04Set(s.set)} overlay={<Overlay text={s.text} t={t} start={start} />}>
              {live(s.props, f, local)}
              {s.cast.map((c, k) => {
                const walking = c.cycle !== undefined;
                const x = walking ? c.x + local * cycleSpeed('ebo', c.cycle!) * (c.facing ?? 1) : c.x;
                const pose: Pose = host ? {...c.pose, headTilt: c.pose.headTilt + lipHeadNod(ENV, f)} : c.pose;
                return (
                  <RigCharacter
                    key={k}
                    who={c.who}
                    x={x}
                    y={c.y ?? (c.seat ? SEAT_Y : FLOOR_Y)}
                    facing={c.facing ?? 1}
                    t={f}
                    pose={pose}
                    cycle={c.cycle}
                    mouthFrame={host ? lipFrame(ENV, WORDS, f) : undefined}
                    noBlink={c.pose.eyes === 'closed'}
                  >
                    {live(c.hold, f, local)}
                  </RigCharacter>
                );
              })}
            </VStage>
            <TopCaption chunks={CHUNKS} tSec={t} />
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

/** layer='set' renders only the sets; see exportCtx.tsx. */
export const EboEp04: React.FC<{layer?: LayerMode; handDrawn?: boolean}> = ({layer = 'full', handDrawn = true}) => {
  const f = useCurrentFrame();
  return (
    <LayerModeContext.Provider value={layer}>
      <Ep04Frame f={f} handDrawn={handDrawn} />
      {layer === 'full' && <Html5Audio src={staticFile('ebo-ep04/voice.mp3')} />}
    </LayerModeContext.Provider>
  );
};
