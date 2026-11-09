import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';
import {ChainsWornArt} from './WantsProps';

/**
 * Big props for Ep7's "give the prop the room" staging (after the user's reference: the prop
 * gets as much of the frame as the character, or the whole frame). Each is a prop (prop.tsx).
 * Origins at the centre. Sized to be seen across half a vertical frame.
 */
const S = {stroke: C.ink, strokeWidth: 8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** A plain cardboard box marked NEED… with a little WANT peeking out of it (eyes over the rim). */
const NeedBoxDrawing: React.FC<{x?: number; y?: number; peek?: number}> = ({x = 0, y = 0, peek = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    {/* the sneaky want, behind the front of the box: rises by `peek` (0 hidden, 1 eyes over the rim) */}
    <g transform={`translate(30 ${-60 - 70 * peek})`}>
      <ellipse cx={0} cy={0} rx={80} ry={64} fill="#8F6BD1" {...S} />
      <ellipse cx={-26} cy={-10} rx={18} ry={22} fill="#fff" {...S} strokeWidth={5} />
      <ellipse cx={26} cy={-10} rx={18} ry={22} fill="#fff" {...S} strokeWidth={5} />
      <circle cx={-18} cy={-6} r={8} fill={C.ink} />
      <circle cx={34} cy={-6} r={8} fill={C.ink} />
    </g>
    {/* the box */}
    <path d="M -220 -90 L 220 -90 L 200 170 L -200 170 Z" fill="#D6A867" {...S} />
    <path d="M -220 -90 L -260 -150 M 220 -90 L 260 -150" fill="none" {...S} />
    <rect x={-120} y={-20} width={240} height={100} rx={10} fill="none" stroke={C.ink} strokeWidth={6} />
    <text x={0} y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={C.ink}>
      NEED
    </text>
  </g>
);

/** A bowl of home food (rice and stew). */
const FoodBowlDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -110 -30 Q -60 -90 0 -60 Q 60 -100 110 -30 Z" fill="#FFF6DA" {...S} strokeWidth={6} />
    <path d="M -40 -50 Q 0 -80 50 -52" fill="none" stroke="#C8553D" strokeWidth={22} strokeLinecap="round" />
    <path d="M -130 -30 L 130 -30 Q 120 80 0 90 Q -120 80 -130 -30 Z" fill="#E5484D" {...S} />
    <path d="M -100 10 L 100 10" stroke="#fff" strokeWidth={8} opacity={0.6} strokeLinecap="round" />
  </g>
);

/** A delivery bag with a fat receipt hanging off it. */
const DeliveryBagDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -60 -120 Q 0 -180 60 -120" fill="none" {...S} strokeWidth={10} />
    <path d="M -110 -120 L 110 -120 L 100 110 L -100 110 Z" fill="#F5A33A" {...S} />
    <circle cx={0} cy={-10} r={44} fill="#fff" {...S} strokeWidth={6} />
    <path d="M -18 -22 L 18 -22 L 10 18 L -10 18 Z M -24 -22 L 24 -22" fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* the receipt */}
    <g transform="translate(110 40) rotate(12)">
      <path d="M 0 0 L 70 0 L 70 150 L 60 140 L 50 150 L 40 140 L 30 150 L 20 140 L 10 150 L 0 140 Z" fill="#fff" {...S} strokeWidth={5} />
      <text x={35} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#E5484D">
        $$$
      </text>
      {[0, 1, 2].map((i) => (
        <line key={i} x1={12} x2={58} y1={22 + i * 18} y2={22 + i * 18} stroke="#B5A88C" strokeWidth={5} />
      ))}
    </g>
  </g>
);

/** A phone, front on. `fresh` = the shiny new model with a NEW! sticker; otherwise the old one, a bit scuffed. */
const ModelPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; fresh?: boolean; year?: string}> = ({x = 0, y = 0, rotate = 0, fresh = false, year}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-80} y={-150} width={160} height={300} rx={26} fill={fresh ? '#2B2F3A' : C.ink} {...S} strokeWidth={6} />
    <rect x={-66} y={-130} width={132} height={256} rx={14} fill={fresh ? '#9FD3F5' : '#5D6B86'} />
    {fresh && <path d="M -40 -110 L 10 -110 L -50 0 Z" fill="#fff" opacity={0.35} />}
    {!fresh && <path d="M 20 -120 L 0 -60 L 30 -20 L 10 40" fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} />}
    {fresh && (
      <g transform="translate(70 -140) rotate(14)">
        <circle r={46} fill="#E5484D" {...S} strokeWidth={5} />
        <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
          NEW!
        </text>
      </g>
    )}
    {year && (
      <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">
        {year}
      </text>
    )}
  </g>
);

/** A T-shirt: plain, or the same shirt with a huge brand logo and a price tag. */
const ShirtDrawing: React.FC<{x?: number; y?: number; brand?: boolean}> = ({x = 0, y = 0, brand = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -60 -130 Q 0 -100 60 -130 L 150 -90 L 120 -20 L 90 -34 L 90 130 L -90 130 L -90 -34 L -120 -20 L -150 -90 Z" fill={brand ? '#1D1A1A' : '#F6F0E4'} {...S} />
    {brand && (
      <g>
        <path d="M -50 -10 Q 0 -60 50 -10 Q 0 40 -50 -10 Z" fill="#F2C230" stroke="#F2C230" strokeWidth={4} />
        <text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#F2C230">
          LUXE
        </text>
        <g transform="translate(110 -110) rotate(18)">
          <rect x={-10} y={0} width={110} height={60} rx={8} fill="#fff" {...S} strokeWidth={5} />
          <text x={45} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#E5484D">
            $250
          </text>
        </g>
      </g>
    )}
    {!brand && (
      <g transform="translate(110 -110) rotate(18)">
        <rect x={-10} y={0} width={90} height={60} rx={8} fill="#fff" {...S} strokeWidth={5} />
        <text x={35} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
          $8
        </text>
      </g>
    )}
  </g>
);

/** The "want": a little purple blob with big eyes (the sneaky one). Origin at its centre.
 * mood: sneaky (eyes slid sideways), happy (smile), sad (frown). Extras: a disguise (hat and
 * moustache, holding a NEED sign), a waiting ticket. */
const WantGuyDrawing: React.FC<{x?: number; y?: number; rotate?: number; mood?: 'sneaky' | 'happy' | 'sad'; disguise?: boolean; ticket?: boolean; t?: number}> = ({x = 0, y = 0, rotate = 0, mood = 'sneaky', disguise = false, ticket = false, t}) => {
  const px = mood === 'sneaky' ? 8 : 0;
  // alive (when given the time): a blink every couple of seconds
  const sway = 0; // the sway is the caller's (on the symbol's matrix, so the Animate export stays one symbol)
  const blink = t !== undefined && (t * 30) % 78 < 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate + sway})`}>
      <ellipse cx={0} cy={0} rx={80} ry={64} fill="#8F6BD1" {...S} />
      <ellipse cx={-26} cy={-10} rx={18} ry={22} fill="#fff" {...S} strokeWidth={5} />
      <ellipse cx={26} cy={-10} rx={18} ry={22} fill="#fff" {...S} strokeWidth={5} />
      <circle cx={-26 + px} cy={mood === 'sad' ? -2 : -6} r={8} fill={C.ink} />
      <circle cx={26 + px} cy={mood === 'sad' ? -2 : -6} r={8} fill={C.ink} />
      {blink && [-26, 26].map((ex) => <ellipse key={ex} cx={ex} cy={-10} rx={19} ry={23} fill="#8F6BD1" stroke={C.ink} strokeWidth={5} />)}
      {blink && [-26, 26].map((ex) => <path key={`l${ex}`} d={`M ${ex - 14} -8 Q ${ex} 0 ${ex + 14} -8`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />)}
      {mood === 'happy' && <path d="M -24 24 Q 0 44 24 24" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />}
      {mood === 'sad' && <path d="M -22 36 Q 0 20 22 36" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />}
      {mood === 'sneaky' && !disguise && <path d="M -16 30 Q 6 36 22 26" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />}
      {disguise && (
        <g>
          {/* hat */}
          <path d="M -70 -50 L 70 -50 L 50 -60 L 40 -120 L -40 -120 L -50 -60 Z" fill="#3A3F4E" {...S} strokeWidth={5} />
          <rect x={-42} y={-74} width={84} height={12} fill="#E5484D" />
          {/* glasses and moustache */}
          <path d="M -46 -12 L 46 -12" stroke={C.ink} strokeWidth={5} />
          <path d="M -40 26 Q -20 10 0 24 Q 20 10 40 26 Q 20 34 0 30 Q -20 34 -40 26 Z" fill={C.ink} />
          {/* the NEED sign on a stick */}
          <path d="M 80 60 L 110 -40" stroke="#8B6A48" strokeWidth={10} strokeLinecap="round" />
          <g transform="translate(118 -80) rotate(8)">
            <rect x={-80} y={-40} width={160} height={74} rx={8} fill="#fff" {...S} strokeWidth={5} />
            <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink}>
              NEED
            </text>
          </g>
        </g>
      )}
      {ticket && (
        <g transform="translate(-96 30) rotate(-14)">
          <rect x={-34} y={-24} width={68} height={48} rx={6} fill="#FFF6DA" {...S} strokeWidth={4} />
          <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink}>
            #99
          </text>
        </g>
      )}
    </g>
  );
};

/** A pay slip: "PAY" and a modest amount (origin at its centre). */
const PaySlipDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-170} y={-110} width={340} height={220} rx={10} fill="#E9F5EC" {...S} />
    <text x={-140} y={-56} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#2E7D52">
      PAYSLIP
    </text>
    {[0, 1].map((i) => (
      <line key={i} x1={-140} x2={40 - i * 60} y1={-14 + i * 30} y2={-14 + i * 30} stroke="#9CC5A8" strokeWidth={8} strokeLinecap="round" />
    ))}
    <text x={140} y={78} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.ink}>
      $1,800
    </text>
  </g>
);

/** Big hand-drawn tick or cross (origin at its centre). */
const MarkDrawing: React.FC<{x?: number; y?: number; kind?: 'tick' | 'cross'; size?: number}> = ({x = 0, y = 0, kind = 'tick', size = 1}) => (
  <g transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={kind === 'tick' ? '#2E9E6A' : '#E5484D'} strokeWidth={26 * size}>
    {kind === 'tick' ? <path d={`M ${-60 * size} 0 L ${-14 * size} ${46 * size} L ${70 * size} ${-60 * size}`} /> : <path d={`M ${-70 * size} ${-70 * size} L ${70 * size} ${70 * size} M ${70 * size} ${-70 * size} L ${-70 * size} ${70 * size}`} />}
  </g>
);

/** Rent, food, getting to work: a little house, a bowl, a bus (origin at the centre of each). */
const HouseDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -110 -10 L 0 -110 L 110 -10" fill="#C96F5A" {...S} />
    <rect x={-90} y={-14} width={180} height={124} fill="#F6E3C6" {...S} />
    <rect x={-24} y={36} width={48} height={74} fill="#8B6A48" {...S} strokeWidth={5} />
    <rect x={-74} y={10} width={36} height={36} fill="#9FD3F5" {...S} strokeWidth={5} />
  </g>
);
const BusDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-140} y={-80} width={280} height={150} rx={22} fill="#F3C53F" {...S} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-120 + i * 80} y={-60} width={64} height={52} rx={6} fill="#9FD3F5" {...S} strokeWidth={5} />
    ))}
    <circle cx={-80} cy={78} r={26} fill={C.ink} />
    <circle cx={80} cy={78} r={26} fill={C.ink} />
  </g>
);

/** A bill with a DUE TODAY stamp (urgent). */
const BillDueDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-100} y={-130} width={200} height={260} fill="#fff" {...S} />
    <text x={-76} y={-80} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
      RENT
    </text>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-76} x2={60 - i * 30} y1={-40 + i * 26} y2={-40 + i * 26} stroke="#B5A88C" strokeWidth={7} strokeLinecap="round" />
    ))}
    <g transform="translate(0 70) rotate(-12)">
      <rect x={-96} y={-32} width={192} height={64} rx={8} fill="none" stroke="#E5484D" strokeWidth={8} />
      <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#E5484D">
        DUE TODAY
      </text>
    </g>
  </g>
);

/** A tear-off calendar page: TODAY or TOMORROW. */
const DayPageDrawing: React.FC<{x?: number; y?: number; rotate?: number; tomorrow?: boolean}> = ({x = 0, y = 0, rotate = 0, tomorrow = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-170} y={-150} width={340} height={300} rx={18} fill="#fff" {...S} />
    <rect x={-170} y={-150} width={340} height={84} rx={18} fill="#E5484D" {...S} />
    {[-110, -40, 40, 110].map((cx) => (
      <circle key={cx} cx={cx} cy={-150} r={12} fill="#fff" {...S} strokeWidth={4} />
    ))}
    <text y={-92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff">
      {tomorrow ? 'TOMORROW' : 'TODAY'}
    </text>
    <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={C.ink}>
      {tomorrow ? '2' : '1'}
    </text>
  </g>
);

/** A payday envelope, cash sticking out. */
const PaydayDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-120 + i * 26} y={-120 - i * 14} width={200} height={100} rx={8} fill="#7BC47F" {...S} strokeWidth={5} transform={`rotate(${-8 + i * 7})`} />
    ))}
    <rect x={-170} y={-70} width={340} height={180} rx={12} fill="#F2E3C4" {...S} />
    <path d="M -170 -70 L 0 30 L 170 -70" fill="none" {...S} strokeWidth={6} />
    <text y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
      PAYDAY
    </text>
  </g>
);

/** A FUN MONEY jar: some cash in it, or empty. */
const FunJarDrawing: React.FC<{x?: number; y?: number; empty?: boolean}> = ({x = 0, y = 0, empty = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-170} width={220} height={36} rx={8} fill="#B88A10" {...S} />
    <path d="M -120 -134 L 120 -134 L 130 140 Q 130 170 100 170 L -100 170 Q -130 170 -130 140 Z" fill="#E7F3FB" {...S} />
    {!empty && (
      <g>
        <path d="M -118 40 L 118 30 L 124 140 Q 124 160 100 162 L -100 162 Q -124 160 -124 140 Z" fill="#7BC47F" stroke={C.ink} strokeWidth={5} />
        <circle cx={-40} cy={20} r={26} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
        <circle cx={40} cy={10} r={26} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
      </g>
    )}
    <rect x={-100} y={-90} width={200} height={84} rx={10} fill="#fff" {...S} strokeWidth={5} />
    <text y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
      FUN MONEY
    </text>
  </g>
);

/** The three gold chains on their own (as worn on his chest; the caller sizes them). Origin near their centre. */
const ChainsBigDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x - 100} ${y - 60})`}>
    <ChainsWornArt count={3} />
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

export const NeedBox = prop('NeedBox', NeedBoxDrawing);
export const FoodBowl = prop('FoodBowl', FoodBowlDrawing);
export const DeliveryBag = prop('DeliveryBag', DeliveryBagDrawing);
export const ModelPhone = prop('ModelPhone', ModelPhoneDrawing);
export const Shirt = prop('Shirt', ShirtDrawing);
export const WantGuy = prop('WantGuy', WantGuyDrawing);
export const PaySlip = prop('PaySlip', PaySlipDrawing);
export const Mark = prop('Mark', MarkDrawing);
export const House = prop('House', HouseDrawing);
export const Bus = prop('Bus', BusDrawing);
export const BillDue = prop('BillDue', BillDueDrawing);
export const DayPage = prop('DayPage', DayPageDrawing);
export const Payday = prop('Payday', PaydayDrawing);
export const FunJar = prop('FunJar', FunJarDrawing);
export const ChainsBig = prop('ChainsBig', ChainsBigDrawing);
