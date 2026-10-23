import React from 'react';
import {Easing} from 'remotion';
import {useSceneFrame} from '../sync';
import {Stage, Iris} from '../components/Stage';
import {Hallway, Office, FLOOR_Y} from '../backgrounds/Backgrounds';
import {Character, POSES, Pose, walkPose, mixPose} from '../components/Character';
import {VendingMachine} from '../components/VendingMachine';
import {Coin} from '../components/Money';
import {Invoice, Lightbulb, Spider, Calendar, SalesCounter, Impact} from '../components/Props';
import {Customer, customerFx} from './shared';
import {MX3, BX3_END, realityEndCamera} from './Scene3Reality';
import {C, FONT, kf, lin, pop, shake} from '../theme';

/** BEAT 4 — THE DISCOVERY (0:28–0:43). Setups: Hallway → Office. Local frames 0–450. */
const OFFICE_AT = 310;

export const Scene4Discovery: React.FC = () => {
  const t = useSceneFrame();
  return t < OFFICE_AT ? <HallwayPart t={t} /> : <OfficePart t={t - OFFICE_AT} />;
};

const BILLS = [
  {at: 18, x: 430, y: 390, r: -8, title: 'ELECTRICITY', amount: '-$40', color: C.red},
  {at: 36, x: 1490, y: 380, r: 7, title: 'MAINTENANCE', amount: '-$60', color: C.purple},
  {at: 54, x: 960, y: 330, r: -3, title: 'LOCATION FEE', amount: '-$100', color: C.blue},
];

const HallwayPart: React.FC<{t: number}> = ({t}) => {
  // ── Camera: pull back from the sad close-up, then follow the push ──
  const out = kf(t, [0, 16], [0, 1], Easing.inOut(Easing.cubic));
  let zoom = realityEndCamera.zoom + (1 - realityEndCamera.zoom) * out;
  let cx = realityEndCamera.cx + (960 - realityEndCamera.cx) * out;
  let cy = realityEndCamera.cy + (540 - realityEndCamera.cy) * out;
  if (t > 240) {
    cx = kf(t, [240, 300], [960, 1500]);
    zoom = kf(t, [240, 300], [1, 1.08]);
    cy = kf(t, [240, 300], [540, 560]);
  }
  const slams = BILLS.map((b) => t - b.at);
  const lastSlam = slams.filter((s) => s >= 0).sort((a, b) => a - b)[0];
  const shakeAmt = lastSlam !== undefined ? lin(lastSlam, [0, 10], [14, 0]) : 0;

  // ── Benny ──
  let bx = BX3_END;
  let mx = MX3;
  let pose: Pose = POSES.devastated;
  if (t < 120) {
    const jolt = lastSlam !== undefined && lastSlam < 8;
    pose = jolt ? {...POSES.shocked, lift: -10} : t > 18 ? {...POSES.disappointed, eyes: 'wide', mouth: 'wobbly', brows: 'sad', sweat: 1} : POSES.devastated;
  } else if (t < 222) {
    pose = {...POSES.disappointed, eyes: 'half', mouth: 'flat'};
  } else if (t < 244) {
    pose = mixPose(POSES.disappointed, {...POSES.happy, armR: [172, 0], armL: [12, 8], eyes: 'wide', mouth: 'o', brows: 'up', blush: 0}, lin(t, [222, 228], [0, 1]));
    bx = kf(t, [234, 244], [BX3_END, MX3 - 150 - 92]);
  } else {
    const p = kf(t, [248, 300], [0, 1], Easing.in(Easing.quad));
    mx = MX3 + p * 900;
    bx = mx - 150 - 92;
    const w = walkPose(t, {}, 0.5);
    pose = {...POSES.pushing, legL: w.legL, legR: w.legR, lift: w.lift};
  }

  const dim = lin(t, [112, 122, 212, 222], [0, 0.6, 0.6, 0]);
  const billsAway = kf(t, [110, 122], [0, 1], Easing.in(Easing.back(1.5)));
  const bennyScreenX = 960 + zoom * (bx - cx);

  return (
    <Stage
      zoom={zoom}
      cx={cx}
      cy={cy}
      shakeX={shake(t, shakeAmt, 3)}
      shakeY={shake(t + 7, shakeAmt, 2.6)}
      overlay={
        <g>
          {BILLS.map((b, i) => {
            const s = t < b.at ? 0 : pop(t, b.at, {damping: 12, stiffness: 260});
            const slam = t < b.at ? 0 : 1 + kf(t, [b.at, b.at + 5], [1.6, 0]);
            const bx2 = b.x + (960 - b.x) * billsAway;
            const by2 = b.y + (-400 - b.y) * billsAway;
            return <Invoice key={i} x={bx2} y={by2} rotate={b.r + billsAway * 90} scale={s * slam * 0.95} title={b.title} amount={b.amount} color={b.color} />;
          })}
          {dim > 0 && <rect x={0} y={0} width={1920} height={1080} fill={C.ink} opacity={dim} />}
          <ProfitCard t={t} />
          <Iris progress={kf(t, [294, 309], [0, 1])} x={Math.min(1700, Math.max(200, bennyScreenX))} y={560} />
        </g>
      }
    >
      <Hallway t={t} flicker />
      <Calendar x={520} y={430} day={7} month="JUN" />
      <VendingMachine x={mx} y={FLOOR_Y} t={t} fill={1} cobwebs={1} dust={1} display="$3.00" rotate={t > 248 ? Math.sin(t * 0.8) * 1.5 : 0} />
      <Spider x={MX3 + 70} y={60} drop={300} t={t} />
      {/* dust puffs while pushing */}
      {t > 250 &&
        [0, 1, 2].map((i) => {
          const life = ((t - 250 + i * 8) % 24) / 24;
          return <circle key={i} cx={bx - 40 - life * 80} cy={FLOOR_Y - 10 - life * 30} r={14 + life * 26} fill="#BDB3A2" opacity={(1 - life) * 0.8} />;
        })}
      <Character x={bx} y={FLOOR_Y} t={t} pose={pose} beard={1} />
      <Lightbulb x={BX3_END} y={350} scale={t >= 222 && t < 250 ? pop(t, 222) * lin(t, [244, 250], [1, 0]) : 0} t={t} />
    </Stage>
  );
};

/** "Revenue isn't profit" — the actual business lesson, shown as a simple equation. */
const ProfitCard: React.FC<{t: number}> = ({t}) => {
  if (t < 120 || t > 226) return null;
  const card = pop(t, 120, {damping: 14}) * kf(t, [214, 224], [1, 0]);
  const a = pop(t, 126);
  const b = pop(t, 142);
  const c = pop(t, 160, {damping: 8});
  const label = {fontFamily: FONT, fontWeight: 900 as const, textAnchor: 'middle' as const};
  // coins grow legs and walk off ("money visiting")
  const walk = lin(t, [178, 212], [0, 1]);
  return (
    <g transform={`translate(960 470) scale(${card})`}>
      <rect x={-760} y={-300} width={1520} height={600} rx={40} fill={C.paper} stroke={C.ink} strokeWidth={10} />
      {/* REVENUE */}
      <g transform={`translate(-500 0) scale(${a})`}>
        <text y={-200} {...label} fontSize={52} fill={C.ink}>
          REVENUE
        </text>
        {[0, 1, 2].map((i) => {
          const leave = walk > 0;
          const wx = leave ? walk * (1400 + i * 120) : 0;
          const hop = leave ? -Math.abs(Math.sin(t * 0.6 + i)) * 26 : 0;
          return (
            <g key={i} transform={`translate(${(i - 1) * 90 + wx} ${-10 + hop})`}>
              {leave && (
                <g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
                  <line x1={-10} y1={40} x2={-14 + Math.sin(t * 0.8 + i) * 10} y2={74} />
                  <line x1={10} y1={40} x2={14 - Math.sin(t * 0.8 + i) * 10} y2={74} />
                </g>
              )}
              <Coin r={46} />
              {leave && <rect x={30} y={10} width={34} height={26} rx={5} fill="#B5713F" stroke={C.ink} strokeWidth={4} />}
            </g>
          );
        })}
        <text y={150} {...label} fontSize={84} fill={C.moneyDark}>
          $3
        </text>
      </g>
      <text x={-250} y={30} {...label} fontSize={120} fill={C.ink} opacity={b}>
        −
      </text>
      {/* COSTS */}
      <g transform={`scale(${b})`}>
        <text y={-200} {...label} fontSize={52} fill={C.ink}>
          COSTS
        </text>
        {[C.red, C.purple, C.blue].map((col, i) => (
          <g key={i} transform={`translate(${(i - 1) * 50} ${-10 + i * 8}) rotate(${(i - 1) * 10}) scale(0.38)`}>
            <rect x={-130} y={-160} width={260} height={320} rx={8} fill={C.white} stroke={C.ink} strokeWidth={14} />
            <rect x={-130} y={-160} width={260} height={60} fill={col} stroke={C.ink} strokeWidth={14} />
          </g>
        ))}
        <text y={150} {...label} fontSize={84} fill={C.red}>
          $200
        </text>
      </g>
      <text x={250} y={30} {...label} fontSize={120} fill={C.ink} opacity={c}>
        =
      </text>
      {/* PROFIT */}
      <g transform={`translate(500 0) scale(${c})`}>
        <text y={-200} {...label} fontSize={52} fill={C.ink}>
          PROFIT
        </text>
        <Impact x={0} y={0} scale={0.9} color="#FFD7D3" rotate={-4} />
        <text y={34} {...label} fontSize={96} fill={C.red}>
          -$197
        </text>
      </g>
      <text y={260} {...label} fontSize={40} fill={C.gray} opacity={lin(t, [178, 186], [0, 1])}>
        revenue = money that's just visiting
      </text>
    </g>
  );
};

const OMX = 1000; // machine x in the office
const START = [12, 36, 58, 76, 92, 106, 118];

const OfficePart: React.FC<{t: number}> = ({t}) => {
  const zoom = kf(t, [0, 60, 140], [1.08, 1, 1.04]);
  const cx = kf(t, [0, 140], [1000, 1040]);

  let sales = 0;
  let dispense = -1;
  const coins: {x: number; y: number}[] = [];
  START.forEach((s) => {
    const fx = customerFx(t - s, OMX);
    if (fx.sold) sales += 2;
    if (fx.dispense >= 0) dispense = fx.dispense;
    if (fx.coin) coins.push(fx.coin);
  });
  // fast-forward montage at the end
  const ff = t > 110 ? Math.floor(Math.pow(lin(t, [110, 140], [0, 1]), 1.6) * 228) : 0;
  sales += ff;

  const happy = lin(t, [40, 90], [0, 1]);
  const bennyPose: Pose = t < 40 ? {...POSES.standing, mouth: 'o', brows: 'up', lookX: 10} : t < 100 ? {...POSES.happy, armL: [20, 10], armR: [60, -60], lookX: 10, blush: happy} : {...POSES.happy, eyes: 'dollar', armL: [150, 0], armR: [150, 0]};

  return (
    <Stage zoom={zoom} cx={cx} cy={560} overlay={<Iris progress={kf(t, [0, 14], [1, 0])} x={760} y={560} />}>
      <Office t={t} />
      <SalesCounter x={OMX} y={250} value={sales} scale={1 + (t > 110 ? 0.06 * Math.sin(t * 1.2) : 0)} />
      <VendingMachine x={OMX} y={FLOOR_Y} t={t} fill={1} dispense={dispense} glow={lin(t, [100, 130], [0, 0.6])} />
      <Character x={640} y={FLOOR_Y} t={t} pose={bennyPose} />
      {START.map((s, i) => (
        <Customer key={i} u={t - s} i={i} mx={OMX} floorY={FLOOR_Y} />
      ))}
      {coins.map((c, i) => (
        <Coin key={i} x={c.x} y={c.y} r={16} spin={t * 0.5} />
      ))}
      {t > 110 && (
        <g transform="translate(1500 250)" opacity={Math.sin(t * 0.5) > -0.3 ? 1 : 0.4}>
          <rect x={-130} y={-44} width={260} height={88} rx={16} fill={C.ink} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.yellow}>
            ▶▶ x10
          </text>
        </g>
      )}
    </Stage>
  );
};
