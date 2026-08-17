import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-9 rounded-md border border-line bg-surface pl-3 pr-8 text-sm text-ink appearance-none",
          "focus:outline-none focus:border-primary focus:shadow-focus transition-shadow",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="h-3.5 w-3.5 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  )
);
Select.displayName = "Select";
