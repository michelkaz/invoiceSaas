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
import { formatDate } from "@/lib/format";
import { formatFCFA } from "@/lib/money";
import {
  INVOICE_STATUSES,
  STATUS_ACTION_LABEL,
  STATUS_LABEL,
} from "@/lib/invoice-status";
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
    { id: "tous" as const, label: "Tous", count: counts.tous },
    { id: "brouillon" as const, label: "Brouillon", count: counts.brouillon },
    { id: "envoyee" as const, label: "Envoyée", count: counts.envoyee },
    { id: "payee" as const, label: "Payée", count: counts.payee },
    { id: "en_retard" as const, label: "En retard", count: counts.en_retard },
  ];

  const buildActions = (invId: string, invNumber: string, status: InvoiceStatus): DropdownItem[] => {
    const others = INVOICE_STATUSES.filter((s) => s !== status);
    return [
      { label: "Voir le détail", icon: Eye, onClick: () => router.push(`/invoices/${invId}`) },
      { label: "Modifier", icon: Pencil, onClick: () => router.push(`/invoices/${invId}/edit`) },
      ...others.map((s, i) => ({
        label: STATUS_ACTION_LABEL[s],
        icon: STATUS_ICON[s],
        separatorBefore: i === 0,
        onClick: () => {
          setInvoiceStatus(invId, s);
          toast({
            variant: "success",
            title: "Statut mis à jour",
            description: `${invNumber} · ${STATUS_LABEL[s]}`,
          });
        },
      })),
      {
        label: "Supprimer",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        onClick: () => setToDelete({ id: invId, number: invNumber }),
      },
    ];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        description={`${invoices.length} facture${invoices.length > 1 ? "s" : ""} au total`}
        actions={
          <Button href="/invoices/new">
            <Plus className="h-4 w-4" />
            Créer une facture
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedTabs tabs={tabs} value={filter} onChange={setFilter} />
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Rechercher un client, un numéro…"
            className="lg:w-80"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              !hydrated
                ? "Chargement…"
                : query || filter !== "tous"
                  ? "Aucune facture ne correspond"
                  : "Aucune facture pour l'instant"
            }
            description={
              query || filter !== "tous"
                ? "Modifiez vos filtres ou votre recherche."
                : "Créez votre première facture pour la voir apparaître ici."
            }
            action={
              !query && filter === "tous" ? (
                <Button href="/invoices/new">
                  <Plus className="h-4 w-4" />
                  Créer une facture
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table minWidth={760}>
            <THead>
              <TH>Facture</TH>
              <TH>Client</TH>
              <TH>Émission</TH>
              <TH>Échéance</TH>
              <TH className="text-right">Montant</TH>
              <TH>Statut</TH>
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
                            {client?.name ?? "Client supprimé"}
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
            toast({ variant: "success", title: "Facture supprimée", description: toDelete.number });
          }
          setToDelete(null);
        }}
        title="Supprimer la facture"
        message={
          <>
            La facture <strong>{toDelete?.number}</strong> sera définitivement
            supprimée. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
