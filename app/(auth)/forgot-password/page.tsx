import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getServerT } from "@/lib/i18n/server";

export default function ForgotPasswordPage() {
  const t = getServerT();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {t("auth.forgotTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("auth.forgotSubtitle")}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
