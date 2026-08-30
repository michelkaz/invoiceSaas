"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { Field, controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export function Select({
  label,
  hint,
  error,
  required,
  placeholder,
  options,
  className,
  containerClassName,
  id,
  ...props
}: SelectProps) {
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
        <select
          id={fieldId}
          required={required}
          className={controlClass(
            Boolean(error),
            cn("h-10 appearance-none px-3.5 pr-10", className),
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </Field>
  );
}
