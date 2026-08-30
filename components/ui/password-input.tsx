"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  containerClassName?: string;
}

/** Champ mot de passe avec bascule afficher / masquer (Eye / EyeOff). */
export function PasswordInput({
  label,
  hint,
  error,
  required,
  className,
  containerClassName,
  id,
  ...props
}: PasswordInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);

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
          type={visible ? "text" : "password"}
          className={controlClass(Boolean(error), cn("h-10 px-3.5 pr-11", className))}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </Field>
  );
}
