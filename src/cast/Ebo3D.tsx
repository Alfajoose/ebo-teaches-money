import React, {useMemo} from 'react';
import * as THREE from 'three';

/**
 * Ebo in 3D, a "vinyl toy" build from smooth shapes, matched to the 2D master (cast/masters, src/cast/data/ebo.json):
 * skin #7E6143, cheek spot #583C2E, dark-teal tee #0D323B with short sleeves, light shorts #D0D4C5, bare legs,
 * no hands (house rule 16: the arm ends round). Ink outlines are inverted hulls, shading is toon.
 * Units: metres, feet on y = 0, facing +z, 1.35 m tall.
 */
const SKIN = '#7E6143';
const SPOT = '#583C2E';
const TEE = '#0D323B';
const SHORTS = '#D0D4C5';
const INK = '#1D1A1A';

export type Ebo3DPose = {
  /** [shoulder, elbow] in degrees, as the 2D rig: 0 = hanging down, + = out and up */
  armL?: [number, number];
  armR?: [number, number];
  /** 0 open … 1 closed (upper lids) */
  lid?: number;
  /** pupils: -1…1 */
  lookX?: number;
  lookY?: number;
  /** 0 shut … 1 wide open (talking) */
  mouthOpen?: number;
  smile?: boolean;
  headTilt?: number;
  /** whole-body bob (m) */
  lift?: number;
};

const Toon: React.FC<{geo: THREE.BufferGeometry; color: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number]; outline?: number}> = ({geo, color, position, rotation, scale, outline = 0.06}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={geo} castShadow>
      <meshToonMaterial color={color} />
    </mesh>
    {outline > 0 && (
      <mesh geometry={geo} scale={[1 + outline, 1 + outline, 1 + outline]}>
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
    )}
  </group>
);

const D2R = Math.PI / 180;

/** One arm from the shoulder: a teal sleeve, then a skin forearm ending round. `side` +1 = his left (+x). */
const Arm: React.FC<{side: 1 | -1; a: [number, number]; geo: {sleeve: THREE.BufferGeometry; arm: THREE.BufferGeometry}}> = ({side, a, geo}) => (
  <group position={[side * 0.235, 0.655, 0]} rotation={[0, 0, side * a[0] * D2R]}>
    <Toon geo={geo.sleeve} color={TEE} position={[0, -0.06, 0]} outline={0.08} />
    <group position={[0, -0.13, 0]} rotation={[0, 0, side * a[1] * D2R]}>
      <Toon geo={geo.arm} color={SKIN} position={[0, -0.11, 0]} outline={0.09} />
    </group>
  </group>
);

export const Ebo3D: React.FC<{pose?: Ebo3DPose}> = ({pose = {}}) => {
  const {armL = [10, 6], armR = [10, 6], lid = 0.35, lookX = 0, lookY = 0, mouthOpen = 0, smile = true, headTilt = 0, lift = 0} = pose;
  const g = useMemo(
    () => ({
      ball: new THREE.SphereGeometry(1, 40, 28),
      leg: new THREE.CapsuleGeometry(0.075, 0.17, 8, 20),
      shortLeg: new THREE.CylinderGeometry(0.1, 0.108, 0.13, 24),
      sleeve: new THREE.CapsuleGeometry(0.078, 0.07, 8, 20),
      arm: new THREE.CapsuleGeometry(0.058, 0.16, 8, 20),
      lidCap: new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      smile: new THREE.TorusGeometry(0.055, 0.009, 8, 24, Math.PI * 0.8),
      disc: new THREE.CircleGeometry(1, 32),
    }),
    [],
  );
  const eye = (side: 1 | -1) => lid >= 0.9 ? (
    // a shut eye: a curved ink line, as in the 2D blinks
    <group position={[side * 0.108, 1.0, 0.27]} rotation={[0, side * 0.34, 0]}>
      <mesh geometry={g.smile} rotation={[0, 0, Math.PI * 1.1]} scale={[1.4, 0.8, 1]}><meshBasicMaterial color={INK} /></mesh>
    </group>
  ) : (
    <group position={[side * 0.108, 1.03, 0.238]} rotation={[0, side * 0.34, 0]}>
      {/* the white */}
      <Toon geo={g.ball} color="#FFFFFF" scale={[0.1, 0.125, 0.055]} outline={0.1} />
      {/* the pupil */}
      <mesh geometry={g.ball} position={[lookX * 0.035, -0.02 + lookY * 0.035, 0.05]} scale={[0.028, 0.038, 0.012]}>
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* the upper lid: a skin cap over the top of the eye, closing downward */}
      <group rotation={[(-0.5 + 1.25 * lid) * Math.PI * 0.5, 0, 0]}>
        <mesh geometry={g.lidCap} scale={[0.106, 0.13, 0.062]}>
          <meshToonMaterial color={SKIN} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
  return (
    <group position={[0, lift, 0]}>
      {/* legs and round feet */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Toon geo={g.leg} color={SKIN} position={[s * 0.1, 0.17, 0]} outline={0.07} />
          <Toon geo={g.ball} color={SKIN} position={[s * 0.1, 0.05, 0.03]} scale={[0.085, 0.055, 0.11]} outline={0.08} />
        </group>
      ))}
      {/* shorts: a waist and two short legs */}
      <Toon geo={g.ball} color={SHORTS} position={[0, 0.39, 0]} scale={[0.21, 0.1, 0.165]} outline={0.04} />
      {[-1, 1].map((s) => (
        <Toon key={s} geo={g.shortLeg} color={SHORTS} position={[s * 0.1, 0.31, 0]} outline={0.06} />
      ))}
      {/* the tee */}
      <Toon geo={g.ball} color={TEE} position={[0, 0.535, 0]} scale={[0.225, 0.19, 0.175]} outline={0.04} />
      {/* arms */}
      <Arm side={1} a={armL} geo={g} />
      <Arm side={-1} a={armR} geo={g} />
      {/* the head */}
      <group position={[0, 0.66, 0]} rotation={[0, 0, headTilt * D2R]}>
        <group position={[0, -0.66, 0]}>
          <Toon geo={g.ball} color={SKIN} position={[0, 1.0, 0]} scale={[0.33, 0.315, 0.29]} outline={0.025} />
          {/* ears */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.33, 1.0, -0.01]}>
              <Toon geo={g.ball} color={SKIN} scale={[0.055, 0.1, 0.075]} outline={0.1} />
              <mesh geometry={g.ball} position={[s * 0.02, 0, 0.02]} scale={[0.02, 0.055, 0.04]}><meshToonMaterial color={SPOT} /></mesh>
            </group>
          ))}
          {/* cheek spots */}
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={g.ball} position={[s * 0.19, 0.93, 0.225]} rotation={[0, s * 0.7, 0]} scale={[0.03, 0.03, 0.012]}><meshToonMaterial color={SPOT} /></mesh>
          ))}
          {eye(1)}
          {eye(-1)}
          {/* the mouth: a smile line, or an open mouth while talking */}
          <group position={[0, 0.885, 0.285]}>
            {mouthOpen > 0.08 ? (
              <group>
                <mesh geometry={g.disc} scale={[0.05, 0.012 + 0.045 * mouthOpen, 1]}><meshBasicMaterial color="#940202" /></mesh>
                <mesh geometry={g.disc} position={[0, -0.01 * mouthOpen, 0.001]} scale={[0.03, 0.012 * mouthOpen, 1]}><meshBasicMaterial color="#F47C7B" /></mesh>
              </group>
            ) : (
              <mesh geometry={g.smile} rotation={[0, 0, smile ? Math.PI * 1.1 : Math.PI * 0.1]}><meshBasicMaterial color={INK} /></mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
