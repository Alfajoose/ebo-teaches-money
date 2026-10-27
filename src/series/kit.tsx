import React from 'react';
import {AbsoluteFill, Easing, interpolate, random} from 'remotion';
import {C, FONT} from '../theme';
import {mixPose, Pose} from '../components/Character';
import {renderToStaticMarkup} from 'react-dom/server';
import {CameraContext, LayerModeContext, hash, mmul, T, S, Slam, useCapture, useLayerMode} from './exportCtx';
import {HandDrawnContext, HandDrawnDefs} from '../handDrawn';
import {NoScaleContext, useNoScale} from '../noScale';

/**
 * "Ebo Teaches Money" — vertical shorts kit.
 * Style: talk-to-camera, hard cuts between wide / medium / close-up framings,
 * snappy held poses, top caption pill, slammed title text. House rule: nothing
 * animates scale — framing changes only on cuts; things move and rotate.
 */

export const VW = 1080;
export const VH = 1920;
export const VFPS = 30;

// ───────────────────────── voice timing ─────────────────────────

export type Word = {w: string; s: number; e: number};
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

/** Seconds where the n-th occurrence (1-based) of `phrase` starts. */
export const makeAt = (words: Word[]) => (phrase: string, n = 1): number => {
  const parts = phrase.split(/\s+/).map(clean);
  let seen = 0;
  for (let i = 0; i <= words.length - parts.length; i++) {
    if (parts.every((p, k) => clean(words[i + k].w) === p)) {
      seen++;
      if (seen === n) return words[i].s;
    }
  }
  throw new Error(`phrase not in voiceover: "${phrase}" (#${n})`);
};

// ───────────────────────── stage + camera (cuts only) ─────────────────────────

export type Framing = {zoom: number; cx: number; cy: number};
export const WIDE = (cx: number, cy = 660): Framing => ({zoom: 1.6, cx, cy});
export const MEDIUM = (cx: number, cy = 640): Framing => ({zoom: 2.6, cx, cy});
export const CLOSE = (cx: number, cy = 600): Framing => ({zoom: 3.7, cx, cy});

export const VStage: React.FC<{
  framing: Framing;
  shakeX?: number;
  shakeY?: number;
  bg?: string;
  blurBg?: React.ReactNode; // background art, softly blurred for depth
  screenBg?: React.ReactNode; // full-frame background in screen space (scribble / red burst)
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({framing, shakeX = 0, shakeY = 0, bg = '#3B3550', blurBg, screenBg, children, overlay}) => {
  const {zoom, cx, cy} = framing;
  const cam = `translate(${VW / 2 + shakeX} ${VH / 2 + shakeY}) scale(${zoom}) translate(${-cx} ${-cy})`;
  const camM = mmul(T(VW / 2 + shakeX, VH / 2 + shakeY), mmul(S(zoom, zoom), T(-cx, -cy)));
  const mode = useLayerMode();
  const cap = useCapture();
  const noScale = useNoScale();
  const scene = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
      <defs>
        <HandDrawnDefs />
        <filter id="bgblur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={2.2 / Math.max(1, zoom / 2)} />
        </filter>
        <radialGradient id="vvig" cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <rect width={VW} height={VH} fill={bg} />
      {screenBg}
      {blurBg && (
        <g transform={cam} filter="url(#bgblur)">
          {blurBg}
        </g>
      )}
      <g transform={cam}>{children}</g>
      <rect width={VW} height={VH} fill="url(#vvig)" />
      {mode === 'full' ? overlay : null}
    </svg>
  );
  if (cap && mode === 'full') {
    // the background for the Animate export: this frame drawn as 'set' only (no props,
    // characters or graphics), as SVG — it becomes a vector symbol on the Background layer
    const svg = renderToStaticMarkup(
      <LayerModeContext.Provider value="set">
        <NoScaleContext.Provider value={noScale}>
          <HandDrawnContext.Provider value={false}>{scene}</HandDrawnContext.Provider>
        </NoScaleContext.Provider>
      </LayerModeContext.Provider>,
    );
    cap.background = {key: hash(svg), svg};
  }
  return (
    <CameraContext.Provider value={camM}>
      <AbsoluteFill style={{backgroundColor: bg}}>{scene}</AbsoluteFill>
    </CameraContext.Provider>
  );
};

// ───────────────────────── snappy pose track ─────────────────────────

/** Hold poses; each change snaps in 3 frames with a little overshoot. */
export const snapPose = (tSec: number, keys: [number, Pose][]): Pose => {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, p] = keys[i];
    if (tSec >= at) {
      const u = interpolate((tSec - at) * VFPS, [0, 3], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2.4))});
      cur = mixPose(cur, p, u);
    }
  }
  return cur;
};

/** Pick the latest value whose key time has passed. */
export const stepAt = <T,>(tSec: number, keys: [number, T][]): T => {
  let v = keys[0][1];
  for (const [at, x] of keys) if (tSec >= at) v = x;
  return v;
};

// ───────────────────────── lip sync ─────────────────────────

/**
 * Mouth frame for a 4-shape mouth (0 rest, 1 wide, 2 mid, 3 O) from the voice
 * loudness envelope + the word being spoken. Held on twos for a snappy feel.
 */
export const lipFrame = (env: number[], words: Word[], frame: number): number => {
  const f2 = frame - (frame % 2);
  const e = env[f2] ?? 0;
  if (e < 0.1) return 0;
  const t = f2 / VFPS;
  const word = words.find((w) => t >= w.s && t <= w.e + 0.04);
  const roundy = word ? /[ouw]/i.test(word.w.replace(/[^a-z]/gi, '').slice(0, 4)) : false;
  if (roundy && e > 0.25 && (f2 / 2) % 3 !== 2) return 3;
  return e > 0.5 ? 1 : 2;
};

export const lipHeadNod = (env: number[], frame: number) => ((env[frame] ?? 0) - 0.3) * 4;

// ───────────────────────── captions (top pill) ─────────────────────────

type Chunk = {text: string; s: number; e: number};
export const chunkWords = (words: Word[], maxWords = 3, maxChars = 16): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({text: cur.map((w) => w.w).join(' '), s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  for (const w of words) {
    const text = [...cur, w].map((x) => x.w).join(' ');
    if (cur.length && (cur.length >= maxWords || text.length > maxChars)) flush();
    cur.push(w);
    if (/[.,?!:;]$/.test(w.w) || w.w.endsWith('...')) flush();
  }
  flush();
  return out;
};

export const TopCaption: React.FC<{chunks: Chunk[]; tSec: number}> = ({chunks, tSec}) => {
  const cap = useCapture();
  const mode = useLayerMode();
  const c = chunks.find((k, i) => tSec >= k.s - 0.03 && tSec < (chunks[i + 1]?.s ?? k.e + 0.6) - 0.03);
  if (!c || tSec > c.e + 0.6 || mode !== 'full') return null;
  if (cap) cap.caption = c.text.replace(/\.\.\.$/, '…');
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 54,
          color: '#fff',
          background: 'rgba(12,12,14,0.92)',
          borderRadius: 18,
          padding: '10px 26px 12px',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {c.text.replace(/\.\.\.$/, '…')}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── big outlined text ─────────────────────────

export const BigText: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  fill?: string;
  stroke?: string;
  rotate?: number;
  anchor?: 'start' | 'middle' | 'end';
}> = ({text, x, y, size = 120, fill = '#fff', stroke = C.ink, rotate = 0, anchor = 'middle'}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={FONT}
    fontWeight={900}
    fontSize={size}
    fill={fill}
    stroke={stroke}
    strokeWidth={size * 0.16}
    strokeLinejoin="round"
    paintOrder="stroke"
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    letterSpacing={size * 0.01}
  >
    {text}
  </text>
);

/** Slam in from above with a twist (no scale): returns transform + opacity for a group. */
export const slam = (tSec: number, at: number, dist = -260, twist = -14) => {
  const u = interpolate((tSec - at) * VFPS, [0, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2.2))});
  return {transform: `translate(0 ${(1 - u) * dist}) rotate(${(1 - u) * twist} ${VW / 2} 0)`, opacity: tSec < at ? 0 : 1};
};

// ───────────────────────── lesson card ─────────────────────────

export const LessonCard: React.FC<{tSec: number; at: number; n: number; title: string; y?: number}> = ({tSec, at, n, title, y = 400}) => {
  if (tSec < at) return null;
  return (
    <g>
      <Slam t={tSec} at={at}>
        <rect x={VW / 2 - 190} y={y - 70} width={380} height={96} rx={48} fill={C.yellow} stroke={C.ink} strokeWidth={10} />
        <text x={VW / 2} y={y - 4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={C.ink} letterSpacing={4}>
          {`LESSON ${n}`}
        </text>
      </Slam>
      <Slam t={tSec} at={at + 0.15} dist={-300} twist={10}>
        <BigText text={title} x={VW / 2} y={y + 140} size={title.length > 12 ? 92 : 120} rotate={-3} />
      </Slam>
    </g>
  );
};

// ───────────────────────── special backgrounds ─────────────────────────

/** Black background with jittering white scribbles — the "shock" shot. */
export const Scribble: React.FC<{frame: number}> = ({frame}) => {
  const f = Math.floor(frame / 2);
  return (
    <g>
      <rect width={VW} height={VH} fill="#0E0E10" />
      {Array.from({length: 46}).map((_, i) => {
        const x = random(`sx${i}-${f}`) * VW;
        const y = random(`sy${i}-${f}`) * VH;
        const a = random(`sa${i}`) * Math.PI;
        const l = 160 + random(`sl${i}-${f}`) * 260;
        const pts = Array.from({length: 7})
          .map((__, k) => {
            const px = x + Math.cos(a) * (k / 6 - 0.5) * l + (random(`sj${i}-${k}-${f}`) - 0.5) * 40;
            const py = y + Math.sin(a) * (k / 6 - 0.5) * l + (k % 2 ? 22 : -22);
            return `${k ? 'L' : 'M'}${px.toFixed(0)} ${py.toFixed(0)}`;
          })
          .join(' ');
        return <path key={i} d={pts} stroke="#E9E6DF" strokeWidth={4} fill="none" opacity={0.55} strokeLinejoin="round" />;
      })}
    </g>
  );
};

/** Hot red background with speed streaks — the punchline shot. */
export const RedBurst: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect width={VW} height={VH} fill="#D93A3A" />
    {Array.from({length: 22}).map((_, i) => {
      const a = (i / 22) * Math.PI * 2 + (frame % 4) * 0.02;
      return (
        <path
          key={i}
          d={`M ${VW / 2} ${VH * 0.42} L ${VW / 2 + Math.cos(a) * 2000} ${VH * 0.42 + Math.sin(a) * 2000} L ${VW / 2 + Math.cos(a + 0.09) * 2000} ${VH * 0.42 + Math.sin(a + 0.09) * 2000} Z`}
          fill="#F05A4F"
          opacity={0.6}
        />
      );
    })}
  </g>
);
