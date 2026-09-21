import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { LandingHeader } from "@/components/marketing/landing-header";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { formatDate } from "@/lib/format";
import { getServerT } from "@/lib/i18n/server";

interface LegalSection {
  title: string;
  body: string;
}

export function LegalPage({
  title,
  intro,
  sections,
  lastUpdated,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
  lastUpdated: string;
}) {
  const t = getServerT();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("legal.lastUpdated", { date: formatDate(lastUpdated) })}
          </p>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {t("legal.templateNotice")}
          </div>

          <p className="mt-6 text-slate-600">{intro}</p>

          <div className="mt-8 space-y-6">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-base font-semibold text-slate-900">
                  {s.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6">
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Mail className="h-4 w-4" />
              {t("legal.contactCta")}
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
