import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-[13px] font-medium text-ink">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "w-full h-10 rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70",
            "transition-shadow duration-150 focus:outline-none focus:border-primary focus:shadow-focus",
            error && "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgb(239_68_68_/_0.12)]",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
