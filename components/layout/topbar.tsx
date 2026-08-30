"use client";

import Link from "next/link";
import { Menu, Search, Bell, Plus, ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useData } from "@/components/providers/data-provider";
import { useT } from "@/components/providers/i18n-provider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useData();
  const t = useT();
  const name = user?.name ?? "…";
  const firstName = name.split(" ")[0];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("topbar.openMenu")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {t("topbar.greeting", { name: firstName })}
          </p>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            {t("topbar.subtitle")}
          </p>
        </div>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label={t("topbar.search")}
            placeholder={t("topbar.search")}
            className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white lg:w-72"
          />
        </div>

        <LanguageSwitcher variant="compact" className="hidden sm:inline-flex" />

        <button
          type="button"
          aria-label={t("topbar.notifications")}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
        </button>

        <Link
          href="/invoices/new"
          data-tour="create-invoice"
          className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {t("topbar.createInvoice")}
        </Link>
        <Link
          href="/invoices/new"
          aria-label={t("topbar.createInvoice")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 sm:hidden"
        >
          <Plus className="h-5 w-5" />
        </Link>

        <div className="hidden border-l border-slate-200 pl-3 lg:block">
          <DropdownMenu
            label={t("topbar.accountMenu")}
            align="right"
            triggerClassName="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100"
            trigger={
              <>
                <Avatar name={name} src={user?.avatarUrl} size="sm" />
                <span className="leading-tight text-left">
                  <span className="block text-sm font-semibold text-slate-900">
                    {name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {user?.email ?? ""}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </>
            }
            items={[
              {
                label: t("topbar.settings"),
                onClick: () => {
                  window.location.assign("/settings");
                },
              },
              {
                label: t("topbar.signOut"),
                icon: LogOut,
                danger: true,
                separatorBefore: true,
                onClick: () => {
                  void signOut();
                },
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
