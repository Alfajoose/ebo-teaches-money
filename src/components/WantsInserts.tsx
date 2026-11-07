import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

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
