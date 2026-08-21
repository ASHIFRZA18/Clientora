import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, Workflow } from "lucide-react";

const highlights = [
  { icon: Workflow, text: "Pipelines that move as fast as your team does" },
  { icon: BarChart3, text: "Revenue clarity, updated in real time" },
  { icon: ShieldCheck, text: "Enterprise-grade access control, built in" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-secondary text-white p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Signature element — two slow-drifting, blurred brand-color glows
            behind the headline. Kept to one spot so it reads as intentional
            atmosphere, not decoration. Uses your existing bg-primary /
            bg-accent tokens rather than hardcoded hex values. */}
        <motion.div
          aria-hidden
          className="absolute -left-20 top-1/3 h-[380px] w-[380px] rounded-full bg-primary opacity-25 blur-[110px]"
          animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-10 top-1/2 h-[280px] w-[280px] rounded-full bg-accent opacity-20 blur-[100px]"
          animate={{ x: [0, -20, 15, 0], y: [0, 15, -10, 0], scale: [1, 0.95, 1.05, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold tracking-tight">Meridian CRM</span>
        </div>

        <div className="relative space-y-6 max-w-sm">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-semibold leading-tight tracking-tight"
          >
            Run your revenue engine from one place.
          </motion.h1>
          <div className="space-y-2.5">
            {highlights.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-2.5 text-sm text-slate-300"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                </span>
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Meridian CRM</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>Built for revenue teams</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-4 bg-canvas">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-3 lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-semibold text-ink text-sm">Meridian CRM</span>
          </div>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">{title}</h2>
          <p className="text-sm text-muted mt-1 mb-4">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}