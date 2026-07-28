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
        <div className="relative flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold tracking-tight">Meridian CRM</span>
        </div>

        <div className="relative space-y-5 max-w-sm">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-semibold leading-tight tracking-tight"
          >
            Run your revenue engine from one place.
          </motion.h1>
          <div className="space-y-3">
            {highlights.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-2.5 text-sm text-slate-300"
              >
                <Icon className="h-4 w-4 text-accent shrink-0" strokeWidth={1.75} />
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Meridian CRM</p>
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
