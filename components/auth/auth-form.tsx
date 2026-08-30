"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";

type Mode = "login" | "signup";

const COPY: Record<
  Mode,
  { cta: string; switchText: string; switchHref: string; switchCta: string }
> = {
  login: {
    cta: "Se connecter",
    switchText: "Pas encore de compte ?",
    switchHref: "/signup",
    switchCta: "Créer un compte",
  },
  signup: {
    cta: "Créer mon compte",
    switchText: "Vous avez déjà un compte ?",
    switchHref: "/login",
    switchCta: "Se connecter",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.get("error"));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || password.length < 8) {
      setError(
        "Renseignez un email valide et un mot de passe d'au moins 8 caractères.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      setLoading(false);
      if (err) {
        setError(authErrorMessage(err));
        return;
      }
      // Email de confirmation requis : on oriente vers la page dédiée.
      if (!data.session) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
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
      setError(authErrorMessage(err));
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={mode === "signup" ? "8 caractères minimum." : undefined}
      />

      {mode === "login" && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Mot de passe oublié ?
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
        {copy.cta}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {copy.switchText}{" "}
        <Link
          href={copy.switchHref}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          {copy.switchCta}
        </Link>
      </p>
    </form>
  );
}
