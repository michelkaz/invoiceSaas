"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { useT } from "@/components/providers/i18n-provider";

const COLUMNS = [
  {
    title: "landing.footerColProduct",
    links: [
      { key: "landing.footerFeatures", href: "/#fonctionnalites" },
      { key: "landing.footerPricing", href: "/#tarifs" },
      { key: "landing.footerBilling", href: "/#facturation" },
      { key: "landing.footerPayments", href: "/#paiements" },
    ],
  },
  {
    title: "landing.footerColCompany",
    links: [
      { key: "landing.footerAbout", href: "/#apropos" },
      { key: "landing.footerContact", href: "/help" },
    ],
  },
  {
    title: "landing.footerColResources",
    links: [
      { key: "landing.footerFaq", href: "/#faq" },
      { key: "landing.footerHelp", href: "/help" },
    ],
  },
  {
    title: "landing.footerColLegal",
    links: [
      { key: "landing.footerTerms", href: "/terms" },
      { key: "landing.footerPrivacy", href: "/privacy" },
    ],
  },
];

export function LandingFooter() {
  const t = useT();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
                <Receipt className="h-4 w-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">
                Facturi
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              {t("landing.footerTagline")}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-700">
              {t("landing.footerLocation")}
            </p>
            <p className="mt-1 text-sm text-slate-500">+243 XX XXX XX XX</p>
            <p className="text-sm text-slate-500">contact@votre-domaine.cd</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-slate-900">
                {t(col.title)}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-800"
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} {t("landing.footerCopyright")}
        </div>
      </div>
    </footer>
  );
}
