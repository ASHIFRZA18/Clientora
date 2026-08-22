import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Mesh } from "three";
import type { CRMNode } from "./types";

interface Particle {
  id: string;
  from: Vector3;
  to: Vector3;
  speed: number;
  offset: number;
}

interface DataParticlesProps {
  nodes: CRMNode[];
  hubPosition?: [number, number, number];
}

/**
 * A handful of small glowing points traveling along the hub↔node
 * connections, evoking data moving through the CRM. Deliberately kept
 * to two particles per connection — enough to feel alive, cheap enough
 * to run smoothly on an average laptop.
 */
export function DataParticles({ nodes, hubPosition = [0, 0, 0] }: DataParticlesProps) {
  const refs = useRef<(Mesh | null)[]>([]);
  const hub = useMemo(() => new Vector3(...hubPosition), [hubPosition]);

  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    nodes.forEach((node, i) => {
      const to = new Vector3(...node.position);
      list.push({ id: `${node.id}-a`, from: hub, to, speed: 0.18 + (i % 3) * 0.03, offset: i * 0.31 });
      list.push({ id: `${node.id}-b`, from: hub, to, speed: 0.15 + (i % 2) * 0.04, offset: i * 0.31 + 0.5 });
    });
    return list;
  }, [nodes, hub]);

  const tmp = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    particles.forEach((p, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const t = (state.clock.elapsedTime * p.speed + p.offset) % 1;
      // gentle arc rather than a straight line, matching the connector's curve
      tmp.lerpVectors(p.from, p.to, t);
      tmp.y += Math.sin(t * Math.PI) * 0.18;
      mesh.position.copy(tmp);
      const fade = Math.sin(t * Math.PI); // fade in/out at path ends
      mesh.scale.setScalar(0.5 + fade * 0.7);
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={p.id} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#2563EB" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}
