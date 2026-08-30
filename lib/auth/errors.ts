import type { Translate } from "@/lib/i18n";

/** Traduit les erreurs Supabase Auth en messages clairs pour l'utilisateur. */

interface SupaAuthError {
  message?: string;
  code?: string;
  status?: number;
}

export function authErrorMessage(err: unknown, t: Translate): string {
  const e = (err ?? {}) as SupaAuthError;
  const code = e.code ?? "";
  const msg = (e.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login"))
    return t("auth.err.invalidCredentials");
  if (code === "email_not_confirmed" || msg.includes("not confirmed"))
    return t("auth.err.emailNotConfirmed");
  if (code === "user_already_exists" || msg.includes("already registered"))
    return t("auth.err.userExists");
  if (code === "weak_password" || msg.includes("password"))
    return t("auth.err.weakPassword");
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit"))
    return t("auth.err.rateLimit");
  if (code === "email_address_invalid" || msg.includes("invalid"))
    return t("auth.err.invalidEmail");
  if (e.status === 0 || msg.includes("fetch") || msg.includes("network"))
    return t("auth.err.network");

  return t("auth.err.generic");
}
