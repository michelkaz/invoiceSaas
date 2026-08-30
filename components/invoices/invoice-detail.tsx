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
import { INVOICE_STATUSES, statusActionKey } from "@/lib/invoice-status";
import { useT } from "@/components/providers/i18n-provider";

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
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
          title={t("invoices.notFoundTitle")}
          description={t("invoices.notFoundDesc")}
          action={<Button href="/invoices">{t("invoices.backToList")}</Button>}
        />
      </Card>
    );
  }

  const client = getClient(invoice.clientId);

  const statusItems: DropdownItem[] = INVOICE_STATUSES.filter(
    (s) => s !== invoice.status,
  ).map((s) => ({
    label: t(statusActionKey(s)),
    onClick: () => {
      setInvoiceStatus(invoice.id, s);
      toast({
        variant: "success",
        title: t("invoices.statusUpdated"),
        description: `${invoice.number} · ${t(`status.${s}`)}`,
      });
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/invoices"
        backLabel={t("invoices.allInvoices")}
        title={invoice.number}
        description={
          <span className="inline-flex items-center gap-2">
            {client?.name ?? t("invoices.clientDeleted")}
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
                  {t("invoices.changeStatus")}
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </>
              }
            />
            <Button variant="outline" href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        <InvoicePdfActions invoice={invoice} company={company} client={client} />
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 to-brand-700" />
        <CardBody className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              {company.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-12 w-auto max-w-[180px] object-contain"
                />
              )}
              <div className="space-y-0.5 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">
                  {company.name}
                </p>
                {company.address && <p>{company.address}</p>}
                <p>
                  {[company.city, company.country].filter(Boolean).join(", ")}
                </p>
                {company.phone && <p>{company.phone}</p>}
                {company.email && <p>{company.email}</p>}
              </div>
            </div>

            <div className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:w-64">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">
                {t("invoices.invoiceLabel")}
              </p>
              <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
                {invoice.number}
              </p>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
              <dl className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-slate-600">
                <div className="flex justify-between">
                  <dt>{t("invoices.emission")}</dt>
                  <dd className="tabular-nums text-slate-900">
                    {formatDate(invoice.issueDate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("invoices.echeance")}</dt>
                  <dd className="tabular-nums text-slate-900">
                    {formatDate(invoice.dueDate)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {t("invoices.billedTo")}
            </p>
            <div className="mt-2 space-y-0.5 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">
                {client?.name ?? t("invoices.clientDeleted")}
              </p>
              {client?.address && <p>{client.address}</p>}
              {client?.phone && <p>{client.phone}</p>}
              {client?.email && <p>{client.email}</p>}
            </div>
          </div>

          <Table minWidth={480}>
            <THead>
              <TH>{t("invoiceForm.lineDescription")}</TH>
              <TH className="text-right">{t("invoiceForm.lineQty")}</TH>
              <TH className="text-right">{t("invoiceForm.lineUnitPrice")}</TH>
              <TH className="text-right">{t("invoiceForm.lineTotal")}</TH>
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

          <div className="flex flex-col items-end gap-3">
            <dl className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("invoices.subtotal")}</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {formatFCFA(invoice.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("invoices.tva", { rate: invoice.tvaRate })}</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {formatFCFA(invoice.tvaAmount)}
                </dd>
              </div>
            </dl>
            <div className="flex w-full max-w-xs items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-sm font-semibold text-brand-900">
                {t("invoices.totalTTC")}
              </span>
              <span className="text-lg font-bold tabular-nums text-brand-700">
                {formatFCFA(invoice.total)}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-slate-100 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {t("invoices.notes")}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="space-y-1 border-t border-slate-100 pt-6 text-xs text-slate-500">
            {(company.rccm || company.nif || company.idNat) && (
              <p>
                {[
                  company.rccm && `RCCM : ${company.rccm}`,
                  company.nif && `NIF : ${company.nif}`,
                  company.idNat && `ID NAT : ${company.idNat}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {company.bankDetails && (
              <p>{t("invoices.bankTransfer", { details: company.bankDetails })}</p>
            )}
            {company.paymentTermsDays ? (
              <p>
                {t("invoices.paymentTerms", { days: company.paymentTermsDays })}
              </p>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteInvoice(invoice.id);
          toast({
            variant: "success",
            title: t("invoices.invoiceDeleted"),
            description: invoice.number,
          });
          router.push("/invoices");
        }}
        title={t("invoices.confirmDeleteTitle")}
        message={t("invoices.confirmDeleteMsg", { number: invoice.number })}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
