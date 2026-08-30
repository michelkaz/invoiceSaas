import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getServerT } from "@/lib/i18n/server";

export default function LoginPage() {
  const t = getServerT();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("auth.loginSubtitle")}</p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
