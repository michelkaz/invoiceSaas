import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getServerT } from "@/lib/i18n/server";

export default function SignupPage() {
  const t = getServerT();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {t("auth.signupTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("auth.signupSubtitle")}</p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
