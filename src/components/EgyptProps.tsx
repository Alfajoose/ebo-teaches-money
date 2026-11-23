import React from 'react';
import {Prop} from '../prop';
import {C} from '../theme';

/**
 * The Egypt short ("The Pharaoh's Anal Guardian"): costumes for the rigs, the sets and the props. Hand-drawn style,
 * ink outlines, flat colours, no text anywhere (house rule 25), wall paintings are figures only. Costumes are drawn
 * from a body part's own box (b = [x0, y0, x1, y1] in that part's space, see RigCharacter `dress`), so they fit any rig.
 */
export const FLOOR = 1520;
const K = C.ink;
const ln = {stroke: K, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const thin = {...ln, strokeWidth: 4};
const GOLD = '#E8B830';
const BLUE = '#2E5FA8';
const LINEN = '#F4EEDD';
const Piece: React.FC<{name: string; children: React.ReactNode}> = ({name, children}) => (
  <Prop name={name}>
    <g transform="translate(0 0)">{children}</g>
  </Prop>
);
const prop = <P extends object>(name: string, Drawing: React.FC<P>): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <Prop name={name}>
      <Drawing {...props} />
    </Prop>
  );
  return Wrapped;
};

// ───────────────────────── costumes ─────────────────────────
const box = (b: number[]) => ({x0: b[0], y0: b[1], x1: b[2], y1: b[3], w: b[2] - b[0], h: b[3] - b[1], cx: (b[0] + b[2]) / 2});

/** The pharaoh's nemes: blue-and-gold striped cloth over the crown, lappets down both sides, a gold band, the cobra. */
export const nemes = (b: number[]) => {
  const {x0, y0, x1, w, h, cx} = box(b);
  const top = y0 - h * 0.08;
  const band = y0 + h * 0.36;
  const d = `M ${x0 - w * 0.12} ${y0 + h * 1.0} L ${x0 - w * 0.06} ${band} Q ${cx} ${top - h * 0.12} ${x1 + w * 0.06} ${band} L ${x1 + w * 0.12} ${y0 + h * 1.0} L ${x1 - w * 0.06} ${y0 + h * 1.0} L ${x1 - w * 0.08} ${band + h * 0.12} Q ${cx} ${band - h * 0.02} ${x0 + w * 0.08} ${band + h * 0.12} L ${x0 + w * 0.06} ${y0 + h * 1.0} Z`;
  return (
    <g>
      <clipPath id="nemesClip"><path d={d} /></clipPath>
      <path d={d} fill={GOLD} />
      <g clipPath="url(#nemesClip)">
        {Array.from({length: 14}, (_, i) => <rect key={i} x={x0 - w * 0.2} y={top + i * h * 0.09} width={w * 1.4} height={h * 0.045} fill={BLUE} />)}
      </g>
      <path d={d} fill="none" {...ln} />
      <path d={`M ${x0 - w * 0.04} ${band + h * 0.02} Q ${cx} ${band - h * 0.1} ${x1 + w * 0.04} ${band + h * 0.02}`} fill="none" stroke={GOLD} strokeWidth={h * 0.06} />
      <path d={`M ${cx} ${band - h * 0.2} q ${w * 0.05} ${-h * 0.08} 0 ${-h * 0.16} q ${-w * 0.05} ${h * 0.06} 0 ${h * 0.16} Z`} fill={GOLD} {...thin} />
    </g>
  );
};
/** A broad collar of gold, turquoise and red rows over the chest. */
export const broadCollar = (b: number[]) => {
  const {x0, y0, w, h, cx} = box(b);
  const rows = ['#2FA8A0', GOLD, '#C8413A', GOLD];
  return (
    <g>
      {rows.map((c, i) => {
        const r = w * (0.36 + i * 0.07);
        return <path key={i} d={`M ${cx - r} ${y0 + h * 0.02} A ${r} ${h * (0.14 + i * 0.05)} 0 0 0 ${cx + r} ${y0 + h * 0.02}`} fill="none" stroke={c} strokeWidth={h * 0.05} />;
      }).reverse()}
      <path d={`M ${cx - w * 0.6} ${y0 + h * 0.02} A ${w * 0.6} ${h * 0.32} 0 0 0 ${cx + w * 0.6} ${y0 + h * 0.02}`} fill="none" {...thin} />
      <path d={`M ${x0} ${y0} L ${x0} ${y0}`} />
    </g>
  );
};
/** A white pleated kilt (shendyt) with a belt; `gold`: the pharaoh's gold belt and front panel. */
export const kilt = (gold = false) => (b: number[]) => {
  const {x0, y0, x1, w, h, cx} = box(b);
  const bot = y0 + h * 2.4;
  return (
    <g>
      <path d={`M ${x0 - w * 0.06} ${y0 + h * 0.1} L ${x1 + w * 0.06} ${y0 + h * 0.1} L ${x1 + w * 0.16} ${bot} L ${x0 - w * 0.16} ${bot} Z`} fill={LINEN} {...ln} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${x0 + w * (0.08 + i * 0.13)} ${y0 + h * 0.4} L ${x0 + w * (0.02 + i * 0.15)} ${bot - 4}`} stroke="#C9BFA4" strokeWidth={3} />)}
      {gold && <path d={`M ${cx - w * 0.14} ${y0 + h * 0.3} L ${cx + w * 0.14} ${y0 + h * 0.3} L ${cx + w * 0.2} ${bot} L ${cx - w * 0.2} ${bot} Z`} fill={GOLD} {...thin} />}
      <rect x={x0 - w * 0.08} y={y0} width={w * 1.16} height={h * 0.3} rx={4} fill={gold ? GOLD : '#8A6A42'} {...thin} />
    </g>
  );
};
/** The physician's long linen robe with a sash in his rank's colour. */
export const robe = (b: number[]) => {
  const {x0, y0, x1, w, h, cx} = box(b);
  return (
    <g>
      <path d={`M ${x0 + w * 0.05} ${y0 + h * 0.05} L ${x1 - w * 0.05} ${y0 + h * 0.05} L ${x1 + w * 0.05} ${y0 + h * 1.02} L ${x0 - w * 0.05} ${y0 + h * 1.02} Z`} fill={LINEN} {...ln} />
      <path d={`M ${x0 + w * 0.12} ${y0 + h * 0.1} L ${x1 - w * 0.1} ${y0 + h * 0.75}`} stroke="#3C8D6E" strokeWidth={h * 0.09} strokeLinecap="round" />
      <path d={`M ${cx} ${y0 + h * 0.05} L ${cx} ${y0 + h * 0.25}`} {...thin} />
    </g>
  );
};
/** The robe's skirt, to the knees. */
export const robeSkirt = (b: number[]) => {
  const {x0, y0, x1, w, h} = box(b);
  return <path d={`M ${x0 - w * 0.08} ${y0 + h * 0.1} L ${x1 + w * 0.08} ${y0 + h * 0.1} L ${x1 + w * 0.12} ${y0 + h * 3.0} L ${x0 - w * 0.12} ${y0 + h * 3.0} Z`} fill={LINEN} {...ln} />;
};
/** A plain linen head cloth (villagers, the physician): over the crown, tied at the back. */
export const headCloth = (color = LINEN) => (b: number[]) => {
  const {x0, y0, x1, w, h, cx} = box(b);
  // covers the whole crown (and any hat drawn into the head), its lower edge above the eyes
  return <path d={`M ${x0 - w * 0.06} ${y0 + h * 0.36} Q ${x0 - w * 0.04} ${y0 - h * 0.12} ${cx} ${y0 - h * 0.12} Q ${x1 + w * 0.04} ${y0 - h * 0.12} ${x1 + w * 0.06} ${y0 + h * 0.36} L ${x1 + w * 0.1} ${y0 + h * 0.56} L ${x1 - w * 0.06} ${y0 + h * 0.4} Q ${cx} ${y0 + h * 0.3} ${x0 + w * 0.06} ${y0 + h * 0.4} L ${x0 - w * 0.1} ${y0 + h * 0.56} Z`} fill={color} {...ln} />;
};
/** A villager's linen tunic over the shirt. */
export const tunic = (color = '#EADFC4') => (b: number[]) => {
  const {x0, y0, x1, w, h} = box(b);
  return <path d={`M ${x0 + w * 0.02} ${y0 + h * 0.06} L ${x1 - w * 0.02} ${y0 + h * 0.06} L ${x1 + w * 0.02} ${y0 + h} L ${x0 - w * 0.02} ${y0 + h} Z`} fill={color} {...ln} />;
};

/** Ready-made outfits for RigCharacter's `dress`. */
export const OUTFIT = {
  pharaoh: {head: nemes, chest: broadCollar, hips: kilt(true)},
  physician: {head: headCloth('#FFFFFF'), chest: robe, hips: robeSkirt},
  villager: {head: headCloth('#E4D3A8'), chest: tunic(), hips: kilt()},
  villagerB: {chest: tunic('#D9C8A0'), hips: kilt()},
};

// ───────────────────────── hand props ─────────────────────────
const CrookDrawing: React.FC = () => (
  <g>
    <path d="M 0 60 L 0 -120 Q 0 -170 -40 -170 Q -70 -170 -70 -140" fill="none" stroke={BLUE} strokeWidth={16} strokeLinecap="round" />
    {[-90, -50, -10, 30].map((y) => <path key={y} d={`M -8 ${y} l 16 0`} stroke={GOLD} strokeWidth={14} />)}
    <path d="M 0 60 L 0 -120 Q 0 -170 -40 -170 Q -70 -170 -70 -140" fill="none" {...thin} strokeWidth={3} />
  </g>
);
export const Crook = prop('Crook', CrookDrawing);
const ReedDrawing: React.FC<{long?: boolean}> = ({long}) => (
  <g>
    <path d={`M 0 0 L ${long ? 200 : 140} -12`} stroke="#9CB86A" strokeWidth={14} strokeLinecap="round" />
    <path d={`M 0 0 L ${long ? 200 : 140} -12`} stroke={K} strokeWidth={3} strokeDasharray="2 30" />
    <ellipse cx={long ? 200 : 140} cy={-12} rx={4} ry={6} fill="#5C7A3A" />
  </g>
);
export const Reed = prop('Reed', ReedDrawing);
const JugDrawing: React.FC<{steam?: boolean}> = ({steam = true}) => (
  <g>
    <path d="M -40 0 Q -60 -60 -30 -100 L -22 -130 L 22 -130 L 30 -100 Q 60 -60 40 0 Z" fill="#C9744A" {...ln} />
    <path d="M -30 -60 Q 0 -50 30 -60" fill="none" {...thin} />
    {steam && <path d="M -10 -150 q -14 -20 0 -40 M 12 -150 q -14 -20 0 -40" fill="none" {...thin} />}
  </g>
);
export const Jug = prop('Jug', JugDrawing);
const PlatterDrawing: React.FC = () => (
  <g>
    <ellipse cx={0} cy={0} rx={130} ry={24} fill={GOLD} {...ln} />
    <ellipse cx={-50} cy={-26} rx={36} ry={26} fill="#C8413A" {...thin} />
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={10 + (i % 3) * 22} cy={-26 - Math.floor(i / 3) * 20} r={13} fill="#7B4A8C" {...thin} />)}
    <path d="M 50 -20 q 30 -40 60 0 Z" fill="#E8D48A" {...thin} />
  </g>
);
export const Platter = prop('Platter', PlatterDrawing);

// ───────────────────────── sets ─────────────────────────
const Column: React.FC<{x: number; h?: number}> = ({x, h = 1000}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <rect x={-60} y={-h} width={120} height={h} fill="#E6D3A6" {...ln} />
    {[-30, 0, 30].map((d) => <path key={d} d={`M ${d} ${-h + 140} L ${d} -40`} {...thin} opacity={0.4} />)}
    <path d={`M -110 ${-h} Q -90 ${-h - 130} 0 ${-h - 150} Q 90 ${-h - 130} 110 ${-h} Z`} fill="#6FAF8E" {...ln} />
    <path d={`M -60 ${-h - 20} L -40 ${-h - 120} M 0 ${-h - 10} L 0 ${-h - 140} M 60 ${-h - 20} L 40 ${-h - 120}`} {...thin} />
    <rect x={-80} y={-40} width={160} height={40} fill="#D4BE8E" {...ln} />
  </g>
);
/** A wall painting: figures in profile, no writing. */
const WallPainting: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-200} y={-140} width={400} height={280} fill="#EBD9AE" {...ln} />
    {[-110, 0, 110].map((dx, i) => (
      <g key={i} transform={`translate(${dx} 0)`}>
        <circle cx={0} cy={-70} r={22} fill="#B5643C" {...thin} />
        <path d="M -18 -50 L 18 -50 L 22 40 L -22 40 Z" fill={i === 1 ? GOLD : '#F4EEDD'} {...thin} />
        <path d="M -22 40 L -26 100 M 22 40 L 26 100 M 18 -40 L 50 -10" {...thin} />
      </g>
    ))}
  </g>
);
const Torch: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -14 0 L 14 0 L 6 120 L -6 120 Z" fill="#7A5A3A" {...ln} />
    <path d="M 0 -80 Q 40 -30 0 0 Q -40 -30 0 -80 Z" fill="#F2A33A" {...thin} />
    <path d="M 0 -50 Q 18 -20 0 -4 Q -18 -20 0 -50 Z" fill="#FFE27A" />
  </g>
);
/** The throne room: sandstone walls, lotus columns, wall paintings, torches, the throne on its step. */
export const ThroneRoomSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#E9D4A4" />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#C9A66E" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${-300 + i * 260} ${FLOOR} l -80 400`} {...thin} opacity={0.3} />)}
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
    <Piece name="WallPainting"><WallPainting x={540} y={560} /></Piece>
    <Piece name="Columns"><Column x={110} /><Column x={970} /></Piece>
    <Piece name="Torches"><Torch x={290} y={700} /><Torch x={790} y={700} /></Piece>
  </g>
);
const ThroneDrawing: React.FC<{x?: number}> = ({x = 540}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <rect x={-300} y={-80} width={600} height={80} fill="#B88A4A" {...ln} />
    <rect x={-170} y={-560} width={340} height={480} rx={18} fill={GOLD} {...ln} />
    <rect x={-130} y={-520} width={260} height={300} rx={12} fill={BLUE} {...ln} />
    <path d="M -170 -260 L -220 -260 L -220 -80 M 170 -260 L 220 -260 L 220 -80" fill="none" {...ln} strokeWidth={14} />
  </g>
);
export const Throne = prop('Throne', ThroneDrawing);

/** The royal chamber: linen curtains, a low couch, jars of hot water. */
export const ChamberSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#E2C99A" />
    <rect x={-300} y={FLOOR} width={1680} height={900} fill="#B9925E" />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
    <Piece name="Curtains">
      <path d="M -40 260 Q 120 700 40 1520 L -300 1520 L -300 260 Z" fill="#F7F1E2" {...ln} />
      <path d="M 1120 260 Q 960 700 1040 1520 L 1380 1520 L 1380 260 Z" fill="#F7F1E2" {...ln} />
      <path d="M -300 240 L 1380 240" stroke={GOLD} strokeWidth={30} />
    </Piece>
    <Piece name="WaterJars">
      {[180, 280].map((x, i) => <g key={x} transform={`translate(${x} ${FLOOR})`}><path d={`M -50 0 Q -80 -90 -40 -150 L -30 -${180 + i * 10} L 30 -${180 + i * 10} L 40 -150 Q 80 -90 50 0 Z`} fill="#C9744A" {...ln} /><path d={`M -10 -${200 + i * 10} q -14 -20 0 -40 M 12 -${200 + i * 10} q -14 -20 0 -40`} fill="none" {...thin} /></g>)}
    </Piece>
  </g>
);
const CouchDrawing: React.FC<{x?: number}> = ({x = 640}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <rect x={-300} y={-260} width={600} height={120} rx={20} fill="#F4EEDD" {...ln} />
    <path d="M 220 -260 Q 320 -380 300 -140" fill="#E8B830" {...ln} />
    <path d="M -280 -140 L -280 0 M 280 -140 L 280 0" {...ln} strokeWidth={18} />
  </g>
);
export const RoyalCouch = prop('RoyalCouch', CouchDrawing);

/** The Nile village: mud-brick houses, palms, reeds on the bank, the river, pyramids far off. */
export const NileVillageSet: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#F3D9A4" />
    <circle cx={880} cy={330} r={90} fill="#FFD66B" {...ln} />
    <Piece name="Pyramids"><path d="M 560 980 L 700 760 L 840 980 Z M 780 980 L 880 840 L 980 980 Z" fill="#E3BE7A" {...thin} /></Piece>
    <rect x={-300} y={980} width={1680} height={160} fill="#5FA3C9" />
    <path d="M -300 1020 q 60 -14 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.6} />
    <rect x={-300} y={1140} width={1680} height={1200} fill="#D8B47A" />
    <path d={`M -300 ${FLOOR} L 1380 ${FLOOR}`} {...ln} />
    <Piece name="MudHouses">
      {[[60, 300], [330, 240]].map(([x, w]) => (
        <g key={x} transform={`translate(${x} ${FLOOR})`}>
          <rect x={0} y={-420} width={w} height={420} fill="#C98F5E" {...ln} />
          <rect x={w * 0.36} y={-200} width={w * 0.28} height={200} fill="#5A3A26" {...thin} />
          <rect x={w * 0.15} y={-360} width={w * 0.2} height={60} fill="#5A3A26" {...thin} />
        </g>
      ))}
    </Piece>
    <Piece name="Palms">
      {[640, 980].map((x) => (
        <g key={x} transform={`translate(${x} ${FLOOR})`}>
          <path d="M 0 0 Q -20 -300 10 -560" fill="none" stroke="#8A6A42" strokeWidth={26} strokeLinecap="round" />
          {[-60, -20, 20, 60, 100].map((a) => <path key={a} d="M 10 -560 Q 90 -620 170 -540" fill="none" stroke="#4E9A5A" strokeWidth={20} strokeLinecap="round" transform={`rotate(${a} 10 -560)`} />)}
        </g>
      ))}
    </Piece>
    <Piece name="Reeds">{Array.from({length: 14}, (_, i) => <path key={i} d={`M ${560 + i * 30} 1150 q ${(i % 3) * 8 - 8} -90 ${(i % 2) * 14 - 7} -160`} stroke="#6F9A4A" strokeWidth={7} fill="none" strokeLinecap="round" />)}</Piece>
  </g>
);
