import type { InvoiceItem } from "@/lib/data/types";

/**
 * Calculs de facturation — fonctions pures, testables.
 *
 * Règle d'arrondi : arrondi au franc PAR LIGNE, puis somme. Évite les
 * écarts d'un FCFA entre l'affichage des lignes et le total.
 */

export function lineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function subtotal(items: Pick<InvoiceItem, "quantity" | "unitPrice">[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item.quantity, item.unitPrice), 0);
}

export function tvaAmount(base: number, rate = 18): number {
  return Math.round((base * rate) / 100);
}

export interface InvoiceTotals {
  subtotal: number;
  tvaAmount: number;
  total: number;
}

export function computeInvoiceTotals(
  items: Pick<InvoiceItem, "quantity" | "unitPrice">[],
  rate = 18,
): InvoiceTotals {
  const sub = subtotal(items);
  const tva = tvaAmount(sub, rate);
  return { subtotal: sub, tvaAmount: tva, total: sub + tva };
}
