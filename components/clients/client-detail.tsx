"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/invoices/status-badge";
import { OverdueTag } from "@/components/invoices/overdue-tag";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/format";
import { formatFCFA } from "@/lib/money";
import { PRIMARY_NEXT_STATUS, statusActionKey } from "@/lib/invoice-status";
import type { InvoiceStatus } from "@/lib/data/types";

export function ClientDetail({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const {
    hydrated,
    invoices,
    getClient,
    invoiceCountForClient,
    deleteClient,
    setInvoiceStatus,
  } = useData();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const client = getClient(clientId);

  const clientInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.clientId === clientId)
        .sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
    [invoices, clientId],
  );

  const totals = useMemo(() => {
    const invoiced = clientInvoices.reduce((sum, i) => sum + i.total, 0);
    const paid = clientInvoices
      .filter((i) => i.status === "payee")
      .reduce((sum, i) => sum + i.total, 0);
    return { invoiced, paid };
  }, [clientInvoices]);

  const markStatus = (invId: string, invNumber: string, s: InvoiceStatus) => {
    setInvoiceStatus(invId, s);
    toast({
      variant: "success",
      title: t("invoices.statusUpdated"),
      description: `${invNumber} · ${t(`status.${s}`)}`,
    });
  };

  if (!hydrated) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded bg-slate-100" />
            <div className="h-24 rounded bg-slate-100" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card>
        <EmptyState
          icon={UserRound}
          title={t("clients.notFoundTitle")}
          description={t("clients.notFoundDesc")}
          action={<Button href="/clients">{t("clients.backToClients")}</Button>}
        />
      </Card>
    );
  }

  const askDelete = () => {
    if (invoiceCountForClient(client.id) > 0) {
      toast({
        variant: "error",
        title: t("clients.deleteBlockedTitle"),
        description: t(
          invoiceCountForClient(client.id) > 1
            ? "clients.deleteBlockedMany"
            : "clients.deleteBlockedOne",
          { name: client.name, count: invoiceCountForClient(client.id) },
        ),
      });
      return;
    }
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/clients"
        backLabel={t("clients.backToClients")}
        title={client.name}
        description={t("clientDetail.memberSince", {
          date: formatDate(client.createdAt),
        })}
        actions={
          <>
            <Button href={`/invoices/new?clientId=${client.id}`}>
              <Plus className="h-4 w-4" />
              {t("clientDetail.newInvoice")}
            </Button>
            <DropdownMenu
              align="right"
              items={[
                { label: t("clients.edit"), icon: Pencil, onClick: () => setEditOpen(true) },
                {
                  label: t("clients.delete"),
                  icon: Trash2,
                  danger: true,
                  separatorBefore: true,
                  onClick: askDelete,
                },
              ]}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">{t("clients.colInvoices")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
              {clientInvoices.length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">{t("clientDetail.totalInvoiced")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
              {formatFCFA(totals.invoiced)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">{t("clientDetail.totalPaid")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-emerald-600">
              {formatFCFA(totals.paid)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={t("clients.colClient")} />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm">
            <Avatar name={client.name} size="md" />
            <span className="font-medium text-slate-900">{client.name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            {client.email || "—"}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            {client.phone || "—"}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            {client.address || "—"}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            {formatDate(client.createdAt)}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("clientDetail.invoicesTitle")} />
        {clientInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("clientDetail.noInvoicesYet")}
            action={
              <Button href={`/invoices/new?clientId=${client.id}`}>
                <Plus className="h-4 w-4" />
                {t("clientDetail.createFirstInvoice")}
              </Button>
            }
          />
        ) : (
          <Table minWidth={640}>
            <THead>
              <TH>{t("invoices.colInvoice")}</TH>
              <TH>{t("invoices.colIssue")}</TH>
              <TH>{t("invoices.colDue")}</TH>
              <TH className="text-right">{t("invoices.colAmount")}</TH>
              <TH>{t("invoices.colStatus")}</TH>
              <TH />
            </THead>
            <TBody>
              {clientInvoices.map((inv) => {
                const primary = PRIMARY_NEXT_STATUS[inv.status];
                return (
                  <TR key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)}>
                    <TD className="font-semibold text-slate-900">
                      <Link
                        href={`/invoices/${inv.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-brand-600 hover:underline"
                      >
                        {inv.number}
                      </Link>
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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StatusBadge status={inv.status} />
                        <OverdueTag status={inv.status} dueDate={inv.dueDate} />
                      </div>
                    </TD>
                    <TD className="text-right">
                      {primary && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markStatus(inv.id, inv.number, primary)}
                          >
                            {t(statusActionKey(primary))}
                          </Button>
                        </div>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <ClientFormModal open={editOpen} onClose={() => setEditOpen(false)} client={client} />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteClient(client.id);
          toast({ variant: "success", title: t("clients.deleted"), description: client.name });
          router.push("/clients");
        }}
        title={t("clients.confirmDeleteTitle")}
        message={t("clients.confirmDeleteMsg", { name: client.name })}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
