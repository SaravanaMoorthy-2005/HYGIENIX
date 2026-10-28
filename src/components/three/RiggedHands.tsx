import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';

function prepare(source: THREE.Group, side: number) {
  const scene = clone(source);
  scene.updateMatrixWorld(true);
  const wrist = scene.getObjectByName('wrist') as THREE.Bone;
  const origin = wrist.getWorldPosition(new THREE.Vector3());
  const names = ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger', 'thumb'];
  const chains = names.map((name) => {
    const suffixes =
      name === 'thumb'
        ? ['metacarpal', 'phalanx-proximal', 'phalanx-distal', 'tip']
        : ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'];
    const bones = suffixes.map(
      (suffix) => scene.getObjectByName(`${name}-${suffix}`) as THREE.Bone,
    );
    let parent: THREE.Object3D = wrist;
    bones.forEach((bone) => {
      parent.attach(bone);
      parent = bone;
    });
    return (name === 'thumb' ? bones : bones.slice(1)).slice(0, 3);
  });
  const rest = chains.map((chain) => chain.map((bone) => bone.quaternion.clone()));
  const material = new THREE.MeshPhysicalMaterial({
    color: side ? '#c58e72' : '#dfad8d',
    roughness: 0.58,
    clearcoat: 0.08,
  });
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.material = material;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    }
  });
  scene.position.sub(origin);
  const aligned = new THREE.Group();
  const direction = side === 0 ? -1 : 1;
  aligned.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().set(0, 0, direction, 0, 0, -1, 0, 0, direction, 0, 0, 0, 0, 0, 0, 1),
  );
  aligned.add(scene);
  const model = new THREE.Group();
  model.add(aligned);
  model.scale.setScalar(13);
  model.position.y = -0.65;
  const tips = names.map((name) => scene.getObjectByName(`${name}-tip`) as THREE.Bone);
  return { model, chains, rest, material, tips };
}

export function RiggedHands({
  technique = 0,
  paused = false,
  speed = 1,
  replay = 0,
  labels = false,
  sideSwapSeconds = 3,
}: {
  technique?: number;
  paused?: boolean;
  speed?: number;
  replay?: number;
  labels?: boolean;
  sideSwapSeconds?: number;
}) {
  const left = useGLTF('/assets/hands/left.glb'),
    right = useGLTF('/assets/hands/right.glb');
  const rigs = useMemo(
    () => [prepare(left.scene, 0), prepare(right.scene, 1)],
    [left.scene, right.scene],
  );
  const groups = useRef<(THREE.Group | null)[]>([]),
    time = useRef(0);
  const scratch = useMemo(
    () => ({
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      bend: new THREE.Quaternion(),
      axis: new THREE.Vector3(1, 0, 0),
      spreadAxis: new THREE.Vector3(0, 1, 0),
      spread: new THREE.Quaternion(),
      source: new THREE.Vector3(),
      target: new THREE.Vector3(),
      temp: new THREE.Vector3(),
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
    }),
    [],
  );
  useEffect(() => {
    time.current = 0;
  }, [technique, replay]);
  useEffect(
    () => () =>
      rigs.forEach((r) => {
        r.material.dispose();
        r.model.traverse((o) => {
          if (o instanceof THREE.SkinnedMesh) o.skeleton.dispose();
        });
      }),
    [rigs],
  );
  useFrame((_, dt) => {
    if (!paused && !scratch.reduced.matches) time.current += Math.min(dt, 0.05) * speed;
    const t = time.current,
      w = Math.sin(t * 3),
      phase = Math.floor(t / Math.max(1, sideSwapSeconds)) % 2 === 0,
      blend = 1 - Math.exp(-dt * 9);
    rigs.forEach((rig, i) => {
      const group = groups.current[i];
      if (!group) return;
      const sign = i === 0 ? 1 : -1;
      let x = sign * 0.21,
        y = sign * w * 0.18 + sign * 0.1,
        z = sign * 0.26,
        rx = 0.1,
        ry = i === 0 ? Math.PI + 0.2 : -0.2,
        rz = sign * 0.07,
        curl = 0.05,
        spread = 0.02;
      if (technique === 1) {
        z = sign * 0.27;
        ry = phase ? 0 : Math.PI;
        x = sign * 0.11;
        y = sign * w * 0.19;
        rz = sign * 0.1;
        spread = 0.05;
      }
      if (technique === 2) {
        x = sign * 0.1;
        z = sign * 0.11;
        y = sign * w * 0.12;
        rz = sign * 0.17;
        spread = 0.18;
        curl = 0.45;
      }
      if (technique === 3) {
        x = sign * 0.12;
        y = sign * 0.22;
        z = sign * 0.24;
        rz = i === 0 ? 0 : Math.PI;
        curl = 1.25;
      }
      if (technique === 4) {
        const clasp = i === (phase ? 0 : 1);
        x = clasp ? -0.35 : 0.25;
        y = clasp ? 0.05 : -0.2;
        z = clasp ? 0.3 : -0.08;
        ry = clasp ? Math.PI + Math.sin(t * 3) * 0.4 : 0;
        rz = clasp ? -0.8 : 0.25;
        curl = clasp ? 1.3 : 0.85;
      }
      if (technique === 5) {
        const tips = i === (phase ? 0 : 1);
        x = tips ? Math.cos(t * 3) * 0.13 : 0;
        y = tips ? 0.05 + Math.sin(t * 3) * 0.13 : -0.2;
        z = tips ? 0.35 : -0.25;
        rx = tips ? 0.7 : 0;
        ry = tips ? Math.PI : 0;
        rz = tips ? -Math.PI / 2 : 0;
        curl = tips ? 0.6 : 0.03;
        spread = tips ? -0.06 : 0.02;
      }
      if (technique < 0) {
        x = sign * 0.85;
        y = Math.sin(t * 2) * 0.07;
        z = 0;
        ry = sign * 0.15;
        rz = sign * -0.15;
        curl = 0.08;
      }
      group.position.lerp(scratch.p.set(x, y, z), blend);
      group.quaternion.slerp(
        scratch.q.setFromEuler(scratch.e.set(rx, ry, rz, technique === 5 ? 'ZYX' : 'XYZ')),
        blend,
      );
      rig.chains.forEach((chain, f) =>
        chain.forEach((bone, j) => {
          const angle = f === 4 ? (technique === 4 ? 0.03 : 0.12) : curl * (j === 0 ? 0.65 : 1);
          scratch.bend.setFromAxisAngle(scratch.axis, -angle);
          scratch.q.copy(rig.rest[f][j]).multiply(scratch.bend);
          if (j === 0 && f < 4)
            scratch.q.multiply(
              scratch.spread.setFromAxisAngle(
                scratch.spreadAxis,
                (f - 1.5) * spread * (i ? 1 : -1),
              ),
            );
          bone.quaternion.slerp(scratch.q, blend);
        }),
      );
    });
    // Align actual animated contact landmarks after articulation. This prevents the
    // fingertip and thumb demonstrations from becoming two unrelated hand loops.
    if (technique === 4 || technique === 5) {
      const movingIndex = phase ? 0 : 1,
        otherIndex = 1 - movingIndex;
      const moving = groups.current[movingIndex],
        other = groups.current[otherIndex];
      if (moving && other && moving.parent) {
        moving.parent.updateMatrixWorld(true);
        if (technique === 5) {
          scratch.source.set(0, 0, 0);
          for (let finger = 0; finger < 4; finger++)
            scratch.source.add(rigs[movingIndex].tips[finger].getWorldPosition(scratch.temp));
          scratch.source.multiplyScalar(0.25);
          other.localToWorld(
            scratch.target.set(Math.cos(t * 3) * 0.09, Math.sin(t * 3) * 0.09, 0.32),
          );
        } else {
          rigs[movingIndex].tips[0].getWorldPosition(scratch.source);
          rigs[movingIndex].tips[4].getWorldPosition(scratch.temp);
          scratch.source.add(scratch.temp).multiplyScalar(0.5);
          rigs[otherIndex].chains[4][2].getWorldPosition(scratch.target);
        }
        moving.parent.worldToLocal(scratch.source);
        moving.parent.worldToLocal(scratch.target);
        moving.position.add(scratch.target.sub(scratch.source));
      }
    }
  });
  return (
    <group rotation={[0, 0, -0.25]}>
      {rigs.map((rig, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
        >
          <primitive object={rig.model} />
          {labels && (
            <Html position={[0, -0.85, 0.1]} center>
              <span className="anatomy-label">{i === 0 ? 'Left hand' : 'Right hand'}</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
