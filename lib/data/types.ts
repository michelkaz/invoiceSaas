/** Types partagés du domaine. Alignés sur le futur schéma Supabase. */

export type InvoiceStatus = "brouillon" | "envoyee" | "payee" | "en_retard";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: "XOF" | "XAF";
  tvaRate: number;
  items: InvoiceItem[];
  /** Montants figés (calculés depuis les lignes). */
  subtotal: number;
  tvaAmount: number;
  total: number;
  notes?: string;
}

export interface Company {
  name: string;
  legalName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  currency: "XOF" | "XAF";
  defaultTvaRate: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  bankDetails?: string;
}

/** Facture enrichie de son client — pratique pour les listes. */
export interface InvoiceWithClient extends Invoice {
  client?: Client;
}
