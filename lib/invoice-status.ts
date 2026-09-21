import {
  FileEdit,
  Send,
  CheckCircle2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { InvoiceStatus } from "@/lib/data/types";
import { todayISO } from "@/lib/format";

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

/** Icône associée à chaque statut — partagée entre liste, détail et menus. */
export const STATUS_ICON: Record<InvoiceStatus, LucideIcon> = {
  brouillon: FileEdit,
  envoyee: Send,
  payee: CheckCircle2,
  en_retard: Clock,
};

/**
 * Étape suivante « évidente » du cycle de vie d'une facture, utilisée pour
 * afficher une action principale unique (les autres statuts restent
 * accessibles via le menu « Changer le statut »).
 * brouillon → envoyée → payée. Une facture en retard se solde par un paiement.
 */
export const PRIMARY_NEXT_STATUS: Partial<
  Record<InvoiceStatus, InvoiceStatus>
> = {
  brouillon: "envoyee",
  envoyee: "payee",
  en_retard: "payee",
};

/**
 * Facture objectivement en retard : déjà marquée `en_retard`, ou encore
 * `envoyee` mais dont l'échéance est silencieusement dépassée (la transition
 * de statut reste manuelle, cf. décision produit — pas de cron Supabase pour
 * l'instant, mais l'UI peut déjà le signaler sans attendre ce changement).
 */
export function isPastDue(
  status: InvoiceStatus,
  dueDate: string,
  reference: string = todayISO(),
): boolean {
  return status === "en_retard" || (status === "envoyee" && dueDate < reference);
}

/** Nombre de jours écoulés depuis l'échéance (0 si pas encore dépassée). */
export function daysOverdue(
  dueDate: string,
  reference: string = todayISO(),
): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const ref = new Date(`${reference}T00:00:00`);
  const diff = Math.round((ref.getTime() - due.getTime()) / 86_400_000);
  return Math.max(diff, 0);
}
