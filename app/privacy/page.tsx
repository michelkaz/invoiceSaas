import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { getServerT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: `Facturi — ${getServerT()("legal.privacyTitle")}` };
}

export default function PrivacyPage() {
  const t = getServerT();
  return (
    <LegalPage
      title={t("legal.privacyTitle")}
      intro={t("legal.privacyIntro")}
      lastUpdated="2026-09-21"
      sections={[1, 2, 3, 4, 5, 6].map((n) => ({
        title: t(`legal.privacy${n}T`),
        body: t(`legal.privacy${n}D`),
      }))}
    />
  );
}
