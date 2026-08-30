/** Formes des lignes Supabase (snake_case). Converties en types domaine
 *  via lib/data/serialize.ts. */

import type { InvoiceStatus } from "@/lib/data/types";

export interface CompanyRow {
  id: string;
  owner_id: string;
  name: string;
  legal_name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rccm: string;
  nif: string;
  id_nat: string;
  currency: "XOF" | "XAF" | "CDF";
  default_tva_rate: number;
  invoice_prefix: string;
  payment_terms_days: number;
  bank_details: string | null;
  onboarding_completed: boolean;
  tutorial_seen: boolean;
}

export interface ClientRow {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface InvoiceItemRow {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
}

export interface InvoiceRow {
  id: string;
  owner_id: string;
  number: string;
  client_id: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  currency: "XOF" | "XAF" | "CDF";
  tva_rate: number;
  subtotal: number;
  tva_amount: number;
  total: number;
  notes: string | null;
  invoice_items?: InvoiceItemRow[];
}
