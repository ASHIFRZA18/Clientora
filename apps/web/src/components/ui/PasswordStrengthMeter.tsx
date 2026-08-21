// Place at: apps/web/src/components/ui/PasswordStrengthMeter.tsx
import { cn } from "@/lib/utils";

const LEVELS = [
  { label: "Very weak", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-primary" },
  { label: "Strong", color: "bg-success" },
] as const;

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const level = getStrength(password);
  const { label, color } = LEVELS[level];

  return (
    <div className="space-y-1 -mt-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-slate-100 transition-colors duration-300",
              i < level && color
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}