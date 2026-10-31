import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props for Episode 4 (The Ultimate Guide to Staying Broke). Each is a prop (see prop.tsx):
 * hand-drawn in the video, its own vector symbol in the Animate export. Origins are at the
 * bottom-centre unless noted. Animated parts only move or turn (house rule: no scale).
 */

const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** A framed diploma with a big red "NOT NEEDED" stamp. Origin at its centre. */
const DiplomaDrawing: React.FC<{x?: number; y?: number; rotate?: number; stamped?: boolean}> = ({x = 0, y = 0, rotate = 0, stamped = true}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-110} y={-80} width={220} height={160} fill="#8B6A48" {...S} />
    <rect x={-92} y={-62} width={184} height={124} fill="#FFF6DA" {...S} strokeWidth={4} />
    <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.ink}>
      DEGREE
    </text>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-60} x2={60 - i * 20} y1={4 + i * 16} y2={4 + i * 16} stroke="#B5A88C" strokeWidth={5} />
    ))}
    {stamped && (
      <g transform="rotate(-16)">
        <rect x={-96} y={-26} width={192} height={52} rx={6} fill="none" stroke={C.red} strokeWidth={7} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.red}>
          NOT NEEDED
        </text>
      </g>
    )}
  </g>
);

/** A sticky note. Origin at its centre. */
const StickyDrawing: React.FC<{x?: number; y?: number; rotate?: number; text?: string; color?: string}> = ({x = 0, y = 0, rotate = 0, text = 'MONDAY', color = '#FFE680'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-70} y={-62} width={140} height={124} fill={color} {...S} strokeWidth={5} />
    <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={text.length > 7 ? 22 : 28} fill={C.ink}>
      {text}
    </text>
  </g>
);

/** A wall of "MONDAY" sticky notes; `n` notes are up. */
const StickyWallDrawing: React.FC<{x?: number; y?: number; n?: number}> = ({x = 0, y = 0, n = 17}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: n}).map((_, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const r = ((i * 37) % 17) - 8;
      const label = ['MONDAY', 'NEXT MONDAY', 'APP IDEA', 'START BIZ', 'MONDAY!!', 'GYM?'][i % 6];
      return (
        <g key={i} transform={`translate(${col * 150 - 375} ${row * 140 - 140}) rotate(${r})`}>
          <rect x={-62} y={-56} width={124} height={112} fill={['#FFE680', '#FFB3C7', '#A8E6CF', '#FFD08A'][i % 4]} {...S} strokeWidth={4} />
          <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 8 ? 16 : 22} fill={C.ink}>
            {label}
          </text>
        </g>
      );
    })}
  </g>
);

/** A big phone held up to camera. Origin at its centre. Screens: scroll feed, screenshot gallery, job page. */
const BigPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number; screen?: 'scroll' | 'gallery' | 'job' | 'off'; t?: number}> = ({
  x = 0,
  y = 0,
  rotate = 0,
  screen = 'scroll',
  t = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-70} y={-130} width={140} height={260} rx={22} fill={C.ink} />
    <rect x={-60} y={-112} width={120} height={224} rx={10} fill={screen === 'off' ? '#4B566E' : '#F6F0E4'} />
    {screen === 'scroll' &&
      [0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-72 + i * 74 - (Math.floor(t / 4) % 2) * 20})`}>
          <rect x={-52} y={-30} width={104} height={58} rx={6} fill={['#7FB8E0', '#F7C873', '#A8E6CF'][(i + Math.floor(t / 8)) % 3]} />
          <circle cx={-34} cy={-12} r={8} fill={C.ink} opacity={0.5} />
        </g>
      ))}
    {screen === 'gallery' &&
      Array.from({length: 12}).map((_, i) => (
        <g key={i}>
          <rect x={-54 + (i % 3) * 37} y={-104 + Math.floor(i / 3) * 52} width={33} height={48} fill={['#8F6BD1', '#E5484D', '#45B69C', '#F3C53F'][i % 4]} />
          <rect x={-50 + (i % 3) * 37} y={-84 + Math.floor(i / 3) * 52} width={25} height={5} fill="#fff" />
        </g>
      ))}
    {screen === 'job' && (
      <g>
        <rect x={-52} y={-100} width={104} height={14} fill={C.ink} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-52} y={-74 + i * 18} width={104 - (i % 2) * 30} height={8} fill="#B5A88C" />
        ))}
        <rect x={-46} y={40} width={92} height={40} rx={10} fill={C.shirt} />
        <text x={0} y={68} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">
          APPLY
        </text>
      </g>
    )}
  </g>
);

/** A bowl of cereal with a spoon. */
const CerealDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 30 -60 L 70 -110" stroke="#B8BCC6" strokeWidth={10} strokeLinecap="round" />
    {[[-30, -52], [-8, -58], [16, -54], [34, -50], [-20, -46]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={9} fill="#F3C53F" {...S} strokeWidth={3} />
    ))}
    <path d="M -64 -48 L 64 -48 Q 56 0 0 0 Q -56 0 -64 -48 Z" fill="#4D8FD6" {...S} />
  </g>
);

/** A bag of chips (held or on the floor). */
const ChipsDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -46 0 L -54 -130 L 54 -130 L 46 0 Z" fill="#E5484D" {...S} />
    <path d="M -54 -130 L -46 -144 L -30 -130 L -14 -144 L 2 -130 L 18 -144 L 34 -130 L 50 -144 L 54 -130" fill="#E5484D" {...S} strokeWidth={5} />
    <circle cx={0} cy={-66} r={30} fill="#F3C53F" {...S} strokeWidth={5} />
    <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
      YUM
    </text>
  </g>
);

/** The comfort-zone blanket fort, piled with snacks. */
const BlanketFortDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -380 0 L -300 -330 L 0 -400 L 300 -330 L 380 0 Z" fill="#8FB8DE" {...S} strokeWidth={9} />
    <path d="M -300 -330 L -200 0 M 300 -330 L 200 0 M 0 -400 L 0 -150" stroke="#6E98C2" strokeWidth={8} />
    <path d="M -170 0 Q -170 -230 0 -240 Q 170 -230 170 0 Z" fill="#2F3A56" {...S} />
    {[[-310, -40, '#F3C53F'], [-250, -20, '#E5484D'], [260, -30, '#45B69C'], [320, -20, '#F7C873']].map(([cx, cy, col], i) => (
      <rect key={i} x={(cx as number) - 30} y={(cy as number) - 50} width={60} height={70} rx={8} fill={col as string} {...S} strokeWidth={5} />
    ))}
    <rect x={-330} y={-360} width={180} height={50} rx={8} fill={C.white} {...S} strokeWidth={5} transform="rotate(-8 -240 -335)" />
    <text x={-240} y={-325} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink} transform="rotate(-8 -240 -335)">
      COMFORT ZONE
    </text>
  </g>
);

/** A suitcase stuffed with cash. Origin at its centre. */
const SuitcaseDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -36 -78 L -36 -100 L 36 -100 L 36 -78" fill="none" stroke={C.ink} strokeWidth={10} />
    <rect x={-130} y={-80} width={260} height={160} rx={16} fill="#7A4A2E" {...S} />
    {[-90, -45, 0, 45, 90].map((dx, i) => (
      <rect key={i} x={dx - 20} y={-104 + (i % 2) * 8} width={40} height={30} fill={C.money} {...S} strokeWidth={4} />
    ))}
    <rect x={-130} y={-10} width={260} height={16} fill="#5B3620" />
    <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.gold}>
      $$$
    </text>
  </g>
);

/** A rejection letter (held). Origin at its centre. */
const LetterDrawing: React.FC<{x?: number; y?: number; rotate?: number; label?: string}> = ({x = 0, y = 0, rotate = 0, label = 'REJECTED'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-60} y={-80} width={120} height={160} fill={C.white} {...S} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={-40} x2={40 - (i % 2) * 20} y1={-54 + i * 18} y2={-54 + i * 18} stroke="#B5A88C" strokeWidth={5} />
    ))}
    <g transform="rotate(-14)">
      <rect x={-58} y={14} width={116} height={40} fill="none" stroke={C.red} strokeWidth={5} />
      <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 8 ? 18 : 22} fill={C.red}>
        {label}
      </text>
    </g>
  </g>
);

/** A "MONDAY" wall calendar page (desk prop). Origin at its centre. */
const MondayPadDrawing: React.FC<{x?: number; y?: number; rotate?: number; week?: number}> = ({x = 0, y = 0, rotate = 0, week = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-80} y={-90} width={160} height={180} rx={10} fill={C.white} {...S} />
    <rect x={-80} y={-90} width={160} height={54} rx={10} fill={C.red} {...S} />
    <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
      MONDAY
    </text>
    <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.ink}>
      {week}
    </text>
    <text x={0} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={18} fill={C.gray}>
      WEEK
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

/** The back of the living-room couch, seen from behind (the reverse angle onto the TV). It sits in
 * front of Ebo, so only his head and shoulders show over it. Origin at its bottom-centre. */
const CouchBackDrawing: React.FC<{x?: number; y?: number; color?: string}> = ({x = 0, y = 0, color = '#C96F5A'}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-430} y={-240} width={860} height={240} rx={56} fill={color} {...S} strokeWidth={9} />
    <rect x={-480} y={-180} width={100} height={180} rx={40} fill={color} {...S} strokeWidth={9} />
    <rect x={380} y={-180} width={100} height={180} rx={40} fill={color} {...S} strokeWidth={9} />
    <line x1={-340} x2={340} y1={-180} y2={-180} stroke={C.ink} strokeWidth={5} opacity={0.35} />
  </g>
);

export const CouchBack = prop('CouchBack', CouchBackDrawing);
export const Diploma = prop('Diploma', DiplomaDrawing);
export const Sticky = prop('Sticky', StickyDrawing);
export const StickyWall = prop('StickyWall', StickyWallDrawing);
export const BigPhone = prop('BigPhone', BigPhoneDrawing);
export const Cereal = prop('Cereal', CerealDrawing);
export const Chips = prop('Chips', ChipsDrawing);
export const BlanketFort = prop('BlanketFort', BlanketFortDrawing);
export const Suitcase = prop('Suitcase', SuitcaseDrawing);
export const Letter = prop('Letter', LetterDrawing);
export const MondayPad = prop('MondayPad', MondayPadDrawing);
