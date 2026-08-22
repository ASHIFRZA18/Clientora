import { Line } from "@react-three/drei";
import type { CRMNode } from "./types";

interface ConnectionLinesProps {
  nodes: CRMNode[];
  hoveredId: string | null;
  hubPosition?: [number, number, number];
}

/**
 * Thin lines radiating from the central hub to each floating CRM node.
 * The line for a hovered node brightens and thickens slightly so the
 * relationship reads clearly on interaction, without any extra draw calls.
 */
export function ConnectionLines({ nodes, hoveredId, hubPosition = [0, 0, 0] }: ConnectionLinesProps) {
  return (
    <>
      {nodes.map((node) => {
        const isActive = hoveredId === node.id;
        return (
          <Line
            key={node.id}
            points={[hubPosition, node.position]}
            color={isActive ? "#2563EB" : "#93C5FD"}
            lineWidth={isActive ? 1.6 : 0.9}
            transparent
            opacity={isActive ? 0.85 : 0.4}
          />
        );
      })}
    </>
  );
}
