import { Canvas } from "@react-three/fiber";
import { CRMScene } from "./CRMScene";
import type { CRMNode } from "./types";

interface CRMCanvasProps {
  nodes: CRMNode[];
  reducedMotion: boolean;
  showParticles: boolean;
}

/**
 * Thin wrapper around <Canvas>, kept in its own module so the parent
 * (CRMHero3D) can `React.lazy` it — this is what actually defers loading
 * three.js / @react-three/fiber out of the initial dashboard bundle.
 */
export default function CRMCanvas({ nodes, reducedMotion, showParticles }: CRMCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <CRMScene nodes={nodes} reducedMotion={reducedMotion} showParticles={showParticles} />
    </Canvas>
  );
}
