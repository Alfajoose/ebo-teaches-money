import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {Slam, Still} from './exportCtx';
import {C} from '../theme';

/**
 * House rule 19, the "3rd Filter" format: the shared pieces (first used in Ep7 v3).
 * - Tracker: a row of badges at the top, one per move (icons, no numbers); each lights up when taught,
 *   the last stays a grey "?" until the payoff.
 * - Header: the line under the tracker (black, key word in red).
 * - BigBadge: a badge dropped big into the middle when it lights up.
 * - Glow: the yellow focus halo (one thing at a time, never decoration).
 * - In / Label: things that land on their word, and handwritten words.
 */
export const MARKER = 'EboMarker';
export const INK = C.ink;
export const RED = '#E5484D';

export const useMarkerFont = () => {
  // (the Animate export renders frames outside the player, where there's nothing to wait for)
  const [handle] = useState(() => (typeof document === 'undefined' ? null : delayRender('marker font')));
  useEffect(() => {
    if (handle === null) return;
    const f = new FontFace(MARKER, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`);
    f.load().then((ff) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};

/** A handwritten word. */
export const Label: React.FC<{x: number; y: number; text: string; red?: boolean; color?: string; rot?: number; size?: number}> = ({x, y, text, red, color, rot = 0, size = 84}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={color ?? (red ? RED : INK)} stroke="#fff" strokeWidth={size / 7} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  </g>
);

/** Something that lands at its time, at (x, y), at a fixed size `k` (static, never animated); it rocks once and settles. */
/** `from`: swoop in from the left, the right or the top (the Peanut-style entrance); default drops from above. */
export const In: React.FC<{t: number; at: number; x: number; y: number; k?: number; rot?: number; twist?: number; from?: 'left' | 'right' | 'top'; children: React.ReactNode}> = ({t, at: a, x, y, k = 1, rot = 0, twist = -4, from, children}) => {
  const u = t - a - 0.17;
  const wob = u > 0 ? 4 * Math.sin(u * 16) * Math.exp(-u * 6) : 0;
  return (
    <Slam t={t} at={a} dist={from === 'top' ? -900 : -70} dx={from === 'left' ? -1100 : from === 'right' ? 1100 : 0} twist={from === 'left' ? -18 : from === 'right' ? 18 : twist} spin={{deg: wob, cx: x, cy: y}}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>{children}</g>
    </Slam>
  );
};

/** The focus glow: a soft yellow halo behind what matters right now. */
export const Glow: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <defs>
      <radialGradient id={`glow-${x}-${y}-${r}`}>
        <stop offset="0" stopColor="#FFE45C" stopOpacity={0.85} />
        <stop offset="0.55" stopColor="#FFE45C" stopOpacity={0.35} />
        <stop offset="1" stopColor="#FFE45C" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#glow-${x}-${y}-${r})`} />
  </g>
);

export type Badge = {color: string; icon: React.ReactNode};
export const TRACK_Y = 120;
/** x of badge k of n in the tracker row. */
export const badgeX = (k: number, n: number) => 540 + (k - (n - 1) / 2) * 190;

/** The tracker: badges lit by time (slotAt[k] = when badge k is taught); the newest glows for a moment. */
export const Tracker: React.FC<{t: number; from: number; slotAt: number[]; badges: Badge[]}> = ({t, from, slotAt, badges}) => {
  if (t < from) return null;
  const lit = slotAt.filter((a) => t >= a).length;
  const n = badges.length;
  return (
    <Still>
      <g>
        {badges.map((b, k) => {
          const x = badgeX(k, n);
          const on = k < lit;
          const now = on && k === lit - 1 && t < slotAt[k] + 2.5;
          return (
            <g key={k}>
              {now && <Glow x={x} y={TRACK_Y} r={120} />}
              <circle cx={x} cy={TRACK_Y} r={66} fill={on ? b.color : '#CFC9BC'} stroke={INK} strokeWidth={7} />
              {on ? (
                <g transform={`translate(${x} ${TRACK_Y})`}>{b.icon}</g>
              ) : (
                <text x={x} y={TRACK_Y + 26} textAnchor="middle" fontFamily={MARKER} fontSize={76} fill="#fff">
                  ?
                </text>
              )}
            </g>
          );
        })}
      </g>
    </Still>
  );
};

/** A badge, big (draw it inside an In with k ≈ 3). */
export const BigBadge: React.FC<{b: Badge}> = ({b}) => (
  <g>
    <circle r={66} fill={b.color} stroke={INK} strokeWidth={7} />
    {b.icon}
  </g>
);

/** The line under the tracker: what this beat is about, the key word in red. */
export const Header: React.FC<{text: [string, string?]}> = ({text: [a, b]}) => (
  <Still>
    <text x={540} y={300} textAnchor="middle" fontFamily={MARKER} fontSize={70} fill={INK} stroke="#FFF4DB" strokeWidth={8} paintOrder="stroke">
      {a}
      {b && <tspan fill={RED}> {b}</tspan>}
    </text>
  </Still>
);

/** The camera swoop (rule 21): a fast zoom-out reveal at the top of the shot, or a slow push-in across it.
 * Video only: the Animate export takes every frame back out of the camera, so the .fla stays camera-free. */
export const swoopZoom = (kind: 'reveal' | 'push' | 'none', local: number, length: number) => {
  if (kind === 'reveal') {
    const u = Math.min(1, local / 0.5);
    return 1 + 0.16 * (1 - u) ** 3;
  }
  if (kind === 'push') return 1 + 0.07 * Math.min(1, local / Math.max(0.5, length));
  return 1;
};
/** The dim behind a title or badge: the scene fades back so the overlay reads. */
export const Dim: React.FC<{t: number; at: number; until?: number}> = ({t, at, until}) => {
  if (t < at || (until !== undefined && t > until)) return null;
  const o = Math.min(0.62, (t - at) * 4);
  return <rect x={-200} y={-200} width={1480} height={2320} fill="#FFF4DB" opacity={o} />;
};
