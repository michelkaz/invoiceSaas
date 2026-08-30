import type { InvoiceStatus } from "@/lib/data/types";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "brouillon",
  "envoyee",
  "payee",
  "en_retard",
];

/** Clé i18n du libellé d'un statut : `t(statusLabelKey(s))`. */
export function statusLabelKey(status: InvoiceStatus): string {
  return `status.${status}`;
}

/** Clé i18n du libellé d'action « passer au statut X » : `t(statusActionKey(s))`. */
export function statusActionKey(status: InvoiceStatus): string {
  const cap = status.charAt(0).toUpperCase() + status.slice(1);
  return `status.action${cap}`;
}
