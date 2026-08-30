"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  FileEdit,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/invoices/status-badge";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
import { INVOICE_STATUSES, statusActionKey } from "@/lib/invoice-status";
import { formatDate } from "@/lib/format";
import { formatFCFA } from "@/lib/money";
import type { InvoiceStatus } from "@/lib/data/types";

type Filter = "tous" | InvoiceStatus;

const STATUS_ICON: Record<InvoiceStatus, typeof Send> = {
  brouillon: FileEdit,
  envoyee: Send,
  payee: CheckCircle2,
  en_retard: Clock,
};

export function InvoicesView() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const { hydrated, invoices, getClient, setInvoiceStatus, deleteInvoice } =
    useData();

  const [filter, setFilter] = useState<Filter>("tous");
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<{ id: string; number: string } | null>(
    null,
  );

  const sorted = useMemo(
    () => [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
    [invoices],
  );

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      tous: invoices.length,
      brouillon: 0,
      envoyee: 0,
      payee: 0,
      en_retard: 0,
    };
    for (const inv of invoices) base[inv.status] += 1;
    return base;
  }, [invoices]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((inv) => {
      if (filter !== "tous" && inv.status !== filter) return false;
      if (!q) return true;
      const client = getClient(inv.clientId);
      return (
        client?.name.toLowerCase().includes(q) ||
        inv.number.toLowerCase().includes(q)
      );
    });
  }, [sorted, filter, query, getClient]);

  if (!hydrated) return <ListSkeleton />;

  const tabs = [
    { id: "tous" as const, label: t("invoices.filterAll"), count: counts.tous },
    { id: "brouillon" as const, label: t("invoices.filterDraft"), count: counts.brouillon },
    { id: "envoyee" as const, label: t("invoices.filterSent"), count: counts.envoyee },
    { id: "payee" as const, label: t("invoices.filterPaid"), count: counts.payee },
    { id: "en_retard" as const, label: t("invoices.filterOverdue"), count: counts.en_retard },
  ];

  const buildActions = (
    invId: string,
    invNumber: string,
    status: InvoiceStatus,
  ): DropdownItem[] => {
    const others = INVOICE_STATUSES.filter((s) => s !== status);
    return [
      { label: t("invoices.actionView"), icon: Eye, onClick: () => router.push(`/invoices/${invId}`) },
      { label: t("invoices.actionEdit"), icon: Pencil, onClick: () => router.push(`/invoices/${invId}/edit`) },
      ...others.map((s, i) => ({
        label: t(statusActionKey(s)),
        icon: STATUS_ICON[s],
        separatorBefore: i === 0,
        onClick: () => {
          setInvoiceStatus(invId, s);
          toast({
            variant: "success",
            title: t("invoices.statusUpdated"),
            description: `${invNumber} · ${t(`status.${s}`)}`,
          });
        },
      })),
      {
        label: t("invoices.actionDelete"),
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        onClick: () => setToDelete({ id: invId, number: invNumber }),
      },
    ];
  };

  const filtered = query.trim() !== "" || filter !== "tous";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("invoices.title")}
        description={t(
          invoices.length > 1 ? "invoices.countMany" : "invoices.countOne",
          { count: invoices.length },
        )}
        actions={
          <Button href="/invoices/new">
            <Plus className="h-4 w-4" />
            {t("invoices.create")}
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedTabs tabs={tabs} value={filter} onChange={setFilter} />
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("invoices.search")}
            className="lg:w-80"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              filtered
                ? t("invoices.emptyFilteredTitle")
                : t("invoices.emptyTitle")
            }
            description={
              filtered
                ? t("invoices.emptyFilteredDesc")
                : t("invoices.emptyDesc")
            }
            action={
              !filtered ? (
                <Button href="/invoices/new">
                  <Plus className="h-4 w-4" />
                  {t("invoices.create")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table minWidth={760}>
            <THead>
              <TH>{t("invoices.colInvoice")}</TH>
              <TH>{t("invoices.colClient")}</TH>
              <TH>{t("invoices.colIssue")}</TH>
              <TH>{t("invoices.colDue")}</TH>
              <TH className="text-right">{t("invoices.colAmount")}</TH>
              <TH>{t("invoices.colStatus")}</TH>
              <TH />
            </THead>
            <TBody>
              {rows.map((inv) => {
                const client = getClient(inv.clientId);
                return (
                  <TR key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)}>
                    <TD className="font-semibold text-slate-900">{inv.number}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar name={client?.name ?? "?"} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {client?.name ?? t("invoices.clientDeleted")}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {client?.email}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD className="tabular-nums text-slate-600">
                      {formatDate(inv.issueDate)}
                    </TD>
                    <TD className="tabular-nums text-slate-600">
                      {formatDate(inv.dueDate)}
                    </TD>
                    <TD className="text-right font-semibold tabular-nums text-slate-900">
                      {formatFCFA(inv.total)}
                    </TD>
                    <TD>
                      <StatusBadge status={inv.status} />
                    </TD>
                    <TD className="text-right">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu items={buildActions(inv.id, inv.number, inv.status)} />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteInvoice(toDelete.id);
            toast({
              variant: "success",
              title: t("invoices.invoiceDeleted"),
              description: toDelete.number,
            });
          }
          setToDelete(null);
        }}
        title={t("invoices.confirmDeleteTitle")}
        message={t("invoices.confirmDeleteMsg", { number: toDelete?.number ?? "" })}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
