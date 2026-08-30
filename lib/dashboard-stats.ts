import type { Invoice, InvoiceStatus } from "@/lib/data/types";
import { monthLabel } from "@/lib/format";

/** Les 4 indicateurs affichés en tête du dashboard. */
export interface Overview {
  totalCount: number;
  invoicedAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

const UNPAID: InvoiceStatus[] = ["envoyee", "en_retard"];

export function getOverview(invoices: Invoice[]): Overview {
  const issued = invoices.filter((i) => i.status !== "brouillon");
  return {
    totalCount: invoices.length,
    invoicedAmount: issued.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices
      .filter((i) => i.status === "payee")
      .reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices
      .filter((i) => UNPAID.includes(i.status))
      .reduce((sum, i) => sum + i.total, 0),
  };
}

export interface MonthlyPoint {
  label: string;
  value: number;
}

/** Regroupe les factures par mois (N mois glissants) et applique un agrégat. */
export function getMonthlySeries(
  invoices: Invoice[],
  aggregate: (monthInvoices: Invoice[]) => number,
  months = 8,
  reference = new Date(),
): MonthlyPoint[] {
  const points: MonthlyPoint[] = [];
  for (let offset = months - 1; offset >= 0; offset--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
    const monthInvoices = invoices.filter((inv) => {
      const issued = new Date(inv.issueDate);
      return (
        issued.getFullYear() === d.getFullYear() &&
        issued.getMonth() === d.getMonth()
      );
    });
    points.push({ label: monthLabel(d.getMonth()), value: aggregate(monthInvoices) });
  }
  return points;
}

const sumTotals = (list: Invoice[]) => list.reduce((sum, i) => sum + i.total, 0);

/** Chiffre d'affaires facturé par mois (hors brouillons). */
export function getMonthlyRevenue(
  invoices: Invoice[],
  months = 8,
  reference = new Date(),
): MonthlyPoint[] {
  return getMonthlySeries(
    invoices,
    (list) => sumTotals(list.filter((i) => i.status !== "brouillon")),
    months,
    reference,
  );
}

/** Séries numériques prêtes à alimenter les mini-graphiques des cartes de stats. */
export function getStatSeries(invoices: Invoice[], months = 6, reference = new Date()) {
  const series = (aggregate: (list: Invoice[]) => number) =>
    getMonthlySeries(invoices, aggregate, months, reference).map((p) => p.value);

  return {
    count: series((list) => list.length),
    invoiced: series((list) => sumTotals(list.filter((i) => i.status !== "brouillon"))),
    paid: series((list) => sumTotals(list.filter((i) => i.status === "payee"))),
    pending: series((list) => sumTotals(list.filter((i) => UNPAID.includes(i.status)))),
  };
}

export interface StatusSlice {
  status: InvoiceStatus;
  label: string;
  count: number;
  amount: number;
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  payee: "Payées",
  envoyee: "Envoyées",
  brouillon: "Brouillons",
  en_retard: "En retard",
};

export function getStatusBreakdown(invoices: Invoice[]): StatusSlice[] {
  const order: InvoiceStatus[] = ["payee", "envoyee", "en_retard", "brouillon"];
  return order.map((status) => {
    const matching = invoices.filter((i) => i.status === status);
    return {
      status,
      label: STATUS_LABELS[status],
      count: matching.length,
      amount: matching.reduce((sum, i) => sum + i.total, 0),
    };
  });
}
