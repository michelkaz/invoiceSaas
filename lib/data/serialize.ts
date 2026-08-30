/** Conversions ligne Supabase (snake_case) ⇄ type domaine (camelCase). */

import type { Client, Company, Invoice, InvoiceItem } from "@/lib/data/types";
import type {
  ClientRow,
  CompanyRow,
  InvoiceItemRow,
  InvoiceRow,
} from "@/lib/data/db-types";

// ── Lecture : ligne → domaine ────────────────────────────────────────────────

export function rowToClient(r: ClientRow): Client {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    createdAt: r.created_at.slice(0, 10),
  };
}

export function rowToCompany(r: CompanyRow): Company {
  return {
    name: r.name,
    legalName: r.legal_name,
    address: r.address,
    city: r.city,
    country: r.country,
    phone: r.phone,
    email: r.email,
    rccm: r.rccm,
    nif: r.nif,
    idNat: r.id_nat,
    currency: r.currency,
    defaultTvaRate: Number(r.default_tva_rate),
    invoicePrefix: r.invoice_prefix,
    paymentTermsDays: r.payment_terms_days,
    bankDetails: r.bank_details ?? undefined,
    logoUrl: r.logo_url ?? undefined,
  };
}

function rowToItem(r: InvoiceItemRow): InvoiceItem {
  return {
    id: r.id,
    description: r.description,
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
  };
}

export function rowToInvoice(r: InvoiceRow): Invoice {
  const items = [...(r.invoice_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(rowToItem);
  return {
    id: r.id,
    number: r.number,
    clientId: r.client_id,
    status: r.status,
    issueDate: r.issue_date.slice(0, 10),
    dueDate: r.due_date.slice(0, 10),
    currency: r.currency,
    tvaRate: Number(r.tva_rate),
    items,
    subtotal: Number(r.subtotal),
    tvaAmount: Number(r.tva_amount),
    total: Number(r.total),
    notes: r.notes ?? undefined,
  };
}

// ── Écriture : domaine → payload SQL ─────────────────────────────────────────

/** Colonnes d'un client pour insert / update (owner_id ajouté par la RLS/appel). */
export function clientToRow(
  data: Omit<Client, "id" | "createdAt">,
): Pick<ClientRow, "name" | "email" | "phone" | "address"> {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
  };
}

export function companyToRow(
  c: Company,
): Omit<
  CompanyRow,
  "id" | "owner_id" | "currency" | "onboarding_completed" | "tutorial_seen"
> & { currency: string } {
  return {
    name: c.name,
    legal_name: c.legalName,
    address: c.address,
    city: c.city,
    country: c.country,
    phone: c.phone,
    email: c.email,
    rccm: c.rccm,
    nif: c.nif,
    id_nat: c.idNat,
    currency: c.currency,
    default_tva_rate: c.defaultTvaRate,
    invoice_prefix: c.invoicePrefix,
    payment_terms_days: c.paymentTermsDays,
    bank_details: c.bankDetails ?? null,
    logo_url: c.logoUrl ?? null,
  };
}

/** Colonnes d'une facture pour un insert direct (seed / réinitialisation). */
export function invoiceToRow(inv: Invoice, ownerId: string) {
  return {
    id: inv.id,
    owner_id: ownerId,
    number: inv.number,
    client_id: inv.clientId,
    status: inv.status,
    issue_date: inv.issueDate,
    due_date: inv.dueDate,
    currency: inv.currency,
    tva_rate: inv.tvaRate,
    subtotal: inv.subtotal,
    tva_amount: inv.tvaAmount,
    total: inv.total,
    notes: inv.notes ?? null,
  };
}

/** Lignes d'une facture pour un insert direct (seed / réinitialisation). */
export function invoiceItemsToRows(inv: Invoice) {
  return inv.items.map((it, i) => ({
    id: it.id,
    invoice_id: inv.id,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unitPrice,
    position: i,
  }));
}

/** Arguments des RPC create_invoice / update_invoice (paramètres p_invoice, p_items). */
export function invoiceToPayload(inv: Invoice) {
  return {
    p_invoice: {
      id: inv.id,
      number: inv.number,
      clientId: inv.clientId,
      status: inv.status,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      currency: inv.currency,
      tvaRate: inv.tvaRate,
      subtotal: inv.subtotal,
      tvaAmount: inv.tvaAmount,
      total: inv.total,
      notes: inv.notes ?? "",
    },
    p_items: inv.items.map((it) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  };
}
