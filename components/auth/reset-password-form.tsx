"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/providers/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";

export function ResetPasswordForm() {
  const router = useRouter();
  const t = useT();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(true);
      if (!data.session) setInvalid(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err, t));
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  };

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (invalid) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {t("auth.resetInvalid")}
        </p>
        <Button href="/forgot-password" variant="outline" className="w-full">
          {t("auth.requestNewLink")}
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
        {t("auth.passwordUpdated")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        label={t("auth.newPassword")}
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={t("auth.passwordHint")}
      />
      <PasswordInput
        label={t("auth.confirmPassword")}
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        {t("auth.updatePassword")}
      </Button>
    </form>
  );
}
