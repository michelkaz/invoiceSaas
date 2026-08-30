import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Saisissez votre email : nous vous enverrons un lien pour définir un
          nouveau mot de passe.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
