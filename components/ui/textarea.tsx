"use client";

import { useId } from "react";
import { Field, controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  containerClassName?: string;
}

export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  containerClassName,
  id,
  rows = 3,
  ...props
}: TextareaProps) {
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
      <textarea
        id={fieldId}
        required={required}
        rows={rows}
        className={controlClass(Boolean(error), cn("px-3.5 py-2.5", className))}
        {...props}
      />
    </Field>
  );
}
