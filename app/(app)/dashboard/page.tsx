"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  FileStack,
  FilePlus2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { useData } from "@/components/providers/data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTutorial } from "@/components/tutorial/tutorial-provider";
import {
  buildDashboardTour,
  REPLAY_TOUR_KEY,
} from "@/components/tutorial/dashboard-tour";
import {
  getMonthlyRevenue,
  getOverview,
  getStatSeries,
  getStatusBreakdown,
} from "@/lib/dashboard-stats";
import { formatFCFA, formatNumber } from "@/lib/money";
import type { InvoiceWithClient } from "@/lib/data/types";

export default function DashboardPage() {
  const {
    hydrated,
    invoices,
    clients,
    getClient,
    onboardingCompleted,
    tutorialSeen,
    setTutorialSeen,
  } = useData();
  const { start } = useTutorial();
  const { t, dict } = useI18n();
  const tourStarted = useRef(false);

  const overview = useMemo(() => getOverview(invoices), [invoices]);
  const monthly = useMemo(
    () => getMonthlyRevenue(invoices, 8, new Date(), dict.months),
    [invoices, dict.months],
  );
  const statusBreakdown = useMemo(
    () => getStatusBreakdown(invoices),
    [invoices],
  );
  const series = useMemo(() => getStatSeries(invoices, 6), [invoices]);

  const recentInvoices = useMemo<InvoiceWithClient[]>(
    () =>
      [...invoices]
        .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
        .map((invoice) => ({ ...invoice, client: getClient(invoice.clientId) })),
    [invoices, getClient],
  );

  const hasData = invoices.length > 0;

  // Lancement du tutoriel : une fois après l'onboarding (dès qu'il y a des
  // données à commenter), ou sur demande explicite depuis les Paramètres.
  useEffect(() => {
    if (!hydrated || tourStarted.current) return;
    let replay = false;
    try {
      replay = localStorage.getItem(REPLAY_TOUR_KEY) === "1";
    } catch {
      /* stockage indisponible */
    }
    if (replay) {
      try {
        localStorage.removeItem(REPLAY_TOUR_KEY);
      } catch {
        /* ignore */
      }
    }
    if (replay || (onboardingCompleted && !tutorialSeen && hasData)) {
      tourStarted.current = true;
      start(buildDashboardTour(t), () => setTutorialSeen(true));
    }
  }, [
    hydrated,
    onboardingCompleted,
    tutorialSeen,
    hasData,
    start,
    setTutorialSeen,
    t,
  ]);

  if (!hydrated) return <DashboardSkeleton />;

  const isEmpty = invoices.length === 0 && clients.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("dashboard.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      <OnboardingChecklist />

      {isEmpty ? (
        onboardingCompleted && (
          <Card>
            <EmptyState
              icon={FilePlus2}
              title={t("dashboard.emptyTitle")}
              description={t("dashboard.emptyDesc")}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button href="/clients" variant="outline">
                    {t("dashboard.emptyAddClient")}
                  </Button>
                  <Button href="/invoices/new">
                    {t("dashboard.emptyCreateInvoice")}
                  </Button>
                </div>
              }
            />
          </Card>
        )
      ) : (
        <>
          <section
            data-tour="stats"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              label={t("dashboard.statInvoices")}
              value={formatNumber(overview.totalCount)}
              icon={FileStack}
              accent="brand"
              series={series.count}
            />
            <StatCard
              label={t("dashboard.statInvoiced")}
              value={formatFCFA(overview.invoicedAmount)}
              icon={Wallet}
              accent="brand"
              series={series.invoiced}
            />
            <StatCard
              label={t("dashboard.statPaid")}
              value={formatFCFA(overview.paidAmount)}
              icon={CheckCircle2}
              accent="emerald"
              series={series.paid}
            />
            <StatCard
              label={t("dashboard.statPending")}
              value={formatFCFA(overview.pendingAmount)}
              icon={Clock}
              accent="amber"
              series={series.pending}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RevenueChart data={monthly} />
            </div>
            <div className="lg:col-span-2">
              <StatusDonut data={statusBreakdown} />
            </div>
          </section>

          <div data-tour="recent">
            <RecentInvoices invoices={recentInvoices} limit={6} />
          </div>
        </>
      )}
    </div>
  );
}
