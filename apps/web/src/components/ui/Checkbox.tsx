import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-invalid={!!error}
            className={cn(
              "size-4 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:focus-visible:ring-offset-slate-900",
              className,
            )}
            {...props}
          />
          {label && (
            <label htmlFor={inputId} className="text-sm text-slate-700 dark:text-slate-200">
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
