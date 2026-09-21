import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { getServerT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: `Facturi — ${getServerT()("legal.termsTitle")}` };
}

export default function TermsPage() {
  const t = getServerT();
  return (
    <LegalPage
      title={t("legal.termsTitle")}
      intro={t("legal.termsIntro")}
      lastUpdated="2026-09-21"
      sections={[1, 2, 3, 4, 5, 6].map((n) => ({
        title: t(`legal.terms${n}T`),
        body: t(`legal.terms${n}D`),
      }))}
    />
  );
}
