"use client";

import type { InvoiceStatus } from "@/lib/data/types";
import { useT } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const CONFIG: Record<InvoiceStatus, { dot: string; badge: string }> = {
  payee: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  envoyee: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  brouillon: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
  en_retard: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useT();
  const { dot, badge } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {t(`status.${status}`)}
    </span>
  );
}

/** Alias : nom explicite du badge de statut de facture. */
export const InvoiceStatusBadge = StatusBadge;
