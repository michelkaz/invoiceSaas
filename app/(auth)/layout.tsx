import type { Metadata } from "next";
import { Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturi — Connexion",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
            <Receipt className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Facturi
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          {children}
        </div>
      </div>
    </main>
  );
}
