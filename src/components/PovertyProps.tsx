import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 9 (Why Some People Never Escape Poverty). Each is a prop (prop.tsx): hand-drawn in the video,
 * its own vector symbol in the Animate export. Origins at the centre.
 */
const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const MARKER = 'EboMarker';

/** A padlock: locked, or popped open. */
const PadlockDrawing: React.FC<{x?: number; y?: number; rotate?: number; open?: boolean; color?: string; face?: 'jar' | 'fees' | 'q'}> = ({x = 0, y = 0, rotate = 0, open = false, color = '#B8B2A6', face}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d={open ? 'M -50 -20 L -50 -90 Q -50 -140 0 -140 Q 50 -140 50 -90 L 50 -70' : 'M -50 -20 L -50 -80 Q -50 -130 0 -130 Q 50 -130 50 -80 L 50 -20'} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" transform={open ? 'translate(0 -30)' : undefined} />
    <rect x={-80} y={-30} width={160} height={130} rx={18} fill={color} {...S} />
    {!face && <circle cx={0} cy={25} r={16} fill={C.ink} />}
    {!face && <rect x={-6} y={30} width={12} height={36} fill={C.ink} />}
    {face === 'jar' && (
      <g>
        <rect x={-30} y={-12} width={60} height={14} rx={4} fill="#B88A10" stroke={C.ink} strokeWidth={4} />
        <rect x={-36} y={2} width={72} height={78} rx={12} fill="#E7F3FB" stroke={C.ink} strokeWidth={5} />
      </g>
    )}
    {face === 'fees' && (
      <text y={56} textAnchor="middle" fontFamily={MARKER} fontSize={58} fill="#E5484D">
        FEES
      </text>
    )}
    {face === 'q' && (
      <text y={72} textAnchor="middle" fontFamily={MARKER} fontSize={104} fill={C.ink}>
        ?
      </text>
    )}
  </g>
);

/** A flat tire. */
const FlatTireDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -130 60 Q -140 -110 0 -120 Q 140 -110 130 60 Q 0 90 -130 60 Z" fill="#2B2B2B" {...S} />
    <ellipse cx={0} cy={-20} rx={60} ry={56} fill="#9AA1AC" {...S} strokeWidth={6} />
    <circle cx={0} cy={-20} r={16} fill="#6B7280" />
    <path d="M 70 70 Q 110 50 150 70" fill="none" stroke="#9AA1AC" strokeWidth={6} strokeDasharray="6 10" />
  </g>
);

/** A doctor's bill: a clipboard with a red cross and an amount. */
const DoctorBillDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-110} y={-140} width={220} height={280} rx={10} fill="#fff" {...S} />
    <rect x={-40} y={-160} width={80} height={36} rx={8} fill="#B8B2A6" {...S} strokeWidth={5} />
    <path d="M -16 -90 L 16 -90 L 16 -66 L 40 -66 L 40 -34 L 16 -34 L 16 -10 L -16 -10 L -16 -34 L -40 -34 L -40 -66 L -16 -66 Z" fill="#E5484D" />
    {[0, 1].map((i) => (
      <line key={i} x1={-80} x2={60 - i * 30} y1={20 + i * 28} y2={20 + i * 28} stroke="#B5A88C" strokeWidth={7} strokeLinecap="round" />
    ))}
    <text y={116} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#E5484D">
      $200
    </text>
  </g>
);

/** A credit card, with the amount on it growing (`amount`). */
const CreditCardDrawing: React.FC<{x?: number; y?: number; rotate?: number; amount?: string}> = ({x = 0, y = 0, rotate = 0, amount}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-170} y={-105} width={340} height={210} rx={22} fill="#2F4A8A" {...S} />
    <rect x={-170} y={-62} width={340} height={34} fill="#1D2B55" />
    <rect x={-130} y={0} width={56} height={40} rx={6} fill="#E2C25A" stroke={C.ink} strokeWidth={4} />
    {amount && (
      <text x={120} y={74} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">
        {amount}
      </text>
    )}
  </g>
);

/** A FEE stamp mark: a red rubber-stamp impression with a word (OVERDRAFT FEE, LATE FEE). */
const FeeStampDrawing: React.FC<{x?: number; y?: number; rotate?: number; text?: string}> = ({x = 0, y = 0, rotate = 0, text = 'FEE'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-190} y={-60} width={380} height={120} rx={12} fill="none" stroke="#E5484D" strokeWidth={12} />
    <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={text.length > 9 ? 44 : 58} fill="#E5484D">
      {text}
    </text>
  </g>
);

/** A cheap shoe, sole flapping off. */
const CheapShoeDrawing: React.FC<{x?: number; y?: number; rotate?: number; worn?: boolean}> = ({x = 0, y = 0, rotate = 0, worn = true}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -120 20 L -120 -60 Q -100 -90 -60 -80 L 0 -40 Q 80 -40 120 -10 L 130 20 Z" fill="#E8E2D4" {...S} />
    <path d={worn ? 'M -120 20 L 130 20 L 120 60 Q 0 70 -100 46 Z' : 'M -120 20 L 130 20 L 130 40 L -120 40 Z'} fill="#C7BBA3" {...S} transform={worn ? 'rotate(8 -120 20)' : undefined} />
    {[-60, -30, 0].map((cx) => (
      <circle key={cx} cx={cx} cy={-44} r={6} fill={C.ink} />
    ))}
  </g>
);

/** A lottery ticket: numbers, a big NOT A WINNER stamp when `lost`. */
const LotteryTicketDrawing: React.FC<{x?: number; y?: number; rotate?: number; lost?: boolean}> = ({x = 0, y = 0, rotate = 0, lost = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-170} y={-100} width={340} height={200} rx={10} fill="#FFF3B0" {...S} />
    <text y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#C58A00">
      LUCKY 7s
    </text>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <circle cx={-128 + i * 64} cy={20} r={26} fill="#fff" stroke={C.ink} strokeWidth={4} />
        <text x={-128 + i * 64} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink}>
          {[7, 14, 23, 31, 42][i]}
        </text>
      </g>
    ))}
    {lost && (
      <g transform="rotate(-12)">
        <rect x={-150} y={40} width={300} height={56} rx={8} fill="none" stroke="#E5484D" strokeWidth={8} />
        <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill="#E5484D">
          NOT A WINNER
        </text>
      </g>
    )}
  </g>
);

/** A ladder, rung by rung (`rungs` lit so far). */
const LadderDrawing: React.FC<{x?: number; y?: number; rungs?: number; total?: number}> = ({x = 0, y = 0, rungs = 0, total = 6}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-total * 80} width={22} height={total * 80 + 40} fill="#B27A47" {...S} strokeWidth={5} />
    <rect x={88} y={-total * 80} width={22} height={total * 80 + 40} fill="#B27A47" {...S} strokeWidth={5} />
    {Array.from({length: total}, (_, i) => (
      <rect key={i} x={-90} y={-i * 80 - 10} width={180} height={18} fill={i < rungs ? '#F2C230' : '#C99555'} stroke={C.ink} strokeWidth={4} />
    ))}
  </g>
);

/** A coin with $10 on it. */
const TenCoinDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <circle r={90} fill="#F2C230" {...S} />
    <circle r={68} fill="none" stroke="#B88A10" strokeWidth={6} />
    <text y={22} textAnchor="middle" fontFamily={MARKER} fontSize={64} fill="#8C6A08">
      $10
    </text>
  </g>
);

// ───────── v2 (the user's reference board) ─────────

/** A stack of coins; `up`: a red arrow shooting up beside it (it costs MORE). */
const CoinStackDrawing: React.FC<{x?: number; y?: number; up?: boolean}> = ({x = 0, y = 0, up = false}) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${i % 2 ? 6 : -6} ${90 - i * 44})`}>
        <ellipse cx={0} cy={0} rx={96} ry={30} fill="#F2C230" {...S} />
        <ellipse cx={0} cy={-8} rx={96} ry={30} fill="#FFD95A" {...S} strokeWidth={5} />
      </g>
    ))}
    {up && <path d="M 150 110 L 240 -110 M 170 -90 L 244 -118 L 262 -40" fill="none" stroke="#E5484D" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />}
  </g>
);

/** A little round-headed figure (the people in the tiny stories): standing, or just head and arms (climbing out). */
const LittleGuyDrawing: React.FC<{x?: number; y?: number; rotate?: number; climbing?: boolean; sad?: boolean; color?: string}> = ({x = 0, y = 0, rotate = 0, climbing = false, sad = false, color = '#F4EFE6'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {!climbing && <path d="M -44 -30 Q -50 110 -40 130 L 40 130 Q 50 110 44 -30 Z" fill={color} {...S} />}
    {climbing && <path d="M -60 20 L -110 -60 M 60 20 L 104 -74" fill="none" stroke={C.ink} strokeWidth={20} strokeLinecap="round" />}
    {climbing && <path d="M -50 -40 Q -56 60 -50 90 L 50 90 Q 56 60 50 -40 Z" fill={color} {...S} />}
    <circle cx={0} cy={-80} r={62} fill={color} {...S} />
    <circle cx={-22} cy={-88} r={8} fill={C.ink} />
    <circle cx={22} cy={-88} r={8} fill={C.ink} />
    <path d={sad ? 'M -20 -50 Q 0 -64 20 -50' : 'M -20 -58 Q 0 -42 20 -58'} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    {climbing && <path d="M 70 -150 q 10 -18 0 -30 M -76 -146 q -12 -16 -2 -30" fill="none" stroke="#6BB7E8" strokeWidth={8} strokeLinecap="round" />}
  </g>
);

/** The ground with a hole in it (origin: the middle of the hole's mouth). */
const HoleDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -620 0 L -210 0 Q -230 330 0 340 Q 230 330 210 0 L 620 0 L 620 960 L -620 960 Z" fill="#C9A77C" {...S} />
    <path d="M -210 0 Q -230 330 0 340 Q 230 330 210 0" fill="#7A5A3A" {...S} />
  </g>
);

/** A shovel; `dirt`: a clod flying off it. */
const ShovelDrawing: React.FC<{x?: number; y?: number; rotate?: number; dirt?: boolean}> = ({x = 0, y = 0, rotate = 0, dirt = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <line x1={0} y1={-150} x2={0} y2={70} stroke="#8A5A2B" strokeWidth={16} strokeLinecap="round" />
    <path d="M -46 60 L 46 60 L 40 130 Q 0 176 -40 130 Z" fill="#9AA1AC" {...S} strokeWidth={6} />
    {dirt && <path d="M -30 170 q 30 -30 60 0 q 10 30 -30 34 q -40 0 -30 -34 Z" fill="#7A5A3A" {...S} strokeWidth={5} />}
  </g>
);

/** A calendar page with a title and a handwritten note (TODAY / emergency · NEXT PAYCHECK / paying for it). */
const CalNoteDrawing: React.FC<{x?: number; y?: number; rotate?: number; title?: string; title2?: string; note?: string}> = ({x = 0, y = 0, rotate = 0, title = 'TODAY', title2, note}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-170} y={-150} width={340} height={300} rx={18} fill="#fff" {...S} />
    <rect x={-170} y={-150} width={340} height={50} rx={18} fill="#E5484D" {...S} />
    {[-110, -40, 40, 110].map((cx) => (
      <circle key={cx} cx={cx} cy={-150} r={12} fill="#fff" {...S} strokeWidth={4} />
    ))}
    <text y={title2 ? -30 : 0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={title2 ? 48 : title.length > 6 ? 50 : 64} fill={C.ink}>
      {title}
    </text>
    {title2 && (
      <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.ink}>
        {title2}
      </text>
    )}
    {note && (
      <text y={100} textAnchor="middle" fontFamily={MARKER} fontSize={40} fill="#E5484D">
        {note}
      </text>
    )}
  </g>
);

/** A fee slip: a sheet with the fee's name and the amount in red; `crossed`: struck out. */
const FeeSlipDrawing: React.FC<{x?: number; y?: number; rotate?: number; top?: string; bottom?: string; amount?: string; crossed?: boolean}> = ({x = 0, y = 0, rotate = 0, top = 'LATE', bottom = 'FEE', amount, crossed = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-150} y={-170} width={300} height={340} rx={10} fill="#fff" {...S} />
    <text y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={top.length > 6 ? 46 : 62} fill={C.ink}>
      {top}
    </text>
    <text y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={C.ink}>
      {bottom}
    </text>
    {amount && (
      <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#E5484D">
        {amount}
      </text>
    )}
    {crossed && <path d="M -90 30 L 90 150 M 90 30 L -90 150" fill="none" stroke="#E5484D" strokeWidth={22} strokeLinecap="round" />}
  </g>
);

/** A well-made shoe: thick sole, laces, a shine. */
const GoodShoeDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -120 20 L -120 -70 Q -100 -100 -60 -86 L 0 -44 Q 86 -44 124 -8 L 132 20 Z" fill="#8A5A2B" {...S} />
    <path d="M -126 20 L 138 20 L 138 56 L -126 56 Z" fill="#3B2A1A" {...S} />
    {[-60, -34, -8].map((cx) => (
      <path key={cx} d={`M ${cx - 12} -66 L ${cx + 14} -40`} stroke="#F4EFE6" strokeWidth={7} strokeLinecap="round" />
    ))}
    <path d="M 40 -30 Q 80 -26 100 -8" fill="none" stroke="#C99555" strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** An open, empty wallet. */
const EmptyWalletDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -170 -70 L 170 -70 L 150 -110 L -150 -110 Z" fill="#5A3A22" {...S} />
    <rect x={-170} y={-70} width={340} height={170} rx={16} fill="#8A5A2B" {...S} />
    <line x1={0} y1={-70} x2={0} y2={100} stroke={C.ink} strokeWidth={6} />
    <rect x={-140} y={-20} width={110} height={16} rx={6} fill="#5A3A22" />
    <rect x={30} y={-20} width={110} height={16} rx={6} fill="#5A3A22" />
    <path d="M -40 -150 q -16 -24 6 -44 M 30 -150 q 18 -22 -4 -44" fill="none" stroke="#9AA1AC" strokeWidth={7} strokeLinecap="round" strokeDasharray="4 14" />
  </g>
);

/** A speech bubble with two handwritten lines, its tail pointing down-left. */
const SayBubbleDrawing: React.FC<{x?: number; y?: number; a?: string; b?: string}> = ({x = 0, y = 0, a = '', b}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -300 -110 Q -330 -110 -330 -70 L -330 70 Q -330 110 -290 110 L -230 110 L -270 200 L -130 110 L 290 110 Q 330 110 330 70 L 330 -70 Q 330 -110 290 -110 Z" fill="#fff" {...S} />
    <text y={b ? -14 : 24} textAnchor="middle" fontFamily={MARKER} fontSize={72} fill={C.ink}>
      {a}
    </text>
    {b && (
      <text y={66} textAnchor="middle" fontFamily={MARKER} fontSize={72} fill={C.ink}>
        {b}
      </text>
    )}
  </g>
);

/** A thought bubble with a picture in it: money, a viral video, a briefcase. `side`: which way its little bubbles trail. */
const ThoughtDrawing: React.FC<{x?: number; y?: number; kind?: 'money' | 'video' | 'job'; side?: -1 | 0 | 1}> = ({x = 0, y = 0, kind = 'money', side = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -110 60 Q -180 50 -160 -20 Q -180 -90 -100 -100 Q -60 -160 20 -120 Q 100 -160 140 -90 Q 200 -60 160 10 Q 180 80 90 80 Q 20 120 -40 80 Q -80 90 -110 60 Z" fill="#fff" {...S} />
    <circle cx={-side * 70} cy={140} r={26} fill="#fff" {...S} strokeWidth={6} />
    <circle cx={-side * 120} cy={200} r={15} fill="#fff" {...S} strokeWidth={5} />
    {kind === 'money' && (
      <text y={16} textAnchor="middle" fontFamily={MARKER} fontSize={100} fill="#E5484D">
        $$$
      </text>
    )}
    {kind === 'video' && (
      <g>
        <rect x={-90} y={-80} width={180} height={116} rx={12} fill="#2B2B2B" stroke={C.ink} strokeWidth={6} />
        <path d="M -22 -54 L 34 -22 L -22 10 Z" fill="#E5484D" />
        <rect x={-110} y={36} width={220} height={18} rx={8} fill="#9AA1AC" stroke={C.ink} strokeWidth={5} />
      </g>
    )}
    {kind === 'job' && (
      <g>
        <path d="M -34 -60 L -34 -84 L 34 -84 L 34 -60" fill="none" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
        <rect x={-96} y={-60} width={192} height={120} rx={14} fill="#8A5A2B" {...S} strokeWidth={6} />
        <rect x={-18} y={-16} width={36} height={28} rx={6} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
      </g>
    )}
  </g>
);

/** A wooden sign on a post: HOPE; `noPlan` adds "(no plan)" under it. Origin at the foot of the post. */
const HopeSignDrawing: React.FC<{x?: number; y?: number; noPlan?: boolean}> = ({x = 0, y = 0, noPlan = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-16} y={-330} width={32} height={330} fill="#8A5A2B" {...S} strokeWidth={5} />
    <path d="M -190 -560 L 180 -570 L 196 -330 L -180 -320 Z" fill="#D9A766" {...S} />
    <text y={-450} textAnchor="middle" fontFamily={MARKER} fontSize={110} fill={C.ink}>
      HOPE
    </text>
    {noPlan && (
      <text y={-362} textAnchor="middle" fontFamily={MARKER} fontSize={58} fill="#E5484D">
        (no plan)
      </text>
    )}
    <path d="M -90 0 l 14 -40 l 12 40 M 60 0 l 12 -34 l 14 34" fill="none" stroke="#4E9A5A" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** A laptop with a gear over it: learning a skill. */
const SkillLaptopDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-130} y={-90} width={260} height={170} rx={12} fill="#2F4A8A" {...S} />
    <rect x={-108} y={-70} width={216} height={130} rx={6} fill="#E7F3FB" />
    <path d="M -170 80 L 170 80 L 190 116 L -190 116 Z" fill="#9AA1AC" {...S} />
    <g transform="translate(0 -6)">
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x={-9} y={-52} width={18} height={104} rx={5} fill="#F2C230" stroke={C.ink} strokeWidth={4} transform={`rotate(${a})`} />
      ))}
      <circle r={36} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
      <circle r={13} fill="#E7F3FB" stroke={C.ink} strokeWidth={5} />
    </g>
  </g>
);

/** A hill with a winding path up to a flag. Origin at the foot of the hill, in the middle. */
const HillPathDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -330 0 Q -200 -40 -120 -260 Q -40 -470 60 -480 Q 170 -470 240 -250 Q 290 -60 340 0 Z" fill="#CFE3B4" {...S} />
    <path d="M -200 -10 Q 60 -60 -40 -150 Q -130 -230 90 -260 Q 190 -290 30 -360 Q -30 -400 56 -470" fill="none" stroke="#fff" strokeWidth={34} strokeLinecap="round" />
    <path d="M -200 -10 Q 60 -60 -40 -150 Q -130 -230 90 -260 Q 190 -290 30 -360 Q -30 -400 56 -470" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray="18 20" />
    <line x1={60} y1={-480} x2={60} y2={-620} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    <path d="M 64 -616 L 170 -590 L 64 -552 Z" fill="#E5484D" {...S} strokeWidth={5} />
  </g>
);

/** A plain jar (no label): empty, or with a few coins in the bottom. */
const BufferJarDrawing: React.FC<{x?: number; y?: number; coins?: boolean}> = ({x = 0, y = 0, coins = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-170} width={220} height={36} rx={8} fill="#B88A10" {...S} />
    <path d="M -120 -134 L 120 -134 L 130 140 Q 130 170 100 170 L -100 170 Q -130 170 -130 140 Z" fill="#E7F3FB" {...S} />
    {coins &&
      [[-50, 130], [10, 136], [60, 126], [-20, 96], [36, 92]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={44} ry={16} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
      ))}
  </g>
);

/** A hand-drawn arrow pointing right (rotate it to point elsewhere). */
const ArrowDrawing: React.FC<{x?: number; y?: number; rotate?: number; color?: string}> = ({x = 0, y = 0, rotate = 0, color = C.ink}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -60 0 L 50 0 M 22 -30 L 54 0 L 22 30" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
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

export const Padlock = prop('Padlock', PadlockDrawing);
export const FlatTire = prop('FlatTire', FlatTireDrawing);
export const DoctorBill = prop('DoctorBill', DoctorBillDrawing);
export const CreditCard = prop('CreditCard', CreditCardDrawing);
export const FeeStamp = prop('FeeStamp', FeeStampDrawing);
export const CheapShoe = prop('CheapShoe', CheapShoeDrawing);
export const LotteryTicket = prop('LotteryTicket', LotteryTicketDrawing);
export const Ladder = prop('Ladder', LadderDrawing);
export const TenCoin = prop('TenCoin', TenCoinDrawing);
export const CoinStack = prop('CoinStack', CoinStackDrawing);
export const LittleGuy = prop('LittleGuy', LittleGuyDrawing);
export const Hole = prop('Hole', HoleDrawing);
export const Shovel = prop('Shovel', ShovelDrawing);
export const CalNote = prop('CalNote', CalNoteDrawing);
export const FeeSlip = prop('FeeSlip', FeeSlipDrawing);
export const GoodShoe = prop('GoodShoe', GoodShoeDrawing);
export const EmptyWallet = prop('EmptyWallet', EmptyWalletDrawing);
export const SayBubble = prop('SayBubble', SayBubbleDrawing);
export const Thought = prop('Thought', ThoughtDrawing);
export const HopeSign = prop('HopeSign', HopeSignDrawing);
export const SkillLaptop = prop('SkillLaptop', SkillLaptopDrawing);
export const HillPath = prop('HillPath', HillPathDrawing);
export const BufferJar = prop('BufferJar', BufferJarDrawing);
export const Arrow = prop('Arrow', ArrowDrawing);
