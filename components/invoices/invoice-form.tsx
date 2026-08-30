"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, FileWarning } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useData } from "@/components/providers/data-provider";
import { useT } from "@/components/providers/i18n-provider";
import { computeInvoiceTotals, lineTotal } from "@/lib/invoice-calc";
import { formatFCFA } from "@/lib/money";
import { addDaysISO, todayISO } from "@/lib/format";
import type { InvoiceStatus } from "@/lib/data/types";

interface LineState {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface LineError {
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

const num = (value: number) => (Number.isFinite(value) ? value : 0);

export function InvoiceForm({
  mode,
  invoiceId,
}: {
  mode: "create" | "edit";
  invoiceId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const {
    hydrated,
    clients,
    company,
    getInvoice,
    nextInvoiceNumber,
    addInvoice,
    updateInvoice,
    setInvoiceStatus,
  } = useData();

  const existing = invoiceId ? getInvoice(invoiceId) : undefined;
  const keySeq = useRef(0);
  const makeKey = () => `line_${keySeq.current++}`;

  const [clientId, setClientId] = useState(existing?.clientId ?? "");
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(
    existing?.dueDate ?? addDaysISO(todayISO(), company.paymentTermsDays),
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [lines, setLines] = useState<LineState[]>(
    existing
      ? existing.items.map((item) => ({
          key: makeKey(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [{ key: makeKey(), description: "", quantity: 1, unitPrice: 0 }],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lineErrors, setLineErrors] = useState<LineError[]>([]);
  const [submitting, setSubmitting] = useState<null | "brouillon" | "envoyee" | "save">(
    null,
  );

  const cleanLines = useMemo(
    () =>
      lines.map((l) => ({
        description: l.description.trim(),
        quantity: num(l.quantity),
        unitPrice: num(l.unitPrice),
      })),
    [lines],
  );

  const totals = useMemo(
    () => computeInvoiceTotals(cleanLines, company.defaultTvaRate),
    [cleanLines, company.defaultTvaRate],
  );

  const number = existing?.number ?? (hydrated ? nextInvoiceNumber() : "…");

  if (mode === "edit" && hydrated && !existing) {
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

  const updateLine = (key: string, patch: Partial<LineState>) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  };
  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { key: makeKey(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  const removeLine = (key: string) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.key !== key)));

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!clientId) nextErrors.clientId = t("invoiceForm.errClient");
    if (!issueDate) nextErrors.issueDate = t("clients.nameRequired");
    if (!dueDate) nextErrors.dueDate = t("clients.nameRequired");
    else if (issueDate && dueDate < issueDate)
      nextErrors.dueDate = t("invoiceForm.errDue");

    const nextLineErrors: LineError[] = lines.map((l) => {
      const e: LineError = {};
      if (!l.description.trim()) e.description = t("invoiceForm.lineDescription");
      if (!(num(l.quantity) > 0)) e.quantity = "> 0";
      if (num(l.unitPrice) < 0) e.unitPrice = "≥ 0";
      return e;
    });

    const hasLineError = nextLineErrors.some((e) => Object.keys(e).length > 0);
    setErrors(nextErrors);
    setLineErrors(nextLineErrors);
    return Object.keys(nextErrors).length === 0 && !hasLineError;
  };

  const buildInput = () => ({
    clientId,
    issueDate,
    dueDate,
    tvaRate: company.defaultTvaRate,
    notes,
    items: cleanLines,
  });

  const handleCreate = (status: InvoiceStatus) => {
    if (!validate()) {
      toast({ variant: "error", title: t("invoiceForm.incompleteTitle"), description: t("invoiceForm.incompleteDesc") });
      return;
    }
    setSubmitting(status === "brouillon" ? "brouillon" : "envoyee");
    const created = addInvoice(buildInput(), status);
    toast({
      variant: "success",
      title: status === "brouillon" ? t("invoiceForm.draftSaved") : t("invoiceForm.invoiceSent"),
      description: `${created.number} · ${formatFCFA(created.total)}`,
    });
    router.push(`/invoices/${created.id}`);
  };

  const handleSave = (alsoSend: boolean) => {
    if (!invoiceId || !validate()) {
      if (invoiceId)
        toast({ variant: "error", title: t("invoiceForm.incompleteTitle"), description: t("invoiceForm.incompleteDesc") });
      return;
    }
    setSubmitting("save");
    updateInvoice(invoiceId, buildInput());
    if (alsoSend) setInvoiceStatus(invoiceId, "envoyee");
    toast({
      variant: "success",
      title: alsoSend ? t("invoiceForm.invoiceSent") : t("invoiceForm.changesSaved"),
    });
    router.push(`/invoices/${invoiceId}`);
  };

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const gridCols = "sm:grid-cols-[minmax(0,1fr)_88px_170px_120px_40px]";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title={t("invoiceForm.infoTitle")}
          description={t("invoiceForm.invoiceNo", { number })}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t("invoiceForm.client")}
            required
            placeholder={t("invoiceForm.selectClient")}
            options={clientOptions}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            error={errors.clientId}
            hint={
              clients.length === 0 ? (
                <>
                  {t("invoiceForm.noClientsHint")}{" "}
                  <Link href="/clients" className="font-medium text-brand-600">
                    {t("invoiceForm.goToClients")}
                  </Link>
                </>
              ) : undefined
            }
            containerClassName="sm:col-span-2"
          />
          <Input
            type="date"
            label={t("invoiceForm.issueDate")}
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            error={errors.issueDate}
          />
          <Input
            type="date"
            label={t("invoiceForm.dueDate")}
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("invoiceForm.linesTitle")}
          action={
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-4 w-4" />
              {t("invoiceForm.addLine")}
            </Button>
          }
        />
        <CardBody className="space-y-3">
          <div
            className={`hidden gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:grid ${gridCols}`}
          >
            <span>{t("invoiceForm.lineDescription")}</span>
            <span>{t("invoiceForm.lineQty")}</span>
            <span>{t("invoiceForm.lineUnitPrice")}</span>
            <span className="text-right">{t("invoiceForm.lineTotal")}</span>
            <span />
          </div>

          {lines.map((line, index) => {
            const le = lineErrors[index] ?? {};
            return (
              <div
                key={line.key}
                className={`grid gap-3 rounded-xl border border-slate-200 p-3 sm:items-start sm:border-0 sm:p-0 ${gridCols}`}
              >
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                    {t("invoiceForm.lineDescription")}
                  </span>
                  <Input
                    value={line.description}
                    placeholder={t("invoiceForm.descriptionPlaceholder")}
                    onChange={(e) =>
                      updateLine(line.key, { description: e.target.value })
                    }
                    error={le.description}
                  />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                    {t("invoiceForm.lineQty")}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={Number.isNaN(line.quantity) ? "" : line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: Number(e.target.value) })
                    }
                    error={le.quantity}
                  />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                    {t("invoiceForm.lineUnitPrice")}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    suffix="FC"
                    value={Number.isNaN(line.unitPrice) ? "" : line.unitPrice}
                    onChange={(e) =>
                      updateLine(line.key, { unitPrice: Number(e.target.value) })
                    }
                    error={le.unitPrice}
                  />
                </div>
                <div className="flex items-center justify-between sm:h-10 sm:justify-end">
                  <span className="text-xs font-medium text-slate-500 sm:hidden">
                    {t("invoiceForm.lineTotal")}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatFCFA(lineTotal(num(line.quantity), num(line.unitPrice)))}
                  </span>
                </div>
                <div className="flex justify-end sm:h-10 sm:items-center">
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    aria-label={t("invoiceForm.removeLine")}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </CardBody>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">{t("invoices.subtotal")}</dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                {t("invoices.tva", { rate: company.defaultTvaRate })}
              </dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(totals.tvaAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-base font-semibold text-slate-900">
                {t("invoices.totalTTC")}
              </dt>
              <dd className="text-base font-bold tabular-nums text-slate-900">
                {formatFCFA(totals.total)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card>
        <CardBody>
          <Textarea
            label={t("invoiceForm.notes")}
            placeholder={t("invoiceForm.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          href={mode === "edit" && invoiceId ? `/invoices/${invoiceId}` : "/invoices"}
        >
          {t("common.cancel")}
        </Button>

        {mode === "create" ? (
          <>
            <Button
              variant="outline"
              loading={submitting === "brouillon"}
              onClick={() => handleCreate("brouillon")}
            >
              {t("invoiceForm.saveDraft")}
            </Button>
            <Button
              loading={submitting === "envoyee"}
              onClick={() => handleCreate("envoyee")}
            >
              {t("invoiceForm.sendInvoice")}
            </Button>
          </>
        ) : existing?.status === "brouillon" ? (
          <>
            <Button
              variant="outline"
              loading={submitting === "save"}
              onClick={() => handleSave(false)}
            >
              {t("invoiceForm.save")}
            </Button>
            <Button loading={submitting === "save"} onClick={() => handleSave(true)}>
              {t("invoiceForm.saveAndSend")}
            </Button>
          </>
        ) : (
          <Button loading={submitting === "save"} onClick={() => handleSave(false)}>
            {t("invoiceForm.saveChanges")}
          </Button>
        )}
      </div>
    </div>
  );
}
