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
          title="Facture introuvable"
          description="Cette facture n'existe pas ou a été supprimée."
          action={<Button href="/invoices">Retour aux factures</Button>}
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
    if (!clientId) nextErrors.clientId = "Sélectionnez un client.";
    if (!issueDate) nextErrors.issueDate = "Date requise.";
    if (!dueDate) nextErrors.dueDate = "Date requise.";
    else if (issueDate && dueDate < issueDate)
      nextErrors.dueDate = "L'échéance doit être postérieure à l'émission.";

    const nextLineErrors: LineError[] = lines.map((l) => {
      const e: LineError = {};
      if (!l.description.trim()) e.description = "Description requise.";
      if (!(num(l.quantity) > 0)) e.quantity = "Qté > 0";
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
      toast({ variant: "error", title: "Formulaire incomplet", description: "Corrigez les champs signalés." });
      return;
    }
    setSubmitting(status === "brouillon" ? "brouillon" : "envoyee");
    const created = addInvoice(buildInput(), status);
    toast({
      variant: "success",
      title: status === "brouillon" ? "Brouillon enregistré" : "Facture envoyée",
      description: `${created.number} · ${formatFCFA(created.total)}`,
    });
    router.push(`/invoices/${created.id}`);
  };

  const handleSave = (alsoSend: boolean) => {
    if (!invoiceId || !validate()) {
      if (invoiceId)
        toast({ variant: "error", title: "Formulaire incomplet", description: "Corrigez les champs signalés." });
      return;
    }
    setSubmitting("save");
    updateInvoice(invoiceId, buildInput());
    if (alsoSend) setInvoiceStatus(invoiceId, "envoyee");
    toast({
      variant: "success",
      title: alsoSend ? "Facture envoyée" : "Modifications enregistrées",
    });
    router.push(`/invoices/${invoiceId}`);
  };

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const gridCols = "sm:grid-cols-[minmax(0,1fr)_88px_170px_120px_40px]";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Informations"
          description={`Facture n° ${number}`}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Client"
            required
            placeholder="Sélectionner un client"
            options={clientOptions}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            error={errors.clientId}
            hint={
              clients.length === 0 ? (
                <>
                  Aucun client.{" "}
                  <Link href="/clients" className="font-medium text-brand-600">
                    Ajouter un client
                  </Link>
                </>
              ) : undefined
            }
            containerClassName="sm:col-span-2"
          />
          <Input
            type="date"
            label="Date d'émission"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            error={errors.issueDate}
          />
          <Input
            type="date"
            label="Date d'échéance"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Lignes de la facture"
          action={
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          }
        />
        <CardBody className="space-y-3">
          <div
            className={`hidden gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:grid ${gridCols}`}
          >
            <span>Description</span>
            <span>Qté</span>
            <span>Prix unitaire</span>
            <span className="text-right">Total</span>
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
                    Description
                  </span>
                  <Input
                    value={line.description}
                    placeholder="Prestation, produit…"
                    onChange={(e) =>
                      updateLine(line.key, { description: e.target.value })
                    }
                    error={le.description}
                  />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                    Quantité
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
                    Prix unitaire
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
                    Total
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
                    aria-label="Supprimer la ligne"
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
              <dt className="text-slate-500">Sous-total</dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                TVA ({company.defaultTvaRate} %)
              </dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {formatFCFA(totals.tvaAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-base font-semibold text-slate-900">
                Total TTC
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
            label="Notes (optionnel)"
            placeholder="Conditions de paiement, mention légale…"
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
          Annuler
        </Button>

        {mode === "create" ? (
          <>
            <Button
              variant="outline"
              loading={submitting === "brouillon"}
              onClick={() => handleCreate("brouillon")}
            >
              Sauvegarder comme brouillon
            </Button>
            <Button
              loading={submitting === "envoyee"}
              onClick={() => handleCreate("envoyee")}
            >
              Envoyer la facture
            </Button>
          </>
        ) : existing?.status === "brouillon" ? (
          <>
            <Button
              variant="outline"
              loading={submitting === "save"}
              onClick={() => handleSave(false)}
            >
              Enregistrer
            </Button>
            <Button loading={submitting === "save"} onClick={() => handleSave(true)}>
              Enregistrer et envoyer
            </Button>
          </>
        ) : (
          <Button loading={submitting === "save"} onClick={() => handleSave(false)}>
            Enregistrer les modifications
          </Button>
        )}
      </div>
    </div>
  );
}
