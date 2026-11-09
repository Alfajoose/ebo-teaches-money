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
const PadlockDrawing: React.FC<{x?: number; y?: number; rotate?: number; open?: boolean; color?: string}> = ({x = 0, y = 0, rotate = 0, open = false, color = '#B8B2A6'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d={open ? 'M -50 -20 L -50 -90 Q -50 -140 0 -140 Q 50 -140 50 -90 L 50 -70' : 'M -50 -20 L -50 -80 Q -50 -130 0 -130 Q 50 -130 50 -80 L 50 -20'} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" transform={open ? 'translate(0 -30)' : undefined} />
    <rect x={-80} y={-30} width={160} height={130} rx={18} fill={color} {...S} />
    <circle cx={0} cy={25} r={16} fill={C.ink} />
    <rect x={-6} y={30} width={12} height={36} fill={C.ink} />
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
