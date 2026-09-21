"use client";

import Link from "next/link";
import { ArrowRight, PartyPopper, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { STATUS_ICON } from "@/lib/invoice-status";
import { formatFCFA } from "@/lib/money";
import { useT } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { Overview } from "@/lib/dashboard-stats";

type Tone = "rose" | "amber" | "slate";

const TONE: Record<Tone, string> = {
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-500",
};

interface ActionRow {
  key: string;
  icon: LucideIcon;
  tone: Tone;
  amount: number;
  title: string;
  desc: string;
  href: string;
  cta: string;
}

export function ActionItems({ overview }: { overview: Overview }) {
  const t = useT();

  const rows: ActionRow[] = [
    overview.overdueCount > 0 && {
      key: "overdue",
      icon: STATUS_ICON.en_retard,
      tone: "rose" as const,
      amount: overview.overdueAmount,
      title: t(
        overview.overdueCount > 1 ? "dashboard.actionOverdueMany" : "dashboard.actionOverdueOne",
        { count: overview.overdueCount },
      ),
      desc: t("dashboard.actionOverdueDesc"),
      href: "/invoices?status=en_retard",
      cta: t("dashboard.actionOverdueCta"),
    },
    overview.toReceiveCount > 0 && {
      key: "toReceive",
      icon: STATUS_ICON.envoyee,
      tone: "amber" as const,
      amount: overview.toReceiveAmount,
      title: t(
        overview.toReceiveCount > 1 ? "dashboard.actionSentMany" : "dashboard.actionSentOne",
        { count: overview.toReceiveCount },
      ),
      desc: t("dashboard.actionSentDesc"),
      href: "/invoices?status=envoyee",
      cta: t("dashboard.actionSentCta"),
    },
    overview.draftCount > 0 && {
      key: "draft",
      icon: STATUS_ICON.brouillon,
      tone: "slate" as const,
      amount: overview.draftAmount,
      title: t(
        overview.draftCount > 1 ? "dashboard.actionDraftMany" : "dashboard.actionDraftOne",
        { count: overview.draftCount },
      ),
      desc: t("dashboard.actionDraftDesc"),
      href: "/invoices?status=brouillon",
      cta: t("dashboard.actionDraftCta"),
    },
  ].filter((row): row is ActionRow => Boolean(row));

  return (
    <Card>
      <CardHeader title={t("dashboard.actionsTitle")} description={t("dashboard.actionsSubtitle")} />
      <CardBody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <div className="flex items-center gap-3 py-2 text-sm text-slate-600">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-4.5 w-4.5" />
            </span>
            {t("dashboard.actionsAllClear")}
          </div>
        ) : (
          rows.map((row) => (
            <Link
              key={row.key}
              href={row.href}
              className="-mx-1 flex items-center gap-3 rounded-xl px-1 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50"
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                  TONE[row.tone],
                )}
              >
                <row.icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {row.title} · {formatFCFA(row.amount)}
                </p>
                <p className="truncate text-xs text-slate-500">{row.desc}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600">
                {row.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))
        )}
      </CardBody>
    </Card>
  );
}
