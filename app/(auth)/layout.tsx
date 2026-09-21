import type { Metadata } from "next";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getServerT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: `Facturi — ${getServerT()("auth.loginTitle")}` };
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-14">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            {children}
          </div>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
