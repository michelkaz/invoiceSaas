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

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email_confirmed_at) redirect("/dashboard");

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
                Pensé pour les entrepreneurs congolais · Kinshasa, RDC
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                La gestion de votre entreprise, simplement.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Créez vos factures, suivez vos paiements et gardez une vue claire
                sur votre activité, depuis une seule plateforme pensée pour les
                entreprises en RDC.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup" size="lg">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#fonctionnalites" size="lg" variant="outline">
                  Découvrir la plateforme
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Sans carte bancaire · Vos données restent privées · Résiliez à
                tout moment
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
            title="La gestion quotidienne vous prend trop de temps ?"
            subtitle="Les entrepreneurs de Kinshasa nous décrivent souvent les mêmes difficultés."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileSpreadsheet,
                t: "Trop de fichiers Excel",
                d: "Vos informations sont dispersées entre plusieurs fichiers et plusieurs téléphones.",
              },
              {
                icon: PenLine,
                t: "Factures faites à la main",
                d: "Créer une facture propre prend plus de temps qu'il ne devrait.",
              },
              {
                icon: Search,
                t: "Paiements difficiles à suivre",
                d: "Vous ne savez pas toujours quelles factures ont déjà été réglées.",
              },
              {
                icon: LayoutDashboard,
                t: "Manque de visibilité",
                d: "Difficile de savoir où en est réellement votre activité ce mois-ci.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution / Fonctionnalités ───────────────────────── */}
        <section id="fonctionnalites" className="scroll-mt-20 bg-slate-50">
          <Section>
            <SectionHead
              title="Tout ce dont vous avez besoin, au même endroit."
              subtitle="Une plateforme simple, sans logiciel à installer."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, t: "Clients", d: "Centralisez toutes les informations de vos clients." },
                { icon: FileText, t: "Factures", d: "Créez des factures professionnelles en quelques clics." },
                { icon: Wallet, t: "Paiements", d: "Suivez les règlements et les factures en retard." },
                { icon: LayoutDashboard, t: "Tableau de bord", d: "Visualisez votre activité en un coup d'œil, en FC." },
                { icon: FileDown, t: "Factures PDF", d: "Téléchargez des factures prêtes à être envoyées." },
                { icon: Smartphone, t: "Mobile", d: "Gérez votre activité depuis votre smartphone." },
              ].map(({ icon: Icon, t, d }) => (
                <div
                  key={t}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{t}</p>
                  <p className="mt-1 text-sm text-slate-500">{d}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── Comment ça marche ────────────────────────────────── */}
        <Section>
          <SectionHead
            title="De l'inscription à la première facture en quelques minutes."
            subtitle="Un parcours simple, pensé pour aller vite."
          />
          <ol className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            {[
              ["01", "Créez votre compte", "Inscrivez-vous en quelques minutes."],
              ["02", "Ajoutez votre entreprise", "Renseignez vos informations : RCCM, NIF, ID NAT."],
              ["03", "Ajoutez vos clients", "Centralisez vos clients en un endroit."],
              ["04", "Créez votre facture", "Choisissez un client, ajoutez vos lignes."],
              ["05", "Envoyez et suivez", "Partagez la facture et suivez son statut."],
            ].map(([n, t, d]) => (
              <li
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <span className="text-sm font-bold text-brand-600">{n}</span>
                <p className="mt-2 text-sm font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm text-slate-500">{d}</p>
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
                  Des factures professionnelles, prêtes à envoyer.
                </h2>
                <p className="mt-3 text-slate-600">
                  Chaque facture reprend l&apos;identité de votre entreprise et
                  vos mentions légales (RCCM, NIF, ID NAT). Générez le PDF en un
                  clic, téléchargez-le ou envoyez-le à votre client.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Génération PDF instantanée",
                    "Montants en francs congolais, TVA 16 %",
                    "Suivi du statut : brouillon, envoyée, payée, en retard",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" /> Prévisualiser
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileDown className="h-4 w-4" /> Télécharger
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" /> Envoyer
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
                <p className="text-sm text-slate-500">Paiements du mois</p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-slate-900">
                  1 850 000 FC
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["Mobile Money", "850 000 FC", "w-[46%]"],
                    ["Virement bancaire", "650 000 FC", "w-[35%]"],
                    ["Espèces", "350 000 FC", "w-[19%]"],
                  ].map(([label, amount, w]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">{label}</span>
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
                Sachez toujours qui a payé.
              </h2>
              <p className="mt-3 text-slate-600">
                Enregistrez vos encaissements et visualisez d&apos;où vient
                l&apos;argent. Les exemples de moyens de paiement (Mobile Money,
                M-Pesa, Airtel Money, Orange Money, virement, espèces) illustrent
                les usages courants en RDC.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Les intégrations de paiement automatiques ne sont pas encore
                disponibles — le suivi se fait manuellement pour l&apos;instant.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Pensé pour la RDC ────────────────────────────────── */}
        <section className="bg-slate-50">
          <Section>
            <SectionHead
              title="Pensé pour les entreprises congolaises."
              subtitle="Une plateforme simple et moderne, avec les besoins des entrepreneurs de la RDC au cœur du produit."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Montants en francs congolais (FC)",
                "TVA 16 % appliquée automatiquement",
                "Mentions RCCM, NIF, ID NAT sur les factures",
                "Dates au format jour/mois/année",
                "Suivi des paiements Mobile Money & virement",
                "Utilisable depuis le mobile",
                "Clients et factures centralisés",
                "Espace privé, isolé par compte",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-card"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {f}
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── Tarifs ───────────────────────────────────────────── */}
        <section id="tarifs" className="scroll-mt-20">
          <Section>
            <SectionHead
              title="Une tarification simple, en francs congolais."
              subtitle="Commencez gratuitement, changez d'offre quand vous voulez."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  name: "Gratuit",
                  price: "0 FC",
                  desc: "Pour démarrer votre activité.",
                  feats: ["Jusqu'à 5 factures / mois", "Clients illimités", "Factures PDF"],
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "15 000 FC",
                  desc: "Pour les entrepreneurs et petites entreprises.",
                  feats: ["Factures illimitées", "Suivi des paiements", "Envoi par email"],
                  highlight: true,
                },
                {
                  name: "Business",
                  price: "35 000 FC",
                  desc: "Pour les entreprises en croissance.",
                  feats: ["Tout le plan Pro", "Plusieurs utilisateurs", "Support prioritaire"],
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
                      Le plus choisi
                    </span>
                  )}
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {p.price}
                    <span className="text-sm font-medium text-slate-500"> / mois</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/signup"
                    variant={p.highlight ? "primary" : "outline"}
                    className="mt-6 w-full"
                  >
                    Commencer
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              Prix en francs congolais. Montants indicatifs, susceptibles
              d&apos;évoluer.
            </p>
          </Section>
        </section>

        {/* ── Témoignages ──────────────────────────────────────── */}
        <section className="bg-slate-50">
          <Section>
            <SectionHead
              title="Ils gèrent leur activité avec Facturi."
              subtitle="Témoignages illustratifs d'entrepreneurs de Kinshasa."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  q: "Avant, je faisais toutes mes factures à la main. Maintenant, j'en crée une en quelques secondes.",
                  n: "Sarah",
                  r: "Consultante, Kinshasa",
                },
                {
                  q: "Suivre mes factures et mes paiements depuis le même endroit me fait gagner un temps fou.",
                  n: "David",
                  r: "Entrepreneur, Kinshasa",
                },
                {
                  q: "Enfin un outil simple qui correspond vraiment aux besoins de mon entreprise.",
                  n: "Kevin",
                  r: "Fondateur de startup, Kinshasa",
                },
              ].map((t) => (
                <figure
                  key={t.n}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <blockquote className="text-sm leading-relaxed text-slate-700">
                    « {t.q} »
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-slate-900">{t.n}</span>
                    <span className="text-slate-500"> — {t.r}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20">
          <Section>
            <SectionHead title="Questions fréquentes" />
            <div className="mx-auto max-w-2xl divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
              {[
                {
                  q: "Dans quelle devise sont les montants ?",
                  a: "En francs congolais, au format « 250 000 FC ». La devise se règle dans les paramètres de votre entreprise.",
                },
                {
                  q: "Mes données sont-elles en sécurité ?",
                  a: "Oui. Chaque compte a son espace privé : vos clients et factures ne sont visibles que par vous.",
                },
                {
                  q: "Puis-je l'utiliser depuis mon téléphone ?",
                  a: "Oui, l'interface est pensée pour le mobile : vous pouvez créer et suivre vos factures depuis un smartphone.",
                },
                {
                  q: "Comment migrer depuis Excel ?",
                  a: "Vous ajoutez vos clients une première fois, puis vous créez vos factures directement dans Facturi. Vos anciens fichiers ne sont plus nécessaires.",
                },
                {
                  q: "Y a-t-il un engagement ?",
                  a: "Non. Vous commencez gratuitement et vous pouvez arrêter ou changer d'offre à tout moment.",
                },
              ].map((item) => (
                <details key={item.q} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
                    {item.q}
                    <span className="text-slate-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.a}
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
              Prêt à facturer sereinement ?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              Créez votre compte gratuitement et envoyez votre première facture
              aujourd&apos;hui.
            </p>
            <div className="mt-7">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-slate-50"
              >
                Commencer gratuitement
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
                Une solution congolaise pensée pour simplifier la gestion des
                entreprises.
              </p>
              <p className="mt-4 text-sm font-medium text-slate-700">
                Kinshasa, RD Congo 🇨🇩
              </p>
              <p className="mt-1 text-sm text-slate-500">+243 XX XXX XX XX</p>
              <p className="text-sm text-slate-500">contact@votre-domaine.cd</p>
            </div>

            {[
              { title: "Produit", links: ["Fonctionnalités", "Tarifs", "Facturation", "Paiements"] },
              { title: "Entreprise", links: ["À propos", "Contact"] },
              { title: "Ressources", links: ["FAQ", "Centre d'aide"] },
              { title: "Légal", links: ["Conditions d'utilisation", "Confidentialité"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-slate-900">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span className="text-sm text-slate-500">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
            © {new Date().getFullYear()} Facturi · Kinshasa, RDC
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
