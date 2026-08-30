"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";

export function ResetPasswordForm() {
  const router = useRouter();
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
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err));
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
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Button href="/forgot-password" variant="outline" className="w-full">
          Demander un nouveau lien
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
        Mot de passe mis à jour. Redirection en cours…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        label="Nouveau mot de passe"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="8 caractères minimum."
      />
      <PasswordInput
        label="Confirmer le mot de passe"
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
        Mettre à jour le mot de passe
      </Button>
    </form>
  );
}
