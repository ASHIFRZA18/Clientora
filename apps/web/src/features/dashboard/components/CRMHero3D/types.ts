export type CRMNodeKind = "customer" | "lead" | "deal" | "revenue" | "pipeline";

export interface CRMNode {
  id: string;
  kind: CRMNodeKind;
  /** Anchor position in 3D space (world units, hub is at [0,0,0]) */
  position: [number, number, number];
}

/**
 * Fixed layout for the CRM constellation: customer and lead feed into
 * the hub, the hub feeds into deal and revenue, pipeline sits beneath
 * as the connective process. Positions are hand-tuned for a balanced
 * silhouette at the default camera distance (see CRMScene camera).
 */
export const CRM_NODES: CRMNode[] = [
  { id: "customer", kind: "customer", position: [-2.6, 1.15, 0.4] },
  { id: "lead", kind: "lead", position: [-2.3, -1.25, -0.6] },
  { id: "deal", kind: "deal", position: [2.5, 1.05, -0.3] },
  { id: "revenue", kind: "revenue", position: [2.35, -1.2, 0.5] },
  { id: "pipeline", kind: "pipeline", position: [0, -2.15, 0.9] },
];

/** Reduced set used on tablet, where screen real estate is tighter. */
export const CRM_NODES_COMPACT: CRMNode[] = [
  { id: "customer", kind: "customer", position: [-2.2, 1.0, 0.3] },
  { id: "deal", kind: "deal", position: [2.2, 0.9, -0.2] },
  { id: "revenue", kind: "revenue", position: [0, -1.9, 0.6] },
];
