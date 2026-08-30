import type { InvoiceStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  InvoiceStatus,
  { label: string; dot: string; badge: string }
> = {
  payee: {
    label: "Payée",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  envoyee: {
    label: "Envoyée",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  brouillon: {
    label: "Brouillon",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
  en_retard: {
    label: "En retard",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, dot, badge } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

/** Alias : nom explicite du badge de statut de facture. */
export const InvoiceStatusBadge = StatusBadge;
