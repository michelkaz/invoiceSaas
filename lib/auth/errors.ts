/** Traduit les erreurs Supabase Auth en messages clairs pour l'utilisateur. */

interface SupaAuthError {
  message?: string;
  code?: string;
  status?: number;
}

export function authErrorMessage(err: unknown): string {
  const e = (err ?? {}) as SupaAuthError;
  const code = e.code ?? "";
  const msg = (e.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login"))
    return "Email ou mot de passe incorrect.";
  if (code === "email_not_confirmed" || msg.includes("not confirmed"))
    return "Votre adresse email n'est pas encore confirmée.";
  if (code === "user_already_exists" || msg.includes("already registered"))
    return "Un compte existe déjà avec cet email.";
  if (code === "weak_password" || msg.includes("password"))
    return "Mot de passe trop faible (8 caractères minimum).";
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit"))
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (code === "email_address_invalid" || msg.includes("invalid"))
    return "Cette adresse email n'est pas valide.";
  if (e.status === 0 || msg.includes("fetch") || msg.includes("network"))
    return "Connexion au serveur impossible. Vérifiez votre connexion.";

  return "Une erreur est survenue. Réessayez.";
}
