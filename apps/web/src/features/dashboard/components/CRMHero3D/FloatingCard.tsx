import { useState, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  position: [number, number, number];
  children: ReactNode;
  /** Stagger offset so cards don't bob in sync */
  bobDelay?: number;
  reducedMotion?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
}

/**
 * Anchors a real DOM node (glass card) to a point in the WebGL scene via
 * drei's <Html transform>. This keeps the card fully accessible, crisp at
 * any resolution, and cheap to render — only the position/scale/perspective
 * matrix is computed on the GPU side, the content itself is ordinary HTML.
 */
export function FloatingCard({
  position,
  children,
  bobDelay = 0,
  reducedMotion = false,
  onHoverChange,
  className,
}: FloatingCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Html position={position} transform distanceFactor={7.2} zIndexRange={[20, 0]} sprite>
      <motion.div
        onMouseEnter={() => {
          setHovered(true);
          onHoverChange?.(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
          onHoverChange?.(false);
        }}
        animate={
          reducedMotion
            ? undefined
            : { y: [0, -5, 0] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 4.5, delay: bobDelay, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ scale: hovered ? 1.06 : 1 }}
        className={cn(
          "pointer-events-auto select-none rounded-lg border border-white/60 bg-white/70",
          "backdrop-blur-md shadow-elevated px-3 py-2.5 w-[168px]",
          "transition-[box-shadow,transform] duration-200 ease-out",
          hovered && "shadow-[0_12px_32px_-8px_rgba(37,99,235,0.28)] border-primary-100",
          className
        )}
      >
        {children}
      </motion.div>
    </Html>
  );
}
