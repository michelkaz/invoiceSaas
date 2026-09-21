"use client";

import { AlertTriangle } from "lucide-react";
import { useT } from "@/components/providers/i18n-provider";
import { daysOverdue, isPastDue } from "@/lib/invoice-status";
import type { InvoiceStatus } from "@/lib/data/types";

/** "⚠ En retard de N jours" — n'affiche rien si la facture n'est pas en retard. */
export function OverdueTag({
  status,
  dueDate,
  reference,
}: {
  status: InvoiceStatus;
  dueDate: string;
  reference?: string;
}) {
  const t = useT();
  if (!isPastDue(status, dueDate, reference)) return null;
  const days = daysOverdue(dueDate, reference);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertTriangle className="h-3.5 w-3.5" />
      {t(days > 1 ? "invoices.overdueSinceMany" : "invoices.overdueSinceOne", { days })}
    </span>
  );
}
