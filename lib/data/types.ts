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
  currency: "XOF" | "XAF" | "CDF";
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
  /** Registre du Commerce et du Crédit Mobilier (RDC). */
  rccm: string;
  /** Numéro d'Identification Fiscale (RDC). */
  nif: string;
  /** Identifiant National (ID NAT, RDC). */
  idNat: string;
  currency: "XOF" | "XAF" | "CDF";
  defaultTvaRate: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  bankDetails?: string;
  /** URL publique du logo (Supabase Storage, bucket « assets »). */
  logoUrl?: string;
}

/** Facture enrichie de son client — pratique pour les listes. */
export interface InvoiceWithClient extends Invoice {
  client?: Client;
}
