import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { CRMHub } from "./CRMHub";
import { ConnectionLines } from "./ConnectionLines";
import { DataParticles } from "./DataParticles";
import { FloatingCard } from "./FloatingCard";
import {
  CustomerCardContent,
  DealCardContent,
  LeadCardContent,
  PipelineCardContent,
  RevenueCardContent,
} from "./CardContent";
import type { CRMNode } from "./types";

interface CRMSceneProps {
  nodes: CRMNode[];
  reducedMotion: boolean;
  showParticles: boolean;
}

const cardFor = (kind: CRMNode["kind"]) => {
  switch (kind) {
    case "customer":
      return <CustomerCardContent />;
    case "lead":
      return <LeadCardContent />;
    case "deal":
      return <DealCardContent />;
    case "revenue":
      return <RevenueCardContent />;
    case "pipeline":
      return <PipelineCardContent />;
  }
};

export function CRMScene({ nodes, reducedMotion, showParticles }: CRMSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hubHovered, setHubHovered] = useState(false);
  const sceneRef = useRef<Group>(null);
  const { size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  // Very subtle parallax: the whole constellation tilts a couple degrees
  // toward the cursor. Disabled entirely under reduced motion.
  useFrame(() => {
    if (!sceneRef.current || reducedMotion) return;
    sceneRef.current.rotation.y += (pointer.current.x * 0.12 - sceneRef.current.rotation.y) * 0.04;
    sceneRef.current.rotation.x += (-pointer.current.y * 0.08 - sceneRef.current.rotation.x) * 0.04;
  });

  const handlePointerMove = (e: { clientX: number; clientY: number; target: EventTarget | null }) => {
    if (reducedMotion) return;
    const el = e.target as HTMLElement;
    const rect = el.getBoundingClientRect?.() ?? { left: 0, top: 0, width: size.width, height: size.height };
    pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  };

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={0.55} color="#F8FAFC" />
      <directionalLight position={[-4, -2, -3]} intensity={0.2} color="#93C5FD" />

      <group ref={sceneRef} onPointerMove={handlePointerMove}>
        <group
          onPointerOver={() => setHubHovered(true)}
          onPointerOut={() => setHubHovered(false)}
        >
          <CRMHub reducedMotion={reducedMotion} hovered={hubHovered} />
        </group>

        <ConnectionLines nodes={nodes} hoveredId={hoveredId} />

        {showParticles && <DataParticles nodes={nodes} />}

        {nodes.map((node, i) => (
          <FloatingCard
            key={node.id}
            position={node.position}
            bobDelay={i * 0.3}
            reducedMotion={reducedMotion}
            onHoverChange={(h) => setHoveredId(h ? node.id : null)}
          >
            {cardFor(node.kind)}
          </FloatingCard>
        ))}
      </group>
    </>
  );
}
