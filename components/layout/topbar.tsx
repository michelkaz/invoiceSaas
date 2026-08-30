"use client";

import Link from "next/link";
import { Menu, Search, Bell, Plus, ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useData } from "@/components/providers/data-provider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useData();
  const name = user?.name ?? "…";
  const firstName = name.split(" ")[0];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            Bonjour, {firstName} 👋
          </p>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            Voici l&apos;activité de votre entreprise aujourd&apos;hui.
          </p>
        </div>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher une facture, un client…"
            className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white lg:w-72"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
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
          Créer une facture
        </Link>
        <Link
          href="/invoices/new"
          aria-label="Créer une facture"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 sm:hidden"
        >
          <Plus className="h-5 w-5" />
        </Link>

        <div className="hidden border-l border-slate-200 pl-3 lg:block">
          <DropdownMenu
            label="Menu du compte"
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
                label: "Paramètres",
                onClick: () => {
                  window.location.assign("/settings");
                },
              },
              {
                label: "Se déconnecter",
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
