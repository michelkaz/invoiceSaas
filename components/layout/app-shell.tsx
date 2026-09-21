"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useT } from "@/components/providers/i18n-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t("common.skipToContent")}
      </a>
      <div className="print:hidden">
        <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      </div>
      <div className="lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        </div>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
