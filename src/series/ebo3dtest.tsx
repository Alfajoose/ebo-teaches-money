import React, {useMemo} from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Ebo3D} from '../cast/Ebo3D';
import {VFPS} from './kit';
import envJson from './data/ep10-env.json';

/**
 * Ebo 3D turnaround test (~7.5 s): a full slow turn on a turntable (every angle), then he faces camera, waves,
 * blinks, and says Ep 10's first line ("That house looked perfect. Here's why it fell.") with the real voice.
 */
export const EBO3D_DURATION = 230;
const ENV = (envJson as Record<string, number[]>).ebo;
const TALK = 120; // the line starts on this frame
const LINE_FROM = 2.12; // …taken from this second of Ep 10's voice

const Cam: React.FC = () => {
  const {camera} = useThree();
  camera.position.set(0, 0.95, 3.6);
  camera.lookAt(0, 0.68, 0);
  camera.updateMatrixWorld(true);
  return null;
};

export const Ebo3DTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / VFPS;
  const floor = useMemo(() => new THREE.CircleGeometry(1, 64), []);
  // a full turn over the first 3.3 s, easing in and out
  const u = Math.min(1, t / 3.3);
  const spin = (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2) * Math.PI * 2;
  // a wave between 3.4 s and 4.0 s
  const waving = t > 3.4 && t < 4.05;
  const armR: [number, number] = waving ? [140, -20 + 25 * Math.sin((t - 3.4) * 22)] : [10, 6];
  // blinks
  const blink = [1.6, 3.2, 5.9].some((b) => t > b && t < b + 0.12);
  // talking: the voice's loudness at this frame
  const vf = f - TALK + Math.round(LINE_FROM * VFPS);
  const talking = f >= TALK ? Math.min(1, (ENV[vf] ?? 0) * 1.4) : 0;
  const pointBack = f >= TALK + 62;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #FFF9EA 0%, #F9E9C4 60%, #EFD0AE 100%)'}}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{fov: 35, position: [0, 0.95, 3.6]}} gl={{alpha: true}}>
        <Cam />
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <mesh geometry={floor} rotation={[-Math.PI / 2, 0, 0]} scale={0.75} receiveShadow>
          <meshToonMaterial color="#EAD3A8" />
        </mesh>
        <mesh geometry={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} scale={0.3}>
          <meshBasicMaterial color="#000" transparent opacity={0.18} />
        </mesh>
        <group rotation={[0, spin, 0]}>
          <Ebo3D
            pose={{
              armR,
              armL: pointBack ? [80, -10] : [10, 6],
              lid: blink ? 1 : f >= TALK + 40 ? 0.5 : 0.45,
              lookX: pointBack ? 0.5 : 0,
              mouthOpen: talking,
              smile: !waving || true,
              headTilt: waving ? 6 * Math.sin((t - 3.4) * 11) : 1.5 * Math.sin(t * 2),
              lift: 0.01 * Math.sin(t * 3),
            }}
          />
        </group>
      </ThreeCanvas>
      <Sequence from={TALK}>
        <Html5Audio src={staticFile('ebo-ep10/voice.mp3')} trimBefore={Math.round(LINE_FROM * VFPS)} trimAfter={Math.round((LINE_FROM + 3.4) * VFPS)} />
      </Sequence>
    </AbsoluteFill>
  );
};
