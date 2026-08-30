import type { InvoiceStatus } from "@/lib/data/types";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "brouillon",
  "envoyee",
  "payee",
  "en_retard",
];

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_retard: "En retard",
};

/** Libellé d'action pour faire passer une facture dans ce statut. */
export const STATUS_ACTION_LABEL: Record<InvoiceStatus, string> = {
  brouillon: "Repasser en brouillon",
  envoyee: "Marquer comme envoyée",
  payee: "Marquer comme payée",
  en_retard: "Marquer en retard",
};
