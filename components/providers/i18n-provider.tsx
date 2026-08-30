"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { LOCALE_COOKIE, defaultLocale, type Locale } from "@/lib/i18n/config";
import {
  getDictionary,
  makeTranslator,
  type Dictionary,
  type Translate,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  t: Translate;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale: initial,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const t = useMemo(() => makeTranslator(dict), [dict]);

  const setLocale = useCallback((l: Locale) => {
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
    } catch {
      /* cookies indisponibles */
    }
    setLocaleState(l);
    // Recharge : les Server Components (landing, layouts, PDF) relisent le cookie.
    window.location.reload();
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dict, t, setLocale }),
    [locale, dict, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}

/** Raccourci : la fonction de traduction seule. */
export function useT(): Translate {
  return useI18n().t;
}

export { defaultLocale };
