import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 8 (Why Nice Guys Get Taken Advantage Of). Each is a prop (prop.tsx): hand-drawn in
 * the video, its own vector symbol in the Animate export. Origins at the centre unless noted.
 */
const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const MARKER = 'EboMarker';

/** A long restaurant receipt hanging down (origin at its top edge, centred); `len` px long, a big total at the bottom. */
const ReceiptDrawing: React.FC<{x?: number; y?: number; rotate?: number; len?: number; total?: string}> = ({x = 0, y = 0, rotate = 0, len = 420, total = '$186.40'}) => {
  const rows = Math.max(2, Math.floor((len - 120) / 34));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M -70 0 L 70 0 L 70 ${len} ${Array.from({length: 7}, (_, i) => `L ${70 - (i + 1) * 20} ${len + (i % 2 ? 0 : 12)}`).join(' ')} Z`} fill="#fff" {...S} strokeWidth={5} />
      {Array.from({length: rows}, (_, i) => (
        <g key={i}>
          <line x1={-54} x2={10 - (i % 3) * 14} y1={30 + i * 34} y2={30 + i * 34} stroke="#B5A88C" strokeWidth={6} strokeLinecap="round" />
          <line x1={30} x2={54} y1={30 + i * 34} y2={30 + i * 34} stroke="#B5A88C" strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      <text x={0} y={len - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#E5484D">
        {total}
      </text>
    </g>
  );
};

/** A small restaurant table seen from the front, with empty plates and glasses (origin at the middle of the top edge). */
const TableDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-330} y={0} width={660} height={36} rx={10} fill="#C96F5A" {...S} />
    <rect x={-300} y={36} width={600} height={260} fill="#F6E3C6" {...S} />
    <path d="M -300 36 L -260 296 M 300 36 L 260 296" stroke={C.ink} strokeWidth={5} opacity={0.3} />
    {[-200, 0, 200].map((px) => (
      <ellipse key={px} cx={px} cy={-8} rx={70} ry={14} fill="#fff" {...S} strokeWidth={5} />
    ))}
    {[-110, 110].map((gx) => (
      <path key={gx} d={`M ${gx - 18} -70 L ${gx + 18} -70 L ${gx + 12} -4 L ${gx - 12} -4 Z`} fill="#D9F0FA" {...S} strokeWidth={5} />
    ))}
  </g>
);

/** Car keys on a ring. */
const CarKeysDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <circle cx={0} cy={0} r={22} fill="none" stroke="#B8B2A6" strokeWidth={8} />
    <rect x={10} y={-12} width={58} height={34} rx={10} fill={C.ink} />
    <circle cx={39} cy={5} r={6} fill="#E5484D" />
    <path d="M -14 16 L -40 64 L -30 70 L -26 62 L -20 66 L -16 58 L -4 22" fill="#E2C25A" {...S} strokeWidth={4} />
  </g>
);

/** A moving box, taped. */
const MovingBoxDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-100} y={-80} width={200} height={160} fill="#D6A867" {...S} />
    <rect x={-100} y={-80} width={200} height={26} fill="#C99555" {...S} strokeWidth={5} />
    <rect x={-16} y={-80} width={32} height={160} fill="#E8D4A8" opacity={0.8} />
    <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
      STUFF
    </text>
  </g>
);

/** A phone with a chat: a message in from her (`msg`), and optionally his instant reply. Origin at the centre. */
const ChatPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; time?: string; msg?: string; reply?: string; read?: string}> = ({x = 0, y = 0, rotate = 0, time = '12:00 AM', msg = 'u up? need a favor', reply, read}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-120} y={-220} width={240} height={440} rx={34} fill={C.ink} />
    <rect x={-104} y={-196} width={208} height={392} rx={18} fill="#1E2436" />
    <text x={0} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#C9D3E6">
      {time}
    </text>
    <g transform="translate(-86 -110)">
      <rect x={0} y={0} width={160} height={74} rx={18} fill="#E8E9EE" />
      <text x={14} y={30} fontFamily={FONT} fontWeight={700} fontSize={20} fill={C.ink}>
        {msg.split(' ').slice(0, 2).join(' ')}
      </text>
      <text x={14} y={56} fontFamily={FONT} fontWeight={700} fontSize={20} fill={C.ink}>
        {msg.split(' ').slice(2).join(' ')}
      </text>
    </g>
    {reply && (
      <g transform="translate(-60 -10)">
        <rect x={0} y={0} width={146} height={50} rx={18} fill="#2F80ED" />
        <text x={73} y={33} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#fff">
          {reply}
        </text>
      </g>
    )}
    {read && (
      <text x={84} y={62} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={16} fill="#8D97AE">
        {read}
      </text>
    )}
  </g>
);

/** A clock with a sale tag on it (his time, going cheap). */
const SaleClockDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={120} fill="#fff" {...S} strokeWidth={9} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={0} x2={0} y1={-96} y2={-82} stroke={C.ink} strokeWidth={6} transform={`rotate(${i * 30})`} />
    ))}
    <path d="M 0 0 L 0 -62 M 0 0 L 44 18" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    <g transform="translate(96 70) rotate(18)">
      <path d="M 0 -30 L 110 -30 L 130 0 L 110 30 L 0 30 Z" fill="#E5484D" {...S} strokeWidth={5} />
      <text x={56} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff">
        $0.99
      </text>
    </g>
  </g>
);

/** A doormat: WELCOME, with muddy footprints on it. */
const DoormatDrawing: React.FC<{x?: number; y?: number; rotate?: number; prints?: number}> = ({x = 0, y = 0, rotate = 0, prints = 3}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-200} y={-90} width={400} height={180} rx={14} fill="#B27A47" {...S} />
    <rect x={-180} y={-70} width={360} height={140} rx={8} fill="none" stroke="#8C5A2E" strokeWidth={6} strokeDasharray="14 8" />
    <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#6E4320">
      WELCOME
    </text>
    {Array.from({length: prints}, (_, i) => (
      <g key={i} transform={`translate(${-120 + i * 110} ${i % 2 ? -30 : 30}) rotate(${-20 + i * 15})`} opacity={0.75}>
        <ellipse rx={20} ry={34} fill="#4A3A2A" />
        <ellipse cy={44} rx={14} ry={14} fill="#4A3A2A" />
      </g>
    ))}
  </g>
);

/** A crown (respect). */
const CrownDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -110 60 L -120 -50 L -60 0 L 0 -80 L 60 0 L 120 -50 L 110 60 Z" fill="#F2C230" {...S} />
    <rect x={-112} y={50} width={224} height={34} rx={8} fill="#E0A920" {...S} strokeWidth={6} />
    {[-60, 0, 60].map((cx) => (
      <circle key={cx} cx={cx} cy={67} r={9} fill="#E5484D" />
    ))}
  </g>
);

/** A heart (being liked). */
const HeartDrawing: React.FC<{x?: number; y?: number; rotate?: number; color?: string}> = ({x = 0, y = 0, rotate = 0, color = '#F27AA0'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M 0 70 C -120 -10 -90 -110 0 -50 C 90 -110 120 -10 0 70 Z" fill={color} {...S} />
  </g>
);

/** A speech bubble: either a long scroll of excuses, crossed out, or a short "No." */
const SpeechDrawing: React.FC<{x?: number; y?: number; short?: boolean}> = ({x = 0, y = 0, short = false}) => (
  <g transform={`translate(${x} ${y})`}>
    {short ? (
      <g>
        <path d="M -110 -70 L 110 -70 Q 130 -70 130 -50 L 130 40 Q 130 60 110 60 L -20 60 L -60 100 L -50 60 L -110 60 Q -130 60 -130 40 L -130 -50 Q -130 -70 -110 -70 Z" fill="#fff" {...S} />
        <text x={0} y={22} textAnchor="middle" fontFamily={MARKER} fontSize={84} fill={C.ink}>
          No.
        </text>
      </g>
    ) : (
      <g>
        <path d="M -150 -170 L 150 -170 Q 170 -170 170 -150 L 170 150 Q 170 170 150 170 L -20 170 L -60 210 L -50 170 L -150 170 Q -170 170 -170 150 L -170 -150 Q -170 -170 -150 -170 Z" fill="#fff" {...S} />
        {Array.from({length: 8}, (_, i) => (
          <line key={i} x1={-130} x2={130 - (i % 3) * 40} y1={-130 + i * 36} y2={-130 + i * 36} stroke="#B5A88C" strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d="M -140 -140 L 140 140 M 140 -140 L -140 140" stroke="#E5484D" strokeWidth={18} strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** A plain wall clock (no tag). */
const ClockDrawing: React.FC<{x?: number; y?: number; h?: number}> = ({x = 0, y = 0, h = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={120} fill="#fff" {...S} strokeWidth={9} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={0} x2={0} y1={-96} y2={-82} stroke={C.ink} strokeWidth={6} transform={`rotate(${i * 30})`} />
    ))}
    <path d={`M 0 0 L 0 -66 M 0 0 L ${44 * Math.sin((h * 30 * Math.PI) / 180)} ${-44 * Math.cos((h * 30 * Math.PI) / 180)}`} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** A calendar page: a day name and a big number. */
const CalPageDrawing: React.FC<{x?: number; y?: number; rotate?: number; top?: string; n?: string}> = ({x = 0, y = 0, rotate = 0, top = 'DAY', n = '1'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-120} y={-110} width={240} height={220} rx={14} fill="#fff" {...S} />
    <rect x={-120} y={-110} width={240} height={62} rx={14} fill="#E5484D" {...S} />
    <text y={-66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
      {top}
    </text>
    <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={C.ink}>
      {n}
    </text>
  </g>
);

/** A parking ticket: a yellow envelope, VIOLATION, a fine. */
const ParkingTicketDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-110} y={-150} width={220} height={300} rx={8} fill="#F3D14A" {...S} />
    <rect x={-110} y={-150} width={220} height={60} fill="#E5484D" {...S} strokeWidth={5} />
    <text y={-108} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
      PARKING
    </text>
    <text y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
      VIOLATION
    </text>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-80} x2={80 - i * 30} y1={0 + i * 28} y2={0 + i * 28} stroke="#A88B1F" strokeWidth={7} strokeLinecap="round" />
    ))}
    <text y={124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#E5484D">
      $85
    </text>
  </g>
);

/** A birthday cake with candles. */
const CakeDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-40} width={300} height={130} rx={14} fill="#F7C6D9" {...S} />
    <path d="M -150 -10 Q -120 20 -90 -10 Q -60 20 -30 -10 Q 0 20 30 -10 Q 60 20 90 -10 Q 120 20 150 -10" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
    <rect x={-170} y={86} width={340} height={20} rx={10} fill="#D9D3C7" {...S} strokeWidth={5} />
    {[-80, -25, 30, 85].map((cx, i) => (
      <g key={cx}>
        <rect x={cx - 8} y={-100} width={16} height={60} fill={['#45B69C', '#F5A33A', '#2F80ED', '#E5484D'][i]} {...S} strokeWidth={4} />
        <path d={`M ${cx} -130 Q ${cx + 12} -112 ${cx} -102 Q ${cx - 12} -112 ${cx} -130 Z`} fill="#F2C230" stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
  </g>
);

/** A lobster on a plate. */
const LobsterDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <ellipse cx={0} cy={70} rx={230} ry={50} fill="#fff" {...S} />
    {/* claws */}
    <path d="M -70 -10 L -150 -90 M 70 -10 L 150 -90" stroke="#D2452F" strokeWidth={22} strokeLinecap="round" />
    <path d="M -190 -150 Q -120 -170 -130 -90 Q -170 -110 -150 -90 Q -210 -100 -190 -150 Z" fill="#E5533B" {...S} strokeWidth={6} />
    <path d="M 190 -150 Q 120 -170 130 -90 Q 170 -110 150 -90 Q 210 -100 190 -150 Z" fill="#E5533B" {...S} strokeWidth={6} />
    {/* body and tail */}
    <ellipse cx={0} cy={0} rx={80} ry={60} fill="#E5533B" {...S} />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={0} cy={60 + i * 26} rx={60 - i * 12} ry={18} fill="#D2452F" {...S} strokeWidth={5} />
    ))}
    <circle cx={-26} cy={-30} r={9} fill={C.ink} />
    <circle cx={26} cy={-30} r={9} fill={C.ink} />
    <path d="M -20 -56 Q -60 -140 -110 -150 M 20 -56 Q 60 -140 110 -150" fill="none" stroke={C.ink} strokeWidth={4} />
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

export const Receipt = prop('Receipt', ReceiptDrawing);
export const DinnerTable = prop('DinnerTable', TableDrawing);
export const CarKeys = prop('CarKeys', CarKeysDrawing);
export const MovingBox = prop('MovingBox', MovingBoxDrawing);
export const ChatPhone = prop('ChatPhone', ChatPhoneDrawing);
export const SaleClock = prop('SaleClock', SaleClockDrawing);
export const Doormat = prop('Doormat', DoormatDrawing);
export const Crown = prop('Crown', CrownDrawing);
export const Heart = prop('Heart', HeartDrawing);
export const Speech = prop('Speech', SpeechDrawing);
export const Clock = prop('Clock', ClockDrawing);
export const CalPage = prop('CalPage', CalPageDrawing);
export const ParkingTicket = prop('ParkingTicket', ParkingTicketDrawing);
export const Cake = prop('Cake', CakeDrawing);
export const Lobster = prop('Lobster', LobsterDrawing);
