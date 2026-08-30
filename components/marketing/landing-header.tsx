"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Receipt } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useT } from "@/components/providers/i18n-provider";

export function LandingHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#fonctionnalites", label: t("landing.navFeatures") },
    { href: "#tarifs", label: t("landing.navPricing") },
    { href: "#faq", label: t("landing.navFaq") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Receipt className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Facturi
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
          >
            {t("landing.signIn")}
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t("landing.getStarted")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("topbar.closeMenu") : t("topbar.openMenu")}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <LanguageSwitcher className="self-start" />
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
            >
              {t("landing.signIn")}
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t("landing.getStarted")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
