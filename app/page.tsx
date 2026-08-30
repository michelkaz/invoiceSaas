import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Users,
  FileText,
  Wallet,
  LayoutDashboard,
  FileDown,
  Smartphone,
  FileSpreadsheet,
  PenLine,
  Search,
  Eye,
  Check,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/marketing/landing-header";
import {
  DashboardMockup,
  InvoiceMockup,
} from "@/components/marketing/landing-mockups";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email_confirmed_at) redirect("/dashboard");

  const t = getServerT();

  return (
    <div className="bg-white">
      <LandingHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                <Receipt className="h-3.5 w-3.5 text-brand-600" />
                {t("landing.heroBadge")}
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                {t("landing.heroTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                {t("landing.heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup" size="lg">
                  {t("landing.heroCtaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#fonctionnalites" size="lg" variant="outline">
                  {t("landing.heroCtaSecondary")}
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {t("landing.heroReassurance")}
              </p>
            </div>
            <div className="lg:pl-8">
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* ── Problèmes ────────────────────────────────────────── */}
        <Section>
          <SectionHead
            title={t("landing.problemsTitle")}
            subtitle={t("landing.problemsSubtitle")}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileSpreadsheet, t: "landing.problem1T", d: "landing.problem1D" },
              { icon: PenLine, t: "landing.problem2T", d: "landing.problem2D" },
              { icon: Search, t: "landing.problem3T", d: "landing.problem3D" },
              { icon: LayoutDashboard, t: "landing.problem4T", d: "landing.problem4D" },
            ].map(({ icon: Icon, t: tk, d: dk }) => (
              <div
                key={tk}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  {t(tk)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{t(dk)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution / Fonctionnalités ───────────────────────── */}
        <section id="fonctionnalites" className="scroll-mt-20 bg-slate-50">
          <Section>
            <SectionHead
              title={t("landing.featuresTitle")}
              subtitle={t("landing.featuresSubtitle")}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, t: "landing.feat1T", d: "landing.feat1D" },
                { icon: FileText, t: "landing.feat2T", d: "landing.feat2D" },
                { icon: Wallet, t: "landing.feat3T", d: "landing.feat3D" },
                { icon: LayoutDashboard, t: "landing.feat4T", d: "landing.feat4D" },
                { icon: FileDown, t: "landing.feat5T", d: "landing.feat5D" },
                { icon: Smartphone, t: "landing.feat6T", d: "landing.feat6D" },
              ].map(({ icon: Icon, t: tk, d: dk }) => (
                <div
                  key={tk}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    {t(tk)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{t(dk)}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── Comment ça marche ────────────────────────────────── */}
        <Section>
          <SectionHead
            title={t("landing.howTitle")}
            subtitle={t("landing.howSubtitle")}
          />
          <ol className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            {[
              ["01", "landing.how1T", "landing.how1D"],
              ["02", "landing.how2T", "landing.how2D"],
              ["03", "landing.how3T", "landing.how3D"],
              ["04", "landing.how4T", "landing.how4D"],
              ["05", "landing.how5T", "landing.how5D"],
            ].map(([n, tk, dk]) => (
              <li
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <span className="text-sm font-bold text-brand-600">{n}</span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {t(tk)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{t(dk)}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Facture PDF ──────────────────────────────────────── */}
        <section className="bg-slate-50">
          <Section>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t("landing.pdfTitle")}
                </h2>
                <p className="mt-3 text-slate-600">{t("landing.pdfBody")}</p>
                <ul className="mt-6 space-y-3">
                  {["landing.pdfFeat1", "landing.pdfFeat2", "landing.pdfFeat3"].map(
                    (f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {t(f)}
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-7 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" /> {t("landing.pdfActionPreview")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileDown className="h-4 w-4" /> {t("landing.pdfActionDownload")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" /> {t("landing.pdfActionSend")}
                  </span>
                </div>
              </div>
              <InvoiceMockup />
            </div>
          </Section>
        </section>

        {/* ── Paiements ────────────────────────────────────────── */}
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <p className="text-sm text-slate-500">{t("landing.payMonth")}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-slate-900">
                  1 850 000 FC
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["landing.payMobileMoney", "850 000 FC", "w-[46%]"],
                    ["landing.payTransfer", "650 000 FC", "w-[35%]"],
                    ["landing.payCash", "350 000 FC", "w-[19%]"],
                  ].map(([labelKey, amount, w]) => (
                    <div key={labelKey}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">{t(labelKey)}</span>
                        <span className="font-medium tabular-nums text-slate-900">
                          {amount}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full bg-brand-500 ${w}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t("landing.payTitle")}
              </h2>
              <p className="mt-3 text-slate-600">{t("landing.payBody")}</p>
              <p className="mt-3 text-xs text-slate-500">
                {t("landing.payDisclaimer")}
              </p>
            </div>
          </div>
        </Section>

        {/* ── Pensé pour la RDC ────────────────────────────────── */}
        <section className="bg-slate-50">
          <Section>
            <SectionHead
              title={t("landing.rdcTitle")}
              subtitle={t("landing.rdcSubtitle")}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "landing.rdc1",
                "landing.rdc2",
                "landing.rdc3",
                "landing.rdc4",
                "landing.rdc5",
                "landing.rdc6",
                "landing.rdc7",
                "landing.rdc8",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-card"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {t(f)}
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── Tarifs ───────────────────────────────────────────── */}
        <section id="tarifs" className="scroll-mt-20">
          <Section>
            <SectionHead
              title={t("landing.pricingTitle")}
              subtitle={t("landing.pricingSubtitle")}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  name: "landing.planFreeName",
                  price: "0 FC",
                  desc: "landing.planFreeDesc",
                  feats: ["landing.planFreeF1", "landing.planFreeF2", "landing.planFreeF3"],
                  highlight: false,
                },
                {
                  name: "landing.planProName",
                  price: "15 000 FC",
                  desc: "landing.planProDesc",
                  feats: ["landing.planProF1", "landing.planProF2", "landing.planProF3"],
                  highlight: true,
                },
                {
                  name: "landing.planBizName",
                  price: "35 000 FC",
                  desc: "landing.planBizDesc",
                  feats: ["landing.planBizF1", "landing.planBizF2", "landing.planBizF3"],
                  highlight: false,
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`flex flex-col rounded-2xl border bg-white p-6 shadow-card ${
                    p.highlight
                      ? "border-brand-300 ring-1 ring-brand-200"
                      : "border-slate-200"
                  }`}
                >
                  {p.highlight && (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {t("landing.planMostChosen")}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-slate-900">
                    {t(p.name)}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {p.price}
                    <span className="text-sm font-medium text-slate-500">
                      {" "}
                      {t("landing.planPerMonth")}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{t(p.desc)}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.feats.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {t(f)}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/signup"
                    variant={p.highlight ? "primary" : "outline"}
                    className="mt-6 w-full"
                  >
                    {t("landing.planStart")}
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              {t("landing.pricingNote")}
            </p>
          </Section>
        </section>

        {/* ── Témoignages ──────────────────────────────────────── */}
        <section className="bg-slate-50">
          <Section>
            <SectionHead
              title={t("landing.testimonialsTitle")}
              subtitle={t("landing.testimonialsSubtitle")}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { q: "landing.testi1Q", n: "Sarah", r: "landing.testi1R" },
                { q: "landing.testi2Q", n: "David", r: "landing.testi2R" },
                { q: "landing.testi3Q", n: "Kevin", r: "landing.testi3R" },
              ].map((ti) => (
                <figure
                  key={ti.n}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <blockquote className="text-sm leading-relaxed text-slate-700">
                    « {t(ti.q)} »
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-slate-900">{ti.n}</span>
                    <span className="text-slate-500"> — {t(ti.r)}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20">
          <Section>
            <SectionHead title={t("landing.faqTitle")} />
            <div className="mx-auto max-w-2xl divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
              {[
                ["landing.faq1Q", "landing.faq1A"],
                ["landing.faq2Q", "landing.faq2A"],
                ["landing.faq3Q", "landing.faq3A"],
                ["landing.faq4Q", "landing.faq4A"],
                ["landing.faq5Q", "landing.faq5A"],
              ].map(([qk, ak]) => (
                <details key={qk} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
                    {t(qk)}
                    <span className="text-slate-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t(ak)}
                  </p>
                </details>
              ))}
            </div>
          </Section>
        </section>

        {/* ── CTA final ────────────────────────────────────────── */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px] rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:py-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              {t("landing.ctaBody")}
            </p>
            <div className="mt-7">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-slate-50"
              >
                {t("landing.ctaButton")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
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

            {[
              {
                title: "landing.footerColProduct",
                links: [
                  "landing.footerFeatures",
                  "landing.footerPricing",
                  "landing.footerBilling",
                  "landing.footerPayments",
                ],
              },
              {
                title: "landing.footerColCompany",
                links: ["landing.footerAbout", "landing.footerContact"],
              },
              {
                title: "landing.footerColResources",
                links: ["landing.footerFaq", "landing.footerHelp"],
              },
              {
                title: "landing.footerColLegal",
                links: ["landing.footerTerms", "landing.footerPrivacy"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-slate-900">
                  {t(col.title)}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span className="text-sm text-slate-500">{t(l)}</span>
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
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      {children}
    </div>
  );
}

function SectionHead({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}
