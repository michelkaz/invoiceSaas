import { cn } from "@/lib/utils";

/** Classes partagées par tous les contrôles de formulaire (input, select, textarea). */
export const CONTROL_BASE =
  "w-full rounded-xl border bg-white text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const CONTROL_OK =
  "border-slate-200 focus:border-brand-400 focus:ring-brand-100";

export const CONTROL_ERROR =
  "border-rose-300 focus:border-rose-400 focus:ring-rose-100";

export function controlClass(hasError?: boolean, className?: string) {
  return cn(CONTROL_BASE, hasError ? CONTROL_ERROR : CONTROL_OK, className);
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
