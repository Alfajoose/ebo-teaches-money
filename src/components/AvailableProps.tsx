import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Ep 11 (The Dangerous Side of Being Too Available). Each is a prop (prop.tsx): hand-drawn in the video,
 * its own vector symbol in the Animate export. Origins at the centre unless noted.
 */
const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const MARKER = 'EboMarker';

/** A phone ringing: the caller's name on screen, buzz lines either side. */
const BuzzPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; caller?: string; buzz?: boolean}> = ({x = 0, y = 0, rotate = 0, caller = 'MICA', buzz = true}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {buzz && <path d="M -150 -60 l -30 -20 M -150 0 l -40 0 M -150 60 l -30 20 M 150 -60 l 30 -20 M 150 0 l 40 0 M 150 60 l 30 20" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />}
    <rect x={-110} y={-200} width={220} height={400} rx={32} fill={C.ink} />
    <rect x={-94} y={-176} width={188} height={352} rx={16} fill="#2E7D5B" />
    <circle cx={0} cy={-70} r={46} fill="#BFE3F5" stroke="#fff" strokeWidth={5} />
    <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={caller.length > 6 ? 30 : 38} fill="#fff">
      {caller}
    </text>
    <circle cx={-46} cy={120} r={26} fill="#E5484D" />
    <circle cx={46} cy={120} r={26} fill="#7BC47F" />
  </g>
);

/** A phone with a message thread: an optional party photo, their message, and an optional blue reply. */
const ThreadPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; photo?: boolean; msg?: string[]; reply?: string[]}> = ({x = 0, y = 0, rotate = 0, photo = false, msg = [], reply}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-150} y={-280} width={300} height={560} rx={38} fill={C.ink} />
    <rect x={-132} y={-252} width={264} height={504} rx={18} fill="#F4F2EE" />
    {photo && (
      <g>
        <rect x={-110} y={-230} width={220} height={150} rx={12} fill="#6B4FA0" />
        {[[-70, -190, '#F2C230'], [-20, -150, '#E5484D'], [40, -200, '#7BC47F'], [80, -140, '#6BB7E8'], [-90, -120, '#F7B6CB'], [20, -110, '#F2C230']].map(([cx, cy, c], i) => (
          <circle key={i} cx={cx as number} cy={cy as number} r={9} fill={c as string} />
        ))}
        <path d="M -60 -100 l 20 -40 l 20 40 M 20 -100 l 20 -40 l 20 40" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
        <text x={0} y={-212} textAnchor="middle" fontFamily={MARKER} fontSize={26} fill="#fff">PARTY!</text>
      </g>
    )}
    {msg.length > 0 && (
      <g transform={`translate(-114 ${photo ? -64 : -200})`}>
        <rect x={0} y={0} width={210} height={28 + msg.length * 30} rx={16} fill="#E2E3E8" />
        {msg.map((l, i) => (
          <text key={i} x={14} y={36 + i * 30} fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.ink}>
            {l}
          </text>
        ))}
      </g>
    )}
    {reply && (
      <g transform="translate(-86 70)">
        <rect x={0} y={0} width={200} height={28 + reply.length * 30} rx={16} fill="#2F80ED" />
        {reply.map((l, i) => (
          <text key={i} x={14} y={36 + i * 30} fontFamily={FONT} fontWeight={700} fontSize={22} fill="#fff">
            {l}
          </text>
        ))}
      </g>
    )}
  </g>
);

/** A sticky note with a scrawled word, slightly turned. */
const StickyDrawing: React.FC<{x?: number; y?: number; rotate?: number; text?: string; color?: string}> = ({x = 0, y = 0, rotate = 0, text = '', color = '#FFE45C'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-60} y={-60} width={120} height={120} fill={color} stroke={C.ink} strokeWidth={5} />
    <text y={12} textAnchor="middle" fontFamily={MARKER} fontSize={text.length > 7 ? 22 : 30} fill={C.ink}>
      {text}
    </text>
  </g>
);

/** A wall calendar, a week of boxes filled with other people's names; his own day (`mine`) left empty. */
const WeekCalendarDrawing: React.FC<{x?: number; y?: number; names?: string[]; mine?: number; filled?: boolean}> = ({x = 0, y = 0, names = ['MICA', 'CHRISTY', 'BOSS', 'MICA', 'CHRISTY', 'BOSS', 'EBO'], mine = 6, filled = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-330} y={-300} width={660} height={600} rx={16} fill="#fff" {...S} />
    <rect x={-330} y={-300} width={660} height={90} rx={16} fill="#E5484D" {...S} />
    <text y={-238} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">MY WEEK</text>
    {names.map((n, i) => {
      const cx = -220 + (i % 3) * 220;
      const cy = -130 + Math.floor(i / 3) * 140;
      const own = i === mine;
      return (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <rect x={-100} y={-55} width={200} height={110} rx={10} fill={own ? '#FFF6DA' : '#F2F0EA'} stroke={C.ink} strokeWidth={5} strokeDasharray={own ? '14 10' : undefined} />
          {(!own || filled) && (
            <text y={14} textAnchor="middle" fontFamily={MARKER} fontSize={36} fill={own ? '#2E7D5B' : C.ink}>
              {n}
            </text>
          )}
        </g>
      );
    })}
  </g>
);

/** Ebo's sign, EBO'S SNEAKER CLEANING, painted by `done` (0 … 1); dusty when `dust`. Origin at the bottom of its post. */
const SneakerSignDrawing: React.FC<{x?: number; y?: number; done?: number; dust?: boolean}> = ({x = 0, y = 0, done = 0.4, dust = false}) => {
  const words = ["EBO'S", 'SNEAKER', 'CLEANING'];
  const shown = done >= 1 ? 3 : done >= 0.66 ? 2 : done >= 0.33 ? 1 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-240} width={28} height={240} fill="#8A5A2B" {...S} strokeWidth={5} />
      <rect x={-250} y={-520} width={500} height={300} rx={14} fill={done >= 1 ? '#FFF6DA' : '#EDE6D6'} {...S} />
      {words.map((w, i) => (
        <text key={w} y={-430 + i * 86} textAnchor="middle" fontFamily={MARKER} fontSize={70} fill={i < shown ? (i === 0 ? '#E5484D' : C.ink) : 'none'} stroke={i < shown ? 'none' : '#B5A88C'} strokeWidth={2} strokeDasharray="6 8">
          {w}
        </text>
      ))}
      {dust && (
        <g opacity={0.6}>
          <path d="M -240 -500 q 60 30 120 0 q 60 -30 120 0 M 20 -260 q 60 -30 200 0" stroke="#9A9AA6" strokeWidth={6} fill="none" />
          <path d="M 200 -520 L 260 -580 M 230 -520 L 270 -560" stroke="#9A9AA6" strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/** A pair of sneakers, side on. */
const SneakersDrawing: React.FC<{x?: number; y?: number; shine?: boolean}> = ({x = 0, y = 0, shine = false}) => (
  <g transform={`translate(${x} ${y})`}>
    {[-70, 60].map((dx, i) => (
      <g key={dx} transform={`translate(${dx} ${i * 10})`}>
        <path d="M -90 10 L -90 -50 Q -70 -76 -36 -66 L 10 -34 Q 70 -34 96 -6 L 100 10 Z" fill="#fff" {...S} />
        <path d="M -94 10 L 104 10 L 104 34 L -94 34 Z" fill="#E5484D" {...S} />
        <path d="M -50 -50 l 20 20 M -30 -56 l 20 20" stroke="#2F80ED" strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
    {shine && <path d="M 120 -90 l 0 -40 M 100 -110 l 40 0 M -150 -70 l 0 -30 M -165 -85 l 30 0" stroke="#F2C230" strokeWidth={7} strokeLinecap="round" />}
  </g>
);

/** A wifi router with a red cross: no internet. */
const RouterDrawing: React.FC<{x?: number; y?: number; dead?: boolean}> = ({x = 0, y = 0, dead = true}) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={-60} y1={-40} x2={-80} y2={-150} {...S} strokeWidth={10} />
    <line x1={60} y1={-40} x2={80} y2={-150} {...S} strokeWidth={10} />
    <rect x={-120} y={-50} width={240} height={90} rx={18} fill="#3A3A44" {...S} />
    {[-60, -20, 20, 60].map((cx, i) => (
      <circle key={cx} cx={cx} cy={-4} r={9} fill={dead && i > 1 ? '#E5484D' : '#7BC47F'} />
    ))}
    {dead && <path d="M 110 -200 l 70 70 M 180 -200 l -70 70" stroke="#E5484D" strokeWidth={16} strokeLinecap="round" />}
  </g>
);

/** A paintbrush (hold it). */
const BrushDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-10} y={-120} width={20} height={130} rx={8} fill="#B27A47" {...S} strokeWidth={5} />
    <rect x={-18} y={-150} width={36} height={36} fill="#9AA1AC" {...S} strokeWidth={5} />
    <path d="M -18 -150 L -14 -200 Q 0 -214 14 -200 L 18 -150 Z" fill="#E5484D" {...S} strokeWidth={5} />
  </g>
);

/** A little notebook, written in. */
const NotebookDrawing: React.FC<{x?: number; y?: number; rotate?: number; text?: string}> = ({x = 0, y = 0, rotate = 0, text = 'SAT 2pm'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-110} y={-140} width={220} height={280} rx={10} fill="#FFF6DA" {...S} />
    {[-80, -40, 0, 40, 80].map((ly) => (
      <line key={ly} x1={-90} x2={90} y1={ly} y2={ly} stroke="#B5D3EE" strokeWidth={4} />
    ))}
    <text y={-46} textAnchor="middle" fontFamily={MARKER} fontSize={40} fill={C.ink}>
      {text}
    </text>
  </g>
);

/** A cricket (the silence). */
const CricketDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -40 10 l -40 30 M -10 14 l -10 40 M 20 14 l 30 40 M 40 0 l 60 -60 M 46 -6 l 70 -20" stroke="#2E5B2A" strokeWidth={6} strokeLinecap="round" fill="none" />
    <ellipse cx={0} cy={0} rx={56} ry={22} fill="#5E9B4E" {...S} strokeWidth={5} />
    <circle cx={50} cy={-6} r={16} fill="#5E9B4E" {...S} strokeWidth={5} />
    <circle cx={56} cy={-10} r={4} fill={C.ink} />
  </g>
);

const prop = <P extends object>(name: string, Drawing: React.FC<P>): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <Prop name={name}>
      <Drawing {...props} />
    </Prop>
  );
  return Wrapped;
};

export const BuzzPhone = prop('BuzzPhone', BuzzPhoneDrawing);
export const ThreadPhone = prop('ThreadPhone', ThreadPhoneDrawing);
export const Sticky = prop('Sticky', StickyDrawing);
export const WeekCalendar = prop('WeekCalendar', WeekCalendarDrawing);
export const SneakerSign = prop('SneakerSign', SneakerSignDrawing);
export const Sneakers = prop('Sneakers', SneakersDrawing);
export const Router = prop('Router', RouterDrawing);
export const Brush = prop('Brush', BrushDrawing);
export const Notebook = prop('Notebook', NotebookDrawing);
export const Cricket = prop('Cricket', CricketDrawing);
