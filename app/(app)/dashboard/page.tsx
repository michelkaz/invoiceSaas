"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, CheckCircle2, Clock, AlertTriangle, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { StatCard, TrendBadge } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { ActionItems } from "@/components/dashboard/action-items";
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
  getMonthlyRevenueVsCollected,
  getOverview,
  getStatSeries,
  getStatusBreakdown,
  getTrends,
} from "@/lib/dashboard-stats";
import { formatFCFA } from "@/lib/money";
import type { InvoiceWithClient } from "@/lib/data/types";

const CHART_PERIODS = [3, 6, 12] as const;
type ChartPeriod = (typeof CHART_PERIODS)[number];

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
  const [chartMonths, setChartMonths] = useState<ChartPeriod>(6);

  const overview = useMemo(() => getOverview(invoices), [invoices]);
  const trends = useMemo(() => getTrends(invoices), [invoices]);
  const monthly = useMemo(
    () => getMonthlyRevenueVsCollected(invoices, chartMonths, new Date(), dict.months),
    [invoices, chartMonths, dict.months],
  );
  const statusBreakdown = useMemo(() => getStatusBreakdown(invoices), [invoices]);
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
        <Button href="/invoices/new" className="shrink-0">
          {t("topbar.createInvoice")}
        </Button>
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
              label={t("dashboard.statInvoiced")}
              value={formatFCFA(overview.invoicedAmount)}
              icon={Wallet}
              accent="brand"
              series={series.invoiced}
              hint={
                <span className="inline-flex items-center gap-1.5">
                  <TrendBadge value={trends.invoiced} />
                  <span className="text-slate-400">{t("dashboard.vsPrevMonth")}</span>
                </span>
              }
            />
            <StatCard
              label={t("dashboard.statPaid")}
              value={formatFCFA(overview.paidAmount)}
              icon={CheckCircle2}
              accent="emerald"
              series={series.paid}
              hint={
                <span className="inline-flex items-center gap-1.5">
                  <TrendBadge value={trends.paid} />
                  <span className="text-slate-400">{t("dashboard.vsPrevMonth")}</span>
                </span>
              }
            />
            <StatCard
              label={t("dashboard.statToReceive")}
              value={formatFCFA(overview.toReceiveAmount)}
              icon={Clock}
              accent="amber"
              series={series.toReceive}
              hint={
                <span className="text-slate-400">
                  {t(
                    overview.toReceiveCount > 1
                      ? "dashboard.nInvoicesMany"
                      : "dashboard.nInvoicesOne",
                    { count: overview.toReceiveCount },
                  )}
                </span>
              }
            />
            <StatCard
              label={t("dashboard.statOverdue")}
              value={formatFCFA(overview.overdueAmount)}
              icon={AlertTriangle}
              accent="rose"
              series={series.overdue}
              hint={
                <span className="font-medium text-rose-600">
                  {t(
                    overview.overdueCount > 1
                      ? "dashboard.nInvoicesMany"
                      : "dashboard.nInvoicesOne",
                    { count: overview.overdueCount },
                  )}
                </span>
              }
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart
                data={monthly}
                action={
                  <SegmentedTabs
                    tabs={CHART_PERIODS.map((m) => ({
                      id: m,
                      label: t("dashboard.periodMonths", { count: m }),
                    }))}
                    value={chartMonths}
                    onChange={setChartMonths}
                  />
                }
              />
            </div>
            <ActionItems overview={overview} />
          </section>

          <StatusDonut data={statusBreakdown} />

          <div data-tour="recent">
            <RecentInvoices invoices={recentInvoices} limit={6} />
          </div>
        </>
      )}
    </div>
  );
}
