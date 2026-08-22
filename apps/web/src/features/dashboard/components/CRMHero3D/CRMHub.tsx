import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

interface CRMHubProps {
  reducedMotion: boolean;
  hovered: boolean;
}

/**
 * The central "CRM data hub" — a glass-like icosahedron that slowly
 * self-rotates and pulses, acting as the focal point every other node
 * connects back to. Kept to simple geometry + built-in materials
 * (no external textures/HDRs) so it stays fast and works offline.
 */
export function CRMHub({ reducedMotion, hovered }: CRMHubProps) {
  const coreRef = useRef<Mesh>(null);
  const shellRef = useRef<Mesh>(null);
  const glowRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      if (coreRef.current) coreRef.current.rotation.y += delta * 0.12;
      if (shellRef.current) {
        shellRef.current.rotation.y -= delta * 0.06;
        shellRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
      }
    }
    if (glowRef.current) {
      const targetScale = hovered ? 1.18 : 1 + Math.sin(state.clock.elapsedTime * (reducedMotion ? 0 : 0.9)) * 0.035;
      glowRef.current.scale.setScalar(glowRef.current.scale.x + (targetScale - glowRef.current.scale.x) * 0.08);
    }
  });

  return (
    <group>
      {/* outer glass shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshPhysicalMaterial
          color="#DBEAFE"
          transmission={0.92}
          roughness={0.12}
          thickness={1.1}
          ior={1.25}
          clearcoat={1}
          clearcoatRoughness={0.08}
          attenuationColor="#93C5FD"
          attenuationDistance={2.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* inner core, gives the sphere a "lit from within" feel */}
      <mesh ref={coreRef} scale={0.62}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={0.55} roughness={0.35} />
      </mesh>

      {/* soft outer glow */}
      <group ref={glowRef}>
        <mesh>
          <sphereGeometry args={[1.4, 24, 24]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={hovered ? 0.14 : 0.08} depthWrite={false} />
        </mesh>
      </group>

      <pointLight color="#2563EB" intensity={hovered ? 3.2 : 2} distance={5} decay={2} />
    </group>
  );
}
