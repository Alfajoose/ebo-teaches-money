import React from 'react';
import {Prop} from '../prop';
import {C, FONT} from '../theme';

/**
 * Props and set pieces for Ep 10 (Marry a Woman Who…): one house, two builders, a storm. Each is a prop
 * (prop.tsx): hand-drawn in the video, its own vector symbol in the Animate export.
 */
const S = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const MARKER = 'EboMarker';
const BRICK = '#C9623F';
const MORTAR = '#E9DCC6';

/** One brick (origin at its centre). */
const BrickDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-60} y={-28} width={120} height={56} rx={6} fill={BRICK} {...S} strokeWidth={6} />
    <path d="M -40 -12 l 14 0 M 18 8 l 16 0" stroke="#A84B2D" strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** A brick wall `rows` high and `w` wide, growing up from (0,0) (origin at the bottom centre). `crack`: a zigzag crack. */
const BrickWallDrawing: React.FC<{x?: number; y?: number; w?: number; rows?: number; crack?: boolean}> = ({x = 0, y = 0, w = 560, rows = 4, crack = false}) => {
  const bw = 80;
  const bh = 40;
  const h = rows * bh;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`wall-${w}-${rows}`}>
          <rect x={-w / 2} y={-h} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={MORTAR} />
      <g clipPath={`url(#wall-${w}-${rows})`}>
        {Array.from({length: rows}, (_, r) =>
          Array.from({length: Math.ceil(w / bw) + 2}, (_, c) => (
            <rect key={`${r}-${c}`} x={-w / 2 + c * bw - (r % 2 ? bw / 2 : 0) + 3} y={-(r + 1) * bh + 3} width={bw - 6} height={bh - 6} rx={3} fill={BRICK} />
          )),
        )}
      </g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="none" {...S} />
      {crack && <path d={`M ${w * 0.12} ${-h} l -30 ${h * 0.2} l 40 ${h * 0.15} l -50 ${h * 0.2} l 34 ${h * 0.2} l -20 ${h * 0.25}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />}
    </g>
  );
};

/** A plain, solid brick house (origin at the bottom centre). `lights`: warm windows; `patch`: a patch on the roof; `leak`: a drip. */
const HouseDrawing: React.FC<{x?: number; y?: number; lights?: boolean; patch?: boolean; leak?: boolean}> = ({x = 0, y = 0, lights = true, patch = false, leak = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <BrickWallDrawing w={560} rows={10} />
    <path d="M -320 -400 L 0 -640 L 320 -400 Z" fill="#7A4A35" {...S} />
    {patch && <rect x={90} y={-540} width={90} height={60} rx={6} fill="#B8B2A6" {...S} strokeWidth={5} transform="rotate(-36 135 -510)" />}
    {[-170, 170].map((wx) => (
      <g key={wx}>
        <rect x={wx - 60} y={-320} width={120} height={110} rx={6} fill={lights ? '#FFE07A' : '#9DB4C9'} {...S} />
        <path d={`M ${wx} -320 L ${wx} -210 M ${wx - 60} -265 L ${wx + 60} -265`} stroke={C.ink} strokeWidth={6} />
      </g>
    ))}
    <rect x={-60} y={-190} width={120} height={190} rx={8} fill="#5A3A22" {...S} />
    <circle cx={34} cy={-90} r={8} fill="#F2C230" />
    {leak && <path d="M 135 -380 q -14 24 0 34 q 14 -10 0 -34 Z" fill="#6BB7E8" stroke={C.ink} strokeWidth={4} />}
  </g>
);

/** The neighbours' house: a gorgeous painted front, propped up by sticks with nothing behind it.
 * `tilt`: it leans; `fallen`: a heap of curtains and sticks on the ground. Origin at the bottom centre. */
const FakeFrontDrawing: React.FC<{x?: number; y?: number; tilt?: number; fallen?: boolean; side?: boolean}> = ({x = 0, y = 0, tilt = 0, fallen = false, side = false}) =>
  fallen ? (
    <g transform={`translate(${x} ${y})`}>
      {[-180, -60, 70, 190].map((sx, i) => (
        <line key={sx} x1={sx - 60} y1={-10 - i * 6} x2={sx + 70} y2={-60 + i * 10} stroke="#8A5A2B" strokeWidth={14} strokeLinecap="round" />
      ))}
      <path d="M -230 0 Q -170 -110 -90 -40 Q -30 -120 40 -30 Q 110 -110 200 -10 L 220 0 Z" fill="#E86A92" {...S} />
      <path d="M -150 -30 q 20 -40 40 0 M 60 -30 q 20 -40 40 0" fill="none" stroke="#B8335E" strokeWidth={6} />
    </g>
  ) : (
    <g transform={`translate(${x} ${y}) rotate(${tilt} 0 0)`}>
      {side && (
        <g>
          <line x1={-200} y1={-560} x2={-60} y2={0} stroke="#8A5A2B" strokeWidth={14} strokeLinecap="round" />
          <line x1={200} y1={-560} x2={60} y2={0} stroke="#8A5A2B" strokeWidth={14} strokeLinecap="round" />
        </g>
      )}
      <path d="M -290 0 L -290 -420 L 0 -660 L 290 -420 L 290 0 Z" fill="#F7B6CB" {...S} />
      <path d="M -290 -420 L 0 -660 L 290 -420" fill="none" stroke="#B8335E" strokeWidth={16} strokeLinejoin="round" />
      {[-160, 160].map((wx) => (
        <g key={wx}>
          <rect x={wx - 70} y={-340} width={140} height={130} rx={8} fill="#BFE3F5" {...S} />
          <path d={`M ${wx - 70} -340 Q ${wx - 40} -270 ${wx - 64} -210 L ${wx - 70} -210 Z M ${wx + 70} -340 Q ${wx + 40} -270 ${wx + 64} -210 L ${wx + 70} -210 Z`} fill="#E5484D" stroke={C.ink} strokeWidth={4} />
          <rect x={wx - 80} y={-206} width={160} height={30} rx={6} fill="#8A5A2B" {...S} strokeWidth={5} />
          {[-50, 0, 50].map((f) => (
            <circle key={f} cx={wx + f} cy={-212} r={13} fill={f ? '#F2C230' : '#E5484D'} stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
      ))}
      <rect x={-56} y={-180} width={112} height={180} rx={50} fill="#4E9A8A" {...S} />
      <circle cx={0} cy={-500} r={40} fill="#BFE3F5" {...S} strokeWidth={6} />
    </g>
  );

/** A storm cloud with rain (origin at the cloud's centre). */
const StormDrawing: React.FC<{x?: number; y?: number; w?: number; rainTo?: number}> = ({x = 0, y = 0, w = 900, rainTo = 1200}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: 22}, (_, i) => {
      const rx = -w / 2 + 30 + ((i * 97) % (w - 60));
      const ry = 60 + ((i * 53) % 200);
      return <line key={i} x1={rx} y1={ry} x2={rx - 24} y2={ry + Math.min(rainTo, 120)} stroke="#6BB7E8" strokeWidth={6} strokeLinecap="round" opacity={0.85} />;
    })}
    <path d={`M ${-w / 2} 40 Q ${-w / 2 - 40} -60 ${-w / 2 + 80} -80 Q ${-w / 4} -200 ${-w / 12} -110 Q ${w / 8} -220 ${w / 3} -100 Q ${w / 2 + 50} -90 ${w / 2} 40 Z`} fill="#7D8597" {...S} />
  </g>
);

/** A sun (origin at its centre). */
const SunDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: 10}, (_, i) => (
      <line key={i} x1={0} y1={-100} x2={0} y2={-140} stroke="#F2C230" strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 36})`} />
    ))}
    <circle r={80} fill="#FFD95A" {...S} />
  </g>
);

/** A phone showing a fight posted online: LIVE, angry faces, the comments piling up. */
const PostedPhoneDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-130} y={-230} width={260} height={460} rx={34} fill="#2B2B2B" {...S} />
    <rect x={-108} y={-196} width={216} height={390} rx={12} fill="#fff" />
    <rect x={-96} y={-184} width={84} height={36} rx={8} fill="#E5484D" />
    <text x={-54} y={-158} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff">
      LIVE
    </text>
    <rect x={-96} y={-136} width={192} height={150} rx={10} fill="#F7B6CB" stroke={C.ink} strokeWidth={4} />
    <path d="M -50 -40 l 20 -20 l 20 20 M 10 -40 l 20 -20 l 20 20" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <path d="M -60 -100 l 30 12 M 60 -100 l -30 12" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    {[40, 84, 128].map((ly, i) => (
      <g key={ly}>
        <circle cx={-80} cy={ly} r={14} fill={['#7BC47F', '#6BB7E8', '#F2C230'][i]} />
        <rect x={-58} y={ly - 9} width={130 - i * 26} height={18} rx={8} fill="#D9D3C7" />
      </g>
    ))}
    <text x={92} y={176} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#E5484D">
      2.4k comments
    </text>
  </g>
);

/** A bucket (catching the drip). */
const BucketDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -70 -90 Q 0 -170 70 -90" fill="none" stroke={C.ink} strokeWidth={8} />
    <path d="M -80 -90 L 80 -90 L 62 60 L -62 60 Z" fill="#9AA1AC" {...S} />
    <ellipse cx={0} cy={-90} rx={80} ry={16} fill="#6BB7E8" {...S} strokeWidth={6} />
  </g>
);

/** A hammer. */
const HammerDrawing: React.FC<{x?: number; y?: number; rotate?: number}> = ({x = 0, y = 0, rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={-12} y={-60} width={24} height={200} rx={8} fill="#B27A47" {...S} strokeWidth={6} />
    <path d="M -80 -100 L 60 -100 L 80 -70 L 60 -40 L -80 -40 Z" fill="#6B7280" {...S} />
  </g>
);

/** A plot of land: pegs and string marking out a house. Origin at the middle of the front string. */
const PlotDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -300 0 L -220 -80 L 220 -80 L 300 0 Z" fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="16 12" />
    {[[-300, 0], [-220, -80], [220, -80], [300, 0]].map(([px, py]) => (
      <rect key={px} x={px - 8} y={py - 50} width={16} height={56} fill="#B27A47" stroke={C.ink} strokeWidth={4} />
    ))}
  </g>
);

/** A kitchen table seen front on (origin at the floor, in the middle). */
const TalkTableDrawing: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={-250} width={520} height={34} rx={8} fill="#8B6A48" {...S} />
    <rect x={-230} y={-216} width={22} height={216} fill="#6E5236" {...S} strokeWidth={5} />
    <rect x={208} y={-216} width={22} height={216} fill="#6E5236" {...S} strokeWidth={5} />
    <rect x={-50} y={-300} width={44} height={50} rx={6} fill="#fff" {...S} strokeWidth={5} />
    <rect x={20} y={-300} width={44} height={50} rx={6} fill="#fff" {...S} strokeWidth={5} />
  </g>
);

/** A door, ajar by `open` (0 shut … 1 wide). Origin at the floor, hinge side left. */
const DoorDrawing: React.FC<{x?: number; y?: number; open?: number}> = ({x = 0, y = 0, open = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-420} width={210} height={420} fill="#3B2A1A" {...S} />
    <path d={`M 0 -420 L ${210 * (1 - open * 0.75)} ${-420 + open * 30} L ${210 * (1 - open * 0.75)} ${-open * 30} L 0 0 Z`} fill="#8A5A2B" {...S} />
    <circle cx={180 * (1 - open * 0.75)} cy={-210} r={9} fill="#F2C230" />
  </g>
);

/** A jagged shout bubble with a handwritten word. */
const ShoutDrawing: React.FC<{x?: number; y?: number; text?: string; rotate?: number}> = ({x = 0, y = 0, text = '!!', rotate = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d="M -150 -20 L -190 -80 L -110 -70 L -90 -130 L -30 -90 L 20 -140 L 50 -90 L 120 -120 L 110 -60 L 190 -50 L 140 0 L 190 50 L 110 60 L 120 120 L 50 90 L 10 140 L -30 90 L -100 120 L -100 60 L -180 50 Z" fill="#fff" {...S} />
    <text y={22} textAnchor="middle" fontFamily={MARKER} fontSize={60} fill="#E5484D">
      {text}
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

export const Brick = prop('Brick', BrickDrawing);
export const BrickWall = prop('BrickWall', BrickWallDrawing);
export const House = prop('House', HouseDrawing);
export const FakeFront = prop('FakeFront', FakeFrontDrawing);
export const Storm = prop('Storm', StormDrawing);
export const Sun = prop('Sun', SunDrawing);
export const PostedPhone = prop('PostedPhone', PostedPhoneDrawing);
export const Bucket = prop('Bucket', BucketDrawing);
export const Hammer = prop('Hammer', HammerDrawing);
export const Plot = prop('Plot', PlotDrawing);
export const TalkTable = prop('TalkTable', TalkTableDrawing);
export const Door = prop('Door', DoorDrawing);
export const Shout = prop('Shout', ShoutDrawing);
