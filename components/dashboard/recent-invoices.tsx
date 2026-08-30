"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/invoices/status-badge";
import { formatDate } from "@/lib/format";
import { formatFCFA } from "@/lib/money";
import type { InvoiceWithClient } from "@/lib/data/types";

type TabId = "all" | "paid" | "unpaid";

const TABS = [
  { id: "all" as const, label: "Toutes" },
  { id: "paid" as const, label: "Payées" },
  { id: "unpaid" as const, label: "Impayées" },
];

function matchesTab(invoice: InvoiceWithClient, tab: TabId): boolean {
  if (tab === "paid") return invoice.status === "payee";
  if (tab === "unpaid")
    return invoice.status === "envoyee" || invoice.status === "en_retard";
  return true;
}

export function RecentInvoices({
  invoices,
  limit = 6,
}: {
  invoices: InvoiceWithClient[];
  limit?: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("all");

  const rows = useMemo(
    () => invoices.filter((invoice) => matchesTab(invoice, tab)).slice(0, limit),
    [invoices, tab, limit],
  );

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Dernières factures
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Vos factures les plus récentes
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
          <Link
            href="/invoices"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-400">
          Aucune facture dans cette catégorie.
        </p>
      ) : (
        <Table minWidth={660}>
          <THead>
            <TH>Facture</TH>
            <TH>Client</TH>
            <TH>Émission</TH>
            <TH>Échéance</TH>
            <TH className="text-right">Montant</TH>
            <TH>Statut</TH>
          </THead>
          <TBody>
            {rows.map((invoice) => (
              <TR
                key={invoice.id}
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <TD className="font-semibold text-slate-900">{invoice.number}</TD>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar name={invoice.client?.name ?? "?"} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {invoice.client?.name ?? "Client supprimé"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {invoice.client?.email}
                      </p>
                    </div>
                  </div>
                </TD>
                <TD className="tabular-nums text-slate-600">
                  {formatDate(invoice.issueDate)}
                </TD>
                <TD className="tabular-nums text-slate-600">
                  {formatDate(invoice.dueDate)}
                </TD>
                <TD className="text-right font-semibold tabular-nums text-slate-900">
                  {formatFCFA(invoice.total)}
                </TD>
                <TD>
                  <StatusBadge status={invoice.status} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}
