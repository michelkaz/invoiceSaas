import type { Invoice, InvoiceStatus } from "@/lib/data/types";
import { monthLabel } from "@/lib/format";

const sumTotals = (list: Invoice[]) => list.reduce((sum, i) => sum + i.total, 0);
const by = (invoices: Invoice[], status: InvoiceStatus) =>
  invoices.filter((i) => i.status === status);

/**
 * Les 4 indicateurs de tête du dashboard, orientés trésorerie.
 * Par construction : invoicedAmount = paidAmount + toReceiveAmount + overdueAmount
 * (les brouillons ne sont pas des créances : ils sont exclus du CA facturé et
 * suivis séparément, cf. `draftAmount`/`draftCount`).
 */
export interface Overview {
  totalCount: number;
  /** CA facturé : envoyée + payée + en retard (hors brouillon). */
  invoicedAmount: number;
  /** Encaissé : factures payées. */
  paidAmount: number;
  /** À encaisser : factures envoyées, pas encore payées ni en retard. */
  toReceiveAmount: number;
  toReceiveCount: number;
  /** En retard : envoyées dont l'échéance est dépassée. */
  overdueAmount: number;
  overdueCount: number;
  /** Brouillons : pas encore engagés auprès du client. */
  draftAmount: number;
  draftCount: number;
}

export function getOverview(invoices: Invoice[]): Overview {
  const paid = by(invoices, "payee");
  const sent = by(invoices, "envoyee");
  const late = by(invoices, "en_retard");
  const draft = by(invoices, "brouillon");
  return {
    totalCount: invoices.length,
    invoicedAmount: sumTotals(paid) + sumTotals(sent) + sumTotals(late),
    paidAmount: sumTotals(paid),
    toReceiveAmount: sumTotals(sent),
    toReceiveCount: sent.length,
    overdueAmount: sumTotals(late),
    overdueCount: late.length,
    draftAmount: sumTotals(draft),
    draftCount: draft.length,
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
  monthNames?: readonly string[],
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
    points.push({
      label: monthLabel(d.getMonth(), monthNames),
      value: aggregate(monthInvoices),
    });
  }
  return points;
}

/** Chiffre d'affaires facturé par mois (hors brouillons). */
export function getMonthlyRevenue(
  invoices: Invoice[],
  months = 8,
  reference = new Date(),
  monthNames?: readonly string[],
): MonthlyPoint[] {
  return getMonthlySeries(
    invoices,
    (list) => sumTotals(list.filter((i) => i.status !== "brouillon")),
    months,
    reference,
    monthNames,
  );
}

export interface RevenuePoint {
  label: string;
  invoiced: number;
  collected: number;
}

/** Facturé (hors brouillons) vs réellement encaissé, mois par mois. */
export function getMonthlyRevenueVsCollected(
  invoices: Invoice[],
  months = 8,
  reference = new Date(),
  monthNames?: readonly string[],
): RevenuePoint[] {
  const invoiced = getMonthlySeries(
    invoices,
    (list) => sumTotals(list.filter((i) => i.status !== "brouillon")),
    months,
    reference,
    monthNames,
  );
  const collected = getMonthlySeries(
    invoices,
    (list) => sumTotals(list.filter((i) => i.status === "payee")),
    months,
    reference,
    monthNames,
  );
  return invoiced.map((point, i) => ({
    label: point.label,
    invoiced: point.value,
    collected: collected[i].value,
  }));
}

/** Séries numériques prêtes à alimenter les mini-graphiques des cartes de stats. */
export function getStatSeries(invoices: Invoice[], months = 6, reference = new Date()) {
  const series = (aggregate: (list: Invoice[]) => number) =>
    getMonthlySeries(invoices, aggregate, months, reference).map((p) => p.value);

  return {
    invoiced: series((list) => sumTotals(list.filter((i) => i.status !== "brouillon"))),
    paid: series((list) => sumTotals(list.filter((i) => i.status === "payee"))),
    toReceive: series((list) => sumTotals(list.filter((i) => i.status === "envoyee"))),
    overdue: series((list) => sumTotals(list.filter((i) => i.status === "en_retard"))),
  };
}

export interface StatusSlice {
  status: InvoiceStatus;
  count: number;
  amount: number;
}

export function getStatusBreakdown(invoices: Invoice[]): StatusSlice[] {
  const order: InvoiceStatus[] = ["payee", "envoyee", "en_retard", "brouillon"];
  return order.map((status) => {
    const matching = invoices.filter((i) => i.status === status);
    return {
      status,
      count: matching.length,
      amount: matching.reduce((sum, i) => sum + i.total, 0),
    };
  });
}

/**
 * Évolution en % d'un agrégat entre le mois de `reference` et le mois
 * précédent. Renvoie `null` quand la comparaison n'a pas de sens (mois
 * précédent à 0 : une variation en % serait infinie ou trompeuse).
 */
export function getMonthOverMonthTrend(
  invoices: Invoice[],
  aggregate: (list: Invoice[]) => number,
  reference = new Date(),
): number | null {
  const monthInvoices = (offset: number) =>
    invoices.filter((inv) => {
      const issued = new Date(inv.issueDate);
      const d = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
      return (
        issued.getFullYear() === d.getFullYear() &&
        issued.getMonth() === d.getMonth()
      );
    });
  const current = aggregate(monthInvoices(0));
  const previous = aggregate(monthInvoices(1));
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface Trends {
  invoiced: number | null;
  paid: number | null;
}

export function getTrends(invoices: Invoice[], reference = new Date()): Trends {
  return {
    invoiced: getMonthOverMonthTrend(
      invoices,
      (list) => sumTotals(list.filter((i) => i.status !== "brouillon")),
      reference,
    ),
    paid: getMonthOverMonthTrend(
      invoices,
      (list) => sumTotals(list.filter((i) => i.status === "payee")),
      reference,
    ),
  };
}
