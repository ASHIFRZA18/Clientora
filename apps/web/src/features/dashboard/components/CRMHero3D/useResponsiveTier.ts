import { useEffect, useState } from "react";

export type HeroTier = "mobile" | "tablet" | "desktop";

function computeTier(width: number): HeroTier {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Decides how much of the 3D scene to render based on viewport width.
 * - mobile: no WebGL canvas at all, static CSS fallback
 * - tablet: full canvas, fewer nodes + particles
 * - desktop: full experience
 */
export function useResponsiveTier(): HeroTier {
  const [tier, setTier] = useState<HeroTier>(() =>
    typeof window !== "undefined" ? computeTier(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTier(computeTier(window.innerWidth)));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return tier;
}
