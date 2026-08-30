import { fr, type Dictionary } from "@/lib/i18n/dictionaries/fr";
import { en } from "@/lib/i18n/dictionaries/en";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export type { Dictionary };
export type { Locale } from "@/lib/i18n/config";

const DICTS: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale] ?? DICTS[defaultLocale];
}

export type TranslateParams = Record<string, string | number>;

/** Fabrique une fonction `t("namespace.key", { param })` pour un dictionnaire. */
export function makeTranslator(dict: Dictionary) {
  return function t(key: string, params?: TranslateParams): string {
    const raw = key
      .split(".")
      .reduce<unknown>(
        (acc, part) =>
          acc && typeof acc === "object"
            ? (acc as Record<string, unknown>)[part]
            : undefined,
        dict,
      );
    if (typeof raw !== "string") return key;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in params ? String(params[name]) : `{${name}}`,
    );
  };
}

export type Translate = ReturnType<typeof makeTranslator>;
