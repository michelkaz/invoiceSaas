"use client";

import { locales, LOCALE_LABEL, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Bascule de langue FR / EN. `variant="compact"` = pastille pour la topbar. */
export function LanguageSwitcher({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("lang.switch")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5",
        className,
      )}
    >
      {locales.map((l: Locale) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== locale && setLocale(l)}
          aria-pressed={l === locale}
          title={LOCALE_LABEL[l]}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors",
            l === locale
              ? "bg-brand-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            variant === "compact" && "px-1.5",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
