import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "./useReducedMotion";
import { useResponsiveTier } from "./useResponsiveTier";
import { CRMHeroFallback } from "./CRMHeroFallback";
import { CRM_NODES, CRM_NODES_COMPACT } from "./types";

// The R3F canvas + three.js are only pulled into the bundle (and only
// mounted) when we actually need them, so mobile visitors and
// reduced-motion users never pay for the WebGL chunk.
const CRMCanvas = lazy(() => import("./CRMCanvas"));

function ScenePlaceholder() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary-100 border-t-primary animate-spin" />
    </div>
  );
}

export function CRMHero3D() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const tier = useResponsiveTier();

  const nodes = tier === "tablet" ? CRM_NODES_COMPACT : CRM_NODES;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-stretch">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-2 flex flex-col justify-center rounded-xl border border-line bg-surface px-5 py-6 lg:px-6 lg:py-8"
      >
        <h1 className="text-2xl lg:text-[28px] font-bold text-ink leading-tight tracking-tight">
          Manage relationships.
          <br />
          Close smarter.
        </h1>
        <p className="mt-2.5 text-sm text-muted leading-relaxed max-w-sm">
          Connect customers, leads, and deals in one intelligent workspace.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate("/pipeline")}>
            <Workflow className="h-3.5 w-3.5" />
            View Pipeline
          </Button>
          <Button variant="outline" onClick={() => navigate("/customers?new=1")}>
            <UserPlus className="h-3.5 w-3.5" />
            Add Customer
          </Button>
        </div>
      </motion.div>

      <div className="lg:col-span-3 relative rounded-xl border border-line bg-gradient-to-br from-white via-white to-primary-50/50 overflow-hidden h-[280px] sm:h-[340px] lg:h-[420px]">
        {tier === "mobile" ? (
          <CRMHeroFallback />
        ) : (
          <Suspense fallback={<ScenePlaceholder />}>
            <CRMCanvas nodes={nodes} reducedMotion={reducedMotion} showParticles={tier === "desktop"} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
