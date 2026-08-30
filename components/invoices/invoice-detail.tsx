"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Trash2, FileWarning } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/invoices/status-badge";
import { InvoicePdfActions } from "@/components/invoices/invoice-pdf-actions";
import { useData } from "@/components/providers/data-provider";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { formatFCFA } from "@/lib/money";
import { lineTotal } from "@/lib/invoice-calc";
import {
  INVOICE_STATUSES,
  STATUS_ACTION_LABEL,
  STATUS_LABEL,
} from "@/lib/invoice-status";

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hydrated, getInvoice, getClient, company, setInvoiceStatus, deleteInvoice } =
    useData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const invoice = getInvoice(invoiceId);

  if (!hydrated) {
    return (
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded bg-slate-100" />
            <div className="h-24 rounded bg-slate-100" />
            <div className="h-40 rounded bg-slate-100" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <EmptyState
          icon={FileWarning}
          title="Facture introuvable"
          description="Cette facture n'existe pas ou a été supprimée."
          action={<Button href="/invoices">Retour aux factures</Button>}
        />
      </Card>
    );
  }

  const client = getClient(invoice.clientId);

  const statusItems: DropdownItem[] = INVOICE_STATUSES.filter(
    (s) => s !== invoice.status,
  ).map((s) => ({
    label: STATUS_ACTION_LABEL[s],
    onClick: () => {
      setInvoiceStatus(invoice.id, s);
      toast({
        variant: "success",
        title: "Statut mis à jour",
        description: `${invoice.number} · ${STATUS_LABEL[s]}`,
      });
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/invoices"
        backLabel="Toutes les factures"
        title={invoice.number}
        description={
          <span className="inline-flex items-center gap-2">
            {client?.name ?? "Client supprimé"}
            <span className="text-slate-300">•</span>
            <StatusBadge status={invoice.status} />
          </span>
        }
        actions={
          <>
            <DropdownMenu
              align="right"
              items={statusItems}
              triggerClassName="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              trigger={
                <>
                  Changer le statut
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </>
              }
            />
            <Button variant="outline" href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        <InvoicePdfActions invoice={invoice} company={company} client={client} />
      </div>

      <Card>
        <CardBody className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div className="space-y-0.5 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">
                {company.name}
              </p>
              <p>{company.address}</p>
              <p>
                {company.city}, {company.country}
              </p>
              <p>{company.phone}</p>
              <p>{company.email}</p>
              <p className="text-slate-400">NINEA / RCCM : {company.taxId}</p>
            </div>
            <div className="space-y-1 text-sm sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Facture
              </p>
              <p className="text-lg font-bold text-slate-900">{invoice.number}</p>
              <div className="sm:flex sm:justify-end">
                <StatusBadge status={invoice.status} />
              </div>
              <p className="pt-1 text-slate-600">
                Émission : {formatDate(invoice.issueDate)}
              </p>
              <p className="text-slate-600">
                Échéance : {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Facturé à
            </p>
            <div className="mt-2 space-y-0.5 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">
                {client?.name ?? "Client supprimé"}
              </p>
              {client?.address && <p>{client.address}</p>}
              {client?.phone && <p>{client.phone}</p>}
              {client?.email && <p>{client.email}</p>}
            </div>
          </div>

          <Table minWidth={480}>
            <THead>
              <TH>Description</TH>
              <TH className="text-right">Qté</TH>
              <TH className="text-right">Prix unitaire</TH>
              <TH className="text-right">Total</TH>
            </THead>
            <TBody>
              {invoice.items.map((item) => (
                <TR key={item.id}>
                  <TD className="text-slate-900">{item.description}</TD>
                  <TD className="text-right tabular-nums text-slate-600">
                    {item.quantity}
                  </TD>
                  <TD className="text-right tabular-nums text-slate-600">
                    {formatFCFA(item.unitPrice)}
                  </TD>
                  <TD className="text-right font-medium tabular-nums text-slate-900">
                    {formatFCFA(lineTotal(item.quantity, item.unitPrice))}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Sous-total</dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(invoice.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">TVA ({invoice.tvaRate} %)</dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(invoice.tvaAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-base font-semibold text-slate-900">Total TTC</dt>
              <dd className="text-base font-bold tabular-nums text-slate-900">
                {formatFCFA(invoice.total)}
              </dd>
            </div>
          </dl>

          {invoice.notes && (
            <div className="border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {invoice.notes}
              </p>
            </div>
          )}

          {company.bankDetails && (
            <p className="border-t border-slate-100 pt-6 text-xs text-slate-400">
              Règlement par virement — {company.bankDetails}
            </p>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteInvoice(invoice.id);
          toast({
            variant: "success",
            title: "Facture supprimée",
            description: invoice.number,
          });
          router.push("/invoices");
        }}
        title="Supprimer la facture"
        message={
          <>
            La facture <strong>{invoice.number}</strong> sera définitivement
            supprimée. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
