import React, {useMemo} from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {NoScaleContext} from '../noScale';
import {HandDrawnContext} from '../handDrawn';
import {RigCharacter} from '../cast/RigCharacter';
import {Pose} from '../components/Character';
import {POSE, frontOn, gentle} from '../cast/poses';
import {StageSizeContext} from './exportCtx';
import {VFPS, Word, lipFrame} from './kit';
import wordsJson from './data/ep10-words.json';
import envJson from './data/ep10-env.json';

/**
 * Ep 10 in three.js: a TEST of the cold open (shots 1–2, ~6 s). The world is real 3D (the pink house front on its
 * sticks, the ground, rain, storm light, a moving camera); our characters stay the 2D rigs, standing in it as flat
 * cutouts (drawn over the 3D canvas at the screen position and size of their spot in the world, with a shadow).
 */
export const EP10_3D_W = 1080;
export const EP10_3D_H = 1920;
const WORDS = wordsJson as (Word & {who: string})[];
const ENV = (envJson as Record<string, number[]>).ebo;
const at = (k: number) => WORDS[k].s;
export const EP10_3D_DURATION = Math.ceil((at(8) - 0.1) * VFPS);
const SHOT2 = at(0) - 0.1;
const FALL = 1.15; // the crash starts (s); it lands 0.42 s later
const LAND = FALL + 0.42;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => {
  const c = clamp(u);
  return c < 0.5 ? 2 * c * c : 1 - (-2 * c + 2) ** 2 / 2;
};
const lerp3 = (a: number[], b: number[], u: number) => a.map((v, i) => v + (b[i] - v) * u) as [number, number, number];

// ───────────────────────── the camera ─────────────────────────
const FOV = 40;
type Cam = {pos: [number, number, number]; look: [number, number, number]};
const camAt = (t: number): Cam => {
  if (t < SHOT2) {
    // shot 1: a slow low push toward the house; a shake when it lands
    const u = ease(t / SHOT2);
    const shake = t > LAND && t < LAND + 0.35 ? 0.08 * Math.sin((t - LAND) * 90) * (1 - (t - LAND) / 0.35) : 0;
    const pos = lerp3([-5.2, 1.4, 12.5], [-3.8, 1.6, 10.5], u);
    return {pos: [pos[0] + shake, pos[1] + shake * 0.6, pos[2]], look: [0.6, 2.2 - 1.3 * ease((t - FALL) / 0.8), 0]};
  }
  // shot 2: Ebo in the foreground under his umbrella, the fallen front behind him; a gentle push in
  const u = ease((t - SHOT2) / 3.2);
  return {pos: lerp3([0.1, 1.45, 8.4], [0.0, 1.4, 7.6], u), look: lerp3([0.25, 0.95, 0], [0.15, 0.95, 0], u)};
};
const makeCamera = (t: number) => {
  const c = camAt(t);
  const cam = new THREE.PerspectiveCamera(FOV, EP10_3D_W / EP10_3D_H, 0.1, 200);
  cam.position.set(...c.pos);
  cam.lookAt(new THREE.Vector3(...c.look));
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
};
/** Where a world point lands on screen, in pixels. */
const project = (cam: THREE.PerspectiveCamera, p: [number, number, number]) => {
  const v = new THREE.Vector3(...p).project(cam);
  return {x: (v.x * 0.5 + 0.5) * EP10_3D_W, y: (-v.y * 0.5 + 0.5) * EP10_3D_H};
};

// ───────────────────────── the world ─────────────────────────
const INK = '#1D1A1A';
/** A mesh with a black ink outline (an inverted hull), like the 2D line art. */
const Inked: React.FC<{geo: THREE.BufferGeometry; color: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number]; outline?: number}> = ({geo, color, position, rotation, scale, outline = 0.035}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={geo} castShadow receiveShadow>
      <meshToonMaterial color={color} />
    </mesh>
    <mesh geometry={geo} scale={[1 + outline, 1 + outline, 1 + outline]}>
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
  </group>
);

/** The pink house front: a gabled board 4 wide, windows with red curtains and flower boxes, a green door,
 * propped up from behind by two sticks. Origin at the bottom of its back face; it falls by `fall` (0…1) backwards. */
const PinkFront: React.FC<{fall: number; wobble: number}> = ({fall, wobble}) => {
  const front = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2, 0);
    s.lineTo(2, 0);
    s.lineTo(2, 2.9);
    s.lineTo(0, 4.5);
    s.lineTo(-2, 2.9);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, {depth: 0.16, bevelEnabled: false});
  }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const round = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 32), []);
  const stick = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 3.6, 10), []);
  const flower = useMemo(() => new THREE.SphereGeometry(1, 16, 12), []);
  const angle = -fall * (Math.PI / 2) + wobble;
  return (
    <group rotation={[angle, 0, 0]}>
      <Inked geo={front} color="#F7B6CB" />
      {/* roof trim */}
      {[-1, 1].map((sx) => (
        <Inked key={sx} geo={box} color="#B8335E" position={[sx, 3.72, 0.2]} rotation={[0, 0, -sx * Math.atan2(1.6, 2)]} scale={[2.62, 0.16, 0.12]} outline={0.05} />
      ))}
      {[-1.15, 1.15].map((x) => (
        <group key={x} position={[x, 1.95, 0.17]}>
          <mesh scale={[1.0, 0.9, 0.04]} geometry={box}><meshToonMaterial color="#BFE3F5" /></mesh>
          <mesh scale={[1.06, 0.96, 0.03]} position={[0, 0, -0.01]} geometry={box}><meshBasicMaterial color={INK} /></mesh>
          <mesh scale={[0.28, 0.9, 0.06]} position={[-0.38, 0, 0.02]} geometry={box}><meshToonMaterial color="#E5484D" /></mesh>
          <mesh scale={[0.28, 0.9, 0.06]} position={[0.38, 0, 0.02]} geometry={box}><meshToonMaterial color="#E5484D" /></mesh>
          <Inked geo={box} color="#8A5A2B" position={[0, -0.55, 0.14]} scale={[1.1, 0.18, 0.22]} outline={0.08} />
          {[-0.35, 0, 0.35].map((fx, i) => (
            <mesh key={fx} geometry={flower} scale={0.1} position={[fx, -0.42, 0.2]}><meshToonMaterial color={i === 1 ? '#E5484D' : '#F2C230'} /></mesh>
          ))}
        </group>
      ))}
      <group position={[0, 0.65, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={round} scale={[0.42, 0.06, 0.62]}><meshToonMaterial color="#4E9A8A" /></mesh>
      </group>
      <group position={[0, 3.45, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={round} scale={[0.28, 0.05, 0.28]}><meshToonMaterial color="#BFE3F5" /></mesh>
      </group>
      {/* the sticks holding it up, behind */}
      {fall < 0.15 && [-1.2, 1.2].map((x) => (
        <mesh key={x} geometry={stick} position={[x, 1.6, -0.9]} rotation={[0.55, 0, 0]} castShadow>
          <meshToonMaterial color="#8A5A2B" />
        </mesh>
      ))}
    </group>
  );
};

/** Rain: streaks falling through a box around the camera (deterministic in time). */
const Rain3D: React.FC<{t: number; center: [number, number, number]}> = ({t, center}) => {
  const N = 1400;
  const seeds = useMemo(() => {
    const r = new Float32Array(N * 3);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < N; i++) {
      r[i * 3] = (rnd() - 0.5) * 16;
      r[i * 3 + 1] = rnd() * 9;
      r[i * 3 + 2] = (rnd() - 0.5) * 16;
    }
    return r;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const x = center[0] + seeds[i * 3];
      const z = center[2] + seeds[i * 3 + 2];
      const y = ((seeds[i * 3 + 1] - t * 14) % 9 + 9) % 9;
      pos.set([x, y, z, x + 0.05, y + 0.42, z], i * 6);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [t, seeds, center]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#9CC9EC" transparent opacity={0.55} />
    </lineSegments>
  );
};

/** A storm cloud: a few flattened grey balls. */
const Cloud: React.FC<{position: [number, number, number]; s?: number}> = ({position, s = 1}) => {
  const ball = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);
  return (
    <group position={position} scale={s}>
      {[[0, 0, 0, 1.6], [1.5, -0.2, 0.3, 1.2], [-1.6, -0.25, 0.2, 1.2], [0.6, 0.5, -0.2, 1.1]].map(([x, y, z, r], i) => (
        <mesh key={i} geometry={ball} position={[x, y, z]} scale={[r, r * 0.55, r * 0.8]}>
          <meshToonMaterial color="#7D8597" />
        </mesh>
      ))}
    </group>
  );
};

/** A big blue umbrella over a spot on the ground (canopy at ~2 m). */
const Umbrella3D: React.FC<{position: [number, number, number]}> = ({position}) => {
  const canopy = useMemo(() => new THREE.SphereGeometry(1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), []);
  const handle = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8), []);
  return (
    <group position={position}>
      <Inked geo={canopy} color="#3E7CB1" position={[0, 1.68, 0]} scale={[0.68, 0.6, 0.68]} outline={0.04} />
      <mesh geometry={handle} position={[0, 1.2, 0]}><meshBasicMaterial color={INK} /></mesh>
    </group>
  );
};

const World: React.FC<{t: number; f: number}> = ({t}) => {
  const fall = t < FALL ? 0 : Math.min(1, ((t - FALL) / 0.42) ** 2);
  const wobble = t < FALL ? 0.035 * Math.sin(t * 9) : 0;
  // lightning: a flash on the cold-open thunder
  const flash = t > 0.1 && t < 0.32 ? (Math.floor((t - 0.1) / 0.05) % 2 ? 1 : 0.4) : 0;
  const ground = useMemo(() => new THREE.PlaneGeometry(60, 60), []);
  const puddle = useMemo(() => new THREE.CircleGeometry(1, 32), []);
  const shadow = useMemo(() => new THREE.CircleGeometry(1, 32), []);
  const cam = camAt(t);
  return (
    <>
      <color attach="background" args={[flash ? '#6A64A0' : '#2E2848']} />
      <fog attach="fog" args={['#2E2848', 9, 26]} />
      <ambientLight intensity={0.8 + flash * 1.5} color="#C8C2EE" />
      <directionalLight position={[-5, 9, 6]} intensity={1.3 + flash * 2} color="#E8E4FF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <mesh geometry={ground} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshToonMaterial color="#556F4C" />
      </mesh>
      {[[-1.5, 2.2, 1.1], [2.8, 1.5, 0.8], [-3.5, -1.5, 1.4]].map(([x, z, r], i) => (
        <mesh key={i} geometry={puddle} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]} scale={[r, r * 0.6, 1]}>
          <meshBasicMaterial color="#3C4F68" transparent opacity={0.8} />
        </mesh>
      ))}
      <group position={[0.6, 0, -0.08]}>
        <PinkFront fall={fall} wobble={wobble} />
      </group>
      <Cloud position={[0, 8.5, -5]} s={2.2} />
      <Cloud position={[-7, 8, -8]} s={1.8} />
      <Cloud position={[7, 9, -9]} s={2} />
      {t >= SHOT2 && (
        <group>
          {/* Ebo's spot: his shadow and his umbrella */}
          <mesh geometry={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[EBO_AT[0], 0.02, EBO_AT[2]]} scale={[0.45, 0.25, 1]}>
            <meshBasicMaterial color="#000" transparent opacity={0.35} />
          </mesh>
          <Umbrella3D position={[EBO_AT[0] - 0.32, 0, EBO_AT[2] - 0.05]} />
        </group>
      )}
      <Rain3D t={t} center={[cam.pos[0] + 2, 0, cam.pos[2] - 4]} />
    </>
  );
};

/** Ebo's spot in the world (shot 2), and his height in it. */
const EBO_AT: [number, number, number] = [-0.45, 0, 3.5];
const EBO_HEIGHT = 1.35;
/** The rig's own height in pixels at scale 1 (feet to the top of the head). */
const RIG_PX = (1036.8 - 321.2) * 0.68; // src/cast/data/measure.json bounds × the cast scale

export const Ep10ThreeTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / VFPS;
  const camera = makeCamera(t);
  const c = camAt(t);
  // Ebo as a cutout: where his feet land on screen, and how big 1.35 m is there
  const feet = project(camera, EBO_AT);
  const head = project(camera, [EBO_AT[0], EBO_HEIGHT, EBO_AT[2]]);
  const scale = (feet.y - head.y) / RIG_PX;
  const talking = (ENV[f] ?? 0) > 0.1;
  const pose = {...POSE.stand, eyes: t >= at(4) ? 'squint' : 'tired', mouth: 'flat', armR: [140, -10], armL: t >= at(6) ? [95, -6] : [14, 8], tilt: 1.2 * Math.sin(t * 2.1), lift: 2 * Math.sin(t * 2.9)} as Pose;
  return (
    <StageSizeContext.Provider value={{w: EP10_3D_W, h: EP10_3D_H}}>
      <NoScaleContext.Provider value>
        <HandDrawnContext.Provider value>
          <AbsoluteFill style={{background: '#2E2848'}}>
            <ThreeCanvas width={EP10_3D_W} height={EP10_3D_H} shadows camera={{fov: FOV, position: c.pos, near: 0.1, far: 200}} onCreated={({camera: cm}) => cm.lookAt(...c.look)}>
              <CameraRig pos={c.pos} look={c.look} />
              <World t={t} f={f} />
            </ThreeCanvas>
            {t >= SHOT2 && (
              <svg viewBox={`0 0 ${EP10_3D_W} ${EP10_3D_H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
                <RigCharacter who="ebo" x={feet.x} y={feet.y} scale={scale} t={f} pose={gentle(frontOn(pose))} mouthFrame={talking ? lipFrame(ENV, WORDS, f) : undefined} />
              </svg>
            )}
            <Html5Audio src={staticFile('ebo-ep10/voice.mp3')} />
            <Html5Audio src={staticFile('ebo-ep10/sfx.mp3')} />
          </AbsoluteFill>
        </HandDrawnContext.Provider>
      </NoScaleContext.Provider>
    </StageSizeContext.Provider>
  );
};

/** Moves the three.js camera every frame (react-three-fiber's default camera). */
const CameraRig: React.FC<{pos: [number, number, number]; look: [number, number, number]}> = ({pos, look}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  camera.updateMatrixWorld(true);
  return null;
};
