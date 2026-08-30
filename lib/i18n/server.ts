import { cookies } from "next/headers";
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, makeTranslator } from "@/lib/i18n";

/** Locale de la requête courante (cookie), pour les Server Components. */
export function getServerLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** Traducteur côté serveur pour la locale courante (ou celle fournie). */
export function getServerT(locale: Locale = getServerLocale()) {
  return makeTranslator(getDictionary(locale));
}
