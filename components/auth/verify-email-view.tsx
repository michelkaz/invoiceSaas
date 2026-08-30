"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { useT } from "@/components/providers/i18n-provider";

export function VerifyEmailView() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Récupère l'email de la session si l'utilisateur est déjà connecté (non vérifié).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email && !email) setEmail(data.user.email);
      if (data.user?.email_confirmed_at) {
        router.replace("/dashboard");
      }
    });
    // Re-vérifie quand l'onglet reprend le focus (l'utilisateur revient de sa boîte mail).
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = async () => {
    setChecking(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.refreshSession();
    setChecking(false);
    if (data.user?.email_confirmed_at) {
      router.replace("/dashboard");
      router.refresh();
    } else {
      setStatus(t("verify.pending"));
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setResending(false);
    if (err) {
      setError(authErrorMessage(err, t));
      return;
    }
    setStatus(t("verify.resent"));
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-5 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <MailCheck className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {t("verify.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {email
            ? t("verify.body", { email })
            : t("verify.bodyNoEmail")}
        </p>
      </div>

      {status && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-left text-sm text-emerald-700">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-left text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Button onClick={check} loading={checking} className="w-full">
          {t("verify.confirmed")}
        </Button>
        <Button onClick={resend} loading={resending} variant="outline" className="w-full">
          {t("verify.resend")}
        </Button>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        {t("verify.signOut")}
      </button>
    </div>
  );
}
