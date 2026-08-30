"use client";

import { useId } from "react";
import { Field, controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Texte affiché à droite dans le champ (ex. "FCFA"). */
  suffix?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  hint,
  error,
  required,
  suffix,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        <input
          id={fieldId}
          required={required}
          className={controlClass(
            Boolean(error),
            cn("h-10 px-3.5", suffix && "pr-14", className),
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}
