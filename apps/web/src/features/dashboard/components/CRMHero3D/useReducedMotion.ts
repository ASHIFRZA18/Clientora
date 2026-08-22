import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` OS/browser setting.
 * The 3D hero uses this to disable auto-rotation, particles, and
 * parallax while keeping the scene visually present and readable.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
