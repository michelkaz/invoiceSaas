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
  const [error, setError] = useState<string | null>(params.get("error"));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || password.length < 8) {
      setError(t("auth.invalidForm"));
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
        setError(authErrorMessage(err, t));
        return;
      }
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
      setError(authErrorMessage(err, t));
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t("auth.email")}
        type="email"
        autoComplete="email"
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
