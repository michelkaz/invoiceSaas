import { computeInvoiceTotals } from "@/lib/invoice-calc";
import type {
  Client,
  Company,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceWithClient,
} from "@/lib/data/types";

/**
 * Jeu de démonstration — entreprise fictive basée à Kinshasa (RDC).
 * Montants en francs congolais (CDF). Aucune donnée réelle.
 */

export const company: Company = {
  name: "Kinshasa Créative",
  legalName: "Kinshasa Créative SARL",
  address: "12, avenue du Commerce, Gombe",
  city: "Kinshasa",
  country: "RD Congo",
  phone: "+243 81 234 56 78",
  email: "contact@kinshasa-creative.cd",
  rccm: "CD/KIN/RCCM/22-B-01234",
  nif: "A2201234X",
  idNat: "01-F4300-N01234X",
  currency: "CDF",
  defaultTvaRate: 16,
  invoicePrefix: "FAC",
  paymentTermsDays: 30,
  bankDetails: "Rawbank — Compte 00012-34567890-12 (CDF) — Titulaire : Kinshasa Créative SARL",
};

export const currentUser = {
  firstName: "Michel",
  lastName: "Kazadi",
  email: "michel@kinshasa-creative.cd",
  role: "Fondateur",
};

export const clients: Client[] = [
  {
    id: "cli_01",
    name: "Kivu Consulting",
    email: "compta@kivuconsulting.cd",
    phone: "+243 99 100 20 30",
    address: "Boulevard Kanyamuhanga, Goma, RD Congo",
    createdAt: "2025-10-14",
  },
  {
    id: "cli_02",
    name: "Congo Digital",
    email: "finance@congodigital.cd",
    phone: "+243 81 555 11 22",
    address: "Avenue de la Justice, Gombe, Kinshasa, RD Congo",
    createdAt: "2025-11-22",
  },
  {
    id: "cli_03",
    name: "Kinshasa Services SARL",
    email: "achats@kinshasa-services.cd",
    phone: "+243 82 300 44 55",
    address: "Route de Matadi, Limete, Kinshasa, RD Congo",
    createdAt: "2025-12-09",
  },
  {
    id: "cli_04",
    name: "Lumumba Consulting",
    email: "hello@lumumbaconsulting.cd",
    phone: "+243 89 777 66 55",
    address: "Avenue des Cliniques, Ngaliema, Kinshasa, RD Congo",
    createdAt: "2026-01-18",
  },
  {
    id: "cli_05",
    name: "Congo Business Solutions",
    email: "devis@congobusiness.cd",
    phone: "+243 97 200 33 44",
    address: "Avenue Lumumba, Lubumbashi, RD Congo",
    createdAt: "2026-02-11",
  },
  {
    id: "cli_06",
    name: "Kasaï Technologies",
    email: "contact@kasai-tech.cd",
    phone: "+243 84 611 22 77",
    address: "Avenue Kasa-Vubu, Kintambo, Kinshasa, RD Congo",
    createdAt: "2026-03-05",
  },
  {
    id: "cli_07",
    name: "Goma Logistics",
    email: "operations@gomalogistics.cd",
    phone: "+243 99 850 40 10",
    address: "Rond-point Signers, Goma, RD Congo",
    createdAt: "2026-04-02",
  },
  {
    id: "cli_08",
    name: "Nzambe Services",
    email: "bureau@nzambeservices.cd",
    phone: "+243 85 404 90 12",
    address: "Avenue du Port, Matadi, RD Congo",
    createdAt: "2026-05-19",
  },
];

interface InvoiceSeed {
  id: string;
  number: string;
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: Array<Omit<InvoiceItem, "id">>;
  notes?: string;
}

const invoiceSeeds: InvoiceSeed[] = [
  {
    id: "inv_01",
    number: "FAC-2026-0014",
    clientId: "cli_08",
    status: "brouillon",
    issueDate: "2026-08-24",
    dueDate: "2026-09-23",
    items: [
      { description: "Identité visuelle — logo et charte graphique", quantity: 1, unitPrice: 1_800_000 },
      { description: "Déclinaisons réseaux sociaux", quantity: 6, unitPrice: 95_000 },
    ],
  },
  {
    id: "inv_02",
    number: "FAC-2026-0013",
    clientId: "cli_06",
    status: "envoyee",
    issueDate: "2026-08-12",
    dueDate: "2026-09-11",
    items: [
      { description: "Refonte du site vitrine (6 pages)", quantity: 1, unitPrice: 3_200_000 },
      { description: "Séance photo produits", quantity: 1, unitPrice: 480_000 },
      { description: "Hébergement et nom de domaine (1 an)", quantity: 1, unitPrice: 260_000 },
    ],
  },
  {
    id: "inv_03",
    number: "FAC-2026-0012",
    clientId: "cli_02",
    status: "payee",
    issueDate: "2026-08-03",
    dueDate: "2026-09-02",
    items: [
      { description: "Campagne d'affichage — conception", quantity: 1, unitPrice: 1_150_000 },
      { description: "Impression bâches 3x2 m", quantity: 8, unitPrice: 130_000 },
    ],
  },
  {
    id: "inv_04",
    number: "FAC-2026-0011",
    clientId: "cli_01",
    status: "payee",
    issueDate: "2026-07-19",
    dueDate: "2026-08-18",
    items: [
      { description: "Catalogue produits 24 pages", quantity: 1, unitPrice: 2_100_000 },
      { description: "Retouches photo", quantity: 30, unitPrice: 18_000 },
    ],
  },
  {
    id: "inv_05",
    number: "FAC-2026-0010",
    clientId: "cli_05",
    status: "en_retard",
    issueDate: "2026-06-28",
    dueDate: "2026-07-28",
    items: [
      { description: "Habillage de flotte (4 véhicules)", quantity: 4, unitPrice: 720_000 },
      { description: "Pose sur site", quantity: 1, unitPrice: 350_000 },
    ],
  },
  {
    id: "inv_06",
    number: "FAC-2026-0009",
    clientId: "cli_03",
    status: "en_retard",
    issueDate: "2026-06-15",
    dueDate: "2026-07-15",
    items: [
      { description: "Enseigne lumineuse", quantity: 1, unitPrice: 1_550_000 },
      { description: "Cartes de visite (1000 ex.)", quantity: 1, unitPrice: 165_000 },
    ],
  },
  {
    id: "inv_07",
    number: "FAC-2026-0008",
    clientId: "cli_04",
    status: "payee",
    issueDate: "2026-06-04",
    dueDate: "2026-07-04",
    items: [
      { description: "Motion design — vidéo 45 s", quantity: 1, unitPrice: 2_650_000 },
    ],
  },
  {
    id: "inv_08",
    number: "FAC-2026-0007",
    clientId: "cli_07",
    status: "envoyee",
    issueDate: "2026-05-22",
    dueDate: "2026-06-21",
    items: [
      { description: "Accompagnement branding (forfait mensuel)", quantity: 2, unitPrice: 850_000 },
    ],
  },
  {
    id: "inv_09",
    number: "FAC-2026-0006",
    clientId: "cli_02",
    status: "payee",
    issueDate: "2026-05-08",
    dueDate: "2026-06-07",
    items: [
      { description: "Packaging gamme jus (3 références)", quantity: 3, unitPrice: 590_000 },
      { description: "Bon à tirer et suivi imprimeur", quantity: 1, unitPrice: 240_000 },
    ],
  },
  {
    id: "inv_10",
    number: "FAC-2026-0005",
    clientId: "cli_01",
    status: "payee",
    issueDate: "2026-04-17",
    dueDate: "2026-05-17",
    items: [
      { description: "Stand salon 6x3 m — conception", quantity: 1, unitPrice: 1_900_000 },
      { description: "Kakémonos", quantity: 4, unitPrice: 110_000 },
    ],
  },
  {
    id: "inv_11",
    number: "FAC-2026-0004",
    clientId: "cli_06",
    status: "payee",
    issueDate: "2026-03-28",
    dueDate: "2026-04-27",
    items: [
      { description: "Landing page campagne", quantity: 1, unitPrice: 1_350_000 },
      { description: "Intégration emailing", quantity: 1, unitPrice: 420_000 },
    ],
  },
  {
    id: "inv_12",
    number: "FAC-2026-0003",
    clientId: "cli_03",
    status: "payee",
    issueDate: "2026-02-20",
    dueDate: "2026-03-22",
    items: [
      { description: "Menu restaurant — design et impression", quantity: 1, unitPrice: 890_000 },
    ],
  },
  {
    id: "inv_13",
    number: "FAC-2026-0002",
    clientId: "cli_05",
    status: "payee",
    issueDate: "2026-01-30",
    dueDate: "2026-03-01",
    items: [
      { description: "Charte documentaire (modèles Word/PPT)", quantity: 1, unitPrice: 1_080_000 },
    ],
  },
  {
    id: "inv_14",
    number: "FAC-2026-0001",
    clientId: "cli_04",
    status: "payee",
    issueDate: "2026-01-12",
    dueDate: "2026-02-11",
    items: [
      { description: "Direction artistique — shooting mode", quantity: 1, unitPrice: 2_000_000 },
      { description: "Location studio (2 jours)", quantity: 2, unitPrice: 360_000 },
    ],
  },
];

export const invoices: Invoice[] = invoiceSeeds.map((seed) => {
  const items: InvoiceItem[] = seed.items.map((item, index) => ({
    ...item,
    id: `${seed.id}_it_${index + 1}`,
  }));
  const totals = computeInvoiceTotals(items, company.defaultTvaRate);
  return {
    id: seed.id,
    number: seed.number,
    clientId: seed.clientId,
    status: seed.status,
    issueDate: seed.issueDate,
    dueDate: seed.dueDate,
    currency: company.currency,
    tvaRate: company.defaultTvaRate,
    items,
    notes: seed.notes,
    ...totals,
  };
});

const clientsById = new Map(clients.map((c) => [c.id, c]));

export function getInvoicesWithClient(): InvoiceWithClient[] {
  return invoices
    .map((invoice) => ({
      ...invoice,
      client: clientsById.get(invoice.clientId),
    }))
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}
