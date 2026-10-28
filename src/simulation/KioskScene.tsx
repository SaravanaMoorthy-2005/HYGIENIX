import { memo, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RiggedHands } from '../components/three/RiggedHands';
import { SceneBoundary } from '../components/three/SceneBoundary';
import { stepsFor, type SimulationState, type Step, type Effect } from './protocol';

function Part({
  position,
  size,
  color = '#edf1f0',
  metal = 0,
  radius = 0.025,
  rotation,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  metal?: number;
  radius?: number;
  rotation?: [number, number, number];
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, ...size.map((n) => n * 0.49))}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={metal ? 0.28 : 0.3}
        envMapIntensity={metal ? 1.2 : 0.65}
      />
    </RoundedBox>
  );
}
function Sphere({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} scale={size} castShadow>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

function Screen({ state, step }: { state: SimulationState; step?: Step }) {
  const bucket = Math.round((state.progress / (step?.seconds || 1)) * 20);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 620;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0c3036';
    ctx.fillRect(0, 0, 900, 620);
    ctx.fillStyle = '#cae4da';
    ctx.font = '500 23px Inter, Arial';
    ctx.fillText('H Y G I E N E X', 45, 55);
    ctx.fillStyle = '#76bea5';
    ctx.font = '15px Inter, Arial';
    ctx.fillText('●  HX–01', 740, 55);
    ctx.strokeStyle = '#31554f';
    ctx.beginPath();
    ctx.moveTo(45, 80);
    ctx.lineTo(855, 80);
    ctx.stroke();
    ctx.textAlign = 'center';
    const complete = state.phase === 'completed',
      active = state.phase === 'session';
    ctx.fillStyle = '#79b79e';
    ctx.font = '18px Inter, Arial';
    ctx.fillText(
      active
        ? `${state.method === 'handwash' ? 'HANDWASH' : 'SANITIZER'}  /  STEP ${state.index + 1}`
        : complete
          ? 'ALL STEPS COMPLETE'
          : 'PERSONAL HYGIENE STATION',
      450,
      135,
    );
    ctx.fillStyle = '#f1f8ed';
    ctx.font = '500 42px Inter, Arial';
    ctx.fillText(
      active
        ? step!.title
        : complete
          ? 'Process completed'
          : state.phase === 'approach'
            ? 'Welcome to Hygienex'
            : 'Hello, Dr. Maha!',
      450,
      205,
      810,
    );
    ctx.fillStyle = '#85d2ac';
    ctx.font = '96px Arial';
    if (!active) ctx.fillText(state.phase === 'approach' ? '⌁' : '✓', 450, 360);
    ctx.fillStyle = '#a9c9b8';
    ctx.font = '23px Inter, Arial';
    ctx.fillText(
      active
        ? 'Follow the movement. We’ll guide you.'
        : complete
          ? 'Thank you for taking care.'
          : state.phase === 'approach'
            ? 'Present your staff RFID card'
            : 'Choose your hygiene method',
      450,
      454,
    );
    ctx.fillStyle = '#31594f';
    ctx.fillRect(150, 505, 600, 5);
    ctx.fillStyle = '#8bd3ab';
    ctx.fillRect(150, 505, active ? bucket * 30 : complete ? 600 : 0, 5);
    ctx.font = '17px Inter, Arial';
    ctx.fillStyle = '#7baa96';
    ctx.fillText(
      active
        ? state.source === 'demo'
          ? 'ANIMATED DOCTOR DEMONSTRATION'
          : 'LIVE CAMERA  ·  FOLLOW ALONG'
        : 'HANDWASH       /       SANITIZER',
      450,
      560,
    );
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, [state.phase, state.method, state.index, state.source, step?.title, bucket]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group>
      <mesh position={[0, 2.245, 0.026]}>
        <planeGeometry args={[0.99, 0.68]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {state.phase === 'session' && (
        <Suspense fallback={null}>
          <group position={[0, 2.21, 0.065]} scale={0.06}>
            <RiggedHands
              technique={step!.technique}
              paused={state.paused}
              sideSwapSeconds={step!.seconds / 2}
            />
          </group>
        </Suspense>
      )}
    </group>
  );
}

function PrintedLabel({
  text,
  small = '',
  position,
  size,
  dark = false,
}: {
  text: string;
  small?: string;
  position: [number, number, number];
  size: [number, number];
  dark?: boolean;
}) {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.textAlign = 'center';
    ctx.fillStyle = dark ? '#a8dbbf' : '#426358';
    ctx.font = '500 45px Inter, Arial';
    ctx.fillText(text, 256, 84);
    ctx.font = '19px Inter, Arial';
    ctx.fillText(small, 256, 145);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [text, small, dark]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={map} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Flow({ effect, paused }: { effect: Effect; paused: boolean }) {
  const droplets = useRef<THREE.InstancedMesh>(null),
    ripples = useRef<THREE.Group>(null),
    time = useRef(0);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        offset: i / 46,
        x: Math.sin(i * 32.7) * 0.085,
        z: Math.cos(i * 4.9) * 0.055,
      })),
    [],
  );
  const outlet =
    effect === 'soap' ? -0.24 : effect === 'sanitizer' ? 0.24 : effect === 'air' ? 0.39 : 0;
  useFrame((_, dt) => {
    if (!paused) time.current += Math.min(dt, 0.05);
    if (!droplets.current) return;
    particles.forEach((p, i) => {
      const cycle = (time.current * (effect === 'air' ? 0.8 : 1.4) + p.offset) % 1;
      transform.position.set(
        outlet + p.x * (effect === 'air' ? 1.6 : 0.35 + cycle),
        (effect === 'air' ? 1.58 : 1.76) - cycle * (effect === 'air' ? 0.16 : 0.34),
        0.22 + p.z * (cycle + 0.2),
      );
      const radius = effect === 'soap' ? 0.009 : effect === 'sanitizer' ? 0.006 : 0.004;
      transform.scale.set(
        radius,
        effect === 'air' ? 0.028 : radius * (effect === 'water' ? 2.2 : 1.6),
        radius,
      );
      transform.updateMatrix();
      droplets.current!.setMatrixAt(i, transform.matrix);
    });
    droplets.current.instanceMatrix.needsUpdate = true;
    ripples.current?.children.forEach((object, i) => {
      const cycle = (time.current * 1.5 + i / 4) % 1;
      object.scale.setScalar(0.2 + cycle * 1.8);
      ((object as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.23;
    });
  });
  if (effect === 'none') return null;
  return (
    <group>
      <instancedMesh
        ref={droplets}
        args={[undefined, undefined, particles.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhysicalMaterial
          color={effect === 'soap' ? '#fff9e9' : effect === 'sanitizer' ? '#c4eee6' : '#b8e0ed'}
          transparent
          opacity={effect === 'air' ? 0.35 : 0.75}
          metalness={0.05}
          roughness={0.08}
          clearcoat={1}
        />
      </instancedMesh>
      {effect === 'water' && (
        <>
          {[-0.018, 0, 0.018].map((x, i) => (
            <mesh key={x} position={[x, 1.605, 0.22 + i * 0.008]}>
              <cylinderGeometry args={[0.004, 0.007, 0.31, 8]} />
              <meshPhysicalMaterial
                color="#c3e5ef"
                transparent
                opacity={0.42}
                roughness={0.08}
                clearcoat={1}
                depthWrite={false}
              />
            </mesh>
          ))}
          <group ref={ripples} position={[0, 1.466, 0.22]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.047, 0.051, 40]} />
                <meshBasicMaterial color="#e1f7fc" transparent opacity={0.2} depthWrite={false} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  );
}

function CompletionGlow({ paused }: { paused: boolean }) {
  const group = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (!paused) time.current += Math.min(dt, 0.05);
    group.current?.children.forEach((object, i) => {
      const phase = Math.max(0, (time.current - i * 0.3) / 3);
      object.scale.setScalar(1 + Math.min(1, phase) * 0.5);
      ((object as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
        phase < 1 ? Math.sin(Math.PI * phase) * 0.35 : 0;
    });
  });
  return (
    <group ref={group} position={[0, 0.012, 0.1]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.82, 0.835, 96]} />
          <meshBasicMaterial color="#51bd8a" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Foam({ active, paused }: { active: boolean; paused: boolean }) {
  const ref = useRef<THREE.Group>(null),
    time = useRef(0);
  useFrame((_, dt) => {
    if (!paused) time.current += dt;
    if (ref.current) ref.current.rotation.y = Math.sin(time.current * 2) * 0.2;
  });
  if (!active) return null;
  return (
    <group ref={ref} position={[0, 1.57, 0.45]}>
      {Array.from({ length: 25 }, (_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 12) * 0.18, Math.cos(i * 8) * 0.035, Math.sin(i * 3) * 0.09]}
        >
          <sphereGeometry args={[0.012 + (i % 4) * 0.003, 8, 8]} />
          <meshPhysicalMaterial color="white" transparent opacity={0.7} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Machine({ state }: { state: SimulationState }) {
  const step = state.method ? stepsFor(state.method)[state.index] : undefined;
  const active = state.phase === 'session';
  const hands = useRef<THREE.Group>(null);
  const handTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    if (!hands.current || state.paused) return;
    const effect = step?.effect;
    handTarget.set(
      effect === 'soap' ? -0.24 : effect === 'sanitizer' ? 0.24 : effect === 'air' ? 0.32 : 0,
      effect === 'air' ? 1.48 : 1.6,
      effect === 'air' ? 0.2 : 0.43,
    );
    hands.current.position.lerp(handTarget, 1 - Math.exp(-dt * 4));
  });
  return (
    <group>
      {/* Feet, service cabinet, inset access door and metal worktop. */}
      {[-0.49, 0.49].flatMap((x) =>
        [-0.22, 0.36].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.055, z]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.11, 20]} />
            <meshStandardMaterial color="#283838" />
          </mesh>
        )),
      )}
      <Part position={[0, 0.73, 0.03]} size={[1.16, 1.31, 0.77]} color="#d5dedd" radius={0.045} />
      <Part position={[0, 0.72, 0.427]} size={[1.015, 1.13, 0.025]} color="#82928f" radius={0.01} />
      <Part
        position={[0, 0.72, 0.446]}
        size={[0.997, 1.11, 0.022]}
        color="#edf0eb"
        radius={0.008}
      />
      <mesh position={[-0.4, 0.72, 0.464]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.01, 20]} />
        <meshStandardMaterial color="#6b7778" metalness={0.9} roughness={0.2} />
      </mesh>
      <Part position={[0, 1.37, 0.1]} size={[1.3, 0.105, 0.99]} color="#f4f5f0" radius={0.045} />
      <Part
        position={[0, 1.43, 0.16]}
        size={[0.92, 0.025, 0.62]}
        color="#9caeae"
        metal={0.85}
        radius={0.06}
      />
      <Part
        position={[0, 1.447, 0.16]}
        size={[0.77, 0.012, 0.48]}
        color="#566d70"
        metal={0.6}
        radius={0.075}
      />
      <Part
        position={[0, 1.45, 0.18]}
        size={[0.64, 0.012, 0.37]}
        color="#9db2b3"
        metal={0.75}
        radius={0.08}
      />
      <mesh position={[0, 1.46, 0.17]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 32]} />
        <meshStandardMaterial color="#344e54" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Part
          key={i}
          position={[(i - 2) * 0.018, 1.463, 0.17]}
          size={[0.006, 0.003, 0.075]}
          color="#b7c6c7"
          metal={0.8}
          radius={0.001}
        />
      ))}
      {/* Sculpted back and tablet housing, modeled after the supplied kiosk. */}
      <Part position={[0, 1.8, -0.235]} size={[1.17, 0.93, 0.24]} color="#aab9b6" radius={0.08} />
      <Part position={[0, 2.16, -0.155]} size={[1.24, 1.2, 0.23]} color="#f4f5f1" radius={0.09} />
      <Part
        position={[0, 2.25, -0.024]}
        size={[1.09, 0.78, 0.035]}
        color="#122c31"
        radius={0.035}
      />
      <Part position={[0, 2.245, 0]} size={[0.99, 0.68, 0.018]} color="#082c32" radius={0.014} />
      <Part
        position={[0, 2.718, -0.01]}
        size={[0.29, 0.095, 0.06]}
        color="#17272d"
        radius={0.022}
      />
      {[-0.075, 0, 0.075].map((x, i) => (
        <mesh key={x} position={[x, 2.722, 0.025]}>
          <sphereGeometry args={[i === 1 ? 0.024 : 0.013, 16, 16]} />
          <meshPhysicalMaterial
            color={i === 1 ? '#326780' : '#10212c'}
            metalness={0.5}
            roughness={0.1}
          />
        </mesh>
      ))}
      <Screen state={state} step={step} />
      {/* Spout, separate dosing outlets, speaker, RFID, air outlet. */}
      <Part position={[0, 1.79, -0.015]} size={[0.24, 0.14, 0.12]} color="#253c42" radius={0.015} />
      <Part
        position={[0, 1.79, 0.17]}
        size={[0.19, 0.075, 0.35]}
        color="#b1c0c0"
        metal={0.95}
        radius={0.015}
      />
      {[-0.24, 0.24].map((x) => (
        <Part
          key={x}
          position={[x, 1.78, 0.11]}
          size={[0.07, 0.055, 0.19]}
          color="#a3b8b8"
          metal={0.8}
          radius={0.013}
        />
      ))}
      <Part
        position={[0.43, 1.78, 0.015]}
        size={[0.22, 0.2, 0.055]}
        color="#203639"
        radius={0.017}
      />
      <PrintedLabel
        text="(( • ))"
        small="RFID"
        position={[0.43, 1.79, 0.05]}
        size={[0.18, 0.13]}
        dark
      />
      <Part
        position={[0.4, 1.58, 0.02]}
        size={[0.23, 0.075, 0.12]}
        color="#5b7476"
        radius={0.012}
      />
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.45 + (i % 4) * 0.027, 1.72 + Math.floor(i / 4) * 0.027, -0.028]}
        >
          <circleGeometry args={[0.005, 8]} />
          <meshBasicMaterial color="#4a666b" />
        </mesh>
      ))}
      <Part
        position={[0, 1.51, -0.05]}
        size={[1.05, 0.012, 0.015]}
        color={state.phase === 'completed' ? '#4bd6a0' : '#3dbaa9'}
        radius={0.003}
      />
      <PrintedLabel
        text="H Y G I E N E X"
        small="TOUCHLESS CARE SYSTEM"
        position={[0, 0.24, 0.463]}
        size={[0.49, 0.15]}
      />
      <Flow effect={active && !state.paused ? step!.effect : 'none'} paused={state.paused} />
      {active && (
        <Suspense fallback={null}>
          <group ref={hands} position={[0, 1.6, 0.43]} rotation={[-1.1, 0, 0.1]} scale={0.135}>
            <RiggedHands
              technique={step!.technique}
              paused={state.paused}
              speed={1.2}
              sideSwapSeconds={step!.seconds / 2}
            />
          </group>
        </Suspense>
      )}
      <Foam
        active={active && state.method === 'handwash' && state.index >= 2 && state.index <= 7}
        paused={state.paused}
      />
    </group>
  );
}

function Doctor({ state }: { state: SimulationState }) {
  const group = useRef<THREE.Group>(null),
    legs = useRef<(THREE.Group | null)[]>([]),
    arms = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    if (!group.current || state.paused) return;
    const p = THREE.MathUtils.smoothstep(state.clock, 0, 5.8),
      walking = state.phase === 'approach';
    group.current.position.set(
      -1.6 + p * 1.7,
      walking ? Math.abs(Math.sin(state.clock * 5)) * 0.022 : 0,
      1.0 - p * 0.3,
    );
    group.current.rotation.y = -0.6 + p * 0.6;
    legs.current.forEach((g, i) => {
      if (g) g.rotation.x = walking ? Math.sin(state.clock * 5 + i * Math.PI) * 0.34 : 0;
    });
    arms.current.forEach((g, i) => {
      if (g)
        g.rotation.x = THREE.MathUtils.damp(
          g.rotation.x,
          walking ? Math.sin(state.clock * 5 + i * Math.PI) * -0.2 : i === 1 ? 2.2 : -0.1,
          5,
          dt,
        );
    });
  });
  return (
    <group ref={group} visible={state.phase === 'approach' || state.phase === 'rfid'}>
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          position={[side * 0.105, 0.88, 0]}
          ref={(g) => {
            legs.current[i] = g;
          }}
        >
          <Part position={[0, -0.29, 0]} size={[0.16, 0.61, 0.18]} color="#466d72" radius={0.07} />
          <Part
            position={[0, -0.72, 0.035]}
            size={[0.16, 0.3, 0.17]}
            color="#42666b"
            radius={0.05}
          />
          <Part
            position={[0, -0.82, -0.045]}
            size={[0.18, 0.1, 0.29]}
            color="#e7eeeb"
            radius={0.04}
          />
        </group>
      ))}
      <Part position={[0, 1.13, 0]} size={[0.45, 0.66, 0.25]} color="#fafaf5" radius={0.09} />
      <Part position={[0, 1.41, -0.14]} size={[0.18, 0.23, 0.015]} color="#4f9296" radius={0.006} />
      {[-1, 1].map((side) => (
        <Part
          key={side}
          position={[side * 0.1, 1.39, -0.145]}
          size={[0.095, 0.23, 0.022]}
          color="#e4ece7"
          rotation={[0, 0, side * -0.25]}
          radius={0.01}
        />
      ))}
      <Part
        position={[-0.13, 1.08, -0.14]}
        size={[0.12, 0.1, 0.012]}
        color="#d7e4df"
        radius={0.01}
      />
      {[1.14, 1.02, 0.91].map((y) => (
        <Sphere key={y} position={[0, y, -0.137]} size={[0.012, 0.012, 0.012]} color="#8a9f9d" />
      ))}
      <Sphere position={[0, 1.52, 0]} size={[0.07, 0.1, 0.07]} color="#bf8f73" />
      <Sphere position={[0, 1.72, 0]} size={[0.16, 0.21, 0.15]} color="#cfa183" />
      <Sphere position={[0, 1.8, 0.035]} size={[0.17, 0.16, 0.15]} color="#302f31" />
      <Sphere position={[0, 1.78, 0.18]} size={[0.09, 0.1, 0.09]} color="#302f31" />
      <Sphere position={[0, 1.69, -0.145]} size={[0.03, 0.035, 0.035]} color="#c28d72" />
      {[-0.057, 0.057].map((x) => (
        <Sphere
          key={x}
          position={[x, 1.744, -0.137]}
          size={[0.013, 0.014, 0.008]}
          color="#282e30"
        />
      ))}
      <Part
        position={[0, 1.635, -0.14]}
        size={[0.065, 0.012, 0.008]}
        color="#8e5b50"
        radius={0.003}
      />
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          position={[side * 0.27, 1.39, 0]}
          ref={(g) => {
            arms.current[i] = g;
          }}
        >
          <Part position={[0, -0.19, 0]} size={[0.14, 0.39, 0.17]} color="#f8f9f4" radius={0.06} />
          <Part
            position={[0, -0.43, -0.035]}
            size={[0.115, 0.21, 0.14]}
            color="#eef3ed"
            radius={0.045}
          />
          <Sphere position={[0, -0.56, -0.035]} size={[0.064, 0.095, 0.042]} color="#cfa183" />
          {i === 1 && (
            <group position={[0, -0.62, -0.085]}>
              <Part
                position={[0, 0, 0]}
                size={[0.13, 0.19, 0.008]}
                color="#f4faf3"
                radius={0.009}
              />
              <Part
                position={[0, 0.058, -0.008]}
                size={[0.12, 0.045, 0.004]}
                color="#289789"
                radius={0.002}
              />
              <PrintedLabel
                text="MAHA"
                small="DOCTOR · 042"
                position={[0, -0.02, -0.009]}
                size={[0.12, 0.07]}
              />
            </group>
          )}
        </group>
      ))}
      {/* Stethoscope and staff badge. */}
      <mesh position={[0.08, 1.29, -0.16]} scale={[0.06, 0.12, 0.06]}>
        <torusGeometry args={[1, 0.11, 8, 32, Math.PI * 1.6]} />
        <meshStandardMaterial color="#325459" />
      </mesh>
      <Sphere position={[0.13, 1.18, -0.17]} size={[0.027, 0.027, 0.012]} color="#a1b6ba" />
    </group>
  );
}

function CameraRig({ state }: { state: SimulationState }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(-0.4, 1.3, 0));
  const vectors = useMemo(() => ({ eye: new THREE.Vector3(), look: new THREE.Vector3() }), []);
  useFrame((_, dt) => {
    if (state.paused) return;
    const intro = state.phase === 'approach' || state.phase === 'rfid';
    const narrow = size.width / size.height < 0.85;
    const rubbing =
      state.phase === 'session' &&
      state.method &&
      stepsFor(state.method)[state.index].technique >= 0;
    vectors.eye.set(
      intro ? 3.9 : rubbing ? 1.9 : 2.7,
      intro ? 2.9 : rubbing ? 2.7 : 2.55,
      intro ? 6.3 : 5.3,
    );
    if (narrow) vectors.eye.multiplyScalar(1.22);
    vectors.look.set(intro ? -0.55 : 0.05, 1.36, 0);
    camera.position.lerp(vectors.eye, 1 - Math.exp(-dt * 1.15));
    target.current.lerp(vectors.look, 1 - Math.exp(-dt * 1.3));
    camera.lookAt(target.current);
  });
  return null;
}

function KioskSceneContent({ state }: { state: SimulationState }) {
  return (
    <SceneBoundary>
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        camera={{ position: [3.9, 2.9, 6.3], fov: 34 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      >
        <color attach="background" args={['#e6edeb']} />
        <fog attach="fog" args={['#e6edeb', 10, 22]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#f9fcff', '#8b9996', 0.85]} />
        <Environment resolution={256} frames={1}>
          <Lightformer position={[-3, 4, 3]} scale={[4, 7, 1]} intensity={3} />
          <Lightformer
            position={[4, 3, 2]}
            rotation={[0, -Math.PI / 3, 0]}
            scale={[3, 6, 1]}
            intensity={2}
          />
        </Environment>
        <directionalLight
          position={[-3, 7, 5]}
          intensity={2.6}
          castShadow
          shadow-mapSize={[1536, 1536]}
          shadow-bias={-0.0002}
          shadow-normalBias={0.006}
          shadow-radius={3}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <directionalLight position={[4, 3, -3]} intensity={1.1} color="#d3e4ee" />
        <CameraRig state={state} />
        <Machine state={state} />
        <Doctor state={state} />
        {state.phase === 'completed' && <CompletionGlow paused={state.paused} />}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.009, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#e4ebe8" roughness={0.75} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0.15]}>
          <ringGeometry args={[1.5, 1.51, 100]} />
          <meshBasicMaterial color="#b0c6bf" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0.15]}>
          <ringGeometry args={[1.64, 1.645, 100]} />
          <meshBasicMaterial color="#c1d1cb" transparent opacity={0.4} />
        </mesh>
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.35}
          scale={9}
          blur={2.5}
          far={4}
          resolution={256}
          frames={1}
        />
      </Canvas>
    </SceneBoundary>
  );
}

// Camera observations and timer text must not rebuild the 3D tree on every frame.
export const KioskScene = memo(
  KioskSceneContent,
  ({ state: a }, { state: b }) =>
    a.phase === b.phase &&
    a.method === b.method &&
    a.source === b.source &&
    a.index === b.index &&
    a.paused === b.paused &&
    a.clock === b.clock &&
    Math.round(a.progress * 10) === Math.round(b.progress * 10),
);

export const HandGuide = memo(function HandGuide({
  technique,
  paused,
  seconds,
  detected = false,
}: {
  technique: number;
  paused: boolean;
  seconds: number;
  detected?: boolean;
}) {
  return (
    <SceneBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 6.3], fov: 37 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[-3, 4, 5]} intensity={3} />
        <directionalLight position={[3, 0, 2]} intensity={1.4} color="#cefff1" />
        <Suspense fallback={null}>
          <group rotation={[0.12, detected ? -0.3 : 0.2, 0]} position={[0, 0.1, 0]}>
            <RiggedHands technique={technique} paused={paused} sideSwapSeconds={seconds / 2} />
          </group>
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
});
