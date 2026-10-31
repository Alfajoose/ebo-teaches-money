import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NoScaleContext} from '../noScale';
import {RigCharacter} from '../cast/RigCharacter';
import {FLOOR_Y} from '../backgrounds/Backgrounds';
import {C, FONT} from '../theme';
import {Framing, VStage} from './kit';
import {StageSizeContext} from './exportCtx';
import {HandDrawnContext} from '../handDrawn';
import {EP03_PLAN, PlanShot, planSet, SEAT_Y} from './ep03plan';

/**
 * Storyboard for Episode 3: frame n is the panel for shot n of the plan (ep03plan.tsx).
 * The panel frames the whole move; a dashed white box is where the camera starts, a red box
 * where it ends, and an arrow shows a pan / whip / follow. Static shots are just the frame.
 */

const W = 1920;
const H = 1080;

/** The framing that shows both the start and end of a move (with a little margin). */
export const panelFraming = (s: PlanShot): Framing => {
  if (!s.to) return s.from;
  const rect = (f: Framing) => [f.cx - W / 2 / f.zoom, f.cy - H / 2 / f.zoom, f.cx + W / 2 / f.zoom, f.cy + H / 2 / f.zoom];
  const a = rect(s.from);
  const b = rect(s.to);
  const x0 = Math.min(a[0], b[0]);
  const y0 = Math.min(a[1], b[1]);
  const x1 = Math.max(a[2], b[2]);
  const y1 = Math.max(a[3], b[3]);
  const zoom = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.92;
  return {zoom, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2};
};

/** Where framing `f` sits inside panel framing `p`, in screen pixels. */
const boxIn = (p: Framing, f: Framing) => {
  const w = (W * p.zoom) / f.zoom;
  const h = (H * p.zoom) / f.zoom;
  const cx = W / 2 + (f.cx - p.cx) * p.zoom;
  const cy = H / 2 + (f.cy - p.cy) * p.zoom;
  return {x: cx - w / 2, y: cy - h / 2, w, h, cx, cy};
};

/** One storyboard panel (shared by every episode's board). */
export const Panel: React.FC<{s: PlanShot; n: number; setNode: React.ReactNode}> = ({s, n, setNode}) => {
  const p = panelFraming(s);
  const from = boxIn(p, s.from);
  const to = s.to ? boxIn(p, s.to) : null;
  const pan = to && Math.hypot(to.cx - from.cx, to.cy - from.cy) > 40;
  return (
    <VStage
      framing={p}
      bg="#241B2F"
      blurBg={setNode}
      overlay={
        <g fontFamily={FONT} fontWeight={900}>
          {to && (
            <g>
              <rect x={from.x} y={from.y} width={from.w} height={from.h} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="28 18" />
              <rect x={to.x} y={to.y} width={to.w} height={to.h} fill="none" stroke="#FF3B30" strokeWidth={10} />
              {pan && (
                <g stroke="#FF3B30" strokeWidth={12} fill="#FF3B30" strokeLinecap="round">
                  <line x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy} />
                  <circle cx={to.cx} cy={to.cy} r={18} />
                </g>
              )}
            </g>
          )}
          <rect x={30} y={30} width={150} height={100} rx={18} fill={C.ink} />
          <text x={105} y={103} textAnchor="middle" fontSize={68} fill="#fff">
            {n}
          </text>
          <rect x={196} y={30} width={Math.min(1690, 28 * (s.size.length + s.move.length + 3) + 40)} height={100} rx={18} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <text x={226} y={98} fontSize={50} fill={C.ink}>
            {s.size} · {s.move}
          </text>
          {s.text && (
            <g>
              <rect x={30} y={H - 130} width={W - 60} height={100} rx={18} fill={C.yellow} stroke={C.ink} strokeWidth={6} />
              <text x={60} y={H - 62} fontSize={42} fill={C.ink}>
                TEXT: {s.text}
              </text>
            </g>
          )}
        </g>
      }
    >
      {s.props}
      {s.cast.map((c, i) => (
        <RigCharacter key={i} who={c.who} x={c.x} y={c.y ?? (c.seat ? SEAT_Y : FLOOR_Y)} facing={c.facing ?? 1} pose={c.pose} t={0} cycle={c.cycle} noBlink>
          {c.hold}
        </RigCharacter>
      ))}
    </VStage>
  );
};

export const EP03_BOARD_PANELS = EP03_PLAN.length;

export const Ep03Storyboard: React.FC = () => {
  const n = useCurrentFrame();
  const s = EP03_PLAN[Math.min(n, EP03_PLAN.length - 1)];
  return (
    <StageSizeContext.Provider value={{w: W, h: H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#000'}}>
            <Panel s={s} n={n + 1} setNode={planSet(s.set)} />
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};
