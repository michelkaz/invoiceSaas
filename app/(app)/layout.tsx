import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DataProvider } from "@/components/providers/data-provider";
import { ToastProvider } from "@/components/ui/toast";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
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

  // Onboarding : un compte tout neuf (entreprise non renseignée, aucune donnée)
  // est redirigé une fois vers le parcours de démarrage.
  const { data: company } = await supabase
    .from("companies")
    .select("name, onboarding_completed")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (company && !company.onboarding_completed && !company.name) {
    const [{ count: clientCount }, { count: invoiceCount }] = await Promise.all([
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id),
    ]);
    if (!clientCount && !invoiceCount) redirect("/onboarding");
  }

  return (
    <ToastProvider>
      <DataProvider>
        <TutorialProvider>
          <AppShell>{children}</AppShell>
        </TutorialProvider>
      </DataProvider>
    </ToastProvider>
  );
}
