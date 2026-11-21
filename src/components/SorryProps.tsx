import React from 'react';
import {Prop} from '../prop';
import {C} from '../theme';

/**
 * Ep 13 sets and props, after the user's reference storyboard ("Someone Stepped on My Foot"): real places instead
 * of the notebook page. Hand-drawn style: ink outlines, flat warm colours, no text anywhere (house rule 25).
 * Sets are drawn in world space for the 1080×1920 frame with the floor at `FLOOR` (feet on it); things that move or
 * get handled are props (their own symbols in the Animate export).
 */
export const FLOOR = 1520;
const K = C.ink;
const ln = {stroke: K, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const thin = {...ln, strokeWidth: 4};
const prop = <P extends object>(name: string, Drawing: React.FC<P>): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <Prop name={name}>
      <Drawing {...props} />
    </Prop>
  );
  return Wrapped;
};

// ───────────────────────── sets ─────────────────────────

/** The street: a shop with a striped awning, brick buildings, a hydrant and a lamp post, the sidewalk and the kerb. */
export const SidewalkSet: React.FC<{dusk?: boolean}> = ({dusk}) => {
  const sky = dusk ? '#F7C99E' : '#EAF1F4';
  const wallA = dusk ? '#E7B48F' : '#F1D9C2';
  const wallB = dusk ? '#C98A6E' : '#D9A68A';
  return (
    <g>
      <rect x={-300} y={-300} width={1680} height={2600} fill={sky} />
      {dusk && <circle cx={820} cy={430} r={110} fill="#FFB061" stroke={K} strokeWidth={6} />}
      {/* far buildings */}
      <path d="M 380 1520 L 380 560 L 560 560 L 560 470 L 700 470 L 700 1520 Z" fill={dusk ? '#D9A88F' : '#E3E1DC'} {...thin} />
      {/* the shop, left */}
      <rect x={-60} y={300} width={460} height={1220} fill={wallA} {...ln} />
      {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={40 + c * 170} y={380 + r * 210} width={110} height={140} fill="#BFD9E6" {...thin} />))}
      <path d="M -60 860 L 400 860 L 440 960 L -60 960 Z" fill="#fff" {...ln} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-60 + i * 100} 860 L ${-10 + i * 100} 860 L ${40 + i * 100} 960 L ${-10 + i * 100} 960 Z`} fill={C.red} />)}
      <path d="M -60 860 L 400 860 L 440 960 L -60 960 Z" fill="none" {...ln} />
      <rect x={0} y={1010} width={260} height={360} fill="#BFD9E6" {...ln} />
      <rect x={290} y={1060} width={90} height={460} fill="#8A5A3C" {...ln} />
      {/* brick building, right */}
      <rect x={700} y={360} width={480} height={1160} fill={wallB} {...ln} />
      {[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={770 + c * 170} y={440 + r * 230} width={110} height={150} fill="#BFD9E6" {...thin} />))}
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M 710 ${420 + i * 180} l 40 0 M 1080 ${500 + i * 180} l 40 0`} {...thin} opacity={0.4} />)}
      {/* sidewalk and kerb */}
      <rect x={-300} y={FLOOR} width={1680} height={190} fill="#D8D5CF" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-80 + i * 300} ${FLOOR} l -60 190`} {...thin} />)}
      <rect x={-300} y={FLOOR + 190} width={1680} height={40} fill="#BDB8B0" {...ln} />
      <rect x={-300} y={FLOOR + 230} width={1680} height={900} fill="#8F8E92" />
      <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
      {/* lamp post and hydrant */}
      <path d={`M 640 ${FLOOR} L 640 640 Q 640 590 700 590 L 740 590`} {...ln} strokeWidth={12} fill="none" />
      <path d="M 720 590 l 60 0 l -10 34 l -40 0 Z" fill={dusk ? '#FFE07A' : '#F2EBD0'} {...ln} />
      <g transform={`translate(980 ${FLOOR})`}>
        <path d="M -38 0 L -38 -120 Q 0 -165 38 -120 L 38 0 Z" fill={C.red} {...ln} />
        <rect x={-58} y={-100} width={116} height={28} rx={10} fill={C.red} {...ln} />
      </g>
    </g>
  );
};

/** The restaurant: warm wall, a window, a framed picture, a wood floor. (The table is a prop, in front.) */
export const RestaurantSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#F2DCC4" />
    <rect x={-300} y={1140} width={1680} height={380} fill="#C98F63" {...ln} />
    <rect x={120} y={360} width={440} height={560} fill="#CFE3EC" {...ln} />
    <path d="M 340 360 L 340 920 M 120 640 L 560 640" {...ln} />
    <path d="M 160 920 L 160 760 L 230 760 L 230 700 L 300 700 L 300 920 M 380 920 L 380 680 L 520 680 L 520 920" {...thin} opacity={0.45} fill="none" />
    <rect x={700} y={420} width={240} height={180} fill="#F6E7B8" {...ln} />
    <path d="M 730 570 L 790 490 L 840 540 L 880 470 L 910 570 Z" fill="#9CC48A" {...thin} />
    <path d="M 760 260 L 760 330 M 700 330 L 820 330 L 790 380 L 730 380 Z" {...ln} fill="#F3D27A" />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#B07A52" />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M -300 ${FLOOR + 60 + i * 70} L 1380 ${FLOOR + 60 + i * 70}`} {...thin} opacity={0.35} />)}
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);

/** A restaurant table with a white cloth, two plates and a water glass (in front of the cast's legs). */
const RestaurantTableDrawing: React.FC<{x?: number; glass?: 'full' | 'empty' | 'none'}> = ({x = 540, glass = 'full'}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <path d="M -260 -330 L 260 -330 L 290 -120 Q 0 -90 -290 -120 Z" fill="#fff" {...ln} />
    <path d="M -200 -120 l 0 -170 M 0 -100 l 0 -200 M 200 -120 l 0 -170" {...thin} opacity={0.3} />
    <path d="M -40 -110 L -40 0 M 40 -110 L 40 0 M -100 0 L 100 0" {...ln} />
    <ellipse cx={-140} cy={-340} rx={70} ry={16} fill="#F7F4EE" {...thin} />
    <ellipse cx={130} cy={-340} rx={70} ry={16} fill="#F7F4EE" {...thin} />
    {glass !== 'none' && <g transform="translate(10 -340)"><WaterGlassDrawing full={glass === 'full'} /></g>}
  </g>
);
export const RestaurantTable = prop('RestaurantTable', RestaurantTableDrawing);

/** The office: back wall, a window with blinds, a filing cabinet, the door (open), a plant. (The desk is in front.) */
export const OfficeSet: React.FC<{sunny?: boolean}> = ({sunny}) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill={sunny ? '#F4EBD8' : '#E6E3DE'} />
    <rect x={540} y={380} width={380} height={460} fill={sunny ? '#FFF2C2' : '#CFE0EA'} {...ln} />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M 540 ${420 + i * 46} L 920 ${420 + i * 46}`} {...thin} />)}
    <g transform={`translate(-30 ${FLOOR})`}>
      <rect x={0} y={-860} width={300} height={860} fill="#F7F5F1" {...ln} />
      <path d="M 300 -860 L 380 -830 L 380 -20 L 300 0 Z" fill="#C79A6E" {...ln} />
      <circle cx={360} cy={-420} r={10} fill={K} />
    </g>
    <g transform={`translate(960 ${FLOOR})`}>
      <rect x={-90} y={-520} width={180} height={520} fill="#B9BEC6" {...ln} />
      {[0, 1, 2].map((i) => <g key={i}><rect x={-70} y={-500 + i * 170} width={140} height={140} fill="#C9CDD4" {...thin} /><rect x={-25} y={-450 + i * 170} width={50} height={14} rx={6} fill={K} /></g>)}
    </g>
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#A9B0B8" />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);

/** The boss's desk, front-on: wood top, a monitor, papers, a mug (drawn in front of whoever stands behind it). */
const OfficeDeskDrawing: React.FC<{x?: number; mug?: boolean}> = ({x = 680, mug = true}) => (
  <g transform={`translate(${x} ${FLOOR}) scale(0.62)`}>
    <rect x={-300} y={-420} width={600} height={60} fill="#C99B6B" {...ln} />
    <rect x={-280} y={-360} width={560} height={360} fill="#B6865A" {...ln} />
    <path d="M -280 -250 L 280 -250" {...thin} />
    <rect x={-40} y={-320} width={80} height={14} rx={6} fill={K} />
    <g transform="translate(150 -420)">
      <rect x={-90} y={-170} width={180} height={120} rx={8} fill="#2E333B" {...ln} />
      <rect x={-78} y={-158} width={156} height={96} rx={4} fill="#8FB7D9" />
      <path d="M -14 -50 L -22 0 L 22 0 L 14 -50" fill="#7A808A" {...ln} />
    </g>
    <g transform="translate(-150 -424)"><PapersDrawing /></g>
    {mug && <g transform="translate(-260 -424) scale(0.8)"><MugDrawing /></g>}
  </g>
);
export const OfficeDesk = prop('OfficeDesk', OfficeDeskDrawing);

/** The kitchen: pale wall, upper cabinets, a counter with a sink, the fridge, a window. (The table is in front.) */
export const KitchenSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#F5EAD0" />
    {[0, 1, 2].map((i) => <rect key={i} x={60 + i * 200} y={420} width={180} height={240} fill="#E9C99A" {...ln} />)}
    {[0, 1, 2].map((i) => <circle key={i} cx={130 + i * 200} cy={620} r={9} fill={K} />)}
    <rect x={20} y={960} width={640} height={50} fill="#D6D2CB" {...ln} />
    <rect x={40} y={1010} width={600} height={510} fill="#E9C99A" {...ln} />
    <path d="M 240 1010 L 240 1520 M 440 1010 L 440 1520" {...thin} />
    <path d="M 300 960 L 300 880 Q 300 850 330 850 L 370 850" {...ln} fill="none" />
    <rect x={720} y={500} width={300} height={1020} rx={22} fill="#F4F4F2" {...ln} />
    <path d="M 720 900 L 1020 900 M 760 600 l 0 200 M 760 960 l 0 260" {...ln} />
    <rect x={260} y={180} width={300} height={190} fill="#CFE3EC" {...ln} />
    <path d="M 410 180 L 410 370" {...ln} />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#D9B98F" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${-200 + i * 220} ${FLOOR} l -80 400`} {...thin} opacity={0.35} />)}
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);

/** The kitchen's round table with two chairs (front). */
const KitchenTableDrawing: React.FC<{x?: number; mug?: number}> = ({x = 540, mug}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <ellipse cx={0} cy={-330} rx={250} ry={50} fill="#C08A5C" {...ln} />
    <path d="M -250 -330 L -250 -300 Q 0 -240 250 -300 L 250 -330" fill="#A9744A" {...ln} />
    <path d="M 0 -270 L 0 0 M -110 0 L 110 0" {...ln} strokeWidth={14} />
    {mug !== undefined && <g transform={`translate(${mug} -360)`}><MugDrawing /></g>}
  </g>
);
export const KitchenTable = prop('KitchenTable', KitchenTableDrawing);

/** The living room with a couch far too big for him (the "I felt small" shot). */
export const LivingRoomSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#EFE3CF" />
    <rect x={380} y={420} width={320} height={220} fill="#F6E7B8" {...ln} />
    <path d="M 410 610 L 480 520 L 540 580 L 600 500 L 670 610 Z" fill="#B7CFA0" {...thin} />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#C9A47E" />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);
const BigCouchDrawing: React.FC<{x?: number; w?: number}> = ({x = 540, w = 980}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <rect x={-w / 2} y={-760} width={w} height={420} rx={70} fill="#E8D7BC" {...ln} />
    <rect x={-w / 2 + 90} y={-420} width={w - 180} height={190} rx={40} fill="#F0E2CA" {...ln} />
    <path d={`M ${-w / 6} -420 L ${-w / 6} -230 M ${w / 6} -420 L ${w / 6} -230`} {...thin} />
    <rect x={-w / 2 - 40} y={-540} width={170} height={420} rx={60} fill="#E2CFB1" {...ln} />
    <rect x={w / 2 - 130} y={-540} width={170} height={420} rx={60} fill="#E2CFB1" {...ln} />
    <rect x={-w / 2 + 20} y={-230} width={w - 40} height={130} rx={30} fill="#DCC6A6" {...ln} />
    <path d={`M ${-w / 2 + 60} -100 l -10 100 M ${w / 2 - 60} -100 l 10 100`} {...ln} strokeWidth={14} />
  </g>
);
export const BigCouch = prop('BigCouch', BigCouchDrawing);

/** A shop's automatic sliding doors (`open` 0..1) with the sensor box on top. */
export const AutoDoorSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#E2E6E9" />
    <rect x={60} y={380} width={960} height={1140} fill="#9AA3AC" {...ln} />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#CFCBC4" />
    <rect x={240} y={FLOOR} width={600} height={30} fill="#7E858D" {...ln} />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);
const AutoDoorsDrawing: React.FC<{open?: number}> = ({open = 0}) => {
  const d = 290 * open;
  return (
    <g>
      <rect x={250 - d} y={500} width={290} height={1020} fill="#CFE6F0" fillOpacity={0.75} {...ln} />
      <rect x={540 + d} y={500} width={290} height={1020} fill="#CFE6F0" fillOpacity={0.75} {...ln} />
      <path d={`M ${300 - d} 560 l 60 -40 M ${590 + d} 560 l 60 -40`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      <rect x={480} y={430} width={120} height={50} rx={10} fill="#3A3F46" {...ln} />
      <circle cx={540} cy={455} r={9} fill={open > 0 ? '#7CD67A' : '#E5484D'} />
    </g>
  );
};
export const AutoDoors = prop('AutoDoors', AutoDoorsDrawing);

/** The café: back wall, a menu board (squiggles, no words), the coffee machine. (The counter and till are in front.) */
export const CafeSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#EFE1CC" />
    <rect x={560} y={300} width={440} height={300} rx={14} fill="#2F3532" {...ln} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M 600 ${360 + i * 60} q 40 -16 80 0 t 80 0 M 860 ${360 + i * 60} l 90 0`} stroke="#F2EFE6" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    <rect x={80} y={700} width={420} height={40} fill="#B98A5E" {...ln} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={110 + i * 95} y={640} width={60} height={60} rx={8} fill={['#E8D2B0', '#F2F2F2', '#D9A27A', '#F2F2F2'][i]} {...thin} />)}
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#B08560" />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
  </g>
);
const CafeCounterDrawing: React.FC<{x?: number}> = ({x = 700}) => (
  <g transform={`translate(${x} ${FLOOR}) scale(0.62)`}>
    <rect x={-360} y={-470} width={720} height={50} fill="#C99B6B" {...ln} />
    <rect x={-340} y={-420} width={680} height={420} fill="#9C6B45" {...ln} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-340 + i * 170 + 85} -420 L ${-340 + i * 170 + 85} 0`} {...thin} opacity={0.4} />)}
    {/* the till */}
    <g transform="translate(-200 -470)">
      <path d="M -90 0 L -80 -90 L 90 -90 L 100 0 Z" fill="#7C838C" {...ln} />
      <path d="M -60 -90 L -40 -170 L 70 -170 L 60 -90 Z" fill="#3A3F46" {...ln} />
      <rect x={-26} y={-158} width={78} height={44} rx={4} fill="#9CD3A8" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-56 + c * 40} y={-74 + r * 22} width={26} height={14} rx={3} fill="#D7DADF" />))}
    </g>
    {/* the coffee machine */}
    <g transform="translate(180 -470)">
      <rect x={-110} y={-260} width={220} height={260} rx={16} fill="#BFC4CA" {...ln} />
      <rect x={-70} y={-200} width={140} height={60} rx={8} fill="#3A3F46" {...ln} />
      <path d="M -20 -140 L -20 -100 M 20 -140 L 20 -100" {...ln} />
      <g transform="translate(0 0) scale(0.7)"><MugDrawing /></g>
    </g>
  </g>
);
export const CafeCounter = prop('CafeCounter', CafeCounterDrawing);

// ───────────────────────── hand props ─────────────────────────

/** A brown leather dress shoe with laces (side view, toe to +x). */
const DressShoeDrawing: React.FC = () => (
  <g>
    <path d="M -150 -10 Q -160 -110 -90 -120 L 10 -120 Q 70 -110 120 -60 Q 190 -50 200 0 L 200 20 L -150 20 Z" fill="#8A5634" {...ln} />
    <path d="M -150 20 L 200 20 L 200 36 L -150 36 Z" fill="#3B2A20" {...ln} />
    <path d="M 0 -116 Q 40 -100 70 -74" {...ln} fill="none" />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${10 + i * 22} ${-108 + i * 12} l 24 14`} {...thin} />)}
    <path d="M -150 -40 Q -60 -30 30 -60" {...thin} fill="none" opacity={0.5} />
  </g>
);
export const DressShoe = prop('DressShoe', DressShoeDrawing);

/** A grey sneaker (side view, toe to +x). */
const SneakerDrawing: React.FC = () => (
  <g>
    <path d="M -150 0 Q -165 -120 -80 -125 L 0 -110 Q 60 -60 150 -50 Q 205 -40 205 0 Z" fill="#B7BBC2" {...ln} />
    <path d="M -155 0 L 205 0 L 200 34 L -150 34 Z" fill="#F4F4F2" {...ln} />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-10 + i * 26} ${-104 + i * 14} l 30 6`} {...thin} />)}
    <path d="M -120 -50 Q -40 -30 60 -46" stroke="#E5484D" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);
export const Sneaker = prop('Sneaker', SneakerDrawing);

/** A spiral notepad (pages blank) and a pencil. */
/** One handwritten note line on the notepad (a scribble, never a number), row i. */
export const noteLine = (i: number) => {
  const y = -54 + i * 22;
  let d = `M -50 ${y}`;
  for (let k = 0; k < 10; k++) d += ` q 5 ${k % 2 ? 7 : -7} 10 0`;
  return d;
};
/** A spiral notepad and a pencil. `notes`: handwritten lines on the page; `draw` (0..1): the last one being written. */
const NotepadDrawing: React.FC<{pencil?: boolean; notes?: number; draw?: number}> = ({pencil = true, notes = 0, draw = 1}) => (
  <g>
    <rect x={-70} y={-95} width={140} height={190} rx={8} fill="#fff" {...ln} />
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-50 + i * 20} cy={-95} r={8} fill="none" {...thin} />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M -50 ${-50 + i * 22} L 50 ${-50 + i * 22}`} stroke="#CFE0F2" strokeWidth={3} />)}
    {Array.from({length: Math.min(notes, 7)}, (_, i) => (
      <path key={i} d={noteLine(i)} fill="none" stroke="#2C3E70" strokeWidth={4} strokeLinecap="round" pathLength={1}
        strokeDasharray={i === notes - 1 && draw < 1 ? '1 1' : undefined} strokeDashoffset={i === notes - 1 && draw < 1 ? 1 - draw : undefined} />
    ))}
    {pencil && <g transform="translate(40 20) rotate(-35)">
      <rect x={-12} y={-110} width={24} height={150} fill="#F3C53F" {...thin} />
      <path d="M -12 40 L 0 70 L 12 40 Z" fill="#E8C9A0" {...thin} />
      <rect x={-12} y={-130} width={24} height={20} fill={C.pink} {...thin} />
    </g>}
  </g>
);
export const Notepad = prop('Notepad', NotepadDrawing);

/** A coffee mug with steam. */
const MugDrawing: React.FC<{steam?: boolean}> = ({steam = true}) => (
  <g>
    <path d="M -40 -90 L 40 -90 L 34 0 L -34 0 Z" fill="#F4F1EA" {...ln} />
    <path d="M 38 -70 Q 74 -64 62 -30 Q 54 -14 36 -18" fill="none" {...ln} />
    <ellipse cx={0} cy={-90} rx={40} ry={9} fill="#6E4A33" {...thin} />
    {steam && <path d="M -14 -110 q -12 -18 0 -36 M 12 -110 q -12 -18 0 -36" fill="none" {...thin} />}
  </g>
);
export const Mug = prop('Mug', MugDrawing);

/** A water glass (full or empty) on a coaster. */
const WaterGlassDrawing: React.FC<{full?: boolean; coaster?: boolean}> = ({full = true, coaster}) => (
  <g>
    {coaster && <ellipse cx={0} cy={2} rx={56} ry={12} fill="#C9A47E" {...thin} />}
    {full && <path d="M -33 -80 L 33 -80 L 28 0 L -28 0 Z" fill="#A9D6EE" />}
    <path d="M -38 -120 L 38 -120 L 28 0 L -28 0 Z" fill="none" {...ln} />
    <path d="M -24 -104 l 0 70" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
  </g>
);
export const WaterGlass = prop('WaterGlass', WaterGlassDrawing);

/** A smartphone; `down`: lying face-down on a desk. */
const SmartphoneDrawing: React.FC<{down?: boolean}> = ({down}) =>
  down ? (
    <g><path d="M -90 0 L -70 -24 L 90 -24 L 110 0 Z" fill="#2E333B" {...ln} /><rect x={-60} y={-20} width={20} height={10} rx={3} fill="#555C66" /></g>
  ) : (
    <g><rect x={-34} y={-66} width={68} height={132} rx={12} fill="#2E333B" {...ln} /><rect x={-26} y={-54} width={52} height={104} rx={4} fill="#8FB7D9" /></g>
  );
export const Smartphone = prop('Smartphone', SmartphoneDrawing);

/** A small stack of papers. */
const PapersDrawing: React.FC = () => (
  <g>
    <path d="M -70 0 L -60 -18 L 74 -18 L 66 0 Z" fill="#fff" {...thin} />
    <path d="M -64 -18 L -54 -34 L 78 -34 L 70 -18 Z" fill="#F7F5F1" {...thin} />
  </g>
);
export const Papers = prop('Papers', PapersDrawing);

/** A briefcase and a shoulder bag (the storyboard's passers-by). */
const BriefcaseDrawing: React.FC = () => (
  <g>
    <path d="M -24 -100 L -24 -120 L 24 -120 L 24 -100" fill="none" {...ln} />
    <rect x={-80} y={-100} width={160} height={110} rx={12} fill="#3B2A20" {...ln} />
    <path d="M -80 -60 L 80 -60" {...thin} stroke="#C99B6B" />
  </g>
);
export const Briefcase = prop('Briefcase', BriefcaseDrawing);
const ShoulderBagDrawing: React.FC = () => (
  <g>
    <path d="M -50 -60 Q 0 -200 50 -60" fill="none" {...ln} stroke="#8A5634" strokeWidth={10} />
    <path d="M -70 -60 L 70 -60 L 60 30 L -60 30 Z" fill="#B87A4B" {...ln} />
    <path d="M -70 -60 L 70 -60 L 50 -10 L -50 -10 Z" fill="#9C6238" {...ln} />
  </g>
);
export const ShoulderBag = prop('ShoulderBag', ShoulderBagDrawing);

/** The stomp, close: grey trousers and a dress shoe coming down on a sneaker (`l` = seconds into the shot). */
export const StompClose: React.FC<{l?: number; dusk?: boolean}> = ({l = 99, dusk}) => {
  const u = Math.min(1, l / 0.22);
  return (
    <g>
      <rect x={-300} y={-300} width={1680} height={2600} fill={dusk ? '#F2CDAA' : '#E9E6E0'} />
      <rect x={-300} y={1330} width={1680} height={900} fill={dusk ? '#C9A88E' : '#CFCBC4'} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${100 + i * 380} 1330 l -120 600`} {...thin} />)}
      <path d="M -300 1330 L 1380 1330" {...ln} />
      {/* his sneaker and leg */}
      <rect x={250} y={-300} width={170} height={1310} fill="#D3D6C8" {...ln} />
      <g transform="translate(360 1300) scale(1.7)"><SneakerDrawing /></g>
      {/* the stranger's trouser leg and dress shoe */}
      <g transform={`translate(0 ${-520 * (1 - u) ** 2})`}>
        <path d="M 560 -300 L 860 -300 L 840 1000 L 560 1010 Z" fill="#7C808A" {...ln} />
        <path d="M 600 -300 L 640 1000" {...thin} opacity={0.5} />
        <g transform="translate(650 1220) scale(1.85)"><DressShoeDrawing /></g>
      </g>
    </g>
  );
};

/** A wooden chair, front-on: the back shows above whoever sits in it (drawn behind them), the seat and legs below. */
export const ChairSet: React.FC<{x: number; tone?: string}> = ({x, tone = '#A8744A'}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <rect x={-120} y={-560} width={240} height={220} rx={22} fill={tone} {...ln} />
    <rect x={-90} y={-530} width={180} height={36} rx={10} fill="#C08A5C" {...thin} />
    <rect x={-140} y={-340} width={280} height={40} rx={10} fill={tone} {...ln} />
    <path d="M -120 -300 L -130 0 M 120 -300 L 130 0" {...ln} strokeWidth={14} />
  </g>
);

/** A waiter's round tray with a glass of water on it. */
const TrayDrawing: React.FC = () => (
  <g>
    <g transform="translate(0 -16)"><WaterGlassDrawing full /></g>
    <ellipse cx={0} cy={0} rx={110} ry={20} fill="#C9CDD4" {...ln} />
  </g>
);
export const Tray = prop('Tray', TrayDrawing);

/** A pencil on its own (tip at the origin, pointing down-left). */
const PencilDrawing: React.FC = () => (
  <g transform="rotate(-35) translate(0 -70)">
    <rect x={-12} y={-110} width={24} height={150} fill="#F3C53F" {...thin} />
    <path d="M -12 40 L 0 70 L 12 40 Z" fill="#E8C9A0" {...thin} />
    <rect x={-12} y={-130} width={24} height={20} fill={C.pink} {...thin} />
  </g>
);
export const Pencil = prop('Pencil', PencilDrawing);
