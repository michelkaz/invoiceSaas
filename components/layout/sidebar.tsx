"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles } from "lucide-react";
import { navSections } from "@/components/layout/nav";
import { useT } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white shadow-sm">
        F
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Facturi
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav data-tour="nav" className="flex-1 space-y-6 px-3 py-4">
      {navSections.map((section) => (
        <div key={section.titleKey}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t(section.titleKey)}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active
                          ? "text-brand-600"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                    />
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UpgradeCard() {
  const t = useT();
  return (
    <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
      <Sparkles className="h-5 w-5" />
      <p className="mt-2 text-sm font-semibold">{t("nav.proTitle")}</p>
      <p className="mt-1 text-xs text-white/80">
        {t("nav.proBody")}
      </p>
      <button className="mt-3 w-full rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/25">
        {t("nav.proCta")}
      </button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-100">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <NavLinks onNavigate={onNavigate} />
        <UpgradeCard />
      </div>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile — overlay + drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-fade-in"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-pop animate-slide-in">
            <button
              onClick={onClose}
              aria-label={t("topbar.closeMenu")}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
