import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Facturi — Démarrage",
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");

  const { data: company } = await supabase
    .from("companies")
    .select("onboarding_completed")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (company?.onboarding_completed) redirect("/dashboard");

  return (
    <ToastProvider>
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
              <Receipt className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Facturi
            </span>
          </div>
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}
