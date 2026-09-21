"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/providers/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(params.get("error"));
  const [loading, setLoading] = useState(false);
  const loggedOut = params.get("loggedOut") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || password.length < 8) {
      setError(t("auth.invalidForm"));
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      // Création de compte synchrone : pas d'email de confirmation (désactivé
      // côté Supabase — Authentication → Sign In / Up → Email → "Confirm
      // email"). signUp() renvoie donc directement une session active.
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: fullName.trim() ? { full_name: fullName.trim() } : undefined,
        },
      });
      setLoading(false);
      if (err) {
        setError(authErrorMessage(err, t));
        return;
      }
      // Supabase renvoie un utilisateur « fantôme » (identities: []) sans erreur
      // quand l'email est déjà enregistré, pour ne pas révéler son existence.
      // On le détecte ici pour informer clairement l'utilisateur (l'unicité de
      // l'email est une exigence produit) plutôt que de laisser croire qu'un
      // nouveau compte vient d'être créé.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(t("auth.err.userExists"));
        return;
      }
      if (!data.session) {
        // Ne devrait pas arriver avec "Confirm email" désactivé côté Supabase ;
        // filet de sécurité si ce réglage venait à être réactivé par erreur.
        setError(t("auth.err.generic"));
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err, t));
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loggedOut && mode === "login" && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          {t("auth.loggedOut")}
        </p>
      )}

      {mode === "signup" && (
        <Input
          label={t("auth.fullName")}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("auth.fullNamePlaceholder")}
          hint={t("auth.fullNameOptionalHint")}
        />
      )}
      <Input
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        autoFocus={mode === "login"}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        label={t("auth.password")}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={mode === "signup" ? t("auth.passwordHint") : undefined}
      />

      {mode === "signup" && (
        <PasswordInput
          label={t("auth.confirmPassword")}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}

      {mode === "login" && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {t("auth.forgot")}
          </Link>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          {mode === "login" ? t("auth.toSignup") : t("auth.toLogin")}
        </Link>
      </p>
    </form>
  );
}
